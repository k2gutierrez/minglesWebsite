'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, TrendingUp, HelpCircle,
  XCircle, AlertTriangle
} from 'lucide-react';

// Imports de tu arquitectura
import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase'; 
import { ConnectWalletView } from '@/components/ConnectWalletView';

// ==========================================
// 🔧 CONFIGURACIÓN DE DESARROLLO (DEV MODE)
// ==========================================
// true = 1min, 2min, 3min (Pruebas)
// false = 7d, 15d, 30d (Producción)
const IS_DEV_MODE = true; 

const DURATION_CONFIG = {
  7:  { label: "7 Days",  seconds: IS_DEV_MODE ? 60 : 604800 },
  15: { label: "15 Days", seconds: IS_DEV_MODE ? 120 : 1296000 },
  30: { label: "30 Days", seconds: IS_DEV_MODE ? 180 : 2592000 }
};

// ==========================================
// 🧠 CEREBRO DEL JUEGO: LA TABLA CANÓNICA
// ==========================================
// Aquí definimos las reglas de negocio exactas que proporcionaste.

type TraitData = {
  rarity: 'Godlike' | 'Legendary' | 'Epic' | 'Rare' | 'Uncommon' | 'Common';
  passiveType: 'yield' | 'boss' | 'loot' | 'omni';
  passiveVal: number; // Porcentaje (ej: 12 para 12%)
  exclusiveItem: string;
  itemEffect: string;
};

const WORM_DATABASE: Record<string, TraitData> = {
  // --- GODLIKE (1/1) ---
  'Godlike': { rarity: 'Godlike', passiveType: 'omni', passiveVal: 20, exclusiveItem: 'Mythic Sigil', itemEffect: '+40% Yield' },

  // --- LEGENDARY ---
  'Gold': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Golden Extractor', itemEffect: '+25% Yield' },
  'Lava': { rarity: 'Legendary', passiveType: 'boss', passiveVal: 8, exclusiveItem: 'Volcanic Charge', itemEffect: '+20% Boss' },
  'Water-Lightning': { rarity: 'Legendary', passiveType: 'loot', passiveVal: 10, exclusiveItem: 'Tempest Net', itemEffect: '+30% Loot' },
  'Tequila': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Añejo Core', itemEffect: '+25% Yield' },

  // --- EPIC ---
  'Ice': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Cryo Spike', itemEffect: '+15% Boss' },
  'Rock-Wind': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Gale Hook', itemEffect: '+15% Boss' },
  'Space-Suit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Void Scanner', itemEffect: '+25% Loot' },
  'Shroom': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spore Cache', itemEffect: '+25% Loot' },
  'Peyote': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Totem', itemEffect: '+25% Loot' },
  'Catrín': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'Silver Cane', itemEffect: '+20% Yield' },
  'Alebrije': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Paint', itemEffect: '+25% Loot' },
  'Spirit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Ectoplasm Vial', itemEffect: '+25% Loot' },
  'Mariachi': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'War Drum', itemEffect: '+20% Yield' },

  // --- RARE ---
  'Zombie': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Rotten Bomb', itemEffect: '+12% Boss' },
  'Xolo': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Shadow Collar', itemEffect: '+12% Boss' },
  'AI-Worm': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Backdoor Chip', itemEffect: '+20% Loot' },
  'Robot': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Targeting Module', itemEffect: '+12% Boss' },
  'Jaguar': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Predator Claw', itemEffect: '+12% Boss' },
  'Slime': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Slime Pouch', itemEffect: '+20% Loot' },

  // --- UNCOMMON ---
  'Agave': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Agave Resin', itemEffect: '+10% Yield' },
  'Ape': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4, exclusiveItem: 'Primal Grip', itemEffect: '+8% Boss' },
  'Water': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'River Satchel', itemEffect: '+15% Loot' },
  'Blue Axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Blue Slime Jar', itemEffect: '+15% Loot' },
  'Pink Axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Pink Slime Jar', itemEffect: '+15% Loot' },
  'Robot Gen 2': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4, exclusiveItem: 'Servo Kit', itemEffect: '+8% Boss' },
  'Jimador': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Jima Blade', itemEffect: '+10% Yield' },

  // --- COMMON ---
  'Prehispanic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Obsidian Chip', itemEffect: '+6% Yield' },
  'Classic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Rusty Tool', itemEffect: '+6% Yield' },
  
  // Fallback
  'Unknown': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Old Flask', itemEffect: '+6% Yield' }
};

// Función auxiliar para buscar (Match Parcial)
// Ejemplo: "Classic Red" -> Busca "Classic" -> Retorna datos de Classic
const getWormStats = (type?: string): TraitData => {
  if (!type) return WORM_DATABASE['Unknown'];
  // 1. Búsqueda exacta
  if (WORM_DATABASE[type]) return WORM_DATABASE[type];
  // 2. Búsqueda parcial (contiene)
  const key = Object.keys(WORM_DATABASE).find(k => type.includes(k));
  return key ? WORM_DATABASE[key] : WORM_DATABASE['Unknown'];
};

// --- BASE DE DATOS DE ITEMS (MOCK PARA UI) ---
// Aquí mapeamos los IDs de items a sus nombres bonitos
const ITEMS_INFO: Record<string, { name: string, effect: string, type: 'loot' | 'boss' | 'yield' }> = {
  // Legendary Items
  'Golden Extractor': { name: "Golden Extractor", effect: "+25% Yield", type: "yield" },
  'Volcanic Charge': { name: "Volcanic Charge", effect: "+20% Boss", type: "boss" },
  // ... Agregar el resto según necesites mostrar en inventario
  'Rusty Key': { name: "Rusty Key", effect: "+5% Loot", type: "loot" }, // Legacy item example
};


// ==========================================
// 🗺️ CONFIGURACIÓN DE RAIDS (AÑADE MÁS AQUÍ)
// ==========================================
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
    // 4 Slots de Loot (Visual)
    bossLoot: [
        { name: "Rusty Key", dropRate: "40%", img: "/images/items/rusty_key.png" },
        { name: "XP Scroll", dropRate: "20%", img: "/images/items/scroll.png" },
        { name: "Mystery Box", dropRate: "5%", img: "/images/items/question.png" },
        { name: "Rare Gem", dropRate: "1%", img: "/images/items/gem.png" }
    ],
    // Bases de Tequila (Sin multiplicadores, bases directas)
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
        { name: "Raven's Monocle", dropRate: "15%", img: "/images/items/monocle.png" },
        { name: "Dynamite Pack", dropRate: "25%", img: "/images/items/dynamite.png" },
        { name: "Cork's Shield", dropRate: "10%", img: "/images/items/shield.png" },
        { name: "Golden Ticket", dropRate: "0.5%", img: "/images/items/gold_ticket.png" }
    ],
    yields: {
        7: { min: 1500, max: 2000 },
        15: { min: 3500, max: 4500 },
        30: { min: 8000, max: 10000 } 
    }
  }
  // PARA AGREGAR OTRA RAID: Copia el objeto de arriba, cambia ID, nombre, img y yields.
];

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);
  
  // Estados UI
  const [view, setView] = useState<'list' | 'setup' | 'active' | 'verifying' | 'result'>('list');
  const [subTab, setSubTab] = useState<'squad' | 'boss'>('squad'); 
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  
  // Duración: Por defecto 7 días
  const [selectedDurationKey, setSelectedDurationKey] = useState<7 | 15 | 30>(7);
  
  // Selección
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Datos
  const [inventory, setInventory] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [raidResult, setRaidResult] = useState<any>(null);
  
  // Estado de carga para acciones
  const [isProcessing, setIsProcessing] = useState(false);

  // --- INIT ---
  useEffect(() => {
    const initData = async () => {
      if (!address) return;

      // 1. Cargar Sesión Activa
      const { data: session } = await supabase.from('active_raids').select('*').eq('wallet_address', address).single();
      if (session) {
        const endTime = new Date(session.end_time).getTime();
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
        const loc = RAID_LOCATIONS.find(r => r.id === session.raid_id);
        
        setActiveSession({ ...session, endTime, location: loc });
        setTimeRemaining(timeLeft);
        setView('active');
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

  // --- CALCULADORA DE ESTADÍSTICAS (LIVE) ---
  const stats = useMemo(() => {
    let bossChance = 0; // Base 0
    // Base por tamaño de squad: +5% por cada mangle a partir del 5to?
    // Regla simplificada: 5 mingles = 50%, cada extra +5%
    if (selectedMingles.length >= 5) bossChance = 50 + ((Math.min(selectedMingles.length, 10) - 5) * 5);
    
    let totalYieldBonus = 0;
    let lootChanceBonus = 0;

    // Sumar stats de Mingles (Pasivos)
    selectedMingles.forEach(id => {
      const m = mingles.find(u => u.id === id);
      const data = getWormStats(m?.type);
      
      // Aplicar pasivos según tipo
      if (data.passiveType === 'boss' || data.passiveType === 'omni') bossChance += data.passiveVal;
      if (data.passiveType === 'yield' || data.passiveType === 'omni') totalYieldBonus += data.passiveVal;
      if (data.passiveType === 'loot' || data.passiveType === 'omni') lootChanceBonus += data.passiveVal;
    });

    // Sumar stats de Items (Aquí usaríamos los valores reales de los items si estuvieran en DB)
    // Por ahora, asumimos valores genéricos o leemos de ITEMS_INFO si coincide el nombre
    selectedItems.forEach(itemId => {
       // Lógica simple para items visuales:
       // Si el item es tipo 'yield' sumamos, etc.
       // Para MVP asumimos un flat bonus si se usa un item
       // bossChance += 10; 
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
    
    const rawMin = baseRange.min * selectedMingles.length;
    const rawMax = baseRange.max * selectedMingles.length;
    
    // Multiplicador solo de pasivos (Hold/Social se calculan en backend o finalización)
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
    // Validar propiedad
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

    // Calcular tiempo basado en Configuración (Dev vs Prod)
    const durationConfig = DURATION_CONFIG[selectedDurationKey];
    const now = new Date();
    const endTime = new Date(now.getTime() + (durationConfig.seconds * 1000));

    // Guardar en Supabase
    const { data, error } = await supabase.from('active_raids').insert([{
        wallet_address: address,
        raid_id: selectedLocation.id,
        squad: selectedMingles,
        items: selectedItems,
        end_time: endTime.toISOString()
    }]).select().single();

    if (error) {
        setIsProcessing(false);
        return alert("Error starting raid. You might already have one active.");
    }

    setActiveSession({ ...data, endTime: endTime.getTime(), location: selectedLocation });
    setTimeRemaining(durationConfig.seconds);
    setView('active');
    setIsProcessing(false);
  };

  const cancelRaid = async () => {
    if (!confirm("Are you sure you want to CANCEL the raid? You will receive NO rewards, but your Mingles will be freed immediately.")) return;
    
    setIsProcessing(true);
    // Borrar de DB
    const { error } = await supabase.from('active_raids').delete().eq('wallet_address', address);
    
    if (!error) {
        setActiveSession(null);
        setView('list');
        // Reset local selections
        setSelectedMingles([]);
        setSelectedItems([]);
    } else {
        alert("Error canceling raid.");
    }
    setIsProcessing(false);
  };

  const finalizeRaid = async () => {
    setIsProcessing(true);
    setView('verifying');
    
    // Simulación de delay de verificación
    setTimeout(async () => {
        // En producción, aquí haríamos una llamada RPC para calcular premios seguros
        await supabase.from('active_raids').delete().eq('wallet_address', address);
        setActiveSession(null);
        setRaidResult({ 
            tequila: 4500, // Mock value
            xp: 100, 
            bossKilled: true,
            bossLootFound: selectedLocation.bossLoot[0] 
        });
        setView('result');
        setIsProcessing(false);
    }, 2000);
  };

  // Helper para formato de tiempo
  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m ${s}s`;
  };

  if (!isConnected) return <ConnectWalletView />;
  if (isLoadingMingles) return <div className="flex justify-center h-[50vh]"><Loader2 className="animate-spin text-[#E15162]"/></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b-4 border-[#1D1D1D] pb-4">
         <div>
            <h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Mingles Raids</h1>
            <p className="font-bold text-[#1D1D1D]/60">
                {IS_DEV_MODE ? "⚠️ DEV MODE ACTIVE (1-3 min raids)" : "Soft-Stake Strategy Game"}
            </p>
         </div>
         {view === 'setup' && (
            <button onClick={() => setView('list')} className="font-black uppercase underline decoration-[#E15162] decoration-4">Back to Map</button>
         )}
      </div>

      {/* --- VISTA 1: LISTA DE RAIDS --- */}
      {view === 'list' && !activeSession && (
         <div className="grid grid-cols-1 gap-8">
            {RAID_LOCATIONS.map((raid) => (
               <motion.div 
                  key={raid.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => { setSelectedLocation(raid); setView('setup'); setSubTab('squad'); }}
                  className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden border-4 border-[#1D1D1D] cursor-pointer group shadow-[8px_8px_0_0_#1D1D1D]"
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
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      )}

      {/* --- VISTA 2: SETUP --- */}
      {view === 'setup' && selectedLocation && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: SETUP & BOSS INTEL */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* 1. DURATION SELECTOR (Con Toggle Dev Mode implicito) */}
               <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                  <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> 1. Select Duration</h3>
                  <div className="grid grid-cols-3 gap-4">
                     {([7, 15, 30] as const).map((days) => {
                        const conf = DURATION_CONFIG[days];
                        return (
                            <div 
                            key={days}
                            onClick={() => setSelectedDurationKey(days)}
                            className={`cursor-pointer rounded-xl border-4 p-4 text-center transition-all ${selectedDurationKey === days ? 'border-[#E15162] bg-[#E15162] text-white shadow-lg scale-105' : 'border-[#1D1D1D] bg-white hover:bg-[#EDEDD9]'}`}
                            >
                            <p className="text-2xl font-black">{conf.label}</p>
                            <p className="text-[10px] font-bold uppercase opacity-80 mt-1">
                                Base: {selectedLocation.yields[days].min}-{selectedLocation.yields[days].max}
                            </p>
                            </div>
                        );
                     })}
                  </div>
               </div>

               {/* 2. TARGET INTEL (BOSS PANEL) */}
               <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] relative overflow-hidden">
                  <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2 relative z-10"><Skull className="text-[#E15162]"/> Target Intel: {selectedLocation.boss}</h3>
                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      {/* Boss Portrait */}
                      <div className="w-full md:w-1/3 shrink-0">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 relative shadow-lg group">
                              <img src={selectedLocation.bossImg} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 backdrop-blur-sm">
                                  <p className="text-xs font-medium leading-tight">{selectedLocation.bossDesc}</p>
                              </div>
                          </div>
                      </div>

                      {/* Loot Grid (4 Items) */}
                      <div className="flex-1">
                          <p className="text-xs font-black uppercase opacity-50 mb-3 border-b border-white/10 pb-1">Known Loot Table</p>
                          <div className="grid grid-cols-2 gap-3">
                              {/* 4 slots siempre */}
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
                                                      <p className="text-[10px] opacity-50 truncate">Drop: {loot.dropRate}</p>
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

               {/* 3. SQUAD SELECTION */}
               <div className="bg-[#EDEDD9] p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-black uppercase flex items-center gap-2"><Sword/> 2. Assemble Squad</h3>
                     <span className="bg-[#1D1D1D] text-white px-3 py-1 rounded-full text-xs font-bold">{selectedMingles.length}/10</span>
                  </div>

                  {/* MINGLES GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                      {mingles.map((mingle) => {
                          const isSelected = selectedMingles.includes(mingle.id!);
                          const stats = getWormStats(mingle.type);
                          
                          // Colores por rareza
                          const rarityColor = 
                             stats.rarity === 'Godlike' ? 'text-yellow-500' :
                             stats.rarity === 'Legendary' ? 'text-orange-500' :
                             stats.rarity === 'Epic' ? 'text-purple-600' :
                             stats.rarity === 'Rare' ? 'text-blue-600' :
                             stats.rarity === 'Uncommon' ? 'text-green-600' : 'text-[#1D1D1D]';

                          return (
                              <div 
                                  key={mingle.id} 
                                  onClick={() => toggleMingle(mingle.id!)}
                                  className={`flex items-center gap-3 p-3 rounded-xl border-4 cursor-pointer transition-all ${isSelected ? 'bg-[#1D1D1D] border-[#1D1D1D] text-white' : 'bg-white border-[#1D1D1D]/20 hover:border-[#1D1D1D]'}`}
                              >
                                  <img src={mingle.image} className="w-10 h-10 rounded-lg bg-gray-200 object-cover border border-white/20 shrink-0" />
                                  <div className="flex-1 overflow-hidden">
                                      <div className="flex justify-between">
                                          <p className="text-[10px] font-black uppercase opacity-60 truncate">{mingle.name}</p>
                                          {isSelected && <CheckCircle2 size={14} className="text-[#E15162] shrink-0" />}
                                      </div>
                                      {/* TRAIT VISUAL */}
                                      <div className="flex items-center gap-1">
                                         <p className={`text-xs font-black uppercase leading-tight ${isSelected ? 'text-[#E15162]' : rarityColor}`}>
                                            +{stats.passiveVal}% {stats.passiveType}
                                         </p>
                                         <span className="text-[9px] opacity-50 uppercase">({stats.rarity})</span>
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  {/* BACKPACK SECTION (6 SLOTS FIXED - ROUNDED SQUARES) */}
                  <div className="bg-white/50 p-4 rounded-xl border-2 border-[#1D1D1D]/10">
                      <h4 className="text-sm font-black uppercase flex items-center gap-2 mb-3"><Backpack size={16}/> Supplies ({selectedItems.length}/3)</h4>
                      
                      <div className="grid grid-cols-6 gap-3">
                          {[0, 1, 2, 3, 4, 5].map((index) => {
                              const invItem = inventory[index];
                              const isSelected = invItem ? selectedItems.includes(invItem.item_id) : false;

                              return (
                                  <div 
                                      key={index}
                                      onClick={() => invItem && toggleItem(invItem.item_id)}
                                      className={`
                                          aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all overflow-hidden
                                          ${invItem 
                                              ? 'bg-white cursor-pointer hover:scale-105 border-[#1D1D1D]' 
                                              : 'bg-black/5 border-dashed border-[#1D1D1D]/20'
                                          }
                                          ${isSelected ? 'ring-4 ring-[#E15162] ring-opacity-50' : ''}
                                      `}
                                  >
                                      {invItem ? (
                                          <>
                                              {/* Aquí asumimos que tienes imagenes guardadas como item_id.png */}
                                              {/* Si no tienes sistema de imagen de item, usa un icono */}
                                              <img 
                                                src={`/images/items/${invItem.item_id}.png`} 
                                                onError={(e) => e.currentTarget.src = '/images/items/question.png'}
                                                className="w-full h-full object-cover"
                                              />
                                              <div className="absolute top-1 right-1 bg-[#1D1D1D] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">x{invItem.quantity}</div>
                                          </>
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center opacity-10">
                                              <div className="w-2 h-2 rounded-full bg-[#1D1D1D]"/>
                                          </div>
                                      )}
                                  </div>
                              )
                          })}
                      </div>
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: LIVE STATS */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#EDEDD9] sticky top-4">
                  <h3 className="text-2xl font-black uppercase mb-6 border-b border-white/20 pb-4">Mission Intel</h3>
                  
                  {/* Estimated Yield */}
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

                  {/* Accumulated Stats */}
                  <div className="space-y-4 mb-8">
                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase">Boss Kill Chance</span>
                            <span className="text-[10px] opacity-50">Squad Power</span>
                        </div>
                        <span className={`font-black ${stats.bossChance > 80 ? 'text-green-400' : 'text-orange-400'}`}>{stats.bossChance}%</span>
                     </div>

                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase">Loot Drop Chance</span>
                            <span className="text-[10px] opacity-50">Passive Bonus</span>
                        </div>
                        <span className="font-black text-[#E15162]">+{stats.lootBonus}%</span>
                     </div>

                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase">Passive Yield</span>
                            <span className="text-[10px] opacity-50">Squad Bonus</span>
                        </div>
                        <span className="font-black text-blue-400">+{stats.yieldBonus}%</span>
                     </div>
                  </div>

                  <button 
                     onClick={startRaid}
                     disabled={selectedMingles.length === 0 || isProcessing}
                     className="w-full bg-[#E15162] text-white py-4 rounded-xl font-black uppercase text-xl hover:bg-white hover:text-[#1D1D1D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                     {isProcessing ? <Loader2 className="animate-spin"/> : <>Start Raid <Sword fill="currentColor" size={20}/></>}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- VISTA 3: ACTIVE (TIMER) --- */}
      {(view === 'active' || view === 'verifying') && activeSession && (
         <div className="max-w-2xl mx-auto text-center py-20">
            <div className="bg-white rounded-[3rem] border-4 border-[#1D1D1D] p-10 shadow-[12px_12px_0_0_#1D1D1D] relative overflow-hidden">
               <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.png')]"></div>
               {view === 'verifying' ? (
                  <div className="animate-pulse flex flex-col items-center">
                     <Loader2 size={64} className="text-[#E15162] animate-spin mb-4" />
                     <h2 className="text-3xl font-black uppercase">Verifying Loot...</h2>
                  </div>
               ) : timeRemaining === 0 ? (
                  <div className="space-y-6">
                     <CheckCircle2 size={80} className="text-green-500 mx-auto" />
                     <div>
                        <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">Mission Complete</h2>
                        <p className="text-lg font-bold opacity-60">Your squad has returned.</p>
                     </div>
                     <button onClick={finalizeRaid} disabled={isProcessing} className="w-full bg-[#1D1D1D] text-white py-4 rounded-2xl font-black uppercase text-xl shadow-[4px_4px_0_0_#E15162] hover:translate-y-[-2px] transition-transform">
                        {isProcessing ? "Processing..." : "Claim Rewards"}
                     </button>
                  </div>
               ) : (
                  <div>
                     <div className="inline-block bg-[#EDEDD9] px-4 py-1 rounded-full border-2 border-[#1D1D1D] text-xs font-black uppercase mb-6">
                        In Progress • {activeSession.location?.name}
                     </div>
                     <Clock size={64} className="mx-auto text-[#1D1D1D] mb-4 animate-pulse" />
                     <p className="text-6xl md:text-8xl font-black font-mono text-[#1D1D1D] tracking-tighter">
                        {formatTime(timeRemaining || 0)}
                     </p>
                     <p className="text-sm font-bold opacity-40 mt-4 uppercase tracking-widest">Time Remaining</p>
                     
                     {/* BOTÓN CANCELAR RAID */}
                     <div className="mt-8 border-t-2 border-[#1D1D1D]/10 pt-6">
                        <button 
                           onClick={cancelRaid}
                           disabled={isProcessing}
                           className="text-red-500 font-bold uppercase text-xs hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
                        >
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
         <div className="max-w-md mx-auto bg-white rounded-[3rem] border-4 border-[#1D1D1D] overflow-hidden text-center shadow-[12px_12px_0_0_#1D1D1D]">
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
                     <p className="text-xl font-bold flex items-center justify-center gap-2">
                        <span>{raidResult.bossLootFound.name}</span>
                     </p>
                  </div>
               )}
               <button onClick={() => { setRaidResult(null); setView('list'); }} className="w-full bg-[#1D1D1D] text-white py-3 rounded-xl font-black uppercase">
                  Return to Base
               </button>
            </div>
         </div>
      )}
    </div>
  );
}