import sys, re, collections, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

import os
ARGS = [a for a in sys.argv[1:] if not a.startswith('-')]
PATH = os.path.abspath(ARGS[0]) if ARGS else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html')
PATH = os.path.normpath(PATH)
SHOT_DIR = os.environ.get('SHOT_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots'))
VERBOSE = '-v' in sys.argv
SHOTS = '--shots' in sys.argv
res = []
def check(name, cond, extra=''):
    res.append((name, bool(cond)))
    if VERBOSE or not cond:
        print(('PASS ' if cond else 'FAIL ') + name + (f'  [{extra}]' if extra and not cond else ''))

# imagen local para simular los GIF (el sandbox no llega a GitHub)
im = Image.new('RGB', (360, 300), 'white'); d = ImageDraw.Draw(im)
d.rectangle([60, 40, 300, 260], outline=(90, 90, 90), width=6); d.line([60, 150, 300, 150], fill=(90, 90, 90), width=6)
d.ellipse([150, 70, 210, 130], outline=(40, 120, 220), width=6); d.text((120, 270), 'GIF de ejemplo', fill=(0, 0, 0))
buf = io.BytesIO(); im.save(buf, 'PNG'); IMG = buf.getvalue()

MOCK = """()=>{
  ALL_EX=[
    {name:'Press banca',muscle:'Pectoral',equipment:'Máquina',reps:'8-12',description:'Press horizontal en máquina convergente.',execution:'Espalda apoyada, empuja sin bloquear codos.',cues:['Escápulas atrás','Controla la bajada']},
    {name:'Sentadilla',muscle:'Cuádriceps',equipment:'Peso libre',reps:'6-10',description:'',execution:'',cues:[]},
    {name:'Curl bíceps',muscle:'Bíceps',equipment:'Poleas',reps:'10-15',description:'',execution:'',cues:[]}];
  MUSCLES=['Pectoral','Cuádriceps','Bíceps','Espalda'];
  sbClient={from:()=>({insert:async()=>({error:null}),update:()=>({eq:async()=>({error:null})}),upsert:async()=>({error:null}),delete:()=>({eq:async()=>({error:null})})})};
  GIF_DB=[{i:'0001',n:'lever seated chest press',t:'pectorals',e:'leverage machine',m:'aaa'},{i:'0002',n:'barbell full squat',t:'quads',e:'barbell',m:'bbb'},{i:'0003',n:'cable curl',t:'biceps',e:'cable',m:'ccc'},{i:'0004',n:'smith chest press',t:'pectorals',e:'smith machine',m:'ddd'}];
  GIF_AUTO={}; db.profile=db.profile||{}; db.profile.gifMap={'Press banca':'0001','Sentadilla':'0002','Curl bíceps':'0003'};
}"""
SEED = """()=>{
  const t=todayStr(); const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return isoDate(x);};
  const mk=(n,m,k,rm)=>({name:n,muscle:m,notes:'',best_e1rm:rm,sets:Array.from({length:3},()=>({kg:k,reps:10,rpe:8,done:true}))});
  db.templates=[{id:'t1',name:'T1',rest:120,exercises:[{name:'Curl bíceps',muscle:'Bíceps',sets:3},{name:'Press banca',muscle:'Pectoral',sets:4}]},
                {id:'t2',name:'T2',rest:120,exercises:[{name:'Sentadilla',muscle:'Cuádriceps',sets:4}]}];
  const vals=[22.0,22.8,23.5,24.1,24.6,25.4,26.2];
  db.sessions=vals.map((v,i)=>({id:1000+i,date:d((vals.length-1-i)*3),name:'T1',exercises:[mk('Curl bíceps','Bíceps',20,v),mk('Press banca','Pectoral',80,100+i)]}));
  db.sessions.push({id:2000,date:t,name:'T1',exercises:[mk('Sentadilla','Cuádriceps',100,140)]});
  db.weights=[{date:d(15),kg:78.7},{date:d(1),kg:77.9}];
  db.measures=[{week:'2026-S38',date:d(14),bf:14.9},{week:'2026-S40',date:d(2),bf:14.2}];
  db.steps=[{date:t,steps:8200},{date:d(1),steps:10400}];
  db.profile.username='adrian'; if(typeof exCache!=='undefined')exCache=null;
  navHome(); renderHome();
}"""
# Escenario óptimo: 4 sesiones/sem, cada grupo 2×/sem en MEV–MAV, RPE 8, e1RM subiendo, sesiones completas
OPTIMAL = """()=>{
  const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return isoDate(x);};
  const S=(n,m,c,rpe,reps)=>({name:n,muscle:m,notes:'',sets:Array.from({length:c},()=>({kg:50,reps:reps||10,rpe:rpe,done:true}))});
  const U=[['Press pecho','Pectoral',6],['Remo','Espalda',7],['Laterales','Deltoides lateral',6],['Curl','Bíceps',5],['Extensión tríceps','Tríceps',5]];
  const Lw=[['Prensa','Cuádriceps',6],['Curl femoral','Isquiosurales',5],['Hip thrust','Glúteos',4]];
  db.templates=[['U1',U],['L1',Lw],['U2',U],['L2',Lw]].map(([n,ex],i)=>({id:'o'+i,name:n,rest:90,exercises:ex.map(([a,b,c])=>({name:a,muscle:b,sets:c}))}));
  db.sessions=[];let id=5000,k=0;
  for(let day=27;day>=0;day--){const dw=day%7;if(![0,2,4,5].includes(dw))continue;
    const tp=db.templates[k%4];k++;
    const exs=tp.exercises.map(e=>{const x=S(e.name,e.muscle,e.sets,8);x.best_e1rm=60+(27-day)*0.35;return x;});
    db.sessions.push({id:id++,date:d(day),name:tp.name,exercises:exs});}
}"""
# Escenario pobre: 1 sesión/sem, 3 series por grupo a RPE 5, sin progresión, sesión recortada a la mitad
POOR = """()=>{
  const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return isoDate(x);};
  const M=['Pectoral','Espalda','Cuádriceps','Isquiosurales','Glúteos','Bíceps'];
  db.templates=[{id:'p',name:'Full',rest:90,exercises:M.map(m=>({name:'Ej '+m,muscle:m,sets:6}))},{id:'q',name:'X',exercises:[]},{id:'r',name:'Y',exercises:[]}];
  db.sessions=[0,7,14,21,28,35].map((day,i)=>({id:6000+i,date:d(day),name:'Full',exercises:M.map(m=>({name:'Ej '+m,muscle:m,notes:'',best_e1rm:60+i*0.4,sets:Array.from({length:3},()=>({kg:40,reps:12,rpe:5,done:true}))}))}));
}"""
RESET = "()=>{try{clearInterval(timerIv)}catch(e){};activeSess=null;try{clearActiveStash()}catch(e){};document.querySelectorAll('.overlay.on').forEach(o=>o.classList.remove('on'));}"

def run():
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, timezone_id='Europe/Madrid')
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('https://raw.githubusercontent.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=IMG))
        page.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
        page.goto('file://' + PATH); page.wait_for_timeout(1500)
        page.click('#btn-local'); page.wait_for_timeout(1200)
        page.evaluate(MOCK)
        ev = page.evaluate
        cur = lambda: ev("()=>curScr()")

        # ── IDs únicos ──────────────────────────────────────────────
        dup = ev("()=>{const c={};document.querySelectorAll('[id]').forEach(e=>c[e.id]=(c[e.id]||0)+1);return Object.keys(c).filter(k=>c[k]>1)}")
        check('Q1. Sin IDs duplicados en el DOM', not dup, dup[:8])

        # ── VISTA COMPLETA DEL EJERCICIO ────────────────────────────
        page.wait_for_timeout(1500); ev(MOCK); ev(SEED); page.wait_for_timeout(600)
        ev("()=>{selDate=todayStr();startBlank();activeSess.exercises.push({name:'Press banca',muscle:'Pectoral',notes:'',sets:[{kg:60,reps:10,rpe:8,done:false,type:'warmup'},{kg:80,reps:10,rpe:8,done:false}]});renderSessExs();}")
        page.wait_for_timeout(300)
        page.click('#s-sess .ec .exthumb'); page.wait_for_timeout(400)
        st = ev("""()=>({on:document.getElementById('ov-exview').classList.contains('on'),title:document.getElementById('exv-title').textContent,
           src:document.querySelector('#exv-body .exv-media img')?.getAttribute('src')||'',fit:getComputedStyle(document.querySelector('#exv-body .exv-media img')).objectFit,
           chips:[...document.querySelectorAll('#exv-body .exv-chip')].map(e=>e.textContent),scr:curScr(),body:document.getElementById('exv-body').innerText,
           bib:!!document.querySelector('#exv-body .exv-btns button:nth-child(2)'),w:document.querySelector('#exv-body .exv-media img').getBoundingClientRect().width})""")
        check('X1. Tocar la miniatura en sesión abre la ficha del ejercicio', st['on'] and st['title'] == 'Press banca', st)
        check('X2. GIF animado completo (sin recortar) y a todo el ancho', st['src'].endswith('.gif') and st['fit'] == 'contain' and st['w'] > 300, (st['src'], st['fit'], st['w']))
        check('X3. Muestra la máquina en español + músculo + equipamiento + reps', any('Máquina guiada' in c for c in st['chips']) and any('Pectoral' in c for c in st['chips']) and any('8-12' in c for c in st['chips']), st['chips'])
        check('X4. Técnica: descripción, cómo se hace y claves', all(k in st['body'] for k in ['Press horizontal', 'Espalda apoyada', 'Escápulas atrás']), st['body'][:200])
        check('X5. Historial: series anteriores y mejor e1RM', 'TU HISTORIAL' in st['body'].upper() and '80×10' in st['body'] and 'Mejor e1RM' in st['body'], st['body'][-300:])
        check('X6. No sale del entrenamiento y oculta "Ver en biblioteca"', st['scr'] == 'sess' and not st['bib'], st)
        if SHOTS:
            os.makedirs(SHOT_DIR, exist_ok=True)
            page.wait_for_timeout(300); page.screenshot(path=SHOT_DIR+'/exview.png')
        page.click('#exv-body .exv-zoombtn'); page.wait_for_timeout(200)
        z = ev("()=>{const z=document.getElementById('exv-zoom');const r=z.getBoundingClientRect();return {on:z.classList.contains('on'),w:r.width,h:r.height,src:document.getElementById('exv-zoom-img').getAttribute('src')}}")
        check('X7. "Ampliar" muestra el GIF a pantalla completa', z['on'] and z['w'] >= 389 and z['h'] >= 843 and z['src'].endswith('.gif'), z)
        page.click('#exv-zoom'); page.wait_for_timeout(150)
        check('X8. Tocar la vista ampliada la cierra', not ev("()=>document.getElementById('exv-zoom').classList.contains('on')"))
        ev("()=>closeExView()")
        page.click('#s-sess .ec .ec-name'); page.wait_for_timeout(300)
        check('X9. Tocar el nombre también abre la ficha (ya no navega a Biblioteca)', ev("()=>document.getElementById('ov-exview').classList.contains('on')") and cur() == 'sess', cur())
        # cambiar animación desde la ficha
        page.click('#exv-body .exv-btns button:nth-child(1)'); page.wait_for_timeout(300)
        picker_on = ev("()=>document.getElementById('ov-gifpick').classList.contains('on')")
        top = ev("()=>{const a=[...document.querySelectorAll('.overlay.on')];return a[a.length-1]?.id}")
        ev("()=>setGif('0004')"); page.wait_for_timeout(300)
        chips = ev("()=>[...document.querySelectorAll('#exv-body .exv-chip')].map(e=>e.textContent)")
        check('X10. "Cambiar animación" abre el selector encima y la ficha se actualiza', picker_on and top == 'ov-gifpick' and any('Smith' in c for c in chips), (picker_on, top, chips))
        ev("()=>{setGifTmp=0;db.profile.gifMap['Press banca']='0001';GIF_AUTO={};closeExView();}")
        # ejercicio sin animación
        ev("()=>{db.profile.gifMap['Sin gif']='none';activeSess.exercises.push({name:'Sin gif',muscle:'Bíceps',notes:'',sets:[{kg:null,reps:null,rpe:null,done:false}]});renderSessExs();}")
        page.click('#s-sess #ec_1 .exthumb'); page.wait_for_timeout(300)
        t = ev("()=>({on:document.getElementById('ov-exview').classList.contains('on'),txt:document.getElementById('exv-body').innerText})")
        check('X11. Sin animación: la ficha ofrece "Elegir animación"', t['on'] and 'Elegir animación' in t['txt'], t)
        ev("()=>closeExView()")
        # miniaturas que se cargan tarde siguen siendo pulsables (antes no lo eran)
        ev("()=>{const g=GIF_DB;GIF_DB=null;renderSessExs();GIF_DB=g;GIF_AUTO={};refreshGifThumbs();}")
        page.wait_for_timeout(200)
        page.click('#s-sess #ec_0 img.exthumb'); page.wait_for_timeout(300)
        check('X12. Miniatura cargada tarde sigue abriendo la ficha', ev("()=>document.getElementById('ov-exview').classList.contains('on')"))
        ev("()=>closeExView()")
        ev(RESET); ev("()=>navHome()")
        # fuera de sesión aparece "Ver en biblioteca"
        ev("()=>openExView('Press banca')"); page.wait_for_timeout(200)
        check('X13. Fuera de sesión aparece "Ver en biblioteca"', 'Ver en biblioteca' in ev("()=>document.getElementById('exv-body').innerText"))
        ev("()=>closeExView()")

        # ── ÍNDICE DE HIPERTROFIA ───────────────────────────────────
        ev("()=>{db.sessions=[];db.templates=[];navHome();renderHome();}"); page.wait_for_timeout(300)
        check('H1. Sin datos: la tarjeta pide registrar sesiones', 'al menos 2 sesiones' in page.inner_text('#hi-mini'))
        ev(OPTIMAL)
        R = ev("()=>{const R=computeHyperIndex();return {score:R.score,comp:Object.fromEntries(Object.entries(R.comp).map(([k,v])=>[k,Math.round(v.score)])),recs:R.recs.map(r=>r.t),mus:R.muscles.filter(m=>m.major).map(m=>[m.m,+m.v.toFixed(1),+m.f.toFixed(1)])}}")
        if VERBOSE: print('    óptimo:', R['score'], R['comp'])
        check('H2. Escenario óptimo puntúa ≥ 85', R['score'] is not None and R['score'] >= 85, R)
        ev(POOR)
        P = ev("()=>{const R=computeHyperIndex();return {score:R.score,comp:Object.fromEntries(Object.entries(R.comp).map(([k,v])=>[k,v.score==null?null:Math.round(v.score)])),recs:R.recs.map(r=>r.t).join(' || ')}}")
        if VERBOSE: print('    pobre:', P['score'], P['comp'])
        check('H3. Escenario pobre puntúa < 50', P['score'] is not None and P['score'] < 50, P)
        check('H4. Recomendaciones del escenario pobre: MEV, sesiones recortadas y series lejos del fallo', all(k in P['recs'] for k in ['por debajo de su MEV', 'recortando', 'RIR 1–3', 'apenas estimulan']) and P['recs'].index('apenas estimulan')<P['recs'].index('por debajo de su MEV'), P['recs'][:400])
        cr = ev("()=>[hardCredit({kg:50,reps:10,rpe:8,done:true}),hardCredit({kg:50,reps:10,rpe:6,done:true}),hardCredit({kg:50,reps:10,rpe:5,done:true}),hardCredit({kg:50,reps:10,rpe:8,done:true,type:'warmup'}),hardCredit({kg:20,reps:40,done:true}),hardCredit({kg:50,reps:10,done:true})]")
        check('H5. Serie dura: RPE≥7=1 · RPE6=0,5 · RPE<6=0 · calentamiento=0 · >30 reps=0,5 · sin RPE=1', cr == [1, .5, 0, 0, .5, 1], cr)
        ev("()=>{db.sessions.forEach(s=>s.exercises.forEach(e=>e.sets.forEach(x=>{x.rpe=null;})))}")
        N = ev("()=>{const R=computeHyperIndex();return {score:R.score,int:R.comp.int.score,recs:R.recs.map(r=>r.t).join(' || ')}}")
        check('H6. Sin RPE: el componente se excluye, el índice se sigue calculando y pide registrar el esfuerzo', N['int'] is None and N['score'] is not None and 'Marca las repeticiones en reserva' in N['recs'], N)
        ev(OPTIMAL)
        X = ev("()=>computeHyperIndex().exercises.map(x=>x.st)")
        check('H7. Detecta la progresión del e1RM (tendencia al alza)', X and all(s == 'up' for s in X), X)
        ev("()=>{navHome();renderHome();}"); page.wait_for_timeout(400)
        hc = ev("()=>({ring:!!document.querySelector('#hi-mini svg.hi-ring'),bars:document.querySelectorAll('#hi-mini .hi-bar').length,lab:document.querySelector('#hi-mini .hi-lab')?.textContent,rec:document.querySelector('#hi-mini .hi-rec1')?.textContent||''})")
        check('H8. Tarjeta de portada: anillo, 5 barras, etiqueta y consejo', hc['ring'] and hc['bars'] == 5 and hc['lab'] == 'Óptimo' and hc['rec'], hc)
        if SHOTS:
            ev("()=>document.querySelector('.content').scrollTo(0,99999)"); page.wait_for_timeout(300); page.screenshot(path=SHOT_DIR+'/home_hi.png')
        page.click('#hi-mini'); page.wait_for_timeout(500)
        txt = page.inner_text('#hyper-body')
        check('H9. Tocar la tarjeta abre la pantalla del índice', cur() == 'hyper' and page.inner_text('#hdr-title') == 'Hipertrofia', (cur(), page.inner_text('#hdr-title')))
        check('H10. Pantalla con todas las secciones', all(k.upper() in txt.upper() for k in ['Qué cambiar', 'Componentes', 'Por músculo', 'Progresión', 'Cómo se calcula']), txt[:300])
        rows = ev("()=>({m:document.querySelectorAll('#hyper-body .hi-mrow').length,c:document.querySelectorAll('#hyper-body .hi-comp').length,x:document.querySelectorAll('#hyper-body .hi-xrow').length})")
        check('H11. 8 grupos musculares, 5 componentes y lista de ejercicios', rows['m'] >= 8 and rows['c'] == 5 and rows['x'] >= 5, rows)
        on = ev("()=>['home','stats','perfil'].filter(k=>document.getElementById('bn-'+k).classList.contains('on'))")
        check('H12. Barra inferior visible con "Inicio" activo', on == ['home'] and not ev("()=>document.getElementById('bnav').classList.contains('hide')"), on)
        if SHOTS:
            page.screenshot(path=SHOT_DIR+'/hyper_a.png')
            ev("()=>{document.querySelector('.hi-method').open=true;document.querySelector('.content').scrollTo(0,99999)}"); page.wait_for_timeout(300)
            page.screenshot(path=SHOT_DIR+'/hyper_b.png')
        page.click('#hdr-back'); page.wait_for_timeout(300)
        check('H13. Atrás vuelve a la portada', cur() == 'home')
        ev(POOR); ev("()=>{navTo('hyper')}"); page.wait_for_timeout(300)
        t2 = page.inner_text('#hyper-body')
        check('H14. Pantalla con datos pobres: etiqueta "Insuficiente" y comparación con el mes anterior', 'Insuficiente' in t2 and 'vs 28 días anteriores' in t2, t2[:200])
        if SHOTS: page.screenshot(path=SHOT_DIR+'/hyper_poor.png')
        ev("()=>navHome()")

        # ── CORRECCIONES ────────────────────────────────────────────
        w = ev("""()=>{const t=todayStr();db.sessions=[{id:7000,date:t,name:'W',exercises:[{name:'Press banca',muscle:'Pectoral',notes:'',sets:[{kg:40,reps:10,done:true,type:'warmup'},{kg:80,reps:8,rpe:8,done:true},{kg:80,reps:8,rpe:8,done:true}]}]}];
          const s=weekStats(weekRange(0));return {sets:s.sets,pec:s.by['Pectoral'],ton:s.ton}}""")
        check('F1. Calentamientos fuera del volumen semanal (el tonelaje sí los incluye)', w == {'sets': 2, 'pec': 2, 'ton': 40*10+80*8*2}, w)

        # ── REGRESIÓN: funciones anteriores ─────────────────────────
        ev(SEED); page.wait_for_timeout(500)
        ev("()=>{db.sessions.push({id:111,date:'2026-09-28',name:'T1',rest:120,exercises:[{name:'Press banca',muscle:'Pectoral',notes:'',best_e1rm:100,sets:[{kg:80,reps:10,rpe:8,done:true},{kg:80,reps:9,rpe:9,done:true}]},{name:'Curl bíceps',muscle:'Bíceps',notes:'',best_e1rm:30,sets:[{kg:20,reps:10,rpe:8,done:true},{kg:20,reps:9,rpe:9,done:true}]}]});selDate='2026-09-28';calYear=2026;calMonth=8;showScr('train',null);renderCal();renderDayPanel();}")
        page.wait_for_timeout(300)
        page.click('#day-panel button:has-text("Repetir rutina")'); page.wait_for_timeout(300)
        st = ev("()=>({scr:curScr(),names:activeSess?.exercises.map(e=>e.name),empty:activeSess?.exercises.every(e=>e.sets.every(s=>s.kg===null&&!s.done)),date:activeSess?.date,today:todayStr()})")
        check('R1. Repetir rutina desde el calendario (mismos ejercicios, series vacías, fecha hoy)', st['scr'] == 'sess' and st['names'] == ['Press banca', 'Curl bíceps'] and st['empty'] and st['date'] == st['today'], st)
        ev("()=>{activeSess.exercises.pop();repeatSession(111);}")
        check('R2. Repetir no pisa un entrenamiento en curso', ev("()=>activeSess.exercises.length") == 1)
        ev(RESET)
        ev("()=>{selDate='2026-09-29';startBlank();activeSess.exercises.push({name:'Sentadilla',muscle:'Cuádriceps',notes:'',sets:[{kg:100,reps:5,rpe:8,done:true}]});renderSessExs();}")
        page.fill('#sess-date', '2026-09-30'); ev("()=>document.getElementById('sess-date').dispatchEvent(new Event('change',{bubbles:true}))")
        ev("()=>finishSession()"); page.wait_for_timeout(500)
        check('R3. Cambiar la fecha de la sesión la guarda en ese día', ev("()=>db.sessions.filter(s=>s.name==='Entrenamiento').map(s=>s.date)") == ['2026-09-30'])
        n0 = ev("()=>db.sessions.length")
        ev("()=>editSession(111)"); page.fill('#sess-date', '2026-09-26'); ev("()=>document.getElementById('sess-date').dispatchEvent(new Event('change',{bubbles:true}))")
        ev("()=>finishSession()"); page.wait_for_timeout(500)
        check('R4. Editar mueve la sesión de día sin duplicarla', ev("()=>db.sessions.filter(s=>s.id===111).map(s=>s.date)") == ['2026-09-26'] and ev("()=>db.sessions.length") == n0)
        ev(RESET)
        ev("()=>{selDate=todayStr();startBlank();}")
        page.click('#s-sess .add-ex-btn'); page.fill('#picker-search', 'Press inclinado manc'); page.wait_for_timeout(200)
        page.click('#picker-list button:has-text("Crear este ejercicio")'); page.wait_for_timeout(200)
        page.select_option('#exed-muscle', 'Pectoral'); page.fill('#exed-name', 'Press inclinado mancuernas'); page.click('#exed-save-btn'); page.wait_for_timeout(500)
        st = ev("()=>({exs:activeSess.exercises.map(e=>e.name),picker:document.getElementById('ov-picker').classList.contains('on'),ed:document.getElementById('ov-ex-editor').classList.contains('on')})")
        check('R5. Crear ejercicio desde el selector lo añade en un paso', st['exs'] == ['Press inclinado mancuernas'] and not st['picker'] and not st['ed'], st)
        ev("()=>ctxReplace(0)"); page.click('#ov-picker button:has-text("Crear nuevo ejercicio")')
        page.fill('#exed-name', 'Fondos lastrados'); page.select_option('#exed-muscle', 'Bíceps'); page.click('#exed-save-btn'); page.wait_for_timeout(500)
        check('R6. Crear en "Reemplazar" sustituye al ejercicio', ev("()=>activeSess.exercises.map(e=>e.name)") == ['Fondos lastrados'])
        ev(RESET)
        z = ev("()=>[0,4,12,20,30].map(v=>volZone(v,{mev:8,mav:16,mrv:22}))")
        check('R7. Mapa muscular por zonas: sin entrenar, < MEV, MEV–MAV, MAV–MRV, > MRV', z == [0, 1, 2, 3, 4], z)
        ev(SEED); page.wait_for_timeout(700)
        st = ev("""()=>({name:document.querySelector('.cta-main b').textContent,btns:[...document.querySelectorAll('.cta-row button')].map(b=>b.textContent.trim()),
           titles:[...document.querySelectorAll('#s-home .hcard-head span')].map(e=>e.textContent),kpis:[...document.querySelectorAll('#hc-kpis small')].map(e=>e.textContent)})""")
        check('R8. Portada: Siguiente rutina T2, Repetir/Otra, tarjetas y fichas', st['name'] == 'T2' and st['btns'] == ['Repetir', 'Otra'] and st['titles'] == ['Calendario semanal', 'Volumen muscular', 'Índice de hipertrofia'] and st['kpis'] == ['sesiones', 'series', 'kg movidos', 'tiempo'], st)
        page.click('#bn-stats'); page.wait_for_timeout(800)
        st = ev("()=>({t:document.querySelector('.px-title').textContent,d:document.getElementById('px-delta').textContent,best:document.querySelector('.px-tile.best b').textContent,n:pChart?.data.datasets[0].data.length,mus:document.querySelectorAll('.px-mrow').length,act:document.getElementById('px-act').innerText})")
        check('R9. Pantalla Progreso: gráfica, mejor 1RM, progresión y músculo activado', st['t'] == 'Progreso de Fuerza' and st['d'] == ': +4.2kg' and st['best'] == '26.2' and st['n'] == 7 and st['mus'] >= 1 and 'Pasos hoy' in st['act'], st)
        page.click('#px-act'); page.wait_for_timeout(300); a1 = cur()
        page.click('#hdr-back'); page.wait_for_timeout(300); page.click('#px-comp'); page.wait_for_timeout(300); a2 = cur()
        check('R10. Tarjetas Actividad y Cuerpo abren sus pantallas', a1 == 'activity' and a2 == 'profile', (a1, a2))
        page.click('#bn-perfil'); page.wait_for_timeout(300); p1 = cur()
        page.click('#bn-home'); page.wait_for_timeout(300); p2 = cur()
        page.click('.cta-card .cta-main'); page.wait_for_timeout(400)
        hidden = ev("()=>document.getElementById('bnav').classList.contains('hide')")
        check('R11. Barra inferior: Perfil/Inicio y se oculta en sesión', p1 == 'perfil' and p2 == 'home' and cur() == 'sess' and hidden, (p1, p2, cur(), hidden))
        ev(RESET); ev("()=>navHome()"); page.wait_for_timeout(300)
        r = ev("()=>{document.querySelector('.content').scrollTo(0,99999);const c=[...document.querySelectorAll('#s-home .hcard')].pop().getBoundingClientRect(),n=document.getElementById('bnav').getBoundingClientRect();return{cb:c.bottom,nt:n.top}}")
        check('R12. La última tarjeta de la portada queda por encima de la barra', r['cb'] <= r['nt'] + 1, r)
        ev("()=>{db.templates=[{id:'t1',name:'Rutina A',rest:90,exercises:[{name:'Press banca',muscle:'Pectoral',sets:3}]}];selDate='2026-10-02';showScr('train',null);renderDayPanel();startFromTmpl('t1');}")
        st = ev("()=>({n:activeSess.exercises.length,d:activeSess.date,i:document.getElementById('sess-date').value})")
        check('R13. Iniciar desde rutina usa el día seleccionado', st == {'n': 1, 'd': '2026-10-02', 'i': '2026-10-02'}, st)
        ev(RESET)
        for scr in ['home', 'vol', 'perfil', 'train', 'stats', 'profile', 'activity', 'hyper']:
            ev(f"()=>showScr('{scr}',null)"); page.wait_for_timeout(150)
        check('Z1. Sin errores de JavaScript en toda la prueba', not errors, errors[:5])
        b.close()

    # ── Zona horaria: a las 00:30 en Madrid el día es el nuevo (antes salía el anterior) ──
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(timezone_id='Europe/Madrid'); page = ctx.new_page()
        ctx.add_init_script("""(()=>{const F=Date.UTC(2026,9,19,22,30);const R=Date;class D extends R{constructor(...a){super(...(a.length?a:[F]));}static now(){return F;}};window.Date=D;})()""")
        page.route('**/*.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
        page.goto('file://' + PATH); page.wait_for_timeout(1200); page.click('#btn-local'); page.wait_for_timeout(800)
        st = page.evaluate("()=>{initCal();const a=selDate;selDate=null;startBlank();const d=activeSess.date;return {cal:a,sess:d,today:todayStr()}}")
        check('F2. Sesión iniciada a las 00:30 se fecha el día correcto (bug UTC corregido)', st == {'cal': '2026-10-20', 'sess': '2026-10-20', 'today': '2026-10-20'}, st)
        b.close()

    ok = sum(1 for _, c in res if c)
    print(f'\n{ok}/{len(res)} OK')
    return ok == len(res)

sys.exit(0 if run() else 1)
