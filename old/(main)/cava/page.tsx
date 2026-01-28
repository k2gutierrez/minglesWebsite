"use client"

import CountdownTimer2 from "@/components/CountdownTimer2";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StakeModal from "@/components/cava/Stakemodal";
import ClaimModal from "@/components/cava/ClaimModal";
import DisclaimerModal from "@/components/cava/DisclaimerModal";
import axios from "axios";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { CavaNFTABI } from "@/components/engine/CavaNFTABI";
import { CavaStakeABI } from "@/components/engine/CavaStakeABI";
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { CavaNFTAddress, CavaStakeAddress, CavaNFTAddressCurtis } from "@/components/engine/CONSTANTS";
import { useAtom } from "jotai";
import { CavaTokens } from "@/components/engine/atoms";
import { parseEther } from "viem";
import { loadingAtom } from "@/components/engine/atoms";
import { RefreshCava } from "@/components/engine/atoms";
import ProgressBar from "@/components/cava/ProgressBar";
import CheckMingle from "@/components/cava/CheckMingle";

import UnstakeModal from "@/components/cava/UnstakeModal";

export default function Cava() {

  const [cavaTokens, setCavaTokens] = useAtom(CavaTokens);

  const [numTokens, setNumTokens] = useState(0)
  const { isConnected, address } = useAccount()
  const { data: hash, isPending, writeContractAsync } = useWriteContract()
  const config = useConfig()
  const [target, setTarget] = useState(10)
  const [ape, setApe] = useState(0)

  const chainId = useChainId()

  const [amount, setAmount] = useState(0)

  const [loading, setLoading] = useAtom(loadingAtom)
  const [refresh, setRefresh] = useAtom(RefreshCava)

  const aproxUsd = numTokens * target
  const liters = numTokens * .750
  const apeUsd = String(round((aproxUsd / ape), 2))

  useEffect(() => {
    if (isConnected) {
      //router.push('/')
      getApePrice()
      getCavaNFTs()
    }

  }, [isConnected, chainId])

  useEffect(() => {
    if (refresh == false && isConnected == true) {
      getCavaNFTs()
    }

  }, [refresh])

  async function getCavaNFTs() {
    const cava_curtis = `https://api-curtis.reservoir.tools/users/${address}/tokens/v10?contract=${CavaNFTAddressCurtis}&sortDirection=asc&limit=200`
    const cava_ape = `https://api-apechain.reservoir.tools/users/${address}/tokens/v10?contract=${CavaNFTAddress}&sortDirection=asc&limit=200`
    //api-apechain
    let adrr = ""
    if (chainId == 33111) {
      adrr = cava_curtis
    } else {
      adrr = cava_ape
    }

    const options = {
      method: 'GET',
      url: adrr,
      headers: { accept: '*/*', 'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR }
    };

    axios
      .request(options)
      .then(res => {
        let data1 = res.data
        let tokensArr: string[] = []
        for (let i = 0; i < data1.tokens.length; i++) {
          tokensArr.push(data1.tokens[i].token.tokenId)
        }
        setCavaTokens(tokensArr)
        setNumTokens(tokensArr.length)

      })
      .catch(err => console.error(err));
  }

  async function getApePrice() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=apecoin&vs_currencies=usd'
      );
      const data = await response.json();
      let price = Number(data.apecoin.usd) //.toFixed(3)
      let price2 = round(data.apecoin.usd, 2)
      setApe(price)
      return data.apecoin.usd;

    } catch (error) {
      console.error('Error fetching APE price:', error);
      return null; // Fallback value
    }
  }

  function round(num: number, decimals: number) {
    var n = Math.pow(10, decimals);
    return Math.round(Number((n * num).toFixed(decimals))) / n;
  }

  async function purchaseBottles() {
    const approvalHash = await writeContractAsync({
      abi: CavaNFTABI,
      address: CavaNFTAddress as `0x${string}`,
      functionName: "purchaseExtraTequilaBottle",
      args: [BigInt(amount)],
      value: parseEther("0")
    })

    const approvalReceipt = await waitForTransactionReceipt(config, {
      hash: approvalHash,
    })

    //console.log("Approval confirmed", approvalReceipt)

    if (approvalReceipt) {


      getCavaNFTs()
    }

  }

  return (
    /*<div className="">
      <Header />
      <div className="w-layout-blockcontainer page-wrapper w-container">

        < CountdownTimer2 />
        <Footer />
      </div>
    </div>*/

    <div className="body pagre-wrapper-layout">
      <div className="navbardummy"><Header /></div>
      <div id="w-node-_0d59f50a-56e4-eee1-f6ef-71f651fb8a6b-0fdcf260" className="mainsectionlayout">
        <div className="cava-card-wrapper">
          <div id="w-node-_2dc5565d-c6cd-6cea-6f7c-9b2d90f1ce8c-0fdcf260" className="cavabuttons">
            <div className="cavabutton">
              <div className="text-buttons-cava"><CheckMingle /> {/*CAVA PROGRAM*/}</div>
            </div>
            <div className="cavabutton">
              <div className="text-buttons-cava"><UnstakeModal /> {/*CAVA PROGRAM*/}</div>
            </div>

            {/*<div className="cavabutton">
              <div className="text-buttons-cava"><StakeModal /></div>
            </div>
            <div className="cavabutton">
              <div className="text-buttons-cava"><ClaimModal /></div>
            </div>*/}
            <div className="cavabutton">
              <div className="text-buttons-cava"><DisclaimerModal /></div>
            </div>
          </div>
          <div className="w-layout-grid grid-cava-program-main">
            <div id="w-node-_5aeade1c-4de0-d533-11bc-3989dafde745-0fdcf260" className="w-layout-grid grid-cavaprogram1">
              <div id="w-node-_60cdcf82-e47a-25c8-bc6f-5e2a9c911fca-0fdcf260" className="image-cavaprogram-worms"><img src="images/CavaMinglesWorms.png" loading="lazy" sizes="(max-width: 5267px) 100vw, 5267px" srcSet="images/CavaMinglesWorms-p-500.png 500w, images/CavaMinglesWorms-p-800.png 800w, images/CavaMinglesWorms-p-1080.png 1080w, images/CavaMinglesWorms-p-1600.png 1600w, images/CavaMinglesWorms-p-2000.png 2000w, images/CavaMinglesWorms-p-2600.png 2600w, images/CavaMinglesWorms-p-3200.png 3200w, images/CavaMinglesWorms.png 5267w" alt="" className="image-wormscava" /></div>
              <div className="cavaprograminfo">
                <div className="text-blanco">TEQUILA BLANCO</div>
                <div className="div-cava-time w-clearfix">
                  <ProgressBar />
                </div>
                <div className="text-reposado">TEQUILA REPOSADO</div>
              </div>
            </div>
            <div id="w-node-d7993459-da06-f0c6-4ea6-309fba962f1c-0fdcf260" className="w-layout-grid div-dashboard-cava">
              <div className="div-cavasusers">
                <div className="w-layout-grid grid-cavausers">
                  <div id="w-node-a0c9bee6-e762-f0cc-f809-b4f06fc77546-0fdcf260" className="div-cavaicon"><img src="images/Barriles_Escala.png" loading="lazy" sizes="(max-width: 696px) 100vw, 696px" srcSet="images/Barriles_Escala-p-500.png 500w, images/Barriles_Escala.png 696w" alt="" className="image-cavaicon" /></div>
                  <div id="w-node-_275bcd51-a1ac-f690-17ad-7e62696b3ac9-0fdcf260" className="div-cavastats">
                    <div className="textcavastats">TYPE</div>
                    <div className="textcavastatsbig">BLANCO</div>
                  </div>
                  <div id="w-node-_585e98b0-6927-04e2-e6c9-2e65b5ae04fd-0fdcf260" className="div-cavastats">
                    <div className="textcavastats">STATUS</div>
                    <div className="textcavastatsbig">AGING</div>
                  </div>
                  <div id="w-node-_967c3a99-41c0-096d-7f6d-5e50f90502a4-0fdcf260" className="div-cavastats">
                    <div className="textcavastats">BOTTLES</div>
                    <div className="textcavastatsbig">{numTokens}</div>
                  </div>
                </div>
                <div className="w-layout-grid grid-cavainfototal">
                  <div id="w-node-b62dcbf5-e51d-d2bc-e796-b15da87e55c9-0fdcf260" className="text-cavausers-info">LITTERS</div>
                  <div id="w-node-dcdbfa0d-44f9-9808-2418-53d3c4aed4b2-0fdcf260" className="text-cavausers-info">BOTTLES</div>
                  <div id="w-node-_5cbd1778-389a-a68f-7479-60b7b2c7e3cf-0fdcf260" className="text-cavausers-info">TARGET PRICE REPO BOTTLE</div>
                  <div id="w-node-_5aac0e94-fe9f-dac9-ab3a-f741a71e58e5-0fdcf260" className="text-cavausers-info">TOTAL USD APPROX</div>
                  <div id="w-node-_723fbdb4-c4ea-6817-9e64-dc1ab19bdeb0-0fdcf260" className="text-cavausers-info">TOTAL APE APPROX</div>
                </div>
                <div className="w-layout-grid grid-cavainfototal2">
                  <div id="w-node-_7004de30-a4ae-68d2-bb6d-a7a97e221669-0fdcf260" className="text-cavausers-info-2">{liters}</div>
                  <div id="w-node-f6f83a8a-15fc-b5c8-2009-959239910451-0fdcf260" className="text-cavausers-info-2">{numTokens}</div>
                  <div id="w-node-_97638b77-de1f-568f-af6e-d4c25ecc66d9-0fdcf260" className="text-cavausers-info-2">${target}</div>
                  <div id="w-node-f12c6b65-7d9c-6ddb-d688-a68c4bf059b3-0fdcf260" className="text-cavausers-info-2">${aproxUsd}</div>
                  <div id="w-node-_30817ceb-9e99-e760-ac2b-70049ec6bb7a-0fdcf260" className="text-cavausers-info-2">{apeUsd}</div>
                </div>
              </div>
              {/* <div className="w-layout-grid grid-cavausers2">
                <div id="w-node-_7532e0ca-9747-d2e0-0020-99b0dd057eff-0fdcf260" className="div-minglechecker">
                  <div className="text-mingleid">ENTER MINGLE ID</div>
                  <div className="gridminglecheker">
                    <div className="div-mingle-checker"><img src="images/MeLogo.png" loading="lazy" sizes="(max-width: 512px) 100vw, 512px" srcSet="images/MeLogo-p-500.png 500w, images/MeLogo.png 512w" alt="" className="me-logo" /></div>
                    <div className="div-mingle-checker">
                      <div className="div-mingle-checker-input"></div>
                      <a href="#" className="link-mingle-checker w-inline-block">
                        <div className="text-button-minglecheck">CHECK</div>
                      </a>
                    </div>
                  </div>
                  <div className="text-mingleid-claimed">CLAIMED / UNCLAIMED</div>
                </div>
                <div id="w-node-a1450ca2-3dfa-cc4e-8665-f6ca344210f6-0fdcf260" className="div-buymore">
                  <div className="text-mingleid">WANT MORE BOTTLES?</div>
                  <div className="text-mingleid-claimed">ONLY 200 MORE AVAILABLE @15 APE</div>
                  <div className="div-buymorebuttons">
                    <div className="div-20-100">
                      <div className="text-button-mint-supply">0/100</div>
                    </div>
                    <a href="#" className="link-mintmore w-inline-block">
                      <div className="text-button-minglecheck">MINT</div>
                    </a>
                  </div>
                </div>
              </div>*/}
            </div>
          </div>
        </div>
        <div className="bg-wrapper-cava"><img src="images/CavaImage.png" loading="lazy" sizes="(max-width: 1546px) 100vw, 1546px" srcSet="images/CavaImage-p-500.png 500w, images/CavaImage-p-800.png 800w, images/CavaImage-p-1080.png 1080w, images/CavaImage.png 1546w" alt="" className="bg-image-cava" /></div>
      </div>

      <div className="footerlayout"><Footer /></div>
    </div>
  );
}
