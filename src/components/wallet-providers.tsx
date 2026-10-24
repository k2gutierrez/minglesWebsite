"use client";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { apeChain, mainnet, sepolia } from "viem/chains";
import { apeChainCurtis } from "@/lib/web3/chains";
import { wagmiConfig } from "@/lib/web3/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

/**
 * Envuelve SOLO las páginas que necesitan wallet (el portal y la recuperación
 * de CAVA). El sitio público no monta nada de esto a propósito: la web abierta
 * no debe pedir wallet ni cargar el peso de la conexión.
 */
export function WalletProviders({
  children,
  chainId = apeChain.id,
}: {
  children: React.ReactNode;
  /** La rifa puede apuntar a Curtis, Sepolia o Ethereum L1. */
  chainId?: number;
}) {
  const initialChain =
    chainId === 1
      ? mainnet
      : chainId === 11155111
        ? sepolia
        : chainId === apeChainCurtis.id
          ? apeChainCurtis
          : apeChain;
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={initialChain}
          // El sitio está íntegro en inglés; sin esto RainbowKit toma el idioma
          // del navegador y el botón sale en español a media página.
          locale="en-US"
          theme={darkTheme({
            accentColor: "#e15162",
            accentColorForeground: "#ffffff",
            borderRadius: "none",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
