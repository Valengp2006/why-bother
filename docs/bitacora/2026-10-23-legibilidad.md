# Legibilidad: que se entienda qué es cada cosa (23/10/2026)

## Feedback de Valen (al probar el hito 5)
Visualmente empieza a ser más atractivo, pero no se entiende bien qué representa cada cosa y falta algo que explique por qué funciona así.

## Tensión con el diseño
El diseño dice que la obra **no concluye por la persona** ni lleva moraleja. Explicar **qué es cada cosa** (control y causa) no es lo mismo que decir **qué significa**. Se buscaron opciones que hagan legible el sistema sin interpretarlo.

## Opciones consideradas
1. Instrucción mínima al inicio.
2. Leyenda con una tecla (H o ?).
3. Hacer visible la intención (trazo y alcance), sin texto.
4. Nada en pantalla: se explica al presentar y en la bitácora.

## Decisión de Valen
Opciones **1 y 3**. La leyenda de colores (opción 2) queda descartada por ahora: la obra mantiene los colores sin rótulos.

## Qué se hizo
- **Instrucción mínima:** *"Mueve el mouse, sin presionar"*, tenue y centrada en la oscuridad inicial. Se desvanece cuando la persona empieza a moverse con intención. Explica el control, no el sentido (`HINT_TEXT` en `config.js`).
- **Intención visible:** el trazo del mouse (lo que pone la persona) se dibuja tenue y se desvanece con la ventana de 1,5 s. Por delante se dibuja un abanico con el alcance (`claridad × LOOKAHEAD`): lo que pone el sistema. Así se ve que a más claridad el sistema llega más lejos que la mano (`SHOW_INTENTION`, `INTENTION_ALPHA`, `INTENTION_WEIGHT`).

## Pendiente
- Una segunda línea para el juicio ("clic conserva, clic derecho suelta") aparecerá en el hito 6, cuando existan los clics.
- Evaluar con otras personas, sin explicar nada, si con esto basta. Anotar qué creen que representa cada color.

## Hipótesis (completar ANTES de probar)
- Con la instrucción y la intención visible, una persona nueva entiende que "lo que hace el mouse" produce el resto: ___
- Los colores seguirán sin entenderse sin ayuda: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Cómo hacer legible la obra sin explicar su sentido | Yo detecté el problema y elegí instrucción mínima + intención visible (descarté la leyenda); delegué la implementación | Relacionado con la pregunta 1: la obra no concluye por la persona |
