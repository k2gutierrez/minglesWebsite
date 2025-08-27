import React from 'react'
import Image from 'next/image'
import oneOnOne from "../../../public/assets/1of1s.png";
import cls from "classnames";
import styles from "./profile.module.css";

export default function Pop() {
    return (
        <section className="rounded-3xl shadow-2xl m-3">
            <div className="p-8 text-center sm:p-12 ">
                <p className="text-md mt-20 mb-10 font-semibold tracking-widest text-black font-[family-name:var(--font-hogfish)]">
                    Join forces to beat the raven
                </p>

                <p className="mb-10 text-md font-semibold tracking-widest text-black font-[family-name:var(--font-pressura)]">
                    Who will be the last to survive?
                </p>

                <p className={cls(styles.redFont, "mb-5 text-md font-semibold tracking-widest font-[family-name:var(--font-pressura)]")}>
                    Winner will receive
                </p>
                <div className='grid justify-items-center'>
                    <Image className='flex align-center' src={oneOnOne} alt='Prize' width={120} height={120} />
                </div>
                
            </div>
        </section>
    )
}
