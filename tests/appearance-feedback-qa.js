async(page)=>{
 const results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.addInitScript(()=>{localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',linksV:2,links:[],journal:[{id:1,text:'סינתטי',created:1}],updatedAt:1}));});
 await page.goto(origin);const saved=await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'));
 await page.locator('#openSettings').click();
 for(const background of ['default','sage','sand'])for(const font of ['assistant','arial','serif']){
  await page.locator('#backgroundChoice').selectOption(background);await page.locator('#fontChoice').selectOption(font);
  check(await page.evaluate(({background,font})=>document.documentElement.dataset.background===background&&document.documentElement.dataset.font===font,{background,font}),'Immediate preview '+background+'/'+font);
  for(const colorScheme of ['light','dark']){await page.emulateMedia({colorScheme});await page.setViewportSize({width:320,height:800});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px no overflow '+background+'/'+font+'/'+colorScheme);
   check(await page.evaluate(()=>{const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=s=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0),body=getComputedStyle(document.body),el=document.createElement('span');el.style.color='var(--muted)';document.body.append(el);const a=lum(body.backgroundColor),b=lum(getComputedStyle(el).color);el.remove();return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5;}),'Readable muted contrast '+background+'/'+font+'/'+colorScheme);}
 }
 await page.reload();check(await page.evaluate(()=>document.documentElement.dataset.background==='sand'&&document.documentElement.dataset.font==='serif'),'Reload restores local appearance');
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===saved,'Preferences do not rewrite recovery state/timestamp');
 await page.locator('#openSettings').click();await page.locator('#resetAppearance').click();check(await page.evaluate(()=>document.documentElement.dataset.background==='default'&&document.documentElement.dataset.font==='assistant'),'Reset to original appearance');
 await page.evaluate(()=>localStorage.setItem('cleantime-he-appearance','{"background":"invalid","font":"unavailable"}'));await page.reload();check(await page.evaluate(()=>document.documentElement.dataset.background==='default'&&document.documentElement.dataset.font==='assistant'),'Invalid preference falls back safely');
 await page.locator('#counter [data-go=feedback]').click();check(await page.locator('#feedback').isVisible(),'Feedback directly reachable from Home');
 const link=await page.locator('#feedbackMail').getAttribute('href');check(link.startsWith('mailto:hello@clean-time.app?subject=')&&!link.includes('body='),'Feedback has no automatic recovery-data payload');
 check((await page.locator('#feedback').innerText()).includes('רגישים')&&(await page.locator('#feedback').innerText()).includes('hello@clean-time.app'),'Privacy warning and visible mobile email fallback');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('blocked');}},configurable:true}));await page.locator('#copyFeedbackEmail').click();check((await page.locator('#feedbackStatus').innerText()).includes('לסמן ולהעתיק'),'Clipboard failure has selectable address fallback');
 await page.goBack();check(await page.locator('#counter').isVisible(),'Feedback Back returns Home');
 await page.locator('#openSettings').click();await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('quota');};});await page.locator('#backgroundChoice').selectOption('sage');check((await page.locator('#appearanceStatus').innerText()).includes('לא נשמר'),'Storage failure is visible');
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===saved,'Feedback and storage failure preserve recovery data');
 return {passed:results.length,results};
}
