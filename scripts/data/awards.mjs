// One-time honours, awards and fellowships. Society leadership roles (Chair,
// Secretary, Board member) are modelled as positions instead.
// Transcribed from seed/source-extraction.md.

/** @typedef {{title:string,org?:string,year?:number,yearStart?:number,yearEnd?:number|null,note?:string,category:'award'|'honor'|'fellowship'|'society-role',order?:number}} Award */

/** @type {Award[]} */
export const awards = [
  {
    title: 'Elected Member (Fellow)',
    org: 'The National Academy of Sciences, India (NASI)',
    yearStart: 2017,
    yearEnd: null,
    category: 'honor',
  },
  {
    title: 'J.B. Shukla Award',
    org: 'Indian Mathematical Society',
    year: 2023,
    note: 'Awarded jointly with Dr. Tanuja Das.',
    category: 'award',
  },
  {
    title: 'IMS Prize for Best Paper in Biomathematics',
    org: 'Indian Mathematical Society',
    year: 2008,
    note: '74th Annual Conference, Allahabad.',
    category: 'award',
  },
  {
    title: 'Award for Best Teacher',
    org: 'IIT Patna',
    year: 2013,
    note: 'Sponsored by the State Bank of India.',
    category: 'award',
  },
  {
    title: 'Best Tutor (Teacher) Award',
    org: 'IIT Kanpur',
    year: 2007,
    note: 'For outstanding teaching of MTH 203 (Semester I).',
    category: 'award',
  },
  {
    title: 'NBHM Post-Doctoral Fellowship',
    org: 'Department of Atomic Energy, Government of India',
    yearStart: 2010,
    yearEnd: 2011,
    category: 'fellowship',
  },
  {
    title: 'UGC D.S. Kothari Post-Doctoral Fellowship',
    org: 'University Grants Commission',
    year: 2011,
    note: 'Awarded; not availed.',
    category: 'fellowship',
  },
  {
    title: 'CSIR Junior & Senior Research Fellowship (JRF/SRF)',
    org: 'Council of Scientific and Industrial Research, India',
    yearStart: 2004,
    yearEnd: 2009,
    category: 'fellowship',
  },
  {
    title: 'Travel Grant - CIMPA-UNESCO-MICINN Research School',
    org: 'AIMS, Cape Town, South Africa',
    year: 2011,
    category: 'award',
  },
  {
    title: 'Travel Grant - International Congress of Mathematicians',
    org: 'ICM 2010, Hyderabad',
    year: 2010,
    category: 'award',
  },
];
