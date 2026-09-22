"use client";
import { useState, useEffect } from "react";
import {
  Fingerprint,
  Grid2X2,
  Layers,
  Activity,
  Wallet,
  Settings,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useSite } from "./provider";
import { Status, Button, ArrowLink } from "./ui";
import { useHolder, WalletPanel } from "./wallet-panel";
import { ArtLineage } from "./section-page";
import { Experiments } from "./home";
const tabs = [
  ["Overview", Grid2X2],
  ["My Mingles", Layers],
  ["Experiments", Activity],
  ["Activation", Fingerprint],
  ["Distributions", Wallet],
  ["Account", Settings],
] as const;
export function Portal() {
  const [tab, setTab] = useState("Overview");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const holder = useHolder(user);
  const authReady = !!holder.config?.authConfigured;
  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    db.auth.getUser().then(({ data }) => setUser(data.user?.email || null));
    const { data } = db.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user.email || null),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    const db = getSupabase();
    if (!db) {
      setMessage(
        "Account sign-in opens when the secure account service is connected.",
      );
      return;
    }
    setBusy(true);
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    });
    setMessage(
      error ? error.message : "Check your email for your secure sign-in link.",
    );
    setBusy(false);
  }
  return (
    <main id="main" className="portal">
      <div className="portal-top">
        <span className="eyebrow">MINGLES / HOLDER PORTAL</span>
        <Status>{user ? "Account connected" : "Not connected"}</Status>
      </div>
      <div className="portal-grid">
        <aside className="portal-sidebar">
          <div className="portal-emblem">
            <Fingerprint size={55} strokeWidth={1} />
            <span>
              YOUR CORNER
              <br />
              OF THE WEIRD.
            </span>
          </div>
          <nav aria-label="Holder navigation">
            {tabs.map(([t, Icon]) => (
              <button
                aria-current={tab === t ? "page" : undefined}
                onClick={() => setTab(t)}
                key={t}
              >
                <Icon size={17} />
                {t}
                <span>↗</span>
              </button>
            ))}
          </nav>
          <small>
            ACTIVATION SYSTEM
            <br />
            <span className="coral">BUILDING / NOT LIVE</span>
          </small>
        </aside>
        <div className="portal-content">
          <span className="eyebrow">{tab.toUpperCase()}</span>
          <h1>
            {tab === "Overview"
              ? "YOUR MINGLES.\nYOUR STATE."
              : tab.toUpperCase()}
          </h1>
          {(tab === "Overview" || tab === "Account") && (
            <div className="account-card">
              <div>
                <Mail size={27} />
                <h2>
                  {user
                    ? "Welcome to your account."
                    : "Your next chapter starts here."}
                </h2>
                <p>
                  {user
                    ? user
                    : "Sign in to your account, then link a wallet and verify your Mingles on ApeChain."}
                </p>
              </div>
              {user ? (
                <button
                  className="button"
                  onClick={async () => {
                    await getSupabase()?.auth.signOut();
                    setUser(null);
                  }}
                >
                  Sign out
                </button>
              ) : (
                <form onSubmit={login}>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    className="button button-coral"
                    disabled={busy || !authReady}
                  >
                    {busy
                      ? "Sending…"
                      : authReady
                        ? "Send sign-in link"
                        : "Sign-in coming soon"}
                    <ArrowUpRight size={17} />
                  </button>
                  <small>No wallet transaction required.</small>
                </form>
              )}
              <p role="status">{message}</p>
            </div>
          )}
          {["Overview", "My Mingles", "Account"].includes(tab) && (
            <WalletPanel
              holder={holder}
              user={user}
              showTokens={tab === "My Mingles"}
            />
          )}
          {tab === "Overview" && (
            <>
              <div className="portal-stats">
                <article>
                  <span className="eyebrow">MY MINGLES</span>
                  <strong>
                    {holder.data.holdings.length
                      ? new Set(
                          holder.data.holdings.flatMap((h) => h.tokenIds),
                        ).size.toString()
                      : "—"}
                  </strong>
                  <p>
                    {holder.data.holdings.length
                      ? "Verified snapshots · see timestamps above"
                      : "Ownership not verified"}
                  </p>
                </article>
                <article>
                  <span className="eyebrow">ACTIVATION</span>
                  <strong>Building</strong>
                  <p>Not available yet</p>
                </article>
                <article>
                  <span className="eyebrow">DISTRIBUTIONS</span>
                  <strong>Not live</strong>
                  <p>No distributions published</p>
                </article>
              </div>
              <div className="portal-panel">
                <Status>Next action</Status>
                <h2>FOLLOW THE EVOLUTION.</h2>
                <p>
                  Explore the new art direction and the systems taking shape
                  around Mingles.
                </p>
                <ArrowLink href="/art">Explore the art</ArrowLink>
              </div>
            </>
          )}
          {tab === "Experiments" && <Experiments />}
          {tab === "Activation" && (
            <div className="portal-panel">
              <Fingerprint size={65} strokeWidth={1} />
              <h2>OWN. OPT IN. PARTICIPATE.</h2>
              <p>
                Activation is the future eligibility layer. The system will
                explain its rules, source, period, and conditions before asking
                you to act.
              </p>
              <Status>Not available yet</Status>
              <div className="detail-list">
                {[
                  "Verified ownership",
                  "Published rules",
                  "Explicit opt-in",
                  "Transparent records",
                ].map((v, i) => (
                  <div key={v}>
                    <span>0{i + 1}</span>
                    <h3>{v}</h3>
                  </div>
                ))}
              </div>
              <Button href="/build-the-distillery">
                Understand the vision
              </Button>
            </div>
          )}
          {tab === "Distributions" && (
            <div className="portal-panel">
              <Wallet size={45} />
              <h2>REAL RECORDS. WHEN THEY EXIST.</h2>
              <p>
                No distributions are live. When approved systems distribute
                value, records will show the source, period, amount, and status
                here.
              </p>
              <div className="distribution-head">
                <span>Source</span>
                <span>Period</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <p className="muted">No records to display.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
