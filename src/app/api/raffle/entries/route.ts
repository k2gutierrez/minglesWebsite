import "server-only";
import {
  createPublicClient,
  fallback,
  getAddress,
  http,
  isAddress,
  isHex,
  verifyMessage,
  zeroAddress,
  type Address,
} from "viem";
import {
  adminDb,
  ApiError,
  body,
  configuration,
  endpoint,
  json,
} from "@/lib/server/http";
import { raffleChain } from "@/lib/web3/chains";
import {
  RAFFLE_ABI_COMMON,
  RAFFLE_ADDRESS,
  RAFFLE_ID,
  raffleConfigured,
} from "@/lib/web3/raffle";
import {
  raffleEntryMessage,
  raffleOwnerEntriesMessage,
  raffleWithdrawalMessage,
} from "@/lib/web3/raffle-message";

export const runtime = "nodejs";

/**
 * Guarda el contacto de un número DESPUÉS de comprarlo y lo borra cuando el
 * usuario se retira. El usuario firma un mensaje canónico con su wallet; aquí
 * se verifica la firma y se comprueba en cadena que el número ya sea suyo. No
 * hay reserva previa de 30 minutos: la cadena es la fuente de verdad. La
 * escritura usa la service_role.
 *
 * Cada fila lleva `chain_id`: las entradas de Curtis (33111), Ethereum mainnet
 * (1), Sepolia (11155111) y ApeChain (33139) nunca se mezclan.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
// Firma del owner para leer la lista de compradores: válida 5 minutos.
const OWNER_SIGNATURE_WINDOW_MS = 5 * 60 * 1000;
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

function rpcUrls() {
  const configured =
    raffleChain.id === 33111
      ? process.env.CURTIS_RPC_URL
      : raffleChain.id === 1
        ? (process.env.ETHEREUM_RPC_URL ?? process.env.MAINNET_RPC_URL)
        : raffleChain.id === 11155111
          ? process.env.SEPOLIA_RPC_URL
          : raffleChain.id === 33139
            ? process.env.APECHAIN_RPC_URL
            : process.env.RAFFLE_RPC_URL;
  return Array.from(
    new Set(
      [configured, ...raffleChain.rpcUrls.default.http].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  );
}

function rpcClient() {
  // Si el RPC configurado está sin cuota o caído, se usa el público.
  return createPublicClient({
    chain: raffleChain,
    transport: fallback(
      rpcUrls().map((url) => http(url, { timeout: 10_000, retryCount: 1 })),
    ),
  });
}

type Client = ReturnType<typeof rpcClient>;

async function numberOwner(client: Client, number: number) {
  try {
    return (await client.readContract({
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getUserAddressByNumber",
      args: [number],
    })) as Address;
  } catch {
    throw new ApiError(503, "The raffle contract could not be read.");
  }
}

async function validSignature(
  client: Client,
  address: Address,
  message: string,
  signature: `0x${string}`,
) {
  // Firma de una EOA: se comprueba sin red.
  try {
    if (await verifyMessage({ address, message, signature })) return true;
  } catch {
    // Se intenta como smart wallet (ERC-1271) abajo.
  }
  // Wallets inteligentes (ERC-1271): la comprobación vive en la cadena.
  try {
    return await client.verifyMessage({ address, message, signature });
  } catch {
    return false;
  }
}

function walletFromInput(value: unknown) {
  if (typeof value !== "string" || !isAddress(value))
    throw new ApiError(400, "Connect a valid EVM wallet.");
  return getAddress(value);
}

function signatureFromInput(value: unknown) {
  // 65 bytes para una EOA; las smart wallets (ERC-1271) pueden firmar con más
  // bytes (varios owners de un Safe, por ejemplo).
  if (typeof value !== "string" || !isHex(value) || value.length > 4096)
    throw new ApiError(400, "Sign the entry message with your wallet.");
  return value as `0x${string}`;
}

function numberFromInput(value: unknown) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 25)
    throw new ApiError(400, "Choose a number between 1 and 25.");
  return number;
}

/**
 * Lista de compradores para la consola del owner.
 *
 * No es pública: la wallet conectada firma un mensaje con la red, el contrato
 * y un timestamp; además, esa misma wallet debe ser `owner()` en el contrato.
 * La lectura usa service_role, así que el navegador nunca recibe esa llave.
 */
export const GET = endpoint(async (request) => {
  configuration();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  throttle(ip);

  const address = walletFromInput(request.headers.get("x-owner-address"));
  const signature = signatureFromInput(
    request.headers.get("x-owner-signature"),
  );
  const rawTimestamp = request.headers.get("x-owner-timestamp");
  const timestamp = Number(rawTimestamp);
  if (!rawTimestamp || !Number.isFinite(timestamp))
    throw new ApiError(401, "Missing or invalid owner signature timestamp.");
  if (Math.abs(Date.now() - timestamp) > OWNER_SIGNATURE_WINDOW_MS)
    throw new ApiError(401, "The owner signature expired. Sign again.");

  const message = raffleOwnerEntriesMessage({
    address,
    chainId: raffleChain.id,
    contract: RAFFLE_ADDRESS,
    timestamp,
  });
  const client = rpcClient();
  if (!(await validSignature(client, address, message, signature)))
    throw new ApiError(401, "The signature does not match this wallet.");

  if (!raffleConfigured)
    throw new ApiError(503, "The raffle contract is not configured.");

  let onchainOwner: Address;
  try {
    onchainOwner = (await client.readContract({
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "owner",
    })) as Address;
  } catch {
    throw new ApiError(503, "The raffle contract could not be read.");
  }
  if (getAddress(onchainOwner) !== address)
    throw new ApiError(403, "Only the raffle owner can read the buyer list.");

  const db = adminDb();
  const { data, error } = await db
    .from("raffle_entries")
    .select("number,wallet,name,email,phone,note,created_at,network")
    .eq("raffle", RAFFLE_ID)
    .eq("chain_id", raffleChain.id)
    .order("number", { ascending: true });
  if (error)
    throw new ApiError(
      503,
      "The raffle entries table is not ready. Apply migration 202610230004_raffle_entries_chain.sql.",
    );

  return json({
    ok: true,
    chainId: raffleChain.id,
    entries: data ?? [],
  });
});

export const POST = endpoint(async (request) => {
  const app = configuration();
  if (request.headers.get("origin") !== app.origin)
    throw new ApiError(403, "This request must come from the raffle page.");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  throttle(ip);

  const input = await body(request);
  const number = numberFromInput(input.number);

  const name = text(input.name, "name", 2, 80);
  const email = text(input.email, "email", 5, 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    throw new ApiError(400, "Enter a valid email address.");
  // El campo acepta teléfono o Twitter/X. Se guarda en la columna `phone`
  // para no romper las filas existentes; la etiqueta visible es la nueva.
  const phone = text(input.phone, "phone or Twitter", 2, 80);
  const phoneOrTwitter =
    /^[+()\-\s\d.]{7,32}$/.test(phone) ||
    /^@?[A-Za-z0-9_]{2,15}$/.test(phone) ||
    /^https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]{2,15}\/?$/i.test(
      phone,
    );
  if (!phoneOrTwitter)
    throw new ApiError(400, "Enter a valid phone number or Twitter handle.");
  const note =
    typeof input.note === "string" && input.note.trim()
      ? text(input.note, "note", 1, 280)
      : undefined;

  const address = walletFromInput(input.address);
  const signature = signatureFromInput(input.signature);

  const message = raffleEntryMessage({
    number,
    address,
    name,
    email,
    phone,
    note,
    chainId: raffleChain.id,
    contract: RAFFLE_ADDRESS,
  });
  const client = rpcClient();
  if (!(await validSignature(client, address, message, signature)))
    throw new ApiError(401, "The signature does not match this wallet.");

  if (!raffleConfigured)
    throw new ApiError(503, "The raffle contract is not configured.");

  // El contacto se guarda DESPUÉS de la compra. El dueño onchain del número
  // es la prueba de que esta wallet realmente lo compró; no hay reserva de
  // 30 minutos ni bloqueo previo.
  const chainOwner = await numberOwner(client, number);
  if (chainOwner === zeroAddress)
    throw new ApiError(
      409,
      `Number ${number} is not owned by this wallet yet. Complete the purchase first.`,
    );
  if (getAddress(chainOwner) !== address)
    throw new ApiError(
      409,
      `Number ${number} was already bought by another wallet.`,
    );

  const now = new Date().toISOString();
  const db = adminDb();
  const { error } = await db.from("raffle_entries").upsert(
    {
      raffle: RAFFLE_ID,
      chain_id: raffleChain.id,
      number,
      wallet: address.toLowerCase(),
      name,
      email,
      phone,
      note: note ?? null,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "raffle,chain_id,number" },
  );
  if (error)
    throw new ApiError(
      503,
      "Your details could not be saved. Try again in a moment.",
    );

  return json({
    ok: true,
    number,
    wallet: address,
    chainId: raffleChain.id,
  });
});

/**
 * Borra la fila cuando el usuario se retira de la rifa. La firma prueba que es
 * el dueño de la wallet y el contrato prueba que el número ya no está en su
 * poder. Si el número sigue siendo suyo (o la cadena no responde), no se borra.
 */
export const DELETE = endpoint(async (request) => {
  const app = configuration();
  if (request.headers.get("origin") !== app.origin)
    throw new ApiError(403, "This request must come from the raffle page.");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  throttle(ip);

  const input = await body(request);
  const number = numberFromInput(input.number);
  const address = walletFromInput(input.address);
  const signature = signatureFromInput(input.signature);

  const message = raffleWithdrawalMessage({
    number,
    address,
    chainId: raffleChain.id,
    contract: RAFFLE_ADDRESS,
  });
  const client = rpcClient();
  if (!(await validSignature(client, address, message, signature)))
    throw new ApiError(401, "The signature does not match this wallet.");

  const db = adminDb();
  const existing = await db
    .from("raffle_entries")
    .select("id,wallet")
    .eq("raffle", RAFFLE_ID)
    .eq("chain_id", raffleChain.id)
    .eq("number", number)
    .maybeSingle();
  if (existing.error)
    throw new ApiError(
      503,
      "The raffle entries table is not ready. Apply migration 202610230004_raffle_entries_chain.sql.",
    );
  if (!existing.data) return json({ ok: true, removed: false });

  if (existing.data.wallet.toLowerCase() !== address.toLowerCase())
    throw new ApiError(403, "This wallet does not own this entry.");

  if (raffleConfigured) {
    const owner = await numberOwner(client, number);
    if (owner !== zeroAddress && getAddress(owner) === address)
      throw new ApiError(
        409,
        "You still hold this number onchain. Leave the raffle first.",
      );
  }

  const { error } = await db
    .from("raffle_entries")
    .delete()
    .eq("id", existing.data.id);
  if (error)
    throw new ApiError(
      503,
      "Your entry could not be removed. Try again in a moment.",
    );

  return json({ ok: true, removed: true, number, chainId: raffleChain.id });
});
