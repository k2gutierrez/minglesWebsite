"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { glyphConnectorDetails, GlyphProvider, glyphWalletRK, StrategyType } from "@use-glyph/sdk-react";
import JotaiProviders from "@/components/engine/JotaiProviders";
import config from "@/rainbowKitConfig";
import { WagmiProvider } from "wagmi";
import { useState, type ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css"

export function Providers(props: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({ accentColor: '#e15162' })}>
                    <JotaiProviders>
                        {props.children}
                    </JotaiProviders>
                </RainbowKitProvider>
            </QueryClientProvider>

        </WagmiProvider>
    )
}