const RST={pendente:'pendente',ativo:'ativo',suspenso:'suspenso'};
async function loadAll(first){
  try{
    DISP=await OSP.get('/api/admin/disputas',S.key).catch(()=>[]);
    APOIO=await OSP.get('/api/admin/apoio',S.key).catch(()=>[]);
    await loadMenu();
    const [rs,cl,rv,sum,pre]=await Promise.all([OSP.get('/api/admin/restaurantes',S.key),OSP.get('/api/admin/clientes',S.key),OSP.get('/api/admin/reservas',S.key),OSP.get('/api/admin/resumo',S.key),OSP.get('/api/admin/preregistos',S.key)]);
    S.sum=sum;PRE=pre;
    RS=rs.map(r=>({id:r.id,name:r.name,city:r.city||'—',cuisine:r.cuisine||'—',contact:r.contact,st:RST[r.status],rate:r.ratePct,gmv:r.grossCents/100,res:r.bookings,rating:0,
      held:r.heldCents/100,risk:r.risk,noShows:r.noShows,noShowRate:r.noShowRatePct,lost:r.disputesLost,paid:r.owedCents<=0,why:r.statusNote,comm:r.commissionCents/100,due:r.owedCents/100,paidOut:r.paidOutCents/100}));
    CL=cl.map(c=>({id:c.id,name:c.name,mail:c.email,city:'—',res:c.bookings,spent:c.spentCents/100,pts:c.points,noshow:c.noShows,since:String(c.since).slice(0,7),st:c.blocked?'bloqueado':'ativo'}));
    RES=rv.map(b=>{const pay=['pendente_pagamento'].includes(b.status)?'pendente':b.status==='expirada'?'falhado':b.refundedCents>0?'reembolsado':'pago';
      return {c:b.code,id:b.id,cl:b.customerName||'—',r:b.restaurantId,when:b.date.slice(8)+'/'+b.date.slice(5,7)+' · '+b.time,n:b.party,tot:b.totalCents/100,
        st:({chegou:'confirmada',sentada:'confirmada',nao_veio:'naoveio',pendente_pagamento:'pendente',expirada:'pendente'})[b.status]||b.status,m:MET[b.method]||b.method,ps:pay}});
    S.loading=false;S.err='';
  }catch(e){
    S.loading=false;
    if(e.status===401){S.key='';OSP.store.set('osp_akey','');S.err='Chave inválida.'}else if(first)S.err=e.message;else toast(e.message);
  }
  const ae=document.activeElement;
  if(first||!(ae&&['INPUT','TEXTAREA','SELECT'].includes(ae.tagName)))render();
}
async function realAction(a,v,t){
  const run=async(p,b,msg)=>{try{const r=await OSP.post(p,b,S.key);S.ask=null;if(msg)toast(msg);return r}catch(e){toast(e.message)}finally{await loadAll()}};
  switch(a){
    case 'login':{S.key=($('#ak').value||'').trim();if(!S.key){S.err='Introduza a chave.';render();return true}OSP.store.set('osp_akey',S.key);S.loading=true;S.err='';render();loadAll(true);return true}
    case 'closekey':S.newKey=null;render();return true;
    case 'approve':{const r=await run('/api/admin/restaurantes/'+v+'/estado',{estado:'ativo'});if(r&&r.restaurantKey){S.newKey={name:R(v).name,key:r.restaurantKey};S.tab='rest';render()}return true}
    case 'reject':run('/api/admin/restaurantes/'+v+'/recusar',{},'Pedido recusado');return true;
    case 'suspend':run('/api/admin/restaurantes/'+v+'/estado',{estado:'suspenso'},'Restaurante suspenso');return true;
    case 'reactivate':run('/api/admin/restaurantes/'+v+'/estado',{estado:'ativo'},'Restaurante reativado');return true;
    case 'block':run('/api/admin/clientes/'+v+'/bloquear',{bloqueado:true},'Conta bloqueada');return true;
    case 'unblock':run('/api/admin/clientes/'+v+'/bloquear',{bloqueado:false},'Conta desbloqueada');return true;
    case 'refund':run('/api/admin/reservas/'+RES.find(x=>x.c===v).id+'/reembolsar',{},'Reserva cancelada e reembolsada');return true;
    case 'settle':run('/api/admin/restaurantes/'+v+'/liquidar',{},'Pagamento registado');return true;
    case 'dispC':run('/api/admin/reservas/'+v+'/disputa',{decisao:'cliente'},'Valor devolvido ao cliente');return true;
    case 'dispR':run('/api/admin/reservas/'+v+'/disputa',{decisao:'restaurante'},'Falta confirmada: valor libertado ao restaurante');return true;
    case 'retry':toast('Ainda não disponível: o prestador de pagamentos real não está ligado');return true;
    case 'apoioEstado':{const [id,est]=String(v).split(':');run('/api/admin/apoio/'+id+'/estado',{estado:est},est==='resolvido'?'Pedido resolvido':'Pedido reaberto');return true}
    case 'apoioApagar':run('/api/admin/apoio/'+v+'/apagar',{},'Pedido apagado');return true;
    case 'menuRest':MN.rid=v;await loadMenu();render();return true;
    case 'menuPin':run('/api/admin/restaurantes/'+v+'/pin/repor',{},'PIN reposto: o restaurante já pode criar um novo');return true;
    case 'menuLock':run('/api/admin/restaurantes/'+MN.rid+'/pratos/'+v+'/trancar',{trancado:true},'Prato trancado');return true;
    case 'menuUnlock':run('/api/admin/restaurantes/'+MN.rid+'/pratos/'+v+'/trancar',{trancado:false},'Prato destrancado');return true;
    case 'menuSave':{const g=x=>document.getElementById('mn-'+x+'-'+v);const p=parseFloat(g('p').value);if(!(p>=0)){toast('Preço inválido');return true}
      try{await OSP.post('/api/admin/restaurantes/'+MN.rid+'/pratos/'+v,{name:g('n').value,description:g('d').value,priceCents:OSP.toCents(p)},S.key);
        await OSP.post('/api/admin/restaurantes/'+MN.rid+'/pratos/'+v+'/trancar',{trancado:true},S.key);toast('Guardado e trancado')}catch(e){toast(e.message)}
      await loadAll();return true}
    case 'logout':S.key='';OSP.store.set('osp_akey','');render();return true;
  }
  return false;
}
function render(){
  if(ON&&!S.key){$('#app').innerHTML=loginView();return}
  if(ON&&S.loading){$('#app').innerHTML='<main><div class="empty">A carregar…</div></main>';return}
  const body={geral,rest,cli,res,disp,pag,com,menus,apoio,rel}[S.tab]();
  $('#app').innerHTML=header()+`<main>${body}</main>`;
  const q=$('#q');if(q)q.addEventListener('input',e=>{S.q=e.target.value;const t=S.q.trim().toLowerCase();$('#cl').innerHTML=cliList(CL.filter(c=>!t||(c.name+c.city).toLowerCase().includes(t)))});
}
