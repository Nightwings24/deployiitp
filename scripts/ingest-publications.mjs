/**
 * Publications ingestion with automatic DOI/link resolution.
 *
 *   node scripts/ingest-publications.mjs [--refresh]
 *
 * Pipeline (per publications-ingestion.md):
 *   1. Seed list (scripts/data/publications.mjs) = authoritative completeness.
 *   2. ORCID public API = primary source of DOIs / canonical links.
 *   3. Crossref REST API = backfill DOIs for seed items ORCID didn't cover.
 *
 * Strict matching with a confidence flag; nothing weak is auto-accepted. Raw API
 * responses are cached under seed/cache/ so reruns are offline-cheap (use
 * --refresh to re-fetch). Emits:
 *   • src/content/publications/*.yaml   - the dataset the site consumes
 *   • seed/publications-review.md        - human report of everything to glance at
 *
 * Network is best-effort: if ORCID/Crossref are unreachable the script still
 * writes the full seed dataset (DOIs blank, items flagged for review).
 */
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { publications as seed } from './data/publications.mjs';

const ORCID = '0000-0002-7651-5639';
const MAILTO = process.env.CROSSREF_MAILTO || 'web_ccdc@iitp.ac.in';
const REFRESH = process.argv.includes('--refresh');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src', 'content', 'publications');
const cacheDir = join(root, 'seed', 'cache');
const crossrefCacheDir = join(cacheDir, 'crossref');

/* ----------------------------- text utilities ---------------------------- */

function normalizeTitle(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^(a|an|the)\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Levenshtein distance (iterative, two-row). */
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Similarity ratio in [0,1] over normalized titles. */
function titleSim(a, b) {
  const x = normalizeTitle(a);
  const y = normalizeTitle(b);
  if (!x.length && !y.length) return 1;
  const dist = levenshtein(x, y);
  return 1 - dist / Math.max(x.length, y.length);
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------- ORCID --------------------------------- */

async function getOrcidWorks() {
  const cacheFile = join(cacheDir, 'orcid-works.json');
  if (!REFRESH && existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, 'utf8'));
  }
  try {
    const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID}/works`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`ORCID HTTP ${res.status}`);
    const json = await res.json();
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cacheFile, JSON.stringify(json, null, 2), 'utf8');
    return json;
  } catch (err) {
    console.warn(`  ! ORCID fetch failed (${err.message}); continuing without it.`);
    return null;
  }
}

/** Flatten ORCID /works into [{title, year, type, venue, doi}]. */
function parseOrcid(json) {
  if (!json?.group) return [];
  const out = [];
  for (const group of json.group) {
    const summaries = group['work-summary'] ?? [];
    // Prefer a summary that carries a DOI.
    const pick =
      summaries.find((s) =>
        (s['external-ids']?.['external-id'] ?? []).some((e) => e['external-id-type'] === 'doi'),
      ) ?? summaries[0];
    if (!pick) continue;
    const title = pick.title?.title?.value;
    if (!title) continue;
    const doiId = (pick['external-ids']?.['external-id'] ?? []).find(
      (e) => e['external-id-type'] === 'doi',
    );
    const typeMap = {
      JOURNAL_ARTICLE: 'journal',
      CONFERENCE_PAPER: 'conference',
      BOOK_CHAPTER: 'book-chapter',
      BOOK: 'book-chapter',
    };
    out.push({
      title,
      year: pick['publication-date']?.year?.value
        ? Number(pick['publication-date'].year.value)
        : null,
      type: typeMap[pick.type] ?? null,
      venue: pick['journal-title']?.value ?? null,
      doi: doiId ? doiId['external-id-value'].replace(/^https?:\/\/doi\.org\//i, '') : null,
    });
  }
  return out;
}

/* ------------------------------ Crossref ------------------------------- */

async function crossrefLookup(item) {
  const slug = slugify(item.title);
  const cacheFile = join(crossrefCacheDir, `${slug}.json`);
  if (!REFRESH && existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, 'utf8'));
  }
  const query = encodeURIComponent(`${item.title} ${item.authors[0] ?? ''}`);
  const url = `https://api.crossref.org/works?query.bibliographic=${query}&rows=3&select=DOI,title,container-title,published,author,type&mailto=${MAILTO}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return null;
      const json = await res.json();
      await mkdir(crossrefCacheDir, { recursive: true });
      await writeFile(cacheFile, JSON.stringify(json.message?.items ?? [], null, 2), 'utf8');
      return json.message?.items ?? [];
    } catch (err) {
      if (attempt === 2) {
        console.warn(`  ! Crossref failed for "${item.title.slice(0, 40)}…": ${err.message}`);
        return null;
      }
      await sleep(500 * (attempt + 1));
    }
  }
  return null;
}

/** Best Crossref candidate meeting the strict acceptance rules. */
function evaluateCrossref(item, items) {
  if (!items?.length) return null;
  let best = null;
  for (const cand of items) {
    const candTitle = cand.title?.[0];
    if (!candTitle) continue;
    const sim = titleSim(item.title, candTitle);
    const hasSrivastava = (cand.author ?? []).some((a) => /srivastav/i.test(a.family ?? ''));
    const candYear = cand.published?.['date-parts']?.[0]?.[0] ?? null;
    if (!best || sim > best.sim) best = { cand, sim, hasSrivastava, candYear };
  }
  if (!best) return null;

  const accepted = item.status === 'accepted' || item.status === 'in-press';
  const yearOk = accepted || best.candYear == null || Math.abs(best.candYear - item.year) <= 1;
  const strong = best.sim >= 0.92 && best.hasSrivastava && yearOk;
  const plausible = best.sim >= 0.85 && best.hasSrivastava;

  if (strong)
    return { doi: best.cand.DOI, confidence: 'high', sim: best.sim, candYear: best.candYear };
  if (plausible)
    return { doi: best.cand.DOI, confidence: 'review', sim: best.sim, candYear: best.candYear };
  return null;
}

/* -------------------------------- main --------------------------------- */

console.log(`Publications ingestion (ORCID ${ORCID}) →`);
const orcidWorks = parseOrcid(await getOrcidWorks());
console.log(`  ORCID works parsed: ${orcidWorks.length}`);

const records = [];
const reviewRows = [];
let orcidMatches = 0;
let crossrefMatches = 0;

for (const item of seed) {
  const rec = { ...item, source: ['seed'], confidence: 'high' };

  // Keep an author-supplied DOI (e.g. the BIOMAT chapter) as-is.
  if (rec.doi) {
    rec.source.push('seed-doi');
  }

  // 1) ORCID match
  if (!rec.doi && orcidWorks.length) {
    let best = null;
    for (const w of orcidWorks) {
      const sim = titleSim(item.title, w.title);
      if (!best || sim > best.sim) best = { w, sim };
    }
    if (best && best.sim >= 0.9 && best.w.doi) {
      rec.doi = best.w.doi;
      rec.source.push('orcid');
      orcidMatches++;
      const wasForthcoming = item.status === 'accepted' || item.status === 'in-press';
      if (wasForthcoming) {
        // A registered DOI means the paper is now published - promote it and
        // adopt ORCID's publication year.
        rec.status = 'published';
        if (best.w.year) rec.year = best.w.year;
        reviewRows.push(
          `- **Now published (ORCID):** "${item.title}" - was ${item.status}; ORCID gives a DOI${best.w.year ? ` and year ${best.w.year}` : ''}.`,
        );
      } else if (!item.lockYear && best.w.year && best.w.year !== item.year) {
        // Trust ORCID's year if it disagrees with the seed page - unless the
        // seed explicitly locks the year (e.g. ORCID has an early-online year).
        reviewRows.push(
          `- **Year differs (ORCID):** "${item.title}" - seed ${item.year} vs ORCID ${best.w.year}. Kept ORCID.`,
        );
        rec.year = best.w.year;
      }
    }
  }

  // 2) Crossref backfill
  if (!rec.doi && item.status !== 'accepted' && item.status !== 'in-press') {
    const items = await crossrefLookup(item);
    const verdict = evaluateCrossref(item, items);
    await sleep(200); // polite delay
    if (verdict) {
      rec.doi = verdict.doi;
      rec.source.push('crossref');
      rec.confidence = verdict.confidence;
      crossrefMatches++;
      if (verdict.confidence === 'review') {
        reviewRows.push(
          `- **Crossref (review):** "${item.title}" - DOI ${verdict.doi} at similarity ${verdict.sim.toFixed(2)}. Please confirm.`,
        );
      }
    }
  }

  // Flag published items that still lack a DOI.
  if (!rec.doi && rec.status === 'published') {
    rec.confidence = 'review';
    reviewRows.push(`- **No DOI found:** "${item.title}" (${item.year}, ${item.venue}).`);
  }

  // Untagged?
  if (!rec.topics || rec.topics.length === 0) {
    rec.confidence = 'review';
    reviewRows.push(`- **No topic tag:** "${item.title}".`);
  }

  // Canonical URL: prefer the DOI resolver.
  if (rec.doi && !rec.url) rec.url = `https://doi.org/${rec.doi}`;

  records.push(rec);
}

/* ---- write the dataset ---- */
if (existsSync(outDir)) await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const seenSlugs = new Map();
for (const rec of records) {
  // Strip pipeline-only fields before writing the site dataset.
  const { source, confidence, lockYear, ...data } = rec;
  let base = `${rec.year}-${slugify(rec.title)}`;
  const n = (seenSlugs.get(base) ?? 0) + 1;
  seenSlugs.set(base, n);
  const slug = n > 1 ? `${base}-${n}` : base;
  await writeFile(join(outDir, `${slug}.yaml`), stringify(data, { schema: 'yaml-1.1' }), 'utf8');
}

/* ---- counts ---- */
const counts = { journal: 0, conference: 0, 'book-chapter': 0 };
let withDoi = 0;
for (const r of records) {
  counts[r.type]++;
  if (r.doi) withDoi++;
}

/* ---- review report ---- */
const report = `# Publications ingestion - review report

_Generated by scripts/ingest-publications.mjs. Re-run with \`--refresh\` to re-query the APIs._

## Summary

- **Total records:** ${records.length} (target ~67)
- **By type:** ${counts.journal} journal · ${counts.conference} conference · ${counts['book-chapter']} book chapter
- **DOIs resolved:** ${withDoi} / ${records.length}
  - via ORCID: ${orcidMatches}
  - via Crossref: ${crossrefMatches}
  - author-supplied / seed: ${records.filter((r) => r.source.includes('seed-doi')).length}
- **Accepted / in-press (no DOI expected):** ${records.filter((r) => r.status !== 'published').length}

## Items to glance at (${reviewRows.length})

${reviewRows.length ? reviewRows.join('\n') : '_None - every published item resolved cleanly._'}

## All records

| Year | Type | DOI | Conf. | Source | Title |
|---|---|---|---|---|---|
${records
  .slice()
  .sort((a, b) => b.year - a.year)
  .map(
    (r) =>
      `| ${r.year} | ${r.type} | ${r.doi ?? '-'} | ${r.confidence} | ${r.source.join('+')} | ${r.title.slice(0, 70).replace(/\|/g, '/')} |`,
  )
  .join('\n')}
`;

await writeFile(join(root, 'seed', 'publications-review.md'), report, 'utf8');

console.log(
  `  wrote ${records.length} files · DOIs ${withDoi}/${records.length} (ORCID ${orcidMatches}, Crossref ${crossrefMatches})`,
);
console.log(`  review items: ${reviewRows.length} → seed/publications-review.md`);
console.log('Done.');
