// body.js — Volumen histórico, landmarks, perfil, peso, medidas, % graso, copias de seguridad y Excel.
// ═══ VOLUME ═══
// ═══ LANDMARKS EDITOR ═══
function openLandmarks(){
  const seen=new Set([...(db.sessions||[]).flatMap(s=>s.exercises?.map(e=>normMuscle(e.muscle))||[])]);
  Object.keys(DEFAULT_LANDMARKS).forEach(m=>seen.add(m));
  Object.keys(db.profile?.landmarks||{}).forEach(m=>seen.add(m));
  const muscles=[...seen].sort((a,b)=>a.localeCompare(b,'es'));
  const ov=db.profile?.landmarks||{};
  const inp=(m,f)=>{const v=ov[m]?.[f];const ph=DEFAULT_LANDMARKS[m]?.[f]??'';
    return `<input type="number" min="0" max="40" step="1" data-m="${esc(m)}" data-f="${f}" value="${v??''}" placeholder="${ph}" style="width:100%;padding:6px 4px;text-align:center;background:var(--bg);border:1px solid var(--b1);border-radius:6px;color:var(--t1);font-family:var(--mono);font-size:12px;outline:none">`;};
  document.getElementById('lm-rows').innerHTML=muscles.map(m=>`
    <div style="display:grid;grid-template-columns:1fr 52px 52px 52px;gap:6px;align-items:center;margin-bottom:6px">
      <span style="font-size:12px;color:var(--t1)">${esc(m)}</span>
      ${inp(m,'mev')}${inp(m,'mav')}${inp(m,'mrv')}
    </div>`).join('');
  document.getElementById('ov-landmarks').classList.add('on');
}
function closeLandmarks(e){if(e&&e.target!==e.currentTarget)return;document.getElementById('ov-landmarks').classList.remove('on');}
function saveLandmarks(){
  const rows={};
  document.querySelectorAll('#lm-rows input').forEach(el=>{
    const m=el.dataset.m,f=el.dataset.f,v=numVal(el);
    if(v==null)return; // empty → fall back to default
    (rows[m]=rows[m]||{})[f]=v;
  });
  // Sanity: whatever is EFFECTIVE (override merged over default) must be ordered
  for(const m of Object.keys(rows)){
    const eff={...(DEFAULT_LANDMARKS[m]||{}),...rows[m]};
    if(eff.mev!=null&&eff.mav!=null&&eff.mrv!=null&&!(eff.mev<=eff.mav&&eff.mav<=eff.mrv)){
      toast(`${m}: se necesita MEV ≤ MAV ≤ MRV`);return;
    }
  }
  db.profile=db.profile||{};
  db.profile.landmarks=rows;
  saveDB();
  closeLandmarks();
  renderVol();
  toast('Landmarks guardados ✓');
}
function renderVol(){
  const sessions=db.sessions||[];
  const _wd=new Set(weekRange(dashOff));
  const week=sessions.filter(s=>_wd.has(s.date));
  const muscleFilter='multi';
  // Populate multi-select chips
  const allMuscles=[...new Set(sessions.flatMap(s=>s.exercises?.map(e=>normMuscle(e.muscle))||[]))];
  const chips=document.getElementById('vol-muscle-chips');
  if(chips&&!chips.dataset.init){
    chips.dataset.init='1';
    chips.innerHTML=`<div class="mf on" data-m="all" onclick="volToggle('all')">Todos</div>`+allMuscles.map(m=>`<div class="mf" data-m="${esc(m)}" onclick="volToggle(this.dataset.m)">${esc(m)}</div>`).join('');
  }
  const selSet=volSel.size?volSel:null;
  const vbm={};
  week.forEach(s=>s.exercises?.forEach(e=>{
    const m=normMuscle(e.muscle);
    if(selSet&&!selSet.has(m))return;
    vbm[m]=(vbm[m]||0)+(e.sets?.filter(isWorkSet).length||0);
  }));
  const total=Object.values(vbm).reduce((a,b)=>a+b,0);
  // MEV/MAV/MRV context: bands + zone card only with a single muscle selected
  const selMuscle=(selSet&&selSet.size===1)?[...selSet][0]:null;
  const lm=selMuscle?getLandmarks(selMuscle):null;
  const zone=lm?lmZone(total,lm):null;
  const _volStatsHtml=`
    <div class="sc"><div class="sc-label">SERIES / SEMANA</div><div class="sc-val">${total}</div></div>
    <div class="sc"><div class="sc-label">SESIONES / SEMANA</div><div class="sc-val">${week.length}</div></div>${zone?`
    <div class="sc"><div class="sc-label">ZONA · ${lm.mev}/${lm.mav}/${lm.mrv}</div><div class="sc-val" style="font-size:15px;color:${zone.color}">${zone.txt}</div><div style="font-size:9px;color:var(--t3);font-family:var(--mono)">${zone.detail}</div></div>`:''}`;
  const mx=Math.max(...Object.values(vbm),1);
  const _volBarsHtml=Object.entries(vbm).sort((a,b)=>b[1]-a[1]).map(([m,v])=>`
    <div class="vbar-wrap"><div class="vbar-label"><span>${esc(m)}</span><span style="font-family:var(--mono)">${v} series</span></div>
    <div class="vbar"><div class="vfill" style="width:${Math.round(v/mx*100)}%;background:${VC[m]||'#4f8ef7'}"></div></div></div>`).join('');
  // Weekly chart filtered
  const aw={};
  sessions.forEach(s=>{
    const wk=wkLabel(new Date(s.date));
    s.exercises?.forEach(e=>{
      const m=normMuscle(e.muscle);
      if(selSet&&!selSet.has(m))return;
      if(!aw[wk])aw[wk]={};
      aw[wk][m]=(aw[wk][m]||0)+(e.sets?.filter(isWorkSet).length||0);
    });
  });
  // Always show last 8 calendar weeks, padding with zeros if no data
  const now8=new Date();
  const week8Labels=[];
  for(let i=7;i>=0;i--){const d=new Date(now8);d.setDate(d.getDate()-i*7);week8Labels.push(wkLabel(d));}
  // Deduplicate but keep order
  const weeks=[...new Set(week8Labels)];
  const muscles=selSet?[...selSet]:[...new Set(sessions.flatMap(s=>s.exercises?.map(e=>normMuscle(e.muscle))||[]))];
  if(vChart){vChart.destroy();vChart=null;}
  if(weeks.length){
    vChart=new Chart(document.getElementById('volChart'),{type:'bar',plugins:[volBandsPlugin],data:{labels:weeks,datasets:muscles.map(m=>({label:m,data:weeks.map(w=>aw[w]?.[m]||0),backgroundColor:(VC[m]||'#4f8ef7')+'CC',borderRadius:3,borderColor:(VC[m]||'#4f8ef7'),borderWidth:0}))},options:{responsive:true,maintainAspectRatio:false,plugins:{volBands:{lm},legend:{display:true,position:'bottom',labels:{color:'#999',boxWidth:10,boxHeight:10,font:{size:9,family:'DM Mono'},padding:6}}},scales:{x:{stacked:true,grid:{display:false},ticks:{color:'#555',font:{size:10,family:'DM Mono'}}},y:{stacked:true,suggestedMax:lm?lm.mrv+3:undefined,grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:10,family:'DM Mono'}}}}}});
  }
}
let volSel=new Set();
function volToggle(m){
  if(m==='all'){volSel.clear();}
  else{volSel.has(m)?volSel.delete(m):volSel.add(m);}
  document.querySelectorAll('#vol-muscle-chips .mf').forEach(el=>{
    const dm=el.dataset.m;
    el.classList.toggle('on',dm==='all'?volSel.size===0:volSel.has(dm));
  });
  renderVol();
}
function getWk(d){const s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);}
function wkLabel(d){return d.getFullYear()+'-S'+String(getWk(d)).padStart(2,'0');}

// ═══ PROFILE SCREEN ═══
function renderProfileScr(){
  const wd=document.getElementById('weight-date');
  if(!wd.value)wd.value=todayStr();
  const md=document.getElementById('measure-date');
  if(!md.value)md.value=todayStr();
  // Profile stats
  // Last weekly average
  const _weights=db.weights||[];
  let lastWeight=null;
  if(_weights.length){
    const byWeek8={};
    _weights.forEach(w=>{const wk='S'+getWk(new Date(w.date));if(!byWeek8[wk])byWeek8[wk]=[];byWeek8[wk].push(w.kg);});
    const lastWk=Object.keys(byWeek8).sort().pop();
    if(lastWk){const arr=byWeek8[lastWk];lastWeight=Math.round(arr.reduce((a,b)=>a+b,0)/arr.length*10)/10;}
  }
  const height=db.profile?.height||null;
  document.getElementById('stat-height').textContent=height?height+'':'—';
  document.getElementById('stat-weight').textContent=lastWeight?lastWeight+'':'—';
  // Compute body fat from most recent measure with JP data
  const lastBF=getLastBodyFat();
  document.getElementById('stat-bodyfat').textContent=lastBF!=null?lastBF+'%':'—';
  const uname=db.profile?.username||'Sin nombre';
  document.getElementById('profile-name-display').textContent=uname;
  const sexEl=document.getElementById('profile-sex');
  const ageEl=document.getElementById('profile-age');
  if(sexEl&&db.profile?.sex)sexEl.value=db.profile.sex;
  if(ageEl&&db.profile?.age)ageEl.value=db.profile.age;
  renderWeightChart();renderMeasuresHistory();renderBFChart();renderPeriChart();
}
async function editUsername(){
  const cur=db.profile?.username||'';
  const v=await dlgPrompt('Nombre de perfil:',cur);
  if(v===null) return;
  if(!db.profile) db.profile={};
  db.profile.username=v.trim()||'Sin nombre';
  saveDB();
  document.getElementById('profile-name-display').textContent=db.profile.username;
  toast('Nombre actualizado ✓');
}
function saveProfileMeta(){
  if(!db.profile)db.profile={};
  const sex=document.getElementById('profile-sex')?.value;
  const age=parseInt(document.getElementById('profile-age')?.value);
  if(sex)db.profile.sex=sex;
  if(!isNaN(age)&&age>0)db.profile.age=age;
  saveDB();
}
async function editHeight(){
  const hv=await dlgPrompt('Altura (cm):',db.profile?.height||'');
  const h=hv;
  if(h===null)return;
  const v=parseInt(h);
  if(isNaN(v)||v<100||v>250){toast('Altura no válida');return;}
  if(!db.profile)db.profile={};
  db.profile.height=v;saveDB();renderProfileScr();toast('Altura actualizada');
}
function getLastBodyFat(){
  const measures=(db.measures||[]).filter(m=>m.bf!=null);
  return measures.length?measures[measures.length-1].bf:null;
}

// ═══ WEIGHT ═══
function setWeightView(v){weightView=v;document.getElementById('weight-view-daily').className='mf'+(v==='daily'?' on':'');document.getElementById('weight-view-weekly').className='mf'+(v==='weekly'?' on':'');renderWeightChart();}
async function saveWeight(){
  const kg=parseFloat(document.getElementById('weight-inp').value);
  const date=document.getElementById('weight-date').value;
  if(!kg||!date){toast('Introduce kg y fecha');return;}
  db.weights=db.weights||[];
  const idx=db.weights.findIndex(w=>w.date===date);
  if(idx>=0)db.weights[idx].kg=kg;else db.weights.push({date,kg});
  db.weights.sort((a,b)=>a.date.localeCompare(b.date));
  saveDB();renderWeightChart();renderProfileScr();toast('Peso guardado ✓');
  document.getElementById('weight-inp').value='';
}
// editWeightEntry and deleteWeightEntry defined in EDIT MODALS section
function renderWeightChart(){
  const weights=[...(db.weights||[])].sort((a,b)=>a.date.localeCompare(b.date));
  const histDiv=null; // removed — use openWeightEdit() modal
  if(!weights.length){if(wChart){wChart.destroy();wChart=null;}if(histDiv)histDiv.innerHTML='';return;}
  let labels,data;
  if(weightView==='daily'){const last60=weights.slice(-60);labels=last60.map(w=>fmtDate(w.date));data=last60.map(w=>w.kg);}
  else{const byWeek={};weights.forEach(w=>{const wk='S'+getWk(new Date(w.date));if(!byWeek[wk])byWeek[wk]=[];byWeek[wk].push(w.kg);});const wks=Object.keys(byWeek).slice(-12);labels=wks;data=wks.map(wk=>Math.round(byWeek[wk].reduce((a,b)=>a+b,0)/byWeek[wk].length*10)/10);}
  if(wChart){wChart.destroy();wChart=null;}
  wChart=new Chart(document.getElementById('weightChart'),{type:'line',data:{labels,datasets:[{label:'kg',data,borderColor:'#34d399',backgroundColor:'rgba(52,211,153,0.08)',borderWidth:2,pointRadius:3,pointBackgroundColor:'#34d399',fill:true,tension:.3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:10,family:'DM Mono'}}},x:{grid:{display:false},ticks:{color:'#555',font:{size:10,family:'DM Mono'},maxRotation:45,autoSkip:true,maxTicksLimit:8}}}}});
  // weight history list removed — use openWeightEdit() modal instead
}

// ═══ MEASURES & SKINFOLDS ═══
function setMeasureTab(tab){
  measureTab=tab;
  ['jp3','jp4','jp7'].forEach(t=>{
    const panel=document.getElementById('panel-'+t+'-comp');
    if(panel) panel.style.display=t===tab?'block':'none';
    const el=document.getElementById('tab-'+t);
    if(el) el.className='method-tab'+(t===tab?' on':'');
  });
}
function getWeekLabel(dateStr){
  const d=dateStr?new Date(dateStr):new Date();
  return `${d.getFullYear()}-W${String(getWk(d)).padStart(2,'0')}`;
}
async function saveMeasures(){
  const dateStr=document.getElementById('measure-date')?.value||todayStr();
  const wk=getWeekLabel(dateStr);
  const entry={week:wk,date:dateStr};
  let any=false;
  // Perímetros
  PERI_FIELDS.forEach(f=>{const v=parseFloat(document.getElementById('m-'+f)?.value);if(!isNaN(v)&&v>0){entry[f]=v;any=true;}});
  // JP pliegues
  let bf=null;
  if(measureTab==='jp3'){const v=calcJP3();if(v){entry.jp3=[document.getElementById('jp3-p1').value,document.getElementById('jp3-p2').value,document.getElementById('jp3-p3').value].map(Number);entry.bf=v;bf=v;any=true;}}
  else if(measureTab==='jp4'){const v=calcJP4();if(v){entry.jp4=[1,2,3,4].map(i=>+document.getElementById('jp4-p'+i).value);entry.bf=v;bf=v;any=true;}}
  else if(measureTab==='jp7'){const v=calcJP7();if(v){entry.jp7=[1,2,3,4,5,6,7].map(i=>+document.getElementById('jp7-p'+i).value);entry.bf=v;bf=v;any=true;}}
  if(!any){toast('Introduce al menos una medida');return;}
  db.measures=db.measures||[];
  const idx=db.measures.findIndex(m=>m.week===wk);
  if(idx>=0)db.measures[idx]={...db.measures[idx],...entry};else db.measures.push(entry);
  db.measures.sort((a,b)=>a.week.localeCompare(b.week));
  await saveMeasureRemote(entry);renderMeasuresHistory();renderBFChart();
  if(bf)document.getElementById('stat-bodyfat').textContent=bf+'%';
  toast('Medidas guardadas ✓');
  PERI_FIELDS.forEach(f=>{const el=document.getElementById('m-'+f);if(el)el.value='';});
}
function renderMeasuresHistory(){
  const div=document.getElementById('measures-history');
  const measures=(db.measures||[]).slice(-8).reverse();
  if(!measures.length){div.innerHTML='<div style="font-size:11px;color:var(--t3);padding-top:8px">Sin registros aún</div>';return;}
  div.innerHTML='<div class="stitle">Historial de medidas</div>'+measures.map(m=>{
    const periStr=PERI_FIELDS.filter(f=>m[f]).map(f=>`${PERI_LABELS[f]}: ${m[f]}`).join(' · ');
    const bfStr=m.bf!=null?` · BF: ${m.bf}%`:'';
    return `<div class="mh-row"><span class="mh-date">${m.date?fmtFull(m.date):m.week}</span><span class="mh-vals">${periStr}${bfStr}</span></div>`;
  }).join('');
}

// ═══ BODY FAT CHART ═══
function renderBFChart(){
  const bfData=(db.measures||[]).filter(m=>m.bf!=null).sort((a,b)=>(a.date||a.week).localeCompare(b.date||b.week));
  if(!bfData.length){if(bfChart){bfChart.destroy();bfChart=null;}return;}
  if(bfChart){bfChart.destroy();bfChart=null;}
  bfChart=new Chart(document.getElementById('bfChart'),{type:'line',data:{
    labels:bfData.map(m=>m.week),
    datasets:[{label:'% graso',data:bfData.map(m=>m.bf),borderColor:'#fb923c',backgroundColor:'rgba(251,146,60,0.08)',borderWidth:2,pointRadius:4,pointBackgroundColor:'#fb923c',fill:true,tension:.3}]
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:10,family:'DM Mono'},callback:v=>v.toFixed(1)+'%'}},x:{grid:{display:false},ticks:{color:'#555',font:{size:10,family:'DM Mono'},maxRotation:45,autoSkip:true,maxTicksLimit:8}}}}});
}

// ═══ FULL SUPABASE SYNC (used after backup restore) ═══
async function syncAllToSupabase(){
  if(!useSupabase||!sbClient||!supabaseUser) return;
  const uid=supabaseUser.id;
  try{
    // 1. Profile + templates
    await sbClient.from('profiles').upsert({
      id:uid,height:db.profile?.height,sex:db.profile?.sex||'male',
      age:db.profile?.age||30,templates:db.templates,updated_at:new Date().toISOString()
    });

    // 2. Sessions — upsert all
    const sessRows=(db.sessions||[]).map(s=>({
      id:s.id,user_id:uid,date:s.date,name:s.name,day_name:s.dayName,exercises:s.exercises
    }));
    if(sessRows.length){
      // Upsert in batches of 50 to avoid request size limits
      for(let i=0;i<sessRows.length;i+=50){
        await sbClient.from('sessions').upsert(sessRows.slice(i,i+50));
      }
    }

    // 3. Weights
    const wRows=(db.weights||[]).map(w=>({user_id:uid,date:w.date,kg:w.kg}));
    if(wRows.length) await sbClient.from('weights').upsert(wRows);

    // 4. Steps
    const sRows=(db.steps||[]).map(s=>({user_id:uid,date:s.date,steps:s.steps}));
    if(sRows.length) await sbClient.from('steps').upsert(sRows);

    // 5. Measures
    const mRows=(db.measures||[]).map(m=>({user_id:uid,week:m.week,date:m.date,data:m}));
    if(mRows.length) await sbClient.from('measures').upsert(mRows);

    console.log('Full sync to Supabase complete');
  }catch(err){
    console.error('Sync error:',err);
    toast('Error al sincronizar — datos guardados localmente');
  }
}

// ═══ BACKUP / RESTORE ═══
function exportJSON(){const data={profile,db,exported:new Date().toISOString()};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`GymTracker_${profile}_backup_${todayStr()}.json`;a.click();URL.revokeObjectURL(url);toast('Backup descargado ✓');}
function triggerImportJSON(){document.getElementById('import-json-input').value='';document.getElementById('import-json-input').click();}
async function importJSON(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=async(e)=>{
  try{
    const data=JSON.parse(e.target.result);
    if(!data.db||!data.db.sessions){toast('Archivo no válido');return;}
    if(!await dlgConfirm(`¿Restaurar backup con ${data.db.sessions.length} sesiones? Se sobreescribirán los datos actuales.`))return;
    db=data.db;
    saveDB();
    if(useSupabase&&sbClient&&supabaseUser){
      toast('Sincronizando…');
      await syncAllToSupabase();
    }
    renderCal();renderDayPanel();renderProfileScr();
    toast(`Restaurado: ${data.db.sessions.length} sesiones ✓`);
  }catch(err){console.error(err);toast('Error al leer el archivo');}
};reader.readAsText(file);}

// ═══ EXPORT XLSX ═══
function exportXLSX(){
  if(typeof XLSX==='undefined'){toast('Error: XLSX no disponible');return;}
  const sessions=db.sessions||[];if(!sessions.length){toast('Sin datos');return;}
  const rows=[['Fecha','Sesión','Ejercicio','Músculo','Serie','KG','Reps','RPE','e1RM (kg)','Notas']];
  sessions.forEach(s=>{(s.exercises||[]).forEach(ex=>{(ex.sets||[]).forEach((set,si)=>{if(set.kg||set.reps){const rm=calcE1RM(set.kg,set.reps,set.rpe);rows.push([s.date,s.name||s.dayName,ex.name,ex.muscle||'',si+1,set.kg||'',set.reps||'',set.rpe||'',rm||'',ex.notes||'']);}});});});
  const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:12},{wch:12},{wch:40},{wch:16},{wch:6},{wch:7},{wch:7},{wch:7},{wch:12},{wch:30}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,'Historial',ws);
  const exMap={};sessions.forEach(s=>{(s.exercises||[]).forEach(ex=>{if(!exMap[ex.name])exMap[ex.name]={name:ex.name,muscle:ex.muscle,count:0,maxRM:0};exMap[ex.name].count++;if(ex.best_e1rm)exMap[ex.name].maxRM=Math.max(exMap[ex.name].maxRM,ex.best_e1rm);});});
  XLSX.utils.book_append_sheet(wb,'Resumen',XLSX.utils.aoa_to_sheet([['Ejercicio','Músculo','Sesiones','Mejor e1RM (kg)'],...Object.values(exMap).map(e=>[e.name,e.muscle,e.count,e.maxRM||''])]));
  XLSX.writeFile(wb,`GymTracker_${profile}_${todayStr()}.xlsx`);toast('Descargando Excel…');
}

// ═══ QUICK START ═══
function openQuickStart(){
  const list=document.getElementById('quickstart-list');
  let html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">';
  (db.templates||[]).forEach(t=>{
    html+=`<div onclick="startFromTmpl('${t.id}');closeQuickStart()" style="background:var(--s2);border:1px solid var(--b1);border-radius:var(--r);padding:12px;cursor:pointer;font-size:13px;font-weight:500;transition:border-color .15s" onmouseover="this.style.borderColor='var(--blue)'" onmouseout="this.style.borderColor='var(--b1)'">${esc(t.name)}</div>`;
  });
  html+='</div>';
  html+=`<div style="display:flex;gap:8px;margin-top:4px">
    <button onclick="startBlank();closeQuickStart()" style="flex:1;padding:12px;background:transparent;border:1px dashed var(--b2);border-radius:var(--r);color:var(--t3);font-size:13px;cursor:pointer;font-family:var(--font)">+ En blanco</button>
    <button onclick="createNewRoutine();closeQuickStart()" style="flex:1;padding:12px;background:transparent;border:1px solid var(--blue);border-radius:var(--r);color:var(--blue);font-size:13px;cursor:pointer;font-family:var(--font)">+ Nueva rutina</button>
  </div>`;
  list.innerHTML=html;
  document.getElementById('ov-quickstart').classList.add('on');
}
function closeQuickStart(e){
  if(!e||e.target===document.getElementById('ov-quickstart'))
    document.getElementById('ov-quickstart').classList.remove('on');
}
async function createNewRoutine(){
  const name=await dlgPrompt('Nombre de la nueva rutina:','Mi rutina');
  if(!name||!name.trim()) return;
  const newTmpl={id:'tmpl_'+Date.now(),name:name.trim(),exercises:[]};
  db.templates=db.templates||[];
  db.templates.push(newTmpl);
  saveDB();
  // Open the edit modal for the new template
  openEditTmpl(newTmpl.id);
  renderDayPanel();
  toast('Rutina creada — añade ejercicios');
}
