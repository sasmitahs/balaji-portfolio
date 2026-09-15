import { cp, mkdir } from 'node:fs/promises';

const iconNames = [
  'arrow-up', 'arrow-up-right', 'calendar-plus', 'chevron-down', 'circle-check',
  'copy', 'download', 'file-text', 'graduation-cap', 'menu', 'network', 'orbit',
  'printer', 'quote', 'waves', 'x'
];

await mkdir(new URL('../assets/icons/', import.meta.url), { recursive: true });
for (const iconName of iconNames) {
  await cp(new URL(`../node_modules/lucide-static/icons/${iconName}.svg`, import.meta.url), new URL(`../assets/icons/${iconName}.svg`, import.meta.url));
}
await cp(new URL('../node_modules/lucide-static/LICENSE', import.meta.url), new URL('../assets/icons/LICENSE', import.meta.url));
console.log(`Prepared ${iconNames.length} local Lucide icons and their license.`);