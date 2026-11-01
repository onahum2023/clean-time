// Real local downloads + browser print layout; no external services.
async(page)=>{
 const fs=require('fs'),{PDFDocument}=require('pdf-lib'),content=require(process.cwd()+'/assets/inventory-content.js');
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8766',key='cleantime-he-v1',results=[],requests=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.fallback():(requests.push(r.request().url()),r.abort()));
 await page.addInitScript(key=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({date:'2025-01-01',linksV:2}));},key);
 await page.goto(origin);await page.locator('#counter [data-go=inventory]').click();
 const mixed='synthetic <script>not executable</script> שלום English русский 123 @example.invalid';
 await page.locator('#iAnswer_na_ip9_q06').fill(mixed);
 for(let i=0;i<5;i++)await page.locator('#iNext').click();await page.locator('#iNotes').fill(('synthetic long note שלום English русский\n').repeat(80));await page.locator('#iFinish').click();
 const before=await page.evaluate(key=>localStorage.getItem(key),key);
 for(const language of ['he','en','ru']){
  if(language!=='he'){
   await page.locator('#languageSelector [data-language='+language+']').click();await page.waitForFunction(language=>document.documentElement.lang===language,language);await page.locator('#iReopen').waitFor({state:'visible'});
  }
  check((await page.locator('#iOutput').textContent()).length>0,'Readable-file privacy notice '+language);
  await page.evaluate(()=>{window.print=()=>{window.qaPrinted=true;};});await page.locator('#iPrint').click();
  const prompts=await page.locator('#inventoryPrint .inventory-print-question').allTextContents();
  check(JSON.stringify(prompts)===JSON.stringify(content.editions[language].questions),'Print contains all36 original questions in order '+language);
  check(JSON.stringify(await page.locator('#inventoryPrint .inventory-print-statement').allTextContents())===JSON.stringify(content.editions[language].statements),'Print contains all5 statements '+language);
  check(await page.locator('#inventoryPrint .inventory-print-prayer').textContent()===content.editions[language].prayer&&(await page.locator('#inventoryPrint').textContent()).includes(mixed)&&await page.locator('#inventoryPrint script, #inventoryPrint button').count()===0,'Prayer/answers are safely printed as text '+language);
  await page.emulateMedia({media:'print'});
  check(await page.locator('#inventoryPrint').isVisible()&&!await page.locator('.app').isVisible(),'Only inventory document is printable '+language);
  await page.pdf({path:'/tmp/step10-print-'+language+'.pdf',format:'A4',printBackground:false,preferCSSPageSize:true});await page.emulateMedia({media:'screen'});
  const downloaded=page.waitForEvent('download');await page.locator('#iPdf').click();const file=await downloaded;
  check(file.suggestedFilename().endsWith('.pdf'),'Advertised PDF download '+language);
  const path='/tmp/step10-download-'+language+'.pdf';await file.saveAs(path);const bytes=fs.readFileSync(path),pdf=await PDFDocument.load(bytes);
  check(bytes.subarray(0,8).toString().startsWith('%PDF-1.4')&&pdf.getPageCount()>=4,'Usable multipage PDF '+language);
  check(pdf.getPages().every(p=>Math.abs(p.getWidth()-595.28)<1&&Math.abs(p.getHeight()-841.89)<1),'All PDF pages are A4 '+language);
  check(await page.evaluate(key=>localStorage.getItem(key),key)===before,'Export never changes recovery answers/status '+language);
 }
 check(requests.length===0,'Print/PDF never send content to external services');
 return {passed:results.length,results};
}
