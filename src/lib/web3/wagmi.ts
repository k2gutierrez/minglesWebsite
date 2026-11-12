"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { fallback, http } from "wagmi";
import { apeChain } from "viem/chains";
import { apeChainCurtis } from "./chains";
import { raffleChain, raffleRpcUrls } from "./chains";

/**
 * Configuración de conexión de wallets.
 *
 * Antes esto estaba hecho a mano con EIP-6963 y solo funcionaba con wallets
 * inyectadas en escritorio (sin QR, sin móvil). RainbowKit añade el modal de
 * conexión y WalletConnect, y por fin usa el projectId que ya estaba puesto.
 *
 * Decisiones:
 *  - **ApeChain siempre; la red de la rifa además.** El portal vive en ApeChain,
 *    pero la rifa puede apuntar a Curtis, Sepolia o Ethereum L1. Solo se añade
 *    la red de la rifa cuando es distinta de ApeChain.
 *  - **El RPC del navegador es el público, no el de Alchemy.** La llave de
 *    Alchemy solo puede vivir en el servidor: si el navegador la usara, se
 *    publicaría y cualquiera gastaría la cuota. Las lecturas pesadas del
 *    portal pasan por nuestro servidor, que sí usa el RPC dedicado.
 */
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID &&
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.length > 0
    ? process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    : "mingles-dev-placeholder";

/**
 * Every chain the wallet may need: ApeChain, Curtis for testing, and the raffle
 * chain when it is a different one. Listing both game networks means a wrong
 * MUDWATER_CHAIN_ID shows a switch button instead of a silent mismatch.
 */
const extra: Chain[] = [];
if (raffleChain.id !== apeChain.id && raffleChain.id !== apeChainCurtis.id) {
  extra.push(raffleChain);
}
const walletChains = [apeChain, apeChainCurtis, ...extra] as readonly [
  Chain,
  ...Chain[],
];

export const wagmiConfig = getDefaultConfig({
  appName: "Mingles",
  appDescription: "Collectible identity. Real-world spirit.",
  projectId,
  // Curtis solo se añade cuando la rifa apunta a testnet; el resto del sitio
  // sigue viviendo en ApeChain mainnet.
  chains: walletChains,
  transports: {
    [apeChain.id]: http(),
    ...(raffleChain.id === apeChain.id
      ? {}
      : {
          [raffleChain.id]: fallback(
            raffleRpcUrls.map((url) => http(url, { timeout: 10_000 })),
          ),
        }),
  },
  ssr: true,
});

/** `true` cuando hay un projectId real: sin él no hay QR de WalletConnect. */
export const walletConnectEnabled =
  projectId !== "mingles-dev-placeholder";
