import { getCollection, type CollectionEntry } from 'astro:content';
import { sortYear } from './format';
import { byNewest, type Publication } from './publications';

/* ----------------------------- publications ---------------------------- */

export async function getPublications(): Promise<Publication[]> {
  const entries = await getCollection('publications');
  return entries.map((e) => e.data).sort(byNewest);
}

export async function getFeaturedPublications(limit = 6): Promise<Publication[]> {
  const pubs = await getPublications();
  return pubs.filter((p) => p.featured).slice(0, limit);
}

export function publicationCounts(pubs: Publication[]) {
  const byType = { journal: 0, conference: 0, 'book-chapter': 0 };
  for (const p of pubs) byType[p.type]++;
  return {
    total: pubs.length,
    journal: byType.journal,
    conference: byType.conference,
    bookChapter: byType['book-chapter'],
    chaptersAndProceedings: byType.conference + byType['book-chapter'],
  };
}

/* ------------------------------ positions ------------------------------ */

type Position = CollectionEntry<'positions'>['data'];

export async function getPositions(): Promise<Position[]> {
  const entries = await getCollection('positions');
  return entries
    .map((e) => e.data)
    .sort((a, b) => {
      const ya = sortYear(a.startDate, a.endDate, a.isCurrent);
      const yb = sortYear(b.startDate, b.endDate, b.isCurrent);
      if (yb !== ya) return yb - ya;
      return (a.order ?? 0) - (b.order ?? 0);
    });
}

export async function getPositionsByCategory(category: Position['category']) {
  return (await getPositions()).filter((p) => p.category === category);
}

/** Current appointment + headship, for the hero title line. */
export async function getCurrentTitles(): Promise<Position[]> {
  const positions = await getPositions();
  return positions.filter(
    (p) => p.isCurrent && (p.category === 'appointment' || p.category === 'administrative'),
  );
}

/** All current roles across categories, for the "Currently" block. */
export async function getCurrentRoles(): Promise<Position[]> {
  return (await getPositions()).filter((p) => p.isCurrent);
}

/* -------------------------------- awards ------------------------------- */

type Award = CollectionEntry<'awards'>['data'];

export async function getAwards(): Promise<Award[]> {
  const entries = await getCollection('awards');
  return entries.map((e) => e.data).sort((a, b) => {
    const ya = a.year ?? a.yearStart ?? 0;
    const yb = b.year ?? b.yearStart ?? 0;
    if (yb !== ya) return yb - ya;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

/* -------------------------------- people ------------------------------- */

type Person = CollectionEntry<'people'>['data'];
const ROLE_RANK: Record<string, number> = { PI: 0, PostDoc: 1, PhD: 2, MTech: 3, MSc: 4 };

export async function getPeople(): Promise<Person[]> {
  const entries = await getCollection('people');
  return entries.map((e) => e.data);
}

export async function getCurrentMembers(): Promise<Person[]> {
  return (await getPeople())
    .filter((p) => p.status === 'current')
    .sort((a, b) => {
      if (ROLE_RANK[a.role] !== ROLE_RANK[b.role]) return ROLE_RANK[a.role] - ROLE_RANK[b.role];
      return (a.yearJoined ?? 0) - (b.yearJoined ?? 0); // seniors first
    });
}

export async function getAlumni(): Promise<Person[]> {
  return (await getPeople())
    .filter((p) => p.status === 'alumni')
    .sort((a, b) => {
      if (ROLE_RANK[a.role] !== ROLE_RANK[b.role]) return ROLE_RANK[a.role] - ROLE_RANK[b.role];
      return (b.yearGraduated ?? 0) - (a.yearGraduated ?? 0); // most recent first
    });
}

/* ------------------------------- research ------------------------------ */

export async function getResearch() {
  const entries = await getCollection('research');
  return entries.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

/* --------------------------------- news -------------------------------- */

export async function getNews(limit?: number) {
  const entries = await getCollection('news');
  const sorted = entries
    .map((e) => e.data)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  return limit ? sorted.slice(0, limit) : sorted;
}

/** Count of publications matching any of the given topic tags. */
export function countByTopics(pubs: Publication[], topics: string[]): number {
  if (!topics.length) return 0;
  const set = new Set(topics);
  return pubs.filter((p) => p.topics.some((t) => set.has(t))).length;
}
