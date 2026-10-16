const fs=require('node:fs'),path=require('node:path');
require('./security-headers.js');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.CT_BUILD_OUTPUT||path.join(ROOT,'dist'));
const publication=require('./publication.js');
publication.validateDestination(ROOT,OUT);
publication.validateSource(ROOT);
publication.validateOutput(OUT);
const env=process.env.VERCEL_ENV||'development',source=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
if(!['production','preview','development'].includes(env))throw new Error('Unknown build environment');
const productionUrl=source.match(/const PRODUCTION_SUPA_URL='([^']+)'/)[1];
const productionKey=source.match(/const PRODUCTION_SUPA_KEY='([^']+)'/)[1];
let config={environment:'production',url:productionUrl,key:productionKey};
if(env!=='production'){
 // The staging project was retired. Preview remains guest-only, even if
 // obsolete branch variables are still present. Never fall back to production.
 config={environment:env,url:null,key:null,backupDisabled:true};
}
fs.mkdirSync(OUT,{recursive:true});
for(const file of publication.files){
 const target=path.join(OUT,file);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.copyFileSync(path.join(ROOT,file),target);
}
// Vercel's resilient intake paths are opaque, not necessarily /script.js or /view.
// Validate same-origin path syntax, rather than guessing provider suffixes.
const publicPath=(value,fallback)=>{
 if(value===undefined)return fallback;
 if(typeof value!=='string'||!value||value.length>512)throw new Error('Invalid public Analytics path');
 const result=value.startsWith('/')?value:'/'+value;
 if(!/^\/[A-Za-z0-9_./-]+$/.test(result)||result.includes('//')||result.split('/').some(part=>part==='.'||part==='..'))throw new Error('Invalid public Analytics path');
 return result;
};
// Disabled Preview instrumentation must never depend on unused provider config.
const analytics=env==='production'?JSON.parse(process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG||'{}').analytics||{}:{};
const scriptSrc=publicPath(analytics.scriptSrc,'/_vercel/insights/script.js');
const viewEndpoint=publicPath(analytics.viewEndpoint,'/_vercel/insights/view');
const eventEndpoint=publicPath(analytics.eventEndpoint,'/_vercel/insights/event');
const analyticsTag='<script defer src="/assets/analytics.js" data-enabled="'+(env==='production')+'" data-custom-events="'+(env==='production'&&process.env.CLEAN_TIME_ANALYTICS_CUSTOM_EVENTS!=='false')+'" data-script-src="'+scriptSrc+'" data-view-endpoint="'+viewEndpoint+'" data-event-endpoint="'+eventEndpoint+'"></script>';
for(const file of ['index.html','about/index.html','privacy/index.html']){
 const body=fs.readFileSync(path.join(ROOT,file),'utf8');
 fs.writeFileSync(path.join(OUT,file),body.replace(/<script defer src="\/assets\/analytics\.js"[^>]*><\/script>/,analyticsTag));
}
// Record only valid public generated paths on Preview too, for provider-format
// regression evidence. Malformed unused config still cannot block Preview.
if(env==='preview')try{
 const generated=JSON.parse(process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG||'{}').analytics;
 if(generated)console.log('Unused Preview Analytics paths: '+JSON.stringify(Object.fromEntries(['scriptSrc','viewEndpoint','eventEndpoint'].filter(key=>generated[key]!==undefined).map(key=>{publicPath(generated[key]);return [key,generated[key]];}))));
}catch{}
// Only these three validated public paths are logged; no environment dump.
if(env==='production')console.log('Public Analytics paths: '+JSON.stringify({scriptSrc,viewEndpoint,eventEndpoint}));
fs.writeFileSync(path.join(OUT,'assets/backend-config.js'),'window.CleanTimeBackend = '+JSON.stringify(config)+';\n');
console.log('Static build complete: '+config.environment+' backend configuration');

// Couple every built app shell to this application's explicit release version.
const version=source.match(/const APP_VERSION='([^']+)'/)[1];
const worker=fs.readFileSync(path.join(ROOT,'service-worker.js'),'utf8').replace(/const VERSION='[^']+'/,"const VERSION='"+version+"'");
fs.writeFileSync(path.join(OUT,'service-worker.js'),worker);
publication.validateOutput(OUT);
