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
// APK desde la 1.0.12: alarma nativa (RestAlarmPlugin) que suena por el VOLUMEN DE ALARMA. La notificación
// normal a veces llegaba muda (móvil en vibración, Android 15 baja el sonido de avisos seguidos, MIUI/HyperOS
// silencia canales nuevos). Si el APK es anterior se usa la notificación local como hasta ahora.
function restAlarm(){try{return window.Capacitor?.isNativePlatform?.()?(window.Capacitor.Plugins?.RestAlarm||null):null;}catch(e){return null;}}
let restNativeArmed=false; // hay una alarma nativa programada para el descanso en curso
async function scheduleRestNotification(endTs){
  const LN=localNotif(),RA=restAlarm();
  if(RA){
    try{
      if(LN){const p=await LN.checkPermissions();if(p.display!=='granted')await LN.requestPermissions();}
      await RA.schedule({at:endTs,title:'Descanso terminado',body:'A por la siguiente serie 💪'});
      restNativeArmed=true;
    }catch(e){restNativeArmed=false;}
    return;
  }
  if(LN){
    try{
      const p=await LN.checkPermissions();if(p.display!=='granted'&&(await LN.requestPermissions()).display!=='granted')return;
      const ch=await ensureRestChannel(LN);
      await LN.cancel({notifications:[{id:7001}]}).catch(()=>{});
      await LN.schedule({notifications:[{id:7001,title:'Descanso terminado',body:'A por la siguiente serie 💪',
        ...(ch?{channelId:ch}:{}),isExactNotification:true,schedule:{at:new Date(endTs),allowWhileIdle:true}}]});
      restNativeArmed=true;
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
  restNativeArmed=false;
  const RA=restAlarm();if(RA){RA.cancel().catch(()=>{});return;}
  const LN=localNotif();if(LN){LN.cancel({notifications:[{id:7001}]}).catch(()=>{});return;}
  try{
    navigator.serviceWorker?.ready.then(reg=>{
      reg.active?.postMessage({type:'cancel-rest'});
      reg.getNotifications({tag:'rest-timer'}).then(ns=>ns.forEach(n=>n.close())).catch(()=>{});
    });
  }catch(e){}
}
// Botón «Probar alarma» (Perfil → Reloj y recuperación), solo en el APK con alarma nativa
function testRestAlarm(){const RA=restAlarm();if(RA){RA.test().catch(()=>{});toast('Debería sonar ya, con el volumen de alarma');}}
function alarmTestHtml(){return restAlarm()?`<button class="rest-btn" style="margin:8px 0 0" onclick="testRestAlarm()">🔔 Probar alarma de descanso</button><div style="font-size:11px;color:var(--t3);margin-top:4px">Suena con el volumen de <b>alarma</b>, también con el móvil en vibración.</div>`:'';}
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
  if(restLeft<=0){
    // Con alarma nativa programada, que suene ella (no se cancela: si la app la cancelase justo antes
    // de dispararse, no sonaría nada). Sin ella, pitido y vibración desde la página.
    // (Antes se cancelaba aquí también la notificación local: con la pantalla encendida la app la quitaba
    // justo antes de sonar y solo quedaba el pitido de la página, que va por el volumen multimedia.)
    const nat=restNativeArmed&&!!(restAlarm()||localNotif());
    endRest(nat);
    if(!nat){vib([300,100,300]);beep();}
    toast('¡Descanso terminado!');
  }
}
function updateRestUI(){const m=Math.floor(restLeft/60),s=restLeft%60;const el=document.getElementById('rest-time');if(el)el.textContent=m+':'+(s<10?'0':'')+s;if(lockOn)updateLockRest();}
function restAdd(s){if(restEndTs===null)return;restEndTs+=s*1000;tickRest();if(restEndTs!==null)scheduleRestNotification(restEndTs);}
function endRest(keepAlarm){clearInterval(restIv);restIv=null;restEndTs=null;if(lockOn)setTimeout(updateLockRest,0);const p=document.getElementById('rest-pill');if(p)p.style.display='none';if(keepAlarm)restNativeArmed=false;else cancelRestNotification();}
function stopRest(){endRest(false);}
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

// ═══ BLOQUEO DE PANTALLA (durante el entreno) ═══
// Capa oscura que se traga todos los toques (bolsillo, sudor, toques sin querer). Se ve la rutina detrás y
// el descanso en marcha. Para desbloquear hay que MANTENER pulsado el candado ~0,8 s.
let lockOn=false,lockHoldT=null;
const LOCK_HOLD_MS=800;
function lockScreen(){
  const ov=document.getElementById('lock-ov');if(!ov)return;
  if(typeof collectInputs==='function'&&activeSess)collectInputs();
  try{document.activeElement?.blur();}catch(e){}
  if(typeof npClose==='function')try{npClose();}catch(e){}
  lockOn=true;ov.classList.add('on');ov.setAttribute('aria-hidden','false');updateLockRest();vib(20);
}
function unlockScreen(){
  lockOn=false;clearTimeout(lockHoldT);lockHoldT=null;
  const ov=document.getElementById('lock-ov');if(!ov)return;
  ov.classList.remove('on','holding');ov.setAttribute('aria-hidden','true');vib(30);
}
function updateLockRest(){
  const el=document.getElementById('lock-rest');if(!el||!lockOn)return;
  el.textContent=restEndTs!==null?`Descanso ${Math.floor(restLeft/60)}:${String(restLeft%60).padStart(2,'0')}`:'';
}
(function initLock(){
  const ov=document.getElementById('lock-ov'),ring=document.getElementById('lock-ring');if(!ov||!ring)return;
  const stop=e=>{e.preventDefault();e.stopPropagation();};
  // La capa no deja pasar nada: ni toques, ni clics, ni teclado, ni menú contextual
  ['click','dblclick','touchstart','touchmove','touchend','mousedown','mouseup','contextmenu','wheel','keydown'].forEach(t=>ov.addEventListener(t,e=>{if(!lockOn)return;if(e.target.closest&&e.target.closest('#lock-ring')&&t!=='click'&&t!=='contextmenu'&&t!=='wheel'&&t!=='keydown'&&t!=='dblclick')return;stop(e);},{passive:false}));
  const down=e=>{if(!lockOn)return;stop(e);ov.classList.add('holding');clearTimeout(lockHoldT);lockHoldT=setTimeout(unlockScreen,LOCK_HOLD_MS);};
  const up=e=>{if(!lockOn)return;stop(e);ov.classList.remove('holding');clearTimeout(lockHoldT);lockHoldT=null;};
  ring.addEventListener('pointerdown',down);
  ['pointerup','pointercancel','pointerleave'].forEach(t=>ring.addEventListener(t,up));
  // Con la pantalla bloqueada, el teclado tampoco hace nada (salvo que el foco estuviese fuera de la app)
  document.addEventListener('keydown',e=>{if(lockOn){e.preventDefault();e.stopPropagation();}},true);
})();
