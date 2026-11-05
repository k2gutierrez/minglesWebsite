import { getAddress, isAddress, type Address } from "viem";
import { ApiError, body, endpoint, json, rateLimit, requireUser } from "@/lib/server/http";
import { mudwaterPublicClient } from "@/lib/mudwater/chain";
import { chainId } from "@/lib/mudwater/game";
import { ensurePlayer } from "@/lib/mudwater/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/mudwater/wallet/verify  { id, address, signature }
 *
 * Checks the signature against the stored challenge, burns it, and binds the
 * wallet. One wallet per X account and one account per wallet, enforced by the
 * table constraints: player_id is the primary key and lower(address) is unique.
 */
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "mudwater-wallet-verify", 8, 60);

  const input = await body(request);
  const id = typeof input.id === "string" ? input.id : "";
  const signature = typeof input.signature === "string" ? input.signature : "";

  if (!id || !signature) {
    throw new ApiError(400, "Missing the signature.");
  }

  if (typeof input.address !== "string" || !isAddress(input.address)) {
    throw new ApiError(400, "Choose a valid EVM wallet.");
  }

  const address = getAddress(input.address);
  const player = await ensurePlayer(db, user);

  const { data: challenge, error } = await db
    .from("mw_wallet_challenges")
    .select("id, address, message, expires_at, used_at, player_id")
    .eq("id", id)
    .eq("player_id", player.id)
    .maybeSingle();

  if (error) throw new ApiError(502, "Could not read the signature request.");

  if (
    !challenge ||
    challenge.used_at ||
    new Date(challenge.expires_at).getTime() <= Date.now()
  ) {
    throw new ApiError(409, "This request expired. Try again.");
  }

  if (getAddress(challenge.address as Address) !== address) {
    throw new ApiError(400, "The wallet does not match the request.");
  }

  const valid = await mudwaterPublicClient().verifyMessage({
    address,
    message: challenge.message,
    signature: signature as `0x${string}`,
  });

  if (!valid) {
    throw new ApiError(400, "That signature does not match.");
  }

  const burned = await db
    .from("mw_wallet_challenges")
    .update({ used_at: new Date().toISOString() })
    .eq("id", id)
    .is("used_at", null)
    .select("id");

  if (burned.error || !burned.data?.length) {
    throw new ApiError(409, "This request was already used.");
  }

  const taken = await db
    .from("mw_wallets")
    .select("player_id")
    .eq("chain_id", chainId())
    .ilike("address", address.toLowerCase())
    .maybeSingle();

  if (taken.error) throw new ApiError(502, "Could not check the wallet.");

  if (taken.data && taken.data.player_id !== player.id) {
    throw new ApiError(409, "That wallet is already linked to another account.");
  }

  const saved = await db.from("mw_wallets").upsert(
    {
      player_id: player.id,
      address: address.toLowerCase(),
      chain_id: chainId(),
      bound_at: new Date().toISOString(),
    },
    { onConflict: "player_id" },
  );

  if (saved.error) {
    throw new ApiError(409, "Could not link that wallet. Is it used by another account?");
  }

  return json({ ok: true, wallet: address });
});
