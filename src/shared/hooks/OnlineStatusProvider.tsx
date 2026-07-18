'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OnlineStatusContextType {
  online: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({ online: true });

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ online }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus(): boolean {
  const { online } = useContext(OnlineStatusContext);
  return online;
}

export function OnlineStatusConsumer({ children }: { children: (online: boolean) => ReactNode }) {
  const { online } = useContext(OnlineStatusContext);
  return <>{children(online)}</>;
}