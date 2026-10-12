// Synthetic fixtures only. No real account, recovery data or external reading fetch.
async(page)=>{
 const results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',linksV:2,links:[{id:1,title:'רק להיום',url:'https://www.naisrael.org.il/just-for-today/'},{id:2,title:'משאב בדיקה',url:'https://example.invalid/resource'},{id:3,title:'קישור ישן',url:'javascript:alert(1)'}],journal:[{id:5,text:'סינתטי',created:1}],inventory:{'2025-01-01':{summary:'ישן',answers:{legacy:'נשמר'}}},updatedAt:1}));});
 await page.goto(origin);const saved=await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'));
 check((await page.locator('#counter .tool-links > *').allTextContents()).join('|')==='רק להיום|ככה זה עכשיו (יומן)|הכרת תודה|תכנית רק להיום|חשבון נפש יומי / צעד 10','Exactly five ordered daily actions');
 check(await page.locator('#counter .today-actions h2').innerText()==='התחברות'&&await page.locator('#counter .today-actions h2').evaluate(e=>getComputedStyle(e).textAlign)==='center','Approved Home heading centered above daily actions');
 check(await page.locator('#dailyReading').getAttribute('href')==='https://www.naisrael.org.il/just-for-today/'&&await page.locator('#dailyReading').getAttribute('target')==='_blank'&&(await page.locator('#dailyReading').getAttribute('rel')).includes('noreferrer'),'Exact daily URL opens separately with safe return');
 for(const id of ['planner','gratitude','journal','inventory']){await page.locator('#counter [data-go='+id+']').click();check(await page.locator('#'+id).isVisible(),'One tap to '+id);await page.goBack();check(await page.locator('#counter').isVisible(),'Browser Back from '+id);await page.goForward();check(await page.locator('#'+id).isVisible(),'Forward to '+id);await page.goBack();}
 await page.locator('[data-tab=tools]').click();
 check(await page.locator('#recoveryDestinations [data-go]').count()===2,'Only meditation/bookmarks supplement daily actions');
 check(await page.locator('#recoveryDestinations a').count()===1&&await page.locator('#recoveryDestinations a').getAttribute('href')==='https://example.invalid/resource','Resources open directly without category navigation or duplicated daily reading');
 check(await page.locator('#recoveryDestinations .unavailable-resource').count()===1,'Unsafe legacy link stays visible but cannot open');
 check(await page.locator('#tabs #openSettings').isVisible()&&await page.locator('header button').count()===0,'Shared Settings/Account in footer; no top gear');
 await page.locator('#openSettings').click();await page.locator('#myAccount').click();check(await page.locator('#accountGuest').isVisible(),'Footer reaches guest Account');await page.goBack();check(await page.locator('#settings').isVisible(),'Account Back reaches Settings');await page.goBack();
 for(const colorScheme of ['light','dark'])for(const width of [320,360,390,1280]){
  await page.emulateMedia({colorScheme});await page.setViewportSize({width,height:800});
  for(const tab of ['counter','tools','about']){await page.locator('[data-tab='+tab+']').click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.documentElement).direction==='rtl'),'RTL/no overflow '+tab+' '+width+' '+colorScheme);}
 }
 await page.reload();check(await page.locator('#counter').isVisible(),'Reload directly returns to Home');
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===saved,'Navigation/reload preserves complete recovery bytes');
 return {passed:results.length,results};
}
