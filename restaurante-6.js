/* Ações que escrevem no servidor. Devolve true se tratou o clique. */
function realAction(a,v){
  const go=async(p,b,okMsg)=>{try{await api('POST',p,b);if(okMsg)toast(okMsg)}catch(e){toast(e.message)}await loadAll()};
  const bk=c=>ALLR().find(r=>r.code===c);
  switch(a){
    case 'arrive':{const r=bk(v);go('/api/restaurante/reservas/'+r.id+'/estado',{estado:'chegou'},r.ord==='pronto'?'Cliente chegou. Os pratos estão prontos':'Chegada registada: '+r.name);return true}
    case 'noshow':go('/api/restaurante/reservas/'+bk(v).id+'/estado',{estado:'nao_veio'},'Marcada como não compareceu');return true;
    case 'seat':{const [c,id]=v.split('|');S.pick=null;go('/api/restaurante/reservas/'+bk(c).id+'/estado',{estado:'sentada',mesa:id},'Sentado na mesa '+id);return true}
    case 'finish':go('/api/restaurante/reservas/'+bk(v).id+'/estado',{estado:'concluida'},'Mesa libertada');return true;
    case 'start':go('/api/restaurante/reservas/'+bk(v).id+'/cozinha',{estado:'em_preparacao'});return true;
    case 'ready':go('/api/restaurante/reservas/'+bk(v).id+'/cozinha',{estado:'pronto'},'Pratos prontos');return true;
    case 'serve':go('/api/restaurante/reservas/'+bk(v).id+'/cozinha',{estado:'servido'},'Pratos entregues');return true;
    case 'stk':{const [id,n]=v.split('|');const d=MENU.find(m=>m.id===id);go('/api/restaurante/pratos/'+id,{stock:Math.max(0,d.stock+ +n)});return true}
    case 'on':{const d=MENU.find(m=>m.id===v);if(!d.on&&d.stock===0){toast('Sem stock. Aumente o stock para voltar a vender');return true}go('/api/restaurante/pratos/'+v,{enabled:!d.on});return true}
    case 'newdish':{
      const name=$('#nd-name').value.trim();const price=parseFloat($('#nd-price').value);
      if(!name||!(price>=0)){toast('Indique o nome e o preço');return true}
      go('/api/restaurante/pratos',{name,category:$('#nd-cat').value,priceCents:OSP.toCents(price),stock:Math.max(0,parseInt($('#nd-stock').value)||0)},'Prato adicionado ao menu');return true}
    case 'seen':go('/api/restaurante/reservas/'+bk(v).id+'/visto',{});return true;
    case 'tonline':{const t=TABLES.find(x=>x.id===v);
      (async()=>{try{const r=await api('POST','/api/restaurante/mesas/'+encodeURIComponent(v)+'/online',{aberta:!t.online});
        toast(t.online?(r.existingBookings?'Mesa '+v+' fechada. Atenção: '+r.existingBookings+' reserva(s) já confirmada(s) nesta mesa continuam válidas.':'Mesa '+v+' fechada a reservas online'):'Mesa '+v+' aberta a reservas online')}catch(e){toast(e.message)}await loadAll()})();return true}
    case 'day':{const was=S.closed.has(v);
      (async()=>{try{const r=await api('POST','/api/restaurante/dias',{data:v,fechado:!was});
        toast(was?'Dia aberto a reservas':(r.existingBookings?'Dia fechado. Atenção: '+r.existingBookings+' reserva(s) já confirmada(s) neste dia continuam válidas.':'Dia fechado a reservas'))}catch(e){toast(e.message)}await loadAll()})();return true}
    case 'login':{S.key=($('#rk').value||'').trim();if(!S.key){S.err='Introduza a chave.';render();return true}
      OSP.store.set('osp_rkey',S.key);S.loading=true;S.err='';render();loadAll(true);return true}
    case 'logout':stopLive();S.key='';OSP.store.set('osp_rkey','');S.info=null;S.R=[];S.ALL=[];render();return true;
  }
  return false;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-a]');if(!t)return;
  const a=t.dataset.a,v=t.dataset.v;
  if(ON&&realAction(a,v))return;
  switch(a){
    case 'tab':S.tab=v;if(ON&&v==='fin')api('GET','/api/restaurante/financas').then(f=>{S.fin=f;render()}).catch(e=>toast(e.message));break;
    case 'f':S.f=v;break;
    case 'tick':S.now+=15;break;
    case 'arrive':{const r=find(v);r.st='chegou';toast(r.ord==='pronto'?'Cliente chegou. Os pratos estão prontos':'Chegada registada: '+r.name);break}
    case 'noshow':find(v).st='naoveio';toast('Marcada como não compareceu');break;
    case 'pick':S.pick=v||null;break;
    case 'seat':{const [c,id]=v.split('|');const r=find(c);r.table=id;r.st='sentada';S.pick=null;toast(r.name+' sentado na mesa '+id);break}
    case 'finish':{const r=find(v);r.st='concluida';r.ord='servido';toast('Mesa libertada');break}
    case 'start':{const r=find(v);r.ord='preparar';
      r.items.forEach(([id,q])=>{const d=MENU.find(m=>m.id===id);if(d){d.stock=Math.max(0,d.stock-q);if(d.stock===0&&d.on){d.on=false;toast(d.name+' esgotado: removido da venda')}}});break}
    case 'seen':find(v).seen=true;break;
    case 'tonline':{const t=TABLES.find(x=>x.id===v);t.online=!t.online;toast(t.online?'Mesa '+v+' aberta a reservas online':'Mesa '+v+' fechada a reservas online');break}
    case 'day':S.closed.has(v)?S.closed.delete(v):S.closed.add(v);toast(S.closed.has(v)?'Dia fechado a reservas':'Dia aberto a reservas');break;
    case 'rday':S.day=v;break;
    case 'mf':S.mf=v;break;
    case 'revf':S.revf=v;break;
    case 'stk':{const [id,n]=v.split('|');const d=MENU.find(m=>m.id===id);d.stock=Math.max(0,d.stock+ +n);if(d.stock===0)d.on=false;break}
    case 'on':{const d=MENU.find(m=>m.id===v);if(!d.on&&d.stock===0){toast('Sem stock. Aumente o stock para voltar a vender');break}d.on=!d.on;toast(d.on?d.name+' disponível':d.name+' indisponível');break}
    case 'newdish':{
      const name=$('#nd-name').value.trim();const price=parseFloat($('#nd-price').value);
      if(!name||!(price>=0)){toast('Indique o nome e o preço');return}
      const stock=Math.max(0,parseInt($('#nd-stock').value)||0);
      MENU.push({id:'n'+Date.now(),cat:$('#nd-cat').value,name,price,stock,on:stock>0});toast('Prato adicionado ao menu');break}
    case 'reply':{const tx=($('#rp-'+v).value||'').trim();if(!tx){toast('Escreva uma resposta');return}REV.find(x=>x.id===+v).reply=tx;toast('Resposta publicada');break}
    case 'ready':find(v).ord='pronto';toast('Pratos prontos para '+find(v).name);break;
    case 'serve':find(v).ord='servido';toast('Pratos entregues');break;
    case 'theme':{const d=document.documentElement;const dark=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark';break}
  }
  render();
});
document.addEventListener('change',e=>{
  const lid=e.target.dataset&&e.target.dataset.low;
  if(lid){const d=MENU.find(m=>m.id===lid),v=parseInt(e.target.value);
    if(!(v>=0)){e.target.value=d.low??3;return}
    d.low=v;if(ON)api('POST','/api/restaurante/pratos/'+lid,{lowAt:v}).then(()=>{toast('Alerta de '+d.name+': abaixo de '+v);loadAll()}).catch(x=>toast(x.message));else{toast('Alerta de '+d.name+': abaixo de '+v);render()}return}
  const id=e.target.dataset&&e.target.dataset.price;if(!id)return;
  const v=parseFloat(e.target.value);const d=MENU.find(m=>m.id===id);
  if(ON){if(v>=0)api('POST','/api/restaurante/pratos/'+id,{priceCents:OSP.toCents(v)}).then(()=>{toast('Preço de '+d.name+' atualizado para '+eur(v));loadAll()}).catch(x=>toast(x.message));else e.target.value=d.price;return}
  if(v>=0){d.price=v;toast('Preço de '+d.name+' atualizado para '+eur(v))}else e.target.value=d.price;
});
if(ON){if(S.key)loadAll(true);else render();setInterval(()=>{if(S.key&&!S.loading&&S.live!=='ligado')loadAll()},10000);setInterval(()=>{if(S.key&&!S.loading)loadAll()},60000)}else render();
