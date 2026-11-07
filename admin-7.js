/* Separador Apoio: pedidos de apoio enviados por clientes e restaurantes */
let APOIO=[];
function apoio(){
  if(!ON)return '<div class="empty">Os pedidos de apoio aparecem aqui quando o serviço estiver ligado.</div>';
  if(!APOIO.length)return '<div class="empty">Sem pedidos de apoio.</div>';
  const abertos=APOIO.filter(t=>t.status!=='resolvido').length;
  return `<p class="meta" style="margin-top:0">${abertos} por resolver. Responda por email ao contacto indicado e depois marque como resolvido.</p><div class="grid">`+APOIO.map(t=>`<div class="panel">
  <div class="nm"><b>${esc(t.name)}</b> <span class="pill ${t.status==='resolvido'?'p-ok':'p-bad'}">${t.status==='resolvido'?'Resolvido':'Aberto'}</span> <span class="pill">${t.role==='restaurante'?'Restaurante':'Cliente'}</span></div>
  <div class="meta"><a href="mailto:${encodeURIComponent(t.email)}">${esc(t.email)}</a>${t.code?' · Reserva '+esc(t.code):''} · ${esc(String(t.createdAt).replace('T',' ').slice(0,16))}</div>
  <div class="meta" style="white-space:pre-wrap;color:var(--ink)">${esc(t.message)}</div>
  ${(t.transcript&&t.transcript.length)?`<details><summary class="meta">Conversa com o assistente</summary>${t.transcript.map(m=>`<div class="meta"><b>${m.role==='user'?'Utilizador':'Assistente'}:</b> ${esc(m.content)}</div>`).join('')}</details>`:''}
  <div class="acts"><button class="ghost" data-a="apoioEstado" data-v="${t.id}:${t.status==='resolvido'?'aberto':'resolvido'}">${t.status==='resolvido'?'Reabrir':'Marcar como resolvido'}</button>${confirmBtn('ap'+t.id,'Apagar pedido','apoioApagar',t.id,'ghost')}</div></div>`).join('')+'</div>';
}
