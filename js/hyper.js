// hyper.js — Índice de hipertrofia: interfaz.
// ═══ ÍNDICE DE HIPERTROFIA (IH) ═══════════════════════════════════════
// Puntúa de 0 a 100 si el entrenamiento de los últimos 28 días está bien orientado a ganar músculo.
// Componentes: volumen efectivo · proximidad al fallo · frecuencia · sobrecarga progresiva · adherencia.
const HI_MAJOR=['Pectoral','Espalda','Cuádriceps','Isquiosurales','Glúteos','Deltoides lateral','Bíceps','Tríceps'];
const HI_W={vol:.30,int:.20,freq:.15,prog:.20,adh:.15};
const HI_NAMES={vol:'Volumen efectivo',int:'Proximidad al fallo',freq:'Frecuencia',prog:'Sobrecarga progresiva',adh:'Adherencia'};
// Serie de trabajo: registrada y no marcada como calentamiento
function isWorkSet(s){return !!s&&!!(s.done||s.kg)&&(s.type||'normal')!=='warmup';}
const hasRpe=s=>s.rpe!=null&&s.rpe!==''&&!isNaN(+s.rpe);
// Crédito de "serie dura": 1 si RPE ≥7 (o sin RPE), 0,5 si RPE 6–6,5, 0 si RPE <6; >30 reps cuenta la mitad
function hardCredit(s){
  if(!isWorkSet(s))return 0;
  let c=1;
  if(hasRpe(s)){const r=+s.rpe;c=r>=7?1:r>=6?.5:0;}
  if(s.reps>30)c*=.5;
  return c;
}
function addDays(ds,n){const[y,m,d]=ds.split('-').map(Number);const x=new Date(y,m-1,d);x.setDate(x.getDate()+n);return isoDate(x);}
function daysBetween(a,b){const p=s=>{const[y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d);};return Math.round((p(b)-p(a))/864e5);}
const f1=v=>String(Math.round(v*10)/10);
function hiVolScore(v,lm){
  if(!(v>0))return 0;
  if(v<lm.mev)return 60*v/lm.mev;
  if(v<=lm.mav)return 85+15*(v-lm.mev)/Math.max(1,lm.mav-lm.mev);
  if(v<=lm.mrv)return 100-20*(v-lm.mav)/Math.max(1,lm.mrv-lm.mav);
  return Math.max(20,80-6*(v-lm.mrv));
}
function hiLabel(sc){return sc>=80?{t:'Óptimo',c:'#34d399'}:sc>=65?{t:'Bueno',c:'#4f7cff'}:sc>=50?{t:'Mejorable',c:'#fbbf24'}:{t:'Subóptimo',c:'#f87171'};}
function computeHyperIndex(end){
  end=end||todayStr();
  const start=addDays(end,-27);
  const all=(db.sessions||[]).filter(s=>s&&s.date);
  const ss=all.filter(s=>s.date>=start&&s.date<=end);
  const first=all.length?all.reduce((a,s)=>s.date<a?s.date:a,all[0].date):end;
  const span=Math.min(28,Math.max(7,daysBetween(first>start?first:start,end)+1));
  const weeks=span/7;
  const R={end,start,weeks,sessions:ss.length,comp:{},muscles:[],exercises:[],recs:[],score:null};
  if(ss.length<2){R.insufficient=true;return R;}
  // ── Recuento por músculo e intensidad
  const hard={},dates={},raw={};
  let work=0,withRpe=0,eff=0,junk=0,fail=0,repsKnown=0,repsOK=0;
  ss.forEach(s=>s.exercises?.forEach(e=>{const m=normMuscle(e.muscle);(e.sets||[]).forEach(st=>{
    if(!isWorkSet(st))return;work++;
    const c=hardCredit(st);hard[m]=(hard[m]||0)+c;raw[m]=(raw[m]||0)+1;
    if(c>0)(dates[m]=dates[m]||new Set()).add(s.date);
    if(hasRpe(st)){withRpe++;const r=+st.rpe;if(r>=7)eff++;if(r<6)junk++;if(r>=10)fail++;}
    else if(st.type==='failure')fail++;
    if(st.reps>0){repsKnown++;if(st.reps>=5&&st.reps<=30)repsOK++;}
  });}));
  const V=m=>(hard[m]||0)/weeks;
  // 1 · Volumen efectivo vs landmarks (MEV/MAV/MRV)
  let vs=0,vw=0,inZone=0,nLm=0;
  new Set([...HI_MAJOR,...Object.keys(hard)]).forEach(m=>{
    const lm=getLandmarks(m),v=V(m),f=dates[m]?dates[m].size/weeks:0,major=HI_MAJOR.includes(m);
    if(!lm){if(v>0)R.muscles.push({m,v,f,lm:null,score:null,major});return;}
    if(!major&&!(v>0))return;
    const sc=hiVolScore(v,lm),w=major?1:.5;vs+=sc*w;vw+=w;nLm++;
    if(v>=lm.mev&&v<=lm.mav)inZone++;
    R.muscles.push({m,v,f,lm,score:sc,major,rv:(raw[m]||0)/weeks});
  });
  R.muscles.sort((a,b)=>(b.major-a.major)||(b.v-a.v));
  R.comp.vol={score:vw?vs/vw:null,detail:`${inZone} de ${nLm} grupos en zona productiva (MEV–MAV)`};
  // 2 · Proximidad al fallo y rango de reps
  const cov=work?withRpe/work:0;
  if(withRpe>=8&&cov>=.3){
    const effS=eff/withRpe,junkS=junk/withRpe,repS=repsKnown?repsOK/repsKnown:1,failS=work?fail/work:0;
    R.comp.int={score:Math.max(0,Math.min(100,100*(.8*effS+.2*repS)-40*Math.max(0,failS-.4))),
      detail:`${Math.round(effS*100)}% de series a RPE 7–10${junkS>=.05?` · ${Math.round(junkS*100)}% demasiado fáciles`:''}`,effS,junkS,failS,cov};
  }else R.comp.int={score:null,detail:`Sin datos: RPE registrado en el ${Math.round(cov*100)}% de las series`,cov};
  // 3 · Frecuencia por grupo principal
  const fm=R.muscles.filter(x=>x.major&&x.v>0);
  if(fm.length){
    const sc=fm.map(x=>x.f>=2?100:x.f>=1?50+50*(x.f-1):50*x.f);
    R.comp.freq={score:sc.reduce((a,b)=>a+b,0)/sc.length,detail:`${f1(fm.reduce((a,x)=>a+x.f,0)/fm.length)} días/semana de media por grupo`};
  }else R.comp.freq={score:null,detail:'Sin datos'};
  // 4 · Sobrecarga progresiva: tendencia del e1RM en 8 semanas
  const pStart=addDays(end,-55),hist={};
  all.filter(s=>s.date>=pStart&&s.date<=end).forEach(s=>s.exercises?.forEach(e=>{if(+e.best_e1rm>0)(hist[e.name]=hist[e.name]||[]).push({d:s.date,v:+e.best_e1rm});}));
  Object.entries(hist).forEach(([name,h])=>{
    if(h.length<3)return;h.sort((a,b)=>a.d.localeCompare(b.d));
    if(h[h.length-1].d<start)return;
    const xs=h.map(p=>daysBetween(h[0].d,p.d)),ys=h.map(p=>p.v),n=h.length;
    const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n,sxx=xs.reduce((a,x)=>a+(x-mx)**2,0);
    const slope=sxx?xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/sxx:0;
    const pct=my?slope*28/my*100:0;
    R.exercises.push({name,n,pct,st:pct>=1?'up':pct<=-1?'down':'flat',last:ys[n-1]});
  });
  R.exercises.sort((a,b)=>b.pct-a.pct);
  if(R.exercises.length>=2){
    const sc=R.exercises.map(x=>x.st==='up'?100:x.st==='flat'?55:20),wt=R.exercises.map(x=>x.n);
    R.comp.prog={score:sc.reduce((a,v,i)=>a+v*wt[i],0)/wt.reduce((a,b)=>a+b,0),detail:`${R.exercises.filter(x=>x.st==='up').length} de ${R.exercises.length} ejercicios progresan`};
  }else R.comp.prog={score:null,detail:'Hacen falta ≥3 sesiones por ejercicio en 8 semanas'};
  // 5 · Adherencia: sesiones/semana vs plan y series completadas vs planificadas
  const plan=Math.max(2,Math.min(6,(db.templates||[]).length||3)),spw=ss.length/weeks,fr=Math.min(1,spw/plan);
  const done=[];
  ss.forEach(s=>{const t=(db.templates||[]).find(t=>t.name===s.name);if(!t)return;
    const planned=(t.exercises||[]).reduce((a,e)=>a+(+e.sets||3),0);if(!planned)return;
    done.push(Math.min(1,(s.exercises||[]).reduce((a,e)=>a+(e.sets||[]).filter(isWorkSet).length,0)/planned));});
  const cr=done.length?done.reduce((a,b)=>a+b,0)/done.length:null;
  R.comp.adh={score:100*(cr==null?fr:.5*fr+.5*cr),detail:`${f1(spw)} sesiones/sem de ${plan}${cr!=null?` · ${Math.round(cr*100)}% de series planificadas`:''}`,spw,plan,cr};
  // ── Índice global (los componentes sin datos no cuentan y su peso se reparte)
  let tw=0,ts=0;Object.entries(HI_W).forEach(([k,w])=>{const c=R.comp[k];if(c&&c.score!=null){ts+=c.score*w;tw+=w;}});
  R.score=tw?Math.round(ts/tw):null;
  // ── Recomendaciones priorizadas
  const rec=(p,t)=>R.recs.push({p,t});
  const lows=R.muscles.filter(x=>x.lm&&x.major&&x.v<x.lm.mev).sort((a,b)=>(b.lm.mev-b.v)-(a.lm.mev-a.v));
  const regNote=x=>x.rv-x.v>=1?` (${f1(x.rv)} registradas)`:'';
  if(lows.length>=3){const nm=lows.slice(0,3).map(x=>`<b>${esc(x.m)}</b>`);
    rec(90,`Sube el volumen de ${nm.slice(0,-1).join(', ')} y ${nm[nm.length-1]}${lows.length>3?` (y ${lows.length-3} más)`:''}: están por debajo de su MEV. Añade 2–4 series duras por semana a cada uno.`);}
  else lows.forEach(x=>{const gap=Math.ceil(x.lm.mev-x.v);
    rec(92-x.v,`Sube <b>${esc(x.m)}</b>: ${f1(x.v)} series duras/sem${regNote(x)}, por debajo de tu MEV (${x.lm.mev}). Añade ${gap}–${gap+2} series a la semana.`);});
  R.muscles.filter(x=>x.lm&&x.v>x.lm.mrv).forEach(x=>rec(86,`Baja <b>${esc(x.m)}</b>: ${f1(x.v)} series/sem superan tu MRV (${x.lm.mrv}). Quita ${Math.ceil(x.v-x.lm.mav)} para volver a la zona productiva.`));
  if(cr!=null&&cr<.9)rec(88,`Completas el ${Math.round(cr*100)}% de las series planificadas: estás recortando sesiones. Haz primero los ejercicios clave o planifica menos series.`);
  if(spw<plan*.75)rec(72,`Haces ${f1(spw)} sesiones/sem de las ${plan} de tu plan.`);
  if(R.comp.int.score==null)rec(70,'Registra el RPE en cada serie: sin él no se puede saber cuántas series son realmente efectivas.');
  else{
    if(R.comp.int.junkS>.5)rec(96,`El ${Math.round(R.comp.int.junkS*100)}% de tus series están a RPE &lt;6 y no cuentan como series efectivas: llévalas a RPE 7–9 (te quedan 1–3 reps).`);
    else if(R.comp.int.junkS>.2)rec(76,`El ${Math.round(R.comp.int.junkS*100)}% de tus series están a RPE &lt;6: acércalas a RIR 1–3 o elimínalas.`);
    if(R.comp.int.failS>.4)rec(62,`Llevas al fallo el ${Math.round(R.comp.int.failS*100)}% de las series: resérvalo para la última serie de aislamientos.`);
  }
  R.muscles.filter(x=>x.major&&x.v>=4&&x.f<1.5).forEach(x=>rec(58,`<b>${esc(x.m)}</b> se entrena ${f1(x.f)} día/sem: reparte sus ${f1(x.v)} series en 2 sesiones.`));
  R.exercises.filter(x=>x.st!=='up'&&x.n>=4).sort((a,b)=>a.pct-b.pct).slice(0,2).forEach(x=>
    rec(x.st==='down'?80:55,`<b>${esc(x.name)}</b> ${x.st==='down'?'retrocede':'está estancado'} (${x.pct>0?'+':''}${x.pct.toFixed(1)}% de e1RM al mes): cambia el rango de reps o la variante.`));
  const push=V('Pectoral')+V('Deltoides anterior'),pull=V('Espalda');
  if(push>4&&pull<.8*push)rec(50,`Desequilibrio empuje/tirón: ${f1(pull)} series de espalda frente a ${f1(push)} de empuje. Busca un ratio cercano a 1:1.`);
  if(V('Cuádriceps')>4&&V('Isquiosurales')<.6*V('Cuádriceps'))rec(45,`Isquiosurales (${f1(V('Isquiosurales'))} series/sem) muy por detrás de cuádriceps (${f1(V('Cuádriceps'))}).`);
  const rpeAvg=(a,b)=>{let s=0,n=0;all.filter(x=>x.date>=a&&x.date<=b).forEach(x=>x.exercises?.forEach(e=>e.sets?.forEach(st=>{if(isWorkSet(st)&&hasRpe(st)){s+=+st.rpe;n++;}})));return n>=6?s/n:null;};
  const rNow=rpeAvg(addDays(end,-6),end),rPrev=rpeAvg(start,addDays(end,-7));
  if(rNow!=null&&rPrev!=null&&rNow-rPrev>=.7&&(R.comp.prog.score??100)<60)
    rec(84,`Señales de fatiga: el RPE medio sube (${f1(rPrev)} → ${f1(rNow)}) sin que suba la fuerza. Programa una semana de descarga (−40–50% de series).`);
  R.recs.sort((a,b)=>b.p-a.p);
  if(!R.recs.length)rec(0,'Todo en orden: mantén el volumen y sigue subiendo cargas o repeticiones.');
  return R;
}
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
<li><b>Ventana:</b> últimos 28 días (8 semanas para la progresión). Si llevas menos tiempo registrando, se ajusta a tu historial.</li>
<li><b>Serie dura:</b> cualquier serie que no sea de calentamiento. Cuenta 1 si va a RPE ≥7 (o no tiene RPE), 0,5 si va a RPE 6–6,5 y 0 si va por debajo de 6. Las series de más de 30 reps cuentan la mitad.</li>
<li><b>Volumen efectivo (30%):</b> series duras por semana de cada músculo frente a tus landmarks MEV/MAV/MRV (editables en Volumen). Puntúa al máximo entre MEV y MAV, baja por debajo de MEV y por encima de MAV, y cae más rápido pasado el MRV. Los 8 grupos principales pesan el doble.</li>
<li><b>Proximidad al fallo (20%):</b> % de series a RPE 7–10 (RIR 0–3) y dentro de 5–30 reps. Penaliza ir al fallo en más del 40% de las series.</li>
<li><b>Frecuencia (15%):</b> días por semana que entrenas cada grupo principal; 2 o más = 100.</li>
<li><b>Sobrecarga progresiva (20%):</b> tendencia del e1RM de cada ejercicio con 3+ sesiones en 8 semanas. ≥ +1%/mes progresa, ±1% estancado, &lt; −1% retrocede.</li>
<li><b>Adherencia (15%):</b> sesiones por semana frente al número de rutinas de tu plan, y % de series planificadas que completas.</li>
<li><b>Escala:</b> ≥80 óptimo · 65–79 bueno · 50–64 mejorable · &lt;50 subóptimo. Los componentes sin datos no cuentan.</li>
<li><b>Base:</b> metaanálisis de volumen (Schoenfeld et al., 2017; Pelland et al., 2024), frecuencia (Schoenfeld et al., 2016) y proximidad al fallo (Refalo et al., 2023; Robinson et al., 2024), y landmarks de volumen de Renaissance Periodization. Es una guía para tomar decisiones, no una medida directa del crecimiento muscular.</li>
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
    <div class="card hi-hero">${hiRing(R.score,128,11)}<div style="min-width:0"><div class="hi-big" style="color:${L.c}">${L.t}</div><div class="hi-meta">${fmtDate(R.start)} – ${fmtDate(R.end)} · ${R.sessions} sesiones</div>${d!=null?`<div class="hi-delta ${d>=0?'up':'dn'}">${d>=0?'▲ +':'▼ '}${d} vs 28 días anteriores</div>`:''}</div></div>
    <div class="card"><div class="card-title">Qué cambiar</div><ol class="hi-recs">${R.recs.slice(0,5).map(r=>`<li>${r.t}</li>`).join('')}</ol></div>
    <div class="card"><div class="card-title">Componentes <span>peso en el índice</span></div>${Object.keys(HI_W).map(k=>hiBar(k,R.comp[k],true)).join('')}</div>
    <div class="card"><div class="card-title">Por músculo <span>series duras/sem · días/sem</span></div>${mRows}</div>
    <div class="card"><div class="card-title">Progresión <span>e1RM al mes · 8 semanas</span></div>${xRows}</div>
    ${HI_METHOD}`;
}
