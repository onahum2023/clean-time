// Synthetic config/build boundary checks. No backend requests or real accounts.
async(page)=>{
 const fs=require('fs'),path=require('path'),os=require('os'),vm=require('vm'),{spawnSync}=require('child_process');
 const results=[],check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 const stage='https://uffvbfmfsesdhjzzjiyu.supabase.co',production='https://aefhjgmiwgajdhgyhelm.supabase.co',publicKey='sb_publishable_SYNTHETIC_QA_ONLY';
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ct-config-'));
 const build=(env,url,key)=>spawnSync(process.execPath,['scripts/build-vercel.js'],{cwd:process.cwd(),encoding:'utf8',env:{...process.env,VERCEL_ENV:env,CT_BUILD_OUTPUT:path.join(tmp,env),CLEAN_TIME_SUPABASE_URL:url||'',CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY:key||''}});
 const config=env=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(tmp,env,'assets/backend-config.js'),'utf8'),sandbox);return sandbox.window.CleanTimeBackend;};
 let run=build('production',stage,publicKey);
 check(run.status===0&&config('production').environment==='production'&&config('production').url===production,'Production build retains existing backend despite Preview variables');
 check(config('production').key==='sb_publishable_0R5rSCEhM5INCy-5zLwGsA_j51Ty39v','Production publishable key unchanged');
 for(const [url,key,label] of [[null,null,'missing pair'],[production,publicKey,'production URL'],['https://wrong.supabase.co',publicKey,'wrong staging project'],[stage,'sb_secret_SYNTHETIC','secret key'],[stage,'synthetic.jwt.key','legacy/invalid key']]){
  run=build('preview',url,key);check(run.status!==0,'Preview fails closed: '+label);
 }
 run=build('preview',stage,publicKey);check(run.status===0&&config('preview').environment==='preview'&&config('preview').url===stage&&config('preview').key===publicKey,'Preview build emits isolated public-only configuration');
 check(!run.stdout.includes(publicKey)&&!run.stderr.includes(publicKey),'Build does not log configuration values');
 check(fs.existsSync(path.join(tmp,'preview','assets/fonts/Assistant-Variable.ttf'))&&fs.existsSync(path.join(tmp,'preview','assets/sync-crypto.js')),'Static build includes existing local assets');
 const html=fs.readFileSync('index.html','utf8'),browser=page.context().browser();
 for(const [value,valid,label] of [[null,false,'missing asset'],[{environment:'local'},false,'source/local asset'],[{environment:'preview',url:production,key:publicKey},false,'production fallback'],[{environment:'preview',url:stage,key:'sb_secret_SYNTHETIC'},false,'secret-like key'],[{environment:'preview',url:stage,key:publicKey},true,'valid staging']]){
  const c=await browser.newContext();
  await c.addInitScript(()=>{window.qaCalls=[];window.supabase={createClient:(url,key)=>{window.qaCalls.push({url,key});return {auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}}),signInWithOtp:async()=>({})}};}};const append=Element.prototype.appendChild;Element.prototype.appendChild=function(e){if(e.tagName==='SCRIPT'&&e.src.includes('supabase-js')){setTimeout(()=>e.onload(),0);return e;}return append.call(this,e);};});
  await c.route('**/*',route=>{
   const u=new URL(route.request().url());if(u.hostname!=='clean-time-config-qa.vercel.app')return route.abort();
   if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
   if(u.pathname==='/assets/backend-config.js')return route.fulfill({contentType:'application/javascript',body:value?'window.CleanTimeBackend='+JSON.stringify(value):''});
   const file=path.join(process.cwd(),u.pathname.slice(1));return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''});
  });
  const p=await c.newPage();await p.goto('https://clean-time-config-qa.vercel.app');
  check(await p.locator('#welcome').isVisible(),'Guest remains usable: '+label);
  await p.locator('#onboardingLogin').click();await p.locator('#lEmail').fill('config-qa@example.invalid');await p.locator('#lSend').click();await p.waitForFunction(()=>!document.getElementById('lSend').disabled);
  const state=await p.evaluate(()=>({calls:window.qaCalls,local:localStorage.getItem('cleantime-he-v1')}));
  check(valid?state.calls.length===1&&state.calls[0].url===stage:state.calls.length===0,'Preview account target: '+label);
  check(state.local===null,'Config failures/sign-in leave local recovery untouched: '+label);await c.close();
 }
 fs.rmSync(tmp,{recursive:true,force:true});return {passed:results.length,results};
}
