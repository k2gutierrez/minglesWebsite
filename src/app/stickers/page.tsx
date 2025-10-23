"use client";

import Image from "next/image";
//import worm from "../../../public/images/White_Hearts_Right-p-500.png";
import { useRouter } from "next/navigation";
import vom from "../../../public/images/vomit.gif";

export default function MintBrowserPage() {

    const router = useRouter()

    const form = () => {
        router.push("https://forms.gle/EAjVm3QE6TKNAA7BA")
    }

    return (

        <main className="px-5 text-center" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ fontSize: 28, fontWeight: 800 }}>PRE-SALE</p>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ fontSize: 20, fontWeight: 800 }}>Limited Sticker Collection</p>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ fontSize: 20, fontWeight: 800 }}>Mingles Tequila</p>
            <Image src={vom} alt="Mingles-TON" width={250} height={250} />
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ opacity: 0.7, fontSize: 13 }}>We are Dropping TON stickers. Send 20 APE to this wallet <span className="font-[family-name:var(--font-pressura)]" style={{ opacity: 1, fontSize: 15 }}> 0xA3E187116bcAD707a6b12C7DeC32037a8Be45b1d </span> and register on the form below.</p>
            <p className="font-[family-name:var(--font-hogfish)] text-black" style={{ opacity: 0.7, fontSize: 13 }}>Cheers!</p>
            <button className="font-[family-name:var(--font-hogfish)] bg-red-500" onClick={form}  style={{ padding: 12, borderRadius: 12 }}>
                Register for PRE-SALE
            </button>
        </main>
    );
}