import "server-only";
import { createPublicClient, http, getAddress, type Address } from "viem";
import { COLLECTION, collectionAbi } from "../web3/collection";
import { ApiError } from "./http";
export function chainClient() {
  const rpc =
    process.env.APECHAIN_RPC_URL || COLLECTION.chain.rpcUrls.default.http[0];
  return createPublicClient({
    chain: COLLECTION.chain,
    transport: http(rpc, { timeout: 10000, retryCount: 1 }),
  });
}
export async function checkedClient() {
  const client = chainClient();
  if ((await client.getChainId()) !== COLLECTION.chain.id)
    throw new ApiError(
      503,
      "RPC network mismatch. Configure ApeChain mainnet.",
    );
  return client;
}
export async function readHoldings(address: Address) {
  const client = await checkedClient();
  const head = await client.getBlockNumber({ cacheTime: 0 });
  // An observed confirmed-block snapshot, not a guarantee of finality or live entitlement.
  const blockNumber = head > 12n ? head - 12n : head;
  const [code, is721, balance] = await Promise.all([
    client.getCode({ address: COLLECTION.address, blockNumber }),
    client.readContract({
      address: COLLECTION.address,
      abi: collectionAbi,
      functionName: "supportsInterface",
      args: ["0x80ac58cd"],
      blockNumber,
    }),
    client.readContract({
      address: COLLECTION.address,
      abi: collectionAbi,
      functionName: "balanceOf",
      args: [address],
      blockNumber,
    }),
  ]);
  if (!code || !is721)
    throw new ApiError(
      503,
      "Configured collection is not an ERC-721 contract.",
    );
  const tokenIds: string[] = [];
  if (balance > 0n) {
    const chunks: number[][] = [];
    for (
      let start = COLLECTION.firstTokenId;
      start <= COLLECTION.lastTokenId;
      start += 200
    )
      chunks.push(
        Array.from(
          { length: Math.min(200, COLLECTION.lastTokenId - start + 1) },
          (_, i) => start + i,
        ),
      );
    // Four bounded multicall workers. All reads share one block; each returned owner is onchain evidence.
    let cursor = 0;
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (cursor < chunks.length) {
          const ids = chunks[cursor++];
          const results = await client.multicall({
            contracts: ids.map((id) => ({
              address: COLLECTION.address,
              abi: collectionAbi,
              functionName: "ownerOf" as const,
              args: [BigInt(id)] as const,
            })),
            allowFailure: true,
            blockNumber,
            batchSize: 16000,
          });
          results.forEach((result, i) => {
            if (
              result.status === "success" &&
              getAddress(result.result) === getAddress(address)
            )
              tokenIds.push(String(ids[i]));
          });
        }
      }),
    );
  }
  tokenIds.sort((a, b) => Number(a) - Number(b));
  if (BigInt(tokenIds.length) !== balance)
    throw new ApiError(
      503,
      "NFT verification was incomplete. Previous holdings remain marked as an older snapshot; retry later.",
    );
  return {
    tokenIds,
    balance: balance.toString(),
    blockNumber: blockNumber.toString(),
    checkedAt: new Date().toISOString(),
    complete: true,
  };
}
