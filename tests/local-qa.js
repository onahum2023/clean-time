// Run with the Playwright MCP browser_run_code_unsafe tool (filename: tests/local-qa.js).
// Only localhost is allowed. Synthetic fixtures; no real auth, email, or cloud writes.
async (page) => {
  const results=[];
  const check=(value,label)=>{if(!value)throw new Error(label);results.push(label);};
  const origin='http://127.0.0.1:8765';
  const key='cleantime-he-v1';
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  await page.addInitScript(()=>{window.confirm=()=>true;});
  await page.goto(origin);
  const localDay=await page.evaluate(()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;});
  const oldDay='2025-02-10';
  const read=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  const go=async id=>{
    await page.locator('[data-tab="tools"]').click();await page.locator(`#tools [data-go="${id}"]`).click();
  };
  const seed=async data=>{await page.evaluate(({key,data})=>{localStorage.clear();if(data)localStorage.setItem(key,JSON.stringify(data));},{key,data});await page.reload();};
  await page.setViewportSize({width:360,height:800});
  await seed(null);
  await page.locator('#onboardingAccount').click();
  check(await page.locator('#syncOut').isVisible(),'Optional account path exposes existing magic-link UI');
  await page.locator('#authBack').click();
  check(await page.locator('#onboarding').isVisible(),'Account path returns to guest onboarding');
  for(const from of ['אלכוהול','סמים','עישון','אוכל','אחר']){
    await seed(null);
    await page.locator('#oDate').fill('2025-01-01');await page.locator('#oFrom').selectOption(from);
    await page.locator('#guestForm button').click();
    const state=await read();check(state.date==='2025-01-01'&&state.from===from&&state.name===''&&await page.locator('#counter').isVisible(),`Guest onboarding: ${from}`);
  }
  check((await page.locator('#count').innerText()).trim().length>0,'Clean-time counter visible');
  for(const id of ['planner','gratitude','meditation','inventory','readings']){
    await page.locator(`#counter [data-go="${id}"]`).click();check(await page.locator(`#${id}`).isVisible(),`Today opens ${id}`);await page.locator('[data-tab="counter"]').click();
  }
  await go('gratitude');
  for(const text of ['תודה ראשונה','תודה שנייה','תודה שלישית']){await page.locator('#gInput').fill(text);await page.locator('#gAdd').click();}
  check((await read()).gratitude.length===3,'Multiple gratitude entries on one day');
  check((await page.locator('#gList .txt').first().innerText()).includes('שלישית'),'Newest gratitude first');
  await page.locator('#gList li').filter({hasText:'תודה שנייה'}).getByRole('button',{name:'עריכה',exact:true}).click();
  await page.locator('#gList textarea').fill('תודה שנייה ערוכה');await page.locator('#gList button[type="submit"]').click();
  check((await read()).gratitude.some(g=>g.text==='תודה שנייה ערוכה'),'Edit gratitude');
  await page.locator('#gList li').filter({hasText:'תודה ראשונה'}).getByRole('button',{name:'מחיקה',exact:true}).click();
  check((await read()).gratitude.length===2,'Delete gratitude');
  await go('planner');
  for(const text of ['הליכה','שיחה','מנוחה']){await page.locator('#pInput').fill(text);await page.locator('#pAdd').click();}
  await page.locator('#pList [role="checkbox"]').first().click();
  await page.locator('#pList li').filter({hasText:'שיחה'}).getByRole('button',{name:'עריכה',exact:true}).click();
  await page.locator('#pList textarea').fill('שיחה עם חבר');await page.locator('#pList button[type="submit"]').click();
  await page.locator('#pList li').filter({hasText:'מנוחה'}).getByRole('button',{name:'מחיקה',exact:true}).click();
  await page.reload();await go('planner');
  check((await read()).plans[localDay].length===2&&(await read()).plans[localDay][0].done,'Plan edit/delete/check persists after refresh');
  await page.locator('#pList [role="checkbox"]').first().click();check(!(await read()).plans[localDay][0].done,'Plan uncheck persists');
  await go('inventory');
  await page.locator('#iSummary').fill('מחשבות לסוף היום');
  await page.locator('#iDay').fill(oldDay);await page.locator('#iDay').dispatchEvent('change');await page.locator('#iSummary').fill('יום קודם');
  await page.locator('#iHistory').selectOption(localDay);
  check(await page.locator('#iSummary').inputValue()==='מחשבות לסוף היום','Inventory revisits today');
  await page.reload();await go('inventory');check(await page.locator('#iSummary').inputValue()==='מחשבות לסוף היום','Inventory summary persists');
  await page.locator('#iHistory').selectOption(oldDay);check(await page.locator('#iSummary').inputValue()==='יום קודם','Inventory revisits prior day');
  await go('journal');await page.locator('#jNew').click();await page.locator('#jText').fill('יומן בדיקה');await page.locator('#jDone').click();
  check((await read()).journal[0].text==='יומן בדיקה','Existing journal remains usable');
  await page.locator('[data-tab="about"]').click();check((await page.locator('#about').innerText()).includes('הגיבוי אינו מוצפן'),'About discloses current cloud privacy limitation');
  await go('meditation');
  await page.evaluate(()=>{
    window.gongEvents=[];
    const original=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){window.gongEvents.push(this.src);return original.call(this);};
    window.qaOffset=0;window.qaRealNow=Date.now;Date.now=()=>window.qaRealNow()+window.qaOffset;
  });
  await page.locator('#mDuration').selectOption('1');await page.locator('#mStart').click();
  await page.evaluate(()=>window.qaOffset=20000);await page.waitForTimeout(300);await page.locator('#mStart').click();
  const paused=await page.locator('#mCountdown').innerText();await page.evaluate(()=>window.qaOffset+=10000);await page.waitForTimeout(300);
  check(await page.locator('#mCountdown').innerText()===paused,'Timer pause freezes remaining time');
  await page.locator('#mStart').click();await page.evaluate(()=>{window.qaOffset+=45000;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(300);
  check(await page.locator('#mCountdown').innerText()==='00:00','Timer catches up to wall clock after simulated background gap');
  check((await page.evaluate(()=>window.gongEvents)).length===2,'Start and end each invoke local gong once; resume does not');
  await page.waitForTimeout(300);check((await page.evaluate(()=>window.gongEvents)).length===2,'Completion gong is not repeated');
  await page.locator('#mReset').click();check(await page.locator('#mCountdown').innerText()==='01:00','Timer reset');
  await page.evaluate(()=>Date.now=window.qaRealNow);
  const fixture={name:'שם קיים',date:'2020-01-01',time:'12:30',from:'הימורים',mode:1,color:'rose',linksV:2,
    gratitude:[{id:1,text:'תודה ישנה',ts:new Date('2025-02-10T12:00:00').getTime()},{id:1,text:'תודה נוספת עם מזהה ישן כפול',ts:new Date('2025-02-10T14:00:00').getTime()}],
    plans:{[oldDay]:[{id:2,text:'תכנית קודמת',done:true}]},journal:[{id:3,text:'יומן קיים',created:1234567890000,updated:1234567890001}],links:[{id:20,title:'קישור אישי',url:'https://example.org/'}],updatedAt:1234567890002,customField:{keep:true}};
  await seed(fixture);await go('gratitude');
  check((await page.locator('#gList h3').allTextContents()).length===2,'Legacy gratitude grouped by day with today first');
  await page.locator('#gList li').filter({hasText:'תודה ישנה'}).getByRole('button',{name:'עריכה',exact:true}).click();await page.locator('#gList textarea').fill('תודה ישנה ערוכה');await page.locator('#gList button[type="submit"]').click();
  let state=await read();check(state.gratitude[0].ts===fixture.gratitude[0].ts&&state.gratitude[1].text===fixture.gratitude[1].text,'Legacy edit preserves timestamp and duplicate-ID neighbor');
  await go('planner');await page.locator('#pHistory').selectOption(oldDay);check(await page.locator('#pList [role="checkbox"]').getAttribute('aria-checked')==='true','Legacy plan history and completion preserved');
  state=await read();check(JSON.stringify(state.journal)===JSON.stringify(fixture.journal)&&JSON.stringify(state.links)===JSON.stringify(fixture.links)&&state.customField.keep,'Legacy journal, personal links, unknown fields preserved');
  const persisted=JSON.stringify(state);await page.reload();check(JSON.stringify(await read())===persisted,'Reload normalization is idempotent');
  for(const size of [{width:320,height:740},{width:360,height:800},{width:390,height:844},{width:1280,height:900}]){
    await page.setViewportSize(size);
    for(const id of ['counter','tools','about','planner','gratitude','inventory','meditation','readings','journal','settings']){
      if(['counter','tools','about'].includes(id))await page.locator(`[data-tab="${id}"]`).click();
      else if(id==='settings')await page.locator('#openSettings').click();else await go(id);
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow: ${id} at ${size.width}px`);
    }
  }
  await page.setViewportSize({width:360,height:800});
  check(await page.locator('html').getAttribute('dir')==='rtl','RTL document');
  await page.locator('[data-tab="counter"]').click();
  check(requests.every(url=>url.startsWith(origin)),'Guest makes only local requests');
  check(errors.length===0,'No page JavaScript errors');
  // Malformed local data must survive subsequent attempted saves unchanged.
  await page.evaluate(k=>{localStorage.clear();localStorage.setItem(k,'{broken');},key);await page.reload();
  check(await page.locator('#storageMsg').isVisible(),'Malformed storage shows warning');
  await page.locator('#oDate').fill('2025-01-01');await page.locator('#oFrom').selectOption('אחר');await page.locator('#guestForm button').click();
  check(await page.evaluate(k=>localStorage.getItem(k),key)==='{broken','Malformed original is never silently overwritten');
  // A fresh browser context mocks only the SDK/client; all network is still localhost-only.
  const context=await page.context().browser().newContext({viewport:{width:360,height:800}});
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  await context.addInitScript(({key,fixture})=>{
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));
    localStorage.setItem('cleantime-he-auth','synthetic-session');
    localStorage.setItem('cleantime-he-sync',JSON.stringify({uid:'qa-user',lastSync:1}));
    window.qaRemote={...fixture,updatedAt:fixture.updatedAt+100,inventory:{'2025-02-10':{summary:'סיכום מהענן',answers:{placeholder_2:'תשובה מהענן'},created:1,updated:2}}};window.qaUploads=[];
    const client={auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{user:{id:'qa-user',email:'qa@example.invalid'}}}}),signInWithOtp:async()=>({}),signOut:async()=>({})},from(){return {select(){return {eq(){return {maybeSingle:async()=>({data:{data:window.qaRemote,updated_at:new Date(window.qaRemote.updatedAt).toISOString()}})}}}},upsert:async row=>{window.qaUploads.push(row);window.qaRemote=row.data;return {};}}}};
    window.supabase={createClient:()=>client};
    const original=Element.prototype.appendChild;
    Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return original.call(this,el);};
  },{key,fixture});
  const cloud=await context.newPage();await cloud.goto(origin);await cloud.waitForTimeout(500);
  await cloud.locator('[data-tab="tools"]').click();await cloud.locator('#tools [data-go="inventory"]').click();await cloud.locator('#iHistory').selectOption(oldDay);
  check(await cloud.locator('#iSummary').inputValue()==='סיכום מהענן','Mock signed-in cloud pull loads inventory');
  await cloud.locator('#iSummary').fill('סיכום מעודכן');await cloud.waitForTimeout(2400);
  const uploads=await cloud.evaluate(()=>window.qaUploads);
  check(uploads.length>0&&uploads.at(-1).data.inventory[oldDay].summary==='סיכום מעודכן','Mock signed-in save uploads inventory through existing JSON row');
  check(!('mode' in uploads.at(-1).data)&&uploads.at(-1).user_id==='qa-user','Cloud upload preserves account scope and local-only mode exclusion');
  await cloud.evaluate(()=>{window.qaRemote={...window.qaRemote,updatedAt:Date.now()+1000,inventory:{...window.qaRemote.inventory,'2025-02-09':{summary:'יום נוסף בענן'}}};window.dispatchEvent(new Event('focus'));});await cloud.waitForTimeout(400);
  check((await cloud.locator('#iHistory option').allTextContents()).length===3,'Mock remote refresh updates inventory history');
  await context.close();
  await seed(fixture);await page.locator('[data-tab="counter"]').click();
  const report={passed:results.length,results,errors,network:'localhost only; no real email/auth/cloud operations'};
  await page.evaluate(report=>window.cleanTimeQA=report,report);
  return report;
}
