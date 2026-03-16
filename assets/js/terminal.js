/* ===================================================================
   TERMINAL.JS — Full terminal emulator for S. Prajwall Narayana portfolio
   =================================================================== */

(function() {
  'use strict';

  /* ---- Virtual Filesystem ---- */
  const FS = {
    '~': { type: 'dir', children: ['Desktop', 'Documents', 'Downloads', 'Pictures', '.config'] },
    '~/Desktop': { type: 'dir', children: [] },
    '~/Documents': { type: 'dir', children: ['resume.pdf', 'projects'] },
    '~/Documents/resume.pdf': { type: 'file', content: 'Binary PDF file — open in browser to view.' },
    '~/Documents/projects': { type: 'dir', children: ['autonomous-system', 'arogya-sathi', 'knotescentral', 'deepfake-detection', 'mars-rover', 'plant-disease'] },
    '~/Documents/projects/autonomous-system': { type: 'dir', children: ['main.py', 'requirements.txt', 'README.md'] },
    '~/Documents/projects/autonomous-system/main.py': { type: 'file', content: '#!/usr/bin/env python3\n# Autonomous System — IEEE Published\nimport asyncio\nfrom fastapi import FastAPI\n\napp = FastAPI(title="Autonomous System")\n\n@app.get("/health")\nasync def health():\n    return {"status": "self-healing", "uptime": "99.9%"}' },
    '~/Documents/projects/autonomous-system/requirements.txt': { type: 'file', content: 'fastapi==0.115.0\nuvicorn==0.32.0\ntorch==2.5.0\nopencv-python==4.10.0\nnumpy==2.0.0' },
    '~/Documents/projects/autonomous-system/README.md': { type: 'file', content: '# Autonomous System\nIEEE-published autonomous robotic system with self-healing deployment loops.\n\n## Tech Stack\n- Python, FastAPI, PyTorch, ROS, YOLOv3\n\n## Status\n✓ Deployed  ✓ IEEE Published' },
    '~/Documents/projects/arogya-sathi': { type: 'dir', children: ['app.py', 'model.py'] },
    '~/Documents/projects/arogya-sathi/app.py': { type: 'file', content: '# Arogya-Sathi — AI Healthcare Assistant\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.post("/diagnose")\nasync def diagnose(symptoms: dict):\n    return {"diagnosis": "...", "confidence": 0.94}' },
    '~/Documents/projects/knotescentral': { type: 'dir', children: ['server.js', 'package.json'] },
    '~/Documents/projects/knotescentral/server.js': { type: 'file', content: 'const express = require("express");\nconst { createServer } = require("http");\nconst { Server } = require("socket.io");\n\nconst app = express();\nconst httpServer = createServer(app);\nconst io = new Server(httpServer);\n\nio.on("connection", (socket) => {\n  socket.on("note:update", (data) => {\n    socket.broadcast.emit("note:update", data);\n  });\n});\n\nhttpServer.listen(3000);' },
    '~/Documents/projects/deepfake-detection': { type: 'dir', children: ['detector.py', 'model.pth'] },
    '~/Documents/projects/deepfake-detection/detector.py': { type: 'file', content: '# Deepfake Detection CNN — 94% accuracy\nimport torch\nimport torch.nn as nn\n\nclass DeepfakeDetector(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.conv = nn.Sequential(\n            nn.Conv2d(3, 64, 3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool2d(2)\n        )\n        self.fc = nn.Linear(64 * 112 * 112, 2)\n\n    def forward(self, x):\n        return self.fc(self.conv(x).view(x.size(0), -1))' },
    '~/Documents/projects/mars-rover': { type: 'dir', children: ['rover.py'] },
    '~/Documents/projects/plant-disease': { type: 'dir', children: ['classify.py'] },
    '~/Downloads': { type: 'dir', children: [] },
    '~/Pictures': { type: 'dir', children: ['profile.jpg'] },
    '~/Pictures/profile.jpg': { type: 'file', content: 'Binary image file — S_Prajwall_Narayana.jpg' },
    '~/.config': { type: 'dir', children: ['portfolio.json'] },
    '~/.config/portfolio.json': { type: 'file', content: JSON.stringify({
      name: "S. Prajwall Narayana",
      email: "sprajwalln@gmail.com",
      github: "developer1010x",
      linkedin: "sprajwallnarayana",
      skills: ["Python", "FastAPI", "React", "Docker", "PyTorch", "TensorFlow"],
      ieee_papers: 2,
      projects: 5,
      internships: 3,
      location: "Bengaluru, Karnataka, India"
    }, null, 2) }
  };

  /* ---- Fake git log ---- */
  const GIT_LOG = [
    { hash: 'a3f9c12', msg: 'feat: add self-healing deployment loop mechanism' },
    { hash: 'b7e2d45', msg: 'fix: resolve race condition in multi-agent orchestration' },
    { hash: 'c1a8f67', msg: 'perf: optimize YOLOv3 inference pipeline by 40%' },
    { hash: 'd4b3e89', msg: 'feat: integrate FastAPI microservices with Redis cache' },
    { hash: 'e9c7f23', msg: 'docs: add IEEE paper methodology documentation' },
    { hash: 'f2d5a01', msg: 'test: add unit tests for healthcare AI diagnosis module' },
    { hash: 'g8e4b56', msg: 'refactor: modularize autonomous navigation algorithms' },
    { hash: 'h1c9d78', msg: 'feat: implement deepfake detection CNN with 94% accuracy' },
    { hash: 'i6f2e34', msg: 'deploy: containerize services with Docker Compose' },
    { hash: 'j3a7c90', msg: 'init: initial commit — portfolio v2.0' }
  ];

  /* ---- Process list ---- */
  const PS_LIST = [
    'prajwall    1    0.0  0.1   4196  3224 ?  Ss  portfolio',
    'prajwall  142    0.3  2.1  89320 43012 ?  Sl  python3 -m uvicorn app:main',
    'prajwall  143    0.1  0.8  32440 16240 ?  S   node server.js',
    'prajwall  201    0.0  0.1   6144  2048 ?  Ss  /usr/sbin/sshd -D',
    'prajwall  312    1.2  4.5 256124 92180 ?  Sl  python3 training.py',
    'prajwall  401    0.0  0.2  10240  4096 ?  S   redis-server',
    'prajwall  502    0.0  0.3  18432  6144 ?  Ss  postgres: main prajwall',
    'prajwall  601    0.2  1.2  48640 24576 ?  Sl  docker daemon',
  ];

  /* ---- Fortune quotes ---- */
  const FORTUNES = [
    '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
    '"The best way to predict the future is to implement it." — Alan Kay',
    '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
    '"First, solve the problem. Then, write the code." — John Johnson',
    '"An AI researcher without curiosity is like a ship without a compass." — Unknown',
    '"Talk is cheap. Show me the code." — Linus Torvalds',
    '"The only way to learn a new programming language is by writing programs in it." — Dennis Ritchie',
    '"Simplicity is the soul of efficiency." — Austin Freeman',
    '"In God we trust; all others bring data." — W. Edwards Deming',
    '"Machine learning is just statistics wearing a trench coat." — Unknown',
  ];

  /* ---- State ---- */
  let cwd = '~';
  let history = [];
  let historyIdx = -1;
  let outputEl, inputEl, promptEl, terminalEl;
  let isRunning = false;
  let replMode = null; // 'python' | 'node' | 'vim' | 'nano'
  let replHistory = [];
  let pageLoadTime = Date.now();
  let topInterval = null;
  let currentTheme = 'theme-macos';
  let pendingResolve = null;

  /* ================================================================
     INIT
  ================================================================ */
  function initTerminal(container) {
    terminalEl = container;
    outputEl = container.querySelector('#termOutput');
    inputEl = container.querySelector('#termInput');
    promptEl = container.querySelector('#termPrompt');

    if (!outputEl || !inputEl) return;

    updatePromptDisplay();
    printWelcome();

    inputEl.addEventListener('keydown', handleKey);
    container.addEventListener('click', () => inputEl.focus());
    inputEl.focus();
  }

  function getTheme() {
    return document.body.className || 'theme-macos';
  }

  function getPrompt(dir) {
    dir = dir || cwd;
    const theme = getTheme();
    const shortDir = dir.replace('~', '~');
    if (theme === 'theme-macos') return `prajwall@macbook-pro ${shortDir} % `;
    if (theme === 'theme-windows') return `PS C:\\Users\\prajwall\\${shortDir.replace('~/','').replace(/\//g,'\\')}> `;
    if (theme === 'theme-kali') return null; // multi-line
    return `$ `;
  }

  function updatePromptDisplay() {
    const theme = getTheme();
    if (theme === 'theme-kali') {
      const dir = cwd === '~' ? '~' : cwd;
      promptEl.innerHTML = '';
      const span1 = document.createElement('span');
      span1.style.cssText = 'color:#00ff41;display:block';
      span1.textContent = `┌──(prajwall㉿kali)-[${dir}]`;
      const span2 = document.createElement('span');
      span2.style.cssText = 'color:#00ff41';
      span2.textContent = '└─$ ';
      promptEl.appendChild(span1);
      promptEl.appendChild(span2);
    } else {
      promptEl.textContent = getPrompt();
    }
  }

  function printWelcome() {
    const theme = getTheme();
    if (theme === 'theme-kali') {
      print(`<span style="color:#00ff41">
  ██╗  ██╗ █████╗ ██╗     ██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
  ██║ ██╔╝██╔══██╗██║     ██║    ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝
  █████╔╝ ███████║██║     ██║    ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝
  ██╔═██╗ ██╔══██║██║     ██║    ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗
  ██║  ██╗██║  ██║███████╗██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝</span>`);
      print(`<span style="color:#7B2FBE">Kali Linux Terminal — S. Prajwall Narayana</span>`);
    } else if (theme === 'theme-windows') {
      print(`<span style="color:#60cdff">Windows PowerShell</span>`);
      print(`Copyright (C) Microsoft Corporation. All rights reserved.`);
      print(``);
      print(`Type <span style="color:#ffff00">help</span> for available commands.`);
    } else {
      print(`<span style="color:#00ff41">Portfolio Terminal v2.0</span> — <span style="color:#60cdff">S. Prajwall Narayana</span>`);
      print(`Type <span style="color:#FFD60A">help</span> for available commands.`);
    }
    print('');
  }

  /* ================================================================
     OUTPUT
  ================================================================ */
  function print(html, cls) {
    const div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function printPromptLine(cmd) {
    const theme = getTheme();
    let promptHtml;
    if (theme === 'theme-kali') {
      const dir = cwd === '~' ? '~' : cwd;
      promptHtml = `<span style="color:#00ff41">┌──(prajwall㉿kali)-[${dir}]</span>\n<span style="color:#00ff41">└─$ </span>${escHtml(cmd)}`;
    } else {
      promptHtml = `<span class="term-prompt-line">${escHtml(getPrompt())}</span>${escHtml(cmd)}`;
    }
    print(promptHtml);
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ================================================================
     KEY HANDLING
  ================================================================ */
  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputEl.value;
      inputEl.value = '';
      if (cmd.trim()) {
        history.unshift(cmd);
        historyIdx = -1;
      }
      if (replMode) {
        handleReplInput(cmd);
      } else {
        printPromptLine(cmd);
        execute(cmd.trim());
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        historyIdx++;
        inputEl.value = history[historyIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        inputEl.value = history[historyIdx] || '';
      } else {
        historyIdx = -1;
        inputEl.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      tabComplete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearTerm();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (topInterval) { clearInterval(topInterval); topInterval = null; }
      print('^C');
      inputEl.value = '';
    }
  }

  function tabComplete() {
    const val = inputEl.value;
    const parts = val.split(' ');
    const last = parts[parts.length - 1];

    if (parts.length === 1) {
      // complete command
      const cmds = ['ls','cd','pwd','mkdir','touch','rm','cat','cp','mv','find','tree','whoami',
        'uname','hostname','uptime','date','cal','id','env','history','ps','top','df','free','lscpu',
        'ping','curl','wget','ifconfig','ip','netstat','ssh','brew','apt','pip','npm','pacman',
        'git','python3','python','node','echo','printf','grep','wc','head','tail','sort','uniq',
        'awk','sed','sudo','neofetch','sl','matrix','fortune','cowsay','banner','lolcat','htop',
        'vim','nano','clear','exit','open','portfolio','skills','projects','experience','contact','help'];
      const matches = cmds.filter(c => c.startsWith(last));
      if (matches.length === 1) inputEl.value = matches[0];
      else if (matches.length > 1) { print(matches.join('  '), 'term-info'); }
    } else {
      // complete path
      const node = resolvePath(last);
      if (node && node.type === 'dir') {
        const matches = (node.children || []).filter(c => c.startsWith(last.split('/').pop()));
        if (matches.length === 1) {
          parts[parts.length - 1] = last.replace(/[^/]*$/, matches[0]);
          inputEl.value = parts.join(' ');
        }
      }
    }
  }

  /* ================================================================
     EXECUTE
  ================================================================ */
  function execute(rawCmd) {
    if (!rawCmd) return;

    // Handle pipes
    const pipeParts = rawCmd.split('|').map(s => s.trim());
    if (pipeParts.length > 1) {
      executePipe(pipeParts);
      return;
    }

    const parts = rawCmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const cmd = parts[0] ? parts[0].toLowerCase() : '';
    const args = parts.slice(1).map(a => a.replace(/^['"]|['"]$/g, ''));

    switch (cmd) {
      case 'ls': cmdLs(args); break;
      case 'cd': cmdCd(args); break;
      case 'pwd': print(resolveFull(cwd)); break;
      case 'mkdir': cmdMkdir(args); break;
      case 'touch': cmdTouch(args); break;
      case 'rm': cmdRm(args); break;
      case 'cat': cmdCat(args); break;
      case 'cp': cmdCp(args); break;
      case 'mv': cmdMv(args); break;
      case 'find': cmdFind(args); break;
      case 'tree': cmdTree(); break;
      case 'whoami': print('prajwall'); break;
      case 'uname': cmdUname(args); break;
      case 'hostname': print('prajwall-portfolio'); break;
      case 'uptime': cmdUptime(); break;
      case 'date': print(new Date().toString()); break;
      case 'cal': cmdCal(); break;
      case 'id': print('uid=1000(prajwall) gid=1000(prajwall) groups=1000(prajwall),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)'); break;
      case 'env': cmdEnv(); break;
      case 'history': cmdHistory(); break;
      case 'ps': cmdPs(args); break;
      case 'top': cmdTop(); break;
      case 'df': cmdDf(args); break;
      case 'free': cmdFree(args); break;
      case 'lscpu': cmdLscpu(); break;
      case 'ping': cmdPing(args); break;
      case 'curl': cmdCurl(args); break;
      case 'wget': cmdWget(args); break;
      case 'ifconfig': case 'ip': cmdIfconfig(args); break;
      case 'netstat': cmdNetstat(); break;
      case 'ssh': print('<span class="term-error">ssh: Permission denied (publickey).</span>'); break;
      case 'brew': cmdBrew(args); break;
      case 'apt': case 'apt-get': cmdApt(args); break;
      case 'pip': case 'pip3': cmdPip(args); break;
      case 'npm': cmdNpm(args); break;
      case 'pacman': cmdPacman(args); break;
      case 'git': cmdGit(args); break;
      case 'python3': case 'python': enterPython(); break;
      case 'node': enterNode(); break;
      case 'echo': cmdEcho(args, rawCmd); break;
      case 'printf': print(args.join(' ')); break;
      case 'grep': cmdGrep(args); break;
      case 'wc': cmdWc(args); break;
      case 'head': cmdHead(args); break;
      case 'tail': cmdTail(args); break;
      case 'sort': print(args.join('\n').split('\n').sort().join('\n')); break;
      case 'uniq': print([...new Set(args.join('\n').split('\n'))].join('\n')); break;
      case 'awk': print('<span class="term-info">awk: use with piped input</span>'); break;
      case 'sed': print('<span class="term-info">sed: use with piped input</span>'); break;
      case 'sudo': cmdSudo(args); break;
      case 'neofetch': cmdNeofetch(); break;
      case 'sl': cmdSl(); break;
      case 'matrix': cmdMatrix(); break;
      case 'fortune': print(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]); break;
      case 'cowsay': cmdCowsay(args.join(' ')); break;
      case 'banner': cmdBanner(args.join(' ')); break;
      case 'lolcat': print(rainbow(args.join(' ') || 'Hello from the terminal!')); break;
      case 'htop': cmdHtop(); break;
      case 'vim': cmdVim(args); break;
      case 'nano': cmdNano(args); break;
      case 'clear': clearTerm(); break;
      case 'exit': closeTerminal(); break;
      case 'open': cmdOpen(args); break;
      case 'portfolio': cmdPortfolio(); break;
      case 'skills': cmdSkills(); break;
      case 'projects': cmdProjects(); break;
      case 'experience': cmdExperience(); break;
      case 'contact': cmdContact(); break;
      case 'help': cmdHelp(); break;
      case '': break;
      default:
        print(`<span class="term-error">command not found: ${escHtml(cmd)}</span>`);
        print(`Type <span class="term-info">help</span> for available commands.`);
    }
  }

  function executePipe(parts) {
    // Simple pipe: only support cmd | grep | sort | head/tail/wc/uniq
    const firstCmd = parts[0].split(/\s+/);
    let output = getPipeOutput(firstCmd[0], firstCmd.slice(1));

    for (let i = 1; i < parts.length; i++) {
      const pCmd = parts[i].split(/\s+/);
      output = applyPipeFilter(pCmd[0], pCmd.slice(1), output);
    }
    if (output) print(output.replace(/\n/g, '<br>'));
  }

  function getPipeOutput(cmd, args) {
    if (cmd === 'ls') return lsOutput(args);
    if (cmd === 'ps') return PS_LIST.join('\n');
    if (cmd === 'cat') {
      const f = resolvePathStr(args[0]);
      const node = FS[f];
      return node ? node.content || '' : '';
    }
    if (cmd === 'echo') return args.join(' ');
    if (cmd === 'history') return history.map((h, i) => `  ${i+1}  ${h}`).join('\n');
    return '';
  }

  function applyPipeFilter(cmd, args, input) {
    const lines = input.split('\n');
    if (cmd === 'grep') {
      const pat = args[0] || '';
      return lines.filter(l => l.includes(pat)).join('\n');
    }
    if (cmd === 'sort') return lines.sort().join('\n');
    if (cmd === 'uniq') return [...new Set(lines)].join('\n');
    if (cmd === 'head') { const n = parseInt(args[1]) || 10; return lines.slice(0, n).join('\n'); }
    if (cmd === 'tail') { const n = parseInt(args[1]) || 10; return lines.slice(-n).join('\n'); }
    if (cmd === 'wc') { return `  ${lines.length} lines  ${input.split(/\s+/).length} words  ${input.length} bytes`; }
    if (cmd === 'awk') {
      const field = parseInt((args[0] || '$1').replace('$', '')) - 1;
      return lines.map(l => l.split(/\s+/)[field] || '').join('\n');
    }
    if (cmd === 'sed') {
      const m = (args[0] || '').match(/^s\/(.+)\/(.*)\/g?$/);
      if (m) return lines.map(l => l.replace(new RegExp(m[1], 'g'), m[2])).join('\n');
    }
    if (cmd === 'lolcat') return rainbow(input);
    return input;
  }

  /* ================================================================
     FILESYSTEM HELPERS
  ================================================================ */
  function resolvePathStr(p) {
    if (!p) return cwd;
    if (p === '~') return '~';
    if (p.startsWith('~/')) return p;
    if (p.startsWith('/')) return '~' + p;
    if (p === '..') {
      const parts = cwd.split('/');
      parts.pop();
      return parts.join('/') || '~';
    }
    if (p.startsWith('../')) {
      const parts = cwd.split('/');
      parts.pop();
      const base = parts.join('/') || '~';
      return base + '/' + p.slice(3);
    }
    return cwd === '~' ? `~/${p}` : `${cwd}/${p}`;
  }

  function resolvePath(p) {
    const full = resolvePathStr(p);
    return FS[full];
  }

  function resolveFull(p) {
    return p.replace('~', '/home/prajwall');
  }

  function lsOutput(args) {
    const longFlag = args.includes('-la') || args.includes('-l') || args.includes('-al') || args.includes('-a');
    const allFlag = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const path = args.filter(a => !a.startsWith('-'))[0] || cwd;
    const full = resolvePathStr(path);
    const node = FS[full];

    if (!node) return `ls: cannot access '${path}': No such file or directory`;
    if (node.type === 'file') return path;

    let children = node.children || [];
    if (!allFlag) children = children.filter(c => !c.startsWith('.'));
    else children = ['.', '..', ...children];

    if (!longFlag) {
      return children.map(c => {
        const childPath = full + '/' + c;
        const childNode = FS[childPath];
        if (c === '.' || c === '..') return `<span style="color:#4A90E2">${c}</span>`;
        if (childNode && childNode.type === 'dir') return `<span style="color:#4A90E2">${c}/</span>`;
        if (c.startsWith('.')) return `<span style="color:#888">${c}</span>`;
        return c;
      }).join('  ');
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    let out = `total ${children.length * 4}\n`;
    children.forEach(c => {
      if (c === '.') { out += `drwxr-xr-x  2 prajwall prajwall 4096 ${dateStr} <span style="color:#4A90E2">.</span>\n`; return; }
      if (c === '..') { out += `drwxr-xr-x  2 prajwall prajwall 4096 ${dateStr} <span style="color:#4A90E2">..</span>\n`; return; }
      const childPath = full + '/' + c;
      const childNode = FS[childPath];
      if (childNode && childNode.type === 'dir') {
        out += `drwxr-xr-x  2 prajwall prajwall 4096 ${dateStr} <span style="color:#4A90E2">${c}</span>\n`;
      } else if (c.startsWith('.')) {
        out += `-rw-r--r--  1 prajwall prajwall  128 ${dateStr} <span style="color:#888">${c}</span>\n`;
      } else {
        const size = childNode && childNode.content ? childNode.content.length : 256;
        out += `-rw-r--r--  1 prajwall prajwall ${String(size).padStart(4)} ${dateStr} ${c}\n`;
      }
    });
    return out.trimEnd();
  }

  /* ================================================================
     COMMANDS
  ================================================================ */
  function cmdLs(args) {
    const out = lsOutput(args);
    print(out.replace(/\n/g, '<br>'));
  }

  function cmdCd(args) {
    const target = args[0] || '~';
    const full = resolvePathStr(target);
    const node = FS[full];
    if (!node) {
      print(`<span class="term-error">cd: ${target}: No such file or directory</span>`);
    } else if (node.type !== 'dir') {
      print(`<span class="term-error">cd: ${target}: Not a directory</span>`);
    } else {
      cwd = full;
      updatePromptDisplay();
    }
  }

  function cmdMkdir(args) {
    if (!args[0]) { print('<span class="term-error">mkdir: missing operand</span>'); return; }
    const full = resolvePathStr(args[0]);
    if (FS[full]) { print(`<span class="term-error">mkdir: cannot create directory '${args[0]}': File exists</span>`); return; }
    FS[full] = { type: 'dir', children: [] };
    const parent = FS[cwd];
    if (parent && parent.children) parent.children.push(args[0]);
  }

  function cmdTouch(args) {
    if (!args[0]) { print('<span class="term-error">touch: missing file operand</span>'); return; }
    const full = resolvePathStr(args[0]);
    if (!FS[full]) {
      FS[full] = { type: 'file', content: '' };
      const parent = FS[cwd];
      if (parent && parent.children) parent.children.push(args[0]);
    }
  }

  function cmdRm(args) {
    const flags = args.filter(a => a.startsWith('-'));
    const target = args.filter(a => !a.startsWith('-'))[0];
    if (!target) { print('<span class="term-error">rm: missing operand</span>'); return; }
    const full = resolvePathStr(target);
    if (!FS[full]) { print(`<span class="term-error">rm: cannot remove '${target}': No such file or directory</span>`); return; }
    if (FS[full].type === 'dir' && !flags.some(f => f.includes('r'))) {
      print(`<span class="term-error">rm: cannot remove '${target}': Is a directory</span>`);
      return;
    }
    delete FS[full];
    const parent = FS[cwd];
    if (parent && parent.children) parent.children = parent.children.filter(c => c !== target);
    print(`removed '${target}'`);
  }

  function cmdCat(args) {
    if (!args[0]) { print('<span class="term-error">cat: missing file operand</span>'); return; }
    const full = resolvePathStr(args[0]);
    const node = FS[full];
    if (!node) { print(`<span class="term-error">cat: ${args[0]}: No such file or directory</span>`); return; }
    if (node.type === 'dir') { print(`<span class="term-error">cat: ${args[0]}: Is a directory</span>`); return; }
    if (args[0].endsWith('.pdf') || args[0].endsWith('.jpg') || args[0].endsWith('.png') || args[0].endsWith('.pth')) {
      print(`<span class="term-info">(binary file: ${args[0]})</span>`);
      return;
    }
    print(escHtml(node.content || '').replace(/\n/g, '<br>'));
  }

  function cmdCp(args) {
    if (args.length < 2) { print('<span class="term-error">cp: missing destination operand</span>'); return; }
    const src = resolvePathStr(args[0]);
    const dst = resolvePathStr(args[1]);
    if (!FS[src]) { print(`<span class="term-error">cp: '${args[0]}': No such file or directory</span>`); return; }
    FS[dst] = JSON.parse(JSON.stringify(FS[src]));
    print(`'${args[0]}' -> '${args[1]}'`);
  }

  function cmdMv(args) {
    if (args.length < 2) { print('<span class="term-error">mv: missing destination operand</span>'); return; }
    const src = resolvePathStr(args[0]);
    const dst = resolvePathStr(args[1]);
    if (!FS[src]) { print(`<span class="term-error">mv: '${args[0]}': No such file or directory</span>`); return; }
    FS[dst] = FS[src];
    delete FS[src];
  }

  function cmdFind(args) {
    const pattern = args[args.indexOf('-name') + 1] || '';
    const clean = pattern.replace(/\*/g, '');
    const results = Object.keys(FS).filter(k => k.includes(clean));
    if (results.length) print(results.map(r => r.replace('~', '.')).join('\n').replace(/\n/g, '<br>'));
    else print(`find: no results for '${pattern}'`, 'term-error');
  }

  function cmdTree() {
    const lines = ['<span style="color:#4A90E2">~</span>'];
    const keys = Object.keys(FS).filter(k => k !== '~').sort();
    keys.forEach(k => {
      const depth = k.split('/').length - 1;
      const name = k.split('/').pop();
      const indent = '│   '.repeat(depth - 1) + '├── ';
      const node = FS[k];
      if (node.type === 'dir') lines.push(`${indent}<span style="color:#4A90E2">${name}/</span>`);
      else lines.push(`${indent}${name}`);
    });
    print(lines.join('\n').replace(/\n/g, '<br>'));
  }

  function cmdUname(args) {
    const theme = getTheme();
    if (theme === 'theme-macos') print('Darwin prajwall-macbook-pro.local 23.5.0 Darwin Kernel Version 23.5.0 x86_64');
    else if (theme === 'theme-windows') print('Linux prajwall-portfolio 5.15.0-WSL2 x86_64 GNU/Linux');
    else if (theme === 'theme-kali') print('Linux prajwall-kali 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 x86_64 GNU/Linux');
    else print('Linux prajwall-portfolio 6.8.0-generic x86_64 GNU/Linux');
  }

  function cmdUptime() {
    const elapsed = Math.floor((Date.now() - pageLoadTime) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    print(`up ${h}h ${m}m ${s}s,  1 user,  load average: 0.42, 0.38, 0.35`);
  }

  function cmdCal() {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let out = `<span style="color:#60cdff">    ${months[month]} ${year}</span>\n`;
    out += days.join(' ') + '\n';
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    let row = '   '.repeat(first);
    for (let i = 1; i <= last; i++) {
      if (i === d.getDate()) row += `<span style="background:#007AFF;color:#fff;border-radius:2px"> ${String(i).padStart(2)} </span>`;
      else row += String(i).padStart(3) + ' ';
      if ((first + i) % 7 === 0) { out += row + '\n'; row = ''; }
    }
    if (row) out += row;
    print(out.replace(/\n/g, '<br>'));
  }

  function cmdEnv() {
    const theme = getTheme();
    print([
      'HOME=/home/prajwall',
      'USER=prajwall',
      `SHELL=${theme === 'theme-windows' ? 'pwsh' : '/bin/zsh'}`,
      'EDITOR=vim',
      'LANG=en_US.UTF-8',
      'TERM=xterm-256color',
      'PWD=' + resolveFull(cwd),
      'PATH=/usr/local/bin:/usr/bin:/bin:/home/prajwall/.local/bin',
      'PYTHON_VERSION=3.12.0',
      'NODE_VERSION=22.0.0',
      'DOCKER_HOST=unix:///var/run/docker.sock',
      'PORTFOLIO=v2.0',
    ].join('\n').replace(/\n/g, '<br>'));
  }

  function cmdHistory() {
    if (!history.length) { print('no commands in history'); return; }
    print(history.slice().reverse().map((h, i) => `  ${String(i+1).padStart(4)}  ${escHtml(h)}`).join('\n').replace(/\n/g, '<br>'));
  }

  function cmdPs(args) {
    const header = '<span style="color:#60cdff">USER       PID  %CPU %MEM    VSZ   RSS TTY  STAT COMMAND</span>';
    print(header);
    PS_LIST.forEach(l => print(l));
  }

  function cmdTop() {
    print('<span style="color:#FFD60A">top — interactive view (press Ctrl+C to exit)</span>');
    let tick = 0;
    const draw = () => {
      const now = new Date();
      const elapsed = Math.floor((Date.now() - pageLoadTime) / 1000);
      const min = Math.floor(elapsed / 60), sec = elapsed % 60;
      const load = (0.3 + Math.random() * 0.4).toFixed(2);
      const cpu = (Math.random() * 5).toFixed(1);
      const rows = [
        `<span style="color:#00ff41">top - ${now.toTimeString().slice(0,8)} up ${min}m ${sec}s, 1 user, load avg: ${load}, 0.38, 0.35</span>`,
        `Tasks: <span style="color:#60cdff">9</span> total, <span style="color:#28C840">1</span> running, <span style="color:#60cdff">8</span> sleeping`,
        `%Cpu(s): <span style="color:#FF9F0A">${cpu}</span> us, 0.3 sy, 0.0 ni, ${(99 - parseFloat(cpu)).toFixed(1)} id`,
        `MiB Mem:  16384 total,  8192 free,  6144 used`,
        '',
        '<span style="color:#60cdff">  PID USER     PR  NI    VIRT    RES  SHR S %CPU %MEM     TIME+ COMMAND</span>',
        ...PS_LIST.slice(0, 6).map((l, i) => {
          const cpuVal = i === 0 ? load : (Math.random() * 2).toFixed(1);
          return `${String(i + 100).padStart(5)} prajwall 20   0 ${Math.floor(50000 + Math.random()*200000).toString().padStart(7)}K  S ${cpuVal.padStart(4)} 1.2   0:${String(Math.floor(Math.random()*59)).padStart(2,'0')}.${String(Math.floor(Math.random()*99)).padStart(2,'0')} ${l.split(' ').pop()}`;
        }),
      ];
      // Clear previous top lines and redraw
      const existing = outputEl.querySelectorAll('.top-line');
      existing.forEach(e => e.remove());
      rows.forEach(r => {
        const div = document.createElement('div');
        div.className = 'term-line top-line';
        div.innerHTML = r;
        outputEl.appendChild(div);
      });
      outputEl.scrollTop = outputEl.scrollHeight;
      tick++;
    };
    draw();
    topInterval = setInterval(draw, 2000);
  }

  function cmdDf(args) {
    print('<span style="color:#60cdff">Filesystem      Size  Used Avail Use% Mounted on</span>');
    print('/dev/sda1        500G   42G  458G   9% /');
    print('tmpfs             16G  1.2M   16G   1% /dev/shm');
    print('/dev/sdb1        200G  120G   80G  60% /home');
    print('overlay          500G   42G  458G   9% /var/lib/docker');
  }

  function cmdFree(args) {
    print('<span style="color:#60cdff">               total        used        free      shared  buff/cache   available</span>');
    print('Mem:           16384        6144        8192         512        2048        9728');
    print('Swap:           8192           0        8192');
  }

  function cmdLscpu() {
    print([
      'Architecture:          x86_64',
      'CPU op-mode(s):        32-bit, 64-bit',
      'Byte Order:            Little Endian',
      'CPU(s):                8',
      'Thread(s) per core:    2',
      'Core(s) per socket:    4',
      'Model name:            Intel(R) Core(TM) i7-12700K @ 3.60GHz',
      'CPU MHz:               3600.000',
      'CPU max MHz:           5000.0000',
      'L1d cache:             256 KiB',
      'L2 cache:              8 MiB',
      'L3 cache:              25 MiB',
    ].join('\n').replace(/\n/g, '<br>'));
  }

  function cmdPing(args) {
    const host = args[0] || 'localhost';
    print(`PING ${host}: 56 data bytes`);
    let count = 0;
    const iv = setInterval(() => {
      if (count >= 3) {
        clearInterval(iv);
        print(`--- ${host} ping statistics ---`);
        print(`3 packets transmitted, 3 received, 0% packet loss`);
        print(`round-trip min/avg/max/stddev = 8.2/9.1/11.3/0.9 ms`);
        return;
      }
      const rtt = (8 + Math.random() * 4).toFixed(3);
      print(`64 bytes from ${host}: icmp_seq=${count} ttl=64 time=${rtt} ms`);
      count++;
    }, 600);
  }

  function cmdCurl(args) {
    const url = args.filter(a => !a.startsWith('-'))[0] || '';
    if (url.includes('github.com/users/developer1010x')) {
      print(JSON.stringify({
        login: "developer1010x",
        id: 98765432,
        avatar_url: "https://avatars.githubusercontent.com/u/98765432",
        name: "S. Prajwall Narayana",
        blog: "portfolio.sprajwall.dev",
        location: "Bengaluru, Karnataka, India",
        email: "sprajwalln@gmail.com",
        bio: "AI Engineer & Full-Stack Developer | IEEE Author | RVCE",
        public_repos: 12,
        followers: 45,
        following: 32,
        created_at: "2021-08-15T00:00:00Z"
      }, null, 2).replace(/\n/g, '<br>'));
    } else if (url) {
      print(`<span class="term-info">curl: fetching ${url}...</span>`);
      setTimeout(() => { print(`<span class="term-error">curl: (6) Could not resolve host: ${url.split('/')[2] || url}</span>`); }, 500);
    } else {
      print('<span class="term-error">curl: no URL specified</span>');
    }
  }

  function cmdWget(args) {
    const url = args[0] || '';
    if (!url) { print('<span class="term-error">wget: missing URL</span>'); return; }
    const filename = url.split('/').pop() || 'index.html';
    print(`--${new Date().toISOString().slice(0,19)}--  ${url}`);
    print(`Resolving ${url.split('/')[2] || url}...`);
    setTimeout(() => {
      print('Connecting... connected.');
      const fakeSize = Math.floor(100 + Math.random() * 900);
      let pct = 0;
      const iv = setInterval(() => {
        pct = Math.min(pct + Math.floor(10 + Math.random() * 20), 100);
        const bar = '█'.repeat(Math.floor(pct / 5)) + ' '.repeat(20 - Math.floor(pct / 5));
        print(`${String(pct).padStart(3)}% [${bar}] ${Math.floor(fakeSize * pct / 100)}K`);
        if (pct >= 100) { clearInterval(iv); print(`\n'${filename}' saved [${fakeSize}K]`); }
      }, 200);
    }, 300);
  }

  function cmdIfconfig(args) {
    print([
      '<span style="color:#60cdff">eth0</span>: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500',
      '        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255',
      '        inet6 fe80::1  prefixlen 64  scopeid 0x20&lt;link&gt;',
      '        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)',
      '',
      '<span style="color:#60cdff">lo</span>: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536',
      '        inet 127.0.0.1  netmask 255.0.0.0',
      '        inet6 ::1  prefixlen 128  scopeid 0x10&lt;host&gt;',
    ].join('\n').replace(/\n/g, '<br>'));
  }

  function cmdNetstat() {
    print('<span style="color:#60cdff">Active Internet connections (only servers)</span>');
    print('<span style="color:#60cdff">Proto Recv-Q Send-Q Local Address           Foreign Address         State</span>');
    print('tcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN');
    print('tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN');
    print('tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN');
    print('tcp        0      0 0.0.0.0:6379            0.0.0.0:*               LISTEN');
  }

  function cmdBrew(args) {
    if (!args[0]) { print('brew <command>: install, update, upgrade, list, search'); return; }
    if (args[0] === 'install') {
      const pkg = args[1] || 'package';
      print(`==> Fetching ${pkg}`);
      print(`==> Downloading https://formulae.brew.sh/formula/${pkg}.rb`);
      let pct = 0;
      const iv = setInterval(() => {
        pct = Math.min(pct + Math.floor(15 + Math.random() * 25), 100);
        print(`######################################################################## ${pct}%`);
        if (pct >= 100) {
          clearInterval(iv);
          print(`==> Installing ${pkg}`);
          print(`==> <span style="color:#28C840">Successfully installed ${pkg}</span>`);
        }
      }, 300);
    } else {
      print(`brew: '${args[0]}' is not a brew command`);
    }
  }

  function cmdApt(args) {
    if (!args[0]) { print('Usage: apt [install|update|upgrade|list|search] ...'); return; }
    if (args[0] === 'install') {
      const pkg = args[1] || 'package';
      print(`Reading package lists... Done`);
      print(`Building dependency tree... Done`);
      print(`The following NEW packages will be installed:\n  ${pkg}`);
      print(`0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`);
      print(`Unpacking ${pkg} ...`);
      setTimeout(() => print(`<span class="term-success">Setting up ${pkg} ... done.</span>`), 600);
    } else if (args[0] === 'update') {
      print(`Hit:1 https://kali.download/kali kali-rolling InRelease`);
      print(`Reading package lists... Done`);
    } else {
      print(`apt: unrecognized command '${args[0]}'`);
    }
  }

  function cmdPip(args) {
    if (!args[0]) { print('Usage: pip install <package>'); return; }
    if (args[0] === 'install') {
      const pkg = args[1] || 'package';
      print(`Collecting ${pkg}`);
      print(`  Downloading ${pkg}-latest-py3-none-any.whl (2.3 MB)`);
      setTimeout(() => {
        print(`     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.3/2.3 MB 5.2 MB/s eta 0:00:00`);
        print(`Installing collected packages: ${pkg}`);
        print(`<span class="term-success">Successfully installed ${pkg}</span>`);
      }, 500);
    }
  }

  function cmdNpm(args) {
    if (!args[0]) { print('npm <command>: install, start, run, list'); return; }
    if (args[0] === 'install') {
      const pkg = args[1] || '';
      if (pkg) {
        print(`npm warn idealTree buildDeps`);
        print(`added 42 packages, and audited 43 packages in 3s`);
        print(`<span class="term-success">found 0 vulnerabilities</span>`);
      } else {
        print(`npm warn idealTree buildDeps`);
        print(`added 1247 packages, and audited 1248 packages in 18s`);
        print(`<span class="term-success">found 0 vulnerabilities</span>`);
      }
    }
  }

  function cmdPacman(args) {
    if (!args[0]) { print('Usage: pacman -S <package>'); return; }
    if (args[0] === '-S') {
      const pkg = args[1] || 'package';
      print(`resolving dependencies...`);
      print(`looking for conflicting packages...`);
      print(`Packages (1) ${pkg}-1.0.0\nTotal Download Size: 2.34 MiB`);
      setTimeout(() => {
        print(`:: Proceed with installation? [Y/n] Y`);
        print(`:: Retrieving packages...`);
        print(` ${pkg}  2.3 MiB  8.40 MiB/s 00:00`);
        print(`<span class="term-success">(1/1) installing ${pkg}</span>`);
      }, 400);
    }
  }

  function cmdGit(args) {
    const sub = args[0] || '';
    switch (sub) {
      case 'status':
        print(`On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n\t<span style="color:#FF3B30">modified:   app.js</span>\n\t<span style="color:#FF3B30">modified:   style.css</span>\n\nUntracked files:\n\t<span style="color:#FF3B30">temp.log</span>`.replace(/\n/g,'<br>'));
        break;
      case 'log':
        if (args.includes('--oneline')) {
          GIT_LOG.forEach(c => print(`<span style="color:#FFD60A">${c.hash}</span> ${c.msg}`));
        } else {
          GIT_LOG.slice(0,3).forEach(c => {
            print(`<span style="color:#FFD60A">commit ${c.hash}a8b9c0d1e2f3</span>`);
            print(`Author: S. Prajwall Narayana &lt;sprajwalln@gmail.com&gt;`);
            print(`Date:   ${new Date(Date.now() - Math.random()*7*86400000).toDateString()}`);
            print(`\n    ${c.msg}\n`);
          });
        }
        break;
      case 'diff':
        print(`<span style="color:#FF3B30">--- a/app.js</span>\n<span style="color:#28C840">+++ b/app.js</span>\n<span style="color:#60cdff">@@ -42,7 +42,8 @@ function openApp(name) {</span>\n<span style="color:#FF3B30">-  console.log('opening app');</span>\n<span style="color:#28C840">+  console.log('opening app:', name);</span>\n<span style="color:#28C840">+  animateOpen(name);</span>`.replace(/\n/g,'<br>'));
        break;
      case 'branch':
        print('* <span style="color:#28C840">main</span>\n  dev\n  feature/kali-theme'.replace(/\n/g,'<br>'));
        break;
      case 'add':
        print('Changes staged for commit.');
        break;
      case 'commit':
        const msg = args.join(' ').replace(/-m\s+/, '').replace(/["']/g, '');
        const hash = Math.random().toString(16).slice(2, 9);
        print(`[main ${hash}] ${msg || 'update'}\n 2 files changed, 42 insertions(+), 3 deletions(-)`.replace(/\n/g,'<br>'));
        break;
      case 'push':
        print('Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nCompressing objects: 100% (3/3), done.\nTo github.com:developer1010x/portfolio.git\n   a3f9c12..b7e2d45  main -> main'.replace(/\n/g,'<br>'));
        break;
      case 'pull':
        print('Already up to date.');
        break;
      case 'clone':
        print(`Cloning into '${(args[1] || 'repo').split('/').pop()}'...\nremote: Enumerating objects: 142, done.\nReceiving objects: 100% (142/142), 2.34 MiB, done.`.replace(/\n/g,'<br>'));
        break;
      case 'init':
        print(`Initialized empty Git repository in ${resolveFull(cwd)}/.git/`);
        break;
      default:
        print(`git: '${sub}' is not a git command. See 'git help'.`);
    }
  }

  /* ---- REPL modes ---- */
  function enterPython() {
    const ver = '3.12.0';
    print(`Python ${ver} (main, Jan  1 2025, 00:00:00) [GCC 13.2.0] on linux`);
    print(`Type "help", "copyright", "credits" or "license" for more information.`);
    replMode = 'python';
    promptEl.textContent = '>>> ';
    replHistory = [];
  }

  function enterNode() {
    print(`Welcome to Node.js v22.0.0.`);
    print(`Type ".help" for more information.`);
    replMode = 'node';
    promptEl.textContent = '> ';
  }

  function handleReplInput(cmd) {
    print(`<span style="color:${replMode === 'python' ? '#60cdff' : '#FFD60A'}">${replMode === 'python' ? '>>>' : '>'} </span>${escHtml(cmd)}`);

    if (replMode === 'python') {
      if (cmd === 'exit()' || cmd === 'quit()') {
        replMode = null;
        updatePromptDisplay();
        return;
      }
      try {
        const result = evalPython(cmd);
        if (result !== undefined && result !== '') print(escHtml(String(result)));
      } catch(e) {
        print(`<span class="term-error">${escHtml(e.message)}</span>`);
      }
    } else if (replMode === 'node') {
      if (cmd === '.exit') {
        replMode = null;
        updatePromptDisplay();
        return;
      }
      try {
        // eslint-disable-next-line no-eval
        const result = eval(cmd);
        if (result !== undefined) print(`<span style="color:#28C840">${escHtml(String(result))}</span>`);
      } catch(e) {
        print(`<span class="term-error">${escHtml(e.message)}</span>`);
      }
    }
  }

  function evalPython(code) {
    // Handle common Python patterns
    if (code.startsWith('print(') && code.endsWith(')')) {
      const inner = code.slice(6, -1).replace(/^["']|["']$/g, '');
      print(inner);
      return undefined;
    }
    if (code.startsWith('import ')) {
      return undefined; // silently import
    }
    if (code === 'os.getcwd()' || code.includes('getcwd()')) return resolveFull(cwd);
    if (code.includes('os.listdir()')) return "['Desktop', 'Documents', 'Downloads', 'Pictures', '.config']";
    // Basic math
    try {
      const result = Function('"use strict"; return (' + code.replace(/\*\*/g, '**') + ')')();
      return result;
    } catch(e) {
      throw new Error(`SyntaxError: invalid syntax`);
    }
  }

  /* ---- Special commands ---- */
  function cmdEcho(args, raw) {
    let text = args.join(' ');
    text = text.replace(/\$HOME/g, '/home/prajwall');
    text = text.replace(/\$USER/g, 'prajwall');
    text = text.replace(/\$PWD/g, resolveFull(cwd));
    text = text.replace(/\$SHELL/g, '/bin/zsh');
    text = text.replace(/\$PATH/g, '/usr/local/bin:/usr/bin:/bin');
    text = text.replace(/\$0/g, 'zsh');
    print(escHtml(text));
  }

  function cmdGrep(args) {
    const flags = args.filter(a => a.startsWith('-'));
    const nonFlags = args.filter(a => !a.startsWith('-'));
    const pattern = nonFlags[0] || '';
    const file = nonFlags[1];
    if (!file) { print('<span class="term-info">grep: piped input required or specify file</span>'); return; }
    const full = resolvePathStr(file);
    const node = FS[full];
    if (!node) { print(`<span class="term-error">grep: ${file}: No such file or directory</span>`); return; }
    const content = node.content || '';
    const lines = content.split('\n').filter(l => l.includes(pattern));
    if (lines.length) print(lines.map(l => l.replace(pattern, `<span style="color:#FF3B30">${pattern}</span>`)).join('\n').replace(/\n/g,'<br>'));
    else print(`grep: no match for '${pattern}'`, 'term-info');
  }

  function cmdWc(args) {
    const file = args.filter(a => !a.startsWith('-'))[0];
    if (!file) { print('<span class="term-error">wc: missing file</span>'); return; }
    const full = resolvePathStr(file);
    const node = FS[full];
    if (!node) { print(`<span class="term-error">wc: ${file}: No such file or directory</span>`); return; }
    const c = node.content || '';
    print(`  ${c.split('\n').length}  ${c.split(/\s+/).length}  ${c.length} ${file}`);
  }

  function cmdHead(args) {
    const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) : 10;
    const file = args.filter(a => !a.startsWith('-') && !/^\d+$/.test(a))[0];
    if (!file) { print('<span class="term-error">head: missing file</span>'); return; }
    const full = resolvePathStr(file);
    const node = FS[full];
    if (!node) { print(`<span class="term-error">head: ${file}: No such file or directory</span>`); return; }
    print(escHtml((node.content || '').split('\n').slice(0, n).join('\n')).replace(/\n/g,'<br>'));
  }

  function cmdTail(args) {
    const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) : 10;
    const file = args.filter(a => !a.startsWith('-') && !/^\d+$/.test(a))[0];
    if (!file) { print('<span class="term-error">tail: missing file</span>'); return; }
    const full = resolvePathStr(file);
    const node = FS[full];
    if (!node) { print(`<span class="term-error">tail: ${file}: No such file or directory</span>`); return; }
    const lines = (node.content || '').split('\n');
    print(escHtml(lines.slice(-n).join('\n')).replace(/\n/g,'<br>'));
  }

  function cmdSudo(args) {
    if (args[0] === 'su') {
      print('Nice try 😄');
    } else {
      print('prajwall is not in the sudoers file. This incident will be reported. 😄');
    }
  }

  function cmdNeofetch() {
    const theme = getTheme();
    let logo = '';
    if (theme === 'theme-macos') {
      logo = `<span style="color:#28C840">
              .:'
           ___ :'___.
       .'\`  .'\`     \`.'\`.
      :          .     :
      :                :
       \`.._            :
           \`\`:.________.'</span>`;
    } else if (theme === 'theme-kali') {
      logo = `<span style="color:#7B2FBE">
       .::::::::::.
     .::::::::::::::::
    ::::::  .:::::::::
   :::::   :  ::::::::
   :::::        ::::::
   ::::  .:  .   :::::
    :::::::    :::::::
     :::::::::::::::
       :::::::::::</span>`;
    } else if (theme === 'theme-windows') {
      logo = `<span style="color:#60cdff">
   ████████ ████████
   ████████ ████████

   ████████ ████████
   ████████ ████████</span>`;
    } else {
      logo = `<span style="color:#4CAF50">
      ___
     (.   \\
      \\  |  \\
       Y    \\
       |     \\
       |      \\
       --------</span>`;
    }

    const osName = {
      'theme-macos': 'macOS Sonoma 14.5',
      'theme-windows': 'Windows 11 23H2',
      'theme-kali': 'Kali Linux Rolling 2024.2',
      'theme-ios': 'iOS 17.5',
      'theme-android': 'Android 14',
    }[theme] || 'Portfolio OS';

    const elapsed = Math.floor((Date.now() - pageLoadTime) / 1000);
    const upStr = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed/60)}m ${elapsed%60}s`;

    print(logo);
    print(`<span style="color:#60cdff">prajwall</span>@<span style="color:#60cdff">portfolio</span>`);
    print(`──────────────────────────`);
    print(`<span style="color:#FF9F0A">OS:</span>       ${osName}`);
    print(`<span style="color:#FF9F0A">Host:</span>     Portfolio v2.0`);
    print(`<span style="color:#FF9F0A">Uptime:</span>   ${upStr}`);
    print(`<span style="color:#FF9F0A">Shell:</span>    ${theme === 'theme-windows' ? 'PowerShell 7.4' : 'zsh 5.9'}`);
    print(`<span style="color:#FF9F0A">Projects:</span> 5`);
    print(`<span style="color:#FF9F0A">Papers:</span>   2 IEEE`);
    print(`<span style="color:#FF9F0A">Skills:</span>   Python, FastAPI, React, Docker, PyTorch`);
    print(`<span style="color:#FF9F0A">Email:</span>    sprajwalln@gmail.com`);
    print(`<span style="color:#FF9F0A">GitHub:</span>   github.com/developer1010x`);
    print('');
    print(['<span style="color:#FF5F57;background:#FF5F57">   </span>',
      '<span style="color:#FEBC2E;background:#FEBC2E">   </span>',
      '<span style="color:#28C840;background:#28C840">   </span>',
      '<span style="color:#007AFF;background:#007AFF">   </span>',
      '<span style="color:#AF52DE;background:#AF52DE">   </span>',
      '<span style="color:#FF9F0A;background:#FF9F0A">   </span>'].join(''));
  }

  function cmdSl() {
    print('');
    const train = [
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|_________|',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|',
      '   /     |  |   H  |  |     |   |         ||_| |_||',
      '  |      |  |   H  |__--------------------|[ ] |  |',
      '  | ________|___H__/__|_____/[][]~\\_______|       |',
      '  |/ |   |-----------I_____I [][] []  D   |=======|',
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/",
      "  \\_/      \\O=====O=====O=====O_/      \\_/",
    ];
    train.forEach((line, i) => {
      setTimeout(() => print(`<span style="color:#FF9F0A;font-family:monospace">${escHtml(line)}</span>`), i * 80);
    });
  }

  function cmdMatrix() {
    print('<span style="color:#00ff41">Entering the Matrix... (5 seconds)</span>');
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOP0123456789';
    let elapsed = 0;
    const iv = setInterval(() => {
      if (elapsed >= 5000) { clearInterval(iv); print('<span style="color:#00ff41">Exiting Matrix.</span>'); return; }
      let line = '';
      for (let i = 0; i < 50; i++) {
        const c = chars[Math.floor(Math.random() * chars.length)];
        const op = (0.3 + Math.random() * 0.7).toFixed(1);
        line += `<span style="color:rgba(0,255,65,${op})">${c}</span>`;
      }
      print(line);
      elapsed += 100;
    }, 100);
  }

  function cmdCowsay(text) {
    if (!text) text = 'Moo! Type something after cowsay';
    const border = '-'.repeat(text.length + 2);
    print(`<pre style="font-family:monospace"> ${border}\n< ${text} >\n ${border}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||</pre>`);
  }

  function cmdBanner(text) {
    if (!text) { print('<span class="term-error">banner: no text provided</span>'); return; }
    // Simplified large text using block characters
    const big = text.toUpperCase().split('').map(c => {
      const map = {
        'A': ['███','█ █','███','█ █','█ █'],
        'B': ['██ ','█ █','██ ','█ █','██ '],
        'C': [' ██','█  ','█  ','█  ',' ██'],
        'D': ['██ ','█ █','█ █','█ █','██ '],
        'E': ['███','█  ','██ ','█  ','███'],
        'F': ['███','█  ','██ ','█  ','█  '],
        'G': [' ██','█  ','█ █','█ █',' ██'],
        'H': ['█ █','█ █','███','█ █','█ █'],
        'I': ['███',' █ ',' █ ',' █ ','███'],
        'J': ['███','  █','  █','█ █',' ██'],
        'K': ['█ █','█ █','██ ','█ █','█ █'],
        'L': ['█  ','█  ','█  ','█  ','███'],
        'M': ['█ █','███','█ █','█ █','█ █'],
        'N': ['█ █','██ █','█ █','█  █','█ █'],
        'O': [' █ ','█ █','█ █','█ █',' █ '],
        'P': ['██ ','█ █','██ ','█  ','█  '],
        'Q': [' █ ','█ █','█ █','█ ██',' ███'],
        'R': ['██ ','█ █','██ ','█ █','█ █'],
        'S': [' ██','█  ',' █ ','  █','██ '],
        'T': ['███',' █ ',' █ ',' █ ',' █ '],
        'U': ['█ █','█ █','█ █','█ █',' ██'],
        'V': ['█ █','█ █','█ █',' █ ',' █ '],
        'W': ['█ █','█ █','█ █','███',' █ '],
        'X': ['█ █',' █ ',' █ ',' █ ','█ █'],
        'Y': ['█ █',' █ ',' █ ',' █ ',' █ '],
        'Z': ['███','  █',' █ ','█  ','███'],
        ' ': ['   ','   ','   ','   ','   '],
        '!': [' █ ',' █ ',' █ ','   ',' █ '],
        '.': ['   ','   ','   ','   ',' █ '],
      };
      return map[c] || ['   ','   ','   ','   ','   '];
    });
    for (let row = 0; row < 5; row++) {
      print(`<span style="color:#00ff41;font-family:monospace">${big.map(ch => ch[row]).join(' ')}</span>`);
    }
  }

  function rainbow(text) {
    const colors = ['#FF3B30','#FF9F0A','#FFD60A','#30D158','#007AFF','#AF52DE'];
    return text.split('').map((c, i) => `<span style="color:${colors[i % colors.length]}">${escHtml(c)}</span>`).join('');
  }

  function cmdHtop() {
    print('<span style="color:#60cdff;font-family:monospace">  1[████████                    32%]  Tasks: 9, 1 running</span>');
    print('<span style="color:#60cdff;font-family:monospace">  2[████                        16%]  Load avg: 0.42 0.38 0.35</span>');
    print('<span style="color:#60cdff;font-family:monospace">  3[██                           8%]  Uptime: 0:05:42</span>');
    print('<span style="color:#60cdff;font-family:monospace">  4[██████                       24%]</span>');
    print('<span style="color:#60cdff;font-family:monospace">  Mem[|||||||||||||||        6.00G/16.0G]</span>');
    print('<span style="color:#60cdff;font-family:monospace">  Swp[                        0K/8.00G]</span>');
    print('');
    print('<span style="color:#60cdff">  PID  USER     PRI  NI  VIRT   RES S CPU% MEM%  TIME+   Command</span>');
    PS_LIST.slice(0,6).forEach((l, i) => {
      const cpu = (Math.random() * 5).toFixed(1);
      print(`  ${String(100+i*100).padStart(5)}  prajwall  20   0 ${Math.floor(30000+Math.random()*200000)}K S  ${cpu}  1.2  0:00.${String(Math.floor(Math.random()*99)).padStart(2,'0')}  ${l.split(' ').pop()}`);
    });
    print('<span style="color:#888">(Press Ctrl+C to exit htop)</span>');
  }

  function cmdVim(args) {
    const file = args[0] || 'unnamed';
    print(`<span style="color:#60cdff">"${file}"</span> [New File]`);
    print(`<span style="background:#00007f;color:#fff;padding:2px 4px">-- INSERT --</span> (press :q to exit)`);
    replMode = 'vim';
    promptEl.textContent = '';

    // Override handleReplInput for vim
    const oldHandler = inputEl.onkeydown;
    const vimHandler = (e) => {
      if (e.key === 'Escape') {
        promptEl.textContent = ':';
      } else if (e.key === 'Enter' && (inputEl.value === ':q' || inputEl.value === ':wq' || inputEl.value === ':q!' || inputEl.value === ':wq!')) {
        print(`:${inputEl.value} — exiting vim`);
        inputEl.value = '';
        replMode = null;
        promptEl.textContent = '';
        updatePromptDisplay();
        inputEl.removeEventListener('keydown', vimHandler);
        inputEl.addEventListener('keydown', handleKey);
      } else if (e.key === 'Enter') {
        print(escHtml(inputEl.value));
        inputEl.value = '';
      }
    };
    inputEl.removeEventListener('keydown', handleKey);
    inputEl.addEventListener('keydown', vimHandler);
    replMode = null; // Not a REPL mode, handled specially
  }

  function cmdNano(args) {
    const file = args[0] || 'unnamed';
    print(`<span style="background:#fff;color:#000;padding:2px 8px"> GNU nano 6.2           ${file}           Modified </span>`);
    print(`<span style="color:#888">Type your content below. Ctrl+X to exit.</span>`);
    print(`<span style="background:#007AFF;color:#fff;padding:1px 4px">^X</span> Exit  <span style="background:#007AFF;color:#fff;padding:1px 4px">^O</span> Write  <span style="background:#007AFF;color:#fff;padding:1px 4px">^R</span> Read File`);

    const nanoHandler = (e) => {
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        print('(exiting nano)');
        inputEl.value = '';
        replMode = null;
        updatePromptDisplay();
        inputEl.removeEventListener('keydown', nanoHandler);
        inputEl.addEventListener('keydown', handleKey);
      } else if (e.key === 'Enter') {
        print(escHtml(inputEl.value));
        inputEl.value = '';
      }
    };
    inputEl.removeEventListener('keydown', handleKey);
    inputEl.addEventListener('keydown', nanoHandler);
    replMode = null;
  }

  function clearTerm() {
    outputEl.innerHTML = '';
  }

  function closeTerminal() {
    if (typeof window.closeWin === 'function') window.closeWin('win-terminal');
  }

  function cmdOpen(args) {
    const appMap = {
      'finder': 'finder', 'about': 'finder',
      'safari': 'safari', 'browser': 'safari', 'projects': 'safari',
      'notes': 'notes', 'experience': 'notes',
      'calendar': 'calendar', 'cal': 'calendar',
      'calculator': 'calculator', 'calc': 'calculator',
      'photos': 'photos', 'achievements': 'photos',
      'music': 'music',
      'maps': 'maps',
      'mail': 'mail', 'contact': 'mail',
      'appstore': 'appstore', 'store': 'appstore',
      'settings': 'settings', 'prefs': 'settings',
    };
    const target = args[0] ? args[0].toLowerCase() : '';
    const app = appMap[target];
    if (app) {
      if (typeof window.openApp === 'function') window.openApp(app);
      print(`Opening ${target}...`);
    } else {
      print(`<span class="term-error">open: ${target}: application not found</span>`);
    }
  }

  function cmdPortfolio() {
    print(`<span style="color:#007AFF;font-family:monospace">
 ██████╗ ██████╗  █████╗      ██╗██╗    ██╗ █████╗ ██╗     ██╗
 ██╔══██╗██╔══██╗██╔══██╗     ██║██║    ██║██╔══██╗██║     ██║
 ██████╔╝██████╔╝███████║     ██║██║ █╗ ██║███████║██║     ██║
 ██╔═══╝ ██╔══██╗██╔══██║██   ██║██║███╗██║██╔══██║██║     ██║
 ██║     ██║  ██║██║  ██║╚█████╔╝╚███╔███╔╝██║  ██║███████╗███████╗
 ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝</span>`);
    print('');
    print(`<span style="color:#FF9F0A">S. Prajwall Narayana</span> — AI Engineer & Full-Stack Developer`);
    print(`Location:  Bengaluru, Karnataka, India`);
    print(`Email:     sprajwalln@gmail.com`);
    print(`GitHub:    github.com/developer1010x`);
    print(`LinkedIn:  linkedin.com/in/sprajwallnarayana`);
    print('');
    print(`<span style="color:#28C840">✓</span> 2 IEEE Papers Published`);
    print(`<span style="color:#28C840">✓</span> 5 Projects Deployed`);
    print(`<span style="color:#28C840">✓</span> 3 Internships Completed`);
  }

  function cmdSkills() {
    const skills = [
      ['Python',        95, '#3776AB'],
      ['React',         90, '#61DAFB'],
      ['FastAPI',       88, '#009688'],
      ['Docker',        90, '#2496ED'],
      ['PyTorch',       80, '#EE4C2C'],
      ['TensorFlow',    82, '#FF6F00'],
      ['Kubernetes',    78, '#326CE5'],
      ['PostgreSQL',    80, '#CC2927'],
      ['AWS',           75, '#FF9900'],
      ['TypeScript',    85, '#3178C6'],
    ];
    print('<span style="color:#60cdff;font-weight:bold">Skills (proficiency)</span>');
    print('');
    skills.forEach(([name, pct, color]) => {
      const filled = Math.floor(pct / 5);
      const bar = `<span style="color:${color}">${'█'.repeat(filled)}</span>${'░'.repeat(20 - filled)}`;
      print(`<span style="display:inline-block;width:130px">${name.padEnd(13)}</span> [${bar}] ${pct}%`);
    });
  }

  function cmdProjects() {
    print('<span style="color:#60cdff">Projects</span>');
    print('');
    const projs = [
      ['Autonomous System',     'Python, ROS, YOLOv3, FastAPI',    'IEEE Published ★'],
      ['Arogya-Sathi',          'React, FastAPI, ML, Docker',       'Hackathon Winner 🏆'],
      ['KnotesCentral',         'Next.js, Node.js, Redis',          'Production Ready ✓'],
      ['Deepfake Detection',    'PyTorch, OpenCV, CNN',             '94% Accuracy 🎯'],
      ['Mars Rover Sim',        'Python, ROS, Gazebo, C++',         'Autonomous Nav ✓'],
      ['Plant Disease AI',      'TensorFlow, MobileNet, Flutter',   'Mobile Deploy ✓'],
    ];
    projs.forEach(([name, stack, badge]) => {
      print(`<span style="color:#FFD60A">▸ ${name}</span> — <span style="color:#888">${stack}</span>`);
      print(`  <span style="color:#28C840">${badge}</span>`);
      print('');
    });
  }

  function cmdExperience() {
    print('<span style="color:#60cdff">Experience</span>');
    print('');
    print(`<span style="color:#007AFF">● Colligence Research</span> — AI Engineer Intern`);
    print(`  Jan 2025 – Present | Bengaluru`);
    print(`  · Autonomous AI systems with self-healing deployment loops (IEEE)`);
    print(`  · Multi-agent LLM orchestration — 70% reduction in manual ops`);
    print(`  · FastAPI microservices handling 10k+ req/min, 99.9% uptime`);
    print('');
    print(`<span style="color:#34C759">● RVCE Centre for Robotics & AI</span> — Research Intern`);
    print(`  Jun 2024 – Dec 2024 | Bengaluru`);
    print(`  · YOLOv3 real-time object detection for autonomous rovers`);
    print(`  · IEEE paper on vision-guided navigation, 94% accuracy`);
    print('');
    print(`<span style="color:#FF9F0A">● EY India</span> — Technology Consulting Intern`);
    print(`  Jan 2024 – May 2024 | Bengaluru`);
    print(`  · ML models for financial risk assessment`);
    print(`  · Automated pipelines processing 500k+ records/day`);
  }

  function cmdContact() {
    print('<span style="color:#28C840">● Available for opportunities</span>');
    print('');
    print(`<span style="color:#60cdff">Email:</span>    sprajwalln@gmail.com`);
    print(`<span style="color:#60cdff">LinkedIn:</span> https://www.linkedin.com/in/sprajwallnarayana`);
    print(`<span style="color:#60cdff">GitHub:</span>   https://github.com/developer1010x`);
    print(`<span style="color:#60cdff">Location:</span> Bengaluru, Karnataka, India`);
    print('');
    print(`<span style="color:#888">Open to: Full-time roles, Research collaborations, Freelance AI/ML projects</span>`);
  }

  function cmdHelp() {
    const cols = [
      ['FILE SYSTEM', [
        ['ls [-la] [path]', 'list directory contents'],
        ['cd [path]', 'change directory'],
        ['pwd', 'print working directory'],
        ['mkdir <name>', 'make directory'],
        ['touch <name>', 'create file'],
        ['rm [-rf] <name>', 'remove file/directory'],
        ['cat <file>', 'show file contents'],
        ['cp <src> <dst>', 'copy file'],
        ['mv <src> <dst>', 'move/rename'],
        ['find -name <pat>', 'find files'],
        ['tree', 'show directory tree'],
      ]],
      ['SYSTEM', [
        ['whoami', 'current user'],
        ['uname [-a]', 'system information'],
        ['hostname', 'machine hostname'],
        ['uptime', 'system uptime'],
        ['date', 'current date/time'],
        ['cal', 'ASCII calendar'],
        ['id', 'user identity'],
        ['env', 'environment variables'],
        ['history', 'command history'],
        ['ps aux', 'process list'],
        ['top', 'live process viewer'],
        ['df -h', 'disk usage'],
        ['free -m', 'memory usage'],
        ['lscpu', 'CPU information'],
      ]],
      ['NETWORK', [
        ['ping <host>', 'ping a host'],
        ['curl <url>', 'fetch URL'],
        ['wget <url>', 'download file'],
        ['ifconfig / ip addr', 'network interfaces'],
        ['netstat', 'network connections'],
        ['ssh user@host', 'SSH connection'],
      ]],
      ['PACKAGE MANAGERS', [
        ['brew install <pkg>', 'Homebrew (macOS)'],
        ['apt install <pkg>', 'APT (Debian/Kali)'],
        ['pip install <pkg>', 'Python pip'],
        ['npm install <pkg>', 'Node.js npm'],
        ['pacman -S <pkg>', 'Pacman (Arch/Kali)'],
      ]],
      ['GIT', [
        ['git status', 'repository status'],
        ['git log [--oneline]', 'commit history'],
        ['git diff', 'show changes'],
        ['git branch', 'list branches'],
        ['git add .', 'stage changes'],
        ['git commit -m "msg"', 'create commit'],
        ['git push / pull', 'sync with remote'],
      ]],
      ['REPLS & EDITORS', [
        ['python3', 'Python 3 REPL'],
        ['node', 'Node.js REPL'],
        ['vim <file>', 'Vi text editor'],
        ['nano <file>', 'Nano text editor'],
      ]],
      ['TEXT TOOLS', [
        ['echo <text>', 'print text'],
        ['grep <pat> <file>', 'search in file'],
        ['wc -l <file>', 'line/word count'],
        ['head / tail [-n N]', 'first/last N lines'],
        ['sort / uniq', 'sort & deduplicate'],
        ['awk / sed', 'text processing (pipe)'],
      ]],
      ['SPECIAL / FUN', [
        ['neofetch', 'system info with logo'],
        ['sl', 'ASCII steam locomotive'],
        ['matrix', 'matrix rain animation'],
        ['fortune', 'random quote'],
        ['cowsay <text>', 'ASCII cow speech'],
        ['banner <text>', 'big ASCII text'],
        ['lolcat', 'rainbow text'],
        ['htop', 'interactive process viewer'],
        ['sudo <cmd>', 'run as superuser (😄)'],
      ]],
      ['PORTFOLIO', [
        ['portfolio', 'ASCII portfolio summary'],
        ['skills', 'show skill bars'],
        ['projects', 'list all projects'],
        ['experience', 'work experience'],
        ['contact', 'contact information'],
        ['open <app>', 'open portfolio app'],
        ['clear / Ctrl+L', 'clear terminal'],
        ['exit', 'close terminal'],
        ['help', 'show this help'],
      ]],
    ];

    print('<span style="color:#FFD60A;font-weight:bold">Available Commands</span>');
    print('<span style="color:#888">─────────────────────────────────────────────────────</span>');
    print('');

    cols.forEach(([section, cmds]) => {
      print(`<span style="color:#60cdff;font-weight:bold">${section}</span>`);
      cmds.forEach(([cmd, desc]) => {
        print(`  <span style="color:#28C840">${cmd.padEnd(25)}</span><span style="color:#888">${desc}</span>`);
      });
      print('');
    });

    print('<span style="color:#888">Tip: Use ↑↓ for history, Tab for completion, | for pipes</span>');
  }

  /* ================================================================
     EXPORT
  ================================================================ */
  window.initTerminal = initTerminal;

})();
