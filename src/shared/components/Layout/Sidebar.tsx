'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { cn } from '@/shared/utils/cn';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Banknote,
  Package,
  ClipboardList,
  FileText,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Shield,
  UserPlus,
} from 'lucide-react';
import { APP_NAME, POWERED_BY } from '@/shared/constants';

const navLinks = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/students', label: 'Siswa', icon: Users },
  { href: '/enrollment', label: 'Pendaftar', icon: UserPlus },
  { href: '/spp', label: 'SPP', icon: Wallet },
  { href: '/transactions', label: 'Kas', icon: Banknote },
  { href: '/inventory', label: 'Inventaris', icon: Package },
  { href: '/payroll', label: 'Penggajian', icon: ClipboardList },
  { href: '/reports', label: 'Laporan', icon: FileText },
];

const devLinks = [
  { href: '/dev/admin', label: 'Dev Panel', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDev, signOut, profile, school } = useAuth();

  const allLinks = isDev ? [...navLinks, ...devLinks] : navLinks;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-lg hover:bg-white/5 transition-all duration-200"
        aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
      >
        {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#16162a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
            SR
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{APP_NAME}</h1>
            <p className="text-[10px] text-white/30">Powered by {POWERED_BY}</p>
          </div>
        </div>

        {/* School info */}
        {school && (
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-xs text-white/30">Sekolah</p>
            <p className="text-sm text-white/70 font-medium truncate">{school.name}</p>
            {isDev && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-medium">
                <Shield className="w-2.5 h-2.5" /> DEV MODE
              </span>
            )}
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {allLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/5 p-3 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs text-white/30">Login sebagai</p>
            <p className="text-sm text-white/70 font-medium">{profile?.name || 'User'}</p>
            <p className="text-[10px] text-white/30">{profile?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
