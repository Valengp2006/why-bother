# Hito 5 — Trazas Physarum y pase visual (23/10/2026)

## Qué se hizo
- `trails.js`: malla de baja resolución (`GRID_SCALE`) con **tres canales** (fiel, desvío, deriva). Cada agente deposita en el canal de su comportamiento actual; las trazas se difunden y decaen.
- Máscaras: **conservadas** (el decaimiento casi desaparece: `CONSERVE_DECAY`) y **soltadas** (decaen mucho más rápido: `RELEASE_DECAY`). Las funciones `conserve` y `release` existen, pero el clic que las dispara llega en el hito 6.
- Sensores tipo Physarum: cada agente mira la traza conservada a izquierda, frente y derecha. Si el frente tiene tanto o más que los lados sigue recto; si no, gira hacia el lado mayor (`SENSE_WEIGHT`).
- Dibujo: las trazas se pintan en una imagen del tamaño de la malla y se estiran a pantalla completa, con suavizado. Los agentes solo se dibujan con la tecla `D` (o con `SHOW_AGENTS`). Lo conservado se tiñe de dorado en proporción a la pintura que hay ahí.
- En desarrollo (`npm run dev`) se puede cambiar cualquier parámetro desde la consola del navegador, sin recargar: `__CONFIG.TRAIL_GAIN = 2`.

## Pase visual: respuesta al feedback del hito 3
Feedback de Valen: color muy oscuro, trazos muy finos, movimiento robótico, no se siente como fluido.

| Parámetro | Antes | Ahora | Efecto buscado |
|---|---|---|---|
| `DEPOSIT` | — | 22 | más pintura por agente |
| `TRAIL_GAIN` | — | 1,8 | colores más luminosos |
| `DECAY` | — | 0,85 | las corrientes duran más |
| `DIFFUSION` | — | 0,12 | bordes suaves sin perder forma |
| `SPAWN_RATE` | 0,12 | 0,2 | más agentes, más cobertura |
| `MAX_FORCE` | 500 | 200 | giros más graduales, menos robótico |
| `WANDER_STRENGTH` | 400 | 180 | menos temblor |
| `AGENT_LIFETIME` | 5 | 7 | recorridos más largos |

Se probaron cuatro combinaciones renderizadas sin pantalla; la elegida da corrientes continuas que se mezclan, mucho más cerca de los referentes que los trazos sueltos. Queda por evaluar con el mouse real: venas finas blancas (los referentes las tienen) y más variedad de color.

## Verificación
- El render sin pantalla muestra masas continuas turquesa y blanco hielo sobre el fondo oscuro.
- Los sensores se probaron con una función aislada: lo conservado a la derecha produce giro a la derecha, y a la izquierda, giro a la izquierda. Se corrigió un sesgo: con valores iguales siempre ganaba el sensor izquierdo.
- La atracción de punta a punta (agentes que vuelven a lo conservado) se verá con los clics del hito 6.

## Hipótesis (completar ANTES de probar con el mouse)
- `DIFFUSION` 0,12 → 0,4: ___
- `DECAY` 0,85 → 0,4: ___
- `GRID_SCALE` 0,25 → 0,5: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Aspecto visual de las trazas (pintura fluida) y valores del pase visual | Yo definí el aspecto buscado con los referentes y juzgué el resultado; delegué la implementación y los valores numéricos | |
