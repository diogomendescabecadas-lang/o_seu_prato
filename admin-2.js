const rn=id=>(RS.find(r=>r.id===id)||{name:id}).name;
const S={key:OSP.store.get('osp_akey'),loading:ON&&!!OSP.store.get('osp_akey'),err:'',newKey:null,sum:null,tab:'geral',q:'',rf:'todos',rsf:'todas',pf:'todos',ask:null,csv:''};
const tabsDef=()=>[['geral','Visão geral'],['rest','Restaurantes',RS.filter(r=>r.st==='pendente').length],['cli','Clientes'],['res','Reservas'],['disp','Disputas',DISP.length],['pag','Pagamentos',RES.filter(r=>r.ps==='falhado').length],['com','Comissões'],['menus','Menus'],['apoio','Apoio',APOIO.filter(t=>t.status!=='resolvido').length],['rel','Relatórios']];
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2400)}
const act=()=>RS.filter(r=>r.st==='ativo'||r.st==='suspenso');
const gmv=()=>act().reduce((a,r)=>a+r.gmv,0);
const comm=r=>ON?r.comm:r.gmv*r.rate/100;
const dueOf=r=>ON?r.due:dueOf(r);
const commTot=()=>act().reduce((a,r)=>a+comm(r),0);
const rstPill={ativo:['Ativo','p-ok'],suspenso:['Suspenso','p-bad'],pendente:['Por aprovar','p-wait']};
const resPill={confirmada:['Confirmada','p-info'],concluida:['Concluída','p-ok'],cancelada:['Cancelada','p-off'],naoveio:['Não veio','p-bad'],pendente:['Sem pagamento','p-wait'],reembolsada:['Reembolsada','p-off']};
const payPill={pago:['Pago','p-ok'],falhado:['Falhado','p-bad'],reembolsado:['Reembolsado','p-off'],pendente:['Pendente','p-wait']};
function confirmBtn(key,label,act,id,cls){
  if(S.ask===key)return `<button class="btn danger" data-a="${act}" data-v="${id}">Confirmar</button><button class="btn ghost" data-a="noask">Cancelar</button>`;
  return `<button class="btn ${cls||'ghost'}" data-a="ask" data-v="${key}">${label}</button>`;
}

function header(){
  return `<header class="top"><div class="brand"><div class="lg">O</div><div><b>O Seu Prato<span class="badge-admin">Admin</span></b><small>Administração da plataforma</small></div></div><span style="display:flex;gap:8px;align-items:center">${ON?'<button class="btn ghost" data-a="logout">Sair</button>':''}<button class="themebtn" data-a="theme" aria-label="Alternar tema">◐</button></span></header>
  <nav class="tabs" role="tablist">${tabsDef().map(([k,l,c])=>`<button role="tab" data-a="tab" data-v="${k}" aria-selected="${S.tab===k}">${l}${c?`<span class="cnt">${c}</span>`:''}</button>`).join('')}</nav>`;
}

function geral(){
  const pend=RS.filter(r=>r.st==='pendente');
  const failed=RES.filter(r=>r.ps==='falhado');
  const noshow=RES.filter(r=>r.st==='naoveio');
  const max=Math.max(1,...WEEKS.map(w=>w[1]));
  const top=[...act()].sort((a,b)=>b.gmv-a.gmv).slice(0,5);const tm=top[0]?Math.max(1,top[0].gmv):1;
  const todo=[
   ...pend.map(r=>`<div class="todo"><span><b>${r.name}</b><br><span class="meta">${r.city} · quer entrar na plataforma</span></span><button class="btn" data-a="go" data-v="rest">Rever</button></div>`),
   ...failed.map(r=>`<div class="todo"><span><b>Pagamento falhado</b><br><span class="meta">${r.c} · ${esc(r.cl)} · ${eur(r.tot)}</span></span><button class="btn sec" data-a="go" data-v="pag">Ver</button></div>`),
   ...noshow.map(r=>`<div class="todo"><span><b>Não compareceu</b><br><span class="meta">${esc(r.cl)} · ${rn(r.r)}</span></span><button class="btn sec" data-a="go" data-v="cli">Ver cliente</button></div>`)
  ];
  return `<div class="tiles"><div class="tile"><small>Vendas do mês (GMV)</small><b class="num">${eur(gmv(),0)}</b><span>pré-pagas na plataforma</span></div>
  <div class="tile"><small>Receita em comissões</small><b class="num">${eur(commTot(),0)}</b><span class="num">${(gmv()?commTot()/gmv()*100:0).toFixed(1).replace('.',',')}% das vendas</span></div>
  <div class="tile"><small>Reservas no mês</small><b class="num">${act().reduce((a,r)=>a+r.res,0).toLocaleString('pt-PT')}</b><span>${act().length} restaurantes</span></div>
  <div class="tile"><small>Clientes ativos</small><b class="num">${CL.filter(c=>c.st==='ativo').length}</b><span>${ON?(S.sum?S.sum.preRegistrations+' pré-registos':''):CL.length+' registados (amostra)'}</span></div></div>
  <div class="two"><div><h2 class="sec">Vendas por semana</h2><div class="panel"><div class="bars" role="img" aria-label="Vendas semanais, em milhares de euros">${WEEKS.map(([w,v],i)=>`<div class="${i===WEEKS.length-1?'last':''}"><b class="num">${(v/1000).toFixed(1).replace('.',',')}k</b><i style="height:${v/max*100}%"></i><small>${w}</small></div>`).join('')}</div></div>
  <h2 class="sec">Restaurantes com mais vendas</h2>
