import { useState } from "react";
import styles from "./profile.module.css"
import cls from "classnames"

export default function DisclaimerModal() {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

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
                    <div className="py-1 px-1 sm:py-3 sm:px-7 py-1">DISCLAIMER</div>
                </button>

            </div>


            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center text-center justify-center">
                    <div className={cls(styles.bg, "mx-8 p-6 rounded-lg shadow-lg w-96 transform transition-transform scale-95 hover:scale-100 bg-black bg-opacity-50")}>
                        <p className='text-md md:text-xl font-[family-name:var(--font-hogfish)]'>
                            Cava Program - Disclaimer
                        </p>
                        <div className="text-justify overflow-y-scroll h-64 p-2">
                            <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            The CAVA Program is a community-driven experience designed to simulate the traditional aging process of tequila. By locking (hard staking) your MINGLES:APED tokens for 4 months, you will mint a dynamic utility NFT called CAVA, which evolves from Blanco to Reposado, and optionally to Añejo.
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            Important Notes:
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            Gifted Tequila Bottles: Mingles received 5,555 bottles of Reposado tequila as a gift from its principal investor. These are not for sale. They may be offered as 750ml samples during in-person crypto events where Mingles is officially present. The only confirmed event in 2025 is ApeFest in Las Vegas.
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            CAVA NFT Utility: The CAVA NFT is not a legal representation of ownership of any tequila bottle. It functions solely as a utility token within the Mingles ecosystem, helping us manage eligibility and distribution logistics.
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            No Financial Returns or Dividends: Mingles NFT DAO LLC will sell remaining gifted bottles through its distributor network at wholesale prices. Proceeds will be pooled into APE tokens and distributed only to CAVA NFT holders who choose to burn their NFTs during the redemption process. This is not a dividend, royalty, or investment return—it’s a voluntary, goodwill-based community reward.
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            No Guarantees: Mingles NFT DAO LLC reserves the right to limit, modify, or cancel the program at any time due to logistics, legal compliance, or market conditions.
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            Non-Security Status: CAVA NFTs are utility NFTs and do not represent securities, ownership rights, or any claim to Mingles NFT DAO LLC assets, including tequila bottles, distillery shares, or revenues.
                        </p>
                        <p className='text-xs md:text-md font-[family-name:var(--font-pressura)]'>
                            By participating in the CAVA Program, you acknowledge that this is a fun, experimental, and community-oriented initiative. We encourage all participants to review our full terms and conditions and consult with independent legal or financial advisors before taking part.
                        </p>
                        </div>
                        
                        <button
                            onClick={closeModal}
                            className={cls(styles.backColor, "py-1 px-2 my-4 rounded hover:bg-red-600")}
                        >
                            <p>Close</p>

                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}