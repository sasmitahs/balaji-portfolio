import assert from 'node:assert/strict';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sourcePath = process.argv[2];
assert.ok(sourcePath, 'Pass the path to the supplied 720 x 1600 portrait screenshot.');

const sourceMetadata = await sharp(sourcePath).metadata();
assert.equal(sourceMetadata.width, 720, 'Unexpected source width; review the crop before continuing.');
assert.equal(sourceMetadata.height, 1600, 'Unexpected source height; review the crop before continuing.');

const assetDirectory = fileURLToPath(new URL('../assets/', import.meta.url));
const crop = { left: 0, top: 368, width: 720, height: 1170 };
await mkdir(assetDirectory, { recursive: true });

const webpPath = fileURLToPath(new URL('../assets/balaji-portrait.webp', import.meta.url));
const jpegPath = fileURLToPath(new URL('../assets/balaji-portrait.jpg', import.meta.url));

await sharp(sourcePath).rotate().extract(crop).resize({ width: 480 }).webp({ quality: 86 }).toFile(webpPath);
await sharp(sourcePath).rotate().extract(crop).jpeg({ quality: 90, mozjpeg: true }).toFile(jpegPath);

const results = [];
for (const [imagePath, width, height] of [[webpPath, 480, 780], [jpegPath, 720, 1170]]) {
  const metadata = await sharp(imagePath).metadata();
  assert.equal(metadata.width, width);
  assert.equal(metadata.height, height);
  assert.equal(metadata.exif, undefined);
  results.push({ path: imagePath, width, height, bytes: (await stat(imagePath)).size });
}

console.log(JSON.stringify({ crop, images: results }, null, 2));