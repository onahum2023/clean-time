// One anonymous home-page view. Never observe recovery state or SPA navigation.
(()=>{
 const config=document.currentScript;
 if(config?.dataset.enabled!=='true'||location.origin!=='https://clean-time.app'||location.pathname!=='/'||location.search||location.hash)return;
 // Vercel adds referrers outside beforeSend. Omit externally referred visits.
 if(document.referrer){
  try{if(new URL(document.referrer).host!==location.host)return;}catch{return;}
 }
 // Current Vercel scripts can append persisted identity outside beforeSend.
 // Fail closed if vendor attribution exists; never read recovery storage.
 try{if(localStorage.getItem('__va_attribution'))return;}catch{return;}
 const scriptSrc=config.dataset.scriptSrc,viewEndpoint=config.dataset.viewEndpoint;
 const safePath=value=>/^\/[A-Za-z0-9_/-]+$/.test(value)&&!value.includes('//')&&!value.split('/').includes('..');
 if(!safePath(scriptSrc?.replace(/\.js$/,''))||!scriptSrc.endsWith('/script.js')||!safePath(viewEndpoint)||!viewEndpoint.endsWith('/view'))return;
 window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
 let sent=false;
 window.va('beforeSend',event=>{
  if(sent||event.type!=='pageview'||event.url!=='https://clean-time.app/')return null;
  sent=true;
  return {type:'pageview',url:'https://clean-time.app/'};
 });
 const script=document.createElement('script');
 script.defer=true;script.src=scriptSrc;
 script.dataset.disableAutoTrack='true';
 script.dataset.viewEndpoint=viewEndpoint;
 // No custom events, identity/group calls, flags or cookie opt-in.
 window.va('pageview',{path:'/'});
 document.head.appendChild(script);
})();
