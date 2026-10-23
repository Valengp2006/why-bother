# Profundidad: el juicio tiene consecuencias (23/10/2026)

## Feedback de Valen (al probar el hito 6)
Siente que al proyecto le falta profundidad: es superficial tanto en intención como en finalidad.

## Diagnóstico (contra la propia interpretación)
La interpretación dice que lo que queda es: (1) la **intención**, (2) el **criterio** para juzgar y (3) la **capacidad de entender lo suficiente para corregir**. La obra, hasta el hito 6, cumplía mal las tres:
1. **Intención:** la "claridad" mide qué tan parejo se mueve la mano, no qué se quiso decir. Y la fidelidad se mide contra el propio trazo del mouse, así que es casi circular: no hay una distancia real entre lo que se imaginó y lo que salió.
2. **Criterio:** conservar atraía agentes y se pintaba de dorado, pero el sistema no cambiaba nada por esa elección. Era un adorno, no un criterio con consecuencias.
3. **Entender para corregir:** no existía ningún gesto ni elemento de corrección ni de comprensión dentro de la obra.
Finalidad: no había contraste entre esforzarse y no hacerlo, que es el núcleo de la pregunta de Hodgin.

## Direcciones propuestas
1. Que el juicio tenga consecuencias. **← elegida por Valen**
2. Mostrar la distancia entre lo que quise y lo que salió (línea fantasma de la intención).
3. Un gesto para corregir (p. ej. la rueda ajusta qué tan literal es la interpretación).
4. Contrastar esfuerzo y no esfuerzo (qué pasa si dejo de moverme).

## Qué se hizo (dirección 1)
- Al conservar una zona se guarda de qué **origen** era (fiel, desvío, deriva) y hacia dónde **fluía** su pintura (la dirección de los agentes que la depositaron).
- Esa zona se vuelve un **criterio**: una intención que persiste. Mientras exista, emite agentes con esa dirección y origen (`CRITERION_SPAWN_RATE`) y proyecta su propio alcance en el campo, aunque la mano esté en otro lado. Se ve como un abanico dorado.
- Los agentes "heredados" actúan con `CRITERION_CLARITY` (no con la claridad del mouse) y conservan el origen del criterio, así el registro de lo conservado no se contamina (un desvío conservado sigue siendo pintura de origen desvío).
- Soltar una zona apaga los criterios que había dentro.
- Si la pintura bajo el cursor no fluía en una dirección clara (`CRITERION_MIN_COHERENCE`), se conserva pero no emite.
- El registro anota si cada conservación quedó como criterio.
- La tercera frase narrativa cambió: *"Clic: conservar, en dorado. Lo conservado sigue su camino sin ti."*

## Por qué esto aporta profundidad
Un **desvío conservado se incorpora a lo que quise**: la distancia entre intención e interpretación deja de ser un error para convertirse en material. Eso vuelve mecánica la parte empírica de la hipótesis ("parte de lo que vale la pena conservar aparece en los desvíos"): lo conservado alimenta lo siguiente. Además, ahora existe un lazo intención → interpretación → juicio → nueva interpretación.

## Verificación (simulación sin pantalla, con control)
Mismo trazo de 5 s, luego la mano se aleja y queda quieta:
- **Sin conservar:** a los 11 s quedan 8 agentes y ninguno heredado; todo se apaga.
- **Conservando a los 4 s:** el criterio sale de origen *desvío*, dirección (0,99, −0,12), coherencia 0,99. A los 11 s hay 33 agentes, 24 heredados, con rumbo medio (0,88, −0,05), coherente con el criterio.
- En el navegador: con la mano quieta siguen saliendo corrientes de las dos marcas conservadas; el panel muestra `criterios 2 / 10`.

## Lo que NO resuelve (queda abierto)
- La **circularidad** de la intención (direcciones 2 y 3): la claridad sigue midiendo constancia del movimiento, y no hay un gesto de corrección.
- El **contraste esfuerzo / no esfuerzo** (dirección 4).
- Por mirar en el pulido: el dorado se ve como un disco amarillo; conviene que sea una veta que siga la pintura.

## Hipótesis (completar ANTES de probar)
- Con criterios, las sesiones tendrán más pintura de origen desvío al final que sin ellos: ___
- La persona conservará más cuando vea que lo conservado "sigue sin ella": ___
- `CRITERION_SPAWN_RATE` 5 → 15: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Que lo conservado se vuelva una intención persistente (el criterio tiene consecuencias) | Yo detecté la falta de profundidad y elegí esta dirección entre cuatro; delegué el diagnóstico, el diseño de la herencia y la implementación | Responde a la pregunta 1: la intención deja de ser solo la mano |
