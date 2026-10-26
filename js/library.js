// library.js — Biblioteca de ejercicios, editor de ejercicios y gráfica de progreso (e1RM).
// ═══ STATS TABS ═══
let statsTab='prog', bibMFilter='all', bibEqFilter='all';
let pendingBibOpenName=null;
function goToExInBiblioteca(name){
  pendingBibOpenName=name;bibMFilter='all';bibEqFilter='all';
  const search=document.getElementById('bib-search');if(search)search.value='';
  document.querySelectorAll('#bib-muscle-filters .mf').forEach(el=>el.classList.toggle('on',el.textContent==='Todos'));
  document.querySelectorAll('#bib-eq-filters .mf').forEach(el=>el.classList.toggle('on',el.textContent==='Todos'));
  navTo('perfil');
  setTimeout(()=>{document.getElementById('bib-list')?.scrollIntoView({behavior:'smooth',block:'start'});},50);
}
function setStatsTab(tab){if(tab==='bib'){navTo('perfil');}else if(tab==='vol'){navTo('vol');}else{renderProg();}}
function renderBibliotecaInit(){
  const mf=document.getElementById('bib-muscle-filters');
  if(mf&&!mf.innerHTML){
    mf.innerHTML=`<div class="mf on" onclick="setBibFilter('all')">Todos</div>`+MUSCLES.map(m=>`<div class="mf" onclick="setBibFilter('${m}')">${m}</div>`).join('');
  }
  const ef=document.getElementById('bib-eq-filters');
  if(ef&&!ef.innerHTML){
    ef.innerHTML=`<div class="mf on" onclick="setBibEqFilter('all')">Todos</div>`+['Peso libre','Poleas','Máquina'].map(eq=>`<div class="mf" onclick="setBibEqFilter('${eq}')">${eq}</div>`).join('');
  }
  renderBiblioteca();
}
function setBibEqFilter(eq){
  bibEqFilter=eq;
  document.querySelectorAll('#bib-eq-filters .mf').forEach(el=>el.classList.toggle('on',el.textContent===(eq==='all'?'Todos':eq)));
  renderBiblioteca();
}
function setBibFilter(m){
  bibMFilter=m;
  document.querySelectorAll('#bib-muscle-filters .mf').forEach(el=>el.classList.toggle('on',el.textContent===(m==='all'?'Todos':m)));
  renderBiblioteca();
}
function renderBiblioteca(){
  const search=(document.getElementById('bib-search')?.value||'').toLowerCase().trim();
  const list=ALL_EX.filter(e=>{
    const mOk=bibMFilter==='all'||e.muscle===bibMFilter;
    const eqOk=bibEqFilter==='all'||e.equipment===bibEqFilter;
    const sOk=!search||e.name.toLowerCase().includes(search)||e.muscle.toLowerCase().includes(search);
    return mOk&&eqOk&&sOk;
  });
  bibLast=list;
  const mc_map=MC;
  document.getElementById('bib-list').innerHTML=list.length
    ?list.map((e,i)=>{
      const mc=mc_map[e.muscle]||['#1e1e1e','#9ca3af'];
      const eqIcon={'Poleas':'⚙️','Máquina':'🔩','Peso libre':'🏋️'}[e.equipment]||'';
      const cuesHtml=(e.cues||[]).map(c=>`<li style="margin-bottom:3px">${esc(c)}</li>`).join('');
      return `<div style="border:1px solid var(--b1);border-radius:var(--rl);margin-bottom:8px;overflow:hidden">
        <div onclick="toggleBibCard(${i})" style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;background:var(--s1)">
          ${thumbHtml(e.name,'exthumb sm')}
          <div style="flex:1;font-size:13px;font-weight:600">${esc(e.name)}</div>
          <span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:6px;background:${mc[0]};color:${mc[1]};font-family:var(--mono);flex-shrink:0">${esc(e.muscle)}</span>
          ${eqIcon?`<span style="font-size:11px">${eqIcon}</span>`:''}
        </div>
        <div id="bibcard-${i}" style="display:none;padding:10px 12px;border-top:1px solid var(--b1);background:var(--bg)">
          ${(()=>{const g=getGif(e.name);return g?`<img class="gif-hero" src="${gifUrl(g)}" loading="lazy" alt="" data-gifn="${esc(e.name)}" onclick="openGif(this.dataset.gifn)"><div class="gif-attr">${esc(g.n)} · © <a href="https://gymvisual.com/" target="_blank" rel="noopener">Gym visual</a> · <a href="#" onclick="openGifPick('${esc(e.name).replace(/'/g,"\\'")}');return false">cambiar</a></div>`:`<div class="gif-attr"><a href="#" onclick="openGifPick('${esc(e.name).replace(/'/g,"\\'")}');return false">＋ Asignar animación</a></div>`;})()}
          ${e.reps?`<div style="font-size:11px;color:var(--amber);font-family:var(--mono);margin-bottom:8px">⭐ ${esc(e.reps)}</div>`:''}
          ${e.description?`<div style="font-size:11px;color:var(--t3);font-family:var(--mono);margin-bottom:4px;text-transform:uppercase;letter-spacing:.6px">Descripción</div><div style="font-size:12px;color:var(--t2);margin-bottom:10px;line-height:1.5">${esc(e.description)}</div>`:''}
          ${e.execution?`<div style="font-size:11px;color:var(--t3);font-family:var(--mono);margin-bottom:4px;text-transform:uppercase;letter-spacing:.6px">Realización</div><div style="font-size:12px;color:var(--t2);margin-bottom:10px;line-height:1.5">${esc(e.execution)}</div>`:''}
          ${cuesHtml?`<div style="font-size:11px;color:var(--t3);font-family:var(--mono);margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px">Claves</div><ul style="font-size:12px;color:var(--t2);padding-left:16px;line-height:1.6">${cuesHtml}</ul>`:''}
          <button onclick="bibAddToSession(${i})" style="margin-top:10px;width:100%;padding:8px;background:var(--bluedim);border:1px solid var(--blue);border-radius:8px;color:var(--blue);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">+ Añadir a sesión activa</button>
          <button onclick="bibAddToTmpl(${i})" style="margin-top:6px;width:100%;padding:8px;background:var(--s2);border:1px solid var(--b1);border-radius:8px;color:var(--t2);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">+ Añadir a rutina existente</button>
          <button onclick="openExEditor('${i}')" style="margin-top:6px;width:100%;padding:8px;background:transparent;border:1px dashed var(--b2);border-radius:8px;color:var(--t3);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)">✎ Editar descripción</button>
          <div id="bibtmpl-${i}" style="display:none;margin-top:6px"></div>
        </div>
      </div>`;
    }).join('')
    :'<div style="color:var(--t3);text-align:center;padding:24px;font-size:13px">Sin resultados</div>';
  if(pendingBibOpenName){
    const idx=list.findIndex(e=>e.name===pendingBibOpenName);
    pendingBibOpenName=null;
    if(idx>=0){
      const card=document.getElementById('bibcard-'+idx);
      if(card){card.style.display='block';setTimeout(()=>card.closest('div[style*="overflow:hidden"]')?.scrollIntoView({behavior:'smooth',block:'center'}),50);}
    }
  }
}
function toggleBibCard(i){
  const el=document.getElementById('bibcard-'+i);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}
let exEditorIdx=null,exedSec=null; // exedSec: null = automáticos · array = elegidos a mano en este editor
// Secundarios del editor: se calculan solos según nombre + músculo principal hasta que los toques
function exedCur(){
  const name=document.getElementById('exed-name').value.trim(),m=document.getElementById('exed-muscle').value;
  return exedSec?exedSec.filter(x=>x!==PPCore.normMuscle(m)):PPCore.secondaryFor(db.profile,name,m);
}
function exedRefreshSec(){
  const m=PPCore.normMuscle(document.getElementById('exed-muscle').value),cur=exedCur();
  document.getElementById("exed-sec").innerHTML=PPCore.MUSCLES.filter(x=>PPCore.normMuscle(x)!==m).map(x=>`<button type="button" class="exv-mchip${cur.includes(x)?' on':''}" data-m="${esc(x)}" onclick="exedToggleSec(this.dataset.m)">${cur.includes(x)?'✓ ':''}${esc(x)}</button>`).join('');
  document.getElementById('exed-sec-note').textContent=exedSec?'Elegidos por ti':cur.length?'Sugeridos según el nombre y el músculo principal; toca para cambiarlos':'Ninguno: este nombre no encaja con ninguna regla automática. Marca los que trabaja si quieres que cuenten';
}
function exedToggleSec(m){const cur=exedCur();exedSec=cur.includes(m)?cur.filter(x=>x!==m):[...cur,m];exedRefreshSec();}
function exedSaveSec(name){
  if(!exedSec||!name)return;
  db.profile=db.profile||{};db.profile.secMap=db.profile.secMap||{};
  db.profile.secMap[normExName(name)]=exedCur();saveDB();
}
function openExEditor(i,prefillName){
  exEditorIdx=i===null?null:Number(i);
  const isNew=exEditorIdx===null;
  document.getElementById('ex-editor-title').textContent=isNew?'Nuevo ejercicio':'Editar ejercicio';
  const msel=document.getElementById('exed-muscle');
  msel.innerHTML=MUSCLES.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('');
  const nameInp=document.getElementById('exed-name');
  if(isNew){
    nameInp.value=prefillName||'';nameInp.disabled=false;
    msel.value=(pickerCreating&&mFilter!=='all'&&MUSCLES.includes(mFilter))?mFilter:(MUSCLES[0]||'');
    document.getElementById('exed-equipment').value=(pickerCreating&&pickerEqFilter!=='all')?pickerEqFilter:'Peso libre';
    document.getElementById('exed-reps').value='';
    document.getElementById('exed-description').value='';
    document.getElementById('exed-execution').value='';
    document.getElementById('exed-cues').value='';
  }else{
    const e=bibLast[exEditorIdx];
    nameInp.value=e.name;nameInp.disabled=true;
    msel.value=e.muscle;
    document.getElementById('exed-equipment').value=e.equipment||'Peso libre';
    document.getElementById('exed-reps').value=e.reps||'';
    document.getElementById('exed-description').value=e.description||'';
    document.getElementById('exed-execution').value=e.execution||'';
    document.getElementById('exed-cues').value=(e.cues||[]).join('\n');
  }
  exedSec=null;exedRefreshSec();
  document.getElementById('ov-ex-editor').classList.add('on');
}
function closeExEditor(e){if(!e||e.target===document.getElementById('ov-ex-editor')){document.getElementById('ov-ex-editor').classList.remove('on');pickerCreating=false;}}
async function saveExEditor(){
  const isNew=exEditorIdx===null;
  const fromPicker=pickerCreating;
  const btn=document.getElementById('exed-save-btn');
  if(isNew){
    const name=document.getElementById('exed-name').value.trim();
    if(!name){toast('Escribe un nombre');return;}
    const muscle=document.getElementById('exed-muscle').value;
    const equipment=document.getElementById('exed-equipment').value;
    const reps=document.getElementById('exed-reps').value.trim();
    const description=document.getElementById('exed-description').value.trim();
    const execution=document.getElementById('exed-execution').value.trim();
    const cues=document.getElementById('exed-cues').value.split('\n').map(c=>c.trim()).filter(Boolean);
    const num=ALL_EX.filter(e=>e.muscle===muscle).length+1;
    const row={name,muscle,equipment,reps,description,execution,cues,num};
    if(sbClient){
      btn.textContent='Guardando...';btn.disabled=true;
      const{error}=await sbClient.from('exercises').insert(row);
      btn.textContent='Guardar';btn.disabled=false;
      if(error){toast('Error al guardar: '+error.message);return;}
    }
    exedSaveSec(name);
    ALL_EX.push({name,muscle,equipment,reps,description,execution,cues});
    if(!MUSCLES.includes(muscle))MUSCLES.push(muscle);
    toast('Ejercicio añadido ✓');
    if(fromPicker)selectEx(name,muscle); // lo añade/sustituye en la rutina y cierra el selector
  }else{
    const e=bibLast[exEditorIdx];
    const description=document.getElementById('exed-description').value.trim();
    const execution=document.getElementById('exed-execution').value.trim();
    const cues=document.getElementById('exed-cues').value.split('\n').map(c=>c.trim()).filter(Boolean);
    if(sbClient){
      btn.textContent='Guardando...';btn.disabled=true;
      const{error}=await sbClient.from('exercises').update({description,execution,cues}).in('name',PPCore.exNameAliases(e.name));
      btn.textContent='Guardar';btn.disabled=false;
      if(error){toast('Error al guardar: '+error.message);return;}
    }
    const orig=ALL_EX.find(x=>x.name===e.name);
    if(orig){orig.description=description;orig.execution=execution;orig.cues=cues;}
    exedSaveSec(e.name);
    toast('Ejercicio actualizado ✓');
  }
  closeExEditor();renderBiblioteca();
}
let bibLast=[];
function bibAddToSession(i){
  const e=bibLast[i];if(!e)return;
  if(!activeSess){toast('No hay sesión activa');return;}
  activeSess.exercises.push({name:e.name,muscle:e.muscle,notes:'',sets:[{kg:null,reps:null,rpe:null,done:false},{kg:null,reps:null,rpe:null,done:false},{kg:null,reps:null,rpe:null,done:false}]});
  toast(`${e.name} añadido ✓`);
}
function bibAddToTmpl(i){
  const box=document.getElementById('bibtmpl-'+i);if(!box)return;
  if(box.style.display!=='none'){box.style.display='none';return;}
  const tmpls=db.templates||[];
  box.innerHTML=tmpls.length
    ?tmpls.map(t=>`<button onclick="bibAddToTmplDo(${i},'${t.id}')" style="width:100%;margin-bottom:4px;padding:7px;background:var(--bg);border:1px solid var(--b1);border-radius:6px;color:var(--t1);font-size:12px;cursor:pointer;font-family:var(--font);text-align:left">📋 ${esc(t.name)}</button>`).join('')
    :'<div style="color:var(--t3);font-size:12px;text-align:center;padding:8px">No hay rutinas creadas</div>';
  box.style.display='block';
}
function bibAddToTmplDo(i,tid){
  const e=bibLast[i];const t=db.templates?.find(t=>t.id===tid);
  if(!e||!t)return;
  t.exercises.push({name:e.name,muscle:e.muscle,sets:3});
  saveDB();renderDayPanel();
  const box=document.getElementById('bibtmpl-'+i);if(box)box.style.display='none';
  toast(`${e.name} → ${t.name} ✓`);
}
let pts=[];
let progHideFew=false;
function toggleProgHideFew(){
  progHideFew=!progHideFew;
  const btn=document.getElementById('prog-hide-few-btn');
  btn.style.background=progHideFew?'var(--blue)':'var(--s2)';
  btn.style.color=progHideFew?'#fff':'var(--t2)';
  btn.style.borderColor=progHideFew?'var(--blue)':'var(--b1)';
  renderProg();
}
function renderProg(){
  renderProgExtras();
  const counts={};
  (db.sessions||[]).forEach(s=>s.exercises?.forEach(e=>{if(e.best_e1rm)counts[e.name]=(counts[e.name]||0)+1;}));
  let all=new Set(Object.keys(counts));
  (db.sessions||[]).forEach(s=>s.exercises?.forEach(e=>all.add(e.name)));
  if(progHideFew)all=new Set([...all].filter(n=>(counts[n]||0)>3));
  const sel=document.getElementById('prog-sel');
  if(!all.size){document.getElementById('prog-stats').innerHTML='<div class="empty" style="grid-column:1/-1">Sin datos aún</div>';return;}
  const prev=sel.value;
  sel.innerHTML=[...all].sort((a,b)=>a.localeCompare(b,'es')).map(e=>`<option value="${esc(e)}"${e===prev?' selected':''}>${esc(e)}</option>`).join('');
  renderProgChart();
}
function fitProgSel(){const sel=document.getElementById('prog-sel');if(!sel||!sel.options.length)return;const c=fitProgSel._c||(fitProgSel._c=document.createElement('canvas').getContext('2d'));const cs=getComputedStyle(sel);c.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;sel.style.width=Math.ceil(c.measureText(sel.options[sel.selectedIndex]?.text||'').width+4)+'px';}
function renderProgChart(){
  fitProgSel();
  const name=document.getElementById('prog-sel').value;
  pts=[];
  (db.sessions||[]).forEach(s=>{
    const ex=s.exercises?.find(e=>e.name===name);
    if(ex?.best_e1rm){
      let bestSet=null,bestRM=0;
      (ex.sets||[]).forEach(st=>{const rm=calcE1RM(st.kg,st.reps,st.rpe);if(rm&&rm>bestRM){bestRM=rm;bestSet=st;}});
      pts.push({val:ex.best_e1rm,date:s.date,bestSet});
    }
  });
  pts.sort((a,b)=>a.date.localeCompare(b.date));
  const sd=document.getElementById('prog-stats');
  if(!pts.length){sd.innerHTML='<div class="empty" style="grid-column:1/-1">Sin datos</div>';document.getElementById('px-delta').textContent='';return;}
  const best=Math.max(...pts.map(p=>p.val)),last=pts[pts.length-1].val,diff=Math.round((last-pts[0].val)*10)/10;
  const dEl=document.getElementById('px-delta');dEl.textContent=`: ${diff>=0?'+':''}${diff}kg`;dEl.className=diff>=0?'up':'dn';
  sd.innerHTML=`
    <div class="px-tile best"><small>MEJOR 1RM<u>🏆</u></small><div><b>${best}</b><em>kg</em></div><div class="px-note">último ${last} kg</div></div>
    <div class="px-tile prog"><small>PROGRESIÓN<u>↗</u></small><div><b class="${diff>=0?'up':'dn'}">${diff>=0?'+':''}${diff}</b><em>kg</em></div></div>
    <div class="px-tile act"><small>Músculo activado</small>${muscleActiveHtml(name)}</div>`;
  paintMuscleActive(name);
  if(pChart){pChart.destroy();pChart=null;}
  pChart=new Chart(document.getElementById('progChart'),{type:'line',data:{
    labels:pts.map(p=>fmtDate(p.date)),
    datasets:[Object.assign(purpleDS(pts.map(p=>p.val),4.5),{label:'e1RM'})]
  },options:{responsive:true,maintainAspectRatio:false,
    interaction:{mode:'nearest',intersect:false,axis:'x'},
    plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(14,20,36,.96)',titleColor:'#f0f0f0',bodyColor:'#9aa6bd',borderColor:'#2a3550',borderWidth:1,padding:10,
      callbacks:{
        title:(items)=>fmtDate(pts[items[0].dataIndex].date),
        label:(item)=>{const p=pts[item.dataIndex];const lines=[`e1RM: ${p.val} kg`];if(p.bestSet)lines.push(`${p.bestSet.kg}kg × ${p.bestSet.reps}rep${p.bestSet.rpe?' @'+p.bestSet.rpe:''}`);return lines;}
      }
    }},
    scales:{y:(()=>{const ax=niceAxis(pts.map(p=>p.val));return{min:ax.min,max:ax.max,grid:{color:'rgba(255,255,255,.07)'},border:{display:false},ticks:{stepSize:ax.step,callback:v=>Number(v).toFixed(1),color:'#c3cbe0',font:{size:10,family:'DM Mono'}}};})(),x:{grid:{display:false},ticks:{color:'#c3cbe0',font:{size:10,family:'DM Mono'},maxRotation:45,minRotation:45,autoSkip:true,maxTicksLimit:7}}}
  }});
}
