'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from '../services/enrollment.service';
import type { EnrollmentStatus } from '../types/enrollment.types';

const ENROLLMENT_KEYS = {
  all: ['enrollments'] as const,
  list: (schoolId: string, status?: string) =>
    ['enrollments', 'list', schoolId, status] as const,
};

/**
 * Hook: fetch enrollment requests for a school.
 */
export function useEnrollments(schoolId: string, status?: EnrollmentStatus) {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.list(schoolId, status),
    queryFn: () => getEnrollments(schoolId, status),
    enabled: !!schoolId,
  });
}

/**
 * Hook: approve an enrollment (auto-creates student).
 */
export function useApproveEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, adminId }: { enrollmentId: string; adminId: string }) =>
      approveEnrollment(enrollmentId, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.all });
      // Also invalidate students list
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Hook: reject an enrollment.
 */
export function useRejectEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, adminId, notes }: { enrollmentId: string; adminId: string; notes?: string }) =>
      rejectEnrollment(enrollmentId, adminId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.all });
    },
  });
}
