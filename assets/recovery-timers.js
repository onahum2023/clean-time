// Additive whole-record schema. IDs/categories are independent of UI language.
(function(root){
 'use strict';
 const names={drugs:'סמים',alcohol:'אלכוהול',gambling:'הימורים',food:'אכילת יתר',smoking:'עישון',other:'אחר'};
 const category=from=>Object.keys(names).find(key=>names[key]===from)||(from==='אוכל'?'food':'other');
 const fields=timer=>({date:timer.date,time:timer.time||'',from:timer.label||timer.legacyFrom||names[timer.category]});
 const validDate=value=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number),date=new Date(0);date.setFullYear(y,m-1,d);return y>=1&&date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d;};
 function legacy(state,id='legacy-primary'){
  const from=state.from||'',kind=category(from);
  return {id,category:kind,label:Object.values(names).includes(from)||from==='אוכל'?'':from,date:state.date,time:state.time||'',...(from==='אוכל'?{legacyFrom:from}:{})};
 }
 function validate(timer){
  if(!timer||typeof timer!=='object'||Array.isArray(timer)||typeof timer.id!=='string'||!timer.id||!Object.hasOwn(names,timer.category)||typeof timer.label!=='string'||timer.label.length>40||!validDate(timer.date)||typeof timer.time!=='string'||timer.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(timer.time))throw Error('Invalid recovery timer');
 }
 function project(state){
  const primary=state.timers.find(t=>t.id===state.primaryTimerId);
  if(!primary){if(state.timers.length)throw Error('Missing primary timer');return {...state,date:'',time:'',from:'',timerProjection:{date:'',time:'',from:''}};}
  const projection=fields(primary);return {...state,...projection,timerProjection:projection};
 }
 function normalize(state){
  let next={...state};
  if(!Object.hasOwn(state,'timers')){
   // Legacy dates/types remain accepted exactly as before; malformed timer data
   // is never substituted with defaults or allowed to overwrite the raw record.
   next.timers=state.date?[legacy(state)]:[];next.primaryTimerId=next.timers[0]?.id||null;next.timersVersion=1;
   if(!state.date)return project(next);
  }else{
   if(!Array.isArray(state.timers)||state.timersVersion!==1)throw Error('Unsupported timer schema');
   next.timers=state.timers.map(t=>({...t}));
   if(!next.timers.length&&state.date){next.timers=[legacy(state)];next.primaryTimerId=next.timers[0].id;}
  }
  next.timers.forEach(validate);
  if(new Set(next.timers.map(t=>t.id)).size!==next.timers.length)throw Error('Duplicate timer ID');
  const primary=next.timers.find(t=>t.id===next.primaryTimerId);
  if(next.timers.length&&!primary)throw Error('Missing primary timer');
  // Older clients retain unknown fields but edit legacy scalar date/time/from.
  // A saved projection distinguishes that edit from a new timer-array update.
  if(primary&&state.timerProjection&&['date','time','from'].some(k=>(state[k]||'')!==(state.timerProjection[k]||''))){
   const changed=legacy(state,primary.id);
   if((state.from||'')===(state.timerProjection.from||'')){changed.category=primary.category;changed.label=primary.label;if(primary.legacyFrom)changed.legacyFrom=primary.legacyFrom;}
   validate(changed);delete primary.legacyFrom;Object.assign(primary,changed);
  }
  return project(next);
 }
 const api={names,fields,validDate,normalize,project};
 if(typeof module==='object')module.exports=api;else root.CleanTimeTimers=api;
})(typeof window==='object'?window:globalThis);
