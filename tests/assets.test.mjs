import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

test('the cropped portrait has the intended frame, small size, and no EXIF', async () => {
  for (const [name, width, height, limit] of [['webp', 480, 780, 60000], ['jpg', 720, 1170, 110000]]) {
    const portrait = new URL(`../assets/balaji-portrait.${name}`, import.meta.url);
    const metadata = await sharp(fileURLToPath(portrait)).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert.equal(metadata.exif, undefined);
    assert.ok((await stat(portrait)).size < limit);
  }
});

test('the citation preserves all authors, the preprint ID, and accepted status', async () => {
  const citation = await readFile(new URL('../assets/ramachandran-2026-network.bib', import.meta.url), 'utf8');
  assert.match(citation, /Balaji R and Prashil Wankhede and\s+Pavankumar Tallapragada/);
  assert.match(citation, /2604\.03056/);
  assert.match(citation, /Accepted at the 65th IEEE Conference/);
  assert.doesNotMatch(citation, /pages\s*=|volume\s*=/);
});

test('conference calendar uses the verified dates and does not invent a talk time', async () => {
  const calendar = await readFile(new URL('../assets/cdc-2026.ics', import.meta.url), 'utf8');
  assert.match(calendar, /DTSTART;VALUE=DATE:20261215/);
  assert.match(calendar, /DTEND;VALUE=DATE:20261219/);
  assert.match(calendar, /Individual presentation time is not yet listed/);
  assert.match(calendar, /URL:https:\/\/cdc2026\.ieeecss\.org\//);
});