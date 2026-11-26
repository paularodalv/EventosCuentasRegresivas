# Portfolio de eventos para GitHub Pages

- **Portfolio** (`index.html`) con el diseño "Solar Pop": crema, naranja y rosa, con una vista previa en vivo de lo próximo.
- **Una página por evento** con sus actividades.
- **Cuentas regresivas** con fichas oscuras de borde luminoso, personalizables por evento y por actividad.
- Un único script (`assets/countdown.js`) para todos los contadores.

## Publicar en GitHub Pages

1. Crea un repositorio público y sube el contenido de esta carpeta a la raíz.
2. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. La dirección será `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Estructura

```
index.html                     Portfolio
assets/portfolio.css           Estilo del portfolio
assets/event-base.css          Estilo base de eventos y cuentas regresivas
assets/countdown.js            Lógica de todos los contadores
events/<evento>/index.html     Página del evento
events/<evento>/style.css      Tema propio del evento (colores, fuentes, ornamentos)
events/<evento>/<actividad>/index.html   Una cuenta regresiva
```

## Personalizar un evento (events/<evento>/style.css)

Cambia las variables `--ev-*` y todo el evento cambia a la vez:

| Variable | Qué controla |
|---|---|
| `--ev-bg-a`, `--ev-bg-b` | Degradado de fondo |
| `--ev-disc-a`, `--ev-disc-b` | Elipse central |
| `--ev-tile`, `--ev-edge-a`, `--ev-edge-b`, `--ev-glow` | Fichas: fondo, borde y resplandor |
| `--ev-accent`, `--ev-on-accent` | Sello, anillos, botón destacado y su texto |
| `--ev-font-display`, `--ev-font-body`, `--ev-font-num` | Tipografías (título, texto, números) |
| `--ev-title-transform`, `--ev-title-style`, `--ev-title-weight` | Mayúsculas, cursiva y peso del título |

Al final de `style.css` puedes añadir los **ornamentos propios** del evento (Aurora tiene cintas y un sol; Nexo tiene órbitas y un ecualizador).

## Personalizar cada cuenta regresiva

Cada página de cuenta regresiva tiene cinco bloques numerados con comentarios:

1. **Ornamentos** (`.cd-ornaments`): pega aquí SVG, formas o imágenes. Ayudantes: `.cd-ring` y `.cd-dot` con `style="--x:10%;--y:20%;--s:20px"`.
2. **Sello** (`.cd-sticker`): icono y palabra propios de esa actividad.
3. **Título** (`data-title`): la frase junto a los números ("Abre en", "Suena en"…).
4. **Fichas** (`data-shape`): `rounded` (por defecto), `soft`, `circle` o `square`.
5. **Texto, fecha y botón**: descripción, enlace y etiquetas. La fecha del evento y "Tu hora" se rellenan solas.

Atributos de `data-countdown`:
- `data-target`: fecha ISO con desplazamiento (ver abajo).
- `data-finished`: mensaje al llegar a cero.
- `data-finished-title`: sustituye al título al llegar a cero.

Cualquier elemento con `data-show-when="running"` solo se ve mientras corre la cuenta, y con `data-show-when="finished"` solo cuando termina (añádele `hidden`). Sirve, por ejemplo, para mostrar un botón "Ir al registro" cuando el registro abre.

## Añadir un evento

1. Duplica una carpeta de `events/` y cambia su nombre (sin espacios ni tildes).
2. Edita `style.css` (tema) y las páginas.
3. Añade una tarjeta en `index.html` (copia una `.work`) y cambia enlace, colores y fechas.
   Los elementos `data-soonest-source` alimentan la vista previa "Lo próximo" del portfolio.
4. Actualiza las cifras de la sección "En números" si quieres que sigan siendo ciertas.

## Cambiar una fecha y su GMT

En `data-target`: `2027-01-15T20:30:00+01:00`. El desplazamiento forma parte de la fecha y define el instante exacto: `+00:00` (UTC), `+01:00` (GMT+1), `-05:00` (GMT-5). No uses abreviaturas como CET o EST.

## Limitación de GitHub Pages

Solo aloja archivos estáticos. El contador calcula en el navegador contra un instante absoluto, así que todos cuentan hacia el mismo momento, pero el reloj del dispositivo puede estar desajustado. Si el contador controla algo importante (cerrar inscripciones, habilitar una actividad), valida también en un servidor: ocultar un botón en el navegador no lo protege. Las URL públicas son accesibles para quien las conozca.
