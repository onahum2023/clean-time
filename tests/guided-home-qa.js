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
 check(await page.locator('#counter .daily-cards > *').count()===5,'All five daily actions remain available without completion gates');
 check(await page.locator('.daily-card-title').last().textContent()==='חשבון נפש יומי / צעד 10','Fifth card retains the full Step 10 label');
 await page.locator('#dailyReading').focus();
 for(const destination of ['planner','gratitude','journal','inventory']){
  await page.keyboard.press('Tab');
  check(await page.locator('#counter [data-go='+destination+']').evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Keyboard order and visible focus: '+destination);
 }
 check(await page.locator('#counter [data-go=counterDetails]').count()===0,'Counter configuration entry is absent from Home');
 const homeLabel=await page.locator('#homePrimaryLabel').textContent();
 await page.locator('#openSettings').click();await page.locator('#settings [data-go=counterDetails]').focus();await page.keyboard.press('Enter');
 check(await page.locator('#counterDetails').isVisible()&&await page.locator('#counterDetails h2').evaluate(e=>e===document.activeElement),'Keyboard opens details and focuses its heading');
 check(await page.locator('#openSettings').getAttribute('aria-current')==='page','Details remains part of Settings navigation');
 await page.locator('#counterDetails .btn.ghost').focus();await page.keyboard.press('Enter');
 check(await page.locator('#settings').isVisible()&&await page.locator('#setTitle').evaluate(e=>e===document.activeElement),'Keyboard Back to Settings restores the Settings heading');
 await page.goBack();
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
 await page.locator('[data-tab=counter]').click();
 check(await page.locator('#homePrimaryLabel').textContent()===homeLabel&&await page.locator('#homeSecondary').isHidden(),'Detail selection never substitutes the primary Home counter; visibility choice applies');
 await page.goBack();check(await page.locator('#counterDetails').isVisible(),'Browser Back restores counter details');
 await page.goForward();check(await page.locator('#counter').isVisible(),'Browser Forward restores Home');
 await page.reload();check(await page.locator('#homeSecondary').isHidden(),'Explicit secondary visibility preference survives reload');
 await page.locator('#openSettings').click();await page.locator('#settings [data-go=counterDetails]').click();await page.locator('#showHomeTimers').check();await page.locator('[data-display=cards]').click();
 await page.locator('[data-tab=counter]').click();
 check(await page.locator('#homeSecondary').isVisible()&&await page.locator('#homePrimaryLabel').textContent()===homeLabel,'Equal-card detail preference keeps compact primary/secondary Home');
 check(await page.evaluate(({key,saved})=>{
  const current=JSON.parse(localStorage.getItem(key)),before=JSON.parse(saved);delete current.mode;delete before.mode;
  // Existing lazy timer normalization may project legacy scalar fields on a mode write.
  return current.updatedAt===before.updatedAt&&['journal','inventory','unknown','timers'].every(k=>JSON.stringify(current[k])===JSON.stringify(before[k]));
 },{key,saved}),'Counter preferences retain histories, timer records, unknown fields and recovery timestamp');
 for(const language of ['he','en','ru']){
  await page.locator('[data-language='+language+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,language);
  for(const colorScheme of ['light','dark'])for(const width of [320,360,390,1440]){
   await page.emulateMedia({colorScheme});await page.setViewportSize({width,height:width===1440?900:800});
   check(await page.evaluate(()=>{
    const first=document.getElementById('dailyReading').getBoundingClientRect(),footer=document.getElementById('tabs').getBoundingClientRect(),num=document.querySelector('#homePrimaryCount .num');
    return document.documentElement.scrollWidth<=innerWidth&&(innerWidth>=768?first.top>=footer.bottom:first.bottom<footer.top)&&parseFloat(getComputedStyle(num).fontSize)<=36;
   }),'Compact status and first daily actions above footer '+language+' '+width+' '+colorScheme);
   check(await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.daily-cards > *')],r=cards.map(e=>e.getBoundingClientRect()),grid=document.querySelector('.daily-cards').getBoundingClientRect(),rtl=document.documentElement.dir==='rtl',near=(a,b)=>Math.abs(a-b)<1;
    return r.length===5&&near(r[0].top,r[1].top)&&near(r[2].top,r[3].top)&&r[2].top>r[0].bottom&&near(r[0].left,r[2].left)&&near(r[1].left,r[3].left)&&(rtl?r[0].left>r[1].left:r[0].left<r[1].left)&&near(r[4].width,grid.width)&&near(r[4].top-Math.max(r[2].bottom,r[3].bottom),parseFloat(getComputedStyle(document.querySelector('.daily-cards')).rowGap))&&cards.every(e=>e.scrollWidth<=e.clientWidth&&e.getBoundingClientRect().height>=44);
   }),'Two by two cards in reading order followed immediately by full-width Step 10 '+language+' '+width+' '+colorScheme);
   check(await page.evaluate(()=>{
    const card=document.querySelector('.daily-card'),welcome=document.querySelector('.welcome-feature-list li'),a=getComputedStyle(card),b=getComputedStyle(welcome);
    return ['backgroundColor','borderWidth','borderRadius'].every(k=>a[k]===b[k])&&getComputedStyle(card.querySelector('.page-art')).color===getComputedStyle(welcome.querySelector('.page-art')).color;
   }),'Home cards retain Welcome surface, corner and icon treatment '+language+' '+width+' '+colorScheme);
   check(await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.daily-card')].map(e=>getComputedStyle(e)),gap=parseFloat(getComputedStyle(document.querySelector('.daily-cards')).rowGap),badge=document.getElementById('milestone').getBoundingClientRect();
    return gap===(innerWidth<=340?12:16)&&cards.every(c=>c.borderColor===cards[0].borderColor&&c.boxShadow===cards[0].boxShadow&&c.boxShadow!=='none')&&badge.width>=50&&badge.height>=70;
   }),'Consistent soft outlines and elevation, roomier gaps and readable badge '+language+' '+width+' '+colorScheme);
   await page.locator('#openSettings').click();await page.locator('#settings [data-go=counterDetails]').click();
   for(const mode of ['cards','compact','single']){
    await page.locator('[data-display='+mode+']').click();
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Details fit '+mode+' '+language+' '+width+' '+colorScheme);
   }
   await page.locator('[data-tab=counter]').click();
  }
 }
 await page.setViewportSize({width:360,height:800});
 await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Large text Home remains readable without horizontal scrolling');
 await page.locator('#counter [data-go=inventory]').focus();await page.keyboard.press('Enter');check(await page.locator('#inventory').isVisible(),'Last daily action remains keyboard reachable with large text');
 return {passed:results.length,results};
}
