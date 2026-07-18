'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { importFromCSV } from '../services/student.service';
import type { StudentFormData } from '../types/student.types';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface StudentImportProps {
  schoolId: string;
  onDone: () => void;
}

type ParsedRow = {
  row: number;
  data: StudentFormData;
  errors: string[];
};

const COLUMNS = ['nis', 'name', 'class', 'gender', 'address', 'parent_name', 'parent_phone'] as const;
const REQUIRED = ['nis', 'name', 'class'];
const HEADER_MAP: Record<string, string> = {
  nis: 'nis', 'NIS': 'nis', 'nomor_induk': 'nis',
  name: 'name', 'nama': 'name', 'nama_lengkap': 'name',
  class: 'class', 'kelas': 'class',
  gender: 'gender', 'jenis_kelamin': 'gender', 'jk': 'gender',
  address: 'address', 'alamat': 'address',
  parent_name: 'parent_name', 'nama_orang_tua': 'parent_name', 'ortu': 'parent_name',
  parent_phone: 'parent_phone', 'no_hp': 'parent_phone', 'telepon': 'parent_phone', 'wa': 'parent_phone',
};

function downloadTemplate() {
  const headers = ['NIS', 'Nama Lengkap', 'Kelas', 'Jenis Kelamin (L/P)', 'Alamat', 'Nama Orang Tua', 'No. HP'];
  const example = ['1001', 'Ahmad Fauzi', '7A', 'L', 'Jl. Merdeka No. 10', 'Budi Santoso', '081234567890'];
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'template_siswa_sekolahrapi.xlsx');
}

function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

        const parsed: ParsedRow[] = rows.map((row, i) => {
          // Map headers (case-insensitive, flexible)
          const mapped: Record<string, string> = {};
          for (const [key, val] of Object.entries(row)) {
            const normalized = key.toLowerCase().trim().replace(/[\s_]+/g, '_');
            const field = HEADER_MAP[key] || HEADER_MAP[normalized];
            if (field) mapped[field] = String(val).trim();
          }

          const errors: string[] = [];
          for (const req of REQUIRED) {
            if (!mapped[req]) errors.push(`"${req}" wajib diisi`);
          }
          if (mapped.gender && !['L', 'P', 'Laki-laki', 'Perempuan'].includes(mapped.gender)) {
            errors.push('Jenis kelamin harus L/P');
          }

          return {
            row: i + 2,
            data: {
              nis: mapped.nis || '',
              name: mapped.name || '',
              class: mapped.class || '',
              gender: mapped.gender === 'Laki-laki' ? 'L' : mapped.gender === 'Perempuan' ? 'P' : (mapped.gender || ''),
              address: mapped.address || '',
              parent_name: mapped.parent_name || '',
              parent_phone: mapped.parent_phone || '',
            },
            errors,
          };
        });

        resolve(parsed);
      } catch {
        reject(new Error('Gagal membaca file. Pastikan format Excel/CSV.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

export function StudentImport({ schoolId, onDone }: StudentImportProps) {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setParsed([]);
    setResult(null);
    try {
      const rows = await parseFile(file);
      if (!rows.length) {
        setError('File kosong atau format tidak sesuai');
        return;
      }
      setParsed(rows);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    const valid = parsed.filter(r => r.errors.length === 0);
    if (!valid.length) return;

    setImporting(true);
    try {
      const res = await importFromCSV(
        schoolId,
        valid.map(r => r.data)
      );
      setResult(res);
      if (res.imported > 0) onDone();
    } catch (err: any) {
      setError(err.message || 'Gagal import');
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsed.filter(r => r.errors.length === 0).length;
  const errorCount = parsed.filter(r => r.errors.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Import Siswa dari File</h3>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Upload area */}
      {!parsed.length && !result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Klik atau seret file ke sini</p>
          <p className="text-xs text-gray-400 mt-1">Format: .xlsx, .xls, atau .csv</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview table */}
      {parsed.length > 0 && !result && (
        <>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              <FileSpreadsheet className="w-4 h-4 inline mr-1" />
              {parsed.length} baris terbaca
            </span>
            <span className="text-emerald-600">{validCount} valid</span>
            {errorCount > 0 && <span className="text-red-600">{errorCount} error</span>}
          </div>

          <div className="max-h-80 overflow-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Baris</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NIS</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Kelas</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">JK</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Orang Tua</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsed.map((r) => (
                  <tr key={r.row} className={r.errors.length ? 'bg-red-50' : 'bg-white'}>
                    <td className="px-3 py-2 text-gray-500">{r.row}</td>
                    <td className="px-3 py-2 text-gray-900">{r.data.nis || '-'}</td>
                    <td className="px-3 py-2 text-gray-900">{r.data.name || '-'}</td>
                    <td className="px-3 py-2 text-gray-900">{r.data.class || '-'}</td>
                    <td className="px-3 py-2 text-gray-900">{r.data.gender || '-'}</td>
                    <td className="px-3 py-2 text-gray-900">{r.data.parent_name || '-'}</td>
                    <td className="px-3 py-2">
                      {r.errors.length ? (
                        <span className="text-xs text-red-600">{r.errors.join(', ')}</span>
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setParsed([]); setError(''); }}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={!validCount || importing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {importing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengimport...
                </>
              ) : (
                `Import ${validCount} Siswa`
              )}
            </button>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-900">Import Selesai!</p>
          <p className="text-sm text-gray-500 mt-1">
            {result.imported} siswa berhasil diimport
            {result.failed > 0 && <span className="text-red-600">, {result.failed} gagal</span>}
          </p>
          <button
            onClick={onDone}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Lihat Data Siswa
          </button>
        </div>
      )}
    </div>
  );
}
