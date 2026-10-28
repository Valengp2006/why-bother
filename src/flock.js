// flock.js — vecindad entre agentes y flocking de los desvíos (alineación y cohesión).
import { CONFIG } from './config.js';
import { world } from './world.js';

// Una malla espacial: guarda los agentes por celda para mirar solo a los vecinos cercanos
// en vez de comparar cada agente con todos los demás.
export function createGrid() {
  return { cells: new Map(), cols: 0 };
}

export function buildGrid(grid, agents, width) {
  const size = CONFIG.FLOCK_RADIUS;
  grid.cols = Math.ceil(width / size) + 2;
  grid.cells.clear();
  for (const a of agents) {
    const key = cellKey(grid, a.x, a.y);
    const list = grid.cells.get(key);
    if (list) list.push(a);
    else grid.cells.set(key, [a]);
  }
}

// +1 en columnas y filas para que los agentes apenas fuera de pantalla no den claves negativas.
function cellKey(grid, x, y) {
  const size = CONFIG.FLOCK_RADIUS;
  return (Math.floor(y / size) + 1) * grid.cols + (Math.floor(x / size) + 1);
}

// Mira a los vecinos de `agent` dentro de FLOCK_RADIUS y rellena `out`:
//   aligned   — cuántos tienen rumbo afín (coseno ≥ ALIGN_MIN). Con esto se decide si es desvío.
//   desvioN   — cuántos de esos vecinos afines son desvío; con ellos se calculan las fuerzas.
//   avgVx/Vy  — velocidad promedio de esos vecinos desvío (para alinearse).
//   cx/cy     — su centro (para la cohesión).
export function neighborInfo(grid, agent, out) {
  out.aligned = 0; out.desvioN = 0; out.avgVx = 0; out.avgVy = 0; out.cx = 0; out.cy = 0;
  const r2 = CONFIG.FLOCK_RADIUS * CONFIG.FLOCK_RADIUS;
  const mySpeed = Math.hypot(agent.vx, agent.vy);
  if (mySpeed === 0) return out;
  const size = CONFIG.FLOCK_RADIUS;
  const c0 = Math.floor(agent.x / size), r0 = Math.floor(agent.y / size);

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const list = grid.cells.get((r0 + dr + 1) * grid.cols + (c0 + dc + 1));
      if (!list) continue;
      for (const o of list) {
        if (o === agent) continue;
        const dx = o.x - agent.x, dy = o.y - agent.y;
        if (dx * dx + dy * dy > r2) continue;
        const oSpeed = Math.hypot(o.vx, o.vy);
        if (oSpeed === 0) continue;
        const cos = (agent.vx * o.vx + agent.vy * o.vy) / (mySpeed * oSpeed);
        if (cos < CONFIG.ALIGN_MIN) continue;
        out.aligned++;
        if (o.behavior === 'desvio') {
          out.desvioN++;
          out.avgVx += o.vx; out.avgVy += o.vy;
          out.cx += o.x; out.cy += o.y;
        }
      }
    }
  }
  if (out.desvioN > 0) {
    out.avgVx /= out.desvioN; out.avgVy /= out.desvioN;
    out.cx /= out.desvioN; out.cy /= out.desvioN;
  }
  return out;
}

// Aceleración de flocking para un desvío: alinearse con el rumbo de los vecinos y acercarse a su centro.
// Cada una es un steering (velocidad deseada − velocidad actual), como en el movimiento normal.
export function flockForce(agent, info, out) {
  out.ax = 0; out.ay = 0;
  if (info.desvioN === 0) return out;

  const maxSpeed = CONFIG.MAX_SPEED * world.speedMul;
  const vl = Math.hypot(info.avgVx, info.avgVy) || 1;
  const alignX = (info.avgVx / vl) * maxSpeed - agent.vx;
  const alignY = (info.avgVy / vl) * maxSpeed - agent.vy;

  const toX = info.cx - agent.x, toY = info.cy - agent.y;
  const tl = Math.hypot(toX, toY) || 1;
  const cohX = (toX / tl) * maxSpeed - agent.vx;
  const cohY = (toY / tl) * maxSpeed - agent.vy;

  let ax = alignX * CONFIG.ALIGN_WEIGHT + cohX * CONFIG.COHESION_WEIGHT;
  let ay = alignY * CONFIG.ALIGN_WEIGHT + cohY * CONFIG.COHESION_WEIGHT;
  const l = Math.hypot(ax, ay);
  if (l > CONFIG.MAX_FORCE) { ax *= CONFIG.MAX_FORCE / l; ay *= CONFIG.MAX_FORCE / l; }
  out.ax = ax; out.ay = ay;
  return out;
}
