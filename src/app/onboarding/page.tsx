'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import Link from 'next/link';
import { APP_NAME } from '@/shared/constants';

export default function OnboardingPage() {
  const [schoolName, setSchoolName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'creating' | 'done'>('form');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('creating');

    try {
      const supabase = createSupabaseClient();

      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Gagal membuat akun');

      // 2. If no session (email confirmation ON), try sign in
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw new Error('Akun dibuat! Silakan cek email untuk verifikasi, lalu login.');
        }
      }

      // 3. Create school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName || `Sekolah ${fullName}`,
          owner_id: authData.user.id,
          plan: 'free',
          status: 'pending',
        })
        .select()
        .single();
      if (schoolError) throw new Error('Gagal membuat sekolah: ' + schoolError.message);

      // 4. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        school_id: school.id,
        name: fullName,
        phone: phone || null,
        email: email,
        role: 'owner',
      });
      if (profileError) throw new Error('Gagal membuat profil: ' + profileError.message);

      // 5. Create default categories
      const defaultCategories = [
        { name: 'SPP', type: 'income', school_id: school.id },
        { name: 'Sumbangan', type: 'income', school_id: school.id },
        { name: 'Gaji Guru', type: 'expense', school_id: school.id },
        { name: 'ATK', type: 'expense', school_id: school.id },
        { name: 'Listrik', type: 'expense', school_id: school.id },
        { name: 'Lainnya', type: 'income', school_id: school.id },
      ];
      await supabase.from('categories').insert(defaultCategories);

      // 6. Done → redirect
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
          <p className="text-white/40">Sebentar ya, kami sedang menyiapkan data sekolah kamu</p>
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
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Berhasil!</h2>
          <p className="text-white/40">Akun sekolah kamu sudah dibuat. Menunggu persetujuan admin.</p>
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
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25">
              SR
            </div>
            <span className="text-xl font-bold text-white">{APP_NAME}</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Setup Sekolah</h1>
          <p className="text-white/40 text-sm mb-8">Isi data sekolah untuk memulai</p>

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
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-modern" placeholder="nama@sekolah.sch.id" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">No. WhatsApp</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="input-modern" placeholder="0812-xxxx-xxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-modern" placeholder="Min. 8 karakter" required minLength={8} />
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

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
