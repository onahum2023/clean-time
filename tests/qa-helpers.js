// Node-side helpers for browser QA. Keys are generated at runtime, never reported.
exports.activate=async p=>{
 await p.locator('#makeRecoveryKey').click();await p.locator('#recoveryGenerated').waitFor({state:'visible'});
 await p.locator('#recoverySaved').check();await p.locator('#activateEncryption').click();
 await p.waitForFunction(()=>document.getElementById('encryptionStatus').textContent.includes('גיבוי מוצפן פעיל')&&!JSON.parse(localStorage.getItem('cleantime-he-sync')).dirty);
};
exports.adaptMock=async c=>{
 await c.addInitScript(()=>{
  const make=window.supabase.createClient;
  window.supabase.createClient=(...args)=>{
   const client=make(...args),from=client.from.bind(client);
   client.from=(...args)=>{
    const table=from(...args);
    const write=row=>({eq(){return this;},select:async()=>{
     const result=await table.upsert(row,{onConflict:'user_id'});
     window.qaTimestamp=row.updated_at;return {...result,data:result.error?null:[{user_id:row.user_id}]};
    }});
    return {...table,update:write,insert:write};
   };
   return client;
  };
  window.qaPlain=async()=>{
   if(!window.qaRemote)return null;
   if(!window.SyncCrypto?.isEnvelope(window.qaRemote))return window.qaRemote;
   const material=JSON.parse(localStorage.getItem('cleantime-he-crypto'));return SyncCrypto.decrypt(window.qaRemote,await SyncCrypto.importDek(material.raw),material.uid,window.qaTimestamp);
  };
 });
};
