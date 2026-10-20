// gifs.js — Animaciones de ejercicios (dataset hasaneyldrm) y ajustes sincronizados en profiles.settings.
// ─── GIFs (hasaneyldrm/exercises-dataset · media © Gym visual) ───────
const GIF_BASE='https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';
let GIF_DB=null,GIF_AUTO={};
function gifUrl(e){return `${GIF_BASE}videos/${e.i}-${e.m}.gif`;}
function gifThumb(e){return `${GIF_BASE}images/${e.i}-${e.m}.jpg`;}
async function loadGifIndex(){
  try{const c=localStorage.getItem('exgifs_v1');if(c){GIF_DB=JSON.parse(c);}}catch(e){}
  try{const r=await fetch('exgifs.json');if(r.ok){GIF_DB=await r.json();try{localStorage.setItem('exgifs_v1',JSON.stringify(GIF_DB));}catch(e){}}}catch(e){}
  if(!GIF_DB){try{const r=await fetch(GIF_BASE+'data/exercises.json');const d=await r.json();GIF_DB=d.map(e=>({i:e.id,n:e.name,t:e.target,e:e.equipment,m:e.media_id}));}catch(e){}}
  if(GIF_DB){GIF_AUTO={};refreshGifThumbs();setTimeout(prefetchRoutineGifs,3000);}
}
// ─── Precarga para usar las animaciones sin conexión ────────────────
// Se guardan en la misma caché que usa sw.js; las que ya están no se vuelven a descargar.
const GIF_CACHE='pp-gifs-v1';
async function prefetchGifs(names){
  try{
    if(!('caches' in window)||!GIF_DB||navigator.onLine===false||navigator.connection?.saveData)return 0;
    const urls=[...new Set(names.map(getGif).filter(Boolean).flatMap(e=>[gifUrl(e),gifThumb(e)]))];
    const c=await caches.open(GIF_CACHE);let n=0;
    for(const u of urls){if(await c.match(u))continue;try{const r=await fetch(u,{mode:'cors'});if(r.ok){await c.put(u,r);n++;}}catch(e){}}
    return n;
  }catch(e){return 0;}
}
// Ejercicios de tus rutinas y de tus últimas 12 sesiones
function prefetchRoutineGifs(){
  const names=new Set();
  (db.templates||[]).forEach(t=>t.exercises?.forEach(e=>names.add(e.name)));
  [...(db.sessions||[])].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).forEach(s=>s.exercises?.forEach(e=>names.add(e.name)));
  return prefetchGifs([...names]);
}
function refreshGifThumbs(){document.querySelectorAll('[data-gifn]').forEach(el=>{const e=getGif(el.dataset.gifn);if(e){if(el.tagName==='IMG'){el.src=gifThumb(e);}else{const img=document.createElement('img');img.className=el.className.replace('ph','');img.src=gifThumb(e);img.loading='lazy';img.dataset.gifn=el.dataset.gifn;img.onclick=ev=>{ev.stopPropagation();openExView(img.dataset.gifn);};el.replaceWith(img);}}});if(exViewName!=null)renderExView();}
// Diccionario ES→EN de tokens (nombre) y músculo→target
const GIF_MUS_RAW={'Pectoral':['pectorals'],'Espalda':['lats','upper back'],'Tríceps':['triceps'],'Bíceps':['biceps'],'Glúteos':['glutes'],'Isquiosurales':['hamstrings'],'Isquiotibiales':['hamstrings'],'Cuádriceps':['quads'],'Gemelos':['calves'],'Sóleo':['calves'],'Deltoides anterior':['delts'],'Deltoides lateral':['delts'],'Hombro posterior':['delts','upper back'],'Deltoides posterior':['delts','upper back'],'Aductores':['adductors'],'Abductores':['abductors'],'Abdomen':['abs'],'Abdominales':['abs'],'Core':['abs'],'Antebrazo':['forearms'],'Antebrazos':['forearms'],'Trapecio':['traps','upper back'],'Lumbar':['spine']};
const GIF_MUS=new Proxy(GIF_MUS_RAW,{get:(o,k)=>o[k]||o[Object.keys(o).find(x=>x.toLowerCase()===String(k).toLowerCase())]||(/gemelo|s[oó]leo/i.test(k)?['calves']:/delt|hombro/i.test(k)?['delts']:/abd|core/i.test(k)?['abs']:undefined)});
const GIF_EQ={'Poleas':['cable'],'Máquina':['leverage machine','sled machine','smith machine','assisted'],'Peso libre':['dumbbell','barbell','ez barbell','kettlebell','body weight','weighted']};
const GIF_DICT=[ // [regex ES, tokens EN ('|' = alternativas), peso]
  [/hip ?thrust|skorcher/,'glute bridge',4],[/peso muerto rumano|pm rumano|rumano|\brdl\b/,'romanian deadlift',4],[/peso muerto|\bpm\b|deadlift/,'deadlift',3],[/sumo/,'sumo',2],[/piernas r[ií]gidas|sldl|stiff/,'stiff leg|straight leg',3],
  [/b[uú]lgar/,'single leg split squat',4],[/split squat/,'split squat',4],[/zancada|lunge|estocada/,'lunge',3],[/sentadilla|squat/,'squat',3],[/hack/,'hack',3],[/goblet/,'goblet',3],[/pistol/,'pistol',3],[/barra alta|high bar/,'high bar',3],[/barra baja|low bar/,'low bar',3],[/frontal.*sentadilla|front squat/,'front squat',3],[/sissy/,'sissy',4],[/belt/,'belt',2],[/pendulum/,'pendulum',2],[/step ?up/,'step-up',4],
  [/prensa|leg press/,'leg press',4],[/45/,'45',1.5],[/horizontal/,'horizontal',1.5],[/extensi[oó]n(es)? de cu[aá]d|extensi[oó]n de pierna|leg extension/,'leg extension',4],
  [/curl femoral|curl de pierna|leg curl|femoral/,'leg curl',4],[/n[oó]rdic/,'nordic|inverse leg curl',3],[/glute ham|ghr/,'glute-ham',4],[/buenos d[ií]as|good morning/,'good morning',4],
  [/gemelo|calf|pantorrilla|s[oó]leo|puntillas/,'calf',4],[/aduc|adduct/,'hip adduction',4],[/abduc/,'hip abduction',5],[/patada|kick ?back|glute press down/,'kickback|hip extension',3],[/puente|glute bridge/,'glute bridge',3],[/frog/,'frog|glute bridge',3],[/clam/,'clam|hip abduction',3],[/monster|walk/,'walk',3],
  [/hiperextensi|hyperextension|extensi[oó]n lumbar|back extension|extensiones (en )?banco inclinado|focus gl[uú]teo|focus isqui/,'hyperextension',4],[/reverse glute|reverse hyper/,'reverse hyperextension',4],[/pull ?through/,'pull through',4],
  [/jal[oó]n|pulldown|dorsalera/,'pulldown',4],[/dominada|pull[- ]?up|chin/,'pull-up',4],[/pull ?over/,'pullover',4],[/rack pull/,'rack pull',4],
  [/remo al ment[oó]n|upright/,'upright row',4],[/remo|row/,'row',3],[/gironda/,'cable seated row',4],[/pendlay/,'bent over row',2],[/t[- ]?bar|remo en t\b/,'t-bar|t bar',3],[/face ?pull/,'face pull',4],[/encogimiento|shrug/,'shrug',4],[/landmine/,'landmine',3],[/seal row/,'incline row',2],[/meadows|helms|dante/,'row',1],
  [/press (de )?banca|bench press|press plano|press banca|press.*(m[aá]quina|prono|lateral)/,'bench press|chest press',3],[/inclinad|incline/,'incline',1.9],[/declinad|decline/,'decline',1.9],[/chest press|press de pecho/,'chest press',3],[/hex press|squeeze/,'squeeze|close',1.5],[/press estrecho|agarre estrecho|close[- ]grip/,'close',1.9],
  [/apertura|fly|flyes|pec[- ]?deck|pec-fly|contractor/,'fly',3],[/cruce|crossover/,'crossover|fly',2],[/fondos|dip/,'dip',4],[/flexi[oó]n(es)|push[- ]?up/,'push-up',3],[/press/,'press',2],
  [/press (de )?hombro|press militar|shoulder press|overhead press/,'shoulder press',3],[/arnold/,'arnold',3],
  [/elevaci[oó]n(es)? lateral|evaciones laterales|lateral raise|elev\. laterales|laterales|butterfly/,'lateral raise',4],[/elevaci[oó]n(es)? frontal|front raise/,'front raise',4],[/p[aá]jaro|reverse (cable )?cross|rear delt|delt\.? posterior|hang & swing/,'rear delt|reverse fly',3],[/contractora invertida|reverse pec/,'reverse fly',4],
  [/curl/,'curl',3],[/martillo|hammer/,'hammer',3],[/predicador|scott|preacher/,'preacher',3],[/concentrad/,'concentration',3],[/bayesian/,'curl',1],[/ara[ñn]a|spider/,'spider',3],[/drag/,'drag',3],[/zottman/,'zottman',3],[/doble b[ií]ceps|double biceps/,'overhead curl',3],
  [/press franc[eé]s|skull|rompecr[aá]neo|lying triceps/,'lying triceps extension',4],[/tras ?nuca|overhead|por encima|sobre la cabeza/,'overhead',3],[/extensi[oó]n.*polea alta|polea alta.*extensi|pushdown|tr[ií]ceps en polea alta/,'pushdown',4],[/extensi[oó]n(es)? (de )?(tr[ií]ceps|codo)|triceps extension/,'triceps',2.5],[/kaz/,'pushdown|close',2],[/jm press/,'close-grip press|close',2],[/tate/,'tate|lying triceps',2],[/katana/,'triceps extension',2],
  [/cuerda|rope/,'rope',1.5],
  [/plancha|plank/,'plank',4],[/crunch|abdominal/,'crunch',3],[/encogimientos de piernas/,'leg raise',3],[/elevaci[oó]n(es)? de piernas|leg raise/,'leg raise',4],[/rueda|wheel|roll ?out|roller/,'roller|wheel',3],[/russian|ruso/,'russian twist',3],[/pallof/,'pallof',4],[/\bv-?ups?\b/,'v-up',4],[/wood ?chop|le[ñn]ador/,'chop|twist',2],[/body saw|stir the pot|saw/,'plank',2.5],[/colgad|hanging/,'hanging',3],
  [/mu[ñn]eca|wrist/,'wrist curl',3],[/agarre en m[aá]quina|grip machine/,'gripper|gripless',3],[/twist|rotaci[oó]n|rolling/,'twist',2],
  [/sentad[oa]/,'seated',1],[/de pie|standing/,'standing',1],[/tumbad|lying|acostad/,'lying',1.5],[/unilateral|una mano|un brazo|una pierna|single|one arm/,'one arm|single leg|one leg|unilateral',1.5],[/altern/,'alternate',1.5],[/agarre ancho|wide/,'wide',1.5],[/neutro|neutral|hammer grip/,'neutral|parallel|hammer',1.5],[/supin/,'underhand|reverse',1.5],[/invers|invertid|reverse|reverse grip/,'reverse',1.5],[/torso inclinado|bent over/,'bent over',1.9],[/alto|high/,'high',1.5],[/bajo|low/,'low',1],[/arrodillad|kneeling|cuadrupedia/,'kneeling',1.5],[/d[eé]ficit/,'deficit',1],
  [/mancuerna|dumb?bell|\bdb\b/,'dumbbell',1.9],[/barra z|ez/,'ez',1.9],[/barra|barbell/,'barbell',1.8],[/polea|cable/,'cable',1.9],[/multipower|\bmp\b|smith/,'smith',1.9],[/m[aá]quina|machine|convergente|plate-loaded/,'lever|machine',1.8],[/kettlebell|pesa rusa/,'kettlebell',1.9],[/goma|banda|band/,'band',1.9],[/trx|anillas|suspensi/,'suspension|suspended',1.9],[/bal[oó]n|ball|fitball/,'ball',1.5],[/lastrad|weighted/,'weighted',1.5],[/en banco|bench/,'bench',.5],
];
// Modificadores del nombre EN que penalizan si el nombre ES no los menciona
const GIF_MODS=[['alternate',/altern/],['one arm',/unilateral|una mano|un brazo|single|one arm/],['single leg',/unilateral|una pierna|single|b[uú]lgar/],['one leg',/unilateral|una pierna|single/],['unilateral',/unilateral|una mano|un brazo|single/],['kneeling',/arrodillad|kneeling|cuadrupedia/],['incline',/inclinad|incline/],['decline',/declinad|decline/],['reverse',/invers|invertid|reverse|supin|revers/],['close',/estrecho|cerrado|close|kaz|jm|hex/],['wide',/ancho|wide/],['seated',/sentad|seated/],['standing',/de pie|standing/],['lying',/tumbad|lying|acostad/],['female',/female/],['v. ',/v\.|v[0-9]/],['assisted',/asistid|assisted/],['band',/goma|banda|band/],['rope',/cuerda|rope/],['hammer',/martillo|hammer|neutro/],['preacher',/predicador|scott|preacher/],['rear',/posterior|p[aá]jaro|rear|reverse/],['front',/frontal|front/],['side',/lateral|side|oblicuo/],['bent over',/inclinado|bent over|pendlay/],['twisting',/rotaci|twist/],['stretch',/estiramiento|stretch/],['jump',/salto|jump/],['pov',/pov/],['chair',/silla|chair/],['l-pull',/\bl-/],['rocky',/rocky/],['bench pull',/bench pull/],['breeding',/breeding/],['concentration',/concentrad|concentration/],['spider',/ara[ñn]a|spider/],['zottman',/zottman/],['overhead',/tras ?nuca|overhead|por encima|sobre la cabeza|doble b[ií]ceps/],['sumo',/sumo/],['high',/alto|high/],['low',/bajo|low/],['march',/march/],['with',/con |with/],['floor',/suelo|floor/],['step',/step|escal/],['inverse',/n[oó]rdic|inverse/],['self',/self/],['(male)',/male/],['narrow',/estrecho|narrow|cerrado/],['gripless',/gripless|sin agarre/],['arm blaster',/blaster/],['sz-bar',/sz|ez|barra z/],['ez',/\bez\b|barra z/],['straight arm',/brazos? rectos?|straight arm/],['pro lat',/pro lat/],['full range',/full range|rango completo/],['bar lateral',/barra/]];
function gifScore(ex,cand){
  const q=(ex.name||'').toLowerCase();const cn=cand.n.toLowerCase();
  let sc=0,hits=0,core=0;const got=[];
  GIF_DICT.forEach(([re,tok,w])=>{if(re.test(q)){const alt=tok.split('|').find(a=>a.split(' ').every(t=>cn.includes(t)));if(alt){sc+=w;hits++;if(w>=2)core++;got.push(alt);}else sc-=w*.6;}});
  if(!hits||!core)return -99;
  const posture=/^(seated|standing|lying|with|floor|bench)$/;
  GIF_MODS.forEach(([tok,re])=>{if(cn.includes(tok)&&!re.test(q)&&!got.some(g=>g.includes(tok)))sc-=(tok==='stretch'||tok==='female'?4:posture.test(tok)?.6:3);});
  const tg=GIF_MUS[normMuscle(ex.muscle)]||[];if(tg.includes(cand.t))sc+=2.2;else if(tg.length)sc-=.8;
  const eq=GIF_EQ[ex.equipment]||[];if(eq.length){if(eq.includes(cand.e))sc+=1;else sc-=.6;}
  sc-=cn.split(/\s+/).length*.15;
  return sc;
}
function getGif(name){
  if(!GIF_DB)return null;
  const ov=db.profile?.gifMap?.[name];
  if(ov==='none')return null;
  if(ov){const e=GIF_DB.find(x=>x.i===ov);if(e)return e;}
  if(name in GIF_AUTO)return GIF_AUTO[name];
  const ex=ALL_EX.find(e=>e.name===name)||(activeSess?.exercises||[]).find(e=>e.name===name)||{name};
  let best=null,bs=2.9;
  for(const c of GIF_DB){const s=gifScore(ex,c);if(s>bs){bs=s;best=c;}}
  GIF_AUTO[name]=best;return best;
}
function thumbHtml(name,cls='exthumb'){const e=getGif(name);return e?`<img class="${cls}" src="${gifThumb(e)}" loading="lazy" data-gifn="${esc(name)}" onclick="openGif(this.dataset.gifn);event.stopPropagation()" alt="">`:`<div class="${cls} ph" data-gifn="${esc(name)}" onclick="openExView(this.dataset.gifn);event.stopPropagation()">▶</div>`;}
function openGif(name){openExView(name);}
function closeGif(e){if(!e||e.target===document.getElementById('ov-gif'))document.getElementById('ov-gif').classList.remove('on');}
let gifPickName=null;
function openGifPick(name){
  if(!GIF_DB){toast('Cargando animaciones…');return;}
  gifPickName=name;document.getElementById('ov-gif').classList.remove('on');
  document.getElementById('gifpick-title').textContent=name;
  const cur=getGif(name);
  document.getElementById('gifpick-search').value=cur?cur.n:'';
  renderGifPick();document.getElementById('ov-gifpick').classList.add('on');
}
function closeGifPick(e){if(!e||e.target===document.getElementById('ov-gifpick'))document.getElementById('ov-gifpick').classList.remove('on');}
function renderGifPick(){
  const q=(document.getElementById('gifpick-search').value||'').toLowerCase().trim();
  const cur=getGif(gifPickName);const ex=ALL_EX.find(e=>e.name===gifPickName)||{name:gifPickName};
  let list=q?GIF_DB.filter(e=>q.split(/\s+/).every(t=>e.n.includes(t)||e.t.includes(t)||e.e.includes(t))):[...GIF_DB].map(c=>[gifScore(ex,c),c]).sort((a,b)=>b[0]-a[0]).slice(0,30).map(x=>x[1]);
  list=list.slice(0,60);
  document.getElementById('gifpick-list').innerHTML=`<div class="gifpick-item" onclick="setGif('none')"><div class="exthumb sm ph">∅</div><div class="n">Sin animación</div></div>`+
    list.map(e=>`<div class="gifpick-item ${cur&&cur.i===e.i?'cur':''}" onclick="setGif('${e.i}')"><img class="exthumb sm" src="${gifThumb(e)}" loading="lazy" alt=""><div style="flex:1;min-width:0"><div class="n">${esc(e.n)}</div><div class="m">${esc(e.t)} · ${esc(e.e)}</div></div></div>`).join('')||'<div class="empty">Sin resultados</div>';
}
function setGif(id){
  if(!db.profile)db.profile={};if(!db.profile.gifMap)db.profile.gifMap={};
  db.profile.gifMap[gifPickName]=id;delete GIF_AUTO[gifPickName];
  saveDB();closeGifPick();toast(id==='none'?'Animación quitada':'Animación guardada');
  refreshGifThumbs();if(exViewName!=null)renderExView();
  if(typeof renderBiblioteca==='function'&&document.getElementById('stats-panel-bib')?.style.display!=='none')renderBiblioteca();
}
// ─── Ajustes (descansos, gifs, landmarks) → Supabase profiles.settings (best-effort)
async function saveSettingsRemote(){
  if(!useSupabase||!sbClient||!supabaseUser)return;
  try{const {error}=await sbClient.from('profiles').update({settings:{restDays:db.profile?.restDays||[],gifMap:db.profile?.gifMap||{},landmarks:db.profile?.landmarks||{},secMap:db.profile?.secMap||{},mesoLog:db.profile?.mesoLog||[]}}).eq('id',supabaseUser.id);if(error)console.warn('settings sync (añade columna profiles.settings jsonb):',error.message);}catch(e){}
}
document.addEventListener('DOMContentLoaded',()=>{loadGifIndex();});
