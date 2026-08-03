'use client';

import { Edit, Trash2, Loader2 } from 'lucide-react';
import type { Student } from '../types/student.types';

interface StudentTableProps {
  students: Student[];
  loading?: boolean;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  deletingId?: string | null;
}

export function StudentTable({ students, loading, onEdit, onDelete, deletingId }: StudentTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Memuat data...</div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Belum ada siswa. Klik &quot;Tambah Siswa&quot; untuk memulai.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              NIS
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kelas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orang Tua
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No. HP
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                {student.nis}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {student.class}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'graduated'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {student.status === 'active'
                    ? 'Aktif'
                    : student.status === 'graduated'
                    ? 'Lulus'
                    : 'Pindah'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {student.parent_name || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {student.parent_phone || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(student)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Edit siswa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(student)}
                      disabled={deletingId === student.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Hapus siswa"
                    >
                      {deletingId === student.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
