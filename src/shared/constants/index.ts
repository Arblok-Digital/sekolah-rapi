export const APP_NAME = 'SekolahRapi';
export const POWERED_BY = 'Arblok Digital';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sekolah-rapi.vercel.app';

// Kelas jenjang PAUD-SMA (SekolahRapi untuk PAUD sampai SMA)
export const CLASS_OPTIONS = [
  'KB', 'PAUD A', 'PAUD B',
  'TK A', 'TK B',
  '1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B', '5C', '6A', '6B', '6C',
  '7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C',
  '10A', '10B', '10C', '11A', '11B', '11C', '12A', '12B', '12C',
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
