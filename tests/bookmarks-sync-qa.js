// Local-only SDK mock: conflict choice, magic-link UI, offline retry, sign-out.
async(page)=>{
 const {activate,adaptMock}=require(process.cwd()+'/tests/qa-helpers.js');
 const origin=(process.env.QA_BASE_URL||'http://127.0.0.1:8765'),key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const context=await page.context().browser().newContext();
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await context.addInitScript(key=>{
  window.confirm=()=>true;window.qaLoggedIn=false;window.qaOnline=true;window.qaUploads=[];window.qaEmails=[];
  Object.defineProperty(navigator,'onLine',{get:()=>window.qaOnline});
  localStorage.setItem(key,JSON.stringify({date:'2025-01-01',from:'אחר',bookmarks:[{id:'local',title:'מקומי',url:'https://example.invalid/local',note:'הערה מקומית'}],updatedAt:10}));
  localStorage.removeItem('cleantime-he-auth');localStorage.removeItem('cleantime-he-sync');
  // Remote has ONLY bookmarks: it must still be recognized as existing user data.
  window.qaRemote={bookmarks:[{id:'remote',title:'ענן בלבד',url:'https://example.invalid/remote',note:'הערה מהענן'}],updatedAt:20};
  const client={auth:{onAuthStateChange(cb){window.qaAuthCallback=cb;},getSession:async()=>({data:{session:window.qaLoggedIn?{user:{id:'mock-user',email:'qa@example.invalid'}}:null}}),signInWithOtp:async args=>{window.qaEmails.push(args);return {};},signOut:async()=>{window.qaLoggedIn=false;return {};}},from(){return {select(){return {eq(){return {maybeSingle:async()=>({data:{data:window.qaRemote,updated_at:(window.qaTimestamp||new Date(window.qaRemote.updatedAt).toISOString())}})}}}},upsert:async row=>{window.qaUploads.push(row);window.qaRemote=row.data;return {};}}}};
  window.supabase={createClient:()=>client};
  const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
 },key);
 await adaptMock(context);const p=await context.newPage();await p.goto(origin);await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#createAccount').click();await p.locator('#lEmail').fill('qa@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaEmails.length===1);
 check(await p.evaluate(()=>window.qaEmails.length===1&&window.qaEmails[0].options.emailRedirectTo===location.origin),'Magic-link UI invokes existing SDK with current-origin redirect (mock only)');
 await p.evaluate(()=>{window.qaLoggedIn=true;window.qaAuthCallback('SIGNED_IN',{user:{id:'mock-user',email:'qa@example.invalid'}});});
 await p.waitForTimeout(300);
 check(await p.locator('#ask').isVisible(),'First sign-in recognizes bookmark-only cloud data and asks before replacing local data');
 await p.locator('#askB').getByRole('button',{name:'לטעון את הנתונים מהענן'}).click();await p.waitForTimeout(200);
 check(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).bookmarks[0].note==='הערה מהענן',key),'Explicit cloud conflict choice loads bookmarks and notes');
 check(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).gratitude.length===0&&typeof JSON.parse(localStorage.getItem(k)).plans==='object',key),'Sparse old cloud row normalizes missing collections');
 await activate(p);await p.evaluate(()=>window.qaUploads=[]);
 await p.locator('#openSettings').click();await p.locator('#sDate').fill('2025-01-01');await p.locator('#saveSettings').click();
 await p.evaluate(()=>window.qaOnline=false);await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="bookmarks"]').click();await p.locator('#bNew').click();await p.locator('#bTitle').fill('נכתב ללא חיבור');await p.locator('#bUrl').fill('https://example.invalid/offline');await p.locator('#bNote').fill('הערה ללא חיבור');await p.locator('#bForm button[type=submit]').click();await p.waitForTimeout(2200);
 check(await p.evaluate(()=>window.qaUploads.length===0&&JSON.parse(localStorage.getItem('cleantime-he-sync')).dirty),'Offline registered edit is local and pending; no upload');
 await p.evaluate(()=>{window.qaOnline=true;window.dispatchEvent(new Event('online'));});await p.waitForTimeout(300);
 check(await p.evaluate(async()=>window.qaUploads.length===1&&(await qaPlain()).bookmarks.some(e=>e.title==='נכתב ללא חיבור'&&e.note==='הערה ללא חיבור')&&window.qaUploads[0].user_id==='mock-user'&&!('mode' in (await qaPlain()))&&!JSON.parse(localStorage.getItem('cleantime-he-sync')).dirty),'Reconnect uploads pending bookmarks and clears dirty flag');
 await p.evaluate(async()=>{const state={...(await qaPlain()),bookmarks:[{id:'newer',title:'עודכן במכשיר אחר',url:'https://example.invalid/newer',note:'סנכרון חדש'}],updatedAt:Date.now()+1};window.qaTimestamp=new Date(state.updatedAt).toISOString();const material=JSON.parse(localStorage.getItem('cleantime-he-crypto'));window.qaRemote=await SyncCrypto.encrypt(state,await SyncCrypto.importDek(material.raw),material,material.uid,window.qaTimestamp);window.dispatchEvent(new Event('focus'));});await p.waitForTimeout(300);
 check(await p.locator('#bList').innerText().then(t=>t.includes('סנכרון חדש')),'Newer remote bookmarks refresh the visible list');
 await p.locator('#bList button').filter({hasText:'עריכה'}).click();await p.locator('#bNote').fill('הערה ערוכה');await p.locator('#bForm button[type=submit]').click();await p.waitForTimeout(2200);
 check(await p.evaluate(async()=>{const d=await qaPlain();return d.bookmarks[0].note==='הערה ערוכה'&&d.bookmarks[0].id==='newer';}),'Registered bookmark edits sync without changing identity');
 await p.locator('#bList button').filter({hasText:'מחיקה'}).click();await p.waitForTimeout(2200);
 check(await p.evaluate(async()=>(await qaPlain()).bookmarks.length===0),'Bookmark deletion syncs through the existing account row');
 await p.locator('#bNew').click();await p.locator('#bTitle').fill('נכתב ללא חיבור');await p.locator('#bUrl').fill('https://example.invalid/kept');await p.locator('#bForm button[type=submit]').click();
 await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#signOut').click();
 check(await p.locator('#welcome').isVisible()&&await p.evaluate(k=>!localStorage.getItem(k)&&!localStorage.getItem('cleantime-he-sync'),key),'Existing sign-out returns to onboarding and clears local account state');
 check(await p.evaluate(()=>SyncCrypto.isEnvelope(window.qaRemote)),'Sign-out retains mock cloud copy');
 await context.close();return {passed:results.length,results};
}
