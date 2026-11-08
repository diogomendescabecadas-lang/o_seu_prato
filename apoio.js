/* Janela de apoio de O Seu Prato: assistente com IA e pedido à equipa.
   É carregada pelo api.js nas páginas do cliente e do restaurante (data-papel diz qual). */
(function () {
  if (!window.OSP || !OSP.on) return;
  var me = document.currentScript;
  var ROLE = (me && me.dataset.papel) === 'restaurante' ? 'restaurante' : 'cliente';
  var TOK = function () { return OSP.store.get(ROLE === 'restaurante' ? 'osp_rkey' : 'osp_token') || undefined; };
  var H = [], busy = false, teamBtn = null, formOpen = false;
  var GREET = ROLE === 'restaurante'
    ? 'Olá! Sou o assistente automático de O Seu Prato. Posso ajudar com reservas, cozinha, mesas, menu e stock. Como posso ajudar?'
    : 'Olá! Sou o assistente automático de O Seu Prato. Posso ajudar com reservas, pagamentos, cancelamentos e chegada ao restaurante. Como posso ajudar?';
  var CHIPS = ROLE === 'restaurante'
    ? ['Não vejo uma reserva', 'Como marco uma falta?', 'Como fecho uma mesa?', 'A minha chave não funciona']
    : ['Onde está a minha reserva?', 'Como cancelo uma reserva?', 'O pagamento falhou', 'Já cheguei ao restaurante'];

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  var css = el('style', {}, [
    '.ap-btn{position:fixed;right:16px;bottom:' + (ROLE === 'cliente' ? 'calc(92px + env(safe-area-inset-bottom,0px))' : 'calc(20px + env(safe-area-inset-bottom,0px))') + ';z-index:60;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 18px;font:700 15px var(--body,system-ui,sans-serif);background:var(--terra,#C0502D);color:var(--terra-ink,#fff);box-shadow:0 6px 24px rgba(0,0,0,.25);cursor:pointer}',
    '.ap-btn svg{width:20px;height:20px}',
    '.ap-box{position:fixed;right:16px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:70;width:min(390px,calc(100vw - 24px));height:min(560px,calc(100vh - 190px));display:flex;flex-direction:column;background:var(--surface,#FFF9F0);color:var(--ink,#2E1F15);border:1px solid var(--line,#E6D3BB);border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,.3);font:15px/1.45 var(--body,system-ui,sans-serif);overflow:hidden}',
    '.ap-box[hidden]{display:none}',
    '.ap-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line,#E6D3BB);font:700 16px var(--display,system-ui,sans-serif)}',
    '.ap-x{border:0;background:var(--surface2,#F4E6D2);color:inherit;border-radius:999px;width:34px;height:34px;font-size:18px;cursor:pointer}',
    '.ap-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '.ap-m{max-width:86%;padding:10px 14px;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere}',
    '.ap-m.a{align-self:flex-start;background:var(--surface2,#F4E6D2)}',
    '.ap-m.u{align-self:flex-end;background:var(--terra,#C0502D);color:var(--terra-ink,#fff)}',
    '.ap-chips{display:flex;flex-wrap:wrap;gap:8px}',
    '.ap-chip,.ap-team{border:1.5px solid var(--line,#E6D3BB);background:var(--surface,#FFF9F0);color:inherit;border-radius:999px;padding:8px 14px;font:600 14px var(--body,system-ui,sans-serif);cursor:pointer}',
    '.ap-team{background:var(--olive,#566A33);border-color:var(--olive,#566A33);color:var(--surface,#fff);align-self:flex-start}',
    '.ap-in{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line,#E6D3BB)}',
    '.ap-in input,.ap-form input,.ap-form textarea{font:inherit;color:inherit;background:var(--bg,#FBF1E3);border:1.5px solid var(--line,#E6D3BB);border-radius:12px;padding:10px 12px;min-width:0;width:100%}',
    '.ap-in input{flex:1}',
    '.ap-go{border:0;border-radius:12px;padding:0 16px;font:700 15px var(--body,system-ui,sans-serif);background:var(--terra,#C0502D);color:var(--terra-ink,#fff);cursor:pointer}',
    '.ap-go:disabled{opacity:.5}',
    '.ap-note{padding:0 14px 10px;color:var(--muted,#7A6555);font-size:12.5px}',
    '.ap-form{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '.ap-form label{display:flex;flex-direction:column;gap:4px;font-weight:700;font-size:13.5px}',
    '.ap-form label.c{flex-direction:row;gap:10px;font-weight:400;align-items:flex-start}',
    '.ap-form label.c input{width:22px;height:22px;flex:none}',
    '.ap-form textarea{min-height:90px;resize:vertical}',
    '.ap-err{color:var(--danger,#B3261E);font-weight:600}',
    '.ap-btn:focus-visible,.ap-x:focus-visible,.ap-chip:focus-visible,.ap-team:focus-visible,.ap-go:focus-visible,.ap-box input:focus-visible,.ap-box textarea:focus-visible{outline:3px solid var(--gold,#D99A2B);outline-offset:2px}'
  ].join('\n'));

  var btn, box, msgs, input, send, form, chips;

  function scroll() { msgs.scrollTop = msgs.scrollHeight; }
  function add(role, text, keep) {
    msgs.appendChild(el('div', { class: 'ap-m ' + (role === 'user' ? 'u' : 'a') }, text));
    if (keep !== false) H.push({ role: role, content: text });
    scroll();
  }
  function offerTeam() {
    if (teamBtn) teamBtn.remove();
    teamBtn = el('button', { class: 'ap-team', type: 'button' }, 'Falar com a equipa');
    teamBtn.addEventListener('click', openForm);
    msgs.appendChild(teamBtn); scroll();
  }
  function say(text) {
    if (chips) { chips.remove(); chips = null; }
    if (busy || !text.trim()) return;
    add('user', text.trim().slice(0, 500));
    busy = true; send.disabled = true;
    var wait = el('div', { class: 'ap-m a' }, 'A escrever…'); msgs.appendChild(wait); scroll();
    OSP.post('/api/apoio/conversa', { mensagens: H.slice(-12) }, TOK())
      .then(function (r) { wait.remove(); add('assistant', r.resposta); if (r.escalar) offerTeam(); })
      .catch(function (e) { wait.remove(); add('assistant', e.message || 'Não consegui ligar ao servidor.'); offerTeam(); })
      .then(function () { busy = false; send.disabled = false; input.focus(); });
  }

  function openForm() {
    formOpen = true; msgs.hidden = true; document.getElementById('ap-bar').hidden = true;
    form = el('form', { class: 'ap-form', novalidate: 'novalidate' });
    var last = ''; for (var i = H.length - 1; i >= 0; i--) if (H[i].role === 'user') { last = H[i].content; break; }
    var f = {};
    function field(key, label, tag, val, attrs) {
      var l = el('label', {}, label); var i = el(tag, attrs || {}); if (val) i.value = val; f[key] = i; l.appendChild(i); form.appendChild(l);
    }
