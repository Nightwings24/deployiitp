# Dr. Prashant Kumar Srivastava - Academic Portfolio

A fast, accessible, easy-to-maintain personal academic website for
**Dr. Prashant Kumar Srivastava** - Associate Professor & Head, Department of
Mathematics, IIT Patna. Built as a lifelong **portfolio** (roles and titles are
data with dates, so the site survives every role change), not a fixed
"position page".

| | |
|---|---|
| **Framework** | [Astro 5](https://astro.build) (static output, ~zero JavaScript) |
| **Styling** | Tailwind CSS v4 + design tokens, self-hosted fonts |
| **Content** | Astro Content Collections (Markdown / YAML in Git - no database) |
| **Editor** | [Keystatic](https://keystatic.com) mounted at `/keystatic` on the same site |
| **Lighthouse** | **Performance 97–100 · Accessibility 100 · Best Practices 100 · SEO 100** |

---

## ✍️ How to update your website (for Dr. Srivastava)

You never have to touch code. The website has a built-in editor.

1. **Open the editor.** Go to your site address followed by **`/keystatic`**
   (for example, `https://your-site.example/keystatic`). When running on your own
   computer it is `http://localhost:4321/keystatic`.
2. **Pick what to change** from the left-hand list, edit the friendly form, and
   click **Save**. Every field has a short description telling you what it does.

Common tasks, each under a minute:

| You want to… | Do this in the editor |
|---|---|
| **Change your current title** (e.g. step down as Head) | *Positions & roles* → open the role → untick **Current** and set an **End date**. The homepage and About page update automatically. |
| **Add a publication** | *Publications* → **＋** → fill the form (title, authors, venue, year, type, topics). Type your own name exactly as a *name variant* so it’s shown in **bold**. |
| **Move a student to alumni** | *People* → open the person → change **Status** to *Alumnus*, add their **Year graduated** and **Current position**. |
| **Add a news item** | *News & updates* → **＋** → headline, date, one-line summary. |
| **Swap your photo** | Put the new image in the `public` folder (e.g. `public/portrait.jpg`), then *Your profile* → **Photo path** → `/portrait.jpg`. |
| **Add your CV** | Put `CV.pdf` in the `public` folder, then *Your profile* → **CV file path** → `/CV.pdf`. A “CV” button appears automatically. |

> In local development your edits save straight to the files. In production you
> can connect the editor to GitHub so saves commit and redeploy automatically -
> see [Editing the live site](#editing-the-live-site).

---

## 🚀 Quick start (for developers)

```bash
npm install
npm run dev        # http://localhost:4321  (public site + /keystatic editor)
npm run build      # static site → dist/ (clean, deployable anywhere)
npm run preview    # preview the production build locally
```

Requirements: Node 18.20+ / 20.3+ / 22+. No database, no external services.

---

## 🧱 Project structure

```
src/
├─ components/     Nav, Footer, Hero bits, Card, Tag, Button, PersonCard,
│                 PublicationItem, Icon, JsonLd, PhasePortrait …
├─ layouts/        BaseLayout (head, SEO, fonts, skip-link, nav, footer)
├─ pages/          index, about, research, publications, group, awards, contact, 404
├─ content/        the actual content (edited via Keystatic)
│   ├─ profile/index.json      singleton: identity, links, photo, CV
│   ├─ positions/*.yaml        dated roles (appointment / admin / society)
│   ├─ awards/*.yaml           honours, fellowships
│   ├─ people/*.yaml           lab members + alumni
│   ├─ publications/*.yaml     one file per paper (DOIs auto-resolved)
│   ├─ research/*.mdoc         research themes (rich text)
│   └─ news/*.yaml             updates
├─ lib/            content loaders, formatting, BibTeX, author-emphasis helpers
└─ styles/         global.css - design tokens + base styles
scripts/           content ingestion + dev QA tools (see below)
keystatic.config.ts  the editor schema (mirrors the content model)
```

Everything that can change over time is **data**. Changing a title, adding a
paper, or graduating a student is a one-field edit - never a code change.

---

## 📚 Publications: automatic DOI resolution

The publication list is **not hand-typed**. A build-time pipeline reconciles a
master seed list against public APIs and resolves DOIs + canonical links:

```bash
node scripts/ingest-publications.mjs            # uses cached API responses
node scripts/ingest-publications.mjs --refresh  # re-query ORCID + Crossref
```

1. **Seed list** (`scripts/data/publications.mjs`) - defines completeness (67 works).
2. **ORCID** (`0000-0002-7651-5639`) - primary source of DOIs and types.
3. **Crossref** - backfills DOIs for anything ORCID is missing, with strict
   matching (title similarity + author + year) so nothing weak is auto-accepted.

It writes `src/content/publications/*.yaml` and a human-readable report,
`seed/publications-review.md`, listing anything worth a glance (year tweaks,
items still without a DOI). Raw API responses are cached under `seed/cache/`.

The other data (people, positions, awards) is generated from
`scripts/data/*.mjs` via `node scripts/ingest.mjs`. After the first generation
you can also just edit everything in Keystatic.

---

## 🌐 Deployment

The public site is **fully static** - deploy `dist/` to any host:

- **Netlify / Vercel / Cloudflare Pages / GitHub Pages.** Build command
  `npm run build`, publish directory `dist`.
- Set `SITE_URL` to the final URL (used for canonical/sitemap/OG). See `.env.example`.

No adapter is needed for the public site, and it exposes no admin surface.

### Editing the live site

For non-technical editing **in production**, connect Keystatic to GitHub so saves
commit to the repo and trigger a redeploy:

1. Deploy on a host that supports on-demand routes (Netlify or Vercel) and add
   the matching Astro adapter (`@astrojs/netlify` / `@astrojs/vercel`).
2. Create a GitHub App (Keystatic’s setup wizard at `/keystatic` walks you
   through it) and set the env vars from `.env.example`
   (`PUBLIC_KEYSTATIC_GITHUB_REPO`, `KEYSTATIC_GITHUB_CLIENT_ID/SECRET`,
   `KEYSTATIC_SECRET`).
3. Build with `ENABLE_KEYSTATIC=true`. Access at `/keystatic`; only the owner’s
   GitHub account can edit. The public pages stay static.

Until then, the recommended workflow is: edit locally at `/keystatic`, commit,
push - the host rebuilds automatically.

---

## ♿ Accessibility & performance

Treated as features, not checkboxes, and verified:

- **Lighthouse (mobile & desktop):** Performance ≥ 97, Accessibility 100, Best
  Practices 100, SEO 100.
- **axe-core:** zero violations on every page (WCAG AA contrast included).
- Semantic landmarks, one `h1` per page, skip-to-content link, visible focus
  rings, keyboard-operable nav and filters, ARIA live regions on dynamic results.
- Honors `prefers-reduced-motion`; near-zero motion by design.
- Self-hosted fonts (preloaded, `font-display: swap`), optimized AVIF/WebP
  images with set dimensions (no layout shift), JSON-LD `Person` +
  `ScholarlyArticle`, sitemap, robots, Open Graph image.

### Dev QA helpers (optional)

`scripts/measure.mjs`, `scripts/cdp-check.mjs` - connect to a Chrome/Edge running
with `--remote-debugging-port=9222` to check layout overflow and render a page’s
text/console for verification. Not part of the build.

---

## License

Content © Dr. Prashant Kumar Srivastava. Code may be reused for academic
portfolios.
