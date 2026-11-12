import type { Metadata } from "next";
import { LegalShell } from "@/components/mudwater/legal-shell";
import { LEGAL, PRIVACY_PATH, TERMS_PATH } from "@/lib/mudwater/legal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — The Last Barrel",
  description:
    "Terms of service for the Mudwater × Mingles website and The Last Barrel game on ApeChain.",
  robots: { index: false, follow: false },
};

export default function TermsOfServicePage() {
  return (
    <LegalShell
      current="service"
      kicker="Mudwater × Mingles · ApeChain"
      title="Terms of Service"
      intro={
        <>
          These terms govern your use of this website and of the game it hosts. They
          are separate from the <Link href={TERMS_PATH}>Official Rules</Link>, which
          govern the promotion itself. Where the two disagree about the promotion, the
          Official Rules prevail.
        </>
      }
    >
      <section id="acceptance">
        <h2>1. Acceptance</h2>
        <p>
          By opening this website, signing in, connecting a wallet or sending a
          transaction through it, you agree to these terms. If you do not agree, do not
          use the service.
        </p>
        <p>
          You must be at least {LEGAL.minAge} years old and legally able to enter into
          this agreement where you live. If you use the service on behalf of an
          organisation, you confirm you are authorised to bind it.
        </p>
      </section>

      <section id="who-we-are">
        <h2>2. Who we are</h2>
        <p>
          The service is operated by {LEGAL.sponsorLegalName}, {LEGAL.sponsorType}{" "}
          registered in Wyoming on {LEGAL.sponsorIncorporated} under registration
          number {LEGAL.sponsorRegistration}, with its registered address at{" "}
          {LEGAL.sponsorAddress} (“we”, “us”, “our”). Day to day operation is carried
          out by {LEGAL.operatorName} ({LEGAL.operatorHandle}).
        </p>
        <p>
          You can reach us at {LEGAL.contactEmail}. For privacy matters, write to{" "}
          {LEGAL.privacyEmail}; for disputes about the promotion, {LEGAL.disputesEmail}.
        </p>
      </section>

      <section id="the-service">
        <h2>3. The service</h2>
        <p>
          The service is a website that reads and writes to a smart contract deployed on
          ApeChain, and to a second contract on a test network. It shows live game state,
          lets you connect a wallet, sign a message, and send transactions that record
          your position in a barrel.
        </p>
        <p>
          We do not provide a wallet, hold your assets, act as a custodian, or execute
          transactions on your behalf. The service is an interface. The chain is the
          record.
        </p>
        <p>
          We may change, suspend or withdraw any part of the service at any time,
          including the interface, without notice. We do not guarantee that any feature
          will remain available.
        </p>
      </section>

      <section id="wallets">
        <h2>4. Wallets, keys and signatures</h2>
        <p>
          You are solely responsible for your wallet, your private keys, your seed phrase
          and every signature you produce. We never ask for a private key or a seed
          phrase, and you should treat any request for one as fraud.
        </p>
        <p>
          Signing a message is free and creates no transaction. It proves that a wallet
          belongs to you. Sending a transaction costs network gas, is broadcast publicly,
          and <strong>cannot be reversed</strong>. Once a transaction is confirmed it
          cannot be undone by us or by anyone else.
        </p>
        <p>
          If you lose access to your wallet, or sign something you did not intend, we
          cannot recover anything. We have no ability to cancel, reverse or modify a
          confirmed transaction.
        </p>
      </section>

      <section id="no-warranty">
        <h2>5. No warranty</h2>
        <p>
          The service is provided “as is” and “as available”. To the fullest extent
          permitted by law, we make no warranty, express or implied, including merchantability,
          fitness for a particular purpose, non-infringement, or that the service will be
          uninterrupted, timely, secure or free of errors.
        </p>
        <p>
          Blockchain networks, wallets, RPC providers, hosting and other infrastructure
          can fail, congest or behave unpredictably. We do not control them and do not
          warrant their behaviour.
        </p>
      </section>

      <section id="acceptable-use">
        <h2>6. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            use bots, scripts or automated accounts to interact with the promotion,
            except to the extent the interface itself is designed to be used;
          </li>
          <li>
            create multiple wallets or accounts to obtain an advantage, or coordinate
            wallets to manipulate a barrel population;
          </li>
          <li>
            attempt to exploit, interfere with, overload, or reverse engineer the service
            or its infrastructure;
          </li>
          <li>
            use the service to break any law, infringe anyone’s rights, or publish
            unlawful, deceptive or harmful content in connection with it;
          </li>
          <li>
            copy, scrape or redistribute the service or its content except as these terms
            allow.
          </li>
        </ul>
        <p>
          We may restrict access or disqualify participation where these rules are
          breached, subject to the Official Rules.
        </p>
      </section>

      <section id="third-parties">
        <h2>7. Third party services</h2>
        <p>
          The service relies on third parties, including X for sign in, Supabase for
          authentication and storage, our hosting provider, ApeChain RPC providers, wallet
          connectors, and the public drand beacon for randomness. Each is governed by its
          own terms and privacy policy, and we are not responsible for their acts or
          omissions.
        </p>
        <p>
          The service is not affiliated with, endorsed by or sponsored by X Corp., the Ape
          Foundation, ApeChain, Yuga Labs or the Bored Ape Yacht Club. All trademarks
          belong to their owners.
        </p>
      </section>

      <section id="content">
        <h2>8. Content and intellectual property</h2>
        <p>
          The Mingles and Mudwater names, marks, artwork and the design of this site
          belong to their respective owners. We grant you a limited, revocable,
          non-exclusive licence to view and use the service for its intended purpose. No
          other rights are granted.
        </p>
        <p>
          You keep ownership of anything you publish. By taking part, you grant us a
          non-exclusive licence to reference your public X handle and posts for the
          purpose of running, documenting and announcing the promotion.
        </p>
      </section>

      <section id="liability">
        <h2>9. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect,
          incidental, special, consequential or punitive damages, or for loss of profit,
          revenue, data, goodwill, digital assets or opportunity, arising out of or
          related to the service.
        </p>
        <p>
          To the same extent, our total aggregate liability arising out of or relating to
          the service is limited to one hundred United States dollars, or the amount you
          paid us to use the service, whichever is greater. You pay us nothing, so
          usually it is the former.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded,
          including for fraud or wilful misconduct.
        </p>
      </section>

      <section id="indemnity">
        <h2>10. Indemnity</h2>
        <p>
          You agree to indemnify and hold harmless the operator, its members, officers
          and contractors from any claim, loss or expense, including reasonable legal
          fees, arising from your use of the service or your breach of these terms.
        </p>
      </section>

      <section id="changes">
        <h2>11. Changes and termination</h2>
        <p>
          We may update these terms by publishing a new version on this page, with the
          updated date at the top. Continued use after a change means you accept the new
          version.
        </p>
        <p>
          We may suspend or terminate access to the service at any time, including where
          we reasonably believe these terms have been breached.
        </p>
      </section>

      <section id="law">
        <h2>12. Governing law and disputes</h2>
        <p>
          These terms are governed by {LEGAL.governingLaw}. The courts of {LEGAL.venue}{" "}
          have exclusive jurisdiction over any dispute arising from them, except where
          mandatory law in your place of residence gives you the right to sue locally.
        </p>
        <p>
          Before starting a claim, write to {LEGAL.disputesEmail} and give us thirty days
          to try to resolve it.
        </p>
      </section>

      <section id="general">
        <h2>13. General</h2>
        <p>
          If any provision is found unenforceable, the rest remains in force. A failure to
          enforce a provision is not a waiver of it. These terms, together with the{" "}
          <Link href={TERMS_PATH}>Official Rules</Link> and the{" "}
          <Link href={PRIVACY_PATH}>Privacy Policy</Link>, are the entire agreement between
          us about the service.
        </p>
        <p>
          You may not assign this agreement. We may assign it to a successor of the
          business or of the assets involved.
        </p>
      </section>

      <section id="contact">
        <h2>14. Contact</h2>
        <p>
          {LEGAL.sponsorLegalName}, {LEGAL.sponsorAddress}. Email {LEGAL.contactEmail}.
        </p>
      </section>
    </LegalShell>
  );
}
