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

  const unknownCore = JSON.parse(JSON.stringify(kilnCandidate));
  delete unknownCore.discoveryKilnCandidateSha256;
  unknownCore.groundedAtomRefs[0].atomType = 'UNKNOWN_ATOM';
  const unknownCandidate = { ...unknownCore, discoveryKilnCandidateSha256: glass.hash(unknownCore) };
  const missingRule = hand.createConstructionPlan({ kilnCandidate: unknownCandidate, adapter, direction });
  eq(missingRule.result, 'HELD_CONSTRUCTION_RULE_REQUIRED', 'unsupported universal role holds rather than guessing code');
  de(missingRule.missingRuleTypes, ['UNKNOWN_ATOM'], 'missing construction rule named');

  const tampered = JSON.parse(JSON.stringify(artifact));
  delete tampered.artifactSha256;
  tampered.files[0].utf8Text = tampered.files[0].utf8Text.replace('Lineage Signal', 'Tampered Signal');
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
