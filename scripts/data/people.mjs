// Structured source for lab members + alumni. Ingest script emits one YAML file
// per person under src/content/people/. Transcribed from seed/source-extraction.md.

/** @typedef {{name:string,role:'PI'|'PostDoc'|'PhD'|'MTech'|'MSc',status:'current'|'alumni',yearJoined?:number,yearGraduated?:number,period?:string,currentPosition?:string,profileUrl?:string,coAdvisor?:string,note?:string}} Person */

/** @type {Person[]} */
export const people = [
  // ---- Current PhD ----
  { name: 'Aditya Prakash', role: 'PhD', status: 'current', yearJoined: 2021, note: 'Thesis submitted' },
  { name: 'Husna Moab', role: 'PhD', status: 'current', yearJoined: 2023 },
  { name: 'Rahaman Ali', role: 'PhD', status: 'current', yearJoined: 2023 },
  { name: 'Aarohi Kumari', role: 'PhD', status: 'current', yearJoined: 2024 },
  { name: 'Rakhi Yadav', role: 'PhD', status: 'current', yearJoined: 2024 },
  // ---- Current MSc ----
  { name: 'Guriya Sharma', role: 'MSc', status: 'current', period: '2025–2026' },
  { name: 'Ismita Singh', role: 'MSc', status: 'current', period: '2025–2026' },
  // ---- Current MTech (jointly supervised) ----
  {
    name: 'Meenu Devi',
    role: 'MTech',
    status: 'current',
    period: '2025–2026',
    coAdvisor: 'Prof. Jimson Mathew (Dept. of CSE)',
  },
  {
    name: 'Ravi Choudhary',
    role: 'MTech',
    status: 'current',
    period: '2025–2026',
    coAdvisor: 'Prof. Jimson Mathew (Dept. of CSE)',
  },

  // ---- PhD alumni ----
  {
    name: 'Anuj Kumar',
    role: 'PhD',
    status: 'alumni',
    yearGraduated: 2017,
    currentPosition: 'Assistant Professor, Thapar Institute of Engineering & Technology, Patiala',
    profileUrl: 'https://www.thapar.edu/faculties/view/Dr.-Anuj-Kumar/MjE4/MTM=',
  },
  {
    name: 'Anuradha Yadav',
    role: 'PhD',
    status: 'alumni',
    yearGraduated: 2018,
    profileUrl: 'https://scholar.google.co.in/citations?user=sKVFfrUAAAAJ&hl=en',
  },
  {
    name: 'Tanuja Das',
    role: 'PhD',
    status: 'alumni',
    yearGraduated: 2022,
    currentPosition: 'Post-Doctoral Fellow, Université de Montréal, Canada',
    profileUrl: 'https://scholar.google.co.in/citations?user=sRVMfnkAAAAJ&hl=en&oi=ao',
  },
  {
    name: 'Akriti Srivastava',
    role: 'PhD',
    status: 'alumni',
    yearGraduated: 2023,
    currentPosition: 'Assistant Professor, Galgotias University',
    profileUrl: 'https://scholar.google.co.in/citations?user=OBLXWi0AAAAJ&hl=en',
  },
  {
    name: 'Rajen Kumar',
    role: 'PhD',
    status: 'alumni',
    yearGraduated: 2024,
    currentPosition: 'Post-Doctoral Fellow, Dept. of Electrical Engineering, IIT Kanpur',
    profileUrl: 'https://sites.google.com/view/rajenkumar',
  },
  {
    name: 'Anuj Kumar Umrao',
    role: 'PhD',
    status: 'alumni',
    yearGraduated: 2025,
    currentPosition: 'Post-Doctoral Fellow, The Hebrew University of Jerusalem, Rehovot, Israel',
    profileUrl: 'https://scholar.google.com/citations?user=5KB2dM8AAAAJ&hl=en',
  },
  { name: 'Surya Prakash', role: 'PhD', status: 'alumni', yearGraduated: 2025 },
  { name: 'Sonu', role: 'PhD', status: 'alumni', yearGraduated: 2025 },

  // ---- MTech alumni ----
  {
    name: 'Uday Kumar',
    role: 'MTech',
    status: 'alumni',
    period: '2014–2015',
    yearGraduated: 2015,
    currentPosition: 'Assistant Professor, VIT University Bhopal',
    profileUrl: 'https://scholar.google.co.in/citations?user=Qv5kdAIAAAAJ&hl=en',
  },
  {
    name: 'Rajan Singh',
    role: 'MTech',
    status: 'alumni',
    period: '2020–2021',
    yearGraduated: 2021,
    currentPosition: 'Senior Machine Learning Engineer, Ceremorphic, Inc.',
  },
  {
    name: 'Ashutosh Kumar',
    role: 'MTech',
    status: 'alumni',
    period: '2024–2025',
    yearGraduated: 2025,
    coAdvisor: 'Prof. Jimson Mathew (Dept. of CSE)',
  },
  {
    name: 'Dhruv Kanti',
    role: 'MTech',
    status: 'alumni',
    period: '2024–2025',
    yearGraduated: 2025,
    coAdvisor: 'Prof. Jimson Mathew (Dept. of CSE)',
  },

  // ---- MSc alumni ----
  { name: 'Neha Mehra', role: 'MSc', status: 'alumni', period: '2024–2025', yearGraduated: 2025 },
  { name: 'Utkarsh Minj', role: 'MSc', status: 'alumni', period: '2023–2024', yearGraduated: 2024 },
  { name: 'Bithi Maikap', role: 'MSc', status: 'alumni', period: '2023–2024', yearGraduated: 2024 },
  { name: 'Janvi', role: 'MSc', status: 'alumni', period: '2023–2024', yearGraduated: 2024 },
  { name: 'Sayan Acharya', role: 'MSc', status: 'alumni', period: '2022–2023', yearGraduated: 2023 },
  { name: 'Sanchita Mal', role: 'MSc', status: 'alumni', period: '2022–2023', yearGraduated: 2023 },
  { name: 'Priyanshu Srivastava', role: 'MSc', status: 'alumni', period: '2022–2023', yearGraduated: 2023 },
  { name: 'Sekh Kiran Ajij', role: 'MSc', status: 'alumni', period: '2021–2022', yearGraduated: 2022 },
  { name: 'Sajal Debnath', role: 'MSc', status: 'alumni', period: '2021–2022', yearGraduated: 2022 },
  { name: 'Priya Siddarth', role: 'MSc', status: 'alumni', period: '2020–2021', yearGraduated: 2021 },
  { name: 'Kunzang Topgyal Bhutia', role: 'MSc', status: 'alumni', period: '2020–2021', yearGraduated: 2021 },
  { name: 'Bishal Biswas', role: 'MSc', status: 'alumni', period: '2020–2021', yearGraduated: 2021 },
  { name: 'Sheetal Singh', role: 'MSc', status: 'alumni', period: '2019–2020', yearGraduated: 2020 },
  { name: 'Rohit Sharma', role: 'MSc', status: 'alumni', period: '2018–2019', yearGraduated: 2019 },
  { name: 'Mansi', role: 'MSc', status: 'alumni', period: '2018–2019', yearGraduated: 2019 },
  { name: 'Labani Halder', role: 'MSc', status: 'alumni', period: '2018–2019', yearGraduated: 2019 },
  { name: 'Akash Garg', role: 'MSc', status: 'alumni', period: '2017–2018', yearGraduated: 2018 },
];
