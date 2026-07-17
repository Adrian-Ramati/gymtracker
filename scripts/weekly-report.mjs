// scripts/weekly-report.mjs
// Genera el informe semanal de Peak Physique y lo envía por email vía Resend.
// Se ejecuta desde GitHub Actions (ver .github/workflows/weekly-report.yml).

import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

// ─── 1. Comprobar que son las 19:00 en Madrid (evita duplicados por DST) ────
const madridHour = Number(
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    hour12: false,
  }).format(new Date())
);

if (madridHour !== 19) {
  console.log(`Hora actual en Madrid: ${madridHour}h. No son las 19:00, no se envía nada.`);
  process.exit(0);
}

// ─── 2. Config y cliente Supabase ───────────────────────────────────────────
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  SUPABASE_USER_ID,
  RESEND_API_KEY,
  REPORT_EMAIL_TO,
  REPORT_EMAIL_FROM,
} = process.env;

for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, REPORT_EMAIL_TO, REPORT_EMAIL_FROM })) {
  if (!v) { console.error(`Falta la variable de entorno ${k}`); process.exit(1); }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── 3. Rango de la semana (lunes a domingo, hora Madrid) ──────────────────
function madridDateParts(d) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(d); // YYYY-MM-DD
}
const today = new Date();
const todayStr = madridDateParts(today);
const weekAgo = new Date(today.getTime() - 7 * 24 * 3600 * 1000);
const weekAgoStr = madridDateParts(weekAgo);

// ─── 4. Cargar sesiones ──────────────────────────────────────────────────────
let query = supabase.from('sessions').select('*').order('date', { ascending: true });
if (SUPABASE_USER_ID) query = query.eq('user_id', SUPABASE_USER_ID);
const { data: allSessions, error } = await query;
if (error) { console.error('Error leyendo sesiones de Supabase:', error.message); process.exit(1); }

const sessions = allSessions || [];
const weekSessions = sessions.filter(s => s.date >= weekAgoStr && s.date <= todayStr);

// ─── 5. Cálculo de e1RM (misma fórmula que la app: Epley ajustada por RIR) ──
function calcE1RM(kg, reps, rpe) {
  if (!kg || !reps) return null;
  const rir = rpe ? Math.max(0, 10 - rpe) : 0;
  const effectiveReps = reps + rir;
  if (effectiveReps <= 1) return Math.round(kg * 10) / 10;
  return Math.round(kg * (1 + effectiveReps / 30) * 10) / 10;
}

// ─── 6. Mejor e1RM histórico de cada ejercicio ANTES de esta semana ─────────
const bestBefore = {};
sessions.filter(s => s.date < weekAgoStr).forEach(s => {
  (s.exercises || []).forEach(ex => {
    const rms = (ex.sets || []).map(st => calcE1RM(st.kg, st.reps, st.rpe)).filter(Boolean);
    const localBest = ex.best_e1rm || (rms.length ? Math.max(...rms) : 0);
    if (localBest > (bestBefore[ex.name] || 0)) bestBefore[ex.name] = localBest;
  });
});

// ─── 7. PRs conseguidos esta semana ──────────────────────────────────────────
const prs = [];
const bestThisWeek = {};
weekSessions.forEach(s => {
  (s.exercises || []).forEach(ex => {
    const rms = (ex.sets || []).map(st => calcE1RM(st.kg, st.reps, st.rpe)).filter(Boolean);
    const localBest = ex.best_e1rm || (rms.length ? Math.max(...rms) : 0);
    if (!localBest) return;
    if (localBest > (bestThisWeek[ex.name] || 0)) bestThisWeek[ex.name] = localBest;
  });
});
Object.entries(bestThisWeek).forEach(([name, val]) => {
  const prev = bestBefore[name] || 0;
  if (val > prev) prs.push({ name, prev, val, diff: Math.round((val - prev) * 10) / 10 });
});
prs.sort((a, b) => b.diff - a.diff);

// ─── 8. Volumen semanal por músculo (nº de series) ──────────────────────────
function normMuscle(m) { return m === 'Isquiotibiales' ? 'Isquiosurales' : m; }
const volByMuscle = {};
weekSessions.forEach(s => {
  (s.exercises || []).forEach(ex => {
    const m = normMuscle(ex.muscle || 'Otro');
    const sets = (ex.sets || []).filter(st => st.done || st.kg).length;
    volByMuscle[m] = (volByMuscle[m] || 0) + sets;
  });
});
const totalSets = Object.values(volByMuscle).reduce((a, b) => a + b, 0);

// ─── 9. Progresión por ejercicio: última sesión de la semana vs sesión anterior a esa ──
const progression = [];
const exercisesThisWeek = [...new Set(weekSessions.flatMap(s => (s.exercises || []).map(e => e.name)))];
exercisesThisWeek.forEach(name => {
  const history = sessions
    .filter(s => (s.exercises || []).some(e => e.name === name))
    .sort((a, b) => a.date.localeCompare(b.date));
  const idx = history.findIndex(s => s.date >= weekAgoStr);
  if (idx <= 0) return; // no hay sesión anterior con la que comparar
  const getRM = (s) => {
    const ex = s.exercises.find(e => e.name === name);
    const rms = (ex.sets || []).map(st => calcE1RM(st.kg, st.reps, st.rpe)).filter(Boolean);
    return ex.best_e1rm || (rms.length ? Math.max(...rms) : 0);
  };
  const before = getRM(history[idx - 1]);
  const afterCandidates = history.slice(idx).map(getRM).filter(Boolean);
  if (!before || !afterCandidates.length) return;
  const after = afterCandidates[afterCandidates.length - 1];
  progression.push({ name, before, after, diff: Math.round((after - before) * 10) / 10 });
});
progression.sort((a, b) => b.diff - a.diff);
const improved = progression.filter(p => p.diff > 0);
const worsened = progression.filter(p => p.diff < 0);

// ─── 10. Generar PDF ─────────────────────────────────────────────────────────
function fmtDate(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

const pdfBuffer = await new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', c => chunks.push(c));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(20).fillColor('#111').text('Peak Physique — Informe semanal', { align: 'left' });
  doc.fontSize(11).fillColor('#666').text(`Semana del ${fmtDate(weekAgoStr)} al ${fmtDate(todayStr)}`);
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#111').text('Resumen');
  doc.fontSize(11).fillColor('#333');
  doc.text(`Sesiones completadas: ${weekSessions.length}`);
  doc.text(`Series totales: ${totalSets}`);
  doc.text(`PRs conseguidos: ${prs.length}`);
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#111').text('🏆 PRs de la semana');
  doc.fontSize(11).fillColor('#333');
  if (prs.length) {
    prs.forEach(p => doc.text(`• ${p.name}: ${p.prev} kg → ${p.val} kg e1RM  (+${p.diff} kg)`));
  } else {
    doc.fillColor('#999').text('Sin PRs esta semana.');
  }
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#111').text('Volumen por grupo muscular (series)');
  doc.fontSize(11).fillColor('#333');
  if (Object.keys(volByMuscle).length) {
    Object.entries(volByMuscle).sort((a, b) => b[1] - a[1]).forEach(([m, v]) => doc.text(`• ${m}: ${v} series`));
  } else {
    doc.fillColor('#999').text('Sin datos de volumen esta semana.');
  }
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#111').text('📈 Dónde has mejorado');
  doc.fontSize(11).fillColor('#333');
  if (improved.length) {
    improved.forEach(p => doc.text(`• ${p.name}: ${p.before} kg → ${p.after} kg e1RM  (+${p.diff} kg)`));
  } else {
    doc.fillColor('#999').text('Sin mejoras registradas esta semana.');
  }
  doc.moveDown(1);

  doc.fontSize(14).fillColor('#111').text('📉 Dónde has bajado');
  doc.fontSize(11).fillColor('#333');
  if (worsened.length) {
    worsened.forEach(p => doc.text(`• ${p.name}: ${p.before} kg → ${p.after} kg e1RM  (${p.diff} kg)`));
  } else {
    doc.fillColor('#999').text('Sin retrocesos registrados esta semana.');
  }

  doc.end();
});

// ─── 11. Enviar email vía Resend ─────────────────────────────────────────────
const pdfBase64 = pdfBuffer.toString('base64');

const emailHtml = `
  <div style="font-family:sans-serif;color:#111">
    <h2>Peak Physique — Informe semanal</h2>
    <p>Semana del ${fmtDate(weekAgoStr)} al ${fmtDate(todayStr)}</p>
    <ul>
      <li><strong>${weekSessions.length}</strong> sesiones completadas</li>
      <li><strong>${totalSets}</strong> series totales</li>
      <li><strong>${prs.length}</strong> PRs conseguidos</li>
    </ul>
    <p>Detalle completo en el PDF adjunto.</p>
  </div>
`;

const resendResp = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: REPORT_EMAIL_FROM,
    to: [REPORT_EMAIL_TO],
    subject: `Informe semanal Peak Physique — ${fmtDate(weekAgoStr)} a ${fmtDate(todayStr)}`,
    html: emailHtml,
    attachments: [
      {
        filename: `informe-semanal-${todayStr}.pdf`,
        content: pdfBase64,
      },
    ],
  }),
});

if (!resendResp.ok) {
  const body = await resendResp.text();
  console.error('Error enviando email:', resendResp.status, body);
  process.exit(1);
}

console.log('Informe semanal enviado correctamente ✓');
