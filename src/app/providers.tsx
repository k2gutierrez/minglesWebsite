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
import { useEffect, useState, type ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const projectId = glyphConnectorDetails.id || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const chains: [Chain, ...Chain[]] = [apeChain, curtis]; // anvil

// const connectors = connectorsForWallets(
//     [
//         {
//             groupName: glyphConnectorDetails.name || "Glyph",
//             wallets: [glyphWalletRK],
//         },
//         {
//             groupName: 'Popular',
//             wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, glyphWalletRK, injectedWallet],
//         },
//     ],
//     {
//         appName: "Mingles Dapp",
//         projectId: projectId,
//     },
// );

// const wagmiConfig = createConfig({
//         // appName: "Mingles",
//     // projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
//     chains,
//     transports: chains.reduce((acc, chain) => {
//         acc[chain.id] = http();
//         return acc;
//     }, {} as Record<number, Transport>),
//     connectors,
//     storage: createStorage({
//         storage: cookieStorage,
//     }),
//     ssr: true,
// })

export function Providers(props: { children: ReactNode }) {

    const [wagmiConfig, setWagmiConfig] = useState<any>(null);

    useEffect(() => {
        // 2. Prevent double-initialization: Only run if we have chains AND haven't created the config yet
        if (chains.length === 0 || wagmiConfig) return;

        // 3. Define connectors inside the effect so they are fresh
        const connectors = connectorsForWallets(
            [
                {
                    groupName: glyphConnectorDetails.name || "Glyph",
                    wallets: [glyphWalletRK],
                },
                {
                    groupName: 'Popular',
                    wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, glyphWalletRK, injectedWallet],
                },
            ],
            {
                appName: "Mingles Dapp",
                projectId: projectId,
            },
        );

        // 4. Create the config
        const config = createConfig({
            chains,
            transports: chains.reduce((acc, chain) => {
                acc[chain.id] = http();
                return acc;
            }, {} as Record<number, Transport>),
            connectors,
            storage: createStorage({
                storage: cookieStorage,
            }),
            ssr: true,
        });

        // 5. Save to state to trigger the re-render
        setWagmiConfig(config);

    }, [chains])

    // Wait until the config is generated before rendering providers
    if (!wagmiConfig) return <div>Loading Web3...</div>;

    // const wagmiConfig = useMemo(() => {
    //     if (chains.length === 0) return null;
    //     return createConfig({
    //         chains,
    //         transports: chains.reduce((acc, chain) => {
    //             acc[chain.id] = http();
    //             return acc;
    //         }, {} as Record<number, Transport>),
    //         connectors,
    //         storage: createStorage({
    //             storage: cookieStorage,
    //         }),
    //         ssr: true,
    //     });
    // }, [chains]);

    // if (!wagmiConfig) return <div>Loading chains...</div>;

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={
                    darkTheme({
                        accentColor: '#e15162',
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