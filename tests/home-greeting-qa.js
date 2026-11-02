// The only new dynamic scope: device-local greeting, with synthetic names and no writes/fetches.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const {normalize}=require(process.cwd()+'/assets/recovery-timers.js');
 const fixture=normalize({name:'נועם <name>',date:'2026-08-07',from:'סמים',linksV:2,links:[],updatedAt:1,unknown:{keep:true}});
 const make=async timezoneId=>{
  const c=await page.context().browser().newContext({timezoneId,viewport:{width:1440,height:900}});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
  await c.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));},{key,fixture});
  const p=await c.newPage();await p.clock.install({time:new Date('2026-11-01T12:00:00Z')});await p.goto(origin);await p.locator('#counter').waitFor();return {c,p};
 };
 for(const [zone,word] of [['America/New_York','בוקר טוב'],['Asia/Jerusalem','צהריים טובים'],['Asia/Tokyo','ערב טוב'],['Pacific/Honolulu','שלום']]){
  const {c,p}=await make(zone);
  try{
   check(await p.locator('#homeGreeting').textContent()===word+', נועם <name>','Same UTC instant follows device-local clock in '+zone);
   check(await p.locator('#homeGreeting *').count()===0,'Stored name remains literal text '+zone);
   const saved=await p.evaluate(key=>localStorage.getItem(key),key);await p.reload();
   check(await p.evaluate(key=>localStorage.getItem(key),key)===saved,'Greeting startup/reload preserves exact recovery bytes '+zone);
  }finally{await c.close();}
 }
 const {c,p}=await make('UTC');
 try{
  const saved=await p.evaluate(key=>localStorage.getItem(key),key);
  for(const [time,word] of [['00:00:00','שלום'],['04:59:59','שלום'],['05:00:00','בוקר טוב'],['11:59:59','בוקר טוב'],['12:00:00','צהריים טובים'],['16:59:59','צהריים טובים'],['17:00:00','ערב טוב'],['23:59:59','ערב טוב']]){
   await p.clock.setFixedTime(new Date('2026-11-01T'+time+'Z'));await p.clock.runFor(1100);
   check(await p.locator('#homeGreeting').textContent()===word+', נועם <name>','Open Home updates without reload at local '+time);
  }
  check(await p.evaluate(key=>localStorage.getItem(key),key)===saved,'Clock-band transitions do not rewrite recovery state');
  for(const [lang,word] of [['en','Good evening'],['ru','Добрый вечер'],['he','ערב טוב']]){
   if(await p.locator('html').getAttribute('lang')!==lang)await Promise.all([p.waitForEvent('domcontentloaded'),p.locator('[data-language='+lang+']').click()]);
   await p.locator('#counter').waitFor();
   check(await p.locator('#homeGreeting').textContent()===word+', נועם <name>','Greeting translates without changing the clock band '+lang);
  }
 }finally{await c.close();}
 return {passed:results.length,results};
}
