import type { Address } from "viem";
import { ApiError, body, endpoint, json, rateLimit, requireUser } from "@/lib/server/http";
import { grantPass } from "@/lib/mudwater/authorizer";
import { contractAddress, readDeadline } from "@/lib/mudwater/game";
import { boundWallet, ensurePlayer } from "@/lib/mudwater/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;

/** Accepts only a public post URL on x.com or twitter.com. */
function postUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 300) {
    throw new ApiError(400, "Paste the link of the post you published.");
  }

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ApiError(400, "That is not a valid link.");
  }

  const ok =
    url.protocol === "https:" &&
    /^(www\.)?(x|twitter)\.com$/.test(url.hostname) &&
    /\/status\/\d+/.test(url.pathname);

  if (!ok) {
    throw new ApiError(400, "Use the link of a post on x.com.");
  }

  return url.toString();
}

/**
 * POST /api/mudwater/pass  { postUrl }
 *
 * Declares a post and grants the pass onchain. One row per activation, two
 * activations max. The second window adds 24 hours to the first expiry, it does
 * not restart the clock, so both posts up front cover the whole event.
 */
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "mudwater-pass", 6, 60);

  const address = contractAddress();
  if (!address) {
    throw new ApiError(503, "The game contract is not configured yet.");
  }

  const input = await body(request);
  const link = postUrl(input.postUrl);

  const player = await ensurePlayer(db, user);
  const wallet = await boundWallet(db, player.id);

  if (!wallet) {
    throw new ApiError(409, "Link a wallet before declaring a post.");
  }

  const previous = await db
    .from("mw_passes")
    .select("activation, expiry, status")
    .eq("player_id", player.id)
    .order("activation", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (previous.error) {
    throw new ApiError(502, "Could not read your passes.");
  }

  const last = previous.data as
    | { activation: number; expiry: string; status: string }
    | null;

  if (last?.activation === 2) {
    throw new ApiError(409, "You already used your two passes.");
  }

  const activation = last ? 2 : 1;

  // The chain is the authority on when the game closes, not an env var.
  const deadline = await readDeadline(address);
  const now = Date.now();

  // Activation one opens 24h from now. Activation two adds 24h to whatever the
  // first one had, which is what the rules describe.
  const base =
    activation === 2 && last ? new Date(last.expiry).getTime() : now;
  let expiry = base + DAY;

  if (deadline > 0) expiry = Math.min(expiry, deadline * 1000);

  if (expiry <= now) {
    throw new ApiError(409, "The game is closing, there is no time left.");
  }

  const row = await db
    .from("mw_passes")
    .upsert(
      {
        player_id: player.id,
        post_url: link,
        activation,
        expiry: new Date(expiry).toISOString(),
        status: "pending",
        tx_hash: null,
        failure: null,
      },
      { onConflict: "player_id,activation" },
    )
    .select("id")
    .single();

  if (row.error) {
    throw new ApiError(502, "Could not save your declaration.");
  }

  try {
    const hash = await grantPass(wallet.address as Address, Math.floor(expiry / 1000));

    await db
      .from("mw_passes")
      .update({ status: "granted", tx_hash: hash })
      .eq("id", row.data.id);

    return json({ ok: true, activation, expiry, txHash: hash, wallet: wallet.address });
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "The transaction failed.";

    await db
      .from("mw_passes")
      .update({ status: "failed", failure: message.slice(0, 300) })
      .eq("id", row.data.id);

    throw new ApiError(502, message);
  }
});

export function GET() {
  return json({ error: "Use POST." }, 405);
}
