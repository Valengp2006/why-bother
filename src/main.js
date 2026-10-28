// main.js — arranque y ciclo de p5.
import p5 from 'p5';
import { CONFIG } from './config.js';
import { recordSample, computeClarity } from './intention.js';
import { createField, updateField } from './field.js';
import { createAgent, createInheritedAgent, stepAgent } from './agent.js';
import { createCriteria } from './criteria.js';
import { createGrid, buildGrid } from './flock.js';
import { createTrails, deposit, updateTrails } from './trails.js';
import { judge } from './judgment.js';
import { world, updateWorld, applyEffect } from './world.js';
import { wellPosition, ambientDir } from './ambient.js';
import { startAudio } from './audio.js';
import { createLog, downloadLog, recordChoice, recordFinal } from './log.js';
import { createNarrative, updateNarrative, drawNarrative, narrativeClick } from './narrative.js';
import { drawAgents, drawTrails, drawIntention, drawHint, drawDebug, drawFieldDebug, thumbnail } from './render.js';

// Solo en desarrollo (npm run dev): permite probar valores desde la consola del navegador,
// por ejemplo  __CONFIG.TRAIL_GAIN = 2  , sin recargar. No existe en la versión publicada.
if (import.meta.env.DEV) window.__CONFIG = CONFIG;

new p5((p) => {
  const samples = []; // trayectoria reciente del mouse
  const agents = [];
  const criteria = createCriteria(); // lo conservado que sigue emitiendo
  const grid = createGrid(); // malla espacial para buscar vecinos
  let field;
  let trails;
  const wellCarry = new Array(CONFIG.AMBIENT_WELLS).fill(0); // fracción de agente que sobra, por fuente
  const tmp = { x: 0, y: 0 }, tmpDir = { x: 0, y: 0 };
  let spawnCarry = 0; // fracción de agente que "sobra" de un cuadro al siguiente
  const narrative = createNarrative();
  const log = createLog();
  let hintAlpha = 0;      // opacidad de la instrucción inicial
  let hint2Alpha = 0;     // segunda invitación: 'Mueve el mouse', si pasa un rato sin que la persona se mueva
  let startedAt = 0;      // instante (ms) del primer clic
  let sawIntention = false; // true cuando la persona ya se movió con intención al menos una vez
  let wantSave = false;   // pedir guardar la obra: se hace en el siguiente cuadro, con la pintura sola (sin textos)
  let started = false;    // true desde el primer clic: ahí empieza la pintura (y el audio, que el navegador exige iniciar con un gesto)
  let showDebug = CONFIG.DEBUG_AT_START;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    // Determinismo: las semillas se fijan una sola vez, aquí. Toda la aleatoriedad sale de p.random y p.noise.
    p.randomSeed(CONFIG.RANDOM_SEED);
    p.noiseSeed(CONFIG.RANDOM_SEED);
    field = createField(p.width, p.height);
    trails = createTrails(p.width, p.height);
    // El clic derecho es un gesto de la obra (soltar): se evita el menú del navegador.
    document.addEventListener('contextmenu', (e) => e.preventDefault());
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

  // Las fuentes del ambiente emiten agentes solas, sin mano: son los ríos que vagan por la pantalla.
  function spawnAmbient(dt, tSec) {
    if (CONFIG.AMBIENT_SPAWN_RATE <= 0) return;
    for (let i = 0; i < CONFIG.AMBIENT_WELLS; i++) {
      wellCarry[i] += CONFIG.AMBIENT_SPAWN_RATE * world.ambientSpawnMul * dt;
      if (wellCarry[i] < 1) continue;
      wellPosition(p, i, tSec, p.width, p.height, tmp);
      ambientDir(p, tmp.x, tmp.y, tSec, tmpDir);
      while (wellCarry[i] >= 1) {
        wellCarry[i] -= 1;
        if (agents.length >= CONFIG.PARTICLE_COUNT) continue;
        const angle = p.random(p.TWO_PI);
        const dist = p.random(CONFIG.SPAWN_RADIUS);
        agents.push(createAgent(p, tmp.x + Math.cos(angle) * dist, tmp.y + Math.sin(angle) * dist, tmpDir));
      }
    }
  }

  // Cada criterio (zona conservada con flujo claro) emite agentes con su dirección y su origen,
  // aunque el mouse esté lejos o quieto: lo conservado sigue su camino sin la mano.
  function spawnFromCriteria(dt) {
    for (const c of criteria) {
      c.carry += CONFIG.CRITERION_SPAWN_RATE * world.criterionRateMul * dt;
      while (c.carry >= 1) {
        c.carry -= 1;
        if (agents.length >= CONFIG.PARTICLE_COUNT) continue;
        const angle = p.random(p.TWO_PI);
        const dist = p.random(CONFIG.SPAWN_RADIUS);
        agents.push(createInheritedAgent(p, c.x + Math.cos(angle) * dist, c.y + Math.sin(angle) * dist, c));
      }
    }
  }

  p.draw = () => {
    const dt = Math.min(p.deltaTime / 1000, 0.05); // segundos; se acota para que una pausa no dispare la simulación
    const now = p.millis();
    p.background(CONFIG.BACKGROUND);

    // Antes del primer clic: oscuridad y silencio, solo la invitación a empezar.
    if (!started) {
      hintAlpha += (1 - hintAlpha) * Math.min(1, dt * 1.2);
      drawHint(p, hintAlpha);
      return;
    }

    // Se muestrea cada cuadro (aunque el mouse esté quieto: quedarse quieto también cuenta).
    recordSample(samples, p.mouseX, p.mouseY, now);
    const intention = computeClarity(samples);
    intention.clarity = Math.min(1, intention.clarity * world.clarityMul); // una decisión puede hacer que la mano cuente más o menos
    if (intention.active) sawIntention = true;

    updateWorld(dt);
    updateField(field, p.mouseX, p.mouseY, intention, criteria, dt);
    spawn(intention, dt);
    spawnAmbient(dt, now / 1000);
    spawnFromCriteria(dt);

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

    // La invitación inicial se desvanece cuando la persona hace clic.
    hintAlpha += (0 - hintAlpha) * Math.min(1, dt * 2.5);

    // Cuántos agentes hay de cada comportamiento: la capa narrativa lo usa para saber qué ya está en pantalla.
    const counts = { fiel: 0, desvio: 0, deriva: 0 };
    for (const a of agents) counts[a.behavior]++;
    updateNarrative(narrative, { intentionActive: intention.active, counts }, now);

    drawTrails(p, trails);
    if (wantSave) { saveArt(now); wantSave = false; } // justo después de pintar: solo la pintura, sin textos ni paneles

    // Si pasa un rato sin que la persona se mueva, una segunda invitación la guía.
    const wantHint2 = !sawIntention && now - startedAt > 5000;
    hint2Alpha += ((wantHint2 ? 1 : 0) - hint2Alpha) * Math.min(1, dt * 1.5);

    if (CONFIG.SHOW_INTENTION) drawIntention(p, samples, intention, criteria);
    if (showDebug || CONFIG.SHOW_AGENTS || world.showMechanism) {
      if (world.showMechanism) drawFieldDebug(p, field); // "ver cómo funciona": el campo y los agentes
      drawAgents(p, agents);
    }
    drawHint(p, hintAlpha);
    drawHint(p, hint2Alpha, CONFIG.HINT2_TEXT);
    drawNarrative(p, narrative, now, { x: p.mouseX, y: p.mouseY });
    if (showDebug) drawDebug(p, { samples, intention, agents, field, log, criteria });
  };

  // Descarga la obra como imagen PNG y deja en el registro cómo quedó (una miniatura para comparar obras entre personas).
  function saveArt(nowMs) {
    p.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lo-que-quise-decir-${log.startedAt.replace(/[:.]/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
    recordFinal(log, nowMs, world, thumbnail(32, 18));
  }

  // Clic: primero ¿eligió una opción de la narración? Si no, es un juicio: conservar (clic) o soltar (clic derecho, Shift+clic).
  // El primer clic de la sesión solo inicia el audio y la obra, y no cuenta como decisión.
  p.mousePressed = (event) => {
    if (!started) {
      started = true;
      startedAt = p.millis();
      startAudio();
      return;
    }
    const now = p.millis();
    const choice = narrativeClick(narrative, p.mouseX, p.mouseY, now);
    if (choice) {
      if (choice.step.type === 'final') {
        if (choice.optionIndex === 0) wantSave = true; // 'Guardarla'
      } else if (choice.option.effect) {
        applyEffect(choice.option.effect);            // la decisión cambia el mundo
      }
      recordChoice(log, now, choice);
      return;
    }
    judge(trails, log, criteria, event, p.mouseX, p.mouseY, now);
  };

  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') showDebug = !showDebug;
    if (p.key === 'l' || p.key === 'L') downloadLog(log, p.millis()); // descarga el registro de la sesión en JSON
    if (p.key === 's' || p.key === 'S') wantSave = true;               // guarda la obra como imagen
  };

  // Si cambia el tamaño de la ventana, el canvas y el campo la siguen.
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    field = createField(p.width, p.height);
    trails = createTrails(p.width, p.height); // al redimensionar, las trazas se reinician
  };
});
