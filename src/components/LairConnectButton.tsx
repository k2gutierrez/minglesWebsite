'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LogOut, Wallet } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { minglesAtom, isLoadingMinglesAtom } from './engine/atoms';
import { fetchUserMingles } from './engine/indexer';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export const LairConnectButton = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { address, isConnected } = useAccount();
  const setMingles = useSetAtom(minglesAtom);
  const setIsLoading = useSetAtom(isLoadingMinglesAtom);

  // Efecto para cargar los Mingles cuando se conecta la wallet
  useEffect(() => {
    const loadData = async () => {
      if (isConnected && address) {
        setIsLoading(true);
        const nfts = await fetchUserMingles(address);
        setMingles(nfts);
        setIsLoading(false);
      } else {
        setMingles([]); // Limpiar si se desconecta
      }
    };
    loadData();
  }, [isConnected, address, setIsLoading]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        // ESTADO 1: NO CONECTADO (Botón para conectar)
        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-black border-2 border-[#1D1D1D] bg-[#E15162] text-white shadow-[2px_2px_0_0_#1D1D1D] hover:translate-y-[1px] hover:shadow-none transition-all uppercase text-sm`}
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          );
        }

        // ESTADO 2: CADENA INCORRECTA
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="w-full px-4 py-3 rounded-xl font-black border-2 border-[#1D1D1D] bg-red-500 text-white shadow-[2px_2px_0_0_#1D1D1D] animate-pulse"
            >
              Wrong Network
            </button>
          );
        }

        // ESTADO 3: CONECTADO (Mostrar Wallet + Opción Salir)
        // Aquí replicamos el diseño que tenías en el sidebar
        if (isMobile) {
            // Versión simplificada para el menú móvil
            return (
                <button 
                    onClick={openAccountModal}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold border-2 border-[#1D1D1D] bg-[#1D1D1D] text-white mt-8"
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {account.displayName}
                    <LogOut size={16} className="ml-auto opacity-50"/>
                </button>
            )
        }

        // Versión Sidebar Desktop (Tu diseño original)
        return (
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-xs font-bold uppercase opacity-60">Connected</span>
            </div>
            
            {/* Botón con la address que abre el modal de RainbowKit */}
            <button 
                onClick={openAccountModal}
                className="w-full text-left text-xs font-mono bg-white p-2 rounded border border-[#1D1D1D]/20 hover:border-[#1D1D1D] hover:bg-[#EDEDD9] transition-colors flex justify-between items-center group"
            >
                <span className="truncate">{account.displayName}</span>
                <LogOut size={12} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};