"""Reloj vía Health Connect (fase F3 de la auditoría), con el puente de Capacitor simulado:
conexión y permisos, importación de 30 días, fusión con peso/pasos, pulso por serie, readiness en el IHO
y temporizador con notificación nativa. En el navegador, la tarjeta ofrece descargar la app Android.
Ejecutar: python tests/test_health.py [-v]"""
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

# Puente nativo simulado: 12 días de datos de un Xiaomi (sueño, pulso en reposo, HRV, pasos de dos fuentes, peso)
BRIDGE = """(()=>{
  const day=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d;};
  // hora h del día n; si hoy aún no ha llegado esa hora, justo antes de ahora (la prueba no depende de cuándo se ejecute)
  const at=(n,h,m=0)=>{const d=day(n);d.setHours(h,m,0,0);if(d.getTime()>Date.now())d.setTime(Date.now()-60000);return d.toISOString();};
  const S={sleep:[],restingHeartRate:[],heartRateVariability:[],steps:[],weight:[],heartRate:[]};
  for(let n=0;n<12;n++){
    S.sleep.push({startDate:at(n+1,23,30),endDate:at(n,7,0),value:450,stages:[{stage:'light',durationMinutes:250},{stage:'deep',durationMinutes:90},{stage:'rem',durationMinutes:80},{stage:'awake',durationMinutes:30}]});
    S.restingHeartRate.push({startDate:at(n,7,30),value:54+(n%3)});
    S.heartRateVariability.push({startDate:at(n,4,0),value:50+(n%4)});
    S.steps.push({startDate:at(n,12),value:6000,sourceId:'com.mi.health'},{startDate:at(n,18),value:3000,sourceId:'com.mi.health'},{startDate:at(n,12),value:7000,sourceId:'android'});
    if(n%3===0)S.weight.push({startDate:at(n,8),value:78+n/10});
  }
  window.HC_CALLS=[];window.LN_CALLS=[];
  window.HR_FOR=(t0)=>{S.heartRate=[-20,-10,0,4].map((s,i)=>({startDate:new Date(t0+s*1000).toISOString(),value:118+i*6}));};
  window.Capacitor={isNativePlatform:()=>true,Plugins:{
    Health:{isAvailable:async()=>({available:true,platform:'android'}),
      checkAuthorization:async o=>({readAuthorized:window.HC_DENY?o.read.filter(t=>!window.HC_DENY.includes(t)):o.read,readDenied:window.HC_DENY||[]}),
      openHealthConnectSettings:async()=>{window.HC_OPENED=true;},
      requestAuthorization:async o=>{HC_CALLS.push(['auth',o]);return{readAuthorized:o.read,readDenied:[]};},
      readSamples:async o=>{HC_CALLS.push(['read',o.dataType]);if(window.HC_EMPTY)return{samples:[]};if(window.HC_DENY&&window.HC_DENY.includes(o.dataType))throw new Error('java.lang.SecurityException: Caller doesn\\'t have android.permission.health.READ_'+o.dataType);const a=Date.parse(o.startDate),b=Date.parse(o.endDate);return{samples:(S[o.dataType]||[]).filter(x=>{const t=Date.parse(x.startDate);return t>=a&&t<=b;})};}},
    LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),
      createChannel:async o=>{LN_CALLS.push(['channel',o]);},
      schedule:async o=>{LN_CALLS.push(['schedule',o]);return{}},cancel:async o=>{LN_CALLS.push(['cancel',o]);}}}};
})()"""

def open_app(p, bridge):
    ctx = p.chromium.launch().new_context(viewport={'width': 390, 'height': 844})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    if bridge: ctx.add_init_script(BRIDGE)
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    page.evaluate(ns['MOCK']); page.evaluate(ns['SEED']); page.wait_for_timeout(500)
    return ctx, page, errors

with sync_playwright() as p:
    # ── Navegador: sin Health Connect ──
    ctx, page, errors = open_app(p, False)
    ev = page.evaluate
    page.click('#bn-perfil'); page.wait_for_timeout(300)
    card = ev("()=>document.getElementById('health-card').innerText")
    href = ev("()=>document.querySelector('#health-card a')?.href||''")
    check('W1. En el navegador, la tarjeta del reloj ofrece la app Android', 'Descargar la app Android' in card and href.endswith('/releases/download/android/peak-physique.apk'), (card[:80], href))
    check('W2. Sin la app nativa no se intenta leer nada', ev("()=>hcPlugin()") is None and ev("()=>hcSync(true)") is None)
    check('W2b. En el navegador, Inicio no muestra el botón del reloj', ev("()=>{navHome();return document.getElementById('home-health').innerHTML}") == '')
    check('W3. Sin errores de JavaScript (navegador)', not errors, errors[:3])
    ctx.close()

    # ── App Android simulada ──
    ctx, page, errors = open_app(p, True)
    ev = page.evaluate
    ev("()=>{db.weights=[{date:todayStr(),kg:80.5}];db.steps=[]}")  # peso de hoy registrado a mano: no se pisa
    page.click('#bn-perfil'); page.wait_for_timeout(300)
    check('H1. En la app, la tarjeta ofrece conectar el reloj', 'Conectar el reloj' in ev("()=>document.getElementById('health-card').innerText"))
    page.click('#health-card button'); page.wait_for_timeout(800)
    auth = ev("()=>HC_CALLS.find(c=>c[0]==='auth')?.[1]")
    check('H2. Pide permisos de lectura (con historial) para sueño, pulso en reposo, HRV, peso, pasos y pulso', auth and set(auth['read']) == {'sleep', 'restingHeartRate', 'heartRateVariability', 'weight', 'steps', 'heartRate'} and auth['requestHistoryAccess'] is True, auth)
    bio = ev("()=>db.biometrics")
    today = ev("()=>todayStr()")
    bt = next((b for b in bio if b['date'] == today), {})
    check('H3. Importa los días con sueño (sin fases despierto), pulso en reposo y HRV', len(bio) >= 12 and bt.get('sleepMin') == 420 and bt.get('rhr') == 54 and bt.get('hrv') == 50 and bt.get('src', {}).get('hrv') == 'health_connect', bt)
    check('H4. Pasos sin contar dos veces el móvil y la pulsera', bt.get('steps') == 9000, bt.get('steps'))
    w = ev("()=>db.weights.filter(x=>x.date===todayStr())")
    nw = ev("()=>db.weights.length"); nst = ev("()=>db.steps.length")
    check('H5. Peso y pasos del reloj llegan a Cuerpo y Actividad sin pisar lo registrado a mano', w == [{'date': today, 'kg': 80.5}] and nw == 4 and nst == len(bio), (w, nw, nst))
    check('H6. La tarjeta pasa a «Conectado» con el último dato', 'Conectado' in ev("()=>document.getElementById('health-card').innerText") and '❤' in ev("()=>document.getElementById('health-card').innerText"))
    R = ev("()=>{const R=computeHyperIndex();return {r:R.readiness,days:R.readinessDays,beta:R.beta}}")
    check('H7. El IHO usa la recuperación del reloj (readiness y β)', R['r'] is not None and R['days'] >= 10 and R['beta'] != 1, R)
    # pulso de cada serie
    ev("()=>{const t0=Date.now()-3600e3;HR_FOR(t0);db.sessions.push({id:777,date:todayStr(),name:'T1',exercises:[{name:'Press banca',muscle:'Pectoral',sets:[{kg:80,reps:8,rpe:8,done:true,doneAt:t0}]}]});db.profile.hcLastSync=null}")
    ev("()=>hcSync(false)"); page.wait_for_timeout(500)
    hr = ev("()=>db.sessions.find(s=>s.id===777).exercises[0].sets[0].hr")
    check('H8. Pulso medio y máximo de cada serie a partir de su hora', hr == {'avg': 127, 'max': 136}, hr)
    ev("()=>openSessionDetail(777)"); page.wait_for_timeout(300)
    check('H9. El detalle de la sesión muestra el pulso de la serie', '❤ 127/136' in ev("()=>document.getElementById('detail-body').innerText"))
    ev("()=>closeDetail()")
    # la hoja «Antes de empezar» enseña el dato del reloj
    ev("()=>{selDate=todayStr();startFromTmpl('t1')}"); page.wait_for_timeout(300)
    ready = ev("()=>document.getElementById('presess-ready').innerText")
    check('H10. Antes de empezar se ven el sueño, el pulso y la HRV de hoy, y la readiness sin check-in', '7 h 0 min de sueño' in ready and '54 lpm' in ready and 'HRV 50 ms' in ready and 'Readiness' in ready, ready)
    ev("()=>preSessGo()"); page.wait_for_timeout(400)
    # temporizador con notificación nativa
    ev("()=>{LN_CALLS.length=0;toggleDone(1,0)}"); page.wait_for_timeout(300)
    sch = ev("()=>LN_CALLS.find(c=>c[0]==='schedule')?.[1]?.notifications?.[0]")
    end = ev("()=>restEndTs")
    ch = ev("()=>LN_CALLS.find(c=>c[0]==='channel')?.[1]")
    check('H11. El descanso programa una notificación nativa para cuando acaba', sch and abs(ev(f"()=>Date.parse('{sch['schedule']['at']}')") - end) < 1500, sch)
    check('H11b. Canal propio de importancia alta y alarma exacta: suena con la pantalla bloqueada', ch and ch['importance'] == 4 and ch['vibration'] and sch.get('channelId') == ch['id'] and sch.get('isExactNotification') is True and sch['schedule'].get('allowWhileIdle') is True, (ch, sch))
    ev("()=>{LN_CALLS.length=0;stopRest()}"); page.wait_for_timeout(100)
    check('H12. Parar el descanso cancela la notificación', ev("()=>LN_CALLS.some(c=>c[0]==='cancel')"))
    n0 = ev("()=>HC_CALLS.length"); ev("()=>hcAutoSync()"); page.wait_for_timeout(300)
    check('H13. Al volver a la app no repite la lectura si se hizo hace menos de 30 min', ev("()=>HC_CALLS.length") == n0)
    ev("()=>{db.profile.hcLastSync=new Date(Date.now()-31*60000).toISOString();hcAutoSync()}"); page.wait_for_timeout(500)
    check('H14. …y la repite pasados 30 min', ev("()=>HC_CALLS.length") > n0)
    # diagnóstico: Health Connect vacío y permisos denegados
    ev("()=>{window.HC_EMPTY=true;db.biometrics=[];db.profile.hcLastSync=null}")
    ev("()=>{clearInterval(timerIv);activeSess=null;clearActiveStash();navHome()}")
    ev("()=>hcCheck()"); page.wait_for_timeout(600)
    page.click('#bn-perfil'); page.wait_for_timeout(300)
    t = ev("()=>document.getElementById('health-card').innerText")
    check('H15. Health Connect vacío: el diagnóstico lo dice y explica qué hacer', 'Diagnóstico · 0 días' in t and t.count('sin datos') == 6 and 'Mi Fitness no está escribiendo' in t, t)
    ev("()=>{window.HC_EMPTY=false;window.HC_DENY=['sleep','steps']}")
    ev("()=>hcCheck()"); page.wait_for_timeout(600)
    t = ev("()=>document.getElementById('health-card').innerText")
    check('H16. Permisos denegados: lista cuáles faltan y los demás tipos se importan', t.count('sin permiso') == 2 and 'Faltan permisos (Sueño, Pasos)' in t and 'registros' in t, t)
    ev("()=>hcOpenSettings()"); page.wait_for_timeout(100)
    check('H17. El botón abre los ajustes de Health Connect', ev("()=>!!window.HC_OPENED"))
    ev("()=>{window.HC_DENY=null}")
    # recordatorio del reloj en Inicio
    ev("()=>{db.profile.hcLastSync=new Date(Date.now()-3*3600e3).toISOString();navHome()}"); page.wait_for_timeout(300)
    hh = ev("()=>document.getElementById('home-health').innerText")
    check('H18. Inicio recuerda sincronizar el reloj cuando la lectura es vieja', 'Sincroniza el reloj' in hh and 'hace 3 h' in hh and ev("()=>!!document.querySelector('#home-health .home-hc.stale')"), hh)
    ev("()=>{db.profile.hcLastSync=new Date().toISOString();renderHomeHealth()}")
    check('H19. …y dice que está al día si acaba de leerse', 'Reloj al día' in ev("()=>document.getElementById('home-health').innerText") and not ev("()=>!!document.querySelector('#home-health .home-hc.stale')"))
    ev("()=>{db.profile.healthConnect=false;renderHomeHealth()}")
    check('H20. Sin conectar, el botón de Inicio ofrece conectarlo', 'Conectar el reloj' in ev("()=>document.getElementById('home-health').innerText"))
    ev("()=>{db.profile.healthConnect=true}")
    check('Z1. Sin errores de JavaScript (app)', not errors, errors[:3])
    ctx.close()

print(f"\n{sum(res)}/{len(res)} OK"); sys.exit(0 if all(res) else 1)
