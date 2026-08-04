// scripts/weekly-report.mjs
// Informe semanal Peak Physique — PDF (tema oscuro, logo, badges, tablas con píldoras,
// gráfico con línea de media, ranking de e1RM) + análisis IA en el email.
// Se ejecuta desde GitHub Actions (ver .github/workflows/weekly-report.yml).

import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LOGO_BASE64 } from './logo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Paleta (tema oscuro de la app) ──────────────────────────────────────────
const C = {
  bg: '#0a0a0a', card: '#141414', card2: '#1a1a1a', line: '#262626', text: '#f2f2f2',
  dim: '#9ca3af', faint: '#6b7280', blue: '#4f8ef7', green: '#34d399',
  red: '#f87171', amber: '#fbbf24',
};
const MUSCLE_COLOR = {
  'Pectoral':'#4f8ef7','Espalda':'#22d3ee','Tríceps':'#ef4444','Bíceps':'#f472b6',
  'Glúteos':'#14b8a6','Isquiosurales':'#86efac','Cuádriceps':'#4ade80','Gemelos':'#a78bfa',
  'Deltoides anterior':'#fbbf24','Deltoides lateral':'#fb923c','Deltoides posterior':'#d946ef',
  'Sóleo':'#7c6ee6','Aductores':'#9ca3af','Abductores':'#6b7280','Trapecio':'#22d3ee',
  'Antebrazo':'#f472b6','Abdomen':'#86efac','Gemelo/Sóleo':'#a78bfa',
};
const mColor = (m) => MUSCLE_COLOR[m] || C.blue;

// ─── Landmarks MEV/MAV/MRV (mismos valores por defecto que la app) ──────────
const DEFAULT_LANDMARKS = {
  'Pectoral':{mev:8,mav:16,mrv:22}, 'Espalda':{mev:10,mav:18,mrv:25},
  'Tríceps':{mev:6,mav:12,mrv:18}, 'Bíceps':{mev:8,mav:14,mrv:20},
  'Glúteos':{mev:4,mav:12,mrv:16}, 'Isquiosurales':{mev:6,mav:12,mrv:16},
  'Cuádriceps':{mev:8,mav:14,mrv:20}, 'Gemelos':{mev:8,mav:14,mrv:20},
  'Sóleo':{mev:6,mav:10,mrv:16}, 'Deltoides anterior':{mev:2,mav:8,mrv:12},
  'Deltoides lateral':{mev:8,mav:18,mrv:26}, 'Deltoides posterior':{mev:6,mav:14,mrv:22},
  'Aductores':{mev:4,mav:8,mrv:12}, 'Abductores':{mev:4,mav:8,mrv:12},
};

// ─── 1. Comprobar hora Madrid (o forzar) ─────────────────────────────────────
const forceSend = process.env.FORCE_SEND === 'true';
const madridHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false }).format(new Date()));
if (!forceSend && madridHour !== 19) {
  console.log(`Hora Madrid: ${madridHour}h. No son las 19:00, no se envía.`);
  process.exit(0);
}
if (forceSend) console.log('FORCE_SEND activo: se salta la comprobación de hora.');

// ─── 2. Env + cliente Supabase ───────────────────────────────────────────────
const {
  SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_USER_ID,
  RESEND_API_KEY, REPORT_EMAIL_TO, REPORT_EMAIL_FROM,
  ANTHROPIC_API_KEY,
} = process.env;

for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, REPORT_EMAIL_TO, REPORT_EMAIL_FROM, ANTHROPIC_API_KEY }))
  if (!v) { console.error(`Falta la variable ${k}`); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

// ─── 3. Semanas lunes→domingo (hora Madrid), con offset opcional ────────────
function madridYMD(d) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const todayYMD = madridYMD(new Date());
const [ty, tm, td] = todayYMD.split('-').map(Number);
const todayMid = new Date(Date.UTC(ty, tm - 1, td));
const dow = todayMid.getUTCDay();
const daysSinceMonday = (dow + 6) % 7;
const weekOffset = Number(process.env.WEEK_OFFSET || 0);

const monThis = new Date(todayMid); monThis.setUTCDate(todayMid.getUTCDate() - daysSinceMonday + weekOffset * 7);
const sunThis = new Date(monThis); sunThis.setUTCDate(monThis.getUTCDate() + 6);
const monPrev = new Date(monThis); monPrev.setUTCDate(monThis.getUTCDate() - 7);
const sunPrev = new Date(monPrev); sunPrev.setUTCDate(monPrev.getUTCDate() + 6);
const mon4 = new Date(monThis); mon4.setUTCDate(monThis.getUTCDate() - 28);

const ymd = (d) => d.toISOString().slice(0, 10);
const wkThis = { start: ymd(monThis), end: ymd(sunThis) };
const wkPrev = { start: ymd(monPrev), end: ymd(sunPrev) };
const win4 = { start: ymd(mon4), end: ymd(sunPrev) };

// ─── 4. Cargar sesiones ──────────────────────────────────────────────────────
let query = supabase.from('sessions').select('*').order('date', { ascending: true });
if (SUPABASE_USER_ID) query = query.eq('user_id', SUPABASE_USER_ID);
const { data: allSessions, error } = await query;
if (error) { console.error('Error Supabase:', error.message); process.exit(1); }
const sessions = allSessions || [];

const inRange = (s, r) => s.date >= r.start && s.date <= r.end;
const sThis = sessions.filter(s => inRange(s, wkThis));
const sPrev = sessions.filter(s => inRange(s, wkPrev));
const s4 = sessions.filter(s => inRange(s, win4));

// ─── 5. e1RM ─────────────────────────────────────────────────────────────────
function calcE1RM(kg, reps, rpe) {
  if (!kg || !reps) return null;
  const rir = rpe ? Math.max(0, 10 - rpe) : 0;
  const eff = reps + rir;
  if (eff <= 1) return Math.round(kg * 10) / 10;
  return Math.round(kg * (1 + eff / 30) * 10) / 10;
}
function normMuscle(m) { return m === 'Isquiotibiales' ? 'Isquiosurales' : (m || 'Otro'); }

// ─── 6. Volumen por músculo ──────────────────────────────────────────────────
function volByMuscle(list) {
  const v = {};
  list.forEach(s => (s.exercises || []).forEach(ex => {
    const m = normMuscle(ex.muscle);
    v[m] = (v[m] || 0) + (ex.sets || []).filter(st => st.done || st.kg).length;
  }));
  return v;
}
const volThis = volByMuscle(sThis);
const volPrev = volByMuscle(sPrev);
const vol4raw = volByMuscle(s4);
const vol4avg = {}; Object.keys(vol4raw).forEach(m => vol4avg[m] = Math.round((vol4raw[m] / 4) * 10) / 10);
const allMuscles = [...new Set([...Object.keys(volThis), ...Object.keys(volPrev), ...Object.keys(vol4avg)])]
  .sort((a, b) => (volThis[b] || 0) - (volThis[a] || 0));
const totalThis = Object.values(volThis).reduce((a, b) => a + b, 0);
const totalPrev = Object.values(volPrev).reduce((a, b) => a + b, 0);
const total4avg = Object.values(vol4avg).reduce((a, b) => a + b, 0);

// (trendGlyphs definida más abajo junto a las utilidades de dibujo)

// ─── 7. Mejor set por ejercicio en una semana ────────────────────────────────
function bestPerExercise(list) {
  const out = {};
  list.forEach(s => (s.exercises || []).forEach(ex => {
    (ex.sets || []).forEach(st => {
      const rm = calcE1RM(st.kg, st.reps, st.rpe);
      if (!rm) return;
      if (!out[ex.name] || rm > out[ex.name].e1rm) out[ex.name] = { e1rm: rm, kg: st.kg, reps: st.reps, rpe: st.rpe, muscle: normMuscle(ex.muscle) };
    });
  }));
  return out;
}
const exThis = bestPerExercise(sThis);
const exPrev = bestPerExercise(sPrev);

// ─── 8. PRs de la semana ──────────────────────────────────────────────────────
const bestBefore = {};
sessions.filter(s => s.date < wkThis.start).forEach(s => (s.exercises || []).forEach(ex => {
  (ex.sets || []).forEach(st => { const rm = calcE1RM(st.kg, st.reps, st.rpe); if (rm && rm > (bestBefore[ex.name] || 0)) bestBefore[ex.name] = rm; });
}));
const prs = [];
Object.entries(exThis).forEach(([name, d]) => {
  const prev = bestBefore[name] || 0;
  if (d.e1rm > prev) prs.push({ name, prev, val: d.e1rm, diff: Math.round((d.e1rm - prev) * 10) / 10, muscle: d.muscle });
});
prs.sort((a, b) => b.diff - a.diff);

// ─── 9. Comparativa de ejercicios (esta semana) ──────────────────────────────
const exNames = Object.keys(exThis).sort((a, b) => a.localeCompare(b, 'es'));
const exCompare = exNames.map(name => {
  const t = exThis[name], p = exPrev[name] || null;
  const diff = p ? Math.round((t.e1rm - p.e1rm) * 10) / 10 : null;
  return { name, muscle: t.muscle, thisW: t, prevW: p, diff };
});
const ranked = exCompare.filter(e => e.diff !== null).sort((a, b) => b.diff - a.diff);

// ─── 10. Historial reciente por ejercicio (contexto para la IA) ─────────────
function recentHistory(name, n = 6) {
  return sessions
    .filter(s => (s.exercises || []).some(e => e.name === name))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n)
    .reverse()
    .map(s => {
      const ex = s.exercises.find(e => e.name === name);
      const best = (ex.sets || []).reduce((acc, st) => {
        const rm = calcE1RM(st.kg, st.reps, st.rpe);
        return rm && (!acc || rm > acc.rm) ? { rm, kg: st.kg, reps: st.reps, rpe: st.rpe } : acc;
      }, null);
      return { date: s.date, ...best };
    })
    .filter(h => h.rm);
}

// ─── 11. Leer notas de feedback del usuario ──────────────────────────────────
let coachNotes = '';
try { coachNotes = readFileSync(join(__dirname, 'coach-notes.md'), 'utf8'); }
catch { coachNotes = '(sin notas)'; }

// ─── 12. Payload de datos para la IA ─────────────────────────────────────────
const aiPayload = {
  semana: `${wkThis.start} a ${wkThis.end}`,
  volumen_por_musculo: allMuscles.map(m => ({
    musculo: m, esta_semana: volThis[m] || 0, semana_pasada: volPrev[m] || 0, media_4_semanas: vol4avg[m] || 0,
    mev: DEFAULT_LANDMARKS[m]?.mev ?? null, mav: DEFAULT_LANDMARKS[m]?.mav ?? null, mrv: DEFAULT_LANDMARKS[m]?.mrv ?? null,
  })),
  ejercicios_esta_semana: exNames.map(name => ({ nombre: name, musculo: exThis[name].muscle, historial_reciente: recentHistory(name) })),
  prs_esta_semana: prs,
};

// ─── 13. Prompt del entrenador (4 secciones) ─────────────────────────────────
const SYSTEM_PROMPT = `Actúa como un entrenador personal, biomecánico y especialista en hipertrofia de alto nivel. Tu objetivo es analizar el historial de entrenamiento de esta semana (con contexto de semanas previas) y dar recomendaciones precisas sobre si se debe mantener, modificar o cambiar los ejercicios, ajustar el volumen de trabajo o pulir la selección de ejercicios.

MARCO TEÓRICO Y REGLAS DE PROGRESIÓN (aplícalas estrictamente):

Modelo de Progresión (Double Progression): la meta es alcanzar la parte alta del rango objetivo de repeticiones en todas las series de un ejercicio manteniendo la misma carga y un RIR 1-2. Una vez completado el techo de repeticiones con buena técnica, se sube el peso en la siguiente sesión y el conteo de repeticiones vuelve a caer al rango bajo. Si un ejercicio no progresa en repeticiones ni en peso durante 3-4 sesiones consecutivas (o la progresión es errática), proponlo para cambio o sustitución estratégica.

Criterio MEV-MAV-MRV (Volumen Efectivo): MEV = volumen mínimo efectivo, MAV = rango adaptativo óptimo, MRV = volumen máximo recuperable. Evalúa si el volumen semanal por grupo muscular está por debajo del MEV, dentro del MEV-MAV (productivo), en zona MAV-MRV (alta fatiga) o por encima del MRV.

Análisis Biomecánico y Redundancia: a partir del NOMBRE de cada ejercicio, razona qué porción/cabeza muscular trabaja prioritariamente y en qué perfil de resistencia actúa (acortamiento, estiramiento o perfil plano). Identifica redundancias entre ejercicios de la misma semana que enfaticen la misma porción con la misma curva de fuerza, y lagunas de cabezas musculares desatendidas.

ESTRUCTURA DE TU RESPUESTA (usa exactamente estos 4 apartados, en Markdown simple con ## para cada título):

## 1. Análisis de Progresión
Ejercicio por ejercicio (solo los trabajados esta semana), usando el historial reciente proporcionado. Dictamen directo y en negrita: **MANTENER**, **SUBIR PESO**, o **CAMBIAR/REEMPLAZAR**, justificando brevemente.

## 2. Auditoría Biomecánica y Redundancias
Desglose breve por grupo muscular trabajado esta semana: énfasis por cabezas/porciones, redundancias si las hay, huecos de estímulo.

## 3. Volumen Semanal (MEV-MAV-MRV)
Para cada músculo con datos, indica en qué zona está (por debajo de MEV / productivo MEV-MAV / alta fatiga MAV-MRV / por encima de MRV) y si hace falta ajustar.

## 4. Diagnóstico Priorizado
Lista de 2-4 acciones concretas y priorizadas para la próxima semana, la más importante primero.

Tono: directo, técnico pero claro, sin relleno ni frases de ánimo genéricas. Responde en español. Sé conciso — esto es un informe semanal recurrente, no un audit completo desde cero; ve al grano en cada sección (2-5 frases por ejercicio o músculo, no más).

NOTAS DEL USUARIO (ten en cuenta esto, tiene prioridad sobre el tono/enfoque por defecto):
${coachNotes}`;

// ─── 14. Llamar a la API de Claude ───────────────────────────────────────────
let aiAnalysisMarkdown = null;
let aiErrorDetail = null;
try {
  const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Datos de la semana (JSON):\n${JSON.stringify(aiPayload, null, 2)}` }],
    }),
  });
  const rawText = await aiResp.text();
  if (!aiResp.ok) {
    aiErrorDetail = `HTTP ${aiResp.status}: ${rawText.slice(0, 300)}`;
    console.error('Error API Anthropic:', aiErrorDetail);
  } else {
    const aiData = JSON.parse(rawText);
    aiAnalysisMarkdown = aiData.content?.[0]?.text || null;
    if (!aiAnalysisMarkdown) { aiErrorDetail = `Respuesta sin texto: ${rawText.slice(0, 300)}`; }
  }
} catch (e) {
  aiErrorDetail = `Excepción: ${e.message}`;
  console.error('Fallo llamando a la API de Anthropic:', e);
}
if (!aiAnalysisMarkdown) {
  console.error('DETALLE DEL FALLO DE IA (revisar):', aiErrorDetail);
  aiAnalysisMarkdown = `_(No se pudo generar el análisis de la IA esta semana. Detalle técnico: ${aiErrorDetail || 'desconocido'}. El resto del informe sigue disponible en el PDF adjunto.)_`;
}

function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '', inList = false;
  for (let line of lines) {
    line = line.trim();
    if (!line) { if (inList) { html += '</ul>'; inList = false; } continue; }
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 style="color:#4f8ef7;margin:20px 0 8px;font-size:15px">${line.slice(3)}</h3>`;
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul style="margin:4px 0;padding-left:20px">'; inList = true; }
      html += `<li style="margin-bottom:4px">${boldify(line.slice(2))}</li>`;
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p style="margin:6px 0;line-height:1.5">${boldify(line)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}
function boldify(t) { return t.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f2f2f2">$1</strong>'); }

// ─── 15. Utilidades de dibujo PDF ────────────────────────────────────────────
function fmtDate(str) { const [y, m, d] = str.split('-'); return `${d}/${m}/${y}`; }
const logoBuffer = Buffer.from(LOGO_BASE64, 'base64');

const doc = new PDFDocument({ size: 'A4', margin: 40 });
const chunks = [];
const pdfDone = new Promise((res) => doc.on('end', () => res(Buffer.concat(chunks))));
doc.on('data', c => chunks.push(c));

const PW = doc.page.width, PH = doc.page.height, M = 40;
const CW = PW - M * 2;

function paintBg() { doc.save().rect(0, 0, PW, PH).fill(C.bg).restore(); }
paintBg();
doc.on('pageAdded', paintBg);

function ensure(need) { if (doc.y + need > PH - M) doc.addPage(); }
function heading(txt, color = C.text) { ensure(30); doc.fillColor(color).fontSize(14).font('Helvetica-Bold').text(txt, M, doc.y); doc.moveDown(0.4); }
function sub(txt) { doc.fillColor(C.dim).fontSize(9).font('Helvetica').text(txt); doc.moveDown(0.3); }
function pill(x, y, txt, color) {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const w = doc.widthOfString(txt) + 12;
  doc.save().roundedRect(x, y, w, 14, 7).fillOpacity(0.18).fill(color).restore();
  doc.fillOpacity(1).fillColor(color).text(txt, x + 6, y + 3.5, { width: w - 12, align: 'center' });
  return w;
}

// Iconos simples dibujados a mano (sin librería de iconos)
function iconCalendar(cx, cy, r, color) {
  doc.save().roundedRect(cx - r, cy - r * 0.85, r * 2, r * 1.8, 3).lineWidth(1.6).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx - r, cy - r * 0.35).lineTo(cx + r, cy - r * 0.35).lineWidth(1.2).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx - r * 0.5, cy - r * 1.1).lineTo(cx - r * 0.5, cy - r * 0.6).lineWidth(1.4).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx + r * 0.5, cy - r * 1.1).lineTo(cx + r * 0.5, cy - r * 0.6).lineWidth(1.4).strokeColor(color).stroke().restore();
  [0, 1].forEach(row => [0, 1, 2].forEach(col => {
    doc.save().circle(cx - r * 0.55 + col * r * 0.55, cy + row * r * 0.5, 1.1).fill(color).restore();
  }));
}
function iconDumbbell(cx, cy, r, color) {
  doc.save().rect(cx - r * 0.9, cy - 1.5, r * 1.8, 3).fill(color).restore();
  [-1, 1].forEach(side => {
    doc.save().circle(cx + side * r * 0.95, cy, r * 0.5).fill(color).restore();
  });
}
function iconStar(cx, cy, r, color) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push([cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]);
  }
  doc.save().moveTo(...pts[0]);
  pts.slice(1).forEach(p => doc.lineTo(...p));
  doc.closePath().fill(color).restore();
}
// Triángulo de tendencia (sustituye a los caracteres unicode ↑/↓, no soportados por Helvetica en pdfkit)
function triArrow(x, y, dir, color, size = 4) {
  doc.save();
  if (dir === 'up') { doc.moveTo(x, y - size).lineTo(x - size, y + size).lineTo(x + size, y + size); }
  else { doc.moveTo(x, y + size).lineTo(x - size, y - size).lineTo(x + size, y - size); }
  doc.closePath().fill(color).restore();
}
function trendGlyphs(curr, prev) {
  if (prev === 0 && curr > 0) return { dir: 'up', double: true, c: C.green };
  if (curr === 0 && prev > 0) return { dir: 'down', double: true, c: C.red };
  if (curr > prev) return { dir: 'up', double: false, c: C.green };
  if (curr < prev) return { dir: 'down', double: false, c: C.red };
  return { dir: 'flat', double: false, c: C.dim };
}
// ─── 16. Cabecera ─────────────────────────────────────────────────────────────
doc.image(logoBuffer, M, M, { width: 54, height: 54 });
doc.fillColor(C.text).fontSize(20).font('Helvetica-Bold').text('Informe semanal', M + 66, M + 6);
doc.fillColor(C.blue).fontSize(11).font('Helvetica').text('Peak Physique', M + 66, M + 30);
doc.fillColor(C.dim).fontSize(9).text(`Semana ${fmtDate(wkThis.start)} — ${fmtDate(wkThis.end)}  (lun-dom)`, M + 66, M + 44);
doc.y = M + 74;
doc.save().moveTo(M, doc.y).lineTo(PW - M, doc.y).lineWidth(1).strokeColor(C.line).stroke().restore();
doc.moveDown(0.8);

// ─── 17. Tarjetas de resumen con icono ───────────────────────────────────────
function statCard(x, y, w, icon, label, value, sub2, valColor) {
  const h = 92;
  doc.save().roundedRect(x, y, w, h, 10).fill(C.card).restore();
  const iconCx = x + w / 2, iconCy = y + 26;
  doc.save().circle(iconCx, iconCy, 18).fillOpacity(0.15).fill(valColor || C.blue).restore();
  doc.fillOpacity(1);
  icon(iconCx, iconCy, 9, valColor || C.blue);
  doc.fillColor(C.faint).fontSize(7.5).font('Helvetica-Bold').text(label.toUpperCase(), x, y + 50, { width: w, align: 'center' });
  doc.fillColor(valColor || C.text).fontSize(22).font('Helvetica-Bold').text(String(value), x, y + 60, { width: w, align: 'center' });
  if (sub2) doc.fillColor(C.dim).fontSize(7.5).font('Helvetica').text(sub2, x, y + 80, { width: w, align: 'center' });
}
{
  const gap = 10, w = (CW - gap * 2) / 3, y = doc.y;
  const dSets = totalThis - totalPrev;
  statCard(M, y, w, iconCalendar, 'Sesiones', sThis.length, `Sem. pasada: ${sPrev.length}`, C.blue);
  statCard(M + w + gap, y, w, iconDumbbell, 'Series totales', totalThis, `${dSets >= 0 ? '+' : ''}${dSets} vs pasada`, dSets >= 0 ? C.green : C.red);
  statCard(M + (w + gap) * 2, y, w, iconStar, 'PRs', prs.length, prs.length ? '¡Nuevos récords!' : 'Sin PRs', prs.length ? C.amber : C.dim);
  doc.y = y + 92 + 16;
}

// ─── 18. PRs de la semana ─────────────────────────────────────────────────────
heading('🏆 PRs de la semana'.replace('🏆 ', ''), C.amber);
if (prs.length) {
  prs.slice(0, 10).forEach(p => {
    ensure(16);
    const y = doc.y;
    doc.save().rect(M - 4, y, 3, 13).fill(mColor(p.muscle)).restore();
    doc.fillColor(C.text).fontSize(9.5).font('Helvetica-Bold').text(p.name, M + 4, y, { continued: true, width: 260 });
    doc.fillColor(C.green).font('Helvetica').text(`   ${p.prev || 0} -> ${p.val} kg e1RM   (+${p.diff})`);
    doc.moveDown(0.15);
  });
} else sub('Sin PRs esta semana.');
doc.moveDown(0.8);

// ─── 19. Tabla de volumen por músculo con flechas de tendencia ──────────────
heading('Volumen por músculo');
sub('Series esta semana · flecha: tendencia vs semana pasada');
{
  const colX = { dot: M, m: M + 14, t: M + 150, p: M + 205, a: M + 260, tr: M + 320 };
  ensure(20);
  doc.fillColor(C.faint).fontSize(8).font('Helvetica-Bold');
  doc.text('MÚSCULO', colX.m, doc.y);
  doc.text('ESTA', colX.t, doc.y - 10);
  doc.text('PAS.', colX.p, doc.y - 10);
  doc.text('~4SEM', colX.a, doc.y - 10);
  doc.text('TEND.', colX.tr, doc.y - 10);
  doc.moveDown(0.3);
  doc.save().moveTo(M, doc.y).lineTo(PW - M, doc.y).lineWidth(0.5).strokeColor(C.line).stroke().restore();
  doc.moveDown(0.3);
  allMuscles.forEach(m => {
    ensure(20);
    const y = doc.y;
    doc.save().circle(colX.dot + 3, y + 6, 3.5).fill(mColor(m)).restore();
    doc.fillColor(C.text).fontSize(9).font('Helvetica').text(m, colX.m, y + 2, { width: 130, ellipsis: true });
    doc.fillColor(C.text).font('Helvetica-Bold').text(String(volThis[m] || 0), colX.t, y + 2);
    doc.fillColor(C.dim).font('Helvetica').text(String(volPrev[m] || 0), colX.p, y + 2);
    doc.fillColor(C.dim).text(String(vol4avg[m] || 0), colX.a, y + 2);
    const tr = trendGlyphs(volThis[m] || 0, volPrev[m] || 0);
    if (tr.dir === 'flat') { doc.save().rect(colX.tr, y + 7, 8, 1.4).fill(tr.c).restore(); }
    else {
      triArrow(colX.tr + 4, y + 6, tr.dir, tr.c, 4);
      if (tr.double) triArrow(colX.tr + 14, y + 6, tr.dir, tr.c, 4);
    }
    doc.y = y + 18;
  });
  doc.moveDown(0.3);
}

// ─── 20. Gráfico de barras con línea de media ────────────────────────────────
heading('Volumen — esta semana vs pasada');
sub('Barras normalizadas al músculo con más volumen esta semana · línea discontinua: media 4 semanas');
{
  const groups = allMuscles.slice(0, 9);
  const chartH = 140;
  ensure(chartH + 50);
  const baseY = doc.y + chartH, chartX = M + 10;
  const chartW = CW - 20;
  const maxV = Math.max(1, ...groups.map(m => volThis[m] || 0));
  // Grid horizontal 25/50/75/100%
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const gy = baseY - f * chartH;
    doc.save().moveTo(chartX, gy).lineTo(chartX + chartW, gy).lineWidth(0.4).strokeColor(C.line).stroke().restore();
    doc.fillColor(C.faint).fontSize(6.5).font('Helvetica').text(`${Math.round(f * 100)}%`, chartX - 26, gy - 3, { width: 22, align: 'right' });
  });
  const slot = chartW / groups.length;
  const linePts = [];
  groups.forEach((m, i) => {
    const cx = chartX + slot * i + slot / 2;
    const bw = 13;
    const hT = ((volThis[m] || 0) / maxV) * chartH;
    const hP = ((volPrev[m] || 0) / maxV) * chartH;
    doc.save().rect(cx - bw - 1, baseY - hP, bw, hP).fillOpacity(0.55).fill(C.faint).restore();
    doc.fillOpacity(1);
    doc.save().rect(cx + 1, baseY - hT, bw, hT).fill(mColor(m)).restore();
    doc.fillColor(C.dim).fontSize(6.3).font('Helvetica').text(m, cx - slot / 2, baseY + 5, { width: slot, align: 'center', ellipsis: true });
    const hA = ((vol4avg[m] || 0) / maxV) * chartH;
    linePts.push([cx, baseY - hA]);
  });
  // Línea discontinua de media 4 semanas
  doc.save().dash(3, { space: 2 }).lineWidth(1.3).strokeColor(C.text);
  doc.moveTo(...linePts[0]);
  linePts.slice(1).forEach(p => doc.lineTo(...p));
  doc.stroke().undash().restore();
  linePts.forEach(p => { doc.save().circle(p[0], p[1], 2).fill(C.text).restore(); });

  doc.y = baseY + 18;
  const legY = doc.y;
  const legItems = [['esta semana', C.blue], ['semana pasada', C.faint], ['media 4 semanas', C.text]];
  let lx = chartX;
  legItems.forEach(([label, col], i) => {
    if (i === 2) { doc.save().moveTo(lx, legY + 5).lineTo(lx + 10, legY + 5).dash(2, { space: 1.5 }).lineWidth(1.3).strokeColor(col).stroke().undash().restore(); }
    else { doc.save().rect(lx, legY + 1, 8, 8).fill(col).restore(); }
    doc.fillColor(C.dim).fontSize(7).font('Helvetica').text(label, lx + 13, legY);
    lx += 13 + doc.widthOfString(label) + 16;
  });
  doc.y = legY + 16;
}
doc.moveDown(0.4);

// ─── 21. Franja resumen de porcentajes ───────────────────────────────────────
{
  ensure(50);
  const y = doc.y, h = 46;
  doc.save().roundedRect(M, y, CW, h, 8).fill(C.card2).restore();
  const cells = [
    ['esta semana', '100%', C.blue],
    ['semana pasada', totalThis ? `${Math.round((totalPrev / totalThis) * 100)}%` : '0%', C.dim],
    ['media 4 semanas', totalThis ? `${Math.round((total4avg / totalThis) * 100)}%` : '0%', C.dim],
  ];
  const cw = CW / 3;
  cells.forEach(([label, val, col], i) => {
    const cx = M + cw * i;
    doc.fillColor(col).fontSize(16).font('Helvetica-Bold').text(val, cx, y + 9, { width: cw, align: 'center' });
    doc.fillColor(C.faint).fontSize(7.5).font('Helvetica').text(label, cx, y + 30, { width: cw, align: 'center' });
    if (i > 0) doc.save().moveTo(cx, y + 8).lineTo(cx, y + h - 8).lineWidth(0.5).strokeColor(C.line).stroke().restore();
  });
  doc.y = y + h + 16;
}

// ─── 22. Página 2: Ejercicios (tabla + ranking e1RM) ─────────────────────────
doc.addPage();
heading('Ejercicios — esta semana vs pasada');
sub('Mejor serie de cada ejercicio (kg × reps -> e1RM).');
{
  const tableW = CW * 0.62;
  const panelX = M + tableW + 16;
  const panelW = CW - tableW - 16;
  const startY = doc.y;

  // --- Tabla (columna izquierda) ---
  const colX = { n: M, kgT: M + tableW - 150, rm: M + tableW - 95, diff: M + tableW - 45 };
  doc.fillColor(C.faint).fontSize(7.5).font('Helvetica-Bold');
  doc.text('EJERCICIO', colX.n, doc.y, { width: tableW - 160 });
  const hy = doc.y - 9.5;
  doc.text('KG×REPS', colX.kgT, hy, { width: 55 });
  doc.text('e1RM', colX.rm, hy, { width: 50 });
  doc.text('CAMBIO', colX.diff, hy, { width: 40 });
  doc.moveDown(0.3);
  doc.save().moveTo(M, doc.y).lineTo(M + tableW, doc.y).lineWidth(0.5).strokeColor(C.line).stroke().restore();
  doc.moveDown(0.25);

  exCompare.forEach(e => {
    doc.font('Helvetica-Bold').fontSize(8.5);
    const nameH = doc.heightOfString(e.name, { width: tableW - 160 });
    const rowH = nameH + 14 + 14;
    ensure(rowH + 6);
    const y = doc.y;
    doc.fillColor(C.text).text(e.name, colX.n, y, { width: tableW - 160, ellipsis: false });
    const pillY = y + nameH + 2;
    pill(colX.n, pillY, e.muscle, mColor(e.muscle));
    doc.fillColor(C.text).fontSize(8).font('Helvetica').text(`${e.thisW.kg}×${e.thisW.reps}`, colX.kgT, y + 2, { width: 55 });
    doc.fillColor(C.text).font('Helvetica-Bold').text(`${e.thisW.e1rm}`, colX.rm, y + 2, { width: 50 });
    if (e.diff === null) doc.fillColor(C.faint).font('Helvetica').fontSize(7.5).text('nuevo', colX.diff, y + 2, { width: 40 });
    else { const col = e.diff > 0 ? C.green : e.diff < 0 ? C.red : C.dim; doc.fillColor(col).font('Helvetica-Bold').fontSize(8).text(`${e.diff > 0 ? '+' : ''}${e.diff}`, colX.diff, y + 2, { width: 40 }); }
    doc.y = pillY + 14 + 8;
    doc.save().moveTo(M, doc.y - 4).lineTo(M + tableW, doc.y - 4).lineWidth(0.3).strokeColor(C.line).stroke().restore();
  });
  const tableEndY = doc.y;

  // --- Panel derecho: ranking de cambio de e1RM ---
  let py = startY;
  doc.fillColor(C.text).fontSize(11).font('Helvetica-Bold').text('Cambio de e1RM', panelX, py, { width: panelW });
  py += 14;
  doc.fillColor(C.dim).fontSize(9).font('Helvetica-Bold').text('por ejercicio', panelX, py, { width: panelW });
  py += 22;
  const top = ranked.slice(0, 6);
  top.forEach((e, i) => {
    const badgeR = 8;
    const nameW = panelW - badgeR * 2 - 8;
    doc.font('Helvetica-Bold').fontSize(8.5);
    const nameH = doc.heightOfString(e.name, { width: nameW });
    doc.save().circle(panelX + badgeR, py + badgeR, badgeR).fill(e.diff > 0 ? C.blue : C.line).restore();
    doc.fillColor(e.diff > 0 ? '#fff' : C.dim).fontSize(8).font('Helvetica-Bold').text(String(i + 1), panelX, py + badgeR - 5, { width: badgeR * 2, align: 'center' });
    doc.fillColor(C.text).fontSize(8.5).font('Helvetica-Bold').text(e.name, panelX + badgeR * 2 + 8, py, { width: nameW });
    const col = e.diff > 0 ? C.green : e.diff < 0 ? C.red : C.dim;
    const arrowY = py + nameH + 6;
    if (e.diff !== 0) triArrow(panelX + badgeR * 2 + 8 + 4, arrowY, e.diff > 0 ? 'up' : 'down', col, 3.5);
    doc.fillColor(col).fontSize(8.5).font('Helvetica-Bold').text(`${e.diff > 0 ? '+' : ''}${e.diff}`, panelX + badgeR * 2 + 20, arrowY - 4, { width: nameW });
    py += Math.max(30, nameH + 22);
  });
  // Leyenda
  py += 6;
  doc.save().moveTo(panelX, py).lineTo(panelX + panelW, py).lineWidth(0.4).strokeColor(C.line).stroke().restore();
  py += 10;
  triArrow(panelX + 4, py, 'up', C.green, 3.5);
  doc.fillColor(C.dim).fontSize(7.5).font('Helvetica').text('Mejora     — Sin cambio', panelX + 12, py - 4, { width: panelW });

  doc.y = Math.max(tableEndY, py + 20);
}

doc.end();
const pdfBuffer = await pdfDone;

// ─── 23. Email con análisis de la IA en el cuerpo ────────────────────────────
const pdfBase64 = pdfBuffer.toString('base64');
const dSets = totalThis - totalPrev;
const emailHtml = `
  <div style="font-family:sans-serif;background:#0a0a0a;color:#f2f2f2;padding:24px;border-radius:12px;max-width:640px;margin:0 auto">
    <h2 style="color:#4f8ef7;margin:0 0 4px">Peak Physique — Informe semanal</h2>
    <p style="color:#9ca3af;margin:0 0 16px">Semana ${fmtDate(wkThis.start)} — ${fmtDate(wkThis.end)}</p>
    <ul style="line-height:1.7;padding-left:20px">
      <li><strong>${sThis.length}</strong> sesiones (sem. pasada: ${sPrev.length})</li>
      <li><strong>${totalThis}</strong> series totales (${dSets >= 0 ? '+' : ''}${dSets} vs pasada)</li>
      <li><strong>${prs.length}</strong> PRs conseguidos</li>
    </ul>
    <div style="border-top:1px solid #262626;margin:16px 0"></div>
    <h2 style="color:#fbbf24;margin:0 0 8px;font-size:17px">Análisis del entrenador (IA)</h2>
    ${mdToHtml(aiAnalysisMarkdown)}
    <div style="border-top:1px solid #262626;margin:20px 0 12px"></div>
    <p style="color:#6b7280;font-size:12px">Tablas y gráficos completos en el PDF adjunto. Para ajustar el enfoque de este análisis, edita <code style="color:#9ca3af">scripts/coach-notes.md</code> en el repo.</p>
  </div>`;

const resp = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: REPORT_EMAIL_FROM,
    to: [REPORT_EMAIL_TO],
    subject: `Informe semanal Peak Physique — ${fmtDate(wkThis.start)} a ${fmtDate(wkThis.end)}`,
    html: emailHtml,
    attachments: [{ filename: `informe-${wkThis.end}.pdf`, content: pdfBase64 }],
  }),
});
if (!resp.ok) { console.error('Error email:', resp.status, await resp.text()); process.exit(1); }
console.log('Informe semanal enviado ✓');
