(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AXMGrammarGlassSnapshotLoader=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  let cache=new WeakMap();
  const state={
    parseRequestCount:0,
    physicalReadCount:0,
    cacheHitCount:0,
    parseSuccessCount:0,
    parseErrorCount:0,
    lastFileBytes:0,
    fileCacheChangesEvidence:false,
    authority:'NONE'
  };

  function parse(file){
    state.parseRequestCount++;
    if(!file||typeof file.text!=='function')return Promise.reject(new Error('GRAMMAR_GLASS_FILE_TEXT_READER_REQUIRED'));
    if(cache.has(file)){
      state.cacheHitCount++;
      return cache.get(file);
    }
    state.physicalReadCount++;
    state.lastFileBytes=Number(file.size)||0;
    const pending=Promise.resolve()
      .then(()=>file.text())
      .then(text=>{
        const parsed=JSON.parse(text);
        state.parseSuccessCount++;
        return parsed;
      })
      .catch(error=>{
        cache.delete(file);
        state.parseErrorCount++;
        throw error;
      });
    cache.set(file,pending);
    return pending;
  }

  function resetForTest(){
    cache=new WeakMap();
    for(const key of Object.keys(state)){
      if(typeof state[key]==='number')state[key]=0;
    }
  }

  return Object.freeze({
    parse,
    getState:()=>Object.freeze({...state}),
    resetForTest,
    contract:Object.freeze({
      onePhysicalReadPerFileObject:true,
      parsedSnapshotMutation:false,
      recordedEvidenceMutation:false,
      fileCacheChangesEvidence:false,
      authority:'NONE'
    })
  });
});
