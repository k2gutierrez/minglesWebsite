import type { Metadata } from "next";
import { Fill, LegalShell } from "@/components/mudwater/legal-shell";
import { LEGAL, PRIVACY_PATH } from "@/lib/mudwater/legal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Official Rules — The Last Barrel",
  description:
    "Official rules of The Last Barrel, a 48-hour Mudwater × Mingles promotion on ApeChain.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalShell
      current="terms"
      kicker="Mudwater × Mingles · ApeChain"
      title="Official Rules"
      intro={
        <>
          The Last Barrel is a forty-eight hour social game played on ApeChain. These
          rules govern how it works, how the winner of each arena is chosen, and what
          happens between the close of play and the delivery of the prize.
        </>
      }
    >
      <section id="the-promotion">
        <h2>1. The promotion</h2>
        <p>
          The Last Barrel (the “Promotion”) is organised by{" "}
          <Fill value={LEGAL.sponsorLegalName} />, {LEGAL.sponsorType} registered in
          Wyoming on {LEGAL.sponsorIncorporated} under registration number{" "}
          {LEGAL.sponsorRegistration} (“the Organiser”, “we”, “us”), whose registered
          address is <Fill value={LEGAL.sponsorAddress} />. Its president is{" "}
          {LEGAL.sponsorPresident}. Mudwater supplies the prizes.
        </p>
        <p>
          Day to day operation of the Promotion, including verification and delivery of
          the prize, is carried out by {LEGAL.operatorName} ({LEGAL.operatorHandle}) on
          behalf of the Organiser.
        </p>
        <p>
          The Promotion is not sponsored, endorsed, administered by, or associated with X
          Corp., the Ape Foundation, ApeChain, Yuga Labs or the Bored Ape Yacht Club. All
          trademarks remain the property of their owners.
        </p>
        <p>
          By signing in, binding a wallet or entering a barrel you accept these Official
          Rules in full. If you do not accept them, do not take part.
        </p>
      </section>

      <section id="eligibility">
        <h2>2. Eligibility</h2>
        <p>To take part you must:</p>
        <ul>
          <li>
            be at least <strong>{LEGAL.minAge} years old</strong> and have full legal
            capacity in your place of residence;
          </li>
          <li>
            not be a resident of a jurisdiction where the Promotion is unlawful, as set
            out in section 2.1;
          </li>
          <li>
            hold one real, active X account that you control. Accounts created to enter,
            automated accounts, and coordinated groups of accounts are not eligible;
          </li>
          <li>
            link exactly one ApeChain wallet to that account, and that wallet to no other
            account, for the duration of the Promotion;
          </li>
          <li>
            for the Mingles Arena, hold at least one Mingles NFT at the moment of each
            move. The game contract checks the balance itself on every entry and every
            change of barrel, so the arena is closed to a wallet holding none. The
            collection is{" "}
            <a href={LEGAL.collectionExplorer} target="_blank" rel="noopener noreferrer">
              {LEGAL.collection}
            </a>{" "}
            on ApeChain;
          </li>
          <li>
            not be an employee, contractor or immediate family member of the Organiser or
            of Mudwater.
          </li>
        </ul>
        <p>
          Entering more than once through multiple X accounts, multiple wallets controlled
          by the same person, or any other attempt to obtain more than one entry is void.
          We may disqualify every entry involved.
        </p>
        <h3 id="eligibility-jurisdictions">2.1 Excluded jurisdictions</h3>
        <p>
          The Promotion is void where prohibited or restricted by law, including{" "}
          <Fill value={LEGAL.excludedJurisdictions} />. It is your responsibility to
          ensure that taking part is lawful where you live.
        </p>
      </section>

      <section id="no-purchase">
        <h2>3. No purchase necessary</h2>
        <p>
          There is no entry fee, no wager and no protocol fee. You pay only the network gas
          required by ApeChain to confirm your own transactions. Gas is paid to the
          network, not to us, and is not a purchase of anything.
        </p>

      </section>

      <section id="how-to-enter">
        <h2>4. How to take part</h2>
        <ul>
          <li>
            <strong>Sign in with X.</strong> We store your stable numeric account ID and
            your current handle. Typing a username into a box does not qualify.
          </li>
          <li>
            <strong>Bind a wallet.</strong> Sign a message with your ApeChain wallet. This
            costs no gas and creates no transaction.
          </li>
          <li>
            <strong>Share a post.</strong> The site prepares a post for you and opens X
            with the text ready. Publish it from your own account and confirm. One post is
            enough for the whole Promotion. We do not read your posts automatically; we
            check them manually at review, and a post that is no longer public at that
            point makes you ineligible.
          </li>
          <li>
            <strong>Enter a barrel.</strong> Enter or change barrel with a confirmed
            ApeChain transaction. You pay the network fee for your own moves. There is a
            five-minute cooldown per arena between your own barrel actions, and no limit
            on how many times you move.
          </li>
        </ul>
        <p>
          Your entry exists only once your transaction is <strong>confirmed</strong> on
          the network. A transaction that is submitted but not confirmed by the closing
          time does not count, and we cannot manually include it.
        </p>
      </section>

      <section id="game-window">
        <h2>5. Game window</h2>
        <p>
          The Promotion opens on <Fill value={LEGAL.startAt} /> UTC and closes on{" "}
          <Fill value={LEGAL.closeAt} /> UTC, which is{" "}
          {LEGAL.startAtLocal} to {LEGAL.closeAtLocal} in Mexico City time (UTC-6). All
          times are stated in UTC; no other timezone is authoritative.
        </p>
        <p>
          There is no lockout period at the end. Any transaction confirmed before the
          closing time counts, including one confirmed in the final minute.
        </p>
      </section>

      <section id="winner">
        <h2>6. How the winner is determined</h2>
        <p>
          At the close, each arena is resolved separately, using the onchain state
          confirmed as of the closing time.
        </p>
        <ul>
          <li>
            The qualifying barrel is the one with the fewest participants among barrels
            that have at least one. A barrel with nobody in it never qualifies.
          </li>
          <li>
            If two or three barrels tie for the fewest participants, their participants
            form a single draw for that arena.
          </li>
          <li>
            Participant counts and the qualifying barrel are fixed at the close. A later
            disqualification does not retrospectively change them.
          </li>
        </ul>
        <p>
          The winner is chosen from the qualifying barrel by a public random draw. The
          randomness source is a future <strong>drand</strong> round, named publicly before
          the Promotion opens, and the method is deterministic and published. The draw
          produces one fixed order per arena without replacement. The order is kept on
          record and is reproducible by anyone from the published random round and the
          public chain history.
        </p>
        <p>
          The first position is verified first. If it does not qualify under section 7,
          the opportunity passes to the second, then the third, and so on down the same
          fixed order. The draw is never repeated with a new seed.
        </p>
      </section>

      <section id="verification">
        <h2>7. Verification and disqualification</h2>
        <p>
          Candidates are reviewed by hand before any prize is delivered. The review checks
          that the X account is genuine and still accessible; that the declared posts are
          still public and match what was declared; that the holder requirement is met at
          the close for the Holders arena; and that the wallet is not part of a
          coordinated cluster of wallets used to manipulate a barrel population.
        </p>
        <p>
          A candidate has <strong>24 hours</strong> from notification to respond. If a
          candidate does not respond, cannot show the required post or NFT, or is found to
          have breached these rules, they are disqualified and the next position in the
          fixed order is reviewed. Disqualifications are recorded with a reason, and the
          reason is available to the person concerned on request.
        </p>
        <p>
          The review is documented at the Organiser's discretion, including by
          livestream. No list published during that review is an announcement of a
          winner; only the Organiser's final statement is.
        </p>
      </section>

      <section id="prize">
        <h2>8. The prize</h2>
        <p>
          One prize is awarded per arena: two prizes in total. Each prize is{" "}
          <Fill value={LEGAL.prizeDescription} />.
        </p>
        <p>
          <Fill value={LEGAL.prizeArv} />. Each prize is a digital collectible, not a
          bottle or any other physical good, and it carries no right to any alcoholic
          product.
          A prize is personal to the winner, cannot be exchanged for cash, and cannot be
          transferred. If a prize becomes unavailable for reasons outside our control, we
          may substitute it with one of equal or greater value.
        </p>
        <p>
          The same person may win both arenas. Any tax or duty arising from receiving a
          prize is the winner’s responsibility.
        </p>
      </section>

      <section id="claiming">
        <h2>9. Claiming and delivery</h2>
        <p>
          We contact candidates from the official Mingles account. To claim, you must
          reply within {LEGAL.claimHours} hours with a Solana wallet address able to
          receive the prize. The Organiser then transfers the prize from{" "}
          {LEGAL.deliveryWallet} within {LEGAL.deliveryHours} hours of validating that
          address.
        </p>
        <p>
          If a candidate does not claim within the window, or gives an address that
          cannot receive the prize, the opportunity passes down the fixed order. If no candidate in the order qualifies or claims, the prize is
          declared un-awarded and its treatment is published.
        </p>
      </section>

      <section id="publicity">
        <h2>10. Publicity</h2>
        <p>
          By taking part you agree that, if you win, we may publish your X handle, your
          avatar and an abbreviated form of your wallet address in results and promotional
          posts about the Promotion. We will not publish any other personal data about you
          without your consent.
        </p>
      </section>

      <section id="privacy">
        <h2>11. Personal data</h2>
        <p>
          We process personal data to run the Promotion. What we collect, why, how long we
          keep it and what becomes public is set out in the{" "}
          <Link href={PRIVACY_PATH}>Privacy Policy</Link>, which forms part of these rules.
        </p>
      </section>

      <section id="liability">
        <h2>12. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, the Organiser is not liable for losses
          arising from network congestion, failed, delayed or reverted transactions, wallet
          or key management errors, outages of X, ApeChain, RPC providers or hosting
          providers, or any event outside our reasonable control.
        </p>
        <p>
          Nothing in these rules excludes or limits liability that cannot lawfully be
          excluded, including for death, personal injury or fraud.
        </p>
      </section>

      <section id="cancellation">
        <h2>13. Cancellation and changes</h2>
        <p>
          We may suspend, modify or cancel the Promotion if fraud, technical failure or a
          legal requirement makes it necessary. If we cancel before a winner is determined,
          the prize is not awarded and we will publish how it will be handled. We will not
          change these rules in a way that disadvantages participants after they have
          entered.
        </p>
      </section>

      <section id="disputes">
        <h2>14. Governing law and disputes</h2>
        <p>
          These rules are governed by the laws of <Fill value={LEGAL.governingLaw} />. The
          courts of <Fill value={LEGAL.venue} /> have exclusive jurisdiction over any
          dispute, without prejudice to any mandatory consumer protection rights you may
          have where you live.
        </p>
      </section>

      <section id="general">
        <h2>15. General</h2>
        <p>
          If any provision is held invalid, the rest remain in force. A failure to enforce
          a provision is not a waiver of it. These rules and the Privacy Policy are the
          entire agreement between you and us about the Promotion. This English version
          controls. No third party has rights under these rules.
        </p>
      </section>

      <section id="contact">
        <h2>16. Contact</h2>
        <p>
          Questions about the Promotion, or a request for the list of winners, can be sent
          to <Fill value={LEGAL.contactEmail} />. The list of winners is available for 30
          days after the prizes are delivered.
        </p>
      </section>
    </LegalShell>
  );
}
