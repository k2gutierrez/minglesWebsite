import { COLLECTION } from "@/lib/web3/collection";
import { endpoint, requireUser, json, ApiError } from "@/lib/server/http";
export const GET = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  const [wallets, holdings] = await Promise.all([
    db
      .from("linked_wallets")
      .select("id,address,chain_id,verified_at")
      .eq("user_id", user.id)
      .eq("chain_id", COLLECTION.chain.id),
    db
      .from("holder_snapshots")
      .select("wallet_id,address,token_ids,balance,block_number,checked_at")
      .eq("user_id", user.id)
      .eq("contract_address", COLLECTION.address.toLowerCase()),
  ]);
  if (wallets.error || holdings.error)
    throw new ApiError(503, "Could not load your collection.");
  return json({
    wallets: wallets.data,
    holdings: holdings.data.map((h) => ({
      walletId: h.wallet_id,
      address: h.address,
      tokenIds: h.token_ids,
      balance: h.balance,
      blockNumber: h.block_number,
      checkedAt: h.checked_at,
      complete: true,
    })),
  });
});
