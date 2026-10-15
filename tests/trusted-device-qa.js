// Actual Chromium process restart with an ephemeral persistent profile.
// All identities/content/crypto are synthetic; external requests are blocked.
async(page)=>{
 const fs=require('fs'),os=require('os'),path=require('path'),{chromium}=require('playwright');
 const {activate}=require(process.cwd()+'/tests/qa-helpers.js');
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 if(!origin.startsWith('http://127.0.0.1:'))throw Error('Persistent-profile QA is localhost only');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ct-trusted-')),results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 let cloud=null,uploads=0,context,recovery;
 const open=async()=>{
  context=await chromium.launchPersistentContext(profile,{headless:true,...(process.env.QA_CHROMIUM_EXECUTABLE?{executablePath:process.env.QA_CHROMIUM_EXECUTABLE}:{}),...(process.env.QA_NO_SANDBOX==='1'?{args:['--no-sandbox']}:{}),viewport:{width:360,height:800}});
  await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
  await context.route('**/assets/backend-config.js',r=>r.fulfill({contentType:'application/javascript',body:'window.CleanTimeBackend={environment:"local",url:"http://127.0.0.1:54321",key:"sb_publishable_SYNTHETIC_QA_ONLY"};'}));
  await context.exposeFunction('ctRead',()=>cloud);
  await context.exposeFunction('ctWrite',row=>{uploads++;cloud={data:row.data,updated_at:row.updated_at};return {data:[{user_id:row.user_id}],error:null};});
  await context.addInitScript(()=>{
   window.confirm=()=>true;
   const client={auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{user:{id:'restart-synthetic',email:'restart@example.invalid'}}}}),signOut:async()=>({})},from(){return {select(){return {eq(){return {maybeSingle:async()=>({data:await ctRead()})}}}},update:write,insert:write};}};
   function write(row){return {eq(){return this;},select:()=>ctWrite(row)};}
   window.supabase={createClient:()=>client};const append=Element.prototype.appendChild;
   Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
  });
  const p=await context.newPage();await p.goto(origin);return p;
 };
 try{
  let p=await open();
  await p.evaluate(()=>{
   localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',journal:[{id:1,text:'סינתטי',created:1}],updatedAt:1}));
   localStorage.setItem('cleantime-he-sync',JSON.stringify({uid:'restart-synthetic'}));
  });
  await p.reload();await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#makeRecoveryKey').waitFor({state:'visible'});
  await p.locator('#makeRecoveryKey').click();await p.locator('#recoveryGenerated').waitFor({state:'visible'});recovery=await p.locator('#recoveryOutput').inputValue();
  await p.locator('#recoverySaved').check();await p.locator('#activateEncryption').click();
  await p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
  check(cloud?.data.v===1,'Initial backup is a v1 envelope');
  const before=await p.evaluate(()=>localStorage.getItem('cleantime-he-crypto')),count=uploads;
  check(!before.includes(recovery),'Recovery key is absent from persisted key material');
  await context.close();context=null;
  p=await open();await p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
  check(await p.locator('#recoveryForm').isHidden(),'Full browser process restart reuses trusted key without prompt');
  check(await p.evaluate(()=>localStorage.getItem('cleantime-he-crypto'))===before,'Restart preserves account-scoped trusted material');
  check(uploads===count,'Restart does not rewrite the cloud backup');
  check(await p.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')).journal[0].text==='סינתטי'),'Synthetic history survives process restart');
  await p.evaluate(()=>localStorage.removeItem('cleantime-he-crypto'));await context.close();context=null;
  p=await open();await p.locator('#recoveryForm').waitFor({state:'visible'});
  check(uploads===count,'Missing-key restart does not overwrite encrypted backup');
  await p.locator('#recoveryInput').fill('0'.repeat(64));await p.locator('#unlockRecovery').click();await p.waitForFunction(()=>!document.getElementById('unlockRecovery').disabled);
  check(await p.locator('#recoveryForm').isVisible(),'Wrong key fails closed');
  await p.locator('#recoveryInput').fill(recovery);await p.locator('#unlockRecovery').click();await p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל'));
  check(await p.locator('#recoveryInput').inputValue()==='','Correct new-device recovery clears entry field');
  await p.locator('#signOut').click();
  check(await p.evaluate(()=>!localStorage.getItem('cleantime-he-crypto')),'Explicit sign-out removes device key');
 }finally{if(context)await context.close();recovery=null;fs.rmSync(profile,{recursive:true,force:true});}
 return {passed:results.length,results};
}
