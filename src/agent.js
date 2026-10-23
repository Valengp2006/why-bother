// agent.js — un agente: nace, interpreta el campo (con más o menos fidelidad) y se clasifica.
// Regla central de la obra:  fidelidad = claridad × susceptibilidad.
import { CONFIG } from './config.js';
import { sampleField } from './field.js';

let nextId = 0;
const fieldSample = { strength: 0, dx: 0, dy: 0 }; // se reutiliza para no crear basura en cada agente

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
  };
}

// Qué tanto sigue este agente la intención ahora mismo.
export function fidelityOf(clarity, susceptibility) {
  return clarity * susceptibility;
}

// Clasificación por regla (no por azar). Fiel: fidelidad alta. Si no: desvío si tiene vecinos
// de rumbo afín (lo calcula flock.js en el hito 4), y deriva si no.
export function classify(agent, hasCoherentNeighbors = false) {
  if (agent.fidelity >= CONFIG.FIDELITY_HIGH) return 'fiel';
  return hasCoherentNeighbors ? 'desvio' : 'deriva';
}

function rotate(x, y, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { x: x * c - y * s, y: x * s + y * c };
}

// Un paso de simulación. Devuelve false si el agente murió (vida agotada o fuera de pantalla).
export function stepAgent(p, agent, field, clarity, dt, nowMs) {
  agent.age += dt;
  if (agent.age >= CONFIG.AGENT_LIFETIME) return false;

  agent.fidelity = fidelityOf(clarity, agent.susceptibility);
  if (nowMs >= agent.nextClassify) {
    agent.behavior = classify(agent);
    agent.nextClassify = nowMs + CONFIG.CLASSIFY_INTERVAL;
  }

  // Ruido (wander): una dirección que cambia suavemente en el tiempo, con la fuerza de (1 − fidelidad).
  const wanderAngle = (p.noise(agent.wanderSeed, (nowMs / 1000) * CONFIG.WANDER_RATE) - 0.5) * 4 * Math.PI;
  const wanderMag = (1 - agent.fidelity) * CONFIG.WANDER_STRENGTH;
  let ax = Math.cos(wanderAngle) * wanderMag;
  let ay = Math.sin(wanderAngle) * wanderMag;

  // Si hay campo aquí: dirección deseada = la del campo, rotada por el desvío × (1 − fidelidad).
  // Fuera del campo solo queda el wander.
  sampleField(field, agent.x, agent.y, fieldSample);
  if (fieldSample.strength >= CONFIG.FIELD_MIN_STRENGTH) {
    const d = rotate(fieldSample.dx, fieldSample.dy, agent.deviation * (1 - agent.fidelity));
    let sx = d.x * CONFIG.MAX_SPEED - agent.vx; // steering = velocidad deseada − velocidad actual
    let sy = d.y * CONFIG.MAX_SPEED - agent.vy;
    const sl = Math.hypot(sx, sy);
    if (sl > CONFIG.MAX_FORCE) { sx *= CONFIG.MAX_FORCE / sl; sy *= CONFIG.MAX_FORCE / sl; }
    ax += sx;
    ay += sy;
  }

  agent.vx += ax * dt;
  agent.vy += ay * dt;
  const speed = Math.hypot(agent.vx, agent.vy);
  if (speed > CONFIG.MAX_SPEED) { agent.vx *= CONFIG.MAX_SPEED / speed; agent.vy *= CONFIG.MAX_SPEED / speed; }
  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;

  const m = 50; // un margen fuera de pantalla antes de reciclarlo
  return agent.x > -m && agent.y > -m && agent.x < p.width + m && agent.y < p.height + m;
}
