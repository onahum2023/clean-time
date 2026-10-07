// Runs on localhost or QA_BASE_URL. Fresh synthetic contexts; no live account/backend traffic.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const browser=page.context().browser();
 for(const timezoneId of ['Asia/Jerusalem','America/Los_Angeles','Pacific/Kiritimati']){
  const c=await browser.newContext({viewport:{width:360,height:800},timezoneId});
  const p=await c.newPage(),external=[],errors=[];
  await c.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.fallback();external.push(r.request().url());return r.abort();});
  p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);
  check(await p.locator('#welcome').isVisible()&&!await p.locator('#guestForm').isVisible()&&!await p.locator('#tabs').isVisible()&&!await p.locator('#openSettings').isVisible(),'Fresh Welcome has no recovery fields/navigation '+timezoneId);
  check(await p.locator('#welcome input').count()===0&&!await p.locator('#authCreate').isVisible(),'Welcome has no registration form');
  await p.locator('#welcome [data-go=about]').click();check(await p.locator('#about').isVisible()&&await p.locator('#aboutBack').isVisible(),'About/privacy reachable before setup');
  await p.locator('#aboutBack').click();await p.locator('#welcome').waitFor();
  await p.keyboard.press('Tab');await p.locator('#welcomeStart').focus();
  check(await p.locator('#welcomeStart').evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Start keyboard focus visible');
  await p.keyboard.press('Enter');await p.locator('#onboarding').waitFor();
  await p.locator('#guestForm button').click();check((await p.locator('#oDateError').innerText()).includes('תקין'),'Required date has Hebrew error');
  await p.locator('#oDate').fill('2099-01-01');await p.locator('#guestForm button').click();check((await p.locator('#oDateError').innerText()).includes('בעתיד')&&!await p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').date,key),'Future date cannot save');
  await p.locator('#oDate').fill('2026-10-01');
  check((await p.locator('#oDateConfirmation').innerText()).includes('1 באוקטובר 2026'),'October 1 display across time zones '+timezoneId);
  await p.locator('#guestForm button').click();check(await p.locator('#oFromError').isVisible(),'Recovery type required in Hebrew');
  await p.locator('#oFrom').selectOption('אחר');await p.locator('#setupBack').click();await p.locator('#welcomeStart').click();
  check(await p.locator('#oDate').inputValue()==='2026-10-01'&&await p.locator('#oFrom').inputValue()==='אחר','Visible Back retains draft');
  await p.goBack();check(await p.locator('#welcome').isVisible(),'Browser Back returns Welcome');await p.goForward();
  await p.locator('#guestForm button').click();check(await p.locator('#counter').isVisible()&&await p.locator('#tabs').isVisible(),'Guest setup enters Today');
  await p.locator('#counter [data-go=gratitude]').click();await p.locator('#gInput').fill('תודה סינתטית');await p.locator('#gAdd').click();
  const saved=await p.evaluate(k=>localStorage.getItem(k),key);await p.reload();
  check(await p.locator('#counter').isVisible()&&await p.evaluate(({key,saved})=>{const a=JSON.parse(localStorage.getItem(key)),b=JSON.parse(saved);return a.date===b.date&&a.from===b.from&&JSON.stringify(a.gratitude)===JSON.stringify(b.gratitude)&&a.updatedAt===b.updatedAt;},{key,saved}),'Useful action survives reload; existing guest directly Today');
  await p.locator('#openSettings').click();check((await p.locator('#sDateConfirmation').innerText()).includes('1 באוקטובר 2026'),'Settings selected date confirmation');
  await p.locator('#sDate').fill('2026-01-10');check((await p.locator('#sDateConfirmation').innerText()).includes('10 בינואר 2026'),'January 10 cannot be mistaken for October 1');
  check(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).date,key)==='2026-10-01','Display does not mutate canonical date');
  await p.locator('#myAccount').click();check(await p.locator('#accountGuest').isVisible()&&await p.locator('#createAccount').isVisible(),'Optional registration lives in guest My Account');
  await p.locator('#createAccount').click();check(!await p.locator('#authProfile').isVisible(),'Configured guest conversion does not repeat recovery setup');
  await p.locator('#authBack').click();check(await p.locator('#account').isVisible(),'Account form Back returns My Account');
  check(external.length===0&&errors.length===0,'Guest flow no third-party requests or JS errors');await c.close();
 }
 for(const width of [320,360,390,1280])for(const colorScheme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height:800},colorScheme});const p=await c.newPage();await p.goto(origin);
  for(const screen of ['welcome','onboarding']){
   if(screen==='onboarding'){await p.locator('#welcomeStart').click();check(await p.locator('#oDate').evaluate((e,theme)=>getComputedStyle(e).colorScheme===theme,colorScheme),'Native date control theme '+width+' '+colorScheme);}
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.documentElement).direction==='rtl'),screen+' RTL fit '+width+' '+colorScheme);
   check(await p.locator('#'+screen+' button:visible').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)),screen+' touch targets '+width+' '+colorScheme);
   if(screen==='welcome'){
    const layout=await p.evaluate(()=>{
     const welcome=document.getElementById('welcome'),brand=welcome.querySelector('.welcome-brand'),logo=welcome.querySelector('img'),name=document.getElementById('welcomeTitle'),features=welcome.querySelector('.welcome-features'),entry=welcome.querySelector('.welcome-entry');
     const rect=e=>e.getBoundingClientRect(),center=e=>rect(e).left+rect(e).width/2;
     const icon=selector=>document.querySelector(selector).outerHTML;
     const counterparts={counter:'#counter .daybreak',planner:'#planner .page-heading .page-art',journal:'#journal .page-heading .page-art',gratitude:'#gratitude .page-heading .page-art'};
     const items=[...welcome.querySelectorAll('[data-feature]')];
     const expectedNames=['זמן נקי',...['planner','journal','gratitude'].map(id=>document.querySelector('#'+id+' .page-heading h2').textContent)];
     const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
     const luminance=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
     const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
     return {
      order:rect(brand).bottom<=rect(features).top&&rect(features).bottom<=rect(entry).top,
      brand:Math.abs(center(logo)-center(welcome))<1&&Math.abs(center(name)-center(welcome))<1&&getComputedStyle(name).textAlign==='center'&&getComputedStyle(name).userSelect!=='none'&&getComputedStyle(name).fontSize!==getComputedStyle(welcome.querySelector('.welcome-origin')).fontSize,
      logo:logo.naturalWidth===512&&rect(logo).width>=80&&logo.getAttribute('src')==='/icon-512.png',
      noDuplicateTitle:document.querySelector('header').hidden&&[...document.querySelectorAll('h1')].filter(e=>e.getBoundingClientRect().height>0).length===1,
      items:items.length===4&&items.every((e,i)=>e.querySelector('h3').textContent===expectedNames[i]&&e.querySelector('p').textContent&&icon('[data-feature='+e.dataset.feature+'] svg')===icon(counterparts[e.dataset.feature])),
      static:!features.querySelector('a,button,input,[data-go],[data-tab],[tabindex],[role=button],[role=link]'),
      readable:items.every(e=>['h3','p','svg'].every(tag=>contrast(getComputedStyle(e.querySelector(tag)).color,getComputedStyle(e).backgroundColor)>=4.5)),
      oneAction:welcome.querySelectorAll('#welcomeStart').length===1&&welcome.querySelectorAll('#onboardingLogin').length===1&&[...entry.querySelectorAll('button')].every(e=>getComputedStyle(e).position!=='fixed'&&getComputedStyle(e).position!=='sticky')
     };
    });
    for(const [key,valid] of Object.entries(layout))check(valid,'Landing '+key+' '+width+' '+colorScheme);
    await p.locator('#onboardingLogin').focus();check(await p.locator('#onboardingLogin').evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Secondary sign-in keyboard focus '+width+' '+colorScheme);
    await p.locator('#welcome [data-go=about]').scrollIntoViewIfNeeded();await p.locator('#welcome [data-go=about]').focus();check(await p.locator('#welcome [data-go=about]').evaluate(e=>e.getBoundingClientRect().top>=-1&&e.getBoundingClientRect().bottom<=innerHeight+1),'About/privacy reachable by normal scrolling '+width+' '+colorScheme);
   }
  }
  await c.close();
 }
 const enlarged=await browser.newContext({viewport:{width:320,height:568}}),ep=await enlarged.newPage();
 await enlarged.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());await ep.goto(origin);
 await ep.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
 check(await ep.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Enlarged text landing has no horizontal overflow');
 await ep.locator('#welcomeStart').focus();check(await ep.locator('#welcomeStart').evaluate(e=>e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().bottom<=innerHeight),'Enlarged text permits scrolling to primary action');
 await ep.keyboard.press('Enter');check(await ep.locator('#onboarding').isVisible(),'Enlarged text primary action opens minimal setup');await enlarged.close();
 return {passed:results.length,results};
}
