"use client"

import { getDefaultConfig, connectorsForWallets } from "@rainbow-me/rainbowkit"
import { rainbowWallet, walletConnectWallet, injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { glyphConnectorDetails, GlyphProvider, glyphWalletRK, StrategyType, WalletClientType } from "@use-glyph/sdk-react";
import config from "@/rainbowKitConfig";
import { Transport, Chain, http } from "viem";
import { apeChain, curtis, anvil } from "wagmi/chains"

const supportedChains: [Chain, ...Chain[]] = [apeChain, curtis];

const connectors = connectorsForWallets(
	[	{
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
	}
);

export default getDefaultConfig({
    appName: "Mingles",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [apeChain, curtis, anvil],
    
})
//