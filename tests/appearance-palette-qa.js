async(page)=>{
 const results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765';
 await page.route('**/*',r=>r.request().url().startsWith(origin)?r.fallback():r.abort());
 await page.goto(origin);await page.evaluate(()=>localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'אחר',updatedAt:1})));await page.reload();
 const saved=await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'));
 await page.locator('#openSettings').click();
 check(await page.locator('#backgroundChoice option').count()===9,'Nine curated backgrounds');
 check(await page.locator('#fontChoice option').count()===5,'Five readable font stacks');
 const matrix=await page.evaluate(()=>{
  const failures=[],root=document.documentElement,body=document.body,button=document.getElementById('saveSettings'),span=document.createElement('span');body.append(span);
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1;
  const luminance=color=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);};
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  let count=0;
  for(const theme of ['light','dark'])for(const background of CleanTimeAppearance.backgrounds)for(const font of CleanTimeAppearance.fonts)for(const accent of CleanTimeAppearance.accents){
   root.dataset.theme=theme;CleanTimeAppearance.save({background,font,accent});const b=getComputedStyle(body),bt=getComputedStyle(button);
   span.style.color='var(--muted)';const muted=getComputedStyle(span).color;
   span.style.color='var(--accent-ink)';const focus=getComputedStyle(span).color;
   const label=[theme,background,font,accent].join('/');
   if(contrast(b.color,b.backgroundColor)<4.5||contrast(muted,b.backgroundColor)<4.5||contrast(bt.color,bt.backgroundColor)<4.5||contrast(focus,b.backgroundColor)<3)failures.push(label);
   count++;
  }
  span.remove();delete root.dataset.theme;return {count,failures};
 });
 check(matrix.count===540&&matrix.failures.length===0,'All 540 theme/background/font/accent combinations meet text/button/focus contrast: '+matrix.failures.join(','));
 await page.locator('#backgroundChoice').selectOption('lavender');await page.locator('#fontChoice').selectOption('tahoma');await page.locator('#accentChoice').selectOption('plum');
 await page.reload();check(await page.evaluate(()=>document.documentElement.dataset.background==='lavender'&&document.documentElement.dataset.font==='tahoma'&&document.documentElement.dataset.accent==='plum'),'All preferences persist after refresh');
 check(await page.evaluate(()=>localStorage.getItem('cleantime-he-v1'))===saved,'Preferences leave recovery state unchanged');
 await page.locator('#openSettings').click();await page.setViewportSize({width:360,height:800});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Hebrew settings fit at 360px');
 await page.keyboard.press('Tab');check(await page.locator(':focus-visible').count()>0,'Keyboard focus remains visible');
 await page.locator('#resetAppearance').click();check(await page.evaluate(()=>document.documentElement.dataset.background==='default'&&document.documentElement.dataset.font==='assistant'&&document.documentElement.dataset.accent==='profile'),'Reset restores all default preferences');
 return {passed:results.length,results};
}
