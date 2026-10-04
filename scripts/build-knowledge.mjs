import fs from 'fs/promises';
import path from 'path';
import ts from 'typescript';

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, '.ai');
const DEV_OUT = path.join(ROOT, '.knowledge');
const MARKETING_DIR = path.join(ROOT, 'marketing');
const PANDUAN_SRC = path.join(ROOT, 'src', 'content', 'panduan.ts');

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
  'ARBLOK-DIGITAL.md',
  'FAQ.md',
  'HOWTO-CORE.md',
];

async function read(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

async function loadPanduanArticles() {
  try {
    const src = await fs.readFile(PANDUAN_SRC, 'utf8');
    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const mod = { exports: {} };
    new Function('exports', 'module', js)(mod.exports, mod);
    return mod.exports.PANDUAN_ARTICLES || [];
  } catch (e) {
    console.warn('WARN: panduan gagal dimuat:', e.message);
    return [];
  }
}

function articleToMarkdown(a) {
  let md = `### ${a.title}\n\n`;
  md += `${a.description}\n\n`;
  md += `(Kategori: ${a.category}; baca ${a.readMinutes} menit; penulis: ${a.author})\n\n`;
  for (const s of a.sections) {
    md += `#### ${s.heading}\n\n`;
    for (const p of s.paragraphs || []) md += `${p}\n\n`;
    if (s.list?.length) {
      for (const item of s.list) md += `- ${item}\n`;
      md += '\n';
    }
    if (s.steps?.length) {
      s.steps.forEach((item, i) => md += `${i + 1}. ${item}\n`);
      md += '\n';
    }
  }
  if (a.faq?.length) {
    md += `FAQ artikel ini:\n`;
    for (const f of a.faq) md += `- **${f.q}**\n  ${f.a}\n`;
    md += '\n';
  }
  return md;
}

async function main() {
  let content = '# SekolahRapi Knowledge Pack (auto-generated)\n\n';
  content += '> Kompilasi dokumen .ai/* + panduan + marketing untuk AI assistant chat. Jangan membaca source code mentah kecuali diminta.\n\n';

  for (const f of files) {
    const p = path.join(AI_DIR, f);
    const txt = await read(p);
    if (txt) {
      content += `\n\n---\n\n## ${f}\n\n${txt}`;
    }
  }

  const articles = await loadPanduanArticles();
  if (articles.length) {
    content += `\n\n---\n\n## PANDUAN (${articles.length} artikel dari /panduan)\n\n`;
    for (const a of articles) content += articleToMarkdown(a);
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
  console.log('OK', content.length, 'chars,', articles.length, 'panduan articles');
}
main();
