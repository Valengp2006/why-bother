// trails.js — la malla de pintura tipo Physarum: cuatro canales, difusión, decaimiento y los sensores
// con los que los agentes sienten la pintura dorada (la que vierte la persona).
//   canales 0 a 2: lo que pone el sistema (fiel, desvío, deriva)
//   canal 3      : la pintura dorada, la que la persona vierte con el clic sostenido y lo que nace de ella
import { CONFIG } from './config.js';
import { world } from './world.js';

export const CHANNEL = { fiel: 0, desvio: 1, deriva: 2, conservado: 3 };

// Un núcleo gaussiano para repartir lo que deposita cada agente en varias celdas (más ancho = pinceladas más anchas).
function makeKernel(radius) {
  const offsets = [];
  let total = 0;
  const sigma = Math.max(0.5, radius / 1.6);
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const wgt = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      offsets.push({ dx, dy, wgt });
      total += wgt;
    }
  }
  for (const o of offsets) o.wgt /= total; // la suma es 1: el ancho cambia, la cantidad total no
  return offsets;
}

// Malla de baja resolución: una celda cubre 1 / GRID_SCALE px de pantalla.
export function createTrails(width, height) {
  const w = Math.max(3, Math.round(width * CONFIG.GRID_SCALE));
  const h = Math.max(3, Math.round(height * CONFIG.GRID_SCALE));
  const n = w * h;
  return {
    w, h,
    sx: w / width, sy: h / height,                         // de px de pantalla a celdas
    ch: [new Float32Array(n), new Float32Array(n), new Float32Array(n), new Float32Array(n)],
    tmp: new Float32Array(n),                              // buffer de trabajo para la difusión
    kernel: makeKernel(CONFIG.DEPOSIT_RADIUS),
  };
}

// Cada agente deja pintura alrededor de la celda donde está, en el canal de su comportamiento actual
// (o en el dorado si nació de lo que la persona vertió). Se desvanece con su edad, así los que van muriendo dejan menos.
export function deposit(trails, agent, dt) {
  const cx = Math.floor(agent.x * trails.sx);
  const cy = Math.floor(agent.y * trails.sy);
  if (cx < 0 || cy < 0 || cx >= trails.w || cy >= trails.h) return;
  const life = 1 - agent.age / CONFIG.AGENT_LIFETIME;
  const c = trails.ch[agent.inherited ? CHANNEL.conservado : CHANNEL[agent.behavior]];
  const amount = CONFIG.DEPOSIT * life * dt;
  for (const o of trails.kernel) {
    const x = cx + o.dx, y = cy + o.dy;
    if (x < 0 || y < 0 || x >= trails.w || y >= trails.h) continue;
    const i = y * trails.w + x;
    c[i] = Math.min(CONFIG.TRAIL_MAX, c[i] + amount * o.wgt);
  }
}

// Un cuadro de la malla: cada canal se difunde (se mezcla con sus 8 vecinas) y decae.
// La pintura dorada decae más despacio: lo que la persona vierte dura más que lo que hace el sistema.
export function updateTrails(trails, dt) {
  const { w, h } = trails;
  const kNormal = Math.pow(CONFIG.DECAY, dt * world.decayMul);
  const kGold = Math.pow(CONFIG.GOLD_DECAY, dt);

  // La difusión se ajusta al tiempo del cuadro, para que se vea igual a 30 o a 120 fps.
  const D = 1 - Math.pow(1 - CONFIG.DIFFUSION, dt * 60);
  const tmp = trails.tmp;
  trails.ch.forEach((c, ci) => {
    const k = ci === CHANNEL.conservado ? kGold : kNormal;
    for (let y = 0; y < h; y++) {
      const edgeY = y === 0 || y === h - 1;
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (edgeY || x === 0 || x === w - 1) { tmp[i] = c[i] * k; continue; } // bordes: solo decaen
        const avg = (c[i - w - 1] + c[i - w] + c[i - w + 1] + c[i - 1] + c[i + 1] + c[i + w - 1] + c[i + w] + c[i + w + 1]) / 8;
        tmp[i] = (c[i] * (1 - D) + avg * D) * k;
      }
    }
    c.set(tmp);
  });
}

// Cuánta pintura dorada hay en (x, y).
function goldAt(trails, x, y) {
  const gx = Math.floor(x * trails.sx), gy = Math.floor(y * trails.sy);
  if (gx < 0 || gy < 0 || gx >= trails.w || gy >= trails.h) return 0;
  return trails.ch[CHANNEL.conservado][gy * trails.w + gx];
}

// Sensores tipo Physarum: se mira la pintura dorada a la izquierda, al frente y a la derecha del agente,
// y se escribe en out una aceleración. Regla clásica: si el frente tiene tanto o más que los lados, sigue recto;
// si no, gira hacia el lado que más tiene. Si ninguno la nota, no hay atracción: lo tuyo atrae lo que fluye cerca.
export function senseSteer(trails, agent, out) {
  out.ax = 0; out.ay = 0;
  const weight = CONFIG.SENSE_WEIGHT * world.senseMul;
  if (weight <= 0) return out;
  const heading = Math.atan2(agent.vy, agent.vx);
  const d = CONFIG.SENSE_DISTANCE;
  const at = (a) => goldAt(trails, agent.x + Math.cos(a) * d, agent.y + Math.sin(a) * d);
  const left = at(heading - CONFIG.SENSE_ANGLE);
  const front = at(heading);
  const right = at(heading + CONFIG.SENSE_ANGLE);
  if (Math.max(left, front, right) < CONFIG.SENSE_MIN) return out;

  let a = heading; // por defecto, recto
  if (front < left || front < right) a = left > right ? heading - CONFIG.SENSE_ANGLE : heading + CONFIG.SENSE_ANGLE;
  out.ax = Math.cos(a) * weight;
  out.ay = Math.sin(a) * weight;
  return out;
}
