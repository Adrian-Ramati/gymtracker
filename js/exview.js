// exview.js — Ficha completa del ejercicio.
// ─── Ficha completa del ejercicio (GIF sin recortar + máquina + técnica + historial) ───
// Se abre al tocar la miniatura o el nombre de un ejercicio, también durante el entrenamiento,
// sin salir de la sesión.
const EQ_ES={'leverage machine':'Máquina guiada (de palanca)','sled machine':'Prensa / máquina de trineo','smith machine':'Máquina Smith','cable':'Polea','assisted':'Máquina asistida','barbell':'Barra','olympic barbell':'Barra olímpica','ez barbell':'Barra Z','dumbbell':'Mancuernas','kettlebell':'Kettlebell','body weight':'Peso corporal','weighted':'Lastrado','band':'Banda elástica','resistance band':'Banda elástica','stability ball':'Fitball','medicine ball':'Balón medicinal','bosu ball':'Bosu','rope':'Cuerda','trap bar':'Barra hexagonal','roller':'Rodillo','wheel roller':'Rueda abdominal','hammer':'Martillo','tire':'Neumático','elliptical machine':'Elíptica','stationary bike':'Bicicleta estática','skierg machine':'SkiErg','stepmill machine':'Escaladora','upper body ergometer':'Ergómetro de brazos'};
const TGT_ES={'pectorals':'Pectoral','lats':'Dorsales','upper back':'Espalda alta','triceps':'Tríceps','biceps':'Bíceps','glutes':'Glúteos','hamstrings':'Isquiosurales','quads':'Cuádriceps','calves':'Gemelos','delts':'Deltoides','abs':'Abdominales','forearms':'Antebrazos','traps':'Trapecio','adductors':'Aductores','abductors':'Abductores','spine':'Lumbares','serratus anterior':'Serrato','cardiovascular system':'Cardio','levator scapulae':'Elevador de la escápula'};
let exViewName=null;
function openExView(name){
  if(!name)return;exViewName=name;renderExView();
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
function exvZoom(){const g=getGif(exViewName);if(!g)return;document.getElementById('exv-zoom-img').src=gifUrl(g);document.getElementById('exv-zoom').classList.add('on');}
function renderExView(){
  const name=exViewName;if(name==null)return;
  const k=normExName(name);
  const info=ALL_EX.find(e=>normExName(e.name)===k)||{};
  const live=activeSess?.exercises?.find(e=>normExName(e.name)===k);
  const muscle=info.muscle||live?.muscle||'';
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
