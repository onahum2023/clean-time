// Issue #69: repeated synthetic names on authenticated Home; no live accounts/network.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const fixture={name:'Home UAT',date:'2025-01-01',time:'',from:'Home UAT',linksV:2,links:[],updatedAt:1,retained:{keep:true},journal:[{id:1,text:'Synthetic history',created:1}],timersVersion:1,primaryTimerId:'primary',timers:[{id:'primary',category:'drugs',label:'Home UAT',date:'2025-01-01',time:''},{id:'secondary',category:'alcohol',label:'Home UAT',date:'2026-05-01',time:''}]};
 let cloud=null;
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.exposeFunction('summaryRead',()=>({data:cloud}));await page.exposeFunction('summaryWrite',row=>{cloud=row;return {data:[{user_id:row.user_id}]};});
 await page.addInitScript(({key,fixture})=>{
  if(!localStorage.getItem(key)){localStorage.setItem(key,JSON.stringify(fixture));localStorage.setItem('cleantime-he-sync',JSON.stringify({uid:'summary-synthetic'}));}
  const write=row=>({eq(){return this;},select:()=>summaryWrite(row)});
  window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{user:{id:'summary-synthetic',email:'summary@example.invalid'}}}})},from:()=>({select:()=>({eq:()=>({maybeSingle:()=>summaryRead()})}),update:write,insert:write})})};
  const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
 },{key,fixture});
 await page.goto(origin);await page.locator('#openSettings').click();await page.locator('#myAccount').click();await page.locator('#makeRecoveryKey').click();await page.locator('#recoveryGenerated').waitFor();await page.locator('#recoverySaved').check();await page.locator('#activateEncryption').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cleantime-he-crypto')||'null')?.confirmed===true);await page.locator('[data-tab=counter]').click();
 const saved=await page.evaluate(key=>localStorage.getItem(key),key);
 for(const language of ['he','en','ru']){
  await page.locator('[data-language='+language+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,language);
  for(const width of [320,360,390,1440]){
   await page.setViewportSize({width,height:width===1440?900:844});
   check(await page.evaluate(()=>{
    const label=document.getElementById('homePrimaryLabel'),secondary=document.getElementById('homeSecondary'),text=document.querySelector('header').innerText+' '+document.getElementById('counter').innerText,summary=document.querySelector('.recovery-summary').getBoundingClientRect(),first=document.getElementById('dailyReading').getBoundingClientRect(),footer=document.getElementById('tabs').getBoundingClientRect();
    return text.split('Home UAT').length===2&&label.hidden&&label.getBoundingClientRect().height===0&&secondary.hidden&&secondary.getBoundingClientRect().height===0&&summary.height<110&&(innerWidth>=768?first.top>=footer.bottom:first.bottom<footer.top)&&document.documentElement.scrollWidth<=innerWidth;
   }),'Name appears once; entire label/secondary rows reclaim space '+language+' '+width);
   check(await page.locator('#homePrimaryCount .num').count()>0&&await page.locator('#homePrimarySince').isVisible()&&await page.locator('#milestone').isVisible()&&await page.locator('.daily-card').count()===5,'Counter, date, badge and five cards preserved '+language+' '+width);
  }
  await page.locator('#openSettings').click();await page.locator('#settings [data-go=counterDetails]').focus();await page.keyboard.press('Enter');
  for(const mode of ['cards','compact','single']){
   await page.locator('[data-display='+mode+']').click();
   check(await page.locator('[data-display='+mode+']').getAttribute('aria-pressed')==='true','Existing detail presentation accessible '+language+' '+mode);
  }
  await page.locator('#homeTimerPick').selectOption('secondary');
  check((await page.locator('#since').textContent()).includes('2026'),'Secondary recovery date remains available '+language);
  await page.locator('[data-tab=counter]').click();
  for(const destination of ['planner','gratitude','journal','inventory']){await page.locator('#counter [data-go='+destination+']').click();check(await page.locator('#'+destination).isVisible(),'Direct daily action '+destination+' '+language);await page.locator('[data-tab=counter]').click();}
  check(await page.evaluate(key=>localStorage.getItem(key),key)===saved,'Account layout/language/details preserve exact recovery bytes '+language);
 }
 await page.reload();check(await page.locator('#homePrimaryLabel').isHidden()&&await page.locator('#homeSecondary').isHidden(),'Authenticated compact layout persists on trusted reload');
 check(cloud?.data?.v===1,'Test account uses verified encrypted state');
 return {passed:results.length,results};
}
