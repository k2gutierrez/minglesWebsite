/**
 * "Sign in with X" — OAuth 2.0 through Supabase.
 *
 * The Client ID and Client Secret do NOT live in this app. They are pasted into
 * the Supabase dashboard (Authentication → Sign In / Providers → X). This module
 * only starts the browser redirect; everything else is Supabase + X.
 *
 * What we ask X for: `users.read` and nothing else. We never request write
 * access, so we can never post as the player.
 */

import { getSupabase } from "@/lib/supabase";

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "error"; message?: string };

/** True when the Supabase project is wired up in this build. */
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/**
 * Starts the OAuth flow. On success the browser leaves the page, so the promise
 * resolving with `ok: true` only means "the redirect was issued".
 */
export async function signInWithX(): Promise<SignInResult> {
  const supabase = getSupabase();

  if (!supabase) {
    return { ok: false, reason: "unconfigured" };
  }

  const redirectTo = `${window.location.origin}/mudwater`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "x",
    options: {
      redirectTo,
      scopes: "users.read",
    },
  });

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}
