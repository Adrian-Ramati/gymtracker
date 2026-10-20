// hyper.js — Índice de hipertrofia: interfaz.
// ═══ ÍNDICE DE HIPERTROFIA (IH) ═══════════════════════════════════════
// Puntúa de 0 a 100 si el entrenamiento de los últimos 28 días está bien orientado a ganar músculo.
// Componentes: volumen efectivo · proximidad al fallo · frecuencia · sobrecarga progresiva · adherencia.
// El cálculo vive en js/core.js (lo comparte el informe semanal). Aquí solo la interfaz.
function computeHyperIndex(end){return PPCore.computeHyperIndex({sessions:db.sessions||[],templates:db.templates||[],profile:db.profile||{},end:end||todayStr()});}
function hiRing(score,size,stroke){
  const r=(size-stroke)/2,c=2*Math.PI*r,L=hiLabel(score??0),p=score==null?0:score/100,h=size/2;
  return `<svg class="hi-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Índice ${score??'—'} de 100"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${stroke}"/><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${L.c}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${h} ${h})"/><text x="${h}" y="${h}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${Math.round(size*.3)}" font-weight="800" font-family="Manrope,sans-serif">${score==null?'—':score}</text></svg>`;
}
function hiBar(k,c,full){
  const s=c?.score,L=hiLabel(s??0),w=s==null?0:Math.round(s);
  if(!full)return `<div class="hi-bar"><span>${HI_NAMES[k]}</span><i><u style="width:${w}%;background:${L.c}"></u></i><b>${s==null?'—':w}</b></div>`;
  return `<div class="hi-comp"><div class="hi-comp-h"><span>${HI_NAMES[k]}<em>${Math.round(HI_W[k]*100)}%</em></span><b style="color:${s==null?'var(--t3)':L.c}">${s==null?'—':w}</b></div><i class="hi-track"><u style="width:${w}%;background:${L.c}"></u></i><small>${c?.detail||''}</small></div>`;
}
function renderHomeHyper(){
  const el=document.getElementById('hi-mini');if(!el)return;
  const R=computeHyperIndex();
  if(R.score==null){el.innerHTML='<div class="hs-empty">Registra al menos 2 sesiones para calcular tu índice.</div>';return;}
  const L=hiLabel(R.score);
  el.innerHTML=`<div class="hi-top"><div class="hi-ringwrap">${hiRing(R.score,86,8)}<div class="hi-lab" style="color:${L.c}">${L.t}</div></div><div class="hi-bars">${Object.keys(HI_W).map(k=>hiBar(k,R.comp[k])).join('')}</div></div>${R.recs[0]?`<div class="hi-rec1">💡 ${R.recs[0].t}</div>`:''}`;
}
const HI_METHOD=`<details class="card hi-method"><summary>Cómo se calcula <span>›</span></summary><ul>
<li><b>Ventana:</b> últimos 28 días (8 semanas para la progresión). Si llevas menos tiempo registrando, se ajusta a tu historial. Las semanas de descarga del mesociclo no cuentan.</li>
<li><b>Serie dura:</b> cualquier serie que no sea de calentamiento. Cuenta 1 si va a RPE ≥7 (o no tiene RPE), 0,5 si va a RPE 6–6,5 y 0 si va por debajo de 6. Las series de más de 30 reps cuentan la mitad.</li>
<li><b>Músculos secundarios:</b> cada serie suma 1 al músculo principal y 0,5 a sus secundarios (p. ej. el press de banca suma medio punto a tríceps y deltoides anterior). Se ven y se cambian en la ficha de cada ejercicio.</li>
<li><b>Volumen efectivo (35%):</b> series duras por semana de cada músculo frente a tus landmarks MEV/MAV/MRV (editables en Volumen). Puntúa al máximo entre MEV y MAV, baja por debajo de MEV y por encima de MAV, y cae más rápido pasado el MRV. Los 8 grupos principales pesan el doble. Es el factor con la relación dosis-respuesta más clara.</li>
<li><b>Proximidad al fallo (20%):</b> % de series a RPE 7–10 (RIR 0–3) y dentro de 5–30 reps. Penaliza ir al fallo en más del 40% de las series.</li>
<li><b>Sobrecarga progresiva (20%):</b> tendencia del e1RM de cada ejercicio con 3+ sesiones en 8 semanas. ≥ +1%/mes progresa, ±1% estancado, &lt; −1% retrocede. Es un indicador indirecto: la fuerza y el músculo van de la mano solo en parte.</li>
<li><b>Adherencia (15%):</b> sesiones por semana frente al número de rutinas de tu plan, y % de series planificadas (las del mesociclo) que completas.</li>
<li><b>Frecuencia (10%):</b> días por semana que entrenas cada grupo principal; 2 o más = 100. Pesa poco porque, a igual volumen, su efecto sobre la hipertrofia es pequeño: sirve sobre todo para repartir el volumen.</li>
<li><b>Escala:</b> ≥80 óptimo · 65–79 bueno · 50–64 mejorable · &lt;50 subóptimo. Los componentes sin datos no cuentan y su peso se reparte.</li>
<li><b>Base:</b> volumen y frecuencia, Pelland et al. (Sports Medicine, 2026), que también respalda contar las series indirectas como 0,5, y Schoenfeld et al. (2016, 2017); proximidad al fallo, Robinson et al. (Sports Medicine, 2024) y Refalo et al. (2023); landmarks de Renaissance Periodization. Los pesos son un criterio razonado, no un modelo ajustado con datos: es una guía para decidir, no una medida directa del crecimiento muscular.</li>
</ul></details>`;
function renderHyperScr(){
  const b=document.getElementById('hyper-body');if(!b)return;
  const R=computeHyperIndex();
  if(R.score==null){b.innerHTML=`<div class="card"><div class="hs-empty">Registra al menos 2 sesiones en las últimas 4 semanas para calcular tu índice de hipertrofia.</div></div>${HI_METHOD}`;return;}
  const P=computeHyperIndex(addDays(R.end,-28)),L=hiLabel(R.score),d=P.score!=null?R.score-P.score:null;
  const mRows=R.muscles.map(x=>{
    const z=x.lm?(x.v>0?lmZone(Math.round(x.v),x.lm):{txt:'sin trabajar',color:'#f87171'}):{txt:'sin referencia',color:'var(--t3)'};
    return `<div class="hi-mrow"><span>${esc(x.m)}${x.major?'':' <i>·</i>'}</span><b>${f1(x.v)}</b><em style="color:${z.color}">${z.txt}</em><small>${f1(x.f)}×</small></div>`;}).join('');
  const xRows=R.exercises.length?R.exercises.map(x=>{const c=x.st==='up'?'var(--green)':x.st==='down'?'var(--red)':'var(--amber)';
    return `<div class="hi-xrow"><span>${esc(x.name)}</span><b style="color:${c}">${x.st==='up'?'▲':x.st==='down'?'▼':'■'} ${x.pct>0?'+':''}${x.pct.toFixed(1)}%</b><small>${x.n} ses.</small></div>`;}).join('')
    :'<div class="hs-empty">Necesitas 3+ sesiones de un mismo ejercicio en 8 semanas.</div>';
  b.innerHTML=`
    <div class="card hi-hero">${hiRing(R.score,128,11)}<div style="min-width:0"><div class="hi-big" style="color:${L.c}">${L.t}</div><div class="hi-meta">${fmtDate(R.start)} – ${fmtDate(R.end)} · ${R.sessions} sesiones${R.deloadSessions?` · ${R.deloadSessions} de descarga excluidas`:''}</div>${d!=null?`<div class="hi-delta ${d>=0?'up':'dn'}">${d>=0?'▲ +':'▼ '}${d} vs 28 días anteriores</div>`:''}</div></div>
    <div class="card"><div class="card-title">Qué cambiar</div><ol class="hi-recs">${R.recs.slice(0,5).map(r=>`<li>${r.t}</li>`).join('')}</ol></div>
    <div class="card"><div class="card-title">Componentes <span>peso en el índice</span></div>${Object.keys(HI_W).map(k=>hiBar(k,R.comp[k],true)).join('')}</div>
    <div class="card"><div class="card-title">Por músculo <span>series duras/sem · días/sem</span></div>${mRows}</div>
    <div class="card"><div class="card-title">Progresión <span>e1RM al mes · 8 semanas</span></div>${xRows}</div>
    ${HI_METHOD}`;
}
