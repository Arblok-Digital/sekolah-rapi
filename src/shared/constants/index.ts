export const APP_NAME = 'SekolahRapi';
export const POWERED_BY = 'Arblok Digital';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sekolah-rapi.vercel.app';

// Kelas jenjang SD-SMA (SekolahRapi untuk SD sampai SMA)
export const CLASS_OPTIONS = [
  'TK A', 'TK B',
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B',
  '7A', '7B', '8A', '8B', '9A', '9B',
  '10A', '10B', '11A', '11B', '12A', '12B',
];

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
