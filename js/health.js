// health.js — Biometría del reloj vía Health Connect (solo en la app Android: envoltorio Capacitor).
// Lee sueño, pulso en reposo, HRV, peso, pasos y pulso durante la sesión. En el navegador no hace nada.
// Xiaomi (Mi Fitness) escribe en Health Connect sueño, pulso y pasos; Huawei Health necesita un puente (p. ej. Health Sync).

const HC_READ=['sleep','restingHeartRate','heartRateVariability','weight','steps','heartRate'];
const APK_URL='https://github.com/Adrian-Ramati/gymtracker/releases/download/android/peak-physique.apk';
function hcPlugin(){try{return window.Capacitor?.isNativePlatform?.()?(window.Capacitor.Plugins?.Health||null):null;}catch(e){return null;}}
function isNativeApp(){try{return !!window.Capacitor?.isNativePlatform?.();}catch(e){return false;}}

async function hcConnect(){
  const H=hcPlugin();if(!H){toast('Health Connect solo está en la app Android');return false;}
  try{
    const a=await H.isAvailable();
    if(!a?.available){toast('Health Connect no está disponible'+(a?.reason?`: ${a.reason}`:'')+' — instálalo desde Play Store');return false;}
    await H.requestAuthorization({read:HC_READ,requestHistoryAccess:true});
    db.profile=db.profile||{};db.profile.healthConnect=true;saveDB();
    toast('Reloj conectado — importando los últimos 30 días…');
    await hcSync(true);
    return true;
  }catch(e){console.warn('Health Connect:',e);toast('No se pudo conectar con Health Connect');return false;}
}
const HC_LBL={sleep:'Sueño',restingHeartRate:'Pulso en reposo',heartRateVariability:'HRV',weight:'Peso',steps:'Pasos',heartRate:'Pulso'};
// Revisa permisos y cuántos registros de cada tipo ve Health Connect (últimos 30 días): dice por qué salen 0 días
async function hcCheck(){
  const H=hcPlugin();if(!H)return;
  try{
    const st=await H.checkAuthorization({read:HC_READ});
    hcAuth={ok:st?.readAuthorized||[],denied:st?.readDenied||[]};
  }catch(e){hcAuth={ok:[],denied:[],err:String(e?.message||e).slice(0,120)};}
  await hcSync(true);
  if(!hcDiag)renderHealthCard();
}
let hcAuth=null;
async function hcOpenSettings(){try{await hcPlugin()?.openHealthConnectSettings();}catch(e){toast('Abre la app «Salud conectada» desde tus aplicaciones');}}
function hcDiagHtml(){
  if(!hcDiag)return '';
  const rows=HC_READ.map(t=>{
    const d=hcDiag.types[t]||{n:0},den=hcAuth?.denied?.includes(t)||/permission|security|denied/i.test(d.err||'');
    const st=den?'<b style="color:var(--red)">sin permiso</b>':d.err?`<b style="color:var(--red)">error</b> <small>${esc(d.err)}</small>`:d.n?`<b style="color:var(--green)">${d.n} registros</b>${d.src?.length?` <small>${d.src.map(esc).join(', ')}</small>`:''}`:'<b style="color:var(--amber)">sin datos</b>';
    return `<div class="hc-dr"><span>${HC_LBL[t]}</span><span>${st}</span></div>`;
  }).join('');
  const tot=Object.values(hcDiag.types).reduce((a,d)=>a+d.n,0),denied=HC_READ.filter(t=>hcAuth?.denied?.includes(t)||/permission|security|denied/i.test(hcDiag.types[t]?.err||''));
  const tip=denied.length?`Faltan permisos (${denied.map(t=>HC_LBL[t]).join(', ')}): ábrelos en Health Connect → Permisos de apps → Peak Physique y activa la lectura de todo.`
    :!tot?'Health Connect no tiene datos de estos tipos de los últimos 30 días. En la app «Salud conectada» → Datos y acceso comprueba si hay Sueño o Pasos. Si no hay nada, Mi Fitness no está escribiendo en Health Connect: activa ahí su sincronización con Health Connect y abre Mi Fitness para que sincronice el reloj.'
    :hcDiag.days?'':'Hay registros pero ninguno se pudo agrupar por día.';
  return `<details class="hc-diag" ${tot&&!denied.length?'':'open'}><summary>Diagnóstico · ${hcDiag.days} días importados</summary>${rows}${tip?`<p class="hc-p" style="margin-top:8px">${tip}</p>`:''}</details>`;
}
function hcDisconnect(){if(db.profile){db.profile.healthConnect=false;saveDB();}renderHealthCard();renderHomeHealth();}

let hcBusy=false,hcDiag=null;
async function hcSync(full){
  const H=hcPlugin();if(!H||!db.profile?.healthConnect||hcBusy)return null;
  hcBusy=true;
  try{
    const last=db.profile.hcLastSync?Date.parse(db.profile.hcLastSync):0;
    const days=full||!last?30:Math.min(30,Math.max(2,Math.ceil((Date.now()-last)/864e5)+1));
    const start=new Date(Date.now()-days*864e5);start.setHours(0,0,0,0);
    const q={startDate:start.toISOString(),endDate:new Date().toISOString(),limit:10000};
    const byType={},diag={};
    for(const t of HC_READ){
      try{byType[t]=(await H.readSamples({...q,dataType:t}))?.samples||[];diag[t]={n:byType[t].length,src:[...new Set(byType[t].map(x=>x.sourceName||x.sourceId).filter(Boolean))].slice(0,3)};}
      catch(e){byType[t]=[];diag[t]={n:0,err:String(e?.message||e).slice(0,160)};}
    }
    const daily=PPCore.healthDaily(byType);
    db.biometrics=db.biometrics||[];db.weights=db.weights||[];db.steps=db.steps||[];
    let nb=0;
    for(const d of daily){
      let b=db.biometrics.find(x=>x.date===d.date);if(!b){b={date:d.date};db.biometrics.push(b);}
      const src={...(b.src||{})};
      ['sleepMin','sleepEff','rhr','hrv','weight','steps'].forEach(k=>{if(d[k]!=null){b[k]=d[k];src[k]='health_connect';}});
      b.src=src;nb++;
      // Peso y pasos del reloj alimentan también Cuerpo y Actividad (sin pisar lo que ya registraste a mano)
      if(d.weight!=null&&!db.weights.some(w=>w.date===d.date)){db.weights.push({date:d.date,kg:d.weight});if(typeof saveWeightRemote==='function')saveWeightRemote(d.weight,d.date);}
      if(d.steps!=null&&!db.steps.some(s=>s.date===d.date)){db.steps.push({date:d.date,steps:d.steps});if(typeof saveStepsRemote==='function')saveStepsRemote(d.date,d.steps);}
      if(typeof saveBiometricRemote==='function')saveBiometricRemote(b);
    }
    db.biometrics.sort((a,b)=>a.date.localeCompare(b.date));db.weights.sort((a,b)=>a.date.localeCompare(b.date));db.steps.sort((a,b)=>a.date.localeCompare(b.date));
    // Pulso de cada serie de las sesiones del periodo
    const recent=(db.sessions||[]).filter(s=>s.date>=PPCore.isoDate(start));
    PPCore.attachSetHr(recent,byType.heartRate);
    for(const s of recent)if(s._hrChanged){delete s._hrChanged;await saveSession(s);}
    db.profile.hcLastSync=new Date().toISOString();saveDB();
    hcDiag={at:Date.now(),types:diag,days:nb,from:PPCore.isoDate(start)};
    renderHealthCard();renderHomeHealth();
    if(full)toast(nb?`Reloj: ${nb} días importados ✓`:'Health Connect no devolvió datos — mira el diagnóstico en Perfil',5000);
    return {days:nb};
  }catch(e){console.warn('Health Connect sync:',e);return null;}
  finally{hcBusy=false;}
}
// Sincroniza al abrir la app y al volver a ella (como mucho cada 30 min)
function hcAutoSync(){
  if(!hcPlugin()||!db?.profile?.healthConnect)return;
  const last=db.profile.hcLastSync?Date.parse(db.profile.hcLastSync):0;
  if(Date.now()-last>30*60000)hcSync(false);
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hcAutoSync();});

function renderHealthCard(){
  const el=document.getElementById('health-card');if(!el)return;
  const bt=(db.biometrics||[]).filter(b=>b.sleepMin||b.rhr||b.hrv).slice(-1)[0];
  const lastLine=bt?`<div class="hc-last">Último dato (${fmtDate(bt.date)}): ${bt.sleepMin?`😴 ${Math.floor(bt.sleepMin/60)} h ${Math.round(bt.sleepMin%60)} min`:''}${bt.rhr?` · ❤ ${Math.round(bt.rhr)} lpm`:''}${bt.hrv?` · HRV ${Math.round(bt.hrv)} ms`:''}</div>`:'';
  let body;
  if(!isNativeApp())body=`<p class="hc-p">Sueño, pulso en reposo, HRV, peso y pasos del reloj ajustan tu índice y la carga recomendada de cada día. Se leen de Health Connect, que solo está en la app Android.</p><a class="rest-btn hc-btn" href="${APK_URL}" target="_blank" rel="noopener">Descargar la app Android</a>`;
  else if(!hcPlugin())body='<p class="hc-p">Esta versión de la app no trae Health Connect.</p>';
  else if(!db.profile?.healthConnect)body=`<p class="hc-p">Conecta Health Connect para leer sueño, pulso en reposo, HRV, peso y pasos. Mi Fitness (Xiaomi) escribe ahí; Huawei Health necesita un puente como Health Sync.</p><button class="rest-btn hc-btn" onclick="hcConnect()">Conectar el reloj</button>`;
  else body=`<p class="hc-p">Conectado${db.profile.hcLastSync?` · última lectura ${new Date(db.profile.hcLastSync).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`:''}</p><div style="display:flex;gap:8px"><button class="rest-btn hc-btn" onclick="hcCheck()">Revisar conexión</button><button class="rest-btn hc-btn" onclick="hcOpenSettings()">Abrir Health Connect</button><button class="rest-btn hc-btn hc-off" onclick="hcDisconnect()">Desconectar</button></div>${hcDiagHtml()}`;
  el.innerHTML=`<div class="card-title">Reloj y recuperación <span>Health Connect</span></div>${body}${lastLine}`;
}

// Recordatorio en Inicio: conectar el reloj o traer los datos de hoy antes de entrenar.
// Solo en la app Android: en el navegador no hay Health Connect que sincronizar.
function renderHomeHealth(){
  const el=document.getElementById('home-health');if(!el)return;
  if(!isNativeApp()||!hcPlugin()){el.innerHTML='';return;}
  if(!db?.profile?.healthConnect){
    el.innerHTML=`<button class="home-hc" onclick="hcConnect()"><b>⌚ Conectar el reloj</b><small>Sueño, pulso y HRV para la readiness de hoy</small></button>`;
    return;
  }
  const last=db.profile.hcLastSync?Date.parse(db.profile.hcLastSync):0;
  const mins=last?Math.round((Date.now()-last)/60000):null;
  const stale=!last||mins>=120;
  const txt=mins==null?'sin sincronizar todavía':mins<2?'hace un momento':mins<60?`hace ${mins} min`:`hace ${Math.floor(mins/60)} h`;
  el.innerHTML=`<button class="home-hc${stale?' stale':''}" onclick="hcSync(true)"><b>⌚ ${stale?'Sincroniza el reloj':'Reloj al día'}</b><small>Última lectura ${txt}${stale?' · tócalo antes de entrenar':''}</small></button>`;
}
