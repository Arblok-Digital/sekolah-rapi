'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getPayroll, createPayroll, updatePayroll, deletePayroll, generatePayroll } from '../services/payroll.service';
import type { EmployeeFormInput, PayrollFormInput } from '../types/payroll.types';

// ── Employees ──
export function useEmployees(schoolId: string) {
  return useQuery({ queryKey: ['employees', schoolId], queryFn: () => getEmployees(schoolId), enabled: !!schoolId });
}
export function useCreateEmployee(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: EmployeeFormInput) => createEmployee(schoolId, input), onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', schoolId] }) });
}
export function useUpdateEmployee(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<EmployeeFormInput> }) => updateEmployee(id, input), onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', schoolId] }) });
}
export function useDeleteEmployee(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteEmployee(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees', schoolId] }); qc.invalidateQueries({ queryKey: ['payroll', schoolId] }); } });
}

// ── Payroll ──
export function usePayroll(schoolId: string, month?: number, year?: number) {
  return useQuery({ queryKey: ['payroll', schoolId, month, year], queryFn: () => getPayroll(schoolId, month, year), enabled: !!schoolId });
}
export function useCreatePayroll(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: PayrollFormInput) => createPayroll(schoolId, input), onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', schoolId] }) });
}
export function useUpdatePayroll(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<PayrollFormInput> }) => updatePayroll(id, input), onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', schoolId] }) });
}
export function useDeletePayroll(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deletePayroll(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', schoolId] }) });
}
export function useGeneratePayroll(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ month, year }: { month: number; year: number }) => generatePayroll(schoolId, month, year), onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll', schoolId] }) });
}
