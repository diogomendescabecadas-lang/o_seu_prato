function kcard(r){
  const start=tm(r.time)-(r.prepMin||PREP);
  const wait=waitArr(r);
  const urgent=!wait&&r.ord==='novo'&&(r.arr||S.now>=start);
  const nxt={novo:['Iniciar','start'],preparar:['Marcar pronto','ready'],pronto:['Entregue','serve']}[r.ord];
  return `<div class="kc ${urgent?'urgent':''}"><div class="hd"><b class="num" style="font-family:var(--display);font-size:18px">${r.time}</b><span class="meta">${esc(r.name)} · ${r.party} pess.</span></div>
  <ul>${r.items.map(([id,q])=>`<li><b class="num">${q}×</b> ${DISH[id][0]}</li>`).join('')}</ul>
  ${r.note?`<div class="alert">${esc(r.note)}</div>`:''}
  <div class="meta" style="margin-top:8px">${wait?'<b>Só à chegada:</b> aguarda o cliente (já pagou)':r.ord==='novo'?(urgent?'<b style="color:var(--terra)">Iniciar agora</b>':'Iniciar às '+hm(start)):r.ord==='pronto'?(r.st==='chegou'||r.st==='sentada'?'Cliente na sala: servir':'A aguardar o cliente'):'Em preparação'}</div>
  <div class="acts"><button class="btn ${r.ord==='pronto'?'ok':''}" data-a="${nxt[1]}" data-v="${r.code}" ${wait?'disabled':''}>${wait?'Aguarda chegada':nxt[0]}</button></div></div>`;
}
function cozinha(){
  const q=sorted().filter(r=>active(r)&&r.ord!=='servido');
  const col=(k,t)=>{const l=q.filter(r=>r.ord===k);return `<div class="col"><h3>${t}<span class="cnt">${l.length}</span></h3>${l.length?l.map(kcard).join(''):'<div class="empty" style="padding:16px">Vazio</div>'}</div>`};
  return `<p class="meta" style="margin-top:0">Os pedidos chegam já pagos. A preparação sugerida começa ${PREP} min antes da hora de chegada. Os pedidos marcados «Só à chegada» esperam que o cliente chegue.</p><div class="grid2">${col('novo','Por iniciar')}${col('preparar','A preparar')}${col('pronto','Prontos')}</div>`;
}
function next7(){const a=[];const n=new Date();for(let i=0;i<7;i++){const d=new Date(n);d.setDate(n.getDate()+i);a.push(d)}return a}
function avail(){
  const days=next7();
  const open=TABLES.filter(t=>t.online).length;
  return `<h2 class="sec" style="margin-top:0">Disponibilidade para reservas online</h2><div class="panel">
  <p class="meta" style="margin-top:0">Só as mesas abertas aparecem aos clientes. ${open?`<b>${open} de ${TABLES.length}</b> mesas abertas (${TABLES.filter(t=>t.online).reduce((a,t)=>a+t.n,0)} lugares).`:'<b>Nenhuma mesa aberta: os clientes não conseguem reservar.</b>'}</p>
  <div class="opts">${TABLES.map(t=>`<button class="opt" data-a="tonline" data-v="${t.id}" aria-pressed="${t.online}">${t.id} · ${t.n}<small>${t.online?'Aberta':'Fechada'}</small></button>`).join('')}</div>
  <p class="meta">Dias em que aceita reservas online (toque para fechar ou abrir o dia):</p>
  <div class="opts">${days.map(d=>{const iso=OSP.isoDate(d);const closed=S.closed.has(iso);return `<button class="opt" data-a="day" data-v="${iso}" aria-pressed="${!closed}">${d.toLocaleDateString('pt-PT',{weekday:'short'}).replace('.','')} ${d.getDate()}/${d.getMonth()+1}<small>${closed?'Fechado':'Aberto'}</small></button>`}).join('')}</div></div>`;
}
function mesas(){
  return avail()+`<div class="legend"><span><i></i>Livre</span><span><i style="background:var(--gold-soft);border-color:var(--gold)"></i>Reservada</span><span><i style="background:var(--olive-soft);border-color:var(--olive)"></i>Ocupada</span></div>
  <div class="tables">${TABLES.map(t=>{const b=tableBusy(t.id),s=tableSoon(t.id);
   return `<div class="tb ${b?'occ':s?'soon':''}"><h4>${t.id}</h4><small>${t.n} lugares${t.online?'':' · fechada online'}</small>${b?`<b style="font-size:14px">${esc(b.name)}</b><small>${b.party} pess. · ${b.st==='chegou'?'à espera':'servida'}</small>`:s?`<b style="font-size:14px">${s.time} · ${esc(s.name)}</b><small>${s.party} pess.</small>`:'<small style="margin-top:8px">Disponível</small>'}</div>`}).join('')}</div>`;
}
