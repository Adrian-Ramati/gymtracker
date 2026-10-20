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
t('índice: escenario óptimo ≥ 85', () => {
  const R = C.computeHyperIndex(optimal('2026-10-20'));
  assert.ok(R.score >= 85, `score ${R.score}`);
  assert.equal(R.comp.adh.cr, 1);
});
t('índice: pesos suman 1 y frecuencia es el menor', () => {
  const w = Object.values(C.HI_W); assert.equal(Math.round(w.reduce((a, b) => a + b, 0) * 100), 100);
  assert.equal(Math.min(...w), C.HI_W.freq);
});
t('índice: los secundarios suman 0,5 al volumen (tríceps recibe del press)', () => {
  const R = C.computeHyperIndex(optimal('2026-10-20'));
  const tri = R.muscles.find(m => m.m === 'Tríceps'), pec = R.muscles.find(m => m.m === 'Pectoral');
  // el único aporte indirecto al tríceps es el press de pecho: debe sumar exactamente la mitad de sus series
  assert.ok(Math.abs((tri.v - tri.rv) - .5 * pec.rv) < .01, `tríceps ${tri.v} (directas ${tri.rv}) · press ${pec.rv}`);
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
  assert.ok(R1.score >= 85, `score ${R1.score}`);
});
t('índice: escenario pobre < 50 con recomendaciones priorizadas', () => {
  const end = '2026-10-20', M = ['Pectoral', 'Espalda', 'Cuádriceps', 'Isquiosurales', 'Glúteos', 'Bíceps'];
  const templates = [{ name: 'Full', exercises: M.map(m => ({ name: 'Ej ' + m, muscle: m, sets: 6 })) }, { name: 'X', exercises: [] }, { name: 'Y', exercises: [] }];
  const sessions = [0, 7, 14, 21, 28, 35].map((d, i) => mkS(C.addDays(end, -d), 'Full', M.map(m => ['Ej ' + m, m, 3, 5, 60 + i * .4])));
  const R = C.computeHyperIndex({ sessions, templates, profile: {}, end });
  assert.ok(R.score < 50, `score ${R.score}`);
  assert.match(R.recs[0].t, /no cuentan como series efectivas/);
});
t('índice: sin datos suficientes', () => {
  const R = C.computeHyperIndex({ sessions: [], templates: [], profile: {}, end: '2026-10-20' });
  assert.equal(R.score, null); assert.equal(R.insufficient, true);
});

console.log(`\n${ok}/${ok + fail} OK`);
process.exit(fail ? 1 : 0);
