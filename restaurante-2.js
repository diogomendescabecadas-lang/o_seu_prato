function resCard(r,compact){
  const [l,c]=stLabel[r.st];
  const ordTag=active(r)&&r.st!=='concluida'?`<span class="pill ${r.ord==='pronto'?'p-sent':r.ord==='preparar'?'p-cheg':'p-done'}">Pratos: ${ordLabel[r.ord].toLowerCase()}</span>`:'';
  const start=tm(r.time)-(r.prepMin||PREP);
  const urgent=sameDay(r)&&active(r)&&r.ord==='novo'&&!waitArr(r)&&(r.arr||S.now>=start)&&r.st!=='concluida';
  const free=TABLES.filter(t=>t.n>=r.party&&!tableBusy(t.id));
  return `<div class="panel" ${isNew(r)?'style="border-color:var(--terra);box-shadow:0 0 0 2px var(--terra-soft,#f3d3c6)"':''}><div class="res"><div class="t num">${r.time}<small>${r.date&&r.date!==TODAY()?dLabel(r.date):r.party+' pess.'}</small></div><div style="min-width:0">
  <div class="nm">${isNew(r)?'<span class="pill p-bad">Nova</span>':''}<b>${esc(r.name)}</b><span class="pill ${c}">${l}</span>${ordTag}${r.table?`<span class="pill p-done">${r.st==='confirmada'?'Mesa '+r.table+' reservada':'Mesa '+r.table}</span>`:''}</div>
  <div class="items"><b>Mesa reservada:</b> ${r.table||'por atribuir'} · ${r.party} ${r.party>1?'pessoas':'pessoa'} · ${r.time}</div>
  <div class="items"><b>Pedido:</b> ${itemsTxt(r)}</div>
  ${isNew(r)?`<div class="acts"><button class="btn sec" data-a="seen" data-v="${r.code}">Marcar como vista</button></div>`:''}<div class="meta num">${r.code} · pago ${eur(r.paid)}</div>
  ${r.note?`<div class="alert">${esc(r.note)}</div>`:''}
  ${isLate(r)?`<div class="late">Atrasada ${S.now-tm(r.time)} min. Pode contactar o cliente ou libertar a mesa.</div>`:''}
  ${urgent?`<div class="late">${r.arr?'Cliente chegou: iniciar a preparação agora.':'Iniciar a preparação agora para servir às '+r.time+'.'}</div>`:''}${r.claim&&r.st==='confirmada'?`<div class="late" style="background:var(--olive-soft,#e3e8cf);color:inherit"><b>O cliente indicou na app que chegou às ${r.claim}.</b> Se marcar falta, a administração analisa o caso.</div>`:''}${waitArr(r)&&active(r)?`<div class="meta"><b>Só à chegada:</b> o cliente já pagou, a cozinha começa quando ele chegar.</div>`:''}
  <div class="acts">${actions(r)}</div>
  ${S.pick===r.code?`<div class="opts"><p>Escolha a mesa para ${r.party} ${r.party>1?'pessoas':'pessoa'}</p>${TABLES.map(t=>`<button class="opt" data-a="seat" data-v="${r.code}|${t.id}" ${t.n>=r.party&&!tableBusy(t.id)?'':'disabled'}>${t.id} · ${t.n}</button>`).join('')}${free.length?'':'<p>Sem mesa livre com lugares suficientes.</p>'}<button class="btn ghost" data-a="pick" data-v="">Cancelar</button></div>`:''}
  </div></div></div>`;
}

function newBox(){
  const l=newList();if(!l.length)return '';
  return `<div class="panel" style="border-color:var(--terra)"><h2 class="sec" style="margin-top:0">${l.length} ${l.length>1?'novas reservas':'nova reserva'}</h2>${l.map(r=>`<div class="line" style="align-items:center;gap:10px"><div style="min-width:0"><b class="num">${r.date&&r.date!==TODAY()?dLabel(r.date)+' · ':''}${r.time}</b> · ${esc(r.name)}<div class="meta">${mesaTxt(r)} · ${r.party} ${r.party>1?'pessoas':'pessoa'}</div><div class="meta">Pedido: ${itemsTxt(r)}</div>${r.note?`<div class="alert">${esc(r.note)}</div>`:''}</div><button class="btn sec" data-a="seen" data-v="${r.code}">Vista</button></div>`).join('')}</div>`;
}
function hoje(){
  const act=S.R.filter(active);
  const pend=act.filter(r=>['confirmada','chegou'].includes(r.st));
  const next=sorted().filter(r=>['confirmada','chegou'].includes(r.st)).slice(0,4);
  const prep=act.filter(r=>r.st!=='concluida'&&['novo','preparar'].includes(r.ord)).length;
  const alerts=sorted().filter(r=>(r.note||isLate(r))&&['confirmada','chegou','sentada'].includes(r.st));
  const rev=act.reduce((a,r)=>a+r.paid,0);
  const seats=TABLES.reduce((a,t)=>a+t.n,0);
  const occ=TABLES.filter(t=>tableBusy(t.id)).reduce((a,t)=>a+t.n,0);
  return newBox()+`<div class="tiles"><div class="tile"><small>Reservas hoje</small><b class="num">${act.length}</b><span class="num">${pend.length} por chegar</span></div>
  <div class="tile"><small>Pessoas</small><b class="num">${act.reduce((a,r)=>a+r.party,0)}</b><span>${S.R.filter(r=>!active(r)).length} canceladas</span></div>
  <div class="tile"><small>Pratos por preparar</small><b class="num">${prep}</b><span>encomendas na cozinha</span></div>
  <div class="tile"><small>Pré-pago hoje</small><b class="num">${eur(rev)}</b><span>${Math.round(occ/seats*100)}% da sala ocupada</span></div></div>
  <div class="two"><div><h2 class="sec">Próximas chegadas</h2>${next.length?next.map(r=>resCard(r)).join(''):'<div class="empty">Sem mais chegadas previstas.</div>'}</div>
  <div><h2 class="sec">Atenção</h2>${alerts.length?alerts.map(r=>`<div class="panel"><b>${r.time} · ${esc(r.name)}</b><div class="${isLate(r)?'late':'alert'}" style="margin-top:6px">${isLate(r)?'Atrasada '+(S.now-tm(r.time))+' min':esc(r.note)}</div></div>`).join(''):'<div class="empty">Nada a assinalar.</div>'}</div></div>`;
}
function reservas(){
  const f=S.f;
  if(ON){
    const days=[];const n=new Date();for(let i=0;i<7;i++){const d=new Date(n);d.setDate(n.getDate()+i);days.push(OSP.isoDate(d))}
    if(!S.day)S.day=days[0];
    const dayChips=`<div class="chips" role="group" aria-label="Dia">${days.map(d=>{const c=ALLR().filter(r=>r.date===d&&active(r)).length,nw=ALLR().filter(r=>r.date===d&&isNew(r)).length;return `<button class="chip num" data-a="rday" data-v="${d}" aria-pressed="${S.day===d}">${dLabel(d)} · ${c}${nw?' ●':''}</button>`}).join('')}</div>`;
    const base=ALLR().filter(r=>r.date===S.day);
    const filt2={todas:()=>true,proximas:r=>r.st==='confirmada',sala:r=>['chegou','sentada'].includes(r.st),fim:r=>['concluida','cancelada','naoveio'].includes(r.st)}[f];
    const list2=[...base].sort((a,b)=>tm(a.time)-tm(b.time)).filter(filt2);
    const L2=[['todas','Todas'],['proximas','Por chegar'],['sala','Na sala'],['fim','Terminadas']];
    const cnt=k=>base.filter({todas:()=>true,proximas:r=>r.st==='confirmada',sala:r=>['chegou','sentada'].includes(r.st),fim:r=>['concluida','cancelada','naoveio'].includes(r.st)}[k]).length;
    return dayChips+`<div class="chips">${L2.map(([k,l])=>`<button class="chip num" data-a="f" data-v="${k}" aria-pressed="${f===k}">${l} · ${cnt(k)}</button>`).join('')}</div>`+(list2.length?list2.map(r=>resCard(r)).join(''):'<div class="empty">Sem reservas neste dia.</div>');
  }
  const filt={todas:()=>true,proximas:r=>r.st==='confirmada',sala:r=>['chegou','sentada'].includes(r.st),fim:r=>['concluida','cancelada','naoveio'].includes(r.st)}[f];
  const list=sorted().filter(filt);
  const counts={todas:S.R.length,proximas:S.R.filter(r=>r.st==='confirmada').length,sala:S.R.filter(r=>['chegou','sentada'].includes(r.st)).length,fim:S.R.filter(r=>['concluida','cancelada','naoveio'].includes(r.st)).length};
  const L=[['todas','Todas'],['proximas','Por chegar'],['sala','Na sala'],['fim','Terminadas']];
  return `<div class="chips">${L.map(([k,l])=>`<button class="chip num" data-a="f" data-v="${k}" aria-pressed="${f===k}">${l} · ${counts[k]}</button>`).join('')}</div>
  ${list.length?list.map(r=>resCard(r)).join(''):'<div class="empty">Sem reservas neste filtro.</div>'}`;
}
