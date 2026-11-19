# AGENTS.md

Instrucciones para agentes de IA que trabajan en este repositorio.

## Qué es

Sitio estático de repaso del curso Testing Inteligente. HTML, CSS y JavaScript sin build ni dependencias. GitHub Pages publica la rama `main` desde la raíz.

## Estructura

```text
index.html        portada: una tarjeta por eje
glosario.html     Fundamentos
playwright.html   Herramienta
skills.html       Proceso
specs.html        Artefactos (incluye la sección #journeys)
assets/
  styles.css      estilos comunes: variables, tipografía, fondo, barra superior y pie
  site.js         código común
  logo.png        favicon
  <página>.css    estilos propios de cada página
  <página>.js     datos y comportamiento de cada página
docs/decisions/   decisiones sobre el sitio, con su motivo
```

El nombre de cada archivo coincide con la etiqueta del menú: `glosario`, `playwright`, `skills`, `specs`.

## Código común: `assets/site.js`

Se carga en el `<head>` de todas las páginas, antes del script propio. Define:

- `<site-header>` y `<site-footer>`: custom elements sin Shadow DOM. Usan los estilos de `styles.css`. Tienen `display: contents`, para que la barra `sticky` funcione.
- `SITE_MENU`: el menú. El enlace de la página actual recibe `aria-current="page"` según la URL.
- `el(tag, attrs, children)`: crea nodos DOM. `attrs` admite `class`, `text`, `html`, `style`, `data` y cualquier atributo.
- `revealOnScroll(threshold)`: animación de entrada de `.reveal`. Llámala al final del script de la página, después de crear los nodos.

## Reglas técnicas

- Usa solo `<script>` clásicos. No uses módulos ES: fallan al abrir la página desde `file://`.
- Los scripts comparten el ámbito global. No declares en una página nombres que ya existen en `site.js`. Si unes el código de dos páginas, aísla una parte en una función (ver `journeyDemo()` en `assets/specs.js`).
- Si unes el CSS de dos páginas, limita los selectores a la sección (ver `#journeys` en `assets/specs.css`). Las dos páginas usaban `.btn`.
- Colores de familia en `styles.css`: `--spec` (construye), `--test` (prueba), `--bugs` (juzga), `--gate` (pausa humana). Tienen significado: no los cambies por motivos de estilo.

## Estilo visual

El aspecto del sitio está copiado de la web del autor, <https://albertobasalo.dev>, para que los dos sitios se reconozcan como de la misma persona. Solo se usa el **tema oscuro**.

Qué se copió y dónde está:

| Elemento | Origen en albertobasalo.dev | Aquí |
| --- | --- | --- |
| Tipografía | Google Fonts: Roboto (texto), Audiowide (títulos), JetBrains Mono (código) | `@import` y variables `--sans`, `--display`, `--mono` en `styles.css` |
| Fondo | Degradado «mesh» oscuro (`--ab-mesh-dark`) y capa de ruido SVG al 3 % | `--mesh-dark` en `body` y `body::before` en `styles.css` |
| Colores de marca | Azul `#3b82f6` y verde `#22c55e` | Variables `--ab-*` en `styles.css` |
| Barra superior | Panel de cristal (`--ab-glass`, desenfoque) y logo con degradado azul → verde y brillo | `.topbar`, `.topbar::before` y `.topbar .brand` |
| Pie | Línea superior azul y tarjetas de cristal | `footer` y `.f-link` en `styles.css` |
| Favicon | `/logo_2.png` | Copia local en `assets/logo.png` |

Reglas:

- Los colores de marca (`--ab-*`) solo van en la barra superior y el pie. El contenido usa los colores de familia.
- Audiowide solo tiene peso 400. No le pongas negrita: el navegador la deforma.
- No añadas el tema claro sin pedirlo.
- Para actualizar el estilo, consulta la web del autor. Su CSS está en el `<link rel="stylesheet">` de su página principal y usa Pico CSS con variables propias `--ab-*`. Copia los valores, no el archivo completo.

## Contenido

- Escribe en español.
- Textos breves. Una idea por frase. Evita el relleno y el tono de IA.
- Definiciones del glosario: estilo STE (ASD-STE100) adaptado al español. Frases cortas, voz activa, palabras simples.
- No cambies los datos del caso práctico (specs S1–S4, requisitos EARS, escenarios, códigos E1–E8) sin pedirlo.
- Usa el mismo término en todo el sitio. Si dudas, consulta `assets/glosario.js`.

## Cambios habituales

### Añadir una página

1. Copia una página existente: `<head>` (favicon, `styles.css`, `site.js`), `<site-header>` y `<site-footer>`.
2. Crea `assets/<página>.css` y `assets/<página>.js` si los necesitas.
3. Añade la página a `SITE_MENU` en `assets/site.js`.
4. Añade una tarjeta en `index.html` y una fila en la tabla de `README.md`.

### Renombrar o borrar una página

1. Usa `git mv` o `git rm`.
2. Busca el nombre antiguo en todo el proyecto: menú, portada, `assets/glosario.js` (`PAGES` y `page:`), otras páginas y `README.md`. No debe quedar ninguna referencia.
3. Avisa al usuario: la URL publicada antigua deja de funcionar.

## Comprobar

- Sintaxis de los scripts: `node --check assets/<archivo>.js`.
- Abre las páginas en el navegador. Comprueba que la barra se queda fija, que el enlace actual aparece resaltado y que no hay errores en la consola.

## Decisiones

Si el usuario pide pensar o hacer un brainstorm, no implementes. Guarda el resultado en `docs/decisions/<tema>.md`, con cada decisión, su motivo y las preguntas abiertas.
