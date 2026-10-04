import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { buildSystemPrompt } from '@/shared/lib/chat-rules';
import { getKnowledgePack } from '@/shared/lib/knowledge';

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

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY belum diatur di .env.local' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ip = getClientIp(req);
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return new Response(JSON.stringify({ error: 'Terlalu banyak permintaan. Coba sebentar lagi.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter || 60),
        },
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context === 'landing' || body.context === 'dashboard' ? body.context : 'general';
    const model = body.model || 'gemini-3.8-flash';

    const knowledge = await getKnowledgePack();
    const systemPrompt = buildSystemPrompt(context, knowledge);

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.2,
              maxOutputTokens: 4096,
            },
            contents,
          });

          for await (const chunk of response) {
            const text = chunk.text || '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (e: any) {
          const msg = e?.message || 'Gagal menghubungi Gemini';
          controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
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
    return new Response(JSON.stringify({ error: err?.message || 'Terjadi kesalahan' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
