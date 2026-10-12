async(page)=>{
 const results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',time:'10:00',from:'אחר',linksV:2,links:[],journal:[{id:1,text:'סינתטי',created:1}],gratitude:[{id:2,text:'תודה',created:1}],plans:{'2024-01-01':[{id:3,text:'ישן',done:true}]},inventory:{'2024-01-01':{summary:'ישן',answers:{old:'נשמר'},future:'unknown'}},bookmarks:[{id:4,title:'בדיקה',url:'https://example.invalid'}],unknownRecovery:{value:'נשמר'},updatedAt:1}));});
 await page.goto(origin);const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1'))),before=await read();
 check(await page.locator('#milestone').isVisible(),'Reached milestone badge appears by default');
 await page.locator('#openSettings').click();await page.locator('#showMilestones').uncheck();await page.locator('[data-tab=counter]').click();check(await page.locator('#milestone').isHidden(),'Explicit hide preference removes badge');await page.reload();check(await page.locator('#milestone').isHidden(),'Explicit hide choice survives reload');
 await page.locator('#openSettings').click();await page.locator('#sDate').fill('2026-01-01');await page.locator('#saveSettings').click();
 check(await page.locator('#ask').isVisible()&&(await page.locator('#askP').innerText()).includes('נשמרים'),'Changing date explicitly confirms retained history');
 await page.locator('#askB button').filter({hasText:'ביטול'}).click();check(JSON.stringify(await read())===JSON.stringify(before),'Cancel does not change state/timestamp');
 await page.locator('#saveSettings').click();await page.locator('#askB button').filter({hasText:'עדכון התאריך'}).click();const after=await read();
 check(after.date==='2026-01-01'&&after.updatedAt>before.updatedAt,'Approved date change updates profile');
 check(['journal','gratitude','plans','inventory','bookmarks','links','unknownRecovery'].every(k=>JSON.stringify(after[k])===JSON.stringify(before[k])),'All history and legacy/unknown recovery fields retained');
 await page.reload();check((await read()).date==='2026-01-01','New date persists on reload');
 await page.locator('#openSettings').click();await page.locator('#showMilestones').check();await page.locator('[data-tab=counter]').click();check(await page.locator('#milestone').isVisible()&&!(await page.locator('#milestone').innerText()).includes('רצף'),'Calm optional informational milestone');
 const snapshot=await read();await page.reload();check(await page.locator('#milestone').isVisible()&&JSON.stringify(await read())===JSON.stringify(snapshot),'Milestone preference reloads without recovery rewrite');
 // Pure calendar cases, evaluated under multiple browser time zones with real Date behavior.
 for(const timezoneId of ['Asia/Jerusalem','America/New_York','Pacific/Auckland']){
  const c=await page.context().browser().newContext({timezoneId});await c.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());const p=await c.newPage();await p.goto(origin);
  const values=await p.evaluate(()=>{
   const f=d=>[d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours()].join('-'),m=CleanTimeDates.addMonths,all=CleanTimeDates.milestones;
   return {leap:f(m(new Date(2024,1,29,10),12)),end:f(m(new Date(2025,7,31,10),6)),before:all(new Date(2026,0,1,10),new Date(2026,0,31,9,59)).length,at:all(new Date(2026,0,1,10),new Date(2026,0,31,10)).at(-1)?.label,dst:all(new Date(2026,2,1,10),new Date(2026,2,31,10)).at(-1)?.label,annual:all(new Date(2024,1,29,10),new Date(2026,1,28,10)).at(-1)?.label,thresholds:[...[[30,'30 ימים'],[60,'60 ימים'],[90,'90 ימים']].map(([days,label])=>{const date=new Date(2024,0,1,10);date.setDate(date.getDate()+days);return all(new Date(2024,0,1,10),date).at(-1)?.label===label;}),...[[6,'6 חודשים'],[9,'9 חודשים'],[12,'שנה'],[18,'18 חודשים']].map(([months,label])=>all(new Date(2024,0,1,10),m(new Date(2024,0,1,10),months)).at(-1)?.label===label)].every(Boolean)};
  });
  check(values.leap==='2025-2-28-10','Leap-day anniversary clamped '+timezoneId);check(values.end==='2026-2-28-10','Month-end anniversary clamped '+timezoneId);check(values.before===0&&values.at==='30 ימים','Milestone respects selected local time '+timezoneId);check(values.dst==='30 ימים','Calendar days survive DST '+timezoneId);check(values.annual==='2 שנים','Annual anniversary '+timezoneId);check(values.thresholds,'All required thresholds '+timezoneId);await c.close();
 }
 await page.locator('#openSettings').click();await page.locator('#sDate').fill('2026-02-01');await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('quota');};});await page.locator('#saveSettings').click();await page.locator('#askB button').filter({hasText:'עדכון התאריך'}).click();check(JSON.stringify(await read())===JSON.stringify(snapshot)&&await page.locator('#settings').isVisible(),'Storage failure keeps previous recovery state/settings');
 return {passed:results.length,results};
}
