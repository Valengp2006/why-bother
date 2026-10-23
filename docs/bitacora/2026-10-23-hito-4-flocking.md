# Hito 4 — Flocking y clasificación (23/10/2026)

## Feedback visual del hito 3 (Valen, al probarlo)
Funcionalmente sirve como base, pero visualmente está lejos de los referentes:
- el color es demasiado oscuro,
- los trazos son demasiado finos,
- el movimiento es un poco robótico,
- no se siente como un fluido.

**Decisión:** seguir en orden con los hitos 4 y 5. El pase visual se hace cuando existan las trazas (hito 5), porque el aspecto de pintura sale de la malla difundida y no de los trazos sueltos.

## Qué se hizo
- `flock.js`: malla espacial para buscar vecinos; `neighborInfo` (vecinos con rumbo afín) y `flockForce` (alineación y cohesión entre desvíos).
- Clasificación completa cada `CLASSIFY_INTERVAL`: **fiel** si fidelidad ≥ `FIDELITY_HIGH`; **desvío** si no es fiel y tiene ≥ `COHERENCE_NEIGHBORS` vecinos con rumbo afín dentro de `FLOCK_RADIUS`; **deriva** si no.
- Los desvíos se alinean y se acercan entre sí, y así forman caminos coherentes.

## Decisión de modelado (a confirmar con Valen)
Para decidir si un agente es desvío cuentan como vecinos **todos** los agentes de rumbo afín (también los fieles). La alineación y la cohesión, en cambio, solo se calculan con vecinos desvío.

## Calibración (simulación sin pantalla, 4 s a 60 fps)
Con los valores iniciales (3 vecinos, radio 60, alineación 0,8) casi todo lo no fiel se volvía desvío: los agentes nacen juntos y con el mismo rumbo, así que siempre tienen vecinos afines. La deriva casi desaparecía y la distinción entre los tres comportamientos se perdía.

| Vecinos / radio / alineación | Ondulada (fiel / desvío / deriva) | Garabato (fiel / desvío / deriva) |
|---|---|---|
| 3 / 60 / 0,8 | 58 / 67 / 7 | 0 / 384 / 54 |
| **6 / 40 / 0,9 (elegido)** | 58 / 34 / 38 | 0 / 66 / 365 |
| 8 / 40 / 0,9 | 58 / 30 / 42 | 0 / 19 / 403 |
| 6 / 30 / 0,95 | 58 / 7 / 65 | 0 / 3 / 419 |

Se eligió 6 / 40 / 0,9 porque da una mezcla de los tres comportamientos en trazos moderadamente claros y mucha deriva en el garabato.

## Hipótesis (completar ANTES de probar con el mouse)
- `COHERENCE_NEIGHBORS` 6 → 2: ___
- `COHESION_WEIGHT` 0,6 → 2: ___
- `FLOCK_RADIUS` 40 → 100: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Reglas de clasificación (fiel / desvío / deriva) | Yo las definí; delegué la implementación, la malla de vecinos y la calibración inicial | Pendiente: probar y ajustar yo |
