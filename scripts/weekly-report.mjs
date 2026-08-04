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
      max_tokens: 4500,
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
    const textBlock = (aiData.content || []).find(b => b.type === 'text');
    aiAnalysisMarkdown = textBlock?.text || null;
    if (!aiAnalysisMarkdown) { aiErrorDetail = `Sin bloque de texto (stop_reason: ${aiData.stop_reason}): ${rawText.slice(0, 300)}`; }
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

function pill(x, y, txt, color, fontSize = 6.5) {
  doc.font('Helvetica-Bold').fontSize(fontSize);
  const w = doc.widthOfString(txt) + 10;
  doc.save().roundedRect(x, y, w, 12, 6).fillOpacity(0.18).fill(color).restore();
  doc.fillOpacity(1).fillColor(color).text(txt, x + 5, y + 3, { width: w - 10, align: 'center' });
  return w;
}
function triArrow(x, y, dir, color, size = 3.5) {
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
function iconCalendar(cx, cy, r, color) {
  doc.save().roundedRect(cx - r, cy - r * 0.85, r * 2, r * 1.8, 2.5).lineWidth(1.4).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx - r, cy - r * 0.35).lineTo(cx + r, cy - r * 0.35).lineWidth(1).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx - r * 0.5, cy - r * 1.1).lineTo(cx - r * 0.5, cy - r * 0.6).lineWidth(1.2).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx + r * 0.5, cy - r * 1.1).lineTo(cx + r * 0.5, cy - r * 0.6).lineWidth(1.2).strokeColor(color).stroke().restore();
}
function iconDumbbell(cx, cy, r, color) {
  doc.save().rect(cx - r * 0.9, cy - 1.3, r * 1.8, 2.6).fill(color).restore();
  [-1, 1].forEach(side => doc.save().circle(cx + side * r * 0.95, cy, r * 0.45).fill(color).restore());
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
function iconTrophy(cx, cy, r, color) {
  doc.save().roundedRect(cx - r * 0.55, cy - r * 0.5, r * 1.1, r * 0.9, 1.5).fill(color).restore();
  doc.save().moveTo(cx - r * 0.55, cy - r * 0.35).bezierCurveTo(cx - r * 1.2, cy - r * 0.35, cx - r * 1.2, cy + r * 0.15, cx - r * 0.55, cy + r * 0.05).lineWidth(1.1).strokeColor(color).stroke().restore();
  doc.save().moveTo(cx + r * 0.55, cy - r * 0.35).bezierCurveTo(cx + r * 1.2, cy - r * 0.35, cx + r * 1.2, cy + r * 0.15, cx + r * 0.55, cy + r * 0.05).lineWidth(1.1).strokeColor(color).stroke().restore();
  doc.save().rect(cx - r * 0.15, cy + r * 0.4, r * 0.3, r * 0.35).fill(color).restore();
  doc.save().rect(cx - r * 0.4, cy + r * 0.72, r * 0.8, r * 0.16).fill(color).restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// CABECERA
// ═══════════════════════════════════════════════════════════════════════════
doc.image(logoBuffer, M, M, { width: 46, height: 46 });
doc.fillColor(C.text).fontSize(18).font('Helvetica-Bold').text('Informe semanal', M + 58, M + 3);
doc.fillColor(C.blue).fontSize(10).font('Helvetica').text('Peak Physique', M + 58, M + 24);
doc.fillColor(C.dim).fontSize(8.5).text(`Semana ${fmtDate(wkThis.start)} — ${fmtDate(wkThis.end)}  (lun-dom)`, M + 58, M + 37);
let y = M + 58;
doc.save().moveTo(M, y).lineTo(PW - M, y).lineWidth(1).strokeColor(C.line).stroke().restore();
y += 14;

// ═══════════════════════════════════════════════════════════════════════════
// FILA 1 — Highlights (izq) + PRs de la semana (der)
// ═══════════════════════════════════════════════════════════════════════════
const colGap = 16;
const colW = (CW - colGap) / 2;
const row1Y = y;
const row1H = 186;

// --- Highlights: 3 tarjetas apiladas ---
{
  const cardGap = 8;
  const cardH = (row1H - cardGap * 2) / 3;
  const cards = [
    [iconCalendar, 'Sesiones', sThis.length, `Sem. pasada: ${sPrev.length}`, C.blue],
    [iconDumbbell, 'Series totales', totalThis, `${totalThis - totalPrev >= 0 ? '+' : ''}${totalThis - totalPrev} vs pasada`, (totalThis - totalPrev) >= 0 ? C.green : C.red],
    [iconStar, 'PRs', prs.length, prs.length ? '¡Nuevos récords!' : 'Sin PRs', prs.length ? C.amber : C.dim],
  ];
  cards.forEach(([icon, label, value, sub2, col], i) => {
    const cy0 = row1Y + i * (cardH + cardGap);
    doc.save().roundedRect(M, cy0, colW, cardH, 8).fill(C.card).restore();
    const iconCx = M + 28, iconCy = cy0 + cardH / 2;
    doc.save().circle(iconCx, iconCy, 15).fillOpacity(0.15).fill(col).restore();
    doc.fillOpacity(1);
    icon(iconCx, iconCy, 8, col);
    doc.fillColor(C.faint).fontSize(7).font('Helvetica-Bold').text(label.toUpperCase(), M + 54, cy0 + 9, { width: colW - 64 });
    doc.fillColor(col).fontSize(17).font('Helvetica-Bold').text(String(value), M + 54, cy0 + 19, { width: colW - 64 });
    doc.fillColor(C.dim).fontSize(6.8).font('Helvetica').text(sub2, M + 54, cy0 + cardH - 15, { width: colW - 64 });
  });
}

// --- PRs de la semana (tabla, hasta 9) ---
{
  const px = M + colW + colGap;
  doc.save().roundedRect(px, row1Y, colW, row1H, 8).fill(C.card).restore();
  let py = row1Y + 12;
  iconTrophy(px + 16, py + 4, 8, C.amber);
  doc.fillColor(C.amber).fontSize(11).font('Helvetica-Bold').text('PRs de la semana', px + 30, py - 3);
  py += 20;
  doc.save().moveTo(px + 12, py).lineTo(px + colW - 12, py).lineWidth(0.5).strokeColor(C.line).stroke().restore();
  py += 6;
  if (prs.length) {
    const maxRows = 9;
    const rowH = (row1H - 38) / maxRows;
    prs.slice(0, maxRows).forEach(p => {
      doc.fillColor(C.text).fontSize(7.6).font('Helvetica-Bold').text(p.name, px + 12, py, { width: colW * 0.4, height: 10, ellipsis: true });
      const prevTxt = p.prev ? `${p.prev} -> ${p.val} kg e1RM` : `nuevo: ${p.val} kg e1RM`;
      doc.fillColor(C.dim).fontSize(7).font('Helvetica').text(prevTxt, px + 12 + colW * 0.4, py, { width: colW * 0.36, height: 10, ellipsis: true });
      doc.fillColor(C.green).fontSize(7.2).font('Helvetica-Bold').text(`(+${p.diff})`, px + colW - 44, py, { width: 38, align: 'right', height: 10, ellipsis: true });
      py += rowH;
    });
  } else {
    doc.fillColor(C.dim).fontSize(9).font('Helvetica').text('Sin PRs esta semana.', px + 12, py);
  }
}
y = row1Y + row1H + 12;

// ═══════════════════════════════════════════════════════════════════════════
// FILA 2 — Volumen por músculo: tabla (izq) + gráfico (der)
// ═══════════════════════════════════════════════════════════════════════════
const row2Y = y;
const row2H = 195;

// --- Tabla de volumen ---
{
  doc.fillColor(C.text).fontSize(11).font('Helvetica-Bold').text('Volumen por músculo', M, row2Y);
  doc.fillColor(C.dim).fontSize(7).font('Helvetica').text('Series esta semana', M, row2Y + 14);
  let ty = row2Y + 28;
  const colX = { dot: M, m: M + 12, t: M + 108, p: M + 145, a: M + 178, tr: M + 214 };
  doc.fillColor(C.faint).fontSize(6.8).font('Helvetica-Bold');
  doc.text('MÚSCULO', colX.m, ty);
  doc.text('ESTA', colX.t, ty);
  doc.text('PAS.', colX.p, ty);
  doc.text('~4SEM', colX.a, ty);
  doc.text('TEND.', colX.tr, ty);
  ty += 11;
  doc.save().moveTo(M, ty).lineTo(M + colW, ty).lineWidth(0.4).strokeColor(C.line).stroke().restore();
  ty += 4;
  const maxMuscleRows = Math.min(allMuscles.length, 11);
  const mRowH = (row2H - 44) / maxMuscleRows;
  allMuscles.slice(0, maxMuscleRows).forEach(m => {
    doc.save().circle(colX.dot + 2.5, ty + 5, 2.8).fill(mColor(m)).restore();
    doc.fillColor(C.text).fontSize(7.3).font('Helvetica').text(m, colX.m, ty + 1, { width: 90, ellipsis: true });
    doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.3).text(String(volThis[m] || 0), colX.t, ty + 1);
    doc.fillColor(C.dim).font('Helvetica').text(String(volPrev[m] || 0), colX.p, ty + 1);
    doc.fillColor(C.dim).text(String(vol4avg[m] || 0), colX.a, ty + 1);
    const tr = trendGlyphs(volThis[m] || 0, volPrev[m] || 0);
    if (tr.dir === 'flat') { doc.save().rect(colX.tr, ty + 5, 7, 1.2).fill(tr.c).restore(); }
    else {
      triArrow(colX.tr + 3, ty + 4, tr.dir, tr.c, 3.2);
      if (tr.double) triArrow(colX.tr + 11, ty + 4, tr.dir, tr.c, 3.2);
    }
    ty += mRowH;
  });
}

// --- Gráfico de barras con línea de media ---
{
  const px = M + colW + colGap;
  doc.fillColor(C.text).fontSize(11).font('Helvetica-Bold').text('Volumen — esta vs pasada', px, row2Y);
  doc.fillColor(C.dim).fontSize(6.8).font('Helvetica').text('Barra: esta semana / pasada · línea: media 4 sem.', px, row2Y + 14);
  const chartH = 130;
  const baseY = row2Y + 30 + chartH;
  const chartX = px + 22;
  const chartW = colW - 26;
  const groups = allMuscles.slice(0, 9);
  const maxV = Math.max(1, ...groups.map(m => volThis[m] || 0));
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const gy = baseY - f * chartH;
    doc.save().moveTo(chartX, gy).lineTo(chartX + chartW, gy).lineWidth(0.35).strokeColor(C.line).stroke().restore();
    doc.fillColor(C.faint).fontSize(5.8).font('Helvetica').text(`${Math.round(f * 100)}%`, chartX - 22, gy - 2.5, { width: 18, align: 'right' });
  });
  const slot = chartW / groups.length;
  const linePts = [];
  groups.forEach((m, i) => {
    const cx = chartX + slot * i + slot / 2;
    const bw = Math.min(10, slot * 0.32);
    const hT = ((volThis[m] || 0) / maxV) * chartH;
    const hP = ((volPrev[m] || 0) / maxV) * chartH;
    doc.save().rect(cx - bw - 1, baseY - hP, bw, hP).fillOpacity(0.55).fill(C.faint).restore();
    doc.fillOpacity(1);
    doc.save().rect(cx + 1, baseY - hT, bw, hT).fill(mColor(m)).restore();
    doc.fillColor(C.dim).fontSize(5.3).font('Helvetica').text(m, cx - slot / 2, baseY + 4, { width: slot, align: 'center', ellipsis: true });
    const hA = ((vol4avg[m] || 0) / maxV) * chartH;
    linePts.push([cx, baseY - hA]);
  });
  doc.save().dash(2.5, { space: 1.8 }).lineWidth(1.1).strokeColor(C.text);
  doc.moveTo(...linePts[0]);
  linePts.slice(1).forEach(p => doc.lineTo(...p));
  doc.stroke().undash().restore();
  linePts.forEach(p => doc.save().circle(p[0], p[1], 1.6).fill(C.text).restore());

  const legY = baseY + 14;
  const legItems = [['esta semana', C.blue, 'sq'], ['semana pasada', C.faint, 'sq'], ['media 4 sem.', C.text, 'dash']];
  let lx = chartX;
  legItems.forEach(([label, col, type]) => {
    if (type === 'dash') doc.save().moveTo(lx, legY + 4).lineTo(lx + 9, legY + 4).dash(2, { space: 1.5 }).lineWidth(1.1).strokeColor(col).stroke().undash().restore();
    else doc.save().rect(lx, legY, 7, 7).fill(col).restore();
    doc.fillColor(C.dim).fontSize(6).font('Helvetica').text(label, lx + 11, legY);
    lx += 11 + doc.widthOfString(label) + 10;
  });
}
y = row2Y + row2H + 14;

// ═══════════════════════════════════════════════════════════════════════════
// FILA 3 — Tabla de ejercicios (ancho completo, incluye columna de cambio)
// ═══════════════════════════════════════════════════════════════════════════
doc.fillColor(C.text).fontSize(11).font('Helvetica-Bold').text('Ejercicios — esta semana vs pasada', M, y);
doc.fillColor(C.dim).fontSize(7).font('Helvetica').text('Mejor serie de cada ejercicio (kg × reps -> e1RM).', M, y + 14);
y += 30;
{
  const colX = { m: M, name: M + 90, kgT: M + 300, kgP: M + 365, rm: M + 425, diff: M + 470 };
  doc.fillColor(C.faint).fontSize(6.8).font('Helvetica-Bold');
  doc.text('MÚSCULO', colX.m, y);
  doc.text('EJERCICIO', colX.name, y);
  doc.text('ESTA', colX.kgT, y);
  doc.text('PAS.', colX.kgP, y);
  doc.text('e1RM', colX.rm, y);
  doc.text('CAMBIO', colX.diff, y);
  y += 11;
  doc.save().moveTo(M, y).lineTo(PW - M, y).lineWidth(0.5).strokeColor(C.line).stroke().restore();
  y += 3;

  const availH = PH - M - y;
  const rowH = Math.max(12, Math.min(16, availH / Math.max(exCompare.length, 1)));
  exCompare.forEach(e => {
    if (y + rowH > PH - M) return; // seguridad: no desbordar la página
    pill(colX.m, y, e.muscle, mColor(e.muscle), 6);
    doc.fillColor(C.text).fontSize(7.6).font('Helvetica-Bold').text(e.name, colX.name, y + 2, { width: 205, ellipsis: true });
    doc.fillColor(C.text).fontSize(7.3).font('Helvetica').text(`${e.thisW.kg}×${e.thisW.reps}`, colX.kgT, y + 2, { width: 60 });
    doc.fillColor(C.dim).text(e.prevW ? `${e.prevW.kg}×${e.prevW.reps}` : '—', colX.kgP, y + 2, { width: 55 });
    doc.fillColor(C.text).font('Helvetica-Bold').fontSize(7.6).text(`${e.thisW.e1rm}`, colX.rm, y + 2, { width: 40 });
    if (e.diff === null) doc.fillColor(C.faint).font('Helvetica').fontSize(7).text('nuevo', colX.diff, y + 2, { width: 50 });
    else { const col = e.diff > 0 ? C.green : e.diff < 0 ? C.red : C.dim; doc.fillColor(col).font('Helvetica-Bold').fontSize(7.3).text(`${e.diff > 0 ? '+' : ''}${e.diff} kg`, colX.diff, y + 2, { width: 55 }); }
    y += rowH;
    doc.save().moveTo(M, y - 2).lineTo(PW - M, y - 2).lineWidth(0.25).strokeColor(C.line).stroke().restore();
  });
}

doc.end();
const pdfBuffer = await pdfDone;

// ═══════════════════════════════════════════════════════════════════════════
// Email con análisis de la IA en el cuerpo
// ═══════════════════════════════════════════════════════════════════════════
const pdfBase64 = pdfBuffer.toString('base64');
const dSets2 = totalThis - totalPrev;
const emailHtml = `
  <div style="font-family:sans-serif;background:#0a0a0a;color:#f2f2f2;padding:24px;border-radius:12px;max-width:640px;margin:0 auto">
    <h2 style="color:#4f8ef7;margin:0 0 4px">Peak Physique — Informe semanal</h2>
    <p style="color:#9ca3af;margin:0 0 16px">Semana ${fmtDate(wkThis.start)} — ${fmtDate(wkThis.end)}</p>
    <ul style="line-height:1.7;padding-left:20px">
      <li><strong>${sThis.length}</strong> sesiones (sem. pasada: ${sPrev.length})</li>
      <li><strong>${totalThis}</strong> series totales (${dSets2 >= 0 ? '+' : ''}${dSets2} vs pasada)</li>
      <li><strong>${prs.length}</strong> PRs conseguidos</li>
    </ul>
    <div style="border-top:1px solid #262626;margin:16px 0"></div>
    <h2 style="color:#fbbf24;margin:0 0 8px;font-size:17px">Análisis del entrenador (IA)</h2>
    ${mdToHtml(aiAnalysisMarkdown)}
    <div style="border-top:1px solid #262626;margin:20px 0 12px"></div>
    <p style="color:#6b7280;font-size:12px">Informe completo (1 página) en el PDF adjunto. Para ajustar el enfoque de este análisis, edita <code style="color:#9ca3af">scripts/coach-notes.md</code> en el repo.</p>
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
