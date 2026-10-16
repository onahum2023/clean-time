async(page)=>{
 const http=require('http'),fs=require('fs'),path=require('path'),results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const root=process.cwd(),headers=JSON.parse(fs.readFileSync('vercel.json')).headers[0].headers;
 const server=http.createServer((req,res)=>{
  for(const {key,value} of headers)res.setHeader(key,value);
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file===root||fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ttf':'font/ttf','.wav':'audio/wav','.webmanifest':'application/manifest+json'}[path.extname(file)]||'application/octet-stream';
  res.setHeader('Content-Type',type);res.end(fs.readFileSync(file));
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port,context=await page.context().browser().newContext({viewport:{width:360,height:800}});
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 try{
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.qaViolations=[];document.addEventListener('securitypolicyviolation',e=>qaViolations.push(e.violatedDirective));});
  const response=await p.goto(origin);for(const header of headers)check(response.headers()[header.key.toLowerCase()]===header.value,'HTTP header '+header.key);
  await p.locator('#welcomeStart').click();await p.locator('#oDate').fill('2025-01-01');await p.locator('#oFrom').selectOption('סמים');await p.locator('#guestForm button').click();
  check(await p.locator('#counter').isVisible(),'Hashed static app boots and guest onboarding works');
  await p.locator('#counter [data-go=journal]').click();await p.locator('#jNew').click();await p.locator('#jText').fill('סינתטי');await p.locator('#jDone').click();await p.locator('#jEditor').waitFor({state:'hidden'});
  check(await p.evaluate(()=>JSON.parse(localStorage.getItem('cleantime-he-v1')).journal[0].text==='סינתטי'),'CSP permits local tool persistence');
  await p.waitForTimeout(100);check(!errors.length&&(await p.evaluate(()=>qaViolations)).length===0,'No unexpected JavaScript/CSP errors in guest flow');
  await p.evaluate(()=>{const script=document.createElement('script');script.textContent='window.qaUnexpectedInline=true';document.body.append(script);});
  check(await p.evaluate(()=>!window.qaUnexpectedInline),'Unhashed inline script is blocked');
  await p.goto(origin+'/about/');check(await p.locator('h1').isVisible(),'Public About renders with configured headers');
 }finally{await context.close();await new Promise(resolve=>server.close(resolve));}
 return {passed:results.length,results};
}
