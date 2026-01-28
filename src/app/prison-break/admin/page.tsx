'use client'
import { useEffect, useState } from 'react';
import { gameABI } from '@/components/prison/abis/gameABI';
import { MinglesABI } from "@/components/engine/MinglesABI";
import { useConfig, useAccount, useChainId, useWriteContract, useReadContract } from "wagmi";
import { GameAddressAccordingToChain } from '@/components/prison/engine/engine';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotLogged from '@/components/prison/components/NotLogged';
import { mingleABI } from '@/components/prison/abis/mingleABI';

export default function PrisonAdmin() {

  const [address2, setAddress2] = useState('');
  const [prizeNftAddress, setPrizeNftAddress] = useState('');
  const [prizeNftId, setPrizeNftId] = useState(0);
  const [gameCost, setGameCost] = useState(0);
  const [wormLevel, setWormLevel] = useState(0);
  const [diePercentage, setDiePercentage] = useState(0);
  const [route, setRoute] = useState([
    false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false
  ]);

  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [ownerAccouunt, setOwnerAccount] = useState(false);
  const { data: hash, writeContractAsync } = useWriteContract()

  const { data: ownerAddress, isSuccess: ownerSuccess, refetch: getOwner } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "owner",
  })

  const { data: getAddress2, isSuccess: playingAddr2, refetch: getAddr2 } = useReadContract({
    abi: gameABI,
    address: GameAddressAccordingToChain(chainId),
    functionName: "getPlayingNFTsAddress2"
  })

  useEffect(() => {

    getOwner();
    getAddr2();

    if (String(ownerAddress).toString().toLowerCase() == String(address).toString().toLowerCase()) {
        setOwnerAccount(true);
    } else {
        setOwnerAccount(false);
    }

  }, [playingAddr2, chainId, isConnected, ownerSuccess])

  const makingTheRoute = (id: number, value: boolean) => {
    let arr: boolean[] = route;
    arr[id] = value;
    setRoute(arr);

  }

  const aproveNft = async () => {

    try {
      const approvalHash = await writeContractAsync({
        abi: mingleABI,
        address: prizeNftAddress as `0x${string}`,
        functionName: "approve",
        args: [GameAddressAccordingToChain(chainId), BigInt(prizeNftId)],
      })
    } catch (e) {
      console.error(e)
    }
  }

  // const StartGame = async () => {

  //   try {
  //     const approvalHash = await writeContractAsync({
  //       abi: gameABI,
  //       address: GameAddressAccordingToChain(chainId) as `0x${string}`,
  //       functionName: "StartGame",
  //       args: [address2 as `0x${string}`, prizeNftAddress as `0x${string}`, BigInt(prizeNftId), BigInt(gameCost), BigInt(wormLevel), (route), BigInt(diePercentage)],
  //     })
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }

  return (
    
    <div className=" font-[family-name:var(--font-pressura)]">
      <Header />

      <div className="flex flex-wrap items-center text-black font-[family-name:var(--font-pressura)] text-center mb-20">
        {!isConnected && (
          <NotLogged />
        )
        }
        
        {isConnected && ownerAccouunt && (
          <>
            <div className='mt-3'>
                <p className='text-start'>Enter collection Address to play game with mingles</p>
                <input className='appearance-none block w-3/4 bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white' type='text' placeholder='0x...' onChange={(e) => setAddress2(e.target.value)} />
                <p className='text-start'>Enter collection Address of the Prize NFT</p>
                <input className='appearance-none block w-3/4 bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white' type='text' placeholder='0x...' onChange={(e) => setPrizeNftAddress(e.target.value)} />
                <p className='text-start'>Enter id of the Prize NFT</p>
                <input className='appearance-none block w-3/4 bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white' type='number' placeholder='0' onChange={(e) => setPrizeNftId(Number(e.target.value))} />
                <p className='text-start'>Enter game cost</p>
                <input className='appearance-none block w-3/4 bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white' type='number' placeholder='0' onChange={(e) => setGameCost(Number(e.target.value))} />
                <p className='text-start'>Worm Level</p>
                <input className='appearance-none block w-3/4 bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white' type='number' placeholder='0' onChange={(e) => setWormLevel(Number(e.target.value))} />
                <p className='text-start'>Enter number to represent the percentage to die when scaping basement prison</p>
                <input className='appearance-none block w-3/4 bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white' type='number' placeholder='50' onChange={(e) => setDiePercentage(Number(e.target.value))} />

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Main Hall</p>
                <input type='checkbox' id="checkbox0" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  if (e.target.checked == true) {
                    makingTheRoute(0, true);
                  } else {
                    makingTheRoute(0, false);
                  }
                  
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Backdoor Tunnels</p>
                <input type='checkbox' id="checkbox1" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(1, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Oven Room</p>
                <input type='checkbox' id="checkbox2" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(2, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Distillery Room</p>
                <input type='checkbox' id="checkbox3" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(3, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Barrel Room</p>
                <input type='checkbox' id="checkbox4" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(4, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Hall 1</p>
                <input type='checkbox' id="checkbox5" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(5, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Hall 2</p>
                <input type='checkbox' id="checkbox6" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(6, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Hall 3</p>
                <input type='checkbox' id="checkbox7" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(7, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Fermentation Room 1</p>
                <input type='checkbox' id="checkbox8" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(8, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Fermentation Room 2</p>
                <input type='checkbox' id="checkbox9" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(9, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Private Cava 1</p>
                <input type='checkbox' id="checkbox10" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(10, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Private Cava 2</p>
                <input type='checkbox' id="checkbox11" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(11, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Raven Nest 1</p>
                <input type='checkbox' id="checkbox12" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(12, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Raven Nest 2</p>
                <input type='checkbox' id="checkbox13" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(13, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Basement Prison 1</p>
                <input type='checkbox' id="checkbox14" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(14, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Basement Prison 2</p>
                <input type='checkbox' id="checkbox15" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(15, e.target.checked);
                }} />
              </div>

              <div className="border border-solid mb-2">
                <p className="text-sm font-medium align-items-center">Basement Prison 3</p>
                <input type='checkbox' id="checkbox16" className="w-4 h-4 text-blue-600 rounded" onChange={(e) => {
                  makingTheRoute(16, e.target.checked);
                }} />
              </div>

              <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2' onClick={aproveNft} >Approve NFT for prize collection</button>

              <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={undefined} >Set Game</button>

            </div>

            
            </>

        ) 
        }

        {isConnected && !ownerAccouunt &&
            (
            <p className='text-lg'>You are not the owner!!</p>
        )
        }

        
      </div>
      <Footer />
    </div>
    
    
  );
}

/*
function StartGame(
        address _collection, // colección 2
        address _nftPrizeAddress,   // nft para rifar
        uint256 _nftPrizeId,   // id de nft para rifar
        uint256 _gameCost,  // costo del juego, default 0
        uint256 _wormLvl,  // se mantiene del juego anterior, dejar en 10
        bool[17] calldata pathway, // array de booleans
        uint256  _escapeFromBasementPrison // numero a derrotar del random number para escapar
    ) external gameNotStarted  onlyOwner noContract nonReentrant {

  function approve(address to, uint256 tokenId) public payable virtual override {
        _approve(to, tokenId, true);
    }


    */

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