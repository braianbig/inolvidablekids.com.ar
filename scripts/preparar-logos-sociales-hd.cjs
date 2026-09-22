const sharp = require('sharp');

const upload = '/workspace/scratch/78b83c4a3310/upload';
const publicDir = '/workspace/scratch/78b83c4a3310/inolvidable-kids-site/public';

const logos = [
  ['Youtube Logo.png', 'social-youtube.png', '#005a46'],
  ['Facebook Logo.png', 'social-facebook.png', '#005a46'],
  ['WhatsApp Logo.png', 'social-whatsapp.png', '#005a46'],
  ['WhatsApp Logo.png', 'social-whatsapp-light.png', '#a9d253'],
  ['TikTok Logo.png', 'social-tiktok.png', '#005a46'],
  ['Instagram Logo.png', 'social-instagram.png', '#005a46'],
];

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

async function cleanLogo([source, target, color]) {
  const { data, info } = await sharp(`${upload}/${source}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const maskBuffer = Buffer.alloc(info.width * info.height);
  const targetRgb = hexToRgb(color);

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < data.length; i += 4) {
    const sourceAlpha = data[i + 3] / 255;
    // The supplied PNGs contain solid black pixels around and inside the mark.
    // Only the colored brand shape contributes to this mask.
    const colorStrength = Math.max(data[i], data[i + 1], data[i + 2]);
    const mask = Math.max(0, Math.min(1, (colorStrength - 3) / 90));
    const alpha = Math.round(255 * sourceAlpha * mask);
    const pixel = i / 4;
    maskBuffer[pixel] = alpha;

    if (alpha > 0) {
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) throw new Error(`No se detectó el ícono en ${source}`);

  const resizedMask = await sharp(maskBuffer, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize({ width: 192, height: 192, fit: 'contain', background: '#000000' })
    .greyscale()
    .raw()
    .toBuffer();

  // Apply the requested color only after resizing the alpha mask. This keeps
  // antialiased edges clean instead of introducing black RGB fringe pixels.
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 3,
      background: targetRgb,
    },
  })
    .joinChannel(resizedMask, { raw: { width: 192, height: 192, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(`${publicDir}/${target}`);
}

Promise.all(logos.map(cleanLogo)).catch((error) => {
  console.error(error);
  process.exit(1);
});
