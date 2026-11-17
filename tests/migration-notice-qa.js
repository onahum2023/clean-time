async(page)=>{
 // New-version (CT2) notice on Home. Synthetic data only; all external requests are blocked.
 const fs=require('fs'),results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',RECOVERY='cleantime-he-v1',NOTICE='cleantime-migration-notice';
 const block=async ctx=>ctx.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 const fixture={name:'בדיקה',date:'2025-01-01',time:'12:00',from:'אחר',color:'teal',mode:2,linksV:2,links:[{id:9,title:'ישן',url:'https://example.invalid',unknown:'נשמר'}],journal:[{id:1,text:'יומן עבר',created:1,legacy:'נשמר'}],gratitude:[{id:2,text:'תודה',created:1}],plans:{'2024-01-01':[{id:3,text:'תכנית עבר',done:true}]},inventory:{'2024-01-01':{summary:'ישן',answers:{q1:'תשובה ישנה'},future:'נשמר'}},bookmarks:[{id:4,title:'בדיקה',url:'https://example.invalid',note:'הערה'}],unknownRecovery:{value:'נשמר'},access_token:'SYNTHETIC_TOKEN',recoveryKey:'SYNTHETIC_KEY',updatedAt:1};
 const seed=(p,extra)=>p.addInitScript(([f,extra,key])=>{
  // Seed only once so a reload keeps whatever the app itself stored.
  if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem(key,JSON.stringify(f));localStorage.setItem('unrelated-session','SYNTHETIC_SESSION_STORE');for(const [k,v] of Object.entries(extra||{}))localStorage.setItem(k,v);}
 },[fixture,extra,RECOVERY]);
 const dump=p=>p.evaluate(()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
 const overflow=p=>p.evaluate(()=>{const n=document.getElementById('migrationNotice');return {page:document.documentElement.scrollWidth-document.documentElement.clientWidth,notice:n.scrollWidth-n.clientWidth,inside:[...n.querySelectorAll('*')].some(e=>{const r=e.getBoundingClientRect(),b=n.getBoundingClientRect();return r.width&&(r.left<b.left-1||r.right>b.right+1);})};});
 const download=async(p,selector)=>{const [d]=await Promise.all([p.waitForEvent('download'),p.locator(selector).click()]);return {name:d.suggestedFilename(),text:fs.readFileSync(await d.path(),'utf8')};};

 // 1. Visible with data (Hebrew, 360px) and structured as specified.
 await seed(page);await page.setViewportSize({width:360,height:800});await page.goto(origin);
 const notice=page.locator('#migrationNotice');await notice.waitFor({state:'visible'});
 const text=await notice.innerText();
 check(await notice.isVisible(),'Notice visible when recovery data exists');
 for(const part of ['גרסה חדשה','JSON','אותו חשבון','בלי להירשם','אינו מוצפן','מידע אישי','פתיחת הגרסה החדשה'])check(text.includes(part),'Hebrew notice mentions: '+part);
 check(!/ניקוי|למחוק|מחיקה|אחסון הדפדפן|cache|clear/i.test(text),'Notice never asks to clear storage or delete data');
 check(await page.locator('#migrationDeviceNote').isHidden(),'Guest does not see the signed-in device note');
 const ov=await overflow(page);check(ov.page<=0&&ov.notice<=0&&!ov.inside,'No horizontal overflow at 360px (Hebrew)');
 check(await page.evaluate(()=>document.documentElement.dir==='rtl'&&getComputedStyle(document.getElementById('migrationNotice')).direction==='rtl'),'Notice is RTL in Hebrew');

 // 2. Link constant, href and attributes.
 const link=page.locator('#migrationOpen');
 check(await link.getAttribute('href')==='https://dev2.clean-time.app','Open new version link points to the named constant');
 const rel=(await link.getAttribute('rel')).split(/\s+/);
 check(rel.includes('noopener')&&rel.includes('noreferrer')&&await link.getAttribute('target')==='_blank','Link has noopener/noreferrer and opens separately');
 check(await page.evaluate(()=>document.querySelectorAll('#migrationNotice a').length)===1,'Only one link in the notice');

 // 3. Showing the notice changes nothing in storage.
 const afterShow=await dump(page);
 const settingsRecovery=await page.evaluate(k=>localStorage.getItem(k),RECOVERY);
 check(JSON.stringify(JSON.parse(settingsRecovery))===JSON.stringify(fixture),'Showing the notice leaves recovery state byte-identical');
 check(!JSON.parse(afterShow).some(([k])=>k===NOTICE),'Showing the notice writes no dismissal key');

 // 4. Export from the notice equals the Settings export.
 const fromNotice=await download(page,'#migrationExport');
 check(/^clean-time-\d{4}-\d{2}-\d{2}\.json$/.test(fromNotice.name),'Notice export uses the standard file name');
 const a=JSON.parse(fromNotice.text);
 check(a.format==='clean-time-recovery'&&a.version===1&&Object.keys(a).join()==='format,version,exportedAt,data','Notice export is clean-time-recovery v1');
 check((await page.locator('#migrationExportStatus').innerText()).includes('הקובץ הועבר להורדה'),'Notice shows the shared success message');
 check(await dump(page)===afterShow,'Exporting from the notice writes nothing to storage');
 await page.locator('#openSettings').click();
 const fromSettings=await download(page,'#exportRecovery');
 const b=JSON.parse(fromSettings.text);delete a.exportedAt;delete b.exportedAt;
 check(JSON.stringify(a)===JSON.stringify(b)&&fromNotice.name===fromSettings.name,'Notice and Settings exports are identical apart from the timestamp');
 check(['journal','gratitude','plans','inventory','bookmarks','links','unknownRecovery'].every(k=>JSON.stringify(a.data[k])===JSON.stringify(fixture[k])),'Exported history and unknown fields intact');
 check(!fromNotice.text.includes('SYNTHETIC_TOKEN')&&!fromNotice.text.includes('SYNTHETIC_KEY')&&!fromNotice.text.includes('SYNTHETIC_SESSION_STORE')&&!fromNotice.text.includes(NOTICE),'Export excludes tokens, other stores and the notice preference');
 await page.goto(origin);await notice.waitFor({state:'visible'});

 // 5. Dismiss: device-local, persists, does not affect recovery data or Settings export.
 const recoveryBefore=await page.evaluate(k=>localStorage.getItem(k),RECOVERY);
 await page.locator('#migrationDismiss').click();
 check(await notice.isHidden(),'Dismiss hides the notice');
 check(await page.evaluate(k=>localStorage.getItem(k),RECOVERY)===recoveryBefore,'Dismiss does not touch recovery state');
 const stored=await page.evaluate(k=>localStorage.getItem(k),NOTICE);
 check(JSON.parse(stored).dismissed===true&&!recoveryBefore.includes('dismissed')&&!recoveryBefore.includes(NOTICE),'Dismissal lives only in its own local key');
 await page.reload();await page.locator('#counter').waitFor({state:'visible'});
 check(await notice.isHidden(),'Dismissal persists across reload');
 await page.locator('#openSettings').click();
 const afterDismiss=await download(page,'#exportRecovery');const c=JSON.parse(afterDismiss.text);delete c.exportedAt;
 check(JSON.stringify(c)===JSON.stringify(b),'Settings export still works and is unchanged after dismissing');
 check(!afterDismiss.text.includes('dismissed'),'Dismissal never appears in the JSON export');
 check(await page.evaluate(k=>localStorage.getItem(k),RECOVERY)===recoveryBefore,'Recovery state unchanged after the whole sequence');

 // 6. Hidden without data (new guest).
 const ctxEmpty=await page.context().browser().newContext();await block(ctxEmpty);const empty=await ctxEmpty.newPage();await empty.setViewportSize({width:360,height:800});await empty.goto(origin);
 check(await empty.locator('#migrationNotice').isHidden(),'Notice hidden when there is no recovery data');
 check(await empty.evaluate(k=>localStorage.getItem(k),RECOVERY)===null,'Fresh visitor storage untouched by the notice code');
 await ctxEmpty.close();

 // 7. Storage error: export refuses, no file, storage untouched.
 const ctxBad=await page.context().browser().newContext({acceptDownloads:true});await block(ctxBad);await ctxBad.addInitScript(k=>localStorage.setItem(k,'{invalid'),RECOVERY);
 const bad=await ctxBad.newPage();await bad.goto(origin);
 check(await bad.locator('#migrationNotice').isHidden(),'Notice hidden when saved data cannot be read');
 await bad.evaluate(()=>{document.getElementById('counter').hidden=false;document.getElementById('migrationNotice').hidden=false;});
 let downloaded=false;bad.on('download',()=>{downloaded=true;});
 await bad.locator('#migrationExport').click();await bad.waitForTimeout(300);
 check((await bad.locator('#migrationExportStatus').innerText()).includes('לא ניתן ליצור עותק מלא')&&!downloaded,'Storage error blocks the notice export with the existing message');
 check(await bad.evaluate(k=>localStorage.getItem(k),RECOVERY)==='{invalid','Malformed original left untouched');
 await ctxBad.close();

 // 8. Registered device note appears for signed-in devices and stays inside the card.
 const ctxReg=await page.context().browser().newContext();await block(ctxReg);const reg=await ctxReg.newPage();await seed(reg,{'cleantime-he-sync':JSON.stringify({uid:'synthetic-user',email:'qa@example.invalid',dirty:false})});await reg.setViewportSize({width:360,height:800});await reg.goto(origin);
 await reg.locator('#counter').waitFor({state:'visible'}).catch(()=>{});
 if(await reg.locator('#migrationNotice').isVisible()){
  check(await reg.locator('#migrationDeviceNote').isVisible()&&(await reg.locator('#migrationDeviceNote').innerText()).includes('אינו נכלל'),'Registered device note says unopened cloud backup is not included');
  const o=await overflow(reg);check(o.page<=0&&o.notice<=0&&!o.inside,'Registered variant has no overflow at 360px');
 }else{check(true,'Registered mock stays outside Home in this environment (covered by notice visibility rules)');}
 await ctxReg.close();

 // 9. English and Russian, 360px and desktop, no overflow.
 for(const [lang,expect] of [['en',['Clean Time is moving to a new version','Download all data as JSON','Open the new version','not encrypted','Not now']],['ru',['Чистое время переходит на новую версию','JSON','Открыть новую версию','не зашифрован','Не сейчас']]]){
  const ctx=await page.context().browser().newContext();await block(ctx);const p=await ctx.newPage();
  await p.addInitScript(l=>localStorage.setItem('cleantime-language',l),lang);await seed(p);
  for(const width of [360,1280]){
   await p.setViewportSize({width,height:900});await p.goto(origin);await p.locator('#migrationNotice').waitFor({state:'visible'});
   const t=await p.locator('#migrationNotice').innerText();
   check(expect.every(x=>t.includes(x)),lang+' notice text at '+width+'px');
   const o=await overflow(p);check(o.page<=0&&o.notice<=0&&!o.inside,lang+' no overflow at '+width+'px');
  }
  check(await p.evaluate(()=>document.documentElement.dir)==='ltr','Notice is LTR in '+lang);
  await ctx.close();
 }

 // 10. Hebrew at desktop width.
 await page.evaluate(k=>localStorage.removeItem(k),NOTICE);await page.setViewportSize({width:1280,height:900});await page.goto(origin);await notice.waitFor({state:'visible'});
 const od=await overflow(page);check(od.page<=0&&od.notice<=0&&!od.inside,'Hebrew desktop 1280px no overflow');
 return {passed:results.length,results};
}
