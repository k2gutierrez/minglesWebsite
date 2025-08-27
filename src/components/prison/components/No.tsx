'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import cat from "/public/assets/cat.jpeg";
import { useAtom } from "jotai";
import { GameLocation } from "@/components/engine/atoms";

export default function No() {

  const [gameLocation, setGameLocation] = useAtom(GameLocation)

  return (
    <>
      <div className="flex text-center mt-10">

        <div className={cls(styles.backColor, "z-0 justify-items-center text-center rounded-2xl h-56 w-56 m-5")}>
          <div className={cls(styles.marginBack, "z-10 justify-items-center text-center items-end h-40 w-40 mx-9")}>
            <Image className="rounded-2xl" src={cat} alt={"afraid"} width={180} height={180} />
          </div>
          <div className={cls(styles.marginBack2)}>
          <p className="pt-10 mt-20 text-black text-xs font-[family-name:var(--font-hogfish)]">Stop being a pussy</p>
        </div>
        </div>
      </div>
      <p className="my-5 text-black text-center text-md font-[family-name:var(--font-hogfish)]">READY?</p>
      <div className="flex items-center justify-center">
        <button className={cls(styles.backColor, "my-10 text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={() => setGameLocation("")} >okay I'll go</button>
      </div>
    </>
  )
}
