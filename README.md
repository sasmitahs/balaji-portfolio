# Balaji Ramachandran

An academic website for Balaji Ramachandran, a mathematics PhD student at Carnegie Mellon University.

- Website: https://sasmitahs.github.io/balaji-portfolio/
- Scholar: https://scholar.google.com/citations?user=kNDc_dYAAAAJ&hl=en
- LinkedIn: https://www.linkedin.com/in/balaji-ram-b45061257/

## Preview

Open `index.html` directly in a browser. The website uses relative paths and works without a development server. JavaScript enhances the navigation and citation dialog; the academic content and download links remain accessible without it. Google Fonts are optional, with local fallback fonts.

## Update

- `index.html`: biography, research, publications, conference news, and experience.
- `styles.css`: responsive design and print styles.
- `app.js`: mobile navigation, section tracking, and the citation dialog.
- `cv.html`: print-ready CV source. Regenerate the downloadable PDF after changes.
- `assets/ramachandran-2026-network.bib`: downloadable citation. Keep it synchronized with the citation dialog.
- `assets/cdc-2026.ics`: all-day conference dates, not the individual talk time.

There is no backend, analytics, contact form, or API key. Contact links open Balaji's LinkedIn profile. No email address or academic advisor has been inferred.

## Tooling

Node.js 22 or newer is required for asset generation and tests, not for viewing the website. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

```sh
npm ci
npm run prepare:icons
npm run export:cv
npm test
npm run test:browser
```

Browser tests and the CV export use installed Microsoft Edge on Windows. On other platforms, install Chromium using `npx playwright install chromium` first. Screenshots go to `.artifacts/`, which is excluded from Git.

To reproduce the crop, pass the original supplied 720 x 1600 screenshot:

```sh
npm run prepare:portrait -- "/path/to/original.jpeg"
```

The crop removes the call inset and phone controls, strips EXIF, and produces optimized WebP and JPEG files. The original screenshot and LinkedIn PDF are deliberately not included.

## Content Sources

Content was prepared on September 15, 2026 from the provided LinkedIn export, public Scholar profile, arXiv record, and the owner's updates.

- The provided LinkedIn export lists the CMU mathematics PhD role beginning June 2026. Scholar retains the earlier IISc affiliation.
- The exact IISc degree completion date was not supplied, so the site says "From 2022" without inventing a graduation date.
- Paper title, author spelling, identifier, and research summary follow https://arxiv.org/abs/2604.03056. The arXiv author name "Balaji R" is retained in the citation.
- Acceptance at CDC 2026, in-person presentation, and availability to meet researchers were explicitly confirmed by the owner. The preprint page still says submitted; no proceedings pages, publication DOI, or talk time are invented.
- December 15-18, 2026 and the Honolulu venue follow https://cdc2026.ieeecss.org/.

Only the one identified paper is listed. Add further accepted papers when their titles and links are supplied.

## Deployment

This project is intended for the standalone repository `sasmitahs/balaji-portfolio`; it does not modify `sasmitahs.github.io`. GitHub Pages serves the `main` branch root. The `.nojekyll` file keeps the site as plain static files.

Updates are deployed by pushing changes to `main`. Run the tests before publishing. If the repository is renamed, update the canonical URL, social metadata, structured data, sitemap, robots file, CV footer, and calendar UID accordingly.

## Third-party Assets

Interface icons are from Lucide and include their license in `assets/icons/LICENSE`. The favicon is an original typographic monogram. The profile photograph was supplied by the owner and is included only as a cropped portrait.