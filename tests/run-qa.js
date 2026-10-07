// Run from the repository root; defaults to localhost. QA_BASE_URL may name the exact PR Preview.
const fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('playwright');
if(process.env.QA_BASE_URL){
 const url=new URL(process.env.QA_BASE_URL);
 if(url.origin!==process.env.QA_BASE_URL||url.username||url.password||url.protocol!=='https:'||!url.hostname.endsWith('.vercel.app'))throw new Error('QA_BASE_URL must be an exact HTTPS Vercel Preview origin');
}
(async()=>{
 const browser=await (process.env.QA_ENGINE==='webkit'?webkit:chromium).launch({headless:true});
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
