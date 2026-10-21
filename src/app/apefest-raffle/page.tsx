import { Raffle } from "@/components/raffle";
import { WalletProviders } from "@/components/wallet-providers";
import { raffleChain } from "@/lib/web3/chains";

export const metadata = {
  title: "ApeFest raffle",
  description:
    "Twenty-five numbers. One sealed BAYC Mudwater TCG booster box signed by Beeple & Figge, plus the full ApeFest kit and a Mingle Tequila NFT.",
};

export default function Page() {
  return (
    <WalletProviders chainId={raffleChain.id}>
      <Raffle />
    </WalletProviders>
  );
}
