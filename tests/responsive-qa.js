// Synthetic responsive coverage. Use loopback or an isolated guest-only Preview.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[],errors=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.fallback():r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'סמים',journal:[{id:1,text:'Synthetic journal entry for responsive QA',created:1}],updatedAt:1}));});
 await page.goto(origin);
 const click=s=>page.locator(s).click();
 const open=async id=>{
  if(['counter','tools','about','account'].includes(id))return click('[data-tab='+id+']');
  if(id==='settings')return click('#openSettings');
  if(id==='counterDetails'){await click('#openSettings');return click('#settings [data-go=counterDetails]');}
  if(id==='auth'){await click('[data-tab=account]');return click('#settingsLogin');}
  if(id==='feedback'){await click('[data-tab=about]');return click('#about [data-go=feedback]');}
  if(['planner','gratitude','journal','inventory'].includes(id)){await click('[data-tab=counter]');return click('#counter [data-go='+id+']');}
  await click('[data-tab=tools]');return click(id==='readings'?'#tools [data-go=readings]':'#recoveryDestinations [data-go='+id+']');
 };
 const fit=()=>page.evaluate(()=>{
  const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
  return document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.app input,.app select,.app textarea,.app button,nav.tabs button')].filter(visible).every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&e.scrollWidth<=e.clientWidth+2;});
 });
 const screens=['counter','planner','gratitude','journal','inventory','tools','meditation','bookmarks','readings','settings','counterDetails','account','auth','about','feedback'];
 const viewports=[[320,568],[390,844],[768,1024],[1024,768],[1440,900],[844,390],[568,320]];
 for(const language of ['he','en','ru']){
  await click('[data-language='+language+']');
  for(const colorScheme of ['light','dark']){
   await page.emulateMedia({colorScheme});
   for(const [width,height] of viewports){
    await page.setViewportSize({width,height});
    for(const id of screens){await open(id);check(await fit(),`${id} fits ${language} ${colorScheme} ${width}x${height}`);}
    check(await page.evaluate(()=>{const r=document.getElementById('tabs').getBoundingClientRect();return innerWidth>=768?r.top===0:r.bottom===innerHeight;}),'Navigation adapts '+language+' '+width+'x'+height);
   }
  }
 }
 await click('[data-language=he]');
 await page.setViewportSize({width:1440,height:900});await open('inventory');
 check(await page.locator('#inventory').evaluate(e=>e.clientWidth>=720&&e.clientWidth<=800),'Step 10 has a bounded writing measure');
 await open('journal');await click('#jList [role=button]');
 check(await page.locator('#jText').evaluate(e=>e.clientWidth>=720&&e.clientWidth<=800),'Journal uses a wider bounded editor');
 await page.locator('#jText').fill('Synthetic editing across viewport changes\n'.repeat(50));
 for(const [width,height] of viewports){await page.setViewportSize({width,height});check(await page.locator('#jText').evaluate(e=>e.clientHeight>80&&e.scrollHeight>e.clientHeight&&e.getBoundingClientRect().bottom<=innerHeight),'Long Journal scrolls in editor '+width+'x'+height);}
 await page.keyboard.press('Escape');
 check(await page.locator('#jEditor').isHidden()&&await page.locator('#jList').innerText().then(t=>t.includes('Synthetic editing')),'Journal saves and returns after resizing');
 await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
 for(const language of ['he','en','ru']){
  await click('[data-language='+language+']');
  for(const [width,height] of [[320,568],[768,1024],[1024,768]]){
   await page.setViewportSize({width,height});
   for(const id of ['counter','inventory','settings','account','auth']){await open(id);check(await fit(),'Enlarged text '+id+' '+language+' '+width);}
   await open('settings');await page.locator('#reset').focus();await page.keyboard.press('Enter');
   check(await page.locator('#ask .box').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&e.scrollHeight>=e.clientHeight;}),'Enlarged confirmation stays within viewport '+language+' '+width);
   await page.locator('#askB button').last().focus();await page.keyboard.press('Tab');
   check(await page.evaluate(()=>document.getElementById('ask').contains(document.activeElement)),'Confirmation traps keyboard focus '+language+' '+width);
   await page.locator('#askB button').last().click();
   check(await page.locator('#reset').evaluate(e=>e===document.activeElement),'Cancel returns focus '+language+' '+width);
  }
 }
 check(errors.length===0,'No browser errors');
 return {passed:results.length,results};
}
