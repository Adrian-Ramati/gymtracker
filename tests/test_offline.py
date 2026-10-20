"""Service worker: modo sin conexión, GIF en caché y que las actualizaciones lleguen.
Sirve una copia del repo por HTTP (los service workers no funcionan en file://).
Ejecutar: python tests/test_offline.py [-v]"""
import os, sys, shutil, tempfile, threading, functools, http.server, socketserver, json
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
VERBOSE = '-v' in sys.argv
res = []
def check(name, cond, extra=''):
    res.append(bool(cond))
    if VERBOSE or not cond: print(('PASS ' if cond else 'FAIL ') + name + (f'  [{extra}]' if extra and not cond else ''))

site = tempfile.mkdtemp(prefix='pp-site-')
for item in ['index.html', 'sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'exgifs.json', 'css', 'js']:
    src = os.path.join(ROOT, item)
    (shutil.copytree if os.path.isdir(src) else shutil.copy)(src, os.path.join(site, item))

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self): self.send_header('Cache-Control', 'no-cache'); super().end_headers()
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}'
VERSION = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read().split("const VERSION = '")[1].split("'")[0]

try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
        page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        ev = page.evaluate
        page.goto(BASE + '/index.html'); page.wait_for_timeout(1500)
        ev("()=>navigator.serviceWorker.ready")
        page.reload(); page.wait_for_timeout(1500)
        check('O1. El service worker se instala y controla la app', ev("()=>!!navigator.serviceWorker.controller"))
        keys = ev("async()=>caches.keys()")
        check('O2. Cachés: app versionada + GIF + librerías', f'app-{VERSION}' in keys and 'pp-cdn-v1' in keys, keys)
        n_app = ev(f"async()=>(await (await caches.open('app-{VERSION}')).keys()).length")
        n_assets = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read().split('const ASSETS = [')[1].split('];')[0].count("'./")
        check('O3. La app entera queda guardada (index, css, js, iconos, índice de GIF)', n_app == n_assets and n_assets >= 20, (n_app, n_assets))
        # Precarga de GIF de las rutinas
        page.click('#btn-local'); page.wait_for_timeout(1200)
        ev("()=>{db.templates=[{id:'t',name:'T',exercises:[{name:'Press banca',muscle:'Pectoral',sets:3},{name:'Prensa 45º',muscle:'Cuádriceps',sets:3}]}];db.sessions=[];}")
        page.wait_for_function("()=>!!GIF_DB", timeout=15000)
        n = ev("async()=>{await prefetchRoutineGifs();return (await (await caches.open('pp-gifs-v1')).keys()).length}")
        check('O4. Se precargan los GIF y miniaturas de las rutinas', n >= 4, n)
        gif = ev("()=>gifUrl(getGif('Press banca'))")
        n2 = ev("async()=>{await prefetchRoutineGifs();return (await (await caches.open('pp-gifs-v1')).keys()).length}")
        check('O5. La precarga no duplica lo que ya está guardado', n2 == n, (n, n2))
        # Sin conexión
        ctx.set_offline(True)
        page.reload(); page.wait_for_timeout(2000)
        st = ev("()=>({core:typeof PPCore,app:typeof renderHome,chart:typeof Chart,sb:typeof window.supabase,login:getComputedStyle(document.getElementById('login-overlay')).display})")
        check('O6. Sin conexión la app abre con todos sus scripts y librerías', st['core'] == 'object' and st['app'] == 'function' and st['chart'] == 'function' and st['sb'] == 'object', st)
        page.click('#btn-local'); page.wait_for_timeout(800)
        w = ev(f"()=>new Promise(r=>{{const i=new Image();i.onload=()=>r(i.naturalWidth);i.onerror=()=>r(-1);i.src='{gif}';}})")
        check('O7. Sin conexión el GIF de un ejercicio de tus rutinas se ve', w > 0, w)
        ctx.set_offline(False)
        # Una versión nueva llega en cuanto está online (antes se servía la copia vieja)
        with open(os.path.join(site, 'js', 'main.js'), 'a', encoding='utf-8') as f: f.write("\nwindow.__ppVersionNueva=1;\n")
        page.reload(); page.wait_for_timeout(1500)
        check('O8. Con conexión se carga la versión nueva sin esperar', ev("()=>window.__ppVersionNueva===1"))
        sw = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
        check('O9. Se conserva el aviso de fin de descanso', "'schedule-rest'" in sw and "'cancel-rest'" in sw and 'notificationclick' in sw)
        check('Z1. Sin errores de JavaScript', not errors, errors[:5])
        b.close()
finally:
    srv.shutdown(); shutil.rmtree(site, ignore_errors=True)

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
