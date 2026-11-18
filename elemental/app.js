/* Catálogo público: lee el contenido desde Firestore (catalogo/sitio) y lo dibuja.
   Si Firebase no está configurado o no responde, muestra los datos originales (datos-base.js). */
import { firebaseConfig, configurado } from './firebase-config.js';

const CAT = window.CAT;
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';

function conTimeout(p, ms) {
  return Promise.race([p, new Promise(function (_, rj) { setTimeout(function () { rj(new Error('timeout')); }, ms); })]);
}

async function cargar() {
  var cache = null;
  try { cache = JSON.parse(localStorage.getItem('elemental_cat') || 'null'); } catch (e) {}
  if (!configurado) return cache;
  try {
    const A = await conTimeout(import(SDK + 'firebase-app.js'), 8000);
    const F = await conTimeout(import(SDK + 'firebase-firestore.js'), 8000);
    const db = F.getFirestore(A.initializeApp(firebaseConfig));
    const snap = await conTimeout(F.getDoc(F.doc(db, 'catalogo', 'sitio')), 8000);
    if (snap.exists()) {
      const d = snap.data();
      try { localStorage.setItem('elemental_cat', JSON.stringify(d)); } catch (e) {}
      return d;
    }
    return null;
  } catch (e) {
    console.warn('No se pudo leer Firestore, se usa la última copia o los datos originales', e);
    return cache;
  }
}

(async function () {
  const remote = await cargar();
  const ST = CAT.normalize(remote);
  const DEF = {}; CAT.TEXTOS.forEach(function (a) { DEF[a[1]] = a[3]; });

  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var tx = function (k) { return ST.txt[k] != null ? ST.txt[k] : (DEF[k] != null ? DEF[k] : ''); };
  var t = function (k) { return esc(tx(k)); };
  var safeUrl = function (u) { u = String(u || '').trim(); return /^\s*(javascript|data|vbscript):/i.test(u) ? '#' : u; };
  var li = function (a) { return (a || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var imgTag = function (src, cls, alt) { return '<img ' + (cls ? 'class="' + cls + '" ' : '') + 'loading="lazy" decoding="async" src="' + esc(src) + '" alt="' + esc(alt || '') + '">'; };

  var C = ST.cfg;
  var marca = C.marca || 'Elemental';
  document.title = marca + ' | Catálogo';
  $('marca').textContent = marca;

  var KN = { casas: tx('kn.casas'), quinchos: tx('kn.quinchos') };
  var MENUK = ['casas', 'quinchos', 'agregados', 'proceso', 'pago'];
  var ICO = { casas: 'M3 12 12 4l9 8M6 10v10h12V10M10 20v-6h4v6', quinchos: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 2 2 1 0-3-1-5 1-7z', agregados: 'M12 5v14M5 12h14', proceso: 'M4 19h5v-5h5V9h6', pago: 'M3 7h18v11H3zM3 11h18M7 15h3', galeria: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6', contacto: 'M4 5h16v11H9l-5 4z', extra: 'M4 6h16M4 12h16M4 18h10' };
  var H = '<svg class="h" viewBox="0 0 120 100"><path d="M6 52 60 8l54 44M20 46v46h80V46M50 92V64h20v28"/></svg>';

  var extraOf = function (id) { return ST.extra.filter(function (x) { return x.id === id; })[0]; };
  var vis = function (k) {
    if (ST.hide[k]) return false;
    if (k === 'quinchos') return ST.quinchos.length > 0;
    if (CAT.BUILTIN.indexOf(k) < 0) return !!extraOf(k);
    return true;
  };
  var ORD = ST.order.filter(vis);
  var navLabel = function (k) { var x = extraOf(k); return x ? (x.nav || x.h || 'Sección') : (ST.navl[k] || k); };

  /* ---------- piezas ---------- */
  function gl(p) {
    var d = p.im || [];
    return '<div class="gl"><div class="ph">' + (d.length ? imgTag(d[0], 'mn', p.n) : '<span>Sin fotos todavía</span>') + '</div>' +
      (d.length > 1 ? '<div class="th">' + d.map(function (x, j) { return imgTag(x, j ? '' : 'on', ''); }).join('') + '</div>' : '') + '</div>';
  }
  function ms(k, p, i, n) {
    var sp = (p.sp || []).map(function (s) { return '<div><b>' + esc(s.v) + '</b><small>' + esc(s.l) + '</small></div>'; }).join('');
    var inc = k === 'casas'
      ? '<div class="tabs"><button class="on" data-k="s">' + t('l.semi') + '</button><button data-k="l">' + t('l.llave') + '</button></div><ul class="inc" data-k="s">' + li(p.semi) + '</ul><ul class="inc" data-k="l" hidden>' + li((p.semi || []).concat(p.full || [])) + '</ul>'
      : '<ul class="inc">' + li(p.inc) + '</ul>';
    return '<section class="slide" data-g="' + k + '"><div class="wrap two">' + gl(p) + '<div><p class="kick">' + esc(KN[k]) + ' · ' + (i + 1) + ' de ' + n + (p.tag ? ' · ' + esc(p.tag) : '') + '</p><h2>' + esc(p.n) + '</h2><div class="specs">' + sp + '</div>' + inc +
      '<p class="price">' + t('l.desde') + ' <b>' + esc(p.desde) + '</b> · ' + t('l.ref') + '</p></div></div></section>';
  }
  function cards(arr, num) {
    return '<div class="grid">' + arr.map(function (x, i) {
      return '<div class="card">' + (x.img ? imgTag(x.img, 'ci', '') : '') + (num ? '<div class="n">' + pad(i + 1) + '</div>' : '') + '<h3>' + esc(x.t) + '</h3>' + (x.d ? '<p>' + esc(x.d) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
  }
  var hd = function (k, h, e) { return '<p class="kick">' + t(k) + '</p><h2>' + t(h) + ' <em>' + t(e) + '</em></h2>'; };

  function extraSlide(x) {
    var head = (x.k ? '<p class="kick">' + esc(x.k) + '</p>' : '') + '<h2>' + esc(x.h) + (x.e ? ' <em>' + esc(x.e) + '</em>' : '') + '</h2>' + (x.l ? '<p class="lead">' + esc(x.l) + '</p>' : '');
    var tail = (x.n ? '<p class="note">' + esc(x.n) + '</p>' : '') + (x.bt ? '<a class="btn" href="' + esc(safeUrl(x.bu)) + '" target="_blank" rel="noopener">' + esc(x.bt) + '</a>' : '');
    var body = '';
    if (x.tipo === 'texto' || x.tipo === 'lista') {
      var inner = x.tipo === 'texto'
        ? '<div class="body" style="margin-top:18px">' + String(x.body || '').split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>'
        : '<ul class="inc" style="margin-top:18px">' + li(x.lst) + '</ul>';
      if (x.img) return '<section class="slide" data-g="' + x.id + '"><div class="wrap two"><div>' + head + inner + tail + '</div><div class="gl"><div class="ph">' + imgTag(x.img, 'mn', x.h) + '</div></div></div></section>';
      body = inner;
    } else if (x.tipo === 'galeria') {
      body = '<div class="xg">' + (x.items || []).filter(function (i) { return i.img; }).map(function (i) { return '<figure>' + imgTag(i.img, 'mn', i.t) + (i.t ? '<figcaption>' + esc(i.t) + '</figcaption>' : '') + '</figure>'; }).join('') + '</div>';
    } else {
      body = cards(x.items || [], false);
    }
    return '<section class="slide" data-g="' + x.id + '"><div class="wrap">' + head + body + tail + '</div></section>';
  }

  /* ---------- menú ---------- */
  var MT = ORD.filter(function (k) { return k !== 'sistema'; }).concat(['galeria', 'contacto']);
  var CH = { casas: ['Comparativa'].concat(ST.casas.map(function (m) { return m.n; })), quinchos: ST.quinchos.map(function (m) { return m.n; }) };
  var T = MT.map(function (k, i) {
    var x = extraOf(k), ic = ICO[k] || ICO.extra;
    var title = x ? (x.nav || x.h) : tx('m.' + k + '.t'), desc = x ? (x.l || x.k || '') : tx('m.' + k + '.d');
    return '<div class="tile" tabindex="0" role="button" style="--i:' + i + '" data-go="' + k + '"><svg class="ic" viewBox="0 0 24 24"><path d="' + ic + '"/></svg><h3>' + esc(title) + '</h3><p>' + esc(desc) + '</p>' +
      (CH[k] ? '<div class="chips">' + CH[k].map(function (n, j) { return '<button class="chip" data-go="' + k + '" data-j="' + j + '">' + esc(n) + '</button>'; }).join('') + '</div>' : '') + '</div>';
  }).join('');

  /* ---------- diapositivas ---------- */
  var S = [];
  S.push('<section class="slide cover inv" data-g="inicio"><div class="wrap"><p class="kick">' + t('cv.k') + '</p><h1>' + t('cv.a') + '<br>' + t('cv.c') + ' <em>' + t('cv.b') + '</em></h1><p class="lead">' + t('cv.l') + '</p><div><span class="pill">' + t('cv.p1') + '</span><span class="pill">' + t('cv.p2') + '</span><span class="pill">' + t('cv.p3') + '</span><span class="pill">' + t('cv.p4') + '</span></div></div>' + H + '</section>');
  S.push('<section class="slide" data-g="inicio"><div class="wrap"><p class="kick">' + t('hm.k') + '</p><h2>' + t('hm.h') + ' <em>' + t('hm.e') + '</em></h2><div class="grid">' + T + '</div></div></section>');
  ORD.forEach(function (k) {
    if (k === 'sistema') S.push('<section class="slide" data-g="sistema"><div class="wrap">' + hd('sis.k', 'sis.h', 'sis.e') + '<p class="lead">' + t('sis.l') + '</p>' + cards(ST.secs.sistema, false) + '</div></section>');
    else if (k === 'casas') {
      S.push('<section class="slide" data-g="casas"><div class="wrap">' + '<p class="kick">' + t('cmp.k') + '</p><h2>' + t('cmp.h') + ' <em>' + t('cmp.v') + '</em> ' + t('cmp.e') + '</h2><div class="scroll"><table><tr><th>' + t('l.inc') + '</th><th>' + t('l.semi') + '</th><th>' + t('l.llave') + '</th></tr>' +
        ST.cmp.semi.map(function (x) { return '<tr><td>' + esc(x) + '</td><td class="y">' + t('l.ok') + '</td><td class="y">' + t('l.ok') + '</td></tr>'; }).join('') +
        ST.cmp.full.map(function (x) { return '<tr><td>' + esc(x) + '</td><td class="no">' + t('l.no') + '</td><td class="y">' + t('l.ok') + '</td></tr>'; }).join('') + '</table></div></div></section>');
      ST.casas.forEach(function (p, i) { S.push(ms('casas', p, i, ST.casas.length)); });
    } else if (k === 'quinchos') ST.quinchos.forEach(function (p, i) { S.push(ms('quinchos', p, i, ST.quinchos.length)); });
    else if (k === 'agregados') S.push('<section class="slide" data-g="agregados"><div class="wrap">' + hd('ag.k', 'ag.h', 'ag.e') + cards(ST.agr, false) + '<p class="note">' + t('ag.n') + '</p></div></section>');
    else if (k === 'proceso') S.push('<section class="slide" data-g="proceso"><div class="wrap">' + hd('pr.k', 'pr.h', 'pr.e') + cards(ST.secs.proceso, true) + '<p class="lead">' + t('pr.l') + ' ' + esc(C.plazo) + '</p></div></section>');
    else if (k === 'pago') S.push('<section class="slide" data-g="pago"><div class="wrap">' + hd('pg.k', 'pg.h', 'pg.e') + cards(ST.secs.pago, false) + '<p class="lead">' + t('pg.l') + ' ' + esc(C.plazo) + '</p><p class="note">' + t('pg.n') + '</p></div></section>');
    else S.push(extraSlide(extraOf(k)));
  });
  var contacto = [C.zona, [C.tel, C.ig].filter(Boolean).join(' · '), C.mail].filter(Boolean).map(esc).join('<br>');
  S.push('<section class="slide cover inv" data-g="contacto"><div class="wrap"><p class="kick">' + t('ct.k') + '</p><h2>' + t('ct.h') + ' <em>' + t('ct.e') + '</em></h2><p class="lead">' + contacto + '</p><div><a class="btn" href="' + esc(safeUrl(C.wa)) + '" target="_blank" rel="noopener">' + t('ct.btn') + '</a><a class="btn o" href="#1" id="top">' + t('ct.back') + '</a></div></div>' + H + '</section>');

  var D = $('deck'); D.innerHTML = S.join(''); $('mt').innerHTML = T;
  var L = [].slice.call(D.children), c = 0;
  var NV = ['inicio'].concat(ORD, ['contacto']);
  $('tn').innerHTML = NV.map(function (k) { return '<button data-nv="' + k + '">' + esc(navLabel(k)) + '</button>'; }).join('');

  function gi(k) { for (var i = 0; i < L.length; i++) if (L[i].dataset.g === k) return i; return 0; }
  function go(i) {
    c = Math.max(0, Math.min(L.length - 1, i));
    L.forEach(function (s, k) { s.classList.toggle('on', k === c); }); L[c].scrollTop = 0;
    $('pg').style.width = ((c + 1) / L.length * 100) + '%'; $('ct').textContent = (c + 1) + ' / ' + L.length;
    var g = L[c].dataset.g; [].forEach.call($('tn').children, function (b) { b.classList.toggle('on', b.dataset.nv === g); });
    $('bar').classList.toggle('inv', L[c].classList.contains('inv'));
    $('pv').style.visibility = c ? 'visible' : 'hidden'; $('nx').style.visibility = c < L.length - 1 ? 'visible' : 'hidden';
    try { history.replaceState(null, '', '#' + (c + 1)); } catch (e) {}
  }

  /* ---------- galería automática ---------- */
  var G = [];
  ['casas', 'quinchos'].forEach(function (k) { ST[k].forEach(function (p) { (p.im || []).forEach(function (d) { G.push({ c: KN[k], n: p.n, img: d }); }); }); });
  ST.extra.forEach(function (x) { if (x.tipo === 'galeria' && vis(x.id)) (x.items || []).forEach(function (i) { if (i.img) G.push({ c: x.nav || x.h, n: i.t || x.h, img: i.img }); }); });
  $('gs').innerHTML = G.map(function (g) { return '<div class="gs"><img src="' + esc(g.img) + '" alt=""><div class="cap"><small>' + esc(g.c) + '</small>' + esc(g.n) + '</div></div>'; }).join('');
  var GL = [].slice.call($('gs').children), gk = 0, gt = null, gp = false, GMS = 6000;
  function gshow(i) { if (!GL.length) return; gk = (i + GL.length) % GL.length; GL.forEach(function (s, k) { s.classList.toggle('on', k === gk); var m = s.querySelector('img'); if (m && k === gk) { m.style.animation = 'none'; void m.offsetWidth; m.style.animation = ''; } }); }
  function gtick() { clearInterval(gt); if (!gp) gt = setInterval(function () { gshow(gk + 1); }, GMS); }
  function gopen() { $('mn').hidden = true; $('gal').hidden = false; gp = false; $('gpp').textContent = 'Pausa'; gshow(0); gtick(); }
  function gclose() { $('gal').hidden = true; clearInterval(gt); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} }
  $('bg').onclick = gopen; $('gx').onclick = gclose;
  $('gpp').onclick = function () { gp = !gp; this.textContent = gp ? 'Seguir' : 'Pausa'; gtick(); };
  function fs() { try { var d = document; if (d.fullscreenElement) d.exitFullscreen(); else d.documentElement.requestFullscreen(); } catch (e) {} }
  $('gfs').onclick = fs; $('bf').onclick = fs;
  document.addEventListener('fullscreenchange', function () { $('bf').textContent = document.fullscreenElement ? 'Salir' : 'Pantalla completa'; });

  /* ---------- menú ---------- */
  function jump(k, j) { $('mn').hidden = true; if (k === 'galeria') gopen(); else go(gi(k) + (j || 0)); }
  function menu(s) {
    var m = $('mn'); m.hidden = s === undefined ? !m.hidden : !s;
    if (!m.hidden) { var g = L[c].dataset.g;[].forEach.call(m.querySelectorAll('.tile'), function (x) { x.classList.toggle('cur', x.dataset.go === g); }); m.scrollTop = 0; }
    $('bar').classList.toggle('inv', m.hidden && L[c].classList.contains('inv'));
  }
  $('bm').onclick = function () { menu(); }; $('mx').onclick = function () { menu(false); };
  $('tn').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { menu(false); go(gi(b.dataset.nv)); } });
  $('pv').onclick = function () { go(c - 1); }; $('nx').onclick = function () { go(c + 1); };
  $('top').onclick = function (e) { e.preventDefault(); go(0); };
  document.addEventListener('click', function (e) { var ch = e.target.closest('.chip'); if (ch) { jump(ch.dataset.go, +ch.dataset.j); return; } var tl = e.target.closest('.tile'); if (tl) jump(tl.dataset.go); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('tile')) jump(e.target.dataset.go); });

  /* ---------- fotos: miniaturas y ampliar ---------- */
  D.addEventListener('click', function (e) {
    var tb = e.target.closest('.tabs button');
    if (tb) { var s = tb.closest('.slide'); s.querySelectorAll('.tabs button').forEach(function (x) { x.classList.toggle('on', x === tb); }); s.querySelectorAll('ul.inc').forEach(function (u) { u.hidden = u.dataset.k !== tb.dataset.k; }); return; }
    var th = e.target.closest('.th img');
    if (th) { var g = th.closest('.gl'); g.querySelector('img.mn').src = th.src; [].forEach.call(g.querySelectorAll('.th img'), function (x) { x.classList.toggle('on', x === th); }); return; }
    var m = e.target.closest('img.mn'); if (m) { $('lb').firstChild.src = m.src; $('lb').hidden = false; }
  });
  $('lb').onclick = function () { this.hidden = true; };

  /* ---------- teclado y gestos ---------- */
  document.addEventListener('keydown', function (e) {
    var k = e.key; if (e.ctrlKey || e.metaKey || e.altKey || /^(Audio|Media|Volume)|^Arrow(Up|Down)$/.test(k)) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (!$('lb').hidden) { if (k === 'Escape') $('lb').hidden = true; return; }
    if (k === ' ' && e.target.closest && e.target.closest('button,a,.tile')) return;
    if (k === 'f' || k === 'F') { fs(); return; }
    var n = parseInt(k, 10); if (!$('mn').hidden && n >= 1 && n <= MT.length) { jump(MT[n - 1]); return; }
    if (!$('gal').hidden) { if (k === 'Escape') gclose(); if (k === 'ArrowRight') { gshow(gk + 1); gtick(); } if (k === 'ArrowLeft') { gshow(gk - 1); gtick(); } if (k === ' ') { e.preventDefault(); $('gpp').click(); } return; }
    if (k === 'Escape') { menu(false); return; }
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(c + 1); } if (k === 'ArrowLeft' || k === 'PageUp') go(c - 1); if (k === 'Home') go(0); if (k === 'End') go(L.length - 1);
  });
  var tx0 = 0, ty0 = 0;
  function sw(el, fn) { el.addEventListener('touchstart', function (e) { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true }); el.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) fn(dx < 0 ? 1 : -1); }, { passive: true }); }
  sw(D, function (d) { go(c + d); }); sw($('gal'), function (d) { gshow(gk + d); gtick(); });

  var q = new URLSearchParams(location.search), h = parseInt(location.hash.slice(1), 10);
  go(h ? h - 1 : 0); if (q.get('galeria')) gopen();
  $('boot').classList.add('off'); setTimeout(function () { $('boot').remove(); }, 500);
})();
