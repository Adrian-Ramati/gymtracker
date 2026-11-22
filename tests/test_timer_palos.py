"""22-nov: la hoja de RIR/RPE se quita al escribir en la casilla, temporizador «−30s · tiempo · +30s»,
tiempo en grande con la pantalla bloqueada y aviso a falta de 20 s con palos de madera (UFC).
Ejecutar: python tests/test_timer_palos.py [-v]"""
import os, sys, re
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

# El aviso nativo va al servicio de la cuenta atrás (código Java: no se ejecuta aquí, se comprueba que esté cableado)
J = lambda f: open(os.path.join(ROOT, 'android/app/src/main/java/es/peakphysique/app', f), encoding='utf-8').read()
svc, plg, clp = J('RestTimerService.java'), J('RestAlarmPlugin.java'), J('Clapper.java')
check('P0. Nativo: el plugin pasa el aviso al servicio y el servicio toca los palos por el canal de alarma',
      'call.getInt("warn", 0)' in plg and 'RestTimerService.start(ctx, when, warnAt)' in plg and 'handler.postDelayed(warn, w)' in svc
      and 'Clapper.play(this)' in svc and 'USAGE_ALARM' in clp and 'testWarn' in plg)

STUB = """()=>{if(!window.__realClack)window.__realClack=clack;window.__clack=0;window.__beep=0;window.clack=()=>{__clack++};window.beep=()=>{__beep++};}"""
NATIVE = """()=>{window.__ra=[];
  window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),createChannel:async()=>{},cancel:async()=>{},schedule:async()=>{}},
    RestAlarm:{schedule:async o=>{__ra.push(['schedule',o.at,o.warn])},cancel:async()=>{__ra.push(['cancel'])},test:async()=>{},testWarn:async()=>{__ra.push(['testWarn'])},openSettings:async()=>{},
      info:async()=>({version:'1.0.20',exact:true,notifications:true,batteryUnrestricted:true,alarmVolume:5,alarmVolumeMax:7,manufacturer:'Xiaomi',sdk:35,log:''})}}};}"""

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 412, 'height': 915})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(500)
    ev("()=>{startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(400)

    # ── 1 · Escribir el RIR/RPE en la casilla quita la hoja flotante ──
    ev("()=>{document.getElementById('kg_0_0').value=20;document.getElementById('rp_0_0').value=10;toggleDone(0,0)}"); page.wait_for_timeout(100)
    check('P1. Al marcar la serie sale la pregunta flotante', ev("()=>document.getElementById('rir-ask').classList.contains('on')"))
    page.fill('#rpe_0_0', '2'); page.wait_for_timeout(100)
    check('P2. Al escribir el valor en la casilla de esa serie, la pregunta se quita sola', not ev("()=>document.getElementById('rir-ask').classList.contains('on')") and ev("()=>activeSess.exercises[0].sets[0].rpe") == 8)
    ev("()=>{stopRest();document.getElementById('kg_0_1').value=20;document.getElementById('rp_0_1').value=10;toggleDone(0,1)}"); page.wait_for_timeout(100)
    page.fill('#rpe_0_2', '3'); page.wait_for_timeout(100)
    check('P3. Escribir en la casilla de OTRA serie no la quita', ev("()=>document.getElementById('rir-ask').classList.contains('on')"))
    page.fill('#rpe_0_1', '14'); page.wait_for_timeout(100)
    check('P4. Un valor imposible no la quita (no se ha guardado nada)', ev("()=>document.getElementById('rir-ask').classList.contains('on')") and ev("()=>activeSess.exercises[0].sets[1].rpe") is None)
    page.fill('#rpe_0_1', '1'); page.wait_for_timeout(100)
    check('P5. Con un valor válido, sí', not ev("()=>document.getElementById('rir-ask').classList.contains('on')") and ev("()=>activeSess.exercises[0].sets[1].rpe") == 9)
    ev("()=>{db.profile.effortMode='rpe';stopRest();renderSessExs();document.getElementById('kg_1_0').value=80;document.getElementById('rp_1_0').value=8;toggleDone(1,0)}"); page.wait_for_timeout(100)
    page.fill('#rpe_1_0', '8.5'); page.wait_for_timeout(100)
    check('P6. También en modo RPE (8,5)', not ev("()=>document.getElementById('rir-ask').classList.contains('on')") and ev("()=>activeSess.exercises[1].sets[0].rpe") == 8.5)
    ev("()=>{db.profile.effortMode='rir';renderSessExs();stopRest()}")

    # ── 2 · Temporizador flotante: −30s · tiempo · +30s ──
    ev(STUB); ev("()=>startRest(90)"); page.wait_for_timeout(100)
    order = ev("()=>[...document.getElementById('rest-pill').children].map(e=>e.id==='rest-time'?'TIEMPO':e.textContent.trim())")
    check('P7. Orden: −30s · tiempo · +30s (y × al final)', order[:3] == ['−30s', 'TIEMPO', '+30s'] and order[-1] == '×', order)
    sz = ev("()=>[...document.querySelectorAll('#rest-pill button')].map(b=>{const r=b.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]})")
    check('P8. Botones de ±30 s fáciles de pulsar (≥ 40 px de alto)', all(h >= 40 for _, h in sz[:2]) and all(w >= 50 for w, _ in sz[:2]), sz)
    page.click('#rest-pill .rp-adj:has-text("−30s")'); page.wait_for_timeout(100)
    l1 = ev("()=>Math.round((restEndTs-Date.now())/1000)")
    page.click('#rest-pill .rp-adj:has-text("+30s")'); page.wait_for_timeout(100)
    l2 = ev("()=>Math.round((restEndTs-Date.now())/1000)")
    check('P9. Los botones siguen restando y sumando', abs(l1 - 60) <= 2 and abs(l2 - 90) <= 2, (l1, l2))

    # ── 3 · Pantalla bloqueada: tiempo en grande ──
    ev("()=>lockScreen()"); page.wait_for_timeout(1100)
    st = ev("()=>{const b=document.querySelector('#lock-rest b');const cs=getComputedStyle(b);return {t:b.textContent,fs:parseFloat(cs.fontSize),lbl:document.querySelector('#lock-rest small').textContent,fits:b.getBoundingClientRect().right<=innerWidth}}")
    check('P10. Con la pantalla bloqueada el tiempo se ve en grande (≥ 100 px)', st['t'].startswith('1:2') and st['fs'] >= 100 and st['lbl'] == 'Descanso' and st['fits'], st)
    ev("()=>{restEndTs=Date.now()+15000;tickRest()}"); page.wait_for_timeout(50)
    check('P11. Los últimos 20 s se ve en ámbar', ev("()=>document.getElementById('lock-rest').classList.contains('warn')") and ev("()=>getComputedStyle(document.querySelector('#lock-rest b')).color") == 'rgb(251, 191, 36)')
    ev("()=>{unlockScreen();stopRest()}")
    p360 = ctx.new_page(); p360.set_viewport_size({'width': 360, 'height': 800})
    p360.goto('file://' + os.path.join(ROOT, 'index.html')); p360.wait_for_timeout(900); p360.click('#btn-local'); p360.wait_for_timeout(600)
    p360.evaluate(ns['MOCK']); p360.evaluate(ns['SEED']); p360.evaluate("()=>{startFromTmpl('t1');preSessGo(true);startRest(600);lockScreen()}"); p360.wait_for_timeout(1100)
    w = p360.evaluate("()=>{const r=document.querySelector('#lock-rest b').getBoundingClientRect();return {l:r.left,r:r.right,w:innerWidth,t:document.querySelector('#lock-rest b').textContent}}")
    check('P12. En 360 px con 10:00 cabe en pantalla', w['l'] >= 0 and w['r'] <= w['w'], w)
    p360.close()

    # ── 4 · Aviso a 20 s: palos ──
    ev(STUB); ev("()=>startRest(25)"); page.wait_for_timeout(100)
    check('P13. Con más de 20 s no suena todavía', ev("()=>__clack") == 0)
    ev("()=>{restEndTs=Date.now()+20000;tickRest()}")
    check('P14. A falta de 20 s suenan los palos (una vez)', ev("()=>__clack") == 1)
    ev("()=>{restEndTs=Date.now()+19000;tickRest();restEndTs=Date.now()+18000;tickRest()}")
    check('P15. … y no se repiten', ev("()=>__clack") == 1)
    ev("()=>{restEndTs=Date.now()+40000;tickRest();restEndTs=Date.now()+20000;tickRest()}")
    check('P16. Si sumas tiempo y vuelves a bajar de 20 s, vuelve a avisar', ev("()=>__clack") == 2)
    ev("()=>{stopRest();__clack=0;startRest(15)}"); ev("()=>{restEndTs=Date.now()+10000;tickRest()}")
    check('P17. En un descanso de menos de 20 s no hay aviso', ev("()=>__clack") == 0)
    ev("()=>{stopRest();__clack=0;startRest(60);restEndTs=Date.now()+5000;tickRest()}")
    check('P18. Si la app estuvo dormida y vuelve con 5 s, no suena a destiempo', ev("()=>__clack") == 0)
    ev("()=>{restEndTs=Date.now()+45000;tickRest();restAdd(-30)}"); page.wait_for_timeout(50)
    check('P19. Restar 30 s hasta quedar por debajo de 20 no suelta los palos de golpe', ev("()=>__clack") == 0)
    ev("()=>stopRest()")

    # Con la app Android: el aviso lo hace la alarma nativa (también con la pantalla apagada), no la página
    ev(NATIVE); ev(STUB); ev("()=>startRest(60)"); page.wait_for_timeout(200)
    sch = ev("()=>__ra.filter(x=>x[0]==='schedule')")
    check('P20. La alarma nativa recibe el aviso de 20 s', len(sch) == 1 and sch[0][2] == 20, sch)
    ev("()=>{restEndTs=Date.now()+20000;tickRest()}")
    check('P21. … y la página no lo duplica', ev("()=>__clack") == 0)
    ev("()=>{stopRest();navTo('perfil')}"); page.wait_for_timeout(500)
    d = ev("()=>document.getElementById('alarm-diag')?.innerText||''")
    check('P22. En Perfil: «Probar en 25 s» y «Oír el aviso de 20 s»', 'Probar en 25 s' in d and 'aviso de 20 s' in d, d)
    page.click('#alarm-diag button:has-text("aviso de 20 s")'); page.wait_for_timeout(100)
    check('P23. «Oír el aviso» lo toca con el sonido nativo', ev("()=>__ra.slice(-1)[0][0]") == 'testWarn')
    page.click('#alarm-diag button:has-text("25 s")'); page.wait_for_timeout(100)
    last = ev("()=>__ra.slice(-1)[0]")
    check('P24. La prueba de 25 s incluye el aviso (palos a los 5 s, alarma a los 25 s)', last[0] == 'schedule' and last[2] == 20 and 23000 < last[1] - ev("()=>Date.now()") <= 25000, last)

    # El sonido de verdad en la web: se genera sin errores con un AudioContext real
    ev("()=>{delete window.Capacitor}")
    ok = ev("""async()=>{const C=window.AudioContext||window.webkitAudioContext;const real=new C();await real.resume();const save=audioCtx;audioCtx=real;
      let err=null,n=0;const orig=real.createBufferSource.bind(real);real.createBufferSource=()=>{n++;return orig();};
      try{__realClack();}catch(e){err=String(e)}audioCtx=save;return {err,state:real.state,golpes:n}}""")
    check('P25. Los palos se sintetizan sin errores (Web Audio): tres golpes', ok['err'] is None and ok['golpes'] == 3, ok)

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
