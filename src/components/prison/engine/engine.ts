
import { mingleABI } from "../abis/mingleABI";
import { gameABI } from "../abis/gameABI";
import { parseEther } from "viem";
import { useWriteContract, useConfig, useChainId, useReadContract } from "wagmi";
import { waitForTransactionReceipt, readContract } from "@wagmi/core";
import { MinglesGame, MinglesGameCurtis, MinglesAddress } from "@/components/engine/CONSTANTS";
import { MinglesABI } from "@/components/engine/MinglesABI";

export function GameAddressAccordingToChain(chainId: number) {
    let gameAddress;
    if (chainId == 33111) {
        gameAddress = MinglesGameCurtis
    } else {
        gameAddress = MinglesGame
    }
    return gameAddress as `0x${string}`
}

export async function SignContinue(_nft: number, _collection: `0x${string}`, _value: number, chainId: number) {
    if (_nft == null) return false

    let MinglesGameAddress: `0x${string}`
    if (chainId == 33111) {
        MinglesGameAddress = MinglesGameCurtis
    } else {
        MinglesGameAddress = MinglesGame
    }

    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const config = useConfig()
    const value = _value;
    const startingLocation: string = "patio"

    try {
        const approvalHash = await writeContractAsync({
            abi: gameABI,
            address: MinglesGameAddress as `0x${string}`,
            functionName: "registerOrContinue",
            args: [_nft, startingLocation, _collection],
            value: parseEther(value.toString())
        })

        const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
        })

        if (approvalHash) {
            return true
        } else {
            return false
        }

    } catch (e) {
        console.error(e)
    }
}

export async function Choice(_nft: number, _location: string, _collection: `0x${string}`, _num: number, chainId: number) {
    if (_nft == null) return false

    let MinglesGameAddress: `0x${string}`
    if (chainId == 33111) {
        MinglesGameAddress = MinglesGameCurtis
    } else {
        MinglesGameAddress = MinglesGame
    }

    const location = _location

    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const config = useConfig()
    try {
        const approvalHash = await writeContractAsync({
            abi: gameABI,
            address: MinglesGameAddress as `0x${string}`,
            functionName: "choice",
            args: [_nft, location, _collection, _num]
        })

        const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
        })

        if (approvalHash) {
            return true
        } else {
            return false
        }

    } catch (e) {
        console.error(e)
    }
}

export async function EscapeChoice(_nft: number, _location: string, _collection: `0x${string}`) {
    if (_nft == null) return false

    const chainId = useChainId();
    let MinglesGameAddress: `0x${string}`
    if (chainId == 33111) {
        MinglesGameAddress = MinglesGameCurtis
    } else {
        MinglesGameAddress = MinglesGame
    }

    const location = _location

    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const config = useConfig()
    try {
        const approvalHash = await writeContractAsync({
            abi: gameABI,
            address: MinglesGameAddress as `0x${string}`,
            functionName: "escapeChoice",
            args: [_nft, location, _collection]
        })

        const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
        })

        if (approvalHash) {
            return true
        } else {
            return false
        }

    } catch (e) {
        console.error(e)
    }
}

export async function GetUser(_nft: number, _collection: `0x${string}`, chainId: number) {
    if (_nft == null) return
    try {
        const { data: user } = useReadContract({
            abi: gameABI,
            address: GameAddressAccordingToChain(chainId),
            functionName: "getUser",
            args: [_nft, _collection]
        })

        return user
    } catch (e) {
        console.error(e)
    }
}

export async function GetMingleMetadata(id: number) {

    if (id == null) return

    const config = useConfig()

    try {
        const metadata = await readContract(config, {
            abi: MinglesABI,
            address: MinglesAddress as `0x${string}`,
            functionName: 'tokenURI',
            args: [BigInt(id)]
        })

        let url = 'https://ipfs.io/ipfs/' + metadata?.toString().split("/")[2] + "/" + id
        let meta = await fetch(url)
        let dataJson = await meta.json()
        let d = await dataJson.attributes[4].value
        return d
    } catch (e) {
        console.error(e)
    }
}