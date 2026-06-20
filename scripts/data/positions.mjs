// Positions = dated roles. Categories: appointment (academic rank),
// administrative (institute/department service), professional-society (society
// leadership). One-time honours/fellowships live in awards.mjs instead.
// Transcribed from seed/source-extraction.md.

/** @typedef {{title:string,organization:string,location?:string,startDate?:string,endDate?:string|null,isCurrent?:boolean,category:'appointment'|'administrative'|'professional-society',note?:string,url?:string,order?:number}} Position */

/** @type {Position[]} */
export const positions = [
  // ---- Academic appointment (current rank) ----
  {
    title: 'Associate Professor',
    organization: 'Department of Mathematics, IIT Patna',
    location: 'Patna, India',
    isCurrent: true,
    category: 'appointment',
    order: 0,
  },

  // ---- Administrative & institute service ----
  {
    title: 'Head, Department of Mathematics',
    organization: 'IIT Patna',
    startDate: '2026-01-14',
    isCurrent: true,
    category: 'administrative',
  },
  {
    title: 'Member, Institute Academic Disciplinary Committee',
    organization: 'IIT Patna',
    startDate: '2024-06-11',
    endDate: '2025-05-01',
    category: 'administrative',
  },
  {
    title: 'Head, Department of Mathematics',
    organization: 'IIT Patna',
    startDate: '2023-03-15',
    endDate: '2024-06-04',
    category: 'administrative',
  },
  {
    title: 'Chairman, JEE (Advanced)',
    organization: 'IIT Patna',
    startDate: '2020-09-15',
    endDate: '2021-11',
    category: 'administrative',
  },
  {
    title: 'Vice-Chairman, JEE (Advanced)',
    organization: 'IIT Patna',
    startDate: '2018-08-29',
    endDate: '2020-09-15',
    category: 'administrative',
  },
  {
    title: 'Member, Academic Senate',
    organization: 'IIT Patna',
    startDate: '2017-11',
    endDate: '2024-06',
    category: 'administrative',
    note: 'Across two terms (Nov 2017 – Mar 2022; Mar 2023 – Jun 2024).',
  },
  {
    title: 'Professor-in-Charge, PG Programs',
    organization: 'IIT Patna',
    startDate: '2017-04',
    endDate: '2019-05',
    category: 'administrative',
  },
  {
    title: 'Member, Institute Academic Program Committee (IAPC)',
    organization: 'IIT Patna',
    startDate: '2013',
    endDate: '2019-05',
    category: 'administrative',
  },
  {
    title: 'Department B.Tech Coordinator',
    organization: 'Department of Mathematics, IIT Patna',
    startDate: '2019',
    endDate: '2023',
    category: 'administrative',
  },
  {
    title: 'Secretary, Departmental Academic Program Committee (DAPC)',
    organization: 'Department of Mathematics, IIT Patna',
    startDate: '2016-02',
    endDate: '2018-04',
    category: 'administrative',
  },
  {
    title: 'Faculty in Charge, Academic Registration',
    organization: 'IIT Patna',
    startDate: '2013',
    endDate: '2016',
    category: 'administrative',
  },
  {
    title: 'Associate Faculty in Charge, Academic Registration',
    organization: 'IIT Patna',
    startDate: '2012',
    endDate: '2013',
    category: 'administrative',
  },
  {
    title: 'Department PhD Coordinator',
    organization: 'Department of Mathematics, IIT Patna',
    startDate: '2012-01',
    endDate: '2015-12',
    category: 'administrative',
  },

  // ---- Professional-society leadership ----
  {
    title: 'Chair, Mathematical Epidemiology (MEPI) Subgroup',
    organization: 'Society for Mathematical Biology (SMB)',
    startDate: '2025',
    isCurrent: true,
    category: 'professional-society',
    url: 'https://www.smb.org/',
  },
  {
    title: 'Co-Chair, Mathematical Epidemiology (MEPI) Subgroup',
    organization: 'Society for Mathematical Biology (SMB)',
    startDate: '2024',
    endDate: '2025',
    category: 'professional-society',
    url: 'https://www.smb.org/',
  },
  {
    title: 'Member, Board of Directors',
    organization: 'BIOMAT Consortium',
    startDate: '2022',
    isCurrent: true,
    category: 'professional-society',
    url: 'https://biomat.org/',
  },
  {
    title: 'Joint Secretary',
    organization: 'Indian Society for Mathematical Modeling and Computer Simulation (ISMMACS)',
    startDate: '2022',
    endDate: '2025',
    category: 'professional-society',
    url: 'https://ismmacs.org.in/',
  },
  {
    title: 'Executive Council Member',
    organization: 'Indian Society for Mathematical Modeling and Computer Simulation (ISMMACS)',
    startDate: '2021',
    endDate: '2023',
    category: 'professional-society',
    url: 'https://ismmacs.org.in/',
  },
];
