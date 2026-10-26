"""Registro de series (fases F0 y F1 de la auditoría):
- ✓ sobre una serie vacía confirma el objetivo (progresión / «otra igual») y NUNCA copia el RPE.
- Pregunta de RIR al terminar la serie; el esfuerzo guarda su procedencia.
- Hora de cada serie, descanso real y temporizador según el tipo de ejercicio.
- Antes de empezar: tiempo disponible (accesorios opcionales al final) y check-in con carga recomendada.
- Teclado propio en móvil.
Ejecutar: python tests/test_registro.py [-v]"""
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

def open_app(p, **ctxkw):
    ctx = p.chromium.launch().new_context(viewport={'width': 390, 'height': 844}, **ctxkw)
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    page.evaluate(ns['MOCK']); page.evaluate(ns['SEED']); page.wait_for_timeout(600)
    return ctx, page, errors

with sync_playwright() as p:
    ctx, page, errors = open_app(p)
    ev = page.evaluate
    S = lambda ei, si: ev(f"()=>{{const s=activeSess.exercises[{ei}].sets[{si}];return {{kg:s.kg,reps:s.reps,rpe:s.rpe,src:s.effortSrc??null,doneAt:s.doneAt??null,restS:s.restS??null,done:s.done}}}}")
    ph = lambda ei, si: ev(f"()=>[document.getElementById('kg_{ei}_{si}').placeholder,document.getElementById('rp_{ei}_{si}').placeholder,document.getElementById('rpe_{ei}_{si}').placeholder]")

    # ── Objetivo pre-rellenado y ✓ de un toque ──
    ev("()=>{selDate=todayStr();startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(500)
    names = ev("()=>activeSess.exercises.map(e=>e.name)")
    check('F1. Sesión desde la rutina (saltando la hoja previa)', names == ['Curl bíceps', 'Press banca'], names)
    check('F2. El objetivo es el de la doble progresión y el RPE no se propone', ph(0, 0) == ['22.5', '10', 'rpe'] and ph(1, 0) == ['82.5', '8', 'rpe'], (ph(0, 0), ph(1, 0)))
    ev("()=>toggleDone(0,0)"); page.wait_for_timeout(200)
    s0 = S(0, 0)
    check('F3. ✓ en una serie vacía confirma el objetivo sin copiar el RPE', s0['kg'] == 22.5 and s0['reps'] == 10 and s0['rpe'] is None and s0['src'] is None and s0['done'], s0)
    check('F4. Aparece la pregunta de RIR', ev("()=>document.getElementById('rir-ask').classList.contains('on')"))
    ev("()=>chooseRir(2)"); page.wait_for_timeout(100)
    s0 = S(0, 0)
    check('F5. Elegir RIR 2 guarda RPE 8 marcado como esfuerzo real', s0['rpe'] == 8 and s0['src'] == 'logged' and ev("()=>document.getElementById('rpe_0_0').value") == '8' and not ev("()=>document.getElementById('rir-ask').classList.contains('on')"), s0)
    check('F6. La primera serie del día guarda su hora (sin descanso previo)', s0['doneAt'] is not None and s0['restS'] is None, s0)
    # «otra igual»: la serie siguiente propone lo que acabas de hacer
    page.fill('#kg_0_0', '25'); page.fill('#rp_0_0', '8'); ev("()=>refreshTargets(0)")
    check('F7. La serie siguiente propone «otra igual»', ph(0, 1)[:2] == ['25', '8'], ph(0, 1))
    # descanso real: la anterior se terminó hace 150 s
    ev("()=>{activeSess.exercises[0].sets[0].doneAt=Date.now()-150000;toggleDone(0,1)}"); page.wait_for_timeout(100)
    s1 = S(0, 1)
    check('F8. Descanso real = desde la serie anterior menos la duración de la serie', s1['kg'] == 25 and s1['reps'] == 8 and s1['restS'] is not None and abs(s1['restS'] - (150 - 24)) <= 2, s1)
    rest_iso = ev("()=>Math.round((restEndTs-Date.now())/1000)")
    ev("()=>hideRirAsk();toggleDone(1,0)"); page.wait_for_timeout(100)
    rest_heavy = ev("()=>Math.round((restEndTs-Date.now())/1000)")
    check('F9. Temporizador según el tipo: aislamiento 90 s · press banca 180 s (rutina a 120 s)', abs(rest_iso - 90) <= 2 and abs(rest_heavy - 180) <= 2, (rest_iso, rest_heavy))
    ev("()=>stopRest()")
    # escribir el RPE a mano también es esfuerzo real; borrarlo lo quita
    page.fill('#rpe_0_2', '9')
    a = S(0, 2)['src']; page.fill('#rpe_0_2', ''); b = S(0, 2)
    check('F10. Escribir el RPE lo marca como real y borrarlo lo quita', a == 'logged' and b['src'] is None and b['rpe'] is None, (a, b))
    page.fill('#rpe_0_2', '14')
    bad = S(0, 2); cls = ev("()=>document.getElementById('rpe_0_2').classList.contains('bad')")
    page.fill('#rpe_0_2', '9'); good = S(0, 2); page.fill('#rpe_0_2', '')
    check('F10b. Un RPE imposible (14) no se guarda y el campo se marca; uno válido sí', bad['rpe'] is None and bad['src'] is None and cls and good['rpe'] == 9 and good['src'] == 'logged' and not ev("()=>document.getElementById('rpe_0_2').classList.contains('bad')"), (bad, cls, good))
    ev("()=>fillFromPrev(1,1)")
    s = S(1, 1)
    check('F11. Copiar de la sesión anterior trae kg y reps pero no el RPE', s['kg'] == 80 and s['reps'] == 10 and s['rpe'] is None and ev("()=>document.getElementById('rpe_1_1').value") == '', s)
    check('F12. Una serie de calentamiento no pregunta el RIR', ev("()=>{const s=activeSess.exercises[1].sets[2];s.type='warmup';renderOneEx(1);toggleDone(1,2);return !document.getElementById('rir-ask').classList.contains('on')}"))
    ev("()=>finishSession()"); page.wait_for_timeout(500)
    sv = ev("()=>{const s=db.sessions[db.sessions.length-1];return {planned:s.plannedSets,sets:s.exercises[0].sets.map(x=>({src:x.effortSrc??null,t:!!x.doneAt,r:x.restS??null}))}}")
    check('F13. La sesión guardada conserva hora, descanso, procedencia del esfuerzo y series planificadas', sv['planned'] == 7 and sv['sets'][0] == {'src': 'logged', 't': True, 'r': None} and sv['sets'][1]['t'] and sv['sets'][1]['r'] is not None, sv)
    den = ev("()=>computeHyperIndex().comp.den")
    check('F14. El IHO ya mide la densidad con esos descansos', den['score'] is not None and den['n'] >= 1, den)

    # ── Antes de empezar: tiempo disponible y check-in ──
    ev("()=>{db.templates.push({id:'t3',name:'Larga',rest:90,exercises:[{name:'Curl bíceps',muscle:'Bíceps',sets:6},{name:'Press banca',muscle:'Pectoral',sets:6},{name:'Sentadilla',muscle:'Cuádriceps',sets:6}]});navHome()}")
    ev("()=>startFromTmpl('t3')"); page.wait_for_timeout(300)
    check('P1. Iniciar una rutina abre la hoja «Antes de empezar»', ev("()=>document.getElementById('ov-presess').classList.contains('on')"))
    for i, v in enumerate([1, 5, 1]):  # sueño 1 · agujetas 5 · energía 1
        page.click(f'#presess-q .ps-row:nth-child({i+1}) .ps-chip:nth-child({v})')
    adv = ev("()=>document.getElementById('presess-ready').innerText")
    check('P2. Check-in malo → recomienda quitar un 40 % de las series', 'Quita un 40 %' in adv, adv)
    page.click('#ov-presess .ps-go'); page.wait_for_timeout(500)
    st = ev("()=>({ex:activeSess.exercises.map(e=>e.sets.length),planned:activeSess.plannedSets,rd:activeSess.readiness,banner:document.getElementById('sess-plan').innerText,bio:(db.biometrics||[]).find(b=>b.date===todayStr())})")
    check('P3. Carga aplicada: 6 → 4 series (60 %) y se planificaron 18', st['ex'] == [4, 4, 4] and st['planned'] == 18 and st['rd']['applied'] and st['rd']['rec'] == 'reduce_40', st)
    check('P4. Aviso de la readiness en la sesión', 'Readiness' in st['banner'] and 'aplicado' in st['banner'], st['banner'])
    check('P5. El check-in queda guardado con la biometría del día', st['bio'] and st['bio']['subj'] == {'sleep': 1, 'soreness': 5, 'energy': 1}, st['bio'])
    ev("()=>{clearInterval(timerIv);activeSess=null;clearActiveStash();navHome();db.biometrics=[]}")
    # 45 min sin check-in: el plan completo (~53 min) no cabe → el curl (aislamiento) pasa a opcional y al final (~43 min)
    ev("()=>startFromTmpl('t3')"); page.wait_for_timeout(300)
    page.click('#presess-time .ps-chip:has-text("45 min")'); page.click('#ov-presess .ps-go'); page.wait_for_timeout(500)
    st = ev("()=>({ex:activeSess.exercises.map(e=>[e.name,e.sets.length,!!e.optional]),tb:activeSess.timeBudget,plan:activeSess.timePlan,rd:activeSess.readiness??null,banner:document.getElementById('sess-plan').innerText})")
    check('P6. Con 45 min el curl pasa a opcional y al final, sin quitar series', [e[0] for e in st['ex']] == ['Press banca', 'Sentadilla', 'Curl bíceps'] and [e[1] for e in st['ex']] == [6, 6, 6] and st['ex'][2][2] and not st['ex'][0][2] and st['rd'] is None, st)
    check('P7. El aviso dice qué queda al final y que ya cabe', '45 min' in st['banner'] and 'plan ~43 min' in st['banner'] and 'Curl bíceps' in st['banner'] and 'no cabe' not in st['banner'] and st['plan']['estMin'] == 43, st['banner'])
    check('P8. El ejercicio opcional lleva su etiqueta', ev("()=>!!document.querySelector('#ec_2 .ec-opt')") and not ev("()=>!!document.querySelector('#ec_0 .ec-opt')"))
    ev("()=>{clearInterval(timerIv);activeSess=null;clearActiveStash();navHome()}")
    check('P9. Tipo de serie «Al fallo» (antes «Error»)', ev("()=>SET_TYPES.find(t=>t.id==='failure').label") == 'Al fallo')
    check('P10. En escritorio se escribe con el teclado de siempre', ev("()=>NUMPAD") is False)
    check('Z1. Sin errores de JavaScript', not errors, errors[:3])
    ctx.close()

    # ── Teclado propio en móvil ──
    ctx, page, errors = open_app(p, is_mobile=True, has_touch=True)
    ev = page.evaluate
    ev("()=>{selDate=todayStr();startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(500)
    check('N1. En móvil los campos no abren el teclado del sistema', ev("()=>NUMPAD&&document.getElementById('kg_1_0').getAttribute('inputmode')==='none'"))
    page.tap('#kg_1_0'); page.wait_for_timeout(200)
    check('N2. Tocar el peso abre el teclado propio con el objetivo', ev("()=>document.getElementById('ov-numpad').classList.contains('on')") and ev("()=>document.getElementById('np-val').innerText") == '82,5', ev("()=>document.getElementById('np-val').innerText"))
    page.tap('#np-plus'); kg1 = ev("()=>activeSess.exercises[1].sets[0].kg")
    for k in ['8', '0']: page.tap(f'.np-keys button:has-text("{k}")')
    kg2 = ev("()=>activeSess.exercises[1].sets[0].kg")
    check('N3. +2,5 suma al objetivo y teclear después empieza de cero', kg1 == 85 and kg2 == 80, (kg1, kg2))
    page.tap('.np-next'); page.wait_for_timeout(100)
    lab = ev("()=>document.getElementById('np-label').innerText")
    for k in ['1', '2']: page.tap(f'.np-keys button:has-text("{k}")')
    page.tap('.np-ok'); page.wait_for_timeout(100)
    check('N4. «Siguiente» pasa a repeticiones y OK cierra', lab == 'Repeticiones' and ev("()=>activeSess.exercises[1].sets[0].reps") == 12 and not ev("()=>document.getElementById('ov-numpad').classList.contains('on')"), lab)
    check('N5. Sin errores de JavaScript en móvil', not errors, errors[:3])
    ctx.close()

print(f"\n{sum(res)}/{len(res)} OK"); sys.exit(0 if all(res) else 1)
