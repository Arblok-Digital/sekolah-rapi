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

export const CLASS_OPTIONS = [
  'TK A', 'TK B',
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B',
  '7A', '7B', '8A', '8B', '9A', '9B',
  '10A', '10B', '11A', '11B', '12A', '12B',
];
