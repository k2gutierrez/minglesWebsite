import { defineChain, type Chain } from "viem";
import { apeChain, mainnet, sepolia } from "viem/chains";

/**
 * ApeChain Curtis (testnet). Se usa cuando `NEXT_PUBLIC_RAFFLE_CHAIN_ID=33111`
 * para probar la rifa de punta a punta con el contrato vRNG que ya existe.
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

/**
 * Red de la rifa:
 *   1          Ethereum mainnet (Chainlink VRF v2.5)
 *   11155111   Ethereum Sepolia (ensayo del oráculo)
 *   33111      ApeChain Curtis (vRNG, testnet)
 *   33139      ApeChain mainnet (vRNG)
 *
 * Si la variable falta se usa mainnet (1): es mejor mostrar "próximamente" a
 * publicar por accidente la rifa de testnet en producción.
 */
const configuredId = Number(process.env.NEXT_PUBLIC_RAFFLE_CHAIN_ID || 1);

const raffleChains: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
  33111: apeChainCurtis,
  33139: apeChain,
};

export const raffleChain: Chain = raffleChains[configuredId] ?? mainnet;

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
