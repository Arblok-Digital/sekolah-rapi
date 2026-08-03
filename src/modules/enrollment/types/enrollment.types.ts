import { CLASS_OPTIONS } from '@/shared/constants';

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

export interface EnrollmentRequest {
  id: string;
  school_id: string;
  student_name: string;
  nis?: string;
  class: string;
  gender?: string;
  address?: string;
  birth_date?: string;
  birth_place?: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  parent_occupation?: string;
  documents?: { type: string; url: string }[];
  status: EnrollmentStatus;
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentFormInput {
  student_name: string;
  nis?: string;
  class: string;
  gender?: string;
  address?: string;
  birth_date?: string;
  birth_place?: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  parent_occupation?: string;
}

export { CLASS_OPTIONS };
