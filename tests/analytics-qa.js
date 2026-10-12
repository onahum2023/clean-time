// Synthetic protocol + browser checks: every apex request is fulfilled locally.
// CT_ANALYTICS_PROVIDER_SCRIPT may name the unmodified public Vercel script for
// compatibility testing. This never establishes hosted ingestion/dashboard evidence.
async(page)=>{
 const fs=require('fs'),vm=require('vm'),os=require('os'),path=require('path'),{spawnSync}=require('child_process');
 const code=fs.readFileSync('assets/analytics.js','utf8'),results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ct-analytics-build-'));
 const build=(env,analytics,extra={})=>spawnSync(process.execPath,['scripts/build-vercel.js'],{encoding:'utf8',env:{...process.env,VERCEL_ENV:env,CT_BUILD_OUTPUT:tmp,CLEAN_TIME_SUPABASE_URL:'https://uffvbfmfsesdhjzzjiyu.supabase.co',CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC_QA_ONLY',VERCEL_OBSERVABILITY_CLIENT_CONFIG:JSON.stringify({analytics}),...extra}});
 try{
  check(build('production',{}).status===0,'Production legacy fallback builds');
  for(const file of ['index.html','about/index.html','privacy/index.html'])check(fs.readFileSync(path.join(tmp,file),'utf8').includes('data-enabled="true"'),'Production instruments '+file);
  const dynamic={scriptSrc:'/generated.path/script.v2.min.js',viewEndpoint:'/generated.path/intake/view.v2',eventEndpoint:'generated.path/intake/event.v2'};
  check(build('production',dynamic).status===0,'Opaque dotted/versioned and relative Vercel paths build');
  const html=fs.readFileSync(path.join(tmp,'index.html'),'utf8');
  for(const [key,value] of Object.entries(dynamic))check(html.includes(value.startsWith('/')?value:'/'+value),'Production preserves configured '+key);
  for(const key of ['scriptSrc','viewEndpoint','eventEndpoint'])for(const value of ['https://external.invalid/x','//external.invalid/x','/x/../view','/x/./view','/x?email=PRIVATE','/x#token','/x%2fsecret','/x\\secret','/x" onload="bad',null,4,''])check(build('production',{[key]:value}).status!==0,'Invalid '+key+' rejected '+JSON.stringify(value));
  check(build('preview',{scriptSrc:'invalid-unused'}, {VERCEL_OBSERVABILITY_CLIENT_CONFIG:'invalid-unused-json'}).status===0,'Preview ignores unused malformed observability configuration');
  check(fs.readFileSync(path.join(tmp,'index.html'),'utf8').includes('data-enabled="false"'),'Preview instrumentation disabled');
  check(build('preview',{}, {CLEAN_TIME_SUPABASE_URL:'https://aefhjgmiwgajdhgyhelm.supabase.co'}).status!==0,'Preview production backend rejected');
  check(build('preview',{}, {CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY:''}).status!==0,'Preview missing public key rejected');
  check(build('production',{}, {CLEAN_TIME_ANALYTICS_CUSTOM_EVENTS:'false'}).status===0&&fs.readFileSync(path.join(tmp,'index.html'),'utf8').includes('data-custom-events="false"'),'Pageviews-only option for unsupported plan');
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 // Unit boundary: extra data is stripped, unknown events/tools/URLs are rejected.
 const queued=[],scripts=[],handlers={},session=new Map();
 const sandbox={window:{addEventListener:(n,fn)=>handlers[n]=fn},document:{currentScript:{dataset:{enabled:'true',customEvents:'true',scriptSrc:'/provider.v2.js',viewEndpoint:'/intake.v2',eventEndpoint:'/event.v2'}},referrer:'https://referrer.invalid/personal/PRIVATE?email=PRIVATE#PRIVATE',createElement:()=>({dataset:{},remove(){}}),head:{appendChild:s=>scripts.push(s)}},location:new URL('https://clean-time.app/?code=PRIVATE#access_token=PRIVATE'),navigator:{onLine:true},URL,Date,sessionStorage:{setItem:(k,v)=>session.set(k,v),getItem:k=>session.get(k)||null,removeItem:k=>session.delete(k)}};
 sandbox.window.CleanTimeAnalyticsInitial={screen:'welcome',start:['visitor','new_guest']};
 vm.runInNewContext(code,sandbox);
 check(scripts.length===1&&scripts[0].dataset.disableAutoTrack==='1','Manual tracking initializes one script despite sensitive callback URL');
 check(sandbox.document.referrer==='https://referrer.invalid/','External referrer sanitized to origin without excluding visit');
 const filter=sandbox.window.vaq.find(([name])=>name==='beforeSend')[1];
 check(JSON.stringify(filter({type:'pageview',url:'https://clean-time.app/app/journal?email=PRIVATE#PRIVATE',__cdp:{userId:'PRIVATE'},payload:{private:'PRIVATE'}}))===JSON.stringify({type:'pageview',url:'https://clean-time.app/app/journal'}),'Pageview strips queries/fragments/CDP and payload');
 for(const event of [{type:'pageview',url:'https://clean-time.app/journal/PRIVATE'},{type:'pageview',url:'https://outside.invalid/'},{type:'event',url:'https://clean-time.app/',payload:{name:'identify',data:{email:'PRIVATE'}}},{type:'event',url:'https://clean-time.app/',payload:{name:'tool_opened',data:{tool:'PRIVATE'}}}])check(filter(event)===null,'Unknown private event/path rejected');
 check(JSON.stringify(filter({type:'event',url:'https://clean-time.app/',payload:{name:'tool_opened',data:{tool:'journal',content:'PRIVATE',email:'PRIVATE'}}})).includes('"data":{"tool":"journal"}')&&!JSON.stringify(filter({type:'event',url:'https://clean-time.app/',payload:{name:'tool_opened',data:{tool:'journal',content:'PRIVATE'}}})).includes('PRIVATE'),'Custom event properties allowlisted');
 scripts[0].onload();queued.push(...sandbox.window.vaq);sandbox.window.va=(...args)=>queued.push(args);
 const api=sandbox.window.CleanTimeAnalytics;
 api.navigate('journal',true);api.navigate('journal',true);api.started('registered','registered');
 check(queued.filter(([n])=>n==='event').filter(([,e])=>e.name==='app_started').length===1,'Startup once despite rerender');
 check(queued.filter(([n])=>n==='event').filter(([,e])=>e.name==='tool_opened').length===1,'Same screen tool deduplicated');
 api.registrationRequested('convert',Date.now()-100);api.registrationConfirmed(Date.now());api.registrationConfirmed(Date.now());
 check(queued.filter(([,e])=>e?.name==='registration_completed').length===1&&queued.filter(([,e])=>e?.name==='guest_upgraded').length===1&&session.size===0,'Confirmed new account conversion consumes anonymous intent once');
 api.registrationRequested('create',Date.now());api.registrationConfirmed(Date.now()-86400000);
 check(queued.filter(([,e])=>e?.name==='registration_completed').length===1,'Older authenticated account is not a registration');
 const before=queued.length;sandbox.navigator.onLine=false;handlers.offline();api.navigate('gratitude',true);api.event('export_completed');
 check(queued.length===before,'Offline tool/export events dropped');sandbox.navigator.onLine=true;handlers.online();
 check(queued.length===before+2&&queued.at(-1)[1].path==='/app/gratitude','Reconnect reports only current screen, no old events');
 sandbox.window.va=()=>{throw Error('Blocked provider');};api.navigate('inventory',true);api.event('guest_started');check(true,'Throwing provider cannot escape API');
 // Browser uses the real SPA with synthetic Supabase and Analytics transports.
 const provider=process.env.CT_ANALYTICS_PROVIDER_SCRIPT?fs.readFileSync(process.env.CT_ANALYTICS_PROVIDER_SCRIPT,'utf8'):String.raw`(()=>{const s=document.currentScript;let before=e=>e,path='/',route='/';window.va=(n,p)=>{if(n==='beforeSend')before=p;if(n==='pageview'){path=p.path;route=p.route;send('pageview');}if(n==='event')send('event',p);};function send(type,p){const e=before({type,url:location.origin+path,payload:p});if(e)fetch(type==='pageview'?s.dataset.viewEndpoint:s.dataset.eventEndpoint,{method:'POST',body:JSON.stringify({o:e.url,dp:route,r:document.referrer,...(type==='event'?{en:e.payload.name,ed:e.payload.data}:{})})});}(window.vaq||[]).forEach(a=>window.va(...a));})();`;
 const browser=page.context().browser(),origin='https://clean-time.app';
 async function scenario({local=null,registered=false,callback=false,failProvider=false,offline=false,storageBlocked=false}={}){
  const c=await browser.newContext({serviceWorkers:'block',acceptDownloads:true,userAgent:'Synthetic Analytics Protocol QA'}),calls=[];
  await c.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.origin!==origin)return route.abort();
   if(url.pathname.startsWith('/_vercel/insights/')){
    if(url.pathname.endsWith('/script.js'))return failProvider?route.abort():route.fulfill({contentType:'application/javascript',body:provider});
    if(req.method()==='POST')calls.push(JSON.parse(req.postData()));check(!req.headers().referer,'Analytics HTTP request excludes sensitive Referer header');return route.fulfill({status:200,body:'{}'});
   }
   if(url.pathname==='/service-worker.js')return route.abort();
   let file=path.resolve(process.cwd(),url.pathname==='/'?'index.html':'.'+url.pathname);
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   if(!file.startsWith(process.cwd()+'/')||!fs.existsSync(file))return route.fulfill({status:404,body:''});
   return route.fulfill({path:file});
  });
  await c.addInitScript(({local,registered,offline,storageBlocked})=>{
   if(local&&!localStorage.getItem('seeded')){localStorage.setItem('cleantime-he-v1',JSON.stringify(local));localStorage.setItem('seeded','1');}
   // A seeded attribution must never suppress a legitimate visit or leak identity.
   localStorage.setItem('__va_attribution',JSON.stringify({userId:'PRIVATE_ATTRIBUTION',traits:{email:'PRIVATE_EMAIL'}}));
   if(registered){localStorage.setItem('cleantime-he-auth','SYNTHETIC');localStorage.setItem('cleantime-he-sync',JSON.stringify({uid:'PRIVATE_UID'}));}
   window.qaOnline=!offline;Object.defineProperty(navigator,'onLine',{get:()=>window.qaOnline});
   // Only this locally fulfilled provider fixture bypasses bot classification.
   Object.defineProperty(navigator,'webdriver',{get:()=>false});
   Object.defineProperty(document,'referrer',{configurable:true,get:()=> 'https://acquisition.invalid/private/PRIVATE?email=PRIVATE#PRIVATE'});
   if(storageBlocked){const set=sessionStorage.setItem.bind(sessionStorage);sessionStorage.setItem=(k,v)=>{throw Error('Synthetic blocked storage');};}
   const auth={onAuthStateChange(cb){window.qaAuth=cb;},getSession:async()=>({data:{session:registered?{user:{id:'PRIVATE_UID',email:'PRIVATE_EMAIL',created_at:'2020-01-01T00:00:00Z'}}:null}}),signInWithOtp:async()=>({}),signOut:async()=>({})};
   const client={auth,from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null})})})})};
   window.supabase={createClient:()=>client};
   const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
   window.confirm=()=>true;
  },{local,registered,offline,storageBlocked});
  const p=await c.newPage();p.setDefaultTimeout(5000);await p.goto(origin+(callback?'/?code=PRIVATE#access_token=PRIVATE':''));
  await p.waitForTimeout(250);
  return {p,c,calls,settle:()=>p.waitForTimeout(100)};
 }
 let s=await scenario({callback:true});
 check(s.calls.filter(x=>!x.en).length===1&&s.calls[0].o===origin+'/app/auth','Initial callback visit produces one sanitized pageview');
 check(!JSON.stringify(s.calls).includes('PRIVATE'),'Initial request excludes callback/referrer/attribution identity');await s.c.close();
 s=await scenario();
 await s.p.locator('#welcomeStart').click();await s.p.locator('#oDate').fill('2025-01-01');await s.p.locator('#oFrom').selectOption({index:1});await s.p.locator('#guestForm button[type="submit"]').click();await s.settle();
 check(s.calls.filter(x=>x.en==='guest_started').length===1,'Successful guest onboarding emits once');
 check(s.calls.find(x=>x.en==='app_started')?.ed.mode==='visitor','New guest entry classification');
 await s.p.locator('#counter [data-go="journal"]').click();await s.settle();
 check(s.calls.filter(x=>!x.en&&x.o===origin+'/app/journal').length===1&&s.calls.filter(x=>x.en==='tool_opened'&&x.ed.tool==='journal').length===1,'Tool navigation: one pageview and one tool event');
 await s.p.locator('#jNew').click();await s.p.locator('#jText').fill('PRIVATE_JOURNAL');await s.p.locator('#jDone').click();await s.settle();
 check(s.calls.filter(x=>!x.en&&x.o===origin+'/app/journal').length===1,'Editor history/rerender does not duplicate tool pageview');
 await s.p.evaluate(()=>history.back());await s.settle();await s.p.evaluate(()=>history.forward());await s.settle();
 check(s.calls.filter(x=>!x.en&&x.o===origin+'/app/journal').length===2,'Back/Forward tracks real screen return once');
 await s.p.locator('#openSettings').click();
 const download=s.p.waitForEvent('download');await s.p.locator('#exportRecovery').click();await download;await s.settle();
 check(s.calls.filter(x=>x.en==='export_completed').length===1,'Export event after browser download handoff');
 await s.p.locator('#myAccount').click();await s.p.locator('#createAccount').click();await s.p.locator('#aName').fill('PRIVATE_NAME');await s.p.locator('#lEmail').fill('synthetic@example.invalid');await s.p.locator('#lSend').click();await s.settle();
 check(s.calls.filter(x=>x.en==='registration_started').length===1&&s.calls.filter(x=>x.en==='registration_completed').length===0,'Registration intent/email request is not completed registration');
 await s.p.evaluate(()=>{window.qaAuth('SIGNED_IN',{user:{id:'PRIVATE_UID',email:'PRIVATE_EMAIL',created_at:new Date().toISOString()}});});await s.settle();
 check(s.calls.filter(x=>x.en==='registration_completed').length===1&&s.calls.filter(x=>x.en==='guest_upgraded').length===1,'New confirmed registration and guest conversion observed');
 await s.p.evaluate(()=>window.qaAuth('SIGNED_IN',{user:{id:'PRIVATE_UID',created_at:new Date().toISOString()}}));await s.settle();
 check(s.calls.filter(x=>x.en==='registration_completed').length===1,'Repeated SIGNED_IN not double counted');
 check(!JSON.stringify(s.calls).match(/PRIVATE|synthetic@example|2025-01-01|userId|groupId|__cdp|ciphertext|access_token|recoveryKey/),'All observed requests exclude private sentinels, dates, identifiers and keys');await s.c.close();
 const local={date:'2025-01-01',from:'PRIVATE_RECOVERY',linksV:2,journal:[],gratitude:[],updatedAt:1};
 for(const registered of [false,true]){
  s=await scenario({local,registered});
  check(s.calls.filter(x=>x.en==='app_started').length===1&&s.calls.find(x=>x.en==='app_started').ed.mode===(registered?'registered':'guest'),'Startup classification '+(registered?'registered':'returning guest'));
  check(!s.calls.some(x=>['guest_started','tool_opened','registration_completed','backup_activated'].includes(x.en)),'Startup restoration emits no action completions');
  if(!registered){
   for(const [screen,tool] of [['planner','daily_plan'],['gratitude','gratitude'],['inventory','inventory'],['meditation','meditation'],['bookmarks','bookmarks'],['readings','readings']]){
    await s.p.locator('[data-tab="counter"]').click();
    if(['meditation','bookmarks','readings'].includes(screen)){await s.p.locator('[data-tab="tools"]').click();await s.p.locator('#tools [data-go="'+screen+'"]').click();}
    else await s.p.locator('#counter [data-go="'+screen+'"]').click();
    await s.settle();check(s.calls.filter(x=>x.en==='tool_opened'&&x.ed.tool===tool).length===1,'Fixed tool event '+tool);
   }
  }
  await s.c.close();
 }
 s=await scenario({local,offline:true});check(s.calls.length===0,'Offline startup emits no analytics');
 await s.p.locator('#counter [data-go="gratitude"]').click();
 await s.p.evaluate(()=>{window.qaOnline=true;dispatchEvent(new Event('online'));});await s.settle();
 check(s.calls.filter(x=>!x.en).length===1&&s.calls.find(x=>!x.en).o===origin+'/app/gratitude'&&!s.calls.some(x=>x.en==='tool_opened'),'Offline reconnect sends current view without old tool events');await s.c.close();
 s=await scenario({failProvider:true});await s.p.locator('#welcomeStart').click();await s.p.locator('#oDate').fill('2025-01-01');await s.p.locator('#oFrom').selectOption({index:1});await s.p.locator('#guestForm button[type="submit"]').click();
 check(await s.p.locator('#counter').isVisible()&&s.calls.length===0,'Blocked analytics cannot block guest onboarding');await s.c.close();
 // Public documents have exactly one page view, even with sensitive URL parameters.
 for(const slug of ['about','privacy']){
  s=await scenario();s.calls.length=0;await s.p.goto(origin+'/'+slug+'/?private=PRIVATE#PRIVATE');await s.settle();
  check(s.calls.length===1&&s.calls[0].o===origin+'/'+slug+'/','Public '+slug+' measured once with sanitized URL');await s.c.close();
 }
 return {passed:results.length,results};
}
