'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import Link from 'next/link';
import { Building2, Loader2, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import {
  AuthShell,
  authButtonClassName,
  authFieldClassName,
} from '@/shared/components/Auth/AuthShell';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'creating'>('form');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('creating');

    try {
      const supabase = createSupabaseClient();

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      // Handle "already registered" — try to sign in instead
      if (authError?.message?.includes('already') || authError?.status === 422) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw new Error('Email sudah terdaftar tapi login gagal. Coba reset password.');
        // Signed in — check if profile exists
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', signInData.user.id).maybeSingle();
        if (existingProfile) {
          router.refresh();
          router.push('/overview');
          return;
        }
        // No profile yet — go to onboarding
        router.push('/onboarding');
        return;
      }

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Gagal membuat akun');

      // 2. If no session (email confirmation ON), sign in to establish session
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          // Email might need confirmation — redirect to login with message
          throw new Error(
            'Akun dibuat! Silakan cek email untuk verifikasi, lalu login.'
          );
        }
      }

      // 3. Create school (now we have an active session for RLS)
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName || `Sekolah ${name}`,
          owner_id: authData.user.id,
          plan: 'free',
          status: 'pending',
        })
        .select()
        .single();

      if (schoolError) throw new Error('Gagal membuat data sekolah: ' + schoolError.message);

      // 4. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          school_id: school.id,
          name: name,
          phone: phone || null,
          email: email,
          role: 'owner',
        });

      if (profileError) throw new Error('Gagal membuat profil: ' + profileError.message);

      // 5. All good — redirect to pending approval (status = pending)
      router.refresh();
      router.push('/pending-approval');
    } catch (err: any) {
      setError(err.message);
      setStep('form');
      setLoading(false);
    }
  };

  if (step === 'creating') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ed] p-5 text-[#17211b]">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#173f35] shadow-[0_6px_0_#b8d44b]">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </span>
          <h2 className="mt-7 text-2xl font-black tracking-tight">Menyiapkan ruang kerja...</h2>
          <p className="mt-2 text-sm text-[#5c675f]">Data akun dan sekolah sedang kami hubungkan.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      eyebrow="Mulai program pilot"
      title="Daftarkan sekolah Anda."
      description="Isi data penanggung jawab dan sekolah. Tim kami akan meninjau pendaftaran sebelum ruang kerja digunakan."
    >
      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <AuthField icon={UserRound} id="name" label="Nama lengkap *" value={name} onChange={setName} placeholder="Kepala sekolah / bendahara" autoComplete="name" required />
        <AuthField icon={Building2} id="school" label="Nama sekolah" value={schoolName} onChange={setSchoolName} placeholder="SMP Bina Bangsa" />
        <AuthField icon={Mail} id="email" label="Email *" value={email} onChange={setEmail} placeholder="nama@sekolah.sch.id" type="email" autoComplete="email" required />
        <AuthField icon={Phone} id="phone" label="No. WhatsApp" value={phone} onChange={setPhone} placeholder="0812 xxxx xxxx" type="tel" autoComplete="tel" />
        <div className="sm:col-span-2">
          <AuthField icon={LockKeyhole} id="password" label="Password *" value={password} onChange={setPassword} placeholder="Minimal 8 karakter" type="password" autoComplete="new-password" required minLength={8} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className={authButtonClassName}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftarkan...</> : 'Kirim pendaftaran sekolah'}
          </button>
          <p className="mt-4 text-center text-xs leading-5 text-[#6d786f]">
            Dengan mendaftar, Anda menyatakan data sekolah yang diberikan sudah benar.
          </p>
        </div>
      </form>

      <p className="mt-6 border-t border-[#17211b]/10 pt-6 text-center text-sm text-[#5c675f]">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-black text-[#26735d] hover:text-[#173f35]">Login</Link>
      </p>
    </AuthShell>
  );
}

interface AuthFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}

function AuthField({ icon: Icon, id, label, value, onChange, placeholder, type = 'text', ...props }: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#354139]">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#7b857e]" />
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`${authFieldClassName} pl-11`} placeholder={placeholder} {...props} />
      </div>
    </div>
  );
}
