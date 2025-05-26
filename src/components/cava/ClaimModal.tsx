import { useState, useEffect } from "react";
import styles from "./profile.module.css"
import cls from "classnames"
import { useChainId, useConfig, useAccount, useWriteContract, useReadContract } from "wagmi";
import { CavaNFTABI } from "../engine/CavaNFTABI";
import { CavaStakeABI } from "../engine/CavaStakeABI";
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { CavaNFTAddress, CavaStakeAddress, CavaNFTAddressCurtis, CavaStakeAddressCurtis } from "../engine/CONSTANTS";

export default function ClaimModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [numTokens, setNumTokens] = useState(0)
    const { isConnected, address } = useAccount()
    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const config = useConfig()
    const chainId = useChainId()

    const [loading, setLoading] = useState(false)

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    useEffect(() => {
        if (isConnected) {
            stakedNumber()
        }

    }, [isConnected, loading])

    async function claimTequilaTokens() {

        //CavaNFTAddress, CavaStakeAddress, CavaNFTAddressCurtis, CavaStakeAddressCurtis
        setLoading(true)

        let CavaNFTAddrr = ""
        let CavaStakeAddrr = ""
        if (chainId == 33111) {
            CavaNFTAddrr = CavaNFTAddressCurtis
            CavaStakeAddrr = CavaStakeAddressCurtis
        } else {
            CavaNFTAddrr = CavaNFTAddress
            CavaStakeAddrr = CavaStakeAddress
        }

        const mintHash = await writeContractAsync({
            abi: CavaNFTABI,
            address: CavaNFTAddrr as `0x${string}`,
            functionName: "mint",
            args: [],
        })
        const mintReceipt = await waitForTransactionReceipt(config, {
            hash: mintHash,
        })

        console.log("Mint confirmed", mintReceipt)
        setLoading(false)
        if (mintReceipt) {
            await stakedNumber()
            closeModal
        }
    }

    async function stakedNumber() {

        let CavaStakeAddrr = ""
        if (chainId == 33111) {
            CavaStakeAddrr = CavaStakeAddressCurtis
        } else {
            CavaStakeAddrr = CavaStakeAddress
        }

        const result = await readContract(config, {
            abi: CavaStakeABI,
            address: CavaStakeAddrr as `0x${string}`,
            functionName: 'getUserTotalStaked',
            args: [address],
        })

        const result2 = await readContract(config, {
            abi: CavaStakeABI,
            address: CavaStakeAddrr as `0x${string}`,
            functionName: 'getUserAlreadyStaked',
            args: [address],
        })

        let num = Number(result) - Number(result2)

        setNumTokens(num)
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
                    <div className="cavabutton py-5 px-10">CLAIM</div>
                </button>

            </div>


            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center text-center justify-center">
                    <div className={cls(styles.bg, "mx-8 p-6 rounded-lg shadow-lg w-96 transform transition-transform scale-95 hover:scale-100 bg-black bg-opacity-50")}>
                        <p className='text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            Cava Program
                        </p>

                            <p className='my-3 text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                                HERO CAN CLAIM
                            </p>
                            <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                                {numTokens} CavaNFTs
                            </p>
                            {!loading && (<><div>
                                <button
                                    onClick={claimTequilaTokens}
                                    className={cls(styles.backColor, " px-3 py-2 my-4 rounded hover:bg-red-600")}
                                >
                                    <p>Claim Cava NFTs</p>

                                </button>
                            </div>
                            <button
                                onClick={closeModal}
                                className={cls(styles.backColor, "py-1 px-2 my-4 rounded hover:bg-red-600")}
                            >
                                <p>Close</p>

                            </button></>
                        )}
                        {loading &&
                            (
                                <div className="flex justify-center items-center">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )
                        }
                    </div>
                </div>
            )}

        </div>
    );
}