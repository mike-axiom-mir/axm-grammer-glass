(()=>{'use strict';
const root=typeof window!=='undefined'?window:globalThis;
const Base=(typeof require==='function'?(()=>{try{return require('./playground-core.js')}catch{return null}})():null)||root.AXMGrammarGlassPlaygroundCore;
const Intake=(typeof require==='function'?(()=>{try{return require('./grammar-102-intake-core.js')}catch{return null}})():null)||root.AXMGrammarGlass102IntakeCore;
const SCHEMA='axm.code.grammar-glass-102-change-ripple.v1';
const DARK_CLASSES=Object.freeze(['CONTRAST','REPULSION','BOUNDARY','UNRESOLVED_NEIGHBOURHOOD']);
const REF_LIMITS=Object.freeze({atoms:128,relations:256,carries:256,memory:128,stars:128});
function need(){if(!Base||!Intake)throw Error('GRAMMAR_102_CHANGE_RIPPLE_DEPENDENCIES_REQUIRED');return{Base,Intake}}
function uniq(xs){return[...new Set((Array.isArray(xs)?xs:[]).map(x=>String(x||'')).filter(Boolean))].sort()}
function normalize(v){const{Intake:I}=need();if(v?.schema===I.IMPORT_SCHEMA){I.verifyImportReceipt(v);return v}return I.createImportReceipt(v)}
function lens(receipt,id){return receipt?.lenses?.find(x=>x.lensId===id)||null}
function itemById(l,itemId){return(l?.itemRefs||[]).find(x=>x.id===itemId)||null}
function changeClass(comparison,lensId,itemId){const l=comparison?.layers?.find(x=>x.lensId===lensId);if(!l)return'UNKNOWN';const d=l.itemDelta||{};if((d.changed||[]).includes(itemId))return'CHANGED';if((d.added||[]).includes(itemId))return'ADDED';if((d.removed||[]).includes(itemId))return'REMOVED';if((d.shared||[]).includes(itemId))return'SHARED';return'UNKNOWN'}
function languageCandidates(primary,ghost){return uniq([...(primary?.grammarIdentity?.languageIds||[]),...(ghost?.grammarIdentity?.languageIds||[])]).sort((a,b)=>b.length-a.length||a.localeCompare(b))}
function resolveLanguage(lensId,itemId,primary,ghost){
 const id=String(itemId||''),langs=languageCandidates(primary,ghost);
 if(lensId==='BASE_GRAMMAR'||lensId==='SPECIALIST_EYES')return langs.includes(id)?id:null;
 if(lensId==='SEMANTIC_DIRECTIONS'){for(const lang of langs)if(id.startsWith(`${lang}:`))return lang;return null}
 if(lensId==='CHEATCODE_INFLUENCE'){for(const lang of langs)if(id.startsWith(`code.cheat.${lang}.`))return lang;return null}
 return null;
}
function sourceBinding(glass,primary,ghost,comparison){return{glass:{schema:glass.schema,version:glass.version||null,rootSeed:glass.rootSeed||null,sourceSha256:glass.sourceSha256||null,profileSnapshotSha256:glass.profileSnapshotSha256||null,cycleSha256:glass.cycle?.cycleSha256||null},primary:{importReceiptSha256:primary.importReceiptSha256,sourceCommitSha:primary.sourceBinding.commitSha},ghost:{importReceiptSha256:ghost.importReceiptSha256,sourceCommitSha:ghost.sourceBinding.commitSha},generationComparisonSha256:comparison.generationComparisonSha256}}
function truth(){return{structuralContactNotCausalProof:true,changeDoesNotMeanImprovement:true,changeDoesNotMeanRegression:true,rippleDoesNotProveRuntimeImpact:true,languageBindingDoesNotMeanSemanticEquivalence:true,darkGrammarContactIsNotResolution:true,darkGrammarContactIsNotPhysicsClaim:true,visualizationMayProjectReceiptButCreatesNoEvidence:true,cycleMutationPerformed:false,recordedAtomMutationPerformed:false,contactMemoryMutationPerformed:false,draftStarCreated:false,executionStarCreated:false,candidateCreated:false,executionRequested:false,automaticReentry:false,rankingPerformed:false,winnerSelected:false,authority:'NONE'}}
function finish(core){const{Base:B}=need();return Object.freeze({...core,changeRippleSha256:B.sha256(core)})}
function held(result,glass,primary,ghost,comparison,origin,extra={}){return finish({schema:SCHEMA,version:'1.0.0',result,sourceBinding:sourceBinding(glass,primary,ghost,comparison),origin,...extra,truth:truth()})}
function compactAtom(a){return{atomId:a.atomId,languageId:a.languageId,atomType:a.atomType||null,position:a.position?{...a.position}:null}}
function createChangeRipple(glassSnapshot,primaryInput,ghostInput,{lensId,itemId}={}){
 const{Base:B,Intake:I}=need();if(!B.validSnapshot(glassSnapshot))throw Error('GRAMMAR_102_CHANGE_RIPPLE_VALID_GLASS_REQUIRED');
 const primary=normalize(primaryInput),ghost=normalize(ghostInput);if(!ghost)throw Error('GRAMMAR_102_CHANGE_RIPPLE_TWO_GENERATIONS_REQUIRED');
 if(!I.LENSES.some(x=>x.lensId===lensId))throw Error(`GRAMMAR_102_CHANGE_RIPPLE_UNKNOWN_LENS:${lensId}`);
 if(!String(itemId||''))throw Error('GRAMMAR_102_CHANGE_RIPPLE_ITEM_REQUIRED');
 const comparison=I.compareGenerations(primary,ghost),change=changeClass(comparison,lensId,String(itemId)),pLens=lens(primary,lensId),gLens=lens(ghost,lensId),pItem=itemById(pLens,String(itemId)),gItem=itemById(gLens,String(itemId));
 const origin={lensId,itemId:String(itemId),changeClass:change,primaryDigest:pItem?.digest||null,ghostDigest:gItem?.digest||null};
 if(!['CHANGED','ADDED','REMOVED'].includes(change))return held('GRAMMAR_102_CHANGE_RIPPLE_HELD_ITEM_NOT_CHANGED',glassSnapshot,primary,ghost,comparison,origin);
 const languageId=resolveLanguage(lensId,String(itemId),primary,ghost);origin.languageId=languageId;
 if(!languageId)return held('GRAMMAR_102_CHANGE_RIPPLE_HELD_LANGUAGE_UNMAPPED',glassSnapshot,primary,ghost,comparison,origin,{mapping:{state:'UNMAPPED',knownLanguageIds:languageCandidates(primary,ghost)}});
 const atomById=new Map((glassSnapshot.cycle.atoms||[]).map(a=>[a.atomId,a])),originAtoms=(glassSnapshot.cycle.atoms||[]).filter(a=>a.languageId===languageId),originIds=new Set(originAtoms.map(a=>a.atomId));
 if(!originAtoms.length)return held('GRAMMAR_102_CHANGE_RIPPLE_HELD_LANGUAGE_NOT_RECORDED',glassSnapshot,primary,ghost,comparison,origin,{mapping:{state:'LANGUAGE_BOUND_NOT_PRESENT_IN_RECORDED_GLASS',languageId}});
 const relationsAll=(glassSnapshot.cycle.edges||[]).filter(e=>originIds.has(e.leftAtomId)||originIds.has(e.rightAtomId));
 const carriesAll=(glassSnapshot.cycle.influenceCarries||[]).filter(c=>originIds.has(c.sourceAtomId)||originIds.has(c.targetAtomId));
 const memoryAll=(glassSnapshot.contactMemory?.multiHopPaths||[]).filter(p=>(p.pathAtomIds||[]).some(id=>originIds.has(id)));
 const draftAll=(glassSnapshot.draftSky||[]).filter(s=>(s.languageIds||[]).includes(languageId));
 const runAll=(glassSnapshot.executionSky||[]).filter(s=>(s.languageIds||s.grammarIds||[]).includes(languageId));
 const relations=relationsAll.slice(0,REF_LIMITS.relations).map(e=>({leftAtomId:e.leftAtomId,rightAtomId:e.rightAtomId,connectionClass:e.connectionClass||null,crossGrammar:e.crossGrammar===true,thresholdMet:e.thresholdMet===true}));
 const carries=carriesAll.slice(0,REF_LIMITS.carries).map(c=>({sourceAtomId:c.sourceAtomId,targetAtomId:c.targetAtomId,carryClass:c.carryClass||c.influenceCarryClass||c.connectionClass||null,crossGrammar:c.crossGrammar===true,carrySha256:c.carrySha256||c.influenceCarrySha256||null}));
 const memory=memoryAll.slice(0,REF_LIMITS.memory).map(p=>({pathAtomIds:[...(p.pathAtomIds||[])],pathSha256:p.pathSha256||p.multiHopPathSha256||null,hopCount:p.hopCount??Math.max(0,(p.pathAtomIds||[]).length-1)}));
 const draftStars=draftAll.slice(0,REF_LIMITS.stars).map(s=>({starSha256:s.starSha256||s.draftStarSha256||null,cycleStep:s.cycleStep??null,languageIds:[...(s.languageIds||[])],x:Number(s.x||0),y:Number(s.y||0)}));
 const runStars=runAll.slice(0,REF_LIMITS.stars).map(s=>({runStarSha256:s.runStarSha256||s.executionStarSha256||s.starSha256||null,cycleStep:s.cycleStep??s.sequence??null,languageIds:[...(s.languageIds||s.grammarIds||[])],resultClass:s.resultClass||s.result||null,x:Number(s.x||0),y:Number(s.y||0)}));
 const neighborIds=new Set();for(const e of relations){neighborIds.add(e.leftAtomId);neighborIds.add(e.rightAtomId)}for(const c of carries){neighborIds.add(c.sourceAtomId);neighborIds.add(c.targetAtomId)}for(const p of memory)for(const id of p.pathAtomIds)neighborIds.add(id);for(const id of originIds)neighborIds.delete(id);
 const neighborAtoms=[...neighborIds].map(id=>atomById.get(id)).filter(Boolean),darkRelations=relations.filter(e=>DARK_CLASSES.includes(e.connectionClass));
 const core={schema:SCHEMA,version:'1.0.0',result:'GRAMMAR_102_CHANGE_RIPPLE_READY_STRUCTURAL_CONTACT_ONLY',sourceBinding:sourceBinding(glassSnapshot,primary,ghost,comparison),origin,stages:{origin:{state:'CHANGED_102_ITEM_BOUND',lensId,itemId:String(itemId),changeClass:change},language:{state:'RECORDED_LANGUAGE_ATOMS_FOUND',languageId,atomRefs:originAtoms.slice(0,REF_LIMITS.atoms).map(compactAtom)},neighborhood:{state:'RECORDED_ONE_HOP_NEIGHBORHOOD_TRACED',relationRefs:relations,directCarryRefs:carries,contactMemoryRefs:memory,neighborAtomRefs:neighborAtoms.slice(0,REF_LIMITS.atoms).map(compactAtom),neighborLanguageIds:uniq(neighborAtoms.map(a=>a.languageId)),darkGrammarRelationRefs:darkRelations},constellation:{state:'RECORDED_CONSTELLATION_REFERENCES_TRACED',draftStarRefs:draftStars,runStarRefs:runStars}},metrics:{originAtomCount:originAtoms.length,neighborAtomCount:neighborAtoms.length,relationCount:relationsAll.length,directCarryCount:carriesAll.length,contactMemoryPathCount:memoryAll.length,draftStarCount:draftAll.length,runStarCount:runAll.length,darkGrammarRelationContactCount:relationsAll.filter(e=>DARK_CLASSES.includes(e.connectionClass)).length},bounds:{refLimits:REF_LIMITS,relationRefsTruncated:relationsAll.length>relations.length,directCarryRefsTruncated:carriesAll.length>carries.length,contactMemoryRefsTruncated:memoryAll.length>memory.length,draftStarRefsTruncated:draftAll.length>draftStars.length,runStarRefsTruncated:runAll.length>runStars.length},truth:truth()};
 return finish(core);
}
const api=Object.freeze({SCHEMA,DARK_CLASSES,REF_LIMITS,resolveLanguage,createChangeRipple,contract:Object.freeze({structuralContactOnly:true,causalProof:false,darkGrammarResolutionInference:false,cycleMutation:false,automaticReentry:false,ranking:false,authority:'NONE'})});
if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.AXMGrammarGlassChangeRippleCore=api;
})();
