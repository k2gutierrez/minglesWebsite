import { useState, useEffect } from "react";
import styles from "./profile.module.css"
import cls from "classnames"
import { useChainId, useConfig, useAccount } from "wagmi";
import { MinglesAddress, MinglesCurtis, CavaNFTAddress, CavaStakeAddress, CavaNFTAddressCurtis, CavaStakeAddressCurtis } from "../engine/CONSTANTS";
import { CheckCavaClaim } from "../engine/ClaimedTokens";

export default function CheckMingle() {
    const [isOpen, setIsOpen] = useState(false);
    const [tokens, setTokens] = useState(0)
    const [loading, setLoading] = useState(false)
    const [check, setCheck] = useState(false)
    const [mingleCheck, setMingleCheck] = useState(false)
    const { isConnected, address } = useAccount()
    const config = useConfig()
    const chainId = useChainId()

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
    }

    const checking = async () => {
        setCheck(false)
        setLoading(true)
        let checking: boolean = await CheckCavaClaim(tokens)
        console.log(checking)
        setMingleCheck(checking)
        setCheck(true)
        setLoading(false)
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
                    <div className="py-1 px-1 sm:py-3 sm:px-7 py-1">Check Unclaimed Mingle</div>
                </button>

            </div>


            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center text-center justify-center">
                    <div className={cls(styles.bg, "mx-8 p-6 rounded-lg shadow-lg w-96 transform transition-transform scale-95 hover:scale-100 bg-black bg-opacity-50")}>
                        <p className='text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            Cava Program - Check if Mingle has been Claimed
                        </p>
                        <div>
                            <input className="bg-white text-black text-center px-3 py-1 text-base" type="text" onChange={e => setTokens(Number(e.target.value))} />
                        </div>
                        {!loading && (<>
                        
                        <div>
                            <button
                                onClick={checking}
                                className={cls(styles.backColor, " px-3 py-2 my-4 rounded hover:bg-red-600")}
                            >
                                <p>CHECK</p>

                            </button>
                        </div>

                        <div>
                            {!loading && check == true && mingleCheck == true &&(<p className='text-red-500 text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                                Claimed!
                            </p>)}
                            {!loading && check == true && mingleCheck == false &&(<p className='text-green-500 text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                                Unclaimed!
                            </p>)}
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