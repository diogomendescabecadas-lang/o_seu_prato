function fin(){
  if(ON)return finReal();
  const act=S.R.filter(active);
  const today=act.reduce((a,r)=>a+r.paid,0);
  const week=[...WEEK,['Hoje',today]];
  const max=Math.max(...week.map(w=>w[1]));
  const total=week.reduce((a,w)=>a+w[1],0);
  const comm=total*COMM;
  const tk=today/Math.max(1,act.length);
  return `<div class="tiles"><div class="tile"><small>Pré-pago hoje</small><b class="num">${eur(today)}</b><span>${act.length} reservas</span></div>
  <div class="tile"><small>Valor médio por reserva</small><b class="num">${eur(tk)}</b><span>hoje</span></div>
  <div class="tile"><small>Últimos 7 dias</small><b class="num">${eur(total)}</b><span>bruto</span></div>
  <div class="tile"><small>A receber (líquido)</small><b class="num">${eur(total-comm)}</b><span>após comissão de ${Math.round(COMM*100)}%</span></div></div>
  <div class="two"><div><h2 class="sec">Vendas por dia</h2><div class="panel"><div class="bars" role="img" aria-label="Vendas dos últimos 7 dias">${week.map(([d,v])=>`<div class="${d==='Hoje'?'today':''}"><b class="num">${Math.round(v)}</b><i style="height:${Math.max(4,v/max*100)}%"></i><small>${d}</small></div>`).join('')}</div><p class="meta" style="margin-bottom:0">Valores em euros. Hoje inclui reservas ainda por chegar, já pagas.</p></div></div>
  <div><h2 class="sec">Pagamentos</h2><div class="panel tbl"><table><thead><tr><th>Período</th><th>Bruto</th><th>Comissão</th><th>Líquido</th></tr></thead><tbody>
  ${[['21–27 set',3180],['14–20 set',2940],['7–13 set',3320]].map(([p,g])=>`<tr><td>${p}</td><td class="num">${eur(g)}</td><td class="num">−${eur(g*COMM)}</td><td class="num"><b>${eur(g*(1-COMM))}</b></td></tr>`).join('')}</tbody></table></div>
  <p class="meta">Taxa de comissão e valores de exemplo, definidos pela administração da plataforma.</p></div></div>`;
}
function loginView(){
  return `<main style="max-width:420px;margin:60px auto 0"><div class="panel"><h2 class="sec" style="margin-top:0">Entrar na área do restaurante</h2>
  <p class="meta">Introduza a chave que a administração lhe enviou.</p>
  <input id="rk" type="password" autocomplete="off" placeholder="Chave do restaurante" style="width:100%;min-height:48px;margin:8px 0">
  ${S.err?`<div class="alert">${esc(S.err)}</div>`:''}
  <div class="acts"><button class="btn" data-a="login">Entrar</button></div></div></main>`;
}
const toHM=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
function finReal(){
  const f=S.fin;if(!f)return '<div class="empty">A carregar…</div>';
  const days=f.days.map(d=>[d.date.slice(8)+'/'+d.date.slice(5,7),d.grossCents/100]);
  const max=Math.max(1,...days.map(d=>d[1]));const total=days.reduce((a,d)=>a+d[1],0);
  return `<div class="tiles"><div class="tile"><small>Vendas (últimos dias)</small><b class="num">${eur(total)}</b><span>bruto, pré-pagas</span></div>
  <div class="tile"><small>A receber</small><b class="num">${eur(f.toReceiveCents/100)}</b><span>já após comissão de ${f.ratePct}%</span></div>
  <div class="tile"><small>Já recebido</small><b class="num">${eur(f.paidOutCents/100)}</b><span>pagamentos da plataforma</span></div></div>
  <h2 class="sec">Vendas por dia</h2><div class="panel">${days.length?`<div class="bars" role="img" aria-label="Vendas por dia">${days.map(([d,v])=>`<div><b class="num">${Math.round(v)}</b><i style="height:${Math.max(4,v/max*100)}%"></i><small>${d}</small></div>`).join('')}</div>`:'<div class="empty">Ainda sem vendas.</div>'}</div>`;
}
function render(){
  if(ON&&!S.key){$('#app').innerHTML=loginView();return}
  if(ON&&S.loading){$('#app').innerHTML='<main><div class="empty">A carregar…</div></main>';return}
  const body={hoje,reservas,cozinha,mesas,menu,aval,fin}[S.tab]();
  $('#app').innerHTML=header()+`<main>${body}</main>`;
}
const find=c=>S.R.find(r=>r.code===c);
const ST={confirmada:'confirmada',chegou:'chegou',sentada:'sentada',concluida:'concluida',cancelada:'cancelada',nao_veio:'naoveio'};
const OD={novo:'novo',em_preparacao:'preparar',pronto:'pronto',servido:'servido'};
const nowReal=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const api=(m,p,b)=>m==='GET'?OSP.get(p,S.key):OSP.post(p,b,S.key);
let pending=null;
function refreshSoon(){if(pending)return;pending=setTimeout(()=>{pending=null;if(S.key&&!S.loading)loadAll()},120)}
function startLive(){
  if(!ON||!S.key||S.stopLive)return;
  S.stopLive=OSP.stream('/api/restaurante/eventos',S.key,()=>refreshSoon(),st=>{S.live=st;if(st==='ligado')refreshSoon();else render()});
}
function stopLive(){if(S.stopLive){S.stopLive();S.stopLive=null}S.live=''}
async function loadAll(first){
  try{
    const today=OSP.isoDate(new Date());
    const [info,bk,menu]=await Promise.all([api('GET','/api/restaurante/info'),api('GET','/api/restaurante/reservas?data='+today+'&ate='+(()=>{const d=new Date();d.setDate(d.getDate()+6);return OSP.isoDate(d)})()),api('GET','/api/restaurante/menu')]);
    S.info=info;TABLES=info.tables.map(t=>({id:t.id,n:t.seats,online:t.online}));S.closed=new Set(info.closedDays||[]);S.now=nowReal();
    DISH={};bk.forEach(b=>b.lines.forEach(l=>DISH[l.dishId]=[l.name,l.unitCents/100]));
    MENU=menu.map(d=>({id:d.id,cat:d.category,name:d.name,price:d.priceCents/100,stock:d.stock,low:d.lowAt??3,on:d.enabled}));
    S.stk=await api('GET','/api/restaurante/stock?dias=7').catch(()=>null);
    MENU.forEach(d=>{if(!DISH[d.id])DISH[d.id]=[d.name,d.price]});
    S.ALL=bk.map(b=>({id:b.id,code:b.code,date:b.date,time:b.time,name:b.customerName||'Cliente',party:b.party,items:b.lines.map(l=>[l.dishId,l.qty]),
      st:ST[b.status]||b.status,ord:OD[b.kitchen]||'novo',table:(['cancelada','nao_veio'].includes(b.status)?null:b.table),seen:b.seen,note:b.note||'',paid:b.totalCents/100,prepMin:Math.max(...b.lines.map(l=>l.prepMin||20)),arr:b.prepMode==='chegada',claim:b.arrivedClaim?b.arrivedClaim.slice(11):''}));
    S.R=S.ALL.filter(r=>r.date===today);
    if(S.tab==='fin')S.fin=await api('GET','/api/restaurante/financas');
    const fresh=newList().filter(r=>!S.announced.has(r.code));
    fresh.forEach(r=>S.announced.add(r.code));
    if(fresh.length){
      const r=fresh[0];
      toast(S.firstLoad?fresh.length+(fresh.length>1?' reservas novas por ver':' reserva nova por ver'):'Nova reserva: '+(r.date!==TODAY()?dLabel(r.date)+' ':'')+r.time+' · '+r.party+' pess. · '+(r.table?'mesa '+r.table:'mesa por atribuir')+' · '+r.items.reduce((a,i)=>a+i[1],0)+' pratos');
    }
    S.firstLoad=false;
    document.title=(newList().length?'('+newList().length+') ':'')+'Restaurante · O Seu Prato';
    S.loading=false;S.err='';startLive();
  }catch(e){
    S.loading=false;
    if(e.status===401){S.key='';OSP.store.set('osp_rkey','');stopLive();S.err='Chave inválida ou restaurante suspenso.'}
    else if(first){S.err=e.message}else toast(e.message);
  }
  const ae=document.activeElement;
  if(first||!(ae&&['INPUT','TEXTAREA','SELECT'].includes(ae.tagName)))render();
}
