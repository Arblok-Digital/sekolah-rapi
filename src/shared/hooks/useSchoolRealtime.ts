'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createSupabaseClient } from '@/shared/services/supabase/client';

interface UseSchoolRealtimeOptions {
  tables: string[];
  onEvent?: () => void;
  enabled?: boolean;
}

/**
 * Subscribe a panel to Supabase realtime for one school. On any change in the
 * given tables (scoped to school_id), refetches react-query caches and calls
 * onEvent (for pages that manage their own state, e.g. students/transactions).
 */
export function useSchoolRealtime(
  schoolId: string | null | undefined,
  { tables, onEvent, enabled = true }: UseSchoolRealtimeOptions
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!schoolId || !enabled || tables.length === 0) return;

    const tableKey = tables.join(':');
    const supabase = createSupabaseClient();
    const channel = supabase.channel(`realtime-${schoolId}-${tableKey}`);

    for (const table of tables) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `school_id=eq.${schoolId}` },
        () => {
          onEvent?.();
          queryClient.invalidateQueries();
        }
      );
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, enabled, tables.join(':')]);
}