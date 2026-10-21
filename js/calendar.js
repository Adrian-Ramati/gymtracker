// calendar.js — Calendario mensual con días de gym/descanso, semana y mapa muscular (calor).
// ═══════════════════════════════════════════════════════════════════════
// ═══ PREMIUM: calendario (gym/descanso), dashboard semanal, mapa muscular, GIFs
// ═══════════════════════════════════════════════════════════════════════
function isoDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function mondayOf(ds){const[y,m,d]=ds.split('-').map(Number);const dt=new Date(y,m-1,d);const dow=(dt.getDay()+6)%7;dt.setDate(dt.getDate()-dow);return dt;}
function todayStr(){return isoDate(new Date());}
function restSet(){if(!db.profile)db.profile={};if(!Array.isArray(db.profile.restDays))db.profile.restDays=[];return db.profile.restDays;}
function isRest(ds){
  const today=todayStr();
  if(ds>=today) return restSet().includes(ds);
  return !(db.sessions||[]).some(s=>s.date===ds);
}
function toggleRest(ds){const r=restSet();const i=r.indexOf(ds);if(i>=0)r.splice(i,1);else r.push(ds);saveDB();renderCal();renderDayPanel();renderWeekScr();}
function tmplTag(name){const n=(name||'').trim();if(!n)return'';const w=n.split(/\s+/);return w.length>1?(w[0][0]+w[w.length-1][0]).toUpperCase():n.slice(0,3).toUpperCase();}

// ─── Calendario ──────────────────────────────────────────────────────
function renderCal(){
  const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('cal-month-label').textContent=months[calMonth]+' '+calYear;
  const grid=document.getElementById('cal-grid');
  const dows=['L','M','X','J','V','S','D'];
  let html=dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
  const first=new Date(calYear,calMonth,1);
  const startDow=(first.getDay()+6)%7;
  const days=new Date(calYear,calMonth+1,0).getDate();
  const today=todayStr();
  const byDate={};(db.sessions||[]).forEach(s=>{(byDate[s.date]=byDate[s.date]||[]).push(s);});
  for(let i=0;i<startDow;i++){const d=new Date(calYear,calMonth,-startDow+i+1);html+=`<div class="cal-day other">${d.getDate()}</div>`;}
  for(let d=1;d<=days;d++){
    const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ss=byDate[ds]||[];const rest=isRest(ds);
    const cls=['cal-day',ss.length?'has':'',ss.length>1?'multi':'',rest&&!ss.length?'rest':'',(!ss.length&&!rest&&ds<today)?'pastoff':'',ds===today?'today':'',ds===selDate?'sel':''].filter(Boolean).join(' ');
    const tag=ss.length?`<div class="cal-tag">${esc(ss.length>1?ss.length+'×':tmplTag(ss[0].name))}</div>`:'';
    html+=`<div class="${cls}" onclick="selectDate('${ds}')" title="${ss.map(s=>esc(s.name)).join(', ')}">${d}${tag}</div>`;
  }
  grid.innerHTML=html;
}

// ─── Dashboard semanal ───────────────────────────────────────────────
let dashOff=0,dashWeekChart=null,dashDonut=null;
// Sirve a Semana y Volumen
function dashMove(d){dashOff=Math.min(0,dashOff+d);const c=curScr();if(c==='train'){renderWeekScr();const days=weekRange(dashOff);const[y,m]=days[0].split('-');calYear=+y;calMonth=+m-1;selDate=days[0];renderCal();renderDayPanel();}else renderVolScr();}
function weekRange(off){const mon=mondayOf(todayStr());mon.setDate(mon.getDate()+off*7);const days=[];for(let i=0;i<7;i++){const x=new Date(mon);x.setDate(mon.getDate()+i);days.push(isoDate(x));}return days;}
function weekStats(days){
  const set=new Set(days);const ss=(db.sessions||[]).filter(s=>set.has(s.date));
  const by={},byDirect={};let sets=0,ton=0,min=0;
  ss.forEach(s=>{
    min+=s.durationMin||(typeof estimateSessDuration==='function'?estimateSessDuration(s):0)||0;
    s.exercises?.forEach(e=>{const cr=PPCore.credits(db.profile,e);e.sets?.forEach(st=>{if(st.done||st.kg){ton+=(st.kg||0)*(st.reps||0);if(isWorkSet(st)){sets++;cr.forEach(({m,w})=>{by[m]=(by[m]||0)+w;if(w===1)byDirect[m]=(byDirect[m]||0)+1;});}}});});
  });
  // by: series efectivas (principal 1 + secundarios 0,5) · byDirect: solo series directas
  return{sessions:ss,sets,ton,min,by,byDirect,rest:days.filter(isRest).length};
}
// Serie temporal 8 semanas
function renderDashWeekChart(){
  const labels=[],sets=[],sess=[],bg=[];
  for(let i=-7;i<=0;i++){
    const off=dashOff+i;const days=weekRange(off);const s=weekStats(days);
    const[y,m,d]=days[0].split('-');labels.push(`${+d}/${+m}`);sets.push(s.sets);sess.push(s.sessions.length);
    bg.push(i===0?'#4f7cff':'rgba(79,124,255,.42)');
  }
  const c=document.getElementById('dashWeekChart');if(!c)return;
  if(dashWeekChart)dashWeekChart.destroy();
  dashWeekChart=new Chart(c,{data:{labels,datasets:[
    {type:'bar',label:'Series',data:sets,backgroundColor:bg,borderRadius:6,borderSkipped:false,yAxisID:'y',order:2},
    {type:'line',label:'Sesiones',data:sess,borderColor:'#c084fc',backgroundColor:'#c084fc',pointRadius:3,pointHoverRadius:4,tension:.35,borderWidth:1.5,yAxisID:'y2',order:1}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'bottom',labels:{color:'#777',boxWidth:8,boxHeight:8,font:{size:9,family:'DM Mono'},padding:8}},tooltip:{callbacks:{title:i=>'Semana del '+i[0].label}}},
    scales:{x:{grid:{display:false},ticks:{color:'#555',font:{size:9,family:'DM Mono'}}},
      y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#555',font:{size:9,family:'DM Mono'}},beginAtZero:true},
      y2:{position:'right',grid:{display:false},ticks:{color:'#c084fc',font:{size:9,family:'DM Mono'},stepSize:1},beginAtZero:true,suggestedMax:6}}}});
}
function renderDashDonut(by,total){
  const c=document.getElementById('dashDonut'),lg=document.getElementById('donut-legend');if(!c)return;
  const ent=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  document.getElementById('donut-sub').textContent=total?`${total} series`:'';
  if(dashDonut)dashDonut.destroy();
  if(!ent.length){dashDonut=null;lg.innerHTML='<div style="font-size:11px;color:var(--t3)">Sin series registradas esta semana</div>';c.getContext('2d').clearRect(0,0,c.width,c.height);return;}
  dashDonut=new Chart(c,{type:'doughnut',data:{labels:ent.map(e=>e[0]),datasets:[{data:ent.map(e=>e[1]),backgroundColor:ent.map(e=>VC[e[0]]||'#9ca3af'),borderColor:'#0d0d0f',borderWidth:2,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:{callbacks:{label:i=>` ${i.label}: ${i.raw} series (${Math.round(i.raw/total*100)}%)`}}}}});
  lg.innerHTML=ent.slice(0,9).map(([m,v])=>`<div class="dl-row"><i style="background:${VC[m]||'#9ca3af'}"></i><span>${esc(m)}</span><b>${v}</b><em>${Math.round(v/total*100)}%</em></div>`).join('')+(ent.length>9?`<div class="dl-row"><i style="background:var(--t4)"></i><span>+${ent.length-9} más</span></div>`:'');
}

// ─── Mapa muscular (SVG) ─────────────────────────────────────────────
// Cada región tiene un id; MUSCLE_REGIONS asigna músculos de la app a regiones.
const MUSCLE_REGIONS_RAW={
  'Pectoral':['f-chest'],'Deltoides anterior':['f-deltoids'],'Deltoides lateral':['f-deltoids','b-deltoids'],'Hombro posterior':['b-deltoids'],'Deltoides posterior':['b-deltoids'],
  'Bíceps':['f-biceps'],'Tríceps':['b-triceps','f-triceps'],'Antebrazo':['f-forearm','b-forearm'],'Antebrazos':['f-forearm','b-forearm'],
  'Espalda':['b-upper-back'],'Dorsal':['b-upper-back'],'Trapecio':['b-trapezius','f-trapezius'],'Lumbar':['b-lower-back'],
  'Abdomen':['f-abs'],'Abdominales':['f-abs'],'Core':['f-abs','f-obliques'],'Oblicuos':['f-obliques'],
  'Cuádriceps':['f-quadriceps'],'Isquiosurales':['b-hamstring'],'Isquiotibiales':['b-hamstring'],'Glúteos':['b-gluteal'],
  'Gemelos':['b-calves','f-calves'],'Gemelo/Sóleo':['b-calves','f-calves'],'Sóleo':['b-calves'],'Aductores':['f-adductors','b-adductors'],'Abductores':['b-gluteal'],
};
const MUSCLE_REGIONS=new Proxy(MUSCLE_REGIONS_RAW,{get:(o,k)=>{if(o[k])return o[k];const lk=String(k).toLowerCase();const f=Object.keys(o).find(x=>x.toLowerCase()===lk);if(f)return o[f];if(/gemelo|s[oó]leo/.test(lk))return['b-calves','f-calves'];if(/pectoral|pecho/.test(lk))return['f-chest'];if(/espalda|dorsal/.test(lk))return['b-upper-back'];if(/abd|core/.test(lk))return['f-abs'];return[];}});
// Zona de volumen de cada músculo respecto a sus landmarks (mismos cortes y colores que las barras):
// 0 sin entrenar · 1 por debajo de MEV · 2 MEV–MAV · 3 MAV–MRV (cerca del máximo) · 4 por encima de MRV
const VOL_ZONES=[
  {c:'#343c4f',t:'Sin entrenar'},
  {c:'#4f8ef7',t:'Por debajo de MEV'},
  {c:'#34d399',t:'MEV–MAV'},
  {c:'#fbbf24',t:'Cerca del máximo (MAV–MRV)'},
  {c:'#f43f5e',t:'Por encima de MRV'}];
function volZone(v,lm){
  const mev=lm?.mev??6,mav=lm?.mav??14,mrv=lm?.mrv??20;
  if(!(v>0))return 0;
  if(v<mev)return 1;
  if(v<=mav)return 2;
  if(v<=mrv)return 3;
  return 4;
}
// Pinta una figura: cada región toma la zona más alta de los músculos que la forman
function paintVolFigure(wrap,by){
  const reg={};
  Object.entries(by).forEach(([m,v])=>{const lm=getLandmarks(m)||{};const z=volZone(v,lm);(MUSCLE_REGIONS[m]||[]).forEach(r=>{if(!reg[r]||reg[r].z<z||(reg[r].z===z&&reg[r].v<v))reg[r]={z,m,v,lm};});});
  wrap.querySelectorAll('.body-m').forEach(el=>{
    const r=reg[el.dataset.id];
    el.style.fill=VOL_ZONES[r?r.z:0].c;el.dataset.z=r?r.z:0;
    el.dataset.t=r?`${r.m}: ${f1(r.v)} series · ${VOL_ZONES[r.z].t} (MEV ${r.lm.mev??'–'} / MAV ${r.lm.mav??'–'} / MRV ${r.lm.mrv??'–'})`:'';
  });
  return reg;
}
function volLegendHtml(){return VOL_ZONES.map(z=>`<span><i style="background:${z.c}"></i>${z.t}</span>`).join('');}
