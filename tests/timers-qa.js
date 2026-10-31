async(page)=>{
 const {normalize}=require(process.cwd()+'/assets/recovery-timers.js'),results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const fixture={linksV:2,links:[],date:'2024-02-29',time:'12:30',from:'סמים',updatedAt:1,journal:[{id:1,text:'סינתטי',created:1,extra:'keep'}],gratitude:[{id:2,text:'תודה',ts:2}],plans:{'2024-01-01':[{id:3,text:'תכנית',done:true}]},inventory:{old:{answers:{old:'keep'}}},bookmarks:[{id:4,title:'סינתטי',url:'https://example.invalid'}],future:{keep:true}};
 const migrated=normalize(fixture);
 check(migrated.timers[0].id==='legacy-primary'&&migrated.primaryTimerId==='legacy-primary','Legacy timer has stable primary ID');
 check(JSON.stringify(normalize(migrated))===JSON.stringify(migrated),'Migration is idempotent');
 check(['journal','gratitude','plans','inventory','bookmarks','future','updatedAt'].every(k=>JSON.stringify(fixture[k])===JSON.stringify(migrated[k])),'Migration preserves histories, unknown fields and timestamp');
 const second={id:'second',date:'2025-01-01',time:'',category:'alcohol',label:'סינתטי נוסף',unknown:'keep'};
 const multi=normalize({...migrated,timers:[...migrated.timers,second]});
 const older=normalize({...multi,date:'2024-03-01',from:'עישון'});
 check(older.timers[0].date==='2024-03-01'&&older.timers[0].category==='smoking'&&JSON.stringify(older.timers[1])===JSON.stringify(second),'Older client scalar edit updates only primary and retains secondary fields');
 const oldSource=require('child_process').execFileSync('git',['show','fb2d244835ea8adf652dfcffe393943371666347:index.html'],{encoding:'utf8'}),sandbox={};
 require('vm').createContext(sandbox);
 require('vm').runInContext(oldSource.slice(oldSource.indexOf('const DEFAULT='),oldSource.indexOf('function load(){')).replace('let S=load();','')+';this.oldNormalize=normalize;',sandbox);
 sandbox.S=sandbox.oldNormalize(multi);sandbox.S.date='2024-03-02';sandbox.LOCAL_ONLY=['mode'];
 require('vm').runInContext(oldSource.slice(oldSource.indexOf('function syncedState(){'),oldSource.indexOf('async function readRow('))+';this.oldSnapshot=syncedState();',sandbox);
 const oldRoundTrip=normalize(JSON.parse(JSON.stringify(sandbox.oldSnapshot)));
 check(oldRoundTrip.timers[0].date==='2024-03-02'&&JSON.stringify(oldRoundTrip.timers[1])===JSON.stringify(second),'Actual main legacy normalizer and sync serializer retain secondary timers on edit');
 for(const malformed of [{...fixture,timersVersion:2},{...fixture,timersVersion:1},{...multi,timersVersion:2},{...multi,primaryTimerId:'missing'},{...multi,timers:[second,second]},{...multi,timers:[{...second,date:'2025-02-30'}]},{...multi,timers:{}}]){
  let rejected=false;try{normalize(malformed);}catch(e){rejected=true;}check(rejected,'Malformed timer schema fails closed');
 }
 check(normalize({...normalize({date:''}),date:'2025-01-01',from:'אחר'}).timers.length===1,'Onboarding after empty-state migration creates primary');
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',key='cleantime-he-v1';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.goto(origin);await page.evaluate(({key,fixture})=>localStorage.setItem(key,JSON.stringify(fixture)),{key,fixture});await page.reload();
 const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 check(await page.locator('#counter').isVisible()&&!(await read()).timers,'Existing guest opens without rewriting untouched legacy bytes');
 await page.locator('#openSettings').click();await page.locator('#addTimer').click();await page.locator('#tCategory').selectOption('alcohol');await page.locator('#tLabel').fill('סינתטי נוסף');await page.locator('#tDate').fill('2025-01-01');await page.locator('#timerForm button[type=submit]').click();
 let state=await read();check(state.timers.length===2&&state.date===fixture.date,'Adding a timer preserves primary date');
 const added=state.timers[1].id;await page.reload();await page.locator('#openSettings').click();await page.locator('#settings [data-go=counterDetails]').click();await page.locator('#showHomeTimers').check();await page.locator('[data-display=compact]').click();check((await page.locator('#homeTimerCards').innerText()).includes('סינתטי נוסף'),'Secondary counter survives reload and remains available in details');
 await page.locator('#openSettings').click();let row=page.locator('#timerList li').filter({hasText:'סינתטי נוסף'});await row.getByRole('button',{name:'עריכה',exact:true}).click();await page.locator('#tDate').fill('2025-02-01');await page.locator('#timerForm button[type=submit]').click();await page.locator('#askB').getByRole('button',{name:'עדכון התאריך',exact:true}).click();
 state=await read();check(state.timers[1].date==='2025-02-01'&&state.timers[0].date===fixture.date,'Editing/reset affects only selected timer');
 await row.getByRole('button',{name:'הגדרה כראשי',exact:true}).click();state=await read();check(state.primaryTimerId===added&&state.date==='2025-02-01'&&state.from==='סינתטי נוסף','Primary switch updates compatibility scalars');
 row=page.locator('#timerList li').filter({hasText:'סינתטי נוסף'});await row.getByRole('button',{name:'הסרה',exact:true}).click();await page.locator('#askB').getByRole('button',{name:'ביטול',exact:true}).click();check((await read()).timers.length===2,'Removal requires confirmation');
 await row.getByRole('button',{name:'הסרה',exact:true}).click();await page.locator('#askB').getByRole('button',{name:'הסרת המסלול',exact:true}).click();state=await read();check(state.timers.length===1&&state.primaryTimerId==='legacy-primary'&&state.date===fixture.date,'Removing primary safely selects remaining timer');
 check(['journal','gratitude','plans','inventory','bookmarks','future'].every(k=>JSON.stringify(state[k])===JSON.stringify(fixture[k])),'All shared histories survive add/edit/primary/remove');
 await page.setViewportSize({width:360,height:800});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'RTL timer settings fit 360px');
 await page.locator('#addTimer').click();await page.locator('#tCategory').selectOption('drugs');await page.locator('#tLabel').fill('שם אישי');await page.locator('#tDate').fill('2025-01-01');await page.locator('#timerForm button[type=submit]').click();check((await read()).timers.length===2,'Same recovery category allows a distinct custom label');
 check(await page.evaluate(async fixture=>{
  const made=await SyncCrypto.create('synthetic-timers'),time=new Date().toISOString();
  const old=await SyncCrypto.encrypt({...fixture,updatedAt:Date.parse(time)},made.key,made.material,'synthetic-timers',time);
  const opened=await SyncCrypto.unlock(old,made.recovery,'synthetic-timers',time);
  const state=CleanTimeTimers.normalize(await SyncCrypto.decrypt(old,opened.key,'synthetic-timers',time));
  const newer=await SyncCrypto.encrypt(state,opened.key,opened.material,'synthetic-timers',time);
  return state.timers.length===1&&JSON.stringify(await SyncCrypto.decrypt(newer,opened.key,'synthetic-timers',time))===JSON.stringify(state)&&JSON.stringify(state.journal)===JSON.stringify(fixture.journal);
 },fixture),'Legacy v1 encrypted backup migrates and re-encrypts with unchanged wrapper');
 const before=await read();await page.locator('#addTimer').click();await page.locator('#tCategory').selectOption('alcohol');await page.locator('#tDate').fill('2025-03-01');
 await page.evaluate(()=>Storage.prototype.setItem=function(){throw Error('synthetic storage full');});await page.locator('#timerForm button[type=submit]').click();check(JSON.stringify(await read())===JSON.stringify(before),'Failed timer persistence leaves saved data unchanged');
 return {passed:results.length,results};
}
