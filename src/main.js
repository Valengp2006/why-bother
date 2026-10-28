// main.js — arranque y ciclo de p5.
import p5 from 'p5';
import './style.css';
import { CONFIG } from './config.js';
import { MODE } from './mode.js'; // ajusta CONFIG según el modo (dev o performance)
import { recordSample, computeClarity, recentDirection } from './intention.js';
import { createField, updateField } from './field.js';
import { createAgent, createInheritedAgent, stepAgent } from './agent.js';
import { createCriteria, addCriterion, strengthOf, pruneCriteria } from './criteria.js';
import { createGrid, buildGrid } from './flock.js';
import { createTrails, deposit, updateTrails, resampleTrails } from './trails.js';
import { world, updateWorld, applyEffect } from './world.js';
import { wellPosition, ambientDir } from './ambient.js';
import { startAudio, updateAudio, chime } from './audio.js';
import { createLog, downloadLog, recordChoice, recordFinal, recordPour } from './log.js';
import { createNarrative, updateNarrative, drawNarrative, narrativeClick, skipNarrative } from './narrative.js';
import { drawAgents, drawTrails, drawIntention, drawHint, drawStartScreen, drawDebug, drawFieldDebug, thumbnail } from './render.js';

// Solo en modo dev: permite probar valores desde la consola del navegador, por ejemplo  __CONFIG.TRAIL_GAIN = 2  ,
// sin recargar. En modo performance no existe.
if (MODE === 'dev') { window.__CONFIG = CONFIG; window.__world = world; }

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
  const session = createLog(); // el registro de la sesión (decisiones y juicios)
  let startFade = 1;      // 1 = se ve la pantalla de inicio; baja a 0 en 3 s cuando la historia empieza
  let hint2Alpha = 0;     // segunda invitación: 'Mueve el mouse', si pasa un rato sin que la persona se mueva
  let startedAt = 0;      // instante (ms) del primer clic
  let sawIntention = false; // true cuando la persona ya se movió con intención al menos una vez
  let pouring = false;     // true mientras la persona mantiene el clic: está vertiendo pintura
  let pour = null;         // el vertido en curso: dónde empezó, cuándo y la dirección en que va la mano
  let wantSave = false;   // pedir guardar la obra: se hace en el siguiente cuadro, con la pintura sola (sin textos)
  let fsButton = null;    // el botón de volver a pantalla completa
  let started = false;    // true desde el primer clic: ahí empieza la pintura (y el audio, que el navegador exige iniciar con un gesto)
  let showDebug = CONFIG.DEBUG_AT_START;

  // El puntero y el botón de pantalla completa dependen del estado de la ventana.
  //  · puntero: oculto si HIDE_CURSOR (en performance, solo en pantalla completa, para poder usar el botón)
  //  · botón: visible solo después de empezar y mientras no se esté en pantalla completa
  function refreshChrome() {
    const fs = !!document.fullscreenElement;
    const hide = CONFIG.HIDE_CURSOR && (MODE === 'dev' || fs);
    if (p.canvas) p.canvas.style.cursor = hide ? 'none' : 'default';
    if (fsButton) fsButton.style.display = started && !fs ? 'block' : 'none';
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    // El canvas no pide las fuentes por sí solo (solo lo hace el texto de la página): se cargan aquí, antes de usarlas.
    document.fonts.load("italic 400 32px 'Cormorant Garamond'");
    document.fonts.load("italic 500 18px 'Cormorant Garamond'");
    document.fonts.load("normal 400 32px 'Cormorant Garamond'");
    // Determinismo: las semillas se fijan una sola vez, aquí. Toda la aleatoriedad sale de p.random y p.noise.
    p.randomSeed(CONFIG.RANDOM_SEED);
    p.noiseSeed(CONFIG.RANDOM_SEED);
    field = createField(p.width, p.height);
    trails = createTrails(p.width, p.height);
    // El botón para volver a pantalla completa si se sale por accidente (aparece solo cuando hace falta).
    fsButton = document.createElement('button');
    fsButton.id = 'fs-button';
    fsButton.textContent = 'Pantalla completa';
    document.body.appendChild(fsButton);
    // Los eventos del botón no deben llegar a la obra: pulsarlo no puede contar como verter ni como elegir.
    for (const ev of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) fsButton.addEventListener(ev, (e) => e.stopPropagation());
    fsButton.addEventListener('click', () => { document.documentElement.requestFullscreen?.(); });
    document.addEventListener('fullscreenchange', refreshChrome);
    // Si la persona suelta el clic fuera de la obra (sobre el botón o fuera de la ventana), el vertido igual termina.
    document.addEventListener('mouseup', () => endPour(p.millis()), true);
    refreshChrome();

    // Se evita el menú del navegador con el clic derecho, para que no interrumpa el vertido.
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
      wellCarry[i] += CONFIG.AMBIENT_SPAWN_RATE * world.ambientSpawnMul * Math.pow(world.bloom, 1.6) * dt; // al principio casi nada: la pintura florece
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

  // Cada criterio (lo que la persona vertió) emite pintura dorada con su dirección, aunque la mano esté lejos o quieta:
  // lo tuyo sigue su camino sin ti, hasta que se apaga. Emite menos a medida que pierde fuerza.
  function spawnFromCriteria(dt) {
    for (const c of criteria) {
      c.carry += CONFIG.CRITERION_SPAWN_RATE * world.criterionRateMul * c.strength * dt;
      while (c.carry >= 1) {
        c.carry -= 1;
        if (agents.length >= CONFIG.PARTICLE_COUNT) continue;
        const angle = p.random(p.TWO_PI);
        const dist = p.random(CONFIG.SPAWN_RADIUS);
        agents.push(createInheritedAgent(p, c.x + Math.cos(angle) * dist, c.y + Math.sin(angle) * dist, c.dir));
      }
    }
  }

  // Mientras la persona mantiene el clic, vierte pintura dorada en el cursor, en la dirección en que mueve la mano.
  function spawnPour(dt, tSec) {
    const d = recentDirection(samples);
    if (d.x !== 0 || d.y !== 0) { pour.dir.x = d.x; pour.dir.y = d.y; }     // la dirección de la mano
    else if (pour.dir.x === 0 && pour.dir.y === 0) ambientDir(p, p.mouseX, p.mouseY, tSec, pour.dir); // quieta: la del ambiente
    pour.x1 = p.mouseX; pour.y1 = p.mouseY;
    pour.carry += CONFIG.POUR_RATE * dt;
    while (pour.carry >= 1) {
      pour.carry -= 1;
      if (agents.length >= CONFIG.PARTICLE_COUNT) continue;
      const angle = p.random(p.TWO_PI);
      const dist = p.random(CONFIG.POUR_RADIUS);
      agents.push(createInheritedAgent(p, p.mouseX + Math.cos(angle) * dist, p.mouseY + Math.sin(angle) * dist, pour.dir));
    }
  }

  // Al soltar el clic termina el vertido: queda registrado y nace un criterio que sigue emitiendo sin la mano.
  function endPour(nowMs) {
    if (!pouring) return;
    pouring = false;
    const dur = nowMs - pour.start;
    recordPour(session, { t: Math.round(pour.start), durationMs: Math.round(dur), x0: Math.round(pour.x0), y0: Math.round(pour.y0), x1: Math.round(pour.x1), y1: Math.round(pour.y1) });
    if (dur >= CONFIG.POUR_MIN_MS && (pour.dir.x !== 0 || pour.dir.y !== 0)) addCriterion(criteria, pour.x1, pour.y1, pour.dir, nowMs);
    pour = null;
  }

  p.draw = () => {
    const dt = Math.min(p.deltaTime / 1000, 0.05); // segundos; se acota para que una pausa no dispare la simulación
    const now = p.millis();
    p.background(CONFIG.BACKGROUND);

    // Antes del primer clic: oscuridad y silencio, solo el título y la invitación a empezar.
    if (!started) {
      drawStartScreen(p, now / 1000, 1, MODE);
      return;
    }

    // Se muestrea cada cuadro (aunque el mouse esté quieto: quedarse quieto también cuenta).
    recordSample(samples, p.mouseX, p.mouseY, now);
    const intention = computeClarity(samples);
    intention.clarity = Math.min(1, intention.clarity * world.clarityMul); // una decisión puede hacer que la mano cuente más o menos
    if (intention.active) sawIntention = true;

    updateWorld(dt);
    pruneCriteria(criteria, now);
    for (const c of criteria) c.strength = strengthOf(c, now);
    if (pouring) spawnPour(dt, now / 1000);
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
    updateAudio({ flow: Math.min(1, agents.length / 600), warmth: world.warmth, criteria: criteria.length, bloom: world.bloom, pouring }, dt);

    // El título se desvanece despacio cuando la historia empieza.
    startFade = Math.max(0, 1 - (now - startedAt) / 3000);
    world.bloom = Math.min(1, (now - startedAt) / (CONFIG.BLOOM_SECONDS * 1000)); // la floración sigue el reloj, no los cuadros

    // Cuántos agentes hay de cada comportamiento: la capa narrativa lo usa para saber qué ya está en pantalla.
    const counts = { fiel: 0, desvio: 0, deriva: 0 };
    for (const a of agents) counts[a.behavior]++;
    updateNarrative(narrative, { intentionActive: intention.active, counts }, now);

    drawTrails(p, trails, now);
    if (wantSave) { saveArt(now); wantSave = false; } // justo después de pintar: solo la pintura, sin textos ni paneles

    // Si pasa un rato sin que la persona se mueva, una segunda invitación la guía.
    const wantHint2 = !sawIntention && narrative.index >= 4 && !narrative.current && now - narrative.lastEnd > 3000; // tras el prólogo, si no se ha movido
    hint2Alpha += ((wantHint2 ? 1 : 0) - hint2Alpha) * Math.min(1, dt * 1.5);

    if (CONFIG.SHOW_INTENTION) drawIntention(p, samples, intention, criteria);
    if (showDebug || CONFIG.SHOW_AGENTS || world.showMechanism) {
      if (world.showMechanism) drawFieldDebug(p, field); // "ver cómo funciona": el campo y los agentes
      drawAgents(p, agents);
    }
    drawStartScreen(p, now / 1000, startFade, MODE);
    drawHint(p, hint2Alpha, CONFIG.HINT2_TEXT);
    drawNarrative(p, narrative, now, { x: p.mouseX, y: p.mouseY });
    if (showDebug) drawDebug(p, { samples, intention, agents, field, log: session, criteria, mode: MODE });
  };

  // Descarga la obra como imagen PNG y deja en el registro cómo quedó (una miniatura para comparar obras entre personas).
  function saveArt(nowMs) {
    p.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cauce-${session.startedAt.replace(/[:.]/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
    recordFinal(session, nowMs, world, thumbnail(32, 18));
  }

  // Clic: primero ¿eligió una opción de la narración? Si no, empieza a verter pintura (mantener el clic).
  // El primer clic de la sesión solo inicia el audio y la obra, y no cuenta como decisión.
  p.mousePressed = (event) => {
    if (!started) {
      started = true;
      startedAt = p.millis();
      narrative.lastEnd = startedAt;                       // el prólogo cuenta desde aquí
      if (CONFIG.FULLSCREEN && !p.fullscreen()) p.fullscreen(true); // en modo performance, pantalla completa
      startAudio();
      refreshChrome();
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
      chime(world.warmthTarget);
      recordChoice(session, now, choice);
      return;
    }
    // Cualquier otro clic empieza a verter: mantenerlo presionado vierte pintura dorada, y soltarlo termina el vertido.
    pouring = true;
    pour = { x0: p.mouseX, y0: p.mouseY, x1: p.mouseX, y1: p.mouseY, start: now, dir: { x: 0, y: 0 }, carry: 0 };
  };

  p.mouseReleased = () => endPour(p.millis());

  p.keyPressed = () => {
    if (p.key === 'd' || p.key === 'D') showDebug = !showDebug;
    if (p.key === 'l' || p.key === 'L') downloadLog(session, p.millis()); // descarga el registro de la sesión en JSON
    if (p.key === 'c' || p.key === 'C') { CONFIG.HIDE_CURSOR = !CONFIG.HIDE_CURSOR; refreshChrome(); } // muestra u oculta el puntero al probar
    if (p.key === 'f' || p.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    if (p.key === 's' || p.key === 'S') wantSave = true;               // guarda la obra como imagen
    if ((p.key === 'n' || p.key === 'N') && MODE === 'dev') skipNarrative(narrative, p.millis()); // solo dev: salta la narración
  };

  // Si cambia el tamaño de la ventana (por ejemplo, al entrar o salir de pantalla completa), la obra se adapta
  // y conserva lo pintado: los agentes y las fuentes se reubican y la pintura se reescala.
  p.windowResized = () => {
    const ow = p.width, oh = p.height;
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    const rx = p.width / ow, ry = p.height / oh;
    for (const a of agents) { a.x *= rx; a.y *= ry; }
    for (const c of criteria) { c.x *= rx; c.y *= ry; }
    field = createField(p.width, p.height);
    trails = resampleTrails(trails, p.width, p.height);
    refreshChrome();
  };
});
