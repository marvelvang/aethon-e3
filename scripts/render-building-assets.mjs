/**
 * Renders building SVG masters → PNG production assets via headless Chromium.
 *
 * Usage:  node scripts/render-building-assets.mjs
 *
 * For each SVG in public/assets/buildings/:
 *   – reads width/height from SVG attributes
 *   – screenshots the SVG with transparent background
 *   – writes a same-named PNG next to the SVG
 *
 * PixiJS integration note:
 *   SVGs are stored at 4× tile resolution (tile = 64×32 px → PNG tile footprint = 256×128 px).
 *   At normal zoom display at 1× tile size:
 *     sprite.anchor.set(0.5, tileTopYInImage / imageHeight)
 *     sprite.scale.set(64 / imageWidth)
 */

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, join, basename } from 'path';

const buildingsDir = resolve('/home/user/aethon-e3/src/frontend/public/assets/buildings');
const svgFiles = readdirSync(buildingsDir).filter(f => f.endsWith('.svg'));

if (svgFiles.length === 0) {
  console.error('No SVG files found in', buildingsDir);
  process.exit(1);
}

const browser = await chromium.launch();

for (const svgFile of svgFiles) {
  const svgPath = join(buildingsDir, svgFile);
  const pngPath = join(buildingsDir, svgFile.replace('.svg', '.png'));
  const svgContent = readFileSync(svgPath, 'utf8');

  const wMatch = svgContent.match(/\bwidth="(\d+)"/);
  const hMatch = svgContent.match(/\bheight="(\d+)"/);
  if (!wMatch || !hMatch) {
    console.warn(`⚠  Skipping ${svgFile}: missing explicit width/height attributes`);
    continue;
  }
  const w = parseInt(wMatch[1]);
  const h = parseInt(hMatch[1]);

  const page = await browser.newPage();
  await page.setViewportSize({ width: w, height: h });

  const html = `<!DOCTYPE html>
<html style="margin:0;padding:0;background:transparent">
<body style="margin:0;padding:0;background:transparent">${svgContent}</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });

  const pngBuffer = await page.screenshot({
    omitBackground: true,
    clip: { x: 0, y: 0, width: w, height: h },
  });

  writeFileSync(pngPath, pngBuffer);
  await page.close();

  console.log(`✓  ${svgFile}  →  ${basename(pngPath)}  (${w}×${h} px)`);
}

await browser.close();
console.log('Done.');
