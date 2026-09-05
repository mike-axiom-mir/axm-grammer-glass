(()=>{'use strict';
const root=typeof window!=='undefined'?window:globalThis;
const Base=(typeof require==='function'?(()=>{try{return require('./playground-core.js')}catch{return null}})():null)||root.AXMGrammarGlassPlaygroundCore;
const SCHEMA='axm.code.grammar-glass-workbench-handoff.v1';
function need(){if(!Base)throw Error('GRAMMAR_GLASS_WORKBENCH_CORE_REQUIRED');return Base}
function uniq(xs){return[...new Set((Array.isArray(xs)?xs:[]).map(v=>String(v||'')).filter(Boolean))].sort()}
function bool(v){return v===true}
function digest(v){return typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)?v:null}
function createHandoff(input={}){
 const B=need(),visual=input.visualPlan||null,binding=input.overlayBinding||null,ripple=input.rippleReceipt||null,evolution=input.evolutionState||{},rippleState=input.rippleState||{},ghost=input.ghostState||{},motion=input.motionState||{};
 const selected=uniq(evolution.selectedLensIds||visual?.selectedLensIds||[]),comparisonSha=digest(visual?.comparisonSha256||evolution.generationComparisonSha256||null),rippleComparison=digest(ripple?.sourceBinding?.generationComparisonSha256||rippleState.comparisonSha256||null),activeLens=String(rippleState.activeLensId||ripple?.origin?.lensId||'')||null;
 const glassBinding=binding?.glassBinding||ripple?.sourceBinding?.glass||null;
 const checks={
  glassLoaded:bool(input.glassLoaded)||!!glassBinding,
  grammar102PrimaryLoaded:bool(evolution.primaryLoaded),
  grammar102GhostLoaded:bool(evolution.ghostLoaded),
  comparisonReady:!!comparisonSha,
  lensSelected:selected.length>0,
  rippleReady:ripple?.result==='GRAMMAR_102_CHANGE_RIPPLE_READY_STRUCTURAL_CONTACT_ONLY',
  rippleComparisonCurrent:!rippleComparison||!comparisonSha||rippleComparison===comparisonSha,
  rippleLensStillSelected:!activeLens||!selected.length||selected.includes(activeLens),
  documentVisible:input.documentVisible!==false,
  motionEnabled:motion.motionEnabled!==false
 };
 const staleReasons=[];if(!checks.rippleComparisonCurrent)staleReasons.push('RIPPLE_COMPARISON_STALE');if(!checks.rippleLensStillSelected)staleReasons.push('RIPPLE_LENS_NO_LONGER_SELECTED');
 const stages=[
  {stage:'LOAD_GLASS',state:checks.glassLoaded?'READY':'WAIT'},
  {stage:'LOAD_102_A',state:checks.grammar102PrimaryLoaded?'READY':'WAIT'},
  {stage:'LOAD_102_B',state:checks.grammar102GhostLoaded?'READY':'WAIT'},
  {stage:'SELECT_LENS',state:checks.lensSelected?'READY':'WAIT'},
  {stage:'COMPARE',state:checks.comparisonReady?'READY':'WAIT'},
  {stage:'TRACE_RIPPLE',state:checks.rippleReady?'READY':(checks.comparisonReady&&checks.lensSelected?'AVAILABLE':'WAIT')}
 ];
 const readiness=staleReasons.length?'HELD_STALE_VIEW_STATE':(checks.glassLoaded&&checks.grammar102PrimaryLoaded&&checks.grammar102GhostLoaded&&checks.lensSelected&&checks.comparisonReady?'WORKBENCH_READY':'WORKBENCH_PARTIAL');
 const core={schema:SCHEMA,version:'1.0.0',result:readiness,bindings:{glass:glassBinding,primary:visual?.primaryBinding||null,ghost:visual?.ghostBinding||null,generationComparisonSha256:comparisonSha,rippleSha256:digest(ripple?.changeRippleSha256||null)},selection:{selectedLensIds:selected,activeRippleLensId:activeLens,activeRippleItemId:rippleState.activeItemId||ripple?.origin?.itemId||null,rippleDepth:Number(rippleState.depth||0)||null,ghostBlend:Number(evolution.blend??ghost.blend??0.5)},health:{checks,staleReasons,stages},counts:{changedLayerCount:Number(visual?.changedLayerCount||evolution.changedLayerCount||0),renderedMarkCount:Number(visual?.totalRenderedMarks||0),availableChangeCount:Number(rippleState.changeCount||0)},runtime:{documentVisible:checks.documentVisible,motionEnabled:checks.motionEnabled},truth:{handoffCreatesEvidence:false,handoffMutatesGlass:false,handoffMutates102Grammar:false,handoffActivatesCapability:false,staleStateMayBeClearedByViewer:true,readinessIsNotCorrectness:true,readinessIsNotQuality:true,structuralContactNotCausalProof:true,darkGrammarContactIsNotResolution:true,automaticReentry:false,rankingPerformed:false,winnerSelected:false,authority:'NONE'}};
 return Object.freeze({...core,handoffSha256:B.sha256(core)});
}
const api=Object.freeze({SCHEMA,createHandoff,contract:Object.freeze({viewerStateOnly:true,createsEvidence:false,mutation:false,automaticReentry:false,authority:'NONE'})});if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.AXMGrammarGlassWorkbenchCore=api;
})();
