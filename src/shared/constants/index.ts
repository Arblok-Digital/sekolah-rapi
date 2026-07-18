export const APP_NAME = 'SekolahRapi';
export const POWERED_BY = 'Arblok Digital';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sekolah-rapi.vercel.app';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  PRINCIPAL: 'principal',
  TREASURER: 'treasurer',
  STAFF: 'staff',
} as const;

export const PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  LIFETIME: 'lifetime',
} as const;

export const DEFAULT_CATEGORIES = {
  income: [
    { name: 'SPP', description: 'Pembayaran SPP bulanan' },
    { name: 'Donasi', description: 'Donasi dari alumni/umum' },
    { name: 'Subsidi', description: 'Subsidi pemerintah/yayasan' },
  ],
  expense: [
    { name: 'Gaji Guru', description: 'Penggajian guru dan staff' },
    { name: 'Operasional', description: 'Biaya operasional harian' },
    { name: 'ATK', description: 'Alat tulis kantor' },
    { name: 'Listrik/Water', description: 'Utilitas' },
    { name: 'Perbaikan', description: 'Perbaikan gedung/alat' },
  ],
} as const;
