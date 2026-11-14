/* Imagens na página do cliente: capa e logótipo dos restaurantes, fotos do espaço e fotos dos pratos.
   É carregada pelo api.js. Não mexe na lógica da página: só acrescenta imagens por cima do que já existe. */
(function () {
  if (!window.OSP || !OSP.on) return;
  var URLB = function (id) { return OSP.base + '/api/imagens/' + id; };
  var resumo = null, resumoAt = 0, listas = {}, pedidos = {}, timer = null, lb = null;

  var css = document.createElement('style');
  css.textContent = [
    '.im-logo{position:absolute;right:12px;bottom:12px;width:52px;height:52px;border-radius:50%;object-fit:cover;background:#fff;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.25)}',
    '.im-cap{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.cover.im-has>svg,.cover.im-has>.pl{display:none}',
    '.dish .ph.im-has{padding:0;overflow:hidden;background:var(--surface2,#F4E6D2)}',
    '.dish .ph.im-has>svg{display:none}',
    '.dish .ph img{width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in}',
    '.im-gal{display:flex;gap:10px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:thin}',
    '.im-gal button{flex:none;border:0;padding:0;background:none;border-radius:14px;overflow:hidden;cursor:zoom-in}',
    '.im-gal img{display:block;width:168px;height:112px;object-fit:cover}',
    '.im-lb{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.88);display:grid;place-items:center;padding:16px;cursor:zoom-out}',
    '.im-lb img{max-width:100%;max-height:100%;border-radius:12px}'
  ].join('\n');
  document.head.appendChild(css);

  function abrir(id) {
    if (lb) lb.remove();
    lb = document.createElement('div'); lb.className = 'im-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Imagem ampliada');
    var im = document.createElement('img'); im.src = URLB(id); im.alt = '';
    lb.appendChild(im);
    lb.addEventListener('click', function () { lb.remove(); lb = null; });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape' && lb) { lb.remove(); lb = null; document.removeEventListener('keydown', esc); } });
    document.body.appendChild(lb);
  }

  function getResumo() {
    if (resumo && Date.now() - resumoAt < 60000) return resumo;
    if (!pedidos.__r) {
      pedidos.__r = OSP.get('/api/imagens/resumo').then(function (r) { resumo = r; resumoAt = Date.now(); }).catch(function () { resumo = resumo || {}; resumoAt = Date.now(); })
        .then(function () { delete pedidos.__r; agendar(); });
    }
    return resumo;
  }
  function getLista(rid) {
    var l = listas[rid];
    if (l && Date.now() - l.at < 60000) return l.d;
    if (!pedidos[rid]) {
      pedidos[rid] = OSP.get('/api/restaurantes/' + encodeURIComponent(rid) + '/imagens').then(function (d) { listas[rid] = { d: d, at: Date.now() }; })
        .catch(function () { listas[rid] = listas[rid] || { d: { logo: null, espaco: [], pratos: [] }, at: Date.now() }; })
        .then(function () { delete pedidos[rid]; agendar(); });
    }
    return l ? l.d : null;
  }

  function cobrir(el, capa, logo) {
    var chave = (capa || '') + '|' + (logo || '');
    if (el.getAttribute('data-im') === chave) return;
    el.setAttribute('data-im', chave);
    Array.prototype.forEach.call(el.querySelectorAll('.im-cap,.im-logo'), function (n) { n.remove(); });
    el.classList.toggle('im-has', !!capa);
    if (capa) { var c = document.createElement('img'); c.className = 'im-cap'; c.src = URLB(capa); c.alt = ''; c.loading = 'lazy'; el.insertBefore(c, el.firstChild); }
    if (logo) {
      var l = document.createElement('img'); l.className = 'im-logo'; l.src = URLB(logo); l.alt = 'Logótipo'; l.loading = 'lazy';
      // com logótipo sem foto do espaço, o logótipo ocupa a capa inteira
      if (!capa) { l.className = 'im-cap'; l.style.objectFit = 'contain'; l.style.background = '#fff'; el.classList.add('im-has'); }
      el.appendChild(l);
    }
  }

  function decorar() {
    timer = null;
    if (typeof S === 'undefined') return;
    // 1) cartões da lista de restaurantes
    var rs = getResumo();
    if (rs) Array.prototype.forEach.call(document.querySelectorAll('button.cover[data-a="open"][data-v]'), function (b) {
      var r = rs[b.getAttribute('data-v')]; if (r) cobrir(b, r.capa, r.capa ? r.logo : r.logo);
    });
    // 2) ecrã do restaurante: capa, galeria e fotos dos pratos
    var rid = S.crid || S.rid;
    var capaDiv = document.querySelector('div.cover:not(.im-skip)');
    var temPratos = document.querySelector('.dish .ph');
    if (rid && (capaDiv || temPratos)) {
      var l = getLista(rid);
      if (l) {
        if (capaDiv && S.screen === 'rest') cobrir(capaDiv, l.espaco[0], l.logo);
        if (capaDiv && S.screen === 'rest' && l.espaco.length > 1) {
          var g = document.querySelector('.im-gal'); var chave = l.espaco.join(',');
          if (!g || g.getAttribute('data-im') !== chave) {
            if (g) g.remove();
            g = document.createElement('div'); g.className = 'im-gal'; g.setAttribute('data-im', chave); g.setAttribute('aria-label', 'Fotos do restaurante');
            l.espaco.forEach(function (id, i) {
              var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ampliar foto ' + (i + 1));
              var im = document.createElement('img'); im.src = URLB(id); im.alt = 'Foto do restaurante ' + (i + 1); im.loading = 'lazy'; b.appendChild(im);
              b.addEventListener('click', function () { abrir(id); }); g.appendChild(b);
            });
            var rh = document.querySelector('.rhead'); if (rh) rh.parentNode.insertBefore(g, rh);
          }
        }
        var porNome = {}; l.pratos.forEach(function (p) { porNome[p.nome] = p.imagem; });
        Array.prototype.forEach.call(document.querySelectorAll('.dish'), function (d) {
          var h = d.querySelector('h4'), ph = d.querySelector('.ph'); if (!h || !ph) return;
          var id = porNome[h.textContent.trim()]; if (!id) return;
          if (ph.getAttribute('data-im') === id) return;
          ph.setAttribute('data-im', id); ph.classList.add('im-has'); ph.innerHTML = '';
          var im = document.createElement('img'); im.src = URLB(id); im.alt = h.textContent.trim(); im.loading = 'lazy';
          im.addEventListener('click', function () { abrir(id); }); ph.appendChild(im);
        });
              }
    }
  }
  function agendar() { if (!timer) timer = setTimeout(decorar, 60); }
  new MutationObserver(agendar).observe(document.body || document.documentElement, { childList: true, subtree: true });
  window.addEventListener('focus', function () { resumoAt = 0; agendar(); });
  agendar();
})();
