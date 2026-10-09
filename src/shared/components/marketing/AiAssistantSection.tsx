'use client';

import { ArrowRight, Check, MessageCircle, Send } from 'lucide-react';

const benefits = [
  'Jawaban berdasarkan dokumentasi resmi SekolahRapi',
  'Tanya fitur, harga, dan cara pakai — 24 jam',
  'Lanjut ke demo WhatsApp dari obrolan yang sama',
] as const;

export function AiAssistantSection({ whatsappUrl }: { whatsappUrl: string }) {
  const openChat = () => {
    window.dispatchEvent(new Event('sekolah-rapi:tanya-open'));
  };

  return (
    <section className="border-b border-black/10 bg-[#f7f4ed]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[.18em] text-[#26735d]">
            Tanya Arblok, asisten cerdas 24 jam
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-5xl">
            Sebelum demo, tanya dulu ke Tanya Arblok.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#59645d]">
            Tidak perlu menunggu balasan orang untuk tahu fitur, harga, atau
            cara pakai SekolahRapi. Tanya Arblok menjawab langsung dari
            halaman ini, lengkap dan kapan saja.
          </p>
          <ul className="mt-7 space-y-3">
            {benefits.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-bold text-[#435048]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#dfe99a] text-[#173f35]">
                  <Check className="h-4 w-4" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openChat}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f35] px-7 py-4 font-black text-white shadow-[0_7px_0_#b8d44b] transition hover:-translate-y-1 hover:bg-[#205546]"
            >
              <MessageCircle className="h-5 w-5" /> Tanya sekarang
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white/60 px-7 py-4 font-black hover:bg-white"
            >
              Konsultasi via WhatsApp <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div
          className="relative mx-auto w-full max-w-xl"
          aria-label="Contoh percakapan dengan Tanya Arblok, asisten SekolahRapi"
        >
          <div className="-rotate-1 rounded-[2rem] bg-[#173f35] p-3 shadow-[0_28px_70px_rgba(23,63,53,.22)] transition hover:rotate-0 sm:p-4">
            <div className="rounded-[1.4rem] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 text-white">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-black">Tanya Arblok</p>
                    <p className="text-xs font-bold text-[#647169]">
                      Asisten resmi Arblok Digital
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#dfe99a] px-3 py-1.5 text-xs font-bold text-[#173f35]">
                  Online 24 jam
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white">
                    SPP yang belum bayar bisa dilacak gak?
                  </p>
                </div>
                <div className="flex justify-start">
                  <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#ede9df] px-4 py-2.5 text-sm leading-relaxed text-[#435048]">
                    Bisa. Menu SPP punya daftar tunggakan per siswa, lengkap
                    dengan nominal dan bulannya.
                  </p>
                </div>
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white">
                    Harga paketnya berapa?
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-black/10 bg-[#f7f4ed] px-4 py-3">
                <span className="flex-1 text-sm text-[#9aa29c]">
                  Tanya fitur, harga, cara pakai...
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
                  <Send className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-[#6b756e]">
            Contoh percakapan hanya ilustrasi.
          </p>
        </div>
      </div>
    </section>
  );
}
