// state.js — Datos estáticos, landmarks, estado global, e1RM, caché de historial y pliegues (Jackson-Pollock).
// ═══ STATIC DATA ═══
// ALL_EX se carga desde Supabase en loadExercisesDB(); fallback a lista vacía
let ALL_EX=[];
let MUSCLES=[];
async function loadExercisesDB(){
  if(!sbClient){return;}
  try{
    const{data,error}=await sbClient.from('exercises').select('name,muscle,equipment,reps,description,execution,cues').order('muscle').order('num');
    if(error||!data?.length)return;
    ALL_EX=data.map(r=>({name:r.name,muscle:r.muscle,equipment:r.equipment||'',reps:r.reps||'',description:r.description||'',execution:r.execution||'',cues:r.cues||[]}));
    MUSCLES=[...new Set(ALL_EX.map(e=>e.muscle))];
  }catch(e){console.warn('exercises load error:',e);}
}
const MC_RAW={'Pectoral':['#1e3a5f','#4f8ef7'],'Espalda':['#0a2e33','#22d3ee'],'Tríceps':['#3a0d0d','#ef4444'],'Bíceps':['#3a1030','#f472b6'],'Glúteos':['#0a2e29','#14b8a6'],'Isquiotibiales':['#1a3010','#86efac'],'Isquiosurales':['#1a3010','#86efac'],'Cuádriceps':['#1a3010','#4ade80'],'Gemelos':['#1e1b4b','#a78bfa'],'Deltoides anterior':['#3d2a00','#fbbf24'],'Deltoides lateral':['#3d2000','#fb923c'],'Hombro posterior':['#36103a','#d946ef'],'Deltoides posterior':['#36103a','#d946ef'],'Sóleo':['#1e1b4b','#a78bfa'],'Aductores':['#1e1e1e','#9ca3af'],'Abductores':['#1e1e1e','#9ca3af']};
const VC_RAW={'Pectoral':'#4f8ef7','Espalda':'#22d3ee','Tríceps':'#ef4444','Bíceps':'#f472b6','Glúteos':'#14b8a6','Isquiotibiales':'#86efac','Isquiosurales':'#86efac','Cuádriceps':'#4ade80','Gemelos':'#a78bfa','Deltoides anterior':'#fbbf24','Deltoides lateral':'#fb923c','Hombro posterior':'#d946ef','Deltoides posterior':'#d946ef','Sóleo':'#7c6ee6','Aductores':'#9ca3af','Abductores':'#6b7280'};
// Lookup insensible a mayúsculas/alias (la tabla exercises usa 'Deltoides Anterior', 'Gemelo/Sóleo', etc.)
function ciProxy(o){return new Proxy(o,{get:(t,k)=>{if(typeof k!=='string'||t[k])return t[k];const lk=k.toLowerCase();const f=Object.keys(t).find(x=>x.toLowerCase()===lk);if(f)return t[f];if(/gemelo|s[oó]leo/.test(lk))return t['Gemelos'];if(/hombro posterior|delt.*poster/.test(lk))return t['Hombro posterior'];if(/isqui/.test(lk))return t['Isquiosurales'];if(/abdom|core/.test(lk))return t['Abdomen'];if(/antebrazo/.test(lk))return t['Antebrazo'];if(/trapecio/.test(lk))return t['Trapecio'];return undefined;}});}
MC_RAW['Abdomen']=['#2a2a10','#e2e8a0'];MC_RAW['Antebrazo']=['#1e2a2a','#94d3c8'];MC_RAW['Trapecio']=['#2a1a10','#f5b28a'];
VC_RAW['Abdomen']='#e2e8a0';VC_RAW['Antebrazo']='#94d3c8';VC_RAW['Trapecio']='#f5b28a';
const MC=ciProxy(MC_RAW),VC=ciProxy(VC_RAW);
// ═══ VOLUME LANDMARKS (MEV/MAV/MRV, series/semana) ═══
// Defaults follow RP-style guidelines; editable per muscle via el botón ⚙ de la
// pestaña Volumen. Overrides live in db.profile.landmarks → sync with the profile.
const DEFAULT_LANDMARKS={
  'Pectoral':{mev:8,mav:16,mrv:22},
  'Espalda':{mev:10,mav:18,mrv:25},
  'Tríceps':{mev:6,mav:12,mrv:18},
  'Bíceps':{mev:8,mav:14,mrv:20},
  'Glúteos':{mev:4,mav:12,mrv:16},
  'Isquiosurales':{mev:6,mav:12,mrv:16},
  'Cuádriceps':{mev:8,mav:14,mrv:20},
  'Gemelos':{mev:8,mav:14,mrv:20},
  'Sóleo':{mev:6,mav:10,mrv:16},
  'Deltoides anterior':{mev:2,mav:8,mrv:12},
  'Deltoides lateral':{mev:8,mav:18,mrv:26},
  'Deltoides posterior':{mev:6,mav:14,mrv:22},
  'Hombro posterior':{mev:6,mav:14,mrv:22},
  'Aductores':{mev:4,mav:8,mrv:12},
  'Abductores':{mev:4,mav:8,mrv:12},
};
function getLandmarks(m){
  const lm={...(DEFAULT_LANDMARKS[m]||{}),...(db.profile?.landmarks?.[m]||{})};
  return(lm.mev!=null&&lm.mav!=null&&lm.mrv!=null&&lm.mev<=lm.mav&&lm.mav<=lm.mrv)?lm:null;
}
function lmZone(total,lm){
  if(total<lm.mev)return{txt:`&lt; MEV`,detail:`${total} de ${lm.mev} mín.`,color:'#4f8ef7'};
  if(total<=lm.mav)return{txt:`MEV–MAV ✓`,detail:`zona productiva`,color:'#34d399'};
  if(total<=lm.mrv)return{txt:`MAV–MRV ⚠`,detail:`alta fatiga`,color:'#fbbf24'};
  return{txt:`&gt; MRV ✕`,detail:`sobre el máximo recuperable`,color:'#f87171'};
}
// Chart.js inline plugin: shaded MEV–MAV / MAV–MRV bands + threshold lines,
// drawn only when exactly one muscle is selected in the chips.
const volBandsPlugin={id:'volBands',beforeDatasetsDraw(chart,args,opts){
  const lm=opts?.lm;if(!lm)return;
  const{ctx,chartArea,scales:{y}}=chart;if(!chartArea||!y)return;
  const{left,right,top,bottom}=chartArea;
  const Y=v=>Math.min(bottom,Math.max(top,y.getPixelForValue(v)));
  ctx.save();
  ctx.beginPath();ctx.rect(left,top,right-left,bottom-top);ctx.clip();
  ctx.fillStyle='rgba(52,211,153,.10)';ctx.fillRect(left,Y(lm.mav),right-left,Y(lm.mev)-Y(lm.mav));
  ctx.fillStyle='rgba(251,191,36,.08)';ctx.fillRect(left,Y(lm.mrv),right-left,Y(lm.mav)-Y(lm.mrv));
  ctx.lineWidth=1;ctx.setLineDash([4,4]);
  const line=(v,c)=>{ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(left,Y(v));ctx.lineTo(right,Y(v));ctx.stroke();};
  line(lm.mev,'rgba(52,211,153,.7)');line(lm.mav,'rgba(251,191,36,.6)');line(lm.mrv,'rgba(248,113,113,.8)');
  ctx.setLineDash([]);
  ctx.font='9px DM Mono';ctx.textAlign='right';
  ctx.fillStyle='rgba(52,211,153,.95)';ctx.fillText('MEV '+lm.mev,right-4,Y(lm.mev)-3);
  ctx.fillStyle='rgba(251,191,36,.95)';ctx.fillText('MAV '+lm.mav,right-4,Y(lm.mav)-3);
  ctx.fillStyle='rgba(248,113,113,.95)';ctx.fillText('MRV '+lm.mrv,right-4,Y(lm.mrv)-3);
  ctx.restore();
}};
function normMuscle(m){return m==='Isquiotibiales'?'Isquiosurales':m;}
const MONTH_ABBR=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function fmtDate(ds){if(!ds)return'';const[y,m,d]=ds.split('-');return `${d}/${m}/${y}`;}
const fmtFull=fmtDate;
// HTML-escape for any user/DB-sourced string interpolated into innerHTML (XSS fix)
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Explicit numeric parse: ''→null (clearable), '0'→0 (valid), missing element→undefined (keep old)
function numVal(el){if(!el)return undefined;const v=String(el.value).trim();if(v==='')return null;const n=parseFloat(v);return isNaN(n)?null:n;}
const DEFAULT_TEMPLATES=[
  {id:'ua',name:'Upper A',exercises:[{name:'Press inclinado en máquina convergente',muscle:'Pectoral',sets:3},{name:'Remo en Máquina Neutro',muscle:'Espalda',sets:3},{name:'Aperturas en polea baja',muscle:'Pectoral',sets:3},{name:'Pullover en polea alta',muscle:'Espalda',sets:3},{name:'Kaz Press',muscle:'Tríceps',sets:3},{name:'Crucifix Curl',muscle:'Bíceps',sets:3}]},
  {id:'lo',name:'Lower',exercises:[{name:'Hip-thrust en máquina',muscle:'Glúteos',sets:3},{name:'PM Rumano con mancuernas',muscle:'Isquiotibiales',sets:3},{name:'Curl femoral sentado',muscle:'Isquiotibiales',sets:3},{name:'Prensa 45º',muscle:'Cuádriceps',sets:3},{name:'Extensión de cuádriceps',muscle:'Cuádriceps',sets:3},{name:'Gemelo de pie',muscle:'Gemelos',sets:3}]},
  {id:'ub',name:'Upper B',exercises:[{name:'Press de hombro en máquina',muscle:'Deltoides anterior',sets:3},{name:'Elevaciones laterales en polea baja',muscle:'Deltoides lateral',sets:4},{name:'Jalón en polea agarre ancho',muscle:'Espalda',sets:3},{name:'Remo en polea baja supino',muscle:'Espalda',sets:3},{name:'Reverse cable cross',muscle:'Hombro posterior',sets:3},{name:'Curl Bayesian',muscle:'Bíceps',sets:3}]},
  {id:'uc',name:'Upper C',exercises:[{name:'Elevaciones laterales en polea baja',muscle:'Deltoides lateral',sets:3},{name:'Press inclinado en MP',muscle:'Pectoral',sets:3},{name:'Chest press en máquina',muscle:'Pectoral',sets:3},{name:'Pullover en polea alta',muscle:'Espalda',sets:3},{name:'Tríceps en polea alta',muscle:'Tríceps',sets:3},{name:'Curl predicador',muscle:'Bíceps',sets:3}]},
];
const PERI_FIELDS=['cuello','brazo','pectoral-p','cintura','ombligo','cadera','cuadriceps'];
const PERI_LABELS={cuello:'Cuello',brazo:'Brazo','pectoral-p':'Pectoral',cintura:'Cintura',ombligo:'Ombligo',cadera:'Cadera',cuadriceps:'Cuádriceps'};

// ═══ STATE ═══
let profile='Adrian',db={},calYear,calMonth,selDate=null;
let activeSess=null,timerSecs=0,timerIv=null,sessStartTs=null;
window.addEventListener('beforeunload',(e)=>{
  if(activeSess&&!activeSess.isTmplEdit){e.preventDefault();e.returnValue='';}
});
let pickerTarget=null,mFilter='all',pickerEqFilter='all';
let pChart=null,vChart=null,wChart=null,bfChart=null;
let dragSrcIdx=null,weightView='daily';
let editTmplId=null,measureTab='perimetros';

// ═══ E1RM ═══
// ═══ e1RM — TUCHSCHERER / RTS TABLE ═══
// %1RM indexed by EFFECTIVE reps (reps + RIR, RIR = 10 − RPE) at 0.5 resolution.
// ER 1–10 is the canonical RTS RPE-10 row; ER 10.5–14 extends it with the classic
// chart's 10-rep row read across RPE 9.5→6 (equivalent under the diagonal identity
// PercentMax(reps,RPE)=REPMAX(reps+10−RPE)) — the standard community extension.
// Beyond 14 effective reps there is no empirical support → return null: high-rep
// burnout sets get honest silence instead of a fictitious PR (the old linear Epley
// happily turned 80 kg × 27 into a 176 kg "e1RM").
const RTS_PCT={1:100,1.5:97.8,2:95.5,2.5:93.9,3:92.2,3.5:90.7,4:89.2,4.5:87.8,5:86.3,5.5:85,6:83.7,6.5:82.4,7:81.1,7.5:79.9,8:78.6,8.5:77.4,9:76.2,9.5:75.1,10:73.9,10.5:72.3,11:70.7,11.5:69.4,12:68,12.5:66.7,13:65.3,13.5:64,14:62.6};
function effReps(reps,rpe){
  // Missing RPE → assume max effort (RIR 0), same semantics as the old calc.
  // RPE clamped to the table's validated 6–10 band.
  const r=(rpe!=null&&rpe>0)?Math.min(10,Math.max(6,rpe)):10;
  return reps+(10-r);
}
function calcE1RM(kg,reps,rpe){
  if(!kg||!reps) return null;
  const er=Math.round(effReps(reps,rpe)*2)/2;
  if(er>14) return null;
  const pct=RTS_PCT[Math.max(1,er)];
  if(!pct) return null;
  return Math.round(kg/(pct/100)*10)/10;
}
// Stored best_e1rm on historical rows was computed with the old Epley formula.
// One in-memory pass on every load keeps the whole series consistent with the
// current estimator (charts, PRs, cache, session detail) without touching remote
// rows — they get persisted naturally whenever a session is edited.
function recalcAllE1RM(){
  (db.sessions||[]).forEach(s=>(s.exercises||[]).forEach(ex=>{
    const rms=(ex.sets||[]).filter(x=>x.kg&&x.reps).map(x=>calcE1RM(x.kg,x.reps,x.rpe)).filter(Boolean);
    ex.best_e1rm=rms.length?Math.max(...rms):null;
  }));
}
function normExName(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');}
// ═══ EXERCISE HISTORY CACHE ═══
// getMaxE1RM() ran on EVERY keystroke and getLastEx() re-sorted all sessions per
// card render — O(full history) each time. Both now read from a cache built in a
// single pass, invalidated whenever db.sessions changes (saveDB/loadDB).
let exCache=null;
function invalidateExCache(){exCache=null;}
function buildExCache(){
  const maxM=new Map(), lastM=new Map();
  // Most-recent-first, same ordering semantics as the old getLastEx
  const sorted=[...(db.sessions||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for(const s of sorted){
    for(const ex of (s.exercises||[])){
      const k=normExName(ex.name);
      if(!lastM.has(k))lastM.set(k,ex);
      let m=maxM.get(k)||0;
      if(ex.best_e1rm&&ex.best_e1rm>m)m=ex.best_e1rm;
      for(const st of (ex.sets||[])){const rm=calcE1RM(st.kg,st.reps,st.rpe);if(rm&&rm>m)m=rm;}
      maxM.set(k,m);
    }
  }
  exCache={maxM,lastM};
}
function getMaxE1RM(exName){
  if(!exCache)buildExCache();
  return exCache.maxM.get(normExName(exName))||null;
}

// ═══ JACKSON-POLLOCK ═══
function calcJP3(){
  const sex=db.profile?.sex||'male';
  const age=db.profile?.age||30;
  const p1=parseFloat(document.getElementById('jp3-p1')?.value)||0;
  const p2=parseFloat(document.getElementById('jp3-p2')?.value)||0;
  const p3=parseFloat(document.getElementById('jp3-p3')?.value)||0;
  if(!p1||!p2||!p3)return null;
  const sum=p1+p2+p3;
  let D;
  if(sex==='male') D=1.10938-(0.0008267*sum)+(0.0000016*sum*sum)-(0.0002574*age);
  else D=1.0994921-(0.0009929*sum)+(0.0000023*sum*sum)-(0.0001392*age);
  return Math.round((495/D-450)*10)/10;
}
function calcJP4(){
  // Durnin & Womersley
  const sex=db.profile?.sex||'male';
  const age=db.profile?.age||30;
  const p1=parseFloat(document.getElementById('jp4-p1')?.value)||0;
  const p2=parseFloat(document.getElementById('jp4-p2')?.value)||0;
  const p3=parseFloat(document.getElementById('jp4-p3')?.value)||0;
  const p4=parseFloat(document.getElementById('jp4-p4')?.value)||0;
  if(!p1||!p2||!p3||!p4)return null;
  const logSum=Math.log10(p1+p2+p3+p4);
  let D;
  if(sex==='male'){
    if(age<17) D=1.1533-(0.0643*logSum);
    else if(age<20) D=1.1620-(0.0630*logSum);
    else if(age<30) D=1.1631-(0.0632*logSum);
    else if(age<40) D=1.1422-(0.0544*logSum);
    else if(age<50) D=1.1620-(0.0700*logSum);
    else D=1.1715-(0.0779*logSum);
  } else {
    if(age<17) D=1.1369-(0.0598*logSum);
    else if(age<20) D=1.1549-(0.0678*logSum);
    else if(age<30) D=1.1599-(0.0717*logSum);
    else if(age<40) D=1.1423-(0.0632*logSum);
    else if(age<50) D=1.1333-(0.0612*logSum);
    else D=1.1339-(0.0645*logSum);
  }
  return Math.round((495/D-450)*10)/10;
}
function calcJP7(){
  const sex=db.profile?.sex||'male';
  const age=db.profile?.age||30;
  const vals=['jp7-p1','jp7-p2','jp7-p3','jp7-p4','jp7-p5','jp7-p6','jp7-p7'].map(id=>parseFloat(document.getElementById(id)?.value)||0);
  if(vals.some(v=>!v)){document.getElementById('jp7-result').textContent='';return null;}
  const sum=vals.reduce((a,b)=>a+b,0);
  let D;
  if(sex==='male') D=1.112-(0.00043499*sum)+(0.00000055*sum*sum)-(0.00028826*age);
  else D=1.097-(0.00046971*sum)+(0.00000056*sum*sum)-(0.00012828*age);
  const bf=Math.round((495/D-450)*10)/10;
  document.getElementById('jp7-result').textContent=`% graso estimado: ${bf}%`;
  return bf;
}
