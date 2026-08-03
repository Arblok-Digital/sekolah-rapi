'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCategories } from '@/modules/transactions/services/category.service';
import { useToast, getErrorMessage } from '@/shared/components/ui/toast';
import type { TransactionFormData } from '../types/transaction.types';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category_id: z.string().min(1, 'Pilih kategori'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  description: z.string().optional(),
  reference_date: z.string().min(1, 'Pilih tanggal'),
});

type FormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  schoolId: string;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: TransactionFormData | null;
}

export function TransactionForm({
  schoolId,
  onSubmit,
  onCancel,
  initialData,
}: TransactionFormProps) {
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type ?? 'income',
      category_id: initialData?.category_id ?? '',
      amount: initialData?.amount ?? 0,
      description: initialData?.description ?? '',
      reference_date:
        initialData?.reference_date ?? new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    getCategories(schoolId, selectedType).then(setCategories).catch(console.error);
  }, [schoolId, selectedType]);

  const onFormSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      toast({ title: 'Transaksi ditambahkan', variant: 'success' });
    } catch (err) {
      toast({ title: 'Gagal menyimpan transaksi', description: getErrorMessage(err), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="income"
              {...register('type')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-green-700 font-medium">Pemasukan</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="expense"
              {...register('type')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-red-700 font-medium">Pengeluaran</span>
          </label>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <select
          {...register('category_id')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option value="">Pilih kategori...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
        <input
          type="number"
          step="100"
          min="0"
          {...register('amount')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="0"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
        <input
          type="date"
          {...register('reference_date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        />
        {errors.reference_date && (
          <p className="mt-1 text-sm text-red-600">{errors.reference_date.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
        <textarea
          {...register('description')}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="Optional description..."
        />
      </div>

      {/* Proof Upload Placeholder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bukti Transfer (opsional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-500">Upload bukti (coming soon)</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
