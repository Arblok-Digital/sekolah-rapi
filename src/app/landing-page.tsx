import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  Check,
  FileSpreadsheet,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { APP_NAME, POWERED_BY } from "@/shared/constants";

const whatsappUrl =
  "https://wa.me/6289508053795?text=Halo%20SekolahRapi%2C%20saya%20ingin%20jadwalkan%20demo%2020%20menit.";

const problems = [
  [
    BookOpenCheck,
    "Pendaftar tercecer",
    "Data calon siswa masuk lewat chat, kertas, dan file berbeda lalu harus diketik ulang.",
  ],
  [
    BarChart3,
    "Owner menunggu rekap",
    "Uang masuk dan keluar baru terlihat setelah admin merangkum catatan yang terpencar.",
  ],
  [
    FileSpreadsheet,
    "Administrasi terpisah",
    "Data siswa, SPP, kas, inventaris, dan payroll berjalan di tempat yang berbeda.",
  ],
] as const;

const features = [
  [Users, "Data siswa", "Kelola profil siswa dan impor data awal dari Excel."],
  [
    WalletCards,
    "SPP dan tunggakan",
    "Catat pembayaran dan lihat status setiap siswa.",
  ],
  [
    BarChart3,
    "Kas sekolah",
    "Pisahkan pemasukan dan pengeluaran dengan kategori.",
  ],
  [
    BookOpenCheck,
    "Pendaftaran",
    "Terima data calon siswa melalui formulir online.",
  ],
  [Boxes, "Inventaris", "Catat barang dan aset sekolah agar mudah dipantau."],
  [PackageCheck, "Penggajian", "Kelola data penggajian guru dan staf."],
] as const;

const steps = [
  [
    "01",
    "Ceritakan alur sekolah",
    "Kami petakan cara pencatatan yang sekarang digunakan dalam demo singkat.",
  ],
  [
    "02",
    "Siapkan data awal",
    "Setup dan impor data awal dibantu agar tim tidak mulai dari halaman kosong.",
  ],
  [
    "03",
    "Mulai pilot bersama admin",
    "Tim sekolah mencoba alur utama dengan pendampingan onboarding remote.",
  ],
] as const;

const faqs = [
  [
    "Apakah semua data harus langsung dipindahkan?",
    "Tidak. Mulai dari data dan alur yang paling penting, lalu lanjutkan secara bertahap.",
  ],
  [
    "Siapa yang cocok mengikuti demo?",
    "Owner yayasan, kepala sekolah, bendahara, atau admin sekolah swasta dan madrasah.",
  ],
  [
    "Apakah bisa digunakan saat internet terganggu?",
    "SekolahRapi memiliki dukungan PWA dan kemampuan offline untuk alur tertentu. Cakupannya dijelaskan saat demo sesuai kebutuhan sekolah.",
  ],
  [
    "Bagaimana data antar sekolah dipisahkan?",
    "Data operasional menggunakan identitas sekolah dan kebijakan Row Level Security untuk membantu membatasi akses antar sekolah.",
  ],
] as const;

export default function MarketingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f4ed] text-[#17211b] selection:bg-[#dfe99a]">
      <header className="relative z-50 border-b border-[#17211b]/10 bg-[#f7f4ed]/90 backdrop-blur-xl">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"
        >
          <Link
            href="/"
            aria-label={`${APP_NAME} beranda`}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f35] text-sm font-black text-white shadow-[0_5px_0_#b8d44b]">
              SR
            </span>
            <span className="text-lg font-black tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-bold md:flex">
            <Link href="/fitur" className="hover:text-[#26735d]">
              Fitur
            </Link>
            <Link href="/solusi" className="hover:text-[#26735d]">
              Solusi
            </Link>
            <Link href="/panduan" className="hover:text-[#26735d]">
              Panduan
            </Link>
            <Link href="/pricing" className="hover:text-[#26735d]">
              Harga
            </Link>
            <a href="#cara-kerja" className="hover:text-[#26735d]">
              Cara kerja
            </a>
            <a href="#faq" className="hover:text-[#26735d]">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-bold hover:bg-black/5"
            >
              Login
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full bg-[#173f35] px-5 py-3 text-sm font-bold text-white hover:bg-[#205546] sm:inline-flex"
            >
              Jadwalkan demo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative border-b border-[#17211b]/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(184,212,75,.25),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(42,121,96,.12),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#173f35]/15 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-[#26735d]">
                <Sparkles className="h-4 w-4" /> Pendaftaran online · Pantauan kas realtime
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">
                Pendaftar tidak tercecer.
                <span className="block text-[#26735d]">
                  Owner tak perlu menunggu rekap.
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#435048] sm:text-xl">
                Terima data calon siswa lewat formulir online dan pantau uang
                masuk-keluar dari aktivitas terbaru. Data siswa, SPP, kas,
                laporan, inventaris, dan penggajian tetap rapi dalam satu sistem.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f35] px-7 py-4 font-black text-white shadow-[0_7px_0_#b8d44b] transition hover:-translate-y-1"
                >
                  <MessageCircle className="h-5 w-5" /> Jadwalkan demo 20 menit
                </a>
                <a
                  href="#cara-kerja"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white/60 px-7 py-4 font-black hover:bg-white"
                >
                  Lihat cara kerja <ArrowRight className="h-5 w-5" />
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[#536058]">
                {["Setup dibantu", "Impor data awal", "Onboarding remote"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Check className="h-5 w-5 rounded-full bg-[#dfe99a] p-1 text-[#173f35]" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="rotate-1 rounded-[2rem] bg-[#173f35] p-3 shadow-[0_28px_70px_rgba(23,63,53,.22)] transition hover:rotate-0 sm:p-4">
                <div className="rounded-[1.4rem] bg-[#f7f4ed] p-5 sm:p-6">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#647169]">
                        Contoh tampilan
                      </p>
                      <p className="mt-1 font-black">Pantauan owner</p>
                    </div>
                    <span className="rounded-full bg-[#dfe99a] px-3 py-1.5 text-xs font-bold text-[#173f35]">
                      Online
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-4">
                      <BookOpenCheck className="h-5 w-5 text-[#26735d]" />
                      <p className="mt-5 text-2xl font-black">24</p>
                      <p className="text-xs font-bold text-[#667169]">
                        Pendaftar baru
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#dfe99a] p-4">
                      <WalletCards className="h-5 w-5" />
                      <p className="mt-5 text-2xl font-black">Hari ini</p>
                      <p className="text-xs font-bold text-[#3d493f]">
                        Kas diperbarui
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-white p-5">
                    <div className="flex justify-between">
                      <p className="text-sm font-black">Aktivitas terbaru</p>
                      <span className="text-xs font-bold text-[#26735d]">
                        Hari ini
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Pendaftaran siswa baru masuk",
                        "Pembayaran SPP diterima",
                        "Pengeluaran ATK dicatat",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl border border-black/5 p-3"
                        >
                          <span
                            className={`h-8 w-1.5 rounded-full ${index === 0 ? "bg-[#b8d44b]" : index === 1 ? "bg-[#badfd2]" : "bg-[#f5d3a6]"}`}
                          />
                          <span className="truncate text-xs font-bold sm:text-sm">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-[#6b756e]">
                Data pada contoh tampilan hanya ilustrasi.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
              Masalah yang kami rapikan
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
              Sekolah bergerak setiap hari. Informasinya jangan tertinggal.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {problems.map(([Icon, title, description], index) => (
              <article
                key={title}
                className="rounded-[1.75rem] border border-black/10 bg-white/65 p-7"
              >
                <div className="flex justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#173f35] text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-sm font-bold text-[#9aa29c]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-[#59645d]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="fitur" className="scroll-mt-20 bg-[#173f35] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#cfe766]">
                Satu tempat kerja
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
                Dari pendaftaran sampai administrasi, tetap terhubung.
              </h2>
              <p className="mt-5 leading-7 text-white/65">
                Pendaftaran online dan pantauan owner terhubung dengan pekerjaan
                admin: data siswa, SPP, kas, inventaris, dan payroll.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 sm:grid-cols-2">
              {features.map(([Icon, title, description]) => (
                <article
                  key={title}
                  className="bg-[#173f35] p-7 hover:bg-[#1c4b3f]"
                >
                  <Icon className="h-6 w-6 text-[#cfe766]" />
                  <h3 className="mt-5 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="cara-kerja"
          className="scroll-mt-20 border-b border-black/10"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
              Mulai tanpa bingung
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.045em] sm:text-5xl">
              Dari demo ke pilot dalam tiga langkah.
            </h2>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {steps.map(([number, title, description]) => (
                <article
                  key={number}
                  className="relative overflow-hidden rounded-[1.75rem] bg-[#e9e4d9] p-8"
                >
                  <span className="absolute -right-3 -top-8 text-[8rem] font-black text-white/60">
                    {number}
                  </span>
                  <div className="relative">
                    <span className="rounded-full bg-[#173f35] px-3 py-1 text-xs font-black text-[#dfe99a]">
                      LANGKAH {number}
                    </span>
                    <h3 className="mt-16 text-2xl font-black">{title}</h3>
                    <p className="mt-3 leading-7 text-[#59645d]">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid overflow-hidden rounded-[2rem] bg-[#dfe99a] shadow-xl lg:grid-cols-[1.2fr_.8fr]">
            <div className="p-8 sm:p-12">
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
                Program pilot terbatas
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-5xl">
                Mulai dengan alur yang paling dibutuhkan.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#465147]">
                Bukan sekadar diberi akun. Tim sekolah mendapat bantuan setup,
                impor data awal, dan onboarding remote.
              </p>
            </div>
            <div className="flex flex-col justify-between bg-[#173f35] p-8 text-white sm:p-12">
              <ul className="space-y-4">
                {[
                  "Demo kebutuhan 20 menit",
                  "Bantuan setup awal",
                  "Bantuan impor data",
                  "Onboarding tim secara online",
                ].map((item) => (
                  <li key={item} className="flex gap-3 font-bold">
                    <Check className="h-6 w-6 rounded-full bg-[#dfe99a] p-1 text-[#173f35]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#dfe99a] px-6 py-4 font-black text-[#173f35] hover:bg-[#e9f4a3]"
              >
                Tanya jadwal demo <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 bg-[#ede9df]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
                Pertanyaan umum
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
                Sebelum Anda memutuskan.
              </h2>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black">
                    {question}
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-black/15 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pt-4 leading-7 text-[#59645d]">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#173f35] text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center lg:px-10">
            <h2 className="max-w-2xl text-3xl font-black tracking-[-.04em] sm:text-4xl">
              Bawa satu masalah administrasi. Kita bahas solusinya dalam 20
              menit.
            </h2>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#dfe99a] px-7 py-4 font-black text-[#173f35]"
            >
              <MessageCircle className="h-5 w-5" /> Hubungi via WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[#f7f4ed]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="font-black">{APP_NAME}</p>
            <p className="mt-2 text-sm text-[#657068]">
              Administrasi operasional sekolah dalam satu dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-bold">
            <Link href="/fitur">Fitur</Link>
            <Link href="/solusi">Solusi</Link>
            <Link href="/panduan">Panduan</Link>
            <Link href="/pricing">Harga</Link>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#faq">FAQ</a>
            <Link href="/login">Login</Link>
          </div>
        </div>
        <div className="border-t border-black/10 px-5 py-5 text-center text-xs text-[#6f7972]">
          &copy; {new Date().getFullYear()} {APP_NAME} · Dikembangkan oleh{" "}
          {POWERED_BY}
        </div>
      </footer>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Jadwalkan demo melalui WhatsApp"
        className="fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#173f35] text-white shadow-xl ring-4 ring-[#f7f4ed] sm:hidden"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
