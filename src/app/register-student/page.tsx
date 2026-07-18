'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitEnrollment } from '@/modules/enrollment/services/enrollment.service';
import { CLASS_OPTIONS } from '@/modules/enrollment/types/enrollment.types';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';

function RegisterStudentForm() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('school') || '';
  const [schoolName, setSchoolName] = useState('');
  const [schoolLoading, setSchoolLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) { setSchoolLoading(false); return; }
    const supabase = createSupabaseClient();
    (async () => {
      try {
        const { data } = await supabase.from('schools').select('name').eq('id', schoolId).single();
        setSchoolName(data?.name || '');
      } catch { /* ignore */ }
      setSchoolLoading(false);
    })();
  }, [schoolId]);

  const [formData, setFormData] = useState({
    student_name: '',
    nis: '',
    class: '',
    gender: '',
    address: '',
    birth_date: '',
    birth_place: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    parent_occupation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!schoolId) {
      setError('Link pendaftaran tidak valid. Pastikan Anda mengakses dari link yang benar.');
      return;
    }

    if (!formData.student_name || !formData.class || !formData.parent_name || !formData.parent_phone) {
      setError('Mohon lengkapi field yang wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await submitEnrollment(schoolId, formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <div className="relative z-10 text-center">
          <p className="text-white/60">Link pendaftaran tidak valid.</p>
          <p className="text-white/30 text-sm mt-2">Hubungi sekolah untuk mendapatkan link yang benar.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <div className="fixed inset-0 bg-glow-lg pointer-events-none" />
        <div className="relative z-10 max-w-md w-full text-center animate-fade-in">
          <div className="glass rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Pendaftaran Berhasil!</h1>
            <p className="text-white/50 text-sm mb-6">
              Data pendaftaran {formData.student_name} telah dikirim.
              Pihak sekolah akan menghubungi Anda untuk proses selanjutnya.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-glow-lg pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
              SR
            </div>
            <span className="text-lg font-bold text-white">SekolahRapi</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Pendaftaran Siswa Baru</h1>
          {schoolLoading ? (
            <div className="w-32 h-4 bg-white/10 rounded mt-2 mx-auto animate-pulse" />
          ) : schoolName ? (
            <p className="text-sm text-indigo-300 font-medium mt-2">{schoolName}</p>
          ) : null}
          <p className="text-sm text-white/40 mt-1">Isi data berikut untuk mendaftarkan siswa baru</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Data Siswa */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Data Siswa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-white/50 mb-1.5">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => handleChange('student_name', e.target.value)}
                  className="input-modern"
                  placeholder="Nama lengkap siswa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">NIS (opsional)</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => handleChange('nis', e.target.value)}
                  className="input-modern"
                  placeholder="Nomor Induk Siswa"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Kelas *</label>
                <select
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  className="input-modern"
                  required
                >
                  <option value="">Pilih kelas</option>
                  {CLASS_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Jenis Kelamin</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="input-modern"
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) => handleChange('birth_place', e.target.value)}
                  className="input-modern"
                  placeholder="Kota kelahiran"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  className="input-modern"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-white/50 mb-1.5">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="input-modern"
                  rows={2}
                  placeholder="Alamat lengkap siswa"
                />
              </div>
            </div>
          </div>

          {/* Data Orang Tua */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Data Orang Tua / Wali</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-white/50 mb-1.5">Nama Orang Tua / Wali *</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => handleChange('parent_name', e.target.value)}
                  className="input-modern"
                  placeholder="Nama ayah / ibu / wali"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">No. WhatsApp *</label>
                <input
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => handleChange('parent_phone', e.target.value)}
                  className="input-modern"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Email (opsional)</label>
                <input
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => handleChange('parent_email', e.target.value)}
                  className="input-modern"
                  placeholder="email@contoh.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-white/50 mb-1.5">Pekerjaan</label>
                <input
                  type="text"
                  value={formData.parent_occupation}
                  onChange={(e) => handleChange('parent_occupation', e.target.value)}
                  className="input-modern"
                  placeholder="Pekerjaan orang tua"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-modern flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Pendaftaran'
            )}
          </button>

          <p className="text-center text-xs text-white/30">
            Dengan mengirim formulir ini, Anda menyetujui proses verifikasi oleh pihak sekolah.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterStudentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <RegisterStudentForm />
    </Suspense>
  );
}
