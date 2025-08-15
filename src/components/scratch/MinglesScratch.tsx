'use client'
import Image from "next/image";

export default function MinglesScratch() {

  return (
    <>
      
      <p className="mt-5 text-black text-2xl font-[family-name:var(--font-hogfish)]">Wait for the changes!</p>

        <Image className="mt-3 rounded-2xl" src={"https://d9emswcmuvawb.cloudfront.net/PFP" + 100 + ".png"} alt="Mingle" width={300} height={300} />
      
    </>
  )
}