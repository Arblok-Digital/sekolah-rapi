'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { assertSchoolFeature } from '@/shared/services/plan-guard';
import { createSupabaseClient } from '@/shared/services/supabase/client';
import { MONTHS } from '@/modules/payroll/types/payroll.types';
import { BarChart3, FileSpreadsheet, Download, Loader2, TrendingUp, TrendingDown, Receipt, Users } from 'lucide-react';

function formatRp(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

interface MonthlyReport {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface SppRecap {
  month: string;
  totalStudents: number;
  paidCount: number;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
}

type ReportType = 'financial' | 'spp';

export default function ReportsPage() {
  const { schoolId } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const [financialData, setFinancialData] = useState<MonthlyReport[]>([]);
  const [sppData, setSppData] = useState<SppRecap[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, totalNet: 0 });

  useEffect(() => {
    if (!schoolId) return;
    const activeSchoolId = schoolId;
    const supabase = createSupabaseClient();
    setLoading(true);

    async function fetchData() {
      try {
        await assertSchoolFeature(activeSchoolId, 'reports');
      } catch {
        setLoading(false);
        return;
      }
      // Fetch all transactions for the year
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      const { data: txData } = await supabase
        .from('transactions')
        .select('amount, type, reference_date')
        .eq('school_id', activeSchoolId)
        .gte('reference_date', yearStart)
        .lte('reference_date', yearEnd);

      const { data: sppData } = await supabase
        .from('spp_payments')
        .select('student_id, month, year, amount, paid_amount, status')
        .eq('school_id', activeSchoolId)
        .eq('year', year);

      const { data: students } = await supabase
        .from('students')
        .select('id, status')
        .eq('school_id', activeSchoolId)
        .eq('status', 'active');

      const activeStudents = students?.length || 0;

      // Financial by month
      const monthlyFin: MonthlyReport[] = MONTHS.map((m, i) => {
        const monthTx = (txData || []).filter(t => {
          const d = new Date(t.reference_date);
          return d.getMonth() === i && d.getFullYear() === year;
        });
        const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { month: m, income, expense, net: income - expense };
      });

      // SPP by month
      const monthlySpp: SppRecap[] = MONTHS.map((m, i) => {
        const monthSpp = (sppData || []).filter(s => s.month === i + 1);
        const paidCount = monthSpp.filter(s => s.status === 'paid' || s.status === 'partial').length;
        const totalExpected = activeStudents * 350000; // Default SPP amount
        const totalCollected = monthSpp.reduce((s, r) => s + r.paid_amount, 0);
        return { month: m, totalStudents: activeStudents, paidCount, totalExpected, totalCollected, collectionRate: activeStudents > 0 ? Math.round((paidCount / activeStudents) * 100) : 0 };
      });

      setFinancialData(monthlyFin);
      setSppData(monthlySpp);
      setSummary({
        totalIncome: monthlyFin.reduce((s, m) => s + m.income, 0),
        totalExpense: monthlyFin.reduce((s, m) => s + m.expense, 0),
        totalNet: monthlyFin.reduce((s, m) => s + m.net, 0),
      });
      setLoading(false);
    }

    fetchData();
  }, [schoolId, year]);

  function exportCSV(type: 'financial' | 'spp') {
    let csv = '';
    if (type === 'financial') {
      csv = 'Bulan,Pemasukan,Pengeluaran,Net\n';
      financialData.forEach(r => { csv += `${r.month},${r.income},${r.expense},${r.net}\n`; });
      csv += `\nTOTAL,,${summary.totalIncome},${summary.totalExpense},${summary.totalNet}\n`;
    } else {
      csv = 'Bulan,Siswa Aktif,Lunas,Total Expected,Total Collected,Rate\n';
      sppData.forEach(r => { csv += `${r.month},${r.totalStudents},${r.paidCount},${r.totalExpected},${r.totalCollected},${r.collectionRate}%\n`; });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${type}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalIncome = summary.totalIncome;
  const totalExpense = summary.totalExpense;
  const totalNet = summary.totalNet;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Laporan</h2>
          <p className="text-sm text-white/60 mt-0.5">Rekap keuangan dan SPP tahun {year}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-white/15 rounded-xl text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        <button onClick={() => setReportType('financial')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${reportType === 'financial' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70'}`}>Keuangan</button>
        <button onClick={() => setReportType('spp')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${reportType === 'spp' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70'}`}>Rekap SPP</button>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <>
          {/* ── Financial Report ── */}
          {reportType === 'financial' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs text-gray-500">Total Pemasukan</span></div>
                  <p className="text-xl font-bold text-emerald-600">{formatRp(totalIncome)}</p>
                </div>
                <div className="bg-white rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Total Pengeluaran</span></div>
                  <p className="text-xl font-bold text-red-600">{formatRp(totalExpense)}</p>
                </div>
                <div className="bg-white rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-500">Net</span></div>
                  <p className={`text-xl font-bold ${totalNet >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatRp(totalNet)}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-gray-900">Laporan Bulanan</h3>
                  <button onClick={() => exportCSV('financial')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-500">Bulan</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500">Pemasukan</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500">Pengeluaran</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {financialData.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                         <td className="px-4 py-2.5 text-gray-900 font-medium">{r.month}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-600">{r.income > 0 ? formatRp(r.income) : '-'}</td>
                        <td className="px-4 py-2.5 text-right text-red-600">{r.expense > 0 ? formatRp(r.expense) : '-'}</td>
                        <td className={`px-4 py-2.5 text-right font-medium ${r.net >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{r.net !== 0 ? formatRp(r.net) : '-'}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-2.5 text-gray-900">TOTAL</td>
                      <td className="px-4 py-2.5 text-right text-emerald-600">{formatRp(totalIncome)}</td>
                      <td className="px-4 py-2.5 text-right text-red-600">{formatRp(totalExpense)}</td>
                      <td className={`px-4 py-2.5 text-right ${totalNet >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{formatRp(totalNet)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SPP Recap ── */}
          {reportType === 'spp' && (
            <>
              <div className="bg-white rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-gray-900">Rekap SPP {year}</h3>
                  <button onClick={() => exportCSV('spp')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-500">Bulan</th>
                      <th className="text-center px-4 py-2.5 font-medium text-gray-500">Siswa</th>
                      <th className="text-center px-4 py-2.5 font-medium text-gray-500">Lunas</th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-500">Terkumpul</th>
                      <th className="text-center px-4 py-2.5 font-medium text-gray-500">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sppData.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{r.month}</td>
                        <td className="px-4 py-2.5 text-center text-gray-600">{r.totalStudents}</td>
                        <td className="px-4 py-2.5 text-center text-gray-600">{r.paidCount}/{r.totalStudents}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900">{r.totalCollected > 0 ? formatRp(r.totalCollected) : '-'}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.collectionRate >= 90 ? 'bg-emerald-100 text-emerald-700' : r.collectionRate >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{r.collectionRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
