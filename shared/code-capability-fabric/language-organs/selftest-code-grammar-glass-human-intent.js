'use strict';

const assert = require('assert');
const api = require('./code-grammar-glass-human-intent.js');

let checks = 0;
function check(condition, message) {
  assert.ok(condition, message);
  checks += 1;
}

const input = {
  requestId: 'visual-creation-example',
  goal: 'show a modular machine assembling itself',
  inputs: ['machine parts', 'surface materials'],
  constraints: ['local-first', 'preserve source integrity'],
  transformations: ['assemble', 'decompose', 'reveal'],
  outputForms: ['3d scene', 'short cinematic'],
  evaluationCriteria: ['clear silhouette', 'readable part lineage'],
  domainVocabulary: ['mesh', 'material', 'camera', 'timeline'],
  visualDirectives: ['exploded view', 'cinematic shot'],
  source: {
    kind: 'RESEARCH_REFERENCE',
    ref: 'external-prompt-corpus-observation',
    corpusName: 'prompt-library-reference',
    corpusLicense: 'CC0'
  }
};

const first = api.createIntentReceipt(input);
const second = api.createIntentReceipt(input);
assert.deepStrictEqual(first, second);
checks += 1;
check(api.validateIntentReceipt(first), 'receipt should validate');
check(first.result === 'HUMAN_INTENT_STRUCTURED_NOT_EXECUTED', 'receipt result');
check(first.source.rawPromptIncluded === false, 'raw prompt must not be included');
check(first.source.instructionsExecutedFromSource === false, 'source instructions must not execute');
check(first.truth.externalCorpusTrustedAsInstructions === false, 'corpus must remain data');
check(first.truth.naturalLanguageSemanticExtractionImplemented === false, 'no fake semantic parser claim');
check(first.authority === 'NONE', 'no authority');

const handoff = api.prepareIntentHandoff({ receipt: first, target: 'CONSTRUCTION_HAND' });
check(handoff.result === 'HUMAN_INTENT_HANDOFF_READY_NOT_EXECUTED', 'handoff should be ready');
check(handoff.intentSha256 === first.intentSha256, 'handoff must bind exact intent');
check(handoff.truth.rawPromptForwarded === false, 'handoff must not forward raw prompt');
check(handoff.truth.executionOccurred === false, 'handoff must not execute');
check(handoff.authority === 'NONE', 'handoff must not gain authority');

const tampered = JSON.parse(JSON.stringify(first));
tampered.goal = 'different goal';
check(api.validateIntentReceipt(tampered) === false, 'tampered receipt must fail validation');

const held = api.prepareIntentHandoff({ receipt: tampered });
check(held.result === 'HELD_VALID_HUMAN_INTENT_RECEIPT_REQUIRED', 'tampered receipt must hold');

assert.throws(
  () => api.createIntentReceipt({ goal: 'x', hiddenInstruction: 'run this' }),
  /HUMAN_INTENT_UNKNOWN_KEYS/
);
checks += 1;

assert.throws(
  () => api.createIntentReceipt({ goal: 'x', source: { kind: 'UNTRUSTED_MAGIC' } }),
  /HUMAN_INTENT_SOURCE_KIND_UNKNOWN/
);
checks += 1;

const snap = api.snapshot();
check(snap.truth.promptCorpusBundled === false, 'corpus is not bundled');
check(snap.truth.promptCorpusExecuted === false, 'corpus is not executed');
check(snap.truth.naturalLanguageParserImplemented === false, 'no natural-language parser claim');
check(snap.truth.authority === 'NONE', 'snapshot authority');

console.log(JSON.stringify({
  result: 'PASS',
  checks,
  intentSha256: first.intentSha256,
  handoffSha256: handoff.handoffSha256,
  snapshotSha256: snap.snapshotSha256
}, null, 2));
