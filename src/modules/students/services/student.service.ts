import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Student, StudentFormData } from '../types/student.types';

export async function getStudents(
  schoolId: string,
  options?: {
    class?: string;
    status?: string;
    search?: string;
  }
): Promise<Student[]> {
  const supabase = createSupabaseClient();
  let query = supabase
    .from('students')
    .select('*')
    .eq('school_id', schoolId)
    .order('name');

  if (options?.class) {
    query = query.eq('class', options.class);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,nis.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createStudent(
  student: StudentFormData & { school_id: string }
): Promise<Student> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('students')
    .insert({
      school_id: student.school_id,
      nis: student.nis,
      name: student.name,
      class: student.class,
      gender: student.gender || null,
      address: student.address || null,
      parent_name: student.parent_name || null,
      parent_phone: student.parent_phone || null,
      status: student.status || 'active',
    })
    .select()
    .single();

  if (error) {
    // Offline fallback: store locally and queue (lazy import to avoid Node detection)
    const { db } = await import('@/modules/offline/db');
    const localId = crypto.randomUUID();
    await db.students.add({
      id: localId,
      school_id: student.school_id,
      nis: student.nis,
      name: student.name,
      class: student.class,
      gender: student.gender,
      address: student.address,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      status: student.status || 'active',
      created_at: new Date().toISOString(),
    });

    await db.sync_queue.add({
      school_id: student.school_id,
      user_id: crypto.randomUUID(), // placeholder UUID for FK constraint
      entity: 'student',
      entity_id: localId,
      action: 'INSERT',
      payload: student,
      attempts: 0,
      status: 'pending',
      created_at: new Date(),
    });

    return db.students.get(localId) as Promise<Student>;
  }

  return data;
}

export async function importFromCSV(
  schoolId: string,
  records: StudentFormData[]
): Promise<{ imported: number; failed: number }> {
  let imported = 0;
  let failed = 0;

  for (const record of records) {
    try {
      await createStudent({ ...record, school_id: schoolId });
      imported++;
    } catch {
      failed++;
    }
  }

  return { imported, failed };
}
