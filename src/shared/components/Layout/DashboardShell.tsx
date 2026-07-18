'use client';

import { Sidebar } from '@/shared/components/Layout/Sidebar';
import { cn } from '@/shared/utils/cn';
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
    <div className="min-h-screen bg-[#0f0f1a] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-[#16162a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="lg:hidden w-8" />
            <div>
              <h1 className="text-sm lg:text-base font-semibold text-white truncate max-w-[200px] lg:max-w-xs">
                {schoolName || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-xs text-white/40 hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-white/5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center text-indigo-300 font-semibold text-sm border border-white/5">
                {(userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-sm leading-tight">
                <div className="font-medium text-white/80 truncate max-w-[120px]">
                  {userName || 'User'}
                </div>
                <div className="text-xs text-white/30 capitalize">{userRole || 'staff'}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
