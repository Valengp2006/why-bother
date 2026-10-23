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

  // --- Agentes ---
  // Máximo de agentes vivos a la vez. Más alto: más denso, más costo de CPU.
  PARTICLE_COUNT: 2500,

  // Cuánto vive un agente, en segundos, antes de reciclarse. Más alto: más agentes en pantalla y trazos más largos.
  AGENT_LIFETIME: 5,

  // Agentes que nacen por segundo por cada px/s de rapidez del mouse. Más alto: nacen más con el mismo movimiento.
  SPAWN_RATE: 0.12,

  // Distancia máxima (px) del mouse a la que nace un agente.
  SPAWN_RADIUS: 30,

  // Rapidez inicial (px/s) con la que nace un agente, en la dirección del trazo.
  SPAWN_SPEED: 120,

  // Rapidez máxima (px/s) de un agente. Más alto: se mueven más rápido y llegan más lejos en su vida.
  MAX_SPEED: 240,

  // Fuerza máxima de giro (px/s²). Más alto: giran más rápido para seguir el campo.
  MAX_FORCE: 500,

  // Ruido (wander) cuando la fidelidad es 0, en px/s². Se multiplica por (1 − fidelidad).
  // Más alto: los poco fieles se agitan más y se dispersan; la fidelidad baja de todos se nota más.
  WANDER_STRENGTH: 400,

  // Qué tan rápido cambia la dirección del ruido (ciclos de ruido por segundo). Más alto: tiembla más; más bajo: curvas suaves.
  WANDER_RATE: 0.6,

  // Ángulo máximo (radianes) de desvío propio de cada agente. Se aplica rotado × (1 − fidelidad).
  // Más alto: los poco fieles se apartan más del campo. 3.14 ≈ pueden ir en sentido contrario.
  MAX_DEVIATION_ANGLE: 1.4,

  // Fidelidad mínima (claridad × susceptibilidad) para ser "fiel". Más alto: hay menos fieles.
  FIDELITY_HIGH: 0.55,

  // Cada cuántos ms se reevalúa el comportamiento (fiel/desvío/deriva) de un agente.
  CLASSIFY_INTERVAL: 500,

  // --- Dibujo ---
  // Paleta aprobada (ver docs/bitacora/2026-10-23-direccion-visual.md).
  COLORS: {
    fiel: '#e8f1f5',   // blanco hielo cálido
    desvio: '#2fb8b0', // turquesa
    deriva: '#1b3a5c', // azul profundo apagado
    conservado: '#c9a46a', // dorado tenue: la única señal del juicio
  },

  // Largo (px) del trazo con el que se dibuja cada agente, orientado según su rumbo.
  AGENT_STROKE_LEN: 14,

  // Grosor (px) del trazo de cada agente.
  AGENT_STROKE_WEIGHT: 1.4,
};
