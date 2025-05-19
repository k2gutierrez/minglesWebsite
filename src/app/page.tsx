"use client"

import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected){
      router.push('/lair')
    }

  }, [isConnected])
  
  return (
    <div className="mainsitebody">
      <div className="pagewrapperhome">
        <div className="background-container">
          <div className="main-footer"> <Link href={'https://apechain.com/'}  target="_blank"><img src="images/ApechainLogo.png" loading="lazy" id="w-node-e2417b1f-5e5c-faa7-1335-970d50d7ef14-6f23bd87" alt="" className="image-footer" /></Link> <Link href={'https://madeby.boredapeyachtclub.com/'}  target="_blank"><img src="images/MadeByApesLogo.png" loading="lazy" alt="" className="image-footer" /></Link> <Link href={'https://discord.gg/8XcEAhWFEH'}  target="_blank"><img src="images/DiscordLogo.png" loading="lazy" alt="" className="image-footer" /></Link>
            <div id="w-node-d21003e8-6125-d399-3b57-b347d3f86727-6f23bd87" className="text-block-16">MINGLES NFT DAO LLC</div> <Link href={'https://www.abs.xyz/'}  target="_blank"><img src="images/AbstractLogo.png" loading="lazy" alt="" className="image-footer" /></Link> <Link href={'https://x.com/MinglesNFT'} target="_blank"><img src="images/TwitterLogo.png" loading="lazy" alt="" className="image-footer" /></Link>
          </div>
          <div className="sun-div"><img src="images/MinglesSun.png" loading="lazy" sizes="100vw" srcSet="images/MinglesSun-p-500.png 500w, images/MinglesSun-p-800.png 800w, images/MinglesSun-p-1080.png 1080w, images/MinglesSun-p-1600.png 1600w, images/MinglesSun-p-2000.png 2000w, images/MinglesSun-p-2600.png 2600w, images/MinglesSun-p-3200.png 3200w, images/MinglesSun.png 15866w" alt="" className="image-sun" /></div>
          <div className="sand-div"><img src="images/Sand.png" loading="lazy" sizes="(max-width: 7535px) 100vw, 7535px" srcSet="images/Sand-p-500.png 500w, images/Sand-p-800.png 800w, images/Sand-p-1080.png 1080w, images/Sand-p-1600.png 1600w, images/Sand-p-2000.png 2000w, images/Sand-p-2600.png 2600w, images/Sand-p-3200.png 3200w, images/Sand.png 7535w" alt="" className="imagesand" /></div>
          <div className="agaveleft"><img src="images/AgaveIzquierdo.png" loading="lazy" sizes="(max-width: 4804px) 100vw, 4804px" srcSet="images/AgaveIzquierdo-p-500.png 500w, images/AgaveIzquierdo-p-800.png 800w, images/AgaveIzquierdo-p-1080.png 1080w, images/AgaveIzquierdo-p-1600.png 1600w, images/AgaveIzquierdo-p-2000.png 2000w, images/AgaveIzquierdo-p-2600.png 2600w, images/AgaveIzquierdo-p-3200.png 3200w, images/AgaveIzquierdo.png 4804w" alt="" className="agave-left-fixed" /></div>
          <div className="agaveright"><img src="images/AgaveDerecho.png" loading="lazy" sizes="(max-width: 4804px) 100vw, 4804px" srcSet="images/AgaveDerecho-p-500.png 500w, images/AgaveDerecho-p-800.png 800w, images/AgaveDerecho-p-1080.png 1080w, images/AgaveDerecho-p-1600.png 1600w, images/AgaveDerecho-p-2000.png 2000w, images/AgaveDerecho-p-2600.png 2600w, images/AgaveDerecho-p-3200.png 3200w, images/AgaveDerecho.png 4804w" alt="" className="agave-right-fixed" /></div>
          <div className="content-container">
            <div className="logo-container"><img src="images/Mingles_Logo_Negro.png" loading="lazy" sizes="(max-width: 2110px) 100vw, 2110px" srcSet="images/Mingles_Logo_Negro-p-500.png 500w, images/Mingles_Logo_Negro-p-800.png 800w, images/Mingles_Logo_Negro-p-1080.png 1080w, images/Mingles_Logo_Negro-p-1600.png 1600w, images/Mingles_Logo_Negro.png 2110w" alt="" className="logo-image" /></div>
            <div className="w-layout-grid grid-text-main">
              <div className="text-main-next-logo">OWN Tequila</div>
              <div className="text-main-next-logo">EARN Gifts</div>
              <div className="text-main-next-logo">BELONG to a community</div>
            </div>
            <div className="w-layout-grid grid-bottons-main">
              <div id="w-node-ea1f47d2-f0c0-193c-af53-0aa4e8d2ee8b-6f23bd87" className="div-login">
                <a href="lair-holders.html" className="button-login w-button" >LOG IN</a>
              </div>
              <div id="w-node-fffb23d0-a68b-3ee4-feed-574ce9a6226e-6f23bd87" className="div-connect">
                <ConnectButton
                  label="CONNECT WALLET"
                />
                
              </div>
            </div>
            <div className="w-layout-grid grid-text-main betweenworms">
              <div className="cta-mingles">MINGLES NEED YOU</div>
              <div className="cta2-mingles">Adopt one and help them RAID their Distillery back from the Giant Raven</div>
            </div>
            <div className="black-box">
              <div className="wormleft-container"><img src="images/White_Hearts_Right.png" loading="lazy" sizes="(max-width: 1525px) 100vw, 1525px" srcSet="images/White_Hearts_Right-p-500.png 500w, images/White_Hearts_Right-p-800.png 800w, images/White_Hearts_Right-p-1080.png 1080w, images/White_Hearts_Right.png 1525w" alt="" className="worms-images" /></div>
              <div className="wormrightcontainer"><img src="images/Red_Dizzy_Left.png" loading="lazy" sizes="(max-width: 1525px) 100vw, 1525px" srcSet="images/Red_Dizzy_Left-p-500.png 500w, images/Red_Dizzy_Left-p-800.png 800w, images/Red_Dizzy_Left-p-1080.png 1080w, images/Red_Dizzy_Left.png 1525w" alt="" className="worms-images" /></div>
              <div className="w-layout-grid grid-value-proposition-main">
                <div className="w-layout-grid grid-value1">
                  <div className="div-folder"><img src="images/Desktop-Icons.png" loading="lazy" alt="" className="image-folder" /></div>
                  <div className="value-prop">Tokenized Tequila</div>
                  <div className="value-explanation">Be part of a Tequila Distillery</div>
                </div>
                <div className="w-layout-grid grid-value2">
                  <div className="div-folder"><img src="images/Desktop-Icons.png" loading="lazy" alt="" className="image-folder" /></div>
                  <div className="value-prop">Socialize</div>
                  <div className="value-explanation">Be part of the best networking club</div>
                </div>
                <div className="w-layout-grid grid-value3">
                  <div className="div-folder"><img src="images/Desktop-Icons.png" loading="lazy" alt="" className="image-folder" /></div>
                  <div className="value-prop">Lifestyle</div>
                  <div className="value-explanation">International events &amp; experiences</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
