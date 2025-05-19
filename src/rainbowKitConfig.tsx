"use client"

import { getDefaultConfig, connectorsForWallets } from "@rainbow-me/rainbowkit"
import { glyphConnectorDetails, GlyphProvider, glyphWalletRK, StrategyType } from "@use-glyph/sdk-react";
import config from "@/rainbowKitConfig";
import { Transport, Chain, http } from "viem";
import { apeChain, curtis, anvil } from "wagmi/chains"

const supportedChains: [Chain, ...Chain[]] = [apeChain, curtis];



export default getDefaultConfig({
    appName: "Mingles",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [apeChain, curtis, anvil],
    
})