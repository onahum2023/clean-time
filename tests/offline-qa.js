// Real service-worker/cache/offline behavior, synthetic local state, no backend accounts.
async(page)=>{
 const fs=require('fs'),http=require('http'),path=require('path'),results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 const context=page.context();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await page.goto(origin);await page.evaluate(()=>localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',linksV:2,links:[],journal:[{id:1,text:'ישן',created:1}],inventory:{'2024-01-01':{summary:'ישן',answers:{old:'נשמר'}}},unknown:'נשמר',updatedAt:1})));
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.reload();
 const cache=await page.evaluate(async()=>{const keys=await caches.keys(),name=keys.find(x=>x.startsWith('clean-time-shell-v1-')),c=await caches.open(name);return {name,urls:(await c.keys()).map(x=>new URL(x.url).pathname)};});
 check(cache.urls.includes('/')&&cache.urls.includes('/assets/fonts/Assistant-Variable.ttf')&&cache.urls.includes('/assets/gong.wav'),'Shell/font/gong precached');
 check(cache.urls.every(x=>x==='/'||x.startsWith('/assets/')||/\.(png|webmanifest)$/.test(x)),'Only allowlisted static assets cached');
 await context.setOffline(true);await page.reload();check(await page.locator('#counter').isVisible(),'Previously loaded guest opens offline');
 check(await page.locator('#offlineStatus').isVisible()===await page.evaluate(()=>!navigator.onLine),'Connectivity copy follows browser-provided online state');
 await page.locator('#counter [data-go=planner]').click();await page.locator('#pInput').fill('תכנית ללא חיבור');await page.locator('#pAdd').click();
 await page.locator('[data-tab=counter]').click();await page.locator('#counter [data-go=gratitude]').click();await page.locator('#gInput').fill('תודה בלי חיבור');await page.locator('#gAdd').click();
 await page.locator('[data-tab=counter]').click();await page.locator('#counter [data-go=inventory]').click();await page.locator('#iSummary').fill('חשבון נפש בלי חיבור');
 await page.locator('[data-tab=counter]').click();await page.locator('#counter [data-go=journal]').click();await page.locator('#jNew').click();await page.locator('#jText').fill('יומן בלי חיבור');await page.locator('#jDone').click();
 await page.locator('[data-tab=tools]').click();await page.locator('#tools [data-go=bookmarks]').click();await page.locator('#bNew').click();await page.locator('#bTitle').fill('קישור בדיקה');await page.locator('#bUrl').fill('https://example.invalid');await page.locator('#bForm button[type=submit]').click();
 await page.reload();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')));
 check(saved.journal.some(x=>x.text==='יומן בלי חיבור')&&saved.gratitude.some(x=>x.text==='תודה בלי חיבור')&&Object.values(saved.plans).flat().some(x=>x.text==='תכנית ללא חיבור')&&Object.values(saved.inventory).some(x=>x.summary==='חשבון נפש בלי חיבור')&&saved.bookmarks.length===1,'Core guest tools save and reopen offline');
 check(saved.journal.some(x=>x.text==='ישן')&&saved.inventory['2024-01-01'].answers.old==='נשמר'&&saved.unknown==='נשמר','Old/unknown recovery data retained offline');
 const assets=await page.evaluate(async()=>Promise.all(['/assets/fonts/Assistant-Variable.ttf','/assets/gong.wav','/icon-192.png'].map(async u=>(await fetch(u)).ok)));check(assets.every(Boolean),'Local font/audio/icon fetch offline');
 check(await page.evaluate(async()=>{try{await fetch('/auth/v1/synthetic?code=SYNTHETIC');return false;}catch(e){return true;}}),'Auth/query requests do not fall back to cached shell');
 await context.setOffline(false);await page.waitForFunction(()=>document.getElementById('offlineStatus').hidden);check(true,'Online status resumes without clearing local data');
 const activeWorker=context.serviceWorkers()[0];
 await activeWorker.evaluate(()=>{self.qaOpen=caches.open.bind(caches);caches.open=async()=>{self.qaCacheFailures=(self.qaCacheFailures||0)+1;throw Error('synthetic cache denial');};});
 await page.reload();check(await activeWorker.evaluate(()=>self.qaCacheFailures>0)&&await page.locator('#counter').isVisible()&&await page.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')).unknown==='נשמר'),'Cache-storage failure falls back online without recovery loss');
 await activeWorker.evaluate(()=>{caches.open=self.qaOpen;delete self.qaOpen;delete self.qaCacheFailures;});
 // Update lifecycle with a bounded synthetic HTTP origin; no deployed/production server mutation.
 let version='2026.10.12.5';const root=process.cwd(),worker=fs.readFileSync('service-worker.js','utf8'),html=fs.readFileSync('index.html','utf8');
 const files=new Set(['service-worker.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','assets/backend-config.js','assets/sync-crypto.js','assets/appearance.js','assets/analytics.js','assets/recovery-dates.js','assets/fonts/Assistant-Variable.ttf','assets/gong.wav']);
 const server=http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1);res.setHeader('Cache-Control','no-store');
  if(!file||file==='index.html'){res.setHeader('Content-Type','text/html');res.end(html.replace(/const APP_VERSION='[^']+'/,"const APP_VERSION='"+version+"'"));return;}
  if(!files.has(file)){res.writeHead(404);res.end();return;}
  if(file.endsWith('.js'))res.setHeader('Content-Type','application/javascript');
  res.end(file==='service-worker.js'?worker.replace(/const VERSION='[^']+'/,"const VERSION='"+version+"'"):fs.readFileSync(path.join(root,file)));
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const updateOrigin='http://127.0.0.1:'+server.address().port,c=await context.browser().newContext();
 await c.route('**/*',r=>new URL(r.request().url()).origin===updateOrigin?r.continue():r.abort());
 try{
  let p=await c.newPage();await p.goto(updateOrigin);await p.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.active,{},{timeout:15000});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await p.evaluate(()=>{localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',linksV:2,links:[],unknown:'נשמר',updatedAt:1}));});await p.reload();
  await p.evaluate(async()=>{await caches.open('unrelated-synthetic-cache');});
  version='2026.10.12.6';await p.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update();});await p.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting);
  await p.locator('#updateNotice').waitFor({state:'visible'});
  check(await p.locator('#updateNotice').isVisible(),'Update waits visibly while current window stays open');
  check((await p.locator('#appVer').textContent()).includes('2026.10.12.5'),'Open app retains matching old shell during update');
  const workers=c.serviceWorkers();let next;for(const worker of workers)if(await worker.evaluate(()=>VERSION)==='2026.10.12.6')next=worker;
  await p.close();
  // Observe activation with no open app client, matching the user's close/reopen boundary.
  const deadline=Date.now()+10000;let activated=false;while(Date.now()<deadline){activated=await next.evaluate(()=>self.registration.active?.state==='activated'&&!self.registration.waiting);if(activated)break;await new Promise(r=>setTimeout(r,25));}
  check(activated,'New worker activates after all app windows close');
  p=await c.newPage();await p.goto(updateOrigin);await p.waitForFunction(()=>document.getElementById('appVer').textContent.includes('2026.10.12.6'));
  check(await p.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')).unknown==='נשמר'),'Safe reopen activates new shell without recovery loss');
  const keys=await p.evaluate(()=>caches.keys());check(keys.includes('clean-time-shell-v1-2026.10.12.6')&&!keys.includes('clean-time-shell-v1-2026.10.12.5')&&keys.includes('unrelated-synthetic-cache'),'Upgrade cleans only its obsolete shell cache');
  const urls=await p.evaluate(async()=>{const cache=await caches.open('clean-time-shell-v1-2026.10.12.6');return (await cache.keys()).map(r=>r.url);});check(!urls.some(u=>u.includes('?')||u.includes('supabase')||u.includes('auth')),'Cache contains no callback/auth/API URLs');
 }finally{await c.close();await new Promise(resolve=>server.close(resolve));}
 return {passed:results.length,results};
}
