// registro.js — Registro de series sin teclado y sin datos inventados.
// · Objetivo de cada serie: la anterior de hoy («otra igual») → doble progresión → sesión anterior. El RPE nunca se copia.
// · Teclado propio en móvil (steppers ±incremento del equipo y teclado numérico) en lugar del teclado del sistema.
// · Pregunta de RIR al terminar cada serie (chips 0–4+).
// · Antes de empezar una rutina: tiempo disponible (los accesorios que no caben quedan al final como opcionales)
//   y check-in de recuperación (sueño, agujetas, energía + reloj) con la carga recomendada del día.

// Teclado propio solo con pantalla táctil; con ratón y teclado físico se escribe como siempre.
const NUMPAD=typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;

// ═══ OBJETIVO DE CADA SERIE ═══
function setTarget(ex,si){
  const s=ex?.sets?.[si];if(!s)return null;
  const lv=getLastEx(ex.name)?.sets?.[si];
  if((s.type||'normal')==='warmup')return lv&&(lv.kg!=null||lv.reps!=null)?{kg:lv.kg,reps:lv.reps,src:'prev'}:null;
  for(let i=si-1;i>=0;i--){const p=ex.sets[i];if((p.type||'normal')!=='warmup'&&p.done&&(p.kg!=null||p.reps!=null))return{kg:p.kg,reps:p.reps,src:'today'};}
  if(activeSess&&!activeSess.isTmplEdit&&!activeSess.editing){
    const dlw=mesoNow(activeSess.date);
    if(dlw?.deload){
      const ws=(getLastEx(ex.name)?.sets||[]).filter(x=>x.kg>0&&(x.type||'normal')!=='warmup');
      if(ws.length){const top=Math.max(...ws.map(x=>x.kg));return{kg:Math.round(top*.9*2)/2,reps:lv?.reps??null,src:'deload'};}
    }else{
      const pr=getProgression(ex.name);
      if(pr&&pr.kg!=null)return{kg:pr.kg,reps:pr.reps,src:'prog'};
    }
  }
  return lv&&(lv.kg!=null||lv.reps!=null)?{kg:lv.kg,reps:lv.reps,src:'prev'}:null;
}
// Tras completar una serie, las siguientes vacías pasan a proponer «otra igual»
function refreshTargets(ei){
  const ex=activeSess?.exercises?.[ei];if(!ex)return;
  ex.sets.forEach((s,si)=>{
    const tg=setTarget(ex,si),k=document.getElementById(`kg_${ei}_${si}`),r=document.getElementById(`rp_${ei}_${si}`);
    if(k)k.placeholder=tg?.kg??'kg';if(r)r.placeholder=tg?.reps??'reps';
  });
}

// ═══ ESFUERZO DE CADA SERIE: RIR o RPE (Perfil → Ajustes del entreno) ═══
// Por dentro siempre se guarda RPE (s.rpe, como la base de datos y los cálculos). Lo que eliges es cómo lo
// ves y lo escribes: la columna, el teclado, la pregunta al terminar la serie y el historial usan lo mismo.
// RIR = repeticiones que te quedaban = 10 − RPE.
function effMode(){return db?.profile?.effortMode==='rpe'?'rpe':'rir';}
function effName(){return effMode()==='rir'?'RIR':'RPE';}
function effShow(rpe){if(rpe==null||rpe===''||!isFinite(+rpe))return '';const v=effMode()==='rir'?10-(+rpe):+rpe;return Math.round(v*10)/10;}
function effParse(v){if(v==null||v==='')return v;v=+v;if(!isFinite(v))return null;return effMode()==='rir'?10-v:v;}
// Lee la casilla (en RIR o RPE) y devuelve RPE · undefined = no hay casilla · null = vacía o fuera de rango
function effVal(el){const v=numVal(el);if(v==null)return v;const r=effParse(v);return PPCore.validRpe(r)?r:null;}
function effBad(el){const v=numVal(el);return v!=null&&!PPCore.validRpe(effParse(v));}
function effTag(rpe){if(rpe==null||rpe===''||!isFinite(+rpe))return '';return effMode()==='rir'?` · RIR ${effShow(rpe)}`:` @${+rpe}`;}
function setEffMode(m){
  // Primero se leen las casillas con la escala de antes; luego se repinta todo con la nueva
  if(activeSess&&typeof collectInputs==='function')collectInputs();
  db.profile=db.profile||{};db.profile.effortMode=m==='rpe'?'rpe':'rir';saveDB();renderEffMode();
  if(activeSess&&typeof renderSessExs==='function')renderSessExs();
  toast(`Esfuerzo en ${effName()}`);
}
function renderEffMode(){
  const el=document.getElementById('eff-mode');if(!el)return;const m=effMode();
  el.innerHTML=`<div class="rm-row" style="margin:0"><button class="rm-btn${m==='rir'?' on':''}" onclick="setEffMode('rir')">RIR · reps en reserva</button><button class="rm-btn${m==='rpe'?' on':''}" onclick="setEffMode('rpe')">RPE · esfuerzo 1–10</button>
    <div class="rm-note">${m==='rir'?'Cuántas repeticiones te quedaban: 0 = fallo, 2 = podías hacer 2 más. ':'Del 1 al 10: 10 = fallo, 8 = te quedaban 2. '}La columna de las series, el teclado, la pregunta al terminar cada serie y el historial usan siempre lo mismo.</div></div>`;
}

// ═══ TECLADO PROPIO ═══
let npEl=null,npFresh=true;
function npStepFor(el){
  if(/^rpe_/.test(el.id))return .5;
  if(/^rp_/.test(el.id))return 1;
  const [,ei]=el.id.split('_');const ex=activeSess?.exercises?.[+ei];
  const eq=(ALL_EX.find(e=>e.name===ex?.name)?.equipment||'').toLowerCase();
  return /mancuerna/.test(eq)?2:/kettlebell|rusa/.test(eq)?4:2.5;
}
function npLabel(el){return /^rpe_/.test(el.id)?(effMode()==='rir'?'RIR · reps en reserva':'RPE'):/^rp_/.test(el.id)?'Repeticiones':'Peso (kg)';}
function npOpen(el){
  if(!NUMPAD||!el)return;
  npEl=el;npFresh=true;el.blur();
  document.getElementById('np-label').textContent=npLabel(el);
  document.getElementById('np-minus').textContent='−'+String(npStepFor(el)).replace('.',',');
  document.getElementById('np-plus').textContent='+'+String(npStepFor(el)).replace('.',',');
  npShow();document.getElementById('ov-numpad').classList.add('on');
}
function npShow(){const v=npEl?.value;document.getElementById('np-val').textContent=(v!==''&&v!=null?String(v):(npEl?.placeholder||'—')).replace('.',',');document.getElementById('np-val').classList.toggle('ph',!(v!==''&&v!=null));}
function npSet(v){if(!npEl)return;npEl.value=v;npEl.dispatchEvent(new Event('input',{bubbles:true}));npShow();}
function npKey(k){
  if(!npEl)return;
  let cur=npFresh?'':String(npEl.value);npFresh=false;
  if(k==='del')cur=cur.slice(0,-1);
  else if(k===','){if(!cur.includes('.'))cur=(cur||'0')+'.';}
  else cur=(cur==='0'?'':cur)+k;
  npEl.value=cur;if(!cur.endsWith('.'))npEl.dispatchEvent(new Event('input',{bubbles:true}));
  document.getElementById('np-val').textContent=cur?cur.replace('.',','):'—';document.getElementById('np-val').classList.remove('ph');
}
function npStep(dir){
  if(!npEl)return;
  const st=npStepFor(npEl),base=parseFloat(npEl.value!==''?npEl.value:npEl.placeholder);
  const ef=/^rpe_/.test(npEl.id),min=ef?(effMode()==='rir'?0:5):0,max=ef?(effMode()==='rir'?5:10):9999;
  const v=isNaN(base)?(dir>0?st:0):Math.round((base+dir*st)/st)*st;
  npSet(Math.min(max,Math.max(min,Math.round(v*100)/100)));npFresh=true; // tras un paso, teclear empieza de cero
}
function npNext(){
  if(!npEl)return;
  const [f,ei,si]=npEl.id.split('_'),order=['kg','rp','rpe'],nx=order[order.indexOf(f)+1];
  const el=nx&&document.getElementById(`${nx}_${ei}_${si}`);
  if(npEl.value.endsWith('.'))npSet(npEl.value.slice(0,-1));
  if(el)npOpen(el);else npClose();
}
function npClose(e){
  if(e&&e.target!==document.getElementById('ov-numpad'))return;
  if(npEl&&String(npEl.value).endsWith('.'))npSet(npEl.value.slice(0,-1));
  document.getElementById('ov-numpad').classList.remove('on');npEl=null;
}

// ═══ PREGUNTA DE RIR AL TERMINAR LA SERIE ═══
let rirTarget=null;
function askRir(ei,si){
  rirTarget={ei,si};
  const ex=activeSess?.exercises?.[ei],el=document.getElementById('rir-ask');if(!el||!ex)return;
  document.getElementById('rir-ask-ex').textContent=`${ex.name} · serie ${si+1}`;
  // Misma escala que la columna: RIR (0 = fallo … 4+) o RPE (10 = fallo … ≤6)
  const rir=effMode()==='rir',q=el.querySelector('.rir-q b'),ch=el.querySelector('.rir-chips');
  if(q)q.textContent=rir?'¿Cuántas te quedaban? (RIR)':'¿Qué RPE? (10 = fallo)';
  if(ch)ch.innerHTML=(rir?[[0,'0','fallo'],[1,'1'],[2,'2'],[3,'3'],[4,'4+']]:[[0,'10','fallo'],[1,'9'],[2,'8'],[3,'7'],[4,'≤6']])
    .map(([r,t,sm])=>`<button onclick="chooseRir(${r})">${t}${sm?`<small>${sm}</small>`:''}</button>`).join('');
  el.setAttribute('aria-label',rir?'Repeticiones en reserva':'Esfuerzo percibido (RPE)');
  el.classList.add('on');
}
function hideRirAsk(){rirTarget=null;document.getElementById('rir-ask')?.classList.remove('on');}
function chooseRir(r){
  if(!rirTarget||!activeSess){hideRirAsk();return;}
  const{ei,si}=rirTarget,s=activeSess.exercises?.[ei]?.sets?.[si];
  if(s){
    s.rpe=10-r;s.effortSrc='logged';
    const el=document.getElementById(`rpe_${ei}_${si}`);if(el){el.value=effShow(s.rpe);el.classList.remove('bad');}
    updateE1RMRow(ei);persistActive();vib(15);
  }
  hideRirAsk();
}

// ═══ PRESUPUESTO DE TIEMPO ═══
// Minutos estimados: 5 de calentamiento/transiciones + por serie ~40 s de trabajo + el descanso de su tipo
function estSessMin(exs,rest,mode){return 5+exs.filter(e=>!e.optional).reduce((a,e)=>a+(e.sets||[]).length*(40+PPCore.exRest(e,rest||90,mode)),0)/60;}
// Si no cabe, los aislamientos (empezando por el final) pasan a opcionales y se mueven al final, en su orden
function planTimeBudget(exs,rest,budget,mode){
  const out=exs.map(e=>({...e,optional:false}));let est=estSessMin(out,rest,mode);const cut=[];
  for(let i=out.length-1;i>=0&&est>budget;i--)if(PPCore.exKind(out[i])==='isolation'){out[i].optional=true;cut.unshift(out[i].name);est=estSessMin(out,rest,mode);}
  return{exs:[...out.filter(e=>!e.optional),...out.filter(e=>e.optional)],estMin:Math.round(est),cut,fits:est<=budget};
}
function renderSessPlan(){
  const el=document.getElementById('sess-plan');if(!el)return;
  if(!activeSess||activeSess.isTmplEdit){el.innerHTML='';return;}
  const parts=[];
  if(activeSess.timeBudget){
    const p=activeSess.timePlan||{};
    parts.push(`⏱ <b>${activeSess.timeBudget} min</b> · plan ~${p.estMin??'—'} min${p.cut?.length?` · al final, si te da tiempo: ${p.cut.map(esc).join(', ')}`:''}${p.estMin>activeSess.timeBudget?' · <span style="color:var(--amber)">no cabe entero: recorta series</span>':''}`);
  }
  const rd=activeSess.readiness;
  if(rd&&rd.score!=null){const a=PPCore.readinessAdvice(rd.score);parts.push(`🔋 Readiness <b>${Math.round(rd.score*100)}</b> · ${a.t}${rd.applied&&a.f<1?' (aplicado)':''}`);}
  const ma=activeSess.muscleAdj;
  if(ma?.length){const by={};ma.forEach(x=>{(by[x.m+'|'+x.st]=by[x.m+'|'+x.st]||[]).push(x);});parts.push('💪 '+Object.values(by).map(g=>`<b>${esc(g[0].m)}</b> con ${PPCore.MUSCLE_ST[g[0].st].t}: ${g.map(x=>esc(x.name)+(x.to<x.from?` ${x.from}→${x.to}`:'')).join(', ')}`).join(' · '));}
  el.innerHTML=parts.length?`<div class="sess-plan">${parts.map(x=>`<div>${x}</div>`).join('')}</div>`:'';
}

// ═══ ANTES DE EMPEZAR: TIEMPO Y CHECK-IN ═══
const PRE_Q=[['energy','Energía',['🪫','😕','😐','🙂','⚡']],['motivation','Motivación',['😒','😕','😐','🙂','🔥']]];
let preSess=null;
// Músculos de la rutina (principales primero, luego secundarios) para marcar cansancio / agujetas / dolor
function preSessMuscles(exs){
  const prim=[],sec=[];
  (exs||[]).forEach(e=>{PPCore.credits(db.profile,e).forEach(({m,w})=>{if(!m)return;(w===1?prim:sec).push(m);});});
  return [...new Set([...prim,...sec])];
}
// src: id de plantilla · o una sesión pasada que se va a repetir ({name, exercises, rest})
function openPreSess(src){
  const t=(src&&typeof src==='object')?null:(db.templates||[]).find(x=>x.id===src);
  const from=t||src;if(!from||!from.exercises)return;
  const day=sessDay(),bt=(db.biometrics||[]).find(b=>b.date===day);
  const q=bt?.subj?.v===2?bt.subj:{},auto=q.sleepH==null?PPCore.sleepBucket(bt?.sleepMin):null;
  // prev: ejercicios con su número de series, para la vista previa de los ajustes por músculo
  const prev=from.exercises.map(e=>({name:e.name,muscle:e.muscle,n:Math.max(1,Array.isArray(e.sets)?e.sets.length:(e.sets||3))}));
  preSess={tid:t?t.id:null,repeat:t?null:from,prev,day,budget:null,apply:true,sleepH:q.sleepH??auto,sleepAuto:auto!=null,energy:q.energy??null,motivation:q.motivation??null,muscles:{...(q.muscles||{})},mlist:preSessMuscles(from.exercises)};
  document.getElementById('presess-title').textContent=from.name||'Entrenamiento';
  renderPreSess();document.getElementById('ov-presess').classList.add('on');
  // Sin el sueño de hoy y con el reloj conectado: se lee Health Connect ya, sin tener que ir a Perfil
  if(!(bt?.sleepMin>0)&&typeof hcPlugin==='function'&&hcPlugin()&&db.profile?.healthConnect)preSessSyncWatch();
}
function preSessSubj(p){
  if(!p)return null;
  const mus=Object.fromEntries(Object.entries(p.muscles||{}).filter(([,v])=>PPCore.MUSCLE_ST[v]));
  if(!(p.sleepH||p.energy||p.motivation||Object.keys(mus).length))return null;
  const q={v:2,sleepH:p.sleepH??null,energy:p.energy??null,motivation:p.motivation??null};
  if(Object.keys(mus).length)q.muscles=mus;
  return q;
}
function preSessReadiness(){
  if(!preSess)return null;
  const subj=preSessSubj(preSess);
  const others=(db.biometrics||[]).filter(b=>b.date!==preSess.day),today=(db.biometrics||[]).find(b=>b.date===preSess.day)||{date:preSess.day};
  const bio=[...others,{...today,subj:subj||today.subj}];
  return PPCore.readinessSeries(bio,preSess.day,preSess.day)[preSess.day];
}
function renderPreSess(){
  if(!preSess)return;
  const chip=(on,txt,js,cls='')=>`<button class="ps-chip${on?' on':''}${cls}" onclick="${js}">${txt}</button>`;
  document.getElementById('presess-time').innerHTML=[45,60,75,90].map(m=>chip(preSess.budget===m,m+' min',`preSessSet('budget',${m})`)).join('')+chip(preSess.budget==null,'Sin límite',`preSessSet('budget',null)`);
  // Sueño: si el reloj ya lo trae no se pregunta (solo se muestra, con opción de corregirlo)
  const bw=(db.biometrics||[]).find(b=>b.date===preSess.day),wMin=bw?.sleepMin>0?bw.sleepMin:null;
  const hcOn=typeof hcPlugin==='function'&&!!hcPlugin()&&!!db.profile?.healthConnect;
  const sleepChips=`<div>${PPCore.SLEEP_OPTS.map((o,i)=>chip(preSess.sleepH===i+1,o,`preSessSet('sleepH',${i+1})`)).join('')}</div>`;
  const sleep=preSess.sleepAuto&&wMin&&!preSess.sleepEdit
    ?`<div class="ps-row ps-sleep ps-sleep-w"><span>Sueño<small>del reloj</small></span><div class="ps-wsleep"><b>⌚ ${Math.floor(wMin/60)} h ${Math.round(wMin%60)} min</b><button class="ps-link" onclick="preSess.sleepEdit=true;renderPreSess()">cambiar</button></div></div>`
    :`<div class="ps-row ps-sleep"><span>Sueño${preSess.sleepAuto&&preSess.sleepH?'<small>del reloj</small>':''}</span>${sleepChips}</div>`
     +(hcOn&&!wMin&&preSess.sleepH==null?`<div class="ps-nosleep">${preSessSyncing?'Leyendo el reloj…':`El reloj aún no tiene el sueño de esta noche (Mi Fitness puede tardar en pasarlo a Health Connect).${lastSleepTxt()} <button class="ps-link" onclick="preSessSyncWatch()">Sincronizar</button>`}</div>`:'');
  const rows=PRE_Q.map(([k,l,em])=>`<div class="ps-row"><span>${l}</span><div>${em.map((e,i)=>chip(preSess[k]===i+1,e,`preSessSet('${k}',${i+1})`)).join('')}</div></div>`).join('');
  const mus=preSess.mlist.length?`<div class="ps-lbl">¿Tienes cansancio muscular? <small>toca: cansado → agujetas → dolor</small></div><div class="ps-chips ps-mus">${preSess.mlist.map(m=>{const st=preSess.muscles[m];return `<button class="ps-chip${st?' st-'+st:''}" data-m="${esc(m)}" onclick="preSessMus(this.dataset.m)">${esc(m)}${st?` · ${PPCore.MUSCLE_ST[st].t}`:''}</button>`;}).join('')}</div>`:'';
  document.getElementById('presess-q').innerHTML=sleep+rows+mus;
  const bt=(db.biometrics||[]).find(b=>b.date===preSess.day);
  const watch=bt&&(bt.sleepMin||bt.rhr||bt.hrv)?`⌚ ${bt.sleepMin?`${Math.floor(bt.sleepMin/60)} h ${Math.round(bt.sleepMin%60)} min de sueño`:''}${bt.rhr?` · ${Math.round(bt.rhr)} lpm en reposo`:''}${bt.hrv?` · HRV ${Math.round(bt.hrv)} ms`:''}`:'';
  const R=preSessReadiness(),a=PPCore.readinessAdvice(R);
  // vista previa de los ajustes por músculo
  const sim=PPCore.muscleAdjust(preSess.prev.map(e=>({name:e.name,muscle:e.muscle,sets:Array.from({length:e.n})})),preSess.muscles);
  const madj=sim.length?`<div class="ps-madj">${sim.map(x=>`<div><b>${esc(x.name)}</b> · ${x.st==='doms'&&x.to<x.from?`${x.from} → ${x.to} series, sin fallo`:x.st==='doms'?'sin ir al fallo':x.st==='fatigue'?'1 repetición más en reserva':'cámbialo o sáltalo'} <span>(${esc(x.m)}: ${PPCore.MUSCLE_ST[x.st].t})</span></div>`).join('')}</div>`:'';
  document.getElementById('presess-ready').innerHTML=(watch?`<div class="ps-watch">${watch}</div>`:'')+madj+(a?`<div class="ps-advice" style="border-color:${a.f===1?'var(--green)':a.f>=.8?'var(--amber)':'var(--red)'}"><b>Readiness ${Math.round(R*100)}</b> · ${a.t}${a.f<1?`<label><input type="checkbox" ${preSess.apply?'checked':''} onchange="preSess.apply=this.checked"> Aplicar</label>`:''}</div>`:'<div class="ps-watch">Responde el check-in para ajustar la carga de hoy.</div>');
}
// Sueño del reloj: al abrir la hoja (o al tocar «Sincronizar») se lee Health Connect si aún no está el de hoy,
// y al llegar se rellena solo (si no lo has marcado tú a mano)
let preSessSyncing=false;
// El último sueño que sí llegó: si es de hace días, el problema está entre el reloj, Mi Fitness y Health Connect
function lastSleepTxt(){
  const b=(db.biometrics||[]).filter(x=>x.sleepMin>0).sort((x,y)=>y.date.localeCompare(x.date))[0];
  if(!b)return ' Todavía no ha llegado ningún sueño: revisa en Health Connect que Mi Fitness tenga permiso para escribir «Sueño».';
  const[y,m,d]=b.date.split('-');return ` El último que llegó es el del ${+d}/${+m} (${Math.floor(b.sleepMin/60)} h ${b.sleepMin%60} min).`;
}
function preSessFillWatch(){
  if(!preSess)return;
  const bt=(db.biometrics||[]).find(b=>b.date===preSess.day),auto=PPCore.sleepBucket(bt?.sleepMin);
  if(auto!=null&&(preSess.sleepH==null||preSess.sleepAuto)){preSess.sleepH=auto;preSess.sleepAuto=true;}
}
async function preSessSyncWatch(){
  if(preSessSyncing||typeof hcSync!=='function')return;
  preSessSyncing=true;if(preSess)renderPreSess();
  try{await hcSync(false,true);}finally{preSessSyncing=false;}
  if(preSess){preSessFillWatch();renderPreSess();}
}
function preSessSet(k,v){if(!preSess)return;preSess[k]=preSess[k]===v&&k!=='budget'?null:v;if(k==='sleepH')preSess.sleepAuto=false;renderPreSess();}
function preSessMus(m){
  if(!preSess)return;const C=PPCore.MUSCLE_ST_CYCLE,i=C.indexOf(preSess.muscles[m]??null),nx=C[(i+1)%C.length];
  if(nx)preSess.muscles[m]=nx;else delete preSess.muscles[m];
  renderPreSess();
}
function closePreSess(e){if(e&&e.target!==document.getElementById('ov-presess'))return;document.getElementById('ov-presess').classList.remove('on');preSess=null;}
function preSessGo(skip){
  const p=preSess;if(!p)return;
  document.getElementById('ov-presess').classList.remove('on');preSess=null;
  if(skip){preSessStart(p,{});return;}
  const subj=preSessSubj(p);
  if(subj&&p.day===todayStr())saveCheckin(p.day,subj);
  preSess=p;const R=preSessReadiness();preSess=null;
  const a=PPCore.readinessAdvice(R),applied=!!(a&&a.f<1&&p.apply);
  preSessStart(p,{timeBudget:p.budget,loadFactor:applied?a.f:1,muscles:subj?.muscles||null,readiness:R!=null?{score:Math.round(R*1000)/1000,rec:a.key,applied,subj}:null});
}
function preSessStart(p,opt){p.tid?startFromTmplNow(p.tid,opt):startRepeatNow(p.repeat,opt);}
// Guarda el check-in del día con la biometría (alimenta la readiness del IHO)
function saveCheckin(day,subj){
  db.biometrics=db.biometrics||[];
  let b=db.biometrics.find(x=>x.date===day);
  if(!b){b={date:day};db.biometrics.push(b);}
  b.subj=subj;
  if(typeof saveBiometricRemote==='function')saveBiometricRemote(b);else saveDB();
}
