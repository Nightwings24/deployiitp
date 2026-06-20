/**
 * One-shot content ingestion: turns the structured source arrays in scripts/data/
 * into individual YAML files under src/content/<collection>/, the format both
 * Astro Content Collections and Keystatic read/write.
 *
 *   node scripts/ingest.mjs
 *
 * Re-running regenerates the files (existing generated files are cleared first),
 * so the source arrays remain the single source of truth for the bulk data.
 * Hand-curated content (research themes, news, profile) is NOT touched here.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';

import { people } from './data/people.mjs';
import { positions } from './data/positions.mjs';
import { awards } from './data/awards.mjs';

// NOTE: publications are NOT generated here - they are produced by
// scripts/ingest-publications.mjs, which enriches the seed list with DOIs and
// canonical links from ORCID + Crossref. Running this file leaves
// src/content/publications/ untouched.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');

/** kebab-case slug from a string, trimmed to a reasonable length. */
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

/** Drop undefined values so YAML stays clean (no `key: null` noise). */
function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

async function resetDir(name) {
  const dir = join(contentDir, name);
  if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  return dir;
}

async function writeCollection(name, items, keyFor) {
  const dir = await resetDir(name);
  const seen = new Map();
  let order = 0;
  for (const item of items) {
    let base = keyFor(item);
    // De-duplicate slugs (e.g. two "Head, Department of Mathematics" terms).
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const slug = n > 1 ? `${base}-${n}` : base;
    // Preserve source order with an explicit `order` field for stable display.
    const data = clean({ ...item, order: item.order ?? order });
    order += 1;
    // Serialize with YAML 1.1 semantics so date/number-like strings (e.g.
    // "2020-09-15", "2013", "16") are quoted and stay strings when Astro reads
    // them - Astro's loader interprets plain scalars with 1.1 rules.
    await writeFile(join(dir, `${slug}.yaml`), stringify(data, { schema: 'yaml-1.1' }), 'utf8');
  }
  console.log(`  ${name.padEnd(13)} ${items.length} files`);
}

console.log('Ingesting content →');
await writeCollection('people', people, (p) => slugify(p.name));
await writeCollection('positions', positions, (p) => slugify(`${p.title}-${p.organization}`));
await writeCollection('awards', awards, (a) => slugify(a.title));
console.log('Done.');
