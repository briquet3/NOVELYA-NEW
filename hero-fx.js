/* NOVELYA — hero vivant : décor en profondeur, parallaxe souris/scroll, apparition des cartes.
   Fichier autonome : il ne touche pas à app.js. Pour le retirer, supprime la balise <script>
   (et hero-fx.css) dans index.html. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const stage = document.getElementById('heroStage');
  if (!hero || !stage) return;

  const back = stage.querySelector('.fx-back');
  const front = stage.querySelector('.fx-front');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none)');
  const motionOn = () => !document.body.classList.contains('no-motion') && !reduce.matches;

  /* ---------- aléatoire stable (le décor ne change pas à chaque reconstruction) ---------- */
  let seed = 20260;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const between = (a, b) => a + rnd() * (b - a);

  /* ---------- fabrication d'éléments ---------- */
  function item(layer, kind, html, o = {}) {
    const el = document.createElement('div');
    el.className = `fx-item fx-${kind}${o.hideMobile ? ' fx-hide-m' : ''}`;
    const v = { x: o.x + '%', y: o.y + '%', d: o.d ?? 0, s: o.s ?? 0, t: (o.t ?? 9) + 's', dl: (o.dl ?? 0) + 's', r: (o.r ?? 0) + 'deg', sz: o.sz === undefined ? undefined : o.sz.toFixed(1) + 'px', c: o.c, sc: o.sc };
    for (const k in v) if (v[k] !== undefined) el.style.setProperty('--' + k, v[k]);
    el.innerHTML = `<span class="fx-in">${html}</span>`;
    layer.appendChild(el);
    return el;
  }
  const page = (layer, o) => item(layer, 'page', '<span class="fx-page"></span>', o);
  const chip = (layer, label, text, o) => item(layer, 'chip', `<span class="fx-chip"><b>${label}</b>${text}</span>`, o);
  const spark = (layer, o) => item(layer, 'spark', '✦', o);
  const mote = (layer, o) => item(layer, 'mote', '', o);
  const glyph = (layer, ch, o) => item(layer, 'glyph', ch, o);

  const edgeX = () => (rnd() < .5 ? between(-2, 12) : between(84, 97));

  function scatterMotes(layer, n, depth) {
    for (let i = 0; i < n; i++) mote(layer, { x: between(2, 96), y: between(25, 95), d: depth + between(-4, 8), s: between(8, 30), t: between(9, 17), dl: -between(0, 14), sz: between(3, 7) });
  }
  function scatterSparks(layer, n, depth, colors) {
    for (let i = 0; i < n; i++) spark(layer, { x: between(0, 96), y: between(2, 92), d: depth + between(-4, 10), s: between(6, 20), t: between(2.4, 4.6), dl: -between(0, 4), sz: between(10, 26), c: colors[i % colors.length] });
  }

  /* ---------- décor selon la saison ---------- */
  function season() {
    const b = document.body.classList;
    return b.contains('halloween') ? 'halloween' : b.contains('christmas') ? 'christmas' : b.contains('newyear') ? 'newyear' : b.contains('birthday') ? 'birthday' : b.contains('easter') ? 'easter' : 'normal';
  }

  function build() {
    seed = 20260;
    back.replaceChildren(); front.replaceChildren();
    const s = season();

    // fond : aurore, anneaux, étoile filante, ombre au sol
    back.insertAdjacentHTML('beforeend',
      '<span class="fx-aurora"></span><span class="fx-aurora b"></span>' +
      '<span class="fx-ring"><i></i><i class="two"></i><span class="fx-orb"></span></span>' +
      '<span class="fx-ground"></span>');

    if (s === 'normal') {
      page(back,  { x: 5,  y: 60, d: 12, s: 14, r: -18, t: 8,  sc: .85 });
      page(back,  { x: 87, y: 18, d: 16, s: 18, r: 14,  t: 10, dl: -3, sc: .8, hideMobile: true });
      page(front, { x: -1, y: 34, d: 38, s: 40, r: -24, t: 9,  dl: -2, sc: 1.1 });
      page(front, { x: 91, y: 38, d: 46, s: 48, r: 20,  t: 11, dl: -5, sc: 1.1 });
      page(front, { x: 72, y: 1,  d: 32, s: 36, r: 10,  t: 8,  dl: -1, sc: .9, hideMobile: true });
      chip(front, '✦', 'Il était une fois…', { x: 2,  y: 8,  d: 30, s: 30, r: -4, t: 10 });
      chip(front, '✦', 'Chapitre I',         { x: 68, y: 66, d: 36, s: 34, r: 3,  t: 12, dl: -4 });
      chip(front, '✦', 'À suivre…',          { x: 0,  y: 84, d: 42, s: 44, r: -3, t: 11, dl: -2 });
      scatterSparks(back, 6, 14, ['#fff', '#a9c6ff']);
      scatterSparks(front, 5, 34, ['#fff', '#e0ecff']);
      scatterMotes(back, 10, 10); scatterMotes(front, 8, 30);
    }

    if (s === 'halloween') {
      page(back,  { x: 5,  y: 60, d: 12, s: 14, r: -18, t: 8,  sc: .85 });
      page(back,  { x: 87, y: 18, d: 16, s: 18, r: 14,  t: 10, dl: -3, sc: .8, hideMobile: true });
      page(front, { x: -1, y: 34, d: 38, s: 40, r: -24, t: 9,  dl: -2, sc: 1.1 });
      page(front, { x: 91, y: 38, d: 46, s: 48, r: 20,  t: 11, dl: -5, sc: 1.1 });
      chip(front, '✦', 'Il était une nuit…', { x: 2,  y: 8,  d: 30, s: 30, r: -4, t: 10 });
      chip(front, '✦', 'Chapitre I',         { x: 68, y: 66, d: 36, s: 34, r: 3,  t: 12, dl: -4 });
      chip(front, '✦', 'À suivre…',          { x: 0,  y: 84, d: 42, s: 44, r: -3, t: 11, dl: -2 });
      scatterSparks(back, 6, 14, ['#fff', '#ffb066']);
      scatterSparks(front, 4, 34, ['#fff', '#ffcf99']);
      scatterMotes(back, 10, 10); scatterMotes(front, 6, 30);
    }

    if (s === 'christmas') {
      const flakes = ['✻', '❅', '❆'];
      for (let i = 0; i < 7; i++) glyph(back, flakes[i % 3], { x: between(0, 94), y: between(0, 90), d: between(10, 20), s: between(8, 24), t: between(7, 12), dl: -between(0, 8), r: between(-30, 30), sz: between(18, 32) });
      for (let i = 0; i < 5; i++) glyph(front, flakes[i % 3], { x: edgeX(), y: between(0, 90), d: between(34, 50), s: between(30, 50), t: between(6, 10), dl: -between(0, 8), r: between(-30, 30), sz: between(28, 48) });
      chip(front, '✦', 'Joyeuses fêtes', { x: 2,  y: 8,  d: 30, s: 30, r: -4, t: 10 });
      chip(front, '✦', 'Il était une fois…', { x: 70, y: 46, d: 36, s: 34, r: 3, t: 12, dl: -4 });
      scatterSparks(back, 6, 14, ['#fff', '#ffe9aa']);
      scatterSparks(front, 4, 34, ['#fff', '#ffe9aa']);
      scatterMotes(back, 10, 10); scatterMotes(front, 6, 30);
    }

    if (s === 'newyear') {
      const yr = String(new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear());
      const gl = ['✦', '✧', '✺'];
      for (let i = 0; i < 7; i++) glyph(back, gl[i % 3], { x: between(0, 94), y: between(0, 90), d: between(10, 20), s: between(8, 24), t: between(7, 12), dl: -between(0, 8), r: between(-30, 30), sz: between(16, 30) });
      for (let i = 0; i < 4; i++) glyph(front, gl[i % 3], { x: edgeX(), y: between(0, 90), d: between(34, 50), s: between(30, 50), t: between(6, 10), dl: -between(0, 8), r: between(-30, 30), sz: between(26, 44) });
      chip(front, '✦', 'Bonne année ' + yr, { x: 2,  y: 8,  d: 30, s: 30, r: -4, t: 10 });
      chip(front, '✦', 'Il était une fois…', { x: 70, y: 46, d: 36, s: 34, r: 3, t: 12, dl: -4 });
      chip(front, '✦', 'Minuit, une page', { x: 0, y: 82, d: 42, s: 44, r: -3, t: 11, dl: -2, hideMobile: true });
      scatterSparks(back, 6, 14, ['#fff', '#ffe9aa']);
      scatterSparks(front, 5, 34, ['#fff', '#f5c75a', '#ff9ad0']);
      scatterMotes(back, 10, 10); scatterMotes(front, 6, 30);
    }

    if (s === 'easter') {
      const gl = ['✿', '❀', '✦'];
      for (let i = 0; i < 6; i++) glyph(back, gl[i % 3], { x: between(0, 94), y: between(0, 90), d: between(10, 20), s: between(8, 24), t: between(7, 12), dl: -between(0, 8), r: between(-30, 30), sz: between(16, 28) });
      for (let i = 0; i < 4; i++) glyph(front, gl[i % 3], { x: edgeX(), y: between(0, 90), d: between(34, 50), s: between(30, 50), t: between(6, 10), dl: -between(0, 8), r: between(-30, 30), sz: between(24, 40) });
      page(front, { x: -1, y: 34, d: 38, s: 40, r: -24, t: 9,  dl: -2, sc: 1.1 });
      page(front, { x: 91, y: 38, d: 46, s: 48, r: 20,  t: 11, dl: -5, sc: 1.1 });
      chip(front, '✦', 'Chasse aux œufs…', { x: 2,  y: 8,  d: 30, s: 30, r: -4, t: 10 });
      chip(front, '✦', 'Chapitre I',        { x: 68, y: 66, d: 36, s: 34, r: 3,  t: 12, dl: -4 });
      chip(front, '✦', 'Joyeuses Pâques',   { x: 0,  y: 84, d: 42, s: 44, r: -3, t: 11, dl: -2, hideMobile: true });
      scatterSparks(back, 6, 14, ['#fff', '#ffe9aa']);
      scatterSparks(front, 4, 34, ['#fff', '#e8b64c']);
      scatterMotes(back, 8, 10); scatterMotes(front, 6, 30);
    }

    if (s === 'birthday') {
      const gl = ['✦', '✧', '♪'];
      for (let i = 0; i < 6; i++) glyph(back, gl[i % 3], { x: between(0, 94), y: between(0, 90), d: between(10, 20), s: between(8, 24), t: between(7, 12), dl: -between(0, 8), r: between(-30, 30), sz: between(16, 30) });
      for (let i = 0; i < 4; i++) glyph(front, gl[i % 3], { x: edgeX(), y: between(0, 90), d: between(34, 50), s: between(30, 50), t: between(6, 10), dl: -between(0, 8), r: between(-30, 30), sz: between(26, 44) });
      chip(front, '✦', 'Joyeux anniversaire', { x: 2,  y: 8,  d: 30, s: 30, r: -4, t: 10 });
      chip(front, '✦', 'Il était une fois…', { x: 70, y: 46, d: 36, s: 34, r: 3, t: 12, dl: -4 });
      chip(front, '✦', 'Une page de plus', { x: 0, y: 82, d: 42, s: 44, r: -3, t: 11, dl: -2, hideMobile: true });
      scatterSparks(back, 6, 14, ['#fff', '#ffb3d9']);
      scatterSparks(front, 5, 34, ['#fff', '#ffd84a', '#8fe8ff']);
      scatterMotes(back, 8, 10); scatterMotes(front, 6, 30);
    }
  }

  /* grand mot en contour derrière le hero */
  if (!hero.querySelector('.hero-bgword')) {
    const w = document.createElement('div');
    w.className = 'hero-bgword'; w.setAttribute('aria-hidden', 'true'); w.textContent = 'NOVELYA';
    hero.prepend(w);
  }

  build();
  let lastSeason = season();
  new MutationObserver(() => { const s = season(); if (s !== lastSeason) { lastSeason = s; build(); } })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* ---------- parallaxe souris + scroll ---------- */
  let tx = 0, ty = 0, cx = 0, cy = 0, sy = 0, lastSy = -1, running = false, visible = true;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function frame() {
    running = false;
    if (!visible) return;
    if (!motionOn()) { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); hero.style.setProperty('--sy', 0); return; }
    cx += (tx - cx) * .09; cy += (ty - cy) * .09;
    const top = hero.getBoundingClientRect().top;
    sy = clamp(-top, 0, 900);
    hero.style.setProperty('--mx', cx.toFixed(3));
    hero.style.setProperty('--my', cy.toFixed(3));
    hero.style.setProperty('--sy', sy.toFixed(1));
    hero.style.setProperty('--gx', (50 + cx * 38).toFixed(1) + '%');
    hero.style.setProperty('--gy', (28 + cy * 30).toFixed(1) + '%');
    const moving = Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001 || sy !== lastSy;
    lastSy = sy;
    if (moving) kick();
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  if (!touch.matches) {
    window.addEventListener('pointermove', e => {
      if (!motionOn()) return;
      tx = clamp((e.clientX / innerWidth - .5) * 2, -1, 1);
      ty = clamp((e.clientY / innerHeight - .5) * 2, -1, 1);
      kick();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '200px' }).observe(hero);
  kick();

  /* ---------- apparition des cartes de la bibliothèque ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target; io.unobserve(el);
      el.classList.add('in');
      setTimeout(() => el.classList.remove('reveal', 'in'), 1000);
    }
  }, { threshold: .08, rootMargin: '0px 0px -40px 0px' }) : null;

  function watchGrid(grid) {
    if (!grid || !io) return;
    const prep = () => {
      if (!motionOn()) return;
      let i = 0;
      grid.querySelectorAll('.card:not([data-fx])').forEach(c => {
        c.dataset.fx = '1';
        c.style.setProperty('--rd', (i++ % 6) * .06 + 's');
        c.classList.add('reveal');
        io.observe(c);
      });
    };
    new MutationObserver(prep).observe(grid, { childList: true });
    prep();
  }
  watchGrid(document.getElementById('grid'));
  watchGrid(document.getElementById('upcomingGrid'));
})();
