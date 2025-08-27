'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { useState, useEffect } from 'react';
import { gameABI } from "../../abis/gameABI";
import prize from "/public/assets/prize.jpg";
import { TwitterShareButton } from "react-twitter-embed";
import { useConfig, useAccount, useChainId, useWriteContract, useWatchContractEvent } from "wagmi";
import Loader from "../Loader";
import { useAtom } from "jotai";
import { GameLocation, GameTokenId, PlayingAddress, Address1, Address2 } from "@/components/engine/atoms";
import { GameAddressAccordingToChain } from "../../engine/engine";

//BASE
export default function Survivor() {

  const chainId = useChainId()

  const [gameTokenId, setGameTokenId] = useAtom(GameTokenId)
  const [playingAddress, setPlayingAddress] = useAtom(PlayingAddress)
  const [address1, setAddress1] = useAtom(Address1)
  const [address2, setAddress2] = useAtom(Address2)

  const [winnerCollection, setWinnerCollection] = useState("")

  const [winner, setWinner] = useState(0)

  const [copied, setCopied] = useState(false)

  /*let [counter, setCounter] = useState(0)
  useEffect(() => {
    increase()
    

  }, [counter])

  function increase() {
    setTimeout(() => {
      setCounter(counter + 1)
    }, 5000);

  }*/

  useWatchContractEvent({
    address: GameAddressAccordingToChain(chainId),
    abi: gameABI,
    eventName: 'WinnerSelected',
    onLogs(logs) {
      console.log('New logs!', logs)
      setWinner(Number(logs[0]))
      setWinnerCollection(logs[1].toString())
    },
  })

  const getImage = async () => {
    const imge = document.getElementById("mingle") as HTMLImageElement
    const data = await fetch(imge.src)
    const blob = await data.blob()

    try {
      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        })
      ])
      setCopied(true)
      console.log("Success")

    } catch (e) {
      console.error(e)
    }

  }

  return (
    <div className="pb-12">
      <div className="grid text-center mt-6">
        <Image className="rounded-2xl" src={prize} alt={"NFT Prize"} width={180} height={180} />
      </div>
      <p className="mt-2 text-black text-md font-[family-name:var(--font-hogfish)]">YOU'VE ESCAPED THE BASEMENT PRISON</p>
      {winner == gameTokenId &&
        (<p className="mt-8 text-black text-md font-[family-name:var(--font-hogfish)]">You are the Winner, check your Wallet</p>)
      }
      {playingAddress.toLowerCase() == address1.toLowerCase() && (
        <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + gameTokenId + ".png"} alt="Mingle" width={60} height={60} />
      )}
      {playingAddress.toLowerCase() == address2.toLowerCase() && (
        <Image className="mt-3 rounded-2xl" src={"https://bafybeifrjmhpuf34cv6sy4lqhs5gmmusznpunyfik3rqoqfi73abpcpnbi.ipfs.w3s.link/" + gameTokenId + ".jpg"} alt="Mingle" width={60} height={60} />
      )}
      {winner == null &&
        (<p className="mt-5 mx-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">Wait for the Raffle</p>)
      }
      {winner != gameTokenId && winner != null && winnerCollection.toLowerCase() == address1.toLowerCase() &&
        (
          <>
            <p className="mt-8 text-black text-md font-[family-name:var(--font-hogfish)]">The winner is!</p>
            <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + winner + ".png"} alt="Mingle" width={100} height={100} />
            <p className="mt-1 mx-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">ID # {winner}</p>
          </>
        )
      }
      {winner != gameTokenId && winner != null && winnerCollection == address2.toLowerCase() &&
        (
          <>
            <p className="mt-8 text-black text-md font-[family-name:var(--font-hogfish)]">The winner is!</p>
            <Image className="mt-3 rounded-2xl" src={"https://bafybeifrjmhpuf34cv6sy4lqhs5gmmusznpunyfik3rqoqfi73abpcpnbi.ipfs.w3s.link/" + winner + ".jpg"} alt="Mingle" width={100} height={100} />
            <p className="mt-1 mx-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">ID # {winner}</p>
          </>
        )
      }
      {winner != null &&
        (
          copied == false ?
            (
              <button className={cls(styles.backColor, "mt-8 text-base mx-5 w-32 p-1 rounded-xl")} onClick={getImage} >Copy to Share on X</button>
            ) : (
              <TwitterShareButton
                url={winner == gameTokenId ? "I'm the Winner of the Mingles NFT Raid!!" : "I'm a survivor of the Mingle Raid!!"}

              />
            )

        )
      }
    </div>
  )
}
