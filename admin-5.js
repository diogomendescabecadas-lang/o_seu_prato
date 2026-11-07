function disp(){
  if(!ON)return '<div class="empty">As disputas de faltas aparecem aqui quando o serviço estiver ligado.</div>';
  if(!DISP.length)return '<div class="empty">Sem disputas abertas.</div>';
  return `<p class="meta" style="margin-top:0">Quando um cliente contesta uma falta, ou diz na app que chegou e o restaurante marca falta, o dinheiro fica retido até decidir.</p><div class="grid">`+DISP.map(d=>`<div class="panel">
  <div class="nm"><b>${esc(d.restaurantName)}</b> <span class="pill p-bad">${String(d.disputeNote||'').startsWith('Problema')?'Problema reportado':'Falta contestada'}</span></div>
  <div class="meta">Cliente: ${esc(d.customerName)} · Reserva ${d.code} · ${d.date.slice(8)}/${d.date.slice(5,7)} às ${d.time}</div>
  <div class="meta">Valor retido: <b>${eur(d.heldCents/100)}</b>${d.arrivedClaim?' · Cliente indicou chegada às '+d.arrivedClaim.slice(11):''}</div>
  <div class="meta">${esc(d.disputeNote||'')}</div>
  <div class="acts">${confirmBtn('dc'+d.id,'Dar razão ao cliente (devolver)','dispC',d.id,'ghost')}${confirmBtn('dr'+d.id,'Dar razão ao restaurante (libertar)','dispR',d.id,'ghost')}</div></div>`).join('')+'</div>';
}
function rest(){
  const nk=S.newKey?`<div class="panel" style="border-color:var(--olive)"><h3 style="font-size:17px">Restaurante aprovado: ${esc(S.newKey.name)}</h3><p class="meta">Esta é a chave de acesso do restaurante. <b>Só aparece agora</b>: copie-a e envie-a ao restaurante por um canal seguro.</p><textarea class="csv" id="keybox" readonly>${esc(S.newKey.key)}</textarea><div class="acts"><button class="btn" data-a="closekey">Já copiei</button></div></div>`:'';
  const F=[['todos','Todos'],['ativo','Ativos'],['pendente','Por aprovar'],['suspenso','Suspensos']];
  const l=RS.filter(r=>S.rf==='todos'||r.st===S.rf);
  return nk+`<div class="chips">${F.map(([k,t])=>`<button class="chip" data-a="rf" data-v="${k}" aria-pressed="${S.rf===k}">${t}</button>`).join('')}</div>
  <div class="grid">${l.map(r=>{const [pl,pc]=rstPill[r.st];return `<div class="panel"><div class="row"><div><h3 style="font-size:18px">${r.name}</h3><div class="meta">${r.cuisine} · ${r.city}</div></div><span class="pill ${pc}">${pl}</span></div>
  ${r.st==='pendente'?`<div class="meta" style="margin-top:8px">${ON?'Pedido de adesão recebido. Contacto: '+esc(r.contact||'—')+'. Confirme a licença e a morada antes de aprovar.':'Pedido de adesão com documentação enviada. Confirme a licença e a morada antes de aprovar.'}</div>`:`<div class="meta num" style="margin-top:8px">${r.res} reservas · ${eur(r.gmv,0)} · ${r.rating?'★ '+r.rating.toFixed(1):'sem avaliações'}</div>`}
  ${r.why?`<div class="meta" style="margin-top:6px;color:var(--danger)">${r.why}</div>`:''}
  <div class="acts">${r.st==='pendente'?`<button class="btn ok" data-a="approve" data-v="${r.id}">Aprovar</button>${confirmBtn('rj'+r.id,'Recusar','reject',r.id)}`:
   r.st==='ativo'?`<label class="lbl" style="flex-direction:row;align-items:center;gap:8px">Comissão <input type="number" min="0" max="30" step="0.5" value="${r.rate}" data-rate="${r.id}" aria-label="Comissão de ${esc(r.name)}"> %</label>${confirmBtn('sp'+r.id,'Suspender','suspend',r.id)}`:
   `<button class="btn" data-a="reactivate" data-v="${r.id}">Reativar</button>`}</div></div>`}).join('')}</div>`;
}
function cli(){
  const q=S.q.trim().toLowerCase();
  const l=CL.filter(c=>!q||(c.name+c.city).toLowerCase().includes(q));
  const pre=ON&&PRE.length?`<h2 class="sec">Pré-registos (${PRE.length})</h2><div class="panel tbl"><table><thead><tr><th>Nome</th><th>Email</th><th>Telemóvel</th><th>Restaurante</th></tr></thead><tbody>${PRE.map(p=>`<tr><td>${esc(p.nome)}</td><td>${esc(p.email)}</td><td>${esc(p.telemovel||'')}</td><td>${esc(p.restaurante||'')}</td></tr>`).join('')}</tbody></table></div><h2 class="sec">Contas</h2>`:'';
  return pre+`<label class="search"><input id="q" type="search" placeholder="Procurar cliente ou cidade" value="${esc(S.q)}" autocomplete="off"></label><div id="cl">${cliList(l)}</div>`;
}
function cliList(l){
  return l.length?`<div class="grid">${l.map(c=>`<div class="panel"><div class="row"><div><h3 style="font-size:17px">${esc(c.name)}</h3><div class="meta">${c.mail} · ${c.city} · desde ${c.since}</div></div><span class="pill ${c.st==='ativo'?'p-ok':'p-bad'}">${c.st==='ativo'?'Ativo':'Bloqueado'}</span></div>
  <div class="meta num" style="margin-top:8px">${c.res} reservas · ${eur(c.spent,0)} gastos · ${c.pts} pontos</div>
  ${c.noshow>=3?`<div class="meta" style="color:var(--danger);margin-top:4px">${c.noshow} faltas sem aviso. Considere limitar reservas.</div>`:c.noshow?`<div class="meta" style="margin-top:4px">${c.noshow} falta sem aviso</div>`:''}
  <div class="acts">${c.st==='ativo'?confirmBtn('bl'+c.id,'Bloquear conta','block',c.id):`<button class="btn" data-a="unblock" data-v="${c.id}">Desbloquear</button>`}</div></div>`).join('')}</div>`:'<div class="empty">Nenhum cliente encontrado.</div>';
}
function res(){
  const F=[['todas','Todas'],['confirmada','Confirmadas'],['concluida','Concluídas'],['problema','Com problema']];
  const l=RES.filter(r=>S.rsf==='todas'||(S.rsf==='problema'?['naoveio','pendente'].includes(r.st)||r.ps==='falhado':r.st===S.rsf));
  return `<div class="chips">${F.map(([k,t])=>`<button class="chip" data-a="rsf" data-v="${k}" aria-pressed="${S.rsf===k}">${t}</button>`).join('')}</div>
  <div class="grid">${l.map(r=>{const [pl,pc]=resPill[r.st];const [ql,qc]=payPill[r.ps];return `<div class="panel"><div class="row"><div><b>${rn(r.r)}</b><div class="meta">${esc(r.cl)} · ${r.n} pess. · ${r.when}</div></div><span class="pill ${pc}">${pl}</span></div>
  <div class="row" style="margin-top:8px;align-items:center"><span class="meta num">${r.c} · ${eur(r.tot)}</span><span class="pill ${qc}">${ql}</span></div>
  ${r.noacc?`<div class="meta" style="color:var(--danger);margin-top:6px">Restaurante ainda sem aprovação: reserva bloqueada.</div>`:''}
  ${r.st==='confirmada'?`<div class="acts">${confirmBtn('cx'+r.c,'Cancelar e reembolsar','refund',r.c)}</div>`:''}</div>`}).join('')}</div>`;
}
function pag(){
  const F=[['todos','Todos'],['pago','Pagos'],['falhado','Falhados'],['reembolsado','Reembolsados']];
  const l=RES.filter(r=>S.pf==='todos'||r.ps===S.pf);
  const sum=k=>RES.filter(r=>r.ps===k).reduce((a,r)=>a+r.tot,0);
    return `<div class="tiles"><div class="tile"><small>Recebido</small><b class="num">${eur(sum('pago'))}</b><span>${RES.filter(r=>r.ps==='pago').length} pagamentos</span></div>
  <div class="tile"><small>Falhados</small><b class="num">${eur(sum('falhado'))}</b><span>${RES.filter(r=>r.ps==='falhado').length} por resolver</span></div>
  <div class="tile"><small>Reembolsado</small><b class="num">${eur(sum('reembolsado'))}</b><span>${RES.filter(r=>r.ps==='reembolsado').length} reservas</span></div>
  <div class="tile"><small>Método mais usado</small><b>${ON?topMethod():'MB WAY'}</b><span>${ON?'nas reservas':'4 de 10 pagamentos'}</span></div></div>
  <div class="chips" style="margin-top:14px">${F.map(([k,t])=>`<button class="chip" data-a="pf" data-v="${k}" aria-pressed="${S.pf===k}">${t}</button>`).join('')}</div>
  <div class="panel tbl"><table><thead><tr><th>Código</th><th>Cliente</th><th>Método</th><th>Valor</th><th>Estado</th><th></th></tr></thead><tbody>
  ${l.map(r=>`<tr><td class="num">${r.c}</td><td>${esc(r.cl)}</td><td>${r.m}</td><td class="num">${eur(r.tot)}</td><td><span class="pill ${payPill[r.ps][1]}">${payPill[r.ps][0]}</span></td><td>${r.ps==='falhado'&&!r.noacc?`<button class="btn sec" data-a="retry" data-v="${r.c}">Reenviar pedido</button>`:r.ps==='falhado'?'<span class="meta">Reserva bloqueada</span>':''}</td></tr>`).join('')}</tbody></table></div>`;
}
function com(){
  const rows=act();const g=gmv(),c=commTot();
  const due=rows.filter(r=>!r.paid).reduce((a,r)=>a+dueOf(r),0);
  return `<div class="tiles"><div class="tile"><small>Comissões do mês</small><b class="num">${eur(c,0)}</b><span>receita da plataforma</span></div>
  <div class="tile"><small>Taxa média</small><b class="num">${(g?c/g*100:0).toFixed(1).replace('.',',')}%</b><span>sobre ${eur(g,0)}</span></div>
  <div class="tile"><small>A pagar aos restaurantes</small><b class="num">${eur(due,0)}</b><span>${rows.filter(r=>!r.paid).length} por liquidar</span></div>
  <div class="tile"><small>Já liquidado</small><b class="num">${eur(ON?rows.reduce((a,r)=>a+r.paidOut,0):rows.filter(r=>r.paid).reduce((a,r)=>a+dueOf(r),0),0)}</b><span>${ON?'pago aos restaurantes':rows.filter(r=>r.paid).length+' restaurantes'}</span></div></div>
  <h2 class="sec">Por restaurante</h2><div class="panel tbl"><table><thead><tr><th>Restaurante</th><th>Vendas</th><th>Taxa</th><th>Comissão</th><th>A pagar</th><th>Estado</th></tr></thead><tbody>
  ${rows.map(r=>`<tr><td>${r.name}${r.risk?' <span class="pill p-bad" title="Muitas faltas ou disputas perdidas">Atenção: faltas</span>':''}${r.held?'<div class="meta">Retido: '+eur(r.held)+'</div>':''}</td><td class="num">${eur(r.gmv,0)}</td><td class="num">${r.rate}%</td><td class="num">${eur(comm(r))}</td><td class="num"><b>${eur(dueOf(r))}</b></td><td>${r.paid?'<span class="pill p-ok">Pago</span>':`<button class="btn ok" data-a="settle" data-v="${r.id}">Marcar pago</button>`}</td></tr>`).join('')}</tbody>
  <tfoot><tr><td>Total</td><td class="num">${eur(g,0)}</td><td></td><td class="num">${eur(c)}</td><td class="num">${eur(g-c)}</td><td></td></tr></tfoot></table></div>
  <p class="meta">A taxa de cada restaurante altera-se no separador Restaurantes. Os valores aqui atualizam logo.</p>`;
}
