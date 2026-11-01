// Synthetic layout regression for #75: the footer must follow Home, not a 520px cap.
async(page)=>{
 const origin=process.env.QA_BASE_URL||'http://127.0.0.1:8765',results=[];
 const check=(value,label)=>{if(!value)throw Error(label);results.push(label);};
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.fallback():r.abort());
 await page.addInitScript(()=>localStorage.setItem('cleantime-he-v1',JSON.stringify({date:'2025-01-01',from:'סמים',updatedAt:1})));
 await page.goto(origin);await page.locator('#counter').waitFor();await page.evaluate(()=>document.fonts.ready);
 const geometry=async()=>{
  // ResizeObserver runs with rendering, after viewport/style mutations settle.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  return page.evaluate(()=>{
  const nav=document.getElementById('tabs'),bar=nav.getBoundingClientRect(),inner=nav.querySelector('.inner').getBoundingClientRect(),home=document.getElementById('counter').getBoundingClientRect();
  const buttons=[...nav.querySelectorAll('.inner>button')],rects=buttons.map(e=>e.getBoundingClientRect()),near=(a,b)=>Math.abs(a-b)<1;
  return {
   aligned:near(inner.left,home.left)&&near(inner.right,home.right)&&inner.width>520&&inner.width<=1080,
   compact:near(inner.width,Math.min(520,innerWidth)),
   bounded:inner.left>=0&&inner.right<=innerWidth&&near(inner.left+inner.width/2,innerWidth/2),
   fixed:getComputedStyle(nav).position==='fixed'&&near(bar.bottom,innerHeight)&&near(bar.left,0)&&near(bar.right,innerWidth),
   order:buttons.map(e=>e.id||e.dataset.tab).join('|')==='counter|tools|about|openSettings|openAccount'&&rects.every((r,i)=>i===0||(document.dir==='rtl'?r.right<=rects[i-1].left+1:r.left>=rects[i-1].right-1)),
   targets:rects.length===5&&rects.every(r=>r.width>=44&&r.height>=44&&near(r.width,inner.width/5)),
   fit:document.documentElement.scrollWidth<=innerWidth&&buttons.every(e=>e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1),
   clearance:parseFloat(getComputedStyle(document.querySelector('.app')).paddingBottom)>=bar.height,
   active:buttons.filter(e=>e.hasAttribute('aria-current')).length===1&&buttons[0].getAttribute('aria-current')==='page'&&getComputedStyle(buttons[0],'::before').height==='3px',
   desktopLabel:parseFloat(getComputedStyle(buttons[0]).fontSize)>=16&&getComputedStyle(buttons[0]).backgroundColor!=='rgba(0, 0, 0, 0)'
  };
  });
 };
 for(const lang of ['he','en','ru'])for(const colorScheme of ['light','dark']){
  await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);await page.locator('#counter').waitFor();await page.emulateMedia({colorScheme});
  for(const width of [320,390,568,599,600,768,1023,1024,1440,1920]){
   await page.setViewportSize({width,height:width>=1024?900:844});
   const g=await geometry(),label=`${lang} ${colorScheme} ${width}`;
   check(width>=1024?g.aligned:width<600?g.compact:g.bounded,'Navigation width follows Home on desktop and preserves compact mobile: '+label);
   check(g.fixed&&g.bounded,'Full-width fixed bar and centered inner: '+label);
   check(g.order&&g.targets,'Five ordered equal navigation targets of at least 44px: '+label);
   check(g.fit&&g.clearance,'No overflow and sufficient bottom clearance: '+label);
   check(g.active&&(width<1024||g.desktopLabel),'Visible current destination and readable desktop label: '+label);
   await page.locator('#counter [data-go=inventory]').scrollIntoViewIfNeeded();
   check(await page.locator('#counter [data-go=inventory]').evaluate(e=>e.getBoundingClientRect().bottom<=document.getElementById('tabs').getBoundingClientRect().top+1),'Last Home action clears footer: '+label);
  }
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:width===390?844:900});
   const buttons=page.locator('#tabs .inner>button');await page.keyboard.press('Tab');await buttons.first().focus();
   for(let i=0;i<5;i++){
    check(await buttons.nth(i).evaluate(e=>e===document.activeElement&&getComputedStyle(e).outlineStyle!=='none'),'Keyboard order and visible focus '+lang+' '+colorScheme+' '+width+' '+i);
    if(i<4)await page.keyboard.press('Tab');
   }
   await page.keyboard.press('Enter');check(await page.locator('#account').isVisible(),'Keyboard activates Account '+lang+' '+colorScheme+' '+width);
   await buttons.first().focus();await page.keyboard.press('Enter');
   check(await page.locator('#counter').isVisible(),'Keyboard returns Home '+lang+' '+colorScheme+' '+width);
  }
 }
 // 1440px at 200% browser zoom has a 720×450 CSS viewport. Exercise that
 // reflow separately from enlarged text; neither is a physical-device claim.
 for(const lang of ['he','en','ru']){
  await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);await page.locator('#counter').waitFor();await page.setViewportSize({width:720,height:450});
  const g=await geometry();check(g.fixed&&g.fit&&g.clearance&&g.targets,'200% zoom-equivalent reflow '+lang);
 }
 for(const lang of ['he','en','ru']){
  await page.locator('[data-language='+lang+']').click();await page.waitForFunction(l=>document.documentElement.lang===l,lang);await page.locator('#counter').waitFor();
  const enlarged=await page.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
  for(const width of [320,390,1024,1440]){
   await page.setViewportSize({width,height:width>=1024?900:844});
   const g=await geometry();check(g.fixed&&g.fit&&g.clearance&&g.targets&&(width<1024||g.aligned),'200% text, footer alignment and clearance '+lang+' '+width+' '+JSON.stringify(g));
  }
  await enlarged.evaluate(e=>e.remove());
 }
 // This Chromium lacks safe-area env emulation. Simulate the resulting footer
 // padding and test measured clearance; physical-device acceptance is separate.
 await page.setViewportSize({width:390,height:844});
 const inset=await page.addStyleTag({content:'#tabs{padding-bottom:34px}'});
 await page.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelector('.app')).paddingBottom)>=document.getElementById('tabs').getBoundingClientRect().height);
 check(await page.locator('#tabs').evaluate(e=>parseFloat(getComputedStyle(e).paddingBottom)===34),'Footer reserves simulated 34px bottom safe-area padding');
 check((await geometry()).clearance,'Content clearance follows simulated safe-area padding');
 await page.locator('#counter [data-go=inventory]').scrollIntoViewIfNeeded();
 check(await page.locator('#counter [data-go=inventory]').evaluate(e=>e.getBoundingClientRect().bottom<=document.getElementById('tabs').getBoundingClientRect().top+1),'Last action clears footer with simulated safe area');
 await inset.evaluate(e=>e.remove());
 return {passed:results.length,results};
}
