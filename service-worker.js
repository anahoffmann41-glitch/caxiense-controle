const CACHE_NAME = "caxiense-controle-v2";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(ARQUIVOS);
            })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (chaves) {
                return Promise.all(
                    chaves
                        .filter(function (chave) {
                            return chave !== CACHE_NAME;
                        })
                        .map(function (chave) {
                            return caches.delete(chave);
                        })
                );
            })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (event) {

    // NÃO tenta colocar POST no cache.
    if (event.request.method !== "GET") {
        return;
    }

    // Não intercepta requisições externas, como Firebase.
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function (response) {

                if (!response || response.status !== 200) {
                    return response;
                }

                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then(function (cache) {
                        cache.put(event.request, copia);
                    })
                    .catch(function (erro) {
                        console.warn(
                            "Não foi possível atualizar o cache:",
                            erro
                        );
                    });

                return response;
            })
            .catch(function () {
                return caches.match(event.request);
            })
    );
});