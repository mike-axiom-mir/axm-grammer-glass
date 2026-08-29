'use strict';
const assert=require('assert/strict');
const core=require('./playground-core.js');
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};const eq=(a,b,m)=>{assert.equal(a,b,m);n++};const de=(a,b,m)=>{assert.deepEqual(a,b,m);n++};
const atoms=[
 {atomId:'py:state',languageId:'python',atomType:'STATE'},
 {atomId:'py:fail',languageId:'python',atomType:'FAILURE'},
 {atomId:'js:state',languageId:'javascript',atomType:'STATE'},
 {atomId:'js:verify',languageId:'javascript',atomType:'VERIFICATION'},
 {atomId:'sql:dep',languageId:'sql',atomType:'DEPENDENCY'},
 {atomId:'sql:type',languageId:'sql',atomType:'TYPE'}
];
const snapshot={schema:'axm.code.grammar-glass-visual-snapshot.v1',version:'1.4.0',rootSeed:'6f2d8b4abef8ebf661925d5ce9d1aeea05b584055e8bdc96b9f857fd66d65e0f',sourceMode:'TEST_FIXTURE',sourceSha256:'source:test',profileSnapshotSha256:'profiles:test',cycle:{cycleSha256:'cycle:test',conditionSha256:'condition:test',atoms,edges:[{leftAtomId:'py:state',rightAtomId:'js:state',connectionClass:'ANALOGY',thresholdMet:true,crossGrammar:true},{leftAtomId:'py:fail',rightAtomId:'js:verify',connectionClass:'CONTRAST',thresholdMet:true,crossGrammar:true},{leftAtomId:'js:state',rightAtomId:'sql:type',connectionClass:'BOUNDARY',thresholdMet:false,crossGrammar:true}],influenceCarries:[{sourceAtomId:'py:state',targetAtomId:'js:state',carryClass:'ANALOGICAL_PULL',signedDeltaPpm:1200,crossGrammar:true,carrySha256:'carry:1'},{sourceAtomId:'sql:dep',targetAtomId:'js:verify',carryClass:'BOUNDARY_TENSION',signedDeltaPpm:-400,crossGrammar:true,carrySha256:'carry:2'}]},contactMemory:{multiHopPaths:[{pathAtomIds:['py:state','js:state','sql:type'],hopCount:2,pathSha256:'path:1'},{pathAtomIds:['py:fail','js:verify'],hopCount:1,pathSha256:'path:2'}]},draftSky:[{starSha256:'star:1',cycleStep:4,languageIds:['python','javascript']},{starSha256:'star:2',cycleStep:5,languageIds:['javascript','sql']}]};
const before=JSON.stringify(snapshot);
ok(core.validSnapshot(snapshot),'fixture is valid');
de(core.availableLanguages(snapshot),['javascript','python','sql'],'languages sorted');
const r1=core.rollLanguages(snapshot,{count:2,roll:3}),r2=core.rollLanguages(snapshot,{count:2,roll:3});de(r1,r2,'roll replay deterministic');eq(r1.length,2,'roll bounded');ok(r1.every(x=>['javascript','python','sql'].includes(x)),'roll uses real grammars');
const p1=core.createProbe(snapshot,{languageIds:['python','javascript'],mode:'GRAVITY_WELL',strength:.8,roll:3});const p2=core.createProbe(snapshot,{languageIds:['python','javascript'],mode:'GRAVITY_WELL',strength:.8,roll:3});
eq(p1.probeSha256,p2.probeSha256,'probe digest replay');eq(p1.result,'VISUAL_GRAMMAR_PROBE_READY_NO_MUTATION','probe state');eq(p1.metrics.selectedGrammarCount,2,'selected grammar count');eq(p1.metrics.selectedAtomCount,4,'selected atom count');eq(p1.metrics.relationEdgeCount,2,'relation count');eq(p1.metrics.directCarryCount,1,'direct carry count');eq(p1.metrics.crossGrammarDirectCarryCount,1,'cross grammar carry count');eq(p1.metrics.memoryPathCount,2,'memory path count');eq(p1.metrics.draftStarCount,2,'draft star overlap count');eq(p1.metrics.connectionClassCounts.ANALOGY,1,'analogy count');eq(p1.metrics.connectionClassCounts.CONTRAST,1,'contrast count');
ok(p1.truth.visualProbeOnly,'visual only');ok(p1.truth.visualSelectionCreatesEvidence===false,'selection creates no evidence');ok(p1.truth.visualWarpCreatesEvidence===false,'warp creates no evidence');ok(p1.truth.cycleMutationPerformed===false,'cycle unchanged');ok(p1.truth.contactMemoryMutationPerformed===false,'memory unchanged');ok(p1.truth.draftStarCreated===false,'no draft star');ok(p1.truth.candidateCreated===false,'no candidate');ok(p1.truth.executionRequested===false,'no execution');ok(p1.truth.automaticReentry===false,'no reentry');ok(p1.truth.rankingPerformed===false,'no ranking');ok(p1.truth.winnerSelected===false,'no winner');ok(p1.truth.semanticEquivalenceInferred===false,'no equivalence');eq(p1.truth.authority,'NONE','no authority');eq(JSON.stringify(snapshot),before,'input snapshot not mutated');
const rift=core.createProbe(snapshot,{languageIds:['javascript','sql'],mode:'RIFT_SCAN',strength:2,roll:9});eq(rift.strength,1,'strength upper clamp');eq(rift.mode,'RIFT_SCAN','rift mode');eq(rift.metrics.relationEdgeCount,1,'rift relation count grounded');
assert.throws(()=>core.createProbe(snapshot,{languageIds:['fictional'],mode:'GRAVITY_WELL'}),/PLAYGROUND_AT_LEAST_ONE_REAL_GRAMMAR_REQUIRED/);n++;
assert.throws(()=>core.createProbe(snapshot,{languageIds:['python'],mode:'FAKE_MODE'}),/PLAYGROUND_UNKNOWN_MODE/);n++;
process.stdout.write(JSON.stringify({result:'GRAMMAR_GLASS_PLAYGROUND_SELFTEST_PASS',assertions:n,probeSha256:p1.probeSha256,rolledLanguages:r1,truth:p1.truth},null,2)+'\n');
