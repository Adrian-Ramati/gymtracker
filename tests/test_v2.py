"""Modelo de datos v2 (fase F2 de la auditoría): escritura doble por serie, meta de la sesión,
biometría en la nube y copia local en IndexedDB. Con y sin las tablas nuevas creadas en Supabase.
Ejecutar: python tests/test_v2.py [-v]"""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
VERBOSE = '-v' in sys.argv
src = open(os.path.join(HERE, 'test_app.py'), encoding='utf-8').read()
ns = {'__file__': os.path.join(HERE, 'test_app.py')}
_argv = sys.argv; sys.argv = [sys.argv[0]]; exec(src[:src.index('def run():')], ns); sys.argv = _argv  # MOCK, SEED, IMG
res = []
def check(name, cond, extra=''):
    res.append(bool(cond))
    if VERBOSE or not cond: print(('PASS ' if cond else 'FAIL ') + name + (f'  [{extra}]' if extra and not cond else ''))

# Cliente Supabase falso: registra cada operación; las tablas v2 pueden existir o no
SB = """(v2)=>{
  window.OPS=[];
  const V2=['workout_sessions','exercise_entries','set_entries','biometric_daily'];
  const DATA={sessions:[{id:501,date:todayStr(),name:'T1',day_name:null,duration_min:60,kcal_watch:null,
      meta:{uid:'01a00000-0000-7000-8000-000000000001',plannedSets:7,readiness:{score:.62,rec:'full',applied:false},timeBudget:60},
      exercises:[{name:'Press banca',muscle:'Pectoral',sets:[{kg:80,reps:8,rpe:8,done:true,effortSrc:'logged'}]}]}],
    weights:[],steps:[],measures:[],profiles:{id:'u1',height:180,sex:'male',age:30,username:'adrian',templates:[],settings:{}},
    biometric_daily:[{day:addDays(todayStr(),-1),hrv_rmssd_ms:52,resting_hr_bpm:55,sleep_min:430,sleep_efficiency:.9,steps:9000,weight_kg:78.1,subj_sleep:null,subj_soreness:null,subj_energy:null,sources:{sleep:'health_connect:com.mi.health'}}],
    exercises:[{id:7,name:'Press banca',muscle:'Pectoral',equipment:'Máquina',reps:'8-12',description:'',execution:'',cues:[]}]};
  const miss=t=>!v2&&V2.includes(t);
  const q=(t,op,payload)=>{const o={op,t,payload,f:[]};
    const r={select(){return r},eq(k,v){o.f.push([k,v]);return r},gte(){return r},order(){return r},limit(){return r},single(){return r},in(){return r},
      then(ok,ko){OPS.push(o);const out=miss(t)?{data:null,error:{code:'PGRST205',message:'Could not find the table'}}:{data:op==='select'?DATA[t]:null,error:null};return Promise.resolve(out).then(ok,ko);}};
    return r;};
  sbClient={from:t=>({select:()=>q(t,'select'),insert:p=>q(t,'insert',p),upsert:p=>q(t,'upsert',p),delete:()=>q(t,'delete'),update:p=>q(t,'update',p)})};
  supabaseUser={id:'u1',email:'adrian@x.es'};useSupabase=true;
}"""
OPS = "([t,op])=>OPS.filter(o=>(!t||o.t===t)&&(!op||o.op===op)).map(o=>({t:o.t,op:o.op,f:o.f,p:o.payload}))"

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK'])

    # ── Con las tablas v2 creadas ──
    ev(SB, True)
    ev("()=>localStorage.setItem(lsKey(),JSON.stringify({biometrics:[{date:addDays(todayStr(),-1),subj:{sleep:4,soreness:2,energy:4}},{date:addDays(todayStr(),-2),sleepMin:400}]}))")
    ev("()=>Promise.all([loadDBFromSupabase(),loadExercisesDB()])"); page.wait_for_timeout(200)
    st = ev("()=>({v2:v2Ready,s:db.sessions[0],bio:db.biometrics,ex:ALL_EX[0]})")
    check('V1. Detecta las tablas v2', st['v2'] is True)
    check('V2. La sesión recupera su meta (series planificadas, check-in, tiempo, id)', st['s']['plannedSets'] == 7 and st['s']['timeBudget'] == 60 and st['s']['readiness']['score'] == .62 and st['s']['uid'].startswith('01a0'), st['s'])
    b1 = next((x for x in st['bio'] if x.get('hrv')), {})
    check('V3. Biometría de la nube fusionada con la local (check-in local + reloj)', len(st['bio']) == 2 and b1.get('hrv') == 52 and b1.get('subj') == {'sleep': 4, 'soreness': 2, 'energy': 4} and b1.get('src', {}).get('sleep'), st['bio'])
    check('V4. El catálogo trae el id de cada ejercicio', st['ex'].get('id') == 7, st['ex'])
    ev("()=>{OPS.length=0;selDate=todayStr();startBlank();activeSess.plannedSets=4;activeSess.exercises.push({name:'Press banca',muscle:'Pectoral',notes:'',sets:[{kg:40,reps:10,rpe:5,done:true,type:'warmup'},{kg:80,reps:8,rpe:8,done:true,effortSrc:'logged',doneAt:Date.now()-60000},{kg:60,reps:10,rpe:null,done:true,type:'dropset',doneAt:Date.now(),restS:12}]});renderSessExs()}")
    ev("()=>finishSession()"); page.wait_for_timeout(400)
    up = ev(OPS, ['sessions', 'upsert'])
    v2 = ev("()=>OPS.filter(o=>['workout_sessions','exercise_entries','set_entries'].includes(o.t)).map(o=>o.t+':'+o.op)")
    check('V5. Guardar sesión: upsert en sessions con su meta', len(up) == 1 and up[0]['p']['meta']['plannedSets'] == 4 and up[0]['p']['meta']['uid'], up)
    check('V6. Escritura doble: reemplaza la sesión en v2 (borra por id antiguo e inserta sesión, ejercicios y series)', v2 == ['workout_sessions:delete', 'workout_sessions:insert', 'exercise_entries:insert', 'set_entries:insert'], v2)
    rows = ev("()=>{const s=db.sessions[db.sessions.length-1],W=OPS.find(o=>o.t==='workout_sessions'&&o.op==='insert').payload,E=OPS.find(o=>o.t==='exercise_entries').payload,S=OPS.find(o=>o.t==='set_entries').payload,D=OPS.find(o=>o.t==='workout_sessions'&&o.op==='delete');return {wid:W.id,uid:s.uid,legacy:W.legacy_session_id,sid:s.id,del:D.f,planned:W.planned_hard_sets,exid:E[0].exercise_id,kind:E[0].kind,types:S.map(x=>x.set_type),parent:S[2].parent_set_id===S[1].id,sids:S.map(x=>x.id).join()===s.exercises[0].sets.map(x=>x.sid).join(),src:S.map(x=>x.effort_source),rir:S.map(x=>x.rir),t:!!S[1].completed_at,rest:S[2].rest_before_s}}")
    check('V7. Ids estables: la sesión, sus ejercicios y series guardan el mismo id que en v2', rows['wid'] == rows['uid'] and rows['legacy'] == rows['sid'] and rows['sids'] and ['legacy_session_id', rows['sid']] in rows['del'], rows)
    check('V8. Filas v2 correctas: tipos, drop set con su serie madre, esfuerzo, hora y descanso', rows['types'] == ['warmup', 'working', 'drop'] and rows['parent'] and rows['src'] == [None, 'logged', None] and rows['rir'] == [None, 2, None] and rows['t'] and rows['rest'] == 12 and rows['exid'] == 7 and rows['kind'] == 'compound_heavy' and rows['planned'] == 4, rows)
    ev("()=>{OPS.length=0;saveCheckin(todayStr(),{sleep:2,soreness:4,energy:2})}"); page.wait_for_timeout(200)
    bu = ev(OPS, ['biometric_daily', 'upsert'])
    check('V9. El check-in se guarda en biometric_daily', len(bu) == 1 and bu[0]['p']['subj_sleep'] == 2 and bu[0]['p']['subj_soreness'] == 4 and bu[0]['p']['day'] == ev("()=>todayStr()"), bu)
    ev("()=>{OPS.length=0;const id=db.sessions[db.sessions.length-1].id;window.dlgConfirm=async()=>true;return deleteSession(id)}"); page.wait_for_timeout(300)
    dels = ev(OPS, [None, 'delete'])
    check('V10. Borrar una sesión la borra también en v2', [d['t'] for d in dels] == ['sessions', 'workout_sessions'], dels)

    # ── Sin las tablas v2 (antes de ejecutar el SQL): todo como antes ──
    ev(SB, False)
    ev("()=>Promise.all([loadDBFromSupabase(),loadExercisesDB()])"); page.wait_for_timeout(200)
    check('V11. Sin el SQL aplicado: v2 desactivado y la app carga igual', ev("()=>v2Ready") is False and ev("()=>db.sessions.length") == 1)
    ev("()=>{OPS.length=0;selDate=todayStr();startBlank();activeSess.exercises.push({name:'Press banca',muscle:'Pectoral',notes:'',sets:[{kg:80,reps:8,rpe:8,done:true}]});renderSessExs()}")
    ev("()=>finishSession()"); page.wait_for_timeout(400)
    ops = ev("()=>OPS.filter(o=>o.op!=='select').map(o=>o.t+':'+o.op)")
    up = ev(OPS, ['sessions', 'upsert'])
    check('V12. Sin el SQL: guarda en sessions sin meta y no toca tablas v2', 'meta' not in up[0]['p'] and not any(x.split(':')[0] in ('workout_sessions', 'exercise_entries', 'set_entries') for x in ops), ops)
    ev("()=>{OPS.length=0;saveCheckin(todayStr(),{sleep:5,soreness:1,energy:5})}"); page.wait_for_timeout(200)
    check('V13. Sin el SQL: el check-in queda en local', not ev(OPS, ['biometric_daily', 'upsert']) and ev("()=>db.biometrics.find(b=>b.date===todayStr()).subj.sleep") == 5)

    # ── Copia en IndexedDB ──
    page.wait_for_timeout(300)
    n_idb = ev("async()=>((await idbGet(lsKey()))?.sessions||[]).length")
    check('V14. saveDB deja una copia en IndexedDB', n_idb == ev("()=>db.sessions.length") and n_idb >= 2, n_idb)
    ev("()=>{localStorage.removeItem(lsKey());sbClient={from:()=>{throw new Error('sin conexión')}}}")
    ev("()=>loadDBFromSupabase()"); page.wait_for_timeout(200)
    check('V15. Sin conexión y sin localStorage: se recupera de IndexedDB', ev("()=>db.sessions.length") == n_idb, ev("()=>db.sessions.length"))
    check('Z1. Sin errores de JavaScript', not errors, errors[:3])
    b.close()

print(f"\n{sum(res)}/{len(res)} OK"); sys.exit(0 if all(res) else 1)
