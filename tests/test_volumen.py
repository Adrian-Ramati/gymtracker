"""Volumen (27-oct): pestaña propia en la barra, landmarks que se guardan para siempre (también al reabrir
la app con Supabase), editor sin Gemelos/Sóleo/Abductores/Hombro posterior y Gemelo/Sóleo como un solo grupo.
Ejecutar: python tests/test_volumen.py [-v]"""
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

# Cliente de Supabase falso: cada consulta devuelve lo que diga TABLES[tabla]
FAKE_SB = """(prof)=>{
  const res=t=>t==='profiles'?{data:prof,error:null}:t==='biometric_daily'?{data:[],error:null}:t==='sessions'?{data:window.__sess,error:null}:{data:[],error:null};
  const chain=t=>{const c={then:(ok,ko)=>Promise.resolve(res(t)).then(ok,ko)};['select','eq','gte','order','single','update','upsert'].forEach(k=>c[k]=()=>c);return c;};
  window.__sess=db.sessions.map(s=>({id:s.id,date:s.date,name:s.name,day_name:s.dayName,exercises:s.exercises}));
  if(!localStorage.getItem('gtv6_u1'))localStorage.setItem('gtv6_u1',localStorage.getItem('gtv6_local'));
  sbClient={from:chain};supabaseUser={id:'u1'};useSupabase=false;
}"""

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844})
    ctx.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=ns['IMG']))
    page = ctx.new_page(); errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
    ev = page.evaluate
    page.goto('file://' + os.path.join(ROOT, 'index.html')); page.wait_for_timeout(1200)
    page.click('#btn-local'); page.wait_for_timeout(800)
    ev(ns['MOCK']); ev(ns['SEED']); page.wait_for_timeout(700)
    # Gemelos apuntados con tres nombres distintos, como en el historial real
    ev("""()=>{const d=weekRange(0)[0];db.sessions.push({id:990001,date:d,name:'Pierna',exercises:[
      {name:'Gemelo de pie',muscle:'Gemelo',sets:[{kg:60,reps:12,done:true},{kg:60,reps:12,done:true}]},
      {name:'Gemelo sentado',muscle:'Sóleo',sets:[{kg:40,reps:15,done:true}]},
      {name:'Gemelo en prensa',muscle:'Gemelo/Sóleo',sets:[{kg:80,reps:12,done:true}]},
      {name:'Abductora',muscle:'Abductores',sets:[{kg:50,reps:15,done:true}]}]});saveDB();}""")

    # ── 1 · Pestaña Volumen ──
    ev("()=>navHome()"); page.wait_for_timeout(300)
    t = ev("()=>[...document.querySelectorAll('#s-home .hcard-head span')].map(e=>e.textContent)")
    check('V1. La portada ya no tiene la tarjeta de volumen', 'Volumen muscular' not in t and not ev("()=>!!document.getElementById('hc-body')"), t)
    labels = ev("()=>[...document.querySelectorAll('#bnav .bn')].map(b=>b.textContent.trim())")
    check('V2. La barra tiene Inicio · Volumen · Progreso · Perfil', labels == ['Inicio', 'Volumen', 'Progreso', 'Perfil'], labels)
    page.click('#bn-vol'); page.wait_for_timeout(700)
    on = ev("()=>['home','vol','stats','perfil'].filter(k=>document.getElementById('bn-'+k).classList.contains('on'))")
    check('V3. Volumen abre la pantalla de volumen y queda marcada', ev("()=>curScr()") == 'vol' and on == ['vol'] and page.inner_text('#hdr-title') == 'Volumen', (on, page.inner_text('#hdr-title')))
    check('V4. La pantalla tiene mapa, landmarks y gráficas', ev("()=>!!document.querySelector('#body-wrap svg')&&document.querySelectorAll('#vol-bars .vbar-wrap').length>0"))
    r = ev("()=>{const n=document.getElementById('bnav').getBoundingClientRect(),b=[...document.querySelectorAll('#bnav .bn')].map(x=>x.getBoundingClientRect());return{fit:b.every(x=>x.left>=n.left-1&&x.right<=n.right+1),w:Math.min(...b.map(x=>x.width))}}")
    check('V5. Los cuatro botones caben en la barra', r['fit'] and r['w'] >= 60, r)

    # ── 2 · Gemelo / Sóleo como un solo grupo ──
    nm = ev("()=>['Gemelo','Gemelos','Sóleo','soleo','Gemelo/Sóleo','Hombro posterior'].map(normMuscle)")
    check('V6. Gemelo, Gemelos y Sóleo son Gemelo/Sóleo; Hombro posterior es Deltoides posterior', nm == ['Gemelo/Sóleo'] * 5 + ['Deltoides posterior'], nm)
    chips = ev("()=>[...document.querySelectorAll('#vol-muscle-chips .mf')].map(c=>c.textContent)")
    check('V7. Histórico por músculo sin "Gemelo" ni "Sóleo" sueltos y sin repetir', 'Gemelo' not in chips and 'Sóleo' not in chips and chips.count('Gemelo/Sóleo') == 1, chips)
    v = ev("()=>{const r=[...document.querySelectorAll('#vol-bars .vbar-wrap')].map(w=>w.querySelector('.vbar-label span').firstChild.textContent);return r}")
    check('V8. En las barras sale un único Gemelo/Sóleo con las series juntas', v.count('Gemelo/Sóleo') == 1 and 'Gemelo' not in v and 'Sóleo' not in v, v)
    ev("()=>volToggle('Pectoral')"); ev("()=>volToggle('Gemelo/Sóleo')"); page.wait_for_timeout(300)
    n = ev("()=>{const c=Chart.getChart('volChart');return c.data.datasets.find(d=>d.label==='Gemelo/Sóleo')?.data.reduce((a,b)=>a+(b||0),0)}")
    check('V9. La gráfica de Gemelo/Sóleo suma las 4 series', n == 4, n)

    # ── 3 · Editor de landmarks ──
    ev("()=>{db.profile.landmarks={'Hombro posterior':{mev:5},'Abductores':{mev:3,mav:6,mrv:9}};openLandmarks()}"); page.wait_for_timeout(200)
    rows = ev("()=>[...document.querySelectorAll('#lm-rows span')].map(s=>s.textContent)")
    check('V10. Editor sin Gemelos, Sóleo, Abductores ni Hombro posterior', not ({'Gemelos', 'Sóleo', 'Abductores', 'Hombro posterior', 'Gemelo'} & set(rows)) and 'Gemelo/Sóleo' in rows and 'Deltoides posterior' in rows, rows)
    check('V11. Lo guardado como "Hombro posterior" aparece en Deltoides posterior', ev("()=>document.querySelector('#lm-rows input[data-m=\"Deltoides posterior\"][data-f=\"mev\"]').value") == '5')
    check('V12. Gemelo/Sóleo con valores por defecto 8 · 14 · 20', ev("()=>[...document.querySelectorAll('#lm-rows input[data-m=\"Gemelo/Sóleo\"]')].map(i=>i.placeholder)") == ['8', '14', '20'])
    ev("()=>{const s=(m,f,v)=>{document.querySelector(`#lm-rows input[data-m=\"${m}\"][data-f=\"${f}\"]`).value=v};s('Pectoral','mav',18);s('Gemelo/Sóleo','mev',6);saveLandmarks()}"); page.wait_for_timeout(300)
    lm = ev("()=>db.profile.landmarks")
    check('V13. Se guarda con el nombre canónico y sin "Hombro posterior"', lm.get('Pectoral') == {'mav': 18} and lm.get('Gemelo/Sóleo') == {'mev': 6} and lm.get('Deltoides posterior') == {'mev': 5} and 'Hombro posterior' not in lm, lm)
    check('V14. Abductores (oculto) conserva su ajuste', lm.get('Abductores') == {'mev': 3, 'mav': 6, 'mrv': 9}, lm)
    txt = ev("()=>[...document.querySelectorAll('#vol-bars .vbar-label')].find(l=>l.textContent.startsWith('Pectoral'))?.textContent")
    check('V15. Las barras de esta semana se actualizan al guardar', txt and '8·18·22' in txt, txt)
    ev("()=>dashMove(-3)"); page.wait_for_timeout(400)
    got = ev("()=>({lm:getLandmarks('Pectoral'),txt:[...document.querySelectorAll('#vol-bars .vbar-label')].find(l=>l.textContent.startsWith('Pectoral'))?.textContent||''})")
    check('V16. Y valen para cualquier otra semana', got['lm'] == {'mev': 8, 'mav': 18, 'mrv': 22} and ('8·18·22' in got['txt'] or not got['txt']), got)
    ev("()=>dashMove(3)")
    check('V17. Lo usa también la progresión del mesociclo', ev("()=>PPCore.landmarks(db.profile,'Gemelo')") == {'mev': 6, 'mav': 14, 'mrv': 20})
    check('V18. Siguen ahí al reabrir la app (copia local)', ev("()=>{db={};loadDB();return getLandmarks('Pectoral')?.mav}") == 18)

    # ── 4 · Al abrir con Supabase gana la copia más reciente ──
    at = ev("()=>db.profile.settingsAt")
    check('V19. Cambiar ajustes deja fecha (settingsAt)', isinstance(at, (int, float)) and at > 0, at)
    ev(FAKE_SB, {'id': 'u1', 'height': 180, 'sex': 'male', 'age': 30, 'settings': {'landmarks': {'Pectoral': {'mav': 12}}, 'settingsAt': at - 60000}})
    ev("()=>{window.__pushed=0;const o=saveSettingsRemote;window.saveSettingsRemote=()=>{window.__pushed++;};}")
    ev("()=>loadDBFromSupabase()"); page.wait_for_timeout(500)
    st = ev("()=>({mav:getLandmarks('Pectoral')?.mav,pushed:window.__pushed})")
    check('V20. Copia de Supabase más vieja: se queda la local y se vuelve a subir', st == {'mav': 18, 'pushed': 1}, st)
    ev("()=>{const s=JSON.parse(localStorage.getItem(lsKey()));s.profile.settingsAt=1;localStorage.setItem(lsKey(),JSON.stringify(s));}")
    ev(FAKE_SB, {'id': 'u1', 'height': 180, 'sex': 'male', 'age': 30, 'settings': {'landmarks': {'Pectoral': {'mav': 12}}, 'settingsAt': at + 60000}})
    ev("()=>loadDBFromSupabase()"); page.wait_for_timeout(500)
    check('V21. Copia de Supabase más nueva (otro dispositivo): gana Supabase', ev("()=>getLandmarks('Pectoral')?.mav") == 12)
    ev("()=>{sbClient=null;supabaseUser=null;}")

    check('Z1. Sin errores de JavaScript', not errors, errors[:5])
    b.close()

print(f'\n{sum(res)}/{len(res)} OK'); sys.exit(0 if all(res) else 1)
