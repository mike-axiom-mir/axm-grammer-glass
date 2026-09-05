'use strict';
const assert = require('assert/strict');
const glass = require('./code-grammar-glass.js');
const hand = require('./code-grammar-glass-construction-hand.js');
const playground = require('../../../tools/grammar-glass/playground-core.js');
let n = 0;
const ok = (value, message) => { assert.ok(value, message); n += 1; };
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); n += 1; };
const de = (actual, expected, message) => { assert.deepEqual(actual, expected, message); n += 1; };

(function () {
  const source = glass.loadGrammarSource();
  const catalog = glass.createAtomCatalog(source);
  const condition = glass.createConditionRevision({
    values: { interactionsPerTick: 24, scheduledAtomBudget: 128, mirrorLens: 'DEPENDENCY_INTERFACE' },
    reason: 'CONSTRUCTION_HAND_SELFTEST'
  });
  const day = glass.createDayStart({
    source,
    catalog,
    conditionRevision: condition,
    dayId: 'construction-hand-selftest',
    rootSeed: '3f7c32de064b2e23a17ae4f06a26d4e998f8c2db2b240f2d2fd91d31002b77a4'
  });
  let cycle = glass.initializeCycle({ dayStart: day, catalog });
  cycle = glass.stepCycle({ cycle, catalog, conditionRevision: condition });
  const ledger = glass.createConstellationLedger({ dayStart: day, source, catalog });
  const visual = glass.createVisualSnapshot({ source, catalog, dayStart: day, conditionRevision: condition, cycle, mirrorObservations: [], ledger, stars: [] });
  const probe = playground.createProbe(visual, { languageIds: ['python', 'javascript', 'rust', 'sql'], mode: 'GRAVITY_WELL', roll: 11 });
  const kilnCandidate = glass.createDiscoveryKilnCandidate({ probe, cycle, catalog, conditionRevision: condition, dayStart: day });
  eq(kilnCandidate.result, 'HELD_ADAPTER_REQUIRED', 'Kiln executor hold does not prevent explicit source construction');

  const adapter = hand.createWebMicroAppAdapter();
  eq(typeof glass.createWebMicroAppConstructionAdapter, 'function', 'construction adapter exported on public Grammar Glass API');
  eq(typeof glass.constructWebMicroApp, 'function', 'artifact constructor exported on public Grammar Glass API');
  eq(typeof glass.createConstructionRunRequest, 'function', 'sandbox request constructor exported on public Grammar Glass API');
  eq(adapter.result, 'WEB_MICRO_APP_CONSTRUCTION_ADAPTER_READY', 'explicit renderer adapter ready');
  eq(adapter.bindingProblems.length, 0, 'HTML CSS and JavaScript source-bank bindings current');
  eq(adapter.sourceBankBindings.length, 3, 'three output grammar banks bound');
  eq(adapter.truth.machineKeyboardAndTemplateBanksEmitSource, false, 'intent banks do not get false source claim');
  eq(adapter.truth.thisAdapterIsTheExplicitSourceRenderer, true, 'new renderer boundary explicit');

  const direction = hand.createConstructionDirection({ projectId: 'grammar-glass' });
  const plan = hand.createConstructionPlan({ kilnCandidate, adapter, direction });
  eq(plan.result, 'DETERMINISTIC_WEB_MICRO_APP_CONSTRUCTION_PLAN_READY', 'construction plan ready');
  eq(plan.discoveryKilnCandidateSha256, kilnCandidate.discoveryKilnCandidateSha256, 'exact Kiln candidate bound');
  eq(plan.draftStarSha256, kilnCandidate.draftStar.starSha256, 'exact Draft Star bound');
  eq(plan.candidatePacketSha256, kilnCandidate.candidatePacket.candidatePacketSha256, 'exact inert packet bound');
  eq(plan.atomInfluenceReceipts.length, kilnCandidate.groundedAtomRefs.length, 'every selected atom has influence receipt');
  ok(plan.atomInfluenceReceipts.every(receipt => receipt.visibleLineageChip === true), 'every atom affects visible lineage');
  ok(plan.atomInfluenceReceipts.every(receipt => receipt.claimClass.includes('NOT_SOURCE_LANGUAGE_SEMANTIC_TRANSLATION')), 'structural analogy boundary retained');
  de(plan.atomInfluenceReceipts.map(receipt => receipt.atomId), kilnCandidate.groundedAtomRefs.map(atom => atom.atomId), 'atom order and identity preserved');
  eq(plan.truth.planContainsNoSourceBytes, true, 'plan remains digest and structure only');
  eq(plan.roll, 11, 'construction plan binds exact RNG roll');
  eq(plan.programFamily, 'STATE_ORBIT', 'one-based roll routes to deterministic program family');
  ok(hand.PROGRAM_FAMILIES.includes(plan.programFamily), 'plan family belongs to explicit renderer registry');

  const replayPlan = hand.createConstructionPlan({ kilnCandidate, adapter, direction });
  eq(replayPlan.constructionPlanSha256, plan.constructionPlanSha256, 'same candidate direction and adapter replay exact plan');
  const otherDirection = hand.createConstructionDirection({ projectId: 'grammar-glass', intentClass: 'ALTERNATE_MICRO_APP_EXPLORATION' });
  const otherPlan = hand.createConstructionPlan({ kilnCandidate, adapter, direction: otherDirection });
  ok(otherPlan.constructionPlanSha256 !== plan.constructionPlanSha256, 'changed explicit direction changes plan');

  const artifact = hand.constructWebMicroApp({ plan, adapter });
  eq(artifact.result, 'DETERMINISTIC_WEB_MICRO_APP_CANDIDATE_CONSTRUCTED_NOT_VERIFIED', 'genuine source artifact constructed');
  eq(artifact.files.length, 1, 'single offline file emitted');
  eq(artifact.files[0].path, 'index.html', 'index HTML emitted');
  ok(artifact.files[0].utf8Text.startsWith('<!doctype html>'), 'artifact contains real HTML source text');
  ok(artifact.files[0].utf8Text.includes('<style id="axm-style">'), 'artifact contains real CSS source text');
  ok(artifact.files[0].utf8Text.includes('<script id="axm-app">'), 'artifact contains real JavaScript source text');
  ok(artifact.files[0].utf8Text.includes(plan.constructionPlanSha256), 'source embeds exact plan lineage');
  eq(artifact.lifecycle.sourceWorkspaceWritten, false, 'construction does not write source workspace');
  eq(JSON.stringify(artifact.artifactReceipt).includes('<!doctype html>'), false, 'durable digest receipt excludes source text');
  const replayArtifact = hand.constructWebMicroApp({ plan, adapter });
  eq(replayArtifact.artifactSha256, artifact.artifactSha256, 'same exact inputs produce identical artifact digest');
  eq(replayArtifact.files[0].utf8Text, artifact.files[0].utf8Text, 'same exact inputs produce identical source bytes');
  const otherArtifact = hand.constructWebMicroApp({ plan: otherPlan, adapter });
  ok(otherArtifact.artifactSha256 !== artifact.artifactSha256, 'changed direction produces different artifact');

  const verification = hand.verifyWebMicroApp({ artifact, plan, adapter });
  eq(verification.result, 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS', 'exact artifact passes static verification');
  eq(verification.failedChecks.length, 0, 'no static verification failures');
  ok(verification.checks.find(check => check.code === 'JAVASCRIPT_SYNTAX_PASS').pass, 'JavaScript syntax parsed');
  ok(verification.checks.find(check => check.code === 'DEFAULT_DENY_CSP_PRESENT').pass, 'default-deny CSP present');
  ok(verification.checks.find(check => check.code === 'NO_EXTERNAL_RESOURCE_MARKUP').pass, 'external resource markup absent');
  ok(verification.checks.find(check => check.code === 'NO_DYNAMIC_CODE_NETWORK_OR_PERSISTENCE_API').pass, 'unsafe runtime APIs absent');
  eq(verification.truth.javascriptWasParsedNotExecuted, true, 'syntax verification does not claim execution');
  eq(JSON.stringify(verification).includes('<!doctype html>'), false, 'verification receipt excludes source text');
  ok(verification.checks.find(check => check.code === 'PROGRAM_FAMILY_BINDING_MATCH').pass, 'program family and shape are statically bound');

  const familyPlans = [1, 2, 3, 4].map(roll => {
    const languageIds = playground.rollLanguages(visual, { count: 5, roll });
    const familyProbe = playground.createProbe(visual, { languageIds, mode: 'GRAVITY_WELL', roll });
    const familyCandidate = glass.createDiscoveryKilnCandidate({ probe: familyProbe, cycle, catalog, conditionRevision: condition, dayStart: day });
    return hand.createConstructionPlan({ kilnCandidate: familyCandidate, adapter, direction });
  });
  de(familyPlans.map(item => item.programFamily), hand.PROGRAM_FAMILIES, 'first four RNG rolls cover all program architectures exactly once');
  eq(new Set(familyPlans.map(item => item.programShapeSha256)).size, 4, 'program architectures have four distinct shape receipts');
  const familyArtifacts = familyPlans.map(item => hand.constructWebMicroApp({ plan: item, adapter }));
  eq(new Set(familyArtifacts.map(item => item.artifactSha256)).size, 4, 'four program architectures emit distinct source artifacts');
  ok(familyArtifacts.every((item, index) => item.files[0].utf8Text.includes(`data-program-family="${hand.PROGRAM_FAMILIES[index]}"`)), 'every artifact visibly binds its exact program family');
  ok(familyArtifacts.every((item, index) => hand.verifyWebMicroApp({ artifact: item, plan: familyPlans[index], adapter }).result === 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS'), 'all four program architectures pass exact static verification');

  const noExecutor = hand.createConstructionRunRequest({ artifact, verification, plan });
  eq(noExecutor.result, 'HELD_CONSTRUCTION_EXECUTOR_REQUIRED', 'missing executor produces truthful hold');
  eq(noExecutor.truth.executionOccurred, false, 'executor hold is not execution');
  const policy = glass.createInterglassPolicy({ persistenceIntent: 'TRANSIENT', maxAttempts: 1 });
  const executorProfile = glass.createBrowserSandboxExecutorProfile({ policy });
  const runRequest = hand.createConstructionRunRequest({ artifact, verification, plan, executorProfile });
  eq(runRequest.result, 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED', 'verified artifact becomes sandbox-ready request');
  eq(runRequest.requiredContract.networkMode, 'NONE', 'sandbox request forbids network');
  eq(runRequest.requiredContract.opaqueOrigin, true, 'sandbox request requires opaque origin');
  eq(runRequest.transientPayload.sourceTextIncludedInRequest, false, 'durable run request excludes source text');
  eq(runRequest.truth.requestIsNotExecution, true, 'run request remains unexecuted');
  eq(JSON.stringify(runRequest).includes('<!doctype html>'), false, 'run request stores only digest receipt');
  const launchEnvelope = hand.createTransientLaunchEnvelope({ artifact, verification, runRequest });
  eq(launchEnvelope.result, 'TRANSIENT_CONSTRUCTION_LAUNCH_ENVELOPE_READY_FOR_EXPLICIT_ARM', 'separate launch payload ready');
  eq(launchEnvelope.srcdocSha256, artifact.files[0].sha256, 'launch payload exact source digest bound');
  eq(launchEnvelope.srcdocUtf8, artifact.files[0].utf8Text, 'launch payload contains exact verified source');
  eq(launchEnvelope.lifecycle.explicitArmRequired, true, 'explicit arm preserved');
  eq(launchEnvelope.truth.envelopeIsNotExecution, true, 'launch envelope remains unexecuted');

  const visualBundle = hand.createConstructionVisualBundle({ kilnCandidate, plan, adapter, direction, executorProfile });
  eq(visualBundle.result, 'CONSTRUCTION_VISUAL_BUNDLE_READY_NO_SOURCE_BYTES', 'viewer bundle prepared from exact verified source lineage');
  eq(visualBundle.combinationIdentitySha256, probe.exploration.combinationIdentitySha256, 'viewer bundle exact combination bound');
  eq(visualBundle.roll, 11, 'viewer bundle retains exact RNG roll');
  eq(visualBundle.probeMode, 'GRAVITY_WELL', 'viewer bundle retains exact probe mode');
  eq(visualBundle.probeStrength, .72, 'viewer bundle retains exact probe strength');
  eq(visualBundle.expectedArtifact.artifactSha256, artifact.artifactSha256, 'viewer bundle carries expected artifact digest');
  eq(visualBundle.runRequest.result, 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED', 'viewer bundle carries its exact unexecuted sandbox request');
  eq(JSON.stringify(visualBundle).includes('<!doctype html>'), false, 'viewer bundle excludes source text');
  const augmentedVisual = hand.augmentVisualSnapshotWithConstructionHand({ visualSnapshot: visual, bundles: [visualBundle] });
  eq(augmentedVisual.constructionHand.result, 'CONSTRUCTION_HAND_EXACT_PLANS_AVAILABLE', 'visual snapshot exposes exact construction plan');
  eq(augmentedVisual.constructionHand.bundleCount, 1, 'one exact construction bundle exposed');
  eq(augmentedVisual.constructionHand.coverage.bundleCount, 1, 'construction field coverage counts exact bundles');
  de(augmentedVisual.constructionHand.coverage.coveredRolls, [11], 'construction field retains covered rolls');
  eq(augmentedVisual.constructionHand.coverage.distinctConstructionPlanCount, 1, 'construction field counts distinct plans');
  eq(augmentedVisual.constructionHand.coverage.distinctArtifactCount, 1, 'construction field counts distinct artifacts');
  ok(glass.digestCurrent(augmentedVisual.constructionHand.coverage, 'coverageSha256'), 'construction field coverage digest current');
  eq(augmentedVisual.constructionHand.bundles[0].constructionBundleSha256, visualBundle.constructionBundleSha256, 'visual bundle retained exactly');
  eq(augmentedVisual.truth.constructionSourceStoredInSnapshot, false, 'visual snapshot remains source-free');
  eq(augmentedVisual.truth.constructionExecutionOccurred, false, 'visual augmentation does not execute');
  ok(glass.digestCurrent(augmentedVisual, 'visualSnapshotSha256'), 'augmented visual snapshot digest current');

  const unknownCore = JSON.parse(JSON.stringify(kilnCandidate));
  delete unknownCore.discoveryKilnCandidateSha256;
  unknownCore.groundedAtomRefs[0].atomType = 'UNKNOWN_ATOM';
  const unknownCandidate = { ...unknownCore, discoveryKilnCandidateSha256: glass.hash(unknownCore) };
  const missingRule = hand.createConstructionPlan({ kilnCandidate: unknownCandidate, adapter, direction });
  eq(missingRule.result, 'HELD_CONSTRUCTION_RULE_REQUIRED', 'unsupported universal role holds rather than guessing code');
  de(missingRule.missingRuleTypes, ['UNKNOWN_ATOM'], 'missing construction rule named');

  const reroutedPlanCore = JSON.parse(JSON.stringify(plan));
  delete reroutedPlanCore.constructionPlanSha256;
  reroutedPlanCore.programFamily = 'RECEIPT_LEDGER';
  reroutedPlanCore.programFamilyIndex = 3;
  reroutedPlanCore.programShapeSha256 = hand.programShapeDigest('RECEIPT_LEDGER');
  const reroutedPlan = { ...reroutedPlanCore, constructionPlanSha256: glass.hash(reroutedPlanCore) };
  eq(hand.constructWebMicroApp({ plan: reroutedPlan, adapter }).result, 'VALID_CONSTRUCTION_PLAN_REQUIRED', 'digest-current roll-to-family reroute tamper fails closed');

  const tampered = JSON.parse(JSON.stringify(artifact));
  delete tampered.artifactSha256;
  tampered.files[0].utf8Text = tampered.files[0].utf8Text.replace('State Orbit', 'Tampered Orbit');
  tampered.files[0].byteLength = Buffer.byteLength(tampered.files[0].utf8Text, 'utf8');
  tampered.files[0].sha256 = glass.hash(tampered.files[0].utf8Text);
  const receiptCore = { ...tampered.artifactReceipt };
  delete receiptCore.artifactReceiptSha256;
  receiptCore.fileManifest[0].byteLength = tampered.files[0].byteLength;
  receiptCore.fileManifest[0].sha256 = tampered.files[0].sha256;
  receiptCore.totalByteLength = tampered.files[0].byteLength;
  tampered.artifactReceipt = { ...receiptCore, artifactReceiptSha256: glass.hash(receiptCore) };
  tampered.artifactSha256 = glass.hash(tampered);
  const tamperedVerification = hand.verifyWebMicroApp({ artifact: tampered, plan, adapter });
  eq(tamperedVerification.result, 'WEB_MICRO_APP_STATIC_VERIFICATION_FAIL', 'digest-current but renderer-divergent source fails verification');
  ok(tamperedVerification.failedChecks.includes('EXACT_RENDERER_REPLAY_MATCH'), 'exact renderer mismatch named');
  const heldRun = hand.createConstructionRunRequest({ artifact: tampered, verification: tamperedVerification, plan, executorProfile });
  eq(heldRun.result, 'CONSTRUCTION_RUN_HELD_STATIC_VERIFICATION_FAILED', 'failed static verification cannot become runnable request');

  const snap = hand.snapshot();
  eq(snap.truth.genuineSourceBytesCanBeConstructed, true, 'snapshot claims bounded real source capability');
  eq(snap.truth.arbitraryUnboundedSourceGenerationImplemented, false, 'snapshot refuses arbitrary-source overclaim');
  eq(snap.truth.automaticExecutionSelectionPromotionOrCanon, false, 'authority boundary unchanged');
  process.stdout.write(JSON.stringify({
    result: 'GRAMMAR_GLASS_CONSTRUCTION_HAND_SELFTEST_PASS',
    assertions: n,
    constructionPlanSha256: plan.constructionPlanSha256,
    artifactSha256: artifact.artifactSha256,
    verificationSha256: verification.verificationSha256,
    runRequestSha256: runRequest.requestSha256
  }, null, 2) + '\n');
})();
