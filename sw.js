/* =============================================================================
   SW.JS — Service Worker do PWA.
   Estratégia:
     - App shell (HTML/CSS/JS/manifest/ícones): cache-first (funciona offline).
     - Imagens estáticas: cache-first, guardadas conforme forem vistas.
     - JSON de dados (catálogo/galeria): network-first (pega a versão mais nova,
       cai no cache se estiver offline).
     - api.imgbb.com e wa.me: NUNCA são cacheados (sempre rede).
   Ao publicar mudanças, troque o número da versão em CACHE_VERSION para
   forçar a atualização no celular dos clientes.
   ============================================================================= */
const CACHE_VERSION = "acmer-v3";
const SHELL_CACHE = CACHE_VERSION + "-shell";
const IMG_CACHE = CACHE_VERSION + "-img";

// arquivos essenciais pré-cacheados na instalação (o "esqueleto" do app)
const SHELL = [
  "./",
  "./index.html",
  "./o-problema.html",
  "./como-funciona.html",
  "./produtos.html",
  "./galeria.html",
  "./orcamento.html",
  "./offline.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/config.js",
  "./js/effects.js",
  "./js/nav.js",
  "./js/tilt3d.js",
  "./js/plaque3d.js",
  "./js/calculator.js",
  "./js/catalog.js",
  "./js/gallery.js",
  "./js/form.js",
  "./js/main.js",
  "./data/catalogo.json",
  "./data/galeria.json",
  "./images/icons/icon-192.png",
  "./images/icons/icon-512.png",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function (c) {
      // addAll falha se um arquivo faltar; usamos individual pra ser tolerante
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () { /* ignora arquivo ausente */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf(CACHE_VERSION) !== 0) return caches.delete(k); // limpa versões antigas
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") return; // só cacheia GET
  const url = new URL(req.url);

  // nunca intercepta APIs externas dinâmicas
  if (url.hostname.indexOf("api.imgbb.com") !== -1 ||
      url.hostname.indexOf("wa.me") !== -1) {
    return; // deixa ir direto pra rede
  }

  // JSON de dados: network-first
  if (url.pathname.endsWith(".json")) {
    e.respondWith(
      fetch(req).then(function (res) {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  // imagens: cache-first
  if (req.destination === "image" || /\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          const copy = res.clone();
          caches.open(IMG_CACHE).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () { return caches.match("./images/icons/icon-192.png"); });
      })
    );
    return;
  }

  // app shell (HTML/CSS/JS): cache-first com fallback offline pra navegação
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        if (req.mode === "navigate") return caches.match("./offline.html");
      });
    })
  );
});
