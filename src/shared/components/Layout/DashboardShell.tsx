'use client';

import { Sidebar } from '@/shared/components/Layout/Sidebar';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardShellProps {
  children: React.ReactNode;
  schoolName?: string;
  userName?: string;
  userRole?: string;
}

export function DashboardShell({ children, schoolName, userName, userRole }: DashboardShellProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div className="dashboard-shell flex min-h-screen bg-[#101c18]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#173f35]/90 px-4 backdrop-blur-xl lg:px-7">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="max-w-[200px] truncate text-sm font-black text-white lg:max-w-xs lg:text-base">
                {schoolName || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5">
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden text-xs font-bold text-white/70 sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#dfe99a] text-sm font-black text-[#173f35]">
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-sm leading-tight">
                <div className="max-w-[120px] truncate font-bold text-white/90">
                  {userName || 'User'}
                </div>
                <div className="text-xs capitalize text-white/55">{userRole || 'staff'}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_90%_0%,rgba(184,212,75,.08),transparent_25%)] p-4 pb-24 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
