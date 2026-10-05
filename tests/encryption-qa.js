// Synthetic browser/Web Crypto QA. Generated secrets never leave runtime memory/output.
async(page)=>{
 const {activate}=require(process.cwd()+'/tests/qa-helpers.js');
 const origin='http://127.0.0.1:8765',KEY='cleantime-he-v1',CK='cleantime-he-crypto',MK='cleantime-he-sync';
 const results=[],check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const uid='00000000-0000-4000-8000-000000000009',email='crypto-qa@example.invalid';
 const full={name:'שם סינתטי סודי',date:'2024-02-03',time:'11:23',from:'סוג סינתטי',mode:2,color:'plum',linksV:2,
  journal:[{id:'j',text:'יומן סינתטי סודי',created:1,updated:2}],gratitude:[{id:'g',text:'תודה סינתטית סודית',ts:3}],
  inventory:{'2025-01-01':{summary:'סיכום סינתטי סודי',answers:{q:'תשובה סודית'}}},plans:{'2025-01-01':[{id:'p',text:'תכנית סודית',done:false}]},
  bookmarks:[{id:'b',title:'כותרת סודית',url:'https://example.invalid/private',note:'הערה סודית'}],links:[{id:'l',title:'משאב סודי',url:'https://example.invalid/secret'}],extra:{text:'תוכן עתידי סודי'},updatedAt:1750000000000};
 const cloudState=s=>{const d=structuredClone(s);delete d.mode;return d;};
 const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
 const same=(a,b)=>canonical(a)===canonical(b);
 async function scenario({local=full,row=null,material=null,registered=true,meta=true}={}){
  const c=await page.context().browser().newContext({viewport:{width:360,height:800}});
  let cloud=structuredClone(row),fail=false,casMiss=false,verifyFail=false,raceRow=null;
  const calls={uploads:[],reads:0,network:[],logs:[],errors:[]};
  await c.route('**/*',r=>{if(r.request().url().startsWith(origin+'/'))return r.continue();calls.network.push(r.request().url());return r.abort();});
  await c.exposeBinding('__cryptoCloud',async(_,op,payload)=>{
   if(op==='read'){calls.reads++;return verifyFail&&calls.uploads.length?{error:{code:'synthetic'}}:{data:structuredClone(cloud)};}
   if(op==='write'){
    if(fail)return {error:{code:'synthetic'}};
    if(raceRow){cloud=raceRow;raceRow=null;}
    if(casMiss||payload.previous!==null&&payload.previous!==cloud?.updated_at)return {data:[]};
    if(payload.previous===null&&cloud)return {error:{code:'23505'}};
    // Mirrors the required DB guard (real SQL execution remains a release check).
    if(cloud?.data?.ciphertext&&(!payload.row.data.ciphertext||Object.keys(payload.row.data).sort().join(',')!=='alg,ciphertext,iv,kdf,v,wrapIv,wrappedKey'||!same({w:cloud.data.wrappedKey,i:cloud.data.wrapIv,k:cloud.data.kdf},{w:payload.row.data.wrappedKey,i:payload.row.data.wrapIv,k:payload.row.data.kdf})))return {error:{code:'23514'}};
    calls.uploads.push(structuredClone(payload.row));cloud=structuredClone(payload.row);
    // Reorder like JSONB: application verification must not depend on object order.
    cloud.data=JSON.parse(canonical(cloud.data));cloud.updated_at=cloud.updated_at.replace('Z','+00:00');return {data:[{user_id:uid}]};
   }
  });
  await c.addInitScript(({local,material,registered,meta,KEY,CK,MK,uid,email})=>{
   if(!localStorage.getItem('qa-seeded')){
    if(local)localStorage.setItem(KEY,JSON.stringify(local));
    if(material)localStorage.setItem(CK,JSON.stringify(material));
    if(meta&&registered)localStorage.setItem(MK,JSON.stringify({uid,email,dirty:false}));
    if(registered)localStorage.setItem('cleantime-he-auth','synthetic-session');localStorage.setItem('qa-seeded','1');
   }
   window.confirm=()=>true;window.qaOnline=true;
   Object.defineProperty(navigator,'onLine',{get:()=>window.qaOnline});
   const client={auth:{onAuthStateChange(cb){window.qaAuthCallback=cb;},getSession:async()=>({data:{session:localStorage.getItem('cleantime-he-auth')?{user:{id:uid,email}}:null}}),signInWithOtp:async()=>({}),signOut:async()=>({})},from(){return {
    select(){return {eq(){return {maybeSingle:()=>window.__cryptoCloud('read')}}};},
    update(row){let previous=null;return {eq(k,v){if(k==='updated_at')previous=v;return this;},select:()=>window.__cryptoCloud('write',{row,previous})};},
    insert:row=>({select:()=>window.__cryptoCloud('write',{row,previous:null})})
   };}};
   window.supabase={createClient:()=>client};
   const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
  },{local,material,registered,meta,KEY,CK,MK,uid,email});
  const p=await c.newPage();p.on('console',msg=>calls.logs.push(msg.text()));p.on('pageerror',e=>calls.errors.push(e.message));await p.goto(origin);
  if(registered)await p.waitForFunction(()=>!!document.getElementById('encryptionMsg').textContent||!document.getElementById('ask').hidden||/הגיבוי המוצפן עדיין לא הופעל|גיבוי מוצפן פעיל|מפתח שחזור נדרש/.test(document.getElementById('encryptionStatus').textContent));
  const plain=async()=>p.evaluate(async row=>{const m=JSON.parse(localStorage.getItem('cleantime-he-crypto'));return SyncCrypto.decrypt(row.data,await SyncCrypto.importDek(m.raw),m.uid,row.updated_at);},cloud);
  return {c,p,calls,cloud:()=>structuredClone(cloud),plain,setFail:v=>fail=v,setCas:v=>casMiss=v,setVerify:v=>verifyFail=v,setRace:v=>raceRow=v};
 }
 const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
 const stored=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),CK);
 const status=p=>p.locator('#encryptionStatus').innerText();
 const settle=async p=>{await p.waitForTimeout(350);};
 let s=await scenario({registered:false});
 check(s.calls.reads===0&&s.calls.network.length===0&&await stored(s.p)===null,'Guest: zero cloud/third-party access or key creation');
 check(same(await read(s.p),full),'Guest working copy unchanged');await s.c.close();
 s=await scenario();
 check(s.calls.uploads.length===0&&await stored(s.p)===null,'New account: no upload or stored key before setup');
 await s.p.locator('#makeRecoveryKey').click();await s.p.locator('#recoveryGenerated').waitFor();
 const recovery=await s.p.locator('#recoveryOutput').inputValue();
 check(await s.p.locator('#activateEncryption').isDisabled()&&s.calls.uploads.length===0,'Explicit saved-key acknowledgement required');
 check(await s.p.evaluate(()=>document.documentElement.scrollWidth<=360),'360px generated recovery key fits');
 await s.p.screenshot({path:'/private/tmp/clean-time-encryption-360.png',fullPage:true,mask:[s.p.locator('#recoveryOutput')],maskColor:'#e4dfd5'});
 check(await s.p.locator('#recoveryOutput').getAttribute('dir')==='ltr'&&(await s.p.locator('#recoveryGenerated').innerText()).includes('אינו סיסמת'),'LTR recovery key and passwordless explanation');
 await s.p.locator('#recoverySaved').check();await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
 check(s.calls.uploads.length===1&&s.cloud().data.v===1&&s.cloud().data.alg==='A256GCM','New account creates versioned AES-256-GCM envelope');
 check(s.cloud().data.kdf.name==='HKDF'&&s.cloud().data.kdf.hash==='SHA-256'&&s.cloud().data.kdf.info==='clean-time/v1/recovery-kek/A256GCM'&&!('iterations' in s.cloud().data.kdf),'HKDF profile has explicit KEK domain separation and no work factor');
 const plain=await s.plain();check(same(plain,cloudState(await read(s.p))),'Encrypted upload representation round trip restores identical whole state');
 check(Object.keys(s.cloud()).sort().join(',')==='data,updated_at,user_id'&&Object.keys(s.cloud().data).sort().join(',')==='alg,ciphertext,iv,kdf,v,wrapIv,wrappedKey','Cloud row contains only minimal sync/envelope metadata');
 const encoded=JSON.stringify(s.cloud());
 check(![full.name,full.date,full.time,full.from,full.journal[0].text,full.gratitude[0].text,full.bookmarks[0].url,full.bookmarks[0].note,full.links[0].url,full.extra.text,'journal','inventory','bookmarks'].some(text=>encoded.includes(text)),'No readable recovery content or field names in mocked uploaded row');
 const material=await stored(s.p),row=s.cloud();
 const oldClientResult=await s.p.evaluate(async row=>window.__cryptoCloud('write',{row:{...row,data:{...row.data,journal:[{text:'סינתטי שנוסף בלקוח ישן'}]}},previous:row.updated_at}),row);
 check(oldClientResult.error?.code==='23514'&&same(s.cloud(),row),'Old-client envelope plus plaintext fields rejected by modeled database guard');
 check(material.uid===uid&&material.confirmed&&!JSON.stringify(material).includes(recovery),'Device stores scoped DEK/wrapper, never recovery key');
 check(!encoded.includes(recovery)&&!encoded.includes(material.raw)&&!(await s.p.url()).includes(recovery),'No recovery key/DEK in cloud or URL');
 check(await s.p.locator('#recoveryOutput').inputValue()==='','Setup recovery key removed from DOM after acknowledgement');
 check(s.calls.logs.length===0&&s.calls.errors.length===0&&s.calls.network.length===0,'No secrets/SDK errors logged; no external requests');
 const reloadUploads=s.calls.uploads.length;await s.p.reload();await settle(s.p);
 check((await status(s.p)).includes('גיבוי מוצפן פעיל')&&s.calls.uploads.length===reloadUploads,'Trusted device reopens with cached key and no upload');
 await s.p.locator('#openSettings').click();await s.p.locator('#myAccount').click();await s.p.locator('#signOut').click();await s.p.locator('#onboarding').waitFor();
 check(await stored(s.p)===null&&await read(s.p)===null,'Sign-out clears local encryption material and working copy');
 check(same(s.cloud(),row),'Sign-out retains encrypted cloud copy');await s.c.close();
 // New device unlock must not touch either side before authentication of the envelope.
 s=await scenario({local:null,row,meta:false});
 check((await status(s.p)).includes('מפתח שחזור נדרש')&&s.calls.uploads.length===0&&await stored(s.p)===null,'Missing key: locked cloud and no upload');
 check(await s.p.evaluate(()=>document.documentElement.scrollWidth<=360),'360px recovery-key entry fits');
 const before=await read(s.p);
 await s.p.locator('#recoveryInput').fill(recovery.slice(0,-1)+(recovery.endsWith('0')?'1':'0'));
 await s.p.locator('#unlockRecovery').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('המפתח שגוי'));
 check(same(await read(s.p),before)&&same(s.cloud(),row)&&s.calls.uploads.length===0&&await stored(s.p)===null,'Wrong key: Hebrew error, local/cloud/cache unchanged');
 check(await s.p.locator('#recoveryInput').inputValue()==='','Entered recovery key cleared on failure');
 await s.p.locator('#recoveryInput').fill(recovery.toLowerCase().replace(/-/g,' '));await s.p.locator('#unlockRecovery').click();await s.p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
 check(same(cloudState(await read(s.p)),plain)&&s.calls.uploads.length===0,'Correct recovery key on new device decrypts and applies whole cloud state');
 check((await stored(s.p)).confirmed,'New device retains verified usable DEK');await s.c.close();
 // Pure Web Crypto integrity checks, using runtime-generated material.
 s=await scenario({row,material});
 const cryptoChecks=await s.p.evaluate(async({row,material,plain,recovery})=>{
  const key=await SyncCrypto.importDek(material.raw),t=row.updated_at;
  const a=await SyncCrypto.encrypt(plain,key,material,material.uid,t),b=await SyncCrypto.encrypt(plain,key,material,material.uid,t);
  async function rejected(fn){try{await fn();return false;}catch{return true;}}
  return [a.iv!==b.iv&&a.ciphertext!==b.ciphertext,
   await rejected(()=>SyncCrypto.decrypt({...row.data,ciphertext:row.data.ciphertext.slice(0,2)+'AA'+row.data.ciphertext.slice(4)},key,material.uid,t)),
   await rejected(()=>SyncCrypto.decrypt(row.data,key,'another-synthetic-account',t)),
   await rejected(()=>SyncCrypto.decrypt(row.data,key,material.uid,new Date(Date.parse(t)+1).toISOString())),
   await rejected(()=>SyncCrypto.decrypt({...row.data,v:2},key,material.uid,t)),
   await rejected(()=>SyncCrypto.decrypt({...row.data,kdf:{...row.data.kdf,iterations:1}},key,material.uid,t)),
   await rejected(()=>SyncCrypto.decrypt({...row.data,journal:'unexpected'},key,material.uid,t)),
   await rejected(()=>SyncCrypto.unlock({...row.data,kdf:{...row.data.kdf,info:'another-purpose'}},recovery,material.uid,t)),
   await rejected(()=>SyncCrypto.unlock({...row.data,kdf:{...row.data.kdf,hash:'SHA-512'}},recovery,material.uid,t)),
   await rejected(()=>SyncCrypto.unlock({...row.data,kdf:{name:'PBKDF2',hash:'SHA-256',salt:row.data.kdf.salt,iterations:600000}},recovery,material.uid,t)),
   await rejected(()=>SyncCrypto.unlock(row.data,recovery,'another-synthetic-account',t)),
   await rejected(()=>SyncCrypto.unlock({...row.data,kdf:{...row.data.kdf,salt:(row.data.kdf.salt.startsWith('A')?'B':'A')+row.data.kdf.salt.slice(1)}},recovery,material.uid,t)),
   await rejected(()=>SyncCrypto.encrypt(plain,key,{...material,kdf:{name:'PBKDF2',hash:'SHA-256',salt:material.kdf.salt,iterations:600000}},material.uid,t))];
 },{row,material,plain,recovery});
 ['Fresh random 96-bit IV on repeated encryption','Tampered ciphertext fails authentication','AAD binds account identity','AAD binds sync timestamp','Unknown version fails closed','Unsupported KDF parameters fail closed','Extra plaintext envelope fields rejected','Wrong HKDF purpose rejected','Unsupported HKDF hash rejected','Unreleased PBKDF2 profile rejected','KEK unwrap binds account identity','Changed HKDF salt fails unwrap authentication','Stale PBKDF2 device wrapper rejected before upload'].forEach((label,i)=>check(cryptoChecks[i],label));
 await s.c.close();
 // Both timestamp directions on existing encrypted accounts.
 for(const direction of ['local','remote']){
  const changed={...full,time:'13:45',updatedAt:Date.parse(row.updated_at)+1000};
  let newerRow=row;
  if(direction==='remote'){const prep=await scenario({row,material});newerRow=await prep.p.evaluate(async({material,changed,uid})=>{const state={...changed};delete state.mode;const t=new Date(state.updatedAt).toISOString();return {user_id:uid,updated_at:t,data:await SyncCrypto.encrypt(state,await SyncCrypto.importDek(material.raw),material,uid,t)};},{material,changed,uid});await prep.c.close();}
  s=await scenario({local:direction==='local'?changed:full,row:newerRow,material});await settle(s.p);
  check((await read(s.p)).time==='13:45'&&s.calls.uploads.length===(direction==='local'?1:0),direction+' newer: encrypted boundary preserves updatedAt winner');
  check(!('mode' in (await s.plain()))&&(await read(s.p)).mode===2,direction+' newer: mode remains device-only');await s.c.close();
 }
 // Setup failures must not create a cloud row or strand the local copy.
 s=await scenario();await s.p.evaluate(()=>{SyncCrypto.create=async()=>{throw new Error('Synthetic crypto failure');};});
 await s.p.locator('#makeRecoveryKey').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('לא הצלחנו ליצור'));
 check(s.calls.uploads.length===0&&s.cloud()===null&&same(await read(s.p),full)&&await stored(s.p)===null,'Key-generation failure leaves local state intact and no cloud/cache');await s.c.close();
 s=await scenario();await s.p.locator('#makeRecoveryKey').click();await s.p.locator('#recoveryGenerated').waitFor();
 await s.p.evaluate(()=>{window.qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='cleantime-he-crypto')throw new Error('Synthetic storage failure');return window.qaSetItem.call(this,k,v);};});
 await s.p.locator('#recoverySaved').check();await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('לא נשמר במכשיר'));
 check(s.calls.uploads.length===0&&s.cloud()===null&&same(await read(s.p),full)&&await stored(s.p)===null,'Local key-persistence failure blocks cloud migration');
 await s.p.evaluate(()=>{Storage.prototype.setItem=window.qaSetItem;});await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
 check(s.calls.uploads.length===1&&!!(await stored(s.p)),'Local storage recovery retries acknowledged key without losing content');await s.c.close();
 // Existing plaintext migration, including setup, write, verification and CAS failures.
 const legacy={user_id:uid,data:cloudState(full),updated_at:new Date(full.updatedAt).toISOString()};
 s=await scenario({row:legacy});
 check(s.calls.uploads.length===0&&same(s.cloud(),legacy)&&same(await read(s.p),full),'Legacy migration waits for acknowledgement; neither side destroyed');
 s.setFail(true);await s.p.locator('#makeRecoveryKey').click();await s.p.locator('#recoveryGenerated').waitFor();await s.p.locator('#recoverySaved').check();await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('לא הושלם'));
 check(same(s.cloud(),legacy)&&same({...await read(s.p),updatedAt:full.updatedAt},full),'Failed migration write preserves plaintext cloud and complete local content');
 check(!(await status(s.p)).includes('גיבוי מוצפן פעיל')&&(await stored(s.p))&&!JSON.parse(await s.p.evaluate(k=>localStorage.getItem(k),CK)).confirmed,'Failed migration retains retry material without marking active');
 s.setFail(false);await s.p.locator('#retryEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
 check(s.cloud().data.v===1&&same({...await s.plain(),updatedAt:full.updatedAt},cloudState(full)),'Retry migrates selected legacy state without content loss');
 const migrated=s.cloud(),migratedMaterial=await stored(s.p);
 // Failed deletion must not reset local content.
 s.setFail(true);const deletionBefore=await read(s.p);await s.p.locator('#accountDelete').click();await s.p.locator('#askB').getByRole('button',{name:'גם מהענן',exact:true}).click();await s.p.waitForFunction(()=>document.getElementById('accountMsg').textContent.includes('לא הושלמה'));
 check(same(await read(s.p),deletionBefore)&&same(s.cloud(),migrated),'Failed cloud deletion preserves local/encrypted cloud content');
 s.setFail(false);await s.p.locator('#accountDelete').click();await s.p.locator('#askB').getByRole('button',{name:'גם מהענן',exact:true}).click();await s.p.waitForFunction(()=>document.getElementById('accountMsg').textContent.includes('נמחקו'));
 check(s.cloud().data.v===1&&(await s.plain()).journal.length===0&&(await s.plain()).bookmarks.length===0&&(await read(s.p)).date==='','Cloud deletion writes verified encrypted empty state and clears local');await s.c.close();
 s=await scenario({row:legacy});s.setVerify(true);await s.p.locator('#makeRecoveryKey').click();await s.p.locator('#recoveryGenerated').waitFor();await s.p.locator('#recoverySaved').check();await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('לא הושלם'));
 check(!(await status(s.p)).includes('גיבוי מוצפן פעיל')&&s.cloud().data.v===1&&!!(await stored(s.p)),'Read-back failure: unconfirmed migration keeps local DEK/content for retry');s.setVerify(false);await s.p.locator('#retryEncryption').click();await settle(s.p);
 check((await status(s.p)).includes('גיבוי מוצפן פעיל')&&s.calls.uploads.length===1,'Read-back retry decrypts persisted envelope without second upload');await s.c.close();
 s=await scenario({row:legacy});s.setCas(true);await s.p.locator('#makeRecoveryKey').click();await s.p.locator('#recoveryGenerated').waitFor();await s.p.locator('#recoverySaved').check();await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('לא הושלם'));
 check(same(s.cloud(),legacy)&&s.calls.uploads.length===0,'Conditional migration rejection cannot clobber cloud');await s.c.close();
 s=await scenario({row:legacy});s.setRace(migrated);await s.p.locator('#makeRecoveryKey').click();await s.p.locator('#recoveryGenerated').waitFor();await s.p.locator('#recoverySaved').check();await s.p.locator('#activateEncryption').click();await s.p.waitForFunction(()=>document.getElementById('encryptionMsg').textContent.includes('לא הושלם'));await s.p.locator('#retryEncryption').click();await s.p.locator('#recoveryForm').waitFor();
 check(same(s.cloud(),migrated)&&s.calls.uploads.length===0,'Concurrent setup: winning envelope preserved and other device asks for its key');await s.c.close();
 for(const pick of ['local','cloud']){
  s=await scenario({row:migrated,material:migratedMaterial,meta:false,local:{...full,time:'15:00',updatedAt:Date.parse(migrated.updated_at)+10000}});
  await s.p.locator('#ask').waitFor();check(s.calls.uploads.length===0,'Encrypted first sign-in '+pick+': explicit conflict before writes');
  await s.p.locator('#askB').getByRole('button',{name:pick==='local'?'לשמור את הנתונים מהמכשיר הזה':'לטעון את הנתונים מהענן'}).click();await settle(s.p);
  check((await read(s.p)).time===(pick==='local'?'15:00':full.time),'Encrypted explicit '+pick+' choice retained');await s.c.close();
 }
 const downgrade={...legacy,data:{...legacy.data,time:'23:59',updatedAt:Date.parse(migrated.updated_at)+10000},updated_at:new Date(Date.parse(migrated.updated_at)+10000).toISOString()};
 s=await scenario({row:downgrade,material:migratedMaterial});await settle(s.p);
 check(s.calls.uploads.length===0&&same(s.cloud(),downgrade)&&(await read(s.p)).time===full.time&&!(await status(s.p)).includes('גיבוי מוצפן פעיל'),'Trusted cache refuses plaintext downgrade on reopening');await s.c.close();
 s=await scenario({row:migrated,material:{...migratedMaterial,uid:'other-account'}});
 check((await status(s.p)).includes('מפתח שחזור נדרש')&&s.calls.uploads.length===0,'Keys from another account are ignored');await s.c.close();
 check(require('node:fs').readFileSync('index.html','utf8').includes('אינו קריא מתוך Supabase בלבד')&&!require('node:fs').readFileSync('index.html','utf8').includes('אינה יכולה לקרוא'),'Privacy copy limits guarantee to stored cloud copy');
 check(!/type=["']password|signInWithPassword|resetPasswordForEmail|updateUser\(/.test(require('node:fs').readFileSync('index.html','utf8')),'No password input/login/reset introduced');
 return {passed:results.length,results};
}
