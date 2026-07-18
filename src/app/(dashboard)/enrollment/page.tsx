'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useEnrollments, useApproveEnrollment, useRejectEnrollment } from '@/modules/enrollment/hooks/useEnrollment';
import type { EnrollmentStatus } from '@/modules/enrollment/types/enrollment.types';
import { CheckCircle, XCircle, Clock, UserPlus, Eye, Loader2 } from 'lucide-react';

export default function EnrollmentPage() {
  const { schoolId, session } = useAuth();
  const [filter, setFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const { data: enrollments, isLoading } = useEnrollments(
    schoolId || '',
    filter === 'all' ? undefined : filter
  );
  const approveMutation = useApproveEnrollment();
  const rejectMutation = useRejectEnrollment();

  const handleApprove = async (enrollmentId: string) => {
    if (!session?.user) return;
    if (!confirm('Approve pendaftaran ini? Siswa akan otomatis ditambahkan.')) return;
    await approveMutation.mutateAsync({
      enrollmentId,
      adminId: session.user.id,
    });
    setSelectedEnrollment(null);
  };

  const handleReject = async (enrollmentId: string) => {
    if (!session?.user) return;
    await rejectMutation.mutateAsync({
      enrollmentId,
      adminId: session.user.id,
      notes: rejectNotes || undefined,
    });
    setSelectedEnrollment(null);
    setRejectNotes('');
  };

  if (!schoolId) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Memuat data sekolah...</p>
      </div>
    );
  }

  const pending = enrollments?.filter(e => e.status === 'pending') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pendaftar Online</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Kelola pendaftaran siswa baru dari orang tua
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-gray-500">Menunggu</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {enrollments?.filter(e => e.status === 'pending').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-gray-500">Disetujui</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {enrollments?.filter(e => e.status === 'approved').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-gray-500">Ditolak</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {enrollments?.filter(e => e.status === 'rejected').length || 0}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'approved' ? 'Disetujui' : 'Ditolak'}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : !enrollments?.length ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada pendaftaran</p>
          <p className="text-xs text-gray-400 mt-1">Link pendaftaran online:</p>
          <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <code className="flex-1 text-xs text-gray-600 truncate">{`${typeof window !== 'undefined' ? window.location.origin : ''}/register-student?school=${schoolId}`}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/register-student?school=${schoolId}`);
              }}
              className="shrink-0 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Salin Link
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{enrollment.student_name}</h3>
                  <p className="text-sm text-gray-500">
                    Kelas {enrollment.class} • Orang tua: {enrollment.parent_name} ({enrollment.parent_phone})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(enrollment.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    enrollment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    enrollment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {enrollment.status === 'pending' ? 'Menunggu' :
                     enrollment.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>

                  {enrollment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(enrollment.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedEnrollment(
                          selectedEnrollment === enrollment.id ? null : enrollment.id
                        )}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Reject notes input */}
              {selectedEnrollment === enrollment.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Catatan penolakan (opsional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => handleReject(enrollment.id)}
                    disabled={rejectMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {rejectMutation.isPending ? '...' : 'Kirim'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
