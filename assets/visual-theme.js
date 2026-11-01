// Additive device-local presentation only. Apply synchronously before CSS paints.
(function(){
 'use strict';
 const key='cleantime-he-visual-theme',palettes=['original','forest','rainy','sunny'],modes=['system','light','dark'];
 const normalize=value=>({palette:palettes.includes(value?.palette)?value.palette:'original',mode:modes.includes(value?.mode)?value.mode:'system'});
 const read=()=>{try{return normalize(JSON.parse(localStorage.getItem(key)));}catch{return normalize(null);}};
 const apply=value=>{const d=normalize(value),root=document.documentElement;root.dataset.palette=d.palette;if(d.mode==='system')delete root.dataset.theme;else root.dataset.theme=d.mode;};
 window.CleanTimeVisualTheme={read,palettes,modes,save:value=>{const d=normalize(value);apply(d);try{localStorage.setItem(key,JSON.stringify(d));return true;}catch{return false;}}};
 apply(read());
})();
