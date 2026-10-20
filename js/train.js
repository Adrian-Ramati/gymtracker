// train.js — Calendario, rutinas, detalle/edición de sesiones, entrenamiento activo, progresión y selector de ejercicios.
// ═══ CALENDAR ═══
function initCal(){const now=new Date();calYear=now.getFullYear();calMonth=now.getMonth();selDate=isoDate(now);}
function goToday(){const now=new Date();calYear=now.getFullYear();calMonth=now.getMonth();selDate=isoDate(now);renderCal();renderDayPanel();}
function moveMonth(d){calMonth+=d;if(calMonth>11){calMonth=0;calYear++;}else if(calMonth<0){calMonth=11;calYear--;}renderCal();}
function selectDate(ds){selDate=ds;renderCal();renderDayPanel();}
function renderDayPanel(){
  const panel=document.getElementById('day-panel');
  if(!selDate){panel.innerHTML='';return;}
  const[y,m,d]=selDate.split('-');
  const dobj=new Date(parseInt(y),parseInt(m)-1,parseInt(d));
  const dn=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const mn=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const dateLabel=`${dn[dobj.getDay()]} ${d} ${mn[parseInt(m)-1]}`;
  const sessions=(db.sessions||[]).filter(s=>s.date===selDate);
  let html=`<div class="dpanel"><div class="dpanel-head"><span class="dpanel-title">${dateLabel}</span></div>`;
  if(sessions.length){
    sessions.forEach(s=>{
      const prs=getPRsForSession(s);
      const prCount=prs.size;
      html+=`<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:13px;font-weight:600;cursor:pointer;color:var(--blue)" onclick="openSessionDetail(${s.id})">${esc(s.name)}${prCount>0?` 🏆${prCount}`:''}</span>
          <span style="font-size:10px;color:var(--t3);font-family:var(--mono)">${s.exercises?.length||0} ej.</span>
        </div>`;
      const meta=sessMetaTag(s);
      if(meta)html+=`<div style="font-size:10px;color:var(--t2);font-family:var(--mono);margin:-2px 0 4px">${meta}</div>`;
      s.exercises?.slice(0,3).forEach(e=>{const ds2=e.sets?.filter(s=>s.done||s.kg).length||0;html+=`<div style="font-size:11px;color:var(--t2);padding:2px 0">${esc(e.name)} — ${ds2} series</div>`;});
      if((s.exercises?.length||0)>3)html+=`<div style="font-size:11px;color:var(--t3)">+${s.exercises.length-3} más</div>`;
      html+=`<div style="display:flex;gap:12px;margin-top:6px">
        <button onclick="openSessionDetail(${s.id})" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;font-family:var(--font);padding:0">Ver detalle</button>
        <button onclick="repeatSession(${s.id})" style="background:none;border:none;color:var(--green);font-size:11px;cursor:pointer;font-family:var(--font);padding:0">🔁 Repetir rutina</button>
        <button onclick="editSession(${s.id})" style="background:none;border:none;color:var(--t2);font-size:11px;cursor:pointer;font-family:var(--font);padding:0">Editar</button>
        <button onclick="deleteSession(${s.id})" style="background:none;border:none;color:var(--red);font-size:11px;cursor:pointer;font-family:var(--font);padding:0">Eliminar</button>
      </div></div>`;
    });
    html+='<div class="divider"></div>';
  }
  html+='<div class="stitle" style="margin-bottom:8px">Iniciar entrenamiento</div><div class="chips">';
  (db.templates||[]).forEach(t=>{
    html+=`<div class="chip-row"><div class="chip" onclick="startFromTmpl('${t.id}')">${esc(t.name)}</div>
      <div class="tmpl-dropdown" id="dd_${t.id}">
        <button class="chip-menu-btn" onclick="toggleTmplDropdown('${t.id}',event)">⋮</button>
        <div class="tmpl-dropdown-menu" id="ddm_${t.id}">
          <button class="tmpl-dropdown-item" onclick="openEditTmpl('${t.id}');closeTmplDropdown()">Editar rutina</button>
          <button class="tmpl-dropdown-item" onclick="duplicateTmpl('${t.id}');closeTmplDropdown()">Duplicar rutina</button>
          <button class="tmpl-dropdown-item danger" onclick="deleteTmpl('${t.id}');closeTmplDropdown()">Eliminar rutina</button>
        </div>
      </div>
    </div>`;
  });
  html+=`<div class="chip blank" onclick="createNewRoutine()" style="border-color:var(--blue);color:var(--blue)">+ Nueva rutina</div></div></div>`;
  panel.innerHTML=html;
  addRestButton();
}
// Botón de descanso en el panel del día (solo si no hay sesión ese día)
function addRestButton(){
  const panel=document.getElementById('day-panel');
  if(!selDate||!panel)return;
  const has=(db.sessions||[]).some(s=>s.date===selDate);
  if(has)return;
  const dp=panel.querySelector('.dpanel');if(!dp)return;
  const btn=document.createElement('button');
  const today=todayStr();
  if(selDate<today){
    btn.className='rest-btn on';
    btn.textContent='💤 Día de descanso';
    btn.style.cssText='cursor:default;opacity:.72;pointer-events:none';
  } else {
    btn.className='rest-btn'+(isRest(selDate)?' on':'');
    btn.textContent=isRest(selDate)?'✓ Día de descanso':'Marcar como descanso';
    btn.onclick=()=>toggleRest(selDate);
  }
  dp.insertBefore(btn,dp.children[1]||null);
}

// ═══ TEMPLATE DROPDOWN ═══
function toggleTmplDropdown(tid,e){e.stopPropagation();closeTmplDropdown();const menu=document.getElementById('ddm_'+tid);if(menu)menu.classList.toggle('on');}
function closeTmplDropdown(){document.querySelectorAll('.tmpl-dropdown-menu').forEach(m=>m.classList.remove('on'));}
document.addEventListener('click',()=>closeTmplDropdown());
function duplicateTmpl(tid){const t=(db.templates||[]).find(t=>t.id===tid);if(!t)return;db.templates.push({...JSON.parse(JSON.stringify(t)),id:'tmpl_'+Date.now(),name:t.name+' (copia)'});saveDB();renderDayPanel();toast('Rutina duplicada');}
async function deleteTmpl(tid){if(!await dlgConfirm('¿Eliminar esta rutina?'))return;db.templates=db.templates.filter(t=>t.id!==tid);saveDB();renderDayPanel();}
let savedActiveSess=null;
function openEditTmpl(tid){
  const t=(db.templates||[]).find(t=>t.id===tid);if(!t)return;
  savedActiveSess=activeSess;
  activeSess={name:t.name,exercises:t.exercises.map(ex=>({name:ex.name,muscle:ex.muscle,notes:'',sets:Array.from({length:Math.max(1,ex.sets||3)},()=>({kg:null,reps:null,rpe:null,done:false}))})),rest:t.rest||90,isTmplEdit:tid};
  document.getElementById('tmpledit-name').value=t.name;
  document.getElementById('tmpledit-rest').value=t.rest||90;
  document.querySelectorAll('.bn').forEach(b=>b.classList.remove('on'));
  showScr('tmpledit',null);renderSessExs();
}
function saveTmplEdit(){
  if(!activeSess?.isTmplEdit)return;
  collectInputs();
  const t=db.templates?.find(t=>t.id===activeSess.isTmplEdit);
  if(t){
    t.name=document.getElementById('tmpledit-name').value||t.name;
    t.exercises=activeSess.exercises.map(ex=>({name:ex.name,muscle:ex.muscle,sets:ex.sets.length}));
    t.rest=Math.max(15,parseInt(document.getElementById('tmpledit-rest').value)||90);
    saveDB();
  }
  exitTmplEdit();toast('Rutina guardada ✓');
}
async function cancelTmplEdit(){
  if(!await dlgConfirm('¿Descartar cambios en la rutina?'))return;
  exitTmplEdit();toast('Cambios descartados');
}
function exitTmplEdit(){
  activeSess=savedActiveSess;savedActiveSess=null;
  navHome();
}
function renderEditTmplBody(){
  const t=(db.templates||[]).find(t=>t.id===editTmplId);if(!t)return;
  const body=document.getElementById('edit-tmpl-body');
  body.innerHTML=`<div class="tmpl-card"><input class="tmpl-name-inp" value="${esc(t.name)}" onchange="renameTmpl('${t.id}',this.value)">
    <div style="display:flex;align-items:center;gap:8px;margin:8px 0"><span style="font-size:12px;color:var(--t2)">⏱ Descanso (seg)</span><input type="number" class="tmpl-sets-inp" style="width:64px" value="${t.rest||90}" min="15" max="600" step="15" onchange="tmplRest('${t.id}',this.value)"></div>
    ${t.exercises.map((ex,ei)=>`<div class="tmpl-ex-row"><span style="display:flex;flex-direction:column;gap:1px"><button onclick="tmplMove('${t.id}',${ei},-1)" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:9px;padding:0;line-height:1">▲</button><button onclick="tmplMove('${t.id}',${ei},1)" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:9px;padding:0;line-height:1">▼</button></span><span class="tmpl-ex-name">${esc(ex.name)}</span><input type="number" class="tmpl-sets-inp" value="${ex.sets||3}" min="1" max="10" onchange="tmplSets('${t.id}',${ei},this.value)"><button class="tmpl-del-btn" onclick="tmplDel('${t.id}',${ei})">×</button></div>`).join('')}
    <button class="tmpl-add-btn" onclick="pickerTarget={type:'tmpl',tid:'${t.id}'};openPicker('tmpl')">+ Añadir ejercicio</button></div>`;
}
function closeEditTmpl(e){if(!e||e.target===document.getElementById('ov-edittmpl')){document.getElementById('ov-edittmpl').classList.remove('on');editTmplId=null;}}
function renameTmpl(tid,v){const t=db.templates?.find(t=>t.id===tid);if(t){t.name=v;saveDB();}}
function tmplDel(tid,ei){const t=db.templates?.find(t=>t.id===tid);if(t){t.exercises.splice(ei,1);saveDB();renderEditTmplBody();renderDayPanel();}}
function tmplMove(tid,ei,dir){const t=db.templates?.find(t=>t.id===tid);if(!t)return;const ni=ei+dir;if(ni<0||ni>=t.exercises.length)return;const[m]=t.exercises.splice(ei,1);t.exercises.splice(ni,0,m);saveDB();renderEditTmplBody();renderDayPanel();}
function tmplSets(tid,ei,v){const t=db.templates?.find(t=>t.id===tid);if(t){t.exercises[ei].sets=Math.max(1,parseInt(v)||3);saveDB();}}
function tmplRest(tid,v){const t=db.templates?.find(t=>t.id===tid);if(t){t.rest=Math.max(15,parseInt(v)||90);saveDB();}}

// ═══ PR DETECTION ═══
function getSortedSessions(){return [...(db.sessions||[])].sort((a,b)=>(a.date||'').localeCompare(b.date||'')||((a.id||0)-(b.id||0)));}
function getPRsForSession(sess){
  const prs=new Set();
  const sorted=getSortedSessions();
  const sessIdx=sorted.findIndex(s=>s.id===sess.id);
  (sess.exercises||[]).forEach(ex=>{
    const sessionBest=ex.best_e1rm||0;
    let prevMax=0;
    for(let i=0;i<sessIdx;i++){const prevEx=(sorted[i].exercises||[]).find(e=>e.name===ex.name);if(prevEx?.best_e1rm&&prevEx.best_e1rm>prevMax)prevMax=prevEx.best_e1rm;}
    if(sessionBest>0&&sessionBest>prevMax)prs.add(ex.name);
  });
  return prs;
}
function sessionHasPR(sess){return getPRsForSession(sess).size>0;}

// ═══ SESSION DETAIL ═══
function openSessionDetail(id){
  const sess=(db.sessions||[]).find(s=>s.id===id);if(!sess)return;
  const prs=getPRsForSession(sess);
  const prCount=prs.size;
  const totalSets=(sess.exercises||[]).reduce((a,ex)=>a+(ex.sets?.filter(s=>s.kg||s.reps).length||0),0);
  const totalVol=Math.round((sess.exercises||[]).reduce((a,ex)=>a+(ex.sets||[]).reduce((b,s)=>b+((s.kg||0)*(s.reps||0)),0),0));
  const totalReps=(sess.exercises||[]).reduce((a,ex)=>a+(ex.sets||[]).reduce((b,s)=>b+(s.reps||0),0),0);
  const metaLine=sessMetaTag(sess);
  const muscleReps={};
  (sess.exercises||[]).forEach(ex=>{const r=(ex.sets||[]).filter(s=>s.reps).reduce((a,s)=>a+(s.reps||0),0);muscleReps[ex.muscle]=(muscleReps[ex.muscle]||0)+r;});
  const muscleBarColors=Object.fromEntries(Object.entries(MC).map(([k,v])=>[k,v[1]]));
  let html=`<div style="margin-bottom:16px">
    <div style="font-size:11px;color:var(--t3);font-family:var(--mono);margin-bottom:4px">${fmtFull(sess.date)}</div>
    <div style="font-size:20px;font-weight:700;margin-bottom:12px">${esc(sess.name)}${prCount>0?` 🏆${prCount}`:''}</div>
    ${metaLine?`<div style="font-size:11px;color:var(--t2);font-family:var(--mono);margin:-6px 0 12px">${metaLine}</div>`:''}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
      <div class="detail-stat"><div class="detail-stat-val">${totalSets}</div><div class="detail-stat-lbl">Series</div></div>
      <div class="detail-stat"><div class="detail-stat-val">${totalVol}</div><div class="detail-stat-lbl">Vol kg</div></div>
      <div class="detail-stat"><div class="detail-stat-val">${totalReps}</div><div class="detail-stat-lbl">Reps</div></div>
      <div class="detail-stat"><div class="detail-stat-val" style="color:var(--amber)">${prCount>0?'🏆 '+prCount:'-'}</div><div class="detail-stat-lbl">PRs</div></div>
    </div></div>`;
  if(totalReps>0){
    html+=`<div style="margin-bottom:16px"><div class="stitle">Distribución muscular</div>`;
    Object.entries(muscleReps).sort((a,b)=>b[1]-a[1]).forEach(([m,r])=>{
      const pct=Math.round(r/totalReps*100);
      html+=`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:500;margin-bottom:4px"><span>${esc(m)}</span><span style="color:var(--t3);font-family:var(--mono)">${pct}%</span></div><div class="muscle-pct-bar"><div class="muscle-pct-fill" style="width:${pct}%;background:${muscleBarColors[m]||'#4f8ef7'}"></div></div></div>`;
    });
    html+='</div>';
  }
  html+=`<div class="stitle">Ejercicios</div>`;
  (sess.exercises||[]).forEach(ex=>{
    const isPR=prs.has(ex.name);
    const mc=MC[ex.muscle]||['#1e1e1e','#9ca3af'];
    html+=`<div class="detail-ex-row">
      <div class="detail-ex-name" style="flex-wrap:wrap;gap:6px">
        <span>${esc(ex.name)}${isPR?' <span style="color:var(--amber);font-size:11px">🏆 PR</span>':''}</span>
        <span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:6px;background:${mc[0]};color:${mc[1]};font-family:var(--mono)">${esc(ex.muscle)}</span>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:4px;align-items:center;margin-bottom:4px"><span style="font-size:10px;color:var(--t3);width:60px;font-family:var(--mono)">Serie</span><span style="font-size:10px;color:var(--t3);font-family:var(--mono)">Peso / Reps / RPE</span></div>`;
    (ex.sets||[]).filter(s=>s.kg||s.reps).forEach((s,si)=>{
      const rm=calcE1RM(s.kg,s.reps,s.rpe);
      html+=`<div class="detail-set-row"><div class="detail-set-num">${si+1}</div><div class="detail-set-info">${s.kg||'—'} kg × ${s.reps||'—'} reps${s.rpe?' @'+s.rpe:''}${rm?` <span style="color:var(--blue);font-size:10px">e1RM ${rm}</span>`:''}</div></div>`;
    });
    if(ex.notes)html+=`<div style="font-size:11px;color:var(--t3);margin-top:6px;font-style:italic">${esc(ex.notes)}</div>`;
    html+='</div>';
  });
  html+=`<button onclick="closeDetail();repeatSession(${sess.id})" style="width:100%;margin-top:12px;padding:11px;background:var(--s2);border:1px solid var(--b1);border-radius:12px;color:var(--green);font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">🔁 Repetir rutina</button>`;
  document.getElementById('detail-body').innerHTML=html;
  document.getElementById('detail-edit-btn').onclick=()=>{closeDetail();editSession(id);};
  document.getElementById('ov-detail').classList.add('on');
}
function closeDetail(e){if(!e||e.target===document.getElementById('ov-detail'))document.getElementById('ov-detail').classList.remove('on');}

// ═══ EDIT / DELETE SESSION ═══
function editSession(id){
  const sess=(db.sessions||[]).find(s=>s.id===id);if(!sess)return;
  // Do NOT remove the original here — it stays intact until finishSession
  // replaces it in-place (canceling or an app kill no longer loses the session).
  activeSess={...JSON.parse(JSON.stringify(sess)),editing:true,originalId:id};
  sessStartTs=Date.now();
  clearInterval(timerIv);timerIv=setInterval(updateTimer,1000);updateTimer();
  acquireWakeLock();
  document.getElementById('sess-name').value=sess.name;
  const ki=document.getElementById('sess-kcal');if(ki)ki.value=sess.kcalWatch??'';
  document.querySelectorAll('.bn').forEach(b=>b.classList.remove('on'));
  showScr('sess',null);renderSessExs();
  toast('Editando sesión — Finalizar para guardar');
}
async function deleteSession(id){
  if(!await dlgConfirm('¿Eliminar esta sesión?'))return;
  db.sessions=db.sessions.filter(s=>s.id!==id);
  await deleteSessionRemote(id);
  renderCal();renderDayPanel();toast('Sesión eliminada');
}

// ═══ SESSION ═══
// Con mesociclo activo, las series de cada ejercicio se ajustan a la semana (más series o descarga)
function startFromTmpl(tid){const t=(db.templates||[]).find(t=>t.id===tid);if(!t)return;const ns=PPCore.mesoSets(db.profile,db.templates,t,selDate||todayStr());startSess(t.name,t.exercises.map((ex,i)=>({name:ex.name,muscle:ex.muscle,notes:'',sets:Array.from({length:ns[i]||ex.sets||3},()=>({kg:null,reps:null,rpe:null,done:false}))})),t.rest);}
function startBlank(){startSess('Entrenamiento',[]);}
function startSess(name,exercises,rest,date){
  prefetchGifs(exercises.map(e=>e.name));
  activeSess={name,exercises,rest:rest||90,date:date||selDate||todayStr()};
  // Wall-clock anchor: setInterval is throttled/suspended when the screen locks,
  // so elapsed time is DERIVED from sessStartTs, never accumulated tick by tick.
  sessStartTs=Date.now();
  clearInterval(timerIv);timerIv=setInterval(updateTimer,1000);updateTimer();
  acquireWakeLock();
  document.getElementById('sess-name').value=name;
  const ki=document.getElementById('sess-kcal');if(ki)ki.value='';
  document.querySelectorAll('.bn').forEach(b=>b.classList.remove('on'));
  showScr('sess',null);renderSessExs();
}
async function deleteCurrentSession(){
  if(!activeSess?.editing){cancelSession();return;}
  if(!await dlgConfirm('¿Borrar este entrenamiento definitivamente?'))return;
  const oid=activeSess.originalId;
  clearInterval(timerIv);activeSess=null;clearActiveStash();stopRest();releaseWakeLock();
  if(oid){db.sessions=db.sessions.filter(s=>s.id!==oid);await deleteSessionRemote(oid);}
  navHome();toast('Entrenamiento eliminado');
}
async function cancelSession(){
  const wasEdit=!!activeSess?.editing;
  const msg=wasEdit?'¿Descartar los cambios de esta sesión?':'¿Cancelar el entrenamiento? No se guardará nada.';
  if(!await dlgConfirm(msg))return;
  clearInterval(timerIv);activeSess=null;clearActiveStash();stopRest();releaseWakeLock();
  navHome();toast(wasEdit?'Cambios descartados':'Entrenamiento cancelado');
}
function updateTimer(){timerSecs=sessStartTs?Math.max(0,Math.floor((Date.now()-sessStartTs)/1000)):0;const m=Math.floor(timerSecs/60),s=timerSecs%60;const txt=m+':'+(s<10?'0':'')+s;document.getElementById('sess-timer').textContent=txt;const rt=document.getElementById('resume-bar-timer');if(rt)rt.textContent=txt;}
function resumeSession(){showScr('sess',null);renderSessExs();}
function updateResumeBar(){
  const bar=document.getElementById('resume-bar');if(!bar)return;
  const onSess=document.getElementById('s-sess')?.classList.contains('on');
  if(!activeSess||onSess||activeSess.isTmplEdit){bar.classList.remove('show');return;}
  const name=document.getElementById('sess-name')?.value||activeSess.name||'Entrenamiento';
  const curEx=(activeSess.exercises||[]).find(ex=>(ex.sets||[]).some(s=>!s.done));
  document.getElementById('resume-bar-name').textContent=name;
  document.getElementById('resume-bar-ex').textContent=curEx?curEx.name:'Completado';
  const m=Math.floor(timerSecs/60),s=timerSecs%60;document.getElementById('resume-bar-timer').textContent=m+':'+(s<10?'0':'')+s;
  bar.classList.add('show');
}
function onSessDate(v){if(!activeSess||activeSess.isTmplEdit||!v)return;activeSess.date=v;persistActive();renderSessMeso();toast('Fecha cambiada: '+fmtDate(v));}
function renderSessExs(){
  renderSessMeso();
  const di=document.getElementById('sess-date');
  if(di&&activeSess&&!activeSess.isTmplEdit&&di!==document.activeElement)di.value=activeSess.date||todayStr();
  const target=activeSess?.isTmplEdit?'tmpledit-exs':'sess-exs';
  if(!activeSess){document.getElementById(target).innerHTML='';return;}
  document.getElementById(target).innerHTML=activeSess.exercises.map((ex,ei)=>renderExCard(ex,ei)).join('');
  persistActive();
}
// Set-type styling (module-level: was rebuilt inside the loop for every set)
const SET_COLORS={normal:'var(--t3)',warmup:'#fbbf24',dropset:'#f472b6',failure:'#f87171',preex:'#34d399',restpause:'#a78bfa',superset:'#4f8ef7'};
const SET_BG={normal:'',warmup:'rgba(251,191,36,.1)',dropset:'rgba(244,114,182,.1)',failure:'rgba(248,113,113,.1)',preex:'rgba(52,211,153,.1)',restpause:'rgba(167,139,250,.1)',superset:'rgba(79,142,247,.1)'};
const SET_ABBR2={normal:'',warmup:'W',dropset:'D',failure:'F',preex:'P',restpause:'R',superset:'S'};
// Renders ONE set row — used by renderExCard and by addSet() for targeted appends
function renderSetRow(ex,ei,si){
  const s=ex.sets[si];
  const lv=getLastEx(ex.name)?.sets?.[si];
  const stype=s.type||'normal';
  const rowBg=SET_BG[stype];
  const btnBg=s.done?'var(--green)':(SET_BG[stype]||'transparent');
  const btnBorder=s.done?'var(--green)':SET_COLORS[stype];
  const btnColor=s.done?'#000':SET_COLORS[stype];
  const btnLabel=s.done?'✓':(SET_ABBR2[stype]||(si+1));
  return `<div class="set-row" id="sr_${ei}_${si}" style="background:${rowBg};border-radius:6px"><button class="set-num" id="sn_${ei}_${si}" onclick="openSetType(${ei},${si})" style="background:${btnBg};border:1px solid ${btnBorder};border-radius:6px;cursor:pointer;color:${btnColor};width:22px;height:22px;display:grid;place-items:center;font-size:10px;font-weight:700;font-family:var(--mono)">${btnLabel}</button><div class="prev-cell" onclick="fillFromPrev(${ei},${si})" title="Rellenar">${lv?(lv.kg+"x"+lv.reps):"—"}</div><input type="number" id="kg_${ei}_${si}" value="${s.kg??""}" placeholder="${lv?lv.kg:"kg"}" min="0" step="0.5" oninput="onSetInput(${ei},${si})"><input type="number" id="rp_${ei}_${si}" value="${s.reps??""}" placeholder="${lv?lv.reps:"reps"}" min="1" max="60" step="1" oninput="onSetInput(${ei},${si})"><input type="number" id="rpe_${ei}_${si}" value="${s.rpe??""}" placeholder="${lv?lv.rpe:"rpe"}" min="5" max="10" step="0.5" oninput="onSetInput(${ei},${si})"><button class="check-btn${s.done?" done":""}" onclick="toggleDone(${ei},${si})">${s.done?"✓":"○"}</button></div>`;
}
function renderExCard(ex,ei){
  const mc=MC[ex.muscle]||['#1e1e1e','#9ca3af'];
  const prevMaxRM=getMaxE1RM(ex.name);
  const sets=ex.sets.map((_,si)=>renderSetRow(ex,ei,si)).join('');
  const initRMs=(ex.sets||[]).map(st=>calcE1RM(st.kg,st.reps,st.rpe)).filter(Boolean);
  const initBest=initRMs.length?Math.max(...initRMs):null;
  const e1rmRow=`<div class="e1rm-row" id="e1rm_${ei}">
    <span class="e1rm-curr" id="e1rm-curr_${ei}">e1RM: ${initBest?initBest+' kg':'—'}</span>
    ${prevMaxRM?`<span class="e1rm-max">máx: ${prevMaxRM} kg</span>`:''}
    <span id="pr-flag_${ei}" style="display:none;color:var(--amber);font-size:11px">🏆 ¡Nuevo PR!</span>
  </div>`;
  const dlw=(activeSess&&!activeSess.isTmplEdit)?mesoNow(activeSess.date):null;
  const prog=(activeSess&&!activeSess.isTmplEdit&&!activeSess.editing&&!dlw?.deload)?getProgression(ex.name):null;
  const progRow=dlw?.deload?deloadHintHtml(ex):prog?`<div class="prog-hint ${prog.action}" onclick="applyProgression(${ei})" title="Toca para rellenar las series vacías">${prog.action==='hold'?'→':'↑'} ${esc(prog.msg)}</div>`:'';
  return `<div class="ec" id="ec_${ei}" draggable="true" ondragstart="dStart(event,${ei})" ondragover="dOver(event,${ei})" ondrop="dDrop(event,${ei})" ondragend="dEnd()">
    <div class="ec-head">
      <span class="drag-handle">⠿</span>
      ${thumbHtml(ex.name,'exthumb sm')}
      <span class="ec-name" data-exn="${esc(ex.name)}" onclick="openExView(this.dataset.exn)" style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px">${esc(ex.name)}</span>
      <span class="ec-tag" style="background:${mc[0]};color:${mc[1]}">${esc(ex.muscle)}</span>
      <button class="ec-menu-btn" onclick="openCtx(${ei})">⋯</button>
    </div>
    ${progRow}
    <div class="sets-head"><div></div><div class="sh-col">ant.</div><div class="sh-col">kg</div><div class="sh-col">reps</div><div class="sh-col">rpe</div><div></div></div>
    <div id="sets_${ei}">${sets}</div>
    <div class="ec-footer">
      <button class="add-set-btn" onclick="addSet(${ei})">+ Serie</button>
      <button class="add-set-btn" id="minus_${ei}" onclick="removeLastSet(${ei})" style="${ex.sets.length>1?'':'display:none'}">− Serie</button>
    </div>
    ${e1rmRow}
    <div class="notes-wrap"><textarea class="notes-inp" placeholder="Notas del ejercicio…" rows="1" oninput="saveNote(${ei},this.value)">${esc(ex.notes||'')}</textarea></div>
  </div>`;
}
// Re-render a single card in place (index-shifting edits like removing a middle
// set). Cheaper than renderSessExs() and keeps the rest of the list untouched.
function renderOneEx(ei){
  const card=document.getElementById('ec_'+ei);
  const ex=activeSess?.exercises[ei];
  if(!card||!ex){renderSessExs();return;}
  card.outerHTML=renderExCard(ex,ei);
  persistActive();
}

// Fill from previous values on tick (or click prev cell)
function fillFromPrev(ei,si){
  if(!activeSess)return;
  const last=getLastEx(activeSess.exercises[ei].name);
  const lv=last?.sets?.[si];
  if(!lv)return;
  const kgEl=document.getElementById(`kg_${ei}_${si}`);
  const rpEl=document.getElementById(`rp_${ei}_${si}`);
  const rpeEl=document.getElementById(`rpe_${ei}_${si}`);
  if(kgEl&&lv.kg){kgEl.value=lv.kg;}
  if(rpEl&&lv.reps){rpEl.value=lv.reps;}
  if(rpeEl&&lv.rpe){rpeEl.value=lv.rpe;}
  onSetInput(ei,si);
}

// ═══ DOUBLE PROGRESSION ═══
// RPE-gated double progression from the last logged session of each exercise:
//   0. All top-weight sets at ≥12 EFFECTIVE reps (reps + RIR) → add load. The set
//      demonstrates the weight is below the strength-stimulus zone regardless of
//      rep-range settings or RPE — this rule takes priority over the hold rule.
//   1. All top-weight working sets at the TOP of the rep range @ RPE ≤ 8 → add load
//   2. Otherwise, RPE ≤ 8.5 and room in the range → add 1 rep to the weakest set
//   3. Max RPE ≥ 9.5 → hold the load (accumulated fatigue / near-miss)
// Warm-ups and back-off sets (below the top working weight) don't gate progression.
// Missing RPE is treated as 8 (neutral) so the feature works without RPE logging,
// except the no-range weight jump, which requires an explicit RPE ≤ 7.5.
function parseRepRange(str){
  if(!str)return null;
  const s=String(str).replace(/–|—/g,'-');
  // Prefer explicit "a-b" pairs; with "sets x reps" notation ("3x8-12") the rep
  // range is the LAST pair. hi≥4 filters out the sets count being read as a range.
  const pairs=[...s.matchAll(/(\d{1,2})\s*-\s*(\d{1,2})/g)].map(m=>({lo:+m[1],hi:+m[2]}));
  const valid=pairs.filter(p=>p.lo>=1&&p.hi>=p.lo&&p.hi>=4&&p.hi<=50);
  if(valid.length)return valid[valid.length-1];
  const nums=[...s.matchAll(/\d{1,2}/g)].map(m=>+m[0]).filter(n=>n>=5&&n<=30);
  if(nums.length){const n=nums[nums.length-1];return{lo:n,hi:n};}
  return null;
}
function getProgression(exName){
  const last=getLastEx(exName);if(!last)return null;
  const ws=(last.sets||[]).filter(s=>s.kg!=null&&s.reps&&(s.type||'normal')!=='warmup');
  if(!ws.length)return null;
  const topKg=Math.max(...ws.map(s=>s.kg));
  if(!(topKg>0))return null;
  const work=ws.filter(s=>s.kg===topKg);
  const range=parseRepRange(ALL_EX.find(e=>normExName(e.name)===normExName(exName))?.reps);
  const rpes=work.map(s=>s.rpe).filter(r=>r!=null);
  const maxRpe=rpes.length?Math.max(...rpes):8;
  const minReps=Math.min(...work.map(s=>s.reps));
  const inc=topKg>=20?2.5:1.25;
  const r1=v=>Math.round(v*100)/100;
  const lo=range?.lo??null, hi=range?.hi??null;
  // Rule 0: ≥12 effective reps on every top-weight set → the load is too light,
  // increase regardless of range or RPE (explicit user rule; beats the hold rule).
  const erOf=s=>s.reps+(10-Math.min(10,Math.max(6,s.rpe??8)));
  const minER=Math.min(...work.map(erOf));
  if(minER>=12)
    return{action:'weight',kg:r1(topKg+inc),reps:lo||8,msg:`Sube a ${r1(topKg+inc)} kg — ${Math.round(minER*10)/10} reps efectivas (≥12)`};
  if(maxRpe>=9.5)
    return{action:'hold',kg:topKg,reps:minReps,msg:`Mantén ${topKg} kg — RPE ${maxRpe} la última sesión`};
  if(hi&&work.every(s=>s.reps>=hi)&&maxRpe<=8)
    return{action:'weight',kg:r1(topKg+inc),reps:lo||hi,msg:`Sube a ${r1(topKg+inc)} kg × ${lo||hi} — tope del rango a RPE ≤8`};
  if(!hi&&rpes.length&&maxRpe<=7.5)
    return{action:'weight',kg:r1(topKg+inc),reps:minReps,msg:`Sube a ${r1(topKg+inc)} kg — RPE ${maxRpe} la última sesión`};
  if(maxRpe<=8.5&&(!hi||minReps<hi)){
    const target=hi?Math.min(minReps+1,hi):minReps+1;
    return{action:'reps',kg:topKg,reps:target,msg:`Busca ${target} reps con ${topKg} kg${hi?` (rango ${lo}–${hi})`:''}`};
  }
  return null;
}
// Tap the hint → fill EMPTY inputs of non-warmup sets with the suggested target
function applyProgression(ei){
  if(!activeSess)return;
  const ex=activeSess.exercises[ei];
  const prog=getProgression(ex.name);
  if(!prog)return;
  let filled=0;
  ex.sets.forEach((s,si)=>{
    if((s.type||'normal')==='warmup')return;
    const kgEl=document.getElementById(`kg_${ei}_${si}`);
    const rpEl=document.getElementById(`rp_${ei}_${si}`);
    if(kgEl&&!kgEl.value){kgEl.value=prog.kg;filled++;}
    if(rpEl&&!rpEl.value){rpEl.value=prog.reps;}
    onSetInput(ei,si);
  });
  vib(20);
  toast(filled?`Objetivo aplicado: ${prog.kg} kg × ${prog.reps}`:'Las series ya tienen valores');
}

// Recompute the e1RM line + PR flag for one card from activeSess data
function updateE1RMRow(ei){
  const ex=activeSess?.exercises[ei];if(!ex)return;
  const allRMs=ex.sets.map(st=>calcE1RM(st.kg,st.reps,st.rpe)).filter(Boolean);
  const bestCurr=allRMs.length?Math.max(...allRMs):null;
  const currEl=document.getElementById(`e1rm-curr_${ei}`);
  if(currEl)currEl.textContent=bestCurr?`e1RM: ${bestCurr} kg`:'e1RM: —';
  const prFlag=document.getElementById(`pr-flag_${ei}`);
  if(prFlag&&bestCurr){const histMax=getMaxE1RM(ex.name);prFlag.style.display=(histMax&&bestCurr>histMax)?'':'none';}
  else if(prFlag)prFlag.style.display='none';
}
function onSetInput(ei,si){
  if(!activeSess)return;
  const s=activeSess.exercises[ei].sets[si];
  const kg=numVal(document.getElementById(`kg_${ei}_${si}`));if(kg!==undefined)s.kg=kg;
  const rp=numVal(document.getElementById(`rp_${ei}_${si}`));if(rp!==undefined)s.reps=rp;
  const rpe=numVal(document.getElementById(`rpe_${ei}_${si}`));if(rpe!==undefined)s.rpe=rpe;
  updateE1RMRow(ei);
  persistActive();
}
function toggleDone(ei,si){
  if(!activeSess)return;
  const s=activeSess.exercises[ei].sets[si];
  // If no values entered yet, fill from previous suggestion
  const kgEl=document.getElementById(`kg_${ei}_${si}`);
  const rpEl=document.getElementById(`rp_${ei}_${si}`);
  const rpeEl=document.getElementById(`rpe_${ei}_${si}`);
  const kgVal=numVal(kgEl);
  const rpVal=numVal(rpEl);
  if(kgVal==null&&rpVal==null){
    // Fill from placeholder (previous session values)
    const last=getLastEx(activeSess.exercises[ei].name);
    const lv=last?.sets?.[si];
    if(lv){
      if(kgEl&&lv.kg!=null&&!kgEl.value){kgEl.value=lv.kg;}
      if(rpEl&&lv.reps!=null&&!rpEl.value){rpEl.value=lv.reps;}
      if(rpeEl&&lv.rpe!=null&&!rpeEl.value){rpeEl.value=lv.rpe;}
    }
  }
  // Explicit read: what's in the input is the truth (empty = null, 0 = 0)
  const kg=numVal(kgEl);if(kg!==undefined)s.kg=kg;
  const rp=numVal(rpEl);if(rp!==undefined)s.reps=rp;
  const rpe=numVal(rpeEl);if(rpe!==undefined)s.rpe=rpe;
  s.done=!s.done;
  if(s.done){vib(30);startRest(activeSess.rest||90);}
  const btn=document.querySelector(`#sr_${ei}_${si} .check-btn`);
  const num=document.getElementById(`sn_${ei}_${si}`);
  if(btn){btn.classList.toggle('done',s.done);btn.textContent=s.done?'✓':'○';}
  if(num)num.classList.toggle('done',s.done);
  onSetInput(ei,si);
}
// Targeted DOM edits: the old renderSessExs() here rebuilt every card, which
// closed the mobile keyboard and reset scroll. Inputs are already synced to
// activeSess via oninput, so no collectInputs() sweep is needed either.
function addSet(ei){
  if(!activeSess)return;
  const ex=activeSess.exercises[ei];
  ex.sets.push({kg:null,reps:null,rpe:null,done:false});
  const cont=document.getElementById('sets_'+ei);
  if(cont)cont.insertAdjacentHTML('beforeend',renderSetRow(ex,ei,ex.sets.length-1));
  else{renderSessExs();return;}
  const minus=document.getElementById('minus_'+ei);
  if(minus)minus.style.display=ex.sets.length>1?'':'none';
  persistActive();
}
function removeLastSet(ei){
  if(!activeSess)return;
  const ex=activeSess.exercises[ei];
  if(ex.sets.length<=1)return;
  ex.sets.pop();
  const row=document.getElementById(`sr_${ei}_${ex.sets.length}`);
  if(row)row.remove();else{renderSessExs();return;}
  const minus=document.getElementById('minus_'+ei);
  if(minus)minus.style.display=ex.sets.length>1?'':'none';
  updateE1RMRow(ei);
  persistActive();
}
function saveNote(ei,val){if(activeSess){activeSess.exercises[ei].notes=val;persistActive();}}
function onKcalInput(v){if(!activeSess)return;const n=parseFloat(v);activeSess.kcalWatch=(v===''||isNaN(n))?null:Math.round(n);persistActive();}
function collectInputs(){
  if(!activeSess)return;
  activeSess.exercises.forEach((ex,ei)=>{
    ex.sets.forEach((s,si)=>{
      const kg=numVal(document.getElementById(`kg_${ei}_${si}`));if(kg!==undefined)s.kg=kg;
      const rp=numVal(document.getElementById(`rp_${ei}_${si}`));if(rp!==undefined)s.reps=rp;
      const rpe=numVal(document.getElementById(`rpe_${ei}_${si}`));if(rpe!==undefined)s.rpe=rpe;
    });
    const notesEl=document.querySelector(`#ec_${ei} .notes-inp`);
    if(notesEl)ex.notes=notesEl.value;
  });
  persistActive();
}
async function finishSession(){
  if(!activeSess)return;
  collectInputs();clearInterval(timerIv);
  activeSess.exercises.forEach(ex=>{const rms=ex.sets.filter(s=>s.kg&&s.reps).map(s=>calcE1RM(s.kg,s.reps,s.rpe));ex.best_e1rm=rms.length?Math.max(...rms):null;});
  activeSess.name=document.getElementById('sess-name').value||'Entrenamiento';
  const valid=activeSess.exercises.filter(ex=>ex.sets.some(s=>s.kg||s.reps));
  if(!valid.length){timerIv=setInterval(updateTimer,1000);toast('Añade al menos una serie');return;}
  activeSess.exercises=valid;
  // Reuse originalId when editing: the upsert becomes an UPDATE of the existing
  // Supabase row instead of inserting a duplicate with a new id.
  const isEdit=!!activeSess.originalId;
  const newSess={...activeSess,id:activeSess.originalId||Date.now()};
  // Duration: for new sessions derive from the wall-clock start; when editing an
  // old one, KEEP its stored duration (the edit timer measures editing, not training).
  if(!isEdit)newSess.durationMin=Math.max(1,Math.round((Date.now()-(sessStartTs||Date.now()))/60000));
  delete newSess.editing;delete newSess.originalId;
  if(isEdit)db.sessions=db.sessions.filter(s=>s.id!==newSess.id);
  db.sessions.push(newSess);
  activeSess=null;clearActiveStash();releaseWakeLock();
  await saveSession(newSess);
  stopRest();vib([50,30,50]);
  toast(isEdit?'Sesión actualizada ✓':'Sesión guardada ✓');
  navHome();
}

// ═══ DRAG & DROP ═══
function dStart(e,i){dragSrcIdx=i;setTimeout(()=>document.getElementById('ec_'+i)?.classList.add('dragging'),0);}
function dOver(e,i){e.preventDefault();document.querySelectorAll('.ec').forEach(c=>c.classList.remove('drag-over'));if(i!==dragSrcIdx)document.getElementById('ec_'+i)?.classList.add('drag-over');}
function dDrop(e,i){e.preventDefault();if(!activeSess||dragSrcIdx===null||dragSrcIdx===i)return;collectInputs();const exs=activeSess.exercises;const[moved]=exs.splice(dragSrcIdx,1);exs.splice(i,0,moved);dragSrcIdx=null;renderSessExs();}
function dEnd(){document.querySelectorAll('.ec').forEach(c=>{c.classList.remove('dragging');c.classList.remove('drag-over');});dragSrcIdx=null;}

// ═══ CONTEXT MENU ═══
function openCtx(ei){
  const ex=activeSess?.exercises[ei];
  document.getElementById('ctx-title').textContent=ex?.name||'Opciones';
  document.getElementById('ctx-menu').innerHTML=`
    <button class="ctx-item" onclick="ctxReplace(${ei})">
      <svg viewBox="0 0 24 24"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>Reemplazar ejercicio</button>
    <button class="ctx-item danger" onclick="removeEx(${ei})">
      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>Eliminar ejercicio</button>`;
  document.getElementById('ov-ctx').classList.add('on');
}
function closeCtx(e){if(!e||e.target===document.getElementById('ov-ctx'))document.getElementById('ov-ctx').classList.remove('on');}
function ctxReplace(ei){closeCtx();pickerTarget={type:'replace',ei};openPicker('replace');}
function removeEx(ei){closeCtx();if(!activeSess)return;collectInputs();activeSess.exercises.splice(ei,1);renderSessExs();}

// ═══ EXERCISE PICKER ═══
function openPicker(targetOrMode){
  if(targetOrMode&&typeof targetOrMode==='string'&&targetOrMode!=='replace'&&targetOrMode!=='tmpl')pickerTarget=targetOrMode;
  mFilter='all';pickerEqFilter='all';
  const searchInp=document.getElementById('picker-search');if(searchInp)searchInp.value='';
  const isReplace=pickerTarget?.type==='replace'||pickerTarget==='replace';
  document.getElementById('picker-title').textContent=isReplace?'Reemplazar ejercicio':'Añadir ejercicio';
  const mf=document.getElementById('muscle-filters');
  mf.innerHTML=`<div class="mf on" onclick="setMFilter('all')">Todos</div>`+MUSCLES.map(m=>`<div class="mf" data-m="${esc(m)}" onclick="setMFilter(this.dataset.m)">${esc(m)}</div>`).join('');
  const ef=document.getElementById('picker-eq-filters');
  ef.innerHTML=`<div class="mf on" onclick="setPickerEqFilter('all')">Todos</div>`+['Peso libre','Poleas','Máquina'].map(eq=>`<div class="mf" onclick="setPickerEqFilter('${eq}')">${eq}</div>`).join('');
  renderPickerList();document.getElementById('ov-picker').classList.add('on');
}
function setMFilter(m){mFilter=m;document.querySelectorAll('#muscle-filters .mf').forEach(el=>el.classList.toggle('on',el.textContent===(m==='all'?'Todos':m)));renderPickerList();}
function setPickerEqFilter(eq){pickerEqFilter=eq;document.querySelectorAll('#picker-eq-filters .mf').forEach(el=>el.classList.toggle('on',el.textContent===(eq==='all'?'Todos':eq)));renderPickerList();}
function renderPickerList(){
  const search=(document.getElementById('picker-search')?.value||'').toLowerCase().trim();
  const list=ALL_EX.filter(e=>{
    const muscleOk=mFilter==='all'||e.muscle===mFilter;
    const eqOk=pickerEqFilter==='all'||e.equipment===pickerEqFilter;
    const searchOk=!search||e.name.toLowerCase().includes(search)||e.muscle.toLowerCase().includes(search);
    return muscleOk&&eqOk&&searchOk;
  });
  // data-attrs instead of inline string args: names with quotes/HTML no longer break the handler
  document.getElementById('picker-list').innerHTML=list.length
    ?list.map(e=>`<div class="ex-item" data-n="${esc(e.name)}" data-m="${esc(e.muscle)}" onclick="selectEx(this.dataset.n,this.dataset.m)" style="gap:10px">${thumbHtml(e.name,'exthumb sm')}<div><div class="ex-item-name">${esc(e.name)}</div><div class="ex-item-muscle">${esc(e.muscle)}</div></div></div>`).join('')
    :'<div class="empty">Sin resultados<br><button onclick="pickerCreateNew()" style="margin-top:10px;padding:9px 14px;background:var(--blue);color:var(--onacc);border:none;border-radius:var(--r);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">+ Crear este ejercicio</button></div>';
}
// Crear un ejercicio desde el selector: al guardarlo se añade/sustituye directamente
let pickerCreating=false;
function pickerCreateNew(){
  pickerCreating=true;
  openExEditor(null,(document.getElementById('picker-search')?.value||'').trim());
}
function closePicker(e){if(!e||e.target===document.getElementById('ov-picker'))document.getElementById('ov-picker').classList.remove('on');}
function selectEx(name,muscle){
  const target=pickerTarget;
  document.getElementById('ov-picker').classList.remove('on');pickerTarget=null;
  if(!target)return;
  if(target==='add'){if(!activeSess)return;activeSess.exercises.push({name,muscle,notes:'',sets:[{kg:null,reps:null,rpe:null,done:false},{kg:null,reps:null,rpe:null,done:false},{kg:null,reps:null,rpe:null,done:false}]});renderSessExs();}
  else if(target?.type==='replace'){if(!activeSess)return;collectInputs();activeSess.exercises[target.ei].name=name;activeSess.exercises[target.ei].muscle=muscle;renderSessExs();}
  else if(target?.type==='tmpl'){const tid=target.tid||editTmplId;const t=db.templates?.find(t=>t.id===tid);if(t){t.exercises.push({name,muscle,sets:3});saveDB();renderEditTmplBody();renderDayPanel();}}
}
