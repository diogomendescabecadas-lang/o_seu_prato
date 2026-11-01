function stockReport(){
  if(!ON||!S.stk)return '';
  const it=S.stk.items,why={reserva:'Reserva',devolucao:'Devolvido',ajuste:'Ajuste',inicial:'Inicial'};
  return `<h2 class="sec">Consumo dos últimos ${S.stk.days} dias</h2><div class="panel">`+
    (it.filter(i=>i.sold||i.status!=='ok').map(i=>`<div class="meta" style="display:flex;justify-content:space-between;gap:8px;padding:4px 0"><span>${esc(i.name)}</span><span>${i.sold} vendidas · ${i.status==='ok'?'em stock '+i.stock:i.status==='baixo'?'stock baixo ('+i.stock+')':'esgotado'}</span></div>`).join('')||'<span class="meta">Ainda sem movimentos.</span>')+
    `</div><h2 class="sec">Últimos movimentos</h2><div class="panel">`+
    (S.stk.recent.slice(0,10).map(m=>`<div class="meta" style="display:flex;justify-content:space-between;gap:8px;padding:3px 0"><span>${esc(m.dish)} · ${why[m.reason]||m.reason}</span><span>${m.delta>0?'+':''}${m.delta}</span></div>`).join('')||'<span class="meta">Sem movimentos.</span>')+`</div>`;
}
function menu(){
  const cats=['Todos',...new Set(MENU.map(d=>d.cat))];
  const l=MENU.filter(d=>S.mf==='Todos'||d.cat===S.mf);
  return `<div class="chips">${cats.map(c=>`<button class="chip" data-a="mf" data-v="${c}" aria-pressed="${S.mf===c}">${c}</button>`).join('')}</div>
  <div class="two"><div>${l.map(d=>{
    const st=!d.on?['Indisponível','p-bad']:d.stock<=(d.low??3)?['Stock baixo','p-cheg']:['À venda','p-sent'];
    return `<div class="panel mi"><div style="min-width:0"><h4>${esc(d.name)}</h4><span class="meta">${d.cat}</span></div><span class="pill ${st[1]}">${st[0]}</span>
    <div class="ctl"><label class="lbl">Preço (€)<input type="number" step="0.1" min="0" value="${d.price}" data-price="${d.id}" aria-label="Preço de ${esc(d.name)}"></label>
    <div class="lbl">Stock hoje<span class="stepper"><button data-a="stk" data-v="${d.id}|-1" aria-label="Menos">−</button><span class="num">${d.stock}</span><button data-a="stk" data-v="${d.id}|1" aria-label="Mais">+</button></span></div>
    <label class="lbl">Avisar abaixo de<input type="number" min="0" value="${d.low??3}" data-low="${d.id}" aria-label="Avisar stock baixo de ${esc(d.name)}"></label>
    <div class="lbl">Disponível<button class="sw" role="switch" aria-checked="${d.on}" data-a="on" data-v="${d.id}" aria-label="Disponível: ${esc(d.name)}"></button></div></div></div>`}).join('')}</div>
  <div><h2 class="sec" style="margin-top:0">Novo prato</h2><div class="panel"><div class="form">
    <label class="lbl" style="flex:1 1 100%">Nome<input type="text" id="nd-name" placeholder="Ex.: Açorda de gambas"></label>
    <label class="lbl">Categoria<select id="nd-cat">${[...new Set(MENU.map(d=>d.cat))].map(c=>`<option>${c}</option>`).join('')}</select></label>
    <label class="lbl">Preço (€)<input type="number" id="nd-price" step="0.1" min="0" value="12.5"></label>
    <label class="lbl">Stock<input type="number" id="nd-stock" min="0" value="10"></label>
    <button class="btn" data-a="newdish">Adicionar ao menu</button></div></div>
  ${stockReport()}
  <p class="meta">Ao iniciar um pedido na cozinha, o stock desce automaticamente. Quando chega a zero, o prato deixa de aparecer como disponível para os clientes.</p></div></div>`;
}
function aval(){
  if(ON)return `<div class="empty">As avaliações dos clientes chegam numa próxima fase.</div>`;
  const n=REV.length,avg=REV.reduce((a,v)=>a+v.r,0)/n;
  const l=REV.filter(v=>S.revf==='todas'||!v.reply);
  return `<div class="two"><div><div class="chips">${[['todas','Todas'],['sem','Sem resposta']].map(([k,t])=>`<button class="chip" data-a="revf" data-v="${k}" aria-pressed="${S.revf===k}">${t}</button>`).join('')}</div>
  ${l.length?l.map(v=>`<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(v.u)}</b><span class="meta">${v.d}</span></div><div class="star">${'★'.repeat(v.r)}${'☆'.repeat(5-v.r)}</div><p style="margin:4px 0 0">${esc(v.t)}</p>
  ${v.reply?`<div class="reply"><b>A sua resposta</b><br>${esc(v.reply)}</div>`:`<textarea id="rp-${v.id}" placeholder="Responder ao cliente" style="margin-top:8px"></textarea><div class="acts"><button class="btn" data-a="reply" data-v="${v.id}">Responder</button></div>`}</div>`).join(''):'<div class="empty">Todas as avaliações têm resposta.</div>'}</div>
  <div class="panel"><div style="display:flex;gap:12px;align-items:baseline"><h2 class="num" style="font-size:40px">${avg.toFixed(1)}</h2><span class="star">${'★'.repeat(Math.round(avg))}</span><span class="meta num">${n} avaliações</span></div>
  ${[5,4,3,2,1].map(s=>{const c=REV.filter(v=>v.r===s).length;return `<div class="dist"><span class="num">${s}★</span><span class="tr"><i style="width:${c/n*100}%"></i></span><span class="num">${c}</span></div>`}).join('')}
  <p class="meta" style="margin-bottom:0">Só clientes que concluíram uma refeição podem avaliar.</p></div></div>`;
}
