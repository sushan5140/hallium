/* Hallium offline boundary: never cache learner, account, authenticated or API responses. */
const CACHE="hallium-public-offline-v1";
const FALLBACK="/offline";
const PUBLIC_ROUTES=new Set(["/","/demo","/creator-kit","/ambassadors","/community","/offline"]);
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(c=>c.add(FALLBACK)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("hallium-public-offline-")&&k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
 ]));
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||req.mode!=="navigate")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||!PUBLIC_ROUTES.has(url.pathname)||url.search)return;
 // Only the explicit offline shell is cached; public and private live pages remain network-only.
 event.respondWith(fetch(req).catch(()=>caches.match(FALLBACK).then(res=>res||Response.error())));
});
