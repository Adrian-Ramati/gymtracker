// exview.js — Ficha completa del ejercicio.
// ─── Ficha completa del ejercicio (GIF sin recortar + máquina + técnica + historial) ───
// Se abre al tocar la miniatura o el nombre de un ejercicio, también durante el entrenamiento,
// sin salir de la sesión.
const EQ_ES={'leverage machine':'Máquina guiada (de palanca)','sled machine':'Prensa / máquina de trineo','smith machine':'Máquina Smith','cable':'Polea','assisted':'Máquina asistida','barbell':'Barra','olympic barbell':'Barra olímpica','ez barbell':'Barra Z','dumbbell':'Mancuernas','kettlebell':'Kettlebell','body weight':'Peso corporal','weighted':'Lastrado','band':'Banda elástica','resistance band':'Banda elástica','stability ball':'Fitball','medicine ball':'Balón medicinal','bosu ball':'Bosu','rope':'Cuerda','trap bar':'Barra hexagonal','roller':'Rodillo','wheel roller':'Rueda abdominal','hammer':'Martillo','tire':'Neumático','elliptical machine':'Elíptica','stationary bike':'Bicicleta estática','skierg machine':'SkiErg','stepmill machine':'Escaladora','upper body ergometer':'Ergómetro de brazos'};
const TGT_ES={'pectorals':'Pectoral','lats':'Dorsales','upper back':'Espalda alta','triceps':'Tríceps','biceps':'Bíceps','glutes':'Glúteos','hamstrings':'Isquiosurales','quads':'Cuádriceps','calves':'Gemelos','delts':'Deltoides','abs':'Abdominales','forearms':'Antebrazos','traps':'Trapecio','adductors':'Aductores','abductors':'Abductores','spine':'Lumbares','serratus anterior':'Serrato','cardiovascular system':'Cardio','levator scapulae':'Elevador de la escápula'};
let exViewName=null,exViewMuscle='',exvSecEdit=false;
function openExView(name){
  if(!name)return;exViewName=name;exvSecEdit=false;renderExView();
  const ov=document.getElementById('ov-exview');ov.classList.add('on');
  const sc=ov.querySelector('.mscroll');if(sc)sc.scrollTop=0;
}
function closeExView(e){const ov=document.getElementById('ov-exview');if(!e||e.target===ov){ov.classList.remove('on');exViewName=null;}}
function exHistory(name,n){
  const k=normExName(name);
  return [...(db.sessions||[])].filter(s=>s.exercises?.some(e=>normExName(e.name)===k))
    .sort((a,b)=>b.date.localeCompare(a.date)||(b.id>a.id?1:-1)).slice(0,n)
    .map(s=>({date:s.date,ex:s.exercises.find(e=>normExName(e.name)===k)}));
}
function toggleSecondary(m){
  if(exViewName==null||!exViewMuscle)return;
  const cur=PPCore.secondaryFor(db.profile,exViewName,exViewMuscle);
  db.profile=db.profile||{};db.profile.secMap=db.profile.secMap||{};
  db.profile.secMap[normExName(exViewName)]=cur.includes(m)?cur.filter(x=>x!==m):[...cur,m];
  saveDB();renderExView();
}
function resetSecondary(){
  if(exViewName==null||!db.profile?.secMap)return;
  delete db.profile.secMap[normExName(exViewName)];saveDB();renderExView();
}
function exvZoom(){const g=getGif(exViewName);if(!g)return;document.getElementById('exv-zoom-img').src=gifUrl(g);document.getElementById('exv-zoom').classList.add('on');}
function renderExView(){
  const name=exViewName;if(name==null)return;
  const k=normExName(name);
  const info=ALL_EX.find(e=>normExName(e.name)===k)||{};
  const live=activeSess?.exercises?.find(e=>normExName(e.name)===k);
  const muscle=info.muscle||live?.muscle||exHistory(name,1)[0]?.ex?.muscle||'';
  exViewMuscle=muscle;
  const g=getGif(name),dn=esc(name);
  document.getElementById('exv-title').textContent=name;
  const mc=MC[muscle]||['#1e1e1e','#9ca3af'];
  let h='';
  if(g)h+=`<div class="exv-media"><img src="${gifUrl(g)}" alt="${esc(g.n)}" onclick="exvZoom()"><button class="exv-zoombtn" onclick="exvZoom()">⤢ Ampliar</button></div><div class="gif-attr">Animación: ${esc(g.n)} · © <a href="https://gymvisual.com/" target="_blank" rel="noopener">Gym visual</a></div>`;
  else h+=`<div class="exv-media exv-none"><span>${GIF_DB?'Sin animación asignada':'Cargando animación…'}</span><button data-n="${dn}" onclick="openGifPick(this.dataset.n)">Elegir animación</button></div>`;
  const chips=[];
  if(g)chips.push(`<span class="exv-chip mach">🏋️ ${esc(EQ_ES[g.e]||g.e)}</span>`);
  if(info.equipment)chips.push(`<span class="exv-chip">${esc(info.equipment)}</span>`);
  if(muscle)chips.push(`<span class="exv-chip" style="background:${mc[0]};color:${mc[1]};border-color:transparent">${esc(muscle)}</span>`);
  if(g&&g.t&&(TGT_ES[g.t]||g.t).toLowerCase()!==String(muscle).toLowerCase())chips.push(`<span class="exv-chip">🎯 ${esc(TGT_ES[g.t]||g.t)}</span>`);
  if(info.reps)chips.push(`<span class="exv-chip">⭐ ${esc(info.reps)}</span>`);
  if(chips.length)h+=`<div class="exv-chips">${chips.join('')}</div>`;
  const sec=(t,b)=>`<div class="exv-sec">${t}</div>${b}`;
  if(info.description)h+=sec('Descripción',`<div class="exv-txt">${esc(info.description)}</div>`);
  if(info.execution)h+=sec('Cómo se hace',`<div class="exv-txt">${esc(info.execution)}</div>`);
  if(info.cues?.length)h+=sec('Claves',`<ul class="exv-cues">${info.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`);
  if(muscle){
    const secM=PPCore.secondaryFor(db.profile,name,muscle),custom=Array.isArray(db.profile?.secMap?.[k]);
    const chip=(m,on)=>`<button class="exv-mchip${on?' on':''}" data-m="${esc(m)}" onclick="toggleSecondary(this.dataset.m)">${on?'✓ ':''}${esc(m)}</button>`;
    const list=exvSecEdit?PPCore.MUSCLES.filter(m=>m!==PPCore.normMuscle(muscle)).map(m=>chip(m,secM.includes(m))).join(''):(secM.map(m=>chip(m,true)).join('')||'<span class="exv-auto">Ninguno</span>');
    h+=sec('Músculos secundarios · cuentan ½ serie',`<div class="exv-sec2">${list}<button class="exv-mchip edit" onclick="exvSecEdit=!exvSecEdit;renderExView()">${exvSecEdit?'Listo':'✎ Editar'}</button></div>
      <div class="exv-auto">${custom?'Personalizados · <a href="#" onclick="resetSecondary();return false">volver a los automáticos</a>':'Asignados automáticamente según el ejercicio'}</div>`);
  }
  let prog=null;try{prog=getProgression(name);}catch(e){}
  const hist=exHistory(name,3),best=getMaxE1RM(name);
  if(hist.length||prog){
    let hb='';
    if(prog)hb+=`<div class="prog-hint ${prog.action}" style="cursor:default">${prog.action==='hold'?'→':'↑'} ${esc(prog.msg)}</div>`;
    hb+=hist.map(x=>`<div class="exv-hrow"><span>${fmtDate(x.date)}</span><div>${(x.ex.sets||[]).filter(isWorkSet).map(s=>`<i>${s.kg??'–'}×${s.reps??'–'}${s.rpe!=null&&s.rpe!==''?' @'+s.rpe:''}</i>`).join('')||'<i>—</i>'}</div></div>`).join('');
    if(best)hb+=`<div class="exv-best">🏆 Mejor e1RM: <b>${best} kg</b></div>`;
    h+=sec('Tu historial',hb);
  }
  h+=`<div class="exv-btns"><button data-n="${dn}" onclick="openGifPick(this.dataset.n)">${g?'Cambiar animación':'Elegir animación'}</button>${curScr()!=='sess'?`<button data-n="${dn}" onclick="closeExView();goToExInBiblioteca(this.dataset.n)">Ver en biblioteca</button>`:''}</div>`;
  document.getElementById('exv-body').innerHTML=h;
}

// ─── Revisión de secundarios (últimos 30 días) ───
function openSecAudit(){renderSecAudit();document.getElementById('ov-secaudit').classList.add('on');}
function closeSecAudit(e){if(e&&e.target!==e.currentTarget)return;document.getElementById('ov-secaudit').classList.remove('on');}
function renderSecAudit(){
  const to=todayStr(),from=PPCore.addDays(to,-29),A=PPCore.secAudit(db.profile,db.sessions,from,to);
  const el=document.getElementById('secaudit-body');
  if(!A.ejercicios){el.innerHTML='<div style="font-size:12px;color:var(--t3)">Sin series registradas en los últimos 30 días</div>';return;}
  const pct=A.seriesTotal?Math.round(A.seriesCon/A.seriesTotal*100):0;
  let h=`<div class="sa-sum"><b>${A.sesiones}</b> sesiones · <b>${A.ejercicios}</b> ejercicios · <b>${A.seriesTotal}</b> series<br>
    Con secundarios: <b>${A.conSec}/${A.ejercicios}</b> ejercicios · <b>${pct}%</b> de las series, que aportan <b>${f1(A.extra)}</b> series efectivas extra.</div>`;
  h+=A.revisar?`<div class="sa-warn">⚠ ${A.revisar} ejercicio${A.revisar>1?'s':''} multiarticular${A.revisar>1?'es':''} sin secundarios (${A.seriesRevisar} series en ${A.sesionesRevisar} sesion${A.sesionesRevisar>1?'es':''}). Tócalos para asignarlos.</div>`
    :'<div class="sa-ok">✓ Todos los ejercicios multiarticulares tienen secundarios. Los que no los tienen son de aislamiento o de músculos pequeños, donde es lo normal.</div>';
  h+=A.rows.map(r=>`<div class="sa-row${r.revisar?' warn':''}" data-n="${esc(r.name)}" onclick="closeSecAudit();openExView(this.dataset.n)">
    <div class="sa-h"><span class="sa-n">${esc(r.name)}</span><em>${r.sets} series · ${r.sesiones} ses.</em></div>
    <div class="sa-m"><span class="sa-p">${esc(r.muscle)}</span>${r.sec.length?r.sec.map(m=>`<span class="sa-s">+ ${esc(m)}</span>`).join(''):`<span class="sa-none">${r.revisar?'⚠ sin secundarios':'sin secundarios · normal aquí'}</span>`}<i>${r.src}</i></div></div>`).join('');
  el.innerHTML=h;
}
