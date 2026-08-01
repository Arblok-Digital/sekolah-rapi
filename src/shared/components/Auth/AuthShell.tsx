import Link from 'next/link';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/shared/constants';

interface AuthShellProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}

const benefits = [
  'Data siswa dan pembayaran dalam satu tempat',
  'Ringkasan operasional yang mudah dipantau',
  'Setup awal dibantu agar tim cepat mulai',
];

export function AuthShell({ children, eyebrow, title, description, compact = false }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#17211b] selection:bg-[#dfe99a]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,.9fr)_minmax(520px,1.1fr)]">
        <section className="relative hidden overflow-hidden bg-[#173f35] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(184,212,75,.24),transparent_30%),radial-gradient(circle_at_90%_75%,rgba(255,255,255,.09),transparent_35%)]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3" aria-label={`${APP_NAME} beranda`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-black text-[#173f35] shadow-[0_5px_0_#b8d44b]">
                SR
              </span>
              <span className="text-lg font-black tracking-tight">{APP_NAME}</span>
            </Link>
          </div>

          <div className="relative max-w-xl py-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-[#dfe99a]">
              <Sparkles className="h-4 w-4" /> Administrasi sekolah lebih tenang
            </div>
            <h2 className="text-4xl font-black leading-[1.02] tracking-[-.045em] xl:text-5xl">
              Satu ruang kerja untuk tim sekolah yang ingin lebih rapi.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70 xl:text-lg">
              Pantau siswa, SPP, kas, pendaftaran, inventaris, dan penggajian tanpa berpindah banyak catatan.
            </p>
            <div className="mt-9 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm font-bold text-white/90">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#b8d44b] text-[#173f35]">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs leading-5 text-white/45">
            Dibangun untuk sekolah swasta dan madrasah yang ingin beralih dari pencatatan tersebar.
          </p>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(184,212,75,.24),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(42,121,96,.12),transparent_30%)]" />
          <div className={`relative w-full ${compact ? 'max-w-md' : 'max-w-xl'}`}>
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-3" aria-label={`${APP_NAME} beranda`}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f35] text-sm font-black text-white shadow-[0_5px_0_#b8d44b]">
                  SR
                </span>
                <span className="text-lg font-black tracking-tight">{APP_NAME}</span>
              </Link>
              <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-[#435048] hover:text-[#26735d]">
                <ArrowLeft className="h-4 w-4" /> Beranda
              </Link>
            </div>

            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#26735d]">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#5c675f] sm:text-base">{description}</p>
            </div>

            <div className="rounded-[1.75rem] border border-[#17211b]/10 bg-white/80 p-5 shadow-[0_24px_70px_rgba(23,33,27,.10)] backdrop-blur sm:p-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export const authFieldClassName =
  'mt-2 w-full rounded-xl border border-[#17211b]/15 bg-white px-4 py-3 text-sm text-[#17211b] outline-none transition placeholder:text-[#7b857e] focus:border-[#26735d] focus:ring-4 focus:ring-[#26735d]/10';

export const authButtonClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f35] px-5 py-3.5 text-sm font-black text-white shadow-[0_5px_0_#b8d44b] transition hover:-translate-y-0.5 hover:bg-[#205546] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';