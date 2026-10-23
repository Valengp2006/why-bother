# Hito 2 — Intención (23/10/2026)

## Qué se hizo
- `src/intention.js`: guarda la trayectoria del mouse en una ventana de 1,5 s y calcula la claridad (0 a 1).
- `claridad = W_DIR · constanciaDirección + W_SPEED · constanciaVelocidad`, con 0,6 y 0,4 de valores iniciales.
- Si la rapidez media < `MIN_SPEED`, la intención está inactiva y la claridad es 0.
- Panel de depuración (tecla `D`) con el rastro del mouse, los componentes y una barra de claridad.

## Hipótesis (completar ANTES de probar)
- Una línea recta a ritmo parejo da claridad: ___
- Un círculo da claridad: ___ (dirección cambia siempre, pero la rapidez es pareja)
- Garabatear da claridad: ___
- Quedarse quieto da claridad: ___

## Observación (completar DESPUÉS)
- ___

## Qué decidí / qué delegué (propuesta de línea para la ficha, sección 10)
| Fórmula de claridad (constancia de dirección y de velocidad) | Yo definí la idea; delegué la implementación | Pendiente de que yo explique por qué el círculo no llega a 1 |
