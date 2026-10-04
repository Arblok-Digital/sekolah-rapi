'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import {
  getSPPPayments,
  createSPPPayment,
  getOutstanding,
  getStudentSPPPayments,
  getUnpaidPayments,
  getSPPSummary,
  updateSPPPayment,
  deleteSPPPayment,
  bulkCreateSPPPayments,
  bulkMarkPaidSPP,
  backfillMissingSPPTransactions,
} from '../services/spp.service';
import type { SPPFilter, SPPFormInput, SPPPayment } from '../types/spp.types';

/** Satu event cicilan yang tercatat di Kas (transaksi terkait satu baris bayar). */
export interface InstallmentEvent {
  paymentId: string;
  amount: number;
  date: string;
}

const SPP_KEYS = {
  all: ['spp'] as const,
  list: (schoolId: string, filter?: SPPFilter) =>
    ['spp', 'list', schoolId, filter] as const,
  outstanding: (schoolId: string, month?: number, year?: number) =>
    ['spp', 'outstanding', schoolId, month, year] as const,
  summary: (schoolId: string, month?: number, year?: number, category?: string) =>
    ['spp', 'summary', schoolId, month, year, category] as const,
};

/**
 * Hook: fetch SPP payments list with optional filters.
 */
export function useSPPPayments(schoolId: string, filter?: SPPFilter) {
  return useQuery({
    queryKey: SPP_KEYS.list(schoolId, filter),
    queryFn: () => getSPPPayments(schoolId, filter),
    enabled: !!schoolId,
  });
}

/**
 * Hook: fetch outstanding SPP payments.
 */
export function useOutstandingSPP(schoolId: string, month?: number, year?: number) {
  return useQuery({
    queryKey: SPP_KEYS.outstanding(schoolId, month, year),
    queryFn: () => getOutstanding(schoolId, month, year),
    enabled: !!schoolId,
  });
}

/**
 * Hook: semua tagihan/pembayaran milik 1 siswa lintas kategori —
 * bahan Kartu Keuangan Siswa (apa yang sudah/belum dibayar).
 */
export function useStudentFinance(schoolId: string, studentId: string | null) {
  return useQuery({
    queryKey: ['spp', 'student', schoolId, studentId],
    queryFn: () => getStudentSPPPayments(schoolId, studentId as string),
    enabled: !!schoolId && !!studentId,
  });
}

/**
 * Hook: riwayat cicilan per baris pembayaran — setiap transaksi pemasukan
 * yang pernah dibuat dari baris itu (source_type='spp', source_id=baris),
 * tanpa pasangan koreksi. Dipakai Kartu Keuangan Siswa.
 */
export function usePaymentInstallments(schoolId: string, payments?: SPPPayment[]) {
  const idsKey = payments?.map((p) => p.id).join(',') ?? '';
  return useQuery({
    queryKey: ['spp', 'installments', schoolId, idsKey],
    enabled: !!schoolId && !!idsKey,
    queryFn: async (): Promise<InstallmentEvent[]> => {
      const supabase = createSupabaseClient();
      const paymentIds = idsKey.split(',').filter(Boolean);

      const { data: incomeTx, error } = await supabase
        .from('transactions')
        .select('id, amount, reference_date, source_id, created_at')
        .eq('school_id', schoolId)
        .eq('source_type', 'spp')
        .in('source_id', paymentIds)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const txIds = (incomeTx ?? []).map((t) => t.id);
      const reversed = new Set<string>();
      if (txIds.length > 0) {
        const { data: rev } = await supabase
          .from('transactions')
          .select('source_id')
          .eq('school_id', schoolId)
          .eq('source_type', 'reversal')
          .in('source_id', txIds);
        (rev ?? []).forEach((r) => reversed.add(r.source_id as string));
      }

      return (incomeTx ?? [])
        .filter((t) => !reversed.has(t.id))
        .map((t) => ({
          paymentId: t.source_id as string,
          amount: Number(t.amount) || 0,
          date: t.reference_date,
        }));
    },
  });
}

/**
 * Hook: fetch siswa yang belum bayar untuk suatu periode (konsisten Overview).
 */
export function useUnpaidSPP(
  schoolId: string,
  options?: { month?: number; year?: number; classFilter?: string; category?: string }
) {
  return useQuery({
    queryKey: ['spp', 'unpaid', schoolId, options?.month, options?.year, options?.classFilter, options?.category] as const,
    queryFn: () => getUnpaidPayments(schoolId, options),
    enabled: !!schoolId,
  });
}

/**
 * Hook: fetch SPP summary (collection rate, counts).
 */
export function useSPPSummary(schoolId: string, month?: number, year?: number, category?: string) {
  return useQuery({
    queryKey: SPP_KEYS.summary(schoolId, month, year, category),
    queryFn: () => getSPPSummary(schoolId, month, year, category),
    enabled: !!schoolId,
  });
}

/**
 * Hook: create a new SPP payment.
 */
export function useCreateSPPPayment(schoolId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SPPFormInput) =>
      createSPPPayment(schoolId, userId, input),
    onSuccess: () => {
      // Invalidate all SPP queries to refresh the list
      queryClient.invalidateQueries({ queryKey: SPP_KEYS.all });
    },
  });
}

/**
 * Hook: update an existing SPP payment.
 */
export function useUpdateSPPPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SPPFormInput> }) =>
      updateSPPPayment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPP_KEYS.all });
    },
  });
}

/**
 * Hook: delete an SPP payment.
 */
export function useDeleteSPPPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSPPPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPP_KEYS.all });
    },
  });
}

/**
 * Hook: sinkronkan pembayaran lunas yang belum tercatat ke Kas.
 */
export function useBackfillSPPTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schoolId,
      userId,
    }: {
      schoolId: string;
      userId: string;
    }) => backfillMissingSPPTransactions(schoolId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPP_KEYS.all });
    },
  });
}

/**
 * Hook: bulk-generate unpaid bills for all active students in a period.
 */
export function useBulkCreateSPPPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      schoolId,
      userId,
      params,
    }: {
      schoolId: string;
      userId: string;
      params: { month: number; year: number; amount: number };
    }) => bulkCreateSPPPayments(schoolId, userId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPP_KEYS.all });
    },
  });
}

export function useBulkMarkPaidSPP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      userId,
      month,
      year,
    }: {
      schoolId: string;
      userId: string;
      month: number;
      year: number;
    }) => bulkMarkPaidSPP(schoolId, userId, { month, year }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SPP_KEYS.all }),
  });
}
