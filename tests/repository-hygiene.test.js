'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {execFileSync,spawnSync}=require('node:child_process');
const {privatePath,credentialLike,recoveryExport,checkRepository}=require('../scripts/repository-hygiene.js');
const root=path.resolve(__dirname,'..'),files=require('../scripts/public-files.json');
function temporary(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ct-hygiene-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
function write(root,file,body){const full=path.join(root,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,body);}
test('private artifact paths are blocked while public assets and synthetic fixtures remain allowed',()=>{
 for(const file of ['.env','.env.production','assets/.env','playwright/.auth/user.json','storageState.json','.codex/state.json','clean-time-2026-10-16.json','recovery-export.json','dev.sqlite3-wal','test-results/video.webm','screenshots/account.png'])assert.equal(privatePath(file),true,file);
 for(const file of [...files,'.env.example','tests/fixtures/recovery-data.json','assets/README.md'])assert.equal(privatePath(file),false,file);
});
test('privileged credentials are rejected without rejecting public client keys or synthetic markers',()=>{
 assert.equal(credentialLike('ghp_'+'A'.repeat(36)),true);
 assert.equal(credentialLike('sb_secret_'+'a'.repeat(25)),true);
 const jwt=role=>Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.signature';
 assert.equal(credentialLike(jwt('service_role')),true);
 assert.equal(credentialLike(jwt('anon')),false);
 assert.equal(credentialLike('sb_publishable_SYNTHETIC_QA_ONLY sb_secret_SYNTHETIC'),false);
});
test('renamed recovery exports are blocked and synthetic fixtures require an explicit location',()=>{
 const content=JSON.stringify({format:'clean-time-recovery',version:1,data:{journal:[]}});
 assert.equal(recoveryExport('notes.json',content),true);
 assert.equal(recoveryExport('notes.json',JSON.stringify({date:'2026-01-01',gratitude:[]})),true);
 assert.equal(recoveryExport('tests/fixtures/synthetic.json',content),false);
 assert.equal(recoveryExport('config.json','{"environment":"preview"}'),false);
});
test('tracked private files and credentials fail even when force-added; untracked local files do not',t=>{
 const repo=temporary(t);execFileSync('git',['init','-q',repo]);
 write(repo,'.gitignore','.env\n');write(repo,'safe.js','const ok=true;');write(repo,'.env','LOCAL_TEST=synthetic');
 execFileSync('git',['-C',repo,'add','.gitignore','safe.js']);assert.doesNotThrow(()=>checkRepository(repo));
 execFileSync('git',['-C',repo,'add','-f','.env']);assert.throws(()=>checkRepository(repo),/private\/local artifact is tracked/);
 execFileSync('git',['-C',repo,'rm','--cached','.env']);write(repo,'safe.js','ghp_'+'A'.repeat(36));
 assert.throws(()=>checkRepository(repo),/possible privileged credential/);
});
test('allowlisted build excludes accidental content, blocks stale outputs/symlinks and preserves backend isolation',t=>{
 const repo=temporary(t),out=path.join(repo,'dist');
 for(const file of [...files,'vercel.json',...fs.readdirSync(path.join(root,'scripts')).filter(n=>/\.(js|json)$/.test(n)).map(n=>'scripts/'+n)]){
  const dest=path.join(repo,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);
 }
 for(const file of ['assets/private-export.json','assets/nested/.env','about/account.png','privacy/session.json','docs/private.md'])write(repo,file,'synthetic artifact');
 const build=env=>spawnSync(process.execPath,['scripts/build-vercel.js'],{cwd:repo,encoding:'utf8',env:{...process.env,VERCEL_ENV:env,CT_BUILD_OUTPUT:out,VERCEL_OBSERVABILITY_CLIENT_CONFIG:'{}'}});
 for(const env of ['preview','production','development']){
  const run=build(env);assert.equal(run.status,0,run.stderr);
  const actual=[];function walk(dir,prefix=''){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const name=prefix+item.name;item.isDirectory()?walk(path.join(dir,item.name),name+'/'):actual.push(name);}}walk(out);
  assert.deepEqual(actual.sort(),[...files].sort());
  const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(out,'assets/backend-config.js'),'utf8'),sandbox);
  assert.equal(sandbox.window.CleanTimeBackend.environment,env);
  if(env!=='production'){assert.equal(sandbox.window.CleanTimeBackend.url,null);assert.equal(sandbox.window.CleanTimeBackend.key,null);assert.equal(sandbox.window.CleanTimeBackend.backupDisabled,true);}
  for(const file of files.filter(f=>!['index.html','about/index.html','privacy/index.html','assets/backend-config.js','service-worker.js'].includes(f)))assert.deepEqual(fs.readFileSync(path.join(out,file)),fs.readFileSync(path.join(root,file)),file);
 }
 write(out,'assets/old-private.json','synthetic');assert.match(build('preview').stderr,/Unexpected build output/);fs.unlinkSync(path.join(out,'assets/old-private.json'));
 fs.unlinkSync(path.join(repo,'assets/gong.wav'));fs.symlinkSync(path.join(root,'assets/gong.wav'),path.join(repo,'assets/gong.wav'));
 assert.match(build('preview').stderr,/must not be a symlink/);
});
test('retired live runner stops before requiring browser tooling or making requests',()=>{
 const run=spawnSync(process.execPath,['tests/live/staging.js'],{cwd:root,encoding:'utf8'});
 assert.notEqual(run.status,0);assert.match(run.stderr,/Retired staging runner/);
});
