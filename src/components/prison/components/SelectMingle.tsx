'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { useEffect, useState } from 'react';
import { GetMingleMetadata } from "../engine/engine";
import { GetUser } from "../engine/engine";
import Card from "./Card";
import { gameABI } from "../abis/gameABI";
import { useAccount, useChainId, useConfig, useReadContract } from "wagmi";
import { useAtom } from "jotai";
import { GameAddressAccordingToChain } from "../engine/engine";
import { GameLocation, GameTokenId, Address1, Address2, PlayingAddress, Tokens1, Tokens2 } from "@/components/engine/atoms";

export default function SelectMingle() {

    const { address, isConnected } = useAccount()
    const config = useConfig()
    const chainId = useChainId()

    const [tokens1, setTokens1] = useAtom(Tokens1)
    const [tokens2, setTokens2] = useAtom(Tokens2)
    const [address1, setAddress1] = useAtom(Address1)
    const [address2, setAddress2] = useAtom(Address2)

    const { data: GetPausedStatus } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getGamePausedStatus",

    })

    const { data: GetAmountOfRegisteredUsers } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getAmountOfRegisteredUsers",

    })

    const { data: GetAmountOfDeadNfts } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getDeadNftsLength",

    })

    const alive: number = Number(GetAmountOfRegisteredUsers) - Number(GetAmountOfDeadNfts);

    return (
        <div className="mb-10 py-4">
            {alive == 0 && GetPausedStatus ? (
                <div className="grid text-center mt-1">
                    <p className="my-5 text-black text-2xl font-[family-name:var(--font-hogfish)]">The Raven wins</p>
                    <video className="px-5" width="600" height="600" autoPlay loop controls preload="none">
                        <source src="/videos/Dead.mov" />
                        Your browser does not support the video tag.
                    </video>
                    <p className="mt-5 text-black text-md font-[family-name:var(--font-pressura)]">Pathetic.</p>
                    <p className="mt-2 text-black text-md font-[family-name:var(--font-pressura)]">You never stood a chance.</p>
                    <p className="mt-4 text-black text-md font-[family-name:var(--font-pressura)]">Try again... if you dare!</p>
                    <p className="mt-4 text-black text-md font-[family-name:var(--font-pressura)]"><span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>WAIT</span> for the game to <span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>RESET</span></p>
                </div>
            ) : (
                <>
                    <div className="text-center bg-black rounded-xl p-2 mt-5 mx-20">
                        <p className="text-white font-[family-name:var(--font-pressura)]">Pick your Player</p>
                    </div>
                    <div className="text-center flex flex-wrap gap-4 mt-5 mb-8">
                        {tokens1 && (
                            tokens1.map((v, k) => {

                                return (
                                    <Card key={k} Nft={v.id} Nftcollection={address1 as `0x${string}`} />
                                )
                            }
                            )
                        )
                        }
                    </div>
                    <div className="text-center flex flex-wrap gap-4 mt-5 mb-8">
                        {tokens2 && (

                            tokens2.map((v, k) => {

                                return (
                                    
                                    <Card key={k} Nft={v.id} Nftcollection={address2 as `0x${string}`} />
                                    

                                )
                            }
                            )
                        )
                        }
                    </div>

                </>
            )
            }
        </div>
    )
}
