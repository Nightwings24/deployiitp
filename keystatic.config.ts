import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * Keystatic - the in-site content editor, mounted at /keystatic on the SAME
 * site (requirement: one unified site, not a separate CMS link).
 *
 *  • Local dev   → edits the files in src/content directly (kind: 'local').
 *  • Production  → set KEYSTATIC_GITHUB_REPO="owner/repo" to commit edits to
 *                  GitHub, which triggers an automatic redeploy. See README.
 *
 * Field labels and descriptions are written for a non-technical editor: every
 * field says, in plain words, what it is and how it is used.
 */

// NOTE: keystatic.config.ts is bundled for BOTH the server and the browser
// (the editor UI loads it client-side), so env access must use import.meta.env
// - `process` does not exist in the browser. To enable GitHub storage in
// production, set PUBLIC_KEYSTATIC_GITHUB_REPO="owner/repo" (see README).
const githubRepo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO as string | undefined;
const storage = githubRepo
  ? ({ kind: 'github', repo: githubRepo as `${string}/${string}` } as const)
  : ({ kind: 'local' } as const);

// Controlled topic vocabulary - keep in sync with PUB_TOPICS in content.config.ts.
const TOPIC_OPTIONS = [
  { label: 'Mathematical Epidemiology', value: 'Mathematical Epidemiology' },
  { label: 'Ecology / Predator–Prey', value: 'Ecology / Predator–Prey' },
  { label: 'Nonlinear Dynamics', value: 'Nonlinear Dynamics' },
  { label: 'HIV Dynamics', value: 'HIV Dynamics' },
  { label: 'Optimal Control', value: 'Optimal Control' },
  { label: 'Coding Theory', value: 'Coding Theory' },
  { label: 'COVID-19', value: 'COVID-19' },
  { label: 'Tuberculosis', value: 'Tuberculosis' },
  { label: 'Machine Learning', value: 'Machine Learning' },
];

export default config({
  storage,
  ui: {
    brand: { name: 'Srivastava - Site Editor' },
    navigation: {
      'Your profile': ['profile'],
      'Roles & recognition': ['positions', 'awards'],
      Research: ['research', 'publications'],
      'People & news': ['people', 'news'],
    },
  },

  singletons: {
    profile: singleton({
      label: 'Your profile',
      path: 'src/content/profile/',
      format: { data: 'json' },
      schema: {
        name: fields.text({
          label: 'Full name',
          description: 'Your name without the honorific (e.g. "Prashant Kumar Srivastava").',
        }),
        honorific: fields.text({ label: 'Honorific', description: 'e.g. "Dr."' }),
        shortName: fields.text({ label: 'Short name', description: 'Used in compact places.' }),
        tagline: fields.text({
          label: 'Tagline',
          description: 'One short phrase shown under your name.',
          multiline: true,
        }),
        researchSummary: fields.text({
          label: 'One-line research summary',
          description: 'A single sentence describing your research, shown on the home page.',
          multiline: true,
        }),
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Phone' }),
        addressLines: fields.array(fields.text({ label: 'Line' }), {
          label: 'Postal address',
          description: 'One line per row (room, department, city, etc.).',
          itemLabel: (props) => props.value,
        }),
        labName: fields.text({ label: 'Lab name' }),
        department: fields.text({ label: 'Department' }),
        institution: fields.text({ label: 'Institution' }),
        photo: fields.text({
          label: 'Photo path',
          description: 'Path under /public to your portrait, e.g. "/portrait.jpg". Leave blank to use the placeholder.',
        }),
        cv: fields.text({
          label: 'CV file path',
          description: 'Path under /public to your CV PDF, e.g. "/CV.pdf". Leave blank to hide the CV button.',
        }),
        phdNote: fields.text({
          label: 'Note for prospective PhD students',
          multiline: true,
        }),
        nameVariants: fields.array(fields.text({ label: 'Variant' }), {
          label: 'Name variants (for bolding you in author lists)',
          description: 'All the ways your name appears as a co-author, e.g. "P.K. Srivastava".',
          itemLabel: (props) => props.value,
        }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            url: fields.text({ label: 'URL' }),
            icon: fields.select({
              label: 'Icon',
              options: [
                { label: 'Email', value: 'email' },
                { label: 'Google Scholar', value: 'scholar' },
                { label: 'ORCID', value: 'orcid' },
                { label: 'ResearchGate', value: 'researchgate' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Generic link', value: 'link' },
              ],
              defaultValue: 'link',
            }),
          }),
          {
            label: 'Profile links',
            description: 'Featured as icons (Email, Scholar, ORCID, ResearchGate, LinkedIn).',
            itemLabel: (props) => props.fields.label.value,
          },
        ),
        secondaryLinks: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            url: fields.text({ label: 'URL' }),
          }),
          {
            label: 'Secondary links (text only)',
            description: 'Scopus, Web of Science, IRINS, etc. Shown on the Contact page.',
            itemLabel: (props) => props.fields.label.value,
          },
        ),
      },
    }),
  },

  collections: {
    positions: collection({
      label: 'Positions & roles',
      path: 'src/content/positions/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['title', 'organization'],
      schema: {
        title: fields.slug({
          name: { label: 'Title', description: 'e.g. "Head, Department of Mathematics".' },
        }),
        organization: fields.text({ label: 'Organization' }),
        location: fields.text({ label: 'Location (optional)' }),
        startDate: fields.text({
          label: 'Start date',
          description: 'Year, or YYYY-MM / YYYY-MM-DD. Leave blank for standing appointments.',
        }),
        endDate: fields.text({
          label: 'End date',
          description: 'Leave blank if this role is current (and tick "Current" below).',
        }),
        isCurrent: fields.checkbox({ label: 'Current role', defaultValue: false }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Academic appointment', value: 'appointment' },
            { label: 'Administrative / institute service', value: 'administrative' },
            { label: 'Professional society', value: 'professional-society' },
          ],
          defaultValue: 'administrative',
        }),
        note: fields.text({ label: 'Note (optional)', multiline: true }),
        url: fields.text({ label: 'Link (optional)' }),
        order: fields.integer({ label: 'Manual order', defaultValue: 0 }),
      },
    }),

    awards: collection({
      label: 'Awards & honours',
      path: 'src/content/awards/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['title', 'org'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        org: fields.text({ label: 'Awarding body (optional)' }),
        year: fields.integer({ label: 'Year', description: 'For a single-year award.' }),
        yearStart: fields.integer({ label: 'Start year', description: 'For multi-year honours.' }),
        yearEnd: fields.integer({ label: 'End year', description: 'Blank = ongoing.' }),
        note: fields.text({ label: 'Note (optional)', multiline: true }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Award', value: 'award' },
            { label: 'Honour', value: 'honor' },
            { label: 'Fellowship', value: 'fellowship' },
            { label: 'Society role', value: 'society-role' },
          ],
          defaultValue: 'award',
        }),
        order: fields.integer({ label: 'Manual order', defaultValue: 0 }),
      },
    }),

    people: collection({
      label: 'People (lab members & alumni)',
      path: 'src/content/people/*',
      format: { data: 'yaml' },
      slugField: 'name',
      columns: ['name', 'role', 'status'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        role: fields.select({
          label: 'Role',
          options: [
            { label: 'Principal Investigator', value: 'PI' },
            { label: 'Post-doc', value: 'PostDoc' },
            { label: 'PhD', value: 'PhD' },
            { label: 'MTech', value: 'MTech' },
            { label: 'MSc', value: 'MSc' },
          ],
          defaultValue: 'PhD',
        }),
        status: fields.select({
          label: 'Status',
          description: 'Move someone here from "current" to "alumni" when they graduate.',
          options: [
            { label: 'Current member', value: 'current' },
            { label: 'Alumnus / alumna', value: 'alumni' },
          ],
          defaultValue: 'current',
        }),
        yearJoined: fields.integer({ label: 'Year joined (optional)' }),
        yearGraduated: fields.integer({ label: 'Year graduated (optional)' }),
        period: fields.text({
          label: 'Period (optional)',
          description: 'For taught-program cohorts, e.g. "2025–2026".',
        }),
        currentPosition: fields.text({
          label: 'Current position (for alumni)',
          multiline: true,
        }),
        profileUrl: fields.text({ label: 'Profile link (optional)' }),
        coAdvisor: fields.text({ label: 'Co-advisor (optional)' }),
        note: fields.text({ label: 'Note (optional)' }),
        order: fields.integer({ label: 'Manual order', defaultValue: 0 }),
      },
    }),

    publications: collection({
      label: 'Publications',
      path: 'src/content/publications/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        authors: fields.array(fields.text({ label: 'Author' }), {
          label: 'Authors',
          description: 'In order. Write your own name exactly as a name variant so it is bolded.',
          itemLabel: (props) => props.value,
        }),
        venue: fields.text({ label: 'Journal / conference / book' }),
        year: fields.integer({ label: 'Year', defaultValue: new Date().getFullYear() }),
        volume: fields.text({ label: 'Volume (optional)' }),
        issue: fields.text({ label: 'Issue (optional)' }),
        pages: fields.text({ label: 'Pages (optional)' }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Journal article', value: 'journal' },
            { label: 'Conference paper', value: 'conference' },
            { label: 'Book chapter', value: 'book-chapter' },
          ],
          defaultValue: 'journal',
        }),
        topics: fields.multiselect({ label: 'Topics', options: TOPIC_OPTIONS }),
        doi: fields.text({ label: 'DOI (optional)', description: 'Just the DOI, e.g. 10.1007/...' }),
        url: fields.text({ label: 'URL (optional)' }),
        pdfUrl: fields.text({ label: 'Free/PDF URL (optional)' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Published', value: 'published' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'In press', value: 'in-press' },
          ],
          defaultValue: 'published',
        }),
        featured: fields.checkbox({
          label: 'Feature on home page',
          defaultValue: false,
        }),
      },
    }),

    research: collection({
      label: 'Research themes',
      path: 'src/content/research/*',
      format: { contentField: 'content' },
      slugField: 'title',
      columns: ['title'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        summary: fields.text({
          label: 'Summary',
          description: 'One or two plain-language sentences (what it is + why it matters).',
          multiline: true,
        }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        relatedTopics: fields.multiselect({
          label: 'Related publication topics',
          description: 'Links this theme to matching publications.',
          options: TOPIC_OPTIONS,
        }),
        icon: fields.text({ label: 'Icon name (optional)' }),
        content: fields.markdoc({ label: 'Full description' }),
      },
    }),

    news: collection({
      label: 'News & updates',
      path: 'src/content/news/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Headline' } }),
        date: fields.date({ label: 'Date' }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        link: fields.text({ label: 'Link (optional)' }),
      },
    }),
  },
});
