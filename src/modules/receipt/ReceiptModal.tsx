'use client';

import { useRef, useState } from 'react';
import { Download, Share2, Printer, X, Loader2 } from 'lucide-react';
import { useToast, getErrorMessage } from '@/shared/components/ui/toast';
import { ReceiptDoc } from './ReceiptDoc';
import type { ReceiptData, ReceiptSchool } from './types';

interface ReceiptModalProps {
  data: ReceiptData;
  school: ReceiptSchool;
  onClose: () => void;
}

function fileName(number: string): string {
  return `kuitansi-${number.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'digital'}.png`;
}

export function ReceiptModal({ data, school, onClose }: ReceiptModalProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState<'png' | 'share' | 'print' | null>(null);
  const { toast } = useToast();

  // Render PNG pakai html-to-image (foreignObject + computed-style inlining) —
  // tahan oklch Tailwind v4 dan kebal dari error "Node cannot be found" html2canvas.
  async function renderPng(): Promise<string> {
    if (!docRef.current) throw new Error('Dokumen kuitansi belum siap');
    const { toPng } = await import('html-to-image');
    return toPng(docRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
  }

  async function handleDownload() {
    setWorking('png');
    try {
      const url = await renderPng();
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName(data.number);
      a.click();
      toast({ title: 'Kuitansi diunduh sebagai PNG', variant: 'success' });
    } catch (err) {
      toast({ title: 'Gagal membuat PNG', description: getErrorMessage(err), variant: 'error' });
    } finally {
      setWorking(null);
    }
  }

  async function handleShare() {
    setWorking('share');
    try {
      const url = await renderPng();
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName(data.number), { type: 'image/png' });
      if (typeof navigator !== 'undefined' && 'canShare' in navigator && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Kuitansi ${data.number}` });
      } else {
        // Fallback: unduh, lalu user share manual via WA/Telegram
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName(data.number);
        a.click();
        toast({ title: 'Perangkat tidak mendukung share langsung', description: 'File PNG diunduh — bagikan manual via WA/Telegram.', variant: 'error' });
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        toast({ title: 'Gagal membagikan', description: getErrorMessage(err), variant: 'error' });
      }
    } finally {
      setWorking(null);
    }
  }

  async function handlePrint() {
    setWorking('print');
    try {
      if (!docRef.current) throw new Error('Dokumen kuitansi belum siap');
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((el) => el.outerHTML)
        .join('\n');
      const html = docRef.current.outerHTML;
      const w = window.open('', '_blank', 'width=720,height=900');
      if (!w) throw new Error('Popup diblokir browser — izinkan popup untuk mencetak.');
      w.document.write(
        `<html><head><meta charset="utf-8"><title>Kuitansi ${data.number}</title>${styles}<style>body{margin:0;background:#f3f4f6;display:flex;justify-content:center;padding:24px}@media print{body{background:#fff;padding:0}}</style></head><body><div style="width:640px;max-width:100%">${html}</div><script>window.onload=()=>window.print()<\/script></body></html>`
      );
      w.document.close();
    } catch (err) {
      toast({ title: 'Gagal mencetak', description: getErrorMessage(err), variant: 'error' });
    } finally {
      setWorking(null);
    }
  }

  const busy = working !== null;
  const btn =
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4" onClick={onClose}>
      <div
        className="my-auto w-full max-w-3xl rounded-2xl bg-gray-100 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Pratinjau Kuitansi</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <ReceiptDoc ref={docRef} data={data} school={school} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={handleDownload} disabled={busy} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>
            {working === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Unduh PNG
          </button>
          <button onClick={handleShare} disabled={busy} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
            {working === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Bagikan (WA/Telegram)
          </button>
          <button onClick={handlePrint} disabled={busy} className={`${btn} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`}>
            {working === 'print' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Cetak
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Bagikan membuka pilihan aplikasi (WhatsApp / Telegram / lainnya) langsung dari HP. Di laptop, file otomatis diunduh.
        </p>
      </div>
    </div>
  );
}
