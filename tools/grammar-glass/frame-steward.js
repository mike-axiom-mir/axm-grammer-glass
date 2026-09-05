(()=>{'use strict';
const layers=new Map();let raf=0,observation=null,observationTimer=null,lastFrameAt=0;
const dbg=window.__GRAMMAR_GLASS_FRAME_STEWARD__={installed:true,registeredLayerCount:0,activeLayerCount:0,continuousLayerCount:0,sleepingLayerCount:0,centralFrameCount:0,drawCallCount:0,lastFrameAt:0,lastLayerError:null,observationActive:false,visualSchedulingCreatesEvidence:false,seededExplorationIndependentOfFrameCadence:true,authority:'NONE'};
function state(){const all=[...layers.values()],active=all.filter(x=>x.active);return{...dbg,registeredLayerCount:all.length,activeLayerCount:active.length,continuousLayerCount:active.filter(x=>x.mode==='CONTINUOUS').length,sleepingLayerCount:all.length-active.length,activeLayerIds:active.map(x=>x.id).sort(),sleepingLayerIds:all.filter(x=>!x.active).map(x=>x.id).sort()}}
function sync(){Object.assign(dbg,state())}
function hasWork(){return!!observation||[...layers.values()].some(x=>x.active&&(x.mode==='CONTINUOUS'||x.dirty))}
function schedule(){if(!raf&&hasWork())raf=requestAnimationFrame(tick)}
function tick(now){raf=0;dbg.centralFrameCount++;dbg.lastFrameAt=now;if(observation&&lastFrameAt){const delta=now-lastFrameAt;if(Number.isFinite(delta)&&delta>0)observation.frameIntervalsMs.push(delta)}lastFrameAt=now;for(const layer of layers.values()){if(!layer.active||(layer.mode!=='CONTINUOUS'&&!layer.dirty))continue;layer.dirty=false;try{layer.draw(now);layer.drawCount++;dbg.drawCallCount++;if(layer.mode==='ON_DEMAND'&&!layer.dirty)layer.active=false}catch(error){layer.active=false;layer.lastError=String(error&&error.message||error);dbg.lastLayerError=`${layer.id}:${layer.lastError}`}}sync();schedule()}
function registerLayer(id,{mode='ON_DEMAND',draw}={}){id=String(id||'').trim();if(!id)throw new Error('GRAMMAR_GLASS_FRAME_LAYER_ID_REQUIRED');if(typeof draw!=='function')throw new Error(`GRAMMAR_GLASS_FRAME_LAYER_DRAW_REQUIRED:${id}`);if(layers.has(id))throw new Error(`GRAMMAR_GLASS_FRAME_LAYER_ALREADY_REGISTERED:${id}`);const layer={id,mode:mode==='CONTINUOUS'?'CONTINUOUS':'ON_DEMAND',draw,active:false,dirty:false,drawCount:0,lastError:null};layers.set(id,layer);sync();return Object.freeze({
  activate(){layer.active=true;layer.dirty=true;sync();schedule()},
  deactivate(){layer.active=false;layer.dirty=false;sync()},
  invalidate(){layer.active=true;layer.dirty=true;sync();schedule()},
  sleep(){layer.active=false;layer.dirty=false;sync()},
  getState:()=>({...layer})
})}
function observe(durationMs=5000){durationMs=Math.max(1000,Math.min(15000,Math.round(Number(durationMs)||5000)));if(observation)return Promise.reject(new Error('GRAMMAR_GLASS_FRAME_OBSERVATION_ALREADY_ACTIVE'));observation={startedAt:performance.now(),frameIntervalsMs:[]};dbg.observationActive=true;lastFrameAt=0;sync();schedule();return new Promise(resolve=>{observationTimer=setTimeout(()=>{const finished=observation;observation=null;observationTimer=null;dbg.observationActive=false;lastFrameAt=0;sync();resolve({observedAt:new Date().toISOString(),durationMs,frameIntervalsMs:[...finished.frameIntervalsMs],layerState:state()})},durationMs)})}
function cancelObservation(){if(!observation)return false;clearTimeout(observationTimer);observationTimer=null;observation=null;dbg.observationActive=false;lastFrameAt=0;sync();return true}
window.AXMGrammarGlassFrameSteward=Object.freeze({registerLayer,observe,cancelObservation,getState:state,contract:Object.freeze({oneCentralAnimationScheduler:true,inactiveLayersSleep:true,visualSchedulingCreatesEvidence:false,seededExplorationIndependentOfFrameCadence:true,recordedStateMutation:false,authority:'NONE'})});sync();
})();
