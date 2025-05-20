"use client"
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MinglesScratch from "@/components/MinglesScratch";

export default function ScratchOff() {

  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    /*if (!isConnected) {
      router.push('/')
    }*/
  }, [])

  return (
    <div className=" font-[family-name:var(--font-pressura)]">
      <Header />
      <div className="w-layout-blockcontainer page-wrapper w-container">

        <div className="text-center align-items-center p-3">
          <MinglesScratch />
        </div>

      </div>
      <Footer />
    </div>
  );
}
