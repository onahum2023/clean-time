// Exact CSP hashes for the current static shell. Run --write after changing HTML.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),file=path.join(root,'vercel.json');
const hashes=new Set();
for(const name of ['index.html','about/index.html','privacy/index.html']){
 for(const match of fs.readFileSync(path.join(root,name),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(!/\bsrc\s*=/.test(match[1])&&match[2].trim())hashes.add("'sha256-"+crypto.createHash('sha256').update(match[2]).digest('base64')+"'");
 }
}
const csp=["default-src 'self'","base-uri 'none'","object-src 'none'","frame-ancestors 'none'","form-action 'self'","script-src 'self' "+[...hashes].sort().join(' ')+" https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js","style-src 'self' 'unsafe-inline'","img-src 'self' data:","font-src 'self'","media-src 'self'","worker-src 'self'","connect-src 'self' https://aefhjgmiwgajdhgyhelm.supabase.co wss://aefhjgmiwgajdhgyhelm.supabase.co"].join('; ');
const headers=[{key:'Content-Security-Policy',value:csp},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'X-Frame-Options',value:'DENY'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'}];
const config=JSON.parse(fs.readFileSync(file,'utf8'));
if(process.argv.includes('--write')){config.headers=[{source:'/(.*)',headers}];fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');}
else if(JSON.stringify(config.headers)!==JSON.stringify([{source:'/(.*)',headers}]))throw Error('Security headers/CSP hashes are stale; run node scripts/security-headers.js --write and review the diff');
console.log('Security header hashes match the static HTML');
