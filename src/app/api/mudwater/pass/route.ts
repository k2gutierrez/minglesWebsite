import { ApiError, body, endpoint, json, rateLimit, requireUser } from "@/lib/server/http";
import { contractAddress, readDeadline } from "@/lib/mudwater/game";
import { boundWallet, ensurePlayer } from "@/lib/mudwater/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CARDS = new Set(["a", "b", "c"]);

/**
 * POST /api/mudwater/pass  { card }
 *
 * Records that the player shared a post. This is a declaration, not a grant:
 * the contract has no gate any more, so nothing is written onchain here.
 *
 * The post itself is checked by hand at review. There is no post read API, so
 * the only thing this row proves is that the player said they posted. If the
 * post is not public when the prize is awarded, the next candidate takes it.
 */
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "mudwater-pass", 6, 60);

  const address = contractAddress();
  if (!address) {
    throw new ApiError(503, "The game contract is not configured yet.");
  }

  const input = await body(request);
  const card = typeof input.card === "string" ? input.card : "";

  if (!CARDS.has(card)) {
    throw new ApiError(400, "Pick one of the three cards first.");
  }

  const player = await ensurePlayer(db, user);
  const wallet = await boundWallet(db, player.id);

  if (!wallet) {
    throw new ApiError(409, "Link a wallet before sharing your post.");
  }

  const deadline = await readDeadline(address);

  if (deadline * 1000 <= Date.now()) {
    throw new ApiError(409, "The game is closing, there is no time left.");
  }

  const saved = await db.from("mw_passes").upsert(
    {
      player_id: player.id,
      post_url: null,
      card,
      activation: 1,
      expiry: new Date(deadline * 1000).toISOString(),
      status: "granted",
      tx_hash: null,
      failure: null,
    },
    { onConflict: "player_id,activation" },
  );

  if (saved.error) {
    throw new ApiError(502, "Could not save your declaration.");
  }

  return json({ ok: true, card, wallet: wallet.address });
});
