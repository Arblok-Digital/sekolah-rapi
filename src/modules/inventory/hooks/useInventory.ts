'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventory, createInventory, updateInventory, deleteInventory } from '../services/inventory.service';
import type { InventoryFormInput } from '../types/inventory.types';

export function useInventory(schoolId: string, category?: string) {
  return useQuery({
    queryKey: ['inventory', schoolId, category],
    queryFn: () => getInventory(schoolId, category),
    enabled: !!schoolId,
  });
}

export function useCreateInventory(schoolId: string, userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InventoryFormInput) => createInventory(schoolId, input, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', schoolId] }),
  });
}

export function useUpdateInventory(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<InventoryFormInput> }) => updateInventory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', schoolId] }),
  });
}

export function useDeleteInventory(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', schoolId] }),
  });
}
