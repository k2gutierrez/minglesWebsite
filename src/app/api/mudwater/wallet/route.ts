import { randomBytes, randomUUID } from "node:crypto";
import { getAddress, isAddress } from "viem";
import { createSiweMessage } from "viem/siwe";
import { ApiError, body, endpoint, json, rateLimit, requireUser } from "@/lib/server/http";
import { chainId } from "@/lib/mudwater/game";
import { ensurePlayer } from "@/lib/mudwater/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TEN_MINUTES = 10 * 60 * 1000;

/**
 * POST /api/mudwater/wallet  { address }
 *
 * Returns a message to sign. Signing it is free and proves the wallet belongs
 * to whoever holds the X session. The challenge is stored so the verify step
 * can check it once and only once.
 */
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "mudwater-wallet", 8, 60);

  const input = await body(request);
  if (typeof input.address !== "string" || !isAddress(input.address)) {
    throw new ApiError(400, "Choose a valid EVM wallet.");
  }

  const address = getAddress(input.address);
  const player = await ensurePlayer(db, user);

  const id = randomUUID();
  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + TEN_MINUTES);
  const origin = process.env.APP_ORIGIN ?? "https://www.mingles.wtf";

  const message = createSiweMessage({
    address,
    chainId: chainId(),
    domain: new URL(origin).host,
    uri: `${origin}/mudwater`,
    version: "1",
    nonce,
    issuedAt: new Date(),
    expirationTime: expiresAt,
    requestId: id,
    statement:
      "Link this wallet to your X account for The Last Barrel. Free signature, no transfer or approval.",
  });

  const inserted = await db.from("mw_wallet_challenges").insert({
    id,
    player_id: player.id,
    address: address.toLowerCase(),
    chain_id: chainId(),
    message,
    expires_at: expiresAt.toISOString(),
  });

  if (inserted.error) {
    throw new ApiError(502, "Could not create the signature request.");
  }

  return json({ id, message, expiresAt: expiresAt.toISOString() });
});
