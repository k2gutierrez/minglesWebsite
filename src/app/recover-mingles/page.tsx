import type { Metadata } from "next";
import Link from "next/link";
import { RecoverMingles } from "@/components/recover-mingles";
import { WalletProviders } from "@/components/wallet-providers";
import { CAVA_STAKING_ADDRESS } from "@/lib/web3/staking";

export const metadata: Metadata = {
  title: "Recover staked Mingles",
  description:
    "Mingles staked in the CAVA contract are still yours. Check how many you have and recover them in one transaction. No account or email needed.",
};

/**
 * Página de recuperación de Mingles staked.
 *
 * Existe porque hay 636 Mingles dentro del contrato de staking (verificado en
 * ApeChain) y el contrato solo ofrece una recuperación de emergencia, de todos
 * a la vez. Es una utilidad, no una página de marca: por eso vive fuera del
 * portal y **no exige iniciar sesión**.
 */
export default function RecoverMinglesPage() {
  return (
    <main id="main" className="portal">
      <div className="portal-top">
        <span className="eyebrow">MINGLES / CAVA RECOVERY</span>
        <Link className="portal-link" href="/portal">
          Holder Portal ↗
        </Link>
      </div>

      <div className="portal-content">
        <WalletProviders>
          <RecoverMingles />
        </WalletProviders>

        <section className="wallet-panel">
          <span className="eyebrow">WHAT THIS DOES NOT DO</span>
          <ul className="muted">
            <li>It does not move, sell or transfer your Mingles anywhere.</li>
            <li>It does not ask for your seed phrase or private key — ever.</li>
            <li>
              It does not need an account. The transaction is signed by your own
              wallet and sent to{" "}
              <code>
                {CAVA_STAKING_ADDRESS.slice(0, 8)}…
                {CAVA_STAKING_ADDRESS.slice(-6)}
              </code>
              .
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
