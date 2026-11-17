// Navigation-first #75 revision: one shared five-destination DOM, rail / footer.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const {navigationFits}=require(process.cwd()+'/tests/navigation-layout.js');
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'סמים',updatedAt:1}));});
 await page.goto(origin);await page.locator('#counter').waitFor();await page.evaluate(()=>document.fonts.ready);
 const saved=await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'));
 const language=async lang=>{await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);await page.locator('#counter').waitFor();};
 const items=page.locator('#tabs .inner>button');
 const fit=()=>page.evaluate(()=>{
  const nav=document.getElementById('tabs'),inner=nav.querySelector('.inner').getBoundingClientRect(),buttons=[...nav.querySelectorAll('.inner>button')],rects=buttons.map(e=>e.getBoundingClientRect()),near=(a,b)=>Math.abs(a-b)<1;
  return document.documentElement.scrollWidth<=innerWidth&&buttons.length===5&&buttons.map(e=>e.id||e.dataset.tab).join('|')==='counter|tools|about|openSettings|openAccount'&&buttons.every(e=>e.scrollWidth<=e.clientWidth+1)&&rects.every((r,i)=>r.width>=44&&r.height>=44&&(innerWidth>=1024?near(r.width,inner.width)&&(i===0||r.top>=rects[i-1].bottom):near(r.width,inner.width/5)&&(i===0||(document.dir==='rtl'?r.right<=rects[i-1].left+1:r.left>=rects[i-1].right-1))));
 });
 const clear=async()=>{
  await page.locator('#counter [data-go=inventory]').scrollIntoViewIfNeeded();
  return page.locator('#counter [data-go=inventory]').evaluate(e=>{const r=e.getBoundingClientRect(),n=document.getElementById('tabs').getBoundingClientRect();return innerWidth>=1024?(document.dir==='rtl'?r.right<=n.left:r.left>=n.right):r.bottom<=n.top+1;});
 };
 for(const lang of ['he','en','ru'])for(const colorScheme of ['light','dark']){
  await language(lang);await page.emulateMedia({colorScheme});
  for(const width of [320,390,568,768,1023,1024,1440,1920]){
   await page.setViewportSize({width,height:width>=1024?900:844});const label=`${lang} ${colorScheme} ${width}`;
   check(await navigationFits(page),'Persistent rail on reading-start side / compact bottom navigation: '+label);
   check(await fit(),'Five readable, ordered, equal-sized targets without overflow: '+label);
   check(await page.locator('.nav-brand').isVisible()===(width>=1024),'Desktop identity, hidden on mobile: '+label);
   check(await items.evaluateAll(es=>es.filter(e=>e.getAttribute('aria-current')==='page').length===1&&es[0].getAttribute('aria-current')==='page'),'Exactly one current destination: '+label);
   check(await clear(),'Last Home action stays clear of navigation: '+label);
  }
  for(const width of [390,1024,1440]){
   await page.setViewportSize({width,height:width===390?844:900});await page.keyboard.press('Tab');await items.first().focus();
   for(let i=0;i<5;i++){
    check(await items.nth(i).evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Keyboard order and focus '+lang+' '+colorScheme+' '+width+' '+i);
    if(i<4)await page.keyboard.press('Tab');
   }
   for(const [i,id] of ['counter','tools','about','settings','account'].entries()){
    await items.nth(i).focus();await page.keyboard.press('Enter');
    check(await page.locator('#'+id).isVisible()&&await items.nth(i).getAttribute('aria-current')==='page','Keyboard activates and selects '+id+' '+lang+' '+colorScheme+' '+width);
    check(await navigationFits(page),'Shared navigation geometry on '+id+' '+lang+' '+width);
   }
   await items.first().click();
  }
 }
 for(const lang of ['he','en','ru']){
  await language(lang);await page.setViewportSize({width:720,height:450});
  check(await navigationFits(page)&&await fit()&&await clear(),'200% zoom-equivalent reflow switches to footer '+lang);
  const enlarged=await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
  for(const [width,height] of [[320,844],[390,844],[1024,768],[1440,900],[1440,320]]){
   await page.setViewportSize({width,height});
   check(await navigationFits(page)&&await fit()&&await clear(),'200% text navigation and Home clearance '+lang+' '+width+'x'+height);
   await page.keyboard.press('Tab');await items.last().focus();
   check(await items.last().evaluate(e=>{const r=e.getBoundingClientRect();return e===document.activeElement&&r.top>=0&&r.bottom<=innerHeight&&getComputedStyle(e).outlineStyle!=='none';}),'Last navigation target scrolls into view in short/enlarged viewport '+lang+' '+width+'x'+height);
  }
  await enlarged.evaluate(e=>e.remove());
 }
 await page.setViewportSize({width:1440,height:900});await items.last().click();await page.locator('#settingsLogin').click();
 check(await page.locator('#auth').isVisible()&&await page.locator('#tabs').isHidden()&&await page.locator('html').evaluate(e=>!e.classList.contains('application-shell')),'Existing guest authentication exits navigation shell');
 await page.locator('#authBack').click();check(await navigationFits(page),'Auth Back restores application shell');await items.first().click();
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===saved,'Navigation and auth entry preserve exact recovery bytes');
 // Explicit padding simulates the result of a 34px bottom safe-area env value.
 await page.setViewportSize({width:390,height:844});const inset=await page.addStyleTag({content:'#tabs{padding-bottom:34px}'});
 check(await navigationFits(page)&&await clear(),'Mobile safe-area padding and last-action clearance');await inset.evaluate(e=>e.remove());
 for(const width of [390,1024,1440]){
  const context=await page.context().browser().newContext({viewport:{width,height:900}});await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
  const entry=await context.newPage();await entry.goto(origin);await entry.locator('#welcome').waitFor();
  for(const target of ['welcome','onboarding','auth']){
   if(target==='onboarding')await entry.locator('#welcomeStart').click();
   if(target==='auth'){await entry.locator('#setupBack').click();await entry.locator('#onboardingLogin').click();}
   check(await entry.locator('#'+target).isVisible()&&await entry.locator('#tabs').isHidden()&&await entry.locator('.app').evaluate(e=>!e.classList.contains('application-shell')&&Math.abs(e.getBoundingClientRect().left-(innerWidth-e.getBoundingClientRect().width)/2)<1),'Entry screen outside shell '+target+' '+width);
  }
  await context.close();
 }
 return {passed:results.length,results};
}
