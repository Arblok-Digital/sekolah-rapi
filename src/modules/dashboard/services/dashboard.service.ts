import { createSupabaseClient } from '@/shared/services/supabase/client';
import { db } from '@/modules/offline/db';
import { withOfflineFallback } from '@/modules/offline/services/read';
import { mirrorPatch } from '@/modules/offline/services/mirror';
import { collectReversedSourceIds, excludeReversalPairs } from '@/modules/transactions/utils/reversal';

export interface DashboardAlert {
  id: string;
  severity: 'warning' | 'info' | 'success';
  title: string;
  detail: string;
}

export interface DashboardData {
  saldo: number;
  incomeBulanIni: number;
  expenseBulanIni: number;
  totalSiswa: number;
  outstandingSiswa: number;
  collectionRate: number;
  alerts: DashboardAlert[];
}

type DashboardTx = {
  id: string;
  type: string;
  amount: number;
  source_type?: string | null;
  source_id?: string | null;
};

interface DashboardInput {
  /** Transaksi bulan ini (untuk Masuk/Keluar "Bulan ini"). */
  monthTx: DashboardTx[];
  /** Seluruh transaksi (untuk saldo + sumber pasangan koreksi). */
  allTx: DashboardTx[];
  students: Array<{ status?: string | null }>;
  /** Tagihan SPP bulan ini (SEMUA kategori — difilter di compute). */
  sppMonth: Array<{ student_id: string; status?: string | null; category_id?: string | null }>;
  /** Kategori 'SPP' — kesehatan SPP hanya dihitung dari tagihan kategori ini. */
  sppCategoryId: string | null;
  now: Date;
}

/**
 * Kalkulasi ringkasan Overview — SATU sumber untuk jalur online & offline.
 * Pasangan koreksi (reversal + aslinya) dikeluarkan dari semua angka: keduanya
 * saling menghapus, dan angka Overview harus mencerminkan uang yang
 * benar-benar bergerak.
 */
export function computeDashboard(input: DashboardInput): DashboardData {
  const { monthTx, allTx, students, sppMonth, sppCategoryId, now } = input;

  const reversedIds = collectReversedSourceIds(allTx);
  const realAllTx = excludeReversalPairs(allTx, reversedIds);
  const realTx = excludeReversalPairs(monthTx, reversedIds);

  const totalIncome = realAllTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
  const totalExpense = realAllTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;
  const saldo = totalIncome - totalExpense;

  const incomeBulanIni = realTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 0;
  const expenseBulanIni = realTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) || 0;

  // Kesehatan SPP hanya dari tagihan kategori 'SPP' — tagihan kategori lain
  // (seragam, donasi, dst) tidak boleh mengubah rate ini.
  const filteredSpp = sppMonth.filter((s) => !sppCategoryId || s.category_id === sppCategoryId);

  const totalSiswa = students.filter((s) => s.status === 'active').length;
  const paidCount = filteredSpp.filter((s) => s.status === 'paid' || s.status === 'partial').length;
  const outstandingSiswa = totalSiswa - paidCount;
  const collectionRate = totalSiswa > 0 ? Math.round((paidCount / totalSiswa) * 100) : 0;

  const alerts: DashboardAlert[] = [];
  if (outstandingSiswa > 0) {
    alerts.push({
      id: '1',
      severity: 'warning',
      title: `${outstandingSiswa} siswa menunggak SPP`,
      detail: `Bulan ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
    });
  }
  if (collectionRate >= 90) {
    alerts.push({ id: '2', severity: 'success', title: 'Koleksi SPP Excellent', detail: `${collectionRate}% tepat waktu` });
  } else if (collectionRate >= 70) {
    alerts.push({ id: '2', severity: 'info', title: 'Koleksi SPP cukup', detail: `${collectionRate}% tepat waktu` });
  } else if (totalSiswa > 0) {
    alerts.push({ id: '2', severity: 'warning', title: 'Koleksi SPP rendah', detail: `Hanya ${collectionRate}% tepat waktu` });
  }
  if (totalSiswa === 0) {
    alerts.push({ id: '3', severity: 'info', title: 'Belum ada siswa', detail: 'Gunakan Dev Panel untuk seed data test' });
  }

  return { saldo, incomeBulanIni, expenseBulanIni, totalSiswa, outstandingSiswa, collectionRate, alerts };
}

/** Ambil semua dataset Overview dari server, atau hitung dari mirror saat offline. */
export async function fetchDashboardData(schoolId: string): Promise<DashboardData> {
  const supabase = createSupabaseClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  return withOfflineFallback(
    async () => {
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('id, description, amount, type, reference_date, source_type, source_id')
        .eq('school_id', schoolId)
        .gte('reference_date', monthStart)
        .lte('reference_date', monthEnd)
        .order('reference_date', { ascending: false });
      if (txErr) throw txErr;

      const { data: allTx, error: allErr } = await supabase
        .from('transactions')
        .select('id, amount, type, source_type, source_id')
        .eq('school_id', schoolId);
      if (allErr) throw allErr;

      const { data: students, error: stErr } = await supabase
        .from('students')
        .select('id, status')
        .eq('school_id', schoolId);
      if (stErr) throw stErr;

      const { data: sppCategory, error: catErr } = await supabase
        .from('categories')
        .select('id')
        .eq('school_id', schoolId)
        .eq('name', 'SPP')
        .limit(1);
      if (catErr) throw catErr;

      // `id` ikut di-select supaya hasilnya bisa di-merge ke mirror lokal.
      const { data: sppRaw, error: sppErr } = await supabase
        .from('spp_payments')
        .select('id, student_id, status, category_id')
        .eq('school_id', schoolId)
        .eq('year', now.getFullYear())
        .eq('month', now.getMonth() + 1);
      if (sppErr) throw sppErr;

      await Promise.all([
        mirrorPatch('transactions', txData ?? []),
        mirrorPatch('transactions', allTx ?? []),
        mirrorPatch('students', students ?? []),
        mirrorPatch('spp_payments', sppRaw ?? []),
      ]);

      return computeDashboard({
        monthTx: (txData ?? []) as DashboardTx[],
        allTx: (allTx ?? []) as DashboardTx[],
        students: students ?? [],
        sppMonth: sppRaw ?? [],
        sppCategoryId: sppCategory?.[0]?.id ?? null,
        now,
      });
    },
    async () => {
      const monthStartStr = monthStart.slice(0, 10);
      const monthEndStr = monthEnd.slice(0, 10);

      const [allTx, students, sppPayments, categories] = await Promise.all([
        db.transactions.where('school_id').equals(schoolId).toArray(),
        db.students.where('school_id').equals(schoolId).toArray(),
        db.spp_payments.where('school_id').equals(schoolId).toArray(),
        db.categories.where('school_id').equals(schoolId).toArray(),
      ]);

      const monthTx = allTx.filter(
        (t) => t.reference_date >= monthStartStr && t.reference_date <= monthEndStr
      );
      const sppMonth = sppPayments.filter(
        (p) => p.year === now.getFullYear() && p.month === now.getMonth() + 1
      );
      const sppCategoryId = categories.find((c) => c.name === 'SPP')?.id ?? null;

      return computeDashboard({
        monthTx,
        allTx,
        students,
        sppMonth,
        sppCategoryId,
        now,
      });
    }
  );
}
