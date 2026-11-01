// Owner integrated UAT follow-up: desktop composition, static content and real calendar wording.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const {normalize}=require(process.cwd()+'/assets/recovery-timers.js');
 const fixture=normalize({date:'2026-08-07',time:'',from:'סמים',linksV:2,links:[],updatedAt:1,retained:{unknown:'keep'},journal:[{id:1,text:'Synthetic history',created:1}]});
 fixture.timers.push({id:'second',category:'alcohol',label:'Synthetic optional recovery path',date:'2026-05-01',time:''});
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await page.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));},{key,fixture});
 await page.clock.install({time:new Date('2026-11-01T12:00:00Z')});await page.goto(origin);await page.locator('#counter').waitFor();
 const saved=await page.evaluate(key=>localStorage.getItem(key),key);
 const expectedLabels=['רק להיום','תכנון יומי','הכרת תודה','ככה זה עכשיו','חשבון נפש יומי / צעד 10'];
 check(JSON.stringify(await page.locator('.daily-card-title').allTextContents())===JSON.stringify(expectedLabels),'Five approved action labels and order are unchanged');
 check(await page.locator('#dailyReading').getAttribute('href')==='https://www.naisrael.org.il/just-for-today/'&&await page.locator('#dailyReading').getAttribute('rel')==='noopener noreferrer','Official reading stays an explicit external link');
 check(await page.locator('.home-notes article').count()===3&&await page.locator('.home-reflection').count()===1,'Exactly three static cards and one reflection strip');
 check(await page.locator('.home-notes :is(a,button,input,select,textarea),.home-reflection :is(a,button,input,select,textarea)').count()===0,'Static placeholders have no CTA, preference or simulated interaction');
 for(const language of ['he','en','ru']){
  await page.locator('[data-language='+language+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,language);
  check(await page.locator('.summary-duration').textContent()===await page.evaluate(()=>['month','day'].map((unit,i)=>new Intl.NumberFormat(CleanTimeI18n.locale,{style:'unit',unit,unitDisplay:'long'}).format(i?25:2)).join(' ')),'Natural calendar wording: two months and 25 days '+language);
  for(const mode of ['light','dark']){
   await page.emulateMedia({colorScheme:mode});
   for(const width of [320,390,1024,1440]){
    await page.setViewportSize({width,height:width>=1024?900:844});await page.mouse.move(0,0);
    const desktop=width>=1024;
    check(await page.locator('.home-heading').isVisible()===desktop&&await page.locator('.home-notes').isVisible()===desktop&&await page.locator('.home-reflection').isVisible()===desktop,'Desktop context/placeholders are absent from mobile '+language+' '+width+' '+mode);
    check(await page.locator('.home-action-description').first().isVisible()===desktop&&await page.locator('.summary-duration').isVisible()===desktop,'Desktop descriptions and duration preserve mobile summary '+language+' '+width+' '+mode);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home has no horizontal overflow '+language+' '+width+' '+mode);
    if(desktop){
     check(await page.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect(),notes=r('.home-notes'),counter=r('.recovery-summary'),strip=r('.home-reflection'),actions=r('.today-actions'),home=r('#counter'),date=document.getElementById('homeDate');return notes.top>counter.bottom&&Math.abs(notes.width-counter.width)<1&&strip.top>=Math.max(notes.bottom,actions.bottom)&&Math.abs(strip.width-home.width)<1&&date.dateTime==='2026-11-01'&&date.textContent.length>10;}),'Counter, supporting cards and reflection form a single bounded canvas '+language+' '+width+' '+mode);
     check(await page.locator('.home-notes').innerText().then(t=>language==='he'||!/[\u0590-\u05ff]/.test(t))&&await page.locator('.home-reflection').innerText().then(t=>language==='he'||!/[\u0590-\u05ff]/.test(t)),'All static copy is translated '+language+' '+width+' '+mode);
    }
   }
  }
 }
 await page.setViewportSize({width:1440,height:900});
 for(const palette of ['original','forest','rainy','sunny']){
  await page.locator('#openSettings').click();await page.locator('[name=palette][value='+palette+']').check();await page.locator('[data-tab=counter]').click();
  for(const mode of ['light','dark']){
   await page.emulateMedia({colorScheme:mode});
   check(await page.evaluate(()=>{const card=document.querySelector('.recovery-summary');return getComputedStyle(card).backgroundColor!=='rgba(0, 0, 0, 0)'&&document.documentElement.scrollWidth<=innerWidth;}),'Counter surface and bounds follow palette/mode '+palette+' '+mode);
  }
 }
 const contrast=await page.evaluate(()=>{
  const root=document.documentElement,before={palette:root.dataset.palette,theme:root.dataset.theme,background:root.dataset.background,accent:root.dataset.accent},ctx=document.createElement('canvas').getContext('2d'),failures=[];let count=0;
  const lum=value=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);};
  const selectors=['.home-summary-title','.summary-duration','.summary-since','.home-identity','.secondary-summary strong','.secondary-summary>span','.home-notes h3','.home-notes p','.home-reflection','.daily-card-title','.home-action-description','.home-action-cue'];
  for(const palette of CleanTimeVisualTheme.palettes)for(const mode of ['light','dark'])for(const background of CleanTimeAppearance.backgrounds)for(const accent of CleanTimeAppearance.accents){
   Object.assign(root.dataset,{palette,theme:mode,background,accent});
   for(const selector of selectors){const el=document.querySelector(selector),fg=getComputedStyle(el).color;let parent=el,bg='rgba(0, 0, 0, 0)';while(parent&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(parent).backgroundColor;parent=parent.parentElement;}const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)failures.push([palette,mode,background,accent,selector,ratio]);count++;}
  }
  for(const [key,value] of Object.entries(before))if(value===undefined)delete root.dataset[key];else root.dataset[key]=value;
  return {count,failures};
 });
 check(contrast.count===5184&&!contrast.failures.length,'5184 actual Home text/surface combinations meet 4.5:1 contrast: '+JSON.stringify(contrast.failures.slice(0,5)));
 await page.locator('#dailyReading').focus();
 for(const destination of ['planner','gratitude','journal','inventory']){
  await page.keyboard.press('Tab');check(await page.locator('#counter [data-go='+destination+']').evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Desktop action sequence and visible focus '+destination);
 }
 await page.keyboard.press('Enter');check(await page.locator('#inventory').isVisible(),'Last action navigates with Enter');await page.locator('[data-tab=counter]').click();
 await page.locator('#openSettings').click();await page.locator('#showMilestones').uncheck();await page.locator('#settings [data-go=counterDetails]').click();await page.locator('#showHomeTimers').uncheck();await page.locator('[data-tab=counter]').click();
 check(await page.locator('#milestone').isHidden()&&await page.locator('#homeSecondary').isHidden(),'Existing keytag and secondary-display preferences still apply');
 check(await page.evaluate(key=>localStorage.getItem(key),key)===saved,'Home layout, palettes, locale and device preferences preserve exact recovery bytes');
 await page.reload();check(await page.locator('#milestone').isHidden()&&await page.locator('#homeSecondary').isHidden(),'Existing display preferences persist across reload');
 // Regression for clamped anniversaries and optional start time, not approximate 30-day units.
 for(const [date,time,now,parts] of [['2026-01-31','','2026-02-28T12:00:00',[1,'month']],['2024-02-29','','2025-02-28T12:00:00',[1,'year']],['2026-08-07','14:00','2026-11-01T13:00:00',[2,'month',24,'day']]]){
  await page.clock.setFixedTime(new Date(now));await page.evaluate(({key,date,time})=>{const state=JSON.parse(localStorage.getItem(key));state.date=date;state.time=time;state.timers[0].date=date;state.timers[0].time=time;localStorage.setItem(key,JSON.stringify(state));},{key,date,time});await page.reload();
  const expected=await page.evaluate(parts=>{const out=[];for(let i=0;i<parts.length;i+=2)out.push(new Intl.NumberFormat(CleanTimeI18n.locale,{style:'unit',unit:parts[i+1],unitDisplay:'long'}).format(parts[i]));return out.join(' ');},parts);
  check(await page.locator('.summary-duration').textContent()===expected,'Calendar duration respects clamped month/leap anniversary and start time '+date+' '+time);
 }
 return {passed:results.length,results};
}
