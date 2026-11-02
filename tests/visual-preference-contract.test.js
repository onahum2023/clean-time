'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const legacyCode=new vm.Script(fs.readFileSync('assets/appearance.js','utf8')),themeCode=new vm.Script(fs.readFileSync('assets/visual-theme.js','utf8'));
const recovery='{"date":"2025-01-01","unknown":{"keep":true},"updatedAt":1}';
function boot(legacy,visual,blocked=false){
 const data=new Map([['cleantime-he-v1',recovery]]);if(legacy!==undefined)data.set('cleantime-he-appearance',legacy);if(visual!==undefined)data.set('cleantime-he-visual-theme',visual);
 const dataset={},scope={window:{},document:{documentElement:{dataset}},localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(blocked)throw Error('quota');data.set(k,v);}}};
 vm.createContext(scope);legacyCode.runInContext(scope);themeCode.runInContext(scope);return {data,dataset,scope};
}
test('every legacy combination boots unchanged with every palette and brightness mode',()=>{
 let count=0;
 for(const background of ['default','sage','sand','mist','lavender','rose','peach','sky','stone'])for(const font of ['assistant','arial','serif','tahoma','verdana'])for(const accent of ['profile','teal','sky','plum','olive','rose'])for(const palette of ['original','forest','rainy','sunny'])for(const mode of ['system','light','dark']){
  const legacy=JSON.stringify({background,font,accent,futureOverride:{keep:true}}),visual=JSON.stringify({palette,mode}),{data,dataset}=boot(legacy,visual);
  assert.equal(data.get('cleantime-he-appearance'),legacy);assert.equal(data.get('cleantime-he-visual-theme'),visual);assert.equal(data.get('cleantime-he-v1'),recovery);assert.equal(data.size,3);
  assert.equal(dataset.background,background);assert.equal(dataset.font,font);assert.equal(dataset.accent,accent);assert.equal(dataset.palette,palette);assert.equal(dataset.theme,mode==='system'?undefined:mode);count++;
 }
 assert.equal(count,3240);
});
test('invalid, missing and old records fall back without automatic storage writes',()=>{
 for(const value of [undefined,'{bad','null','[]','{"palette":"unknown","mode":"invalid"}']){
  const {data,dataset}=boot(undefined,value);assert.equal(dataset.palette,'original');assert.equal(dataset.theme,undefined);assert.equal(data.get('cleantime-he-visual-theme'),value);assert.equal(data.get('cleantime-he-v1'),recovery);
 }
 const old='{"background":"sage","font":"serif"}',{data,dataset}=boot(old);assert.equal(dataset.accent,'profile');assert.equal(data.get('cleantime-he-appearance'),old);
});
test('theme writes and quota failures are bounded to local presentation',()=>{
 const legacy='{"background":"sand","font":"tahoma","accent":"plum","custom":{"keep":true}}';
 const {data,scope}=boot(legacy);assert.equal(scope.window.CleanTimeVisualTheme.save({palette:'rainy',mode:'dark',extra:'excluded'}),true);
 assert.equal(data.get('cleantime-he-visual-theme'),'{"palette":"rainy","mode":"dark"}');assert.equal(data.get('cleantime-he-appearance'),legacy);assert.equal(data.get('cleantime-he-v1'),recovery);
 const blocked=boot(legacy,undefined,true);assert.equal(blocked.scope.window.CleanTimeVisualTheme.save({palette:'sunny',mode:'light'}),false);assert.equal(blocked.dataset.palette,'sunny');assert.equal(blocked.data.has('cleantime-he-visual-theme'),false);assert.equal(blocked.data.get('cleantime-he-v1'),recovery);
});
