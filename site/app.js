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

  /* ------------------------------------------------------------ side nav
     Above 1024px the rail is always on screen and the drawer state is inert;
     below it the same element slides in as a drawer. */
  function setupNav() {
    var nav = document.getElementById('sidenav');
    var toggle = document.querySelector('[data-nav-toggle]');
    var backdrop = document.querySelector('[data-nav-close]');
    if (!nav || !toggle || !backdrop) return;

    var root = document.documentElement;

    function setOpen(open) {
      root.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      backdrop.hidden = !open;
    }

    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(!root.classList.contains('nav-open'));
    });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && root.classList.contains('nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    // Any jump closes the drawer so the target is visible right away.
    nav.addEventListener('click', function (ev) {
      if (ev.target.closest('a[href^="#"]')) setOpen(false);
    });
    // A resize into the desktop rail must not leave the drawer state stuck on.
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (ev) {
      if (ev.matches) setOpen(false);
    });

    highlightNav();
  }

  /* Marks the section occupying the middle of the viewport. */
  function highlightNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-navlink]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var pairs = links.map(function (link) {
      return { link: link, section: document.querySelector(link.getAttribute('href')) };
    }).filter(function (p) { return p.section; });

    var visible = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = visible.indexOf(entry.target);
        if (entry.isIntersecting && i === -1) visible.push(entry.target);
        else if (!entry.isIntersecting && i !== -1) visible.splice(i, 1);
      });
      // Later sections win, so scrolling down always lands on the newest one.
      var active = visible.length ? pairs.filter(function (p) {
        return visible.indexOf(p.section) !== -1;
      }).pop() : null;
      pairs.forEach(function (p) {
        p.link.classList.toggle('is-active', !!active && p === active);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    pairs.forEach(function (p) { io.observe(p.section); });
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

  /* With detect_on:'window', particles.js maps the pointer's viewport coords
     straight onto canvas coords. That only holds while the canvas's top-left
     sits at the viewport's -- and this canvas is absolutely positioned in the
     hero, so once the page scrolls by S it sits at top:-S and every hover lands
     S pixels off.

     The fix that matters is removing the competing writer, because racing it
     can't be won: the library attaches its listener from a deferred draw path,
     so registering after it isn't guaranteed; an accessor on pos_x/pos_y
     double-corrects (the library assigns `pos = clientY`, then separately does
     `pos *= pxratio` -- a read-modify-write that feeds our value back
     through); and deferring our write to a later task is too late, since the
     draw loop reads the position on the next animation frame, which can fire
     first. That last one is why hover stayed broken while clicks looked fixed:
     click_pos is copied from an already-settled value.

     So point the library at the canvas instead of the window. Its own handler
     then uses offsetX/offsetY, which are element-relative and therefore correct
     at any scroll offset -- but it only fires while the pointer is directly over
     the canvas, and hero text and the photo sit above it. We cover the rest from
     a window listener writing the same canvas-space value. Both writers now
     agree, so ordering stops mattering, and the write is synchronous with the
     event, so it's in place before the frame draws. */
  function correctPointerMapping() {
    var doms = window.pJSDom;
    if (!doms || !doms.length) return false;
    var pJS = doms[doms.length - 1].pJS;
    if (!pJS || !pJS.canvas || !pJS.canvas.el || !pJS.interactivity) return false;

    var canvas = pJS.canvas.el;
    var mouse = pJS.interactivity.mouse;

    function toCanvas(ev) {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      // Measured, not read off pJS.retina: the library scales by the device
      // pixel ratio even when that flag reads as unset.
      var ratio = canvas.width / r.width;
      return { x: (ev.clientX - r.left) * ratio, y: (ev.clientY - r.top) * ratio };
    }

    window.addEventListener('mousemove', function (ev) {
      var p = toCanvas(ev);
      if (!p) return;
      mouse.pos_x = p.x;
      mouse.pos_y = p.y;
      pJS.interactivity.status = 'mousemove';
    }, { passive: true });

    // The library only pushes on clicks that land on the canvas itself; keep
    // click-anywhere by forwarding the rest. Skipping canvas-targeted clicks
    // avoids pushing twice.
    window.addEventListener('click', function (ev) {
      if (ev.target === canvas) return;
      var p = toCanvas(ev);
      if (!p) return;
      mouse.pos_x = p.x;
      mouse.pos_y = p.y;
      mouse.click_pos_x = p.x;
      mouse.click_pos_y = p.y;
      pJS.fn.modes.pushParticles(pJS.interactivity.modes.push.particles_nb, mouse);
    });

    return true;
  }

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
          // Deliberately 'canvas', not the design's 'window' -- see
          // correctPointerMapping above.
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: { grab: { distance: 160, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } }
        },
        retina_detect: true
      });
      // The instance may not be registered yet; retry briefly until it is.
      var tries = 0;
      (function patch() {
        if (correctPointerMapping() || tries++ > 60) return;
        setTimeout(patch, 100);
      })();
    })();
  }

  setupTheme();
  setupNav();
  setupReveals();
  setupTilt();
  setupCta();
  setupGlitch();
  setupLogoFallbacks();
  setupParticles();
})();
