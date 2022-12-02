// Files to cache
const cacheKey = 'dlrjs-demo-' + Date.now().toString().substring(7);

const appShellFiles = [
  "https://cdn.jsdelivr.net/npm/keillion-dynamsoft-label-recognizer@0.20221025155807.0/dist/dlr.js",
  "https://cdn.jsdelivr.net/npm/keillion-dynamsoft-label-recognizer@0.20221025155807.0/dist/dlr-2.2.11.browser.worker.js",
  "https://cdn.jsdelivr.net/npm/keillion-dynamsoft-label-recognizer@0.20221025155807.0/dist/dlr-2.2.11.wasm.js",
  "https://cdn.jsdelivr.net/npm/keillion-dynamsoft-label-recognizer@0.20221025155807.0/dist/dlr-2.2.11.wasm",
  "https://cdn.jsdelivr.net/npm/keillion-dynamsoft-label-recognizer@0.20221025155807.0/dist/MRZ/MRZ.data",
  "https://cdn.jsdelivr.net/npm/keillion-dynamsoft-label-recognizer@0.20221025155807.0/dist/VIN/VIN.data"
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheKey).then(function(cache) {
      return cache.addAll(appShellFiles)
    }).then(function() {
      return self.skipWaiting();
    })
  )
})

self.addEventListener('activate', function(e) {
  var cacheDeletePromises = caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(name => {
      if (name !== cacheKey) {
        var deletePromise = caches.delete(name);
        return deletePromise;
      } else {
        return Promise.resolve();
      }
    }));
  });

  e.waitUntil(
    Promise.all([cacheDeletePromises]
    ).then(() => {
      return self.clients.claim();
    })
  )
})

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  )
})