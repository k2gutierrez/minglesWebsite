"use client"

import CountdownTimer from "@/components/CountdownTimer";
import CountdownTimer2 from "@/components/CountdownTimer2";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Countdown2025 from "@/components/CountdownTimer2";
import Panel from "@/components/cava/Panel";

export default function Cava() {

  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    /*if (!isConnected) {
      router.push('/')
    }*/
  }, [])

  return (
    <div className="">
      <Header />
      <div className="w-layout-blockcontainer page-wrapper w-container">

        < CountdownTimer2 />
        <Footer />
      </div>
    </div>
    /*<div className="body pagre-wrapper-layout">
      <div className="navbardummy"><Header /></div>
      <div id="w-node-_0d59f50a-56e4-eee1-f6ef-71f651fb8a6b-0fdcf260" className="mainsectionlayout">
        <div className="cava-card-wrapper">
          <div id="w-node-_2dc5565d-c6cd-6cea-6f7c-9b2d90f1ce8c-0fdcf260" className="cavabuttons">
            <div className="cavabutton">
              <div className="text-buttons-cava">CAVA PROGRAM</div>
            </div>
            <div className="cavabutton">
              <div className="text-buttons-cava">STAKE</div>
            </div>
            <div className="cavabutton">
              <div className="text-buttons-cava">CLAIM</div>
            </div>
            <div className="cavabutton">
              <div className="text-buttons-cava">DISCLAIMER</div>
            </div>
          </div>
          <div className="w-layout-grid grid-cava-program-main">
            <div className="w-layout-grid grid-cavaprogram1">
              <div id="w-node-_60cdcf82-e47a-25c8-bc6f-5e2a9c911fca-0fdcf260" className="image-cavaprogram-worms"><img src="images/CavaMinglesWorms.png" loading="lazy" sizes="(max-width: 5267px) 100vw, 5267px" srcSet="images/CavaMinglesWorms-p-500.png 500w, images/CavaMinglesWorms-p-800.png 800w, images/CavaMinglesWorms-p-1080.png 1080w, images/CavaMinglesWorms-p-1600.png 1600w, images/CavaMinglesWorms-p-2000.png 2000w, images/CavaMinglesWorms-p-2600.png 2600w, images/CavaMinglesWorms-p-3200.png 3200w, images/CavaMinglesWorms.png 5267w" alt="" className="image-wormscava" /></div>
              <div className="cavaprograminfo">
                <div className="text-blanco">TEQUILA BLANCO</div>
                <div className="div-cava-time w-clearfix">
                  <div className="div-red-cava-time">
                    <div className="text-percentage">1%</div>
                  </div>
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
                    <div className="textcavastatsbig">7</div>
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
                  <div id="w-node-_7004de30-a4ae-68d2-bb6d-a7a97e221669-0fdcf260" className="text-cavausers-info-2">5.25</div>
                  <div id="w-node-f6f83a8a-15fc-b5c8-2009-959239910451-0fdcf260" className="text-cavausers-info-2">7</div>
                  <div id="w-node-_97638b77-de1f-568f-af6e-d4c25ecc66d9-0fdcf260" className="text-cavausers-info-2">$10</div>
                  <div id="w-node-f12c6b65-7d9c-6ddb-d688-a68c4bf059b3-0fdcf260" className="text-cavausers-info-2">$70</div>
                  <div id="w-node-_30817ceb-9e99-e760-ac2b-70049ec6bb7a-0fdcf260" className="text-cavausers-info-2">104</div>
                </div>
              </div>
              <div className="w-layout-grid grid-cavausers2">
                <div id="w-node-_7532e0ca-9747-d2e0-0020-99b0dd057eff-0fdcf260" className="div-minglechecker">
                  <div className="text-mingleid">ENTER MINGLE ID</div>
                  <div className="gridminglecheker">
                    <div className="div-mingle-checker"><img src="images/MeLogo.png" loading="lazy" sizes="(max-width: 512px) 100vw, 512px" srcSet="images/MeLogo.png 500w, images/MeLogo.png 512w" alt="" className="me-logo" /></div>
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
              </div>
            </div>
          </div>
        </div>
        <div className="bg-wrapper-cava"><img src="images/CavaImage.png" loading="lazy" sizes="(max-width: 1546px) 100vw, 1546px" srcSet="images/CavaImage-p-500.png 500w, images/CavaImage-p-800.png 800w, images/CavaImage-p-1080.png 1080w, images/CavaImage.png 1546w" alt="" className="bg-image-cava" /></div>
      </div>
      <div className="footerlayout"><Footer /></div>
    </div>*/
  );
}
