import { randomBytes, randomUUID } from "node:crypto";
import { getAddress, isAddress } from "viem";
import { createSiweMessage } from "viem/siwe";
import { COLLECTION } from "@/lib/web3/collection";
import {
  endpoint,
  requireUser,
  body,
  configuration,
  json,
  ApiError,
  rateLimit,
} from "@/lib/server/http";
export const runtime = "nodejs";
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "challenge", 5, 60);
  const input = await body(request);
  if (typeof input.address !== "string" || !isAddress(input.address))
    throw new ApiError(400, "Choose a valid EVM wallet.");
  const address = getAddress(input.address);
  const { origin } = configuration();
  const nonce = randomBytes(24).toString("hex");
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const message = createSiweMessage({
    address,
    chainId: COLLECTION.chain.id,
    domain: new URL(origin).host,
    uri: `${origin}/portal`,
    version: "1",
    nonce,
    issuedAt: new Date(),
    expirationTime: expiresAt,
    requestId: id,
    statement:
      "Link this wallet to your signed-in Mingles account. This signature does not authorize transfers, approvals, or payments.",
  });
  const { error } = await db.from("wallet_challenges").insert({
    id,
    user_id: user.id,
    address: address.toLowerCase(),
    chain_id: COLLECTION.chain.id,
    message,
    expires_at: expiresAt.toISOString(),
  });
  if (error)
    throw new ApiError(503, "Could not create the verification challenge.");
  return json({
    id,
    message,
    expiresAt: expiresAt.toISOString(),
    chainId: COLLECTION.chain.id,
  });
});
