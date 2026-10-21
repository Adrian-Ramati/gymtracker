"""Ajustes del 21-oct: músculo activado por ejercicio, portada sin tarjeta de fuerza,
mapa muscular en 5 zonas, volver al inicio durante el entrenamiento y GIF más pequeños.
Ejecutar: python tests/test_ajustes.py [-v]"""
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

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(700)

    # ── Portada ──
    t = ev("()=>[...document.querySelectorAll('#s-home .hcard-head span')].map(e=>e.textContent)")
    check('A1. Portada sin la tarjeta "Progreso de fuerza"', 'Progreso de fuerza' not in t and t == ['Calendario semanal', 'Volumen muscular', 'Índice de hipertrofia'], t)
    check('A2. El menú inferior sigue llevando a Progreso', ev("()=>!!document.getElementById('bn-stats')"))

    # ── Progreso: músculo activado según el ejercicio ──
    page.click('#bn-stats'); page.wait_for_timeout(700)
    rows = lambda: ev("()=>[...document.querySelectorAll('.px-mrow')].map(r=>({m:r.querySelector('span').textContent.replace(' ½','').trim(),w:parseFloat(r.querySelector('u').style.width)}))")
    figc = lambda: ev("()=>{const o={};document.querySelectorAll('#px-fig .body-m').forEach(e=>{if(e.style.fill&&e.style.fill!=='rgb(28, 36, 56)')o[e.dataset.id]=e.style.fill;});return o}")
    page.select_option('#prog-sel', 'Curl bíceps'); page.wait_for_timeout(400)
    r1, f1 = rows(), figc()
    check('A3. Curl bíceps: solo Bíceps, al 100%', r1 == [{'m': 'Bíceps', 'w': 100}], r1)
    check('A4. La figura pinta el bíceps', any('biceps' in k for k in f1) and not any('chest' in k for k in f1), f1)
    page.select_option('#prog-sel', 'Press banca'); page.wait_for_timeout(400)
    r2, f2 = rows(), figc()
    check('A5. Al cambiar a Press banca cambia el músculo activado', [x['m'] for x in r2] == ['Pectoral', 'Tríceps', 'Deltoides anterior'], r2)
    check('A6. Principal al 100% y secundarios al 50%', [x['w'] for x in r2] == [100, 50, 50], r2)
    check('A7. La figura pinta pectoral y tríceps', any('chest' in k for k in f2) and any('triceps' in k for k in f2) and not any('biceps' in k for k in f2), f2)
    check('A8. Los secundarios se marcan con ½', ev("()=>[...document.querySelectorAll('.px-mrow span small')].map(s=>s.textContent)") == ['½', '½'])

    # ── Volumen: 5 zonas ──
    ev("()=>navTo('vol')"); page.wait_for_timeout(700)
    zc = ev("()=>VOL_ZONES.map(z=>z.c)")
    check('A9. Cinco colores distintos', len(set(zc)) == 5, zc)
    lg = ev("()=>[...document.querySelectorAll('#vol-legend span')].map(s=>s.textContent)")
    check('A10. Leyenda con las 5 zonas', lg == ['Sin entrenar', 'Por debajo de MEV', 'MEV–MAV', 'Cerca del máximo (MAV–MRV)', 'Por encima de MRV'], lg)
    z = ev("()=>{const lm={mev:8,mav:16,mrv:22};return [0,0.5,7.5,8,16,16.5,22,22.5].map(v=>volZone(v,lm))}")
    check('A11. Cortes: 0 | <MEV | MEV–MAV (incl.) | MAV–MRV (incl.) | >MRV', z == [0, 1, 1, 2, 2, 3, 3, 4], z)
    # Una semana con cada zona: pinta y comprueba el color de cada músculo en la figura
    got = ev("""()=>{const w=document.getElementById('body-wrap');
      const by={'Pectoral':4,'Cuádriceps':12,'Bíceps':19,'Glúteos':40};
      db.profile.landmarks={'Pectoral':{mev:8,mav:16,mrv:22},'Cuádriceps':{mev:8,mav:16,mrv:22},'Bíceps':{mev:8,mav:16,mrv:22},'Glúteos':{mev:8,mav:16,mrv:22}};
      renderBodyHeat(by);const col=id=>w.querySelector(`.body-m[data-id="${id}"]`)?.style.fill;
      const r={chest:col('f-chest'),quads:col('f-quadriceps'),bic:col('f-biceps'),glu:col('b-gluteal'),abs:col('f-abs')};
      delete db.profile.landmarks;return r;}""")
    rgb = lambda h: 'rgb(%d, %d, %d)' % tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
    check('A12. Cada músculo con el color de su zona', got == {'chest': rgb(zc[1]), 'quads': rgb(zc[2]), 'bic': rgb(zc[3]), 'glu': rgb(zc[4]), 'abs': rgb(zc[0])}, got)
    tip = ev("()=>document.querySelector('#body-wrap .body-m[data-id=\"f-chest\"]').dataset.t")
    check('A13. Al tocar un músculo dice su zona', 'Por debajo de MEV' in tip and 'MEV 8' in tip, tip)
    check('A14. La portada usa los mismos colores', ev("()=>{navHome();const e=document.querySelector('#hc-body .body-m[data-id=\"f-abs\"]');return e.style.fill}") == rgb(zc[0]))

    # ── Entrenamiento: volver al inicio sin cortar la sesión ──
    ev("()=>startFromTmpl('t1')"); page.wait_for_timeout(600)
    vis = ev("()=>getComputedStyle(document.getElementById('hdr-back')).visibility")
    check('A15. Durante el entrenamiento hay botón para volver', vis == 'visible', vis)
    ev("()=>{activeSess.exercises[0].sets[0].kg=21;activeSess.exercises[0].sets[0].done=true;}")
    t0 = ev("()=>timerSecs"); page.click('#hdr-back'); page.wait_for_timeout(2300)
    st = ev("()=>({scr:curScr(),sess:!!activeSess,kg:activeSess?.exercises[0].sets[0].kg,t:timerSecs,bar:document.getElementById('resume-bar').classList.contains('show'),nav:!document.getElementById('bnav').classList.contains('hide')})")
    check('A16. Vuelve al inicio y la sesión sigue abierta con lo apuntado', st['scr'] == 'home' and st['sess'] and st['kg'] == 21, st)
    check('A17. El cronómetro sigue corriendo', st['t'] >= t0 + 2, (t0, st['t']))
    check('A18. Aparece la barra para continuar y el menú inferior', st['bar'] and st['nav'], st)
    page.click('#bn-stats'); page.wait_for_timeout(400)
    check('A19. Se puede navegar por la app con la sesión abierta', ev("()=>curScr()") == 'stats' and ev("()=>document.getElementById('resume-bar').classList.contains('show')"))
    ev("()=>startFromTmpl('t2')"); page.wait_for_timeout(400)
    st = ev("()=>({scr:curScr(),name:activeSess.name,kg:activeSess.exercises[0].sets[0].kg})")
    check('A20. Empezar otra rutina no pisa la sesión abierta: vuelve a ella', st == {'scr': 'sess', 'name': 'T1', 'kg': 21}, st)
    page.click('#hdr-back'); page.wait_for_timeout(300); page.click('.resume-bar-continue'); page.wait_for_timeout(400)
    check('A21. "Continuar" devuelve al entrenamiento', ev("()=>curScr()") == 'sess' and ev("()=>document.querySelectorAll('#sess-exs .ec').length") == 2)
    ev(ns['RESET']); page.wait_for_timeout(200)
    ev("()=>{activeSess={name:'Edit',exercises:[],isTmplEdit:true};showScr('sess',null);}"); page.wait_for_timeout(200)
    check('A22. Editando una rutina no aparece el botón (no hay barra para volver)', ev("()=>getComputedStyle(document.getElementById('hdr-back')).visibility") == 'hidden')
    ev("()=>{activeSess=null;navHome();}")

    # ── GIF más pequeños ──
    ev("()=>openExView('Press banca')"); page.wait_for_timeout(800)
    mh = ev("()=>{const i=document.querySelector('.exv-media img');return i?parseFloat(getComputedStyle(i).maxHeight):null}")
    check('A23. El GIF de la ficha ocupa como máximo el 30% de la pantalla', mh is not None and abs(mh - 844 * .30) < 2, mh)
    check('A24. Sigue pudiendo ampliarse', ev("()=>!!document.querySelector('.exv-zoombtn')"))

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
