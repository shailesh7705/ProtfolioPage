// ============================================================================
// SHAILESH KUMAAR — PORTFOLIO ENGINE
// Top 1% Developer Architecture · Command Palette · Terminal · 3D Canvas
// Zero Dependencies (Pure Vanilla JS + Three.js for Hero)
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & STATE
  // ==========================================================================
  const CONFIG = {
    email: 'shaileshkumaar4455@gmail.com',
    typingStrings: [
      'Computer Science Engineer @ Sathyabama (CGPA 8.11)',
      '427 LeetCode Solved (277 Easy · 138 Med · 12 Hard)',
      'Full-Stack Developer (PHP & MySQL)',
      'Final Year Project: Smart Waste Assistant',
    ],
    typingSpeed: 65,
    deletingSpeed: 35,
    pauseAfterType: 2000,
    pauseAfterDelete: 400,
  };

  const state = {
    isHeroVisible: true,
    isTabVisible: true,
    cmdPaletteOpen: false,
    terminalOpen: false,
    caseStudyOpen: false,
    commandHistory: [],
    historyIndex: -1,
  };

  // ==========================================================================
  // 2. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  function showToast(message, icon = '✓') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Copy Email Helper
  function copyEmailToClipboard() {
    navigator.clipboard.writeText(CONFIG.email).then(() => {
      showToast(`Email copied: ${CONFIG.email}`, '📋');
    }).catch(() => {
      showToast(CONFIG.email, '📋');
    });
  }

  // Bind all copy buttons
  document.querySelectorAll('.copy-email-btn, .copy-email-tile').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      copyEmailToClipboard();
    });
  });

  // ==========================================================================
  // 3. MOUSE-TRACKING SPOTLIGHT BORDERS
  // ==========================================================================
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
  initSpotlightCards();

  // ==========================================================================
  // 4. COMMAND PALETTE (CMD+K / CTRL+K)
  // ==========================================================================
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');
  const cmdItems = Array.from(cmdResults ? cmdResults.querySelectorAll('.cmd-item') : []);
  let selectedCmdIndex = 0;

  function openCommandPalette() {
    if (!cmdPalette) return;
    state.cmdPaletteOpen = true;
    cmdPalette.classList.add('active');
    cmdPalette.setAttribute('aria-hidden', 'false');
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
    }
    filterCmdItems('');
  }

  function closeCommandPalette() {
    if (!cmdPalette) return;
    state.cmdPaletteOpen = false;
    cmdPalette.classList.remove('active');
    cmdPalette.setAttribute('aria-hidden', 'true');
  }

  function filterCmdItems(query) {
    const q = query.toLowerCase().trim();
    let visibleCount = 0;

    cmdItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Update selection to first visible
    const visibleItems = cmdItems.filter(item => item.style.display !== 'none');
    selectedCmdIndex = 0;
    visibleItems.forEach((item, idx) => {
      if (idx === selectedCmdIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function executeCmdItem(item) {
    if (!item) return;
    const action = item.dataset.action;

    closeCommandPalette();

    if (action === 'navigate') {
      const target = document.querySelector(item.dataset.target);
      if (target) {
        const top = target.offsetTop - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else if (action === 'copy-email') {
      copyEmailToClipboard();
    } else if (action === 'download-resume') {
      window.location.href = 'resume.pdf';
      showToast('Downloading resume.pdf...', '📄');
    } else if (action === 'open-terminal') {
      openTerminal();
    } else if (action === 'run-sandbox') {
      const p = document.getElementById('projects');
      if (p) window.scrollTo({ top: p.offsetTop - 70, behavior: 'smooth' });
      triggerSampleClassification('plastic');
    } else if (action === 'external') {
      window.open(item.dataset.url, '_blank', 'noopener,noreferrer');
    }
  }

  // Keyboard navigation inside Command Palette
  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      filterCmdItems(e.target.value);
    });

    cmdInput.addEventListener('keydown', (e) => {
      const visibleItems = cmdItems.filter(item => item.style.display !== 'none');
      if (!visibleItems.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex + 1) % visibleItems.length;
        visibleItems.forEach((item, idx) => {
          item.classList.toggle('selected', idx === selectedCmdIndex);
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedCmdIndex = (selectedCmdIndex - 1 + visibleItems.length) % visibleItems.length;
        visibleItems.forEach((item, idx) => {
          item.classList.toggle('selected', idx === selectedCmdIndex);
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCmdItem(visibleItems[selectedCmdIndex]);
      }
    });
  }

  // Click handler on Command Items
  cmdItems.forEach(item => {
    item.addEventListener('click', () => executeCmdItem(item));
  });

  // Global Shortcut: Cmd+K or Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (state.cmdPaletteOpen) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    } else if (e.key === 'Escape') {
      if (state.cmdPaletteOpen) closeCommandPalette();
      if (state.terminalOpen) closeTerminal();
      if (state.caseStudyOpen) closeCaseStudy();
    }
  });

  // Trigger buttons
  document.getElementById('cmd-k-trigger')?.addEventListener('click', openCommandPalette);
  document.getElementById('cmd-close-btn')?.addEventListener('click', closeCommandPalette);
  cmdPalette?.addEventListener('click', (e) => {
    if (e.target === cmdPalette) closeCommandPalette();
  });

  // ==========================================================================
  // 5. INTERACTIVE DEVELOPER TERMINAL (CLI MODE)
  // ==========================================================================
  const terminalDrawer = document.getElementById('terminal-drawer');
  const terminalInput = document.getElementById('terminal-input');
  const terminalHistory = document.getElementById('terminal-history');
  const terminalCloseBtn = document.getElementById('terminal-close-btn');

  function openTerminal() {
    if (!terminalDrawer) return;
    state.terminalOpen = true;
    terminalDrawer.classList.add('active');
    terminalDrawer.setAttribute('aria-hidden', 'false');
    setTimeout(() => terminalInput?.focus(), 150);
  }

  function closeTerminal() {
    if (!terminalDrawer) return;
    state.terminalOpen = false;
    terminalDrawer.classList.remove('active');
    terminalDrawer.setAttribute('aria-hidden', 'true');
  }

  terminalCloseBtn?.addEventListener('click', closeTerminal);
  terminalDrawer?.addEventListener('click', (e) => {
    if (e.target === terminalDrawer) closeTerminal();
  });
  document.getElementById('terminal-trigger-btn')?.addEventListener('click', openTerminal);
  document.getElementById('hero-terminal-btn')?.addEventListener('click', openTerminal);
  document.querySelectorAll('.open-terminal-btn').forEach(btn => {
    btn.addEventListener('click', openTerminal);
  });

  // Terminal Chips Click Handler
  document.querySelectorAll('.terminal-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      if (cmd) {
        runTerminalCommand(cmd);
      }
    });
  });

  function logTerminal(input, outputHtml) {
    if (!terminalHistory) return;
    const log = document.createElement('div');
    log.className = 'terminal-command-log';
    log.innerHTML = `
      <div class="cmd-log-input"><span class="term-user">shailesh</span><span class="term-at">@</span><span class="term-host">portfolio</span>:<span class="term-path">~</span>$ ${escapeHtml(input)}</div>
      <div class="cmd-log-output">${outputHtml}</div>
    `;
    terminalHistory.appendChild(log);
    const body = document.getElementById('terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function runTerminalCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    state.commandHistory.push(trimmed);
    state.historyIndex = state.commandHistory.length;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    if (command === 'clear') {
      if (terminalHistory) terminalHistory.innerHTML = '';
      return;
    }

    let output = '';

    switch (command) {
      case 'help':
        output = `
Available System Commands:
  <span class="term-hl">bio</span>         &mdash; High-level professional background
  <span class="term-hl">skills</span>      &mdash; Core technical competencies & toolchain
  <span class="term-hl">projects</span>    &mdash; Summary of featured engineering projects
  <span class="term-hl">telemetry</span>   &mdash; 427 LeetCode problems breakdown
  <span class="term-hl">contact</span>     &mdash; Direct contact coordinates
  <span class="term-hl">sudo hire</span>   &mdash; Fast-track interview / hiring flow
  <span class="term-hl">clear</span>       &mdash; Clear terminal buffer
  <span class="term-hl">exit</span>        &mdash; Close this terminal session
        `.trim();
        break;

      case 'bio':
        output = `
Shailesh Kumaar &bull; Computer Science Engineer
Education: B.E. Computer Science, Sathyabama IST (2022-2026, CGPA 8.11)
Focus: Full-Stack Web Development, Software Engineering & Algorithmic Problem Solving.
LeetCode: 427 solved problems (277 Easy, 138 Medium, 12 Hard).
Final Year Project: Smart Waste Segregation Assistant (MobileNetV2 on Raspberry Pi).
        `.trim();
        break;

      case 'skills':
        output = `
Technical Competencies:
  &bull; Languages: Python, Java, JavaScript (ES6+), SQL, C/C++
  &bull; Machine Learning & Vision: MobileNetV2, OpenCV, Raspberry Pi
  &bull; Full-Stack: PHP, MySQL (Normalized schemas), REST APIs, React, CSS Grid
  &bull; Tools: Linux/Bash, Git, GitHub Actions, Vercel, VS Code
        `.trim();
        break;

      case 'projects':
        output = `
Featured Projects:
  1. <span class="term-hl">Smart Waste Segregation Assistant (Final Year Project)</span> &mdash; MobileNetV2 on Raspberry Pi with audio guidance
  2. <span class="term-hl">Tourism Management Portal</span> &mdash; Full-Stack PHP & MySQL web application
  3. <span class="term-hl">CGPA Calculator Engine</span> &mdash; Academic performance engine & task organizer
  4. <span class="term-hl">DSA Repository</span> &mdash; 427 LeetCode solutions (277 Easy, 138 Med, 12 Hard)
Type <span class="term-hl">contact</span> to get in touch.
        `.trim();
        break;

      case 'telemetry':
        output = `
Algorithmic Benchmark (LeetCode 427 Solved):
  [==============================] Easy:   277 problems (65%)
  [===============]               Medium: 138 problems (32%)
  [=]                             Hard:   12 problems (3%)
Total: 427 verified solutions.
        `.trim();
        break;

      case 'contact':
        output = `
Direct Channels:
  Email:    <a href="mailto:${CONFIG.email}" class="term-hl">${CONFIG.email}</a>
  LinkedIn: <a href="https://www.linkedin.com/in/shailesh-kumaar2707/" target="_blank" class="term-hl">linkedin.com/in/shailesh-kumaar2707</a>
  GitHub:   <a href="https://github.com/shailesh7705" target="_blank" class="term-hl">github.com/shailesh7705</a>
  LeetCode: <a href="https://leetcode.com/u/shailesh7705/" target="_blank" class="term-hl">leetcode.com/u/shailesh7705</a>
        `.trim();
        break;

      case 'sudo':
        if (arg === 'hire' || arg === 'hire shailesh') {
          output = `
🎉 <span class="term-hl">ACCESS GRANTED: CANDIDATE ACQUISITION PROTOCOL INITIATED!</span>
Thank you for recognizing top 1% engineering talent.
Initiating direct email link: <a href="mailto:${CONFIG.email}?subject=Interview%20Invitation%20-%20Shailesh%20Kumaar" class="term-hl">${CONFIG.email}</a>
Or call/schedule via LinkedIn: <a href="https://www.linkedin.com/in/shailesh-kumaar2707/" target="_blank" class="term-hl">LinkedIn Connection</a>
          `.trim();
          showToast('Sudo Hire unlocked! Direct channel ready.', '🚀');
        } else {
          output = `Permission denied: try 'sudo hire'`;
        }
        break;

      case 'exit':
        closeTerminal();
        return;

      default:
        output = `command not found: ${escapeHtml(command)}. Type <span class="term-hl">help</span> for commands.`;
    }

    logTerminal(trimmed, output);
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        runTerminalCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.historyIndex > 0) {
          state.historyIndex--;
          terminalInput.value = state.commandHistory[state.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex < state.commandHistory.length - 1) {
          state.historyIndex++;
          terminalInput.value = state.commandHistory[state.historyIndex] || '';
        } else {
          state.historyIndex = state.commandHistory.length;
          terminalInput.value = '';
        }
      }
    });
  }

  // ==========================================================================
  // 6. INTERACTIVE WASTE CLASSIFIER PREVIEW
  // ==========================================================================
  const sampleDatabase = {
    plastic: {
      title: 'Plastic Bottle',
      confidence: 95,
      cue: '"Please place in the Plastic bin"',
    },
    metal: {
      title: 'Metal Can',
      confidence: 96,
      cue: '"Please place in the Metal bin"',
    },
    paper: {
      title: 'Paper Cup',
      confidence: 92,
      cue: '"Please place in the Paper bin"',
    },
    organic: {
      title: 'Organic Waste',
      confidence: 94,
      cue: '"Please place in the Organic bin"',
    },
  };

  function triggerSampleClassification(sampleKey) {
    const data = sampleDatabase[sampleKey];
    if (!data) return;

    // Update active button
    document.querySelectorAll('.sample-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sample === sampleKey);
    });

    const classEl = document.getElementById('output-class');
    const barEl = document.getElementById('output-confidence-bar');
    const confEl = document.getElementById('output-confidence');
    const cueEl = document.getElementById('output-cue');

    if (classEl) classEl.textContent = data.title;
    if (barEl) barEl.style.width = data.confidence + '%';
    if (confEl) confEl.textContent = data.confidence + '%';
    if (cueEl) cueEl.textContent = data.cue;

    showToast(`Classified as: ${data.title}`, '♻️');
  }

  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.sample;
      if (s) triggerSampleClassification(s);
    });
  });

  // ==========================================================================
  // 7. CASE STUDY & ARCHITECTURE MODAL
  // ==========================================================================
  const caseStudyModal = document.getElementById('case-study-modal');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('case-study-close-btn');

  const caseStudiesData = {
    'waste-assistant': {
      tag: 'FINAL YEAR ACADEMIC PROJECT',
      title: 'Smart Waste Segregation Assistant',
      html: `
        <div class="cs-section">
          <h4 class="cs-section-title">Project Overview</h4>
          <p>
            Developed as my final year engineering project. The objective was to build an automated waste classification prototype to make sorting everyday waste convenient and accessible.
          </p>
        </div>

        <div class="cs-section">
          <h4 class="cs-section-title">How It Works</h4>
          <div class="cs-architecture-flow">
            <span class="flow-node">Camera Input</span>
            <span class="flow-arrow">&rarr;</span>
            <span class="flow-node">OpenCV Preprocessing</span>
            <span class="flow-arrow">&rarr;</span>
            <span class="flow-node active-node">MobileNetV2 Model</span>
            <span class="flow-arrow">&rarr;</span>
            <span class="flow-node">Audio Guidance Prompt</span>
          </div>
        </div>

        <div class="cs-section">
          <h4 class="cs-section-title">Key Components</h4>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li><strong>Model:</strong> Uses a lightweight MobileNetV2 architecture suited for running on compact hardware like the Raspberry Pi.</li>
            <li><strong>Categories:</strong> Trained to identify common waste items such as plastics, metals, paper, and organic waste.</li>
            <li><strong>Audio Output:</strong> Automatically plays a voice prompt guiding the user to the correct disposal bin upon classification.</li>
          </ul>
        </div>
      `,
    },
    'tourism-portal': {
      tag: 'FULL STACK ARCHITECTURE & SQL',
      title: 'Enterprise Tourism Management & Booking System',
      html: `
        <div class="cs-section">
          <h4 class="cs-section-title">Problem Statement</h4>
          <p>
            Tourism service operators struggle with fragmented booking databases, leading to double-booking anomalies, inconsistent customer records, and difficult package administration.
          </p>
        </div>

        <div class="cs-section">
          <h4 class="cs-section-title">Database & Application Design</h4>
          <div class="cs-architecture-flow">
            <span class="flow-node">Client (Responsive Web)</span>
            <span class="flow-arrow">&rarr;</span>
            <span class="flow-node">Role-Based Auth (PHP Session Guards)</span>
            <span class="flow-arrow">&rarr;</span>
            <span class="flow-node active-node">Transactional MySQL 3NF Schema</span>
            <span class="flow-arrow">&rarr;</span>
            <span class="flow-node">Automated Booking State Engine</span>
          </div>
        </div>

        <div class="cs-section">
          <h4 class="cs-section-title">Key Engineering Highlights</h4>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li><strong>ACID Transaction Compliance:</strong> Enforced atomic SQL transactions during seat reservation checkout, guaranteeing zero concurrency collisions.</li>
            <li><strong>Admin Command Center:</strong> Built modular dashboards allowing real-time package updates, price adjustments, and analytical user reports.</li>
            <li><strong>Security:</strong> Prepared statements across all database queries to prevent SQL injection and strict input sanitization against XSS.</li>
          </ul>
        </div>
      `,
    },
  };

  function openCaseStudy(projectId) {
    const data = caseStudiesData[projectId];
    if (!data || !caseStudyModal) return;

    state.caseStudyOpen = true;
    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.html;

    caseStudyModal.classList.add('active');
    caseStudyModal.setAttribute('aria-hidden', 'false');
  }

  function closeCaseStudy() {
    if (!caseStudyModal) return;
    state.caseStudyOpen = false;
    caseStudyModal.classList.remove('active');
    caseStudyModal.setAttribute('aria-hidden', 'true');
  }

  modalCloseBtn?.addEventListener('click', closeCaseStudy);
  caseStudyModal?.addEventListener('click', (e) => {
    if (e.target === caseStudyModal) closeCaseStudy();
  });

  document.querySelectorAll('.open-case-study-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.project;
      if (pid) openCaseStudy(pid);
    });
  });

  // ==========================================================================
  // 8. PROJECT CATEGORY FILTERING
  // ==========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ==========================================================================
  // 9. TYPING EFFECT
  // ==========================================================================
  function initTypingEffect() {
    const textSpan = document.querySelector('.hero-subtitle .typing-text');
    if (!textSpan) return;

    const strings = CONFIG.typingStrings;
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentString = strings[stringIndex];

      if (!isDeleting) {
        textSpan.textContent = currentString.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentString.length) {
          isDeleting = true;
          setTimeout(type, CONFIG.pauseAfterType);
          return;
        }
        setTimeout(type, CONFIG.typingSpeed);
      } else {
        textSpan.textContent = currentString.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          stringIndex = (stringIndex + 1) % strings.length;
          setTimeout(type, CONFIG.pauseAfterDelete);
          return;
        }
        setTimeout(type, CONFIG.deletingSpeed);
      }
    }

    type();
  }
  initTypingEffect();

  // ==========================================================================
  // 10. SCROLL PROGRESS BAR & NAVBAR ACTIVE STATE
  // ==========================================================================
  const progressBar = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  function updateScrollState() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = progress + '%';

    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Active Section Tracking
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const bottom = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  // Mobile menu toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    navLinksContainer?.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinksContainer?.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // ==========================================================================
  // 11. SCROLL REVEAL (INTERSECTION OBSERVER)
  // ==========================================================================
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }
  initScrollReveal();

  // ==========================================================================
  // 12. THREE.JS 3D CANVAS (HIGH-PERFORMANCE WITH OBSERVER PAUSE)
  // ==========================================================================
  let scene, camera, renderer, particleSystem, clock;
  let animFrameId = null;

  function initThreeCanvas() {
    const container = document.getElementById('hero-canvas');
    if (!container || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Create refined glowing starfield
    const particleCount = window.innerWidth < 768 ? 500 : 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color(0x00f5d4);
    const blue = new THREE.Color(0x00d4ff);
    const purple = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      const radius = 35 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const roll = Math.random();
      const col = roll < 0.4 ? cyan : (roll < 0.75 ? blue : purple);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    function renderLoop() {
      // Top 1% optimization: Pause GPU rendering when tab or hero is not visible
      if (!state.isHeroVisible || !state.isTabVisible) {
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      if (particleSystem) {
        particleSystem.rotation.y += 0.0003;
        particleSystem.rotation.x += 0.00015;
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    // Pause Three.js when hero is scrolled out of viewport
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroObserver = new IntersectionObserver((entries) => {
        state.isHeroVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    }

    // Handle Tab Visibility
    document.addEventListener('visibilitychange', () => {
      state.isTabVisible = !document.hidden;
      if (state.isTabVisible && clock) clock.getDelta();
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initThreeCanvas();
});
