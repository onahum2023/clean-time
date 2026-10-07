// Synthetic localhost-only account journeys. SDK mocked; no email or cloud requests.
async(page)=>{
 const {activate,adaptMock}=require(process.cwd()+'/tests/qa-helpers.js');
 const origin=(process.env.QA_BASE_URL||'http://127.0.0.1:8765'),key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 async function scenario(local,remote){
  const c=await page.context().browser().newContext({viewport:{width:360,height:800}});
  await c.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await c.addInitScript(({key,local,remote})=>{
   if(local&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(local));
   window.confirm=()=>true;window.qaRemote=remote;window.qaUploads=[];window.qaEmails=[];window.qaUser=null;window.qaFail=false;
   const client={auth:{onAuthStateChange(cb){window.qaCallback=cb;},getSession:async()=>{if(location.hash.includes('access_token=synthetic'))window.qaUser={id:'synthetic',email:'qa@example.invalid'};return {data:{session:window.qaUser?{user:window.qaUser}:null}};},signInWithOtp:async args=>{if(window.qaFail)return {error:{code:'rate_limit'}};window.qaEmails.push(args);return {};},signOut:async()=>{window.qaUser=null;return {};}},from(){return {select(){return {eq(){return {maybeSingle:async()=>({data:window.qaRemote?{data:window.qaRemote,updated_at:(window.qaTimestamp||new Date(window.qaRemote.updatedAt).toISOString())}:null})}}}},upsert:async row=>{window.qaUploads.push(row);window.qaRemote=row.data;return {};}}}};
   window.supabase={createClient:()=>client};
   const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
  },{key,local,remote});
  await c.addInitScript(()=>{window.qaEntryFlash=[];new MutationObserver(()=>{if(location.hash.includes('access_token'))for(const id of ['welcome','onboarding']){const e=document.getElementById(id);if(e&&!e.hidden)window.qaEntryFlash.push(id);}}).observe(document,{subtree:true,attributes:true,attributeFilter:['hidden']});});
  await adaptMock(c);const p=await c.newPage();await p.goto(origin);return {c,p};
 }
 const login=async p=>{await p.locator('#lEmail').fill('qa@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaEmails.length===1);};
 const authenticate=async p=>{await p.evaluate(()=>{window.qaUser={id:'synthetic',email:'qa@example.invalid'};window.qaCallback('SIGNED_IN',{user:window.qaUser});});};
 const fit=async p=>check(await p.evaluate(()=>document.documentElement.scrollWidth<=360),'360px layout: '+await p.locator('section:visible h2').first().innerText());
 let {c,p}=await scenario(null,null);
 await p.locator('#welcomeStart').click();
 check(await p.locator('#guestForm input[type=email]').count()===0,'Guest onboarding has no email');await fit(p);
 await p.locator('#oDate').fill('2025-01-01');await p.locator('#oFrom').selectOption('אחר');await p.locator('#guestForm button').click();
 check(await p.locator('#counter').isVisible(),'Guest onboarding enters fully usable app');await c.close();
 ({c,p}=await scenario({color:'olive'},null));await p.locator('#onboardingLogin').click();await p.locator('#authCreate').click();await fit(p);
 check(await p.locator('#aSwatches').isVisible()&&await p.locator('#aSwatches').getAttribute('role')==='radiogroup'&&await p.locator('#aSwatches').getAttribute('aria-label')==='צבע','Registered onboarding displays accessible color swatches');
 check(await p.locator('#aColor, #authProfile select[id*=Color]').count()===0,'Registered onboarding color dropdown is gone');
 check(await p.locator('#aSwatches [role=radio]').evaluateAll(buttons=>buttons.length===6&&buttons.map(b=>b.getAttribute('aria-label')).join(',')==='טורקיז,כחול,אינדיגו,שזיף,זית,ורד'&&buttons.every(b=>b.type==='button'&&b.className==='swatch')&&buttons.filter(b=>b.getAttribute('aria-checked')==='true').length===1)&&await p.locator('#aSwatches [aria-checked=true]').getAttribute('aria-label')==='זית','Six shared swatches retain order and default to local saved color');
 await p.locator('#aName').fill('בדיקה');await p.locator('#aDate').fill('2025-01-01');await p.locator('#aTime').fill('12:30');await p.locator('#aFrom').selectOption('סמים');await p.locator('#aSwatches').getByRole('radio',{name:'ורד',exact:true}).click();await login(p);
 check(await p.locator('#aSwatches [aria-checked=true]').getAttribute('aria-label')==='ורד'&&await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).color==='rose',key),'Selected swatch ring and persisted registered profile use chosen color');
 check(await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));return s.name==='בדיקה'&&s.time==='12:30'&&s.color==='rose'&&window.qaUploads.length===0;},key),'Account creation persists complete profile, sends link without premature upload');
 await p.goto(origin+'/#access_token=synthetic');await p.reload();await activate(p);await p.waitForFunction(()=>window.qaUploads.length===1);await p.waitForTimeout(100);
 check(await p.evaluate(()=>!location.hash),'Magic-link return cleans URL and restores persisted creation profile');
 check(await p.evaluate(()=>window.qaEntryFlash.length===0),'Magic-link callback takes precedence without Welcome/setup flash');
 check(await p.locator('#account').isVisible(),'Authenticated new account shows encrypted backup status');
 await p.locator('#openSettings').click();check(await p.locator('#myAccount').isVisible()&&!await p.locator('#signOut').isVisible()&&!await p.locator('#sName').isVisible(),'Registered settings separates identity and account controls');
 await p.locator('#myAccount').click();await fit(p);await p.screenshot({path:'/private/tmp/clean-time-account-360.png',fullPage:true});
 check(await p.locator('#accountName').innerText()==='בדיקה'&&await p.locator('#sEmail').innerText()==='qa@example.invalid'&&(await p.locator('#syncStatus').innerText()).includes('סנכרון אחרון'),'My Account displays name, email, state and last sync');
 await p.locator('#signOut').click();check(await p.locator('#welcome').isVisible()&&await p.evaluate(k=>!localStorage.getItem(k)&&!localStorage.getItem('cleantime-he-sync')&&!localStorage.getItem('cleantime-he-crypto')&&window.qaRemote.v===1,key),'Sign out clears device and retains cloud');await c.close();
 ({c,p}=await scenario(null,{date:'2024-01-01',from:'אחר',updatedAt:20}));await p.locator('#onboardingLogin').click();await fit(p);
 check(!await p.locator('#authProfile').isVisible()&&!await p.locator('#aName').isVisible(),'Returning user sees email-only login');await login(p);await authenticate(p);await p.waitForTimeout(300);
 check(await p.locator('#account').isVisible()&&await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).date==='2024-01-01'&&window.qaUploads.length===0,key),'Legacy-device login restores cloud and awaits acknowledged encryption without upload');await c.close();
 const local={date:'2025-01-01',gratitude:[{id:1,text:'סינתטי',ts:1}],updatedAt:10};
 for(const cloud of [null,{date:'2024-01-01',updatedAt:Date.now()+86400000}]){
  ({c,p}=await scenario(local,cloud));await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#createAccount').click();
  check(!await p.locator('#authProfile').isVisible()&&await p.locator('#aName').isVisible(),'Guest conversion requests email and missing optional name only');
  await p.locator('#aName').fill('בדיקה');await login(p);await authenticate(p);await p.waitForTimeout(200);
  if(cloud){check(await p.locator('#ask').isVisible()&&await p.evaluate(()=>window.qaUploads.length===0),'Existing cloud requires explicit choice before writes');await fit(p);await p.locator('#askB').getByRole('button',{name:'לשמור את הנתונים מהמכשיר הזה'}).click();}
  await activate(p);await p.waitForFunction(()=>window.qaUploads.length===1);
  check(await p.evaluate(async()=>{const d=await qaPlain();return d.gratitude[0].text==='סינתטי'&&d.name==='בדיקה';}),'Guest conversion preserves recovery data, including explicit local choice with future cloud timestamp');await c.close();
 }
 ({c,p}=await scenario(null,null));await p.goto(origin+'/#error_code=otp_expired');await p.reload();
 check(await p.locator('#auth').isVisible()&&(await p.locator('#syncMsg').innerText()).includes('פג תוקף'),'Expired magic link offers email-only retry');
 await p.evaluate(()=>window.qaFail=true);await p.locator('#lEmail').fill('qa@example.invalid');await p.locator('#lSend').click();await p.waitForTimeout(100);
 check(!await p.locator('#lSend').isDisabled()&&(await p.locator('#syncMsg').innerText()).includes('יותר מדי'),'Failed email request shows error and allows retry');await c.close();
 return {passed:results.length,results};
}
