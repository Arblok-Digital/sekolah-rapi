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
  Tags,
  Package,
  ClipboardList,
  FileText,
  History,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Shield,
  UserPlus,
  LockKeyhole,
} from 'lucide-react';
import { APP_NAME, POWERED_BY } from '@/shared/constants';
import { type Feature } from '@/shared/entitlements';

const navLinks = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard, feature: 'dashboard' as Feature },
  { href: '/students', label: 'Siswa', icon: Users, feature: 'students' as Feature },
  { href: '/enrollment', label: 'Pendaftar', icon: UserPlus, feature: 'enrollment' as Feature },
  { href: '/spp', label: 'SPP', icon: Wallet, feature: 'spp' as Feature },
  { href: '/transactions', label: 'Kas', icon: Banknote, feature: 'transactions' as Feature },
  { href: '/categories', label: 'Kategori', icon: Tags, feature: 'transactions' as Feature },
  { href: '/inventory', label: 'Inventaris', icon: Package, feature: 'inventory' as Feature },
  { href: '/payroll', label: 'Penggajian', icon: ClipboardList, feature: 'payroll' as Feature },
  { href: '/reports', label: 'Laporan', icon: FileText, feature: 'reports' as Feature },
  { href: '/audit', label: 'Riwayat Kas', icon: History, feature: 'reports' as Feature },
];

const devLinks = [
  { href: '/dev/admin', label: 'Dev Panel', icon: Shield },
];

const mobilePrimaryLinks = navLinks.filter((link) =>
  ['/overview', '/students', '/spp', '/transactions'].includes(link.href)
);

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDev, signOut, profile, school, canUse } = useAuth();

  // Paid features stay discoverable. Opening a locked route shows EntitlementGate;
  // Supabase remains the actual enforcement boundary.
  const allLinks = [...navLinks, ...(isDev ? devLinks : [])];

  return (
    <>
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
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#173f35] transition-transform duration-300 ease-in-out lg:static',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black text-[#173f35] shadow-[0_4px_0_#b8d44b]">
            SR
          </div>
          <div>
            <h1 className="text-sm font-black text-white">{APP_NAME}</h1>
            <p className="text-[10px] text-white/50">Powered by {POWERED_BY}</p>
          </div>
        </div>

        {/* School info */}
        {school && (
          <div className="border-b border-white/10 px-5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#dfe99a]">Sekolah</p>
            <p className="mt-1 truncate text-sm font-bold text-white/80">{school.name}</p>
            {isDev && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-medium">
                <Shield className="w-2.5 h-2.5" /> DEV MODE
              </span>
            )}
          </div>
        )}

        {/* Upgrade banner for free plan */}
        {school && !isDev && school.plan !== 'pro' && school.plan !== 'lifetime' && (
          <div className="mx-3 my-3 rounded-xl border border-[#dfe99a]/25 bg-[#dfe99a]/10 p-3">
            <p className="mb-2 text-xs text-white/60">Paket saat ini</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[#dfe99a]">{school.plan === 'basic' ? 'Basic' : 'Gratis'}</span>
              <Link
                href="/pricing"
                className="text-xs font-bold text-white hover:text-[#dfe99a] transition-colors"
              >
                Upgrade →
              </Link>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-[#b8d44b]" />
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {allLinks.map((link) => {
            const isActive = isActiveRoute(pathname, link.href);
            const Icon = link.icon;
            const feature = 'feature' in link ? link.feature as Feature : null;
            const isLocked = feature !== null && !isDev && !canUse(feature);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border border-[#dfe99a]/20 bg-[#dfe99a]/15 text-[#eaf2b8]'
                    : isLocked
                      ? 'text-white/45 hover:bg-white/10 hover:text-white/80'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
                {isLocked ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#dfe99a]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#dfe99a]">
                    <LockKeyhole className="h-2.5 w-2.5" /> Upgrade
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3 h-3 ml-auto" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/5 p-3 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs text-white/70">Login sebagai</p>
            <p className="text-sm text-white/70 font-medium">{profile?.name || 'User'}</p>
            <p className="text-[10px] text-white/70">{profile?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* App-like primary navigation for small screens. The drawer keeps secondary tools available. */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#173f35]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_rgba(0,0,0,.28)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobilePrimaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveRoute(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition-colors',
                  isActive ? 'bg-[#dfe99a]/15 text-[#eaf2b8]' : 'text-white/55 active:bg-white/10 active:text-white'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-[#dfe99a]')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className={cn(
              'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition-colors',
              mobileOpen || !mobilePrimaryLinks.some((link) => isActiveRoute(pathname, link.href))
                ? 'bg-[#dfe99a]/15 text-[#eaf2b8]'
                : 'text-white/55 active:bg-white/10 active:text-white'
            )}
            aria-label={mobileOpen ? 'Tutup menu lainnya' : 'Buka menu lainnya'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5 text-[#dfe99a]" /> : <Menu className="h-5 w-5" />}
            <span>Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
