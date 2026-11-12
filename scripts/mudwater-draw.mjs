#!/usr/bin/env node
/**
 * The Last Barrel — final draw.
 *
 * Reads every Action event the contract emitted, rebuilds who ended in which
 * barrel, finds the qualifying barrel per arena, and prints the wallets that are
 * in it. Those wallets are the participants for the raffle, which is run
 * elsewhere.
 *
 * With --round it also orders them with a drand round, which makes the order
 * reproducible. Without it, the list comes out in the order people first
 * entered, which is all you need to hand the list over.
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
import { createClient } from "@supabase/supabase-js";
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
const fromBlock = BigInt(arg("from-block") ?? latest - 300_000n);

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

// ------------------------------------------------------------- identities ---
//
// The chain knows wallet addresses and nothing else. Which X account each wallet
// belongs to only exists in our database, so this is where the two are joined.
// The service role key is used because this runs on the operator's machine, not
// in a browser.

async function handlesByWallet(wallets) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log("ident.    no service role key, handles not resolved");
    return new Map();
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  const [walletsResult, playersResult] = await Promise.all([
    admin.from("mw_wallets").select("address, player_id"),
    admin.from("mw_players").select("id, handle"),
  ]);

  if (walletsResult.error || playersResult.error) {
    console.log("ident.    could not read the players table");
    return new Map();
  }

  const handleById = new Map(
    (playersResult.data ?? []).map((row) => [row.id, row.handle]),
  );

  const map = new Map();
  for (const row of walletsResult.data ?? []) {
    if (!wallets.includes(row.address.toLowerCase())) continue;
    map.set(row.address.toLowerCase(), handleById.get(row.player_id) ?? null);
  }

  console.log(`ident.    ${map.size} of ${wallets.length} resolved to an X account`);
  return map;
}

const round = arg("round");
let beacon = null;

if (round) {
  const url = `${DRAND}/${QUICKNET}/public/${round}`;
  beacon = await (await fetch(url)).json();
  console.log(`drand     round ${beacon.round}`);
  console.log(`seed      ${beacon.randomness}`);
} else {
  console.log("drand     none (list order, no seed)");
}

// ------------------------------------------------------------------ draw ---

function score(seed, arena, wallet) {
  return createHash("sha256").update(`${seed}:${arena}:${wallet}`).digest("hex");
}

const allWallets = [...final.values()].flatMap((arena) => [...arena.keys()]);
const handles = await handlesByWallet([...new Set(allWallets)]);

const result = {
  contract,
  chain: chain.id,
  round: beacon?.round ?? null,
  seed: beacon?.randomness ?? null,
  arenas: [],
};

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

  const order = beacon
    ? candidates
        .map((c) => ({ ...c, key: score(beacon.randomness, arena.id, c.wallet) }))
        .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
        .map((c, i) => ({ position: i + 1, wallet: c.wallet, barrel: LETTERS[c.barrel] }))
    : candidates.map((c, i) => ({
        position: i + 1,
        wallet: c.wallet,
        barrel: LETTERS[c.barrel],
      }));

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

  for (const row of order) {
    const handle = handles.get(row.wallet.toLowerCase());
    row.handle = handle ?? null;
    console.log(
      `  ${row.wallet}  ${handles.has(row.wallet.toLowerCase()) ? `@${handle}` : "(no X account on record)"}  (barrel ${row.barrel})`,
    );
  }

  result.arenas.push({ ...arena, counts, winning, candidates: candidates.length, order });
}

const suffix = beacon ? `round-${beacon.round}` : "list";
const jsonFile = `mudwater-${suffix}.json`;
writeFileSync(jsonFile, JSON.stringify(result, null, 2));

const rows = ["arena,barrel,handle,wallet"];
for (const arena of result.arenas) {
  for (const c of arena.order ?? []) {
    rows.push(`${arena.name},${c.barrel},${c.handle ?? ""},${c.wallet}`);
  }
}
const csvFile = `mudwater-${suffix}.csv`;
writeFileSync(csvFile, rows.join("\n") + "\n");

console.log(`\nwritten  ${jsonFile}`);
console.log(`written  ${csvFile}  (${rows.length - 1} wallets)`);
if (beacon) console.log("Re-run with the same --round to reproduce this exact order.");
