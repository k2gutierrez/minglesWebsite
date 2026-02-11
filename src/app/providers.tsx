"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { rainbowWallet, walletConnectWallet, injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { RainbowKitProvider, connectorsForWallets, darkTheme, lightTheme, Theme } from "@rainbow-me/rainbowkit";
import { glyphConnectorDetails, GlyphProvider, glyphWalletRK, StrategyType, WalletClientType } from "@use-glyph/sdk-react";
import JotaiProviders from "@/components/engine/JotaiProviders";
//import config from "@/rainbowKitConfig";
import { WagmiProvider, createConfig, createStorage, cookieStorage } from "wagmi";
import { Transport, Chain, http } from "viem";
import { apeChain, curtis, anvil } from "wagmi/chains";
import { useState, type ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
    // const [queryClient] = useState(() => new QueryClient())

    const supportedChains: [Chain, ...Chain[]] = [apeChain, curtis, anvil];

    const connectors = connectorsForWallets(
        [
            {
                        groupName: 'Recommended',
                        wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, injectedWallet],
                    },
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
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
    })

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={
                    darkTheme({ accentColor: '#e15162',
                    })}>
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