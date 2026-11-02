// Reproducible synthetic Welcome and unchanged-flow captures. No live user state.
// node tests/welcome-capture.js before|after|preview|revised|revised-preview
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const stage=process.argv[2]||'after',origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
if(!['before','after','preview','revised','revised-preview'].includes(stage))throw Error('Unknown capture stage');
const url=new URL(origin);
if(url.origin!==origin||!(url.protocol==='http:'&&url.hostname==='127.0.0.1'||url.protocol==='https:'&&url.hostname.endsWith('.vercel.app')))throw Error('Use loopback or exact Preview origin');
const output=path.resolve('docs/issue-77-visuals');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 require('./preview-access.js').attachPreviewAccess(browser);
 try{
  for(const width of [390,1440])for(const colorScheme of ['light','dark']){
   const c=await browser.newContext({viewport:{width,height:width===390?844:900},colorScheme,timezoneId:'Europe/Amsterdam'});
   await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
   const p=await c.newPage();await p.clock.install({time:new Date('2026-11-01T12:00:00Z')});
   await p.goto(origin);await p.locator('#welcome').waitFor();await p.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.active,{},{timeout:20000});await p.evaluate(()=>document.fonts.ready);
   await p.screenshot({path:path.join(output,`${stage}-${width}-${colorScheme}.png`)});
   await p.screenshot({path:path.join(output,`${stage}-${width}-${colorScheme}-full.png`),fullPage:true});
   if(stage.startsWith('revised')){await p.locator('.welcome-privacy').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(output,`${stage}-${width}-${colorScheme}-footer.png`)});}
   // Private local evidence: compare the untouched setup and Today byte for byte.
   const regression=path.resolve('qa-artifacts/issue-77');fs.mkdirSync(regression,{recursive:true});
   await p.locator('#welcomeStart').click();await p.locator('#oDate').fill('2025-01-01');await p.locator('#oRecoveryChoices input[value="אחר"]').check();
   await p.screenshot({path:path.join(regression,`${stage}-setup-${width}-${colorScheme}.png`),fullPage:true});
   await p.locator('#guestForm button[type=submit]').click();await p.locator('#counter').waitFor();
   await p.screenshot({path:path.join(regression,`${stage}-today-${width}-${colorScheme}.png`),fullPage:true});
   await c.close();console.log(`${stage}: ${width} ${colorScheme}`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
