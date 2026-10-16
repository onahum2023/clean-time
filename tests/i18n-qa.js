// Synthetic language switching and encrypted state journeys; external traffic blocked.
async(page)=>{
 const fs=require('fs'),vm=require('vm'),results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8767',key='cleantime-he-v1';
 const fixture={date:'2025-01-01',from:'סמים',linksV:2,links:[],journal:[{id:1,text:'היום',created:1}],bookmarks:[{id:2,title:'היום',url:'https://example.invalid'}],unknown:{keep:'היום'},updatedAt:1};
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());await page.goto(origin);
 check(await page.locator('html').getAttribute('lang')==='he'&&await page.locator('html').getAttribute('dir')==='rtl','Hebrew is the default');
 await page.evaluate(({key,fixture})=>localStorage.setItem(key,JSON.stringify(fixture)),{key,fixture});await page.reload();
 const before=await page.evaluate(key=>localStorage.getItem(key),key);
 const source=fs.readFileSync('index.html','utf8'),literals=[...source.matchAll(/translateUI\((('(?:\\.|[^'\\])*')|("(?:\\.|[^"\\])*"))\)/g)].map(match=>vm.runInNewContext(match[1]));
 const missing=await page.evaluate(literals=>literals.map(s=>s.trim().replace(/\s+/g,' ')).filter(s=>/[א-ת]/.test(s)&&!Object.hasOwn(CleanTimeMessages.en,s)),literals);
 check(missing.length===0,'Every extracted dynamic message has an English draft: '+missing.join(','));
 for(const language of ['en','ru','he']){
  await page.locator('#languageSelector [data-language='+language+']').click();await page.waitForLoadState('load');
  await page.waitForFunction(language=>document.documentElement.lang===language,language);
  check(await page.locator('html').getAttribute('dir')===(language==='he'?'rtl':'ltr'),'Correct direction '+language);
  check(await page.evaluate(key=>localStorage.getItem(key),key)===before,'Language leaves recovery bytes/timestamp unchanged '+language);
  await page.reload();check(await page.locator('html').getAttribute('lang')===language,'Language persists '+language);
  await page.setViewportSize({width:360,height:800});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home fits mobile '+language);
  await page.locator('#counter [data-go=journal]').click();check((await page.locator('#jList').innerText()).includes('היום'),'User journal text is never translated '+language);
  await page.locator('[data-tab=counter]').click();await page.locator('#openSettings').click();
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Settings fit mobile '+language);
  await page.locator('#addTimer').click();await page.locator('#tDate').fill('2099-01-01');await page.locator('#timerForm button[type=submit]').click();
  check(await page.locator('#tDateError').textContent()===await page.evaluate(()=>CleanTimeI18n.t('תאריך תחילת ההחלמה לא יכול להיות בעתיד.')),'Date validation localized '+language);
  await page.locator('#cancelTimer').click();await page.locator('[data-tab=counter]').click();
 }
 for(const language of ['he','en','ru']){
  const context=await page.context().browser().newContext();
  try{
   await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
   await context.addInitScript(language=>{
    localStorage.setItem('cleantime-language',language);window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),signInWithOtp:async()=>({})}})};
    const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
   },language);
   const p=await context.newPage();await p.goto(origin);await p.locator('#welcomeStart').click();await p.locator('#oFrom').selectOption('סמים');await p.locator('#oDate').fill('2025-01-01');
   check(await p.locator('#oFrom').inputValue()==='סמים','Fresh guest option identifier is stable '+language);await p.locator('#guestForm button').click();
   check(await p.evaluate(key=>{const state=JSON.parse(localStorage.getItem(key));return state.from==='סמים'&&state.timers[0].category==='drugs';},key),'Fresh guest stores language-independent recovery category '+language);
   await p.evaluate(()=>localStorage.removeItem('cleantime-he-v1'));await p.reload();await p.locator('#onboardingLogin').click();await p.locator('#authCreate').click();await p.locator('#aFrom').selectOption('סמים');await p.locator('#aDate').fill('2025-01-01');await p.locator('#lEmail').fill('onboarding@example.invalid');
   check(await p.locator('#aFrom').inputValue()==='סמים','Fresh account option identifier is stable '+language);await p.locator('#lSend').click();
   check(await p.evaluate(key=>{const state=JSON.parse(localStorage.getItem(key));return state.from==='סמים'&&state.timers[0].category==='drugs';},key),'Fresh account stores language-independent recovery category '+language);
  }finally{await context.close();}
 }
 for(const language of ['he','en','ru']){
  const context=await page.context().browser().newContext();
  try{
   const multiple=require(process.cwd()+'/assets/recovery-timers.js').normalize(fixture);multiple.timers.push({id:'custom-drugs',category:'drugs',label:'Drugs',date:'2025-01-01',time:''});
   await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
   await context.addInitScript(({language,multiple,key})=>{localStorage.setItem('cleantime-language',language);if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(multiple));},{language,multiple,key});
   const p=await context.newPage();await p.goto(origin);await p.locator('#openSettings').click();await p.locator('#timerList li').nth(1).getByRole('button').first().click();await p.locator('#tDate').fill('2025-02-01');await p.locator('#timerForm button[type=submit]').click();await p.locator('#askB button').first().click();
   check(await p.evaluate(key=>{const state=JSON.parse(localStorage.getItem(key));return state.timers.length===2&&state.timers[1].date==='2025-02-01'&&state.timers[1].label==='Drugs';},key),'Default/custom labels remain editable independently of display language '+language);
   for(const label of ['Drugs','']){
    await p.locator('#addTimer').click();await p.locator('#tCategory').selectOption('drugs');await p.locator('#tLabel').fill(label);await p.locator('#tDate').fill('2025-01-01');await p.locator('#timerForm button[type=submit]').click();
    check(await p.locator('#timerError').isVisible()&&await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).timers.length===2,key),'Stable duplicate custom/default identity rejected '+language+'/'+label);await p.locator('#cancelTimer').click();
   }
  }finally{await context.close();}
 }
 for(const language of ['en','ru']){
  const context=await page.context().browser().newContext({viewport:{width:360,height:800}});let cloud=null,uploads=0;
  try{
   await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
   await context.exposeFunction('i18nRead',()=>({data:cloud}));await context.exposeFunction('i18nWrite',row=>{cloud=row;uploads++;return {data:[{user_id:row.user_id}]};});
   await context.addInitScript(({key,fixture,language})=>{
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));localStorage.setItem('cleantime-language',language);localStorage.setItem('cleantime-he-sync',JSON.stringify({uid:'i18n-synthetic'}));window.confirm=()=>true;
    const write=row=>({eq(){return this;},select:()=>i18nWrite(row)});
    window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{user:{id:'i18n-synthetic',email:'i18n@example.invalid'}}}})},from:()=>({select:()=>({eq:()=>({maybeSingle:()=>i18nRead()})}),update:write,insert:write})})};
    const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
   },{key,fixture,language});
   const p=await context.newPage();await p.goto(origin);await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#makeRecoveryKey').click();await p.locator('#recoveryGenerated').waitFor();await p.locator('#recoverySaved').check();await p.locator('#activateEncryption').click();
   await p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes(CleanTimeI18n.t('גיבוי מוצפן פעיל. שינויים חדשים ממתינים לסנכרון.').split('.')[0]));
   check(uploads===1&&cloud.data.v===1&&!JSON.stringify(cloud.data).includes('היום'),'Registered encrypted activation works '+language);
   await p.reload();await p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes(CleanTimeI18n.t('גיבוי מוצפן פעיל. שינויים חדשים ממתינים לסנכרון.').split('.')[0]));
   check(uploads===1&&await p.locator('#recoveryForm').isHidden(),'Registered trusted reload works '+language);
   check(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).journal[0].text==='היום',key),'Registered recovery text is unchanged '+language);
  }finally{await context.close();}
 }
 // Every published language is selectable on the production origin too.
 const context=await page.context().browser().newContext();
 try{
  await context.addInitScript(()=>{if(!localStorage.getItem('cleantime-language'))localStorage.setItem('cleantime-language','ru');});
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!=='https://clean-time.app')return route.abort();const file=require('path').join(process.cwd(),url.pathname==='/'?'index.html':url.pathname.slice(1));return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
  const p=await context.newPage();await p.goto('https://clean-time.app');check(await p.locator('html').getAttribute('lang')==='ru','Production restores the selected language');
  for(const language of ['en','ru','he']){
   const button=p.locator('#languageSelector [data-language='+language+']');check(await button.isEnabled(),'Production language button enabled '+language);
   await button.click();await p.waitForFunction(language=>document.documentElement.lang===language,language);
   check(await p.locator('html').getAttribute('dir')===(language==='he'?'rtl':'ltr')&&await button.getAttribute('aria-pressed')==='true','Production click switches language and direction '+language);
   await p.reload();check(await p.locator('html').getAttribute('lang')===language,'Production choice persists after reload '+language);
  }
  check(await p.evaluate(()=>!CleanTimeI18n.setLanguage('unsupported')),'Unsupported language still rejects');
 }finally{await context.close();}
 for(const [origin,config,expected] of [
  ['https://production-build.vercel.app',{environment:'production'},'ru'],
  ['https://unknown.example.invalid',null,'ru'],
  ['https://custom-preview.example.invalid',{environment:'preview',backupDisabled:true},'ru']
 ]){
  const context=await page.context().browser().newContext();
  try{
   await context.addInitScript(()=>localStorage.setItem('cleantime-language','ru'));
   await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();if(url.pathname==='/assets/backend-config.js')return route.fulfill({contentType:'application/javascript',body:'window.CleanTimeBackend='+JSON.stringify(config)});const file=require('path').join(process.cwd(),url.pathname==='/'?'index.html':url.pathname.slice(1));return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
   const p=await context.newPage();await p.goto(origin);check(await p.locator('html').getAttribute('lang')===expected,'Language preference is independent of backend/build host '+origin);
  }finally{await context.close();}
 }
 return {passed:results.length,results};
}
