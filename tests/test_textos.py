"""Textos de ejercicios corregidos (21-oct): el SQL de corrección y los nombres renombrados.
- El SQL guarda copia antes de tocar nada, solo usa comillas $t$ y sus textos no tienen restos de cortes.
- Los nombres corregidos del SQL son exactamente los de PPCore.EX_RENAMES.
- En la app, el historial, las rutinas, el GIF elegido, los secundarios y el entrenamiento a medias
  guardados con el nombre antiguo aparecen con el nombre nuevo y siguen enlazados.
Ejecutar: python tests/test_textos.py [-v]"""
import os, re, sys, json
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

# ── El SQL ──
SQL = open(os.path.join(ROOT, 'sql', '2026-10-21-correccion-ejercicios.sql'), encoding='utf-8').read()
body = re.sub(r'^--.*$', '', SQL, flags=re.M)
first_upd = body.find('update exercises')
check('S1. Transacción con copia de seguridad antes del primer cambio',
      body.strip().startswith('begin;') and body.strip().endswith('commit;')
      and -1 < body.find('create table if not exists exercises_backup_20261021 as select * from exercises;') < first_upd)
check('S2. Comillas $t$ equilibradas', body.count('$t$') % 2 == 0)
blocks = re.findall(r'update exercises set\n(.*?)\nwhere id=(\d+);', body, flags=re.S)
check('S3. Cada actualización va a un id concreto (sin updates masivos)', len(blocks) == body.count('update exercises') and len(blocks) > 200, len(blocks))
texts = [(i, t) for blk, i in blocks for t in re.findall(r'\$t\$(.*?)\$t\$', blk, flags=re.S)]
names = {int(i): re.search(r'name=\$t\$(.*?)\$t\$', blk).group(1) for blk, i in blocks if blk.startswith('  name=')}
prose = [(i, t) for i, t in texts if t not in names.values()]
bad = [(i, t[-50:]) for i, t in prose if not re.search(r'[.!?)»]$', t)]
check('S4. Todos los textos terminan en signo de puntuación (sin frases cortadas)', not bad, bad[:3])
bad = [(i, t[:60]) for i, t in prose if '  ' in t or re.search(r'\s[,.;:]', t) or re.search(r'\w-\s', t) or t != t.strip()]
check('S5. Sin dobles espacios, espacios antes de puntuación ni palabras partidas', not bad, bad[:3])
bad = [(i, m) for i, t in prose for m in re.findall(r'[.!?] [a-záéíóúñ]\w*', t) if not re.search(r'p\. ej', t)]
check('S6. Después de punto, mayúscula', not bad, bad[:3])
olds = dict(re.findall(r'^-- (\d+) · .*? \(antes «(.*?)»\)$', SQL, flags=re.M))
sql_ren = {olds[str(i)]: n for i, n in names.items() if str(i) in olds}
check('S7. Cada nombre cambiado indica el nombre antiguo', len(olds) == len(names) == 15, (len(olds), len(names)))

# ── SQL del modelo v2 ──
V2 = open(os.path.join(ROOT, 'sql', '2026-10-25-modelo-v2.sql'), encoding='utf-8').read()
v2body = re.sub(r'^--.*$', '', V2, flags=re.M).strip()
check('S9. Modelo v2: una transacción y repetible (if not exists / on conflict / sin duplicar sesiones)', v2body.startswith('begin;') and v2body.endswith('commit;')
      and all(k in V2 for k in ['create table if not exists workout_sessions', 'add column if not exists meta', 'on conflict (exercise_id, muscle) do nothing', 'not exists (select 1 from workout_sessions w where w.legacy_session_id = s.id)']))
check('S10. Modelo v2: seguridad por usuario en las cinco tablas nuevas', "array['workout_sessions', 'exercise_entries', 'set_entries', 'biometric_daily', 'iho_snapshots']" in V2 and 'user_id = auth.uid()' in V2)
check('S11. Modelo v2: alias para los 15 nombres corregidos', V2.count('insert into exercise_aliases') == 15)
check('S12. Modelo v2: la migración deja vacíos los valores imposibles en lugar de fallar (RPE 1–10, ≤100 reps, peso ≥0)',
      all(k in V2 for k in ["case when (x.value->>'rpe')::numeric between 1 and 10", "case when (x.value->>'reps')::numeric <= 100",
                            "x.value->>'kg' ~ '^[0-9]+", 's.user_id is not null and s.date is not null']))

OLD_SESS = """()=>{
  const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return isoDate(x);};
  const mk=(n,k)=>({name:n,muscle:'Tríceps',notes:'',sets:[{kg:k,reps:10,rpe:8,done:true},{kg:k,reps:10,rpe:8,done:true}]});
  const D={sessions:[
      {id:1,date:d(20),name:'Brazo',exercises:[mk('Jm Press',30)]},
      {id:2,date:d(13),name:'Brazo',exercises:[mk('Jm Press',32)]},
      {id:3,date:d(6),name:'Brazo',exercises:[mk('JM Press',34),mk('Ab-roll Out/ab-wheel',0)]},
      {id:4,date:d(1),name:'Brazo',exercises:[mk('Patada de Triceps desde Polea Baja',10)]}],
    templates:[{id:'tb',name:'Brazo',rest:90,exercises:[{name:'Jm Press',muscle:'Tríceps',sets:3},{name:'Press banca',muscle:'Pectoral',sets:3}]}],
    weights:[],steps:[],measures:[],
    profile:{height:180,sex:'male',age:30,gifMap:{'Jm Press':'0004','Press banca':'0001'},secMap:{'ab-roll out/ab-wheel':['Lumbar'],'press banca':['Tríceps']}}};
  localStorage.setItem(lsKey(),JSON.stringify(D)); loadDB(); exCache=null; GIF_AUTO={};
}"""
EX_ROWS = json.dumps([
    {'name': 'Jm Press', 'muscle': 'Tríceps', 'equipment': 'Barra', 'reps': '6-10', 'description': 'Texto.', 'execution': 'Texto.', 'cues': ['Uno.']},
    {'name': 'Press banca', 'muscle': 'Pectoral', 'equipment': 'Máquina', 'reps': '8-12', 'description': '', 'execution': '', 'cues': []},
    {'name': 'Ab-roll Out/ab-wheel', 'muscle': 'Abdomen', 'equipment': 'Peso libre', 'reps': '8-12', 'description': '', 'execution': '', 'cues': []}], ensure_ascii=False)

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK'])

    app_ren = ev('()=>PPCore.EX_RENAMES')
    check('S8. Los nombres del SQL coinciden con los que traduce la app', sql_ren == app_ren,
          sorted(set(sql_ren.items()) ^ set(app_ren.items()))[:3])

    # ── Datos guardados con nombres antiguos ──
    ev(OLD_SESS)
    got = ev("()=>db.sessions.flatMap(s=>s.exercises.map(e=>e.name))")
    check('N1. El historial antiguo aparece con el nombre nuevo', 'Jm Press' not in got and got.count('JM Press') == 3
          and 'Patada de Tríceps desde Polea Baja' in got and 'Ab Roll Out / Ab Wheel' in got, got)
    check('N2. Las rutinas usan el nombre nuevo', ev("()=>db.templates[0].exercises.map(e=>e.name)") == ['JM Press', 'Press banca'])
    check('N3. El GIF elegido sigue asignado', ev("()=>[getGif('JM Press')?.i,getGif('Press banca')?.i,'Jm Press' in db.profile.gifMap]") == ['0004', '0001', False])
    check('N4. Los secundarios personalizados siguen aplicando',
          ev("()=>[PPCore.secondaryFor(db.profile,'Ab Roll Out / Ab Wheel','Abdomen'),PPCore.secondaryFor(db.profile,'Press banca','Pectoral')]") == [['Lumbar'], ['Tríceps']])
    check('N5. El historial del ejercicio une sesiones antiguas y nuevas', ev("()=>exHistory('JM Press',10).length") == 3)

    # Tabla exercises todavía sin el SQL aplicado: la biblioteca ya muestra el nombre nuevo
    ev("""(rows)=>{sbClient={from:()=>({select:()=>({order:()=>({order:async()=>({data:rows,error:null})})})})};}""", json.loads(EX_ROWS))
    ev("()=>loadExercisesDB()"); page.wait_for_timeout(200)
    check('N6. La biblioteca muestra los nombres corregidos aunque la tabla no esté actualizada',
          ev("()=>ALL_EX.map(e=>e.name)") == ['JM Press', 'Press banca', 'Ab Roll Out / Ab Wheel'])

    # Progreso: una sola entrada con todo el historial
    page.click('#bn-stats'); page.wait_for_timeout(700)
    opts = ev("()=>[...document.querySelectorAll('#prog-sel option')].map(o=>o.value)")
    check('N7. Progreso: una sola entrada «JM Press», sin el nombre antiguo', opts.count('JM Press') == 1 and 'Jm Press' not in opts, opts)
    page.select_option('#prog-sel', 'JM Press'); page.wait_for_timeout(400)
    check('N8. Progreso: la gráfica tiene los 3 entrenamientos', ev("()=>pts.length") == 3)

    # Editar el ejercicio guarda en la fila aunque la tabla aún tenga el nombre antiguo
    ev("""()=>{window._upd=null;sbClient={from:(t)=>({update:(row)=>({in:async(col,vals)=>{window._upd={t,row,col,vals};return{error:null};}}),insert:async()=>({error:null}),upsert:async()=>({error:null})})};
      bibLast=[ALL_EX[0]];openExEditor(0);document.getElementById('exed-description').value='Texto nuevo.';}""")
    ev("()=>saveExEditor()"); page.wait_for_timeout(300)
    u = ev("()=>window._upd")
    check('N9. Al editar, se actualiza la fila con el nombre nuevo o el antiguo', u and u['t'] == 'exercises' and u['col'] == 'name'
          and u['vals'] == ['JM Press', 'Jm Press'] and u['row']['description'] == 'Texto nuevo.', u)
    page.evaluate("()=>closeExEditor()")

    # Entrenamiento a medias guardado con el nombre antiguo
    ev("""()=>{activeSess=null;localStorage.setItem(activeKey(),JSON.stringify({sess:{name:'Brazo',exercises:[{name:'Jm Press',muscle:'Tríceps',sets:[{kg:30,reps:8,rpe:8,done:true}]}]},startedAt:Date.now()-60000}));
      window.dlgConfirm=async()=>true;}""")
    ev("()=>checkRestoreSession()"); page.wait_for_timeout(500)
    check('N10. Al recuperar un entrenamiento a medias, el ejercicio sale con el nombre nuevo',
          ev("()=>activeSess?.exercises?.[0]?.name") == 'JM Press' and ev("()=>curScr()") == 'sess')
    check('N11. El nombre nuevo se ve en la pantalla de entrenamiento', 'JM Press' in ev("()=>document.getElementById('s-sess').innerText"))
    ev("()=>{clearInterval(timerIv);activeSess=null;clearActiveStash();navHome();}")

    check('Z1. Sin errores de JavaScript', not errors, errors[:3])
    b.close()

print(f"\n{sum(res)}/{len(res)} OK"); sys.exit(0 if all(res) else 1)
