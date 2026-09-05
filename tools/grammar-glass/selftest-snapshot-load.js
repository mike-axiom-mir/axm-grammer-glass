'use strict';
const assert=require('assert'),Core=require('./snapshot-load-core.js');
const waits=new Map();
function deferred(id){return new Promise((resolve,reject)=>waits.set(id,{resolve,reject}))}
function snapshot(seed,atoms=12){return{schema:Core.SCHEMA,version:'1.4.0',rootSeed:seed,sourceSha256:seed.repeat(64).slice(0,64),profileSnapshotSha256:'a'.repeat(64),profileCount:3,cycle:{cycleSha256:'b'.repeat(64),atoms:Array.from({length:atoms},(_,i)=>({atomId:`${seed}-${i}`})),edges:[]},draftSky:[]}}
const files={slow:{id:'slow',size:200},fast:{id:'fast',size:300},bad:{id:'bad',size:10}};
const session=Core.createSession({parse:file=>file.id==='bad'?Promise.resolve({schema:'wrong'}):deferred(file.id)});
(async()=>{
  const slow=session.select(files.slow);
  const fast=session.select(files.fast);
  waits.get('fast').resolve(snapshot('f',22));
  const committed=await fast;
  assert.strictEqual(committed.result,'SNAPSHOT_SELECTION_READY');
  assert.strictEqual(committed.receipt.metrics.atomCount,22);
  assert.strictEqual(committed.receipt.truth.authority,'NONE');
  waits.get('slow').resolve(snapshot('s',44));
  const stale=await slow;
  assert.strictEqual(stale.result,'STALE_SNAPSHOT_SELECTION_HELD');
  assert.strictEqual(stale.snapshot,null);
  assert.strictEqual(stale.receipt.truth.staleSelectionCannotReplaceCurrent,true);
  const rejected=await session.select(files.bad);
  assert.strictEqual(rejected.result,'SNAPSHOT_SELECTION_HELD_INVALID');
  assert.match(rejected.receipt.error,/VALID_VISUAL_SNAPSHOT_REQUIRED/);
  assert.strictEqual(rejected.receipt.truth.invalidSelectionDoesNotClearPriorCommit,true);
  const state=session.getState();
  assert.strictEqual(state.selectionCount,3);
  assert.strictEqual(state.commitCount,1);
  assert.strictEqual(state.staleSelectionCount,1);
  assert.strictEqual(state.rejectedSelectionCount,1);
  assert.strictEqual(state.committedAtomCount,22);
  assert.strictEqual(state.committedSelectionId,2);
  assert.strictEqual(session.contract.modalErrorRequired,false);
  console.log(JSON.stringify({ok:true,selections:state.selectionCount,commits:state.commitCount,staleHeld:state.staleSelectionCount,rejectedHeld:state.rejectedSelectionCount,authority:session.contract.authority},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
