import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, '.ai');
const DEV_OUT = path.join(ROOT, '.knowledge');
const MARKETING_DIR = path.join(ROOT, 'marketing');

const files = [
  'README.md',
  'PRODUCT-TRUTH.md',
  'ARCHITECTURE-MAP.md',
  'BUSINESS-MARKETING.md',
  'DECISIONS.md',
  'PRICING-ENTITLEMENT-PIPELINE.md',
  'ORGANIC-GROWTH-ROADMAP.md',
  'TASKS.md',
  'CHANGELOG.md',
  'PROMPTS.md',
  'FOUNDER.md',
];

async function read(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

async function main() {
  let content = '# SekolahRapi Knowledge Pack (auto-generated)\n\n';
  content += '> Kompilasi dokumen .ai/* + marketing untuk AI assistant chat. Jangan membaca source code mentah kecuali diminta.\n\n';
  
  for (const f of files) {
    const p = path.join(AI_DIR, f);
    const txt = await read(p);
    if (txt) {
      content += `\n\n---\n\n## ${f}\n\n${txt}`;
    }
  }
  
  const m1 = await read(path.join(MARKETING_DIR, 'artikel-iklan-sekolahrapi.md'));
  const m2 = await read(path.join(MARKETING_DIR, 'tiktok-carousel-sekolahrapi.md'));
  if (m1 || m2) {
    content += '\n\n---\n\n## MARKETING\n\n';
    if (m1) content += '\n\n### artikel-iklan-sekolahrapi.md\n\n' + m1;
    if (m2) content += '\n\n### tiktok-carousel-sekolahrapi.md\n\n' + m2;
  }
  
  await fs.mkdir(DEV_OUT, { recursive: true });
  await fs.writeFile(path.join(DEV_OUT, 'knowledge-pack.md'), content);
  console.log('OK', content.length);
}
main();
