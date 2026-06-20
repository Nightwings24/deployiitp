import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content model - everything that can change over time is DATA, never hardcoded.
 * Positions/titles carry dates so the site survives role changes (portfolio,
 * not a position page). Each collection is editable 1:1 in Keystatic.
 *
 * Storage layout (also what keystatic.config.ts reads/writes):
 *   src/content/positions/*.yaml
 *   src/content/awards/*.yaml
 *   src/content/people/*.yaml
 *   src/content/publications/*.yaml
 *   src/content/research/*.mdx       (frontmatter + long description body)
 *   src/content/news/*.mdx           (frontmatter + body)
 * The `profile` singleton lives at src/content/profile.json and is loaded in
 * src/lib/profile.ts (singletons don't fit the collection abstraction cleanly).
 */

const POSITION_CATEGORIES = ['appointment', 'administrative', 'professional-society'] as const;
const AWARD_CATEGORIES = ['award', 'honor', 'fellowship', 'society-role'] as const;
const PEOPLE_ROLES = ['PI', 'PostDoc', 'PhD', 'MTech', 'MSc'] as const;
const PEOPLE_STATUS = ['current', 'alumni'] as const;
const PUB_TYPES = ['journal', 'conference', 'book-chapter'] as const;
const PUB_STATUS = ['published', 'accepted', 'in-press'] as const;

/** Controlled topic vocabulary - keep tags consistent across all publications. */
export const PUB_TOPICS = [
  'Mathematical Epidemiology',
  'Ecology / Predator–Prey',
  'Nonlinear Dynamics',
  'HIV Dynamics',
  'Optimal Control',
  'Coding Theory',
  'COVID-19',
  'Tuberculosis',
  'Machine Learning',
] as const;

const positions = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/positions' }),
  schema: z.object({
    title: z.string(),
    organization: z.string(),
    location: z.string().optional(),
    // Dates are strings: "YYYY", "YYYY-MM", or "YYYY-MM-DD". Kept as text so
    // partial/approximate dates are representable and editable. startDate is
    // optional for standing appointments (e.g. academic rank) with no public date.
    startDate: z.string().optional(),
    endDate: z.string().nullable().default(null),
    isCurrent: z.boolean().default(false),
    category: z.enum(POSITION_CATEGORIES),
    note: z.string().optional(),
    url: z.string().url().optional(),
    order: z.number().default(0),
  }),
});

const awards = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/awards' }),
  schema: z.object({
    title: z.string(),
    org: z.string().optional(),
    year: z.number().optional(),
    yearStart: z.number().optional(),
    yearEnd: z.number().nullable().optional(),
    note: z.string().optional(),
    category: z.enum(AWARD_CATEGORIES),
    order: z.number().default(0),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    role: z.enum(PEOPLE_ROLES),
    status: z.enum(PEOPLE_STATUS),
    yearJoined: z.number().optional(),
    yearGraduated: z.number().optional(),
    // Free text like "2025–2026" for taught-program cohorts where a single
    // join year doesn't apply.
    period: z.string().optional(),
    currentPosition: z.string().optional(),
    profileUrl: z.string().url().optional(),
    coAdvisor: z.string().optional(),
    note: z.string().optional(),
    order: z.number().default(0),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    year: z.number(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    type: z.enum(PUB_TYPES),
    topics: z.array(z.string()).default([]),
    doi: z.string().optional(),
    url: z.string().url().optional(),
    pdfUrl: z.string().url().optional(),
    status: z.enum(PUB_STATUS).default('published'),
    featured: z.boolean().default(false),
  }),
});

const research = defineCollection({
  // Markdoc bodies - rich prose, rendered by Astro and edited in Keystatic's
  // rich-text editor (the two agree on the .mdoc format).
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(), // plain-language "what + why", 1–3 sentences
    order: z.number().default(0),
    // Topic tags that link this theme to matching publications (must come from
    // PUB_TOPICS to resolve correctly).
    relatedTopics: z.array(z.string()).default([]),
    icon: z.string().optional(),
  }),
});

const news = defineCollection({
  // News items are short; modelled as plain data (no markdown body) so the
  // "add a news item" flow in Keystatic is a simple, foolproof form.
  loader: glob({ pattern: '**/*.yaml', base: './src/content/news' }),
  schema: z.object({
    // Accept either a quoted string or a YAML-parsed date; coerce to Date.
    date: z.coerce.date(),
    title: z.string(),
    summary: z.string().optional(),
    link: z.string().url().optional(),
  }),
});

export const collections = { positions, awards, people, publications, research, news };
