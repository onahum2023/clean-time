// Synthetic keyboard regression; external traffic is blocked.
async(page)=>{
 const results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(()=>{localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',journal:[{id:1,text:'סינתטי',created:1}],updatedAt:1}));});
 await page.setViewportSize({width:360,height:800});await page.goto(origin);
 await page.locator('#counter [data-go=journal]').click();await page.locator('#jList [role=button]').click();
 check(await page.locator('#jText').evaluate(el=>el===document.activeElement),'Existing entry receives focus');
 check(await page.locator('#jEditor').getAttribute('aria-modal')==='true','Journal announces modality');
 for(let i=0;i<12;i++){
  await page.keyboard.press(i%2?'Shift+Tab':'Tab');
  check(await page.evaluate(()=>document.getElementById('jEditor').contains(document.activeElement)),'Focus stays in editor '+i);
 }
 await page.evaluate(()=>document.getElementById('openSettings').focus());
 check(await page.evaluate(()=>document.getElementById('jEditor').contains(document.activeElement)),'Background cannot receive programmatic focus');
 await page.locator('#jText').fill('סינתטי מעודכן');await page.keyboard.press('Escape');await page.locator('#jEditor').waitFor({state:'hidden'});
 check(await page.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')).journal[0].text==='סינתטי מעודכן'),'Escape commits entry');
 check(await page.evaluate(()=>!document.querySelector('.app').inert&&!document.getElementById('tabs').inert),'Background released on Escape');
 await page.goForward();await page.locator('#jEditor').waitFor({state:'visible'});
 check(await page.locator('#jText').evaluate(el=>el===document.activeElement),'History reopening restores modal focus');
 await page.locator('#jDone').click();await page.locator('#jEditor').waitFor({state:'hidden'});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=360),'360px no overflow');
 await page.goto(origin+'/about/');check(!(await page.locator('main').innerText()).includes('סופרת טעינות של דף הבית'),'Public About has current Analytics disclosure');
 return {passed:results.length,results};
}
