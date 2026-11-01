// Synthetic responsive and accessibility checks for issue #75.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label)};
 const {normalize}=require(process.cwd()+'/assets/recovery-timers.js');
 const fixture=normalize({date:'2025-01-01',time:'',from:'סמים',linksV:2,links:[],updatedAt:1});
 fixture.timers.push({id:'second',category:'alcohol',label:'Synthetic long recovery label 1234567890',date:'2026-05-01',time:''});
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(f=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify(f))},fixture);
 await page.goto(origin);
 for(const lang of ['he','en','ru']){
  await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);
  for(const width of [320,390,1024,1440]){
   await page.setViewportSize({width,height:width>=1024?900:800});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow with long secondary label: '+lang+' '+width);
   await page.locator('#counter [data-go=inventory]').scrollIntoViewIfNeeded();
   check(await page.evaluate(()=>{const r=document.querySelector('#counter [data-go=inventory]').getBoundingClientRect(),nav=document.getElementById('tabs').getBoundingClientRect();return innerWidth>=1024?(document.dir==='rtl'?r.right<=nav.left:r.left>=nav.right):r.bottom<=nav.top+1}),'Last action clears fixed navigation: '+lang+' '+width);
  }
 }
 await page.setViewportSize({width:1440,height:900});
 check(await page.evaluate(()=>{const summary=document.querySelector('.recovery-summary').getBoundingClientRect(),actions=document.querySelector('.today-actions').getBoundingClientRect(),column=document.querySelector('.home-recovery-column').getBoundingClientRect(),duration=document.querySelector('.summary-duration'),badge=document.getElementById('milestone').getBoundingClientRect(),since=document.getElementById('homePrimarySince').getBoundingClientRect(),secondary=document.getElementById('homeSecondary').getBoundingClientRect();return summary.height>=250&&column.height/actions.height>=.75&&column.height/actions.height<=1.3&&summary.width>actions.width&&duration.getBoundingClientRect().height>0&&parseFloat(getComputedStyle(duration).fontSize)>=28&&badge.height>=100&&secondary.top>since.bottom&&summary.bottom>=secondary.bottom;}),'Desktop counter and static cards balance the action column with readable calendar duration');
 await page.setViewportSize({width:1920,height:900});
 check(await page.locator('#counter').evaluate(e=>e.getBoundingClientRect().width<=1080),'Desktop composition remains bounded on wider screens');
 await page.setViewportSize({width:1440,height:900});await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desktop enlarged text does not overflow');
 await page.locator('#counter [data-go=inventory]').focus();await page.keyboard.press('Enter');
 check(await page.locator('#inventory').isVisible(),'Last action remains keyboard accessible with enlarged text');
 return {passed:results.length,results};
}
