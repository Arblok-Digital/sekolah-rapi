'use client';

import { useState } from 'react';
import { signIn } from '@/modules/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a0818] flex">
      {/* Left Panel: Branded */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#12102b] to-[#0a0818] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,92,255,0.1)_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 w-full">
          <Link href="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7c5cff]/25">
              SR
            </div>
            <span className="text-xl font-bold text-white">SekolahRapi</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4">Kelola Keuangan Sekolah dengan Mudah</h1>
          <p className="text-white/70 leading-relaxed">
            SPP, kas, inventaris, dan laporan keuangan — semuanya dalam satu platform. Offline-ready dan real-time.
          </p>
          {/* Abstract illustration placeholder */}
          <div className="mt-8 opacity-30">
            <svg viewBox="0 0 400 200" className="w-full h-auto">
              <path d="M50 150 Q 100 100 150 120 T 350 100" stroke="#7c5cff" strokeWidth="2" fill="none" />
              <circle cx="100" cy="120" r="4" fill="#22c98e" />
              <circle cx="200" cy="100" r="4" fill="#7c5cff" />
              <circle cx="300" cy="110" r="4" fill="#5b3df0" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 lg:w-7/12 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7c5cff]/25">
                SR
              </div>
              <span className="text-xl font-bold text-white">SekolahRapi</span>
            </Link>
          </div>

          <div className="bg-[#15122f] rounded-2xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold text-white mb-2">Selamat Datang Kembali</h1>
            <p className="text-white/70 text-sm mb-8">Masuk untuk mengakses dashboard sekolah Anda</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1c1836] border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7c5cff]/50 transition-all duration-200"
                  placeholder="nama@sekolah.sch.id"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1c1836] border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7c5cff]/50 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-[#7c5cff]/30 hover:shadow-[#6a4aff]/40 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-white/70">
                Belum punya akun?{' '}
                <Link href="/register" className="text-[#7c5cff] hover:text-[#6a4aff] font-medium transition-colors">
                  Daftar Sekolah
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}