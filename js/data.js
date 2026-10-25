// data.js — Supabase: autenticación, almacenamiento local/remoto, cola de sincronización y sesión en curso.
// ═══ SUPABASE CONFIG ═══
// Replace these with your actual Supabase project values
const SUPABASE_URL = 'https://yltxrtuebbpckehsfhex.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdHhydHVlYmJwY2tlaHNmaGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODMzMjQsImV4cCI6MjA5NjE1OTMyNH0.WN-JcA96x6r7r6UxWb9pksxpCfjvMySNv4rbs1toDSo';
let sbClient = null;
let supabaseUser = null;
let useSupabase = false;

function initSupabase(){
  try {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  } catch(e) {
    console.warn('Supabase init failed, running in local mode:', e);
    return false;
  }
}

// ═══ AUTH ═══
async function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  if(!email||!pw){errEl.textContent='Rellena email y contraseña';errEl.style.display='block';return;}
  try {
    const {data, error} = await sbClient.auth.signInWithPassword({email, password:pw});
    if(error) throw error;
    await afterLogin(data.user);
  } catch(e) {
    errEl.textContent = e.message||'Error al iniciar sesión';
    errEl.style.display = 'block';
  }
}
async function doSignup(){
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  if(!email||!pw){errEl.textContent='Rellena email y contraseña';errEl.style.display='block';return;}
  if(pw.length<6){errEl.textContent='La contraseña debe tener al menos 6 caracteres';errEl.style.display='block';return;}
  try {
    const {data, error} = await sbClient.auth.signUp({email, password:pw});
    if(error) throw error;
    if(data.user) await afterLogin(data.user);
    else {errEl.style.color='var(--teal)';errEl.textContent='Revisa tu email para confirmar la cuenta';errEl.style.display='block';}
  } catch(e) {
    errEl.textContent = e.message||'Error al crear cuenta';
    errEl.style.display = 'block';
  }
}
async function afterLogin(user){
  supabaseUser = user;
  useSupabase = true;
  document.getElementById('logout-btn').style.display = 'block';
  document.getElementById('logout-btn').textContent = user.email.split('@')[0];
  await Promise.all([loadDBFromSupabase(), loadExercisesDB()]);
  // Set default username from email if not set
  if(!db.profile?.username && supabaseUser?.email){
    if(!db.profile) db.profile={};
    db.profile.username = supabaseUser.email.split('@')[0];
    saveDB();
  }
  showAppScreens();
}
function skipLogin(){
  useSupabase = false;
  supabaseUser = null;
  // Local mode: always start with clean DB (no seed data)
  const lk = lsKey();
  try{ localStorage.removeItem(lk); }catch(e){}
  loadDB();
  loadExercisesDB();
  document.getElementById('logout-btn').style.display='block';
  document.getElementById('logout-btn').textContent='Salir';
  showAppScreens();
}
async function doLogout(){
  if(!await dlgConfirm('¿Cerrar sesión?')) return;
  if(sbClient) await sbClient.auth.signOut();
  supabaseUser = null; useSupabase = false;
  document.getElementById('logout-btn').style.display='none';
  document.getElementById('login-overlay').style.display='flex';
  document.getElementById('login-email').value='';
  document.getElementById('login-password').value='';
  document.getElementById('login-error').style.display='none';
}
function showAppScreens(){
  const overlay=document.getElementById('login-overlay');if(overlay)overlay.style.display='none';
  navHome();updateSyncBadge();flushSyncQueue();checkRestoreSession();
  setTimeout(()=>{if(GIF_DB)prefetchRoutineGifs();},4000);
}

// ═══ STORAGE ═══
// IndexedDB: copia de respaldo de la base local (sin el límite de ~5 MB de localStorage)
function idbOpen(){return new Promise((res,rej)=>{try{const r=indexedDB.open('peak-physique',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});}
async function idbPut(k,v){try{const d=await idbOpen();await new Promise((res,rej)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(JSON.parse(JSON.stringify(v)),k);t.oncomplete=res;t.onerror=()=>rej(t.error);});d.close();}catch(e){}}
async function idbGet(k){try{const d=await idbOpen();const v=await new Promise((res,rej)=>{const r=d.transaction('kv').objectStore('kv').get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});d.close();return v??null;}catch(e){return null;}}
function lsKey(){return 'gtv6_'+(supabaseUser?.id||'local');}

function loadDB(){
  invalidateExCache();
  try{const d=localStorage.getItem(lsKey());db=d?JSON.parse(d):{};}catch(e){db={};}
  if(!db.sessions)db.sessions=[];
  if(!db.templates)db.templates=JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
  if(!db.weights)db.weights=[];
  if(!db.measures)db.measures=[];
  if(!db.profile)db.profile={height:null,sex:'male',age:30};
  if(!db.steps)db.steps=[];
  if(!db.biometrics)db.biometrics=[];
  // No seed data — start clean for new users
  canonExNames();
  recalcAllE1RM();
}

async function loadDBFromSupabase(){
  invalidateExCache();
  if(!sbClient||!supabaseUser){loadDB();return;}
  try {
    const uid = supabaseUser.id;
    // Load all tables in parallel
    let prevBio=[];try{prevBio=JSON.parse(localStorage.getItem(lsKey()))?.biometrics||[];}catch(e){}
    const bioFrom=addDays(todayStr(),-120);
    const [sessRes, wRes, stRes, mRes, pRes, bRes] = await Promise.all([
      sbClient.from('sessions').select('*').eq('user_id',uid).order('date',{ascending:false}),
      sbClient.from('weights').select('*').eq('user_id',uid).order('date'),
      sbClient.from('steps').select('*').eq('user_id',uid).order('date'),
      sbClient.from('measures').select('*').eq('user_id',uid).order('week'),
      sbClient.from('profiles').select('*').eq('id',uid).single(),
      // Modelo v2 (sql/2026-10-25-modelo-v2.sql): si la tabla no existe aún, la app sigue como antes
      sbClient.from('biometric_daily').select('*').eq('user_id',uid).gte('day',bioFrom).then(r=>r,e=>({error:e})),
    ]);
    v2Ready=!bRes?.error;
    // Initialise db
    db = {sessions:[],weights:[],steps:[],measures:[],biometrics:[],templates:DEFAULT_TEMPLATES,profile:{height:null,sex:'male',age:30}};
    if(!sessRes.error) db.sessions = (sessRes.data||[]).map(r=>({...sessMetaIn(r.meta), id:r.id, date:r.date, name:r.name, dayName:r.day_name, durationMin:r.duration_min??null, kcalWatch:r.kcal_watch??null, exercises:typeof r.exercises==='string'?JSON.parse(r.exercises):(r.exercises||[])}));
    db.biometrics = mergeBiometrics(prevBio, v2Ready ? (bRes.data||[]).map(bioFromRow) : []);
    if(!wRes.error) db.weights = (wRes.data||[]).map(r=>({date:r.date,kg:parseFloat(r.kg)}));
    if(!stRes.error) db.steps = (stRes.data||[]).map(r=>({date:r.date,steps:r.steps}));
    if(!mRes.error) db.measures = (mRes.data||[]).map(r=>({...r.data,week:r.week,date:r.date}));
    if(!pRes.error&&pRes.data){
      db.profile = {height:pRes.data.height,sex:pRes.data.sex||'male',age:pRes.data.age||30,username:pRes.data.username};
      if(pRes.data.settings&&typeof pRes.data.settings==='object'){const st=pRes.data.settings;if(st.restDays)db.profile.restDays=st.restDays;if(st.gifMap)db.profile.gifMap=st.gifMap;if(st.landmarks)db.profile.landmarks=st.landmarks;if(st.secMap)db.profile.secMap=st.secMap;if(Array.isArray(st.mesoLog))db.profile.mesoLog=st.mesoLog;}
      if(pRes.data.templates&&pRes.data.templates.length) db.templates=pRes.data.templates;
    }
    // No seed data — new users start clean
    // Cache locally
    localStorage.setItem(lsKey(), JSON.stringify(db));
  } catch(e) {
    console.warn('Supabase load failed, using localStorage:', e);
    loadDB();
    // Sin conexión y sin copia en localStorage (p. ej. lleno o borrado): se recupera de IndexedDB
    if(!(db.sessions||[]).length){const b=await idbGet(lsKey());if(b&&(b.sessions||[]).length){db=b;if(!db.biometrics)db.biometrics=[];}}
  }
  canonExNames();
  recalcAllE1RM();
}
// Ejercicios renombrados: el historial y los ajustes guardados con el nombre antiguo siguen enlazados
function canonExNames(){
  PPCore.canonExList(db.sessions);PPCore.canonExList(db.templates);
  if(db.profile?.gifMap)db.profile.gifMap=PPCore.canonExKeys(db.profile.gifMap,false);
  if(db.profile?.secMap)db.profile.secMap=PPCore.canonExKeys(db.profile.secMap,true);
}

async function saveDB(){
  invalidateExCache();
  // Always save to localStorage first (fast, offline-safe) + copia sin límite de tamaño en IndexedDB
  try{localStorage.setItem(lsKey(),JSON.stringify(db));}catch(e){console.warn('localStorage lleno: queda la copia de IndexedDB',e);}
  idbPut(lsKey(),db);
  // Then sync to Supabase if connected
  if(!useSupabase||!sbClient||!supabaseUser) return;
  const uid = supabaseUser.id;
  try {
    // Sync profile + templates
    await sbClient.from('profiles').upsert({
      id:uid, height:db.profile?.height, sex:db.profile?.sex||'male',
      age:db.profile?.age||30, username:db.profile?.username, templates:db.templates, updated_at:new Date().toISOString()
    });
  } catch(e){ console.warn('Profile sync error:', e); }
  saveSettingsRemote();
}

// Granular saves for individual records (faster than full sync).
// NOTE: supabase-js v2 returns {error} instead of throwing — must check it explicitly,
// otherwise RLS/network failures are silently swallowed. Failed ops go to a pending
// sync queue that is retried when connectivity/auth returns.
async function saveSession(sess){
  if(v2Ready)PPCore.ensureV2Ids(sess); // ids estables de sesión, ejercicio y serie para las tablas v2
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  const row={id:sess.id, user_id:supabaseUser.id, date:sess.date, name:sess.name, day_name:sess.dayName, duration_min:sess.durationMin??null, kcal_watch:sess.kcalWatch??null, exercises:sess.exercises};
  if(v2Ready)row.meta=sessMetaOut(sess);
  try {
    const {error} = await sbClient.from('sessions').upsert(row);
    if(error) throw error;
  } catch(e){ queueSync({t:'upsert',table:'sessions',row}); console.warn('Session save error:', e); return; }
  await saveSessionV2(sess);
}
// ═══ MODELO V2 (una fila por serie) ═══
// Escritura doble: la tabla sessions (jsonb) sigue siendo la fuente de verdad de la app; las tablas v2
// (workout_sessions · exercise_entries · set_entries) se reemplazan enteras en cada guardado. Si algo falla,
// volver a ejecutar sql/2026-10-25-modelo-v2.sql rellena los huecos desde sessions.
let v2Ready=false;
const SESS_META=['uid','plannedSets','readiness','timeBudget','timePlan'];
function sessMetaOut(s){const m={};SESS_META.forEach(k=>{if(s[k]!=null)m[k]=s[k];});return Object.keys(m).length?m:null;}
function sessMetaIn(m){const o={};if(m&&typeof m==='object')SESS_META.forEach(k=>{if(m[k]!=null)o[k]=m[k];});return o;}
function exIdOf(name){const k=normExName(name);return ALL_EX.find(e=>normExName(e.name)===k)?.id??null;}
async function saveSessionV2(sess){
  if(!v2Ready||!useSupabase||!sbClient||!supabaseUser)return;
  try{
    const uid=supabaseUser.id,v=PPCore.toV2Rows(sess,uid,exIdOf);
    let r=await sbClient.from('workout_sessions').delete().eq('user_id',uid).eq('legacy_session_id',sess.id);if(r.error)throw r.error;
    r=await sbClient.from('workout_sessions').insert(v.session);if(r.error)throw r.error;
    if(v.entries.length){r=await sbClient.from('exercise_entries').insert(v.entries);if(r.error)throw r.error;}
    if(v.sets.length){r=await sbClient.from('set_entries').insert(v.sets);if(r.error)throw r.error;}
  }catch(e){console.warn('Modelo v2: no se pudo escribir la sesión (se recupera re-ejecutando la migración):',e);}
}
// Biometría diaria: {date, hrv, rhr, sleepMin, sleepEff, steps, weight, subj:{sleep,soreness,energy}, src:{...}}
function bioFromRow(x){return{date:x.day,hrv:x.hrv_rmssd_ms!=null?+x.hrv_rmssd_ms:null,rhr:x.resting_hr_bpm!=null?+x.resting_hr_bpm:null,sleepMin:x.sleep_min??null,sleepEff:x.sleep_efficiency!=null?+x.sleep_efficiency:null,steps:x.steps??null,weight:x.weight_kg!=null?+x.weight_kg:null,
  subj:(x.subj_sleep||x.subj_soreness||x.subj_energy)?{sleep:x.subj_sleep,soreness:x.subj_soreness,energy:x.subj_energy}:null,src:x.sources||{}};}
function bioToRow(b,uid){return{user_id:uid,day:b.date,hrv_rmssd_ms:b.hrv??null,resting_hr_bpm:b.rhr??null,sleep_min:b.sleepMin!=null?Math.round(b.sleepMin):null,sleep_efficiency:b.sleepEff??null,steps:b.steps??null,weight_kg:b.weight??null,
  subj_sleep:b.subj?.sleep??null,subj_soreness:b.subj?.soreness??null,subj_energy:b.subj?.energy??null,sources:b.src||{},updated_at:new Date().toISOString()};}
// La nube manda en los campos que trae; lo local se conserva en el resto (y los días que la nube aún no tiene)
function mergeBiometrics(local,remote){
  const by={};(local||[]).forEach(b=>{if(b?.date)by[b.date]={...b};});
  (remote||[]).forEach(b=>{const o=by[b.date]||{};Object.entries(b).forEach(([k,v])=>{if(v!=null&&!(k==='src'&&!Object.keys(v).length))o[k]=v;});by[b.date]=o;});
  return Object.values(by).sort((a,b)=>a.date.localeCompare(b.date));
}
async function saveBiometricRemote(b){
  saveDB();
  if(!v2Ready||!useSupabase||!sbClient||!supabaseUser||!b?.date)return;
  try{const{error}=await sbClient.from('biometric_daily').upsert(bioToRow(b,supabaseUser.id));if(error)throw error;}
  catch(e){console.warn('Biometría: no se pudo guardar en la nube (queda en local):',e);}
}
async function deleteSessionRemote(id){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  try {
    const {error} = await sbClient.from('sessions').delete().eq('id',id).eq('user_id',supabaseUser.id);
    if(error) throw error;
  } catch(e){ queueSync({t:'delete',table:'sessions',match:{id,user_id:supabaseUser.id}}); console.warn('Session delete error:', e); }
  if(v2Ready){try{await sbClient.from('workout_sessions').delete().eq('user_id',supabaseUser.id).eq('legacy_session_id',id);}catch(e){}}
}
async function saveWeightRemote(kg, date){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  const row={user_id:supabaseUser.id,date,kg};
  try {
    const {error} = await sbClient.from('weights').upsert(row);
    if(error) throw error;
  } catch(e){ queueSync({t:'upsert',table:'weights',row}); console.warn('Weight save error:', e); }
}
async function deleteWeightRemote(date){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  try {
    const {error} = await sbClient.from('weights').delete().eq('user_id',supabaseUser.id).eq('date',date);
    if(error) throw error;
  } catch(e){ queueSync({t:'delete',table:'weights',match:{user_id:supabaseUser.id,date}}); console.warn('Weight delete error:', e); }
}
async function saveStepsRemote(date, steps){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  const row={user_id:supabaseUser.id,date,steps};
  try {
    const {error} = await sbClient.from('steps').upsert(row);
    if(error) throw error;
  } catch(e){ queueSync({t:'upsert',table:'steps',row}); console.warn('Steps save error:', e); }
}
async function deleteStepsRemote(date){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  try {
    const {error} = await sbClient.from('steps').delete().eq('user_id',supabaseUser.id).eq('date',date);
    if(error) throw error;
  } catch(e){ queueSync({t:'delete',table:'steps',match:{user_id:supabaseUser.id,date}}); console.warn('Steps delete error:', e); }
}
async function saveMeasureRemote(entry){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  const row={user_id:supabaseUser.id,week:entry.week,date:entry.date,data:entry};
  try {
    const {error} = await sbClient.from('measures').upsert(row);
    if(error) throw error;
  } catch(e){ queueSync({t:'upsert',table:'measures',row}); console.warn('Measure save error:', e); }
}
async function deleteMeasureRemote(week){
  saveDB();
  if(!useSupabase||!sbClient||!supabaseUser) return;
  try {
    const {error} = await sbClient.from('measures').delete().eq('user_id',supabaseUser.id).eq('week',week);
    if(error) throw error;
  } catch(e){ queueSync({t:'delete',table:'measures',match:{user_id:supabaseUser.id,week}}); console.warn('Measure delete error:', e); }
}

// ═══ PENDING SYNC QUEUE ═══
// Writes that failed (offline, expired token, RLS hiccup) are stored here and
// retried on 'online', after login, or by tapping the ⚠ badge in the header.
function syncQKey(){return 'gt_syncq_'+(supabaseUser?.id||'local');}
function getSyncQ(){try{return JSON.parse(localStorage.getItem(syncQKey()))||[];}catch(e){return[];}}
function setSyncQ(q){try{localStorage.setItem(syncQKey(),JSON.stringify(q));}catch(e){} updateSyncBadge();}
function queueSync(op){const q=getSyncQ();q.push(op);setSyncQ(q);toast('⚠ Guardado en local — pendiente de sincronizar');}
async function flushSyncQueue(){
  if(!useSupabase||!sbClient||!supabaseUser){updateSyncBadge();return;}
  const q=getSyncQ();
  if(!q.length)return;
  const remaining=[];
  for(const op of q){
    try{
      let error;
      if(op.t==='upsert'){({error}=await sbClient.from(op.table).upsert(op.row));}
      else if(op.t==='delete'){
        let qb=sbClient.from(op.table).delete();
        for(const[k,v]of Object.entries(op.match||{}))qb=qb.eq(k,v);
        ({error}=await qb);
      }
      if(error)throw error;
    }catch(e){remaining.push(op);}
  }
  setSyncQ(remaining);
  if(!remaining.length&&q.length)toast('Sincronización completada ✓');
}
function updateSyncBadge(){
  let b=document.getElementById('sync-badge');
  const n=getSyncQ().length;
  if(!b){
    const hr=document.querySelector('.hdr-right');if(!hr)return;
    b=document.createElement('button');b.id='sync-badge';b.title='Cambios pendientes de sincronizar — toca para reintentar';
    b.style.cssText='display:none;align-items:center;gap:3px;font-size:11px;color:var(--amber);font-family:var(--mono);background:transparent;border:1px solid var(--amber);border-radius:20px;padding:4px 9px;cursor:pointer';
    b.onclick=()=>flushSyncQueue();
    hr.prepend(b);
  }
  b.textContent='⚠ '+n;
  b.style.display=n?'flex':'none';
}

// ═══ ACTIVE SESSION PERSISTENCE ═══
// The in-progress workout is stashed in localStorage on every mutation, because
// beforeunload does NOT fire reliably in standalone PWAs and the OS kills
// backgrounded web apps freely. Without this, a phone call mid-workout = data loss.
function activeKey(){return 'gt_active_'+(supabaseUser?.id||'local');}
function persistActive(){
  try{
    if(activeSess&&!activeSess.isTmplEdit)
      localStorage.setItem(activeKey(),JSON.stringify({sess:activeSess,startedAt:sessStartTs||Date.now()}));
    else localStorage.removeItem(activeKey());
  }catch(e){}
}
function clearActiveStash(){try{localStorage.removeItem(activeKey());}catch(e){}}
async function checkRestoreSession(){
  if(activeSess)return;
  let stash=null;
  try{stash=JSON.parse(localStorage.getItem(activeKey()));}catch(e){}
  if(!stash?.sess)return;
  PPCore.canonExList([stash.sess]);
  const mins=Math.max(0,Math.round((Date.now()-(stash.startedAt||Date.now()))/60000));
  const nm=stash.sess.name||'Entrenamiento';
  if(await dlgConfirm(`Tienes un entrenamiento sin terminar: «${nm}» (empezado hace ${mins} min). ¿Quieres continuarlo?`)){
    activeSess=stash.sess;
    sessStartTs=stash.startedAt||Date.now();
    clearInterval(timerIv);timerIv=setInterval(updateTimer,1000);updateTimer();
    acquireWakeLock();
    const ni=document.getElementById('sess-name');if(ni)ni.value=nm;
    const ki=document.getElementById('sess-kcal');if(ki)ki.value=activeSess.kcalWatch??'';
    document.querySelectorAll('.bn').forEach(b=>b.classList.remove('on'));
    showScr('sess',null);renderSessExs();
  } else clearActiveStash();
}

// ═══ PROFILE ═══
// setProfile removed — single profile per account
// togglePareja removed

// ═══ NAV ═══
function showScr(n,el){
  if(n!=='sess'&&typeof hideRirAsk==='function')hideRirAsk();
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
  const sc=document.getElementById('s-'+n);if(sc)sc.classList.add('on');
  updateHdr(n);renderCurrentScr(n);updateResumeBar();
}
function renderCurrentScr(n){
  const a=n||curScr();
  if(a==='home')renderHome();
  else if(a==='train'){renderCal();renderDayPanel();renderWeekScr();}
  else if(a==='vol')renderVolScr();
  else if(a==='stats')renderProg();
  else if(a==='profile')renderProfileScr();
  else if(a==='activity')renderActivityScr();
  else if(a==='perfil')renderPerfil();
  else if(a==='hyper')renderHyperScr();
}
