-- Corrección de textos de ejercicios (21-oct-2026)
-- Arregla faltas de ortografía y frases cortadas en descripción, ejecución y consejos,
-- y corrige 15 nombres con erratas. Solo toca las filas que cambian (256).
-- Cambios: 15 nombres · 255 descripciones · 254 ejecuciones · 233 listas de consejos.
--
-- Cómo aplicarlo: Supabase → SQL Editor → New query → pega este archivo → Run.
-- Antes de cambiar nada guarda una copia completa en exercises_backup_20261021.
-- La app ya traduce los nombres antiguos (js/core.js, EX_RENAMES), así que el historial
-- y las rutinas siguen enlazados tanto antes como después de ejecutar esto.
--
-- Deshacer (si hiciera falta):
--   update exercises e set name=b.name, description=b.description, execution=b.execution, cues=b.cues
--   from exercises_backup_20261021 b where b.id=e.id;

begin;

create table if not exists exercises_backup_20261021 as select * from exercises;

-- 257 · Press con Mancuernas Ligera Inclinación
update exercises set
  description=$t$Este ejercicio es una variante de press con mancuernas en la que elevamos ligeramente la parte del apoyo de la cabeza del banco con el objetivo de alinear las fibras del pectoral con la dirección del movimiento. El objetivo no es simplemente elevar las mancuernas. Realiza retracción escapular, pero sin un arco lumbar excesivo: esto te ayudará a estar más cómodo y conseguirás elongar en mayor medida (más ROM), dando un mejor estímulo.$t$,
  execution=$t$Coloca las mancuernas sobre tus rodillas y vuélcate hacia atrás en el banco. En la posición de partida, realizando retracción escapular y con el pectoral en estiramiento, lleva los codos a un ángulo de entre 60º y 90º (donde más cómodo te encuentres) y empuja las mancuernas hacia arriba. El objetivo principal no debe ser juntar o chocar las mancuernas en la parte alta del movimiento, sino llevar y acercar el húmero al pectoral en la dirección de sus fibras, por lo que lo más normal será que no lleguen a juntarse del todo arriba.$t$,
  cues=array[$t$Céntrate en la trayectoria del húmero al empujar hacia arriba, no en juntar las mancuernas.$t$,
    $t$No hagas un excesivo arco lumbar.$t$,
    $t$No despegues el culo del banco.$t$,
    $t$No cierres excesivamente los codos, busca una posición cómoda entre 60-90º.$t$]::text[]
where id=257;

-- 258 · Press Inclinado con Mancuernas
update exercises set
  description=$t$En esta variante de press llevamos la inclinación del banco hacia los 30-60º, buscando la posición más cómoda, siendo 45º la más utilizada, aunque parece ser que en los press inclinados 30º sería la inclinación óptima para activar la porción clavicular del pectoral (13). Se busca una mayor incidencia en el haz clavicular del pectoral (pectoral superior) debido a la trayectoria del húmero respecto al pectoral y a la alineación del movimiento. Realizar un arco lumbar excesivo en este ejercicio reduciría la inclinación y lo acercaría a un press plano.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar, lo convertirías en un press plano.$t$,
    $t$No pierdas la verticalidad del movimiento.$t$,
    $t$Alinea la dirección del brazo (húmero) con las fibras del pectoral, realizando un movimiento conjunto de aducción.$t$,
    $t$No despegues la cadera del banco.$t$]::text[]
where id=258;

-- 259 · Press Plano Mancuernas
update exercises set
  description=$t$Este ejercicio es una variante de press que, en el caso de algunas personas con ciertas molestias de hombro, como puede ocurrir en un press de banca con barra, puede ser un ejercicio muy interesante. La ventaja respecto a la barra es que, en primer lugar, podemos aumentar el ROM y enfatizar especialmente la última zona de estiramiento, además de añadir al movimiento una ligera aducción horizontal, movimiento clave para un mayor estímulo del pectoral.$t$,
  execution=$t$Coloca las mancuernas sobre tus rodillas. Tumbado en el banco, en la posición de partida, realiza retracción escapular y, con el pectoral en estiramiento, lleva los codos a un ángulo de entre 60º y 90º (donde te encuentres cómodo) y empuja las mancuernas hacia arriba. El objetivo principal no debe ser juntar o chocar las mancuernas en la parte alta del movimiento, sino llevar y acercar el húmero al pectoral en la dirección de sus fibras, por lo que lo más normal será que no lleguen a juntarse del todo arriba.$t$,
  cues=array[$t$Céntrate en la trayectoria del húmero al empujar hacia arriba, no en juntar las mancuernas.$t$,
    $t$No hagas un excesivo arco lumbar.$t$,
    $t$No despegues el culo del banco.$t$,
    $t$No cierres excesivamente los codos, busca una posición cómoda entre 60-90º.$t$]::text[]
where id=259;

-- 260 · Press Declinado con Barra
update exercises set
  description=$t$El objetivo de colocar el banco en una inclinación negativa es realizar una trayectoria descendente del húmero que permita una mayor incidencia en las fibras inferiores del pectoral. No existe una inclinación concreta: si el banco es ajustable, busca un punto cómodo. Al igual que en otros tipos de press, un recorrido completo implica tocar la barra en el pecho, sin rebote.$t$,
  execution=$t$Túmbate en el banco, asegurando la estabilidad del cuerpo con un correcto apoyo de los pies. Saca la barra y llévala ligeramente por debajo de la línea del pectoral; partiendo desde ahí, empuja realizando una trayectoria lo más perpendicular al suelo posible. Trata de mantener la muñeca alineada y paralela al antebrazo a lo largo del recorrido. Puedes añadir una pequeña pausa isométrica tanto al inicio como al final del movimiento, ya que permite dar un mejor estímulo o mejorar tu sensación del pectoral. Es importante que los movimientos sean controlados y seguros. También puede realizarse en multipower.$t$,
  cues=array[$t$No despegues el glúteo del banco.$t$,
    $t$Lleva la barra lo más vertical posible.$t$,
    $t$No lleves la barra al cuello, sino ligeramente por debajo de los pezones.$t$]::text[]
where id=260;

-- 261 · Press Declinado Mancuernas
update exercises set
  description=$t$El objetivo de colocar el banco en declinado es realizar una trayectoria descendente del húmero que incida más en las fibras inferiores del pectoral. No existe una inclinación concreta: si el banco es ajustable, busca un punto cómodo. Un recorrido completo implica bajar las mancuernas hasta la altura del pecho, sin rebote. La ventaja de realizarlo con mancuernas es que nos permitirá un ROM ligeramente mayor, además de realizar una ligera aducción y tener una mayor libertad de movimiento.$t$,
  execution=$t$Siéntate en el banco, asegurando la estabilidad del cuerpo con un correcto apoyo de los pies. Con las mancuernas sobre tus rodillas, túmbate en el banco controlando el movimiento y coloca las mancuernas a cada lado del pectoral para situarlo en máximo estiramiento. Desde ahí, empuja realizando una trayectoria lo más perpendicular al suelo posible. Trata de mantener la muñeca alineada y paralela al antebrazo a lo largo del recorrido. Puedes añadir una pequeña pausa isométrica en la parte baja del movimiento, evitando chocar las mancuernas arriba, ya que restaría tensión al pectoral.$t$,
  cues=array[$t$No despegues el glúteo del banco.$t$,
    $t$Lleva las mancuernas lo más vertical posible.$t$,
    $t$No lleves las mancuernas al cuello, sino ligeramente por debajo de los pezones.$t$]::text[]
where id=261;

-- 262 · Press Plano en Multipower
update exercises set
  description=$t$Este ejercicio podría ser el sustituto más directo del press de banca. La técnica no es exactamente igual, ya que la trayectoria de la barra es totalmente lineal, a diferencia de lo que ocurre en el press banca, pero tiene grandes similitudes. La multipower nos puede permitir una mayor estabilidad y aplicación de fuerza, centrándonos más en llevar un correcto estímulo sobre el pectoral.$t$,
  execution=$t$Túmbate en el banco realizando retracción escapular, con un apoyo de pies estable y sacando pecho. Selecciona una anchura de agarre que te permita alinear la muñeca, el codo y el hombro en forma de L (90º) en la parte más baja del movimiento, o ligeramente más amplia según comodidad: una anchura excesiva recortaría ROM y un agarre demasiado estrecho incidiría en exceso sobre el tríceps; este aspecto es personal. Desencaja la barra sin perder la posición del torso ni de los pies y desciende controlando la fase excéntrica hasta tocar el pecho con la barra; puedes simplemente tocar o hacer una breve pausa, pero evita el rebote. Una vez aquí, realiza una subida potente pero controlada, empujando hacia arriba hasta bloquear (o casi) los codos, a lo que puedes añadir cierta fuerza intencional tratando de unir las manos en el plano transversal para un mayor estímulo.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar ni despegues el culo del banco.$t$,
    $t$Sitúa una anchura del agarre que te permita alinear verticalmente muñeca y codo en la parte baja del movimiento.$t$,
    $t$Toca la barra con el pecho en cada repetición, eliminando el rebote.$t$,
    $t$A la par que empujas, busca realizar fuerza intencional tratando de unir las manos.$t$]::text[]
where id=262;

-- 263 · Press Ligera Inclinación en Multipower
update exercises set
  description=$t$En esta variante de press buscamos elevar ligeramente la parte del apoyo de la cabeza del banco con el objetivo de alinear las fibras del pectoral con la dirección del movimiento. La técnica es realmente similar a cuando se realiza el ejercicio totalmente plano; además, la multipower nos puede permitir una mayor estabilidad y aplicación de fuerza, centrándonos más en llevar un correcto estímulo sobre el pectoral.$t$,
  execution=$t$Túmbate en el banco, que tendrá una inclinación de 10-20º, realizando retracción escapular, con un apoyo de pies estable y sacando pecho. Selecciona una anchura de agarre que te permita alinear la muñeca, el codo y el hombro en forma de L (90º) en la parte más baja del movimiento, o ligeramente más amplia según comodidad: una anchura excesiva recortaría ROM y un agarre demasiado estrecho incidiría en exceso sobre el tríceps; este aspecto es personal. Desencaja la barra sin perder la posición del torso ni de los pies y desciende controlando la fase excéntrica hasta tocar el pecho con la barra; puedes simplemente tocar o hacer una breve pausa, pero evita el rebote. Una vez aquí, realiza una subida potente pero controlada, empujando hacia arriba hasta bloquear (o casi) los codos, a lo que puedes añadir cierta fuerza intencional tratando de unir las manos en el plano transversal para un mayor estímulo.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar ni despegues el culo del banco.$t$,
    $t$Sitúa una anchura del agarre que te permita alinear verticalmente muñeca y codo en la parte baja del movimiento.$t$,
    $t$Toca la barra con el pecho en cada repetición, eliminando el rebote.$t$,
    $t$A la par que empujas, busca realizar fuerza intencional tratando de unir las manos.$t$]::text[]
where id=263;

-- 264 · Press Inclinado en Multipower
update exercises set
  description=$t$Realizar este ejercicio en multipower nos aportará una mayor estabilidad que el resto de variantes de press inclinado, lo que puede ser interesante en muchos casos, especialmente de cara a progresar, pero no por ello se trata de un mejor ejercicio. Parece ser que 30º sería la inclinación óptima para activar la porción clavicular del pectoral (13). Ten en cuenta que permitirá mover cargas absolutas mayores, con unos requerimientos de estabilización ligeramente menores en comparación, por ejemplo, con el uso de mancuernas, además de una trayectoria más vertical y una mayor aplicación de fuerza al eliminar casi completamente las necesidades de estabilización por parte del hombro.$t$,
  execution=$t$Túmbate en un banco inclinado entre 30 y 60º, realizando retracción escapular sin arco lumbar, y saca ligeramente el pecho para situar el pectoral en estiramiento. Selecciona una anchura de agarre cómoda; para ello, busca la anchura que te permita alinear la muñeca, el codo y el hombro en forma de L (90º) en la parte más baja del movimiento: una anchura excesiva recortaría ROM y un agarre demasiado estrecho incidiría en exceso sobre el tríceps y la extensión de codo. Empuja hacia arriba para desencajar la barra sin perder el apoyo de los hombros y comienza a descender de forma controlada. Una vez llegues al pecho, evita el rebote entre repeticiones, para lo que puedes añadir una ligera pausa. Puedes también realizar ligeramente fuerza intencional de unión en el agarre, sin llegar a soltar la barra, para favorecer aún más la activación.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar ni despegues el culo del banco.$t$,
    $t$Sitúa una anchura del agarre que te permita alinear verticalmente muñeca y codo en la parte baja del movimiento.$t$,
    $t$Toca la barra con el pecho en cada repetición, eliminando el rebote.$t$]::text[]
where id=264;

-- 265 · Press Inclinado con Barra
update exercises set
  description=$t$Realizar este ejercicio con barra requerirá una mayor estabilización que hacerlo en multipower; sin embargo, puede ser interesante, especialmente en aquellos casos donde las mancuernas resulten incómodas, ya que al ir unido el agarre, aunque el ROM será algo menor, obliga a aplicar fuerza por igual con ambos brazos en caso de que haya descompensaciones. Recuerda que 30º sería la inclinación óptima para activar la porción clavicular del pectoral.$t$,
  execution=$t$Túmbate en un banco inclinado entre 30º y 60º, realizando retracción escapular pero sin arco lumbar, y saca ligeramente pecho para situar el pectoral en estiramiento. Selecciona una anchura de agarre cómoda; para ello, busca la anchura que te permita alinear la muñeca, el codo y el hombro en forma de L (90º) en la parte más baja del movimiento: una anchura excesiva recortaría ROM y un agarre demasiado estrecho incidiría en exceso sobre el tríceps y la extensión de codo. Evita el rebote en el pecho entre repeticiones, para lo que puedes añadir una ligera pausa. Desde el apoyo de la barra sobre el pecho, realiza una subida lo más perpendicular al suelo posible, centrándote en la trayectoria del húmero respecto al pectoral y pudiendo añadir ligeramente fuerza intencional de unión en el agarre sin llegar a soltar la barra.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar ni despegues el culo del banco.$t$,
    $t$Sitúa una anchura del agarre que te permita alinear verticalmente muñeca y codo en la parte baja del movimiento.$t$,
    $t$Toca la barra con el pecho en cada repetición, eliminando el rebote.$t$]::text[]
where id=265;

-- 266 · Press Inverso en Multipower
update exercises set
  description=$t$Este ejercicio se trata de un empuje horizontal con las manos en posición supina, al contrario de lo que es habitual, para incidir más en la porción clavicular del pectoral mayor, para lo cual parece interesante seleccionar un rango de repeticiones medio-alto. Debido a la posición de la muñeca, la posible incomodidad del agarre y la complejidad del ejercicio, es recomendable realizarlo en multipower para asegurar la estabilidad.$t$,
  execution=$t$Tumbado sobre el banco, busca una posición cómoda y estable; para ello, puede que incluso te ayude colocar los pies sobre él si es muy alto. Agarra la barra con las manos en posición supina (palmas mirando hacia ti) y busca una anchura de agarre ligeramente superior al ancho biacromial. Desde aquí, comienza a descender de forma controlada llevando la barra a una posición cómoda para ti; puedes tomar como referencia general la mitad del pectoral. Una vez alcances el máximo ROM, comienza la fase concéntrica empujando de forma potente pero controlada, buscando activar al máximo el pectoral y evitando realizar rebotes en el pecho entre ambas fases, para lo que puedes ayudarte de una breve pausa.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar; o directamente, no lo realices.$t$,
    $t$Trata de mantener la muñeca lo más paralela al antebrazo posible.$t$,
    $t$No coloques un peso excesivo: céntrate más en realizar correctamente el movimiento con una correcta cadencia.$t$]::text[]
where id=266;

-- 267 · Press Estrecho en Multipower
update exercises set
  description=$t$Se trata de una variante de press, en este caso en multipower, por lo que facilitaríamos aún más la estabilidad durante el ejercicio, en la que incidimos más en la musculatura del tríceps respecto a otras. Pese a todo, debe plantearse como un ejercicio predominante de pectoral, pues este debe ser el limitante; en caso de buscar que el limitante sea el tríceps, es preferible optar por un Kaz Press. Sin embargo, estaremos dándole un estímulo ligeramente superior a esta musculatura respecto a otros tipos de press, lo que puede ser interesante en muchos casos.$t$,
  execution=$t$Al contrario de lo que mucha gente piensa, la anchura del agarre no debe ser excesivamente estrecha, ya que haría el ejercicio incómodo; busca un punto cómodo que sea ligeramente más cerrado respecto a un press normal (con un ancho biacromial). Busca el máximo rango de movimiento sacando pectoral y realizando extensión completa (o casi) en cada repetición, manteniendo muñeca y antebrazo alineados para favorecer la transmisión de fuerzas y evitando rebotes en el pecho. Intenta llevar el movimiento dentro del plano transversal lo máximo posible, en lugar de al sagital, para favorecer que la musculatura limitante sea el pectoral y no el tríceps, pero favoreciendo una mayor incidencia de este en el movimiento.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar ni despegues el culo del banco.$t$,
    $t$Mantén alineados muñeca y antebrazo.$t$,
    $t$Tu codo debe formar un ángulo agudo cuando tengas la barra en el pecho.$t$]::text[]
where id=267;

-- 268 · Press Estrecho con Barra
update exercises set
  description=$t$Se trata de una variante de press en la que incidimos más en la musculatura del tríceps respecto a otras. Pese a todo, debe plantearse como un ejercicio predominante de pectoral, pues este debe ser el limitante; en caso de buscar que el limitante sea el tríceps, es preferible optar por un Kaz Press. Sin embargo, estaremos dándole un estímulo ligeramente superior a esta musculatura respecto a otros tipos de press, lo que puede ser interesante en muchos casos.$t$,
  execution=$t$Al contrario de lo que mucha gente piensa, la anchura del agarre no debe ser excesivamente estrecha, ya que haría el ejercicio incómodo; busca un punto cómodo que sea ligeramente más cerrado respecto a un press normal (con un ancho biacromial). Busca el máximo rango de movimiento posible sacando pectoral y realizando extensión completa (o casi) en cada repetición, manteniendo muñeca y antebrazo alineados para favorecer la transmisión de fuerzas y evitando rebotes. Intenta llevar el movimiento dentro del plano transversal lo máximo posible, en lugar de al sagital, para favorecer que la musculatura limitante sea el pectoral y no el tríceps, pero favoreciendo una mayor incidencia de este en el movimiento.$t$,
  cues=array[$t$No hagas un excesivo arco lumbar ni despegues el culo del banco.$t$,
    $t$Mantén alineados muñeca y antebrazo.$t$,
    $t$Tu codo debe formar un ángulo agudo cuando tengas la barra en el pecho.$t$]::text[]
where id=268;

-- 269 · Press en Máquina Prono
update exercises set
  description=$t$Este ejercicio se trata de un empuje horizontal en máquina en el que nos encontramos sentados. Puede realizarse con agarre prono o neutro; el ejercicio variará ligeramente entre ambos, aunque la técnica es prácticamente idéntica. También es posible realizarlo de forma unilateral, lo que podría ser aún más interesante.$t$,
  execution=$t$Sentado con los pies apoyados, buscando una posición estable, realiza retracción escapular y agarra las manetas sacando ligeramente pecho para situarte en posición de estiramiento. Partiendo de aquí, realiza el empuje sin perder la posición de tu caja torácica; puedes pensar en empujar con los pies y la espalda en dirección contraria al banco, como si quisieras irte hacia atrás. Puedes añadir una ligera pausa isométrica al inicio del movimiento (máximo estiramiento). Lo importante será la trayectoria del húmero, determinada por la propia máquina, aunque durante el empuje, para incidir más sobre la parte interna del pectoral, puedes tratar de hacer fuerza intencional con un brazo contra el otro mientras alejas las manetas.$t$,
  cues=array[$t$Trata de llevar los codos lo más atrás posible, sin perder la tensión en cada repetición. Es mejor si evitas que la máquina choque de nuevo con los soportes.$t$,
    $t$No muevas los pies del suelo ni patalees.$t$,
    $t$Empuja tu cuerpo contra el respaldo mientras alejas las manetas de ti.$t$]::text[]
where id=269;

-- 270 · Cruces en Polea Sentado
update exercises set
  description=$t$Este ejercicio se trata de una aducción en el plano horizontal o transversal, realizada sentado para mayor estabilidad. También puedes colocar un foam roller entre las escápulas para darles mayor libertad de movimiento y realizar un mayor rango de recorrido (ROM). Puedes jugar alejando tu posición de la polea, o acercándola, para situar mayor tensión en la zona de estiramiento o de acortamiento, respectivamente.$t$,
  execution=$t$Colocando la polea a la altura de los hombros, busca la alineación del cable con el húmero a lo largo del movimiento. Desde una posición estable y sacando pecho, realiza el movimiento centrándote en estrujar el bíceps contra el pectoral y ambos pectorales entre sí. En este ejercicio puedes seleccionar tanto un agarre prono como neutro, el que te resulte más cómodo, e incluso es posible rotar entre ambos a lo largo del movimiento.$t$,
  cues=array[$t$Piensa en juntar el bíceps al máximo a la zona lateral del pectoral.$t$,
    $t$Mantén los codos altos, alineando correctamente el cable de la polea con el húmero.$t$,
    $t$Evita balanceos con el torso, saca pecho y mantente estable.$t$,
    $t$Realiza un rango de movimiento lo más completo posible, con los brazos ni estirados completamente ni doblados.$t$]::text[]
where id=270;

-- 271 · Cruces en Polea de Pie
update exercises set
  description=$t$Este ejercicio se trata de una aducción en el plano horizontal o transversal. Es uno de los ejercicios de aislamiento más utilizados para el pectoral; puedes realizarlo tanto de pie como sentado para mayor estabilidad. También puedes colocar un foam roller entre las escápulas para darles mayor libertad de movimiento y realizar un mayor rango de recorrido (ROM). Puedes jugar alejando tu posición de la polea, o acercándola, para situar mayor tensión en la zona de estiramiento o de acortamiento, respectivamente.$t$,
  execution=$t$Colocando la polea a la altura de los hombros, busca la alineación del cable con el húmero a lo largo del movimiento. Desde una posición estable y sacando pecho, realiza el movimiento centrándote en estrujar el bíceps contra el pectoral y ambos pectorales entre sí. En este ejercicio puedes seleccionar tanto un agarre prono como neutro, el que te resulte más cómodo, e incluso es posible rotar entre ambos a lo largo del movimiento.$t$,
  cues=array[$t$Piensa en juntar el bíceps al máximo a la zona lateral del pectoral.$t$,
    $t$Mantén los codos altos, alineando correctamente el cable de la polea con el húmero.$t$,
    $t$Evita balanceos con el torso, saca pecho y mantente estable.$t$,
    $t$Realiza un rango de movimiento lo más completo posible, con los brazos ni estirados completamente ni doblados.$t$]::text[]
where id=271;

-- 272 · Bayesian Flyes
update exercises set
  description=$t$La realización de este ejercicio es similar a unos cruces en polea sentado; del mismo modo, podemos jugar con la posición del banco, atrasándola o adelantándola, para generar mayor tensión en la zona de máximo estiramiento o de acortamiento del pectoral. A diferencia de unos cruces, se utilizará siempre rotación interna del hombro y un agarre prono, sin enganche o con enganches de muñeca o antebrazo, para centrarnos aún más en el gesto de llevar el bíceps al pectoral.$t$,
  execution=$t$Sentado en una posición estable y sacando pectoral, buscaremos ejercer fuerza con los pies en la dirección opuesta al banco. También puedes añadir un foam roller en las escápulas. Lleva los codos lo más hacia atrás posible, buscando la máxima amplitud de ROM. Una vez aquí, realiza la fase concéntrica buscando únicamente acercar tus bíceps al pectoral en cada repetición. No es necesario que juntes las manos en cada repetición.$t$
where id=272;

-- 273 · High Cable Crossover
update exercises set
  description=$t$Esta variante de cruces desde polea alta busca incidir más en las fibras inferiores o esternoabdominales del pectoral, al realizar el movimiento de aducción con una trayectoria descendente, en lugar de en el plano transversal como en unos cruces convencionales. Puede realizarse de forma unilateral, pero suele ser más cómodo de forma bilateral.$t$,
  execution=$t$Coloca las poleas en posición alta y sitúate en una posición estable, en paralelo o ligeramente por delante de ellas. Una vez aquí, lleva los brazos hacia atrás y hacia arriba y saca pectoral ensanchando tu caja torácica para colocarlo en estiramiento. Partiendo de un agarre neutro o semineutro, lleva las manos ligeramente por delante de la cadera, lo más dentro posible del plano frontal, centrándote en que el húmero tenga una trayectoria descendente. Al igual que en otras variantes de cruces, no es necesario juntar ni pensar en las manos; en cada repetición, estruja ligeramente el pectoral, pudiendo añadir isometrías.$t$,
  cues=array[$t$Busca una posición estable sin balanceos del cuerpo.$t$,
    $t$Saca pecho durante el movimiento.$t$,
    $t$Lleva el movimiento hacia abajo y hacia dentro.$t$,
    $t$No te centres en juntar las manos, al igual que en otras variantes de cruces.$t$,
    $t$No estires, ni dobles, del todo los codos. Mantén la tensión en el pectoral.$t$]::text[]
where id=273;

-- 274 · Low Cable Flyes
update exercises set
  description=$t$Esta variante de cruces desde polea baja, con una trayectoria ascendente, es aquella en la que el haz clavicular (pectoral superior) cobra mayor protagonismo. Puede realizarse sentado o de pie, y de forma bilateral o unilateral; en este último caso, puedes aprovechar para tocar el pectoral con la mano libre y mejorar la sensación.$t$,
  execution=$t$Colócate en una posición estable, sacando pecho, y separa ligeramente los brazos, generando tensión inicial. No realices únicamente un gesto de elevación, sino también de aducción; es decir, junta las manos a medida que subes. Elevar más el brazo no es mejor, ya que desplazamos el estímulo hacia el deltoides anterior; por eso no es necesario que subas por encima de los 90º, ni que bajes hasta 0º en cada repetición, ya que quitaría tensión. Podemos considerar como ROM activo el movernos entre unos 10º y 70-90º, buscando ajustar el rango de movimiento a la zona en la que sientas mayor estímulo en el haz clavicular del pectoral.$t$,
  cues=array[$t$Eleva los brazos realizando a la vez un movimiento convergente (elevar + juntar).$t$,
    $t$No es necesario subir por encima de los 90º para trabajar el pectoral: si subes mucho, trabajarás el deltoides anterior.$t$,
    $t$Busca una posición estable del torso o realízalo sentado, pero no te balancees.$t$]::text[]
where id=274;

-- 275 · Aperturas en Banco Inclinado Polea Baja
update exercises set
  description=$t$Este ejercicio puede realizarse con mancuernas o en polea, pero por la curva de resistencia y la sensación de trabajo del movimiento, personalmente lo escogería en polea o máquina. Se trata de un gesto de aducción en el que inclinamos el banco para darle ligeramente un mayor énfasis al haz clavicular del pectoral.$t$,
  execution=$t$Coloca un banco con una inclinación de entre 30º y 60º, coge los agarres y túmbate sacando pecho. Con los codos ligeramente flexionados, es importante evitar modificar su ángulo (flexionarlos o extenderlos) durante el ejercicio para no restar trabajo al pectoral. Desde el pecho, empuja ambos agarres hacia arriba para situarte en la posición inicial; desde aquí, sepáralos de forma controlada buscando amplitud y el máximo rango de movimiento con los codos que te permita tu movilidad, sin perder tensión ni sentir dolor. Desde el máximo estiramiento del pectoral, comienza la fase concéntrica realizando un gesto de abrazo; no te centres en chocar los agarres. Realiza una fase concéntrica potente y controlada, estrujando el pectoral durante toda la subida.$t$,
  cues=array[$t$La articulación del codo permanece fija: evita flexionar los codos implicando al bíceps en la fase concéntrica y extenderlos quitando tensión al pectoral en la excéntrica.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (húmero), no en las manos.$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo lo máximo.$t$]::text[]
where id=275;

-- 276 · Aperturas Banco Inclinado con Mancuerna
update exercises set
  description=$t$Se trata de un gesto de aducción en el que inclinamos el banco para darle ligeramente un mayor énfasis al haz clavicular del pectoral. La realización de este ejercicio con mancuernas puede hacer interesante recortar una parte del recorrido en la zona alta, evitando llegar a juntarlas del todo para no quitar tensión al pectoral, ya que en esa parte del movimiento concéntrico se pierde prácticamente toda la resistencia.$t$,
  execution=$t$Coloca un banco con una inclinación de entre 30º y 60º, coge las mancuernas y túmbate sacando pecho. Con los codos ligeramente flexionados, es importante evitar modificar su ángulo durante el ejercicio para no restar trabajo al pectoral. Desde el pecho, empuja las mancuernas hacia arriba para situarte en la posición inicial; desde aquí, sepáralas de forma controlada buscando amplitud y el máximo rango de movimiento con los codos que te permita tu movilidad, sin perder tensión ni sentir dolor. Desde el máximo estiramiento del pectoral, comienza la fase concéntrica realizando un gesto de abrazo, y evita chocar ambas mancuernas.$t$,
  cues=array[$t$La articulación del codo permanece fija: evita flexionar los codos implicando al bíceps en la fase concéntrica y extenderlos quitando tensión al pectoral en la excéntrica.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (húmero), no en las manos.$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo lo máximo.$t$]::text[]
where id=276;

-- 277 · Aperturas en Banco Plano desde Polea Baja
update exercises set
  description=$t$Al igual que en las aperturas en banco inclinado, si pudiera elegir, las realizaría de forma preferente en máquina o polea. En este caso se mantiene el banco plano para dar un estímulo más global a la totalidad de las fibras del pectoral, pero la clave del movimiento es la misma: buscamos aducción horizontal.$t$,
  execution=$t$Túmbate en el banco sacando pecho y sujetando los agarres cerca de tu pecho; desde esta posición, empújalos verticalmente y comienza a separarlos manteniendo los codos ligeramente flexionados y fijos durante todo el movimiento, llevando los codos lo más atrás posible sin generar dolor ni perder tensión, para lo que debes evitar que se doblen o estiren durante el movimiento. Una vez alcances el final de la fase excéntrica, con los codos en la posición más atrasada de todo el ROM, comienza a realizar un gesto de abrazo con los bíceps, pegándolos al lateral del pectoral y acercando un brazo contra el otro a medida que progresas en el movimiento.$t$,
  cues=array[$t$La articulación del codo permanece fija: evita flexionar los codos implicando al bíceps en la fase concéntrica y extenderlos quitando tensión al pectoral en la excéntrica.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (bíceps), no en las manos.$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo al máximo.$t$]::text[]
where id=277;

-- 278 · Aperturas Banco Plano Mancuernas
update exercises set
  description=$t$Al igual que en las aperturas en banco inclinado con mancuernas, es recomendable realizar el ejercicio sin llegar a juntar ambas mancuernas del todo en la parte superior del movimiento, ya que se pierde la tensión sobre el pectoral. En este caso se mantiene el banco plano para dar un estímulo más global a la totalidad de las fibras del pectoral, pero la clave del movimiento es la misma: buscamos el gesto de aducción horizontal.$t$,
  execution=$t$Túmbate en el banco sacando pecho y sujetando las mancuernas cerca de tu pecho; desde esta posición, empújalas verticalmente y comienza a separarlas manteniendo los codos ligeramente flexionados. Amplía el rango de movimiento llevando los codos lo más atrás posible sin generar dolor ni perder tensión, para lo que debes evitar que se doblen o estiren durante el movimiento. Al final de la fase excéntrica, con los codos en la posición más atrasada de todo el ROM, comienza a realizar un gesto de abrazo con los bíceps, pegándolos al lateral del pectoral y acercando un brazo contra el otro a medida que progresas en el movimiento.$t$,
  cues=array[$t$La articulación del codo permanece fija: evita flexionar los codos implicando al bíceps en la fase concéntrica y extenderlos quitando tensión al pectoral en la excéntrica.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (bíceps), no en las manos.$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo al máximo.$t$,
    $t$Evita juntar ambas mancuernas en la parte más alta del movimiento.$t$]::text[]
where id=278;

-- 279 · Pec-fly
update exercises set
  description=$t$Este ejercicio se trata de una aducción horizontal en máquina que realizaremos con los codos extendidos, aplicando fuerza con la totalidad del antebrazo y la mano.$t$,
  execution=$t$Colócate sentado sacando pecho y buscando estabilidad; para ello, te puedes ayudar empujando con los pies contra el suelo en la dirección opuesta al banco. Coloca los agarres en la posición más posterior para tener un mayor ROM en estiramiento. Saca desde atrás un brazo y después el otro, ayudándote con el cuerpo. Desde aquí, lleva los brazos hacia atrás controlando la fase excéntrica, llegando lo más atrás posible hasta una posición cómoda y sin dolor; una vez alcances tu máximo estiramiento, junta los brazos al máximo uno con otro, realizando un gesto de abrazo.$t$,
  cues=array[$t$La articulación del codo permanece fija: evita flexionar los codos implicando al bíceps en la fase concéntrica y extenderlos quitando tensión al pectoral en la excéntrica.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (bíceps).$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo lo máximo.$t$]::text[]
where id=279;

-- 280 · Fondos en Paralelas Agarre Ancho
update exercises set
  description=$t$En muchos empujes el tríceps tiene gran protagonismo; para incidir más en el tríceps optaría por realizarlo con un agarre estrecho, pero en este caso optaremos por un agarre más amplio para centrarnos en las fibras inferiores del pectoral (costoabdominales).$t$,
  execution=$t$Realizando una ligera retracción escapular, agarra las manetas situando las manos por detrás de la línea del hombro y mantén la extensión torácica (sin redondear la espalda alta) durante todo el movimiento. Una vez colocado con los codos extendidos, inclínate muy ligeramente hacia delante y comienza a bajar controlando la fase excéntrica hasta un punto cómodo donde tus hombros no sufran; puedes tener en cuenta que tu codo forme un ángulo aproximado de 90º o menos, pero según tu morfología podrás bajar más o menos. Desde la posición más baja, empuja fuerte y de forma controlada buscando intencionalmente acercarte a la extensión completa de los codos o llegar a ella, evitando balanceos e impulsos durante todo el ejercicio.$t$,
  cues=array[$t$No te impulses con las piernas ni te balancees.$t$,
    $t$Mantén la retracción escapular durante todo el ejercicio.$t$,
    $t$Inclínate ligeramente hacia delante.$t$,
    $t$Aplica fuerza hacia abajo y adelante, colocando la mano por detrás de la línea del hombro.$t$]::text[]
where id=280;

-- 281 · Fondos Máquina Agarre Ancho
update exercises set
  description=$t$Para minimizar en cierta medida la acción del tríceps, podemos realizar el empuje en máquina con un agarre más amplio, que puede ser neutro o prono.$t$,
  execution=$t$Realizando una ligera retracción escapular, agarra las manetas con un agarre prono o neutro según comodidad, adelanta tu posición e inclínate ligeramente hacia delante para situar las manos por detrás de la línea del hombro, y mantén la extensión torácica (sin redondear la espalda alta) durante todo el movimiento. Desde esta posición de partida, comienza a empujar de forma controlada, buscando intencionalmente llegar a la extensión completa o casi completa del codo. Desde aquí, comienza la fase excéntrica controlando el movimiento hasta llegar a una posición cómoda; puedes tomar como referencia que tu codo forme un ángulo de unos 90º, pero según tu morfología llegarás a un mayor o menor ángulo.$t$,
  cues=array[$t$Ánclate bien al respaldo o asiento, evitando impulsos innecesarios.$t$,
    $t$Mantén la retracción escapular durante todo el ejercicio.$t$,
    $t$Inclínate ligeramente hacia delante.$t$,
    $t$Empuja hacia abajo, pero también ligeramente hacia delante.$t$,
    $t$Tus manos deberían estar ligeramente por detrás de los hombros.$t$]::text[]
where id=281;

-- 282 · Hex Press con Mancuernas
update exercises set
  description=$t$Este ejercicio puede tratarse de una variante más de empuje horizontal a tener en cuenta en nuestros entrenamientos, pero cabe destacar que, al contrario de lo que típicamente se ha creído, no te ayudará a trabajar la parte interna de los pectorales. Las fibras del pectoral son bastante horizontales y podemos distinguir distintas porciones, pero no podemos trabajar de forma aislada su parte interna. Puede ser un ejercicio interesante como complemento o como preactivación del pectoral, tal y como lo utilizaba John Meadows.$t$,
  execution=$t$Siéntate sobre el banco mientras apoyas las mancuernas sobre tus muslos; a continuación, vuélcate hacia atrás para tumbarte y apoya ambas mancuernas sobre tu pecho. A continuación, estruja una contra la otra como si quisieras aplastarlas, creando presión entre ambas. Cuando ya tengas el pectoral en tensión, comienza a empujar las mancuernas hacia arriba extendiendo los codos, sin dejar de hacer fuerza entre ambas mancuernas. Una vez arriba (no es necesario extender por completo los codos), desciende de forma controlada, también ejerciendo fuerza para juntar ambas mancuernas, hasta reposarlas en el pecho, pero sin dejar que pierdan tensión: es mejor realizar touch & go que apoyar completamente las mancuernas antes de volver a empujar.$t$,
  cues=array[$t$Empuja hacia arriba con ambas mancuernas a la vez que ejerces fuerza de una contra la otra.$t$,
    $t$Lleva las mancuernas a la zona media del pecho.$t$,
    $t$No dejes las mancuernas descansar en el pecho; en todo caso, realiza touch & go.$t$]::text[]
where id=282;

-- 283 · Hex Press en Multipower
update exercises set
  description=$t$Esta variante de Hex press se realiza añadiendo a la barra de la multipower un agarre estrecho o en V para poder agarrarla de forma similar a como se hace con mancuernas. Resulta algo más difícil de realizar en cuanto a desencajar y volver a colocar la barra en los soportes, por lo que contar con ayuda podría ser interesante. También se pierde un poco el componente de aducción (la unión que se realiza con las mancuernas), ya que el agarre se sostiene solo por la propia gravedad. Recuerda que este ejercicio no sirve para trabajar de forma específica la zona de unión entre ambos pectorales.$t$,
  execution=$t$Coloca un banco debajo y en paralelo a la barra de la multipower; a continuación, túmbate sobre él mientras sostienes un agarre cerrado en las manos. También podrías usar otros tipos de agarre que te resulten más cómodos. Apoya los pies sobre el banco si es muy alto para ti o estás más cómodo, o bien sobre el suelo para generar estabilidad; al ser un ejercicio que no trabajaremos pesado, no hay ningún problema con esto. A continuación, desencaja la barra del soporte tú solo o, preferiblemente, con ayuda, y comienza a descender de forma controlada hasta tocar con el agarre muy sutilmente la zona alta del abdomen o la zona inferior del pectoral, según comodidad; evita llevar el agarre al cuello o a la zona superior del pectoral. Desde aquí, y evitando perder tensión, comienza a empujar hacia arriba contrayendo fuertemente los pectorales hasta extender casi o por completo los codos. Realiza las repeticiones de forma controlada.$t$,
  cues=array[$t$Lleva el agarre a la zona alta del abdomen o zona baja del pecho.$t$,
    $t$Aguanta arriba la contracción del pectoral y desciende de forma controlada; evita clavarte el agarre en el pecho.$t$,
    $t$Evita que el agarre quede muy arriba para no llevar el estímulo al tríceps.$t$,
    $t$Puedes realizar agarre suicida si tienes mejores sensaciones, pero cuidado.$t$]::text[]
where id=283;

-- 284 · Aperturas con Mancuerna en Banco Declinado
update exercises set
  description=$t$Esta variante de aperturas puede resultar algo más compleja de realizar que las alternativas con banco plano o inclinado para algunas personas. Al igual que en cualquier tipo de aperturas con mancuernas, puede ser interesante recortar la parte final del recorrido, evitando llegar a juntarlas del todo para no quitar tensión al pectoral en esa parte del ROM. Se trata de un gesto de aducción en el que declinamos el banco para darle ligeramente un mayor énfasis al haz costoabdominal del pectoral o pectoral inferior.$t$,
  execution=$t$Túmbate sobre un banco declinado con los pies bien sujetos y tu espalda bien apoyada para asegurar la estabilidad en el movimiento. Agarra las mancuernas y empújalas verticalmente, como en un press de pecho, para colocarte en la posición inicial. Mantén los codos ligeramente flexionados durante todo el ejercicio (evita flexionarlos en la concéntrica o extenderlos en la excéntrica). Desde esta posición, comienza a separar las mancuernas de forma controlada buscando amplitud horizontal con tus codos y alcanzar el máximo rango de movimiento que te permita tu movilidad, sin perder tensión ni sentir dolor. Desde esta posición de máximo estiramiento del pectoral, comienza la fase concéntrica acercando el bíceps al centro de tu cuerpo y evitando chocar ambas mancuernas.$t$,
  cues=array[$t$La articulación del codo permanece fija: evita flexionar los codos implicando al bíceps en la fase concéntrica y extenderlos quitando tensión al pectoral en la excéntrica.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (húmero), no en las manos o mancuernas.$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo lo máximo.$t$]::text[]
where id=284;

-- 285 · Aperturas desde Polea Baja en Banco Declinado
update exercises set
  description=$t$La realización de este ejercicio en polea mejora la curva de resistencia y la sensación de trabajo del músculo. Si solo pudiera elegir, generalmente lo escogería en polea o máquina antes que con mancuernas, ya que la tensión constante frente a la versión con mancuernas lo convierte en una alternativa generalmente superior. Se trata de un gesto de aducción en el que declinamos el banco para darle ligeramente un mayor énfasis al haz costoabdominal del pectoral (también conocido como pectoral inferior).$t$,
  execution=$t$Túmbate sobre un banco declinado y sujeta tus pies a los soportes para generar un apoyo estable. Coge los agarres y empújalos verticalmente para situarte en la posición inicial. Mantén los codos ligeramente flexionados a lo largo del movimiento: es habitual flexionarlos en la concéntrica o extenderlos en la excéntrica para dar más sensación de recorrido, pero ambas acciones restarían trabajo al pectoral, así que mantén su ángulo fijo durante el ejercicio. Desde esa posición, comienza a separar horizontalmente los codos buscando amplitud y el máximo ROM que te permita tu movilidad, sin perder tensión ni sentir dolor, hasta alcanzar el máximo estiramiento del pectoral. Desde ahí, comienza la fase concéntrica realizando un gesto de abrazo con el que buscas juntar la parte superior de tu brazo a tu pecho. Realiza una fase concéntrica potente y controlada, estrujando el pectoral durante toda la subida.$t$,
  cues=array[$t$La articulación del codo permanece fija: un error común es flexionar los codos en la fase concéntrica y extenderlos en la excéntrica, quitando tensión al pectoral.$t$,
    $t$Realiza el gesto de abrazo centrándote en la parte alta del brazo (húmero), no en las manos.$t$,
    $t$Lleva los codos lo más atrás posible, ampliando el ROM activo lo máximo.$t$]::text[]
where id=285;

-- 286 · Press Declinado en Multipower
update exercises set
  description=$t$El objetivo de colocar el banco en una inclinación negativa es realizar una trayectoria descendente del húmero que permita una mayor incidencia en las fibras inferiores del pectoral. No existe una inclinación concreta: si el banco es ajustable, busca un punto cómodo. En este caso, al realizarlo en multipower, presenta además mucha mayor estabilidad y nos permite una trayectoria más vertical del húmero, por lo que generalmente resulta una mejor alternativa que realizarlo con barra libre.$t$,
  execution=$t$Túmbate en el banco, asegurando la estabilidad del cuerpo con un correcto apoyo de los pies. Desencaja la barra realizando un empuje y girándola, buscando situar tus muñecas alineadas con tus brazos al realizarlo. Desde ahí, comienza a descender la barra hacia tu pecho llevándola ligeramente por debajo de la línea del pectoral. Puedes apoyar la barra sobre el pectoral si tienes buena movilidad de hombro, pero evita rebotar en el pecho; después, comienza a empujar verticalmente mientras añades fuerza intencional de aducción: intenta juntar tus manos mientras empujas. Es importante que los movimientos sean controlados y seguros.$t$,
  cues=array[$t$No despegues el glúteo o la cadera del banco.$t$,
    $t$Empuja hacia arriba y añade fuerza con la intención de juntar las manos para un mejor estímulo del pectoral.$t$,
    $t$No lleves la barra al cuello, sino ligeramente por debajo de los pezones.$t$,
    $t$Evita movimientos rápidos, desciende y sube de forma controlada.$t$]::text[]
where id=286;

-- 287 · Press Banca
update exercises set
  description=$t$Posiblemente el press banca es el ejercicio de pecho más popular, pero cabe destacar que no es el mejor ejercicio de pecho; ni siquiera estaría entre los 10 mejores. Sin embargo, a muchas personas les gusta y es un ejercicio válido dentro de nuestro cajón de herramientas. Uno de sus inconvenientes es que las personas con una gran caja torácica o con un ángulo esternal inclinado acaban llevando el estímulo a la porción inferior del pectoral, como en un press declinado, dejando de lado la porción central (haz esternocostal). Si haces arqueo lumbar, también llevarás el estímulo a la porción inferior del pectoral y estarás recortando ROM, dando a su vez un menor estímulo, lo mismo que ocurre si abrimos demasiado el agarre. Si quieres hacer un press banca con objetivo de hipertrofia, haz prácticamente todo lo contrario a una técnica de powerlifting, y realmente tienes opciones mejores. Recuerda que un culturista no es un powerlifter.$t$,
  execution=$t$Túmbate en el banco realizando retracción escapular para crear un apoyo estable; si esta se pierde posteriormente con el movimiento, no hay ningún problema. Saca ligeramente pecho para dar al pectoral el estiramiento y saca la barra; recuerda que debes mantener el apoyo del glúteo en el banco y ambos pies en el suelo constantemente. Selecciona una amplitud de agarre que te permita alinear la muñeca, el codo y el hombro en forma de L (90º) en la parte más baja del movimiento, o ligeramente más amplia según comodidad. Comienza a descender la barra llevándola hacia la línea de los pezones o ligeramente por debajo, apóyala sin rebotar y comienza a realizar la fase concéntrica empujando a la vez hacia arriba y hacia dentro con las manos, con la intención de juntarlas. Continúa el movimiento hasta bloquear (o casi) por completo los codos.$t$,
  cues=array[$t$Busca mantener la mano posicionada sobre el codo, ni más abierta ni más cerrada, para llevar el estímulo al pecho, no al tríceps y sin recortar movimiento.$t$,
    $t$Piensa en empujar y juntar las manos a la vez, a modo de fuerza intencional.$t$,
    $t$Evita realizar arco lumbar, despegar el culo del banco o realizar rebote con la barra en el pecho.$t$]::text[]
where id=287;

-- 288 · Press Lateral en Máquina
update exercises set
  description=$t$Este ejercicio es poco común en las salas de musculación, aunque podría ser interesante en algunos casos; por ejemplo, suele ser una muy buena opción como preactivación, pero también podríamos tenerlo en cuenta como un estímulo complementario. Los ejercicios de pectoral suelen oponer más resistencia mecánica durante el estiramiento, y aunque el estiramiento bajo carga podría ser especialmente interesante, no es algo que concierna demasiado al press lateral en máquina, ya que de hecho enfatiza la parte opuesta del ROM, es decir, el punto de mayor contracción o acortamiento. Por ello, puede ser interesante también si buscamos dar mayor énfasis al pectoral en acortamiento.$t$,
  execution=$t$Colócate de lado en la máquina, empujando tu cuerpo contra el respaldo y manteniendo los pies apoyados, buscando una posición estable. A continuación, agarra la maneta del lado que vayas a trabajar. Desde aquí, en primer lugar, busca el máximo ROM posible en cuanto a estiramiento del pectoral; a continuación, sitúalo en ligera tensión y comienza a realizar el empuje de forma lateral, buscando acercar al máximo tu bíceps a tu pectoral. Puede ser interesante utilizar la mano libre para tocar la musculatura del pectoral, a modo de STT (Self Touch Training), buscando mejorar la conexión mente-músculo, el foco atencional y el reclutamiento de la musculatura objetivo. Una vez en máxima contracción, vuelve lento y controlado hasta la posición inicial evitando perder tensión.$t$
where id=288;

-- 289 · Press Lateral en Polea
update exercises set
  description=$t$Esta variante de empuje se basa en trabajar el pectoral en acortamiento; es el mismo ejercicio que el press lateral en máquina, pero en polea. Quizá un inconveniente de este estímulo es que, al igual que en máquina, no se enfatiza el estiramiento. Una ventaja de realizarlo en polea podría ser que nosotros marcamos la trayectoria; sin embargo, esto también podría considerarse un inconveniente en muchos casos. Realizaremos el ejercicio de forma unilateral para llevar el pectoral a la máxima contracción.$t$,
  execution=$t$Colócate de lado respecto a la polea y sitúala en ligera tensión mientras mantienes el codo doblado, dando simplemente un paso hacia el lado contrario a la polea. A continuación, con la polea ya en ligera tensión, realiza una aducción horizontal pasando la mano por delante del cuerpo mientras piensas en pegar al máximo tu bíceps a tu pectoral, hasta alcanzar la máxima contracción. Aprovecha la mano del brazo que no trabaja para tocar el pectoral (Systematic Touch Training) y mejorar la conexión mente-músculo y el reclutamiento de la musculatura objetivo. Una vez llegado al pico de contracción, vuelve a la posición inicial de forma lenta y controlada.$t$
where id=289;

-- 290 · Standing Press en Poleas
update exercises set
  description=$t$Este ejercicio es un empuje en el que buscamos llevar las manos hacia delante y ligeramente hacia dentro, combinando press con ligera aducción, de forma similar a lo que haríamos en un press con mancuernas, pero con la ventaja de que los cables de las poleas continúan ejerciendo tensión en la parte final del recorrido. Se realiza de pie, para lo que es necesaria una estación de poleas cerrada o unos brazos de poleas. A nivel técnico, al tener que trazar tú mismo la trayectoria, será más complicado de realizar que un empuje en máquina convergente.$t$,
  execution=$t$Colócate de pie delante de una estación o brazos de poleas, sitúa los cables aproximadamente a la misma altura que tus hombros y sujeta las manetas con un agarre prono o mixto entre prono y neutro. A continuación, pon los cables en tensión dando 1 o 2 pasos hacia delante, colocando un pie ligeramente adelantado respecto al otro para generar mayor estabilidad. Desde aquí, lleva los codos hacia atrás mientras sacas pecho ligeramente para situar el pectoral en estiramiento y comienza a empujar los agarres buscando llevar tus manos adelante y ligeramente hacia dentro. Continúa el movimiento hasta extender por completo los codos y desde ahí vuelve a la posición inicial de forma lenta y controlada.$t$,
  cues=array[$t$Saca pecho ligeramente a la vez que buscas llevar los codos atrás, dando el máximo ROM posible en tu caso.$t$,
    $t$Evita impulsos y balanceos con el cuerpo.$t$,
    $t$Piensa en empujar hacia delante y en juntar los bíceps a tus pectorales.$t$,
    $t$Recuerda que este ejercicio es más similar a un press que a unos cruces en polea.$t$]::text[]
where id=290;

-- 291 · Press de Pecho en Poleas Sentado
update exercises set
  description=$t$Esta variante de press se trata del mismo movimiento que el standing press en poleas, con la diferencia de que lo realizamos sentados, con la ayuda y el apoyo de un banco. En la mayoría de casos, la mayor estabilidad que aporta el respaldo podría ser una ventaja respecto a su homólogo de pie. Se mantiene el gesto de press con ligera aducción, por lo que puede ser una buena alternativa para aquellas personas que no cuenten con una máquina de empuje convergente, pero sí con una estación de poleas cerrada, ya que el objetivo es empujar hacia delante y hacia dentro a la vez, de forma similar a lo que se realiza en esa máquina. Sin embargo, a nivel técnico, al no ser una trayectoria guiada, será más complicado de realizar que un empuje en máquina convergente de placas.$t$,
  execution=$t$Coloca el banco ligeramente adelantado respecto a la posición de las poleas, que deben estar situadas aproximadamente a la altura de tus hombros. Siéntate sujetando los agarres con un agarre prono o ligeramente neutro, apóyate en el respaldo y realiza un bloqueo de tu zona escapular para situar el pectoral en ligero estiramiento. Desde aquí, lleva los codos todo lo que puedas hacia atrás para dar el máximo ROM activo y comienza a empujar hacia delante, dirigiendo una ligera trayectoria convergente y centrándote en acercar tus bíceps a tu pecho. Continúa el movimiento hasta extender los codos y, al final de la fase concéntrica, vuelve a la posición inicial de forma lenta y controlada; puedes hacer una ligera pausa en estiramiento si quieres.$t$,
  cues=array[$t$Saca pecho ligeramente, e incluso podrías colocar un foam roller en el banco, a la vez que buscas llevar los codos atrás, dando el máximo ROM posible en tu caso.$t$,
    $t$Piensa en empujar hacia delante y en juntar los bíceps a tus pectorales.$t$,
    $t$Recuerda que este ejercicio es un híbrido, más similar a un press que a unos cruces en polea sentado.$t$]::text[]
where id=291;

-- 292 · Press Declinado en Máquina
update exercises set
  description=$t$Esta máquina de press cuenta con un banco que tiene el respaldo ligeramente inclinado junto con unos agarres algo más bajos de lo normal, para favorecer que el movimiento del húmero con respecto al torso sea ligeramente descendente y enfatizar de esta forma el haz costoabdominal (o porción inferior) del pectoral. Puede ser interesante combinar el trabajo de esta máquina con otros patrones de empuje y aducción, pero recuerda que si realizas presses totalmente planos o fondos es posible que ya estés trabajando esta porción.$t$,
  execution=$t$Siéntate en el banco a una altura que te permita apoyar por completo los pies, con una amplitud cómoda, y clavando bien las escápulas. Empuja con los pies hacia delante y con tu espalda contra el banco, creando una buena posición de inicio desde la que aplicar fuerza. Desde aquí, sujeta los agarres y comienza a empujar hacia el frente y hacia abajo, dirigiendo el húmero ligeramente sobre tus costillas y buscando acercarlo lo máximo posible a ellas. Continúa con el movimiento adelante, abajo y hacia dentro hasta extender por completo los codos, y desde ahí regresa a la posición inicial de forma controlada.$t$,
  cues=array[$t$Empuja al frente, abajo y adentro; mientras lo haces, piensa en juntar los bíceps hacia el pecho.$t$,
    $t$Busca llevar los codos lo más atrás posible para darle el máximo ROM al ejercicio.$t$]::text[]
where id=292;

-- 293 · Pec Deck
update exercises set
  description=$t$Este ejercicio es muy popular en muchos gimnasios. Si la máquina está bien diseñada, tendrá varios ajustes para mejorar la estabilidad o la trayectoria pendular de los brazos alrededor del hombro, siendo la aducción horizontal el movimiento clave para la porción esternocostal del pectoral. Sin embargo, la posición con los antebrazos en las almohadillas implica cierta rotación externa, lo cual no sería lo ideal para un músculo que es rotador interno. La variante acertada se realiza con flexión del codo para poder exprimir el ROM, por lo que, en caso de que la máquina de pec deck no lo permita, puedes usarla con un agarre no convencional.$t$,
  execution=$t$Coloca el asiento para que los húmeros queden alineados con la línea media de tu pectoral, apoya tus antebrazos contra las almohadillas y agarra las manetas con las manos. Saca el pecho hacia fuera para situar el pectoral en ligero estiramiento. A continuación, comienza a juntar ambos codos cerrando las almohadillas y pensando en pegar al máximo los bíceps a tu pecho. Una vez alcanzada la máxima contracción, evita chocar ambos soportes entre sí o perder tensión y comienza a volver a la posición inicial de forma lenta y controlada. Dale prioridad también al estiramiento: busca llevar los brazos lo más atrás posible para un mayor ROM activo. Realiza la transición entre la fase concéntrica y la excéntrica sin fuerzas inerciales ni rebotes.$t$,
  cues=array[$t$Mantén el pecho fuera en todo momento.$t$,
    $t$Extiende los codos si utilizas un agarre no convencional.$t$,
    $t$No cargues demasiado peso en este ejercicio.$t$]::text[]
where id=293;

-- 294 · Press Plano en Máquina de Palancas
update exercises set
  description=$t$Este ejercicio es una muy buena opción para el trabajo de pectoral, pero, al igual que sucede en muchos otros, dependerá del diseño de la máquina. En algunos casos puede tratarse de un ejercicio muy similar a un press con mancuernas en cuanto a la forma de ejercer fuerza; sin embargo, si la máquina está bien diseñada y es convergente, hará que no solo empujemos hacia arriba sino también hacia dentro, acercando tus bíceps a tu pectoral a la vez y permitiendo que durante todo el recorrido estemos aplicando fuerza y generando tensión.$t$,
  execution=$t$Túmbate sobre el banco evitando realizar un excesivo arco lumbar: recuerda que no se trata de un press de banca ni de una competición donde debamos levantar el máximo peso posible, sino de generar la mayor tensión en el pectoral; evita dirigir el movimiento a la porción inferior del pectoral. Una vez en la posición correcta, sitúa tus manos en los agarres según comodidad; puedes tener en cuenta que, aproximadamente, el codo debe quedar más o menos bajo la muñeca en el punto más bajo del ROM, ni excesivamente abierto ni cerrado. Desde aquí, comienza a empujar hacia arriba y hacia dentro de forma controlada hasta extender completamente los codos, y desde aquí desciende de forma controlada hasta la posición inicial, evitando que las palancas de la máquina reboten con los soportes o perder tensión.$t$,
  cues=array[$t$Empuja hacia arriba y hacia dentro; junta tus bíceps a tu pecho a la vez que subes.$t$,
    $t$Genera una posición estable, clava los pies en el suelo.$t$,
    $t$Evita realizar un arco lumbar que lleve el estímulo a la porción inferior.$t$,
    $t$Dale máxima amplitud al movimiento: de forma controlada, busca el máximo ROM en estiramiento y extiende por completo los codos en cada repetición.$t$]::text[]
where id=294;

-- 295 · Dumbbell Twist Press (antes «Dumbell Twist Press»)
update exercises set
  name=$t$Dumbbell Twist Press$t$,
  description=$t$Este ejercicio se incluye en recuerdo de John Meadows, que fue quien lo desarrolló y popularizó; sin embargo, es importante destacar que no parece ser un buen ejercicio principal de pectoral, por lo que es mejor introducirlo a repeticiones moderadas-altas como calentamiento y preactivación, donde sí podría jugar un mejor papel. Esto se debe a que la rotación del húmero y de la muñeca durante el ejercicio, buscando generar aducción, realmente no nos aporta nada más allá de una mayor sensación de contracción en los pectorales, debido a que la carga que generan las mancuernas es gravitacional.$t$,
  execution=$t$Colócate sobre un banco y apoya unas mancuernas sobre tus rodillas. A continuación, túmbate como un buzo y coloca las mancuernas a la altura del pectoral, situando los nudillos mirando hacia el techo y el pectoral en elongación. Después, comienza a empujar igual que en un press con mancuernas, empujando hacia arriba mientras rotas la palma de tu mano y acercas ligeramente tus bíceps hacia tus pectorales. No es necesario que la rotación de la mano sea completa, ya que realmente no aporta nada; hazla simplemente unos grados, donde te encuentres cómodo.$t$,
  cues=array[$t$Mantén el foco en acercar tu húmero al pectoral, empujando las mancuernas hacia arriba, y no tanto en rotar las muñecas.$t$,
    $t$Evita cerrar excesivamente los codos; busca mantener los brazos a 60-90º de abducción.$t$,
    $t$Evita manejar cargas excesivamente altas e introduce este ejercicio como calentamiento o pre-activación en caso de querer hacerlo.$t$]::text[]
where id=295;

-- 296 · Dominadas Pronas
update exercises set
  description=$t$Las dominadas pronas son uno de los ejercicios que más suelen verse a la hora de trabajar la espalda, especialmente el dorsal ancho, al poder enfatizar la aducción y la extensión de hombro. Que sean una buena o mala opción dependerá de muchos factores, como tus objetivos, el material disponible y la técnica. Puede ser incluso más interesante realizarlas en una máquina asistida para contar con mayor estabilidad, conexión mente-músculo e incluso facilidad de progresión, así como para poder permanecer dentro del plano frontal, si es que nos interesa enfatizar la aducción del hombro. Si te falta fuerza o hay inestabilidad, busca sustituir este ejercicio por otra variante, como un jalón.$t$,
  execution=$t$Agarra la barra con un agarre prono, con una anchura de 1,2 a 2 veces el ancho biacromial y, a ser posible, usando straps. Deja caer tu peso, extendiendo los codos por completo pero generando tensión desde las escápulas, para colocarte en la posición inicial. Desde aquí, inclina muy ligeramente tu torso hacia atrás y comienza a traccionar elevando tu cuerpo mientras sacas pecho, buscando realizar el movimiento entre el plano sagital y el frontal. Al subir, saca el pecho hacia arriba y hacia afuera mientras apuntas con la barbilla ligeramente a la barra. Arriba puedes mantener una breve contracción y descender de forma controlada hasta la posición inicial de nuevo, extendiendo por completo los brazos pero manteniendo siempre la tensión sobre la espalda. Evita los impulsos o el kipping: hazlas estrictas.$t$,
  cues=array[$t$Lleva el movimiento entre el plano frontal y el sagital; piensa en sacar la barbilla por encima de la barra y en juntar la barra con tu cuerpo.$t$,
    $t$Evita el kipping, los impulsos y las inercias con tu cuerpo a la hora de realizar el movimiento.$t$,
    $t$Extiende los codos por completo en cada repetición, controlando la fase excéntrica, pero evita quedarte colgado sin tensión (dead hang).$t$,
    $t$No abras en exceso el agarre, busca una anchura cómoda entre 1,2 a 2 veces el ancho biacromial.$t$]::text[]
where id=296;

-- 297 · Dominadas Supinas
update exercises set
  description=$t$Las dominadas supinas son una de las alternativas más utilizadas a las dominadas pronas; sin embargo, no serían un sustituto directo: podríamos decir que las dominadas supinas enfatizan más la extensión de hombro y pueden realizarse en un plano puramente sagital, mientras que las pronas se prestan más a estar a medio camino entre el plano frontal y el sagital. Si vas a incluirlas en tu entrenamiento con el objetivo de estimular los bíceps, mejor elige ejercicios de bíceps: pese a que inciden más sobre este grupo muscular que otros patrones verticales, este no debe ser el objetivo. Además, recuerda que si estás inestable realizándolas, será mejor buscar un sustituto; puede ser incluso más interesante realizarlas en una máquina asistida.$t$,
  execution=$t$Colócate frente a la barra y agárrala con las manos en supinación, utilizando un agarre de entre 1 y 1,5 veces el ancho biacromial; cuélgate dejando caer tu peso, con los codos extendidos pero comenzando a generar tensión en la espalda. Ahora, comienza a traccionar elevando tu cuerpo, pensando en llevar los codos abajo y hacia atrás, puramente en el plano sagital, sacando pecho durante todo el movimiento mientras apuntas con la barbilla ligeramente hacia arriba. Una vez alcanzada la altura máxima, comienza a descender de forma controlada hasta la posición inicial de nuevo, estirando por completo los brazos pero manteniendo siempre la tensión; evita dejarte caer, los impulsos con el cuerpo o el kipping: hazlas estrictas.$t$,
  cues=array[$t$Realiza el movimiento puramente en el plano sagital, llevando el codo abajo y atrás.$t$,
    $t$Evita el kipping, los impulsos y las inercias con tu cuerpo a la hora de realizar el movimiento.$t$,
    $t$Extiende los codos por completo en cada repetición, controlando la fase excéntrica, pero evita quedarte colgado sin tensión (dead hang).$t$,
    $t$No abras en exceso el agarre; busca una anchura cómoda de entre 1 y 1,5 veces el ancho biacromial.$t$]::text[]
where id=297;

-- 298 · Dominadas Neutras
update exercises set
  description=$t$Las dominadas neutras, al igual que las supinas, se prestan más a su realización en el plano sagital, enfatizando la extensión de hombro. Suelen ser una alternativa más cómoda a nivel de hombro y muñeca para aquellas personas que tienen problemas con las pronas o supinas, y también un buen punto de aprendizaje; sin embargo, al igual que las supinas, no deben tener el objetivo de trabajar el bíceps. Evita estar inestable y valora realizarlas en máquina guiada; puede ser incluso más interesante en muchos contextos.$t$,
  execution=$t$Colócate frente a la barra y cuélgate utilizando un agarre neutro con una separación aproximadamente igual al ancho de tus hombros. Deja caer tu peso, extendiendo los codos y generando tensión en la espalda. Desde esta posición inicial, comienza a traccionar elevando tu cuerpo, intentando mantener el movimiento dentro del plano sagital; para ello, piensa en llevar tus codos abajo y atrás y en sacar la barbilla ligeramente hacia arriba mientras subes. Una vez alcanzada la máxima extensión de hombro, desciende de forma controlada hasta alcanzar de nuevo la posición inicial, estirando por completo los brazos pero manteniendo siempre la tensión. Evita quedarte colgado sin tensión (dead hang), además de los impulsos con el cuerpo o el kipping: hazlas estrictas.$t$,
  cues=array[$t$Realiza puramente el movimiento en el plano sagital, llevando el codo abajo y atrás.$t$,
    $t$Evita el kipping, los impulsos y las inercias con tu cuerpo a la hora de realizar el movimiento.$t$,
    $t$Extiende los codos por completo en cada repetición, controlando la fase excéntrica, pero mantén la tensión.$t$,
    $t$No cierres el agarre en exceso, utiliza aproximadamente la misma anchura que tus hombros (biacromial).$t$]::text[]
where id=298;

-- 299 · Jalón al Pecho Prono
update exercises set
  description=$t$Este ejercicio es a priori una mejor alternativa a las dominadas pronas, con un movimiento similar, en cuanto a estabilidad y capacidad de progresión. Se trata de una tracción vertical que podemos realizar a medio camino entre el plano frontal y el sagital. Un error muy común es abrir mucho el agarre o utilizar inercias; aproximadamente 1,5 veces el ancho biacromial parece ser la mejor anchura (39). También parece ser recomendable añadir una ligera inclinación del torso (sin impulsos) en lugar de mantenerlo totalmente perpendicular al suelo, para buscar una mejor alineación e incrementar la activación del dorsal ancho (40, 41).$t$,
  execution=$t$Agarra la barra con un agarre prono y una anchura de entre 1,2 y 2 veces el ancho biacromial y, a ser posible, usando straps. Siéntate en la máquina de forma estable, ajustándola a tus rodillas para que los pies queden clavados al suelo; genera algo de tensión en las escápulas e inclina ligeramente tu torso hacia atrás (hasta unos 135º, según sensaciones). Comienza a traccionar con la espalda, hacia abajo y hacia dentro, hasta llevar la barra por debajo de tu barbilla; no es necesario tocar el pecho, pero sí estandarizar las repeticiones según tu movilidad. Recuerda sacar pecho hacia afuera durante todo el recorrido. Una vez ahí, vuelve hasta la posición inicial controlando la fase excéntrica, hasta extender por completo los brazos pero manteniendo siempre la tensión sobre la espalda; recuerda evitar impulsos e inercias en el movimiento.$t$,
  cues=array[$t$Evita impulsos e inercias con tu cuerpo a la hora de realizar el movimiento.$t$,
    $t$Un agarre de 1,5 veces el ancho biacromial suele ser la mejor opción.$t$,
    $t$No es necesario tocar el pecho; puedes tomar la barbilla como referencia.$t$]::text[]
where id=299;

-- 300 · Jalón al Pecho Supino
update exercises set
  description=$t$En esta variante de jalón seleccionamos un agarre supino, es decir, con las palmas de las manos mirando hacia nosotros al coger la barra. La anchura del agarre será menor, en torno al ancho biacromial, y debemos realizar el movimiento puramente en el plano sagital, buscando llevar el codo abajo y atrás. Aunque implique al bíceps más que otros agarres, no es una buena opción para su trabajo directo; sin embargo, sí parece ser una mejor opción que unas dominadas supinas en la mayoría de casos por su mayor estabilidad.$t$,
  execution=$t$Agarra la barra con una anchura cómoda, similar al ancho biacromial, y con las palmas de las manos mirando hacia ti; puedes usar straps. Ancla los pies al suelo y genera algo de tensión en tus escápulas, añadiendo una ligerísima inclinación a tu torso para mayor comodidad y para poder descender la barra correctamente sin que la cabeza esté en la trayectoria. Comienza a traccionar: céntrate en llevar el codo abajo y atrás, hacia tu glúteo, mientras sacas pecho hacia afuera durante todo el recorrido. Continúa hasta descender la barra a una posición entre tu barbilla y la parte superior de tu esternón; no es necesario que la barra toque el pecho, pero estandariza el ROM en las repeticiones. Una vez alcanzada esa posición, regresa a la posición inicial controlando la fase excéntrica, evitando perder tensión en la espalda.$t$,
  cues=array[$t$Piensa en llevar los codos abajo y hacia atrás, no en flexionarlos.$t$,
    $t$No metas inercias, impulsos ni te tumbes para traccionar de la barra.$t$,
    $t$Saca pecho durante todo el ejercicio.$t$,
    $t$Puedes dejar, o no, que las escápulas se protraigan siempre que no pierdas tensión, pero esto implicará menos al dorsal y más a otros grupos musculares.$t$]::text[]
where id=300;

-- 301 · Jalón al Pecho Neutro
update exercises set
  description=$t$Este jalón suele ser una buena variante para trabajar la espalda y muy superior a su alternativa en dominadas; sin embargo, el agarre que utilicemos será un gran condicionante. Selecciona preferentemente un agarre neutro biacromial; un neutro ancho o, especialmente, los agarres neutros tipo MAG suelen dar mejor sensación y estímulo que el agarre en V o neutro cerrado. Sin embargo, la clave principal será que utilices, de los que tengas a tu disposición, el agarre que te resulte más cómodo y mejores sensaciones te dé; la longitud de tu brazo y tu movilidad afectarán a esta decisión.$t$,
  execution=$t$Coge el agarre seleccionado y ancla tus manos lo más fuerte que puedas a él, preferentemente usando straps o metiendo la máxima cantidad posible de palma de la mano en él; puedes soltar los dedos pulgar e índice (agarre pistol) si te sientes más cómodo o notas mucha tensión en bíceps o antebrazo al realizar el movimiento. Anclado con las rodillas y los pies estables en el asiento, inclina muy ligeramente tu torso hacia atrás, saca pecho y, evitando impulsos, comienza a traccionar pensando en llevar tus codos hacia abajo y atrás, hasta que tus manos alcancen una posición entre la parte superior del esternón y tu barbilla. Ahí puedes aguantar brevemente la contracción y volver de forma controlada hasta la posición inicial, sin perder tensión en las escápulas.$t$,
  cues=array[$t$Piensa en llevar los codos abajo y atrás, no en flexionarlos.$t$,
    $t$No metas inercias, impulsos ni te tumbes para traccionar del agarre.$t$,
    $t$Saca pecho durante todo el ejercicio.$t$,
    $t$Puedes dejar, o no, que las escápulas se protraigan siempre que no pierdas tensión, pero esto implicará menos al dorsal y más a otros grupos musculares.$t$]::text[]
where id=301;

-- 302 · Jalón al Pecho en Banco Inclinado
update exercises set
  description=$t$Esta variante de jalón se realiza en un banco inclinado desde polea alta y con agarre neutro. Puedes situar los pies hacia atrás, en línea con tu cuerpo, o por delante, buscando situar la pelvis en retroversión para darle estiramiento al dorsal, que tiene su inserción en la cresta ilíaca. Busca alinear el cable, la dirección de la fuerza y el movimiento con tu cuerpo. En cuanto al agarre, selecciona preferentemente el neutro que te resulte más cómodo; preferentemente será uno neutro ancho, una barra recta a la que añadamos agarres libres o agarres tipo MAG, ya que es lo que mejor suele ir para la mayoría.$t$,
  execution=$t$Sujeta el agarre escogido para realizar el ejercicio y separa ligeramente el cable colocándote en el banco, apoyando tu pecho y todo el torso sobre él; puedes colocar los pies hacia atrás aplicando fuerza contra el suelo para situarte en una posición estable, o llevarlos hacia delante si buscas dar algo más de estiramiento. Desde esta posición, comienza a traccionar, evitando pegar un impulso o tirón, y guiando los codos hacia tus caderas, sin perder de vista que el cable y tu espalda estén alineados en la medida de lo posible. Puedes despegar ligeramente el pecho del banco si así te sientes más cómodo y te permite un mayor ROM activo. Aguanta una breve contracción y regresa a la posición inicial controlando la fase excéntrica. Puedes extender por completo los codos antes de volver a traccionar.$t$,
  cues=array[$t$Sitúate estable en el banco; evita que tu pelvis o glúteo se despeguen.$t$,
    $t$Alinea el cable y movimiento con la posición de tu cuerpo y banco.$t$,
    $t$Piensa en descender los codos hacia tu cadera; tracciona desde el húmero, no pienses en doblar el codo para bajar el agarre.$t$]::text[]
where id=302;

-- 303 · Jalón Unilateral en Banco Inclinado
update exercises set
  description=$t$Esta variante de jalón suele dar mejores sensaciones incluso que su homóloga a dos manos, al permitirnos algo más de libertad de movimiento. Selecciona un agarre libre o de cruces que permita añadir una muy ligera supinación al movimiento. Puedes situar los pies por delante de tu cuerpo, buscando situar la pelvis en retroversión para darle estiramiento al dorsal, que tiene su inserción en la cresta ilíaca. Recuerda alinear el cable y la dirección del movimiento con tu cuerpo.$t$,
  execution=$t$Coge el agarre neutro pero añadiendo una ligera supinación a la muñeca, preferiblemente usando straps y pudiendo dejar, según sensaciones, pulgar e índice libres (agarre pistol). Siéntate en el banco, sacando tus pies hacia delante para colocar la pelvis en retroversión; genera una ligera tensión en la escápula del lado que va a trabajar y comienza a traccionar del cable, evitando impulsos con el cuerpo y haciendo fuerza desde tu húmero. Piensa en llevar el codo a la cadera o al bolsillo trasero de tu pantalón, pudiendo añadir opcionalmente una ligera inclinación del cuerpo en la parte baja del movimiento. Una vez descendido el cable, vuelve a la posición inicial de forma controlada; no es necesario estirar por completo el brazo ni protraer la escápula.$t$,
  cues=array[$t$Alinea el cable y movimiento con la posición de tu cuerpo y banco.$t$,
    $t$Piensa en llevar el codo hacia la cadera.$t$,
    $t$Sitúate estable en el banco, puedes apoyar la mano libre contra él.$t$,
    $t$Evita pegar tirones del cable e impulsarte, tracciona desde el húmero.$t$,
    $t$Puedes añadir una ligerísima inclinación lateral al movimiento.$t$]::text[]
where id=303;

-- 304 · Remo con Barra Supino
update exercises set
  description=$t$Esta variante de remo con peso libre se realiza con una barra recta y agarre supino, aunque también pueden utilizarse otros tipos de barras si resulta cómodo y nos permite adaptarnos a la intensidad y al rango de repeticiones, pese a no ser lo común. El objetivo es estimular especialmente el dorsal ancho al enfatizar la extensión de hombro, aunque otros grupos musculares que componen la espalda también trabajarán de forma activa en el ejercicio. Quizá no sea el mejor ejercicio, sobre todo por el trampeo que suele verse, pero sin duda es uno más a considerar.$t$,
  execution=$t$Sitúate de pie frente a la barra, cógela con un agarre supino, a ser posible usando straps, y despégala del suelo manteniéndola constantemente pegada a ti. Inclina el cuerpo hacia delante; la inclinación, según comodidad, podrá ser mayor o menor. Desciende la barra de forma controlada hasta un punto cómodo, situado por debajo de tus rodillas, que te permita mantener la columna lumbar en una posición aproximadamente neutra y compacta. Desde aquí, comienza a traccionar centrándote en llevar tus codos hacia las caderas, pudiendo añadir una ligerísima extensión de tronco; busca un punto al que llevar siempre la barra, por ejemplo, ligeramente por debajo de tu ombligo. Una vez alcanzada la máxima extensión, desciende la barra de forma controlada hasta la posición inicial de nuevo.$t$,
  cues=array[$t$Evita realizar un trampeo excesivo: la barra va a tu cuerpo, no tu cuerpo a la barra. Es posible realizar un ligero impulso, pero no un salto.$t$,
    $t$Céntrate en llevar los codos a tu cadera, evita que se abran en exceso hacia afuera y busca un punto al que guiar siempre la barra; por ejemplo, ligeramente por debajo del ombligo.$t$,
    $t$Evita sacar chepa o curvar excesivamente la zona lumbar.$t$,
    $t$Controla la fase excéntrica y estandariza las repeticiones.$t$]::text[]
where id=304;

-- 305 · Remo Gironda Alto
update exercises set
  description=$t$Esta variante de remo tiene el objetivo de trabajar principalmente la musculatura de la espalda alta. Puede realizarse desde una polea de remo gironda convencional, saliendo por detrás del asiento, o en una polea regulable; sin embargo, es preferible contar con un apoyo en el pecho para evitar impulsos, además de añadir una mayor estabilidad al movimiento que permita centrarnos en llevarlo dentro de un plano transversal. Puedes utilizar preferentemente un agarre de barra al que añadas agarres libres o, si no cuentas con esta posibilidad, una barra recta o un agarre neutro semiancho pueden ser útiles.$t$,
  execution=$t$Coge el agarre seleccionado para realizar el ejercicio, preferiblemente usando straps. Sepárate de la polea y colócate en la posición en la que ejecutas el remo gironda; puedes dar algunos pasos hacia atrás y situarte por detrás del asiento. Puedes elevar tu posición con un cajón o similar si con ello consigues alinear mejor la dirección del movimiento con tus escápulas y la espalda alta. Protrae las escápulas (déjalas ir ligeramente hacia delante) sin perder tensión y comienza a traccionar; para ello, evita pensar en los codos y céntrate en juntar tus escápulas, manteniendo el movimiento horizontal o dentro del plano transversal. Una vez alcanzado el máximo ROM, evitando tirarte hacia atrás con el cuerpo o impulsarte, controla la fase excéntrica para volver poco a poco a la posición inicial, evitando que se pierda la tensión.$t$,
  cues=array[$t$Sitúate estable, a ser posible con el pecho apoyado, y evita impulsos.$t$,
    $t$Céntrate en llevar el movimiento dentro del plano transversal.$t$,
    $t$Intenta alinear el cable y el agarre con la altura de tus escápulas.$t$]::text[]
where id=305;

-- 306 · Remo Gironda
update exercises set
  description=$t$Este remo se realiza típicamente en una polea baja con asiento y apoyo de pies. Pueden utilizarse distintas barras y variantes en función del énfasis que quiera darse, pero la forma clásica es con un agarre neutro cerrado; sin embargo, por cuestiones de alineación, suele ser mejor realizarlo con un agarre neutro con un ancho biacromial o superior. Si no lo tienes, puedes imitarlo anclando unos agarres libres a una barra. La idea es estimular la espalda, pero especialmente el dorsal ancho, pudiendo añadir también una ligera retroversión pélvica. Evita grandes impulsos con tu cuerpo.$t$,
  execution=$t$Coge el agarre seleccionado, preferiblemente usando straps, y con los brazos estirados siéntate en el banco, situando los pies sobre los apoyos de la máquina y ejerciendo fuerza contra ellos para situarte en una posición estable. Comienza a generar tensión sobre la espalda, situando tu torso en perpendicular (a unos 80-100º) respecto al banco. Desde ahí, comienza a traccionar pensando en llevar tu codo a la cadera, a lo que puedes añadir la intención de juntarlos ligeramente, sin ser necesario que el codo traspase por mucho la línea de tu torso. Evita impulsarte tirando el cuerpo hacia atrás para realizar más rango de movimiento del cable: lo que importa es el movimiento de tu húmero respecto al torso. Una vez completada la fase concéntrica, vuelve de forma controlada, evitando soltar el cable o aprovechar inercias.$t$,
  cues=array[$t$Evita tirar el cuerpo hacia atrás para impulsarte y mover el cable: no importa el recorrido del cable, sino mover tus codos.$t$,
    $t$Piensa en llevar tus codos hacia la cadera; incluso puedes añadir una ligera intención de juntarlos.$t$,
    $t$No es necesario que el codo pase la línea de tu torso en la fase concéntrica, ni que las escápulas se protraigan durante la fase excéntrica.$t$]::text[]
where id=306;

-- 307 · Remo en Máquina Prono
update exercises set
  description=$t$En esta variante nos colocamos en la máquina de remo, que generalmente tiene 2 agarres: escogeremos el prono y bajaremos el asiento para favorecer la alineación del movimiento con nuestras escápulas dentro de un plano transversal, lo que permite un mayor énfasis en la musculatura de la espalda alta al centrarnos en la retracción escapular.$t$,
  execution=$t$Colocado en la máquina de remo, baja el asiento hasta hacer coincidir aproximadamente las manetas con una posición cómoda, ligeramente por debajo de la altura de tus hombros o en torno a ella. Apoya los pies para generar estabilidad, saca muy ligeramente la cadera y apoya el pecho contra el respaldo. Desde aquí, comienza a traccionar con los codos hacia afuera, centrándote en hacer una fuerte retracción escapular, como si quisieras juntar los bordes mediales de ambas escápulas. Una vez alcanzada la retracción escapular, vuelve a la posición inicial controlando la fase excéntrica y dejando que las escápulas acompañen el movimiento, es decir, generando una protracción para después volver a contraer.$t$,
  cues=array[$t$No te impulses con el cuerpo despegando el pecho del apoyo.$t$,
    $t$Piensa en juntar fuerte tus escápulas, como si quisieras sujetar algo entre ellas.$t$,
    $t$Lleva los codos hacia afuera (abducción de hombro) según comodidad.$t$]::text[]
where id=307;

-- 308 · Remo en Máquina Neutro
update exercises set
  description=$t$Este remo en máquina es un clásico de los gimnasios; sin embargo, la mayoría de usuarios suele realizarlo mal. Con él buscamos incidir más en la extensión de hombro y, con ello, en el dorsal ancho. Es por eso que el asiento debe estar situado en la posición habitual, es decir, más alto que en el remo prono. El diseño de la máquina (plate-loaded, de placas…), así como su propia línea de movimiento, influirán en la curva de resistencia del ejercicio.$t$,
  execution=$t$Siéntate en el banco, agarrando las manetas verticales y situando tus pies contra el suelo o en los apoyos para generar una posición estable. Desde aquí, partiendo de los brazos estirados, comienza a traccionar centrándote en el húmero y pensando en llevar tus codos hacia tus caderas. Continúa llevando el codo hacia atrás hasta llegar aproximadamente a la línea vertical que forma tu torso con el banco; no es necesario llevar el codo más atrás si tu objetivo es enfatizar esencialmente el dorsal ancho. Una vez alcanzada esta posición, controla la fase excéntrica evitando dejar caer el peso de golpe.$t$,
  cues=array[$t$Piensa en llevar el codo a la cadera.$t$,
    $t$No es necesario que traspase la línea de tu cuerpo si no estás cómodo con ello y tu objetivo es enfatizar el dorsal ancho.$t$,
    $t$Evita inercias y no te impulses con el cuerpo despegando el pecho del apoyo.$t$,
    $t$Puedes añadir una ligera pausa al final del movimiento.$t$]::text[]
where id=308;

-- 309 · Remo en Máquina de Pie
update exercises set
  description=$t$En este remo lo que buscamos es separarnos de la máquina, esencialmente cuando la máquina es plate-loaded, pues en ella la parte del ejercicio que mayores demandas genera sobre el dorsal ancho coincide con la posición en la que este tiene una menor capacidad de aplicar fuerza. En este tipo de máquinas (de discos) es donde este ejercicio cobra, por tanto, un mayor sentido, ya que modifica la curva de resistencia respecto a su realización sentado. Debes buscar una posición cómoda y estable para poder realizarlo: puedes apoyar la mano libre en el respaldo y adelantar un pie respecto al otro para conseguir mayor estabilidad.$t$,
  execution=$t$Agarra la maneta vertical por su parte alta y sepárate del asiento, situando uno o ambos muslos apoyados sobre él, a la misma altura o uno adelantado respecto al otro; añade el apoyo de la mano libre en el respaldo del asiento para generar una mayor estabilidad y, a continuación, comienza a traccionar del agarre centrándote en dirigir el codo del lado que trabaja hacia la cadera, es decir, hacia atrás y hacia abajo en el plano sagital, mientras clavas los pies y aprietas con la mano apoyada contra el banco. Una vez completada la fase concéntrica, vuelve a la posición inicial controlando el movimiento, evitando que la carga caiga de forma brusca.$t$
where id=309;

-- 310 · Remo Gironda Unilateral
update exercises set
  description=$t$En esta variante buscamos trabajar de forma unilateral, lo que puede ser interesante en muchos casos de cara a obtener mejores sensaciones, añadir una ligera rotación interna del torso e incluso lograr una mejor alineación. Selecciona un agarre neutro o, a ser posible, con ligera supinación para mejores sensaciones; también puedes soltar los dedos pulgar e índice (agarre pistol) si sientes que se te carga mucho el bíceps. Utiliza preferentemente un agarre libre o de cruces, que permita estabilidad y libertad en la muñeca.$t$,
  execution=$t$Coge el agarre y clava tus pies sobre el suelo o la plataforma, ejerciendo fuerza contra ella para situarte en una posición lo más estable posible para poder realizar el movimiento. Sitúa tu torso aproximadamente perpendicular respecto al banco y estira el brazo del lado que va a ejecutar el movimiento, dejando ir ligeramente la escápula. Comienza a traccionar del cable desde el hombro, supinando ligeramente la mano durante la fase concéntrica y centrándote en llevar el codo hacia tu cadera, hacia abajo y atrás, sin que sea necesario que pase la vertical de tu torso para completar el movimiento. Prueba a añadir una breve pausa aguantando la contracción, a la que puedes añadir una ligerísima inclinación del tronco hacia dentro si te sientes cómodo y te hace sentir más el dorsal, antes de regresar a la posición inicial controlando la fase excéntrica. Evita realizar movimientos rápidos o bruscos.$t$,
  cues=array[$t$Piensa en llevar tu codo abajo y atrás, hacia tu cadera.$t$,
    $t$Puedes añadir un pequeño gesto de rotación; no es necesario, pero en ocasiones puede ayudar a que sientas más el dorsal si te cuesta.$t$,
    $t$Evita pegar tirones o tumbar tu cuerpo para llevar el cable hacia atrás.$t$]::text[]
where id=310;

-- 311 · Seal Row con Mancuernas en Banco Inclinado
update exercises set
  description=$t$Este ejercicio es una variante del clásico Seal Row, que suele realizarse en un banco plano tanto con barra como con mancuernas; sin embargo, en esta alternativa utilizaremos un banco con una inclinación en torno a 30-50º y realizaremos el movimiento con una trayectoria ligeramente angular o pendular. Lo ideal es realizar el movimiento centrado en la extensión de hombro; sin embargo, puede realizarse también combinado con énfasis en la retracción escapular primero, dividiendo el movimiento en 2 fases.$t$,
  execution=$t$Coge 2 mancuernas con agarre neutro y túmbate en un banco inclinado a unos 30-50º, dejando caer todo tu peso sobre él. Puedes doblar las rodillas y apoyarlas sobre el banco para evitar impulsarte en exceso, o clavar los pies en el suelo generando fuerza contra él para tener mayor estabilidad. Deja colgar las mancuernas, adelantándolas ligeramente respecto a los hombros para situar el dorsal en estiramiento. Desde aquí, comienza a traccionar extendiendo el hombro y dirigiendo los codos abajo y atrás, a la vez que puedes añadir la intención de retraer las escápulas, pensando en juntar los codos por detrás de tu cadera. Evita despegar el pecho del banco en exceso o utilizar excesivas inercias con las mancuernas. Al terminar la fase concéntrica, vuelve a la posición inicial controlando la fase excéntrica y alargando el dorsal.$t$,
  cues=array[$t$Piensa en llevar tus codos a la cadera y juntarlos ligeramente por detrás.$t$,
    $t$Evita inercias excesivas y tirar con el torso en exceso. Las mancuernas no deben ser péndulos que se muevan balanceando tus hombros.$t$,
    $t$La trayectoria debe ser ligeramente angular; puedes retraer primero las escápulas y después extender el hombro.$t$]::text[]
where id=311;

-- 312 · Remo en Polea Unilateral – Bench Cable Row
update exercises set
  description=$t$Esta variante de remo en polea a una mano es una buena alternativa para el trabajo de la espalda y, más concretamente, si queremos incidir sobre el dorsal ancho, ya que nos permite enfatizar bien el movimiento en la extensión de hombro, además de ofrecer una gran alineación y de ser un ejercicio que permite trabajar con gran estabilidad gracias al apoyo de los pies y de la mano contralateral en el banco. En este movimiento en concreto, la polea debe colocarse aproximadamente a la altura del hombro, pero puede subirse o bajarse ligeramente según comodidad y sensaciones.$t$,
  execution=$t$Con la polea en una posición cómoda, situada en torno a la altura de tu hombro, coge un agarre libre de forma neutra, a ser posible usando straps; clava tus pies contra el suelo, pudiendo adelantar uno respecto al otro si así te sientes más estable, y apoya el antebrazo del lado contralateral (el que no va a trabajar) contra el banco, ejerciendo fuerza contra él. Ahora genera tensión desde el hombro y comienza a traccionar dirigiendo tu codo hacia abajo y hacia atrás, realizando una ligera supinación con tu mano. Puedes añadir además la intención de cruzar el codo por detrás de tu cuerpo hacia tu columna e inclinar ligeramente tu torso hacia el lado contrario mientras realizas la acción. No es necesario que el codo sobrepase la línea vertical de tu torso. Una vez terminada la fase concéntrica, vuelve a la posición inicial controlando la fase excéntrica.$t$,
  cues=array[$t$Piensa en llevar tu codo abajo y atrás, hacia tu cadera.$t$,
    $t$Evita pegar tirones o tumbar tu cuerpo para llevar el cable hacia atrás.$t$,
    $t$Realiza una ligera supinación con el agarre y usa straps.$t$,
    $t$Puedes añadir un pequeño gesto de rotación interna al final; no es necesario, pero en ocasiones puede ayudar a que sientas más el dorsal si te cuesta.$t$]::text[]
where id=312;

-- 313 · Pull Over Unilateral desde Polea Alta
update exercises set
  description=$t$Según cómo se realice, el pull over puede ser un ejercicio que enfatice especialmente el deltoides posterior, el dorsal ancho o ser un ejercicio poco útil, como en el caso de realizarlo con mancuerna. En el caso concreto de esta variante, lo que se busca es que el dorsal ancho sea el limitante y, por tanto, donde se dirija la mayor parte del estímulo. Se trata de un ejercicio en el que podemos variar fácilmente la parte más dura del movimiento: alejándonos de la polea y con el torso prácticamente vertical, será más difícil la parte final (dorsal en acortamiento); si flexionamos el tronco, será más difícil la parte inicial (dorsal en estiramiento); y si nos situamos en un punto intermedio, la dificultad será similar durante todo el movimiento.$t$,
  execution=$t$Utiliza preferentemente un agarre de cuerda, una muñequera o directamente la bola de la polea, con un agarre neutro. Colócate frente a la polea alta en la posición elegida: si estás más lejos de la polea, no es necesario elevar el brazo más que por encima de la cabeza; cuanto más flexiones el tronco, más podrás elevarlo, elongando el dorsal. Desde aquí, comienza a extender el hombro llevando el codo hacia la cadera, buscando aplastar tu dorsal con el tríceps; una vez extendido por completo, añade una ligera contracción y, opcionalmente, una ligera inclinación del torso, y regresa de forma lenta y controlada a la posición inicial.$t$,
  cues=array[$t$Piensa en aplastar tu dorsal ancho con tu tríceps.$t$,
    $t$Extiende el hombro a la vez que añades una ligera rotación e inclinación con el torso.$t$,
    $t$Elige la posición del torso que te resulte más cómoda según la parte que quieras trabajar; el brazo se elevará más o menos en función de esta decisión.$t$]::text[]
where id=313;

-- 314 · Pull Over de Pie con Cuerda
update exercises set
  description=$t$Esta variante de pull over es de las mejores para dar un buen estímulo al dorsal ancho. Se trata de un ejercicio en el que podemos variar fácilmente la parte más dura del movimiento: alejándonos de la polea y con el torso vertical, será más difícil la parte final (dorsal en acortamiento); si nos acercamos y flexionamos el tronco, será más difícil la parte inicial (dorsal en estiramiento); y si nos situamos en un punto intermedio, la dificultad será similar durante todo el movimiento. Un error común es usar mucho impulso con el cuerpo o flexionar y extender los codos; recuerda mantener cierta trayectoria angular, como un esquiador, para exprimir el ejercicio.$t$,
  execution=$t$Colócate de pie sujetando con ambas manos una cuerda anclada a una polea alta. Desde ahí, da 2-4 pasos hacia atrás y colócate en la posición elegida: si estás lejos de la polea y te mantienes vertical, no es necesario elevar el brazo más que por encima de la cabeza; cuanto mayor sea la flexión del tronco, más podrás elevarlo, elongando el dorsal. Desde esta posición inicial, extiende los hombros con una trayectoria angular, buscando aplastar tu dorsal con el tríceps. Es fundamental que no extiendas el codo tirando con los tríceps. Una vez extendido por completo el hombro, añade una ligera contracción y regresa de forma lenta y controlada a la posición inicial.$t$,
  cues=array[$t$Céntrate en la dirección y extensión de tus hombros.$t$,
    $t$Piensa en aplastar tu dorsal ancho con tu tríceps.$t$,
    $t$Elige la posición del torso que te resulte más cómoda según la parte que quieras trabajar; el brazo se elevará más o menos en función de esta decisión.$t$]::text[]
where id=314;

-- 315 · Remo con Mancuerna Unilateral
update exercises set
  description=$t$Este ejercicio es, tradicionalmente, uno de los más realizados de cara al entrenamiento de espalda; al ser un ejercicio que hace tanta gente, también es uno de los que peor se realizan y con mayores diferencias a nivel técnico. Puedes apoyarte sobre un banco, pero también un mancuernero, un rack o cualquier punto estable puede ser útil para realizarlo. Muchos ejercicios pueden resultar superiores en cuanto a comodidad o estabilidad, pero en muchos casos puede ser una buena opción, en la que sin duda es recomendable utilizar straps.$t$,
  execution=$t$Coge una mancuerna con agarre neutro, usando straps para que el agarre no sea limitante y poder centrarte en la trayectoria y la dirección del codo. Con la mano libre, busca un apoyo cómodo y estable: puedes apoyarte en un banco plano colocando también una rodilla sobre él o quedarte de pie según comodidad; también puedes cambiar la inclinación del banco para usarlo de apoyo. Para iniciar el movimiento, desplaza la mancuerna alejándola de ti, buscando estirar el dorsal ancho en la medida de lo posible; desde aquí, comienza a traccionar buscando llevar el codo a la cadera, evitando llevar el estímulo al bíceps tirando como si arrancaras un cortacésped; para ello, añade una ligera trayectoria circular o angular al movimiento. Una vez extendido el hombro, con el codo en la cadera y evitando impulsos (acerca la mancuerna a la cadera, no la cadera a la mancuerna), controla la fase excéntrica o descenso y regresa a la posición inicial con el dorsal elongado.$t$,
  cues=array[$t$Piensa en llevar tu codo a la cadera.$t$,
    $t$Realiza una trayectoria ligeramente angular con el codo.$t$,
    $t$Busca elongar el dorsal alejando la mancuerna de ti en la fase excéntrica.$t$]::text[]
where id=315;

-- 316 · Remo desde Polea Baja con Cuerda en Banco Inclinado
update exercises set
  description=$t$Para realizar esta variante de remo colocaremos un banco con una inclinación en torno a 45º, o según comodidad, y una polea situada en posición baja. Para realizarlo utilizaremos preferentemente un agarre de cuerda, por comodidad y libertad en el agarre, pero también es posible realizarlo con una barra e incluso con agarres libres. Se trata de un ejercicio en el que la estabilidad no es un limitante. Existen variantes que se enfocan más hacia la espalda alta, centrando el movimiento en la retracción escapular; sin embargo, en este caso concreto nos centramos en la extensión de hombro, llevando el codo en el plano sagital y buscando trabajar el dorsal ancho.$t$,
  execution=$t$Túmbate apoyando todo tu pecho y dejando caer el peso sobre el respaldo; para generar estabilidad, apoya los pies en el suelo por debajo de la línea de tus caderas, aunque también es posible sentarse en el banco y llevar la cadera a una mayor retroversión si las sensaciones son mejores. Desde aquí, con la polea situada en una posición baja (a la altura de la cadera o inferior), agarra la cuerda con un agarre neutro y sepárala para poner el cable en tensión antes de iniciar el movimiento. Comienza a traccionar centrándote en llevar tus codos a tu cadera de forma controlada, evitando tirones y supinando ligeramente la mano a medida que la acercas a tu torso. Una vez extendido el hombro (sin ser necesario que tus codos sobrepasen la línea de tu cuerpo), contrae el dorsal y desciende de forma controlada hasta la posición inicial, evitando perder tensión o que las placas choquen. Mantén el cuello neutro y apoyado en el banco; no lo hiperextiendas.$t$,
  cues=array[$t$Piensa en llevar tu codo a la cadera.$t$,
    $t$Pega tus tríceps al dorsal y contrae al máximo la espalda.$t$,
    $t$Evita que se te abran los codos hacia afuera; tampoco es necesario que pasen en exceso la línea de tu torso.$t$]::text[]
where id=316;

-- 317 · Meadows Row
update exercises set
  description=$t$Este ejercicio fue popularizado por el culturista y entrenador John Meadows. Es una variante de remo landmine en la que nos colocamos perpendiculares a la barra, de forma unilateral. Y aunque trabaja también el dorsal ancho, el objetivo principal de este remo es enfatizar el movimiento en la musculatura de la espalda alta: romboides, trapecio inferior y medio, teres y deltoides posterior. Suele realizarse generalmente con una barra olímpica y discos, pero también es posible realizarlo en algunas máquinas de remo en T, utilizando la zona de carga de discos como agarre, e incluso con barra y apoyado en un banco, de forma similar a un remo con mancuerna.$t$,
  execution=$t$Sitúa una barra en el suelo contra una esquina o con un apoyo landmine y colócate lateralmente, en perpendicular a ella; a continuación, agárrala por la punta, a ser posible utilizando straps. Un truco para este ejercicio, si sientes mucha tensión en el bíceps, sería utilizar un agarre falso, con el pulgar sin rodear la barra. Ahora adelanta, según comodidad, un pie respecto al otro e inclínate manteniendo la espalda neutra y sin redondearla en la medida de lo posible; recuerda buscar una posición cómoda para tu cuello (generalmente, mirar al suelo suele ir bien). Ya estás en la posición de partida. Ahora despega ligeramente los discos del suelo para generar tensión y comienza a traccionar llevando el codo hacia afuera, no hacia la cadera. Una vez alcanzada la máxima contracción, aguanta brevemente y desciende de forma controlada hasta la posición inicial, evitando rebotes o perder tensión con los discos contra el suelo.$t$,
  cues=array[$t$No lleves el codo hacia la cadera, sino hacia el lateral de tu cuerpo, aunque según comodidad puede apuntar ligeramente hacia atrás.$t$,
    $t$Evita que los discos choquen en el suelo, perdiendo tensión.$t$,
    $t$El torso permanece quieto y el movimiento viene del hombro.$t$,
    $t$Controla el movimiento evitando inercias o impulsos.$t$]::text[]
where id=317;

-- 318 · Aducción en Polea para Dorsal
update exercises set
  description=$t$Este ejercicio se enfoca en el trabajo del dorsal ancho. Puede ser conocido también como jalón lateral a 1 mano, pero por el propio gesto que realiza es más correcto llamarlo aducción. Puede realizarse tanto a 1 mano como a 2 manos y generalmente se realiza arrodillado o sentado. Se trata de un ejercicio en el que enfatizaremos otra de las funciones del dorsal ancho que no es la extensión de hombro (como en el caso de un jalón unilateral), sino la aducción de hombro, un movimiento que debemos buscar desarrollar dentro de un plano frontal.$t$,
  execution=$t$Sitúate arrodillado de forma lateral a una polea colocada en su posición más alta y, utilizando un agarre en D o libre, coge el agarre con la mano del lado más cercano a la polea, dejando el codo y el brazo extendidos hacia la misma. A continuación, tira ligeramente del cable para situarlo en tensión y, desde ahí, comienza a traccionar evitando doblar el codo como en un curl de bíceps: debes pensar en llevar tu codo a tu cadera o tu tríceps a aplastar tu dorsal dentro de un plano frontal, es decir, evita llevar el codo excesivamente hacia atrás. Continúa traccionando hasta llegar a la máxima contracción; a medida que llegas a este punto, puedes inclinar ligeramente el torso hacia el mismo lado, y desciende de forma controlada hasta la posición inicial de nuevo.$t$,
  cues=array[$t$Tracciona del cable pensando en llevar el codo a tu cadera, no en flexionar el codo.$t$,
    $t$Piensa en pegar el tríceps a tus costillas o dorsal a la vez que bajas el codo a la cadera.$t$,
    $t$Puedes añadir una ligera inclinación del torso hacia el lado de la polea.$t$]::text[]
where id=318;

-- 319 · Jalón al Pecho Focus Espalda Alta
update exercises set
  description=$t$Esta variante del jalón prono con barra busca llevar más el trabajo hacia la musculatura de la zona superior de la espalda, es decir, dejar de lado el énfasis sobre el dorsal ancho para dárselo a músculos como el romboides, el deltoides posterior, el redondo y el trapecio, entre otros. Para ello, abriremos mucho más el agarre y nos centraremos más en la retracción escapular que en la extensión de hombro al realizar el movimiento. Al igual que en cualquier otra tracción, resulta interesante utilizar straps.$t$,
  execution=$t$Colócate en el asiento y agarra la barra con un agarre prono, preferiblemente usando straps. Durante todo el movimiento deberás evitar utilizar excesivas inercias o impulsos con tu cuerpo; por ello, busca estar bien clavado con las rodillas en los apoyos del banco y los pies en el suelo para poder centrar toda la fuerza en protraer y retraer tus escápulas. A continuación, inclina ligeramente tu torso hacia atrás y deja ir ligeramente tus escápulas hacia arriba (descolgándolas) para después realizar una retracción escapular fuerte. Busca llevar los codos hacia los lados, como si quisieras separar uno de otro, e imagina tus escápulas juntándose lo máximo posible. Una vez alcanzada la máxima contracción, aguanta ligeramente de forma isométrica y vuelve de forma controlada hasta la posición inicial.$t$,
  cues=array[$t$Utiliza un agarre igual o superior a 2 veces el ancho de tus hombros (biacromial) y lleva los codos hacia los lados.$t$,
    $t$Céntrate en protraer tus escápulas para después hacer una retracción escapular fuerte: este debe ser el movimiento principal del ejercicio.$t$,
    $t$Añade una ligera inclinación del torso y dirige la barra hacia la línea media del esternón, aunque no es necesario llegar a tocar.$t$]::text[]
where id=319;

-- 320 · Remo en Polea Plano Transversal
update exercises set
  description=$t$Esta variante de remo busca centrar el trabajo de tracción horizontal en la retracción escapular, con el objetivo de dar énfasis a grupos musculares como el romboides, el deltoides posterior, el redondo y el trapecio, entre otros. Puede realizarse utilizando una barra con agarre prono, un agarre tipo MAG, un agarre neutro o una cuerda; otra buena opción podría ser combinar dos agarres libres para una mayor comodidad. Puede realizarse preferentemente con un apoyo de pecho en un respaldo o banco para una mayor estabilidad, pero en su ausencia también puede ejecutarse sin apoyo, en una polea que puede ser simple o doble.$t$,
  execution=$t$Colócate frente a 1 polea o un pórtico de poleas dobles, a ser posible utilizando straps y colocando un banco sobre el que apoyar tu pecho para generar mayor estabilidad. Selecciona el agarre a utilizar, de forma ideal unos agarres libres. A continuación, sin sentarte necesariamente, apoya los pies en el suelo mientras sujetas los agarres con una anchura similar o ligeramente superior a la anchura de los hombros. Para comenzar el ejercicio, protrae las escápulas adelantando ligeramente los hombros y comienza a juntar fuertemente tus escápulas, buscando realizar una retracción completa y cerrarlas fuerte; una vez alcanzada la máxima contracción, aguanta ligeramente y vuelve de forma controlada a la posición inicial, controlando la fase excéntrica.$t$,
  cues=array[$t$Céntrate en protraer tus escápulas para después hacer una retracción escapular fuerte: este debe ser el movimiento principal del ejercicio.$t$,
    $t$Busca un apoyo estable, a ser posible con un apoyo de pecho.$t$,
    $t$Evita balanceos, inercias o impulsos con el torso, así como despegar el pecho del apoyo para dar sensación de mayor ROM.$t$]::text[]
where id=320;

-- 321 · Jalón Unilateral Sentado
update exercises set
  description=$t$Generalmente, de cara a realizar un jalón unilateral, lo ideal es contar con la variante en banco inclinado para poder apoyar nuestro peso, estar más estables, poder añadir fácilmente retroversión pélvica en caso de desear darle un mayor estiramiento y buscar una buena alineación entre el dorsal y el movimiento. Sin embargo, en caso de no poder realizarse, esta será la alternativa natural al movimiento, siendo también una muy buena opción de cara a enfatizar el trabajo sobre el dorsal ancho.$t$,
  execution=$t$Siéntate en el suelo delante de una polea y coge el agarre, preferentemente utilizando straps. Coloca la polea alta, pero no necesariamente lo más alta posible, sino buscando que al traccionar el cable tenga cierta trayectoria diagonal descendente, en lugar de que sea totalmente vertical. Partiendo de un agarre neutro o semisupino, comienza a contraer el dorsal buscando descender tu húmero, como si quisieras llevar el codo hacia el bolsillo trasero de tu pantalón. Realiza un movimiento controlado, pensando en aplastar tu dorsal con el tríceps, y continúa hasta que el codo alcance la línea de tu cuerpo; no es necesario llevar el codo más atrás. Desde ese punto, vuelve controlando la fase excéntrica hasta la posición inicial; suele ser recomendable no protraer la escápula.$t$,
  cues=array[$t$Céntrate en llevar tu codo al bolsillo trasero de tu pantalón; tracciona con el hombro, sin flexionar en exceso el codo.$t$,
    $t$Busca darle cierta trayectoria diagonal al cable para alinear el movimiento con tu cuerpo.$t$,
    $t$Si quieres, también puedes añadir retroversión pélvica.$t$]::text[]
where id=321;

-- 322 · Remo Gironda Agarres Independientes
update exercises set
  description=$t$Esta variante de remo gironda nos permite una mayor libertad de movimiento en las muñecas, así como una mejor alineación y dirección de los codos respecto a la realización con barra, ya sea con agarre neutro, prono o supino. En caso de no disponer de una máquina con dos poleas para utilizar un agarre en cada brazo, puede colocarse una barra con agarres libres o agarres similares a los Angles90. Es un ejercicio que se enfoca al trabajo del dorsal ancho, en el que puede añadirse cierta retroversión pélvica, si quieres, para darle algo más de estiramiento.$t$,
  execution=$t$Colócate en el asiento de la polea situando los pies sobre los apoyos y generando fuerza contra ellos para tener una posición de mayor estabilidad. A continuación, desde el apoyo, inclina ligeramente el torso hacia delante buscando una posición en torno a los 80º respecto al asiento y, preferiblemente usando straps, coge cada uno de los agarres: directamente con un agarre supino o, en su defecto, uno mixto entre neutro y supino, ya que permite centrar el movimiento en la extensión de hombro y cerca del torso. Una vez sujetamos los agarres y estamos estables, comenzamos a extender los hombros, llevando los codos a la cadera y pensando en comprimir nuestros dorsales con los tríceps. No es necesario que los codos sobrepasen la línea de los hombros hacia atrás para considerarse un ROM completo. Extiende hasta ese punto, aguanta brevemente la contracción de forma isométrica y vuelve hasta la posición inicial de forma controlada; no es necesario protraer las escápulas.$t$,
  cues=array[$t$Céntrate en llevar los codos hacia la cadera, no en tirar del agarre flexionando el codo.$t$,
    $t$Piensa en aplastar tus dorsales con los tríceps.$t$,
    $t$Evita tumbarte excesivamente hacia atrás o usar impulsos o inercias con el cuerpo; tracciona desde el hombro.$t$,
    $t$No es necesario que tus codos pasen en exceso la línea de tu hombro.$t$]::text[]
where id=322;

-- 323 · Dante Row
update exercises set
  description=$t$Esta variante de remo en polea fue popularizada por Dante Trudel, de ahí su nombre. Se trata de un ejercicio que requiere un gran dominio técnico y que no todo el mundo será capaz de exprimir con efectividad; sin embargo, permite trabajar desde un ángulo diferente: el movimiento podría ser realmente más similar al de un jalón supino o neutro si tenemos en cuenta la posición del torso y los cables, buscando además el mismo énfasis en el dorsal ancho. Para poder realizarlo de forma estable es fundamental contar con un apoyo en las tibias o las rodillas. Típicamente se realiza con cuerda, pero los agarres independientes parecen ser una mejor opción.$t$,
  execution=$t$Colócate delante del banco de remo, que puede tener 1 o 2 poleas: en caso de contar solo con una, usa una cuerda, y en caso de contar con dos, agarres independientes, según alineación y sensaciones. Apoya la parte delantera de tus tibias contra el banco para buscar una posición lo más estable posible y, a continuación, inclina tu torso hasta dejarlo casi paralelo al suelo. Desde este punto, genera tensión en los cables para situarte en la posición de partida y comienza a extender los hombros, buscando llevar los codos hacia la cadera mientras mantienes el húmero pegado al torso en todo momento. Continúa extendiendo hasta pasar la línea de la rodilla con los codos, aguanta brevemente la contracción y realiza una fase excéntrica lenta y controlada volviendo a la posición inicial.$t$,
  cues=array[$t$Céntrate en llevar los codos hacia la cadera, no en tirar del agarre flexionando en exceso el codo.$t$,
    $t$Piensa en aplastar tus dorsales con los tríceps.$t$,
    $t$No es necesario que tus codos pasen en exceso la línea de tu hombro.$t$]::text[]
where id=323;

-- 324 · Back-boob Pull Down
update exercises set
  description=$t$Esta variante de jalón o tracción vertical ha sido popularizada por Eugene Teo para enfatizar la musculatura de la espalda alta. Por ello, en lugar de centrarnos en llevar el codo hacia la cadera, como generalmente se realiza cuando el objetivo es enfatizar la extensión de hombro y con ello el dorsal, buscamos separar los codos lateralmente y centrar el movimiento en la retracción escapular. Es una muy buena variante para este objetivo; un error muy común suele ser usar excesivos impulsos con el cuerpo y el torso: realiza el movimiento puramente con tus escápulas.$t$,
  execution=$t$Colócate en la máquina de jalón con los pies en el suelo y las rodillas sobre las almohadillas para asegurar una posición estable. En caso de contar solo con una polea sin asiento, podría realizarse sentándote directamente sobre el suelo. Sujeta unos agarres libres, situando tus manos de forma prona o ligeramente neutra. A continuación, deja ir ligeramente los hombros con una protracción escapular y, desde ahí, comienza a traccionar realizando una fuerte retracción escapular y buscando separar tus codos entre sí lateralmente. No lleves el codo a la cadera, sino hacia afuera, y busca que el movimiento principal que se realice sea la retracción escapular. Evita tirarte hacia atrás con el cuerpo para impulsarte, intentando que todo el movimiento sea controlado.$t$,
  cues=array[$t$Céntrate en protraer tus escápulas para después hacer una retracción escapular fuerte: este debe ser el movimiento principal del ejercicio.$t$,
    $t$Añade una ligera inclinación del torso y selecciona un agarre prono, neutro o mixto entre ambos.$t$]::text[]
where id=324;

-- 325 · Remo Pendlay
update exercises set
  description=$t$Esta variante de remo es una de las más populares entre los amantes del peso libre. Desde un punto de vista biomecánico, el ejercicio se basa en una extensión de hombro con una flexión de codo que no debería rebasar en exceso los 90º, para no implicar demasiado a los flexores del codo. Otro aspecto a considerar es el agarre, que podría ser un factor limitante en el ejercicio, por lo que se recomienda usar straps. Otro aspecto importante que podría ser limitante es la postura: debemos buscar mantener el torso lo más horizontal posible, siendo los erectores espinales otro factor limitante en caso de debilidad. Para realizarlo debemos buscar el bloqueo del resto de articulaciones y una posición desde la que traccionar sin desmoronarnos. Mientras que un agarre neutro favorece el trabajo en el plano sagital, en este caso, al realizarse con agarre prono, el movimiento queda a medio camino con el plano transversal y, en función de cómo se realice, podríamos enfatizar más la espalda alta. Un último problema podría ser la falta de ROM en estiramiento en algunos casos, especialmente en personas que no sean muy altas, al tocar los discos el suelo; para solventarlo, podemos elevarnos, por ejemplo, subiéndonos a una plataforma.$t$,
  execution=$t$Con una barra y los discos colocados sobre el suelo, coge la barra, preferentemente usando straps, con una anchura similar a la de tus hombros o ligeramente superior; en muchas ocasiones, utilizar un agarre similar al del press de banca es lo más cómodo. A continuación, sitúa tu torso lo más paralelo al suelo posible y bloquéate en esa posición. Desde aquí, tracciona de la barra buscando llevarla hacia el ombligo y enfatizando la extensión de hombro si quieres dar mayor estímulo al dorsal ancho, o hacia la parte baja del pectoral, separando más lateralmente los codos con una mayor abducción de hombro, si quieres llevar el estímulo hacia la espalda alta. Recuerda mantener estable todo el cuerpo y no añadir un excesivo impulso. Una vez completada la fase concéntrica, realiza lentamente la fase excéntrica de forma controlada hasta estirar y apoyar los discos de nuevo en el suelo.$t$,
  cues=array[$t$Mantén el torso estable durante todo el recorrido; evita un excesivo trampeo, aunque puedes ayudarte ligeramente.$t$,
    $t$Lleva la barra a la zona del ombligo y enfatiza la extensión de hombro para dar mayor énfasis al dorsal, o a la zona superior, enfatizando la retracción escapular, para dar más énfasis a la espalda alta.$t$,
    $t$Usa straps y realiza un movimiento controlado, sin tirones.$t$]::text[]
where id=325;

-- 326 · Remo en Multipower
update exercises set
  description=$t$Este ejercicio, en la mayoría de casos, puede resultar una mejor alternativa que un remo con barra prono o un remo Pendlay, donde las necesidades de estabilización son mucho mayores. En esta variante contamos con una trayectoria guiada, que puede ser totalmente vertical o ligeramente inclinada en función de la máquina que usemos, por lo que podemos aplicar mejor la fuerza. El objetivo de esta variante, al usar un agarre prono, es llevar el estímulo más hacia la musculatura de la espalda alta, por lo que debemos centrarnos en llevar la barra a la parte baja del pecho o a la parte superior del ombligo, en función de la comodidad y de posibles molestias (si te molesta el hombro, llévala más arriba; si te molesta la zona lumbar, más abajo).$t$,
  execution=$t$Colócate de frente a la multipower con una anchura de pies similar a la de tus hombros, o donde más cómodo estés; a continuación, coge la barra con una anchura similar a la que usarías en un jalón al pecho prono o en un press de banca, también según comodidad y sensaciones: podrá rondar las 1,2-1,5 veces el ancho biacromial. Para comenzar con el movimiento, desencaja la barra del soporte y sitúa tu torso lo más paralelo al suelo que puedas, perpendicular a la trayectoria de la barra, y deja caer la barra todo lo que puedas realizando protracción escapular; después, sin impulsarte con el cuerpo, comienza a subir centrándote en juntar lo más fuerte posible ambas escápulas. Intenta sacar pecho ligeramente para no hundirlo durante la fase concéntrica. Puedes mirar al suelo o al frente, según comodidad, durante el recorrido.$t$,
  cues=array[$t$Piensa en separar un codo de otro lateralmente y hacer una retracción escapular fuerte.$t$,
    $t$No tiene por qué ser un movimiento puro en el plano transversal: los codos pueden ir ligeramente hacia abajo.$t$,
    $t$Evita grandes impulsos con tu cuerpo; realiza repeticiones controladas, con una protracción y una retracción escapular lo más completas posible.$t$]::text[]
where id=326;

-- 327 · Remo en Punta
update exercises set
  description=$t$Esta variante de remo, con trayectoria pendular basada en el landmine, puede ser un gran ejercicio, especialmente interesante si acompañamos el movimiento ligeramente con el cuerpo y sin excesos. Tiene una curva de resistencia más uniforme que otros remos con peso libre, pero esto no quiere decir necesariamente que sea mejor ni peor; recuerda que todo depende del contexto. Para realizarlo, utilizamos un apoyo landmine o una barra apoyada contra una esquina, con un agarre neutro o una cuerda, aunque podrían usarse agarres pronos o semipronos. Si llevamos el agarre a la cadera, trabajaremos más en el plano sagital y, por tanto, enfocaremos el estímulo mayormente hacia el dorsal ancho; si, por el contrario, nos centramos en el plano transversal y llevamos el agarre al pecho, por ejemplo atravesando un agarre en V, daremos mayor énfasis a la musculatura de la espalda alta.$t$,
  execution=$t$Coloca la barra en un apoyo landmine o en una esquina haciendo tope para imitarlo. Es recomendable no utilizar discos muy grandes para el peso, ya que podrían recortar el ROM. A continuación, selecciona el agarre que vayas a usar, preferentemente neutro para llevar el estímulo al dorsal ancho, y atraviésalo en la barra. Desde aquí, coloca tu torso ligeramente horizontalizado mientras sujetas el agarre con un ligero estiramiento y comienza a extender el hombro, pensando en llevar el codo hacia la cadera y el tríceps al dorsal. Continúa la fase concéntrica mientras acompañas ligeramente la trayectoria de la barra con el torso, algo más vertical, hasta llevar el agarre prácticamente a la cadera o hasta el pecho; aguanta en la máxima contracción y realiza la fase excéntrica lentamente, de forma controlada, buscando de nuevo el estiramiento y acompañando con el torso en el descenso.$t$,
  cues=array[$t$Acompaña ligeramente con tu cuerpo el movimiento de los discos.$t$,
    $t$No pegues un fuerte tirón inicial, puesto que las fuerzas inerciales harán más fácil esa parte del recorrido; realiza un movimiento controlado.$t$,
    $t$Controla la fase excéntrica; no dejes caer los discos.$t$,
    $t$Piensa en llevar los codos hacia la cadera.$t$]::text[]
where id=327;

-- 328 · Remo en T
update exercises set
  description=$t$Esta máquina de remo es idónea para el desarrollo integral de la espalda, ya que ofrece un apoyo para el pecho y una gran estabilidad, además de la posibilidad de utilizar distintos agarres y amplitudes. Igualmente importante es la altura a la que colocar el pecho, que permite llevar el agarre al pecho o a la cadera, es decir, enfatizar el movimiento en el plano transversal o en el sagital. La diferencia más notable con el resto de remos en polea o con peso libre es la estabilidad y seguridad que ofrece: no habrá problemas de estabilidad ni peligro, por lo que es una opción muy buena e interesante para introducir en la programación en caso de contar con ella, ya que cumple la mayoría de requisitos de un buen ejercicio.$t$,
  execution=$t$Colócate en la máquina apoyando tu pecho y todo tu peso sobre el acolchado; sitúa los pies más adelante o más atrás en función del diseño de la máquina, tu comodidad y tu estatura, entre otros factores, para buscar la máxima estabilidad. Desde aquí, tracciona ligeramente para sacar la barra o los discos del soporte y situarte en la posición inicial con los codos extendidos. Deja las escápulas libres, realizando protracción y buscando el estiramiento. Desde aquí, comienza la concéntrica llevando los codos abiertos hacia afuera (o los codos a la cadera con un agarre neutro para dar énfasis al dorsal). Continúa sin perder la tensión hasta la máxima contracción, haz una breve pausa isométrica y desde ahí vuelve lento y controlado a la posición inicial.$t$,
  cues=array[$t$Mantén una buena técnica; evita despegar en exceso el pecho del apoyo.$t$,
    $t$No pegues un fuerte tirón inicial, puesto que las fuerzas inerciales harán más fácil esa parte del recorrido; realiza un movimiento controlado.$t$,
    $t$Controla la fase excéntrica; no dejes caer los discos.$t$,
    $t$En caso de buscar énfasis en la espalda alta, protrae y retrae las escápulas como movimiento principal, llevando los codos abiertos.$t$,
    $t$En caso de buscar énfasis en el dorsal, lleva los codos hacia la cadera con un agarre neutro.$t$]::text[]
where id=328;

-- 329 · Single Arm Landmine Row
update exercises set
  description=$t$Esta variante de remo se realiza con el objetivo de dar más énfasis a la extensión de hombro y, por tanto, se enfoca más al trabajo del dorsal ancho. Se trata de un ejercicio en el que debemos tratar de realizar un gesto similar a un remo con mancuerna, pero sujetando una barra en apoyo landmine. Durante el ejercicio, intenta evitar que tu espalda se redondee en exceso, buscando un cierto rango de neutralidad y pudiendo acompañar ligeramente el movimiento con el torso o, de forma opcional, buscar un apoyo con la mano libre para tener mayor estabilidad.$t$,
  execution=$t$Sitúate en el lateral de una barra larga olímpica, que debe estar colocada en un landmine o contra una esquina para realizar el ejercicio correctamente y de forma estable. Sitúa tus pies con una anchura similar a la de tus hombros, uno al lado del otro, aunque también podrías adelantar uno ligeramente respecto al otro, según comodidad. Deja tu mano justo debajo de la línea de tu hombro y agarra la barra, a ser posible usando straps. A continuación, sitúa tu torso paralelo al suelo y despega ligeramente el disco del suelo, inclinando muy ligeramente el torso. Comienza a traccionar llevando el codo hacia la cadera. Continúa el movimiento hasta llegar con el codo a la cadera y vuelve a la posición inicial de forma controlada.$t$
where id=329;

-- 330 · Incline Bench Dumbbell Row (antes «Incline Bench Dumbell Row»)
update exercises set
  name=$t$Incline Bench Dumbbell Row$t$,
  description=$t$Este ejercicio podría asemejarse a un remo en T con el pecho apoyado, ya que su objetivo principal es el trabajo de la musculatura de la espalda alta, si se realiza de forma correcta. El uso de mancuernas o la forma del banco pueden limitar el ROM; en ese caso, puede realizarse con kettlebells para aumentarlo. A diferencia del Seal Row con mancuernas, cuyo objetivo es el dorsal ancho mediante una extensión de hombro, en el incline bench dumbbell row el objetivo debe ser la espalda alta, llevando los codos ligeramente hacia afuera.$t$,
  execution=$t$Coloca un banco inclinado y túmbate boca abajo sobre él, situando la parte superior de tu pecho ligeramente sobresaliente, en caso de ser posible. Puedes colocar los pies en el suelo para ejercer fuerza y generar una posición más estable. Desde aquí, sujeta con un agarre prono, preferiblemente usando straps, unas mancuernas o kettlebells, con los brazos completamente estirados, para situarte en la posición inicial. Desde este punto de partida, comienza a traccionar centrando el movimiento en la retracción escapular: trata de juntar las escápulas lo más fuerte que puedas. Lleva los codos abiertos hacia afuera, buscando separarlos a lo ancho. Continúa el movimiento evitando chocar las mancuernas con el banco, en la medida de lo posible, hasta juntar al máximo ambas escápulas. Es posible que tus codos sobrepasen ligeramente la línea de tu torso, pero no es el objetivo en este ejercicio. Una vez alcanzada esta posición, es muy importante descender de forma controlada, evitando dejar caer el peso.$t$,
  cues=array[$t$Céntrate y piensa en juntar lo más fuerte posible una escápula con la otra, como si quisieras atrapar y sujetar un lápiz en medio de ambas.$t$,
    $t$Lleva los codos hacia afuera, buscando amplitud y separarlos a lo ancho.$t$,
    $t$Aguanta la contracción y desciende de forma controlada.$t$,
    $t$No pegues tirones con el cuello, mantenlo neutro mirando al suelo.$t$]::text[]
where id=330;

-- 331 · Remo con Mancuernas Torso Inclinado
update exercises set
  description=$t$En función de cómo se realice, este ejercicio puede variar el énfasis que damos, ya que ciertos grupos musculares contribuirán más o menos a este patrón de movimiento. Movernos en un plano sagital, llevando los codos a la cadera, favorece el trabajo del dorsal. Por el contrario, llevar los codos abiertos en el plano transversal enfatiza principalmente la espalda alta, el trapecio y el deltoides posterior. Se trata de un ejercicio con grandes demandas de estabilización y complejidad, por lo que no será conveniente para todo el mundo. Un último aspecto a tratar sería el agarre, que puede ser limitante; en ese caso, usa straps.$t$,
  execution=$t$Colócate de pie sujetando una mancuerna en cada mano, con los straps enrollados en la barra de cada una; a continuación, inclínate hasta situar tu torso casi paralelo al suelo. La mayor o menor inclinación podrá contribuir en mayor o menor medida a que trabajemos unos u otros grupos musculares; no es necesario que estés totalmente paralelo. Desde aquí, adelanta ligeramente las mancuernas en relación al hombro para situar el dorsal en ligero estiramiento y comienza a traccionar llevando los codos hacia tu cadera si el foco es el dorsal ancho. Si te enfocas en la espalda alta, deja las mancuernas caer a los lados de tu pecho con un agarre prono y separa los codos lateralmente, llevando las mancuernas hacia arriba en esta misma línea (plano transversal). Una vez acabada la fase concéntrica, podemos aguantar ligeramente la contracción de forma isométrica. Desde ahí, descenderemos lentamente en una fase excéntrica controlada hasta notar el estiramiento en el trapecio o el dorsal, en función de cuál sea la musculatura objetivo del ejercicio, y llevaremos a cabo la transición hacia la fase concéntrica sin el uso de fuerzas inerciales ni impulsos excesivos con el cuerpo.$t$,
  cues=array[$t$Apoya bien los pies en el suelo, creando una base sólida para traccionar.$t$,
    $t$No trampees excesivamente añadiendo impulsos con tu cuerpo.$t$,
    $t$Recuerda que si tu foco es la espalda alta debes centrar el movimiento en la protracción y retracción escapular en el plano transversal. Si es el dorsal ancho, en la extensión del hombro llevando los codos a las caderas.$t$]::text[]
where id=331;

-- 332 · Jalón Unilateral en Máquina
update exercises set
  description=$t$Este ejercicio, si la máquina está bien diseñada, es sin duda una de las mejores opciones que tenemos de cara a trabajar el dorsal ancho. No todas las máquinas diseñadas para realizar jalones son buenas opciones; de algunas, incluso, podríamos decir que es mejor evitarlas por el movimiento que nos obligan a realizar, como puede ser el caso de algunas con agarre prono y trayectorias convergentes. En este caso, debemos utilizar preferentemente, y según comodidad, un agarre semisupino, al que podemos añadir libertad de muñeca, aunque también puede utilizarse neutro o supino puro.$t$,
  execution=$t$Siéntate en la máquina con el agarre frente a ti; preferentemente, deberemos contar con una sujeción sobre nuestros muslos que evite que nos levantemos del asiento, aunque también podemos contar con otros apoyos, como uno de pecho, que nos ayuden a estar aún más estables. A continuación, sujeta la maneta con un agarre neutro, supino o semisupino; si quieres mayor comodidad, puedes atravesarla para mover la muñeca con mayor libertad. Con una flexión de hombro en torno a los 120º, comienza a traccionar con el codo hacia la cadera. No es necesario que tu codo pase la línea vertical de tu torso; basta con llegar hasta ella. Piensa en comprimir tu dorsal con tu tríceps mientras desciendes el brazo y, una vez ahí, aguanta ligeramente la contracción y vuelve de forma controlada a la posición inicial.$t$,
  cues=array[$t$Piensa en llevar tu codo al bolsillo trasero de tu pantalón o cadera.$t$,
    $t$Aplasta tu dorsal con tu tríceps a medida que desciendes el húmero.$t$,
    $t$Usa un agarre semisupino; puedes añadir libertad de muñeca atravesando la maneta.$t$,
    $t$Busca un movimiento puro en el plano sagital de extensión de hombro.$t$]::text[]
where id=332;

-- 333 · Pull Over Sentado en Polea
update exercises set
  description=$t$Este tipo de pull over puede ser una buena alternativa para aquellas personas que tienen dificultad para realizarlo de pie, ya sea por el torso, la estabilidad o el movimiento de los brazos. Pese a estar sentado, el torso está erguido; por tanto, podríamos decir que vamos a enfatizar ligeramente más la parte final del movimiento (dorsal en acortamiento). Muchas personas cometen el error de convertir este ejercicio en uno de tríceps al realizar una extensión de codo y no de hombro; recuerda que el movimiento debe venir del hombro.$t$,
  execution=$t$Sitúa un banco a una distancia adecuada de la polea alta y siéntate sobre él. Agarra una cuerda con un agarre neutro, situando la parte externa de tu mano contra los topes para poder aplicar mejor la fuerza. La posición de partida debe ser de flexión de hombro, es decir, tus manos no deben quedar muy arriba con respecto al nivel de tu cabeza (como en un jalón), sino al mismo nivel o ligeramente por encima de ella. Desde aquí, comienza a aplicar fuerza pensando en llevar los brazos hacia abajo a la vez que intentas comprimir tus dorsales con tus tríceps. A medida que extiendes los hombros, puedes ejercer fuerza con tu cabeza o tu frente contra el banco si así te sientes más estable.$t$,
  cues=array[$t$Céntrate en la dirección y la extensión de tus hombros.$t$,
    $t$Piensa en aplastar tus dorsales con tus tríceps.$t$,
    $t$No es necesario subir los brazos más allá de 120-130º.$t$]::text[]
where id=333;

-- 334 · Pull Over en Máquina
update exercises set
  description=$t$Esta variante es una de las más interesantes de todas las que tiene el pull over. La más popular suele ser con mancuerna y, sin embargo, es la peor, debido a que la carga gravitacional no ofrece una línea de resistencia opuesta a la fuerza de la extensión del hombro. Sin embargo, el pullover en máquina es perfecto, ya que, con los brazos apoyados sobre el acolchado con el que ejerceremos fuerza, aporta una gran estabilidad y un movimiento guiado para un mejor estímulo. Se trata de un ejercicio en el que trabajaremos prioritariamente el dorsal ancho, en el plano sagital; no obstante, otros grupos musculares, como el pectoral, debido a su disposición, también actúan como extensores del hombro; sin embargo, el limitante deberá ser el dorsal si lo realizamos correctamente.$t$,
  execution=$t$Siéntate en la máquina y ajusta la altura adecuada para tu estructura corporal; a continuación, sitúa tus tríceps sobre las almohadillas y (opcionalmente) tus manos en la barra de sujeción que tienes delante. Busca el máximo ROM activo que puedas y, desde ahí, comienza a empujar con los tríceps y la parte posterior de tu brazo (húmero) contra ellas, llevando los tríceps hacia la cadera y el dorsal, realizando una extensión de hombro máxima. Continúa hasta la máxima contracción y, una vez alcanzada, realiza una fase excéntrica controlada.$t$,
  cues=array[$t$Piensa en empujar con tus tríceps contra las almohadillas, llevándolos hacia la cadera mientras tratas de acercarlos a tus dorsales.$t$,
    $t$Evita usar fuerzas inerciales, no pegues un tirón fuerte inicial.$t$,
    $t$Busca el máximo ROM activo posible durante el ejercicio.$t$]::text[]
where id=334;

-- 335 · Seal Row con Barra
update exercises set
  description=$t$Este remo se ha hecho muy popular en los últimos años; es un remo con el objetivo de enfatizar el desarrollo del dorsal ancho. Puede realizarse con barra, de forma clásica, e incluso con mancuernas sobre este mismo banco; sin embargo, también podría realizarse con énfasis en la espalda alta. Consiste en una extensión del hombro sobre un banco lo más horizontal posible, sin que la estabilidad sea un factor limitante que nos quite rendimiento. El agarre prono de una barra convencional no es el más adecuado para trabajar en el plano sagital; por ello, utilizar una barra suiza, con la amplitud de agarre según la amplitud biacromial de cada uno, es una opción aún más interesante. En cuanto al agarre, si se convierte en un factor limitante, podemos usar straps.$t$,
  execution=$t$Túmbate sobre el banco con el pecho apoyado; a continuación, usando straps, agarra una barra recta o una swiss bar, con un agarre aproximadamente similar al ancho de tus hombros, y sácala del soporte. Extiende los codos y, desde esta posición, comienza a traccionar sin un movimiento brusco o tirón, trazando una trayectoria pendular hacia la cadera. Piensa en llevar los codos a la cadera y en apretar los tríceps contra tus costillas. Aguanta ligeramente y vuelve de forma controlada buscando un ligero estiramiento. Realiza una buena transición de la fase excéntrica a la concéntrica.$t$,
  cues=array[$t$Mantén el pecho apoyado durante cada repetición.$t$,
    $t$Piensa en llevar los codos a la cadera y apretar los tríceps contra tus costillas.$t$,
    $t$Traza una trayectoria pendular si el objetivo es el dorsal ancho.$t$]::text[]
where id=335;

-- 336 · Helms Row
update exercises set
  description=$t$Este ejercicio toma su nombre del famoso investigador y divulgador Eric Helms. Se trata de un remo con mancuernas en el que apoyamos el peso de nuestro torso sobre un banco inclinado a 45-60º, según comodidad, y en el que buscamos llevar el estímulo hacia el dorsal ancho. Tiene la ventaja de que, al estar de pie con el pecho apoyado, nos aseguramos de evitar el trampeo que puede darse en ejercicios como el Seal Row con mancuernas o el remo con mancuernas con torso inclinado, ya que no podremos despegarlo al realizarlo. Puede ser un ejercicio interesante, especialmente si no manejamos cargas muy altas, aunque para algunas personas la posición resulta algo incómoda.$t$,
  execution=$t$Sitúa un banco inclinado a unos 45-60º, según comodidad; puedes valorar incluir una toalla doblada en el apoyo si te resulta incómodo o está poco acolchado. A continuación, apoya el pecho manteniendo tu espalda recta y los pies ligeramente por detrás de la línea perpendicular que forma tu cuerpo con el suelo. Sujeta unas mancuernas con agarre neutro y con tus brazos totalmente verticales respecto al suelo, y comienza el ejercicio llevando los codos hacia tus caderas, centrándote en extender el hombro y no en doblar el codo. Piensa en pegar tus tríceps a tus costados mientras subes y, una vez arriba, comienza a descender resistiendo la fase excéntrica hasta elongar ligeramente el dorsal, pasando unos 5-10º la vertical de tu hombro; desde ahí, vuelve a traccionar evitando usar excesivas inercias.$t$
where id=336;

-- 337 · Rack Pull
update exercises set
  description=$t$El rack pull fue un ejercicio que se popularizó mucho en torno al año 2010 debido a una serie de artículos de Bret Contreras en los que analizaba la EMG de diferentes grupos musculares; concretamente, uno de ellos analizaba diferentes ejercicios de espalda y en él este arrojaba buenos resultados en cuanto a la activación del dorsal y del trapecio medio e inferior (53). Posteriormente, se publicó una serie de artículos en T-Nation sobre el ejercicio. Como ventaja, podemos destacar que podemos jugar con muchas variables, como la altura desde la que partimos o la anchura del agarre, por ejemplo, utilizando un agarre tipo snatch. Sin embargo, tanto por el tipo de movimiento como por manejar cargas relativamente altas, quizá tenga más sentido a la hora de trabajar la cadena posterior.$t$,
  execution=$t$Coloca la barra, generalmente, a la altura de las rodillas, aunque podrías colocarla más abajo para añadir trabajo a cada serie, o más arriba e ir descendiéndola con un mismo peso como forma de progresión a lo largo del tiempo. A continuación, agarra la barra de forma tradicional, con un agarre ligeramente superior a la anchura de los hombros, aunque otra forma de trabajarlo es usar un snatch grip. Después, podríamos decir que debes imitar la segunda parte de un peso muerto rumano: mantén la barra constantemente pegada a ti y comienza a subir extendiendo la cadera hasta llegar a bloquearla, situando los hombros en línea con ella. Una vez arriba, comienza a descender de forma lenta y controlada hasta la posición inicial; puedes hacer toque en los soportes o descansar la barra entre repeticiones.$t$,
  cues=array[$t$Piensa en subir manteniendo la espalda apretada y juntando fuerte ambas escápulas.$t$,
    $t$Evita realizar una hiperextensión excesiva llevando los hombros hacia atrás.$t$,
    $t$Mantén la barra constantemente pegada a ti y el dorsal apretado, cerrando las axilas.$t$]::text[]
where id=337;

-- 338 · Encogimientos con Mancuernas
update exercises set
  description=$t$Este ejercicio se ha realizado de forma clásica elevando únicamente las mancuernas en vertical o, en su defecto, realizando rotaciones con los hombros mientras se sostienen a los lados; sin embargo, esta técnica no es la correcta: para conseguir un adecuado estímulo y desarrollo de los trapecios (porciones superior y media) es necesario que apliques una rotación de las escápulas y una ligera abducción de hombro.$t$,
  execution=$t$Agarra las mancuernas, una a cada lado del cuerpo, y sepáralas de ti realizando una abducción de unos 20-35º para alinear mejor el movimiento con las fibras del trapecio; puedes flexionar ligeramente el codo. Añade una ligera inclinación del tronco, llevando la cadera hacia atrás para facilitar el movimiento, de forma similar a lo que se realiza en unas elevaciones laterales. Desde aquí, comienza a realizar el ejercicio centrándote en hacer una rotación de las escápulas hacia arriba y hacia afuera, que se verá facilitada por la abducción. De esta forma, y aunque el peso a mover sea mucho menor que en la realización clásica del ejercicio, el estímulo sobre el trapecio será superior.$t$,
  cues=array[$t$Realiza una abducción de unos 20-35º, separando las mancuernas de tu cuerpo.$t$,
    $t$Céntrate en realizar una rotación de la escápula, en lugar de únicamente elevar las mancuernas; la abducción y la rotación son claves para una buena técnica.$t$,
    $t$Piensa en acercar el hombro a la oreja, no en levantar las mancuernas.$t$]::text[]
where id=338;

-- 339 · Encogimientos con Barra
update exercises set
  description=$t$Este ejercicio se trata de una variante de los encogimientos con mancuernas anteriormente citados, en la que utilizaremos una barra. De forma clásica habrás podido verlo con un agarre estrecho; sin embargo, para dar un correcto estímulo al trapecio, el agarre a utilizar será más ancho. Existen, además, otras variantes que se realizan con barras especiales, como los encogimientos con barra hexagonal.$t$,
  execution=$t$Agarra la barra con una anchura superior al ancho de tus hombros (biacromial), alcanzando aproximadamente una abducción de unos 20-35º, de forma similar a lo que realizamos con mancuernas, para alinear mejor el movimiento con las fibras del trapecio, y flexiona ligeramente el codo. Añade una muy ligera inclinación llevando la cadera hacia atrás para facilitar el movimiento. Desde aquí, comienza a realizar el ejercicio centrándote en hacer una rotación de las escápulas hacia arriba y hacia afuera, acercando tus hombros a tus orejas: eleva y gira. Realiza una fase excéntrica controlada, evitando también impulsos y balanceos excesivos con la barra durante la fase concéntrica.$t$,
  cues=array[$t$Escoge un agarre ancho, realizando una abducción de unos 20-35º.$t$,
    $t$Céntrate en realizar una rotación de la escápula, en lugar de únicamente elevar la barra; la abducción y la rotación son claves para una buena técnica.$t$,
    $t$Piensa en acercar el hombro a la oreja, no en levantar la barra.$t$]::text[]
where id=339;

-- 340 · Encogimientos desde Polea Baja
update exercises set
  description=$t$Esta variante de los encogimientos, al ser en polea, aporta una tensión más constante respecto a otras variantes, como pueden ser los encogimientos con barra o con mancuernas. Además, puede ser una muy buena opción en el caso de poder ajustar la altura de la polea, ya que permite y facilita la abducción del hombro si elevamos la polea un par de puntos respecto a su posición más baja.$t$,
  execution=$t$Coloca la polea a una altura adecuada según tu contexto, posibilidades y comodidad, para facilitar la abducción de hombro. Desde aquí, cogiendo unos agarres de cruces, inclina ligeramente el tronco sacando la cadera hacia atrás y comienza a elevar tus hombros a la vez que realizas una rotación con ambas escápulas, intentando alinear, en la medida de lo posible, la dirección del movimiento con las fibras del trapecio. Evita impulsos innecesarios y que los cables pierdan tensión; para ello, realiza las fases concéntrica y excéntrica de forma controlada y prueba a añadir una ligera contracción isométrica arriba.$t$,
  cues=array[$t$Realiza una abducción de unos 25-45º; puedes elevar la altura de la polea para facilitar el gesto si lo ves necesario.$t$,
    $t$Céntrate en realizar una rotación de la escápula, en lugar de únicamente elevar los agarres; la abducción y la rotación son claves para una buena técnica.$t$,
    $t$Piensa en acercar el hombro a la oreja, girando tus escápulas como si fueran engranajes, a la vez que elevas los agarres.$t$]::text[]
where id=340;

-- 341 · Encogimientos en Máquina de Press
update exercises set
  description=$t$Esta variante de encogimientos puede facilitar mucho la tarea a aquellas personas que no tengan o no se sientan cómodas con alternativas similares, como los encogimientos con barra recta: a algunas personas la barra les resulta incómoda por el roce con el cuerpo durante el movimiento, por el agarre u otros motivos. En este caso, al estar colocados en medio de ambas palancas, evitamos este problema, como también ocurre con la barra hexagonal.$t$,
  execution=$t$Colócate de pie con el banco plano de press entre ambas piernas, echa la cadera ligeramente hacia atrás e inclina un poco el tronco. Desde aquí, selecciona un agarre ancho según tu comodidad, ya sea prono o incluso neutro, buscando favorecer, al igual que en el resto de los encogimientos, una abducción del hombro de unos 20-35º. Desde aquí, tracciona hacia arriba rotando y elevando tus escápulas en oposición, sin impulsos y de forma controlada.$t$,
  cues=array[$t$Realiza una abducción de unos 20-35º con un agarre ancho.$t$,
    $t$Céntrate en realizar una rotación de la escápula, en lugar de únicamente elevar los agarres; la abducción y la rotación son claves para una buena técnica.$t$,
    $t$Piensa en acercar el hombro a la oreja, girando tus escápulas como si fueran engranajes, a la vez que elevas los agarres.$t$]::text[]
where id=341;

-- 342 · Encogimientos en Banco Inclinado con Mancuernas
update exercises set
  description=$t$Este ejercicio se trata de una variante de los encogimientos popularizada por Christian Thibaudeau, en la que apoyamos el pecho en un banco inclinado para, principalmente, evitar los posibles impulsos que suelen darse durante la realización del ejercicio de pie.$t$,
  execution=$t$Escoge un banco y colócalo con una inclinación de 30-60º según comodidad, posibilidades y sensaciones. Desde aquí, coge una mancuerna con cada mano y apoya tu pecho en el banco, preferentemente en la parte superior, dejando las escápulas libres para realizar el movimiento. Con una mancuerna a cada lado, separándolas de tu cuerpo con una ligera abducción de hombro, comienza a rotar tus escápulas hacia arriba y hacia afuera a la vez que las mancuernas se elevan. Para facilitar el movimiento, imagina que tus escápulas son ruedas o engranajes y tienen que girar una en dirección opuesta a la otra.$t$,
  cues=array[$t$Realiza una abducción de unos 15-30º, separando las mancuernas de tu cuerpo.$t$,
    $t$Céntrate en realizar una rotación de la escápula, en lugar de únicamente elevar las mancuernas; la abducción y la rotación son claves para una buena técnica.$t$,
    $t$Piensa en acercar el hombro a la oreja, no en levantar las mancuernas, girando tus escápulas como si fueran engranajes, en oposición.$t$]::text[]
where id=342;

-- 343 · Pájaros con Mancuernas de Pie Apoyado en Banco
update exercises set
  description=$t$Esta variante de pájaros busca enfocar el trabajo en el deltoides posterior. De forma clásica se ha realizado de pie e inclinado; en este caso, el objetivo es generar una mayor estabilidad con un apoyo en la cabeza mientras lo realizamos. Se trata de una abducción en el plano horizontal, para la que suele ser más cómodo un agarre prono o intermedio que uno neutro.$t$,
  execution=$t$Colócate de pie, inclina el torso y apoya tu frente sobre un banco inclinado en torno a unos 60º para generar una posición lo más estable posible desde la que poder aplicar fuerza. Desciende las mancuernas y gira las muñecas para colocarlas en pronación; desde aquí, comienza la fase concéntrica buscando alejar tus codos y las mancuernas entre sí horizontalmente, alineando las mancuernas y la línea de fuerza con tu deltoides. También puede ayudarte realizar una ligera trayectoria descendente con los codos. Una vez alcanzada la línea de tu cuerpo, o ligeramente por detrás de ella, desciende de forma controlada las mancuernas hasta la posición inicial.$t$,
  cues=array[$t$Selecciona preferiblemente un agarre prono, y busca un apoyo estable.$t$,
    $t$Piensa en separar las mancuernas y tus codos entre sí a lo ancho, no en juntarlos por detrás.$t$,
    $t$Busca una trayectoria horizontal o ligeramente descendente.$t$,
    $t$Evita impulsos con tu torso y cadera.$t$]::text[]
where id=343;

-- 344 · Pájaros desde Polea Baja
update exercises set
  description=$t$Para esta variante, tanto con agarres de cruces como con muñequeras, puedes utilizar un agarre neutro, intermedio o prono. Generalmente, un agarre prono suele proporcionar mejores sensaciones, especialmente con muñequeras, ya que permite centrarse únicamente en la trayectoria de los codos. Esta variante se realiza con ambos brazos a la vez; en caso de no tener buenas sensaciones, es recomendable realizarla de forma unilateral.$t$,
  execution=$t$Coge los agarres de la forma que te permita sentir mejor el ejercicio: preferentemente, unas muñequeras con agarre prono que presionen el exterior de la mano o, en su defecto, un agarre de cruces, ya sea con agarre prono, neutro o intermedio. Tira ligeramente de los cables para generar tensión inicial sobre el deltoides y comienza la fase concéntrica buscando alejar los codos y separar tus manos entre sí en horizontal; si quieres, puedes aplicar una ligera trayectoria descendente. Evita impulsarte con tus piernas y continúa el movimiento hasta sobrepasar ligeramente la línea de tu torso; clava tus codos y desciende las manos de nuevo de forma controlada hasta alcanzar la posición inicial, evitando perder tensión en el cable.$t$,
  cues=array[$t$Piensa en separar los codos y los agarres entre sí, a lo ancho, no en tirar hacia atrás.$t$,
    $t$Busca mantener una tensión constante en el cable.$t$,
    $t$Puedes añadir una trayectoria ligeramente descendente.$t$,
    $t$Evita balanceos y ayudas con tu cuerpo y cadera.$t$]::text[]
where id=344;

-- 345 · Pájaros Tumbado en Banco Inclinado con Mancuernas
update exercises set
  description=$t$Este ejercicio es una variante de los pájaros en la que utilizamos un banco con una inclinación de 45-60º, consiguiendo mayor estabilidad. Puede ser especialmente útil para aquellas personas que utilizan impulsos con el torso o las piernas durante la realización de pie, dejando el movimiento exclusivamente al deltoides.$t$,
  execution=$t$Coloca un banco con una inclinación aproximada de 45-60º según sensaciones; puedes apoyar los pies en el suelo o doblar las rodillas y apoyarlas sobre el asiento, según encuentres mayor estabilidad y comodidad. Agarra las mancuernas con un agarre prono, neutro o intermedio y colócalas por delante de tu pecho, por fuera del banco, para situarte en la posición inicial. Desde aquí, flexiona ligeramente los codos y oriéntalos hacia afuera para generar tensión inicial sobre los hombros, y comienza a separarlos a lo ancho. Evita la intención de juntarlos por detrás: piensa en separarlos y, además, busca alinear el movimiento con el deltoides posterior. Lleva los codos hasta la línea de tu torso o ligeramente por detrás y vuelve de forma controlada hasta la posición inicial, evitando dejar caer el peso, sin perder tensión ni balancear las mancuernas.$t$,
  cues=array[$t$Selecciona preferiblemente un agarre prono, y busca un apoyo estable.$t$,
    $t$Piensa en separar las mancuernas y tus codos entre sí a lo ancho, no en juntarlos por detrás.$t$,
    $t$Busca una trayectoria horizontal o ligeramente descendente.$t$,
    $t$Evita impulsos con tu torso y cadera.$t$]::text[]
where id=345;

-- 346 · Reverse Cable Cross
update exercises set
  description=$t$Esta variante tiene el objetivo de trabajar el deltoides posterior mediante unas abducciones horizontales con ligera trayectoria descendente, añadiendo, por tanto, una ligera extensión de hombro al movimiento. Puede realizarse sin agarres, con muñequeras o con agarres de cruces, permitiendo un agarre neutro, prono o intermedio según comodidad, siendo lo más recomendable utilizar un agarre prono con muñequeras presionando el exterior de la mano.$t$,
  execution=$t$Sitúate de frente a las poleas, colocadas en una posición superior a la altura de tus hombros, y coge los agarres cruzando los cables de lado para una mejor alineación del deltoides. Sujetando los agarres, da un paso atrás para situar el deltoides en ligera tensión. Saca pecho y, con las manos por delante de él, comienza a alejar los agarres a lo ancho, intentando buscar la máxima amplitud; evita impulsarte con el tronco y recuerda mantener el ángulo del codo durante el ejercicio. Extiende a lo ancho tus codos con una ligera trayectoria descendente, buscando alinear la dirección de la fuerza con tu húmero en la medida de lo posible. Clava los codos en la línea de tu cuerpo o ligeramente por detrás y desde aquí vuelve de forma controlada hasta la posición inicial, evitando hacer movimientos bruscos e impulsos.$t$,
  cues=array[$t$Busca mantener alineados mano, codo y hombro durante el recorrido.$t$,
    $t$Piensa en alejar tus manos en horizontal respecto a la línea media de tu cuerpo durante todo el movimiento, pero no es necesario sobrepasar en exceso por detrás la línea de tu torso; evita perder tensión en cualquier parte del ROM.$t$]::text[]
where id=346;

-- 347 · Abducción Unilateral Polea
update exercises set
  description=$t$Esta variante es una de las mejores formas de trabajar el deltoides posterior. Bien realizada, suele acabar con los problemas habituales a la hora de sentir esta musculatura. Es necesario evitar en todo momento los movimientos bruscos o impulsos con el torso durante la realización del ejercicio, que generan una falsa sensación de ROM completo. Una vez dominado, sin duda será una muy buena opción para trabajar esta musculatura en forma de abducción horizontal.$t$,
  execution=$t$Coge el cable sin agarre o metiendo la mano a través de una muñequera que presione la cara exterior de la mano. Colócate de forma lateral a la polea mientras lo agarras, situando la polea a la altura de tu hombro o ligeramente por encima, y da un paso lateral para generar tensión inicial en el cable y en tu hombro. A continuación, con la mano situada frente a tu pecho, comienza a alejarla todo lo que puedas en horizontal, pensando en alejar tu codo respecto a la línea media de tu cuerpo. Evita impulsarte con el cuerpo durante todo el movimiento. Lleva el codo hacia el lado y atrás hasta clavarlo a la altura de tu torso o ligeramente por detrás, y vuelve de forma controlada hasta la posición inicial sin perder tensión en el cable.$t$,
  cues=array[$t$Busca mantener alineados mano, codo y hombro durante el recorrido.$t$,
    $t$Piensa en alejar tu mano en horizontal respecto a la línea media de tu cuerpo durante todo el movimiento, pero no es necesario sobrepasar en exceso por detrás la línea de tu torso.$t$,
    $t$Puedes realizarlo de forma horizontal o ligeramente descendente.$t$]::text[]
where id=347;

-- 348 · Contractora Invertida – Máquina Delt. Posterior
update exercises set
  description=$t$Esta máquina es una de las más utilizadas para el trabajo del deltoides posterior; sin embargo, es muy común ver errores en la técnica. Se trata de uno de los mejores ejercicios para el deltoides posterior, al tratarse de una abducción horizontal en la que, además, estamos muy estables y el movimiento es guiado.$t$,
  execution=$t$Coloca el asiento en una posición en la que, al sentarte, tus manos se sitúen a la altura de tus hombros o ligeramente por encima. Apoya el pecho en el respaldo y saca la cadera hacia atrás para situarte en una posición buena para ejercer fuerza y estable, pudiendo además ejercer fuerza con los pies contra el suelo, que podrán ir hacia delante o con uno de ellos hacia atrás. Coloca tus manos en la máquina usando un agarre prono y comienza la fase concéntrica con tus codos apuntando hacia afuera, tratando de separarlos lo máximo posible; piensa en alejar tus manos a lo ancho en el plano transversal: no pienses en tirar hacia atrás, sino hacia fuera, dirigiendo el movimiento con tus codos. No es necesario llevar los codos hacia atrás todo lo que puedas ni realizar retracción escapular: puedes llevarlos hasta la línea de tu cuerpo o un poco más, según comodidad. Desde aquí, vuelve a la posición inicial de forma controlada, evitando movimientos bruscos y perder tensión al principio del movimiento.$t$,
  cues=array[$t$Saca la cadera hacia atrás al sentarte y busca clavarte con los pies en el suelo.$t$,
    $t$Piensa en separar tus manos a lo ancho, no en llevarlas hacia atrás.$t$,
    $t$Tus manos deben estar a la misma altura o ligeramente por encima de tus hombros.$t$,
    $t$Evita que los codos apunten al suelo; intenta que apunten hacia afuera.$t$]::text[]
where id=348;

-- 349 · Hang & Swing con Mancuernas
update exercises set
  description=$t$Este ejercicio fue popularizado por John Meadows y puede realizarse con mancuernas de pie, en un banco inclinado e incluso desde polea baja, cruzando los cables entre ambos lados. Se trata de un ejercicio a medio camino entre unos pájaros y unas elevaciones laterales en banco inclinado, realizado con rango parcial y tensión constante. Pese a no ser, posiblemente, la opción principal para trabajar ninguna de estas 2 cabezas del deltoides, puede ser interesante añadirlo cuando nuestro objetivo sea trabajar esa parte del rango de movimiento, generando un gran estrés metabólico.$t$,
  execution=$t$Coloca un banco inclinado según comodidad y posibilidades, coge unas mancuernas, túmbate y busca una posición estable y cómoda, para lo que puedes apoyar las piernas en el suelo o doblar las rodillas y apoyarlas sobre el asiento. Saca las mancuernas por delante de tu pecho y colócalas en agarre neutro, aunque puede realizarse añadiendo una ligera rotación interna o externa según comodidad. Desde aquí, manteniendo los codos en el ángulo más cómodo, comienza a elevar las mancuernas ejerciendo la fuerza desde el codo y el hombro, buscando eliminar cualquier tipo de impulso o balanceo que te ayude en la subida. Eleva las mancuernas hasta ligeramente por debajo de la línea de tu hombro y comienza a descender controlando la fase excéntrica. Evita dejar las mancuernas totalmente perpendiculares al suelo para mantener una tensión constante.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados; no los dobles.$t$,
    $t$Evita encoger los trapecios a medida que elevas las mancuernas.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$]::text[]
where id=349;

-- 350 · Hang & Swing en Polea con Banco Inclinado
update exercises set
  description=$t$Este ejercicio es una variante en polea del clásico Hang & Swing popularizado por John Meadows. Se trata de un ejercicio a medio camino entre unos pájaros y unas elevaciones laterales en banco inclinado, realizado con rango parcial y tensión constante. Pese a no ser, posiblemente, la opción principal para trabajar ninguna de estas 2 cabezas del deltoides, puede ser interesante añadirlo cuando nuestro objetivo sea trabajar esa parte del rango de movimiento, generando un gran estrés metabólico. A la hora de realizarlo en polea, hay que prestar atención a que las placas no se toquen, ya que restarían tensión al movimiento. Por otro lado, para el aprendizaje del ejercicio puede ser más sencilla la variante con mancuernas.$t$,
  execution=$t$Coloca un banco inclinado según comodidad y posibilidades y túmbate apoyando todo tu peso, colocando la cabeza en la parte más alta del banco y buscando estabilidad; puedes colocar las piernas dobladas sobre el asiento. Coge unas muñequeras o agarres de cruces, según preferencia, con un agarre neutro o prono, aunque puede realizarse añadiendo una ligera rotación interna o externa según necesidad. Desde aquí, manteniendo el codo en la posición más cómoda, comienza a separar las manos de ti lateralmente, ejerciendo la fuerza desde el codo y el deltoides, buscando eliminar cualquier impulso o balanceo que te ayude en la subida. Haz que los codos se dirijan hacia atrás y eleva hasta alcanzar una altura ligeramente por debajo de la línea de tu hombro, y comienza a descender controlando la fase excéntrica y manteniendo la tensión.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados; no los dobles.$t$,
    $t$Evita encoger los trapecios o pegar tirones.$t$,
    $t$Piensa en separar lateralmente las manos del centro de tu cuerpo.$t$,
    $t$Busca mantener tensión constante, sin chocar las placas.$t$]::text[]
where id=350;

-- 351 · Reverse Cable Cross en Banco Inclinado desde Polea Baja
update exercises set
  description=$t$Esta variante tiene el objetivo de trabajar el deltoides posterior mediante unas abducciones horizontales con ligera trayectoria descendente, añadiendo, por tanto, una ligera extensión de hombro al movimiento, desde un banco con una inclinación en torno a 45º y desde polea baja. Puede realizarse con muñequeras o con agarres de cruces, permitiendo un agarre neutro, prono o intermedio según comodidad, siendo lo más recomendable realizar un agarre prono con muñequeras presionando el exterior de la mano para sentir mejor el ejercicio. De cara al aprendizaje, puede ser más sencillo comenzar por un reverse cable cross de pie, pero este ejercicio es una buena alternativa para aquellas personas que utilizan excesivamente impulsos con el cuerpo o están inestables.$t$,
  execution=$t$Coloca un banco a una inclinación de 45º, o según comodidad, y las poleas en su punto más bajo. Siéntate con los pies apoyados en el suelo mientras apoyas todo tu peso sobre el respaldo para situarte en una posición estable. A continuación, coge los agarres con un agarre prono, neutro o intermedio según comodidad, pero cruzando los cables de lado a lado para alinearlos con el deltoides. Separa ligeramente las manos para generar tensión inicial y comienza a extender a lo ancho tus manos, con una ligera trayectoria descendente y llevando los codos hacia atrás, buscando alinear la dirección de la fuerza con tu húmero en la medida de lo posible. Recuerda mantener el codo estable; lleva los codos a la línea de tu cuerpo o ligeramente por detrás y desde aquí vuelve de forma controlada hasta la posición inicial, evitando movimientos bruscos e impulsos o que las placas choquen en el punto más bajo, restando tensión al movimiento.$t$
where id=351;

-- 352 · Pájaros Unilaterales Polea Baja
update exercises set
  description=$t$Este ejercicio se trata de una abducción horizontal desde polea baja con el objetivo de llevar el movimiento hacia el deltoides posterior. Para esta variante resulta útil tanto un agarre de cruces como unas muñequeras, con las que poder utilizar un agarre neutro, intermedio o prono. Generalmente, un agarre prono con muñequeras suele proporcionar mejores sensaciones, al permitir centrarnos únicamente en la trayectoria de los codos; el agarre de cruces suele colocarse en posición neutra. En algunos casos puede ser interesante, además, añadir un apoyo con la mano libre en caso de inestabilidad. Podría decirse que es preferible a una abducción desde polea alta, en la que es más fácil convertirlo en un ejercicio de tríceps extendiendo el codo.$t$,
  execution=$t$De pie, sitúate al lado de una polea baja e inclina el torso hasta dejarlo casi paralelo al suelo; desde esa posición, coge el cable, preferentemente usando una muñequera con agarre prono que presione el exterior de la mano o, en su defecto, un agarre de cruces, ya sea con agarre prono, neutro o intermedio. A continuación, separa ligeramente el cable generando tensión inicial en el deltoides y comienza la fase concéntrica separando la mano de la línea media de tu cuerpo en horizontal, con una trayectoria ligeramente descendente. Evita impulsarte con el torso o las piernas y continúa el movimiento hasta sobrepasar ligeramente la línea de tu torso; después, vuelve de forma controlada hasta alcanzar la posición inicial, evitando perder tensión en el cable.$t$
where id=352;

-- 353 · Extensiones de Hombro con Mancuerna en Banco Inclinado
update exercises set
  description=$t$Este ejercicio puede considerarse una gran opción para el trabajo del deltoides posterior. Según cómo se ejecute, el movimiento puede orientarse hacia esta musculatura (centrándonos en el gesto de extensión de hombro) o hacia los trapecios (centrándonos en la retracción escapular, sacando los codos hacia afuera y las mancuernas lateralmente). Para realizar este ejercicio necesitamos un banco inclinado a unos 45-60º y unas mancuernas, con las que realizaremos una extensión de hombro ligeramente diagonal.$t$,
  execution=$t$Apoya tu pecho sobre el banco y las piernas en el suelo según comodidad y anatomía; si el banco es muy alto, estarás más cómodo con las piernas en perpendicular respecto al suelo o con las rodillas en el asiento. En esta posición, sujeta unas mancuernas y deja los brazos en perpendicular respecto al suelo. Para comenzar el movimiento, adelanta ambas ligeramente, como si quisieras juntarlas, pero sin llegar a hacerlo, y, una vez ahí, comienza a extender el hombro (llevar el brazo hacia atrás). Evita doblar el codo y extenderlo, convirtiéndolo en un ejercicio de tríceps. Continúa llevando los brazos atrás, en dirección diagonal respecto a tu cuerpo, hasta pasar la línea paralela de tu torso. Evita convertir tus brazos en un péndulo durante la fase excéntrica y evita usar inercias o impulsos para subir los brazos durante la concéntrica.$t$,
  cues=array[$t$Mantén los codos extendidos y evita que se muevan: debe ser un movimiento puramente de extensión de hombro.$t$,
    $t$Saca pecho y lleva atrás los brazos rompiendo la paralela de tu cuerpo.$t$]::text[]
where id=353;

-- 354 · Elevaciones Laterales con Mancuernas de Pie
update exercises set
  description=$t$Este ejercicio se trata de una abducción en el plano frontal, aunque a nivel práctico la sacaremos ligeramente por delante, hacia unos 10-30º según comodidad, en el plano escapular. Imagina que tus codos son unos limpiaparabrisas: esto puede ayudarte a darle cierta trayectoria angular al movimiento y evitar así el error común de alejar las manos del cuerpo en diagonal. Añadir una ligera rotación interna y mantener el movimiento en el plano frontal (lo más lateral posible) maximiza la activación de la porción lateral (16).$t$,
  execution=$t$Con las mancuernas colocadas a cada lado de la cadera o ligeramente por delante, elige un agarre cómodo (puedes hacerlas sin rodear con el pulgar) y mantén los codos semiflexionados o prácticamente estirados. La fuerza no debe partir de la mano, sino de los codos, y elevar las mancuernas lo máximo posible no debe ser el objetivo: busca llevarlas a unos 85-110º de abducción según tus posibilidades de movilidad y tus sensaciones, pero estandarizando el ROM de las repeticiones independientemente de la intensidad relativa de la serie. Controla la bajada de las mancuernas y continúa realizando repeticiones sin impulsarte con la cadera.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados o semiflexionados; no los dobles.$t$,
    $t$Evita dirigir los codos hacia atrás a medida que subes, en todo caso hacia delante.$t$,
    $t$A medida que elevas las mancuernas, apunta hacia abajo con el pulgar.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$]::text[]
where id=354;

-- 355 · Elevaciones Laterales con Mancuernas Sentado
update exercises set
  description=$t$Este ejercicio se trata de una abducción en el plano frontal, aunque a nivel práctico la sacaremos ligeramente por delante, hacia unos 10-30º según comodidad, en el plano escapular. Imaginar que tus codos son unos limpiaparabrisas puede ayudarte a darle cierta trayectoria angular al movimiento y evitar así el error común de alejar las manos del cuerpo en diagonal. La técnica es la misma que cuando se realiza de pie, con la salvedad de que realizarlo sentado nos puede ayudar a evitar impulsarnos con el torso, dejando el empuje puramente a los hombros. Puede ser útil en muchos casos.$t$,
  execution=$t$Con las mancuernas colocadas a cada lado de la cadera o ligeramente por delante, elige un agarre cómodo (puedes hacerlas sin rodear con el pulgar) y mantén los codos semiflexionados o prácticamente estirados. La fuerza no debe partir de la mano, sino de los codos, y elevar las mancuernas lo máximo posible no debe ser el objetivo: busca llevarlas a unos 85-110º de abducción según tus posibilidades de movilidad y tus sensaciones, pero estandarizando el ROM de las repeticiones independientemente de la intensidad relativa de la serie. Controla la bajada de las mancuernas y continúa realizando repeticiones sin impulsarte con la cadera.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados o semiflexionados; no los dobles.$t$,
    $t$Evita dirigir los codos hacia atrás a medida que subes, en todo caso hacia delante.$t$,
    $t$A medida que elevas las mancuernas, apunta hacia abajo con el pulgar.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$]::text[]
where id=355;

-- 356 · Elev. Laterales en Banco Inclinado con Mancuernas
update exercises set
  description=$t$En esta variante de elevaciones laterales, la inclinación del banco nos ayudará a favorecer que el estímulo se focalice en el deltoides lateral. Para realizarlo, coloca un banco a una inclinación de entre 45º y 70º, según comodidad y lo que te permita tu banco. Desde aquí, realizaremos el movimiento con unas mancuernas evitando balanceos e inercias, manteniendo un orden hombro-codo-muñeca para asegurar el plano escapular.$t$,
  execution=$t$Tumbado en el banco, saca pecho ligeramente mientras lo apoyas para evitar que haya redondeo de la zona alta de la espalda. Puedes apoyar los pies en el suelo si estás más cómodo, pero, para evitar impulsarte con ellos generando inercias innecesarias, puedes dejarlos apoyados también en el banco. Sujetando las mancuernas, comienza el movimiento desde la posición más baja con el brazo semiflexionado, haciendo que la fuerza parta desde el codo. A medida que subes, puede ayudarte añadir una ligera rotación interna, inclinando el pulgar ligeramente hacia abajo. No es necesario que subas muy alto: basta con llegar aproximadamente a la línea del hombro. El movimiento debe realizarse en el plano escapular, para lo que puedes pensar en que el hombro esté ligeramente más atrás que el codo, y este, a su vez, más atrás que la muñeca.$t$,
  cues=array[$t$Mantén los codos semiflexionados y realiza el movimiento en el plano escapular.$t$,
    $t$Evita dirigir los codos hacia atrás a medida que subes.$t$,
    $t$A medida que elevas las mancuernas, apunta hacia abajo con el pulgar.$t$,
    $t$No te balancees ni redondees la espalda; saca pecho.$t$]::text[]
where id=356;

-- 357 · Elevaciones Laterales en Polea Baja Unilateral
update exercises set
  description=$t$Esta variante de las elevaciones laterales se realiza desde una polea de placas. Para realizarla es recomendable utilizar una muñequera en lugar del propio agarre de la polea, para evitar prestar excesiva atención a la mano y poder dirigir el movimiento y la fuerza desde el codo, asegurando un mayor trabajo del deltoides lateral. Puedes variar la altura a la que colocas la polea (situándola ligeramente más arriba) o alejar tu posición respecto a ella para enfatizar una u otra parte del ROM del ejercicio.$t$,
  execution=$t$Colócate junto a la polea, situada en un punto bajo según la parte del ROM que quieras enfatizar. Coge el agarre o la muñequera y, desde aquí, saca ligeramente pecho y lleva la cadera un poco hacia atrás para favorecer la activación y el desarrollo del ejercicio en el plano escapular. Iniciando el movimiento desde el codo, lánzalo lateralmente con el pulgar apuntando ligeramente hacia abajo, o rotándolo a medida que subes; continúa subiendo dentro del plano escapular hasta unos 80-110º y desde ahí realiza una bajada controlada, sin perder la tensión durante todo el recorrido ni aplicar excesivos balanceos, impulsos o inercias.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados; no los dobles.$t$,
    $t$Realiza el movimiento en el plano escapular. No lleves el codo hacia atrás.$t$,
    $t$No tires del cable con la mano en diagonal, el codo debe conducir el movimiento.$t$,
    $t$A medida que elevas el codo, apunta hacia abajo con el pulgar.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$]::text[]
where id=357;

-- 358 · Elevaciones Laterales en Polea Baja a 2 Manos
update exercises set
  description=$t$Esta variante de elevaciones laterales también es recomendable realizarla con muñequeras en lugar de agarres tradicionales. En ella partiremos desde 2 poleas situadas en una posición baja, cruzando la línea de fuerza entre lados opuestos; es decir, la polea izquierda cruza a la mano derecha y viceversa. Se trata de una buena variante, especialmente en aquellos casos en los que no dispongamos de tiempo para realizarlas de forma unilateral.$t$,
  execution=$t$Partimos de pie delante de las poleas, situándolas en un punto bajo y con las manos cruzadas por delante del cuerpo, generando una ligera tensión en el cable. Desde aquí, iniciaremos la aplicación de fuerza conduciendo siempre el movimiento desde los codos y no simplemente tirando del cable en diagonal con las manos; evita impulsarte con el cuerpo o realizar balanceos, y trata de apuntar con el pulgar ligeramente hacia abajo a medida que subes. Lo ideal, al igual que en casi cualquier otra elevación lateral, es que saques pecho y cadera, para que el movimiento vaya ordenado en hombro-codo-muñeca, favoreciendo su desarrollo dentro del plano escapular. Realizamos la elevación lateral hasta unos 80-110º de abducción según comodidad y realizamos un descenso controlado, sin perder tensión en ningún momento del cable ni realizar gestos bruscos.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados o semiflexionados.$t$,
    $t$A medida que elevas el codo, apunta hacia abajo con el pulgar.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$]::text[]
where id=358;

-- 359 · Elevaciones Laterales en Máquina
update exercises set
  description=$t$Esta variante de elevaciones laterales se realiza en una máquina específica para este movimiento, ya sea de pie o sentado. El ejercicio podrá variar ligeramente en función de la máquina utilizada (discos o placas), pero el movimiento y su realización serán similares. En caso de que sea sentado, recomiendo apoyar el pecho en lugar de la espalda en el respaldo, para dejar las escápulas libres e inclinar ligeramente el tronco.$t$,
  execution=$t$Colocado en la máquina, sentado o de pie en función de la posibilidad, sacaremos la cadera hacia atrás para colocar el movimiento principalmente en el plano escapular y dejaremos las escápulas libres. En caso de que tenga manetas o agarraderas, puedes sujetarlas, pero la fuerza deberá partir siempre del codo, por lo que, si la máquina tiene apoyo para el codo, puedes incluso no agarrar las manetas. Desde la posición más baja, separa ligeramente los codos de tu cuerpo para generar una ligera tensión: será el punto más bajo en el que trabajemos dentro del ROM. Desde aquí, haciendo la fuerza con los codos, realiza una abducción hasta los 90-110º, pudiendo aguantar brevemente arriba antes de descender de forma controlada. Evita realizar impulsos e inercias y haz que el movimiento parta lo más puramente posible del codo, pudiendo apuntar ligeramente el pulgar hacia abajo también en este ejercicio.$t$,
  cues=array[$t$La fuerza y dirección del movimiento debe partir desde los codos.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$,
    $t$No dobles el codo en exceso; es mejor si únicamente está semiflexionado.$t$]::text[]
where id=359;

-- 360 · Elevaciones Laterales en Polea Tumbado
update exercises set
  description=$t$El objetivo de este ejercicio es el mismo que el de una elevación lateral en polea tradicional. Para ello, podemos tumbarnos en un banco o directamente en el suelo. Además, puede resultar una variante especialmente buena para aquellas personas que cometen el error de llevar el movimiento al plano sagital, conduciendo los codos hacia atrás en las elevaciones laterales, ya que con el apoyo en el banco o el suelo no será posible, y esto puede facilitar el aprendizaje en otras variantes, además de exprimir esta. En esta variante también es recomendable utilizar muñequeras.$t$,
  execution=$t$Túmbate en un banco ligeramente inclinado (10-20º); en caso de no ser posible, puedes hacerlo directamente en uno plano o en el suelo, despegando la parte alta de la espalda. Sitúa las manos por delante de tu cadera con las poleas cruzadas: la del lado izquierdo, en la mano derecha, y viceversa. Desde esta posición de partida, genera una mínima tensión separando lateralmente los brazos del cuerpo y comienza a realizar el gesto de abducción, haciendo la fuerza y conduciendo el movimiento siempre con los codos hasta alcanzar los 80-110º; una vez alcanzada la máxima abducción, puedes aguantar brevemente y comenzar un descenso controlado, tratando de que nunca se pierda tensión en los cables.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados; no los dobles.$t$,
    $t$A medida que elevas el codo, apunta hacia abajo con el pulgar.$t$,
    $t$La fuerza y dirección del movimiento debe partir desde los codos.$t$]::text[]
where id=360;

-- 361 · Elevaciones Laterales en Y en Polea (antes «Elevaciones Laterales y en Polea»)
update exercises set
  name=$t$Elevaciones Laterales en Y en Polea$t$,
  description=$t$En este ejercicio colocaremos un banco a modo de asiento, en el que además podemos utilizar, o no, un respaldo. En caso de preferir el movimiento con respaldo, la inclinación del banco debe rondar aproximadamente los 80-85º. Es recomendable realizar el ejercicio con muñequeras para favorecer un trabajo más centrado en el hombro que en el gesto de la mano y la muñeca.$t$,
  execution=$t$Con las poleas situadas en una posición baja, realizaremos el movimiento de forma cruzada: el cable del lado izquierdo hacia la mano derecha y viceversa. Desde esta posición, generaremos una ligera tensión antes de comenzar el movimiento, para después empujar con el hombro, el húmero y el codo hacia atrás. Trataremos de formar un tridente o una Y con nuestras manos, manteniendo los codos prácticamente estirados. Para terminar el movimiento no es necesario que los codos o las manos sobrepasen la línea de tus hombros: llega aproximadamente hasta una posición paralela. Una vez alcanzado este punto, puedes sostener brevemente los codos de forma isométrica antes de comenzar con una fase excéntrica controlada hasta la posición de partida.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados.$t$,
    $t$Empuja con los pies contra el suelo y tu espalda contra el respaldo si lo utilizas.$t$,
    $t$Controla el movimiento, no pegues tirones bruscos.$t$,
    $t$Empuja con los codos y los hombros hacia atrás; no tires con las manos.$t$]::text[]
where id=361;

-- 362 · Remo al Mentón en Multipower
update exercises set
  description=$t$El remo al mentón es, junto a las elevaciones laterales, uno de los ejercicios que más activación producen en la cabeza lateral del deltoides, debido a que realizamos una abducción de hombro. Al contrario de lo que se cree, no se trata de un ejercicio lesivo, al igual que cualquier otro que se realice con una técnica correcta (17).$t$,
  execution=$t$Colócate de frente sujetando la barra de la multipower con los codos prácticamente estirados. Escoge un agarre ancho, ligeramente superior a la anchura de los hombros, ya que nos permitirá realizar el gesto de abducción con mayor facilidad, y agarra la barra. Desde aquí, realiza un empuje lateral con los codos; es posible que no rodear la barra con el pulgar y sujetarla simplemente con 4 dedos te ayude a focalizar más. Durante el movimiento, evita llevar la barra pegada a tu cuerpo; sepárala ligeramente para favorecer que los codos puedan ir ligeramente por delante del cuerpo. No es necesario que elevemos la barra hasta la barbilla: basta con elevarla aproximadamente hasta la altura del pectoral. Al final del movimiento, evita contraer trapecios y cuello; realiza una contracción suave de los hombros y desciende de forma controlada hasta la posición inicial.$t$,
  cues=array[$t$No es necesario que subas al máximo la barra, busca una altura cómoda.$t$,
    $t$Separa la barra ligeramente de ti y prueba a no rodearla con el pulgar.$t$,
    $t$Evita impulsarte con el cuerpo o aprovechar balanceos: movimiento limpio.$t$]::text[]
where id=362;

-- 363 · Remo al Mentón con Barra
update exercises set
  description=$t$El remo al mentón es, junto a las elevaciones laterales, uno de los ejercicios que más activación producen en la cabeza lateral del deltoides, debido a que realizamos una abducción de hombro. Al contrario de lo que se cree, no se trata de un ejercicio lesivo, al igual que cualquier otro que se realice con una técnica correcta (11).$t$,
  execution=$t$Colócate de pie sujetando la barra con los codos prácticamente estirados. Escoge un agarre ancho, ligeramente superior a la anchura de los hombros, ya que nos permitirá realizar el gesto de abducción con mayor facilidad, y agarra la barra. Desde aquí, realiza un empuje lateral con los codos; es posible que no rodear la barra con el pulgar y sujetarla simplemente con 4 dedos te ayude a focalizar más. Durante el movimiento, evita llevar la barra pegada a tu cuerpo; sepárala ligeramente para favorecer que los codos puedan ir ligeramente por delante del cuerpo. No es necesario que elevemos la barra hasta la barbilla: basta con elevarla aproximadamente hasta la altura del pectoral. Al final del movimiento, evita contraer trapecios y cuello; realiza una contracción suave de los hombros y desciende de forma controlada hasta la posición inicial.$t$,
  cues=array[$t$No es necesario que subas al máximo la barra, busca una altura cómoda.$t$,
    $t$Separa la barra ligeramente de ti y prueba a no rodearla con el pulgar.$t$,
    $t$Evita impulsarte con el cuerpo o aprovechar balanceos: movimiento limpio.$t$]::text[]
where id=363;

-- 364 · Remo al Mentón desde Polea Baja
update exercises set
  description=$t$Esta variante de remo al mentón es bastante interesante para aumentar ligeramente el rango de repeticiones; sin embargo, es algo más compleja de realizar técnicamente que con peso libre o en multipower, por la dirección del movimiento. Para realizar este ejercicio podemos utilizar diferentes agarres; personalmente, optaría por una barra larga o un agarre de cuerda.$t$,
  execution=$t$Nos colocamos con la polea frente a nosotros y escogemos el agarre que más nos convenga, teniendo en cuenta que, si escogemos un agarre de cuerda, la anchura será algo más estrecha, pero nos permitirá una libertad de movimiento ligeramente mayor, y si ponemos la barra larga favoreceremos la abducción, por lo que puedes probar ambos y escoger el que más te guste. Desde la posición más baja, sin pegar el cable a nosotros, empujamos con los codos evitando tirones mientras sujetamos el agarre de forma suave. Evita subir excesivamente y los impulsos con el cuerpo. Una vez alcanzada la posición más alta, desciende controlando la fase excéntrica sin llegar a perder la tensión en todo el movimiento, pues es una ventaja que aporta la polea.$t$,
  cues=array[$t$Dirige el movimiento con los codos: en la polea tenderás más a tirar de ella. Sujeta el agarre sin rodearlo con el pulgar y empuja con los codos.$t$,
    $t$Evita impulsarte, tirar con el cuello y encoger trapecios.$t$,
    $t$Controla el movimiento, tanto en la fase excéntrica como en la concéntrica.$t$]::text[]
where id=364;

-- 365 · Remo al Mentón con Mancuernas
update exercises set
  description=$t$Esta variante de remo al mentón es algo más compleja que con barra, ya que hay que prestar atención a que ambos hombros realicen el mismo gesto a la vez, pero puede ayudar a meter variedad y a aquellas personas que no se sientan del todo cómodas con una barra o una multipower por ser un gesto más guiado.$t$,
  execution=$t$Nos colocamos con las mancuernas sujetas por delante de la cadera, separadas a la anchura de los hombros o ligeramente más; también puedes no rodear el agarre con el pulgar. Desde aquí, inclinamos ligeramente el torso y comenzamos a realizar el gesto de empuje lateral con los codos, evitando traccionar con las mancuernas hacia el cuello y evitando encoger los trapecios. Lleva las mancuernas, ligeramente separadas de tu cuerpo, hasta una altura cómoda según tu anatomía; puedes tomar como punto orientativo llevarlas aproximadamente hasta la altura del pectoral o ligeramente por encima. Desde este punto, realiza una bajada controlada hasta la posición inicial, evitando dejar caer de golpe los hombros.$t$,
  cues=array[$t$No es necesario que subas al máximo las mancuernas, busca una altura cómoda.$t$,
    $t$Evita que el movimiento vaya hacia atrás, mancuernas por delante de ti.$t$,
    $t$Lleva los codos ligeramente por delante del cuerpo.$t$]::text[]
where id=365;

-- 366 · Elevaciones Laterales en Polea Baja Estilo Egipcio (antes «Evaciones Laterales en Polea Baja Estilo Egipcio»)
update exercises set
  name=$t$Elevaciones Laterales en Polea Baja Estilo Egipcio$t$,
  description=$t$Esta variante de las elevaciones laterales busca enfatizar los primeros rangos de movimiento en lugar de los últimos, como ocurriría con peso libre. Además, se adelanta un pie respecto al otro, de ahí su nombre, y se pasa el cable entre ambas piernas, buscando alinear al máximo la dirección del movimiento con el deltoides. Se realiza desde una polea baja y es recomendable utilizar una muñequera en lugar del propio agarre de la polea para evitar prestar excesiva atención a la mano, centrando la dirección del movimiento y la fuerza en el codo y asegurando así un mejor estímulo.$t$,
  execution=$t$Colócate junto a la polea e inclina tu torso lateralmente, agarrándote a un poste o apoyo. Adelanta un pie respecto al otro, coge el agarre o la muñequera pasando el cable entre ambas piernas y deja el codo ligeramente flexionado. Saca ligeramente pecho y lleva la cadera un poco hacia atrás para favorecer la activación y el desarrollo del ejercicio en el plano escapular. A continuación, inicia el movimiento desde el codo: lánzalo lateralmente con el pulgar apuntando ligeramente hacia abajo, o rotándolo a medida que subes, y continúa subiendo buscando la alineación del deltoides hasta alcanzar unos 80-110º de abducción. Desde ahí, realiza una bajada controlada hasta la posición inicial, evitando perder la tensión. Evita también aplicar excesivos balanceos, impulsos o inercias durante la fase concéntrica.$t$,
  cues=array[$t$Mantén los codos prácticamente estirados; no los dobles.$t$,
    $t$No lleves el codo hacia atrás. Busca mantenerte en el plano escapular.$t$,
    $t$No tires del cable con la mano en diagonal. Piensa en hacer la fuerza con el codo; imagina que es un limpiaparabrisas.$t$,
    $t$A medida que elevas el codo, apunta hacia abajo con el pulgar.$t$,
    $t$No balancees tu cuerpo ni te impulses excesivamente.$t$]::text[]
where id=366;

-- 367 · Butterfly Lateral Raises
update exercises set
  description=$t$Este ejercicio es una variante popularizada por Menno Henselmans y Mike Israetel; se trata de unas elevaciones laterales en las que realizamos un mayor recorrido (ROM), subiendo la carga por encima de la línea de los hombros hasta sobrepasar la altura de la cabeza. Una crítica habitual a este ejercicio es que no todo su ROM trabaja la porción lateral del deltoides, que deja de hacerlo cuando ampliamos tanto el recorrido. Suele realizarse usando discos en lugar de mancuernas, ya que permiten una ligera inercia e impulso al inicio de la fase concéntrica, que posteriormente podría ayudar a generar una mayor sobrecarga excéntrica si se hace bien y no se deja caer la carga de golpe, sino que se ejerce una resistencia activa durante esta fase.$t$,
  execution=$t$Lo primero que cabe destacar es que se trata de una variante que puede realizarse con rotación interna o en posición neutra; Henselmans recomienda tender hacia la rotación externa de hombro una vez se pasa la línea de los hombros durante la subida. Colocado de pie, con una mancuerna o un disco en cada mano, inclina el torso sacando ligeramente la cadera hacia atrás. Desde aquí, inicia la elevación lateral partiendo desde los codos y añadiendo un impulso, extendiendo la cadera a medida que buscas llevar tus manos lo más lejos posible de ti. Continúa elevando las manos hasta una posición cómoda por encima de tus hombros y, una vez alcanzada esta posición, sin perder tensión en ningún momento, comienza un descenso controlado, aguantando la bajada lo máximo posible y ejerciendo resistencia en la fase excéntrica hasta llegar de nuevo a la posición inicial.$t$,
  cues=array[$t$Comienza con las manos en posición neutra o rotación interna, pero acaba con ellas en posición neutra o rotación externa.$t$,
    $t$Evita dirigir los codos hacia atrás a medida que subes y mantenlos semiflexionados.$t$,
    $t$Controla y aguanta la bajada ejerciendo resistencia en la fase excéntrica.$t$,
    $t$Realiza un ligero impulso con la cadera al inicio del movimiento.$t$]::text[]
where id=367;

-- 368 · Elevaciones Laterales con Torso Inclinado + Rotación Interna
update exercises set
  description=$t$Este ejercicio se trata de una variante de las elevaciones laterales con torso inclinado popularizada por el exculturista Charles Glass. Aunque de forma típica se realiza con mancuerna, también puede realizarse en polea, elevando la posición inicial a la altura de la rodilla o de la cadera. A diferencia de unas elevaciones laterales convencionales, partimos ya de una posición de rotación interna forzada en la muñeca, por lo que, aunque la mancuerna ascenderá relativamente menos a nivel visual, tenemos que prestar atención al movimiento del codo, el húmero y el hombro. La mancuerna se saca desde detrás del cuerpo con una trayectoria ligeramente adelantada, buscando alinear el deltoides al máximo.$t$,
  execution=$t$Colócate de pie, sacando la cadera hacia atrás e inclinando el torso lateralmente, mientras te agarras con la mano libre a un poste para generar estabilidad. Sujeta una mancuerna con la otra mano, levemente por detrás de tu cadera, y rota internamente muñeca y hombro. Desde esta posición, realiza una abducción a medio camino entre el plano frontal y el escapular, al igual que en unas elevaciones laterales convencionales. No pienses en la elevación de la mancuerna, sino en el codo, el húmero y el hombro; continúa la elevación hasta alinear casi por completo hombro y codo en paralelo al suelo y, desde ese punto, vuelve a la posición inicial de forma controlada, evitando balanceos e impulsos con la mancuerna.$t$
where id=368;

-- 369 · Press Militar Sentado en Multipower
update exercises set
  description=$t$Esta variante de press militar se realiza sentado con el objetivo de eliminar prácticamente cualquier impulso e inercia del tren inferior que pudiera restar trabajo al deltoides anterior; puede ayudar especialmente a aquellas personas que convierten un press militar en un push press. Aunque algunas personas piensan que la porción lateral puede contribuir también a este tipo de empujes verticales, lo hace de forma mínima; por tanto, no debe ser la opción principal si lo que buscamos es enfatizar la cabeza lateral o el aspecto redondeado de nuestros hombros.$t$,
  execution=$t$Sentado en un banco, colócate con la barra a la altura de tu pecho para poder desencajarla fácilmente. Desde aquí, selecciona una anchura de agarre que te permita mantener verticales tu antebrazo y tus muñecas, es decir, en perpendicular al suelo: ni muy ancho ni muy estrecho, para evitar implicar otra musculatura, como el pectoral o el tríceps, por encima del deltoides anterior. Desde aquí, desencaja la barra, apóyala sobre tu pecho y empuja hacia arriba hasta extender completamente los codos. Evita mover las muñecas o encoger el cuello para elevar más la barra. Una vez alcanzada la altura máxima, desciende de forma controlada y estable hasta la posición inicial.$t$,
  cues=array[$t$Busca la alineación de antebrazo y muñeca, formando un ángulo de 90º con el suelo.$t$,
    $t$Céntrate en aplicar fuerza verticalmente.$t$,
    $t$Piensa en acercar el antebrazo a la línea vertical de tu hombro, verticalmente. También puede ayudarte pensar en acercar tu bíceps al lateral de tu cara.$t$,
    $t$Recuerda sacar pecho y mueve tu cabeza para facilitar la verticalidad en el ROM.$t$]::text[]
where id=369;

-- 370 · Press Militar con Mancuernas Banco Muy Inclinado
update exercises set
  description=$t$Coloca el banco, según posibilidades y comodidad, en un ángulo de entre 75 y 89º de inclinación; de esta forma estaremos desplazando el énfasis del empuje desde el pectoral al deltoides anterior. Se trata de una buena variante de empuje vertical, ya que aporta estabilidad y un buen estímulo al deltoides anterior y, además, realizarla con mancuernas nos permite, como ventaja, un rango de movimiento ligeramente mayor, además de mayor libertad de movimiento y comodidad en hombros y muñecas.$t$,
  execution=$t$Sentado en el banco y apoyado en el respaldo de forma estable, eleva las mancuernas desde tu cadera ayudándote de las rodillas para colocarte, sacando pecho, con las mancuernas sobre los hombros en la posición inicial. Desde aquí, con un agarre prono y los codos muy ligeramente hacia delante, comienza a elevar las mancuernas prestando atención a que tu antebrazo esté vertical, con una trayectoria ligeramente convergente, como si quisieras acercar tu bíceps al lateral de tu cara, pero sin llegar a chocar ni juntar una mancuerna con la otra. Una vez extendido el codo, comienza a descender las mancuernas hasta la posición inicial de forma controlada, evitando generar movimientos o inestabilidad en los hombros o codos tanto en la fase concéntrica como en la excéntrica; aprieta con los pies contra el suelo y con tu cuerpo contra el banco para situarte en la posición más estable posible.$t$,
  cues=array[$t$Piensa en acercar el antebrazo a la línea vertical de tu hombro, verticalmente. También puede ayudarte pensar en acercar tu bíceps al lateral de tu cara.$t$,
    $t$Evita juntar y chocar las mancuernas en la parte superior.$t$,
    $t$Saca pecho durante el movimiento y clávate de forma estable contra el banco.$t$]::text[]
where id=370;

-- 371 · High Incline Multipower Shoulder Press
update exercises set
  description=$t$Coloca el banco, según posibilidades y comodidad, en un ángulo de entre 75 y 89º de inclinación; de esta forma estaremos desplazando el énfasis del empuje desde el pectoral al deltoides anterior. Se trata de una de las variantes de empuje vertical en las que estamos más estables, debido, en primer lugar, al apoyo que podemos ejercer con nuestro torso contra el banco y, en segundo lugar, a que, al ser en multipower, el movimiento va guiado de forma vertical. Si la realización muy inclinada con mancuernas no te aporta buenas sensaciones, esta puede ser una muy buena alternativa.$t$,
  execution=$t$Sentado en el banco y apoyado en él, ejerce fuerza con los pies contra el suelo y contra el respaldo para estar aún más estable. Escoge un agarre que te permita mantener la verticalidad del antebrazo y la muñeca, a unos 90º con el suelo; saca pecho situando a la vez los codos ligeramente hacia delante y desencaja la barra de la multipower para situarte en la posición inicial, generando tensión. Comienza a elevar la barra lo más vertical posible, manteniendo las muñecas y los antebrazos alineados y pensando en acercar tus bíceps a tu cara, hasta extender los codos casi o por completo. Desde ahí, comienza a descender hasta la posición inicial de forma controlada, evitando tumbarte excesivamente en el banco y cualquier tipo de gesto de inestabilidad en los hombros, muñecas o codos, tanto en la fase concéntrica como en la excéntrica.$t$,
  cues=array[$t$Busca la alineación de antebrazo y muñeca, formando un ángulo de 90º con el suelo.$t$,
    $t$Céntrate en aplicar fuerza verticalmente; lleva la barra en línea recta hacia arriba.$t$,
    $t$Piensa en acercar el antebrazo a la línea vertical de tu hombro, verticalmente.$t$,
    $t$Saca pecho durante el movimiento y clávate de forma estable contra el banco.$t$]::text[]
where id=371;

-- 372 · Press Militar en Máquina
update exercises set
  description=$t$Esta variante de press militar se realiza en una máquina de empuje vertical guiada. En la mayoría de las ocasiones, lo interesante que pueda ser este ejercicio dependerá del diseño de la máquina: si lleva discos o placas y cables, la inclinación del asiento, etc. Si el respaldo se nos hace incómodo o atrapa nuestras escápulas, es interesante probar la variante inversa, que permite el movimiento libre de las mismas.$t$,
  execution=$t$Colócate en la máquina sentado y apoyado en el respaldo, buscando una posición estable, con los pies en el suelo y ejerciendo fuerza contra él para anclarte. Saca pecho y coloca tus manos sobre los agarres utilizando el agarre prono o neutro según comodidad, sensaciones u objetivo, y sitúa los deltoides en ligera tensión despegando ligeramente los agarres del soporte. Desde aquí, comienza a empujar en vertical, en paralelo a tu cuerpo, centrándote en la trayectoria de tus antebrazos; busca que tu muñeca y tu antebrazo estén lo más alineados posible para evitar incomodidades o fugas de fuerza. Sube de forma controlada y desciende del mismo modo, evitando inercias con el cuerpo, así como encoger los trapecios. También es recomendable evitar cualquier tipo de inestabilidad en muñecas u hombros.$t$,
  cues=array[$t$Piensa en acercar el antebrazo a la línea vertical de tu hombro, verticalmente. También puede ayudarte pensar en acercar tu bíceps al lateral de tu cara.$t$,
    $t$Evita encoger las escápulas, el trapecio o el cuello durante el ejercicio.$t$,
    $t$Evita movimientos inestables y descontrolados en las muñecas o los hombros.$t$,
    $t$Saca pecho durante el movimiento y deja moverse libres tus escápulas.$t$]::text[]
where id=372;

-- 373 · Half-kneeling Dumbbell Shoulder Press
update exercises set
  description=$t$Esta variante de press militar busca aportar algo de estabilidad con un apoyo contralateral cuando, por el contexto, el material o los objetivos, sea interesante trabajar de forma unilateral. Puede escogerse un agarre neutro o intermedio entre prono y neutro. La realización es similar a la de otros empujes verticales con mancuerna, con algunas salvedades y diferencias.$t$,
  execution=$t$Semiarrodillado, en posición de caballero, coge una mancuerna de forma contralateral; es decir, trabajará el brazo contrario a la rodilla que se encuentra apoyada en el suelo. Desde aquí, eleva la mancuerna y sitúala a la altura del hombro, sacando el codo ligeramente hacia delante a la vez que sacas pecho. Comienza a elevar la mancuerna teniendo en cuenta el movimiento de tu antebrazo y tratando de acercar tu bíceps a tu cara a medida que asciendes, hasta extender completamente el codo. Evita movimientos excesivos con el hombro o encoger los trapecios; trata de que la muñeca no se mueva y permanezca alineada con el antebrazo. Controla que el movimiento no sea demasiado rápido, ni en la fase excéntrica ni en la concéntrica.$t$,
  cues=array[$t$Eleva la mancuerna teniendo en cuenta la trayectoria del antebrazo.$t$,
    $t$Busca la alineación de antebrazo y muñeca, formando un ángulo de 90º con el suelo.$t$,
    $t$Escoge entre un agarre neutro o intermedio.$t$]::text[]
where id=373;

-- 374 · Elevaciones Frontales con Barra
update exercises set
  description=$t$Este ejercicio se trata de una variante de elevaciones en la que buscamos trabajar de forma aislada el deltoides anterior. Aunque, especialmente en los primeros grados de movimiento, también colaborará el pectoral, esta no debería ser la intención principal del ejercicio. De hecho, los estímulos directos al deltoides anterior pueden minimizarse o suprimirse si la programación de variables es buena para otros empujes.$t$,
  execution=$t$De pie, sujeta una barra con un agarre prono, según comodidad, con una anchura ligeramente superior, igual o inferior al ancho biacromial: ni muy cerrado ni muy ancho. Coloca la barra por delante de tu tronco y saca muy ligeramente la cadera hacia atrás; desde aquí, y evitando iniciar el movimiento con cualquier impulso, comienza a elevar tus antebrazos mientras sujetan la barra. Los codos deben permanecer casi o totalmente extendidos. Lleva la barra hasta la altura de tus ojos, o ligeramente por encima de tu cabeza según sensaciones; no es necesario más. Una vez alcanzado el ROM efectivo, comienza a descender la barra de forma controlada hasta llevarla por delante de tu torso; puedes no realizar la parte más baja del movimiento para evitar perder tensión.$t$,
  cues=array[$t$No es necesario llevar la barra hasta el techo: elévala hasta tus ojos o ligeramente por encima de tu cabeza. Puedes omitir la parte inicial del ROM.$t$,
    $t$Evita impulsos con el torso, los pies o la cadera para elevar la barra; no debes convertirlo en un kettlebell swing.$t$,
    $t$Piensa en empujar hacia arriba tus antebrazos con tus deltoides.$t$]::text[]
where id=374;

-- 375 · Elevaciones Frontales desde Polea Baja
update exercises set
  description=$t$Este tipo de ejercicio es una elevación frontal cuyo objetivo es estimular, preferentemente, el deltoides anterior de forma aislada; realizarlo desde polea baja cambia la curva de resistencia y aporta una tensión más constante. Pueden escogerse diferentes tipos de agarres, pero prono y con barra será la opción principal en el caso de esta variante. Si realizamos una buena programación de empujes, generalmente no será necesario, salvo excepciones, trabajarlo con objetivos estéticos.$t$,
  execution=$t$De pie, pasa el cable entre ambas piernas y sujeta una barra recta o EZ con un agarre prono, según comodidad, con una anchura ligeramente superior, igual o inferior al ancho biacromial: ni muy cerrado ni muy ancho. Genera tensión en el cable separando la barra de tu cuerpo y comienza a elevarla evitando cualquier impulso y prestando atención a tus antebrazos mientras sujetan la barra; los codos deben permanecer casi o totalmente extendidos. Lleva la barra hasta la altura de tus ojos, o ligeramente por encima de tu cabeza según sensaciones; no es necesario más. Una vez alcanzado el ROM efectivo, comienza a descender la barra de forma controlada hasta llevarla de nuevo por delante de tu torso.$t$,
  cues=array[$t$No es necesario llevar la barra hasta el techo: elévala hasta tus ojos o ligeramente por encima de tu cabeza.$t$,
    $t$Puedes omitir la parte inicial del ROM.$t$,
    $t$Evita impulsos con el torso, los pies o la cadera para elevar la barra.$t$,
    $t$Piensa en empujar hacia arriba tus antebrazos con tus deltoides.$t$]::text[]
where id=375;

-- 376 · Press Militar en Máquina Inverso
update exercises set
  description=$t$Esta variante de press militar se recomienda especialmente para aquellas personas que no disponen de una máquina buena o cómoda, o en el caso de que el respaldo se nos haga incómodo por atrapar las escápulas e impedir el movimiento libre de las mismas. Un inconveniente puede ser, o no, el diseño de la máquina: al ir guiada, si no tiene un buen diseño, puede no ser tan interesante como otras opciones.$t$,
  execution=$t$Colócate en la máquina sentado al revés, con el pecho mirando hacia el respaldo, en el que puedes apoyarte o no en función del diseño de la máquina y de tu comodidad, pero dejando las escápulas libres para el movimiento. Saca pecho y coloca tus manos sobre los agarres utilizando el agarre prono o neutro según comodidad, sensaciones u objetivo, y sitúa los deltoides en ligera tensión despegando ligeramente los agarres del soporte. Desde aquí, comienza a empujar en vertical, en paralelo a tu cuerpo, centrándote en la trayectoria de tus antebrazos; busca que tu muñeca y tu antebrazo estén lo más alineados posible para evitar incomodidades o fugas de fuerza. Sube de forma controlada y desciende del mismo modo, evitando inercias con el cuerpo, así como encoger los trapecios. También es recomendable evitar cualquier tipo de inestabilidad en muñecas u hombros.$t$,
  cues=array[$t$Piensa en acercar el antebrazo a la línea vertical de tu hombro, verticalmente. También puede ayudarte pensar en acercar tu bíceps al lateral de tu cara.$t$,
    $t$Evita encoger las escápulas, el trapecio o el cuello durante el ejercicio.$t$,
    $t$Evita movimientos inestables y descontrolados en las muñecas o los hombros.$t$,
    $t$Saca pecho durante el movimiento y deja moverse libres tus escápulas.$t$]::text[]
where id=376;

-- 377 · Elevaciones Frontales con Barra en Banco Inclinado
update exercises set
  description=$t$Al igual que cualquier elevación frontal, se trata de un ejercicio prescindible en nuestra rutina, salvo casos puntuales, siempre y cuando realicemos una correcta selección de los empujes en nuestro entrenamiento. Sin embargo, puestos a realizarlas, pueden ser una buena opción de cara a aportar variedad y contribuir a limitar los impulsos e inercias que pueden generarse con el cuerpo en otras variantes.$t$,
  execution=$t$Coloca un banco a una inclinación aproximada de 45-60º según comodidad y túmbate sobre él apoyando todo tu pecho en la parte alta y tu abdomen, con los pies en el suelo aplicando fuerza para generar una posición estable. Sujeta la barra con una anchura similar al ancho de tus hombros y agarre prono, sacando los brazos por los laterales de la parte alta del banco. En la posición inicial, sitúa los brazos en perpendicular al suelo y, desde aquí, comienza a ejercer fuerza centrándote en los antebrazos, elevando la barra sin aprovechar impulsos o balanceos. Continúa con la elevación hasta situar tus antebrazos en paralelo al suelo y, una vez alcanzada esta posición, resiste la fase excéntrica aplicando fuerza para que la barra descienda más lentamente hasta volver a la posición inicial.$t$,
  cues=array[$t$Céntrate en la dirección de tus antebrazos, no en la barra.$t$,
    $t$No es necesario elevar la barra excesivamente: con situarla en paralelo al suelo es suficiente.$t$,
    $t$Ejerce fuerza en la subida sin aprovechar impulsos con la barra como un columpio, y resiste la fase excéntrica ejerciendo fuerza para bajar lento.$t$]::text[]
where id=377;

-- 378 · Elevaciones Frontales en Banco Inclinado desde Polea Baja
update exercises set
  description=$t$Esta variante de elevaciones frontales desde polea baja se realiza con un banco situado a 45-60º según comodidad. Recuerda que en los primeros grados de movimiento suele contribuir más el pectoral, por lo que no es necesario llegar a descender las manos del todo: basta con situarlas en perpendicular a la línea del pecho, o ligeramente por debajo de la misma, y subir hasta los 160-180º. Al realizarlo con cables, conseguiremos que la parte media del movimiento sea la más dura, mientras que en las partes inferior y superior la resistencia se reduce.$t$,
  execution=$t$Túmbate boca arriba sobre un banco inclinado aproximadamente a 45º, aunque puedes inclinarlo hasta 60º sin problema si estás más cómodo. Puedes realizar el ejercicio de forma unilateral, pero lo ideal es contar con una estación de poleas cerrada, de forma que con cada mano agarremos uno de los cables. A continuación, sitúa tus codos extendidos y las manos aproximadamente a la altura de tu pecho o ligeramente por debajo, y comienza a elevar las manos pensando en empujar tus antebrazos hacia arriba, llevando los bíceps hacia tu cara. Continúa hasta llevar las manos por encima de tu cabeza, alineando en la medida de lo posible los antebrazos con el banco, y desde ahí comienza a descender de forma controlada, resistiendo la fase excéntrica, hasta la posición inicial.$t$,
  cues=array[$t$Céntrate en la dirección de tus antebrazos y en empujar con ellos hacia arriba.$t$,
    $t$Evita despegar el culo del asiento o intentar impulsarte con el torso; baja el peso y realiza un movimiento lento y controlado.$t$,
    $t$Comienza el movimiento desde la línea de tu pecho hasta alinear los brazos con el banco; no es necesario que las manos vayan a la cadera.$t$]::text[]
where id=378;

-- 379 · Extensiones Trasnuca con Mancuerna Sentado
update exercises set
  description=$t$En este ejercicio partiremos desde sentados para tener una mayor estabilidad. Aunque generalmente suele realizarse con 1 sola mancuerna sujeta con ambas manos, podríamos realizar una variante con 2 mancuernas, de forma similar, si estamos más cómodos. Se trata de un ejercicio en el que el hombro se encuentra en flexión, por encima de la cabeza, por lo que incidiremos ligeramente más sobre la cabeza larga del tríceps.$t$,
  execution=$t$Sentado, coloca una mancuerna sobre tus muslos. A continuación, escoge entre realizar un agarre de copa con ambas manos sobre la base de la mancuerna o un agarre neutro con ambas manos, sujetando la mancuerna por la barra y con los meñiques contra la base; este agarre podría ser útil en caso de que notes mucho los hombros con el agarre de copa. Eleva la mancuerna con ayuda de las piernas y pásala por uno de tus hombros hasta la posición trasnuca de inicio. Desde aquí, con el tríceps en estiramiento y el antebrazo tocando el bíceps, comienza a empujar la mancuerna hacia arriba hasta extender por completo los codos. Tus codos deben tender a apuntar hacia el frente en la medida de lo posible; no hay ningún problema si se abren hacia los lados, ya que el tríceps recibirá un estímulo igual, pero evita que sea algo excesivo para que no se convierta en una especie de press militar en el que el deltoides y el pectoral superior realicen la mayor parte del movimiento.$t$,
  cues=array[$t$Prueba ambos agarres, de copa y neutro, y escoge el que mejores sensaciones te dé.$t$]::text[]
where id=379;

-- 380 · Ext. Trasnuca desde Polea Baja con Cuerda Sentado
update exercises set
  description=$t$Este ejercicio puede realizarse de pie o sentado, aunque sentado estaremos en una posición más estable, lo que puede ser interesante. También podemos escoger otros implementos, como unas muñequeras o una barra, en lugar de una cuerda para realizarlo. Se trata de una extensión de codo con el hombro en flexión, es decir, con los brazos por encima de la cabeza. Al realizarlo en polea tenemos tensión constante, lo que puede resultar una ventaja en muchos casos respecto al peso libre.$t$,
  execution=$t$Partiendo de sentado, sujetaremos el agarre en posición neutra y lo llevaremos por detrás de la cabeza, con los codos en flexión. Desde aquí, comenzaremos a elevarlo extendiendo el codo, sin ayudarnos con los hombros ni con impulsos, hasta alcanzar la extensión completa; céntrate en desdoblar tu codo llevando las manos hacia arriba. Durante el movimiento, lo ideal es que los codos apunten hacia delante en la medida de lo posible; sin embargo, podrías abrirlos ligeramente hacia afuera sin que esto afecte en gran medida al trabajo que recibe el tríceps, pero evita abrirlos en exceso para no llevar el trabajo a otros músculos. Realiza unas fases concéntrica y excéntrica controladas, evitando movimientos rápidos o bruscos, y céntrate en estrujar tus tríceps a medida que subes extendiendo el codo.$t$,
  cues=array[$t$Intenta tocar antebrazo y bíceps en cada repetición. El ROM debe ser completo.$t$,
    $t$Evita ayudarte con impulsos y/o con los hombros para realizar la fase concéntrica, piensa únicamente en extender tus codos.$t$,
    $t$Evita centrarte en separar las cuerdas, ya que sería un movimiento de la muñeca. Céntrate en extender el codo subiéndolas verticalmente.$t$]::text[]
where id=380;

-- 381 · Press Francés con Mancuernas Tumbado
update exercises set
  description=$t$Esta variante de press francés resulta especialmente interesante, ya que su realización con mancuernas nos permite ciertas ventajas en relación a su homólogo con barra: entre ellas, un mayor ROM activo durante el ejercicio y una mayor alineación entre la carga y la línea de aplicación de fuerza, lo cual puede ser especialmente interesante. En esta variante, el banco estará totalmente plano.$t$,
  execution=$t$Tumbado, despegaremos las mancuernas desde el pecho en posición neutra, como si de un Hex press se tratase. Desde aquí, con los brazos en posición perpendicular al suelo y sujetando las mancuernas con agarre neutro, comienza a flexionar los codos descendiendo las mancuernas hasta por detrás de tu cabeza, buscando tocar el banco por detrás o incluso sobrepasarlo. Un error común suele ser añadir más rango de movimiento con el hombro; busca que tu antebrazo y tu bíceps se aplasten, centrando al máximo el movimiento en el codo hasta doblarlo por completo. Desde aquí, comienza a empujar poniendo el foco en la extensión del codo, llevando las mancuernas hasta la posición inicial. Durante todo el movimiento, intenta mantener la alineación de tus codos con la carga; no es necesario que extiendas por completo el codo si así lo sientes mejor.$t$
where id=381;

-- 382 · Press Francés con Barra Tumbado
update exercises set
  description=$t$Esta variante de press francés también se realiza en un banco totalmente plano; sin embargo, podemos seleccionar diferentes tipos de barras para realizarla, como una recta, una barra EZ o una barra romana. Generalmente, y por comodidad de las muñecas y los hombros, seleccionaremos una barra EZ.$t$,
  execution=$t$Tumbado en el banco, selecciona el agarre que vayas a utilizar: generalmente, la anchura de los hombros suele ir bien, pero cada persona podrá abrirlo o cerrarlo buscando aquel que le permita pegar los codos a la línea del cuerpo y le dé mejores sensaciones; puedes rodear o no la barra con el pulgar. Desde la posición de tumbado, empuja la barra como en un press, en perpendicular al suelo, para situarte en la posición inicial del movimiento. Comienza a descender la barra de forma controlada hasta llevarla por detrás de tu cabeza, doblando por completo el codo y aplastando antebrazo y bíceps. Intenta que no se te abran en exceso los codos y que el movimiento sea controlado; no es necesario llegar a bloquear los codos por completo si lo sientes mejor.$t$,
  cues=array[$t$Busca aplastar tu bíceps contra tu antebrazo en cada repetición.$t$,
    $t$Busca un agarre adecuado, ni excesivamente ancho ni estrecho.$t$,
    $t$No es necesario bloquear del todo los codos, puedes mantener la tensión.$t$,
    $t$Controla la alineación de tus codos, que no se abran en exceso.$t$]::text[]
where id=382;

-- 383 · Press Francés de Pie con Mancuernas
update exercises set
  description=$t$Este ejercicio puede realizarse tanto con mancuernas como con barra recta, EZ o romana. El movimiento será similar al que realizamos tumbados, pero en esta variante se parte de pie, lo cual puede ser una desventaja si cargamos mucho peso o nos cuesta estar estables. En ese caso, podríamos optar por sentarnos o realizar cualquiera de las variantes tumbado, donde esto no es un problema en absoluto.$t$,
  execution=$t$Partiendo de una posición de pie lo más estable posible, con los pies situados aproximadamente a la anchura de los hombros, cogemos unas mancuernas y las llevamos a la posición trasnuca, por encima de cada hombro. Desde aquí, con el tríceps en estiramiento, comienza a elevar las mancuernas hasta bloquear casi por completo los codos. Intenta que, a lo largo del movimiento, los codos apunten lo más posible hacia el frente, aunque podrías abrirlos si te sientes más cómodo, siempre y cuando no te impulses con el pectoral y el hombro para elevar las mancuernas. Controla las fases concéntrica y excéntrica del movimiento, evitando realizar movimientos bruscos.$t$,
  cues=array[$t$Busca aplastar tu bíceps contra tu antebrazo en cada repetición.$t$,
    $t$No es necesario bloquear por completo los codos en cada repetición.$t$,
    $t$Controla la alineación de tus codos, que no se abran en exceso. Puedes abrirlos siempre que no te impulses con el hombro o el pectoral para elevar la carga.$t$]::text[]
where id=383;

-- 384 · Rompecráneos - Skullcrusher con Barra (antes «Rompecraneos - Skullcrusher con Barra»)
update exercises set
  name=$t$Rompecráneos - Skullcrusher con Barra$t$,
  description=$t$La diferencia principal entre un press francés y un rompecráneos es la zona hacia la que llevamos la barra o las mancuernas: en el press francés la llevamos por detrás de la cabeza, mientras que en esta variante la llevaremos hacia nuestra nariz o frente. La realización técnica es similar, con pequeñas diferencias.$t$,
  execution=$t$Tumbado en el banco, selecciona el agarre que vayas a utilizar: generalmente, la anchura de los hombros suele ir bien, pero cada persona podrá abrirlo o cerrarlo buscando aquel que le permita pegar los codos a la línea del cuerpo y le dé mejores sensaciones; puedes rodear o no la barra con el pulgar. Desde la posición de tumbado, empuja la barra como en un press, en perpendicular al suelo, para situarte en la posición inicial del movimiento. Comienza a descender la barra de forma controlada hasta llevarla hacia tu nariz o frente, doblando por completo el codo y aplastando antebrazo y bíceps. Intenta que no se te abran en exceso los codos y que el movimiento sea controlado; no es necesario llegar a bloquear los codos por completo si lo sientes mejor.$t$
where id=384;

-- 385 · Fondos en Paralelas Agarre Estrecho
update exercises set
  description=$t$Para hacer de este ejercicio, si cabe, uno aún más predominante de tríceps, tendremos que realizar principalmente algunas variaciones: en primer lugar, optaremos por un agarre más estrecho que el que se utiliza cuando el objetivo es estimular principalmente el pectoral. En segundo lugar, las manos se colocarán ligeramente más adelantadas. En tercer lugar, la aplicación de fuerza intencional deberá ir hacia abajo y hacia atrás, en lugar de hacia delante. Es un ejercicio en el que es aconsejable lastrarse cuando se domina.$t$,
  execution=$t$Realizando una ligera retracción escapular, agarra las manetas situando las manos aproximadamente debajo de la línea del hombro y mantén la extensión torácica (sin redondear la espalda alta) durante todo el movimiento. Una vez colocado con los codos extendidos, inclínate muy ligeramente hacia delante y comienza a bajar controlando la fase excéntrica hasta un punto cómodo donde tus hombros no sufran; puedes tomar como referencia que tu codo forme un ángulo de aproximadamente 90º, pero según tu morfología podrás bajar más o menos. Desde la posición más baja, empuja fuerte y de forma controlada, buscando intencionalmente aplicar fuerza hacia abajo y hacia atrás hasta alcanzar casi o por completo la extensión de los codos. Evita balanceos e impulsos durante todo el ejercicio.$t$,
  cues=array[$t$No te impulses con las piernas ni te balancees.$t$,
    $t$Mantén la retracción escapular durante el ejercicio.$t$,
    $t$Inclínate ligeramente hacia delante.$t$,
    $t$Aplica fuerza hacia abajo y atrás, colocando las manos por debajo de la línea del hombro.$t$]::text[]
where id=385;

-- 386 · Extensiones desde Polea Alta en X o Cruzadas
update exercises set
  description=$t$Esta variante es una muy buena alternativa a las típicas extensiones desde polea alta que se realizan con una cuerda, ya que permite una mejor alineación de la línea de fuerza con el tríceps, además de evitar movimientos de separación de las manos: se trata de una extensión de codo pura, aunque puede añadirse incluso cierta abducción, tal y como se realiza en otras variantes del movimiento.$t$,
  execution=$t$Coloca la polea en posición elevada y selecciona, a ser posible, unas muñequeras para facilitar el agarre, aunque en su defecto también podría realizarse con 2 cuerdas independientes o agarres de cruces. Desde aquí, agarrando las muñequeras, tensiona ligeramente el cable extendiendo el hombro y llevándolo a la posición de partida, buscando que haya tensión a lo largo de todo el recorrido. Con el antebrazo tocando el bíceps, comienza la fase concéntrica separando ambos cables entre sí, pero centrando tu movimiento únicamente en la extensión del codo. Puedes llegar a bloquear y contraer el tríceps si quieres, o no hacerlo, según tu preferencia. Una vez realizada la extensión, vuelve de forma controlada a la posición de partida.$t$,
  cues=array[$t$Intenta tocar antebrazo y bíceps en cada repetición. El ROM debe ser completo.$t$,
    $t$Evita ayudarte con impulsos, inercias o movimientos de muñeca para realizar más recorrido. Céntrate en la extensión del codo; si quieres, puedes bloquear.$t$,
    $t$Busca alinear lo mejor posible la dirección de la fuerza con tu tríceps.$t$]::text[]
where id=386;

-- 387 · Extensión Lateral desde Polea Alta
update exercises set
  description=$t$Las extensiones laterales desde polea alta son una buena alternativa o sustituto de las extensiones en X cuando no dispongamos de 2 poleas o busquemos una variante similar. La realización del movimiento es muy parecida, pero colocando nuestro cuerpo ligeramente de lado con respecto a la polea para facilitar la alineación del movimiento y realizándolas únicamente a 1 mano, lo cual puede ser útil en muchos casos.$t$,
  execution=$t$Coloca la polea en posición elevada y colócate de lado a ella, con el brazo que no va a trabajar más cerca de la polea. Selecciona, a ser posible, una muñequera para facilitar el agarre, aunque en su defecto también podría realizarse con 1 cuerda o 1 agarre de cruces. Desde aquí, agarrando la muñequera (puedes dejar el pulgar por fuera), tensiona ligeramente el cable y comienza la fase concéntrica de forma controlada, alejando tu mano de tu cuerpo y buscando alinear y mantener la fuerza con tu tríceps durante todo el recorrido, pero centrando el movimiento únicamente en la extensión del codo. Puedes llegar a bloquear y contraer el tríceps si quieres, o no hacerlo, según tu preferencia. Una vez realizada la extensión completa, vuelve de forma controlada hasta llegar a tocar tu bíceps con tu antebrazo. Evita movimientos excesivos con el hombro en ambas fases.$t$,
  cues=array[$t$Intenta tocar antebrazo y bíceps en cada repetición. El ROM debe ser completo.$t$,
    $t$Evita ayudarte con impulsos, inercias o movimientos de muñeca para realizar más recorrido. Céntrate en la extensión del codo; si quieres, puedes bloquear.$t$,
    $t$Busca alinear lo mejor posible la dirección de la fuerza con tu tríceps.$t$]::text[]
where id=387;

-- 388 · Extensiones de Codo Sentado desde Polea Alta
update exercises set
  description=$t$Esta variante se realiza de forma similar a unas extensiones cruzadas o en X, pero variando la posición del hombro con respecto a nuestro cuerpo, buscando enfatizar ligeramente las cabezas medial y lateral. El banco, además, tiene un doble uso: aporta estabilidad en el apoyo, al permitirnos empujar contra él, y evita que realicemos impulsos e inercias con el cuerpo durante todas las fases del movimiento.$t$,
  execution=$t$Sentado en un banco con el respaldo a 80-90º de inclinación, coloca la polea en torno a la altura del hombro o de la cabeza, según comodidad, y selecciona preferentemente unas muñequeras como agarre, aunque en su defecto pueden servir unos agarres de cruces o cuerdas independientes. Coloca el hombro en flexión a unos 90º, que podrás variar según comodidad e intención. Desde aquí, con los cables en ligera tensión, comienza a extender los codos alejando tus manos de tu cuerpo hasta alcanzar la extensión completa. Desde ahí, vuelve de forma controlada hasta tocar tu bíceps con el antebrazo, evitando movimientos bruscos o impulsos.$t$,
  cues=array[$t$Intenta tocar antebrazo y bíceps en cada repetición. El ROM debe ser completo.$t$,
    $t$Céntrate en la extensión del codo; si quieres, puedes bloquearlos.$t$,
    $t$Busca alinear lo mejor posible la dirección de la fuerza con tu tríceps.$t$,
    $t$Empuja con tu cuerpo y pies contra el respaldo, buscando generar estabilidad.$t$,
    $t$Antes de comenzar, puedes variar la abducción del hombro respecto al tronco, pero evita que se mueva durante el ejercicio.$t$]::text[]
where id=388;

-- 389 · Extensión Unilateral en Polea Alta de Pie a 90º
update exercises set
  description=$t$Esta variante puede realizarse tanto de pie como sentado y consiste en una extensión de codo a 1 mano con el hombro en flexión y el movimiento en perpendicular al tronco, buscando enfatizar ligeramente las cabezas medial y lateral, además de alinear la dirección del movimiento con la línea de fuerza mejor que en otro tipo de extensiones tradicionales. Es importante evitar gestos bruscos e inestabilidad.$t$,
  execution=$t$De pie, con una muñequera, seleccionaremos un agarre preferiblemente neutro, aunque podría ser prono si se utiliza un agarre de cruces, llevando la mano a la altura de la frente o de la cabeza y tensionando ligeramente el cable desde la posición inicial. Desde aquí, comienza a extender el codo por completo, alejando el cable de tu cabeza y evitando movimientos laterales con el codo o el cable. Una vez extendido, vuelve a la posición inicial controlando la fase excéntrica, intentando comprimir tu bíceps con tu antebrazo.$t$,
  cues=array[$t$Intenta comprimir antebrazo y bíceps en cada repetición.$t$,
    $t$Céntrate en la extensión del codo; si quieres, puedes bloquearlo.$t$,
    $t$Busca alinear lo mejor posible la dirección de la fuerza con tu tríceps.$t$]::text[]
where id=389;

-- 390 · Extensiones Katana
update exercises set
  description=$t$Esta variante de tríceps, popularizada por Eugene Teo, se realiza utilizando una polea baja y situando el hombro en flexión, con el objetivo de darle un ligero énfasis a la cabeza medial. Puede realizarse preferentemente con una muñequera, aunque también puede hacerse sin agarre o con un agarre de cruces. Además, permite una muy buena alineación entre el húmero y el cable.$t$,
  execution=$t$Comienza el ejercicio situándote lateralmente respecto a la polea, situada en una posición baja; a partir de aquí, imagina que el cable es una katana e imita el gesto de desenvainarla desde tu espalda. Para realizarlo correctamente, coloca la muñeca en una posición neutra, sitúa el hombro y el codo flexionados, con la mano por detrás de la espalda, y tensiona ligeramente el cable para situarte en la posición inicial. Una vez aquí, comienza la fase concéntrica extendiendo el codo, evitando impulsos, con una trayectoria ligeramente diagonal con respecto a la posición del torso. Una vez alcances la extensión completa, vuelve a la posición inicial controlando la fase excéntrica, evitando movimientos innecesarios de muñecas y hombro durante todo el recorrido.$t$,
  cues=array[$t$Mantén una trayectoria ligeramente diagonal para una correcta alineación del movimiento con el tríceps.$t$,
    $t$Evita movimientos con la muñeca; céntrate en extender el codo.$t$,
    $t$Sitúate lateralmente con respecto a la polea y busca un apoyo de pies estable.$t$]::text[]
where id=390;

-- 391 · Tate Press en Polea
update exercises set
  description=$t$El tate press típicamente se ha realizado con mancuernas; en esta variante lo que hacemos es escoger unas poleas bajas para realizarlo en combinación con muñequeras o agarres libres, por lo que su realización tiene algunas diferencias respecto a la forma tradicional. Es una alternativa ideal para quienes presentan molestias en los codos con las mancuernas o les cuesta sentir el estímulo en el tríceps durante el ejercicio.$t$,
  execution=$t$Coloca un banco con una inclinación de 20-45º según comodidad; desde aquí, y con las poleas situadas en su posición más baja, agarra la muñequera con el pulgar por fuera para poder ejercer fuerza con la parte exterior de la mano durante todo el recorrido; también puedes coger directamente la polea o utilizar agarres de cruces. Para comenzar, con los agarres cogidos, lleva tus codos a una altura entre tu pecho y tu barbilla, generando tensión en los cables desde el punto inicial. Desde aquí, aleja los cables de ti con una trayectoria diagonal, buscando alinear la dirección del movimiento con tu húmero y evitando gestos con la muñeca o el hombro para dar más ROM; céntrate en extender el codo para después regresar de forma controlada a la posición inicial, juntando tu bíceps y tu antebrazo.$t$,
  cues=array[$t$Lleva el movimiento a un punto cómodo entre el pecho y la barbilla.$t$,
    $t$Mantén la tensión en el cable durante todo el movimiento y controla ambas fases, sin gestos bruscos ni en la muñeca ni en los hombros.$t$,
    $t$Céntrate en extender el codo y vuelve hasta que el bíceps toque el antebrazo.$t$,
    $t$Busca alinear lo mejor posible la dirección de la fuerza con tu tríceps/húmero.$t$]::text[]
where id=391;

-- 392 · Kaz Press
update exercises set
  description=$t$Este ejercicio es similar a un JM press, con la salvedad de que se realiza en multipower. Se trata de una buena alternativa cuando nuestro objetivo es trabajar el tríceps en un rango de repeticiones moderado o bajo, además de poder sustituir más cómodamente a otros ejercicios según nuestra conveniencia, dando a su vez un estímulo superior al tríceps respecto a otros empujes, como un press cerrado.$t$,
  execution=$t$Tumbado en un banco debajo de la multipower, selecciona un agarre ligeramente más estrecho (o igual) que el ancho biacromial, rodeando o no la barra con el pulgar según comodidad. Desde aquí, empuja sacando la barra del soporte y extendiendo los codos para colocarte en la posición inicial. A continuación, comienza a descender de forma controlada llevando los codos hacia delante (hacia tus caderas) en lugar de abrirlos a los lados, en paralelo a tu cuerpo, para así focalizar el estímulo en el tríceps, descendiendo la barra hacia la altura de la barbilla o de la clavícula, según comodidad. Desde aquí, comienza a extender de nuevo los codos hasta alcanzar el punto inicial, sin perder su posición y evitando mover los hombros en exceso o despegarlos del cuerpo. Evita también movimientos de muñeca durante el ejercicio.$t$,
  cues=array[$t$Céntrate en adelantar los codos lo máximo posible con respecto a la barra.$t$,
    $t$Lleva la barra entre tu barbilla y tus clavículas, según comodidad, controlando la excéntrica.$t$,
    $t$Busca aplastar tu bíceps contra tu antebrazo en cada repetición.$t$,
    $t$Evita convertirlo en un press cerrado: no lleves la barra al pecho ni abras los codos.$t$,
    $t$Evita que tus muñecas se extiendan en exceso; flexiónalas ligeramente.$t$]::text[]
where id=392;

-- 393 · JM Press (antes «Jm Press»)
update exercises set
  name=$t$JM Press$t$,
  description=$t$El JM press, popularizado por J. M. Blakley, es una buena alternativa de cara a trabajar un empuje para el tríceps de forma mucho más específica de lo que podría ser un press cerrado o similar. Podríamos decir que es una mezcla de empuje con extensión de codo, con barra libre, en la que principalmente deberemos centrarnos en el movimiento del codo para llevar el estímulo al tríceps de la forma más correcta posible.$t$,
  execution=$t$Tumbado en un banco, selecciona un agarre ligeramente más estrecho (o igual) que el ancho biacromial, rodeando o no la barra con el pulgar según comodidad. Desde aquí, saca la barra del soporte extendiendo los codos para colocarte en la posición inicial. A continuación, comienza a descender de forma controlada llevando los codos hacia delante (hacia tus caderas) en lugar de abrirlos a los lados, en paralelo a tu cuerpo, para así focalizar el estímulo en el tríceps, descendiendo la barra hacia la altura de la barbilla o de la clavícula, según comodidad. Desde aquí, comienza a extender de nuevo los codos hasta alcanzar el punto inicial, sin perder su posición y evitando mover los hombros en exceso o despegarlos del cuerpo. Evita también movimientos de muñeca durante el ejercicio.$t$,
  cues=array[$t$Céntrate en adelantar los codos lo máximo posible con respecto a la barra.$t$,
    $t$Lleva la barra entre tu barbilla y tus clavículas, según comodidad, controlando la excéntrica.$t$,
    $t$Busca aplastar tu bíceps contra tu antebrazo en cada repetición.$t$,
    $t$Evita convertirlo en un press cerrado: no lleves la barra al pecho ni abras los codos.$t$,
    $t$Evita que tus muñecas se extiendan para dar más ROM.$t$]::text[]
where id=393;

-- 394 · Extensiones Trasnuca desde Polea Alta Cuerda/barra
update exercises set
  description=$t$Este ejercicio es una variante de extensión de codo con el hombro en flexión y el movimiento en perpendicular al tronco, buscando enfatizar ligeramente las cabezas medial y lateral. Para este ejercicio pueden utilizarse 1 o 2 cuerdas, así como diferentes tipos de barras (recta, V, EZ…).$t$,
  execution=$t$De pie, con la polea en una posición elevada que permita una correcta alineación del movimiento, selecciona el agarre que te resulte más cómodo y te aporte mejores sensaciones en los tríceps: si usas barras, parte de un agarre prono, y si usas cuerdas, de un agarre neutro. Flexiona los hombros a 90º y tracciona del agarre para situarte en la posición inicial, de pie, con la polea a tu espalda y el cable en tensión. Desde aquí, comienza a extender los codos llevándolos hacia delante y alejando de ti el agarre hasta completar el recorrido, manteniendo la alineación del movimiento en todo momento y evitando impulsarte con el cuerpo o los hombros. Regresa de forma controlada a la posición inicial, buscando comprimir tu antebrazo y tu bíceps para darle el máximo rango de movimiento activo posible al ejercicio.$t$,
  cues=array[$t$Lleva los codos lo más hacia delante posible; evita que se abran en exceso.$t$,
    $t$Trata de doblar y extender el codo por completo; opcionalmente, puedes añadir algo de extensión de hombro, pero busca comprimir tu bíceps y tu antebrazo.$t$,
    $t$Alinea la dirección de movimiento con tu húmero lo máximo posible.$t$,
    $t$Evita impulsarte o ayudarte con el cuerpo y los hombros.$t$,
    $t$Si usas una cuerda, no te centres en separar los extremos, sino en extender los codos hacia delante.$t$]::text[]
where id=394;

-- 395 · Extensiones desde Polea Alta con Barra (V1)
update exercises set
  description=$t$Este ejercicio es el típico ejercicio de extensión de codo que se suele ver en los gimnasios; sin embargo, puede hacerse tanto con diferentes tipos de barras, como una recta, una Z o una barra V, como con 1 o 2 cuerdas. Es 1 de las 3 variantes posibles para este ejercicio, en la que nos concentramos única y exclusivamente en la extensión del codo a lo largo del recorrido.$t$,
  execution=$t$Con la polea situada en posición alta, agarra la barra con un agarre prono y sitúate en la posición inicial a 1 o 2 pasos de ella; evita colocarte muy cerca, ya que generaría incomodidad con el cable y un trabajo menos eficiente, o excesivamente lejos, ya que tenderías a realizar una extensión de hombro con el deltoides posterior y el dorsal para poder realizar la extensión del codo. Para comenzar, sitúa el cable en tensión descendiendo la barra por delante de tu cuerpo y, comprimiendo bíceps y antebrazo, comienza a extender el codo evitando impulsos y movimientos con el cuerpo y con los hombros. Extiende los codos casi o por completo, aprieta los tríceps y vuelve a la posición inicial de forma lenta y controlada.$t$,
  cues=array[$t$Busca aplastar tu antebrazo y tu bíceps para después extender el codo.$t$,
    $t$El codo (tríceps) es el único que debe realizar el movimiento: céntrate en doblarlo y extenderlo mientras sujetas la barra, no en alejarla de ti.$t$,
    $t$Evita movimientos bruscos o rápidos, controla las fases concéntrica y excéntrica.$t$,
    $t$Evita impulsos e inercias con el torso y los hombros; busca estabilidad.$t$]::text[]
where id=395;

-- 396 · Extensiones desde Polea Alta con Barra V2
update exercises set
  description=$t$Esta variante de extensiones desde polea alta con barra para tríceps también puede realizarse con diferentes tipos de barras, como una recta, una Z o una barra V, así como con 1 o 2 cuerdas. En este caso, al contrario que en las otras 2 variantes, el hombro participa en el ejercicio de una forma secundaria, lo que la convierte en la variante más complicada y, por tanto, debe realizarse cuando se tenga un dominio total del gesto. Lo que se realiza es una ligera flexión de hombro en la que adelantamos un poco el codo, para después extender el hombro a la vez que se extiende el codo, y de esta forma buscar un mayor énfasis en la cabeza larga del tríceps. Pero el movimiento principal será la extensión del codo.$t$,
  execution=$t$Con la polea situada en posición alta, agarra la barra con un agarre prono y sitúate en la posición inicial a 2 o 3 pasos de ella; si te colocas más cerca, el hombro y el cable generarán incomodidad. Para comenzar, sitúa el cable en tensión descendiendo ligeramente la barra por delante de tu cuerpo, comprimiendo bíceps y antebrazo, pero con el hombro ligeramente flexionado, por lo que deberás sacar el codo ligeramente hacia delante, levantando el húmero. Desde aquí, comienza a extender el codo evitando impulsos con el cuerpo; mientras lo extiendes, lleva también el codo hacia atrás, extendiendo a la vez el hombro. Debe consistir en un movimiento de extensión de codo al que el hombro acompaña. Extiende por completo, aprieta los tríceps y vuelve a la posición inicial de forma lenta y controlada.$t$,
  cues=array[$t$Busca aplastar tu antebrazo y tu bíceps para después extender el codo.$t$,
    $t$El hombro acompaña en la subida, pero sin perder tensión, y se extiende en la bajada, aunque la barra debe moverse principalmente por la acción del codo.$t$,
    $t$Evita movimientos bruscos o rápidos, controla las fases concéntrica y excéntrica.$t$]::text[]
where id=396;

-- 397 · Extensiones desde Polea Alta con Barra V3 (antes «Extensiones desde Polea Alta Alta con Barra V3»)
update exercises set
  name=$t$Extensiones desde Polea Alta con Barra V3$t$,
  description=$t$De las 3 variantes o formas posibles de realizar unas extensiones para tríceps desde polea alta, podríamos decir que esta es la más sencilla. En esta variante, lo que hacemos es acercarnos a la polea y empujar hacia abajo, por lo que moveremos más peso, y además puede resultar mucho más fácil de realizar para usuarios menos avanzados. A pesar de que visualmente podría parecer que la participación del tríceps es menor, si realizamos el ejercicio bien, llevando los codos hacia atrás, se convierte en un gran ejercicio para trabajarlo.$t$,
  execution=$t$Con la polea situada en posición alta, agarra la barra con un agarre prono y sitúate a 1-2 pasos de la polea. Para comenzar, sitúa el cable en tensión descendiendo ligeramente la barra por delante de tu cuerpo, comprimiendo bíceps y antebrazo; acerca tu pecho y tus hombros al cable, situándolos justo encima de la barra, y lleva los codos lo más hacia atrás posible. Desde ahí, comienza a extender el codo sin usar impulsos, empujando la barra hacia abajo de forma similar a lo que harías en unos fondos. Mantén tus hombros sobre la línea de la barra durante todo el movimiento y continúa hasta extender por completo los codos; aprieta los tríceps y vuelve a la posición inicial de forma lenta y controlada. Piensa en llevar tus codos lo máximo posible hacia atrás durante la fase excéntrica, sin que se te abran lateralmente.$t$,
  cues=array[$t$Busca aplastar tu antebrazo y tu bíceps en cada repetición antes de extender el codo.$t$,
    $t$Posiciona el torso y los hombros sobre la línea de la barra.$t$,
    $t$Céntrate en llevar los codos hacia atrás, evita que se abran lateralmente.$t$,
    $t$Es un movimiento de extensión del codo con un ligero patrón de empuje.$t$,
    $t$Controla que las fases concéntrica y excéntrica no sean rápidas y bruscas.$t$]::text[]
where id=397;

-- 398 · Press Francés desde Polea Baja
update exercises set
  description=$t$Esta variante de press francés se realiza con polea baja y puede utilizarse con distintas barras, como una recta o una barra EZ, u otro tipo de agarre, como una cuerda o unas muñequeras, según comodidad. En los rompecráneos y en las variantes de press francés con peso libre, la tensión en la parte final del recorrido suele desaparecer, por lo que esta resulta una buena alternativa. Además, bien realizado, permite añadir una ligera extensión de hombro en la fase concéntrica a la vez que extendemos el codo.$t$,
  execution=$t$Túmbate en un banco, pudiendo apoyar los pies en el suelo o sobre él, con la polea detrás, y coge el agarre que vayas a utilizar: si es una barra, generalmente una anchura igual a la de los hombros o ligeramente superior suele ir bien, pero cada persona podrá abrirlo o cerrarlo buscando aquel que le permita pegar los codos a la línea del cuerpo y le dé mejores sensaciones; puedes rodear o no la barra con el pulgar. Partiendo de tumbado, con el agarre por detrás de tu cabeza, sitúa los brazos casi en perpendicular a tu cuerpo y comienza a extender los codos (puedes sumar el hombro también al movimiento) hasta situar el brazo extendido en perpendicular a tu cuerpo, con la palma de la mano hacia el techo. Desde aquí, regresa de forma lenta y controlada a la posición inicial, evitando que las placas choquen y pierdan tensión. Busca comprimir, en la medida de lo posible, tu bíceps y tu antebrazo en cada repetición. Intenta que no se te abran en exceso los codos y que el movimiento sea controlado; no es necesario llegar a bloquear los codos por completo si lo sientes mejor.$t$,
  cues=array[$t$Busca aplastar tu bíceps contra tu antebrazo en cada repetición.$t$,
    $t$Céntrate en extender el codo, pero si controlas perfectamente el movimiento, puedes añadir cierta extensión de hombro al gesto.$t$,
    $t$Controla la alineación de tus codos, que no se abran en exceso.$t$]::text[]
where id=398;

-- 399 · Tate Press con Mancuernas
update exercises set
  description=$t$El tate press con mancuernas es un buen ejercicio para el trabajo de tríceps. Puede ser similar a un rompecráneos, pero dirigiendo los codos hacia afuera. Es un ejercicio que puede realizarse con mancuernas con un agarre prono en su variante normal, y en el que también podríamos utilizar 2 kettlebells, lo que puede resultar muy cómodo para algunas personas. También puede realizarse tanto de forma bilateral, con ambos brazos a la vez, ahorrando tiempo, como unilateral, algo recomendado si no acabas de sentirte del todo cómodo al realizar el ejercicio; además, te permitirá tocarte el tríceps con la mano libre para sentirlo más, o darle más estabilidad al codo sujetándolo con esa mano en caso de necesitarlo.$t$,
  execution=$t$Túmbate en un banco y, según tus necesidades, selecciona 1 o 2 mancuernas o kettlebells. Colócalas sobre tu pecho para quitar toda la tensión y poder tener un buen agarre y una buena colocación; desde aquí, apunta con los codos hacia afuera, lo más lateralmente posible, aplastando en la medida de lo posible tus bíceps y antebrazos. Desde aquí, comienza a extender los codos, buscando que el movimiento se produzca únicamente en esta articulación; evita empujar con los hombros hacia arriba como en un press, o separar las manos lateralmente como si estuvieras en la fase excéntrica de unas aperturas: extiende el codo. Una vez extendidos casi o por completo, según comodidad personal, comienza a descender de forma controlada hasta la posición inicial, pudiendo apoyar o no la carga sobre el pecho.$t$,
  cues=array[$t$Busca llevar los codos lo más lateralmente que puedas; no los pegues a tu torso ni lo conviertas en un Hex Press.$t$,
    $t$Sujeta las mancuernas cerca del tope superior, de forma que hagan contacto con tu mano para mayor estabilidad y seguridad en la muñeca.$t$,
    $t$Al extender los codos aprieta los tríceps, pero evita que haya movimientos con el hombro que desplacen la mancuerna (como en un press o unas aperturas).$t$,
    $t$Dirige las pesas hacia tu pectoral, aplastando tu antebrazo y tu bíceps; puedes apoyarlas, o no, en el pecho según comodidad.$t$]::text[]
where id=399;

-- 400 · Extensión Unilateral / Patada en Polea Alta (antes «Extensión Unilateral/ Patada en Polea Alta»)
update exercises set
  name=$t$Extensión Unilateral / Patada en Polea Alta$t$,
  description=$t$Esta variante de extensión de codo es una de las más populares en el gimnasio; se trata de un buen ejercicio, pero hay varios aspectos a tener en cuenta para evitar convertirlo en una mala alternativa. Al igual que en otros ejercicios sin flexión de hombro, el brazo se encuentra alineado con el torso o ligeramente adelantado, y al realizarlo debemos priorizar la extensión del codo sin utilizar inercias, impulsos con el hombro ni balanceos. Cabe destacar que, a la hora de seleccionar ejercicios, mucha gente solo se fija en si son con peso libre, poleas o peso corporal, pero en este ejercicio la estabilidad y la alineación son mucho más relevantes. En este caso, la parte inicial del ROM, hasta aproximadamente los 90º de extensión, es donde tendremos más tensión y resistencia. Otro factor a considerar es el agarre: por comodidad, se recomienda priorizar el uso de muñequeras y agarre neutro.$t$,
  execution=$t$Con la polea alta, coge el cable con una muñequera y, preferentemente, un agarre neutro, y comienza el movimiento situando los codos de forma que tus brazos queden más o menos paralelos a tu torso, con algo de flexión de hombro durante la fase excéntrica previa a la extensión. Desde aquí, comienza a extender el codo de forma controlada; puedes adelantar ligeramente los brazos para buscar un mayor brazo de momento, enfatizando la extensión, si así lo quieres, pero lo más común es extenderlo en línea con el torso hasta bloquear el codo y, una vez ahí, volver de forma controlada a la posición inicial.$t$,
  cues=array[$t$Mantén los hombros estables y no te impulses con ellos.$t$,
    $t$No acortes el ROM; busca comprimir el bíceps con tu antebrazo.$t$,
    $t$No arquees el cuerpo ni uses la inercia corporal; busca una técnica limpia desde el codo, que añada más estímulo y no más fatiga.$t$]::text[]
where id=400;

-- 401 · Patada de Tríceps desde Polea Baja (antes «Patada de Triceps desde Polea Baja»)
update exercises set
  name=$t$Patada de Tríceps desde Polea Baja$t$,
  description=$t$Esta variante tiene la postura corporal de una patada de burro con mancuerna, es decir, con el torso inclinado casi paralelo al suelo, pero en lugar de usar una carga gravitacional, en la que la resistencia es vertical, tenemos la polea delante de nosotros, por lo que la línea de resistencia es paralela al suelo. En este caso, el punto de mayor tensión del ROM se da con el codo en torno a 90º, y a partir de ahí la resistencia será menor. Por el contrario, si queremos mayor tensión en la extensión completa, la patada con mancuerna sería la opción adecuada. Aunque no se trata de elegir una u otra variante, sino de saber conjugar ejercicios con distintas curvas de resistencia, sí podríamos decir que se trata de un mejor ejercicio que la patada de tríceps con mancuerna convencional.$t$,
  execution=$t$Colócate con el torso horizontalizado en relación al suelo mientras te agarras con la mano libre a un apoyo para generar estabilidad, con la polea a una altura ligeramente inferior a tus hombros, y sujeta el agarre utilizando preferentemente una muñequera, una cuerda o directamente el propio cable. A continuación, pon el cable en ligera tensión y bloquea todo el cuerpo salvo la articulación del codo, que será la única parte móvil; desde aquí, extiende el codo. Una vez alcancemos la máxima extensión, realizaremos una fase excéntrica controlada, tratando de comprimir el bíceps con el antebrazo en cada repetición.$t$,
  cues=array[$t$Mantén el torso inmóvil, empuja y sujétate con la mano libre contra el apoyo.$t$,
    $t$No acortes el ROM; piensa en comprimir el bíceps con el antebrazo.$t$,
    $t$No te impulses con el cuerpo ni con los hombros; busca un movimiento puro desde el tríceps.$t$]::text[]
where id=401;

-- 402 · Press Francés en Máquina
update exercises set
  description=$t$Pese a la mala fama que algunas personas atribuyen a las máquinas frente al peso libre, en este caso, al igual que en muchos otros, se trata de un buen ejercicio; de hecho, en las trayectorias pendulares, la resistencia traza el mismo patrón de movimiento que ejecuta la articulación. Se trata de un ejercicio en el que estamos con flexión de hombro respecto al torso, donde además la máquina ofrece un perfil de resistencia más adecuado que su variante en peso libre. Al ser un ejercicio guiado y estable, no suele dar molestias ni problemas y permite exprimir muy bien el ejercicio.$t$,
  execution=$t$Colócate en la máquina sentado y, normalmente con un agarre neutro, busca la mejor alineación posible, teniendo en cuenta que la máquina ya te marca la forma y el movimiento guiado. Apoya el tríceps sobre la almohadilla mientras sujetas las manetas y mantén el codo sin desplazarlo en todo momento durante la ejecución, asegurándote de que solo hay movimiento a través del codo. Parte de la flexión de codo previa a la extensión, doblándolo al máximo, y comienza a extender de forma controlada hasta completar el movimiento; una vez ahí, puedes aguantar un segundo en la máxima tensión y volver a la posición inicial realizando una fase excéntrica lenta y controlada.$t$,
  cues=array[$t$Mantén los brazos apoyados en el acolchado durante todo el movimiento.$t$,
    $t$Empuja con ambos brazos por igual.$t$,
    $t$No acortes el ROM; busca comprimir, en la medida de lo posible, bíceps y antebrazo.$t$]::text[]
where id=402;

-- 403 · Extensiones de Codo desde Pecho
update exercises set
  description=$t$Esta variante de tríceps, popularizada por Kassem, coincide en gran medida con un movimiento similar a un press francés, con los brazos colocados aproximadamente a 90º respecto al torso; sin embargo, a su vez se encuentran en rotación interna, aunque realmente esto no afecta a la extensión del codo, debido a que la relación longitud-tensión del tríceps depende principalmente de la extensión en el plano sagital y no tanto de otros planos. Podría ser un ejercicio parecido a un cable tate press, pero de pie, que permite una buena alineación. Además, el punto desde donde parte el cable determina los picos de tensión máxima en puntos diferentes del ROM: concretamente, un cable situado a la altura del agarre ofrecerá su pico de tensión en torno a los 90º de extensión del codo.$t$,
  execution=$t$Colócate de pie, de espaldas a la estación de poleas; preferentemente, coge los cables cruzándolos de lado y pasando por detrás de tu cabeza, aunque también podrían cruzarse por delante de ti, e incluso coger los cables del mismo lado si te resulta más cómodo y consigues una buena alineación. Desde aquí, tensa ligeramente los cables mientras comprimes tu antebrazo con tu bíceps antes de la extensión. Comienza a extender los codos hasta bloquearlos o casi, realizando el movimiento con control e intención y evitando impulsos con los hombros o el torso. Una vez arriba, realiza una suave transición hacia la fase excéntrica, volviendo a la posición inicial poco a poco.$t$,
  cues=array[$t$Busca alinear lo mejor posible la trayectoria, los cables y tus brazos.$t$,
    $t$Céntrate solo en extender los codos; evita trampear añadiendo impulso con el torso o los hombros.$t$,
    $t$No acortes el ROM, piensa en comprimir antebrazo y bíceps en cada repetición.$t$]::text[]
where id=403;

-- 404 · Patada de Tríceps desde Polea Alta Tumbado (antes «Patada de Triceps desde Polea Alta Tumbado»)
update exercises set
  name=$t$Patada de Tríceps desde Polea Alta Tumbado$t$,
  description=$t$Esta variante de extensiones de codo o patada de tríceps puede resultar algo extraña al principio para algunas personas, pero, al estar tumbado y con el cable tirando desde atrás, ofrece un perfil de resistencia superior al de la patada con mancuerna. Puede ser especialmente interesante en personas que tienden a impulsarse en otros ejercicios de tríceps, ya que tumbado no será posible.$t$,
  execution=$t$Túmbate en un banco o una colchoneta, situándote de forma que los cables no choquen entre sí, y busca tener el máximo ROM posible. La resistencia debe salir por detrás de tu cabeza. Utiliza una doble cuerda de tríceps o 2 cuerdas independientes para que tu propio cuerpo no limite el ROM; también puedes usar 2 poleas a mano cambiada para conseguir una mayor alineación del codo con la línea de resistencia. Bloquea tu cuerpo y asegúrate de que el codo es la única articulación móvil; agarra las cuerdas con un agarre neutro y comienza a extender los codos hasta bloquearlos casi o por completo. Regresa a la posición inicial de forma lenta y controlada, evitando movimientos excesivos de hombro.$t$,
  cues=array[$t$Mantén la alineación en todo el recorrido, puedes usar 1 o 2 cuerdas.$t$,
    $t$Puedes mantener un segundo la contracción en la extensión.$t$,
    $t$Asegúrate de llegar a una flexión de codo máxima antes de la extensión.$t$]::text[]
where id=404;

-- 405 · Curl de Bíceps con Barra de Pie
update exercises set
  description=$t$Este típico ejercicio de bíceps puede realizarse tanto con barra recta como con barra EZ, según la comodidad de tus muñecas. No uses un agarre muy cerrado, sino uno similar a la anchura de los hombros o ligeramente superior; también puede utilizarse un agarre ligeramente más estrecho, aunque no suele ser del todo cómodo. En este ejercicio es muy común ver la intención de mover el máximo peso posible a costa de arquear la espalda e impulsarse con la cadera; evítalo.$t$,
  execution=$t$Partiendo de pie, desde una posición estable, para lo que nos ayudaremos manteniendo activados abdomen y glúteo a lo largo del movimiento, sujetaremos la barra en posición supina. Desde aquí, con la barra por delante del cuerpo, comenzaremos a flexionar los codos sin balancear el cuerpo, prestando especial atención a este factor. Ejecuta el movimiento de forma controlada y continúa elevando la barra hasta tocar el bíceps con el antebrazo; en los últimos grados de movimiento puedes adelantar ligeramente los codos si así sientes mayor activación. Durante todo el movimiento, evita que se te abran los codos, llevando el movimiento siempre en el plano sagital y evitando así compensar con otros músculos.$t$,
  cues=array[$t$Céntrate en el movimiento del codo.$t$,
    $t$No te impulses con la cadera ni con la espalda; mantén tu cuerpo estable.$t$,
    $t$No te centres en llevar la barra lo más alto posible adelantando los codos en exceso, sino en intentar tocar el bíceps con el antebrazo.$t$,
    $t$Controla la fase excéntrica, no dejes caer la barra demasiado rápido.$t$]::text[]
where id=405;

-- 406 · Curl Martillo con Mancuernas
update exercises set
  description=$t$El curl martillo es una flexión de codo en la que, en lugar de realizar el gesto en posición supina, lo haremos en posición neutra. Se trata de un muy buen ejercicio para el trabajo de los flexores del codo, pero suele realizarse con muchos errores, como hacer grandes impulsos o llevar las mancuernas cruzadas hacia el pecho, dentro del plano frontal, en lugar de mantener el movimiento en el plano sagital y realizar una flexión de codo. También puede añadirse una ligera flexión de hombro al final.$t$,
  execution=$t$Partiendo de pie, desde una posición estable, manteniendo activados abdomen y glúteo durante todo el movimiento, agarraremos las mancuernas a los lados del cuerpo como si fueran unos martillos (o raquetas de pádel); si sientes que te falla el agarre, puedes sostenerlas más cerca de la parte superior para que esta haga de tope y no se escurran. Desde esta posición, comienza un ascenso controlado sin realizar impulsos ni inercias, doblando el codo y buscando tocar el bíceps con el antebrazo, ya que no es necesario llevar las mancuernas más arriba. Controla la bajada: no dejes caer las mancuernas ni las lleves hacia atrás.$t$,
  cues=array[$t$Céntrate en el movimiento del codo: con el antebrazo, busca el bíceps.$t$,
    $t$No te impulses con la cadera ni con la espalda; mantén tu cuerpo estable.$t$,
    $t$No rotes las muñecas durante el movimiento, mantenlas neutras.$t$,
    $t$No cruces ni lleves las mancuernas al pecho.$t$]::text[]
where id=406;

-- 407 · Curl con Barra Romana
update exercises set
  description=$t$Al igual que en el curl martillo, este movimiento se realiza en posición neutra, con la salvedad de que la propia barra impedirá los movimientos de muñeca y, por tanto, si no tenemos un buen control del gesto, puede ser una alternativa. Algunas personas convierten erróneamente este curl en un gesto similar a una elevación frontal: realiza el movimiento desde los codos, no desde los hombros.$t$,
  execution=$t$Partiendo de pie, desde una posición estable, para lo que nos ayudaremos manteniendo activados abdomen y glúteo, sujetaremos la barra romana por delante de nuestra cadera; el agarre será generalmente igual o más estrecho que la anchura de los hombros. Desde esta posición, comenzaremos a elevar la barra centrándonos únicamente en doblar el codo y buscando colocar el antebrazo prácticamente perpendicular al suelo; evita impulsos, balanceos e inercias innecesarias con el cuerpo. Una vez completada la flexión y con el antebrazo comprimiendo el bíceps, comenzamos el descenso de forma controlada, sin echar el cuerpo hacia delante, hasta alcanzar de nuevo la posición inicial.$t$,
  cues=array[$t$No te impulses con la cadera ni con la espalda.$t$,
    $t$La fuerza debe partir desde el codo, no desde los hombros: no es una elevación frontal.$t$]::text[]
where id=407;

-- 408 · Curl de Bíceps Mancuernas
update exercises set
  description=$t$Esta variante de curl de bíceps puede realizarse tanto de pie como sentado; el gesto del codo no variará y, sin embargo, al realizarlo sentados eliminamos la posibilidad de hacer impulsos e inercias desde glúteos y piernas. Pese a todo, igualmente se debe activar el abdomen, evitando además curvar la espalda y trampear con ella, realizando el movimiento puramente desde el codo.$t$,
  execution=$t$Sentados en un banco plano, valora si tiendes a curvar la espalda durante la ejecución y, en tal caso, utiliza un respaldo para evitarlo, aunque no es necesario. Partimos con el torso erguido, los codos extendidos y las mancuernas colocadas una a cada lado del banco con un agarre neutro o martillo; desde aquí, iniciaremos la flexión de codo y realizaremos progresivamente una supinación de la muñeca a lo largo de la fase concéntrica, hasta colocar el antebrazo prácticamente perpendicular al suelo. Puedes añadir una ligera flexión de hombro si te ayuda a sentir mejor el ejercicio, y trata de no perder tensión en la parte alta del movimiento: simplemente busca tocar el bíceps con el antebrazo. Con las mancuernas arriba, desciende de forma controlada sin balancear los brazos, deshaciendo la supinación hasta alcanzar de nuevo la posición neutra, con las mancuernas a los lados.$t$,
  cues=array[$t$Céntrate en el movimiento del codo: antebrazo a tocar bíceps.$t$,
    $t$No te impulses con la espalda; mantén tu abdomen activado.$t$,
    $t$No balancees los hombros para subir la mancuerna con inercias.$t$]::text[]
where id=408;

-- 409 · Drag Curl con Barra
update exercises set
  description=$t$Este ejercicio, popularizado por Meadows, puede realizarse tanto con barra recta como con barra EZ, según la comodidad de la muñeca y la disponibilidad. No escojas un agarre muy cerrado, sino similar a la anchura de los hombros o ligeramente superior, y recuerda que los hombros deben permanecer en extensión a medida que se produce la flexión del codo, con el objetivo, en la medida de lo posible, de dar un mayor estímulo a la cabeza larga del bíceps. Es un ejercicio complejo, por lo que, si tu torso o tus hombros se mueven en exceso, prueba a apoyar la espalda contra una columna o una pared para solucionarlo.$t$,
  execution=$t$Partiendo de pie, desde una posición estable y, en caso de ser necesario, incluso apoyados contra un respaldo o una columna, cogeremos una barra con un agarre supino, con una anchura similar o ligeramente superior a la anchura de los hombros, pudiendo o no rodear la barra con el pulgar según comodidad. Con la barra por delante de tus caderas, comienza a elevarla en vertical mientras llevas tus codos ligeramente por detrás de la línea de tus hombros, situando el hombro en extensión, y realiza la flexión del codo evitando impulsos e inercias hasta comprimir el antebrazo y el bíceps. Termina el movimiento apretando el bíceps y descendiendo la barra de forma controlada hasta la posición inicial nuevamente.$t$,
  cues=array[$t$Realiza ambos movimientos a la vez: flexiona el codo mientras lo llevas atrás.$t$,
    $t$La trayectoria de la barra es prácticamente perpendicular al suelo.$t$,
    $t$El gesto principal debe ser la flexión del codo.$t$,
    $t$No es necesario realizar un agarre activo rodeando con el pulgar.$t$]::text[]
where id=409;

-- 410 · Curl Tumbado en Banco Inclinado con Mancuernas
update exercises set
  description=$t$Este ejercicio es una de las mejores variantes para el trabajo del bíceps, especialmente de su cabeza larga, al facilitar la extensión de hombro situándonos en un banco inclinado a unos 45-80º, y aporta además una posición de gran estabilidad en la que no tenemos la posibilidad de hacer fuerza o impulsos con el tren inferior, por lo que, si lo realizamos correctamente, se convierte en una gran opción para trabajar el bíceps.$t$,
  execution=$t$Coloca un banco, según comodidad, posibilidades y movilidad de hombro, en una posición de entre 45º y 80º. Coge unas mancuernas y siéntate en el banco extendiendo los brazos a los lados; al hacerlo, tus bíceps deben estar prácticamente perpendiculares al suelo, con tu hombro y tu codo retrasados en relación al torso. Desde aquí, sitúa tus manos en un agarre neutro, supino o intermedio; independientemente del que escojas, debes terminar con las manos en posición supina, por lo que, si partes desde neutro, deberás rotar la muñeca mientras asciendes. Comienza a elevar las mancuernas sin mover el hombro, evitando balanceos con los brazos que pudieran impulsarte en la fase concéntrica. Una vez alcanzada la parte alta del movimiento, desciende de forma controlada hasta la posición de partida de nuevo.$t$,
  cues=array[$t$Céntrate en el movimiento del codo y no muevas el hombro.$t$,
    $t$Evita balancear los brazos para aprovechar el impulso: no debe ser un péndulo.$t$,
    $t$El bíceps debe quedar prácticamente vertical una vez te sientes.$t$,
    $t$Utiliza preferentemente un agarre supino, aunque puedes partir desde neutro.$t$]::text[]
where id=410;

-- 411 · Curl Bayesian en Polea Sentado
update exercises set
  description=$t$El curl bayesian, popularizado por Menno Henselmans, es un ejercicio en el que también buscamos dar un estímulo mayor a la cabeza larga del bíceps al partir de una extensión de hombro. Tiene variantes de pie o sentado; en esta ocasión, al realizarlo sentado, tenemos la ventaja de la mayor estabilidad que aporta el respaldo del banco a la hora de aplicar fuerza y centrarnos únicamente en la flexión del codo.$t$,
  execution=$t$Coloca unas poleas en la posición más baja y un banco con un respaldo a 80-90º según comodidad. Siéntate y coge los agarres independientes, uno a cada lado de tu cuerpo, utilizando un agarre supino y colocando tu brazo (hombro y codo) por detrás de la línea de tu torso antes de comenzar el movimiento, con el cable en ligera tensión inicial. Desde esta posición, y manteniendo el codo atrasado, comienza a flexionarlo tirando del cable hasta elevar tu mano a una altura igual o ligeramente superior a la línea de tu pectoral; una vez alcanzado este nivel, estruja el bíceps y desciende de forma controlada hasta la posición inicial, evitando perder tensión y descensos excesivamente rápidos del cable.$t$,
  cues=array[$t$Empújate contra el banco y ancla los pies para generar mayor estabilidad y poder aplicar mejor fuerza con los codos.$t$,
    $t$El movimiento debe ser lento y controlado; evita movimientos bruscos.$t$,
    $t$Prueba a añadir una ligera contracción isométrica en lo más alto, arderá tu bíceps.$t$]::text[]
where id=411;

-- 412 · Curl Predicador con Mancuerna Unilateral
update exercises set
  description=$t$Esta variante de curl de bíceps parte con el brazo adelantado con respecto a la posición de tu torso, con el objetivo de estimular ligeramente más la cabeza corta del bíceps. Realizarlo con mancuerna de forma unilateral en un banco inclinado permite, en la mayoría de casos, una mejor alineación de la línea de fuerza con el bíceps durante el movimiento, además de, generalmente, una mayor comodidad y mejores sensaciones que realizarlo con barra libre en un banco Scott.$t$,
  execution=$t$Colócate detrás de un banco con una inclinación de entre 45º y 60º, coge la mancuerna con agarre supino y sitúa el hombro por delante del cuerpo, apoyando el codo en el banco. Desde aquí, desciende la mancuerna poco a poco, extendiendo el codo de forma controlada y alejando la mancuerna de ti; evita realizar una extensión completa: puedes dejar unos 5-10º antes de tocar el banco con la mancuerna y comenzar con la fase concéntrica. Desde este punto más bajo, contrae el bíceps para comenzar a elevar la mancuerna, evitando que se te levante el codo del banco e impulsarte con tu cuerpo y tu hombro para subirla. Continúa la fase concéntrica hasta alcanzar aproximadamente la línea vertical de la gravedad con tu codo, y vuelve a bajar.$t$,
  cues=array[$t$Evita impulsarte con el torso o la cadera echándote hacia atrás para subir la mancuerna: el movimiento lo debe realizar puramente el codo.$t$,
    $t$Intenta no despegar el codo del banco durante el movimiento.$t$,
    $t$Evita que el codo se estire por completo en la fase excéntrica; no es necesario.$t$,
    $t$Evita en la fase concéntrica que la mancuerna pase la línea vertical de la gravedad respecto a tu codo, ya que el bíceps no estaría trabajando.$t$]::text[]
where id=412;

-- 413 · Curl Predicador en Máquina
update exercises set
  description=$t$Este ejercicio tiene el objetivo de estimular ligeramente más la cabeza corta del bíceps, al realizarse con el hombro en flexión. La realización en máquina de este ejercicio presenta una curva de resistencia diferente: generalmente, al realizarse con peso libre, es más duro en la parte baja del ejercicio y después se vuelve más sencillo, mientras que en máquina está más igualado a lo largo de todo el recorrido, aunque dependerá de la máquina (cables, placas, plate-loaded) y de su diseño.$t$,
  execution=$t$Sentado en la máquina, busca una posición estable situando los pies sobre los soportes o uno adelantado respecto al otro, pero evita que se despegue el glúteo del asiento a lo largo del movimiento para impulsarte con el torso. Apoya los codos en el banco y sujeta con ambas manos, mediante un agarre supino, la barra de la máquina; despégala con una ligera tensión inicial y comienza a elevarla sin despegar los codos del banco en ningún momento. Una vez alcanzado el ROM activo completo, comienza a descender de forma controlada, evitando movimientos bruscos.$t$,
  cues=array[$t$Evita impulsarte con el torso o levantar el culo del asiento para subir la carga.$t$,
    $t$Intenta no despegar el codo del banco durante el movimiento.$t$,
    $t$Evita que el codo se estire por completo en la fase excéntrica; no es necesario.$t$]::text[]
where id=413;

-- 414 · Curl Predicador en Polea Unilateral
update exercises set
  description=$t$Esta variante de predicador, en la que seguimos buscando, al igual que en las anteriores, tener el brazo adelantado respecto al hombro, se convierte en una muy buena opción en muchos casos, como, por ejemplo, cuando no dispongamos de la máquina y busquemos tensión constante, o cuando queramos mantener las ventajas de realizarlo en banco inclinado con mancuerna en cuanto a alineación, pero con la tensión constante de un cable.$t$,
  execution=$t$Colócate detrás de un banco con una inclinación de entre 45º y 60º, coge un agarre de cruces con la muñeca en supinación y sitúa el hombro por delante del cuerpo, apoyando el codo en el banco y manteniéndolo prácticamente extendido, pero sin llegar a extenderlo por completo (deja unos 5-10º). Desde aquí, comienza a tirar del cable poco a poco, de forma controlada, pensando en acercar la mano a tu hombro, pero sin llegar a hacerlo; una vez alcanzado el máximo ROM activo, puedes añadir una ligera contracción isométrica, y comienza a alejar la mano de ti, realizando la fase excéntrica de forma controlada hasta volver a la posición inicial.$t$,
  cues=array[$t$Evita impulsarte con el torso o la cadera echándote hacia atrás para subir el agarre: el movimiento lo debe realizar puramente el codo.$t$,
    $t$Intenta no despegar el codo del banco durante el movimiento.$t$,
    $t$Evita que el codo se estire por completo en la fase excéntrica; no es necesario.$t$]::text[]
where id=414;

-- 415 · Curl desde Polea Baja con Barra
update exercises set
  description=$t$Realizar este ejercicio en polea nos ofrece una curva de resistencia diferente a su realización con barra libre, que es más difícil en la zona media del recorrido, justo donde el bíceps es más fuerte; en polea, en cambio, el cable mantiene la tensión también en las zonas superior e inferior del recorrido. Es muy común ver errores al realizarlo, como ayudarse excesivamente con el torso, los hombros y las piernas, que suelen derivarse de un exceso de carga. Se puede realizar con barra recta, V o EZ.$t$,
  execution=$t$Sitúate frente a la polea enganchando la barra que vayas a utilizar, preferentemente una EZ con enganche de polea. Agáchate y cógela mediante un agarre supino, pudiendo rodear o no la barra con el pulgar, y con una anchura igual o ligeramente superior a la de tus hombros. Aléjate un pequeño paso hacia atrás para situar el cable en ligera tensión y comienza a subir la barra centrándote en comprimir tu bíceps contra tu antebrazo; durante el movimiento, debes mantener los codos fijos para centrar el trabajo sobre el bíceps. Lo que debes evitar a toda costa son los balanceos e impulsos con el cuerpo (incluidos los hombros y la espalda). Una vez alcanzada la altura máxima, desciende la barra de forma controlada, evitando gestos bruscos, rápidos o perder tensión.$t$,
  cues=array[$t$Céntrate en el movimiento del codo durante todo el recorrido.$t$,
    $t$No te impulses con la cadera ni con la espalda; mantén tu cuerpo estable: puedes mantener glúteo y abdomen activados en todas las fases.$t$,
    $t$Evita que tus codos se abran hacia afuera: deben moverse solo en el plano sagital.$t$]::text[]
where id=415;

-- 416 · Curl Araña con Mancuernas
update exercises set
  description=$t$Esta variante, conocida como curl araña, se trabaja apoyado en un banco inclinado aproximadamente entre 45º y 60º, lo que sitúa el hombro en flexión, de forma similar a lo que ocurre en un curl predicador, con el objetivo de estimular ligeramente más la cabeza corta del bíceps. Sin embargo, puede ser una mejor opción en muchos casos para este objetivo, ya que permite una mayor tensión a lo largo de más recorrido, especialmente en la parte alta, al realizarse con pesos libres. En esta variante, además, trabajar con mancuernas puede resultar más cómodo a nivel de muñeca para muchas personas si no contamos con una barra EZ.$t$,
  execution=$t$Coge unas mancuernas, una a cada lado de tu cuerpo, y túmbate apoyando el pecho y todo tu peso en un banco inclinado; recuerda apoyar los pies en el suelo si puedes y aplicar fuerza para anclarte bien. Saca los hombros ligeramente por los lados de la parte alta del banco, dejando las mancuernas colgando en línea con tus hombros y codos. Flexiona ligeramente los codos para situar los bíceps en ligera tensión y comienza a elevar las mancuernas tratando de aplastar antebrazo y bíceps, evitando impulsos y balanceos. Una vez alcanzada la parte más alta del recorrido, desciende de forma controlada, evitando bajadas rápidas.$t$,
  cues=array[$t$Sitúate estable sobre el banco; a ser posible, apoya los pies en el suelo ejerciendo presión. Apoya todo tu peso en el banco y evita moverte.$t$,
    $t$Evita balancear las mancuernas, los brazos o los hombros. Nunca deberían pasar la línea perpendicular de la gravedad con el suelo (sería un movimiento excesivo de hombros).$t$,
    $t$Evita movimientos rápidos o bruscos, controla la fase excéntrica.$t$]::text[]
where id=416;

-- 417 · Curl Araña con Barra
update exercises set
  description=$t$Esta variante de curl araña con barra busca estimular ligeramente más la cabeza corta del bíceps, apoyados en un banco con una inclinación de entre 45º y 60º. Al igual que con mancuernas, mantiene la tensión en la parte alta del movimiento, pero el agarre fijo de la barra puede resultar incómodo para algunas personas; en ese caso, puede ser mejor optar por una barra EZ o por mancuernas.$t$,
  execution=$t$Coge la barra con un agarre supino y una anchura ligeramente superior o igual al ancho biacromial. Sácala por la parte alta del banco mientras te colocas apoyando todo tu peso y el pecho en él, y apoya las piernas en el suelo ejerciendo presión para estar más estable, si puedes. Deja colgar la barra en línea con tus hombros y codos, flexionando ligeramente los codos para situar los bíceps en ligera tensión. Desde aquí, comienza a elevar la barra tratando de mantener el hombro quieto y evitando impulsos y balanceos. Una vez alcanzada la parte más alta del recorrido, desciende de forma controlada, evitando bajadas rápidas.$t$,
  cues=array[$t$Sitúate estable sobre el banco; a ser posible, apoya los pies en el suelo ejerciendo presión. Apoya todo tu peso en el banco y evita moverte.$t$,
    $t$Evita balancear la barra, los brazos o los hombros. Nunca deberían pasar la línea perpendicular de la gravedad con el suelo (sería un movimiento excesivo de hombros).$t$,
    $t$Evita movimientos rápidos o bruscos, controla la fase excéntrica.$t$]::text[]
where id=417;

-- 418 · Curl Araña en Polea
update exercises set
  description=$t$En esta variante de curl araña, en la que seguimos adelantando el codo en el recorrido para dar ese ligero estímulo superior a la cabeza corta, contamos con la tensión constante del cable al realizarlo desde polea baja, y con una dirección de la fuerza diferente, que deja de ser la de la gravedad, por lo que la curva de resistencia cambia respecto a las variantes anteriores. Puede realizarse con barra V, recta o EZ.$t$,
  execution=$t$Coloca el banco a 45-60º de inclinación, coge la barra seleccionada con un agarre supino, pudiendo rodearla o no con el pulgar, y sitúate agarrándola con el banco entre las piernas. Ahora apoya tu pecho en el banco y los pies en el suelo, ejerciendo fuerza si puedes, y saca los hombros, los brazos y la barra por la parte alta del banco; esto ya generará una ligera tensión sobre tus bíceps. Comienza la fase concéntrica de forma controlada, elevando la barra. Una vez alcanzada la parte más alta, evitando tirones del cable, puedes añadir una ligera contracción isométrica si quieres y comenzar la fase excéntrica con un descenso controlado hasta la posición inicial de nuevo, evitando dejar los brazos muertos y perder tensión.$t$,
  cues=array[$t$Sitúate estable sobre el banco; a ser posible, apoya los pies en el suelo ejerciendo presión. Apoya todo tu peso en el banco y evita moverte.$t$,
    $t$No pegues un tirón del cable ni bajes rápido. Controla el movimiento.$t$]::text[]
where id=418;

-- 419 · Curl en Máquina Sentado
update exercises set
  description=$t$Para la realización de este ejercicio contaremos con una máquina de placas o discos que sitúa el hombro en una ligera extensión durante el movimiento, para buscar un ligero énfasis sobre la cabeza larga del bíceps. La curva de resistencia podrá cambiar en función del diseño de la máquina. Otras alternativas, como el curl bayesian sentado, pueden ser una mejor opción en caso de no contar con la máquina o no tener buenas sensaciones con ella.$t$,
  execution=$t$Sentado en la máquina, con los pies apoyados en el suelo, empújate contra el banco para generar una posición estable durante todo el recorrido. Coge los agarres de forma supina y flexiona muy ligeramente los codos para generar tensión sobre los bíceps. Desde aquí, comienza a subir de forma controlada sin despegar el codo del apoyo y evitando desplazar los hombros para impulsarte. Una vez alcanzado el máximo ROM posible sin que se despeguen los codos, puedes añadir una ligera contracción isométrica y comenzar la fase excéntrica, descendiendo de forma controlada hasta la posición inicial y dejando unos pocos grados (5-10º) de extensión de codo por realizar para evitar perder tensión.$t$,
  cues=array[$t$Empújate contra la máquina y con los pies contra el suelo para estar estable.$t$,
    $t$Evita despegar los codos de la máquina, mantenlos pegados.$t$,
    $t$Evita extender por completo los codos; mantén siempre la tensión.$t$]::text[]
where id=419;

-- 420 · Curl Predicador de Pie desde Polea Baja
update exercises set
  description=$t$Esta variante de predicador se realiza de pie, como en otras, por lo que es fácil acabar haciéndola de forma errónea si te centras en mover la máxima carga posible y no en la técnica. Se trata de un ejercicio en el que igualmente situamos nuestro codo por delante de la línea del hombro para buscar un mayor estímulo en la cabeza corta del bíceps. Es una variante interesante gracias a la tensión constante que aporta el cable y a la poca necesidad de estabilización. Un error común es inclinarse hacia atrás e impulsarse para mover la carga. También puede realizarse de forma unilateral si dispones de 1 sola polea.$t$,
  execution=$t$Sitúate frente a las poleas, colocadas en su posición más baja, sujetando 2 agarres de cruces con un agarre supino. Sepárate de la polea 2-3 pasos para situar tus brazos en ligera tensión y evita que se te abran lateralmente: mantenlos alineados con los cables en la medida de lo posible. Comienza a contraer evitando impulsos con el cuerpo o inclinarte hacia atrás; mantén tu posición estable mientras te centras en apretar al máximo el bíceps, pensando en llevar la mano hacia el hombro: el movimiento únicamente lo debe realizar el codo. Tras la flexión completa del codo, puedes, opcionalmente, aguantar la contracción y comenzar de nuevo a extenderlos de forma lenta y controlada, sin que sea necesario que extiendas por completo el codo; al igual que en otras variantes de predicador, evita perder tensión en cualquier parte del recorrido.$t$,
  cues=array[$t$Céntrate en el movimiento del codo durante todo el recorrido.$t$,
    $t$No te impulses con la cadera ni con la espalda; mantén tu cuerpo estable.$t$,
    $t$Evita que tus codos se abran hacia afuera: deben moverse solo en el plano sagital.$t$,
    $t$No es necesario estirar el codo por completo si no te resulta cómodo o pierdes tensión.$t$]::text[]
where id=420;

-- 421 · Doble Bíceps en Polea
update exercises set
  description=$t$Esta variante de curl de bíceps ha sido clásicamente muy popular entre gran cantidad de culturistas en los gimnasios. Puede realizarse tanto a 1 mano como a 2 manos; de ahí su nombre, doble bíceps, como la pose de culturismo. Realizarlo a 2 manos nos ahorrará tiempo; sin embargo, a 1 mano podría darnos ligeramente mejores sensaciones y alineación. También puede realizarse de pie o arrodillado, lo cual podría aportar algo más de tensión en estiramiento, especialmente si las poleas no son muy amplias.$t$,
  execution=$t$En caso de realizarlo a 2 manos, colócate en el medio de la estación, de pie o arrodillado, sujetando ambos agarres y formando una T con tu cuerpo y tus brazos. En caso de realizarlo a 1 mano, aléjate 2-4 m lateralmente de la polea para buscar una línea de fuerza algo más horizontal y poder estirar completamente el brazo. Sitúa la polea a la altura de tu cabeza o por encima y estira los codos para situarte en la posición inicial, con ligera tensión sobre el cable. Desde aquí, con el hombro fijo en todo momento y evitando ayudarte con el cuerpo, flexiona el codo buscando tocar el bíceps con tu antebrazo, pensando en llevar la mano a tu mejilla o a la parte lateral de tu cabeza, mientras contraes fuertemente el bíceps; pon el foco en él para sentir mejor el ejercicio. Una vez alcanzada la máxima contracción, vuelve a la posición inicial de forma controlada, sin perder tensión; puede ayudarte no extender por completo el codo.$t$,
  cues=array[$t$Piensa en llevar tu mano al lateral de tu cabeza (sien o mejilla).$t$,
    $t$Busca que al estirar el codo las placas nunca choquen perdiendo tensión.$t$,
    $t$Aguanta la contracción de forma isométrica y realiza una fase excéntrica controlada, resistiendo el estiramiento.$t$,
    $t$Deja fijos el hombro y tu torso; solo debe flexionarse el codo.$t$]::text[]
where id=421;

-- 422 · Curl Concentrado con Mancuerna
update exercises set
  description=$t$Seguro que conoces esta variante de curl de bíceps: parece ser la favorita en los gimnasios de las cárceles de las películas. En ella, lo que buscamos es tener el hombro en flexión, es decir, el brazo adelantado con respecto a la posición de tu torso, de forma similar a un predicador con mancuerna, con el objetivo de estimular ligeramente más la cabeza corta del bíceps. Se trata de una buena alternativa para este tipo de trabajo, especialmente cuando no se cuenta con apenas material más allá de una mancuerna, un banco y nuestro propio cuerpo; además, se puede trabajar con bastante estabilidad.$t$,
  execution=$t$Siéntate en el borde de un banco e inclínate hacia delante mientras sujetas una mancuerna con un agarre supino, dejándola colgar junto a tu pie, y colocas el codo apoyado sobre la cara interna de tu muslo, muy ligeramente por delante de tu hombro. Desde aquí, con el codo estirado casi o por completo, comienza a contraer fuertemente el bíceps elevando la mancuerna; piensa en acercar la mano a tu hombro, con un movimiento controlado, sintiendo cómo aprietas el bíceps. Una vez alcanzada la máxima contracción, sin que la mancuerna sobrepase la línea perpendicular de la gravedad con el suelo, comienza a descender de forma controlada hasta el punto más bajo; puedes evitar la extensión completa dejando 5-10º sin extender el codo antes de iniciar una nueva repetición.$t$,
  cues=array[$t$Evita tirar con el hombro o el torso hacia atrás: debe ser un movimiento que venga únicamente del codo.$t$,
    $t$No despegues el codo de tu rodilla en ningún momento.$t$]::text[]
where id=422;

-- 423 · Curl Martillo desde Polea Baja
update exercises set
  description=$t$Esta variante de curl con agarre neutro o martillo suele dar muy buenas sensaciones a todo el que la realiza. Para ello, necesitamos una estación de poleas cerrada en la que las poleas estén muy juntas, aunque, en su defecto, podríamos realizarlo también de forma unilateral sin ningún problema; incluso podría ser positivo si añadimos feedback sensorial tocando con la mano libre el bíceps que trabaja. Se trata de un muy buen ejercicio. Para mayor comodidad, utiliza 2 cuerdas cortas, 1 en cada polea, en lugar de coger directamente la polea.$t$,
  execution=$t$Sitúate delante de las poleas, de pie, o de espaldas a ellas según preferencia, con las poleas en su posición más baja y una cuerda en cada una de ellas a modo de agarre. Coge el agarre de forma neutra, situando tu mano contra la bola superior a modo de tope para poder ejercer fuerza sin que el agarre te limite. Desde aquí, con los brazos estirados a ambos lados del cuerpo, comienza a flexionar ambos codos, subiendo las manos. Busca aplastar el bíceps con el antebrazo, pero evita apuntar con las manos hacia tu cuerpo en exceso, especialmente arriba. Una vez completado el recorrido, desciende sin dejar caer el peso en la fase excéntrica, resistiendo el movimiento hasta llegar de nuevo a la posición inicial.$t$,
  cues=array[$t$Céntrate en el movimiento del codo: busca chocar antebrazo y bíceps.$t$,
    $t$No te impulses con la cadera ni con la espalda; mantén tu cuerpo estable.$t$,
    $t$No rotes las muñecas durante el movimiento, mantenlas neutras.$t$]::text[]
where id=423;

-- 424 · Extensión de Muñeca con Barra en Banco (antes «Extension de Muñeca con Barra en Banco»)
update exercises set
  name=$t$Extensión de Muñeca con Barra en Banco$t$,
  description=$t$Este ejercicio tiene el objetivo principal de estimular los extensores de muñeca, o parte superior del antebrazo. Para realizarlo necesitamos un banco, que podemos colocar en horizontal y ponernos de rodillas frente a él, o en paralelo a la dirección del movimiento, sentándonos con él entre ambas piernas y sacando la barra por el extremo.$t$,
  execution=$t$Colocado con los antebrazos apoyados sobre un banco, ya sea de rodillas frente a él o sentado encima, coge la barra con un agarre prono y una anchura inferior o igual al ancho de los hombros, según comodidad, sin rodearla con el pulgar, simplemente haciendo presa fuerte con los dedos. Alinea los antebrazos y deja caer las muñecas a favor de la gravedad, dejándolas sueltas para llevar la barra a su punto más bajo, y desde este punto comienza a extender la muñeca mientras sujetas la barra hasta alcanzar los máximos grados de extensión posibles; aguanta ligeramente la contracción y desde ahí desciende de forma controlada hasta la posición inicial de nuevo.$t$,
  cues=array[$t$Trata de alinear antebrazo y codo para después extender la muñeca.$t$,
    $t$Piensa en extender la mano apuntando lo máximo posible con los nudillos hacia tu cuerpo, para después apuntar con ellos hacia el suelo.$t$,
    $t$Mantén los antebrazos pegados al banco; no los levantes.$t$]::text[]
where id=424;

-- 425 · Extensión de Muñeca con Mancuernas en Banco
update exercises set
  description=$t$Esta variante de extensión de muñeca se trabaja de forma unilateral, pero del mismo modo que su alternativa con barra. También se busca estimular los extensores de muñeca, y podemos colocar el banco en paralelo al brazo o en horizontal, en función de si nos vamos a situar de rodillas frente a él o sentados sobre él. Realizarlo con mancuerna puede ser muy útil en algunos contextos y puede ayudar también a aquellas personas que se sienten inestables con barra.$t$,
  execution=$t$Coge una mancuerna con un agarre prono y sin rodear la barra con el pulgar; colócate de rodillas frente al banco si está en horizontal, o sentado encima si vas a realizarlo en paralelo, y alinea codo, antebrazo y muñeca. Sacando la mano y parte del antebrazo por fuera del banco, deja caer la muñeca apuntando con los nudillos hacia el suelo; desde aquí, comienza a extender la muñeca de forma controlada, pensando en apuntarte a ti mismo con los nudillos. Una vez alcanzada la máxima extensión posible, aguanta ligeramente la contracción y comienza a descender de forma controlada hasta la posición inicial, evitando movimientos bruscos e impulsos. Controla ambas fases.$t$,
  cues=array[$t$Trata de alinear antebrazo y codo para después extender la muñeca.$t$,
    $t$Piensa en extender la mano apuntando lo máximo posible con los nudillos hacia tu cuerpo, para después apuntar con ellos hacia el suelo.$t$,
    $t$Mantén el antebrazo pegado al banco; no lo levantes.$t$]::text[]
where id=425;

-- 426 · Curl de Muñeca con Barra en Banco
update exercises set
  description=$t$Este ejercicio se enfoca principalmente en el trabajo de los músculos flexores de la muñeca, o parte anterior del antebrazo. Se centra en el trabajo con barra a 2 manos, lo cual puede ser interesante para ahorrar tiempo frente a su trabajo unilateral con mancuerna, pese a que la realización y el estímulo serán muy similares. Además, podemos colocar el banco en horizontal y ponernos de rodillas frente a él, o en paralelo a la dirección del movimiento, sentándonos con él entre ambas piernas y sacando la barra por el extremo, según comodidad.$t$,
  execution=$t$Coge una barra con agarre supino y un ancho igual o inferior al ancho biacromial, y colócate de rodillas frente al banco o sentado encima de él, dependiendo de si el banco está colocado en horizontal o en paralelo al movimiento. Desde esta posición, permite que la barra ruede y se deslice por la mano, pero sin llegar a escaparse, estirando ligeramente los dedos para permitir un poco más de movimiento y apuntando con los nudillos lo más abajo posible. Ahora comienza a flexionar la muñeca sin despegar el antebrazo, controlando el movimiento, y busca de forma activa apuntar con los nudillos hacia el techo. Una vez alcanzado este punto, vuelve a la posición inicial sin movimientos rápidos.$t$,
  cues=array[$t$Piensa en tus nudillos: en la concéntrica deben apuntar lo más arriba posible, y en la excéntrica, lo más abajo posible; deja que ruede un poco la barra.$t$,
    $t$Trata de alinear codo y muñeca durante la realización del movimiento.$t$,
    $t$Mantén el antebrazo pegado al banco; evita impulsos o despegarlo.$t$]::text[]
where id=426;

-- 427 · Curl de Muñeca con Mancuernas Supino en Banco
update exercises set
  description=$t$Este ejercicio es una variante unilateral con mancuerna para el trabajo de los flexores de la muñeca. Del mismo modo, puede realizarse con el banco en horizontal o en paralelo al movimiento, de rodillas o sentado sobre él, respectivamente. Realizarlo con mancuerna puede resultar más cómodo en caso de inestabilidad o de falta de sensación de trabajo en uno o ambos antebrazos en las variantes con barra.$t$,
  execution=$t$Colócate de rodillas frente al banco si lo sitúas en perpendicular a la dirección del movimiento, o sentado sobre él si está situado en paralelo. Sujeta una mancuerna con agarre supino, alineando tu antebrazo y tu muñeca, y deja que la mancuerna se deslice por tu mano y tus dedos para situarte en la posición inicial, buscando apuntar con tus nudillos hacia el suelo. Ahora comienza a flexionar la muñeca elevando la mancuerna y, como si quisieras enrollar tu mano sobre sí misma, piensa en apuntar con los nudillos lo máximo posible hacia el techo sin despegar el antebrazo del banco; una vez alcanzada esta posición, comienza a descender de nuevo hasta la posición inicial de forma controlada.$t$,
  cues=array[$t$Piensa en tus nudillos: en la concéntrica deben apuntar lo más arriba posible, y en la excéntrica, lo más abajo posible; deja que ruede un poco la mancuerna.$t$,
    $t$Trata de alinear codo y muñeca durante la realización del movimiento.$t$,
    $t$Mantén el antebrazo pegado al banco; evita impulsos o despegarlo.$t$]::text[]
where id=427;

-- 428 · Curl de Muñeca desde Polea Baja de Pie
update exercises set
  description=$t$Esta variante se realiza de pie utilizando una polea en su posición más baja; en ocasiones puede ser más interesante que realizarla con barra libre, debido a que el cable aporta una tensión más constante al movimiento. Busca estimular principalmente los flexores de muñeca, o parte anterior del antebrazo.$t$,
  execution=$t$Colócate de pie frente a una polea situada en la posición más baja, engancha una barra recta o Z y sujétala con agarre prono y una anchura igual o ligeramente inferior al ancho biacromial. Separa la barra de la polea para generar una ligera tensión y alinea codo y muñeca; desde esta posición, comienza a enrollar la mano hacia dentro, buscando apuntar con los nudillos hacia tus muslos y enrollando la barra todo lo que puedas, de forma controlada y sin movimientos bruscos. Una vez alcanzada la máxima flexión de muñeca, vuelve poco a poco hasta la posición inicial, extendiendo un poco los dedos para poder dar más movimiento al ejercicio.$t$
where id=428;

-- 429 · Rolling Barbell Twist
update exercises set
  description=$t$Este ejercicio de antebrazo se centra en trabajar los extensores de muñeca y es una variante popularizada por el famoso entrenador Eugene Teo, que puede realizarse de forma sencilla con muy poco material. Para realizarlo necesitamos una barra, una goma elástica y un disco, una kettlebell o una mancuerna que atar a ella, aunque podría utilizarse también una cuerda o similar. La goma pegará ciertos tirones durante la subida, que deberemos resistir mientras tratamos de enrollarla, por lo que parece ser una buena opción. Cada giro de muñeca cuenta como una repetición. Para este ejercicio puedes usar una barra corta o un tubo de cualquier material o, simplemente, una barra larga del gimnasio situada sobre un soporte.$t$,
  execution=$t$De pie frente a una barra situada en su soporte, o agarrando una barra corta con la cuerda o la goma atada, sujétala con la mano que vaya a iniciar el movimiento con la mayor cantidad de palma posible, buscando que los nudillos apunten casi hacia el suelo. Busca una posición estable con los pies, separándolos a la anchura de los hombros; puedes alternar 1 extensión con cada mano, trabajar ambas a la vez o entrenar primero un antebrazo y luego el otro. Desde aquí, comienza a extender la muñeca de forma controlada, dirigiendo la contracción hacia atrás y buscando que tus nudillos apunten hacia ti lo máximo posible. Aguanta brevemente la contracción y continúa con el gesto hasta completar la serie.$t$
where id=429;

-- 430 · Curl de Muñeca desde Polea Baja Sentado
update exercises set
  description=$t$El objetivo principal de este ejercicio es estimular los flexores de la muñeca, o parte anterior del antebrazo. Para realizarlo necesitaremos un banco sobre el que sentarnos para generar una posición estable y situar los antebrazos apoyados sobre los muslos, que estarán en paralelo al suelo. Debemos colocar la polea en una posición baja y el banco ligeramente alejado de la misma para que haya tensión en todo momento.$t$,
  execution=$t$Siéntate sobre un banco o asiento en paralelo a la polea y sitúa tus pies aproximadamente debajo de tus rodillas, de forma que tus muslos queden en paralelo al suelo. A continuación, sujeta la barra que vayas a utilizar con un agarre supino y coloca tus antebrazos apoyados sobre tus muslos, buscando alinear antebrazo, codo y muñeca, de forma que tus manos queden colgando por fuera de tus rodillas sin apoyarse en ningún sitio. Desde esta posición, comienza a extender la muñeca buscando que tus nudillos apunten lo máximo posible hacia el suelo; una vez aquí, siendo siempre este punto de partida el que mayor ROM nos permita sin dolor, comienza a contraer el antebrazo (piensa en que tus nudillos deben apuntar hacia el techo), aguanta la contracción de forma isométrica y comienza a descender de nuevo de forma lenta y controlada hasta la posición inicial.$t$,
  cues=array[$t$Mantén los antebrazos pegados a tus muslos, en paralelo al suelo; no los levantes.$t$,
    $t$Trata de alinear antebrazo y codo para después flexionar la muñeca.$t$,
    $t$Al inicio, piensa en apuntar lo máximo posible con los nudillos hacia el suelo, para después acabar apuntando con ellos hacia el techo.$t$]::text[]
where id=430;

-- 431 · Kettlebell Wrist Turns
update exercises set
  description=$t$Este ejercicio es muy popular y utilizado en deportes como la lucha de brazos o pulsos; puede tener cabida dentro de una planificación como parte de un calentamiento o para fortalecer especialmente los flexores de muñeca, así como la fuerza de agarre. Para realizarlo necesitamos, preferentemente, una kettlebell, aunque también podrían usarse ciertos tipos de discos. Puedes realizar el ejercicio directamente sobre el suelo o sobre un banco ancho; por espacio, generalmente es más cómodo el suelo.$t$,
  execution=$t$Colócate arrodillado en el suelo o en un banco, tumbando una kettlebell sobre uno de sus laterales. A continuación, manteniendo el antebrazo apoyado, agárrala por el asa de forma que la palma de tu mano apunte hacia el techo. Comienza el movimiento girando la mano hacia el lado contrario: piensa en llevar la palma de la mano hacia el suelo. Realiza el movimiento de forma lenta y controlada, resistiendo ambas fases excéntricas: cuando la kettlebell sobrepase la línea perpendicular de la gravedad con el suelo, caerá sola hacia el lado contrario, y ahí debes resistir ligeramente para que no caiga de golpe. Una vez consigas tumbarla hacia el otro lado, realiza el mismo movimiento en sentido contrario, volviendo a colocarla en la posición inicial y resistiendo la fase excéntrica.$t$,
  cues=array[$t$No dejes caer la kettlebell de golpe, resiste las fases excéntricas.$t$,
    $t$Piensa en volcar tu mano y que acabe apuntando hacia el suelo.$t$,
    $t$Mantén el codo apoyado en el suelo; no lo levantes para hacer fuerza.$t$]::text[]
where id=431;

-- 432 · Agarre en Máquina Sentado
update exercises set
  description=$t$Esta máquina permite trabajar la fuerza de agarre, ya que consiste en cerrar unos agarres, de forma similar a lo que hacemos con un hand grip, pero en este caso podemos realizarlo a 2 manos y con la gran ventaja de que permite una gran capacidad de sobrecarga, al poder añadir discos y cargas muy pesadas. Además, al realizarse sentado y de forma guiada, estamos muy estables, por lo que es un gran ejercicio para trabajar el agarre.$t$,
  execution=$t$Siéntate en la máquina buscando asegurar un apoyo de piernas estable para evitar movernos: debemos centrar el movimiento únicamente en las manos. Para ello, sujeta los agarres mientras mantienes tus codos extendidos, y evita situarte en una posición incómoda, con la espalda demasiado curvada. Desde esta posición, extiende tus dedos lo máximo posible y comienza a apretar, pensando en cerrar fuerte la mano, como si quisieras llegar a tocar con las puntas de los dedos el talón de tu mano; continúa hasta cerrar por completo el agarre, aguanta isométricamente un par de segundos y regresa a la posición inicial de forma controlada, sin dejar caer el peso.$t$
where id=432;

-- 433 · Ab Roll Out / Ab Wheel (antes «Ab-roll Out/ab-wheel»)
update exercises set
  name=$t$Ab Roll Out / Ab Wheel$t$,
  description=$t$Este ejercicio es uno de los más completos en lo que a abdomen se refiere, ya que su activación está entre las más altas cuando se compara con otros (44, 45). Puede realizarse preferentemente con una rueda ancha, que lo hará cómodo y estable para poder apurar bastante la intensidad de las repeticiones, aunque también con un TRX o similar que permita desplazarse. Para dificultarlo, podríamos añadir una goma que tire en contra de nuestro movimiento, realizarlo partiendo de pie o añadir chalecos lastrados.$t$,
  execution=$t$Comienza de pie o de rodillas, en función de tu nivel, apoyando la rueda en el suelo. Desde aquí, comienza la fase excéntrica alejando la rueda de ti, lentamente y poco a poco, mientras coges aire; piensa en llevarla lo más lejos posible de ti, manteniendo la tensión en el abdomen y tu columna alineada en la medida de lo posible; puedes redondear ligeramente la zona de la espalda alta. Una vez alcanzado el punto más alejado posible que te permita no perder la posición, comienza a contraer el abdomen de forma potente mientras expulsas el aire, volviendo a la posición inicial del movimiento. Intenta que tu espalda baja y tu zona lumbar no se hundan.$t$,
  cues=array[$t$Intenta que los codos no se te abran hacia afuera, mantén los brazos rectos y tensión sobre la parte superior de tu escápula para que la rueda no se escape.$t$,
    $t$Evita que se produzca una excesiva hiperlordosis lumbar; activa el glúteo.$t$,
    $t$Trata de realizar la fase concéntrica en un solo movimiento, no en 2.$t$,
    $t$Inspira durante la fase excéntrica y espira apretando el abdomen durante la concéntrica. Realiza el movimiento de forma lenta y controlada.$t$]::text[]
where id=433;

-- 434 · Body Saw
update exercises set
  description=$t$Podríamos decir que este ejercicio es una variante similar al Ab Roll Out que podemos realizar en caso de no tener rueda, pero sí sliders o una toalla que deslice. También puede realizarse únicamente con movimientos desde el tronco si no podemos contar con deslizamientos para los pies. Aunque el rango de movimiento para el abdomen es menor que en el Ab Roll Out, podemos alcanzar una gran tensión y añadir progresiones lastrando con chalecos. Podría decirse que es un híbrido entre un roll out y una plancha frontal.$t$,
  execution=$t$Sitúate en el suelo, apoyando los antebrazos sobre él y formando un ángulo de 90º con tu codo, con el húmero en perpendicular al suelo de tal forma que quede alineado con tu hombro; la posición será similar a la de una plancha isométrica. Sitúa los pies atrás, colocando las puntas sobre unas toallas, un TRX, sliders o deslizadores, a ser posible. Pon tu cuerpo en tensión, con el abdomen contraído de forma isométrica, el glúteo activado y evitando que la espalda se hunda. A continuación, empuja con tus codos hacia delante, deslizando tu cuerpo hacia atrás mientras inspiras, hasta estirarte lo máximo posible sin perder la neutralidad de la espalda; una vez alcanzada esa posición, comienza a traccionar con los codos para llevar el torso de nuevo hasta la posición inicial. No es necesario que tus hombros adelanten a tus codos en el movimiento.$t$
where id=434;

-- 435 · V-ups
update exercises set
  description=$t$Podría decirse que este ejercicio es un híbrido entre el crunch abdominal y el crunch invertido: en él se combina una elevación del tren inferior hacia el torso con una elevación del tronco al mismo tiempo. Se trata, por tanto, de un ejercicio complejo, que puede costar dominar técnicamente a pesar de tener fuerza en el abdomen, pues entra también en juego la coordinación, pero puede ser interesante de cara a la hipertrofia si se realiza con una resistencia (por ejemplo, un disco) en las manos.$t$,
  execution=$t$Partiendo de tumbado boca arriba en el suelo, con los brazos y los pies estirados y apoyados sobre el mismo, inspira y, una vez hayas tomado aire, comienza a elevar brazos y piernas a la vez mientras contraes fuertemente el abdomen y expulsas el aire para ayudarte. Puedes pensar en tocar las puntas de tus pies, los laterales de tus tobillos o, si te cuesta, simplemente en despegar tus escápulas del suelo y llevar brazos y piernas a un punto intermedio en el que no lleguen a tocarse, para después progresar. Una vez alcanzada esta elevación, desciende de forma controlada mientras vuelves a tomar aire hasta la posición de partida, evitando rebotar con los talones en el suelo para impulsarte y utilizar inercias en la siguiente fase concéntrica.$t$,
  cues=array[$t$Inspira mientras te estiras durante la fase excéntrica y espira mientras contraes de forma potente el abdomen durante la fase concéntrica.$t$,
    $t$A ser posible, evita tocar o rebotar en el suelo con los talones y las manos para no perder tensión sobre el abdomen.$t$,
    $t$Piensa en apretar el abdomen a la vez que subes torso y piernas; no es necesario que llegues a tocarte los pies: céntrate en despegar tus escápulas e isquios del suelo.$t$]::text[]
where id=435;

-- 436 · Stir The Pot
update exercises set
  description=$t$Este ejercicio tiene aplicaciones más allá del entrenamiento de abdomen, como el propio rendimiento deportivo o, simplemente, como preactivación. Se trata de un ejercicio de estabilidad en plancha que se realiza con un fitball y el apoyo de nuestros antebrazos sobre él; se podría progresar directamente hacia un apoyo de manos con los codos extendidos, pero no es un ejercicio que a largo plazo pueda sobrecargarse enormemente, por lo que quizá deje de ser interesante para los sujetos más avanzados o una vez conseguido cierto nivel de progresión y número de repeticiones. La traducción literal de este ejercicio es «remover la olla».$t$,
  execution=$t$Colócate frente a un fitball, apoyando tus antebrazos sobre él; a continuación, estira tus piernas hacia atrás, con una separación de pies igual o ligeramente mayor que el ancho de tus hombros. Una vez situado en esta posición, coge aire, extiende el cuerpo y aprieta el abdomen para situarte en la que será la posición inicial. Ahora realiza círculos o gestos en V con tus codos mientras aprietan la pelota; no pienses en mover tus antebrazos. Puedes realizar el mismo movimiento hacia 1 lado en cada serie, alternar un número determinado de repeticiones hacia cada lado o hacer 1 hacia la derecha y 1 hacia la izquierda alternativamente.$t$,
  cues=array[$t$Puedes alternar repeticiones hacia un lado y hacia otro o realizar directamente primero hacia un lado y luego hacia el otro, según preferencias.$t$,
    $t$Mantén la espalda alta ligeramente redondeada.$t$,
    $t$Intenta que no se forme una excesiva lordosis lumbar; mantén el glúteo activado.$t$]::text[]
where id=436;

-- 437 · Crunch desde Polea Alta
update exercises set
  description=$t$Esta variante de crunch abdominal resulta interesante de cara al trabajo del recto abdominal, especialmente de su porción superior, debido a que estamos en una posición estable y cómoda desde la que centrarnos únicamente en aplicar fuerza con el abdomen; al tener las piernas bloqueadas contra el suelo, no podemos ayudarnos con ellas para desplazar la carga, y podemos progresar no solo en el número de repeticiones, sino también en la carga, a medida que mejoramos, gracias a las placas.$t$,
  execution=$t$Con la polea situada en la posición más alta posible, sujeta unas cuerdas con un agarre neutro y arrodíllate un par de pasos por detrás de la vertical de la polea. A continuación, manteniendo tu columna neutra, lleva tus hombros aproximadamente por delante de tus caderas para generar tensión en el cable desde el inicio; es decir, tus codos deben quedar aproximadamente en perpendicular a tu torso. Una vez aquí, coge aire y comienza a bajar contrayendo el abdomen y expulsando a la vez el aire para ayudarte a contraerlo más. Piensa en llevar tus codos a tus rodillas, hasta el punto más bajo que puedas alcanzar; aguanta una breve contracción y sube lento y controlado hasta la posición inicial, evitando rebotes e inercias, y vuelve a realizar otra pausa antes de la siguiente repetición.$t$,
  cues=array[$t$Inspira durante la fase excéntrica (subida) y espira mientras contraes fuertemente el abdomen durante la concéntrica (bajada).$t$,
    $t$Piensa en llevar tus codos hacia tus rodillas, no en tirar de la cuerda con las manos.$t$,
    $t$Estira por completo el abdomen y contrae todo lo que puedas: realiza un rango de movimiento (ROM) lo más completo posible sin perder tensión.$t$,
    $t$No tengas prisa, es preferible un movimiento lento y controlado.$t$]::text[]
where id=437;

-- 438 · Crunch Abdominal en Máquina
update exercises set
  description=$t$Esta variante de crunch ha estado típicamente muy demonizada, alegando que era una máquina inútil e inservible, además de lesiva. Sin embargo, hoy sabemos que no es así y que puede ser un ejercicio interesante de cara al trabajo estético del recto anterior del abdomen; en función del tipo de carga de la máquina (placas o plate-loaded) y de su diseño (únicamente movimiento desde el tronco o incluyendo también una flexión de cadera al mismo tiempo), puede ser aún más o menos interesante, así como variar el ejercicio.$t$,
  execution=$t$Siéntate en la máquina apoyando completamente tu glúteo y tu zona lumbar en el respaldo; evita despegarlos para poder estar estable y aplicar mejor fuerza. Agarra las manetas y sitúa los codos sobre los soportes, si es que la máquina dispone de ellos, llevando los codos hacia delante. Inspira y, desde aquí, comienza a contraer el abdomen a la vez que aplicas fuerza con los codos contra los soportes y expulsas el aire para ayudarte a contraer más. Puedes mantener una ligera flexión del cuello si te ayuda a sentir más el movimiento. Una vez alcanzada la máxima contracción, aguanta brevemente y vuelve a la posición inicial poco a poco, sin dejar caer el peso de golpe en la fase excéntrica.$t$,
  cues=array[$t$Estira por completo el abdomen y contrae todo lo que puedas: realiza un rango de movimiento (ROM) lo más completo posible sin perder tensión.$t$,
    $t$No tengas prisa, es preferible un movimiento lento y controlado.$t$,
    $t$Céntrate en hacer fuerza con los codos hacia abajo al contraer el abdomen.$t$,
    $t$Expulsa el aire al contraer el abdomen para apretarlo más aún.$t$]::text[]
where id=438;

-- 439 · Hanging Leg Raises
update exercises set
  description=$t$Este ejercicio de abdomen consiste en elevar las piernas desde colgado, preferiblemente extendidas o rectas, aunque puedes empezar flexionando las rodillas y después progresar. Se trata de uno de los ejercicios con mayor activación del recto abdominal, aunque hay que tener claro que la EMG tiene ciertas limitaciones. Puede realizarse colgado de una barra, preferiblemente usando straps para que el limitante del ejercicio no sea el agarre, sino tu abdomen, o con unas mangas a través de las que pasar los codos para colgar tu cuerpo, de forma que el agarre no te impida realizar más repeticiones. Es posible progresar añadiendo peso, un cable o gomas a los tobillos, pero puede ser algo complejo.$t$,
  execution=$t$Comienza agarrando la barra o el soporte sobre el que realizarás el ejercicio, preferentemente utilizando straps o manguitos para los codos; una vez tengas una posición estable, descuelga los pies dejando todo tu cuerpo colgando en el aire, sin que haya movimiento. Ahora coge aire y contrae el abdomen de forma potente, llevando las piernas hacia arriba. Puedes elevar las rodillas dobladas si te cuesta más; en este caso, llévalas hacia el pecho. Con las piernas rectas, basta con llevarlas aproximadamente a la horizontal. Una vez alcanzada esta altura, desciende de forma controlada y lenta hasta la posición inicial, evitando inercias, impulsos y balanceos. Intenta mantener el abdomen activo para no curvar en exceso la zona lumbar y mantén el glúteo activado.$t$,
  cues=array[$t$No dejes caer las piernas de golpe desde el punto más alto; controla la excéntrica descendiendo de forma lenta y controlada.$t$,
    $t$Evita inercias, rebotes y balanceos que te ayuden en la fase concéntrica.$t$,
    $t$Utiliza straps para que el agarre no sea el limitante.$t$,
    $t$Evita que haya un balanceo generado por tu cuerpo manteniendo abdomen contraído durante el recorrido y controlando el movimiento.$t$]::text[]
where id=439;

-- 440 · Encogimientos de Piernas en Banco Plano
update exercises set
  description=$t$Este ejercicio combina el acercamiento del torso y de las rodillas al mismo tiempo, por lo que a nivel coordinativo puede ser algo más complejo. Puede utilizarse para calentar, pero también para trabajar la estética abdominal y progresar a largo plazo a medida que aumentamos las repeticiones, aunque añadir carga no será algo sencillo.$t$,
  execution=$t$Siéntate sobre uno de los extremos de un banco plano, sacando las piernas por el extremo, y agárrate al banco con las manos para situarte en una posición estable desde la que aplicar fuerza y realizar la fase excéntrica mientras separas y alejas las piernas, estirándolas. A continuación, realiza un movimiento combinado en el que acerques el torso y eleves las rodillas al pecho, expulsando el aire mientras contraes el abdomen. Desde la máxima contracción, comienza a alejar de nuevo las piernas y el torso, buscando alcanzar una posición horizontal e inspirando durante la excéntrica. Una vez estirado por completo, sigue con otra repetición, evitando de nuevo impulsos, inercias o realizar el movimiento demasiado rápido.$t$,
  cues=array[$t$Piensa en juntar tus rodillas y tu pecho, acercándolos mutuamente.$t$,
    $t$Busca una posición estable, para ello agárrate fuerte al banco.$t$,
    $t$Realiza una fase excéntrica lenta y controlada, estirando tu cuerpo.$t$]::text[]
where id=440;

-- 441 · Crunch Abdominal
update exercises set
  description=$t$La mejor forma de empezar a describir este ejercicio es decir que el crunch abdominal no es lesivo. Igual que se ha destacado con otro tipo de ejercicios, tenemos que entender que las lesiones son multifactoriales y que no hay que tenerle miedo al movimiento. Dicho esto, se trata de un ejercicio que puede aportar un buen estímulo para el trabajo del recto anterior del abdomen si se realiza teniendo en cuenta algunas consideraciones, como la respiración o la cadencia, de forma que se priorice la calidad de las repeticiones por encima del número, al contrario de como se ha hecho típicamente. Ten en cuenta que también se puede añadir carga sin problema en forma de disco o chaleco.$t$,
  execution=$t$Túmbate en el suelo apoyando completamente la cadera y la zona lumbar y dobla las rodillas, acercándolas a tu glúteo para generar un apoyo estable, aunque también puedes mantenerlas estiradas como variante. Puedes colocar las manos cruzadas sobre tu pecho o sobre tu nuca, dirigiendo los codos hacia el frente, pero sin hacer fuerza. Desde esta posición, coge aire y comienza a elevar el torso dirigiendo los codos hacia las rodillas; céntrate en despegar las escápulas del suelo: no es necesario incorporarte por completo, basta con llegar un poco más allá de las escápulas. Mientras contraes el abdomen fuertemente, expulsa el aire y aguanta 1 segundo la contracción de forma isométrica antes de volver a la posición inicial, resistiendo la fase excéntrica: no te dejes caer.$t$,
  cues=array[$t$No tengas prisa: es preferible un movimiento lento y controlado.$t$,
    $t$Piensa en despegar tus escápulas por completo del suelo; no es necesario incorporarte o sentarte por completo. Dirige los codos hacia las rodillas.$t$,
    $t$Expulsa el aire al contraer el abdomen para apretarlo más aún.$t$]::text[]
where id=441;

-- 442 · Wood Chopper
update exercises set
  description=$t$Este ejercicio, que traducido al castellano sería «leñador», recibe su nombre por el propio gesto que realiza. En él tenemos que sujetar el agarre de una polea situada a una altura aproximada entre el pectoral y la zona media del abdomen, de forma similar a un press Pallof, con los brazos extendidos pero hacia un lateral de nuestro cuerpo; a diferencia de ese otro ejercicio, en el que el movimiento se queda en este punto y debemos aguantar las fuerzas de rotación, aquí se realiza un gesto de rotación, como si estuviéramos talando un árbol.$t$,
  execution=$t$Colócate lateralmente respecto a una polea, con los pies situados a una anchura igual o ligeramente superior a la de tus hombros, y extiende los brazos por delante de ti, con las manos apuntando hacia la polea. Partiremos con el torso ligeramente rotado hacia el lado de la polea, generando una ligera tensión en el cable y con el abdomen apretado. Desde este punto, mientras contraes fuertemente el abdomen, comienza a rotar hacia el lado contrario, alejando las manos de la polea; continúa hasta una posición cómoda que te evite perder tensión (generalmente, basta con situar los hombros en perpendicular a la polea) y vuelve de forma controlada hasta la posición inicial. Es fundamental controlar y resistir la fase excéntrica.$t$,
  cues=array[$t$Aguanta la fase excéntrica de forma lenta y controlada.$t$,
    $t$No tengas miedo a ponerle peso, debe ser exigente.$t$,
    $t$Sitúa un stance o apoyo de piernas cómodo, igual o ligeramente mayor que el ancho de tus hombros.$t$,
    $t$Contrae el abdomen y expulsa el aire al realizar la fase concéntrica.$t$]::text[]
where id=442;

-- 443 · Press Pallof
update exercises set
  description=$t$Este ejercicio es un movimiento para el trabajo de abdomen y core de forma isométrica, a modo de transmisor de fuerzas en un gesto antirrotacional. Los ejercicios isométricos, como también las planchas, no son la mejor opción para el desarrollo del abdomen ni de ningún músculo: el abdomen es un músculo como cualquier otro y, del mismo modo que no entrenarías el bíceps de forma isométrica, tampoco deberías hacerlo con el abdomen si tus objetivos son estéticos. Se incluye aquí porque es un ejercicio muy popular, que puede realizarse con gomas o poleas y que puede ser muy útil de cara al calentamiento o la preactivación muscular, entre otros usos.$t$,
  execution=$t$Sitúate de lado a una polea colocada aproximadamente a la altura de tu pecho, con un agarre libre o en D que debes sujetar con ambas manos, situando una sobre la otra. Los pies deben estar situados aproximadamente a la anchura de los hombros. Coloca el agarre frente a tu pecho y da un paso lateral alejándote de la polea para situar el cable en mayor tensión. Desde aquí, empuja el agarre con ambas manos lo más lejos posible de ti, extendiendo ambos brazos al máximo. Una vez alcanzada esta posición, aguanta ligeramente con el abdomen apretado en todo momento y comienza a regresar a la posición inicial de forma lenta y controlada antes de una nueva repetición.$t$,
  cues=array[$t$Aguanta la fase excéntrica de forma lenta y controlada.$t$,
    $t$No tengas miedo a ponerle peso, debe ser exigente.$t$,
    $t$Sitúa un stance o apoyo de piernas cómodo, igual o ligeramente mayor que el ancho de tus hombros.$t$]::text[]
where id=443;

-- 444 · Crunch Inverso en Banco Declinado
update exercises set
  description=$t$Este ejercicio es una buena opción para el trabajo del recto abdominal de forma dinámica. Fue popularizado por el famoso entrenador Charles Poliquin y, para realizarlo, necesitamos un banco declinado: cuanto más inclinado esté el banco, más difícil será el ejercicio, lo que también es otra forma de progresar. Es un ejercicio en el que el movimiento es muy similar a unos hanging leg raises, pero contamos con la mayor estabilidad que nos aporta el banco en la espalda.$t$,
  execution=$t$Coloca un banco con un ángulo de declinación cómodo; cuanto mayor sea la inclinación, más difícil será. Sujeta con ambas manos los laterales de la parte superior del banco, en torno a tu cabeza, y dobla tus rodillas hasta llevarlas a la línea perpendicular de tu cadera, es decir, sitúa tus rodillas justo encima de tu cadera. Desde aquí, comienza a elevar la cadera pensando en acercarla a tus costillas, dirigiendo las rodillas hacia tu cara de forma controlada. Una vez alcances el máximo rango de movimiento activo, comienza a descender de forma controlada, resistiendo la fase excéntrica. Desciende hasta volver a situar las rodillas encima de tu cadera; no es necesario que bajes más.$t$,
  cues=array[$t$Piensa en acercar tus costillas a tu cadera, no solo en subir las piernas.$t$,
    $t$Controla y resiste la fase excéntrica, no dejes caer tus piernas.$t$,
    $t$Expulsa el aire a la vez que subes; contrae y aprieta el abdomen de forma consciente.$t$,
    $t$Puedes progresar inclinando más el banco, haciendo más repeticiones o añadiendo lastres a tus piernas.$t$]::text[]
where id=444;

-- 445 · Hipthrust
update exercises set
  description=$t$Este ejercicio es posiblemente el más popular en el entrenamiento con el objetivo de trabajar los glúteos, al tratarse de un movimiento puro de extensión de cadera, prácticamente en aislamiento si colocamos bien el cuerpo. Existe una gran cantidad de variantes.$t$,
  execution=$t$Sitúa un banco, cajón o similar a tu espalda, de forma que no se mueva y quede apoyado aproximadamente sobre el borde inferior de la escápula, en una posición cómoda que te permita pivotar con tu espalda alta sobre él. Coloca una almohadilla en la mitad de la barra que amortigüe la presión. Sitúa los pies con una anchura ligeramente superior al ancho de los hombros, apuntando ligeramente hacia afuera (unos 10-15º) y a una distancia que permita que, en la parte alta del movimiento, la tibia quede justo debajo de la rodilla, perpendicular al suelo, con la rodilla a 90º. Para iniciar la fase concéntrica, sujeta la barra con las manos con una amplitud superior a la anchura de las rodillas, que estarán dobladas; desde esta posición, despega ligeramente la barra y contrae ligeramente el glúteo como primer paso. Desde ahí, comienza a extender la cadera hasta alcanzar la extensión completa, manteniendo la columna neutra (evita hiperextenderla); céntrate en que lo que se mueva sea el fémur sobre la pelvis mientras el torso pivota sobre el banco. Mantén la mirada al frente durante todo el movimiento y, en la parte más alta, realiza retroversión pélvica apretando el glúteo como si quisieras evitar que se cayese un billete de entre tus nalgas, aguantando una breve pausa. Desciende de forma controlada hasta la posición inicial, evitando rebotes en el suelo; puedes apoyar, o no, los discos sobre el suelo entre las repeticiones.$t$,
  cues=array[$t$La mirada debe ir preferentemente al frente: imagina que tienes que sujetar una pelota contra el pecho con tu barbilla.$t$,
    $t$Realiza retroversión pélvica apretando el glúteo en la parte superior.$t$,
    $t$El pie debe quedar debajo de la rodilla y ligeramente rotado hacia el exterior.$t$,
    $t$Realiza una extensión completa de cadera, manteniendo la columna neutra.$t$,
    $t$Evita rebotar con los discos en el suelo, mantén tensión constante y realiza un movimiento lento y controlado.$t$]::text[]
where id=445;

-- 446 · Skorcher Hipthrust
update exercises set
  description=$t$Esta variante del movimiento de extensión de cadera, o más propiamente del hip thrust, fue popularizada por Bret Contreras. En ella se utiliza un banco especial para el movimiento, o bien un banco a modo de soporte para los pies y otro de respaldo, igual que en la versión tradicional. El objetivo fundamental del ejercicio es poder trabajar con un mayor rango de movimiento respecto al ejercicio convencional, en el que el suelo nos limitaría a la hora de llevar la barra a mayor profundidad. Puede ser complicado colocarse, especialmente si se usan grandes cargas, por lo que es más adecuado subir ligeramente el rango de repeticiones.$t$,
  execution=$t$Coloca el borde inferior de tus escápulas sobre el banco, cajón o respaldo que vayas a utilizar, y tus pies sobre otro cajón elevado o banco, situados a una anchura superior a la de los hombros y con las punteras ligeramente rotadas hacia fuera. Desciende la cadera (doblada) todo lo que puedas, pero manteniendo los discos ligeramente elevados respecto al suelo para generar tensión inicial. Para comenzar el movimiento, contrae previamente el glúteo y comienza a extender la cadera por completo mientras pivotas con tus escápulas sobre el banco, manteniendo la columna neutra. La mirada debe permanecer al frente durante todo el recorrido. En la parte más alta, contrae el glúteo; realizar retroversión pélvica en ese punto también puede ayudarte a sentir más el ejercicio y a evitar una hiperextensión lumbar. Desde esa máxima contracción, vuelve al punto inicial poco a poco, de forma controlada, evitando siempre rebotes e inercias entre las repeticiones.$t$,
  cues=array[$t$La mirada debe ir preferentemente al frente: imagina que tienes que sujetar una pelota contra el pecho con tu barbilla.$t$,
    $t$Realiza retroversión pélvica apretando el glúteo en la parte superior.$t$,
    $t$Realiza una extensión completa de cadera, manteniendo la columna neutra.$t$,
    $t$Mantén tensión constante y realiza un movimiento lento y controlado.$t$]::text[]
where id=446;

-- 447 · Glute Bridge
update exercises set
  description=$t$Esta variante de extensión de cadera se realiza partiendo de un apoyo del torso en el suelo, por lo que la dinámica del movimiento es ligeramente diferente; sin embargo, comparte algunas similitudes en la realización con otras variantes y movimientos de extensión de cadera dominantes de glúteo. Se trata de un ejercicio interesante en muchas ocasiones, como, por ejemplo, cuando tengamos poco material o como aprendizaje de una correcta extensión de cadera, aunque el rango de movimiento es menor que en un hip thrust. También debes evitar rebotes al realizarlo.$t$,
  execution=$t$Túmbate en el suelo con la barra sobre tu cadera y los pies situados a una anchura ligeramente superior al ancho de tus hombros, rotados ligeramente hacia afuera. Por la posición de tu torso en este ejercicio, la tibia y el pie no quedarán alineados en perpendicular justo debajo de la rodilla, sino que debes buscar un punto cómodo, ni demasiado lejos ni demasiado cerca, con tus rodillas formando un ángulo algo menor de 90º. Desde aquí, con la mirada al frente y la barbilla hacia el esternón, sujetamos la barra con una anchura superior a la de nuestras caderas y contraemos previamente el glúteo para comenzar el movimiento: extendemos la cadera llevando la barra arriba. Busca mantener tu columna neutra y tus escápulas apoyadas contra el suelo, ejerciendo fuerza contra él para evitar moverte y estar en una posición estable. Aguanta ligeramente la contracción en el punto de máxima extensión de cadera y desciende de forma controlada a la posición inicial; puedes tocar el suelo con los discos, pero evita en todo caso rebotes e inercias a la hora de iniciar una nueva contracción. Si esto sucede, añade una pausa entre repeticiones.$t$,
  cues=array[$t$La mirada debe ir preferentemente al frente: imagina que tienes que sujetar una pelota contra el pecho con tu barbilla.$t$,
    $t$Realiza retroversión pélvica con el glúteo en la parte superior.$t$,
    $t$Pies rotados externamente con una anchura ligeramente superior a tus hombros.$t$,
    $t$Evita rebotar con los discos en el suelo, mantén tensión constante.$t$]::text[]
where id=447;

-- 448 · Hipthrust Unilateral con Mancuerna
update exercises set
  description=$t$Esta variante de hip thrust, al realizarse de forma unilateral, permite generar una gran carga con muy poco peso; por lo tanto, si tenemos muy poco material, puede ser muy interesante. Además, pese a que no resulta tan estable como otras variantes con ambos pies como apoyo, realizarlo con mancuerna resulta más cómodo y estable que con barra, por lo que puede ser la opción principal tanto de cara al aprendizaje del ejercicio como si no movemos mucha carga o vamos a realizarlo en un rango de repeticiones algo más elevado. Valora descansar entre ambas piernas.$t$,
  execution=$t$Apoya el borde inferior de tus escápulas en el banco, cajón o similar mientras sitúas el pie del lado que va a trabajar ligeramente rotado hacia afuera, en una posición que permita situar rodilla, tibia y pie alineados en perpendicular al suelo, formando un ángulo de 90º aproximadamente. A continuación, coloca una mancuerna sobre la pierna, a la altura de la cadera, en el lado que va a trabajar; despega ligeramente el glúteo del suelo para generar tensión y una ligera contracción previa, y separa del suelo la pierna contralateral según comodidad. Desde este punto, comienza a realizar la fase concéntrica contrayendo cada vez más el glúteo, con la barbilla hacia tu esternón y manteniendo la columna neutra durante todo el recorrido. Aguanta una ligera pausa en el punto de máxima contracción y desciende de forma controlada hasta la posición inicial de nuevo, evitando tocar el suelo con el glúteo y perder tensión.$t$,
  cues=array[$t$La mirada debe ir preferentemente al frente: imagina que tienes que sujetar una pelota contra el pecho con tu barbilla.$t$,
    $t$Realiza retroversión pélvica apretando el glúteo en la parte superior.$t$,
    $t$Pie rotado externamente y tibia en perpendicular al suelo, rodilla a 90º.$t$,
    $t$Mantén tensión constante y sujeta la mancuerna todo el recorrido.$t$]::text[]
where id=448;

-- 449 · Hipthrust Unilateral con Barra
update exercises set
  description=$t$La variante unilateral con barra de la extensión de cadera puede ser interesante a partir de que el atleta tenga ya cierto nivel, tanto de fuerza como de estabilidad, al ser más compleja que con mancuerna. Permite añadir una mayor carga externa, pero resulta más difícil de dominar y estabilizar. La pierna libre puede permanecer doblada o separada del suelo. También puede ser interesante valorar incluir esta variante en un rango de repeticiones alto, buscando un mayor estrés metabólico.$t$,
  execution=$t$Apoya el borde inferior de tus escápulas en un banco, cajón o similar mientras sitúas el pie del lado que va a trabajar ligeramente rotado hacia afuera, en una posición que permita situar rodilla, tibia y pie alineados en perpendicular al suelo, formando un ángulo de 90º aproximadamente. A continuación, coloca una barra sobre tu pelvis, sujetándola con un agarre amplio para generar estabilidad lateral. Despega ligeramente el glúteo del suelo para generar tensión y una ligera contracción previa, y separa del suelo la pierna contralateral según comodidad. Desde este punto, comienza a realizar la fase concéntrica contrayendo el glúteo, con la mirada al frente y la barbilla hacia tu esternón, manteniendo la columna neutra durante todo el recorrido. Aguanta una ligera pausa en el punto de máxima contracción y desciende de forma controlada hasta la posición inicial de nuevo, evitando tocar el suelo con los discos o el glúteo y perder tensión.$t$,
  cues=array[$t$La mirada debe ir preferentemente al frente: imagina que tienes que sujetar una pelota contra el pecho con tu barbilla.$t$,
    $t$Realiza retroversión pélvica apretando el glúteo en la parte superior.$t$,
    $t$Pie rotado externamente y tibia en perpendicular al suelo, rodilla a 90º.$t$,
    $t$Mantén la tensión constante y sujeta la barra durante todo el recorrido.$t$]::text[]
where id=449;

-- 450 · Extensión de Cadera o Hip Thrust en Máquina
update exercises set
  description=$t$Este ejercicio se trata de un hip thrust en máquina guiada, por lo que puede facilitar enormemente la realización del ejercicio en cuanto al montaje, el tiempo no efectivo de la sesión, la estabilidad del movimiento e incluso la propia comodidad, al permitir centrarse únicamente en aplicar fuerza con el glúteo. Sin embargo, la realización y las características del ejercicio pueden variar según el diseño o la disposición de la máquina, así como según la forma de carga del peso (plate-loaded o placas), lo que hará que sea más o menos recomendable. La realización del movimiento, sin embargo, sí es similar a la de otros ejercicios de extensión de cadera.$t$,
  execution=$t$Túmbate apoyando tus escápulas y el torso en el respaldo de la máquina, sitúa la almohadilla, el cinturón o la barra guiada sobre tu cadera y, a la vez, coloca los pies sobre la plataforma, rotados hacia afuera unos 10-20º aproximadamente, según comodidad, con la tibia en perpendicular al fémur y la rodilla a unos 90º. Contrae ligeramente el glúteo y comienza a extender la cadera a la vez que realizas una contracción cada vez más fuerte, hasta llegar a una extensión completa de cadera, donde además puedes realizar retroversión pélvica apretando más el glúteo; recuerda mantener la columna neutra durante todo el recorrido. Desde el punto más alto, desciende de forma controlada a la posición inicial de nuevo, evitando rebotar o usar inercias para la siguiente concéntrica.$t$,
  cues=array[$t$La mirada debe ir preferentemente al frente: imagina que tienes que sujetar una pelota contra el pecho con tu barbilla.$t$,
    $t$Realiza retroversión pélvica en la parte superior.$t$,
    $t$Realiza una extensión completa de cadera, manteniendo la columna neutra.$t$,
    $t$Realiza el rango de movimiento más completo que te permita la máquina, manteniendo la tensión constante y realizando un movimiento controlado.$t$]::text[]
where id=450;

-- 451 · Cable Pull Through
update exercises set
  description=$t$Este ejercicio se trata de una extensión de cadera desde polea baja mientras sujetamos una cuerda, una toalla o un agarre para generar tensión. La altura de la polea puede regularse ligeramente, pero debe estar en una posición por debajo de la cadera. Se trata de un buen ejercicio, especialmente de cara al aprendizaje del correcto patrón de bisagra de cadera y del control de la anteversión y la retroversión de la cadera y del glúteo, al tener una carga que tira de nosotros hacia atrás generando tensión. También puede usarse, por ejemplo, como preactivación.$t$,
  execution=$t$Con una polea situada en una posición baja, ata una cuerda o una toalla a la misma y sujétala con un agarre neutro. Con el agarre cogido, avanza 2-4 pasos hacia delante para generar tensión antes de comenzar el movimiento; sitúa tus pies rotados ligeramente hacia afuera y a una anchura algo superior a la de tus hombros. Comienza el ejercicio con la fase excéntrica, pensando en llevar la cadera hacia atrás todo lo que puedas: las rodillas no deben dominar el movimiento flexionándose y extendiéndose, como ocurre en una sentadilla, sino que deben comportarse de forma similar a un peso muerto rumano. Continúa llevando la cadera hacia atrás de forma controlada, sintiendo el estiramiento, hasta alcanzar el punto máximo, y desde ahí comienza a contraer el glúteo fuertemente, extendiendo de nuevo la cadera hasta alinearla con la línea de tus hombros; no hiperextiendas la zona lumbar: el movimiento debe provenir únicamente de la cadera. Para realizar correctamente el ejercicio, haz retroversión pélvica en el punto de máxima contracción, como si quisieras sujetar un billete con las nalgas. Debes buscar mantener la columna neutra todo el movimiento, pero en ese punto puedes realizar una ligera cifosis al tiempo que haces la retroversión pélvica, apretando al máximo el glúteo. Aguanta la contracción y regresa controlando la excéntrica para realizar otra repetición.$t$,
  cues=array[$t$Realiza retroversión pélvica en el punto de máxima contracción.$t$,
    $t$Piensa en llevar la cadera hacia atrás a modo de bisagra; no realices el movimiento con las rodillas ni con la espalda.$t$,
    $t$La columna debe permanecer neutra pero puedes realizar una ligera cifosis al hacer retroversión pélvica mientras miras hacia abajo en la máxima contracción.$t$]::text[]
where id=451;

-- 452 · Cable Kick Back
update exercises set
  description=$t$La patada de glúteo desde polea baja es otro de los movimientos de extensión de cadera; en este caso, existe algo de extensión de rodilla que puede restar protagonismo al glúteo en el movimiento. Es fundamental que exista una buena conexión mente-músculo, y es interesante realizarlo en un rango de repeticiones medio-alto para progresar en repeticiones y subir la carga sin poner en riesgo la técnica. También puede tener un componente más metabólico.$t$,
  execution=$t$Coloca la tobillera atada a la polea y sitúa la pierna que va a trabajar alineada con el cable, mientras agarras un apoyo o soporte con las manos para generar mayor estabilidad en el movimiento. No mantengas el torso vertical, sino que debes buscar una inclinación de unos 40-60º según comodidad y sensaciones, aunque puedes partir desde una posición más vertical e inclinarte un poco más a medida que elevas la pierna, evitando excesivos impulsos con el cuerpo para realizar el movimiento. Una vez estés en una posición estable, con el cable alineado y el torso inclinado, dobla ligeramente la rodilla, realiza una rotación externa de cadera para que la punta del pie apunte hacia afuera y aléjalo ligeramente para generar tensión mientras contraes ligeramente el glúteo. Desde aquí, comienza a extender la cadera contrayendo el glúteo cada vez más fuerte, como si quisieras dar una patada hacia atrás, pensando en llevar el pie hacia arriba y pudiendo alejarlo ligeramente en diagonal hacia el exterior en la parte final. Resiste la bajada del peso durante la fase excéntrica, evitando dejarlo caer y realizar movimientos bruscos o rápidos, tanto en la subida como en la bajada.$t$,
  cues=array[$t$Piensa en hacer una trayectoria angular hacia arriba con el pie, desde tu glúteo. Evita llevarlo en horizontal extendiendo la rodilla.$t$,
    $t$Mantén la pierna con una ligera rotación externa.$t$,
    $t$Realiza un movimiento controlado y resiste el descenso durante la excéntrica.$t$,
    $t$Agarra un apoyo estable con las manos y no te impulses excesivamente con el torso, aunque puede haber algo de movimiento.$t$]::text[]
where id=452;

-- 453 · Leg Swing
update exercises set
  description=$t$Este ejercicio se trata de una abducción de cadera dentro del plano frontal en la que utilizaremos una tobillera y una polea baja a modo de resistencia. Implica en gran medida al glúteo medio, aunque también al glúteo mayor, al ser una abducción de cadera manteniéndola extendida. No es necesario llevar la cadera hasta los 90º de abducción; basta con llegar a una posición cómoda que permita mantener la tensión, de entre 60 y 75º. Puede utilizarse también como calentamiento o preactivación.$t$,
  execution=$t$Colócate de pie al lado de la polea, situada en su punto más bajo, con la tobillera en la pierna más alejada de la polea y atada a la misma, con el cable cruzando por delante o por detrás de la otra pierna en función de la preferencia, siendo lo más común por delante. Coloca el pie más cercano a la polea debajo del hombro del mismo lado, agárrate a un apoyo con la mano para generar más estabilidad y, mientras mantienes la cadera extendida, comienza, sin impulsos bruscos, a alejar el pie y el fémur del centro de tu cuerpo de forma controlada. Puedes aguantar arriba brevemente la contracción y regresar a la posición inicial, evitando que la pierna quede totalmente vertical para que siempre haya algo de tensión antes de la siguiente concéntrica; mantén la mirada al frente y evita impulsarte inclinando el cuerpo.$t$
where id=453;

-- 454 · Abducciones en Máquina
update exercises set
  description=$t$Las abducciones en máquina son, sin duda, uno de los ejercicios más utilizados para el desarrollo del glúteo. Es un ejercicio interesante para trabajar en un plano diferente a otros, aunque con algunos matices, como el rango de repeticiones, que típicamente se ha llevado incluso hasta las 100, algo que no sería interesante, aunque lógicamente tiene una mayor cabida dentro de un rango alto de repeticiones por el propio movimiento, alcanzando la tensión mecánica a través de un alto estrés metabólico. Al contrario de lo que mucha gente cree, no trabaja de forma única y principal el glúteo medio, sino que el glúteo mayor también interviene de forma importante; además, puede tener cabida como ejercicio de preactivación y calentamiento. Existen muchas variantes en las que puede variar la posición del torso y de la cadera.$t$,
  execution=$t$Siéntate en la máquina apoyando la cadera y el torso contra el respaldo a la vez que agarras las manetas para generar una posición estable. Sitúa los pies sobre los soportes y coloca tus rodillas contra las almohadillas laterales de la máquina: la fuerza deberás aplicarla desde aquí. A continuación, separa muy ligeramente las rodillas, generando tensión sobre el glúteo; esta será la posición inicial del ejercicio. Desde aquí, comienza a separar tus rodillas horizontalmente, como si quisieras alejarlas lo máximo posible la una de la otra, a la vez que contraes de forma potente el glúteo. Una vez alcanzada la máxima contracción, desciende de forma controlada hasta la posición inicial, evitando que las placas choquen rebotando o generando inercias.$t$
where id=454;

-- 455 · Clam Shell 3D
update exercises set
  description=$t$Este ejercicio se trata de una variante del clam shell, o abducción de cadera tumbado lateralmente en el suelo, en la que se combina este patrón de movimiento con una extensión de cadera a medida que ascendemos. Puede ser un ejercicio muy interesante en algunos contextos, aunque, por su complejidad y su limitada capacidad de progresión, puede tener especial cabida dentro del calentamiento, como preactivación o llevándolo a un rango de repeticiones más alto, centrado en un componente más metabólico. Puede realizarse con una miniband en las rodillas y/o la cadera u otro tipo de resistencia añadida si el sujeto es capaz de realizarlo.$t$,
  execution=$t$Túmbate en el suelo lateralmente, apoyando el antebrazo y el codo sobre el suelo junto con la cadera, como en una plancha lateral, salvo que las rodillas y el tren inferior también están apoyados. Sitúa una rodilla sobre la otra, doblándolas a la altura de tu cadera; puedes añadir una goma, una miniband u otra resistencia entre las rodillas para generar resistencia a la abducción, o en la cadera una goma o un cinturón anclado a una polea para generar resistencia en la extensión. Desde esta posición, comienza a empujar con la rodilla contra el suelo como si quisieras traspasarlo, de forma que la cadera se despegue; al mismo tiempo, separa una rodilla de la otra mientras mantienes los pies unidos. La clave del movimiento es que, a medida que se realiza la abducción, se extienda la cadera, contrayendo el glúteo y llevándola hacia delante hasta alinear hombro y cadera. Desde el punto de máxima contracción del glúteo, regresa de forma controlada a la posición inicial, pudiendo apoyar el peso en el suelo.$t$,
  cues=array[$t$Piensa en empujar con la rodilla apoyada contra el suelo a la vez que sacas la cadera extendiéndola y pudiendo añadir una ligera retroversión.$t$,
    $t$Valora añadir una goma elástica o resistencia en las rodillas y/o en la cadera.$t$,
    $t$Realiza primero el movimiento de abducción y posteriormente el de extensión.$t$,
    $t$Sitúa tu cuerpo en una posición estable apoyando el antebrazo por completo.$t$,
    $t$Imagina que quieres separar las rodillas mientras llevas la cadera a la línea del hombro contrayendo el glúteo.$t$]::text[]
where id=455;

-- 456 · Reverse Glute Hyperextensions en Multipower
update exercises set
  description=$t$Este ejercicio es, sin duda, uno de los mejores que puedes realizar como extensión de cadera dominante de glúteo; podría decirse incluso que es superior a su realización en una máquina de hiperextensiones inversas, puesto que en este caso la rodilla va doblada para reducir la participación de los isquiosurales en la extensión de la cadera, dejando el papel principal al glúteo. Es un ejercicio complejo a nivel técnico, en el que la mayoría tiende a colocarse mal o a hacer fuerza en exceso a través de una hiperextensión lumbar; busca realizar el ejercicio lento y controlado, únicamente desde el glúteo, contrayéndolo fuerte. La multipower aporta la ventaja de la estabilidad en la trayectoria a un ejercicio que con peso libre sería prácticamente inconcebible.$t$,
  execution=$t$Túmbate boca abajo sobre un banco con la parte más estrecha apuntando hacia la multipower, de forma que te será más sencillo sacar las piernas a ambos lados del mismo. Agarra con las manos los laterales del banco para estabilizar lo máximo posible tu posición; ahora coloca los pies sobre la barra de la multipower con una anchura superior al ancho de tus hombros, rotados ligeramente hacia afuera con una ligera rotación de la cadera. Desde esta posición, comienza a aplicar fuerza hacia arriba, extendiendo la cadera y contrayendo el glúteo hasta alcanzar una extensión casi completa, lo máximo que te permita el movimiento sin extender la rodilla ni forzar una excesiva lordosis lumbar. Piensa únicamente en alejar la barra del banco mientras realizas un movimiento controlado y lento, tanto en la fase excéntrica como en la concéntrica. Evita realizar movimientos excesivamente bruscos o rápidos.$t$,
  cues=array[$t$Céntrate en contraer el glúteo y apretar todo lo que puedas arriba.$t$,
    $t$Rota ligeramente hacia afuera los pies, sitúalos a un ancho superior a tus hombros y apoya la barra en el mediopié o en el talón.$t$,
    $t$Evita que el movimiento sea demasiado rápido, sube y baja controlando.$t$,
    $t$No hiperextiendas la zona lumbar para buscar una mayor elevación de la barra.$t$]::text[]
where id=456;

-- 457 · Patada en Cuadrupedia Multipower
update exercises set
  description=$t$Esta variante de patada de glúteo cuenta con una gran ventaja al realizarse en multipower, a nivel de estabilidad y de trayectoria vertical de la barra. Otras variantes de patada tienden a ir muy horizontalizadas, por lo que es posible acabar poniendo más énfasis en extender la rodilla; en este caso, la rodilla permanece doblada durante todo el movimiento, por lo que sacamos en gran medida a los isquiosurales del movimiento de extensión de cadera, dejando un mayor protagonismo al glúteo. Encontrar una posición estable con el torso es fundamental para poder centrarse en el movimiento.$t$,
  execution=$t$Sitúate en cuadrupedia delante de la multipower, colocando las rodillas por delante de la trayectoria de la barra, pero no excesivamente lejos, ya que impediría mantener la rodilla doblada; dobla los codos para apoyar ambos antebrazos y poder generar una posición más estable con el cuerpo. Ahora dobla la rodilla del lado que va a trabajar y apoya el pie sobre la barra, en la zona del talón o del mediopié, realizando una ligera rotación externa. Desde aquí, comienza a aplicar fuerza hacia arriba, buscando alejar lo máximo posible la barra del suelo y centrándote en contraer el glúteo y extender la cadera. Realiza el movimiento de forma controlada, sin grandes impulsos o patadas, y desciende de nuevo hasta la posición inicial, controlando que la bajada o fase excéntrica no sea excesivamente rápida.$t$,
  cues=array[$t$Céntrate en contraer el glúteo y apretar todo lo que puedas hacia arriba.$t$,
    $t$Rota ligeramente el pie hacia afuera y apoya la barra en el mediopié o en el talón.$t$,
    $t$Evita que el movimiento sea demasiado rápido; sube y baja controlando.$t$,
    $t$No hiperextiendas la zona lumbar para buscar una mayor elevación de la barra.$t$]::text[]
where id=457;

-- 458 · Extensiones en Banco Inclinado 45º Focus Glúteo
update exercises set
  description=$t$Este ejercicio puede realizarse también con foco en los isquiosurales. Para realizarlo necesitamos un banco de hiperextensiones o banco romano, que podemos colocar con mayor o menor inclinación según nuestro objetivo, y utilizar una mancuerna, una barra, un disco o incluso gomas para lastrar el movimiento y añadir carga. Se trata de un buen ejercicio para trabajar toda la cadena posterior; nos será imposible aislar por completo el glúteo, pero sí podemos ajustar nuestra posición y nuestro foco para darle algo más de protagonismo. Si tu objetivo es trabajar pesado, deberías optar por otros ejercicios.$t$,
  execution=$t$Colócate en el banco romano situando la parte superior del apoyo por debajo de las caderas, en la medida de lo posible, y sitúalo en un grado de inclinación adecuado según tus objetivos, ya que la inclinación cambiará la parte del recorrido que resulta más difícil (en torno a 45º, la parte superior será la más exigente). Coloca tus pies en el apoyo del banco realizando una ligera rotación externa (las punteras apuntan hacia afuera), manteniendo alineados tobillo y rodilla y con una anchura de piernas ligeramente superior a la de tus hombros. A continuación, sujetando una barra con un agarre amplio para permitir mayor ROM (en su defecto, puedes utilizar un disco, una mancuerna o gomas), comienza a descender hasta el punto más bajo. Una vez en esta posición, comienza a contraer el glúteo de forma principal para extender la cadera; mantén tu espalda alta redondeada, con una ligera cifosis, y el cuello neutro o ligeramente flexionado. Arriba, realiza retroversión pélvica, metiendo el glúteo hacia dentro y buscando contraerlo y reclutarlo al máximo.$t$
where id=458;

-- 459 · Clam Shell
update exercises set
  description=$t$Este ejercicio se trata de una abducción de cadera con las rodillas dobladas y tumbados lateralmente sobre el suelo. Es una variante más sencilla que el Clam Shell 3D, al no combinar la abducción con la extensión de cadera, y en muchos casos puede resultar interesante realizarla, especialmente como calentamiento o preactivación. Uno de sus mayores inconvenientes es la limitada capacidad de progresión que permite el ejercicio a largo plazo al utilizar una miniband a modo de carga, por lo que, aunque existen otras formas de progresar, no debería ser la base de tus sesiones de entrenamiento de glúteo.$t$,
  execution=$t$Túmbate en el suelo lateralmente, apoyando el antebrazo y el codo para generar un apoyo estable, de forma similar a la posición de una plancha lateral, salvo porque la cadera y las rodillas están apoyadas. Sitúa una rodilla sobre la otra y añade una miniband, una goma o una resistencia sobre las mismas. Desde este punto de partida, comienza a separar la rodilla situada en la parte superior, buscando alejarla lateralmente al máximo de la otra mientras mantienes los pies unidos. Sepáralas lo máximo que puedas de forma controlada, hasta llevar la rodilla superior aproximadamente a la línea de tu torso; no vuelvas bruscamente a la posición inicial, ya que debes intentar mantener la resistencia en la fase excéntrica, evitando en la medida de lo posible que la goma se destense por completo durante todo el movimiento.$t$,
  cues=array[$t$Sitúa tu cuerpo en una posición estable apoyando el antebrazo por completo.$t$,
    $t$Imagina que quieres separar las rodillas horizontalmente hasta llevar la rodilla a la línea del torso.$t$,
    $t$Mantén la tensión constante, con un movimiento lento y controlado.$t$]::text[]
where id=459;

-- 460 · Abducciones con Miniband
update exercises set
  description=$t$Esta variante de abducciones es muy utilizada para entrenar el glúteo; sin embargo, debemos ser conscientes de que realizarlas en máquina resulta una opción muy superior de cara a realizar un movimiento similar. Esto no quiere decir que realizarlas con goma sea inútil: en muchos casos, dependiendo del contexto y del material, puede resultar realmente útil, pero en caso de utilizar esta variante podría ser más aconsejable mantenerla como preactivación o trabajo previo a unas extensiones de cadera de cualquier tipo, o como parte del calentamiento en un día de pierna. También la podemos considerar un ejercicio interesante para trabajar en un plano diferente a otros, aunque con algunos matices similares a los explicados en las abducciones en máquina. Se enfoca más al trabajo del glúteo mayor que del medio. Existen muchas variantes en las que se puede variar la posición del torso y de la cadera.$t$,
  execution=$t$Siéntate sobre un banco, un step o similar, con los pies apoyados en el suelo. A continuación, sitúa una banda o miniband a la altura de tus rodillas (puede ir por encima o por debajo) y apoya las manos en el asiento para buscar una posición estable, o sobre tus glúteos si te ayuda a sentir mejor el ejercicio. Desde esta posición, separa ligeramente las rodillas para generar tensión inicial y comienza la fase concéntrica, buscando separarlas lo máximo posible horizontalmente, cada una hacia un lado, a la vez que contraes de forma potente el glúteo. Una vez alcanzada la máxima contracción, vuelve de forma lenta y controlada hasta la posición inicial, evitando que la goma pierda tensión entre repeticiones.$t$,
  cues=array[$t$Realiza un movimiento controlado, evita repeticiones rápidas o con rebotes.$t$,
    $t$Evita perder tensión en la fase excéntrica.$t$,
    $t$Piensa en separar al máximo una rodilla de la otra horizontalmente.$t$]::text[]
where id=460;

-- 461 · Patada de Glúteo en Polea Baja en Cuadrupedia
update exercises set
  description=$t$Esta variante de patada de glúteo en polea es muy popular en los gimnasios; sin embargo, debido a la posición de la cadera y del cuerpo, a priori resulta una opción generalmente inferior a su homóloga en polea baja de pie, cuyo montaje es además mucho más sencillo; o, en caso de buscar una patada en cuadrupedia, podría optarse por realizarla en multipower, generalmente también con mejores sensaciones y estímulo. Pese a todo, puede ser una opción interesante en ciertos casos.$t$,
  execution=$t$Sitúa un banco en paralelo a la polea, de forma que la pierna que va a ejecutar el movimiento quede libre para realizarlo y alineada con la polea, por lo que deberás desplazar el banco lateralmente; a continuación, colócate una tobillera y ánclala a la polea, con la pierna que va a trabajar alineada con el cable, mientras agarras la parte frontal del banco a modo de apoyo. Una vez estés en una posición estable, con el cable alineado y en cuadrupedia, dobla la rodilla, realiza una rotación externa de cadera para que la punta del pie apunte hacia afuera y comienza a alejar el pie extendiendo la cadera mientras contraes el glúteo, realizando una trayectoria ligeramente angular y diagonal hasta extender por completo la cadera; desde ese punto, resiste la fase excéntrica hasta volver a la posición inicial. Evita realizar rebotes o impulsos para pasar de una fase a otra; puedes hacer una pausa entre ambas.$t$,
  cues=array[$t$Piensa en describir una trayectoria angular hacia arriba y hacia afuera; no la lleves en horizontal extendiendo la rodilla.$t$,
    $t$Mantén una ligera rotación externa de cadera.$t$,
    $t$Realiza un movimiento controlado y resiste el descenso durante la excéntrica.$t$]::text[]
where id=461;

-- 462 · Frog Pumps
update exercises set
  description=$t$Este ejercicio ha sido popularizado por el investigador Bret Contreras; se trata de una extensión de cadera desde el suelo similar a un glute bridge, con la diferencia de que permanecemos con las plantas de los pies enfrentadas una contra otra en lugar de apoyadas en el suelo, con las rodillas dobladas y abiertas hacia afuera. La lógica de situarnos en esta posición durante el ejercicio es que, al sumar a la extensión de cadera una posición de abducción y rotación externa, podría producirse una mayor activación del glúteo. Es un ejercicio al que pueden añadirse mancuernas, barras, multipower o incluso gomas, además de realizarlo con el propio peso corporal. Puede ser una buena opción en muchos contextos, pero no como ejercicio principal de la sesión.$t$,
  execution=$t$Túmbate en el suelo, apoyando toda la espalda sobre él y pudiendo añadir opcionalmente un apoyo bajo tu cabeza para mayor comodidad, con una ligera flexión que acerque tu barbilla a tu pecho, mientras enfrentas un pie contra otro, buscando el contacto de ambos talones y apretándolos; no es necesario que se toquen las puntas de los pies. Desde esta posición, en caso de que vayas a usar una mancuerna o una barra, colócala sobre tu cadera y comienza a extender la cadera hasta hacerlo por completo; trata de mantener la columna neutra, evitando hiperextenderla para elevarte más, aprieta el glúteo y realiza retroversión pélvica. Desciende de forma controlada a la posición inicial.$t$,
  cues=array[$t$Sitúa los codos a los lados de tus costillas y clávalos contra el suelo.$t$,
    $t$Busca realizar la máxima extensión y retroversión pélvica, añadiendo una pausa en la parte más alta y de máxima contracción del movimiento.$t$,
    $t$Mantén los pies enfrentados, apretando un talón contra el otro.$t$]::text[]
where id=462;

-- 463 · Kick Back en Máquina
update exercises set
  description=$t$La realización a nivel técnico de este ejercicio, así como que pueda ser una variante más o menos interesante, depende mayormente del diseño de la máquina, que puede variar enormemente tanto en la trayectoria del movimiento como en la posición de articulaciones fundamentales como la rodilla o la cadera. Se debe buscar que, en la medida de lo posible, el glúteo sea el músculo objetivo y el motor principal de esta acción, por lo que generalmente son preferibles aquellas máquinas que mantienen la rodilla doblada a la hora de extender la cadera. Esta descripción corresponde a una máquina de patada con apoyo para el torso; existen también máquinas de patada plate-loaded (p. ej., Technogym) o de pie (p. ej., Matrix o Gervasport).$t$,
  execution=$t$Túmbate sobre el apoyo de la máquina, dejando caer todo tu peso sobre él y agarrando fuertemente las manetas, mientras apoyas la rodilla de la pierna que no trabaja sobre el apoyo y el pie de la que trabajará sobre la plataforma; realiza una ligera rotación externa de cadera, de modo que el pie apunte hacia afuera. Desde aquí, manteniendo la rodilla doblada para una mayor implicación del glúteo, comienza a empujar fuertemente contra la plataforma hasta llevar la pierna hacia atrás y hacia arriba (posición similar a una patada de glúteo en multipower) y, una vez alcanzado el ROM completo, aguanta ligeramente la contracción y desciende de forma controlada.$t$,
  cues=array[$t$Céntrate en contraer y apretar el glúteo. Aguanta brevemente la contracción de forma isométrica.$t$,
    $t$Si es posible, busca una ligera rotación externa de cadera.$t$,
    $t$No hiperextiendas la zona lumbar para elevar más la plataforma.$t$,
    $t$Busca un apoyo estable: si es posible, agarra las manetas y apoya todo el peso de tu torso sobre el soporte, si la máquina cuenta con él.$t$]::text[]
where id=463;

-- 464 · Reverse Glute Hyperextensions en Máquina
update exercises set
  description=$t$Este ejercicio se realiza típicamente en la máquina diseñada para él por Westside Barbell o similar. Se trata de un ejercicio que puede utilizarse como alternativa a las hiperextensiones en banco romano (o a 45º) y que, de hecho, podría ser superior en algunas situaciones y objetivos. Parece ser que este ejercicio aporta un menor estrés angular a nivel lumbar y un mayor ROM para la cadera (49), con una activación incluso superior de casi toda la musculatura de la cadena posterior, especialmente del glúteo mayor, pero no del bíceps femoral (50).$t$,
  execution=$t$Túmbate apoyando todo tu abdomen en el apoyo de la máquina, dejando tu cadera sobresaliendo por el borde del mismo mientras sujetas las manetas. Introduce los pies en el cinturón inferior, situándolo sobre tus gemelos en una posición cómoda. A continuación, comienza a traccionar ligeramente de los agarres con las manos para situarte en una posición estable desde la que poder ejercer la fuerza con el tren inferior. Una vez ahí, con las puntas de los pies apuntando hacia afuera para generar una rotación externa, comienza a extender la cadera hasta alcanzar o romper ligeramente la línea paralela que forma la máquina con el suelo, evitando generar una hiperlordosis lumbar excesiva. Aguanta ligeramente la contracción y desciende de forma controlada hasta la posición inicial.$t$,
  cues=array[$t$Realiza rotación externa, las puntas de tus pies deben apuntar hacia afuera.$t$,
    $t$Evita una hiperlordosis lumbar excesiva: no es necesario que lleves los pies lo más alto que puedas; basta con alcanzar o traspasar ligeramente la paralela.$t$,
    $t$Aguanta la contracción y controla la fase excéntrica.$t$,
    $t$Tracciona ligeramente con las manos para estar estable.$t$]::text[]
where id=464;

-- 465 · Monster Walks
update exercises set
  description=$t$Este ejercicio es muy popular a la hora de trabajar el glúteo; sin embargo, por su propia naturaleza no es de los mejores ni de los más adecuados para la hipertrofia: en primer lugar, la progresión en cargas a largo plazo resulta más difícil al utilizarse gomas elásticas; en segundo lugar, es difícil que la musculatura del glúteo, y concretamente el glúteo medio, alcance una intensidad cercana al fallo en un rango de repeticiones adecuado como para que sea efectivo. Puede ser una buena alternativa como calentamiento o preactivación, entre otros objetivos, pero nunca debería considerarse un ejercicio principal.$t$,
  execution=$t$De pie, coloca una miniband en los tobillos o en las rodillas. A continuación, flexiona ligeramente las rodillas y la cadera, apoyando las manos sobre ella. Desde aquí, comienza a dar pasos laterales, buscando que en ningún momento se acerquen en exceso ambos pies, para evitar que la goma se destense durante el ejercicio. Piensa en alejar el pie de la línea media de tu cuerpo, manteniendo en todo momento el control del movimiento y una tensión constante. Puedes dar todos los pasos hacia un mismo lado o alternar, según preferencia.$t$,
  cues=array[$t$Mantén tensión constante, evita que la goma se destense.$t$,
    $t$Flexiona ligeramente la cadera y apoya las manos sobre ella.$t$,
    $t$Piensa en alejar tu pie de la línea media de tu cuerpo.$t$]::text[]
where id=465;

-- 466 · Glute Press Down
update exercises set
  description=$t$Este ejercicio se ha vuelto muy popular entre muchas personas con el objetivo de trabajar los glúteos. Se realiza en una máquina de fondos y dominadas asistidos y se centra en una extensión de cadera, una de las funciones principales de este músculo. No obstante, realizar así la extensión de cadera tiene ciertas limitaciones, ya que solo trabajaríamos la parte inicial del recorrido, dejando los últimos grados de extensión sin un estímulo efectivo. Otra limitación a solventar es evitar que el ejercicio se convierta en dominante de rodilla, en cuyo caso el cuádriceps se llevaría un mayor protagonismo.$t$,
  execution=$t$Para comenzar, sujétate bien a la máquina. A continuación, coloca el pie adelantado apoyándolo sobre la almohadilla y empuja hacia abajo tratando de transferir la fuerza de empuje a tu talón, sin acelerar en exceso al principio, ya que la propia inercia haría parte del recorrido sin tensión. Una vez completada la fase concéntrica con control e intención, realiza la fase excéntrica de forma controlada. No uses cargas demasiado altas, ya que la estabilidad podría verse comprometida.$t$,
  cues=array[$t$Mantén una alineación en el plano sagital de las articulaciones de la cadera, rodilla y tobillo.$t$,
    $t$Procura que no haya impulsos ni balanceos.$t$,
    $t$Empuja desde el talón.$t$,
    $t$Control e intención: la primera y la última repetición deben ser iguales; solo se admite pérdida de velocidad.$t$,
    $t$Sujétate bien a la máquina.$t$]::text[]
where id=466;

-- 467 · Sentadilla en Multipower
update exercises set
  description=$t$Este ejercicio es, sin duda, una de las variantes de sentadilla más adecuadas para enfatizar el trabajo de cuádriceps, ya que permite una mayor verticalidad del torso que otros tipos de variantes, aumentando el brazo de momento sobre la rodilla, además de permitir trabajar en condiciones de gran estabilidad y seguridad, aplicar fuerza intencional sin riesgo de caernos y ofrecer una gran capacidad de progresión, de flexión de rodilla y de rango de movimiento.$t$,
  execution=$t$Agarra la barra con una anchura cómoda, similar al ancho de los hombros, y colócate debajo de la multipower, apoyando la barra sobre tus trapecios (posición de barra alta). Sitúa los pies en una posición (stance) cómoda: la anchura puede variar según la persona, pero puedes tomar como referencia de partida la anchura de tus hombros y evitar posiciones excesivamente anchas o estrechas. En cuanto a la distancia, sitúa los pies en un punto cómodo que te permita el máximo ROM; lo habitual es colocarlos ligeramente adelantados respecto a la barra, aunque puedes alejarlos un poco más. A continuación, desencaja la barra y comienza a descender de forma lenta y controlada, buscando la máxima flexión de rodilla posible y una profundidad en la que aplastes isquiosurales y gemelos; sin rebotes, comienza a subir. Piensa en subir aplicando fuerza con los pies hacia delante y empujándote hacia atrás para un mayor estímulo sobre el cuádriceps; busca mantener la verticalidad en el ascenso y el descenso. Puede ser útil utilizar un alza bajo los talones para tener más ROM.$t$,
  cues=array[$t$Mientras empujas hacia arriba, piensa en empujar hacia delante con los pies y hacia atrás con la espalda durante la fase concéntrica.$t$,
    $t$Realiza el movimiento lo máximo posible dentro del plano sagital y lleva las rodillas lo más adelante posible. Evita que se abran o colapsen.$t$,
    $t$Piensa en aplastar tus gemelos y tus isquiosurales; si tu movilidad te lo permite, busca una flexión de rodilla completa, sin que se despeguen los talones.$t$,
    $t$Busca un stance cómodo en cuanto a anchura y distancia de pies respecto a la barra que maximice el rango de movimiento.$t$]::text[]
where id=467;

-- 468 · Sentadilla Hack
update exercises set
  description=$t$Esta es posiblemente la mejor variante de sentadilla para el trabajo del cuádriceps si se realiza de forma correcta. Al ir guiada y contar con un respaldo, además de agarraderas, permite una gran estabilidad y seguridad, así como aplicar fuerza intencional hacia delante con los pies, empujándonos hacia atrás. También tiene una gran facilidad de progresión a largo plazo y permite aplicar un gran esfuerzo.$t$,
  execution=$t$Apóyate contra el respaldo de la máquina con toda tu espalda, cabeza y hombros, y sitúa las manos en las agarraderas, con los codos apuntando hacia delante en una posición cómoda, no muy abiertos. Coloca los pies en la posición más baja posible que te permita bajar sin despegar los talones; puede ser útil utilizar unas zapatillas con tacón para tener más ROM. Comienza a descender de forma lenta y controlada; piensa en aplastar tus gemelos con tus isquiosurales y, una vez alcanzada la máxima profundidad, sin inercias ni impulsos, comienza a subir aplicando fuerza hacia arriba y hacia delante con los pies para empujarte más fuerte contra el respaldo. Sube hasta la posición inicial; puedes no llegar a bloquear del todo la rodilla para mantener la tensión constante, o hacerlo si te sientes más cómodo.$t$,
  cues=array[$t$Mientras empujas hacia arriba, piensa en empujar hacia delante con tus pies, buscando empujarte contra el respaldo.$t$,
    $t$Realiza el movimiento lo máximo posible dentro del plano sagital y lleva las rodillas lo más adelante posible; evita que se abran o colapsen.$t$,
    $t$Piensa en aplastar tus gemelos con tus isquiosurales; si tu movilidad te lo permite, busca una flexión de rodilla completa.$t$,
    $t$Busca un stance cómodo que maximice el ROM, sin despegar los talones.$t$]::text[]
where id=468;

-- 469 · Split Squat en Multipower
update exercises set
  description=$t$Este ejercicio busca enfocar el trabajo sobre el cuádriceps de forma unilateral, añadiendo además la ventaja de permitir realizarlo de forma guiada, solventando el problema de inestabilidad que puede generar desplazar la carga de forma libre. Para algunas personas puede ser una buena alternativa a una sentadilla búlgara, al apoyarse el pie trasero sobre el suelo y no sobre un banco, si este genera incomodidad o no se dispone de uno, aunque a nivel de ejecución comparten similitudes.$t$,
  execution=$t$Agarra la barra de la multipower con una anchura superior a la de tus hombros, colócate apoyándola sobre tus trapecios y sitúa el pie delantero, el de la pierna que ejecutará la acción, ligeramente por delante de la barra, de forma que permita una buena flexión de rodilla sin despegar el talón del suelo; un tacón puede resultar útil. El pie trasero colócalo a modo de apoyo, simplemente situando la puntera o el mediopié sobre el suelo a una distancia cómoda por detrás de tu cadera. A continuación, comienza a descender pensando en llevar la rodilla delantera lo más adelante posible, sobrepasando la punta del pie. Desde el punto más bajo posible, comienza a subir empujando con el pie hacia delante; la pierna de atrás simplemente acompaña y da estabilidad. Sube sin llegar a bloquear del todo la rodilla para no quitar tensión. Realiza el movimiento de forma controlada, evitando que la rodilla se mueva hacia los lados.$t$
where id=469;

-- 470 · Split Squat Libre
update exercises set
  description=$t$Esta variante de split squat con barra libre puede ser una opción para el trabajo de cuádriceps de forma unilateral, aunque a largo plazo su progresión puede verse limitada por la estabilidad. Puede ser recomendable no llevarla a repeticiones muy altas, ya que la fatiga cardiovascular o la inestabilidad de la barra pueden acabar siendo el factor limitante. Usar unas zapatillas con tacón puede ser interesante.$t$,
  execution=$t$Sitúa la barra sobre tus trapecios, como en una sentadilla con barra alta, y coloca el pie delantero ligeramente por delante de tu torso, en un punto cómodo del suelo, mientras que la pierna de atrás se sitúa en una posición cómoda por detrás de tu cadera, algo alejada, y actuará únicamente acompañando la acción, apoyando sobre el suelo la punta del pie. A continuación, comienza a descender pensando en llevar la rodilla delantera lo más adelante posible y sobrepasar al máximo con ella la punta del pie. Desde abajo, comienza a subir empujando con el pie de la pierna delantera hacia delante y hacia abajo, sin llegar a bloquear del todo la rodilla para no perder tensión. Realiza el movimiento de forma controlada, evitando que la rodilla se mueva hacia los lados.$t$,
  cues=array[$t$Trata de mantener el torso vertical y perpendicular al suelo.$t$,
    $t$Aplica fuerza hacia delante y hacia abajo con el pie durante la fase concéntrica.$t$]::text[]
where id=470;

-- 471 · Prensa 45º
update exercises set
  description=$t$Este es posiblemente uno de los ejercicios más utilizados para trabajar el cuádriceps y, sin duda, es una buena opción si se realiza bien. Sin embargo, es más común verlo realizado de forma errónea que correcta. Para hacerlo bien, los pies deben ir en la parte baja de la plataforma, no en la alta, con una anchura similar al ancho de los hombros, ni excesivamente abierta ni con los pies juntos; además, el rango de movimiento debe ser el más completo que te permita tu movilidad, evitando convertirlo en un rango de movimiento mínimo.$t$,
  execution=$t$Túmbate en el asiento, preferiblemente con una inclinación baja que te permita comenzar el movimiento en una buena posición, con el glúteo y la cadera apoyados de forma que no se despeguen a lo largo del movimiento; si esto sucede, puedes colocar una esterilla bajo la cadera para reducirlo. Coloca los pies lo más abajo en la plataforma que te permita tu movilidad, ambos mirando aproximadamente rectos y con una anchura cómoda, en torno al ancho de tus hombros. Ahora agarra fuerte las manetas, incluso usando straps, para clavarte al asiento. Extiende ligeramente las rodillas para sacar el carro de la prensa de su posición y comienza a descender de forma lenta y controlada buscando la máxima flexión; piensa en aplastar tus gemelos con tus isquios, si tu movilidad te lo permite. Desde aquí, aplica fuerza de forma controlada extendiendo las rodillas hasta volver a la posición inicial; puedes bloquearlas, pero no es necesario.$t$,
  cues=array[$t$Coloca los pies abajo y con una anchura cómoda que permita maximizar el ROM (aproximadamente el ancho de tus hombros).$t$,
    $t$Realiza el máximo rango de recorrido posible; piensa en aplastar tus gemelos con tus isquios. No recortes ROM para subir peso.$t$,
    $t$Evita que se te despeguen los talones de la plataforma y que tus rodillas colapsen hacia dentro.$t$,
    $t$Evita rebotes o inercias que te ayuden en la fase concéntrica.$t$]::text[]
where id=471;

-- 472 · Prensa Horizontal
update exercises set
  description=$t$Este ejercicio se trata de una prensa horizontal guiada por raíles en la que la plataforma no se desplaza (al contrario que en modelos como la prensa horizontal plate-loaded), sino que lo hace el asiento con la persona que entrena. En función del diseño de la máquina, puede ser más o menos interesante al permitir un mayor o menor ROM. Además de por la estabilidad que aporta al movimiento, que permite aplicar un alto grado de esfuerzo, puede ser interesante trabajarla a 1 sola pierna cuando nos interese o, por ejemplo, si buscamos sustituir ejercicios como el split squat con barra libre porque no estamos cómodos.$t$,
  execution=$t$Colócate tumbado o sentado, en función de la posición del asiento, apoyando toda tu espalda sobre él; deberás evitar que se despegue durante todo el recorrido. Puedes colocar tus manos sobre las rodillas si te da más seguridad o tienes problemas de estabilidad, pero sin ayudarte con ellas; lo más aconsejable será agarrar fuertemente las manetas para aplicar más fuerza. Coloca los pies en posición neutra en la parte más baja de la plataforma que te permita una buena flexión de rodilla sin despegar el talón; situarlos en la posición más alta llevaría el estímulo más hacia el glúteo y la cadera que hacia el cuádriceps. Saca la máquina del soporte y comienza a descender de forma controlada hasta el máximo ROM que te permita tu movilidad; piensa en sobrepasar lo máximo posible la punta de tu pie con la rodilla. Una vez ahí, comienza la fase concéntrica hasta regresar a la posición inicial; puedes bloquear las rodillas, aunque es recomendable evitarlo para mantener una tensión constante.$t$,
  cues=array[$t$Coloca los pies abajo y en posición neutra, con una anchura que permita maximizar el ROM.$t$,
    $t$Realiza el máximo rango de recorrido posible, buscando la máxima flexión de rodilla.$t$,
    $t$Evita que se te despeguen los talones de la plataforma y que tus rodillas colapsen.$t$,
    $t$Piensa en sobrepasar las puntas de tus pies con las rodillas.$t$]::text[]
where id=472;

-- 473 · Sentadilla Búlgara en Multipower
update exercises set
  description=$t$La sentadilla búlgara es un gran ejercicio para el desarrollo del cuádriceps: si lo haces bien, lo odiarás y lo amarás a partes iguales. En ocasiones, elevar mucho el rango de repeticiones puede hacer que el limitante no sea el cuádriceps, sino la capacidad cardiovascular, motivo por el cual puede ser recomendable descansar entre ambas piernas al realizarlo. Esta variante en multipower es de las más interesantes, al ir guiada y poder trabajarse de forma estable y cómoda, manteniendo una gran verticalidad del torso con respecto al suelo y enfatizando más el cuádriceps.$t$,
  execution=$t$Agarra la barra de la multipower con una anchura superior a la de tus hombros, colócate apoyando la barra sobre tus trapecios, sitúa el pie delantero ligeramente por delante de tu torso (empieza probando justo debajo de la línea de tu pecho) y apoya el empeine o el tobillo de la pierna trasera sobre un banco; puedes apoyar también la tibia si estás más cómodo. Desde aquí, comienza a descender buscando adelantar todo lo que puedas la rodilla con respecto a la punta de tu pie; una vez alcanzado este punto, comienza la fase concéntrica aplicando fuerza hacia abajo y adelante con el pie para subir, llevando un mayor estímulo hacia el cuádriceps. Continúa hasta volver a la posición inicial; no es necesario bloquear la rodilla. Evita que la rodilla se desvíe lateralmente durante el movimiento: apunta hacia delante con ella.$t$
where id=473;

-- 474 · Sentadilla Búlgara con Mancuernas + Apoyo
update exercises set
  description=$t$El mayor problema que solemos encontrar cuando vemos realizar una sentadilla búlgara es la falta de estabilidad o la incomodidad, además de que elevar mucho el rango de repeticiones puede acabar haciendo que el cuádriceps no sea el limitante. Realizarla con 2 mancuernas implica mayores necesidades de estabilización que la variante en la que utilizamos 1 sola mancuerna junto con un apoyo de mano. Puedes colocar la mancuerna en el lado que quieras, pero preferiblemente sujétala con la mano de la pierna que ejecuta el movimiento: sujetarla con la mano contralateral puede requerir mayor estabilidad por parte de la cadera, al aumentar el brazo de momento en el plano frontal. Para llevar el estímulo al máximo hacia el cuádriceps, agárrate a un soporte con la mano libre, busca tener el torso vertical y adelanta todo lo posible la rodilla.$t$,
  execution=$t$Coge una mancuerna, a ser posible usando straps, y sitúala (generalmente) en el lado de la pierna que ejecutará el movimiento, es decir, la que se apoya en el suelo. Coloca el pie delantero en torno a la altura de tu torso, en un punto que te permita adelantar la rodilla sin despegar el talón; agárrate a un soporte con la mano contralateral para conseguir la máxima estabilidad y apoya el pie trasero en un banco, de forma que tu tibia quede aproximadamente perpendicular al suelo. A continuación, comienza a descender de forma controlada, buscando adelantar al máximo la rodilla respecto a la punta del pie; desde ahí, sube de nuevo hasta la posición inicial, evitando gestos bruscos y movimientos laterales de la rodilla, pudiendo o no bloquear la rodilla según comodidad. Valora usar zapatillas con tacón.$t$,
  cues=array[$t$Utiliza straps para que el agarre de la mancuerna no te limite y poder cargar más peso. Generalmente, coloca la mancuerna en el lado de la pierna que trabaja.$t$,
    $t$Trata de mantener el torso vertical y perpendicular al suelo.$t$,
    $t$Aplica fuerza hacia delante y hacia abajo con el pie para subir. Busca la máxima flexión de rodilla: adelanta la rodilla todo lo que puedas respecto a la punta del pie. Puedes utilizar un tacón.$t$]::text[]
where id=474;

-- 475 · Leg Extensions
update exercises set
  description=$t$Extensiones de rodilla en máquina para cuádriceps o leg extensions son algunos de los nombres con los que se conoce a este ejercicio. El movimiento es una extensión de rodilla pura, por lo que el cuádriceps se verá altamente estimulado, además de permitirnos trabajarlo en aislamiento. Podemos inclinar el asiento ligeramente hacia atrás, extendiendo un poco la cadera respecto a la posición normal, para aumentar las demandas sobre el recto femoral. Es un muy buen ejercicio que casi nunca debería faltar en tus programas, en combinación con el resto de patrones y movimientos, aunque es habitual realizarlo con una gran cantidad de errores.$t$,
  execution=$t$Siéntate en el asiento, clavando bien tu cadera en el banco y tu espalda en el respaldo, que podrás ajustar con mayor o menor inclinación según comodidad y preferencia. Ajusta la almohadilla ligeramente por encima de donde se dobla el tobillo y agarra fuerte las manetas para poder aplicar más fuerza; sitúa tus pies aproximadamente en posición neutra y evita que tus pies y rodillas miren hacia dentro o hacia los lados. A continuación, comienza a contraer tus cuádriceps empujando la almohadilla hacia arriba con tus tobillos (puedes flexionarlos ligeramente si te resulta más cómodo o te permite aplicar más fuerza). Continúa extendiendo la rodilla hasta completar el rango de movimiento, evitando impulsos; puedes aguantar brevemente la contracción y descender de nuevo de forma controlada, sin soltar el peso de golpe, hasta la posición inicial. Intenta que todas las repeticiones sean iguales en cuanto a técnica, velocidad y rango de movimiento.$t$,
  cues=array[$t$No tengas prisa: aguanta la fase excéntrica y contrae fuerte en la concéntrica. Prueba a añadir una ligera pausa en la parte de arriba antes de descender.$t$,
    $t$Agárrate fuerte a las manetas para evitar desplazarte y poder aplicar más fuerza.$t$]::text[]
where id=475;

-- 476 · Zancadas
update exercises set
  description=$t$Las zancadas o lunges son similares en cuanto a técnica al split squat y pertenecen al mismo grupo de movimientos, con la salvedad de que en esta ocasión se trata de un ejercicio dinámico, con desplazamiento, mientras que el split squat como tal se realiza en estático. La inercia que llevamos en el descenso podría contribuir muy ligeramente a desplazar algo más la rodilla hacia delante, pero también es más complejo de realizar. Hay que prestar especial atención a su realización para sacarle partido.$t$,
  execution=$t$Coge unas mancuernas, una a cada lado del cuerpo, preferiblemente usando straps para que el agarre NO sea el limitante del ejercicio. A continuación, adelanta un pie por delante de tu torso como si quisieras dar un paso (evita que sea muy largo, para que trabaje más el cuádriceps) y comienza a descender realizando la fase excéntrica de forma controlada. Busca traspasar al máximo la punta del pie con tu rodilla y mantén el torso erguido, de forma que tu cuerpo quede lo más perpendicular al suelo posible. El pie de atrás acompaña y hace de apoyo, generando estabilidad; la rodilla puede tocar el suelo, pero evita usarlo como rebote o impulso, y tampoco te ayudes del pie trasero para subir. Desde abajo, regresa a la posición inicial aplicando fuerza hacia abajo y adelante con el pie del lado que trabaja, y da un paso avanzando para realizar ahora la misma acción con la pierna contraria.$t$,
  cues=array[$t$Trata de mantener el torso vertical y perpendicular al suelo.$t$,
    $t$Aplica fuerza hacia delante y hacia abajo con el pie durante la fase concéntrica.$t$,
    $t$No alejes en exceso el apoyo respecto a tu cuerpo.$t$,
    $t$Valora utilizar straps para poder cargar más peso.$t$]::text[]
where id=476;

-- 477 · Pendulum Squat
update exercises set
  description=$t$Esta variante de sentadilla es una de las mejores alternativas disponibles a la hora de trabajar el cuádriceps. Aporta un muy buen estímulo a esta musculatura, además de ser una máquina que permite alcanzar un alto grado de esfuerzo con gran estabilidad y seguridad. Con el objetivo de ganar masa muscular en el cuádriceps, es una mejor alternativa que muchas otras variantes tradicionales de sentadilla; sin embargo, no siempre se dispone de ella en los gimnasios. Realízala evitando cometer los siguientes fallos y lo notarás en tu progreso.$t$,
  execution=$t$Sitúate dentro de la máquina apoyando por completo tu espalda contra el respaldo y colocando los pies con una anchura similar a la de tus hombros, en un punto de la plataforma que maximice el ROM, que será generalmente la zona media o baja de la misma, evitando colocarlos excesivamente arriba. A continuación, agarra las manetas para generar mayor estabilidad durante el recorrido y coge aire hinchando tu abdomen antes de iniciar la fase excéntrica, para realizar el descenso manteniéndote lo más compacto posible. Desciende poco a poco, evitando movimientos bruscos, hasta apretar tus gemelos con tus isquios, dándole el máximo rango de recorrido posible a la rodilla, como si quisieras adelantarla por delante de tus pies. Desde este punto, evitando rebotar abajo, comienza a empujar contra la plataforma y el respaldo para iniciar la fase concéntrica. Evita que tus rodillas colapsen hacia dentro y sube hasta bloquearlas casi o por completo en la posición inicial antes de iniciar una nueva repetición.$t$,
  cues=array[$t$Busca comprimir tus isquios contra tus gemelos para lograr la máxima flexión de rodilla posible.$t$,
    $t$No coloques los pies excesivamente arriba en la plataforma y utiliza un stance o anchura similar a la de tus hombros.$t$,
    $t$Empuja contra la plataforma y hacia delante con los pies, y contra el respaldo con tu torso.$t$,
    $t$Evita rebotar abajo como un muelle; añade una ligera pausa entre la excéntrica y la concéntrica.$t$]::text[]
where id=477;

-- 478 · Prensa Horizontal Plate-loaded
update exercises set
  description=$t$Esta máquina de prensa horizontal tiene un diseño completamente diferente al de la prensa horizontal guiada o la prensa 45º. En este caso, la carga en forma de discos se coloca delante de la plataforma sobre la que empujamos, y esta tiene una trayectoria ligeramente pendular, que se alejará de nosotros a lo largo del recorrido. Esto implica que la resistencia irá cambiando a lo largo del movimiento. Se trata de un buen ejercicio para el entrenamiento de cuádriceps, pero debemos recordar que, sin lugar a dudas, no suele ser una mejor alternativa que la prensa horizontal guiada.$t$,
  execution=$t$Siéntate en la máquina apoyando toda tu espalda contra el respaldo y los pies sobre el apoyo en el que empujar, a una anchura similar a la de tus hombros según comodidad, buscando maximizar el ROM. Desde aquí, aférrate al asiento con tus manos y empuja con la espalda contra él para situarte en una posición aún más estable desde la que empujar al máximo; comienza a empujar la plataforma buscando alejarla al máximo de ti, extendiendo las rodillas casi o por completo (aunque puedes bloquearlas, puedes evitarlo para mantener la tensión constante). Una vez extendidas, comienza a descender hasta la posición inicial de forma lenta y controlada, evitando que la plataforma choque con los soportes y pierda tensión o nos aporte inercia para la siguiente repetición. Intenta descender hasta comprimir tus isquios contra tus gemelos en la medida de lo posible, evitando que los talones se despeguen de la plataforma o que las rodillas se metan hacia dentro.$t$,
  cues=array[$t$Coloca los pies lo más abajo posible y neutros, con una anchura que permita maximizar el ROM, generalmente la anchura de tus hombros.$t$,
    $t$Realiza el máximo rango de recorrido posible, valorando en la medida de lo posible comprimir isquios y gemelos en cada repetición.$t$,
    $t$Evita que se te despeguen los talones de la plataforma y que tus rodillas colapsen.$t$,
    $t$Piensa en sobrepasar las puntas de tus pies con las rodillas.$t$]::text[]
where id=478;

-- 479 · Belt Squat
update exercises set
  description=$t$El belt squat es un ejercicio muy bueno y adecuado en muchos contextos; sin embargo, no siempre se encuentra disponible en los gimnasios. Podemos encontrar diferentes diseños de máquina para este ejercicio, pero la inmensa mayoría siguen una ligera trayectoria angular, similar a una pendulum squat, por lo que es una muy buena opción para el trabajo de cuádriceps con objetivo de hipertrofia. Al contrario de lo que ocurre en una sentadilla con barra o en multipower, apenas soportamos carga sobre la columna durante su realización, al colocar el cinturón sobre la cadera en lugar de una barra sobre nuestros trapecios, por lo que será una muy buena opción en muchos contextos.$t$,
  execution=$t$Colócate sobre la plataforma con un stance o anchura de pies similar a la de tus hombros o ligeramente superior, y ajusta bien el cinturón sobre la parte superior de tu cadera, de forma que resulte cómodo. A continuación, quita los seguros y extiende las rodillas para situarte en la posición inicial con la carga, generando tensión, y agárrate con ambas manos a los apoyos, en caso de contar con ellos. Desde aquí, comienza a descender buscando llevar tu glúteo a los talones o comprimir tus gemelos con tus isquiosurales; busca mantenerte compacto realizando bracing y adelantar al máximo las rodillas, como si quisieras sobrepasar con ellas las puntas de tus pies. Una vez alcanzada la máxima profundidad posible, evita rebotar y comienza a subir empujando con los pies hacia abajo y adelante, como si quisieras tirarte hacia atrás de espaldas, hasta extender casi o por completo las rodillas en la posición inicial de nuevo.$t$,
  cues=array[$t$Mientras empujas hacia arriba, piensa en empujar hacia delante con tus pies, con la intención de tirarte hacia atrás, durante la fase concéntrica.$t$,
    $t$En caso de tener un apoyo para las manos, puedes utilizarlo para estar más estable, pero simplemente a modo de apoyo: no empujes con los brazos.$t$,
    $t$Realiza el movimiento lo máximo posible dentro del plano sagital y lleva las rodillas lo más hacia delante posible; evita que se abran o colapsen.$t$,
    $t$Piensa en aplastar tus gemelos con tus isquiosurales para trabajar con la máxima flexión de rodilla.$t$,
    $t$Busca un stance cómodo en cuanto a anchura y distancia de pies que maximice el rango de movimiento.$t$]::text[]
where id=479;

-- 480 · Sentadilla Búlgara con Barra Libre
update exercises set
  description=$t$Esta variante de sentadilla búlgara es posiblemente peor opción para la mayoría de personas que sus alternativas con mancuerna y apoyo de mano o en multipower. Una variante libre con safety bar sí permitiría también un apoyo de manos, generando mayor estabilidad, pero al realizarse con barra recta, pese a que podemos llevar bien el estímulo al cuádriceps, generalmente no será la opción principal. El aspecto positivo de realizarla con barra es que permite manejar más carga y reducir así el rango de repeticiones.$t$,
  execution=$t$Colócate como si fueras a realizar una sentadilla con barra alta tradicional, a ser posible en un rack para mayor seguridad, situando la barra sobre tus trapecios. Saca la barra y da 1-2 pasos hacia atrás, situando el pie delantero ligeramente por delante de tu torso, en un punto en el que maximices el ROM, y apoya el pie de la pierna trasera sobre un banco; también puedes apoyar la tibia si estás más cómodo. Desde aquí, comienza a descender buscando adelantar todo lo que puedas la rodilla delantera con respecto a la punta de tu pie y, una vez alcanzado este punto más bajo, comienza la fase concéntrica aplicando fuerza hacia abajo y adelante con el pie para subir, llevando un mayor estímulo hacia el cuádriceps. Continúa hasta volver a la posición inicial; no es necesario bloquear la rodilla. Evita también que la rodilla se desvíe lateralmente durante el movimiento: apunta hacia delante con ella.$t$
where id=480;

-- 481 · Safety Bar Squat
update exercises set
  description=$t$Para realizar este ejercicio necesitamos contar con una safety bar, a ser posible bien diseñada, aunque podría intentar imitarse con una barra recta y unos straps. De no contar con ella, optaría por otro tipo de variantes de sentadilla si nuestro objetivo es enfatizar los cuádriceps. Se trata de un ejercicio superior a la clásica sentadilla, al permitirnos una mayor verticalidad del torso e incidir algo más sobre esta musculatura; sin embargo, si se usan cargas muy elevadas, esta verticalidad tenderá a perderse en mayor o menor medida. También puede facilitar mucho la sentadilla a personas con mala movilidad de hombro.$t$,
  execution=$t$Sujeta la barra por las manetas y colócala sobre los trapecios con el apoyo de las almohadillas. Sácala del rack realizando un ligero empuje hacia arriba y atrás, y colócate en la posición inicial dando 2-4 pasos como máximo, situando los pies en ligera rotación externa y con una anchura similar a la de tus hombros. Empuja ligeramente las manetas, sacando los codos hacia delante; desciende tus costillas y toma aire, hinchándote para ser más compacto y estable. Desciende buscando la máxima flexión de rodilla posible: trata de comprimir tus isquios con tus gemelos mientras tus rodillas sobrepasan la punta de tus pies, aunque la profundidad dependerá de tu caso concreto. Trata de mantener en todo momento los 3 puntos de contacto del pie con el suelo (dedo gordo, meñique y talón). Una vez alcanzada la máxima profundidad, comienza a subir centrándote en empujar el suelo con los pies y a través de tus rodillas; intenta evitar que la cadera se dirija excesivamente hacia atrás.$t$,
  cues=array[$t$Empuja las manetas hacia arriba para mantener los codos ligeramente hacia delante.$t$,
    $t$Busca, dentro de lo posible, mantener la verticalidad del torso, aunque dependerá de la carga y del rango de repeticiones.$t$,
    $t$Mantén una ligera rotación externa de cadera y empuja el suelo, centrándote en la extensión de rodilla; evita compensar llevando la cadera muy atrás.$t$]::text[]
where id=481;

-- 482 · Sentadilla Barra Alta
update exercises set
  description=$t$Al igual que ocurre con el press banca, este ejercicio se incluye en este grupo muscular por tradición, ya que en la mayoría de casos vamos a involucrar mucho más que el cuádriceps: la cadena posterior y grupos musculares como los aductores y el glúteo van a recibir un estímulo importante. Alternativas como la sentadilla hack, el belt squat o la sentadilla en multipower o con safety bar son mejores opciones si lo que quieres es un mejor movimiento para este grupo muscular, ya que estaremos más estables y podremos aplicar más fuerza.$t$,
  execution=$t$Con la barra situada en un rack aproximadamente a la altura de tus clavículas, acércate a ella y, pasando la cabeza por debajo, colócala sobre tus trapecios a la vez que realizas retracción escapular para sujetarla mejor. A continuación, desencájala del soporte y da 1-2 pasos hacia atrás para colocarte en la posición inicial, con los pies apuntando a las 10 y 10, rotados externamente desde la cadera, y con los talones, que deberán permanecer en todo momento en contacto con el suelo. Desde aquí, coge aire y aguántalo realizando bracing, expandiendo el abdomen 360º para compactarte; orienta tus codos hacia abajo y flexiona ligeramente la cadera. Comienza a descender sin soltar el aire hasta alcanzar la máxima profundidad que te permita tu movilidad, buscando sobrepasar al máximo con la rodilla la punta de los pies y manteniendo, dentro de lo posible, la verticalidad del torso, aunque cuanta más carga pongas, más tenderás a inclinarte, llevando más estímulo a la cadena posterior. Una vez alcanzada la máxima profundidad, evita hundir el pecho y comienza a subir empujando fuerte el suelo con los pies hasta regresar a la posición inicial.$t$,
  cues=array[$t$Busca, dentro de lo posible, adelantar al máximo la rodilla respecto a la punta del pie, mantener la verticalidad y comprimir tus isquios con tus gemelos.$t$,
    $t$Realiza bracing: utiliza tu respiración para convertirte en un bloque compacto.$t$,
    $t$Rota externamente tu cadera, con los pies apuntando a las 10 y 10, y empuja fuerte el suelo con un triple apoyo (dedo gordo, meñique y talón).$t$]::text[]
where id=482;

-- 483 · High Step Up
update exercises set
  description=$t$Pese a la popularidad de este ejercicio, no suele ser la mejor opción debido a diversos factores, como la menor estabilidad o el mayor riesgo de caída accidental, entre otros, en comparación con otras alternativas. No obstante, si lo realizamos partiendo de una buena flexión de rodilla y buscando adelantarla al máximo respecto a la punta del pie, podría ser un buen estímulo para el cuádriceps. Para realizarlo pueden usarse chalecos lastrados, mancuernas o incluso una barra; sin embargo, debido a su complejidad técnica no suele ser adecuado para manejar grandes cargas, siendo preferibles las mancuernas también en cuanto a seguridad. Otro problema a tener en cuenta es la dificultad para realizar una fase excéntrica controlada.$t$,
  execution=$t$Colócate de frente a un escalón o cajón mientras sujetas unas mancuernas, una a cada lado del cuerpo; busca que el cajón o banco que vayas a usar no sea excesivamente alto, para evitar llevar el estímulo más al glúteo, y a continuación coloca el pie de apoyo sobre la plataforma para iniciar el ejercicio. Busca adelantar la rodilla respecto a la punta del pie, manteniendo el torso vertical; evita impulsarte con rebotes contra el suelo y realiza una fase concéntrica subiendo hasta extender la rodilla todo lo que puedas. Una vez extendida por completo, realiza una fase excéntrica lenta y controlada, evitando dejarte caer o rebotar en el suelo con saltos entre repeticiones. Puedes subir alternando piernas o hacer una serie con cada pierna.$t$,
  cues=array[$t$Mantén el torso vertical y busca adelantar la rodilla respecto a la punta del pie para favorecer la extensión de rodilla sobre la extensión de cadera.$t$,
    $t$Evita fuerzas inerciales en la medida de lo posible; no rebotes en el suelo con un salto entre repeticiones.$t$,
    $t$Baja del cajón de forma lenta y controlada.$t$,
    $t$No pongas un cajón excesivamente alto.$t$]::text[]
where id=483;

-- 484 · Prensa Vertical
update exercises set
  description=$t$Esta variante de prensa se remonta a la Golden Era del culturismo y, desde el punto de vista biomecánico, merece ser incluida. Aunque parezca que no hay diferencias con la prensa 45º, el perfil de resistencia de ambos ejercicios es diferente: la prensa vertical ofrece mayor resistencia en la parte inicial del movimiento, donde tenemos mayor ventaja mecánica, y en ambos casos influye la altura a la que colocamos los pies. Respecto al apoyo de pies, lo ideal es situarlos en la parte inferior de la plataforma, aunque, si esta no tiene el ángulo óptimo, el empuje y la estabilidad pueden verse afectados al tener que transferir la fuerza a través del tobillo; esto dependerá del diseño de la máquina.$t$,
  execution=$t$Túmbate en el banco, llevando las piernas arriba y colocando los pies en la parte baja de la plataforma, lo más abajo que puedas, con una anchura similar al ancho biacromial. A continuación, desencaja la prensa y deja que la carga baje buscando la máxima flexión de rodilla posible, procurando no despegar en exceso del asiento el glúteo ni la zona lumbar. Una vez abajo, realiza la transición a la fase concéntrica sin rebote ni inercia: mueve la carga con control e intención y piensa en empujar con los pies lo más fuerte posible contra la plataforma. Si es necesario, usa un calzado con cuña o regula la plataforma para favorecer el máximo ROM activo para el cuádriceps.$t$,
  cues=array[$t$Mantén los pies lo más abajo posible en la plataforma sin despegar los talones. En algunos casos, podrías beneficiarte de un tacón.$t$,
    $t$Busca la máxima profundidad y flexión de rodilla, pero sin rebotes ni inercias.$t$,
    $t$Usa menos carga que en una prensa 45º: al tratarse de una carga 100% gravitacional y vertical, necesitamos menos carga para generar la misma tensión.$t$]::text[]
where id=484;

-- 485 · Reverse V Squat
update exercises set
  description=$t$En el caso de esta sentadilla, buscamos darle un uso ligeramente diferente a la máquina de V squat para aprovecharnos de la trayectoria de la resistencia, de forma similar a lo que podría ser, por ejemplo, hacer buenos días o hip hinge en la máquina de sentadilla hack para dar énfasis a la cadena posterior. Es interesante porque aprovechamos la inclinación de la plataforma, que nos permite mantener los talones elevados, favoreciendo la verticalidad del torso y la dominancia de rodilla en el movimiento y priorizando el estímulo sobre el cuádriceps. En cuanto a la trayectoria de la resistencia, si la máquina está bien diseñada, encajará muy bien con el movimiento pendular de la cadera y la rodilla sobre su eje. Se trata de una buena variante, ya que la alineación y la estabilidad son una buena baza a la hora de seleccionar este ejercicio.$t$,
  execution=$t$Sitúate dentro de la máquina, colocando los hombros bajo los soportes y los pies adelantados respecto al resto del cuerpo; puede costar posicionarse bien, pero busca un apoyo cómodo. Saca la carga del soporte y baja lentamente con el torso vertical, buscando comprimir gemelos e isquiosurales si el diseño de la máquina y tus condiciones lo permiten. Si se levantan los talones, te puede ayudar adelantar ligeramente un poco más los pies. Realiza una transición controlada desde la fase excéntrica a la concéntrica.$t$,
  cues=array[$t$Mantén el torso vertical durante todo el recorrido.$t$,
    $t$Preferentemente, los talones deben estar más elevados que la punta del pie.$t$,
    $t$Busca el mayor ROM activo posible para el cuádriceps.$t$]::text[]
where id=485;

-- 486 · Sissy Squat
update exercises set
  description=$t$Este ejercicio se caracteriza por ser dominante de rodilla, es decir, la prioridad es la extensión de la rodilla para que el cuádriceps cobre mayor protagonismo y se lleve un mayor estímulo. El movimiento se realiza dentro del plano sagital, buscando sacar a la cadera de la ecuación en la medida de lo posible. Cabe destacar que combinar una extensión de rodilla con la cadera extendida podría inducir una mayor activación del recto femoral en comparación con otras porciones del cuádriceps. Al ser un ejercicio con un gran componente técnico, y como la estabilidad podría ser un factor limitante, se recomienda tener un apoyo para poder acercarnos más al fallo sin desestabilizarnos. Hay que desechar, a su vez, el mito de que la tibia no puede sobrepasar la punta del pie: esto no es lesivo, sino que, a mayor traslación de la tibia hacia delante, mayor dominancia de rodilla obtendremos. La progresión de este ejercicio a largo plazo puede verse comprometida.$t$,
  execution=$t$Colócate de lado a un rack, una multipower o algo similar que te sirva de apoyo, sujetándote con la mano. Ponte de puntillas y comienza a descender a medida que avanzas las rodillas sobre los pies. Piensa en adelantar las rodillas todo lo posible respecto a las puntas de los pies, para que el cuádriceps sea el factor limitante. Desde abajo, pasaremos a la fase concéntrica realizando una extensión de rodilla mientras la posición de la cadera permanece intacta. En el caso de que busquemos más carga, podemos sujetar una mancuerna o un disco con la mano libre, o usar una banda de resistencia.$t$,
  cues=array[$t$Mantén la cadera extendida en todo momento.$t$,
    $t$Coloca los pies a la altura del ancho biacromial con ligera rotación externa.$t$,
    $t$Realiza la fase excéntrica de puntillas y ve apoyando progresivamente los talones a lo largo de la fase concéntrica.$t$,
    $t$Apóyate con la mano en un soporte para estar estable.$t$]::text[]
where id=486;

-- 487 · Peso Muerto Rumano - RDL (antes «Peso Muerto Rumano - Rdl»)
update exercises set
  name=$t$Peso Muerto Rumano - RDL$t$,
  description=$t$Podríamos decir que, junto con el peso muerto piernas rígidas (SLDL), el peso muerto rumano es una de las mejores bisagras de cadera que podemos realizar para estimular toda la cadena posterior. El RDL nos permite trabajar más pesado y con mayor seguridad que un peso muerto piernas rígidas, ya que la barra va pegada constantemente al cuerpo y el brazo de momento sobre la zona lumbar es algo menor, al contrario que en el SLDL, donde la barra se separa ligeramente del cuerpo. Otra diferencia es que la flexión de rodilla es ligeramente superior en el rumano (RDL) respecto al piernas rígidas. Debemos mantener constantemente la espalda en una posición aproximadamente neutra y apretada.$t$,
  execution=$t$Con la barra cargada, a ser posible sobre unos soportes o un rack que la sitúen a la altura de tus muslos para evitar sacarla desde el suelo, y utilizando straps, agarra la barra aproximadamente a la anchura de tus hombros, según comodidad, y sitúa tus pies también aproximadamente a esa misma anchura. Realiza depresión escapular, no retracción, contrae el dorsal pegando la barra a ti y extiende las rodillas para sacarla del soporte. Da 1 o 2 pasos hacia atrás para colocarte en la posición inicial, evitando chocar con el soporte. Para iniciar el descenso, lleva tu cadera hacia atrás y hacia arriba sin pensar en la barra, que descenderá sola; recuerda llevarla constantemente pegada a ti. Desciende poco a poco hasta por debajo de tus rodillas, según tus posibilidades de movilidad, lo máximo que puedas sin perder la neutralidad de la columna y hasta que el movimiento deje de producirse desde la cadera. Desde ahí, con la espalda apretada y pegando la barra a ti, extiende la cadera hasta regresar a la posición en la que tus hombros están en línea con la perpendicular de tus caderas.$t$,
  cues=array[$t$Piensa en llevar la cadera hacia atrás y hacia arriba; la barra descenderá sola.$t$,
    $t$No pienses en bajar la barra: según tu movilidad, la profundidad será mayor o menor. Para el descenso una vez que el movimiento deje de producirse desde la cadera.$t$,
    $t$Mantén la barra constantemente rozando tus tibias y muslos en ambas fases.$t$,
    $t$Mantén la espalda compacta, neutra y apretada: piensa que tienes una moneda en las axilas y no debes dejar que caiga. Realiza depresión escapular.$t$,
    $t$La espalda alta puede redondearse ligeramente en la parte alta del movimiento, para mantener los hombros en la línea perpendicular que forma el suelo con tu cadera.$t$]::text[]
where id=487;

-- 488 · Peso Muerto Piernas Rígidas – SLDL
update exercises set
  description=$t$El peso muerto piernas rígidas, o SLDL, es posiblemente el mejor movimiento de bisagra de cadera para enfatizar los isquiosurales en una gran cantidad de contextos. Aunque también es cierto que hay ciertos aspectos a tener en cuenta, como las mayores demandas que exige sobre la zona lumbar respecto al RDL y su mayor complejidad. En el SLDL, la barra puede partir del suelo y apoyarse entre repeticiones, pero dependerá de la movilidad del sujeto, y perder la tensión constante puede no ser lo recomendable. Ambos trabajan toda la cadena posterior, siendo los 2 mejores tipos de bisagra de cadera.$t$,
  execution=$t$Partiendo con la barra desde el suelo o desde unos soportes, según preferencia y movilidad, agárrala con una anchura aproximada a la de los hombros, a ser posible con straps, y sitúa el apoyo de pies o stance aproximadamente a la misma anchura. Desde ahí, realiza depresión escapular, compactando y apretando la espalda; si sacas la barra del soporte, extiende ligeramente las rodillas y da 1 o 2 pasos hasta la posición inicial. Si la barra parte del suelo, realiza el movimiento de bisagra de cadera pensando en llevar la cadera hacia atrás, con las rodillas prácticamente extendidas. En ambas fases, la barra puede ir ligeramente separada del cuerpo: mantener las rodillas extendidas y separar la barra aumenta las demandas sobre los isquios. Desde arriba, comienza a descender llevando la cadera hacia atrás y arriba hasta que el movimiento deje de provenir de ella, punto que será individual en cada persona; puedes incluso llegar a tocar el suelo, pero evita rebotar. Una vez alcanzado el máximo ROM, sintiendo el estiramiento en los isquios, comienza a extender la cadera manteniendo la barra ligeramente separada hasta volver a la posición en la que tus hombros estén en la línea perpendicular de la cadera con el suelo; puedes redondear ligeramente la espalda alta durante todo el movimiento.$t$,
  cues=array[$t$Piensa en llevar la cadera hacia atrás y hacia arriba; la barra descenderá sola.$t$,
    $t$Despega ligeramente la barra de ti, especialmente en la excéntrica; puedes tocar el suelo o no, según comodidad y anatomía. Apenas dobles las rodillas.$t$,
    $t$Mantén la espalda compacta, neutra y apretada, realiza depresión escapular.$t$,
    $t$La espalda alta puede redondearse ligeramente en la parte alta del movimiento, para mantener los hombros en la línea perpendicular que forma el suelo con tu cadera.$t$]::text[]
where id=488;

-- 489 · Peso Muerto Unilateral con Mancuerna
update exercises set
  description=$t$Esta variante de peso muerto se puede realizar con una sola mancuerna y utilizar la mano libre para estabilizar el movimiento, o bien con 1 mancuerna en cada mano para trabajar con más carga, si se es capaz de realizar un movimiento controlado y estable. Trabajar con el apoyo de un solo pie (monopodal) quizá no sea lo mejor de cara a la hipertrofia, pero es una opción más a tener en cuenta, que puede ser interesante en muchos casos y aportar muy buenas sensaciones.$t$,
  execution=$t$Coge 1 o 2 mancuernas en función de tu control, tu dominio y tu capacidad de generar estabilidad; en caso de usar 1 mancuerna, agarra un apoyo con la mano libre. Flexiona ligeramente una de las rodillas y levanta el pie contrario. Comienza a descender pensando en llevar la cadera hacia atrás y arriba, generando, si puedes, una ligera anteversión pélvica que permita un mayor estiramiento de los isquiosurales. No pienses en bajar la mancuerna, sino en retrasar la cadera. Una vez alcances el máximo ROM que te permita tu movilidad, aleja ligeramente la mancuerna de ti para aumentar el brazo de momento sobre la cadera; después, extiende la cadera de nuevo volviendo a la posición inicial. Busca situar tus hombros en la línea perpendicular de tus caderas y evita realizar una hiperextensión.$t$,
  cues=array[$t$Céntrate en llevar la cadera hacia atrás y arriba.$t$,
    $t$Aleja la mancuerna ligeramente más de ti en la parte baja del movimiento.$t$,
    $t$Busca estabilizar con la mano libre si usas 1 mancuerna, y con la pierna libre en cualquier caso; si te genera inestabilidad, puede valorarse la variante B-stance DL.$t$]::text[]
where id=489;

-- 490 · Buenos Días Multipower
update exercises set
  description=$t$Este ejercicio es una buena variante de bisagra de cadera con el objetivo de trabajar los isquios en su función como extensores de cadera. Algunas de las ventajas que aporta son, en primer lugar, que no es necesario despegar la carga desde el suelo ni el agarre será un limitante, lo cual puede ser interesante en muchos casos; además, la variante en multipower, en concreto, nos aporta seguridad y estabilidad al ir guiada. Podría decirse que es uno de los sustitutos naturales de ejercicios como el peso muerto piernas rígidas (SLDL) e incluso el RDL y, al contrario de lo que se piensa, no es un ejercicio lesivo, sino que además permite trabajar en estiramiento y ayudar a fortalecer la zona lumbar, pudiendo contribuir a evitar lesiones, especialmente de isquiosurales (47), si se realiza bien.$t$,
  execution=$t$Colócate frente a la multipower y agarra la barra con una anchura cómoda, superior a la de los hombros. Sitúa tus pies ligeramente por detrás de la trayectoria de la barra, con una anchura aproximadamente similar al ancho de los hombros, y coloca la barra en posición de barra baja, apoyada sobre tus deltoides posteriores, no sobre los trapecios. A continuación, desencaja la barra y lleva la cadera hacia atrás y hacia arriba, pudiendo añadir una ligerísima anteversión pélvica. No debe ser la barra la que baje, sino la cadera la que se desplace hacia atrás y, como consecuencia, la barra descenderá: cuanto más se flexione la cadera, más descenderá la barra. Una vez la cadera no pueda dar más rango de movimiento, puedes aguantar brevemente y extenderla de nuevo hasta volver a la posición inicial.$t$,
  cues=array[$t$Mantén las rodillas prácticamente extendidas; no las dobles para bajar más.$t$,
    $t$Piensa en llevar la cadera atrás y arriba, no en bajar la barra hacia abajo.$t$,
    $t$Mantén la espalda compacta y neutra. Solo debe moverse la cadera.$t$]::text[]
where id=490;

-- 491 · Leg Curl Tumbado
update exercises set
  description=$t$Este ejercicio pertenece al grupo de movimientos de flexión de rodilla, en los que trabajaremos principalmente esta acción de los isquiosurales. En este caso, trabajaremos con la cadera prácticamente en extensión y, al tratarse de una máquina guiada, nos permitirá una gran estabilidad y aplicar un alto grado de esfuerzo en las series, ya que serán los isquiosurales los que nos limiten principalmente. Es una buena opción para trabajar este grupo muscular en aislamiento. Combinar ejercicios de flexión de rodilla con otros de extensión de cadera es la mejor opción para un completo desarrollo de los isquiosurales.$t$,
  execution=$t$Túmbate sobre el apoyo de la máquina y agarra las manetas lo más fuerte que puedas para generar una posición estable, desde la que incluso puedes traccionar si así aplicas más fuerza con los isquios. Coloca la almohadilla ligeramente por encima de tus tobillos para generar mayor estabilidad sobre la rodilla. Comienza a flexionar la rodilla de forma potente, pensando en llevar tus gemelos a chocar con tus isquios. Evita que la fase concéntrica se vea favorecida por impulsos e inercias; aguanta ligeramente la contracción y desciende de forma controlada hasta la posición inicial, buscando estirar por completo los isquios, sin recortar rango de movimiento ni apoyar las placas, para no perder tensión.$t$,
  cues=array[$t$No despegues la cadera del asiento ni la muevas.$t$,
    $t$Piensa en doblar la rodilla para tocar tus isquios con tus gemelos.$t$,
    $t$Mantener los tobillos en una posición fija ayudará a generar mayor estabilidad sobre la rodilla. También evitará que se te carguen los gemelos.$t$,
    $t$Agarra fuerte las manetas, traccionando de ellas para estar más estable.$t$]::text[]
where id=491;

-- 492 · Leg Curl Sentado
update exercises set
  description=$t$El leg curl sentado puede ser muy interesante, en primer lugar, porque se trata de un movimiento guiado en el que nos centramos puramente en los isquiosurales en aislamiento, con gran estabilidad y permitiendo, además, alcanzar altos grados de esfuerzo. Por otro lado, al estar sentados con la cadera flexionada, el isquiosural se sitúa en estiramiento previo, y algunos estudios han encontrado un crecimiento ligeramente superior respecto a la variante tumbado (48).$t$,
  execution=$t$Siéntate en la máquina situando el respaldo en una posición que te permita colocar la almohadilla ligeramente por encima de tus tobillos, de forma cómoda según tu anatomía. A continuación, baja la almohadilla de sujeción sobre los muslos, cerca de la rodilla, y comienza a aplicar fuerza con tus manos empujando contra las manetas; de esta forma, estarás empujando tu torso y tu cadera contra el respaldo para que no se muevan ni se extiendan con el paso de las repeticiones, y podrás aplicar más fuerza puramente desde la rodilla. Una vez estés lo más estable posible, comienza a doblar la rodilla, como si quisieras llevar tus gemelos a chocar con tus isquios, hasta el tope de la máquina y, una vez lo alcances, realiza la fase excéntrica de forma lenta y controlada, sintiendo el estiramiento sobre los isquiosurales, hasta llegar de nuevo a la posición inicial sin llegar a bloquear las rodillas.$t$,
  cues=array[$t$Empuja fuertemente las manetas y aplica fuerza con tu torso y tu cadera contra el respaldo, para que la cadera no se extienda y permanecer anclado.$t$,
    $t$Piensa en llevar tus gemelos a tocar tus isquiosurales.$t$,
    $t$Realiza una excéntrica controlada, evita dejar que la almohadilla se vaya rápido y busca sentir bien el estiramiento sobre los isquios.$t$]::text[]
where id=492;

-- 493 · Leg Curl con Mancuerna Tumbado
update exercises set
  description=$t$Este ejercicio es la variante de flexión de rodilla tumbado para cuando no contamos con la máquina para realizar el movimiento, ni con ninguna alternativa similar en máquina o en polea, y queremos seguir realizando un trabajo completo sobre la musculatura de los isquiosurales, combinándolo con movimientos de extensión de cadera (bisagra de cadera). Es interesante no realizar la parte final del recorrido, ya que sobrepasar con la mancuerna la línea perpendicular de la rodilla con el suelo no generaría mayor tensión en los isquios, sino que la restaría, y requeriría iniciar el movimiento con una extensión de rodilla (cuádriceps) durante la fase concéntrica.$t$,
  execution=$t$Túmbate en el banco apoyando todo tu cuerpo sobre él, incluidos los 2/3 superiores de los muslos, pero dejando las rodillas por fuera, y agárrate a los laterales o a algún soporte del banco para generar estabilidad. Coloca una mancuerna entre ambas plantas de los pies (preferiblemente con ayuda) y sitúa tus rodillas a unos 90º, en la línea perpendicular que forman con el suelo, para colocarte en la posición inicial. Desde ahí, comienza a extender la rodilla, pensando en alejar lo máximo posible la mancuerna de tu cadera y sintiendo cómo se estiran los isquiosurales. Una vez extendida la rodilla por completo, contrae los isquios regresando con la mancuerna a la posición inicial, deteniendo el movimiento unos grados antes para evitar restar tensión a esta musculatura.$t$,
  cues=array[$t$No despegues la cadera del asiento ni la muevas. Valora declinar el banco.$t$,
    $t$Piensa en doblar la rodilla para tocar tus isquios con tus gemelos.$t$,
    $t$No realices el rango de movimiento completo: traspasar con la mancuerna la línea vertical de la rodilla con el suelo no aportará tensión a tus isquios, sino todo lo contrario.$t$]::text[]
where id=493;

-- 494 · Extensiones Banco Inclinado Focus Isquiosural
update exercises set
  description=$t$Esta variante de extensiones en banco inclinado o banco romano tiene el objetivo de enfatizar principalmente a los isquios; para ello, realizaremos una extensión de cadera similar a la de un SLDL o peso muerto piernas rígidas, al ser esta una de las acciones principales de los isquiosurales. Es un ejercicio que aporta muy buenas sensaciones si se realiza correctamente, pero dominar la técnica puede ser algo complejo y llevar más tiempo que en otros. Además, implica en gran medida a los erectores espinales, y también es posible realizarlo con énfasis en los glúteos (ver la variante Focus Glúteo).$t$,
  execution=$t$Colocando el banco romano con la parte superior por debajo de las caderas, en la medida de lo posible, sitúalo en el grado de inclinación que prefieras según tus objetivos, ya que la inclinación cambiará la parte del recorrido que resulta más difícil (en torno a 45º, la parte superior será la más exigente). Coloca las puntas de los pies y las rodillas en la dirección del movimiento. Sujeta una barra con un agarre amplio para permitir un mayor ROM (en su defecto, puedes usar un disco o mancuernas) y comienza a descender lo máximo posible, realizando una ligera anteversión pélvica en la parte baja del recorrido para estirar más los isquios. Desde ahí, comienza a subir pensando en extender la cadera como si estuvieras realizando un peso muerto piernas rígidas, manteniendo la espalda neutra, hasta llevar tu hombro a la línea diagonal de tu cadera. A medida que te acerques a esta posición, puedes añadir algo de flexión de rodilla, doblándola y permitiendo un mayor estímulo sobre los isquiosurales.$t$,
  cues=array[$t$Coloca la parte superior del banco por debajo de las caderas.$t$,
    $t$Coloca las puntas de los pies y las rodillas en la dirección del movimiento, no hacia fuera.$t$,
    $t$No es necesario extender más allá de alinear tus hombros con tu cadera.$t$]::text[]
where id=494;

-- 495 · Buenos Días con Barra
update exercises set
  description=$t$El buenos días con barra es un ejercicio que, de forma clásica, se realiza con barra recta. Sin embargo, por comodidad, si tienes la posibilidad, realízalo con una safety bar; podría imitarse añadiendo unos straps a una barra recta, pero en todo caso es necesario un gran dominio para realizarlo, y alternativas como hacerlo guiado en multipower suelen funcionar mejor para la mayoría. NO es un ejercicio lesivo si se hace bien, como cualquier otro ejercicio; hasta un curl de bíceps mal hecho es lesivo.$t$,
  execution=$t$Colócate frente a la barra y agárrala con una anchura cómoda, superior al ancho de los hombros en caso de utilizar una barra recta, situándola apoyada aproximadamente sobre el deltoides posterior (como en una sentadilla con barra baja), o sujétala por los agarres en caso de ser una safety bar. A continuación, sácala de los soportes y da 1 o 2 pasos hacia atrás para colocarte de pie en la posición inicial. Lleva la cadera hacia atrás, lo que hará que la barra y tu torso comiencen a descender; pero esto no debe ser el foco, sino que debes pensar en llevar la cadera hacia atrás y hacia arriba, pudiendo añadir una ligera anteversión pélvica si te resulta cómodo. Una vez no puedas producir más movimiento desde la cadera, comienza a subir hasta la posición inicial, buscando mantener la columna compacta durante todo el movimiento y evitando producir una excesiva hiperlordosis lumbar.$t$,
  cues=array[$t$Mantén las rodillas prácticamente extendidas; no las dobles para bajar más.$t$,
    $t$Piensa en llevar la cadera hacia arriba y atrás, NO en descender la barra.$t$,
    $t$Evita realizar una excesiva lordosis o curvatura lumbar, mantén la espalda compacta y neutra. El movimiento debe partir de la CADERA.$t$,
    $t$En caso de ser posible utiliza una safety bar para mayor comodidad.$t$]::text[]
where id=495;

-- 496 · Peso Muerto Unilateral con Barra
update exercises set
  description=$t$Esta variante de peso muerto quizá no sea una de las mejores opciones para el trabajo de los isquiosurales; sin embargo, no deja de ser una herramienta más en nuestro cajón, interesante en algunos contextos. En caso de realizar un peso muerto unilateral, hacerlo con mancuernas resulta algo más sencillo y estable, por lo que suele ser una mejor opción que con barra, ya que esta implica mayores necesidades de estabilización.$t$,
  execution=$t$Coge la barra con un agarre prono; si es posible, utiliza una barra corta, ya que resulta ligeramente más sencillo de realizar. Flexiona ligeramente una de las rodillas y levanta el pie contrario, llevándolo ligeramente hacia atrás. Desde este punto, comienza a descender poco a poco con la barra separada de ti, pensando en llevar la cadera hacia atrás y arriba, generando, si puedes, una ligera anteversión pélvica que permita un mayor estiramiento de los isquiosurales. No pienses en descender la barra como tal, sino en desplazar la cadera lo más hacia atrás que puedas. Una vez alcanzado el punto más bajo, puedes alejar ligeramente algo más la barra de ti para aumentar el brazo de momento sobre la cadera. Por último, acerca la barra hacia ti y comienza a extender la cadera volviendo a la posición inicial; busca situar tus hombros en la línea perpendicular de tus caderas y evita realizar una hiperextensión.$t$,
  cues=array[$t$Céntrate en llevar la cadera hacia atrás y arriba.$t$,
    $t$Añade anteversión pélvica en la medida de lo posible.$t$,
    $t$Aleja la barra ligeramente más de ti en la parte baja del movimiento.$t$,
    $t$Si quieres realizarlo y te genera mucha inestabilidad, puede valorarse la variante B-stance DL.$t$]::text[]
where id=496;

-- 497 · Leg Curl en Polea de Pie
update exercises set
  description=$t$Esta variante de leg curl puede ser una alternativa para cuando no contemos con una máquina para el trabajo de isquiosurales, pero sí con poleas. Para realizarla necesitaremos una tobillera y, aunque puede resultar algo incómoda en la parte alta del movimiento si el cable roza con nuestra pierna, puede ser una buena alternativa para complementar los movimientos de extensión de cadera y darles un trabajo completo a los isquiosurales, que además trabajarán en aislamiento.$t$,
  execution=$t$Colócate frente a la polea, situada en su posición más baja, poniéndote una tobillera y enganchándola a la misma. A continuación, agárrate a modo de soporte a la guía de la polea, a una columna o similar; de esta forma podremos estar más estables, algo fundamental al tener además el apoyo de una sola pierna durante el ejercicio. Separa ligeramente el pie del lado que va a ejecutar el movimiento para poner el cable en tensión y comienza a flexionar la rodilla con la intención de llevar tu talón hacia tu glúteo, buscando tocar tu isquiosural con tu gemelo; una vez alcanzado este punto, aguanta ligeramente la contracción y desciende hasta la posición inicial. Recuerda que no es un cable kick back: la rodilla debe ser la única que realice el movimiento.$t$,
  cues=array[$t$Agárrate a un poste o similar para generar la máxima estabilidad.$t$,
    $t$Busca llevar tu gemelo a chocar con tu isquiosural.$t$,
    $t$Aguanta la contracción ligeramente arriba, evita que el movimiento sea rápido y descontrolado.$t$,
    $t$Evita que el cable se mueva por acción de la cadera; centra el movimiento en la rodilla.$t$,
    $t$Puede ayudarte mantener el muslo quieto durante todo el movimiento.$t$]::text[]
where id=497;

-- 498 · Leg Curl en Máquina de Pie
update exercises set
  description=$t$Esta máquina es un buen ejercicio para el trabajo de los isquiosurales de forma aislada. Además, al realizarlo en máquina, contamos con la ventaja de una mayor estabilidad y seguridad en comparación con hacerlo en polea. En función del tipo de máquina (placas o discos), la curva de resistencia del ejercicio podrá variar, pero sin duda se trata de un ejercicio a tener en cuenta para complementar el trabajo de extensión de cadera y trabajar los isquiosurales en aislamiento. Dependiendo del diseño de la máquina, la cadera estará más o menos flexionada.$t$,
  execution=$t$Colócate en la máquina apoyando tu cadera y tus muslos sobre los soportes de la misma; a continuación, agarra las manetas para generar una posición estable sobre la que ejercer fuerza. Coloca el soporte sobre el que aplicar fuerza en la parte alta de tu tobillo o en la parte baja del gemelo, y mantén el tobillo fijo para ayudar a que tu rodilla esté aún más estable. Desde aquí, mientras traccionas de las manetas para aplicar más fuerza, comienza a flexionar la rodilla pensando en llevar tu talón al glúteo. Contrae fuertemente el isquio de la pierna que trabaja hasta alcanzar un rango de movimiento completo, evitando inercias o movimientos descontrolados. Aguanta brevemente la contracción y desciende de forma lenta hasta la posición inicial, evitando perder tensión sobre la musculatura antes de comenzar una nueva repetición.$t$
where id=498;

-- 499 · Glute Ham Raise
update exercises set
  description=$t$Este ejercicio se realiza en un banco GHD o similar. Se trata de un ejercicio técnicamente muy complejo, para el que se requieren grandes niveles de fuerza, control y dominio técnico: no es un ejercicio apto para cualquier persona. Sin embargo, a su favor, parece ser que, comparado con otros ejercicios para los isquiosurales, como un leg curl tumbado, un buenos días o un RDL, mostró una activación ligeramente mayor (medida con sEMG) del bíceps femoral, el semitendinoso y el semimembranoso durante la fase concéntrica (52). Aunque podemos añadir carga con discos, mancuernas o lastres, su progresión es más limitada en comparación con otros ejercicios.$t$,
  execution=$t$Súbete al banco GHD agarrando las asas para poder colocar más fácilmente los pies en la plataforma, entre las almohadillas, que previamente habrás ajustado a tu altura de forma que tus pies y rodillas queden alineados mientras realizas el ejercicio. A continuación, con el torso erguido y perpendicular al suelo, si estás empezando, sitúa tus manos en cruz sobre el pecho; si no, puedes sujetar un disco o una mancuerna. Comienza a descender de forma controlada, resistiendo la fase excéntrica mientras extiendes la rodilla. Una vez la estires casi o por completo, comienza a subir empujando con las rodillas contra el banco y doblándolas, sin hiperextender la cadera; detente ligeramente antes de la posición inicial para evitar perder tensión. Céntrate en que el movimiento consista en doblar la rodilla; no compenses con la cadera.$t$,
  cues=array[$t$Resiste la fase excéntrica, aguanta la caída ejerciendo fuerza con tus isquios.$t$,
    $t$Piensa en doblar la rodilla, como si estuvieras haciendo un leg curl, y lleva tu cuerpo hacia atrás pivotando con ella sobre el banco.$t$,
    $t$No es necesario que tu torso llegue a estar perpendicular al suelo o que pase totalmente por encima de la rodilla.$t$]::text[]
where id=499;

-- 500 · Elevaciones de Puntillas sobre Step en Multipower
update exercises set
  description=$t$Esta variante centra el trabajo sobre los gastrocnemios, al realizarse con la rodilla extendida. Un error muy común es realizar el ejercicio muy deprisa, con rebotes en la parte baja del movimiento, aprovechando cierta energía elástica del tendón y, por tanto, facilitando en gran medida la realización del ejercicio con inercias. Lo correcto es realizarlo de forma controlada, tanto en la subida como en la bajada. Utilizaremos un step para poder descender los talones por debajo de las puntas y tener un rango de recorrido completo.$t$,
  execution=$t$En la multipower, coloca la barra sobre tus trapecios como si fueras a realizar una sentadilla, da un paso adelante y sitúa ambos pies sobre el step, apoyando únicamente las punteras sobre él. Eleva ligeramente los talones para sacar la barra del soporte, girándola con las manos hacia atrás, y desciende hasta la posición inicial, con los gemelos estirados. A continuación, realiza una contracción concéntrica potente elevando tus talones lo máximo que puedas, sin doblar las rodillas, y aguanta la contracción con una breve pausa antes de descender de nuevo. Baja de forma controlada hasta la posición inicial, buscando la máxima profundidad y estiramiento posibles y añadiendo también una pausa antes de iniciar la concéntrica para eliminar rebotes.$t$,
  cues=array[$t$Realiza un movimiento completo al que puedes añadir una ligera pausa en estiramiento durante la fase excéntrica.$t$,
    $t$Contrae de forma potente extendiendo el tobillo, pudiendo añadir una contracción isométrica o una pausa arriba.$t$,
    $t$No tengas prisa: realiza el movimiento controlado, sin aprovechar inercias ni energía elástica.$t$]::text[]
where id=500;

-- 501 · Elevaciones Unilaterales de Puntillas con Mancuerna
update exercises set
  description=$t$Esta variante puede ser especialmente interesante en aquellas ocasiones en las que no contamos con mucho más material que una mancuerna. En lugar de un step, puede utilizarse cualquier escalón o un disco grueso que permita descender el talón por debajo de la paralela con el suelo. Para ello, cogeremos una mancuerna, que puede situarse en el mismo lado de la pierna que va a ejecutar el movimiento o en el contralateral, y con la mano libre nos apoyaremos en cualquier lugar, con el fin de poder trabajar de una forma mucho más estable.$t$,
  execution=$t$Coge una mancuerna con un agarre neutro en el lado que te resulte más cómodo y más estabilidad te genere; normalmente será el contralateral, ya que evita que nos inclinemos hacia el lado contrario y permite que el lado de la pierna que ejecuta tenga un apoyo de mano. Con la mano libre apoyada para generar estabilidad, sacaremos el talón por fuera del step o escalón, descenderemos lo máximo posible generando un estiramiento y, desde ahí, subiremos contrayendo fuerte el gemelo y aguantando la contracción antes de descender. Estira el gemelo de forma lenta y controlada y evita rebotes antes de volver a subir, añadiendo una pausa entre ambas fases.$t$,
  cues=array[$t$Realiza un rango de movimiento lo más completo posible.$t$,
    $t$No tengas prisa: realiza el movimiento lento y controlado, sin aprovechar inercias ni energía elástica.$t$,
    $t$Apoya tu mano libre en algo para generar estabilidad, y mantén extendido el codo del brazo que sujeta la mancuerna para no cargar el bíceps.$t$]::text[]
where id=501;

-- 502 · Sóleo Sentado con Mancuernas
update exercises set
  description=$t$En este ejercicio partimos con las rodillas dobladas para que la extensión del tobillo la realice principalmente el sóleo, por encima de los gemelos o gastrocnemios. Por ello, es fundamental que no movamos el apoyo del pie y que las rodillas permanezcan dobladas durante la extensión de tobillo. Esta variante puede ser una muy buena alternativa cuando nuestro objetivo sea trabajar el sóleo y no contemos con más material que un par de mancuernas y un escalón, que puede improvisarse con un disco o un step.$t$,
  execution=$t$Sentado sobre un banco, coloca las puntas de tus pies sobre un step, un disco u objeto similar que te permita añadir más rango de recorrido. Coloca las mancuernas sobre tus rodillas: puedes usar 1 grande en horizontal o 2 pequeñas en vertical, situando 1 sobre cada rodilla. Desde aquí, desciende los talones por debajo de la paralela con el suelo buscando el mayor estiramiento posible, aguanta con una pausa y comienza a elevar los talones generando una fuerte contracción. Para ello, puedes pensar en elevar las mancuernas hacia el techo con tus rodillas o tus muslos; una vez alcanzada la altura máxima, aguanta la contracción con una ligera pausa y desciende de forma controlada hasta la posición inicial de nuevo.$t$,
  cues=array[$t$Mantén las rodillas dobladas durante el ejercicio y no muevas el apoyo de los pies.$t$,
    $t$Añade una pausa tanto al final de la concéntrica como de la excéntrica, evitando rebotes o hacer el movimiento demasiado rápido.$t$]::text[]
where id=502;

-- 503 · Gemelo en Prensa
update exercises set
  description=$t$Este ejercicio con énfasis en los gastrocnemios puede ser una variante muy cómoda e interesante: en primer lugar, porque estamos en una posición muy estable a la hora de realizar el movimiento y aplicar fuerza, ya que contamos con un apoyo en la cadera y un respaldo contra el que podemos ejercer fuerza y del que no nos vamos a mover. Además, el movimiento va guiado por los raíles de la prensa y podemos agarrarnos a las manetas para generar aún mayor estabilidad, lo que nos permitirá tener una gran capacidad de progresión a lo largo del tiempo, al poder además cargar gran cantidad de discos en la prensa, al contrario de lo que ocurre, por ejemplo, en una variante con mancuerna.$t$,
  execution=$t$Tumbado en la prensa, busca la posición más cómoda y estable posible: un apoyo completo de la cadera y la espalda baja; además, puedes agarrar las manetas de la prensa para generar aún mayor estabilidad. Coloca las puntas de tus pies en la parte baja de la plataforma, de forma que los talones sobresalgan por el hueco de debajo del apoyo de pies, permitiendo un mayor rango de recorrido que si realizamos un apoyo completo. Aplica fuerza con las punteras, elevando los talones para sacar el carro de la prensa del soporte; desciende de forma controlada lo máximo que te permita tu movilidad de tobillo, estirando el gemelo; añade una breve pausa y realiza una subida potente sin aprovechar el rebote en la fase concéntrica, y desciende de nuevo de forma controlada hasta la posición inicial.$t$,
  cues=array[$t$Realiza un rango de movimiento lo más completo posible.$t$,
    $t$Clávate contra el respaldo y el asiento. Agarra las manetas para poder estar más estable.$t$,
    $t$Realiza el movimiento lento y controlado, sin aprovechar inercias ni energía elástica.$t$]::text[]
where id=503;

-- 504 · Gemelo en Máquina Inclinada
update exercises set
  description=$t$Este ejercicio se realiza en una máquina específica y centra el trabajo sobre los gastrocnemios, al realizarse con las rodillas estiradas. Puede ser similar a una prensa, pero con un movimiento descendente en lugar de ascendente. Uno de los errores más habituales, aparte de realizar el movimiento demasiado rápido y con rebotes, es colocar los pies demasiado arriba en los soportes, con lo que el rango de movimiento se vería limitado; para evitarlo, bájalos de forma que los talones queden libres. Es una buena forma de trabajar este grupo muscular, al ser un ejercicio estable y guiado.$t$,
  execution=$t$Siéntate en la máquina aplicando fuerza contra el respaldo y sin separar tu cadera ni levantar el glúteo del mismo. Muy posiblemente necesites doblar las rodillas para colocarte; no hay ningún problema, pero aplica fuerza elevando los talones y extiende a la vez las rodillas casi por completo, manteniéndolas así para enfatizar los gastrocnemios. Mantén el gesto de máxima contracción con una breve pausa y desciende de forma controlada lo máximo que te permita tu movilidad de tobillo, rompiendo la paralela de tu tobillo con el apoyo de pies. Aguanta también una breve pausa en el punto de máximo estiramiento y comienza a contraer fuerte de nuevo para realizar una nueva repetición.$t$,
  cues=array[$t$Realiza un rango de movimiento lo más completo posible.$t$,
    $t$Clávate contra el respaldo y el asiento. Agarra las manetas para poder estar más estable.$t$,
    $t$Realiza el movimiento lento y controlado, sin aprovechar inercias ni energía elástica.$t$,
    $t$Coloca los pies bajos en el soporte, dejando los talones libres para ganar recorrido.$t$]::text[]
where id=504;

-- 505 · Gemelo Unilateral en Déficit en Multipower
update exercises set
  description=$t$Esta variante de extensión de tobillo o elevación de talón en multipower se realiza de forma similar a la variante bilateral, con el foco de trabajo sobre los gastrocnemios, al realizarse con la rodilla extendida. Puede ser una muy buena opción para muchas personas: si bien es cierto que puede resultar más inestable que su alternativa con ambas piernas, realizarla con un solo pie suele ayudar a aquellas personas que tienden a hacer el ejercicio demasiado rápido, con rebotes o de forma descontrolada. Se utiliza un step o un disco para poder descender los talones por debajo de las puntas y lograr un rango de recorrido más completo.$t$,
  execution=$t$Colócate la barra de la multipower sobre los trapecios, como si fueras a realizar una sentadilla con barra alta, y sitúa ambos pies sobre el step. A continuación, retira hacia atrás el pie que no va a trabajar, dejando un único pie de apoyo, con la punta y el mediopié sobre el step y todo el talón en el aire. Desde esta posición inicial, saca la barra del soporte y comienza a descender de forma controlada, estirando al máximo el músculo como si quisieras tocar el suelo con el talón, sin perder tensión. Para evitar los rebotes, aguanta brevemente en el estiramiento y contrae de forma potente elevando el talón; una vez alcanzado el punto de máxima contracción, evita de nuevo los rebotes con una ligera pausa isométrica y comienza a descender de nuevo de forma controlada hasta la posición de máximo estiramiento.$t$,
  cues=array[$t$Realiza un movimiento lo más completo posible, como si quisieras tocar el suelo con el talón, sin llegar a hacerlo.$t$,
    $t$Añade una pausa en el máximo estiramiento y acortamiento para evitar realizar el ejercicio con rebotes e impulsos, lo que restaría estímulo al músculo.$t$,
    $t$Mantén la rodilla extendida: el movimiento lo realiza únicamente el tobillo.$t$]::text[]
where id=505;

-- 506 · Gemelo en Máquina de Pie
update exercises set
  description=$t$Esta máquina es una muy buena opción para trabajar específicamente los gastrocnemios: al tener la rodilla extendida, enfatizamos esta musculatura sobre el sóleo. Tiene algunas ventajas respecto a su realización en multipower, como la mayor comodidad de los apoyos acolchados en comparación con la barra y la mayor estabilidad de la plataforma para los pies en comparación con un step. Un error muy común al realizarla es dar saltitos y rebotar como un muelle: elimina la inercia de cada repetición.$t$,
  execution=$t$Coloca los apoyos acolchados sobre tus hombros y, en caso de disponer de manetas, agárralas fuerte para situarte en una posición estable. Desde aquí, desplaza los talones hacia atrás en la plataforma, dejando apoyadas solo las puntas de tus pies sobre la misma. Para situarte en la posición inicial, desciende los talones lo máximo posible respecto a la línea de la plataforma y comienza a subir con una contracción potente y controlada. Piensa en llevar tus talones lo más arriba posible y, una vez no puedas extender más los tobillos, añade una pausa isométrica y realiza un descenso controlado siguiendo la misma pauta; maximiza el rango de movimiento y evita los rebotes o aprovechar la energía elástica.$t$,
  cues=array[$t$Elimina las fuerzas inerciales en todas las repeticiones; realiza un movimiento controlado y sin rebotes.$t$,
    $t$Evita doblar las rodillas o hundirlas en la fase excéntrica para dar sensación de mayor ROM; piensa en descender al máximo tus talones.$t$]::text[]
where id=506;

-- 507 · Sóleo Sentado en Máquina
update exercises set
  description=$t$Posiblemente, este ejercicio es la mejor opción para trabajar el sóleo de forma aislada, tanto de forma unilateral como bilateral. Recuerda que, para enfatizar esta musculatura sobre los gastrocnemios, es fundamental que las rodillas permanezcan dobladas durante la extensión de tobillo, gesto que se facilita mucho con el diseño de la máquina y el apoyo de la carga sobre ellas. Recuerda también que es clave evitar los rebotes o los movimientos demasiado rápidos durante la realización del ejercicio.$t$,
  execution=$t$Sentado en la máquina, ajusta los soportes a tus rodillas mientras colocas las puntas de los pies sobre la plataforma de apoyo, dejando los talones libres. Manteniendo en todo momento las rodillas dobladas, comienza descendiendo los talones para situarte en la posición inicial, estirando todo lo que puedas. Desde este punto, comienza a subir empujando con las puntas de tus pies hacia abajo; piensa en elevar todo lo que puedas las rodillas y elimina las posibles inercias entre las fases concéntrica y excéntrica, dejando una pausa en el máximo estiramiento y otra en el máximo acortamiento.$t$,
  cues=array[$t$Elimina posibles rebotes añadiendo una pausa al final de las fases concéntrica y excéntrica.$t$,
    $t$Evita que el movimiento sea demasiado rápido; siente cada repetición.$t$,
    $t$Piensa en llevar tus rodillas lo más alto posible.$t$]::text[]
where id=507;

-- 508 · Aductor en Máquina Sentado V1
update exercises set
  description=$t$El trabajo de los aductores suele estar infravalorado y, por el contrario, suele ser muy agradecido. Este ejercicio es posiblemente una de las mejores formas de trabajarlos de forma aislada; suele realizarse con las rodillas dobladas, aunque existen variantes en las que las rodillas se encuentran extendidas (V2). Es habitual ver a la mayoría de la gente realizarlo con una gran cantidad de errores, siendo lo más común la falta de control de la cadencia o el uso de rebotes. Controla el movimiento para llevar el estímulo a la musculatura aductora y aprovecha su gran estabilidad para sacar repeticiones muy peleadas: podrás progresar en gran medida.$t$,
  execution=$t$Siéntate en la máquina apoyando bien la cadera contra la parte trasera del respaldo mientras agarras fuertemente las manetas; de esta forma estarás generando la posición más estable posible desde la que aplicar fuerza, ya que mucha gente comete el error de levantar la cadera durante el ejercicio. A continuación, sitúa los pies sobre los apoyos, con las rodillas contra las almohadillas o pads destinados para ello, y abre la máquina hasta el punto más atrasado del ROM al que puedas llevarla sin dolor, pero generando tensión sobre toda la cara interna del muslo. Esta será tu posición inicial; desde aquí, comienza a aplicar fuerza con las rodillas, pensando en juntar ambas piernas de forma controlada, evitando dar un golpe al chocarlas y rebotar. Una vez juntos por completo los muslos, vuelve de forma lenta y controlada hasta la posición inicial, evitando una fase excéntrica rápida.$t$,
  cues=array[$t$Realiza un movimiento controlado; evita chocar los apoyos de las piernas entre sí rebotando o realizar una fase excéntrica demasiado rápida.$t$,
    $t$Agarra fuerte las manetas para clavarte en el asiento y tener una posición estable.$t$,
    $t$Empuja tu cuerpo contra el asiento a la vez que juntas las rodillas.$t$,
    $t$Busca el máximo ROM posible sin dolor, pero con tensión.$t$]::text[]
where id=508;

-- 509 · Aductor en Máquina (V2)
update exercises set
  description=$t$Esta variante de aductor sentado en máquina también es una buena opción para su trabajo. Puede realizarse en algunas máquinas convencionales que cuentan con 2 apoyos distintos para los pies, que permiten trabajar con las rodillas extendidas, o en máquinas diseñadas específicamente para trabajar este movimiento con ambas rodillas estiradas. Entre otras diferencias, podría ser que el músculo grácil, al ser biarticular, tenga un mayor énfasis cuando realizamos el gesto de aducción con las rodillas extendidas, en contraposición a cuando lo realizamos con las rodillas dobladas.$t$,
  execution=$t$Siéntate en la máquina asegurando una posición estable: para ello, agarra fuerte las manetas y empújate contra el asiento; a la vez, coloca los pies sobre los apoyos y las rodillas contra las almohadillas. Sitúa la posición inicial separando las piernas al máximo, buscando el punto más lejano posible en el que sientas tensión en los aductores, pero no dolor. Esta será tu posición inicial; desde aquí, comienza la fase concéntrica pensando en cerrar tus piernas, juntando fuertemente una rodilla contra la otra; continúa hasta cerrar por completo los muslos, aguanta ligeramente la contracción y vuelve a la posición inicial controlando la fase excéntrica.$t$,
  cues=array[$t$Empuja tu cuerpo contra el asiento y agarra fuerte las manetas para generar mayor estabilidad y asegurarte contra el asiento.$t$,
    $t$Piensa en juntar fuerte ambas rodillas y aguanta ligeramente la contracción antes de iniciar la fase excéntrica.$t$,
    $t$Busca maximizar el ROM, separa las rodillas todo lo que puedas sin dolor y manteniendo la tensión.$t$]::text[]
where id=509;

-- 510 · Aducción en Polea de Pie
update exercises set
  description=$t$Esta variante de aducciones se realiza en polea de pie, por lo que es necesario contar con una tobillera o un manguito que unamos a la polea y a nuestro tobillo para realizarla. Aunque es un ejercicio de aislamiento de aducción, tiene algunas peculiaridades: es algo más incómodo de realizar que, por ejemplo, en máquina sentado, al tener una posición menos estable (contamos con un solo pie de apoyo). Existe una máquina diseñada específicamente para realizar este ejercicio de pie con mayor estabilidad, pero, en caso de no contar con ella, puede ser el sustituto más similar al propio movimiento.$t$,
  execution=$t$Colócate de forma lateral a una polea, aproximadamente a 1 o 2 metros de separación de la misma, con una tobillera que una la polea con la pierna que ejecutará el movimiento. Apoya el pie contrario mientras te agarras a un soporte (puede servir el de la propia polea) y adelanta el pie de la pierna que ejecutará el movimiento respecto al otro, a la vez que lo despegas ligeramente del suelo; si te cuesta realizar este gesto, puede hacerse con un step o un cajón bajo el pie de apoyo. Piensa en cerrar con la pierna adelantada y busca llevar el pie del lado que trabaja unos 10-15 cm más allá del pie de apoyo, de forma potente pero controlada. Aguanta ligeramente el movimiento y resiste la fase excéntrica hasta volver a la posición inicial, evitando perder tensión.$t$,
  cues=array[$t$Resiste la fase excéntrica y busca dar amplitud y estiramiento al movimiento.$t$,
    $t$Piensa en llevar el pie del lado que trabaja más allá del pie de apoyo.$t$,
    $t$Agarra un soporte para generar estabilidad, ya que el apoyo es de una sola pierna.$t$,
    $t$Aguanta de forma isométrica en el máximo acortamiento antes de descender.$t$]::text[]
where id=510;

-- 511 · Copenhagen Adductions (antes «Copenaghen Adductions»)
update exercises set
  name=$t$Copenhagen Adductions$t$,
  description=$t$Este ejercicio, más que para la hipertrofia, por su limitada capacidad de progresión a largo plazo y por su tipo de movimiento, suele emplearse especialmente como calentamiento o preactivación, siendo una muy buena opción para fortalecer los aductores: en un estudio (51), su uso redujo en aproximadamente un 41% la incidencia de dolor de ingle. También es un ejercicio muy utilizado en programas de prevención y rehabilitación de lesiones. Podemos realizarlo con la rodilla doblada o extendida, apoyándola en un cajón, un banco, un TRX, una colchoneta o incluso con la asistencia de otra persona.$t$,
  execution=$t$Túmbate de lado en el suelo, con el codo doblado para apoyar todo el antebrazo en el suelo y crear una posición estable. Apoya la pierna de arriba, doblada o extendida, sobre un cajón, un banco o similar, y genera tensión en tu abdomen y tu glúteo para situarte en la posición inicial. Desde esta posición, con tu tren inferior alineado, comienza a juntar tus muslos con fuerza, una pierna contra la otra. Aguanta de forma isométrica varios segundos en la posición de máxima tensión y desciende de forma controlada hasta la posición inicial de nuevo.$t$
where id=511;

-- 519 · Leg Extensions (Máquina con Discos) (antes «Leg Extensions (Maquina con Discos)»)
update exercises set
  name=$t$Leg Extensions (Máquina con Discos)$t$,
  cues=array[$t$Ajusta correctamente la máquina para que el eje de giro coincida con la rodilla.$t$,
    $t$Evita impulsarte con el tronco o despegar la espalda del respaldo.$t$,
    $t$Controla tanto la fase de subida como la de bajada.$t$,
    $t$No bloquees las rodillas al finalizar el movimiento.$t$]::text[]
where id=519;

commit;
