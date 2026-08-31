'use strict';
const assert = require('assert/strict');
const glass = require('../../shared/code-capability-fabric/language-organs/code-grammar-glass.js');
const hand = require('../../shared/code-capability-fabric/language-organs/code-grammar-glass-construction-hand.js');
const playground = require('./playground-core.js');
const browserHand = require('./construction-hand-core.js');
const kiln = require('./discovery-kiln-core.js');
const executorCore = require('./construction-hand-executor-core.js');
let n = 0;
const ok = (value, message) => { assert.ok(value, message); n += 1; };
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); n += 1; };

const source = glass.loadGrammarSource();
const catalog = glass.createAtomCatalog(source);
const condition = glass.createConditionRevision({
  values: { interactionsPerTick: 24, scheduledAtomBudget: 128, mirrorLens: 'DEPENDENCY_INTERFACE' },
  reason: 'CONSTRUCTION_HAND_VIEWER_SELFTEST'
});
const day = glass.createDayStart({
  source,
  catalog,
  conditionRevision: condition,
  dayId: 'construction-hand-viewer-selftest',
  rootSeed: '6d2cab21f1aad70bf521299434313d3d7176bab291feb359a04ad44bc44e2130'
});
let cycle = glass.initializeCycle({ dayStart: day, catalog });
cycle = glass.stepCycle({ cycle, catalog, conditionRevision: condition });
const visualBase = glass.createVisualSnapshot({
  source,
  catalog,
  dayStart: day,
  conditionRevision: condition,
  cycle,
  mirrorObservations: [],
  ledger: glass.createConstellationLedger({ dayStart: day, source, catalog }),
  stars: []
});
const languageIds = playground.rollLanguages(visualBase, { count: 5, roll: 1 });
const probe = playground.createProbe(visualBase, { languageIds, mode: 'GRAVITY_WELL', strength: 0.72, roll: 1 });
const candidate = glass.createDiscoveryKilnCandidate({ probe, cycle, catalog, conditionRevision: condition, dayStart: day });
const adapter = hand.createWebMicroAppAdapter();
const direction = hand.createConstructionDirection({ projectId: 'grammar-glass' });
const plan = hand.createConstructionPlan({ kilnCandidate: candidate, adapter, direction });
const policy = glass.createInterglassPolicy({ persistenceIntent: 'TRANSIENT', maxAttempts: 1 });
const profile = glass.createBrowserSandboxExecutorProfile({ policy });
const bundle = hand.createConstructionVisualBundle({ kilnCandidate: candidate, plan, adapter, direction, executorProfile: profile });
const visual = hand.augmentVisualSnapshotWithConstructionHand({ visualSnapshot: visualBase, bundles: [bundle] });

ok(browserHand.validBundle(bundle), 'exact source-free visual bundle validates in browser core');
eq(browserHand.findBundle(visual, probe).constructionBundleSha256, bundle.constructionBundleSha256, 'exact probe finds exact bundle');
eq(JSON.stringify(visual).includes('<!doctype html>'), false, 'visual snapshot stores no generated source bytes');
const preparation = kiln.createPreparation({ snapshot: visual, probe, ledger: kiln.emptyLedger(visual) });
eq(preparation.result, 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN', 'Kiln binds exact precomputed construction plan');
eq(preparation.construction.constructionPlanSha256, plan.constructionPlanSha256, 'preparation retains exact plan digest');
eq(preparation.grounding.selectedAtomCount, candidate.groundedAtomRefs.length, 'preparation uses exact construction atom set');
eq(preparation.truth.constructionSourceBytesCreatedDuringPreparation, false, 'preparation remains source-free');

const build = browserHand.build(bundle);
eq(build.result, 'BROWSER_CONSTRUCTION_REPLAY_VERIFIED', 'browser renderer replay verifies');
eq(build.artifact.artifactSha256, bundle.expectedArtifact.artifactSha256, 'browser artifact digest matches Node-built expected artifact');
eq(build.transientSource.sha256, bundle.expectedArtifact.fileSha256, 'browser source byte digest matches expected file');
eq(build.transientSource.byteLength, bundle.expectedArtifact.byteLength, 'browser source byte length matches expected file');
ok(build.transientSource.utf8Text.includes('AXM_CONSTRUCTION_HAND_READY_V1'), 'runtime source contains bounded ready observation');
ok(build.transientSource.utf8Text.includes('AXM_CONSTRUCTION_HAND_CRASH_V1'), 'runtime source contains bounded crash observation');
eq(build.truth.executionOccurred, false, 'build is not execution');

function fakeFrame() {
  return {
    sandboxTokens: null,
    armed: false,
    loaded: null,
    released: false,
    setSandbox(tokens) { this.sandboxTokens = tokens; },
    showArmed() { this.armed = true; },
    load(sourceText) { this.loaded = sourceText; },
    release() { this.loaded = null; this.released = true; }
  };
}
let timeoutCallback = null;
const executor = executorCore.createExecutor({ setTimer(fn) { timeoutCallback = fn; return 1; }, clearTimer() { timeoutCallback = null; } });
const frame = fakeFrame();
eq(executor.arm(build, frame).state, 'EXECUTION_READY', 'exact build explicitly arms');
eq(frame.armed, true, 'arm shows non-executing placeholder');
eq(frame.loaded, null, 'arm does not load source');
eq(executor.runOnce(), true, 'first explicit run accepted');
eq(frame.loaded, build.transientSource.utf8Text, 'run loads exact transient source once');
eq(executor.runOnce(), false, 'second run refused');
const passReceipt = executor.acceptObservation({
  type: 'AXM_CONSTRUCTION_HAND_READY_V1',
  constructionPlanSha256: plan.constructionPlanSha256,
  adapterSha256: adapter.adapterSha256,
  value: plan.parameters.initialValue,
  ticks: 0,
  invariantPass: true
}, { opaqueOrigin: true });
eq(passReceipt.state, 'PASS_OBSERVED', 'exact opaque-origin invariant observation passes');
eq(passReceipt.runtimePayloadDigest, bundle.expectedArtifact.fileSha256, 'runtime receipt binds exact source bytes');
eq(passReceipt.truth.passIsNotQualityCorrectnessAdmissionOrPromotion, true, 'PASS boundary explicit');
eq(executor.snapshot().terminalState, 'PASS_OBSERVED', 'terminal result remains visible after sealing');
eq(executor.release(), true, 'transient source explicitly released');
eq(executor.snapshot().sourceHeld, false, 'source no longer retained by executor');
eq(frame.released, true, 'isolated frame replaced on release');

const failExecutor = executorCore.createExecutor({ setTimer() { return 2; }, clearTimer() {} });
failExecutor.arm(build, fakeFrame());
failExecutor.runOnce();
const failReceipt = failExecutor.acceptObservation({
  type: 'AXM_CONSTRUCTION_HAND_READY_V1',
  constructionPlanSha256: plan.constructionPlanSha256,
  adapterSha256: adapter.adapterSha256,
  value: plan.parameters.initialValue,
  ticks: 0,
  invariantPass: true
}, { opaqueOrigin: false });
eq(failReceipt.state, 'FAIL_OBSERVED', 'non-opaque observation fails containment check');

const crashExecutor = executorCore.createExecutor({ setTimer() { return 4; }, clearTimer() {} });
crashExecutor.arm(build, fakeFrame());
crashExecutor.runOnce();
const crashReceipt = crashExecutor.acceptObservation({
  type: 'AXM_CONSTRUCTION_HAND_CRASH_V1',
  constructionPlanSha256: plan.constructionPlanSha256,
  adapterSha256: adapter.adapterSha256,
  message: 'bounded fixture crash',
  invariantPass: false
}, { opaqueOrigin: true });
eq(crashReceipt.state, 'CRASH_OBSERVED', 'bound crash message seals crash receipt');

let fireTimeout = null;
const timeoutExecutor = executorCore.createExecutor({ setTimer(fn) { fireTimeout = fn; return 3; }, clearTimer() {} });
timeoutExecutor.arm(build, fakeFrame());
timeoutExecutor.runOnce();
fireTimeout();
eq(timeoutExecutor.snapshot().terminalState, 'TIMEOUT_OBSERVED', 'missing observation seals timeout');

let ledger = kiln.emptyLedger(visual);
ledger = kiln.recordPreparation(ledger, preparation);
ledger = kiln.recordConstructionReceipt(ledger, { preparation, receipt: passReceipt });
const summary = kiln.combinationSummary(ledger, probe.exploration.combinationIdentitySha256);
eq(summary.localStatus, 'TESTED_IN_THIS_LEDGER', 'construction receipt marks exact combination locally tested');
eq(summary.testCount, 1, 'construction test counted exactly once');
eq(summary.resultHistory[0].constructionPlanSha256, plan.constructionPlanSha256, 'ledger history binds plan digest');
assert.throws(() => kiln.recordConstructionReceipt(ledger, { preparation, receipt: { ...passReceipt, artifactSha256: 'wrong' } }), /LINEAGE_MISMATCH/); n += 1;

const unmatchedProbe = playground.createProbe(visual, { languageIds, mode: 'GRAVITY_WELL', strength: 0.72, roll: 2 });
eq(browserHand.findBundle(visual, unmatchedProbe), null, 'different RNG roll cannot reuse exact bundle');
eq(kiln.createPreparation({ snapshot: visual, probe: unmatchedProbe, ledger: kiln.emptyLedger(visual) }).result, 'HELD_ADAPTER_REQUIRED', 'unmatched combination remains visibly held');

process.stdout.write(JSON.stringify({
  result: 'GRAMMAR_GLASS_CONSTRUCTION_HAND_VIEWER_SELFTEST_PASS',
  assertions: n,
  constructionPlanSha256: plan.constructionPlanSha256,
  artifactSha256: build.artifact.artifactSha256,
  runtimeReceiptSha256: passReceipt.runtimeReceiptSha256,
  ledgerSha256: ledger.ledgerSha256
}, null, 2) + '\n');
