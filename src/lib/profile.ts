import profileData from '../content/profile/index.json';
import { z } from 'astro:content';

/** Profile singleton schema - validated at import so bad data fails the build. */
const linkSchema = z.object({
  label: z.string(),
  url: z.string(),
  icon: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string(),
  honorific: z.string().default(''),
  shortName: z.string(),
  tagline: z.string(),
  researchSummary: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  addressLines: z.array(z.string()).default([]),
  labName: z.string(),
  department: z.string(),
  institution: z.string(),
  photo: z.string().default(''),
  cv: z.string().default(''),
  phdNote: z.string(),
  nameVariants: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
  secondaryLinks: z.array(linkSchema).default([]),
});

export type Profile = z.infer<typeof profileSchema>;
export const profile: Profile = profileSchema.parse(profileData);

/** Bare ORCID iD, used for JSON-LD and the ingestion pipeline. */
export const ORCID_ID = '0000-0002-7651-5639';

/** Full display name with honorific, e.g. "Dr. Prashant Kumar Srivastava". */
export const fullName = [profile.honorific, profile.name].filter(Boolean).join(' ').trim();
