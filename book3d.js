/* NOVELYA — livre 3D piloté par le scroll + apparitions + petits liens du pied de page.
   Fichier autonome (ne touche pas à app.js). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const noMotion = () => document.body.classList.contains('no-motion') || reduce.matches;

  /* ---------- liens du pied de page ---------- */
  const click = (from, to) => { const a = $(from), b = $(to); if (a && b) a.addEventListener('click', () => b.click()); };
  click('#ftAccount', '#accountButton'); click('#ftSettings', '#settingsButton'); click('#ftSubmit', '#submitStoryOpen'); click('#bkSubmit', '#submitStoryOpen');
  $('#ftTop')?.addEventListener('click', () => scrollTo({ top: 0, behavior: noMotion() ? 'auto' : 'smooth' }));

  /* ---------- apparition au scroll (à propos) ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
  } else document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));

  /* halo qui suit la souris sur les cartes */
  document.querySelectorAll('.ab-card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(); c.style.setProperty('--px', (e.clientX - r.left) + 'px'); c.style.setProperty('--py', (e.clientY - r.top) + 'px');
  }));

  /* ---------- livre 3D ---------- */
  const sec = $('#livre'); if (!sec) return;
  const scene = $('#bkScene'), rig = $('#bkRig'), book = $('#bkBook'), shadow = $('#bkShadow'), tl = $('#bkTL');
  const leaves = [...book.querySelectorAll('.bk-leaf')].sort((a, b) => a.dataset.i - b.dataset.i);
  const base = $('.bk-base', book);
  const tabs = [...sec.querySelectorAll('.bk-tab')];
  const N = leaves.length;
  const COPY = [
    ['Une bibliothèque ouverte à tous', 'Mangas, romans, webtoons, poésie… des histoires rangées par genre, sans abonnement et sans chapitre payant.'],
    ['Un vrai livre à feuilleter', 'Lis en mode livre : double page, pages qui se tournent d’un clic ou avec les flèches de ton clavier.'],
    ['Reprends où tu t’es arrêté', 'Ton marque-page est enregistré : reviens quand tu veux, tu retombes exactement sur ta page.'],
    ['Rejoins les auteurs', 'Propose ton histoire, reçois les commentaires de la communauté et fais vivre ton univers.']
  ];
  /* fenêtres de progression (0..1) : couverture, puis une page à la fois */
  const WIN = [[.05, .33], [.37, .66], [.70, .98]];
  const STEP_AT = [0, .35, .68, 1]; // progression visée en cliquant un onglet

  let W = 200, H = 280, T = 30, p = 0, cp = 0, t0 = performance.now(), mx = 0, my = 0, cmx = 0, cmy = 0, visible = false, raf = 0, active = -1, started = false;
  const staticMode = () => noMotion();

  function size() {
    const sh = scene.clientHeight, cw = scene.clientWidth;
    H = Math.min(sh * .8, 470); W = H * .72;
    if (W * 2.15 > cw) { W = cw / 2.15; H = W / .72; }
    T = Math.max(20, W * .16);
    [book, rig].forEach(n => { n.style.setProperty('--W', W.toFixed(1) + 'px'); n.style.setProperty('--H', H.toFixed(1) + 'px'); }); book.style.setProperty('--W', W.toFixed(1) + 'px'); book.style.setProperty('--H', H.toFixed(1) + 'px'); book.style.setProperty('--T', T.toFixed(1) + 'px');
    sec.classList.toggle('static', staticMode());
  }

  let spinY = 0, spinYt = 0, spinX = 0, spinXt = 0, vel = 0, dragging = false, moved = 0;
  let cur = 0, auto = false, autoT = 0; // le livre reste fermé : il ne s'ouvre qu'au clic
  function targetP() { return staticMode() ? (+sec.dataset.sp || 0) : STEP_AT[cur]; }
  function go(k, manual) {
    cur = k; if (manual) { auto = false; clearTimeout(autoT); }
    vel = 0; spinYt = Math.round(spinYt / 360) * 360; spinXt = 0; // le livre se remet droit (par le chemin le plus court)
    kick();
  }
  function autoplay() {
    clearTimeout(autoT);
    if (!auto || staticMode()) return;
    autoT = setTimeout(() => { if (auto && visible) go((cur + 1) % 4); autoplay(); }, 5200);
  }

  function setActive(i) {
    if (i === active) return; active = i;
    tabs.forEach((b, k) => b.classList.toggle('on', k === i));
    const box = $('#bkText'); box.classList.add('sw');
    setTimeout(() => { $('#bkTitle').textContent = COPY[i][0]; $('#bkP').textContent = COPY[i][1]; box.classList.remove('sw'); }, 160);
  }

  function render(time) {
    const gap = T / (N + 1);
    let open = 0;
    const G = 1; // écart (px) entre feuilles une fois le livre ouvert : tout reste dans le même plan
    const eC = ease(clamp((cp - WIN[0][0]) / (WIN[0][1] - WIN[0][0]), 0, 1));
    open = eC;
    leaves.forEach((el, i) => {
      const [a, b] = WIN[i];
      const e = ease(clamp((cp - a) / (b - a), 0, 1));
      let z;
      if (i === 0) z = (1 - e) * T / 2;
      else {
        const zU = (1 - open) * (T / 2 - i * gap) + open * (N - i) * G;
        const zF = (i + 1) * G;
        z = lerp(zU, zF, e);
      }
      const lift = Math.sin(e * Math.PI) * (N + 2) * G;
      el.style.transform = `translate3d(0,0,${(z + lift).toFixed(2)}px) rotateY(${(-180 * e).toFixed(2)}deg)`;
      el.style.setProperty('--sh', (Math.sin(e * Math.PI) * .38).toFixed(3));
      el.style.zIndex = e > .5 ? i : N - i;
      el.children[0].style.visibility = e < .5 ? 'visible' : 'hidden';
      el.children[1].style.visibility = e < .5 ? 'hidden' : 'visible';
    });
    base.style.transform = `translate3d(0,0,${(-(1 - open) * T / 2).toFixed(2)}px)`;
    const ed = (1 - clamp(open * 1.4, 0, 1)).toFixed(2);
    book.querySelectorAll('.bk-edge.r,.bk-edge.t').forEach(x => x.style.opacity = ed);

    const rr = sec.getBoundingClientRect();
    const sc0 = staticMode() ? 0 : clamp((rr.top + rr.height / 2 - innerHeight / 2) / innerHeight, -1, 1);
    const idle = staticMode() ? 0 : Math.sin((time - t0) / 1700);
    const idle2 = staticMode() ? 0 : Math.cos((time - t0) / 2300);
    const calm = 1 - open;
    /* fermé : le livre flotte, tourne avec le scroll, la souris et le glisser.
       ouvert : il reste DROIT (plus de rotation, plus de glisser) et ne bouge que très légèrement avec la souris. */
    const ryClosed = spinY + clamp(-30 + idle * 12 + sc0 * 26 + cmx * 38, -56, 52);
    const rxClosed = spinX - 13 + idle2 * 7 + sc0 * 12 - cmy * 27;
    const rzClosed = idle2 * 5 + cmx * 4;
    const ryOpen = cmx * 7, rxOpen = -cmy * 5, rzOpen = 0;
    const ry = lerp(ryClosed, ryOpen, open);
    const rx = lerp(rxClosed, rxOpen, open);
    const rz = lerp(rzClosed, rzOpen, open);
    book.classList.toggle('is-open', open > .5);
    const sc = lerp(.92, 1.08, ease(clamp((cp - .7) / .3, 0, 1)) * .6 + open * .4);
    const floatY = idle * (14 * calm + 2.5 * open);
    rig.style.transform = `translate3d(0,${floatY.toFixed(1)}px,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    book.style.transform = `translate3d(${(-W / 2 * (1 - open)).toFixed(1)}px,0,0)`;
    const tlo = clamp((open - .85) / .15, 0, 1); tl.style.opacity = tlo.toFixed(2); tl.style.visibility = tlo < .02 ? 'hidden' : 'visible';
    book.querySelector('.bk-edge.sp').style.opacity = (1 - open * 1.5 > 0 ? 1 - open * 1.5 : 0).toFixed(2);
    const sheen = book.querySelector('.bk-sheen'); if (sheen) sheen.style.setProperty('--shx', (50 + ry * 3 + idle * 14).toFixed(1) + '%');
    shadow.style.transform = `scaleX(${(lerp(.62, 1, open)).toFixed(3)})`;
    shadow.style.opacity = (.75 - Math.abs(floatY) * .02).toFixed(2);

    setActive(staticMode() ? (cp < .2 ? 0 : cp < .52 ? 1 : cp < .84 ? 2 : 3) : cur);
    tabs.forEach((b, k) => b.style.setProperty('--fill', (k === cur && auto && !staticMode() ? 100 : 0) + '%'));
    if (cp > .02 && !started) { started = true; sec.classList.add('started'); }
  }

  function loop(time) {
    raf = 0;
    if (!visible) return;
    p = targetP();
    cp = staticMode() ? p : lerp(cp, p, .035);
    cmx = lerp(cmx, mx, .08); cmy = lerp(cmy, my, .08);
    if (!dragging && Math.abs(vel) > .05) { spinYt += vel; vel *= .94; } else if (!dragging) vel = 0;
    spinY = lerp(spinY, spinYt, dragging ? .4 : .12); spinX = lerp(spinX, spinXt, .12);
    if (!dragging && !vel && Math.abs(spinY - spinYt) < .05 && spinYt % 360 === 0 && spinYt !== 0) { spinY -= spinYt; spinYt = 0; }
    render(time);
    const busy = Math.abs(cp - p) > .0005 || dragging || !staticMode() || Math.abs(cmx - mx) > .001;
    if (busy) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(loop); }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '100px' }).observe(sec);
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { size(); kick(); }, { passive: true });
  if (!matchMedia('(hover: none)').matches) addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; kick(); }, { passive: true });
  reduce.addEventListener?.('change', () => { size(); kick(); });
  new MutationObserver(() => { size(); kick(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  tabs.forEach((b, k) => b.addEventListener('click', () => { if (staticMode()) { sec.dataset.sp = STEP_AT[k]; kick(); return; } go(k, true); }));
  book.addEventListener('click', () => { if (moved > 6) { moved = 0; return; } go((cur + 1) % 4, true); });
  let lx = 0, ly = 0;
  book.addEventListener('pointerdown', e => {
    if (staticMode() || cur !== 0 || (e.pointerType === 'mouse' && e.button !== 0)) return; // livre ouvert : pas de rotation
    dragging = true; moved = 0; vel = 0; lx = e.clientX; ly = e.clientY; spinYt = spinY; book.classList.add('drag');
    try { book.setPointerCapture(e.pointerId); } catch (_) {} kick();
  });
  book.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    spinYt += dx * .7; vel = dx * .7;
    if (e.pointerType === 'mouse') spinXt = clamp(spinXt + dy * .35, -40, 40);
    kick();
  });
  const endDrag = () => { if (!dragging) return; dragging = false; book.classList.remove('drag'); if (moved <= 6) vel = 0; kick(); };
  book.addEventListener('pointerup', endDrag); book.addEventListener('pointercancel', endDrag);

  size(); visible = true; kick();
  // la hauteur de la scène peut changer après le chargement des polices
  addEventListener('load', () => { size(); kick(); });
})();
