// Synthetic bootstrap/privacy and build checks. No real intake or recovery data.
async(page)=>{
 const fs=require('fs'),vm=require('vm'),os=require('os'),path=require('path'),{spawnSync}=require('child_process');
 const code=fs.readFileSync('assets/analytics.js','utf8'),results=[];
 const check=(value,label)=>{if(!value)throw Error(label);results.push(label);};
 const run=(url,referrer='',enabled='true',attribution=null)=>{
  const queued=[],scripts=[],location=new URL(url),window={};
  const document={currentScript:{dataset:{enabled,scriptSrc:'/_vercel/insights/script.js',viewEndpoint:'/_vercel/insights/view'}},referrer,
   createElement:()=>({dataset:{}}),head:{appendChild:script=>scripts.push(script)}};
  const sandbox={window,document,location,URL,localStorage:{getItem(key){if(key!=='__va_attribution')throw Error('Must not read recovery storage');return attribution;}}};
  vm.runInNewContext(code,sandbox);queued.push(...window.vaq||[]);
  return {queued,scripts,filter:queued.find(([command])=>command==='beforeSend')?.[1]};
 };
 for(const url of ['https://clean-time.app/?code=SYNTHETIC','https://clean-time.app/?email=synthetic@example.invalid','https://clean-time.app/#access_token=SYNTHETIC','https://clean-time.app/journal/SYNTHETIC','https://clean-time.app/index.html','https://clean-time.app/about/','https://clean-time.app/privacy/','https://preview.vercel.app/','http://127.0.0.1:8765/'])check(run(url).scripts.length===0,'Excluded URL '+new URL(url).pathname+new URL(url).search+new URL(url).hash);
 check(run('https://clean-time.app/','', 'false').scripts.length===0,'Preview build disabled even on apex');
 check(run('https://clean-time.app/','','true','SYNTHETIC_ATTRIBUTION').scripts.length===0,'Persisted vendor identity prevents loading');
 for(const referrer of ['https://external.invalid/private/SYNTHETIC?email=synthetic@example.invalid','https://sub.clean-time.app/','invalid'])check(run('https://clean-time.app/',referrer).scripts.length===0,'External/invalid referrer prevents loading');
 const allowed=run('https://clean-time.app/','https://clean-time.app/privacy/?synthetic=private');
 check(allowed.scripts.length===1&&allowed.scripts[0].src==='/_vercel/insights/script.js','One same-origin provider script');
 check(allowed.scripts[0].defer&&allowed.scripts[0].dataset.disableAutoTrack==='true','SPA auto tracking disabled');
 check(allowed.scripts[0].dataset.viewEndpoint==='/_vercel/insights/view','Explicit verified intake path');
 check(JSON.stringify(allowed.queued.map(([command])=>command))===JSON.stringify(['beforeSend','pageview']),'Filter precedes one manual view; no event/identify/group/cookie commands');
 for(const event of [{type:'event',url:'https://clean-time.app/',payload:{name:'recovery',data:'SYNTHETIC'}},{type:'pageview',url:'https://clean-time.app/?email=SYNTHETIC'},{type:'pageview',url:'https://clean-time.app/journal/SYNTHETIC'},{type:'pageview',url:'https://clean-time.app/#SYNTHETIC'}])check(allowed.filter(event)===null,'Drop custom/private event '+event.type);
 check(JSON.stringify(allowed.filter({type:'pageview',url:'https://clean-time.app/',payload:{email:'SYNTHETIC'},__cdp:{userId:'SYNTHETIC'},extra:'SYNTHETIC'}))===JSON.stringify({type:'pageview',url:'https://clean-time.app/'}),'Allow only public URL/type, discard extra fields');
 check(allowed.filter({type:'pageview',url:'https://clean-time.app/'})===null,'Subsequent views blocked');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ct-analytics-build-'));
 const build=(env,analytics)=>spawnSync(process.execPath,['scripts/build-vercel.js'],{encoding:'utf8',env:{...process.env,VERCEL_ENV:env,CT_BUILD_OUTPUT:tmp,CLEAN_TIME_SUPABASE_URL:'https://uffvbfmfsesdhjzzjiyu.supabase.co',CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC_QA_ONLY',VERCEL_OBSERVABILITY_CLIENT_CONFIG:JSON.stringify({analytics})}});
 try{
  check(build('production',{}).status===0,'Production build succeeds');
  let html=fs.readFileSync(path.join(tmp,'index.html'),'utf8');
  check(html.includes('data-enabled="true"')&&html.includes('data-view-endpoint="/_vercel/insights/view"'),'Production build enables verified default');
  check(html.includes('<meta name="referrer" content="no-referrer">'),'HTTP Referer suppressed');
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1])['@graph'];
  check(graph.every(node=>node.url==='https://clean-time.app/'&&node['@id'].startsWith('https://clean-time.app/#')),'Schema URLs/identifiers apex HTTPS');
  for(const file of ['index.html','about/index.html','privacy/index.html']){
   const body=fs.readFileSync(path.join(tmp,file),'utf8');
   check(!body.includes('www.clean-time.app')&&!body.includes('http://clean-time.app'),'Apex-only public metadata '+file);
   check(body.includes('content="https://clean-time.app/icon-512.png"'),'Apex social image '+file);
  }
  check(build('production',{scriptSrc:'/unique-analytics/script.js',viewEndpoint:'/unique-analytics/view'}).status===0,'Current Vercel dynamic paths accepted');
  html=fs.readFileSync(path.join(tmp,'index.html'),'utf8');
  check(html.includes('data-script-src="/unique-analytics/script.js"')&&html.includes('data-view-endpoint="/unique-analytics/view"'),'Build uses supplied current project paths');
  for(const scriptSrc of ['https://external.invalid/script.js','//external.invalid/script.js','/bad/../script.js','/bad/script.js?private=SYNTHETIC'])check(build('production',{scriptSrc}).status!==0,'Remote/invalid Analytics config fails closed');
  check(build('preview',{}).status===0&&fs.readFileSync(path.join(tmp,'index.html'),'utf8').includes('data-enabled="false"'),'Preview build ships disabled instrumentation');
  check(build('preview',{scriptSrc:'/generated-provider/script.v2.js',viewEndpoint:'/generated-provider/intake'}).status===0&&fs.readFileSync(path.join(tmp,'index.html'),'utf8').includes('data-enabled="false"'),'Unused generated Analytics paths cannot block an isolated Preview');
  check(fs.existsSync(path.join(tmp,'assets/analytics.js')),'Build includes bootstrap asset');
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 return {passed:results.length,results};
}
