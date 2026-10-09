import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { buildSystemPrompt } from '@/shared/lib/chat-rules';
import { getKnowledgePack } from '@/shared/lib/knowledge';
import { APP_URL } from '@/shared/constants';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQ = 10;
const rateLimitMap = new Map<string, { count: number; ts: number }>();

function getClientIp(req: NextRequest) {
  const h = req.headers;
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const xr = h.get('x-real-ip');
  if (xr) return xr.trim();
  return 'unknown';
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const cur = rateLimitMap.get(ip);
  if (!cur || now - cur.ts > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, ts: now });
    return { ok: true };
  }
  if (cur.count >= RATE_LIMIT_MAX_REQ) {
    return { ok: false, retryAfter: Math.ceil((cur.ts + RATE_LIMIT_WINDOW_MS - now) / 1000) };
  }
  cur.count++;
  return { ok: true };
}

export const runtime = 'nodejs';

/** Pesan error dari SDK sering JSON bertingkat — gali jadi teks manusiawi. */
function extractGeminiMessage(raw: string): string {
  let msg = raw;
  for (let i = 0; i < 3; i++) {
    try {
      const parsed = JSON.parse(msg);
      const next = parsed?.error?.message ?? parsed?.message;
      if (typeof next === 'string' && next.trim()) {
        msg = next;
        continue;
      }
    } catch {
      /* bukan JSON — pakai apa adanya */
    }
    break;
  }
  return msg;
}

/** Pesan ramah untuk pengunjung; detail asli tetap di-log di server. */
function friendlyChatError(raw: string): string {
  const inner = extractGeminiMessage(raw);
  if (/UNAVAILABLE|high demand|overloaded|503|try again later/i.test(inner)) {
    return 'Maaf, jaringan asisten sedang sibuk. Coba kirim ulang beberapa detik lagi ya.';
  }
  if (/429|quota|RESOURCE_EXHAUSTED/i.test(inner)) {
    return 'Maaf, batas pemakaian asisten sedang tercapai. Coba lagi sebentar lagi ya.';
  }
  return 'Maaf, asisten sedang tidak tersedia. Coba kirim ulang beberapa detik lagi ya.';
}

/**
 * Stream dari OpenRouter (kompatibel OpenAI) -> generator teks.
 * Fetch dieager supaya error (key/model salah) ketahuan sebelum rantai fallback berjalan.
 * Model bisa lewat OPENROUTER_MODEL (boleh dipisah koma — OpenRouter handle fallback sendiri).
 */
async function createOpenRouterTexts(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<AsyncGenerator<string>> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY belum diatur');
  const model =
    process.env.OPENROUTER_MODEL?.trim() || 'meta-llama/llama-3.3-70b-instruct:free';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': APP_URL,
      'X-Title': 'SekolahRapi',
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content || '' })),
      ],
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${t.slice(0, 300)}`);
  }
  const body = res.body;
  return (async function* () {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') return;
          let json: any;
          try {
            json = JSON.parse(data);
          } catch {
            continue; // baris SSE belum lengkap / bukan JSON
          }
          if (json?.error) {
            throw new Error(
              typeof json.error === 'string'
                ? json.error
                : json.error?.message || 'OpenRouter error',
            );
          }
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) yield delta;
        }
      }
    } finally {
      reader.cancel().catch(() => {});
    }
  })();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey && !openrouterKey) {
      console.error('[chat] GEMINI_API_KEY / OPENROUTER_API_KEY belum diatur di server');
      return new Response(
        JSON.stringify({ error: 'Maaf, asisten sedang tidak tersedia. Coba lagi nanti ya.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const ip = getClientIp(req);
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return new Response(
        JSON.stringify({ error: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi ya.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rl.retryAfter || 60),
          },
        },
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context === 'landing' || body.context === 'dashboard' ? body.context : 'general';
    const model = body.model || 'gemini-3.5-flash-lite';

    const knowledge = await getKnowledgePack();
    const systemPrompt = buildSystemPrompt(context, knowledge);

    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const requestConfig = {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            maxOutputTokens: 4096,
          };
          const backupModel = model === 'gemini-3.5-flash' ? 'gemini-3.5-flash-lite' : 'gemini-3.5-flash';

          // Rantai provider: Gemini (2 model) -> OpenRouter.
          // Provider gagal (sibuk / model gonta-ganti / auth) -> lanjut ke berikutnya.
          const chain: Array<{ name: string; create: () => Promise<AsyncGenerator<string>> }> = [];
          if (ai) {
            const geminiModels = model === backupModel ? [model] : [model, backupModel];
            for (const m of geminiModels) {
              chain.push({
                name: `gemini:${m}`,
                create: async () => {
                  const r = await ai.models.generateContentStream({
                    model: m,
                    config: requestConfig,
                    contents,
                  });
                  return (async function* () {
                    for await (const chunk of r) {
                      const text = chunk.text || '';
                      if (text) yield text;
                    }
                  })();
                },
              });
            }
          }
          if (openrouterKey) {
            chain.push({
              name: 'openrouter',
              create: () => createOpenRouterTexts(systemPrompt, messages),
            });
          }

          let source: AsyncGenerator<string> | null = null;
          let lastErr: any;
          for (let i = 0; i < chain.length; i++) {
            try {
              source = await chain[i].create();
              if (i > 0) console.error(`[chat] fallback aktif di provider: ${chain[i].name}`);
              break;
            } catch (e: any) {
              lastErr = e;
              const msg = `${e?.message || ''} ${e?.status || ''}`;
              console.error(
                `[chat] ${chain[i].name} gagal: ${extractGeminiMessage(msg).slice(0, 250)}`,
              );
            }
          }
          if (!source) {
            throw lastErr || new Error('Semua provider chat gagal');
          }

          for await (const text of source) {
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (e: any) {
          const msg = e?.message || 'Gagal menghubungi asisten';
          console.error('[chat] stream error:', extractGeminiMessage(msg));
          controller.enqueue(encoder.encode(`\n\n⚠️ ${friendlyChatError(msg)}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    console.error('[chat] request error:', err?.message || err);
    return new Response(
      JSON.stringify({ error: 'Maaf, asisten sedang tidak tersedia. Coba kirim ulang beberapa detik lagi ya.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
