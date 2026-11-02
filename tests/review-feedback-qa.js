// Synthetic first-use → two saved timers → independent Home display preferences.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8767',key='cleantime-he-v1',results=[];
 const check=(value,label)=>{if(!value)throw Error(label);results.push(label);};
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.goto(origin);
 check(await page.locator('#welcome').isVisible()&&await page.locator('#languageSelector').isVisible(),'Language choices available on first welcome');
 check((await page.locator('#languageSelector button').allTextContents()).join('|')==='En|עב|рус','Compact language names keep example order');
 for(const language of ['en','ru','he']){
  await page.locator('[data-language='+language+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,language);
  check(await page.locator('[data-language='+language+']').getAttribute('aria-pressed')==='true','Current language announced '+language);
  const positions=await page.locator('#languageSelector button').evaluateAll(items=>items.map(el=>el.getBoundingClientRect().x));
  check(positions[0]<positions[1]&&positions[1]<positions[2],'Language order stable '+language);
 }
 await page.locator('#welcomeStart').click();
 check(await page.locator('#languageSelector').isVisible(),'Language selector stays in setup');
 check(!await page.locator('#oAddSecond').isChecked()&&await page.locator('#oSecondFields').isHidden(),'Second timer is optional by default');
 await page.locator('#oDate').fill('2024-01-01');await page.locator('#oRecoveryChoices input[value="סמים"]').check();await page.locator('#oAddSecond').check();
 check(await page.locator('#oSecondFields').isVisible()&&await page.locator('#oShowSecond').isChecked(),'Expanded second timer defaults to compact visibility on Home');
 await page.locator('#oSecondCategory').selectOption('drugs');await page.locator('#oSecondDate').fill('2025-01-01');await page.locator('#guestForm button[type=submit]').click();
 check(await page.locator('#oSecondError').isVisible()&&await page.evaluate(key=>!localStorage.getItem(key),key),'Duplicate blank recovery type rejected before persistence');
 await page.locator('#oSecondCategory').selectOption('alcohol');await page.locator('#oShowSecond').check();await page.locator('#guestForm button[type=submit]').click();
 await page.locator('#counter').waitFor({state:'visible'});
 const saved=await page.evaluate(key=>localStorage.getItem(key),key),state=JSON.parse(saved);
 check(state.timers.length===2&&state.timers[0].date==='2024-01-01'&&state.timers[1].date==='2025-01-01','Onboarding saves two independent dates');
 check(await page.locator('#showHomeTimers').isChecked()&&await page.locator('#homeTimerCards article').count()===1,'Opt-in starts with primary and compact secondary');
 await page.locator('#openSettings').click();await page.locator('#settings [data-go=counterDetails]').click();
 for(const mode of ['single','cards','compact']){
  await page.locator('[data-display='+mode+']').click();
  check(await page.locator('[data-display='+mode+']').getAttribute('aria-pressed')==='true','Display choice announced '+mode);
  if(mode==='single'){
   await page.locator('#homeTimerPick').selectOption(state.timers[1].id);
   check((await page.locator('#fromChip').innerText()).includes('אלכוהול')&&(await page.locator('#since').innerText()).includes('2025'),'Switching visible timer changes its label and start date');
  }else check(await page.locator('#homeTimerCards article').count()===(mode==='cards'?2:1),'Correct card count '+mode);
  check(await page.evaluate(key=>localStorage.getItem(key),key)===saved,'Display does not mutate recovery data '+mode);
 }
 await page.locator('#showHomeTimers').uncheck();await page.reload();
 check(!await page.locator('#showHomeTimers').isChecked()&&await page.locator('#homeSecondary').isHidden(),'Home checkbox persists while retaining secondary timer');
 check(await page.evaluate(({key,saved})=>{const a=JSON.parse(localStorage.getItem(key)),b=JSON.parse(saved);return JSON.stringify(a.timers)===JSON.stringify(b.timers)&&a.updatedAt===b.updatedAt;},{key,saved}),'Hiding timers leaves timer records and timestamp intact');
 for(const width of [360,1280]){
  await page.setViewportSize({width,height:800});
  const rects=await page.locator('#tabs button').evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};}));
  check(rects.length===5&&rects.every(r=>width>=1024?r.left===rects[0].left&&r.right===rects[0].right:r.top===rects[0].top&&r.bottom===rects[0].bottom),'Five navigation choices form a desktop column / mobile row '+width);
  check(rects.every((r,i)=>rects.every((other,j)=>i===j||r.right<=other.left||other.right<=r.left||r.bottom<=other.top||other.bottom<=r.top)),'Navigation targets never overlap '+width);
 }
 await page.locator('#openAccount').click();check(await page.locator('#account').isVisible()&&await page.locator('#openAccount').getAttribute('aria-current')==='page','Account has its own direct navigation target');
 await page.locator('#openSettings').click();check(await page.locator('#settings').isVisible()&&await page.locator('#openSettings').getAttribute('aria-current')==='page','Settings has its own direct navigation target');
 check(await page.locator('#languageSelector').isVisible(),'Top language row remains after setup');
 // Creating a single timer still works with optional fields completely disabled.
 await page.evaluate(()=>localStorage.clear());await page.reload();await page.locator('#welcomeStart').click();await page.locator('#oDate').fill('2024-01-01');await page.locator('#oRecoveryChoices input[value="סמים"]').check();await page.locator('#guestForm button[type=submit]').click();
 check(await page.locator('#counter').isVisible()&&await page.locator('#homeDisplay').isHidden(),'Single-timer setup stays simple');
 const context=await page.context().browser().newContext();
 try{
  await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
  await context.addInitScript(()=>{
   window.qaRequests=[];
   window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),signInWithOtp:async args=>{qaRequests.push(args);return {};}}})};
   const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
  });
  const p=await context.newPage();await p.goto(origin);await p.locator('#onboardingLogin').click();await p.locator('#authCreate').click();
  await p.locator('#aDate').fill('2024-01-01');await p.locator('#aFrom').selectOption('סמים');await p.locator('#lEmail').fill('synthetic@example.invalid');await p.locator('#aAddSecond').check();await p.locator('#aSecondCategory').selectOption('alcohol');await p.locator('#aSecondDate').fill('2099-01-01');await p.locator('#lSend').click();
  check(await p.evaluate(()=>qaRequests.length)===0&&await p.locator('#aSecondDateError').isVisible(),'Future second date blocks mocked account request');
  p.once('dialog',dialog=>dialog.dismiss());await p.locator('[data-language=en]').click();
  check(await p.locator('html').getAttribute('lang')==='he'&&await p.locator('#aDate').inputValue()==='2024-01-01'&&await p.locator('#aSecondDate').inputValue()==='2099-01-01','Canceling account-setup language change preserves unfinished form');
  await p.locator('#aSecondDate').fill('2025-01-01');await p.locator('#lSend').click();await p.waitForFunction(()=>qaRequests.length===1);
  check(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).timers.length===2,key),'Account creation preserves both timers before synthetic email');
  await p.locator('#lSend').click();await p.waitForFunction(()=>qaRequests.length===2);
  check(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).timers.length===2,key),'Retrying synthetic account link never duplicates second timer');
  await p.locator('#aAddSecond').uncheck();await p.locator('#aFrom').selectOption('אלכוהול');await p.locator('#lSend').click();await p.waitForFunction(()=>qaRequests.length===3);
  check(await p.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));return s.timers.length===1&&s.timers[0].category==='alcohol';},key),'Unchecking setup timer and changing primary never retains hidden duplicate');
  await p.locator('#aAddSecond').check();await p.locator('#lSend').click();
  check(await p.locator('#aSecondError').isVisible()&&await p.evaluate(()=>qaRequests.length)===3,'Re-enabling duplicate identity rejects before mocked request');
  await p.locator('#aSecondLabel').fill('Synthetic second');await p.locator('#lSend').click();await p.waitForFunction(()=>qaRequests.length===4);
  check(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).timers.length===2,key),'Re-enabling optional timer after retry keeps exactly two');
  await p.locator('#authBack').click();await p.locator('#settingsLogin').click();await p.locator('#lEmail').fill('synthetic@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>qaRequests.length===5);
  check(await p.locator('#aSecondFields').evaluate(el=>el.disabled)&&await p.evaluate(()=>qaRequests[4].options.shouldCreateUser===false),'Returning login excludes optional create fields');
  await p.locator('#authBack').click();await p.locator('#openSettings').click();p.once('dialog',dialog=>dialog.accept());await p.locator('#reset').click();await p.locator('#welcomeStart').click();
  check(!await p.locator('#oAddSecond').isChecked()&&await p.locator('#aSecondFields').evaluate(el=>el.disabled)&&await p.locator('#aShowSecond').isChecked(),'Reset clears both onboarding timer drafts and restores compact visibility default');
  check(await p.locator('#aSecondLabel').inputValue()===''&&await p.locator('#aSecondDate').inputValue()===''&&await p.locator('#aSecondCategory').inputValue()==='','Deleted second-timer values are not exposed in another setup');
  await p.locator('#oDate').fill('2024-02-01');await p.locator('#oRecoveryChoices input[value="סמים"]').check();await p.locator('#oAddSecond').check();await p.locator('#oSecondCategory').selectOption('alcohol');await p.locator('#oSecondDate').fill('2025-02-01');await p.locator('#oSecondLabel').fill('Unfinished synthetic');
  p.once('dialog',dialog=>dialog.dismiss());await p.locator('[data-language=en]').click();
  check(await p.locator('html').getAttribute('lang')==='he'&&await p.locator('#oSecondLabel').inputValue()==='Unfinished synthetic'&&await p.locator('#oDate').inputValue()==='2024-02-01','Canceling guest-setup language change preserves all timer fields');
  await p.locator('#onboarding [data-go=about]').click();p.once('dialog',dialog=>dialog.dismiss());await p.locator('[data-language=en]').click();
  check(await p.locator('#about').isVisible()&&await p.locator('html').getAttribute('lang')==='he'&&await p.locator('#oSecondLabel').inputValue()==='Unfinished synthetic','About detour retains unfinished setup language guard');
  await p.goBack();check(await p.locator('#onboarding').isVisible()&&await p.locator('#oDate').inputValue()==='2024-02-01','Back restores retained setup draft');
  await p.locator('#onboarding [data-go=about]').click();let confirmed=false;p.once('dialog',dialog=>{confirmed=true;return dialog.accept();});await p.locator('[data-language=en]').click();await p.waitForFunction(()=>document.documentElement.lang==='en');
  check(confirmed&&await p.locator('#welcome').isVisible()&&await p.evaluate(key=>!localStorage.getItem(key),key),'Only explicit confirmation discards retained setup after a detour');
  await p.locator('#welcomeStart').click();await p.locator('#oDate').fill('2024-03-01');await p.locator('#oRecoveryChoices input[value="סמים"]').check();await p.locator('#guestForm button[type=submit]').click();
  check(await p.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));return s.timers.length===1&&s.timers[0].date==='2024-03-01'&&!JSON.stringify(s).includes('Synthetic second');},key),'Fresh setup after deletion never resurrects previous second timer');
 }finally{await context.close();}
 return {passed:results.length,results};
}
