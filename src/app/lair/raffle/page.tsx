'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { Loader2, Ticket, Clock, Users, ArrowLeft, X, CheckCircle2, Gift } from 'lucide-react';

export default function RafflesPage() {
    const { address, isConnected } = useAccount();

    // --- ESTADOS ---
    const [raffles, setRaffles] = useState<any[]>([]);
    const [userPoints, setUserPoints] = useState(0);
    const [userEntries, setUserEntries] = useState<Record<string, number>>({});
    const [totalEntries, setTotalEntries] = useState<Record<string, number>>({});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // UI States
    const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'my_activity'>('active');
    const [selectedRaffle, setSelectedRaffle] = useState<any | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // --- CARGA DE DATOS ---
    const fetchData = async () => {
        if (!address) return;
        setIsLoading(true);

        // 1. Traer puntos del usuario
        const { data: userData } = await supabase.from('users').select('points').eq('wallet_address', address).single();
        if (userData) setUserPoints(userData.points);

        // 2. Traer Rifas (Live y Closed)
        const { data: rafflesData } = await supabase
            .from('raffles')
            .select('*')
            .in('status', ['live', 'closed', 'winner_selected', 'fulfilled'])
            .order('created_at', { ascending: false });
        if (rafflesData) setRaffles(rafflesData);

        // 3. Traer TODAS las entradas para contar los cupos (si es limited_entry)
        const { data: allEntries } = await supabase.from('raffle_entries').select('raffle_id, wallet_address');
        
        if (allEntries) {
            const userCounts: Record<string, number> = {};
            const totalCounts: Record<string, number> = {};
            
            allEntries.forEach(entry => {
                totalCounts[entry.raffle_id] = (totalCounts[entry.raffle_id] || 0) + 1;
                if (entry.wallet_address === address) {
                    userCounts[entry.raffle_id] = (userCounts[entry.raffle_id] || 0) + 1;
                }
            });
            setUserEntries(userCounts);
            setTotalEntries(totalCounts);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        if (isConnected) fetchData();
    }, [address, isConnected]);

    // --- LÓGICA DE CANJEO (REDEEM) ---
    const handleRedeem = async (raffle: any) => {
        if (!address) return;
        setIsProcessing(true);
        setSuccessMessage(null);

        try {
            // Llamamos a la función segura y atómica de Supabase
            const { data, error } = await supabase.rpc('redeem_raffle_entry', {
                p_raffle_id: raffle.id,
                p_wallet_address: address,
                p_quantity: 1
            });

            if (error) throw error;

            // Actualizamos la UI localmente para que se sienta instantáneo
            setUserPoints(data.new_point_balance);
            setUserEntries(prev => ({ ...prev, [raffle.id]: (prev[raffle.id] || 0) + 1 }));
            setTotalEntries(prev => ({ ...prev, [raffle.id]: (prev[raffle.id] || 0) + 1 }));
            
            setSuccessMessage(`You redeemed ${data.points_burned} Tequila Points for 1 raffle entry.`);
            
            // Si estaba en el modal, actualizamos los datos locales del modal
            if (selectedRaffle && selectedRaffle.id === raffle.id) {
                // Forzamos un re-render cerrando y abriendo (o simplemente dejando que reaccione al estado)
            }

        } catch (error: any) {
            alert(error.message || "An error occurred during redemption.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- HELPERS DE UI ---
    const formatTimeLeft = (endDate: string) => {
        const diff = new Date(endDate).getTime() - new Date().getTime();
        if (diff <= 0) return "Ended";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        if (days > 0) return `${days}d ${hours}h`;
        const mins = Math.floor((diff / 1000 / 60) % 60);
        return `${hours}h ${mins}m`;
    };

    const formatCategory = (cat: string) => {
        return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // --- FILTROS DE PESTAÑAS ---
    const filteredRaffles = useMemo(() => {
        if (activeTab === 'active') return raffles.filter(r => r.status === 'live');
        if (activeTab === 'closed') return raffles.filter(r => r.status !== 'live' && r.status !== 'draft');
        if (activeTab === 'my_activity') return raffles.filter(r => userEntries[r.id] > 0);
        return [];
    }, [raffles, activeTab, userEntries]);

    // --- RENDER ---
    if (!isConnected) return <ConnectWalletView />;
    if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[#E15162]" size={48} /></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 relative">
            
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-[#1D1D1D] pb-6 gap-6">
                <div>
                    <h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Raffles</h1>
                    <p className="font-bold text-[#1D1D1D]/60">Redeem Tequila Points for entries to win curated prizes.</p>
                </div>
                
                <div className="bg-[#1D1D1D] text-white px-6 py-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-[4px_4px_0_0_#E15162]">
                    <div className="bg-[#E15162] p-2 rounded-xl"><Ticket size={24} className="text-white" /></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-60">Tequila Points</p>
                        <p className="text-2xl font-black">{userPoints.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* PESTAÑAS */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b-2 border-gray-200">
                {(['active', 'closed', 'my_activity'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-black uppercase text-sm whitespace-nowrap border-b-4 transition-colors ${activeTab === tab ? 'border-[#E15162] text-[#1D1D1D]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* GRID DE RIFAS */}
            {filteredRaffles.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border-4 border-[#1D1D1D] border-dashed text-center opacity-50">
                    <Gift className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="font-bold uppercase text-lg">No raffles found in this section.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRaffles.map((raffle) => {
                        const myEntries = userEntries[raffle.id] || 0;
                        const isClosed = raffle.status !== 'live';
                        const currentTotal = totalEntries[raffle.id] || 0;
                        const remaining = raffle.total_cap ? raffle.total_cap - currentTotal : 0;

                        return (
                            <motion.div 
                                key={raffle.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedRaffle(raffle)}
                                className={`bg-white rounded-[2rem] overflow-hidden border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D] cursor-pointer flex flex-col h-full ${isClosed ? 'opacity-80 grayscale-[0.5]' : ''}`}
                            >
                                <div className="aspect-square relative bg-gray-100 border-b-4 border-[#1D1D1D]">
                                    <img src={raffle.prize_image} className="w-full h-full object-cover" alt={raffle.title} />
                                    {isClosed && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                            <span className="bg-white text-[#1D1D1D] px-4 py-2 rounded-full font-black uppercase text-sm border-2 border-[#1D1D1D]">Closed</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 flex flex-col flex-1 bg-[#EDEDD9]">
                                    <p className="text-[10px] font-black uppercase text-[#E15162] mb-1">{formatCategory(raffle.prize_category)}</p>
                                    <h3 className="text-xl font-black uppercase leading-tight mb-4 text-[#1D1D1D]">{raffle.title}</h3>
                                    
                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border-2 border-[#1D1D1D]/10">
                                            <span className="text-xs font-bold opacity-60 uppercase">Cost</span>
                                            <span className="text-sm font-black">{raffle.entry_cost} PT</span>
                                        </div>

                                        {/* CIERRE DE LÓGICA ÚNICA (Solo una métrica visible) */}
                                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border-2 border-[#1D1D1D]/10">
                                            {raffle.raffle_type === 'timed' ? (
                                                <>
                                                    <span className="text-xs font-bold opacity-60 uppercase flex items-center gap-1"><Clock size={12}/> Ends In</span>
                                                    <span className="text-sm font-black text-[#E15162]">{formatTimeLeft(raffle.end_date)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs font-bold opacity-60 uppercase flex items-center gap-1"><Users size={12}/> Entries Left</span>
                                                    <span className="text-sm font-black text-[#E15162]">{remaining} / {raffle.total_cap}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t-2 border-[#1D1D1D]/10 pt-4">
                                        <span className="text-xs font-black uppercase text-[#1D1D1D]/50">Your Entries: <span className="text-[#1D1D1D]">{myEntries}</span></span>
                                        <button className={`px-4 py-2 rounded-xl font-black uppercase text-xs transition-colors border-2 ${isClosed ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-[#1D1D1D] text-white border-[#1D1D1D] hover:bg-[#E15162] hover:border-[#E15162]'}`}>
                                            {isClosed ? 'View Details' : 'Redeem Points'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL DE DETALLE Y COMPRA                  */}
            {/* ========================================== */}
            <AnimatePresence>
                {selectedRaffle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-[#EDEDD9] rounded-[2rem] max-w-2xl w-full border-4 border-[#1D1D1D] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-full"
                        >
                            <div className="bg-[#1D1D1D] p-4 flex justify-between items-center text-white sticky top-0 z-10">
                                <span className="text-xs font-black uppercase opacity-60">Prize Details</span>
                                <button onClick={() => { setSelectedRaffle(null); setSuccessMessage(null); }} className="bg-white/10 hover:bg-[#E15162] p-1.5 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar">
                                <div className="aspect-video relative bg-white border-b-4 border-[#1D1D1D]">
                                    <img src={selectedRaffle.prize_image} className="w-full h-full object-cover" alt="Prize" />
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    <div>
                                        <p className="text-xs font-black uppercase text-[#E15162] mb-1">{formatCategory(selectedRaffle.prize_category)}</p>
                                        <h2 className="text-3xl font-black uppercase text-[#1D1D1D] leading-none mb-2">{selectedRaffle.title}</h2>
                                        <p className="text-sm font-bold opacity-80">{selectedRaffle.prize_description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl border-2 border-[#1D1D1D]/10">
                                            <p className="text-[10px] font-black uppercase opacity-50 mb-1">Entry Cost</p>
                                            <p className="text-xl font-black">{selectedRaffle.entry_cost} PTS</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border-2 border-[#1D1D1D]/10">
                                            <p className="text-[10px] font-black uppercase opacity-50 mb-1">{selectedRaffle.raffle_type === 'timed' ? 'Ends In' : 'Entries Remaining'}</p>
                                            <p className="text-xl font-black text-[#E15162]">
                                                {selectedRaffle.raffle_type === 'timed' 
                                                    ? formatTimeLeft(selectedRaffle.end_date)
                                                    : `${selectedRaffle.total_cap - (totalEntries[selectedRaffle.id] || 0)} / ${selectedRaffle.total_cap}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white/50 p-4 rounded-2xl border-2 border-[#1D1D1D]/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs font-black uppercase">Your Entries</p>
                                            <p className="text-xl font-black">{userEntries[selectedRaffle.id] || 0}</p>
                                        </div>
                                        {selectedRaffle.max_entries_per_user && (
                                            <p className="text-[10px] font-bold text-[#E15162] uppercase">Max Entries Per User: {selectedRaffle.max_entries_per_user}</p>
                                        )}
                                    </div>

                                    {/* MENSAJE DE ÉXITO */}
                                    {successMessage && (
                                        <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-2xl flex gap-3 items-center">
                                            <CheckCircle2 className="shrink-0" />
                                            <div>
                                                <p className="font-black text-sm uppercase">Entry Added!</p>
                                                <p className="text-xs font-bold opacity-80">{successMessage}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* BOTÓN DE ACCIÓN */}
                                    {selectedRaffle.status === 'live' ? (
                                        <button 
                                            onClick={() => handleRedeem(selectedRaffle)}
                                            disabled={isProcessing || userPoints < selectedRaffle.entry_cost || (selectedRaffle.max_entries_per_user && (userEntries[selectedRaffle.id] || 0) >= selectedRaffle.max_entries_per_user)}
                                            className="w-full bg-[#E15162] text-white py-5 rounded-2xl font-black uppercase text-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_4px_15px_rgba(225,81,98,0.4)] border-b-8 border-[#c03546] flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin" /> : <><Ticket /> Redeem Points</>}
                                        </button>
                                    ) : (
                                        <div className="bg-gray-200 text-gray-500 py-4 rounded-2xl font-black uppercase text-center border-4 border-gray-300">
                                            {selectedRaffle.status === 'winner_selected' || selectedRaffle.status === 'fulfilled' ? 'Winner Announced After Close' : 'Raffle Closed'}
                                        </div>
                                    )}
                                    
                                    {selectedRaffle.status === 'live' && userPoints < selectedRaffle.entry_cost && (
                                        <p className="text-center text-xs font-bold text-red-500 uppercase mt-2">Not enough Tequila Points.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}