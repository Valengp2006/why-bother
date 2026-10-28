// intention.js — la trayectoria del mouse y su claridad (0 a 1).
// Idea: una intención clara es moverse en una dirección constante y a un ritmo constante.
import { CONFIG } from './config.js';

// Guarda la posición del mouse con su tiempo y descarta lo que ya salió de la ventana.
export function recordSample(samples, x, y, t) {
  samples.push({ x, y, t });
  while (samples.length > 0 && t - samples[0].t > CONFIG.WINDOW_MS) samples.shift();
}

// Convierte las muestras en vectores de velocidad (px/segundo) entre muestras consecutivas.
function velocities(samples) {
  const out = [];
  for (let i = 1; i < samples.length; i++) {
    const dt = (samples[i].t - samples[i - 1].t) / 1000;
    if (dt <= 0) continue;
    out.push({
      vx: (samples[i].x - samples[i - 1].x) / dt,
      vy: (samples[i].y - samples[i - 1].y) / dt,
    });
  }
  return out;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Dirección (vector de largo 1) en la que se mueve el mouse justo ahora, mirando las últimas muestras.
// Se usa para dejar el trazo en el campo; es más inmediata que la dirección promedio de la ventana.
const RECENT_SAMPLES = 6;
export function recentDirection(samples) {
  if (samples.length < 2) return { x: 0, y: 0 };
  const a = samples[Math.max(0, samples.length - 1 - RECENT_SAMPLES)];
  const b = samples[samples.length - 1];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  return len > 0 ? { x: (b.x - a.x) / len, y: (b.y - a.y) / len } : { x: 0, y: 0 };
}

// Devuelve { clarity, active, dirConstancy, speedConstancy, meanSpeed, dir, recentDir }.
// dir = dirección promedio de la ventana (hacia dónde se extiende el alcance);
// recentDir = dirección de ahora mismo (lo que se deja en el campo cerca del mouse).
export function computeClarity(samples) {
  const idle = {
    clarity: 0, active: false, dirConstancy: 0, speedConstancy: 0, meanSpeed: 0,
    dir: { x: 0, y: 0 }, recentDir: { x: 0, y: 0 },
  };
  const vs = velocities(samples);
  if (vs.length < 3) return idle; // muy pocos datos para juzgar

  const speeds = vs.map((v) => Math.hypot(v.vx, v.vy));
  const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  if (meanSpeed < CONFIG.MIN_SPEED) return { ...idle, meanSpeed }; // casi quieto: sin intención

  // Constancia de dirección: promedio de las direcciones (vectores de largo 1).
  // Si todas apuntan igual el promedio mide 1; si apuntan en todas direcciones, ~0.
  let sx = 0, sy = 0, n = 0;
  vs.forEach((v, i) => {
    if (speeds[i] === 0) return; // sin movimiento no hay dirección
    sx += v.vx / speeds[i];
    sy += v.vy / speeds[i];
    n++;
  });
  const dirConstancy = n > 0 ? clamp01(Math.hypot(sx, sy) / n) : 0;

  // Constancia de velocidad: 1 − coeficiente de variación (desviación / media) de la rapidez.
  const variance = speeds.reduce((a, s) => a + (s - meanSpeed) ** 2, 0) / speeds.length;
  const speedConstancy = clamp01(1 - Math.sqrt(variance) / meanSpeed);

  const clarity = CONFIG.W_DIR * dirConstancy + CONFIG.W_SPEED * speedConstancy;
  const sl = Math.hypot(sx, sy);
  const dir = sl > 0 ? { x: sx / sl, y: sy / sl } : { x: 0, y: 0 };
  return { clarity, active: true, dirConstancy, speedConstancy, meanSpeed, dir, recentDir: recentDirection(samples) };
}
