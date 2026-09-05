(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AXMGrammarGlassSnapshotLoadCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const SCHEMA='axm.code.grammar-glass-visual-snapshot.v1';
  const RECEIPT_SCHEMA='axm.code.grammar-glass-snapshot-load.v1';

  function validSnapshot(snapshot){
    return !!(snapshot&&snapshot.schema===SCHEMA&&snapshot.cycle&&
      Array.isArray(snapshot.cycle.atoms)&&Array.isArray(snapshot.cycle.edges)&&
      Array.isArray(snapshot.draftSky));
  }

  function loadReceipt(result,selectionId,file,snapshot=null,error=null){
    return Object.freeze({
      schema:RECEIPT_SCHEMA,
      version:'1.0.0',
      result,
      selectionId,
      fileBytes:Number(file?.size)||0,
      snapshotBinding:snapshot?{
        schema:snapshot.schema,
        version:snapshot.version||null,
        rootSeed:snapshot.rootSeed||null,
        sourceSha256:snapshot.sourceSha256||null,
        profileSnapshotSha256:snapshot.profileSnapshotSha256||null,
        cycleSha256:snapshot.cycle?.cycleSha256||null
      }:null,
      metrics:snapshot?{
        profileCount:Number(snapshot.profileCount)||0,
        atomCount:snapshot.cycle.atoms.length,
        edgeCount:snapshot.cycle.edges.length,
        draftStarCount:snapshot.draftSky.length
      }:null,
      error:error?String(error.message||error):null,
      truth:{
        loadReceiptIsViewerStateOnly:true,
        staleSelectionCannotReplaceCurrent:true,
        invalidSelectionDoesNotClearPriorCommit:true,
        loadingCreatesEvidence:false,
        recordedSnapshotMutation:false,
        authority:'NONE'
      }
    });
  }

  function createSession({parse,validate=validSnapshot}={}){
    if(typeof parse!=='function')throw new Error('GRAMMAR_GLASS_SNAPSHOT_PARSE_FUNCTION_REQUIRED');
    let activeSelectionId=0;
    const state={
      phase:'EMPTY',
      selectionCount:0,
      activeSelectionId:0,
      committedSelectionId:0,
      commitCount:0,
      staleSelectionCount:0,
      rejectedSelectionCount:0,
      selectedFileBytes:0,
      committedAtomCount:0,
      lastError:null,
      staleSelectionCannotReplaceCurrent:true,
      recordedSnapshotMutation:false,
      authority:'NONE'
    };

    function stale(selectionId,file,snapshot=null,error=null){
      state.staleSelectionCount++;
      return Object.freeze({
        result:'STALE_SNAPSHOT_SELECTION_HELD',
        selectionId,
        snapshot:null,
        receipt:loadReceipt('STALE_SNAPSHOT_SELECTION_HELD',selectionId,file,snapshot,error)
      });
    }

    async function select(file){
      const selectionId=++activeSelectionId;
      state.phase='READING';
      state.selectionCount++;
      state.activeSelectionId=selectionId;
      state.selectedFileBytes=Number(file?.size)||0;
      state.lastError=null;
      try{
        const snapshot=await parse(file);
        if(selectionId!==activeSelectionId)return stale(selectionId,file,snapshot);
        if(!validate(snapshot))throw new Error('GRAMMAR_GLASS_VALID_VISUAL_SNAPSHOT_REQUIRED');
        state.phase='READY';
        state.committedSelectionId=selectionId;
        state.commitCount++;
        state.committedAtomCount=snapshot.cycle.atoms.length;
        const receipt=loadReceipt('SNAPSHOT_SELECTION_READY',selectionId,file,snapshot);
        return Object.freeze({result:'SNAPSHOT_SELECTION_READY',selectionId,snapshot,receipt});
      }catch(error){
        if(selectionId!==activeSelectionId)return stale(selectionId,file,null,error);
        state.phase='HELD_INVALID';
        state.rejectedSelectionCount++;
        state.lastError=String(error.message||error);
        const receipt=loadReceipt('SNAPSHOT_SELECTION_HELD_INVALID',selectionId,file,null,error);
        return Object.freeze({result:'SNAPSHOT_SELECTION_HELD_INVALID',selectionId,snapshot:null,error,receipt});
      }
    }

    return Object.freeze({
      select,
      isCurrent:selectionId=>selectionId===activeSelectionId,
      getState:()=>Object.freeze({...state}),
      contract:Object.freeze({
        oneValidatedPublisher:true,
        staleSelectionCannotReplaceCurrent:true,
        invalidSelectionDoesNotClearPriorCommit:true,
        modalErrorRequired:false,
        recordedSnapshotMutation:false,
        authority:'NONE'
      })
    });
  }

  return Object.freeze({SCHEMA,RECEIPT_SCHEMA,validSnapshot,createSession});
});
