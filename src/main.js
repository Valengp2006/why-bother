// main.js — arranque y ciclo de p5.
import p5 from 'p5';
import { CONFIG } from './config.js';
import { recordSample, computeClarity } from './intention.js';
import { createField, updateField } from './field.js';
import { createAgent, stepAgent } from './agent.js';
import { createGrid, buildGrid } from './flock.js';
import { createTrails, deposit, updateTrails } from './trails.js';
import { createNarrative, updateNarrative, drawNarrative } from './narrative.js';
import { drawAgents, drawTrails, drawIntention, drawHint, drawDebug } from './render.js';

// Solo en desarrollo (npm run dev): permite probar valores desde la consola del navegador,
// por ejemplo  __CONFIG.TRAIL_GAIN = 2  , sin recargar. No existe en la versión publicada.
if (import.meta.env.DEV) window.__CONFIG = CONFIG;

new p5((p) => {
  const samples = []; // trayectoria reciente del mouse
  const agents = [];
  const grid = createGrid(); // malla espacial para buscar vecinos
  let field;
  let trails;
  let spawnCarry = 0; // fracción de agente que "sobra" de un cuadro al siguiente
  const narrative = createNarrative();
  let hintAlpha = 0;      // opacidad de la instrucción inicial
  let started = false;    // se vuelve true cuando la persona empieza a moverse con intención
  let showDebug = CONFIG.DEBUG_AT_START;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    // Determinismo: las semillas se fijan una sola vez, aquí. Toda la aleatoriedad sale de p.random y p.noise.
    p.randomSeed(CONFIG.RANDOM_SEED);
    p.noiseSeed(CONFIG.RANDOM_SEED);
    field = createField(p.width, p.height);
    trails = createTrails(p.width, p.height);
  };

  // Hace nacer agentes cerca del mouse, en proporción a su rapidez, mientras la intención está activa.
  function spawn(intention, dt) {
    if (!intention.active) return;
    spawnCarry += CONFIG.SPAWN_RATE * intention.meanSpeed * dt;
    while (spawnCarry >= 1) {
      spawnCarry -= 1;
      if (agents.length >= CONFIG.PARTICLE_COUNT) continue;
      const angle = p.random(p.TWO_PI);
      const dist = p.random(CONFIG.SPAWN_RADIUS);
      agents.push(createAgent(p, p.mouseX + Math.cos(angle) * dist, p.mouseY + Math.sin(angle) * dist, intention.dir));
    }
  }

  p.draw = () => {
    const dt = Math.min(p.deltaTime / 1000, 0.05); // segundos; se acota para que una pausa no dispare la simulación
    const now = p.millis();
    p.background(CONFIG.BACKGROUND);

    // Se muestrea cada cuadro (aunque el mouse esté quieto: quedarse quieto también cuenta).
    recordSample(samples, p.mouseX, p.mouseY, now);
    const intention = computeClarity(samples);

    updateField(field, p.mouseX, p.mouseY, intention, dt);
    spawn(intention, dt);

    buildGrid(grid, agents, p.width);

    // Se avanza cada agente; los que mueren se reemplazan por el último de la lista (más barato que splice).
    for (let i = agents.length - 1; i >= 0; i--) {
      if (!stepAgent(p, agents[i], field, grid, trails, intention.clarity, dt, now)) {
        agents[i] = agents[agents.length - 1];
        agents.pop();
      } else {
        deposit(trails, agents[i], dt);
      }
    }

    updateTrails(trails, dt);

    // La instrucción aparece despacio en la oscuridad y se desvanece cuando la persona empieza.
    if (!started && intention.active) started = true;
    hintAlpha += ((started ? 0 : 1) - hintAlpha) * Math.min(1, dt * (started ? 2.5 : 1.2));

    // Cuántos agentes hay de cada comportamiento: la capa narrativa lo usa para saber qué ya está en pantalla.
    const counts = { fiel: 0, desvio: 0, deriva: 0 };
    for (const a of agents) counts[a.behavior]++;
    updateNarrative(narrative, { intentionActive: intention.active, counts }, now);

    drawTrails(p, trails);
    if (CONFIG.SHOW_INTENTION) drawIntention(p, samples, intention);
    if (showDebug || CONFIG.SHOW_AGENTS) drawAgents(p, agents);
    drawHint(p, hintAlpha);
    drawNarrative(p, narrative, now);
    if (showDebug) drawDebug(p, { samples, intention, agents, field });
  };

  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') showDebug = !showDebug;
  };

  // Si cambia el tamaño de la ventana, el canvas y el campo la siguen.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    field = createField(p.width, p.height);
    trails = createTrails(p.width, p.height); // al redimensionar, las trazas se reinician
  };
});
