'use client'
import { useState, useEffect } from 'react'
import { gameABI } from '../abis/gameABI';
import { SecondToken } from '@/components/engine/SecondToken';
import { GameAddressAccordingToChain } from '../engine/engine';
import Image from 'next/image';
import Loader from './Loader';
import { useAccount, useChainId, useConfig, useReadContract, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { useAtom } from 'jotai';
import { parseEther } from 'viem';
import { GameLocation, GameTokenId, PlayingAddress, TokenStatus, Address1, Address2 } from '@/components/engine/atoms';

type Props = React.PropsWithChildren<{ Nft: string, Nftcollection: string }>;
export default function Card({ Nft, Nftcollection }: Props) {

    interface Card {
        nftId: number;
        status: number;
        location: string;
        wormLvl: number;
        stage: number;
        revive: boolean;
        collection: string;
    }

    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const { address, isConnected } = useAccount()
    const config = useConfig()
    const chainId = useChainId()

    const [address1, setAddress1] = useAtom(Address1)
    const [address2, setAddress2] = useAtom(Address2)

    const [gameToken, setGameToken] = useAtom(GameTokenId)
    const [gameLocation, setGameLocation] = useAtom(GameLocation)
    const [playingAddress, setPlayingAddress] = useAtom(PlayingAddress)
    const [tokenStatus, setTokenStatus] = useAtom(TokenStatus)

    const [id, setId] = useState(0)
    const [mstatus, setMstatus] = useState(0)
    const [loc, setLocation] = useState("")

    const [imageURL, setImageURL] = useState("")

    const [loading, setLoading] = useState(false)

    /*const { data: getValue } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getCost",

    })*/

    const { data: USER, isSuccess } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getUser",
        args: [Number(Nft), Nftcollection as `0x${string}`]
    })

    useEffect(() => {
        //GetMingleMetadata(Number(Nft))
        if (isSuccess) {
            const {
                nftId,
                status,
                location,
                wormLvl,
                stage,
                revive,
                collection
            } = USER as Card;
            setId(Number(nftId))
            setMstatus(Number(status))
            setLocation(location.toString())
        }

    }, [isSuccess, USER, imageURL])

    const registerInContext = async () => {
        setGameToken(Number(Nft))
        setPlayingAddress(Nftcollection)
        setGameLocation(loc)
        
    }

    /*const triggerRegister = async () => {
        setTokenId(nft)
        setCollection(Nftcollection)
        await GetUser(nft, Nftcollection)
        setLocation(loc)
    }*/

    async function getUser(nft: number, collection: `0x${string}`) {
        if (nft == null) return
        try {
            const user = await readContract(config, {
                abi: gameABI,
                address: GameAddressAccordingToChain(chainId),
                functionName: "getUser",
                args: [nft, collection]
            })

        } catch (e) {
            console.error(e)
        }
    }

    const getMingleData = async () => {

        setLoading(true)
        const startingLocation = "patio"
        try {
            const approvalHash = await writeContractAsync({
                abi: gameABI,
                address: GameAddressAccordingToChain(chainId) as `0x${string}`,
                functionName: "registerOrContinue",
                args: [Number(Nft), startingLocation, Nftcollection as `0x${string}`],
                value: parseEther("0")
            })

            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            })

            if (approvalReceipt) {
                setGameToken(Number(Nft))
                setPlayingAddress(Nftcollection)
                setGameLocation(startingLocation)
            }

        } catch (e) {
            console.error(e)
        }
    }

    async function GetMingleMetadata(id: number) {

        if (id == null) return

        try {
            const metadata = await readContract(config, {
                abi: SecondToken,
                address: Nftcollection as `0x${string}`,
                functionName: 'tokenURI',
                args: [id]
            })

            let url = 'https://ipfs.io/ipfs/' + metadata?.toString().split("/")[2] + "/" + id.toString()
            
            let meta = await fetch(url)

            let dataJson = await meta.json()
            let imgUrlSplitted = dataJson.image.split("/")
                let imageURL = 'https://ipfs.io/ipfs/' + imgUrlSplitted[2] + "/" + imgUrlSplitted[3]
            setImageURL(imageURL)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div key={id} className="rounded-xl border border-gray-400 p-1 font-[family-name:var(--font-hogfish)]">
            {Nftcollection == address1 && (
                <>
                    <Image className='rounded-lg' src={"https://d9emswcmuvawb.cloudfront.net/PFP" + Nft + ".png"} alt={Nft} width={200} height={200} />
                </>
            )
            }
            {Nftcollection == address2 &&
                (
                    <>
                        <Image className='rounded-lg' src={"https://bafybeifrjmhpuf34cv6sy4lqhs5gmmusznpunyfik3rqoqfi73abpcpnbi.ipfs.w3s.link/" + Nft + ".jpg"} alt={Nft} width={200} height={200} />
                    </>
                )
            }

            {id == 0 ?
                (
                    <div className='mt-2'>
                        <p className="pt-1"># {Nft + " "}
                            <span className={"text-green-500"}  >
                                {"Not registered"}
                            </span>
                        </p>
                        {loading == true ?
                            (   <div className='flex text-center p-1 mb-2'>
                                <Loader />
                                </div>
                            )
                            : (<button type="button" onClick={getMingleData} className="border border-1 border-black px-1 pt-2 rounded-xl mb-1 bg-slate-300">
                                {"Register"}
                            </button>)}
                    </div>
                ) : (
                    <div className='mt-2'>
                        <p className="pt-1"># {Nft + " "}
                            <span className={mstatus != 4 ? "text-green-500" : "text-red-500"}  >
                                {mstatus != 4 ? "Alive" : "Dead"}
                            </span>
                        </p>
                        {mstatus != 4 && (
                            <button type="button" onClick={registerInContext} className="border border-1 border-black px-1 pt-2 rounded-xl mb-1 bg-slate-300">
                                {"Continue"}
                            </button>
                        )
                        }
                        {mstatus == 4 && (
                            <button type="button" disabled={true} className="border border-1 border-black px-1 pt-2 rounded-xl mb-1 bg-slate-300">
                                {"Can't Continue"}
                            </button>
                        )
                        }
                    </div>
                )
            }
        </div>
    )
}
