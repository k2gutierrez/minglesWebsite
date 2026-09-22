import { getAddress, parseAbi } from "viem";
import { apeChain } from "viem/chains";
// The only collection-specific settings. No wallet private key is ever needed.
export const COLLECTION = {
  name: "Mingles",
  chain: apeChain,
  address: getAddress("0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e"),
  firstTokenId: 1,
  lastTokenId: 5555,
} as const;
export const collectionAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function supportsInterface(bytes4) view returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
]);
export type HolderWallet = {
  id: string;
  address: string;
  chain_id: number;
  verified_at: string;
};
export type Holdings = {
  walletId: string;
  address: string;
  tokenIds: string[];
  balance: string;
  blockNumber: string;
  checkedAt: string;
  complete: boolean;
};
export type HolderData = { wallets: HolderWallet[]; holdings: Holdings[] };
export function validTokenId(value: string) {
  return (
    /^\d{1,78}$/.test(value) &&
    BigInt(value) >= BigInt(COLLECTION.firstTokenId) &&
    BigInt(value) <= BigInt(COLLECTION.lastTokenId)
  );
}
// Only content-addressed IPFS media. Never fetch arbitrary contract URLs server-side.
export function ipfsPath(uri: unknown): string | null {
  if (
    typeof uri !== "string" ||
    uri.length > 2048 ||
    !uri.startsWith("ipfs://")
  )
    return null;
  const path = uri.slice(7).replace(/^ipfs\//, "");
  if (
    !/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})(\/[a-zA-Z0-9_.-]+)*$/.test(
      path,
    ) ||
    path.split("/").some((s) => s === "." || s === "..")
  )
    return null;
  return path;
}
export function ipfsImage(uri: unknown) {
  const path = ipfsPath(uri);
  return path ? `https://ipfs.io/ipfs/${path}` : null;
}
