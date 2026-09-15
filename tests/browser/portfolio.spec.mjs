import { expect, test } from '@playwright/test';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pageUrl = process.env.SITE_URL || new URL('../../index.html', import.meta.url).href;
const artifactDirectory = fileURLToPath(new URL('../../.artifacts/', import.meta.url));

async function openPortfolio(page) {
  await page.goto(pageUrl, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

for (const [width, height] of [[320, 740], [360, 800], [390, 844], [768, 1024], [1024, 900], [1440, 1000], [1920, 1080]]) {
  test(`layout, images, and content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await openPortfolio(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('BalajiRamachandran.');
    await expect(page.getByText('Accepted', { exact: false }).filter({ hasText: 'IEEE CDC 2026' })).toBeVisible();
    const metrics = await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      missingImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src')),
      clippedText: Array.from(document.querySelectorAll('h1,h2,h3,h4,p,a,button')).filter((element) => {
        const bounds = element.getBoundingClientRect();
        if (element.closest('dialog:not([open])') || bounds.width === 0 || element.classList.contains('skip-link')) return false;
        return bounds.left < -1 || bounds.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 2 && getComputedStyle(element).display !== 'inline';
      }).map((element) => element.textContent.trim().slice(0, 75)),
      portrait: (() => { const bounds = document.querySelector('.profile-portrait > img').getBoundingClientRect(); return { top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height }; })()
    }));
    expect(metrics.viewport).toBe(width);
    expect(metrics.documentWidth).toBeLessThanOrEqual(width + 1);
    expect(metrics.missingImages).toEqual([]);
    expect(metrics.clippedText).toEqual([]);
    expect(metrics.portrait.bottom).toBeLessThan(height);
    expect(metrics.portrait.width / metrics.portrait.height).toBeCloseTo(8 / 13, 2);
    expect(pageErrors).toEqual([]);
    if ([390, 1440].includes(width)) {
      await mkdir(artifactDirectory, { recursive: true });
      await page.screenshot({ path: `${artifactDirectory}/portfolio-${width}.png`, fullPage: true });
      await page.screenshot({ path: `${artifactDirectory}/viewport-${width}.png` });
    }
  });
}

test('mobile menu supports navigation, dismissal, and desktop resizing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPortfolio(page);
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true');
  await nav.getByRole('link', { name: 'Publications' }).click();
  await expect(nav).toBeHidden();
  await expect(page).toHaveURL(/#publications$/);
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(nav).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(nav).toBeVisible();
  await expect(toggle).toBeHidden();
});

test('research overview, citation, clipboard feedback, and focus work', async ({ page }) => {
  await openPortfolio(page);
  const overview = page.locator('.paper-details');
  await overview.locator('summary').click();
  await expect(overview).toHaveAttribute('open', '');
  await expect(overview.getByText('The work characterizes', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Cite', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('code')).toContainText('2604.03056');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text) => { window.copiedCitation = text; } } });
  });
  await dialog.getByRole('button', { name: 'Copy citation' }).click();
  await expect(page.getByRole('status')).toHaveText('Citation copied.');
  expect(await page.evaluate(() => window.copiedCitation)).toContain('Balaji R and Prashil Wankhede');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Cite', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Cite', exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Permission denied'); } } });
  });
  await dialog.getByRole('button', { name: 'Copy citation' }).click();
  await expect(page.getByRole('status')).toHaveText('Copy unavailable. Download the BibTeX file instead.');
  await dialog.getByRole('button', { name: 'Close citation' }).click();
  await expect(dialog).toBeHidden();
});

test('all local resources exist and downloadable assets are usable', async ({ page }) => {
  await openPortfolio(page);
  const references = await page.evaluate(() => Array.from(document.querySelectorAll('[src],[href]')).flatMap((element) => [element.getAttribute('src'), element.getAttribute('href')]).filter((reference) => reference && !reference.startsWith('#') && !/^(https?:|mailto:|data:)/.test(reference)));
  for (const reference of new Set(references)) {
    expect((await stat(new URL(`../../${reference}`, import.meta.url))).size).toBeGreaterThan(0);
  }
  if (pageUrl.startsWith('file:')) {
    const pdf = await readFile(new URL('../../assets/balaji-ramachandran-cv.pdf', import.meta.url));
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    const calendar = await readFile(new URL('../../assets/cdc-2026.ics', import.meta.url), 'utf8');
    expect(calendar).toContain('DTSTART;VALUE=DATE:20261215');
    await expect(page.getByRole('link', { name: 'Curriculum vitae', exact: true })).toHaveAttribute('download', '');
    await expect(page.getByRole('link', { name: 'Add CDC 2026 to calendar', exact: true })).toHaveAttribute('download', '');
    return;
  }
  for (const [name, filename] of [['Curriculum vitae', 'balaji-ramachandran-cv.pdf'], ['Add CDC 2026 to calendar', 'cdc-2026.ics']]) {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name, exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(filename);
    expect(await download.failure()).toBeNull();
  }
});

test('page works without JavaScript and exposes real fallback links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(pageUrl);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'BibTeX', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Curriculum vitae', exact: true })).toHaveAttribute('href', 'assets/balaji-ramachandran-cv.pdf');
    await expect(page.getByRole('button', { name: 'Cite', exact: true })).toBeHidden();
  } finally {
    await context.close();
  }
});

test('public academic claims and links stay consistent', async ({ page }) => {
  await openPortfolio(page);
  await expect(page.locator('.role')).toContainText('Carnegie Mellon University');
  await expect(page.locator('.conference-copy')).toContainText('presenting in person');
  await expect(page.locator('.contact-conference')).toContainText('CDC 2026 in person');
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(structuredData).name).toBe('Balaji Ramachandran');
  expect(JSON.parse(structuredData).affiliation.name).toBe('Carnegie Mellon University');
  const brokenFragments = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]')).filter((link) => !document.getElementById(link.hash.slice(1))).map((link) => link.hash));
  expect(brokenFragments).toEqual([]);
  await page.goto(new URL('../../cv.html', import.meta.url).href);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Balaji Ramachandran');
  await expect(page.locator('main')).toContainText('Accepted at the 65th IEEE Conference');
});