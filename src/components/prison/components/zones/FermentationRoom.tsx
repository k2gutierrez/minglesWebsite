'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { useEffect, useState } from 'react';
import { gameABI } from "../../abis/gameABI";
import { MinglesABI } from "@/components/engine/MinglesABI";
import { useConfig, useAccount, useChainId, useWriteContract, useReadContract } from "wagmi";
import Loader from "../Loader";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { useAtom } from "jotai";
import { GameLocation, GameTokenId, PlayingAddress } from "@/components/engine/atoms";
import { GameAddressAccordingToChain } from "../../engine/engine";

//BASE
export default function FermentationRoom() {

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const config = useConfig()

  const [gameLocation, setGameLocation] = useAtom(GameLocation)
  const [gameTokenId, setGameTokenId] = useAtom(GameTokenId)
  const [playingAddress, setPlayingAddress] = useAtom(PlayingAddress)

  const [tokenImage, setTokenImage] = useState("")
  
  /*const [loc, setLoc] = useState("")
  const [id, setId] = useState(0)
  const [mstatus, setMstatus] = useState()
  const [lvl, setLvl] = useState(0)
  const [cstage, setCstage] = useState(0)
  const [crevive, setCrevive] = useState()*/

  const [message, setMessage] = useState("")

  const [loading, setLoading] = useState(false)

  const choice1 = "raven nest"
  const choice2 = "raven nest"

  const { data: hash, isPending, writeContractAsync } = useWriteContract()

    interface Card {
      nftId: number;
      status: number;
      location: string;
      wormLvl: number;
      stage: number;
      revive: boolean;
      collection: string;
    }

  useEffect(() => {
    GetMingleMetadata(gameTokenId)

  }, [])

  const c1 = async () => {
    setLoading(true)
    const approvalHash = await writeContractAsync({
      abi: gameABI,
      address: GameAddressAccordingToChain(chainId) as `0x${string}`,
      functionName: "choice",
      args: [gameTokenId, choice1, playingAddress as `0x${string}`, 0]
    })

    const approvalReceipt = await waitForTransactionReceipt(config, {
      hash: approvalHash,
    })
    
    const result = await readContract(config, {
      abi: gameABI,
      address: GameAddressAccordingToChain(chainId) as `0x${string}`,
      functionName: 'getUser',
      args: [gameTokenId, playingAddress as `0x${string}`]
    })

    const {
      nftId,
      status,
      location,
      wormLvl,
      stage,
      revive,
      collection
    } = result as Card;
    setLoading(false)
    setGameLocation(location)
  }

  const c2 = async () => {
    setLoading(true)
    const approvalHash = await writeContractAsync({
      abi: gameABI,
      address: GameAddressAccordingToChain(chainId) as `0x${string}`,
      functionName: "choice",
      args: [gameTokenId, choice2, playingAddress as `0x${string}`, 1]
    })

    const approvalReceipt = await waitForTransactionReceipt(config, {
      hash: approvalHash,
    })
    
    const result = await readContract(config, {
      abi: gameABI,
      address: GameAddressAccordingToChain(chainId) as `0x${string}`,
      functionName: 'getUser',
      args: [gameTokenId, playingAddress as `0x${string}`]
    })

    const {
      nftId,
      status,
      location,
      wormLvl,
      stage,
      revive,
      collection
    } = result as Card;
    setLoading(false)
    setGameLocation(location)
  }

  async function GetMingleMetadata(id: number) {

    if (id == null) return
    
    try {
      let url = "";
      let isIPFS = true;
      let imageURL = "";
      const metadata = await readContract(config, {
        abi: MinglesABI,
        address: playingAddress as `0x${string}`,
        functionName: 'tokenURI',
        args: [id]
      })

      if (String(metadata).startsWith("ipfs://")) {
        url = 'https://ipfs.io/ipfs/' + metadata?.toString().split("/")[2] + "/" + id 
      } else if (String(metadata).startsWith("https://")) {
        url = metadata?.toString() + ".json"
        isIPFS = false;
      }

      
      let meta = await fetch(url)
      let dataJson = await meta.json()
      if (isIPFS == true){
        imageURL = 'https://ipfs.io/ipfs/' + dataJson.image.split("/")[2] + "/" + dataJson.image.split("/")[3]
      } else {
        imageURL = dataJson.image
      }
      
      setTokenImage(imageURL)

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="pb-12">
      {loading == true ? (
        <div className="flex text-center mt-6">
                  <Loader />
                </div>
      ) : (
        <>
          <div className="flex text-center mt-3">
            <video className="px-5" width="600" height="600" autoPlay loop controls preload="none">
              <source src="/videos/Fermentation_Room.mov" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="text-center">
          {message != "" && (<p className="mt-2 text-red-600 text-md font-[family-name:var(--font-hogfish)]">You died! but...</p>)}
          {message != "" && (<p className="mt-1 mx-10 text-green-600 text-md font-[family-name:var(--font-hogfish)]">{message}</p>)}
          <p className="mt-8 text-black text-md font-[family-name:var(--font-hogfish)]">{message == "" ? "YOU'VE ENTERED THE FERMENTATION ROOM" : "YOU'RE STILL IN THE FERMENTATION ROOM"}</p>
          {/*collection == "collection1" && (
            <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + tokenId + ".png"} alt="Mingle" width={60} height={60} />
          )*/}
          {/*collection == "collection2" && (
            <Image className="mt-3 rounded-2xl" src={"https://bafybeifrjmhpuf34cv6sy4lqhs5gmmusznpunyfik3rqoqfi73abpcpnbi.ipfs.w3s.link/" + tokenId + ".jpg"} alt="Mingle" width={60} height={60} />
          )*/}
          <Image className="mt-3 rounded-2xl" src={tokenImage} alt="Mingle" width={60} height={60} />
          <p className="mt-5 mx-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">
            Tequila bubbles around you, and the air feels alive with tension.
          </p>
          </div>
          <div className="mt-5 mb-10 flex items-center justify-center">
            <button className={cls(styles.backColor, "text-sm p-2 mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={c1} >
              A. Wooden tanks loom ahead, but something rustles nearby.
            </button>
            <button className={cls(styles.backColor, "text-sm p-2 mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={c2} >
              B. A distant cry urges you to press on quickly.
            </button>
          </div>
        </>
      )

      }
    </div>
  )
}
