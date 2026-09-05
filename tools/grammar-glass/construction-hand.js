(()=>{'use strict';
const Core=window.AXMGrammarGlassConstructionHandCore,Executor=window.AXMGrammarGlassConstructionExecutor,$=id=>document.getElementById(id);
if(!Core||!Executor)return;
let snapshot=null,probe=null,build=null,unsub=null;
const dbg=window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__={loaded:true,availability:'WAITING_FOR_EXACT_PLAN',fieldBundleCount:0,fieldHeldRollCount:0,currentRoll:null,buildState:'EMPTY',executorState:'EMPTY',sourcePreviewed:false,sourcePersisted:false,executionOccurred:false,lastReceiptSha256:null,automaticPromotion:false};
const short=(value,length=12)=>value?String(value).slice(0,length)+'…':'—';
function preparation(){return window.AXMGrammarGlassDiscoveryKiln?.getPreparation?.()||null}
function bundle(){return snapshot&&probe?Core.findBundle(snapshot,probe):null}
function render(){
 const prep=preparation(),exact=bundle(),field=snapshot?Core.fieldStatus(snapshot,probe):null,state=Executor.snapshot(),status=$('constructionStatus'),readout=$('constructionReadout'),buildButton=$('constructionBuild'),armButton=$('constructionArm'),runButton=$('constructionRun'),releaseButton=$('constructionRelease');
 dbg.availability=exact?'EXACT_PLAN_AVAILABLE':probe?'UNMATCHED_COMBINATION_HELD':'WAITING_FOR_EXACT_PLAN';dbg.fieldBundleCount=field?.bundleCount||0;dbg.fieldHeldRollCount=field?.heldRollCount||0;dbg.currentRoll=probe?.roll??null;dbg.buildState=build?.result||'EMPTY';dbg.executorState=state.state;dbg.sourcePreviewed=!!build;dbg.executionOccurred=state.attempts>0;dbg.lastReceiptSha256=state.lastReceipt?.runtimeReceiptSha256||null;
 if(status)status.textContent=state.terminalState?state.terminalState.replaceAll('_',' '):state.state==='EXECUTION_READY'?'ARMED':build?'SOURCE PREVIEW':exact?'PLAN AVAILABLE':probe?'NO EXACT PLAN':'WAITING';
 if(readout){
  if(state.lastReceipt)readout.innerHTML=`<span>BOUND RECEIPT</span><b>${state.terminalState.replaceAll('_',' ')}</b><small>runtime ${short(state.lastReceipt.runtimeReceiptSha256)} · artifact ${short(state.artifactSha256)}</small>`;
  else if(build)readout.innerHTML=`<span>TRANSIENT SOURCE PREVIEW · ${build.bundle.programFamily.replaceAll('_',' ')}</span><b>${build.transientSource.byteLength} UTF-8 bytes</b><small>file ${short(build.transientSource.sha256)} · plan ${short(build.artifact.constructionPlanSha256)}</small>`;
  else if(exact)readout.innerHTML=`<span>CONSTRUCTION FIELD · ROLL ${exact.roll}</span><b>${exact.programFamily.replaceAll('_',' ')} · exact plan available</b><small>${exact.groundedAtomRefs.length} atoms · ${field.distinctProgramFamilyCount} program families · plan ${short(exact.constructionPlanSha256)}</small>`;
  else if(probe)readout.innerHTML=`<span>ROLL ${probe.roll} · OUTSIDE EXACT FIELD</span><b>HELD · NO EXACT PLAN</b><small>Recorded field covers rolls ${(field?.coveredRolls||[]).join(', ')||'none'}. No renderer is guessed.</small>`;
  else readout.innerHTML=`<span>BOUNDED CONSTRUCTION FIELD</span><b>${field?.bundleCount||0} exact plans ready</b><small>${field?.distinctProgramFamilyCount||0} program families · ${field?.distinctLanguageSetCount||0} language sets · roll to explore</small>`;
 }
 if(buildButton)buildButton.disabled=prep?.result!=='DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN'||!exact||!!build;
 if(armButton)armButton.disabled=!build||!['EMPTY','SOURCE_RELEASED'].includes(state.state);
 if(runButton)runButton.disabled=state.state!=='EXECUTION_READY';
 if(releaseButton)releaseButton.disabled=!state.sourceHeld&&!build;
 }
function showInspector(value){const node=$('inspector');if(node)node.textContent=JSON.stringify(value,null,2)}
function buildSource(){
 const prep=preparation(),exact=bundle();if(!exact||prep?.construction?.constructionBundleSha256!==exact.constructionBundleSha256)return;
 const replay=Core.build(exact);if(replay.result!=='BROWSER_CONSTRUCTION_REPLAY_VERIFIED'){showInspector({constructionReplay:replay,truth:'Source was not exposed because exact replay verification failed.'});return}
 build=replay;const preview=$('constructionSourcePreview');if(preview)preview.textContent=replay.transientSource.utf8Text;showInspector({constructionReplayReceipt:replay.replayReceipt,artifactReceipt:replay.artifact.artifactReceipt,runRequest:replay.runRequest,truth:'Exact source bytes exist only in this viewer session. Showing source is not execution, correctness, selection, promotion, or canon.'});render()
}
function arm(){if(!build)return;Executor.arm(build);render()}
function run(){Executor.runOnce();render()}
function release(){Executor.release();build=null;const preview=$('constructionSourcePreview');if(preview)preview.textContent='Transient source released. Build again from the exact plan to inspect or run it.';render()}
function reset(){if(Executor.snapshot().sourceHeld)Executor.release();build=null;const preview=$('constructionSourcePreview');if(preview)preview.textContent='No source built. Exact source bytes appear here only after BUILD SOURCE.';render()}
function setup(){
 $('constructionBuild')?.addEventListener('click',buildSource);$('constructionArm')?.addEventListener('click',arm);$('constructionRun')?.addEventListener('click',run);$('constructionRelease')?.addEventListener('click',release);
 addEventListener('axm:grammar-glass-snapshot-loaded',event=>{snapshot=event.detail?.snapshot||null;probe=null;reset()});
 addEventListener('axm:grammar-glass-probe-changed',event=>{probe=event.detail?.probe||null;reset()});
 addEventListener('axm:grammar-glass-discovery-prepared',render);
 unsub=Executor.on(event=>{if(['PASS_OBSERVED','FAIL_OBSERVED','CRASH_OBSERVED','TIMEOUT_OBSERVED'].includes(event.state)&&event.detail?.receipt)dispatchEvent(new CustomEvent('axm:grammar-glass-construction-runtime',{detail:{receipt:event.detail.receipt,state:event.state}}));render()});
 if(window.GRAMMAR_GLASS_SNAPSHOT)snapshot=window.GRAMMAR_GLASS_SNAPSHOT;render()
}
window.AXMGrammarGlassConstructionHand=Object.freeze({getBuild:()=>build,getState:()=>({...dbg}),destroy:()=>unsub?.(),contract:Object.freeze({exactPrecomputedPlansOnly:true,sourceBuiltTransiently:true,explicitArmAndRunOnce:true,automaticRepeat:false,automaticPromotion:false})});setup();
})();
