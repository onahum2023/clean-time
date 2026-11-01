// Official full editions + compatibility across real app-language reloads.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8766',key='cleantime-he-v1',results=[];
 const content=require(process.cwd()+'/assets/inventory-content.js'),check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.fallback():r.abort());
 await page.addInitScript(key=>{if(localStorage.getItem(key))return;const d=new Date(),day=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');localStorage.setItem(key,JSON.stringify({date:'2025-01-01',linksV:2,updatedAt:123,inventory:{[day]:{questionnaireVersion:'na-ip9-he-2005-daily-v1',answers:{na_ip9_he_2005_q06:'synthetic alias answer',na_ip9_q17:'synthetic learning',future:'synthetic unknown'},summary:'synthetic old reflection',notes:'synthetic notes',finishedAt:456,created:1,updated:2,unknown:{keep:true}}}}));},key);
 await page.goto(origin);await page.locator('#counter [data-go=inventory]').click();
 const bytes=()=>page.evaluate(k=>localStorage.getItem(k),key),initial=await bytes();
 check(await page.locator('#iReopen').isVisible(),'Old finished record opens calm finished state');await page.locator('#iReopen').click();
 const change=async language=>{await page.locator('#languageSelector [data-language='+language+']').click();await page.waitForFunction(language=>document.documentElement.lang===language,language);await page.locator('#inventory').waitFor({state:'visible'});};
 const shot=async name=>{await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'/tmp/step10-'+name+'.png',fullPage:true});};
 for(const language of ['he','en','ru']){
  if(language!=='he')await change(language);
  // Language reload retains the closing screen reached in the preceding locale.
  if(language!=='he')for(let i=0;i<5;i++)await page.locator('#iPrevious').click();
  const seen=[];
  for(let section=0;section<5;section++){
   const [a,b]=content.sections[section],labels=await page.locator('#iQuestions label>span').allTextContents();
   check(JSON.stringify(labels)===JSON.stringify(content.editions[language].questions.slice(a-1,b)),'Every original question and order '+language+' section'+section);
   check(await page.locator('#iStatement').textContent()===content.editions[language].statements[section],'Complete original statement '+language+' section'+section);
   check(await page.getByRole('textbox',{name:content.editions[language].questions[a-1],exact:true}).count()===1,'Question has accessible label '+language+' section'+section);
   seen.push(...await page.locator('#iQuestions textarea').evaluateAll(nodes=>nodes.map(n=>n.id)));
   if(section===0)check(await page.locator('#iAnswer_na_ip9_q06').inputValue()==='synthetic alias answer','Alias accessible '+language);
   if(section===2)check(await page.locator('#iAnswer_na_ip9_q17').inputValue()==='synthetic learning','Six-question canonical answer preserved '+language);
   await page.setViewportSize({width:360,height:800});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile width '+language+' section'+section);
   if(language==='he'&&(section===0||section===2))await shot('section-'+(section+1)+'-he-360');
   await page.locator('#iNext').click();
  }
  check(seen.length===36&&new Set(seen).size===36,'All36 once '+language);
  check(await page.locator('#iPrayer').textContent()===content.editions[language].prayer&&await page.locator('#iNotes').inputValue()==='synthetic notes','Official prayer and preserved notes '+language);
  check(await page.locator('html').getAttribute('dir')===(language==='he'?'rtl':'ltr')&&await page.locator('#iPrayer').getAttribute('dir')===(language==='he'?'rtl':'ltr'),'Correct page/content direction '+language);
  check(await page.locator('#iSourceLink').getAttribute('href')===content.editions[language].url,'Correct official source '+language);
  check(await bytes()===initial,'Language/section review leaves all recovery bytes/status unchanged '+language);
  await shot('closing-'+language+'-360');
 }
 await page.locator('#iNotes').fill('synthetic notes just typed');const mid=await bytes();await change('he');
 check(await page.locator('#iNotes').inputValue()==='synthetic notes just typed'&&await bytes()===mid&&await page.locator('#iClosing').isVisible(),'Mid-notes language change preserves notes and active screen');
 await page.locator('#iFinish').click();await shot('finished-he-360');const finished=await bytes();await change('ru');
 check(await page.locator('#iReopen').isVisible()&&await bytes()===finished,'Finished state survives language reload');
 return {passed:results.length,results};
}
