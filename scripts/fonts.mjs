import fs from 'node:fs/promises';
import path from 'node:path';

const css = await fs.readFile(process.env.GF_CSS, 'utf8');
const OUT = 'public/fonts';
await fs.mkdir(OUT, { recursive: true });

// Split into "/* subset */ @font-face {...}" chunks
const chunks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
const keep = new Set(['cyrillic', 'latin']);
const out = [];

for (const [, subset, body] of chunks) {
  if (!keep.has(subset)) continue;
  const family = /font-family:\s*'([^']+)'/.exec(body)[1];
  const weight = /font-weight:\s*(\d+)/.exec(body)[1];
  const url = /url\((https:[^)]+)\)/.exec(body)[1];
  const range = /unicode-range:\s*([^;]+);/.exec(body)[1].trim();

  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const file = `${slug}-${weight}-${subset}.woff2`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  await fs.writeFile(path.join(OUT, file), Buffer.from(await res.arrayBuffer()));

  out.push(
    `@font-face {\n` +
    `  font-family: '${family}';\n` +
    `  font-style: normal;\n` +
    `  font-weight: ${weight};\n` +
    `  font-display: swap;\n` +
    `  src: url('/fonts/${file}') format('woff2');\n` +
    `  unicode-range: ${range};\n` +
    `}`
  );
}

await fs.writeFile('src/styles/fonts.css', out.join('\n\n') + '\n');
console.log(`wrote ${out.length} @font-face rules`);
