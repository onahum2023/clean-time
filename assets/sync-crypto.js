/* Cloud envelope v1. Local working state is unchanged. No network or logging here. */
'use strict';
window.SyncCrypto=(()=>{
  const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
  const iterations=600000;
  const random=n=>crypto.getRandomValues(new Uint8Array(n));
  const b64=bytes=>{let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s);};
  function bytes(s,n){
    if(typeof s!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw new Error('Invalid envelope');
    const a=Uint8Array.from(atob(s),c=>c.charCodeAt(0));if(n&&a.length!==n)throw new Error('Invalid envelope');return a;
  }
  const keys=(o,list)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===list.split(',').sort().join(',');
  const isEnvelope=d=>!!(d&&['v','alg','ciphertext','wrappedKey','wrapIv','kdf'].some(k=>Object.hasOwn(d,k)));
  function validate(e){
    if(!keys(e,'v,alg,iv,ciphertext,wrappedKey,wrapIv,kdf')||e.v!==1||e.alg!=='A256GCM'||!keys(e.kdf,'name,hash,iterations,salt')||e.kdf.name!=='PBKDF2'||e.kdf.hash!=='SHA-256'||e.kdf.iterations!==iterations)throw new Error('Unsupported envelope');
    bytes(e.iv,12);if(bytes(e.ciphertext).length<16)throw new Error('Invalid envelope');bytes(e.wrappedKey,48);bytes(e.wrapIv,12);bytes(e.kdf.salt,16);
  }
  function wrapper(e){return {wrappedKey:e.wrappedKey,wrapIv:e.wrapIv,kdf:{...e.kdf}};}
  const sameWrapper=(a,b)=>a&&b&&a.wrappedKey===b.wrappedKey&&a.wrapIv===b.wrapIv&&a.kdf?.salt===b.kdf?.salt&&a.kdf?.iterations===b.kdf?.iterations&&a.kdf?.hash===b.kdf?.hash&&a.kdf?.name===b.kdf?.name;
  const aad=(kind,uid,t='')=>enc.encode(JSON.stringify(['clean-time',1,'A256GCM',kind,uid,kind==='state'?new Date(t).toISOString():t]));
  async function importDek(raw){return crypto.subtle.importKey('raw',bytes(raw,32),{name:'AES-GCM'},false,['encrypt','decrypt']);}
  async function kek(recovery,kdf){
    const value=recovery.replace(/[\s-]/g,'').toUpperCase();
    if(!/^[0-9A-F]{64}$/.test(value))throw new Error('Recovery key required');
    const raw=Uint8Array.from(value.match(/../g),x=>parseInt(x,16));
    const base=await crypto.subtle.importKey('raw',raw,'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(kdf.salt,16),iterations:kdf.iterations,hash:kdf.hash},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function create(uid){
    const dek=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
    const raw=await crypto.subtle.exportKey('raw',dek);
    const recovery=Array.from(random(32),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase().match(/.{8}/g).join('-');
    const kdf={name:'PBKDF2',hash:'SHA-256',iterations,salt:b64(random(16))},iv=random(12);
    const wrapped=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad('dek',uid),tagLength:128},await kek(recovery,kdf),raw);
    const material={uid,raw:b64(raw),wrappedKey:b64(wrapped),wrapIv:b64(iv),kdf};
    return {recovery,material,key:await importDek(material.raw)};
  }
  async function unlock(e,recovery,uid,t){
    validate(e);
    const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(e.wrapIv,12),additionalData:aad('dek',uid),tagLength:128},await kek(recovery,e.kdf),bytes(e.wrappedKey,48));
    const material={uid,raw:b64(raw),...wrapper(e)},key=await importDek(material.raw);
    // Authenticate the payload as well before trusting or storing any key.
    await decrypt(e,key,uid,t);return {material,key};
  }
  async function encrypt(state,key,material,uid,t){
    const iv=random(12);
    const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad('state',uid,t),tagLength:128},key,enc.encode(JSON.stringify(state)));
    return {v:1,alg:'A256GCM',iv:b64(iv),ciphertext:b64(ciphertext),...wrapper(material)};
  }
  async function decrypt(e,key,uid,t){
    validate(e);
    const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(e.iv,12),additionalData:aad('state',uid,t),tagLength:128},key,bytes(e.ciphertext));
    const state=JSON.parse(dec.decode(raw));
    if(!state||typeof state!=='object'||Array.isArray(state)||state.updatedAt!==Date.parse(t))throw new Error('Invalid state');
    return state;
  }
  return {isEnvelope,validate,sameWrapper,create,unlock,encrypt,decrypt,importDek};
})();
