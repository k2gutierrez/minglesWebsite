"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Download, Loader2, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';

// --- CONFIGURACIÓN Y TIPOS ---
type TraitFamily = 'BG' | 'Fur' | 'Face' | 'Tequila Worm' | 'Bottle' | 'Cap';

interface NFTMetadata {
  edition: number;
  attributes: { trait_type: string; value: string }[];
}

// @Carlos: Este es el orden ESTRICTO de renderizado (Z-Index) de atrás hacia adelante.
const zIndexMap: Record<string, number> = {
  'BG': 0, 'Fur': 10, 'Face': 20, 'Tequila Worm': 30, 'Bottle': 40, 'Cap': 50
};

// @Carlos: Reemplazar por la lectura real de tu JSON de la colección.
const mockMetadata: NFTMetadata[] = Array.from({ length: 5555 }).map((_, i) => ({
  edition: i + 1,
  attributes: [
    { trait_type: 'BG', value: i % 2 === 0 ? 'Blue' : 'Red' },
    { trait_type: 'Fur', value: i % 3 === 0 ? 'Leopard' : 'Standard' },
    { trait_type: 'Face', value: i % 2 === 0 ? 'Happy' : 'Zombie' },
    { trait_type: 'Tequila Worm', value: 'None' },
    { trait_type: 'Bottle', value: 'Classic' },
    { trait_type: 'Cap', value: i % 2 === 0 ? 'Sombrero' : 'Beanie' },
  ],
}));

export default function NFTGeneratorAdmin() {
  const [activeTab, setActiveTab] = useState<'mapper' | 'preview'>('mapper');
  
  // Estados de Configuración y Mapeo
  const [selectedFamily, setSelectedFamily] = useState<string>('Cap');
  const [newNamesMapping, setNewNamesMapping] = useState<Record<string, Record<string, string>>>({});
  
  // @Carlos: ESTADO CRÍTICO. Aquí registramos qué traits YA se subieron a Supabase. 
  // (Llénalo en un useEffect consultando el bucket de Supabase).
  const [uploadedTraits, setUploadedTraits] = useState<Record<string, Set<string>>>({
    'Cap': new Set(['Sombrero']), 'Face': new Set(['Happy']) // Mock data
  });

  // Estados de Visualización y Navegación
  const [visibleCount, setVisibleCount] = useState(50); // Paginación de 50 en 50
  const [inspectIndex, setInspectIndex] = useState<number | null>(null); // Index para Modal
  const [activeFilter, setActiveFilter] = useState<{ family: string, value: string } | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  // 1. Extraer Traits Únicos automáticamente del JSON
  const uniqueTraitsByFamily = useMemo(() => {
    const traits: Record<string, Set<string>> = {
      'BG': new Set(), 'Fur': new Set(), 'Face': new Set(), 'Tequila Worm': new Set(), 'Bottle': new Set(), 'Cap': new Set()
    };
    mockMetadata.forEach(nft => nft.attributes.forEach(attr => { if (traits[attr.trait_type]) traits[attr.trait_type].add(attr.value); }));
    return Object.keys(traits).reduce((acc, key) => { acc[key] = Array.from(traits[key]); return acc; }, {} as Record<string, string[]>);
  }, []);

  // 2. PIPELINE DE DATOS: Orden estricto (1-5555) y Filtrado
  const filteredAndSortedNFTs = useMemo(() => {
    let result = [...mockMetadata].sort((a, b) => a.edition - b.edition);
    if (activeFilter) {
      result = result.filter(nft => nft.attributes.some(attr => attr.trait_type === activeFilter.family && attr.value === activeFilter.value));
    }
    return result;
  }, [activeFilter]);

  // 3. Reset de paginación al cambiar filtro
  useEffect(() => {
    setVisibleCount(50);
    setInspectIndex(null);
  }, [activeFilter]);

  // --- MÉTODOS DE ACCIÓN ---

  // @Carlos: Lógica de subida. Aquí conectas Supabase Storage.
  const handleAutoConnectUpload = async (family: string, originalValue: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const targetStoragePath = `${family}/${originalValue}.png`;
    
    // REEMPLAZAR CON: await supabase.storage.from('traits').upload(targetStoragePath, file, { upsert: true });
    console.log(`Subiendo ${file.name} forzado como -> ${targetStoragePath}`);
    
    setUploadedTraits(prev => {
      const updated = { ...prev };
      if (!updated[family]) updated[family] = new Set();
      updated[family].add(originalValue);
      return updated;
    });
  };

  // Descarga de Canvas (Requiere CORS en Supabase)
  const handleDownloadSnapshot = async (editionId: number, elementId: string) => {
    setDownloadingId(editionId);
    try {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: 2 
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `mingle-${editionId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al generar snapshot:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Navegación del Modal
  const handlePrevMingle = () => { if (inspectIndex !== null && inspectIndex > 0) setInspectIndex(inspectIndex - 1); };
  const handleNextMingle = () => { if (inspectIndex !== null && inspectIndex < filteredAndSortedNFTs.length - 1) setInspectIndex(inspectIndex + 1); };

  // --- MOTOR DE COMPOSICIÓN (RENDERIZADOR DE CAPAS) ---
  const renderLayers = (nft: NFTMetadata) => {
    return nft.attributes.map(attr => {
      const isUploaded = uploadedTraits[attr.trait_type]?.has(attr.value);
      if (!isUploaded) return null; // Fallo silencioso: Si no hay PNG, no lo dibuja.

      // @Carlos: Reemplazar el div por: 
      // <img src={`https://TU_PROYECTO.supabase.co/storage/v1/object/public/traits/${attr.trait_type}/${attr.value}.png`} crossOrigin="anonymous" style={{ zIndex: zIndexMap[attr.trait_type] }} className="absolute inset-0 w-full h-full object-cover" />
      return (
        <div key={attr.trait_type} style={{ zIndex: zIndexMap[attr.trait_type] }} className="absolute inset-0 flex items-center justify-center bg-lime-400/5 border border-dashed border-lime-400/20 backdrop-blur-[1px]">
          <span className="bg-black/60 px-2 py-1 rounded text-[10px] text-lime-400 font-mono uppercase">{attr.value}</span>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans pb-20 antialiased selection:bg-lime-400 selection:text-black">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">Mingles Lab</h1>
          <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">NFT Image Re-Engineering</p>
        </div>
        <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-full">
          <button onClick={() => setActiveTab('mapper')} className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'mapper' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-gray-400 hover:text-white'}`}>1. Trait Studio</button>
          <button onClick={() => setActiveTab('preview')} className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'preview' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-gray-400 hover:text-white'}`}>2. Assemble Lab</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10">
        
        {/* --- PESTAÑA 1: TRAIT STUDIO (UPLOAD) --- */}
        {activeTab === 'mapper' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Vinculación Automática</h2>
                <p className="text-xs text-gray-400 mt-1">Sube los nuevos PNGs. El sistema forzará el nombre original para no romper la base de datos.</p>
              </div>
              <div className="relative">
                <select 
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-lime-400 focus:outline-none focus:border-lime-400 appearance-none pr-10 cursor-pointer w-full sm:w-56"
                >
                  {Object.keys(uniqueTraitsByFamily).map(f => <option key={f} value={f}>FAMILIA: {f}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueTraitsByFamily[selectedFamily].map((originalValue) => {
                const isUploaded = uploadedTraits[selectedFamily]?.has(originalValue);
                const isDragging = draggingOver === originalValue;
                const customName = newNamesMapping[selectedFamily]?.[originalValue] || '';

                return (
                  <div 
                    key={originalValue}
                    className={`relative bg-zinc-900/60 border rounded-2xl p-5 transition-all duration-300 flex flex-col gap-4 ${isDragging ? 'border-lime-400 bg-lime-400/5 scale-[1.01]' : 'border-white/5'} ${isUploaded && !isDragging ? 'bg-gradient-to-b from-zinc-900/60 to-emerald-950/10' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDraggingOver(originalValue); }}
                    onDragLeave={() => setDraggingOver(null)}
                    onDrop={(e) => { e.preventDefault(); setDraggingOver(null); handleAutoConnectUpload(selectedFamily, originalValue, e.dataTransfer.files); }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">Original: <strong className="text-white font-sans text-sm">{originalValue}</strong></span>
                      {isUploaded && <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><CheckCircle2 size={10} /> LISTO</div>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-mono text-gray-500">Nuevo Nombre en UI (Opcional)</label>
                      <input 
                        type="text" value={customName}
                        onChange={(e) => setNewNamesMapping(prev => ({ ...prev, [selectedFamily]: { ...prev[selectedFamily], [originalValue]: e.target.value } }))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-lime-400 focus:outline-none focus:border-lime-400"
                      />
                    </div>

                    <label className="relative cursor-pointer group flex flex-col items-center justify-center border border-dashed border-zinc-700 hover:border-lime-400/50 rounded-xl py-6 transition-all bg-black/20 hover:bg-black/40">
                      <input type="file" accept="image/png" className="hidden" onChange={(e) => handleAutoConnectUpload(selectedFamily, originalValue, e.target.files)} />
                      <UploadCloud size={20} className="text-zinc-500 group-hover:text-lime-400 transition-all" />
                      <span className="text-[11px] font-medium text-zinc-400 mt-2">{isUploaded ? 'Reemplazar PNG' : 'Subir PNG'}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- PESTAÑA 2: ASSEMBLE LAB (PREVIEW) --- */}
        {activeTab === 'preview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Barra de Filtros Adhesiva */}
            <div className="bg-zinc-900/90 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-20 sm:top-24 z-40">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-lime-400/10 p-2 rounded-lg"><Filter size={18} className="text-lime-400" /></div>
                <select 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ALL') setActiveFilter(null);
                    else { const [family, value] = val.split(':::'); setActiveFilter({ family, value }); }
                  }}
                  className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 w-full sm:w-64 appearance-none"
                >
                  <option value="ALL">Todos los Mingles (5,555)</option>
                  {Object.entries(uniqueTraitsByFamily).map(([family, traits]) => (
                    <optgroup key={family} label={family} className="bg-zinc-950 text-gray-400">
                      {traits.map(trait => <option key={trait} value={`${family}:::${trait}`} className="text-white">Solo {trait}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="text-xs font-mono bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                Mostrando <span className="text-lime-400">{Math.min(visibleCount, filteredAndSortedNFTs.length)}</span> de <span className="text-white">{filteredAndSortedNFTs.length}</span>
              </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAndSortedNFTs.slice(0, visibleCount).map((nft, index) => (
                <div 
                  key={nft.edition} 
                  onClick={() => setInspectIndex(index)}
                  className="group relative aspect-square bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-lime-400/50 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Motor de capas */}
                  <div id={`mingle-grid-render-${nft.edition}`} className="absolute inset-0">
                    {renderLayers(nft)}
                  </div>

                  <div className="absolute inset-0 z-[60] bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <h4 className="text-sm font-bold text-lime-400 font-mono">#{nft.edition}</h4>
                    <p className="text-[10px] text-gray-400">Clic para inspeccionar</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {visibleCount < filteredAndSortedNFTs.length && (
              <div className="flex justify-center mt-12 pb-8">
                <button onClick={() => setVisibleCount(prev => prev + 50)} className="bg-zinc-900 border border-white/10 hover:border-lime-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-2 shadow-lg">
                  Cargar 50 más <span className="text-xs text-gray-500 font-mono">({filteredAndSortedNFTs.length - visibleCount} restantes)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- MODO INSPECCIÓN (LIGHTBOX / MODAL GIGANTE) --- */}
      {inspectIndex !== null && filteredAndSortedNFTs[inspectIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Modal */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/5">
            <h3 className="text-xl font-bold font-mono text-white">Mingle <span className="text-lime-400">#{filteredAndSortedNFTs[inspectIndex].edition}</span></h3>
            <button onClick={() => setInspectIndex(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} className="text-white" /></button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Visualizador Central */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8">
              <button onClick={handlePrevMingle} disabled={inspectIndex === 0} className="absolute left-4 z-50 p-3 bg-black/50 rounded-full border border-white/10 hover:border-lime-400 disabled:opacity-30 transition-all text-white backdrop-blur-md"><ChevronLeft size={24} /></button>

              <div id={`mingle-modal-render-${filteredAndSortedNFTs[inspectIndex].edition}`} className="relative w-full max-w-md aspect-square bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
                {renderLayers(filteredAndSortedNFTs[inspectIndex])}
              </div>

              <button onClick={handleNextMingle} disabled={inspectIndex === filteredAndSortedNFTs.length - 1} className="absolute right-4 z-50 p-3 bg-black/50 rounded-full border border-white/10 hover:border-lime-400 disabled:opacity-30 transition-all text-white backdrop-blur-md"><ChevronRight size={24} /></button>
            </div>

            {/* Panel de Atributos */}
            <div className="w-full lg:w-96 bg-zinc-950 border-l border-white/5 p-6 overflow-y-auto">
              <button 
                onClick={() => handleDownloadSnapshot(filteredAndSortedNFTs[inspectIndex].edition, `mingle-modal-render-${filteredAndSortedNFTs[inspectIndex].edition}`)}
                disabled={downloadingId === filteredAndSortedNFTs[inspectIndex].edition}
                className="w-full mb-8 bg-lime-400 hover:bg-lime-300 disabled:bg-lime-400/50 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(163,230,53,0.2)]"
              >
                {downloadingId === filteredAndSortedNFTs[inspectIndex].edition ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Descargar High-Res
              </button>

              <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Anatomía del Mingle</h4>
              
              <div className="space-y-3">
                {filteredAndSortedNFTs[inspectIndex].attributes.map((attr, idx) => {
                  const originalVal = attr.value;
                  const isUploaded = uploadedTraits[attr.trait_type]?.has(originalVal);
                  const customNewName = newNamesMapping[attr.trait_type]?.[originalVal];
                  
                  return (
                    <div key={idx} className="bg-zinc-900/50 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{attr.trait_type}</span>
                        {!isUploaded && <span className="text-[9px] text-red-400 font-medium px-2 py-0.5 rounded border border-red-400/20 bg-red-400/5">FALTA PNG</span>}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2">
                        <span className={isUploaded ? 'text-sm text-zinc-200' : 'text-sm text-zinc-600 line-through'}>{originalVal}</span>
                        {customNewName && <span className="text-sm text-lime-400 font-medium">→ {customNewName}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}