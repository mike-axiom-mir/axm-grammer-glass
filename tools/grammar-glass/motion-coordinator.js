(()=>{'use strict';
const nativeRAF=window.requestAnimationFrame.bind(window),nativeCAF=window.cancelAnimationFrame.bind(window);let fake=-1,paused=false,blocked=new Map(),resumed=new Map();
const dbg=window.__GRAMMAR_GLASS_MOTION_COORDINATOR__={installed:true,paused:false,reason:'RUNNING',blockedFrameCount:0,resumeCount:0,motionControlCreatesEvidence:false,authority:'NONE'};
function manualPaused(){const b=document.getElementById('motionToggle');return!!(b&&(b.getAttribute('aria-pressed')==='false'||b.textContent.trim()==='PLAY'))}
function reason(){if(document.hidden)return'DOCUMENT_HIDDEN';if(manualPaused())return'MANUAL_PAUSE';return'RUNNING'}
function shouldPause(){return reason()!=='RUNNING'}
window.requestAnimationFrame=function(cb){if(typeof cb!=='function')return nativeRAF(cb);if(shouldPause()){const id=fake--;blocked.set(id,cb);dbg.blockedFrameCount=blocked.size;return id}return nativeRAF(cb)};
window.cancelAnimationFrame=function(id){if(blocked.delete(id)){dbg.blockedFrameCount=blocked.size;return}const resumedId=resumed.get(id);if(resumedId!=null){nativeCAF(resumedId);resumed.delete(id);return}nativeCAF(id)};
function sync(){const next=shouldPause(),why=reason();if(next===paused){dbg.reason=why;dbg.paused=next;return}paused=next;dbg.paused=paused;dbg.reason=why;if(!paused&&blocked.size){const pending=[...blocked.entries()];blocked.clear();dbg.blockedFrameCount=0;for(const[id,cb]of pending){const real=nativeRAF(ts=>{resumed.delete(id);cb(ts)});resumed.set(id,real)}dbg.resumeCount++}}
const motion=document.getElementById('motionToggle');if(motion)motion.addEventListener('click',()=>setTimeout(sync,0));document.addEventListener('visibilitychange',sync);window.addEventListener('pageshow',sync);window.addEventListener('pagehide',sync);setTimeout(sync,0);
window.AXMGrammarGlassMotionCoordinator=Object.freeze({sync,getState:()=>({...dbg,blockedFrameCount:blocked.size}),contract:Object.freeze({visualFramesOnly:true,motionControlCreatesEvidence:false,recordedStateMutation:false,authority:'NONE'})});
})();
