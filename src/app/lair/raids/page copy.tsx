'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, TrendingUp, HelpCircle,
  XCircle, Play, AlertTriangle, Briefcase, ChevronRight, ArrowLeft, Lock, Info
} from 'lucide-react';

import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase'; 
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { fetchUserMingles } from '@/components/engine/indexer';

// ==========================================
// 🔧 CONFIGURACIÓN
// ==========================================
const IS_DEV_MODE = true; 

const DURATION_CONFIG = {
  7:  { label: "7 Days",  seconds: IS_DEV_MODE ? 60 : 604800 },
  15: { label: "15 Days", seconds: IS_DEV_MODE ? 120 : 1296000 },
  30: { label: "30 Days", seconds: IS_DEV_MODE ? 180 : 2592000 }
};

// ==========================================
// 🧠 BASE DE DATOS
// ==========================================

type TraitData = { rarity: string; passiveType: string; passiveVal: number; exclusiveItem: string; itemEffect: string; };

const WORM_DATABASE: Record<string, TraitData> = {
  'godlike': { rarity: 'Godlike', passiveType: 'omni', passiveVal: 20, exclusiveItem: 'Mythic Sigil', itemEffect: '+40% Yield' },
  'gold': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Golden Extractor', itemEffect: '+25% Yield' },
  'lava': { rarity: 'Legendary', passiveType: 'boss', passiveVal: 8, exclusiveItem: 'Volcanic Charge', itemEffect: '+20% Boss' },
  'water-lightning': { rarity: 'Legendary', passiveType: 'loot', passiveVal: 10, exclusiveItem: 'Tempest Net', itemEffect: '+30% Loot' },
  'tequila': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Añejo Core', itemEffect: '+25% Yield' },
  'ice': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Cryo Spike', itemEffect: '+15% Boss' },
  'rock-wind': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Gale Hook', itemEffect: '+15% Boss' },
  'space-suit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Void Scanner', itemEffect: '+25% Loot' },
  'shroom': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spore Cache', itemEffect: '+25% Loot' },
  'peyote': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Totem', itemEffect: '+25% Loot' },
  'catrín': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'Silver Cane', itemEffect: '+20% Yield' },
  'catrin': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'Silver Cane', itemEffect: '+20% Yield' },
  'alebrije': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Paint', itemEffect: '+25% Loot' },
  'spirit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Ectoplasm Vial', itemEffect: '+25% Loot' },
  'mariachi': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'War Drum', itemEffect: '+20% Yield' },
  'zombie': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Rotten Bomb', itemEffect: '+12% Boss' },
  'xolo': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Shadow Collar', itemEffect: '+12% Boss' },
  'ai': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Backdoor Chip', itemEffect: '+20% Loot' },
  'robot': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Targeting Module', itemEffect: '+12% Boss' },
  'jaguar': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Predator Claw', itemEffect: '+12% Boss' },
  'slime': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Slime Pouch', itemEffect: '+20% Loot' },
  'agave': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Agave Resin', itemEffect: '+10% Yield' },
  'ape': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4, exclusiveItem: 'Primal Grip', itemEffect: '+8% Boss' },
  'water': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'River Satchel', itemEffect: '+15% Loot' },
  'blue axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Blue Slime Jar', itemEffect: '+15% Loot' },
  'pink axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Pink Slime Jar', itemEffect: '+15% Loot' },
  'jimador': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Jima Blade', itemEffect: '+10% Yield' },
  'classic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Rusty Tool', itemEffect: '+6% Yield' },
  'unknown': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Old Flask', itemEffect: '+6% Yield' }
};

const getWormStats = (type?: string): TraitData => {
  if (!type) return WORM_DATABASE['unknown'];
  const normalizedType = type.toLowerCase();
  const key = Object.keys(WORM_DATABASE).find(k => normalizedType.includes(k));
  return key ? WORM_DATABASE[key] : WORM_DATABASE['unknown'];
};

const ITEMS_INFO: Record<string, { name: string, type: 'yield'|'boss'|'loot', val: number, desc: string }> = {
  'rusty_key': { name: "Rusty Key", type: 'loot', val: 5, desc: "+5% Loot Chance" },
  'dynamite': { name: "Dynamite", type: 'boss', val: 15, desc: "+15% Boss Kill Chance" },
  'raven_monocle': { name: "Raven's Monocle", type: 'yield', val: 10, desc: "+10% Yield Bonus" },
  'golden_harvester': { name: "Golden Harvester", type: 'yield', val: 50, desc: "+50% Massive Yield" },
  'xp_scroll': { name: "XP Scroll", type: 'loot', val: 0, desc: "Boosts XP Gain" },
  'corks_shield': { name: "Cork's Shield", type: 'boss', val: 10, desc: "+10% Boss Defense" },
};

const RAID_LOCATIONS = [
  {
    id: 1,
    name: "The Quick Heist",
    description: "Low risk extraction.",
    boss: "Warehouse Manager",
    bossImg: "https://placehold.co/600x800/1b4d1b/ffffff/png?text=Boss:+Manager", 
    bossDesc: "A grumpy mid-level manager.",
    difficulty: "Easy",
    img: "https://placehold.co/800x400/0f2e0f/ffffff/png?text=Raid:+Warehouse",
    color: "from-green-900 to-black",
    bossLoot: [
        { name: "Rusty Key", dropRate: "40%", img: "https://placehold.co/200x200/333/E15162/png?text=Key", desc: "Common loot key" },
        { name: "XP Scroll", dropRate: "20%", img: "https://placehold.co/200x200/ddd/000/png?text=Scroll", desc: "Boosts XP" }
    ],
    yields: { 7: { min: 600, max: 800 }, 15: { min: 1400, max: 1800 }, 30: { min: 3000, max: 4000 } }
  },
  {
    id: 2,
    name: "Casa Raven Siege",
    description: "High danger assault.",
    boss: "General Cork",
    bossImg: "https://placehold.co/600x800/4d1b1b/ffffff/png?text=Boss:+Gen.+Cork",
    bossDesc: "Heavily armored tactician.",
    difficulty: "Hard",
    img: "https://placehold.co/800x400/2e0f0f/ffffff/png?text=Raid:+Fortress",
    color: "from-red-900 to-black",
    bossLoot: [
        { name: "Dynamite Pack", dropRate: "25%", img: "https://placehold.co/200x200/900/fff/png?text=TNT", desc: "Boss Killer" },
        { name: "Cork's Shield", dropRate: "10%", img: "https://placehold.co/200x200/555/fff/png?text=Shield", desc: "Defense Item" }
    ],
    yields: { 7: { min: 1500, max: 2000 }, 15: { min: 3500, max: 4500 }, 30: { min: 8000, max: 10000 } }
  }
];

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);
  
  const [view, setView] = useState<'dashboard' | 'setup'>('dashboard');
  
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDurationKey, setSelectedDurationKey] = useState<7 | 15 | 30>(7);
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItemInstances, setSelectedItemInstances] = useState<{itemId: string, uid: string}[]>([]);
  
  // UX Mobile: Controlar qué tooltip de item está abierto
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [inventory, setInventory] = useState<any[]>([]);
  const [unstackedInventory, setUnstackedInventory] = useState<{itemId: string, uid: string, qtyIdx: number}[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]); 
  const [lockedMingles, setLockedMingles] = useState<string[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultModal, setResultModal] = useState<any>(null);

  // --- CARGA ---
  const loadUserData = async () => {
    if (!address) return;
    
    const { data: raids } = await supabase.from('active_raids').select('*').eq('wallet_address', address);
    if (raids) {
        const allSquads = raids.flatMap(r => r.squad); 
        setLockedMingles(allSquads);
        const mappedSessions = raids.map(r => {
            const raidInfo = RAID_LOCATIONS.find(loc => loc.id === r.raid_id);
            const endTime = new Date(r.end_time).getTime();
            return { ...r, endTime, location: raidInfo };
        });
        setActiveSessions(mappedSessions);
    }

    const { data: items } = await supabase.from('player_inventory').select('*').eq('wallet_address', address).gt('quantity', 0);
    if (items) {
        setInventory(items);
        const flatItems: {itemId: string, uid: string, qtyIdx: number}[] = [];
        items.forEach((item: any) => {
            for (let i = 0; i < item.quantity; i++) {
                flatItems.push({ itemId: item.item_id, uid: `${item.item_id}-${i}`, qtyIdx: i });
            }
        });
        setUnstackedInventory(flatItems);
    }
  };

  useEffect(() => {
    if (isConnected) loadUserData();
    const interval = setInterval(() => { if(isConnected) loadUserData(); }, 5000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  // --- STATS ---
  const setupStats = useMemo(() => {
      let bossChance = 0; 
      let yieldBonus = 0;
      let lootBonus = 0;
      // Breakdown para UI
      const breakdown = { items: [] as string[] };

      // Base Squad
      if (selectedMingles.length >= 5) bossChance = 50 + ((Math.min(selectedMingles.length, 10) - 5) * 5);
      
      selectedMingles.forEach(id => {
        const m = mingles.find(u => u.id === id);
        const data = getWormStats(m?.type);
        if (data.passiveType === 'boss' || data.passiveType === 'omni') bossChance += data.passiveVal;
        if (data.passiveType === 'yield' || data.passiveType === 'omni') yieldBonus += data.passiveVal;
        if (data.passiveType === 'loot' || data.passiveType === 'omni') lootBonus += data.passiveVal;
      });

      // Item Calculations & Breakdown Text
      const groupedItems: Record<string, number> = {};
      selectedItemInstances.forEach(inst => {
         groupedItems[inst.itemId] = (groupedItems[inst.itemId] || 0) + 1;
      });

      for (const [id, count] of Object.entries(groupedItems)) {
          const info = ITEMS_INFO[id];
          if (info) {
              const totalVal = info.val * count;
              if (info.type === 'boss') bossChance += totalVal;
              if (info.type === 'yield') yieldBonus += totalVal;
              if (info.type === 'loot') lootBonus += totalVal;
              
              // Texto para UI: "2x Dynamite (+30%)"
              breakdown.items.push(`${count}x ${info.name} (+${totalVal}% ${info.type.toUpperCase()})`);
          }
      }

      return { 
          bossChance: Math.min(bossChance, 100), 
          yieldBonus, 
          lootBonus,
          breakdown
      };
  }, [selectedMingles, selectedItemInstances, mingles]);

  const estimatedTequila = useMemo(() => {
    if (!selectedLocation) return "0";
    const baseRange = selectedLocation.yields[selectedDurationKey];
    const rawMin = baseRange.min * Math.max(1, selectedMingles.length);
    const rawMax = baseRange.max * Math.max(1, selectedMingles.length);
    const totalMult = 1 + (setupStats.yieldBonus / 100);
    return `${Math.floor(rawMin * totalMult)} - ${Math.floor(rawMax * totalMult)}`;
  }, [selectedLocation, selectedDurationKey, selectedMingles, setupStats]);

  // --- ACTIONS ---
  const startRaid = async () => {
    if (!address) return;
    if (selectedMingles.length === 0) return alert("Select squad.");
    setIsProcessing(true);
    const durationConfig = DURATION_CONFIG[selectedDurationKey];
    const now = new Date();
    const endTime = new Date(now.getTime() + (durationConfig.seconds * 1000));
    const itemIdsToBurn = selectedItemInstances.map(i => i.itemId);

    try {
        // Update Inventory (Burn items)
        const itemsToUpdate: Record<string, number> = {};
        itemIdsToBurn.forEach(id => { itemsToUpdate[id] = (itemsToUpdate[id] || 0) + 1 });
        for (const [itemId, qtyToBurn] of Object.entries(itemsToUpdate)) {
            const current = inventory.find(i => i.item_id === itemId);
            if (current) {
                 await supabase.from('player_inventory').update({ quantity: Math.max(0, current.quantity - qtyToBurn) }).match({ wallet_address: address, item_id: itemId });
            }
        }
        // Insert Raid
        const { error } = await supabase.from('active_raids').insert([{
            wallet_address: address,
            raid_id: selectedLocation.id,
            squad: selectedMingles,
            items: itemIdsToBurn,
            end_time: endTime.toISOString()
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

        const raidConfig = RAID_LOCATIONS.find(r => r.id === session.raid_id);
        const durationSec = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000;
        let daysKey: 7|15|30 = 7;
        if (durationSec > 1000000) daysKey = 15;
        if (durationSec > 2000000) daysKey = 30;

        const range = raidConfig!.yields[daysKey];
        const baseAmount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        
        // Reconstruir Stats para Yield
        let sYieldBonus = 0;
        let sBossChance = 0;
        let sLootBonus = 0;
        
        // Calcular pasivos Mingles
        session.squad.forEach((id:string) => {
             const m = currentMingles.find((u:any) => u.id === id);
             const d = getWormStats(m?.type);
             if (d.passiveType === 'yield' || d.passiveType === 'omni') sYieldBonus += d.passiveVal;
             if (d.passiveType === 'boss' || d.passiveType === 'omni') sBossChance += d.passiveVal;
             if (d.passiveType === 'loot' || d.passiveType === 'omni') sLootBonus += d.passiveVal;
        });
        
        // Calcular Items
        if(session.items) {
            session.items.forEach((itemId: string) => {
                const info = ITEMS_INFO[itemId];
                if(info) {
                    if(info.type === 'yield') sYieldBonus += info.val;
                    if(info.type === 'boss') sBossChance += info.val;
                    if(info.type === 'loot') sLootBonus += info.val;
                }
            });
        }
        // Base Squad Boss Chance
        if(session.squad.length >= 5) sBossChance += 50 + ((Math.min(session.squad.length, 10) - 5) * 5);

        const yieldMult = 1 + (sYieldBonus / 100);
        const totalTequila = Math.floor(baseAmount * session.squad.length * yieldMult);

        await supabase.rpc('add_points', { p_wallet: address, p_amount: totalTequila });

        const roll = Math.random() * 100;
        const bossDefeated = roll <= Math.min(sBossChance, 100);
        let itemFound = null;

        if (bossDefeated) {
            const lootRoll = Math.random() * 100;
            const lootChance = 30 + sLootBonus;
            if (lootRoll <= lootChance) {
                 const lootDef = raidConfig!.bossLoot[0];
                 const itemId = lootDef.name.toLowerCase().replace(/ /g, '_').replace(/'/g, ''); 
                 const { data: exist } = await supabase.from('player_inventory').select('*').match({wallet_address: address, item_id: itemId}).single();
                 await supabase.from('player_inventory').upsert({
                     wallet_address: address, item_id: itemId, quantity: (exist?.quantity || 0) + 1 
                 }, { onConflict: 'wallet_address, item_id'});
                 itemFound = lootDef;
            }
        }

        await supabase.from('active_raids').delete().eq('id', session.id);
        setResultModal({ bossDefeated, roll, winChance: sBossChance, rewards: { tequila: totalTequila, item: itemFound } });
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
      return [...mingles].sort((a, b) => {
          const aLocked = lockedMingles.includes(a.id!);
          const bLocked = lockedMingles.includes(b.id!);
          if (aLocked === bLocked) return 0;
          return aLocked ? 1 : -1;
      });
  }, [mingles, lockedMingles]);

  // --- RENDER ---
  if (!isConnected) return <ConnectWalletView />;
  
  // MODAL RESULTADO
  if (resultModal) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#E15162]">
                  <h2 className="text-4xl font-black uppercase text-[#1D1D1D] mb-2">Raid Report</h2>
                  <div className="bg-[#EDEDD9] p-4 rounded-xl mb-6 border-2 border-[#1D1D1D]">
                      <p className="text-xs font-black uppercase opacity-50">Harvested</p>
                      <p className="text-4xl font-black text-[#E15162]">{resultModal.rewards.tequila} $TEQ</p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 mb-6 ${resultModal.bossDefeated ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                      <p className="text-lg font-black uppercase mb-1">{resultModal.bossDefeated ? "Boss Defeated!" : "Boss Escaped"}</p>
                      <p className="text-xs font-bold opacity-70">{resultModal.bossDefeated ? "Bonus Loot unlocked." : "No bonus loot."}</p>
                      {resultModal.rewards.item && <div className="mt-3 bg-white p-2 rounded-lg border border-green-500 flex items-center gap-2 justify-center"><span className="text-xl">🎁</span><span className="font-bold text-sm">{resultModal.rewards.item.name}</span></div>}
                  </div>
                  <button onClick={() => setResultModal(null)} className="w-full bg-[#1D1D1D] text-white py-4 rounded-xl font-black uppercase hover:scale-105 transition-transform">Claim & Dismiss</button>
              </div>
          </div>
      )
  }

  // VISTA SETUP
  if (view === 'setup' && selectedLocation) {
      return (
         <div className="max-w-7xl mx-auto pb-20">
             <button onClick={() => setView('dashboard')} className="mb-4 flex items-center gap-2 font-black uppercase hover:text-[#E15162]"><ArrowLeft/> Back to Command Center</button>
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* CONFIG + SQUAD */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                        <h3 className="text-xl font-black uppercase mb-4"><Clock className="inline mr-2"/> 1. Duration</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {([7, 15, 30] as const).map(d => (
                                <div key={d} onClick={() => setSelectedDurationKey(d)} className={`cursor-pointer border-4 rounded-xl p-4 text-center transition-all ${selectedDurationKey === d ? 'bg-[#E15162] border-[#E15162] text-white' : 'border-[#1D1D1D] hover:bg-gray-100'}`}>
                                    <span className="text-2xl font-black">{DURATION_CONFIG[d].label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#EDEDD9] p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-black uppercase"><Sword className="inline mr-2"/> 2. Squad</h3>
                            <span className="bg-[#1D1D1D] text-white px-3 rounded-full text-xs font-bold py-1">{selectedMingles.length}/10</span>
                        </div>
                        {/* SCROLL FIX: h-96 y overflow-auto */}
                        <div className="grid grid-cols-2 gap-3 h-96 overflow-y-auto pr-2 custom-scrollbar content-start">
                            {sortedMingles.map(mingle => {
                                const isLocked = lockedMingles.includes(mingle.id!);
                                const isSelected = selectedMingles.includes(mingle.id!);
                                const stats = getWormStats(mingle.type);
                                return (
                                    <div key={mingle.id} onClick={() => !isLocked && toggleMingle(mingle.id!)}
                                         className={`p-2 rounded-xl border-4 flex items-center gap-3 transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed bg-gray-200' : 'cursor-pointer'} ${isSelected ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white border-[#1D1D1D]/10 hover:border-[#1D1D1D]/30'}`}>
                                        <img src={mingle.image} className="w-10 h-10 rounded bg-gray-300 object-cover"/>
                                        <div>
                                            <p className="text-[10px] font-black uppercase">#{mingle.id}</p>
                                            {isLocked ? <span className="text-[9px] font-bold text-red-500">BUSY</span> : 
                                             <span className="text-[9px] font-bold opacity-70">+{stats.passiveVal}% {stats.passiveType}</span>}
                                        </div>
                                        {isSelected && <CheckCircle2 size={16} className="ml-auto text-[#E15162]"/>}
                                    </div>
                                )
                            })}
                        </div>
                        
                        {/* BACKPACK UNSTACKED */}
                        <div className="mt-6 bg-white/50 p-4 rounded-xl border-2 border-[#1D1D1D]/10">
                            <h4 className="text-xs font-black uppercase mb-3 flex items-center gap-2"><Backpack size={14}/> Supply Slots ({selectedItemInstances.length}/4)</h4>
                            <div className="flex flex-wrap gap-3">
                                {unstackedInventory.length === 0 && <p className="text-xs opacity-50 italic">Empty backpack.</p>}
                                {unstackedInventory.map((itemInstance) => {
                                    const isSelected = selectedItemInstances.some(i => i.uid === itemInstance.uid);
                                    const info = ITEMS_INFO[itemInstance.itemId];
                                    const isTooltipOpen = activeTooltip === itemInstance.uid;

                                    return (
                                        <div key={itemInstance.uid} className="relative group">
                                            {/* Item Card */}
                                            <div 
                                                onClick={() => toggleItemInstance(itemInstance.uid, itemInstance.itemId)} 
                                                className={`
                                                    w-14 h-14 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-transform relative
                                                    ${isSelected ? 'bg-[#E15162] border-[#E15162] shadow-md scale-105' : 'bg-white border-[#1D1D1D]/20 hover:border-[#1D1D1D]'}
                                                `}
                                            >
                                                <img 
                                                    src={`/images/items/${itemInstance.itemId}.png`} 
                                                    onError={(e) => e.currentTarget.src = `https://placehold.co/100x100/eee/333?text=${itemInstance.itemId.substring(0,2)}`}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </div>

                                            {/* Mobile Info Button */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveTooltip(isTooltipOpen ? null : itemInstance.uid); }}
                                                className="absolute -top-2 -right-2 bg-[#1D1D1D] text-white rounded-full p-1 z-20 hover:scale-110"
                                            >
                                                <Info size={10} />
                                            </button>

                                            {/* Tooltip */}
                                            {(isTooltipOpen) && (
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-[#1D1D1D] text-white text-[10px] p-2 rounded-lg z-30 shadow-xl pointer-events-none">
                                                    <p className="font-bold text-[#E15162] uppercase mb-1">{info?.name}</p>
                                                    <p className="opacity-90 leading-tight">{info?.desc}</p>
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D1D1D] rotate-45"></div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COL DERECHA: SIMULACIÓN */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                         <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Skull className="text-[#E15162]"/> Target</h3>
                         <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                             <img src={selectedLocation.bossImg} className="w-full h-full object-cover"/>
                             <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-center"><p className="font-black uppercase text-lg">{selectedLocation.boss}</p></div>
                         </div>
                    </div>

                    <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] sticky top-4">
                        <h3 className="text-2xl font-black uppercase mb-6">Simulation</h3>
                        
                        {/* 1. Boss Win Chance */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs uppercase opacity-70 mb-1">
                                <span>Boss Kill Chance</span>
                                <span>{setupStats.bossChance}%</span>
                            </div>
                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-1">
                                <div className={`h-full ${setupStats.bossChance > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${setupStats.bossChance}%` }}/>
                            </div>
                        </div>

                        {/* 2. Loot Bonus */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs uppercase opacity-70 mb-1">
                                <span>Loot Bonus</span>
                                <span className="text-[#E15162]">+{setupStats.lootBonus}%</span>
                            </div>
                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-[#E15162]" style={{ width: `${Math.min(setupStats.lootBonus, 100)}%` }}/>
                            </div>
                        </div>

                        {/* 3. Yield Bonus */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs uppercase opacity-70 mb-1">
                                <span>Yield Bonus</span>
                                <span className="text-blue-400">+{setupStats.yieldBonus}%</span>
                            </div>
                            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min(setupStats.yieldBonus, 100)}%` }}/>
                            </div>
                        </div>

                        {/* ACTIVE ITEM EFFECTS TEXT */}
                        {setupStats.breakdown.items.length > 0 && (
                            <div className="bg-white/10 p-3 rounded-lg mb-6">
                                <p className="text-[10px] font-bold uppercase opacity-50 mb-2 border-b border-white/20 pb-1">Active Item Effects</p>
                                <div className="space-y-1">
                                    {setupStats.breakdown.items.map((txt, i) => (
                                        <p key={i} className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle2 size={10}/> {txt}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-8 border-t border-white/10 pt-4">
                            <p className="text-xs opacity-50 uppercase">Guaranteed Harvest</p>
                            <p className="text-3xl font-black text-[#E15162]">{estimatedTequila} $TEQ</p>
                        </div>

                        <button onClick={startRaid} disabled={isProcessing} className="w-full bg-[#E15162] text-white py-4 rounded-xl font-black uppercase text-xl hover:bg-white hover:text-[#1D1D1D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isProcessing ? <Loader2 className="animate-spin"/> : "Deploy Squad"}
                        </button>
                    </div>
                </div>
             </div>
         </div>
      )
  }

  // DASHBOARD
  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
        <h1 className="text-5xl font-black uppercase text-[#1D1D1D]">Mission Control</h1>

        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> Active Operations</h2>
            {activeSessions.length === 0 ? (
                <div className="bg-white p-8 rounded-[2rem] border-4 border-[#1D1D1D] border-dashed text-center opacity-50"><p className="font-bold">No active missions.</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map((session) => {
                        const now = Date.now();
                        const timeLeft = Math.max(0, Math.ceil((session.endTime - now) / 1000));
                        const isComplete = timeLeft === 0;
                        return (
                            <div key={session.id} className={`p-6 rounded-[2rem] border-4 border-[#1D1D1D] relative overflow-hidden ${isComplete ? 'bg-green-100' : 'bg-white'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div><h3 className="font-black uppercase text-lg leading-none">{session.location?.name}</h3><p className="text-xs font-bold opacity-60">Squad: {session.squad.length} Mingles</p></div>
                                    {isComplete ? <CheckCircle2 className="text-green-600"/> : <Loader2 className="animate-spin text-[#E15162]"/>}
                                </div>
                                {isComplete ? (
                                    <button onClick={() => resolveMission(session)} disabled={isProcessing} className="w-full bg-[#1D1D1D] text-white py-3 rounded-xl font-black uppercase hover:scale-105 transition-transform">{isProcessing ? "..." : "Resolve Mission"}</button>
                                ) : (
                                    <div>
                                        <div className="text-3xl font-black font-mono text-center my-4">{Math.floor(timeLeft / 60)}m {timeLeft % 60}s</div>
                                        <button onClick={() => cancelRaid(session.id)} className="w-full border-2 border-[#1D1D1D]/10 text-red-500 py-2 rounded-lg text-xs font-black uppercase hover:bg-red-50">Abort Mission</button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>

        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Briefcase/> Available Contracts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RAID_LOCATIONS.map(raid => {
                    // LOCK LOGIC: Si ya hay una misión activa en ESTE contrato, bloquéalo.
                    const isActive = activeSessions.some(s => s.raid_id === raid.id);
                    return (
                        <motion.div key={raid.id} whileHover={!isActive ? { scale: 1.01 } : {}}
                            onClick={() => { if(!isActive) { setSelectedLocation(raid); setView('setup'); } }}
                            className={`bg-[#1D1D1D] text-white rounded-[2rem] overflow-hidden relative h-48 group border-4 border-[#1D1D1D] ${isActive ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}>
                             <img src={raid.img} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"/>
                             <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                 <div className="flex justify-between items-end">
                                     <div><h3 className="text-2xl font-black uppercase">{raid.name}</h3><span className="bg-[#E15162] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{raid.difficulty}</span></div>
                                     <div className="bg-white text-[#1D1D1D] p-2 rounded-full">{isActive ? <Lock size={20}/> : <ChevronRight size={20}/>}</div>
                                 </div>
                                 {isActive && <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded text-xs font-bold uppercase text-red-500">Operation Active</div>}
                             </div>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    </div>
  );
}