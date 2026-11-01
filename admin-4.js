function rel(){
  const total=RES.length;const ns=RES.filter(r=>r.st==='naoveio').length;
  const byC={};act().forEach(r=>byC[r.cuisine]=(byC[r.cuisine]||0)+r.gmv);
  const cu=Object.entries(byC).sort((a,b)=>b[1]-a[1]);const cm=cu[0]?Math.max(1,cu[0][1]):1;
  const byCity={};act().forEach(r=>byCity[r.city]=(byCity[r.city]||0)+r.res);
  const ct=Object.entries(byCity).sort((a,b)=>b[1]-a[1]);const ctm=ct[0]?Math.max(1,ct[0][1]):1;
  const nres=act().reduce((a,r)=>a+r.res,0);const avg=nres?gmv()/nres:0;
  return `<div class="tiles"><div class="tile"><small>Valor médio por reserva</small><b class="num">${eur(avg)}</b><span>no mês</span></div>
  <div class="tile"><small>Não comparências</small><b class="num">${(total?ns/total*100:0).toFixed(0)}%</b><span>amostra de ${total} reservas</span></div>
  <div class="tile"><small>Novos clientes</small><b class="num">${ON?CL.length:'+248'}</b><span>${ON?'registados':'face ao mês anterior: +12%'}</span></div>
  <div class="tile"><small>Clientes que voltam</small><b class="num">${ON?(CL.length?Math.round(CL.filter(c=>c.res>=2).length/CL.length*100):0)+'%':'61%'}</b><span>fizeram 2 ou mais reservas</span></div></div>
  <div class="two"><div><h2 class="sec">Vendas por tipo de cozinha</h2><div class="panel">${cu.map(([k,v])=>`<div class="hb"><span>${k}</span><span class="tr"><i style="width:${v/cm*100}%"></i></span><b class="num">${eur(v,0)}</b></div>`).join('')}</div></div>
  <div><h2 class="sec">Reservas por cidade</h2><div class="panel">${ct.map(([k,v])=>`<div class="hb"><span>${k}</span><span class="tr"><i style="width:${v/ctm*100}%"></i></span><b class="num">${v}</b></div>`).join('')}</div></div></div>
  <div class="panel"><h3 style="font-size:17px">Exportar</h3><p class="meta" style="margin:4px 0 0">Gera os dados de comissões em CSV para abrir numa folha de cálculo.</p><div class="acts"><button class="btn" data-a="csv">Gerar CSV</button>${S.csv?`<button class="btn sec" data-a="copycsv">Copiar</button>`:''}</div>${S.csv?`<textarea class="csv" id="csvbox" readonly>${esc(S.csv)}</textarea>`:''}</div>`;
}
function topMethod(){const m={};RES.forEach(r=>m[r.m]=(m[r.m]||0)+1);const e=Object.entries(m).sort((a,b)=>b[1]-a[1])[0];return e?e[0]:'—'}
function loginView(){
  return `<main style="max-width:420px;margin:60px auto 0"><div class="panel"><h2 class="sec" style="margin-top:0">Administração</h2>
  <p class="meta">Introduza a chave de administração.</p>
  <input id="ak" type="password" autocomplete="off" placeholder="Chave de administração" style="width:100%;min-height:48px;margin:8px 0">
  ${S.err?`<div class="meta" style="color:var(--danger)">${esc(S.err)}</div>`:''}
  <div class="acts"><button class="btn" data-a="login">Entrar</button></div></div></main>`;
}
const MET={mbway:'MB WAY',card:'Cartão',ref:'Referência MB'};
