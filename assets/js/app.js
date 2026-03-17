/* ===================================================================
   APP.JS — Multi-OS Portfolio for S. Prajwall Narayana
   =================================================================== */

(function() {
  'use strict';

  /* ================================================================
     STATE
  ================================================================ */
  let currentTheme = 'theme-macos';
  let topZ = 200;
  let isDragging = false;
  let dragWin = null, dragOX = 0, dragOY = 0;

  let maximizedWins = new Set();
  let musicPlaying = false;
  let musicCurrentSong = 0;
  let musicInterval = null;
  let musicProgress = 35;
  let calYear, calMonth;
  let calSidebarYear, calSidebarMonth;
  let calcState = { expr: '', result: '0', newInput: true, waitingOp: null };
  let currentWallpaper = 0;
  let terminalInitialized = false;

  /* ================================================================
     WALLPAPERS
  ================================================================ */
  const WALLPAPERS = [
    { name: 'macOS Sonoma',   bg: 'radial-gradient(ellipse at 30% 20%,#7c3aed 0%,#1e3a8a 40%,#0d1b4b 70%,#2563eb 100%)' },
    { name: 'macOS Monterey', bg: 'radial-gradient(ellipse at 70% 80%,#3b82f6 0%,#6d28d9 40%,#1e1b4b 100%)' },
    { name: 'Windows Bloom',  bg: 'radial-gradient(ellipse at 50% 60%,#6b21a8 0%,#1e40af 40%,#001f3f 100%)' },
    { name: 'Kali Dark',      bg: 'linear-gradient(160deg,#000000 0%,#0a0015 40%,#0d0028 100%)' },
    { name: 'Sunset',         bg: 'linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' },
    { name: 'Ocean',          bg: 'linear-gradient(160deg,#0f2027 0%,#203a43 50%,#2c5364 100%)' },
    { name: 'Forest',         bg: 'linear-gradient(160deg,#0a3d0a 0%,#1a5c1a 50%,#0d2e0d 100%)' },
    { name: 'Aurora',         bg: 'linear-gradient(160deg,#1a0533 0%,#006466 40%,#2d6a4f 70%,#7B2FBE 100%)' },
    { name: 'Cyberpunk',      bg: 'linear-gradient(160deg,#0d0221 0%,#1a0a2e 40%,#16213e 70%,#0f3460 100%)' },
    { name: 'Space',          bg: 'radial-gradient(ellipse at 20% 20%,#1a1a2e 0%,#0d0d0d 60%)' },
    { name: 'Dawn',           bg: 'linear-gradient(160deg,#ffecd2 0%,#fcb69f 40%,#c77dff 100%)' },
    { name: 'Minimal',        bg: '#0d0d0d' },
  ];

  /* ================================================================
     PORTFOLIO EVENTS (Calendar)
  ================================================================ */
  const PORTFOLIO_EVENTS = {
    '2025-01': [{ day: 15, text: 'Colligence Research internship started' }],
    '2024-06': [{ day: 1, text: 'RVCE Robotics & AI Research internship' }],
    '2024-01': [{ day: 15, text: 'EY India internship started' }],
    '2024-05': [{ day: 31, text: 'EY India internship ended' }],
    '2024-12': [{ day: 31, text: 'RVCE Research internship ended' }],
    '2025-03': [{ day: 10, text: 'IEEE paper submission' }],
    '2024-09': [{ day: 20, text: 'IEEE Robotics paper published' }],
    '2026-03': [{ day: 16, text: 'Portfolio v2.0 launched!' }],
    '2021-08': [{ day: 1, text: 'Started B.E. CS at RVCE' }],
    '2025-06': [{ day: 30, text: 'Expected B.E. graduation' }],
  };

  const MUSIC_SONGS = [
    { title: 'Claude Sonnet', artist: 'Anthropic', dur: '3:45' },
    { title: 'Claude Code', artist: 'Anthropic', dur: '4:12' },
    { title: 'OpenCode Flow', artist: 'OpenCode', dur: '3:28' },
    { title: 'Codex by OpenAI', artist: 'OpenAI', dur: '5:01' },
    { title: 'GPT-4o Groove', artist: 'OpenAI', dur: '4:33' },
    { title: 'Gemini Flash', artist: 'Google DeepMind', dur: '3:15' },
    { title: 'Llama 3 Flow', artist: 'Meta AI', dur: '4:22' },
    { title: 'Mistral Waves', artist: 'Mistral AI', dur: '3:58' },
    { title: 'Copilot Jazz', artist: 'Microsoft', dur: '4:45' },
    { title: 'Perplexity Quest', artist: 'Perplexity AI', dur: '4:30' },
    { title: 'Stable Diffusion', artist: 'Stability AI', dur: '4:10' },
    { title: 'Midjourney Dreams', artist: 'Midjourney', dur: '4:15' },
  ];

  /* ================================================================
     INIT
  ================================================================ */
  document.addEventListener('DOMContentLoaded', function() {
    detectAndSetTheme();
    buildWallpaperGrids();
    initClock();

    initDock();
    initWindows();
    initContextMenu();
    initSpotlight();
    initCalendar();
    initNotepad();
    initCalculator();

    loadDataFromJSON();

    // Load saved preferences
    const savedWallpaper = localStorage.getItem('portfolio-wallpaper');
    if (savedWallpaper !== null) applyWallpaper(parseInt(savedWallpaper));

    // Auto-open About Me
    setTimeout(() => openApp('finder'), 800);

    // Show welcome notification
    setTimeout(showNotification, 1500);
  });

  /* ================================================================
     OS DETECTION
  ================================================================ */
  function detectAndSetTheme() {
    setTheme('theme-macos', false);
  }

  window.setTheme = function(theme, save = true) {
    const themes = ['theme-macos', 'theme-windows', 'theme-kali', 'theme-ios', 'theme-android'];
    document.body.classList.remove(...themes);
    document.body.classList.add(theme);
    currentTheme = theme;

    if (save) localStorage.setItem('portfolio-theme', theme);

    // Update OS switcher active state
    document.querySelectorAll('.os-sw-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Update OS dropdown active state
    document.querySelectorAll('.os-dropdown-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Update OS name display
    const osNames = { 'theme-macos': 'macOS', 'theme-windows': 'Windows', 'theme-kali': 'Kali Linux', 'theme-ios': 'iOS', 'theme-android': 'Android' };
    const osNameEl = document.getElementById('currentOsName');
    if (osNameEl) osNameEl.textContent = osNames[theme] || 'macOS';

    // Close dropdown when theme changes
    hideOsDropdown();

    // Update terminal prompt if visible
    updateTerminalTheme();

    // Update title bar style
    updateWindowStyles();

    // Update menu bar / taskbar title clocks
    updateClockDisplays();

    // Adjust maximized windows
    maximizedWins.forEach(winId => {
      const el = document.getElementById(winId);
      if (el) applyMaximize(el, winId);
    });
  };

  function updateTerminalTheme() {
    const promptEl = document.getElementById('termPrompt');
    if (!promptEl) return;
    const theme = currentTheme;
    if (theme === 'theme-kali') {
      promptEl.style.whiteSpace = 'pre-line';
    }
  }

  /* ================================================================
     OS DROPDOWN
  ================================================================ */
  window.toggleOsMenu = function() {
    const dropdown = document.getElementById('osDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  };

  window.hideOsDropdown = function() {
    const dropdown = document.getElementById('osDropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  };

  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('osDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      if (!e.target.closest('.mb-os-selector') && !e.target.closest('.tb-os-selector') && !e.target.closest('.kp-os-selector') && !e.target.closest('#osDropdown')) {
        hideOsDropdown();
      }
    }
  });

  function updateWindowStyles() {
    // Nothing extra needed beyond CSS
  }

  /* ================================================================
     CLOCK
  ================================================================ */
  function initClock() {
    updateClockDisplays();
    setInterval(updateClockDisplays, 1000);
  }

  function updateClockDisplays() {
    const now = new Date();

    // Menu bar clock (macOS)
    const menuClock = document.getElementById('menuClock');
    if (menuClock) {
      const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
      menuClock.textContent = now.toLocaleString('en-US', opts);
    }

    // Windows clock
    const winTime = document.getElementById('winTime');
    const winDate = document.getElementById('winDate');
    if (winTime) winTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (winDate) winDate.textContent = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    // Kali clock
    const kaliClock = document.getElementById('kaliClock');
    if (kaliClock) {
      const opts = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      kaliClock.textContent = now.toLocaleString('en-US', opts).replace(',', '');
    }

    // iOS/Android clock
    const iClock = document.getElementById('iosClock');
    if (iClock) iClock.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
    const aClock = document.getElementById('androidTime');
    if (aClock) aClock.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  }

  /* ================================================================
     DOCK & APP ICONS
  ================================================================ */
  function initDock() {
    // macOS dock
    document.querySelectorAll('.dock-icon[data-app]').forEach(icon => {
      icon.addEventListener('click', () => {
        const app = icon.dataset.app;
        icon.classList.add('bouncing');
        setTimeout(() => icon.classList.remove('bouncing'), 500);
        openApp(app);
      });
    });

    // Windows taskbar
    document.querySelectorAll('.tb-icon[data-app]').forEach(icon => {
      icon.addEventListener('click', () => openApp(icon.dataset.app));
    });

    // Kali dock
    document.querySelectorAll('.kd-icon[data-app]').forEach(icon => {
      icon.addEventListener('click', () => openApp(icon.dataset.app));
    });

    // iOS app grid
    document.querySelectorAll('.ios-app[data-app]').forEach(icon => {
      icon.addEventListener('click', () => openApp(icon.dataset.app));
    });

    // Android app grid
    document.querySelectorAll('.and-app[data-app]').forEach(icon => {
      icon.addEventListener('click', () => openApp(icon.dataset.app));
    });
  }

  /* ================================================================
     OPEN APP
  ================================================================ */
  window.openApp = function(appName) {
    const winId = 'win-' + appName;
    const win = document.getElementById(winId);
    if (!win) return;

    // Special setup per app
    if (appName === 'terminal' && !terminalInitialized) {
      terminalInitialized = true;
      setTimeout(() => {
        if (typeof window.initTerminal === 'function') {
          window.initTerminal(win.querySelector('.win-body'));
        }
      }, 100);
    }

    if (appName === 'calendar') renderFullCalendar();
    if (appName === 'settings') initSettingsWallpaperGrid();

    if (win.classList.contains('visible') && !win.classList.contains('minimized')) {
      bringToFront(win);
      return;
    }

    win.classList.remove('minimized');
    win.classList.add('visible');

    // Position new window
    if (!win.style.left || win.style.left === '') {
      positionNewWindow(win);
    }

    win.style.zIndex = ++topZ;

    // Animation
    win.classList.remove('animating-in');
    void win.offsetWidth;
    win.classList.add('animating-in');
    setTimeout(() => win.classList.remove('animating-in'), 400);

    // Update dock dots
    updateDockDots(appName, true);

    // Update active app name
    const activeAppEl = document.getElementById('activeAppName');
    if (activeAppEl) {
      const names = { finder:'Finder', safari:'Safari', terminal:'Terminal', notes:'Notes', calendar:'Calendar', photos:'Photos', music:'Music', mail:'Mail', appstore:'App Store', settings:'System Preferences', osswitcher:'OS Switcher', preview:'Preview', github:'GitHub Stats' };
      activeAppEl.textContent = names[appName] || 'Finder';
    }
  };

  function positionNewWindow(win) {
    const theme = currentTheme;
    const sw = window.innerWidth, sh = window.innerHeight;
    const isMobile = sw <= 768;
    const isTablet = sw > 768 && sw <= 1024;

    // On mobile — CSS handles positioning via media queries, just clear inline styles
    if (isMobile) {
      win.style.left = '';
      win.style.top = '';
      win.style.width = '';
      win.style.height = '';
      return;
    }

    const topOff = theme === 'theme-macos' ? 28 : theme === 'theme-kali' ? 30 : 0;
    const botOff = theme === 'theme-windows' ? 48 : theme === 'theme-ios' ? 100 : theme === 'theme-android' ? 60 : 80;

    let ww, wh;
    if (isTablet) {
      ww = sw * 0.88;
      wh = sh * 0.76;
    } else {
      ww = Math.min(800, sw * 0.8);
      wh = Math.min(550, sh * 0.75);
    }

    const left = (sw - ww) / 2;
    const top = topOff + ((sh - topOff - botOff - wh) / 2);

    win.style.left = left + 'px';
    win.style.top = Math.max(topOff + 4, top) + 'px';
    win.style.width = ww + 'px';
    win.style.height = wh + 'px';

    // Per-app size overrides (desktop/tablet only)
    const sizeMap = {
      'win-music':      { w: 680, h: 420 },
      'win-osswitcher': { w: 400, h: 450 },
      'win-preview':    { w: 750, h: 850 },
      'win-github':     { w: 800, h: 600 },
    };
    const id = win.id;
    if (sizeMap[id]) {
      win.style.width  = Math.min(sizeMap[id].w, sw * 0.9) + 'px';
      win.style.height = Math.min(sizeMap[id].h, sh * 0.85) + 'px';
      win.style.left   = ((sw - parseInt(win.style.width)) / 2) + 'px';
      win.style.top    = Math.max(topOff + 4, (sh - parseInt(win.style.height)) / 2) + 'px';
    }
  }

  function updateDockDots(appName, active) {
    const winId = 'win-' + appName;
    document.querySelectorAll('.dock-icon').forEach(icon => {
      if (icon.dataset.app === appName) {
        const dot = icon.querySelector('.dock-dot');
        if (dot) dot.classList.toggle('hidden', !active);
      }
    });
  }

  /* ================================================================
     WINDOW MANAGEMENT
  ================================================================ */
  function initWindows() {
    document.querySelectorAll('.titlebar').forEach(tb => {
      const win = tb.closest('.win-window');
      if (!win) return;
      tb.addEventListener('mousedown', startDrag);
      tb.addEventListener('dblclick', () => toggleMax(win));
    });

    document.querySelectorAll('.win-window').forEach(win => {
      win.addEventListener('mousedown', () => bringToFront(win));
    });
  }

  function startDrag(e) {
    if (e.target.classList.contains('tl') || e.target.tagName === 'BUTTON') return;
    const win = e.currentTarget.closest('.win-window');
    if (!win || maximizedWins.has(win.id)) return;
    isDragging = true;
    dragWin = win;
    const rect = win.getBoundingClientRect();
    dragOX = e.clientX - rect.left;
    dragOY = e.clientY - rect.top;
    bringToFront(win);
    e.preventDefault();
  }

  document.addEventListener('mousemove', function(e) {
    if (isDragging && dragWin) {
      let x = e.clientX - dragOX;
      let y = e.clientY - dragOY;

      // Edge snapping
      const sw = window.innerWidth, sh = window.innerHeight;
      const theme = currentTheme;
      const topOff = theme === 'theme-macos' ? 28 : theme === 'theme-kali' ? 30 : 0;
      const botOff = theme === 'theme-windows' ? 48 : 0;
      const leftOff = theme === 'theme-kali' ? 52 : 0;

      if (x < leftOff + 20) x = leftOff;
      if (y < topOff + 20) y = topOff;
      if (x + dragWin.offsetWidth > sw - 20) x = sw - dragWin.offsetWidth;
      if (y + dragWin.offsetHeight > sh - botOff - 20) y = sh - botOff - dragWin.offsetHeight;

      dragWin.style.left = x + 'px';
      dragWin.style.top = y + 'px';
    }

  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
    dragWin = null;
  });

  function bringToFront(win) {
    win.style.zIndex = ++topZ;
  }

  window.closeWin = function(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('visible', 'maximized');
    win.style.left = '';
    win.style.top = '';
    win.style.width = '';
    win.style.height = '';
    maximizedWins.delete(winId);
    const appName = winId.replace('win-', '');
    updateDockDots(appName, false);
  };

  window.minWin = function(winId) {
    const win = document.getElementById(winId);
    if (win) {
      win.classList.add('minimized');
      win.classList.remove('visible');
    }
  };

  window.maxWin = function(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    toggleMax(win);
  };

  function toggleMax(win) {
    if (maximizedWins.has(win.id)) {
      win.classList.remove('maximized');
      maximizedWins.delete(win.id);
      // Restore
      positionNewWindow(win);
    } else {
      // Save current position
      win._savedLeft = win.style.left;
      win._savedTop = win.style.top;
      win._savedWidth = win.style.width;
      win._savedHeight = win.style.height;
      applyMaximize(win, win.id);
      maximizedWins.add(win.id);
    }
  }

  function applyMaximize(win, winId) {
    const theme = currentTheme;
    win.classList.add('maximized');
    const topOff = theme === 'theme-macos' ? 28 : theme === 'theme-kali' ? 30 : 0;
    const botOff = theme === 'theme-windows' ? 48 : theme === 'theme-macos' ? 80 : 0;
    const leftOff = theme === 'theme-kali' ? 52 : 0;

    win.style.left = leftOff + 'px';
    win.style.top = topOff + 'px';
    win.style.width = (window.innerWidth - leftOff) + 'px';
    win.style.height = (window.innerHeight - topOff - botOff) + 'px';
  }

  /* ================================================================
     CONTEXT MENU
  ================================================================ */
  function initContextMenu() {
    document.addEventListener('contextmenu', function(e) {
      // Only on desktop, not on windows
      if (e.target.closest('.win-window') || e.target.closest('#dock') || e.target.closest('#taskbar') || e.target.closest('#toppanel')) return;
      e.preventDefault();
      showCtx(e.clientX, e.clientY);
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('#contextMenu')) hideCtx();
    });
  }

  function showCtx(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'block';
    menu.style.left = Math.min(x, window.innerWidth - 240) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 300) + 'px';
  }

  window.hideCtx = function() {
    document.getElementById('contextMenu').style.display = 'none';
  };

  window.createDesktopFolder = function() {
    hideCtx();
    const folder = document.createElement('div');
    folder.style.cssText = 'position:absolute;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;z-index:50;';
    folder.innerHTML = '<div style="font-size:44px">📁</div><div style="font-size:11px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.8);background:rgba(0,0,0,.3);padding:1px 6px;border-radius:4px">New Folder</div>';
    folder.style.left = (120 + Math.random() * 200) + 'px';
    folder.style.top = (150 + Math.random() * 200) + 'px';

    let folderDrag = false, fx = 0, fy = 0;
    folder.addEventListener('mousedown', e => {
      folderDrag = true;
      fx = e.clientX - folder.offsetLeft;
      fy = e.clientY - folder.offsetTop;
      e.stopPropagation();
    });
    document.addEventListener('mousemove', e => {
      if (folderDrag) { folder.style.left = (e.clientX - fx) + 'px'; folder.style.top = (e.clientY - fy) + 'px'; }
    });
    document.addEventListener('mouseup', () => folderDrag = false);

    document.getElementById('desktop').appendChild(folder);
  };

  /* ================================================================
     WALLPAPER PICKER
  ================================================================ */
  function buildWallpaperGrids() {
    const grids = ['wallpaperGrid', 'settingsWallpaperGrid'];
    grids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      WALLPAPERS.forEach((wp, i) => {
        const div = document.createElement('div');
        div.className = 'wp-swatch' + (i === currentWallpaper ? ' active' : '');
        div.style.background = wp.bg;
        div.title = wp.name;
        div.addEventListener('click', () => { applyWallpaper(i); closeWallpaperPicker(); });
        el.appendChild(div);
      });
    });
  }

  function applyWallpaper(index) {
    currentWallpaper = index;
    const wp = WALLPAPERS[index];
    document.getElementById('desktop').style.background = wp.bg;
    document.querySelectorAll('.wp-swatch').forEach((s, i) => s.classList.toggle('active', i === index));
    localStorage.setItem('portfolio-wallpaper', index);
  }

  window.openWallpaperPicker = function() {
    hideCtx();
    document.getElementById('wallpaperPicker').classList.add('show');
  };

  window.closeWallpaperPicker = function() {
    document.getElementById('wallpaperPicker').classList.remove('show');
  };

  document.addEventListener('DOMContentLoaded', function() {
    const picker = document.getElementById('wallpaperPicker');
    if (picker) picker.addEventListener('click', e => { if (e.target === picker) closeWallpaperPicker(); });
  });

  /* ================================================================
     SPOTLIGHT
  ================================================================ */
  function initSpotlight() {
    const spotlightBtn = document.getElementById('spotlightBtn');
    if (spotlightBtn) spotlightBtn.addEventListener('click', () => toggleSpotlight());

    const input = document.getElementById('spotlightInput');
    if (input) input.addEventListener('input', updateSpotlightResults);

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') { e.preventDefault(); toggleSpotlight(); }
      if (e.key === 'Escape') closeSpotlight();
    });

    const overlay = document.getElementById('spotlight');
    if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeSpotlight(); });
  }

  function toggleSpotlight() {
    const overlay = document.getElementById('spotlight');
    if (!overlay) return;
    const isShown = overlay.classList.contains('show');
    if (isShown) closeSpotlight();
    else {
      overlay.classList.add('show');
      const inp = document.getElementById('spotlightInput');
      if (inp) setTimeout(() => inp.focus(), 100);
    }
  }

  function closeSpotlight() {
    const overlay = document.getElementById('spotlight');
    const inp = document.getElementById('spotlightInput');
    const res = document.getElementById('spotlightResults');
    if (overlay) overlay.classList.remove('show');
    if (inp) inp.value = '';
    if (res) res.innerHTML = '';
  }

  function updateSpotlightResults() {
    const inp = document.getElementById('spotlightInput');
    const resultsEl = document.getElementById('spotlightResults');
    if (!inp || !resultsEl) return;
    const q = inp.value.toLowerCase();
    if (!q) { resultsEl.innerHTML = ''; return; }

    const items = [
      { icon: 'fa-user', label: 'About Me', app: 'finder' },
      { icon: 'fa-globe', label: 'Projects Browser', app: 'safari' },
      { icon: 'fa-terminal', label: 'Terminal', app: 'terminal' },
      { icon: 'fa-file-lines', label: 'Experience & Education', app: 'notes' },
      { icon: 'fa-calendar', label: 'Calendar', app: 'calendar' },
      { icon: 'fa-trophy', label: 'Achievements', app: 'photos' },
      { icon: 'fa-music', label: 'Music Player', app: 'music' },
      { icon: 'fa-envelope', label: 'Contact / Mail', app: 'mail' },
      { icon: 'fa-bag-shopping', label: 'Tech Stack / App Store', app: 'appstore' },
      { icon: 'fa-gear', label: 'Settings', app: 'settings' },
      { icon: 'fab fa-github', label: 'GitHub Profile', url: 'https://github.com/developer1010x' },
      { icon: 'fab fa-linkedin', label: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/sprajwallnarayana' },
    ];

    const filtered = items.filter(item => item.label.toLowerCase().includes(q));
    resultsEl.innerHTML = filtered.slice(0, 6).map(item =>
      `<div class="spot-result" onclick="${item.app ? `openApp('${item.app}');closeSpotlight()` : `window.open('${item.url}','_blank');closeSpotlight()`}">
        <i class="fa ${item.icon}"></i> ${item.label}
      </div>`
    ).join('');
  }

  window.closeSpotlight = closeSpotlight;

  /* ================================================================
     NOTIFICATION
  ================================================================ */
  function showNotification() {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 4000);
  }

  /* ================================================================
     FINDER TABS
  ================================================================ */
  window.showFinderTab = function(tab) {
    document.querySelectorAll('#finderMain .finder-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById('finderAbout') || null;
    const tabMap = { about: 'finderAbout', skills: 'finderSkills', stats: 'finderStats' };
    const el = document.getElementById(tabMap[tab]);
    if (el) el.classList.add('active');

    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    event.currentTarget && event.currentTarget.classList.add('active');
  };

  /* ================================================================
     BROWSER
  ================================================================ */
  window.openProject = function(url, name, desc) {
    const home = document.getElementById('browserHome');
    const iframeWrap = document.getElementById('browserIframeWrap');
    const iframe = document.getElementById('browserIframe');
    const urlBar = document.getElementById('browserUrl');

    if (!home || !iframeWrap || !iframe) return;

    home.style.display = 'none';
    iframeWrap.style.display = 'flex';
    iframe.style.display = 'block';
    
    const errorEl = document.getElementById('browserError');
    if (errorEl) errorEl.style.display = 'none';

    // For GitHub repos, show a special card
    if (url.includes('github.com')) {
      const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (repoMatch) {
        iframe.style.display = 'none';
        if (errorEl) {
          errorEl.style.display = 'flex';
          errorEl.innerHTML = `
            <div style="text-align:center">
              <i class="fab fa-github" style="font-size:64px;color:#fff;margin-bottom:16px"></i>
              <h3 style="font-size:18px;margin-bottom:8px">${repoMatch[1]}/${repoMatch[2]}</h3>
              <p style="color:var(--text2);margin-bottom:16px">${desc || 'View this project on GitHub'}</p>
              <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                <button onclick="window.open('${url}','_blank')" style="padding:10px 20px;background:#238636;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-weight:500">
                  <i class="fab fa-github"></i> View Repository
                </button>
                <button onclick="window.open('${url}/archive/refs/heads/main.zip','_blank')" style="padding:10px 20px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;color:#fff;cursor:pointer;font-size:14px">
                  <i class="fa fa-download"></i> Download ZIP
                </button>
              </div>
            </div>
          `;
        }
        urlBar.value = url;
        return;
      }
    }

    // For IEEE, LinkedIn, and other non-embeddable sites
    if (url.includes('ieeexplore') || url.includes('linkedin') || url.includes('vercel.app')) {
      iframe.style.display = 'none';
      if (errorEl) {
        const icon = url.includes('ieeexplore') ? 'fa-book' : (url.includes('linkedin') ? 'fa-linkedin' : 'fa-globe');
        errorEl.style.display = 'flex';
        errorEl.innerHTML = `
          <div style="text-align:center">
            <i class="fa ${icon}" style="font-size:64px;color:var(--accent);margin-bottom:16px"></i>
            <h3 style="font-size:18px;margin-bottom:8px">${name || 'External Link'}</h3>
            <p style="color:var(--text2);margin-bottom:16px;max-width:300px">${desc || ''}</p>
            <button onclick="window.open('${url}','_blank')" style="padding:12px 24px;background:var(--accent);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-weight:500">
              <i class="fa fa-external-link"></i> Open in New Tab
            </button>
          </div>
        `;
      }
      urlBar.value = url;
      return;
    }

    // Try direct URL first
    urlBar.value = url;
    iframe.src = url;

    // Check if loaded after delay
    setTimeout(() => {
      try {
        // Try to access - will throw if blocked
        const test = iframe.contentWindow.location.href;
        if (test.includes('blocked') || test === 'about:blank') {
          throw new Error('Blocked');
        }
      } catch(e) {
        // Show fallback
        iframe.style.display = 'none';
        if (errorEl) {
          errorEl.style.display = 'flex';
          errorEl.innerHTML = `
            <div style="text-align:center">
              <i class="fa fa-globe" style="font-size:64px;color:var(--accent);margin-bottom:16px"></i>
              <h3 style="font-size:18px;margin-bottom:8px">${name || 'Website'}</h3>
              <p style="color:var(--text2);margin-bottom:16px">${desc || 'Click below to visit this website'}</p>
              <button onclick="window.open('${url}','_blank')" style="padding:12px 24px;background:var(--accent);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-weight:500">
                <i class="fa fa-external-link"></i> Open Website
              </button>
            </div>
          `;
        }
      }
    }, 3000);
  };

  window.browserNav = function(action) {
    const home = document.getElementById('browserHome');
    const iframeWrap = document.getElementById('browserIframeWrap');
    const iframe = document.getElementById('browserIframe');
    const urlBar = document.getElementById('browserUrl');

    if (action === 'home') {
      iframeWrap.style.display = 'none';
      home.style.display = 'block';
      urlBar.value = 'portfolio://projects';
    } else if (action === 'back') {
      try { iframe.contentWindow.history.back(); } catch(e) {}
    } else if (action === 'fwd') {
      try { iframe.contentWindow.history.forward(); } catch(e) {}
    } else if (action === 'refresh') {
      try { iframe.contentWindow.location.reload(); } catch(e) {}
    }
  };

  /* ================================================================
     NOTES / EXPERIENCE TABS
  ================================================================ */
  window.showNotesTab = function(tab) {
    document.querySelectorAll('.notes-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.notes-pane').forEach(p => p.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const el = document.getElementById('notes' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (el) el.classList.add('active');
  };

  /* ================================================================
     NOTEPAD PERSISTENCE
  ================================================================ */
  function initNotepad() {
    const ta = document.getElementById('notepadText');
    if (!ta) return;
    ta.value = localStorage.getItem('portfolio-notes') || '';
    ta.addEventListener('input', () => localStorage.setItem('portfolio-notes', ta.value));
  }

  /* ================================================================
     CALENDAR
  ================================================================ */
  function initCalendar() {
    const now = new Date();
    calSidebarYear = now.getFullYear();
    calSidebarMonth = now.getMonth();

    const calPrev = document.getElementById('calMainPrev');
    const calNext = document.getElementById('calMainNext');
    const calToday = document.getElementById('calTodayBtn');
    if (calPrev) calPrev.addEventListener('click', () => { calSidebarMonth--; if (calSidebarMonth < 0) { calSidebarMonth = 11; calSidebarYear--; } renderFullCalendar(); });
    if (calNext) calNext.addEventListener('click', () => { calSidebarMonth++; if (calSidebarMonth > 11) { calSidebarMonth = 0; calSidebarYear++; } renderFullCalendar(); });
    if (calToday) calToday.addEventListener('click', () => { const n = new Date(); calSidebarYear = n.getFullYear(); calSidebarMonth = n.getMonth(); renderFullCalendar(); });
  }

  function renderFullCalendar() {
    const now = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const y = calSidebarYear, m = calSidebarMonth;
    const title = `${months[m]} ${y}`;

    document.getElementById('calMainTitle').textContent = title;
    document.getElementById('calSidebarTitle').textContent = title;

    const first = new Date(y, m, 1).getDay();
    const last = new Date(y, m + 1, 0).getDate();
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const events = PORTFOLIO_EVENTS[monthKey] || [];

    let html = '';
    // Previous month padding
    const prevLast = new Date(y, m, 0).getDate();
    for (let i = 0; i < first; i++) {
      html += `<div class="cal-day other-month">${prevLast - first + i + 1}</div>`;
    }

    for (let d = 1; d <= last; d++) {
      const isToday = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
      const dayEvents = events.filter(e => e.day === d);
      const dots = dayEvents.map(() => '<div class="cal-event-dot"></div>').join('');
      html += `<div class="cal-day${isToday ? ' today' : ''}" onclick="showCalDayEvents(${d},${m},${y})">${d}${dots}</div>`;
    }

    // Fill remaining
    const total = first + last;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-day other-month">${i}</div>`;
    }

    document.getElementById('calGrid').innerHTML = html;

    // Sidebar mini cal
    renderSidebarMiniCal();
    renderCalEventsList(events, months[m]);
  }

  function renderSidebarMiniCal() {
    const el = document.getElementById('calSidebarMini');
    if (!el) return;
    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const now = new Date();
    const y = calSidebarYear, m = calSidebarMonth;
    const first = new Date(y, m, 1).getDay();
    const last = new Date(y, m + 1, 0).getDate();
    let html = '<div class="mini-cal-header">' + dayNames.map(d => `<div>${d}</div>`).join('') + '</div><div class="mini-cal-grid">';
    for (let i = 0; i < first; i++) html += '<div class="mini-day"></div>';
    for (let d = 1; d <= last; d++) {
      const isToday = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
      html += `<div class="mini-day${isToday ? ' today' : ''}">${d}</div>`;
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function renderCalEventsList(events, monthName) {
    const el = document.getElementById('calEventsList');
    if (!el) return;
    if (!events.length) { el.innerHTML = '<p style="font-size:11px;color:var(--text3)">No events this month</p>'; return; }
    let html = '<h4>Events</h4>';
    events.forEach(e => {
      html += `<div class="cal-event-item"><b>${monthName} ${e.day}</b><br>${e.text}</div>`;
    });
    el.innerHTML = html;
  }

  window.showCalDayEvents = function(d, m, y) {
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const events = (PORTFOLIO_EVENTS[monthKey] || []).filter(e => e.day === d);
    if (events.length) {
      alert(events.map(e => e.text).join('\n'));
    }
  };

  /* ================================================================
     CALCULATOR
  ================================================================ */
  function initCalculator() {
    // Keyboard support
    document.addEventListener('keydown', e => {
      const calcWin = document.getElementById('win-calculator');
      if (!calcWin || !calcWin.classList.contains('visible')) return;
      const key = e.key;
      if (/[0-9.]/.test(key)) calcFunc(key);
      else if (key === '+') calcFunc('+');
      else if (key === '-') calcFunc('−');
      else if (key === '*') calcFunc('×');
      else if (key === '/') { e.preventDefault(); calcFunc('÷'); }
      else if (key === '%') calcFunc('%');
      else if (key === 'Enter' || key === '=') calcFunc('=');
      else if (key === 'Backspace') { calcState.result = calcState.result.slice(0,-1) || '0'; updateCalcDisplay(); }
      else if (key === 'Escape') calcFunc('AC');
    });
  }

  window.calcFunc = function(btn) {
    const s = calcState;

    if (btn === 'AC') {
      s.expr = ''; s.result = '0'; s.newInput = true; s.waitingOp = null;
    } else if (btn === '±') {
      s.result = String(-parseFloat(s.result) || 0);
    } else if (btn === '%') {
      s.result = String(parseFloat(s.result) / 100);
    } else if (['÷','×','−','+'].includes(btn)) {
      s.expr = s.result + ' ' + btn + ' ';
      s.waitingOp = btn;
      s.prevVal = parseFloat(s.result);
      s.newInput = true;
    } else if (btn === '=') {
      if (s.waitingOp && s.prevVal !== undefined) {
        const cur = parseFloat(s.result);
        let res;
        switch(s.waitingOp) {
          case '+': res = s.prevVal + cur; break;
          case '−': res = s.prevVal - cur; break;
          case '×': res = s.prevVal * cur; break;
          case '÷': res = cur !== 0 ? s.prevVal / cur : 'Error'; break;
          default: res = cur;
        }
        s.expr = '';
        s.result = typeof res === 'number' ? String(Number(res.toFixed(10))) : res;
        s.waitingOp = null;
        s.prevVal = undefined;
        s.newInput = true;
      }
    } else if (btn === '.') {
      if (s.newInput) { s.result = '0.'; s.newInput = false; }
      else if (!s.result.includes('.')) s.result += '.';
    } else if (/[0-9]/.test(btn)) {
      if (s.newInput) { s.result = btn; s.newInput = false; }
      else { s.result = s.result === '0' ? btn : s.result + btn; }
    }

    updateCalcDisplay();
  };

  function updateCalcDisplay() {
    const s = calcState;
    const disp = document.getElementById('calcDisplay');
    const expr = document.getElementById('calcExpr');
    if (disp) {
      let display = s.result;
      if (display.length > 9) {
        const num = parseFloat(display);
        display = isNaN(num) ? display : num.toExponential(3);
      }
      disp.textContent = display;
    }
    if (expr) expr.textContent = s.expr;
  }

  /* ================================================================
     SETTINGS TABS
  ================================================================ */
  window.showSettings = function(tab) {
    document.querySelectorAll('.settings-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const el = document.getElementById('settings' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (el) el.classList.add('active');
  };

  function initSettingsWallpaperGrid() {
    const grid = document.getElementById('settingsWallpaperGrid');
    if (!grid || grid.children.length > 0) return;
    WALLPAPERS.forEach((wp, i) => {
      const div = document.createElement('div');
      div.className = 'wp-swatch' + (i === currentWallpaper ? ' active' : '');
      div.style.background = wp.bg;
      div.title = wp.name;
      div.style.height = '60px';
      div.addEventListener('click', () => applyWallpaper(i));
      grid.appendChild(div);
    });
  }

  /* ================================================================
     MUSIC PLAYER
  ================================================================ */
  window.selectSong = function(idx) {
    musicCurrentSong = idx;
    musicProgress = 0;
    const song = MUSIC_SONGS[idx];
    document.getElementById('musicTitle').textContent = song.title;
    document.getElementById('musicArtist').textContent = song.artist;
    document.getElementById('musicTotal').textContent = song.dur;
    document.getElementById('musicFill').style.width = '0%';
    document.getElementById('musicCurrent').textContent = '0:00';

    document.querySelectorAll('.music-song').forEach((s, i) => s.classList.toggle('active', i === idx));
  };

  window.musicControl = function(action) {
    const playBtn = document.getElementById('musicPlay');
    const fillEl = document.getElementById('musicFill');
    const curEl = document.getElementById('musicCurrent');

    if (action === 'play') {
      musicPlaying = !musicPlaying;
      playBtn.innerHTML = musicPlaying ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>';
      const art = document.querySelector('.music-art');
      if (art) art.style.animation = musicPlaying ? 'music-pulse 2s ease-in-out infinite' : 'none';

      if (musicPlaying) {
        musicInterval = setInterval(() => {
          musicProgress = Math.min(musicProgress + 0.3, 100);
          fillEl.style.width = musicProgress + '%';
          const totalSecs = parseDuration(MUSIC_SONGS[musicCurrentSong].dur);
          const curSecs = Math.floor(totalSecs * musicProgress / 100);
          curEl.textContent = formatDuration(curSecs);
          if (musicProgress >= 100) { musicControl('next'); }
        }, 500);
      } else {
        clearInterval(musicInterval);
      }
    } else if (action === 'next') {
      musicCurrentSong = (musicCurrentSong + 1) % MUSIC_SONGS.length;
      musicProgress = 0;
      selectSong(musicCurrentSong);
      if (musicPlaying) clearInterval(musicInterval);
      musicPlaying = false;
      musicControl('play');
    } else if (action === 'prev') {
      musicCurrentSong = (musicCurrentSong - 1 + MUSIC_SONGS.length) % MUSIC_SONGS.length;
      musicProgress = 0;
      selectSong(musicCurrentSong);
      if (musicPlaying) clearInterval(musicInterval);
      musicPlaying = false;
      musicControl('play');
    }
  };

  function parseDuration(dur) {
    const [m, s] = dur.split(':').map(Number);
    return m * 60 + s;
  }

  function formatDuration(secs) {
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  }

  /* ================================================================
     ANDROID NAVBAR
  ================================================================ */
  function initAndroidNavbar() {
    document.getElementById('andBack') && document.getElementById('andBack').addEventListener('click', () => {
      const wins = document.querySelectorAll('.win-window.visible');
      if (wins.length) closeWin(wins[wins.length - 1].id);
    });

    document.getElementById('andHome') && document.getElementById('andHome').addEventListener('click', () => {
      document.querySelectorAll('.win-window.visible').forEach(w => closeWin(w.id));
    });

    document.getElementById('andRecent') && document.getElementById('andRecent').addEventListener('click', () => {
      // Show mini previews — simple alert for now
      const open = [...document.querySelectorAll('.win-window.visible')].map(w => w.id.replace('win-', '')).join(', ');
      if (open) alert('Recent: ' + open);
    });
  }

  /* ================================================================
     KALI MATRIX RAIN
  ================================================================ */
  function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cols, drops;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / 14);
      drops = new Array(cols).fill(1);
    }

    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコABCDEF012345678';

    setInterval(() => {
      if (currentTheme !== 'theme-kali') return;
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = '13px Courier New';

      drops.forEach((y, i) => {
        const c = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(c, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 35);
  }

  /* ================================================================
     OS SWITCHER
  ================================================================ */
  function initOsSwitcher() {
    // Already handled via onclick in HTML, just ensure active state
    const saved = localStorage.getItem('portfolio-theme');
    if (saved) {
      document.querySelectorAll('.os-sw-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === saved);
      });
    }
  }

  /* ================================================================
     LOAD DATA FROM JSON
  ================================================================ */
  async function loadDataFromJSON() {
    try {
      const response = await fetch('assets/data.json');
      const data = await response.json();
      
      // Load personal info
      loadPersonalInfo(data);
      
      // Load projects
      loadProjects(data.projects);
      
      // Load work experience
      loadWorkExperience(data.experience);
      
      // Load education
      loadEducation(data.education);
      
      // Load experience (for index2)
      loadExperience(data.experience);
      
      // Load skills
      loadSkills(data.skills);
      
      // Load achievements
      loadAchievements(data.achievements);
      
      // Load tech stack
      loadTechStack(data.techStack);
      
      // Load stats
      loadStats(data.stats);
      
    } catch (error) {
      console.log('Using default static content');
    }
  }

  function loadPersonalInfo(data) {
    if (data.personal) {
      const nameEl = document.querySelector('.about-name');
      const titleEl = document.querySelector('.about-title');
      const locationEl = document.querySelector('.about-location');
      const emailLink = document.querySelector('.about-link[href^="mailto"]');
      const linkedinLink = document.querySelector('.about-link[href*="linkedin"]');
      const githubLink = document.querySelector('.about-link[href*="github"]');
      
      if (nameEl) nameEl.textContent = data.personal.name;
      if (titleEl) titleEl.textContent = data.personal.title;
      if (locationEl) locationEl.innerHTML = '<i class="fa fa-location-dot"></i> ' + data.personal.location;
      if (emailLink) emailLink.href = 'mailto:' + data.personal.email;
      if (linkedinLink) linkedinLink.href = data.personal.linkedin;
      if (githubLink) githubLink.href = data.personal.github;
    }
  }

  function loadProjects(projects) {
    const grid = document.querySelector('.projects-waterfall');
    if (!grid || !projects) return;

    // Sort by id descending (newest first)
    projects.sort((a, b) => b.id - a.id);

    grid.innerHTML = projects.map(project => {
      const tags = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
      const iconColor = project.color ? `color: ${project.color}` : '';
      const iconBg = project.color ? project.color + '22' : 'rgba(59,130,246,0.1)';

      return `
        <div class="project-waterfall-card">
          <div class="project-icon" style="background: ${iconBg}">
            <i class="fas ${project.icon}" style="${iconColor}"></i>
          </div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-subtitle">${project.subtitle || ''}</p>
          <p class="project-description">${project.description}</p>
          <div class="project-tags">${tags}</div>
          <div class="project-links">
            ${project.comingSoon ? '<span class="project-link" style="background: var(--bg-tertiary); color: var(--text-muted); opacity: 0.7;"><i class="fas fa-clock"></i> Coming Soon</span>' : ''}
            ${project.url && !project.comingSoon ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i> Code</a>` : ''}
            ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link demo"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
            ${project.publication ? `<a href="${project.publication}" target="_blank" rel="noopener noreferrer" class="project-link publication"><i class="fas fa-file-alt"></i> IEEE Paper</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function loadWorkExperience(experience) {
    const container = document.querySelector('#work-container');
    if (!container || !experience) return;
    
    const workExp = experience.filter(exp => exp.type === 'work');
    
    container.innerHTML = workExp.map(exp => {
      const tags = exp.tags ? exp.tags.map(tag => `<span style="color: #FF6F00; font-weight: bold;">${tag}</span>`).join(' ') : '';
      const currentBadge = exp.current ? '<span class="exp-badge">Currently Here</span>' : '';
      
      return `
        <div class="exp-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <h3 style="margin: 0; color: var(--text-primary); font-size: 18px;">${exp.title}</h3>
              <p style="margin: 4px 0; color: var(--accent); font-size: 14px;">${exp.company} • ${exp.location}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: var(--text-secondary); font-size: 12px;">${exp.date}</p>
              ${currentBadge}
            </div>
          </div>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 12px;">${exp.description}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">${tags}</div>
        </div>
      `;
    }).join('');
  }

  function loadEducation(education) {
    const container = document.querySelector('#education-container');
    if (!container || !education) return;
    
    container.innerHTML = education.map(edu => {
      const tags = edu.tags ? edu.tags.map(tag => `<span style="color: #FF6F00; font-weight: bold;">${tag}</span>`).join(' ') : '';
      
      return `
        <div class="edu-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px 0; color: var(--text-primary); font-size: 18px;">${edu.title}</h3>
          <p style="margin: 0 0 4px 0; color: var(--accent); font-size: 14px;">${edu.institution} • ${edu.location}</p>
          <p style="margin: 0 0 12px 0; color: var(--text-secondary); font-size: 12px;">${edu.date}</p>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 12px;">${edu.description}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">${tags}</div>
        </div>
      `;
    }).join('');
  }

  function loadExperience(experience) {
    const timeline = document.querySelector('#notesExperience .timeline');
    if (!timeline || !experience) return;
    
    timeline.innerHTML = experience.map(exp => `
      <div class="tl-item ${exp.current ? 'current' : ''}">
        <div class="tl-dot"></div>
        <div class="tl-content">
          <div class="tl-company">${exp.company}</div>
          <div class="tl-role">${exp.role}</div>
          <div class="tl-period">${exp.period} &bull; ${exp.location}</div>
          <ul class="tl-bullets">
            <li>${exp.description}</li>
          </ul>
        </div>
      </div>
    `).join('');
  }

  function loadSkills(skills) {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid || !skills) return;

    skillsGrid.innerHTML = skills.map(skillCat => `
      <div class="skill-category tilt-card glow-border">
        <h3><i class="fas ${skillCat.icon || 'fa-code'}"></i> ${skillCat.category}</h3>
        <div class="skill-tags">
          ${skillCat.items.map(item => `<span class="skill-tag" style="color: #FF6F00; font-weight: bold;">${item.name}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  function loadAchievements(achievements) {
    const grid = document.querySelector('.achievements-grid');
    if (!grid || !achievements) return;
    
    grid.innerHTML = achievements.map(ach => `
      <div class="achievement-card">
        <div class="ach-icon"><i class="fa ${ach.icon}" style="color:var(--accent)"></i></div>
        <div class="ach-year">${ach.year}</div>
        <h3>${ach.title}</h3>
        <p>${ach.description}</p>
      </div>
    `).join('');
  }

  function loadTechStack(techStack) {
    const list = document.querySelector('.appstore-list');
    if (!list || !techStack) return;
    
    const techColors = {
      'Python': '#3776AB', 'React': '#61DAFB', 'FastAPI': '#009688', 
      'Docker': '#2496ED', 'TensorFlow': '#FF6F00', 'PyTorch': '#EE4C2C',
      'Node.js': '#E34F26', 'TypeScript': '#3178C6', 'PostgreSQL': '#CC2927'
    };
    
    list.innerHTML = techStack.map(tech => {
      const color = techColors[tech] || '#6A1B9A';
      return `
        <div class="app-item">
          <div class="app-item-icon" style="background:linear-gradient(135deg,${color},${color}99)">
            <i class="fa fa-code" style="color:#fff;font-size:20px"></i>
          </div>
          <div class="app-item-info">
            <div class="app-item-name">${tech}</div>
            <div class="app-stars">★★★★★</div>
          </div>
          <span class="app-badge installed">Installed</span>
        </div>
      `;
    }).join('');
  }

  function loadStats(stats) {
    const grid = document.querySelector('.stats-grid');
    if (!grid || !stats) return;
    
    grid.innerHTML = stats.map(stat => `
      <div class="stat-card">
        <div class="stat-num">${stat.count}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  }

  /* ================================================================
     RESIZE HANDLER
  ================================================================ */
  window.addEventListener('resize', () => {
    // Re-position maximized windows
    maximizedWins.forEach(winId => {
      const win = document.getElementById(winId);
      if (win) applyMaximize(win, winId);
    });
  });


  /* ================================================================
     TOUCH SUPPORT (iOS / Android)
  ================================================================ */
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });

  let touchStartX = 0, touchStartY = 0;
  let touchWin = null, touchTB = false;

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    const tb = e.target.closest('.titlebar');
    if (tb) {
      touchWin = tb.closest('.win-window');
      touchTB = true;
    } else {
      touchTB = false;
    }
  }

  function handleTouchMove(e) {
    if (!touchTB || !touchWin || maximizedWins.has(touchWin.id)) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const rect = touchWin.getBoundingClientRect();
    touchWin.style.left = (rect.left + dx) + 'px';
    touchWin.style.top = (rect.top + dy) + 'px';
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    e.preventDefault();
  }

  function handleTouchEnd() {
    touchTB = false;
    touchWin = null;
  }

  /* ================================================================
     LONG PRESS (iOS wiggle mode)
  ================================================================ */
  let longPressTimer = null;
  let wiggleMode = false;

  document.addEventListener('touchstart', e => {
    const iosGrid = e.target.closest('#ios-appgrid');
    if (!iosGrid) return;
    longPressTimer = setTimeout(() => {
      wiggleMode = !wiggleMode;
      document.querySelectorAll('.ios-app').forEach(app => {
        app.classList.toggle('wiggling', wiggleMode);
      });
    }, 600);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
  });

  /* ================================================================
     WINDOW CLOSE ON CLICK OUTSIDE (mobile)
  ================================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    // Ensure all traffic light buttons work
    document.querySelectorAll('.tl').forEach(tl => {
      tl.addEventListener('click', e => e.stopPropagation());
    });
  });

})();
