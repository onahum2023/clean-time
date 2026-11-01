// Actual viewport screenshots including the complete fixed footer. Synthetic only.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',output=path.resolve(process.env.QA_CAPTURE_OUTPUT||'qa-artifacts/issue-75-navigation');
const url=new URL(origin);
if(url.origin!==origin||!(url.protocol==='http:'&&url.hostname==='127.0.0.1'||url.protocol==='https:'&&url.hostname.endsWith('.vercel.app')))throw Error('Use exact loopback or Preview origin');
const {normalize}=require('../assets/recovery-timers.js');
const fixture=normalize({date:'2025-01-01',time:'',from:'סמים',linksV:2,links:[],updatedAt:1});
fixture.timers.push({id:'second',category:'alcohol',label:'',date:'2026-05-01',time:''});
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({headless:true});
 require('./preview-access.js').attachPreviewAccess(browser);
 try{
  for(const width of [1440,390])for(const colorScheme of ['light','dark'])for(const screen of ['home','welcome']){
   const c=await browser.newContext({viewport:{width,height:width===1440?900:844},colorScheme,timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
   await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
   if(screen==='home')await c.addInitScript(f=>localStorage.setItem('cleantime-he-v1',JSON.stringify(f)),fixture);
   const p=await c.newPage();await p.clock.install({time:new Date('2026-11-01T12:00:00Z')});
   await p.goto(origin);await p.locator(screen==='home'?'#counter':'#welcome').waitFor();await p.evaluate(()=>document.fonts.ready);await p.mouse.move(0,0);
   await p.screenshot({path:path.join(output,`${screen}-${width}-${colorScheme}.png`)});
   if(screen==='welcome')await p.screenshot({path:path.join(output,`${screen}-${width}-${colorScheme}-full.png`),fullPage:true});
   if(screen==='home')console.log(JSON.stringify({width,colorScheme,geometry:await p.evaluate(()=>{const r=s=>{const {left,right,width,height}=document.querySelector(s).getBoundingClientRect();return {left,right,width,height}};return {home:r('#counter'),nav:r('#tabs .inner'),footer:r('#tabs')}})}));
   await c.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
