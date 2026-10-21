// nav.js — Navegación, portada, pantallas Semana/Volumen/Perfil.
// ═══════════════════════════════════════════════════════════════════════
// ═══ NAVEGACIÓN (home + drill-downs) ═══
const SCR_TITLES={home:'Peak Physique',train:'Semana',vol:'Volumen',stats:'Progreso',profile:'Cuerpo',activity:'Actividad',perfil:'Perfil',hyper:'Hipertrofia',sess:'Entrenamiento',tmpledit:'Rutina'};
let navStack=[];
function curScr(){return document.querySelector('.scr.on')?.id?.replace('s-','')||'home';}
function navTo(n){const c=curScr();if(c!==n){navStack.push(c);}showScr(n,null);document.querySelector('.content').scrollTo(0,0);}
// Durante un entrenamiento, ‹ vuelve al inicio sin cortar la sesión (sigue el cronómetro y la barra "Continuar")
function sessCanLeave(){return !!(activeSess&&!activeSess.isTmplEdit);}
function navBack(){const c=curScr();if(c==='sess'&&sessCanLeave()){navHome();toast('El entrenamiento sigue en marcha');return;}if(c==='sess'||c==='tmpledit'){return;}let p=navStack.pop()||'home';if(p===c)p='home';if(p==='sess'||p==='tmpledit')p='home';showScr(p,null);}
function navHome(){navStack=[];showScr('home',null);document.querySelector('.content').scrollTo(0,0);}
function updateHdr(n){
  const home=n==='home',sessy=n==='sess'||n==='tmpledit';
  const noBack=home||n==='tmpledit'||(n==='sess'&&!sessCanLeave());
  const _hb=document.getElementById('hdr-back');_hb.style.visibility=noBack?'hidden':'visible';_hb.style.pointerEvents=noBack?'none':'all';
  document.getElementById('hdr-gear').style.display=(home)?'grid':'none';
  document.getElementById('hdr-logo').style.display=home?'block':'none';
  const t=document.getElementById('hdr-title');t.textContent=SCR_TITLES[n]||'Peak Physique';t.classList.toggle('sub',!home);
  document.getElementById('hdr').classList.toggle('home',home);
  const nb=document.getElementById('bnav');if(nb){nb.classList.toggle('hide',sessy);
    const act=n==='stats'?'stats':n==='perfil'?'perfil':'home';
    ['home','stats','perfil'].forEach(k=>document.getElementById('bn-'+k)?.classList.toggle('on',k===act));}
}
function tabGo(n){if(n==='home'){navHome();return;}navStack=[];showScr(n,null);document.querySelector('.content').scrollTo(0,0);}

// ─── Siguiente rutina en el split ────────────────────────────────────
function nextTemplate(){
  const t=db.templates||[];if(!t.length)return null;
  const last=[...(db.sessions||[])].sort((a,b)=>b.date.localeCompare(a.date)||(b.id>a.id?1:-1))[0];
  if(!last)return t[0];
  const i=t.findIndex(x=>x.name===last.name);
  return t[(i+1)%t.length];
}
function tmplSetCount(t){return (t.exercises||[]).reduce((a,e)=>a+(e.sets||3),0);}

// ─── HOME ────────────────────────────────────────────────────────────
function renderHome(){
  dashOff=0;
  const nt=nextTemplate();
  const ICO_R='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>';
  const ICO_C='<svg class="r" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  document.getElementById('home-cta').innerHTML=nt?`<div class="cta-card">
    <div class="cta-main" onclick="startFromTmpl('${nt.id}')"><div style="min-width:0"><small>Siguiente Rutina</small><b>${esc(nt.name)}</b><span>${nt.exercises.length} ejercicios · ${PPCore.mesoSets(db.profile,db.templates,nt,todayStr()).reduce((a,b)=>a+b,0)} series · ⏱ ${nt.rest||90}s</span>${mesoChipHtml()}</div><div class="go"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5.5v13l11-6.5z" fill="#fff"/></svg></div></div>
    <div class="cta-row"><button onclick="repeatLastSession()">${ICO_R}Repetir</button><button onclick="openQuickStart()">Otra${ICO_C}</button></div></div>`
  :`<div class="cta-card"><div class="cta-main" onclick="createNewRoutine()"><div><small>Empieza aquí</small><b style="font-size:30px;letter-spacing:-.8px">Crea tu primera rutina</b></div><div class="go">+</div></div></div>`;
  // Semana
  const days=weekRange(0),prev=weekRange(-1),st=weekStats(days),pv=weekStats(prev);const today=todayStr();
  const sd=new Set(st.sessions.map(s=>s.date));const dn=['L','M','X','J','V','S','D'];
  document.getElementById('hc-strip').innerHTML=days.map((ds,i)=>`<div class="wk-d ${sd.has(ds)?'on':isRest(ds)?'rest':''} ${ds===today?'today':''}"><i style="height:18px"></i>${dn[i]}</div>`).join('');
  const dl=(a,b)=>{const d=a-b;if(!d||(!a&&!b))return'';return `<em class="${d>0?'up':'dn'}">${d>0?'+':'−'}${Math.abs(d)}</em>`;};
  document.getElementById('hc-week-sub').textContent=`${st.sessions.length} de ${Math.max((db.templates||[]).length,1)} sesiones`;
  document.getElementById('hc-kpis').innerHTML=`<div><b>${st.sessions.length}${dl(st.sessions.length,pv.sessions.length)}</b><small>sesiones</small></div><div><b>${st.sets}${dl(st.sets,pv.sets)}</b><small>series</small></div><div><b>${st.ton>=1000?(st.ton/1000).toFixed(1)+'t':st.ton}</b><small>kg movidos</small></div><div><b>${st.min>=60?(st.min/60).toFixed(1)+'h':st.min+'m'}</b><small>tiempo</small></div>`;
  // Volumen
  const hb=document.getElementById('hc-body');if(!hb.dataset.init){hb.innerHTML=bodySvg('f')+bodySvg('b');hb.dataset.init='1';}
  paintBody(hb,st.by);
  const ent=Object.entries(st.by).sort((a,b)=>b[1]-a[1]);
  document.getElementById('hc-vol-sub').textContent=st.sets?`${st.sets} series · ${ent.length} músculos`:'sin series esta semana';
  renderHomeHyper();
}
// ── utilidades de gráfica (línea violeta con degradado, como la maqueta) ──
function purpleDS(data,pr){return{data,borderColor:'#c084fc',borderWidth:2.5,pointRadius:pr,pointHoverRadius:pr+1,pointBackgroundColor:'#e9d5ff',pointBorderColor:'#a855f7',pointBorderWidth:2,fill:true,tension:.4,
  backgroundColor:c=>{const a=c.chart.chartArea;if(!a)return 'rgba(168,85,247,.25)';const g=c.chart.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,'rgba(168,85,247,.55)');g.addColorStop(1,'rgba(168,85,247,0)');return g;}};}
function niceAxis(vals){const mn=Math.min(...vals),mx=Math.max(...vals);const range=Math.max(mx-mn,1);const st=[.5,1,2,5,10,20,50].find(x=>range/x<=6)||100;return{min:Math.floor((mn-range*.05)/st)*st,max:Math.ceil((mx+range*.05)/st)*st,step:st};}
// ── Pantalla Progreso: tarjetas inferiores y "Músculo activado" ──────
// "Músculo activado" muestra los músculos del ejercicio elegido en el selector:
// el principal al 100% y los secundarios al 50% (cuentan media serie, como en el volumen).
const MUS_COLORS=['#34d399','#38bdf8','#4f7cff','#a855f7'];
function exMuscleOf(name){
  const ss=[...(db.sessions||[])].sort((a,b)=>b.date.localeCompare(a.date));
  for(const s of ss){const e=s.exercises?.find(x=>x.name===name);if(e?.muscle)return e.muscle;}
  return ALL_EX.find(x=>x.name===name)?.muscle||'';
}
function muscleActiveData(name){
  if(!name)return[];
  const muscle=exMuscleOf(name);if(!muscle)return[];
  return PPCore.credits(db.profile,{name,muscle}).slice(0,4).map((x,i)=>({m:x.m,pct:Math.round(x.w*100),c:MUS_COLORS[i],sec:x.w<1}));
}
function muscleActiveHtml(name){
  const d=muscleActiveData(name);
  if(!d.length)return '<div class="px-mempty">Sin músculo asignado</div>';
  return `<div class="px-mus"><div class="px-mrows">${d.map(x=>`<div class="px-mrow"><span>${esc(x.m)}${x.sec?' <small>½</small>':''}</span><i><u style="width:${x.pct}%;background:${x.c}"></u></i></div>`).join('')}</div><div class="hc-body px-fig" id="px-fig"></div></div>`;
}
function paintMuscleActive(name){
  const fig=document.getElementById('px-fig');if(!fig)return;
  const regs={};muscleActiveData(name).forEach(x=>(MUSCLE_REGIONS[x.m]||[]).forEach(r=>{if(!regs[r])regs[r]=x.c;}));
  const ids=Object.keys(regs),back=ids.filter(r=>r.startsWith('b-')).length>ids.length/2;
  fig.innerHTML=bodySvg(back?'b':'f');
  fig.querySelectorAll('.body-m').forEach(el=>{el.style.fill=regs[el.dataset.id]||'rgb(28,36,56)';});
}
function renderProgExtras(){
  const days=weekRange(0),st=weekStats(days),today=todayStr();
  const steps=[...(db.steps||[])].sort((a,b)=>a.date.localeCompare(b.date));const ts=steps.find(x=>x.date===today);
  const last7=steps.filter(x=>x.date>days[0]||days.includes(x.date)).slice(-7);
  const avg=last7.length?Math.round(last7.reduce((a,x)=>a+x.steps,0)/last7.length):null;
  const kcalW=st.sessions.reduce((a,x)=>a+(x.kcalWatch||0),0);
  const nm=String(db.profile?.username||'?');
  const f=n=>n!=null?n.toLocaleString('es'):'—';
  document.getElementById('px-act').innerHTML=`<i class="chev">›</i><div class="px-ava">${esc(nm.slice(0,1).toUpperCase())}</div><div class="px-ctitle">Actividad</div><ul class="px-list"><li style="--c:#4f7cff"><span>Pasos hoy</span><b>${f(ts?ts.steps:null)}</b></li><li style="--c:#38bdf8"><span>Media semana</span><b>${f(avg)}</b></li><li style="--c:#34d399"><span>kcal gym</span><b>${kcalW||'—'}</b></li><li style="--c:#a855f7"><span>Sesiones</span><b>${st.sessions.length}</b></li></ul>`;
  const ms=(db.measures||[]).filter(m=>m.bf!=null).slice(-5);
  let body;
  if(!ms.length)body='<div class="px-mempty">Añade peso y % graso para ver tu composición</div>';
  else{
    const rows=ms.map(m=>{const w=getWeightForDate(m.date||'9999-12-31'),fat=Math.round(w*m.bf)/100;return{w,fat,lean:w-fat};});
    const mx=Math.max(...rows.map(r=>r.w)),last=rows[rows.length-1];
    body=`<div class="gb-wrap">${rows.map(r=>`<div class="gb" style="height:${Math.round(r.w/mx*100)}%"><i class="l" style="flex:${r.lean}"></i><i class="f" style="flex:${r.fat}"></i></div>`).join('')}</div>
      <div class="px-leg"><span style="--c:#34d399">Masa magra <b>${(Math.round(last.lean*10)/10)} kg</b></span><span style="--c:#4f7cff">Grasa <b>${(Math.round(last.fat*10)/10)} kg</b></span></div>`;
  }
  document.getElementById('px-comp').innerHTML=`<i class="chev">›</i><div class="px-ctitle">Cuerpo</div>${body}`;
}
function paintBody(wrap,by){return paintVolFigure(wrap,by);}
function strengthRows(n){
  const hist={};
  [...(db.sessions||[])].sort((a,b)=>a.date.localeCompare(b.date)).forEach(s=>s.exercises?.forEach(e=>{if(e.best_e1rm){(hist[e.name]=hist[e.name]||[]).push({d:s.date,v:e.best_e1rm});}}));
  const rows=Object.entries(hist).filter(([,h])=>h.length>=2).sort((a,b)=>b[1][b[1].length-1].d.localeCompare(a[1][a[1].length-1].d)||b[1].length-a[1].length).slice(0,n);
  if(!rows.length)return'<div style="font-size:11px;color:var(--t3)">Registra pesos y reps para ver tu e1RM</div>';
  return rows.map(([name,h])=>{const l=h[h.length-1].v,p=h[h.length-2].v;const d=l-p;const best=Math.max(...h.map(x=>x.v));return `<div class="st-row"><span>${esc(name)}</span><b>${l} kg${l>=best&&d>0?' 🏆':''}</b><em class="${d>0?'up':d<0?'dn':''}">${d>0?'+':''}${d?d.toFixed(1):'='}</em></div>`;}).join('');
}

// ─── SEMANA (drill-down) ─────────────────────────────────────────────
function renderWeekScr(){
  const days=weekRange(dashOff),prev=weekRange(dashOff-1);const st=weekStats(days),pv=weekStats(prev);const today=todayStr();
  const nx=document.getElementById('dash-next');if(nx)nx.disabled=dashOff>=0;
  const mn=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];const f=ds=>{const[y,m,d]=ds.split('-');return `${+d} ${mn[+m-1]}`;};
  document.getElementById('dash-title').textContent=dashOff===0?'Esta semana':dashOff===-1?'Semana pasada':`Hace ${-dashOff} semanas`;
  document.getElementById('dash-sub').textContent=`${f(days[0])} – ${f(days[6])}`;
  const dn=['L','M','X','J','V','S','D'];const sd=new Set(st.sessions.map(s=>s.date));
  document.getElementById('wk-strip').innerHTML=days.map((ds,i)=>`<div class="wk-d ${sd.has(ds)?'on':isRest(ds)?'rest':''} ${ds===today?'today':''}" onclick="selectDate('${ds}');event.stopPropagation()"><i></i>${dn[i]}</div>`).join('');
  const delta=(a,b,f)=>{if(!b&&!a)return'';const d=a-b;if(!d)return'<em>=</em>';return `<em class="${d>0?'up':'dn'}">${d>0?'+':'−'}${f?f(Math.abs(d)):Math.abs(d)}</em>`;};
  const kt=v=>v>=1000?(v/1000).toFixed(1).replace('.0','')+'t':v+'kg';const tm=v=>v>=60?(v/60).toFixed(1).replace('.0','')+'h':v+'m';
  document.getElementById('dash-kpis').innerHTML=`
    <div class="kpi"><b>${st.sessions.length}</b><small>sesiones</small>${delta(st.sessions.length,pv.sessions.length)}</div>
    <div class="kpi"><b>${st.sets}</b><small>series</small>${delta(st.sets,pv.sets)}</div>
    <div class="kpi"><b>${st.ton>=1000?(st.ton/1000).toFixed(1):st.ton}</b><small>${st.ton>=1000?'toneladas':'kg movidos'}</small>${delta(st.ton,pv.ton,kt)}</div>
    <div class="kpi"><b>${tm(st.min)}</b><small>tiempo</small>${delta(st.min,pv.min,tm)}</div>`;
  const dnl=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  document.getElementById('wk-sessions').innerHTML=`<div class="card" style="padding:6px 14px">${st.sessions.length?[...st.sessions].sort((a,b)=>a.date.localeCompare(b.date)).map(s=>{const d=new Date(s.date+'T12:00');const sets=(s.exercises||[]).reduce((a,e)=>a+(e.sets||[]).filter(x=>x.done||x.kg).length,0);const prs=getPRsForSession(s).size;return `<div class="wk-sess" onclick="openSessionDetail(${s.id})"><div class="d"><b>${d.getDate()}</b>${dnl[d.getDay()]}</div><div class="n">${esc(s.name)}${prs?` <span style="color:var(--amber);font-size:11px">🏆${prs}</span>`:''}<small>${s.exercises?.length||0} ej · ${sets} series${s.durationMin?` · ${s.durationMin} min`:''}</small></div><i style="color:var(--t3)">›</i></div>`;}).join(''):'<div style="font-size:12px;color:var(--t3);padding:8px 0">Sin sesiones esta semana</div>'}</div>`;
}

// ─── VOLUMEN (drill-down) ────────────────────────────────────────────
function renderVolScr(){
  const days=weekRange(dashOff);const st=weekStats(days);
  document.getElementById('vol-next').disabled=dashOff>=0;
  const mn=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];const f=ds=>{const[y,m,d]=ds.split('-');return `${+d} ${mn[+m-1]}`;};
  document.getElementById('vol-title').textContent=dashOff===0?'Esta semana':dashOff===-1?'Semana pasada':`Hace ${-dashOff} semanas`;
  document.getElementById('vol-sub').textContent=`${f(days[0])} – ${f(days[6])} · ${st.sets} series · ${st.sessions.length} sesiones`;
  renderBodyHeat(st.by);
  renderVolBars(st.by);
  renderDashDonut(st.byDirect,st.sets);
  renderDashWeekChart();
  renderVol(); // histórico por músculo (chips + bandas)
}
function renderVolBars(by){
  const ent=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  const el=document.getElementById('vol-bars');
  if(!ent.length){el.innerHTML='<div style="font-size:12px;color:var(--t3)">Sin series registradas esta semana</div>';return;}
  el.innerHTML=ent.map(([m,v])=>{
    const lm=getLandmarks(m)||{};const mx=(lm.mrv||20)*1.15;const z=lm.mav?lmZone(v,lm):null;
    const tick=(x,c)=>lm[x]?`<div class="tick ${x}" style="left:${Math.min(100,lm[x]/mx*100)}%"></div>`:'';
    return `<div class="vbar-wrap"><div class="vbar-label"><span>${esc(m)}${z?`<span class="vbar-zone" style="color:${z.color}">${z.txt}</span>`:''}</span><span style="font-family:var(--mono)">${v} <span style="color:var(--t3)">/ ${lm.mev??'–'}·${lm.mav??'–'}·${lm.mrv??'–'}</span></span></div>
    <div class="vbar"><div class="vfill" style="width:${Math.min(100,Math.round(v/mx*100))}%;background:${z?z.color:VC[m]||'#4f8ef7'}"></div>${tick('mev')}${tick('mav')}${tick('mrv')}</div></div>`;
  }).join('');
}
// ─── PERFIL (rutinas · biblioteca · datos) ───────────────────────────
function renderPerfil(){
  document.getElementById('perfil-name').textContent=db.profile?.username||'';
  const t=db.templates||[];
  document.getElementById('perfil-routines').innerHTML=t.map(x=>`<div class="rt-row"><div class="n">${esc(x.name)}<small>${x.exercises.length} ejercicios · ${tmplSetCount(x)} series · ⏱ ${x.rest||90}s</small></div><button class="go" onclick="startFromTmpl('${x.id}')">▶</button><button onclick="openEditTmpl('${x.id}')">Editar</button><button onclick="duplicateTmpl('${x.id}');renderPerfil()">⧉</button><button onclick="deleteTmpl('${x.id}').then(renderPerfil)" style="color:var(--red)">✕</button></div>`).join('')
    +`<button class="rest-btn" style="margin:10px 0 0" onclick="createNewRoutine()">+ Nueva rutina</button>`;
  renderMesoCard();
  renderBibliotecaInit();
}
