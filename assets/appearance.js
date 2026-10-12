// Device-local appearance only. Loaded before CSS/app initialization.
(function(){
 const KEY='cleantime-he-appearance';
 const normalize=value=>({background:['default','sage','sand'].includes(value?.background)?value.background:'default',font:['assistant','arial','serif'].includes(value?.font)?value.font:'assistant'});
 const read=()=>{try{return normalize(JSON.parse(localStorage.getItem(KEY)));}catch(e){return normalize(null);}};
 const apply=value=>{const d=normalize(value);document.documentElement.dataset.background=d.background;document.documentElement.dataset.font=d.font;};
 window.CleanTimeAppearance={read,save:value=>{const d=normalize(value);apply(d);try{localStorage.setItem(KEY,JSON.stringify(d));return true;}catch(e){return false;}}};
 apply(read());
})();
