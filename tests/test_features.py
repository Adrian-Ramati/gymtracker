"""Pruebas de navegador: músculos secundarios y mesociclos. Ejecutar: python tests/test_features.py [-v] [--shots]"""
import os, sys, json
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = [a for a in sys.argv[1:] if not a.startswith('-')]
PATH = os.path.normpath(os.path.abspath(ARGS[0]) if ARGS else os.path.join(HERE, '..', 'index.html'))
VERBOSE, SHOTS = '-v' in sys.argv, '--shots' in sys.argv
SHOT_DIR = os.environ.get('SHOT_DIR', os.path.join(HERE, 'shots'))
res = []
def check(name, cond, extra=''):
    res.append(bool(cond))
    if VERBOSE or not cond: print(('PASS ' if cond else 'FAIL ') + name + (f'  [{extra}]' if extra and not cond else ''))

SETUP = """()=>{
  ALL_EX=[{name:'Press banca',muscle:'Pectoral',equipment:'Máquina',reps:'8-12',description:'',execution:'',cues:[]},
          {name:'Aperturas',muscle:'Pectoral',equipment:'Poleas',reps:'',description:'',execution:'',cues:[]},
          {name:'Remo',muscle:'Espalda',equipment:'Máquina',reps:'',description:'',execution:'',cues:[]},
          {name:'Prensa',muscle:'Cuádriceps',equipment:'Máquina',reps:'',description:'',execution:'',cues:[]}];
  MUSCLES=['Pectoral','Espalda','Cuádriceps'];
  GIF_DB=[];GIF_AUTO={};db.profile=db.profile||{};db.profile.secMap={};db.profile.mesoLog=[];
  db.templates=[{id:'u',name:'Upper',rest:90,exercises:[{name:'Press banca',muscle:'Pectoral',sets:3},{name:'Aperturas',muscle:'Pectoral',sets:3},{name:'Remo',muscle:'Espalda',sets:4}]},
                {id:'l',name:'Lower',rest:90,exercises:[{name:'Prensa',muscle:'Cuádriceps',sets:3}]}];
  const t=todayStr();
  db.sessions=[{id:1,date:t,name:'Upper',exercises:[{name:'Press banca',muscle:'Pectoral',notes:'',best_e1rm:100,sets:[{kg:80,reps:8,rpe:8,done:true},{kg:80,reps:8,rpe:8,done:true},{kg:80,reps:8,rpe:8,done:true},{kg:80,reps:8,rpe:8,done:true}]}]}];
  exCache=null;navHome();
}"""
RESET = "()=>{try{clearInterval(timerIv)}catch(e){};activeSess=null;try{clearActiveStash()}catch(e){};document.querySelectorAll('.overlay.on').forEach(o=>o.classList.remove('on'));}"

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, timezone_id='Europe/Madrid').new_page()
    errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    page.route('https://raw.githubusercontent.com/**', lambda r: r.fulfill(status=404, body=''))
    page.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    page.goto('file://' + PATH); page.wait_for_timeout(1500); page.click('#btn-local'); page.wait_for_timeout(1500)
    ev = page.evaluate
    ev(SETUP); page.wait_for_timeout(300)

    # ── MÚSCULOS SECUNDARIOS ──────────────────────────────────────────
    st = ev("()=>{const s=weekStats(weekRange(0));return {by:s.by,dir:s.byDirect,sets:s.sets}}")
    check('S1. Press banca: 4 series → Pectoral 4, Tríceps 2, Deltoides anterior 2 (efectivas)', st['by'] == {'Pectoral': 4, 'Tríceps': 2, 'Deltoides anterior': 2}, st)
    check('S2. Series directas y total real sin inflar', st['dir'] == {'Pectoral': 4} and st['sets'] == 4, st)
    ev("()=>openExView('Press banca')"); page.wait_for_timeout(200)
    on = ev("()=>[...document.querySelectorAll('#exv-body .exv-mchip.on')].map(e=>e.textContent.replace('✓ ',''))")
    txt = page.inner_text('#exv-body')
    check('S3. La ficha muestra los secundarios automáticos', on == ['Tríceps', 'Deltoides anterior'] and 'automáticamente' in txt, (on, txt[:120]))
    page.click('#exv-body .exv-mchip.edit'); page.wait_for_timeout(150)
    n = ev("()=>document.querySelectorAll('#exv-body .exv-mchip:not(.edit)').length")
    check('S4. "Editar" muestra todos los músculos candidatos (sin el principal)', n == 17, n)
    page.click('#exv-body .exv-mchip[data-m="Deltoides anterior"]'); page.wait_for_timeout(150)
    st = ev("()=>({map:db.profile.secMap,by:weekStats(weekRange(0)).by,txt:document.getElementById('exv-body').innerText})")
    check('S5. Quitar un secundario se guarda y actualiza el volumen', st['map'] == {'press banca': ['Tríceps']} and 'Deltoides anterior' not in st['by'] and 'Personalizados' in st['txt'], st['map'])
    page.click('#exv-body .exv-mchip[data-m="Glúteos"]'); page.wait_for_timeout(150)
    check('S6. Añadir un secundario', ev("()=>db.profile.secMap['press banca']") == ['Tríceps', 'Glúteos'])
    if SHOTS:
        os.makedirs(SHOT_DIR, exist_ok=True); page.screenshot(path=SHOT_DIR + '/exview_sec.png')
    page.click('#exv-body .exv-auto a'); page.wait_for_timeout(150)
    check('S7. "Volver a los automáticos" borra la personalización', ev("()=>db.profile.secMap['press banca']") is None and ev("()=>weekStats(weekRange(0)).by['Deltoides anterior']") == 2)
    ev("()=>closeExView()")
    ev("()=>{navTo('vol')}"); page.wait_for_timeout(500)
    bars = ev("()=>[...document.querySelectorAll('#vol-bars .vbar-label')].map(e=>e.innerText.split('\\n')[0])")
    donut = ev("()=>dashDonut?dashDonut.data.labels:null")
    check('S8. Pantalla Volumen: barras con secundarios y donut solo con series directas', any('Tríceps' in x for x in bars) and donut == ['Pectoral'], (bars, donut))
    ev("()=>navHome()")
    # sincronización de ajustes en Supabase
    cap = ev("""async()=>{let cap=null;const old={sb:sbClient,u:useSupabase,us:supabaseUser};
      sbClient={from:(t)=>({update:(row)=>{if(t==='profiles')cap=row;return{eq:async()=>({error:null})};},upsert:async()=>({error:null})})};
      useSupabase=true;supabaseUser={id:'u1'};db.profile.secMap={'press banca':['Tríceps']};db.profile.mesoLog=[{from:'2026-10-20',start:'2026-10-19',weeks:5,on:true}];
      await saveDB();await new Promise(r=>setTimeout(r,50));sbClient=old.sb;useSupabase=old.u;supabaseUser=old.us;return cap;}""")
    check('S9. Los ajustes enviados a Supabase incluyen secundarios y mesociclo', cap and cap['settings']['secMap'] == {'press banca': ['Tríceps']} and cap['settings']['mesoLog'][0]['weeks'] == 5, cap)
    ev("()=>{db.profile.secMap={};db.profile.mesoLog=[];}")

    # ── MESOCICLOS ────────────────────────────────────────────────────
    ev("()=>navTo('perfil')"); page.wait_for_timeout(300)
    check('M1. Perfil: tarjeta de mesociclo desactivada', 'desactivado' in page.inner_text('#meso-card'))
    page.click('#meso-card .meso-row .toggle'); page.wait_for_timeout(300)
    st = ev("()=>({log:db.profile.mesoLog,tl:document.querySelectorAll('#meso-card .meso-w').length,cur:document.querySelector('#meso-card .meso-w.cur b')?.textContent,dl:document.querySelector('#meso-card .meso-w.dl b')?.textContent,title:document.querySelector('#meso-card .card-title span').textContent})")
    check('M2. Activar crea el mesociclo (5 semanas, la 5.ª de descarga) desde este lunes', len(st['log']) == 1 and st['log'][0]['start'] == ev("()=>PPCore.mondayOf(todayStr())") and st['tl'] == 5 and st['cur'] == '1' and st['dl'] == 'D' and st['title'] == 'semana 1 de 5', st)
    if SHOTS: page.locator('#meso-card').screenshot(path=SHOT_DIR + '/meso_card.png')
    page.click('#meso-card .meso-seg button:has-text("4")'); page.wait_for_timeout(200)
    check('M3. Cambiar la duración a 4 semanas', ev("()=>db.profile.mesoLog.length") == 1 and ev("()=>mesoNow().weeks") == 4)
    ev("()=>navHome()"); page.wait_for_timeout(300)
    chip = ev("()=>document.querySelector('.cta-card .meso-chip')?.textContent")
    check('M4. Portada: chip con la semana y el RPE objetivo', chip == 'Semana 1/4 · RPE 7', chip)
    # semana 2: +1 serie en el primer ejercicio de cada músculo
    ev("()=>{db.profile.mesoLog=[{from:'2026-01-01',start:addDays(PPCore.mondayOf(todayStr()),-7),weeks:5,deload:true,progress:true,on:true}];selDate=todayStr();startFromTmpl('u');preSessGo(true);}")
    page.wait_for_timeout(300)
    st = ev("()=>({sets:activeSess.exercises.map(e=>e.sets.length),banner:document.getElementById('sess-meso').innerText})")
    check('M5. Semana 2: +1 serie en el primer ejercicio de pecho y de espalda', st['sets'] == [4, 3, 5], st)
    check('M6. Aviso en la sesión con el RIR objetivo', 'Semana 2 de 5' in st['banner'] and 'RIR 2' in st['banner'], st['banner'])
    ev(RESET)
    # semana de descarga
    ev("()=>{db.profile.mesoLog=[{from:'2026-01-01',start:addDays(PPCore.mondayOf(todayStr()),-28),weeks:5,deload:true,progress:true,on:true}];selDate=todayStr();startFromTmpl('u');preSessGo(true);}")
    page.wait_for_timeout(300)
    st = ev("()=>({sets:activeSess.exercises.map(e=>e.sets.length),banner:document.getElementById('sess-meso').innerText,hint:document.querySelector('#ec_0 .prog-hint')?.innerText})")
    check('M7. Descarga: mitad de series', st['sets'] == [2, 2, 2], st)
    check('M8. Descarga: aviso y sugerencia de ~90% del peso en lugar de progresión', 'descarga' in st['banner'].lower() and st['hint'] and 'Descarga' in st['hint'] and '72' in st['hint'], st)
    if SHOTS: page.screenshot(path=SHOT_DIR + '/meso_deload_sess.png')
    # cambiar la fecha de la sesión actualiza el aviso
    page.fill('#sess-date', ev("()=>addDays(todayStr(),-21)")); ev("()=>document.getElementById('sess-date').dispatchEvent(new Event('change',{bubbles:true}))")
    page.wait_for_timeout(150)
    check('M9. Cambiar la fecha de la sesión actualiza el aviso del mesociclo', 'Semana 2 de 5' in page.inner_text('#sess-meso'), page.inner_text('#sess-meso'))
    ev(RESET)
    # botón "Descargar esta semana"
    ev("()=>{db.profile.mesoLog=[{from:'2026-01-01',start:addDays(PPCore.mondayOf(todayStr()),-7),weeks:5,deload:true,progress:true,on:true}];navTo('perfil');}")
    page.wait_for_timeout(300)
    page.click('#meso-card .meso-btns button:has-text("Descargar esta semana")'); page.wait_for_timeout(200)
    page.click('#dlg-ok'); page.wait_for_timeout(300)
    check('M10. "Descargar esta semana" convierte la semana actual en descarga', ev("()=>mesoNow().deload") and 'semana de descarga' in page.inner_text('#meso-card'))
    check('M11. La próxima semana vuelve a empezar el ciclo', ev("()=>mesoNow(addDays(todayStr(),7)).idx") == 1)
    page.click('#meso-card .meso-row .toggle'); page.wait_for_timeout(200)
    check('M12. Desactivar no borra el historial', ev("()=>mesoNow()") is None and ev("()=>db.profile.mesoLog.length") >= 2)
    # el índice excluye las sesiones de descarga
    ev("""()=>{const t=todayStr(),mk=(d,n)=>({id:Math.random(),date:addDays(t,-d),name:'Upper',exercises:[{name:'Press banca',muscle:'Pectoral',notes:'',best_e1rm:100,sets:Array.from({length:n},()=>({kg:80,reps:8,rpe:8,done:true}))}]});
      db.sessions=[mk(20,3),mk(15,3),mk(9,3),mk(0,2)];db.profile.mesoLog=[{from:'2026-01-01',start:addDays(PPCore.mondayOf(t),-28),weeks:5,deload:true,progress:true,on:true}];navTo('hyper');}""")
    page.wait_for_timeout(400)
    meta = page.inner_text('#hyper-body .hi-meta')
    check('M13. El índice indica las sesiones de descarga excluidas', 'de descarga excluidas' in meta, meta)
    ev("()=>navHome()")
    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
