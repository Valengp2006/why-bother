// main.js — arranque y ciclo de p5.
import p5 from 'p5';
import { CONFIG } from './config.js';
import { recordSample, computeClarity } from './intention.js';
import { createField, updateField } from './field.js';
import { createAgent, stepAgent } from './agent.js';
import { createGrid, buildGrid } from './flock.js';
import { drawAgents, drawDebug } from './render.js';

new p5((p) => {
  const samples = []; // trayectoria reciente del mouse
  const agents = [];
  const grid = createGrid(); // malla espacial para buscar vecinos
  let field;
  let spawnCarry = 0; // fracción de agente que "sobra" de un cuadro al siguiente
  let showDebug = CONFIG.DEBUG_AT_START;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    // Determinismo: las semillas se fijan una sola vez, aquí. Toda la aleatoriedad sale de p.random y p.noise.
    p.randomSeed(CONFIG.RANDOM_SEED);
    p.noiseSeed(CONFIG.RANDOM_SEED);
    field = createField(p.width, p.height);
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
      if (!stepAgent(p, agents[i], field, grid, intention.clarity, dt, now)) {
        agents[i] = agents[agents.length - 1];
        agents.pop();
      }
    }

    drawAgents(p, agents);
    if (showDebug) drawDebug(p, { samples, intention, agents, field });
  };

  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') showDebug = !showDebug;
  };

  // Si cambia el tamaño de la ventana, el canvas y el campo la siguen.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    field = createField(p.width, p.height);
  };
});
