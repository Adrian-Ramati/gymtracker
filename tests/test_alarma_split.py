"""1-nov: candado aunque el HTML esté desfasado, control de versión HTML/JS, diagnóstico de la alarma,
«ant.» sin «nullxnull» y descanso dividido (⇄ ½) para unilaterales en multiarticulares.
Ejecutar: python tests/test_alarma_split.py [-v]"""
import os, re, sys
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

# ── Versión: index.html, main.js y sw.js deben ir juntos ──
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
mainjs = open(os.path.join(ROOT, 'js', 'main.js'), encoding='utf-8').read()
swjs = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
hv = re.search(r'<meta name="pp-version" content="([^"]+)"', html); jv = re.search(r"const WEB_V='([^']+)'", mainjs); sv = re.search(r"const VERSION = 'pp-([^']+)'", swjs)
check('X1. index.html, main.js y sw.js llevan la misma versión', hv and jv and sv and hv.group(1) == jv.group(1) == sv.group(1), (hv and hv.group(1), jv and jv.group(1), sv and sv.group(1)))

NATIVE = """(info)=>{window.__ra=[];
  const LN={checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),createChannel:async()=>{},cancel:async()=>{},schedule:async()=>{}};
  const RA={schedule:async(o)=>{__ra.push(['schedule',o.at]);return {service:true,exact:true}},cancel:async()=>{__ra.push(['cancel'])},test:async()=>{__ra.push(['test'])},
    info:async()=>info,openSettings:async()=>{__ra.push(['settings'])}};
  window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:LN,RestAlarm:RA}};
}"""

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 412, 'height': 915})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    # Simula un index.html viejo en caché: sin candado ni capa de bloqueo ni meta de versión
    old_html = html.replace(re.search(r'<button class="lock-btn".*?</button>\n', html, re.S).group(0), '')
    old_html = old_html.replace(re.search(r'<!-- Pantalla bloqueada.*?</div>\n</div>\n', old_html, re.S).group(0), '')
    old_html = re.sub(r'<meta name="pp-version"[^>]*>\n', '', old_html)
    assert 'lock-btn' not in old_html and 'lock-ov' not in old_html
    old_path = os.path.join(ROOT, '_old_index_test.html'); open(old_path, 'w', encoding='utf-8').write(old_html)
    try:
        page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        ev = page.evaluate
        page.goto('file://' + old_path); page.wait_for_timeout(1200)
        page.click('#btn-local'); page.wait_for_timeout(800)
        ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(500)
        ev("()=>{startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(400)
        check('X2. Con un HTML viejo el candado aparece igual (lo crea el JS)', ev("()=>{const b=document.getElementById('lock-btn');return !!b&&b.offsetParent!==null&&b.nextElementSibling?.classList.contains('cancel-btn')}"))
        ev("()=>lockScreen()"); page.wait_for_timeout(200)
        check('X3. … y la capa de bloqueo también funciona', ev("()=>document.getElementById('lock-ov').classList.contains('on')&&!!document.getElementById('lock-ring')"))
        ring = ev("()=>{const r=document.getElementById('lock-ring').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}")
        page.mouse.move(*ring); page.mouse.down(); page.wait_for_timeout(1000); page.mouse.up(); page.wait_for_timeout(200)
        check('X4. … y se desbloquea manteniendo pulsado', not ev("()=>lockOn"))
        check('X5. En file:// no intenta recargar aunque falte la versión', ev("()=>location.protocol") == 'file:')
        page.close()
    finally:
        os.remove(old_path)

    ctx.close(); ctx = b.new_context(viewport={'width': 412, 'height': 915})  # sin el entreno a medias de la página anterior
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(500)
    check('X6. Con el HTML bueno no se duplica el candado', ev("()=>document.querySelectorAll('#lock-btn').length") == 1 and ev("()=>document.querySelectorAll('#lock-ov').length") == 1)

    # ── «ant.» sin nullxnull ──
    ev("""()=>{const s=db.sessions.find(s=>s.id===1006);s.exercises[1].sets.push({kg:null,reps:null,rpe:null,done:false});
      s.exercises[1].sets.push({kg:50,reps:null});saveDB();startFromTmpl('t1');preSessGo(true);
      const e=activeSess.exercises[1];while(e.sets.length<6)e.sets.push({kg:null,reps:null,rpe:null,done:false});renderSessExs();}""")
    page.wait_for_timeout(300)
    prev = ev("()=>[...document.querySelectorAll('#sets_1 .prev-cell')].map(c=>c.textContent)")
    check('X7. La columna «ant.» nunca muestra «nullxnull»', not any('null' in x for x in prev) and prev[3] == '—' and prev[4] == '50x–', prev)

    # ── Descanso dividido ──
    btns = ev("()=>[...document.querySelectorAll('#sess-exs .ec')].map(c=>!!c.querySelector('.ec-split'))")
    check('X8. Botón ⇄ ½ solo en multiarticulares (curl no, press sí)', btns == [False, True], btns)
    full = ev("()=>exRestNow(activeSess.exercises[1])")
    page.click('#ec_1 .ec-split'); page.wait_for_timeout(200)
    st = ev("()=>({on:activeSess.exercises[1].split,b:document.querySelector('#ec_1 .ec-split').classList.contains('on'),txt:document.querySelector('#ec_1 .ec-rest').textContent})")
    half = max(15, round(full / 2 / 5) * 5)
    fm = lambda s: f"{s // 60}:{s % 60:02d}"
    check('X9. Al activarlo, el descanso se muestra partido en dos', st['on'] and st['b'] and f"{fm(half)} + {fm(half)}" in st['txt'], (full, st))
    ev("()=>{const e=activeSess.exercises[1];document.getElementById('kg_1_0').value=80;document.getElementById('rp_1_0').value=8;toggleDone(1,0)}"); page.wait_for_timeout(100)
    st = ev("()=>({half:activeSess.exercises[1].sets[0].half,done:activeSess.exercises[1].sets[0].done,left:Math.round((restEndTs-Date.now())/1000),btn:document.querySelector('#sr_1_0 .check-btn').textContent,rir:document.getElementById('rir-ask')?.classList.contains('show')||false})")
    check('X10. 1.er toque = lado A: medio descanso, la serie aún no cuenta y no pregunta el RIR', st['half'] and not st['done'] and abs(st['left'] - half) <= 2 and st['btn'] == '½' and not st['rir'], st)
    ev("()=>toggleDone(1,0)"); page.wait_for_timeout(100)
    st = ev("()=>({half:!!activeSess.exercises[1].sets[0].half,done:activeSess.exercises[1].sets[0].done,left:Math.round((restEndTs-Date.now())/1000),btn:document.querySelector('#sr_1_0 .check-btn').textContent,kg:activeSess.exercises[1].sets[0].kg})")
    check('X11. 2.º toque = lado B: serie hecha y el otro medio descanso', st['done'] and not st['half'] and abs(st['left'] - half) <= 2 and st['btn'] == '✓' and st['kg'] == 80, st)
    ev("()=>{hideRirAsk();toggleDone(1,0)}"); page.wait_for_timeout(100)
    check('X12. Un 3.er toque desmarca la serie como siempre', not ev("()=>activeSess.exercises[1].sets[0].done") and not ev("()=>!!activeSess.exercises[1].sets[0].half"))
    ev("()=>{stopRest();toggleSplit(1)}"); page.wait_for_timeout(100)
    ev("()=>{document.getElementById('kg_1_1').value=80;document.getElementById('rp_1_1').value=8;toggleDone(1,1)}"); page.wait_for_timeout(100)
    st = ev("()=>({done:activeSess.exercises[1].sets[1].done,left:Math.round((restEndTs-Date.now())/1000)})")
    check('X13. Desactivado, un toque = serie hecha con el descanso entero', st['done'] and abs(st['left'] - full) <= 2, (full, st))
    ev("()=>{hideRirAsk();stopRest();toggleSplit(1);finishSession()}"); page.wait_for_timeout(500)
    ev("()=>{startFromTmpl('t1');preSessGo(true)}"); page.wait_for_timeout(400)
    check('X14. La próxima vez ese ejercicio arranca con el descanso dividido', ev("()=>activeSess.exercises.find(e=>e.name==='Press banca')?.split") is True)
    check('X15. En el editor de rutinas no aparece el botón (es de la sesión en marcha)', ev("()=>{const a=activeSess;cancelSession&&0;return true}") and ev("()=>{const save=activeSess;activeSess=null;openEditTmpl('t1');const n=document.querySelectorAll('#tmpledit-exs .ec-split').length;exitTmplEdit();return n}") == 0)

    # ── Diagnóstico de la alarma (APK) ──
    ev("()=>{activeSess=null;clearActiveStash&&clearActiveStash()}")
    ev(NATIVE, {'version': '1.0.15', 'exact': True, 'notifications': True, 'batteryUnrestricted': False, 'alarmVolume': 0, 'alarmVolumeMax': 7, 'manufacturer': 'Xiaomi', 'sdk': 35})
    ev("()=>navTo('perfil')"); page.wait_for_timeout(500)
    d = ev("()=>document.getElementById('alarm-diag')?.innerText||''")
    check('X16. Perfil muestra la versión del APK y de la web', 'App 1.0.15' in d and 'Web ' in d, d)
    check('X17. Avisa del volumen de alarma a 0 y de la batería (Xiaomi: Inicio automático)', '✗ Volumen de alarma 0/7' in d and '✗ Batería sin restricciones' in d and 'Inicio automático' in d, d)
    page.click('#alarm-diag button'); page.wait_for_timeout(100)
    check('X18. Botón para abrir los ajustes de la app', ev("()=>__ra.slice(-1)[0][0]") == 'settings')
    ev("()=>{window.Capacitor={isNativePlatform:()=>false,Plugins:{}};renderHealthCard()}"); page.wait_for_timeout(300)
    check('X19. En la web normal (no la app) no sale el diagnóstico', not ev("()=>!!document.getElementById('alarm-diag')"))

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
