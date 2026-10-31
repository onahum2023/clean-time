// Approved daily Home hierarchy and progressive counter disclosure. Synthetic state only.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const {normalize}=require(process.cwd()+'/assets/recovery-timers.js');
 const fixture=normalize({date:'2025-01-01',time:'',from:'סמים',linksV:2,links:[],updatedAt:1,unknown:{keep:true},journal:[{id:1,text:'בדיקה',created:1}],inventory:{old:{answers:{legacy:'keep'}}}});
 fixture.timers.push({id:'second',category:'alcohol',label:'',date:'2026-05-01',time:''},{id:'third',category:'smoking',label:'',date:'2026-07-01',time:''});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));},{key,fixture});
 await page.goto(origin);const saved=await page.evaluate(key=>localStorage.getItem(key),key);
 check(await page.locator('#homeSecondary').isVisible(),'A secondary counter is compact and visible by default');
 check(await page.locator('#counter input,#counter select,#counter [data-display]').count()===0,'Home presents no display decisions or setup controls');
 check(await page.locator('#counter .tool-links > *').count()===5,'All five daily actions remain available without completion gates');
 const homeLabel=await page.locator('#homePrimaryLabel').textContent();
 await page.locator('#counter [data-go=counterDetails]').focus();await page.keyboard.press('Enter');
 check(await page.locator('#counterDetails').isVisible()&&await page.locator('#counterDetails h2').evaluate(e=>e===document.activeElement),'Keyboard opens details and focuses its heading');
 check(await page.locator('[data-tab=counter]').getAttribute('aria-current')==='page','Details remains part of Today navigation');
 const beforeModes=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 const initialMode=beforeModes.mode||0;
 for(let mode=0;mode<3;mode++){
  await page.locator('#count').focus();await page.keyboard.press('Enter');
  check(await page.evaluate(({key,expected})=>JSON.parse(localStorage.getItem(key)).mode===expected,{key,expected:(initialMode+mode+1)%3}),'Keyboard cycles numerical format '+mode);
 }
 await page.locator('#showHomeTimers').uncheck();
 await page.locator('[data-display=cards]').click();
 check(await page.locator('#homeTimerCards article').count()===3,'All paths remain available even when secondary Home summary is hidden');
 await page.locator('[data-display=single]').click();await page.locator('#homeTimerPick').selectOption('third');
 check((await page.locator('#fromChip').textContent()).includes('עישון'),'Single view can inspect a non-primary recovery path');
 await page.locator('#counterDetails [data-go=counter]').click();
 check(await page.locator('#homePrimaryLabel').textContent()===homeLabel&&await page.locator('#homeSecondary').isHidden(),'Detail selection never substitutes the primary Home counter; visibility choice applies');
 await page.goBack();check(await page.locator('#counterDetails').isVisible(),'Browser Back restores counter details');
 await page.goForward();check(await page.locator('#counter').isVisible(),'Browser Forward restores Home');
 await page.reload();check(await page.locator('#homeSecondary').isHidden(),'Explicit secondary visibility preference survives reload');
 await page.locator('#counter [data-go=counterDetails]').click();await page.locator('#showHomeTimers').check();await page.locator('[data-display=cards]').click();
 await page.locator('#counterDetails [data-go=counter]').click();
 check(await page.locator('#homeSecondary').isVisible()&&await page.locator('#homePrimaryLabel').textContent()===homeLabel,'Equal-card detail preference keeps compact primary/secondary Home');
 check(await page.evaluate(({key,saved})=>{
  const current=JSON.parse(localStorage.getItem(key)),before=JSON.parse(saved);delete current.mode;delete before.mode;
  // Existing lazy timer normalization may project legacy scalar fields on a mode write.
  return current.updatedAt===before.updatedAt&&['journal','inventory','unknown','timers'].every(k=>JSON.stringify(current[k])===JSON.stringify(before[k]));
 },{key,saved}),'Counter preferences retain histories, timer records, unknown fields and recovery timestamp');
 for(const language of ['he','en','ru']){
  await page.locator('[data-language='+language+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,language);
  for(const colorScheme of ['light','dark'])for(const width of [360,390,1440]){
   await page.emulateMedia({colorScheme});await page.setViewportSize({width,height:width===1440?900:800});
   check(await page.evaluate(()=>{
    const first=document.getElementById('dailyReading').getBoundingClientRect(),last=document.querySelector('#counter .tool-links button:last-child').getBoundingClientRect(),footer=document.getElementById('tabs').getBoundingClientRect(),num=document.querySelector('#homePrimaryCount .num');
    return document.documentElement.scrollWidth<=innerWidth&&first.bottom<footer.top&&last.bottom<footer.top&&parseFloat(getComputedStyle(num).fontSize)<=36;
   }),'Compact status and five actions above footer '+language+' '+width+' '+colorScheme);
   await page.locator('#counter [data-go=counterDetails]').click();
   for(const mode of ['cards','compact','single']){
    await page.locator('[data-display='+mode+']').click();
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Details fit '+mode+' '+language+' '+width+' '+colorScheme);
   }
   await page.locator('#counterDetails [data-go=counter]').click();
  }
 }
 await page.setViewportSize({width:360,height:800});
 await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Large text Home remains readable without horizontal scrolling');
 await page.locator('#counter [data-go=inventory]').focus();await page.keyboard.press('Enter');check(await page.locator('#inventory').isVisible(),'Last daily action remains keyboard reachable with large text');
 return {passed:results.length,results};
}
