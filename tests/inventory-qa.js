// Complete, section-based IP #9; synthetic recovery content only.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8766',key='cleantime-he-v1',results=[],errors=[],external=[];
 const content=require(process.cwd()+'/assets/inventory-content.js');
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.fallback():(external.push(r.request().url()),r.abort()));
 const old={questionnaireVersion:'placeholder-v1',dailyQuestionnaireVersion:'na-ip9-daily-v1',answers:{na_ip9_q17:'synthetic old learning',na_ip9_he_2005_q06:'synthetic aliased kindness',placeholder_1:'synthetic legacy'},summary:'synthetic old reflection',created:1,updated:2,extra:{keep:true}};
 await page.addInitScript(({key,old})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({date:'2025-01-01',linksV:2,inventory:{'2025-01-10':old}}));},{key,old});
 await page.goto(origin);const enter=async()=>{if(!await page.locator('#inventory').isVisible())await page.locator('#counter [data-go=inventory]').click();};await enter();
 const day=await page.locator('#iDay').inputValue(),read=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),id=n=>'#iAnswer_na_ip9_q'+String(n).padStart(2,'0');
 check(await page.locator('#iQuestions textarea').count()===7&&!(await read()).inventory[day],'Section one opens without creating an entry');
 check(await page.locator('#iFocused,#iAll,#iSkip').count()===0,'No alternate mode or individual-question navigation');
 const seen=[];
 for(let section=0;section<5;section++){
  const [start,end]=content.sections[section];
  check(await page.locator('#iQuestions textarea').count()===end-start+1&&(await page.locator('#iStatement').textContent())===content.editions.he.statements[section],'Complete statement and question count, section '+(section+1));
  seen.push(...await page.locator('#iQuestions textarea').evaluateAll(nodes=>nodes.map(n=>n.id)));
  if(section===0){await page.locator(id(6)).fill('synthetic six answer');await page.locator('#iDismissGuidance').click();}
  await page.locator('#iNext').click();
  check(await page.evaluate(()=>document.getElementById('iPosition').getBoundingClientRect().top>=document.querySelector('.language-bar').getBoundingClientRect().bottom),'Section indicator/statement stay below sticky language bar '+section);
 }
 check(seen.length===36&&new Set(seen).size===36&&seen.every((value,i)=>value==='iAnswer_na_ip9_q'+String(i+1).padStart(2,'0')),'All 36 IDs occur exactly once in source order');
 check(await page.locator('#iClosing').isVisible()&&(await page.locator('#iPrayer').textContent())===content.editions.he.prayer,'Screen six has official prayer and notes');
 await page.locator('#iNotes').fill('synthetic closing notes');
 check((await read()).inventory[day].notes==='synthetic closing notes'&&!((await read()).inventory[day].finishedAt),'Notes autosave separately before finish');
 await page.locator('#iPrevious').click();await page.locator(id(36)).fill('synthetic closing choice');await page.reload();await enter();
 check(await page.locator(id(36)).inputValue()==='synthetic closing choice'&&(await page.locator('#iPosition').textContent()).includes('5 מתוך 6'),'Reload resumes unfinished section and answer');
 await page.locator('#iNext').click();check(await page.locator('#iNotes').inputValue()==='synthetic closing notes','Navigation preserves notes');
 await page.locator('#iFinish').click();
 check(await page.locator('#iReopen').isVisible()&&!!(await read()).inventory[day].finishedAt&&await page.locator('#iOutput').isVisible(),'Finish accepts partial inventory and offers private output');
 const finished=JSON.stringify((await read()).inventory[day]);await page.locator('#iReopen').click();check(JSON.stringify((await read()).inventory[day])===finished,'Review does not alter finished state');
 await page.locator(id(6)).fill('synthetic revised six');check(!(await read()).inventory[day].finishedAt,'Editing returns same record to draft');
 await page.locator('#iHistory').selectOption('2025-01-10');
 check(await page.locator(id(6)).inputValue()==='synthetic aliased kindness','Old Hebrew draft alias renders on its original question');
 await page.locator(id(6)).fill('synthetic canonical kindness');
 for(let i=0;i<5;i++)await page.locator('#iNext').click();
 check(await page.locator('#iSummary').inputValue()==='synthetic old reflection'&&await page.locator('#iLegacy').isVisible(),'Old summary and unknown answers remain accessible at closing');
 await page.locator('#iSummary').fill('synthetic revised reflection');await page.locator('#iNotes').fill('synthetic separate notes');
 const entry=(await read()).inventory['2025-01-10'];
 check(entry.questionnaireVersion===old.questionnaireVersion&&entry.created===1&&entry.answers.na_ip9_q17===old.answers.na_ip9_q17&&entry.answers.na_ip9_he_2005_q06===old.answers.na_ip9_he_2005_q06&&entry.answers.placeholder_1===old.answers.placeholder_1&&entry.extra.keep&&entry.notes==='synthetic separate notes'&&entry.summary==='synthetic revised reflection'&&entry.dailyQuestionnaireVersion==='na-ip9-full-v1','Additive full model preserves prior answers, versions and unknown fields');
 await page.locator('#iDay').fill('2025-01-11');await page.locator('#iDay').dispatchEvent('change');
 for(let i=0;i<5;i++)await page.locator('#iNext').click();await page.locator('#iFinish').click();
 check(Object.keys((await read()).inventory['2025-01-11'].answers).length===0&&!!(await read()).inventory['2025-01-11'].finishedAt,'Completely blank inventory can be finished');
 await page.locator('#iDay').fill('2025-01-12');await page.locator('#iDay').dispatchEvent('change');
 for(let section=0;section<5;section++){
  const fields=page.locator('#iQuestions textarea');for(let i=0;i<await fields.count();i++)await fields.nth(i).fill('synthetic complete answer '+section+' '+i);
  await page.locator('#iNext').click();
 }
 await page.locator('#iNotes').fill('synthetic complete notes');await page.locator('#iFinish').click();
 const complete=(await read()).inventory['2025-01-12'];check(Object.keys(complete.answers).length===36&&complete.finishedAt&&complete.notes==='synthetic complete notes','Fully answered inventory finishes in the same dated record');
 await page.locator('#iHistory').selectOption(day);
 await page.locator('#iAnswer_na_ip9_q01').focus();await page.keyboard.press('Tab');check(await page.locator('#iAnswer_na_ip9_q02').evaluate(n=>n===document.activeElement),'Question fields have predictable keyboard order');
 for(const width of [320,360,508,1280]){
  await page.setViewportSize({width,height:800});await page.locator(id(6)).fill('א'.repeat(900));
  check(await page.evaluate(()=>{const w=document.documentElement.clientWidth;return document.documentElement.scrollWidth<=w&&[...document.querySelectorAll('#iQuestions textarea')].every(n=>n.scrollWidth<=n.clientWidth&&n.scrollHeight<=n.clientHeight+2);}), 'Expanding fields fit '+width+'px');
 }
 await page.evaluate(()=>{window.qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='cleantime-he-v1')throw Error('synthetic quota');return window.qaSetItem.call(this,k,v);};});
 const durable=(await read()).inventory[day].answers.na_ip9_q06;await page.locator(id(6)).fill('synthetic unsaved');
 check((await page.locator('#iStatus').textContent()).includes('לא נשמר')&&(await read()).inventory[day].answers.na_ip9_q06===durable,'Quota failure keeps durable answers and reports unsaved');
 await page.evaluate(()=>{Storage.prototype.setItem=window.qaSetItem;});await page.locator(id(6)).fill('synthetic retry');
 check((await read()).inventory[day].answers.na_ip9_q06==='synthetic retry','Save recovers after quota failure');
 check(errors.length===0&&external.length===0,'No browser errors or external recovery requests');
 return {passed:results.length,results};
}
