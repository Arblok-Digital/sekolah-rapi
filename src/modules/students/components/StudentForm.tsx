'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast, getErrorMessage } from '@/shared/components/ui/toast';
import { CLASS_OPTIONS } from '@/shared/constants';
import type { StudentFormData } from '../types/student.types';

const studentSchema = z.object({
  nis: z.string().min(1, 'NIS wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  class: z.string().min(1, 'Kelas wajib diisi'),
  gender: z.string().optional(),
  address: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  status: z.enum(['active', 'graduated', 'transferred']).default('active'),
});

type FormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<FormValues>;
}

export function StudentForm({ onSubmit, onCancel, initialData }: StudentFormProps) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: 'active',
      ...initialData,
    },
  });

  const onFormSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values);
      toast({ title: initialData ? 'Siswa diperbarui' : 'Siswa ditambahkan', description: values.name, variant: 'success' });
    } catch (err) {
      toast({ title: 'Gagal menyimpan siswa', description: getErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Edit Siswa' : 'Tambah Siswa Baru'}
      </h3>
      {/* NIS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
        <input
          type="text"
          {...register('nis')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="12345678"
        />
        {errors.nis && (
          <p className="mt-1 text-sm text-red-600">{errors.nis.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="Nama siswa"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
        <select
          {...register('class')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option value="">Pilih kelas...</option>
          {CLASS_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.class && (
          <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
        <select
          {...register('gender')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option value="">Pilih...</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
        <textarea
          {...register('address')}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          placeholder="Alamat lengkap"
        />
      </div>

      {/* Parent Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua</label>
          <input
            type="text"
            {...register('parent_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="Nama ayah/ibu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Orang Tua</label>
          <input
            type="text"
            {...register('parent_phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="0812xxxx"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option value="active">Aktif</option>
          <option value="graduated">Lulus</option>
          <option value="transferred">Pindah</option>
        </select>
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
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Menyimpan...'
            : initialData
            ? 'Simpan Perubahan'
            : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
