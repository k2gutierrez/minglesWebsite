import { json, ApiError } from "@/lib/server/http";
import { contractAddress } from "@/lib/mudwater/game";
import { mudwaterPublicClient } from "@/lib/mudwater/chain";

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

/**
 * GET /api/mudwater/draw
 *
 * Replays the Action log and returns, per arena, the final population and the
 * players sitting in the least populated non empty barrel. It does not order
 * them: the order needs the announced drand round and lives in the draw script,
 * which anybody can run and check.
 */
export async function GET() {
  const contract = contractAddress();
  if (!contract) throw new ApiError(503, "The game contract is not configured.");

  const client = mudwaterPublicClient();
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

    return {
      arena,
      name: arena === 0 ? "Mingles Arena" : "ApeChain Arena",
      counts,
      winning: winning.map((b) => LETTERS[b]),
      candidates,
    };
  });

  return json({ contract, actions: logs.length, fromBlock: Number(fromBlock), arenas });
}
