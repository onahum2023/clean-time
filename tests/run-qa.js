// Run from the repository root; defaults to localhost. QA_BASE_URL may name an isolated loopback server or exact PR Preview.
const fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
if(process.env.QA_BASE_URL){
 const url=new URL(process.env.QA_BASE_URL);
 const local=url.protocol==='http:'&&url.hostname==='127.0.0.1';
 const preview=url.protocol==='https:'&&url.hostname.endsWith('.vercel.app');
 if(url.origin!==process.env.QA_BASE_URL||url.username||url.password||(!local&&!preview))throw new Error('QA_BASE_URL must be an exact loopback HTTP or HTTPS Vercel Preview origin');
}
(async()=>{
 const browser=await (process.env.QA_ENGINE==='webkit'?webkit:chromium).launch({headless:true,...(process.env.QA_CHROMIUM_EXECUTABLE&&process.env.QA_ENGINE!=='webkit'?{executablePath:process.env.QA_CHROMIUM_EXECUTABLE}:{}),...(process.env.QA_NO_SANDBOX==='1'?{args:['--no-sandbox']}: {})});
 require('./preview-access.js').attachPreviewAccess(browser);
 // Explicit local-emulator configuration for synthetic SDK mocks. Source/local
 // builds without this config stay offline and never default to production.
 const newContext=browser.newContext.bind(browser);
 browser.newContext=async options=>{
  const context=await newContext(options);
  await context.route('**/assets/backend-config.js',route=>{
   const url=new URL(route.request().url());
   return url.hostname==='127.0.0.1'?route.fulfill({contentType:'application/javascript',body:'window.CleanTimeBackend={environment:"local",url:"http://127.0.0.1:54321",key:"sb_publishable_SYNTHETIC_QA_ONLY"};'}):route.fallback();
  });
  return context;
 };
 let total=0,failed=0;
 try{
  const suites=process.argv.slice(2).length?process.argv.slice(2):fs.readdirSync('tests').filter(f=>f.endsWith('-qa.js')&&f!=='run-qa.js').sort();
  for(const file of suites){
   const context=await browser.newContext(),page=await context.newPage();
   try{const suite=eval(fs.readFileSync(path.join('tests',file),'utf8'));const result=await suite(page);total+=result.passed;console.log(file+': '+result.passed+' passed');}
   catch(e){failed++;console.error(file+': FAILED '+e.stack);}
   finally{await context.close();}
  }
  console.log(JSON.stringify({passed:total,failedSuites:failed}));
 }finally{await browser.close();}
 process.exitCode=failed?1:0;
})();
