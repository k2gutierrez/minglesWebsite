"use client";

import Image from "next/image";
import worm from "../../../public/images/White_Hearts_Right-p-500.png";
import { useRouter } from "next/navigation";
import vom from "../../../public/images/vomit.gif";

export default function MintBrowserPage() {

    const router = useRouter()

    const form = () => {
        router.push("https://forms.gle/EAjVm3QE6TKNAA7BA")
    }

    return (

        <main className="font-[family-name:var(--font-hogfish)] px-5 text-center" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <p className="text-black" style={{ fontSize: 22, fontWeight: 800 }}>Mingles Tequila — At TON</p>
            <Image src={vom} alt="Mingles-TON" width={250} height={250} />
            <p className="text-black" style={{ opacity: 0.7, fontSize: 13 }}>Register on the Mingle Stickers PRE-SALE. Send 20 APE to the Address at the FORM and fill the information so we can Airdrop soon.</p>
            <p className="text-black" style={{ opacity: 0.7, fontSize: 13 }}>Cheers!</p>
            <button className="bg-red-500" onClick={form}  style={{ padding: 12, borderRadius: 12 }}>
                Register for PRE-SALE
            </button>
        </main>
    );
}