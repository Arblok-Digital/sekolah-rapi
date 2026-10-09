'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function TanyaArblok({ context = 'general' }: { context?: 'landing' | 'dashboard' | 'general' }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Halo! Aku bisa bantu jelasin fitur SekolahRapi atau cara pakainya. Mau tanya apa?',
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const headerTitle = useMemo(() => 'Tanya Arblok', []);
  const showFab = true;
  // Dashboard: chat harus DI BAWAH modal/drawer (z-50) supaya gak nutupin tombol Simpan di HP.
  const zClass = context === 'dashboard' ? 'z-[45]' : 'z-[90]';

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading, open]);

  // Section marketing bisa meminta chat dibuka (tombol "Tanya sekarang").
  useEffect(() => {
    const forceOpen = () => {
      setMinimized(false);
      setOpen(true);
    };
    window.addEventListener('sekolah-rapi:tanya-open', forceOpen);
    return () => window.removeEventListener('sekolah-rapi:tanya-open', forceOpen);
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: q };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: [...messages, userMsg].map((x) => ({ role: x.role, content: x.content })),
        }),
      });

      if (!res.ok || !res.body) {
        let msg = 'Maaf, asisten sedang tidak tersedia. Coba kirim ulang beberapa detik lagi ya.';
        try {
          const text = await res.text();
          try {
            const parsed = JSON.parse(text);
            if (typeof parsed?.error === 'string' && parsed.error.trim()) msg = parsed.error;
          } catch {
            /* body bukan JSON — pakai pesan ramah default */
          }
        } catch {
          /* baca body gagal — tetap pakai pesan ramah default */
        }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = crypto.randomUUID();
      setMessages((m) => [...m, { id: assistantId, role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const piece = decoder.decode(value, { stream: true });
        if (!piece) continue;
        setMessages((m) =>
          m.map((x) => (x.id === assistantId ? { ...x, content: (x.content + piece).slice(0, 50000) } : x)),
        );
      }
    } catch (e: any) {
      const raw = String(e?.message || '');
      const friendly = /Maaf|coba lagi|Coba kirim ulang|terlalu banyak|Terlalu banyak/i.test(raw);
      const msg = friendly
        ? raw
        : 'Maaf, koneksi bermasalah. Coba kirim ulang beberapa detik lagi ya.';
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) {
    const bottomOffset =
      context === 'dashboard'
        ? 'bottom-[6.5rem]'
        : context === 'landing'
          ? 'bottom-[6.5rem] sm:bottom-5'
          : 'bottom-5';
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Tanya Arblok"
        className={`fixed right-4 ${zClass} ${bottomOffset} inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-emerald-500 hover:to-emerald-400 sm:px-5`}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Tanya Arblok</span>
      </button>
    );
  }

  const panelBottom = context === 'dashboard' ? 'bottom-[6.5rem]' : 'bottom-5';
  const maxH = minimized ? 'h-14' : 'h-[min(28rem,80dvh)]';

  return (
    <div className={`fixed right-3 ${zClass} w-[calc(100vw-1.5rem)] sm:right-4 sm:w-96 ${panelBottom}`}>
      <div className={`flex ${maxH} flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f1f1a]/95 shadow-2xl backdrop-blur-lg transition-all`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{headerTitle}</p>
              <p className="text-xs text-white/50">Arblok Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized((v) => !v)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/5 hover:text-white">
              {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                        : 'bg-white/5 text-white/90'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-white/40">Mengetik...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-white/10 p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Tanya fitur, harga, cara pakai..."
                className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 text-sm font-medium text-white transition-all hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Kirim
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
