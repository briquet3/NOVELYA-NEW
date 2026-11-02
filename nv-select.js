/* NOVELYA — menus déroulants modernes.
   Transforme automatiquement chaque <select> en menu stylé (clavier, lecteurs d'écran, thèmes, boîtes de dialogue).
   Le <select> d'origine reste dans la page (caché) : app.js / admin.js continuent de lire .value et d'écouter "change".
   Pour exclure un select : <select data-native>. Pour retirer le fichier : supprime la balise <script> et nv-ui.css. */
(() => {
  'use strict';
  const POP = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
  const valD = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const idxD = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
  const CHEV = '<svg class="nv-chev" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5.5 7.75 10 12.25l4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg class="nv-check" viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d="m4.5 10.5 3.6 3.6 7.4-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let uid = 0, current = null;

  function enhance(sel) {
    if (sel._nv || sel.multiple || sel.hasAttribute('data-native') || sel.size > 1) return;
    const id = 'nvs' + (++uid);
    const wrap = document.createElement('span');
    wrap.className = 'nv-select';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'nv-btn';
    btn.setAttribute('role', 'combobox'); btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
    const lab = sel.getAttribute('aria-label') || sel.labels?.[0]?.firstChild?.textContent?.trim();
    if (lab) btn.setAttribute('aria-label', lab);
    btn.innerHTML = '<span class="nv-val"></span>' + CHEV;
    const panel = document.createElement('div');
    panel.className = 'nv-panel'; panel.id = id; panel.setAttribute('role', 'listbox'); panel.tabIndex = -1;
    if (POP) panel.setAttribute('popover', 'manual'); else panel.classList.add('nv-fb');

    sel.parentNode.insertBefore(wrap, sel);
    wrap.append(sel, btn, panel);
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');

    const inst = { sel, wrap, btn, panel, items: [], act: -1, isOpen: false, typed: '', typedT: 0, closeT: 0 };
    sel._nv = inst;

    const val = btn.querySelector('.nv-val');
    inst.refresh = () => {
      const opts = [...sel.options];
      panel.replaceChildren();
      inst.items = opts.map((o, i) => {
        const el = document.createElement('div');
        el.className = 'nv-opt'; el.id = id + '-' + i; el.setAttribute('role', 'option'); el.dataset.i = i;
        if (o.disabled) { el.classList.add('dis'); el.setAttribute('aria-disabled', 'true'); }
        if (o.value === '') el.classList.add('empty');
        const t = document.createElement('span'); t.className = 'nv-t'; t.textContent = o.textContent.trim();
        el.append(t); el.insertAdjacentHTML('beforeend', CHECK);
        const on = i === sel.selectedIndex; el.classList.toggle('on', on); el.setAttribute('aria-selected', on);
        panel.append(el); return el;
      });
      const cur = opts[sel.selectedIndex];
      val.textContent = cur ? cur.textContent.trim() : '—';
      wrap.classList.toggle('is-empty', !cur || cur.value === '');
      btn.disabled = sel.disabled; wrap.classList.toggle('is-disabled', sel.disabled);
    };
    inst.refresh();

    /* le code existant fait select.value = … : on garde le menu synchronisé */
    Object.defineProperty(sel, 'value', { configurable: true, get() { return valD.get.call(this); }, set(v) { valD.set.call(this, v); inst.refresh(); } });
    Object.defineProperty(sel, 'selectedIndex', { configurable: true, get() { return idxD.get.call(this); }, set(v) { idxD.set.call(this, v); inst.refresh(); } });
    new MutationObserver(() => inst.refresh()).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'label'], characterData: true });
    sel.addEventListener('change', inst.refresh);
    sel.addEventListener('focus', () => btn.focus());
    sel.form?.addEventListener('reset', () => setTimeout(inst.refresh, 0));

    /* ---------- ouverture / fermeture ---------- */
    function place() {
      const r = btn.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
      panel.style.minWidth = r.width + 'px'; panel.style.maxWidth = Math.min(440, vw - 16) + 'px';
      panel.style.maxHeight = '';
      const below = vh - r.bottom - 14, above = r.top - 14;
      const want = Math.min(panel.scrollHeight, 330);
      const up = below < Math.min(want, 220) && above > below;
      const mh = Math.max(120, Math.min(330, up ? above : below));
      panel.style.maxHeight = mh + 'px';
      const ph = Math.min(panel.scrollHeight, mh), pw = panel.offsetWidth;
      panel.style.left = Math.max(8, Math.min(r.left, vw - pw - 8)) + 'px';
      panel.style.top = (up ? r.top - 8 - ph : r.bottom + 8) + 'px';
      panel.dataset.dir = up ? 'up' : 'down';
    }
    inst.place = place;
    inst.open = () => {
      if (inst.isOpen || sel.disabled) return;
      if (current && current !== inst) current.close(true);
      clearTimeout(inst.closeT);
      inst.refresh(); inst.isOpen = true; current = inst;
      if (POP) { try { panel.showPopover(); } catch (_) { panel.classList.add('nv-fb', 'show'); } } else panel.classList.add('show');
      place();
      btn.setAttribute('aria-expanded', 'true'); wrap.classList.add('open');
      requestAnimationFrame(() => panel.classList.add('show'));
      inst.setActive(sel.selectedIndex >= 0 ? sel.selectedIndex : first(), true);
    };
    inst.close = instant => {
      if (!inst.isOpen) return;
      inst.isOpen = false; if (current === inst) current = null;
      btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant'); wrap.classList.remove('open');
      panel.classList.remove('show');
      const hide = () => { if (inst.isOpen) return; if (POP) { try { panel.hidePopover(); } catch (_) {} } };
      if (instant) hide(); else inst.closeT = setTimeout(hide, 150);
    };
    const enabled = i => inst.items[i] && !inst.items[i].classList.contains('dis');
    const first = () => inst.items.findIndex((_, i) => enabled(i));
    const last = () => { for (let i = inst.items.length - 1; i >= 0; i--) if (enabled(i)) return i; return -1; };
    inst.setActive = (i, scroll) => {
      if (i < 0 || !inst.items[i]) return;
      inst.items.forEach(x => x.classList.remove('act'));
      inst.act = i; const el = inst.items[i]; el.classList.add('act');
      btn.setAttribute('aria-activedescendant', el.id);
      if (scroll || true) el.scrollIntoView({ block: 'nearest' });
    };
    const step = d => { let i = inst.act; do { i += d; } while (inst.items[i] && !enabled(i)); if (inst.items[i]) inst.setActive(i); };
    inst.choose = i => {
      if (!enabled(i)) return;
      const changed = idxD.get.call(sel) !== i;
      idxD.set.call(sel, i); inst.refresh();
      if (changed) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
      inst.close(); btn.focus({ preventScroll: true });
    };

    btn.addEventListener('click', () => (inst.isOpen ? inst.close() : inst.open()));
    panel.addEventListener('pointermove', e => { const o = e.target.closest('.nv-opt'); if (o && !o.classList.contains('dis') && +o.dataset.i !== inst.act) inst.setActive(+o.dataset.i); });
    panel.addEventListener('click', e => { const o = e.target.closest('.nv-opt'); if (o) inst.choose(+o.dataset.i); });
    panel.addEventListener('pointerdown', e => e.preventDefault()); // garde le focus sur le bouton
    btn.addEventListener('keydown', e => {
      const k = e.key;
      if (!inst.isOpen) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(k)) { e.preventDefault(); inst.open(); }
        else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { type(k, true); }
        return;
      }
      if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); inst.close(); }
      else if (k === 'Tab') inst.close(true);
      else if (k === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); step(-1); }
      else if (k === 'Home') { e.preventDefault(); inst.setActive(first()); }
      else if (k === 'End') { e.preventDefault(); inst.setActive(last()); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); inst.choose(inst.act); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) type(k, false);
    });
    function type(ch, closed) { /* recherche en tapant */
      clearTimeout(inst.typedT); inst.typed += ch.toLowerCase(); inst.typedT = setTimeout(() => (inst.typed = ''), 600);
      const n = inst.items.length, from = closed ? sel.selectedIndex : inst.act, one = inst.typed.length === 1;
      for (let k = one ? 1 : 0; k < n + (one ? 1 : 0); k++) {
        const i = (from + k + n) % n;
        if (enabled(i) && inst.items[i].textContent.trim().toLowerCase().startsWith(inst.typed)) { closed ? inst.choose(i) : inst.setActive(i); return; }
      }
    }
  }

  /* fermeture au clic extérieur, au défilement de la page, au redimensionnement */
  document.addEventListener('pointerdown', e => { if (current && !current.wrap.contains(e.target)) current.close(); }, true);
  addEventListener('resize', () => current?.place(), { passive: true });
  addEventListener('scroll', e => { if (current && !current.panel.contains(e.target)) current.place(); }, { passive: true, capture: true });
  /* Échap ferme d'abord le menu, pas la boîte de dialogue qui le contient */
  document.addEventListener('cancel', e => { if (current) { e.preventDefault(); current.close(); } }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && current) { e.stopPropagation(); e.preventDefault(); current.close(); } }, true);

  /* initialisation + selects ajoutés plus tard (boîtes de dialogue, formulaires reconstruits) */
  const scan = (root = document) => root.querySelectorAll?.('select').forEach(enhance);
  scan();
  let pend = 0;
  new MutationObserver(() => { if (pend) return; pend = requestAnimationFrame(() => { pend = 0; scan(); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
