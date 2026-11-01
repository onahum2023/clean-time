// Welcome-only visual foundation, synthetic locales and data. Never contacts a backend.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const browser=page.context().browser();
 for(const lang of ['he','en','ru'])for(const width of [320,390,1440])for(const colorScheme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height:width===320?568:900},colorScheme});
  const external=[],errors=[];
  await c.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.fallback();external.push(r.request().url());return r.abort();});
  await c.addInitScript(lang=>localStorage.setItem('cleantime-language',lang),lang);
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.evaluate(()=>document.fonts.ready);
  const label=`${lang} ${width} ${colorScheme}`;
  check(await p.evaluate(lang=>document.documentElement.lang===lang&&document.documentElement.dir===(lang==='he'?'rtl':'ltr'),lang),'Locale and direction '+label);
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+label);
  check(await p.locator('#welcomeStart').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),'Primary action above fold '+label);
  check(await p.locator('#welcome [data-i18n]').evaluateAll((es,lang)=>es.every(e=>e.textContent===CleanTimeI18n.t(e.dataset.i18n)&&(lang==='he'||!/[א-ת]/.test(e.textContent))),lang),'All Welcome copy translated '+label);
  check(await p.locator('#welcome .welcome-preview').getAttribute('aria-labelledby')==='welcomeExampleTitle'&&await p.locator('#welcome input,#welcome .welcome-preview button,#welcome .welcome-preview a').count()===0,'Labeled static illustration '+label);
  const focus=[];
  await p.locator('#languageSelector button').last().focus();
  for(let i=0;i<5;i++){await p.keyboard.press('Tab');focus.push(await p.evaluate(()=>document.activeElement.id||document.activeElement.getAttribute('href')||document.activeElement.dataset.go));}
  check(JSON.stringify(focus)===JSON.stringify(['welcomeStart','onboardingLogin','welcomeFooterStart','/privacy/','about']),'Keyboard order hero, login, closing CTA, Privacy, About '+label);
  check(await p.evaluate(()=>!localStorage.getItem('cleantime-he-v1')),'Viewing Welcome leaves recovery state empty '+label);
  if(lang==='he'){
   check(await p.locator('#welcomeFeaturesTitle').textContent()==='מה מחכה לך בפנים','Exact Hebrew heading '+label);
   check(await p.locator('.welcome-features-intro').textContent()==='אותו סדר יום מוכר, כל יום. בלי החלטות מיותרות.','Exact Hebrew subtitle '+label);
   check(await p.locator('#welcomeReflection').textContent()==='ההחלמה היא לא קו ישר. היא סדרה של בחירות כנות, להופיע שוב ושוב.','Exact Hebrew reflection '+label);
  }
  check(await p.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length===new Set(ids).size;}),'No duplicate IDs '+label);
  check(await p.evaluate(()=>document.getElementById('welcomeFooterStart').onclick===document.getElementById('welcomeStart').onclick),'Both CTAs reuse the same handler '+label);
  for(const id of ['welcomeStart','welcomeFooterStart']){
   await p.keyboard.press('Tab');await p.locator('#'+id).focus();
   check(await p.locator('#'+id).evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Start focus visible '+id+' '+label);
   await p.keyboard.press('Enter');await p.locator('#onboarding').waitFor();
   check(await p.locator('#guestForm').isVisible()&&await p.locator('#oDate').isVisible()&&await p.locator('#oFrom').isVisible()&&!await p.evaluate(()=>localStorage.getItem('cleantime-he-v1')),'Same unsaved guest setup '+id+' '+label);
   await p.locator('#setupBack').click();await p.locator('#welcome').waitFor();
  }
  await p.locator('#welcome a[href="/privacy/"]').click();
  check(new URL(p.url()).pathname==='/privacy/'&&await p.locator('main h1').isVisible(),'Real public Privacy page '+label);
  await p.goBack();await p.locator('#welcome').waitFor();

  await p.locator('#onboardingLogin').click();await p.locator('#auth').waitFor();
  check(await p.locator('#authCreate').isVisible()&&await p.locator('#authProfile').isHidden()&&await p.locator('#lSend').textContent()===await p.evaluate(()=>CleanTimeI18n.t('שליחת קישור כניסה למייל')),'Returning login remains separate from signup '+label);
  await p.locator('#authBack').click();await p.locator('#welcome').waitFor();
  check(external.length===0&&errors.length===0,'No external requests or script errors '+label);
  await c.close();
 }
 return {passed:results.length,results};
}
