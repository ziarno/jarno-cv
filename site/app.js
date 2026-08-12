/* Filip Jarno — CV. Behaviour only: the page's content is in the HTML and
   renders fine without this file. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ theme */
  function setupTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    // The inline head script already applied the stored theme; read it back.
    var current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

    function paint(theme) {
      document.documentElement.dataset.theme = theme;
      btn.innerHTML = theme === 'light' ? MOON : SUN;
    }

    paint(current);
    btn.addEventListener('click', function () {
      current = current === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('cv-theme', current); } catch (err) { /* private mode */ }
      paint(current);
    });
  }

  /* ------------------------------------------------------------ scroll reveals */
  function setupReveals() {
    var targets = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------ card tilt
     Pointer-driven, so it is skipped on touch and on the mobile ledger layout. */
  function setupTilt() {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 601px)').matches) return;

    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (px * 5) + 'deg) rotateX(' + (-py * 5) + 'deg) translateZ(6px)';
        el.style.borderColor = 'rgba(124,58,237,.5)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
        el.style.borderColor = '';
      });
    });
  }

  /* ------------------------------------------------------------ CTA spotlight */
  function setupCta() {
    var box = document.querySelector('[data-cta]');
    if (!box) return;
    box.addEventListener('mousemove', function (ev) {
      var r = box.getBoundingClientRect();
      box.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      box.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  }

  /* ------------------------------------------------------------ glitch headline */
  function setupGlitch() {
    var CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ01#/<>{}';

    document.querySelectorAll('[data-glitch]').forEach(function (el) {
      var target = el.getAttribute('data-glitch');
      if (reduceMotion || !target) return;
      var busy = false;

      function run() {
        if (busy) return;
        busy = true;
        var original = el.textContent;
        var step = 0;
        var iv = setInterval(function () {
          el.textContent = target.split('').map(function (c, i) {
            if (c === ' ') return c;
            return i < step ? c : CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('');
          step += 0.5;
          if (step > target.length) {
            clearInterval(iv);
            el.textContent = original;
            busy = false;
          }
        }, 45);
      }

      el.addEventListener('mouseenter', run);
      setTimeout(run, 500);
    });
  }

  /* ------------------------------------------------------------ logo fallbacks
     Remote marks (simpleicons, devicon, favicons) can fail; swap in a tile. */
  function letterTile(name, sizeClass) {
    var label = (name.replace(/[^A-Za-z]/g, '').slice(0, 2) || '•');
    var span = document.createElement('span');
    span.className = 'letter-tile';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = label;
    if (sizeClass) span.classList.add(sizeClass);
    return span;
  }

  function setupLogoFallbacks() {
    document.querySelectorAll('img.mark[data-logo]').forEach(function (img) {
      function swap() {
        if (img.dataset.swapped || !img.parentNode) return;
        img.dataset.swapped = '1';
        img.parentNode.replaceChild(letterTile(img.dataset.logo), img);
      }
      if (img.complete && img.naturalWidth === 0) swap();
      img.addEventListener('error', swap);
    });

    document.querySelectorAll('img[data-edu-tile]').forEach(function (img) {
      function swap() {
        if (img.dataset.swapped || !img.parentNode) return;
        img.dataset.swapped = '1';
        var tile = document.createElement('span');
        tile.className = 'node-logo node-logo--fallback';
        tile.setAttribute('aria-hidden', 'true');
        tile.textContent = img.dataset.eduTile;
        img.parentNode.replaceChild(tile, img);
      }
      if (img.complete && img.naturalWidth === 0) swap();
      img.addEventListener('error', swap);
    });
  }

  /* ------------------------------------------------------------ hero particles */
  function setupParticles() {
    var el = document.getElementById('particles-bg');
    if (!el || reduceMotion) return;

    var attempts = 0;
    (function start() {
      if (attempts++ > 60) return;
      if (!window.particlesJS) { setTimeout(start, 100); return; }
      window.particlesJS('particles-bg', {
        particles: {
          number: { value: 140, density: { enable: true, value_area: 900 } },
          color: { value: ['#7c3aed', '#22d3ee', '#a78bfa'] },
          shape: { type: 'circle' },
          opacity: { value: 0.6, random: true },
          size: { value: 2.4, random: true },
          line_linked: { enable: true, distance: 130, color: '#7c6ef0', opacity: 0.32, width: 1 },
          move: { enable: true, speed: 1.4, direction: 'none', random: true, straight: false, out_mode: 'out' }
        },
        interactivity: {
          detect_on: 'window',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: { grab: { distance: 160, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } }
        },
        retina_detect: true
      });
    })();
  }

  setupTheme();
  setupReveals();
  setupTilt();
  setupCta();
  setupGlitch();
  setupLogoFallbacks();
  setupParticles();
})();
