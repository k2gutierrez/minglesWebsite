#!/usr/bin/env node
/**
 * The Last Barrel — final draw.
 *
 * Reads every Action event the contract emitted, rebuilds who ended in which
 * barrel, finds the qualifying barrel per arena, and orders its players with a
 * drand seed. Prints the top 5 and writes the full order to a JSON file so the
 * result can be reproduced later by anyone with the same round.
 *
 * Usage, from mingles/frontend:
 *
 *   node --env-file=.env.local scripts/mudwater-draw.mjs
 *   node --env-file=.env.local scripts/mudwater-draw.mjs --round 33619999
 *   node --env-file=.env.local scripts/mudwater-draw.mjs --contract 0x... --from-block 37000000
 *
 * Run it after the deadline. Before the deadline the answer is meaningless.
 */

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createPublicClient, http, parseAbiItem } from "viem";
import { apeChain } from "viem/chains";
import { apeChainCurtis } from "../src/lib/web3/chains.ts";

const DRAND = "https://api.drand.sh";
const QUICKNET =
  "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";

const ARENAS = [
  { id: 0, name: "Mingles Arena", sub: "Mingles Holders" },
  { id: 1, name: "ApeChain Arena", sub: "Open Swamp" },
];
const LETTERS = ["A", "B", "C"];

const ACTION = parseAbiItem(
  "event Action(address indexed wallet, uint8 indexed arena, uint8 indexed barrel, uint8 fromBarrel, uint64 at)",
);

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

const testnet = Number(process.env.MUDWATER_CHAIN_ID ?? 33139) === apeChainCurtis.id;
const chain = testnet ? apeChainCurtis : apeChain;
const rpc =
  (testnet ? process.env.CURTIS_RPC_URL : process.env.APECHAIN_RPC_URL) ||
  chain.rpcUrls.default.http[0];
const contract = arg("contract") ?? process.env.MUDWATER_CONTRACT_ADDRESS;

if (!contract) {
  console.error("No contract. Set MUDWATER_CONTRACT_ADDRESS or pass --contract.");
  process.exit(1);
}

const client = createPublicClient({
  chain,
  transport: http(rpc, { timeout: 20_000, retryCount: 2 }),
});

const latest = await client.getBlockNumber();
const fromBlock = BigInt(arg("from-block") ?? latest - 50_000n);

console.log(`contract  ${contract}`);
console.log(`chain     ${chain.id}`);
console.log(`blocks    ${fromBlock} → ${latest}`);

// ---------------------------------------------------------------- events ---

const logs = [];
const STEP = 10_000n;
for (let start = fromBlock; start <= latest; start += STEP) {
  const end = start + STEP - 1n > latest ? latest : start + STEP - 1n;
  const chunk = await client.getLogs({
    address: contract,
    event: ACTION,
    fromBlock: start,
    toBlock: end,
  });
  logs.push(...chunk);
}

logs.sort((a, b) => {
  const block = Number(a.blockNumber - b.blockNumber);
  return block !== 0 ? block : a.logIndex - b.logIndex;
});

console.log(`actions   ${logs.length}`);

if (logs.length === 0) {
  console.log("\nNobody played. Nothing to draw.");
  process.exit(0);
}

// ------------------------------------------------------------ final state ---

/** arena => wallet => barrel */
const final = new Map();
for (const log of logs) {
  const { wallet, arena, barrel } = log.args;
  if (!final.has(arena)) final.set(arena, new Map());
  final.get(arena).set(wallet.toLowerCase(), barrel);
}

// Cross check against the contract, so a misread log cannot decide a prize.
for (const arena of ARENAS) {
  const onchain = await client.readContract({
    address: contract,
    abi: [
      {
        type: "function",
        name: "counts",
        stateMutability: "view",
        inputs: [{ name: "arena", type: "uint8" }],
        outputs: [{ name: "", type: "uint256[3]" }],
      },
    ],
    functionName: "counts",
    args: [arena.id],
  });

  const players = final.get(arena.id) ?? new Map();
  const replayed = [0, 0, 0];
  for (const barrel of players.values()) replayed[barrel] += 1;

  const matches = replayed.every((n, i) => Number(onchain[i]) === n);
  console.log(
    `replay  ${arena.name.padEnd(16)} ${JSON.stringify(replayed)} ${
      matches ? "ok" : `MISMATCH against ${JSON.stringify(onchain.map(Number))}`
    }`,
  );

  if (!matches) {
    console.error("\nThe event replay does not match the contract. Stopping.");
    process.exit(1);
  }
}

// ------------------------------------------------------------------ seed ---

const round = arg("round");
const url = `${DRAND}/${QUICKNET}/public/${round ?? "latest"}`;
const beacon = await (await fetch(url)).json();

console.log(`drand     round ${beacon.round}`);
console.log(`seed      ${beacon.randomness}`);

// ------------------------------------------------------------------ draw ---

function score(seed, arena, wallet) {
  return createHash("sha256").update(`${seed}:${arena}:${wallet}`).digest("hex");
}

const result = { contract, chain: chain.id, round: beacon.round, seed: beacon.randomness, arenas: [] };

for (const arena of ARENAS) {
  const players = [...(final.get(arena.id) ?? new Map()).entries()];

  if (players.length === 0) {
    console.log(`\n=== ${arena.name} ===\nnobody entered`);
    result.arenas.push({ ...arena, counts: [0, 0, 0], winning: [], order: [] });
    continue;
  }

  const counts = [0, 0, 0];
  for (const [, barrel] of players) counts[barrel] += 1;

  const lowest = Math.min(...counts.filter((n) => n > 0));
  const winning = counts
    .map((n, barrel) => ({ n, barrel }))
    .filter((b) => b.n === lowest && b.n > 0)
    .map((b) => b.barrel);

  const candidates = players
    .filter(([, barrel]) => winning.includes(barrel))
    .map(([wallet, barrel]) => ({ wallet, barrel }));

  const order = candidates
    .map((c) => ({ ...c, key: score(beacon.randomness, arena.id, c.wallet) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map((c, i) => ({ position: i + 1, ...c }));

  console.log(`\n=== ${arena.name} (${arena.sub}) ===`);
  console.log(
    `counts    ${LETTERS.map((l, i) => `${l}=${counts[i]}`).join("  ")}`,
  );
  console.log(
    `winning   ${winning.map((b) => `Barrel ${LETTERS[b]}`).join(" + ")}${
      winning.length > 1 ? " (tie, one draw)" : ""
    }`,
  );
  console.log(`players   ${players.length}, candidates ${candidates.length}`);

  const top = order.slice(0, 5);
  for (const row of top) {
    console.log(`  #${row.position}  ${row.wallet}  barrel ${LETTERS[row.barrel]}`);
  }
  if (order.length > 5) console.log(`  … ${order.length - 5} more in the file`);

  result.arenas.push({ ...arena, counts, winning, candidates: candidates.length, order });
}

const file = `draw-${beacon.round}.json`;
writeFileSync(file, JSON.stringify(result, null, 2));

console.log(`\nWritten to ${file}`);
console.log("Re-run with the same --round to reproduce this exact order.");
