import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";

const [letters, outDir] = process.argv.slice(2);
if (!letters || !outDir) {
  console.error("usage: node scripts/favicon.mjs <letters> <public dir>");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const fontFile = require.resolve("@fontsource/crimson-pro/files/crimson-pro-latin-400-normal.woff");
const font = opentype.parse(new Uint8Array(fs.readFileSync(fontFile)).buffer);

const BG = "#221F18";
const FG = "#E5E7EB";
const SIZE = 200;
const FONT_SIZE = 128.3;
const MAX_WIDTH = 140;
const OPTICAL_CENTER = 100.5;

function layout(text, size) {
  const p = new opentype.Path();
  let x = 0;
  let prev;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) x += (font.getKerningValue(prev, g) * size) / font.unitsPerEm;
    p.extend(g.getPath(x, 0, size));
    x += (g.advanceWidth * size) / font.unitsPerEm;
    prev = g;
  }
  return p;
}

let glyphs = layout(letters, FONT_SIZE);
let box = glyphs.getBoundingBox();
if (box.x2 - box.x1 > MAX_WIDTH) {
  glyphs = layout(letters, (FONT_SIZE * MAX_WIDTH) / (box.x2 - box.x1));
  box = glyphs.getBoundingBox();
}

const dx = SIZE / 2 - (box.x1 + box.x2) / 2;
const dy = OPTICAL_CENTER - box.y1 / 2;
for (const c of glyphs.commands) {
  for (const k of ["x", "x1", "x2"]) if (c[k] !== undefined) c[k] += dx;
  for (const k of ["y", "y1", "y2"]) if (c[k] !== undefined) c[k] += dy;
}
const d = glyphs.toPathData(2);

const svg = (rx) =>
  `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">\n` +
  `<rect width="${SIZE}" height="${SIZE}" rx="${rx}" fill="${BG}"/>\n` +
  `<path d="${d}" fill="${FG}"/>\n</svg>\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "favicon.svg"), svg(50));
const png = new Resvg(svg(0), { fitTo: { mode: "width", value: 180 } }).render().asPng();
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), png);
console.log(`wrote favicon.svg and apple-touch-icon.png to ${outDir}`);
