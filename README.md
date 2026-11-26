# Portfolio de eventos para GitHub Pages

Proyecto estático de ejemplo con:
- Una portada/portfolio con tarjetas.
- Una página independiente para cada evento.
- Páginas de cuenta regresiva para actividades, registro y final.
- Diseño propio por evento.
- Un único script reutilizable para los contadores.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub, por ejemplo `eventos-portfolio`.
2. Sube el contenido de esta carpeta a la raíz del repositorio.
3. En GitHub, abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda y espera a que GitHub Pages publique el sitio.

La dirección tendrá esta forma:
`https://TU-USUARIO.github.io/eventos-portfolio/`

## Añadir un evento

1. Duplica una carpeta dentro de `events/`.
2. Cambia el nombre de la carpeta por un identificador sin espacios ni tildes.
3. Personaliza `index.html` y `style.css` del evento.
4. Crea una carpeta por actividad, registro o final, cada una con su `index.html`.
5. Añade una tarjeta en el `index.html` principal que apunte a `events/TU-EVENTO/index.html`.

## Cambiar una fecha y su GMT

En cada página de cuenta regresiva, modifica `data-target`:

`data-target="2027-01-15T20:30:00+01:00"`

El desplazamiento `+01:00` forma parte de la fecha y define el instante exacto. Ejemplos:
- UTC/GMT: `+00:00`
- GMT+1: `+01:00`
- GMT+2: `+02:00`
- GMT-5: `-05:00`

No uses abreviaturas ambiguas como CET, EST o BST en la fecha ISO. Usa siempre un desplazamiento numérico.

## Limitación importante de GitHub Pages

GitHub Pages solo aloja archivos estáticos: no ejecuta Node.js ni código de servidor. El contador de este proyecto calcula el tiempo restante en el navegador contra un instante absoluto, por lo que todos los visitantes tienen el mismo objetivo y la misma cuenta teórica. Sin embargo, el reloj del dispositivo puede estar adelantado o atrasado.

Si necesitas sincronización estricta con un reloj de servidor, tendrás que añadir un servicio externo (por ejemplo, una función serverless) y consultar esa hora. Si el contador controla una acción importante —como cerrar inscripciones o habilitar una actividad— esa acción también debe validarse en el backend; ocultarla en el navegador no la protege.

## Diseño y privacidad de navegación

Los enlaces de cada actividad vuelven únicamente a la página de su propio evento. No hay enlaces entre eventos en sus páginas internas. Aun así, las URL de las páginas públicas son accesibles si alguien las conoce: GitHub Pages no proporciona protección de acceso por carpetas.
