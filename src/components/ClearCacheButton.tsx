'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { useRouter } from 'next/navigation';

// Clear cache helper
function clearCache() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Clear Next.js cache (if any)
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Force reload
    window.location.reload();
  }
}

export default function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearCache = async () => {
    setIsClearing(true);
    clearCache();
    
    // Give it a moment to clear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to login after clearing
    router.push('/login');
  };

  return (
    <button
      onClick={handleClearCache}
      disabled={isClearing}
      className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
    >
      {isClearing ? 'Membersihkan...' : 'Bersihkan Cache'}
    </button>
  );
}