// Actual browser requests: no application document, asset, API or backend mocks.
// Default target is the owner-requested guest-only PR #72 Preview.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.QA_BASE_URL||'https://clean-time-jyjp69cuk-nu-cielo.vercel.app';
const url=new URL(origin),local=process.argv.includes('--local-check');
if(url.origin!==origin||url.username||url.password||!(local?url.protocol==='http:'&&url.hostname==='127.0.0.1':url.protocol==='https:'&&url.hostname.endsWith('.vercel.app')))throw Error('Use an exact isolated Preview origin (or explicit --local-check loopback)');
const executable=process.env.QA_CHROMIUM_EXECUTABLE||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const output=path.resolve('qa-artifacts/responsive/final-smoke'+(local?'-local':''));fs.mkdirSync(output,{recursive:true});
(async()=>{
 const report={origin,mode:local?'LOCAL RUNNER VALIDATION':'DEPLOYED BROWSER',viewports:[],passed:0,status:'RUNNING'},browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{}),args:process.env.QA_NO_SANDBOX==='1'?['--no-sandbox']:[]});
 try{
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:width===1440?900:844},colorScheme:'light',locale:'he-IL',timezoneId:'Europe/Amsterdam',isMobile:width===390,hasTouch:width===390,acceptDownloads:true});
   const page=await context.newPage(),errors=[],requests=[],checks=[];
   const check=(v,label)=>{if(!v)throw Error(width+': '+label);checks.push(label);report.passed++;};
   page.on('pageerror',e=>errors.push(e.message));
   await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();requests.push(u.pathname);const token=process.env.VERCEL_OIDC_TOKEN;return token?r.continue({headers:{...r.request().headers(),'x-vercel-trusted-oidc-idp-token':token}}):r.continue();});
   await context.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'סמים',journal:[{id:1,text:'רשומה סינתטית לבדיקת תצוגה בלבד.\nהיום מצאתי רגע של שקט וכתבתי כמה מחשבות.',created:1793487600000}],updatedAt:1}));});
   const response=await page.goto(origin,{waitUntil:'networkidle',timeout:30000});
   check(response?.status()===200&&new URL(page.url()).origin===origin,'Deployed document loads without redirect to login');
   await page.locator('#counter').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);
   const fit=async id=>{
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow: '+id);
    check(await page.locator('#'+id+' input:visible,#'+id+' select:visible,#'+id+' textarea:visible,#'+id+' button:visible').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;})),'Controls fit: '+id);
    check(await page.locator('#tabs').evaluate(e=>getComputedStyle(e).position==='fixed'&&e.getBoundingClientRect().bottom===innerHeight),'Fixed bottom navigation: '+id);
   };
   const capture=name=>page.screenshot({path:path.join(output,name+'-'+width+'.png'),fullPage:true});
   const home=()=>page.locator('[data-tab=counter]').click();
   check(await page.evaluate(()=>window.CleanTimeBackend?.backupDisabled===true&&window.CleanTimeBackend.url===null&&window.CleanTimeBackend.key===null)||local,'Preview backend remains disabled');
   check((await page.locator('.daily-card-title').allTextContents()).join('|')==='רק להיום|תכנון יומי|הכרת תודה|ככה זה עכשיו|חשבון נפש יומי / צעד 10','Five daily actions retain original order');
   check((await page.locator('#tabs .inner>button').evaluateAll(es=>es.map(e=>e.id||e.dataset.tab))).join('|')==='counter|tools|about|openSettings|openAccount','Five navigation options retain original order');
   await fit('counter');await capture('home');
   await page.locator('#counter [data-go=journal]').click();await fit('journal');await capture('journal-list');await page.locator('#jList [role=button]').click();await capture('journal');
   const writing='תוכן סינתטי לבדיקת שמירה וגלילה בלבד.\n'.repeat(50);
   await page.locator('#jText').fill(writing);check(await page.locator('#jText').evaluate(e=>e===document.activeElement&&e.scrollHeight>e.clientHeight),'Journal writing area focuses and scrolls');
   await page.keyboard.press('Tab');check(await page.locator('#jEditor').evaluate(e=>e.contains(document.activeElement)),'Journal traps keyboard focus');await page.keyboard.press('Escape');
   await page.reload();await page.locator('#counter [data-go=journal]').click();await page.locator('#jList [role=button]').click();check(await page.locator('#jText').inputValue()===writing,'Guest Journal persists after reload');await page.locator('#jDone').click();
   await home();await page.locator('#counter [data-go=inventory]').click();await fit('inventory');await capture('step10');
   await page.locator('#iAnswer_na_ip9_q01').fill('תשובה סינתטית לבדיקה בלבד');
   for(let i=0;i<5;i++)await page.locator('#iNext').click();await page.locator('#iNotes').fill('הערה סינתטית לבדיקה בלבד');await page.locator('#iFinish').click();
   check(await page.locator('#iOutput').isVisible(),'Step 10 saves and finishes');
   await page.evaluate(()=>{window.print=()=>{window.smokePrinted=true;};});await page.locator('#iPrint').click();
   check(await page.evaluate(()=>window.smokePrinted)&&await page.locator('#inventoryPrint .inventory-print-question').count()===36,'Print invokes browser with all 36 questions');
   const downloadPromise=page.waitForEvent('download');await page.locator('#iPdf').click();const download=await downloadPromise,file=path.join(output,'synthetic-step10-'+width+'.pdf');await download.saveAs(file);check(fs.readFileSync(file).subarray(0,4).toString()==='%PDF','Step 10 downloads a PDF locally');
   await page.locator('#openSettings').click();await fit('settings');await capture('settings');
   await page.locator('#sDate').fill('2024-01-01');await page.locator('#saveSettings').click();await page.locator('#ask').waitFor({state:'visible'});
   await page.locator('#askB button').last().focus();await page.keyboard.press('Tab');check(await page.locator('#ask').evaluate(e=>e.contains(document.activeElement)),'Confirmation traps keyboard focus');await page.locator('#askB button').last().click();check(await page.locator('#saveSettings').evaluate(e=>e===document.activeElement),'Cancel restores keyboard focus');
   await page.locator('#reset').evaluate(e=>e.scrollIntoView({block:'end'}));check(await page.locator('#reset').evaluate(e=>e.getBoundingClientRect().bottom<=document.getElementById('tabs').getBoundingClientRect().top),'Bottom Settings action scrolls clear of navigation');
   await page.locator('#backgroundChoice').selectOption('sage');await page.locator('#fontChoice').selectOption('tahoma');await page.locator('#accentChoice').selectOption('plum');await page.reload();
   check(await page.evaluate(()=>document.documentElement.dataset.background==='sage'&&document.documentElement.dataset.font==='tahoma'&&document.documentElement.dataset.accent==='plum'),'Appearance preferences persist');
   for(const language of ['en','ru','he']){await page.locator('[data-language='+language+']').click();check(await page.locator('html').getAttribute('dir')===(language==='he'?'rtl':'ltr'),'Language direction '+language);await fit('counter');}
   await page.locator('#openSettings').click();await page.locator('#resetAppearance').click();
   await page.locator('#myAccount').click();check(await page.locator('#accountGuest').isVisible(),'Guest Account available without registration');await fit('account');await capture('account');
   await page.locator('[data-tab=tools]').click();check(await page.locator('#recoveryDestinations [data-go=meditation]').isVisible()&&await page.locator('#recoveryDestinations [data-go=bookmarks]').isVisible(),'Recovery Tools remain available');await fit('tools');await capture('tools');
   await page.emulateMedia({colorScheme:'dark'});await home();await fit('counter');
   check(errors.length===0,'No application JavaScript errors');check(requests.includes('/assets/backend-config.js')&&requests.includes('/assets/inventory-content.js'),'Browser fetched deployed application assets');
   report.viewports.push({width,checks,status:'PASS'});console.log(width+': '+checks.length+' '+(local?'local runner':'deployed')+' checks passed');await context.close();
  }
  report.status='PASS';
 }catch(e){report.status='BLOCKED_OR_FAILED';report.error=String(e.message);process.exitCode=1;console.error(report.error);}
 finally{await browser.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.passed,mode:report.mode}));}
})();
