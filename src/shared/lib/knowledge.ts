import fs from 'fs/promises';
import path from 'path';

let cached: string | null = null;

export async function getKnowledgePack(): Promise<string> {
  if (cached) return cached;
  const candidates = [
    path.join(process.cwd(), '.knowledge', 'knowledge-pack.md'),
    path.join(process.cwd(), '.ai', 'README.md'),
    path.join(process.cwd(), '.ai', 'PRODUCT-TRUTH.md'),
  ];

  for (const p of candidates) {
    try {
      const t = await fs.readFile(p, 'utf8');
      if (t) {
        cached = t;
        return t;
      }
    } catch {
      // ignore
    }
  }
  return 'Knowledge pack belum tersedia. AI hanya menjawab berdasarkan konteks umum produk Arblok Digital.';
}
