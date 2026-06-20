import type { CollectionEntry } from 'astro:content';
import { profile } from './profile';

export type Publication = CollectionEntry<'publications'>['data'];

/* -------------------------------------------------------------------------- */
/* Author emphasis                                                            */
/* -------------------------------------------------------------------------- */

/** Normalise an author string to lowercase tokens without punctuation. */
function tokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Derive the PI's matching signature from the profile name so this stays correct
// if the name ever changes. For "Prashant Kumar Srivastava": surname "srivastava",
// required given initials ["p","k"].
const piTokens = tokens(profile.name);
const PI_SURNAME = piTokens[piTokens.length - 1];
const PI_REQUIRED_INITIALS = piTokens.slice(0, -1).map((t) => t[0]);

/** Collect the given-name initials present in an author's given tokens. */
function givenInitials(given: string[]): Set<string> {
  const letters = new Set<string>();
  for (const t of given) {
    if (t.length <= 2) {
      // Compact initials like "pk" -> p, k
      for (const ch of t) letters.add(ch);
    } else {
      letters.add(t[0]);
    }
  }
  return letters;
}

/**
 * True only for the PI (Prashant K. Srivastava), not other Srivastava co-authors
 * such as "A. Srivastava" (Akriti) or "A.K. Srivastav" (different surname).
 * Requires the exact surname AND every required given initial (p AND k).
 */
export function isPI(author: string): boolean {
  const t = tokens(author);
  if (t.length < 2) return false;
  const surname = t[t.length - 1];
  if (surname !== PI_SURNAME) return false;
  const letters = givenInitials(t.slice(0, -1));
  return PI_REQUIRED_INITIALS.every((i) => letters.has(i));
}

/* -------------------------------------------------------------------------- */
/* Citation formatting                                                        */
/* -------------------------------------------------------------------------- */

/** "113(20), 28511–28553" - the volume/issue/pages tail, omitting empty parts. */
export function citationDetail(pub: Publication): string {
  let s = '';
  if (pub.volume) s += pub.volume;
  if (pub.issue) s += `(${pub.issue})`;
  if (pub.pages) s += `${s ? ', ' : ''}${pub.pages.replace(/-/g, '–')}`;
  return s;
}

/** Best external link for a publication: DOI > url. */
export function primaryLink(pub: Publication): string | undefined {
  if (pub.doi) return `https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}`;
  return pub.url;
}

/* -------------------------------------------------------------------------- */
/* BibTeX (generated client- or build-side, no dependency)                    */
/* -------------------------------------------------------------------------- */

const BIB_TYPE: Record<Publication['type'], string> = {
  journal: 'article',
  conference: 'inproceedings',
  'book-chapter': 'incollection',
};

function bibKey(pub: Publication): string {
  const first = (pub.authors[0] ?? 'anon').split(/\s+/).pop() ?? 'anon';
  const word = (pub.title.match(/[A-Za-z]+/) ?? ['paper'])[0];
  return `${first}${pub.year}${word}`.replace(/[^A-Za-z0-9]/g, '');
}

/** Escape LaTeX special characters so a copied entry compiles cleanly. */
function escapeLatex(s: string): string {
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%#$_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/** Convert a page range to BibTeX's conventional double hyphen ("182--213"). */
function bibPages(pages: string): string {
  return pages.replace(/\s*[-–-]\s*/g, '--');
}

/** Generate a clean, LaTeX-safe BibTeX entry string for a publication. */
export function toBibTeX(pub: Publication): string {
  const type = BIB_TYPE[pub.type];
  const venueField = pub.type === 'journal' ? 'journal' : 'booktitle';
  // Text fields are LaTeX-escaped; the title is also brace-wrapped for case
  // preservation. doi/url are left raw (handled by url/hyperref packages).
  const fields: [string, string | undefined][] = [
    ['author', escapeLatex(pub.authors.join(' and '))],
    ['title', `{${escapeLatex(pub.title)}}`],
    [venueField, escapeLatex(pub.venue)],
    ['year', String(pub.year)],
    ['volume', pub.volume],
    ['number', pub.issue],
    ['pages', pub.pages ? bibPages(pub.pages) : undefined],
    ['doi', pub.doi],
    ['url', pub.url],
  ];
  const body = fields
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n');
  return `@${type}{${bibKey(pub)},\n${body}\n}`;
}

/* -------------------------------------------------------------------------- */
/* Sorting & grouping                                                         */
/* -------------------------------------------------------------------------- */

/** Sort newest-first; accepted/in-press (no fixed year tail) keep their year. */
export function byNewest(a: Publication, b: Publication): number {
  if (b.year !== a.year) return b.year - a.year;
  return a.title.localeCompare(b.title);
}

/** Group a sorted list of publications by year, newest year first. */
export function groupByYear(
  pubs: Publication[],
): { year: number; items: Publication[] }[] {
  const map = new Map<number, Publication[]>();
  for (const p of pubs) {
    const arr = map.get(p.year) ?? [];
    arr.push(p);
    map.set(p.year, arr);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items: items.sort((a, b) => a.title.localeCompare(b.title)) }));
}
