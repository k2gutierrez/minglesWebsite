import { createHash } from "node:crypto";
import { json, ApiError } from "@/lib/server/http";
import { contractAddress } from "@/lib/mudwater/game";
import { mudwaterLogClient as logClientFor } from "@/lib/mudwater/chain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACTION = {
  type: "event",
  name: "Action",
  inputs: [
    { name: "wallet", type: "address", indexed: true },
    { name: "arena", type: "uint8", indexed: true },
    { name: "barrel", type: "uint8", indexed: true },
    { name: "fromBarrel", type: "uint8", indexed: false },
    { name: "at", type: "uint64", indexed: false },
  ],
} as const;

const LETTERS = ["A", "B", "C"];

const DRAND = "https://api.drand.sh";
const QUICKNET =
  "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";

/** The announced round decides the order. Same round, same order, for anyone. */
async function seed(round: number): Promise<string | null> {
  try {
    const response = await fetch(`${DRAND}/${QUICKNET}/public/${round}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { randomness?: string };
    return data.randomness ?? null;
  } catch {
    return null;
  }
}

function score(randomness: string, arena: number, wallet: string) {
  return createHash("sha256").update(`${randomness}:${arena}:${wallet}`).digest("hex");
}

/**
 * GET /api/mudwater/draw
 *
 * Replays the Action log and returns, per arena, the final population and the
 * players sitting in the least populated non empty barrel. It does not order
 * them: the order needs the announced drand round and lives in the draw script,
 * which anybody can run and check.
 */
export async function GET() {
  try {
    return await read();
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
}

async function read() {
  const contract = contractAddress();
  if (!contract) throw new ApiError(503, "The game contract is not configured.");

  const client = logClientFor();
  const head = await client.getBlockNumber();
  const configured = Number(process.env.MUDWATER_FROM_BLOCK ?? 0);
  const fromBlock = configured > 0 ? BigInt(configured) : head - 300_000n;

  const logs: Awaited<ReturnType<typeof client.getLogs<typeof ACTION>>> = [];
  const STEP = 9_000n;
  for (let start = fromBlock; start <= head; start += STEP) {
    const end = start + STEP - 1n > head ? head : start + STEP - 1n;
    logs.push(
      ...(await client.getLogs({
        address: contract,
        event: ACTION,
        fromBlock: start,
        toBlock: end,
      })),
    );
  }

  logs.sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? a.logIndex - b.logIndex
      : Number(a.blockNumber - b.blockNumber),
  );

  const announced = Number(process.env.MUDWATER_DRAND_ROUND ?? 0);
  const randomness = announced > 0 ? await seed(announced) : null;

  const arenas = [0, 1].map((arena) => {
    const final = new Map<string, number>();
    for (const log of logs) {
      if (Number(log.args.arena) !== arena) continue;
      final.set(String(log.args.wallet).toLowerCase(), Number(log.args.barrel));
    }

    const counts = [0, 0, 0];
    for (const barrel of final.values()) counts[barrel] += 1;

    const nonEmpty = counts.filter((n) => n > 0);
    const lowest = nonEmpty.length ? Math.min(...nonEmpty) : 0;
    const winning = counts
      .map((n, barrel) => ({ n, barrel }))
      .filter((b) => b.n === lowest && b.n > 0)
      .map((b) => b.barrel);

    const candidates = [...final.entries()]
      .filter(([, barrel]) => winning.includes(barrel))
      .map(([wallet, barrel]) => ({ wallet, barrel: LETTERS[barrel] }));

    // With the announced round the candidates become a fixed order. Without
    // it they are just the people in the qualifying barrel.
    const ordered = randomness
      ? candidates
          .map((c) => ({ ...c, key: score(randomness, arena, c.wallet) }))
          .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
          .map((c, index) => ({ position: index + 1, wallet: c.wallet, barrel: c.barrel }))
      : candidates.map((c, index) => ({ position: index + 1, wallet: c.wallet, barrel: c.barrel }));

    return {
      arena,
      name: arena === 0 ? "Mingles Arena" : "ApeChain Arena",
      counts,
      winning: winning.map((b) => LETTERS[b]),
      candidates: ordered,
      total: ordered.length,
    };
  });

  return json({
    contract,
    actions: logs.length,
    fromBlock: Number(fromBlock),
    round: randomness ? announced : null,
    pendingRound: announced > 0 && !randomness ? announced : null,
    seed: randomness,
    arenas,
  });
}
