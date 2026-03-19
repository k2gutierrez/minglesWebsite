'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { Loader2, Trash2, Plus, Save, Lock, Edit } from 'lucide-react';

const TABLES = ['game_items', 'game_bosses', 'game_raids', 'mingle_traits', 'danger_zone'] as const;
type TableName = typeof TABLES[number];

export default function AdminPage() {
    const { address, isConnected } = useAccount();

    // --- SEGURIDAD ---
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // --- DATOS GLOBALES ---
    const [activeTab, setActiveTab] = useState<TableName>('game_items');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- DATOS AUXILIARES PARA MENÚS DESPLEGABLES ---
    const [allBosses, setAllBosses] = useState<any[]>([]);
    const [allItems, setAllItems] = useState<any[]>([]);

    // --- EDICIÓN Y SUBIDA ---
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isUploading, setIsUploading] = useState(false);

    // 1. VERIFICAR ADMIN AL ENTRAR
    useEffect(() => {
        const checkAdmin = async () => {
            if (!address) return;
            setIsCheckingAuth(true);

            const { data } = await supabase
                .from('admins')
                .select('*')
                .ilike('wallet_address', address) // Ignora mayúsculas/minúsculas
                .single();

            if (data) {
                setIsAdmin(true);
                fetchData(activeTab);
            } else {
                setIsAdmin(false);
            }
            setIsCheckingAuth(false);
        };

        if (isConnected) checkAdmin();
    }, [address, isConnected]);

    // 2. CARGAR DATOS DE LA TABLA Y CATÁLOGOS
    const fetchData = async (table: TableName) => {
        // --- NUEVO: Si es la Danger Zone, no busques en la base de datos ---
        if (table === 'danger_zone') {
            setData([]);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (!error && data) setData(data);
        setLoading(false);
    };

    const fetchCatalogs = async () => {
        const { data: bosses } = await supabase.from('game_bosses').select('id, name');
        const { data: items } = await supabase.from('game_items').select('id, name');
        if (bosses) setAllBosses(bosses);
        if (items) setAllItems(items);
    };

    useEffect(() => {
        if (isAdmin) {
            fetchData(activeTab);
            fetchCatalogs(); // Traer catálogos siempre para los selectores
        }
    }, [activeTab, isAdmin]);

    // 3. SUBIR IMAGEN A SUPABASE STORAGE
    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('game-assets') // ASEGÚRATE DE CREAR ESTE BUCKET COMO "PUBLIC" EN SUPABASE
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('game-assets').getPublicUrl(filePath);

            setEditForm((prev: any) => ({ ...prev, [fieldName]: data.publicUrl }));
        } catch (error: any) {
            alert('Error subiendo imagen: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // 4. GUARDAR (UPSERT) INTELIGENTE Y LIMPIO
    const handleSave = async () => {
        let payload = { ...editForm };

        // LIMPIEZA DE DATOS: Quitamos la "basura" inyectada por defecto dependiendo de la tabla
        if (activeTab === 'mingle_traits') {
            // A los traits no les importan las cosas de las raids o de los items
            delete payload.difficulty;
            delete payload.yield_config;
            delete payload.type;

            // Y aseguramos que el Type Key esté en minúsculas para evitar errores
            if (payload.type_key) payload.type_key = payload.type_key.toLowerCase();
            if (payload.passive_type) payload.passive_type = payload.passive_type.toLowerCase();
        }

        if (activeTab === 'game_items' || activeTab === 'game_bosses') {
            delete payload.difficulty;
            delete payload.yield_config;
            delete payload.passive_type;
        }

        if (activeTab === 'game_raids') {
            delete payload.passive_type;
            delete payload.type;
        }

        // Ahora sí, guardamos el payload limpio
        const { error } = await supabase.from(activeTab).upsert(payload);

        if (error) {
            alert("Error guardando: " + error.message);
        } else {
            setEditingId(null);
            setEditForm({});
            fetchData(activeTab);
        }
    };

    // 5. BORRAR
    const handleDelete = async (id: any) => {
        if (!confirm("¿Seguro que quieres borrar esto?")) return;
        const pk = activeTab === 'mingle_traits' ? 'type_key' : 'id';

        const { error } = await supabase.from(activeTab).delete().eq(pk, id);
        if (!error) fetchData(activeTab);
        else alert("Error borrando: " + error.message);
    };

    // --- FUNCIONES DE SERVER WIPE (RESET) ---
    const handleResetTequila = async () => {
        const confirm1 = window.confirm("⚠️ ¿ESTÁS SEGURO? Esto borrará el Tequila de TODOS los jugadores.");
        if (!confirm1) return;
        const confirm2 = window.prompt("Escribe 'BORRAR' para confirmar el reseteo global de Tequila:");
        if (confirm2 !== 'BORRAR') return;

        // Si pasó los filtros, ejecutamos el borrado
        const { error } = await supabase.rpc('reset_all_tequila');
        if (error) {
            alert("Error al resetear: " + error.message);
        } else {
            alert("✅ TEQUILA GLOBAL RESETEADO A 0.");
        }
    };

    const handleResetXP = async () => {
        const confirm1 = window.confirm("⚠️ ¿ESTÁS SEGURO? Esto regresará a TODOS los Mingles al Nivel 0.");
        if (!confirm1) return;
        const confirm2 = window.prompt("Escribe 'BORRAR' para confirmar el reseteo global de XP:");
        if (confirm2 !== 'BORRAR') return;

        // Si pasó los filtros, ejecutamos el borrado
        const { error } = await supabase.rpc('reset_all_mingles_xp');
        if (error) {
            alert("Error al resetear: " + error.message);
        } else {
            alert("✅ XP Y NIVELES RESETEADOS A 0 PARA TODOS.");
        }
    };

    const handleResetInventory = async () => {
        const confirm1 = window.confirm("⚠️ ¿ESTÁS SEGURO? Esto vaciará el inventario (Items/Loot) de TODOS los jugadores.");
        if (!confirm1) return;
        const confirm2 = window.prompt("Escribe 'BORRAR' para confirmar el reseteo global de Items:");
        if (confirm2 !== 'BORRAR') return;

        // Ejecutamos el vaciado de inventarios
        const { error } = await supabase.rpc('reset_all_inventory');
        if (error) {
            alert("Error al resetear el inventario: " + error.message);
        } else {
            alert("✅ INVENTARIOS VACIADOS PARA TODOS.");
        }
    };

    // --- COMPONENTES UI ---

    // Reusable Image Uploader UI
    const renderImageUploader = (fieldName: string = 'image_url', label: string = 'Imagen') => (
        <div className="mt-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs font-bold text-gray-500 block mb-2">{label} (Subir o URL)</label>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                    {editForm[fieldName] ? (
                        <img src={editForm[fieldName]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] text-gray-400">No Img</span>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    {isUploading ? (
                        <div className="text-xs font-bold text-blue-500 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> Subiendo imagen...
                        </div>
                    ) : (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadImage(e, fieldName)}
                            className="text-xs block w-full text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1D1D1D] file:text-white hover:file:bg-[#E15162] hover:file:cursor-pointer transition-colors"
                        />
                    )}
                    <input
                        placeholder="O pega la URL directamente aquí..."
                        value={editForm[fieldName] || ''}
                        onChange={e => setEditForm({ ...editForm, [fieldName]: e.target.value })}
                        className="border p-1.5 rounded w-full text-xs text-gray-600"
                    />
                </div>
            </div>
        </div>
    );

    const renderFormFields = () => {
        switch (activeTab) {
            case 'game_items':
                return (
                    <>
                        <label className="text-xs font-bold text-gray-500">ID Único (Ej: potion_xp)</label>
                        <input placeholder="ID" value={editForm.id || ''} onChange={e => setEditForm({ ...editForm, id: e.target.value })} className={`border p-2 rounded w-full mb-2 ${editingId !== 'new' ? 'bg-gray-100 text-gray-500' : ''}`} disabled={editingId !== 'new'} />

                        <input placeholder="Nombre" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="border p-2 rounded w-full mb-2" />
                        <select value={editForm.type || 'loot'} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="border p-2 rounded w-full mb-2">
                            <option value="yield">Yield Bonus (Tequila)</option>
                            <option value="boss">Boss Damage</option>
                            <option value="loot">Loot Chance</option>
                            {/* NUEVAS OPCIONES */}
                            <option value="time">Reducir Tiempo (Raid)</option>
                            <option value="xp">Bono de Experiencia (XP)</option>
                        </select>
                        <input type="number" placeholder="Valor %" value={editForm.value || 0} onChange={e => setEditForm({ ...editForm, value: parseInt(e.target.value) })} className="border p-2 rounded w-full mb-2" />
                        <input placeholder="Descripción" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="border p-2 rounded w-full mb-2" />

                        {renderImageUploader('image_url', 'Icono del Item')}
                    </>
                );
            case 'game_bosses':
                return (
                    <>
                        <input placeholder="Nombre Boss" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="border p-2 rounded w-full mb-2" />
                        <textarea placeholder="Descripción" rows={3} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="border p-2 rounded w-full mb-2" />

                        {renderImageUploader('image_url', 'Imagen del Boss')}
                    </>
                );
            case 'mingle_traits':
                return (
                    <>
                        <label className="text-xs font-bold text-gray-500">Type Key (Ej: gold)</label>
                        <input placeholder="Type Key" value={editForm.type_key || ''} onChange={e => setEditForm({ ...editForm, type_key: e.target.value })} className={`border p-2 rounded w-full mb-2 ${editingId !== 'new' ? 'bg-gray-100 text-gray-500' : ''}`} disabled={editingId !== 'new'} />

                        <input placeholder="Rareza" value={editForm.rarity || ''} onChange={e => setEditForm({ ...editForm, rarity: e.target.value })} className="border p-2 rounded w-full mb-2" />
                        <select value={editForm.passive_type || 'yield'} onChange={e => setEditForm({ ...editForm, passive_type: e.target.value })} className="border p-2 rounded w-full mb-2">
                            <option value="yield">Yield</option><option value="boss">Boss</option><option value="loot">Loot</option><option value="omni">Omni</option>
                        </select>
                        <input type="number" placeholder="Valor Pasivo %" value={editForm.passive_value || 0} onChange={e => setEditForm({ ...editForm, passive_value: parseInt(e.target.value) })} className="border p-2 rounded w-full mb-4" />

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <label className="text-sm font-black text-blue-900 block mb-2">💎 Item Exclusivo</label>
                            <select value={editForm.exclusive_item_id || ''} onChange={e => setEditForm({ ...editForm, exclusive_item_id: e.target.value })} className="border p-2 rounded w-full mb-2 text-sm">
                                <option value="">-- Ningún Item --</option>
                                {allItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                            {/* Eliminamos el input de Drop Rate que causaba el error. Ahora es automático. */}
                            <p className="text-[10px] text-blue-600 mt-1">Probabilidad automática: 5% base + 1% por nivel del Mingle.</p>
                        </div>
                    </>
                );
            case 'game_raids':
                const yields = editForm.yield_config || { "1": { min: 0, max: 0 }, "12": { min: 0, max: 0 }, "24": { min: 0, max: 0 } };
                const loot = editForm.loot_table || [];

                return (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Nombre de la Raid</label>
                            <input placeholder="Nombre" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="border p-2 rounded w-full" />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500">Seleccionar Jefe (Boss)</label>
                            <select value={editForm.boss_id || ''} onChange={e => setEditForm({ ...editForm, boss_id: parseInt(e.target.value) })} className="border p-2 rounded w-full bg-white">
                                <option value="">-- Selecciona un Jefe --</option>
                                {allBosses.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Dificultad</label>
                                <select value={editForm.difficulty || 'Easy'} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })} className="border p-2 rounded w-full bg-white">
                                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                                </select>
                            </div>
                            {/* NUEVO CAMPO DE XP AQUÍ */}
                            <div>
                                <label className="text-xs font-bold text-gray-500">XP por Misión</label>
                                <input
                                    type="number"
                                    placeholder="Ej: 50"
                                    value={editForm.base_xp || 0}
                                    onChange={e => setEditForm({ ...editForm, base_xp: parseInt(e.target.value) })}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Color Theme</label>
                                <input placeholder="Ej: from-red-900 to-black" value={editForm.color_theme || ''} onChange={e => setEditForm({ ...editForm, color_theme: e.target.value })} className="border p-2 rounded w-full" />
                            </div>
                        </div>

                        {renderImageUploader('image_url', 'Imagen de Fondo (Raid)')}

                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <label className="text-sm font-black mb-2 block">💰 Tequila Rewards (Yield Config)</label>
                            {(['1', '12', '24'] as const).map(hours => (
                                <div key={hours} className="flex items-center gap-2 mb-2">
                                    <span className="w-16 font-bold text-xs text-gray-600">{hours} Hora(s):</span>
                                    <input type="number" placeholder="Min" value={yields[hours]?.min || 0} onChange={e => setEditForm({ ...editForm, yield_config: { ...yields, [hours]: { ...yields[hours], min: parseInt(e.target.value) } } })} className="border p-1.5 rounded w-full text-sm" />
                                    <span className="text-gray-400">-</span>
                                    <input type="number" placeholder="Max" value={yields[hours]?.max || 0} onChange={e => setEditForm({ ...editForm, yield_config: { ...yields, [hours]: { ...yields[hours], max: parseInt(e.target.value) } } })} className="border p-1.5 rounded w-full text-sm" />
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-black">🎁 Boss Loot Table</label>
                                <button type="button" onClick={() => setEditForm({ ...editForm, loot_table: [...loot, { item_id: '', rate: 0 }] })} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-200">
                                    + Agregar Item
                                </button>
                            </div>

                            {loot.length === 0 && <p className="text-xs text-gray-400 italic">No hay items asignados a este boss.</p>}

                            {loot.map((l: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 mb-2 bg-white p-2 rounded border">
                                    <select value={l.item_id} onChange={e => { const newLoot = [...loot]; newLoot[idx].item_id = e.target.value; setEditForm({ ...editForm, loot_table: newLoot }); }} className="border p-1.5 rounded w-2/3 text-sm">
                                        <option value="">Selecciona Item...</option>
                                        {allItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                    </select>
                                    <input type="number" placeholder="% Drop" value={l.rate} onChange={e => { const newLoot = [...loot]; newLoot[idx].rate = parseInt(e.target.value); setEditForm({ ...editForm, loot_table: newLoot }); }} className="border p-1.5 rounded w-1/3 text-sm text-center" />
                                    <button type="button" onClick={() => { const newLoot = loot.filter((_: any, index: number) => index !== idx); setEditForm({ ...editForm, loot_table: newLoot }); }} className="text-red-500 hover:text-red-700 p-1 font-black">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'danger_zone':
                return (
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-red-500 shadow-[8px_8px_0_0_#ef4444]">
                        <h2 className="text-3xl font-black uppercase text-red-500 mb-2">Danger Zone (Server Wipes)</h2>
                        <p className="font-bold text-gray-500 mb-8">Úsalas únicamente para reiniciar la economía antes de lanzamientos oficiales o para pruebas desde cero. Estas acciones NO se pueden deshacer.</p>

                        {/* Cambiamos a grid-cols-3 para acomodar el nuevo botón */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* RESET TEQUILA */}
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
                                <h3 className="text-xl font-black uppercase text-red-700 mb-2">Reset Global de Tequila</h3>
                                <p className="text-xs font-bold text-red-600/70 mb-6">Regresa el balance de $TEQ de todas las wallets registradas exactamente a cero (0).</p>
                                <button onClick={handleResetTequila} className="w-full bg-red-600 text-white font-black uppercase py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                                    Ejecutar Reset de Tequila
                                </button>
                            </div>

                            {/* RESET XP */}
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
                                <h3 className="text-xl font-black uppercase text-red-700 mb-2">Reset Global de XP/Niveles</h3>
                                <p className="text-xs font-bold text-red-600/70 mb-6">Regresa la experiencia y el nivel de todos los Mingles de todas las wallets a Nivel 0.</p>
                                <button onClick={handleResetXP} className="w-full bg-red-600 text-white font-black uppercase py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                                    Ejecutar Reset de XP
                                </button>
                            </div>

                            {/* RESET INVENTARIO (NUEVO) */}
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
                                <h3 className="text-xl font-black uppercase text-red-700 mb-2">Reset Global de Items</h3>
                                <p className="text-xs font-bold text-red-600/70 mb-6">Elimina todos los items, reliquias y loot de los inventarios de TODAS las wallets.</p>
                                <button onClick={handleResetInventory} className="w-full bg-red-600 text-white font-black uppercase py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                                    Ejecutar Reset de Items
                                </button>
                            </div>

                        </div>
                    </div>
                );
        }
    };

    // --- RENDER PRINCIPAL ---
    if (!isConnected) return <div className="flex h-screen items-center justify-center bg-gray-100"><ConnectWalletView /></div>;
    if (isCheckingAuth) return <div className="flex h-screen items-center justify-center gap-2 text-gray-500 font-bold"><Loader2 className="animate-spin" /> Verificando credenciales...</div>;
    if (!isAdmin) return (
        <div className="flex h-screen flex-col items-center justify-center text-red-500 gap-4 bg-gray-100">
            <Lock size={64} className="mb-4" />
            <h1 className="text-4xl font-black">ACCESO DENEGADO</h1>
            <p className="text-black font-bold">Tu wallet <span className="bg-gray-200 px-2 py-1 rounded font-mono">{address}</span> no está en la lista de administradores.</p>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-100 text-sm md:text-base">
            {/* SIDEBAR */}
            <div className="w-64 bg-[#1D1D1D] text-white p-6 flex flex-col gap-4 fixed h-full shadow-2xl z-10">
                <h1 className="text-2xl font-black uppercase text-[#E15162] flex items-center gap-2"><Lock size={20} /> Admin Panel</h1>
                <p className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded mb-4 text-center">{address?.slice(0, 6)}...{address?.slice(-4)}</p>

                {TABLES.map(t => (
                    <button
                        key={t}
                        onClick={() => { setActiveTab(t); setEditingId(null); setEditForm({}); }}
                        className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === t ? 'bg-[#E15162] text-white shadow-lg translate-x-2' : 'hover:bg-white/10 text-gray-400'}`}
                    >
                        {t.replace('game_', '').replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {/* MAIN CONTENT */}
            <div className="ml-64 p-8 md:p-12 w-full max-w-6xl">

                {/* SI ESTAMOS EN DANGER ZONE */}
                {activeTab === 'danger_zone' ? (
                    <div className="bg-white p-8 rounded-[2rem] border-4 border-red-500 shadow-[8px_8px_0_0_#ef4444] animate-in slide-in-from-bottom-4">
                        <h2 className="text-3xl font-black uppercase text-red-500 mb-2">Danger Zone (Server Wipes)</h2>
                        <p className="font-bold text-gray-500 mb-8">Úsalas únicamente para reiniciar la economía antes de lanzamientos oficiales o para pruebas desde cero. Estas acciones NO se pueden deshacer.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* RESET TEQUILA */}
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
                                <h3 className="text-xl font-black uppercase text-red-700 mb-2">Reset Global de Tequila</h3>
                                <p className="text-xs font-bold text-red-600/70 mb-6">Regresa el balance de $TEQ de todas las wallets registradas exactamente a cero (0).</p>
                                <button onClick={handleResetTequila} className="w-full bg-red-600 text-white font-black uppercase py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                                    Ejecutar Reset de Tequila
                                </button>
                            </div>

                            {/* RESET XP */}
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
                                <h3 className="text-xl font-black uppercase text-red-700 mb-2">Reset Global de XP/Niveles</h3>
                                <p className="text-xs font-bold text-red-600/70 mb-6">Regresa la experiencia y el nivel de todos los Mingles de todas las wallets a Nivel 0.</p>
                                <button onClick={handleResetXP} className="w-full bg-red-600 text-white font-black uppercase py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                                    Ejecutar Reset de XP
                                </button>
                            </div>

                            {/* RESET INVENTARIO (NUEVO) */}
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl">
                                <h3 className="text-xl font-black uppercase text-red-700 mb-2">Reset Global de Items</h3>
                                <p className="text-xs font-bold text-red-600/70 mb-6">Elimina todos los items, reliquias y loot de los inventarios de TODAS las wallets.</p>
                                <button onClick={handleResetInventory} className="w-full bg-red-600 text-white font-black uppercase py-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                                    Ejecutar Reset de Items
                                </button>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* SI ESTAMOS EN CUALQUIER OTRA PESTAÑA (TABLAS NORMALES) */
                    <>
                        <div className="flex justify-between items-center mb-8 border-b-2 border-gray-200 pb-4">
                            <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">{activeTab.replace('game_', '').replace('_', ' ')}</h2>
                            <button
                                onClick={() => {
                                    setEditingId('new');
                                    setEditForm({
                                        type: 'yield',
                                        passive_type: 'yield',
                                        difficulty: 'Easy',
                                        yield_config: { "1": { min: 0, max: 0 }, "12": { min: 0, max: 0 }, "24": { min: 0, max: 0 } }
                                    });
                                }}
                                className="bg-[#1D1D1D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-md"
                            >
                                <Plus size={20} /> Agregar Nuevo
                            </button>
                        </div>

                        {loading ? <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#E15162]" size={40} /></div> : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 font-black text-xs uppercase text-gray-500 w-1/4">ID / Nombre</th>
                                            <th className="p-4 font-black text-xs uppercase text-gray-500">Detalles Rápidos</th>
                                            <th className="p-4 font-black text-xs uppercase text-gray-500 text-right w-24">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.map((item) => (
                                            <tr key={item.id || item.type_key} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-900">{item.name || item.type_key}</p>
                                                    <p className="text-xs font-mono text-gray-400">{item.id}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.image_url && <img src={item.image_url} className="w-8 h-8 rounded object-cover border" />}
                                                        <p className="text-xs text-gray-500 max-w-md truncate">
                                                            {JSON.stringify(item).replace(/["{}]/g, '').slice(0, 80)}...
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right flex justify-end gap-1">
                                                    <button onClick={() => { setEditingId(item.id || item.type_key); setEditForm(item); }} className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors" title="Editar"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(item.id || item.type_key)} className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors" title="Borrar"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.length === 0 && (
                                            <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-bold italic">No hay datos en esta tabla aún.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL EDICIÓN */}
            {editingId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-2xl font-black uppercase text-[#1D1D1D]">{editingId === 'new' ? 'Crear Registro' : 'Editar Registro'}</h3>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-black">✕</button>
                        </div>

                        {renderFormFields()}

                        <div className="flex gap-3 mt-8 pt-4 border-t">
                            <button onClick={handleSave} disabled={isUploading} className="flex-1 bg-[#E15162] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#c03546] disabled:opacity-50 transition-colors">
                                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Guardar Cambios
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-6 py-3 rounded-xl font-bold border-2 hover:bg-gray-50 text-gray-600">Cancelar</button>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}