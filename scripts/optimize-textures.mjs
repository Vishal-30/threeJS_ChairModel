import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const files = ['wood', 'fabric', 'pattern', 'denim', 'quilt'];
const textureDir = path.resolve('public/assets/textures');

await mkdir(textureDir, { recursive: true });

for (const file of files) {
  const input = path.join(textureDir, `${file}.jpg`);
  const output = path.join(textureDir, `${file}.webp`);

  await sharp(input)
    .resize({ width: 768, height: 768, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(output);
}

console.log('Optimized texture variants written to public/assets/textures/*.webp');
