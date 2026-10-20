// meso.js — Mesociclos: configuración, semana actual, series/RIR objetivo y semana de descarga.
// El cálculo (qué semana es, qué RIR toca, cuántas series) vive en js/core.js.
// La configuración se guarda como historial en db.profile.mesoLog (sincronizado en profiles.settings):
// cada cambio añade una entrada desde hoy, así las semanas pasadas no cambian de clasificación.
function mesoNow(ds){return PPCore.mesoWeekAt(db.profile,ds||todayStr());}
function mesoLastCfg(){const l=db.profile?.mesoLog||[];return l.length?l[l.length-1]:null;}
function mesoSet(patch){
  db.profile=db.profile||{};
  const log=db.profile.mesoLog=db.profile.mesoLog||[];
  const t=todayStr(),prev=mesoLastCfg()||{start:PPCore.mondayOf(t),weeks:5,deload:true,progress:true,on:false};
  const e={...prev,...patch,from:t};
  if(log.length&&log[log.length-1].from===t)log[log.length-1]=e;else log.push(e); // varios cambios el mismo día: vale el último
  saveDB();renderMesoCard();
}
function mesoToggle(){
  if(PPCore.mesoCfgAt(db.profile,todayStr()))mesoSet({on:false});
  else{mesoSet({on:true,start:PPCore.mondayOf(todayStr())});toast('Mesociclo activado: semana 1');}
}
function mesoRestart(){mesoSet({on:true,start:PPCore.mondayOf(todayStr())});toast('Mesociclo reiniciado: semana 1');}
async function mesoDeloadNow(){
  const w=mesoLastCfg()?.weeks||5;
  if(!await dlgConfirm('¿Convertir esta semana en semana de descarga? El mesociclo volverá a empezar la semana que viene.'))return;
  mesoSet({on:true,deload:true,start:addDays(PPCore.mondayOf(todayStr()),-(w-1)*7)});
  toast('Semana de descarga activada');
}
function renderMesoCard(){
  const el=document.getElementById('meso-card');if(!el)return;
  const wk=mesoNow(),last=mesoLastCfg(),on=!!wk;
  const weeks=last?.weeks||5,dl=last?last.deload!==false:true,pr=last?last.progress!==false:true;
  let h=`<div class="card-title">Mesociclo <span>${on?(wk.deload?'semana de descarga':`semana ${wk.idx} de ${wk.weeks}`):'desactivado'}</span></div>`;
  h+=`<div class="meso-row"><span>Planificar por mesociclos</span><button class="toggle${on?' on':''}" onclick="mesoToggle()" aria-label="Activar mesociclos"></button></div>`;
  if(on){
    const cfg=PPCore.mesoCfgAt(db.profile,todayStr());
    h+=`<div class="meso-tl">${[...Array(wk.weeks)].map((_,i)=>{const w=PPCore.mesoWeekFromCfg(cfg,addDays(wk.monday,(i+1-wk.idx)*7));
      return `<div class="meso-w${i+1===wk.idx?' cur':''}${i+1<wk.idx?' past':''}${w.deload?' dl':''}"><b>${w.deload?'D':i+1}</b><small>${w.deload?'descarga':`RIR ${w.rir}`}</small></div>`;}).join('')}</div>`;
    h+=`<div class="meso-now">${wk.deload?'Esta semana: <b>descarga</b> · mitad de series, RPE ≤6 y ~10% menos peso.'
      :`Esta semana: <b>RIR ${wk.rir}</b> (RPE ${wk.rpe}) en las series de trabajo${wk.progress&&wk.idx>1?` · +${wk.idx-1} serie${wk.idx>2?'s':''} en el primer ejercicio de cada músculo`:''}.`}</div>`;
    h+=`<div class="meso-row"><span>Duración <small>incluida la descarga</small></span><div class="meso-seg">${[4,5,6,7].map(n=>`<button class="${n===weeks?'on':''}" onclick="mesoSet({weeks:${n}})">${n}</button>`).join('')}</div></div>`;
    h+=`<div class="meso-row"><span>Semana de descarga al final</span><button class="toggle${dl?' on':''}" onclick="mesoSet({deload:${!dl}})" aria-label="Descarga"></button></div>`;
    h+=`<div class="meso-row"><span>Subir 1 serie por semana <small>con tope en tu MRV</small></span><button class="toggle${pr?' on':''}" onclick="mesoSet({progress:${!pr}})" aria-label="Progresión de series"></button></div>`;
    h+=`<div class="meso-btns"><button onclick="mesoRestart()">Empezar de nuevo</button>${dl&&!wk.deload?'<button onclick="mesoDeloadNow()">Descargar esta semana</button>':''}</div>`;
  }else h+=`<div class="meso-off">Bloques de ${weeks} semanas: el esfuerzo sube cada semana (RIR 3 → 0), las series aumentan poco a poco y la última semana es de descarga. Las series de tus rutinas se ajustan solas al iniciarlas.</div>`;
  el.innerHTML=h;
}
// Chip de la portada y aviso en la sesión
function mesoChipHtml(ds){
  const wk=mesoNow(ds);if(!wk)return'';
  return wk.deload?'<em class="meso-chip dl">Semana de descarga</em>':`<em class="meso-chip">Semana ${wk.idx}/${wk.weeks} · RPE ${wk.rpe}</em>`;
}
function renderSessMeso(){
  const el=document.getElementById('sess-meso');if(!el)return;
  const wk=(activeSess&&!activeSess.isTmplEdit)?mesoNow(activeSess.date):null;
  el.innerHTML=!wk?'':wk.deload
    ?'<div class="meso-banner dl"><b>Semana de descarga</b><span>Mitad de series · RPE ≤6 · ~10% menos peso</span></div>'
    :`<div class="meso-banner"><b>Semana ${wk.idx} de ${wk.weeks}</b><span>Objetivo: RIR ${wk.rir} (RPE ${wk.rpe}) en las series de trabajo</span></div>`;
}
function deloadHintHtml(ex){
  const ws=(getLastEx(ex.name)?.sets||[]).filter(s=>s.kg>0&&(s.type||'normal')!=='warmup');
  const top=ws.length?Math.max(...ws.map(s=>s.kg)):null;
  return `<div class="prog-hint hold" style="cursor:default">↓ Descarga: ${top?`~${Math.round(top*.9*2)/2} kg · `:''}deja 4 reps en recámara (RPE ≤6)</div>`;
}
