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
    return [{ m: prim, w: 1 }, ...C.secondaryFor(profile, ex.name, ex.muscle).map(m => ({ m, w: C.SEC_W }))];
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

  // ── Índice de hipertrofia (0–100) ──
  C.HI_MAJOR = ['Pectoral', 'Espalda', 'Cuádriceps', 'Isquiosurales', 'Glúteos', 'Deltoides lateral', 'Bíceps', 'Tríceps'];
  // Pesos (ver HI_METHOD en js/hyper.js): volumen 35 · proximidad 20 · progresión 20 · adherencia 15 · frecuencia 10
  C.HI_W = { vol: .35, int: .20, prog: .20, adh: .15, freq: .10 };
  C.HI_NAMES = { vol: 'Volumen efectivo', int: 'Proximidad al fallo', freq: 'Frecuencia', prog: 'Sobrecarga progresiva', adh: 'Adherencia' };
  C.hiLabel = sc => sc >= 80 ? { t: 'Óptimo', c: '#34d399' } : sc >= 65 ? { t: 'Bueno', c: '#4f7cff' } : sc >= 50 ? { t: 'Mejorable', c: '#fbbf24' } : { t: 'Subóptimo', c: '#f87171' };
  C.hiVolScore = (v, lm) => {
    if (!(v > 0)) return 0;
    if (v < lm.mev) return 60 * v / lm.mev;
    if (v <= lm.mav) return 85 + 15 * (v - lm.mev) / Math.max(1, lm.mav - lm.mev);
    if (v <= lm.mrv) return 100 - 20 * (v - lm.mav) / Math.max(1, lm.mrv - lm.mav);
    return Math.max(20, 80 - 6 * (v - lm.mrv));
  };
  C.computeHyperIndex = ({ sessions, templates, profile, end }) => {
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
    const R = { end, start, weeks, sessions: ss.length, deloadSessions: inWin.length - ss.length, comp: {}, muscles: [], exercises: [], recs: [], score: null };
    if (ss.length < 2) { R.insufficient = true; return R; }
    const tByName = Object.fromEntries((templates || []).map(t => [t.name, t]));
    // Recuento por músculo e intensidad
    const hard = {}, raw = {}, dates = {};
    let work = 0, withRpe = 0, eff = 0, junk = 0, fail = 0, repsKnown = 0, repsOK = 0;
    ss.forEach(s => s.exercises?.forEach(e => {
      const cr = C.credits(profile, e);
      (e.sets || []).forEach(st => {
        if (!C.isWorkSet(st)) return; work++;
        const c = C.hardCredit(st);
        cr.forEach(({ m, w }) => {
          hard[m] = (hard[m] || 0) + c * w;
          if (w === 1) { raw[m] = (raw[m] || 0) + 1; if (c > 0) (dates[m] = dates[m] || new Set()).add(s.date); }
        });
        if (C.hasRpe(st)) { withRpe++; const r = +st.rpe; if (r >= 7) eff++; if (r < 6) junk++; if (r >= 10) fail++; }
        else if (st.type === 'failure') fail++;
        if (st.reps > 0) { repsKnown++; if (st.reps >= 5 && st.reps <= 30) repsOK++; }
      });
    }));
    const V = m => (hard[m] || 0) / weeks;
    // 1 · Volumen efectivo vs landmarks
    let vs = 0, vw = 0, inZone = 0, nLm = 0;
    new Set([...C.HI_MAJOR, ...Object.keys(hard)]).forEach(m => {
      const lm = C.landmarks(profile, m), v = V(m), f = dates[m] ? dates[m].size / weeks : 0, major = C.HI_MAJOR.includes(m);
      if (!lm) { if (v > 0) R.muscles.push({ m, v, f, lm: null, score: null, major, rv: (raw[m] || 0) / weeks }); return; }
      if (!major && !(v > 0)) return;
      const sc = C.hiVolScore(v, lm), w = major ? 1 : .5; vs += sc * w; vw += w; nLm++;
      if (v >= lm.mev && v <= lm.mav) inZone++;
      R.muscles.push({ m, v, f, lm, score: sc, major, rv: (raw[m] || 0) / weeks });
    });
    R.muscles.sort((a, b) => (b.major - a.major) || (b.v - a.v));
    R.comp.vol = { score: vw ? vs / vw : null, detail: `${inZone} de ${nLm} grupos en zona productiva (MEV–MAV)` };
    // 2 · Proximidad al fallo y rango de reps
    const cov = work ? withRpe / work : 0;
    if (withRpe >= 8 && cov >= .3) {
      const effS = eff / withRpe, junkS = junk / withRpe, repS = repsKnown ? repsOK / repsKnown : 1, failS = work ? fail / work : 0;
      R.comp.int = { score: Math.max(0, Math.min(100, 100 * (.8 * effS + .2 * repS) - 40 * Math.max(0, failS - .4))),
        detail: `${Math.round(effS * 100)}% de series a RPE 7–10${junkS >= .05 ? ` · ${Math.round(junkS * 100)}% demasiado fáciles` : ''}`, effS, junkS, failS, cov };
    } else R.comp.int = { score: null, detail: `Sin datos: RPE registrado en el ${Math.round(cov * 100)}% de las series`, cov };
    // 3 · Frecuencia por grupo principal (solo trabajo directo)
    const fm = R.muscles.filter(x => x.major && x.f > 0);
    if (fm.length) {
      const sc = fm.map(x => x.f >= 2 ? 100 : x.f >= 1 ? 50 + 50 * (x.f - 1) : 50 * x.f);
      R.comp.freq = { score: sc.reduce((a, b) => a + b, 0) / sc.length, detail: `${f1(fm.reduce((a, x) => a + x.f, 0) / fm.length)} días/semana de media por grupo` };
    } else R.comp.freq = { score: null, detail: 'Sin datos' };
    // 4 · Sobrecarga progresiva: tendencia del e1RM en 8 semanas (sin semanas de descarga)
    const pStart = C.addDays(end, -55), hist = {};
    all.filter(s => s.date >= pStart && s.date <= end && !isDl(s.date)).forEach(s => s.exercises?.forEach(e => {
      if (+e.best_e1rm > 0) (hist[e.name] = hist[e.name] || []).push({ d: s.date, v: +e.best_e1rm });
    }));
    Object.entries(hist).forEach(([name, h]) => {
      if (h.length < 3) return; h.sort((a, b) => a.d.localeCompare(b.d));
      if (h[h.length - 1].d < start) return;
      const xs = h.map(q => C.daysBetween(h[0].d, q.d)), ys = h.map(q => q.v), n = h.length;
      const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n, sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
      const slope = sxx ? xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / sxx : 0;
      const pct = my ? slope * 28 / my * 100 : 0;
      R.exercises.push({ name, n, pct, st: pct >= 1 ? 'up' : pct <= -1 ? 'down' : 'flat', last: ys[n - 1] });
    });
    R.exercises.sort((a, b) => b.pct - a.pct);
    if (R.exercises.length >= 2) {
      const sc = R.exercises.map(x => x.st === 'up' ? 100 : x.st === 'flat' ? 55 : 20), wt = R.exercises.map(x => x.n);
      R.comp.prog = { score: sc.reduce((a, v, i) => a + v * wt[i], 0) / wt.reduce((a, b) => a + b, 0), detail: `${R.exercises.filter(x => x.st === 'up').length} de ${R.exercises.length} ejercicios progresan` };
    } else R.comp.prog = { score: null, detail: 'Hacen falta ≥3 sesiones por ejercicio en 8 semanas' };
    // 5 · Adherencia: sesiones/semana vs plan y series hechas vs planificadas (con el plan del mesociclo)
    const plan = Math.max(2, Math.min(6, (templates || []).length || 3)), spw = ss.length / weeks, fr = Math.min(1, spw / plan);
    const done = [];
    ss.forEach(s => {
      const t = tByName[s.name]; if (!t) return;
      const planned = C.mesoSets(profile, templates, t, s.date).reduce((a, b) => a + b, 0); if (!planned) return;
      done.push(Math.min(1, (s.exercises || []).reduce((a, e) => a + (e.sets || []).filter(C.isWorkSet).length, 0) / planned));
    });
    const cr = done.length ? done.reduce((a, b) => a + b, 0) / done.length : null;
    R.comp.adh = { score: 100 * (cr == null ? fr : .5 * fr + .5 * cr), detail: `${f1(spw)} sesiones/sem de ${plan}${cr != null ? ` · ${Math.round(cr * 100)}% de series planificadas` : ''}`, spw, plan, cr };
    // Índice global (los componentes sin datos no cuentan y su peso se reparte)
    let tw = 0, ts = 0;
    Object.entries(C.HI_W).forEach(([k, w]) => { const c = R.comp[k]; if (c && c.score != null) { ts += c.score * w; tw += w; } });
    R.score = tw ? Math.round(ts / tw) : null;
    // Recomendaciones priorizadas
    const rec = (p, t) => R.recs.push({ p, t });
    const lows = R.muscles.filter(x => x.lm && x.major && x.v < x.lm.mev).sort((a, b) => (b.lm.mev - b.v) - (a.lm.mev - a.v));
    const regNote = x => x.rv - x.v >= 1 ? ` (${f1(x.rv)} registradas)` : '';
    if (lows.length >= 3) {
      const nm = lows.slice(0, 3).map(x => `<b>${esc(x.m)}</b>`);
      rec(90, `Sube el volumen de ${nm.slice(0, -1).join(', ')} y ${nm[nm.length - 1]}${lows.length > 3 ? ` (y ${lows.length - 3} más)` : ''}: están por debajo de su MEV. Añade 2–4 series duras por semana a cada uno.`);
    } else lows.forEach(x => {
      const gap = Math.ceil(x.lm.mev - x.v);
      rec(92 - x.v, `Sube <b>${esc(x.m)}</b>: ${f1(x.v)} series duras/sem${regNote(x)}, por debajo de tu MEV (${x.lm.mev}). Añade ${gap}–${gap + 2} series a la semana.`);
    });
    R.muscles.filter(x => x.lm && x.v > x.lm.mrv).forEach(x => rec(86, `Baja <b>${esc(x.m)}</b>: ${f1(x.v)} series/sem superan tu MRV (${x.lm.mrv}). Quita ${Math.ceil(x.v - x.lm.mav)} para volver a la zona productiva.`));
    if (cr != null && cr < .9) rec(88, `Completas el ${Math.round(cr * 100)}% de las series planificadas: estás recortando sesiones. Haz primero los ejercicios clave o planifica menos series.`);
    if (spw < plan * .75) rec(72, `Haces ${f1(spw)} sesiones/sem de las ${plan} de tu plan.`);
    if (R.comp.int.score == null) rec(70, 'Registra el RPE en cada serie: sin él no se puede saber cuántas series son realmente efectivas.');
    else {
      if (R.comp.int.junkS > .5) rec(96, `El ${Math.round(R.comp.int.junkS * 100)}% de tus series están a RPE &lt;6 y no cuentan como series efectivas: llévalas a RPE 7–9 (te quedan 1–3 reps).`);
      else if (R.comp.int.junkS > .2) rec(76, `El ${Math.round(R.comp.int.junkS * 100)}% de tus series están a RPE &lt;6: acércalas a RIR 1–3 o elimínalas.`);
      if (R.comp.int.failS > .4) rec(62, `Llevas al fallo el ${Math.round(R.comp.int.failS * 100)}% de las series: resérvalo para la última serie de aislamientos.`);
    }
    R.muscles.filter(x => x.major && x.v >= 4 && x.f > 0 && x.f < 1.5).forEach(x => rec(58, `<b>${esc(x.m)}</b> se entrena ${f1(x.f)} día/sem: reparte sus ${f1(x.v)} series en 2 sesiones.`));
    R.exercises.filter(x => x.st !== 'up' && x.n >= 4).sort((a, b) => a.pct - b.pct).slice(0, 2).forEach(x =>
      rec(x.st === 'down' ? 80 : 55, `<b>${esc(x.name)}</b> ${x.st === 'down' ? 'retrocede' : 'está estancado'} (${x.pct > 0 ? '+' : ''}${x.pct.toFixed(1)}% de e1RM al mes): cambia el rango de reps o la variante.`));
    // Equilibrios con series DIRECTAS (las indirectas inflarían el empuje: cada press suma medio deltoides anterior)
    const D = m => (raw[m] || 0) / weeks;
    const push = D('Pectoral') + D('Deltoides anterior'), pull = D('Espalda');
    if (push > 4 && pull < .8 * push) rec(50, `Desequilibrio empuje/tirón: ${f1(pull)} series directas de espalda frente a ${f1(push)} de empuje. Busca un ratio cercano a 1:1.`);
    if (D('Cuádriceps') > 4 && D('Isquiosurales') < .6 * D('Cuádriceps')) rec(45, `Isquiosurales (${f1(D('Isquiosurales'))} series directas/sem) muy por detrás de cuádriceps (${f1(D('Cuádriceps'))}).`);
    const rpeAvg = (a, b) => { let s = 0, n = 0; all.filter(x => x.date >= a && x.date <= b && !isDl(x.date)).forEach(x => x.exercises?.forEach(e => e.sets?.forEach(st => { if (C.isWorkSet(st) && C.hasRpe(st)) { s += +st.rpe; n++; } }))); return n >= 6 ? s / n : null; };
    const rNow = rpeAvg(C.addDays(end, -6), end), rPrev = rpeAvg(start, C.addDays(end, -7));
    if (rNow != null && rPrev != null && rNow - rPrev >= .7 && (R.comp.prog.score ?? 100) < 60)
      rec(84, `Señales de fatiga: el RPE medio sube (${f1(rPrev)} → ${f1(rNow)}) sin que suba la fuerza. Adelanta la semana de descarga (−50% de series).`);
    R.recs.sort((a, b) => b.p - a.p);
    if (!R.recs.length) rec(0, 'Todo en orden: mantén el volumen y sigue subiendo cargas o repeticiones.');
    return R;
  };

  root.PPCore = C;
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
