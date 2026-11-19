# DeporZone La Paz — entrega PWA

## Ejecutar localmente

1. Descomprimir la carpeta `DEPORTZONEOFICIALL`.
2. Abrirla con Visual Studio Code y ejecutar `index.html` mediante Live Server, o publicarla en un servidor HTTPS.
3. No abrir con `file://`: Fetch API y Service Worker necesitan un servidor.
4. Visitar la página una primera vez con Internet para instalar y llenar la caché del Service Worker.
5. En Chrome, instalar desde el menú del navegador si aparece la opción **Instalar aplicación**.
6. Probar el modo offline desde DevTools → Network → Offline o desactivando la conexión del dispositivo.

## Publicar en GitHub Pages

1. Crear un repositorio y subir el contenido de esta carpeta (el `index.html` debe quedar en la raíz publicada).
2. En GitHub: Settings → Pages → Deploy from a branch.
3. Seleccionar la rama principal y la carpeta `/ (root)`; guardar.
4. Esperar la URL HTTPS y abrirla una vez con Internet.
5. Probar navegación, catálogo, reservas y modo offline.

## Pruebas recomendadas de la rúbrica

- Responsive: 360×800, 390×844, 768×1024 y 1024×768; también tablet en horizontal.
- Navegadores: Chrome, Brave y Opera.
- PWA: manifest, iconos, Service Worker, instalación y recarga sin conexión.
- Rendimiento: catálogo JSON por Fetch, imágenes `loading="lazy"` y `decoding="async"`, búsqueda con debounce.
- Seguridad: escape de texto/atributos, validación de URL de imágenes, formularios validados y renderizado de reservas con `.text()`.

## Alcance offline

El catálogo y los archivos de la aplicación se guardan en caché; las reservas se almacenan en `localStorage` del dispositivo. No existe sincronización entre dispositivos ni envío a un servidor: para eso se requiere backend/base de datos.

La publicación en GitHub Pages y las pruebas físicas en Chrome, Brave, Opera y distintos tamaños deben realizarse desde la cuenta/dispositivo del estudiante; no se pueden certificar desde este ZIP.

## Guía Unificada C3-A2 (Core Web Vitals, Service Worker, BEM y DOMPurify)

Implementado en este proyecto:

| Requisito de la guía | Dónde está |
|---|---|
| CSS BEM + control de CLS (`.tarjeta-ods__imagen`, `.tarjeta-ods__boton--destacado`) | `styles.css` (bloque final) y tarjetas generadas en `script.js` (`buildCard`) |
| CLS: `aspect-ratio` + `width`/`height` en imágenes, espacio reservado para el catálogo | `styles.css` (`.tarjeta-ods__imagen`, `.courts-grid`, `.catalog-status`, `.detalle-proyecto`) e `<img width height>` |
| Sin `!important` y sin estilos en línea | `styles.css` / `index.html` (el bloque de datos de empresa usa `.datos-empresa`) |
| DOMPurify 3.1.6 antes de usar `.html()` | `index.html` (script CDN) y `script.js` (`sanearHtml`, `renderizarDetalleSeguro`, panel `#detalleProyecto` del modal) |
| Registro del Service Worker (`./sw.js`) | `index.html` |
| Proxy offline (evento `fetch`, Cache Storage) | `sw.js` v6: precachea app, jQuery y DOMPurify |

### Checklist del sábado 21 de noviembre (puntos extra y sorteo)

1. **Prueba offline real:** abrir el sitio con Internet una vez → DevTools → Network → marcar **Offline** → recargar. El catálogo de canchas y la página principal deben cargar sin errores gracias a `sw.js`. En *Application → Service Workers* debe aparecer `deporzone-v6` como activado.
2. **Auditoría de CLS y BEM:** hacer scroll con el catálogo cargando (throttling *Slow 3G*): ninguna imagen debe mover el diseño. Buscar `!important` en `styles.css` (no debe existir) y revisar que las clases nuevas sigan BEM.
3. **Beneficios:** presentar ambos módulos completos y mantener activas las **2 balas** para las ruletas.
4. **Sanitización:** en `data/canchas.json` poner en `servicios` el texto `<img src=x onerror=alert(1)>`, abrir *Más información* y verificar que NO se ejecuta (DOMPurify elimina el atributo `onerror`).
