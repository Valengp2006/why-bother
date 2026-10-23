// log.js — registro de sesión: qué se conservó y qué se soltó, de qué origen y cuánto.
// Es la evidencia de la hipótesis ("parte de lo que vale la pena conservar aparece en los desvíos").
// Se descarga como JSON (tecla L) para pegarlo en la bitácora y comparar entre personas.
import { CONFIG } from './config.js';

export function createLog() {
  return {
    seed: CONFIG.RANDOM_SEED,
    startedAt: new Date().toISOString(),
    events: [], // un evento por juicio
    counts: {
      conserve: { fiel: 0, desvio: 0, deriva: 0, ninguno: 0 },
      release: { fiel: 0, desvio: 0, deriva: 0, ninguno: 0 },
    },
  };
}

// event = { t (ms), action ('conserve' | 'release'), x, y, dominant, mass, fiel, desvio, deriva }
export function recordJudgment(log, event) {
  log.events.push(event);
  log.counts[event.action][event.dominant]++;
}

// Lo que se descarga: el registro más los parámetros que definen la sesión.
export function exportLog(log, nowMs) {
  const keys = ['WINDOW_MS', 'MIN_SPEED', 'W_DIR', 'W_SPEED', 'LOOKAHEAD', 'WANDER_STRENGTH', 'MAX_DEVIATION_ANGLE',
    'FIDELITY_HIGH', 'FLOCK_RADIUS', 'COHERENCE_NEIGHBORS', 'ALIGN_MIN', 'CONSERVE_RADIUS', 'DECAY', 'DIFFUSION'];
  const params = {};
  for (const k of keys) params[k] = CONFIG[k];
  return { ...log, durationMs: Math.round(nowMs), params };
}

// Descarga el registro como archivo .json (crea un enlace temporal y lo "pulsa").
export function downloadLog(log, nowMs) {
  const blob = new Blob([JSON.stringify(exportLog(log, nowMs), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `why-bother-${log.startedAt.replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
