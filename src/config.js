// config.js — TODOS los parámetros de la obra viven aquí.
// Regla: cada uno lleva un comentario de qué hace y qué pasa si se sube.
// Antes de cambiar uno, anota tu hipótesis en la bitácora; después, lo que observaste.
// (Se irá llenando a medida que cada hito lo necesite; la lista completa está en AGENT.md §4.)

export const CONFIG = {
  // --- General ---
  // Semilla de la aleatoriedad. Misma semilla + mismo recorrido del mouse = mismo resultado.
  // Cambiarla da otra "población" de susceptibilidades y ángulos de desvío.
  RANDOM_SEED: 8,

  // Color de fondo (la oscuridad de inicio).
  BACKGROUND: '#050b14', // azul casi negro

  // Si el panel de depuración (tecla D) está visible al abrir la página.
  DEBUG_AT_START: true,

  // --- Modos (ver mode.js): se elige con ?modo=dev o ?modo=performance en la dirección ---
  // Lo que cambia cada modo. Estos valores reemplazan a los de arriba al abrir la página.
  MODES: {
    // Para presentar: pantalla limpia, pantalla completa al hacer clic, malla más ligera para mantener la fluidez.
    performance: { DEBUG_AT_START: false, FULLSCREEN: true, GRID_SCALE: 0.22 },
    // Para construir y probar: panel de depuración, sin pantalla completa.
    dev: { DEBUG_AT_START: true, FULLSCREEN: false },
  },

  // --- Inicio y prólogo (la historia empieza en la pantalla de inicio y fluye con la imagen y el sonido) ---
  // Título de la obra en la pantalla de inicio. Debajo va HINT_TEXT ('Haz clic para comenzar').
  TITLE: 'Cauce',

  // Segundos que tarda la pintura en florecer desde la oscuridad tras el primer clic (y el sonido en subir).
  // Más alto: el inicio es más lento y contemplativo; más bajo: arranca de una vez.
  BLOOM_SECONDS: 18,

  // --- Intención (el mouse, sin presionar) ---
  // Cuánta historia del mouse se mira para medir la claridad, en milisegundos.
  // Más alto: la claridad reacciona más lento y "perdona" cambios bruscos recientes.
  WINDOW_MS: 1500,

  // Rapidez media mínima (px/segundo) para que haya intención. Por debajo, claridad 0
  // y (más adelante) no nacen agentes. Más alto: cuesta más activar la intención.
  MIN_SPEED: 80,

  // Peso de la constancia de dirección en la claridad. W_DIR + W_SPEED debe sumar 1.
  // Más alto: importa más ir "recto" que ir a ritmo parejo.
  W_DIR: 0.6,

  // Peso de la constancia de velocidad en la claridad. Más alto: importa más el ritmo parejo.
  W_SPEED: 0.4,

  // --- Campo (el trazo del mouse deja direcciones en celdas) ---
  // Tamaño de cada celda del campo, en px. Más alto: campo más grueso y barato, giros menos finos.
  FIELD_CELL: 40,

  // Radio (px) alrededor del mouse donde el trazo deja su dirección. Más alto: el trazo "arrastra" más agentes.
  FIELD_RADIUS: 90,

  // Cuánto del campo queda después de 1 segundo (0 a 1). Más alto: el campo dura más
  // y los agentes siguen un trazo viejo; más bajo: el campo desaparece casi al instante.
  FIELD_DECAY: 0.3,

  // Alcance: cuántos px por delante de la mano llega el campo cuando la claridad es 1.
  // Con claridad 0.5 llega a la mitad. Más alto: el sistema llega más lejos que la mano.
  LOOKAHEAD: 450,

  // Qué tanto se abre el abanico del alcance (px de ancho extra por cada px de distancia).
  // Más alto: el alcance cubre una zona más ancha; 0 es una línea recta.
  FAN_SPREAD: 0.25,

  // Fuerza mínima del campo para que un agente lo "sienta". Por debajo, el agente solo hace wander.
  FIELD_MIN_STRENGTH: 0.08,

  // --- Ambiente (la pintura se mueve sola, sin necesidad de la mano) ---
  // Un campo de corrientes que cambia despacio con el tiempo (ruido en forma de remolinos) mueve a los agentes
  // por toda la pantalla. La mano es una perturbación: donde hay trazo manda el trazo; fuera de él manda el ambiente.

  // Fuerza (px/s²) con la que el ambiente empuja a un agente. Más alto: los ríos son más firmes y rectos;
  // más bajo: los agentes vagan más a su aire.
  AMBIENT_STRENGTH: 300,

  // Tamaño de los remolinos: frecuencia espacial del ruido (1/px). Más alto: remolinos más chicos y más numerosos.
  AMBIENT_SCALE: 0.0018,

  // Rapidez con la que cambia el ambiente (ciclos de ruido por segundo). Más alto: las corrientes se reordenan rápido.
  AMBIENT_RATE: 0.05,

  // Cuántas fuentes (manantiales) emiten agentes por sí solas, vague con el ambiente por la pantalla.
  AMBIENT_WELLS: 4,

  // Agentes por segundo que emite cada fuente. Más alto: más pintura sin que la persona haga nada; 0 apaga el ambiente.
  AMBIENT_SPAWN_RATE: 28,

  // Qué tan rápido se mueven las fuentes por la pantalla (ciclos de ruido por segundo).
  AMBIENT_WELL_SPEED: 0.03,

  // --- Agentes ---
  // Máximo de agentes vivos a la vez. Más alto: más denso, más costo de CPU.
  PARTICLE_COUNT: 2500,

  // Cuánto vive un agente, en segundos, antes de reciclarse. Más alto: más agentes en pantalla y trazos más largos.
  AGENT_LIFETIME: 7,

  // Agentes que nacen por segundo por cada px/s de rapidez del mouse. Más alto: nacen más con el mismo movimiento.
  SPAWN_RATE: 0.2,

  // Distancia máxima (px) del mouse a la que nace un agente.
  SPAWN_RADIUS: 30,

  // Rapidez inicial (px/s) con la que nace un agente, en la dirección del trazo.
  SPAWN_SPEED: 120,

  // Rapidez máxima (px/s) de un agente. Más alto: se mueven más rápido y llegan más lejos en su vida.
  MAX_SPEED: 240,

  // Fuerza máxima de giro (px/s²). Más alto: giran más rápido para seguir el campo.
  MAX_FORCE: 200,

  // Ruido (wander) cuando la fidelidad es 0, en px/s². Se multiplica por (1 − fidelidad).
  // Más alto: los poco fieles se agitan más y se dispersan; la fidelidad baja de todos se nota más.
  WANDER_STRENGTH: 180,

  // Qué tan rápido cambia la dirección del ruido (ciclos de ruido por segundo). Más alto: tiembla más; más bajo: curvas suaves.
  WANDER_RATE: 0.6,

  // Ángulo máximo (radianes) de desvío propio de cada agente. Se aplica rotado × (1 − fidelidad).
  // Más alto: los poco fieles se apartan más del campo. 3.14 ≈ pueden ir en sentido contrario.
  MAX_DEVIATION_ANGLE: 1.4,

  // Fidelidad mínima (claridad × susceptibilidad) para ser "fiel". Más alto: hay menos fieles.
  FIDELITY_HIGH: 0.55,

  // --- Flocking (los desvíos se agrupan en caminos coherentes) ---
  // Radio (px) en el que un agente mira a sus vecinos. Más alto: ve más vecinos, los grupos son más grandes.
  FLOCK_RADIUS: 40,

  // Cuántos vecinos de rumbo afín hacen falta para que un agente no fiel sea "desvío" y no "deriva".
  // Más alto: cuesta más ser desvío y hay más deriva. Más bajo: casi todo lo no fiel es desvío.
  COHERENCE_NEIGHBORS: 4,

  // Qué tan parecido debe ser el rumbo de un vecino (coseno del ángulo entre ambos, de -1 a 1).
  // 0.9 ≈ menos de 26° de diferencia. Más alto: exige rumbos casi idénticos.
  ALIGN_MIN: 0.9,

  // Cuánto copia un desvío el rumbo de sus vecinos desvío (alineación). Más alto: caminos más rectos y uniformes.
  ALIGN_WEIGHT: 1.0,

  // Cuánto se acerca un desvío al centro de sus vecinos desvío (cohesión). Más alto: grupos más compactos.
  COHESION_WEIGHT: 0.6,

  // Cada cuántos ms se reevalúa el comportamiento (fiel/desvío/deriva) de un agente.
  CLASSIFY_INTERVAL: 500,

  // --- Verter (mantener el clic) y criterio (lo vertido sigue sin ti) ---
  // Mantener el clic vierte pintura dorada: es TUYA, lo que pone la persona (el resto lo pone el sistema).
  // Al soltar el clic nace un "criterio" en ese punto, con la dirección en que iba la mano: sigue emitiendo
  // pintura dorada y proyectando su alcance, aunque el mouse esté en otro lado, y se apaga solo con el tiempo.

  // Claridad con la que actúan los agentes de pintura dorada (0 a 1). Es "qué tan clara quedó" lo que vertiste.
  // Más alto: siguen mejor su dirección; más bajo: se desvían y divagan más.
  CRITERION_CLARITY: 0.85,

  // Agentes por segundo que emite cada criterio al nacer. Más alto: lo que vertiste sigue más fuerte sin ti; 0 lo deja solo en el campo.
  CRITERION_SPAWN_RATE: 10,

  // Agentes por segundo que se vierten mientras se mantiene el clic. Más alto: el vertido es más denso y cubre más.
  POUR_RATE: 150,

  // Radio (px) alrededor del cursor dentro del cual nace la pintura que se vierte. Más alto: el vertido es más ancho.
  POUR_RADIUS: 22,

  // Vertido mínimo (ms) para que al soltar nazca un criterio. Evita que un clic suelto deje una fuente.
  POUR_MIN_MS: 350,

  // Cuánto dura (segundos) un criterio antes de apagarse. Más alto: lo vertido sigue emitiendo más tiempo sin ti.
  CRITERION_LIFE: 45,

  // Máximo de criterios activos a la vez. Al pasarlo, el más antiguo deja de emitir.
  MAX_CRITERIA: 10,

  // --- Trazas (malla tipo Physarum, un canal por comportamiento) ---
  // Resolución de la malla respecto a la pantalla (0 a 1). 0.25 = una celda por cada 4×4 px.
  // Más alto: trazas más finas y más costo de CPU. Más bajo: manchas más gruesas y suaves.
  GRID_SCALE: 0.25,

  // Ancho de la pincelada: cuántas celdas se reparte lo que deposita cada agente a cada lado. 0 = una sola celda (línea angosta);
  // 2 = pinceladas anchas y suaves. Más alto: líneas más gordas y menos nítidas.
  DEPOSIT_RADIUS: 3,

  // Cuánto de la pintura dorada (la que vierte la persona) queda después de 1 segundo. Más alto que DECAY:
  // lo tuyo dura más que lo que hace el sistema. Más cerca de 1: casi no se borra.
  GOLD_DECAY: 0.93,

  // Cuánta traza deposita cada agente por segundo en su celda. Más alto: el color se acumula más rápido y satura.
  DEPOSIT: 28,

  // Cuánto se mezcla cada celda con sus vecinas por cuadro (0 a 1). Más alto: las trazas se esparcen
  // más y se ven más como pintura que se corre; 0 deja puntos nítidos.
  DIFFUSION: 0.12,

  // Cuánto de la traza normal queda después de 1 segundo (0 a 1). Más alto: las trazas duran más.
  DECAY: 0.85,

  // Tope de la traza en una celda. Más alto: permite acumulaciones más intensas antes de saturar.
  TRAIL_MAX: 3,

  // Sensores tipo Physarum: cada agente mira la pintura dorada en tres puntos (izquierda, frente, derecha).
  // Ángulo (radianes) entre el sensor del frente y los laterales. Más alto: mira más abierto.
  SENSE_ANGLE: 0.6,

  // A qué distancia (px) del agente están los sensores. Más alto: siente tu pintura desde más lejos.
  SENSE_DISTANCE: 30,

  // Fuerza (px/s²) con la que un agente es atraído hacia la pintura dorada. 0 la desactiva.
  // Más alto: lo tuyo atrae y recoge más agentes del sistema.
  SENSE_WEIGHT: 350,

  // Intensidad mínima de pintura dorada para que un sensor la note.
  SENSE_MIN: 0.05,

  // --- Sonido (agua y viento con Tone.js; sin escala musical) ---
  // Volumen general en decibelios. Más alto (menos negativo): suena más fuerte. 0 es el máximo sin recorte.
  AUDIO_VOLUME_DB: -14,

  // Frecuencia (Hz) del viento en el mundo frío y en el cálido. El viento se aclara al inclinarse la paleta hacia lo cálido.
  WIND_COOL_HZ: 320,
  WIND_WARM_HZ: 1100,

  // Gotas de agua por segundo cuando la pintura se mueve con fuerza. Más alto: lluvia más densa; 0 las apaga.
  DROP_RATE: 3.5,

  // Tono (Hz) de las gotas en el mundo frío y en el cálido (más agudas = más cálido y brillante).
  DROP_COOL_HZ: 520,
  DROP_WARM_HZ: 1250,

  // Frecuencia (Hz) del zumbido grave que sostiene lo conservado. Una voz por cada criterio activo.
  DRONE_HZ: 98,

  // Máximo de voces del zumbido a la vez. Más alto: lo conservado puede sonar más lleno.
  MAX_VOICES: 4,

  // --- Cierre (la obra termina: el sistema se calma y lo tuyo es lo que más dura) ---
  // Milisegundos sin mover el mouse ni hacer clic, después de la pregunta final, para que la obra se cierre sola.
  // Más alto: espera más. También se cierra al elegir 'Guardarla' o con la tecla E.
  IDLE_TIMEOUT_MS: 45000,

  // Segundos que dura el cierre: el sistema deja de poner pintura, el mar se aquieta y lo que hizo el sistema se disuelve.
  // Más alto: el final es más lento y contemplativo.
  DISSOLVE_SECONDS: 18,

  // Cuánto de la pintura dorada queda tras 1 segundo durante el cierre y el reposo (más cerca de 1: dura más).
  // Es lo que queda en pantalla cuando todo lo demás se disolvió: lo tuyo.
  GOLD_DECAY_REST: 0.992,

  // El epílogo: frases que aparecen una a una durante el cierre. Son tuyas.
  EPILOGUE: [
    { text: 'El agua corrió sola.' },
    { text: 'Por dónde, lo decidiste tú.' },
  ],

  // Invitación en el reposo, tras el cierre. Al hacer clic la obra empieza de nuevo.
  RESTART_TEXT: 'Haz clic para volver a empezar',

  // --- Tipografía y puntero ---
  // La letra de la obra: Cormorant Garamond (cursiva), incluida en el proyecto. Si no cargara, usa una serif del sistema.
  FONT: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",

  // Si se oculta el puntero convencional del mouse (la mano se ve por el trazo de la intención y las opciones se
  // resaltan al acercarse). En modo performance solo se oculta en pantalla completa, para poder usar el botón de volver.
  // La tecla C lo muestra u oculta al probar.
  HIDE_CURSOR: true,

  // --- Dibujo ---
  // Brillo de las trazas al dibujarlas. Más alto: colores más saturados y luminosos; más bajo: más oscuro y tenue.
  TRAIL_GAIN: 1.8,

  // --- Pintura (cómo se ve la pintura: se mezcla como pigmento, cubre y tiene grosor) ---
  // Cuánto cubre la pintura al fondo según su cantidad. Más alto: más opaca; más bajo: más transparente, se ve el fondo.
  PAINT_COVER: 1.2,

  // Opacidad de cada pigmento al mezclarse: [fiel, desvío, deriva, dorado]. Más alto: ese pigmento domina la mezcla.
  // La deriva es translúcida (se pierde) y el dorado cubre (es lo que la persona vierte).
  PIGMENT_OPACITY: [1, 1, 0.4, 2],

  // Saturación de la pintura. Mezclar pigmentos la apaga; esto la aviva. 1 = sin cambio; más alto: colores más intensos;
  // menos de 1: más apagados y grisáceos.
  PAINT_SATURATION: 1.6,

  // Olas: la superficie ondula con ondas largas que viajan por toda la pintura (como un mar de pintura).
  // Altura de las olas. Más alto: olas más marcadas; 0 deja la superficie quieta.
  WAVE_SWELL: 0.55,

  // Largo de onda (px) de las olas. Más alto: ondas más anchas y lentas de ver.
  WAVE_LENGTH: 420,

  // Rapidez de las olas. Más alto: viajan más rápido; 0 las detiene.
  WAVE_SPEED: 1,

  // Refracción: cuánto se desplaza el color visto según la inclinación de la ola (en celdas). Da el aspecto de líquido.
  WAVE_REFRACTION: 7,

  // Reflejo del cielo sobre las olas: tiñe de blanco frío donde la ola mira hacia arriba. 0 lo quita.
  WAVE_SKY: 0.12,

  // Relieve: el grosor de la pintura se trata como una altura y las crestas atrapan luz. Más alto: más marcado,
  // como pintura espesa (impasto); 0 la deja plana.
  PAINT_RELIEF: 3,

  // Brillo especular (el reflejo húmedo de la pintura). Más alto: más brillante y mojada; 0 la deja mate.
  PAINT_SPECULAR: 0.45,

  // Cuántas pasadas de suavizado tiene el relieve. Más alto: crestas más lisas y anchas; 0 deja granos sueltos.
  PAINT_BLUR: 4,

  // Si se dibuja la intención: el trazo del mouse y, por delante, su alcance (hasta dónde llega el campo).
  // Sirve para ver qué parte pone la persona y qué parte pone el sistema. false lo oculta.
  SHOW_INTENTION: true,

  // Opacidad (0 a 255) del trazo de la intención. Más alto: se ve más marcado.
  INTENTION_ALPHA: 150,

  // Grosor (px) del trazo de la intención.
  INTENTION_WEIGHT: 2,

  // Instrucción mínima en la oscuridad inicial. Se desvanece cuando la persona hace clic y empieza todo.
  // Explica el control, no el sentido de la obra.
  HINT_TEXT: 'Haz clic para comenzar',

  // Segunda invitación: aparece si pasan unos segundos sin que la persona se mueva con intención.
  HINT2_TEXT: 'Mueve el mouse, sin presionar',

  // --- Capa narrativa (frases cortas que explican qué representa cada cosa) ---
  // Cada frase aparece una sola vez, en orden, cuando su elemento aparece en pantalla, y se desvanece sola.
  // Describen el mecanismo; no dicen qué es bueno o malo. Si se apaga, la obra queda sin texto salvo la instrucción inicial.
  NARRATIVE_ENABLED: true,

  // Cuánto dura cada frase del prólogo en pantalla (ms).
  PROLOGUE_MS: 6500,

  // Si la persona no vierte, la explicación del dorado aparece igual pasados estos segundos desde la invitación,
  // para que la historia no se quede esperando. Más alto: se espera más a que vierta por sí sola.
  GOLD_EXPLAIN_WAIT: 30,

  // Cuánto dura cada frase explicativa en pantalla (ms), contando su aparición y su desvanecimiento.
  NARRATIVE_MS: 8000,

  // Los textos. 'color' toma el de la paleta (fiel, desvio, deriva, conservado); sin 'color', el texto es neutro.
  NARRATIVE_TEXT: {
    // Prólogo: la historia empieza sola, mientras la pintura florece desde la oscuridad. Son tu punto de vista:
    // antes de la IA el esfuerzo técnico era la barrera; ahora lo que queda como tuyo es el sentido. Edítalo con tus palabras.
    prologo1: [{ text: 'Antes, imaginar algo así podía tomar años.' }],
    prologo2: [{ text: 'Ahora, una intención basta para ponerlo en movimiento.' }],
    prologo3: [{ text: 'Pero por dónde corre, lo decides tú.' }],
    intencion: [
      { text: 'Tu mano marca una intención. Mientras más clara, más lejos llega.' },
    ],
    comportamientos: [
      { text: 'Lo que nace de ella la interpreta.' },
      { text: 'Blanco: sigue lo que quisiste.', color: 'fiel' },
      { text: 'Turquesa: se desvía, pero en grupo.', color: 'desvio' },
      { text: 'Azul: se pierde.', color: 'deriva' },
    ],
    // La invitación a verter. Aparece después de explicar los tres colores del sistema.
    juicio: [
      { text: 'Mantén el clic: viertes tu propia pintura.', color: 'conservado' },
    ],
    // Qué es el dorado, para qué sirve y qué representa. Aparece cuando la persona vierte por primera vez y ya ve su dorado.
    // Describe cómo funciona el color, sin juzgar: el dorado es lo único que no pone el sistema.
    oro: [
      { text: 'Lo dorado es lo tuyo.', color: 'conservado' },
      { text: 'Todo lo demás lo pone el sistema solo.' },
      { text: 'Lo tuyo dura más, atrae lo que pasa cerca y sigue su camino sin ti.', color: 'conservado' },
    ],
  },

  // --- Preguntas (cada decisión de la persona cambia el mundo) ---
  // Segundos de espera antes de cada paso de la narración (frase o pregunta). Más alto: da más tiempo a ver lo que cambió.
  STEP_GAP: 14,

  // Distancia (px) del cursor a una opción para elegirla con el clic.
  OPTION_RADIUS: 95,

  // Las preguntas, en orden. Son tuyas: cambia los textos, las opciones y qué mueve cada una.
  // Cada opción tiene un 'effect' con estos valores posibles:
  //   warmth          suma a la calidez (negativo = más frío, positivo = más cálido). Cambia color y sonido.
  //   clarityMul      cuánto cuenta la mano (>1: la pintura la sigue más; <1: menos)
  //   ambientMul      fuerza del ambiente (>1: ríos más firmes; <1: más vagabundos)
  //   wanderMul       cuánto divagan los agentes
  //   ambientSpawnMul cuánta pintura emiten solas las fuentes (>1: más; <1: menos)
  //   senseMul        cuánto atrae tu pintura dorada a los agentes que pasan cerca
  //   criterionRateMul cuánto emite cada vertido tuyo mientras sigue sin ti
  //   decayMul        qué tan rápido se borra lo que hace el sistema (la tuya, dorada, dura más)
  //   criterionLifeMul cuánto dura cada vertido tuyo antes de apagarse
  //   waveMul         altura de las olas (<1 mar en calma, >1 mar bravo)
  //   speedMul        rapidez de lo que fluye
  //   densityMul      cuánta pintura deja cada agente (<1 capa fina, >1 espesa)
  //   deviationMul    cuánto se desvían los agentes de lo que sigue la mano (>1 más desvíos)
  //   glossMul        brillo mojado de la superficie
  //   showMechanism   true muestra el campo y los agentes; false los oculta
  QUESTIONS: [
    {
      id: 'guiar',
      text: '¿Guías el río o lo dejas ir?',
      options: [
        // Calma y control: la pintura sigue tu mano, el mar se aquieta, poca agua propia, colores fríos.
        { label: 'Guiarlo', effect: { clarityMul: 2, ambientMul: 0.45, ambientSpawnMul: 0.5, wanderMul: 0.5, waveMul: 0.45, speedMul: 0.8, glossMul: 1.3, warmth: -0.35 } },
        // Abundancia y tormenta: ríos propios, olas altas, todo más rápido y cálido.
        { label: 'Dejarlo ir', effect: { ambientMul: 1.6, ambientSpawnMul: 2, wanderMul: 1.7, waveMul: 1.9, speedMul: 1.35, warmth: 0.35 } },
      ],
    },
    {
      id: 'inesperado',
      text: '¿Qué haces con lo inesperado?',
      options: [
        // Más desvíos, capa más espesa, lo tuyo atrae y emite mucho más.
        { label: 'Seguirlo', effect: { deviationMul: 2.2, senseMul: 3, criterionRateMul: 2.5, densityMul: 1.35, warmth: 0.2 } },
        // Casi sin desvíos, capa fina, la pintura se borra rápido: queda limpio.
        { label: 'Dejarlo pasar', effect: { deviationMul: 0.3, decayMul: 2, densityMul: 0.7, senseMul: 0.4, warmth: -0.2 } },
      ],
    },
    {
      id: 'solo',
      text: '¿Le pides que siga sin ti?',
      options: [
        // El sistema llena la pantalla y lo que viertes dura mucho.
        { label: 'Sí', effect: { ambientSpawnMul: 2, criterionLifeMul: 2.5, warmth: 0.15 } },
        // Casi no pone nada solo: la pantalla se vacía si tú no la llenas.
        { label: 'No', effect: { ambientSpawnMul: 0.25, criterionLifeMul: 0.4, warmth: -0.15 } },
      ],
    },
    {
      id: 'entender',
      text: '¿Quieres ver cómo funciona?',
      options: [
        // Se ve el campo y los agentes: el mecanismo a la vista.
        { label: 'Mostrarme', effect: { showMechanism: true } },
        // Solo la pintura, más brillante y con más oleaje.
        { label: 'Prefiero no verlo', effect: { showMechanism: false, glossMul: 1.4, waveMul: 1.15 } },
      ],
    },
  ],

  // Pregunta final: 'Guardarla' descarga la obra como imagen y la cierra; 'Seguir creando' la deja abierta
  // (se cierra sola tras IDLE_TIMEOUT_MS sin actividad, o con la tecla E). Textos editables.
  FINAL_QUESTION: {
    text: 'Esto es lo que decidiste.',
    options: [
      { label: 'Guardarla' },
      { label: 'Seguir creando' },
    ],
  },

  // Si se dibujan también los trazos de los agentes (además de las trazas). Se ven siempre con D activo.
  SHOW_AGENTS: false,

  // Paleta aprobada (ver docs/bitacora/2026-10-23-direccion-visual.md).
  COLORS: {
    fiel: '#e8f1f5',   // blanco hielo cálido
    desvio: '#2fb8b0', // turquesa
    deriva: '#1b3a5c', // azul profundo apagado
    conservado: '#c9a46a', // dorado tenue: la única señal del juicio
  },

  // Paleta cálida: hacia ella se inclina la obra según lo que elija la persona (ver WARMTH en las preguntas).
  // La paleta de arriba (COLORS) es el extremo frío; esta, el extremo cálido (referencia: pintura fluida azul, naranja y crema).
  COLORS_WARM: {
    fiel: '#f7e9c9',   // crema
    desvio: '#e9892f', // naranja
    deriva: '#7a2f2a', // rojo oscuro apagado
    conservado: '#ffd27a', // dorado claro
  },

  // Cuánta calidez (0 = fría, 1 = cálida) tiene la paleta al empezar. Las decisiones la inclinan hacia un lado u otro.
  WARMTH_START: 0.2,

  // Cuánto tarda (segundos) la paleta en acomodarse tras una decisión. Más alto: el cambio de color es más lento y suave.
  WARMTH_SMOOTH: 4,

  // Largo (px) del trazo con el que se dibuja cada agente, orientado según su rumbo.
  AGENT_STROKE_LEN: 14,

  // Grosor (px) del trazo de cada agente.
  AGENT_STROKE_WEIGHT: 1.4,
};
