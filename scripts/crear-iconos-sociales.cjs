const sharp = require('sharp');

const source = '/workspace/scratch/78b83c4a3310/upload/1371a1aa-f71c-4449-aeea-d633d13e8f8d.png';
const outputDir = '/workspace/scratch/78b83c4a3310/inolvidable-kids-site/public';

const icons = [
  { name: 'facebook', cx: 191, cy: 214 },
  { name: 'instagram', cx: 447, cy: 214 },
  { name: 'youtube', cx: 831, cy: 214 },
  { name: 'whatsapp', cx: 1728, cy: 214 },
  { name: 'tiktok', cx: 704, cy: 391 },
];

async function createIcon({ name, cx, cy }) {
  const size = 76;
  const { data, info } = await sharp(source)
    .extract({ left: cx - size / 2, top: cy - size / 2, width: size, height: size })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const distanceFromWhite = 255 - Math.min(r, g, b);
    const alpha = Math.max(0, Math.min(255, (distanceFromWhite - 7) * 8));
    rgba[j] = 53;
    rgba[j + 1] = 168;
    rgba[j + 2] = 121;
    rgba[j + 3] = alpha;
  }

  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 64, height: 64, fit: 'contain' })
    .png()
    .toFile(`${outputDir}/social-${name}.png`);
}

Promise.all(icons.map(createIcon)).catch((error) => {
  console.error(error);
  process.exit(1);
});
