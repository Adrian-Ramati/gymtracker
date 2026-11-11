"""11-nov: candado en la barra de arriba, reordenar ejercicios sin tarjetas congeladas, RIR/RPE coherente
(ajuste en Perfil), día del entreno = hoy aunque la app siga abierta desde ayer (sueño del reloj),
−30 s en el temporizador y registro de la alarma nativa en el diagnóstico.
Ejecutar: python tests/test_noviembre.py [-v]"""
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
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 412, 'height': 915})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(500)

    # ── 1 · Candado en la barra de arriba ──
    check('N1. Fuera del entreno no hay candado', ev("()=>getComputedStyle(document.getElementById('lock-btn')).display") == 'none')
    ev("()=>{startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(400)
    st = ev("()=>{const b=document.getElementById('lock-btn'),h=document.getElementById('hdr').getBoundingClientRect(),r=b.getBoundingClientRect();return {vis:getComputedStyle(b).display!=='none',inHdr:!!b.closest('#hdr'),right:r.right>h.right-70,inSessHdr:!!document.querySelector('#s-sess .sess-hdr #lock-btn')}}")
    check('N2. En el entreno el candado está en la barra «Entrenamiento», a la derecha', st == {'vis': True, 'inHdr': True, 'right': True, 'inSessHdr': False}, st)
    ev("()=>document.querySelector('.content').scrollTo(0,99999)"); page.wait_for_timeout(200)
    vis = ev("()=>{const r=document.getElementById('lock-btn').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}")
    check('N3. Sigue visible al bajar por la rutina', vis)
    page.click('#lock-btn'); page.wait_for_timeout(200)
    check('N4. Bloquea la pantalla', ev("()=>lockOn"))
    ev("()=>unlockScreen()")

    # ── 2 · Reordenar sin que la tarjeta se quede congelada ──
    ev("()=>document.querySelector('.content').scrollTo(0,0)"); page.wait_for_timeout(100)
    names0 = ev("()=>activeSess.exercises.map(e=>e.name)")
    h0 = ev("()=>{const r=document.querySelector('#ec_0 .drag-handle').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    c1 = ev("()=>{const r=document.getElementById('ec_1').getBoundingClientRect();return [r.x+40,r.y+r.height/2]}")
    page.mouse.move(*h0); page.mouse.down(); page.wait_for_timeout(50)
    check('N5. Al coger el asa la tarjeta se marca', ev("()=>document.getElementById('ec_0').classList.contains('dragging')"))
    page.mouse.move(c1[0], c1[1], steps=8); page.wait_for_timeout(100)
    check('N6. Al pasar por encima de otra se marca el destino', ev("()=>document.getElementById('ec_1').classList.contains('drag-over')"))
    page.mouse.up(); page.wait_for_timeout(200)
    names1 = ev("()=>activeSess.exercises.map(e=>e.name)")
    check('N7. Al soltar se cambia el orden', names1 == names0[::-1], (names0, names1))
    check('N8. … y ninguna tarjeta queda sombreada', ev("()=>document.querySelectorAll('.ec.dragging,.ec.drag-over').length") == 0)
    # soltar en el mismo sitio (antes se quedaba sombreada)
    h0 = ev("()=>{const r=document.querySelector('#ec_0 .drag-handle').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    page.mouse.move(*h0); page.mouse.down(); page.mouse.move(h0[0], h0[1] + 3); page.mouse.up(); page.wait_for_timeout(150)
    check('N9. Soltar en el mismo sitio no cambia nada ni deja la tarjeta sombreada', ev("()=>activeSess.exercises.map(e=>e.name)") == names1 and ev("()=>document.querySelectorAll('.ec.dragging,.ec.drag-over').length") == 0)
    # cancelación del sistema (llamada, cambiar de app…)
    ev("()=>{const h=document.querySelector('#ec_1 .drag-handle');h.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:7,clientY:300}));h.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:7}))}"); page.wait_for_timeout(100)
    check('N10. Si el sistema cancela el gesto, la tarjeta se limpia igual', ev("()=>document.querySelectorAll('.ec.dragging,.ec.drag-over').length") == 0 and ev("()=>rd") is None)
    check('N11. Las tarjetas ya no son arrastrables con HTML5 (lo que se quedaba colgado)', ev("()=>[...document.querySelectorAll('.ec')].every(c=>!c.draggable)"))
    check('N12. Las casillas siguen funcionando tras reordenar', ev("()=>{document.getElementById('kg_0_0').value=50;document.getElementById('rp_0_0').value=10;onSetInput(0,0);return activeSess.exercises[0].sets[0].kg}") == 50)

    # ── 3 · RIR o RPE, siempre lo mismo ──
    check('N13. Por defecto, RIR: la columna dice «rir»', ev("()=>effMode()") == 'rir' and ev("()=>[...document.querySelectorAll('#sess-exs .sets-head .sh-col')].map(e=>e.textContent)")[-1] == 'rir' and ev("()=>document.getElementById('rpe_0_0').placeholder") == 'rir')
    ev("()=>{toggleDone(0,0)}"); page.wait_for_timeout(100)
    q = ev("()=>({q:document.querySelector('#rir-ask .rir-q b').textContent,c:[...document.querySelectorAll('#rir-ask .rir-chips button')].map(b=>b.textContent)})")
    check('N14. La pregunta al terminar también es RIR (0 = fallo … 4+)', 'RIR' in q['q'] and q['c'][0].startswith('0') and q['c'][-1] == '4+', q)
    ev("()=>chooseRir(2)"); page.wait_for_timeout(100)
    st = ev("()=>({rpe:activeSess.exercises[0].sets[0].rpe,box:document.getElementById('rpe_0_0').value})")
    check('N15. Elegir RIR 2 guarda RPE 8 por dentro y la casilla muestra 2', st == {'rpe': 8, 'box': '2'}, st)
    page.fill('#rpe_0_0', '1'); page.wait_for_timeout(50)
    check('N16. Escribir RIR 1 en la casilla guarda RPE 9', ev("()=>activeSess.exercises[0].sets[0].rpe") == 9)
    page.fill('#rpe_0_0', '0'); page.wait_for_timeout(50)
    check('N17. RIR 0 = fallo (RPE 10)', ev("()=>activeSess.exercises[0].sets[0].rpe") == 10)
    page.fill('#rpe_0_0', '12'); page.wait_for_timeout(50)
    check('N18. Un RIR imposible (12) no se guarda y se marca', ev("()=>activeSess.exercises[0].sets[0].rpe") is None and ev("()=>document.getElementById('rpe_0_0').classList.contains('bad')"))
    page.fill('#rpe_0_0', '2'); page.wait_for_timeout(50)
    ev("()=>{collectInputs();renderSessExs()}"); page.wait_for_timeout(100)
    check('N19. Al volver a pintar la sesión sigue mostrando el RIR (2), no el RPE', ev("()=>document.getElementById('rpe_0_0').value") == '2' and ev("()=>activeSess.exercises[0].sets[0].rpe") == 8)
    ev("()=>{hideRirAsk();stopRest();navTo('perfil')}"); page.wait_for_timeout(400)
    t = ev("()=>document.getElementById('eff-mode')?.innerText||''")
    check('N20. Ajuste en Perfil: RIR o RPE', 'RIR' in t and 'RPE' in t and ev("()=>document.querySelector('#eff-mode .rm-btn.on').textContent").startswith('RIR'), t)
    page.click('#eff-mode .rm-btn:has-text("RPE")'); page.wait_for_timeout(200)
    check('N21. Al cambiar a RPE se guarda el ajuste', ev("()=>db.profile.effortMode") == 'rpe' and ev("()=>document.querySelector('#eff-mode .rm-btn.on').textContent").startswith('RPE'))
    ev("()=>showScr('sess',null)"); page.wait_for_timeout(300)
    st = ev("()=>({col:[...document.querySelectorAll('#sess-exs .sets-head .sh-col')].map(e=>e.textContent).pop(),box:document.getElementById('rpe_0_0').value,ph:document.getElementById('rpe_0_1').placeholder})")
    check('N22. En RPE la columna y las casillas muestran RPE (8)', st == {'col': 'rpe', 'box': '8', 'ph': 'rpe'}, st)
    ev("()=>{document.getElementById('kg_0_1').value=50;document.getElementById('rp_0_1').value=10;toggleDone(0,1)}"); page.wait_for_timeout(100)
    q = ev("()=>({q:document.querySelector('#rir-ask .rir-q b').textContent,c:[...document.querySelectorAll('#rir-ask .rir-chips button')].map(b=>b.textContent)})")
    check('N23. Y la pregunta al terminar es RPE (10 = fallo … ≤6)', 'RPE' in q['q'] and q['c'][0].startswith('10') and q['c'][-1] == '≤6', q)
    ev("()=>chooseRir(1)"); page.wait_for_timeout(100)
    check('N24. Elegir RPE 9 guarda 9', ev("()=>activeSess.exercises[0].sets[1].rpe") == 9 and ev("()=>document.getElementById('rpe_0_1').value") == '9')
    check('N25. El ajuste viaja con los demás a Supabase', ev("()=>settingsObj(db.profile).effortMode") == 'rpe')
    ev("()=>{hideRirAsk();stopRest();setEffMode('rir')}")

    # ── 4 · −30 s ──
    ev("()=>startRest(90)"); page.wait_for_timeout(100)
    btns = ev("()=>[...document.querySelectorAll('#rest-pill button')].map(b=>b.textContent.trim())")
    check('N26. El temporizador flotante tiene −30 s y +30 s', '−30s' in btns and '+30s' in btns, btns)
    page.click('#rest-pill button:has-text("−30s")'); page.wait_for_timeout(100)
    check('N27. −30 s resta medio minuto', abs(ev("()=>Math.round((restEndTs-Date.now())/1000)") - 60) <= 2)
    page.click('#rest-pill button:has-text("−30s")'); page.click('#rest-pill button:has-text("−30s")'); page.wait_for_timeout(150)
    check('N28. Si ya no queda descanso, se acaba (sin pitar)', ev("()=>restEndTs") is None and ev("()=>getComputedStyle(document.getElementById('rest-pill')).display") == 'none')

    # ── 5 · El día del entreno es hoy aunque la app siga abierta desde ayer ──
    ev("()=>{finishSession&&0;activeSess=null;clearActiveStash&&clearActiveStash()}")
    ev("()=>{const y=new Date();y.setDate(y.getDate()-1);selDate=isoDate(y);selDatePicked=false;db.biometrics=[{date:todayStr(),sleepMin:445}];navTo('perfil');startFromTmpl('t1')}"); page.wait_for_timeout(300)
    st = ev("()=>({day:preSess.day,h:preSess.sleepH,txt:document.getElementById('presess-q').innerText.includes('7 h 25 min')})")
    check('N29. App abierta desde ayer: la hoja usa el día de hoy y el sueño de esta noche', st == {'day': ev("()=>todayStr()"), 'h': 3, 'txt': True}, st)
    ev("()=>preSessGo(true)"); page.wait_for_timeout(300)
    check('N30. … y la sesión se guarda con la fecha de hoy', ev("()=>activeSess.date") == ev("()=>todayStr()"))
    ev("()=>{activeSess=null;clearActiveStash&&clearActiveStash();showScr('train',null);selectDate('2026-10-02');startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(300)
    check('N31. Si eliges un día en el calendario, se usa ese', ev("()=>activeSess.date") == '2026-10-02')
    ev("()=>{activeSess=null;clearActiveStash&&clearActiveStash();navHome()}")
    check('N32. Al volver a Inicio, el día vuelve a ser hoy', ev("()=>sessDay()") == ev("()=>todayStr()"))
    ev("()=>{db.biometrics=[{date:'2026-11-05',sleepMin:432}];db.profile.healthConnect=true}")
    check('N33. Si no llega el sueño de hoy, dice cuál es el último que llegó', '5/11' in ev("()=>lastSleepTxt()") and '7 h 12 min' in ev("()=>lastSleepTxt()"))

    # ── 6 · Diagnóstico de la alarma con registro ──
    ev("""()=>{window.__ra=[];const now=Date.now();
      window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),createChannel:async()=>{},cancel:async()=>{},schedule:async()=>{}},
        RestAlarm:{schedule:async o=>{__ra.push(['schedule',o.at])},cancel:async()=>{__ra.push(['cancel'])},test:async()=>{},openSettings:async()=>{},
          info:async()=>({version:'1.0.19',exact:true,notifications:true,batteryUnrestricted:true,alarmVolume:5,alarmVolumeMax:7,manufacturer:'Xiaomi',sdk:35,
            log:[[now-95000,'programado a 90 s'],[now-94900,'cuenta atrás en marcha'],[now-4000,'servicio a cero'],[now-3990,'suena']].map(x=>x.join('|')).join(';')})}}};
      navTo('perfil')}""")
    page.wait_for_timeout(500)
    d = ev("()=>document.getElementById('alarm-diag')?.innerText||''")
    check('N34. El diagnóstico tiene «Probar en 15 s con la pantalla apagada»', 'Probar en 15 s' in d, d)
    ev("()=>document.querySelector('#alarm-diag details').open=true")
    d = ev("()=>document.querySelector('#alarm-diag details')?.innerText||''")
    check('N35. … y el registro de los últimos avisos (programado, cuenta atrás, suena)', 'programado a 90 s' in d and 'cuenta atrás en marcha' in d and 'suena' in d, d)
    page.click('#alarm-diag button:has-text("15 s")'); page.wait_for_timeout(100)
    at = ev("()=>__ra.slice(-1)[0]")
    check('N36. La prueba programa la alarma de verdad a 15 s', at[0] == 'schedule' and 13000 < at[1] - ev("()=>Date.now()") <= 15000, at)
    # Con la alarma nativa ya programada, al pasar a segundo plano no se vuelve a programar
    ev("()=>{__ra.length=0;startRest(60)}"); page.wait_for_timeout(150)
    ev("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))}"); page.wait_for_timeout(150)
    n = ev("()=>__ra.filter(x=>x[0]==='schedule').length")
    ev("()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});stopRest()}")
    check('N37. Al apagar la pantalla no se reprograma (Android no deja arrancar la cuenta atrás en segundo plano)', n == 1, n)

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
