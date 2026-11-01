// Official-edition display + draft-ID compatibility, using synthetic data only.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.fallback():r.abort());
 await page.addInitScript(key=>{
  if(localStorage.getItem(key))return;
  const d=new Date(),day=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  localStorage.setItem(key,JSON.stringify({date:'2025-01-01',linksV:2,updatedAt:123,inventory:{[day]:{
   questionnaireVersion:'na-ip9-he-2005-daily-v1',dailyQuestionnaireVersion:'na-ip9-he-2005-daily-v1',
   answers:{na_ip9_he_2005_q06:'synthetic Hebrew-draft answer',na_ip9_he_2005_q36:'synthetic old closing answer',future:'synthetic unknown answer'},
   summary:'synthetic multilingual summary',finishedAt:456,created:1,updated:2,unknown:{keep:true}
  }}}));
 },key);
 await page.goto(origin);
 const enter=async()=>{if(!await page.locator('#inventory').isVisible())await page.locator('#counter [data-go=inventory]').click();};
 const bytes=()=>page.evaluate(key=>localStorage.getItem(key),key);
 await enter();
 const day=await page.locator('#iDay').inputValue(),initial=await bytes();
 const ids=[6,10,17,25,31,36].map(n=>'iAnswer_na_ip9_q'+String(n).padStart(2,'0'));
 const anchors={he:['האם הייתי טוב אל עצמי היום? איך?','האם זכרתי באופן מודע שיש לי בחירה היום?'],en:['Was I good to myself today? How?','Did I consciously remember that I have a choice today?'],ru:['Был ли я сегодня добр к себе? Как именно?','Помнил ли я осознанно о том, что у меня сегодня есть выбор?']};
 const change=async lang=>{
  await page.locator('#languageSelector [data-language='+lang+']').click();
  await page.waitForFunction(lang=>document.documentElement.lang===lang,lang);await enter();
 };
 await page.locator('#iAll').click();
 for(const language of ['he','en','ru','he']){
  if(await page.locator('html').getAttribute('lang')!==language)await change(language);
  const labels=await page.locator('#iQuestions label > span').allTextContents();
  check(labels.length===6&&labels[0]===anchors[language][0]&&labels[5]===anchors[language][1],'Official first/closing prompts render '+language);
  check(JSON.stringify(await page.locator('#iQuestions textarea').evaluateAll(nodes=>nodes.map(n=>n.id)))===JSON.stringify(ids),'Shared six IDs/order '+language);
  check(await page.locator('#'+ids[0]).inputValue()==='synthetic Hebrew-draft answer'&&await page.locator('#'+ids[5]).inputValue()==='synthetic old closing answer','Earlier draft answers remain accessible '+language);
  check(await page.locator('#iReopen').isVisible()&&await page.locator('#iSummary').inputValue()==='synthetic multilingual summary','Finish/summary remain intact '+language);
  check(await bytes()===initial,'Language/display never rewrites recovery bytes '+language);
  check(await page.locator('#iQuestions').getAttribute('lang')===language&&await page.locator('#iQuestions').getAttribute('dir')===(language==='he'?'rtl':'ltr')&&await page.locator('html').getAttribute('dir')===(language==='he'?'rtl':'ltr'),'Question and app direction '+language);
  const url=await page.locator('#iSourceLink').getAttribute('href');check(url.includes(language==='he'?'he3109':language==='en'?'living-the-program':'%D0%B6'),'Source follows official edition '+language);
  await page.setViewportSize({width:360,height:800});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile layout '+language);
  check((await page.locator('#iLegacyAnswers').textContent()).trim()==='synthetic unknown answer','Aliases excluded from unrelated legacy answers '+language);
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'/tmp/clean-time-inventory-'+language+'-360.png',fullPage:true});
 }
 await page.locator('#iFocused').click();await page.locator('#iReopen').click();
 await page.locator('#'+ids[0]).fill('synthetic canonical answer');
 let entry=JSON.parse(await bytes()).inventory[day];
 check(entry.answers.na_ip9_q06==='synthetic canonical answer'&&entry.answers.na_ip9_he_2005_q06==='synthetic Hebrew-draft answer'&&entry.unknown.keep&&entry.questionnaireVersion==='na-ip9-he-2005-daily-v1'&&entry.dailyQuestionnaireVersion==='na-ip9-daily-v1','Editing writes canonical ID without discarding original data');
 await change('en');
 check(await page.locator('#'+ids[0]).inputValue()==='synthetic canonical answer','Canonical value takes precedence over old alias after language switch');
 await page.locator('#'+ids[0]).fill('');await change('ru');
 check(await page.locator('#'+ids[0]).inputValue()==='','Intentionally cleared canonical answer never resurrects old alias');
 await page.locator('#'+ids[0]).fill('synthetic mid-answer language switch');const mid=await bytes();await change('he');
 check(await page.locator('#'+ids[0]).inputValue()==='synthetic mid-answer language switch'&&await bytes()===mid,'Switch immediately after typing preserves current answer');
 await page.locator('#iFinish').click();const finished=await bytes();
 for(const lang of ['en','ru','he']){await change(lang);check(await page.locator('#iReopen').isVisible()&&await bytes()===finished,'Canonical completion survives '+lang);}
 return {passed:results.length,results};
}
