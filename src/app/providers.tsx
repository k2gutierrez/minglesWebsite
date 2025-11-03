"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { glyphConnectorDetails, GlyphProvider, glyphWalletRK, StrategyType, WalletClientType } from "@use-glyph/sdk-react";
import JotaiProviders from "@/components/engine/JotaiProviders";
//import config from "@/rainbowKitConfig";
import { WagmiProvider, createConfig } from "wagmi";
import { Transport, Chain, http } from "viem";
import { apeChain, curtis, anvil } from "wagmi/chains";
import { useState, type ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "@rainbow-me/rainbowkit/styles.css"

export function Providers(props: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    const supportedChains: [Chain, ...Chain[]] = [apeChain, curtis, anvil];

    const connectors = connectorsForWallets(
        [
            {
                groupName: glyphConnectorDetails.name,
                wallets: [glyphWalletRK],
            },
        ],
        {
            appName: glyphConnectorDetails.name,
            projectId: glyphConnectorDetails.id,
        },
    );

    const wagmiConfig = createConfig({
        //appName: "Mingles",
        //projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        chains: supportedChains,
        transports: supportedChains.reduce((acc, chain) => {
            acc[chain.id] = http();
            return acc;
        }, {} as Record<number, Transport>),
        connectors,
    })

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({ accentColor: '#e15162' })}>
                    <GlyphProvider
                        strategy={StrategyType.EIP1193}
                        walletClientType={WalletClientType.RAINBOWKIT}
                        askForSignature={true}
                    >
                        <JotaiProviders>
                            <TonConnectUIProvider 
                                manifestUrl="https://www.mingles.wtf/tonconnect-manifest.json"
                                actionsConfiguration={{
                                    twaReturnUrl: 'http://t.me/MinglesTequilaStickersBot'
                                }}
                            >
                                {props.children}
                            </TonConnectUIProvider>
                        </JotaiProviders>
                    </GlyphProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}