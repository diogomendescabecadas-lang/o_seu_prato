
/* O servidor de O Seu Prato (Render). Para usar outro, abra a página com ?api=https://endereco */
window.OSP_API_DEFAULT = window.OSP_API_DEFAULT || 'https://o-seu-prato-api.onrender.com';
/* Ligação ao servidor de O Seu Prato.
   Sem endereço configurado, as páginas funcionam como demonstração (dados de exemplo).
   Para ligar: abrir a página com ?api=https://endereco-do-servidor   (e ?api=off para desligar). */
window.OSP = (function () {
  const store = {
    get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
    set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} },
  };
  const q = new URLSearchParams(location.search).get('api');
  if (q === 'off') store.set('osp_api', '');
  else if (q && /^https?:\/\//.test(q)) store.set('osp_api', q.replace(/\/+$/, ''));
  const base = store.get('osp_api') || (window.OSP_API_DEFAULT || '');

  async function call(method, path, body, token) {
    let res;
    try {
      res = await fetch(base + path, {
        method,
        headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) { throw new Error('Sem ligação ao servidor. Tente outra vez.'); }
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) { const err = new Error((data && data.erro) || 'Erro ' + res.status); err.status = res.status; throw err; }
    return data;
  }
  /** Canal de avisos em tempo real. Liga-se, reconecta sozinho e devolve uma função para parar.
      onEvent(tipo) é chamado a cada aviso; onState('ligado'|'desligado') diz se o canal está vivo. */
  function stream(path, token, onEvent, onState) {
    let stopped = false, ctl = null, wait = 1000;
    async function run() {
      while (!stopped) {
        ctl = new AbortController();
        try {
          const res = await fetch(base + path, { headers: token ? { authorization: 'Bearer ' + token } : {}, signal: ctl.signal });
          if (!res.ok) throw new Error('stream ' + res.status);
          wait = 1000; if (onState) onState('ligado');
          const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '';
          for (;;) {
            const r = await reader.read(); if (r.done) break;
            buf += dec.decode(r.value, { stream: true });
            let i; while ((i = buf.indexOf('\n\n')) >= 0) {
              const m = /^data: (.*)$/m.exec(buf.slice(0, i)); buf = buf.slice(i + 2);
              if (m) { try { onEvent(JSON.parse(m[1]).tipo); } catch (e) {} }
            }
          }
        } catch (e) { if (stopped) return; }
        if (stopped) return;
        if (onState) onState('desligado');
        await new Promise(r => setTimeout(r, wait)); wait = Math.min(wait * 2, 15000);
      }
    }
    run();
    return function stop() { stopped = true; try { ctl && ctl.abort(); } catch (e) {} };
  }
  return {
    on: !!base, base, store, call, stream,
    get: (p, t) => call('GET', p, undefined, t),
    post: (p, b, t) => call('POST', p, b || {}, t),
    cents: (n) => n / 100,
    toCents: (e) => Math.round(e * 100),
    isoDate: (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
  };
})();
