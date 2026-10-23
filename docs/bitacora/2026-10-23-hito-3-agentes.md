# Hito 3 — Agentes y fidelidad (23/10/2026)

## Qué se hizo
- `field.js`: el trazo del mouse deja su dirección en celdas cercanas y un abanico por delante (alcance = claridad × `LOOKAHEAD`). El campo se desvanece solo (`FIELD_DECAY`).
- `agent.js`: los agentes nacen cerca del mouse, en proporción a su rapidez. Tienen susceptibilidad y ángulo de desvío fijos (semilla). **Fidelidad = claridad × susceptibilidad.**
- Steering: dirección deseada = la del campo rotada por `desvío × (1 − fidelidad)`; wander con fuerza `(1 − fidelidad) × WANDER_STRENGTH`. Fuera del campo, solo wander.
- Clasificación cada `CLASSIFY_INTERVAL`: por ahora **fiel** (fidelidad ≥ `FIDELITY_HIGH`) o **deriva**. El **desvío** llega en el hito 4 con el flocking.
- Dibujo con la paleta aprobada: trazos cortos orientados. Panel (`D`) con flechas del campo y conteos por comportamiento.

## Verificación sin pantalla (simulación de 4 s a 60 fps con los mismos módulos)
| Recorrido | Claridad media | Agentes | Resultado |
|---|---|---|---|
| Recta pareja | 1,00 | 140 | 71 fieles, 69 deriva |
| Garabato | 0,33 | 424 | 0 fieles, todos deriva |
| Quieto | 0,00 | 0 | no nacen agentes |

Con claridad 1 los fieles son los de susceptibilidad ≥ 0,55 (~45 %). Con claridad 0,33 nadie alcanza la fidelidad alta (el máximo posible es 0,33).

## Hipótesis (completar ANTES de probar con el mouse)
- Trazo recto y parejo: ___ de los agentes serán blancos y seguirán el trazo.
- `WANDER_STRENGTH` ×2: ___
- `LOOKAHEAD` 450 → 900: ___
- `FIDELITY_HIGH` 0,55 → 0,3: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Reglas de movimiento (campo, alcance, steering, fidelidad = claridad × susceptibilidad) | Yo definí las reglas; delegué su implementación y los valores iniciales de los parámetros | Pendiente: explicar por qué los fieles con claridad 1 son ~45 % |
