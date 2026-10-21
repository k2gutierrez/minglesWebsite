import "server-only";
import {
  createPublicClient,
  getAddress,
  http,
  isAddress,
  isHex,
  verifyMessage,
  zeroAddress,
} from "viem";
import {
  adminDb,
  ApiError,
  body,
  configuration,
  endpoint,
  json,
} from "@/lib/server/http";
import { raffleChain, raffleRpcUrl } from "@/lib/web3/chains";
import {
  RAFFLE_ABI,
  RAFFLE_ADDRESS,
  RAFFLE_ID,
  raffleConfigured,
} from "@/lib/web3/raffle";
import { raffleEntryMessage } from "@/lib/web3/raffle-message";

export const runtime = "nodejs";

/**
 * Guarda el contacto de un número ANTES de comprarlo. El usuario firma el
 * mensaje canónico con su wallet; aquí se verifica la firma y se comprueba en
 * cadena que el número siga libre. La escritura usa la service_role, nunca el
 * navegador.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function throttle(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW)
    throw new ApiError(429, "Too many attempts. Wait a minute and try again.");
  recent.push(now);
  hits.set(key, recent);
}

function text(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== "string")
    throw new ApiError(400, `Enter a valid ${field}.`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max)
    throw new ApiError(400, `Enter a valid ${field}.`);
  return trimmed;
}

function rpcUrl() {
  return raffleChain.id === 33111
    ? process.env.CURTIS_RPC_URL ||
        raffleChain.rpcUrls.default.http[0]
    : process.env.APECHAIN_RPC_URL ||
        raffleChain.rpcUrls.default.http[0];
}

function rpcClient() {
  return createPublicClient({
    chain: raffleChain,
    transport: http(rpcUrl(), { timeout: 10_000, retryCount: 1 }),
  });
}

async function chainState(
  client: ReturnType<typeof rpcClient>,
) {
  if (!raffleConfigured) return { configured: false as const };
  try {
    const [counter, sellOut, ended, cancelled] = await Promise.all([
      client.readContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "getCounter",
      }),
      client.readContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "getIsSellOut",
      }),
      client.readContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "getRaffleEnd",
      }),
      client.readContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "getIsCancelled",
      }),
    ]);
    return {
      configured: true as const,
      client,
      counter: Number(counter),
      sellOut,
      ended,
      cancelled,
    };
  } catch {
    throw new ApiError(
      503,
      "The raffle contract could not be read right now. Try again in a moment.",
    );
  }
}

export const POST = endpoint(async (request) => {
  const app = configuration();
  if (request.headers.get("origin") !== app.origin)
    throw new ApiError(403, "This request must come from the raffle page.");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  throttle(ip);

  const input = await body(request);
  const number = Number(input.number);
  if (!Number.isInteger(number) || number < 1 || number > 25)
    throw new ApiError(400, "Choose a number between 1 and 25.");

  const name = text(input.name, "name", 2, 80);
  const email = text(input.email, "email", 5, 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    throw new ApiError(400, "Enter a valid email address.");
  const phone = text(input.phone, "phone", 7, 32);
  if (!/^[+()\-\s\d.]{7,32}$/.test(phone))
    throw new ApiError(400, "Enter a valid phone number.");
  const note =
    typeof input.note === "string" && input.note.trim()
      ? text(input.note, "note", 1, 280)
      : undefined;

  if (typeof input.address !== "string" || !isAddress(input.address))
    throw new ApiError(400, "Connect a valid EVM wallet.");
  const address = getAddress(input.address);

  if (
    typeof input.signature !== "string" ||
    !isHex(input.signature) ||
    input.signature.length > 132
  )
    throw new ApiError(400, "Sign the entry message with your wallet.");

  const message = raffleEntryMessage({
    number,
    address,
    name,
    email,
    phone,
    note,
  });
  const client = rpcClient();
  let valid = false;
  // Firma de una EOA: se comprueba sin red.
  try {
    valid = await verifyMessage({
      address,
      message,
      signature: input.signature as `0x${string}`,
    });
  } catch {
    valid = false;
  }
  // Wallets inteligentes (ERC-1271): la comprobación vive en la cadena.
  if (!valid) {
    try {
      valid = await client.verifyMessage({
        address,
        message,
        signature: input.signature as `0x${string}`,
      });
    } catch {
      valid = false;
    }
  }
  if (!valid)
    throw new ApiError(401, "The signature does not match this wallet.");

  const state = await chainState(client);
  if (state.configured) {
    if (state.cancelled)
      throw new ApiError(409, "This raffle was cancelled.");
    if (state.ended) throw new ApiError(409, "This raffle already ended.");
    if (state.sellOut) throw new ApiError(409, "This raffle is sold out.");

    let owner: `0x${string}`;
    try {
      owner = await state.client.readContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "getUserAddressByNumber",
        args: [number],
      });
    } catch {
      throw new ApiError(503, "The raffle contract could not be read.");
    }
    if (owner !== zeroAddress && getAddress(owner) !== address)
      throw new ApiError(
        409,
        `Number ${number} is already taken by another wallet.`,
      );
  }

  const db = adminDb();
  const existing = await db
    .from("raffle_entries")
    .select("wallet")
    .eq("raffle", RAFFLE_ID)
    .eq("number", number)
    .maybeSingle();
  if (existing.error)
    throw new ApiError(
      503,
      "The raffle entries table is not ready. Ask the administrator to apply the migration.",
    );
  if (
    existing.data &&
    existing.data.wallet.toLowerCase() !== address.toLowerCase()
  )
    throw new ApiError(
      409,
      `Number ${number} was already reserved by another wallet.`,
    );

  const { error } = await db.from("raffle_entries").upsert(
    {
      raffle: RAFFLE_ID,
      number,
      wallet: address.toLowerCase(),
      name,
      email,
      phone,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "raffle,number" },
  );
  if (error)
    throw new ApiError(
      503,
      "Your details could not be saved. Try again in a moment.",
    );

  return json({ ok: true, number, wallet: address });
});
