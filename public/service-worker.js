const dlrVersion = "2.2.31";
const dcpVersion = "2.0.20";
const dlrCdn = `https://cdn.jsdelivr.net/npm/dynamsoft-label-recognizer@${dlrVersion}/dist/`;
const dcpCdn = `https://cdn.jsdelivr.net/npm/dynamsoft-code-parser@${dcpVersion}/dist/`;

const dlrFilesShouldCache = [
  `${dlrCdn}dlr.js`,
  `${dlrCdn}dlr-${dlrVersion}.wasm`,
  `${dlrCdn}dlr-${dlrVersion}.wasm.js`,
  `${dlrCdn}dlr-${dlrVersion}.browser.worker.js`,
  `${dlrCdn}MRZ/MRZ.data`,
  `${dlrCdn}VIN/VIN.data`,
];
const dcpFilesShouldCache = [
  `${dcpCdn}dcp.js`,
  `${dcpCdn}dcp-${dcpVersion}.wasm`,
  `${dcpCdn}specification/MRTD_Map.data`,
  `${dcpCdn}specification/MRTD_TD2_FRENCH_ID.data`,
  `${dcpCdn}specification/MRTD_TD2_ID.data`,
  `${dcpCdn}specification/MRTD_TD2_ID.data`,
  `${dcpCdn}specification/MRTD_TD3_PASSPORT.data`,
  `${dcpCdn}specification/MRTD_TD3_VISA.data`,
  `${dcpCdn}specification/VIN.data`,
];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
});

self.addEventListener('activate', async(e)=>{
  await self.clients.claim();

  const keys = await caches.keys();
  for(let key of keys){
    if(key !== dlrCdn && key !== dcpCdn){
      caches.delete(key);
    }
  }
});

// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers#service_worker_navigation_preload
self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  ev.respondWith((async()=>{

    let bInCacheList = false;
    let storeName = null;
    if(dlrFilesShouldCache.includes(req.url)){
      bInCacheList = true;
      storeName = dlrCdn;
    }else if(dcpFilesShouldCache.includes(req.url)){
      bInCacheList = true;
      storeName = dcpCdn;
    }

    if(bInCacheList){
      const responseFromCache = await caches.match(req);
      if (responseFromCache) { return responseFromCache; }

      const responseFromNetwork = await fetch(req);
      (await caches.open(storeName)).put(req, responseFromNetwork.clone());

      return responseFromNetwork;
    }
    else{ // not in cache list
      return fetch(req);
    }

  })());
});
