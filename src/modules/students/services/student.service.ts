import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Student, StudentFormData } from '../types/student.types';
import { assertSchoolFeature } from '@/shared/services/plan-guard';
import { isOfflineError } from '@/modules/offline/services/network';

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
    // Only fall back to offline queueing on genuine network errors. Duplicate NIS,
    // RLS denials, and validation errors must be thrown to the caller instead.
    if (!isOfflineError(error)) throw error;

    const { db } = await import('@/modules/offline/db');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw error;

    const localId = crypto.randomUUID();
    const localStudent: Student = {
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
    };
    await db.students.add(localStudent);

    await db.sync_queue.add({
      school_id: student.school_id,
      user_id: session.user.id,
      entity: 'student',
      entity_id: localId,
      action: 'INSERT',
      payload: {
        id: localId,
        school_id: student.school_id,
        nis: student.nis,
        name: student.name,
        class: student.class,
        gender: student.gender || null,
        address: student.address || null,
        parent_name: student.parent_name || null,
        parent_phone: student.parent_phone || null,
        status: student.status || 'active',
      },
      attempts: 0,
      status: 'pending',
      created_at: new Date(),
    });

    return localStudent;
  }

  return data;
}

export async function updateStudent(
  id: string,
  updates: Partial<StudentFormData>
): Promise<Student> {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase
    .from('students')
    .select('school_id')
    .eq('id', id)
    .single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'students');
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { data: current } = await supabase
    .from('students')
    .select('school_id')
    .eq('id', id)
    .single();
  if (current?.school_id) await assertSchoolFeature(current.school_id, 'students');
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

export async function importFromCSV(
  schoolId: string,
  records: StudentFormData[]
): Promise<{ imported: number; failed: number }> {
  await assertSchoolFeature(schoolId, 'student_import');
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc('import_students', {
    target_school_id: schoolId,
    records,
  });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { imported: result?.imported ?? 0, failed: result?.failed ?? records.length };
}
