'use strict';

const assert = require('assert/strict');
const ConstructionHand = require('./construction-hand-core.js');
const ExecutorCore = require('./construction-hand-executor-core.js');

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

const forgedSource = '<!doctype html><html><body><script>globalThis.FORGED_EXECUTION_ADMISSION_SHOULD_NOT_ARM=true</script></body></html>';
const forgedSha256 = ConstructionHand.sha256(forgedSource);
const forgedBuild = {
  schema: 'axm.code.grammar-glass-browser-construction-replay.v1',
  version: '1.0.0',
  result: 'BROWSER_CONSTRUCTION_REPLAY_VERIFIED',
  artifact: {
    artifactSha256: 'forged-artifact-not-a-digest',
    constructionPlanSha256: 'forged-plan-not-a-digest',
    adapterSha256: 'forged-adapter-not-a-digest',
    files: [{ sha256: forgedSha256 }]
  },
  runRequest: {
    result: 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED',
    artifactSha256: 'forged-artifact-not-a-digest',
    constructionPlanSha256: 'forged-plan-not-a-digest',
    requestSha256: 'forged-request-not-a-digest',
    executorProfileDigest: 'forged-profile-not-a-digest',
    executorProfile: {
      allowSameOrigin: false,
      sandboxTokens: ['allow-scripts'],
      networkMode: 'NONE'
    },
    resourceCeilings: {
      maxAttempts: 1,
      timeoutMs: 1000
    }
  },
  transientSource: {
    utf8Text: forgedSource,
    sha256: forgedSha256,
    byteLength: Buffer.byteLength(forgedSource, 'utf8'),
    releaseRequired: true
  },
  truth: {
    sourceConstructedInBrowser: true,
    sourcePersistedByBuild: false,
    executionOccurred: false,
    explicitArmAndRunOnceRequired: true
  },
  authority: 'NONE'
};

const frame = fakeFrame();
const executor = ExecutorCore.createExecutor({
  setTimer() { throw new Error('timer must not be reached while admission is rejected'); },
  clearTimer() {}
});

assert.equal(
  executor.arm(forgedBuild, frame),
  null,
  'executor must reject a caller-fabricated VERIFIED wrapper that did not come from exact browser replay'
);
assert.equal(frame.armed, false, 'rejected build must not arm the frame');
assert.equal(frame.sandboxTokens, null, 'rejected build must not mutate sandbox policy');
assert.equal(frame.loaded, null, 'rejected build must not load source');
assert.equal(executor.snapshot().state, 'EMPTY', 'rejected build must leave executor empty');

process.stdout.write(JSON.stringify({
  result: 'GRAMMAR_GLASS_CONSTRUCTION_EXECUTOR_ADMISSION_SELFTEST_PASS',
  assertions: 5,
  rejectedSourceSha256: forgedSha256,
  threatBoundary: 'CALLER_FABRICATED_BROWSER_REPLAY_WRAPPER'
}, null, 2) + '\n');
