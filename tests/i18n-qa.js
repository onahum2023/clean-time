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
  await page.locator('#openSettings').click();await page.locator('#languageChoice').selectOption(language);await page.waitForLoadState('load');
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
 // Production public UI must not enable either unreviewed language.
 const context=await page.context().browser().newContext();
 try{
  await context.addInitScript(()=>localStorage.setItem('cleantime-language','ru'));
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!=='https://clean-time.app')return route.abort();const file=require('path').join(process.cwd(),url.pathname==='/'?'index.html':url.pathname.slice(1));return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
  const p=await context.newPage();await p.goto('https://clean-time.app');check(await p.locator('html').getAttribute('lang')==='he'&&await p.evaluate(()=>!CleanTimeI18n.setLanguage('en')),'Production language gate keeps Hebrew');
 }finally{await context.close();}
 return {passed:results.length,results};
}
