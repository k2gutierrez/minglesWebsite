'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { React, useContext } from 'react';
import mingle from "../../../public/assets/1of1s.png";

export default function Won() {

  return (
    <>
      <div className="grid text-center mt-10">
        <div className={cls(styles.backColor, "grid justify-items-center text-center items-end rounded-3xl h-64 w-64 m-5")}>
        </div>
      </div>
      <p className="mt-5 text-black text-md font-[family-name:var(--font-hogfish)]">YOU WON</p>
      <Image className="mt-4" src={mingle} alt="Mingle" width={60} height={60} />
      <p className="my-10 text-black text-sm font-[family-name:var(--font-PRESSURA)]">Claim your prize</p>
      <div className="flex items-center justify-center">
        <button className={cls(styles.backColor, "text-base mx-5 w-32 p-1 rounded-xl")} >Yes</button>
        <button className={cls(styles.backColor, "text-base mx-5 w-32 p-1 rounded-xl")} >SHARE ON X</button>
      </div>
    </>
  )
}
