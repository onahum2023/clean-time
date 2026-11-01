// Synthetic guest setup and resource affordance checks for issue #73.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label)};
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.goto(origin);await page.locator('#welcomeStart').click();
 const date=page.locator('#oDate'),preview=page.locator('#oDurationPreview');
 check(await preview.isHidden(),'Empty setup has no duration preview');
 await date.fill('2025-01-01');
 check(await preview.isVisible()&&(await preview.textContent()).includes('זמן נקי'),'Valid guest date shows localized duration');
 check(await page.evaluate(()=>!localStorage.getItem('cleantime-he-v1')),'Preview does not save recovery state');
 await date.fill('2099-01-01');check(await preview.isHidden(),'Future date does not show a duration');
 await date.fill('');check(await preview.isHidden(),'Clearing date clears preview');
 for(const lang of ['en','ru']){
  page.once('dialog',d=>d.accept());await page.locator('[data-language='+lang+']').click();await page.waitForLoadState('domcontentloaded');await page.locator('#welcomeStart').click();await date.fill('2025-01-01');
  const text=await preview.textContent(),label=lang==='en'?'Clean Time':'Чистое время';
  check(text.toLowerCase().includes(label.toLowerCase()),'Duration preview translated '+lang);
 }
 await page.locator('#oFrom').selectOption({index:1});await page.locator('#guestForm button[type=submit]').click();
 await page.locator('[data-tab=tools]').click();
 for(const link of await page.locator('#recoveryDestinations a').all()){
  const href=await link.getAttribute('href'),symbol=await link.evaluate(e=>getComputedStyle(e,'::after').content);
  check(href.startsWith('tel:')?symbol.includes('☎'):symbol.includes('↗'),'Resource identifies phone or external link');
 }
 return {passed:results.length,results};
}
