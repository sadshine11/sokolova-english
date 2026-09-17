/* Снимает страницы целиком на нескольких ширинах — для визуальной проверки.
   node scripts/shots.mjs [baseUrl] [outDir] [--sections] */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://localhost:4321/sokolova-english/';
const OUT = process.argv[3] ?? 'shots';
const WITH_SECTIONS = process.argv.includes('--sections');

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'wide', width: 1600, height: 1000 },
];

const PAGES = [
  { name: 'home', path: '' },
  { name: 'policy', path: 'policy' },
];

const problems = [];

const browser = await chromium.launch();
await fs.mkdir(OUT, { recursive: true });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: 'ru-RU',
  });

  for (const page of PAGES) {
    const tab = await context.newPage();

    tab.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(`[console ${vp.name}/${page.name}] ${msg.text()}`);
    });
    tab.on('pageerror', (err) => problems.push(`[pageerror ${vp.name}/${page.name}] ${err.message}`));
    tab.on('requestfailed', (req) =>
      problems.push(`[404? ${vp.name}/${page.name}] ${req.url()} — ${req.failure()?.errorText}`)
    );

    await tab.goto(BASE + page.path, { waitUntil: 'networkidle' });

    /* Прокручиваем до конца, чтобы сработали появления блоков и ленивые картинки */
    await tab.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });
    await tab.waitForTimeout(500);

    await tab.screenshot({ path: `${OUT}/${page.name}-${vp.name}.png`, fullPage: true });

    /* Горизонтальное переполнение — самая частая поломка на мобильном */
    const overflow = await tab.evaluate(() => {
      const de = document.documentElement;
      const bad = [];
      if (de.scrollWidth > de.clientWidth + 1) {
        document.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width && (r.right > de.clientWidth + 1 || r.left < -1)) {
            bad.push(
              `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} → ${Math.round(r.left)}..${Math.round(r.right)}`
            );
          }
        });
      }
      return { doc: de.scrollWidth, client: de.clientWidth, bad: bad.slice(0, 8) };
    });
    if (overflow.doc > overflow.client + 1) {
      problems.push(
        `[overflow ${vp.name}/${page.name}] ${overflow.doc} > ${overflow.client}\n    ` +
          overflow.bad.join('\n    ')
      );
    }

    if (WITH_SECTIONS && page.name === 'home') {
      const ids = await tab.$$eval('main section[id]', (els) => els.map((e) => e.id));
      for (const id of ids) {
        const el = await tab.$(`#${id}`);
        await el?.screenshot({ path: `${OUT}/sec-${id}-${vp.name}.png` }).catch(() => {});
      }
    }

    await tab.close();
  }

  await context.close();
}

await browser.close();

if (problems.length) {
  console.log('\n=== НАЙДЕНО ===');
  problems.forEach((p) => console.log(' • ' + p));
} else {
  console.log('\nОшибок консоли, битых запросов и переполнений нет.');
}
console.log(`\nСнимки: ${OUT}/`);
