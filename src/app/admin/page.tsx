'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { Loader2, Trash2, Plus, Save, Lock, Edit } from 'lucide-react';

// Tipos simples para el CRUD
const TABLES = ['game_items', 'game_bosses', 'game_raids', 'mingle_traits'] as const;
type TableName = typeof TABLES[number];

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  
  // Seguridad
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Data
  const [activeTab, setActiveTab] = useState<TableName>('game_items');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Edición
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // 1. VERIFICAR ADMIN AL ENTRAR
  useEffect(() => {
    const checkAdmin = async () => {
      if (!address) return;
      setIsCheckingAuth(true);
      
      const { data } = await supabase
        .from('admins')
        .select('*')
        // CAMBIO AQUÍ: Usar ilike en lugar de eq para ignorar mayúsculas
        .ilike('wallet_address'.toLowerCase(), address.toLowerCase()) 
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

  // 2. CARGAR DATOS
  const fetchData = async (table: TableName) => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (!error && data) setData(data);
    setLoading(false);
  };

  // Cambiar Pestaña
  useEffect(() => {
    if (isAdmin) fetchData(activeTab);
  }, [activeTab]);

  // 3. GUARDAR (UPSERT)
  const handleSave = async () => {
    // Pequeña limpieza para JSONs en Raids
    let payload = { ...editForm };
    
    // Si es tabla Raids, asegurarnos que los campos JSON sean objetos, no strings
    if (activeTab === 'game_raids') {
        try {
            if (typeof payload.yield_config === 'string') payload.yield_config = JSON.parse(payload.yield_config);
            if (typeof payload.loot_table === 'string') payload.loot_table = JSON.parse(payload.loot_table);
        } catch (e) {
            alert("Error: JSON inválido en Yields o Loot Table");
            return;
        }
    }

    const { error } = await supabase.from(activeTab).upsert(payload);
    
    if (error) {
        alert("Error guardando: " + error.message);
    } else {
        setEditingId(null);
        setEditForm({});
        fetchData(activeTab);
    }
  };

  // 4. BORRAR
  const handleDelete = async (id: any) => {
    if (!confirm("¿Seguro que quieres borrar esto?")) return;
    
    // Detectar cuál es la Primary Key (normalmente 'id', pero 'mingle_traits' usa 'type_key')
    const pk = activeTab === 'mingle_traits' ? 'type_key' : 'id';
    
    const { error } = await supabase.from(activeTab).delete().eq(pk, id);
    if (!error) fetchData(activeTab);
    else alert("Error borrando: " + error.message);
  };

  // --- RENDER ---

  if (!isConnected) return <div className="flex h-screen items-center justify-center"><ConnectWalletView /></div>;
  
  if (isCheckingAuth) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/> Verificando credenciales...</div>;

  if (!isAdmin) return (
    <div className="flex h-screen flex-col items-center justify-center text-red-500 gap-4">
        <Lock size={64}/>
        <h1 className="text-3xl font-black">ACCESO DENEGADO</h1>
        <p className="text-black">Tu wallet {address} no está en la lista de administradores.</p>
    </div>
  );

  // CAMPOS DEL FORMULARIO SEGÚN TABLA
  const renderFormFields = () => {
      switch (activeTab) {
          case 'game_items':
              return (
                  <>
                    <label className="text-xs font-bold text-gray-500">ID Único (Ej: rusty_key)</label>
                    <input 
                        placeholder="ID" 
                        value={editForm.id || ''} 
                        onChange={e => setEditForm({...editForm, id: e.target.value})} 
                        className={`border p-2 rounded w-full mb-2 ${editingId !== 'new' ? 'bg-gray-100 text-gray-500' : ''}`}
                        // CORRECCIÓN: Solo deshabilitar si NO es nuevo
                        disabled={editingId !== 'new'} 
                    />
                    
                    <input placeholder="Nombre" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <select value={editForm.type || 'loot'} onChange={e => setEditForm({...editForm, type: e.target.value})} className="border p-2 rounded w-full mb-2">
                        <option value="yield">Yield</option><option value="boss">Boss</option><option value="loot">Loot</option>
                    </select>
                    <input type="number" placeholder="Valor %" value={editForm.value || 0} onChange={e => setEditForm({...editForm, value: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input placeholder="Descripción" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input placeholder="URL Imagen" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                  </>
              );
          case 'game_bosses':
              return (
                  <>
                    {/* Bosses usan ID numérico automático, no mostramos input de ID al crear */}
                    <input placeholder="Nombre Boss" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input placeholder="Descripción" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input placeholder="URL Imagen" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                  </>
              );
          case 'mingle_traits':
                return (
                    <>
                      <label className="text-xs font-bold text-gray-500">Type Key (Ej: gold)</label>
                      <input 
                        placeholder="Type Key" 
                        value={editForm.type_key || ''} 
                        onChange={e => setEditForm({...editForm, type_key: e.target.value})} 
                        className={`border p-2 rounded w-full mb-2 ${editingId !== 'new' ? 'bg-gray-100 text-gray-500' : ''}`}
                        // CORRECCIÓN: Solo deshabilitar si NO es nuevo
                        disabled={editingId !== 'new'}
                      />
                      <input placeholder="Rareza" value={editForm.rarity || ''} onChange={e => setEditForm({...editForm, rarity: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                      <select value={editForm.passive_type || 'yield'} onChange={e => setEditForm({...editForm, passive_type: e.target.value})} className="border p-2 rounded w-full mb-2">
                          <option value="yield">Yield</option><option value="boss">Boss</option><option value="loot">Loot</option><option value="omni">Omni</option>
                      </select>
                      <input type="number" placeholder="Valor %" value={editForm.passive_value || 0} onChange={e => setEditForm({...editForm, passive_value: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    </>
                );
          case 'game_raids':
              return (
                  <>
                    <input placeholder="Nombre Raid" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input placeholder="Descripción" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <select value={editForm.difficulty || 'Easy'} onChange={e => setEditForm({...editForm, difficulty: e.target.value})} className="border p-2 rounded w-full mb-2">
                        <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                    </select>
                    <input placeholder="URL Imagen Fondo" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input placeholder="Color Theme (Tailwind)" value={editForm.color_theme || ''} onChange={e => setEditForm({...editForm, color_theme: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    <input type="number" placeholder="Boss ID (Número)" value={editForm.boss_id || ''} onChange={e => setEditForm({...editForm, boss_id: e.target.value})} className="border p-2 rounded w-full mb-2"/>
                    
                    <label className="block text-xs font-bold mt-2">Yield Config (JSON)</label>
                    <textarea 
                        rows={3}
                        value={typeof editForm.yield_config === 'object' ? JSON.stringify(editForm.yield_config) : editForm.yield_config || ''} 
                        onChange={e => setEditForm({...editForm, yield_config: e.target.value})} 
                        className="border p-2 rounded w-full mb-2 font-mono text-xs"
                    />
                    
                    <label className="block text-xs font-bold mt-2">Loot Table (JSON)</label>
                    <textarea 
                        rows={3}
                        value={typeof editForm.loot_table === 'object' ? JSON.stringify(editForm.loot_table) : editForm.loot_table || ''} 
                        onChange={e => setEditForm({...editForm, loot_table: e.target.value})} 
                        className="border p-2 rounded w-full mb-2 font-mono text-xs"
                    />
                  </>
              );
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
        
        {/* SIDEBAR */}
        <div className="w-64 bg-[#1D1D1D] text-white p-6 flex flex-col gap-4 fixed h-full">
            <h1 className="text-2xl font-black uppercase text-[#E15162]">Admin Panel</h1>
            <p className="text-xs opacity-50 mb-4">{address?.slice(0,6)}...{address?.slice(-4)}</p>
            
            {TABLES.map(t => (
                <button 
                    key={t}
                    onClick={() => { setActiveTab(t); setEditingId(null); setEditForm({}); }}
                    className={`text-left px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === t ? 'bg-[#E15162] text-white' : 'hover:bg-white/10'}`}
                >
                    {t.replace('game_', '').replace('_', ' ').toUpperCase()}
                </button>
            ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="ml-64 p-10 w-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase text-[#1D1D1D]">{activeTab.replace('_', ' ')}</h2>
                <button 
                    onClick={() => { setEditingId('new'); setEditForm({}); }}
                    className="bg-[#1D1D1D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus size={20}/> Add New
                </button>
            </div>

            {loading ? <Loader2 className="animate-spin mx-auto mt-20"/> : (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-black text-xs uppercase text-gray-500">ID / Name</th>
                                <th className="p-4 font-black text-xs uppercase text-gray-500">Details</th>
                                <th className="p-4 font-black text-xs uppercase text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.map((item) => (
                                <tr key={item.id || item.type_key} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">
                                        {item.name || item.type_key}
                                        <div className="text-xs font-normal opacity-50">{item.id}</div>
                                    </td>
                                    <td className="p-4 text-sm max-w-md truncate">
                                        {JSON.stringify(item).slice(0, 80)}...
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={() => { setEditingId(item.id || item.type_key); setEditForm(item); }} className="p-2 hover:bg-blue-100 text-blue-600 rounded"><Edit size={18}/></button>
                                        <button onClick={() => handleDelete(item.id || item.type_key)} className="p-2 hover:bg-red-100 text-red-600 rounded"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* MODAL EDICIÓN */}
        {editingId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                    <h3 className="text-2xl font-black uppercase mb-6">{editingId === 'new' ? 'Create New' : 'Edit Item'}</h3>
                    
                    {renderFormFields()}

                    <div className="flex gap-3 mt-6">
                        <button onClick={handleSave} className="flex-1 bg-[#1D1D1D] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Save size={18}/> Save Changes</button>
                        <button onClick={() => setEditingId(null)} className="px-6 py-3 rounded-xl font-bold border-2 hover:bg-gray-100">Cancel</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}