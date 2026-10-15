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
  const select=document.getElementById('languageChoice');if(select){select.value=language;for(const option of select.options)if(option.value!=='he')option.disabled=production;}
 };
 document.documentElement.lang=language;document.documentElement.dir=language==='he'?'rtl':'ltr';
 window.CleanTimeI18n={t,language,locale:{he:'he-IL',en:'en-US',ru:'ru-RU'}[language],production,apply,setLanguage:value=>{
  if(!['he','en','ru'].includes(value)||production&&value!=='he')return false;
  try{localStorage.setItem(key,value);return true;}catch(e){return false;}
 }};
 document.addEventListener('DOMContentLoaded',apply);
})();
