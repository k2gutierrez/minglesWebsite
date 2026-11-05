import type { Metadata } from "next";
import Link from "next/link";
import { SignInButton } from "@/components/mudwater/sign-in-button";
import { WalletProviders } from "@/components/wallet-providers";
import { Stadium } from "@/components/mudwater/stadium";
import { getStadiumSnapshot } from "@/lib/mudwater/stadium";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mingles.wtf";

const TITLE = "The Last Barrel";
const DESCRIPTION =
  "Mudwater × Mingles. Two arenas, three barrels each, forty-eight hours on ApeChain. The least populated barrel wins, and a published draw decides who takes the pack.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  // The share cards in X read these. Without metadataBase the image URL would
  // be relative and X would drop the preview.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/mudwater",
    siteName: "Mingles",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: false, follow: false },
};

const STEPS = [
  {
    label: "01",
    title: "Sign in with X",
    body: "One X account per player. We keep the stable account ID, not just the handle, so a rename never breaks your entry.",
  },
  {
    label: "02",
    title: "Bind a wallet",
    body: "Sign a message to link one ApeChain wallet to that account. No gas, no transaction, one wallet for the whole event.",
  },
  {
    label: "03",
    title: "Declare a post",
    body: "Pick card A, B or C, post it from your own account and paste the link. One post buys 24 hours of movement; a second one covers the full 48.",
  },
  {
    label: "04",
    title: "Enter and move",
    body: "One transaction per move, five minutes of cooldown per arena. Bluff as much as you like — the chain does not.",
  },
];

const FACTS = [
  ["48H", "One finite game"],
  ["02", "Independent arenas"],
  ["03", "Barrels per arena"],
  ["05M", "Cooldown per arena"],
  ["02", "Mudwater packs"],
];

export default function MudwaterPage() {
  const snapshot = getStadiumSnapshot();
  const isOpen = snapshot.phase === "open";
  const live = Boolean(process.env.MUDWATER_CONTRACT_ADDRESS);
  const chainId = Number(process.env.MUDWATER_CHAIN_ID ?? 33139);

  return (
    <main id="main" className="mw-page">
      <div className="mw-shell">
        <section className="mw-hero">
          <div className="mw-lockup">
            <img
              src="/mudwater/logo.svg"
              alt="Mudwater"
              width={864}
              height={139}
            />
            <span>
              × Mingles
              <br />
              ApeChain · 48 h
            </span>
          </div>

          <div className="mw-hero-grid">
            <h1 className="mw-title">
              The Last
              <br />
              Barrel
            </h1>

            <div className="mw-hero-side">
              <p className="mw-sub">
                Two arenas. Three barrels each. Forty-eight hours. The{" "}
                <em>emptiest barrel wins</em> — so the only move that pays is the
                one nobody expects.
              </p>

              <div className="mw-actions">
                {!live && <SignInButton enabled={isOpen} />}
                <a className="mw-button mw-button-ghost" href="#how">
                  How it works
                </a>
              </div>

              {!isOpen && (
                <p className="mw-preview-note">
                  Preview build · account flow and onchain moves ship with the
                  contract
                </p>
              )}
            </div>
          </div>

          <ul className="mw-facts">
            {FACTS.map(([value, label]) => (
              <li key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mw-shell">
        <WalletProviders chainId={chainId}>
          <Stadium snapshot={snapshot} live={live} />
        </WalletProviders>
      </div>

      <div className="mw-shell">
        <section className="mw-prize" aria-label="The prize">
          <div className="mw-prize-art">
            <img
              className="mw-pack"
              src="/mudwater/pack.webp"
              alt="A sealed Mudwater pack, black with gold Bored Ape Yacht Club artwork"
              width={561}
              height={903}
            />
          </div>
          <div>
            <p className="mw-eyebrow">The prize</p>
            <h2>
              One pack.
              <br />
              Per arena.
            </h2>
            <p className="mw-prize-text">
              Two Mudwater packs sit at the end of this: one for the Mingles
              Holders arena, one for the Open Swamp. They are won separately,
              and the same wallet can take both.
            </p>
            <div className="mw-seal">
              <img src="/mudwater/crest.svg" alt="" width={445} height={441} />
              <p>
                2 packs · 2 arenas
                <br />
                Delivered after manual review
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mw-shell">
        <section className="mw-section" id="how">
          <div className="mw-section-head">
            <h2>From login to the last move</h2>
            <p>
              Four steps, one wallet, no entry fee. Every entry and every change
              of barrel is a confirmed ApeChain transaction.
            </p>
          </div>
          <ol className="mw-steps">
            {STEPS.map((step) => (
              <li key={step.label}>
                <b>{step.label}</b>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mw-shell">
        <section className="mw-section">
          <div className="mw-section-head">
            <h2>How it ends</h2>
            <p>
              Two arenas, two winners, one published draw. The same wallet can
              take both packs.
            </p>
          </div>

          <div className="mw-notes">
            <div>
              <h3>The winning barrel</h3>
              <p>
                At the deadline each arena resolves on its own. The least
                populated barrel that is not empty qualifies; empty barrels
                never win. A tie between two qualifying barrels sends both
                crowds into a single draw.
              </p>
            </div>
            <div>
              <h3>The draw</h3>
              <p>
                A public random round is committed before the game opens. It
                produces one fixed order per arena — no rerolls, no redraw after
                a disqualification. The top five go public; the rest of the
                order stays on record.
              </p>
            </div>
            <div>
              <h3>The review</h3>
              <p>
                Declared posts and wallets are checked by hand before a pack
                moves. Posts must stay public until the prize is awarded. A
                rejection only passes the chance down the fixed order; it never
                rewrites the numbers from the close.
              </p>
            </div>
          </div>

          <p className="mw-legal-links">
            <Link href="/mudwater/terms">Official rules</Link>
            <span>·</span>
            <Link href="/mudwater/privacy">Privacy policy</Link>
          </p>

          <p className="mw-legal">
            Not affiliated with X Corp. Gas only: there is no entry fee, no
            protocol fee and no wager. Eligibility, jurisdictions and full
            promotion terms apply. The Mingles Holders arena requires at least
            one eligible Mingles NFT at the moment of close. Randomness is
            served by a public drand round published in advance.
          </p>
        </section>
      </div>
    </main>
  );
}
