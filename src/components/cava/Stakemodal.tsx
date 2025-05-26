import { useState, useEffect } from "react";
import styles from "./profile.module.css"
import cls from "classnames"
import Link from "next/link";
import { Tokens } from "../engine/atoms";
import { useAtom } from "jotai";
import { loadingAtom } from "../engine/atoms";
import axios from "axios";
import { useChainId, useConfig, useAccount, useWriteContract, useReadContract } from "wagmi";
import { MinglesABI } from "../engine/MinglesABI";
import { CavaNFTABI } from "../engine/CavaNFTABI";
import { CavaStakeABI } from "../engine/CavaStakeABI";
import { CURTISNFT } from "../engine/MinglesCurtis";
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { MinglesAddress, MinglesCurtis, CavaNFTAddress, CavaStakeAddress, CavaNFTAddressCurtis, CavaStakeAddressCurtis } from "../engine/CONSTANTS";

export default function StakeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mingles, setMingles] = useAtom(Tokens);
    const [tokens, setTokens] = useState([0])
    const [amount, setAmount] = useState(0)
    const [numTokens, setNumTokens] = useState(0)
    const { isConnected, address } = useAccount()
    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const config = useConfig()
    const chainId = useChainId()

    const [loading, setLoading] = useAtom(loadingAtom)

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    useEffect(() => {
        if (isConnected) {
            getMingles()

        }
        getArray(amount)

    }, [isConnected, amount, loading])

    async function getMingles() {

        const mingles_curtis = `https://api-curtis.reservoir.tools/users/${address}/tokens/v10?contract=${MinglesCurtis}&sortDirection=asc&limit=200`
        const mingles_ape = `https://api-apechain.reservoir.tools/users/${address}/tokens/v10?contract=${MinglesAddress}&sortDirection=asc&limit=200`
        //api-apechain
        let adrr = ""
        if (chainId == 33111) {
            adrr = mingles_curtis
        } else {
            adrr = mingles_ape
        }
        const options = {
            method: 'GET',
            url: adrr,
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
                setNumTokens(tokensArr.length)
                console.log(tokensArr)

            })
            .catch(err => console.error(err));
    }

    function getArray(amount: number) {
        let arr: number[] = [];
        let newArr = mingles.slice(0, amount)
        for (let i = 0; i < newArr.length; i++) {
            arr.push(Number(mingles[i]))
        }
        setTokens(arr)

    }

    async function handleApprovalAndStaking() {
        setLoading(true)
        //MinglesAddress, MinglesCurtis, CavaNFTAddress, CavaStakeAddress, CavaNFTAddressCurtis, CavaStakeAddressCurtis
        let MingleAddrr = ""
        let CavaStakeAddrr = ""
        if (chainId == 33111) {
            MingleAddrr = MinglesCurtis
            CavaStakeAddrr = CavaStakeAddressCurtis
        } else {
            MingleAddrr = MinglesAddress
            CavaStakeAddrr = CavaStakeAddress
        }

        const check = await readContract(config, {
            abi: MinglesABI,
            address: MingleAddrr as `0x${string}`,
            functionName: 'isApprovedForAll',
            args: [address, CavaStakeAddrr]
        })

        if (check) {
            const staking = await writeContractAsync({
                abi: CavaStakeABI,
                address: CavaStakeAddrr as `0x${string}`,
                functionName: "stakeNfts",
                args: [
                    tokens
                ],
            })
            setLoading(false)
            await getMingles()

            closeModal()

        } else {
            const approvalHash = await writeContractAsync({
                abi: MinglesABI,
                address: MingleAddrr as `0x${string}`,
                functionName: "setApprovalForAll",
                args: [
                    CavaStakeAddrr,
                    true
                ],
            })
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash,
            })

            console.log("Approval confirmed", approvalReceipt)

            if (approvalReceipt) {
                const staking = await writeContractAsync({
                    abi: CavaStakeABI,
                    address: CavaStakeAddrr as `0x${string}`,
                    functionName: "stakeNfts",
                    args: [
                        tokens
                    ],
                })
                
                await getMingles()
                setLoading(false)
                
                closeModal()

            }

        }

    }

    return (
        <div className="">
            {/*<button
                onClick={openModal}
                className={cls(styles.backColor, "px-4 py-2 text-white rounded hover:bg-red-600")}
            >
                Abrir Modal
            </button>*/}
            <div className="">
                <button onClick={openModal} type="button" >
                    <div className="cavabutton py-5 px-10">STAKE</div>
                </button>

            </div>


            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center text-center justify-center">
                    <div className={cls(styles.bg, "mx-8 p-6 rounded-lg shadow-lg w-96 transform transition-transform scale-95 hover:scale-100 bg-black bg-opacity-50")}>
                        <p className='text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            Cava Program
                        </p>
                        <p className='my-3 text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            {numTokens} Mingles to stack
                        </p>
                        <p className='my-3 text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            HERO CAN CLAIM
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            {numTokens} Bottles
                        </p>
                        {!loading && (<><div>
                            <input className="bg-white text-black text-center px-3 py-1 text-base" min={1} max={numTokens} type="number" onChange={e => setAmount(Number(e.target.value))} />
                        </div>
                        <div>
                            <button
                                onClick={handleApprovalAndStaking}
                                className={cls(styles.backColor, " px-3 py-2 my-4 rounded hover:bg-red-600")}
                            >
                                <p>Stake Mingles</p>

                            </button>
                        </div>
                        <button
                            onClick={closeModal}
                            className={cls(styles.backColor, "py-1 px-2 my-4 rounded hover:bg-red-600")}
                        >
                            <p>Close</p>

                        </button></>)}
                        {loading && (
                            <div className="flex justify-center items-center">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}