(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./playground-core.js') : root.AXMGrammarGlassPlaygroundCore,
    typeof require === 'function' ? require('../../shared/code-capability-fabric/language-organs/code-grammar-glass-construction-renderer.js') : root.AXMGrammarGlassConstructionRenderer
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassConstructionHandCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Playground, Renderer) {
  'use strict';

  function canon(value) { return Playground.canon(value); }
  function sha256(value) { return Playground.sha256(value); }
  function bytes(value) { return new TextEncoder().encode(String(value)).length; }
  function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } return value; }
  function digestCurrent(record, field) { if (!record || !record[field]) return false; const core = { ...record }, expected = core[field]; delete core[field]; return sha256(core) === expected; }
  const stateShapes = Object.freeze({ LINEAGE_SIGNAL: 'BOUNDED_NUMERIC_REGISTER', ATOM_FLOW_ROUTER: 'BOUNDED_GROUNDED_ATOM_CURSOR', STATE_ORBIT: 'FINITE_PHASE_MACHINE', RECEIPT_LEDGER: 'BOUNDED_APPEND_ONLY_EVENT_WINDOW' });
  function familyForRoll(roll) { return Number.isSafeInteger(roll) && roll >= 0 ? Renderer.PROGRAM_FAMILIES[((roll - 1) % Renderer.PROGRAM_FAMILIES.length + Renderer.PROGRAM_FAMILIES.length) % Renderer.PROGRAM_FAMILIES.length] : null; }
  function shapeDigest(programFamily) { return Renderer.PROGRAM_FAMILIES.includes(programFamily) ? sha256({ programFamily, architectureVersion: 'CONSTRUCTION_PROGRAM_FAMILIES_V1', stateShape: stateShapes[programFamily], rollRouting: 'ONE_BASED_ROLL_MODULO_FAMILY_COUNT' }) : null; }

  function validBundle(bundle) {
    if (!bundle || bundle.schema !== 'axm.code.grammar-glass-construction-visual-bundle.v1' || bundle.result !== 'CONSTRUCTION_VISUAL_BUNDLE_READY_NO_SOURCE_BYTES' || !digestCurrent(bundle, 'constructionBundleSha256')) return false;
    if (!Number.isSafeInteger(bundle.roll) || bundle.roll < 0 || !Playground.MODES.includes(bundle.probeMode) || !Number.isFinite(bundle.probeStrength) || bundle.probeStrength < 0 || bundle.probeStrength > 1) return false;
    if (!bundle.adapter || !digestCurrent(bundle.adapter, 'adapterSha256') || bundle.adapterSha256 !== bundle.adapter.adapterSha256) return false;
    if (!bundle.direction || !digestCurrent(bundle.direction, 'directionSha256') || bundle.directionSha256 !== bundle.direction.directionSha256) return false;
    if (!bundle.plan || !digestCurrent(bundle.plan, 'constructionPlanSha256') || bundle.constructionPlanSha256 !== bundle.plan.constructionPlanSha256) return false;
    if (bundle.plan.adapterSha256 !== bundle.adapterSha256 || bundle.plan.directionSha256 !== bundle.directionSha256 || bundle.plan.combinationIdentitySha256 !== bundle.combinationIdentitySha256) return false;
    if (bundle.programFamily !== familyForRoll(bundle.roll) || bundle.programFamily !== bundle.plan.programFamily || bundle.plan.programFamilyIndex !== Renderer.PROGRAM_FAMILIES.indexOf(bundle.programFamily) || bundle.programShapeSha256 !== shapeDigest(bundle.programFamily) || bundle.programShapeSha256 !== bundle.plan.programShapeSha256) return false;
    if (bundle.adapter.rendererImplementationSha256 !== sha256(Renderer.implementationSource())) return false;
    if (!bundle.verification || bundle.verification.result !== 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS' || !digestCurrent(bundle.verification, 'verificationSha256') || bundle.verificationSha256 !== bundle.verification.verificationSha256) return false;
    if (!bundle.runRequest || bundle.runRequest.result !== 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED' || !digestCurrent(bundle.runRequest, 'requestSha256') || bundle.runRequestSha256 !== bundle.runRequest.requestSha256) return false;
    if (!bundle.expectedArtifact || bundle.verification.artifactSha256 !== bundle.expectedArtifact.artifactSha256 || bundle.runRequest.artifactSha256 !== bundle.expectedArtifact.artifactSha256) return false;
    return bundle.truth?.sourceTextStoredInBundle === false && !JSON.stringify(bundle).includes('<!doctype html>');
  }

  function validField(snapshot) {
    if (!Playground.validSnapshot(snapshot)) return false;
    const state = snapshot.constructionHand, coverage = state?.coverage, bundles = state?.bundles;
    if (!state || state.schema !== 'axm.code.grammar-glass-construction-hand-visual-state.v1' || !digestCurrent(state, 'visualStateSha256') || !Array.isArray(bundles)) return false;
    if (!coverage || coverage.schema !== 'axm.code.grammar-glass-construction-field-coverage.v1' || !digestCurrent(coverage, 'coverageSha256')) return false;
    const rolls = bundles.map(bundle => bundle.roll).sort((a, b) => a - b);
    const requestedRolls = coverage.requestedRolls, heldRolls = coverage.heldRolls;
    return bundles.every(validBundle) &&
      state.bundleCount === bundles.length && coverage.bundleCount === bundles.length &&
      Array.isArray(requestedRolls) && Array.isArray(heldRolls) && Array.isArray(coverage.attempts) &&
      coverage.requestedRollCount === requestedRolls.length && coverage.heldRollCount === heldRolls.length &&
      coverage.attempts.length === requestedRolls.length && new Set(requestedRolls).size === requestedRolls.length &&
      JSON.stringify(coverage.coveredRolls) === JSON.stringify(rolls) &&
      JSON.stringify(heldRolls) === JSON.stringify(requestedRolls.filter(roll => !rolls.includes(roll))) &&
      coverage.minimumCoveredRoll === (rolls.length ? rolls[0] : null) &&
      coverage.maximumCoveredRoll === (rolls.length ? rolls[rolls.length - 1] : null) &&
      coverage.distinctLanguageSetCount === new Set(bundles.map(bundle => [...bundle.languageIds].sort().join('|'))).size &&
      coverage.distinctConstructionPlanCount === new Set(bundles.map(bundle => bundle.constructionPlanSha256)).size &&
      coverage.distinctArtifactCount === new Set(bundles.map(bundle => bundle.expectedArtifact.artifactSha256)).size &&
      coverage.distinctProgramFamilyCount === new Set(bundles.map(bundle => bundle.programFamily)).size &&
      coverage.distinctProgramShapeCount === new Set(bundles.map(bundle => bundle.programShapeSha256)).size &&
      Renderer.PROGRAM_FAMILIES.every(programFamily => coverage.programFamilyCounts?.[programFamily] === bundles.filter(bundle => bundle.programFamily === programFamily).length) &&
      coverage.sourceTextStoredInCoverage === false;
  }

  function findBundle(snapshot, probe) {
    if (!Playground.validSnapshot(snapshot) || !probe || !probe.exploration?.combinationIdentitySha256) return null;
    const bundles = snapshot.constructionHand?.bundles || [];
    return bundles.find(bundle =>
      validBundle(bundle) &&
      bundle.combinationIdentitySha256 === probe.exploration.combinationIdentitySha256 &&
      bundle.probeSha256 === probe.probeSha256 &&
      bundle.roll === probe.roll && bundle.probeMode === probe.mode && bundle.probeStrength === probe.strength &&
      JSON.stringify(bundle.languageIds) === JSON.stringify(probe.languageIds)
    ) || null;
  }

  function fieldStatus(snapshot, probe = null) {
    if (!validField(snapshot)) return freeze({ result: 'VALID_CONSTRUCTION_FIELD_REQUIRED', bundleCount: 0, coveredRolls: [], exactPlanAvailable: false, authority: 'NONE' });
    const coverage = snapshot.constructionHand.coverage, exact = probe ? findBundle(snapshot, probe) : null;
    return freeze({
      schema: 'axm.code.grammar-glass-browser-construction-field-status.v1',
      result: exact ? 'EXACT_CONSTRUCTION_FIELD_PLAN_AVAILABLE' : probe ? 'CURRENT_PROBE_OUTSIDE_CONSTRUCTION_FIELD' : 'CONSTRUCTION_FIELD_READY_WAITING_FOR_PROBE',
      bundleCount: coverage.bundleCount,
      requestedRollCount: coverage.requestedRollCount,
      requestedRolls: [...coverage.requestedRolls],
      coveredRolls: [...coverage.coveredRolls],
      heldRollCount: coverage.heldRollCount,
      heldRolls: [...coverage.heldRolls],
      minimumCoveredRoll: coverage.minimumCoveredRoll,
      maximumCoveredRoll: coverage.maximumCoveredRoll,
      distinctLanguageSetCount: coverage.distinctLanguageSetCount,
      distinctConstructionPlanCount: coverage.distinctConstructionPlanCount,
      distinctArtifactCount: coverage.distinctArtifactCount,
      distinctProgramFamilyCount: coverage.distinctProgramFamilyCount,
      distinctProgramShapeCount: coverage.distinctProgramShapeCount,
      programFamilyCounts: { ...coverage.programFamilyCounts },
      currentRoll: probe?.roll ?? null,
      exactPlanAvailable: !!exact,
      exactConstructionPlanSha256: exact?.constructionPlanSha256 || null,
      exactProgramFamily: exact?.programFamily || null,
      truth: { coverageIsNotNoveltyOrQualityRanking: true, uncoveredProbeMustHold: !!probe && !exact, executionOccurred: false },
      authority: 'NONE'
    });
  }

  function artifactFromSource(bundle, utf8Text) {
    const plan = bundle.plan, adapter = bundle.adapter, byteLength = bytes(utf8Text);
    const fileCore = {
      path: 'index.html',
      mediaType: 'text/html; charset=utf-8',
      encoding: 'UTF-8',
      utf8Text,
      byteLength,
      sha256: sha256(utf8Text)
    };
    const receiptCore = {
      schema: 'axm.code.grammar-glass-constructed-artifact-receipt.v1',
      version: '1.0.0',
      result: 'CONSTRUCTED_ARTIFACT_DIGEST_RECEIPT_READY',
      constructionPlanSha256: plan.constructionPlanSha256,
      adapterSha256: adapter.adapterSha256,
      programFamily: plan.programFamily,
      programShapeSha256: plan.programShapeSha256,
      outputTarget: Renderer.OUTPUT_TARGET,
      fileCount: 1,
      fileManifest: [{ path: fileCore.path, mediaType: fileCore.mediaType, byteLength, sha256: fileCore.sha256 }],
      totalByteLength: byteLength,
      sourceTextStoredInReceipt: false,
      truth: { receiptIsNotStaticOrRuntimeVerification: true, candidateIsNotPromoted: true },
      authority: 'NONE'
    };
    const artifactReceipt = { ...receiptCore, artifactReceiptSha256: sha256(receiptCore) };
    const core = {
      schema: 'axm.code.grammar-glass-constructed-artifact.v1',
      version: '1.0.0',
      result: 'DETERMINISTIC_WEB_MICRO_APP_CANDIDATE_CONSTRUCTED_NOT_VERIFIED',
      constructionPlanSha256: plan.constructionPlanSha256,
      adapterSha256: adapter.adapterSha256,
      programFamily: plan.programFamily,
      programShapeSha256: plan.programShapeSha256,
      rendererImplementationSha256: adapter.rendererImplementationSha256,
      outputTarget: Renderer.OUTPUT_TARGET,
      files: [fileCore],
      artifactReceipt,
      lifecycle: {
        persistenceIntent: 'TRANSIENT_CANDIDATE',
        sourceTextIncludedInArtifact: true,
        sourceTextIncludedInDigestReceipt: false,
        sourceWorkspaceWritten: false,
        releaseAfterRunUnlessSeparatelySaved: true
      },
      truth: {
        exactSourceBytesConstructed: true,
        deterministicForExactPlanAndAdapter: true,
        constructionIsNotStaticVerification: true,
        constructionIsNotRuntimeExecution: true,
        constructionIsNotCorrectnessProof: true,
        automaticAdmissionSelectionOrPromotion: false
      },
      authority: adapter.authority
    };
    return { ...core, artifactSha256: sha256(core) };
  }

  function build(bundle) {
    if (!validBundle(bundle)) return freeze({ schema: 'axm.code.grammar-glass-browser-construction-replay.v1', result: 'VALID_EXACT_CONSTRUCTION_BUNDLE_REQUIRED', authority: 'NONE' });
    const utf8Text = Renderer.renderWebMicroApp(bundle.plan, bundle.adapter);
    const artifact = artifactFromSource(bundle, utf8Text);
    const cspMarker = `<meta http-equiv="Content-Security-Policy" content="${Renderer.escapeHtml(bundle.adapter.containmentContract.contentSecurityPolicy)}">`;
    const externalMarkup = /<script\b[^>]*\bsrc\s*=|<link\b|<iframe\b|<object\b|<embed\b|<form\b|\b(?:https?:)?\/\//i;
    const checks = {
      rendererImplementationMatch: bundle.adapter.rendererImplementationSha256 === sha256(Renderer.implementationSource()),
      artifactSha256Match: artifact.artifactSha256 === bundle.expectedArtifact.artifactSha256,
      artifactReceiptSha256Match: artifact.artifactReceipt.artifactReceiptSha256 === bundle.expectedArtifact.artifactReceiptSha256,
      fileSha256Match: artifact.files[0].sha256 === bundle.expectedArtifact.fileSha256,
      byteLengthMatch: artifact.files[0].byteLength === bundle.expectedArtifact.byteLength,
      staticVerificationBindingMatch: bundle.verification.artifactSha256 === artifact.artifactSha256,
      runRequestBindingMatch: bundle.runRequest.artifactSha256 === artifact.artifactSha256,
      cspPresent: utf8Text.includes(cspMarker),
      noExternalResourceMarkup: !externalMarkup.test(utf8Text),
      resourceCeilingPass: artifact.files[0].byteLength <= bundle.adapter.containmentContract.maximumArtifactBytes
    };
    const failedChecks = Object.entries(checks).filter(([, pass]) => pass !== true).map(([name]) => name);
    const receiptCore = {
      schema: 'axm.code.grammar-glass-browser-construction-replay-receipt.v1',
      version: '1.0.0',
      result: failedChecks.length ? 'BROWSER_CONSTRUCTION_REPLAY_FAIL' : 'BROWSER_CONSTRUCTION_REPLAY_VERIFIED',
      constructionBundleSha256: bundle.constructionBundleSha256,
      constructionPlanSha256: bundle.constructionPlanSha256,
      artifactSha256: artifact.artifactSha256,
      fileSha256: artifact.files[0].sha256,
      byteLength: artifact.files[0].byteLength,
      checks,
      failedChecks,
      sourceTextStoredInReceipt: false,
      truth: {
        exactBoundRendererReplayed: true,
        replayIsConstructionNotExecution: true,
        nodeStaticVerificationReusedByExactArtifactBinding: true,
        browserChecksDoNotProveRuntimeCorrectness: true,
        automaticPromotion: false
      },
      authority: 'NONE'
    };
    const replayReceipt = { ...receiptCore, replayReceiptSha256: sha256(receiptCore) };
    if (failedChecks.length) return freeze({ ...replayReceipt, artifact: null });
    return freeze({
      schema: 'axm.code.grammar-glass-browser-construction-replay.v1',
      version: '1.0.0',
      result: 'BROWSER_CONSTRUCTION_REPLAY_VERIFIED',
      bundle,
      artifact,
      runRequest: bundle.runRequest,
      replayReceipt,
      transientSource: {
        utf8Text,
        sha256: artifact.files[0].sha256,
        byteLength: artifact.files[0].byteLength,
        releaseRequired: true
      },
      truth: {
        sourceConstructedInBrowser: true,
        sourcePersistedByBuild: false,
        executionOccurred: false,
        explicitArmAndRunOnceRequired: true
      },
      authority: 'NONE'
    });
  }

  return Object.freeze({ canon, sha256, digestCurrent, familyForRoll, shapeDigest, validBundle, validField, findBundle, fieldStatus, artifactFromSource, build });
});
