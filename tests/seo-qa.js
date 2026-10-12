// Raw HTTP + JS-disabled public navigation. Synthetic storage only, no backend traffic.
async(page)=>{
 const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',canonical='https://www.clean-time.app',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const headers=process.env.QA_BASE_URL&&process.env.VERCEL_OIDC_TOKEN?{'x-vercel-trusted-oidc-idp-token':process.env.VERCEL_OIDC_TOKEN}:{};
 const get=async route=>{const r=await page.context().request.get(origin+route,{headers});check(r.status()===200,'Raw HTTP 200 '+route);return r.text();};
 const html=await get('/'),robots=await get('/robots.txt'),sitemap=await get('/sitemap.xml');
 check(html.includes('<title>זמן נקי | אפליקציה חינמית בעברית למעקב וכלים להחלמה</title>'),'Exact title in raw HTML');
 const description=html.match(/<meta name="description" content="([^"]+)"/)[1];
 check(description.includes('חינמית בעברית')&&description.includes('בהחלמה מהתמכרות')&&description.includes('בלי הרשמה'),'Accurate public identity in raw description');
 check(html.includes('<link rel="canonical" href="'+canonical+'/">'),'Self-canonical uses verified production origin');
 for(const key of ['type','locale','site_name','title','description','url','image','image:alt'])check(html.includes('property="og:'+key+'"'),'Raw OG '+key);
 check(html.includes('name="twitter:card" content="summary"'),'Basic social card matches square existing icon');
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1])['@graph'];
 check(graph.length===2&&graph[0]['@type']==='WebSite'&&graph[1]['@type']==='WebApplication','Modest valid JSON-LD types');
 check(graph[1].isAccessibleForFree===true&&graph[1].offers.price==='0'&&!JSON.stringify(graph).match(/aggregateRating|review|MedicalApplication|user_id|journal|backup|export/i),'Schema has no invented ratings, treatment or private data');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 check(JSON.stringify(urls)===JSON.stringify([canonical+'/',canonical+'/about/',canonical+'/privacy/']),'Sitemap contains exactly the three public canonical URLs');
 check(robots.includes('Sitemap: '+canonical+'/sitemap.xml'),'Robots advertises canonical sitemap');
 // Longest matching rule, with Allow winning ties (Google robots specification).
 const rules=robots.split('\n').map(l=>l.match(/^(Allow|Disallow):\s*(.+)$/)).filter(Boolean).map(([,kind,value])=>({kind,value,re:new RegExp('^'+value.split('*').map(x=>x.replace(/[.+?^{}()|[\]\\]/g,'\\$&')).join('.*'))}));
 const allowed=url=>{const matches=rules.filter(r=>r.re.test(url)).sort((a,b)=>b.value.replace(/[*$]/g,'').length-a.value.replace(/[*$]/g,'').length||(a.kind==='Allow'?-1:1));return !matches.length||matches[0].kind==='Allow';};
 for(const url of ['/','/about/','/privacy/','/assets/public.css','/icon-512.png','/sitemap.xml'])check(allowed(url),'Robots permits public/resource '+url);
 for(const url of ['/?code=synthetic','/?error=synthetic','/account','/journal','/history','/backup','/export','/settings','/auth','/about/?code=synthetic'])check(!allowed(url),'Robots excludes private/callback '+url);
 const browser=page.context().browser();
 for(const width of [320,390,1280])for(const colorScheme of ['light','dark']){
  const c=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:800},colorScheme});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
  const p=await c.newPage();await p.goto(origin);
  check(await p.locator('#publicIntroduction').isVisible(),'Initial intro visible without JS '+width+' '+colorScheme);
  const intro=await p.locator('#publicIntroduction').innerText();
  check(intro.includes('חינמית בעברית')&&intro.includes('בהחלמה מהתמכרות')&&intro.includes('בלי הרשמה')&&intro.includes('אינה מוצר טיפולי')&&intro.includes('אינה קשורה לאנ-איי'),'Visible public purpose/free/guest/independence '+width+' '+colorScheme);
  for(const slug of ['about','privacy']){
   await p.locator('#publicIntroduction a[href="/'+slug+'/"]').click();
   check(new URL(p.url()).pathname==='/'+slug+'/'&&await p.locator('main h1').isVisible(),'Public '+slug+' link works without JS '+width+' '+colorScheme);
   check(await p.locator('main script,main input,main textarea,main form').count()===0,'Static '+slug+' content has no app/account/data controls');
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.documentElement).direction==='rtl'),'Public '+slug+' RTL fit '+width+' '+colorScheme);
   await p.locator('a[href="/"]').click();
  }
  await c.close();
 }
 for(const slug of ['about','privacy']){
  const body=await get('/'+slug+'/');check(body.includes('href="'+canonical+'/'+slug+'/"')&&body.includes('property="og:url" content="'+canonical+'/'+slug+'/"'),'Public '+slug+' self-canonical/OG in raw HTML');
 }
 const c=await browser.newContext();await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await c.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',linksV:2,links:[],journal:[{id:1,text:'SYNTHETIC_PRIVATE_SENTINEL',created:1}],updatedAt:1}));});
 const p=await c.newPage();await p.goto(origin);await p.locator('#counter').waitFor();
 check(!await p.locator('#publicIntroduction').isVisible(),'Existing guest enters app without public-intro duplication');
 const before=await p.evaluate(()=>localStorage.getItem('cleantime-he-v1'));
 for(const slug of ['about','privacy']){await p.goto(origin+'/'+slug+'/');check(!(await p.locator('body').innerText()).includes('SYNTHETIC_PRIVATE_SENTINEL'),'Public '+slug+' never reads existing private state');}
 await p.goto(origin);await p.locator('#counter').waitFor();check(await p.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===before,'Public-page visit and return preserve recovery bytes');await c.close();
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ct-seo-build-'));
 try{
  const run=spawnSync(process.execPath,['scripts/build-vercel.js'],{encoding:'utf8',env:{...process.env,VERCEL_ENV:'preview',CT_BUILD_OUTPUT:tmp,CLEAN_TIME_SUPABASE_URL:'https://uffvbfmfsesdhjzzjiyu.supabase.co',CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_SYNTHETIC_QA_ONLY'}});
  check(run.status===0,'Preview build completes with synthetic staging config');
  for(const file of ['index.html','robots.txt','sitemap.xml','about/index.html','privacy/index.html','assets/public.css'])check(fs.readFileSync(path.join(tmp,file),'utf8')===fs.readFileSync(file,'utf8'),'Build preserves public artifact '+file);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 return {passed:results.length,results};
}
