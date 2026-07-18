'use client';

import * as React from 'react';

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function Toaster() {
  // Minimal stub; replace with actual toast provider when UI library is wired up
  return null;
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastProps) => {
      if (typeof window !== 'undefined') {
        console.log('[toast]', variant, title, description);
      }
    },
  };
}
