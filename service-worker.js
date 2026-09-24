const CACHE_NAME = "caxiense-controle-v1";

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

    event.respondWith(

        fetch(event.request)

            .then(function (response) {

                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then(function (cache) {

                        cache.put(
                            event.request,
                            copia
                        );

                    });

                return response;
            })

            .catch(function () {

                return caches.match(
                    event.request
                );

            })

    );

});