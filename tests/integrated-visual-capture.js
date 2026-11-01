// Actual deployed or loopback UI with synthetic guest records. No document/API mocks.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',output=path.resolve(process.env.QA_CAPTURE_OUTPUT||'qa-artifacts/issue-80-local');
const url=new URL(origin);
if(url.origin!==origin||!(url.protocol==='http:'&&url.hostname==='127.0.0.1'||url.protocol==='https:'&&url.hostname.endsWith('.vercel.app')))throw Error('Exact isolated origin required');
const only=(process.env.QA_CAPTURE_SCREENS||'').split(',').filter(Boolean),wanted=id=>!only.length||only.includes(id);
const {normalize}=require('../assets/recovery-timers.js');
const fixture=normalize({date:'2025-01-01',from:'סמים',linksV:2,links:[{id:'reading',title:'קריאה לדוגמה',url:'https://example.invalid/reading'}],updatedAt:1,journal:[{id:1,text:'רשומה סינתטית לבדיקת תצוגה בלבד.\nהיום מצאתי זמן לכתוב ולסדר את המחשבות.\nהטקסט הזה מדגים כתיבה נוחה במחשב ובטלפון.',created:1793523600000}],gratitude:[{id:2,text:'תודה על שיחה טובה ועל רגע של שקט. טקסט סינתטי לבדיקה.',ts:1793523600000,day:'2026-11-01'}],plans:{'2026-11-01':[{id:3,text:'לפנות זמן לשיחה ולכתיבה — דוגמה סינתטית',done:false},{id:4,text:'לצאת להליכה קצרה — דוגמה סינתטית',done:true}]},bookmarks:[{id:5,title:'קישור לדוגמה',url:'https://example.invalid/resource',note:'הערה סינתטית לבדיקת פריסה'}]});
fixture.timers.push({id:'second',category:'alcohol',label:'',date:'2026-05-01',time:''});
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({headless:true});require('./preview-access.js').attachPreviewAccess(browser);
 const make=async(width,colorScheme,seed)=>{
  const context=await browser.newContext({viewport:{width,height:width===1440?900:width===1024?768:width===320?568:844},colorScheme,timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
  if(seed)await context.addInitScript(f=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify(f));},fixture);
  const p=await context.newPage();p.on('pageerror',e=>{throw e;});await p.clock.install({time:new Date('2026-11-01T12:00:00Z')});await p.goto(origin);await p.evaluate(()=>document.fonts.ready);return {context,p};
 };
 try{
  for(const width of (process.env.QA_CAPTURE_WIDTHS||'1440,390').split(',').map(Number))for(const mode of ['light','dark']){
   let {context,p}=await make(width,mode,true);await p.locator('#counter').waitFor();
   const home=()=>p.locator('[data-tab=counter]').click();
   const open=async id=>{
    if(await p.locator('#auth').isVisible())await p.locator('#authBack').click();
    if(await p.locator('#'+id).isVisible())return;
    if(['counter','tools','about','account'].includes(id))return p.locator('[data-tab='+id+']').click();
    if(id==='settings')return p.locator('#openSettings').click();
    if(id==='counterDetails'){await open('settings');return p.locator('#settings [data-go=counterDetails]').click();}
    if(id==='feedback'){await open('about');return p.locator('#about [data-go=feedback]').click();}
    if(['planner','gratitude','journal','inventory'].includes(id)){await home();return p.locator('#counter [data-go='+id+']').click();}
    await open('tools');return p.locator(id==='readings'?'#tools [data-go=readings]':'#recoveryDestinations [data-go='+id+']').click();
   };
   const capture=async name=>{await p.mouse.move(0,0);await p.screenshot({path:path.join(output,`${name}-${width}-${mode}.png`),animations:'disabled'});};
   for(const [name,id] of [['home','counter'],['plan','planner'],['gratitude','gratitude'],['journal','journal'],['step10','inventory'],['meditation','meditation'],['tools','tools'],['bookmarks','bookmarks'],['readings','readings'],['settings','settings'],['appearance','settings'],['counter-details','counterDetails'],['account','account'],['about','about'],['feedback','feedback'],['auth','account'],['confirmation','settings']]){
    if(!wanted(name))continue;await open(id);
    if(name==='step10'){await p.locator('#iQuestions textarea').first().fill('תשובה סינתטית לבדיקת כתיבה, שמירה ופריסה בלבד.');await p.evaluate(()=>scrollTo(0,0));}
    if(name==='appearance')await p.locator('#paletteChoices').scrollIntoViewIfNeeded();
    if(name==='auth')await p.locator('#settingsLogin').click();
    if(name==='confirmation'){await p.locator('#sDate').fill('2024-01-01');await p.locator('#saveSettings').click();await p.locator('#ask').waitFor();}
    await capture(name);
    if(['settings','step10','about'].includes(name))await p.screenshot({path:path.join(output,`${name}-${width}-${mode}-full.png`),fullPage:true,animations:'disabled'});
    if(name==='confirmation')await p.locator('#askB button').last().click();
    if(name==='journal'&&wanted('journal-editor')){await p.locator('#jList [role=button]').first().click();await capture('journal-editor');await p.locator('#jDone').click();}
   }
   if(wanted('palettes'))for(const palette of ['forest','rainy','sunny']){
    await open('settings');await p.locator('[name=palette][value='+palette+']').check();await p.locator('#paletteChoices').scrollIntoViewIfNeeded();await capture('palette-'+palette+'-settings');
    await home();await capture('palette-'+palette+'-home');
   }
   await context.close();({context,p}=await make(width,mode,false));await p.locator('#welcome').waitFor();
   if(wanted('welcome')){await capture('welcome');await p.screenshot({path:path.join(output,`welcome-${width}-${mode}-full.png`),fullPage:true,animations:'disabled'});}
   if(wanted('onboarding')||wanted('onboarding-second')){
    await p.locator('#welcomeStart').click();await p.locator('#oDate').fill('2025-01-01');await p.locator('#oRecoveryChoices input[value="סמים"]').check();
    if(wanted('onboarding'))await capture('onboarding');
    if(wanted('onboarding-second')){await p.locator('#oAddSecond').check();await p.locator('#oSecondCategory').selectOption('alcohol');await p.locator('#oSecondDate').fill('2026-05-01');await p.locator('#oSecondFields').scrollIntoViewIfNeeded();await capture('onboarding-second');}
   }
   await context.close();console.log('Captured synthetic Hebrew RTL '+width+' '+mode);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
