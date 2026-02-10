'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, TrendingUp, HelpCircle,
  XCircle, ArrowLeft, ArrowRight, Play
} from 'lucide-react';

import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase'; 
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { fetchUserMingles } from '@/components/engine/indexer';

// ==========================================
// 🔧 CONFIGURACIÓN
// ==========================================
const IS_DEV_MODE = true; // Cambiar a false para producción (7, 15, 30 días)

const DURATION_CONFIG = {
  7:  { label: "7 Days",  seconds: IS_DEV_MODE ? 60 : 604800 },
  15: { label: "15 Days", seconds: IS_DEV_MODE ? 120 : 1296000 },
  30: { label: "30 Days", seconds: IS_DEV_MODE ? 180 : 2592000 }
};

// ==========================================
// 🧠 BASE DE DATOS COMPLETA (TRAITS & RAIDS)
// ==========================================

// 1. TRAITS DE GUSANOS (Definición completa)
type TraitData = {
  rarity: 'Godlike' | 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';
  passiveType: 'yield' | 'boss' | 'loot' | 'omni';
  passiveVal: number;
  exclusiveItem: string;
  itemEffect: string;
};

const WORM_DATABASE: Record<string, TraitData> = {
  'Godlike': { rarity: 'Godlike', passiveType: 'omni', passiveVal: 20, exclusiveItem: 'Mythic Sigil', itemEffect: '+40% Yield' },
  'Gold': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Golden Extractor', itemEffect: '+25% Yield' },
  'Lava': { rarity: 'Legendary', passiveType: 'boss', passiveVal: 8, exclusiveItem: 'Volcanic Charge', itemEffect: '+20% Boss' },
  'Water-Lightning': { rarity: 'Legendary', passiveType: 'loot', passiveVal: 10, exclusiveItem: 'Tempest Net', itemEffect: '+30% Loot' },
  'Tequila': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Añejo Core', itemEffect: '+25% Yield' },
  'Ice': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Cryo Spike', itemEffect: '+15% Boss' },
  'Rock-Wind': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Gale Hook', itemEffect: '+15% Boss' },
  'Space-Suit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Void Scanner', itemEffect: '+25% Loot' },
  'Shroom': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spore Cache', itemEffect: '+25% Loot' },
  'Peyote': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Totem', itemEffect: '+25% Loot' },
  'Catrín': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'Silver Cane', itemEffect: '+20% Yield' },
  'Alebrije': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Paint', itemEffect: '+25% Loot' },
  'Spirit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Ectoplasm Vial', itemEffect: '+25% Loot' },
  'Mariachi': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'War Drum', itemEffect: '+20% Yield' },
  'Zombie': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Rotten Bomb', itemEffect: '+12% Boss' },
  'Xolo': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Shadow Collar', itemEffect: '+12% Boss' },
  'AI-Worm': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Backdoor Chip', itemEffect: '+20% Loot' },
  'Robot': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Targeting Module', itemEffect: '+12% Boss' },
  'Jaguar': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Predator Claw', itemEffect: '+12% Boss' },
  'Slime': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Slime Pouch', itemEffect: '+20% Loot' },
  'Agave': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Agave Resin', itemEffect: '+10% Yield' },
  'Ape': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4, exclusiveItem: 'Primal Grip', itemEffect: '+8% Boss' },
  'Water': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'River Satchel', itemEffect: '+15% Loot' },
  'Blue Axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Blue Slime Jar', itemEffect: '+15% Loot' },
  'Pink Axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Pink Slime Jar', itemEffect: '+15% Loot' },
  'Robot Gen 2': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4, exclusiveItem: 'Servo Kit', itemEffect: '+8% Boss' },
  'Jimador': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Jima Blade', itemEffect: '+10% Yield' },
  'Prehispanic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Obsidian Chip', itemEffect: '+6% Yield' },
  'Classic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Rusty Tool', itemEffect: '+6% Yield' },
  'Unknown': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Old Flask', itemEffect: '+6% Yield' }
};

const getWormStats = (type?: string): TraitData => {
  if (!type) return WORM_DATABASE['Unknown'];
  if (WORM_DATABASE[type]) return WORM_DATABASE[type];
  const key = Object.keys(WORM_DATABASE).find(k => type.includes(k));
  return key ? WORM_DATABASE[key] : WORM_DATABASE['Unknown'];
};

// 2. ITEMS DB (Para visualización en Backpack)
// Mapeamos ID de DB -> Nombre visual
const ITEMS_INFO: Record<string, { name: string }> = {
  'rusty_key': { name: "Rusty Key" },
  'raven_monocle': { name: "Raven's Monocle" },
  'dynamite': { name: "Dynamite" },
  'golden_harvester': { name: "Golden Harvester" },
  'xp_scroll': { name: "XP Scroll" }
};

// 3. RAIDS CONFIG (Con Loot y Boss Detallado)
const RAID_LOCATIONS = [
  {
    id: 1,
    name: "The Quick Heist",
    description: "Low risk warehouse extraction. Ideal for quick liquidity.",
    boss: "Warehouse Manager",
    bossImg: "/images/bosses/manager.jpg", 
    bossDesc: "A grumpy mid-level manager guarding the keys.",
    difficulty: "Easy",
    img: "/images/raids/raid_1.jpg",
    color: "from-green-900 to-black",
    bossLoot: [
        { name: "Rusty Key", dropRate: "40%", img: "/images/items/rusty_key.png", desc: "Common loot key" },
        { name: "XP Scroll", dropRate: "20%", img: "/images/items/scroll.png", desc: "Boosts XP" },
        { name: "Mystery Box", dropRate: "5%", img: "/images/items/question.png", desc: "Unknown contents" },
        { name: "Rare Gem", dropRate: "1%", img: "/images/items/gem.png", desc: "High value" }
    ],
    yields: {
        7: { min: 600, max: 800 },
        15: { min: 1400, max: 1800 },
        30: { min: 3000, max: 4000 }
    }
  },
  {
    id: 2,
    name: "Casa Raven Siege",
    description: "Assault on the fortress. High danger, heavy bags.",
    boss: "General Cork",
    bossImg: "/images/bosses/general_cork.jpg", 
    bossDesc: "Heavily armored tactician. Resistant to basic attacks.",
    difficulty: "Hard",
    img: "/images/raids/raid_2.jpg",
    color: "from-red-900 to-black",
    bossLoot: [
        { name: "Raven's Monocle", dropRate: "15%", img: "/images/items/monocle.png", desc: "Passive Yield Boost" },
        { name: "Dynamite Pack", dropRate: "25%", img: "/images/items/dynamite.png", desc: "Boss Killer" },
        { name: "Cork's Shield", dropRate: "10%", img: "/images/items/shield.png", desc: "Defense Item" },
        { name: "Golden Ticket", dropRate: "0.5%", img: "/images/items/gold_ticket.png", desc: "Legendary Access" }
    ],
    yields: {
        7: { min: 1500, max: 2000 },
        15: { min: 3500, max: 4500 },
        30: { min: 8000, max: 10000 } 
    }
  }
];

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);
  
  // Estados UI
  const [view, setView] = useState<'list' | 'setup' | 'active' | 'verifying' | 'result'>('list');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDurationKey, setSelectedDurationKey] = useState<7 | 15 | 30>(7);
  
  // Selección
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Datos
  const [inventory, setInventory] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [raidResult, setRaidResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- INIT ---
  useEffect(() => {
    const initData = async () => {
      if (!address) return;

      // 1. Cargar Sesión
      const { data: session } = await supabase.from('active_raids').select('*').eq('wallet_address', address).single();
      
      if (session) {
        const endTime = new Date(session.end_time).getTime();
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
        
        const loc = RAID_LOCATIONS.find(r => r.id === session.raid_id);
        
        setActiveSession({ ...session, endTime, location: loc });
        setTimeRemaining(timeLeft);
        setView('active');
      } else {
        setTimeRemaining(null);
      }

      // 2. Cargar Inventario
      const { data: items } = await supabase.from('player_inventory').select('*').eq('wallet_address', address).gt('quantity', 0);
      if (items) setInventory(items);
    };

    if (isConnected) initData();
  }, [address, isConnected]);

  // --- TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'active' && activeSession && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((activeSession.endTime - now) / 1000));
        setTimeRemaining(timeLeft);
        if (timeLeft <= 0) { setTimeRemaining(0); clearInterval(interval); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, activeSession, timeRemaining]);

  // --- CALCULADORA ---
  const stats = useMemo(() => {
    let bossChance = 0; 
    if (selectedMingles.length >= 5) bossChance = 50 + ((Math.min(selectedMingles.length, 10) - 5) * 5);
    
    let totalYieldBonus = 0;
    let lootChanceBonus = 0;

    // Traits
    selectedMingles.forEach(id => {
      const m = mingles.find(u => u.id === id);
      const data = getWormStats(m?.type);
      
      if (data.passiveType === 'boss' || data.passiveType === 'omni') bossChance += data.passiveVal;
      if (data.passiveType === 'yield' || data.passiveType === 'omni') totalYieldBonus += data.passiveVal;
      if (data.passiveType === 'loot' || data.passiveType === 'omni') lootChanceBonus += data.passiveVal;
    });

    return {
      bossChance: Math.min(bossChance, 100),
      yieldBonus: totalYieldBonus,
      lootBonus: lootChanceBonus
    };
  }, [selectedMingles, selectedItems, mingles]);

  const estimatedTequila = useMemo(() => {
    if (!selectedLocation) return "0";
    const baseRange = selectedLocation.yields[selectedDurationKey];
    const rawMin = baseRange.min * Math.max(1, selectedMingles.length);
    const rawMax = baseRange.max * Math.max(1, selectedMingles.length);
    const totalMult = 1 + (stats.yieldBonus / 100);
    return `${Math.floor(rawMin * totalMult)} - ${Math.floor(rawMax * totalMult)}`;
  }, [selectedLocation, selectedDurationKey, selectedMingles, stats]);

  // --- HANDLERS ---
  const toggleMingle = (id: string) => {
    if (selectedMingles.includes(id)) setSelectedMingles(prev => prev.filter(m => m !== id));
    else {
      if (selectedMingles.length >= 10) return alert("Squad full (Max 10).");
      setSelectedMingles(prev => [...prev, id]);
    }
  };

  const toggleItem = (itemId: string) => {
    const hasItem = inventory.find(i => i.item_id === itemId && i.quantity > 0);
    if (!hasItem) return;
    if (selectedItems.includes(itemId)) setSelectedItems(prev => prev.filter(i => i !== itemId));
    else {
      if (selectedItems.length >= 3) return alert("Backpack full (Max 3).");
      setSelectedItems(prev => [...prev, itemId]);
    }
  };

  const startRaid = async () => {
    if (!address) return;
    if (selectedMingles.length === 0) return alert("Select at least 1 Mingle.");
    
    setIsProcessing(true);

    const durationConfig = DURATION_CONFIG[selectedDurationKey];
    const now = new Date();
    const endTime = new Date(now.getTime() + (durationConfig.seconds * 1000));

    const { data, error } = await supabase.from('active_raids').insert([{
        wallet_address: address,
        raid_id: selectedLocation.id,
        squad: selectedMingles,
        items: selectedItems,
        end_time: endTime.toISOString()
    }]).select().single();

    if (error) {
        setIsProcessing(false);
        console.error("Supabase Error:", error);
        return alert("Error starting raid.");
    }

    setActiveSession({ ...data, endTime: endTime.getTime(), location: selectedLocation });
    setTimeRemaining(durationConfig.seconds);
    setView('active');
    setIsProcessing(false);
  };

  const cancelRaid = async () => {
    if (!confirm("Are you sure? No rewards will be given.")) return;
    setIsProcessing(true);
    const { error } = await supabase.from('active_raids').delete().eq('wallet_address', address);
    if (!error) {
        setActiveSession(null);
        setView('list');
        setSelectedMingles([]);
        setSelectedItems([]);
        setTimeRemaining(null);
    } else {
        alert("Error canceling raid.");
    }
    setIsProcessing(false);
  };

  // --- FUNCIÓN FINALIZE REAL (CON PAGO DE PUNTOS) ---
  // --- FUNCIÓN FINALIZE REAL (SEGURIDAD + PUNTOS + ITEMS) ---
  const finalizeRaid = async () => {
    console.log("👉 Claiming rewards initialized...");
    if (!address || !activeSession) return;

    setIsProcessing(true);
    setView('verifying'); // Muestra el spinner de "Verifying..."

    try {
        // ---------------------------------------------------------
        // 1. SECURITY CHECK (Anti-Venta)
        // ---------------------------------------------------------
        // Volvemos a leer la wallet en tiempo real
        const currentMingles = await fetchUserMingles(address);
        
        // Verificamos si CADA mingle que se envió a la misión sigue en la wallet
        const squadIds = activeSession.squad; // IDs guardados en la raid
        const stillOwnsAll = squadIds.every((id: string) => 
            currentMingles.some((m: any) => m.id === id)
        );

        if (!stillOwnsAll) {
            // ¡ALERTA! El usuario vendió o movió un Mingle
            alert("Security Alert: Some Mingles are missing from your wallet. Raid Failed.");
            
            // Castigo: Borramos la raid sin dar premios
            await supabase.from('active_raids').delete().eq('wallet_address', address);
            setActiveSession(null);
            setView('list');
            setIsProcessing(false);
            return; // Se detiene aquí
        }

        // ---------------------------------------------------------
        // 2. CÁLCULO DE RECOMPENSAS
        // ---------------------------------------------------------
        const raidConfig = RAID_LOCATIONS.find(r => r.id === activeSession.raid_id);
        if (!raidConfig) throw new Error("Raid config not found");

        // Determinar duración real para saber qué base usar
        const startTime = new Date(activeSession.start_time).getTime();
        const endTime = new Date(activeSession.end_time).getTime();
        const durationSec = (endTime - startTime) / 1000;

        let daysKey: 7 | 15 | 30 = 7;
        // Lógica simple: si dura más de 10 días es 15, si más de 20 es 30 (ajustable)
        if (durationSec > 1000000) daysKey = 15; 
        if (durationSec > 2000000) daysKey = 30;

        // Yield Random dentro del rango
        const range = raidConfig.yields[daysKey];
        const baseAmount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        const totalReward = baseAmount * activeSession.squad.length; // Multiplicar por squad

        // ---------------------------------------------------------
        // 3. CÁLCULO DE LOOT Y GUARDADO (INVENTORY)
        // ---------------------------------------------------------
        const roll = Math.random() * 100;
        let lootItemFound = null;

        // Probabilidad base 30% de sacar el item común (índice 0)
        // En un sistema avanzado usaríamos las probabilidades individuales de cada item
        if (roll <= 30) {
            // Agarramos el primer item de la lista de loot de esa raid
            const lootDef = raidConfig.bossLoot[0]; 
            
            // Necesitamos un ID limpio para la base de datos (ej: "Rusty Key" -> "rusty_key")
            // Lo ideal es que en RAID_LOCATIONS agregues una propiedad 'id' a cada loot.
            // Aquí lo generamos dinámicamente si no existe:
            const itemId = lootDef.name.toLowerCase().replace(/ /g, '_').replace(/'/g, ''); 
            
            lootItemFound = { ...lootDef, id: itemId };

            // A. Leer inventario actual para ese item
            const { data: existingItem } = await supabase
                .from('player_inventory')
                .select('*')
                .match({ wallet_address: address, item_id: itemId })
                .single();

            // B. Calcular nueva cantidad
            const newQty = (existingItem?.quantity || 0) + 1;

            // C. Guardar (Upsert)
            const { error: invError } = await supabase
                .from('player_inventory')
                .upsert({ 
                    wallet_address: address, 
                    item_id: itemId, 
                    quantity: newQty,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'wallet_address, item_id' }); // Requiere restricción unique en DB

            if (invError) console.error("Error saving loot:", invError);
        }

        // ---------------------------------------------------------
        // 4. TRANSACCIÓN FINAL
        // ---------------------------------------------------------
        
        // A. Sumar Puntos al Usuario
        const { error: rpcError } = await supabase.rpc('add_points', {
            p_wallet: address,
            p_amount: totalReward
        });
        if (rpcError) throw rpcError;

        // B. Borrar Raid Activa (Ya cobró)
        await supabase.from('active_raids').delete().eq('wallet_address', address);

        // ---------------------------------------------------------
        // 5. RESULTADO VISUAL
        // ---------------------------------------------------------
        setActiveSession(null);
        setRaidResult({ 
            tequila: totalReward, 
            xp: 100, 
            bossKilled: roll > 50, 
            bossLootFound: lootItemFound 
        });
        
        setView('result');

    } catch (e: any) {
        console.error("Claim Error:", e);
        alert("Transaction failed. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === null) return "...";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m ${s}s`;
  };

  // --- RENDER ---

  if (!isConnected) return <ConnectWalletView />;
  if (isLoadingMingles) return <div className="flex justify-center h-[50vh]"><Loader2 className="animate-spin text-[#E15162]"/></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b-4 border-[#1D1D1D] pb-4">
         <div>
            <h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Mingles Raids</h1>
            <p className="font-bold text-[#1D1D1D]/60">
                {IS_DEV_MODE ? "⚠️ DEV MODE ACTIVE" : "Soft-Stake Strategy Game"}
            </p>
         </div>
         {view === 'setup' && (
            <button onClick={() => setView('list')} className="font-black uppercase underline decoration-[#E15162] decoration-4">Back to Map</button>
         )}
      </div>

      {/* --- VISTA 1: LISTA --- */}
      {view === 'list' && (
         <div className="space-y-6">
            {activeSession && (
               <div className="bg-[#E15162] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D] flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4">
                     <div className="bg-white p-3 rounded-full text-[#E15162]"><Clock size={32}/></div>
                     <div>
                        <h2 className="text-2xl font-black uppercase">Mission In Progress</h2>
                        <p className="font-bold opacity-90">Deployed at {activeSession.location?.name}</p>
                     </div>
                  </div>
                  <button onClick={() => setView('active')} className="bg-white text-[#1D1D1D] px-6 py-3 rounded-xl font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform">
                     Return <ArrowRight size={20}/>
                  </button>
               </div>
            )}

            <div className="grid grid-cols-1 gap-8">
               {RAID_LOCATIONS.map((raid) => (
                  <motion.div 
                     key={raid.id}
                     whileHover={!activeSession ? { scale: 1.01 } : {}}
                     onClick={() => { if (!activeSession) { setSelectedLocation(raid); setView('setup'); } }}
                     className={`relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D] ${activeSession ? 'grayscale opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
                  >
                     <img src={raid.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     <div className={`absolute inset-0 bg-gradient-to-t ${raid.color} opacity-90 group-hover:opacity-80 transition-opacity`} />
                     <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                        <div className="flex justify-between items-end">
                           <div>
                              <div className="flex gap-2 mb-3">
                                  <span className="bg-[#E15162] text-white text-xs font-black uppercase px-3 py-1 rounded">Boss: {raid.boss}</span>
                                  <span className="bg-white text-[#1D1D1D] text-xs font-black uppercase px-3 py-1 rounded">Diff: {raid.difficulty}</span>
                              </div>
                              <h2 className="text-4xl md:text-5xl font-black uppercase leading-none mb-2 drop-shadow-lg">{raid.name}</h2>
                              <p className="text-lg font-bold opacity-90 max-w-2xl leading-tight drop-shadow-md">{raid.description}</p>
                           </div>
                           {activeSession && <div className="bg-[#1D1D1D] px-4 py-2 rounded-xl font-black uppercase flex items-center gap-2"><XCircle size={16}/> Locked</div>}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      )}

      {/* --- VISTA 2: SETUP (RESTAURADA COMPLETA) --- */}
      {view === 'setup' && selectedLocation && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: CONFIG */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* 1. DURATION */}
               <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                  <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> 1. Select Duration</h3>
                  <div className="grid grid-cols-3 gap-4">
                     {([7, 15, 30] as const).map((days) => (
                        <div key={days} onClick={() => setSelectedDurationKey(days)} className={`cursor-pointer rounded-xl border-4 p-4 text-center transition-all ${selectedDurationKey === days ? 'border-[#E15162] bg-[#E15162] text-white shadow-lg' : 'border-[#1D1D1D]'}`}>
                           <p className="text-2xl font-black">{DURATION_CONFIG[days].label}</p>
                           <p className="text-[10px] font-bold uppercase opacity-80 mt-1">Base: {selectedLocation.yields[days].min}-{selectedLocation.yields[days].max}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* 2. TARGET INTEL (BOSS + LOOT GRID) */}
               <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] relative overflow-hidden">
                  <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2 relative z-10"><Skull className="text-[#E15162]"/> Target Intel: {selectedLocation.boss}</h3>
                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      {/* Boss Img */}
                      <div className="w-full md:w-1/3 shrink-0">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 relative shadow-lg group">
                              <img src={selectedLocation.bossImg} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 backdrop-blur-sm">
                                  <p className="text-xs font-medium leading-tight">{selectedLocation.bossDesc}</p>
                              </div>
                          </div>
                      </div>
                      {/* Loot Grid */}
                      <div className="flex-1">
                          <p className="text-xs font-black uppercase opacity-50 mb-3 border-b border-white/10 pb-1">Known Loot Table</p>
                          <div className="grid grid-cols-2 gap-3">
                              {[0, 1, 2, 3].map((idx) => {
                                  const loot = selectedLocation.bossLoot[idx];
                                  return (
                                      <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                              {loot ? <img src={loot.img} className="w-full h-full object-contain" /> : <HelpCircle size={16} className="opacity-30"/>}
                                          </div>
                                          <div className="overflow-hidden">
                                              {loot ? (
                                                  <>
                                                      <p className="font-bold text-xs truncate text-[#E15162]">{loot.name}</p>
                                                      <p className="text-[10px] opacity-50 truncate">{loot.dropRate}</p>
                                                  </>
                                              ) : (
                                                  <p className="text-[10px] opacity-30 font-black uppercase">Unknown</p>
                                              )}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>
               </div>

               {/* 3. SQUAD + BACKPACK */}
               <div className="bg-[#EDEDD9] p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-black uppercase flex items-center gap-2"><Sword/> 2. Assemble Squad</h3>
                     <span className="bg-[#1D1D1D] text-white px-3 py-1 rounded-full text-xs font-bold">{selectedMingles.length}/10</span>
                  </div>

                  {/* Mingles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                      {mingles.map((mingle) => {
                          const isSelected = selectedMingles.includes(mingle.id!);
                          const stats = getWormStats(mingle.type);
                          const rarityColor = stats.rarity === 'Legendary' ? 'text-orange-500' : stats.rarity === 'Epic' ? 'text-purple-600' : 'text-[#1D1D1D]';

                          return (
                              <div key={mingle.id} onClick={() => toggleMingle(mingle.id!)} className={`flex items-center gap-3 p-3 rounded-xl border-4 cursor-pointer transition-all ${isSelected ? 'bg-[#1D1D1D] border-[#1D1D1D] text-white' : 'bg-white border-[#1D1D1D]/20 hover:border-[#1D1D1D]'}`}>
                                  <img src={mingle.image} className="w-10 h-10 rounded-lg bg-gray-200 object-cover border border-white/20 shrink-0" />
                                  <div className="flex-1 overflow-hidden">
                                      <div className="flex justify-between">
                                          <p className="text-[10px] font-black uppercase opacity-60 truncate">{mingle.name}</p>
                                          {isSelected && <CheckCircle2 size={14} className="text-[#E15162] shrink-0" />}
                                      </div>
                                      <div className="flex items-center gap-1">
                                         <p className={`text-xs font-black uppercase leading-tight ${isSelected ? 'text-[#E15162]' : rarityColor}`}>+{stats.passiveVal}% {stats.passiveType}</p>
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  {/* Backpack */}
                  <div className="bg-white/50 p-4 rounded-xl border-2 border-[#1D1D1D]/10">
                      <h4 className="text-sm font-black uppercase flex items-center gap-2 mb-3"><Backpack size={16}/> Supplies ({selectedItems.length}/3)</h4>
                      <div className="grid grid-cols-6 gap-3">
                          {[0, 1, 2, 3, 4, 5].map((index) => {
                              const invItem = inventory[index];
                              const isSelected = invItem ? selectedItems.includes(invItem.item_id) : false;
                              return (
                                  <div key={index} onClick={() => invItem && toggleItem(invItem.item_id)} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all overflow-hidden ${invItem ? 'bg-white cursor-pointer hover:scale-105 border-[#1D1D1D]' : 'bg-black/5 border-dashed border-[#1D1D1D]/20'} ${isSelected ? 'ring-4 ring-[#E15162]' : ''}`}>
                                      {invItem ? (
                                          <>
                                              <img src={`/images/items/${invItem.item_id}.png`} onError={(e) => e.currentTarget.src = '/images/items/question.png'} className="w-full h-full object-cover"/>
                                              <div className="absolute top-1 right-1 bg-[#1D1D1D] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">x{invItem.quantity}</div>
                                          </>
                                      ) : <div className="w-2 h-2 rounded-full bg-[#1D1D1D] opacity-10"/>}
                                  </div>
                              )
                          })}
                      </div>
                  </div>
               </div>
            </div>

            {/* RIGHT: LIVE STATS */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#EDEDD9] sticky top-4">
                  <h3 className="text-2xl font-black uppercase mb-6">Mission Intel</h3>
                  <div className="mb-8">
                     <p className="text-xs font-bold uppercase opacity-50 mb-1">Projected Earnings</p>
                     <div className="flex items-center gap-2">
                        <TrendingUp className="text-[#E15162]" size={32}/>
                        <div>
                           <p className="text-3xl font-black leading-none">{estimatedTequila}</p>
                           <p className="text-sm font-bold text-[#E15162]">$TEQUILA</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4 mb-8">
                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs font-bold uppercase">Boss Chance</span>
                        <span className={`font-black ${stats.bossChance > 80 ? 'text-green-400' : 'text-orange-400'}`}>{stats.bossChance}%</span>
                     </div>
                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs font-bold uppercase">Loot Bonus</span>
                        <span className="font-black text-[#E15162]">+{stats.lootBonus}%</span>
                     </div>
                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-xs font-bold uppercase">Yield Bonus</span>
                        <span className="font-black text-blue-400">+{stats.yieldBonus}%</span>
                     </div>
                  </div>
                  <button onClick={startRaid} disabled={selectedMingles.length === 0 || isProcessing} className="w-full bg-[#E15162] text-white py-4 rounded-xl font-black uppercase text-xl hover:bg-white hover:text-[#1D1D1D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                     {isProcessing ? <Loader2 className="animate-spin"/> : <>Start Raid <Play fill="currentColor"/></>}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- VISTA 3: ACTIVE & COMPLETE --- */}
      {(view === 'active' || view === 'verifying') && activeSession && (
         <div className="max-w-2xl mx-auto text-center py-20">
            <div className="bg-white rounded-[3rem] border-4 border-[#1D1D1D] p-10 shadow-[12px_12px_0_0_#1D1D1D] relative overflow-hidden">
               {view === 'verifying' ? (
                  <div className="animate-pulse flex flex-col items-center py-10">
                     <Loader2 size={64} className="text-[#E15162] animate-spin mb-4" />
                     <h2 className="text-3xl font-black uppercase">Verifying Mission...</h2>
                  </div>
               ) : timeRemaining === 0 ? (
                  <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                     <div className="inline-block bg-green-100 p-4 rounded-full border-4 border-green-500 mb-2"><CheckCircle2 size={64} className="text-green-600" /></div>
                     <div>
                        <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">Mission Complete</h2>
                        <p className="text-lg font-bold opacity-60">Your squad has returned.</p>
                     </div>
                     <div className="pt-4 space-y-3">
                        <button onClick={finalizeRaid} disabled={isProcessing} className="w-full bg-[#1D1D1D] text-white py-4 rounded-2xl font-black uppercase text-xl shadow-[4px_4px_0_0_#E15162] hover:translate-y-[-2px] transition-transform">
                           {isProcessing ? "Processing..." : "Claim Rewards"}
                        </button>
                        <button onClick={() => setView('list')} className="text-sm font-black uppercase text-[#1D1D1D]/40 hover:text-[#1D1D1D] flex items-center justify-center gap-2 mx-auto pt-2">
                           <ArrowLeft size={14}/> Back to Map (Claim Later)
                        </button>
                     </div>
                  </div>
               ) : (
                  <div>
                     <div className="inline-block bg-[#EDEDD9] px-4 py-1 rounded-full border-2 border-[#1D1D1D] text-xs font-black uppercase mb-6">
                        In Progress • {activeSession.location?.name}
                     </div>
                     <Clock size={64} className="mx-auto text-[#1D1D1D] mb-4 animate-pulse" />
                     <p className="text-6xl md:text-8xl font-black font-mono text-[#1D1D1D] tracking-tighter">
                        {timeRemaining !== null ? formatTime(timeRemaining) : "Loading..."}
                     </p>
                     <p className="text-sm font-bold opacity-40 mt-4 uppercase tracking-widest">Time Remaining</p>
                     <div className="mt-12 border-t-2 border-[#1D1D1D]/10 pt-6">
                        <button onClick={cancelRaid} disabled={isProcessing} className="text-red-500 font-bold uppercase text-xs hover:text-red-700 flex items-center justify-center gap-1 mx-auto hover:bg-red-50 px-3 py-1 rounded transition-colors">
                           <XCircle size={14}/> Cancel Raid (No Rewards)
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* --- VISTA 4: RESULTADO --- */}
      {view === 'result' && raidResult && (
         <div className="max-w-md mx-auto bg-white rounded-[3rem] border-4 border-[#1D1D1D] overflow-hidden text-center shadow-[12px_12px_0_0_#1D1D1D] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-[#E15162] p-8">
               <h2 className="text-4xl font-black uppercase text-white">Mission Report</h2>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <p className="text-xs font-bold uppercase opacity-50">Total Stolen</p>
                  <p className="text-5xl font-black text-[#1D1D1D]">+{raidResult.tequila} $TEQ</p>
               </div>
               {raidResult.bossLootFound && (
                  <div className="bg-[#EDEDD9] p-4 rounded-2xl border-2 border-[#1D1D1D]">
                     <p className="text-xs font-black uppercase mb-2">Rare Loot Found!</p>
                     <p className="text-xl font-bold flex items-center justify-center gap-2 text-[#E15162]">
                        {raidResult.bossLootFound.name}
                     </p>
                  </div>
               )}
               <button onClick={() => { setRaidResult(null); setView('list'); }} className="w-full bg-[#1D1D1D] text-white py-3 rounded-xl font-black uppercase hover:bg-[#E15162] transition-colors">
                  Return to Base
               </button>
            </div>
         </div>
      )}
    </div>
  );
}