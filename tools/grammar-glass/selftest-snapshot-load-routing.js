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
assert(publisher.includes("const file=$('file');if(file)file.addEventListener('change',selected)"));
assert(publisher.includes("dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-loaded'"));
assert(publisher.includes("dispatchEvent(new CustomEvent('axm:grammar-glass-snapshot-load-error'"));
assert(!publisher.includes('alert('),'load errors must remain non-modal');
console.log(JSON.stringify({ok:true,primaryFileListenerCount:1,subscriberCount:subscribers.length,nonModalErrors:true,authority:'NONE'},null,2));
