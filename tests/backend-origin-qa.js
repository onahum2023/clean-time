async(page)=>{
 const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process'),results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const html=fs.readFileSync('index.html','utf8'),production={environment:'production',url:html.match(/const PRODUCTION_SUPA_URL='([^']+)'/)[1],key:html.match(/const PRODUCTION_SUPA_KEY='([^']+)'/)[1]};
 const preview={environment:'preview',url:null,key:null,backupDisabled:true};
 const local={environment:'local',url:'http://127.0.0.1:54321',key:'sb_publishable_SYNTHETIC_QA_ONLY'};
 for(const [origin,config,allowed] of [
  ['http://127.0.0.1:8765',preview,false],['https://custom.example.invalid',preview,false],['https://clean-time.app',preview,false],
  ['https://custom.example.invalid',production,false],['https://clean-time.app',null,false],['http://127.0.0.1:8765',{environment:'local'},false],
  ['https://clean-time.app',{...production,backupDisabled:true},false],['https://clean-time.app',{...production,environment:'unknown'},false],
  ['https://clean-time.app',production,true],['http://127.0.0.1:8765',local,true]
 ])for(const callback of [false,true]){
  const context=await page.context().browser().newContext();
  try{
   await context.addInitScript(()=>{
    localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',journal:[{id:1,text:'סינתטי',created:1}],updatedAt:1}));
    localStorage.setItem('cleantime-he-sync',JSON.stringify({uid:'synthetic'}));window.qaBackendCalls=0;
    window.supabase={createClient:()=>{window.qaBackendCalls++;return {auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}})}};}};
    const append=Element.prototype.appendChild;Element.prototype.appendChild=function(el){if(el.tagName==='SCRIPT'&&el.src.includes('supabase-js')){setTimeout(()=>el.onload(),0);return el;}return append.call(this,el);};
   });
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();
    if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    if(url.pathname==='/assets/backend-config.js')return route.fulfill({contentType:'application/javascript',body:'window.CleanTimeBackend='+JSON.stringify(config)});
    const file=path.join(process.cwd(),url.pathname.slice(1));return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.fulfill({status:404,body:''});
   });
   const p=await context.newPage();await p.goto(origin+(callback?'/#access_token=synthetic':''));await p.waitForTimeout(100);
   check(await p.evaluate(()=>window.qaBackendCalls)===(allowed?1:0),'Configuration boundary '+origin+'/'+config?.environment+'/callback='+callback);
   check(await p.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')).journal[0].text==='סינתטי'),'Local fixture preserved');
  }finally{await context.close();}
 }
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ct-default-build-'));
 try{
  for(const mode of [undefined,'unknown']){
   const env={...process.env,CT_BUILD_OUTPUT:tmp};if(mode===undefined)delete env.VERCEL_ENV;else env.VERCEL_ENV=mode;
   const run=spawnSync(process.execPath,['scripts/build-vercel.js'],{env,encoding:'utf8'});
   check(mode===undefined?run.status===0&&fs.readFileSync(path.join(tmp,'assets/backend-config.js'),'utf8').includes('"backupDisabled":true'):run.status!==0,'Missing/unknown build environment never selects production');
  }
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 return {passed:results.length,results};
}
