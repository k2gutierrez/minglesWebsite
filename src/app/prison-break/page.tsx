"use client"
import { useAccount } from "wagmi";
import { useEffect } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MinglesABI } from "@/components/engine/MinglesABI";
import { gameABI } from "@/components/prison/abis/gameABI";
import { useChainId, useReadContract } from "wagmi";
import { MinglesGame, MinglesGameCurtis } from "@/components/engine/CONSTANTS";
import { GameLocation, Address1, Address2, Tokens1, Tokens2 } from "@/components/engine/atoms";
import { useAtom } from "jotai";
import MingleCheck from "@/components/prison/components/MingleCheck";
import GameLogin from "@/components/prison/components/GameLogin";
import No from "@/components/prison/components/No";
import Rules from "@/components/prison/components/Rules";
import Die from "@/components/prison/components/Die";
import Patio from "@/components/prison/components/zones/Patio";
import MainHall from "@/components/prison/components/zones/MainHall";
import BackDoorTunnels from "@/components/prison/components/zones/BackDoorTunnels";
import BarrelRoom from "@/components/prison/components/zones/BarrelRoom";
import Hall1 from "@/components/prison/components/zones/Hall1";
import Hall2 from "@/components/prison/components/zones/Hall2";
import Hall3 from "@/components/prison/components/zones/Hall3";
import DistilleryRoom from "@/components/prison/components/zones/DistilleryRoom";
import OvenRoom from "@/components/prison/components/zones/OvenRoom";
import FermentationRoom from "@/components/prison/components/zones/FermentationRoom";
import PrivateCava from "@/components/prison/components/zones/PrivateCava";
import RavenNest from "@/components/prison/components/zones/RavenNest";
import BasementPrison from "@/components/prison/components/zones/BasementPrison";
import Survivor from "@/components/prison/components/zones/Survivor";

import Board from "@/components/prison/components/Board";
import NoMingle from "@/components/prison/components/NoMingle";
import SelectMingle from "@/components/prison/components/SelectMingle";
import NotLogged from "@/components/prison/components/NotLogged";
import { GameAddressAccordingToChain } from "@/components/prison/engine/engine";

export default function Prison() {

  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  const [gameLocation, setGameLocation] = useAtom(GameLocation)
  const [address1, setAddress1] = useAtom(Address1)
  const [address2, setAddress2] = useAtom(Address2)
  const [tokens1, setTokens1] = useAtom(Tokens1)
  const [tokens2, setTokens2] = useAtom(Tokens2)

  const { data: getAddress1, isSuccess: playingAddr1, refetch: getAddr1 } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getPlayingNFTsAddress1",

  })

  const { data: getAddress2, isSuccess: playingAddr2, refetch: getAddr2 } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getPlayingNFTsAddress2"
  })

  useEffect(() => {

    getAddr1();
    getAddr2();

    if (playingAddr1) {
      setAddress1(getAddress1 as string)

    }

    if (playingAddr2) {
      setAddress2(getAddress2 as string)

    }

  }, [playingAddr1, playingAddr2, chainId])

  return (
    
    <div className=" font-[family-name:var(--font-pressura)]">
      <Header />

      <div className="text-black font-[family-name:var(--font-pressura)]">
        {!isConnected && (
          <NotLogged />
        )
        }

        {gameLocation == "" && isConnected && (
          <GameLogin />
        )
        }

        {gameLocation == "no" && isConnected && (
          <No />
        )
        }
        {gameLocation == "rules" && isConnected && (
          <Rules />
        )
        }
        {gameLocation == "patio" && isConnected && (
          <Patio />
        )
        }
        {gameLocation == "mingles" && isConnected && (
          <SelectMingle />
        )
        }


        {gameLocation == "main hall" && isConnected && (
          <MainHall />
        )
        }
        {gameLocation == "dead" && isConnected && (
          <Die />
        )
        }
        {gameLocation == "back door tunnels" && isConnected && (
          <BackDoorTunnels />
        )
        }
        {gameLocation == "barrel room" && isConnected && (
          <BarrelRoom />
        )
        }
        {gameLocation == "hall1" && isConnected && (
          <Hall1 />
        )
        }
        {gameLocation == "hall2" && isConnected && (
          <Hall2 />
        )
        }
        {gameLocation == "hall3" && isConnected && (
          <Hall3 />
        )
        }
        {gameLocation == "oven room" && isConnected && (
          <OvenRoom />
        )
        }
        {gameLocation == "distillery room" && isConnected && (
          <DistilleryRoom />
        )
        }
        {gameLocation == "fermentation room" && isConnected && (
          <FermentationRoom />
        )
        }
        {gameLocation == "private cava" && isConnected && (
          <PrivateCava />
        )
        }
        {gameLocation == "raven nest" && isConnected && (
          <RavenNest />
        )
        }
        {gameLocation == "basement prison" && isConnected && (
          <BasementPrison />
        )
        }
        {/*gameLocation == "survivors" && (
          <Survivor />
        )
        */}
        {gameLocation == "board" && (
          <Board />
        )
        }

        {gameLocation == "noMingle" && (
          <NoMingle />
        )}
      </div>
      <Footer />
    </div>
    
    
  );
}