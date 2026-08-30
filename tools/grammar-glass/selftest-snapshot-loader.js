'use strict';
const assert=require('assert'),Loader=require('./snapshot-loader-core.js');
(async()=>{
  Loader.resetForTest();
  let reads=0;
  const file={size:42,text:async()=>{reads++;await Promise.resolve();return'{"schema":"example","value":7}'}};
  const parsed=await Promise.all(Array.from({length:10},()=>Loader.parse(file)));
  assert.strictEqual(reads,1);
  assert(parsed.every(value=>value===parsed[0]));
  assert.strictEqual(parsed[0].value,7);
  const state=Loader.getState();
  assert.strictEqual(state.parseRequestCount,10);
  assert.strictEqual(state.physicalReadCount,1);
  assert.strictEqual(state.cacheHitCount,9);
  assert.strictEqual(state.parseSuccessCount,1);
  assert.strictEqual(state.lastFileBytes,42);
  assert.strictEqual(Loader.contract.recordedEvidenceMutation,false);
  console.log(JSON.stringify({ok:true,reads,requests:state.parseRequestCount,cacheHits:state.cacheHitCount,authority:Loader.contract.authority},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
