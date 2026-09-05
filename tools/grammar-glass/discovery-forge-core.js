(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./discovery-kiln-core.js') : root.AXMGrammarGlassDiscoveryKilnCore,
    typeof require === 'function' ? require('./evidence-body-core.js') : root.AXMGrammarGlassEvidenceBodyCore,
    typeof require === 'function' ? require('./discovery-gap-compiler-core.js') : root.AXMGrammarGlassDiscoveryGapCompilerCore,
    typeof require === 'function' ? require('./construction-program-core.js') : root.AXMGrammarGlassConstructionProgramCore
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassDiscoveryForgeCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (DiscoveryKiln, Evidence, GapCompiler, Program) {
  'use strict';

  function sha256(value) { return Evidence.sha256(value); }
  function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } return value; }
  function digestCurrent(record, field) { if (!record || !record[field]) return false; const core = { ...record }, expected = core[field]; delete core[field]; return sha256(core) === expected; }
  function equivalentRecord(body, { layer, status, claimCode, observedDigest }) {
    return body.records.some(record => record.layer === layer && record.status === status && record.claimCode === claimCode && (record.observedDigest || null) === (observedDigest || null));
  }
  function appendOnce(body, record) { return equivalentRecord(body, record) ? body : Evidence.appendEvidence(body, record); }
  function currentRuntimeObservation(preparation) {
    const history = preparation.localHistoryBeforePreparation?.resultHistory || [];
    const matches = history.filter(item => {
      if (preparation.construction) return item.constructionPlanSha256 === preparation.construction.constructionPlanSha256 && item.artifactSha256 === preparation.construction.expectedArtifactSha256;
      if (preparation.recordedLineage?.candidateModelDigest) return item.candidateModelDigest === preparation.recordedLineage.candidateModelDigest;
      return false;
    });
    return matches.length ? matches[matches.length - 1] : null;
  }
  function evidenceForPreparation(preparation, priorBody = null) {
    if (!GapCompiler.validPreparation(preparation)) throw Error('VALID_DISCOVERY_PREPARATION_REQUIRED');
    const same = priorBody && Evidence.validBody(priorBody) && priorBody.subjectSha256 === preparation.preparationSha256 && priorBody.sourceKey === Evidence.sourceKey(preparation.sourceBinding);
    let body = same ? priorBody : Evidence.createBody({
      subjectType: 'GRAMMAR_GLASS_DISCOVERY_PREPARATION', subjectSha256: preparation.preparationSha256,
      sourceBinding: preparation.sourceBinding, parentEvidenceBodySha256: priorBody && Evidence.validBody(priorBody) ? priorBody.bodySha256 : null
    });
    body = appendOnce(body, { layer: 'DECLARED', status: 'PRESENT', claimCode: 'DISCOVERY_PREPARATION_DIGEST_CURRENT', observedDigest: preparation.preparationSha256 });
    const sourceReady = preparation.grounding?.result === 'RECORDED_GRAMMAR_GROUNDING_READY' && !(preparation.grounding.bindingProblems || []).length;
    body = appendOnce(body, { layer: 'SOURCE', status: sourceReady ? 'PASS' : 'HOLD', claimCode: sourceReady ? 'EXACT_SOURCE_AND_ATOM_GROUNDING_CURRENT' : 'SOURCE_OR_ATOM_GROUNDING_HELD', observedDigest: sha256(preparation.grounding || {}) });
    if (preparation.construction) body = appendOnce(body, { layer: 'STATIC_VERIFICATION', status: 'PASS', claimCode: 'EXACT_CONSTRUCTION_BUNDLE_STATIC_VERIFICATION_BOUND', observedDigest: preparation.construction.verificationSha256 });
    const runtime = currentRuntimeObservation(preparation);
    if (runtime) {
      const status = runtime.resultClass === 'PASS_OBSERVED' ? 'PASS' : runtime.resultClass === 'FAIL_OBSERVED' ? 'FAIL' : 'HOLD';
      body = appendOnce(body, { layer: 'RUNTIME', status, claimCode: `TERMINAL_SANDBOX_${runtime.resultClass}`, observedDigest: runtime.receiptDigest, detail: { resultClass: runtime.resultClass } });
    }
    return body;
  }
  function programStateFor(preparation, program) {
    if (!program) return 'ABSENT';
    if (!Program.validProgram(program)) return 'INVALID';
    const binding = program.binding || {};
    if (binding.preparationSha256 !== preparation.preparationSha256) return 'INVALID';
    if (preparation.construction && binding.constructionPlanSha256 !== preparation.construction.constructionPlanSha256) return 'INVALID';
    return 'VALID';
  }
  function inspect({ snapshot = null, probe = null, ledger = null, preparation = null, evidenceBody = null, program = null } = {}) {
    const prep = preparation || DiscoveryKiln.createPreparation({ snapshot, probe, ledger });
    if (!GapCompiler.validPreparation(prep)) throw Error('VALID_DISCOVERY_PREPARATION_REQUIRED');
    const body = evidenceForPreparation(prep, evidenceBody);
    const assessment = Evidence.assess(body, { currentSubjectSha256: prep.preparationSha256, currentSourceBinding: prep.sourceBinding, requiredLayers: ['DECLARED', 'SOURCE', 'STATIC_VERIFICATION'] });
    const programState = programStateFor(prep, program);
    const gapCompilation = GapCompiler.compile({ preparation: prep, evidenceAssessment: assessment, programState });
    const core = {
      schema: 'axm.code.grammar-glass-discovery-forge-receipt.v1', version: '1.0.0',
      result: gapCompilation.constructionReady ? (programState === 'VALID' ? 'DISCOVERY_FORGE_READY_WITH_BOUND_PROGRAM_NOT_EXECUTED' : 'DISCOVERY_FORGE_EXISTING_CONSTRUCTION_READY_PROGRAM_OPTIONAL') : 'DISCOVERY_FORGE_HELD',
      preparationSha256: prep.preparationSha256,
      evidenceBodySha256: body.bodySha256,
      evidenceAssessmentSha256: assessment.assessmentSha256,
      gapCompilationSha256: gapCompilation.gapCompilationSha256,
      constructionPlanSha256: prep.construction?.constructionPlanSha256 || null,
      programSha256: programState === 'VALID' ? program.programSha256 : null,
      programState,
      evidence: body,
      assessment,
      gapCompilation,
      truth: {
        existingDiscoveryKilnDirectionPreserved: true,
        existingConstructionHandDirectionPreserved: true,
        donorInfluenceIsVendoredConceptAdaptationNotRuntimeDependency: true,
        evidenceLayersDoNotCollapseIntoOneScore: true,
        oldEvidenceCannotCertifyChangedSource: true,
        gapRouteIsProposalNotPermission: true,
        programIsBoundedDataNotArbitrarySource: true,
        programExecutedDuringInspection: false,
        liveVisualVerificationInferred: false,
        automaticSelection: false,
        automaticPromotion: false,
        automaticMergeOrCanon: false
      },
      authority: 'NONE'
    };
    return freeze({ ...core, forgeReceiptSha256: sha256(core) });
  }
  function validForgeReceipt(receipt) { return !!receipt && receipt.schema === 'axm.code.grammar-glass-discovery-forge-receipt.v1' && digestCurrent(receipt, 'forgeReceiptSha256'); }
  function runProgramPreview({ forgeReceipt, program, initialState = {} } = {}) {
    if (!validForgeReceipt(forgeReceipt)) throw Error('VALID_DISCOVERY_FORGE_RECEIPT_REQUIRED');
    if (!Program.validProgram(program) || forgeReceipt.programState !== 'VALID' || forgeReceipt.programSha256 !== program.programSha256) throw Error('FORGE_BOUND_PROGRAM_REQUIRED');
    const execution = Program.execute(program, initialState);
    const core = {
      schema: 'axm.code.grammar-glass-discovery-forge-program-preview.v1', version: '1.0.0',
      result: execution.result, forgeReceiptSha256: forgeReceipt.forgeReceiptSha256, programSha256: program.programSha256,
      execution,
      truth: { explicitPreviewCallRequired: true, transientJsonStateOnly: true, arbitrarySourceCodeExecuted: false, networkOrFilesystemAuthority: false, constructionArtifactExecuted: false, previewIsNotAdmissionOrPromotion: true },
      authority: 'TRANSIENT_PROGRAM_STATE_ONLY'
    };
    return freeze({ ...core, previewSha256: sha256(core) });
  }

  return Object.freeze({ sha256, evidenceForPreparation, programStateFor, inspect, validForgeReceipt, runProgramPreview });
});
