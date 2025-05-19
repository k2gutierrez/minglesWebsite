"use client"
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {

  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected])

  return (
    <div className="body">
      <Header />
      <div className="w-layout-blockcontainer page-wrapper w-container">

        <div className="w-layout-grid grid-main">
          <div className="w-layout-grid aboutsection-icons">
            <div id="w-node-_41e40b4e-dfd2-f84c-b64e-37c334a58058-de3e732c" className="we-are-about">
              <div className="title-about">WE ARE</div>
              <div className="text-about">The first community-owned tequila media franchise where scarce digital memberships unlock distillery equity, voting power over the brand’s direction, and a share of its revenues</div>
            </div>
            <div className="w-layout-grid grid-icons-main">
              <div id="w-node-_348bb612-4c4c-bc22-9733-10f775b158d0-de3e732c" className="iconsapps">
                <div className="w-layout-grid grid-icons-about"><img src="images/OWN.png" loading="lazy" id="w-node-_348bb612-4c4c-bc22-9733-10f775b158d2-de3e732c" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" alt="" srcSet="images/OWN-p-500.png 500w, images/OWN-p-800.png 800w, images/OWN-p-1080.png 1080w, images/OWN.png 1525w" className="iconsabout" />
                  <div className="title-icons-about">OWN</div>
                  <div className="icon-about-text">Members are part of a proven tequila distillery.<br /></div>
                </div>
              </div>
              <div id="w-node-_9d924f87-fce4-0671-db06-0efa049064ff-de3e732c" className="iconsapps">
                <div className="w-layout-grid grid-icons-about"><img src="images/EARN.png" loading="lazy" id="w-node-_9d924f87-fce4-0671-db06-0efa04906501-de3e732c" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" alt="" srcSet="images/EARN-p-500.png 500w, images/EARN-p-800.png 800w, images/EARN-p-1080.png 1080w, images/EARN.png 1525w" className="iconsabout" />
                  <div className="title-icons-about">EARN</div>
                  <div className="icon-about-text">Gifts<br />Rising membership resale value<br />Licensing benefits</div>
                </div>
              </div>
              <div id="w-node-a10ea298-4a15-71db-796b-ca0a795f084e-de3e732c" className="iconsapps">
                <div className="w-layout-grid grid-icons-about"><img src="images/BELONG.png" loading="lazy" id="w-node-a10ea298-4a15-71db-796b-ca0a795f0850-de3e732c" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" alt="" srcSet="images/BELONG-p-500.png 500w, images/BELONG-p-800.png 800w, images/BELONG-p-1080.png 1080w, images/BELONG.png 1525w" className="iconsabout" />
                  <div className="title-icons-about">BELONG</div>
                  <div id="w-node-a10ea298-4a15-71db-796b-ca0a795f0853-de3e732c" className="icon-about-text">Story-driven club<br />Voting rights<br />Live experiences</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-layout-grid aboutsection2">
            <div id="w-node-_59496930-62dc-902f-daac-8cec79be5cd3-de3e732c" className="milestones-about">
              <div className="title-about">MILESTONES</div>
              <div className="text-about">Trust results, trust the process.</div>
            </div>
            <div className="w-layout-grid grid-26">
              <a id="w-node-_59496930-62dc-902f-daac-8cec79be5cd9-de3e732c" href="#" className="aboutapps w-inline-block">
                <div className="w-layout-grid grid-polaroids"><img src="images/Screenshot-2025-05-15-at-12.21.48-a.m..png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/Screenshot-2025-05-15-at-12.21.48-a.m.-p-500.png 500w, images/Screenshot-2025-05-15-at-12.21.48-a.m.-p-800.png 800w, images/Screenshot-2025-05-15-at-12.21.48-a.m.-p-1080.png 1080w, images/Screenshot-2025-05-15-at-12.21.48-a.m.-p-1600.png 1600w, images/Screenshot-2025-05-15-at-12.21.48-a.m..png 1694w" alt="" className="image-polaroids" />
                  <div id="w-node-_59496930-62dc-902f-daac-8cec79be5cdc-de3e732c" className="text-grid-milestones">GENESIS COLLECTION</div>
                </div>
              </a>
              <a id="w-node-_59496930-62dc-902f-daac-8cec79be5cde-de3e732c" href="#" className="aboutapps w-inline-block">
                <div className="w-layout-grid grid-polaroids"><img src="images/Screenshot-2025-05-15-at-12.56.09-a.m..png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 860px" srcSet="images/Screenshot-2025-05-15-at-12.56.09-a.m.-p-500.png 500w, images/Screenshot-2025-05-15-at-12.56.09-a.m.-p-800.png 800w, images/Screenshot-2025-05-15-at-12.56.09-a.m..png 860w" alt="" className="image-polaroids" />
                  <div className="text-grid-milestones">TEQUILA PARTNER</div>
                </div>
              </a>
              <a id="w-node-_59496930-62dc-902f-daac-8cec79be5ce3-de3e732c" href="#" className="aboutapps w-inline-block">
                <div className="w-layout-grid grid-polaroids"><img src="images/Screenshot-2025-05-15-at-12.23.32-a.m..png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 816px" srcSet="images/Screenshot-2025-05-15-at-12.23.32-a.m.-p-500.png 500w, images/Screenshot-2025-05-15-at-12.23.32-a.m.-p-800.png 800w, images/Screenshot-2025-05-15-at-12.23.32-a.m..png 816w" alt="" className="image-polaroids" />
                  <div className="text-grid-milestones">TEQUILA GIFT</div>
                </div>
              </a>
              <a id="w-node-_59496930-62dc-902f-daac-8cec79be5ce8-de3e732c" href="#" className="aboutapps w-inline-block">
                <div className="w-layout-grid grid-polaroids"><img src="images/Screenshot-2025-05-15-at-12.25.30-a.m..png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/Screenshot-2025-05-15-at-12.25.30-a.m.-p-500.png 500w, images/Screenshot-2025-05-15-at-12.25.30-a.m.-p-800.png 800w, images/Screenshot-2025-05-15-at-12.25.30-a.m.-p-1080.png 1080w, images/Screenshot-2025-05-15-at-12.25.30-a.m.-p-1600.png 1600w, images/Screenshot-2025-05-15-at-12.25.30-a.m.-p-2000.png 2000w, images/Screenshot-2025-05-15-at-12.25.30-a.m.-p-2600.png 2600w, images/Screenshot-2025-05-15-at-12.25.30-a.m..png 2678w" alt="" className="image-polaroids" />
                  <div className="text-grid-milestones">TEQUILA COMMUNITY</div>
                </div>
              </a>
              <a id="w-node-_59496930-62dc-902f-daac-8cec79be5ced-de3e732c" href="#" className="aboutapps w-inline-block">
                <div className="w-layout-grid grid-polaroids"><img src="images/Screenshot-2025-05-15-at-12.31.23-a.m..png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/Screenshot-2025-05-15-at-12.31.23-a.m.-p-500.png 500w, images/Screenshot-2025-05-15-at-12.31.23-a.m.-p-800.png 800w, images/Screenshot-2025-05-15-at-12.31.23-a.m.-p-1080.png 1080w, images/Screenshot-2025-05-15-at-12.31.23-a.m..png 1356w" alt="" className="image-polaroids" />
                  <div className="text-grid-milestones">IRL EVENTS</div>
                </div>
              </a>
              <a id="w-node-_59496930-62dc-902f-daac-8cec79be5cf2-de3e732c" href="#" className="aboutapps w-inline-block">
                <div className="w-layout-grid grid-polaroids"><img src="images/Screenshot-2025-05-15-at-12.34.00-a.m..png" loading="lazy" sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px" srcSet="images/Screenshot-2025-05-15-at-12.34.00-a.m.-p-500.png 500w, images/Screenshot-2025-05-15-at-12.34.00-a.m.-p-800.png 800w, images/Screenshot-2025-05-15-at-12.34.00-a.m.-p-1080.png 1080w, images/Screenshot-2025-05-15-at-12.34.00-a.m..png 1106w" alt="" className="image-polaroids" />
                  <div className="text-grid-milestones">GAMIFIED EXPERIENCES</div>
                </div>
              </a>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
