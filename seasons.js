/* NOVELYA — SAISONS : Halloween · Noël · Nouvel An · Anniversaire · Pâques.
   Fichier autonome : décors SVG, particules canvas, props 3D autour du livre, coups d'éclair, transition de thème.
   Le thème actif est lu sur <body> (classes halloween / christmas, posées par app.js).
   Pour retirer : supprime seasons.js et seasons.css dans index.html. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const body = document.body;
  const THEMES = ['halloween', 'christmas', 'newyear', 'birthday', 'easter'];
  const theme = () => THEMES.find(t => body.classList.contains(t)) || 'normal';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => !body.classList.contains('no-motion') && !reduce.matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (cls, html, tag = 'div') => { const d = document.createElement(tag); d.className = 'nv-s ' + cls; if (html) d.innerHTML = html; return d; };

  /* ====================================================================== */
  /*  DESSINS (SVG)                                                          */
  /* ====================================================================== */
  const pine = (x, y, s, c, snow = true) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-150 34-92H15L48-42H20L60 8H-60L-20-42H-48L-15-92H-34Z" fill="${c}"/>${snow ? '<path d="M0-150 12-128Q0-121-12-128ZM-15-92 15-92 22-82Q0-78-22-82ZM-48-42 48-42 56-30Q0-22-56-30Z" fill="#f4fbff" opacity=".92"/>' : ''}<rect x="-6" y="8" width="12" height="20" fill="#2c1a10"/></g>`;
  const tomb = (x, y, w, h, c = '#0b0612') => `<path d="M${x} ${y}V${y - h}Q${x} ${y - h - w / 2} ${x + w / 2} ${y - h - w / 2}T${x + w} ${y - h}V${y}Z" fill="${c}"/>`;
  const star = (cx, cy, r, f) => `<path d="M${cx} ${cy - r}L${cx + r * .24} ${cy - r * .24} ${cx + r} ${cy} ${cx + r * .24} ${cy + r * .24} ${cx} ${cy + r} ${cx - r * .24} ${cy + r * .24} ${cx - r} ${cy} ${cx - r * .24} ${cy - r * .24}Z" fill="${f}"/>`;

  const BAT = '<svg viewBox="0 0 100 50" fill="currentColor"><path d="M50 10 46 3 43 10 36 13Q22 0 3 8Q16 12 11 28Q22 24 26 38Q35 28 43 36L50 48 57 36Q65 28 74 38Q78 24 89 28Q84 12 97 8Q78 0 64 13L57 10 54 3Z"/></svg>';
  const GHOST = '<svg viewBox="0 0 90 110"><path d="M12 100V46C12 6 78 6 78 46V100L65 89 53 103 41 90 29 103Z" fill="#f4f0ff" fill-opacity=".92"/><ellipse cx="34" cy="48" rx="5.5" ry="8.5" fill="#1b1026"/><ellipse cx="56" cy="48" rx="5.5" ry="8.5" fill="#1b1026"/><ellipse cx="45" cy="70" rx="6" ry="8" fill="#1b1026"/></svg>';
  const SPIDER = (len = 300) => `<g class="spd"><line x1="0" y1="${-len}" x2="0" y2="0" stroke="#e8def5" stroke-opacity=".75" stroke-width="1.3"/><g fill="none" stroke="#120a1a" stroke-width="2.4" stroke-linecap="round"><path d="M-6 3-18-5-26 4M-7 6-21 4-27 14M7 3 19-5 27 4M8 6 22 4 28 14M-5 -1-14-10-22-4M5-1 14-10 22-4"/></g><ellipse cx="0" cy="8" rx="9" ry="10.5" fill="#150b1d"/><circle cx="0" cy="-3" r="6" fill="#150b1d"/><circle cx="-2.4" cy="-4" r="1.5" fill="#ff5a3a"/><circle cx="2.4" cy="-4" r="1.5" fill="#ff5a3a"/><path d="M-3 7 0 3 3 7 0 13Z" fill="#ff8a1f" opacity=".85"/></g>`;
  const WEB = (w = 220) => `<svg viewBox="0 0 100 100" width="${w}" height="${w}" fill="none" stroke="#efe4ff" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"><path d="M0 0H100M0 0V100M0 0 98 98M0 0 96 40M0 0 40 96"/><path d="M18 0Q18 18 0 18M36 0Q38 38 0 36M56 0Q58 58 0 56M78 0Q80 80 0 78M20 8Q32 22 8 24M42 18Q60 42 18 42M64 30Q82 60 30 62"/></svg>`;
  const SNOWCAP = w => `<svg viewBox="0 0 ${w} 26" width="${w}" height="26" preserveAspectRatio="none"><path d="M0 0H${w}V10${Array.from({ length: Math.ceil(w / 40) }, (_, i) => `Q${w - i * 40 - 10} ${22 + (i % 3) * 3} ${w - i * 40 - 20} 12T${w - i * 40 - 40} 11`).join('')}Z" fill="#f4fbff"/></svg>`;

  /* ---- Père Noël + traîneau + rennes ---- */
  const DEER = (x, y, sc, lead, ph) => `<g transform="translate(${x} ${y}) scale(${sc})">
    <g class="rn-leg" style="animation-delay:${ph}s"><path d="M-22 8Q-40 16-56 24" stroke="#6e4429" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M22 8Q38 18 56 18" stroke="#6e4429" stroke-width="7" stroke-linecap="round" fill="none"/></g>
    <g class="rn-leg b" style="animation-delay:${ph}s"><path d="M-14 10Q-28 22-40 34" stroke="#8a5a3a" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M14 10Q28 24 40 32" stroke="#8a5a3a" stroke-width="7" stroke-linecap="round" fill="none"/></g>
    <ellipse cx="-36" cy="-6" rx="7" ry="5" fill="#fff"/>
    <ellipse cx="0" cy="0" rx="36" ry="18" fill="#9a6a45"/><ellipse cx="2" cy="8" rx="28" ry="9" fill="#e9cfa8" opacity=".9"/>
    <path d="M22 -8Q40 -30 52 -36L62 -26Q46 -14 34 8Z" fill="#9a6a45"/>
    <path d="M52 -42Q70 -48 78 -34Q80 -26 68 -24Q58 -24 52 -28Z" fill="#a8734b"/>
    <ellipse cx="74" cy="-31" rx="7" ry="5.5" fill="#e9cfa8"/>
    <circle cx="82" cy="-32" r="${lead ? 5.2 : 3.6}" fill="${lead ? '#ff3b4d' : '#3b2418'}"${lead ? ' style="filter:drop-shadow(0 0 7px #ff3b4d) drop-shadow(0 0 14px #ff6070)"' : ''}/>
    <circle cx="64" cy="-40" r="2.3" fill="#1c1210"/><circle cx="64.8" cy="-40.8" r=".8" fill="#fff"/>
    <path d="M52 -44Q46 -54 54 -58Q56 -50 58 -46Z" fill="#8a5a3a"/>
    <g stroke="#7b5a3a" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M58 -46Q54 -68 68 -80"/><path d="M57 -58Q68 -62 76 -74"/><path d="M62 -52Q48 -66 46 -80"/><path d="M60 -68Q50 -74 46 -72"/></g>
    <path d="M14 -16Q20 0 12 17" stroke="#f4c96b" stroke-width="3.5" fill="none"/><path d="M26 -14Q32 -22 40 -22" stroke="#d8283f" stroke-width="3" fill="none"/>
    <circle cx="38" cy="-12" r="4" fill="#f4c96b"/><circle cx="38" cy="-12" r="1.4" fill="#a8782a"/></g>`;
  const SLEIGH = () => `<svg viewBox="0 -16 632 216" overflow="visible">
    <g class="twk"><path d="M-70 94 -66 104 -56 108 -66 112 -70 122 -74 112 -84 108 -74 104Z" fill="#fff3b0"/><path d="M-20 64 -17 71 -10 74 -17 77 -20 84 -23 77 -30 74 -23 71Z" fill="#fff"/><path d="M-120 128 -117 134 -111 137 -117 140 -120 146 -123 140 -129 137 -123 134Z" fill="#ffd9a0"/></g>
    <path d="M6 112Q-30 118-60 108" stroke="#fff3b0" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" opacity=".7" fill="none"/>
    ${DEER(535, 104, .92, true, 0)}${DEER(395, 112, .9, false, -.25)}
    <path d="M214 86Q300 78 396 92" stroke="#f4c96b" stroke-width="2" fill="none"/><path d="M432 94Q480 80 552 90" stroke="#f4c96b" stroke-width="2" fill="none"/>
    <path d="M26 164H212Q250 164 246 134Q244 124 232 128" stroke="#f4c96b" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M26 164Q14 160 16 150" stroke="#f4c96b" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M70 164V138M176 164V138" stroke="#e0b24e" stroke-width="4.5"/>
    <path d="M30 94H226Q232 138 196 146H64Q34 138 30 94Z" fill="#c8283a"/><path d="M30 94H226Q227 108 224 118Q130 130 34 118Q30 108 30 94Z" fill="#e24259" opacity=".55"/>
    <path d="M44 128Q130 142 214 128" stroke="#f4c96b" stroke-width="2.2" fill="none" opacity=".9"/>
    <path d="M26 92H230" stroke="#f4c96b" stroke-width="6.5" stroke-linecap="round"/><path d="M30 92Q4 90 8 62" stroke="#f4c96b" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M226 92Q254 88 248 66" stroke="#f4c96b" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <circle cx="8" cy="60" r="4.5" fill="#f4c96b"/><circle cx="248" cy="64" r="4.5" fill="#f4c96b"/>
    <g><path d="M42 92Q30 52 62 42Q96 40 98 92Z" fill="#b9854e"/><path d="M42 92Q36 66 50 54" stroke="#d9a86c" stroke-width="3" fill="none"/><path d="M52 44Q62 34 74 44Q62 50 52 44Z" fill="#8a5d33"/>
      <rect x="54" y="26" width="26" height="20" rx="2" fill="#2f8f7a"/><path d="M67 26V46M54 36H80" stroke="#f8dba2" stroke-width="4"/><path d="M67 26C56 12 50 24 67 26C84 24 78 12 67 26Z" fill="none" stroke="#f8dba2" stroke-width="3"/>
      <rect x="86" y="50" width="22" height="18" rx="2" fill="#f4c96b"/><path d="M97 50V68" stroke="#d8283f" stroke-width="4"/><path d="M86 59H108" stroke="#d8283f" stroke-width="3"/></g>
    <g>
      <path d="M118 94Q118 56 150 52Q184 54 186 94Z" fill="#d8283f"/><path d="M122 92Q124 66 142 58" stroke="#f0586a" stroke-width="3" fill="none" opacity=".8"/>
      <path d="M118 80H186V89H118Z" fill="#2b1a1a"/><rect x="144" y="77.5" width="14" height="14" rx="2" fill="#f4c96b"/><rect x="148" y="81.5" width="6" height="6" rx="1" fill="#2b1a1a"/>
      <path d="M166 64Q190 66 206 84" stroke="#d8283f" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M196 78 208 86" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="210" cy="87" r="6" fill="#fff"/><circle cx="210" cy="87" r="6" fill="none" stroke="#e9e0d4" stroke-width="1.2"/>
      <circle cx="152" cy="38" r="17" fill="#f6cfb0"/><circle cx="140" cy="43" r="4" fill="#ff9aa5" opacity=".65"/><circle cx="163" cy="43" r="4" fill="#ff9aa5" opacity=".65"/>
      <path d="M134 40Q130 74 152 78Q174 74 170 40Q152 56 134 40Z" fill="#fff"/><path d="M140 52Q152 58 164 52Q152 64 140 52Z" fill="#f1ece4"/>
      <circle cx="152" cy="47" r="3.6" fill="#f2a090"/>
      <circle cx="145" cy="40" r="2.5" fill="#2a1d1d"/><circle cx="159" cy="40" r="2.5" fill="#2a1d1d"/><circle cx="145.8" cy="39.2" r=".9" fill="#fff"/><circle cx="159.8" cy="39.2" r=".9" fill="#fff"/><path d="M140 35.5Q145 32.5 150 35M154 35Q159 32.5 164 35.5" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <g transform="translate(0 -9)"><path d="M133 32Q132 6 160 6Q184 6 186 28Q188 34 190 40L136 40Z" fill="#d8283f"/><path d="M142 14Q150 8 164 9" stroke="#f0586a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M128 32Q156 46 184 32L186 42Q156 54 130 42Z" fill="#fff"/><circle cx="192" cy="40" r="8" fill="#fff"/><circle cx="192" cy="40" r="8" fill="none" stroke="#e9e0d4" stroke-width="1.2"/></g></g>
    <path d="M26 96H230V104Q130 114 26 104Z" fill="#a31e2e" opacity=".55"/>
  </svg>`;

  /* ---- accessoires du logo ---- */
  const HAT = {
    christmas: '<svg viewBox="0 0 40 36"><path d="M4 28Q8 6 26 3Q34 2 36 14Q34 22 30 30Z" fill="#d93a4c"/><path d="M2 27Q18 36 34 26L35 33Q18 41 3 34Z" fill="#fff"/><circle cx="37" cy="8" r="5.5" fill="#fff"/></svg>',
    halloween: '<svg viewBox="0 0 40 36"><path d="M2 30Q20 26 38 30 34 33 20 34 6 33 2 30Z" fill="#150b1d"/><path d="M10 29Q14 12 22 2Q24 14 31 29Z" fill="#150b1d"/><path d="M11 26Q20 23 29.5 26L30 29Q20 27 10.5 29Z" fill="#9b5cff"/><rect x="18" y="24.5" width="6" height="5" fill="#ff8a1f"/></svg>',
  };

  /* ---- bandeaux sous l'en-tête ---- */
  function topGarland() {
    const w = innerWidth, seg = Math.max(120, w / 11), n = Math.ceil(w / seg), cols = ['#ff4d5e', '#ffd36b', '#52e0a1', '#6fb4ff', '#ff8ad0'];
    let wire = 'M0 2', bulbs = '', k = 0;
    for (let i = 0; i < n; i++) {
      const x0 = i * seg, x1 = x0 + seg, cx = x0 + seg / 2, sag = 30;
      wire += `Q${cx} ${2 + sag} ${x1} 2`;
      [.16, .5, .84].forEach(t => {
        const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * 2 + 2 * (1 - t) * t * (2 + sag) + t * t * 2, c = cols[k++ % cols.length];
        bulbs += `<g class="twk" style="animation-delay:${-(k * .37 % 2).toFixed(2)}s"><circle cx="${x}" cy="${y + 11}" r="15" fill="${c}" opacity=".28"/><rect x="${x - 2.5}" y="${y - 1}" width="5" height="6" fill="#1b2a22"/><path d="M${x - 5} ${y + 5}Q${x - 6} ${y + 18} ${x} ${y + 21}Q${x + 6} ${y + 18} ${x + 5} ${y + 5}Z" fill="${c}"/><ellipse cx="${x - 1.5}" cy="${y + 10}" rx="1.3" ry="3" fill="#fff" opacity=".7"/></g>`;
      });
    }
    return `<svg viewBox="0 0 ${w} 62" width="${w}" height="62"><path d="${wire}" fill="none" stroke="#173126" stroke-width="2.4"/>${bulbs}</svg>`;
  }
  function topSlime() {
    const w = innerWidth; let p = `M0 0H${w}V8`, x = w;
    const ds = []; for (let i = 0; i < Math.round(w / 90); i++) ds.push({ x: rnd(20, w - 20), w: rnd(10, 22), l: rnd(18, 70) });
    ds.sort((a, b) => b.x - a.x);
    ds.forEach(d => { p += `H${d.x + d.w / 2}V${8 + d.l}Q${d.x} ${8 + d.l + d.w * .9} ${d.x - d.w / 2} ${8 + d.l}V8`; });
    p += 'H0Z';
    const sp = [.12, .46, .8].map((f, i) => `<g transform="translate(${(w * f).toFixed(0)} 4)" style="animation-delay:${-i * 2.1}s">${SPIDER(150 + i * 40)}</g>`).join('');
    return `<svg viewBox="0 0 ${w} 140" width="${w}" height="140"><defs><linearGradient id="nvSl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cf04a"/><stop offset="1" stop-color="#2fae2a"/></linearGradient></defs><path d="${p}" fill="url(#nvSl)" style="filter:drop-shadow(0 0 10px rgba(125,255,80,.55))"/><path d="M0 2H${w}" stroke="#d4ffb8" stroke-opacity=".5" stroke-width="2"/>${sp}</svg>`;
  }
  function topBunting() {
    const w = innerWidth, seg = Math.max(130, w / 10), n = Math.ceil(w / seg), cols = ['#ff9ac8', '#ffd96b', '#7fdcb5', '#9ec9ff', '#b497ff'];
    let wire = 'M0 2', fl = '', k = 0;
    for (let i = 0; i < n; i++) {
      const x0 = i * seg, x1 = x0 + seg, cx = x0 + seg / 2, sag = 26;
      wire += `Q${cx} ${2 + sag} ${x1} 2`;
      for (let j = 1; j <= 4; j++) {
        const t = j / 5, x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * 2 + 2 * (1 - t) * t * (2 + sag) + t * t * 2, c = cols[k++ % cols.length];
        fl += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((t - .5) * -18).toFixed(1)})"><path d="M-13 0H13L0 34Z" fill="${c}"/><path d="M-13 0H13L11 6H-11Z" fill="#fff" opacity=".35"/><circle cx="0" cy="12" r="3" fill="#fff" opacity=".7"/></g>`;
      }
    }
    return `<svg viewBox="0 0 ${w} 70" width="${w}" height="70"><path d="${wire}" fill="none" stroke="#d3bde8" stroke-width="2"/>${fl}</svg>`;
  }

  /* ---- scènes du hero ---- */
  function heroHalloween() {
    const house = `<g fill="#07030b"><path d="M1060 640V500H1300V640Z"/><path d="M1042 508 1180 420 1318 508Z"/><path d="M1250 500V360H1306V500Z"/><path d="M1238 366 1278 296 1318 366Z"/><rect x="1110" y="430" width="24" height="52"/><path d="M1090 640V610H1112V640ZM1250 640V600H1276V640Z"/></g>
      <g class="glow" fill="#ffb347"><rect x="1088" y="535" width="28" height="42" rx="3"/><rect x="1150" y="535" width="28" height="42" rx="3"/><rect x="1212" y="535" width="28" height="42" rx="3"/><rect x="1268" y="395" width="20" height="34" rx="10"/><path d="M1180 640V590Q1180 574 1196 574T1212 590V640Z" opacity=".75"/></g>
      <g fill="#07030b"><path d="M1118 535V577M1088 556H1116M1150 556H1178M1212 556H1240" stroke="#07030b" stroke-width="3"/></g>`;
    const tree = x => `<g stroke="#07030b" stroke-linecap="round" fill="none"><path d="M${x} 660C${x - 6} 580 ${x + 8} 520 ${x - 4} 440" stroke-width="16"/><path d="M${x - 2} 540Q${x - 50} 520 ${x - 84} 470M${x - 5} 490Q${x - 40} 470 ${x - 52} 420M${x} 560Q${x + 46} 530 ${x + 90} 500M${x - 2} 470Q${x + 32} 440 ${x + 70} 410M${x - 4} 440Q${x - 20} 410 ${x - 14} 380" stroke-width="7"/><path d="M${x - 84} 470Q${x - 100} 450 ${x - 112} 452M${x + 90} 500Q${x + 106} 480 ${x + 124} 482M${x + 70} 410Q${x + 84} 394 ${x + 100} 396" stroke-width="3.5"/></g>`;
    const stones = tomb(520, 650, 30, 36) + tomb(580, 655, 26, 26) + `<path d="M640 658V600H632V592H640V582H650V592H658V600H650V658Z" fill="#0b0612"/>` + tomb(700, 652, 34, 44) + tomb(1380, 650, 30, 40) + tomb(1440, 656, 28, 28);
    return `<div class="nv-sky"></div>
      <div class="nv-stars" style="background-image:radial-gradient(1.2px 1.2px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 30% 8%,#ffe9c9,transparent),radial-gradient(1.4px 1.4px at 48% 22%,#fff,transparent),radial-gradient(1px 1px at 66% 12%,#d9c9ff,transparent),radial-gradient(1.2px 1.2px at 82% 30%,#fff,transparent),radial-gradient(1px 1px at 94% 10%,#ffe9c9,transparent),radial-gradient(1px 1px at 22% 38%,#fff,transparent),radial-gradient(1.2px 1.2px at 56% 6%,#fff,transparent);background-size:520px 360px"></div>
      <div class="nv-moon"><i style="left:22%;top:24%;width:20%;height:20%"></i><i style="left:58%;top:18%;width:12%;height:12%"></i><i style="left:46%;top:56%;width:26%;height:26%"></i><i style="left:16%;top:62%;width:10%;height:10%"></i></div>
      <svg viewBox="0 0 1600 720" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="nvHg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0c24"/><stop offset="1" stop-color="#060309"/></linearGradient></defs>
        <path d="M0 640Q150 600 330 634T700 636T1050 624T1350 636T1600 628V720H0Z" fill="url(#nvHg)"/>
        ${tree(250)}${tree(1480)}${house}${stones}
        <path d="M0 672Q200 650 420 668T820 664T1200 662T1600 668V720H0Z" fill="#050208"/>
        <g fill="#050208"><path d="M860 690V650M880 690V644M900 690V650M920 690V644M940 690V650" stroke="#050208" stroke-width="7"/><path d="M850 662H950" stroke="#050208" stroke-width="5"/></g></svg>`;
  }
  function heroChristmas() {
    const mount = `<path d="M0 520 160 380 260 470 420 330 560 470 700 400 860 520 1020 380 1180 500 1360 360 1500 480 1600 430V620H0Z" fill="#12394f"/><path d="M160 380 190 418 150 412 120 430ZM420 330 450 366 410 360 376 382ZM1020 380 1050 416 1010 410 980 430ZM1360 360 1390 396 1352 392 1322 412Z" fill="#dff3ff" opacity=".8"/>`;
    const trees1 = [60, 150, 240, 700, 830, 920, 1010, 1330, 1420, 1520].map((x, i) => pine(x, 640 - (i % 3) * 8, .75 + (i % 3) * .1, '#0e3d33')).join('');
    const trees2 = [20, 120, 330, 760, 1140, 1250, 1560].map((x, i) => pine(x, 676, 1 + (i % 2) * .15, '#0a2a24')).join('');
    const xt = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-170 38-112H16L52-60H22L66-6H-66L-22-60H-52L-16-112H-38Z" fill="#1b6b4f"/><path d="M-40-30Q0-8 40-30M-30-80Q0-62 30-80" fill="none" stroke="#f4c96b" stroke-width="3"/>${[[-26, -18, '#ff4d5e'], [30, -22, '#ffd36b'], [-8, -62, '#6fb4ff'], [18, -92, '#ff8ad0'], [-30, -50, '#ffd36b'], [4, -130, '#ff4d5e']].map(([a, b, c], i) => `<circle class="twk" style="animation-delay:${-i * .3}s" cx="${a}" cy="${b}" r="5.5" fill="${c}"/>`).join('')}<rect x="-8" y="-6" width="16" height="22" fill="#4a2c1c"/><g class="glow">${star(0, -178, 20, '#ffe38a')}<circle cx="0" cy="-178" r="30" fill="#ffe38a" opacity=".25"/></g></g>`;
    const cabin = `<g transform="translate(560 612)"><rect x="-70" y="-62" width="140" height="70" fill="#4d2f20"/><path d="M-86-58 0-128 86-58Z" fill="#8c2b36"/><path d="M-86-58 0-128 86-58 78-52 0-116-78-52Z" fill="#f4fbff"/><rect x="40" y="-120" width="18" height="40" fill="#5b3a2b"/><rect x="38" y="-126" width="22" height="9" fill="#f4fbff"/><g class="glow"><rect x="-52" y="-42" width="30" height="26" fill="#ffd36b"/><rect x="18" y="-42" width="30" height="26" fill="#ffd36b"/><circle cx="-37" cy="-29" r="34" fill="#ffd36b" opacity=".2"/></g><path d="M-6 8V-30H14V8Z" fill="#2c1a10"/><g fill="#fff" opacity=".7"><circle cx="49" cy="-140" r="7"><animate attributeName="cy" values="-136;-190" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="4s" repeatCount="indefinite"/></circle><circle cx="56" cy="-140" r="9"><animate attributeName="cy" values="-136;-200" dur="5.5s" begin="-2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="5.5s" begin="-2s" repeatCount="indefinite"/></circle></g></g>`;
    const man = `<g transform="translate(1180 664)"><circle cy="-20" r="26" fill="#f4fbff"/><circle cy="-58" r="19" fill="#f4fbff"/><circle cy="-86" r="14" fill="#f4fbff"/><path d="M-18-98H18L12-122H-12Z" fill="#2a1d2f"/><rect x="-22" y="-100" width="44" height="6" fill="#2a1d2f"/><path d="M0-86 18-82 0-79Z" fill="#ff8a2a"/><circle cx="-5" cy="-90" r="1.8" fill="#222"/><circle cx="5" cy="-90" r="1.8" fill="#222"/><path d="M-16-72Q0-62 16-72L16-66Q0-56-16-66Z" fill="#d93a4c"/></g>`;
    return `<div class="nv-sky"></div><div class="nv-aurora"></div>
      <div class="nv-stars" style="background-image:radial-gradient(1.3px 1.3px at 10% 14%,#fff,transparent),radial-gradient(1px 1px at 28% 24%,#fff,transparent),radial-gradient(1.5px 1.5px at 44% 10%,#ffeec0,transparent),radial-gradient(1px 1px at 62% 28%,#fff,transparent),radial-gradient(1.3px 1.3px at 78% 12%,#dff0ff,transparent),radial-gradient(1px 1px at 92% 26%,#fff,transparent),radial-gradient(1px 1px at 36% 6%,#fff,transparent);background-size:480px 340px"></div>
      <div class="nv-moon"></div>
      <svg viewBox="0 0 1600 720" preserveAspectRatio="xMidYMax slice">${mount}
        <path d="M0 600Q240 548 520 590T1040 574T1600 596V720H0Z" fill="#cfe7f0" opacity=".92"/>${trees1}${cabin}
        <path d="M0 650Q300 610 640 646T1180 640T1600 652V720H0Z" fill="#f2faff"/>${xt(1330, 662, 1.1)}${man}${trees2}
        <path d="M0 690Q400 664 820 690T1600 684V720H0Z" fill="#ffffff"/></svg>`;
  }

  /* ---- scènes du pied de page ---- */
  function grass(c, n, h, w = 1600) { let p = 'M0 230'; for (let i = 0; i <= n; i++) { const x = (w / n) * i; p += `L${x} ${230 - rnd(h * .4, h)}L${x + w / n / 2} 230`; } return `<path d="${p}Z" fill="${c}"/>`; }
  function footHalloween() {
    return `<svg viewBox="0 0 1600 230" preserveAspectRatio="xMidYMax slice"><path d="M0 190Q300 160 640 186T1220 176T1600 190V230H0Z" fill="#0a0510"/>
      <g fill="#07030b">${tomb(160, 210, 34, 50)}${tomb(250, 214, 28, 34)}<path d="M330 216V150H322V142H330V130H340V142H348V150H340V216Z"/>${tomb(430, 210, 40, 56)}${tomb(1050, 212, 34, 48)}<path d="M1130 216V156H1122V148H1130V136H1140V148H1148V156H1140V216Z"/>${tomb(1210, 214, 30, 38)}${tomb(1290, 210, 38, 54)}</g>
      <g stroke="#07030b" fill="none" stroke-linecap="round"><path d="M80 214C76 160 90 120 80 70" stroke-width="12"/><path d="M80 150Q40 130 18 96M80 110Q112 90 124 56M80 90Q62 70 64 40" stroke-width="5"/><path d="M1500 214C1496 160 1510 124 1500 76" stroke-width="12"/><path d="M1500 150Q1462 134 1440 100M1500 112Q1530 92 1544 62" stroke-width="5"/></g>
      <g class="glow"><g transform="translate(980 216)"><path d="M0-4C30-4 46-22 46-44 46-64 30-80 0-80S-46-64-46-44C-46-22-30-4 0-4Z" fill="#ff8a1f"/><path d="M-46-44C-46-64-30-80 0-80V-4C-30-4-46-22-46-44Z" fill="#d9600a" opacity=".55"/><rect x="-5" y="-92" width="10" height="16" rx="3" fill="#3f6b2a"/><path d="M-26-52 -12-52 -19-38ZM26-52 12-52 19-38ZM-26-26Q0-8 26-26L16-30 8-22 0-30-8-22-16-30Z" fill="#fff2a0"/><circle cy="-44" r="70" fill="#ff8a1f" opacity=".16"/></g></g>
      <path d="M0 214H1600V230H0Z" fill="#050208"/></svg>
      <div class="nv-fog" style="position:absolute;height:130px;opacity:.5;z-index:1"></div>`;
  }
  function footChristmas() {
    const gift = (x, c, r) => `<g transform="translate(${x} 214)"><rect x="-26" y="-40" width="52" height="40" fill="${c}"/><rect x="-5" y="-40" width="10" height="40" fill="${r}"/><rect x="-30" y="-52" width="60" height="14" fill="${c}" stroke="#00000022"/><rect x="-5" y="-52" width="10" height="14" fill="${r}"/><path d="M0-52C-18-72-34-56-14-52ZM0-52C18-72 34-56 14-52Z" fill="${r}"/></g>`;
    return `<svg viewBox="0 0 1600 230" preserveAspectRatio="xMidYMax slice"><path d="M0 176Q260 140 560 170T1100 160T1600 174V230H0Z" fill="#dff1f8"/>
      ${[70, 190, 1400, 1520].map((x, i) => pine(x, 200, .8 + (i % 2) * .2, '#0f4a3c')).join('')}
      ${gift(300, '#d93a4c', '#f4c96b')}${gift(360, '#2f8f7a', '#fff')}${gift(1180, '#6b5bd6', '#f4c96b')}${gift(1240, '#f4c96b', '#d93a4c')}
      <path d="M0 196Q400 170 800 194T1600 184V230H0Z" fill="#fff"/>
      <g transform="translate(760 206)"><circle cy="-18" r="28" fill="#fff"/><circle cy="-58" r="21" fill="#fff"/><circle cy="-88" r="15" fill="#fff"/><path d="M-20-98H20L14-124H-14Z" fill="#d93a4c"/><rect x="-24" y="-100" width="48" height="7" fill="#f4c96b"/><path d="M0-88 20-84 0-80Z" fill="#ff8a2a"/><circle cx="-5" cy="-92" r="2" fill="#222"/><circle cx="5" cy="-92" r="2" fill="#222"/><path d="M-18-72Q0-60 18-72L18-64Q0-52-18-64Z" fill="#d93a4c"/><path d="M-30-58Q-52-76-60-92M30-58Q52-76 60-92" stroke="#5a3a27" stroke-width="3.5" fill="none"/></g>
      <path d="M0 214H1600V230H0Z" fill="#fff"/></svg>`;
  }

  /* ---- props 3D autour du livre ---- */
  const PROPS = {
    christmas: [
      { px: -1.34, py: .5, ps: .46, pz: -20, svg: '<svg viewBox="0 0 120 200"><ellipse cx="60" cy="192" rx="52" ry="8" fill="#000" opacity=".25"/><path d="M60 14 84 62H70L98 108H80L112 160H8L40 108H22L50 62H36Z" fill="#1d7a55"/><path d="M16 150Q60 126 104 150M30 104Q60 86 90 104M44 62Q60 52 76 62" fill="none" stroke="#f4c96b" stroke-width="3"/><rect x="52" y="160" width="16" height="26" fill="#4a2c1c"/><g class="twk"><circle cx="32" cy="138" r="6" fill="#ff4d5e"/><circle cx="82" cy="128" r="6" fill="#ffd36b"/><circle cx="52" cy="98" r="5.5" fill="#6fb4ff"/><circle cx="72" cy="82" r="5" fill="#ff8ad0"/><circle cx="62" cy="56" r="4.5" fill="#ffd36b"/><circle cx="96" cy="150" r="5.5" fill="#6fb4ff"/><circle cx="26" cy="112" r="5" fill="#ffd36b"/></g><g class="glow"><circle cx="60" cy="12" r="24" fill="#ffe38a" opacity=".3"/><path d="M60-6 66 8 82 10 70 20 74 36 60 28 46 36 50 20 38 10 54 8Z" fill="#ffe38a"/></g></svg>' },
      { px: 1.3, py: .5, ps: .5, pz: 30, svg: '<svg viewBox="0 0 170 130"><ellipse cx="85" cy="124" rx="78" ry="7" fill="#000" opacity=".25"/><g><rect x="8" y="62" width="64" height="58" fill="#d93a4c"/><rect x="34" y="62" width="12" height="58" fill="#f4c96b"/><rect x="2" y="48" width="76" height="18" fill="#e84a5c"/><rect x="34" y="48" width="12" height="18" fill="#f4c96b"/><path d="M40 48C20 22 0 40 22 48ZM40 48C60 22 80 40 58 48Z" fill="#f4c96b"/></g><g><rect x="84" y="82" width="52" height="38" fill="#2f8f7a"/><rect x="104" y="82" width="12" height="38" fill="#fff"/><rect x="80" y="70" width="60" height="14" fill="#3aa28b"/><rect x="104" y="70" width="12" height="14" fill="#fff"/><path d="M110 70C94 50 80 62 98 70ZM110 70C126 50 140 62 122 70Z" fill="#fff"/></g><g transform="translate(150 120) rotate(14)"><path d="M0 0V-70Q0-92 -16-92Q-30-92-30-76" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M0 0V-70Q0-92 -16-92Q-30-92-30-76" fill="none" stroke="#d93a4c" stroke-width="9" stroke-linecap="round" stroke-dasharray="8 12"/></g></svg>' }
    ],
    halloween: [
      { px: -1.32, py: .5, ps: .44, pz: 40, svg: '<svg viewBox="0 0 150 130"><ellipse cx="75" cy="124" rx="68" ry="7" fill="#000" opacity=".4"/><g class="glow"><circle cx="75" cy="64" r="74" fill="#ff8a1f" opacity=".2"/></g><path d="M75 118C112 118 134 98 134 70 134 42 112 24 75 24S16 42 16 70C16 98 38 118 75 118Z" fill="#f2801a"/><path d="M75 24C55 24 40 42 40 70S55 118 75 118" fill="#d9600a" opacity=".55"/><path d="M75 24C95 24 110 42 110 70S95 118 75 118" fill="#ff9a35" opacity=".5"/><rect x="69" y="8" width="12" height="20" rx="4" fill="#3f6b2a"/><g class="glow" fill="#ffe07a"><path d="M42 58 62 58 52 76ZM108 58 88 58 98 76ZM38 88Q75 120 112 88L96 82 85 94 75 84 65 94 54 82Z"/></g></svg>' },
      { px: 1.3, py: .5, ps: .3, pz: 20, svg: '<svg viewBox="0 0 130 190"><ellipse cx="65" cy="184" rx="58" ry="7" fill="#000" opacity=".4"/><ellipse cx="65" cy="170" rx="56" ry="10" fill="#4a3a2a"/><g><rect x="22" y="90" width="22" height="78" fill="#f1e6cf"/><rect x="54" y="60" width="24" height="108" fill="#f6efe0"/><rect x="88" y="104" width="20" height="64" fill="#ebdfc6"/><path d="M54 76Q56 96 62 80T78 76V60H54Z" fill="#fffaf0"/></g><g class="flame"><path d="M33 86C22 72 33 62 33 50 40 62 44 74 33 86Z" fill="#ffb347"/></g><g class="flame" style="animation-delay:-.2s"><path d="M66 56C54 40 66 30 66 16 74 30 78 44 66 56Z" fill="#ffb347"/><path d="M66 54C60 44 66 38 66 30 70 38 72 46 66 54Z" fill="#fff3a0"/></g><g class="flame" style="animation-delay:-.35s"><path d="M98 100C88 88 98 80 98 68 104 80 108 90 98 100Z" fill="#ffb347"/></g><g class="glow"><circle cx="66" cy="44" r="46" fill="#ffb347" opacity=".22"/></g></svg>' },
      { px: .92, py: .02, ps: .2, pz: -90, svg: '<svg viewBox="0 0 90 110" class="bob"><circle cx="45" cy="55" r="62" fill="#b9ffcf" opacity=".12"/><path d="M12 100V46C12 6 78 6 78 46V100L65 89 53 103 41 90 29 103Z" fill="#f4f0ff" fill-opacity=".85"/><ellipse cx="34" cy="48" rx="5.5" ry="8.5" fill="#1b1026"/><ellipse cx="56" cy="48" rx="5.5" ry="8.5" fill="#1b1026"/><ellipse cx="45" cy="70" rx="6" ry="8" fill="#1b1026"/></svg>' },
      { px: -.55, py: -.36, ps: .1, pz: 60, svg: '<svg viewBox="-30 -400 60 440" style="overflow:visible">' + SPIDER(400) + '</svg>' }
    ],
  };

  /* ---- décors posés sur la couverture ---- */
  const COVER = {
    christmas: `<svg viewBox="0 0 200 278" preserveAspectRatio="none"><path d="M0 0H200V12Q190 26 180 14T160 16 140 12 120 20 100 12 80 20 60 12 40 20 20 14 8 22 0 14Z" fill="#f4fbff"/>
      <g transform="translate(100 6)"><path d="M0 0C-26-26-46-8-22 4ZM0 0C26-26 46-8 22 4Z" fill="#f4c96b"/><path d="M0 0C-16 22-26 34-34 40M0 0C16 22 26 34 34 40" stroke="#f4c96b" stroke-width="6" fill="none"/><circle r="7" fill="#e0a93a"/></g>
      <g><line x1="34" y1="16" x2="34" y2="60" stroke="#f4c96b" stroke-width="1.2"/><circle class="twk" cx="34" cy="70" r="11" fill="#ff4d5e"/><rect x="31" y="56" width="6" height="5" fill="#f4c96b"/></g><g><line x1="168" y1="16" x2="168" y2="46" stroke="#f4c96b" stroke-width="1.2"/><circle class="twk" cx="168" cy="55" r="9" fill="#6fb4ff"/><rect x="165.5" y="43" width="5" height="4" fill="#f4c96b"/></g>
      <g transform="translate(170 250)"><path d="M0 0C-20-6-36-22-44-34 -28-36-10-26 0 0Z M0 0C14-14 30-18 44-14 36 2 16 6 0 0Z M0 0C-4-22-2-38 6-50 18-40 14-18 0 0Z" fill="#2f8f5b"/><circle cx="-4" cy="-6" r="6" fill="#d93a4c"/><circle cx="8" cy="-4" r="6" fill="#d93a4c"/><circle cx="2" cy="6" r="6" fill="#d93a4c"/></g>
      <g transform="translate(26 252) scale(-1 1)"><path d="M0 0C-20-6-36-22-44-34 -28-36-10-26 0 0Z M0 0C14-14 30-18 44-14 36 2 16 6 0 0Z" fill="#2f8f5b"/><circle cx="-4" cy="-4" r="6" fill="#d93a4c"/><circle cx="8" cy="-2" r="6" fill="#d93a4c"/></g></svg>`,
    halloween: `<svg viewBox="0 0 200 278" preserveAspectRatio="none"><g transform="translate(200 0) scale(-1 1)"><svg width="118" height="118" viewBox="0 0 100 100" fill="none" stroke="#f1e8ff" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"><path d="M0 0H100M0 0V100M0 0 98 98M0 0 96 40M0 0 40 96"/><path d="M18 0Q18 18 0 18M36 0Q38 38 0 36M56 0Q58 58 0 56M78 0Q80 80 0 78M20 8Q32 22 8 24M42 18Q60 42 18 42M64 30Q82 60 30 62"/></svg></g>
      <g transform="translate(46 0)">${SPIDER(120).replace(/<g class="spd">/, '<g class="spd" style="animation-duration:5s">')}</g>
      <g stroke-linecap="round" fill="none" style="filter:drop-shadow(0 0 5px #ff6a1a)"><path d="M22 196Q56 224 90 262" stroke="#ff8a1f" stroke-width="3.5"/><path d="M36 188Q70 216 104 254" stroke="#ff8a1f" stroke-width="3"/><path d="M12 206Q44 232 74 266" stroke="#ff8a1f" stroke-width="3"/></g>
      <g class="twk"><ellipse cx="148" cy="264" rx="5" ry="3.5" fill="#ffe07a"/><ellipse cx="164" cy="264" rx="5" ry="3.5" fill="#ffe07a"/></g></svg>`,
  };

  /* ---- coins d'ornement sur les pages intérieures du livre ---- */
  const CORNER = {
    christmas: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><path d='M80 0C60 4 44 16 34 34 52 30 70 20 80 0Z M80 0C74 22 64 40 46 50 50 32 62 14 80 0Z' fill='#2f8f5b'/><circle cx='64' cy='22' r='5.5' fill='#d93a4c'/><circle cx='54' cy='30' r='5.5' fill='#d93a4c'/><circle cx='60' cy='36' r='5' fill='#d93a4c'/></svg>",
    halloween: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='#3a2a55' stroke-opacity='.55' stroke-width='1' stroke-linecap='round'><path d='M100 0H0M100 0V100M100 0 2 98M100 0 4 40M100 0 60 96'/><path d='M82 0Q82 18 100 18M64 0Q62 38 100 36M44 0Q42 58 100 56M22 0Q20 80 100 78M80 8Q68 22 92 24M58 18Q40 42 82 42'/></svg>",
  };

/* ====================================================================== */
  /*  NOUVEL AN · ANNIVERSAIRE (dessins)                                      */
  /* ====================================================================== */
  const NYEAR = (() => { const d = new Date(); return d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear(); })();
  const mkr = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const CONF = ['#f5c75a', '#ff4fa3', '#55d6ff', '#ffffff', '#9b7bff', '#7dffb2'];
  const BCOL = ['#ff5fa8', '#ffd84a', '#4fd8ff', '#8e6bff', '#5be3a1', '#ff8a4d'];
  const star5 = (cx, cy, R, f, rot = 0) => { let p = ''; for (let i = 0; i < 10; i++) { const rr = i % 2 ? R * .45 : R, a = Math.PI / 5 * i - Math.PI / 2 + rot; p += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); } return `<path d="${p}Z" fill="${f}"/>`; };
  const sparkle = (cx, cy, r, f) => `<path d="M${cx} ${cy - r}L${cx + r * .22} ${cy - r * .22} ${cx + r} ${cy} ${cx + r * .22} ${cy + r * .22} ${cx} ${cy + r} ${cx - r * .22} ${cy + r * .22} ${cx - r} ${cy} ${cx - r * .22} ${cy - r * .22}Z" fill="${f}"/>`;
  const balloonSvg = (x, y, rx, ry, c) => `<path d="M${x} ${y + ry - 1}L${x - 5} ${y + ry + 7}H${x + 5}Z" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#nvBalShade)"/><ellipse cx="${x - rx * .4}" cy="${y - ry * .4}" rx="${rx * .17}" ry="${ry * .28}" fill="#fff" opacity=".55" transform="rotate(24 ${x - rx * .4} ${y - ry * .4})"/>`;

  /* dégradés partagés par tous les dessins des nouvelles éditions */
  const GLOBAL_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="nvBalShade" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
    <linearGradient id="nvGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3bf"/><stop offset=".45" stop-color="#f5c75a"/><stop offset="1" stop-color="#b98524"/></linearGradient>
    <radialGradient id="nvSilver" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#cfd6ee"/><stop offset="1" stop-color="#7e89b4"/></radialGradient>
    <linearGradient id="nvBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3bf" stop-opacity=".34"/><stop offset="1" stop-color="#fff3bf" stop-opacity="0"/></linearGradient>
    <linearGradient id="nvBeamP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5fa8" stop-opacity=".5"/><stop offset="1" stop-color="#ff5fa8" stop-opacity="0"/></linearGradient>
    <linearGradient id="nvBeamC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fd8ff" stop-opacity=".45"/><stop offset="1" stop-color="#4fd8ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="nvBeamY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd84a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></linearGradient>
  </defs></svg>`;

  /* ---------------------------- NOUVEL AN ------------------------------- */
  function topNewYear() {
    const w = innerWidth, seg = Math.max(150, w / 9), n = Math.ceil(w / seg), r = mkr(11);
    let wire = 'M0 2', it = '';
    for (let i = 0; i < n; i++) {
      const x0 = i * seg, x1 = x0 + seg, cx = x0 + seg / 2, sag = 22;
      wire += `Q${cx} ${2 + sag} ${x1} 2`;
      const at = t => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * 2 + 2 * (1 - t) * t * (2 + sag) + t * t * 2];
      const [bx, by] = at(.5);
      it += `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})"><g class="twk" style="animation-delay:${-(i * .43 % 2).toFixed(2)}s"><line x1="0" y1="0" x2="0" y2="17" stroke="#c9a13a" stroke-width="1.4"/><circle cy="31" r="22" fill="#fff3bf" opacity=".1"/><circle cy="31" r="14" fill="url(#nvSilver)"/><path d="M-14 31H14M-12 25H12M-12 37H12M0 17V45M-6 18V44M6 18V44" stroke="#6d789e" stroke-width=".7" fill="none"/>${sparkle(5, 26, 5, '#fff')}</g></g>`;
      [[.2, 8, '#f5c75a', 10], [.8, 6.5, '#ffe38a', 8]].forEach(([t, R, f, L]) => { const [x, y] = at(t); it += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><line y2="${L}" stroke="#c9a13a" stroke-width="1.2"/>${star5(0, L + R * .8, R, f)}</g>`; });
    }
    const fr = (x0, d) => { let s = ''; const m = Math.min(22, Math.floor(w / 60)); for (let i = 0; i < m; i++) { const x = x0 + d * i * 7, len = 64 + (m - i) * 3 + r() * 16; s += `<line x1="${x}" y1="0" x2="${(x + d * r() * 5).toFixed(1)}" y2="${len.toFixed(0)}" stroke="${i % 3 ? '#f5c75a' : '#fff3bf'}" stroke-width="2.2" stroke-linecap="round" opacity="${(.92 - i * .02).toFixed(2)}"/><circle class="twk" style="animation-delay:${-(r() * 2).toFixed(2)}s" cx="${x}" cy="${len.toFixed(0)}" r="2.3" fill="#fff"/>`; } return s; };
    return `<svg viewBox="0 0 ${w} 140" width="${w}" height="140"><path d="${wire}" fill="none" stroke="#c9a13a" stroke-width="2.2"/>${it}${fr(0, 1)}${fr(w, -1)}</svg>`;
  }

  function heroNewYear() {
    const fwb = (cx, cy, R, c1, c2, dl, d = 5.2) => {
      let s = ''; const n = 18;
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.2832, ca = Math.cos(a), sa = Math.sin(a);
        s += `<line x1="${(cx + ca * R * .25).toFixed(1)}" y1="${(cy + sa * R * .25).toFixed(1)}" x2="${(cx + ca * R * .82).toFixed(1)}" y2="${(cy + sa * R * .82).toFixed(1)}" stroke="${c1}" stroke-width="3" stroke-linecap="round"/><circle cx="${(cx + ca * R).toFixed(1)}" cy="${(cy + sa * R).toFixed(1)}" r="4.5" fill="${i % 2 ? c2 : c1}"/>`;
        if (i % 2) s += `<circle cx="${(cx + ca * R * .6).toFixed(1)}" cy="${(cy + sa * R * .6).toFixed(1)}" r="2.2" fill="${c2}"/>`;
      }
      return `<g class="nv-fw" style="--dl:${dl}s;--d:${d}s;transform-origin:${cx}px ${cy}px">${s}</g>`;
    };
    const city = (seed, y0, hMin, hMax, fill, win) => {
      const r = mkr(seed); let x = -10, s = '', w = '';
      while (x < 1620) {
        const bw = 40 + r() * 70, bh = hMin + r() * (hMax - hMin);
        s += `<rect x="${x.toFixed(0)}" y="${(y0 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}"/>`;
        if (r() < .25) s += `<rect x="${(x + bw / 2 - 2).toFixed(0)}" y="${(y0 - bh - 26).toFixed(0)}" width="4" height="26"/>`;
        if (win) for (let yy = y0 - bh + 12; yy < y0 - 10; yy += 16) for (let xx = x + 8; xx < x + bw - 10; xx += 14) if (r() < .3) w += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="6" height="8"${r() < .18 ? ' class="twk"' : ''}/>`;
        x += bw + r() * 6;
      }
      return `<g fill="${fill}">${s}</g>` + (win ? `<g fill="#ffd36b" opacity=".85">${w}</g>` : '');
    };
    const ticks = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${(Math.sin(a) * 42).toFixed(1)}" y1="${(-404 - Math.cos(a) * 42).toFixed(1)}" x2="${(Math.sin(a) * 49).toFixed(1)}" y2="${(-404 - Math.cos(a) * 49).toFixed(1)}" stroke="#1a1a2e" stroke-width="${i % 3 ? 2 : 4}"/>`; }).join('');
    const tower = `<g transform="translate(1180 664) scale(.82)"><path d="M-52 0V-340H52V0Z" fill="#0b0f2e"/><path d="M-38 0V-330M38 0V-330" stroke="#1a2154" stroke-width="3"/><rect x="-56" y="-346" width="112" height="7" fill="#f5c75a" opacity=".85"/>
      <g class="glow"><circle cy="-404" r="118" fill="#ffd36b" opacity=".2"/></g>
      <rect x="-66" y="-472" width="132" height="132" rx="6" fill="#0d1236" stroke="#f5c75a" stroke-width="3"/>
      <circle cy="-404" r="52" fill="#fff8e6" stroke="#f5c75a" stroke-width="6"/>${ticks}
      <path d="M0 -404 -1.6 -436" stroke="#1a1a2e" stroke-width="5.5" stroke-linecap="round"/><path d="M0 -404V-448" stroke="#1a1a2e" stroke-width="3.5" stroke-linecap="round"/>
      <g><line x1="0" y1="-404" x2="0" y2="-452" stroke="#e8364f" stroke-width="2"/><circle cy="-404" r="4" fill="#e8364f"/><animateTransform attributeName="transform" type="rotate" from="0 0 -404" to="360 0 -404" dur="60s" repeatCount="indefinite"/></g>
      <path d="M-78 -472 0 -566 78 -472Z" fill="#0b0f2e" stroke="#f5c75a" stroke-width="2"/><path d="M-3 -566V-606H3V-566Z" fill="#f5c75a"/><g class="glow">${sparkle(0, -620, 18, '#ffe38a')}</g>
      <path d="M-70 -470V-500L-58 -516 -46 -500V-470Z M46 -470V-500L58 -516 70 -500V-470Z" fill="#0b0f2e" stroke="#f5c75a" stroke-width="1.6"/></g>`;
    const rr = mkr(77); let refl = ''; for (let i = 0; i < 26; i++) refl += `<rect x="${(rr() * 1600).toFixed(0)}" y="${(694 + rr() * 8).toFixed(0)}" width="${(2 + rr() * 3).toFixed(1)}" height="${(10 + rr() * 14).toFixed(0)}" fill="${i % 3 ? '#ffd36b' : '#ff4fa3'}" opacity="${(.25 + rr() * .35).toFixed(2)}"/>`;
    return `<div class="nv-sky"></div>
      <div class="nv-stars" style="background-image:radial-gradient(1.3px 1.3px at 10% 14%,#fff,transparent),radial-gradient(1px 1px at 28% 24%,#fff,transparent),radial-gradient(1.5px 1.5px at 44% 10%,#ffeec0,transparent),radial-gradient(1px 1px at 62% 28%,#fff,transparent),radial-gradient(1.3px 1.3px at 78% 12%,#dff0ff,transparent),radial-gradient(1px 1px at 92% 26%,#fff,transparent),radial-gradient(1px 1px at 36% 6%,#fff,transparent);background-size:480px 340px"></div>
      <div class="nv-bokeh"></div>
      <svg viewBox="0 0 1600 720" preserveAspectRatio="xMidYMax slice">
        <g class="nv-sweep" style="transform-origin:260px 664px"><path d="M260 664 200 -60H340Z" fill="url(#nvBeam)"/></g>
        <g class="nv-sweep r" style="transform-origin:1460px 664px"><path d="M1460 664 1400 -60H1540Z" fill="url(#nvBeam)"/></g>
        ${fwb(1010, 170, 120, '#ffd36b', '#fff3bf', 0)}${fwb(1390, 290, 96, '#ff4fa3', '#ffc2e0', 1.7)}${fwb(1230, 400, 84, '#55d6ff', '#d6f6ff', 3.1)}${fwb(1520, 120, 70, '#b79bff', '#e7ddff', 4.3, 6)}${fwb(880, 96, 74, '#ffd36b', '#ffffff', 2.4, 6)}
        ${city(5, 664, 90, 250, '#141a45', false)}${tower}${city(9, 692, 40, 150, '#070a22', true)}
        <path d="M0 692H1600V720H0Z" fill="#04051a"/>${refl}
      </svg>`;
  }

  function footNewYear() {
    const r = mkr(21);
    let conf = ''; for (let i = 0; i < 120; i++) conf += `<g transform="translate(${(r() * 1600).toFixed(0)} ${(190 + r() * 34).toFixed(0)}) rotate(${(r() * 180).toFixed(0)})"><rect x="-4" y="-1.3" width="${(6 + r() * 4).toFixed(1)}" height="2.6" fill="${CONF[(r() * CONF.length) | 0]}" opacity=".9"/></g>`;
    const flute = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-10 -78H10Q13 -34 4.5 -12V-2H11V3H-11V-2H-4.5V-12Q-13 -34 -10 -78Z" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".75" stroke-width="1.4"/><path d="M-9 -62H9Q11 -34 3.6 -13H-3.6Q-11 -34 -9 -62Z" fill="#f6d77b" opacity=".92"/>${[[-3, -20, 0], [2, -30, .7], [-1, -40, 1.3], [4, -24, 1.9], [-4, -48, .4], [1, -54, 1.6]].map(([a, b, d]) => `<circle class="nv-bub" style="animation-delay:${-d}s" cx="${a}" cy="${b}" r="1.6" fill="#fff"/>`).join('')}<path d="M-6 -70Q-8 -40 -2 -20" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none"/></g>`;
    const bucket = `<g transform="translate(150 214)"><g transform="translate(-12 -60) rotate(-8)"><path d="M-11 0V-62Q-11 -78 -5 -90V-118H5V-90Q11 -78 11 -62V0Z" fill="#13321f"/><path d="M-5 -118H5V-132H-5Z" fill="#f5c75a"/><rect x="-11" y="-52" width="22" height="26" fill="#f6e7b8"/>${sparkle(0, -39, 6, '#c9a13a')}<path d="M-8 -70Q-8 -50 -8 -8" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/></g>
      <g class="twk"><circle cx="-24" cy="-204" r="4" fill="#fff"/><circle cx="-14" cy="-214" r="3" fill="#fff"/><circle cx="-30" cy="-194" r="2.6" fill="#fff"/><circle cx="-8" cy="-200" r="2" fill="#fff"/></g>
      <g class="bob"><rect x="-44" y="-232" width="8" height="11" rx="2" fill="#d8b277" transform="rotate(32 -40 -226)"/></g>
      <path d="M-46 -64H46L38 0H-38Z" fill="#aeb8d6"/><path d="M-46 -64H46L44 -52H-44Z" fill="#e3e8f8"/><path d="M-42 -32H42" stroke="#f5c75a" stroke-width="4"/>
      <rect x="-32" y="-72" width="16" height="12" rx="3" fill="#dff6ff" opacity=".9" transform="rotate(-10 -24 -66)"/><rect x="-6" y="-74" width="16" height="12" rx="3" fill="#dff6ff" opacity=".9" transform="rotate(8 2 -68)"/><rect x="18" y="-71" width="15" height="11" rx="3" fill="#dff6ff" opacity=".9"/></g>`;
    const digits = String(NYEAR).split('').map((d, i) => `<g transform="translate(${1110 + i * 92} 0) rotate(${[-7, 4, -3, 8][i % 4]} 0 150)"><g class="bob" style="animation-delay:${-i * .6}s"><path d="M0 100Q-8 150 4 214" stroke="#f5c75a" stroke-opacity=".8" stroke-width="1.6" fill="none"/><text x="0" y="86" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-weight="900" font-size="108" fill="url(#nvGold)" stroke="#8a5f12" stroke-width="2.5" paint-order="stroke">${d}</text><text x="-3" y="82" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-weight="900" font-size="108" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.1">${d}</text></g></g>`).join('');
    return `<svg viewBox="0 0 1600 230" preserveAspectRatio="xMidYMax slice">
      <path d="M0 196Q400 184 800 194T1600 188V230H0Z" fill="#0a0e2e"/><path d="M0 206Q400 194 800 204T1600 198V230H0Z" fill="#070a24"/>
      <path d="M0 205Q180 190 380 208T820 200T1200 206T1600 196" stroke="#ff4fa3" stroke-width="4" fill="none" opacity=".75"/><path d="M0 212Q260 200 520 214T1040 208T1600 214" stroke="#55d6ff" stroke-width="3.5" fill="none" opacity=".7"/><path d="M0 200Q300 214 700 204T1600 210" stroke="#f5c75a" stroke-width="3" fill="none" opacity=".8"/>
      ${conf}${bucket}${flute(300, 214, -12)}${flute(338, 214, 12)}<g class="twk">${sparkle(319, 126, 13, '#fff3bf')}</g>${digits}
      <path d="M0 222H1600V230H0Z" fill="#05071c"/></svg>`;
  }

  /* ---------------------------- ANNIVERSAIRE ---------------------------- */
  function topBirthday() {
    const w = innerWidth, seg = Math.max(140, w / 9), n = Math.ceil(w / seg);
    let wire = 'M0 2', fl = '', k = 0;
    for (let i = 0; i < n; i++) {
      const x0 = i * seg, x1 = x0 + seg, cx = x0 + seg / 2, sag = 26;
      wire += `Q${cx} ${2 + sag} ${x1} 2`;
      for (let j = 1; j <= 5; j++) {
        const t = j / 6, x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * 2 + 2 * (1 - t) * t * (2 + sag) + t * t * 2, c = BCOL[k % BCOL.length], deco = k % 3;
        fl += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((t - .5) * -20).toFixed(1)})"><path d="M-14 0H14L0 36Z" fill="${c}"/>${deco === 0 ? '<circle cx="-4" cy="9" r="2.2" fill="#fff" opacity=".85"/><circle cx="5" cy="9" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="20" r="2.2" fill="#fff" opacity=".85"/>' : deco === 1 ? '<path d="M-10 6H10M-7 13H7M-3.5 20H3.5" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>' : '<path d="M0 8 1.8 13 7 13.4 3 16.6 4.4 22 0 19-4.4 22-3 16.6-7 13.4-1.8 13Z" fill="#fff" opacity=".85"/>'}<path d="M-14 0H14L12 5H-12Z" fill="#fff" opacity=".28"/></g>`;
        k++;
      }
    }
    const curl = (x, d, c, len) => `<path d="M${x} 0C${x + d * 14} 12 ${x - d * 14} 24 ${x} 36S${x + d * 14} 60 ${x} 72S${x - d * 12} 96 ${x} ${len}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 ${w} 130" width="${w}" height="130"><path d="${wire}" fill="none" stroke="#f3e6ff" stroke-opacity=".8" stroke-width="2"/>${fl}${curl(26, 1, '#ff5fa8', 108)}${curl(52, -1, '#4fd8ff', 88)}${curl(w - 26, -1, '#ffd84a', 108)}${curl(w - 52, 1, '#5be3a1', 88)}</svg>`;
  }

  const cluster = (cx, cy, sc, cols, dl) => {
    const bl = [[-4, -150, 30, 38], [-40, -122, 28, 35], [34, -126, 28, 36], [-16, -190, 26, 33], [22, -184, 27, 34]];
    let s = '';
    bl.forEach(([x, y, , ry]) => { s += `<path d="M${x} ${y + ry + 6}Q${(x * .4).toFixed(1)} ${((y + ry) / 2).toFixed(0)} 0 0" stroke="#fff" stroke-opacity=".6" stroke-width="1.5" fill="none"/>`; });
    bl.forEach(([x, y, rx, ry], i) => { s += balloonSvg(x, y, rx, ry, cols[i % cols.length]); });
    s += `<rect x="-12" y="-10" width="24" height="10" rx="2" fill="#ffd84a"/><path d="M0 -10C-9 -22-16 -8 0 -10C16 -8 9 -22 0 -10Z" fill="#ff5fa8"/>`;
    return `<g transform="translate(${cx} ${cy}) scale(${sc})"><g class="nv-sway" style="animation-delay:${dl}s">${s}</g></g>`;
  };
  const giftBox = (x, y, w, h, c, rb) => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="3" fill="${c}"/><rect x="-5" y="${-h}" width="10" height="${h}" fill="${rb}"/><rect x="${-w / 2 - 3}" y="${-h - 12}" width="${w + 6}" height="14" rx="3" fill="${c}" stroke="#00000022"/><rect x="-5" y="${-h - 12}" width="10" height="14" fill="${rb}"/><path d="M0 ${-h - 12}C-18 ${-h - 34} -34 ${-h - 14} -10 ${-h - 12}ZM0 ${-h - 12}C18 ${-h - 34} 34 ${-h - 14} 10 ${-h - 12}Z" fill="${rb}"/></g>`;
  const confFloor = (seed, n, y0, y1) => { const r = mkr(seed); let s = ''; for (let i = 0; i < n; i++) { const c = BCOL[(r() * BCOL.length) | 0]; s += `<g transform="translate(${(r() * 1600).toFixed(0)} ${(y0 + r() * (y1 - y0)).toFixed(0)}) rotate(${(r() * 180).toFixed(0)})">${r() < .3 ? `<circle r="3" fill="${c}"/>` : `<rect x="-4" y="-1.5" width="8" height="3" fill="${c}"/>`}</g>`; } return s; };

  function heroBirthday() {
    const streamer = (x, c, len, dl) => { let p = `M${x} 0`, y = 0, a = 10; while (y < len) { p += `Q${x + (a > 0 ? 14 : -14)} ${y + 15} ${x} ${y + 30}`; y += 30; a = -a; } return `<g class="nv-sway" style="transform-origin:${x}px 0;animation-delay:${dl}s"><path d="${p}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".92"/></g>`; };
    const tier = (w, h, y, c, d) => `<rect x="${-w / 2}" y="${y - h}" width="${w}" height="${h}" rx="8" fill="${c}"/><path d="M${-w / 2} ${y - h}H${w / 2}V${y - h + 10}${Array.from({ length: 7 }, (_, i) => `Q${(w / 2 - (i + .5) * w / 7).toFixed(0)} ${y - h + 10 + (i % 2 ? 16 : 6)} ${(w / 2 - (i + 1) * w / 7).toFixed(0)} ${y - h + 10}`).join('')}Z" fill="${d}"/>`;
    const candles = [-30, -10, 10, 30].map((x, i) => `<rect x="${x - 2.5}" y="-232" width="5" height="26" rx="1.5" fill="${BCOL[i + 1]}"/><circle cx="${x}" cy="-244" r="14" fill="#ffd36b" opacity=".25" class="glow"/><ellipse class="flame" style="animation-delay:${-i * .17}s" cx="${x}" cy="-240" rx="3.6" ry="7.5" fill="#ffc83a"/><ellipse cx="${x}" cy="-238" rx="1.8" ry="4" fill="#fff6c4"/>`).join('');
    const cake = `<g transform="translate(700 664) scale(.92)"><ellipse cy="3" rx="150" ry="10" fill="#000" opacity=".35"/><rect x="-124" y="-14" width="248" height="14" rx="7" fill="#f5c75a"/>${tier(208, 68, -14, '#ff8fc0', '#fff')}${tier(152, 54, -82, '#8fe3ff', '#fff')}${tier(96, 46, -136, '#ffe27a', '#fff')}
      ${[[-70, -50, '#ffd84a'], [-30, -44, '#8e6bff'], [20, -52, '#4fd8ff'], [66, -46, '#ffd84a'], [-48, -108, '#ff5fa8'], [30, -112, '#ff5fa8'], [-10, -162, '#ff5fa8']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="9" height="3" rx="1.5" fill="${c}" transform="rotate(${x % 50} ${x} ${y})"/>`).join('')}${candles}</g>`;
    return `<div class="nv-sky"></div><div class="nv-bokeh"></div>
      <svg viewBox="0 0 1600 720" preserveAspectRatio="xMidYMax slice">
        <g class="nv-sweep" style="transform-origin:300px 0"><path d="M300 0 120 720H520Z" fill="url(#nvBeamP)"/></g>
        <g class="nv-sweep r" style="transform-origin:800px 0"><path d="M800 0 650 720H980Z" fill="url(#nvBeamC)"/></g>
        <g class="nv-sweep" style="transform-origin:1300px 0;animation-delay:-3s"><path d="M1300 0 1130 720H1480Z" fill="url(#nvBeamY)"/></g>
        ${streamer(150, '#ff5fa8', 300, 0)}${streamer(430, '#4fd8ff', 220, -1.2)}${streamer(1120, '#ffd84a', 260, -2.1)}${streamer(1420, '#5be3a1', 330, -.6)}${streamer(1560, '#8e6bff', 210, -1.8)}
        <path d="M0 664Q400 648 800 662T1600 656V720H0Z" fill="#2a1260"/>
        ${cake}${giftBox(1260, 668, 64, 52, '#4fd8ff', '#ffd84a')}${giftBox(1338, 668, 52, 40, '#ffd84a', '#ff5fa8')}${giftBox(1296, 604, 40, 34, '#8e6bff', '#4fd8ff')}
        ${cluster(1510, 672, 1, BCOL, 0)}${cluster(40, 676, .95, ['#ff5fa8', '#ffd84a', '#4fd8ff', '#5be3a1', '#8e6bff'], -2)}
        <path d="M0 692Q400 678 820 694T1600 686V720H0Z" fill="#1d0c48"/>${confFloor(41, 90, 694, 716)}
      </svg>`;
  }

  function footBirthday() {
    const cup = (x, c1, c2) => `<g transform="translate(${x} 214)"><path d="M-17 -28H17L12 0H-12Z" fill="${c1}"/><path d="M-9 -28 -6 0M0 -28V0M9 -28 6 0" stroke="#fff" stroke-opacity=".55" stroke-width="2"/><path d="M-19 -28Q-22 -44 -9 -46Q-12 -58 0 -60Q12 -58 9 -46Q22 -44 19 -28Z" fill="${c2}"/><circle cy="-64" r="5" fill="#ff3b5c"/><path d="M0 -69Q4 -74 9 -73" stroke="#4a8a3a" stroke-width="2" fill="none"/></g>`;
    const bunt = (() => { let s = '', p = 'M0 18Q400 54 800 22T1600 40'; for (let i = 0; i < 26; i++) { const x = 30 + i * 61, y = 22 + Math.sin(i * .5) * 8 + (i % 2) * 0, c = BCOL[i % BCOL.length]; s += `<path d="M${x - 14} ${y}H${x + 14}L${x} ${y + 34}Z" fill="${c}" opacity=".95"/>`; } return `<path d="${p}" stroke="#f3e6ff" stroke-opacity=".5" stroke-width="2" fill="none" opacity="0"/>`; })();
    return `<svg viewBox="0 0 1600 230" preserveAspectRatio="xMidYMax slice">
      <path d="M0 196Q400 184 800 194T1600 188V230H0Z" fill="#2a1260"/><path d="M0 208Q400 196 800 206T1600 200V230H0Z" fill="#1d0c48"/>
      ${confFloor(52, 120, 196, 226)}
      ${cluster(130, 218, .62, BCOL, -1)}${cluster(1480, 220, .62, ['#4fd8ff', '#ff5fa8', '#ffd84a', '#8e6bff', '#5be3a1'], -3)}
      ${giftBox(300, 216, 50, 40, '#ff5fa8', '#ffd84a')}${giftBox(362, 216, 40, 30, '#4fd8ff', '#ff5fa8')}${giftBox(1190, 216, 54, 44, '#ffd84a', '#8e6bff')}${giftBox(1256, 216, 38, 28, '#5be3a1', '#ff5fa8')}
      ${cup(700, '#ff8fc0', '#fff')}${cup(760, '#8fe3ff', '#ffe27a')}${cup(820, '#ffd84a', '#ff8fc0')}
      <path d="M0 222H1600V230H0Z" fill="#14072f"/></svg>`;
  }

  /* ----- accessoires du logo ----- */
  Object.assign(HAT, {
    newyear: '<svg viewBox="0 0 40 36"><ellipse cx="20" cy="30" rx="17" ry="4.5" fill="#12142e"/><path d="M9 29V8Q9 4 13 4H27Q31 4 31 8V29Z" fill="#171a3d"/><path d="M9 24H31V29H9Z" fill="#f5c75a"/><path d="M12 6V22" stroke="#4a4f9a" stroke-width="1.6" opacity=".6"/><path d="M34 5 35.6 9.4 40 11 35.6 12.6 34 17 32.4 12.6 28 11 32.4 9.4Z" fill="#ffe38a"/></svg>',
    birthday: '<svg viewBox="0 0 40 36"><path d="M7 33 20 3 33 33Z" fill="#ff5fa8"/><path d="M12.5 22H28L31 28H9.5Z" fill="#ffd84a"/><circle cx="16" cy="14" r="1.6" fill="#fff"/><circle cx="22" cy="18" r="1.6" fill="#fff"/><path d="M4 33Q20 38 36 33" stroke="#4fd8ff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="20" cy="3" r="4.2" fill="#ffd84a"/></svg>'
  });

  /* ----- props 3D autour du livre ----- */
  const FLUTE_P = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-12 -92H12Q16 -40 5.4 -14V-2H13V4H-13V-2H-5.4V-14Q-16 -40 -12 -92Z" fill="#fff" fill-opacity=".15" stroke="#fff" stroke-opacity=".8" stroke-width="1.6"/><path d="M-10.8 -74H10.8Q13 -40 4.3 -15H-4.3Q-13 -40 -10.8 -74Z" fill="#f6d77b"/>${[[-3, -22, 0], [3, -34, .6], [-2, -46, 1.2], [5, -28, 1.8], [-5, -58, .3], [2, -64, 1.5]].map(([a, b, d]) => `<circle class="nv-bub" style="animation-delay:${-d}s" cx="${a}" cy="${b}" r="1.9" fill="#fff"/>`).join('')}<path d="M-7 -84Q-9 -46 -2 -24" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/></g>`;
  const discoTiles = (() => { const r = mkr(5); let s = ''; for (let i = 0; i < 46; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 33; s += `<rect x="${(45 + Math.cos(a) * d - 3).toFixed(1)}" y="${(86 + Math.sin(a) * d - 3).toFixed(1)}" width="6" height="6" fill="${['#fff', '#cfd6ee', '#ff9ad0', '#8fe3ff', '#ffe38a'][(r() * 5) | 0]}" opacity="${(.35 + r() * .5).toFixed(2)}"/>`; } return s; })();
  const PROPS_NY = [
    { px: -1.34, py: .5, ps: .44, pz: 30, svg: `<svg viewBox="0 -16 130 216"><ellipse cx="65" cy="192" rx="52" ry="8" fill="#000" opacity=".3"/><g transform="translate(0 0)"><g transform="translate(53 118) rotate(-8)"><path d="M-11 0V-62Q-11 -78 -5 -90V-118H5V-90Q11 -78 11 -62V0Z" fill="#13321f"/><path d="M-5 -118H5V-132H-5Z" fill="#f5c75a"/><rect x="-11" y="-52" width="22" height="26" fill="#f6e7b8"/>${sparkle(0, -39, 6, '#c9a13a')}<path d="M-8 -70Q-8 -50 -8 -8" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/></g></g><g class="twk"><circle cx="37" cy="-14" r="4" fill="#fff"/><circle cx="47" cy="-24" r="3" fill="#fff"/><circle cx="31" cy="-4" r="2.6" fill="#fff"/><circle cx="55" cy="-10" r="2" fill="#fff"/></g><g class="bob"><rect x="16" y="-26" width="9" height="12" rx="2" fill="#d8b277" transform="rotate(32 20 -20)"/></g><path d="M20 122H110L100 188H30Z" fill="#aeb8d6"/><path d="M20 122H110L108 134H22Z" fill="#e3e8f8"/><path d="M24 152H106" stroke="#f5c75a" stroke-width="5"/><rect x="32" y="114" width="20" height="14" rx="3" fill="#dff6ff" opacity=".92" transform="rotate(-10 42 121)"/><rect x="58" y="112" width="20" height="14" rx="3" fill="#dff6ff" opacity=".92" transform="rotate(8 68 119)"/><rect x="84" y="115" width="19" height="13" rx="3" fill="#dff6ff" opacity=".92"/></svg>` },
    { px: 1.3, py: .5, ps: .46, pz: 30, svg: `<svg viewBox="0 -6 170 150"><ellipse cx="85" cy="134" rx="70" ry="7" fill="#000" opacity=".3"/>${FLUTE_P(52, 130, -14)}${FLUTE_P(116, 130, 14)}<g class="twk">${sparkle(84, 28, 16, '#fff3bf')}${sparkle(66, 14, 7, '#ffe38a')}${sparkle(104, 10, 8, '#fff')}</g></svg>` },
    { px: .92, py: .02, ps: .2, pz: -90, svg: `<svg viewBox="0 0 90 140" class="bob"><defs><clipPath id="nvDcp"><circle cx="45" cy="86" r="36"/></clipPath></defs><line x1="45" y1="0" x2="45" y2="50" stroke="#c9a13a" stroke-width="2"/><circle cx="45" cy="86" r="58" fill="#fff3bf" opacity=".1"/><circle cx="45" cy="86" r="36" fill="url(#nvSilver)"/><g clip-path="url(#nvDcp)">${discoTiles}<g stroke="#6d789e" stroke-width="1" fill="none"><path d="M9 70H81M9 86H81M9 102H81"/><ellipse cx="45" cy="86" rx="14" ry="36"/><ellipse cx="45" cy="86" rx="26" ry="36"/></g></g><g class="twk">${sparkle(30, 70, 10, '#fff')}${sparkle(62, 100, 7, '#fff')}${sparkle(70, 62, 5, '#ffe38a')}</g></svg>` },
    { px: -.55, py: -.36, ps: .13, pz: 60, svg: `<svg viewBox="0 0 70 118" class="bob"><path d="M35 72Q30 92 38 114" stroke="#f5c75a" stroke-width="1.6" fill="none"/><path d="${(() => { let p = ''; for (let i = 0; i < 10; i++) { const rr = i % 2 ? 14 : 34, a = Math.PI / 5 * i - Math.PI / 2; p += (i ? 'L' : 'M') + (35 + Math.cos(a) * rr).toFixed(1) + ' ' + (38 + Math.sin(a) * rr).toFixed(1); } return p + 'Z'; })()}" fill="url(#nvGold)" stroke="#b98524" stroke-width="2"/><path d="M26 22 35 12 44 22" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/></svg>` }
  ];
  const PROPS_BD = [
    { px: -1.32, py: .5, ps: .4, pz: 40, svg: `<svg viewBox="-70 -230 140 250" style="overflow:visible"><ellipse cx="0" cy="8" rx="40" ry="6" fill="#000" opacity=".3"/><g class="bob">${cluster(0, 0, 1, BCOL, 0).replace(/^<g transform="translate\(0 0\) scale\(1\)">/, '<g>')}</g></svg>` },
    { px: 1.3, py: .5, ps: .44, pz: 20, svg: `<svg viewBox="-80 -190 160 200"><ellipse cx="0" cy="6" rx="70" ry="7" fill="#000" opacity=".3"/><rect x="-70" y="-6" width="140" height="10" rx="5" fill="#f5c75a"/><rect x="-60" y="-58" width="120" height="52" rx="8" fill="#ff8fc0"/><path d="M-60 -58H60V-48Q54 -40 48 -50T36 -48 24 -40 12 -50 0 -42-12 -50-24 -40-36 -50-48 -42-54 -50Z" fill="#fff"/><rect x="-42" y="-100" width="84" height="42" rx="8" fill="#8fe3ff"/><path d="M-42 -100H42V-90Q36 -82 30 -92T18 -90 6 -82-6 -92-18 -82-30 -92-36 -86Z" fill="#fff"/>${[-24, -8, 8, 24].map((x, i) => `<rect x="${x - 2.5}" y="-128" width="5" height="26" rx="1.5" fill="${BCOL[i + 1]}"/><circle cx="${x}" cy="-138" r="12" fill="#ffd36b" opacity=".25" class="glow"/><ellipse class="flame" style="animation-delay:${-i * .17}s" cx="${x}" cy="-136" rx="3.6" ry="7.5" fill="#ffc83a"/><ellipse cx="${x}" cy="-134" rx="1.8" ry="4" fill="#fff6c4"/>`).join('')}${[[-48, -34, '#ffd84a'], [-16, -28, '#8e6bff'], [30, -36, '#4fd8ff'], [-20, -80, '#ff5fa8'], [16, -84, '#ffd84a']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="8" height="3" rx="1.5" fill="${c}"/>`).join('')}</svg>` },
    { px: .92, py: .02, ps: .22, pz: -90, svg: `<svg viewBox="0 0 100 100" class="bob">${giftBox(50, 96, 66, 56, '#8e6bff', '#ffd84a')}<g class="twk">${sparkle(14, 20, 8, '#fff')}${sparkle(90, 34, 6, '#ffd84a')}</g></svg>` },
    { px: -.55, py: -.36, ps: .14, pz: 60, svg: `<svg viewBox="0 0 80 100" class="bob"><g transform="rotate(-14 40 60)"><path d="M10 92 40 8 70 92Z" fill="#ff5fa8"/><path d="M20 66H60L66 82H14Z" fill="#ffd84a"/><circle cx="32" cy="42" r="3.4" fill="#fff"/><circle cx="46" cy="52" r="3.4" fill="#fff"/><path d="M6 92Q40 104 74 92" stroke="#4fd8ff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="40" cy="8" r="9" fill="#ffd84a"/></g></svg>` }
  ];
  PROPS.newyear = PROPS_NY; PROPS.birthday = PROPS_BD;

  /* ----- décors posés sur la couverture ----- */
  COVER.newyear = (() => {
    const r = mkr(3); let tin = '', cf = '';
    for (let x = 4; x < 200; x += 6.5) { const len = 14 + r() * 22; tin += `<line x1="${x.toFixed(1)}" y1="0" x2="${(x + r() * 3).toFixed(1)}" y2="${len.toFixed(0)}" stroke="${r() < .3 ? '#fff3bf' : '#f5c75a'}" stroke-width="2" stroke-linecap="round"/><circle class="twk" style="animation-delay:${-(r() * 2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${len.toFixed(0)}" r="1.8" fill="#fff"/>`; }
    for (let i = 0; i < 30; i++) { const side = r() < .5, x = side ? 6 + r() * 30 : 164 + r() * 30, y = 40 + r() * 220, c = CONF[(r() * CONF.length) | 0]; cf += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(r() * 180).toFixed(0)})">${r() < .35 ? `<circle r="2.4" fill="${c}"/>` : `<rect x="-3.5" y="-1.2" width="7" height="2.4" fill="${c}"/>`}</g>`; }
    return `<svg viewBox="0 0 200 278" preserveAspectRatio="none">${tin}<path d="M12 36C32 76-8 106 14 146S6 196 22 226" stroke="#ff4fa3" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M188 36C166 72 204 112 182 150S196 198 176 230" stroke="#55d6ff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M60 0C70 14 52 26 62 40" stroke="#f5c75a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>${cf}<g class="twk">${sparkle(172, 46, 9, '#fff3bf')}${sparkle(30, 232, 8, '#fff3bf')}${sparkle(160, 246, 5, '#ffe38a')}</g><path d="M30 262H170" stroke="#f5c75a" stroke-width="1.2" opacity=".8"/><text x="100" y="258" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-weight="900" font-size="17" letter-spacing="4" fill="#f5c75a">${NYEAR}</text></svg>`;
  })();
  COVER.birthday = (() => {
    const r = mkr(8); let fl = '', cf = '';
    for (let i = 0; i < 9; i++) { const x = 14 + i * 21, y = 4 + Math.sin(i * .9) * 5; fl += `<path d="M${x - 10} ${y}H${x + 10}L${x} ${y + 24}Z" fill="${BCOL[i % BCOL.length]}"/>`; }
    for (let i = 0; i < 30; i++) { const side = r() < .5, x = side ? 6 + r() * 30 : 164 + r() * 30, y = 50 + r() * 200, c = BCOL[(r() * BCOL.length) | 0]; cf += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(r() * 180).toFixed(0)})">${r() < .35 ? `<circle r="2.4" fill="${c}"/>` : `<rect x="-3.5" y="-1.2" width="7" height="2.4" fill="${c}"/>`}</g>`; }
    const bl = (x, y, c) => `<path d="M${x} ${y + 15}Q${x + 6} ${y + 34} ${x - 2} ${y + 52}" stroke="#fff" stroke-opacity=".6" stroke-width="1" fill="none"/>${balloonSvg(x, y, 11, 14, c)}`;
    return `<svg viewBox="0 0 200 278" preserveAspectRatio="none"><path d="M6 6Q100 34 194 6" stroke="#f3e6ff" stroke-opacity=".7" stroke-width="1.2" fill="none"/>${fl}${cf}${bl(32, 214, '#ff5fa8')}${bl(54, 224, '#ffd84a')}${bl(14, 228, '#4fd8ff')}${bl(176, 218, '#8e6bff')}${bl(158, 226, '#5be3a1')}<g class="twk">${sparkle(168, 66, 8, '#fff')}${sparkle(34, 78, 6, '#ffd84a')}</g></svg>`;
  })();

  /* ----- coins d'ornement sur les pages intérieures ----- */
  CORNER.newyear = (() => { let a = '', l = ''; [20, 34, 48, 62].forEach(R => { a += `M${80 - R} 0A${R} ${R} 0 0 0 80 ${R}`; }); [96, 114, 132, 150, 168].forEach(deg => { const t = deg * Math.PI / 180; l += `M${(80 + Math.cos(t) * 12).toFixed(1)} ${(Math.sin(t) * 12).toFixed(1)}L${(80 + Math.cos(t) * 62).toFixed(1)} ${(Math.sin(t) * 62).toFixed(1)}`; }); return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><g stroke='#c9a13a' fill='none' stroke-width='1.1' stroke-linecap='round' opacity='.9'><path d='${a}'/><path d='${l}' stroke-opacity='.6'/></g><path d='M52 30 54 36 60 38 54 40 52 46 50 40 44 38 50 36Z' fill='#f5c75a'/><circle cx='36' cy='18' r='2' fill='#f5c75a'/><circle cx='66' cy='54' r='2' fill='#f5c75a'/></svg>`; })();
  CORNER.birthday = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><path d='M80 0C62 6 52 20 56 32S74 36 70 48' stroke='#ff5fa8' stroke-width='3' fill='none' stroke-linecap='round'/><path d='M80 14C68 20 62 30 66 40' stroke='#4fd8ff' stroke-width='2.6' fill='none' stroke-linecap='round'/><circle cx='40' cy='16' r='3' fill='#ffd84a'/><circle cx='28' cy='34' r='2.4' fill='#8e6bff'/><circle cx='50' cy='60' r='3' fill='#5be3a1'/><rect x='30' y='46' width='9' height='3' rx='1.5' fill='#ff5fa8' transform='rotate(40 34 47)'/><rect x='60' y='62' width='9' height='3' rx='1.5' fill='#4fd8ff' transform='rotate(-30 64 63)'/></svg>";

  /* ====================================================================== */
  /*  PÂQUES : œufs en chocolat, lapins, cloches, nids, herbe tendre         */
  /*  Palette volontairement sobre : chocolat, or, crème, vert tendre.        */
  /* ====================================================================== */
  /* [corps, décor] : chocolat au lait, chocolat noir, chocolat blanc, papier doré, noisette */
  const EGGP = [['#6b3a20', '#e8b64c'], ['#3d1f10', '#f3d98a'], ['#f1dfb8', '#8a5a33'], ['#e8b64c', '#fff3bf'], ['#8a4b26', '#f3e2bf']];
  const eggPath = (cx, cy, w, h) => `M${cx} ${cy - h / 2}C${cx + w * .42} ${cy - h / 2} ${cx + w * .52} ${cy + h * .16} ${cx + w * .5} ${cy + h * .22}C${cx + w * .47} ${cy + h * .45} ${cx + w * .22} ${cy + h / 2} ${cx} ${cy + h / 2}C${cx - w * .22} ${cy + h / 2} ${cx - w * .47} ${cy + h * .45} ${cx - w * .5} ${cy + h * .22}C${cx - w * .52} ${cy + h * .16} ${cx - w * .42} ${cy - h / 2} ${cx} ${cy - h / 2}Z`;
  /* œuf en chocolat : style 0 = bande zigzag, 1 = rangées de points, 2 = papier alu froissé, 3 = vague */
  const eggSvg = (cx, cy, w, h, col, style = 0) => {
    const [a, b] = col, y = cy + h * .06, d = eggPath(cx, cy, w, h), f = n => n.toFixed(1);
    let deco = '';
    if (style === 0) {
      let z = ''; const n = 8, x0 = cx - w * .47, st = w * .94 / n;
      for (let i = 0; i <= n; i++) z += (i ? 'L' : 'M') + f(x0 + i * st) + ' ' + f(y + (i % 2 ? h * .07 : -h * .07));
      deco = `<path d="${z}" stroke="${b}" stroke-width="${f(Math.max(1.3, w * .075))}" fill="none" stroke-linejoin="round"/>`;
    } else if (style === 1) {
      for (let i = 0; i < 5; i++) { const t = i / 4; deco += `<circle cx="${f(cx - w * .34 + t * w * .68)}" cy="${f(y - Math.sin(t * Math.PI) * h * .05)}" r="${f(w * .06)}" fill="${b}"/>`; }
      for (let i = 0; i < 4; i++) { const t = (i + .5) / 4; deco += `<circle cx="${f(cx - w * .34 + t * w * .68)}" cy="${f(y + h * .13 - Math.sin(t * Math.PI) * h * .04)}" r="${f(w * .045)}" fill="${b}" opacity=".85"/>`; }
    } else if (style === 2) {
      deco = `<path d="M${f(cx - w * .26)} ${f(cy - h * .26)}L${f(cx - w * .04)} ${f(cy - h * .04)}L${f(cx - w * .27)} ${f(cy + h * .16)}M${f(cx + w * .24)} ${f(cy - h * .2)}L${f(cx + w * .05)} ${f(cy + h * .08)}L${f(cx + w * .2)} ${f(cy + h * .3)}" stroke="${b}" stroke-opacity=".55" stroke-width="${f(Math.max(1.1, w * .05))}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    } else {
      let p = `M${f(cx - w * .47)} ${f(y)}`; const n = 4, st = w * .94 / n;
      for (let i = 0; i < n; i++) p += `q${f(st / 2)} ${f(i % 2 ? h * .1 : -h * .1)} ${f(st)} 0`;
      deco = `<path d="${p}" stroke="${b}" stroke-width="${f(Math.max(1.4, w * .08))}" fill="none" stroke-linecap="round"/>`;
    }
    return `<path d="${d}" fill="${a}"/>${deco}<path d="${d}" fill="url(#nvBalShade)"/><path d="${d}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/><ellipse cx="${f(cx - w * .2)}" cy="${f(cy - h * .22)}" rx="${f(w * .08)}" ry="${f(h * .15)}" fill="#fff" opacity=".42" transform="rotate(24 ${f(cx - w * .2)} ${f(cy - h * .22)})"/>`;
  };
  /* lapin en chocolat assis, ruban doré et clochette (origine : pieds, centré) */
  const bunny = (x, y, sc, o = {}) => {
    const body = o.body || '#7a4326', belly = o.belly || '#9a5c3a', ear = o.ear || '#c98f6a', rib = o.rib || '#e8b64c', dark = o.dark || '#2a140a';
    return `<g transform="translate(${x} ${y}) scale(${sc})">
      <ellipse cx="0" cy="3" rx="52" ry="7" fill="#000" opacity=".3"/>
      <ellipse cx="-27" cy="-6" rx="19" ry="9" fill="${body}"/><ellipse cx="27" cy="-6" rx="19" ry="9" fill="${body}"/>
      <ellipse cx="0" cy="-48" rx="40" ry="46" fill="${body}"/><ellipse cx="0" cy="-40" rx="24" ry="31" fill="${belly}"/>
      <ellipse cx="-33" cy="-52" rx="9" ry="19" fill="${body}" transform="rotate(14 -33 -52)"/><ellipse cx="33" cy="-52" rx="9" ry="19" fill="${body}" transform="rotate(-14 33 -52)"/>
      <ellipse cx="-15" cy="-162" rx="10.5" ry="36" fill="${body}" transform="rotate(-9 -15 -162)"/><ellipse cx="-15" cy="-160" rx="5.2" ry="28" fill="${ear}" transform="rotate(-9 -15 -160)"/>
      <ellipse cx="17" cy="-160" rx="10.5" ry="36" fill="${body}" transform="rotate(12 17 -160)"/><ellipse cx="17" cy="-158" rx="5.2" ry="28" fill="${ear}" transform="rotate(12 17 -158)"/>
      <circle cx="0" cy="-108" r="31" fill="${body}"/><ellipse cx="0" cy="-98" rx="17" ry="13" fill="${belly}"/>
      <circle cx="-12" cy="-112" r="3.6" fill="${dark}"/><circle cx="12" cy="-112" r="3.6" fill="${dark}"/><circle cx="-10.8" cy="-113.2" r="1.2" fill="#fff"/><circle cx="13.2" cy="-113.2" r="1.2" fill="#fff"/>
      <path d="M-4 -103H4L0 -98Z" fill="${dark}"/><path d="M0 -98Q-5 -92 -9 -95M0 -98Q5 -92 9 -95" stroke="${dark}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M-28 -104 -41 -107M-28 -99 -41 -98M28 -104 41 -107M28 -99 41 -98" stroke="${belly}" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
      <path d="M-27 -82Q0 -70 27 -82V-73Q0 -61 -27 -73Z" fill="${rib}"/>
      <path d="M0 -72C-13 -88 -27 -77 -4 -71ZM0 -72C13 -88 27 -77 4 -71Z" fill="${rib}"/><circle cx="0" cy="-72" r="3" fill="${rib}"/>
      <circle cx="0" cy="-60" r="7" fill="url(#nvGold)" stroke="#8a5a1a" stroke-width="1"/><path d="M-5 -58H5" stroke="#8a5a1a" stroke-width="1.2"/>
      <ellipse cx="-14" cy="-124" rx="8" ry="14" fill="#fff" opacity=".13" transform="rotate(-20 -14 -124)"/><ellipse cx="-20" cy="-60" rx="6" ry="22" fill="#fff" opacity=".1" transform="rotate(12 -20 -60)"/>
    </g>`;
  };
  /* cloche de Pâques dorée qui se balance (origine : centre de la cloche ; str = longueur du fil) */
  const bell = (x, y, sc, ring = true, str = 0) => `<g transform="translate(${x} ${y}) scale(${sc})"><g${ring ? ' class="nv-ring"' : ''}>
    ${str ? `<line x1="0" y1="${-str}" x2="0" y2="-54" stroke="#c9a05a" stroke-width="2.4"/>` : ''}
    <path d="M0 -58C-6 -58-9 -54-9 -49C-28 -43-36 -22-36 0L-44 12H44L36 0C36-22 28-43 9-49C9-54 6-58 0-58Z" fill="url(#nvGold)" stroke="#8a5a1a" stroke-width="1.6"/>
    <path d="M-24 -30Q-30 -12 -32 2" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M-40 6Q0 14 40 6" stroke="#8a5a1a" stroke-opacity=".5" stroke-width="2" fill="none"/>
    <ellipse cx="0" cy="12" rx="44" ry="5" fill="#b98524"/>
    <g${ring ? ' class="nv-clap"' : ''}><circle cx="0" cy="21" r="8" fill="url(#nvGold)" stroke="#8a5a1a" stroke-width="1.4"/></g>
    <path d="M0 -58C-14 -76-34 -62-12 -58ZM0 -58C14 -76 34 -62 12 -58Z" fill="#f3e2bf"/><circle cx="0" cy="-58" r="4.5" fill="#e0c88e"/></g></g>`;
  /* nid tressé avec des œufs en chocolat */
  const nest = (x, y, sc, cols) => `<g transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="0" cy="3" rx="74" ry="9" fill="#000" opacity=".3"/>
    ${eggSvg(-26, -22, 28, 38, cols[0], 0)}${eggSvg(2, -29, 30, 41, cols[1], 1)}${eggSvg(30, -20, 27, 37, cols[2], 3)}
    <path d="M-68 -14Q0 -4 68 -14Q72 6 42 12H-42Q-72 6 -68 -14Z" fill="#6a4524"/>
    <path d="M-62 -8Q-20 4 28 -4M-52 4Q0 12 50 2M-40 -12Q10 -2 60 -10" stroke="#a87a45" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M-58 2Q-10 10 40 0M-30 -10Q20 0 62 -4" stroke="#c9a05a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/></g>`;
  const grassBlades = (x0, x1, y, h, c, seed, step = 11) => { const r = mkr(seed); let p = ''; for (let x = x0; x < x1; x += step) { const hh = h * (.5 + r() * .8), lean = (r() - .5) * 22; p += `M${x.toFixed(0)} ${y}Q${(x + lean * .3).toFixed(0)} ${(y - hh * .6).toFixed(0)} ${(x + lean).toFixed(0)} ${(y - hh).toFixed(0)}Q${(x + lean * .2 + 5).toFixed(0)} ${(y - hh * .5).toFixed(0)} ${(x + 8).toFixed(0)} ${y}Z`; } return `<path d="${p}" fill="${c}"/>`; };
  const daisy = (x, y, s, h = 40) => `<g transform="translate(${x} ${y})"><path d="M0 0Q-3 ${-h / 2} 0 ${-h}" stroke="#5f8f4e" stroke-width="2.2" fill="none"/><g transform="translate(0 ${-h}) scale(${s})">${[0, 45, 90, 135].map(a => `<ellipse rx="3.2" ry="8" fill="#fff4de" transform="rotate(${a})"/>`).join('')}<circle r="3.4" fill="#e8b64c"/></g></g>`;

  /* guirlande d'œufs suspendus sous la barre du haut */
  function topEaster() {
    const w = innerWidth, seg = Math.max(150, w / 8), n = Math.ceil(w / seg);
    let wire = 'M0 2', it = '', k = 0;
    for (let i = 0; i < n; i++) {
      const x0 = i * seg, x1 = x0 + seg, cx = x0 + seg / 2, sag = 22;
      wire += `Q${cx} ${2 + sag} ${x1} 2`;
      for (let j = 1; j <= 4; j++) {
        const t = j / 5, x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * 2 + 2 * (1 - t) * t * (2 + sag) + t * t * 2;
        const len = 10 + (k % 3) * 7, dl = (-(k % 5) * .6).toFixed(1);
        const obj = k % 5 === 4 ? bell(x, y + len + 12, .32, false, 0) : eggSvg(x, y + len + 17, 22, 30, EGGP[k % EGGP.length], k % 4);
        it += `<g class="nv-sway" style="transform-origin:${x.toFixed(1)}px ${y.toFixed(1)}px;animation-delay:${dl}s"><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + len + (k % 5 === 4 ? 0 : 4)).toFixed(1)}" stroke="#c9a05a" stroke-width="1.4"/>${obj}</g>`;
        k++;
      }
    }
    return `<svg viewBox="0 0 ${w} 130" width="${w}" height="130"><path d="${wire}" fill="none" stroke="#c9a05a" stroke-opacity=".85" stroke-width="2"/>${it}</svg>`;
  }
  /* décor du hero : collines, cloches, lapins, nid, œufs cachés dans l'herbe */
  function heroEaster() {
    const hidden = [[170, 656, 0, 0], [540, 676, 3, 3], [1010, 668, 1, 1], [1500, 650, 4, 0], [1100, 684, 2, 2], [330, 686, 4, 1]].map(([x, y, c, s]) => eggSvg(x, y, 27, 37, EGGP[c], s)).join('');
    const daisies = [[90, 700, 1], [610, 706, 1.1], [960, 704, .9], [1450, 702, 1.1], [1560, 708, .9], [240, 708, .9]].map(([x, y, s]) => daisy(x, y, s, 36 + s * 10)).join('');
    return `<div class="nv-sky"></div>
      <svg viewBox="0 0 1600 720" preserveAspectRatio="xMidYMax slice">
        <defs><radialGradient id="nvSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd98a" stop-opacity=".5"/><stop offset=".5" stop-color="#e8b64c" stop-opacity=".16"/><stop offset="1" stop-color="#e8b64c" stop-opacity="0"/></radialGradient></defs>
        <circle cx="800" cy="620" r="430" fill="url(#nvSun)"/>
        <g class="nv-sweep" style="transform-origin:420px 0"><path d="M420 0 280 720H600Z" fill="url(#nvBeamY)" opacity=".42"/></g>
        <g class="nv-sweep r" style="transform-origin:1180px 0"><path d="M1180 0 1040 720H1330Z" fill="url(#nvBeamY)" opacity=".38"/></g>
        ${bell(815, 300, .55, true, 545)}${bell(1540, 240, .5, true, 480)}
        <path d="M0 640Q260 566 560 630T1130 618T1600 602V720H0Z" fill="#2c3d22"/>
        <path d="M0 668Q300 620 620 664T1180 652T1600 642V720H0Z" fill="#35502b"/>
        ${hidden}
        ${grassBlades(0, 1600, 690, 36, '#4d7a3d', 11, 12)}
        <path d="M0 692Q400 678 820 694T1600 686V720H0Z" fill="#41622f"/>
        ${bunny(1230, 690, 1.08)}${bunny(600, 694, .78, { body: '#f1dfb8', belly: '#fff6e4', ear: '#e9b9a6', dark: '#3a2216', rib: '#c9a05a' })}
        ${nest(850, 702, 1.05, [EGGP[0], EGGP[3], EGGP[1]])}
        ${eggSvg(1352, 676, 34, 46, EGGP[3], 2)}${eggSvg(1392, 684, 26, 35, EGGP[1], 0)}${eggSvg(1322, 686, 24, 33, EGGP[2], 1)}
        ${grassBlades(0, 1600, 718, 30, '#5f8f4e', 21, 14)}
        ${daisies}
        <g class="twk">${sparkle(560, 360, 9, '#fff3bf')}${sparkle(1040, 250, 7, '#e8b64c')}${sparkle(150, 300, 6, '#fff')}</g>
      </svg>`;
  }
  /* pied de page : herbe, œufs, nids, pâquerettes */
  function footEaster() {
    return `<svg viewBox="0 0 1600 230" preserveAspectRatio="xMidYMax slice">
      <path d="M0 196Q400 180 800 192T1600 184V230H0Z" fill="#4a7338"/><path d="M0 208Q400 196 800 206T1600 200V230H0Z" fill="#375a2b"/>
      ${grassBlades(0, 1600, 200, 26, '#6aa04f', 31, 13)}
      ${eggSvg(300, 190, 24, 33, EGGP[0], 0)}${eggSvg(336, 198, 20, 27, EGGP[3], 1)}${eggSvg(1190, 192, 26, 35, EGGP[1], 3)}${eggSvg(1232, 200, 20, 27, EGGP[4], 0)}
      ${nest(700, 218, .62, [EGGP[0], EGGP[3], EGGP[4]])}${nest(1380, 220, .5, [EGGP[1], EGGP[2], EGGP[0]])}
      ${bell(120, 188, .5, false, 0)}${bell(1500, 190, .42, false, 0)}
      ${grassBlades(0, 1600, 226, 22, '#7fb864', 41, 15)}
      ${[[80, 226], [520, 228], [940, 226], [1100, 228], [1290, 226]].map(([x, y]) => daisy(x, y, .8, 34)).join('')}
      <path d="M0 224H1600V230H0Z" fill="#1a2a14"/></svg>`;
  }

  /* accessoire du logo : oreilles de lapin */
  Object.assign(HAT, {
    easter: '<svg viewBox="0 0 40 36"><ellipse cx="14" cy="14" rx="6" ry="14" fill="#fff1dc" transform="rotate(-12 14 14)"/><ellipse cx="14.4" cy="15" rx="2.8" ry="10" fill="#e9b9a6" transform="rotate(-12 14 14)"/><ellipse cx="27" cy="14" rx="6" ry="14" fill="#fff1dc" transform="rotate(10 27 14)"/><ellipse cx="26.6" cy="15" rx="2.8" ry="10" fill="#e9b9a6" transform="rotate(10 27 14)"/><rect x="11" y="27" width="20" height="5" rx="2.5" fill="#e8b64c"/><circle cx="21" cy="30" r="3" fill="#f3d98a"/></svg>'
  });
  /* props 3D autour du livre */
  PROPS.easter = [
    { px: -1.32, py: .5, ps: .46, pz: 40, svg: `<svg viewBox="-80 -70 160 90" style="overflow:visible">${nest(0, 0, 1, [EGGP[0], EGGP[3], EGGP[4]])}</svg>` },
    { px: 1.3, py: .5, ps: .4, pz: 20, svg: `<svg viewBox="-70 -205 140 215" style="overflow:visible">${bunny(0, 0, 1)}</svg>` },
    { px: .92, py: .02, ps: .22, pz: -90, svg: `<svg viewBox="-50 -100 100 140" style="overflow:visible">${bell(0, 0, 1, true, 92)}</svg>` },
    { px: -.55, py: -.36, ps: .13, pz: 60, svg: `<svg viewBox="0 0 70 100" class="bob">${eggSvg(35, 52, 46, 62, EGGP[3], 2)}<g class="twk">${sparkle(58, 14, 8, '#fff3bf')}${sparkle(10, 30, 5, '#fff')}</g></svg>` }
  ];
  /* décor posé sur la couverture : œufs suspendus en haut, herbe et pâquerettes en bas */
  COVER.easter = (() => {
    let g = '';
    [22, 58, 96, 134, 172].forEach((x, k) => { const len = 18 + (k % 3) * 9; g += `<g class="nv-sway" style="transform-origin:${x}px 0;animation-delay:${(-k * .7).toFixed(1)}s"><line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#c9a05a" stroke-width="1.2"/>${eggSvg(x, len + 16, 20, 27, EGGP[k % EGGP.length], k % 4)}</g>`; });
    return `<svg viewBox="0 0 200 278" preserveAspectRatio="none">${g}${grassBlades(0, 200, 278, 30, '#4d7a3d', 4, 9)}${grassBlades(0, 200, 278, 20, '#6fa05a', 9, 8)}${eggSvg(36, 260, 22, 30, EGGP[0], 1)}${eggSvg(170, 262, 20, 27, EGGP[3], 0)}${daisy(150, 278, .8, 30)}${daisy(58, 278, .7, 24)}<g class="twk">${sparkle(170, 70, 7, '#fff3bf')}${sparkle(30, 96, 5, '#e8b64c')}</g></svg>`;
  })();
  /* coins d'ornement : brin de verdure et petit œuf */
  CORNER.easter = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><path d='M80 0C66 8 54 20 46 40' stroke='#6f9a5f' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M70 10C60 6 52 10 50 18 60 20 66 16 70 10Z M60 22C50 20 44 26 44 34 54 34 58 28 60 22Z M75 18C80 28 74 36 64 38 62 30 68 22 75 18Z' fill='#7fae6a' opacity='.85'/><path d='M30 46C36 46 38 54 37.5 56.5 37 62 34 65 30 65 26 65 23 62 22.5 56.5 22 54 24 46 30 46Z' fill='#7a4326'/><path d='M23 55 27 52 30 56 33 52 37 55' stroke='#e8b64c' stroke-width='1.6' fill='none' stroke-linejoin='round'/></svg>";

  /* ====================================================================== */
  /*  CANVAS : particules                                                    */
  /* ====================================================================== */
  const cvs = document.createElement('canvas'); cvs.id = 'nvFx'; cvs.setAttribute('aria-hidden', 'true');
  const g = cvs.getContext('2d');
  const sprites = {};
  function sprite(key, size, draw) { if (sprites[key]) return sprites[key]; const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); return (sprites[key] = c); }
  const SP = {
    snow: () => sprite('snow', 32, (c, s) => { const r = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.4, 'rgba(255,255,255,.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, s, s); }),
    flake: () => sprite('flake', 48, (c, s) => { c.translate(s / 2, s / 2); c.strokeStyle = '#fff'; c.lineWidth = 2.2; c.lineCap = 'round'; for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -19); c.moveTo(0, -11); c.lineTo(-5, -16); c.moveTo(0, -11); c.lineTo(5, -16); c.stroke(); } }),
    glow: col => sprite('glow' + col, 48, (c, s) => { const r = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, '#fff'); r.addColorStop(.18, col); r.addColorStop(.5, col.replace(')', ',.25)').replace('rgb', 'rgba')); r.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = r; c.fillRect(0, 0, s, s); }),
    spark: col => sprite('spark' + col, 40, (c, s) => { c.translate(s / 2, s / 2); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 6; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 3 : 15, a = i * Math.PI / 4 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); }),
    bat: () => sprite('bat', 64, (c, s) => { c.fillStyle = '#0a0510'; c.shadowColor = '#ff8a1f'; c.shadowBlur = 5; c.scale(.6, .6); c.translate(0, 8); c.beginPath(); c.moveTo(53, 20); c.lineTo(49, 12); c.lineTo(46, 20); c.lineTo(39, 24); c.quadraticCurveTo(24, 8, 4, 18); c.quadraticCurveTo(18, 22, 13, 40); c.quadraticCurveTo(24, 36, 29, 50); c.quadraticCurveTo(38, 40, 46, 48); c.lineTo(53, 60); c.lineTo(60, 48); c.quadraticCurveTo(68, 40, 77, 50); c.quadraticCurveTo(82, 36, 93, 40); c.quadraticCurveTo(88, 22, 102, 18); c.quadraticCurveTo(82, 8, 67, 24); c.lineTo(60, 20); c.lineTo(57, 12); c.closePath(); c.fill(); }),
    conf: col => sprite('conf' + col, 20, (c, s) => { c.fillStyle = col; c.beginPath(); c.roundRect ? c.roundRect(3, 6, 14, 8, 2) : c.rect(3, 6, 14, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(3, 6, 14, 3); }),
    balloon: col => sprite('bal' + col, 96, (c, s) => {
      c.save(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(48, 74); c.bezierCurveTo(40, 80, 56, 86, 46, 95); c.stroke(); c.restore();
      c.fillStyle = col; c.beginPath(); c.moveTo(48, 71); c.lineTo(43, 79); c.lineTo(53, 79); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(48, 38, 28, 34, 0, 0, 6.2832); c.fill();
      const sh = c.createRadialGradient(38, 24, 2, 48, 40, 40); sh.addColorStop(0, 'rgba(255,255,255,.55)'); sh.addColorStop(.35, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)');
      c.fillStyle = sh; c.beginPath(); c.ellipse(48, 38, 28, 34, 0, 0, 6.2832); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(36, 22, 5, 9, -.5, 0, 6.2832); c.fill();
    }),
  };
  /* Pâques : petits œufs en chocolat et pétales crème */
  SP.egg = (a, b) => sprite('egg' + a + b, 64, (c, s) => {
    c.translate(s / 2, s / 2);
    c.beginPath(); c.moveTo(0, -26); c.bezierCurveTo(14, -26, 20, -4, 19, 6); c.bezierCurveTo(18, 20, 10, 26, 0, 26); c.bezierCurveTo(-10, 26, -18, 20, -19, 6); c.bezierCurveTo(-20, -4, -14, -26, 0, -26); c.closePath();
    c.fillStyle = a; c.fill();
    c.save(); c.clip();
    c.strokeStyle = b; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath();
    for (let i = 0; i <= 8; i++) c.lineTo(-22 + i * 5.5, 3 + (i % 2 ? 5 : -5));
    c.stroke();
    const sh = c.createRadialGradient(-7, -12, 1, 0, 2, 30); sh.addColorStop(0, 'rgba(255,255,255,.4)'); sh.addColorStop(.4, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.3)');
    c.fillStyle = sh; c.fillRect(-26, -30, 52, 60);
    c.restore();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.2; c.stroke();
  });
  SP.petal = () => sprite('petal', 24, (c, s) => { c.translate(s / 2, s / 2); c.rotate(-.5); c.fillStyle = '#fff4de'; c.beginPath(); c.ellipse(0, 0, 4.5, 9.5, 0, 0, 6.2832); c.fill(); c.fillStyle = 'rgba(232,182,76,.35)'; c.beginPath(); c.ellipse(0, 4, 2.4, 4, 0, 0, 6.2832); c.fill(); });
  /* couleurs des feux d'artifice : [glow rgb, étincelle hex] */
  const FWC = [['rgb(255,211,107)', '#ffd36b'], ['rgb(255,79,163)', '#ff4fa3'], ['rgb(85,214,255)', '#55d6ff'], ['rgb(183,155,255)', '#b79bff'], ['rgb(125,255,178)', '#7dffb2'], ['rgb(255,255,255)', '#ffffff']];
  let nextFw = 0;
  let parts = [], mode = 'normal', raf = 0, W = 0, H = 0, dpr = 1, mx = -999, my = -999, t = 0, gx = 0, gy = 0, wind = 0;
  const glowEl = el('nv-glow');

  function resize() { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cvs.width = W * dpr; cvs.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(init) {
    const p = { x: rnd(0, W), y: init ? rnd(0, H) : -20, vx: 0, vy: 0, bvx: 0, a: 1, r: 1, rot: rnd(0, 6.28), vr: 0, ph: rnd(0, 6.28), k: 'n', sp: null, s: 10 };
    if (mode === 'christmas') {
      const r = Math.pow(Math.random(), 1.8) * 4.2 + 1.2;
      p.r = r; p.s = r * 5; p.vy = p.bvy = .35 + r * .24; p.bvx = rnd(-.15, .15); p.a = .35 + r * .12; p.sp = r > 4.4 ? SP.flake() : SP.snow(); p.vr = r > 4.4 ? rnd(-.02, .02) : 0;
      if (Math.random() < .07) { p.k = 'tw'; p.sp = SP.spark('#ffe9a8'); p.s = rnd(8, 14); p.vy = p.bvy = rnd(.1, .3); p.a = 0; }
    } else if (mode === 'halloween') {
      if (Math.random() < .22) { p.k = 'ff'; p.sp = SP.glow(pick(['rgb(150,255,100)', 'rgb(190,130,255)'])); p.s = rnd(16, 30); p.y = rnd(H * .3, H); p.vx = rnd(-.4, .4); p.vy = rnd(-.3, .3); p.a = 0; }
      else { p.k = 'em'; p.sp = SP.glow(pick(['rgb(255,138,31)', 'rgb(255,190,60)', 'rgb(255,90,20)'])); p.s = rnd(8, 20); p.y = init ? rnd(0, H) : H + 20; p.vy = p.bvy = -rnd(.35, 1.1); p.bvx = rnd(-.2, .25); p.a = rnd(.4, 1); }
    } else if (mode === 'newyear') {
      if (Math.random() < .32) { p.k = 'tw'; p.sp = SP.spark(pick(['#ffe9a8', '#ffffff', '#f5c75a'])); p.s = rnd(8, 15); p.vy = p.bvy = rnd(.1, .35); p.a = 0; }
      else { p.sp = SP.conf(pick(CONF)); p.s = rnd(7, 12); p.vy = p.bvy = .45 + rnd(0, .75); p.bvx = rnd(-.2, .2); p.vr = rnd(-.07, .07); p.a = .85; }
    } else if (mode === 'birthday') {
      const q = Math.random();
      if (q < .07) { p.k = 'bl'; p.sp = SP.balloon(pick(BCOL)); p.s = rnd(56, 90); p.y = init ? rnd(H * .15, H * 1.05) : H + p.s; p.vy = p.bvy = -rnd(.3, .75); p.bvx = rnd(-.12, .12); p.a = .92; }
      else if (q < .2) { p.k = 'tw'; p.sp = SP.spark(pick(['#fff', '#ffd84a', '#ff9ccd', '#8fe8ff'])); p.s = rnd(8, 14); p.vy = p.bvy = rnd(.1, .3); p.a = 0; }
      else { p.sp = SP.conf(pick(BCOL)); p.s = rnd(7, 12); p.vy = p.bvy = .4 + rnd(0, .8); p.bvx = rnd(-.22, .22); p.vr = rnd(-.08, .08); p.a = .9; }
    } else if (mode === 'easter') {
      const q = Math.random();
      if (q < .07) { const e = pick(EGGP); p.k = 'bl'; p.sp = SP.egg(e[0], e[1]); p.s = rnd(34, 54); p.y = init ? rnd(-H * .1, H) : -p.s; p.vy = p.bvy = rnd(.35, .7); p.bvx = rnd(-.1, .1); p.vr = rnd(-.012, .012); p.a = .95; }
      else if (q < .22) { p.k = 'tw'; p.sp = SP.spark(pick(['#fff3bf', '#e8b64c', '#ffffff'])); p.s = rnd(8, 14); p.vy = p.bvy = rnd(.1, .3); p.a = 0; }
      else { p.sp = SP.petal(); p.s = rnd(9, 15); p.vy = p.bvy = .3 + rnd(0, .55); p.bvx = rnd(-.25, .25); p.vr = rnd(-.05, .05); p.a = .8; }
    }
    return p;
  }
  function populate() {
    parts = []; if (mode === 'normal') return;
    const n = Math.round(Math.max(40, Math.min(130, W * H / 13000)) * (mode === 'halloween' ? .6 : mode === 'newyear' ? .75 : mode === 'birthday' ? .65 : mode === 'easter' ? .6 : 1));
    for (let i = 0; i < n; i++) parts.push(spawn(true));
    nextFw = 0;
  }
  function burst(x, y, n = 16) {
    if (!motion() || mode === 'normal') return;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), v = rnd(1.2, 4.4), p = { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.4, a: 1, k: 'b', rot: rnd(0, 6.28), vr: rnd(-.2, .2), life: 0, max: rnd(40, 80), ph: 0, bvx: 0, bvy: 0, r: 1, s: rnd(10, 20) };
      if (mode === 'christmas') { p.sp = Math.random() < .5 ? SP.spark(pick(['#ffe9a8', '#ffffff', '#ff8a96'])) : SP.snow(); p.s = rnd(8, 16); }
      else if (mode === 'halloween') { if (Math.random() < .22) { p.sp = SP.bat(); p.s = rnd(22, 34); p.vy -= 1.5; } else { p.sp = SP.glow(pick(['rgb(255,138,31)', 'rgb(190,130,255)', 'rgb(150,255,100)'])); p.s = rnd(12, 26); } }
      else if (mode === 'newyear') { const c = pick(FWC); p.sp = Math.random() < .55 ? SP.spark(c[1]) : SP.glow(c[0]); p.s = rnd(9, 20); }
      else if (mode === 'birthday') { p.sp = Math.random() < .8 ? SP.conf(pick(BCOL)) : SP.spark(pick(['#fff', '#ffd84a'])); p.s = rnd(8, 15); p.vr = rnd(-.3, .3); p.max = rnd(50, 95); }
      else if (mode === 'easter') { p.sp = Math.random() < .55 ? SP.spark(pick(['#fff3bf', '#e8b64c', '#ffffff'])) : SP.petal(); p.s = rnd(8, 16); p.vr = rnd(-.25, .25); p.max = rnd(50, 90); }
      parts.push(p);
    }
    if (parts.length > 460) parts.splice(0, parts.length - 460);
  }
  /* feu d'artifice : une fusée monte, puis éclate */
  function launch() {
    const ty = rnd(H * .1, H * .48), g = .07, x = rnd(W * .08, W * .92);
    parts.push({ x, y: H + 10, vx: rnd(-.5, .5), vy: -Math.sqrt(2 * g * (H - ty)), a: 1, k: 'rk', rot: 0, vr: 0, ph: 0, bvx: 0, r: 1, s: 16, sp: SP.glow('rgb(255,236,180)'), ty });
  }
  function explode(x, y) {
    const c1 = pick(FWC), c2 = pick(FWC), n = 42 + ((Math.random() * 18) | 0), ring = Math.random() < .5, big = rnd(3.4, 5.6);
    parts.push({ x, y, vx: 0, vy: 0, a: 1, k: 'b', rot: 0, vr: 0, life: 0, max: 16, ph: 0, bvx: 0, bvy: 0, r: 1, s: rnd(120, 190), sp: SP.glow(c1[0]), g: 0, dr: 1 });
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.2832 + rnd(-.04, .04), v = ring ? big * rnd(.92, 1.04) : big * Math.sqrt(Math.random()), c = i % 3 ? c1 : c2;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, a: 1, k: 'b', rot: rnd(0, 6.28), vr: rnd(-.08, .08), life: 0, max: rnd(62, 108), ph: 0, bvx: 0, bvy: 0, r: 1, s: rnd(9, 16), sp: i % 2 ? SP.spark(c[1]) : SP.glow(c[0]), g: .035, dr: .965 });
    }
    if (parts.length > 460) parts.splice(0, parts.length - 460);
  }
  /* un clic fait éclater un ballon */
  function popBalloon(x, y) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; if (p.k !== 'bl') continue;
      if (Math.abs(p.x - x) < p.s * .32 && Math.abs((p.y - p.s * .12) - y) < p.s * .38) { parts.splice(i, 1); burst(x, y, 22); parts.push(spawn(false)); return true; }
    }
    return false;
  }
  function frame(now) {
    raf = 0;
    if (mode === 'normal' || document.hidden) return;
    t = now / 1000;
    if (!motion()) { g.clearRect(0, 0, W, H); return; }
    g.clearRect(0, 0, W, H);
    gx += (mx - gx) * .18; gy += (my - gy) * .18;
    glowEl.style.transform = `translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`;
    wind += (((mx / W - .5) * 1.2) - wind) * .02;
    if (mode === 'newyear' && now > nextFw) { if (nextFw && parts.filter(q => q.k === 'rk').length < 3) launch(); nextFw = now + rnd(1500, 3400); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.k === 'b') { p.vy += (p.g ?? .09); p.vx *= (p.dr ?? .985); if (p.dr) p.vy *= p.dr; p.life++; p.a = 1 - p.life / p.max; if (p.life > p.max) { parts.splice(i, 1); continue; } }
      else if (p.k === 'rk') {
        p.vy += .07;
        if (p.vy > -.5 || p.y <= p.ty) { explode(p.x, p.y); parts.splice(i, 1); continue; }
        parts.push({ x: p.x + rnd(-1.5, 1.5), y: p.y + 6, vx: rnd(-.3, .3), vy: rnd(.4, 1.2), a: 1, k: 'b', rot: 0, vr: 0, life: 0, max: 20, ph: 0, bvx: 0, bvy: 0, r: 1, s: rnd(6, 11), sp: SP.glow('rgb(255,214,140)'), g: .02 });
      }
      else {
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 12100 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / 110) * .7; p.vx += dx / d * f; p.vy += dy / d * f; }
        if (p.k === 'ff') { p.vx += rnd(-.03, .03); p.vy += rnd(-.03, .03); p.vx *= .98; p.vy *= .98; p.a = .35 + .65 * Math.abs(Math.sin(t * 1.3 + p.ph)); if (p.y < 0 || p.y > H) p.vy *= -1; if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; }
        else if (p.k === 'tw') { p.a = Math.max(0, Math.sin(t * 2 + p.ph)); p.vx += (0 - p.vx) * .05; p.vy += (p.bvy - p.vy) * .05; }
        else { p.vx += ((p.bvx + wind * (p.r || 1) * .35 + Math.sin(t * .8 + p.ph) * .25) - p.vx) * .04; p.vy += (p.bvy - p.vy) * .04; if (p.k === 'em') p.a = .35 + .65 * Math.abs(Math.sin(t * 2.2 + p.ph)); }
      }
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.k !== 'b' && p.k !== 'rk') {
        if (p.bvy < 0 && p.y < -p.s - 20) { p.y = H + p.s + 20; p.x = rnd(0, W); }
        else if (p.bvy >= 0 && p.y > H + 30) { p.y = -24; p.x = rnd(0, W); }
        if (p.x < -40) p.x = W + 30; else if (p.x > W + 40) p.x = -30;
      }
      g.globalAlpha = Math.max(0, Math.min(1, p.a));
      if (p.vr || p.k === 'b') { g.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr); g.rotate(p.rot); g.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s); g.setTransform(dpr, 0, 0, dpr, 0, 0); }
      else g.drawImage(p.sp, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    }
    g.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && mode !== 'normal') raf = requestAnimationFrame(frame); };

  /* ====================================================================== */
  /*  CONSTRUCTION / DESTRUCTION                                             */
  /* ====================================================================== */
  const FAV = { halloween: ['#ff8a1f', '#150c1d'], christmas: ['#d93a4c', '#0b2019'], newyear: ['#f5c75a', '#080b26'], birthday: ['#ff5fa8', '#1d0c48'], easter: ['#e8b64c', '#1d110b'], normal: ['#6f9be7', '#101c37'] };
  const NAMES = { halloween: ['Frissons garantis', 'Édition Halloween'], christmas: ['Joyeuses fêtes', 'Édition Noël'], newyear: ['Bonne année ' + NYEAR, 'Édition Nouvel An'], birthday: ['Joyeux anniversaire', 'Édition Anniversaire'], easter: ['Joyeuses Pâques', 'Édition Pâques'], normal: ['Novelya', 'Le livre vivant'] };
  const VEIL = { halloween: 'radial-gradient(circle,#4a1d6b,#12061c)', christmas: 'radial-gradient(circle,#13553f,#06130f)', newyear: 'radial-gradient(circle,#2b2a7a,#05061a)', birthday: 'radial-gradient(circle,#7a2ba8,#1d0c48)', easter: 'radial-gradient(circle,#6b3a20,#1d110b)', normal: 'radial-gradient(circle,#3d62a8,#101c37)' };

  function setMeta(th) {
    const [a, b] = FAV[th];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='${b}'/><path d='M32 8 38 26 56 32 38 38 32 56 26 38 8 32 26 26Z' fill='${a}'/></svg>`;
    let l = $('link[rel="icon"]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.append(l); }
    l.type = 'image/svg+xml'; l.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    const m = $('meta[name="theme-color"]'); if (m) m.content = b;
  }
  function clear() {
    document.querySelectorAll('.nv-s').forEach(n => n.remove());
    $('#nvPages')?.remove();
    document.querySelectorAll('.nv-hat').forEach(n => n.remove());
  }
  const topFor = th => th === 'christmas' ? topGarland() : th === 'halloween' ? topSlime() : th === 'newyear' ? topNewYear() : th === 'birthday' ? topBirthday() : th === 'easter' ? topEaster() : topBunting();
  const heroFor = th => th === 'halloween' ? heroHalloween() : th === 'newyear' ? heroNewYear() : th === 'birthday' ? heroBirthday() : th === 'easter' ? heroEaster() : heroChristmas();
  const footFor = th => th === 'halloween' ? footHalloween() : th === 'newyear' ? footNewYear() : th === 'birthday' ? footBirthday() : th === 'easter' ? footEaster() : footChristmas();
  function build(th) {
    clear(); mode = th; setMeta(th);
    body.dataset.season = th;
    if (th === 'normal') { cvs.remove(); parts = []; return; }
    if (!cvs.isConnected) body.append(cvs);
    body.append(glowEl, el('nv-vig'));
    if (th === 'newyear' || th === 'birthday' || th === 'easter') body.append(el('nv-defs', GLOBAL_DEFS));
    resize(); populate(); start();

    /* en-tête */
    const top = $('.topbar');
    if (top) {
      const wrap = el('nv-top', topFor(th));
      if (th === 'halloween') { wrap.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:0;top:0">${WEB(210)}</div><div style="position:absolute;right:0;top:0;transform:scaleX(-1)">${WEB(210)}</div>`); }
      if (th === 'christmas') wrap.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:0;right:0;top:-10px;height:0"></div>`);
      top.append(wrap);
      const mark = $('.logo', top);
      if (mark) { const h = el('', HAT[th]); h.className = 'nv-hat nv-s'; mark.append(h); }
    }

    /* hero */
    const hero = $('.hero');
    if (hero) hero.prepend(el('nv-hero', heroFor(th)));

    /* pied de page */
    const foot = $('footer.foot2');
    if (foot) {
      foot.prepend(el('nv-foot', footFor(th)));
      const fb = $('.ft-bottom', foot); if (fb) fb.insertAdjacentHTML('beforeend', `<span class="nv-s nv-badge"><i></i>${NAMES[th][1]}</span>`);
    }

    /* livre 3D : props, couverture, pages */
    const rig = $('#bkRig');
    if (rig) { const pr = el('nv-props', PROPS[th].map(p => `<div class="nv-prop" style="--px:${p.px};--py:${p.py};--ps:${p.ps};--pz:${p.pz}px">${p.svg}</div>`).join('')); rig.append(pr); }
    const cov = $('.bk-leaf.bk-cov .bk-face.f');
    if (cov) cov.append(el('nv-cvd', COVER[th]));
    const st = document.createElement('style'); st.id = 'nvPages';
    const u = 'url("data:image/svg+xml,' + encodeURIComponent(CORNER[th]) + '")';
    st.textContent = `.bk-leaf:not(.bk-cov) .bk-face.f::before,.bk-leaf.bk-cov .bk-face.b::before{content:"";position:absolute;inset:0;pointer-events:none;background:${u} no-repeat right top/26% auto,${u} no-repeat left bottom/20% auto;opacity:.9}.bk-leaf:not(.bk-cov) .bk-face.b::before{content:"";position:absolute;inset:0;pointer-events:none;background:${u} no-repeat left top/26% auto,${u} no-repeat right bottom/20% auto;opacity:.9;transform:none}`;
    document.head.append(st);

    /* éléments volants */
    if (th === 'halloween') {
      for (let i = 0; i < 6; i++) body.append(el('nv-bat', BAT, 'div')), (body.lastChild.style.cssText = `--t:${rnd(8, 60).toFixed(0)}%;--s:${rnd(30, 54).toFixed(0)}px;--d:${rnd(14, 26).toFixed(1)}s;--dl:${(-rnd(0, 24)).toFixed(1)}s`);
      for (let i = 0; i < 2; i++) { body.append(el('nv-ghost', GHOST)); body.lastChild.style.cssText = `--t:${rnd(24, 60).toFixed(0)}%;--s:${rnd(52, 76).toFixed(0)}px;--d:${rnd(34, 50).toFixed(0)}s;--dl:${(-rnd(0, 40)).toFixed(0)}s`; }
      body.append(el('nv-fog'), el('nv-flash'));
    }
    if (th === 'christmas') body.append(el('nv-sleigh', SLEIGH()));
    if (th === 'newyear') for (let i = 0; i < 3; i++) { const m = el('nv-shoot', '<i></i>'); m.style.cssText = `--t:${rnd(4, 38).toFixed(0)}%;--l:${rnd(30, 95).toFixed(0)}%;--d:${rnd(9, 15).toFixed(1)}s;--dl:${(-rnd(0, 12)).toFixed(1)}s`; body.append(m); }
  }

  /* ---------- transition entre deux thèmes ---------- */
  function veil(th) {
    if (!motion()) return;
    const v = el('nv-veil', `<div><b>${NAMES[th][0]}</b><small>${NAMES[th][1]}</small></div>`); v.style.background = VEIL[th];
    body.append(v); void v.offsetWidth; v.classList.add('go'); setTimeout(() => v.remove(), 1800);
  }

  /* ---------- interactions ---------- */
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (gx === 0 && gy === 0) { gx = mx; gy = my; } }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -999; });
  addEventListener('pointerdown', e => { if (mode === 'normal' || e.target.closest('.nv-panel')) return; if ((mode === 'birthday' || mode === 'easter') && popBalloon(e.clientX, e.clientY)) return; burst(e.clientX, e.clientY); }, { passive: true });
  let lastTrail = 0;
  addEventListener('pointermove', e => { if (mode === 'normal' || !motion() || e.pointerType === 'touch') return; const n = performance.now(); if (n - lastTrail < 70) return; lastTrail = n; burst(e.clientX, e.clientY, 1); }, { passive: true });
  addEventListener('resize', () => { if (mode === 'normal') return; resize(); clearTimeout(resize.t); resize.t = setTimeout(() => { populate(); const tp = $('.nv-top'); if (tp) tp.firstElementChild.outerHTML = topFor(mode); }, 250); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  new MutationObserver(() => { start(); }).observe(body, { attributes: true, attributeFilter: ['class'] });

  /* éclairs d'Halloween */
  (function storm() { setTimeout(() => { if (mode === 'halloween' && motion() && !document.hidden) { const f = $('.nv-flash'); if (f) { f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); } } storm(); }, rnd(14000, 32000)); })();

  /* ---------- pilotage par le thème du site ---------- */
  let cur = null, adminChange = false;
  /* app.js prévient ici quand l'admin change le thème ; au chargement du site, aucun voile */
  addEventListener('nv:admin-theme', () => { adminChange = true; });
  function sync() {
    const th = theme();
    if (th === cur) return;
    cur = th;
    build(th);
    if (adminChange) { adminChange = false; veil(th); }
  }
  new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['class'] });
  /* app.js pose la classe un peu après le chargement (lecture de la base) : on attend qu'elle soit là */
  sync();
  /* le livre est construit par book3d.js (chargé après) : on reconstruit les props quand tout est prêt */
  addEventListener('load', () => { const th = theme(); if (th !== 'normal') { cur = null; sync(); } });
})();