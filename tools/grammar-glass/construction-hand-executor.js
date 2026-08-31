(()=>{'use strict';
const Core=window.AXMGrammarGlassConstructionHandExecutorCore,frame=document.getElementById('constructionFrame'),listeners=new Set();
if(!Core||!frame)return;
const placeholder=message=>`<!doctype html><html><body style="box-sizing:border-box;margin:0;min-height:100vh;display:grid;place-items:center;padding:22px;background:#030812;color:#8fa4bc;font:12px/1.5 ui-monospace,monospace;text-align:center">${String(message).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</body></html>`;
const frameAdapter={
 setSandbox(tokens){frame.setAttribute('sandbox',tokens.join(' '))},
 showArmed(){frame.srcdoc=placeholder('SOURCE ARMED · exact transient bytes held · explicit RUN SOURCE ONCE required')},
 load(sourceText){frame.srcdoc=sourceText},
 release(){frame.srcdoc=placeholder('TRANSIENT SOURCE RELEASED · digest receipt retained')}
};
const executor=Core.createExecutor();
executor.on(event=>{for(const listener of listeners){try{listener(event)}catch{}}});
addEventListener('message',event=>{if(event.source!==frame.contentWindow)return;executor.acceptObservation(event.data,{opaqueOrigin:event.origin==='null'})});
frame.setAttribute('sandbox','allow-scripts');
frame.srcdoc=placeholder('CONSTRUCTION PREVIEW · no source built or executed');
window.AXMGrammarGlassConstructionExecutor=Object.freeze({
 arm(build){return executor.arm(build,frameAdapter)},
 runOnce(){return executor.runOnce()},
 release(){return executor.release()},
 snapshot(){return executor.snapshot()},
 on(listener){listeners.add(listener);return()=>listeners.delete(listener)}
});
})();
