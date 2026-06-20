import { profile, fullName } from './profile';

/** Primary navigation - kept to 7 items so nothing is ever buried. */
export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/research' },
  { label: 'Publications', href: '/publications' },
  { label: 'Group', href: '/group' },
  { label: 'Awards', href: '/awards' },
  { label: 'Contact', href: '/contact' },
] as const;

export const site = {
  title: `${fullName}`,
  shortTitle: profile.shortName,
  description: `${fullName} - ${profile.tagline}. ${profile.department}, ${profile.institution}. Mathematical modelling of biological systems, epidemiology, ecology and nonlinear dynamics.`,
  ogImage: '/og/default.png',
};

/** True if `current` path matches `href` (handles trailing slashes + root). */
export function isActive(current: string, href: string): boolean {
  const c = current.replace(/\/$/, '') || '/';
  const h = href.replace(/\/$/, '') || '/';
  if (h === '/') return c === '/';
  return c === h || c.startsWith(h + '/');
}
