// trails.js — la malla de trazas tipo Physarum: tres canales (fiel, desvío, deriva), difusión,
// decaimiento, máscaras de conservado y soltado, y los sensores con los que los agentes sienten lo conservado.
import { CONFIG } from './config.js';

// Índice de cada canal en trails.ch
export const CHANNEL = { fiel: 0, desvio: 1, deriva: 2 };

// Malla de baja resolución: una celda cubre 1 / GRID_SCALE px de pantalla.
export function createTrails(width, height) {
  const w = Math.max(3, Math.round(width * CONFIG.GRID_SCALE));
  const h = Math.max(3, Math.round(height * CONFIG.GRID_SCALE));
  const n = w * h;
  return {
    w, h,
    sx: w / width, sy: h / height,                         // de px de pantalla a celdas
    ch: [new Float32Array(n), new Float32Array(n), new Float32Array(n)],
    tmp: new Float32Array(n),                              // buffer de trabajo para la difusión
    dirx: new Float32Array(n),                             // rumbo de la pintura: suma de las direcciones de los agentes que depositaron
    diry: new Float32Array(n),
    cons: new Float32Array(n),                             // máscara de conservadas (0 a 1)
    rel: new Float32Array(n),                              // máscara de soltadas (0 a 1)
    decayK: new Float32Array(n),                           // cuánto queda de cada celda tras este cuadro
  };
}

// Cada agente deja traza en la celda donde está, en el canal de su comportamiento actual.
// Se desvanece con su edad, así los agentes que van muriendo dejan cada vez menos.
export function deposit(trails, agent, dt) {
  const x = Math.floor(agent.x * trails.sx);
  const y = Math.floor(agent.y * trails.sy);
  if (x < 0 || y < 0 || x >= trails.w || y >= trails.h) return;
  const i = y * trails.w + x;
  const life = 1 - agent.age / CONFIG.AGENT_LIFETIME;
  const c = trails.ch[CHANNEL[agent.behavior]];
  const amount = CONFIG.DEPOSIT * life * dt;
  c[i] = Math.min(CONFIG.TRAIL_MAX, c[i] + amount);
  // También se anota hacia dónde iba el agente: al conservar, ese rumbo es lo que se hereda.
  const speed = Math.hypot(agent.vx, agent.vy);
  if (speed > 0) {
    trails.dirx[i] += (agent.vx / speed) * amount;
    trails.diry[i] += (agent.vy / speed) * amount;
  }
}

// Un cuadro de la malla: primero se calcula cuánto decae cada celda (según las máscaras),
// luego cada canal se difunde (se mezcla con sus 8 vecinas) y decae.
export function updateTrails(trails, dt) {
  const { w, h, decayK, cons, rel } = trails;

  // Decaimiento por celda: normal, casi nulo si está conservada, muy rápido si está soltada.
  const base = Math.pow(CONFIG.DECAY, dt);
  const keep = Math.pow(CONFIG.CONSERVE_DECAY, dt);
  const drop = Math.pow(CONFIG.RELEASE_DECAY, dt);
  for (let i = 0; i < decayK.length; i++) {
    let k = base + (keep - base) * cons[i];
    k = k * (1 - rel[i]) + drop * rel[i];
    decayK[i] = k;
    trails.dirx[i] *= k; // el rumbo se desvanece igual que la pintura
    trails.diry[i] *= k;
  }

  // La difusión se ajusta al tiempo del cuadro, para que se vea igual a 30 o a 120 fps.
  const D = 1 - Math.pow(1 - CONFIG.DIFFUSION, dt * 60);
  const tmp = trails.tmp;
  for (const c of trails.ch) {
    for (let y = 0; y < h; y++) {
      const edgeY = y === 0 || y === h - 1;
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (edgeY || x === 0 || x === w - 1) { tmp[i] = c[i] * decayK[i]; continue; } // bordes: solo decaen
        const avg = (c[i - w - 1] + c[i - w] + c[i - w + 1] + c[i - 1] + c[i + 1] + c[i + w - 1] + c[i + w] + c[i + w + 1]) / 8;
        tmp[i] = (c[i] * (1 - D) + avg * D) * decayK[i];
      }
    }
    c.set(tmp);
  }
}

// Mide la traza dentro de CONSERVE_RADIUS alrededor de (x, y): cuánta hay de cada canal y cuál domina.
// Es lo que se registra de cada juicio: de qué origen era lo que la persona conservó o soltó.
export function measure(trails, x, y) {
  const rx = CONFIG.CONSERVE_RADIUS * trails.sx;
  const ry = CONFIG.CONSERVE_RADIUS * trails.sy;
  const cx = x * trails.sx, cy = y * trails.sy;
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(trails.w - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(trails.h - 1, Math.ceil(cy + ry));
  const m = { fiel: 0, desvio: 0, deriva: 0, mass: 0, dominant: 'ninguno', dirx: 0, diry: 0, dirAbs: 0 };
  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      if (Math.hypot((gx + 0.5 - cx) / rx, (gy + 0.5 - cy) / ry) >= 1) continue;
      const i = gy * trails.w + gx;
      m.fiel += trails.ch[0][i]; m.desvio += trails.ch[1][i]; m.deriva += trails.ch[2][i];
      m.dirx += trails.dirx[i]; m.diry += trails.diry[i];
      m.dirAbs += Math.hypot(trails.dirx[i], trails.diry[i]); // para medir qué tan alineada era la pintura
    }
  }
  m.mass = m.fiel + m.desvio + m.deriva;
  if (m.mass >= CONFIG.JUDGMENT_MIN_MASS) {
    m.dominant = m.fiel >= m.desvio && m.fiel >= m.deriva ? 'fiel' : m.desvio >= m.deriva ? 'desvio' : 'deriva';
  }
  return m;
}

// Marca como conservada la traza alrededor de (x, y) (en px de pantalla). Borde suave.
export function conserve(trails, x, y) {
  paintMask(trails, x, y, trails.cons, trails.rel);
}

// Marca como soltada la traza alrededor de (x, y). Una zona no puede estar conservada y soltada a la vez.
export function release(trails, x, y) {
  paintMask(trails, x, y, trails.rel, trails.cons);
}

function paintMask(trails, x, y, target, other) {
  const rx = CONFIG.CONSERVE_RADIUS * trails.sx;
  const ry = CONFIG.CONSERVE_RADIUS * trails.sy;
  const cx = x * trails.sx, cy = y * trails.sy;
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(trails.w - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(trails.h - 1, Math.ceil(cy + ry));
  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      const d = Math.hypot((gx + 0.5 - cx) / rx, (gy + 0.5 - cy) / ry);
      if (d >= 1) continue;
      const t = Math.min(1, (1 - d) * 1.5); // centro pleno, borde que cae suavemente
      const m = t * t * (3 - 2 * t);
      const i = gy * trails.w + gx;
      target[i] = Math.max(target[i], m);
      other[i] = Math.min(other[i], 1 - m);
    }
  }
}

// Cuánta traza conservada hay en (x, y): la suma de los tres canales, pero solo si la celda está
// marcada como conservada. (No se multiplica por la máscara: su borde suave haría que casi no se note desde fuera.)
const SENSE_MASK_MIN = 0.02;
function conservedAt(trails, x, y) {
  const gx = Math.floor(x * trails.sx), gy = Math.floor(y * trails.sy);
  if (gx < 0 || gy < 0 || gx >= trails.w || gy >= trails.h) return 0;
  const i = gy * trails.w + gx;
  if (trails.cons[i] < SENSE_MASK_MIN) return 0;
  return trails.ch[0][i] + trails.ch[1][i] + trails.ch[2][i];
}

// Sensores tipo Physarum: se mira la traza conservada a la izquierda, al frente y a la derecha del agente,
// y se escribe en out una aceleración. Regla clásica: si el frente tiene tanto o más que los lados, sigue recto;
// si no, gira hacia el lado que más tiene. Si ninguno la nota, no hay atracción.
export function senseSteer(trails, agent, out) {
  out.ax = 0; out.ay = 0;
  if (CONFIG.SENSE_WEIGHT <= 0) return out;
  const heading = Math.atan2(agent.vy, agent.vx);
  const d = CONFIG.SENSE_DISTANCE;
  const at = (a) => conservedAt(trails, agent.x + Math.cos(a) * d, agent.y + Math.sin(a) * d);
  const left = at(heading - CONFIG.SENSE_ANGLE);
  const front = at(heading);
  const right = at(heading + CONFIG.SENSE_ANGLE);
  if (Math.max(left, front, right) < CONFIG.SENSE_MIN) return out;

  let a = heading; // por defecto, recto
  if (front < left || front < right) a = left > right ? heading - CONFIG.SENSE_ANGLE : heading + CONFIG.SENSE_ANGLE;
  out.ax = Math.cos(a) * CONFIG.SENSE_WEIGHT;
  out.ay = Math.sin(a) * CONFIG.SENSE_WEIGHT;
  return out;
}
