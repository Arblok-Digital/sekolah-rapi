'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSPPPayments,
  createSPPPayment,
  getOutstanding,
  getUnpaidPayments,
  getSPPSummary,
  updateSPPPayment,
  deleteSPPPayment,
  bulkCreateSPPPayments,
  bulkMarkPaidSPP,
  backfillMissingSPPTransactions,
} from '../services/spp.service';
import type { SPPFilter, SPPFormInput, SPPPayment } from '../types/spp.types';

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
