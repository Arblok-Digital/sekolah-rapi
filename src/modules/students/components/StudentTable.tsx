'use client';

import type { Student } from '../types/student.types';

interface StudentTableProps {
  students: Student[];
  loading?: boolean;
}

export function StudentTable({ students, loading }: StudentTableProps) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
