# Hito 6 — Juicio y registro (23/10/2026)

## Qué se hizo
- **Conservar:** clic izquierdo. Marca la traza dentro de `CONSERVE_RADIUS` como conservada: casi no decae y atrae a los agentes (sensores del hito 5). Se tiñe de dorado.
- **Soltar:** clic derecho, Shift+clic o Ctrl+clic (el clic derecho en Mac). La traza de esa zona decae mucho más rápido. Se evita el menú del navegador.
- **El primer clic de la sesión solo inicia el audio** (Tone.js lo exige) y **no cuenta** como juicio.
- **Registro** de cada juicio (`log.js`): tiempo, acción, posición, canal dominante en el radio (fiel, desvío, deriva o ninguno) y masa de traza afectada, con la masa de cada canal. Si bajo el cursor hay menos de `JUDGMENT_MIN_MASS`, el origen es `ninguno`.
- **Panel (`D`):** conservados y soltados por origen (f fiel, d desvío, v deriva, - sin traza).
- **Descarga (`L`):** JSON con la semilla, la fecha, los eventos, los conteos y los parámetros clave de la sesión.
- Se activó la tercera frase narrativa (el juicio).

## Verificación
- Lógica aislada: pintura de desvío bajo el cursor → origen `desvio`; pintura fiel → `fiel`; zona vacía → `ninguno`; las tres formas de soltar se reconocen.
- En el navegador (clics simulados): el primer clic no cuenta; el segundo queda como `conservado · desvío 1`; clic derecho y Shift+clic quedan como `soltado · desvío 2`.
- No verificado: la descarga del JSON en un navegador real (se probó solo su contenido).

## Por mirar en el pulido (hito 9)
- El dorado se ve como una mancha casi plana donde la pintura satura. Conviene que se vea más como veta dorada que sigue la pintura.
- Con muchos agentes la pintura se quema (queda blanca/turquesa saturada). Probablemente bajar `DEPOSIT` o `TRAIL_GAIN`.

## Atención para la hipótesis
Una sola sesión no dice nada: la hipótesis se evalúa con el conteo de **conservados por origen en varias sesiones y personas**. Se sostiene si en la mayoría hay al menos una traza conservada de origen desvío; cae si casi todo lo conservado es fiel. Para el análisis, usar solo juicios con origen distinto de `ninguno`.

## Hipótesis (completar ANTES de probar)
- Al conservar, la persona elegirá zonas de origen: ___ (fiel / desvío / deriva)
- Lo conservado atraerá a los agentes siguientes (se ve como más pintura alrededor del dorado): ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Cómo se juzga (clic conserva, clic derecho suelta) y qué se registra de cada juicio | Yo definí el gesto y qué evidencia guardar; delegué la implementación | El registro es la evidencia para la pregunta 3 (qué encontré) |
