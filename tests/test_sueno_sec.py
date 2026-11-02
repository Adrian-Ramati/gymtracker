"""2-nov: el sueño del reloj no se pregunta en «Antes de empezar» (y se lee Health Connect al abrir la hoja
si aún no está), y trapecio/lumbar como secundarios de remos, pesos muertos, buenos días, etc.
Ejecutar: python tests/test_sueno_sec.py [-v]"""
import os, re, sys, subprocess, json
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

# ── 1 · Secundarios (reglas de js/core.js) ──
js = r"""
const C=require('./js/core.js');const s=(n,m)=>C.autoSecondary(n,m);
console.log(JSON.stringify({
 pendlay:s('Remo Pendlay','Espalda'), tbar:s('Remo en T','Espalda'), torso:s('Remo con Mancuernas Torso Inclinado','Espalda'),
 maquina:s('Remo en Máquina Neutro','Espalda'), seal:s('Seal Row con Barra','Espalda'), gironda:s('Remo Gironda','Espalda'),
 jalon:s('Jalón al Pecho Prono','Espalda'), rack:s('Rack Pull','Espalda'), pm:s('Peso muerto convencional','Espalda'),
 rdl:s('Peso Muerto Rumano - RDL','Isquiosurales'), bd:s('Buenos Días con Barra','Isquiosurales'), ext:s('Extensiones Banco Inclinado Focus Isquiosural','Isquiosurales'),
 extg:s('Extensiones en Banco Inclinado 45º Focus Glúteo','Glúteos'), menton:s('Remo al Mentón con Barra','Deltoides Lateral'),
 squat:s('Sentadilla Barra Alta','Cuádriceps'), hack:s('Sentadilla Hack','Cuádriceps'), bulg:s('Sentadilla Búlgara con Barra Libre','Cuádriceps'),
 shrug:s('Encogimientos con Barra','Espalda'), curl:s('Curl Martillo con Mancuernas','Bíceps'),
 cr:C.credits({},{name:'Remo Pendlay',muscle:'Espalda'})}));
"""
out = json.loads(subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True).stdout)
check('S1. Remos con torso inclinado sin apoyo: trapecio y lumbar', all({'Trapecio', 'Lumbar'} <= set(out[k]) for k in ('pendlay', 'tbar', 'torso')), out)
check('S2. Remos con apoyo (máquina, seal, gironda): trapecio sí, lumbar no', all('Trapecio' in out[k] and 'Lumbar' not in out[k] for k in ('maquina', 'seal', 'gironda')), out)
check('S3. Los remos mantienen bíceps y deltoides posterior', {'Bíceps', 'Deltoides posterior'} <= set(out['pendlay']) and {'Bíceps', 'Deltoides posterior'} <= set(out['maquina']), out)
check('S4. Peso muerto y rack pull: glúteos, isquios, lumbar y trapecio', all({'Glúteos', 'Isquiosurales', 'Lumbar', 'Trapecio'} <= set(out[k]) for k in ('rack', 'pm')), out)
check('S5. RDL, buenos días e hiperextensiones: lumbar', all('Lumbar' in out[k] for k in ('rdl', 'bd', 'ext', 'extg')) and 'Glúteos' in out['rdl'] and 'Isquiosurales' in out['extg'], out)
check('S6. Remo al mentón: trapecio · sentadilla con barra libre: lumbar', out['menton'] == ['Trapecio'] and 'Lumbar' in out['squat'], out)
check('S7. Sin lumbar ni trapecio donde no toca (jalón, hack, búlgara, curl martillo)', out['jalon'] == ['Bíceps', 'Antebrazo'] and 'Lumbar' not in out['hack'] and 'Lumbar' not in out['bulg'] and out['curl'] == ['Antebrazo'], out)
check('S8. Encogimientos apuntados como «Espalda» cuentan para el trapecio', out['shrug'] == ['Trapecio', 'Antebrazo'], out)
check('S9. Remo Pendlay: 1 espalda · 0,5 trapecio, bíceps y deltoides posterior · 0,25 lumbar y antebrazo (solo sujetan)', out['cr'] == [{'m': 'Espalda', 'w': 1}, {'m': 'Bíceps', 'w': 0.5}, {'m': 'Deltoides posterior', 'w': 0.5}, {'m': 'Trapecio', 'w': 0.5}, {'m': 'Lumbar', 'w': 0.25}, {'m': 'Antebrazo', 'w': 0.25}], out['cr'])
sql = open(os.path.join(ROOT, 'sql', '2026-11-02-secundarios-trapecio-lumbar.sql'), encoding='utf-8').read()
rows = re.findall(r"^\s+\((\d+), \$q\$(\w+)\$q\$, ([\d.]+)\)", sql, re.M)
check('S10. SQL del catálogo: trapecio, lumbar y antebrazo con su crédito (0,5 o 0,25), repetible', 'on conflict (exercise_id, muscle) do update set credit = excluded.credit' in sql and {r[1] for r in rows} == {'Trapecio', 'Lumbar', 'Antebrazo'} and {r[2] for r in rows} == {'0.5', '0.25'} and len(rows) >= 100, len(rows))

BRIDGE = """(()=>{
  const at=(dOff,h,m=0)=>{const d=new Date();d.setDate(d.getDate()-dOff);d.setHours(h,m,0,0);return d.toISOString();};
  window.HC_READS=0;
  window.Capacitor={isNativePlatform:()=>true,Plugins:{
    Health:{isAvailable:async()=>({available:true,platform:'android'}),checkAuthorization:async o=>({readAuthorized:o.read,readDenied:[]}),
      requestAuthorization:async o=>({readAuthorized:o.read,readDenied:[]}),openHealthConnectSettings:async()=>{},
      readSamples:async o=>{HC_READS++;await new Promise(r=>setTimeout(r,60));
        if(o.dataType!=='sleep'||!window.SLEEP_READY)return{samples:[]};
        return{samples:[{startDate:at(1,23,40),endDate:at(0,7,10),value:450,stages:[{stage:'light',durationMinutes:270},{stage:'deep',durationMinutes:95},{stage:'rem',durationMinutes:80},{stage:'awake',durationMinutes:5}]}]};}},
    LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),createChannel:async()=>{},schedule:async()=>{},cancel:async()=>{}}}};
})()"""

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    ctx.add_init_script(BRIDGE)
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(500)
    ev("()=>{db.profile.healthConnect=true;db.profile.hcLastSync=new Date().toISOString();db.biometrics=[];selDate=todayStr();}")

    # ── 2 · Sueño: aún no está en Health Connect → al abrir la hoja se lee; si no llega, se pregunta con aviso ──
    ev("()=>{HC_READS=0;startFromTmpl('t1')}"); page.wait_for_timeout(150)
    check('S11. Al abrir la hoja sin el sueño de hoy, se lee Health Connect solo', ev("()=>HC_READS") > 0)
    page.wait_for_timeout(900)
    t = ev("()=>document.getElementById('presess-q').innerText")
    chips = ev("()=>document.querySelectorAll('#presess-q .ps-sleep .ps-chip').length")
    check('S12. Si el reloj no lo tiene, se pregunta y se explica por qué (con botón Sincronizar)', chips == 4 and 'aún no tiene el sueño' in t and 'Sincronizar' in t, t)
    # El sueño llega a Health Connect y se toca «Sincronizar»
    ev("()=>{window.SLEEP_READY=true}")
    page.click('#presess-q .ps-nosleep .ps-link'); page.wait_for_timeout(1200)
    t = ev("()=>document.getElementById('presess-q').innerText")
    st = ev("()=>({h:preSess.sleepH,auto:preSess.sleepAuto,chips:document.querySelectorAll('#presess-q .ps-sleep .ps-chip').length})")
    check('S13. Con el sueño ya en el reloj NO se pregunta: se muestra «⌚ 7 h 25 min» del reloj', st['chips'] == 0 and '7 h 25 min' in t and 'del reloj' in t and st['h'] == 3 and st['auto'], (st, t))
    page.click('#presess-q .ps-wsleep .ps-link'); page.wait_for_timeout(200)
    check('S14. «cambiar» deja corregirlo a mano', ev("()=>document.querySelectorAll('#presess-q .ps-sleep .ps-chip').length") == 4)
    ev("()=>preSessSet('sleepH',4)")
    check('S15. Lo marcado a mano manda', ev("()=>preSess.sleepH") == 4 and not ev("()=>preSess.sleepAuto"))
    ev("()=>closePreSess()")

    # ── 3 · Con el sueño ya sincronizado: no se pregunta desde el principio ni se vuelve a leer ──
    ev("()=>{HC_READS=0;startFromTmpl('t1')}"); page.wait_for_timeout(500)
    st = ev("()=>({reads:HC_READS,chips:document.querySelectorAll('#presess-q .ps-sleep .ps-chip').length,txt:document.getElementById('presess-q').innerText})")
    check('S16. Sueño de hoy ya importado: no se pregunta ni se vuelve a leer el reloj', st['reads'] == 0 and st['chips'] == 0 and '7 h 25 min' in st['txt'], st)
    page.click('#ov-presess .ps-go'); page.wait_for_timeout(400)
    check('S17. La readiness usa ese sueño (7–8 h)', ev("()=>activeSess.readiness?.subj?.sleepH") == 3, ev("()=>activeSess.readiness"))
    ev("()=>{cancelSessionNow?cancelSessionNow():0}") if ev("()=>typeof cancelSessionNow==='function'") else None

    # ── 4 · Una lectura automática en marcha al abrir: se espera a que acabe y se rellena ──
    ev("()=>{activeSess=null;clearActiveStash&&clearActiveStash();db.biometrics=[];hcBusy=false;}")
    ev("()=>{HC_READS=0;hcSync(false);startFromTmpl('t1')}"); page.wait_for_timeout(1500)
    st = ev("()=>({h:preSess?.sleepH,chips:document.querySelectorAll('#presess-q .ps-sleep .ps-chip').length})")
    check('S18. Si ya se estaba leyendo el reloj, la hoja se rellena al terminar', st == {'h': 3, 'chips': 0}, st)
    ev("()=>closePreSess()")

    # ── 5 · Mapa muscular: una sesión de remos y peso muerto ilumina trapecio y lumbar ──
    ev("""()=>{const d=todayStr();db.sessions.push({id:990100,date:d,name:'Espalda',exercises:[
      {name:'Remo Pendlay',muscle:'Espalda',sets:[{kg:70,reps:8,done:true},{kg:70,reps:8,done:true},{kg:70,reps:8,done:true}]},
      {name:'Peso Muerto Rumano - RDL',muscle:'Isquiosurales',sets:[{kg:90,reps:8,done:true},{kg:90,reps:8,done:true}]}]});
      dashOff=0;navTo('vol');}""")
    page.wait_for_timeout(600)
    by = ev("()=>weekStats(weekRange(0)).by")
    check('S19. Volumen de la semana: trapecio 1,5 · lumbar 1,25 · antebrazo 2 (con el curl de la semana)', by.get('Trapecio') == 1.5 and by.get('Lumbar') == 1.25 and by.get('Antebrazo') == 2, by)
    fills = ev("()=>{const w=document.getElementById('body-wrap');const ids=[...new Set([...w.querySelectorAll('.body-m')].map(e=>e.dataset.id))].filter(i=>/trap|lower-back|lumbar/.test(i));return ids.map(i=>[i,w.querySelector(`.body-m[data-id=\"${i}\"]`).style.fill])}")
    gray = ev("()=>{const w=document.getElementById('body-wrap');return w.querySelector('.body-m[data-id=\"f-abs\"]')?.style.fill}")
    check('S20. En el mapa ya no salen en gris', fills and all(f and f != gray for _, f in fills), (fills, gray))

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
