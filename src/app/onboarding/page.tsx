'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { Building2, Loader2, UserRound } from 'lucide-react';
import { AuthShell, authButtonClassName, authFieldClassName } from '@/shared/components/Auth/AuthShell';

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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ed] p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#26735d]" />
        </div>
      </div>
    );
  }

  if (step === 'creating') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ed] p-4 text-[#17211b]">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#173f35] shadow-[0_6px_0_#b8d44b]">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
          <h2 className="mt-7 text-2xl font-black tracking-tight">Menyiapkan ruang kerja...</h2>
          <p className="mt-2 text-sm text-[#5c675f]">Data sekolah sedang kami hubungkan.</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ed] p-4 text-[#17211b]">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dfe99a] text-3xl text-[#173f35]">
            ✓
          </div>
          <h2 className="mt-7 text-2xl font-black tracking-tight">Pendaftaran diterima.</h2>
          <p className="mt-2 text-sm text-[#5c675f]">Mengalihkan Anda ke halaman persetujuan...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      compact
      eyebrow="Langkah terakhir"
      title="Lengkapi identitas sekolah."
      description="Akun Anda sudah aktif. Tambahkan nama penanggung jawab dan sekolah untuk menyiapkan ruang kerja."
    >
      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-bold text-[#354139]">Nama lengkap *</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#7b857e]" />
            <input id="name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${authFieldClassName} pl-11`} placeholder="Nama penanggung jawab" required />
          </div>
        </div>
        <div>
          <label htmlFor="schoolName" className="text-sm font-bold text-[#354139]">Nama sekolah *</label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#7b857e]" />
            <input id="schoolName" type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={`${authFieldClassName} pl-11`} placeholder="SD/SMP/SMA Bina Bangsa" required />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-bold text-[#354139]">No. WhatsApp</label>
          <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={authFieldClassName} placeholder="0812 xxxx xxxx" />
        </div>
        <button type="submit" disabled={loading} className={authButtonClassName}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan...</> : 'Siapkan ruang kerja'}
        </button>
      </form>
    </AuthShell>
  );
}
