// activity.js — Actividad (NEAT/GET), gasto en el gimnasio, modales de edición, diálogos y tipos de serie.
// ═══ ACTIVITY ═══
let neatView='daily', getView='daily';
let neatChart=null, getChart2=null;

async function saveSteps(){
  const steps=parseInt(document.getElementById('neat-steps').value);
  const date=document.getElementById('neat-date').value;
  if(!steps||!date){toast('Introduce pasos y fecha');return;}
  db.steps=db.steps||[];
  const idx=db.steps.findIndex(s=>s.date===date);
  if(idx>=0)db.steps[idx].steps=steps;else db.steps.push({date,steps});
  db.steps.sort((a,b)=>a.date.localeCompare(b.date));
  await saveStepsRemote(date,steps);renderNeatChart();toast('Pasos guardados ✓');
  document.getElementById('neat-steps').value='';
}

function setNeatView(v){
  neatView=v;
  document.getElementById('neat-view-daily').className='mf'+(v==='daily'?' on':'');
  document.getElementById('neat-view-weekly').className='mf'+(v==='weekly'?' on':'');
  renderNeatChart();
}
function setGetView(v){
  getView=v;
  document.getElementById('get-view-daily').className='mf'+(v==='daily'?' on':'');
  document.getElementById('get-view-weekly').className='mf'+(v==='weekly'?' on':'');
  renderGetChart();
}

// Get weight closest to (and not after) a date
function getWeightForDate(dateStr){
  // Sort explicitly: db.weights order depends on insertion/edits, not date
  const weights=(db.weights||[]).filter(w=>w.date<=dateStr).sort((a,b)=>a.date.localeCompare(b.date));
  if(!weights.length) return db.profile?.height?(db.profile.height-100):70; // fallback
  return weights[weights.length-1].kg;
}

// kcal burned walking: use Pandolf formula simplified
// kcal ≈ steps × (0.04 × weight_kg) / 1000 × ... 
// Simpler: 4km/h, ~0.8 * weight_kg * distance_km
// steps × 0.75m/step ≈ distance_km
function stepsToKcal(steps, weightKg, heightCm){
  // Stride ≈ 0.415 × height (walking); falls back to 0.75 m if no height set
  const strideM = heightCm ? heightCm*0.00415 : 0.75;
  const distKm = steps * strideM / 1000;
  // NET kcal: (MET − 1) so resting burn isn't double-counted against TMB.
  // MET 3.0 for ~4 km/h; time_h = dist/speed
  const kcal = (3.0 - 1) * weightKg * (distKm / 4);
  return Math.round(kcal);
}

// Harris-Benedict TMB
function calcTMB(dateStr){
  const sex=db.profile?.sex||'male';
  const age=db.profile?.age||30;
  const height=db.profile?.height||175;
  const weight=getWeightForDate(dateStr);
  let tmb;
  if(sex==='male') tmb=88.362+(13.397*weight)+(4.799*height)-(5.677*age);
  else tmb=447.593+(9.247*weight)+(3.098*height)-(4.330*age);
  return Math.round(tmb);
}

// ═══ GYM KCAL — DURATION-BASED NET MET MODEL ═══
// Replaces the Lambert et al. regression, which had no duration term (derived
// from a fixed lab protocol) and priced extra volume at ~2.5 kcal/tonne — hence
// whole sessions reading ~150 kcal. New model:
//   kcal = (MET − 1) × weight × hours       ← NET of BMR, consistent with NEAT
// Base MET 3.5 (Compendium: resistance training, multiple exercises, 8–15 reps),
// modulated by the muscle mass engaged (the "normalized intensity by muscle
// trained" idea), work density (sets/min captures short-rest metabolic work),
// and mean session RPE. Clamped to the physiological 2.5–6.0 MET band.
// If the user logged the watch's kcal for the session (kcalWatch), it wins as-is.
const MET_LOWER=new Set(['Cuádriceps','Isquiosurales','Glúteos','Gemelo/Sóleo','Aductores','Abductores']);
const MET_BIG_UPPER=new Set(['Espalda','Pectoral']);
function sessionMET(s){
  let sets=0,lower=0,big=0,rs=0,rc=0;
  (s.exercises||[]).forEach(ex=>{
    const n=(ex.sets||[]).filter(st=>(st.kg||st.reps)&&(st.type||'normal')!=='warmup').length;
    if(!n)return;
    sets+=n;
    const m=normMuscle(ex.muscle||'');
    if(MET_LOWER.has(m))lower+=n;else if(MET_BIG_UPPER.has(m))big+=n;
    (ex.sets||[]).forEach(st=>{if(st.rpe){rs+=st.rpe;rc++;}});
  });
  if(!sets)return null;
  let met=3.5;
  met+=1.0*(lower/sets)+0.4*(big/sets);                    // muscle mass engaged
  const dur=s.durationMin||estimateSessDuration(s);
  if(dur){const dens=sets/dur;met+=Math.max(-0.5,Math.min(0.7,(dens-0.30)*4));} // vs ~0.30 sets/min typical
  if(rc)met+=Math.max(-0.4,Math.min(0.6,(rs/rc-7.5)*0.3)); // effort
  return Math.min(6,Math.max(2.5,met));
}
// Legacy sessions (pre-migration) have no stored duration: ~3 min per working
// set (set + rest) + 10 min overhead, capped at 150 min.
function estimateSessDuration(s){
  let sets=0;
  (s.exercises||[]).forEach(ex=>{sets+=(ex.sets||[]).filter(st=>(st.kg||st.reps)&&(st.type||'normal')!=='warmup').length;});
  return sets?Math.min(150,10+sets*3):0;
}
// "⏱ 83 min · 🔥 412 kcal ⌚" — shared by session detail and the calendar day panel
function sessMetaTag(sess){
  const durMin=sess.durationMin||estimateSessDuration(sess);
  const wt=getWeightForDate(sess.date);
  const met=sessionMET(sess);
  const kcal=sess.kcalWatch??((met&&durMin)?Math.round((met-1)*wt*(durMin/60)):null);
  const parts=[];
  if(durMin)parts.push(`⏱ ${durMin} min${sess.durationMin?'':' (est.)'}`);
  if(kcal)parts.push(`🔥 ${kcal} kcal ${sess.kcalWatch?'⌚':'~'}`);
  return parts.join(' · ');
}
function gymKcalForDate(dateStr){
  const sessions=(db.sessions||[]).filter(s=>s.date===dateStr);
  if(!sessions.length) return 0;
  const weight=getWeightForDate(dateStr);
  let total=0;
  sessions.forEach(s=>{
    if(s.kcalWatch){total+=s.kcalWatch;return;} // watch value overrides the model
    const met=sessionMET(s);
    if(met==null)return;
    const durMin=s.durationMin||estimateSessDuration(s);
    if(!durMin)return;
    total+=(met-1)*weight*(durMin/60);
  });
  return Math.round(total);
}

function renderActivityScr(){
  const nd=document.getElementById('neat-date');
  if(!nd.value)nd.value=todayStr();
  renderNeatChart();
  renderGetChart();
}

function renderNeatChart(){
  const steps=[...(db.steps||[])].sort((a,b)=>a.date.localeCompare(b.date));
  if(!steps.length){if(neatChart){neatChart.destroy();neatChart=null;}return;}
  let labels,data,kcalData;
  if(neatView==='daily'){
    // Last 7 days
    const days=[];
    for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(isoDate(d));}
    labels=days.map(d=>fmtDate(d));
    data=days.map(d=>{const s=steps.find(s=>s.date===d);return s?s.steps:0;});
    kcalData=days.map((d,i)=>{
      const w=getWeightForDate(d);const h2=db.profile?.height||175;
      return data[i]?stepsToKcal(data[i],w,h2):0;
    });
  } else {
    // Last 4 weeks avg steps/day
    const weeks=[];
    for(let i=3;i>=0;i--){
      const end=new Date();end.setDate(end.getDate()-i*7);
      const start=new Date(end);start.setDate(start.getDate()-6);
      const wLabel='S'+getWk(end);
      const weekSteps=steps.filter(s=>s.date>=isoDate(start)&&s.date<=isoDate(end));
      const avg=weekSteps.length?Math.round(weekSteps.reduce((a,b)=>a+b.steps,0)/weekSteps.length):0;
      weeks.push({label:wLabel,avg});
    }
    labels=weeks.map(w=>w.label);
    data=weeks.map(w=>w.avg);
    kcalData=weeks.map((w,i)=>{
      const refDate=new Date();refDate.setDate(refDate.getDate()-i*7);
      const ds=isoDate(refDate);
      const wt=getWeightForDate(ds);const h2=db.profile?.height||175;
      return w.avg?stepsToKcal(w.avg,wt,h2):0;
    });
  }
  if(neatChart){neatChart.destroy();neatChart=null;}
  neatChart=new Chart(document.getElementById('neatChart'),{
    type:'bar',
    data:{labels,datasets:[{label:'Pasos',data,backgroundColor:'rgba(52,211,153,0.7)',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{
        backgroundColor:'rgba(20,20,20,.95)',titleColor:'#f0f0f0',bodyColor:'#888',
        borderColor:'#2a2a2a',borderWidth:1,padding:10,
        callbacks:{
          label:(item)=>{
            const idx=item.dataIndex;
            const s=data[idx];const k=kcalData[idx];
            return[`Pasos: ${s.toLocaleString()}`,k?`Kcal: ~${k}`:''];
          }
        }
      }},
      scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:10,family:'DM Mono'}}},
              x:{grid:{display:false},ticks:{color:'#555',font:{size:10,family:'DM Mono'}}}}}
  });
}

function renderGetChart(){
  // Build day or week data
  const today=new Date();
  let dateRange=[];
  if(getView==='daily'){
    for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);dateRange.push(isoDate(d));}
  } else {
    for(let i=3;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i*7);dateRange.push(isoDate(d));}
  }

  const tmbArr=[], neatArr=[], gymArr=[], othersArr=[], labels=[];
  dateRange.forEach(dateStr=>{
    const tmb=calcTMB(dateStr);
    const stepRec=(db.steps||[]).find(s=>s.date===dateStr);
    const wt=getWeightForDate(dateStr);const h2=db.profile?.height||175;
    const neatKcal=stepRec?stepsToKcal(stepRec.steps,wt,h2):0;
    const gymKcal=gymKcalForDate(dateStr);
    const others=Math.round(tmb*0.10); // ETA ~10% TMB
    tmbArr.push(tmb);
    neatArr.push(neatKcal);
    gymArr.push(gymKcal);
    othersArr.push(others);
    labels.push(getView==='daily'?fmtDate(dateStr):'S'+getWk(new Date(dateStr)));
  });

  // If weekly, average each component
  const finalTMB=tmbArr, finalNEAT=neatArr, finalGym=gymArr, finalOthers=othersArr;

  if(getChart2){getChart2.destroy();getChart2=null;}
  getChart2=new Chart(document.getElementById('getChart'),{
    type:'bar',
    data:{labels,datasets:[
      {label:'TMB',data:finalTMB,backgroundColor:'rgba(79,142,247,0.85)',borderRadius:0},
      {label:'NEAT',data:finalNEAT,backgroundColor:'rgba(52,211,153,0.85)',borderRadius:0},
      {label:'Gym',data:finalGym,backgroundColor:'rgba(244,114,182,0.85)',borderRadius:0},
      {label:'Otros (ETA)',data:finalOthers,backgroundColor:'rgba(251,191,36,0.85)',borderRadius:4},
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{
        mode:'index',intersect:false,
        backgroundColor:'rgba(20,20,20,.95)',titleColor:'#f0f0f0',bodyColor:'#888',
        borderColor:'#2a2a2a',borderWidth:1,padding:10,
        callbacks:{
          afterBody:(items)=>{
            const total=items.reduce((a,i)=>a+i.raw,0);
            return[`─────────`,`Total GET: ${total.toLocaleString()} kcal`];
          }
        }
      }},
      scales:{
        x:{stacked:true,grid:{display:false},ticks:{color:'#555',font:{size:10,family:'DM Mono'}}},
        y:{stacked:true,grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:10,family:'DM Mono'},callback:v=>v>=1000?Math.round(v/100)/10+'k':v}}
      }}
  });

  // Summary stats
  const avgGet=Math.round((finalTMB.reduce((a,b)=>a+b,0)+finalNEAT.reduce((a,b)=>a+b,0)+finalGym.reduce((a,b)=>a+b,0)+finalOthers.reduce((a,b)=>a+b,0))/dateRange.length);
  const avgTMB=Math.round(finalTMB.reduce((a,b)=>a+b,0)/finalTMB.length);
  document.getElementById('get-stats').innerHTML=`
    <div class="sc"><div class="sc-label">GET MEDIO</div><div class="sc-val">${avgGet}</div><div class="sc-sub">kcal/día</div></div>
    <div class="sc"><div class="sc-label">TMB MEDIO</div><div class="sc-val">${avgTMB}</div><div class="sc-sub">kcal/día</div></div>`;
}

// ═══ EDIT MODALS ═══
function openNeatEdit(){
  const steps=(db.steps||[]).slice().reverse();
  const list=document.getElementById('neat-edit-list');
  if(!steps.length){list.innerHTML='<div class="empty">Sin registros</div>';document.getElementById('ov-neat-edit').classList.add('on');return;}
  list.innerHTML=steps.map(s=>`
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b1)">
      <span style="flex:1;font-size:12px;font-family:var(--mono)">${fmtFull(s.date)}</span>
      <span style="font-size:13px;font-weight:500;font-family:var(--mono)">${s.steps.toLocaleString()} pasos</span>
      <button onclick="editNeatEntry('${s.date}')" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;font-family:var(--font);padding:2px 6px">Editar</button>
      <button onclick="deleteNeatEntry('${s.date}')" style="background:none;border:none;color:var(--red);font-size:11px;cursor:pointer;font-family:var(--font);padding:2px 6px">×</button>
    </div>`).join('');
  document.getElementById('ov-neat-edit').classList.add('on');
}
function closeNeatEdit(e){if(!e||e.target===document.getElementById('ov-neat-edit'))document.getElementById('ov-neat-edit').classList.remove('on');}
async function editNeatEntry(date){
  const entry=(db.steps||[]).find(s=>s.date===date);if(!entry)return;
  const v=await dlgPrompt(`Editar pasos (${fmtFull(date)}):`,String(entry.steps));
  if(v===null)return;const n=parseInt(v);
  if(isNaN(n)||n<0){toast('Valor no válido');return;}
  entry.steps=n;await saveStepsRemote(date,n);openNeatEdit();renderNeatChart();toast('Actualizado ✓');
}
async function deleteNeatEntry(date){
  if(!await dlgConfirm(`¿Eliminar registro del ${fmtFull(date)}?`))return;
  db.steps=(db.steps||[]).filter(s=>s.date!==date);
  await deleteStepsRemote(date);openNeatEdit();renderNeatChart();toast('Eliminado');
}

function openWeightEdit(){
  const weights=(db.weights||[]).slice().reverse();
  const list=document.getElementById('weight-edit-list');
  if(!weights.length){list.innerHTML='<div class="empty">Sin registros</div>';document.getElementById('ov-weight-edit').classList.add('on');return;}
  list.innerHTML=weights.map(w=>`
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b1)">
      <span style="flex:1;font-size:12px;font-family:var(--mono)">${fmtFull(w.date)}</span>
      <span style="font-size:13px;font-weight:500;font-family:var(--mono)">${w.kg} kg</span>
      <button onclick="editWeightEntry('${w.date}')" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;font-family:var(--font);padding:2px 6px">Editar</button>
      <button onclick="deleteWeightEntry('${w.date}')" style="background:none;border:none;color:var(--red);font-size:11px;cursor:pointer;font-family:var(--font);padding:2px 6px">×</button>
    </div>`).join('');
  document.getElementById('ov-weight-edit').classList.add('on');
}
function closeWeightEdit(e){if(!e||e.target===document.getElementById('ov-weight-edit'))document.getElementById('ov-weight-edit').classList.remove('on');}

// Override existing editWeightEntry to also refresh modal
async function editWeightEntry(date){
  const e=(db.weights||[]).find(w=>w.date===date);if(!e)return;
  const v=await dlgPrompt(`Editar peso (${fmtFull(date)}):`,String(e.kg));
  if(v===null)return;const n=parseFloat(v);
  if(isNaN(n)||n<=0){toast('Valor no válido');return;}
  e.kg=n;await saveWeightRemote(n,date);
  if(document.getElementById('ov-weight-edit').classList.contains('on'))openWeightEdit();
  renderWeightChart();renderProfileScr();toast('Actualizado ✓');
}
async function deleteWeightEntry(date){
  if(!await dlgConfirm(`¿Eliminar entrada del ${fmtFull(date)}?`))return;
  db.weights=(db.weights||[]).filter(w=>w.date!==date);
  await deleteWeightRemote(date);
  if(document.getElementById('ov-weight-edit').classList.contains('on'))openWeightEdit();
  renderWeightChart();renderProfileScr();toast('Eliminado');
}

function openMeasuresEdit(){
  const measures=(db.measures||[]).slice().reverse();
  const list=document.getElementById('measures-edit-list');
  if(!measures.length){list.innerHTML='<div class="empty">Sin registros</div>';document.getElementById('ov-measures-edit').classList.add('on');return;}
  list.innerHTML=measures.map((m,i)=>{
    const periStr=PERI_FIELDS.filter(f=>m[f]).map(f=>`${PERI_LABELS[f]}: ${m[f]}`).join(' · ');
    const bfStr=m.bf!=null?` · BF: ${m.bf}%`:'';
    const displayDate=m.date?fmtFull(m.date):m.week;
    return `<div style="padding:10px 0;border-bottom:1px solid var(--b1)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="flex:1;font-size:12px;font-weight:500;font-family:var(--mono)">${displayDate}</span>
        <button onclick="deleteMeasureEntry('${m.week}')" style="background:none;border:none;color:var(--red);font-size:11px;cursor:pointer;font-family:var(--font)">Eliminar</button>
      </div>
      <div style="font-size:11px;color:var(--t2);font-family:var(--mono)">${periStr}${bfStr}</div>
    </div>`;
  }).join('');
  document.getElementById('ov-measures-edit').classList.add('on');
}
function closeMeasuresEdit(e){if(!e||e.target===document.getElementById('ov-measures-edit'))document.getElementById('ov-measures-edit').classList.remove('on');}
async function deleteMeasureEntry(week){
  if(!await dlgConfirm('¿Eliminar este registro de medidas?'))return;
  db.measures=(db.measures||[]).filter(m=>m.week!==week);
  await deleteMeasureRemote(week);openMeasuresEdit();renderMeasuresHistory();renderBFChart();renderProfileScr();toast('Eliminado');
}

// ═══ PERÍMETROS CHART ═══
let periChart=null, periFilter='brazo';
function setPeriFilter(field){
  periFilter=field;
  document.querySelectorAll('[id^="pf-"]').forEach(el=>{
    el.className='mf'+(el.id==='pf-'+field?' on':'');
  });
  renderPeriChart();
}
function renderPeriChart(){
  const measures=(db.measures||[]).filter(m=>m[periFilter]!=null).sort((a,b)=>(a.date||a.week).localeCompare(b.date||b.week));
  const canvasEl=document.getElementById('periChart');
  if(!canvasEl) return;
  if(!measures.length){if(periChart){periChart.destroy();periChart=null;}return;}
  const labels=measures.map(m=>m.date?fmtFull(m.date):m.week);
  const data=measures.map(m=>m[periFilter]);
  const colors={'brazo':'#4f8ef7','cintura':'#f87171','pectoral-p':'#34d399','cadera':'#fb923c','cuadriceps':'#4ade80','ombligo':'#fbbf24','cuello':'#a78bfa'};
  const color=colors[periFilter]||'#4f8ef7';
  if(periChart){periChart.destroy();periChart=null;}
  periChart=new Chart(canvasEl,{type:'line',data:{labels,datasets:[{
    label:PERI_LABELS[periFilter]||periFilter,data,
    borderColor:color,backgroundColor:color.replace(')',',0.1)').replace('rgb','rgba')||'rgba(79,142,247,0.08)',
    borderWidth:2,pointRadius:4,pointBackgroundColor:color,fill:true,tension:.3
  }]},options:{responsive:true,maintainAspectRatio:false,
    interaction:{mode:'nearest',intersect:false},
    plugins:{legend:{display:false},tooltip:{
      backgroundColor:'rgba(20,20,20,.95)',titleColor:'#f0f0f0',bodyColor:'#888',
      borderColor:'#2a2a2a',borderWidth:1,padding:10
    }},
    scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:10,family:'DM Mono'},callback:v=>v+' cm'}},
            x:{grid:{display:false},ticks:{color:'#555',font:{size:10,family:'DM Mono'},maxRotation:45,autoSkip:true,maxTicksLimit:6}}}
  }});
}

// Separate save for BF/composition (doesn't touch perimeter inputs)
async function saveBFMeasures(){
  const dateStr=document.getElementById('measure-date')?.value||todayStr();
  const wk=getWeekLabel(dateStr);
  let entry=(db.measures||[]).find(m=>m.week===wk)||{week:wk,date:dateStr};
  let bf=null;
  if(measureTab==='jp3'){const v=calcJP3();if(v){entry.jp3=[1,2,3].map(i=>+document.getElementById('jp3-p'+i).value);entry.bf=v;bf=v;}}
  else if(measureTab==='jp4'){const v=calcJP4();if(v){entry.jp4=[1,2,3,4].map(i=>+document.getElementById('jp4-p'+i).value);entry.bf=v;bf=v;}}
  else if(measureTab==='jp7'){const v=calcJP7();if(v){entry.jp7=[1,2,3,4,5,6,7].map(i=>+document.getElementById('jp7-p'+i).value);entry.bf=v;bf=v;}}
  if(!bf){toast('Introduce los pliegues para calcular');return;}
  db.measures=db.measures||[];
  const idx=db.measures.findIndex(m=>m.week===wk);
  if(idx>=0)db.measures[idx]={...db.measures[idx],...entry};else db.measures.push(entry);
  db.measures.sort((a,b)=>a.week.localeCompare(b.week));
  await saveMeasureRemote(entry);renderBFChart();
  document.getElementById('stat-bodyfat').textContent=bf+'%';
  toast('Composición guardada ✓');
}

// ═══ CUSTOM DIALOGS (no browser chrome) ═══
function dlgConfirm(msg){
  return new Promise(resolve=>{
    const ov=document.getElementById('dlg-overlay');
    document.getElementById('dlg-msg').textContent=msg;
    document.getElementById('dlg-input').style.display='none';
    document.getElementById('dlg-cancel').style.display='block';
    document.getElementById('dlg-ok').textContent='Aceptar';
    document.getElementById('dlg-ok').style.background='var(--blue)';
    ov.style.display='flex';
    const ok=document.getElementById('dlg-ok');
    const cancel=document.getElementById('dlg-cancel');
    function cleanup(){ov.style.display='none';ok.onclick=null;cancel.onclick=null;}
    ok.onclick=()=>{cleanup();resolve(true);};
    cancel.onclick=()=>{cleanup();resolve(false);};
  });
}
function dlgPrompt(msg, defaultVal=''){
  return new Promise(resolve=>{
    const ov=document.getElementById('dlg-overlay');
    document.getElementById('dlg-msg').textContent=msg;
    const inp=document.getElementById('dlg-input');
    inp.value=defaultVal;inp.style.display='block';
    document.getElementById('dlg-cancel').style.display='block';
    document.getElementById('dlg-ok').textContent='Aceptar';
    document.getElementById('dlg-ok').style.background='var(--blue)';
    ov.style.display='flex';
    setTimeout(()=>inp.focus(),100);
    const ok=document.getElementById('dlg-ok');
    const cancel=document.getElementById('dlg-cancel');
    function cleanup(){ov.style.display='none';ok.onclick=null;cancel.onclick=null;inp.onkeydown=null;}
    ok.onclick=()=>{cleanup();resolve(inp.value);};
    cancel.onclick=()=>{cleanup();resolve(null);};
    inp.onkeydown=(e)=>{if(e.key==='Enter'){cleanup();resolve(inp.value);}};
  });
}

// ═══ SET TYPE MODAL ═══
const SET_TYPES=[
  {id:'normal',   label:'Serie Normal',        color:'var(--t2)',  bg:'var(--s2)'},
  {id:'warmup',   label:'Serie de Calentamiento', color:'#fbbf24', bg:'rgba(251,191,36,.15)'},
  {id:'dropset',  label:'Drop Set',             color:'#f472b6',   bg:'rgba(244,114,182,.15)'},
  {id:'failure',  label:'Al fallo',    color:'#f87171',   bg:'rgba(248,113,113,.15)'},
  {id:'preex',    label:'Pre-agotamiento',      color:'#34d399',   bg:'rgba(52,211,153,.15)'},
  {id:'restpause',label:'Rest-Pause',           color:'#a78bfa',   bg:'rgba(167,139,250,.15)'},
  {id:'superset', label:'Superserie',           color:'#4f8ef7',   bg:'rgba(79,142,247,.15)'},
];
const SET_TYPE_ABBR={normal:'',warmup:'W',dropset:'D',failure:'F',preex:'P',restpause:'R',superset:'S'};
let setTypeTarget=null; // {ei, si}

function openSetType(ei,si){
  setTypeTarget={ei,si};
  const current=activeSess?.exercises[ei]?.sets[si]?.type||'normal';
  document.getElementById('settype-list').innerHTML=SET_TYPES.map(t=>`
    <div onclick="selectSetType('${t.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 8px;border-radius:var(--r);cursor:pointer;margin-bottom:4px;background:${t.id===current?t.bg:'transparent'}">
      <div style="width:32px;height:32px;border-radius:8px;background:${t.bg};display:grid;place-items:center;font-size:11px;font-weight:700;color:${t.color};font-family:var(--mono)">${SET_TYPE_ABBR[t.id]||'N'}</div>
      <span style="font-size:13px;font-weight:500;color:${t.id===current?t.color:'var(--t1)'}">${t.label}</span>
      ${t.id===current?'<span style="margin-left:auto;color:'+t.color+'">✓</span>':''}
    </div>`).join('')+
    `<div onclick="selectSetType('delete')" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-top:1px solid var(--b1);color:var(--red);cursor:pointer;margin-top:4px">
      <span style="font-size:13px">✕ Eliminar serie</span>
    </div>`;
  document.getElementById('ov-settype').style.display='flex';
}
function closeSetType(e){if(!e||e.target===document.getElementById('ov-settype'))document.getElementById('ov-settype').style.display='none';}
function selectSetType(typeId){
  document.getElementById('ov-settype').style.display='none';
  if(!setTypeTarget||!activeSess)return;
  const{ei,si}=setTypeTarget;
  if(typeId==='delete'){removeSet(ei,si);return;}
  activeSess.exercises[ei].sets[si].type=typeId;
  renderOneEx(ei); // only this card — the rest of the list stays untouched
}
function removeSet(ei,si){
  if(!activeSess)return;
  activeSess.exercises[ei].sets.splice(si,1);
  if(activeSess.exercises[ei].sets.length===0)activeSess.exercises[ei].sets.push({kg:null,reps:null,rpe:null,done:false});
  // Removing a middle set shifts all following row ids/handlers → single-card re-render
  renderOneEx(ei);
}

// ═══ UTILS ═══
function getLastEx(name){
  if(!exCache)buildExCache();
  return exCache.lastM.get(normExName(name))||null;
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
