/* Картинка для превью в мессенджерах и соцсетях (1200×630).
   Текст растеризуется системным шрифтом на этапе сборки — в браузере он уже картинка. */

import sharp from 'sharp';
import fs from 'node:fs/promises';

const FONT = 'Segoe UI, Golos Text, Arial, sans-serif';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fcfcfa"/>
  <rect x="0" y="0" width="1200" height="8" fill="#0a6b3c"/>

  <g transform="translate(80 92)">
    <rect width="64" height="64" rx="14" fill="#101711"/>
    <path d="M16 34.4l10 10.4L49 19.2" fill="none" stroke="#35b274" stroke-width="8.4"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <text x="80" y="290" font-family="${FONT}" font-size="76" font-weight="600"
        fill="#101711" letter-spacing="-2">Английский</text>
  <text x="80" y="378" font-family="${FONT}" font-size="76" font-weight="600"
        fill="#101711" letter-spacing="-2">без красной ручки</text>

  <path d="M216 398c96-8 190-9 286-4" stroke="#0c8449" stroke-width="7" fill="none" stroke-linecap="round"/>

  <line x1="80" y1="452" x2="1120" y2="452" stroke="#dde4d9" stroke-width="2"/>

  <text x="80" y="503" font-family="${FONT}" font-size="30" font-weight="600" fill="#101711">Ирина Соколова</text>
  <text x="80" y="546" font-family="${FONT}" font-size="26" fill="#5c6a5a">Репетитор по английскому языку · 5–11 класс · ОГЭ и ЕГЭ</text>
  <text x="80" y="586" font-family="${FONT}" font-size="26" fill="#5c6a5a">Екатеринбург, онлайн и очно · 11 лет практики</text>

  <g transform="translate(902 118)" opacity="0.9">
    <rect width="218" height="218" rx="18" fill="#dcefe2"/>
    <text x="109" y="118" font-family="${FONT}" font-size="86" font-weight="600"
          fill="#0a6b3c" text-anchor="middle">84</text>
    <text x="109" y="158" font-family="${FONT}" font-size="20" fill="#0a6b3c"
          text-anchor="middle">средний балл ЕГЭ</text>
    <text x="109" y="184" font-family="${FONT}" font-size="20" fill="#0a6b3c"
          text-anchor="middle">у выпуска 2026</text>
  </g>
</svg>`;

await fs.mkdir('public', { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
console.log('public/og.png');
