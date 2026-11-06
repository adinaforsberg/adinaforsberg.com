#!/usr/bin/env node
// Screenshots pages of the site at phone and desktop size, so changes can be checked visually.
// Usage: node scripts/screenshot.mjs [--label before] [page ...]
//   pages: home about listen arrangements complete-works contact (default: all)
//   output: .screenshots/<label>/<page>-<phone|desktop>.png (long pages: -1.png, -2.png, …)
//   YouTube/Vimeo/SoundCloud embeds show as empty boxes; that is expected.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startServer } from "./serve.mjs";

const ALL_PAGES = ["home", "about", "listen", "arrangements", "complete-works", "contact"];
const SIZES = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

const args = process.argv.slice(2);
let label = "current";
const pages = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--label") label = args[++i];
  else pages.push(args[i].replace(/^\/|\.html$/g, ""));
}
if (pages.length === 0) pages.push(...ALL_PAGES);

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.screenshots", label);
fs.mkdirSync(outDir, { recursive: true });

const server = await startServer(0);
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();
const written = [];
try {
  for (const [sizeName, viewport] of Object.entries(SIZES)) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const name of pages) {
      const url = `${base}/${name === "home" ? "" : name}`;
      const response = await page.goto(url, { waitUntil: "load" });
      if (response?.status() === 404) console.warn(`warning: ${name} is a 404 page`);
      // Load lazy images and web fonts before capturing the full page.
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
        await Promise.all(
          [...document.images].map(
            (img) =>
              img.complete ||
              new Promise((done) => {
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              }),
          ),
        );
        await document.fonts.ready;
      });
      await page.waitForTimeout(300);
      // Long pages are saved as several slices (-1, -2, …) so each image stays readable.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const sliceHeight = viewport.height * 2;
      const slices = Math.ceil(height / sliceHeight);
      const stem = path.join(outDir, `${name.replaceAll("/", "_")}-${sizeName}`);
      for (let i = 0; i < slices; i++) {
        const file = slices === 1 ? `${stem}.png` : `${stem}-${i + 1}.png`;
        const y = i * sliceHeight;
        await page.screenshot({
          path: file,
          fullPage: true,
          clip: { x: 0, y, width: viewport.width, height: Math.min(sliceHeight, height - y) },
        });
        written.push(path.relative(process.cwd(), file));
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(written.join("\n"));
