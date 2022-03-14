const timeStream = Date.now().toString().substring(7);
var cacheStorageKey = 'dlrjs-pwa';
 
var cacheList = [
  /* './index.html',
  './css/app.495e8a9a.css',
  './css/chunk-vendors.90d8d9a8.css',
  './js/app.e52c5acd.js',
  './js/chunk-vendors.8c3cb26d.js',
  './fonts/OpenSans-Regular.d7d5d458.ttf',
  './fonts/Oswald-Light.4be970a1.ttf',
  './fonts/Oswald-Regular.e1996192.ttf',
  './manifest.json',
  './img/dynamsoft_logo_orange.228ed393.png' */
];

// When the browser finishes parsing the sw file, the Serviceworker triggers the install event
// Trigger only once
self.addEventListener('install', function(e) {
  // debugger;
  // console.log('Cache event!')
  // Open a cache space and add related resources to the cache
  e.waitUntil(
    caches.open(cacheStorageKey).then(function(cache) {
      // console.log('Adding to Cache:', cacheList)
      return cache.addAll(cacheList)
    }).then(function() {
      // console.log('install event open cache ' + cacheStorageKey);
      // console.log('Skip waiting!')
      return self.skipWaiting();
    })
  )
})

// If the current browser does not have an active service worker or the active worker is uninstalled
self.addEventListener('activate', function(e) {
  // debugger;
  // console.log('Activate event');
  // console.log('Promise all', Promise, Promise.all);
  // active events usually do some of the work of releasing expired resources
  var cacheDeletePromises = caches.keys().then(cacheNames => {
    // console.log('cacheNames', cacheNames, cacheNames.map);
    return Promise.all(cacheNames.map(name => {
      if (name !== cacheStorageKey) { // If the key of the resource is different from that of the current cache key, the resource is released
        // console.log('caches.delete', caches.delete);
        var deletePromise = caches.delete(name);
        // console.log('cache delete result: ', deletePromise);
        return deletePromise;
      } else {
        return Promise.resolve();
      }
    }));
  });

  // console.log('cacheDeletePromises: ', cacheDeletePromises);
  e.waitUntil(
    Promise.all([cacheDeletePromises]
    ).then(() => {
      // console.log('activate event ' + cacheStorageKey);
      // console.log('Clients claims.')
      return self.clients.claim();
    })
  )
})

// Blocking network requests 
self.addEventListener('fetch', function(e) {
  // console.log('Fetch event ' + cacheStorageKey + ' :', e.request.url);
  e.respondWith( // First determine if the same resource is already in the cache
    caches.match(e.request).then(function(response) {
      if (response != null) { // If the resource is already in the cache, use it directly
        // Otherwise, use the FETCH API to request a new resource
        // console.log('Using cache for:', e.request.url)
        return response
      }
      // console.log('Fallback to fetch:', e.request.url)
      return fetch(e.request.url)
      // Dynamic cache section
    })
  )
})