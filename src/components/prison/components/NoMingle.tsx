'use client'
import { useState, useEffect } from 'react'
import styles from "./profile.module.css";
import cls from "classnames";
import Link from 'next/link';
import { gameABI } from '../abis/gameABI';
import { GameAddressAccordingToChain } from '../engine/engine';
import { useAccount, useChainId, useConfig, useReadContract, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { useAtom } from 'jotai';
import Loader from './Loader';
import { GameLocation, GameTokenId, PlayingAddress, TokenStatus, Address1, Address2 } from '@/components/engine/atoms';

export default function NoMingle() {

  interface Card {
    nftId: number;
    status: number;
    location: string;
    wormLvl: number;
    stage: number;
    revive: boolean;
    collection: string;
  }

  const config = useConfig()
  const chainId = useChainId()

  const [address1, setAddress1] = useAtom(Address1)
  const [address2, setAddress2] = useAtom(Address2)
  const [gameLocation, setGameLocation] = useAtom(GameLocation)

  const [token, setToken] = useState("0")
  const [id, setId] = useState(0)
  const [mstatus, setMstatus] = useState(0)

  const [loading, setLoading] = useState(false)
  const [counter, setCounter] = useState(0)

  const { data: USER, isSuccess } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getUser",
    args: [Number(token), address1 as `0x${string}`]
  })

  useEffect(() => {
    //GetMingleMetadata(Number(Nft))
    /*if (isSuccess) {
        const {
            nftId,
            status,
            location,
            wormLvl,
            stage,
            revive,
            collection
        } = USER as Card;
        setId(Number(nftId))
        setMstatus(Number(status))
    }*/

  }, [/*isSuccess, USER*/])

  const GetUser = async () => {
    setLoading(true)
    setCounter(0)
    setTimeout(() => {

      if (isSuccess) {

        const {
          nftId,
          status,
          location,
          wormLvl,
          stage,
          revive,
          collection
        } = USER as Card;
        setId(Number(nftId))
        setMstatus(Number(status))
      }
      setCounter(1)
      setLoading(false)

    }, 2000);

  }

  return (
    <div className='text-center'>
      <div className='rounded-2xl p-3 bg-black text-white text-center mt-10'>
        <p className="text-md font-[family-name:var(--font-pressura)]">You have no Mingles, you bum.</p>
        <p className="text-md font-[family-name:var(--font-pressura)]">Go buy some.</p>
      </div>
      <div className="flex items-center justify-center">
        <Link href={"https://magiceden.io/collections/apechain/0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e"} target='_blank' className={cls(styles.backColor, "text-center my-10 text-base w-32 p-1 rounded-xl")} >buy</Link>
      </div>
      <div className='rounded-2xl p-3 bg-black text-white text-center mx-10'>
        <p className="text-md font-[family-name:var(--font-pressura)]">Check if your Mingle can RAID or not</p>

      </div>
      <p className='mt-10 font-[family-name:var(--font-hogfish)]'>Enter Mingle ID#</p>
      <div className="text-center space-y-2 mb-6">
        <input placeholder="4545" className={"text-black text-center text-base border border-red-500  rounded-md font-[family-name:var(--font-pressura)]"} onChange={e => setToken(e.target.value)}></input>
        <button
          className="ms-2 center rounded-lg bg-red-500 p-1 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
          onClick={GetUser}
        >check
        </button>
      </div>

      {loading && (
        <div className="flex text-center">
          <Loader />
        </div>
      )

      }
      {id != 0 && mstatus != 0 && mstatus != 4 && counter != 0 && (
        <p className='mt-5 font-[family-name:var(--font-pressura)]'>Mingle is <span className='text-red-600 font-[family-name:var(--font-hogfish)]'>Registered</span></p>
      )
      }
      {mstatus == 0 && id == 0 && counter != 0 && (
        <p className='mt-5 font-[family-name:var(--font-pressura)]'>Mingle is <span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>Not Registered</span></p>
      )
      }
      {id != 0 && mstatus == 4 && counter != 0 ? (
        <p className='mt-5 font-[family-name:var(--font-pressura)]'>Mingle is <span className='text-red-600 font-[family-name:var(--font-hogfish)]'>Dead</span></p>
      ) : (
        <></>
      )
      }

      <button
          className="ms-2 center rounded-lg bg-red-500 p-1 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
          onClick={() => setGameLocation("")}
        >Back to main
        </button>

    </div>
  )
}
