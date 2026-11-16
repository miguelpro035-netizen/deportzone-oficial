/* DeporZone PWA - soporte online/offline */
const CACHE = "deporzone-v4";
const JQUERY_URL = "https://code.jquery.com/jquery-3.7.1.min.js";
const ASSETS = [
    "./", "index.html", "styles.css", "script.js", "manifest.json",
    "data/canchas.json", "images/futsal.svg", "images/wally.svg",
    "images/voley.svg", "images/basquet.svg", "images/tenis.svg",
    "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil((async function () {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
        // Se guarda jQuery para que la aplicación también pueda iniciar sin Internet.
        try { await cache.add(new Request(JQUERY_URL, { mode: "cors" })); }
        catch (error) { console.warn("No se pudo precargar jQuery:", error); }
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

    // Archivos de la aplicación y jQuery: caché primero para permitir el uso offline.
    const isAppAsset = url.origin === self.location.origin;
    const isJquery = url.href === JQUERY_URL;
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
