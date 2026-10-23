# Ficha de diseño — Unidad 8: Why Bother?

**Título provisional:** *Lo que quise decir*

> Borrador para la bitácora. Está escrito a partir de lo que Valen decidió; ajusta lo que no suene a ti y, sobre todo, completa la tabla de "qué decidí / qué delegué" con tus propias palabras.

## 1. Interpretación de la pregunta

¿Para qué tomarme el trabajo? Porque la automatización hace posible lo que imagino, pero no siempre lo interpreta como lo quise. Lo que me queda es la intención, el criterio para juzgar el resultado y la capacidad de entender lo suficiente para corregirlo.

**Mi postura de partida frente a la IA:** la veo como ayuda para agilizar y automatizar lo técnico. Me deja fluir las ideas sin quedar limitada a lo que puedo hacer por mi cuenta, y me hace descubrir qué más puedo hacer. Lo que más valoro es el ahorro de tiempo y saber que lo que imagine será técnicamente posible. Lo que me deja con dudas es que a veces la herramienta falla o interpreta distinto lo que busco.

**Qué aspecto explora la obra:** la distancia entre lo que imagino y lo que resulta, es decir, qué pasa entre una intención y su interpretación automática.

## 2. Hipótesis

Una intención clara produce más fidelidad, pero parte de lo que vale la pena conservar aparece en los desvíos.

Tiene dos partes de naturaleza distinta, y conviene tenerlo claro:

- **"Una intención clara produce más fidelidad"** es una **regla del sistema**: se cumple por construcción. Lo que sí se observa con personas es *si logran* producir una intención clara y cuánto les cuesta.
- **"Parte de lo que vale la pena conservar aparece en los desvíos"** es la parte **empírica**: se verifica contando qué conservan las personas según el origen de lo conservado.

**Cuándo se sostiene y cuándo no:** si en la mayoría de las sesiones se conserva al menos una traza que nació de un desvío, la hipótesis se sostiene. Si casi todo lo conservado es fiel, la hipótesis cae, y eso también es un hallazgo.

## 3. Qué es humano y qué es automático

| Humano (mouse) | Automático (agentes) |
|---|---|
| Mover el mouse sin presionar: **intención** | Agentes que interpretan el trazo, lo extienden y a veces se desvían |
| Clic: **conservar** una traza | Trazas que se depositan, se difunden y se desvanecen |
| Clic derecho o Shift+clic: **soltar** una traza | Flocking de los desviados y deriva de los perdidos |

## 4. Modelos (todos ya usados en el curso)

- **Flow field:** el trazo deja un campo de direcciones, con extrapolación hacia delante (el alcance).
- **Steering con wander:** cada agente sigue el campo; su ruido depende de la fidelidad.
- **Flocking:** los desviados se agrupan con vecinos de rumbo parecido.
- **Trazas tipo Physarum:** los agentes depositan huellas que se difunden y se desvanecen; lo conservado se refuerza y atrae.
- **Sonificación (Tone.js):** el estado del sistema se vuelve sonido.

## 5. Reglas del sistema

1. **Claridad de intención (0 a 1):** se calcula con la trayectoria del mouse en una ventana de ~1,5 s: constancia de dirección y constancia de velocidad. Si el mouse casi no se mueve, la intención está inactiva.
2. **Agentes:** nacen cerca del mouse mientras hay intención, en proporción a su velocidad. Cada uno tiene una **susceptibilidad** fija desde su nacimiento.
3. **Fidelidad = claridad × susceptibilidad.** Cuanto más alta, más sigue el campo; cuanto más baja, más ruido y más ángulo de desviación propio.
4. **Tres comportamientos (se clasifican por regla, no por azar):**
   - **Fiel:** fidelidad alta.
   - **Desvío:** fidelidad media o baja, pero con vecinos de rumbo parecido (forma un camino coherente).
   - **Deriva:** fidelidad baja y sin vecinos afines (se dispersa).
5. **Alcance:** el campo se extrapola más allá del mouse en proporción a la claridad.
6. **Juicio:** clic para **conservar** una traza (se refuerza y atrae a los agentes siguientes); clic derecho o Shift+clic para **soltarla** (se desvanece más rápido). El sistema no decide qué es útil.
7. **Cierre:** tras un tiempo sin interacción, o al presionar E, todo se disuelve poco a poco y queda un rastro tenue de lo conservado.
8. **Sonido:** los fieles suenan en una escala fija; los desvíos se desafinan en proporción a (1 − fidelidad); conservar sostiene la nota; soltar la deja morir; el final es una nota que se apaga con la disolución.

La aleatoriedad solo interviene en valores iniciales (susceptibilidad, ángulo de desvío) con una **semilla fija y reproducible**. Con la misma semilla y el mismo recorrido del mouse, el resultado se repite.

## 6. Estados

- **Sistema:** inicio (oscuridad y silencio) → juego → cierre (disolución) → reposo (rastro tenue).
- **Agente:** fiel / desvío / deriva (se reevalúa cada ~0,5 s).
- **Traza:** normal / conservada / soltada.

## 7. Parámetros y predicciones

La idea es anotar cada predicción **antes** de mover el parámetro, y la observación **después**.

| Parámetro | Si lo subo, predigo... |
|---|---|
| Velocidad mínima de intención | Cuesta más activar la intención y casi todo se vuelve deriva |
| Intensidad del wander | Baja la fidelidad de todos, hay menos fieles |
| Cohesión del flocking | Más desvíos coherentes y menos deriva |
| Persistencia de lo conservado | Queda más rastro en el cierre |
| Desafinación máxima (cents) | Los desvíos suenan más ajenos y se distinguen mejor de los fieles |
| Tiempo de inactividad para el cierre | El cierre tarda más en llegar solo |

## 8. Cómo se verifica la hipótesis

El sistema registra durante cada sesión: qué se conservó y qué se soltó, el origen dominante de cada traza (fiel, desvío o deriva), su masa y el momento. Se descarga como JSON y se pega en la bitácora con el resultado de cada prueba.

**Pruebas con otras personas:** jugar sin explicar nada. Anotar qué intentaron, qué conservaron, cuándo soltaron, si notaron que el sonido cambiaba, y cómo reaccionaron al final.

## 9. Evidencia para las preguntas de la presentación

| Pregunta | Evidencia que voy a tener |
|---|---|
| 1. Interpretación y cómo cambió | Este documento, y las entradas de bitácora que registran cada cambio de interpretación (por ejemplo, haber partido de "la IA quita esfuerzo" y terminar en "la distancia entre intención e interpretación") |
| 2. Cómo lo exploré | Modelos elegidos, decisiones y pruebas, con hipótesis antes y observaciones después |
| 3. Qué encontré | El registro de conservados por origen, de varias sesiones y personas |
| 4. Qué aprendí realmente | Poder explicar la fórmula de fidelidad y modificarla, y predecir el efecto de los parámetros |
| 5. Qué sentido tuvo | La columna de "qué decidí / qué delegué" y mi respuesta final frente a Hodgin |

## 10. Qué decidí yo / qué delegué (borrador, completar con mis palabras)

| Decisión | Quién | Notas |
|---|---|---|
| Postura frente a la IA y el aspecto a explorar | Yo | La explicité al responder qué valoro y qué me incomoda de usarla |
| Mezclar las tres formulaciones (alcance, descubrimiento, deriva) | Yo | Las propuestas de formulación vinieron de la conversación; la mezcla fue mi decisión |
| Añadir música por gusto personal, con sonificación y Tone.js | Yo | La sonificación como forma concreta fue propuesta y yo la elegí |
| Estela tipo Physarum como imagen final, con disolución casi total | Yo | El rastro tenue que queda fue elegido entre dos opciones |
| Cierre por inactividad y tecla, mover sin presionar | Yo | |
| Fórmula de claridad, umbrales y valores iniciales de los parámetros | Delegué (propuesto) | Pendiente de entender, probar y ajustar yo |
| Código | Por definir | Anotar a medida que se programe |
