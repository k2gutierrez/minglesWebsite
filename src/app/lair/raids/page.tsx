'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, TrendingUp, HelpCircle,
  XCircle, Play, Briefcase, ChevronRight, ArrowLeft, 
  Lock, Info, Filter, Zap, LayoutGrid, AlertCircle
} from 'lucide-react';

import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase'; 
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { fetchUserMingles } from '@/components/engine/indexer';

// ==========================================
// 🔧 CONFIGURACIÓN & DATOS (FRONTEND)
// ==========================================
const IS_DEV_MODE = true; 

const DURATION_CONFIG = {
  7:  { label: "7 Days",  seconds: IS_DEV_MODE ? 60 : 604800 },
  15: { label: "15 Days", seconds: IS_DEV_MODE ? 120 : 1296000 },
  30: { label: "30 Days", seconds: IS_DEV_MODE ? 180 : 2592000 }
};

// --- TRAITS ---
type TraitData = { rarity: string; passiveType: 'yield' | 'boss' | 'loot' | 'omni'; passiveVal: number; };
const WORM_DATABASE: Record<string, TraitData> = {
  'godlike': { rarity: 'Godlike', passiveType: 'omni', passiveVal: 20 },
  'gold': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12 },
  'lava': { rarity: 'Legendary', passiveType: 'boss', passiveVal: 8 },
  'water-lightning': { rarity: 'Legendary', passiveType: 'loot', passiveVal: 10 },
  'tequila': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12 },
  'ice': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7 },
  'rock-wind': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7 },
  'space-suit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8 },
  'shroom': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8 },
  'peyote': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8 },
  'catrín': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10 },
  'mariachi': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10 },
  'zombie': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6 },
  'robot': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6 },
  'ai': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6 },
  'slime': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6 },
  'agave': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6 },
  'ape': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4 },
  'classic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3 },
  'unknown': { rarity: 'Common', passiveType: 'yield', passiveVal: 3 }
};

const getWormStats = (type?: string): TraitData => {
  if (!type) return WORM_DATABASE['unknown'];
  const normalizedType = type.toLowerCase();
  const key = Object.keys(WORM_DATABASE).find(k => normalizedType.includes(k));
  return key ? WORM_DATABASE[key] : WORM_DATABASE['unknown'];
};

// --- ITEMS ---
const ITEMS_INFO: Record<string, { name: string, type: 'yield'|'boss'|'loot', val: number, desc: string }> = {
  'rusty_key': { name: "Rusty Key", type: 'loot', val: 5, desc: "+5% Loot Chance" },
  'dynamite': { name: "Dynamite", type: 'boss', val: 15, desc: "+15% Boss Kill Chance" },
  'raven_monocle': { name: "Raven's Monocle", type: 'yield', val: 10, desc: "+10% Yield Bonus" },
  'golden_harvester': { name: "Golden Harvester", type: 'yield', val: 50, desc: "+50% Massive Yield" },
  'xp_scroll': { name: "XP Scroll", type: 'loot', val: 0, desc: "Boosts XP Gain" },
  'corks_shield': { name: "Cork's Shield", type: 'boss', val: 10, desc: "+10% Boss Defense" },
};

// --- RAIDS ---
const RAID_LOCATIONS = [
  {
    id: 1,
    name: "The Quick Heist",
    description: "Low risk warehouse extraction. Ideal for quick liquidity.",
    boss: "Warehouse Manager",
    bossImg: "https://placehold.co/600x800/1b4d1b/ffffff/png?text=Boss:+Manager", 
    bossDesc: "A grumpy mid-level manager guarding the keys.",
    difficulty: "Easy",
    img: "https://placehold.co/800x300/0f2e0f/ffffff/png?text=Raid:+Warehouse",
    color: "from-green-900 to-black",
    bossLoot: [
        { name: "Rusty Key", dropRate: "40%", img: "https://placehold.co/200x200/333/E15162/png?text=Key", desc: "Common loot key" },
        { name: "XP Scroll", dropRate: "20%", img: "https://placehold.co/200x200/ddd/000/png?text=Scroll", desc: "Boosts XP" },
        { name: "Mystery Box", dropRate: "5%", img: "https://placehold.co/200x200/444/fff/png?text=???", desc: "Unknown" },
        { name: "Rare Gem", dropRate: "1%", img: "https://placehold.co/200x200/800080/fff/png?text=Gem", desc: "High value" }
    ],
    yields: { 7: { min: 600, max: 800 }, 15: { min: 1400, max: 1800 }, 30: { min: 3000, max: 4000 } }
  },
  {
    id: 2,
    name: "Casa Raven Siege",
    description: "Assault on the fortress. High danger, heavy bags.",
    boss: "General Cork",
    bossImg: "https://placehold.co/600x800/4d1b1b/ffffff/png?text=Boss:+Gen.+Cork",
    bossDesc: "Heavily armored tactician.",
    difficulty: "Hard",
    img: "https://placehold.co/800x300/2e0f0f/ffffff/png?text=Raid:+Fortress",
    color: "from-red-900 to-black",
    bossLoot: [
        { name: "Dynamite Pack", dropRate: "25%", img: "https://placehold.co/200x200/900/fff/png?text=TNT", desc: "Boss Killer" },
        { name: "Cork's Shield", dropRate: "10%", img: "https://placehold.co/200x200/555/fff/png?text=Shield", desc: "Defense Item" },
        { name: "Raven Plans", dropRate: "5%", img: "https://placehold.co/200x200/000/fff/png?text=Plans", desc: "Intel Item" },
        { name: "Golden Medal", dropRate: "1%", img: "https://placehold.co/200x200/gold/000/png?text=Medal", desc: "Trophy" }
    ],
    yields: { 7: { min: 1500, max: 2000 }, 15: { min: 3500, max: 4500 }, 30: { min: 8000, max: 10000 } }
  }
];

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);
  
  const [view, setView] = useState<'dashboard' | 'setup'>('dashboard');
  
  // Setup State
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDurationKey, setSelectedDurationKey] = useState<7 | 15 | 30>(7);
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItemInstances, setSelectedItemInstances] = useState<{itemId: string, uid: string}[]>([]);
  const [squadFilter, setSquadFilter] = useState<'all' | 'yield' | 'boss' | 'loot'>('all');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Data
  const [inventory, setInventory] = useState<any[]>([]);
  const [unstackedInventory, setUnstackedInventory] = useState<{itemId: string, uid: string, qtyIdx: number}[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]); 
  const [lockedMingles, setLockedMingles] = useState<string[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultModal, setResultModal] = useState<any>(null);
  const [userPoints, setUserPoints] = useState(0);

  // --- 1. LOAD DATA ---
  const loadUserData = async () => {
    if (!address) return;
    
    const { data: user } = await supabase.from('users').select('points').eq('wallet_address', address).single();
    if(user) setUserPoints(user.points);

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

  // --- 2. CALCULATORS ---
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
        if (data.passiveType === 'boss' || data.passiveType === 'omni') bossChance += data.passiveVal;
        if (data.passiveType === 'yield' || data.passiveType === 'omni') yieldBonus += data.passiveVal;
        if (data.passiveType === 'loot' || data.passiveType === 'omni') lootBonus += data.passiveVal;
      });

      const groupedItems: Record<string, number> = {};
      selectedItemInstances.forEach(inst => { groupedItems[inst.itemId] = (groupedItems[inst.itemId] || 0) + 1; });

      for (const [id, count] of Object.entries(groupedItems)) {
          const info = ITEMS_INFO[id];
          if (info) {
              const totalVal = info.val * count;
              if (info.type === 'boss') bossChance += totalVal;
              if (info.type === 'yield') yieldBonus += totalVal;
              if (info.type === 'loot') lootBonus += totalVal;
              breakdown.items.push(`${count}x ${info.name} (+${totalVal}% ${info.type.toUpperCase()})`);
          }
      }

      return { bossChance: Math.min(bossChance, 100), yieldBonus, lootBonus, breakdown };
  }, [selectedMingles, selectedItemInstances, mingles]);

  const estimatedTequila = useMemo(() => {
    if (!selectedLocation) return "0";
    const baseRange = selectedLocation.yields[selectedDurationKey];
    const rawMin = baseRange.min * Math.max(1, selectedMingles.length);
    const rawMax = baseRange.max * Math.max(1, selectedMingles.length);
    const totalMult = 1 + (setupStats.yieldBonus / 100);
    return `${Math.floor(rawMin * totalMult)} - ${Math.floor(rawMax * totalMult)}`;
  }, [selectedLocation, selectedDurationKey, selectedMingles, setupStats]);

  // --- 3. ACTIONS ---
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
            alert("Security Fail: Mingles missing. Raid Failed.");
            await loadUserData();
            setIsProcessing(false);
            return;
        }

        const raidConfig = RAID_LOCATIONS.find(r => r.id === session.raid_id);
        const durationSec = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000;
        let daysKey: 7|15|30 = 7;
        if (durationSec > 1000000) daysKey = 15; if (durationSec > 2000000) daysKey = 30;
        const range = raidConfig!.yields[daysKey];
        const baseAmount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        
        let sYieldBonus = 0; let sBossChance = 0; 
        session.squad.forEach((id:string) => {
             const m = currentMingles.find((u:any) => u.id === id);
             const d = getWormStats(m?.type);
             if (d.passiveType === 'yield' || d.passiveType === 'omni') sYieldBonus += d.passiveVal;
             if (d.passiveType === 'boss' || d.passiveType === 'omni') sBossChance += d.passiveVal;
        });
        if(session.items) {
            session.items.forEach((itemId: string) => {
                const info = ITEMS_INFO[itemId];
                if(info) {
                    if(info.type === 'yield') sYieldBonus += info.val;
                    if(info.type === 'boss') sBossChance += info.val;
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
        if (bossDefeated && Math.random() < 0.3) { 
             bossLoot = raidConfig!.bossLoot[0];
             const itemId = bossLoot.name.toLowerCase().replace(/ /g, '_').replace(/'/g, ''); 
             const { data: exist } = await supabase.from('player_inventory').select('*').match({wallet_address: address, item_id: itemId}).single();
             await supabase.from('player_inventory').upsert({ wallet_address: address, item_id: itemId, quantity: (exist?.quantity || 0) + 1 }, { onConflict: 'wallet_address, item_id'});
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
              return data.passiveType === squadFilter || data.passiveType === 'omni';
          });
      }
      return filtered.sort((a, b) => {
          const aLocked = lockedMingles.includes(a.id!);
          const bLocked = lockedMingles.includes(b.id!);
          if (aLocked === bLocked) return 0;
          return aLocked ? 1 : -1;
      });
  }, [mingles, lockedMingles, squadFilter]);

  if (!isConnected) return <ConnectWalletView />;

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
                                  <img src={resultModal.rewards.bossLoot.img} className="w-12 h-12 object-contain"/>
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
  // VIEW: SETUP (DETAILS)
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
                
                {/* --- LEFT COLUMN --- */}
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
                        
                        {/* 1. CORRECCION UI: GRID DE SQUAD (Vertical cards for 3 cols) */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar content-start">
                            {sortedMingles.map(mingle => {
                                const isLocked = lockedMingles.includes(mingle.id!);
                                const isSelected = selectedMingles.includes(mingle.id!);
                                const stats = getWormStats(mingle.type);

                                return (
                                    <div key={mingle.id} onClick={() => !isLocked && toggleMingle(mingle.id!)}
                                         className={`
                                            relative flex flex-col rounded-xl border-4 overflow-hidden cursor-pointer transition-all h-auto
                                            ${isLocked ? 'opacity-40 grayscale cursor-not-allowed bg-gray-200' : 'hover:scale-[1.02]'} 
                                            ${isSelected ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white border-[#1D1D1D]/10 hover:border-[#1D1D1D]/30'}
                                         `}
                                    >
                                        {/* Image Container: Square Aspect Ratio */}
                                        <div className="w-full aspect-square relative bg-gray-200">
                                            <img src={mingle.image} className="absolute inset-0 w-full h-full object-cover"/>
                                            {isSelected && <div className="absolute top-2 right-2 bg-[#E15162] rounded-full p-1"><CheckCircle2 size={12} className="text-white"/></div>}
                                            {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Busy</span></div>}
                                        </div>
                                        
                                        {/* Info Section */}
                                        <div className="p-3 flex flex-col justify-between flex-1">
                                            <p className="text-[11px] font-black uppercase leading-tight mb-1">#{mingle.id}</p>
                                            <span className={`text-[10px] font-bold leading-tight ${isSelected ? 'text-[#E15162]' : 'opacity-60'}`}>
                                                +{stats.passiveVal}% {stats.passiveType.toUpperCase()}
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
                                    const info = ITEMS_INFO[itemInstance.itemId];
                                    const isTooltipOpen = activeTooltip === itemInstance.uid;

                                    return (
                                        <div key={itemInstance.uid} className="relative group">
                                            <div onClick={() => toggleItemInstance(itemInstance.uid, itemInstance.itemId)} className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-transform relative ${isSelected ? 'bg-[#E15162] border-[#E15162] shadow-md scale-105' : 'bg-white border-[#1D1D1D]/20 hover:border-[#1D1D1D]'}`}>
                                                <img src={`/images/items/${itemInstance.itemId}.png`} onError={(e) => e.currentTarget.src = `https://placehold.co/100x100/eee/333?text=${itemInstance.itemId.substring(0,2)}`} className="w-8 h-8 object-contain"/>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(isTooltipOpen ? null : itemInstance.uid); }} className="absolute -top-2 -right-2 bg-[#1D1D1D] text-white rounded-full p-1 z-20 hover:scale-110"><Info size={10} /></button>
                                            {(isTooltipOpen) && (
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-[#1D1D1D] text-white text-[10px] p-2 rounded-lg z-30 shadow-xl pointer-events-none">
                                                    <p className="font-bold text-[#E15162] uppercase mb-1">{info?.name}</p>
                                                    <p className="opacity-90 leading-tight">{info?.desc}</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
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
                             {/* 2. CORRECCION UI: Grid Boss Items 2x2 (Image Left, Info Right) */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {selectedLocation.bossLoot.map((loot:any, i:number) => (
                                     <div key={i} className="flex h-20 bg-white/5 rounded-lg overflow-hidden border border-white/10 items-stretch">
                                         {/* Left: Image Container */}
                                         <div className="w-20 bg-white/5 flex items-center justify-center p-2 shrink-0 border-r border-white/5">
                                             <img src={loot.img} className="max-w-full max-h-full object-contain"/>
                                         </div>
                                         {/* Right: Info */}
                                         <div className="flex-1 p-2 flex flex-col justify-between">
                                             <p className="font-bold text-[10px] leading-tight line-clamp-2 text-[#E15162]">{loot.name}</p>
                                             <p className="text-[8px] opacity-60 line-clamp-1">{loot.desc}</p>
                                             <div className="mt-1 self-start bg-white/10 px-1.5 rounded text-[8px] font-mono">{loot.dropRate}</div>
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

                        {/* 3. CORRECCION UI: BOTÓN GIGANTE */}
                        <button 
                            onClick={startRaid} 
                            disabled={isProcessing} 
                            className="w-full bg-[#E15162] text-white py-5 rounded-2xl font-black uppercase text-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(225,81,98,0.4)] hover:shadow-[0_6px_20px_rgba(225,81,98,0.6)] border-b-8 border-[#c03546]"
                        >
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
        
        {/* HEADER & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-[#1D1D1D] pb-6 gap-6">
             <div><h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Mission Control</h1><p className="font-bold text-[#1D1D1D]/60">Manage your operations.</p></div>
             <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
                 <div className="bg-[#1D1D1D] text-white px-4 py-3 rounded-2xl min-w-[120px]"><p className="text-[10px] font-bold uppercase opacity-60">Total Tequila</p><p className="text-xl font-black text-[#E15162]">{userStats.tequila}</p></div>
                 <div className="bg-white border-2 border-[#1D1D1D] px-4 py-3 rounded-2xl min-w-[120px]"><p className="text-[10px] font-bold uppercase opacity-60">Items</p><p className="text-xl font-black">{userStats.totalItems}</p></div>
                 <div className="bg-white border-2 border-[#1D1D1D] px-4 py-3 rounded-2xl min-w-[120px]"><p className="text-[10px] font-bold uppercase opacity-60">Squad Status</p><p className="text-xl font-black"><span className="text-red-500">{userStats.minglesBusy} Busy</span> / {userStats.minglesFree} Free</p></div>
             </div>
        </div>

        {/* ACTIVE OPERATIONS */}
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

        {/* AVAILABLE RAIDS */}
        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><LayoutGrid/> Available Raids</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RAID_LOCATIONS.map(raid => {
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