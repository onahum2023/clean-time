const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.CT_BUILD_OUTPUT||path.join(ROOT,'dist'));
if(OUT===ROOT||OUT===path.parse(OUT).root)throw new Error('Unsafe build output');
const env=process.env.VERCEL_ENV||'production',source=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const productionUrl=source.match(/const PRODUCTION_SUPA_URL='([^']+)'/)[1];
const productionKey=source.match(/const PRODUCTION_SUPA_KEY='([^']+)'/)[1];
let config={environment:'production',url:productionUrl,key:productionKey};
if(env==='preview'){
 const url=process.env.CLEAN_TIME_SUPABASE_URL,key=process.env.CLEAN_TIME_SUPABASE_PUBLISHABLE_KEY;
 if(url!=='https://uffvbfmfsesdhjzzjiyu.supabase.co'||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key||''))throw new Error('Preview requires the isolated staging URL and a publishable key');
 config={environment:'preview',url,key};
}
fs.mkdirSync(OUT,{recursive:true});
for(const file of ['index.html','robots.txt','sitemap.xml','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','service-worker.js'])fs.copyFileSync(path.join(ROOT,file),path.join(OUT,file));
for(const directory of ['about','privacy'])fs.cpSync(path.join(ROOT,directory),path.join(OUT,directory),{recursive:true});
fs.cpSync(path.join(ROOT,'assets'),path.join(OUT,'assets'),{recursive:true,filter:file=>path.basename(file)!=='.DS_Store'});
// Vercel v2 supplies project-specific public paths. Retain the verified legacy
// endpoint when that build configuration is absent; never accept remote URLs.
const analytics=JSON.parse(process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG||'{}').analytics||{};
const scriptSrc=analytics.scriptSrc||'/_vercel/insights/script.js',viewEndpoint=analytics.viewEndpoint||'/_vercel/insights/view';
const safePath=value=>typeof value==='string'&&/^\/[A-Za-z0-9_/-]+$/.test(value)&&!value.includes('//')&&!value.split('/').includes('..');
if(!safePath(scriptSrc.replace(/\.js$/,''))||!scriptSrc.endsWith('/script.js')||!safePath(viewEndpoint)||!viewEndpoint.endsWith('/view'))throw new Error('Invalid public Analytics paths');
const analyticsTag='<script defer src="/assets/analytics.js" data-enabled="'+(env==='production')+'" data-script-src="'+scriptSrc+'" data-view-endpoint="'+viewEndpoint+'"></script>';
fs.writeFileSync(path.join(OUT,'index.html'),source.replace(/<script defer src="\/assets\/analytics\.js"[^>]*><\/script>/,analyticsTag));
fs.writeFileSync(path.join(OUT,'assets/backend-config.js'),'window.CleanTimeBackend = '+JSON.stringify(config)+';\n');
console.log('Static build complete: '+config.environment+' backend configuration');

// Couple every built app shell to this application's explicit release version.
const version=source.match(/const APP_VERSION='([^']+)'/)[1];
const worker=fs.readFileSync(path.join(ROOT,'service-worker.js'),'utf8').replace(/const VERSION='[^']+'/,"const VERSION='"+version+"'");
fs.writeFileSync(path.join(OUT,'service-worker.js'),worker);
