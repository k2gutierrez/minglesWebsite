import "server-only";
import { isAddress, parseAbi, type Address } from "viem";
import { gameAbi } from "./abi";
import { mudwaterChain, mudwaterPublicClient } from "./chain";

/**
 * Reads the deployed contract. Nothing here writes.
 *
 * The counts are the only thing the public stadium needs, so they are read
 * separately from the per player bits to keep the anonymous request cheap.
 */

export { gameAbi };

const erc721Abi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

const ZERO = "0x0000000000000000000000000000000000000000";

/**
 * Mingles ERC721 that gates the holders arena, if the gate is on.
 *
 * Missing, blank, the zero address and anything that is not an address all mean
 * "gate off". The zero address is the contract's own way of saying it, so the
 * two agree and nobody has to remember which side wants an empty string.
 */
export function collectionAddress(): Address | null {
  const raw = (process.env.MUDWATER_COLLECTION_ADDRESS ?? "").trim();
  if (!raw || raw.toLowerCase() === ZERO || !isAddress(raw)) return null;
  return raw;
}

/**
 * Whether the wallet holds a Mingles. `null` means the gate is off, which is
 * the Curtis setup, so the arena stays open.
 */
export async function readIsHolder(wallet: Address): Promise<boolean | null> {
  const nft = collectionAddress();
  if (!nft) return null;

  const balance = await mudwaterPublicClient().readContract({
    address: nft,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [wallet],
  });

  return balance > 0n;
}

export function contractAddress(): Address | null {
  const raw = process.env.MUDWATER_CONTRACT_ADDRESS;
  return raw && isAddress(raw) ? raw : null;
}

export interface Counts {
  holders: [number, number, number];
  open: [number, number, number];
}

/** Whether each arena has already published its final counts. */
export async function readSealed(
  address: Address,
): Promise<{ holders: boolean; open: boolean }> {
  const client = mudwaterPublicClient();

  const [holders, open] = await Promise.all([
    client.readContract({
      address,
      abi: gameAbi,
      functionName: "s_isSealed",
      args: [0],
    }),
    client.readContract({
      address,
      abi: gameAbi,
      functionName: "s_isSealed",
      args: [1],
    }),
  ]);

  return { holders, open };
}

/** The wallet that owns the contract. It has no powers, it is a label. */
export async function readOwner(address: Address): Promise<string> {
  return mudwaterPublicClient().readContract({
    address,
    abi: gameAbi,
    functionName: "owner",
  });
}

export async function readCounts(address: Address): Promise<Counts> {
  const client = mudwaterPublicClient();

  const [holders, open] = await Promise.all([
    client.readContract({
      address,
      abi: gameAbi,
      functionName: "counts",
      args: [0],
    }),
    client.readContract({
      address,
      abi: gameAbi,
      functionName: "counts",
      args: [1],
    }),
  ]);

  return {
    holders: [Number(holders[0]), Number(holders[1]), Number(holders[2])],
    open: [Number(open[0]), Number(open[1]), Number(open[2])],
  };
}

export async function readDeadline(address: Address): Promise<number> {
  const client = mudwaterPublicClient();
  const deadline = await client.readContract({
    address,
    abi: gameAbi,
    functionName: "i_deadline",
  });
  return Number(deadline);
}

export interface SealedState {
  holders: boolean;
  open: boolean;
}

export interface ArenaState {
  barrel: number;
  entered: boolean;
  lastAction: number;
}

export interface OnchainPlayer {
  holders: ArenaState;
  open: ArenaState;
}

export async function readPlayer(
  address: Address,
  wallet: Address,
): Promise<OnchainPlayer> {
  const client = mudwaterPublicClient();

  const [positionH, enteredH, lastH, positionO, enteredO, lastO] =
    await Promise.all([
      client.readContract({
        address,
        abi: gameAbi,
        functionName: "s_position",
        args: [0, wallet],
      }),
      client.readContract({
        address,
        abi: gameAbi,
        functionName: "s_entered",
        args: [0, wallet],
      }),
      client.readContract({
        address,
        abi: gameAbi,
        functionName: "s_lastAction",
        args: [0, wallet],
      }),
      client.readContract({
        address,
        abi: gameAbi,
        functionName: "s_position",
        args: [1, wallet],
      }),
      client.readContract({
        address,
        abi: gameAbi,
        functionName: "s_entered",
        args: [1, wallet],
      }),
      client.readContract({
        address,
        abi: gameAbi,
        functionName: "s_lastAction",
        args: [1, wallet],
      }),
    ]);

  return {
    holders: {
      barrel: Number(positionH),
      entered: enteredH,
      lastAction: Number(lastH),
    },
    open: {
      barrel: Number(positionO),
      entered: enteredO,
      lastAction: Number(lastO),
    },
  };
}

export function chainId(): number {
  return mudwaterChain().chain.id;
}
