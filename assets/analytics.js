// Vercel's vanilla HTML command API, with one owner for all manual SPA tracking.
// This module never reads recovery/account stores or receives content/identifiers.
(()=>{
 if(window.CleanTimeAnalytics)return;
 const config=document.currentScript?.dataset||{};
 const routes=Object.freeze({welcome:'/',onboarding:'/app/onboarding',startup:'/app/startup',counter:'/app/today',planner:'/app/daily-plan',gratitude:'/app/gratitude',journal:'/app/journal',meditation:'/app/meditation',inventory:'/app/inventory',readings:'/app/readings',bookmarks:'/app/bookmarks',tools:'/app/tools',settings:'/app/settings',about:'/app/about',auth:'/app/auth',account:'/app/account',feedback:'/app/feedback'});
 const tools=Object.freeze({planner:'daily_plan',gratitude:'gratitude',journal:'journal',meditation:'meditation',inventory:'inventory',readings:'readings',bookmarks:'bookmarks'});
 const names=new Set(['app_started','guest_started','registration_started','registration_completed','backup_activated','tool_opened','guest_upgraded','export_completed']);
 const paths=new Set([...Object.values(routes),'/about/','/privacy/']);
 const once=new Set();
 let waitingEvents=[];
 let lastPath='',currentPath='/',active=false,loaded=false,loading=false,pendingView=false;
 const safePath=value=>typeof value==='string'&&value.length<=512&&/^\/[A-Za-z0-9_./-]+$/.test(value)&&!value.includes('//')&&!value.split('/').some(part=>part==='.'||part==='..');
 // Vercel appends document.referrer outside beforeSend. Preserve acquisition
 // origin while removing personal paths, queries, credentials and fragments.
 let referrer='';
 try{const url=new URL(document.referrer);if(['https:','http:'].includes(url.protocol)&&url.origin!==location.origin)referrer=url.origin+'/';}catch{}
 function filter(event){
  try{
   const url=new URL(event.url);
   if(url.origin!==location.origin||!paths.has(url.pathname))return null;
   const clean={type:event.type,url:location.origin+url.pathname};
   if(event.type==='pageview')return clean;
   if(event.type!=='event'||!names.has(event.payload?.name))return null;
   const data=properties(event.payload.name,event.payload.data);
   if(data===null)return null;
   return {...clean,payload:{name:event.payload.name,data}};
  }catch{return null;}
 }
 function properties(name,data={}){
  if(name==='tool_opened')return Object.values(tools).includes(data.tool)?{tool:data.tool}:null;
  if(name==='app_started')return ['visitor','guest','registered','unknown'].includes(data.mode)&&['new_guest','returning_guest','registered','unknown'].includes(data.entry)?{mode:data.mode,entry:data.entry}:null;
  return {};
 }
 function command(name,payload){
  try{
   // Reset the provider's optional persisted attribution before every send.
   // The shipped provider supports reset; we never identify/group or opt into cookies.
   window.va('reset');window.va(name,payload);
  }catch{} // Analytics can never interrupt the application.
 }
 function emit(name,data={},single=false){
  if(!active||!navigator.onLine||!names.has(name)||config.customEvents!=='true'||single&&once.has(name))return;
  const clean=properties(name,data);if(clean===null)return;
  if(single)once.add(name);
  if(!loaded){if(waitingEvents.length<20)waitingEvents.push({name,data:clean});return;}
  command('event',{name,data:clean});
 }
 function view(){
  if(!active||!loaded||!navigator.onLine)return;
  command('pageview',{path:currentPath,route:currentPath});pendingView=false;
 }
 function load(){
  if(!active||loaded||loading||!navigator.onLine)return;
  loading=true;
  try{
   const script=document.createElement('script');script.defer=true;script.src=config.scriptSrc;
   script.dataset.disableAutoTrack='1';script.dataset.viewEndpoint=config.viewEndpoint;script.dataset.eventEndpoint=config.eventEndpoint;
   script.onload=()=>{loading=false;loaded=true;if(pendingView)view();flushStart();for(const event of waitingEvents)command('event',event);waitingEvents=[];};
   script.onerror=()=>{loading=false;waitingEvents=[];script.remove();};
   document.head.appendChild(script);
  }catch{loading=false;}
 }
 let startData=null;
 function flushStart(){if(startData&&loaded&&navigator.onLine){emit('app_started',startData,true);startData=null;}}
 function navigate(screen,interactive=false){
  const path=routes[screen];if(!path)return;
  currentPath=path;
  if(path===lastPath)return;
  lastPath=path;pendingView=true;load();view();
  if(interactive&&tools[screen])emit('tool_opened',{tool:tools[screen]});
 }
 // One short-lived, anonymous registration intent, separate from recovery data.
 // It contains only a mode/time, never an email, user ID, token, key or event queue.
 const intentKey='clean-time-analytics-registration';
 function registrationRequested(mode,startedAt){
  if(!active||!['create','convert'].includes(mode))return;
  try{sessionStorage.setItem(intentKey,JSON.stringify({mode,startedAt}));}catch{}
 }
 function registrationConfirmed(createdAt){
  if(!active)return;
  let intent;
  try{intent=JSON.parse(sessionStorage.getItem(intentKey));sessionStorage.removeItem(intentKey);}catch{return;}
  // A restored/older account is a login, not a new registration. Clock skew or
  // cross-browser magic links may undercount; this is not an identity-bound funnel.
  if(!intent||!['create','convert'].includes(intent.mode)||!Number.isFinite(intent.startedAt)||Date.now()-intent.startedAt>3600000||intent.startedAt>Date.now()||!Number.isFinite(createdAt)||createdAt<intent.startedAt-1000||createdAt>Date.now())return;
  emit('registration_completed',{},true);
  if(intent.mode==='convert')emit('guest_upgraded',{},true);
 }
 const protect=fn=>(...args)=>{try{return fn(...args);}catch{}};
 window.CleanTimeAnalytics=Object.freeze({
  navigate:protect(navigate),
  started:protect((mode,entry)=>{if(!startData&&!once.has('app_started'))startData={mode,entry};flushStart();}),
  event:protect(emit),registrationRequested:protect(registrationRequested),registrationConfirmed:protect(registrationConfirmed)
 });
 try{
  if(config.enabled!=='true'||location.origin!=='https://clean-time.app')return;
  if(![config.scriptSrc,config.viewEndpoint,config.eventEndpoint].every(safePath))return;
  if(!['/','/index.html','/about/','/privacy/'].includes(location.pathname))return;
  Object.defineProperty(document,'referrer',{configurable:true,get:()=>referrer});
  window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
  window.va('beforeSend',filter);
  active=true;
  if(location.pathname==='/about/'||location.pathname==='/privacy/'){
   currentPath=lastPath=location.pathname;pendingView=true;
  }else if(window.CleanTimeAnalyticsInitial){
   const initial=window.CleanTimeAnalyticsInitial;
   navigate(initial.screen);window.CleanTimeAnalyticsInitial=null;
   if(initial.start)window.CleanTimeAnalytics.started(...initial.start);
  }
  // No offline event backlog. Reconnection sends only the current visible view.
  window.addEventListener('offline',()=>{pendingView=true;waitingEvents=[];});
  window.addEventListener('online',()=>{load();if(pendingView)view();flushStart();});
  load();
 }catch{active=false;}
})();
