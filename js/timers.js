// timers.js — Vibración, temporizador de descanso, wake lock, sonido, notificaciones y repetir sesión.
// ═══ MEJORAS: HAPTICS, REST TIMER, REPEAT, OFFLINE ═══
function vib(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
let restIv=null,restLeft=0,restEndTs=null;
// ═══ SCREEN WAKE LOCK ═══
// A web app cannot turn a locked screen ON, but it CAN keep it from turning off.
// While a session is active the screen stays awake, so the in-page timer never
// freezes and vibration+beep fire reliably — the SW notification remains as
// backup for when the user locks the screen manually.
let wakeLock=null;
async function acquireWakeLock(){
  try{
    if(!('wakeLock' in navigator)||wakeLock)return;
    wakeLock=await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release',()=>{wakeLock=null;});
  }catch(e){wakeLock=null;}
}
function releaseWakeLock(){try{wakeLock?.release();}catch(e){}wakeLock=null;}
// ═══ AUDIBLE ALERT ═══
// AudioContext is created/resumed inside startRest (a tap gesture), so the
// end-of-rest beep can play later without needing a new user gesture.
let audioCtx=null;
function initAudio(){
  try{
    audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
  }catch(e){}
}
function beep(){
  try{
    if(!audioCtx||audioCtx.state!=='running')return;
    const t0=audioCtx.currentTime;
    [[880,0],[880,0.35],[1174,0.7]].forEach(([f,dt])=>{
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.connect(g);g.connect(audioCtx.destination);
      o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t0+dt);
      g.gain.exponentialRampToValueAtTime(0.35,t0+dt+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+dt+0.28);
      o.start(t0+dt);o.stop(t0+dt+0.3);
    });
  }catch(e){}
}
// ═══ REST NOTIFICATIONS (screen off / app in background) ═══
// The in-page timer can't fire while Android suspends the tab, so the rest end
// is also scheduled in the service worker, which shows a system notification
// with vibration. The SW delays 1.2s past endTs so a VISIBLE page always wins
// the race (toast+vib in-app) and cancels the notification before it shows.
let notifAsked=false;
async function ensureNotifPermission(){
  if(!('Notification' in window))return false;
  if(Notification.permission==='granted')return true;
  if(Notification.permission==='denied')return false;
  if(notifAsked)return false; // ask once per app load, don't nag
  notifAsked=true;
  try{return(await Notification.requestPermission())==='granted';}catch(e){return false;}
}
// App Android (Capacitor): notificación local nativa, que suena aunque la pantalla esté apagada
function localNotif(){try{return window.Capacitor?.isNativePlatform?.()?(window.Capacitor.Plugins?.LocalNotifications||null):null;}catch(e){return null;}}
// Canal propio del descanso: en Android 8+ el sonido y la vibración los pone el canal, no el aviso.
// Importancia 4 (alta) = suena y salta en pantalla aunque el móvil esté bloqueado. Se crea una vez.
let restChannel=null;
async function ensureRestChannel(LN){
  if(restChannel!==null)return restChannel;
  try{
    await LN.createChannel({id:'rest-timer',name:'Descanso entre series',description:'Aviso de fin del descanso',importance:4,visibility:1,vibration:true,lights:true,lightColor:'#4f7cff'});
    restChannel='rest-timer';
  }catch(e){restChannel='';}
  return restChannel;
}
async function scheduleRestNotification(endTs){
  const LN=localNotif();
  if(LN){
    try{
      const p=await LN.checkPermissions();if(p.display!=='granted'&&(await LN.requestPermissions()).display!=='granted')return;
      const ch=await ensureRestChannel(LN);
      await LN.cancel({notifications:[{id:7001}]}).catch(()=>{});
      await LN.schedule({notifications:[{id:7001,title:'Descanso terminado',body:'A por la siguiente serie 💪',
        ...(ch?{channelId:ch}:{}),isExactNotification:true,schedule:{at:new Date(endTs),allowWhileIdle:true}}]});
    }catch(e){}
    return;
  }
  try{
    if(!await ensureNotifPermission())return;
    const reg=await navigator.serviceWorker?.ready;
    reg?.active?.postMessage({type:'schedule-rest',endTs});
  }catch(e){}
}
function cancelRestNotification(){
  const LN=localNotif();if(LN){LN.cancel({notifications:[{id:7001}]}).catch(()=>{});return;}
  try{
    navigator.serviceWorker?.ready.then(reg=>{
      reg.active?.postMessage({type:'cancel-rest'});
      reg.getNotifications({tag:'rest-timer'}).then(ns=>ns.forEach(n=>n.close())).catch(()=>{});
    });
  }catch(e){}
}
function startRest(secs){
  stopRest();
  initAudio(); // inside the tap gesture → beep at rest end needs no new gesture
  // Anchor to an absolute end time: when the phone screen is off between sets
  // (the normal case in a gym), intervals freeze — on wake, tickRest() recomputes
  // the true remaining time from the wall clock instead of resuming a stale count.
  restEndTs=Date.now()+(secs||90)*1000;
  const pill=document.getElementById('rest-pill');pill.style.display='flex';
  tickRest();
  restIv=setInterval(tickRest,1000);
  scheduleRestNotification(restEndTs);
}
function tickRest(){
  if(restEndTs===null)return;
  restLeft=Math.max(0,Math.round((restEndTs-Date.now())/1000));
  updateRestUI();
  if(restLeft<=0){stopRest();vib([300,100,300]);beep();toast('¡Descanso terminado!');}
}
function updateRestUI(){const m=Math.floor(restLeft/60),s=restLeft%60;const el=document.getElementById('rest-time');if(el)el.textContent=m+':'+(s<10?'0':'')+s;}
function restAdd(s){if(restEndTs===null)return;restEndTs+=s*1000;tickRest();if(restEndTs!==null)scheduleRestNotification(restEndTs);}
function stopRest(){clearInterval(restIv);restIv=null;restEndTs=null;const p=document.getElementById('rest-pill');if(p)p.style.display='none';cancelRestNotification();}
// On wake/foreground, immediately resync both timers with the wall clock
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){
    if(activeSess&&!activeSess.isTmplEdit){updateTimer();acquireWakeLock();}
    if(restEndTs!==null)tickRest();
  }else if(restEndTs!==null){
    // Going to background with a rest pending: re-post the schedule. The message
    // event also refreshes the SW's lifetime right when we start depending on it.
    scheduleRestNotification(restEndTs);
  }
});
// Repetir abre la misma hoja «Antes de empezar» que una rutina: el check-in también cuenta aquí
function repeatSession(id){
  const src=(db.sessions||[]).find(s=>s.id===id);if(!src)return;
  if(sessBusy())return;
  openPreSess(src);
}
function repeatLastSession(){
  const ss=(db.sessions||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date)||(b.id>a.id?1:-1));
  if(!ss.length){toast('No hay sesiones previas');return;}
  if(sessBusy())return;
  openPreSess(ss[0]);
}
window.addEventListener('online',()=>{if(useSupabase&&db&&Object.keys(db).length){saveDB();flushSyncQueue();toast('Conexión recuperada — sincronizando');}});
window.addEventListener('offline',()=>toast('Sin conexión — guardando en local'));
