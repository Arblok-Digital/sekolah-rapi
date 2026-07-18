'use client';

import { useAuth } from '@/shared/providers/AuthProvider';
import { Clock, Mail, Phone } from 'lucide-react';

export default function PendingApprovalPage() {
  const { profile, school, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-glow-lg pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center animate-fade-in">
        <div className="glass rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Menunggu Persetujuan</h1>
          <p className="text-white/50 text-sm mb-6">
            Akun sekolah <span className="text-white font-medium">{school?.name || 'Anda'}</span>{' '}
            sedang dalam proses verifikasi oleh tim kami.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Yang perlu dilakukan:</p>
            <ul className="text-sm text-white/60 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">1.</span>
                Tim kami akan menghubungi Anda dalam 1-2 hari kerja
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">2.</span>
                Pastikan nomor WhatsApp dan email aktif
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">3.</span>
                Setelah disetujui, Anda bisa langsung menggunakan dashboard
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-sm text-white/40">
            <p className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {profile?.email || '-'}
            </p>
            {profile?.phone && (
              <p className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                {profile.phone}
              </p>
            )}
          </div>

          <button
            onClick={signOut}
            className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
