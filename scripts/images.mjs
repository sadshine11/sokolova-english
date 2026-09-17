/* Генерирует SVG-заглушки под фотографии в палитре проекта.
   Когда придут настоящие снимки — положить их в public/img/
   с теми же именами (.jpg/.webp) и поправить пути в src/content/site.ts. */

import fs from 'node:fs/promises';

const C = {
  paper: '#fcfcfa',
  paper2: '#eff3eb',
  paper3: '#e4ebdf',
  rule: '#c4cfc0',
  ink: '#101711',
  ink600: '#3d4a3c',
  green700: '#0a6b3c',
  green600: '#0c8449',
  green400: '#35b274',
  green100: '#dcefe2',
};

const grain = (id) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
  </filter>`;

const wrap = (w, h, body, gid) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>${grain(gid)}</defs>
  ${body}
  <rect width="${w}" height="${h}" filter="url(#${gid})" opacity="0.9"/>
</svg>
`;

/* Штрихи вместо текста: на таком масштабе рукописная строка читается как ритм */
const strokes = (x, y, widths, gap, color, sw = 6, opacity = 1) =>
  widths
    .map(
      (wd, i) =>
        `<rect x="${x}" y="${y + i * gap}" width="${wd}" height="${sw}" rx="${sw / 2}" fill="${color}" opacity="${opacity}"/>`
    )
    .join('');

/* ── Портрет: силуэт одной цельной фигурой + сдвинутая печать ───────────
   Голова, каре и плечи рисуются одним замкнутым контуром: у составных
   фигур из кругов и дуг «волосы» отрываются от головы и получается снеговик. */
const FIGURE = [
  'M285 350',
  'C285 240 336 186 400 186',
  'C464 186 515 240 515 350',
  'C515 400 519 442 522 476',
  'L530 502',
  'C562 513 601 529 627 557',
  'C657 591 668 641 668 701',
  'L668 1000',
  'L132 1000',
  'L132 701',
  'C132 641 143 591 173 557',
  'C199 529 238 513 270 502',
  'L278 476',
  'C281 442 285 400 285 350',
  'Z',
].join(' ');

const portrait = wrap(
  800,
  1000,
  `
  <rect width="800" height="1000" fill="${C.paper2}"/>
  <path d="M110 1000V356a290 290 0 0 1 580 0v644z" fill="${C.green100}"/>
  <g transform="translate(30 22)" opacity="0.5"><path d="${FIGURE}" fill="${C.green400}"/></g>
  <path d="${FIGURE}" fill="${C.ink}"/>
  <path d="M362 508l38 44 38-44" stroke="${C.green100}" stroke-width="7" fill="none"
        stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
  <path d="M166 918c74-32 152-48 234-48s160 16 234 48" stroke="${C.green700}" stroke-width="7"
        stroke-linecap="round" fill="none" opacity="0.9"/>
`,
  'g1'
);

/* ── Стол: вид сбоку, стопка книг и лампа ──────────────────────────────── */
const photo1 = wrap(
  800,
  1000,
  `
  <rect width="800" height="1000" fill="${C.paper}"/>
  <rect y="780" width="800" height="220" fill="${C.paper3}"/>
  <circle cx="470" cy="300" r="215" fill="${C.green100}" opacity="0.8"/>
  <path d="M470 60v90" stroke="${C.ink600}" stroke-width="8" stroke-linecap="round"/>
  <path d="M386 150h168l-42 74h-84z" fill="${C.ink}"/>

  <rect x="96" y="700" width="300" height="30" rx="4" fill="${C.green700}"/>
  <rect x="116" y="664" width="280" height="30" rx="4" fill="${C.ink}"/>
  <rect x="88" y="628" width="296" height="30" rx="4" fill="${C.green400}"/>
  <rect x="120" y="592" width="240" height="30" rx="4" fill="${C.ink600}"/>

  <path d="M430 736h250v44H430z" fill="${C.paper}" stroke="${C.rule}" stroke-width="3"/>
  <path d="M430 736l-26 44h250l26-44z" fill="${C.paper2}" stroke="${C.rule}" stroke-width="3"/>
  ${strokes(448, 746, [130, 180, 104], 12, C.ink600, 4, 0.5)}

  <rect x="616" y="654" width="86" height="126" rx="10" fill="${C.paper2}" stroke="${C.rule}" stroke-width="3"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${628 + i * 18}" y="${600 + (i % 2) * 14}" width="9" height="${68 - (i % 2) * 14}" rx="4" fill="${i % 2 ? C.green600 : C.ink600}"/>`).join('')}

  <path d="M556 780a46 46 0 0 1 92 0z" fill="none"/>
  <rect y="780" width="800" height="4" fill="${C.rule}"/>
`,
  'g2'
);

/* ── Доска после занятия ───────────────────────────────────────────────── */
const photo2 = wrap(
  1200,
  675,
  `
  <rect width="1200" height="675" fill="${C.paper3}"/>
  <rect x="64" y="52" width="1072" height="530" fill="${C.paper}" stroke="${C.rule}" stroke-width="6"/>
  ${strokes(124, 116, [280, 380, 220], 40, C.ink600, 9, 0.72)}
  <path d="M124 262h268" stroke="${C.green600}" stroke-width="8" stroke-linecap="round"/>
  ${strokes(124, 304, [420, 330], 40, C.ink600, 9, 0.72)}
  <rect x="640" y="112" width="360" height="150" fill="none" stroke="${C.green700}" stroke-width="7" rx="6"/>
  ${strokes(672, 146, [200, 290, 150], 34, C.green700, 8, 0.8)}
  ${strokes(640, 320, [300, 224], 38, C.ink600, 9, 0.6)}
  <path d="M640 412h250" stroke="${C.green600}" stroke-width="8" stroke-linecap="round"/>
  <path d="M124 448l34 34 64-88" stroke="${C.green600}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="64" y="582" width="1072" height="18" fill="${C.rule}"/>
  <rect x="820" y="600" width="110" height="12" rx="6" fill="${C.green700}"/>
`,
  'g3'
);

/* ── Сборники ФИПИ ─────────────────────────────────────────────────────── */
const photo3 = wrap(
  900,
  600,
  `
  <rect width="900" height="600" fill="${C.paper2}"/>
  <rect y="470" width="900" height="130" fill="${C.paper3}"/>
  ${[
    { y: 402, w: 520, c: C.ink },
    { y: 344, w: 470, c: C.green700 },
    { y: 286, w: 540, c: C.green400 },
    { y: 228, w: 440, c: C.ink600 },
    { y: 170, w: 500, c: C.green600 },
  ]
    .map(
      (b, i) =>
        `<g transform="translate(${190 + (i % 2) * 14} 0)">
           <rect x="0" y="${b.y}" width="${b.w}" height="50" rx="4" fill="${b.c}"/>
           <rect x="24" y="${b.y + 14}" width="${Math.round(b.w * 0.42)}" height="8" rx="4" fill="${C.paper}" opacity="0.55"/>
           <rect x="0" y="${b.y + 40}" width="${b.w}" height="10" fill="${C.ink}" opacity="0.14"/>
         </g>`
    )
    .join('')}
  <path d="M640 150c44 18 74 52 84 96" stroke="${C.green700}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect y="470" width="900" height="4" fill="${C.rule}"/>
`,
  'g4'
);

/* ── Онлайн-занятие ────────────────────────────────────────────────────── */
const photo4 = wrap(
  900,
  600,
  `
  <rect width="900" height="600" fill="${C.paper}"/>
  <rect x="150" y="96" width="600" height="368" rx="10" fill="${C.ink}"/>
  <rect x="172" y="118" width="556" height="324" rx="4" fill="${C.paper2}"/>
  <rect x="192" y="138" width="330" height="284" rx="4" fill="${C.green100}"/>
  ${strokes(220, 174, [230, 180, 264, 140], 34, C.green700, 8, 0.7)}
  <path d="M220 348h180" stroke="${C.green600}" stroke-width="9" stroke-linecap="round"/>
  <rect x="542" y="138" width="166" height="134" rx="4" fill="${C.paper3}"/>
  <circle cx="625" cy="196" r="34" fill="${C.ink600}"/>
  <path d="M573 272c0-32 24-52 52-52s52 20 52 52z" fill="${C.ink600}"/>
  <rect x="542" y="290" width="166" height="132" rx="4" fill="${C.paper3}"/>
  <circle cx="625" cy="348" r="34" fill="${C.green700}"/>
  <path d="M573 424c0-32 24-52 52-52s52 20 52 52z" fill="${C.green700}"/>
  <path d="M96 500h708l-44-36H140z" fill="${C.ink600}"/>
  <rect x="330" y="478" width="240" height="8" rx="4" fill="${C.paper2}" opacity="0.4"/>
`,
  'g5'
);

/* ── Результаты выпуска: бланки с баллами, разложенные на столе ─────────
   Девять работ по числу выпускников; высота полосы — балл относительно ста. */
const SCORES = [88, 91, 84, 79, 90, 82, 76, 87, 79];

const photo5 = wrap(
  1200,
  675,
  `
  <rect width="1200" height="675" fill="${C.paper3}"/>
  <circle cx="1010" cy="140" r="150" fill="${C.green100}" opacity="0.7"/>
  ${SCORES.map((score, i) => {
    const col = i % 3;
    const row = (i / 3) | 0;
    const x = 120 + col * 330 + row * 26;
    const y = 74 + row * 176;
    const tilt = [-1.6, 0.9, -0.6][i % 3];
    const bar = Math.round((score / 100) * 236);
    return `<g transform="rotate(${tilt} ${x + 140} ${y + 70})">
      <rect x="${x}" y="${y}" width="284" height="140" rx="6" fill="${C.paper}" stroke="${C.rule}" stroke-width="3"/>
      <rect x="${x + 24}" y="${y + 26}" width="120" height="9" rx="4" fill="${C.ink600}" opacity="0.45"/>
      <rect x="${x + 24}" y="${y + 52}" width="236" height="12" rx="6" fill="${C.paper3}"/>
      <rect x="${x + 24}" y="${y + 52}" width="${bar}" height="12" rx="6" fill="${score >= 85 ? C.green600 : C.green400}"/>
      <rect x="${x + 24}" y="${y + 88}" width="64" height="24" rx="4" fill="${C.ink}"/>
      <rect x="${x + 100}" y="${y + 96}" width="86" height="8" rx="4" fill="${C.ink600}" opacity="0.3"/>
    </g>`;
  }).join('')}
  <path d="M150 620c220-42 700-42 920 0" stroke="${C.green700}" stroke-width="7" fill="none"
        stroke-linecap="round" opacity="0.85"/>
`,
  'g6'
);

await fs.mkdir('public/img', { recursive: true });
const files = {
  'portrait.svg': portrait,
  'photo-1.svg': photo1,
  'photo-2.svg': photo2,
  'photo-3.svg': photo3,
  'photo-4.svg': photo4,
  'photo-5.svg': photo5,
};
for (const [name, svg] of Object.entries(files)) {
  await fs.writeFile(`public/img/${name}`, svg);
}
console.log(`wrote ${Object.keys(files).length} images`);
