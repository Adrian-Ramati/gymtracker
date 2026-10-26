#!/usr/bin/env python3
"""
IHO · Índice de Hipertrofia Optimizado — implementación de referencia (Python 3.10+, solo stdlib).

Simula 8 semanas de entrenamiento + biometría diaria de un usuario en cuatro escenarios y
calcula el IHO (0–100) sobre la ventana de las últimas 4 semanas:

    IHO = clip( β · Σ_k w_k·C_k  −  Φ , 0, 100 )

    C_V  volumen efectivo por músculo frente a sus landmarks (MEV/MAV/MRV)      w = 0.35
    C_P  proximidad al fallo (estímulo por serie según RIR)                     w = 0.20
    C_S  sobrecarga progresiva (pendiente del e1RM, 8 semanas)                  w = 0.20
    C_A  adherencia (sesiones y series duras hechas frente al plan)             w = 0.15
    C_D  densidad del estímulo (descanso real frente al objetivo del ejercicio) w = 0.10
    β    modulación biométrica ∈ [0.85, 1.05] (recuperación + autorregulación)
    Φ    penalización por fatiga acumulada ∈ [0, 25] (picos de carga, fallo, rendimiento)

Ejecutar:  python3 iho_reference.py            (imprime el informe y comprueba los invariantes)
           python3 iho_reference.py --export   (JSON con los escenarios en formato de la app: oráculo de tests)
"""
from __future__ import annotations

import math
import random
import statistics as st
from dataclasses import dataclass, field
from datetime import date, timedelta

# ─────────────────────────── Parámetros del modelo ───────────────────────────
W = {"V": 0.35, "P": 0.20, "S": 0.20, "A": 0.15, "D": 0.10}

# Estímulo por serie según RIR (repeticiones en reserva): ≤1 → 1,00 · ≤2 → 0,95 · ≤3 → 0,85 · ≤4 → 0,60 · ≤5 → 0,35 · más → 0
# Coste de fatiga por serie: RIR 0 → 1,40 · ≤1 → 1,15 · ≤2 → 1,05 · más → 1,00 (el fallo cuesta más de lo que estimula)
COMPOUND_FAT = 1.30          # los multiarticulares generan más fatiga sistémica
SEC_CREDIT = 0.5             # músculo secundario cuenta media serie (recuento fraccional)
SESSION_CAP = 10.0           # series efectivas/músculo/sesión a crédito completo; el exceso vale 0.5 (heurística)
REST_TARGET = {              # segundos [mínimo, máximo] por tipo de ejercicio
    "compound_heavy": (120, 240),
    "compound": (90, 180),
    "isolation": (60, 150),
}
LANDMARKS = {                # series duras/semana: (MEV, MAV, MRV) — los mismos valores por defecto de la app
    "Pectoral": (8, 16, 22), "Espalda": (10, 18, 25), "Tríceps": (6, 12, 18), "Bíceps": (8, 14, 20),
    "Glúteos": (4, 12, 16), "Isquiosurales": (6, 12, 16), "Cuádriceps": (8, 14, 20), "Gemelos": (8, 14, 20),
    "Deltoides lateral": (8, 18, 26),
}
MAJOR = {"Pectoral", "Espalda", "Cuádriceps", "Isquiosurales", "Glúteos", "Deltoides lateral", "Bíceps", "Tríceps"}
SLEEP_NEED_H = 7.5
WINDOW_DAYS = 28
PROG_DAYS = 56


def clip(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def stim(rir: float) -> float:
    """Umbrales (no redondeo): RIR 1,5 cuenta como 2. Igual que la app (js/core.js) y la función SQL stim_rir."""
    for lim, v in ((1, 1.00), (2, 0.95), (3, 0.85), (4, 0.60), (5, 0.35)):
        if rir <= lim:
            return v
    return 0.0


def fat_cost(rir: float) -> float:
    return 1.40 if rir <= 0 else 1.15 if rir <= 1 else 1.05 if rir <= 2 else 1.0


def jround(x: float) -> float:
    """Redondeo como Math.round de JavaScript (0,5 hacia arriba)."""
    return math.floor(x + 0.5)


# e1RM con la tabla RTS/Tuchscherer por repeticiones efectivas (reps + RIR) — la misma de la app
RTS_PCT = {1: 100, 1.5: 97.8, 2: 95.5, 2.5: 93.9, 3: 92.2, 3.5: 90.7, 4: 89.2, 4.5: 87.8, 5: 86.3, 5.5: 85,
           6: 83.7, 6.5: 82.4, 7: 81.1, 7.5: 79.9, 8: 78.6, 8.5: 77.4, 9: 76.2, 9.5: 75.1, 10: 73.9, 10.5: 72.3,
           11: 70.7, 11.5: 69.4, 12: 68, 12.5: 66.7, 13: 65.3, 13.5: 64, 14: 62.6}


def e1rm(load: float, reps: int, rir: float | None) -> float | None:
    """Sin RIR registrado se asume esfuerzo máximo; RPE limitado a 6–10; más de 14 reps efectivas → sin e1RM."""
    if not load or not reps:
        return None
    rpe = 10 if rir is None else min(10.0, max(6.0, 10 - rir))
    er = jround((reps + (10 - rpe)) * 2) / 2
    if er > 14:
        return None
    pct = RTS_PCT[max(1, er) if max(1, er) % 1 else int(max(1, er))]
    return jround(load / (pct / 100) * 10) / 10


# ─────────────────────────────── Modelo de datos ───────────────────────────────
@dataclass
class SetLog:
    load_kg: float
    reps: int
    rir: float | None            # None = esfuerzo no registrado (no se inventa)
    rest_before_s: int | None    # None en la primera serie del ejercicio
    completed: bool = True


@dataclass
class ExerciseLog:
    name: str
    primary: str
    secondary: tuple[str, ...]
    kind: str                    # compound_heavy | compound | isolation
    sets: list[SetLog]


@dataclass
class Session:
    day: date
    planned_hard_sets: int
    exercises: list[ExerciseLog]


@dataclass
class Biometrics:
    day: date
    ln_rmssd: float | None
    rhr_bpm: float | None
    sleep_h: float | None


@dataclass
class Result:
    comps: dict[str, float | None]
    beta: float
    phi: float
    phi_parts: dict[str, float]
    readiness: float
    alignment: float
    iho: int
    label: str
    risk: bool
    junk_share: float = 0.0
    eff_volume: dict[str, float] = field(default_factory=dict)
    raw_volume: dict[str, float] = field(default_factory=dict)


# ─────────────────────────────── Componentes ───────────────────────────────
def effective_volume(sessions: list[Session], weeks: float) -> tuple[dict[str, float], dict[str, float]]:
    """Series efectivas/semana por músculo: crédito (1 ó 0.5) × estímulo(RIR), con techo por sesión."""
    eff: dict[str, float] = {}
    raw: dict[str, float] = {}
    for s in sessions:
        per_session: dict[str, float] = {}
        for ex in s.exercises:
            credits = [(ex.primary, 1.0)] + [(m, SEC_CREDIT) for m in ex.secondary]
            for st_ in ex.sets:
                if not st_.completed:
                    continue
                k = stim(st_.rir) if st_.rir is not None else 0.0
                for m, c in credits:
                    per_session[m] = per_session.get(m, 0.0) + c * k
                    if c == 1.0:
                        raw[m] = raw.get(m, 0.0) + 1
        for m, v in per_session.items():
            capped = min(v, SESSION_CAP) + 0.5 * max(0.0, v - SESSION_CAP)
            eff[m] = eff.get(m, 0.0) + capped
    return ({m: v / weeks for m, v in eff.items()}, {m: v / weeks for m, v in raw.items()})


def vol_score(v: float, mev: float, mav: float, mrv: float) -> float:
    """0–100. Lineal hasta el MEV (60), sube hasta el MAV (100), meseta descendente hasta el MRV (90) y cae por encima."""
    if v < mev:
        return 60 * v / mev
    if v <= mav:
        return 60 + 40 * (v - mev) / (mav - mev)
    if v <= mrv:
        return 100 - 10 * (v - mav) / (mrv - mav)
    return max(0.0, 90 - 60 * (v - mrv) / mrv)


def comp_volume(eff: dict[str, float]) -> float:
    num = den = 0.0
    for m, (mev, mav, mrv) in LANDMARKS.items():
        w = 1.0 if m in MAJOR else 0.5
        num += w * vol_score(eff.get(m, 0.0), mev, mav, mrv)
        den += w
    return num / den


def comp_proximity(sessions: list[Session]) -> float | None:
    work = [x for s in sessions for e in s.exercises for x in e.sets if x.completed]
    logged = [x for x in work if x.rir is not None]
    if not work or len(logged) / len(work) < 0.5:
        return None                      # sin esfuerzo registrado no hay juicio posible
    return 100 * st.mean(stim(x.rir) for x in logged)


def density(r: float, lo: float, hi: float) -> float:
    if r < lo:
        return clip(1 - 1.5 * (lo - r) / lo)
    if r <= hi:
        return 1.0
    return max(0.6, 1 - 0.4 * (r - hi) / (2 * hi))   # descansos eternos: ineficiencia y sesiones recortadas


def comp_density(sessions: list[Session]) -> float | None:
    ds = [density(x.rest_before_s, *REST_TARGET[e.kind])
          for s in sessions for e in s.exercises for x in e.sets
          if x.completed and x.rest_before_s is not None]
    return 100 * st.mean(ds) if ds else None


def exercise_series(sessions: list[Session]) -> dict[str, list[tuple[date, float]]]:
    out: dict[str, list[tuple[date, float]]] = {}
    for s in sessions:
        for e in s.exercises:
            best = max((v for x in e.sets if x.completed
                        for v in [e1rm(x.load_kg, x.reps, x.rir)] if v), default=None)
            if best:
                out.setdefault(e.name, []).append((s.day, best))
    return out


def comp_progression(sessions: list[Session], window_start: date) -> float | None:
    scores, weights = [], []
    for pts in exercise_series(sessions).values():
        if len(pts) < 3 or pts[-1][0] < window_start:   # ejercicios que ya no haces no cuentan
            continue
        x0 = pts[0][0]
        xs = [(d - x0).days for d, _ in pts]
        ys = [v for _, v in pts]
        mx, my = st.mean(xs), st.mean(ys)
        sxx = sum((x - mx) ** 2 for x in xs)
        slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx if sxx else 0.0
        pct_4w = slope * 28 / my * 100                     # % de e1RM ganado cada 4 semanas
        scores.append(50 + 50 * math.tanh(pct_4w / 2.5))   # +2,5 %/4 sem ≈ 88 · plano = 50 · −2,5 % ≈ 12
        weights.append(len(pts))
    if len(scores) < 2:
        return None
    return sum(s * w for s, w in zip(scores, weights)) / sum(weights)


def comp_adherence(sessions: list[Session], planned_per_week: int, weeks: float) -> float:
    spw = len(sessions) / weeks
    done = [clip(sum(1 for e in s.exercises for x in e.sets if x.completed) / s.planned_hard_sets)
            for s in sessions if s.planned_hard_sets]
    return 100 * (0.5 * clip(spw / planned_per_week) + 0.5 * (st.mean(done) if done else 0))


# ─────────────────────── Biometría: readiness y modulación β ───────────────────────
def readiness_series(bio_all: list[Biometrics], start: date, end: date) -> dict[date, float | None]:
    """Readiness diaria ∈ [0, 1] (0,7 = normal) para cada día de [start, end]. Media de 3 días (suaviza el ruido
    diario de la HRV sin retrasar la decisión una semana) frente a la línea base de los 60 días anteriores a `start`.
    Día sin ningún dato → None (no se inventa)."""
    def stats(vals):
        vals = [v for v in vals if v is not None]
        return (st.mean(vals), st.pstdev(vals) or 1e-6) if len(vals) >= 14 else (None, None)

    by_day = {b.day: b for b in bio_all}
    base = [b for b in bio_all if 1 <= (start - b.day).days <= 60]
    h_mu, h_sd = stats([b.ln_rmssd for b in base])
    r_mu, _ = stats([b.rhr_bpm for b in base])
    out: dict[date, float | None] = {}
    for k in range((end - start).days + 1):
        day = start + timedelta(days=k)
        win = [by_day[d] for d in (day - timedelta(days=2), day - timedelta(days=1), day) if d in by_day]

        def roll(attr):
            vals = [getattr(b, attr) for b in win if getattr(b, attr) is not None]
            return st.mean(vals) if len(vals) >= 2 else None

        parts = []
        h7, r7, s7 = roll("ln_rmssd"), roll("rhr_bpm"), roll("sleep_h")
        if h7 is not None and h_mu is not None:
            parts.append((0.5, clip(0.7 + 0.3 * (h7 - h_mu) / h_sd)))   # z = −1 → 0.4 · z = −2,3 → 0
        if r7 is not None and r_mu is not None:
            parts.append((0.2, clip(0.7 - 0.1 * (r7 - r_mu))))         # cada lpm sobre la base resta 0.1
        if s7 is not None:   # sueño: media de 3 noches
            parts.append((0.3, clip((s7 - 5) / (SLEEP_NEED_H - 5))))    # 5 h → 0 · necesidad → 1
        out[day] = sum(w * v for w, v in parts) / sum(w for w, _ in parts) if parts else None
    return out


def target_load(r: float) -> float:
    """Regla de autorregulación: fracción de las series planificadas que conviene hacer según la readiness."""
    return 1.0 if r >= 0.6 else 0.8 if r >= 0.4 else 0.6


def biometric_modulation(sessions: list[Session], ready: dict[date, float | None]) -> tuple[float, float, float]:
    vals = [v for v in ready.values() if v is not None]
    if len(vals) < 3:                                # con menos de 3 días de datos no se juzga nada: β neutra
        return 1.0, 0.7, 0.5
    r_bar = st.mean(vals)
    al = []
    for s in sessions:
        if ready.get(s.day) is None or not s.planned_hard_sets:   # sin readiness ese día no se juzga la autorregulación
            continue
        done = sum(1 for e in s.exercises for x in e.sets if x.completed) / s.planned_hard_sets
        al.append(clip(1 - abs(done - target_load(ready[s.day])) / 0.4))
    a_bar = st.mean(al) if al else 0.5
    beta = clip(1 - 0.30 * max(0.0, 0.7 - r_bar) + 0.10 * (a_bar - 0.5), 0.85, 1.05)
    return beta, r_bar, a_bar


# ─────────────────────── Fatiga acumulada: penalización Φ ───────────────────────
def fatigue_penalty(sessions_window: list[Session], sessions_all: list[Session], end: date) -> tuple[float, dict]:
    def load(ss):
        return sum(fat_cost(x.rir if x.rir is not None else 2) * (COMPOUND_FAT if e.kind != "isolation" else 1.0)
                   for s in ss for e in s.exercises for x in e.sets if x.completed)

    acute = load([s for s in sessions_window if (end - s.day).days < 7]) / 7
    chronic = load(sessions_window) / WINDOW_DAYS
    acwr = acute / chronic if chronic else 1.0
    phi_spike = min(10.0, 40 * max(0.0, acwr - 1.3))

    comp = [x for s in sessions_window for e in s.exercises if e.kind != "isolation" for x in e.sets
            if x.completed and x.rir is not None]
    fail_share = sum(1 for x in comp if x.rir <= 0) / len(comp) if comp else 0.0
    phi_fail = min(8.0, 40 * max(0.0, fail_share - 0.25))

    drops = n = 0
    for pts in exercise_series(sessions_all).values():
        if len(pts) < 4 or (end - pts[-1][0]).days > 10:
            continue
        n += 1
        if pts[-1][1] < 0.97 * st.median(v for _, v in pts[-4:-1]):   # último e1RM >3 % por debajo de los 3 anteriores
            drops += 1
    frac = drops / n if n else 0.0
    phi_perf = min(10.0, 25 * max(0.0, frac - 0.15))

    parts = {"acwr": round(acwr, 2), "pico_carga": phi_spike, "fallo_multiart": phi_fail,
             "caida_rendimiento": phi_perf, "ejercicios_en_caida": f"{drops}/{n}"}
    return min(25.0, phi_spike + phi_fail + phi_perf), parts


# ─────────────────────────────── Índice global ───────────────────────────────
BANDS = [(80, "Óptimo"), (60, "Productivo"), (40, "Mantenimiento"), (0, "Insuficiente")]


def compute_iho(sessions: list[Session], bio_all: list[Biometrics], end: date, planned_per_week: int = 4) -> Result:
    start = end - timedelta(days=WINDOW_DAYS - 1)
    win = [s for s in sessions if 0 <= (end - s.day).days < WINDOW_DAYS]
    prog = [s for s in sessions if 0 <= (end - s.day).days < PROG_DAYS]
    weeks = WINDOW_DAYS / 7
    eff, raw = effective_volume(win, weeks)
    comps = {
        "V": comp_volume(eff),
        "P": comp_proximity(win),
        "S": comp_progression(prog, start),
        "A": comp_adherence(win, planned_per_week, weeks),
        "D": comp_density(win),
    }
    tw = sum(W[k] for k, v in comps.items() if v is not None)
    base = sum(W[k] * v for k, v in comps.items() if v is not None) / tw   # pesos redistribuidos si falta un componente
    ready = readiness_series(bio_all, start, end)
    beta, r_bar, a_bar = biometric_modulation(win, ready)
    phi, parts = fatigue_penalty(win, prog, end)
    score = int(jround(clip(beta * base - phi, 0, 100)))
    over_mrv = sum(1 for m in MAJOR if m in LANDMARKS and eff.get(m, 0) > LANDMARKS[m][2])
    # Riesgo = firma de sobrecarga no funcional: fatiga alta, o rendimiento que cae / volumen > MRV con mala recuperación
    risk = phi >= 12 or (r_bar < 0.45 and (parts["caida_rendimiento"] > 0 or over_mrv >= 2))
    # Puerta de calidad: si la mayoría de series se quedan a RIR ≥ 5, no hay estímulo suficiente para ser "productivo"
    logged = [x.rir for s in win for e in s.exercises for x in e.sets if x.completed and x.rir is not None]
    junk = sum(1 for r in logged if r >= 5) / len(logged) if logged else 0.0
    if risk or junk > 0.5:
        score = min(score, 59)
    label = "Sobrecarga / riesgo" if risk else next(t for lim, t in BANDS if score >= lim)
    return Result(comps, beta, phi, parts, r_bar, a_bar, score, label, risk, junk, eff, raw)


# ─────────────────────────────── Simulador ───────────────────────────────
SPLIT = {   # (nombre, músculo principal, secundarios, tipo, series base, rango de reps, e1RM inicial kg)
    "Torso A": [("Press inclinado máquina", "Pectoral", ("Tríceps",), "compound", 4, (8, 12), 95),
                ("Remo pecho apoyado", "Espalda", ("Bíceps",), "compound", 4, (8, 12), 100),
                ("Elevaciones laterales polea", "Deltoides lateral", (), "isolation", 4, (12, 20), 18),
                ("Curl inclinado", "Bíceps", (), "isolation", 3, (10, 15), 20),
                ("Extensión tríceps sobre cabeza", "Tríceps", (), "isolation", 3, (10, 15), 35)],
    "Pierna A": [("Sentadilla hack", "Cuádriceps", ("Glúteos",), "compound_heavy", 4, (6, 10), 160),
                 ("Peso muerto rumano", "Isquiosurales", ("Glúteos",), "compound", 3, (8, 12), 130),
                 ("Extensión de cuádriceps", "Cuádriceps", (), "isolation", 3, (10, 15), 80),
                 ("Curl femoral sentado", "Isquiosurales", (), "isolation", 3, (10, 15), 70),
                 ("Gemelo de pie", "Gemelos", (), "isolation", 4, (10, 15), 120)],
    "Torso B": [("Press banca", "Pectoral", ("Tríceps",), "compound_heavy", 4, (6, 10), 105),
                ("Jalón agarre neutro", "Espalda", ("Bíceps",), "compound", 4, (8, 12), 90),
                ("Aperturas polea baja", "Pectoral", (), "isolation", 3, (12, 15), 30),
                ("Elevaciones laterales máquina", "Deltoides lateral", (), "isolation", 4, (12, 20), 40),
                ("Remo unilateral polea", "Espalda", ("Bíceps",), "compound", 3, (10, 15), 60),
                ("Curl en polea", "Bíceps", (), "isolation", 3, (10, 15), 25),
                ("Press francés polea", "Tríceps", (), "isolation", 3, (10, 15), 40)],
    "Pierna B": [("Prensa 45º", "Cuádriceps", ("Glúteos",), "compound", 4, (8, 12), 260),
                 ("Hip thrust máquina", "Glúteos", (), "compound", 3, (8, 12), 180),
                 ("Curl femoral tumbado", "Isquiosurales", (), "isolation", 3, (10, 15), 60),
                 ("Extensión de cuádriceps", "Cuádriceps", (), "isolation", 3, (10, 15), 80),
                 ("Gemelo sentado", "Gemelos", (), "isolation", 4, (12, 20), 90)],
}
WEEK_PLAN = [(0, "Torso A"), (1, "Pierna A"), (3, "Torso B"), (4, "Pierna B")]   # lun, mar, jue, vie


@dataclass
class Scenario:
    name: str
    sets_mult: float          # multiplicador de series sobre el plan base
    rir: tuple[float, float]  # media y desviación del RIR
    rest: dict[str, tuple[int, int]]  # descanso real (media, desviación) por tipo
    prog_week: float          # % e1RM por semana
    completion: float         # fracción de series planificadas que se hacen
    sleep_h: float
    hrv_shift: float          # cambio de lnRMSSD respecto a la base al final del bloque
    rhr_shift: float
    late_spike: float = 1.0   # multiplicador de series en las 2 últimas semanas
    late_prog: float | None = None   # % e1RM/semana en las 3 últimas semanas
    bad_week: bool = False    # semana 7: dormir mal y autorregular (hacer el 60 % de las series)
    log_rir: float = 1.0      # fracción de series con RIR registrado


SCENARIOS = [
    Scenario("A · Óptimo", 1.0, (1.8, 0.8), {"compound_heavy": (170, 25), "compound": (130, 20), "isolation": (90, 15)},
             0.9, 0.96, 7.7, 0.0, 0.0),
    Scenario("B · Volumen basura", 1.7, (4.8, 0.7), {"compound_heavy": (70, 10), "compound": (55, 10), "isolation": (40, 8)},
             0.0, 0.95, 7.4, 0.0, 0.0),
    Scenario("C · Sobrecarga", 1.5, (0.4, 0.5), {"compound_heavy": (150, 25), "compound": (120, 20), "isolation": (80, 15)},
             0.8, 1.0, 5.9, -0.30, 6.0, late_spike=1.35, late_prog=-1.8),
    Scenario("D · Autorregulado", 1.0, (1.8, 0.8), {"compound_heavy": (170, 25), "compound": (130, 20), "isolation": (90, 15)},
             0.8, 0.96, 7.6, 0.0, 0.0, bad_week=True),
]


def simulate(sc: Scenario, end: date, seed: int = 7):
    rnd = random.Random(seed)
    start = end - timedelta(days=PROG_DAYS - 1)
    base_e1 = {ex[0]: ex[6] for day in SPLIT.values() for ex in day}
    sessions: list[Session] = []
    for d in range(PROG_DAYS):
        day = start + timedelta(days=d)
        week = d // 7
        bad = sc.bad_week and week == 6
        plan = next((n for wd, n in WEEK_PLAN if wd == day.weekday()), None)
        if not plan:
            continue
        mult = sc.sets_mult * (sc.late_spike if d >= PROG_DAYS - 14 else 1.0)
        exs, planned = [], 0
        for name, prim, sec, kind, nsets, (lo, hi), _ in SPLIT[plan]:
            n_plan = max(1, round(nsets * mult))
            planned += n_plan
            n_do = round(n_plan * (0.6 if bad else 1.0))
            weeks_in = d / 7
            if sc.late_prog is not None and d >= PROG_DAYS - 21:
                g = (1 + sc.prog_week / 100) ** ((PROG_DAYS - 21) / 7) * (1 + sc.late_prog / 100) ** ((d - (PROG_DAYS - 21)) / 7)
            else:
                g = (1 + sc.prog_week / 100) ** weeks_in
            true_e1 = base_e1[name] * g * (1 + rnd.gauss(0, 0.008))
            sets = []
            for i in range(n_plan):
                rir = clip(round(rnd.gauss(*sc.rir) * 2) / 2, 0, 8)
                reps = rnd.randint(lo, hi)
                load = round(true_e1 / (1 + (reps + rir) / 30) / 2.5) * 2.5
                rest = None if i == 0 else max(20, int(rnd.gauss(*sc.rest[kind])))
                done = i < n_do and rnd.random() < sc.completion
                logged = rnd.random() < sc.log_rir
                sets.append(SetLog(load, reps, rir if logged else None, rest, done))
            exs.append(ExerciseLog(name, prim, sec, kind, sets))
        sessions.append(Session(day, planned, exs))

    def bio_day(day, frac, shift_h, shift_r, sleep, bad=False):
        return Biometrics(day,
                          round(4.20 + shift_h * frac + rnd.gauss(0, 0.10) - (0.25 if bad else 0), 3),
                          round(55 + shift_r * frac + rnd.gauss(0, 1.2) + (4 if bad else 0), 1),
                          round(clip(rnd.gauss(sleep if not bad else 5.3, 0.45), 3, 10), 2))

    baseline = [bio_day(start - timedelta(days=60 - i), 0, 0, 0, 7.6) for i in range(60)]
    bio = [bio_day(start + timedelta(days=d), max(0.0, (d - 21) / (PROG_DAYS - 21)), sc.hrv_shift, sc.rhr_shift,
                   sc.sleep_h, bad=sc.bad_week and d // 7 == 6) for d in range(PROG_DAYS)]
    return sessions, baseline + bio


# ─────────────────────────────── Informe ───────────────────────────────
def fmt(v):
    return "  —  " if v is None else f"{v:5.1f}"


def main():
    end = date(2026, 10, 25)
    results = {}
    print("IHO · Índice de Hipertrofia Optimizado — simulación (ventana 28 días hasta", end.isoformat(), ")\n")
    print(f"{'Escenario':22} {'C_V':>5} {'C_P':>5} {'C_S':>5} {'C_A':>5} {'C_D':>5} │ {'R̄':>4} {'Ā':>4} {'β':>5} {'Φ':>5} │ {'IHO':>3}  Estado")
    print("─" * 98)
    for sc in SCENARIOS:
        sessions, bio_all = simulate(sc, end)
        r = compute_iho(sessions, bio_all, end)
        results[sc.name[0]] = r
        c = r.comps
        print(f"{sc.name:22} {fmt(c['V'])} {fmt(c['P'])} {fmt(c['S'])} {fmt(c['A'])} {fmt(c['D'])} │ "
              f"{r.readiness:4.2f} {r.alignment:4.2f} {r.beta:5.3f} {r.phi:5.1f} │ {r.iho:3d}  {r.label}")

    print("\nDetalle de la fatiga acumulada (Φ):")
    for k, r in results.items():
        p = r.phi_parts
        print(f"  {k}: ACWR {p['acwr']:.2f} → pico {p['pico_carga']:.1f} · fallo en multiarticulares {p['fallo_multiart']:.1f}"
              f" · caída de rendimiento {p['caida_rendimiento']:.1f} ({p['ejercicios_en_caida']} ejercicios)")

    b = results["B"]
    print(f"\nVolumen basura al descubierto — B · {b.junk_share:.0%} de las series a RIR ≥ 5 · series/semana registradas vs efectivas:")
    for m in ["Pectoral", "Espalda", "Cuádriceps", "Bíceps", "Deltoides lateral"]:
        mev, mav, mrv = LANDMARKS[m]
        print(f"  {m:18} registradas {b.raw_volume.get(m, 0):5.1f} · efectivas {b.eff_volume.get(m, 0):5.1f}"
              f"  (MEV {mev} · MAV {mav} · MRV {mrv})")

    # Invariantes del modelo (si alguno falla, el modelo está mal calibrado)
    A, B, C, D = (results[k] for k in "ABCD")
    assert A.label == "Óptimo" and A.iho >= 80, A
    assert B.label == "Mantenimiento" and B.comps["P"] < 50, "el volumen basura no debe puntuar como productivo"
    assert C.risk and C.iho <= 59, "la sobrecarga con mala recuperación debe marcarse como riesgo"
    assert D.alignment > 0.8 and D.iho >= 75, "autorregular en una mala semana no debe hundir el índice"
    assert all(0.85 <= r.beta <= 1.05 and 0 <= r.phi <= 25 for r in results.values())
    print("\n✔ Invariantes del modelo: OK")


def export_oracle(end: date = date(2026, 10, 25), seed: int = 7) -> dict:
    """Escenarios en el formato de la app (js/core.js) con el resultado esperado: oráculo para el port en JS."""
    out = []
    for sc in SCENARIOS:
        sessions, bio_all = simulate(sc, end, seed)
        r = compute_iho(sessions, bio_all, end)
        out.append({
            "name": sc.name, "end": end.isoformat(),
            "templates": [{"id": f"t{i}", "name": n, "exercises": []} for i, n in enumerate(SPLIT)],
            "sessions": [{
                "id": i + 1, "date": s.day.isoformat(), "name": next(n for wd, n in WEEK_PLAN if wd == s.day.weekday()),
                "plannedSets": s.planned_hard_sets,
                "exercises": [{"name": e.name, "muscle": e.primary, "kind": e.kind, "sec": list(e.secondary),
                               "sets": [({"kg": x.load_kg, "reps": x.reps, "rpe": None if x.rir is None else 10 - x.rir,
                                          "done": True, "restS": x.rest_before_s} if x.completed else
                                         {"kg": None, "reps": None, "rpe": None, "done": False}) for x in e.sets]}
                              for e in s.exercises]} for i, s in enumerate(sessions)],
            "biometrics": [{"date": b.day.isoformat(), "hrv": math.exp(b.ln_rmssd) if b.ln_rmssd is not None else None,
                            "rhr": b.rhr_bpm, "sleepMin": b.sleep_h * 60 if b.sleep_h is not None else None} for b in bio_all],
            "expected": {"vol": r.comps["V"], "int": r.comps["P"], "prog": r.comps["S"], "adh": r.comps["A"], "den": r.comps["D"],
                         "beta": r.beta, "phi": r.phi, "readiness": r.readiness, "alignment": r.alignment,
                         "score": r.iho, "label": r.label, "risk": r.risk},
        })
    return {"model": "IHO 2.0", "seed": seed, "scenarios": out}


if __name__ == "__main__":
    import json
    import sys
    if "--export" in sys.argv:
        json.dump(export_oracle(), sys.stdout, ensure_ascii=False)
    else:
        main()
