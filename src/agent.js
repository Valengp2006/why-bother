// agent.js — un agente: nace, interpreta el campo (con más o menos fidelidad) y se clasifica.
// Regla central de la obra:  fidelidad = claridad × susceptibilidad.
import { CONFIG } from './config.js';
import { sampleField } from './field.js';
import { neighborInfo, flockForce } from './flock.js';
import { senseSteer } from './trails.js';
import { ambientDir } from './ambient.js';
import { world } from './world.js';

let nextId = 0;
// Se reutilizan para no crear basura en cada agente y cada cuadro.
const fieldSample = { strength: 0, dx: 0, dy: 0 };
const info = { aligned: 0, desvioN: 0, avgVx: 0, avgVy: 0, cx: 0, cy: 0 };
const flock = { ax: 0, ay: 0 };
const sense = { ax: 0, ay: 0 };
const ambient = { x: 0, y: 0 };

// Nace en (x, y) con velocidad en la dirección del trazo. La susceptibilidad y el ángulo de desvío
// son aleatorios pero salen de p.random(), que usa la semilla fija: misma semilla, misma población.
export function createAgent(p, x, y, dir) {
  return {
    id: nextId++,
    x, y,
    vx: dir.x * CONFIG.SPAWN_SPEED,
    vy: dir.y * CONFIG.SPAWN_SPEED,
    susceptibility: p.random(),                                      // 0 = ignora la intención, 1 = la sigue
    deviation: p.random(-1, 1) * CONFIG.MAX_DEVIATION_ANGLE,         // hacia dónde se aparta si no es fiel
    wanderSeed: p.random(1000),                                      // para que cada agente tenga su propio ruido
    age: 0,
    fidelity: 0,
    behavior: 'deriva',
    nextClassify: 0,
    inherited: false, // true si es pintura dorada (la que vierte la persona o nace de un criterio)
  };
}

// Un agente de pintura dorada: nace de lo que la persona vierte o de un criterio que sigue sin ella.
// Deposita en el canal dorado, actúa con la claridad del criterio (no depende de su mano) y no se reclasifica.
// Se comporta como 'desvio' para que se agrupe y fluya en corrientes coherentes.
export function createInheritedAgent(p, x, y, dir) {
  const a = createAgent(p, x, y, dir);
  a.inherited = true;
  a.behavior = 'desvio';
  return a;
}

// Qué tanto sigue este agente la intención ahora mismo.
export function fidelityOf(clarity, susceptibility) {
  return clarity * susceptibility;
}

// Clasificación por regla (no por azar). Fiel: fidelidad alta. Si no: desvío si tiene vecinos
// de rumbo afín (lo calcula flock.js), y deriva si no.
export function classify(agent, hasCoherentNeighbors = false) {
  if (agent.fidelity >= CONFIG.FIDELITY_HIGH) return 'fiel';
  return hasCoherentNeighbors ? 'desvio' : 'deriva';
}

function rotate(x, y, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: x * c - y * s, y: x * s + y * c };
}

// Un paso de simulación. Devuelve false si el agente murió (vida agotada o fuera de pantalla).
export function stepAgent(p, agent, field, grid, trails, clarity, dt, nowMs) {
  const maxSpeed = CONFIG.MAX_SPEED * world.speedMul; // una decisión puede hacer que todo fluya más lento o más rápido
  agent.age += dt;
  if (agent.age >= CONFIG.AGENT_LIFETIME) return false;

  // Los heredados actúan con la claridad del criterio, no con la del mouse: lo conservado ya no depende de tu mano.
  agent.fidelity = fidelityOf(agent.inherited ? CONFIG.CRITERION_CLARITY : clarity, agent.susceptibility);
  const due = !agent.inherited && nowMs >= agent.nextClassify;
  if (due || agent.behavior === 'desvio') neighborInfo(grid, agent, info); // vecinos: solo cuando hace falta
  if (due) {
    agent.behavior = classify(agent, info.aligned >= CONFIG.COHERENCE_NEIGHBORS);
    agent.nextClassify = nowMs + CONFIG.CLASSIFY_INTERVAL;
  }

  // Ruido (wander): una dirección que cambia suavemente en el tiempo, con la fuerza de (1 − fidelidad).
  const wanderAngle = (p.noise(agent.wanderSeed, (nowMs / 1000) * CONFIG.WANDER_RATE) - 0.5) * 4 * Math.PI;
  const wanderMag = (1 - agent.fidelity) * CONFIG.WANDER_STRENGTH * world.wanderMul;
  let ax = Math.cos(wanderAngle) * wanderMag;
  let ay = Math.sin(wanderAngle) * wanderMag;

  // Ambiente: la corriente que cambia sola empuja a todos, pero cede donde hay trazo (ahí manda la mano).
  sampleField(field, agent.x, agent.y, fieldSample);
  const free = 1 - Math.min(1, fieldSample.strength); // 1 = fuera del trazo, 0 = dentro
  if (free > 0 && CONFIG.AMBIENT_STRENGTH * world.ambientMul > 0) {
    ambientDir(p, agent.x, agent.y, nowMs / 1000, ambient);
    let sx = ambient.x * maxSpeed * 0.7 - agent.vx;
    let sy = ambient.y * maxSpeed * 0.7 - agent.vy;
    const sl = Math.hypot(sx, sy);
    const cap = CONFIG.AMBIENT_STRENGTH * world.ambientMul * free;
    if (sl > cap) { sx *= cap / sl; sy *= cap / sl; }
    ax += sx;
    ay += sy;
  }

  // Si hay campo aquí: dirección deseada = la del campo, rotada por el desvío × (1 − fidelidad).
  if (fieldSample.strength >= CONFIG.FIELD_MIN_STRENGTH) {
    const d = rotate(fieldSample.dx, fieldSample.dy, agent.deviation * world.deviationMul * (1 - agent.fidelity));
    let sx = d.x * maxSpeed - agent.vx; // steering = velocidad deseada − velocidad actual
    let sy = d.y * maxSpeed - agent.vy;
    const sl = Math.hypot(sx, sy);
    if (sl > CONFIG.MAX_FORCE) { sx *= CONFIG.MAX_FORCE / sl; sy *= CONFIG.MAX_FORCE / sl; }
    ax += sx;
    ay += sy;
  }

  // Los desvíos, además, se alinean y se agrupan con sus vecinos desvío: así forman caminos coherentes.
  if (agent.behavior === 'desvio') {
    flockForce(agent, info, flock);
    ax += flock.ax;
    ay += flock.ay;
  }

  // Atracción hacia lo conservado: los sensores buscan traza conservada y empujan hacia ella.
  senseSteer(trails, agent, sense);
  ax += sense.ax;
  ay += sense.ay;

  agent.vx += ax * dt;
  agent.vy += ay * dt;
  const speed = Math.hypot(agent.vx, agent.vy);
  if (speed > maxSpeed) { agent.vx *= maxSpeed / speed; agent.vy *= maxSpeed / speed; }
  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;

  const m = 50; // un margen fuera de pantalla antes de reciclarlo
  return agent.x > -m && agent.y > -m && agent.x < p.width + m && agent.y < p.height + m;
}
