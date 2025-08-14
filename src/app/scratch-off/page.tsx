"use client"
import { useAccount, useConfig, useReadContract } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import styles from "./profile.module.css";
import { saveAs } from "file-saver";
import { ScratchCard } from "next-scratchcard";
import { useState } from "react";
import { ethers } from "ethers";
import { ABI } from "./ABI";
import { TwitterShareButton } from "react-twitter-embed";
import Link from "next/link";

import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { stringify } from "querystring";


export default function ScratchOff() {

  const CONTRACT = '0x6579cfD742D8982A7cDc4C00102D3087F6c6dd8E'
  const { address, isConnected } = useAccount()
  const config = useConfig()
  //let functionMetadata = 'tokenURI'
  //let metadataTest = 'https://ipfs.io/ipfs/QmcoeRsFYeHzPD9Gx84aKD3tjLUKjvPEMSmoPs2GQmHR1t/1'
  //let imageTest = 'https://ipfs.io/ipfs/QmY3DR3EKhLsZx1Dx1vM8HRc2xXvwjCJ6shdHV6pavc7eL/1.png'
  //const [mingleImage, setMingleImage] = useState("")
  const [id, setId] = useState("")
  const [bg, setBg] = useState("")
  const [face, setFace] = useState("")
  const [tw, setTw] = useState("")
  //const [PFPbg, setPFPBg] = useState("")
  //const [PFPface, setPFPFace] = useState("")
  //const [PFPtw, setPFPTw] = useState("")
  const [driveUrl, setDriveUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [pfp, setPfp] = useState(false)
  const [inpu, setInpu] = useState(false)
  const [fix, setFixed] = useState("items-center justify-items-center max-h-screen pt-5 pb-1 gap-16 sm:p-5 font-[family-name:var(--font-geist-sans)]")
  const [PFPUrl, setPFPUrl] = useState("")

  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [])

  const truePfp = () => {
    setPfp(true)
    setFixed("text-center px-5 justify-items-center min-h-screen px-7 pt-5 pb-1 gap-16 sm:p-5 font-[family-name:var(--font-geist-sans)]")

  }

  const resetAll = () => {
    setPfp(false)
    setInpu(false)
    setId("")
    setBg("")
    setCopied(false)
  }

  const getMingleMetadata = async () => {
    setBg("")
    setFace("")
    setTw("")

    const response = await readContract(config, {
            abi: ABI,
            address: CONTRACT as `0x${string}`,
            functionName: "tokenURI",
            args: [id] //account.address, tsSenderAddress as `0x${string}`
        })

    const URI = JSON.stringify(response)
    
    console.log("r: ", URI)
    //const mingleContract = new ethers.Contract(CONTRACT, ABI, provider)
    if (id == "") return

    if (id == "4355" || id == "5453" || id == "4927" || id == "4288" || id == "4245" || id == "4175"
      || id == "4163" || id == "3154" || id == "1172" || id == "698") {
      setDriveUrl("/assets/1of1s.png")
      setPFPUrl("/assets/1of1s.png")
      setInpu(true)
      setFixed("fixed block md:left-1/3 items-center justify-items-center max-h-screen px-5 pt-7 pb-1 gap-16 sm:p-5 font-[family-name:var(--font-geist-sans)]")

    }

    try {
      //const metadataMingles = await mingleContract.tokenURI(id)
      
      let url = 'https://ipfs.io/ipfs/' + URI.split("/")[2] + "/" + id //
      console.log(url)
      let meta = await fetch(url)
      let dataJson = await meta.json()

      let BG = dataJson.attributes[0].value
      setBg("/assets/BG/" + BG + ".png")
      let FACE = dataJson.attributes[5].value
      setFace("/assets/Face/" + FACE + ".png")
      let TW = dataJson.attributes[4].value

      setTw("/assets/Tequila Worm/" + TW + ".png")
      //let urlImage = dataJson.image.split("/")
      //setMingleImage('https://ipfs.io/ipfs/' + urlImage[2] + "/" + id + ".png")
      //:"https://ipfs.io/bafybeifvy5vwicfrwqlpf4e2e27fmemsvsknsonnzfd43jwqxfft6nerjy"

      let finalURL = "https://d9emswcmuvawb.cloudfront.net/" + id + ".png"
      setDriveUrl(finalURL)

      let pfpurl = "https://d9emswcmuvawb.cloudfront.net/PFP" + id + ".png"
      setPFPUrl(pfpurl)

      setInpu(true)
      setFixed("fixed md:left-1/3 items-center justify-items-center max-h-screen px-5 pt-7 pb-1 gap-16 sm:p-5 font-[family-name:var(--font-geist-sans)]")
    } catch (e) {
      console.error(e)
    }

  }

  const saveImage = async () => {
    const name = "Mingle#" + id + ".png"
    const imge = document.getElementById("mingle")
    const data = await fetch(imge?.src)
    const blob = await data.blob()
      .then(function (blob) {
        saveAs(blob, name);
      });
  }

  const savepfp = async () => {
    const name = "PFPMingle#" + id + ".png"
    const imge = document.getElementById("pfpmingle")
    const data = await fetch(imge?.src)
    const blob = await data.blob()
      .then(function (blob) {
        saveAs(blob, name);
      });

  }

  const getImage = async () => {
    const imge = document.getElementById("mingle")
    const data = await fetch(imge?.src)
    const blob = await data.blob()

    try {
      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        })
      ])
      setCopied(true)
      console.log("Success")

    } catch (e) {
      console.error(e)
    }

  }

  return (

    <div className={fix}>

      <h1 className={"text-center text-4xl text-black font-[family-name:var(--font-hogfish)]"}>CONGRATULATIONS</h1>

      {!inpu && (
        <div className="text-center space-y-2 mb-6">
          <p className={"text-xl mt-5 mb-2 text-black font-[family-name:var(--font-pressura)]"}>Mingles:APED ID #</p>
          <input placeholder="Mingle ID" className={"text-black text-center text-base border border-red-500  rounded-md font-[family-name:var(--font-pressura)]"} onChange={e => setId(e.target.value)}></input>
          <button
            className="ms-2 center uppercase rounded-lg bg-red-500 p-1 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            data-ripple-light="true"
            onClick={getMingleMetadata}
          >Check Mingle
          </button>
        </div>
      )

      }

      {bg != "" && (


        <div className={"text-center space-y-5 space-x-2"}>

          <p className="text-md text-center text-black my-1 font-[family-name:var(--font-pressura)]">Scratch to unbottle your Baby Mingle #{id}</p>
          <div className="flex justify-center">
            <ScratchCard onComplete={truePfp} finishPercent={50} brushSize={40} width={300} height={300}>

              <Image src={bg} className="" alt="BG" width={300} height={300} />
              <Image src={tw} className={styles.divabsolute} alt="Face" width={300} height={300} />
              <Image src={face} className={styles.divabsolute} alt="Tequila Worm" width={300} height={300} />
              <Image id="mingle" src={driveUrl} className={styles.divabsolute} alt="Tequila Worm" width={300} height={300} />


            </ScratchCard>
          </div>
          <p className="text-md text-center text-black my-3 font-[family-name:var(--font-pressura)]">Scratch the above card by swiping on it</p>

          {pfp && (
            <>
              <button
                className="ms-2 center uppercase rounded-lg bg-red-500 p-2 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                data-ripple-light="true"
                onClick={saveImage}
              >Download
              </button>
              <button
                className="center uppercase rounded-lg bg-red-500 p-2 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                data-ripple-light="true"
                onClick={getImage} ////////////////////// falta   //////////
              >Copy to Share on x
              </button>
            </>
          )

          }
          {copied && (
            <>
              <p className="text-xl text-center text-black my-3 font-[family-name:var(--font-pressura)]">Use CTRL+V on X</p>
              <div className="flex justify-center me-10">
                
                <TwitterShareButton
                  url="are finally unbottled! @minglesnft Tequila Worms"

                />
              </div>
            </>
          )
          }


          {pfp &&
            (
              <div className="mt-10 text-center">
                <h1 className={(styles.title, "text-4xl mt-10 text-black font-[family-name:var(--font-hogfish)]")}>PFP FORMAT</h1>
                <div className="flex justify-center">
                  <Image className="my-2 my-5 text-center" id="pfpmingle" src={PFPUrl} alt="PFP Mingle" width={300} height={300} />
                </div>
                <button
                  className="center uppercase rounded-lg bg-red-500 p-2 font-[family-name:var(--font-pressura)] text-sm font-bold  text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-red-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  data-ripple-light="true"
                  onClick={savepfp}
                >

                  Download

                </button>
              </div>
            )
          }




        </div>
      )
      }


      <div className="text-center mt-2">
        <Link href={"/"} onClick={resetAll}>
          <p className="text-black font-[family-name:var(--font-hogfish)]">Try another</p>
          
        </Link>
        <div className="flex justify-center">
        <Image className="" src={"/assets/MinglesLogo_Black 2.png"} alt="Mingles Logo" width={150} height={150} />
        </div>
      </div>
    </div>


  );
}