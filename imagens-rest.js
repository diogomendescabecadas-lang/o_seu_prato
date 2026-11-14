/* Fotos do restaurante: logótipo, fotos do espaço e foto de cada prato.
   É carregada pelo api.js na página do restaurante. As fotos são reduzidas aqui antes de seguirem para o servidor. */
(function () {
  if (!window.OSP || !OSP.on) return;
  var KEY = function () { return OSP.store.get('osp_rkey') || ''; };
  var URLB = function (id) { return OSP.base + '/api/imagens/' + id; };
  var btn, box, body, msg, dados = null, pratos = [], ocupado = false;

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  var css = el('style', {}, [
    '.im-fab{position:fixed;left:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 18px;font:700 15px var(--body,system-ui,sans-serif);background:var(--olive,#566A33);color:var(--surface,#fff);box-shadow:0 6px 24px rgba(0,0,0,.25);cursor:pointer;min-height:44px}',
    '.im-fab svg{width:20px;height:20px}',
    '.im-box{position:fixed;inset:0;z-index:80;background:var(--bg,#FBF1E3);color:var(--ink,#2E1F15);font:15px/1.45 var(--body,system-ui,sans-serif);display:flex;flex-direction:column}',
    '.im-box[hidden]{display:none}',
    '.im-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top,0px));border-bottom:1px solid var(--line,#E6D3BB);font:700 18px var(--display,system-ui,sans-serif)}',
    '.im-x{border:0;background:var(--surface2,#F4E6D2);color:inherit;border-radius:999px;width:44px;height:44px;font-size:20px;cursor:pointer}',
    '.im-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:18px;max-width:760px;width:100%;margin:0 auto}',
    '.im-sec{background:var(--surface,#FFF9F0);border:1px solid var(--line,#E6D3BB);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '.im-sec h3{margin:0;font:700 17px var(--display,system-ui,sans-serif)}',
    '.im-note{color:var(--muted,#7A6555);font-size:13.5px;margin:0}',
    '.im-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}',
    '.im-th{position:relative;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:var(--surface2,#F4E6D2)}',
    '.im-th img{width:100%;height:100%;object-fit:cover;display:block}',
    '.im-th.logo img{object-fit:contain}',
    '.im-del{position:absolute;top:6px;right:6px;border:0;border-radius:999px;width:36px;height:36px;background:rgba(0,0,0,.65);color:#fff;font-size:18px;cursor:pointer}',
    '.im-btn{border:1.5px solid var(--line,#E6D3BB);background:var(--surface,#FFF9F0);color:inherit;border-radius:12px;padding:10px 16px;font:700 15px var(--body,system-ui,sans-serif);cursor:pointer;min-height:44px;display:inline-flex;align-items:center;justify-content:center}',
    '.im-btn.main{background:var(--terra,#C0502D);border-color:var(--terra,#C0502D);color:var(--terra-ink,#fff)}',
    '.im-btn[aria-disabled=true]{opacity:.5;pointer-events:none}',
    '.im-prato{display:grid;grid-template-columns:84px 1fr;gap:12px;align-items:center;border-top:1px solid var(--line,#E6D3BB);padding-top:10px}',
    '.im-prato .im-th{aspect-ratio:1/1}',
    '.im-prato .acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}',
    '.im-msg{padding:10px 14px;border-radius:12px;font-weight:600;background:var(--surface2,#F4E6D2)}',
    '.im-msg.err{background:var(--danger-soft,#F9DDD9);color:var(--danger,#B3261E)}',
    '.im-box input[type=file]{display:none}',
    '.im-fab:focus-visible,.im-x:focus-visible,.im-btn:focus-visible,.im-del:focus-visible{outline:3px solid var(--gold,#D99A2B);outline-offset:2px}'
  ].join('\n'));

  function dizer(t, erro) { msg.textContent = t || ''; msg.className = 'im-msg' + (erro ? ' err' : ''); msg.hidden = !t; }

  /** Reduz a foto no próprio aparelho: lado maior limitado e JPEG leve (o logótipo mantém a transparência). */
  function reduzir(file, max, logo) {
    return (window.createImageBitmap ? createImageBitmap(file, { imageOrientation: 'from-image' }) : new Promise(function (ok, no) {
      var u = URL.createObjectURL(file), i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { no(new Error('x')); }; i.src = u;
    })).then(function (img) {
      var w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
      var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      var g = c.getContext('2d');
      var png = logo && /png|webp|svg|gif/.test(file.type);
      if (!png) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
      g.drawImage(img, 0, 0, c.width, c.height);
      var tipo = png ? 'image/png' : 'image/jpeg', q = 0.82, out = c.toDataURL(tipo, q);
      while (out.length * 0.75 > 380000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
      if (out.length * 0.75 > 380000 && png) out = c.toDataURL('image/jpeg', 0.7);
      if (out.length * 0.75 > 380000) { var k2 = 0.7; c.width = Math.round(c.width * k2); c.height = Math.round(c.height * k2); g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', 0.7); }
      return out;
    });
  }

  function enviar(file, tipo, prato) {
    if (!file || ocupado) return;
    if (!/^image\//.test(file.type)) { dizer('Escolha um ficheiro de imagem.', true); return; }
    ocupado = true; dizer('A enviar…');
    reduzir(file, tipo === 'logo' ? 600 : tipo === 'prato' ? 900 : 1400, tipo === 'logo')
      .then(function (d) { return OSP.post('/api/restaurante/imagens', { tipo: tipo, prato: prato, dados: d }, KEY()); })
      .then(function () { dizer('Foto guardada.'); return carregar(); })
      .catch(function (e) { dizer(e.message || 'Não foi possível enviar a foto.', true); })
      .then(function () { ocupado = false; });
  }
  function apagar(id) {
    if (ocupado) return; ocupado = true;
    OSP.post('/api/restaurante/imagens/' + id + '/apagar', {}, KEY())
      .then(function () { dizer('Foto apagada.'); return carregar(); })
      .catch(function (e) { dizer(e.message || 'Não foi possível apagar.', true); })
          .then(function () { ocupado = false; });
  }

  function escolher(tipo, prato, capture) {
    var i = el('input', { type: 'file', accept: 'image/*' });
    i.addEventListener('change', function () { var f = i.files && i.files[0]; if (f) enviar(f, tipo, prato); i.remove(); });
    box.appendChild(i); i.click();
  }
  function th(id, cls, onDel, rotulo) {
    var d = el('div', { class: 'im-th ' + (cls || '') });
    var im = el('img', { src: URLB(id), alt: rotulo || '', loading: 'lazy' }); d.appendChild(im);
    if (onDel) { var x = el('button', { class: 'im-del', type: 'button', 'aria-label': 'Apagar foto' }, '×'); x.addEventListener('click', onDel); d.appendChild(x); }
    return d;
  }
  function botao(texto, fn, main) { var b = el('button', { class: 'im-btn' + (main ? ' main' : ''), type: 'button' }, texto); b.addEventListener('click', fn); return b; }

  function desenhar() {
    body.innerHTML = '';
    body.appendChild(msg);
    var s1 = el('section', { class: 'im-sec' }); s1.appendChild(el('h3', {}, 'Logótipo'));
    s1.appendChild(el('p', { class: 'im-note' }, 'Aparece nos cartões e na página do restaurante. Funciona melhor com fundo transparente ou branco.'));
    if (dados.logo) { var g1 = el('div', { class: 'im-grid' }); g1.appendChild(th(dados.logo, 'logo', function () { apagar(dados.logo); }, 'Logótipo')); s1.appendChild(g1); }
    s1.appendChild(botao(dados.logo ? 'Mudar logótipo' : 'Escolher logótipo', function () { escolher('logo'); }, !dados.logo));
    body.appendChild(s1);

    var s2 = el('section', { class: 'im-sec' }); s2.appendChild(el('h3', {}, 'Fotos do espaço (' + dados.espaco.length + ' de 6)'));
    s2.appendChild(el('p', { class: 'im-note' }, 'A primeira foto é a capa do restaurante. Mostre a sala, a esplanada, a entrada.'));
    if (dados.espaco.length) { var g2 = el('div', { class: 'im-grid' }); dados.espaco.forEach(function (id, i) { g2.appendChild(th(id, '', function () { apagar(id); }, 'Foto do espaço ' + (i + 1))); }); s2.appendChild(g2); }
    var add = botao('Juntar foto do espaço', function () { escolher('espaco'); }, !dados.espaco.length);
    if (dados.espaco.length >= 6) { add.setAttribute('aria-disabled', 'true'); add.textContent = 'Limite de 6 fotos'; }
    s2.appendChild(add); body.appendChild(s2);

    var s3 = el('section', { class: 'im-sec' }); s3.appendChild(el('h3', {}, 'Fotos dos pratos'));
    s3.appendChild(el('p', { class: 'im-note' }, 'Uma foto por prato. Os pratos trancados só se alteram depois de destrancados no menu.'));
    var porPrato = {}; dados.pratos.forEach(function (p) { porPrato[p.prato] = p.imagem; });
    if (!pratos.length) s3.appendChild(el('p', { class: 'im-note' }, 'Ainda não há pratos no menu.'));
    pratos.forEach(function (d) {
      var row = el('div', { class: 'im-prato' });
      var id = porPrato[d.id];
      var bloqueado = !!d.locked;
      row.appendChild(id ? th(id, '', null, d.name) : el('div', { class: 'im-th', 'aria-label': 'Sem foto' }));
      var c = el('div'); c.appendChild(el('b', {}, d.name + (bloqueado ? ' 🔒' : '')));
      var acts = el('div', { class: 'acts' });
      if (bloqueado) acts.appendChild(el('span', { class: 'im-note' }, 'Trancado'));
      else {
        acts.appendChild(botao(id ? 'Mudar foto' : 'Juntar foto', function () { escolher('prato', d.id); }, !id));
        if (id) acts.appendChild(botao('Apagar', function () { apagar(id); }));
      }
      c.appendChild(acts); row.appendChild(c); s3.appendChild(row);
    });
    body.appendChild(s3);
  }

  function carregar() {
    return Promise.all([OSP.get('/api/restaurante/imagens', KEY()), OSP.get('/api/restaurante/menu', KEY())]).then(function (r) { dados = r[0]; pratos = r[1] || []; desenhar(); });
  }
  function abrir() {
    if (!KEY()) { box.hidden = false; body.innerHTML = ''; body.appendChild(msg); dizer('Entre primeiro com a chave do restaurante e volte a abrir as fotos.', true); return; }
    box.hidden = false; btn.setAttribute('aria-expanded', 'true'); dizer('A carregar…');
    carregar().then(function () { dizer(''); }).catch(function (e) { dizer(e.message || 'Não foi possível carregar.', true); });
    box.querySelector('.im-x').focus();
  }
  function fechar() { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }

  function montar() {
    document.head.appendChild(css);
    btn = el('button', { class: 'im-fab', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'im-box' });
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/></svg>';
    btn.appendChild(document.createTextNode('Fotos'));
    box = el('div', { class: 'im-box', id: 'im-box', role: 'dialog', 'aria-label': 'Fotos do restaurante', hidden: 'hidden' });
    var hd = el('div', { class: 'im-hd' }, 'Fotos do restaurante');
    var x = el('button', { class: 'im-x', type: 'button', 'aria-label': 'Fechar' }, '×'); x.addEventListener('click', fechar); hd.appendChild(x);
    body = el('div', { class: 'im-body' }); msg = el('div', { class: 'im-msg', role: 'status', 'aria-live': 'polite', hidden: 'hidden' });
    box.appendChild(hd); box.appendChild(body);
    document.body.appendChild(box); document.body.appendChild(btn);
    btn.addEventListener('click', abrir);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
  }
  if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
})();
