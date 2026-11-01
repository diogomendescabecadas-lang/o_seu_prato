function home(){
  return `<section class="hero"><h1>Escolha. Reserve. Chegue. <em>Coma.</em></h1><p>Escolha os pratos, reserve mesa e pague antes de sair de casa. Quando chegar, a cozinha já está a preparar a sua refeição.</p></section>
  <div class="steps"><div>Escolha<small>os pratos</small></div><div>Reserve<small>a mesa</small></div><div>Chegue<small>à hora</small></div><div>Coma<small>sem espera</small></div></div>
  <label class="search">${ic.search}<input id="q" type="search" placeholder="Restaurante, cozinha ou prato" value="${esc(S.q)}" autocomplete="off"></label>
  <div class="chips" role="group" aria-label="Cozinhas">${cuisines.map(c=>`<button class="chip" data-a="cu" data-v="${c}" aria-pressed="${S.cu===c}">${c}</button>`).join('')}</div>
  <div id="list">${listHTML()}</div>`;
}
function menuHTML(r,ordering){
  return r.menu.map(c=>`<h2 class="cat">${c.cat}</h2>`+c.items.map(d=>{
    const q=S.cart[d.id]||0;
    const ctl=d.out?'<span class="pill warn">Esgotado hoje</span>':!ordering?'':q?`<span class="stepper"><button data-a="sub" data-v="${d.id}" aria-label="Retirar">−</button><span class="num">${q}</span><button data-a="add" data-v="${d.id}" aria-label="Juntar">+</button></span>`:`<button class="add" data-a="add" data-v="${d.id}">Juntar</button>`;
    return `<div class="dish"><div class="ph" style="${bgd(d.hue)}">${plate(d.hue)}</div><div class="info"><h4>${d.name}</h4><p>${d.desc}</p>
    <div class="row"><span class="price num">${eur(d.price)}</span>${ctl}</div></div></div>`}).join('')).join('');
}
function restaurant(){
  const r=rest(S.rid);const fav=S.favs.has(r.id);
  let body='';
  if(S.tab==='menu'){
    body=menuHTML(r,false);
  }else if(S.tab==='rev'){
    if(!r.n)body=`<div class="empty">Ainda sem avaliações.</div>`;else body=`<div style="margin-top:14px"><div style="display:flex;gap:12px;align-items:baseline"><h2 style="font-size:40px" class="num">${r.rating.toFixed(1)}</h2><span class="star">${stars(r.rating)}</span><span class="meta num">${r.n} avaliações</span></div>`+r.reviews.map(v=>`<div class="rev"><div style="display:flex;justify-content:space-between"><b>${esc(v.u)}</b><span class="meta">${v.d}</span></div><div class="star">${stars(v.r)}</div><p style="margin:4px 0 0">${esc(v.t)}</p></div>`).join('')+`<p class="meta">Só quem concluiu uma refeição pode avaliar.</p></div>`;
  }else{
    body=`<div class="panel" style="margin-top:14px"><h3>Informação</h3><div class="line"><span>Morada</span><b>${r.addr}</b></div><div class="line"><span>Zona</span><b>${r.city}</b></div><div class="line"><span>Horário</span><b>${r.hours}</b></div><div class="line"><span>Preparação</span><b>A cozinha começa 20 min antes</b></div></div>`;
  }
  return `<button class="back" data-a="go" data-v="home">← Voltar</button>
  <div class="cover" style="${bg(r.hue)};border-radius:22px">${plate(r.hue)}<button class="favb" data-a="fav" data-v="${r.id}" aria-pressed="${fav}" aria-label="Favorito">${ic.heart}</button></div>
  <div class="rhead"><span class="pill">${r.cuisine}</span><h1 style="margin-top:8px">${r.name}</h1>
  <div class="meta"><span class="star num">${rt(r)}</span><span>${r.city}</span>${ON?'':`<span>${r.dist}</span><span>${'€'.repeat(r.price)}</span>`}</div></div>
  <div class="tabs" role="tablist">${[['menu','Menu'],['rev','Avaliações'],['info','Informação']].map(([k,l])=>`<button role="tab" data-a="tab" data-v="${k}" aria-selected="${S.tab===k}">${l}</button>`).join('')}</div>
  ${body}
  <div class="cartbar"><button class="btn" data-a="reserve"><span>Reservar mesa</span><span>1.º escolha a mesa, depois os pratos</span></button></div>`;
}
const STEPS=['Mesa','Pedido','Resumo','Pagamento'];
function prog(n){return `<div class="progress" aria-label="Passo ${n} de 4: ${STEPS[n-1]}">${[1,2,3,4].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`}
function summary(r,withBtn,label,act){
  const items=Object.entries(S.cart).map(([id,q])=>`<div class="line"><span>${q} × ${dishIndex[id].name}</span><span class="num">${eur(dishIndex[id].price*q)}</span></div>`).join('');
  const tot=cartTotal();const disc=S.usePts?Math.min(S.points,Math.floor(tot*20))/20:0;
  const fee=0;const pay=Math.max(0,tot-disc+fee);
  return {items,tot,disc,pay};
}
function tableLine(){
  const ds=dates();
  return `${ds[S.date].toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})}, às ${S.time} · ${S.party} ${S.party>1?'pessoas':'pessoa'}`;
}
function reserve(){
  const r=rest(S.crid||S.rid);if(!r)return home();
  S.crid=r.id;
  const ds=dates();const sl=slots(r);
  const any=sl.some(x=>x.free);
  const loadingSlots=ON&&!S.slotsList[slotKey(r)];
  return `<button class="back" data-a="open" data-v="${r.id}">← ${esc(r.name)}</button>${prog(1)}
  <div class="two"><div><h1 style="font-size:28px;margin-bottom:4px">Reservar mesa</h1><p class="meta" style="margin:0 0 12px">Primeiro escolha o dia, as pessoas e a hora. Depois escolhe os pratos.</p>
  <div class="panel"><h3>Dia</h3><div class="opts">${ds.map((d,i)=>`<button class="opt" data-a="date" data-v="${i}" aria-pressed="${S.date===i}">${dayLabel(d,i)}<small>${d.getDate()}/${d.getMonth()+1}</small></button>`).join('')}</div></div>
  <div class="panel"><h3>Pessoas</h3><span class="stepper"><button data-a="party" data-v="-1" aria-label="Menos">−</button><span class="num">${S.party}</span><button data-a="party" data-v="1" aria-label="Mais">+</button></span></div>
  <div class="panel"><h3>Hora de chegada</h3>${loadingSlots?'<p class="meta">A ver as mesas livres…</p>':any?`<div class="opts">${sl.map(x=>`<button class="opt num" data-a="time" data-v="${x.t}" aria-pressed="${S.time===x.t}" ${x.free&&x.left>=Math.ceil(S.party/2)?'':'disabled'}>${x.t}</button>`).join('')}</div><p class="meta" style="margin-bottom:0">Os horários riscados não têm mesa livre para ${S.party} ${S.party>1?'pessoas':'pessoa'}.${ON&&S.liveOk?' <b style="color:var(--olive)">● Atualizado em direto</b>':''}</p>`:`<div class="note">O restaurante não tem mesas abertas a reservas para este dia e este número de pessoas. Experimente outro dia ou menos pessoas.</div>`}</div>
  <div class="panel"><h3>Nota para o restaurante</h3><textarea id="note" placeholder="Alergias, cadeira de bebé, aniversário…">${esc(S.note)}</textarea></div></div>
  <div class="sticky"><div class="panel"><h3>A sua mesa</h3><div class="line"><span>Restaurante</span><b>${r.name}</b></div><div class="line"><span>Pessoas</span><b>${S.party}</b></div>${S.time?`<div class="line"><span>Quando</span><b>${ds[S.date].toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'short'})} · ${S.time}</b></div>`:`<div class="meta">Escolha uma hora para continuar.</div>`}</div>
  <button class="btn" data-a="go" data-v="order" ${S.time?'':'disabled'}>Continuar: escolher os pratos</button></div></div>`;
}
function order(){
  const r=rest(S.crid);if(!r)return home();
  if(!S.time)return reserve();
  return `<button class="back" data-a="go" data-v="reserve">← Mesa</button>${prog(2)}
  <h1 style="font-size:28px;margin-bottom:4px">Escolha os pratos</h1>
  <div class="note" style="margin:0 0 8px">Mesa para ${S.party} ${S.party>1?'pessoas':'pessoa'}: ${tableLine()}.</div>
  ${menuHTML(r,true)}
  ${cartCount()?`<div class="cartbar"><button class="btn" data-a="go" data-v="cart"><span>Continuar · ${cartCount()} ${cartCount()>1?'pratos':'prato'}</span><span class="num">${eur(cartTotal())}</span></button></div>`:`<div class="cartbar"><div class="note" style="margin:0;text-align:center">Junte pelo menos um prato para continuar.</div></div>`}`;
}
function cart(){
  const r=rest(S.crid);
  if(!r||!S.time)return reserve();
  if(!cartCount())return order();
  const s=summary(r);
  return `<button class="back" data-a="go" data-v="order">← Pratos</button>${prog(3)}
  <div class="two"><div><h1 style="font-size:28px;margin-bottom:12px">Resumo</h1>
  <div class="panel"><h3>Mesa reservada</h3><div class="line"><span>Restaurante</span><b>${r.name}</b></div><div class="line"><span>Quando</span><b>${tableLine()}</b></div>${S.note?`<div class="meta">Nota: ${esc(S.note)}</div>`:''}<div class="acts"><button class="btn ghost" data-a="go" data-v="reserve">Mudar mesa</button></div></div>
  <div class="panel"><h3>O seu pedido</h3>${Object.entries(S.cart).map(([id,q])=>{const d=dishIndex[id];return `<div class="line" style="align-items:center"><div style="min-width:0"><b>${d.name}</b><div class="meta num">${eur(d.price)}</div></div><span class="stepper"><button data-a="sub" data-v="${id}" aria-label="Retirar">−</button><span class="num">${q}</span><button data-a="add" data-v="${id}" aria-label="Juntar">+</button></span></div>`}).join('')}</div></div>
  <div class="sticky"><div class="panel"><div class="line total"><span>Total dos pratos</span><span class="num">${eur(s.tot)}</span></div><div class="meta">O restaurante recebe a reserva da mesa e o pedido ao mesmo tempo.</div></div><button class="btn" data-a="go" data-v="pay">Continuar para pagamento</button></div></div>`;
}
function pay(){
  const r=rest(S.crid);if(!r||!S.time)return reserve();if(!cartCount())return order();
  const s=summary(r);const earn=Math.floor(s.pay);
  const ds=dates();
  const maxDisc=Math.min(S.points,Math.floor(s.tot*20))/20;
  return `<button class="back" data-a="go" data-v="cart">← Resumo</button>${prog(4)}
  <div class="two"><div><h1 style="font-size:28px;margin-bottom:12px">Pagamento</h1>
  <div class="panel"><h3>Quando preparar os pratos</h3>
  ${[['hora','Para a hora da reserva','A cozinha começa antes, para estar pronto quando chegar.'],['chegada','Só quando eu chegar','Paga agora, mas a cozinha só começa quando chegar ao restaurante. Espera uns minutos à mesa.']].map(([k,t,d])=>`<button class="method" data-a="prep" data-v="${k}" aria-pressed="${S.prep===k}"><span class="mi">${k==='hora'?'⏱':'🚪'}</span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>
  <div class="panel"><h3>Forma de pagamento</h3>
  ${[['mbway','MB','MB WAY','Pague no telemóvel'],['card','VISA','Cartão','Débito ou crédito'],['ref','REF','Referência Multibanco','Válida durante 1 hora']].map(([k,i,t,d])=>`<button class="method" data-a="method" data-v="${k}" aria-pressed="${S.method===k}"><span class="mi">${i}</span><span><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>
  ${ON?'':`<div class="panel"><h3>Pontos Prato</h3><button class="method" data-a="pts" aria-pressed="${S.usePts}"><span class="mi">★</span><span><b>Usar ${Math.min(S.points,Math.floor(s.tot*20))} pontos</b><small>Desconto de ${eur(maxDisc)} · tem ${S.points} pontos</small></span></button></div>`}</div>
  <div class="sticky"><div class="panel"><h3>${r.name}</h3><div class="meta" style="margin-bottom:8px">${ds[S.date].toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'short'})} · ${S.time} · ${S.party} ${S.party>1?'pessoas':'pessoa'}</div>${s.items}
  ${s.disc?`<div class="line" style="color:var(--olive)"><span>Pontos</span><span class="num">−${eur(s.disc)}</span></div>`:''}
  <div class="line total"><span>A pagar</span><span class="num">${eur(s.pay)}</span></div><div class="meta">Ganha ${earn} pontos com esta refeição.</div></div>
  <button class="btn" data-a="confirm">Pagar ${eur(s.pay)}</button><p class="meta" style="text-align:center">${ON?'Pagamento simulado: o prestador real ainda não está ligado.':'Pagamento simulado neste protótipo.'}</p></div></div>`;
}
function qr(code){
  let h=0;for(const c of code)h=(h*31+c.charCodeAt(0))>>>0;
  let cells='';const n=11;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const finder=(x<3&&y<3)||(x>n-4&&y<3)||(x<3&&y>n-4);
    h=(h*1103515245+12345)>>>0;
    if(finder||(h>>>16)%2)cells+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}
  return `<svg class="qr" viewBox="0 0 ${n} ${n}" fill="#2E1F15" aria-label="Código de reserva">${cells}</svg>`;
}
function done(){
  const o=S.orders[S.cur||0];const r=rest(o.rid);
  return `<div class="ticket"><div class="top"><div style="font-size:30px">✓</div><h2>Reserva confirmada</h2><div style="opacity:.9">Pagamento recebido</div></div>
  <div class="mid"><h3 style="font-size:20px">${r.name}</h3><div>${o.when} · ${o.people} ${o.people>1?'pessoas':'pessoa'}</div>${qr(o.code)}<div class="code">${o.code}</div>
  <div class="note">${o.prep==='chegada'?'O restaurante já recebeu a reserva e o pedido pago. Mostre este código à chegada: a cozinha começa a preparar os pratos nesse momento.':'O restaurante já recebeu a reserva e os pratos. Mostre este código à chegada e sente-se: a refeição estará a ser servida.'}</div>
  <div class="meta">Ganhou ${o.earned} pontos Prato.</div></div></div>
  <div style="max-width:420px;margin:0 auto;display:grid;gap:8px"><button class="btn" data-a="go" data-v="orders">Ver as minhas reservas</button><button class="btn ghost" data-a="go" data-v="home">Voltar ao início</button></div>`;
}
function favs(){
  const l=R.filter(r=>S.favs.has(r.id));
  return `<h1 style="font-size:30px;padding-block:20px 12px">Favoritos</h1>`+(l.length?`<div class="grid">${l.map(restCard).join('')}</div>`:`<div class="empty">Ainda não tem favoritos. Toque no coração de um restaurante para o guardar aqui.</div>`);
}
function orders(){
  return `<h1 style="font-size:30px;padding-block:20px 12px">Reservas e pedidos</h1><div class="grid">`+S.orders.map((o,i)=>{
    const r=rest(o.rid)||{name:'Restaurante',hue:20};const up=o.status==='Confirmado';
    return `<div class="panel"><div class="ord"><div class="ph" style="${bgd(r.hue)}">${plate(r.hue)}</div><div><b>${r.name}</b><div class="meta">${o.when}</div><div class="meta num">${o.code} · ${eur(o.total)}</div></div><span class="pill ${up?'':'warn'}">${o.status}</span></div>
    <div class="meta" style="margin-top:8px">${o.items.map(([id,q])=>q+' × '+(dishIndex[id]?dishIndex[id].name:(o.names&&o.names[id])||'prato')).join(', ')}</div>
    ${o.claim&&up?`<div class="meta">Chegada indicada às ${o.claim.slice(11)}. O restaurante foi avisado.</div>`:''}${o.dispute==='aberta'?'<div class="note">A sua contestação está a ser analisada pela administração. O valor fica retido até haver decisão.</div>':o.dispute==='resolvida_cliente'?'<div class="note">A administração deu-lhe razão: o valor foi devolvido.</div>':o.dispute==='resolvida_restaurante'?'<div class="meta">A administração confirmou a falta.</div>':''}
    ${S.ct===i?`<div class="panel" style="margin-top:8px"><h3>Eu estive lá</h3><textarea id="ctn" placeholder="Conte-nos o que aconteceu (hora a que chegou, com quem falou…)"></textarea><div class="acts"><button class="btn" data-a="sendContest" data-v="${i}">Enviar contestação</button><button class="btn ghost" data-a="noContest">Fechar</button></div></div>`:''}
    <div class="acts">${o.canCheckin?`<button class="btn" data-a="checkin" data-v="${i}">Já cheguei</button>`:''}${o.canContest?`<button class="btn ghost" data-a="contest" data-v="${i}">Contestar falta</button>`:''}${up?`<button class="btn sec" data-a="ticket" data-v="${i}">Ver código</button>${ON?`<button class="btn ghost" data-a="cancel" data-v="${i}">Cancelar</button>`:''}`:`<button class="btn sec" data-a="repeat" data-v="${i}">Repetir pedido</button>`}${!up&&!o.rated?`<button class="btn" data-a="rate" data-v="${i}">Avaliar</button>`:''}${o.rated&&!ON?'<span class="pill" style="align-self:center">Avaliado</span>':''}</div></div>`}).join('')+`</div>`;
}
function me(){
  const lvl=S.points>=500?'Prata':'Bronze';const next=500;const pct=Math.min(100,S.points/next*100);
  return `<h1 style="font-size:30px;padding-block:20px 12px">Perfil</h1>
  <div class="two"><div class="loy"><div style="opacity:.9;font-weight:600">Pontos Prato · nível ${lvl}</div><h2 class="num">${S.points}</h2><div class="bar"><i style="width:${pct}%"></i></div><div class="num" style="font-size:14px;opacity:.95">${S.points>=500?'Nível Prata atingido':`Faltam ${next-S.points} pontos para o nível Prata`}</div></div>
  <div><div class="panel"><h3>Como funciona</h3><div class="rw"><span>Cada 1 € gasto</span><b>1 ponto</b></div><div class="rw"><span>100 pontos</span><b>5 € de desconto</b></div><div class="rw"><span>Nível Prata (500 pts)</span><b>Pontos a dobrar ao fim de semana</b></div></div>
  <div class="panel"><h3>Conta</h3><div class="rw"><span>Nome</span><b>${ON?esc(S.user?S.user.name:'Sem sessão'):'Cliente de exemplo'}</b></div><div class="rw"><span>Reservas feitas</span><b class="num">${S.orders.length}</b></div><div class="rw"><span>Restaurantes favoritos</span><b class="num">${S.favs.size}</b></div></div></div></div>`;
}
function reviewModal(){
  if(!S.rv.open)return '';
  const r=rest(S.rv.rid);
  return `<div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:60;display:grid;place-items:end center" data-a="closeRv"><div class="panel" style="width:100%;max-width:520px;margin:0;border-radius:22px 22px 0 0;padding-bottom:calc(20px + env(safe-area-inset-bottom,0px))" data-stop="1"><h3 style="font-size:20px">Como foi em ${r.name}?</h3><div class="stars" role="radiogroup" aria-label="Classificação">${[1,2,3,4,5].map(i=>`<button data-a="star" data-v="${i}" class="${i<=S.rv.stars?'on':''}" aria-label="${i} estrelas">★</button>`).join('')}</div><textarea id="rvt" placeholder="Conte como foi a refeição (opcional)"></textarea><div class="acts"><button class="btn ghost" data-a="closeRv">Cancelar</button><button class="btn" data-a="sendRv">Publicar avaliação</button></div></div></div>`;
}

function account(){
  return `<button class="back" data-a="go" data-v="pay">← Pagamento</button><h1 style="font-size:28px;margin-bottom:12px">Criar conta</h1>
  <div class="panel"><p class="meta" style="margin-top:0">Precisamos de saber quem reserva. Demora um minuto.</p>
  <label class="lbl" style="display:grid;gap:6px;margin-bottom:12px">Nome<input id="ac-n" type="text" autocomplete="name" value="${esc(S.acct.nome)}"></label>
  <label class="lbl" style="display:grid;gap:6px;margin-bottom:12px">Email<input id="ac-e" type="email" autocomplete="email" inputmode="email" value="${esc(S.acct.email)}"></label>
  <label class="lbl" style="display:grid;gap:6px;margin-bottom:12px">Telemóvel (opcional)<input id="ac-t" type="tel" autocomplete="tel" inputmode="tel" value="${esc(S.acct.telemovel)}"></label>
  <label style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px"><input id="ac-c" type="checkbox" style="width:22px;height:22px;flex-shrink:0" ${S.acct.ok?'checked':''}><span>Aceito que O Seu Prato guarde os meus dados para tratar das minhas reservas.</span></label>
  ${S.err?`<div class="note" style="color:var(--danger)">${esc(S.err)}</div>`:''}
  <button class="btn" data-a="mkacct" ${S.busy?'disabled':''}>Criar conta e continuar</button></div>`;
}
function render(){
  if(S.loading){$('#app').innerHTML=header()+`<main><div class="empty">A carregar restaurantes…</div></main>`;return}
  if(S.err&&S.screen==='home'&&!R.length){$('#app').innerHTML=header()+`<main><div class="empty"><h2>Sem ligação</h2><p>${esc(S.err)}</p><button class="btn" data-a="reload">Tentar outra vez</button></div></main>`;return}
  const sc={home,rest:restaurant,order,cart,reserve,pay,done,favs,orders,me,account}[S.screen]();
  $('#app').innerHTML=header()+`<main>${sc}</main>`+bnav()+reviewModal();
  const q=$('#q');if(q){q.addEventListener('input',e=>{S.q=e.target.value;$('#list').innerHTML=listHTML()})}
  const n=$('#note');if(n)n.addEventListener('input',e=>S.note=e.target.value);
  ['n:nome','e:email','t:telemovel'].forEach(p=>{const [k,f]=p.split(':');const el=$('#ac-'+k);if(el)el.addEventListener('input',e=>S.acct[f]=e.target.value)});
  const c=$('#ac-c');if(c)c.addEventListener('change',e=>S.acct.ok=e.target.checked);
  syncLive();
    }
