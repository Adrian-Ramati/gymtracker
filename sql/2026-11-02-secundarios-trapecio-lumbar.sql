-- 2026-11-02 · Trapecio, lumbar y antebrazo como músculos secundarios en el catálogo (exercise_muscles).
-- Mismo criterio que PPCore.credits (js/core.js):
--   0,5  si el secundario se mueve con carga: trapecio en remos, encogimientos y remo al mentón; antebrazo en
--        curl martillo/invertido; lumbar en hiperextensiones.
--   0,25 si solo sujeta (isométrico): antebrazo en tracciones, pesos muertos, curls y encogimientos; lumbar en
--        remos con torso inclinado, pesos muertos, buenos días y sentadillas con barra libre.
-- Ejecutar en Supabase → SQL Editor. Se puede repetir: si la fila ya existe, actualiza el crédito.
insert into exercise_muscles (exercise_id, muscle, credit)
select v.exercise_id, v.muscle, v.credit from (values
  (296, $q$Antebrazo$q$, 0.25),  -- Dominadas Pronas
  (297, $q$Antebrazo$q$, 0.25),  -- Dominadas Supinas
  (298, $q$Antebrazo$q$, 0.25),  -- Dominadas Neutras
  (299, $q$Antebrazo$q$, 0.25),  -- Jalón al Pecho Prono
  (300, $q$Antebrazo$q$, 0.25),  -- Jalón al Pecho Supino
  (301, $q$Antebrazo$q$, 0.25),  -- Jalón al Pecho Neutro
  (302, $q$Antebrazo$q$, 0.25),  -- Jalón al Pecho en Banco Inclinado
  (303, $q$Antebrazo$q$, 0.25),  -- Jalón Unilateral en Banco Inclinado
  (304, $q$Antebrazo$q$, 0.25),  -- Remo con Barra Supino
  (305, $q$Antebrazo$q$, 0.25),  -- Remo Gironda Alto
  (306, $q$Antebrazo$q$, 0.25),  -- Remo Gironda
  (307, $q$Antebrazo$q$, 0.25),  -- Remo en Máquina Prono
  (308, $q$Antebrazo$q$, 0.25),  -- Remo en Máquina Neutro
  (309, $q$Antebrazo$q$, 0.25),  -- Remo en Máquina de Pie
  (310, $q$Antebrazo$q$, 0.25),  -- Remo Gironda Unilateral
  (311, $q$Antebrazo$q$, 0.25),  -- Seal Row con Mancuernas en Banco Inclinado
  (312, $q$Antebrazo$q$, 0.25),  -- Remo en Polea Unilateral – Bench Cable Row
  (315, $q$Antebrazo$q$, 0.25),  -- Remo con Mancuerna Unilateral
  (316, $q$Antebrazo$q$, 0.25),  -- Remo desde Polea Baja con Cuerda en Banco Inclinado
  (317, $q$Antebrazo$q$, 0.25),  -- Meadows Row
  (319, $q$Antebrazo$q$, 0.25),  -- Jalón al Pecho Focus Espalda Alta
  (320, $q$Antebrazo$q$, 0.25),  -- Remo en Polea Plano Transversal
  (321, $q$Antebrazo$q$, 0.25),  -- Jalón Unilateral Sentado
  (322, $q$Antebrazo$q$, 0.25),  -- Remo Gironda Agarres Independientes
  (323, $q$Antebrazo$q$, 0.25),  -- Dante Row
  (325, $q$Antebrazo$q$, 0.25),  -- Remo Pendlay
  (326, $q$Antebrazo$q$, 0.25),  -- Remo en Multipower
  (327, $q$Antebrazo$q$, 0.25),  -- Remo en Punta
  (328, $q$Antebrazo$q$, 0.25),  -- Remo en T
  (329, $q$Antebrazo$q$, 0.25),  -- Single Arm Landmine Row
  (330, $q$Antebrazo$q$, 0.25),  -- Incline Bench Dumbbell Row
  (331, $q$Antebrazo$q$, 0.25),  -- Remo con Mancuernas Torso Inclinado
  (332, $q$Antebrazo$q$, 0.25),  -- Jalón Unilateral en Máquina
  (335, $q$Antebrazo$q$, 0.25),  -- Seal Row con Barra
  (336, $q$Antebrazo$q$, 0.25),  -- Helms Row
  (337, $q$Antebrazo$q$, 0.25),  -- Rack Pull
  (338, $q$Antebrazo$q$, 0.25),  -- Encogimientos con Mancuernas
  (339, $q$Antebrazo$q$, 0.25),  -- Encogimientos con Barra
  (340, $q$Antebrazo$q$, 0.25),  -- Encogimientos desde Polea Baja
  (341, $q$Antebrazo$q$, 0.25),  -- Encogimientos en Máquina de Press
  (342, $q$Antebrazo$q$, 0.25),  -- Encogimientos en Banco Inclinado con Mancuernas
  (405, $q$Antebrazo$q$, 0.25),  -- Curl de Bíceps con Barra de Pie
  (406, $q$Antebrazo$q$, 0.5),  -- Curl Martillo con Mancuernas
  (407, $q$Antebrazo$q$, 0.25),  -- Curl con Barra Romana
  (408, $q$Antebrazo$q$, 0.25),  -- Curl de Bíceps Mancuernas
  (409, $q$Antebrazo$q$, 0.25),  -- Drag Curl con Barra
  (410, $q$Antebrazo$q$, 0.25),  -- Curl Tumbado en Banco Inclinado con Mancuernas
  (411, $q$Antebrazo$q$, 0.25),  -- Curl Bayesian en Polea Sentado
  (412, $q$Antebrazo$q$, 0.25),  -- Curl Predicador con Mancuerna Unilateral
  (413, $q$Antebrazo$q$, 0.25),  -- Curl Predicador en Máquina
  (414, $q$Antebrazo$q$, 0.25),  -- Curl Predicador en Polea Unilateral
  (415, $q$Antebrazo$q$, 0.25),  -- Curl desde Polea Baja con Barra
  (416, $q$Antebrazo$q$, 0.25),  -- Curl Araña con Mancuernas
  (417, $q$Antebrazo$q$, 0.25),  -- Curl Araña con Barra
  (418, $q$Antebrazo$q$, 0.25),  -- Curl Araña en Polea
  (419, $q$Antebrazo$q$, 0.25),  -- Curl en Máquina Sentado
  (420, $q$Antebrazo$q$, 0.25),  -- Curl Predicador de Pie desde Polea Baja
  (422, $q$Antebrazo$q$, 0.25),  -- Curl Concentrado con Mancuerna
  (423, $q$Antebrazo$q$, 0.5),  -- Curl Martillo desde Polea Baja
  (487, $q$Antebrazo$q$, 0.25),  -- Peso Muerto Rumano - RDL
  (488, $q$Antebrazo$q$, 0.25),  -- Peso Muerto Piernas Rígidas – SLDL
  (489, $q$Antebrazo$q$, 0.25),  -- Peso Muerto Unilateral con Mancuerna
  (496, $q$Antebrazo$q$, 0.25),  -- Peso Muerto Unilateral con Barra
  (521, $q$Antebrazo$q$, 0.5),  -- Remo en máquina prono - Hammer Strength
  (530, $q$Antebrazo$q$, 0.25),  -- Peso Muerto Rumano en máquina - Technogym
  (534, $q$Antebrazo$q$, 0.25),  -- Jalón al pecho en máquina - Technogym
  (536, $q$Antebrazo$q$, 0.5),  -- Jalón al pecho en máquina - Hammer Strength
  (537, $q$Antebrazo$q$, 0.25),  -- Remo en máquina neutro - Technogym
  (304, $q$Lumbar$q$, 0.25),  -- Remo con Barra Supino
  (317, $q$Lumbar$q$, 0.25),  -- Meadows Row
  (325, $q$Lumbar$q$, 0.25),  -- Remo Pendlay
  (326, $q$Lumbar$q$, 0.25),  -- Remo en Multipower
  (327, $q$Lumbar$q$, 0.25),  -- Remo en Punta
  (328, $q$Lumbar$q$, 0.25),  -- Remo en T
  (331, $q$Lumbar$q$, 0.25),  -- Remo con Mancuernas Torso Inclinado
  (337, $q$Lumbar$q$, 0.25),  -- Rack Pull
  (456, $q$Lumbar$q$, 0.5),  -- Reverse Glute Hyperextensions en Multipower
  (458, $q$Lumbar$q$, 0.5),  -- Extensiones en Banco Inclinado 45º Focus Glúteo
  (464, $q$Lumbar$q$, 0.5),  -- Reverse Glute Hyperextensions en Máquina
  (481, $q$Lumbar$q$, 0.25),  -- Safety Bar Squat
  (482, $q$Lumbar$q$, 0.25),  -- Sentadilla Barra Alta
  (487, $q$Lumbar$q$, 0.25),  -- Peso Muerto Rumano - RDL
  (488, $q$Lumbar$q$, 0.25),  -- Peso Muerto Piernas Rígidas – SLDL
  (489, $q$Lumbar$q$, 0.25),  -- Peso Muerto Unilateral con Mancuerna
  (490, $q$Lumbar$q$, 0.25),  -- Buenos Días Multipower
  (494, $q$Lumbar$q$, 0.5),  -- Extensiones Banco Inclinado Focus Isquiosural
  (495, $q$Lumbar$q$, 0.25),  -- Buenos Días con Barra
  (496, $q$Lumbar$q$, 0.25),  -- Peso Muerto Unilateral con Barra
  (530, $q$Lumbar$q$, 0.25),  -- Peso Muerto Rumano en máquina - Technogym
  (304, $q$Trapecio$q$, 0.5),  -- Remo con Barra Supino
  (305, $q$Trapecio$q$, 0.5),  -- Remo Gironda Alto
  (306, $q$Trapecio$q$, 0.5),  -- Remo Gironda
  (307, $q$Trapecio$q$, 0.5),  -- Remo en Máquina Prono
  (308, $q$Trapecio$q$, 0.5),  -- Remo en Máquina Neutro
  (309, $q$Trapecio$q$, 0.5),  -- Remo en Máquina de Pie
  (310, $q$Trapecio$q$, 0.5),  -- Remo Gironda Unilateral
  (311, $q$Trapecio$q$, 0.5),  -- Seal Row con Mancuernas en Banco Inclinado
  (312, $q$Trapecio$q$, 0.5),  -- Remo en Polea Unilateral – Bench Cable Row
  (315, $q$Trapecio$q$, 0.5),  -- Remo con Mancuerna Unilateral
  (316, $q$Trapecio$q$, 0.5),  -- Remo desde Polea Baja con Cuerda en Banco Inclinado
  (317, $q$Trapecio$q$, 0.5),  -- Meadows Row
  (320, $q$Trapecio$q$, 0.5),  -- Remo en Polea Plano Transversal
  (322, $q$Trapecio$q$, 0.5),  -- Remo Gironda Agarres Independientes
  (323, $q$Trapecio$q$, 0.5),  -- Dante Row
  (325, $q$Trapecio$q$, 0.5),  -- Remo Pendlay
  (326, $q$Trapecio$q$, 0.5),  -- Remo en Multipower
  (327, $q$Trapecio$q$, 0.5),  -- Remo en Punta
  (328, $q$Trapecio$q$, 0.5),  -- Remo en T
  (329, $q$Trapecio$q$, 0.5),  -- Single Arm Landmine Row
  (330, $q$Trapecio$q$, 0.5),  -- Incline Bench Dumbbell Row
  (331, $q$Trapecio$q$, 0.5),  -- Remo con Mancuernas Torso Inclinado
  (335, $q$Trapecio$q$, 0.5),  -- Seal Row con Barra
  (336, $q$Trapecio$q$, 0.5),  -- Helms Row
  (337, $q$Trapecio$q$, 0.5),  -- Rack Pull
  (362, $q$Trapecio$q$, 0.5),  -- Remo al Mentón en Multipower
  (363, $q$Trapecio$q$, 0.5),  -- Remo al Mentón con Barra
  (364, $q$Trapecio$q$, 0.5),  -- Remo al Mentón desde Polea Baja
  (365, $q$Trapecio$q$, 0.5),  -- Remo al Mentón con Mancuernas
  (521, $q$Trapecio$q$, 0.5),  -- Remo en máquina prono - Hammer Strength
  (537, $q$Trapecio$q$, 0.5)  -- Remo en máquina neutro - Technogym
) v(exercise_id, muscle, credit)
join exercises e on e.id = v.exercise_id
on conflict (exercise_id, muscle) do update set credit = excluded.credit;
