'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { useEffect, useState } from 'react';
import { TwitterShareButton } from "react-twitter-embed";
import { useAtom, atom } from "jotai";
import { PlayingAddress, GameLocation, GameTokenId } from "@/components/engine/atoms";
import { MinglesABI } from "@/components/engine/MinglesABI";
import { MinglesAddress } from "@/components/engine/CONSTANTS";
import { readContract } from "@wagmi/core";
import { useConfig } from "wagmi";

export default function Die() {

  const config = useConfig()

  const [imageURL, setImageURL] = useState<string>("");
  const [copied, setCopied] = useState(false)
  const [playingAddress, setPlayingAddress] = useAtom(PlayingAddress)
  const [gameLocation, setGameLocation] = useAtom(GameLocation)
  const [gameTokenId, setGameTokenId] = useAtom(GameTokenId)
  //const [tokenIsAlive, setTokenIsAlive] = useAtom(TokenIsAlive)

  useEffect(() => {
    GetMingleMetadata(gameTokenId)
  }, [])

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

    } catch (e) {
      console.error(e)
    }

  }

  async function GetMingleMetadata(id: number) {
  
      if (id == null) return

      try {
          const metadata = await readContract(config, {
              abi: MinglesABI,
              address: playingAddress as `0x${string}`,
              functionName: 'tokenURI',
              args: [id]
          })
  
          let url = 'https://ipfs.io/ipfs/' + metadata?.toString().split("/")[2] + "/" + id
          let meta = await fetch(url)
          let dataJson = await meta.json()
          let imageURL = 'https://ipfs.io/ipfs/' + dataJson.image.split("/")[2] + "/" + dataJson.image.split("/")[3]
          setImageURL(imageURL)
      } catch (e) {
          console.error(e)
      }
  }

  return (
    <>
      <div className="flex text-center mt-10 ">
        <div className="col-span-2">
          <video className="px-5 text-center" width="450" height="450" autoPlay loop controls preload="none">
          <source src="/videos/Dead.mov" />
          Your browser does not support the video tag.
        </video>
        </div>
      </div>
      <div className="text-center">
      <p className="mt-5 text-black text-md font-[family-name:var(--font-hogfish)]">YOU DIED</p>
        <Image id="mingle" className="mt-3 rounded-2xl" src={imageURL} alt="Minglegame" width={60} height={60} />
      <p className="my-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">Want to try again?</p>
      </div>
      <div className="flex items-center justify-center">
        <button className={cls(styles.backColor, "text-base mx-5 w-32 p-1 rounded-xl")} onClick={() => setGameLocation("mingles")} >yes</button>
        {copied == false ?
          (
            <button className={cls(styles.backColor, "text-base mx-5 w-32 p-1 rounded-xl")} onClick={getImage} >Copy to Share on X</button>
          ) : (
            <TwitterShareButton
              url="I tried the Mingle Raid!"

            />
          )
        }
      </div>
    </>
  )
}
