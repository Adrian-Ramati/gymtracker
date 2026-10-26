// IHO: el port en JS (js/core.js) debe dar lo mismo que la implementación de referencia en Python
// (scripts/iho_reference.py) en los cuatro escenarios simulados. Ejecutar: node tests/test_iho_oracle.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import C from '../js/core.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const py = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-I', join(ROOT, 'scripts/iho_reference.py'), '--export'], { encoding: 'utf8', maxBuffer: 64 << 20 });
if (py.status !== 0) { console.log('FAIL no se pudo ejecutar la referencia Python\n', py.stderr); process.exit(1); }
const { scenarios } = JSON.parse(py.stdout);

let ok = 0, fail = 0;
const t = (name, fn) => { try { fn(); ok++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, '\n   ', e.message); } };
const near = (a, b, tol, what) => {
  if (a == null || b == null) return assert.equal(a, b, what);
  assert.ok(Math.abs(a - b) <= tol, `${what}: JS ${a.toFixed?.(3) ?? a} vs Python ${b.toFixed?.(3) ?? b}`);
};

for (const sc of scenarios) {
  const R = C.computeHyperIndex({ sessions: sc.sessions, templates: sc.templates, profile: {}, end: sc.end, biometrics: sc.biometrics });
  const E = sc.expected;
  t(`${sc.name}: componentes iguales (±0,1)`, () => ['vol', 'int', 'prog', 'adh', 'den'].forEach(k => near(R.comp[k].score, E[k], 0.1, k)));
  t(`${sc.name}: β, Φ y readiness iguales`, () => { near(R.beta, E.beta, 0.001, 'β'); near(R.phi, E.phi, 0.05, 'Φ'); near(R.readiness, E.readiness, 0.001, 'R̄'); near(R.alignment, E.alignment, 0.001, 'Ā'); });
  t(`${sc.name}: nota ${E.score} y estado «${E.label}»`, () => { assert.equal(R.score, E.score); assert.equal(R.label, E.label); assert.equal(R.risk, E.risk); });
}
console.log(`\n${ok}/${ok + fail} OK`);
process.exit(fail ? 1 : 0);
