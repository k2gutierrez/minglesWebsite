"use client"
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Lair() {
  const [mingles, setMingles] = useState([])
  const {isConnected, address} = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected){
      router.push('/')
    }
    getMingles()
    
    console.log(mingles.length)
  }, [isConnected])

  async function getMingles() {
    const mingles_curtis = `https://api-curtis.reservoir.tools/users/${address}/tokens/v10?contract=0x9AD70bAE14e13BD39E92b88fd767a9F9370Dc63f&sortDirection=asc&limit=200`
    const mingles_ape = `https://api-apechain.reservoir.tools/users/${address}/tokens/v10?contract=0x6579cfD742D8982A7cDc4C00102D3087F6c6dd8E&sortDirection=asc&limit=200`
    //api-apechain
    const options = {
      method: 'GET',
      url: mingles_ape,
      headers: { accept: '*/*', 'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR }
    };

    axios
      .request(options)
      .then(res => {
        let data1 = res.data
        console.log("data", data1)
        setMingles(data1.tokens)
      })
      .catch(err => console.error(err));
  }

  return (
    <div className="body">
      <div className="w-layout-blockcontainer page-wrapper w-container">
        <Header />
        <div className="w-layout-grid grid-main">
          <div className="w-layout-grid user-stats">
            <div className="user-stats-info">
              <div className="w-layout-grid grid-15">
                <div id="w-node-_1e6c7ae0-be9f-292b-da78-961237b2a259-9696e6d5" className="div-mingleslair-text">
                  <div className="div-lair">
                    <div id="w-node-c7ab43d8-42f2-775d-6639-c9c41d28e657-9696e6d5" className="text-lair">MINGLES LAIR</div>
                  </div>
                  <div id="w-node-_1c204f5c-5741-573e-a309-b7e977d2b356-9696e6d5" className="w-layout-grid gm-user">
                    <div id="w-node-_52c6b39d-5c05-841c-ab32-9dd92c08e59f-9696e6d5" className="gm-text">GM</div>
                    <div id="w-node-_62a5e38f-6180-14c8-a484-d60eff083164-9696e6d5" className="userwallet-text">0x679345b73458</div>
                  </div>
                </div>
                <div id="w-node-d415ca5e-612c-626f-b930-3bfa401ee4c7-9696e6d5" className="w-layout-grid blockchain-info">
                  <div className="w-layout-grid mingles-aped-stats">
                    <div className="info-minglesaped-text">Mingles Aped</div>
                    <div className="block-mingles-aped">{mingles.length}</div>
                  </div>
                  <div className="w-layout-grid mingles-aped-staked">
                    <div className="info-staked-text">Aging (Staked)</div>
                    <div className="blockc-staked">40</div>
                  </div>
                  <div className="w-layout-grid tequila-tokens">
                    <div className="info-tequila-text">Tequila Bottles</div>
                    <div className="block-tequila">47</div>
                  </div>
                  <div className="w-layout-grid mgls">
                    <div className="info-mgls-text"></div>
                    <div className="block-mgls"></div>
                  </div>
                </div>
                <div id="w-node-_9a9015d1-e1a8-bffb-8a81-7f0e20ab80f8-9696e6d5" className="div-news-grid">
                  <div id="w-node-_1e58195a-0943-6cde-41ab-9697023e0db7-9696e6d5" className="news-info-text">Cava program is live!<br />Stake your MINGLES APED and claim TEQUILA</div>
                </div>
              </div>
            </div>
            <div className="user-stats-nfts"><img src="images/WQsCBUKs17zU.avif" loading="lazy" alt="" className="image-42" /></div>
          </div>
          <div className="w-layout-grid mingles-apps">
            <a id="w-node-_54600c35-e5dd-2614-e194-53044eb6d60d-9696e6d5" href="#" className="bannersapps w-inline-block"><img src="images/CavaProgram.png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/CavaProgram-p-500.png 500w, images/CavaProgram-p-800.png 800w, images/CavaProgram-p-1080.png 1080w, images/CavaProgram.png 1536w" alt="" className="image-36" />
              <div className="bannerapp-overlay">
                <div className="banner-texts">CAVA PROGRAM</div>
              </div>
            </a>
            <a id="w-node-bcd68dac-25e8-01b4-ec8a-7e1b1779bf7f-9696e6d5" href="#" className="bannersapps w-inline-block"><img src="images/Raven.jpg" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/Raven-p-500.jpg 500w, images/Raven-p-800.jpg 800w, images/Raven-p-1080.jpg 1080w, images/Raven-p-1600.jpg 1600w, images/Raven-p-2000.jpg 2000w, images/Raven-p-2600.jpg 2600w, images/Raven.jpg 2630w" alt="" className="image-36 prisonbreak" />
              <div className="bannerapp-overlay">
                <div className="banner-texts">MINGLES PRISON BREAK</div>
              </div>
            </a>
            <a id="w-node-_9a124655-3347-8b45-2a84-8488d2d801ba-9696e6d5" href="#" className="bannersapps w-inline-block"><img src="images/MInglesScratchOff.png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/MInglesScratchOff-p-500.png 500w, images/MInglesScratchOff-p-800.png 800w, images/MInglesScratchOff-p-1080.png 1080w, images/MInglesScratchOff-p-1600.png 1600w, images/MInglesScratchOff-p-2000.png 2000w, images/MInglesScratchOff-p-2600.png 2600w, images/MInglesScratchOff-p-3200.png 3200w, images/MInglesScratchOff.png 8043w" alt="" className="image-36 scratchoff" />
              <div className="bannerapp-overlay">
                <div className="banner-texts">SCRATCH-OFF</div>
              </div>
            </a>
            <a id="w-node-_552431aa-bde4-5c7a-e879-2e16327c675a-9696e6d5" href="#" className="bannersapps w-inline-block"><img src="images/AgaveSiege.png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/AgaveSiege-p-500.png 500w, images/AgaveSiege-p-800.png 800w, images/AgaveSiege-p-1080.png 1080w, images/AgaveSiege.png 1536w" alt="" className="image-36 siege-agave" />
              <div className="bannerapp-overlay">
                <div className="banner-texts">AGAVE SIEGE</div>
              </div>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
