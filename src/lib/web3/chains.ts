import { defineChain, type Chain } from "viem";
import { apeChain } from "viem/chains";

/**
 * ApeChain Curtis (testnet). Se usa cuando `NEXT_PUBLIC_RAFFLE_CHAIN_ID=33111`
 * para probar la rifa de punta a punta antes de mainnet.
 */
export const apeChainCurtis = defineChain({
  id: 33111,
  name: "ApeChain Curtis",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://curtis.rpc.caldera.xyz/http",
        "https://rpc.curtis.apechain.com/",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Curtis ApeScan", url: "https://curtis.apescan.io" },
  },
  testnet: true,
});

const configuredId = Number(process.env.NEXT_PUBLIC_RAFFLE_CHAIN_ID || 33139);

/** Red donde vive el contrato de la rifa. Mainnet por defecto. */
export const raffleChain: Chain =
  configuredId === apeChainCurtis.id ? apeChainCurtis : apeChain;

/** RPC del navegador para la red de la rifa (nunca una llave privada). */
export const raffleRpcUrl =
  process.env.NEXT_PUBLIC_RAFFLE_RPC_URL ||
  (raffleChain.id === apeChainCurtis.id
    ? "https://curtis.rpc.caldera.xyz/http"
    : undefined);
