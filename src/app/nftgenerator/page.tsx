"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Download, Loader2, X, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import html2canvas from 'html2canvas';

// @Carlos: IMPORTA TU JSON LIMPIO AQUÍ
import realMetadata from '@/components/engine/mingles-metadata-clean.json';
import { supabase } from '@/components/engine/supabase';

// ==========================================
// 🔴 CARLOS: LLENA ESTA VARIABLE CON TU URL
// Ejemplo: "https://abcdefghijk.supabase.co"
const SUPABASE_PROJECT_URL = "https://zifpnidxmvofiqqbekhe.supabase.co";
// ==========================================

// LOS 10 LEGENDARIOS QUE DEBEN SER IGNORADOS
const EXCLUDED_1_OF_1_IDS = new Set([698, 4245, 4927, 4163, 3154, 4355, 4288, 1172, 4175, 5453]);

type TraitFamily = 'BG' | 'Fur' | 'Face' | 'Tequila Worm' | 'Bottle' | 'Cap';

interface NFTMetadata {
  edition: number;
  attributes: { trait_type: string; value: string }[];
}

// Orden estricto de capas (Z-Index)
const zIndexMap: Record<string, number> = {
  'BG': 0, 'Fur': 10, 'Face': 20, 'Tequila Worm': 30, 'Bottle': 40, 'Cap': 50
};

// Quitamos los legendarios desde el principio
const baseMetadata: NFTMetadata[] = (realMetadata as NFTMetadata[]).filter(
  nft => !EXCLUDED_1_OF_1_IDS.has(nft.edition)
);

export default function NFTGeneratorAdmin() {
  const [activeTab, setActiveTab] = useState<'mapper' | 'preview'>('preview');
  
  // Estados Generales
  const [selectedFamily, setSelectedFamily] = useState<string>('Cap');
  const [newNamesMapping, setNewNamesMapping] = useState<Record<string, Record<string, string>>>({});
  
  // @Carlos: Este estado se debe llenar consultando tu base de datos (Storage)
  const [uploadedTraits, setUploadedTraits] = useState<Record<string, Set<string>>>({
    'Cap': new Set(['Sombrero']), 'Face': new Set(['Happy']) // Mocks para que no se vea vacío
  });

  // Estados de Vista de Resultados
  const [visibleCount, setVisibleCount] = useState(50);
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  // --- NUEVO ESTADO: MULTI-FILTROS ESTILO OPENSEA ---
  // Guardamos qué traits están seleccionados por familia: { 'Cap': ['Sombrero', 'Beanie'], 'Fur': ['Brown'] }
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // 1. Extraer Traits Únicos automáticamente
  const uniqueTraitsByFamily = useMemo(() => {
    const traits: Record<string, Set<string>> = { 'BG': new Set(), 'Fur': new Set(), 'Face': new Set(), 'Tequila Worm': new Set(), 'Bottle': new Set(), 'Cap': new Set() };
    baseMetadata.forEach(nft => nft.attributes.forEach(attr => { if (traits[attr.trait_type]) traits[attr.trait_type].add(attr.value); }));
    return Object.keys(traits).reduce((acc, key) => { acc[key] = Array.from(traits[key]).sort(); return acc; }, {} as Record<string, string[]>);
  }, []);

  // Función para Activar/Desactivar un Filtro Individual
  const toggleFilter = (family: string, traitValue: string) => {
    setActiveFilters(prev => {
      const familyFilters = prev[family] || [];
      const isSelected = familyFilters.includes(traitValue);
      
      return {
        ...prev,
        [family]: isSelected 
          ? familyFilters.filter(t => t !== traitValue) // Lo quitamos
          : [...familyFilters, traitValue] // Lo agregamos
      };
    });
  };

  // 2. PIPELINE DE DATOS: Multi-Filtro Avanzado
  const filteredAndSortedNFTs = useMemo(() => {
    let result = [...baseMetadata].sort((a, b) => a.edition - b.edition);

    // Revisamos qué familias tienen al menos un filtro activo
    const familiesWithActiveFilters = Object.keys(activeFilters).filter(family => activeFilters[family].length > 0);

    if (familiesWithActiveFilters.length > 0) {
      result = result.filter(nft => {
        // El NFT debe cumplir con AL MENOS UNO de los traits seleccionados EN CADA familia activa.
        // (Lógica estándar de OpenSea/Blur)
        return familiesWithActiveFilters.every(family => {
          const nftTraitValue = nft.attributes.find(attr => attr.trait_type === family)?.value;
          return nftTraitValue && activeFilters[family].includes(nftTraitValue);
        });
      });
    }

    return result;
  }, [activeFilters]);

  // 3. Reset de paginación al cambiar filtro
  useEffect(() => {
    setVisibleCount(50);
    setInspectIndex(null);
  }, [activeFilters]);

  // --- MÉTODOS DE ACCIÓN (SUBIDA Y DESCARGA) ---
  const handleAutoConnectUpload = async (family: string, originalValue: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    console.log(file)
    const targetStoragePath = `${family}/${originalValue}.png`;
    console.log(targetStoragePath)
    // @Carlos: 
    try {
        const uploadFile = await supabase.storage.from('traits').upload(targetStoragePath, file, {upsert: true})
        console.log(uploadFile)
    } catch (e) {
        console.log(e)
    }
        
    setUploadedTraits(prev => {
      const updated = { ...prev };
      if (!updated[family]) updated[family] = new Set();
      updated[family].add(originalValue);
      return updated;
    });
  };

  const handleDownloadSnapshot = async (editionId: number, elementId: string) => {
    setDownloadingId(editionId);
    try {
      const element = document.getElementById(elementId);
      if (!element) return;
      const canvas = await html2canvas(element, { useCORS: true, allowTaint: false, backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `mingle-${editionId}.png`;
      link.click();
    } catch (error) { console.error("Error snapshot:", error); } 
    finally { setDownloadingId(null); }
  };

  // --- MOTOR DE COMPOSICIÓN (IMÁGENES REALES) ---
  const renderLayers = (nft: NFTMetadata) => {
    return nft.attributes.map(attr => {
      // @Carlos: Si false, el trait no se dibuja (fallo silencioso)
      const isUploaded = uploadedTraits[attr.trait_type]?.has(attr.value);
      if (!isUploaded) return null; 

      // 🔴 AQUÍ YA ESTÁ LA IMAGEN REAL DE SUPABASE. No más cuadros verdes.
      const imageUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/traits/${attr.trait_type}/${encodeURIComponent(attr.value)}.png`;

      return (
        <img 
          key={attr.trait_type} 
          src={imageUrl} 
          crossOrigin="anonymous" 
          style={{ zIndex: zIndexMap[attr.trait_type] }} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt={attr.value}
          onError={(e) => {
             // Si la imagen falla en cargar (URL rota o no existe), la oculta para no mostrar icono roto.
             (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans pb-20 antialiased selection:bg-lime-400 selection:text-black">
      
      {/* HEADER */}
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

      {/* --- PESTAÑA 1: TRAIT STUDIO (Mantenida exactamente igual) --- */}
      {activeTab === 'mapper' && (
         <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 animate-in fade-in duration-300">
           {/* ... (Todo el código del Mapper Studio que ya tenías) ... */}
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div><h2 className="text-xl font-bold text-white">Vinculación Automática</h2></div>
              <select value={selectedFamily} onChange={(e) => setSelectedFamily(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-lime-400 focus:outline-none focus:border-lime-400 w-full sm:w-56">
                {Object.keys(uniqueTraitsByFamily).map(f => <option key={f} value={f}>FAMILIA: {f}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueTraitsByFamily[selectedFamily].map((originalValue) => {
                const isUploaded = uploadedTraits[selectedFamily]?.has(originalValue);
                const isDragging = draggingOver === originalValue;
                const customName = newNamesMapping[selectedFamily]?.[originalValue] || '';

                return (
                  <div key={originalValue} className={`relative bg-zinc-900/60 border rounded-2xl p-5 transition-all duration-300 flex flex-col gap-4 ${isDragging ? 'border-lime-400 bg-lime-400/5' : 'border-white/5'}`} onDragOver={(e) => { e.preventDefault(); setDraggingOver(originalValue); }} onDragLeave={() => setDraggingOver(null)} onDrop={(e) => { e.preventDefault(); setDraggingOver(null); handleAutoConnectUpload(selectedFamily, originalValue, e.dataTransfer.files); }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-gray-400">Original: <strong className="text-white font-sans text-sm">{originalValue}</strong></span>
                      {isUploaded && <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><CheckCircle2 size={10} /> LISTO</div>}
                    </div>
                    <div className="space-y-1">
                      <input type="text" value={customName} placeholder="Nuevo Nombre en UI (Opcional)" onChange={(e) => setNewNamesMapping(prev => ({ ...prev, [selectedFamily]: { ...prev[selectedFamily], [originalValue]: e.target.value } }))} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-lime-400 focus:outline-none focus:border-lime-400" />
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
         </main>
      )}

      {/* --- PESTAÑA 2: ASSEMBLE LAB (CON SIDEBAR DE FILTROS TIPO OPENSEA) --- */}
      {activeTab === 'preview' && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-8 flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
          
          {/* SIDEBAR DE FILTROS (Izquierda) */}
          <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
            <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5 sticky top-24">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between">
                Filtros
                <span className="text-[10px] bg-lime-400 text-black px-2 py-0.5 rounded-full">{filteredAndSortedNFTs.length} Resultados</span>
              </h3>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar pr-2">
                {Object.entries(uniqueTraitsByFamily).map(([family, traits]) => (
                  <div key={family} className="border-b border-white/5 pb-4 last:border-0">
                    <h4 className="text-xs font-mono text-lime-400 mb-3">{family}</h4>
                    <div className="space-y-2">
                      {traits.map(trait => {
                        const isSelected = activeFilters[family]?.includes(trait);
                        return (
                          <button 
                            key={trait} 
                            onClick={() => toggleFilter(family, trait)}
                            className="w-full flex items-center gap-3 text-left group"
                          >
                            <div className="text-zinc-500 group-hover:text-lime-400 transition-colors">
                              {isSelected ? <CheckSquare size={16} className="text-lime-400" /> : <Square size={16} />}
                            </div>
                            <span className={`text-xs ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                              {trait}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ÁREA PRINCIPAL (Grid a la derecha) */}
          <main className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedNFTs.slice(0, visibleCount).map((nft, index) => (
                <div 
                  key={nft.edition} 
                  onClick={() => setInspectIndex(index)}
                  className="group relative aspect-square bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-lime-400/50 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                >
                  <div id={`mingle-grid-render-${nft.edition}`} className="absolute inset-0">
                    {renderLayers(nft)}
                  </div>
                  <div className="absolute inset-0 z-[60] bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <h4 className="text-sm font-bold text-lime-400 font-mono">#{nft.edition}</h4>
                    <p className="text-[10px] text-gray-400">Clic para inspeccionar</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {visibleCount < filteredAndSortedNFTs.length && (
              <div className="flex justify-center mt-12 pb-8">
                <button onClick={() => setVisibleCount(prev => prev + 50)} className="bg-zinc-900 border border-white/10 hover:border-lime-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-all active:scale-95 shadow-lg">
                  Cargar 50 más <span className="text-xs text-gray-500 font-mono">({filteredAndSortedNFTs.length - visibleCount} restantes)</span>
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {/* --- MODO INSPECCIÓN GIGANTE (Mantenido igual) --- */}
      {inspectIndex !== null && filteredAndSortedNFTs[inspectIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/5">
            <h3 className="text-xl font-bold font-mono text-white">Mingle <span className="text-lime-400">#{filteredAndSortedNFTs[inspectIndex].edition}</span></h3>
            <button onClick={() => setInspectIndex(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} className="text-white" /></button>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8">
              <button onClick={() => setInspectIndex(inspectIndex - 1)} disabled={inspectIndex === 0} className="absolute left-4 z-50 p-3 bg-black/50 rounded-full border border-white/10 hover:border-lime-400 disabled:opacity-30 transition-all text-white"><ChevronLeft size={24} /></button>
              <div id={`mingle-modal-render-${filteredAndSortedNFTs[inspectIndex].edition}`} className="relative w-full max-w-md aspect-square bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
                {renderLayers(filteredAndSortedNFTs[inspectIndex])}
              </div>
              <button onClick={() => setInspectIndex(inspectIndex + 1)} disabled={inspectIndex === filteredAndSortedNFTs.length - 1} className="absolute right-4 z-50 p-3 bg-black/50 rounded-full border border-white/10 hover:border-lime-400 disabled:opacity-30 transition-all text-white"><ChevronRight size={24} /></button>
            </div>
            {/* ... Panel Lateral (Igual) ... */}
            <div className="w-full lg:w-96 bg-zinc-950 border-l border-white/5 p-6 overflow-y-auto">
               <button onClick={() => handleDownloadSnapshot(filteredAndSortedNFTs[inspectIndex].edition, `mingle-modal-render-${filteredAndSortedNFTs[inspectIndex].edition}`)} disabled={downloadingId === filteredAndSortedNFTs[inspectIndex].edition} className="w-full mb-8 bg-lime-400 hover:bg-lime-300 disabled:bg-lime-400/50 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {downloadingId === filteredAndSortedNFTs[inspectIndex].edition ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Descargar High-Res
              </button>
               {/* Resumen de traits para el modal */}
               <h4 className="text-xs uppercase text-gray-500 font-bold mb-4">Anatomía</h4>
               <div className="space-y-3">
                 {filteredAndSortedNFTs[inspectIndex].attributes.map((attr, idx) => {
                    const originalVal = attr.value;
                    const isUploaded = uploadedTraits[attr.trait_type]?.has(originalVal);
                    return (
                      <div key={idx} className="bg-zinc-900/50 border border-white/5 p-3 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{attr.trait_type}</span>
                          {!isUploaded && <span className="text-[9px] text-red-400 font-medium px-2 py-0.5 rounded border border-red-400/20 bg-red-400/5">FALTA PNG</span>}
                        </div>
                        <span className={isUploaded ? 'text-sm text-zinc-200' : 'text-sm text-zinc-600 line-through'}>{originalVal}</span>
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
