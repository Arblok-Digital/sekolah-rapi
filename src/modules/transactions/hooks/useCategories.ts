'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryInput,
  type CategoryUpdates,
} from '../services/category.service';

export function useCategories(schoolId: string, type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', schoolId, type],
    queryFn: () => getCategories(schoolId, type),
    enabled: !!schoolId,
  });
}

export function useCreateCategory(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(schoolId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories', schoolId] }),
  });
}

export function useUpdateCategory(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CategoryUpdates }) =>
      updateCategory(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories', schoolId] }),
  });
}

export function useDeleteCategory(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories', schoolId] }),
  });
}
