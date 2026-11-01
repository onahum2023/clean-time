// Read-only, same-origin static Preview transport. Authentication stays inside the CLI.
const fs=require('node:fs'),cp=require('node:child_process');
const {chromium}=require('playwright'),origin=process.env.QA_BASE_URL;
if(!origin||new URL(origin).origin!==origin||!origin.endsWith('.vercel.app'))throw Error('Exact Preview origin required');
const team=process.env.QA_VERCEL_TEAM||JSON.parse(fs.readFileSync('.vercel/project.json')).orgId;
const allowed=new Set(['/',...JSON.parse(fs.readFileSync('scripts/public-files.json')).flatMap(p=>['/'+p,...(p.endsWith('/index.html')?['/'+p.slice(0,-10)]:[])])]),cache=new Map();
const fetchAsset=path=>{
 if(!allowed.has(path))throw Error('Unlisted Preview asset');
 if(!cache.has(path))cache.set(path,new Promise((resolve,reject)=>{
  const child=cp.spawn('vercel',['curl',origin+path,'--silent','--show-error','--fail','--include','--scope',team],{stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_OPTIONS:''}}),chunks=[];
  child.stdout.on('data',d=>chunks.push(d));child.stderr.resume();child.on('error',()=>reject(Error('CLI transport failed')));
  child.on('close',code=>{
   if(code)return reject(Error('CLI asset request failed: '+path));
   const raw=Buffer.concat(chunks),boundary=raw.indexOf('\r\n\r\n');
   if(boundary<0)return reject(Error('Missing HTTP response headers'));
   const lines=raw.subarray(0,boundary).toString().split('\r\n'),status=Number(lines.shift().split(' ')[1]),headers={};
   for(const line of lines){const at=line.indexOf(':');if(at>0)headers[line.slice(0,at).toLowerCase()]=line.slice(at+1).trim();}
   if(status!==200)return reject(Error('Preview response is not 200: '+path));
   delete headers['content-length'];delete headers['transfer-encoding'];delete headers['content-encoding'];
   resolve({status,headers,body:raw.subarray(boundary+4)});
  });
 }));return cache.get(path);
};
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch(options),create=browser.newContext.bind(browser);
 browser.newContext=async options=>{
  const context=await create(options);
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin!==origin||route.request().method()!=='GET'||url.search||!allowed.has(url.pathname))return route.abort();
   const response=await fetchAsset(url.pathname);return route.fulfill(response);
  });return context;
 };return browser;
};
