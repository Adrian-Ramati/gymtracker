"""30-oct: descansos de la rutina (mismo para todos / automáticos con readiness), bloqueo de pantalla,
alarma de fin de descanso por el canal de alarma (APK) y readiness + rendimiento en las sesiones hechas.
Ejecutar: python tests/test_descansos.py [-v]"""
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

# Puente de Capacitor simulado: alarma nativa (RestAlarm) + notificaciones locales
NATIVE = """(withAlarm)=>{window.__ra=[];window.__ln=[];
  const LN={checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),
    createChannel:async()=>{},cancel:async(o)=>{__ln.push(['cancel'])},schedule:async(o)=>{__ln.push(['schedule',o.notifications[0].schedule.at.getTime()])}};
  const RA={schedule:async(o)=>{__ra.push(['schedule',o.at])},cancel:async()=>{__ra.push(['cancel'])},test:async()=>{__ra.push(['test'])}};
  window.Capacitor={isNativePlatform:()=>true,Plugins:withAlarm?{LocalNotifications:LN,RestAlarm:RA}:{LocalNotifications:LN}};
  restChannel=null;window.__beeps=0;const b=beep;window.beep=()=>{__beeps++;};
}"""

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True)
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(700)

    # ── 1 · Cálculo de descansos ──
    r = ev("""()=>{const R=PPCore.exRest,P={name:'Press banca',muscle:'Pectoral'},C={name:'Curl bíceps',muscle:'Bíceps'},L={name:'Elevaciones laterales',muscle:'Deltoides lateral'},M={name:'Remo en máquina',muscle:'Espalda'};
      return {same:[R(P,120,'same'),R(C,120,'same')],auto:[R(P,120,'auto'),R(C,120,'auto'),R(L,90),R(M,90)],
        rd:[R(C,120,'auto',0.8),R(C,120,'auto',0.5),R(C,120,'auto',0.3)],sameRd:R(C,120,'same',0.2),clamp:[R(P,280,'auto'),R(C,15,'auto')]}}""")
    check('D1. Mismo descanso: todos iguales', r['same'] == [120, 120], r)
    check('D2. Automático por ejercicio y músculo (press 195 · curl 75 · laterales 60 · remo 105)', r['auto'] == [195, 75, 60, 105], r)
    check('D3. Automático con readiness baja: +15 s (< 60) y +30 s (< 40)', r['rd'] == [75, 90, 105], r)
    check('D4. El modo «mismo» no cambia con la readiness', r['sameRd'] == 120, r)
    check('D5. Límites 1 – 5 min', r['clamp'] == [300, 60], r)

    # ── 2 · Editor de rutina ──
    ev("()=>openEditTmpl('t1')"); page.wait_for_timeout(300)
    btns = ev("()=>[...document.querySelectorAll('#tmpledit-restmode .rm-btn')].map(b=>[b.textContent,b.classList.contains('on')])")
    check('D6. El editor tiene los dos botones y «automáticos» por defecto', len(btns) == 2 and 'Mismo descanso' in btns[0][0] and 'automáticos' in btns[1][0] and btns[1][1] and not btns[0][1], btns)
    chips = ev("()=>[...document.querySelectorAll('#tmpledit-exs .ec-rest')].map(e=>e.textContent)")
    check('D7. Cada ejercicio muestra su descanso (rutina a 120 s: curl 1:15 · press 3:15)', chips == ['⏱ 1:15', '⏱ 3:15'], chips)
    page.click('#tmpledit-restmode .rm-btn:has-text("Mismo")'); page.wait_for_timeout(200)
    chips = ev("()=>[...document.querySelectorAll('#tmpledit-exs .ec-rest')].map(e=>e.textContent)")
    check('D8. «Mismo descanso» los pone todos al valor de arriba', chips == ['⏱ 2:00', '⏱ 2:00'], chips)
    page.fill('#tmpledit-rest', '150'); page.dispatch_event('#tmpledit-rest', 'change'); page.wait_for_timeout(200)
    chips = ev("()=>[...document.querySelectorAll('#tmpledit-exs .ec-rest')].map(e=>e.textContent)")
    check('D9. Cambiar los segundos actualiza todos', chips == ['⏱ 2:30', '⏱ 2:30'], chips)
    ev("()=>saveTmplEdit()"); page.wait_for_timeout(300)
    t = ev("()=>{const t=db.templates.find(t=>t.id==='t1');return {mode:t.restMode,rest:t.rest}}")
    check('D10. Se guarda en la rutina', t == {'mode': 'same', 'rest': 150}, t)
    ev("()=>{startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(400)
    ev("()=>{activeSess.exercises[0].sets[0].kg=20;activeSess.exercises[0].sets[0].reps=10;renderSessExs();toggleDone(0,0);hideRirAsk()}"); page.wait_for_timeout(100)
    left = ev("()=>Math.round((restEndTs-Date.now())/1000)")
    check('D11. En el entreno el curl descansa lo mismo que el resto (150 s)', abs(left - 150) <= 2 and ev("()=>activeSess.restMode") == 'same', left)
    ev("()=>{stopRest();activeSess.restMode='auto';activeSess.readiness={score:0.3};toggleDone(0,0);toggleDone(0,0);hideRirAsk()}"); page.wait_for_timeout(100)
    left = ev("()=>Math.round((restEndTs-Date.now())/1000)")
    check('D12. Automático con readiness 30: curl 105 + 30 = 135 s (base 150)', abs(left - 135) <= 2, left)
    ev("()=>stopRest()")

    # ── 3 · Bloqueo de pantalla ──
    check('D13. Botón de candado en la cabecera del entreno', ev("()=>{const b=document.getElementById('lock-btn');return !!b&&b.offsetParent!==null}"))
    hdr = ev("()=>{const h=document.querySelector('#s-sess .sess-hdr').getBoundingClientRect();return [...document.querySelectorAll('#s-sess .sess-hdr > *')].every(e=>{const r=e.getBoundingClientRect();return r.right<=h.right+1&&r.left>=h.left-1})}")
    check('D14. La cabecera cabe en el móvil con el candado', hdr)
    page.click('#lock-btn'); page.wait_for_timeout(200)
    st = ev("()=>{const o=document.getElementById('lock-ov'),cs=getComputedStyle(o);return {on:o.classList.contains('on'),z:+cs.zIndex,bg:cs.backgroundColor,ring:getComputedStyle(document.getElementById('lock-ring')).borderTopColor}}")
    check('D15. Al bloquear sale la capa oscura (se intuye la rutina) con el candado en círculo blanco', st['on'] and st['z'] >= 9999 and st['bg'].startswith('rgba(') and 0.5 < float(st['bg'].split(',')[-1].strip(' )')) < 0.9 and st['ring'] == 'rgb(255, 255, 255)', st)
    fin = ev("()=>{const r=document.querySelector('#s-sess .finish-btn').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    page.mouse.click(*fin); page.wait_for_timeout(300)
    page.touchscreen.tap(*fin); page.wait_for_timeout(300)
    check('D16. Con la pantalla bloqueada no funciona ningún botón (Finalizar no hace nada)', ev("()=>!!activeSess&&curScr()==='sess'"))
    kg = ev("()=>{const r=document.getElementById('kg_1_0').getBoundingClientRect();return [r.x+5,r.y+5]}")
    page.mouse.click(*kg); page.keyboard.type('99'); page.wait_for_timeout(200)
    check('D17. Ni se puede escribir en las series', ev("()=>document.getElementById('kg_1_0').value") == '' and ev("()=>document.activeElement?.id") != 'kg_1_0')
    ev("()=>startRest(95)"); page.wait_for_timeout(1100)
    check('D18. Con la pantalla bloqueada se ve el descanso', ev("()=>document.getElementById('lock-rest').textContent").startswith('Descanso 1:3'))
    ring = ev("()=>{const r=document.getElementById('lock-ring').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
    page.mouse.click(*ring); page.wait_for_timeout(300)
    check('D19. Un toque corto en el candado NO desbloquea', ev("()=>lockOn"))
    page.mouse.move(*ring); page.mouse.down(); page.wait_for_timeout(1000); page.mouse.up(); page.wait_for_timeout(200)
    check('D20. Mantener pulsado el candado desbloquea', not ev("()=>lockOn") and not ev("()=>document.getElementById('lock-ov').classList.contains('on')"))
    page.click('#s-sess .cancel-btn'); page.wait_for_timeout(200)
    check('D21. Desbloqueada, los botones vuelven a funcionar (Cancelar pide confirmación)', ev("()=>document.getElementById('dlg-overlay').style.display") == 'flex')
    page.click('#dlg-cancel'); page.wait_for_timeout(200); ev("()=>stopRest()")
    if '--shots' in sys.argv:
        ev("()=>{lockScreen();startRest(84)}"); page.wait_for_timeout(1100); page.screenshot(path='/tmp/claude-0/shots/lock.png'); ev("()=>unlockScreen()")

    # ── 4 · Alarma nativa (APK) ──
    ev(NATIVE, True)
    ev("()=>startRest(1)"); page.wait_for_timeout(300)
    ra = ev("()=>__ra.slice()")
    si = [i for i, x in enumerate(ra) if x[0] == 'schedule']
    check('D22. En la app, el descanso programa la alarma nativa (canal de alarma) y no la notificación', len(si) == 1 and abs(ra[si[0]][1] - ev("()=>restEndTs")) < 5 and ev("()=>__ln.filter(x=>x[0]==='schedule').length") == 0, (ra, ev("()=>__ln")))
    page.wait_for_timeout(1500)
    st = ev("()=>({ra:__ra.slice(),beeps:__beeps,ended:restEndTs===null})")
    check('D23. Al acabar, la app no cancela la alarma (que suene ella) ni pita encima', st['ended'] and st['ra'][-1][0] == 'schedule' and st['beeps'] == 0, st)
    ev("()=>{__ra.length=0;startRest(60)}"); page.wait_for_timeout(200); ev("()=>restAdd(15)"); page.wait_for_timeout(200)
    st = ev("()=>__ra.map(x=>x[0])")
    check('D24. +15 s reprograma la alarma', st.count('schedule') == 2, st)
    ev("()=>stopRest()"); page.wait_for_timeout(200)
    check('D25. Saltar el descanso cancela la alarma', ev("()=>__ra.slice(-1)[0][0]") == 'cancel')
    ev("()=>{navTo('perfil')}"); page.wait_for_timeout(400)
    has = ev("()=>!!document.querySelector('#health-card button[onclick=\"testRestAlarm()\"]')")
    if has:
        ev("()=>testRestAlarm()"); page.wait_for_timeout(100)
    check('D26. Botón «Probar alarma» en Perfil (solo en la app)', has and ev("()=>__ra.slice(-1)[0][0]") == 'test')
    # APK anterior sin RestAlarm: sigue la notificación local de antes
    ev(NATIVE, False)
    ev("()=>startRest(1)"); page.wait_for_timeout(300)
    check('D27. APK sin la alarma nueva: usa la notificación local', ev("()=>__ln.filter(x=>x[0]==='schedule').length") == 1)
    page.wait_for_timeout(1500)
    check('D28. … y tampoco la cancela al terminar (antes la quitaba justo antes de sonar)', ev("()=>__ln.slice(-1)[0][0]") == 'schedule' and ev("()=>__beeps") == 0, ev("()=>[__ln,__beeps]"))
    ev("()=>{delete window.Capacitor}")
    ev("()=>startRest(1)"); page.wait_for_timeout(1500)
    check('D29. En la web (sin app) pita desde la página', ev("()=>__beeps") == 1)

    # ── 5 · Readiness y rendimiento en las sesiones hechas ──
    ev("""()=>{const s=db.sessions.find(s=>s.id===1006);s.readiness={score:0.72,rec:'full',applied:false,subj:{v:2,sleepH:3,energy:4,motivation:5,muscles:{'Bíceps':'doms'}}};s.plannedSets=6;s.exercises.forEach(e=>e.sets.forEach(x=>{x.kg=+x.kg+2.5}));
      const t=db.sessions.find(s=>s.id===1005);delete t.readiness;saveDB();selDate=s.date;navTo('train');renderDayPanel();}""")
    page.wait_for_timeout(400)
    tag = ev("()=>document.getElementById('day-panel').innerText")
    check('D30. En el día: readiness y rendimiento de la sesión', '🔋 72' in tag and '📈 +' in tag, tag[:300])
    ev("()=>openSessionDetail(1006)"); page.wait_for_timeout(300)
    d = ev("()=>document.querySelector('#detail-body .rd-card')?.innerText||''")
    check('D31. En el detalle: readiness, consejo, check-in y músculos', '72' in d and 'Sesión completa' in d and '7–8 h' in d and 'Bíceps' in d and 'agujetas' in d.lower(), d)
    check('D32. En el detalle: series hechas vs. planificadas y rendimiento vs. la última vez', 'de 6' in d and 'Rendimiento' in d and '2 ej.' in d, d)
    perf = ev("()=>PPCore.sessPerf(db.sessions,db.sessions.find(s=>s.id===1006))")
    check('D33. Rendimiento = cambio medio del mejor e1RM frente a la sesión anterior', perf and perf['n'] == 2 and perf['pct'] > 0, perf)
    ev("()=>closeDetail()")
    w = ev("()=>{dashOff=0;renderWeekScr();return document.getElementById('wk-sessions').innerText}")
    check('D34. En la lista de la semana también sale la readiness', '🔋 72' in w, w)
    nd = ev("()=>sessReadyTag(db.sessions.find(s=>s.id===1005))")
    check('D35. Sin readiness guardada ni datos del reloj: solo el rendimiento', '🔋' not in nd and '📈' in nd, nd)
    v = ev("()=>sessMetaIn(sessMetaOut({readiness:{score:.5},restMode:'same'}))")
    check('D36. La readiness y el modo de descanso viajan a Supabase con la sesión', v == {'readiness': {'score': 0.5}, 'restMode': 'same'}, v)

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
