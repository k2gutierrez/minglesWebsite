import { isHex, type Address, type Hex } from "viem";
import {
  endpoint,
  requireUser,
  body,
  json,
  ApiError,
  rateLimit,
} from "@/lib/server/http";
import { checkedClient } from "@/lib/server/chain";
export const runtime = "nodejs";
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "verify", 10, 60);
  const input = await body(request);
  if (
    typeof input.id !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(input.id) ||
    typeof input.signature !== "string" ||
    !isHex(input.signature) ||
    input.signature.length > 12000
  )
    throw new ApiError(400, "Invalid verification request.");
  const { data: challenge, error } = await db
    .from("wallet_challenges")
    .select("*")
    .eq("id", input.id)
    .eq("user_id", user.id)
    .is("used_at", null)
    .maybeSingle();
  if (
    error ||
    !challenge ||
    new Date(challenge.expires_at).getTime() <= Date.now()
  )
    throw new ApiError(
      400,
      "This challenge expired or was already used. Connect again.",
    );
  const client = await checkedClient();
  // Verify the exact server-stored SIWE message, never a message supplied by the browser.
  const valid = await client.verifyMessage({
    address: challenge.address as Address,
    message: challenge.message,
    signature: input.signature as Hex,
  });
  if (!valid)
    throw new ApiError(401, "The signature does not match this wallet.");
  const { data, error: consumeError } = await db.rpc(
    "consume_wallet_challenge",
    { p_id: input.id, p_user: user.id },
  );
  if (consumeError)
    throw new ApiError(
      409,
      "The wallet is linked to another account, or this challenge was already used.",
    );
  return json({ wallet: data });
});
