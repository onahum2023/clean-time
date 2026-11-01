// Assert the rendered navigation boundary, independently of its CSS implementation.
exports.navigationFits=async page=>{
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return page.evaluate(()=>{
  const nav=document.getElementById('tabs'),app=document.querySelector('.app'),r=nav.getBoundingClientRect(),a=app.getBoundingClientRect(),near=(x,y)=>Math.abs(x-y)<1;
  if(!getComputedStyle(nav)||getComputedStyle(nav).position!=='fixed')return false;
  if(innerWidth>=1024)return near(r.width,224)&&near(r.height,innerHeight)&&near(r.top,0)&&(document.dir==='rtl'?near(r.right,innerWidth)&&a.right<=r.left+1:near(r.left,0)&&a.left>=r.right-1)&&near(a.width+r.width,innerWidth);
  const inner=nav.querySelector('.inner').getBoundingClientRect();
  return near(r.bottom,innerHeight)&&near(r.left,0)&&near(r.right,innerWidth)&&inner.width<=520&&near(inner.left+inner.width/2,innerWidth/2)&&parseFloat(getComputedStyle(app).paddingBottom)>=r.height;
 });
};
