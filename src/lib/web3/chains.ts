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

/**
 * RPCs del navegador para la red de la rifa, en orden de preferencia. Si el
 * primero falla (por ejemplo, una llave de Alchemy sin cuota), viem prueba el
 * siguiente. Nunca se usa una llave privada aquí.
 */
export const raffleRpcUrls = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_RAFFLE_RPC_URL,
      ...raffleChain.rpcUrls.default.http,
    ].filter((url): url is string => Boolean(url)),
  ),
);

export const raffleRpcUrl = raffleRpcUrls[0];
