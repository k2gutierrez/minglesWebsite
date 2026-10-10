import { Portal } from "@/components/portal";
import { WalletProviders } from "@/components/wallet-providers";

export const metadata = { title: "Holder portal" };

export default function Page() {
  // El portal es la única parte del sitio (junto con la recuperación de CAVA)
  // que monta la conexión de wallets. La web pública no la carga.
  return (
    <WalletProviders>
      <Portal />
    </WalletProviders>
  );
}
