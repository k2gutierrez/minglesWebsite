'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, TrendingUp, XCircle, Play, 
  Briefcase, ChevronRight, ArrowLeft, Lock, Info, Filter, Zap, LayoutGrid
} from 'lucide-react';

import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase'; 
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { fetchUserMingles } from '@/components/engine/indexer';

// CONFIGURACIÓN DE TIEMPO
const IS_DEV_MODE = true; 
const DURATION_CONFIG = {
  7:  { label: "7 Days",  seconds: IS_DEV_MODE ? 60 : 604800 },
  15: { label: "15 Days", seconds: IS_DEV_MODE ? 120 : 1296000 },
  30: { label: "30 Days", seconds: IS_DEV_MODE ? 180 : 2592000 }
};

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom); // Tus NFTs
  
  // --- ESTADOS DE DATOS DEL JUEGO (Desde DB) ---
  const [dbItems, setDbItems] = useState<Record<string, any>>({});
  const [dbTraits, setDbTraits] = useState<Record<string, any>>({});
  const [dbRaids, setDbRaids] = useState<any[]>([]);
  const [isLoadingGameData, setIsLoadingGameData] = useState(true);

  // --- ESTADOS DE UI ---
  const [view, setView] = useState<'dashboard' | 'setup'>('dashboard');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDurationKey, setSelectedDurationKey] = useState<7 | 15 | 30>(7);
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItemInstances, setSelectedItemInstances] = useState<{itemId: string, uid: string}[]>([]);
  const [squadFilter, setSquadFilter] = useState<'all' | 'yield' | 'boss' | 'loot'>('all');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // --- ESTADOS DE USUARIO ---
  const [inventory, setInventory] = useState<any[]>([]);
  const [unstackedInventory, setUnstackedInventory] = useState<{itemId: string, uid: string, qtyIdx: number}[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]); 
  const [lockedMingles, setLockedMingles] = useState<string[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultModal, setResultModal] = useState<any>(null);
  const [userPoints, setUserPoints] = useState(0);

  // ==========================================
  // 1. CARGAR CONFIGURACIÓN DEL JUEGO (ITEMS, BOSSES, RAIDS)
  // ==========================================
  useEffect(() => {
    const fetchGameConfig = async () => {
      setIsLoadingGameData(true);
      
      // A. Traits
      const { data: traits } = await supabase.from('mingle_traits').select('*');
      const traitsMap: Record<string, any> = {};
      traits?.forEach(t => traitsMap[t.type_key] = t);
      setDbTraits(traitsMap);

      // B. Items
      const { data: items } = await supabase.from('game_items').select('*');
      const itemsMap: Record<string, any> = {};
      items?.forEach(i => itemsMap[i.id] = i);
      setDbItems(itemsMap);

      // C. Raids + Bosses
      // Hacemos join manual o fetch separado. Fetch separado es más simple.
      const { data: raids } = await supabase.from('game_raids').select('*, game_bosses(*)').eq('is_active', true);
      
      // Formatear Raids para que coincidan con la estructura que usaba el frontend
      const formattedRaids = raids?.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          difficulty: r.difficulty,
          img: r.image_url,
          color: r.color_theme,
          yields: r.yield_config,
          // Datos del Boss (Joined)
          boss: r.game_bosses?.name,
          bossImg: r.game_bosses?.image_url,
          bossDesc: r.game_bosses?.description,
          // Mapear Loot: Usamos los IDs del JSON para buscar la info completa en itemsMap
          bossLoot: r.loot_table.map((lootItem: any) => {
              const itemInfo = itemsMap[lootItem.item_id];
              return {
                  ...itemInfo, // name, image_url, etc.
                  dropRate: lootItem.rate + "%",
                  id: lootItem.item_id // asegurar ID
              };
          })
      })) || [];
      
      setDbRaids(formattedRaids);
      setIsLoadingGameData(false);
    };

    fetchGameConfig();
  }, []);

  // ==========================================
  // 2. CARGAR DATOS DEL USUARIO
  // ==========================================
  const loadUserData = async () => {
    if (!address) return;
    
    // User Points
    const { data: user } = await supabase.from('users').select('points').eq('wallet_address', address).single();
    if(user) setUserPoints(user.points);

    // Active Raids
    const { data: active } = await supabase.from('active_raids').select('*').eq('wallet_address', address);
    if (active) {
        const allSquads = active.flatMap(r => r.squad); 
        setLockedMingles(allSquads);
        // Mapear con la data de raids cargada de DB
        const mappedSessions = active.map(session => {
            const raidInfo = dbRaids.find(r => r.id === session.raid_id);
            const endTime = new Date(session.end_time).getTime();
            return { ...session, endTime, location: raidInfo };
        });
        setActiveSessions(mappedSessions);
    }

    // Inventory
    const { data: invItems } = await supabase.from('player_inventory').select('*').eq('wallet_address', address).gt('quantity', 0);
    if (invItems) {
        setInventory(invItems);
        const flatItems: {itemId: string, uid: string, qtyIdx: number}[] = [];
        invItems.forEach((item: any) => {
            for (let i = 0; i < item.quantity; i++) {
                flatItems.push({ itemId: item.item_id, uid: `${item.item_id}-${i}`, qtyIdx: i });
            }
        });
        setUnstackedInventory(flatItems);
    }
  };

  // Recargar user data cuando cambian las raids o la wallet
  useEffect(() => {
    if (isConnected && !isLoadingGameData) {
        loadUserData();
        const interval = setInterval(loadUserData, 5000);
        return () => clearInterval(interval);
    }
  }, [address, isConnected, isLoadingGameData, dbRaids]);

  // ==========================================
  // 3. HELPERS (Updated to use State instead of Constants)
  // ==========================================
  
  const getWormStats = (type?: string) => {
      if (!type) return { passiveType: 'yield', passiveVal: 0 }; // Fallback
      const normalizedType = type.toLowerCase();
      // Buscar match parcial en las keys de dbTraits
      const key = Object.keys(dbTraits).find(k => normalizedType.includes(k));
      return key ? dbTraits[key] : { passiveType: 'yield', passiveVal: 0 };
  };

  // ==========================================
  // 4. CALCULATORS
  // ==========================================
  const userStats = useMemo(() => {
      return {
          tequila: userPoints,
          totalItems: inventory.reduce((acc, i) => acc + i.quantity, 0),
          minglesBusy: lockedMingles.length,
          minglesFree: Math.max(0, mingles.length - lockedMingles.length)
      }
  }, [userPoints, inventory, lockedMingles, mingles]);

  const setupStats = useMemo(() => {
      let bossChance = 0; let yieldBonus = 0; let lootBonus = 0;
      const breakdown = { items: [] as string[] };

      if (selectedMingles.length >= 5) bossChance = 50 + ((Math.min(selectedMingles.length, 10) - 5) * 5);
      
      selectedMingles.forEach(id => {
        const m = mingles.find(u => u.id === id);
        const data = getWormStats(m?.type);
        if (data.passive_type === 'boss' || data.passive_type === 'omni') bossChance += data.passive_value;
        if (data.passive_type === 'yield' || data.passive_type === 'omni') yieldBonus += data.passive_value;
        if (data.passive_type === 'loot' || data.passive_type === 'omni') lootBonus += data.passive_value;
      });

      const groupedItems: Record<string, number> = {};
      selectedItemInstances.forEach(inst => { groupedItems[inst.itemId] = (groupedItems[inst.itemId] || 0) + 1; });

      for (const [id, count] of Object.entries(groupedItems)) {
          const info = dbItems[id]; // Usar DB Items
          if (info) {
              const totalVal = info.value * count;
              if (info.type === 'boss') bossChance += totalVal;
              if (info.type === 'yield') yieldBonus += totalVal;
              if (info.type === 'loot') lootBonus += totalVal;
              breakdown.items.push(`${count}x ${info.name} (+${totalVal}% ${info.type.toUpperCase()})`);
          }
      }

      return { bossChance: Math.min(bossChance, 100), yieldBonus, lootBonus, breakdown };
  }, [selectedMingles, selectedItemInstances, mingles, dbItems, dbTraits]);

  const estimatedTequila = useMemo(() => {
    if (!selectedLocation) return "0";
    const baseRange = selectedLocation.yields[selectedDurationKey];
    if (!baseRange) return "0";
    
    const rawMin = baseRange.min * Math.max(1, selectedMingles.length);
    const rawMax = baseRange.max * Math.max(1, selectedMingles.length);
    const totalMult = 1 + (setupStats.yieldBonus / 100);
    return `${Math.floor(rawMin * totalMult)} - ${Math.floor(rawMax * totalMult)}`;
  }, [selectedLocation, selectedDurationKey, selectedMingles, setupStats]);

  // ==========================================
  // 5. ACTIONS
  // ==========================================
  const startRaid = async () => {
    if (!address) return;
    if (selectedMingles.length === 0) return alert("Select at least 1 Mingle.");
    
    setIsProcessing(true);
    const durationConfig = DURATION_CONFIG[selectedDurationKey];
    const now = new Date();
    const endTime = new Date(now.getTime() + (durationConfig.seconds * 1000));
    const itemIdsToBurn = selectedItemInstances.map(i => i.itemId);

    try {
        const itemsToUpdate: Record<string, number> = {};
        itemIdsToBurn.forEach(id => { itemsToUpdate[id] = (itemsToUpdate[id] || 0) + 1 });
        
        // Optimistic UI update could happen here, but we wait for reload for safety
        for (const [itemId, qtyToBurn] of Object.entries(itemsToUpdate)) {
            const current = inventory.find(i => i.item_id === itemId);
            if (current) {
                 await supabase.from('player_inventory').update({ quantity: Math.max(0, current.quantity - qtyToBurn) }).match({ wallet_address: address, item_id: itemId });
            }
        }
        
        const { error } = await supabase.from('active_raids').insert([{
            wallet_address: address, raid_id: selectedLocation.id, squad: selectedMingles, items: itemIdsToBurn, end_time: endTime.toISOString()
        }]);
        if (error) throw error;

        await loadUserData();
        setView('dashboard');
        setSelectedMingles([]);
        setSelectedItemInstances([]);
    } catch (e) {
        console.error(e);
        alert("Error starting raid.");
    } finally {
        setIsProcessing(false);
    }
  };

  const resolveMission = async (session: any) => {
    setIsProcessing(true);
    try {
        const currentMingles = await fetchUserMingles(address!);
        const stillOwns = session.squad.every((id: string) => currentMingles.some((m: any) => m.id === id));
        if (!stillOwns) {
            await supabase.from('active_raids').delete().eq('id', session.id);
            alert("Security Fail: Mingles missing.");
            await loadUserData();
            setIsProcessing(false);
            return;
        }

        const raidConfig = dbRaids.find(r => r.id === session.raid_id);
        const durationSec = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000;
        let daysKey: 7|15|30 = 7;
        if (durationSec > 1000000) daysKey = 15; if (durationSec > 2000000) daysKey = 30;

        const range = raidConfig!.yields[daysKey];
        const baseAmount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        
        // Recalculate Logic (Backend simulation)
        let sYieldBonus = 0; let sBossChance = 0; let sLootBonus = 0;
        
        session.squad.forEach((id:string) => {
             const m = currentMingles.find((u:any) => u.id === id);
             const d = getWormStats(m?.type);
             if (d.passive_type === 'yield' || d.passive_type === 'omni') sYieldBonus += d.passive_value;
             if (d.passive_type === 'boss' || d.passive_type === 'omni') sBossChance += d.passive_value;
             if (d.passive_type === 'loot' || d.passive_type === 'omni') sLootBonus += d.passive_value;
        });
        
        if(session.items) {
            session.items.forEach((itemId: string) => {
                const info = dbItems[itemId];
                if(info) {
                    if(info.type === 'yield') sYieldBonus += info.value;
                    if(info.type === 'boss') sBossChance += info.value;
                    if(info.type === 'loot') sLootBonus += info.value;
                }
            });
        }
        
        if(session.squad.length >= 5) sBossChance += 50 + ((Math.min(session.squad.length, 10) - 5) * 5);

        const yieldMult = 1 + (sYieldBonus / 100); 
        const totalTequila = Math.floor(baseAmount * session.squad.length * yieldMult);

        await supabase.rpc('add_points', { p_wallet: address, p_amount: totalTequila });

        const roll = Math.random() * 100;
        const bossDefeated = roll <= Math.min(sBossChance, 100);
        let bossLoot = null;
        
        if (bossDefeated) {
             const lootRoll = Math.random() * 100;
             const lootChance = 30 + sLootBonus; // Base 30%
             
             if (lootRoll <= lootChance && raidConfig.bossLoot.length > 0) {
                 // Pick random loot based on probabilities in real app, here simple pick
                 bossLoot = raidConfig.bossLoot[0]; 
                 const { data: exist } = await supabase.from('player_inventory').select('*').match({wallet_address: address, item_id: bossLoot.id}).single();
                 await supabase.from('player_inventory').upsert({ wallet_address: address, item_id: bossLoot.id, quantity: (exist?.quantity || 0) + 1 }, { onConflict: 'wallet_address, item_id'});
             }
        }

        const mingleLoot: any[] = [];
        session.squad.forEach((mId: string) => {
            if (Math.random() < 0.05) mingleLoot.push({ name: "Lost Relic", img: "https://placehold.co/100x100/purple/fff?text=Relic", desc: "Found by Mingle #" + mId });
        });

        await supabase.from('active_raids').delete().eq('id', session.id);
        setResultModal({ bossDefeated, rewards: { tequila: totalTequila, bossLoot, mingleLoot } });
        await loadUserData();

    } catch (e) {
        console.error(e);
        alert("Error resolving mission.");
    } finally {
        setIsProcessing(false);
    }
  };

  const cancelRaid = async (sessionId: number) => {
    if (!confirm("Cancel mission? Items used will NOT be returned.")) return;
    setIsProcessing(true);
    await supabase.from('active_raids').delete().eq('id', sessionId);
    await loadUserData();
    setIsProcessing(false);
  };

  // --- UI HELPERS ---
  const toggleMingle = (id: string) => {
     if (lockedMingles.includes(id)) return;
     if (selectedMingles.includes(id)) setSelectedMingles(prev => prev.filter(m => m !== id));
     else {
        if (selectedMingles.length >= 10) return alert("Max 10 per squad.");
        setSelectedMingles(prev => [...prev, id]);
     }
  };
  
  const toggleItemInstance = (uid: string, itemId: string) => {
      const isSelected = selectedItemInstances.some(i => i.uid === uid);
      if (isSelected) {
          setSelectedItemInstances(prev => prev.filter(i => i.uid !== uid));
      } else {
          if (selectedItemInstances.length >= 4) return alert("Max 4 items.");
          setSelectedItemInstances(prev => [...prev, { uid, itemId }]);
      }
  };

  const sortedMingles = useMemo(() => {
      let filtered = [...mingles];
      if (squadFilter !== 'all') {
          filtered = filtered.filter(m => {
              const data = getWormStats(m.type);
              return data.passive_type === squadFilter || data.passive_type === 'omni';
          });
      }
      return filtered.sort((a, b) => {
          const aLocked = lockedMingles.includes(a.id!);
          const bLocked = lockedMingles.includes(b.id!);
          if (aLocked === bLocked) return 0;
          return aLocked ? 1 : -1;
      });
  }, [mingles, lockedMingles, squadFilter, dbTraits]);

  // ==========================================
  // RENDER: LOADING STATE
  // ==========================================
  if (!isConnected) return <ConnectWalletView />;
  if (isLoadingGameData) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-[#E15162]" size={48}/></div>;

  // ==========================================
  // VIEW: RAID REPORT MODAL
  // ==========================================
  if (resultModal) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
              <div className="bg-white rounded-[2rem] max-w-lg w-full text-center border-4 border-[#1D1D1D] shadow-[0_0_20px_rgba(225,81,98,0.3)] overflow-hidden animate-in zoom-in duration-300">
                  <div className="bg-[#1D1D1D] p-6 text-white">
                      <h2 className="text-3xl font-black uppercase tracking-widest">Raid Report</h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div>
                          <p className="text-xs font-black uppercase opacity-50 mb-1">Total Harvest</p>
                          <div className="bg-[#EDEDD9] border-2 border-[#1D1D1D] p-4 rounded-2xl flex items-center justify-center gap-3">
                              <TrendingUp className="text-[#E15162]" size={32}/>
                              <span className="text-5xl font-black text-[#1D1D1D] tracking-tighter">+{resultModal.rewards.tequila}</span>
                          </div>
                      </div>

                      <div className={`p-4 rounded-2xl border-2 ${resultModal.bossDefeated ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                          <div className="flex items-center justify-center gap-2 mb-2">
                              {resultModal.bossDefeated ? <CheckCircle2 className="text-green-600"/> : <XCircle className="text-red-600"/>}
                              <h3 className="text-lg font-black uppercase">{resultModal.bossDefeated ? "Boss Defeated" : "Boss Escaped"}</h3>
                          </div>
                          
                          {resultModal.rewards.bossLoot ? (
                              <div className="mt-3 bg-white p-2 rounded-xl border border-green-200 flex items-center gap-3 text-left">
                                  <img src={resultModal.rewards.bossLoot.image_url} className="w-12 h-12 object-contain"/>
                                  <div>
                                      <p className="text-[10px] font-black text-green-600 uppercase">Boss Loot Dropped!</p>
                                      <p className="font-bold text-sm leading-none">{resultModal.rewards.bossLoot.name}</p>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-xs font-bold opacity-60">No Boss loot for you this time.</p>
                          )}
                      </div>

                      <div className="text-left">
                          <p className="text-xs font-black uppercase opacity-50 mb-2 border-b border-[#1D1D1D]/10 pb-1">Mingles Unique Loot</p>
                          {resultModal.rewards.mingleLoot.length > 0 ? (
                              <div className="space-y-2">
                                  {resultModal.rewards.mingleLoot.map((item:any, i:number) => (
                                      <div key={i} className="flex items-center gap-3 p-2 bg-white border-2 border-[#1D1D1D]/10 rounded-xl">
                                          <img src={item.img} className="w-10 h-10 object-contain rounded"/>
                                          <div>
                                              <p className="font-bold text-xs">{item.name}</p>
                                              <p className="text-[9px] opacity-60">{item.desc}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-xs italic opacity-40 text-center py-2">Your mingles found nothing extra.</p>
                          )}
                      </div>

                      <button onClick={() => setResultModal(null)} className="w-full bg-[#1D1D1D] text-white py-4 rounded-xl font-black uppercase hover:bg-[#E15162] transition-colors">
                          Claim & Dismiss
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  // ==========================================
  // VIEW: SETUP
  // ==========================================
  if (view === 'setup' && selectedLocation) {
      return (
         <div className="max-w-7xl mx-auto pb-20">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setView('dashboard')} className="flex items-center gap-2 font-black uppercase hover:text-[#E15162] transition-colors">
                     <ArrowLeft/> Back to Command Center
                 </button>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8 space-y-6">
                    {/* DURATION */}
                    <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                        <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> 1. Duration</h3>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {([7, 15, 30] as const).map(d => (
                                <div key={d} onClick={() => setSelectedDurationKey(d)} className={`cursor-pointer border-4 rounded-xl p-3 md:p-4 text-center transition-all ${selectedDurationKey === d ? 'bg-[#E15162] border-[#E15162] text-white shadow-lg' : 'border-[#1D1D1D] hover:bg-gray-50'}`}>
                                    <span className="text-xl md:text-2xl font-black">{DURATION_CONFIG[d].label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SQUAD SELECTION */}
                    <div className="bg-[#EDEDD9] p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                            <h3 className="text-xl font-black uppercase flex items-center gap-2"><Sword/> 2. Squad <span className="bg-[#1D1D1D] text-white px-2 py-0.5 rounded text-xs ml-2">{selectedMingles.length}/10</span></h3>
                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
                                {(['all', 'yield', 'boss', 'loot'] as const).map(f => (
                                    <button key={f} onClick={() => setSquadFilter(f)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 ${squadFilter === f ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white border-[#1D1D1D] text-[#1D1D1D]'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar content-start">
                            {sortedMingles.map(mingle => {
                                const isLocked = lockedMingles.includes(mingle.id!);
                                const isSelected = selectedMingles.includes(mingle.id!);
                                const stats = getWormStats(mingle.type);

                                return (
                                    <div key={mingle.id} onClick={() => !isLocked && toggleMingle(mingle.id!)}
                                         className={`
                                            relative flex flex-col rounded-xl border-4 overflow-visible cursor-pointer transition-all h-auto group
                                            ${isLocked ? 'opacity-40 grayscale cursor-not-allowed bg-gray-200' : 'hover:scale-[1.02]'} 
                                            ${isSelected ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white border-[#1D1D1D]/10 hover:border-[#1D1D1D]/30'}
                                         `}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 z-20 bg-white rounded-full p-0.5 border-2 border-[#1D1D1D]">
                                                <CheckCircle2 size={18} className="text-[#E15162] fill-white"/>
                                            </div>
                                        )}
                                        <div className="w-full aspect-square relative bg-gray-200 rounded-t-lg overflow-hidden">
                                            <img src={mingle.image} className="absolute inset-0 w-full h-full object-cover"/>
                                            {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"><span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase shadow-sm">Busy</span></div>}
                                        </div>
                                        <div className="p-2 flex flex-col justify-between flex-1">
                                            <p className="text-[11px] font-black uppercase leading-tight mb-1 truncate">#{mingle.id}</p>
                                            <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-[#E15162]' : 'opacity-60'}`}>
                                                +{stats.passive_value}% {stats.passive_type?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {/* BACKPACK */}
                        <div className="mt-6 bg-white/50 p-4 rounded-xl border-2 border-[#1D1D1D]/10">
                            <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2"><Backpack size={14}/> Supply Slots ({selectedItemInstances.length}/4)</h4>
                            <div className="flex flex-wrap gap-3">
                                {unstackedInventory.length === 0 && <p className="text-xs opacity-50 italic">Empty backpack.</p>}
                                {unstackedInventory.map((itemInstance) => {
                                    const isSelected = selectedItemInstances.some(i => i.uid === itemInstance.uid);
                                    const info = dbItems[itemInstance.itemId];
                                    const isTooltipOpen = activeTooltip === itemInstance.uid;

                                    return (
                                        <div key={itemInstance.uid} className="relative group">
                                            <div onClick={() => toggleItemInstance(itemInstance.uid, itemInstance.itemId)} className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-transform relative ${isSelected ? 'bg-[#E15162] border-[#E15162] shadow-md scale-105' : 'bg-white border-[#1D1D1D]/20 hover:border-[#1D1D1D]'}`}>
                                                <img src={info?.image_url} onError={(e) => e.currentTarget.src = `https://placehold.co/100x100/eee/333?text=${itemInstance.itemId.substring(0,2)}`} className="w-8 h-8 object-contain"/>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(isTooltipOpen ? null : itemInstance.uid); }} className="absolute -top-2 -right-2 bg-[#1D1D1D] text-white rounded-full p-1 z-20 hover:scale-110"><Info size={10} /></button>
                                            {(isTooltipOpen) && (
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-[#1D1D1D] text-white text-[10px] p-2 rounded-lg z-30 shadow-xl pointer-events-none">
                                                    <p className="font-bold text-[#E15162] uppercase mb-1">{info?.name}</p>
                                                    <p className="opacity-90 leading-tight">{info?.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* TARGET CARD (BOSS) */}
                    <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                         <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Skull className="text-[#E15162]"/> Target</h3>
                         <div className="aspect-square rounded-xl overflow-hidden mb-4 relative border-2 border-white/20">
                             <img src={selectedLocation.bossImg} className="w-full h-full object-cover"/>
                             <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3">
                                 <p className="font-black uppercase text-lg leading-none">{selectedLocation.boss}</p>
                             </div>
                         </div>
                         <div>
                             <p className="text-[10px] font-bold uppercase opacity-50 mb-2">Possible Drops</p>
                             <div className="grid grid-cols-2 gap-2">
                                 {selectedLocation.bossLoot.map((loot:any, i:number) => (
                                     <div key={i} className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10 h-16">
                                         <div className="w-16 bg-black/20 flex items-center justify-center p-1 shrink-0 border-r border-white/5">
                                             <img src={loot.image_url} className="w-full h-full object-contain"/>
                                         </div>
                                         <div className="flex-1 p-2 flex flex-col justify-center min-w-0">
                                             <p className="font-bold text-[9px] leading-tight text-[#E15162] truncate mb-0.5">{loot.name}</p>
                                             <p className="text-[8px] opacity-50 leading-tight truncate mb-1">{loot.description}</p>
                                             <span className="text-[8px] font-mono bg-white/10 px-1 rounded self-start">{loot.dropRate}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* SIMULATION */}
                    <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] sticky top-4 shadow-[8px_8px_0_0_#1D1D1D]">
                        <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2"><Zap size={24}/> Simulation</h3>
                        <div className="space-y-4 mb-6">
                            <div><div className="flex justify-between text-xs font-black uppercase mb-1"><span>Boss Kill</span><span>{setupStats.bossChance}%</span></div><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${setupStats.bossChance > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${setupStats.bossChance}%` }}/></div></div>
                            <div><div className="flex justify-between text-xs font-black uppercase mb-1"><span>Loot Bonus</span><span className="text-[#E15162]">+{setupStats.lootBonus}%</span></div><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[#E15162]" style={{ width: `${Math.min(setupStats.lootBonus, 100)}%` }}/></div></div>
                            <div><div className="flex justify-between text-xs font-black uppercase mb-1"><span>Yield Bonus</span><span className="text-blue-500">+{setupStats.yieldBonus}%</span></div><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${Math.min(setupStats.yieldBonus, 100)}%` }}/></div></div>
                        </div>
                        {setupStats.breakdown.items.length > 0 && (
                            <div className="bg-[#EDEDD9] p-3 rounded-xl mb-6 border border-[#1D1D1D]/10">
                                <p className="text-[9px] font-black uppercase opacity-50 mb-2">Active Item Effects</p>
                                <div className="space-y-1">
                                    {setupStats.breakdown.items.map((txt, i) => (
                                        <p key={i} className="text-[10px] font-bold text-[#1D1D1D] flex items-center gap-1"><CheckCircle2 size={10} className="text-green-600"/> {txt}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mb-6 border-t-2 border-[#1D1D1D]/10 pt-4 text-center">
                            <p className="text-[10px] font-bold uppercase opacity-50">Guaranteed Harvest</p>
                            <p className="text-4xl font-black text-[#E15162] tracking-tighter">{estimatedTequila} $TEQ</p>
                        </div>
                        <button onClick={startRaid} disabled={isProcessing} className="w-full bg-[#E15162] text-white py-5 rounded-2xl font-black uppercase text-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(225,81,98,0.4)] hover:shadow-[0_6px_20px_rgba(225,81,98,0.6)] border-b-8 border-[#c03546]">
                            {isProcessing ? <Loader2 className="animate-spin" size={32}/> : <>DEPLOY SQUAD <Play fill="currentColor" size={24}/></>}
                        </button>
                    </div>
                </div>
             </div>
         </div>
      )
  }

  // ==========================================
  // VIEW: DASHBOARD
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-[#1D1D1D] pb-6 gap-6">
             <div><h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Mission Control</h1><p className="font-bold text-[#1D1D1D]/60">Manage your operations.</p></div>
             <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
                 <div className="bg-[#1D1D1D] text-white px-4 py-3 rounded-2xl min-w-[120px]"><p className="text-[10px] font-bold uppercase opacity-60">Total Tequila</p><p className="text-xl font-black text-[#E15162]">{userStats.tequila}</p></div>
                 <div className="bg-white border-2 border-[#1D1D1D] px-4 py-3 rounded-2xl min-w-[120px]"><p className="text-[10px] font-bold uppercase opacity-60">Items</p><p className="text-xl font-black">{userStats.totalItems}</p></div>
                 <div className="bg-white border-2 border-[#1D1D1D] px-4 py-3 rounded-2xl min-w-[120px]"><p className="text-[10px] font-bold uppercase opacity-60">Squad Status</p><p className="text-xl font-black"><span className="text-red-500">{userStats.minglesBusy} Busy</span> / {userStats.minglesFree} Free</p></div>
             </div>
        </div>

        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> Active Operations</h2>
            {activeSessions.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border-4 border-[#1D1D1D] border-dashed text-center opacity-50"><Briefcase className="mx-auto mb-2 opacity-20" size={48}/><p className="font-bold uppercase">No active missions.</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map((session) => {
                        const now = Date.now();
                        const timeLeft = Math.max(0, Math.ceil((session.endTime - now) / 1000));
                        const isComplete = timeLeft === 0;
                        return (
                            <div key={session.id} className={`p-6 rounded-[2rem] border-4 border-[#1D1D1D] relative overflow-hidden flex flex-col justify-between h-full ${isComplete ? 'bg-[#E15162] text-white' : 'bg-white'}`}>
                                <div><div className="flex justify-between items-start mb-4"><div><h3 className="font-black uppercase text-lg leading-none">{session.location?.name}</h3><p className={`text-xs font-bold ${isComplete ? 'opacity-80' : 'opacity-40'}`}>Squad: {session.squad.length} Mingles</p></div>{isComplete ? <CheckCircle2 className="text-white"/> : <Loader2 className="animate-spin text-[#E15162]"/>}</div>{!isComplete && (<div className="text-4xl font-black font-mono text-center my-6 tracking-tighter">{Math.floor(timeLeft / 60)}m {timeLeft % 60}s</div>)}</div>
                                {isComplete ? (<div className="mt-4 text-center"><p className="font-black uppercase mb-4 text-lg">Mission Complete</p><button onClick={() => resolveMission(session)} disabled={isProcessing} className="w-full bg-white text-[#E15162] py-4 rounded-xl font-black uppercase hover:scale-105 transition-transform shadow-lg">{isProcessing ? "Processing..." : "Resolve Mission"}</button></div>) : (<button onClick={() => cancelRaid(session.id)} className="w-full border-2 border-[#1D1D1D]/10 text-red-500 py-3 rounded-xl text-xs font-black uppercase hover:bg-red-50 transition-colors">Abort Mission</button>)}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>

        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><LayoutGrid/> Available Raids</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dbRaids.map(raid => {
                    const isActive = activeSessions.some(s => s.raid_id === raid.id);
                    return (
                        <motion.div key={raid.id} whileHover={!isActive ? { scale: 1.01 } : {}} onClick={() => { if(!isActive) { setSelectedLocation(raid); setView('setup'); } }} className={`relative h-60 rounded-[2rem] overflow-hidden border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D] group ${isActive ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer'}`}>
                             <img src={raid.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                             <div className={`absolute inset-0 bg-gradient-to-t ${raid.color} opacity-90 transition-opacity group-hover:opacity-80`}/>
                             <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                 <div className="flex justify-between items-end">
                                     <div>
                                         <div className="flex items-center gap-2 mb-2"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${isActive ? 'bg-[#1D1D1D]' : 'bg-[#E15162]'}`}>{isActive ? "Active / Cooldown" : raid.difficulty}</span></div>
                                         <h3 className="text-3xl font-black uppercase leading-none mb-1">{raid.name}</h3>
                                         <p className="text-sm font-bold opacity-80 line-clamp-1">{raid.description}</p>
                                     </div>
                                     <div className={`p-3 rounded-full ${isActive ? 'bg-[#1D1D1D] text-white/50' : 'bg-white text-[#1D1D1D]'}`}>{isActive ? <Lock size={24}/> : <ChevronRight size={24}/>}</div>
                                 </div>
                             </div>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    </div>
  );
}