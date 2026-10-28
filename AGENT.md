# AGENT.md — Unidad 8: Why Bother? — "Lo que quise decir" (título provisional)

> Para usar en un repo nuevo, guárdalo como `AGENT.md` (o referencia desde un `CLAUDE.md` con "Lee AGENT.md antes de empezar").

> **NOTA (28/10/2026): cambio de rumbo.** La obra cambió de "intención contra fidelidad" a "las decisiones de la persona hacen suya una obra que ejecuta el sistema": pintura viva, narración con preguntas, obra final guardable y sonido de agua y viento. Lo vigente está en `docs/bitacora/2026-10-28-nuevo-rumbo.md` y en `docs/presentacion-borrador.md`. Las secciones 3 y 7 de este archivo describen el diseño anterior y quedaron en parte superadas; las restricciones (sección 2) siguen valiendo salvo donde la bitácora diga lo contrario.

Este archivo es el contexto de trabajo para el agente. Léelo completo antes de tocar código. Si algo aquí contradice una instrucción puntual de Valen en el chat, manda el chat; avísale de la diferencia. El diseño ya está definido; el trabajo es implementarlo bien y que Valen pueda entenderlo y defenderlo.

## 1. Qué estamos construyendo

Unidad 8 del curso (12.5% de la nota): una obra de **simulación computacional** que explora la pregunta **"Why Bother? ¿Para qué tomarte el trabajo?"** (charla de Robert Hodgin, "Why Bother? Making Art in the Age of AI"). Tiempo: **una semana** desde el 23 de octubre de 2026. Se presenta en vivo.

**Interpretación de Valen (no cambiar sin hablarlo con ella):**
> ¿Para qué tomarme el trabajo? Porque la automatización hace posible lo que imagino, pero no siempre lo interpreta como lo quise. Lo que me queda es la intención, el criterio para juzgar el resultado y la capacidad de entender lo suficiente para corregirlo.

**Hipótesis:** una intención clara produce más fidelidad, pero parte de lo que vale la pena conservar aparece en los desvíos.
- La primera mitad es una **regla del sistema** (se cumple por construcción).
- La segunda es **empírica**: se verifica con lo que conservan las personas. Por eso el sistema **registra** lo que se conserva y su origen.

**La obra no es una moraleja ni defiende una postura.** Es un experimento que puede refutar la hipótesis. No agregar textos, mensajes ni elementos que concluyan por la persona.

## 2. Restricciones

1. **Simulación computacional en la web, en tiempo real, en pantalla completa.**
2. **Modelos limitados a los ya usados en el curso:** flow fields, steering behaviors (con wander), flocking, trazas tipo Physarum, partículas. No sumar modelos nuevos sin preguntar. La novedad está en la regla central (fidelidad y juicio), no en el mecanismo.
3. **Entrada principal: mouse.** Mover **sin presionar** = intención. Clic = conservar. Clic derecho o Shift+clic = soltar. No usar cámara ni otras entradas.
4. **Determinismo explicable.** Todo resultado debe responder a una regla. La aleatoriedad solo en valores iniciales (susceptibilidad, ángulo de desvío) con **semilla fija** (`randomSeed`), de modo que mismo recorrido y misma semilla den el mismo resultado. Nada que decida el resultado al azar.
5. **Todos los parámetros en un solo archivo (`src/config.js`)** con nombres claros y un comentario de qué hace y qué pasa si se sube.
6. Valen debe poder **explicar y modificar** lo construido (pregunta 4 de la presentación). Código simple y legible, con comentarios que expliquen el *porqué*.

## 3. El sistema

### 3.1 Intención (humano)
El mouse se mueve sin presionar. Se guarda su trayectoria en una **ventana de ~1,5 s** y se calcula la **claridad** (0 a 1):

- **Constancia de dirección:** longitud de la media de los vectores de velocidad normalizados (1 = misma dirección; ~0 = errático).
- **Constancia de velocidad:** 1 − coeficiente de variación de la rapidez, acotado a [0, 1].
- `claridad = W_DIR · constanciaDirección + W_SPEED · constanciaVelocidad`, con `W_DIR + W_SPEED = 1`.
- Si la rapidez media queda por debajo de `MIN_SPEED`, la intención está **inactiva** (claridad 0, no nacen agentes).

### 3.2 Campo y alcance
El trazo deja un **flow field** en celdas cercanas al mouse (la dirección del movimiento, con caída por distancia y que decae con el tiempo). Además se **extrapola hacia delante** un abanico de vectores cuya longitud es proporcional a `claridad · LOOKAHEAD`. A más claridad, más **alcance** (el sistema llega más lejos que la mano).

### 3.3 Agentes
- Nacen cerca del mouse mientras la intención está activa, en proporción a la rapidez. Nacen con velocidad en la dirección del trazo. Tienen vida finita (`AGENT_LIFETIME`) y se reciclan (máximo `PARTICLE_COUNT`).
- Cada uno tiene una **susceptibilidad** `s ∈ [0,1]` y un **ángulo de desvío** propio, fijos desde su nacimiento (con la semilla).
- **Fidelidad:** `f = claridad × s`.
- **Movimiento (steering):**
  - Dirección deseada = dirección del campo en su posición, **rotada** por `ánguloDesvío × (1 − f)`.
  - Ruido (wander) proporcional a `(1 − f) × WANDER_STRENGTH`.
  - Fuerza de steering = deseada − velocidad, limitada. Fuera del campo, solo wander.

### 3.4 Los tres comportamientos (se reevalúan cada `CLASSIFY_INTERVAL`, ~0,5 s)
Se clasifican por **regla**:

| Comportamiento | Regla |
|---|---|
| **Fiel** | `f ≥ FIDELITY_HIGH` |
| **Desvío** | no es fiel y tiene al menos `COHERENCE_NEIGHBORS` vecinos dentro de `FLOCK_RADIUS` con rumbo alineado (≥ `ALIGN_MIN`) |
| **Deriva** | no es fiel y no cumple la condición de desvío |

- Los **desvíos** hacen flocking (alineación y cohesión) entre ellos, de modo que forman caminos coherentes.
- El sistema **no decide cuál es "útil"**. Eso lo juzga la persona.

### 3.5 Trazas (Physarum)
- Una **malla de baja resolución** (`GRID_SCALE`) con **tres canales**: traza de fieles, de desvíos y de deriva.
- Cada agente deposita en el canal de su comportamiento actual. Las trazas se difunden (blur) y decaen.
- Una máscara de **conservadas** reduce el decaimiento casi a cero y hace que los agentes sientan esa traza (sensores tipo Physarum) y se **sientan atraídos** hacia ella con `SENSE_WEIGHT`. Es el paso de "volver a la intención con lo conservado como punto de partida".
- Una máscara de **soltadas** aumenta el decaimiento en esa zona.

### 3.6 Juicio (humano)
- **Clic izquierdo:** conserva la traza dentro de `CONSERVE_RADIUS` del cursor.
- **Clic derecho o Shift+clic:** suelta la traza dentro de ese radio.
- **El primer clic de la sesión solo inicia el audio** (Tone.js lo exige) y **no cuenta** como juicio.
- Cada juicio se **registra**: tiempo, acción, canal dominante en el radio (fiel, desvío o deriva) y masa de traza afectada.

### 3.7 Sonificación (Tone.js)
No se sonifica cada agente: se toman **agregados o una muestra pequeña** en un tick musical (cada ~120 a 250 ms, sobre `Tone.Transport`). Todo pasa por un limitador y un volumen maestro.

| Evento | Sonido |
|---|---|
| Fieles | Notas de una **escala fija** (la posición o el rumbo elige el grado), sonido suave; el volumen sube con la proporción de fieles |
| Desvíos | Las mismas notas **desafinadas** en proporción a `(1 − f)` hasta `DETUNE_MAX_CENTS` |
| Deriva | Casi silencio: una textura muy tenue. Lo que se pierde casi no suena |
| Conservar | La nota de esa zona se **sostiene** (drone), con un máximo de voces simultáneas (`MAX_VOICES`) |
| Soltar | La nota **muere** con un release largo |
| Cierre | Todo se apaga con la disolución; el final es una nota que se extingue |

Si el día 5 va atrasado, la sonificación baja a capas pregrabadas o a una pista fija, sin tocar el resto del sistema.

### 3.8 Ciclo y cierre
- **Inicio:** oscuridad y silencio. Hasta el primer clic no suena nada.
- **Juego:** lo descrito arriba.
- **Cierre:** se activa por **inactividad** (`IDLE_TIMEOUT_MS` sin movimiento ni clic) **o** al presionar **E** (acelera el final). Una disolución de `DISSOLVE_DURATION` segundos: el decaimiento global sube gradualmente, y lo conservado decae más lento hasta un **nivel residual tenue** (`RESIDUAL_LEVEL`) que permanece. El sonido se apaga en paralelo.
- **Reposo:** queda ese rastro tenue en pantalla. Propuesta (confirmar con Valen): al volver a mover el mouse, el rastro es el punto de partida de una nueva ronda; `R` reinicia todo desde cero.

### 3.9 Registro de sesión
- Contadores y eventos de cada juicio (ver 3.6), más la semilla usada.
- **Panel de depuración (tecla `D`):** claridad actual, número de agentes por comportamiento, conservados por origen, parámetros clave.
- **Descarga del registro en JSON (tecla `L`)** para pegar en la bitácora y comparar entre personas.

## 4. Parámetros (todos en `src/config.js`)

`PARTICLE_COUNT`, `AGENT_LIFETIME`, `RANDOM_SEED`, `WINDOW_MS`, `MIN_SPEED`, `W_DIR`, `W_SPEED`, `LOOKAHEAD`, `WANDER_STRENGTH`, `MAX_DEVIATION_ANGLE`, `FIDELITY_HIGH`, `FLOCK_RADIUS`, `COHERENCE_NEIGHBORS`, `ALIGN_MIN`, `CLASSIFY_INTERVAL`, `GRID_SCALE`, `DEPOSIT`, `DIFFUSION`, `DECAY`, `CONSERVE_RADIUS`, `CONSERVE_DECAY`, `RELEASE_DECAY`, `SENSE_ANGLE`, `SENSE_DISTANCE`, `SENSE_WEIGHT`, `IDLE_TIMEOUT_MS`, `DISSOLVE_DURATION`, `RESIDUAL_LEVEL`, `AUDIO_SCALE`, `AUDIO_ROOT`, `DETUNE_MAX_CENTS`, `MAX_VOICES`, `TICK_MS`, `MASTER_GAIN`.

Cada uno con un comentario de qué hace y qué se espera si se sube. Valen anotará **hipótesis antes y observación después**.

## 5. Stack y estructura del repo

- **Vite** (vanilla JS, módulos ES) + **p5.js** (2D, por npm) + **Tone.js** (por npm). p5 en 2D con malla de baja resolución para las trazas; es suficiente para unos miles de agentes y evita los problemas de WebGPU de proyectos anteriores. Si hace falta rendimiento, proponer alternativas antes de cambiar.
- Debe poder desplegarse en **GitHub Pages**.
- **Explica con calma la configuración del proyecto base y el despliegue** (git, Vite, GitHub Pages): en proyectos anteriores el arranque fue lo más difícil. Documéntalo en el README paso a paso.

```
/
├── AGENT.md
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.js          # arranque y ciclo de p5
│   ├── config.js        # TODOS los parámetros
│   ├── intention.js     # trayectoria, claridad
│   ├── field.js         # flow field y extrapolación
│   ├── agent.js         # agente, fidelidad, steering, clasificación
│   ├── flock.js         # flocking de desviados
│   ├── trails.js        # malla Physarum de 3 canales, conservar/soltar
│   ├── judgment.js      # clic, máscaras, registro de juicios
│   ├── audio.js         # sonificación con Tone.js
│   ├── lifecycle.js     # inicio, juego, cierre, reposo
│   ├── log.js           # registro de sesión, descarga JSON
│   └── render.js        # dibujo
└── docs/
    ├── ficha-diseno.md
    └── bitacora/
```

Es una propuesta; si algo se ve mejor distinto, propónlo y explica por qué.

## 6. Plan de trabajo (por hitos, uno a la vez)

Un hito por vez; Valen lo prueba en el navegador y da el visto bueno antes de seguir. Un commit por hito.

1. **Repo y esqueleto:** `git init`, Vite + p5 + Tone, `.gitignore`, README, canvas oscuro a pantalla completa, `config.js`, despliegue en GitHub Pages funcionando.
2. **Intención:** trayectoria del mouse, ventana, claridad, con un indicador de depuración. Sin agentes todavía.
3. **Agentes y fidelidad:** nacimiento, campo y alcance, steering con wander, fidelidad. Render básico con colores de depuración por comportamiento.
4. **Flocking y clasificación:** desvíos coherentes y deriva, con conteo en el panel.
5. **Trazas Physarum:** tres canales, difusión, decaimiento, sensores y atracción.
6. **Juicio y registro:** conservar y soltar, el primer clic solo inicia audio, contadores, JSON.
7. **Sonificación con Tone.js.**
8. **Ciclo y cierre:** inactividad, tecla E, disolución con rastro residual, reposo.
9. **Pulido y pruebas con otras personas, bitácora y despliegue.**

Calendario orientativo: hitos 1 a 3 el día 3; 4 a 6 el día 4; 7 y 8 el día 5; pruebas el día 6; autoevaluación y ensayo el día 7.

## 7. Decisiones abiertas (pregúntale a Valen, no asumas)

- **Dirección visual:** referentes, paleta y forma de los agentes y las trazas. Antes del hito 3 pregunta; hasta entonces usa colores neutros de depuración.
- **Escala y timbre:** qué escala fija y qué instrumento o sonido de base.
- **Comportamiento tras el cierre:** confirmar la propuesta de que el rastro sea punto de partida de la siguiente ronda.

## 8. Cómo trabajar con Valen

- Valen está en 6.º semestre de Ingeniería en Diseño de Entretenimiento Digital (UPB), con experiencia en p5.js y Three.js. Puede seguir código, pero **tiene que poder explicarlo y modificarlo**: comenta el porqué de cada regla.
- Código simple y legible antes que ingenioso. Funciones pequeñas con nombres que reflejen el modelo (`computeClarity`, `fidelityOf`, `classify`, `conserve`, `release`, `dissolve`).
- Cada regla localizable en un solo lugar y ajustable desde `config.js`.
- No agregues dependencias sin preguntar. Responde y comenta en español.
- Antes de un cambio grande, resume el plan en pocas líneas y espera confirmación.
- Al terminar cada hito, di qué probar en el navegador y qué parámetro mover para ver su efecto, y qué esperar.
- **Lleva la cuenta de qué decidió Valen y qué hiciste tú**: al cerrar cada hito, propón una línea para la columna "qué decidí / qué delegué" de su bitácora (en `docs/ficha-diseno.md`, sección 10). Es evidencia para las preguntas 4 y 5 de la presentación.

## 9. Bitácora

Valen registra en su bitácora de GitHub referentes, experimentos, decisiones y pruebas. Al cerrar cada hito, propón una entrada corta en `docs/bitacora/` con fecha, qué se hizo, qué se decidió y por qué, y qué se observó. Para cada cambio de parámetro o regla: **hipótesis antes, observación después**. Registra también los **cambios de interpretación** (pregunta 1 de la presentación). Si el curso pide una autoevaluación, usa los criterios que indique el profesor; el enunciado de la unidad no los lista.

## 10. Presentación

Valen presenta la obra en vivo y responde cinco preguntas: cómo interpretó la pregunta y cómo cambió, cómo lo exploró (técnicas, decisiones, pruebas), qué encontró (lo esperado, lo que sorprendió, lo abierto), qué aprendió realmente (qué puede comprender, explicar o modificar) y qué sentido tuvo el esfuerzo y cómo se sitúa frente a Hodgin. Todo en el sistema y en la bitácora debe dejar evidencia para esas cinco.
