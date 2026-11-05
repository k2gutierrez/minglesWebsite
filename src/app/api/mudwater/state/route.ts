import type { Address } from "viem";
import { ApiError, json, requireUser } from "@/lib/server/http";
import { chainId, contractAddress, readCounts, readDeadline, readIsHolder, readPlayer } from "@/lib/mudwater/game";
import { boundWallet, ensurePlayer } from "@/lib/mudwater/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/mudwater/state
 *
 * Public part: live counts, deadline and chain. Anyone can poll it.
 * Signed part: if a Bearer token comes with the request, it also returns the
 * caller's wallet, pass and per arena position. Those two extra reads only
 * happen when there is a session, so the anonymous poll stays cheap.
 */
export async function GET(request: Request) {
  const address = contractAddress();

  if (!address) {
    return json({ configured: false });
  }

  try {
    const [counts, deadline] = await Promise.all([
      readCounts(address),
      readDeadline(address),
    ]);

    const base = {
      configured: true,
      chainId: chainId(),
      contract: address,
      deadline,
      counts,
      player: null as unknown,
    };

    const hasToken = /^Bearer [A-Za-z0-9_.-]+$/.test(
      request.headers.get("authorization") ?? "",
    );
    if (!hasToken) return json(base);

    const { user, db } = await requireUser(request);
    const player = await ensurePlayer(db, user);
    const wallet = await boundWallet(db, player.id);

    if (!wallet) {
      return json({
        ...base,
        player: {
          handle: player.handle,
          avatar: player.avatar_url,
          wallet: null,
          passExpiry: 0,
          holders: null,
          open: null,
        },
      });
    }

    const [onchain, isHolder] = await Promise.all([
      readPlayer(address, wallet.address as Address),
      readIsHolder(wallet.address as Address),
    ]);

    const passes = await db
      .from("mw_passes")
      .select("activation, status, tx_hash, expiry")
      .eq("player_id", player.id)
      .order("activation", { ascending: true });

    return json({
      ...base,
      player: {
        handle: player.handle,
        avatar: player.avatar_url,
        wallet: wallet.address,
        passExpiry: onchain.passExpiry,
        holders: onchain.holders,
        open: onchain.open,
        isHolder,
        passes: passes.data ?? [],
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return json({ error: error.message }, error.status);
    }
    console.error("[mudwater] state failed:", error);
    return json({ error: "Could not read the game state." }, 503);
  }
}
