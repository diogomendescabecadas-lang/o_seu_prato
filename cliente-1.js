const eur=n=>n.toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
 moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/></svg>'
};
const logo='<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#C0502D"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#FFF1DC" stroke-width="2"/><path d="M16 9v14M12 9v5a4 4 0 008 0V9" fill="none" stroke="#FFF1DC" stroke-width="1.6" stroke-linecap="round" transform="rotate(0 16 16) scale(.6) translate(10.6 10.6)"/></svg>';

/* Dados de exemplo */
const R=[
{id:'tasca',name:'Tasca do Largo',cuisine:'Portuguesa',city:'Alfama, Lisboa',rating:4.7,n:312,price:2,dist:'450 m',hue:18,hours:'12:00–15:00 · 19:00–23:00',addr:'Largo de São Miguel 14',
 menu:[{cat:'Entradas',items:[
  {id:'t1',name:'Pastéis de bacalhau',desc:'Quatro unidades, com salada de feijão-frade.',price:7.5,hue:38},
  {id:'t2',name:'Alheira assada',desc:'Com grelos salteados e ovo estrelado.',price:8.5,hue:30}]},
  {cat:'Pratos',items:[
  {id:'t3',name:'Arroz de pato',desc:'Pato desfiado, chouriço e laranja, gratinado no forno.',price:15.5,hue:24},
  {id:'t4',name:'Bacalhau à lagareiro',desc:'Lombo com batata a murro e azeite novo.',price:18.9,hue:44},
  {id:'t5',name:'Bochechas de porco',desc:'Estufadas em vinho tinto, puré de castanha.',price:16.5,hue:12,out:true}]},
  {cat:'Sobremesas',items:[
  {id:'t6',name:'Pudim abade de priscos',desc:'Receita clássica com toucinho do céu.',price:5.5,hue:40}]}],
 reviews:[{u:'Marta S.',r:5,t:'O arroz de pato estava quente e pronto mal nos sentámos. Muito prático.',d:'há 2 dias'},{u:'João P.',r:4,t:'Boa comida e atendimento rápido. A mesa já estava preparada.',d:'há 1 semana'}]},
{id:'brasa',name:'Forno & Brasa',cuisine:'Grelhados',city:'Boavista, Porto',rating:4.5,n:198,price:2,dist:'1,2 km',hue:8,hours:'12:30–15:00 · 19:30–23:30',addr:'Rua de Diogo Brandão 52',
 menu:[{cat:'Para partilhar',items:[
  {id:'b1',name:'Pão de forno com alhada',desc:'Pão quente, manteiga de ervas e azeitonas.',price:4.5,hue:42}]},
  {cat:'Brasa',items:[
  {id:'b2',name:'Entrecosto no forno',desc:'Marinado 24 horas, com batata assada.',price:14.9,hue:10},
  {id:'b3',name:'Costeleta de vitela',desc:'Cerca de 350 g, com legumes grelhados.',price:21.5,hue:6},
  {id:'b4',name:'Frango na brasa',desc:'Meio frango, piripiri caseiro e arroz.',price:12.9,hue:28}]},
  {cat:'Sobremesas',items:[
  {id:'b5',name:'Tarte de amêndoa',desc:'Com gelado de baunilha.',price:5.9,hue:36}]}],
 reviews:[{u:'Ricardo A.',r:5,t:'Chegámos às 20:00 e os pratos saíram em minutos.',d:'há 3 dias'}]},
{id:'mare',name:'Maré Alta',cuisine:'Peixe e marisco',city:'Cascais',rating:4.8,n:421,price:3,dist:'3,4 km',hue:200,hours:'12:00–15:30 · 19:00–22:30',addr:'Avenida Marginal 210',
 menu:[{cat:'Entradas',items:[
  {id:'m1',name:'Ameijoas à Bulhão Pato',desc:'Alho, coentros e limão.',price:14.5,hue:190},
  {id:'m2',name:'Ceviche de dourada',desc:'Lima, coentros e batata-doce.',price:13.5,hue:170}]},
  {cat:'Pratos',items:[
  {id:'m3',name:'Arroz de tamboril',desc:'Malandrinho, com gambas e coentros.',price:19.9,hue:14},
  {id:'m4',name:'Robalo grelhado',desc:'Com legumes e batata cozida.',price:22.5,hue:200},
  {id:'m5',name:'Cataplana de marisco (2 pessoas)',desc:'Amêijoa, gamba, mexilhão e peixe do dia.',price:46,hue:20}]}],
 reviews:[{u:'Inês C.',r:5,t:'A cataplana chegou à mesa mesmo à hora marcada. Excelente.',d:'há 5 dias'},{u:'Pedro L.',r:5,t:'Peixe fresquíssimo.',d:'há 2 semanas'}]},
{id:'oliveira',name:'Casa Oliveira',cuisine:'Vegetariana',city:'Príncipe Real, Lisboa',rating:4.6,n:156,price:2,dist:'900 m',hue:96,hours:'12:00–15:00 · 19:00–22:00',addr:'Rua da Escola Politécnica 88',
 menu:[{cat:'Pratos',items:[
  {id:'o1',name:'Risotto de cogumelos',desc:'Cogumelos silvestres e parmesão.',price:13.9,hue:60},
  {id:'o2',name:'Bowl de grão e beterraba',desc:'Hummus, tahini, sementes e ervas.',price:11.5,hue:330},
  {id:'o3',name:'Moussaka de legumes',desc:'Beringela, courgette e bechamel.',price:12.9,hue:22}]},
  {cat:'Sobremesas',items:[
  {id:'o4',name:'Mousse de chocolate negro',desc:'Com flor de sal e azeite.',price:5.5,hue:20}]}],
 reviews:[{u:'Sofia R.',r:4,t:'Menu pequeno mas muito bem pensado.',d:'há 4 dias'}]},
{id:'izakaya',name:'Izakaya Sol',cuisine:'Japonesa',city:'Baixa, Porto',rating:4.4,n:233,price:2,dist:'2,1 km',hue:350,hours:'12:00–15:00 · 19:00–23:00',addr:'Rua das Flores 31',
 menu:[{cat:'Para começar',items:[
  {id:'i1',name:'Gyoza de legumes',desc:'Seis unidades, molho ponzu.',price:6.9,hue:48},
  {id:'i2',name:'Edamame',desc:'Com sal marinho.',price:4.5,hue:110}]},
  {cat:'Pratos',items:[
  {id:'i3',name:'Ramen de porco',desc:'Caldo de 12 horas, ovo marinado.',price:13.9,hue:30},
  {id:'i4',name:'Chirashi',desc:'Selecção de peixe sobre arroz de sushi.',price:17.5,hue:355},
  {id:'i5',name:'Katsu curry',desc:'Panado de frango, arroz e curry suave.',price:12.5,hue:36}]}],
 reviews:[{u:'Diogo M.',r:4,t:'O ramen estava pronto na hora certa.',d:'há 1 semana'}]},
{id:'massa',name:'Massa Fresca',cuisine:'Italiana',city:'Campo de Ourique, Lisboa',rating:4.5,n:187,price:2,dist:'1,6 km',hue:50,hours:'12:00–15:00 · 19:00–22:30',addr:'Rua Ferreira Borges 120',
 menu:[{cat:'Massas',items:[
  {id:'a1',name:'Tagliatelle ao ragù',desc:'Massa fresca, ragù de vaca cozinhado 6 horas.',price:12.5,hue:16},
  {id:'a2',name:'Ravioli de burrata',desc:'Tomate cherry e manjericão.',price:13.5,hue:8},
  {id:'a3',name:'Carbonara',desc:'Guanciale, gema e pecorino.',price:12.9,hue:46}]},
  {cat:'Sobremesas',items:[
  {id:'a4',name:'Tiramisù',desc:'Feito diariamente.',price:5.5,hue:30}]}],
 reviews:[{u:'Carla N.',r:5,t:'Carbonara perfeita.',d:'há 6 dias'}]}
];
const dishIndex={};
let cuisines=[];
function indexData(){
  Object.keys(dishIndex).forEach(k=>delete dishIndex[k]);
  R.forEach(r=>r.menu.forEach(c=>c.items.forEach(d=>dishIndex[d.id]={...d,rid:r.id})));
  cuisines=['Todos',...new Set(R.map(r=>r.cuisine).filter(Boolean))];
}
indexData();
const ON=OSP.on;                         // true = ligado ao servidor real
const hueOf=s=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))%360,7);
const rt=r=>r.n?`★ ${r.rating.toFixed(1)}`:'Novo';

const S={
 screen:'home',rid:null,tab:'menu',q:'',cu:'Todos',
 cart:{},crid:null,
 favs:new Set(ON?[]:['mare']),
 date:0,time:null,party:2,note:'',method:'mbway',prep:'hora',usePts:false,
 points:ON?0:340,loading:ON,err:'',token:OSP.store.get('osp_token'),user:null,slotsList:{},liveRid:null,liveStop:null,liveOk:false,acct:{nome:'',email:'',telemovel:'',ok:false},busy:false,
 orders:ON?[]:[
  {code:'OSP-7K2QM',rid:'tasca',when:'28 set · 20:00',items:[['t3',2],['t6',2]],total:42,status:'Concluído',rated:false},
  {code:'OSP-3FJ9A',rid:'massa',when:'19 set · 13:00',items:[['a1',1],['a4',1]],total:18,status:'Concluído',rated:true}],
 rv:{open:false,rid:null,order:null,stars:5}
};
const $=s=>document.querySelector(s);
const rest=id=>R.find(r=>r.id===id);
const cartCount=()=>Object.values(S.cart).reduce((a,b)=>a+b,0);
const cartTotal=()=>Object.entries(S.cart).reduce((a,[id,q])=>a+dishIndex[id].price*q,0);
const dates=()=>{const a=[];const n=new Date();for(let i=0;i<6;i++){const d=new Date(n);d.setDate(n.getDate()+i);a.push(d)}return a};
const dayLabel=(d,i)=>i===0?'Hoje':i===1?'Amanhã':d.toLocaleDateString('pt-PT',{weekday:'short'}).replace('.','');
function slotKey(r){return r.id+'|'+OSP.isoDate(dates()[S.date])+'|'+S.party}
function slots(r){
  if(ON){
    const list=S.slotsList[slotKey(r)];
    if(!list){loadSlots(r);return []}
    const out=[];const toM=t=>+t.slice(0,2)*60+ +t.slice(3);
    for(let m=toM(r.openFrom);m<=toM(r.openTo)-90;m+=30){const t=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');out.push({t,free:list.includes(t),left:9})}
    return out;
  }
  const out=[];const base=[];
  for(let h=12;h<=14;h++){base.push(h+':00');if(h<14)base.push(h+':30')}
  for(let h=19;h<=21;h++){base.push(h+':00');base.push(h+':30')}
  let seed=(r.id.length*7+S.date*13);
  base.forEach((t,i)=>{seed=(seed*31+i*17)%97;out.push({t:t.padStart(5,'0'),free:seed%5!==0,left:(seed%4)+2})});
  return out;
}
function plate(h,size){
  const c1=`hsl(${h} 62% 48%)`,c2=`hsl(${(h+30)%360} 55% 38%)`,c3=`hsl(${(h+110)%360} 40% 42%)`;
  return `<svg class="pl" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="52" r="44" fill="#fff" opacity=".95"/><circle cx="50" cy="52" r="34" fill="none" stroke="#e8d9c3" stroke-width="2"/><ellipse cx="46" cy="52" rx="18" ry="14" fill="${c1}"/><circle cx="62" cy="44" r="8" fill="${c2}"/><circle cx="36" cy="64" r="6" fill="${c3}"/><circle cx="58" cy="64" r="4" fill="${c3}"/><circle cx="44" cy="46" r="3" fill="#fff" opacity=".5"/></svg>`;
}
const bg=h=>`background:linear-gradient(135deg,hsl(${h} 70% 82%),hsl(${(h+25)%360} 65% 70%))`;
const bgd=h=>`background:linear-gradient(135deg,hsl(${h} 60% 78%),hsl(${(h+25)%360} 55% 66%))`;
const stars=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n));
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2200)}

/* Navegação */
const navItems=[['home','Descobrir',ic.home],['favs','Favoritos',ic.heart],['orders','Reservas',ic.cal],['me','Perfil',ic.user]];
function navKey(){return ['rest','order','cart','reserve','pay','done','account'].includes(S.screen)?'home':S.screen}
function header(){
  const k=navKey();
  return `<header class="top"><button class="logo" data-a="go" data-v="home" aria-label="O Seu Prato, início">${logo}<span>O Seu Prato</span></button>
  <div class="rside"><nav class="dnav" aria-label="Principal">${navItems.map(([id,l])=>`<button data-a="go" data-v="${id}" ${k===id?'aria-current="page"':''}>${l}</button>`).join('')}</nav>
  <button class="themebtn" data-a="theme" aria-label="Alternar tema">${ic.moon}</button></div></header>`;
}
function bnav(){
  const k=navKey();
  return `<nav class="bnav" aria-label="Principal">${navItems.map(([id,l,i])=>`<button data-a="go" data-v="${id}" ${k===id?'aria-current="page"':''}>${i}<span>${l}</span></button>`).join('')}</nav>`;
}

/* Ecrãs */
function restCard(r){
  const fav=S.favs.has(r.id);
  return `<article class="card"><button class="cover" style="${bg(r.hue)};width:100%" data-a="open" data-v="${r.id}" aria-label="Abrir ${esc(r.name)}">${plate(r.hue)}<span class="tag">${r.cuisine}</span></button>
  <div class="cbody"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><h3>${r.name}</h3><button class="favb" style="position:static;background:var(--surface2);color:var(--ink)" data-a="fav" data-v="${r.id}" aria-pressed="${fav}" aria-label="Favorito">${ic.heart}</button></div>
  <div class="meta"><span class="star num">${rt(r)}</span>${r.n?`<span class="num">(${r.n})</span>`:''}${ON?'':`<span>${'€'.repeat(r.price)}</span><span>${r.dist}</span>`}</div>
  <div class="meta">${r.city}</div></div></article>`;
}
function listHTML(){
  const q=S.q.trim().toLowerCase();
  const l=R.filter(r=>(S.cu==='Todos'||r.cuisine===S.cu)&&(!q||(r.name+r.cuisine+r.city+r.menu.map(c=>c.items.map(d=>d.name).join(' ')).join(' ')).toLowerCase().includes(q)));
  return l.length?`<div class="grid">${l.map(restCard).join('')}</div>`:`<div class="empty">Nenhum restaurante encontrado. Experimente outro prato ou cozinha.</div>`;
}
