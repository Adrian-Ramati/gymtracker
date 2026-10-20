// Informe semanal en modo prueba (sin Supabase, IA ni email): semana correcta, índice y PDF.
// Requiere las dependencias de scripts/ (npm install --prefix scripts).
// Ejecutar: node tests/test_report.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import PPCore from '../js/core.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIX = join(ROOT, 'tests/fixtures/report.json');
const OUT = join(ROOT, 'scripts/out');
let ok = 0, fail = 0;
const t = (name, fn) => { try { fn(); ok++; } catch (e) { fail++; console.log('FAIL ' + name + '\n  ' + e.message); } };

function run(now, extra = {}) {
  rmSync(OUT, { recursive: true, force: true });
  const env = { PATH: process.env.PATH, HOME: process.env.HOME, REPORT_DRY_RUN: '1', REPORT_FIXTURE: FIX, REPORT_NOW: now, ...extra };
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts/weekly-report.mjs')], { env, encoding: 'utf8', timeout: 60000 });
  const m = (r.stdout || '').match(/semana (\S+) a (\S+) · (\d+) sesiones · índice (\S+)/);
  return { r, start: m?.[1], end: m?.[2], n: m && +m[3], score: m?.[4], html: existsSync(join(OUT, 'informe.html')) ? readFileSync(join(OUT, 'informe.html'), 'utf8') : '' };
}

// Cron real: domingo 23:30 UTC (ya es lunes en Madrid). Debe informar de la semana que termina.
const winter = run('2026-10-25T23:30:00Z');
t('R1. El script termina sin errores y sin credenciales', () => assert.equal(winter.r.status, 0, winter.r.stderr));
t('R2. Cron de invierno: informa de la semana 19–25/10, no de la siguiente (vacía)', () => { assert.equal(winter.start, '2026-10-19'); assert.equal(winter.end, '2026-10-25'); assert.ok(winter.n > 0); });
t('R3. El email incluye el índice con la misma nota que calcula la app', () => {
  const fx = JSON.parse(readFileSync(FIX, 'utf8'));
  // Igual que la app al cargar (state.js): e1RM de cada ejercicio con la tabla RTS
  fx.sessions.forEach(s => s.exercises.forEach(ex => {
    const rms = (ex.sets || []).filter(x => x.kg && x.reps).map(x => PPCore.calcE1RM(x.kg, x.reps, x.rpe)).filter(Boolean);
    ex.best_e1rm = rms.length ? Math.max(...rms) : null;
  }));
  const R = PPCore.computeHyperIndex({ sessions: fx.sessions, templates: fx.profile.templates, profile: { ...fx.profile.settings }, end: '2026-10-25' });
  assert.ok(winter.html.includes('Índice de hipertrofia'));
  assert.equal(winter.score, String(R.score));
  assert.ok(winter.html.includes(`>${R.score}</td>`));
});
t('R4. El email muestra los 5 componentes del índice', () => Object.values(PPCore.HI_NAMES).forEach(n => assert.ok(winter.html.includes(n), n)));
t('R5. El email trae entre 1 y 3 recomendaciones', () => {
  const ol = winter.html.split('Qué cambiar')[1].split('</ol>')[0];
  const n = (ol.match(/<li/g) || []).length;
  assert.ok(n >= 1 && n <= 3, String(n));
});
t('R6. Se genera el PDF de la semana', () => {
  const pdf = join(OUT, 'informe-2026-10-25.pdf');
  assert.ok(existsSync(pdf));
  const b = readFileSync(pdf);
  assert.equal(b.subarray(0, 4).toString(), '%PDF'); assert.ok(b.length > 10000);
});
t('R7. El análisis de la IA no se pide en modo prueba', () => assert.ok(winter.html.includes('Modo prueba')));

// Horario de verano (UTC+2): el cron cae el lunes a la 01:30 en Madrid.
const summer = run('2026-10-18T23:30:00Z');
t('R8. Cron de verano: informa de la semana 12–18/10', () => { assert.equal(summer.r.status, 0, summer.r.stderr); assert.equal(summer.start, '2026-10-12'); assert.equal(summer.end, '2026-10-18'); });
// Lanzado a mano a mitad de semana: la semana en curso (como antes).
const midweek = run('2026-10-21T10:00:00Z');
t('R9. Lanzado a mano un miércoles: semana en curso', () => { assert.equal(midweek.start, '2026-10-19'); assert.equal(midweek.end, '2026-10-25'); });
// WEEK_OFFSET sigue funcionando
const prev = run('2026-10-25T23:30:00Z', { WEEK_OFFSET: '-1' });
t('R10. WEEK_OFFSET=-1 informa de la semana anterior', () => { assert.equal(prev.start, '2026-10-12'); assert.equal(prev.end, '2026-10-18'); });

rmSync(OUT, { recursive: true, force: true });
console.log(`\n${ok}/${ok + fail} OK`); process.exit(fail ? 1 : 0);
