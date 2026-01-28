'use client'
import React, { useState, useEffect } from 'react'
import styles from "./profile.module.css";
import cls from "classnames";
import Link from 'next/link';
import { gameABI } from '../abis/gameABI';
import { toBytes } from 'viem';
import { useAccount, useReadContract, useChainId, useConfig } from 'wagmi';
import { useAtom } from 'jotai';
import { Address1, Address2 } from '@/components/engine/atoms';
import { MinglesABI } from '@/components/engine/MinglesABI';
import { MinglesGame, MinglesGameCurtis } from '@/components/engine/CONSTANTS';
import { readContract } from '@wagmi/core';

export default function MingleCheck() {

  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  const [token, setToken] = useState<string>("")
  const [check, setCheck] = useState<boolean>(false)
  const [id, setId] = useState<number>(0)
  const [mstatus, setMstatus] = useState<number>(0)


  {/*useEffect(() => {
    console.log(token)
  }, [token])*/}

  const address2Name = useReadContract({
    abi: MinglesABI,
    address: Address2.toString() as `0x${string}`,
    functionName: "name"
  })

  const GetUser = async () => {
    if (token == null) return
    let gameAddress;
    if (chainId == 33111) {
      gameAddress = MinglesGameCurtis
    } else {
      gameAddress = MinglesGame
    }
    try {
      // const result = await useReadContract({
      //   abi: MinglesABI,
      //   address: gameAddress as `0x${string}`,
      //   functionName: 'getUser',
      //   args: [
      //     token as `0x${string}`,
      //     Address1.toString() as `0x${string}`,
      //   ]
      // })
      //const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_CONTRACT, gameABI, provider)
      //const getUser = await gameContract.getUser(token, toBytes("collection1", { size: 32 }))
  
      // //let id = ethers.toNumber(getUser[0])
      // setId(Number(result.data?.toString()[0]))
      // //let mStatus = result?[1];
      // setMstatus(Number(result.data?.toString()[1]));
      // setCheck(true);

    } catch (e) {
      console.error(e)
    }
  }

  const GetUser2 = async () => {
    if (token == null) return
    let gameAddress;
    if (chainId == 33111) {
      gameAddress = MinglesGameCurtis
    } else {
      gameAddress = MinglesGame
    }
    try {
      // const result = await useReadContract({
      //   abi: MinglesABI,
      //   address: gameAddress as `0x${string}`,
      //   functionName: 'getUser',
      //   args: [
      //     token,
      //     Address2.toString() as `0x${string}`,
      //   ]
      // })
      //const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_CONTRACT, gameABI, provider)
      //const getUser = await gameContract.getUser(token, toBytes("collection1", { size: 32 }))

      //let id = result?[0].toString()
      // setId(Number(result.data?.toString()[0]))
      // //let mStatus = result?[1].toString()
      // setMstatus(Number(result.data?.toString()[1]))
      setCheck(true)

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>

      <div className="flex items-center justify-center space-x-5">
        <Link href={`https://magiceden.io/collections/apechain/${Address2}`} target='_blank' className={cls(styles.backColor, "text-center my-10 text-base w-32 p-1 rounded-xl")} >Buy {address2Name.data as string}</Link>
        <Link href={`https://magiceden.io/collections/apechain/${Address1}`} target='_blank' className={cls(styles.backColor, "text-center my-10 text-base w-32 p-1 rounded-xl")} >Buy Mingle</Link>
      </div>

      <div className='rounded-2xl p-3 bg-black text-white text-center mx-10'>
        <p className="text-md font-[family-name:var(--font-pressura)]">Check if your NFT can RAID or not</p>
      </div>
      <p className='mt-10 font-[family-name:var(--font-hogfish)]'>Enter ID #</p>
      <div className="text-center space-y-3 mb-6 space-x-10 items-center justify-center mb-10">
        <input placeholder="4545" className={"text-black text-center text-base border border-red-500 rounded-md font-[family-name:var(--font-pressura)]"} onChange={e => setToken(e.target.value)}></input>
        <button
          className="ms-2 center rounded-lg bg-red-500 p-1 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
          onClick={GetUser}
        >check Gs on Ape
        </button>
        <button
          className="ms-2 center rounded-lg bg-red-500 p-1 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
          onClick={GetUser2}
        >check Mingles
        </button>
        {mstatus != 4 && check && token != "" && (
          <p className='my-8 font-[family-name:var(--font-pressura)]'>NFT is <span className='text-red-600 font-[family-name:var(--font-hogfish)]'>Registeredssssss</span></p>
        )
        }
        {id == 0 && check && token != "" && (
          <p className='my-8 font-[family-name:var(--font-pressura)]'>NFT is <span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>Not Registered</span></p>
        )
        }
        {id != 0 && mstatus == 4 && token != "" && (
          <p className='my-8 font-[family-name:var(--font-pressura)]'>NFT is <span className='text-red-600 font-[family-name:var(--font-hogfish)]'>Dead</span></p>
        )
        }
      </div>


    </>
  )
}
