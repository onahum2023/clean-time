// Active-user upgrade regression. All identity/session/recovery fixtures are synthetic.
// Run like the other browser QA suites against localhost. No live Supabase SDK/network.
async(page)=>{
 const {activate}=require(process.cwd()+'/tests/qa-helpers.js');
 const origin='http://127.0.0.1:8765',KEY='cleantime-he-v1',AUTH='cleantime-he-auth',META='cleantime-he-sync';
 const results=[],check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const clone=v=>JSON.parse(JSON.stringify(v));
 const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
 const same=(a,b)=>canonical(a)===canonical(b);
 const identity={id:'00000000-0000-4000-8000-000000000011',email:'active-upgrade@example.invalid'};
 const timestamp=1750000000000;
 const full={name:'משתמש סינתטי',date:'2024-01-15',time:'08:30',from:'אחר',color:'plum',mode:2,
  gratitude:[{id:'g1',text:'תודה סינתטית ישנה',ts:1736503200000},{id:'g2',text:'תודה סינתטית נוספת',ts:1736589600000,day:'2025-01-11'}],
  plans:{'2025-01-10':[{id:'p1',text:'משימה סינתטית',done:true}],'2025-01-11':[{id:'p2',text:'משימה נוספת',done:false}]},
  journal:[{id:'j1',text:'רשומת בדיקה בלבד',created:1736503200000,updated:1736503201000}],
  inventory:{'2025-01-10':{questionnaireVersion:'placeholder-v1',answers:{placeholder_1:'תשובה סינתטית'},summary:'סיכום בדיקה',created:1736503200000,updated:1736503201000}},
  bookmarks:[{id:'b1',title:'קישור בדיקה',url:'https://example.invalid/bookmark',note:'הערה סינתטית'}],
  links:[{id:1,title:'משאב בדיקה',url:'https://example.invalid/resource'},{id:'own',title:'קישור נוסף',url:'https://example.invalid/custom'}],linksV:2,
  retainedUnknown:{synthetic:true},updatedAt:timestamp};
 const cloudState=local=>{const copy=clone(local);delete copy.mode;return copy;};
 // Supabase session envelope, with inert test strings that never leave the mock.
 const session={access_token:'synthetic-access-only',refresh_token:'synthetic-refresh-only',token_type:'bearer',expires_in:3600,expires_at:4102444800,user:identity};
 async function scenario(local,remote){
  const c=await page.context().browser().newContext({viewport:{width:360,height:800}});
  const calls={reads:[],uploads:[],emails:0,signOut:0,delete:0,clientOptions:[],blocked:[],errors:[]};let cloud=clone(remote),cloudTimestamp=cloud?new Date(cloud.updatedAt).toISOString():null;
  await c.route('**/*',r=>{const url=r.request().url();if(url.startsWith(origin+'/')||url===origin)return r.continue();calls.blocked.push(url);return r.abort();});
  await c.exposeBinding('__upgradeCloud',async(source,op,payload)=>{
   if(op==='read'){calls.reads.push(payload);return {data:cloud?{data:clone(cloud),updated_at:cloudTimestamp}:null};}
   if(op==='upload'){calls.uploads.push(clone(payload));cloud=clone(payload.row.data);cloudTimestamp=payload.row.updated_at;return {data:[{user_id:identity.id}]};}
   if(op==='email'){calls.emails++;return {};}
   if(op==='signOut'){calls.signOut++;return {};}
   if(op==='delete'){calls.delete++;throw new Error('Unexpected cloud delete');}
   if(op==='client')calls.clientOptions.push(payload);
   return {};
  });
  await c.addInitScript(({KEY,AUTH,META,local,session,identity,timestamp})=>{
   // Seed once per context; never resurrect deleted state on refresh/reopen.
   if(!localStorage.getItem('qa-upgrade-seeded')){
    localStorage.setItem(KEY,JSON.stringify(local));localStorage.setItem(AUTH,JSON.stringify(session));
    localStorage.setItem(META,JSON.stringify({uid:identity.id,email:identity.email,lastSync:timestamp,dirty:false}));localStorage.setItem('qa-upgrade-seeded','1');
   }
   window.qaStorageWrites=[];window.qaStorageRemovals=[];window.qaConfirmations=[];window.qaForbiddenScreens=[];window.qaSessionReads=0;
   window.qaConfirmAnswer=false;window.confirm=text=>{window.qaConfirmations.push(text);return window.qaConfirmAnswer;};
   const set=Storage.prototype.setItem,remove=Storage.prototype.removeItem,clear=Storage.prototype.clear;
   Storage.prototype.setItem=function(key,value){if(this===localStorage)window.qaStorageWrites.push({key,value});return set.call(this,key,value);};
   Storage.prototype.removeItem=function(key){if(this===localStorage)window.qaStorageRemovals.push(key);return remove.call(this,key);};
   Storage.prototype.clear=function(){if(this===localStorage)window.qaStorageRemovals.push('*');return clear.call(this);};
   new MutationObserver(()=>{for(const id of ['onboarding','auth','ask']){const el=document.getElementById(id);if(el&&!el.hidden)window.qaForbiddenScreens.push(id);}}).observe(document,{subtree:true,attributes:true,attributeFilter:['hidden']});
   const getSession=()=>{window.qaSessionReads++;return JSON.parse(localStorage.getItem(AUTH)||'null');};
   const client={auth:{onAuthStateChange(cb){setTimeout(()=>cb('INITIAL_SESSION',getSession()),0);},getSession:async()=>({data:{session:getSession()}}),signInWithOtp:args=>window.__upgradeCloud('email',args),signOut:args=>window.__upgradeCloud('signOut',args)},
    from(table){return {select(columns){return {eq(field,id){return {maybeSingle:()=>window.__upgradeCloud('read',{table,columns,field,id})};}};},update:row=>({eq(){return this;},select:()=>window.__upgradeCloud('upload',{table,row,options:{conditional:true}})}),insert:row=>({select:()=>window.__upgradeCloud('upload',{table,row,options:{insert:true}})}),delete:()=>window.__upgradeCloud('delete',{table})};}};
   window.supabase={createClient:(url,key,options)=>{window.__upgradeCloud('client',options);return client;}};
   const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
  },{KEY,AUTH,META,local,session,identity,timestamp});
  const open=async()=>{const p=await c.newPage();p.on('pageerror',e=>calls.errors.push(e.message));await p.goto(origin);await settle(p);return p;};
  const p=await open();return {c,p,calls,cloud:()=>clone(cloud),plain:()=>p.evaluate(async({cloud,t})=>SyncCrypto.isEnvelope(cloud)?SyncCrypto.decrypt(cloud,await SyncCrypto.importDek(JSON.parse(localStorage.getItem('cleantime-he-crypto')).raw),JSON.parse(localStorage.getItem('cleantime-he-crypto')).uid,t):cloud,{cloud,t:cloudTimestamp}),open};
 }
 async function settle(p){await p.waitForFunction(()=>/גיבוי מוצפן פעיל|הגיבוי המוצפן עדיין לא הופעל/.test(document.getElementById('encryptionStatus').textContent));await p.waitForTimeout(50);}
 const read=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 async function protectedLoad(s,label){
  const {p,calls}=s;
  check(await p.locator('#counter').isVisible()||await p.locator('#account').isVisible(),label+': opens app or encryption setup without onboarding');
  check(!await p.locator('#onboarding').isVisible()&&!await p.locator('#auth').isVisible()&&!await p.locator('#ask').isVisible()&&await p.evaluate(()=>window.qaForbiddenScreens.length===0),label+': no onboarding, account flow or conflict transition');
  check(calls.emails===0&&calls.signOut===0&&calls.delete===0&&await p.evaluate(()=>window.qaConfirmations.length===0&&window.qaStorageRemovals.length===0),label+': no email, sign-out, deletion or local clearing');
  check(calls.reads.length>=1&&calls.reads.every(r=>r.table==='user_data'&&r.columns==='data,updated_at'&&r.field==='user_id'&&r.id===identity.id),label+': existing table/row scoped to authenticated user');
 }
 let s=await scenario(full,cloudState(full));await protectedLoad(s,'Identical active account');
 check(await s.p.evaluate(({KEY,full})=>localStorage.getItem(KEY)===JSON.stringify(full),{KEY,full}),'Identical state: recovery localStorage remains byte-for-byte intact');
 check(same(s.cloud(),cloudState(full))&&s.calls.uploads.length===0,'Identical state: cloud JSON unchanged and zero automatic uploads');
 check(await s.p.evaluate(key=>window.qaStorageWrites.every(w=>w.key===key),META),'Identical state: only normal sync metadata is written on first load');
 check(await s.p.evaluate(({AUTH,META,KEY,session,id})=>JSON.stringify(JSON.parse(localStorage.getItem(AUTH)))===JSON.stringify(session)&&JSON.parse(localStorage.getItem(META)).uid===id&&!!JSON.parse(localStorage.getItem(KEY)).date,{AUTH,META,KEY,session,id:identity.id}),'All existing storage keys and auth envelope remain readable');
 check(s.calls.clientOptions.every(o=>o.auth.storageKey===AUTH&&o.auth.persistSession&&o.auth.flowType==='implicit'),'Existing Supabase auth storage/config preserved');
 await s.p.locator('#openSettings').click();check(await s.p.locator('#myAccount').isVisible()&&!await s.p.locator('#createAccount').isVisible(),'Existing account recognized in settings without registration CTA');
 await s.p.locator('#myAccount').click();
 await s.p.goBack();await s.p.waitForFunction(()=>!document.getElementById('settings').hidden);
 check(await s.p.locator('#settings').isVisible(),'Registered My Account Back restores Settings');
 await s.p.goBack();await s.p.waitForFunction(()=>!document.getElementById('counter').hidden);
 check(await s.p.locator('#counter').isVisible(),'Registered Settings Back restores Today');
 await s.p.goForward();await s.p.waitForFunction(()=>!document.getElementById('settings').hidden);
 await s.p.goForward();await s.p.waitForFunction(()=>!document.getElementById('account').hidden);
 check(await s.p.locator('#account').isVisible(),'Registered Forward restores Settings and My Account');
 check(await s.p.locator('#accountName').innerText()===full.name&&await s.p.locator('#sEmail').innerText()===identity.email,'My Account shows existing name and authenticated email');
 check((await s.p.locator('#accountState').innerText()).includes('חשבון רשום')&&(await s.p.locator('#syncStatus').innerText()).length>0,'Existing account and sync status work normally');
 await activate(s.p);s.calls.uploads.length=0;
 // A normal recovery preference edit must preserve every recovery collection/unknown key.
 await s.p.locator('#account [data-go=settings]').click();await s.p.locator('#sTime').fill('09:45');await s.p.locator('#saveSettings').click();
 await s.p.waitForFunction(key=>!JSON.parse(localStorage.getItem(key)).dirty,META);await s.p.waitForTimeout(100);
 const edited=await read(s.p),expected={...clone(full),time:'09:45',updatedAt:edited.updatedAt};
 check(same(edited,expected)&&edited.updatedAt>timestamp,'Post-upgrade normal edit changes only chosen field and timestamp');
 check(s.calls.uploads.length===1&&same(await s.plain(),cloudState(expected)),'Post-upgrade edit syncs complete existing JSON without losing history');
 const upload=s.calls.uploads[0];
 check(upload.table==='user_data'&&upload.row.user_id===identity.id&&upload.options.conditional===true&&Object.keys(upload.row).sort().join(',')==='data,updated_at,user_id'&&upload.row.updated_at===new Date(edited.updatedAt).toISOString()&&!('mode' in (await s.plain()))&&upload.row.data.v===1,'Encrypted conditional upload keeps row shape and device-only mode');
 const beforeReload=s.calls.uploads.length;
 await s.p.reload();await settle(s.p);await protectedLoad(s,'Refresh');
 check(same(await read(s.p),expected)&&s.calls.uploads.length===beforeReload,'Refresh preserves edited data/session and performs no extra upload');
 // Stale bookkeeping email must never replace authenticated account identity.
 await s.p.evaluate(key=>{const m=JSON.parse(localStorage.getItem(key));m.email='stale-synthetic@example.invalid';localStorage.setItem(key,JSON.stringify(m));},META);
 await s.p.close();s.p=await s.open();await protectedLoad(s,'Reopen');
 check(same(await read(s.p),expected)&&s.calls.uploads.length===beforeReload,'Reopening in same browser context preserves session/data without upload');
 await s.p.locator('#openSettings').click();await s.p.locator('#myAccount').click();
 check(await s.p.locator('#sEmail').innerText()===identity.email,'Authenticated email overrides stale device bookkeeping');
 await s.p.locator('#signOut').click();
 check(s.calls.signOut===0&&await s.p.locator('#account').isVisible()&&await s.p.evaluate(()=>window.qaConfirmations.length===1),'Sign-out requires explicit confirmation; cancelling retains account');
 const cloudBeforeSignout=s.cloud();
 await s.p.evaluate(()=>window.qaConfirmAnswer=true);await s.p.locator('#signOut').click();await s.p.waitForFunction(()=>!document.getElementById('onboarding').hidden);
 check(s.calls.signOut===1&&await s.p.locator('#onboarding').isVisible()&&await s.p.evaluate(({KEY,AUTH,META})=>![KEY,AUTH,META].some(k=>localStorage.getItem(k)),{KEY,AUTH,META}),'Only user-confirmed sign-out clears device/session');
 check(same(s.cloud(),cloudBeforeSignout)&&s.calls.uploads.length===beforeReload&&s.calls.delete===0,'Explicit sign-out retains cloud data with no clearing/deletion');
 check(s.calls.errors.length===0&&s.calls.blocked.length===0,'Active-account upgrade performs no external requests or JavaScript errors');await s.c.close();
 const newerRemote={...cloudState(full),time:'10:15',updatedAt:timestamp+2000};
 s=await scenario(full,newerRemote);await protectedLoad(s,'Remote newer');
 check(same(await read(s.p),{...newerRemote,mode:full.mode})&&s.calls.uploads.length===0&&same(s.cloud(),newerRemote),'Remote newer: normal pull preserves all data and device mode without upload');
 check(await s.p.evaluate(key=>JSON.parse(localStorage.getItem(key)).dirty,META)&&(await s.p.locator('#syncStatus').innerText()).length>0,'Remote newer: pull preserves pending migration status');await s.c.close();
 const newerLocal={...clone(full),time:'11:15',updatedAt:timestamp+3000};
 s=await scenario(newerLocal,cloudState(full));await protectedLoad(s,'Local newer');
 check(s.calls.uploads.length===0&&same(s.cloud(),cloudState(full))&&same(await read(s.p),newerLocal),'Local newer: waits for key acknowledgement without changing either copy');await activate(s.p);check(s.calls.uploads.length===1&&same(await s.plain(),cloudState(await read(s.p))),'Local newer: encrypted migration preserves complete data');await s.c.close();
 const sparse={name:'בדיקה ותיקה',date:'2024-02-01',gratitude:[{id:99,text:'תודה סינתטית ותיקה',ts:1234}],plans:{'2024-02-01':[{id:1,text:'בדיקה',done:true}]},journal:[{id:3,text:'בדיקה ותיקה',created:1000,updated:2000}],links:[{id:88,title:'פרטי סינתטי',url:'https://example.invalid/legacy'}],legacyUnknown:{keep:'synthetic'},updatedAt:timestamp};
 s=await scenario(sparse,cloudState(sparse));await protectedLoad(s,'Sparse valid account');
 const normalized=await read(s.p);
 check(Object.entries(sparse).filter(([k])=>k!=='links').every(([k,v])=>same(normalized[k],v))&&normalized.links.some(l=>same(l,sparse.links[0])),'Sparse state: existing profile, history, IDs, timestamps and unknown fields preserved');
 check(normalized.linksV===2&&Array.isArray(normalized.bookmarks)&&normalized.bookmarks.length===0&&same(normalized.inventory,{})&&normalized.color==='teal'&&normalized.time==='','Sparse state: only already-supported defaults and links normalization added');
 check(s.calls.uploads.length===0&&same(s.cloud(),cloudState(sparse))&&normalized.updatedAt===timestamp,'Sparse state: additive local normalization does not bump timestamp or upload cloud');
 check(await s.p.evaluate(key=>window.qaStorageWrites.filter(w=>w.key!==key).every(w=>w.key==='cleantime-he-sync'),KEY),'Sparse state: writes are limited to legacy local normalization and sync bookkeeping');
 await s.p.locator('#openSettings').click();check(await s.p.locator('#sDate').inputValue()===sparse.date&&await s.p.locator('#myAccount').isVisible(),'Sparse registered state remains usable through recovery settings/My Account');
 await s.p.reload();await settle(s.p);check(same(await read(s.p),normalized)&&s.calls.uploads.length===0,'Sparse normalization is idempotent on refresh');await s.c.close();
 return {passed:results.length,results,network:'localhost only; mocked auth/cloud, no real account data'};
}
