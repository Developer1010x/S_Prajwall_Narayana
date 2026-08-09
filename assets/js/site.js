/* ============================================================
   Shared behaviour for every regional page and the root picker.
   One file, loaded by all six pages. No framework, no build step
   for this file — it is served as-is.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = window.SITE_REGIONS || { current: null, defaultRegion: 'uk', regions: ['uk', 'in', 'us', 'jp', 'de'], typed: [] };
  var COOKIE = 'pn_region';
  var STORE = 'pn_region';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small helpers ---------- */

  function throttle(fn, limit) {
    var waiting = false;
    return function () {
      if (waiting) return;
      fn.apply(this, arguments);
      waiting = true;
      setTimeout(function () { waiting = false; }, limit);
    };
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  function isValidRegion(cc) {
    return typeof cc === 'string' && CONFIG.regions.indexOf(cc.toLowerCase()) !== -1;
  }

  /* ---------- region preference ----------
     The cookie is what the Vercel edge middleware reads, so setting it here
     is what makes the on-page switcher actually stick server-side.
     localStorage is the fallback for `file://` and any static host with no
     middleware, where the root page does the routing instead. */

  function setRegionPreference(cc) {
    if (!isValidRegion(cc)) return;
    try {
      document.cookie = COOKIE + '=' + cc + '; path=/; max-age=' + COOKIE_MAX_AGE + '; SameSite=Lax';
    } catch (e) { /* cookies blocked: localStorage still carries it locally */ }
    try {
      window.localStorage.setItem(STORE, cc);
    } catch (e) { /* private mode */ }
  }

  function readRegionPreference() {
    var match = document.cookie.match(/(?:^|;\s*)pn_region=([a-z]{2})/i);
    if (match && isValidRegion(match[1])) return match[1].toLowerCase();
    try {
      var stored = window.localStorage.getItem(STORE);
      if (isValidRegion(stored)) return stored;
    } catch (e) { /* ignore */ }
    return null;
  }

  window.SiteRegion = {
    set: setRegionPreference,
    read: readRegionPreference,
    isValid: isValidRegion
  };

  /* Escape hatch (a): ?region=uk. The middleware honours it server-side; this
     records it client-side too so a static/local copy behaves the same way. */
  function captureRegionQuery() {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('region');
    if (!wanted || !isValidRegion(wanted)) return;
    wanted = wanted.toLowerCase();
    setRegionPreference(wanted);
    if (CONFIG.current && wanted !== CONFIG.current) {
      window.location.replace('../' + wanted + '/');
    }
  }

  /* Escape hatch (b): the always-visible switcher in the header. */
  function initRegionSwitcher() {
    var select = document.getElementById('region-select');
    if (!select) return;
    select.addEventListener('change', function () {
      var cc = select.value;
      if (!isValidRegion(cc) || cc === CONFIG.current) return;
      setRegionPreference(cc);
      window.location.href = '../' + cc + '/?region=' + cc;
    });
  }

  /* ---------- region bar height ----------
     The navbar is fixed and sits below the region bar. The bar wraps on
     narrow screens, so its real height is measured rather than assumed. */

  function trackRegionBarHeight() {
    var bar = document.getElementById('region-bar');
    if (!bar) return;
    var update = function () {
      document.documentElement.style.setProperty('--region-bar-h', bar.offsetHeight + 'px');
    };
    update();
    window.addEventListener('resize', debounce(update, 150));
    if (window.ResizeObserver) new ResizeObserver(update).observe(bar);
  }

  function navOffset() {
    var bar = document.getElementById('region-bar');
    var navbar = document.querySelector('.navbar');
    return (bar ? bar.offsetHeight : 0) + (navbar ? navbar.offsetHeight : 0) + 8;
  }

  /* ---------- theme ---------- */

  function initTheme() {
    var button = document.getElementById('theme-toggle');
    var icon = document.getElementById('theme-icon');
    var stored = null;
    try { stored = window.localStorage.getItem('theme'); } catch (e) { /* ignore */ }

    function apply(theme) {
      if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (icon) icon.className = 'fas fa-sun';
        if (button) button.setAttribute('aria-pressed', 'true');
      } else {
        document.body.removeAttribute('data-theme');
        if (icon) icon.className = 'fas fa-moon';
        if (button) button.setAttribute('aria-pressed', 'false');
      }
    }

    apply(stored === 'light' ? 'light' : 'dark');

    if (button) {
      button.addEventListener('click', function () {
        var next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        apply(next);
        try { window.localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------- navigation ---------- */

  function initNav() {
    var hamburger = document.getElementById('hamburger');
    var links = document.getElementById('nav-links');

    if (hamburger && links) {
      hamburger.addEventListener('click', function () {
        var open = links.classList.toggle('active');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (anchor) {
      anchor.addEventListener('click', function (event) {
        var id = anchor.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        window.scrollTo({ top: target.offsetTop - navOffset(), behavior: reduceMotion ? 'auto' : 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (links) links.classList.remove('active');
        if (hamburger) {
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    var navbar = document.querySelector('.navbar');
    var backToTop = document.getElementById('back-to-top');
    var sections = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a');

    var onScroll = throttle(function () {
      var y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > 50);
      if (backToTop) backToTop.classList.toggle('visible', y > 500);

      var current = '';
      Array.prototype.forEach.call(sections, function (section) {
        if (y >= section.offsetTop - navOffset() - 40) current = section.getAttribute('id');
      });
      Array.prototype.forEach.call(navAnchors, function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---------- typewriter ---------- */

  function initTypewriter() {
    var el = document.getElementById('typed-text');
    var words = CONFIG.typed || [];
    if (!el || words.length < 2 || reduceMotion) return;

    var wordIndex = 0, text = '', deleting = false;

    function step() {
      var full = words[wordIndex % words.length];
      text = deleting ? full.substring(0, text.length - 1) : full.substring(0, text.length + 1);
      el.textContent = text;

      var speed = deleting ? 45 : 90;
      if (!deleting && text === full) {
        speed = 2200;
        deleting = true;
      } else if (deleting && text === '') {
        deleting = false;
        wordIndex++;
        speed = 400;
      }
      setTimeout(step, speed);
    }
    step();
  }

  /* ---------- scroll reveal + counters ---------- */

  function initReveal() {
    var elements = document.querySelectorAll('.reveal, .stagger-children');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(elements, function (el) { el.classList.add('active'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(elements, function (el) { observer.observe(el); });
  }

  function initCounters() {
    var counters = document.querySelectorAll('.stat-number');
    function finish(el) {
      el.textContent = (el.getAttribute('data-count') || '0') + (el.getAttribute('data-suffix') || '');
    }
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(counters, finish);
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var count = 0;
        var increment = Math.max(1, target / 40);
        (function tick() {
          count += increment;
          if (count < target) {
            el.textContent = Math.ceil(count) + suffix;
            setTimeout(tick, 25);
          } else {
            el.textContent = target + suffix;
          }
        })();
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(counters, function (el) { observer.observe(el); });
  }

  /* ---------- pointer sugar (desktop only) ---------- */

  function isTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
  }

  function initTilt() {
    if (isTouch() || reduceMotion) return;
    Array.prototype.forEach.call(document.querySelectorAll('.tilt-card'), function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var rx = (e.clientY - rect.top - rect.height / 2) / 22;
        var ry = (rect.width / 2 - (e.clientX - rect.left)) / 22;
        card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
      }, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  function initMagnetic() {
    if (isTouch() || reduceMotion) return;
    Array.prototype.forEach.call(document.querySelectorAll('.magnetic-btn'), function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + (e.clientX - rect.left - rect.width / 2) * 0.18 + 'px,' +
          (e.clientY - rect.top - rect.height / 2) * 0.18 + 'px)';
      }, { passive: true });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- hero particles ---------- */

  function initParticles() {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas || reduceMotion || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var frame = null;
    var visible = true;

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    function seed() {
      particles = [];
      var max = window.innerWidth < 768 ? 26 : 55;
      var count = Math.min(max, (canvas.width * canvas.height) / 16000);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 1,
          dx: Math.random() * 0.5 - 0.25,
          dy: Math.random() * 0.5 - 0.25,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }

    function draw() {
      if (!visible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.dx; p.y += p.dy;
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
        ctx.fillStyle = 'rgba(59, 130, 246, ' + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      var maxDist = window.innerWidth < 768 ? 80 : 120;
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var ddx = particles[a].x - particles[b].x;
          var ddy = particles[a].y - particles[b].y;
          var d2 = ddx * ddx + ddy * ddy;
          if (d2 >= maxDist * maxDist) continue;
          ctx.strokeStyle = 'rgba(59, 130, 246, ' + (0.1 * (1 - Math.sqrt(d2) / maxDist)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
      frame = requestAnimationFrame(draw);
    }

    var hero = document.getElementById('home');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible && !frame) draw();
          if (!visible && frame) { cancelAnimationFrame(frame); frame = null; }
        });
      }, { threshold: 0.05 }).observe(hero);
    }

    resize();
    seed();
    draw();
    window.addEventListener('resize', debounce(function () { resize(); seed(); }, 250));
  }

  /* ---------- CV modal: the PDF is requested only on open ---------- */

  function initCvModal() {
    var openBtn = document.getElementById('cv-open');
    var modal = document.getElementById('cv-modal');
    if (!openBtn || !modal) return;

    var frame = document.getElementById('cv-frame');
    var closeBtn = document.getElementById('cv-close');
    var href = openBtn.getAttribute('data-cv');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (frame && window.innerWidth > 768 && frame.getAttribute('src') !== href) {
        frame.setAttribute('src', href);
      }
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (frame) frame.setAttribute('src', 'about:blank');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    trackRegionBarHeight();
    captureRegionQuery();
    initRegionSwitcher();
    initTheme();
    initNav();
    initTypewriter();
    initReveal();
    initCounters();
    initTilt();
    initMagnetic();
    initParticles();
    initCvModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
