import { useState, useEffect } from "react";
import styles from "./profile.module.css"
import cls from "classnames"
import Link from "next/link";
import { Tokens } from "../engine/atoms";
import { useAtom } from "jotai";
import axios from "axios";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { MinglesABI } from "../engine/MinglesABI";
import { readContract, waitForTransactionReceipt } from "@wagmi/core"

export default function StakeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mingles, setMingles] = useAtom(Tokens);
    const [tokens, setTokens] = useState([0])
    const [amount, setAmount] = useState(0)
    const { isConnected, address } = useAccount()
    const {data: hash, isPending, writeContractAsync} = useWriteContract()
    const config = useConfig()

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    useEffect(() => {
        if (isConnected) {
            getMingles()
            
        }
        getArray(amount)

    }, [isConnected, amount])

    async function getMingles() {
    const mingles_curtis = `https://api-curtis.reservoir.tools/users/${address}/tokens/v10?contract=0x9AD70bAE14e13BD39E92b88fd767a9F9370Dc63f&sortDirection=asc&limit=200`
    const mingles_ape = `https://api-apechain.reservoir.tools/users/${address}/tokens/v10?contract=0x6579cfD742D8982A7cDc4C00102D3087F6c6dd8E&sortDirection=asc&limit=200`
    //api-apechain
    const options = {
      method: 'GET',
      url: mingles_ape,
      headers: { accept: '*/*', 'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR }
    };

    axios
      .request(options)
      .then(res => {
        let data1 = res.data
        let tokensArr: string[] = []
        for (let i = 0; i < data1.tokens.length; i++) {
          tokensArr.push(data1.tokens[i].token.tokenId)
        }
        setMingles(tokensArr)
        console.log(tokensArr)

      })
      .catch(err => console.error(err));
  }

  function getArray(amount : number){
    let arr : number[] = [];
    let newArr = mingles.slice(0, amount)
    for (let i = 0; i < newArr.length; i++){
        arr.push(Number(mingles[i]))
    }
    setTokens(arr)
    console.log(arr)
  }

  async function handleApproval() {
        const approvalHash = await writeContractAsync({
            abi: MinglesABI,
            address: "0x6579cfD742D8982A7cDc4C00102D3087F6c6dd8E" as `0x${string}`,
            functionName: "setApprovalForAll",
            args: [tokens],
        })
        const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
        })

        console.log("Approval confirmed", approvalReceipt)

    }

    return (
        <div className="">
            {/*<button
                onClick={openModal}
                className={cls(styles.backColor, "px-4 py-2 text-white rounded hover:bg-red-600")}
            >
                Abrir Modal
            </button>*/}
            <button onClick={openModal} type="button" >
                <div className="text-buttons-cava">STAKE</div>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center text-center justify-center bg-black bg-opacity-50">
                    <div className={cls(styles.bg, "mx-8 p-6 rounded-lg shadow-lg w-96 transform transition-transform scale-95 hover:scale-100")}>
                        <p className='text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            Cava Program
                        </p>
                        <p className='my-3 text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            56 Mingles to stack
                        </p>
                        <p className='my-3 text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            HERO CAN CLAIM
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            56 Bottles
                        </p>
                        <div>
                            <input className="bg-white" type="number" onChange={e => setAmount(Number(e.target.value))} />
                        </div>
                        <div>
                            <button
                                onClick={handleApproval}
                                className={cls(styles.backColor, " px-3 py-2 my-4 rounded hover:bg-red-600")}
                            >
                                <p>Stake Mingles</p>
                                
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}