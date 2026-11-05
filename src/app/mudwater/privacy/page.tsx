import type { Metadata } from "next";
import Link from "next/link";
import { Fill, LegalShell } from "@/components/mudwater/legal-shell";
import { LEGAL, TERMS_PATH } from "@/lib/mudwater/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — The Last Barrel",
  description:
    "What data The Last Barrel collects, what becomes public, how long it is kept, and how to exercise your rights.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      current="privacy"
      kicker="Mudwater × Mingles · ApeChain"
      title="Privacy Policy"
      intro={
        <>
          The Last Barrel is a spectator game: part of what you do is meant to be seen.
          This page explains exactly which data we collect, what becomes public by design,
          what never does, and how to ask us to delete it.
        </>
      }
    >
      <section id="controller">
        <h2>1. Who is responsible</h2>
        <p>
          The controller of your personal data is <Fill value={LEGAL.sponsorLegalName} />,
          registered at <Fill value={LEGAL.sponsorAddress} /> (“we”, “us”). For any
          question about this policy or to exercise your rights, write to{" "}
          <Fill value={LEGAL.contactEmail} />.
        </p>
      </section>

      <section id="what-we-collect">
        <h2>2. What we collect</h2>
        <div className="mw-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Where it comes from</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                X numeric account ID, current handle, display name and avatar
              </td>
              <td>X, when you choose “Sign in with X”</td>
              <td>
                Identify you as one player, keep that identity stable if you change your
                handle, and show you in the game feed
              </td>
            </tr>
            <tr>
              <td>ApeChain wallet address and the signature that binds it</td>
              <td>You, when you link a wallet</td>
              <td>Know which wallet plays as you, and enforce one account per wallet</td>
            </tr>
            <tr>
              <td>Links to the posts you declare</td>
              <td>You, when you paste them</td>
              <td>Activate your Barrel Pass and allow manual review later</td>
            </tr>
            <tr>
              <td>
                Game actions: arena, barrel, timestamps, transaction hash
              </td>
              <td>The public ApeChain blockchain</td>
              <td>Run the game, show the live stadium and resolve the draw</td>
            </tr>
            <tr>
              <td>Prize delivery details: Solana address, and a shipping address if the prize is physical</td>
              <td>You, if you win and claim</td>
              <td>Deliver the prize</td>
            </tr>
            <tr>
              <td>Technical data: IP address, user agent, timestamps</td>
              <td>Your browser, through our hosting provider</td>
              <td>Keep the service secure and diagnose errors</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p>
          <strong>What we never collect:</strong> your X password, your private keys or seed
          phrase, your direct messages, or the contents of your timeline. We do not ask for
          permission to read your posts, and we never post on your behalf.
        </p>
      </section>

      <section id="what-is-public">
        <h2>3. What becomes public by design</h2>
        <p>
          This is a spectator game, and that is deliberate. The following is visible to
          anyone visiting the site, without signing in:
        </p>
        <ul>
          <li>your X handle and avatar;</li>
          <li>an abbreviated form of your wallet address, such as <code>0x12ab…39ef</code>;</li>
          <li>the barrels you have entered, and when;</li>
          <li>the number of participants in each barrel.</li>
        </ul>
        <p>
          Never public: your OAuth tokens, your full wallet address on the site interface,
          your IP address, any review evidence, and internal notes.
        </p>
      </section>

      <section id="why">
        <h2>4. Why we use it, and on what basis</h2>
        <ul>
          <li>
            <strong>To run the Promotion</strong> — running the game, showing the stadium,
            resolving the draw. Legal basis: performance of a contract with you.
          </li>
          <li>
            <strong>To verify eligibility and prevent abuse</strong> — checking posts,
            holder status and wallet clustering. Legal basis: our legitimate interest in
            running a fair promotion.
          </li>
          <li>
            <strong>To deliver prizes</strong> — contacting you and transferring the prize.
            Legal basis: performance of a contract.
          </li>
          <li>
            <strong>To comply with law</strong> — accounting, tax and consumer records.
            Legal basis: legal obligation.
          </li>
        </ul>
        <p>
          We do not sell your data, we do not use it for advertising, and we do not build
          profiles for any purpose other than this Promotion.
        </p>
      </section>

      <section id="onchain">
        <h2>5. The blockchain is permanent</h2>
        <aside className="mw-callout">
          <p>
            Your game actions are written to a public blockchain. They are public forever,
            and <strong>we cannot delete or alter them</strong> — not because we refuse,
            but because nobody can.
          </p>
          <p>
            What goes onchain is limited to your wallet address, the arena, the barrel you
            moved to, and a timestamp. No handle, no avatar, no email address and no
            profile data is ever written onchain. If you need to be forgotten entirely,
            note that the wallet link is the only thing connecting your onchain activity to
            your X identity — and that link is stored off-chain and can be deleted.
          </p>
        </aside>
      </section>

      <section id="sharing">
        <h2>6. Who we share it with</h2>
        <p>
          We use a small number of service providers, each of which only receives what it
          needs:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — authentication and database. Stores your X
            identity, wallet link, declared posts and review records.
          </li>
          <li>
            <strong>Vercel</strong> — hosting. Processes standard request data, including
            IP addresses.
          </li>
          <li>
            <strong>An ApeChain RPC provider</strong> — reads and relays onchain
            transactions. Sees the wallet addresses that interact with the game contract.
          </li>
          <li>
            <strong>X</strong> — as the identity provider, when you sign in.
          </li>
          <li>
            <strong>Mudwater</strong> — receives the winner’s details to the extent needed
            to ship a physical prize.
          </li>
        </ul>
        <p>
          We may also disclose data if required by law or to defend a legal claim.
        </p>
      </section>

      <section id="retention">
        <h2>7. How long we keep it</h2>
        <ul>
          <li>
            <strong>Account and gameplay data</strong> — until 90 days after the prizes are
            delivered, then deleted or anonymised.
          </li>
          <li>
            <strong>Declared post links and review evidence</strong> — 90 days after
            delivery, to be able to answer a dispute.
          </li>
          <li>
            <strong>Winner and prize records</strong> — kept longer where accounting or tax
            law requires it.
          </li>
          <li>
            <strong>Server logs</strong> — 30 days.
          </li>
        </ul>
      </section>

      <section id="cookies">
        <h2>8. Cookies and local storage</h2>
        <p>
          We use only what is necessary to keep you signed in and to protect the service.
          There are no advertising cookies and no third-party trackers on this site. If we
          add measurement tools, we will update this policy and ask you first where the law
          requires it.
        </p>
      </section>

      <section id="rights">
        <h2>9. Your rights</h2>
        <p>You can ask us to:</p>
        <ul>
          <li>tell you what data we hold about you, and give you a copy;</li>
          <li>correct data that is wrong;</li>
          <li>delete your data — except what is onchain, which we cannot touch, and what we
            must keep by law;</li>
          <li>restrict or object to certain processing;</li>
          <li>withdraw consent, where we relied on it.</li>
        </ul>
        <p>
          Write to <Fill value={LEGAL.contactEmail} /> from the X account you used, or
          include your handle so we can verify the request. We answer within 30 days. If
          you are not satisfied, you can complain to your local data protection authority.
        </p>
      </section>

      <section id="transfers">
        <h2>10. International transfers</h2>
        <p>
          Our providers may store data outside your country. Where that happens we rely on
          appropriate safeguards, such as standard contractual clauses offered by those
          providers.
        </p>
      </section>

      <section id="security">
        <h2>11. Security</h2>
        <p>
          Data is encrypted in transit. Server-side keys never reach the browser. We never
          ask for, store or transmit a private key or seed phrase, and no one from the team
          will ever ask you for one.
        </p>
      </section>

      <section id="children">
        <h2>12. Children</h2>
        <p>
          The Promotion is for people aged {LEGAL.minAge} and over. We do not knowingly
          collect data from anyone younger. If we discover an account belongs to a minor,
          we delete it and disqualify the entry.
        </p>
      </section>

      <section id="changes">
        <h2>13. Changes to this policy</h2>
        <p>
          If we change this policy, we update the date at the top of the page. Material
          changes affecting participants already taking part will be announced before they
          apply.
        </p>
      </section>

      <section id="contact">
        <h2>14. Contact</h2>
        <p>
          <Fill value={LEGAL.contactEmail} /> — for privacy requests, prize delivery
          questions, or anything on this page. The full rules of the Promotion are in the{" "}
          <Link href={TERMS_PATH}>Official Rules</Link>.
        </p>
      </section>
    </LegalShell>
  );
}
