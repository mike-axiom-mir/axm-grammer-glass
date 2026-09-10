(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.AXMGrammarGlassConstructionHandExperienceCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const TERMINAL=new Set(['PASS_OBSERVED','FAIL_OBSERVED','CRASH_OBSERVED','TIMEOUT_OBSERVED']);
 function project(input={}){
  const hasProbe=input.hasProbe===true,exactPlan=input.exactPlan===true,prepared=input.preparationResult==='DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN',hasBuild=input.hasBuild===true,state=input.executorState||'EMPTY',terminal=input.terminalState||null,sourceHeld=input.sourceHeld===true;
  let phase='WAITING_FOR_ROLL',label='ROLL + PREPARE ABOVE',detail='Choose a recorded roll, then prepare it in Discovery Kiln. Construction stays idle until an exact plan is bound.',nextControlId=null;
  if(hasProbe&&!exactPlan){phase='HELD_NO_EXACT_PLAN';label='NO EXACT PLAN';detail='This combination is outside the recorded construction field. Choose a covered roll or another recorded combination; no renderer will be guessed.'}
  else if(hasProbe&&exactPlan&&!prepared){phase='READY_TO_PREPARE';label='PREPARE ABOVE';detail='An exact source-free plan exists. Prepare the candidate in Discovery Kiln to bind that exact plan before source bytes can be exposed.'}
  else if(prepared&&!hasBuild&&!sourceHeld){phase='READY_TO_BUILD';label='BUILD SOURCE';detail='Replay the exact recorded plan and expose its verified source bytes as text only. Building is not execution.';nextControlId='constructionBuild'}
  else if(hasBuild&&['EMPTY','SOURCE_RELEASED'].includes(state)){phase='READY_TO_ARM';label='ARM SOURCE';detail='The exact source preview is ready. Arm creates the isolated one-run sandbox placeholder but does not load or execute the candidate.';nextControlId='constructionArm'}
  else if(state==='SOURCE_BUILT'){phase='ARMING';label='ARMING SANDBOX';detail='The verified source is being bound to the isolated one-run sandbox. No execution has started.'}
  else if(state==='EXECUTION_READY'){phase='READY_TO_RUN';label='RUN SOURCE ONCE';detail='The sandbox is armed. Run loads these exact transient bytes once and waits for a bounded runtime receipt.';nextControlId='constructionRun'}
  else if(state==='RUNNING'){phase='RUNNING';label='WAIT FOR RECEIPT';detail='The single explicit attempt is running. Wait for PASS / FAIL / CRASH / TIMEOUT, or release the source to abandon the attempt without inventing a result.'}
  else if(terminal||TERMINAL.has(state)||state==='RESULT_SEALED'){
   const outcome=(terminal||state).replaceAll('_',' ');phase='RECEIPT_SEALED';label='RELEASE SOURCE';detail=`${outcome} is sealed as evidence only. Inspect the receipt, then release transient source before another explicit build.`;nextControlId='constructionRelease';
  }
  else if(state==='SOURCE_RELEASED'){phase='READY_TO_BUILD';label='BUILD SOURCE';detail='Transient source has been released. The exact prepared plan remains available for a new explicit build.';nextControlId='constructionBuild'}
  const progressed={build:hasBuild||sourceHeld||!['EMPTY','SOURCE_RELEASED'].includes(state),arm:['SOURCE_BUILT','EXECUTION_READY','RUNNING','RESULT_SEALED'].includes(state)||!!terminal||TERMINAL.has(state),run:state==='RUNNING'||state==='RESULT_SEALED'||!!terminal||TERMINAL.has(state),release:state==='SOURCE_RELEASED'};
  const nextKey=nextControlId?.replace('construction','').toLowerCase()||null;
  const enabled={build:prepared&&exactPlan&&!hasBuild&&!sourceHeld,arm:hasBuild&&['EMPTY','SOURCE_RELEASED'].includes(state),run:state==='EXECUTION_READY',release:sourceHeld||hasBuild};
  const stages=['build','arm','run','release'].map((key,index)=>({
   key,index:index+1,label:key==='run'?'RUN ONCE':key.toUpperCase(),state:progressed[key]?'DONE':nextKey===key?'READY':enabled[key]?'AVAILABLE':phase.startsWith('HELD')?'HELD':'WAIT'
  }));
  return Object.freeze({phase,label,detail,nextControlId,stages:Object.freeze(stages),automaticAdvance:false,executionAuthorityAdded:false});
 }
 return Object.freeze({project});
});

(()=>{'use strict';
if(typeof window==='undefined')return;
const Core=window.AXMGrammarGlassConstructionHandCore,Executor=window.AXMGrammarGlassConstructionExecutor,Experience=window.AXMGrammarGlassConstructionHandExperienceCore,$=id=>document.getElementById(id);
if(!Core||!Executor||!Experience)return;
let snapshot=null,probe=null,build=null,unsub=null;
const dbg=window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__={loaded:true,availability:'WAITING_FOR_EXACT_PLAN',fieldBundleCount:0,fieldHeldRollCount:0,currentRoll:null,buildState:'EMPTY',executorState:'EMPTY',sourcePreviewed:false,sourcePersisted:false,executionOccurred:false,lastReceiptSha256:null,automaticPromotion:false,experiencePhase:'WAITING_FOR_ROLL',nextAction:'ROLL + PREPARE ABOVE'};
const short=(value,length=12)=>value?String(value).slice(0,length)+'…':'—';
function preparation(){return window.AXMGrammarGlassDiscoveryKiln?.getPreparation?.()||null}
function bundle(){return snapshot&&probe?Core.findBundle(snapshot,probe):null}
function ensureExperience(){
 if($('constructionFlow'))return;
 const actions=document.querySelector('.construction-actions');if(!actions)return;
 const flow=document.createElement('div');flow.className='construction-flow';flow.id='constructionFlow';flow.dataset.phase='WAITING_FOR_ROLL';
 flow.innerHTML='<div class="construction-next" role="status" aria-live="polite" aria-atomic="true"><span>NEXT EXPLICIT ACTION</span><b id="constructionNextLabel">ROLL + PREPARE ABOVE</b><small id="constructionNextDetail">Choose a recorded roll, then prepare it in Discovery Kiln. Construction stays idle until an exact plan is bound.</small></div><div class="construction-step-rail" id="constructionStepRail" aria-label="Construction Hand explicit action sequence"><div class="construction-step" data-step="build" data-state="WAIT"><i></i><b>1 · BUILD</b><small>WAIT</small></div><div class="construction-step" data-step="arm" data-state="WAIT"><i></i><b>2 · ARM</b><small>WAIT</small></div><div class="construction-step" data-step="run" data-state="WAIT"><i></i><b>3 · RUN ONCE</b><small>WAIT</small></div><div class="construction-step" data-step="release" data-state="WAIT"><i></i><b>4 · RELEASE</b><small>WAIT</small></div></div>';
 actions.parentNode.insertBefore(flow,actions);
 for(const id of ['constructionBuild','constructionArm','constructionRun','constructionRelease'])$(id)?.setAttribute('aria-describedby','constructionNextDetail');
}
function renderExperience(view){
 ensureExperience();const flow=$('constructionFlow'),label=$('constructionNextLabel'),detail=$('constructionNextDetail');
 if(flow)flow.dataset.phase=view.phase;if(label)label.textContent=view.label;if(detail)detail.textContent=view.detail;
 for(const stage of view.stages){const node=document.querySelector(`.construction-step[data-step="${stage.key}"]`);if(!node)continue;node.dataset.state=stage.state;const state=node.querySelector('small');if(state)state.textContent=stage.state}
 for(const id of ['constructionBuild','constructionArm','constructionRun','constructionRelease']){const button=$(id);if(!button)continue;button.classList.toggle('is-next',id===view.nextControlId);if(id===view.nextControlId)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')}
 dbg.experiencePhase=view.phase;dbg.nextAction=view.label;
}
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
 renderExperience(Experience.project({hasProbe:!!probe,exactPlan:!!exact,preparationResult:prep?.result||null,hasBuild:!!build,executorState:state.state,terminalState:state.terminalState,sourceHeld:state.sourceHeld}));
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
 ensureExperience();$('constructionBuild')?.addEventListener('click',buildSource);$('constructionArm')?.addEventListener('click',arm);$('constructionRun')?.addEventListener('click',run);$('constructionRelease')?.addEventListener('click',release);
 addEventListener('axm:grammar-glass-snapshot-loaded',event=>{snapshot=event.detail?.snapshot||null;probe=null;reset()});
 addEventListener('axm:grammar-glass-probe-changed',event=>{probe=event.detail?.probe||null;reset()});
 addEventListener('axm:grammar-glass-discovery-prepared',render);
 unsub=Executor.on(event=>{if(['PASS_OBSERVED','FAIL_OBSERVED','CRASH_OBSERVED','TIMEOUT_OBSERVED'].includes(event.state)&&event.detail?.receipt)dispatchEvent(new CustomEvent('axm:grammar-glass-construction-runtime',{detail:{receipt:event.detail.receipt,state:event.state}}));render()});
 if(window.GRAMMAR_GLASS_SNAPSHOT)snapshot=window.GRAMMAR_GLASS_SNAPSHOT;render()
}
window.AXMGrammarGlassConstructionHand=Object.freeze({getBuild:()=>build,getState:()=>({...dbg}),destroy:()=>unsub?.(),contract:Object.freeze({exactPrecomputedPlansOnly:true,sourceBuiltTransiently:true,explicitArmAndRunOnce:true,automaticRepeat:false,automaticPromotion:false,experienceGuidanceCreatesAuthority:false})});setup();
})();
