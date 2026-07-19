'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, usePayroll, useGeneratePayroll, useUpdatePayroll } from '@/modules/payroll/hooks/usePayroll';
import { MONTHS } from '@/modules/payroll/types/payroll.types';
import type { Employee, EmployeeFormInput } from '@/modules/payroll/types/payroll.types';
import { Plus, Edit, Trash2, Users, Loader2, Zap, CheckCircle, XCircle } from 'lucide-react';

const emptyEmp: EmployeeFormInput = { name: '', position: 'Guru', phone: '', base_salary: 0, status: 'active' };

function formatRp(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

type Tab = 'employees' | 'payroll';

export default function PayrollPage() {
  const { schoolId } = useAuth();
  const [tab, setTab] = useState<Tab>('employees');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Employee form
  const [empFormOpen, setEmpFormOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<EmployeeFormInput>(emptyEmp);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: employees, isLoading: empLoading } = useEmployees(schoolId || '');
  const createEmp = useCreateEmployee(schoolId || '');
  const updateEmp = useUpdateEmployee(schoolId || '');
  const deleteEmp = useDeleteEmployee(schoolId || '');

  const { data: payroll, isLoading: payLoading } = usePayroll(schoolId || '', month, year);
  const generateMut = useGeneratePayroll(schoolId || '');
  const updatePay = useUpdatePayroll(schoolId || '');

  function openCreateEmp() { setEditEmp(null); setEmpForm(emptyEmp); setEmpFormOpen(true); }
  function openEditEmp(e: Employee) { setEditEmp(e); setEmpForm({ name: e.name, position: e.position, phone: e.phone || '', base_salary: e.base_salary, status: e.status }); setEmpFormOpen(true); }

  async function handleEmpSubmit() {
    if (!empForm.name.trim()) return;
    if (editEmp) await updateEmp.mutateAsync({ id: editEmp.id, input: empForm });
    else await createEmp.mutateAsync(empForm);
    setEmpFormOpen(false);
  }

  async function handleDeleteEmp(id: string) { await deleteEmp.mutateAsync(id); setDeleteConfirm(null); }

  async function handleGenerate() {
    const result = await generateMut.mutateAsync({ month, year });
    alert(`Berhasil generate ${result.created} slip gaji baru`);
  }

  async function handleTogglePaid(recordId: string, currentPaid: boolean) {
    await updatePay.mutateAsync({ id: recordId, input: { paid: !currentPaid, paid_date: !currentPaid ? new Date().toISOString().split('T')[0] : undefined } });
  }

  const activeEmp = employees?.filter(e => e.status === 'active') || [];
  const totalPayroll = payroll?.reduce((s, r) => s + r.total, 0) || 0;
  const paidCount = payroll?.filter(r => r.paid).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Penggajian</h2>
        <p className="text-sm text-white/60 mt-0.5">Kelola data karyawan dan slip gaji</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('employees')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'employees' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70 hover:text-white'}`}>Karyawan</button>
        <button onClick={() => setTab('payroll')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'payroll' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70 hover:text-white'}`}>Slip Gaji</button>
      </div>

      {/* ── Tab: Employees ── */}
      {tab === 'employees' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">{employees?.length || 0} karyawan ({activeEmp.length} aktif)</p>
            <button onClick={openCreateEmp} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Tambah Karyawan
            </button>
          </div>

          {empLoading ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
          ) : !employees?.length ? (
            <div className="text-center py-12 bg-white rounded-xl border border-white/10">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada karyawan</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Nama</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Jabatan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Telepon</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Gaji Pokok</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                      <td className="px-4 py-3 text-gray-600">{e.position}</td>
                      <td className="px-4 py-3 text-gray-600">{e.phone || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{formatRp(e.base_salary)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{e.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEditEmp(e)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"><Edit className="w-4 h-4" /></button>
                          {deleteConfirm === e.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeleteEmp(e.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Ya</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-100 rounded text-xs">Batal</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(e.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Payroll ── */}
      {tab === 'payroll' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 border border-white/15 rounded-xl text-sm">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-white/15 rounded-xl text-sm">
                {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="text-sm text-white/60">
                Total: <span className="font-semibold text-white">{formatRp(totalPayroll)}</span>
                <span className="ml-2 text-white/50">({paidCount}/{payroll?.length || 0} lunas)</span>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generateMut.isPending || activeEmp.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              <Zap className="w-4 h-4" /> {generateMut.isPending ? 'Generating...' : 'Generate Slip Gaji'}
            </button>
          </div>

          {payLoading ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 border-2 border-white/15 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
          ) : !payroll?.length ? (
            <div className="text-center py-12 bg-white rounded-xl border border-white/10">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada slip gaji untuk {MONTHS[month - 1]} {year}</p>
              <p className="text-xs text-gray-400 mt-1">Klik &quot;Generate Slip Gaji&quot; untuk membuat</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Nama</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Gaji Pokok</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Bonus</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Potongan</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payroll.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.employee?.name || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatRp(r.base_salary)}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{r.bonus > 0 ? `+${formatRp(r.bonus)}` : '-'}</td>
                      <td className="px-4 py-3 text-right text-red-600">{r.deduction > 0 ? `-${formatRp(r.deduction)}` : '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatRp(r.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.paid ? 'Lunas' : 'Belum'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePaid(r.id, r.paid)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            r.paid
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {r.paid ? (
                            <><XCircle className="w-3.5 h-3.5" /> Batal</>
                          ) : (
                            <><CheckCircle className="w-3.5 h-3.5" /> Bayar</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Employee Form Modal */}
      {empFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editEmp ? 'Edit Karyawan' : 'Tambah Karyawan'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <input value={empForm.position} onChange={e => setEmpForm({ ...empForm, position: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input value={empForm.phone || ''} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok (Rp)</label>
                  <input type="number" value={empForm.base_salary} onChange={e => setEmpForm({ ...empForm, base_salary: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={empForm.status} onChange={e => setEmpForm({ ...empForm, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEmpFormOpen(false)} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Batal</button>
              <button onClick={handleEmpSubmit} disabled={!empForm.name.trim()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {editEmp ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
