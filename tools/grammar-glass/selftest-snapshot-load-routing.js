'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const dir=__dirname;
const subscribers=[
  'app.js','render-budget.js','execution-history-view.js','vessel-view.js',
  'playground.js','playground-touch.js','playground-audio.js','constellation-replay.js',
  'ghost-glass.js','grammar-102-view.js','change-ripple.js','workbench-polish.js'
];
for(const name of subscribers){
  const source=fs.readFileSync(path.join(dir,name),'utf8');
  assert(source.includes('axm:grammar-glass-snapshot-loaded'),`${name} must consume the single validated snapshot event`);
  assert(!source.includes("const file=$('file')"),`${name} must not own the primary file listener`);
  assert(!source.includes("const f=$('file')"),`${name} must not own the primary file listener`);
  assert(!source.includes("$('file')?.addEventListener('change'"),`${name} must not own the primary file listener`);
  assert(!source.includes("$('file').addEventListener('change'"),`${name} must not own the primary file listener`);
}
const publisher=fs.readFileSync(path.join(dir,'snapshot-load.js'),'utf8');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const loadOrder=['interglass-executor.js','playground-core.js','snapshot-load-core.js','snapshot-load.js'].map(name=>index.indexOf(`src="${name}"`));
assert(loadOrder.every(position=>position>=0),'snapshot integrity scripts must all be loaded');
assert(loadOrder.every((position,index)=>index===0||loadOrder[index-1]<position),'snapshot integrity adapters must load before the publisher');
assert(publisher.includes("const file=$('file');if(file)file.addEventListener('change',selected)"));
assert(publisher.includes("dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-loaded'"));
assert(publisher.includes("dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-load-error'"));
assert(!publisher.includes('alert('),'load errors must remain non-modal');
const ghost=fs.readFileSync(path.join(dir,'ghost-glass.js'),'utf8');
assert(ghost.includes('AXMGrammarGlassSnapshotLoadCore?.validSnapshot(s)'),'Ghost Glass must reuse the integrity-bound snapshot validator');
console.log(JSON.stringify({ok:true,primaryFileListenerCount:1,subscriberCount:subscribers.length,integrityAdapterLoadOrder:true,ghostIntegrityValidation:true,nonModalErrors:true,authority:'NONE'},null,2));
