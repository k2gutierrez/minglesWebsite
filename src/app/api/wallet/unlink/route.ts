import {
  endpoint,
  requireUser,
  body,
  json,
  ApiError,
  rateLimit,
} from "@/lib/server/http";
export const POST = endpoint(async (request) => {
  const { user, db } = await requireUser(request);
  await rateLimit(db, user.id, "unlink", 5, 60);
  const input = await body(request);
  if (typeof input.walletId !== "string")
    throw new ApiError(400, "Choose a linked wallet.");
  const { error } = await db.rpc("unlink_holder_wallet", {
    p_wallet: input.walletId,
    p_user: user.id,
  });
  if (error) throw new ApiError(409, "The wallet could not be unlinked.");
  return json({ ok: true });
});
