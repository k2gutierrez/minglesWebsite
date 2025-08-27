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

  const { data: getAddress1, isSuccess: playingAddr1 } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getPlayingNFTsAddress1",

  })

  const { data: getAddress2, isSuccess: playingAddr2 } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getPlayingNFTsAddress2"
  })

  useEffect(() => {
    if (playingAddr1) {
      setAddress1(getAddress1 as string)

    }

    if (playingAddr2) {
      setAddress2(getAddress2 as string)

    }

  }, [playingAddr1, playingAddr2])

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

/*
        s_mainHall = s_pathways[0];
        s_backkdoorTunnels = s_pathways[1];
        s_ovenRoom = s_pathways[2];
        s_distilleryRoom = s_pathways[3];
        s_barrelRoom = s_pathways[4];
        s_hall1 = s_pathways[5];
        s_hall2 = s_pathways[6];
        s_hall3 = s_pathways[7];
        s_fermentationRoom1 = s_pathways[8];
        s_fermentationRoom2 = s_pathways[9];
        s_privateCava1 = s_pathways[10];
        s_privateCava2 = s_pathways[11];
        s_ravenNest1 = s_pathways[12];
        s_ravenNest2 = s_pathways[13];
        s_basementPrison1 = s_pathways[14];
        s_basementPrison2 = s_pathways[15];
        s_basementPrison3 = s_pathways[16];
       
        bool[17] memory path = [0true, 1true, 2true, 3false, 
        4true, 5false, 6true, 7false, 8false, 9true, 10true, 11false, 12false, 13true, 14false, 15false, 16true]; */