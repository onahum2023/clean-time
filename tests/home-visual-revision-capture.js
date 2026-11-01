// Matched actual Preview viewports; only synthetic records/preferences, no asset/document mocks.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',output=path.resolve(process.env.QA_CAPTURE_OUTPUT||'qa-artifacts/issue-81-home');
const url=new URL(origin);if(url.origin!==origin||!(url.protocol==='http:'&&url.hostname==='127.0.0.1'||url.protocol==='https:'&&url.hostname.endsWith('.vercel.app')))throw Error('Exact isolated origin required');
const {normalize}=require('../assets/recovery-timers.js');
const fixture=normalize({date:'2026-08-07',time:'',from:'סמים',linksV:2,links:[],updatedAt:1});
if(process.env.QA_CAPTURE_NAME)fixture.name=process.env.QA_CAPTURE_NAME;
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({headless:true});require('./preview-access.js').attachPreviewAccess(browser);
 try{
  for(const width of (process.env.QA_CAPTURE_WIDTHS||'1440,1024,390').split(',').map(Number))for(const mode of ['light','dark'])for(const palette of ['original','forest']){
   const context=await browser.newContext({viewport:{width,height:width===1440?900:width===1024?768:844},colorScheme:mode,timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
   await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
   await context.addInitScript(({fixture,palette})=>{localStorage.setItem('cleantime-he-v1',JSON.stringify(fixture));localStorage.setItem('cleantime-he-visual-theme',JSON.stringify({palette,mode:'system'}));},{fixture,palette});
   const p=await context.newPage();p.on('pageerror',e=>{throw e;});await p.clock.install({time:new Date('2026-11-01T12:00:00Z')});await p.goto(origin);await p.locator('#counter').waitFor();await p.evaluate(()=>document.fonts.ready);await p.mouse.move(0,0);
   const stem=`${process.env.QA_CAPTURE_NAME?'home-named':'home'}-${palette}-${width}-${mode}`;await p.screenshot({path:path.join(output,stem+'.png'),animations:'disabled'});
   if(width>=1024)await p.screenshot({path:path.join(output,stem+'-full.png'),animations:'disabled',fullPage:true});
   console.log('Captured actual '+url.hostname+' '+stem);await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
