// Additional localhost-only edge tests. Run after local-qa.js using Playwright MCP.
async (page)=>{
 const origin=(process.env.QA_BASE_URL||'http://127.0.0.1:8765'),key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const context=await page.context().browser().newContext({viewport:{width:360,height:800}});
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 const p=await context.newPage();await p.goto(origin);
 const fixture={date:'2025-01-01',gratitude:[{id:1,text:'ישן',ts:1739181600000}],plans:{},journal:[],links:[{id:10,title:'אישי',url:'https://example.org/'}],updatedAt:10};
 await p.evaluate(({key,fixture})=>localStorage.setItem(key,JSON.stringify(fixture)),{key,fixture});await p.reload();
 let data=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 check(data.linksV===2&&data.links.some(l=>l.title==='אישי')&&data.gratitude[0].ts===fixture.gratitude[0].ts&&data.updatedAt===10,'Existing links migration preserves personal data and sync timestamp');
 const serialized=JSON.stringify(data);await p.reload();check(await p.evaluate(k=>localStorage.getItem(k),key)===serialized,'Existing links migration is idempotent');
 await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="inventory"]').click();
 await p.evaluate(k=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===k)throw new DOMException('Quota','QuotaExceededError');return window.originalSetItem.call(this,name,value);};},key);
 await p.locator('#iSummary').fill('לא נשמר');
 check(await p.locator('#storageMsg').isVisible()&&await p.locator('#iStatus').innerText()==='לא נשמר במכשיר','Storage failure is visible; inventory does not claim success');
 check(!(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)).inventory[await p.locator('#iDay').inputValue()],'Failed storage write retains original persisted state');
 await p.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await p.reload();
 // Move the whole Date constructor across local midnight, not only Date.now().
 await p.evaluate(()=>{
  window.RealDate=Date;const n=new Date();n.setHours(23,59,59,0);window.clockNow=n.getTime();
  window.Date=class extends window.RealDate{constructor(...args){super(...(args.length?args:[window.clockNow]));}static now(){return window.clockNow;}};
 });
 await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="planner"]').click();await p.locator('#pInput').fill('אתמול');await p.locator('#pAdd').click();
 const previousDay=await p.locator('#pHistory').inputValue();await p.evaluate(()=>window.clockNow+=2000);await p.waitForTimeout(1200);
 check(await p.locator('#pList .plan-item').count()===0&&await p.locator('#pHistory').inputValue()!==previousDay,'Midnight opens a fresh daily plan');
 check((await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)).plans[previousDay][0].text==='אתמול','Midnight retains prior plan');
 await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="gratitude"]').click();await p.locator('#gInput').fill('היום');await p.locator('#gAdd').click();
 await p.evaluate(()=>window.clockNow+=86400000);await p.waitForTimeout(1200);
 check(await p.locator('#gList h3').count()===3,'Midnight moves gratitude into history and adds a fresh today group');
 await p.evaluate(()=>window.Date=window.RealDate);
 await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="meditation"]').click();
 await p.evaluate(()=>{window.audioPlays=[];window.audioErrors=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){const result=play.call(this);window.audioPlays.push(this);result.catch(e=>window.audioErrors.push(e.name));return result;};});
 await p.locator('#mDuration').selectOption('1');await p.locator('#mStart').click();await p.waitForTimeout(200);
 check(await p.evaluate(()=>window.audioPlays[0].duration===3&&window.audioPlays[0].readyState>=2&&!window.audioPlays[0].paused&&window.audioErrors.length===0),'Local gong decodes and browser playback succeeds');
 await p.evaluate(()=>{
  const now=Date.now;Date.now=()=>now()+61000;document.getElementById('mStart').click();Date.now=now;
 });
 check(await p.locator('#mCountdown').innerText()==='00:00'&&await p.locator('#mStart').innerText()==='התחלה','Pause at an expired deadline completes instead of stranding the timer');
 check(await p.evaluate(()=>window.audioPlays.length===2),'Expired-deadline action rings end gong once');
 await p.locator('#mReset').click();
 await p.evaluate(()=>{const option=new Option('QA: 1.2 seconds','0.02');document.getElementById('mDuration').append(option);});
 await p.locator('#mDuration').selectOption('0.02');await p.locator('#mStart').click();await p.waitForTimeout(1700);
 check(await p.locator('#mCountdown').innerText()==='00:00'&&await p.locator('#mStatus').innerText()==='הזמן הסתיים.','Real short countdown completes without advancing the clock');
 check(await p.evaluate(()=>window.audioPlays.length===4&&window.audioErrors.length===0),'Real short countdown plays both gong sounds successfully');
 await context.close();return {passed:results.length,results};
}
