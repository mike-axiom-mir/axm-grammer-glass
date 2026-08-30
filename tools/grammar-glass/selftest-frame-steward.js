'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const Core=require('./frame-steward-core.js');
const sha=require('./playground-core.js').sha256;

const snapshot={schema:'axm.code.grammar-glass-visual-snapshot.v1',version:'1.4.0',rootSeed:sha('seed'),sourceSha256:sha('source'),profileSnapshotSha256:sha('profiles'),cycle:{cycleSha256:sha('cycle'),atoms:[{atomId:'a1'}],edges:[]},draftSky:[]};
const input={observedAt:'2026-08-30T11:00:00.000Z',durationMs:5000,frameIntervalsMs:[16,17,60,20,40],longFrameDurationsMs:[61],snapshot,layerState:{registeredLayerCount:5,activeLayerCount:2,continuousLayerCount:2,activeLayerIds:['vessel','execution-constellation'],sleepingLayerIds:['touch-lens','playground-probe','constellation-replay']}};
const pulse=Core.createPulseReceipt(input),repeat=Core.createPulseReceipt(input),held=Core.createPulseReceipt({...input,frameIntervalsMs:[],longFrameDurationsMs:[]});
assert.deepStrictEqual(repeat,pulse);
assert.strictEqual(pulse.result,'LOCAL_FRAME_PULSE_OBSERVED');
assert.strictEqual(pulse.metrics.sampleCount,5);
assert.strictEqual(pulse.metrics.p50FrameMs,20);
assert.strictEqual(pulse.metrics.p95FrameMs,60);
assert.strictEqual(pulse.metrics.maxFrameMs,60);
assert.strictEqual(pulse.metrics.framesOver50Ms,1);
assert.strictEqual(pulse.metrics.longAnimationFrameCount,1);
assert.strictEqual(pulse.snapshotBinding.rootSeed,snapshot.rootSeed);
assert.strictEqual(pulse.discoveryBoundary.seededCombinationExplorationPreserved,true);
assert.strictEqual(pulse.discoveryBoundary.visualFrameCadenceChoosesCombinations,false);
assert.strictEqual(pulse.truth.telemetrySent,false);
assert.strictEqual(pulse.truth.automaticRenderTierChange,false);
assert.strictEqual(held.result,'LOCAL_FRAME_PULSE_HELD_NO_FRAME_SAMPLES');

let next=1;const pending=new Map();
const window={requestAnimationFrame(cb){const id=next++;pending.set(id,cb);return id},cancelAnimationFrame(id){pending.delete(id)}};window.window=window;
const context={window,performance:{now:()=>0},requestAnimationFrame:window.requestAnimationFrame,cancelAnimationFrame:window.cancelAnimationFrame,setTimeout,clearTimeout,Date,Map,Object,Promise,Error};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'frame-steward.js'),'utf8'),context);
const Steward=window.AXMGrammarGlassFrameSteward;let demandDraws=0,continuousDraws=0;
const demand=Steward.registerLayer('demand',{mode:'ON_DEMAND',draw:()=>demandDraws++});
demand.invalidate();assert.strictEqual(pending.size,1);let [id,cb]=[...pending][0];pending.delete(id);cb(16);assert.strictEqual(demandDraws,1);assert.strictEqual(pending.size,0);assert.strictEqual(demand.getState().active,false);
const continuous=Steward.registerLayer('continuous',{mode:'CONTINUOUS',draw:()=>continuousDraws++});
continuous.activate();assert.strictEqual(pending.size,1);[id,cb]=[...pending][0];pending.delete(id);cb(32);assert.strictEqual(continuousDraws,1);assert.strictEqual(pending.size,1);continuous.sleep();
for(const key of [...pending.keys()])pending.delete(key);
assert.strictEqual(Steward.getState().registeredLayerCount,2);
assert.strictEqual(Steward.contract.seededExplorationIndependentOfFrameCadence,true);

const sources=['app.js','vessel-view.js','playground.js','playground-touch.js','constellation-replay.js','execution-constellation-epp.js','change-ripple.js'].map(name=>[name,fs.readFileSync(path.join(__dirname,name),'utf8')]);
for(const[name,source]of sources)assert(!source.includes('requestAnimationFrame('),`${name} must use the central Frame Steward`);
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert(html.indexOf('motion-coordinator.js')<html.indexOf('frame-steward.js'));
assert(html.indexOf('frame-steward.js')<html.indexOf('app.js'));
assert(html.includes('pulse-check.js'));

console.log(JSON.stringify({ok:true,schema:pulse.schema,p50FrameMs:pulse.metrics.p50FrameMs,p95FrameMs:pulse.metrics.p95FrameMs,registeredLayerCount:Steward.getState().registeredLayerCount,seededExplorationIndependentOfFrameCadence:true,authority:pulse.truth.authority},null,2));
