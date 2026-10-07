// Runs on localhost or QA_BASE_URL. Fresh synthetic contexts; no live account/backend traffic.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const browser=page.context().browser();
 for(const timezoneId of ['Asia/Jerusalem','America/Los_Angeles','Pacific/Kiritimati']){
  const c=await browser.newContext({viewport:{width:360,height:800},timezoneId});
  const p=await c.newPage(),external=[],errors=[];
  await c.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.fallback();external.push(r.request().url());return r.abort();});
  p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);
  check(await p.locator('#welcome').isVisible()&&!await p.locator('#guestForm').isVisible()&&!await p.locator('#tabs').isVisible()&&!await p.locator('#openSettings').isVisible(),'Fresh Welcome has no recovery fields/navigation '+timezoneId);
  check(await p.locator('#welcome input').count()===0&&!await p.locator('#authCreate').isVisible(),'Welcome has no registration form');
  await p.locator('#welcome [data-go=about]').click();check(await p.locator('#about').isVisible()&&await p.locator('#aboutBack').isVisible(),'About/privacy reachable before setup');
  await p.locator('#aboutBack').click();await p.locator('#welcome').waitFor();
  await p.keyboard.press('Tab');await p.locator('#welcomeStart').focus();
  check(await p.locator('#welcomeStart').evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Start keyboard focus visible');
  await p.keyboard.press('Enter');await p.locator('#onboarding').waitFor();
  await p.locator('#guestForm button').click();check((await p.locator('#oDateError').innerText()).includes('תקין'),'Required date has Hebrew error');
  await p.locator('#oDate').fill('2099-01-01');await p.locator('#guestForm button').click();check((await p.locator('#oDateError').innerText()).includes('בעתיד')&&!await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').date,key),'Future date cannot save');
  await p.locator('#oDate').fill('2026-10-01');
  check((await p.locator('#oDateConfirmation').innerText()).includes('1 באוקטובר 2026'),'October 1 display across time zones '+timezoneId);
  await p.locator('#guestForm button').click();check(await p.locator('#oFromError').isVisible(),'Recovery type required in Hebrew');
  await p.locator('#oFrom').selectOption('אחר');await p.locator('#setupBack').click();await p.locator('#welcomeStart').click();
  check(await p.locator('#oDate').inputValue()==='2026-10-01'&&await p.locator('#oFrom').inputValue()==='אחר','Visible Back retains draft');
  await p.goBack();check(await p.locator('#welcome').isVisible(),'Browser Back returns Welcome');await p.goForward();
  await p.locator('#guestForm button').click();check(await p.locator('#counter').isVisible()&&await p.locator('#tabs').isVisible(),'Guest setup enters Today');
  await p.locator('#counter [data-go=gratitude]').click();await p.locator('#gInput').fill('תודה סינתטית');await p.locator('#gAdd').click();
  const saved=await p.evaluate(k=>localStorage.getItem(k),key);await p.reload();
  check(await p.locator('#counter').isVisible()&&await p.evaluate(({key,saved})=>{const a=JSON.parse(localStorage.getItem(key)),b=JSON.parse(saved);return a.date===b.date&&a.from===b.from&&JSON.stringify(a.gratitude)===JSON.stringify(b.gratitude)&&a.updatedAt===b.updatedAt;},{key,saved}),'Useful action survives reload; existing guest directly Today');
  await p.locator('#openSettings').click();check((await p.locator('#sDateConfirmation').innerText()).includes('1 באוקטובר 2026'),'Settings selected date confirmation');
  await p.locator('#sDate').fill('2026-01-10');check((await p.locator('#sDateConfirmation').innerText()).includes('10 בינואר 2026'),'January 10 cannot be mistaken for October 1');
  check(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).date,key)==='2026-10-01','Display does not mutate canonical date');
  await p.locator('#myAccount').click();check(await p.locator('#accountGuest').isVisible()&&await p.locator('#createAccount').isVisible(),'Optional registration lives in guest My Account');
  await p.locator('#createAccount').click();check(!await p.locator('#authProfile').isVisible(),'Configured guest conversion does not repeat recovery setup');
  await p.locator('#authBack').click();check(await p.locator('#account').isVisible(),'Account form Back returns My Account');
  check(external.length===0&&errors.length===0,'Guest flow no third-party requests or JS errors');await c.close();
 }
 for(const width of [320,360,390])for(const colorScheme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height:800},colorScheme});const p=await c.newPage();await p.goto(origin);
  for(const screen of ['welcome','onboarding']){
   if(screen==='onboarding'){await p.locator('#welcomeStart').click();check(await p.locator('#oDate').evaluate((e,theme)=>getComputedStyle(e).colorScheme===theme,colorScheme),'Native date control theme '+width+' '+colorScheme);}
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.documentElement).direction==='rtl'),screen+' RTL fit '+width+' '+colorScheme);
   check(await p.locator('#'+screen+' button:visible').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),screen+' touch targets '+width+' '+colorScheme);
   if(screen==='welcome'&&width===360)check(await p.locator('#onboardingLogin').evaluate(e=>e.getBoundingClientRect().bottom<=800),'Welcome primary and secondary actions above fold');
  }
  await c.close();
 }
 return {passed:results.length,results};
}
