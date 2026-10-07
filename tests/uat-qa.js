// Local UAT regression: synthetic email registry/SDK only; all external traffic blocked.
async(page)=>{
 const origin=(process.env.QA_BASE_URL||'http://127.0.0.1:8765'),key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 async function scenario(local){
  const c=await page.context().browser().newContext({viewport:{width:360,height:800}});
  await c.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  await c.addInitScript(({local,key})=>{
   if(local&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(local));
   window.qaUsers=['existing@example.invalid'];window.qaLinks=[];window.qaCalls=[];window.qaErrors=[];
   window.addEventListener('error',e=>window.qaErrors.push(e.message));
   const client={auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),signInWithOtp:async args=>{
    window.qaCalls.push(args);
    if(!window.qaUsers.includes(args.email)){
     if(args.options.shouldCreateUser===false)return {error:{code:'otp_disabled',status:422,message:'Signups not allowed for otp'}};
     window.qaUsers.push(args.email);
    }
    window.qaLinks.push(args.email);return {};
   }} };
   window.supabase={createClient:()=>client};
   const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
  },{local,key});
  const p=await c.newPage();await p.goto(origin);return {c,p};
 }
 let {c,p}=await scenario(null);
 await p.locator('#onboardingLogin').click();await p.locator('#lEmail').fill('unused@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaCalls.length===1);
 check(await p.evaluate(()=>window.qaCalls[0].options.shouldCreateUser===false&&window.qaCalls[0].options.emailRedirectTo===location.origin),'Returning login explicitly forbids creation and retains redirect');
 check(await p.evaluate(()=>window.qaUsers.length===1&&window.qaLinks.length===0),'Unused returning email creates no identity or link');
 check((await p.locator('#syncMsg').innerText()).includes('לא מצאנו חשבון')&&await p.locator('#authCreate').isVisible(),'Missing account has Hebrew feedback and Create Account route');
 await p.locator('#lEmail').fill('existing@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaLinks.length===1);
 check(await p.evaluate(()=>window.qaLinks[0]==='existing@example.invalid'&&window.qaUsers.length===1),'Existing returning email receives link without creation');
 check((await p.locator('#syncMsg').innerText()).includes('דואר זבל / Spam'),'Magic-link waiting guidance mentions Spam');
 await p.locator('#authCreate').click();check(await p.locator('#authProfile').isVisible(),'Missing-account route opens full Create Account profile');
 await p.locator('#lEmail').fill('unused@example.invalid');await p.locator('#aDate').fill('2025-01-01');await p.locator('#aFrom').selectOption('אחר');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaLinks.length===2);
 check(await p.evaluate(()=>window.qaCalls[2].options.shouldCreateUser===true&&window.qaUsers.includes('unused@example.invalid')),'Explicit Create Account permits new identity');await c.close();
 ({c,p}=await scenario({date:'2025-01-01',from:'אחר',gratitude:[{id:1,text:'synthetic',ts:1}]}));
 await p.locator('#openSettings').click();await p.locator('#myAccount').click();await p.locator('#createAccount').click();await p.locator('#lEmail').fill('convert@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>window.qaLinks.length===1);
 check(await p.evaluate(k=>window.qaCalls[0].options.shouldCreateUser===true&&window.qaUsers.includes('convert@example.invalid')&&JSON.parse(localStorage.getItem(k)).gratitude[0].text==='synthetic',key),'Guest conversion permits creation and retains local data');await c.close();
 // Native invalid events also expose inline errors before the browser allows submit.
 for(const mode of ['guest','create','settings']){
  ({c,p}=await scenario(mode==='settings'?{date:'2025-01-01'}:null));
  if(mode==='create'){await p.locator('#onboardingLogin').click();await p.locator('#authCreate').click();await p.locator('#lEmail').fill('date@example.invalid');await p.locator('#aFrom').selectOption('אחר');}
  if(mode==='guest')await p.locator('#welcomeStart').click();
  if(mode==='settings')await p.locator('#openSettings').click();
  const id=mode==='guest'?'oDate':mode==='create'?'aDate':'sDate',button=mode==='guest'?'#guestForm button':mode==='create'?'#lSend':'#saveSettings';
  await p.locator('#'+id).fill('');await p.locator(button).click();
  check((await p.locator('#'+id+'Error').innerText())==='יש לבחור תאריך תקין.'&&await p.locator('#'+id).getAttribute('aria-invalid')==='true',mode+': missing date has visible accessible feedback');
  await p.locator('#'+id).fill('2099-01-01');await p.locator(button).click();
  check((await p.locator('#'+id+'Error').innerText()).includes('לא יכול להיות בעתיד'),mode+': future date has distinct inline feedback');
  check(await p.evaluate(k=>window.qaCalls.length===0&&(JSON.parse(localStorage.getItem(k))||{}).date!=='2099-01-01',key),mode+': invalid date neither saves nor sends link');
  await p.locator('#'+id).fill('2025-01-01');check(!await p.locator('#'+id+'Error').isVisible(),mode+': correcting date clears feedback');await c.close();
 }
 const old={questionnaireVersion:'placeholder-v1',answers:{placeholder_1:'old synthetic answer',future_prompt:'keep'},summary:'old',created:1,updated:2,extra:{keep:true}};
 ({c,p}=await scenario({date:'2025-01-01',inventory:{'2025-01-10':old}}));
 const visible=async id=>{await p.waitForFunction(id=>!document.getElementById(id).hidden,id);check(await p.locator('#'+id).isVisible(),'History restores '+id);};
 for(const target of ['gratitude','planner']){
  await p.locator('#counter [data-go="'+target+'"]').click();await visible(target);await p.goBack();await visible('counter');await p.goForward();await visible(target);await p.goBack();await visible('counter');
 }
 await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="journal"]').click();await p.goBack();await visible('tools');await p.goForward();await visible('journal');
 await p.locator('#jNew').click();await p.locator('#jText').fill('synthetic editor');await p.goBack();check(!await p.locator('#jEditor').isVisible()&&await p.locator('#journal').isVisible(),'Android/editor Back closes and commits editor before leaving Journal');
 await p.goForward();check(await p.locator('#jEditor').isVisible()&&await p.locator('#jText').inputValue()==='synthetic editor','Forward restores saved Journal editor');await p.locator('#jDone').click();await p.goBack();await visible('tools');
 await p.locator('[data-tab="counter"]').click();await p.locator('#openSettings').click();await p.goBack();await visible('counter');await p.goForward();await visible('settings');
 const length=await p.evaluate(()=>history.length);await p.locator('#sFrom').fill('synthetic');await p.waitForTimeout(1100);check(await p.evaluate(()=>history.length)===length,'Passive rerenders do not push history');
 await p.locator('[data-tab="counter"]').click();await p.locator('#counter [data-go="inventory"]').click();
 check(await p.locator('#iPlaceholders,[data-slot]').count()===0&&!(await p.locator('#inventory').innerText()).includes('בהכנה'),'Step 10 exposes summary with no unfinished questions or preparation copy');
 await p.locator('#iHistory').selectOption('2025-01-10');await p.locator('#iSummary').fill('updated synthetic summary');await p.reload();await p.locator('#counter [data-go="inventory"]').click();await p.locator('#iHistory').selectOption('2025-01-10');
 check(await p.evaluate(({key,old})=>{const e=JSON.parse(localStorage.getItem(key)).inventory['2025-01-10'];return JSON.stringify(e.answers)===JSON.stringify(old.answers)&&e.questionnaireVersion===old.questionnaireVersion&&e.created===old.created&&e.extra.keep&&e.summary==='updated synthetic summary';},{key,old}),'Legacy placeholder/future answers and metadata survive summary save and reload');
 for(const width of [320,360,508,1280]){
  await p.setViewportSize({width,height:800});await p.locator('#iSummary').fill('א'.repeat(600));
  check(await p.evaluate(()=>{const w=document.documentElement.clientWidth;return document.documentElement.scrollWidth<=w&&[...document.querySelectorAll('#inventory input,#inventory textarea,#inventory select')].every(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=w&&e.scrollWidth<=e.clientWidth;});}),'Step 10 fields and page fit '+width+'px');
 }
 await p.setViewportSize({width:360,height:800});await p.screenshot({path:'/private/tmp/clean-time-uat-step10-360.png',fullPage:true});
 check(await p.evaluate(()=>window.qaErrors.length===0),'UAT journeys have no browser errors');await c.close();
 return {passed:results.length,results};
}
