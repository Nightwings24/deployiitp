/**
 * Generates the Open Graph share image (1200×630) into public/og/default.png,
 * plus apple-touch-icon.png, from an SVG using sharp. Run once (or after
 * changing the name/title): node scripts/make-og.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ogDir = join(root, 'public', 'og');
await mkdir(ogDir, { recursive: true });

const PAPER = '#FBFAF7';
const PRIMARY = '#1F3A5F';
const INK = '#1A1A1E';
const INK_SOFT = '#4B4B53';
const ACCENT = '#80591C';
const LINE = '#E7E4DC';

// Decorative phase-portrait spiral (matches the site motif).
function spiral(cx, cy, startR, startTheta, turns = 2.6, steps = 110) {
  const b = 0.2;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * 2 * Math.PI;
    const r = startR * Math.exp(-b * t);
    const x = cx + r * Math.cos(t + startTheta);
    const y = cy + r * Math.sin(t + startTheta);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}

const cx = 980;
const cy = 315;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="10" fill="${PRIMARY}"/>

  <!-- phase portrait motif -->
  <g stroke="${PRIMARY}" fill="none" opacity="0.10" stroke-width="2">
    <ellipse cx="${cx}" cy="${cy}" rx="210" ry="165"/>
    <path d="${spiral(cx, cy, 250, 0)}"/>
    <path d="${spiral(cx, cy, 230, Math.PI)}"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="6" fill="${ACCENT}" opacity="0.5"/>

  <!-- text -->
  <text x="90" y="150" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="3" fill="${ACCENT}">MATHEMATICAL MODELING LAB · IIT PATNA</text>

  <text x="86" y="245" font-family="Georgia, 'Times New Roman', serif" font-size="74" font-weight="700" fill="${PRIMARY}">Dr. Prashant Kumar</text>
  <text x="86" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="74" font-weight="700" fill="${PRIMARY}">Srivastava</text>

  <text x="90" y="400" font-family="Georgia, serif" font-size="30" fill="${INK_SOFT}">Associate Professor &amp; Head, Department of Mathematics</text>

  <line x1="90" y1="440" x2="640" y2="440" stroke="${LINE}" stroke-width="2"/>

  <text x="90" y="492" font-family="Inter, Arial, sans-serif" font-size="26" fill="${INK}">Mathematical modelling of biological systems -</text>
  <text x="90" y="528" font-family="Inter, Arial, sans-serif" font-size="26" fill="${INK}">epidemiology, ecology &amp; nonlinear dynamics.</text>

  <text x="90" y="585" font-family="Inter, Arial, sans-serif" font-size="20" fill="${ACCENT}">pksri@iitp.ac.in</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(join(ogDir, 'default.png'));
console.log('Wrote public/og/default.png (1200×630)');

// Apple touch icon (180×180) from the favicon mark.
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="${PRIMARY}"/>
  <g fill="none" stroke="${PAPER}" stroke-width="8" stroke-linecap="round">
    <path d="${spiral(90, 90, 56, 0, 2)}"/>
  </g>
  <circle cx="90" cy="90" r="9" fill="${ACCENT}"/>
</svg>`;
await sharp(Buffer.from(iconSvg)).png().toFile(join(root, 'public', 'apple-touch-icon.png'));
console.log('Wrote public/apple-touch-icon.png (180×180)');
