// Device-local appearance only. Loaded before CSS/app initialization.
(function(){
 const KEY='cleantime-he-appearance';
 const backgrounds=['default','sage','sand','mist','lavender','rose','peach','sky','stone'],fonts=['assistant','arial','serif','tahoma','verdana'],accents=['profile','teal','sky','plum','olive','rose'];
 const normalize=value=>({background:backgrounds.includes(value?.background)?value.background:'default',font:fonts.includes(value?.font)?value.font:'assistant',accent:accents.includes(value?.accent)?value.accent:'profile'});
 const read=()=>{try{return normalize(JSON.parse(localStorage.getItem(KEY)));}catch(e){return normalize(null);}};
 const apply=value=>{const d=normalize(value);document.documentElement.dataset.background=d.background;document.documentElement.dataset.font=d.font;document.documentElement.dataset.accent=d.accent;};
 window.CleanTimeAppearance={read,backgrounds,fonts,accents,save:value=>{const d=normalize(value);apply(d);try{localStorage.setItem(KEY,JSON.stringify(d));return true;}catch(e){return false;}}};
 apply(read());
})();
