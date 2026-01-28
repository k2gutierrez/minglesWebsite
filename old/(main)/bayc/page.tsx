'use client'
import { GetBAYCTokens } from "./GetTokens";
import { useEffect } from "react";

export default function BAYC() {

  useEffect(() => {
    getTokens()
  }, [])

  async function getTokens() {
    const tokens = await GetBAYCTokens()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white pt-8">
    
    </main>
  );
}