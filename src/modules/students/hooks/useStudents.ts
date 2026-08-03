'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Student, StudentFormData } from '../types/student.types';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../services/student.service';

const supabase = createSupabaseClient();

interface UseStudentsOptions {
  schoolId: string;
  classFilter?: string;
  statusFilter?: string;
  searchQuery?: string;
}

export function useStudents({
  schoolId,
  classFilter,
  statusFilter,
  searchQuery,
}: UseStudentsOptions) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStudents(schoolId, {
        class: classFilter,
        status: statusFilter,
        search: searchQuery,
      });
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  }, [schoolId, classFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (formData: StudentFormData) => {
    const created = await createStudent({
      ...formData,
      school_id: schoolId,
    });
    await fetchStudents();
    return created;
  };

  const editStudent = async (id: string, formData: StudentFormData) => {
    const updated = await updateStudent(id, formData);
    await fetchStudents();
    return updated;
  };

  const removeStudent = async (id: string) => {
    await deleteStudent(id);
    await fetchStudents();
  };

  return {
    students,
    loading,
    error,
    addStudent,
    editStudent,
    removeStudent,
    refresh: fetchStudents,
  };
}
