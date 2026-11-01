const eur=n=>n.toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const tm=s=>{const [h,m]=s.split(':').map(Number);return h*60+m};
const PREP=20;

const ON=OSP.on;
let DISH={
 t1:['Pastéis de bacalhau',7.5],t2:['Alheira assada',8.5],t3:['Arroz de pato',15.5],
 t4:['Bacalhau à lagareiro',18.9],t5:['Bochechas de porco',16.5],t6:['Pudim abade de priscos',5.5]};
let TABLES=[{id:'M1',n:2},{id:'M2',n:2},{id:'M3',n:2},{id:'M4',n:4},{id:'M5',n:4},{id:'M6',n:4},{id:'M7',n:6},{id:'M8',n:6},{id:'M9',n:8},{id:'M10',n:2}].map(t=>({...t,online:true}));

const mk=(code,time,name,party,items,st,ord,table,note)=>({code,time,name,party,items,st,ord,table:table||null,note:note||'',paid:items.reduce((a,[id,q])=>a+DISH[id][1]*q,0)});
const initial=()=>[
 mk('OSP-A1','13:00','Ana Matos',2,[['t3',2]],'concluida','servido','M2'),
 mk('OSP-A2','13:15','Grupo Silva',6,[['t4',3],['t3',3],['t6',4]],'concluida','servido','M7'),
 mk('OSP-B1','19:00','Carla Nunes',2,[['t1',1],['t4',2],['t6',2]],'sentada','servido','M3'),
 mk('OSP-B2','19:30','Miguel Rocha',4,[['t3',2],['t4',2]],'chegou','pronto',null),
 mk('OSP-B3','19:45','Helena Costa',2,[['t3',1],['t2',1],['t6',1]],'confirmada','preparar',null,'Alergia: glúten. Confirmar sem pão na alheira.'),
 mk('OSP-B4','20:00','Família Pires',5,[['t3',3],['t4',2],['t1',2]],'confirmada','novo',null,'Uma cadeira de bebé.'),
 mk('OSP-B5','20:00','João Vaz',2,[['t4',2]],'confirmada','novo',null),
 mk('OSP-B6','20:30','Rita Faria',3,[['t3',2],['t2',1],['t6',3]],'confirmada','novo',null,'Aniversário. Vela na sobremesa.'),
 mk('OSP-B7','21:00','Tiago Brito',2,[['t2',1],['t4',1],['t3',1]],'confirmada','novo',null),
 mk('OSP-B8','21:30','Sónia Lima',4,[['t3',4]],'confirmada','novo',null,'Alergia: frutos secos.'),
 mk('OSP-B9','19:30','Pedro Dias',2,[['t4',2]],'cancelada','novo',null)
];
let MENU=[
 {id:'t1',cat:'Entradas',name:'Pastéis de bacalhau',price:7.5,stock:24,on:true},
 {id:'t2',cat:'Entradas',name:'Alheira assada',price:8.5,stock:12,on:true},
 {id:'t3',cat:'Pratos',name:'Arroz de pato',price:15.5,stock:14,on:true},
 {id:'t4',cat:'Pratos',name:'Bacalhau à lagareiro',price:18.9,stock:3,on:true},
 {id:'t5',cat:'Pratos',name:'Bochechas de porco',price:16.5,stock:0,on:false},
 {id:'t6',cat:'Sobremesas',name:'Pudim abade de priscos',price:5.5,stock:18,on:true}];
let REV=ON?[]:[
 {id:1,u:'Marta S.',r:5,t:'O arroz de pato estava quente e pronto mal nos sentámos. Muito prático.',d:'há 2 dias',reply:''},
 {id:2,u:'João P.',r:4,t:'Boa comida e atendimento rápido. A mesa já estava preparada.',d:'há 1 semana',reply:'Obrigado, João. Esperamos por si em breve.'},
 {id:3,u:'Beatriz F.',r:3,t:'Comida muito boa, mas esperámos 10 minutos pela mesa à hora marcada.',d:'há 1 semana',reply:''},
 {id:4,u:'Rui T.',r:5,t:'Bacalhau perfeito. Pagar antes poupou tempo.',d:'há 2 semanas',reply:''},
 {id:5,u:'Lúcia G.',r:5,t:'Sobremesa excelente.',d:'há 3 semanas',reply:''}];
const WEEK=[['Sex',612],['Sáb',904],['Dom',731],['Seg',388],['Ter',455],['Qua',502]];
const COMM=0.08;
const S={tab:'hoje',now:19*60+40,R:ON?[]:initial(),key:OSP.store.get('osp_rkey'),info:null,live:'',stopLive:null,ALL:[],day:'',closed:new Set(),announced:new Set(),firstLoad:true,loading:ON&&!!OSP.store.get('osp_rkey'),err:'',fin:null,f:'todas',pick:null,open:null,mf:'Todos',revf:'todas'};
const $=s=>document.querySelector(s);
const stLabel={confirmada:['Confirmada','p-conf'],chegou:['Chegou','p-cheg'],sentada:['Na mesa','p-sent'],concluida:['Concluída','p-done'],cancelada:['Cancelada','p-bad'],naoveio:['Não veio','p-bad']};
const ordLabel={novo:'Por iniciar',preparar:'A preparar',pronto:'Pronto',servido:'Servido'};
const active=r=>!['cancelada','naoveio'].includes(r.st);
const TODAY=()=>OSP.isoDate(new Date());
const ALLR=()=>ON?S.ALL:S.R;
const dLabel=iso=>iso===TODAY()?'Hoje':iso.slice(8)+'/'+iso.slice(5,7);
const isNew=r=>r.seen===false&&r.st==='confirmada';
const newList=()=>ALLR().filter(isNew);
const mesaTxt=r=>r.table?`Mesa ${r.table}`:'Mesa por atribuir';
const sorted=()=>[...S.R].sort((a,b)=>tm(a.time)-tm(b.time));
const sameDay=r=>!r.date||r.date===TODAY();
const waitArr=r=>!!r.arr&&r.ord==='novo'&&!['chegou','sentada'].includes(r.st);
const isLate=r=>sameDay(r)&&r.st==='confirmada'&&S.now>=tm(r.time)+15;
const tableBusy=id=>S.R.find(r=>r.table===id&&['chegou','sentada'].includes(r.st));
const tableSoon=id=>S.R.find(r=>r.table===id&&r.st==='confirmada');
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2200)}
const itemsTxt=r=>r.items.map(([id,q])=>q+' × '+DISH[id][0]).join(', ');

function header(){
  const kitchen=S.R.filter(r=>active(r)&&['novo','preparar'].includes(r.ord)&&!['concluida'].includes(r.st)).length;
  const low=MENU.filter(d=>d.on&&d.stock<=3).length;
  const unans=REV.filter(v=>!v.reply).length;
  const tabs=[['hoje','Hoje'],['reservas','Reservas',newList().length],['cozinha','Cozinha',kitchen],['mesas','Mesas'],['menu','Menu e stock',low],['aval','Avaliações',unans],['fin','Finanças']];
  return `<header class="top"><div class="brand"><div class="lg">${esc(ON&&S.info?S.info.name[0]:'T')}</div><div><b>${esc(ON&&S.info?S.info.name:'Tasca do Largo')}</b><small>Área do restaurante${ON?' · ligado ao servidor':' · Serviço de jantar'}</small></div></div>
  <div class="rside"><div class="clock" title="Hora simulada do serviço"><span class="num">${hm(S.now)}</span>${ON?`<span title="${S.live==='ligado'?'Ligado: as reservas chegam na hora':'Sem ligação em direto: a atualizar de 10 em 10 segundos'}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600"><i style="width:9px;height:9px;border-radius:50%;background:${S.live==='ligado'?'#3f8a3f':'#c08a1d'};display:inline-block"></i>${S.live==='ligado'?'Em direto':'Sem direto'}</span><button data-a="logout">Sair</button>`:`<button data-a="tick">+15 min</button>`}</div><button class="themebtn" data-a="theme" aria-label="Alternar tema">◐</button></div></header>
  <nav class="tabs" role="tablist">${tabs.map(([k,l,c])=>`<button role="tab" data-a="tab" data-v="${k}" aria-selected="${S.tab===k}">${l}${c?`<span class="cnt">${c}</span>`:''}</button>`).join('')}</nav>`;
}

function actions(r){
  if(ON&&r.date&&r.date!==TODAY())return '';
  if(r.st==='confirmada'){const early=ON&&sameDay(r)&&S.now<tm(r.time)+15;return `<button class="btn" data-a="arrive" data-v="${r.code}">Chegou</button><button class="btn ghost" data-a="noshow" data-v="${r.code}" ${early?'disabled title="Só pode marcar falta 15 min depois da hora"':''}>${early?'Não veio (a partir das '+hm(tm(r.time)+15)+')':'Não veio'}</button>`}
  if(r.st==='chegou')return `<button class="btn" data-a="pick" data-v="${r.code}">Sentar na mesa</button>`;
  if(r.st==='sentada')return `<button class="btn ok" data-a="finish" data-v="${r.code}">Concluir</button>`;
  return '';
}
