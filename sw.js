/* DeporZone PWA - soporte online/offline */
const CACHE = "deporzone-v8";
const JQUERY_URL = "https://code.jquery.com/jquery-3.7.1.min.js";
const PURIFY_URL = "https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js";
const CDN_LIBS = [JQUERY_URL, PURIFY_URL];
const ASSETS = [
    "./", "index.html", "styles.css", "script.js", "manifest.json",
    "data/canchas.json", "images/futsal.svg", "images/wally.svg",
    "images/voley.svg", "images/basquet.svg", "images/tenis.svg",
    "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
    "images/cancha-01-futsal-premium.jpg", "images/cancha-02-futsal-norte.jpg", "images/cancha-03-futsal-central.jpg", "images/cancha-04-wally-pro.jpg", "images/cancha-05-wally-sur.jpg", "images/cancha-06-wally-arena.jpg", "images/cancha-07-voley-arena.jpg", "images/cancha-08-basquet-central.jpg", "images/cancha-09-basquet-norte.jpg", "images/cancha-10-basquet-premium.jpg", "images/cancha-11-tenis-club.jpg", "images/cancha-12-tenis-norte.jpg", "images/cancha-13-tenis-premium.jpg", "images/cancha-14-voley-norte.jpg", "images/cancha-15-voley-premium.jpg", "images/cancha-16-wally-centro.jpg"
];

self.addEventListener("install", function (event) {
    event.waitUntil((async function () {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
        // Se guardan jQuery y DOMPurify para que la aplicación inicie (y sanee HTML) sin Internet.
        for (const url of CDN_LIBS) {
            try { await cache.add(new Request(url, { mode: "cors" })); }
            catch (error) { console.warn("No se pudo precargar:", url, error); }
        }
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", function (event) {
    event.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (key) { return key !== CACHE; })
            .map(function (key) { return caches.delete(key); }));
    }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);

    // Catálogo: intenta actualizar desde Internet y usa la copia local si no hay conexión.
    if (url.origin === self.location.origin && url.pathname.endsWith("canchas.json")) {
        event.respondWith(fetch(event.request).then(function (response) {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
            }
            return response;
        }).catch(function () { return caches.match(event.request); }));
        return;
    }

    // Navegación: intenta Internet y, si no está disponible, entrega la página guardada.
    if (event.request.mode === "navigate" && url.origin === self.location.origin) {
        event.respondWith(fetch(event.request).then(function (response) {
            if (response && response.ok) {
                const copy = response.clone();
                caches.open(CACHE).then(function (cache) { cache.put("index.html", copy); });
            }
            return response;
        }).catch(function () {
            return caches.match(event.request).then(function (cached) {
                return cached || caches.match("index.html") || caches.match("./");
            });
        }));
        return;
    }

    // Archivos de la aplicación y jQuery: caché primero para permitir el uso offline.
    const isAppAsset = url.origin === self.location.origin;
    const isJquery = CDN_LIBS.indexOf(url.href) !== -1;
    if (isAppAsset || isJquery) {
        event.respondWith(caches.match(event.request).then(function (cached) {
            if (cached) return cached;
            return fetch(event.request).then(function (response) {
                if (response.ok && (isAppAsset || isJquery)) {
                    const copy = response.clone();
                    caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
                }
                return response;
            });
        }));
    }
});
