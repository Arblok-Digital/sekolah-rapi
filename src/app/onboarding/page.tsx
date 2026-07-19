'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { APP_NAME } from '@/shared/constants';

export default function OnboardingPage() {
  const [schoolName, setSchoolName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'checking' | 'form' | 'creating' | 'done'>('checking');
  const router = useRouter();

  // Check existing session on mount
  useEffect(() => {
    const supabase = createSupabaseClient();
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/register');
        return;
      }

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles').select('id, school_id').eq('id', session.user.id).maybeSingle();

      if (profile?.school_id) {
        router.replace('/overview');
        return;
      }

      setStep('form');
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('creating');

    try {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session tidak ditemukan. Silakan login ulang.');
      const userId = session.user.id;
      const userEmail = session.user.email || '';

      // 1. Create school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName || `Sekolah ${fullName}`,
          owner_id: userId,
          plan: 'free',
          status: 'pending',
        })
        .select()
        .single();
      if (schoolError) throw new Error('Gagal membuat sekolah: ' + schoolError.message);

      // 2. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        school_id: school.id,
        name: fullName,
        phone: phone || null,
        email: userEmail,
        role: 'owner',
      });
      if (profileError) throw new Error('Gagal membuat profil: ' + profileError.message);

      // 3. Create default categories
      const defaultCategories = [
        { name: 'SPP', type: 'income', school_id: school.id },
        { name: 'Sumbangan', type: 'income', school_id: school.id },
        { name: 'Gaji Guru', type: 'expense', school_id: school.id },
        { name: 'ATK', type: 'expense', school_id: school.id },
        { name: 'Listrik', type: 'expense', school_id: school.id },
        { name: 'Lainnya', type: 'income', school_id: school.id },
      ];
      await supabase.from('categories').insert(defaultCategories);

      // 4. Done
      setStep('done');
      setTimeout(() => {
        router.refresh();
        router.push('/pending-approval');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setStep('form');
      setLoading(false);
    }
  };

  if (step === 'checking') {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="relative z-10 text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (step === 'creating') {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <div className="fixed inset-0 bg-glow-lg pointer-events-none" />
        <div className="relative z-10 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Menyiapkan Akun...</h2>
          <p className="text-white/60">Sebentar ya, kami sedang menyiapkan data sekolah kamu</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <div className="fixed inset-0 bg-glow-lg pointer-events-none" />
        <div className="relative z-10 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Berhasil!</h2>
          <p className="text-white/60">Akun sekolah kamu sudah dibuat. Menunggu persetujuan admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-glow-lg pointer-events-none" />
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
              SR
            </div>
            <span className="text-xl font-bold text-white">{APP_NAME}</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Setup Sekolah</h1>
          <p className="text-white/60 text-sm mb-8">Isi data sekolah untuk memulai</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Nama Sekolah *</label>
              <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                className="input-modern" placeholder="SD/SMP/SMA Bina Bangsa" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Nama Lengkap *</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="input-modern" placeholder="Nama Kepala Sekolah" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">No. WhatsApp</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="input-modern" placeholder="0812-xxxx-xxxx" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary-modern flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftar...
                </>
              ) : (
                'Daftar Gratis'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
