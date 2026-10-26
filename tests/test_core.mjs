// Pruebas de js/core.js (lógica compartida app + informe). Ejecutar: node tests/test_core.mjs
import assert from 'node:assert/strict';
import C from '../js/core.js';

let ok = 0, fail = 0;
const t = (name, fn) => { try { fn(); ok++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, '\n   ', e.message); } };

// ── Utilidades y e1RM ──
t('fechas: addDays/daysBetween/mondayOf', () => {
  assert.equal(C.addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(C.addDays('2026-03-29', 1), '2026-03-30'); // cambio de hora: sin desfases
  assert.equal(C.daysBetween('2026-10-01', '2026-10-20'), 19);
  assert.equal(C.mondayOf('2026-10-25'), '2026-10-19'); // domingo → lunes anterior
  assert.equal(C.mondayOf('2026-10-19'), '2026-10-19');
});
t('e1RM RTS: 100 kg × 5 @10 = 115.9; sin RPE = esfuerzo máximo; >14 reps efectivas = null', () => {
  assert.equal(C.calcE1RM(100, 5, 10), 115.9);
  assert.equal(C.calcE1RM(100, 5), 115.9);
  assert.equal(C.calcE1RM(100, 5, 8), C.calcE1RM(100, 7, 10));
  assert.equal(C.calcE1RM(80, 27, 10), null);
  assert.equal(C.calcE1RM(0, 5, 8), null);
});
t('normMuscle une variantes de escritura', () => {
  assert.equal(C.normMuscle('Deltoides Anterior'), 'Deltoides anterior');
  assert.equal(C.normMuscle('Isquiotibiales'), 'Isquiosurales');
  assert.equal(C.normMuscle('Hombro posterior'), 'Deltoides posterior');
  assert.equal(C.normMuscle('pectoral'), 'Pectoral');
  assert.equal(C.normMuscle('Gemelo/Sóleo'), 'Gemelo/Sóleo');
});
t('landmarks: mayúsculas, alias y overrides', () => {
  assert.deepEqual(C.landmarks({}, 'Deltoides Anterior'), { mev: 2, mav: 8, mrv: 12 });
  assert.deepEqual(C.landmarks({}, 'Gemelo/Sóleo'), { mev: 8, mav: 14, mrv: 20 });
  assert.deepEqual(C.landmarks({ landmarks: { Pectoral: { mev: 10 } } }, 'Pectoral'), { mev: 10, mav: 16, mrv: 22 });
  assert.equal(C.landmarks({ landmarks: { Pectoral: { mev: 30 } } }, 'Pectoral'), null); // MEV > MAV → inválido
  assert.equal(C.landmarks({}, 'Antebrazo'), null);
});

// ── Músculos secundarios ──
const sec = (n, m) => C.autoSecondary(n, m);
t('secundarios: empujes y tirones', () => {
  assert.deepEqual(sec('Press inclinado en máquina convergente', 'Pectoral'), ['Tríceps', 'Deltoides anterior']);
  assert.deepEqual(sec('Aperturas en polea baja', 'Pectoral'), []);
  assert.deepEqual(sec('Remo en Máquina Neutro', 'Espalda'), ['Bíceps', 'Deltoides posterior']);
  assert.deepEqual(sec('Jalón en polea agarre ancho', 'Espalda'), ['Bíceps']);
  assert.deepEqual(sec('Pullover en polea alta', 'Espalda'), []);
  assert.deepEqual(sec('Press de hombro en máquina', 'Deltoides Anterior'), ['Tríceps', 'Deltoides lateral']);
  assert.deepEqual(sec('Kaz Press', 'Tríceps'), ['Pectoral', 'Deltoides anterior']);
  assert.deepEqual(sec('Press francés con barra Z', 'Tríceps'), []);
  assert.deepEqual(sec('Tríceps en polea alta', 'Tríceps'), []);
});
t('secundarios: pierna', () => {
  assert.deepEqual(sec('Prensa 45º', 'Cuádriceps'), ['Glúteos', 'Aductores']);
  assert.deepEqual(sec('Extensión de cuádriceps', 'Cuádriceps'), []);
  assert.deepEqual(sec('PM Rumano con mancuernas', 'Isquiotibiales'), ['Glúteos']);
  assert.deepEqual(sec('Curl femoral sentado', 'Isquiotibiales'), []);
  assert.deepEqual(sec('Hip-thrust en máquina', 'Glúteos'), []);
});
t('secundarios: override del usuario y créditos 1 / 0,5', () => {
  const prof = { secMap: { [C.normExName('Press banca')]: ['Tríceps'] } };
  assert.deepEqual(C.secondaryFor(prof, 'Press banca', 'Pectoral'), ['Tríceps']);
  assert.deepEqual(C.secondaryFor({ secMap: { 'press banca': [] } }, 'Press banca', 'Pectoral'), []);
  assert.deepEqual(C.credits({}, { name: 'Press banca', muscle: 'Pectoral' }), [{ m: 'Pectoral', w: 1 }, { m: 'Tríceps', w: .5 }, { m: 'Deltoides anterior', w: .5 }]);
});

// ── Mesociclos ──
const meso = { mesoLog: [{ from: '2026-10-01', start: '2026-10-05', weeks: 5, deload: true, progress: true, on: true }] };
t('meso: semana, RIR y descarga en bucle', () => {
  assert.equal(C.mesoWeekAt(meso, '2026-10-04'), null); // antes del inicio
  const w = d => { const x = C.mesoWeekAt(meso, d); return [x.idx, x.rir, x.deload]; };
  assert.deepEqual(w('2026-10-05'), [1, 3, false]);
  assert.deepEqual(w('2026-10-14'), [2, 2, false]);
  assert.deepEqual(w('2026-10-21'), [3, 1, false]);
  assert.deepEqual(w('2026-10-28'), [4, 0, false]);
  assert.deepEqual(w('2026-11-08'), [5, 4, true]);
  assert.deepEqual(w('2026-11-09'), [1, 3, false]); // empieza el ciclo 2
  assert.equal(C.isDeloadDate(meso, '2026-11-04'), true);
});
t('meso: el historial conserva las semanas pasadas', () => {
  const p = { mesoLog: [...meso.mesoLog, { from: '2026-10-20', start: '2026-10-19', weeks: 4, deload: true, progress: true, on: true }] };
  assert.equal(C.mesoWeekAt(p, '2026-10-14').weeks, 5);
  assert.equal(C.mesoWeekAt(p, '2026-10-20').idx, 1);
  assert.equal(C.mesoWeekAt({ mesoLog: [...meso.mesoLog, { ...meso.mesoLog[0], from: '2026-10-20', on: false }] }, '2026-10-21'), null);
});
const T = [
  { name: 'U', exercises: [{ name: 'Press', muscle: 'Pectoral', sets: 3 }, { name: 'Aperturas', muscle: 'Pectoral', sets: 3 }, { name: 'Remo', muscle: 'Espalda', sets: 4 }] },
  { name: 'L', exercises: [{ name: 'Prensa', muscle: 'Cuádriceps', sets: 3 }, { name: 'Curl femoral', muscle: 'Isquiotibiales', sets: 3 }] },
];
t('meso: series por semana (+1 en el primer ejercicio de cada músculo) y descarga a la mitad', () => {
  assert.deepEqual(C.mesoSets(meso, T, T[0], '2026-10-06'), [3, 3, 4]);
  assert.deepEqual(C.mesoSets(meso, T, T[0], '2026-10-13'), [4, 3, 5]);
  assert.deepEqual(C.mesoSets(meso, T, T[0], '2026-10-27'), [6, 3, 7]);
  assert.deepEqual(C.mesoSets(meso, T, T[0], '2026-11-04'), [2, 2, 2]);
  assert.deepEqual(C.mesoSets({ mesoLog: [{ ...meso.mesoLog[0], progress: false }] }, T, T[0], '2026-10-27'), [3, 3, 4]);
  assert.deepEqual(C.mesoSets({}, T, T[0], '2026-10-27'), [3, 3, 4]);
});
t('meso: tope en el MRV semanal', () => {
  const big = [{ name: 'P', exercises: [{ name: 'Press', muscle: 'Pectoral', sets: 10 }, { name: 'Press 2', muscle: 'Pectoral', sets: 10 }] }];
  assert.deepEqual(C.mesoSets(meso, big, big[0], '2026-10-27'), [12, 10]); // MRV pectoral 22 → solo +2
});

// ── Índice de hipertrofia ──
const mkS = (date, name, exs) => ({ date, name, exercises: exs.map(([n, m, c, rpe, e1]) => ({ name: n, muscle: m, best_e1rm: e1, sets: Array.from({ length: c }, () => ({ kg: 50, reps: 10, rpe, done: true })) })) });
function optimal(end, extraProfile = {}) {
  const U = [['Press pecho', 'Pectoral', 6], ['Remo', 'Espalda', 7], ['Laterales', 'Deltoides lateral', 6], ['Curl', 'Bíceps', 5], ['Extensión tríceps', 'Tríceps', 5]];
  const L = [['Prensa', 'Cuádriceps', 6], ['Curl femoral', 'Isquiosurales', 5], ['Hip thrust', 'Glúteos', 4]];
  const templates = [['U1', U], ['L1', L], ['U2', U], ['L2', L]].map(([n, ex]) => ({ name: n, exercises: ex.map(([a, b, c]) => ({ name: a, muscle: b, sets: c })) }));
  const sessions = []; let k = 0;
  for (let day = 27; day >= 0; day--) {
    const ds = C.addDays(end, -day), dw = day % 7; if (![0, 2, 4, 5].includes(dw)) continue;
    const tp = templates[k++ % 4];
    sessions.push(mkS(ds, tp.name, tp.exercises.map(e => [e.name, e.muscle, e.sets, 8, 60 + (27 - day) * .35])));
  }
  return { sessions, templates, profile: extraProfile, end };
}
t('índice: escenario óptimo ≥ 80 (Óptimo)', () => {
  const R = C.computeHyperIndex(optimal('2026-10-20'));
  assert.ok(R.score >= 80 && R.label === 'Óptimo', `score ${R.score} ${R.label}`);
  assert.equal(R.comp.adh.cr, 1);
});
t('índice: pesos suman 1, sin frecuencia, densidad es el menor', () => {
  const w = Object.values(C.HI_W); assert.equal(Math.round(w.reduce((a, b) => a + b, 0) * 100), 100);
  assert.equal(C.HI_W.freq, undefined);
  assert.equal(Math.min(...w), C.HI_W.den);
});
t('índice: los secundarios suman 0,5 al volumen (tríceps recibe del press)', () => {
  const R = C.computeHyperIndex(optimal('2026-10-20'));
  const tri = R.muscles.find(m => m.m === 'Tríceps'), pec = R.muscles.find(m => m.m === 'Pectoral');
  // el único aporte indirecto al tríceps es el press de pecho: suma la mitad de sus series (todas a RPE 8 → estímulo 0,95)
  assert.ok(Math.abs((tri.v - .95 * tri.rv) - .5 * .95 * pec.rv) < .01, `tríceps ${tri.v} (directas ${tri.rv}) · press ${pec.rv}`);
});
t('índice: la semana de descarga no cuenta', () => {
  const end = '2026-10-25';
  const base = optimal(end);
  const prof = { mesoLog: [{ from: '2026-09-01', start: '2026-09-28', weeks: 4, deload: true, progress: false, on: true }] }; // 19–25 oct = descarga
  const dl = base.sessions.map(s => s.date >= '2026-10-19' ? { ...s, exercises: s.exercises.map(e => ({ ...e, best_e1rm: e.best_e1rm * .9, sets: e.sets.slice(0, Math.ceil(e.sets.length / 2)).map(x => ({ ...x, rpe: 6 })) })) } : s);
  const R0 = C.computeHyperIndex({ ...base, sessions: dl, profile: {} });
  const R1 = C.computeHyperIndex({ ...base, sessions: dl, profile: prof });
  assert.ok(R1.deloadSessions > 0);
  assert.ok(R1.score > R0.score, `sin excluir ${R0.score} · excluyendo ${R1.score}`);
  assert.ok(R1.score >= 80, `score ${R1.score}`);
});
t('índice: escenario pobre < 50 con recomendaciones priorizadas', () => {
  const end = '2026-10-20', M = ['Pectoral', 'Espalda', 'Cuádriceps', 'Isquiosurales', 'Glúteos', 'Bíceps'];
  const templates = [{ name: 'Full', exercises: M.map(m => ({ name: 'Ej ' + m, muscle: m, sets: 6 })) }, { name: 'X', exercises: [] }, { name: 'Y', exercises: [] }];
  const sessions = [0, 7, 14, 21, 28, 35].map((d, i) => mkS(C.addDays(end, -d), 'Full', M.map(m => ['Ej ' + m, m, 3, 5, 60 + i * .4])));
  const R = C.computeHyperIndex({ sessions, templates, profile: {}, end });
  assert.ok(R.score < 50, `score ${R.score}`);
  assert.match(R.recs[0].t, /apenas estimulan/);
  assert.ok(R.score <= 59, 'puerta de volumen basura');
});
t('índice: sin datos suficientes', () => {
  const R = C.computeHyperIndex({ sessions: [], templates: [], profile: {}, end: '2026-10-20' });
  assert.equal(R.score, null); assert.equal(R.insufficient, true);
});

// ── Ejercicios renombrados (erratas corregidas en la tabla exercises) ──
t('nombres: el antiguo se traduce al nuevo; el nuevo y los demás no cambian', () => {
  assert.equal(C.canonExName('Jm Press'), 'JM Press');
  assert.equal(C.canonExName('jm  press'), 'JM Press');
  assert.equal(C.canonExName('JM Press'), 'JM Press');
  assert.equal(C.canonExName('Patada de Triceps desde Polea Baja'), 'Patada de Tríceps desde Polea Baja');
  assert.equal(C.canonExName('Press banca'), 'Press banca');
  assert.equal(C.canonExName(undefined), undefined);
  Object.values(C.EX_RENAMES).forEach(n => assert.equal(C.canonExName(n), n, n));
  assert.equal(Object.keys(C.EX_RENAMES).length, 15);
});
t('nombres: alias para buscar en la tabla antes y después del SQL', () => {
  assert.deepEqual(C.exNameAliases('Copenhagen Adductions'), ['Copenhagen Adductions', 'Copenaghen Adductions']);
  assert.deepEqual(C.exNameAliases('Press banca'), ['Press banca']);
});
t('nombres: sesiones, rutinas y mapas de ajustes quedan con el nombre nuevo', () => {
  const ss = [{ exercises: [{ name: 'Jm Press' }, { name: 'Press banca' }] }, { exercises: [{ name: 'JM Press' }] }, {}];
  assert.equal(C.canonExList(ss), 1);
  assert.deepEqual(ss.flatMap(s => (s.exercises || []).map(e => e.name)), ['JM Press', 'Press banca', 'JM Press']);
  assert.deepEqual(C.canonExKeys({ 'Jm Press': '0001', 'Press banca': '0002' }, false), { 'JM Press': '0001', 'Press banca': '0002' });
  // si ya hay ajuste con el nombre nuevo, manda el nuevo
  assert.deepEqual(C.canonExKeys({ 'Jm Press': 'viejo', 'JM Press': 'nuevo' }, false), { 'JM Press': 'nuevo' });
  assert.deepEqual(C.canonExKeys({ 'patada de triceps desde polea baja': ['Deltoides posterior'] }, true), { 'patada de triceps desde polea baja': ['Deltoides posterior'] });
  assert.deepEqual(C.canonExKeys({ 'ab-roll out/ab-wheel': ['Lumbar'] }, true), { 'ab roll out / ab wheel': ['Lumbar'] });
  // secundarios personalizados siguen aplicando con el nombre nuevo
  const prof = { secMap: C.canonExKeys({ 'ab-roll out/ab-wheel': ['Lumbar'] }, true) };
  assert.deepEqual(C.secondaryFor(prof, 'Ab Roll Out / Ab Wheel', 'Abdomen'), ['Lumbar']);
});

// ── IHO: piezas nuevas ──
t('IHO: estímulo y fatiga por RIR (umbrales)', () => {
  assert.deepEqual([0, 1, 1.5, 2, 3, 4, 5, 6].map(C.stim), [1, 1, .95, .95, .85, .6, .35, 0]);
  assert.equal(C.stim(null), 0);
  assert.deepEqual([0, 1, 2, 3].map(C.fatCost), [1.4, 1.15, 1.05, 1]);
});
t('IHO: el RPE copiado o inferido no cuenta como esfuerzo real', () => {
  assert.equal(C.setRir({ kg: 50, reps: 10, rpe: 8, done: true }), 2);
  assert.equal(C.setRir({ kg: 50, reps: 10, rpe: 8, done: true, effortSrc: 'logged' }), 2);
  assert.equal(C.setRir({ kg: 50, reps: 10, rpe: 8, done: true, effortSrc: 'copied' }), null);
  assert.equal(C.setRir({ kg: 50, reps: 10, rpe: null, done: true }), null);
});
t('IHO: tipo de ejercicio y descanso del temporizador', () => {
  assert.equal(C.exKind({ name: 'Press banca' }), 'compound_heavy');
  assert.equal(C.exKind({ name: 'Remo pecho apoyado' }), 'compound');
  assert.equal(C.exKind({ name: 'Curl femoral sentado' }), 'isolation');
  assert.equal(C.exKind({ name: 'Gemelo en Prensa' }), 'isolation');
  assert.equal(C.exKind({ name: 'Lo que sea', kind: 'isolation' }), 'isolation');
  assert.deepEqual(['compound_heavy', 'compound', 'isolation'].map(k => C.restFor(k, 90)), [150, 90, 60]);
  assert.deepEqual(['compound_heavy', 'compound', 'isolation'].map(k => C.restFor(k, 120)), [180, 120, 90]);
});
t('IHO: densidad penaliza descansar poco, apenas descansar mucho', () => {
  assert.equal(C.density(150, 120, 240), 1);
  assert.ok(Math.abs(C.density(60, 120, 240) - .25) < 1e-9);
  assert.ok(C.density(600, 120, 240) >= .6);
});
t('IHO: readiness con sueño, pulso, HRV y check-in', () => {
  const end = '2026-10-25', start = C.addDays(end, -27), bio = [];
  for (let i = 0; i < 88; i++) { const d = C.addDays(end, -i); bio.push({ date: d, hrv: 60 * Math.exp(.05 * Math.sin(i)), rhr: 55 + (i % 3) - 1, sleepMin: 7.5 * 60 }); }
  const R = C.readinessSeries(bio, start, end);
  assert.ok(Math.abs(R[end] - 0.85) < .08, `normal ${R[end]}`);
  const bad = bio.map(b => C.daysBetween(b.date, end) < 3 ? { ...b, hrv: 40, rhr: 62, sleepMin: 300 } : b);
  assert.ok(C.readinessSeries(bad, start, end)[end] < .2, 'semana mala → readiness baja');
  assert.equal(C.readinessSeries([], start, end)[end], null);
  const sub = C.readinessSeries([{ date: end, subj: { sleep: 5, soreness: 1, energy: 5 } }], start, end)[end];
  assert.ok(Math.abs(sub - .9) < 1e-9, `check-in ${sub}`);
  assert.deepEqual([.7, .5, .3].map(C.targetLoad), [1, .8, .6]);
});
t('IHO: sin biometría β = 1 y sin penalización', () => {
  const R = C.computeHyperIndex(optimal('2026-10-20'));
  assert.equal(R.beta, 1); assert.equal(R.readiness, null); assert.equal(R.phi, 0); assert.equal(R.risk, false);
});
t('IHO: con menos de 3 días de recuperación no se juzga (β = 1)', () => {
  const o = optimal('2026-10-20');
  const R = C.computeHyperIndex({ ...o, biometrics: [{ date: '2026-10-20', subj: { sleep: 1, soreness: 5, energy: 1 } }] });
  assert.equal(R.beta, 1); assert.equal(R.readiness, null);
  assert.ok(!R.recs.some(r => /recuperación está baja|ajustando la carga/.test(r.t)));
});
t('IHO: las series planificadas al empezar mandan sobre la rutina', () => {
  const o = optimal('2026-10-20');
  o.sessions.forEach(s => { s.plannedSets = 2 * s.exercises.reduce((a, e) => a + e.sets.length, 0); });
  const R = C.computeHyperIndex(o);
  assert.equal(R.comp.adh.cr, .5);
});
t('IHO: densidad con la hora de cada serie', () => {
  const o = optimal('2026-10-20');
  o.sessions.forEach(s => s.exercises.forEach(e => e.sets.forEach((x, i) => { if (i) x.restS = 30; })));
  const R = C.computeHyperIndex(o);
  assert.ok(R.comp.den.score < 40, `densidad ${R.comp.den.score}`);
  assert.ok(R.recs.some(r => /Descansas poco/.test(r.t)));
});

// ── Modelo v2 ──
t('v2: UUID v7 válido y ordenado por tiempo', () => {
  const a = C.uuid7(1e12), b = C.uuid7(1e12 + 1);
  assert.ok(C.isUuid(a) && C.isUuid(b) && a < b && a[14] === '7' && '89ab'.includes(a[19]), a);
});
t('v2: sesión de la app → filas por serie (tipos, serie madre, esfuerzo, hora, descanso)', () => {
  const s = { id: 5, date: '2026-10-25', name: 'T', durationMin: 30, plannedSets: 3, exercises: [{ name: 'Curl', muscle: 'Bíceps', sets: [
    { kg: 10, reps: 12, rpe: 5, done: true, type: 'warmup' }, { kg: 20, reps: 10, rpe: 9, done: true, effortSrc: 'logged', doneAt: Date.UTC(2026, 9, 25, 18) },
    { kg: 15, reps: 8, done: true, type: 'dropset', restS: 10 }, { kg: 20, reps: 6, done: true, type: 'failure' }, { kg: 20, reps: 8, rpe: 8, done: true, effortSrc: 'copied' }] }] };
  const r = C.toV2Rows(s, 'u', () => 3), S = r.sets;
  assert.equal(r.session.id, s.uid); assert.equal(r.session.legacy_session_id, 5); assert.equal(r.session.planned_hard_sets, 3);
  assert.deepEqual(S.map(x => x.set_type), ['warmup', 'working', 'drop', 'working', 'working']);
  assert.equal(S[2].parent_set_id, S[1].id);
  assert.deepEqual(S.map(x => x.rir), [null, 1, null, 0, 2]);
  assert.deepEqual(S.map(x => x.effort_source), [null, 'logged', null, 'legacy', 'copied_prev']);
  assert.equal(S[1].completed_at, '2026-10-25T18:00:00.000Z'); assert.equal(S[2].rest_before_s, 10);
  assert.equal(r.entries[0].exercise_id, 3); assert.equal(r.entries[0].kind, 'isolation');
  const again = C.toV2Rows(s, 'u');
  assert.deepEqual(again.sets.map(x => x.id), S.map(x => x.id), 'los ids no cambian al volver a guardar');
});

t('v2: valores imposibles del historial (RPE 14, peso negativo, 150 reps) no rompen nada', () => {
  assert.equal(C.setRir({ kg: 55, reps: 55, rpe: 14, done: true }), null);
  assert.equal(C.setRir({ kg: 55, reps: 10, rpe: 0.5, done: true }), null);
  const s = { id: 9, date: '2026-09-01', name: 'X', exercises: [{ name: 'Curl', muscle: 'Bíceps', sets: [
    { kg: 55, reps: 55, rpe: 14, done: true }, { kg: -5, reps: 150, rpe: 8, done: true, restS: -3, doneAt: 'ayer' }] }] };
  const S = C.toV2Rows(s, 'u').sets;
  assert.deepEqual([S[0].load_kg, S[0].reps, S[0].rpe, S[0].rir, S[0].effort_source], [55, 55, null, null, null]);
  assert.deepEqual([S[1].load_kg, S[1].reps, S[1].rpe, S[1].rir, S[1].rest_before_s, S[1].completed_at], [null, null, 8, 2, null, null]);
});

// ── Health Connect → biometría diaria (zona horaria de Madrid) ──
t('salud: sueño al día en que te despiertas, sin fases despierto; pulso, HRV nocturna, peso y pasos sin duplicar', () => {
  const tz = process.env.TZ; process.env.TZ = 'Europe/Madrid'; // el día y la «noche» dependen de la hora local
  try {
  const D = C.healthDaily({
    sleep: [{ startDate: '2026-10-24T22:30:00Z', endDate: '2026-10-25T06:00:00Z', value: 450,
      stages: [{ stage: 'light', durationMinutes: 240 }, { stage: 'deep', durationMinutes: 90 }, { stage: 'rem', durationMinutes: 80 }, { stage: 'awake', durationMinutes: 40 }] }],
    restingHeartRate: [{ startDate: '2026-10-25T05:00:00Z', value: 54 }, { startDate: '2026-10-25T20:00:00Z', value: 58 }],
    heartRateVariability: [{ startDate: '2026-10-25T03:00:00Z', value: 48 }, { startDate: '2026-10-25T04:00:00Z', value: 52 }, { startDate: '2026-10-25T15:00:00Z', value: 30 }],
    weight: [{ startDate: '2026-10-25T06:10:00Z', value: 78.4 }, { startDate: '2026-10-25T19:00:00Z', value: 79.1 }],
    steps: [{ startDate: '2026-10-25T10:00:00Z', value: 5000, sourceId: 'mi' }, { startDate: '2026-10-25T16:00:00Z', value: 4000, sourceId: 'mi' }, { startDate: '2026-10-25T10:00:00Z', value: 8500, sourceId: 'phone' }],
  });
  assert.equal(D.length, 1);
  const d = D[0];
  assert.equal(d.date, '2026-10-25'); assert.equal(d.sleepMin, 410); assert.equal(d.sleepEff, .91);
  assert.equal(d.rhr, 56); assert.equal(d.hrv, 50); assert.equal(d.weight, 79.1); assert.equal(d.steps, 9000);
  } finally { if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz; }
});
t('salud: pulso de cada serie con su hora', () => {
  const t0 = Date.parse('2026-10-25T18:00:00Z');
  const ss = [{ exercises: [{ sets: [{ kg: 80, reps: 8, done: true, doneAt: t0 }, { kg: 80, reps: 8, done: true }] }] }];
  const hr = [-40, -20, -5, 3, 60].map((s, i) => ({ startDate: new Date(t0 + s * 1000).toISOString(), value: 120 + i * 10 }));
  assert.equal(C.attachSetHr(ss, hr), 1);
  assert.deepEqual(ss[0].exercises[0].sets[0].hr, { avg: 140, max: 150 }); // −20 s, −5 s y +3 s (la de −40 s queda fuera)
  assert.equal(ss[0].exercises[0].sets[1].hr, undefined);
});

t('volumen: MEV/MAV/MRV caen en la misma posición de la barra para cualquier músculo', () => {
  for (const lm of [{ mev: 6, mav: 12, mrv: 18 }, { mev: 10, mav: 18, mrv: 25 }, { mev: 2, mav: 8, mrv: 12 }, { mev: 4, mav: 4, mrv: 9 }]) {
    assert.equal(C.volPos(lm.mev, lm), C.VOL_POS.mev); assert.equal(C.volPos(lm.mrv, lm), C.VOL_POS.mrv);
    if (lm.mav > lm.mev) assert.equal(C.volPos(lm.mav, lm), C.VOL_POS.mav);
    assert.equal(C.volPos(0, lm), 0); assert.equal(C.volPos(999, lm), 100);
    let prev = -1; for (let v = 0; v <= lm.mrv * 1.5; v += 0.5) { const p = C.volPos(v, lm); assert.ok(p >= prev && p <= 100); prev = p; }
  }
  assert.ok(C.volPos(12.5, { mev: 6, mav: 12, mrv: 18 }) > C.VOL_POS.mav);
});
t('reparto semanal: grupos por patrón, suma = series efectivas y cociente tirón/empuje', () => {
  const by = { 'Tríceps': 12.5, 'Bíceps': 12, 'Glúteos': 10, 'Cuádriceps': 10, 'Isquiosurales': 9, 'Espalda': 9, 'Pectoral': 9, 'Deltoides anterior': 8.5, 'Deltoides lateral': 8, 'Gemelo/Sóleo': 6, 'Aductores': 5.5, 'Deltoides posterior': 1.5, 'Antebrazo': 1.5, 'Abdomen': 3 };
  const G = C.groupSets(by), g = Object.fromEntries(G.grupos.map(x => [x.g, x.v]));
  assert.deepEqual(g, { Empuje: 38, 'Tirón': 24, Piernas: 40.5, Core: 3 });
  assert.equal(G.total, Object.values(by).reduce((a, b) => a + b, 0));
  assert.equal(G.pullPush, 24 / 38);
  assert.equal(C.groupSets({}).pullPush, null);
  assert.equal(C.muscleGroup('Bíceps femoral'), 'Piernas');
});

console.log(`\n${ok}/${ok + fail} OK`);
process.exit(fail ? 1 : 0);
