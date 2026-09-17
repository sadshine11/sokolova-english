/* Режет длинный снимок на куски фиксированной высоты: node scripts/slice.mjs <png> <h> */
import sharp from 'sharp';
import path from 'node:path';
const file = process.argv[2];
const H = Number(process.argv[3] ?? 1100);
const img = sharp(file);
const { width, height } = await img.metadata();
const base = path.join(path.dirname(file), '_tmp', path.basename(file, '.png'));
const n = Math.ceil(height / H);
for (let i = 0; i < n; i++) {
  const top = i * H;
  await sharp(file).extract({ left: 0, top, width, height: Math.min(H, height - top) })
    .toFile(`${base}-${i}.png`);
}
console.log(`${n} кусков, ${width}x${height}`);
