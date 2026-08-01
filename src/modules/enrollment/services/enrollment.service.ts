import { createSupabaseClient } from '@/shared/services/supabase/client';
import type { EnrollmentRequest, EnrollmentFormInput } from '../types/enrollment.types';
import { assertSchoolFeature } from '@/shared/services/plan-guard';

const TABLE = 'enrollment_requests';

/**
 * Submit enrollment (public — no auth required).
 */
export async function submitEnrollment(
  schoolId: string,
  input: EnrollmentFormInput
): Promise<EnrollmentRequest> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc('submit_enrollment', {
    target_school_id: schoolId,
    enrollment: {
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
    },
  });

  if (error) throw new Error(error.message);
  const result = Array.isArray(data) ? data[0] : data;
  return result as EnrollmentRequest;
}

/**
 * Get all enrollment requests for a school.
 */
export async function getEnrollments(
  schoolId: string,
  status?: string
): Promise<EnrollmentRequest[]> {
  await assertSchoolFeature(schoolId, 'enrollment');
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
  const { error } = await supabase.rpc('approve_enrollment', {
    target_enrollment_id: enrollmentId,
    admin_id: adminId,
  });
  if (error) throw new Error('Gagal menyetujui pendaftaran: ' + error.message);
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
  const { error } = await supabase.rpc('reject_enrollment', {
    target_enrollment_id: enrollmentId,
    admin_id: adminId,
    notes: notes || null,
  });
  if (error) throw new Error('Gagal menolak pendaftaran: ' + error.message);
}
