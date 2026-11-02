// Integrated issue #80: real controls and existing workflows, synthetic storage only.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const {navigationFits}=require(process.cwd()+'/tests/navigation-layout.js');
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',linksV:2,links:[],updatedAt:1,journal:[{id:1,text:'Synthetic writing',created:1}],plans:{'2026-11-01':[{id:2,text:'Synthetic long plan text to test reading and editing in enlarged layouts',done:false}]},gratitude:[{id:3,text:'Synthetic gratitude entry for enlarged list controls',ts:1793534400000,day:'2026-11-01'}],unknown:{keep:true}}));});
 await page.goto(origin);await page.locator('#counter').waitFor();
 const open=async id=>{
  if(await page.locator('#'+id).isVisible())return;
  if(await page.locator('#auth').isVisible())await page.locator('#authBack').click();
  if(['counter','tools','about','account'].includes(id))return page.locator('[data-tab='+id+']').click();
  if(id==='settings')return page.locator('#openSettings').click();
  if(id==='counterDetails'){await open('settings');return page.locator('#settings [data-go=counterDetails]').click();}
  if(id==='auth'){await open('account');return page.locator('#settingsLogin').click();}
  if(id==='feedback'){await open('about');return page.locator('#about [data-go=feedback]').click();}
  if(['planner','gratitude','journal','inventory'].includes(id)){await open('counter');return page.locator('#counter [data-go='+id+']').click();}
  await open('tools');return page.locator(id==='readings'?'#tools [data-go=readings]':'#recoveryDestinations [data-go='+id+']').click();
 };
 const fit=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.app input,.app select,.app textarea,.app button')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&e.scrollWidth<=e.clientWidth+2;}));
 for(const lang of (process.env.QA_TEST_LANGUAGES||'he,en,ru').split(',')){
  await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);
  for(const mode of ['light','dark']){
   await page.emulateMedia({colorScheme:mode});
   const enlarged=await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
   for(const width of [320,390,1024,1440]){
    await page.setViewportSize({width,height:width>=1024?900:844});
    for(const id of ['planner','gratitude','journal','inventory','meditation','tools','settings','account','counterDetails','about','feedback','bookmarks','readings','auth']){
     await open(id);check(await fit(),'Actual 200% text fits '+id+' '+lang+' '+mode+' '+width);
     check(id==='auth'?await page.locator('#tabs').isHidden():await navigationFits(page),'Navigation/entry boundary with 200% text '+id+' '+lang+' '+mode+' '+width);
    }
   }
   await enlarged.evaluate(e=>e.remove());
  }
  await open('settings');
  for(const palette of ['original','forest','rainy','sunny']){
   await page.locator('[name=palette][value='+palette+']').check();
   for(const id of ['planner','gratitude','inventory','meditation','about','account']){await open(id);check(await fit(),'Palette inner-page overflow '+palette+' '+id+' '+lang);}
   await open('settings');
  }
 }
 // Fresh, unsaved guest setup in each locale; exact legacy option meanings.
 for(const lang of (process.env.QA_TEST_LANGUAGES||'he,en,ru').split(',')){
  const context=await page.context().browser().newContext({viewport:{width:390,height:844},timezoneId:'Europe/Amsterdam'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
  await context.addInitScript(lang=>localStorage.setItem('cleantime-language',lang),lang);
  const p=await context.newPage();await p.clock.install({time:new Date('2026-11-01T12:00:00Z')});await p.goto(origin);await p.locator('#welcomeStart').click();
  check(await p.locator('#oRecoveryChoices input[type=radio]').evaluateAll(es=>es.map(e=>e.value).join('|')==='אלכוהול|סמים|עישון|אוכל|אחר')&&await p.locator('#oFrom').isHidden(),'Five original saved identities with a single visible choice UI '+lang);
  await p.clock.setFixedTime(new Date('2025-02-28T12:00:00Z'));await p.locator('#oDate').fill('2025-01-31');
  check((await p.locator('#oDurationPreview').innerText()).includes(await p.evaluate(()=>new Intl.NumberFormat(CleanTimeI18n.locale,{style:'unit',unit:'month',unitDisplay:'long'}).format(1))),'Month-end preview clamps to one calendar month '+lang);
  await p.locator('#oDate').fill('2024-02-29');
  check((await p.locator('#oDurationPreview').innerText()).includes(await p.evaluate(()=>new Intl.NumberFormat(CleanTimeI18n.locale,{style:'unit',unit:'year',unitDisplay:'long'}).format(1))),'Leap-day preview clamps to one calendar year '+lang);
  await p.locator('#oDate').fill('2099-01-01');check(await p.locator('#oDurationPreview').isHidden(),'Future date has no duration '+lang);
  check(await p.evaluate(()=>!localStorage.getItem('cleantime-he-v1')),'Preview and radio rendering do not save recovery '+lang);
  await p.clock.setFixedTime(new Date('2026-11-01T12:00:00Z'));await p.locator('#oDate').fill('2025-01-01');await p.locator('#oRecoveryChoices input[value="סמים"]').check();
  await p.locator('#oAddSecond').check();await p.locator('#oSecondCategory').selectOption('alcohol');await p.locator('#oSecondDate').fill('2026-05-01');await p.locator('#guestForm button[type=submit]').click();
  check(await p.locator('#counter').isVisible()&&await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('cleantime-he-v1'));return s.timers.length===2&&s.timers.some(t=>t.category==='drugs')&&s.timers.some(t=>t.category==='alcohol');}),'Single-step guest form preserves optional second timer '+lang);
  await context.close();
 }
 return {passed:results.length,results};
}
