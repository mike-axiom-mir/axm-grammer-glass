(()=>{'use strict';
const Core=window.AXMGrammarGlassSnapshotLoadCore,Loader=window.AXMGrammarGlassSnapshotLoader,$=id=>document.getElementById(id);if(!Core)return;
const session=Core.createSession({parse:file=>Loader?Loader.parse(file):file.text().then(JSON.parse)});
const debug=window.__GRAMMAR_GLASS_SNAPSHOT_LOAD__={installed:true,phase:'EMPTY',selectionCount:0,commitCount:0,staleSelectionCount:0,rejectedSelectionCount:0,oneValidatedPublisher:true,staleSelectionCannotReplaceCurrent:true,recordedSnapshotMutation:false,authority:'NONE'};
function sync(){Object.assign(debug,session.getState())}
function size(bytes){const n=Number(bytes)||0;return n>=1048576?`${(n/1048576).toFixed(2)} MB`:n>=1024?`${(n/1024).toFixed(1)} KB`:`${n} B`}
function status(text,phase){const el=$('snapshotLoadStatus');if(el){el.textContent=text;el.dataset.phase=phase||''}debug.phase=phase||debug.phase}
function publish(outcome){
  if(!session.isCurrent(outcome.selectionId)){sync();return}
  window.GRAMMAR_GLASS_SNAPSHOT=outcome.snapshot;
  window.GRAMMAR_GLASS_SNAPSHOT_LOAD_RECEIPT=outcome.receipt;
  dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-loaded',{detail:{snapshot:outcome.snapshot,loadReceipt:outcome.receipt}}));
  status(`SNAPSHOT READY · ${size(outcome.receipt.fileBytes)} · ${outcome.receipt.metrics.atomCount} ATOMS`,'READY');
  sync();
}
async function selected(event){
  const file=event.target.files&&event.target.files[0];if(!file)return;
  status(`SNAPSHOT READING · ${size(file.size)}`,'READING');
  const pending=session.select(file);sync();
  const outcome=await pending;sync();
  if(outcome.result==='STALE_SNAPSHOT_SELECTION_HELD'){
    dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-load-held',{detail:{loadReceipt:outcome.receipt}}));
    return;
  }
  if(outcome.result!=='SNAPSHOT_SELECTION_READY'){
    status(`SNAPSHOT HELD · ${outcome.receipt.error} · PREVIOUS RETAINED`,'HELD_INVALID');
    dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-load-error',{detail:{loadReceipt:outcome.receipt}}));
    return;
  }
  status(`SNAPSHOT BINDING · ${outcome.receipt.metrics.atomCount} ATOMS`,'BINDING');
  setTimeout(()=>publish(outcome),0);
}
const file=$('file');if(file)file.addEventListener('change',selected);
window.AXMGrammarGlassSnapshotLoad=Object.freeze({getState:()=>({...debug}),getReceipt:()=>window.GRAMMAR_GLASS_SNAPSHOT_LOAD_RECEIPT||null,contract:session.contract});
if(window.GRAMMAR_GLASS_SNAPSHOT&&Core.validSnapshot(window.GRAMMAR_GLASS_SNAPSHOT))status(`SNAPSHOT READY · ${window.GRAMMAR_GLASS_SNAPSHOT.cycle.atoms.length} ATOMS`,'READY');
})();
