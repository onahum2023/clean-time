// Dependency-free guard for current tracked files; this is not a history scanner.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const template=name=>/^\.env\.(example|sample|template)$/.test(name);
function privatePath(file){
 const parts=file.split('/'),name=parts.at(-1);
 // Real exports must never be placed in this explicitly synthetic fixture tree.
 if(file.startsWith('tests/fixtures/'))return false;
 if(parts.some(part=>['.git','.claude','.codex','.agents','.direnv','.auth','.playwright-mcp','.vercel','browser-profile','browser-profiles','playwright-report','test-results','qa-artifacts','screenshots','recordings','coverage','dist'].includes(part)))return true;
 return (!template(name)&&/^\.env(?:\.|$)/.test(name))||['.envrc','.mcp.json','.DS_Store','Thumbs.db','desktop.ini'].includes(name)||/storage[-_]?state.*\.json$|auth[-_]?state.*\.json$/i.test(name)||/^(?:clean-?time-|recovery-(?:export|data)).*\.json$/i.test(name)||/\.(?:db|sqlite3?)(?:-.*)?$|\.log$|\.swp$|~$/.test(name);
}
function credentialLike(content){
 if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sb_secret_[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16}|xox[baprs]-[A-Za-z0-9-]{20,})\b/.test(content))return true;
 for(const token of content.match(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g)||[]){
  try{if(JSON.parse(Buffer.from(token.split('.')[1],'base64url')).role==='service_role')return true;}catch{}
 }
 return false;
}
function recoveryExport(file,content){
 if(!file.endsWith('.json')||file.startsWith('tests/fixtures/'))return false;
 try{
  const value=JSON.parse(content);
  return value?.format==='clean-time-recovery'||!!(value?.date&&['journal','gratitude','dailyPlan','inventory'].some(key=>Object.hasOwn(value,key)));
 }catch{return false;}
}
function checkRepository(repoRoot=root){
 const files=execFileSync('git',['ls-files','-z','--cached'],{cwd:repoRoot,encoding:'utf8'}).split('\0').filter(Boolean),failures=[];
 for(const file of files){
  if(privatePath(file)){failures.push(file+': private/local artifact is tracked; remove it from the index');continue;}
  const full=path.join(repoRoot,file);
  if(!fs.existsSync(full))continue;
  if(fs.lstatSync(full).isSymbolicLink()){failures.push(file+': tracked symlinks require review and are not allowed');continue;}
  const content=fs.readFileSync(full,'utf8');
  if(credentialLike(content))failures.push(file+': possible privileged credential; remove it and investigate without printing its value');
  if(recoveryExport(file,content))failures.push(file+': recovery export/state is not allowed; keep real data outside Git and use tests/fixtures only for reviewed synthetic fixtures');
 }
 if(failures.length)throw Error('Repository hygiene failed:\n'+failures.join('\n'));
 console.log('Repository hygiene: '+files.length+' tracked paths checked; no blocked artifacts or credential signatures');
}
if(require.main===module)checkRepository();
module.exports={privatePath,credentialLike,recoveryExport,checkRepository};
