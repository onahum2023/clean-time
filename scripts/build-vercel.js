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
for(const file of ['index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'])fs.copyFileSync(path.join(ROOT,file),path.join(OUT,file));
fs.cpSync(path.join(ROOT,'assets'),path.join(OUT,'assets'),{recursive:true,filter:file=>path.basename(file)!=='.DS_Store'});
fs.writeFileSync(path.join(OUT,'assets/backend-config.js'),'window.CleanTimeBackend = '+JSON.stringify(config)+';\n');
console.log('Static build complete: '+config.environment+' backend configuration');
