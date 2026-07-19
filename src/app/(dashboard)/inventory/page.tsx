'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useInventory, useCreateInventory, useUpdateInventory, useDeleteInventory } from '@/modules/inventory/hooks/useInventory';
import type { InventoryItem, InventoryFormInput, INVENTORY_CATEGORIES, INVENTORY_CONDITIONS } from '@/modules/inventory/types/inventory.types';
import { Plus, Edit, Trash2, Package, Search, Loader2 } from 'lucide-react';

const CATS: string[] = ['Semua', 'Furniture', 'Elektronik', 'ATK', 'Olahraga', 'Laboratorium', 'Perpustakaan', 'Umum'];
const CONDS = ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'];

const emptyForm: InventoryFormInput = { name: '', category: 'Umum', quantity: 1, condition: 'Baik', location: '', purchase_date: '', purchase_price: 0, notes: '' };

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function InventoryPage() {
  const { schoolId, session } = useAuth();
  const [catFilter, setCatFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryFormInput>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: items, isLoading } = useInventory(schoolId || '', catFilter === 'Semua' ? undefined : catFilter);
  const createMut = useCreateInventory(schoolId || '', session?.user?.id);
  const updateMut = useUpdateInventory(schoolId || '');
  const deleteMut = useDeleteInventory(schoolId || '');

  const filtered = (items || []).filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.location?.toLowerCase().includes(search.toLowerCase()));

  function openCreate() { setEditItem(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(item: InventoryItem) { setEditItem(item); setForm({ name: item.name, category: item.category, quantity: item.quantity, condition: item.condition, location: item.location || '', purchase_date: item.purchase_date || '', purchase_price: item.purchase_price, notes: item.notes || '' }); setFormOpen(true); }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    if (editItem) { await updateMut.mutateAsync({ id: editItem.id, input: form }); }
    else { await createMut.mutateAsync(form); }
    setFormOpen(false);
  }

  async function handleDelete(id: string) { await deleteMut.mutateAsync(id); setDeleteConfirm(null); }

  const totalValue = filtered.reduce((s, i) => s + i.purchase_price * i.quantity, 0);
  const totalCount = filtered.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Inventaris</h2>
          <p className="text-sm text-white/60 mt-0.5">{totalCount} item • Total nilai {formatRp(totalValue)}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari item..." className="w-full pl-10 pr-4 py-2.5 border border-white/15 rounded-xl text-sm" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${catFilter === c ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-white/10">
          <Package className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">Belum ada item inventaris</p>
          <button onClick={openCreate} className="mt-3 text-sm text-indigo-600 font-medium hover:underline">+ Tambah Item Pertama</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white/70">Nama Item</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Kategori</th>
                <th className="text-center px-4 py-3 font-medium text-white/70">Qty</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Kondisi</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Lokasi</th>
                <th className="text-right px-4 py-3 font-medium text-white/70">Harga</th>
                <th className="text-center px-4 py-3 font-medium text-white/70">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-white/70">{item.category}</td>
                  <td className="px-4 py-3 text-center text-white">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.condition === 'Baik' ? 'bg-emerald-100 text-emerald-700' : item.condition === 'Rusak Ringan' ? 'bg-amber-100 text-amber-700' : item.condition === 'Rusak Berat' ? 'bg-red-100 text-red-700' : 'bg-white/5 text-white/70'}`}>{item.condition}</span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{item.location || '-'}</td>
                  <td className="px-4 py-3 text-right text-white">{formatRp(item.purchase_price)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-white/50 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"><Edit className="w-4 h-4" /></button>
                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(item.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Ya</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-white/10 rounded text-xs">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-white/50 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">{editItem ? 'Edit Item' : 'Tambah Item Baru'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Nama Item *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm" placeholder="Contoh: Meja Guru" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm">
                    {CATS.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Jumlah</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Kondisi</label>
                  <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as any })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm">
                    {CONDS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Lokasi</label>
                  <input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm" placeholder="Contoh: Ruang Guru" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Tanggal Beli</label>
                  <input type="date" value={form.purchase_date || ''} onChange={e => setForm({ ...form, purchase_date: e.target.value })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Harga Beli (Rp)</label>
                  <input type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm" min={0} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Catatan</label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 border border-white/15 rounded-xl text-sm" rows={2} placeholder="Catatan opsional..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setFormOpen(false)} className="px-4 py-2.5 text-sm text-white/70 hover:text-white">Batal</button>
              <button onClick={handleSubmit} disabled={!form.name.trim() || createMut.isPending || updateMut.isPending} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {createMut.isPending || updateMut.isPending ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
