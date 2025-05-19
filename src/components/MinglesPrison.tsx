'use client'
import Image from "next/image";

export default function MinglesPrison() {

  return (
    <>
      
      <p className="mt-5 text-black text-2xl font-[family-name:var(--font-hogfish)]">Wait for next round!</p>

        <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + 1 + ".png"} alt="Mingle" width={300} height={300} />
      
    </>
  )
}