// Local Web Crypto timings only. Generated secrets stay inside the browser.
// Run from the repository root with a localhost server on port 8765.
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext();
  await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8765/')?r.continue():r.abort());
  const page=await context.newPage();await page.goto('http://127.0.0.1:8765');
  const timings=await page.evaluate(async()=>{
   const uid='synthetic-perf-account',made=await SyncCrypto.create(uid);
   const raw=crypto.getRandomValues(new Uint8Array(32)),salt=crypto.getRandomValues(new Uint8Array(16));
   const hkdfBase=await crypto.subtle.importKey('raw',raw,'HKDF',false,['deriveKey']);
   const oldBase=await crypto.subtle.importKey('raw',raw,'PBKDF2',false,['deriveKey']);
   const hkdf=()=>crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt,info:new TextEncoder().encode(JSON.stringify([made.material.kdf.info,uid]))},hkdfBase,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
   const old=()=>crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},oldBase,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
   const state={updatedAt:1750000000000,journal:[{id:'synthetic',text:'synthetic '.repeat(3000)}]},t=new Date(state.updatedAt).toISOString();
   const envelope=await SyncCrypto.encrypt(state,made.key,made.material,uid,t);
   async function measure(fn,n){
    for(let i=0;i<3;i++)await fn();
    const samples=[];for(let i=0;i<n;i++){const start=performance.now();await fn();samples.push(performance.now()-start);}
    samples.sort((a,b)=>a-b);
    return {samples:n,medianMs:Number(samples[Math.floor(n/2)].toFixed(3)),p95Ms:Number(samples[Math.ceil(n*.95)-1].toFixed(3))};
   }
   return {platform:navigator.platform,payloadBytes:new TextEncoder().encode(JSON.stringify(state)).length,
    hkdfDerive:await measure(hkdf,100),oldPbkdf2Derive:await measure(old,10),
    hkdfFullUnlock:await measure(()=>SyncCrypto.unlock(envelope,made.recovery,uid,t),50)};
  });
  console.log(JSON.stringify({browser:browser.version(),...timings},null,2));
 }finally{await browser.close();}
})().catch(()=>{console.error('Local crypto performance run failed');process.exitCode=1;});
