'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=require('./public-files.json');
const {privatePath}=require('./repository-hygiene.js');
function validateSource(root){
 for(const file of files){
  if(typeof file!=='string'||path.isAbsolute(file)||file.split('/').some(part=>!part||part==='.'||part==='..')||privatePath(file))throw Error('Unsafe publication manifest entry');
  let current=root;
  for(const part of file.split('/')){
   current=path.join(current,part);
   if(fs.lstatSync(current).isSymbolicLink())throw Error('Public asset must not be a symlink: '+file);
  }
  if(!fs.statSync(current).isFile())throw Error('Public asset must be a regular file: '+file);
 }
 if(new Set(files).size!==files.length)throw Error('Duplicate publication manifest entry');
}
function validateOutput(out){
 if(!fs.existsSync(out))return;
 const allowedFiles=new Set(files),allowedDirs=new Set();
 for(const file of files){let dir=path.posix.dirname(file);while(dir!=='.'){allowedDirs.add(dir);dir=path.posix.dirname(dir);}}
 function walk(dir,relative=''){
  if(fs.lstatSync(dir).isSymbolicLink())throw Error('Build output must not be a symlink');
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const name=relative?relative+'/'+entry.name:entry.name;
   if(entry.isSymbolicLink()||!(entry.isDirectory()?allowedDirs:allowedFiles).has(name))throw Error('Unexpected build output: '+name+'; use a clean dedicated build directory');
   if(entry.isDirectory())walk(path.join(dir,entry.name),name);
   else if(!entry.isFile())throw Error('Build output must contain only regular public files');
  }
 }
 walk(out);
}
module.exports={files,validateSource,validateOutput};
