-- 2026-11-02 · Trapecio y lumbar como músculos secundarios (0,5 series) en remos, pesos muertos,
-- buenos días, hiperextensiones, remo al mentón y sentadillas con barra libre.
-- Mismo criterio que PPCore.autoSecondary (js/core.js). Solo añade: lo que ya hubiera no se toca.
-- Ejecutar una vez en Supabase → SQL Editor (se puede repetir sin problema).
insert into exercise_muscles (exercise_id, muscle, credit)
select v.exercise_id, v.muscle, v.credit from (values
  (537, $q$Trapecio$q$, 0.5),  -- Remo en máquina neutro - Technogym
  (307, $q$Trapecio$q$, 0.5),  -- Remo en Máquina Prono
  (530, $q$Lumbar$q$, 0.5),  -- Peso Muerto Rumano en máquina - Technogym
  (521, $q$Trapecio$q$, 0.5),  -- Remo en máquina prono - Hammer Strength
  (304, $q$Trapecio$q$, 0.5),  -- Remo con Barra Supino
  (304, $q$Lumbar$q$, 0.5),  -- Remo con Barra Supino
  (305, $q$Trapecio$q$, 0.5),  -- Remo Gironda Alto
  (306, $q$Trapecio$q$, 0.5),  -- Remo Gironda
  (308, $q$Trapecio$q$, 0.5),  -- Remo en Máquina Neutro
  (309, $q$Trapecio$q$, 0.5),  -- Remo en Máquina de Pie
  (310, $q$Trapecio$q$, 0.5),  -- Remo Gironda Unilateral
  (311, $q$Trapecio$q$, 0.5),  -- Seal Row con Mancuernas en Banco Inclinado
  (312, $q$Trapecio$q$, 0.5),  -- Remo en Polea Unilateral – Bench Cable Row
  (315, $q$Trapecio$q$, 0.5),  -- Remo con Mancuerna Unilateral
  (316, $q$Trapecio$q$, 0.5),  -- Remo desde Polea Baja con Cuerda en Banco Inclinado
  (317, $q$Trapecio$q$, 0.5),  -- Meadows Row
  (317, $q$Lumbar$q$, 0.5),  -- Meadows Row
  (320, $q$Trapecio$q$, 0.5),  -- Remo en Polea Plano Transversal
  (322, $q$Trapecio$q$, 0.5),  -- Remo Gironda Agarres Independientes
  (323, $q$Trapecio$q$, 0.5),  -- Dante Row
  (325, $q$Trapecio$q$, 0.5),  -- Remo Pendlay
  (325, $q$Lumbar$q$, 0.5),  -- Remo Pendlay
  (326, $q$Trapecio$q$, 0.5),  -- Remo en Multipower
  (326, $q$Lumbar$q$, 0.5),  -- Remo en Multipower
  (327, $q$Trapecio$q$, 0.5),  -- Remo en Punta
  (327, $q$Lumbar$q$, 0.5),  -- Remo en Punta
  (328, $q$Trapecio$q$, 0.5),  -- Remo en T
  (328, $q$Lumbar$q$, 0.5),  -- Remo en T
  (329, $q$Trapecio$q$, 0.5),  -- Single Arm Landmine Row
  (330, $q$Trapecio$q$, 0.5),  -- Incline Bench Dumbbell Row
  (331, $q$Trapecio$q$, 0.5),  -- Remo con Mancuernas Torso Inclinado
  (331, $q$Lumbar$q$, 0.5),  -- Remo con Mancuernas Torso Inclinado
  (335, $q$Trapecio$q$, 0.5),  -- Seal Row con Barra
  (336, $q$Trapecio$q$, 0.5),  -- Helms Row
  (337, $q$Lumbar$q$, 0.5),  -- Rack Pull
  (337, $q$Trapecio$q$, 0.5),  -- Rack Pull
  (362, $q$Trapecio$q$, 0.5),  -- Remo al Mentón en Multipower
  (363, $q$Trapecio$q$, 0.5),  -- Remo al Mentón con Barra
  (364, $q$Trapecio$q$, 0.5),  -- Remo al Mentón desde Polea Baja
  (365, $q$Trapecio$q$, 0.5),  -- Remo al Mentón con Mancuernas
  (456, $q$Lumbar$q$, 0.5),  -- Reverse Glute Hyperextensions en Multipower
  (458, $q$Lumbar$q$, 0.5),  -- Extensiones en Banco Inclinado 45º Focus Glúteo
  (464, $q$Lumbar$q$, 0.5),  -- Reverse Glute Hyperextensions en Máquina
  (481, $q$Lumbar$q$, 0.5),  -- Safety Bar Squat
  (482, $q$Lumbar$q$, 0.5),  -- Sentadilla Barra Alta
  (487, $q$Lumbar$q$, 0.5),  -- Peso Muerto Rumano - RDL
  (488, $q$Lumbar$q$, 0.5),  -- Peso Muerto Piernas Rígidas – SLDL
  (489, $q$Lumbar$q$, 0.5),  -- Peso Muerto Unilateral con Mancuerna
  (490, $q$Lumbar$q$, 0.5),  -- Buenos Días Multipower
  (494, $q$Lumbar$q$, 0.5),  -- Extensiones Banco Inclinado Focus Isquiosural
  (495, $q$Lumbar$q$, 0.5),  -- Buenos Días con Barra
  (496, $q$Lumbar$q$, 0.5)  -- Peso Muerto Unilateral con Barra
) v(exercise_id, muscle, credit)
join exercises e on e.id = v.exercise_id
on conflict (exercise_id, muscle) do nothing;
