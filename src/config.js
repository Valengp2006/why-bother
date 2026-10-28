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

  // --- Juicio (clic para conservar o soltar) ---
  // Masa mínima de traza dentro del radio para que un juicio cuente como hecho "sobre algo".
  // Por debajo se registra igual, pero con origen 'ninguno'. Más alto: exige más pintura bajo el cursor.
  JUDGMENT_MIN_MASS: 0.4,

  // --- Criterio (lo conservado se vuelve una intención persistente) ---
  // Al conservar una zona se guarda de qué origen era y hacia dónde fluía su pintura. Desde ahí esa zona
  // sigue emitiendo agentes con esa dirección y proyectando su propio alcance, aunque el mouse esté en otro lado.
  // Soltar la zona la apaga. Es lo que hace que juzgar tenga consecuencias sobre lo que viene después.

  // Claridad con la que nacen y actúan los agentes de un criterio (0 a 1). Es "qué tan clara quedó" la intención
  // conservada. Más alto: la siguen con más fidelidad; más bajo: se desvían y derivan más.
  CRITERION_CLARITY: 0.85,

  // Agentes por segundo que emite cada criterio. Más alto: lo conservado sigue más fuerte; 0 lo deja solo en el campo.
  CRITERION_SPAWN_RATE: 10,

  // Máximo de criterios activos a la vez. Al pasarlo, el más antiguo deja de emitir (su zona sigue conservada).
  MAX_CRITERIA: 10,

  // Qué tan alineada debe estar la pintura de una zona (0 a 1; 1 = todo fluía igual) para que cuente como criterio.
  // Más alto: solo zonas con un flujo claro. Una zona sin dirección clara se conserva, pero no emite.
  CRITERION_MIN_COHERENCE: 0.3,

  // --- Trazas (malla tipo Physarum, un canal por comportamiento) ---
  // Resolución de la malla respecto a la pantalla (0 a 1). 0.25 = una celda por cada 4×4 px.
  // Más alto: trazas más finas y más costo de CPU. Más bajo: manchas más gruesas y suaves.
  GRID_SCALE: 0.25,

  // Cuánta traza deposita cada agente por segundo en su celda. Más alto: el color se acumula más rápido y satura.
  DEPOSIT: 22,

  // Cuánto se mezcla cada celda con sus vecinas por cuadro (0 a 1). Más alto: las trazas se esparcen
  // más y se ven más como pintura que se corre; 0 deja puntos nítidos.
  DIFFUSION: 0.12,

  // Cuánto de la traza normal queda después de 1 segundo (0 a 1). Más alto: las trazas duran más.
  DECAY: 0.85,

  // Cuánto de la traza conservada queda después de 1 segundo. Cerca de 1: casi no se borra.
  CONSERVE_DECAY: 0.95,

  // Cuánto de la traza soltada queda después de 1 segundo. Más bajo: se desvanece más rápido.
  RELEASE_DECAY: 0.02,

  // Radio (px) alrededor del cursor al que afecta conservar (clic) o soltar (clic derecho / Shift+clic).
  CONSERVE_RADIUS: 70,

  // Tope de la traza en una celda. Más alto: permite acumulaciones más intensas antes de saturar.
  TRAIL_MAX: 3,

  // Sensores tipo Physarum: cada agente mira la traza conservada en tres puntos (izquierda, frente, derecha).
  // Ángulo (radianes) entre el sensor del frente y los laterales. Más alto: mira más abierto.
  SENSE_ANGLE: 0.6,

  // A qué distancia (px) del agente están los sensores. Más alto: siente lo conservado desde más lejos.
  SENSE_DISTANCE: 30,

  // Fuerza (px/s²) con la que un agente es atraído hacia la traza conservada. 0 la desactiva.
  // Más alto: lo conservado atrae y recoge más agentes (el "punto de partida" pesa más).
  SENSE_WEIGHT: 350,

  // Intensidad mínima de traza conservada para que un sensor la note.
  SENSE_MIN: 0.05,

  // --- Dibujo ---
  // Brillo de las trazas al dibujarlas. Más alto: colores más saturados y luminosos; más bajo: más oscuro y tenue.
  TRAIL_GAIN: 1.8,

  // Cuánto cubre la pintura dorada (la que nace de lo conservado) a la demás. Más alto: el dorado domina enseguida;
  // más bajo: solo se ven vetas finas. Es la señal visual de lo que la persona eligió conservar.
  GOLD_COVER: 0.4,

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

  // --- Capa narrativa (frases cortas que explican qué representa cada cosa) ---
  // Cada frase aparece una sola vez, en orden, cuando su elemento aparece en pantalla, y se desvanece sola.
  // Describen el mecanismo; no dicen qué es bueno o malo. Si se apaga, la obra queda sin texto salvo la instrucción inicial.
  NARRATIVE_ENABLED: true,

  // Cuánto dura cada frase en pantalla (ms), contando su aparición y su desvanecimiento.
  NARRATIVE_MS: 8000,

  // Cuánto se espera (ms) después de la frase de los comportamientos antes de la del juicio.
  NARRATIVE_JUDGMENT_DELAY: 5000,

  // Si se muestra la frase del juicio (clic para conservar y soltar).
  JUDGMENT_ENABLED: true,

  // Los textos. 'color' toma el de la paleta (fiel, desvio, deriva, conservado); sin 'color', el texto es neutro.
  NARRATIVE_TEXT: {
    intencion: [
      { text: 'Tu mano marca una intención. Mientras más clara, más lejos llega.' },
    ],
    comportamientos: [
      { text: 'Lo que nace de ella la interpreta.' },
      { text: 'Blanco: sigue lo que quisiste.', color: 'fiel' },
      { text: 'Turquesa: se desvía, pero en grupo.', color: 'desvio' },
      { text: 'Azul: se pierde.', color: 'deriva' },
    ],
    juicio: [
      { text: 'Tú decides qué se queda.' },
      { text: 'Clic: conservar, en dorado. Lo conservado sigue su camino sin ti.', color: 'conservado' },
      { text: 'Clic derecho: soltar.' },
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
