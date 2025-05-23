import React from 'react'
import Image from 'next/image'
import mingle from "../../../public/assets/MinglesBarrel2.png"
import styles from "./profile.module.css"
import cls from "classnames"
import { useAccount } from 'wagmi'
import blanco from "../../../public/assets/Barriles.png"

export default function Panel() {

    const { address } = useAccount()

    return (
        <div id='w-node-d7993459-da06-f0c6-4ea6-309fba962f1c-0fdcf260' className="grid border w-full justify-items-center content-center div-dashboard-cava">
            

            <div className='grid grid-cols-1 md:grid-cols-3 w-5/6 justify-items-center content-center gap-4 border-b-4 border-red-400 pb-2 mt-10'>
                <Image src={blanco} alt='blanco' width={100} height={100} />
                <div className='grid content-center gap-2'>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-pressura)]'>Total Balance [$BLANCO]</p>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-hogfish)]'>50</p>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-pressura)]'>
                        Status: <span className='text-blue-600'>AGING</span>
                    </p>
                </div>
                
            </div>

            <div className='grid grid-cols-4 w-5/6 justify-items-center content-center px-1 pb-2 mt-10'>
                <div >
                    <p className='text-xs md:text-base  font-[family-name:var(--font-pressura)]'>
                        BLANCO
                    </p>
                    <p className='text-xs md:text-base text-center font-[family-name:var(--font-pressura)]'>
                        5 days
                    </p>
                </div>
                <div className="grid content-center col-span-2 w-5/6 rounded-md border" >
                    <div className="h-5 rounded-md overflow-hidden bg-white border border-red-400">
                        <div className="h-full rounded-md bg-red-400" style={{ width: "85%" }}></div>
                    </div>
                </div>
                <div>
                    <p className='text-xs md:text-base text-center font-[family-name:var(--font-pressura)]'>
                        BLANCO
                    </p>
                    <p className='text-xs md:text-base text-center font-[family-name:var(--font-pressura)]'>
                        90 days
                    </p>
                </div>
            </div>
            <div className='grid grid-cols-4 w-5/6 text-center justify-items-center content-center px-1 pb-2'>
                <div className='grid content-center'>
                    <p className='text-xs md:text-base text-gray-500  font-[family-name:var(--font-pressura)]'>
                        Liters
                    </p>
                </div>
                <div className='grid content-center'>
                    <p className='text-xs md:text-base text-gray-500  font-[family-name:var(--font-pressura)]'>
                        Bottles
                    </p>
                </div>
                <div className='grid content-center'>
                    <p className='text-xs md:text-base text-gray-500  font-[family-name:var(--font-pressura)]'>
                        APE X REPO BOTTLE
                    </p>
                </div>
                <div className='grid content-center'>
                    <p className='text-xs md:text-base text-gray-500  font-[family-name:var(--font-pressura)]'>
                        TOTAL APE APROX.
                    </p>
                </div>
            </div>
            <div className='grid grid-cols-4 w-5/6 text-center justify-items-center content-center px-1 border-b-4 border-red-400 pb-2'>
                <div className='grid content-center'>
                    <p className='text-base md:text-xl  font-[family-name:var(--font-hogfish)]'>
                        37.5
                    </p>
                </div>
                <div className='grid content-center'>
                    <p className='text-base md:text-xl  font-[family-name:var(--font-hogfish)]'>
                        50
                    </p>
                </div>
                <div className='grid content-center'>
                    <p className='text-base md:text-xl  font-[family-name:var(--font-hogfish)]'>
                        15
                    </p>
                </div>
                <div className='grid content-center'>
                    <p className='text-base md:text-xl  font-[family-name:var(--font-hogfish)]'>
                        750
                    </p>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 w-5/6 justify-items-center content-center gap-4 border-b-4 border-red-400 pb-2 mt-10'>
                <Image src={blanco} alt='reposado' width={100} height={100} />
                <div className='grid content-center gap-2'>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-pressura)]'>Total Balance [$REPOSADO]</p>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-hogfish)]'>0</p>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-pressura)]'>
                        Status: <span className='text-red-400'>Not Available</span>
                    </p>
                </div>
                <button className={cls(styles.backColor, 'h-16 p-1 rounded-lg text-white mt-1 md:mt-0 text-xs md:text-md')}>
                    <p>CLAIM</p>
                    <p>$REPOSADO</p>
                </button>
            </div>

            {/*<div className='grid grid-cols-1 md:grid-cols-3 w-5/6 justify-items-center content-center gap-4 border-b-4 border-red-400 pb-2 mt-10'>
                <Image src={blanco} alt='añejo' width={100} height={100} />
                <div className='grid content-center gap-2'>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-pressura)]'>Total Balance [$ANEJO]</p>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-hogfish)]'>0</p>
                    <p className='text-sm mt-1 md:text-base font-[family-name:var(--font-pressura)]'>
                        Status: <span className='text-red-400'>Not Available</span>
                    </p>
                </div>
                <button className={cls(styles.backColor, 'h-16 p-1 rounded-lg text-white mt-1 md:mt-0 text-xs md:text-md')}>
                    <p>CLAIM</p>
                    <p>$ANEJO</p>
                </button>
            </div>*/}

            {/*<p className='mt-10 text-sm md:text-lg font-[family-name:var(--font-hogfish)]'>ENTER MINGLE ID</p>
            <div className='flex h-8 mb-6 mt-4'>
                <input type='number' className='block w-32 min-w-0 grow py-1.5 pr-3 pl-1 border border-red-600 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6' />
                <button className={cls(styles.backColor, 'ms-2 w-14 p-1 rounded-lg text-white text-xs md:text-sm')}>
                    CHECK
                </button>
            </div>
            <p className='text-md md:text-xl text-blue-600 font-[family-name:var(--font-pressura)]'>CLAIMED</p>
            <p className='text-md md:text-xl text-red-600 font-[family-name:var(--font-pressura)]'>UNCLAIMED</p>
            <Image src={mingle} alt='mingle' width={230} height={230} />*/}

        </div>
    )
}
