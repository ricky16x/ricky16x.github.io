export const PROFILE = {
  name: 'Rounak Dey',
  title: 'Backend Engineer',
  summary:
    'Computer Science undergraduate at IIIT Delhi focused on backend systems, distributed systems, database internals, and secure application engineering.',
  email: 'rounak23449@iiitd.ac.in',
  phone: '+91 7982542472',
  github: 'https://github.com/ricky16x',
  linkedin: 'https://linkedin.com/in/rickyxr',
  location: 'New Delhi, India',
  resume: './assets/RounakDeyResume.pdf',
};

export const SKILLS = {
  Languages: ['C/C++', 'Java', 'Golang', 'SQL'],
  'Competitive Programming': ['LeetCode Knight (1977)', 'Codeforces Expert (1671)'],
  'Core Expertise': ['Data Structures & Algorithms', 'Operating Systems', 'System Design', 'Object Oriented Programming'],
  Tools: ['Git', 'Docker', 'Linux', 'Kafka', 'Kubernetes', 'Redis', 'RabbitMQ', 'Elasticsearch'],
  Databases: ['MongoDB', 'DynamoDB', 'Cassandra', 'PostgreSQL', 'MySQL'],
  Coursework: ['Introduction to Fintech', 'Operating Systems', 'Database Management Systems', 'Computer Networks'],
};

export const EXPERIENCE = [
  {
    role: 'Undergraduate Student Researcher',
    company: 'Network Security Lab, IIIT Delhi',
    period: 'August 2025 – Present',
    description:
      'Investigating behavioral signals for Android malware detection and open-set network classification.',
  },
];

export const EDUCATION = [
  {
    degree: 'Bachelor of Technology in Computer Science & Engineering',
    school: 'Indraprastha Institute of Information Technology (IIIT Delhi)',
    period: 'Aug. 2023 – 2027',
    description: 'New Delhi, India',
  },
];

export const THEME_OPTIONS = ['default', 'midnight', 'aurora'];

export const FORTUNE_QUOTES = [
  '“The best backend systems are boring in the right way: predictable, resilient, and fast.”',
  '“A database is not just a store; it is a contract for correctness under load.”',
  '“If your system breaks when traffic doubles, it is not a system yet — it is a prototype.”',
  '“Latency is a product feature, and reliability is the only sustainable growth strategy.”',
  '“The most resilient services are usually the simplest ones that respect the edge cases.”',
  '“Graceful degradation beats heroic debugging when the outage window is already open.”',
  '“Ship the boring thing well, then optimize the bottleneck with evidence.”',
];

export function getCommandList() {
  return [
    { command: 'help', description: 'Display all available commands.' },
    { command: 'whoami', description: 'Display my name and professional title.' },
    { command: 'about', description: 'Display the professional introduction.' },
    { command: 'skills', description: 'Display all technical skills grouped by category.' },
    { command: 'projects', description: 'List portfolio projects.' },
    { command: 'project <name>', description: 'Display details about a specific project.' },
    { command: 'experience', description: 'Display professional experience.' },
    { command: 'education', description: 'Display educational background.' },
    { command: 'contact', description: 'Display contact information and social links.' },
    { command: 'github', description: 'Open my GitHub profile.' },
    { command: 'linkedin', description: 'Open my LinkedIn profile.' },
    { command: 'resume', description: 'Open or download my resume when configured.' },
    { command: 'date', description: 'Display the current date.' },
    { command: 'pwd', description: 'Display the simulated working directory.' },
    { command: 'cd <path>', description: 'Change into a portfolio directory.' },
    { command: 'ls', description: 'List available portfolio sections or resources.' },
    { command: 'cat about.txt', description: 'Display the about section.' },
    { command: 'cat skills.txt', description: 'Display technical skills.' },
    { command: 'cat projects.json', description: 'Display project data in a readable format.' },
    { command: 'meow', description: 'Meet the portfolio cat.' },
    { command: 'matrix', description: 'Run a small terminal-style easter egg.' },
    { command: 'fortune', description: 'Display a backend engineering proverb.' },
    { command: 'neofetch', description: 'Display a creative profile summary.' },
    { command: 'theme', description: 'Display available themes or switch themes.' },
    { command: 'history', description: 'Display previously executed commands.' },
    { command: 'clear', description: 'Clear terminal output.' },
    { command: 'banner', description: 'Display the portfolio welcome banner.' },
    { command: 'sudo hire-me', description: 'Run the hiring-mode profile check and show contact links.' },
    { command: 'copy', description: 'Copy the configured contact card to the clipboard.' },
    { command: 'exit', description: 'Display a browser-based portfolio message.' },
  ];
}

export function buildProjectLookup(projects) {
  return projects.reduce((lookup, project) => {
    const keys = new Set([
      project.id,
      normalizeProjectName(project.id),
      project.name,
      project.name.toLowerCase(),
      normalizeProjectName(project.name),
      project.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' '),
      project.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(),
      project.name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().toLowerCase(),
    ]);

    for (const key of keys) {
      if (key) lookup.set(key.trim().toLowerCase(), project);
    }

    return lookup;
  }, new Map());
}

export function normalizeProjectName(value) {
  return (value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ');
}

export function isValidUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.href);
    return Boolean(parsed.protocol === 'http:' || parsed.protocol === 'https:');
  } catch (error) {
    return false;
  }
}

export function openExternalUrl(url) {
  if (!isValidUrl(url)) {
    return false;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function getThemeSummary(currentTheme) {
  return THEME_OPTIONS.map((theme) => ({
    label: theme,
    active: theme === currentTheme,
  }));
}

export function getProjectSummaryText(projects) {
  return projects.map((project) => `- ${project.name} — ${project.summary}`);
}

export function getAboutText() {
  return [
    PROFILE.summary,
    '',
    `Location: ${PROFILE.location}`,
  ];
}

export function getContactText() {
  return [
    `📞 Phone: ${PROFILE.phone}`,
    `📧 Email: ${PROFILE.email}`,
    `🐙 GitHub: ${PROFILE.github}`,
    `💼 LinkedIn: ${PROFILE.linkedin}`,
  ];
}

export function getSuggestions(input, list) {
  const query = (input || '').trim().toLowerCase();
  if (!query) return [];

  return list.filter((item) => item.toLowerCase().startsWith(query)).slice(0, 6);
}

export function getCurrentDate() {
  return new Date().toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
}

export function getAsciiBanner() {
  return [
    '  ____                    _    _     _       _                   ',
    ' |  _ \\ _ __ ___  ___ ___ | |_ | |__ | | ___ | |__   ___  _ __    ',
    ' | |_) | |__| |  | |  | | | | | | | | | | | | |  | |  | | | |',
    ' |  __/| |  | |_| | |_| | | |_ | |_| | |_| | |_| |_| |_| |_| |',
    ' |_|   |_|  \\___|\\___\\___/ \\__||_| |_|_|\\___/|_.__/ \\___/|_| |_|',
    '                                                                  ',
    '  Backend engineer • systems builder • resilience-first product mind',
    '  ricky16x // portfolio // type "help" to explore the terminal.',
  ];
}
