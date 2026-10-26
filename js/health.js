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
function hcDisconnect(){if(db.profile){db.profile.healthConnect=false;saveDB();}renderHealthCard();}

let hcBusy=false;
async function hcSync(full){
  const H=hcPlugin();if(!H||!db.profile?.healthConnect||hcBusy)return null;
  hcBusy=true;
  try{
    const last=db.profile.hcLastSync?Date.parse(db.profile.hcLastSync):0;
    const days=full||!last?30:Math.min(30,Math.max(2,Math.ceil((Date.now()-last)/864e5)+1));
    const start=new Date(Date.now()-days*864e5);start.setHours(0,0,0,0);
    const q={startDate:start.toISOString(),endDate:new Date().toISOString(),limit:10000};
    const byType={};
    for(const t of HC_READ){try{byType[t]=(await H.readSamples({...q,dataType:t}))?.samples||[];}catch(e){byType[t]=[];}}
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
    renderHealthCard();
    if(full)toast(`Reloj: ${nb} días importados ✓`);
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
  else body=`<p class="hc-p">Conectado${db.profile.hcLastSync?` · última lectura ${new Date(db.profile.hcLastSync).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`:''}</p><div style="display:flex;gap:8px"><button class="rest-btn hc-btn" onclick="hcSync(true)">Sincronizar ahora</button><button class="rest-btn hc-btn hc-off" onclick="hcDisconnect()">Desconectar</button></div>`;
  el.innerHTML=`<div class="card-title">Reloj y recuperación <span>Health Connect</span></div>${body}${lastLine}`;
}
