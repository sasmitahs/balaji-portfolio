import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined });
try {
  const page = await browser.newPage();
  await page.goto(new URL('../cv.html', import.meta.url).href);
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  const pdfPath = fileURLToPath(new URL('../assets/balaji-ramachandran-cv.pdf', import.meta.url));
  await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  const pdf = await readFile(pdfPath);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 10000);
  console.log(JSON.stringify({ path: pdfPath, bytes: pdf.length, validPdfHeader: true }));
} finally {
  await browser.close();
}