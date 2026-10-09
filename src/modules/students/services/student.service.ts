import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { Student, StudentFormData } from '../types/student.types';
import { assertSchoolFeature } from '@/shared/services/plan-guard';
import { isOfflineError } from '@/modules/offline/services/network';
import { withOfflineFallback } from '@/modules/offline/services/read';
import { mirrorFull } from '@/modules/offline/services/mirror';
import { getDeviceId } from '@/modules/offline/services/device';
import { queueWrite, queueLocalDelete, getQueueUserId } from '@/modules/offline/services/queue';

export async function getStudents(
  schoolId: string,
  options?: {
    class?: string;
    status?: string;
    search?: string;
  }
): Promise<Student[]> {
  const supabase = createSupabaseClient();

  return withOfflineFallback(
    async () => {
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
      const rows = data ?? [];
      await mirrorFull('students', rows);
      return rows;
    },
    async () => {
      const { db } = await import('@/modules/offline/db');
      let rows = await db.students.where('school_id').equals(schoolId).toArray();
      if (options?.class) rows = rows.filter((r) => r.class === options.class);
      if (options?.status) rows = rows.filter((r) => r.status === options.status);
      if (options?.search) {
        const q = options.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.nis ?? '').toLowerCase().includes(q)
        );
      }
      rows.sort((a, b) => a.name.localeCompare(b.name));
      return rows;
    }
  );
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
      device_id: getDeviceId(),
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
    const nowIso = new Date().toISOString();
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
      created_at: nowIso,
      updated_at: nowIso,
      device_id: getDeviceId(),
    };
    await db.students.put(localStudent);

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
        device_id: getDeviceId(),
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

  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Partial<StudentFormData>;

  const { data, error } = await supabase
    .from('students')
    .update({ ...cleanUpdates, device_id: getDeviceId() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (!isOfflineError(error)) throw error;

    // ── OFFLINE: merge lokal + antrikan UPDATE ──
    const { db } = await import('@/modules/offline/db');
    const existing = await db.students.get(id);
    if (!existing) throw error;

    const userId = await getQueueUserId();
    const nowIso = new Date().toISOString();
    const merged: Student = {
      ...existing,
      ...cleanUpdates,
      updated_at: nowIso,
      device_id: getDeviceId(),
    };
    await db.students.put(merged);
    await queueWrite({
      school_id: existing.school_id,
      user_id: userId,
      entity: 'student',
      entity_id: id,
      action: 'UPDATE',
      payload: { ...cleanUpdates, id, school_id: existing.school_id, device_id: getDeviceId() },
    });
    return merged;
  }
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { data: current, error: fetchError } = await supabase
    .from('students')
    .select('school_id')
    .eq('id', id)
    .single();

  if (fetchError || !current?.school_id) {
    // Server tidak terjangkau / baris tidak ada di server → pakai mirror lokal.
    const { db } = await import('@/modules/offline/db');
    const local = await db.students.get(id);
    if (!local) {
      if (fetchError && !isOfflineError(fetchError)) throw fetchError;
      throw new Error('Siswa tidak ditemukan di server maupun penyimpanan lokal.');
    }
    await assertSchoolFeature(local.school_id, 'students');
    await queueLocalDelete('student', id, local.school_id);
    return;
  }

  await assertSchoolFeature(current.school_id, 'students');
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) {
    if (!isOfflineError(error)) throw error;
    await queueLocalDelete('student', id, current.school_id);
    return;
  }
  const { db } = await import('@/modules/offline/db');
  await db.students.delete(id);
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
