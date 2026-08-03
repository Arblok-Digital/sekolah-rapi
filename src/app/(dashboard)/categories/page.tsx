'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/modules/transactions/hooks/useCategories';
import type { Category } from '@/modules/transactions/types/transaction.types';
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  TrendingUp,
  TrendingDown,
  Loader2,
  Lock,
  X,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface CategoryForm {
  name: string;
  type: 'income' | 'expense';
  description: string;
}

const emptyForm: CategoryForm = { name: '', type: 'income', description: '' };

export default function CategoriesPage() {
  const { schoolId } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategories(schoolId || '');
  const createMut = useCreateCategory(schoolId || '');
  const updateMut = useUpdateCategory(schoolId || '');
  const deleteMut = useDeleteCategory(schoolId || '');

  const income = (categories || []).filter((c) => c.type === 'income');
  const expense = (categories || []).filter((c) => c.type === 'expense');

  function openCreate(type: 'income' | 'expense' = 'income') {
    setEditing(null);
    setForm({ ...emptyForm, type });
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      type: category.type,
      description: category.description || '',
    });
    setFormError(null);
    setFormOpen(true);
  }

  function openDelete(category: Category) {
    setDeleteError(null);
    setDeleting(category);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setFormError(null);
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          updates: {
            name: form.name.trim(),
            description: form.description.trim() || null,
          },
        });
      } else {
        await createMut.mutateAsync({
          name: form.name.trim(),
          type: form.type,
          description: form.description.trim() || undefined,
        });
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan kategori.');
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteError(null);
    try {
      await deleteMut.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus kategori.');
    }
  }

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/70">Memuat data sekolah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Kategori Kas</h2>
          <p className="mt-1 text-sm text-white/60">
            Kelola kategori pemasukan dan pengeluaran untuk pencatatan kas
          </p>
        </div>
        <button
          onClick={() => openCreate('income')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> Tambah Kategori
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryGroup
            title="Pemasukan"
            icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
            categories={income}
            onAdd={() => openCreate('income')}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          <CategoryGroup
            title="Pengeluaran"
            icon={<TrendingDown className="h-4 w-4 text-red-400" />}
            categories={expense}
            onAdd={() => openCreate('expense')}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </div>
      )}

      {/* Add/Edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="card-premium w-full max-w-md border-white/10 bg-[#152f26] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editing ? 'Ubah Kategori' : 'Tambah Kategori'}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/60">
                  Nama *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={editing?.is_default}
                  placeholder="Contoh: SPP, Donasi, ATK"
                  className={cn('input-modern', editing?.is_default && 'cursor-not-allowed opacity-50')}
                />
                {editing?.is_default && (
                  <p className="mt-1.5 text-[11px] text-white/40">
                    Nama kategori bawaan tidak dapat diubah.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/60">
                  Tipe
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                  disabled={!!editing}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all [&>option]:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
                {editing && (
                  <p className="mt-1.5 text-[11px] text-white/40">
                    Tipe tidak dapat diubah setelah kategori dibuat.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/60">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi opsional..."
                  className="input-modern resize-none"
                />
              </div>

              {formError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim() || createMut.isPending || updateMut.isPending}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMut.isPending || updateMut.isPending
                    ? 'Menyimpan...'
                    : editing
                      ? 'Simpan Perubahan'
                      : 'Tambah Kategori'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDeleting(null)}
        >
          <div
            className="card-premium w-full max-w-sm border-white/10 bg-[#152f26] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Hapus Kategori</h3>
                <p className="text-xs text-white/60">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-white/70">
              Yakin ingin menghapus kategori{' '}
              <span className="font-bold text-white">&quot;{deleting.name}&quot;</span>?
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMut.isPending}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMut.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryGroup({
  title,
  icon,
  categories,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  icon: ReactNode;
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <section className="card-premium border-white/10 bg-white/[.07] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            {icon}
          </div>
          <h3 className="text-sm font-black text-white">{title}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60">
            {categories.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#dfe99a] transition-colors hover:bg-[#dfe99a]/10 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
          <Tags className="mx-auto mb-2 h-8 w-8 text-white/30" />
          <p className="text-sm text-white/50">Belum ada kategori {title.toLowerCase()}.</p>
          <button
            onClick={onAdd}
            className="mt-2 text-xs font-bold text-[#dfe99a] transition-colors hover:text-white"
          >
            + Tambah kategori {title.toLowerCase()}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const isIncome = category.type === 'income';
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3.5 transition-colors hover:border-white/20">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
          isIncome ? 'border-emerald-400/15 bg-emerald-400/10' : 'border-red-400/15 bg-red-400/10'
        )}
      >
        {isIncome ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-white">{category.name}</p>
          {category.is_default && (
            <span className="shrink-0 rounded-full border border-[#dfe99a]/25 bg-[#dfe99a]/10 px-2 py-0.5 text-[10px] font-black text-[#dfe99a]">
              Bawaan
            </span>
          )}
        </div>
        {category.description ? (
          <p className="mt-0.5 truncate text-xs text-white/50">{category.description}</p>
        ) : (
          <p className="mt-0.5 text-xs italic text-white/30">Tidak ada deskripsi</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit(category)}
          title="Ubah kategori"
          className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(category)}
          disabled={category.is_default}
          title={category.is_default ? 'Kategori bawaan tidak dapat dihapus' : 'Hapus kategori'}
          className={cn(
            'rounded-lg p-2 transition-colors',
            category.is_default
              ? 'cursor-not-allowed text-white/20'
              : 'text-white/60 hover:bg-red-500/10 hover:text-red-400'
          )}
        >
          {category.is_default ? <Lock className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
