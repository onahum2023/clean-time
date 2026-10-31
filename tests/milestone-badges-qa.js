// Badge UI and calendar transitions, synthetic state only; all external requests blocked.
async(page)=>{
 const results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(()=>{const RealDate=Date;window.qaBadgeTime=new RealDate(2026,9,12,12).getTime();window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[window.qaBadgeTime]));}static now(){return window.qaBadgeTime;}};});
 await page.goto(origin);
 const seed=async(kind,amount,preference=null)=>{
  await page.evaluate(({key,kind,amount,preference})=>{
   const start=new Date(2026,9,12,12);if(kind==='days')start.setDate(start.getDate()-amount);else start.setMonth(start.getMonth()-amount);
   const date=start.getFullYear()+'-'+String(start.getMonth()+1).padStart(2,'0')+'-'+String(start.getDate()).padStart(2,'0');
   localStorage.setItem(key,JSON.stringify({date,time:'12:00',from:'אחר',linksV:2,links:[],journal:[{id:1,text:'סינתטי',created:1}],unknownRecovery:{value:'נשמר'},updatedAt:1}));
   if(preference===null)localStorage.removeItem('cleantime-he-milestones');else localStorage.setItem('cleantime-he-milestones',preference);
  },{key,kind,amount,preference});await page.reload();
 };
 const cases=[['days',30,'30','ימים'],['days',60,'60','ימים'],['days',90,'90','ימים'],['months',6,'6','חודשים'],['months',9,'9','חודשים'],['months',12,'1','שנה'],['months',18,'18','חודשים'],['months',24,'2','שנים'],['months',36,'3','שנים']];
 for(const [kind,amount,number,unit] of cases){
  await seed(kind,amount);const before=await page.evaluate(key=>localStorage.getItem(key),key);
  check(await page.locator('#milestone').isVisible()&&await page.locator('#milestoneNumber').textContent()===number&&await page.locator('#milestoneUnit').textContent()===unit,'Latest reached key-tag badge '+kind+' '+amount);
  check(await page.locator('#milestone').getAttribute('role')==='img'&&(await page.locator('#milestone').getAttribute('aria-label')).includes(number==='1'?'שנה':number+' '+unit),'Accessible Hebrew milestone '+kind+' '+amount);
  check(await page.evaluate(()=>{
   const el=document.getElementById('milestone'),css=getComputedStyle(el),hex=s=>s.trim().slice(1).match(/../g).map(v=>parseInt(v,16)),lum=s=>hex(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0),ink=lum(css.getPropertyValue('--badge-ink'));
   return ['--badge-fill','--badge-light'].every(name=>{const bg=lum(css.getPropertyValue(name));return (Math.max(bg,ink)+.05)/(Math.min(bg,ink)+.05)>=4.5;});
  }),'Readable badge text on both gradient stops '+kind+' '+amount);
  check(await page.evaluate(key=>localStorage.getItem(key),key)===before,'Badge derivation preserves recovery bytes '+kind+' '+amount);
 }
 await seed('days',29);check(await page.locator('#milestone').isHidden(),'No unearned badge before day 30');await page.evaluate(()=>window.qaBadgeTime+=864e5);await page.waitForFunction(()=>!document.getElementById('milestone').hidden);check(await page.locator('#milestoneNumber').textContent()==='30','Badge appears at the next reached day without reload');
 await seed('days',30,'false');check(await page.locator('#milestone').isHidden(),'Existing explicit hide preference respected');await page.locator('#openSettings').click();await page.locator('#showMilestones').check();await page.locator('[data-tab=counter]').click();check(await page.locator('#milestone').isVisible(),'Settings can show an explicitly hidden badge');
 await page.locator('#counter [data-go=journal]').click();check(await page.locator('#milestone').isHidden(),'Badge confined to Home');await page.goBack();check(await page.locator('#milestone').isVisible(),'Browser Back restores Home badge');
 for(const colorScheme of ['light','dark'])for(const width of [320,360,390,1280]){
  await page.emulateMedia({colorScheme});await page.setViewportSize({width,height:800});
  check(await page.evaluate(()=>{
   const badge=document.getElementById('milestone').getBoundingClientRect(),app=document.querySelector('.app').getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect(),language=document.getElementById('languageSelector').getBoundingClientRect(),counter=document.getElementById('homePrimaryCount').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(document.getElementById('greet'));
   const overlaps=r=>badge.left<r.right&&badge.right>r.left&&badge.top<r.bottom&&badge.bottom>r.top;
   return badge.width>=50&&badge.width<=54&&badge.height>=70&&badge.height<=76&&badge.left>=app.left&&badge.right<=app.right&&badge.top>=header.bottom&&!overlaps(language)&&!overlaps(counter)&&![...range.getClientRects()].some(overlaps)&&document.documentElement.scrollWidth<=innerWidth;
  }),'Small summary badge without overlap/overflow '+width+' '+colorScheme);
 }
 await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.name='שםבדיקהארוךמאודלבדיקתפריסהבטלפוןללאחשיפתפרטים';localStorage.setItem(key,JSON.stringify(s));},key);await page.setViewportSize({width:320,height:800});await page.reload();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Long synthetic greeting fits beside badge');
 const beforeReset=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);await page.locator('#openSettings').click();await page.locator('#sDate').fill('2026-10-12');await page.locator('#saveSettings').click();await page.locator('#askB button').filter({hasText:'עדכון התאריך'}).click();
 check(await page.locator('#milestone').isHidden()&&await page.evaluate(({key,before})=>{const s=JSON.parse(localStorage.getItem(key));return JSON.stringify(s.journal)===JSON.stringify(before.journal)&&JSON.stringify(s.unknownRecovery)===JSON.stringify(before.unknownRecovery);},{key,before:beforeReset}),'New clean date removes prior badge without losing history');
 return {passed:results.length,results};
}
