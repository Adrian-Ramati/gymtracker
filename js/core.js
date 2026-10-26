/* core.js — Lógica pura compartida por la app (navegador) y el informe semanal (Node).
 * No toca el DOM ni el estado global: todo entra por parámetros.
 * Navegador: define window.PPCore. Node: `import PPCore from '../js/core.js'`.
 */
(function (root) {
  'use strict';
  const C = {};

  // ── Utilidades ─────────────────────────────────────────────────────
  C.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
  C.normExName = fold;
  C.f1 = v => String(Math.round(v * 10) / 10);

  // ── Ejercicios renombrados (corrección de erratas en la tabla exercises, oct-2026) ──
  // El historial, las rutinas y los ajustes guardan el nombre antiguo: se traducen al cargar
  // para que todo siga enlazado (progreso, GIF elegido, músculos secundarios…).
  C.EX_RENAMES = {
    'Dumbell Twist Press': 'Dumbbell Twist Press',
    'Incline Bench Dumbell Row': 'Incline Bench Dumbbell Row',
    'Elevaciones Laterales y en Polea': 'Elevaciones Laterales en Y en Polea',
    'Evaciones Laterales en Polea Baja Estilo Egipcio': 'Elevaciones Laterales en Polea Baja Estilo Egipcio',
    'Rompecraneos - Skullcrusher con Barra': 'Rompecráneos - Skullcrusher con Barra',
    'Jm Press': 'JM Press',
    'Extensiones desde Polea Alta Alta con Barra V3': 'Extensiones desde Polea Alta con Barra V3',
    'Extensión Unilateral/ Patada en Polea Alta': 'Extensión Unilateral / Patada en Polea Alta',
    'Patada de Triceps desde Polea Baja': 'Patada de Tríceps desde Polea Baja',
    'Patada de Triceps desde Polea Alta Tumbado': 'Patada de Tríceps desde Polea Alta Tumbado',
    'Extension de Muñeca con Barra en Banco': 'Extensión de Muñeca con Barra en Banco',
    'Ab-roll Out/ab-wheel': 'Ab Roll Out / Ab Wheel',
    'Peso Muerto Rumano - Rdl': 'Peso Muerto Rumano - RDL',
    'Copenaghen Adductions': 'Copenhagen Adductions',
    'Leg Extensions (Maquina con Discos)': 'Leg Extensions (Máquina con Discos)',
  };
  const RENAME_F = Object.fromEntries(Object.entries(C.EX_RENAMES).map(([o, n]) => [fold(o), n]));
  C.canonExName = n => (typeof n === 'string' && RENAME_F[fold(n)]) || n;
  // Nombre actual + antiguos (para buscar en la tabla exercises antes y después de aplicar el SQL)
  C.exNameAliases = n => [n, ...Object.keys(C.EX_RENAMES).filter(o => C.EX_RENAMES[o] === n)];
  // Traduce en sitio los nombres de una lista de sesiones/rutinas. Devuelve cuántos cambió.
  C.canonExList = list => {
    let ch = 0;
    (list || []).forEach(s => (s?.exercises || []).forEach(e => {
      const c = C.canonExName(e?.name);
      if (e && c !== e.name) { e.name = c; ch++; }
    }));
    return ch;
  };
  // Traduce las claves de un mapa por nombre (gifMap: nombre exacto; secMap: nombre normalizado).
  // Si ya existe la clave nueva, se respeta la nueva.
  C.canonExKeys = (map, norm) => {
    if (!map || typeof map !== 'object') return map;
    const out = {};
    Object.keys(map).forEach(k => {
      const c = C.canonExName(k), nk = norm ? fold(c) : c;
      if (nk !== k && nk in map) return; // ya hay un ajuste con el nombre nuevo: manda ese
      out[nk] = map[k];
    });
    return out;
  };

  // Fechas como 'YYYY-MM-DD' (sin zonas horarias: se opera en UTC sobre la fecha local ya formateada)
  const p = ds => { const [y, m, d] = ds.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const fmt = t => new Date(t).toISOString().slice(0, 10);
  C.isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  C.addDays = (ds, n) => fmt(p(ds) + n * 864e5);
  C.daysBetween = (a, b) => Math.round((p(b) - p(a)) / 864e5);
  C.mondayOf = ds => { const t = p(ds), dow = (new Date(t).getUTCDay() + 6) % 7; return fmt(t - dow * 864e5); };

  // ── Músculos: nombre canónico (une 'Deltoides Anterior'/'deltoides anterior', 'Isquiotibiales'/'Isquiosurales'…) ──
  C.MUSCLES = ['Pectoral', 'Espalda', 'Deltoides anterior', 'Deltoides lateral', 'Deltoides posterior', 'Bíceps', 'Tríceps',
    'Antebrazo', 'Trapecio', 'Abdomen', 'Lumbar', 'Cuádriceps', 'Isquiosurales', 'Glúteos', 'Aductores', 'Abductores', 'Gemelos', 'Sóleo'];
  const CANON = Object.fromEntries(C.MUSCLES.map(m => [fold(m), m]));
  C.normMuscle = m => {
    if (!m) return m;
    const f = fold(m);
    if (/^isquio/.test(f)) return 'Isquiosurales';
    if (/hombro posterior|deltoides? posterior/.test(f)) return 'Deltoides posterior';
    return CANON[f] || m;
  };

  // ── e1RM — tabla RTS/Tuchscherer por repeticiones efectivas (reps + RIR) ──
  C.RTS_PCT = { 1: 100, 1.5: 97.8, 2: 95.5, 2.5: 93.9, 3: 92.2, 3.5: 90.7, 4: 89.2, 4.5: 87.8, 5: 86.3, 5.5: 85, 6: 83.7, 6.5: 82.4, 7: 81.1, 7.5: 79.9, 8: 78.6, 8.5: 77.4, 9: 76.2, 9.5: 75.1, 10: 73.9, 10.5: 72.3, 11: 70.7, 11.5: 69.4, 12: 68, 12.5: 66.7, 13: 65.3, 13.5: 64, 14: 62.6 };
  // Sin RPE → esfuerzo máximo (RIR 0). RPE limitado a la banda validada 6–10.
  C.effReps = (reps, rpe) => reps + (10 - ((rpe != null && rpe > 0) ? Math.min(10, Math.max(6, rpe)) : 10));
  C.calcE1RM = (kg, reps, rpe) => {
    if (!kg || !reps) return null;
    const er = Math.round(C.effReps(reps, rpe) * 2) / 2;
    if (er > 14) return null; // >14 reps efectivas: sin respaldo empírico → sin e1RM
    const pct = C.RTS_PCT[Math.max(1, er)];
    return pct ? Math.round(kg / (pct / 100) * 10) / 10 : null;
  };

  // ── Landmarks de volumen (MEV/MAV/MRV, series/semana) ──
  C.DEFAULT_LANDMARKS = {
    'Pectoral': { mev: 8, mav: 16, mrv: 22 }, 'Espalda': { mev: 10, mav: 18, mrv: 25 }, 'Tríceps': { mev: 6, mav: 12, mrv: 18 },
    'Bíceps': { mev: 8, mav: 14, mrv: 20 }, 'Glúteos': { mev: 4, mav: 12, mrv: 16 }, 'Isquiosurales': { mev: 6, mav: 12, mrv: 16 },
    'Cuádriceps': { mev: 8, mav: 14, mrv: 20 }, 'Gemelos': { mev: 8, mav: 14, mrv: 20 }, 'Sóleo': { mev: 6, mav: 10, mrv: 16 },
    'Deltoides anterior': { mev: 2, mav: 8, mrv: 12 }, 'Deltoides lateral': { mev: 8, mav: 18, mrv: 26 },
    'Deltoides posterior': { mev: 6, mav: 14, mrv: 22 }, 'Hombro posterior': { mev: 6, mav: 14, mrv: 22 },
    'Aductores': { mev: 4, mav: 8, mrv: 12 }, 'Abductores': { mev: 4, mav: 8, mrv: 12 },
  };
  const lmKey = m => { const c = C.normMuscle(m); if (C.DEFAULT_LANDMARKS[c]) return c; return /gemelo|soleo/.test(fold(m)) ? 'Gemelos' : c; };
  C.landmarks = (profile, m) => {
    const ov = profile?.landmarks || {}, k = lmKey(m);
    const lm = { ...(C.DEFAULT_LANDMARKS[k] || {}), ...(ov[k] || {}), ...(ov[m] || {}) };
    return (lm.mev != null && lm.mav != null && lm.mrv != null && lm.mev <= lm.mav && lm.mav <= lm.mrv) ? lm : null;
  };
  // Escala común de las barras de volumen: MEV, MAV y MRV caen SIEMPRE en la misma posición (%) de la barra,
  // sea cual sea el músculo o sus valores; entre marcas la escala es lineal. Así las marcas se alinean entre filas.
  C.VOL_POS = { mev: 25, mav: 55, mrv: 85 };
  C.volPos = (v, lm) => {
    const { mev, mav, mrv } = lm && lm.mev != null && lm.mav != null && lm.mrv != null ? lm : { mev: 6, mav: 14, mrv: 20 };
    const P = C.VOL_POS, end = mrv + Math.max(2, (mrv - mav) * 0.5);
    const k = [[0, 0], [mev, P.mev], [mav, P.mav], [mrv, P.mrv], [end, 100]].filter((p, i, a) => i === 0 || p[0] > a[i - 1][0]);
    if (!(v > 0)) return 0;
    for (let i = 1; i < k.length; i++) if (v <= k[i][0]) return k[i - 1][1] + (v - k[i - 1][0]) / (k[i][0] - k[i - 1][0]) * (k[i][1] - k[i - 1][1]);
    return 100;
  };
  // Reparto por patrón de movimiento (empuje / tirón / piernas / core) a partir del nombre del músculo.
  C.MOVE_GROUPS = ['Empuje', 'Tirón', 'Piernas', 'Core'];
  C.muscleGroup = m => {
    const f = fold(m);
    if (/cuadriceps|isquio|femoral|gluteo|gemelo|soleo|aductor|abductor|pierna/.test(f)) return 'Piernas';
    if (/posterior|espalda|dorsal|trapecio|romboid|biceps|antebrazo/.test(f)) return 'Tirón';
    if (/pectoral|pecho|triceps|deltoid|hombro/.test(f)) return 'Empuje';
    if (/abdom|core|oblicuo|lumbar/.test(f)) return 'Core';
    return 'Otros';
  };
  // by: {músculo: series efectivas} → {total, grupos: [{g, v, muscles: [[m, v]]}]} (solo grupos con series), y cociente tirón/empuje.
  C.groupSets = by => {
    const G = {};
    Object.entries(by || {}).forEach(([m, v]) => { const g = C.muscleGroup(m); (G[g] = G[g] || { g, v: 0, muscles: [] }); G[g].v += v; G[g].muscles.push([m, v]); });
    const order = [...C.MOVE_GROUPS, 'Otros'];
    const grupos = order.filter(g => G[g]).map(g => { G[g].muscles.sort((a, b) => b[1] - a[1]); return G[g]; });
    const total = grupos.reduce((a, x) => a + x.v, 0), push = G['Empuje']?.v || 0, pull = G['Tirón']?.v || 0;
    return { total, grupos, pullPush: push > 0 ? pull / push : null };
  };

  // ── Músculos secundarios ──
  // Una serie cuenta 1 para el músculo principal y 0,5 para cada secundario: el método "fraccional",
  // el mejor respaldado en Pelland et al. (Sports Medicine, 2026) para predecir hipertrofia.
  C.SEC_W = 0.5;
  // [músculo principal, patrón en el nombre, secundarios]. Gana la primera regla que encaje.
  const SEC_RULES = [
    ['Pectoral', /apertura|cruce|crossover|pec ?deck|contractora|\bfly|pull ?over/, []],
    ['Pectoral', /press|bench|chest|fondo|\bdip|flexion|push ?up|convergente/, ['Tríceps', 'Deltoides anterior']],
    ['Espalda', /pull ?over|encogimiento|shrug|hiperextension|hyperextension/, []],
    ['Espalda', /remo|\brow\b|t-bar|seal/, ['Bíceps', 'Deltoides posterior']],
    ['Espalda', /jalon|pulldown|dominad|pull ?up|\bchin|traccion/, ['Bíceps']],
    ['Espalda', /peso muerto|deadlift|rack pull/, ['Glúteos', 'Isquiosurales']],
    ['Deltoides anterior', /press|militar|overhead|arnold|landmine/, ['Tríceps', 'Deltoides lateral']],
    ['Deltoides lateral', /press|militar|overhead/, ['Tríceps', 'Deltoides anterior']],
    ['Tríceps', /frances|french|skull|rompecraneo|extension|patada|kickback|overhead|copa|katana|polea/, []],
    ['Tríceps', /press|cerrado|close|fondo|\bdip|\bjm\b|kaz/, ['Pectoral', 'Deltoides anterior']],
    ['Bíceps', /martillo|hammer|inverso|reverse/, ['Antebrazo']],
    ['Cuádriceps', /extension|sissy/, []],
    ['Cuádriceps', /sentadilla|squat|prensa|leg press|press de pierna|zancada|lunge|bulgar|split|hack|step|pendul|belt/, ['Glúteos', 'Aductores']],
    ['Isquiosurales', /peso muerto|rumano|\brdl\b|sldl|rigidas|buenos dias|good ?morning|deadlift|hiperextension|hyperextension/, ['Glúteos']],
    ['Glúteos', /sentadilla|squat|zancada|lunge|bulgar|split|step|prensa/, ['Cuádriceps']],
    ['Glúteos', /peso muerto|rumano|\brdl\b|good ?morning|hiperextension|hyperextension/, ['Isquiosurales']],
  ];
  C.autoSecondary = (name, muscle) => {
    const m = C.normMuscle(muscle), n = fold(name);
    for (const [pm, re, sec] of SEC_RULES) if (pm === m && re.test(n)) return sec.slice();
    return [];
  };
  C.secondaryFor = (profile, name, muscle) => {
    const ov = profile?.secMap?.[fold(name)];
    const prim = C.normMuscle(muscle);
    return (Array.isArray(ov) ? ov : C.autoSecondary(name, muscle)).map(C.normMuscle).filter(m => m && m !== prim);
  };
  // Reparto de una serie del ejercicio: [{m, w}] (principal w=1, secundarios w=0,5)
  C.credits = (profile, ex) => {
    const prim = C.normMuscle(ex.muscle);
    // ex.sec explícito (catálogo exercise_muscles) manda sobre las reglas
    const sec = Array.isArray(ex.sec) ? ex.sec.map(C.normMuscle).filter(m => m && m !== prim) : C.secondaryFor(profile, ex.name, ex.muscle);
    return [{ m: prim, w: 1 }, ...sec.map(m => ({ m, w: C.SEC_W }))];
  };

  // Revisión de secundarios en un rango de fechas: por ejercicio, de dónde salen (catálogo / personalizado / automático / ninguno)
  // y cuántas series efectivas aportan. «revisar» = ejercicio multiarticular de un músculo grande sin secundarios (en aislamiento y músculos pequeños es lo normal).
  const NO_SEC_OK_M = new Set(['Bíceps', 'Tríceps', 'Antebrazo', 'Deltoides lateral', 'Deltoides posterior', 'Gemelos', 'Sóleo', 'Aductores', 'Abductores', 'Abdomen', 'Lumbar', 'Trapecio']);
  C.secAudit = (profile, sessions, from, to) => {
    const R = {}, ses = (sessions || []).filter(s => s.date >= from && s.date <= to), flagged = new Set();
    let seriesTotal = 0, seriesCon = 0, extra = 0, nSes = 0;
    ses.forEach(s => {
      let any = false;
      (s.exercises || []).forEach(e => {
        const n = (e.sets || []).filter(C.isWorkSet).length; if (!n) return;
        any = true;
        const sec = C.credits(profile, e).slice(1).map(c => c.m), k = fold(e.name);
        const src = Array.isArray(e.sec) ? 'catálogo' : Array.isArray(profile?.secMap?.[k]) ? 'personalizado' : sec.length ? 'automático' : 'ninguno';
        const kind = C.exKind(e), revisar = !sec.length && kind !== 'isolation' && !NO_SEC_OK_M.has(C.normMuscle(e.muscle)) && !/hip[ -]?thrust|puente de gluteo/.test(k);
        const r = R[k] = R[k] || { name: e.name, muscle: C.normMuscle(e.muscle), sets: 0, sesiones: 0, sec, src, kind, revisar };
        r.sets += n; r.sesiones++; seriesTotal += n; if (sec.length) { seriesCon += n; extra += n * C.SEC_W * sec.length; }
        if (revisar) flagged.add(s.id != null ? s.id : s.date);
      });
      if (any) nSes++;
    });
    const rows = Object.values(R).sort((a, b) => (b.revisar - a.revisar) || (b.sets - a.sets));
    const revisar = rows.filter(r => r.revisar);
    return { rows, ejercicios: rows.length, conSec: rows.filter(r => r.sec.length).length, revisar: revisar.length,
      seriesRevisar: revisar.reduce((a, r) => a + r.sets, 0), seriesTotal, seriesCon, extra, sesiones: nSes, sesionesRevisar: flagged.size };
  };

  // ── Series ──
  C.isWorkSet = s => !!s && !!(s.done || s.kg) && (s.type || 'normal') !== 'warmup';
  C.hasRpe = s => s.rpe != null && s.rpe !== '' && !isNaN(+s.rpe);
  // Crédito de "serie dura": 1 si RPE ≥7 (o sin RPE), 0,5 si RPE 6–6,5, 0 si RPE <6; >30 reps cuenta la mitad
  C.hardCredit = s => {
    if (!C.isWorkSet(s)) return 0;
    let c = 1;
    if (C.hasRpe(s)) { const r = +s.rpe; c = r >= 7 ? 1 : r >= 6 ? .5 : 0; }
    if (s.reps > 30) c *= .5;
    return c;
  };

  // ── Mesociclos ──
  // profile.mesoLog: [{from, start, weeks, deload, progress, on}] — cada cambio de configuración añade
  // una entrada, así las semanas pasadas conservan la clasificación (acumulación/descarga) que tenían.
  C.MESO_RIR = { 1: [3], 2: [3, 1], 3: [3, 2, 1], 4: [3, 2, 1, 0], 5: [3, 2, 2, 1, 0], 6: [3, 3, 2, 2, 1, 0] };
  C.mesoCfgAt = (profile, ds) => {
    const log = (profile?.mesoLog || []).filter(e => e && e.from && e.from <= ds);
    const e = log.length ? log.reduce((a, b) => (b.from >= a.from ? b : a)) : null;
    return e && e.on !== false && e.start && e.weeks ? e : null;
  };
  C.mesoWeekAt = (profile, ds) => C.mesoWeekFromCfg(C.mesoCfgAt(profile, ds), ds);
  // Semana de `ds` según una configuración concreta (sirve para dibujar el ciclo entero)
  C.mesoWeekFromCfg = (cfg, ds) => {
    if (!cfg) return null;
    const w = Math.floor(C.daysBetween(C.mondayOf(cfg.start), C.mondayOf(ds)) / 7);
    if (w < 0) return null;
    const weeks = Math.max(2, Math.min(8, +cfg.weeks)), idx = w % weeks + 1, dl = cfg.deload !== false;
    const acc = weeks - (dl ? 1 : 0), deload = dl && idx === weeks;
    const sched = C.MESO_RIR[acc] || [...Array(acc)].map((_, i) => Math.max(0, 3 - Math.round(3 * i / Math.max(1, acc - 1))));
    const rir = deload ? 4 : sched[Math.min(idx, acc) - 1];
    return { idx, weeks, acc, cycle: Math.floor(w / weeks) + 1, deload, rir, rpe: 10 - rir, progress: cfg.progress !== false, monday: C.mondayOf(ds) };
  };
  C.isDeloadDate = (profile, ds) => !!C.mesoWeekAt(profile, ds)?.deload;
  // Series objetivo de cada ejercicio de una rutina para la semana de `ds`:
  // descarga → mitad; acumulación → +1 serie/semana en el 1.er ejercicio de cada músculo,
  // con tope en el MRV semanal (suponiendo que cada rutina se hace una vez por semana).
  C.mesoSets = (profile, templates, t, ds) => {
    const base = (t.exercises || []).map(e => Math.max(1, +e.sets || 3));
    const wk = C.mesoWeekAt(profile, ds);
    if (!wk) return base;
    if (wk.deload) return base.map(b => Math.max(1, Math.ceil(b / 2)));
    const extra = wk.progress ? wk.idx - 1 : 0;
    if (!extra) return base;
    const bw = {}, nt = {};
    (templates || []).forEach(tp => {
      const seen = new Set();
      (tp.exercises || []).forEach(e => { const m = C.normMuscle(e.muscle); bw[m] = (bw[m] || 0) + Math.max(1, +e.sets || 3); seen.add(m); });
      seen.forEach(m => { nt[m] = (nt[m] || 0) + 1; });
    });
    const done = new Set();
    return (t.exercises || []).map((e, i) => {
      const m = C.normMuscle(e.muscle);
      if (done.has(m)) return base[i];
      done.add(m);
      const lm = C.landmarks(profile, m);
      const cap = lm ? Math.max(0, Math.floor((lm.mrv - (bw[m] || 0)) / Math.max(1, nt[m] || 1))) : extra;
      return base[i] + Math.min(extra, cap);
    });
  };

  // ── Tipo de ejercicio y descansos ──
  // compound_heavy (multiarticular pesado) · compound (multiarticular) · isolation (aislamiento).
  // Se deduce del nombre; el ejercicio puede traerlo explícito (ex.kind).
  C.KINDS = ['compound_heavy', 'compound', 'isolation'];
  const ISO_RE = /curl|extension|elevacion|apertura|cruce|crossover|pec ?deck|contractora|\bfly|patada|kickback|pajaro|face ?pull|reverse (fly|cable)|pull ?over|gemelo|calf|soleo|crunch|encogimiento|shrug|aduc|abduc|wrist|muneca|sissy|frances|french|skull|rompecraneo|copa|katana|lateral|y-raise|hang & swing|leg raise|elevaciones de piernas|rueda|ab roll|wood ?chop|pallof|plancha|plank/;
  const HEAVY_RE = /sentadilla|squat|peso muerto|deadlift|rumano|\brdl\b|press banca|bench press|press militar|overhead press|hack|prensa|leg press|hip ?thrust|dominada|pull ?up|chin ?up|pendlay|remo con barra|rack pull|zancada|lunge|bulgar|good ?morning|buenos dias|belt squat/;
  C.exKind = ex => {
    if (ex && C.KINDS.includes(ex.kind)) return ex.kind;
    const n = fold(ex?.name);
    if (/gemelo|calf|soleo/.test(n)) return 'isolation';
    if (/hip ?thrust/.test(n)) return 'compound_heavy';
    if (/press|remo|\brow\b|jalon|pulldown|dominad|fondo|\bdip|hip ?thrust|sentadilla|prensa|peso muerto|zancada/.test(n) && !/frances|french|katana|copa/.test(n) && !/extension|curl/.test(n.split(/\s+/)[0] || ''))
      return HEAVY_RE.test(n) ? 'compound_heavy' : 'compound';
    if (ISO_RE.test(n)) return 'isolation';
    return HEAVY_RE.test(n) ? 'compound_heavy' : 'compound';
  };
  // Descanso objetivo [mín, máx] en segundos (densidad del estímulo)
  C.REST_TARGET = { compound_heavy: [120, 240], compound: [90, 180], isolation: [60, 150] };
  // Temporizador: el descanso de la rutina es el de los multiarticulares; pesados +60 s, aislamientos −30 s (mín. 60)
  C.restFor = (kind, base) => { const b = +base || 90; return kind === 'compound_heavy' ? b + 60 : kind === 'isolation' ? Math.max(60, b - 30) : b; };
  C.density = (r, lo, hi) => r < lo ? Math.max(0, Math.min(1, 1 - 1.5 * (lo - r) / lo)) : r <= hi ? 1 : Math.max(0.6, 1 - 0.4 * (r - hi) / (2 * hi));
  // Esfuerzo real de una serie en RIR (null si no hay o si es copiado/inferido: no se inventa)
  // RPE válido: entre 1 y 10 (un 14 tecleado por error no cuenta como esfuerzo)
  C.validRpe = v => v != null && v !== '' && isFinite(+v) && +v >= 1 && +v <= 10;
  C.setRir = st => (st && C.validRpe(st.rpe) && st.effortSrc !== 'copied' && st.effortSrc !== 'inferred') ? 10 - +st.rpe : null;
  // Estímulo y coste de fatiga por serie según RIR (umbrales, igual que la referencia Python y la función SQL stim_rir)
  C.stim = rir => rir == null ? 0 : rir <= 1 ? 1 : rir <= 2 ? .95 : rir <= 3 ? .85 : rir <= 4 ? .6 : rir <= 5 ? .35 : 0;
  C.fatCost = rir => rir <= 0 ? 1.4 : rir <= 1 ? 1.15 : rir <= 2 ? 1.05 : 1;

  // ── Readiness diaria (0–1, 0,7 = normal) ──
  // biometrics: [{date, hrv (RMSSD ms), rhr (lpm), sleepMin, subj:{sleep, soreness, energy} (1–5)}]
  // Medias de 3 días frente a la línea base de los 60 días anteriores a `start`. Día sin datos → null.
  C.SLEEP_NEED_H = 7.5;
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const pstdev = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
  // Check-in subjetivo → 0–1 (se muestra 0–100). Un día normal (todo 😐, 7–8 h de sueño) da 0,70, igual que un
  // día normal del reloj; lo mejor posible da 1 y lo peor 0. v2: sueño en horas 35 % · energía 35 % · motivación 30 %
  // (el cansancio por músculo no entra en la nota: ajusta solo los ejercicios de ese músculo, ver muscleAdjust).
  // v1 (check-ins antiguos): sueño 1–5, agujetas 1–5, energía 1–5 a partes iguales.
  C.SLEEP_OPTS = ['< 6 h', '6–7 h', '7–8 h', '8 h o más'];
  const SLEEP_ITEM = [0, .25, .5, 1];
  C.sleepBucket = min => !(min > 0) ? null : min < 360 ? 1 : min < 420 ? 2 : min < 480 ? 3 : 4;
  const subjCurve = m => m <= .5 ? 1.4 * m : .7 + .6 * (m - .5);
  C.subjReadiness = q => {
    if (!q) return null;
    const it = (v, f) => v != null && v !== '' && isFinite(v) ? f(+v) : null;
    const parts = (q.v === 2
      ? [[.35, it(q.sleepH, x => SLEEP_ITEM[x - 1])], [.35, it(q.energy, x => (x - 1) / 4)], [.30, it(q.motivation, x => (x - 1) / 4)]]
      : [[1, it(q.sleep, x => (x - 1) / 4)], [1, it(q.soreness, x => (5 - x) / 4)], [1, it(q.energy, x => (x - 1) / 4)]])
      .filter(([, v]) => v != null && isFinite(v));
    if (!parts.length) return null;
    return subjCurve(clip01(parts.reduce((a, [w, v]) => a + w * v, 0) / parts.reduce((a, [w]) => a + w, 0)));
  };
  // Estado por músculo del check-in: solo cambia los ejercicios cuyo músculo PRINCIPAL está marcado
  C.MUSCLE_ST = {
    fatigue: { t: 'cansado', adj: 'Cansancio: mismas series, deja 1 repetición más en reserva' },
    doms: { t: 'agujetas', adj: 'Agujetas: una serie menos y sin ir al fallo' },
    pain: { t: 'dolor', adj: 'Dolor: cámbialo por otro que no moleste o sáltalo' },
  };
  C.MUSCLE_ST_CYCLE = [null, 'fatigue', 'doms', 'pain'];
  C.muscleAdjust = (exs, muscles) => {
    const out = [];
    if (!muscles) return out;
    (exs || []).forEach(ex => {
      const m = C.normMuscle(ex.muscle), st = muscles[m];
      if (!C.MUSCLE_ST[st]) return;
      const from = (ex.sets || []).length;
      if (st === 'doms' && from > 1) ex.sets = ex.sets.slice(0, from - 1);
      ex.adj = { st, txt: C.MUSCLE_ST[st].adj };
      out.push({ m, st, name: ex.name, from, to: ex.sets.length });
    });
    return out;
  };
  C.readinessSeries = (biometrics, start, end) => {
    const by = {};
    (biometrics || []).forEach(b => { if (b && b.date) by[b.date] = b; });
    const base = Object.values(by).filter(b => { const d = C.daysBetween(b.date, start); return d >= 1 && d <= 60; });
    const st = vals => { vals = vals.filter(v => v != null && isFinite(v)); return vals.length >= 14 ? [mean(vals), pstdev(vals) || 1e-6] : [null, null]; };
    const lnH = b => b.hrv > 0 ? Math.log(b.hrv) : null;
    const [hMu, hSd] = st(base.map(lnH)), [rMu] = st(base.map(b => b.rhr > 0 ? +b.rhr : null));
    const out = {};
    for (let k = 0, n = C.daysBetween(start, end); k <= n; k++) {
      const day = C.addDays(start, k), win = [-2, -1, 0].map(i => by[C.addDays(day, i)]).filter(Boolean);
      const roll = f => { const v = win.map(f).filter(x => x != null && isFinite(x)); return v.length >= 2 ? mean(v) : null; };
      const h = roll(lnH), r = roll(b => b.rhr > 0 ? +b.rhr : null), s = roll(b => b.sleepMin > 0 ? b.sleepMin / 60 : null);
      const parts = [];
      if (h != null && hMu != null) parts.push([.5, clip01(0.7 + 0.3 * (h - hMu) / hSd)]);
      if (r != null && rMu != null) parts.push([.2, clip01(0.7 - 0.1 * (r - rMu))]);
      if (s != null) parts.push([.3, clip01((s - 5) / (C.SLEEP_NEED_H - 5))]);
      const wear = parts.length ? parts.reduce((a, [w, v]) => a + w * v, 0) / parts.reduce((a, [w]) => a + w, 0) : null;
      const subj = C.subjReadiness(by[day]?.subj);
      out[day] = wear != null && subj != null ? 0.7 * wear + 0.3 * subj : wear ?? subj;
    }
    return out;
  };
  // Carga recomendada del día (fracción de las series planificadas) según la readiness
  C.targetLoad = r => r >= 0.6 ? 1 : r >= 0.4 ? 0.8 : 0.6;
  C.readinessAdvice = r => r == null ? null : r >= 0.6 ? { key: 'full', t: 'Sesión completa', f: 1 } : r >= 0.4 ? { key: 'reduce_20', t: 'Quita un 20 % de las series', f: 0.8 } : { key: 'reduce_40', t: 'Quita un 40 % de las series y no vayas al fallo', f: 0.6 };
  function clip01(x) { return Math.max(0, Math.min(1, x)); }

  // ── Modelo de datos v2 (una fila por serie) ──
  // UUID v7: 48 bits de milisegundos + aleatorio → único entre dispositivos y ordenable por tiempo
  C.uuid7 = (ms = Date.now()) => {
    const r = new Uint8Array(10);
    const g = typeof globalThis !== 'undefined' && globalThis.crypto;
    if (g && g.getRandomValues) g.getRandomValues(r); else for (let i = 0; i < 10; i++) r[i] = Math.floor(Math.random() * 256);
    const h = ms.toString(16).padStart(12, '0').slice(-12), x = [...r].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-7${x.slice(0, 3)}-${(8 + (r[2] & 3)).toString(16)}${x.slice(5, 8)}-${x.slice(8, 20)}`;
  };
  C.isUuid = v => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
  // Ids estables para la escritura en v2: sesión (meta.uid), ejercicio (eid) y serie (sid). Muta `sess`.
  C.ensureV2Ids = sess => {
    if (!C.isUuid(sess.uid)) sess.uid = C.uuid7();
    (sess.exercises || []).forEach(e => { if (!C.isUuid(e.eid)) e.eid = C.uuid7(); (e.sets || []).forEach(st => { if (!C.isUuid(st.sid)) st.sid = C.uuid7(); }); });
    return sess;
  };
  // Tipos de serie de la app → v2. Drop set y rest-pause cuelgan de la serie anterior del mismo ejercicio.
  const V2_TYPE = { warmup: 'warmup', dropset: 'drop', restpause: 'rest_pause' };
  // Sesión de la app → filas de workout_sessions / exercise_entries / set_entries
  C.toV2Rows = (sess, userId, exIdOf = () => null) => {
    C.ensureV2Ids(sess);
    const iso = ms => ms ? new Date(ms).toISOString() : null;
    const startMs = Math.min(...(sess.exercises || []).flatMap(e => (e.sets || []).map(st => st.doneAt || Infinity)));
    const started = isFinite(startMs) ? iso(startMs - 60000) : `${sess.date}T12:00:00Z`;
    const session = {
      id: sess.uid, user_id: userId, local_date: sess.date, started_at: started,
      ended_at: sess.durationMin ? new Date(Date.parse(started) + sess.durationMin * 60000).toISOString() : null,
      status: 'completed', template_name: sess.name || null, is_deload: false,
      time_budget_min: sess.timeBudget || null, planned_hard_sets: +sess.plannedSets || null,
      readiness: sess.readiness || null, legacy_session_id: sess.id, revision: 0,
    };
    const entries = [], sets = [];
    (sess.exercises || []).forEach((e, ord) => {
      const kind = C.exKind(e);
      entries.push({ id: e.eid, session_id: sess.uid, user_id: userId, exercise_id: exIdOf(e.name) ?? null, name_snapshot: e.name, ord, kind,
        prescription: null, notes: e.notes || null });
      (e.sets || []).forEach((st, idx) => {
        const t0 = st.type || 'normal', prev = e.sets[idx - 1];
        let type = V2_TYPE[t0] || 'working', parent = null;
        if ((type === 'drop' || type === 'rest_pause')) { if (prev) parent = prev.sid; else type = 'working'; }
        const warm = type === 'warmup', rpe = C.validRpe(st.rpe) ? +st.rpe : (t0 === 'failure' ? 10 : null);
        // valores imposibles (peso negativo, más de 100 reps…) se guardan vacíos: la base de datos los rechazaría
        const num = (v, max, dec) => v != null && v !== '' && isFinite(+v) && +v >= 0 && +v <= max ? (dec ? Math.round(+v * 100) / 100 : Math.round(+v)) : null;
        const src = warm || rpe == null ? null : st.effortSrc === 'copied' ? 'copied_prev' : st.effortSrc === 'logged' ? 'logged' : 'legacy';
        sets.push({ id: st.sid, entry_id: e.eid, session_id: sess.uid, user_id: userId, idx, set_type: type, parent_set_id: parent,
          load_kg: num(st.kg, 9999.99, true), reps: num(st.reps, 100), rir: warm || rpe == null ? null : 10 - rpe, rpe: warm ? null : rpe,
          effort_source: src, completed: !!(st.done || st.kg), completed_at: isFinite(+st.doneAt) && +st.doneAt > 1e12 ? iso(+st.doneAt) : null, rest_before_s: num(st.restS, 1e6),
          input_method: null, revision: 0 });
      });
    });
    return { session, entries, sets };
  };

  // ── Health Connect → biometría diaria ──
  // samples por tipo tal como los devuelve @capgo/capacitor-health. Día = fecha local (el sueño cuenta el día en que te despiertas).
  const median = a => { const v = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y), n = v.length; return n ? (n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2) : null; };
  C.healthDaily = byType => {
    const out = {}, day = iso => C.isoDate(new Date(iso)), get = d => (out[d] = out[d] || { date: d });
    const sl = {};
    (byType.sleep || []).forEach(x => {
      const st = Date.parse(x.startDate), en = Date.parse(x.endDate); if (!(en > st)) return;
      const stages = Array.isArray(x.stages) && x.stages.length ? x.stages : null;
      const asleep = stages ? stages.filter(g => !['awake', 'inBed'].includes(g.stage)).reduce((a, g) => a + (+g.durationMinutes || 0), 0)
        : (x.sleepState === 'awake' || x.sleepState === 'inBed') ? 0 : (+x.value || (en - st) / 60000);
      const d = day(x.endDate); (sl[d] = sl[d] || []).push({ asleep, bed: (en - st) / 60000 });
    });
    Object.entries(sl).forEach(([d, a]) => {
      const tot = a.reduce((s, x) => s + x.asleep, 0), main = a.reduce((m, x) => x.bed > m.bed ? x : m, a[0]);
      if (tot > 0) { const o = get(d); o.sleepMin = Math.round(tot); o.sleepEff = main.bed ? Math.round(Math.min(1, main.asleep / main.bed) * 100) / 100 : null; }
    });
    const per = (list, f) => { const g = {}; (list || []).forEach(x => { const v = +x.value; if (isFinite(v) && v > 0) (g[day(x.startDate)] = g[day(x.startDate)] || []).push({ v, h: new Date(x.startDate).getHours(), t: Date.parse(x.startDate), src: x.sourceId || x.sourceName || '?' }); }); Object.entries(g).forEach(([d, a]) => f(d, a)); };
    per(byType.restingHeartRate, (d, a) => { get(d).rhr = Math.round(median(a.map(x => x.v)) * 10) / 10; });
    per(byType.heartRateVariability, (d, a) => { const night = a.filter(x => x.h < 10); get(d).hrv = Math.round(median((night.length ? night : a).map(x => x.v)) * 10) / 10; });
    per(byType.weight, (d, a) => { get(d).weight = Math.round(a.reduce((m, x) => x.t > m.t ? x : m).v * 100) / 100; });
    // pasos: suma por fuente y se queda la fuente con más pasos (el móvil y la pulsera no se suman dos veces)
    per(byType.steps, (d, a) => { const bySrc = {}; a.forEach(x => { bySrc[x.src] = (bySrc[x.src] || 0) + x.v; }); get(d).steps = Math.round(Math.max(...Object.values(bySrc))); });
    return Object.values(out).sort((a, b) => a.date.localeCompare(b.date));
  };
  // Frecuencia cardiaca de cada serie (con su hora): media y máxima desde ~3 s por repetición + 10 s antes hasta 5 s después
  C.attachSetHr = (sessions, hrSamples) => {
    const hr = (hrSamples || []).map(x => ({ t: Date.parse(x.startDate), v: +x.value })).filter(x => isFinite(x.t) && x.v > 0).sort((a, b) => a.t - b.t);
    let changed = 0;
    if (!hr.length) return changed;
    (sessions || []).forEach(s => (s.exercises || []).forEach(e => (e.sets || []).forEach(st => {
      if (!st.doneAt || st.hr) return;
      const from = st.doneAt - ((+st.reps || 8) * 3 + 10) * 1000, to = st.doneAt + 5000, v = hr.filter(x => x.t >= from && x.t <= to).map(x => x.v);
      if (v.length) { st.hr = { avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length), max: Math.max(...v) }; s._hrChanged = true; changed++; }
    })));
    return changed;
  };

  // ── IHO · Índice de Hipertrofia Optimizado (0–100) ──
  // IHO = clip(β·Σ w·C − Φ, 0, 100) con dos puertas de calidad. Referencia: auditoría (claude/Auditoria_Peak_Physique.md)
  // y su implementación Python, que sirve de oráculo en tests/test_iho_oracle.mjs.
  C.IHO_VERSION = '2.0';
  C.HI_MAJOR = ['Pectoral', 'Espalda', 'Cuádriceps', 'Isquiosurales', 'Glúteos', 'Deltoides lateral', 'Bíceps', 'Tríceps'];
  C.HI_W = { vol: .35, int: .20, prog: .20, adh: .15, den: .10 };
  C.HI_NAMES = { vol: 'Volumen efectivo', int: 'Proximidad al fallo', prog: 'Sobrecarga progresiva', adh: 'Adherencia', den: 'Densidad del estímulo' };
  C.hiLabel = (sc, risk) => risk ? { t: 'Sobrecarga / riesgo', c: '#f43f5e' } : sc >= 80 ? { t: 'Óptimo', c: '#34d399' } : sc >= 60 ? { t: 'Productivo', c: '#4f7cff' } : sc >= 40 ? { t: 'Mantenimiento', c: '#fbbf24' } : { t: 'Insuficiente', c: '#f87171' };
  // Volumen efectivo semanal → 0–100: lineal hasta el MEV (60), sube al MAV (100), meseta hasta el MRV (90) y cae
  C.hiVolScore = (v, lm) => {
    if (!(v > 0)) return 0;
    if (v < lm.mev) return 60 * v / lm.mev;
    if (v <= lm.mav) return 60 + 40 * (v - lm.mev) / Math.max(1e-9, lm.mav - lm.mev);
    if (v <= lm.mrv) return 100 - 10 * (v - lm.mav) / Math.max(1e-9, lm.mrv - lm.mav);
    return Math.max(0, 90 - 60 * (v - lm.mrv) / lm.mrv);
  };
  C.SESSION_CAP = 10; // series efectivas/músculo/sesión a crédito completo; el exceso vale 0,5 (heurística)
  C.computeHyperIndex = ({ sessions, templates, profile, end, biometrics }) => {
    const { esc, f1 } = C;
    const start = C.addDays(end, -27);
    const all = (sessions || []).filter(s => s && s.date);
    const isDl = ds => C.isDeloadDate(profile, ds);
    const inWin = all.filter(s => s.date >= start && s.date <= end);
    const ss = inWin.filter(s => !isDl(s.date));
    const first = all.length ? all.reduce((a, s) => s.date < a ? s.date : a, all[0].date) : end;
    const from = first > start ? first : start;
    const span = Math.min(28, Math.max(7, C.daysBetween(from, end) + 1));
    let dlDays = 0;
    for (let i = 0; i < span; i++) if (isDl(C.addDays(end, -i))) dlDays++;
    const weeks = Math.max(1, (span - dlDays) / 7);
    const R = { version: C.IHO_VERSION, end, start, weeks, sessions: ss.length, deloadSessions: inWin.length - ss.length, comp: {}, muscles: [], exercises: [], recs: [], score: null, label: null, risk: false };
    if (ss.length < 2) { R.insufficient = true; return R; }
    const tByName = Object.fromEntries((templates || []).map(t => [t.name, t]));
    const plannedOf = s => { if (+s.plannedSets > 0) return +s.plannedSets; const t = tByName[s.name]; return t ? C.mesoSets(profile, templates, t, s.date).reduce((a, b) => a + b, 0) : 0; };
    const doneOf = s => (s.exercises || []).reduce((a, e) => a + (e.sets || []).filter(C.isWorkSet).length, 0);
    // ── Recorrido de series ──
    const eff = {}, raw = {}, dates = {}, dens = [];
    let work = 0, logged = 0, stimSum = 0, rir03 = 0, junk = 0, failC = 0, compLogged = 0, acute = 0, chronic = 0, noRest = 0;
    ss.forEach(s => {
      const x = {}, recent = C.daysBetween(s.date, end) < 7;
      (s.exercises || []).forEach(e => {
        const cr = C.credits(profile, e), kind = C.exKind(e), [lo, hi] = C.REST_TARGET[kind], cf = kind !== 'isolation' ? 1.3 : 1;
        (e.sets || []).forEach(st => {
          if (!C.isWorkSet(st)) return;
          work++;
          const rir = C.setRir(st), k = C.stim(rir);
          if (rir != null) { logged++; stimSum += k; if (rir <= 3) rir03++; if (rir >= 5) junk++; if (kind !== 'isolation') { compLogged++; if (rir <= 0) failC++; } }
          cr.forEach(({ m, w }) => {
            x[m] = (x[m] || 0) + w * k;
            if (w === 1) { raw[m] = (raw[m] || 0) + 1; if (k > 0) (dates[m] = dates[m] || new Set()).add(s.date); }
          });
          if (st.restS != null && isFinite(st.restS)) dens.push(C.density(+st.restS, lo, hi)); else noRest++;
          const fl = C.fatCost(rir ?? 2) * cf;
          chronic += fl; if (recent) acute += fl;
        });
      });
      Object.entries(x).forEach(([m, v]) => { eff[m] = (eff[m] || 0) + Math.min(v, C.SESSION_CAP) + 0.5 * Math.max(0, v - C.SESSION_CAP); });
    });
    const V = m => (eff[m] || 0) / weeks;
    // 1 · Volumen efectivo frente a los landmarks
    let vs = 0, vw = 0, inZone = 0, nLm = 0, overMrv = 0;
    new Set([...C.HI_MAJOR, ...Object.keys(eff)]).forEach(m => {
      const lm = C.landmarks(profile, m), v = V(m), f = dates[m] ? dates[m].size / weeks : 0, major = C.HI_MAJOR.includes(m);
      if (!lm) { if (v > 0) R.muscles.push({ m, v, f, lm: null, score: null, major, rv: (raw[m] || 0) / weeks }); return; }
      if (!major && !(v > 0)) return;
      const sc = C.hiVolScore(v, lm), w = major ? 1 : .5; vs += sc * w; vw += w; nLm++;
      if (v >= lm.mev && v <= lm.mav) inZone++;
      if (major && v > lm.mrv) overMrv++;
      R.muscles.push({ m, v, f, lm, score: sc, major, rv: (raw[m] || 0) / weeks });
    });
    R.muscles.sort((a, b) => (b.major - a.major) || (b.v - a.v));
    R.comp.vol = { score: vw ? vs / vw : null, detail: `${inZone} de ${nLm} grupos en zona productiva (MEV–MAV), series ponderadas por esfuerzo` };
    // 2 · Proximidad al fallo (solo esfuerzo real: el copiado o inferido no cuenta)
    const cov = work ? logged / work : 0, junkS = logged ? junk / logged : 0, failS = compLogged ? failC / compLogged : 0;
    R.junk = junkS;
    R.comp.int = work && cov >= .5
      ? { score: 100 * stimSum / logged, detail: `${Math.round(100 * rir03 / logged)}% de series a RIR 0–3${junkS >= .05 ? ` · ${Math.round(junkS * 100)}% demasiado lejos del fallo` : ''}`, cov, junkS, failS }
      : { score: null, detail: `Sin datos: esfuerzo (RIR/RPE) registrado en el ${Math.round(cov * 100)}% de las series`, cov, junkS, failS };
    // 3 · Sobrecarga progresiva: tendencia del e1RM (8 semanas, sin descargas)
    const pStart = C.addDays(end, -55), hist = {};
    all.filter(s => s.date >= pStart && s.date <= end && !isDl(s.date)).forEach(s => (s.exercises || []).forEach(e => {
      // e1RM de la sesión: el mismo que muestra Progreso (best_e1rm); si falta, se calcula con el esfuerzo real
      let best = +e.best_e1rm > 0 ? +e.best_e1rm : null;
      if (best == null) (e.sets || []).forEach(st => { if (!C.isWorkSet(st)) return; const rir = C.setRir(st), v = C.calcE1RM(st.kg, st.reps, rir == null ? null : 10 - rir); if (v && (best == null || v > best)) best = v; });
      if (best) (hist[e.name] = hist[e.name] || []).push({ d: s.date, v: best });
    }));
    let pS = 0, pW = 0, drops = 0, nPerf = 0;
    Object.entries(hist).forEach(([name, h]) => {
      h.sort((a, b) => a.d.localeCompare(b.d));
      if (h.length >= 4 && C.daysBetween(h[h.length - 1].d, end) <= 10) {
        nPerf++;
        const prev = h.slice(-4, -1).map(q => q.v).sort((a, b) => a - b);
        if (h[h.length - 1].v < 0.97 * prev[1]) drops++;
      }
      if (h.length < 3 || h[h.length - 1].d < start) return;
      const xs = h.map(q => C.daysBetween(h[0].d, q.d)), ys = h.map(q => q.v), n = h.length;
      const mx = mean(xs), my = mean(ys), sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
      const slope = sxx ? xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / sxx : 0;
      const pct = my ? slope * 28 / my * 100 : 0;
      pS += (50 + 50 * Math.tanh(pct / 2.5)) * n; pW += n;
      R.exercises.push({ name, n, pct, st: pct >= 1 ? 'up' : pct <= -1 ? 'down' : 'flat', last: ys[n - 1] });
    });
    R.exercises.sort((a, b) => b.pct - a.pct);
    R.comp.prog = R.exercises.length >= 2
      ? { score: pS / pW, detail: `${R.exercises.filter(x => x.st === 'up').length} de ${R.exercises.length} ejercicios progresan (e1RM, 8 semanas)` }
      : { score: null, detail: 'Hacen falta ≥3 sesiones por ejercicio en 8 semanas' };
    // 4 · Adherencia: sesiones/semana frente al plan y series hechas frente a las planificadas
    const plan = Math.max(2, Math.min(6, (templates || []).length || 3)), spw = ss.length / weeks, fr = Math.min(1, spw / plan);
    const done = ss.map(s => { const p = plannedOf(s); return p ? Math.min(1, doneOf(s) / p) : null; }).filter(v => v != null);
    const cr = done.length ? mean(done) : null;
    R.comp.adh = { score: 100 * (cr == null ? fr : .5 * fr + .5 * cr), detail: `${f1(spw)} sesiones/sem de ${plan}${cr != null ? ` · ${Math.round(cr * 100)}% de series planificadas` : ''}`, spw, plan, cr };
    // 5 · Densidad: descanso real frente al objetivo de cada tipo de ejercicio
    R.comp.den = dens.length
      ? { score: 100 * mean(dens), detail: `Descanso medido en ${dens.length} series${noRest ? ` (${noRest} sin hora)` : ''}`, n: dens.length }
      : { score: null, detail: 'Sin datos: el descanso se mide desde que cada serie guarda su hora' };
    // ── β: modulación biométrica (recuperación + autorregulación) ──
    // Con menos de 3 días de datos de recuperación no se juzga nada (β neutra)
    const ready = C.readinessSeries(biometrics, start, end), rv0 = Object.values(ready).filter(v => v != null), rv = rv0.length >= 3 ? rv0 : [];
    const rBar = rv.length ? mean(rv) : 0.7;
    const al = !rv.length ? [] : ss.filter(s => ready[s.date] != null && plannedOf(s) > 0).map(s => clip01(1 - Math.abs(doneOf(s) / plannedOf(s) - C.targetLoad(ready[s.date])) / 0.4));
    const aBar = al.length ? mean(al) : 0.5;
    R.beta = Math.max(.85, Math.min(1.05, 1 - .30 * Math.max(0, .7 - rBar) + .10 * (aBar - .5)));
    R.readiness = rv.length ? rBar : null; R.alignment = al.length ? aBar : null; R.readinessDays = rv.length;
    // ── Φ: fatiga acumulada ──
    const acwr = chronic && span >= 21 ? (acute / 7) / (chronic / span) : 1;
    const phiSpike = Math.min(10, 40 * Math.max(0, acwr - 1.3)), phiFail = Math.min(8, 40 * Math.max(0, failS - .25));
    const phiPerf = Math.min(10, 25 * Math.max(0, (nPerf ? drops / nPerf : 0) - .15));
    R.phi = Math.min(25, phiSpike + phiFail + phiPerf);
    R.phiParts = { acwr, spike: phiSpike, fail: phiFail, perf: phiPerf, drops, nPerf };
    // ── Nota ──
    let tw = 0, ts = 0;
    Object.entries(C.HI_W).forEach(([k, w]) => { const c = R.comp[k]; if (c && c.score != null) { ts += c.score * w; tw += w; } });
    R.base = tw ? ts / tw : null;
    let score = tw ? Math.round(Math.max(0, Math.min(100, R.beta * R.base - R.phi))) : null;
    R.risk = R.phi >= 12 || (rBar < .45 && (phiPerf > 0 || overMrv >= 2));
    if (score != null && (R.risk || junkS > .5)) score = Math.min(score, 59);
    R.score = score; R.label = score == null ? null : C.hiLabel(score, R.risk).t;
    // ── Recomendaciones priorizadas ──
    const rec = (p, t) => R.recs.push({ p, t });
    if (R.risk) rec(99, `<b>Riesgo de sobrecarga</b>: ${phiPerf > 0 ? `${drops} de ${nPerf} ejercicios rinden por debajo de lo normal` : 'fatiga acumulada alta'}${rBar < .45 && rv.length ? ' y tu recuperación está baja' : ''}. Haz una descarga de 5–7 días: −40–50% de series, RIR ≥3 y prioridad al sueño.`);
    const lows = R.muscles.filter(x => x.lm && x.major && x.v < x.lm.mev).sort((a, b) => (b.lm.mev - b.v) - (a.lm.mev - a.v));
    const regNote = x => x.rv - x.v >= 1 ? ` (${f1(x.rv)} registradas)` : '';
    if (lows.length >= 3) {
      const nm = lows.slice(0, 3).map(x => `<b>${esc(x.m)}</b>`);
      rec(90, `Sube el volumen efectivo de ${nm.slice(0, -1).join(', ')} y ${nm[nm.length - 1]}${lows.length > 3 ? ` (y ${lows.length - 3} más)` : ''}: están por debajo de su MEV. Añade 2–4 series duras por semana a cada uno.`);
    } else lows.forEach(x => {
      const gap = Math.ceil(x.lm.mev - x.v);
      rec(92 - x.v, `Sube <b>${esc(x.m)}</b>: ${f1(x.v)} series efectivas/sem${regNote(x)}, por debajo de tu MEV (${x.lm.mev}). Añade ${gap}–${gap + 2} series a la semana.`);
    });
    R.muscles.filter(x => x.lm && x.v > x.lm.mrv).forEach(x => rec(86, `Baja <b>${esc(x.m)}</b>: ${f1(x.v)} series/sem superan tu MRV (${x.lm.mrv}). Quita ${Math.ceil(x.v - x.lm.mav)} para volver a la zona productiva.`));
    if (junkS > .5) rec(96, `El ${Math.round(junkS * 100)}% de tus series se quedan a 5 o más repeticiones del fallo y apenas estimulan: llévalas a RIR 1–3 (te quedan 1–3 reps). Mientras sea así, el índice no pasa de 59.`);
    else if (junkS > .2) rec(76, `El ${Math.round(junkS * 100)}% de tus series se quedan lejos del fallo (RIR ≥5): acércalas a RIR 1–3 o elimínalas.`);
    if (failS > .25 && compLogged >= 6) rec(70, `Llevas al fallo el ${Math.round(failS * 100)}% de las series de multiarticulares: el fallo fatiga mucho más de lo que estimula. Resérvalo para aislamientos.`);
    if (cr != null && cr < .9) rec(88, `Completas el ${Math.round(cr * 100)}% de las series planificadas: estás recortando sesiones. Usa el tiempo disponible al empezar: la app deja para el final lo accesorio.`);
    if (spw < plan * .75) rec(72, `Haces ${f1(spw)} sesiones/sem de las ${plan} de tu plan.`);
    if (R.comp.int.score == null) rec(80, 'Marca las repeticiones en reserva (RIR) de cada serie al terminarla: sin esfuerzo real no se puede saber qué series estimulan.');
    if (R.comp.den.score != null && R.comp.den.score < 70) rec(64, `Descansas poco entre series (densidad ${Math.round(R.comp.den.score)}): deja 2–3 min en multiarticulares y al menos 1 min en aislamientos.`);
    if (rv.length && rBar < .55 && !R.risk) rec(74, `Tu recuperación está baja (readiness media ${Math.round(rBar * 100)}/100): duerme más y, en días rojos, quita series en vez de apretar.`);
    if (al.length && aBar < .5) rec(66, 'No estás ajustando la carga a cómo llegas: en días de mala recuperación aplica la recomendación del inicio de sesión.');
    R.exercises.filter(x => x.st !== 'up' && x.n >= 4).sort((a, b) => a.pct - b.pct).slice(0, 2).forEach(x =>
      rec(x.st === 'down' ? 80 : 55, `<b>${esc(x.name)}</b> ${x.st === 'down' ? 'retrocede' : 'está estancado'} (${x.pct > 0 ? '+' : ''}${x.pct.toFixed(1)}% de e1RM al mes): cambia el rango de reps o la variante.`));
    const D = m => (raw[m] || 0) / weeks;
    const push = D('Pectoral') + D('Deltoides anterior'), pull = D('Espalda');
    if (push > 4 && pull < .8 * push) rec(50, `Desequilibrio empuje/tirón: ${f1(pull)} series directas de espalda frente a ${f1(push)} de empuje. Busca un ratio cercano a 1:1.`);
    if (D('Cuádriceps') > 4 && D('Isquiosurales') < .6 * D('Cuádriceps')) rec(45, `Isquiosurales (${f1(D('Isquiosurales'))} series directas/sem) muy por detrás de cuádriceps (${f1(D('Cuádriceps'))}).`);
    R.recs.sort((a, b) => b.p - a.p);
    if (!R.recs.length) rec(0, 'Todo en orden: mantén el volumen y sigue subiendo cargas o repeticiones.');
    return R;
  };

  root.PPCore = C;
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
