// Additive appearance storage and actual rendered palette contrast; synthetic only.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem('cleantime-he-v1'))localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'סמים',linksV:2,links:[],updatedAt:1,unknown:{keep:true}}));});
 await page.goto(origin);await page.locator('#counter').waitFor();
 const recovery=await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'));
 check(await page.evaluate(()=>CleanTimeVisualTheme.read().palette==='original'&&CleanTimeVisualTheme.read().mode==='system'&&!localStorage.getItem('cleantime-he-visual-theme')),'No automatic migration or default write');
 await page.locator('#openSettings').click();
 for(const value of ['forest','rainy','sunny','original']){
  await page.locator('[name=palette][value='+value+']').check();
  check(await page.locator('html').getAttribute('data-palette')===value&&await page.locator('[name=palette]:checked').getAttribute('value')===value,'Palette previews and native selected state '+value);
 }
 await page.locator('#backgroundChoice').selectOption('lavender');await page.locator('#fontChoice').selectOption('tahoma');await page.locator('#accentChoice').selectOption('plum');
 const legacy=await page.evaluate(()=>localStorage.getItem('cleantime-he-appearance'));
 await page.locator('[name=palette][value=rainy]').check();await page.locator('#brightnessChoice').selectOption('dark');
 await page.reload();check(await page.locator('html').getAttribute('data-palette')==='rainy'&&await page.locator('html').getAttribute('data-theme')==='dark','Palette and explicit mode persist before initialization');
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-appearance'))===legacy,'Theme selection does not remap legacy adjustments');
 const matrix=await page.evaluate(()=>{
  const root=document.documentElement,ctx=document.createElement('canvas').getContext('2d'),probe=document.createElement('span');document.body.append(probe);const failures=[];let count=0;
  const lum=value=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);};
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const resolve=name=>{probe.style.color='var('+name+')';return getComputedStyle(probe).color;};
  const colors=['#477E72','#2C78A8','#4B57A3','#874778','#5F7230','#B04A5A'];
  for(const palette of CleanTimeVisualTheme.palettes)for(const mode of ['light','dark'])for(const background of CleanTimeAppearance.backgrounds)for(const font of CleanTimeAppearance.fonts)for(const accent of CleanTimeAppearance.accents)for(const color of accent==='profile'?colors:[colors[0]]){
   root.dataset.palette=palette;root.dataset.theme=mode;root.dataset.background=background;root.dataset.font=font;root.dataset.accent=accent;root.style.setProperty('--accent',color);
   const b=getComputedStyle(document.body),surface=resolve('--surface'),muted=resolve('--muted'),ink=resolve('--ink'),action=resolve('--action'),focus=resolve('--accent-ink');
   const label=[palette,mode,background,font,accent,color].join('/');
   if(ratio(ink,b.backgroundColor)<4.5||ratio(ink,surface)<4.5||ratio(muted,b.backgroundColor)<4.5||ratio(muted,surface)<4.5||ratio('#fff',action)<4.5||ratio(focus,b.backgroundColor)<4.5||ratio(focus,surface)<4.5)failures.push(label);
   count++;
  }
  probe.remove();return {count,failures};
 });
 check(matrix.count===3960&&!matrix.failures.length,'3960 rendered palette/legacy/font/accent/mode combinations meet contrast: '+matrix.failures.slice(0,12).join(','));
 const compatibility=await page.evaluate(()=>{
  const key='cleantime-he-appearance',recover=localStorage.getItem('cleantime-he-v1');let count=0;
  for(const background of CleanTimeAppearance.backgrounds)for(const font of CleanTimeAppearance.fonts)for(const accent of CleanTimeAppearance.accents){
   const raw=JSON.stringify({background,font,accent,futureOverride:{keep:true}});localStorage.setItem(key,raw);
   for(const palette of CleanTimeVisualTheme.palettes){CleanTimeVisualTheme.save({palette,mode:'system'});if(localStorage.getItem(key)!==raw||JSON.stringify(CleanTimeAppearance.read())!==JSON.stringify({background,font,accent}))return {ok:false,count};count++;}
  }
  return {ok:localStorage.getItem('cleantime-he-v1')===recover,count};
 });
 check(compatibility.ok&&compatibility.count===1080,'All 270 legacy preference combinations survive each palette, including unknown override bytes');
 await page.reload();await page.locator('#openSettings').click();await page.locator('#resetAppearance').click();
 check(await page.evaluate(()=>CleanTimeVisualTheme.read().palette==='original'&&CleanTimeVisualTheme.read().mode==='system'&&CleanTimeAppearance.read().background==='default'&&CleanTimeAppearance.read().accent==='profile'&&CleanTimeAppearance.read().font==='assistant'),'Explicit reset restores all defaults');
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===recovery,'Appearance reset never changes recovery bytes/timestamp');
 for(const lang of ['he','en','ru']){
  await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);if(!await page.locator('#settings').isVisible())await page.locator('#openSettings').click();
  for(const width of [320,390,1024,1440]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Theme controls fit '+lang+' '+width);}
  await page.keyboard.press('Tab');await page.locator('[name=palette][value=original]').focus();await page.keyboard.press('ArrowDown');
  check(await page.locator('[name=palette]:checked').getAttribute('value')==='forest','Native radio keyboard selection '+lang+' '+await page.locator('[name=palette]:checked').getAttribute('value'));
 }
 await page.locator('#brightnessChoice').selectOption('system');await page.emulateMedia({colorScheme:'light'});
 const light=await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor);await page.emulateMedia({colorScheme:'dark'});
 check(light!==await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor)&&await page.locator('html').getAttribute('data-theme')===null,'System brightness follows device live');
 await page.locator('#brightnessChoice').selectOption('light');check(await page.locator('body').evaluate(e=>getComputedStyle(e).colorScheme)==='light','Explicit light takes precedence over dark device');
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('quota');};});await page.locator('[name=palette][value=sunny]').check();
 check(await page.locator('html').getAttribute('data-palette')==='sunny'&&(await page.locator('#appearanceStatus').innerText()).length>0,'Quota failure previews theme and reports unsaved state');
 const isolated=await page.context().browser().newContext({colorScheme:'light'});
 await isolated.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await isolated.addInitScript(()=>{
  localStorage.setItem('cleantime-he-visual-theme',JSON.stringify({palette:'forest',mode:'dark'}));
  localStorage.setItem('cleantime-he-appearance',JSON.stringify({background:'sand',font:'tahoma',accent:'plum'}));
  requestAnimationFrame(()=>{window.firstVisual={palette:document.documentElement.dataset.palette,mode:document.documentElement.dataset.theme,bg:getComputedStyle(document.body).backgroundColor};});
 });
 const first=await isolated.newPage();await first.goto(origin);await first.waitForFunction(()=>window.firstVisual);
 check(await first.evaluate(()=>firstVisual.palette==='forest'&&firstVisual.mode==='dark'&&firstVisual.bg==='rgb(36, 31, 25)'),'First rendered frame respects saved palette/mode and exact legacy canvas');
 await first.evaluate(()=>navigator.serviceWorker.ready);await first.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await isolated.setOffline(true);await first.reload();
 check(await first.locator('html').getAttribute('data-palette')==='forest'&&await first.locator('html').getAttribute('data-theme')==='dark'&&await first.locator('#welcome').isVisible(),'Theme assets and preferences reopen offline');
 await isolated.close();
 return {passed:results.length,results};
}
