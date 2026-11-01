// Only this version's static shell is cached. Recovery/Auth responses never enter CacheStorage.
const VERSION='2026.11.01.12';
const PREFIX='clean-time-shell-v1-',CACHE=PREFIX+VERSION;
const SHELL=['/','/manifest.webmanifest','/icon-192.png','/icon-512.png','/icon-maskable-512.png','/apple-touch-icon.png','/assets/backend-config.js','/assets/sync-crypto.js','/assets/messages.js','/assets/i18n.js','/assets/appearance.js','/assets/visual-theme.js','/assets/visual-system.css','/assets/welcome.css','/assets/analytics.js','/assets/recovery-dates.js','/assets/recovery-timers.js','/assets/inventory-content.js','/assets/inventory-output.js','/assets/fonts/Assistant-Variable.ttf','/assets/gong.wav'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.all(SHELL.map(async path=>{
  const response=await fetch(new Request(path,{cache:'reload',credentials:'same-origin',redirect:'error'}));
  if(!response.ok||response.type==='opaque')throw Error('Shell unavailable');
  if(path==='/'){
   const html=await response.clone().text();
   if(!html.includes('<html lang="he" dir="rtl">')||!html.includes("const APP_VERSION='"+VERSION+"'"))throw Error('Shell identity mismatch');
  }
  // Consume each response immediately so large font/audio streams cannot hold up queued fetches.
  await cache.put(path,response);
 }));
 // No skipWaiting: open windows retain their matching shell until safely closed.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.search)return;
 const path=url.pathname==='/index.html'?'/':url.pathname;
 if(!SHELL.includes(path))return;
 event.respondWith((async()=>{
  try{const cached=await (await caches.open(CACHE)).match(path);if(cached)return cached;}catch(e){}
  // Missing/unavailable storage falls back to the network without caching arbitrary content.
  return fetch(request);
 })());
});
