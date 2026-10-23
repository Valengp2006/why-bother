// config.js — TODOS los parámetros de la obra viven aquí.
// Regla: cada uno lleva un comentario de qué hace y qué pasa si se sube.
// Antes de cambiar uno, anota tu hipótesis en la bitácora; después, lo que observaste.
// (Se irá llenando a medida que cada hito lo necesite; la lista completa está en AGENT.md §4.)

export const CONFIG = {
  // --- General ---
  // Semilla de la aleatoriedad. Misma semilla + mismo recorrido del mouse = mismo resultado.
  // Cambiarla da otra "población" de susceptibilidades y ángulos de desvío.
  RANDOM_SEED: 8,

  // Color de fondo (oscuridad de inicio). Valor 0-255.
  BACKGROUND: 0,

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
};
