# Estructura del sitio: cuatro ejes

Fecha: 2026-11-19 · Estado: implementado

## Contexto

El sitio tenía cinco páginas: glosario, buenas prácticas, skills, specs y journeys. Un journey no es un proceso distinto: es un caso de uso de las specs. Y «buenas prácticas» trata solo de la herramienta, Playwright.

Con cuatro páginas, el sitio cubre lo esencial del curso:

| Eje | Página | Qué responde |
| --- | --- | --- |
| Fundamentos | `glosario.html` | Qué significa cada término |
| Herramienta | `playwright.html` | Cómo escribir una buena prueba con Playwright |
| Proceso | `skills.html` | Qué hace cada pipeline y cada skill |
| Artefactos | `specs.html` | Cómo van de la spec a la prueba los artefactos, también en un journey |

## Decisiones

### A. Journeys dentro de specs

| # | Decisión | Motivo |
| --- | --- | --- |
| A1 | Juntar journeys en `specs.html`, como sección final con ancla `#journeys`. | Un journey no tiene artefactos propios. Usa `define-test` en modo journey y cita criterios que ya existen (`S3-R1`). Encaja con la idea de la página: de un fallo llegas a su requisito. |
| A2 | El título de la sección deja claro que un journey **no** es una spec. Propuesta: «Journeys: cuando el objetivo cruza varias specs». | Un journey no tiene `spec.md`. Dentro de «specs» hay riesgo de confusión. |
| A3 | Contenido: para qué sirve, tabla de diferencias (prueba de spec / journey), la demo del metro con «el cambio del compañero» y las reglas en lista con sus códigos (E1.5, E8.4, E8.5, E8.7, E8.8, E8.9). | La demo enseña la lección principal: todas las specs pasan y el journey falla, porque el fallo está entre dos specs. |
| A4 | Fuera: el código de ejemplo (`.feature` y `.test.ts` del journey) y la tabla «cubre / queda fuera». | La página specs ya es larga. La estructura de archivos ya se explica en specs. |
| A5 | Enlace en la entrada de `specs.html`: «¿El objetivo cruza varias specs? → Journeys» (`#journeys`). | Acceso directo sin una entrada en el menú. |
| A6 | Journeys sale del menú y de la portada. | Ya no es una página. |
| A7 | Borrar `journeys.html`, `assets/journeys.css` y `assets/journeys.js`, sin redirección. | Coherente con los renombrados de skills y specs. La URL antigua deja de funcionar. |

### B. Buenas prácticas pasa a ser playwright

| # | Decisión | Motivo |
| --- | --- | --- |
| B1 | Renombrar `practicas.html`, `assets/practicas.css` y `assets/practicas.js` a `playwright.*`, sin redirección. | Coherente con skills y specs: el nombre de la página es el tema. |
| B2 | En el menú, la etiqueta pasa de «Buenas prácticas» a «playwright», en monoespaciada como skills y specs. | Mismo estilo que las otras páginas de tema. |
| B3 | Título de la pestaña: `playwright · Testing Inteligente`. Etiqueta sobre el titular: `playwright`. | Igual que skills y specs. |
| B4 | La etiqueta «Glosario» del menú pasa a `glosario`, en minúscula y monoespaciada. | Las cuatro entradas del menú tienen el mismo estilo. |

### C. Portada en cuatro ejes

| # | Decisión | Motivo |
| --- | --- | --- |
| C1 | Sustituir las secciones «Referencia» y «Procesos» por los cuatro ejes: Fundamentos · Herramienta · Proceso · Artefactos. | Explica de un vistazo qué aporta cada página. |
| C2 | Cuatro tarjetas, una por página. Sin tarjeta de journeys. | Journeys está dentro de specs. |

## Notas para implementar

- `specs.js` y `journeys.js` declaran variables globales con nombres que pueden chocar. Aislar el código del journey (por ejemplo, en una función) al moverlo.
- Pasar a `assets/specs.css` solo el CSS que use la sección nueva.
- Actualizar enlaces:
  - Menú (`SITE_MENU` en `assets/site.js`): glosario · playwright · skills · specs, las cuatro en monoespaciada.
  - Glosario (`assets/glosario.js`): términos *Journey* y *test.step* → `specs.html#journeys`. Los enlaces a prácticas → `playwright.html`.
  - Portada: chips de prácticas (`practicas.html#locators`…) → `playwright.html#…`.
  - `README.md`: tabla de contenidos.
- Revisar la entrada y la `meta description` de `specs.html` para que mencionen los journeys.
- Buscar al final `practicas.html` y `journeys.html` en todo el proyecto: no debe quedar ninguna referencia.

## Preguntas abiertas

Ninguna. Resueltas:

- Menú: «Glosario» pasa a `glosario` (decisión B4).
- El eje de specs se llama «Artefactos», no «Materiales».
