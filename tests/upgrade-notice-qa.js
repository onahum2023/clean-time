// Issue #83: synthetic guest and registered/locked-cloud journeys; no live services.
async(page)=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',uid='notice-synthetic',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const fixture={name:'בדיקה',date:'2025-01-01',from:'אחר',linksV:2,links:[],journal:[{id:1,text:'Synthetic local history',created:1}],unknown:{keep:true},updatedAt:1};
 const sandbox={window:{},crypto:require('node:crypto').webcrypto,TextEncoder,TextDecoder,atob,btoa};
 vm.runInNewContext(fs.readFileSync('assets/sync-crypto.js','utf8'),sandbox);
 const crypto=sandbox.window.SyncCrypto,created=await crypto.create(uid),time='2026-01-01T00:00:00.000Z';
 const row={user_id:uid,updated_at:time,data:await crypto.encrypt({date:'2024-01-01',journal:[{text:'SYNTHETIC_LOCKED_CLOUD_ONLY'}],updatedAt:Date.parse(time)},created.key,created.material,uid,time)};
 const announcement={
  he:{title:'זמן נקי מתחדש!',planned:'ביום ראשון, 22 בנובמבר, בשעות הערב, מתוכנן',downtime:'ייתכן שהאפליקציה לא תהיה זמינה',backup:'מומלץ להוריד כבר עכשיו',privacy:'אינו מוצפן',help:'בעמוד שחזור הנתונים או לשלוח לנו משוב',action:'ייצוא הנתונים שלי'},
  en:{title:'Clean Time is getting an update!',planned:'planned for Sunday evening, November 22',downtime:'may be temporarily unavailable',backup:'We recommend downloading a backup',privacy:'is not encrypted',help:'use the data recovery page or send us feedback',action:'Export my data'},
  ru:{title:'«Чистое время» обновляется!',planned:'запланирован на вечер воскресенья, 22 ноября',downtime:'может быть временно недоступно',backup:'Рекомендуем уже сейчас скачать резервную копию',privacy:'не зашифрован',help:'воспользоваться страницей восстановления данных или отправить нам отзыв',action:'Экспортировать мои данные'},
 };
 const screenshots=process.env.QA_NOTICE_SCREENSHOTS;
 if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
 for(const registered of [false,true])for(const language of ['he','en','ru'])for(const width of [320,360,1280]){
  const context=await page.context().browser().newContext({viewport:{width,height:800},acceptDownloads:true,serviceWorkers:'block'});
  let writes=0,downloads=0,external=0;const errors=[];
  await context.route('**/*',r=>{if(r.request().url().startsWith(origin+'/'))return r.fallback();external++;return r.abort();});
  await context.exposeBinding('__noticeRead',()=>({data:row}));
  await context.exposeBinding('__noticeWrite',()=>{writes++;return {error:{message:'Unexpected synthetic write'}};});
  await context.addInitScript(({fixture,key,registered,language,uid})=>{
   localStorage.setItem(key,JSON.stringify(fixture));localStorage.setItem('cleantime-language',language);
   if(registered){
    localStorage.setItem('cleantime-he-sync',JSON.stringify({uid,email:'notice@example.invalid',dirty:false}));
    localStorage.setItem('cleantime-he-auth','SYNTHETIC_SESSION');
    window.supabase={createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{user:{id:uid,email:'notice@example.invalid'}}}})},from:()=>({select:()=>({eq:()=>({maybeSingle:()=>window.__noticeRead()})}),update:()=>({eq(){return this;},select:()=>window.__noticeWrite()}),insert:()=>({select:()=>window.__noticeWrite()})})})};
    const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
   }
  },{fixture,key,registered,language,uid});
  const p=await context.newPage();p.on('download',()=>downloads++);p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin);
  if(registered){await p.locator('#unlockRecovery').waitFor({state:'visible'});await p.locator('[data-tab=counter]').click();}
  const label=(registered?'registered locked':'guest')+' '+language+' '+width;
  const notice=p.locator('#upgradeNotice'),copy=announcement[language];
  check(await notice.count()===1,'Single upgrade notice: '+label);
  await notice.waitFor({state:'visible'});
  check(await p.locator('html').getAttribute('dir')===(language==='he'?'rtl':'ltr'),'Language direction: '+label);
  const paragraphs=await notice.locator('p').allTextContents();
  check(await notice.getByRole('heading').innerText()===copy.title&&paragraphs.length===4&&paragraphs[0].includes(copy.planned)&&paragraphs[1].includes(copy.downtime)&&paragraphs[3].includes(copy.help),'Planned date, possible downtime, and post-cutover help localized: '+label);
  check((await notice.locator('strong').innerText()).includes(copy.backup)&&paragraphs[2].includes(copy.privacy)&&await notice.getByRole('button',{name:copy.action,exact:true}).count()===1,'Backup emphasis, privacy warning, and export action localized: '+label);
  check(await notice.locator('a').count()===0,'No CT2/external destination: '+label);
  const before=await p.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
  await p.locator('#upgradeExport').scrollIntoViewIfNeeded();
  check(await p.evaluate(()=>{const n=document.getElementById('upgradeNotice').getBoundingClientRect(),tabs=document.getElementById('tabs').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&n.left>=0&&n.right<=innerWidth&&(innerWidth>=1024||n.bottom<=tabs.top); }),'Notice fits and clears navigation: '+label);
  if(screenshots&&language==='he'&&width!==320){
   // Notice plus surrounding synthetic Home content in its natural page position.
   await p.screenshot({path:path.join(screenshots,(registered?'registered':'guest')+'-he-'+width+'-notice.png')});
  }
  await p.locator('#upgradeExport').focus();await p.keyboard.press('Enter');
  check(await p.locator('#settings').isVisible()&&await p.locator('#exportRecovery').evaluate(el=>el===document.activeElement),'Keyboard CTA opens Settings and focuses JSON export: '+label);
  check(await p.evaluate(()=>{const a=document.getElementById('recoveryExport').getBoundingClientRect(),b=document.getElementById('exportRecovery').getBoundingClientRect(),tabs=document.getElementById('tabs').getBoundingClientRect(),bar=document.querySelector('.language-bar').getBoundingClientRect();return a.top>=Math.max(0,bar.bottom)&&b.bottom<=(innerWidth>=1024?innerHeight:tabs.top); }),'Warning and export button visible together below language bar: '+label);
  const warning=await p.locator('#recoveryExport .note').innerText();
  const expectedWarning=await p.locator('#recoveryExport .note [data-i18n]').evaluate(el=>CleanTimeI18n.t(el.dataset.i18n));
  check(warning===expectedWarning&&/אינו מוצפן|not encrypted|не зашифрован/.test(warning)&&/שטרם נפתח|not been unlocked|не был разблокирован/.test(warning),'Existing plaintext and locked-cloud warning preserved: '+label);
  check(downloads===0,'CTA does not start a download: '+label);
  check(await p.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))===before&&writes===0,'Notice/CTA leave storage and cloud unchanged: '+label);
  if(screenshots&&language==='he'&&width!==320)await p.screenshot({path:path.join(screenshots,(registered?'registered':'guest')+'-he-'+width+'-export.png')});
  if(width===360&&language==='he'){
   const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#exportRecovery').click()]);
   const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
   check(exported.format==='clean-time-recovery'&&exported.version===1&&exported.data.journal[0].text==='Synthetic local history'&&exported.data.unknown.keep&&!JSON.stringify(exported).includes('SYNTHETIC_LOCKED_CLOUD_ONLY'),'Existing explicit export includes local history only: '+label);
   await p.goBack();check(await p.locator('#counter').isVisible(),'Back returns to prior screen: '+label);
  }
  check(errors.length===0&&external===0,'No page errors or external requests: '+label);
  await context.close();
 }
 // Entry still requires the existing onboarding flow, with no forced export.
 await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.fallback():r.abort());
 await page.goto(origin);check(await page.locator('#welcome').isVisible()&&await page.locator('#upgradeNotice').isHidden(),'Welcome remains unchanged');
 return {passed:results.length,results};
}
