/* ---------- Ligação ao servidor ---------- */
async function loadData(){
  S.loading=true;S.err='';render();
  try{
    const list=await OSP.get('/api/restaurantes');
    const full=await Promise.all(list.map(async r=>{
      const menu=await OSP.get('/api/restaurantes/'+encodeURIComponent(r.id)+'/menu');
      const cats=[];
      menu.forEach(d=>{let c=cats.find(x=>x.cat===d.category);if(!c)cats.push(c={cat:d.category,items:[]});
        c.items.push({id:r.id+':'+d.id,name:d.name,desc:d.description||'',price:OSP.cents(d.priceCents),hue:hueOf(d.id),out:d.soldOut})});
      return {id:r.id,name:r.name,cuisine:r.cuisine,city:r.city,addr:r.address,rating:0,n:0,price:2,dist:'',hue:hueOf(r.id),
        hours:r.openFrom+'–'+r.openTo,openFrom:r.openFrom,openTo:r.openTo,menu:cats,reviews:[]};
    }));
    R.length=0;R.push(...full);indexData();
    if(S.token){try{S.user=await OSP.get('/api/eu',S.token);S.points=S.user.points;await loadOrders()}catch(e){if(e.status===401){S.token='';OSP.store.set('osp_token','')}}}
  }catch(e){S.err=e.message}
  S.loading=false;render();
}
/* ---------- Tempo real: horas e menu atualizados assim que o restaurante ou outro cliente mudam algo ---------- */
function syncLive(){
  const want=ON&&['reserve','order','cart','pay'].includes(S.screen)&&S.crid?S.crid:null;
  if(want===S.liveRid)return;
  if(S.liveStop){S.liveStop();S.liveStop=null}
  S.liveRid=want;S.liveOk=false;
  if(want)S.liveStop=OSP.stream('/api/restaurantes/'+encodeURIComponent(want)+'/eventos',null,tipo=>onLive(want,tipo),st=>{
    const ok=st==='ligado';if(ok!==S.liveOk){S.liveOk=ok;if(ok)onLive(want,'disponibilidade');else render()}});
}
let liveTimer=null;
function onLive(rid,tipo){
  if(S.busy||rid!==S.crid)return;              // a confirmar a minha própria reserva: não interromper
  clearTimeout(liveTimer);liveTimer=setTimeout(()=>{tipo==='menu'?refreshMenu(rid):refreshSlots()},150);
}
async function refreshSlots(){
  const r=rest(S.crid);if(!r||S.busy)return;
  const key=slotKey(r);S.slotsList={};
  try{S.slotsList[key]=await OSP.get('/api/restaurantes/'+encodeURIComponent(r.id)+'/horas?data='+OSP.isoDate(dates()[S.date])+'&pessoas='+S.party)}catch(e){return}
  if(S.time&&!S.slotsList[key].includes(S.time)){
    S.time=null;toast('Essa hora acabou de ficar indisponível. Escolha outra.');
    if(['order','cart','pay'].includes(S.screen)){go('reserve');return}
  }
  render();
}
async function refreshMenu(rid){
  const r=rest(rid);if(!r||S.busy)return;
  try{
    const menu=await OSP.get('/api/restaurantes/'+encodeURIComponent(rid)+'/menu');
    const cats=[];menu.forEach(d=>{let c=cats.find(x=>x.cat===d.category);if(!c)cats.push(c={cat:d.category,items:[]});
      c.items.push({id:rid+':'+d.id,name:d.name,desc:d.description||'',price:OSP.cents(d.priceCents),hue:hueOf(d.id),out:d.soldOut})});
    r.menu=cats;indexData();
    let removed=0;Object.keys(S.cart).forEach(id=>{if(!dishIndex[id]||dishIndex[id].out){delete S.cart[id];removed++}});
    if(removed)toast('Um prato do seu pedido acabou de esgotar e foi retirado.');
    if(removed&&!cartCount()&&['cart','pay'].includes(S.screen)){go('order');return}
    render();
  }catch(e){}
}
async function loadSlots(r){
  const key=slotKey(r);if(S.slotsList[key]===undefined)S.slotsList[key]=null;
  if(S.slotsList[key]!==null)return;
  if(loadSlots.busy===key)return;loadSlots.busy=key;
  try{S.slotsList[key]=await OSP.get('/api/restaurantes/'+encodeURIComponent(r.id)+'/horas?data='+OSP.isoDate(dates()[S.date])+'&pessoas='+S.party)}
  catch(e){toast(e.message);S.slotsList[key]=[]}
  loadSlots.busy=null;render();
}
const stateLabel={pendente_pagamento:'Por pagar',confirmada:'Confirmado',chegou:'Confirmado',sentada:'Confirmado',concluida:'Concluído',cancelada:'Cancelado',nao_veio:'Não compareceu',expirada:'Expirado'};
function mapOrder(b){
  return {id:b.id,code:b.code,rid:b.restaurantId,when:b.date.slice(8)+'/'+b.date.slice(5,7)+' · '+b.time,people:b.party,
    items:b.lines.map(l=>[b.restaurantId+':'+l.dishId,l.qty]),names:Object.fromEntries(b.lines.map(l=>[b.restaurantId+':'+l.dishId,l.name])),
    prep:b.prepMode||'hora',total:OSP.cents(b.totalCents),status:stateLabel[b.status]||b.status,raw:b.status,canCheckin:b.canCheckin,canContest:b.canContest,dispute:b.dispute,claim:b.arrivedClaim,rated:true,earned:Math.floor(b.totalCents/100)};
}
async function loadOrders(){const l=await OSP.get('/api/reservas',S.token);S.orders=l.map(mapOrder)}
function go(s){S.screen=s;window.scrollTo(0,0);render()}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-a]');if(!t)return;
  if(t.dataset.a==='closeRv'&&e.target!==t&&e.target.closest('[data-stop]'))return;
  const a=t.dataset.a,v=t.dataset.v;
  switch(a){
    case 'go':go(v);break;
    case 'open':if(S.crid&&S.crid!==v){S.cart={};S.time=null;S.slotsList={}}S.rid=v;S.crid=v;S.tab='menu';go('rest');break;
    case 'reserve':S.crid=S.rid;S.slotsList={};go('reserve');break;
    case 'tab':S.tab=v;render();break;
    case 'cu':S.cu=v;render();break;
    case 'fav':e.stopPropagation();S.favs.has(v)?S.favs.delete(v):S.favs.add(v);toast(S.favs.has(v)?'Guardado nos favoritos':'Removido dos favoritos');render();break;
    case 'add':{const d=dishIndex[v];if(S.crid&&S.crid!==d.rid&&cartCount()){S.cart={};toast('Pedido novo: só pode juntar pratos de um restaurante')}S.crid=d.rid;S.cart[v]=(S.cart[v]||0)+1;render();break}
    case 'sub':S.cart[v]=(S.cart[v]||0)-1;if(S.cart[v]<=0)delete S.cart[v];render();break;
    case 'date':S.date=+v;S.time=null;render();break;
    case 'time':S.time=v;render();break;
    case 'party':S.party=Math.max(1,Math.min(10,S.party+ +v));S.time=null;render();break;
    case 'method':S.method=v;render();break;
    case 'prep':S.prep=v;render();break;
    case 'pts':S.usePts=!S.usePts;render();break;
    case 'confirm':{
      if(ON){confirmReal();return}
      const r=rest(S.crid);const s=summary(r);const ds=dates();
      const code='OSP-'+Math.random().toString(36).slice(2,7).toUpperCase();
      const earned=Math.floor(s.pay);
      if(S.usePts)S.points-=Math.round(s.disc*20);
      S.points+=earned;
      S.orders.unshift({prep:S.prep,code,rid:r.id,when:dayLabel(ds[S.date],S.date)+' · '+S.time,people:S.party,items:Object.entries(S.cart),total:s.pay,status:'Confirmado',rated:false,earned});
      S.cur=0;S.cart={};S.time=null;S.usePts=false;S.note='';S.prep='hora';go('done');break}
    case 'ticket':S.cur=+v||0;go('done');break;
    case 'reload':loadData();break;
    case 'mkacct':mkAcct();return;
    case 'cancel':doCancel(+v);return;
    case 'checkin':doCheckin(+v);return;
    case 'contest':S.ct=+v;render();return;
    case 'noContest':S.ct=null;render();return;
    case 'sendContest':doContest(+v);return;
    case 'repeat':{const o=S.orders[+v];S.cart={};o.items.forEach(([id,q])=>{if(dishIndex[id])S.cart[id]=q});S.rid=o.rid;S.crid=o.rid;S.time=null;toast('Pedido copiado: escolha agora a mesa');go('reserve');break}
    case 'rate':S.rv={open:true,rid:S.orders[+v].rid,order:+v,stars:5};render();break;
    case 'star':S.rv.stars=+v;{const txt=$('#rvt')?.value;render();if(txt)$('#rvt').value=txt}break;
    case 'closeRv':S.rv.open=false;render();break;
    case 'sendRv':{
      const r=rest(S.rv.rid);const txt=($('#rvt')?.value||'').trim();
      r.reviews.unshift({u:'Você',r:S.rv.stars,t:txt||'Sem comentário.',d:'agora'});
      S.orders[S.rv.order].rated=true;S.points+=10;S.rv.open=false;toast('Obrigado. Ganhou 10 pontos');render();break}
    case 'theme':{const d=document.documentElement;const dark=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark';break}
  }
});
async function mkAcct(){
  S.err='';const a=S.acct;
  if(!a.nome.trim()||!/^\S+@\S+\.\S+$/.test(a.email.trim())){S.err='Indique o nome e um email válido.';render();return}
  if(!a.ok){S.err='Aceite a caixa de consentimento para continuar.';render();return}
  S.busy=true;render();
  try{const r=await OSP.post('/api/clientes',{nome:a.nome,email:a.email,telemovel:a.telemovel||undefined,consentimento:true});
    S.token=r.token;OSP.store.set('osp_token',r.token);S.user=await OSP.get('/api/eu',S.token);S.points=S.user.points;S.busy=false;S.err='';
    go('pay');toast('Conta criada')}
  catch(e){S.busy=false;S.err=e.message;render()}
}
async function confirmReal(){
  if(S.busy)return;
  if(!S.token){S.err='';go('account');return}
  const r=rest(S.crid);const ds=dates();
  const lines=Object.entries(S.cart).map(([id,q])=>({dishId:id.split(':').slice(1).join(':'),qty:q}));
  S.busy=true;
  try{
    const b=await OSP.post('/api/reservas',{restaurantId:r.id,date:OSP.isoDate(ds[S.date]),time:S.time,party:S.party,note:S.note,method:S.method,preparar:S.prep,lines},S.token);
    try{await OSP.post('/api/dev/pagar',{ref:b.payment.ref},S.token)}
    catch(e){if(e.status===404)toast('Pagamento real ainda não ligado: a reserva fica por pagar durante 10 minutos');else throw e}
    await loadOrders();S.cur=Math.max(0,S.orders.findIndex(o=>o.id===b.id));
    S.user=await OSP.get('/api/eu',S.token);S.points=S.user.points;
    S.cart={};S.time=null;S.note='';S.prep='hora';S.slotsList={};S.busy=false;go('done');
  }catch(e){
    S.busy=false;
    if(e.status===401){S.token='';OSP.store.set('osp_token','');go('account');return}
    toast(e.message);S.slotsList={};S.time=null;go('reserve');
  }
}
async function doCheckin(i){
  const o=S.orders[i];if(!o)return;
  try{await OSP.post('/api/reservas/'+o.id+'/cheguei',{},S.token);await loadOrders();toast('Chegada registada. O restaurante foi avisado.');render()}
  catch(e){toast(e.message)}
}
async function doContest(i){
  const o=S.orders[i];if(!o)return;
  try{await OSP.post('/api/reservas/'+o.id+'/contestar',{nota:($('#ctn')?.value||'').trim()},S.token);S.ct=null;await loadOrders();toast('Contestação enviada. O valor fica retido até haver decisão.');render()}
  catch(e){toast(e.message)}
}
async function doCancel(i){
  const o=S.orders[i];if(!o||!confirm('Cancelar esta reserva? O reembolso depende da antecedência.'))return;
  try{const r=await OSP.post('/api/reservas/'+o.id+'/cancelar',{},S.token);
    await loadOrders();S.slotsList={};toast('Reserva cancelada. Reembolso: '+eur(OSP.cents(r.refundCents||0)));render()}
  catch(e){toast(e.message)}
}

if(ON)loadData();else render();
