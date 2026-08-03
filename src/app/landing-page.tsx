import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  Check,
  ChevronRight,
  FileSpreadsheet,
  MessageCircle,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { MarketingLayout } from "@/shared/components/marketing/MarketingLayout";

const whatsappUrl =
  "https://wa.me/6289508053795?text=Halo%20SekolahRapi%2C%20saya%20ingin%20jadwalkan%20demo%2020%20menit.";

const problemSignals = [
  {
    icon: BookOpenCheck,
    title: "Pendaftar harus disalin ulang",
    description:
      "Data calon siswa datang dari chat, formulir kertas, dan file yang berbeda.",
  },
  {
    icon: BarChart3,
    title: "Owner menunggu rekap",
    description:
      "Posisi uang sekolah baru terlihat setelah admin merangkum catatan yang terpencar.",
  },
  {
    icon: FileSpreadsheet,
    title: "Admin berpindah-pindah file",
    description:
      "Data siswa, SPP, kas, inventaris, dan penggajian berjalan sendiri-sendiri.",
  },
] as const;

const solutionPillars = [
  {
    icon: BookOpenCheck,
    eyebrow: "Penerimaan siswa",
    title: "Data pendaftar langsung masuk ke alur administrasi.",
    description:
      "Gunakan formulir online untuk menerima calon siswa, lalu lanjutkan pengelolaan datanya tanpa menyalin dari chat atau kertas.",
    bullets: ["Formulir pendaftaran online", "Review calon siswa", "Data siswa terpusat"],
    href: "/fitur/pendaftaran-siswa-online",
    linkLabel: "Pelajari alur pendaftaran",
  },
  {
    icon: WalletCards,
    eyebrow: "Keuangan sekolah",
    title: "SPP, kas, dan laporan berada dalam satu alur pencatatan.",
    description:
      "Bendahara mencatat pembayaran serta transaksi. Owner melihat aktivitas terbaru tanpa meminta rekap baru setiap saat.",
    bullets: ["Status SPP dan tunggakan", "Pemasukan dan pengeluaran", "Laporan yang tersedia"],
    href: "/fitur/keuangan-sekolah",
    linkLabel: "Pelajari alur keuangan",
  },
  {
    icon: Boxes,
    eyebrow: "Operasional harian",
    title: "Pekerjaan admin tetap terhubung saat kebutuhan bertambah.",
    description:
      "Kelola inventaris dan data penggajian bersama data utama sekolah, bukan sebagai catatan terpisah yang sulit ditelusuri.",
    bullets: ["Inventaris sekolah", "Penggajian guru dan staf", "Impor data awal dari Excel"],
    href: "/fitur",
    linkLabel: "Lihat semua fitur",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Petakan satu masalah utama",
    description:
      "Ceritakan alur yang paling menghambat—pendaftaran, SPP, kas, atau administrasi data.",
  },
  {
    number: "02",
    title: "Lihat alurnya dalam demo",
    description:
      "Kami tunjukkan bagian SekolahRapi yang relevan, bukan presentasi panjang tentang semua fitur.",
  },
  {
    number: "03",
    title: "Mulai dari data prioritas",
    description:
      "Setup, impor data awal, dan onboarding remote membantu admin memulai secara bertahap.",
  },
] as const;

const useCases = [
  {
    icon: BarChart3,
    title: "Owner yayasan",
    description: "Butuh pantauan operasional tanpa menunggu rekap manual.",
    href: "/solusi",
  },
  {
    icon: School,
    title: "Sekolah swasta",
    description: "Ingin menyatukan penerimaan siswa dan administrasi rutin.",
    href: "/solusi/sekolah-swasta",
  },
  {
    icon: Users,
    title: "Madrasah",
    description: "Membutuhkan pencatatan yang lebih rapi dengan proses bertahap.",
    href: "/solusi/madrasah",
  },
] as const;

const faqs = [
  {
    question: "Apakah semua data harus langsung dipindahkan?",
    answer:
      "Tidak. Sekolah dapat mulai dari data dan alur yang paling penting, kemudian menambah bagian lain secara bertahap.",
  },
  {
    question: "Siapa yang sebaiknya mengikuti demo?",
    answer:
      "Owner yayasan, kepala sekolah, bendahara, atau admin yang memahami proses administrasi sekolah saat ini.",
  },
  {
    question: "Apakah SekolahRapi bisa digunakan saat internet terganggu?",
    answer:
      "SekolahRapi memiliki dukungan PWA dan kemampuan offline untuk alur tertentu. Cakupan yang sesuai kebutuhan sekolah dijelaskan saat demo.",
  },
  {
    question: "Bagaimana akses data antar sekolah dipisahkan?",
    answer:
      "Data operasional memakai identitas sekolah dan kebijakan Row Level Security untuk membantu membatasi akses antar sekolah.",
  },
  {
    question: "Apakah saya harus memilih paket sebelum demo?",
    answer:
      "Tidak. Anda dapat melihat gambaran paket di halaman Harga, lalu menggunakan demo untuk memastikan alur yang dibutuhkan sekolah.",
  },
] as const;

export default function LandingPage() {
  return (
    <MarketingLayout>
      <section className="relative border-b border-[#17211b]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(184,212,75,.25),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(42,121,96,.12),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#173f35]/15 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-[#26735d]">
              <Sparkles className="h-4 w-4" /> Satu alur administrasi sekolah
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">
              Pendaftaran masuk.
              <span className="block text-[#26735d]">Kas langsung terpantau.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#435048] sm:text-xl">
              SekolahRapi menghubungkan penerimaan siswa, SPP, kas, dan pekerjaan
              admin dalam satu web app—agar tim tidak terus menyalin data dan
              owner tidak terus menunggu rekap.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f35] px-7 py-4 font-black text-white shadow-[0_7px_0_#b8d44b] transition hover:-translate-y-1 hover:bg-[#205546]"
              >
                <MessageCircle className="h-5 w-5" /> Lihat demo 20 menit
              </a>
              <a
                href="#alur"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white/60 px-7 py-4 font-black hover:bg-white"
              >
                Lihat alur kerjanya <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[#536058]">
              {["Demo sesuai kebutuhan", "Setup dibantu", "Mulai bertahap"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-5 w-5 rounded-full bg-[#dfe99a] p-1 text-[#173f35]" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl"
            aria-label="Ilustrasi dashboard SekolahRapi"
          >
            <div className="rotate-1 rounded-[2rem] bg-[#173f35] p-3 shadow-[0_28px_70px_rgba(23,63,53,.22)] transition hover:rotate-0 sm:p-4">
              <div className="rounded-[1.4rem] bg-[#f7f4ed] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#647169]">
                      Satu pantauan
                    </p>
                    <p className="mt-1 font-black">Aktivitas sekolah hari ini</p>
                  </div>
                  <span className="rounded-full bg-[#dfe99a] px-3 py-1.5 text-xs font-bold text-[#173f35]">
                    Diperbarui
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <BookOpenCheck className="h-5 w-5 text-[#26735d]" />
                    <p className="mt-5 text-2xl font-black">24</p>
                    <p className="text-xs font-bold text-[#667169]">Pendaftar baru</p>
                  </div>
                  <div className="rounded-2xl bg-[#dfe99a] p-4">
                    <WalletCards className="h-5 w-5" />
                    <p className="mt-5 text-2xl font-black">Hari ini</p>
                    <p className="text-xs font-bold text-[#3d493f]">Kas diperbarui</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-white p-5">
                  <div className="flex justify-between">
                    <p className="text-sm font-black">Alur yang terhubung</p>
                    <span className="text-xs font-bold text-[#26735d]">Terbaru</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Pendaftaran siswa baru masuk",
                      "Pembayaran SPP dicatat",
                      "Pengeluaran operasional diperbarui",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-black/5 p-3"
                      >
                        <span
                          className={`h-8 w-1.5 rounded-full ${index === 0 ? "bg-[#b8d44b]" : index === 1 ? "bg-[#badfd2]" : "bg-[#f5d3a6]"}`}
                        />
                        <span className="truncate text-xs font-bold sm:text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-[#6b756e]">
              Angka pada contoh tampilan hanya ilustrasi.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
            Jika prosesnya terpencar
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
            Rekap bukan pekerjaan utama. Tetapi setiap hari tim harus mengejarnya.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#59645d]">
            SekolahRapi merapikan titik yang paling sering memutus aliran informasi
            antara calon siswa, admin, bendahara, dan owner.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {problemSignals.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="rounded-[1.75rem] border border-black/10 bg-white/70 p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#173f35] text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-mono text-sm font-bold text-[#9aa29c]">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-[#59645d]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="alur" className="scroll-mt-20 bg-[#173f35] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#cfe766]">
                Satu perjalanan kerja
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
                Mulai dari data masuk. Berakhir pada pantauan yang jelas.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/70 lg:justify-self-end">
              Tidak perlu memahami semua modul sekaligus. Pilih alur yang ingin
              dirapikan, lalu buka halaman detail saat Anda membutuhkan penjelasan
              lebih dalam.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {solutionPillars.map(
              ({ icon: Icon, eyebrow, title, description, bullets, href, linkLabel }) => (
                <article
                  key={title}
                  className="flex flex-col rounded-[1.75rem] border border-white/10 bg-white/[.06] p-7 transition hover:-translate-y-1 hover:bg-white/[.09]"
                >
                  <Icon className="h-7 w-7 text-[#cfe766]" />
                  <p className="mt-7 text-xs font-black uppercase tracking-[.16em] text-[#cfe766]">
                    {eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">{title}</h3>
                  <p className="mt-4 leading-7 text-white/65">{description}</p>
                  <ul className="mt-6 space-y-3">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3 text-sm font-bold">
                        <Check className="h-5 w-5 rounded-full bg-[#dfe99a] p-1 text-[#173f35]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className="mt-8 inline-flex items-center gap-2 border-t border-white/10 pt-6 text-sm font-black text-[#dfe99a] hover:text-white"
                  >
                    {linkLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
                Mulai tanpa memindahkan semuanya
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
                Demo yang berangkat dari masalah sekolah Anda.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-[#59645d]">
                Ini bukan keputusan besar di awal. Gunakan 20 menit untuk melihat
                apakah satu alur prioritas memang bisa dibuat lebih rapi.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#173f35] px-6 py-3.5 font-black text-white shadow-[0_6px_0_#b8d44b] transition hover:-translate-y-1"
              >
                Jadwalkan demo <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <ol className="space-y-5">
              {steps.map(({ number, title, description }) => (
                <li
                  key={number}
                  className="grid gap-5 rounded-[1.75rem] border border-black/10 bg-white/70 p-7 sm:grid-cols-[5rem_1fr] sm:p-8"
                >
                  <span className="text-5xl font-black text-[#26735d]">{number}</span>
                  <div>
                    <h3 className="text-2xl font-black">{title}</h3>
                    <p className="mt-3 leading-7 text-[#59645d]">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
            Lihat sesuai konteks Anda
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-.045em] sm:text-5xl">
            Satu produk, titik mulai yang berbeda untuk setiap sekolah.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {useCases.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-[1.75rem] border border-black/10 bg-white/70 p-7 transition hover:-translate-y-1 hover:border-[#26735d]/40 hover:bg-white"
            >
              <Icon className="h-7 w-7 text-[#26735d]" />
              <h3 className="mt-7 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-[#59645d]">{description}</p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#26735d]">
                Lihat solusi <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#dfe99a]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
              Masih ingin memeriksa lebih jauh?
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.04em] sm:text-4xl">
              Halaman berikut adalah pendalaman dari perjalanan yang sama.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/panduan"
              className="rounded-full border border-[#173f35]/20 bg-white/65 px-5 py-3 text-sm font-black hover:bg-white"
            >
              Baca panduan
            </Link>
            <Link
              href="/pricing"
              className="rounded-full bg-[#173f35] px-5 py-3 text-sm font-black text-white hover:bg-[#205546]"
            >
              Lihat harga
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-[#ede9df]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
              Pertanyaan sebelum mulai
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
              Pastikan alurnya sesuai, baru lanjutkan.
            </h2>
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#173f35]/10 bg-white/55 p-4 text-sm leading-6 text-[#526158]">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#26735d]" />
              Demo tidak mengharuskan Anda memindahkan data atau langsung memilih paket.
            </div>
          </div>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black">
                  {question}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/15 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pt-4 leading-7 text-[#59645d]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#173f35] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#cfe766]">
              Mulai dari satu masalah
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-.04em] sm:text-4xl">
              Tunjukkan alur yang membuat tim sibuk merekap. Kita lihat cara merapikannya.
            </h2>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#dfe99a] px-7 py-4 font-black text-[#173f35] hover:bg-[#e9f4a3]"
          >
            <MessageCircle className="h-5 w-5" /> Lihat demo 20 menit
          </a>
        </div>
      </section>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Jadwalkan demo melalui WhatsApp"
        className="fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#173f35] text-white shadow-xl ring-4 ring-[#f7f4ed] sm:hidden"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </MarketingLayout>
  );
}