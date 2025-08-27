'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { useAtom } from "jotai";
import { GameLocation } from "@/components/engine/atoms";
import prize from "/public/assets/prize.jpg";

export default function Rules() {

  const [gamelocation, setGameLocation] = useAtom(GameLocation)

  return (
    <>
      <div className="flex text-center mt-8">

        <div className={cls(styles.backColor, "z-0 justify-items-center text-center items-end rounded-2xl h-60 w-56 m-5")}>
          <div className={cls(styles.marginBack, "z-10 justify-items-center text-center items-end h-40 w-40 mx-9")}>
            <Image className="rounded-2xl" src={prize} alt={"Mingle Price"} width={180} height={180} />
          </div>
          <div className="">
            <p className="pt-10 text-black text-xs font-[family-name:var(--font-hogfish)]">MINGLES</p>
          <p className="text-xs text-white font-[family-name:var(--font-pressura)]">Worms Raid</p>
          <p className="px-5 mb-2 text-black text-xs font-[family-name:var(--font-pressura)]">Your mission is to defeat the raven.</p>
          </div>
          
        </div>
      </div>
      <div className="mx-10 mt-8 mb-10 p-2 text-center">
        <p className="mb-2 text-black text-md font-[family-name:var(--font-hogfish)]">RULES</p>
        <p className="mb-4 text-black text-sm font-[family-name:var(--font-pressura)]">
          Each Mingle and guest can raid only once.</p>
        <p className="mb-4 text-black text-sm font-[family-name:var(--font-pressura)]">
          If it dies, it cannot participate again-nor can anyone else use it.</p>
        <p className="mb-4 text-black text-sm font-[family-name:var(--font-pressura)]">
          Mayahuel may revive your Mingle once, depending on rarity.</p>
        <p className="mb-4 text-black text-sm font-[family-name:var(--font-pressura)]">
          Fully on-chain: every decision creates a new transaction.</p>
        <p className="mb-4 text-black text-sm font-[family-name:var(--font-pressura)]">
          The last hero standing wins the NFT prize automatically.</p>
        <p className="mb-2 text-black text-sm font-[family-name:var(--font-pressura)]">
          If no one survives, the game restarts, and the prize returns to the pool.</p>
          <button className={cls(styles.backColor, "text-sm mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={() => setGameLocation("")} >Main Screen</button>
      
      </div>
      
      
    </>
  )
}
