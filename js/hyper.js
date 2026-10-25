// hyper.js — Índice de hipertrofia: interfaz.
// ═══ ÍNDICE DE HIPERTROFIA OPTIMIZADO (IHO) ═══════════════════════════════════════
// Puntúa de 0 a 100 si el entrenamiento de los últimos 28 días está bien orientado a ganar músculo.
// Componentes: volumen efectivo · proximidad al fallo · sobrecarga progresiva · adherencia · densidad, con β (recuperación) y Φ (fatiga).
// El cálculo vive en js/core.js (lo comparte el informe semanal). Aquí solo la interfaz.
function computeHyperIndex(end){return PPCore.computeHyperIndex({sessions:db.sessions||[],templates:db.templates||[],profile:db.profile||{},biometrics:db.biometrics||[],end:end||todayStr()});}
function hiRing(score,size,stroke,risk){
  const r=(size-stroke)/2,c=2*Math.PI*r,L=hiLabel(score??0,risk),p=score==null?0:score/100,h=size/2;
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
  const L=hiLabel(R.score,R.risk);
  el.innerHTML=`<div class="hi-top"><div class="hi-ringwrap">${hiRing(R.score,86,8,R.risk)}<div class="hi-lab" style="color:${L.c}">${L.t}</div></div><div class="hi-bars">${Object.keys(HI_W).map(k=>hiBar(k,R.comp[k])).join('')}</div></div>${R.recs[0]?`<div class="hi-rec1">💡 ${R.recs[0].t}</div>`:''}`;
}
const HI_METHOD=`<details class="card hi-method"><summary>Cómo se calcula <span>›</span></summary><ul>
<li><b>Fórmula:</b> IHO = β · (suma ponderada de 5 componentes) − Φ, de 0 a 100. Ventana: últimos 28 días (8 semanas para la progresión). Las semanas de descarga no cuentan.</li>
<li><b>Esfuerzo real:</b> cada serie estimula según las repeticiones que te quedaban (RIR): RIR 0–1 = 1 · 2 = 0,95 · 3 = 0,85 · 4 = 0,60 · 5 = 0,35 · más = 0. Solo cuenta el esfuerzo que marcas tú; el copiado de otra sesión no cuenta.</li>
<li><b>Volumen efectivo (35%):</b> series ponderadas por esfuerzo por semana de cada músculo (principal 1, secundarios 0,5) frente a tus MEV/MAV/MRV. Sube hasta el MAV, meseta hasta el MRV y cae por encima. Más de 10 series efectivas por músculo en una sesión cuentan la mitad.</li>
<li><b>Proximidad al fallo (20%):</b> estímulo medio de tus series. Necesita el esfuerzo registrado en al menos la mitad de las series.</li>
<li><b>Sobrecarga progresiva (20%):</b> pendiente del e1RM de cada ejercicio con 3+ sesiones en 8 semanas (+2,5% al mes ≈ 88; plano = 50).</li>
<li><b>Adherencia (15%):</b> sesiones por semana frente a tu plan y series hechas frente a las planificadas al empezar.</li>
<li><b>Densidad del estímulo (10%):</b> descanso real entre series (medido con la hora de cada serie) frente al objetivo: multiarticular pesado 2–4 min, multiarticular 1:30–3 min, aislamiento 1–2:30 min. Penaliza sobre todo descansar poco.</li>
<li><b>β · recuperación (entre −15% y +5%):</b> readiness diaria con sueño, pulso en reposo y HRV del reloj (si los hay) frente a tu línea base de 60 días, más el check-in del inicio de sesión. Resta si te recuperas mal de forma sostenida y suma si ajustas la carga a cómo llegas.</li>
<li><b>Φ · fatiga acumulada (hasta −25):</b> picos de carga (últimos 7 días frente a 28), demasiado fallo en multiarticulares y caída del rendimiento.</li>
<li><b>Topes:</b> con riesgo de sobrecarga, o si más de la mitad de las series se quedan a RIR ≥5, la nota no pasa de 59.</li>
<li><b>Escala:</b> ≥80 óptimo · 60–79 productivo · 40–59 mantenimiento · &lt;40 insuficiente. Los componentes sin datos no cuentan y su peso se reparte.</li>
<li><b>Base:</b> volumen, Pelland et al. (2024), con series indirectas a 0,5; proximidad al fallo, Robinson et al. (2024) y Refalo et al. (2023); fatiga del fallo, Morán-Navarro et al. (2017); descansos, Singer et al. (2024); sueño, Lamon et al. (2021); HRV, Manresa-Rocamora et al. (2021). Es un modelo de decisión con constantes razonadas, no una medida validada de hipertrofia.</li>
</ul></details>`;
function hiRecoveryCard(R){
  const pct=v=>(v>=1?'+':'')+Math.round((v-1)*100)+'%';
  const rd=R.readiness==null?'<small>Sin datos de recuperación: haz el check-in al empezar o conecta el reloj (app Android).</small>'
    :`<div class="hi-mrow"><span>Readiness media</span><b>${Math.round(R.readiness*100)}</b><em style="color:${R.readiness>=.6?'var(--green)':R.readiness>=.4?'var(--amber)':'var(--red)'}">${R.readiness>=.6?'buena':R.readiness>=.4?'regular':'baja'}</em><small>${R.readinessDays} días</small></div>`
     +(R.alignment==null?'':`<div class="hi-mrow"><span>Ajuste de la carga</span><b>${Math.round(R.alignment*100)}</b><em style="color:${R.alignment>=.7?'var(--green)':'var(--amber)'}">${R.alignment>=.7?'te autorregulas':'mejorable'}</em><small></small></div>`);
  const p=R.phiParts||{};
  return `<div class="card"><div class="card-title">Recuperación y fatiga <span>β ${pct(R.beta??1)} · Φ −${f1(R.phi||0)}</span></div>${rd}
    <div class="hi-mrow"><span>Carga 7 d / 28 d</span><b>${f1(p.acwr??1)}</b><em style="color:${(p.spike||0)>0?'var(--red)':'var(--green)'}">${(p.spike||0)>0?'pico de carga':'estable'}</em><small>${(p.spike||0)?'−'+f1(p.spike):''}</small></div>
    <div class="hi-mrow"><span>Fallo en multiarticulares</span><b>${Math.round((R.comp.int?.failS||0)*100)}%</b><em style="color:${(p.fail||0)>0?'var(--red)':'var(--green)'}">${(p.fail||0)>0?'excesivo':'correcto'}</em><small>${(p.fail||0)?'−'+f1(p.fail):''}</small></div>
    <div class="hi-mrow"><span>Ejercicios rindiendo menos</span><b>${p.drops||0}/${p.nPerf||0}</b><em style="color:${(p.perf||0)>0?'var(--red)':'var(--green)'}">${(p.perf||0)>0?'caída':'normal'}</em><small>${(p.perf||0)?'−'+f1(p.perf):''}</small></div></div>`;
}
function renderHyperScr(){
  const b=document.getElementById('hyper-body');if(!b)return;
  const R=computeHyperIndex();
  if(R.score==null){b.innerHTML=`<div class="card"><div class="hs-empty">Registra al menos 2 sesiones en las últimas 4 semanas para calcular tu índice de hipertrofia.</div></div>${HI_METHOD}`;return;}
  const P=computeHyperIndex(addDays(R.end,-28)),L=hiLabel(R.score,R.risk),d=P.score!=null?R.score-P.score:null;
  const mRows=R.muscles.map(x=>{
    const z=x.lm?(x.v>0?lmZone(Math.round(x.v),x.lm):{txt:'sin trabajar',color:'#f87171'}):{txt:'sin referencia',color:'var(--t3)'};
    return `<div class="hi-mrow"><span>${esc(x.m)}${x.major?'':' <i>·</i>'}</span><b>${f1(x.v)}</b><em style="color:${z.color}">${z.txt}</em><small>${f1(x.f)}×</small></div>`;}).join('');
  const xRows=R.exercises.length?R.exercises.map(x=>{const c=x.st==='up'?'var(--green)':x.st==='down'?'var(--red)':'var(--amber)';
    return `<div class="hi-xrow"><span>${esc(x.name)}</span><b style="color:${c}">${x.st==='up'?'▲':x.st==='down'?'▼':'■'} ${x.pct>0?'+':''}${x.pct.toFixed(1)}%</b><small>${x.n} ses.</small></div>`;}).join('')
    :'<div class="hs-empty">Necesitas 3+ sesiones de un mismo ejercicio en 8 semanas.</div>';
  b.innerHTML=`
    <div class="card hi-hero">${hiRing(R.score,128,11,R.risk)}<div style="min-width:0"><div class="hi-big" style="color:${L.c}">${L.t}</div><div class="hi-meta">${fmtDate(R.start)} – ${fmtDate(R.end)} · ${R.sessions} sesiones${R.deloadSessions?` · ${R.deloadSessions} de descarga excluidas`:''}</div>${d==null?'':d===0?'<div class="hi-delta">= igual que los 28 días anteriores</div>':`<div class="hi-delta ${d>0?'up':'dn'}">${d>0?'▲ +':'▼ '}${d} vs 28 días anteriores</div>`}</div></div>
    <div class="card"><div class="card-title">Qué cambiar</div><ol class="hi-recs">${R.recs.slice(0,5).map(r=>`<li>${r.t}</li>`).join('')}</ol></div>
    <div class="card"><div class="card-title">Componentes <span>peso en el índice</span></div>${Object.keys(HI_W).map(k=>hiBar(k,R.comp[k],true)).join('')}</div>
    ${hiRecoveryCard(R)}
    <div class="card"><div class="card-title">Por músculo <span>series efectivas/sem · días/sem</span></div>${mRows}</div>
    <div class="card"><div class="card-title">Progresión <span>e1RM al mes · 8 semanas</span></div>${xRows}</div>
    ${HI_METHOD}`;
}
