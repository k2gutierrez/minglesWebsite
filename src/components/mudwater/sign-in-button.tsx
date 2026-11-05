"use client";

import { useState } from "react";
import { signInWithX } from "@/lib/mudwater/auth";

/**
 * Starts the X OAuth flow. The button stays disabled until the event phase is
 * `open`, so a preview build can never send someone into a half-configured
 * login.
 */
export function SignInButton({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setMessage(null);

    const result = await signInWithX();

    if (result.ok) {
      // The browser is being redirected to X; keep the pending state.
      return;
    }

    setPending(false);
    setMessage(
      result.reason === "unconfigured"
        ? "Sign-in is not connected on this build yet."
        : (result.message ?? "Could not start the sign-in. Try again."),
    );
  }

  return (
    <>
      <button
        className="mw-button"
        type="button"
        disabled={!enabled || pending}
        onClick={onClick}
      >
        {pending ? "Opening X…" : "Sign in with X"}
      </button>
      {message && (
        <p className="mw-auth-error" role="status">
          {message}
        </p>
      )}
    </>
  );
}
