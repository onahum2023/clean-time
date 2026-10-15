// Device-local language preference. No recovery-state mutation or remote service.
(function(){
 'use strict';
 const key='cleantime-language',catalog=window.CleanTimeMessages;
 const production=['clean-time.app','www.clean-time.app','clean-time-eight.vercel.app'].includes(location.hostname);
 let language='he';try{const stored=localStorage.getItem(key);if(['he','en','ru'].includes(stored)&&(!production||stored==='he'))language=stored;}catch(e){}
 const t=value=>{
  if(typeof value!=='string'||language==='he')return value;
  const normalized=value.trim().replace(/\s+/g,' '),translated=catalog[language]?.[normalized]??catalog.en[normalized];
  if(translated===undefined)return value;
  return (value.match(/^\s*/)[0]||'')+translated+(value.match(/\s*$/)[0]||'');
 };
 const apply=()=>{
  if(language!=='he')document.title=t('זמן נקי');
  const readingLanguage=document.getElementById('readingLanguage');if(readingLanguage){if(language==='he')readingLanguage.remove();else readingLanguage.textContent=t('עברית');}
  for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);
  for(const attr of ['aria-label','placeholder','title'])for(const el of document.querySelectorAll('[data-i18n-'+attr+']'))el.setAttribute(attr,t(el.getAttribute('data-i18n-'+attr)));
  // Optional appearance expansion uses the same stable preference values. Only
  // these known UI controls are translated; custom recovery labels stay verbatim.
  const appearance={backgroundChoice:{default:'הרקע הנוכחי',sage:'מרווה בהירה',sand:'חול בהיר',mist:'ערפל',lavender:'לבנדר',rose:'ורוד עדין',peach:'אפרסק',sky:'שמיים',stone:'אבן'},fontChoice:{assistant:'Assistant — הגופן הנוכחי',arial:'Arial — פשוט וברור',serif:'גופן ספר',tahoma:'Tahoma',verdana:'Verdana'},accentChoice:{profile:'הצבע הנוכחי',teal:'טורקיז',sky:'כחול',plum:'שזיף',olive:'זית',rose:'ורד'}};
  for(const [id,labels] of Object.entries(appearance))for(const option of document.getElementById(id)?.options||[])if(labels[option.value])option.textContent=t(labels[option.value]);
  const accent=document.getElementById('accentChoice');if(accent)accent.closest('label').querySelector('span').textContent=t('צבע הדגשה במכשיר הזה');
  const fontNote='גופני מערכת יוצגו אם הם זמינים במכשיר. אחרת יופיע גופן חלופי קריא.';
  for(const note of document.querySelectorAll('#settings .note'))if(note.textContent===fontNote)note.textContent=t(fontNote);
  const select=document.getElementById('languageChoice');if(select){select.value=language;for(const option of select.options)if(option.value!=='he')option.disabled=production;}
 };
 document.documentElement.lang=language;document.documentElement.dir=language==='he'?'rtl':'ltr';
 window.CleanTimeI18n={t,language,locale:{he:'he-IL',en:'en-US',ru:'ru-RU'}[language],production,apply,setLanguage:value=>{
  if(!['he','en','ru'].includes(value)||production&&value!=='he')return false;
  try{localStorage.setItem(key,value);return true;}catch(e){return false;}
 }};
 document.addEventListener('DOMContentLoaded',apply);
})();
