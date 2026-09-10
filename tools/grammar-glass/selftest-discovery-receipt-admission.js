'use strict';

const assert = require('assert/strict');
const kiln = require('./discovery-kiln-core.js');

const snapshot = {
  schema: 'axm.code.grammar-glass-visual-snapshot.v1',
  version: '1.4.0',
  rootSeed: 'receipt-admission:test',
  sourceMode: 'TEST_FIXTURE',
  sourceSha256: 'source:test',
  profileSnapshotSha256: 'profiles:test',
  cycle: {
    cycleSha256: 'cycle:test',
    conditionSha256: 'condition:test',
    atoms: [{
      atomId: 'js:state',
      atomSha256: 'atom:js:state',
      languageId: 'javascript',
      atomType: 'STATE',
      sourceProfileDigest: 'profile:js'
    }],
    edges: [],
    influenceCarries: [],
    formations: []
  },
  contactMemory: { multiHopPaths: [] },
  draftSky: [],
  mirrors: []
};

const preparation = {
  schema: 'axm.code.grammar-glass-discovery-preparation.v1',
  preparationSha256: 'preparation:test',
  combinationIdentitySha256: 'combination:test',
  construction: {
    constructionPlanSha256: 'plan:test',
    adapterSha256: 'adapter:test',
    expectedArtifactSha256: 'artifact:test',
    expectedFileSha256: 'file:test',
    runRequestSha256: 'request:test',
    executorProfileDigest: 'executor:test'
  }
};

const receiptCore = {
  schema: 'axm.code.grammar-glass-construction-browser-runtime-receipt.v1',
  version: '1.0.0',
  result: 'CONSTRUCTION_BROWSER_RUNTIME_OBSERVATION_SEALED',
  state: 'FAIL_OBSERVED',
  requestSha256: 'request:test',
  constructionPlanSha256: 'plan:test',
  adapterSha256: 'adapter:test',
  artifactSha256: 'artifact:test',
  fileSha256: 'file:test',
  executorProfileDigest: 'executor:test',
  runtimePayloadDigest: 'file:test',
  attempt: 1,
  observedMessageType: 'AXM_CONSTRUCTION_HAND_READY_V1',
  observedValue: 0,
  observedTicks: 0,
  invariantPass: false,
  opaqueOriginObserved: true,
  sandboxTokens: ['allow-scripts'],
  sourceWorkspaceWriteObserved: false,
  childProcessObserved: false,
  automaticRepeatObserved: false,
  transientPayloadReleasedAtSeal: false,
  truth: {
    runtimeMessageWasObserved: true,
    resultIsBoundToExactConstructedBytes: true,
    passMeansBoundedRuntimeInvariantOnly: true,
    passIsNotQualityCorrectnessAdmissionOrPromotion: true
  },
  authority: 'NONE'
};
const sealedFailure = {
  ...receiptCore,
  runtimeReceiptSha256: kiln.sha256(receiptCore)
};

let ledger = kiln.emptyLedger(snapshot);
ledger = kiln.recordConstructionReceipt(ledger, { preparation, receipt: sealedFailure });
assert.equal(
  kiln.combinationSummary(ledger, preparation.combinationIdentitySha256).resultHistory[0].resultClass,
  'FAIL_OBSERVED',
  'an unchanged sealed failure remains admissible as bounded evidence'
);

const changedAfterSeal = {
  ...sealedFailure,
  state: 'PASS_OBSERVED',
  invariantPass: true
};
assert.throws(
  () => kiln.recordConstructionReceipt(ledger, { preparation, receipt: changedAfterSeal }),
  /RECEIPT_INTEGRITY_INVALID/,
  'a failed observation changed to PASS under its retained digest must not enter append-only history'
);
assert.equal(ledger.eventCount, 1, 'rejected receipt leaves the prior ledger unchanged');

process.stdout.write(JSON.stringify({
  result: 'GRAMMAR_GLASS_DISCOVERY_RECEIPT_ADMISSION_SELFTEST_PASS',
  assertions: 3,
  rejectedRuntimeReceiptSha256: changedAfterSeal.runtimeReceiptSha256,
  threatBoundary: 'POST_SEAL_CONSTRUCTION_RECEIPT_MUTATION'
}, null, 2) + '\n');
