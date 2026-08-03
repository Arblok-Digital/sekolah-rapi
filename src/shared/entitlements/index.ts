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
  spp: { label: 'SPP', minimumPlan: 'free' },
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
    price: 490000,
  },
  pro: {
    label: 'Pro',
    price: 990000,
  },
  lifetime: {
    label: 'Lifetime',
    price: 0,
  },
} as const satisfies Record<Plan, { label: string; price: number }>;

export const PRICING_PLANS = [
  { plan: 'free', name: 'Gratis', priceLabel: 'Rp 0', billingLabel: '/selamanya', description: 'Coba dulu, cocok untuk sekolah kecil yang baru mulai digital.', cta: 'Mulai Gratis', href: '/register', features: ['Manajemen siswa & SPP', 'Pencatatan kas dasar', '1 pengguna aktif', 'Kas digital 2 kategori'], missing: ['Pendaftaran siswa online', 'Dashboard owner realtime', 'Laporan operasional lengkap', 'Penggajian guru', 'Inventaris barang', 'Import Excel', 'Support prioritas'] },
  { plan: 'basic', name: 'Basic', priceLabel: '490.000', billingLabel: '/tahun', description: 'Fitur operasional lengkap untuk sekolah swasta dan madrasah.', cta: 'Hubungi untuk Aktivasi Basic', href: 'https://wa.me/6289508053795?text=Saya%20ingin%20aktivasi%20SekolahRapi%20Basic', features: ['Semua fitur Free plan', 'Laporan operasional & keuangan', 'Ekspor Excel (semua data)', 'Import siswa via Excel', 'Kategori kas unlimited', 'Hapus branding Arblok Digital'], missing: ['Pendaftaran siswa online', 'Dashboard owner realtime', 'Penggajian guru', 'Inventaris barang', 'Dukungan prioritas'] },
  { plan: 'pro', name: 'Pro', priceLabel: '990.000', billingLabel: '/tahun', description: 'Solusi lengkap untuk sekolah yang membutuhkan semua fitur.', cta: 'Hubungi untuk Aktivasi Pro', href: 'https://wa.me/6289508053795?text=Saya%20ingin%20aktivasi%20SekolahRapi%20Pro', features: ['Semua fitur Basic', 'Pendaftaran siswa online yang ringkas', 'Dashboard owner realtime, nyaman di mobile', 'Penggajian guru (payroll)', 'Inventaris barang & aset', 'Impor data massal (Excel)', 'Dukungan prioritas via WA', 'Bantuan pelatihan staff (1x zoom)'], missing: [] },
] as const;

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
    ['/reports', 'reports'], ['/enrollment', 'enrollment'], ['/payroll', 'payroll'], ['/inventory', 'inventory'],
  ];
  return routes.find(([route]) => cleanPathname === route || cleanPathname.startsWith(`${route}/`))?.[1];
}