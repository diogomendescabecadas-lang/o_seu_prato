/* Separador Menus: a administração vê e altera preços e descrições de qualquer restaurante, e pode trancar. */
let MN={rid:'',dishes:[],hist:[],imgs:[]};
async function loadMenu(){
  if(!MN.rid)return;
  try{const m=await OSP.get('/api/admin/restaurantes/'+encodeURIComponent(MN.rid)+'/menu',S.key);MN.dishes=m.dishes;MN.hist=m.history;MN.imgs=await OSP.get('/api/admin/restaurantes/'+encodeURIComponent(MN.rid)+'/imagens',S.key).catch(()=>[])}catch(e){toast(e.message)}
}
function menus(){
  if(!ON)return '<div class="empty">Os menus aparecem aqui quando o serviço estiver ligado.</div>';
  const chips=RS.filter(r=>r.st!=='pendente').map(r=>`<button class="chip" data-a="menuRest" data-v="${esc(r.id)}" aria-pressed="${MN.rid===r.id}">${esc(r.name)}</button>`).join('');
  if(!MN.rid)return `<p class="meta" style="margin-top:0">Escolha um restaurante. Só a administração e o próprio restaurante veem e alteram preços e descrições.</p><div class="chips">${chips}</div>`;
  return `<div class="chips">${chips}</div><div class="panel"><b>PIN do responsável</b><p class="meta" style="margin:4px 0">Se o responsável o esqueceu, apague-o: o restaurante cria um novo. Só a administração pode fazer isto.</p><div class="acts">${confirmBtn('pin'+MN.rid,'Repor o PIN deste restaurante','menuPin',MN.rid,'ghost')}</div></div>${imgPanel()}<div class="grid">`+MN.dishes.map(d=>`<div class="panel">
  <div class="nm"><b>${esc(d.name)}</b> <span class="pill ${d.locked?'p-ok':''}">${d.locked?'Trancado'+(d.lockedBy?' · '+esc(d.lockedBy):''):'Aberto'}</span></div>
  <label class="lbl">Nome<input type="text" id="mn-n-${esc(d.id)}" value="${esc(d.name)}" maxlength="80"></label>
  <label class="lbl">Descrição<textarea id="mn-d-${esc(d.id)}" maxlength="200">${esc(d.description||'')}</textarea></label>
  <label class="lbl">Preço (€)<input type="number" id="mn-p-${esc(d.id)}" step="0.01" min="0" value="${d.priceCents/100}"></label>
  <div class="acts"><button class="ghost" data-a="menuSave" data-v="${esc(d.id)}">Guardar e trancar</button>${d.locked?`<button class="ghost" data-a="menuUnlock" data-v="${esc(d.id)}">Destrancar</button>`:`<button class="ghost" data-a="menuLock" data-v="${esc(d.id)}">Trancar</button>`}</div></div>`).join('')+'</div>'
  +(MN.hist.length?`<h3>Histórico de alterações</h3><div class="panel">${MN.hist.slice(0,25).map(h=>`<div class="meta"><b>${esc(h.dish)}</b> · ${esc(h.field)}: ${esc(h.oldValue)} → ${esc(h.newValue)} · ${esc(h.by)} · ${esc(String(h.at))}</div>`).join('')}</div>`:'');
}
function imgPanel(){
  const nome=id=>(MN.dishes.find(d=>d.id===id)||{}).name||'';
  const rot={logo:'Logótipo',espaco:'Espaço',prato:'Prato'};
  if(!MN.imgs.length)return '<div class="panel"><b>Imagens</b><p class="meta" style="margin:4px 0 0">Este restaurante ainda não carregou imagens.</p></div>';
  return `<div class="panel"><b>Imagens (${MN.imgs.length})</b><p class="meta" style="margin:4px 0 8px">Pode apagar qualquer imagem imprópria. O restaurante pode carregar outra.</p><div class="grid g3">`+MN.imgs.map(i=>`<div><img src="${esc(OSP.base)}/api/imagens/${esc(i.id)}" alt="${esc(rot[i.kind]||'')}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:var(--surface2)" loading="lazy"><div class="meta">${esc(rot[i.kind]||'')}${i.kind==='prato'?' · '+esc(nome(i.dish_id)):''} · ${Math.round(i.bytes/1024)} KB</div><div class="acts">${confirmBtn('im'+i.id,'Apagar','imgDel',i.id,'ghost')}</div></div>`).join('')+'</div></div>';
}
document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-a="imgDel"]');if(!t||!ON)return;
  try{await OSP.post('/api/admin/imagens/'+t.dataset.v+'/apagar',{},S.key);S.ask=null;toast('Imagem apagada')}catch(x){toast(x.message)}
  await loadMenu();render();
});
