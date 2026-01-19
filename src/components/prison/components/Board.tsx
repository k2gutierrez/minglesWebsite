'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import React, { useState, useEffect } from 'react';
import oneOnOne from "../../../public/assets/1of1s.png";
import { gameABI } from "../abis/gameABI";
import { useAccount, useChainId, useConfig, useReadContract, useWatchContractEvent } from "wagmi";
import { readContract } from "@wagmi/core";
import { useAtom } from "jotai";
import { GameAddressAccordingToChain } from "../engine/engine";
import { SecondCollectionUrl, SecondCollectionImageFormat } from "@/components/engine/CONSTANTS";
import { GameLocation, GameTokenId, Address1, Address2, PlayingAddress, Tokens1, Tokens2 } from "@/components/engine/atoms";

export default function Board() {

    interface Card {
        nftId: number;
        status: number;
        location: string;
        wormLvl: number;
        stage: number;
        revive: boolean;
        collection: string;
    }

    interface Mingle {
        nftId: number;
        location: string;
        collection: string;
    }

    const config = useConfig()
    const chainId = useChainId()

    const [address1, setAddress1] = useAtom(Address1)
    const [address2, setAddress2] = useAtom(Address2)
    const [aliveMingles, setAliveMingles] = useState<Mingle[] | null>([])
    const [winnerCollection, setWinnerCollection] = useState<string>("")
    const [winner, setWinner] = useState<Number | null>(null)

    useWatchContractEvent({
        address: GameAddressAccordingToChain(chainId),
        abi: gameABI,
        eventName: 'WinnerSelected',
        onLogs(logs) {
            
            setWinner(Number(logs[0]))
            setWinnerCollection(logs[1].toString())
        },
    })

    const { data: amountRegisteredUsers } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getAmountOfRegisteredUsers",
    })

    const { data: deadNftLength } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getDeadNftsLength",
    })

    const { data: minglesForRaffle } = useReadContract({
        abi: gameABI,
        address: GameAddressAccordingToChain(chainId),
        functionName: "getMinglesForRaffleLength",
    })

    const alive: number = Number(amountRegisteredUsers) - Number(deadNftLength)

    useEffect(() => {
        check()
    }, [])

    async function check() {
        try {
            const allPlayers = await readContract(config, {
                abi: gameABI,
                address: GameAddressAccordingToChain(chainId) as `0x${string}`,
                functionName: 'getRegisteredUsersCollection',
            }) as Card[]

            let minglesArray: Mingle[] = [];
            for (let i = 0; i < allPlayers.length; i++) {

                let token: Mingle = {
                    nftId: allPlayers[i].nftId,
                    location: allPlayers[i].location,
                    collection: allPlayers[i].collection
                }
                minglesArray.push(token)

            }
            let aliveMinglesArray: Mingle[] = [];
            for (let j = 0; j < minglesArray.length; j++) {
                const result = await readContract(config, {
                    abi: gameABI,
                    address: GameAddressAccordingToChain(chainId) as `0x${string}`,
                    functionName: 'getUser',
                    args: [minglesArray[j].nftId, minglesArray[j].collection as `0x${string}`],
                }) as Card
                if (result.status != 4) {
                    let AliveToken: Mingle = {
                        nftId: Number(result.nftId),
                        location: result.location,
                        collection: result.collection
                    }
                    aliveMinglesArray.push(AliveToken)
                }
            }
            setAliveMingles(aliveMinglesArray)

        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <div className="text-center bg-black rounded-xl p-3 mt-5 mx-10">
                <p className="text-white font-[family-name:var(--font-hogfish)]">The Heroes</p>
            </div>
            <div className="text-center mt-5">
                <p className="text-black font-[family-name:var(--font-pressura)]">Raiding: {Number(amountRegisteredUsers)}</p>
                <p className="text-black font-[family-name:var(--font-pressura)]">Fallen: {Number(deadNftLength)}</p>
                <p className="text-black text-lg font-[family-name:var(--font-pressura)]">Made it to the Escape Room: {Number(minglesForRaffle)}</p>
                <p className="text-black font-[family-name:var(--font-pressura)]">Alive: {alive}:</p>
            </div>
            {winner != null &&
                (
                    <>
                        <p className="mt-8 text-black text-md font-[family-name:var(--font-hogfish)]">The winner is!</p>
                        {winnerCollection.toLowerCase() == address1.toLowerCase() && (
                            <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + winner + ".png"} alt="Mingle" width={150} height={150} />
                        )}
                        {winnerCollection.toLowerCase() == address2.toLowerCase() && (
                            <Image className="mt-3 rounded-2xl" src={SecondCollectionUrl + winner + SecondCollectionImageFormat} alt="Mingle" width={150} height={150} />
                        )}

                        <p className="mt-1 mx-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">ID # {Number(winner)}</p>
                    </>
                )
            }
            <div className="flex flex-wrap gap-4 mt-5 text-center ">
                {aliveMingles != null && (
                    aliveMingles.map((v, k) => {

                        return (

                            <div key={k} className="rounded-xl border border-gray-400 px-1 my-2 font-[family-name:var(--font-hogfish)]">
                                {v.collection == address1 && (
                                    <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + v.nftId + ".png"} alt="Mingle" width={150} height={150} />
                                )}
                                {v.collection == address2 && (
                                    <Image className="mt-3 rounded-2xl" src={SecondCollectionUrl + v.nftId + SecondCollectionImageFormat} alt="Mingle" width={150} height={150} />
                                )}
                                <p className="mt-3">ID {v.nftId}</p>
                                <p className="mt-1">{<span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>Alive at {v.location}</span>}</p>
                            </div>

                        )
                    })

                )

                }
            </div>
        </>
    )
}
