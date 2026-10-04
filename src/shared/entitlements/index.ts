export type Plan = 'free' | 'basic' | 'pro' | 'lifetime';

export type Feature =
  | 'dashboard'
  | 'students'
  | 'spp'
  | 'transactions'
  | 'reports'
  | 'student_import'
  | 'enrollment'
  | 'realtime_dashboard'
  | 'payroll'
  | 'inventory';

const PLAN_RANK: Record<Plan, number> = { free: 0, basic: 1, pro: 2, lifetime: 3 };

export const FEATURE_DEFINITIONS: Record<Feature, { label: string; minimumPlan: Plan }> = {
  dashboard: { label: 'Dashboard', minimumPlan: 'free' },
  students: { label: 'Manajemen siswa', minimumPlan: 'free' },
  spp: { label: 'Keuangan Siswa', minimumPlan: 'free' },
  transactions: { label: 'Kas', minimumPlan: 'free' },
  reports: { label: 'Laporan', minimumPlan: 'basic' },
  student_import: { label: 'Import siswa Excel', minimumPlan: 'basic' },
  enrollment: { label: 'Pendaftaran siswa online', minimumPlan: 'pro' },
  realtime_dashboard: { label: 'Dashboard owner realtime', minimumPlan: 'pro' },
  payroll: { label: 'Penggajian', minimumPlan: 'pro' },
  inventory: { label: 'Inventaris', minimumPlan: 'pro' },
};

export const PLAN_DEFINITIONS = {
  free: {
    label: 'Gratis',
    price: 0,
  },
  basic: {
    label: 'Basic',
    price: 790000,
  },
  pro: {
    label: 'Pro',
    price: 1490000,
  },
  lifetime: {
    label: 'Lifetime',
    price: 0,
  },
} as const satisfies Record<Plan, { label: string; price: number }>;

export type PricingPlanDisplay = {
  plan: string;
  name: string;
  priceLabel: string;
  originalPriceLabel?: string;
  billingLabel: string;
  description: string;
  cta: string;
  href: string;
  features: string[];
  missing: string[];
};

export const PRICING_PLANS: PricingPlanDisplay[] = [
  { plan: 'free', name: 'Gratis', priceLabel: 'Rp 0', billingLabel: '/selamanya', description: 'Coba dulu, cocok untuk sekolah kecil yang baru mulai digital.', cta: 'Mulai Gratis', href: '/register', features: ['Manajemen siswa & SPP', 'Pencatatan kas dasar', '1 pengguna aktif', 'Kas digital 2 kategori'], missing: ['Pendaftaran siswa online', 'Dashboard owner realtime', 'Laporan operasional lengkap', 'Penggajian guru', 'Inventaris barang', 'Import Excel', 'Support prioritas'] },
  { plan: 'tahun1', name: 'Tahun Pertama', priceLabel: 'Rp 4.000.000', originalPriceLabel: 'Rp 5.500.000', billingLabel: '/tahun pertama', description: 'SekolahRapi lengkap, terpasang dan didampingi sampai jalan.', cta: 'Pasang SekolahRapi', href: 'https://wa.me/6289508053795?text=Saya%20ingin%20pasang%20SekolahRapi%20(Tahun%20Pertama)', features: ['Semua fitur lengkap (setara paket Pro)', 'Setup & konfigurasi sekolah', 'Impor data awal siswa & guru', 'Pelatihan tim sekolah (1x)', 'Support prioritas via WA 12 bulan', 'Backup mingguan terenkripsi'], missing: [] },
  { plan: 'perpanjangan', name: 'Perpanjangan', priceLabel: 'Rp 1.500.000', billingLabel: '/tahun', description: 'Menjaga sistem tetap jalan — server, backup, support, dan update.', cta: 'Hubungi Perpanjangan', href: 'https://wa.me/6289508053795?text=Saya%20ingin%20perpanjang%20SekolahRapi', features: ['Semua fitur tetap aktif', 'Server, backup mingguan & keepalive', 'Bantuan troubleshooting via WA', 'Update fitur rutin', 'Harga tetap, tidak naik di tahun berikutnya'], missing: ['Fitur custom — mulai Rp 500.000, dihitung terpisah'] },
];

export function normalizePlan(plan?: string | null): Plan {
  return plan && plan in PLAN_DEFINITIONS ? (plan as Plan) : 'free';
}

export function hasFeature(plan: string | null | undefined, feature: Feature): boolean {
  return PLAN_RANK[normalizePlan(plan)] >= PLAN_RANK[FEATURE_DEFINITIONS[feature].minimumPlan];
}

export function getPlanFeatures(plan: string | null | undefined): Feature[] {
  return (Object.keys(FEATURE_DEFINITIONS) as Feature[]).filter((feature) => hasFeature(plan, feature));
}

export function getPlanLabel(plan?: string | null): string {
  return PLAN_DEFINITIONS[normalizePlan(plan)].label;
}

export function getFeatureRoute(feature: Feature): string {
  const routes: Partial<Record<Feature, string>> = {
    dashboard: '/overview', students: '/students', spp: '/spp', transactions: '/transactions',
    reports: '/reports', enrollment: '/enrollment', payroll: '/payroll', inventory: '/inventory',
  };
  return routes[feature] || '/pricing';
}

export function getRouteFeature(pathname: string): Feature | undefined {
  const cleanPathname = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  const routes: Array<[string, Feature]> = [
    ['/students', 'students'], ['/spp', 'spp'], ['/transactions', 'transactions'], ['/categories', 'transactions'],
    ['/reports', 'reports'], ['/audit', 'reports'], ['/enrollment', 'enrollment'], ['/payroll', 'payroll'], ['/inventory', 'inventory'],
  ];
  return routes.find(([route]) => cleanPathname === route || cleanPathname.startsWith(`${route}/`))?.[1];
}