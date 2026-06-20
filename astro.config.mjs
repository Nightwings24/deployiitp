// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';

/**
 * Keystatic (the in-site editor at /keystatic) is React-based and needs an
 * on-demand server route. To keep the *public* build a clean, host-agnostic
 * static site that deploys anywhere (Netlify, Vercel, Pages, GitHub Pages),
 * the editor is only mounted when ENABLE_KEYSTATIC=true (always true in `dev`).
 *
 *   npm run dev                      -> public site + editor at /keystatic
 *   npm run build                    -> static public site only (default)
 *   ENABLE_KEYSTATIC=true npm run build  -> include editor (needs a server adapter)
 *
 * The content itself is read by Astro Content Collections directly from the
 * files in src/content - so the public site never depends on Keystatic.
 */
const enableKeystatic =
  process.env.ENABLE_KEYSTATIC === 'true' || process.env.NODE_ENV !== 'production';

const integrations = [sitemap(), mdx(), markdoc()];

if (enableKeystatic) {
  // Lazy, conditional imports so a plain static build needs neither React nor Keystatic.
  const react = (await import('@astrojs/react')).default;
  const keystatic = (await import('@keystatic/astro')).default;
  integrations.unshift(react(), keystatic());
}

// Set this to the final deployed URL before going live (used for canonical URLs,
// sitemap, RSS and Open Graph image absolute paths). Safe placeholder for previews.
const SITE_URL = process.env.SITE_URL || 'https://pksrivastava.netlify.app';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  integrations,
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Allow remote optimization only if ever needed; local assets are the norm.
    domains: [],
  },
});
