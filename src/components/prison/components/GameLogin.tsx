'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import { useState, useEffect } from 'react';
import prize from "/public/assets/prize.jpg";
import { gameABI } from "../abis/gameABI";
import axios from "axios";
import { useAccount, useReadContract, useChainId, useConfig } from "wagmi";
import { useAtom } from "jotai";
import { GameLocation, Address1, Address2, Tokens1, Tokens2 } from "@/components/engine/atoms";
import { readContract } from "@wagmi/core";
import { MinglesGame, MinglesGameCurtis } from "@/components/engine/CONSTANTS";
import { GameAddressAccordingToChain } from "../engine/engine";
import { mingleABI } from "../abis/mingleABI";

export default function GameLogin() {

  interface Token {
    id: string;
    name: string;
    collection: string;
  }

  interface Prize {
    PrizeContract: string;
    PrizeId: number;
  }

  const config = useConfig()
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  const [gameLocation, setGameLocation] = useAtom(GameLocation)
  const [address1, setAddress1] = useAtom(Address1)
  const [address2, setAddress2] = useAtom(Address2)
  const [tokens1, setTokens1] = useAtom(Tokens1)
  const [tokens2, setTokens2] = useAtom(Tokens2)

  const [accepted, setAccepted] = useState(false)
  const [prizeName, setPrizeName] = useState("")
  const [prizeId, setPrizeId] = useState(0)
  const [prizeContract, setPrizeContract] = useState("")
  const [tokenImage, setTokenImage] = useState("")

  const [alive, setAlive] = useState(null)

  useEffect(() => {
    prizeInfo()
  })

  async function getMingles() {
    let gameAddressURL;
    if (chainId == 33111) {
      gameAddressURL = `https://api-curtis.reservoir.tools/users/${address}/tokens/v10?contract=${address1}&sortDirection=asc&limit=200`
    } else {
      gameAddressURL = `https://api-apechain.reservoir.tools/users/${address}/tokens/v10?contract=${address1}&sortDirection=asc&limit=200`
    }

    const options = {
      method: 'GET',
      url: gameAddressURL,
      headers: { accept: '*/*', 'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR }
    };

    axios
      .request(options)
      .then(res => {
        let array1: Token[] = [];
        let data1 = res.data.tokens
        for (let i = 0; i < data1.length; i++) {
          let data: Token = {
            id: data1[i].token.tokenId,
            name: data1[i].token.collection.name,
            collection: data1[i].token.contract
          }
          array1.push(data)
        }
        setTokens1(array1)

      })
      .catch(err => console.error(err));
  }

  async function getSecondAddressTokens() {

    let gameAddressURL;
    if (chainId == 33111) {
      gameAddressURL = `https://api-curtis.reservoir.tools/users/${address}/tokens/v10?contract=${address2}&sortDirection=asc&limit=200`
    } else {
      gameAddressURL = `https://api-apechain.reservoir.tools/users/${address}/tokens/v10?contract=${address2}&sortDirection=asc&limit=200`
    }

    const options = {
      method: 'GET',
      url: gameAddressURL,
      headers: { accept: '*/*', 'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR }
    };

    axios
      .request(options)
      .then(res => {
        let array2: Token[] = [];
        let data1 = res.data.tokens
        for (let i = 0; i < data1.length; i++) {
          let data: Token = {
            id: data1[i].token.tokenId,
            name: data1[i].token.collection.name,
            collection: data1[i].token.contract
          }
          array2.push(data)
        }
        setTokens2(array2)

      })
      .catch(err => console.error(err));
  }

  async function getCollections() {
    await getMingles();
    await getSecondAddressTokens();

    setGameLocation("mingles")

  }

  async function prizeInfo () {
    try {

      const result = await readContract(config, {
      abi: gameABI,
      address: GameAddressAccordingToChain(chainId) as `0x${string}`,
      functionName: 'getPrizeInfo',
    }) as Prize[]

    setPrizeId(Number(result[1]))
    setPrizeContract(result[0].toString())

    const info = await readContract(config, {
      abi: mingleABI,
      address: result[0].toString() as `0x${string}`,
      functionName: 'name',
    })

    setPrizeName(info as string)

    const metadata = await readContract(config, {
          abi: mingleABI,
          address: prizeContract as `0x${string}`,
          functionName: 'tokenURI',
          args: [prizeId]
        })
  
        let url = 'https://ipfs.io/ipfs/' + metadata?.toString().split("/")[2] + "/" + prizeId
        let meta = await fetch(url)
        let dataJson = await meta.json()
        let imageURL = 'https://ipfs.io/ipfs/' + dataJson.image.split("/")[2] + "/" + dataJson.image.split("/")[3]
        setTokenImage(imageURL)

    } catch (e) {
      console.error(e)
    }

  }

  const { data: GetPausedStatus } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getGamePausedStatus",

  })

  const goNoMingle = () => {
    setGameLocation("noMingle")
  }

  async function GetMingleMetadata(id: number) {
  
      if (id == null) return
  
      try {
        const metadata = await readContract(config, {
          abi: mingleABI,
          address: prizeContract as `0x${string}`,
          functionName: 'tokenURI',
          args: [id]
        })
  
        let url = 'https://ipfs.io/ipfs/' + metadata?.toString().split("/")[2] + "/" + id
        let meta = await fetch(url)
        let dataJson = await meta.json()
        let imageURL = 'https://ipfs.io/ipfs/' + dataJson.image.split("/")[2] + "/" + dataJson.image.split("/")[3]
        setTokenImage(imageURL)
  
      } catch (e) {
        console.error(e)
      }
    }

  return (
    <div className="pb-14">
      <div className={cls("flex text-center mt-3 mb-10 pb-10")}>

        <div className={cls(styles.backColor, "z-0 justify-items-center text-center items-end rounded-2xl h-56 w-56 m-5")}>
          <div className={cls(styles.marginBack, "z-10  text-center h-40 w-40")}> {/*   */}
            <Image className="rounded-2xl" src={tokenImage} alt="Mingles Game Prize" width={180} height={180} />
          </div>
          <div className={cls(styles.marginBack2)}>
            <p className="pt-20 text-black text-xs font-[family-name:var(--font-hogfish)]">MINGLES</p>
            <p className="text-xs text-white font-[family-name:var(--font-pressura)]">Worms Raid</p>
            <p className="px-5 mb-2 text-black text-xs font-[family-name:var(--font-pressura)]">
              Defeat the GIANT RAVEN
            </p>
            <p className="px-5 mb-2 text-black text-xs font-[family-name:var(--font-pressura)]">
              &
            </p>
            <p className="px-5 mb-2 text-black text-xs font-[family-name:var(--font-pressura)]">
              Win {prizeName} #{prizeId}
            </p>

          </div>

        </div>

      </div>

      <div className="">



        {alive == 0 && GetPausedStatus ?
          (
            <div className="grid text-center">
              <p className="my-5 text-black text-2xl font-[family-name:var(--font-hogfish)]">The Raven wins</p>
              <video className="px-5" width="600" height="600" autoPlay loop controls preload="none">
                <source src="/videos/Dead.mov" />
                Your browser does not support the video tag.
              </video>
              <p className="mt-5 text-black text-md font-[family-name:var(--font-pressura)]">Pathetic.</p>
              <p className="mt-2 text-black text-md font-[family-name:var(--font-pressura)]">You never stood a chance.</p>
              <p className="mt-4 text-black text-md font-[family-name:var(--font-pressura)]">Try again... if you dare!</p>
              <p className="mt-4 mb-5 text-black text-md font-[family-name:var(--font-pressura)]"><span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>WAIT</span> for the game to <span className='text-blue-600 font-[family-name:var(--font-hogfish)]'>RESET</span></p>
            </div>
          ) : (
            accepted ? (
              <div className="flex items-center justify-center">
                <button className={cls(styles.backColor, "my-8 text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={getCollections} >Enlist Tokens</button> {/** getCollections */}
                <button className={cls(styles.backColor, "my-8 text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={goNoMingle} >Purchase Tokens</button>
              </div>
            ) : (
              <>
                <p className=" px-5 mt-10 mb-2 text-black text-center text-sm font-[family-name:var(--font-pressura)]">
                  Max. 200 Mingles per account
                </p>
                <p className="my-10 text-center text-black text-md font-[family-name:var(--font-hogfish)]">DO YOU ACCEPT THE CALL?</p>
                <div className="flex items-center justify-center">
                  <button className={cls(styles.backColor, "text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={() => setAccepted(true)}>Yes</button>
                  <button className={cls(styles.backColor, "text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={() => setGameLocation("no")}>No</button>
                </div>
              </>
            )


          )
        }
        {isConnected &&
          (
            <>
              <div className="flex items-center justify-center">
                <button className={cls(styles.backColor, "my-3 text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={() => setGameLocation("rules")} >RULES</button>
              </div>
              <div className="flex mb-5 items-center justify-center">
                <button className={cls(styles.backColor, "my-2 text-base mx-5 w-32 p-1 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:shadow-lg hover:shadow-green-600/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none")} onClick={() => setGameLocation("board")} >Check the Playerboard</button>
              </div>
            </>
          )
        }

      </div>

    </div>
  )
}
