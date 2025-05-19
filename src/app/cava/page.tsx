"use client"

import CountdownTimer from "@/components/CountdownTimer";
import CountdownTimer2 from "@/components/CountdownTimer2";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Countdown2025 from "@/components/CountdownTimer2";

export default function Cava() {

  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    /*if (!isConnected) {
      router.push('/')
    }*/
  }, [])

  return (
    <div className="body">
      <Header />
      <div className="w-layout-blockcontainer page-wrapper w-container">

        < CountdownTimer2 />

      </div>
      <Footer />
    </div>
  );
}
