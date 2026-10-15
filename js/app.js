import {
  PROFILE,
  SKILLS,
  EXPERIENCE,
  EDUCATION,
  THEME_OPTIONS,
  FORTUNE_QUOTES,
  getAsciiBanner,
  getCommandList,
  getContactText,
  getCurrentDate,
  getProjectSummaryText,
  getSuggestions,
  getThemeSummary,
  openExternalUrl,
  normalizeProjectName,
  buildProjectLookup,
} from './commands.js';
import { Terminal } from './terminal.js';

const outputElement = document.getElementById('terminal-output');
const inputElement = document.getElementById('terminal-input');
const formElement = document.getElementById('command-form');
const terminalModal = document.getElementById('terminal-modal');
const terminalBackdrop = document.getElementById('terminal-backdrop');
const skipBootButton = document.getElementById('skip-boot');
const closeTerminalButton = document.getElementById('close-terminal');
const projectListElement = document.getElementById('project-list');
const skillChipsElement = document.getElementById('skill-chips');

const ROOT_PATH = '/home/ricky16x/portfolio';

const FILE_SYSTEM = {
  [ROOT_PATH]: ['about.txt', 'skills.txt', 'projects.json', 'README.md', 'LICENSE', 'assets', 'css', 'data', 'js'],
  [`${ROOT_PATH}/assets`]: ['favicon.svg', 'resume.txt', 'RounakDeyResume.pdf'],
  [`${ROOT_PATH}/css`]: ['style.css'],
  [`${ROOT_PATH}/data`]: ['projects.json'],
  [`${ROOT_PATH}/js`]: ['app.js', 'commands.js', 'terminal.js'],
};

const FILE_CONTENTS = {
  [`${ROOT_PATH}/about.txt`]: [PROFILE.summary, `Location: ${PROFILE.location}`].join('\n'),
  [`${ROOT_PATH}/skills.txt`]: Object.entries(SKILLS).map(([category, items]) => `${category}: ${items.join(', ')}`).join('\n'),
  [`${ROOT_PATH}/projects.json`]: JSON.stringify({ projects: [] }, null, 2),
  [`${ROOT_PATH}/data/projects.json`]: JSON.stringify({ projects: [] }, null, 2),
  [`${ROOT_PATH}/README.md`]: ['# Rounak Dey Portfolio', '', 'Backend engineer portfolio built as a terminal-themed static site.', ''].join('\n'),
  [`${ROOT_PATH}/assets/resume.txt`]: 'Resume text placeholder. The generated portfolio links to the PDF version in the same folder.',
  [`${ROOT_PATH}/assets/RounakDeyResume.pdf`]: 'PDF binary target — open via the resume command.',
};

const state = {
  currentDir: ROOT_PATH,
  projects: [
    {
      id: 'verdis-go',
      name: 'Verdis-Go: Redis-Compatible In-Memory Data Store',
      summary: 'Golang implementation of a Redis-compatible in-memory data store using the RESP protocol.',
      description: 'Engineered a Redis-compatible in-memory data store in Go from scratch, implementing the RESP protocol and 25+ commands across strings, lists, hashes, and sets, sustaining 79K req/s (GET) and 77K req/s (SET) at sub-millisecond p99 latency.',
      stack: ['Golang', 'TCP/RESP Protocol', 'Redis'],
      features: ['RESP protocol implementation for 25+ commands', 'Goroutine-per-client concurrency model with sharded locking', 'AOF command logging, RDB snapshotting, and replication backlog'],
      github: 'https://github.com/ricky16x/verdis-go',
      demo: '',
      startDate: '2026',
      endDate: '2026',
      notes: 'Verified through live crash-recovery testing and replication behavior analysis.',
    },
    {
      id: 'cipherchat',
      name: 'CipherChat',
      summary: 'Real-time encrypted client-server chat platform with secure room-based communication.',
      description: 'Built a real-time encrypted client-server chat platform in C++17 supporting secure multi-room communication over TCP. Implemented X25519 key exchange, HKDF-SHA256 key derivation, and AES-256-GCM authenticated encryption with AAD-bound per-room and per-session keys.',
      stack: ['C++17', 'Socket Programming', 'OpenSSL'],
      features: ['X25519 key exchange and HKDF-SHA256 derivation', 'AES-256-GCM per-room and per-session encryption', 'Multithreaded server with room management and encrypted history replay'],
      github: 'https://github.com/ricky16x/CipherChat',
      demo: '',
      startDate: '2025',
      endDate: '2025',
      notes: 'Built with a custom binary framing protocol over TCP.',
    },
    {
      id: 'pesky-birds',
      name: 'Pesky Birds',
      summary: '2D physics-based Angry Birds clone built in Java with LibGDX and Box2D.',
      description: 'Developed a 2D physics-based Angry Birds clone using LibGDX and Box2D, featuring slingshot-driven projectile mechanics and collision-based destructible environments. Built multiple levels with progression, scoring, win/lose conditions, pause/resume, and a level-selector system.',
      stack: ['Java', 'LibGDX', 'Box2D', 'Gradle'],
      features: ['Slingshot projectile mechanics and destructible environments', 'Level progression, scoring, and win/lose logic', 'Modular OOP design using inheritance, polymorphism, abstraction, and encapsulation'],
      github: 'https://github.com/ricky16x/AngryBirds',
      demo: '',
      startDate: '2025',
      endDate: '2026',
      notes: 'Built as a modular game architecture with reusable game entities and render hooks.',
    },
  ],
  currentTheme: 'default',
  matrixEnabled: false,
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderPortfolioSections() {
  if (projectListElement) {
    projectListElement.innerHTML = state.projects.map((project) => `
      <article class="project-card">
        <h3>${project.name}</h3>
        <p>${project.summary}</p>
        <div class="project-stack">
          ${project.stack.map((item) => `<span>${item}</span>`).join('')}
        </div>
        <div class="project-actions">
          <a class="link-button" href="${project.github}" target="_blank" rel="noreferrer">Open repo</a>
        </div>
      </article>
    `).join('');
  }

  if (skillChipsElement) {
    const aboutSkillGroups = ['Languages', 'Core Expertise', 'Tools', 'Databases'];
    skillChipsElement.innerHTML = aboutSkillGroups
      .flatMap((group) => SKILLS[group] || [])
      .map((skill) => `<span>${skill}</span>`)
      .join('');
  }
}

function observeSections() {
  const revealTargets = document.querySelectorAll(
    '.portfolio-shell > .section-panel, .content-grid > .info-panel',
  );

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((target) => observer.observe(target));
}

function getStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem('portfolio-theme');
    return THEME_OPTIONS.includes(storedTheme) ? storedTheme : 'default';
  } catch (error) {
    return 'default';
  }
}

function applyTheme(themeName) {
  const safeTheme = THEME_OPTIONS.includes(themeName) ? themeName : 'default';
  document.body.dataset.theme = safeTheme;
  state.currentTheme = safeTheme;
  document.body.classList.toggle('matrix-active', state.matrixEnabled);

  try {
    window.localStorage.setItem('portfolio-theme', safeTheme);
  } catch (error) {
    // Storage is optional; the interface still works without it.
  }
}

function toggleMatrix(forceState) {
  const nextState = typeof forceState === 'boolean' ? forceState : !state.matrixEnabled;
  state.matrixEnabled = nextState;
  document.body.classList.toggle('matrix-active', nextState);
  return nextState;
}

function getRandomFortune() {
  const index = Math.floor(Math.random() * FORTUNE_QUOTES.length);
  return FORTUNE_QUOTES[index];
}

function resolveProject(projectName, projects) {
  const normalized = normalizeProjectName(projectName);
  if (!normalized) {
    return null;
  }

  const lookup = buildProjectLookup(projects);
  return lookup.get(normalized) || projects.find((project) => normalizeProjectName(project.name) === normalized) || null;
}

function formatProject(project) {
  const details = [
    { type: 'text', value: `Name: ${project.name}` },
    { type: 'text', value: `Summary: ${project.summary}` },
    { type: 'text', value: `Stack: ${project.stack.join(', ')}` },
    { type: 'text', value: `Features: ${project.features.join(' • ')}` },
  ];

  if (project.description) {
    details.push({ type: 'text', value: `Description: ${project.description}` });
  }

  if (project.startDate || project.endDate) {
    const range = [project.startDate, project.endDate].filter(Boolean).join(' — ');
    details.push({ type: 'text', value: `Period: ${range}` });
  }

  if (project.notes) {
    details.push({ type: 'text', value: `Notes: ${project.notes}` });
  }

  if (project.github) {
    details.push({ type: 'link', label: 'Repository', href: project.github });
  }

  if (project.demo) {
    details.push({ type: 'link', label: 'Live demo', href: project.demo });
  }

  return details;
}

function resolveDirectory(desiredPath, currentPath = state.currentDir) {
  const homeRoot = ROOT_PATH;
  const normalized = (desiredPath || '').trim();

  if (!normalized || normalized === '~' || normalized === homeRoot) {
    return homeRoot;
  }

  let candidate = normalized;
  if (candidate.startsWith('~/')) {
    candidate = `${homeRoot}/${candidate.slice(2)}`;
  } else if (candidate === '~') {
    candidate = homeRoot;
  } else if (candidate.startsWith('/')) {
    candidate = candidate;
  } else {
    candidate = `${currentPath}/${candidate}`;
  }

  const parts = candidate.split('/').filter(Boolean);
  const stack = [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
      continue;
    }
    stack.push(part);
  }

  const resolved = `/${stack.join('/')}`;
  const validRoots = new Set([ROOT_PATH, `${ROOT_PATH}/assets`, `${ROOT_PATH}/css`, `${ROOT_PATH}/data`, `${ROOT_PATH}/js`]);
  return validRoots.has(resolved) ? resolved : null;
}

async function fetchProjects() {
  const fallbackProjects = [
    {
      id: 'verdis-go',
      name: 'Verdis-Go: Redis-Compatible In-Memory Data Store',
      summary: 'Golang implementation of a Redis-compatible in-memory data store using the RESP protocol.',
      description: 'Engineered a Redis-compatible in-memory data store in Go from scratch, implementing the RESP protocol and 25+ commands across strings, lists, hashes, and sets, sustaining 79K req/s (GET) and 77K req/s (SET) at sub-millisecond p99 latency.',
      stack: ['Golang', 'TCP/RESP Protocol', 'Redis'],
      features: ['RESP protocol implementation for 25+ commands', 'Goroutine-per-client concurrency model with sharded locking', 'AOF command logging, RDB snapshotting, and replication backlog'],
      github: 'https://github.com/ricky16x/verdis-go',
      demo: '',
      startDate: '2026',
      endDate: '2026',
      notes: 'Verified through live crash-recovery testing and replication behavior analysis.',
    },
    {
      id: 'cipherchat',
      name: 'CipherChat',
      summary: 'Real-time encrypted client-server chat platform with secure room-based communication.',
      description: 'Built a real-time encrypted client-server chat platform in C++17 supporting secure multi-room communication over TCP. Implemented X25519 key exchange, HKDF-SHA256 key derivation, and AES-256-GCM authenticated encryption with AAD-bound per-room and per-session keys.',
      stack: ['C++17', 'Socket Programming', 'OpenSSL'],
      features: ['X25519 key exchange and HKDF-SHA256 derivation', 'AES-256-GCM per-room and per-session encryption', 'Multithreaded server with room management and encrypted history replay'],
      github: 'https://github.com/ricky16x/CipherChat',
      demo: '',
      startDate: '2025',
      endDate: '2025',
      notes: 'Built with a custom binary framing protocol over TCP.',
    },
    {
      id: 'pesky-birds',
      name: 'Pesky Birds',
      summary: '2D physics-based Angry Birds clone built in Java with LibGDX and Box2D.',
      description: 'Developed a 2D physics-based Angry Birds clone using LibGDX and Box2D, featuring slingshot-driven projectile mechanics and collision-based destructible environments. Built multiple levels with progression, scoring, win/lose conditions, pause/resume, and a level-selector system.',
      stack: ['Java', 'LibGDX', 'Box2D', 'Gradle'],
      features: ['Slingshot projectile mechanics and destructible environments', 'Level progression, scoring, and win/lose logic', 'Modular OOP design using inheritance, polymorphism, abstraction, and encapsulation'],
      github: 'https://github.com/ricky16x/AngryBirds',
      demo: '',
      startDate: '2025',
      endDate: '2026',
      notes: 'Built as a modular game architecture with reusable game entities and render hooks.',
    },
  ];

  try {
    const response = await fetch('./data/projects.json', { cache: 'no-store' });
    if (!response.ok) {
      return fallbackProjects;
    }

    const payload = await response.json();
    return Array.isArray(payload.projects) ? payload.projects : fallbackProjects;
  } catch (error) {
    return fallbackProjects;
  }
}

async function resumeExists() {
  const candidates = ['./assets/RounakDeyResume.pdf', './assets/resume.txt', './assets/resume.pdf'];

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: 'HEAD' });
      if (response.ok) {
        return candidate;
      }
    } catch (error) {
      // Ignore and continue to the next candidate.
    }
  }

  return false;
}

function showBootSequence() {
  if (prefersReducedMotion) {
    terminal.appendText('Boot sequence skipped by reduced-motion preference.', 'terminal-line muted');
    return;
  }

  const bootLines = [
    'Booting portfolio environment...',
    'Loading core profile modules...',
    'Checking command registry: OK',
    'Personalized terminal ready.',
    'Type "help" to explore the portfolio.',
  ];

  bootLines.forEach((line, index) => {
    window.setTimeout(() => {
      terminal.appendText(line, 'terminal-line muted');
    }, index * 180);
  });
}

const terminal = new Terminal({
  outputElement,
  inputElement,
  formElement,
  commandList: getCommandList(),
  onCommand: async (rawCommand) => {
    const normalized = rawCommand.trim();
    if (!normalized) {
      return [];
    }

    const [commandName, ...args] = normalized.split(/\s+/);
    const lowerCommand = commandName.toLowerCase();
    const aliasMap = {
      h: 'help',
      '?': 'help',
      id: 'whoami',
      who: 'whoami',
      info: 'about',
      aboutme: 'about',
      p: 'projects',
      proj: 'project',
      gh: 'github',
      li: 'linkedin',
      cv: 'resume',
      cls: 'clear',
      clr: 'clear',
      c: 'clear',
      cmd: 'help',
      matrix: 'matrix',
      fortune: 'fortune',
      rick: 'matrix',
    };
    const effectiveCommand = aliasMap[lowerCommand] || lowerCommand;
    const joinedArgs = args.join(' ');

    if (effectiveCommand === 'clear') {
      terminal.clearOutput();
      return [];
    }

    if (effectiveCommand === 'help') {
      return [
        { type: 'block', title: 'Available commands', content: getCommandList().map((item) => `${item.command} — ${item.description}`) },
      ];
    }

    if (effectiveCommand === 'whoami') {
      return [
        { type: 'text', value: `Name: ${PROFILE.name}` },
        { type: 'text', value: `Title: ${PROFILE.title}` },
      ];
    }

    if (effectiveCommand === 'about') {
      return [
        { type: 'text', value: PROFILE.summary },
        { type: 'text', value: `Location: ${PROFILE.location}` },
      ];
    }

    if (effectiveCommand === 'skills') {
      const groups = Object.entries(SKILLS).map(([category, items]) => `${category}: ${items.join(', ')}`);
      return [{ type: 'block', title: 'Skills', content: groups }];
    }

    if (effectiveCommand === 'projects') {
      return [{ type: 'block', title: 'Projects', content: getProjectSummaryText(state.projects) }];
    }

    if (effectiveCommand === 'project') {
      const projectName = joinedArgs.trim();
      if (!projectName) {
        return [{ type: 'text', value: 'Usage: project <name>' }];
      }

      const project = resolveProject(projectName, state.projects);
      if (!project) {
        const examples = state.projects.slice(0, 3).map((item) => item.name);
        return [
          { type: 'text', value: `Project not found: ${projectName}` },
          { type: 'text', value: `Try: ${examples.join(', ') || 'help'}` },
        ];
      }

      return formatProject(project);
    }

    if (effectiveCommand === 'experience') {
      return [
        { type: 'block', title: 'Experience', content: EXPERIENCE.map((item) => `${item.role} @ ${item.company} — ${item.period}`) },
        ...EXPERIENCE.map((item) => ({ type: 'text', value: item.description })),
      ];
    }

    if (effectiveCommand === 'education') {
      return [
        { type: 'block', title: 'Education', content: EDUCATION.map((item) => `${item.degree} @ ${item.school} — ${item.period}`) },
        ...EDUCATION.map((item) => ({ type: 'text', value: item.description })),
      ];
    }

    if (effectiveCommand === 'contact') {
      return [
        { type: 'block', title: 'Contact', content: getContactText() },
        { type: 'link', label: '📞 Call', href: `tel:${PROFILE.phone.replace(/\s+/g, '')}` },
        { type: 'link', label: '📧 Email', href: `mailto:${PROFILE.email}` },
        { type: 'link', label: '🐙 GitHub', href: PROFILE.github },
        { type: 'link', label: '💼 LinkedIn', href: PROFILE.linkedin },
      ];
    }

    if (effectiveCommand === 'github') {
      openExternalUrl(PROFILE.github);
      return [{ type: 'text', value: `Opening GitHub profile: ${PROFILE.github}` }];
    }

    if (effectiveCommand === 'linkedin') {
      openExternalUrl(PROFILE.linkedin);
      return [{ type: 'text', value: `Opening LinkedIn profile: ${PROFILE.linkedin}` }];
    }

    if (effectiveCommand === 'resume') {
      const resumeFile = await resumeExists();
      if (!resumeFile) {
        return [
          { type: 'text', value: 'No resume file is currently configured.' },
          { type: 'text', value: 'Add a real resume file to ./assets/resume.pdf or ./assets/resume.txt, or update PROFILE.resume in js/commands.js.' },
        ];
      }

      openExternalUrl(resumeFile);
      return [{ type: 'text', value: `Opening resume: ${resumeFile}` }];
    }

    if (effectiveCommand === 'date') {
      return [{ type: 'text', value: getCurrentDate() }];
    }

    if (effectiveCommand === 'pwd') {
      return [{ type: 'text', value: state.currentDir }];
    }

    if (effectiveCommand === 'cd') {
      const target = args[0] || '~';
      const nextDir = resolveDirectory(target, state.currentDir);

      if (!nextDir) {
        return [{ type: 'text', value: `cd: ${target}: No such file or directory` }];
      }

      state.currentDir = nextDir;
      return [{ type: 'text', value: `cwd: ${state.currentDir}` }];
    }

    if (effectiveCommand === 'matrix') {
      const enabled = toggleMatrix();
      const lines = [
        '01011010 01101001 01100110 01100101 00101110',
        '01110100 01101000 01100101 00100000 01100010',
        '01110101 01100111 01110011 00101110',
        '01100100 01100101 01100110 01100101 01101110',
        '01100100 00100000 01101001 01110011 00100000',
        '01110010 01100101 01100001 01100100 01111001.',
        `Matrix mode: ${enabled ? 'ON' : 'OFF'} — ${enabled ? 'green rain engaged' : 'green rain dormant'}.`,
      ];

      return [{ type: 'block', title: 'matrix', content: lines }];
    }

    if (effectiveCommand === 'fortune') {
      return [{ type: 'text', value: getRandomFortune() }];
    }

    if (effectiveCommand === 'ls') {
      const dirKey = state.currentDir || ROOT_PATH;
      const items = FILE_SYSTEM[dirKey] || [];
      const hiddenFlag = args.includes('-la') || args.includes('-a') || args.includes('-al');
      const content = hiddenFlag ? ['.', '..', ...items] : items;
      return [{ type: 'block', title: dirKey, content }];
    }

    if (effectiveCommand === 'cat') {
      const fileName = (args[0] || '').trim();
      if (!fileName) {
        return [{ type: 'text', value: 'cat: missing file operand' }];
      }

      if (fileName.toLowerCase() === 'meow') {
        return [{ type: 'block', title: 'portfolio cat', content: [' /\\_/\\\\', '( o.o )', ' > ^ <', 'MEOW! purr-formance engineer reporting for duty.'] }];
      }

      const dirEntries = FILE_SYSTEM[state.currentDir] || [];
      const hasExact = dirEntries.includes(fileName) || fileName.includes('/');
      const targetPath = hasExact ? `${state.currentDir}/${fileName}`.replace(/\/+/g, '/') : `${state.currentDir}/${fileName}`.replace(/\/+/g, '/');
      const fileContent = FILE_CONTENTS[targetPath] || FILE_CONTENTS[`${ROOT_PATH}/${fileName}`];

      if (fileContent) {
        return [{ type: 'block', title: fileName, content: String(fileContent).split('\n') }];
      }

      return [{ type: 'text', value: `cat: ${fileName}: No such file.` }];
    }

    if (effectiveCommand === 'neofetch') {
      return [
        { type: 'block', title: 'Developer profile', content: [
          '╔══════════════════════════════╗',
          '║  .-._               _.-.   ║',
          '║ /     \\_.-._  _.-._./     \\ ║',
          '║ |  .-.  .-.||.-.  .-.  |  ║',
          '║ | |   ||   || |  ||   | |  ║',
          '║ | |   ||   || |  ||   | |  ║',
          "║ |  '-'  '-'  '-'  '-'  |  ║",
          '║ \\____/  /\\  \\____/  /\\  ║',
          '╚══════════════════════════════╝',
          `Name: ${PROFILE.name}`,
          `Title: ${PROFILE.title}`,
          'OS: Linux',
          'Shell: bash',
          'Kernel: 6.8.x',
          'Uptime: always learning',
        ] },
      ];
    }

    if (effectiveCommand === 'theme') {
      const selectedTheme = args[0] ? args[0].toLowerCase() : null;
      if (selectedTheme) {
        if (!THEME_OPTIONS.includes(selectedTheme)) {
          return [{ type: 'text', value: `Theme not found: ${selectedTheme}. Available themes: ${THEME_OPTIONS.join(', ')}` }];
        }

        applyTheme(selectedTheme);
        return [{ type: 'text', value: `Theme changed to ${selectedTheme}.` }];
      }

      const summary = getThemeSummary(state.currentTheme);
      return [
        { type: 'text', value: `Current theme: ${state.currentTheme}` },
        { type: 'text', value: `Available themes: ${THEME_OPTIONS.join(', ')}` },
        { type: 'text', value: 'Usage: theme <default|midnight|aurora>' },
        { type: 'block', title: 'Theme options', content: summary.map((option) => `${option.label}${option.active ? ' (active)' : ''}`) },
      ];
    }

    if (effectiveCommand === 'history') {
      const history = terminal.getHistory();
      if (history.length === 0) {
        return [{ type: 'text', value: 'No previous commands recorded.' }];
      }

      return [{ type: 'block', title: 'Command history', content: history.map((entry, index) => `${index + 1}. ${entry}`) }];
    }

    if (effectiveCommand === 'banner') {
      return [
        { type: 'block', title: 'Welcome banner', content: getAsciiBanner() },
        { type: 'text', value: 'Examples: help, about, projects, project example-rest-api' },
      ];
    }

    if (effectiveCommand === 'sudo') {
      const target = joinedArgs.trim().toLowerCase();

      if (target === 'hire-me') {
        return [
          { type: 'text', value: 'sudo: Permission denied. This portfolio is a browser experience, not a Linux shell.' },
          { type: 'text', value: 'But yes — I am interested in backend engineering opportunities and would love to connect.' },
        ];
      }

      if (target === 'rm -rf /' || target === 'rm -rf / --no-preserve-root') {
        return [
          { type: 'text', value: 'sudo: You are not root. The system has refused to delete the universe. Thank you for your cooperation.' },
        ];
      }

      return [{ type: 'text', value: 'sudo: command not found. Try "help" for available commands.' }];
    }

    if (effectiveCommand === 'copy') {
      const contactCard = [
        `Name: ${PROFILE.name}`,
        `Title: ${PROFILE.title}`,
        `Email: ${PROFILE.email}`,
        `GitHub: ${PROFILE.github}`,
        `LinkedIn: ${PROFILE.linkedin}`,
      ].join('\n');

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(contactCard);
          return [{ type: 'text', value: 'Contact details copied to the clipboard.' }];
        }

        return [{ type: 'text', value: 'Clipboard access is not available in this browser. Copy the details manually from the contact section.' }];
      } catch (error) {
        return [{ type: 'text', value: 'Clipboard access failed. Copy the contact details manually from the profile.' }];
      }
    }

    if (effectiveCommand === 'exit') {
      return [{ type: 'text', value: 'This portfolio is a browser-based experience, not an interactive shell. Thanks for visiting.' }];
    }

    if (effectiveCommand === 'meow') {
      return [{ type: 'block', title: 'portfolio cat', content: [' /\\_/\\\\', '( o.o )', ' > ^ <', 'MEOW! purr-formance engineer reporting for duty.'] }];
    }

    const suggestions = getSuggestions(commandName, getCommandList().map((item) => item.command.split(' ')[0]));
    const suggestionText = suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}?` : 'Use "help" to see the available commands.';
    return [
      { type: 'text', value: `Command not found: ${commandName}` },
      { type: 'text', value: suggestionText },
    ];
  },
});

state.currentTheme = getStoredTheme();
applyTheme(state.currentTheme);

function setTerminalOpen(isOpen) {
  if (!terminalModal) {
    return;
  }

  terminalModal.classList.toggle('is-open', isOpen);
  terminalBackdrop?.classList.toggle('is-open', isOpen);
  terminalModal.setAttribute('aria-hidden', String(!isOpen));
  terminalModal.inert = !isOpen;
  if (isOpen) {
    inputElement.focus();
  } else {
    document.querySelector('a[href="#terminal"]')?.focus();
  }
}

document.querySelector('a[href="#terminal"]')?.addEventListener('click', (event) => {
  event.preventDefault();
  setTerminalOpen(true);
});

skipBootButton.addEventListener('click', () => {
  outputElement.innerHTML = '';
  terminal.appendText('Boot sequence skipped. Terminal ready.', 'terminal-line muted');
  setTerminalOpen(true);
  inputElement.focus();
});

closeTerminalButton?.addEventListener('click', () => setTerminalOpen(false));
terminalBackdrop?.addEventListener('click', () => setTerminalOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && terminalModal?.classList.contains('is-open')) {
    setTerminalOpen(false);
  }
});

(async () => {
  state.projects = await fetchProjects();
  renderPortfolioSections();
  observeSections();
  terminal.setCommandList(getCommandList());
  showBootSequence();
})();
