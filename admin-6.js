const R=id=>RS.find(r=>r.id===id);
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-a]');if(!t)return;
  const a=t.dataset.a,v=t.dataset.v;
  if(ON&&['login','closekey','approve','reject','suspend','reactivate','block','unblock','refund','settle','dispC','dispR','retry','logout'].includes(a)){realAction(a,v,t);return}
  switch(a){
    case 'tab':S.tab=v;S.ask=null;break;
    case 'go':S.tab=v;S.ask=null;window.scrollTo(0,0);break;
    case 'rf':S.rf=v;break;
    case 'rsf':S.rsf=v;break;
    case 'pf':S.pf=v;break;
    case 'ask':S.ask=v;break;
    case 'noask':S.ask=null;break;
    case 'approve':R(v).st='ativo';toast(R(v).name+' aprovado e visível aos clientes');break;
    case 'reject':RS.splice(RS.findIndex(r=>r.id===v),1);S.ask=null;toast('Pedido recusado');break;
    case 'suspend':{const r=R(v);r.st='suspenso';r.why='Suspenso pela administração.';S.ask=null;toast(r.name+' suspenso: deixa de aparecer nas pesquisas');break}
    case 'reactivate':{const r=R(v);r.st='ativo';delete r.why;toast(r.name+' reativado');break}
    case 'block':{CL.find(c=>c.id===+v).st='bloqueado';S.ask=null;toast('Conta bloqueada');break}
    case 'unblock':CL.find(c=>c.id===+v).st='ativo';toast('Conta desbloqueada');break;
    case 'refund':{const r=RES.find(x=>x.c===v);r.st='cancelada';r.ps='reembolsado';S.ask=null;toast('Reserva cancelada e '+eur(r.tot)+' reembolsados');break}
    case 'retry':{const r=RES.find(x=>x.c===v);r.ps='pendente';r.st='pendente';toast('Novo pedido de pagamento enviado ao cliente');break}
    case 'settle':R(v).paid=true;toast('Pagamento a '+R(v).name+' registado');break;
    case 'csv':S.csv='restaurante;vendas;taxa_pct;comissao;a_pagar;estado\n'+act().map(r=>[r.name,r.gmv.toFixed(2),r.rate,comm(r).toFixed(2),dueOf(r).toFixed(2),r.paid?'pago':'por pagar'].join(';')).join('\n');break;
    case 'copycsv':{const done=()=>toast('CSV copiado');const sel=()=>{const b=$('#csvbox');b.focus();b.select();toast('Selecione e copie o texto')};
      try{navigator.clipboard.writeText(S.csv).then(done,sel)}catch(_){sel()}return}
    case 'theme':{const d=document.documentElement;const dark=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark';break}
  }
  render();
});
document.addEventListener('change',e=>{
  const id=e.target.dataset&&e.target.dataset.rate;if(!id)return;
  const v=parseFloat(e.target.value);const r=R(id);
  if(ON){if(v>=0&&v<=30)OSP.post('/api/admin/restaurantes/'+id+'/taxa',{taxa:v},S.key).then(()=>{toast('Comissão de '+r.name+': '+v+'%');loadAll()}).catch(x=>toast(x.message));else{e.target.value=r.rate;toast('Indique uma taxa entre 0 e 30')}return}
  if(v>=0&&v<=30){r.rate=v;toast('Comissão de '+r.name+': '+v+'%')}else{e.target.value=r.rate;toast('Indique uma taxa entre 0 e 30')}
});
if(ON){if(S.key)loadAll(true);else render();setInterval(()=>{if(S.key&&!S.loading)loadAll()},30000)}else render();
