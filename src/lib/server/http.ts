import "server-only";
import { createClient } from "@supabase/supabase-js";
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export function configuration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const origin = process.env.APP_ORIGIN;
  if (!url || !publicKey || !secret || !origin)
    throw new ApiError(
      503,
      "Wallet backend is not configured. Ask the site administrator to complete setup.",
    );
  const site = new URL(origin);
  if (
    site.origin !== origin ||
    site.username ||
    site.password ||
    !(
      site.protocol === "https:" ||
      (site.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(site.hostname))
    )
  )
    throw new ApiError(
      503,
      "The application origin is not configured correctly.",
    );
  return { url, publicKey, secret, origin };
}
export function adminDb() {
  const c = configuration();
  return createClient(c.url, c.secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function requireUser(request: Request) {
  const c = configuration();
  // Bearer auth avoids ambient-cookie CSRF; also enforce the configured origin for writes.
  if (request.method !== "GET" && request.headers.get("origin") !== c.origin)
    throw new ApiError(
      403,
      "This request must come from the configured website.",
    );
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
  if (!token) throw new ApiError(401, "Sign in to your account first.");
  const auth = createClient(c.url, c.publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user)
    throw new ApiError(401, "Your session expired. Sign in again.");
  return { user: data.user, db: adminDb() };
}
export async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Send JSON content.");
  // Stream with a bound even when Content-Length is absent or falsified.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Missing request body.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      throw new ApiError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Invalid JSON request.");
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      Vary: "Authorization",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function endpoint(action: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      return await action(request);
    } catch (error) {
      if (error instanceof ApiError)
        return json({ error: error.message }, error.status);
      console.error("Backend request failed", {
        name: error instanceof Error ? error.name : "Unknown",
      });
      return json(
        { error: "The service is temporarily unavailable. Please try again." },
        503,
      );
    }
  };
}
export async function rateLimit(
  db: ReturnType<typeof adminDb>,
  userId: string,
  action: string,
  max: number,
  seconds: number,
) {
  const { data, error } = await db.rpc("take_api_slot", {
    p_user: userId,
    p_action: action,
    p_limit: max,
    p_seconds: seconds,
  });
  if (error)
    throw new ApiError(503, "Backend migration is missing or unavailable.");
  if (!data)
    throw new ApiError(429, "Please wait a moment before trying again.");
}
