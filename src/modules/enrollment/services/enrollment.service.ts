import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { EnrollmentRequest, EnrollmentFormInput } from '../types/enrollment.types';

const TABLE = 'enrollment_requests';

/**
 * Submit enrollment (public — no auth required).
 */
export async function submitEnrollment(
  schoolId: string,
  input: EnrollmentFormInput
): Promise<EnrollmentRequest> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      school_id: schoolId,
      student_name: input.student_name,
      nis: input.nis || null,
      class: input.class,
      gender: input.gender || null,
      address: input.address || null,
      birth_date: input.birth_date || null,
      birth_place: input.birth_place || null,
      parent_name: input.parent_name,
      parent_phone: input.parent_phone,
      parent_email: input.parent_email || null,
      parent_occupation: input.parent_occupation || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EnrollmentRequest;
}

/**
 * Get all enrollment requests for a school.
 */
export async function getEnrollments(
  schoolId: string,
  status?: string
): Promise<EnrollmentRequest[]> {
  const supabase = createSupabaseClient();

  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as EnrollmentRequest[];
}

/**
 * Approve an enrollment → auto-create student.
 */
export async function approveEnrollment(
  enrollmentId: string,
  adminId: string
): Promise<void> {
  const supabase = createSupabaseClient();

  // 1. Fetch enrollment data
  const { data: enrollment, error: fetchError } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', enrollmentId)
    .single();

  if (fetchError || !enrollment) throw new Error('Enrollment not found');

  // 2. Create student record
  const { error: studentError } = await supabase
    .from('students')
    .insert({
      school_id: enrollment.school_id,
      nis: enrollment.nis || null,
      name: enrollment.student_name,
      class: enrollment.class,
      gender: enrollment.gender || null,
      address: enrollment.address || null,
      parent_name: enrollment.parent_name,
      parent_phone: enrollment.parent_phone,
      status: 'active',
    });

  if (studentError) throw new Error('Gagal membuat data siswa: ' + studentError.message);

  // 3. Update enrollment status
  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      status: 'approved',
      processed_by: adminId,
      processed_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (updateError) throw new Error('Gagal update status: ' + updateError.message);
}

/**
 * Reject an enrollment request.
 */
export async function rejectEnrollment(
  enrollmentId: string,
  adminId: string,
  notes?: string
): Promise<void> {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from(TABLE)
    .update({
      status: 'rejected',
      admin_notes: notes || null,
      processed_by: adminId,
      processed_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId);

  if (error) throw new Error('Gagal update status: ' + error.message);
}
