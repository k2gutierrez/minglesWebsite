import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ApiError } from "@/lib/server/http";

/**
 * Everything the game needs to know about who is asking.
 *
 * The X identity lives in auth.users. The stable numeric account id comes from
 * the provider identity, never from the handle, because a handle can change.
 */

export interface PlayerRow {
  id: string;
  x_user_id: string;
  handle: string;
  avatar_url: string | null;
}

export function xIdentity(user: User): {
  xUserId: string;
  handle: string;
  avatar: string | null;
} {
  const identity = user.identities?.[0];
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const xUserId = String(
    identity?.id ?? meta.sub ?? user.id,
  );

  // X puts the handle in user_name, but the field has moved around across
  // provider versions, and an account created before the scope was right is
  // still carrying "unknown". Check every place it can be and fall back to
  // something stable rather than the word unknown.
  const identityMeta = (identity?.identity_data ?? {}) as Record<string, unknown>;

  const rawHandle = [
    meta.user_name,
    meta.preferred_username,
    identityMeta.user_name,
    meta.nickname,
    meta.name,
  ].find((value) => typeof value === "string" && value.trim().length > 0);

  const handle = rawHandle
    ? String(rawHandle).trim().replace(/^@/, "")
    : `x${String(xUserId).slice(0, 6)}`;

  const avatar =
    typeof meta.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta.picture === "string"
        ? meta.picture
        : null;

  return { xUserId, handle, avatar };
}

/** Finds or creates the player row for a signed in account. */
export async function ensurePlayer(
  db: SupabaseClient,
  user: User,
): Promise<PlayerRow> {
  const { xUserId, handle, avatar } = xIdentity(user);

  const existing = await db
    .from("mw_players")
    .select("id, x_user_id, handle, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.error) throw new ApiError(502, "Could not read the player.");

  if (existing.data) {
    const row = existing.data as PlayerRow;

    // A row created before the handle was readable keeps saying "unknown"
    // forever unless it is repaired on the next sign in.
    if (row.handle !== handle || row.avatar_url !== avatar) {
      const fixed = await db
        .from("mw_players")
        .update({ handle, avatar_url: avatar })
        .eq("id", user.id)
        .select("id, x_user_id, handle, avatar_url")
        .single();

      if (!fixed.error) return fixed.data as PlayerRow;
    }

    return row;
  }

  const inserted = await db
    .from("mw_players")
    .insert({
      id: user.id,
      x_user_id: xUserId,
      handle,
      avatar_url: avatar,
    })
    .select("id, x_user_id, handle, avatar_url")
    .single();

  if (inserted.error) {
    throw new ApiError(502, "Could not create the player.");
  }

  return inserted.data as PlayerRow;
}

export interface BoundWallet {
  address: string;
  chainId: number;
}

export async function boundWallet(
  db: SupabaseClient,
  playerId: string,
): Promise<BoundWallet | null> {
  const { data, error } = await db
    .from("mw_wallets")
    .select("address, chain_id")
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw new ApiError(502, "Could not read the linked wallet.");
  if (!data) return null;

  return { address: data.address, chainId: Number(data.chain_id) };
}
