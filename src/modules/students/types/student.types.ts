import type { Student as SharedStudent } from '@/shared/types';

// Re-export shared Student type for module-level access
export type Student = SharedStudent;

// Form-specific types
export interface StudentFormData {
  nis: string;
  name: string;
  class: string;
  gender?: string;
  address?: string;
  parent_name?: string;
  parent_phone?: string;
  status?: 'active' | 'graduated' | 'transferred';
}
