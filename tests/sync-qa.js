// Local-only SDK mock: conflict choice, magic-link UI, offline retry, sign-out.
async(page)=>{
 const origin='http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const context=await page.context().browser().newContext();
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await context.addInitScript(key=>{
  window.confirm=()=>true;window.qaLoggedIn=false;window.qaOnline=true;window.qaUploads=[];window.qaEmails=[];
  Object.defineProperty(navigator,'onLine',{get:()=>window.qaOnline});
  localStorage.setItem(key,JSON.stringify({date:'2025-01-01',from:'אחר',inventory:{'2025-02-10':{summary:'מקומי'}},updatedAt:10}));
  localStorage.removeItem('cleantime-he-auth');localStorage.removeItem('cleantime-he-sync');
  // Remote has ONLY inventory: it must still be recognized as existing user data.
  window.qaRemote={inventory:{'2025-02-10':{summary:'ענן בלבד'}},updatedAt:20};
  const client={auth:{onAuthStateChange(cb){window.qaAuthCallback=cb;},getSession:async()=>({data:{session:window.qaLoggedIn?{user:{id:'mock-user',email:'qa@example.invalid'}}:null}}),signInWithOtp:async args=>{window.qaEmails.push(args);return {};},signOut:async()=>{window.qaLoggedIn=false;return {};}},from(){return {select(){return {eq(){return {maybeSingle:async()=>({data:{data:window.qaRemote,updated_at:new Date(window.qaRemote.updatedAt).toISOString()}})}}}},upsert:async row=>{window.qaUploads.push(row);window.qaRemote=row.data;return {};}}}};
  window.supabase={createClient:()=>client};
  const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
 },key);
 const p=await context.newPage();await p.goto(origin);await p.locator('#openSettings').click();await p.locator('#createAccount').click();await p.locator('#lEmail').fill('qa@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaEmails.length===1);
 check(await p.evaluate(()=>window.qaEmails.length===1&&window.qaEmails[0].options.emailRedirectTo===location.origin),'Magic-link UI invokes existing SDK with current-origin redirect (mock only)');
 await p.evaluate(()=>{window.qaLoggedIn=true;window.qaAuthCallback('SIGNED_IN',{user:{id:'mock-user',email:'qa@example.invalid'}});});
 await p.waitForTimeout(300);
 check(await p.locator('#ask').isVisible(),'First sign-in recognizes inventory-only cloud data and asks before replacing local data');
 await p.locator('#askB').getByRole('button',{name:'לטעון את הנתונים מהענן'}).click();await p.waitForTimeout(200);
 check(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).inventory['2025-02-10'].summary==='ענן בלבד',key),'Explicit cloud conflict choice loads daily inventory');
 check(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).gratitude.length===0&&typeof JSON.parse(localStorage.getItem(k)).plans==='object',key),'Sparse old cloud row normalizes missing collections');
 await p.locator('#openSettings').click();await p.locator('#sDate').fill('2025-01-01');await p.locator('#saveSettings').click();
 await p.evaluate(()=>window.qaOnline=false);await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="inventory"]').click();await p.locator('#iSummary').fill('נכתב ללא חיבור');await p.waitForTimeout(2200);
 check(await p.evaluate(()=>window.qaUploads.length===0&&JSON.parse(localStorage.getItem('cleantime-he-sync')).dirty),'Offline registered edit is local and pending; no upload');
 await p.evaluate(()=>{window.qaOnline=true;window.dispatchEvent(new Event('online'));});await p.waitForTimeout(300);
 check(await p.evaluate(()=>window.qaUploads.length===1&&Object.values(window.qaUploads[0].data.inventory).some(e=>e.summary==='נכתב ללא חיבור')&&!JSON.parse(localStorage.getItem('cleantime-he-sync')).dirty),'Reconnect uploads pending inventory and clears dirty flag');
 await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#signOut').click();
 check(await p.locator('#onboarding').isVisible()&&await p.evaluate(k=>!localStorage.getItem(k)&&!localStorage.getItem('cleantime-he-sync'),key),'Existing sign-out returns to onboarding and clears local account state');
 check(await p.evaluate(()=>Object.values(window.qaRemote.inventory).some(e=>e.summary==='נכתב ללא חיבור')),'Sign-out retains mock cloud copy');
 await context.close();return {passed:results.length,results};
}
