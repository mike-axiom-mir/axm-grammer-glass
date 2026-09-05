(function(root,factory){
  const api=factory(
    (typeof require==='function'?(()=>{try{return require('./playground-core.js')}catch{return null}})():null)||root.AXMGrammarGlassPlaygroundCore
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AXMGrammarGlassFrameStewardCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){
  'use strict';

  const SCHEMA='axm.code.grammar-glass-local-frame-pulse.v1';
  function need(){if(!Base||typeof Base.sha256!=='function')throw new Error('GRAMMAR_GLASS_FRAME_STEWARD_HASH_REQUIRED');return Base}
  function finite(xs){return(Array.isArray(xs)?xs:[]).map(Number).filter(v=>Number.isFinite(v)&&v>0)}
  function round(v){return Number((Number(v)||0).toFixed(2))}
  function percentile(sorted,p){if(!sorted.length)return null;return round(sorted[Math.max(0,Math.min(sorted.length-1,Math.ceil(sorted.length*p)-1))])}
  function binding(snapshot){return snapshot?{
    schema:snapshot.schema||null,
    version:snapshot.version||null,
    rootSeed:snapshot.rootSeed||null,
    sourceSha256:snapshot.sourceSha256||null,
    profileSnapshotSha256:snapshot.profileSnapshotSha256||null,
    cycleSha256:snapshot.cycle?.cycleSha256||null,
    atomCount:Array.isArray(snapshot.cycle?.atoms)?snapshot.cycle.atoms.length:0
  }:null}
  function createPulseReceipt(input={}){
    const B=need(),frames=finite(input.frameIntervalsMs).sort((a,b)=>a-b),loaf=finite(input.longFrameDurationsMs).sort((a,b)=>a-b),over50=frames.filter(v=>v>50);
    const layerState=input.layerState||{},observedAt=String(input.observedAt||new Date().toISOString()),durationMs=Math.max(0,Math.round(Number(input.durationMs)||0));
    const metrics={
      sampleCount:frames.length,
      p50FrameMs:percentile(frames,.5),
      p95FrameMs:percentile(frames,.95),
      maxFrameMs:frames.length?round(frames[frames.length-1]):null,
      framesOver50Ms:over50.length,
      longAnimationFrameCount:loaf.length,
      maxLongAnimationFrameMs:loaf.length?round(loaf[loaf.length-1]):null,
      registeredLayerCount:Number(layerState.registeredLayerCount)||0,
      activeLayerCount:Number(layerState.activeLayerCount)||0,
      continuousLayerCount:Number(layerState.continuousLayerCount)||0
    };
    const core={
      schema:SCHEMA,
      version:'1.0.0',
      result:frames.length?'LOCAL_FRAME_PULSE_OBSERVED':'LOCAL_FRAME_PULSE_HELD_NO_FRAME_SAMPLES',
      observedAt,
      durationMs,
      snapshotBinding:binding(input.snapshot),
      metrics,
      layerState:{
        activeLayerIds:[...(layerState.activeLayerIds||[])].map(String).sort(),
        sleepingLayerIds:[...(layerState.sleepingLayerIds||[])].map(String).sort()
      },
      discoveryBoundary:{
        seededCombinationExplorationPreserved:true,
        replayableByRootSeedAndRoll:true,
        visualFrameCadenceChoosesCombinations:false,
        unfamiliarCombinationState:'UNASSESSED',
        candidateConstructionState:'NOT_PERFORMED_BY_PULSE_CHECK'
      },
      truth:{
        localRuntimeObservationOnly:true,
        telemetrySent:false,
        pulseCreatesEvidenceAboutCodeCorrectness:false,
        pulseRanksGrammarCombinations:false,
        automaticRenderTierChange:false,
        recordedSnapshotMutation:false,
        authority:'NONE'
      }
    };
    return Object.freeze({...core,pulseReceiptSha256:B.sha256(core)});
  }

  return Object.freeze({SCHEMA,createPulseReceipt});
});
