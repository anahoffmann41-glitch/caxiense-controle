const CACHE_NAME = "caxiense-controle-v3";

self.addEventListener("install", function (event) {
    console.log("Caxiense: novo Service Worker instalado.");
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (chaves) {
            return Promise.all(
                chaves.map(function (chave) {
                    return caches.delete(chave);
                })
            );
        }).then(function () {
            console.log("Caxiense: caches antigos removidos.");
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (event) {
    // Não intercepta nenhuma requisição.
    // O Firebase precisa funcionar normalmente.
    return;
});
