'use client';

import { useState } from 'react';
import { signIn } from '@/modules/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import {
  AuthShell,
  authButtonClassName,
  authFieldClassName,
} from '@/shared/components/Auth/AuthShell';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email atau password salah'
        : error.message
      );
      setLoading(false);
      return;
    }

    router.refresh();
    router.push('/overview');
  };

  return (
    <AuthShell
      compact
      eyebrow="Akses ruang kerja"
      title="Selamat datang kembali."
      description="Masuk menggunakan akun sekolah untuk melanjutkan pekerjaan tim Anda."
    >
      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-bold text-[#354139]">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#7b857e]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${authFieldClassName} pl-11`}
              placeholder="nama@sekolah.sch.id"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-bold text-[#354139]">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-[#7b857e]" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${authFieldClassName} pl-11`}
              placeholder="Masukkan password"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className={authButtonClassName}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : 'Masuk ke dashboard'}
        </button>
      </form>

      <p className="mt-7 border-t border-[#17211b]/10 pt-6 text-center text-sm text-[#5c675f]">
        Belum punya akun?{' '}
        <Link href="/register" className="font-black text-[#26735d] hover:text-[#173f35]">
          Daftar sekolah
        </Link>
      </p>
    </AuthShell>
  );
}