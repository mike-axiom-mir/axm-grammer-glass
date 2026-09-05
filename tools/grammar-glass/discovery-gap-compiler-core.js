(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./playground-core.js') : root.AXMGrammarGlassPlaygroundCore
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassDiscoveryGapCompilerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Playground) {
  'use strict';

  const HOLD_TO_GAP = Object.freeze({
    SOURCE_BINDING_OR_ATOM_GROUNDING_REQUIRED: 'SOURCE_GROUNDING',
    FULL_CYCLE_FORMATION_ADAPTER_REQUIRED: 'FORMATION_ADAPTER',
    FULL_LINEAGE_CONSTRUCTION_ADAPTER_REQUIRED: 'LINEAGE_ADAPTER',
    INTERGLASS_CANDIDATE_ADAPTER_REQUIRED: 'CONSTRUCTION_ADAPTER',
    SANDBOX_REQUEST_ADAPTER_REQUIRED: 'SANDBOX_REQUEST_ADAPTER'
  });
  const ROUTES = Object.freeze({
    SOURCE_GROUNDING: [
      { step: 1, kind: 'OBSERVER', action: 'REBIND_EXACT_SOURCE_AND_GROUND_ATOMS' },
      { step: 2, kind: 'VERIFIER', action: 'VERIFY_SOURCE_BINDING_AND_ATOM_MEMBERSHIP' }
    ],
    FORMATION_ADAPTER: [
      { step: 1, kind: 'PRODUCER', action: 'SUPPLY_BOUNDED_FORMATION_ADAPTER' },
      { step: 2, kind: 'VERIFIER', action: 'VERIFY_FORMATION_LINEAGE' }
    ],
    LINEAGE_ADAPTER: [
      { step: 1, kind: 'PRODUCER', action: 'SUPPLY_LINEAGE_PRESERVING_CONSTRUCTION_ADAPTER' },
      { step: 2, kind: 'VERIFIER', action: 'VERIFY_DRAFT_STAR_AND_LINEAGE_BINDINGS' }
    ],
    CONSTRUCTION_ADAPTER: [
      { step: 1, kind: 'PRODUCER', action: 'SUPPLY_EXACT_CONSTRUCTION_ADAPTER' },
      { step: 2, kind: 'VERIFIER', action: 'VERIFY_CONSTRUCTION_PLAN_AND_ARTIFACT_CONTRACT' }
    ],
    SANDBOX_REQUEST_ADAPTER: [
      { step: 1, kind: 'PRODUCER', action: 'SUPPLY_DIGEST_BOUND_SANDBOX_REQUEST_ADAPTER' },
      { step: 2, kind: 'VERIFIER', action: 'VERIFY_REQUEST_ARTIFACT_AND_EXECUTOR_BINDING' }
    ],
    PROGRAM_CONTRACT: [
      { step: 1, kind: 'PRODUCER', action: 'DECLARE_BOUNDED_CONSTRUCTION_PROGRAM' },
      { step: 2, kind: 'VERIFIER', action: 'VERIFY_DECLARED_READ_WRITE_DEPENDENCY_AND_EFFECT_CONTRACT' }
    ],
    STATIC_VERIFICATION: [{ step: 1, kind: 'VERIFIER', action: 'REVERIFY_EXACT_CURRENT_CONSTRUCTION_ARTIFACT' }],
    RUNTIME_EVIDENCE: [{ step: 1, kind: 'OBSERVER', action: 'RUN_EXPLICIT_SANDBOX_ONCE_AND_RECORD_TERMINAL_RECEIPT' }],
    VISUAL_EVIDENCE: [{ step: 1, kind: 'OBSERVER', action: 'PERFORM_EXPLICIT_LIVE_VISUAL_OBSERVATION' }]
  });

  function sha256(value) { return Playground.sha256(value); }
  function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } return value; }
  function digestCurrent(record, field) { if (!record || !record[field]) return false; const core = { ...record }, expected = core[field]; delete core[field]; return sha256(core) === expected; }
  function validPreparation(preparation) { return !!preparation && preparation.schema === 'axm.code.grammar-glass-discovery-preparation.v1' && digestCurrent(preparation, 'preparationSha256'); }
  function layerState(assessment, layer) { return assessment?.layerStates?.[layer] || { state: 'ABSENT', current: false, status: null }; }
  function evidenceGap(assessment, layer, gapType) {
    const state = layerState(assessment, layer);
    if (!state.current || !['PASS', 'OBSERVED', 'PRESENT'].includes(state.status)) return { gapType, layer, state: state.state, blocking: layer === 'SOURCE' || layer === 'STATIC_VERIFICATION' };
    return null;
  }

  function compile({ preparation, evidenceAssessment = null, programState = 'ABSENT' } = {}) {
    if (!validPreparation(preparation)) throw Error('VALID_DISCOVERY_PREPARATION_REQUIRED');
    if (!['ABSENT', 'VALID', 'INVALID'].includes(programState)) throw Error('PROGRAM_STATE_INVALID');
    const gaps = [];
    if (preparation.holdReason) gaps.push({ gapType: HOLD_TO_GAP[preparation.holdReason] || 'UNKNOWN_ADAPTER_GAP', holdReason: preparation.holdReason, blocking: true });
    if (evidenceAssessment) {
      for (const pair of [['SOURCE', 'SOURCE_GROUNDING'], ['STATIC_VERIFICATION', 'STATIC_VERIFICATION'], ['RUNTIME', 'RUNTIME_EVIDENCE'], ['VISUAL_OBSERVATION', 'VISUAL_EVIDENCE']]) {
        const gap = evidenceGap(evidenceAssessment, pair[0], pair[1]); if (gap && !gaps.some(existing => existing.gapType === gap.gapType)) gaps.push(gap);
      }
    }
    if (programState !== 'VALID') gaps.push({ gapType: 'PROGRAM_CONTRACT', programState, blocking: false });
    const blocking = gaps.filter(gap => gap.blocking);
    const routeGap = blocking[0] || gaps.find(gap => gap.gapType === 'PROGRAM_CONTRACT') || gaps[0] || null;
    const route = routeGap && ROUTES[routeGap.gapType] ? ROUTES[routeGap.gapType].map(step => ({ ...step })) : [];
    if (route.length > 3) throw Error('DISCOVERY_GAP_ROUTE_CEILING_EXCEEDED');
    const constructionReady = !!preparation.construction && !blocking.some(gap => ['SOURCE_GROUNDING', 'STATIC_VERIFICATION'].includes(gap.gapType));
    const programReady = programState === 'VALID';
    const result = constructionReady ? 'EXISTING_CONSTRUCTION_READY_FOR_EXPLICIT_ARM' : blocking.length ? `HELD_${blocking[0].gapType}` : 'DISCOVERY_PREPARATION_HELD';
    const core = {
      schema: 'axm.code.grammar-glass-discovery-gap-compilation.v1', version: '1.0.0', result,
      preparationSha256: preparation.preparationSha256, constructionReady, programReady,
      extendedForgeResult: programReady ? 'FORGE_PROGRAM_BOUND_NOT_EXECUTED' : programState === 'INVALID' ? 'HELD_PROGRAM_CONTRACT_INVALID' : 'HELD_PROGRAM_CONTRACT_REQUIRED',
      gaps, selectedRouteGap: routeGap?.gapType || null, selectedRoute: route,
      evidenceNotes: {
        runtimeEvidenceBlocksConstructionArm: false,
        visualEvidenceBlocksConstructionArm: false,
        runtimeAndVisualRemainIndependentEvidenceLayers: true
      },
      truth: { missingPathIsNotImpossibilityProof: true, routeIsProposalNotExecution: true, uniqueSelectedRouteDoesNotProveSemanticEquivalence: true, noAutomaticAdapterSynthesis: true, noAutomaticExecution: true, noAutomaticPromotion: true },
      authority: 'NONE'
    };
    return freeze({ ...core, gapCompilationSha256: sha256(core) });
  }

  return Object.freeze({ HOLD_TO_GAP, ROUTES, sha256, validPreparation, compile });
});
