'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { StudentTable } from '@/modules/students/components/StudentTable';
import { StudentForm } from '@/modules/students/components/StudentForm';
import { StudentImport } from '@/modules/students/components/StudentImport';
import { useStudents } from '@/modules/students/hooks/useStudents';
import type { StudentFormData } from '@/modules/students/types/student.types';
import { FileSpreadsheet } from 'lucide-react';

export default function StudentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { schoolId } = useAuth();

  const { students, loading, error, addStudent } = useStudents({
    schoolId: schoolId || '',
    classFilter: classFilter || undefined,
    statusFilter: statusFilter || undefined,
    searchQuery: searchQuery || undefined,
  });

  const handleAddStudent = async (data: StudentFormData) => {
    await addStudent(data);
    setShowForm(false);
  };

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Memuat data sekolah...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Siswa</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola data siswa sekolah</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Tambah Siswa
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari nama atau NIS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Semua Kelas</option>
          <option value="7A">7A</option>
          <option value="7B">7B</option>
          <option value="8A">8A</option>
          <option value="8B">8B</option>
          <option value="9A">9A</option>
          <option value="9B">9B</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="graduated">Lulus</option>
          <option value="transferred">Pindah</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Memuat data siswa...</p>
        </div>
      ) : (
        <StudentTable students={students || []} />
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Tambah Siswa Baru</h3>
            <StudentForm
              onSubmit={handleAddStudent}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <StudentImport
              schoolId={schoolId || ''}
              onDone={() => { setShowImport(false); }}
            />
            <button
              onClick={() => setShowImport(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
