"use client";

import Image from "next/image";
import { useState } from "react";
//import worm from "../../../public/images/White_Hearts_Right-p-500.png";
import { useRouter } from "next/navigation";
import vom from "../../../public/images/vomit.gif";

export default function MintBrowserPage() {

    const [isCopied, setIsCopied] = useState(false);
    const text: string = "0xA3E187116bcAD707a6b12C7DeC32037a8Be45b1d" 

    const handleCopy = async () => {
        try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000); // Reset the copied state after 2 seconds
        } catch (err) {
        console.error("Failed to copy text:", err);
        }
    };

    const router = useRouter()

    const form = () => {
        router.push("https://forms.gle/EAjVm3QE6TKNAA7BA")
    }

    return (

        <main className="px-5 text-center" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ fontSize: 28, fontWeight: 800 }}>PRE-SALE</p>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ fontSize: 20, fontWeight: 800 }}>Limited Sticker Collection</p>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ fontSize: 20, fontWeight: 800 }}>Mingles Tequila</p>
            <Image className="p-2 mb-2" src={vom} alt="Mingles-TON" width={250} height={250} />
            <p className="font-[family-name:var(--font-pressura)] text-black pt-1" style={{ opacity: 0.7, fontSize: 13 }}>We are Dropping TON stickers. Send 20 APE to the wallet below and register on the form.</p>
            <button className="font-[family-name:var(--font-hogfish)]" onClick={handleCopy} style={{ padding: 12, borderRadius: 12, backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}>
                {isCopied ? "Copied!" : "Copy Address"}
            </button>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ opacity: 0.7, fontSize: 13 }}>Cheers!</p>
            <button className="font-[family-name:var(--font-hogfish)] bg-red-500" onClick={form}  style={{ padding: 12, borderRadius: 12 }}>
                Register for PRE-SALE
            </button>
        </main>
    );
}