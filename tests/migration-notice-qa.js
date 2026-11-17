async(page)=>{
 // New-version (CT2) notice on Home: compact, collapsed by default, placed after the daily actions.
 // Synthetic data only; all external requests are blocked. Existing Home layout suites run with it visible too.
 const fs=require('fs'),results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',RECOVERY='cleantime-he-v1',NOTICE='cleantime-migration-notice';
 const browser=page.context().browser();
 const block=ctx=>ctx.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 const fixture={name:'בדיקה',date:'2025-01-01',time:'12:00',from:'אחר',color:'teal',mode:2,linksV:2,links:[{id:9,title:'ישן',url:'https://example.invalid',unknown:'נשמר'}],journal:[{id:1,text:'יומן עבר',created:1,legacy:'נשמר'}],gratitude:[{id:2,text:'תודה',created:1}],plans:{'2024-01-01':[{id:3,text:'תכנית עבר',done:true}]},inventory:{'2024-01-01':{summary:'ישן',answers:{q1:'תשובה ישנה'},future:'נשמר'}},bookmarks:[{id:4,title:'בדיקה',url:'https://example.invalid',note:'הערה'}],unknownRecovery:{value:'נשמר'},access_token:'SYNTHETIC_TOKEN',recoveryKey:'SYNTHETIC_KEY',updatedAt:1};
 const seed=(p,extra)=>p.addInitScript(([f,extra,key])=>{
  // Seed only once per tab so a reload keeps whatever the app itself stored.
  if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem(key,JSON.stringify(f));localStorage.setItem('unrelated-session','SYNTHETIC_SESSION_STORE');for(const [k,v] of Object.entries(extra||{}))localStorage.setItem(k,v);}
 },[fixture,extra,RECOVERY]);
 const dump=p=>p.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
 const overflow=p=>p.evaluate(()=>{const n=document.getElementById('migrationNotice'),b=n.getBoundingClientRect();return {page:document.documentElement.scrollWidth-document.documentElement.clientWidth,notice:n.scrollWidth-n.clientWidth,inside:[...n.querySelectorAll('*')].some(e=>{const r=e.getBoundingClientRect();return r.width&&e.offsetParent&&(r.left<b.left-1||r.right>b.right+1);})};});
 const noOverflow=async(p,label)=>{const o=await overflow(p);check(o.page<=0&&o.notice<=0&&!o.inside,'No horizontal overflow: '+label);};
 const rects=p=>p.evaluate(()=>{const q=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,height:r.height};};const n=document.getElementById('migrationNotice'),t=document.getElementById('tabs').getBoundingClientRect();return {summary:q('.recovery-summary'),cards:q('.daily-cards'),first:q('#dailyReading'),tabs:{top:t.top},notice:n.hidden?null:q('#migrationNotice'),vh:innerHeight};});
 const download=async(p,selector)=>{const [d]=await Promise.all([p.waitForEvent('download'),p.locator(selector).click()]);return {name:d.suggestedFilename(),text:fs.readFileSync(await d.path(),'utf8')};};
 const open=async(lang,width,height,extra)=>{const ctx=await browser.newContext({acceptDownloads:true});await block(ctx);const p=await ctx.newPage();await p.addInitScript(l=>{if(!sessionStorage.getItem('lang')){sessionStorage.setItem('lang','1');localStorage.setItem('cleantime-language',l);}},lang);await seed(p,extra);await p.setViewportSize({width,height});await p.goto(origin);await p.locator('#migrationNotice').waitFor({state:'visible'});return {ctx,p};};

 // 1. Collapsed layout in all three languages at 320, 360 and desktop. Clock and daily actions come first.
 for(const lang of ['he','en','ru'])for(const [width,height] of [[320,640],[360,740],[1280,900]]){
  const {ctx,p}=await open(lang,width,height),label=lang+' '+width+'px';
  const n=p.locator('#migrationNotice');
  check(await p.locator('#migrationToggle').getAttribute('aria-expanded')==='false'&&await p.locator('#migrationDetails').isHidden(),'Collapsed by default: '+label);
  check(await p.evaluate(()=>document.documentElement.dir)===(lang==='he'?'rtl':'ltr'),'Direction: '+label);
  const t=await n.innerText();
  check({he:['זמן נקי מתחדש','גרסה חדשה של זמן נקי זמינה'],en:['Clean Time is renewing','A new version of Clean Time is available'],ru:['Чистое время обновляется','Доступна новая версия']}[lang].every(x=>t.includes(x)),'Collapsed shows short title and explanation: '+label);
  check(await p.locator('#migrationExport').isHidden()&&await p.locator('#migrationDismiss').isHidden(),'Actions stay inside the expanded view: '+label);
  const withNotice=await rects(p);
  check(withNotice.notice.top>=withNotice.cards.bottom-1,'Notice sits after the daily actions: '+label);
  check(withNotice.summary.top>=0&&withNotice.summary.bottom<=withNotice.vh,'Recovery clock fully visible on first screen: '+label);
  check(withNotice.notice.height<=112,'Collapsed notice is compact (<=112px): '+label);
  if(width<1024){
   check(withNotice.first.top<withNotice.tabs.top,'First daily action reachable on first screen: '+label);
   await p.evaluate(()=>document.getElementById('migrationNotice').scrollIntoView({block:'end'}));
   const after=await p.evaluate(()=>({nb:document.getElementById('migrationNotice').getBoundingClientRect().bottom,tabs:document.getElementById('tabs').getBoundingClientRect().top}));
   check(after.nb<=after.tabs+1,'Collapsed notice clears the bottom navigation when scrolled: '+label);
   await p.evaluate(()=>scrollTo(0,0));
  }
  await noOverflow(p,'collapsed '+label);
  if(lang==='he'&&width===320){ // Showing must not move the clock or daily actions: compare with the notice dismissed.
   await p.evaluate(k=>localStorage.setItem(k,JSON.stringify({dismissed:true})),NOTICE);await p.reload();await p.locator('#counter').waitFor({state:'visible'});
   const without=await rects(p);
   check(without.notice===null&&JSON.stringify([without.summary,without.cards,without.first])===JSON.stringify([withNotice.summary,withNotice.cards,withNotice.first]),'Notice does not move the clock or daily actions: '+label);
  }
  await ctx.close();
 }

 // 2. Expansion, keyboard, link, export, dismissal, reload (Hebrew, 360px).
 const {ctx,p}=await open('he',360,740);const notice=p.locator('#migrationNotice');
 const before=await dump(p);
 check(JSON.stringify(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),RECOVERY)))===JSON.stringify(fixture),'Showing the notice leaves recovery state byte-identical');
 check(!JSON.parse(before).some(([k])=>k===NOTICE),'Showing the notice writes no dismissal key');
 await p.locator('#migrationToggle').focus();await p.keyboard.press('Enter');
 check(await p.locator('#migrationToggle').getAttribute('aria-expanded')==='true'&&await p.locator('#migrationDetails').isVisible(),'Keyboard expands the notice');
 const text=await notice.innerText();
 for(const part of ['מידע אישי','אינו מוצפן','הורדת קובץ גיבוי','פתיחת הגרסה החדשה','לא עכשיו','גרסה החדשה'])check(text.includes(part),'Expanded Hebrew copy includes: '+part);
 check(!/אותו חשבון|פרטי התחברות|סיסמ|ניקוי|למחוק|מחיקה/.test(text),'No account sign-in promise and no clear/delete request');
 check(await p.locator('#migrationDeviceNote').isHidden(),'Guest does not see the signed-in device note');
 await noOverflow(p,'expanded he 360px');
 const link=p.locator('#migrationOpen');
 check(await link.getAttribute('href')==='https://dev2.clean-time.app','Open new version link uses the configurable constant');
 const rel=(await link.getAttribute('rel')).split(/\s+/);
 check(rel.includes('noopener')&&rel.includes('noreferrer')&&await link.getAttribute('target')==='_blank'&&await p.locator('#migrationNotice a').count()===1,'Link attributes and single link');
 const fromNotice=await download(p,'#migrationExport');
 const a=JSON.parse(fromNotice.text);
 check(/^clean-time-\d{4}-\d{2}-\d{2}\.json$/.test(fromNotice.name)&&a.format==='clean-time-recovery'&&a.version===1&&Object.keys(a).join()==='format,version,exportedAt,data','Notice export is clean-time-recovery v1 with the standard file name');
 check((await p.locator('#migrationExportStatus').innerText()).includes('הקובץ הועבר להורדה'),'Notice shows the shared success message');
 check(await dump(p)===before,'Exporting from the notice writes nothing to storage');
 await p.locator('#openSettings').click();
 const fromSettings=await download(p,'#exportRecovery');
 const b=JSON.parse(fromSettings.text);delete a.exportedAt;delete b.exportedAt;
 check(JSON.stringify(a)===JSON.stringify(b)&&fromNotice.name===fromSettings.name,'Notice and Settings exports are identical apart from the timestamp');
 check(['journal','gratitude','plans','inventory','bookmarks','links','unknownRecovery'].every(k=>JSON.stringify(a.data[k])===JSON.stringify(fixture[k])),'Exported history and unknown fields intact');
 check(!fromNotice.text.includes('SYNTHETIC_TOKEN')&&!fromNotice.text.includes('SYNTHETIC_KEY')&&!fromNotice.text.includes('SYNTHETIC_SESSION_STORE')&&!fromNotice.text.includes(NOTICE),'Export excludes tokens, other stores and the notice preference');
 await p.goto(origin);await notice.waitFor({state:'visible'});
 check(await p.locator('#migrationToggle').getAttribute('aria-expanded')==='false','Notice is collapsed again after returning to Home');
 await p.locator('#migrationToggle').click();
 const recoveryBefore=await p.evaluate(k=>localStorage.getItem(k),RECOVERY);
 await p.locator('#migrationDismiss').click();
 check(await notice.isHidden(),'Not now hides the notice');
 check(await p.evaluate(k=>localStorage.getItem(k),RECOVERY)===recoveryBefore,'Dismiss does not touch recovery state');
 check(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),NOTICE)).dismissed===true&&!recoveryBefore.includes('dismissed')&&!recoveryBefore.includes(NOTICE),'Dismissal lives only in its own local key');
 await p.reload();await p.locator('#counter').waitFor({state:'visible'});
 check(await notice.isHidden(),'Dismissal persists across reload');
 await p.locator('#openSettings').click();
 const afterDismiss=await download(p,'#exportRecovery');const c=JSON.parse(afterDismiss.text);delete c.exportedAt;
 check(JSON.stringify(c)===JSON.stringify(b)&&!afterDismiss.text.includes('dismissed'),'Settings export unchanged after dismissing; dismissal never exported');
 check(await p.evaluate(k=>localStorage.getItem(k),RECOVERY)===recoveryBefore,'Recovery state unchanged after the whole sequence');
 await ctx.close();

 // 3. Expanded view in each language at 320/360/desktop: no overflow, actions reachable.
 for(const lang of ['he','en','ru'])for(const [width,height] of [[320,640],[360,740],[1280,900]]){
  const {ctx,p}=await open(lang,width,height),label=lang+' '+width+'px';
  await p.locator('#migrationToggle').click();
  const t=await p.locator('#migrationNotice').innerText();
  check({he:['הורדת קובץ גיבוי','פתיחת הגרסה החדשה','לא עכשיו'],en:['Download backup file','Open the new version','Not now'],ru:['Скачать файл резервной копии','Открыть новую версию','Не сейчас']}[lang].every(x=>t.includes(x)),'Expanded actions: '+label);
  await p.locator('#migrationDismiss').scrollIntoViewIfNeeded();
  check(await p.evaluate(()=>{const t=document.getElementById('tabs').getBoundingClientRect(),d=document.getElementById('migrationDismiss').getBoundingClientRect();return d.height>=40&&(innerWidth>=1024||d.bottom<=t.top+1);}),'Last action clears the bottom navigation and is tappable: '+label);
  await noOverflow(p,'expanded '+label);
  await p.locator('#migrationToggle').click();
  check(await p.locator('#migrationDetails').isHidden(),'Collapse works: '+label);
  await ctx.close();
 }

 // 4. Hidden without data and with unreadable saved data; export refuses on a storage error.
 const ctxEmpty=await browser.newContext();await block(ctxEmpty);const empty=await ctxEmpty.newPage();await empty.goto(origin);
 check(await empty.locator('#migrationNotice').isHidden()&&await empty.evaluate(k=>localStorage.getItem(k),RECOVERY)===null,'Hidden without recovery data; fresh storage untouched');
 await ctxEmpty.close();
 const ctxBad=await browser.newContext({acceptDownloads:true});await block(ctxBad);await ctxBad.addInitScript(k=>localStorage.setItem(k,'{invalid'),RECOVERY);
 const bad=await ctxBad.newPage();await bad.goto(origin);
 check(await bad.locator('#migrationNotice').isHidden(),'Hidden when saved data cannot be read');
 await bad.evaluate(()=>{document.getElementById('counter').hidden=false;document.getElementById('migrationNotice').hidden=false;document.getElementById('migrationDetails').hidden=false;});
 let downloaded=false;bad.on('download',()=>{downloaded=true;});
 await bad.locator('#migrationExport').click();await bad.waitForTimeout(300);
 check((await bad.locator('#migrationExportStatus').innerText()).includes('לא ניתן ליצור עותק מלא')&&!downloaded,'Storage error blocks the notice export with the existing message');
 check(await bad.evaluate(k=>localStorage.getItem(k),RECOVERY)==='{invalid','Malformed original left untouched');
 await ctxBad.close();

 // 5. Registered devices see the existing device-only warning.
 const reg=await open('he',360,740,{'cleantime-he-sync':JSON.stringify({uid:'synthetic-user',email:'qa@example.invalid',dirty:false})});
 await reg.p.locator('#migrationToggle').click();
 check(await reg.p.locator('#migrationDeviceNote').isVisible()&&(await reg.p.locator('#migrationDeviceNote').innerText()).includes('אינו נכלל'),'Registered device note: unopened cloud backup is not included');
 await noOverflow(reg.p,'registered expanded 360px');
 await reg.ctx.close();

 // 6. Release gate: hidden on a production build until the owner publishes it.
 const prod=await browser.newContext();await block(prod);
 await prod.route('**/assets/backend-config.js',r=>r.fulfill({contentType:'application/javascript',body:'window.CleanTimeBackend={environment:"production",url:null,key:null,backupDisabled:true};'}));
 const pp=await prod.newPage();await seed(pp);await pp.goto(origin);await pp.locator('#counter').waitFor({state:'visible'});
 check(await pp.evaluate(()=>CleanTimeI18n.production)===true&&await pp.locator('#migrationNotice').isHidden(),'Production build hides the notice until it is published');
 await prod.close();
 return {passed:results.length,results};
}
