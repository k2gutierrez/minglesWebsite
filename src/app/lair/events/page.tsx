'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/components/engine/supabase'; // Ajusta la ruta si es necesario
import { X, MapPin, Calendar, Loader2, PlayCircle, ArrowLeft } from 'lucide-react';

// Helper para extraer el ID de YouTube de varios formatos de link
const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para Modales (Cero navegación profunda)
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Para hacer zoom a fotos

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            // Solo traemos los publicados. Ordenamos por sort_order y luego por los más recientes.
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_published', true)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (!error && data) {
                setEvents(data);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, []);

    // Separamos la lógica de eventos pasados y futuros
    const pastEvents = events.filter(e => e.status === 'past');
    const futureEvents = events.filter(e => e.status === 'coming_soon');

    if (isLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-[#E15162]" size={48} /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 relative">
            
            {/* ENCABEZADO Y CTA SECUNDARIO */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-[#1D1D1D] pb-6 gap-6">
                <div>
                    {/* A. Section Title */}
                    <h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Events</h1>
                    {/* B. Optional short intro text */}
                    <p className="font-bold text-[#1D1D1D]/60">Explore past activations and see what is coming next.</p>
                </div>
                
                {/* C. Small secondary CTA for future events */}
                {futureEvents.length > 0 && (
                    <button 
                        onClick={() => setShowComingSoon(true)}
                        className="bg-[#1D1D1D] text-white px-6 py-3 rounded-full font-black uppercase text-sm hover:bg-[#E15162] transition-colors flex items-center gap-2 shrink-0"
                    >
                        <Calendar size={18} /> Coming Soon
                    </button>
                )}
            </div>

            {/* D. Main grid of past event cards (Dominant content block) */}
            <section>
                {pastEvents.length === 0 ? (
                    // Empty State Logic
                    <div className="bg-white p-12 rounded-[2rem] border-4 border-[#1D1D1D] border-dashed text-center opacity-50">
                        <Calendar className="mx-auto mb-4 opacity-20" size={48} />
                        <p className="font-bold uppercase text-lg">Event moments will appear here soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastEvents.map((event) => (
                            <motion.div 
                                key={event.id} 
                                whileHover={{ scale: 1.02 }} 
                                onClick={() => setSelectedEvent(event)} 
                                className="bg-white rounded-[2rem] overflow-hidden border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D] cursor-pointer flex flex-col h-full group"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-200 border-b-4 border-[#1D1D1D]">
                                    {event.cover_image ? (
                                        <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10"><PlayCircle size={64}/></div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-2xl font-black uppercase leading-tight mb-2 text-[#1D1D1D]">{event.title}</h3>
                                    
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                        {event.event_date_optional && (
                                            <span className="text-[10px] font-bold uppercase text-[#E15162] flex items-center gap-1"><Calendar size={12}/> {new Date(event.event_date_optional).toLocaleDateString()}</span>
                                        )}
                                        {(event.city_optional || event.venue_optional) && (
                                            <span className="text-[10px] font-bold uppercase opacity-60 flex items-center gap-1"><MapPin size={12}/> {event.city_optional} {event.venue_optional && `- ${event.venue_optional}`}</span>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm font-bold opacity-70 line-clamp-3">{event.short_description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* ========================================== */}
            {/* EVENT DETAIL MODAL (Overlay)               */}
            {/* ========================================== */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-[#EDEDD9] rounded-[2rem] max-w-4xl w-full border-4 border-[#1D1D1D] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-full"
                        >
                            {/* Sticky Header */}
                            <div className="bg-[#1D1D1D] p-4 flex justify-between items-center text-white sticky top-0 z-10">
                                <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-xs font-black uppercase hover:text-[#E15162] transition-colors"><ArrowLeft size={16}/> Back to Events</button>
                                <button onClick={() => setSelectedEvent(null)} className="bg-white/10 hover:bg-[#E15162] p-1.5 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar p-6 space-y-8">
                                
                                {/* 1. Hero / Cover Image */}
                                {selectedEvent.cover_image && (
                                    <div className="w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden border-4 border-[#1D1D1D] bg-white">
                                        <img src={selectedEvent.cover_image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* 2, 3, 4, 5. Info & Descriptions */}
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-4">{selectedEvent.title}</h2>
                                    
                                    <div className="flex flex-wrap gap-4 mb-6">
                                        {selectedEvent.event_date_optional && (
                                            <span className="bg-white border-2 border-[#1D1D1D] px-3 py-1.5 rounded-lg text-xs font-black uppercase text-[#E15162] flex items-center gap-2"><Calendar size={14}/> {new Date(selectedEvent.event_date_optional).toLocaleDateString()}</span>
                                        )}
                                        {(selectedEvent.city_optional || selectedEvent.venue_optional) && (
                                            <span className="bg-white border-2 border-[#1D1D1D] px-3 py-1.5 rounded-lg text-xs font-black uppercase opacity-80 flex items-center gap-2"><MapPin size={14}/> {selectedEvent.venue_optional} {selectedEvent.city_optional && `(${selectedEvent.city_optional})`}</span>
                                        )}
                                    </div>

                                    {selectedEvent.long_description && (
                                        <div className="prose prose-sm md:prose-base font-bold text-[#1D1D1D]/80 max-w-none whitespace-pre-wrap bg-white p-6 rounded-2xl border-2 border-[#1D1D1D]/10">
                                            {selectedEvent.long_description}
                                        </div>
                                    )}
                                </div>

                                {/* 6. Image Gallery */}
                                {selectedEvent.gallery_images && selectedEvent.gallery_images.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-black uppercase border-b-2 border-[#1D1D1D]/10 pb-2 mb-4 text-[#1D1D1D]">Gallery</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {selectedEvent.gallery_images.map((img: string, idx: number) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => setSelectedImage(img)}
                                                    className="aspect-square rounded-xl overflow-hidden border-2 border-[#1D1D1D] cursor-pointer hover:scale-105 transition-transform bg-white"
                                                >
                                                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 7. Embedded YouTube Videos */}
                                {selectedEvent.youtube_links && selectedEvent.youtube_links.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-black uppercase border-b-2 border-[#1D1D1D]/10 pb-2 mb-4 text-[#1D1D1D]">Videos</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedEvent.youtube_links.map((link: string, idx: number) => {
                                                const videoId = getYouTubeId(link);
                                                if (!videoId) return null;
                                                return (
                                                    <div key={idx} className="aspect-video w-full rounded-xl overflow-hidden border-4 border-[#1D1D1D] bg-black">
                                                        <iframe 
                                                            src={`https://www.youtube.com/embed/${videoId}`} 
                                                            title="YouTube video player" 
                                                            frameBorder="0" 
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                            allowFullScreen
                                                            className="w-full h-full"
                                                        ></iframe>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LIGHTBOX PARA ZOOM DE FOTOS DE LA GALERÍA */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
                        <button className="absolute top-6 right-6 text-white hover:text-[#E15162]"><X size={32} /></button>
                        <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================== */}
            {/* COMING SOON MODAL (Lightweight Overlay)    */}
            {/* ========================================== */}
            <AnimatePresence>
                {showComingSoon && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-md h-full border-l-4 border-[#1D1D1D] shadow-2xl flex flex-col"
                        >
                            <div className="bg-[#1D1D1D] p-6 text-white flex justify-between items-center">
                                <h2 className="text-2xl font-black uppercase flex items-center gap-2"><Calendar /> Coming Soon</h2>
                                <button onClick={() => setShowComingSoon(false)} className="hover:text-[#E15162]"><X size={24} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 bg-[#EDEDD9]">
                                <div className="space-y-4">
                                    {futureEvents.map((event) => (
                                        <div key={event.id} className="bg-white p-4 rounded-2xl border-2 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D]">
                                            <h3 className="text-lg font-black uppercase leading-tight mb-2 text-[#E15162]">{event.title}</h3>
                                            {(event.city_optional || event.event_date_optional) && (
                                                <p className="text-xs font-bold opacity-60 flex items-center gap-1 mb-2">
                                                    <MapPin size={12} /> {event.city_optional || "Location TBA"} {event.event_date_optional && `• ${new Date(event.event_date_optional).toLocaleDateString()}`}
                                                </p>
                                            )}
                                            <p className="text-sm font-bold opacity-80">{event.short_description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
        </div>
    );
}