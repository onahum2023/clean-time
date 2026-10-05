// Localhost-only bookmark CRUD/safety/persistence tests; isolated synthetic state.
async(page)=>{
 const origin='http://127.0.0.1:8765',key='cleantime-he-v1',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const context=await page.context().browser().newContext({viewport:{width:360,height:844}});
 const requests=[];
 await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
 await context.addInitScript(()=>window.confirm=()=>true);
 const p=await context.newPage();p.on('request',r=>requests.push(r.url()));
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(origin);
 const seed=async data=>{await p.evaluate(({key,data})=>{localStorage.clear();localStorage.setItem(key,JSON.stringify(data));},{key,data});await p.reload();};
 const go=async()=>{await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="bookmarks"]').click();};
 const read=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const fill=async(title,url,note='')=>{await p.locator('#bTitle').fill(title);await p.locator('#bUrl').fill(url);await p.locator('#bNote').fill(note);};
 const submit=()=>p.locator('#bForm button[type="submit"]').click();
 await seed({date:'2025-01-01',linksV:2,links:[{id:9,title:'משאב קיים',url:'https://example.invalid/resource'}],extra:'retain'});await go();
 check(await p.locator('#bList .empty').isVisible(),'Older state defaults to an empty private list');
 await p.locator('#bNew').click();await fill('   ','https://example.invalid');await submit();
 check((await read()).bookmarks===undefined&&await p.locator('#bForm').isVisible(),'Whitespace title is rejected without persisting');
 await p.locator('#bCancel').click();await p.locator('#bNew').click();
 await fill(' אתר אישי ',' HTTPS://example.invalid/path?x=1 ',' הערה\nאישית ');await submit();
 const first=(await read()).bookmarks[0];
 check(first.title==='אתר אישי'&&first.url==='https://example.invalid/path?x=1'&&first.note==='הערה\nאישית','Add trims fields and normalizes a safe HTTPS URL');
 check((await read()).links[0].id===9&&(await read()).extra==='retain','Adding bookmarks preserves resources and unknown saved fields');
 await p.reload();await go();check(await p.locator('#bList .bookmark-note').innerText()==='הערה\nאישית','Guest bookmark and note survive reload');
 const anchor=p.locator('#bList a').first();
 check(await anchor.getAttribute('target')==='_blank'&&(await anchor.getAttribute('rel')).includes('noopener')&&(await anchor.getAttribute('rel')).includes('noreferrer'),'HTTPS opening uses a new tab and safe relationship attributes');
 await context.route('https://example.invalid/**',r=>r.fulfill({contentType:'text/html',body:'<p>Local QA destination</p>'}));
 const popupPromise=p.waitForEvent('popup');await anchor.click();const popup=await popupPromise;await popup.waitForLoadState();
 check(popup.url()==='https://example.invalid/path?x=1'&&await popup.evaluate(()=>window.opener===null),'Open reaches the mocked destination without an opener');await popup.close();
 await p.locator('#bList button').filter({hasText:'עריכה'}).first().click();await fill('ערוך','https://example.invalid/edited','');await submit();
 check((await read()).bookmarks[0].id===first.id&&(await read()).bookmarks[0].note===''&&(await read()).bookmarks[0].title==='ערוך','Editing keeps identity and can clear the optional note');
 await p.locator('#bList button').filter({hasText:'עריכה'}).first().click();await fill('לא לשמור','https://example.invalid/cancel','טיוטה');await p.locator('#bCancel').click();
 check((await read()).bookmarks[0].title==='ערוך','Cancel leaves the saved bookmark intact');
 await p.locator('#bNew').click();
 for(const url of ['javascript:alert(1)','data:text/html,<script>alert(1)</script>','http://example.invalid','//example.invalid','https:example.invalid','https://','https://user:pass@example.invalid','https://example.invalid\\evil','https://exa mple.invalid','tel:','tel:abc','mailto:qa@example.invalid','file:///tmp/test']){
  await fill('בדיקה',url);await submit();check((await read()).bookmarks.length===1&&await p.locator('#bForm').isVisible(),'Unsafe/malformed URL rejected: '+url.replace(/\n/g,'[newline]'));
 }
 await fill('טלפון','tel:+972-3-1234567');await submit();
 check((await read()).bookmarks.length===2&&await p.locator('#bList a').last().getAttribute('href')==='tel:+972-3-1234567'&&await p.locator('#bList a').last().getAttribute('target')===null,'Telephone bookmark is valid and has no new-tab target');
 await p.locator('#bNew').click();await fill('<img src=x onerror=alert(1)>','https://example.invalid/'+ 'a'.repeat(800),'<script>alert(1)</script>\n'+'מ'.repeat(500));await submit();
 check(await p.locator('#bList img,#bList script').count()===0,'Titles and notes render as literal text');
 for(const theme of ['light','dark']){await p.emulateMedia({colorScheme:theme});for(const width of [320,360,390,1280]){
  await p.setViewportSize({width,height:844});await p.locator('#bNew').click();
  check(await p.locator('#bookmarks').evaluate(el=>getComputedStyle(el).direction==='rtl'&&document.documentElement.scrollWidth<=innerWidth),'RTL list and form without overflow: '+width+'px '+theme);
  await p.locator('#bCancel').click();
 }}
 await p.locator('#bList button').filter({hasText:'מחיקה'}).last().click();
 check((await read()).bookmarks.length===2,'Delete removes only the selected bookmark');
 await p.reload();await go();check((await read()).bookmarks.length===2,'Deletion survives reload');
 await p.locator('#bNew').click();await fill('כשל אחסון','https://example.invalid/fail');
 await p.evaluate(k=>{window.qaSet=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===k)throw Error('Quota');return window.qaSet.call(this,name,value);};},key);await submit();
 check(await p.locator('#storageMsg').isVisible()&&await p.locator('#bForm').isVisible()&&(await read()).bookmarks.length===2,'Failed save retains draft and persisted list with a visible error');
 await p.evaluate(()=>Storage.prototype.setItem=window.qaSet);await submit();
 check((await read()).bookmarks.length===3,'Retry after storage recovery adds exactly one bookmark');
 await seed({date:'2025-01-01',linksV:2,links:[{id:1,title:'unsafe resource',url:'javascript:alert(1)'}],bookmarks:[{id:'unsafe',title:'unsafe',url:'javascript:alert(1)',note:'preserve'},{id:'safe',title:'safe',url:'https://example.invalid'}]});await go();
 check(await p.locator('#bList a').count()===1&&await p.locator('#bList .blocked-link').count()===1&&(await read()).bookmarks[0].note==='preserve','Unsafe stored/imported bookmark is retained but cannot open');
 await p.locator('[data-tab="tools"]').click();await p.locator('#tools [data-go="readings"]').click();
 check(await p.locator('#lList a').count()===0,'Unsafe stored resource link cannot open either');
 await p.locator('#editLinks').click();await p.locator('#lList input').last().fill('javascript:alert(2)');
 check((await read()).links[0].url==='javascript:alert(1)','Unsafe resource URL edits are not persisted');
 await p.locator('#lList input').last().fill('tel:033747474');await p.locator('#editLinks').click();
 check(await p.locator('#lList a').getAttribute('href')==='tel:033747474','Resources share safe telephone validation');
 await seed({date:'2025-01-01',bookmarks:{bad:true}});
 check(await p.locator('#storageMsg').isVisible()&&(await read()).bookmarks.bad===true,'Malformed bookmark collection is preserved with an error');
 check(errors.length===0,'No JavaScript errors');
 check(requests.every(url=>url.startsWith(origin)),'Bookmark guest flow makes only local requests (mock destination fulfilled locally)');
 await context.close();return {passed:results.length,results};
}
