// Rasterizes public/favicon.svg into the PWA icon set. Run with `npm run icons`.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'public', 'favicon.svg');
const iconsDir = join(root, 'public', 'icons');
await mkdir(iconsDir, { recursive: true });

const render = (size, out, opts = {}) =>
  sharp(src, { density: 384 }).resize(size, size, { fit: 'contain', background: opts.bg || { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(out).then(() => console.log('✓', out));

await render(192, join(iconsDir, 'icon-192.png'));
await render(512, join(iconsDir, 'icon-512.png'));
await render(180, join(root, 'public', 'apple-touch-icon.png'), { bg: { r: 0xC2, g: 0x5E, b: 0x3C, alpha: 1 } });

// Maskable: pad the artwork into the safe zone on a terracotta field.
await sharp(src, { density: 384 })
  .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: { r: 0xC2, g: 0x5E, b: 0x3C, alpha: 1 } })
  .png().toFile(join(iconsDir, 'icon-maskable-512.png'))
  .then(() => console.log('✓ maskable'));
