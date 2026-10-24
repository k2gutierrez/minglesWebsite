import { redirect } from "next/navigation";
import { Raffle } from "@/components/raffle";
import { WalletProviders } from "@/components/wallet-providers";
import { RAFFLE_PUBLIC } from "@/lib/raffle-visibility";
import { raffleChain } from "@/lib/web3/chains";

export const metadata = {
  title: "ApeFest raffle",
  description:
    "Twenty-five numbers. One sealed BAYC Mudwater TCG booster box signed by Beeple & Figge, plus the full ApeFest kit and a Mingle Tequila NFT.",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!RAFFLE_PUBLIC) redirect("/");

  return (
    <WalletProviders chainId={raffleChain.id}>
      <Raffle />
    </WalletProviders>
  );
}
