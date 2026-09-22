import { type Address } from "viem";
import { COLLECTION } from "@/lib/web3/collection";
import { readHoldings } from "@/lib/server/chain";
import {
  endpoint,
  requireUser,
  body,
  json,
  ApiError,
  rateLimit,
} from "@/lib/server/http";
export const runtime = "nodejs";
export const maxDuration = 120;
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "refresh", 2, 60);
  const input = await body(request);
  if (typeof input.walletId !== "string")
    throw new ApiError(400, "Choose a linked wallet.");
  const { data: wallet, error } = await db
    .from("linked_wallets")
    .select("*")
    .eq("id", input.walletId)
    .eq("user_id", user.id)
    .eq("chain_id", COLLECTION.chain.id)
    .maybeSingle();
  if (error || !wallet)
    throw new ApiError(403, "Verify this wallet before requesting holdings.");
  const snapshot = await readHoldings(wallet.address as Address);
  const { error: saveError } = await db.rpc("save_holder_snapshot", {
    p_wallet: wallet.id,
    p_user: user.id,
    p_contract: COLLECTION.address.toLowerCase(),
    p_tokens: snapshot.tokenIds,
    p_balance: snapshot.balance,
    p_block: snapshot.blockNumber,
    p_checked: snapshot.checkedAt,
  });
  if (saveError)
    throw new ApiError(
      409,
      "The wallet changed while verification was running. Refresh the account and try again.",
    );
  return json({
    snapshot: { walletId: wallet.id, address: wallet.address, ...snapshot },
  });
});
