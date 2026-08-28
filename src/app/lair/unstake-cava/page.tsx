'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ShieldAlert, Unlock, Lock, Loader2, Info, AlertTriangle } from 'lucide-react';import { ConnectWalletView } from '@/components/ConnectWalletView'; // Ajusta esta ruta si es diferente

// --- CONFIGURACIÓN DEL CONTRATO ---
const CAVA_STAKING_ADDRESS = '0x8FD1942b961ed13aC50a5873bA06fABE37168f6D';

// ABI reducido solo con las funciones que necesitamos (Leer y Escribir)
const cavaStakingABI = [
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTotalStaked",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unstakeNftsEmergency",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function UnstakeCavaPage() {
  const { address, isConnected } = useAccount();

  // 1. LEER ESTADO: ¿Cuántos NFTs tiene en Stake este usuario?
  const { data: totalStaked, refetch: refetchStaked } = useReadContract({
    address: CAVA_STAKING_ADDRESS,
    abi: cavaStakingABI,
    functionName: 'getUserTotalStaked',
    args: address ? [address] : undefined,
  });

  // Convertimos el resultado a número (0 si es undefined)
  const stakedAmount = totalStaked ? Number(totalStaked) : 0;

  // 2. ESCRIBIR ESTADO: Preparar la función de Unstake
  const { writeContract, data: txHash, isPending: isConfirming, error: writeError } = useWriteContract();

  // 3. ESPERAR TRANSACCIÓN: Monitorear cuando se confirme en la blockchain
  const { isLoading: isWaiting, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refrescar el número de NFTs cuando la transacción sea un éxito
  useEffect(() => {
    if (isConfirmed) {
      refetchStaked();
    }
  }, [isConfirmed, refetchStaked]);

  // Ejecutar el Unstake
  const handleUnstake = () => {
    if (stakedAmount === 0) return;
    writeContract({
      address: CAVA_STAKING_ADDRESS,
      abi: cavaStakingABI,
      functionName: 'unstakeNftsEmergency',
    });
  };

  // --- RENDER ---
  if (!isConnected) return <ConnectWalletView />;

  const isBusy = isConfirming || isWaiting;

  return (
    <div className="max-w-3xl mx-auto pb-20 pt-10 px-4 space-y-8">
      
      {/* HEADER */}
      <div className="border-b-4 border-[#1D1D1D] pb-6">
        <h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2 flex items-center gap-3">
          <ShieldAlert className="text-[#E15162]" size={48} />
          Cava Unstake
        </h1>
        <p className="font-bold text-[#1D1D1D]/60 uppercase tracking-widest">
          Emergency Retrieval Protocol
        </p>
      </div>

      {/* WARNING BANNER */}
      <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-2xl flex items-start gap-4">
        <AlertTriangle className="text-yellow-600 shrink-0" />
        <div>
          <h3 className="font-black text-yellow-800 uppercase mb-1">Attention Required</h3>
          <p className="text-sm text-yellow-700 font-medium">
            This is the emergency fallback interface. If the main contract is paused or unavailable, use this protocol to retrieve your NFTs safely to your wallet.
          </p>
        </div>
      </div>

      {/* DASHBOARD CARD */}
      <div className="bg-white p-8 rounded-[2rem] border-4 border-[#1D1D1D] text-center shadow-xl">
        <div className="inline-flex items-center justify-center p-4 bg-[#EDEDD9] rounded-full mb-6">
          <Info size={32} className="text-[#1D1D1D]" />
        </div>
        
        <h2 className="text-xl font-black uppercase text-gray-500 mb-2">
          Your Staked CAVA NFTs
        </h2>
        
        <div className="text-8xl font-black text-[#1D1D1D] tracking-tighter mb-8">
          {stakedAmount}
        </div>

        {/* BUTTON LOGIC */}
        <button
          onClick={handleUnstake}
          disabled={stakedAmount === 0 || isBusy}
          className={`w-full py-5 rounded-2xl font-black uppercase text-xl flex items-center justify-center gap-3 transition-all
            ${stakedAmount === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-4 border-transparent' 
              : 'bg-[#1D1D1D] text-white hover:bg-[#E15162] hover:scale-[1.02] border-4 border-transparent active:scale-95'
            }
          `}
        >
          {isBusy ? (
            <>
              <Loader2 className="animate-spin" size={28} />
              Processing Extraction...
            </>
          ) : stakedAmount === 0 ? (
            <>
              <Lock size={28} />
              No NFTs to Unstake
            </>
          ) : (
            <>
              <Unlock size={28} />
              Unstake Emergency
            </>
          )}
        </button>

        {/* MESSAGES */}
        {isConfirmed && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-400 rounded-xl text-green-700 font-black uppercase">
            Extraction Successful! NFTs returned to your wallet.
          </div>
        )}

        {writeError && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-400 rounded-xl text-red-700 font-bold text-sm">
            Transaction failed: {writeError.message.split('\n')[0]}
          </div>
        )}
      </div>

    </div>
  );
}