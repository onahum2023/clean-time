// Synthetic Step 10 journeys; no live account or recovery data.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(value,label)=>{if(!value)throw Error(label);results.push(label);};
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
 await page.context().route('**/*',r=>{if(r.request().url().startsWith(origin+'/'))return r.fallback();external.push(r.request().url());return r.abort();});
 await page.addInitScript(({key})=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({date:'2025-01-01',linksV:2,inventory:{'2025-01-10':{questionnaireVersion:'placeholder-v1',answers:{placeholder_1:'synthetic legacy',future:'synthetic future'},summary:'old summary',created:1,updated:2,extra:{keep:true}}}}));
 },{key});
 await page.goto(origin);await page.locator('[data-go="inventory"]').first().click();
 const today=await page.locator('#iDay').inputValue();
 const state=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const answer=n=>page.locator('#iAnswer_na_ip9_he_2005_q'+String(n).padStart(2,'0'));
 check(await page.locator('#iQuestions textarea').count()===1&&await page.locator('#iFocused').getAttribute('aria-pressed')==='true','Focused default uses one question');
 check((await state()).inventory[today]===undefined,'Opening a day creates no entry');
 await answer(6).fill('synthetic first answer');
 const stamp=(await state()).updatedAt;
 await page.locator('#iAll').click();
 check(await page.locator('#iQuestions textarea').count()===6&&await answer(6).inputValue()==='synthetic first answer','Switch mid-answer retains typed content');
 check((await state()).updatedAt===stamp,'Presentation changes do not update recovery state');
 check(JSON.stringify(await page.locator('#iQuestions textarea').evaluateAll(nodes=>nodes.map(n=>n.id)))===JSON.stringify([6,10,17,25,31,36].map(n=>'iAnswer_na_ip9_he_2005_q'+String(n).padStart(2,'0'))),'Approved question order is stable');
 await answer(25).fill('synthetic fourth answer');await page.locator('#iFocused').click();
 check(await answer(25).inputValue()==='synthetic fourth answer'&&(await page.locator('#iPosition').innerText()).includes('4 מתוך 6'),'All-view focus becomes remembered focused position');
 await page.locator('#iPrevious').click();await page.locator('#iSkip').click();
 check(await answer(25).inputValue()==='synthetic fourth answer'&&!Object.hasOwn((await state()).inventory[today].answers,'na_ip9_he_2005_q17'),'Skip leaves unanswered question untouched');
 await page.reload();await page.locator('[data-go="inventory"]').first().click();
 check(await answer(25).inputValue()==='synthetic fourth answer','Reload restores current position and answer');
 await page.locator('#iSummary').fill('synthetic summary');await page.locator('#iFinish').click();
 check(!!(await state()).inventory[today].finishedAt&&await page.locator('#iReopen').isVisible(),'Finish accepts partial answers');
 await page.reload();await page.locator('[data-go="inventory"]').first().click();
 check(await page.locator('#iReopen').isVisible()&&(await page.locator('#iCompletion').innerText()).includes('סיימת'),'Finished is distinct from autosaved after reload');
 await page.locator('#iReopen').click();await answer(25).fill('synthetic revised answer');
 check(!(await state()).inventory[today].finishedAt,'Reopen clears finished marker and permits edits');
 await page.locator('#iHistory').selectOption('2025-01-10');
 check(await page.locator('#iSummary').inputValue()==='old summary'&&await page.locator('#iLegacy').isVisible(),'Legacy summaries and old answers remain accessible');
 await answer(6).fill('synthetic additive answer');
 let old=(await state()).inventory['2025-01-10'];
 check(old.answers.placeholder_1==='synthetic legacy'&&old.answers.future==='synthetic future'&&old.extra.keep&&old.created===1&&old.questionnaireVersion==='placeholder-v1'&&old.dailyQuestionnaireVersion==='na-ip9-he-2005-daily-v1','Additive questions preserve legacy metadata and answers');
 await page.locator('#iHistory').selectOption(today);check(await answer(25).inputValue()==='synthetic revised answer','Days remain independent');
 await page.locator('#iAll').click();
 for(const width of [320,360,508,1280]){
  await page.setViewportSize({width,height:800});await answer(6).fill('א'.repeat(600));
  check(await page.evaluate(()=>{const w=document.documentElement.clientWidth;return document.documentElement.scrollWidth<=w&&[...document.querySelectorAll('#inventory textarea')].every(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=w&&n.scrollWidth<=n.clientWidth;});}),'RTL fields fit '+width+'px');
 }
 await page.setViewportSize({width:360,height:800});
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/clean-time-inventory-all-360.png',fullPage:true});
 await page.locator('#iFocused').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/clean-time-inventory-focused-360.png',fullPage:true});
 await page.context().setOffline(true);await answer(6).fill('synthetic offline answer');
 check((await state()).inventory[today].answers.na_ip9_he_2005_q06==='synthetic offline answer','Guest edits persist offline');
 await page.context().setOffline(false);
 await page.evaluate(()=>{window.qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='cleantime-he-v1')throw new DOMException('Synthetic quota','QuotaExceededError');return window.qaSetItem.call(this,k,v);};});
 await answer(6).fill('synthetic unsaved answer');
 check((await page.locator('#iStatus').innerText()).includes('לא נשמר')&&(await state()).inventory[today].answers.na_ip9_he_2005_q06==='synthetic offline answer','Storage failure reports unsaved and retains durable copy');
 await page.locator('#iFinish').click();check(await page.locator('#iFinish').isVisible()&&!await page.locator('#iReopen').isVisible(),'Failed finish never claims durable completion');
 await page.evaluate(()=>{Storage.prototype.setItem=window.qaSetItem;});await answer(6).fill('synthetic retry answer');
 check((await state()).inventory[today].answers.na_ip9_he_2005_q06==='synthetic retry answer','Save recovers after storage failure');
 check(errors.length===0,'No browser errors');
 check(external.length===0,'Guest inventory sends no external requests');
 return {passed:results.length,results};
}
