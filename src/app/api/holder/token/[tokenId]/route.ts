import { getAddress } from "viem";
import {
  COLLECTION,
  collectionAbi,
  validTokenId,
  ipfsPath,
  ipfsImage,
} from "@/lib/web3/collection";
import { checkedClient } from "@/lib/server/chain";
import { requireUser, rateLimit, json, ApiError } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  try {
    const { user, db } = await requireUser(request);
    await rateLimit(db, user.id, "metadata", 120, 60);
    const { tokenId } = await params;
    if (!validTokenId(tokenId)) throw new ApiError(400, "Invalid Mingle ID.");
    const { data: wallets, error } = await db
      .from("linked_wallets")
      .select("address")
      .eq("user_id", user.id)
      .eq("chain_id", COLLECTION.chain.id);
    if (error || !wallets?.length)
      throw new ApiError(403, "Link a wallet first.");
    const client = await checkedClient();
    const blockNumber = await client.getBlockNumber({ cacheTime: 0 });
    const owner = await client.readContract({
      address: COLLECTION.address,
      abi: collectionAbi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
      blockNumber,
    });
    if (!wallets.some((w) => getAddress(w.address) === getAddress(owner)))
      throw new ApiError(
        403,
        "This Mingle is no longer owned by your linked wallets. Refresh your collection.",
      );
    const uri = await client.readContract({
      address: COLLECTION.address,
      abi: collectionAbi,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
      blockNumber,
    });
    const result: {
      tokenId: string;
      name: string;
      image: string | null;
      description: string;
      metadataStatus: string;
      tokenUri: string;
    } = {
      tokenId,
      name: `Mingle #${tokenId}`,
      image: null,
      description: "",
      metadataStatus: "unavailable",
      tokenUri: uri,
    };
    const path = ipfsPath(uri);
    if (path) {
      try {
        const response = await fetch(`https://ipfs.io/ipfs/${path}`, {
          redirect: "error",
          signal: AbortSignal.timeout(6000),
          next: { revalidate: 3600 },
        });
        if (response.ok && response.body) {
          const reader = response.body.getReader();
          let size = 0;
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 524288) {
              await reader.cancel();
              throw Error("Metadata too large");
            }
            chunks.push(value);
          }
          const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          result.name =
            typeof data.name === "string"
              ? data.name.slice(0, 160)
              : result.name;
          result.description =
            typeof data.description === "string"
              ? data.description.slice(0, 600)
              : "";
          result.image = ipfsImage(data.image);
          result.metadataStatus = "loaded";
        }
      } catch {
        /* Metadata never changes the separately verified ownership result. */
      }
    }
    return json(result);
  } catch (error) {
    return json(
      {
        error:
          error instanceof ApiError
            ? error.message
            : "Token data is temporarily unavailable.",
      },
      error instanceof ApiError ? error.status : 503,
    );
  }
}
