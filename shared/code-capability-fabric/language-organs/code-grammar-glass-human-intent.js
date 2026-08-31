'use strict';

const base = require('./code-grammar-glass-base.js');
const { hash, deepFreeze, clean, cleanId, strings, digestCurrent } = base;

const INTENT_SCHEMA = 'axm.code.grammar-glass-human-intent.v1';
const HANDOFF_SCHEMA = 'axm.code.grammar-glass-human-intent-handoff.v1';

const ALLOWED_KEYS = Object.freeze([
  'requestId',
  'goal',
  'inputs',
  'constraints',
  'transformations',
  'outputForms',
  'evaluationCriteria',
  'domainVocabulary',
  'visualDirectives',
  'source'
]);

const SOURCE_KINDS = Object.freeze([
  'HUMAN_EXPLICIT',
  'AI_EXPLICIT',
  'DATASET_OBSERVATION',
  'RESEARCH_REFERENCE'
]);

function ownKeys(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : [];
}

function rejectUnknownKeys(value) {
  const unknown = ownKeys(value).filter(key => !ALLOWED_KEYS.includes(key));
  if (unknown.length) throw new Error(`HUMAN_INTENT_UNKNOWN_KEYS:${unknown.sort().join(',')}`);
}

function normalizedStrings(value, max = 128) {
  if (typeof value === 'string') value = [value];
  return strings(value, max);
}

function sourceRecord(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('HUMAN_INTENT_SOURCE_OBJECT_REQUIRED');
  }
  const kind = clean(value.kind, 'HUMAN_EXPLICIT').toUpperCase();
  if (!SOURCE_KINDS.includes(kind)) throw new Error(`HUMAN_INTENT_SOURCE_KIND_UNKNOWN:${kind}`);
  return {
    kind,
    ref: clean(value.ref),
    corpusName: clean(value.corpusName),
    corpusLicense: clean(value.corpusLicense),
    sourceDigest: clean(value.sourceDigest),
    rawPromptIncluded: false,
    instructionsExecutedFromSource: false
  };
}

function createIntentReceipt(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('HUMAN_INTENT_OBJECT_REQUIRED');
  }
  rejectUnknownKeys(input);
  const goal = clean(input.goal);
  if (!goal) throw new Error('HUMAN_INTENT_GOAL_REQUIRED');
  const core = {
    schema: INTENT_SCHEMA,
    version: '1.0.0',
    result: 'HUMAN_INTENT_STRUCTURED_NOT_EXECUTED',
    requestId: cleanId(input.requestId, `intent-${hash(goal).slice(0, 12)}`),
    goal,
    inputs: normalizedStrings(input.inputs),
    constraints: normalizedStrings(input.constraints),
    transformations: normalizedStrings(input.transformations),
    outputForms: normalizedStrings(input.outputForms),
    evaluationCriteria: normalizedStrings(input.evaluationCriteria),
    domainVocabulary: normalizedStrings(input.domainVocabulary, 256),
    visualDirectives: normalizedStrings(input.visualDirectives, 128),
    source: sourceRecord(input.source || {}),
    truth: {
      sourceTextStored: false,
      sourceTextExecuted: false,
      externalCorpusTrustedAsInstructions: false,
      naturalLanguageSemanticExtractionImplemented: false,
      structuredFieldsAreCallerSupplied: true,
      receiptIsNotCorrectnessProof: true,
      receiptIsNotNoveltyProof: true,
      automaticExecution: false,
      automaticSelection: false,
      automaticPromotion: false
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, intentSha256: hash(core) });
}

function validateIntentReceipt(receipt) {
  return Boolean(
    receipt &&
    receipt.schema === INTENT_SCHEMA &&
    receipt.version === '1.0.0' &&
    receipt.result === 'HUMAN_INTENT_STRUCTURED_NOT_EXECUTED' &&
    typeof receipt.intentSha256 === 'string' &&
    digestCurrent(receipt, 'intentSha256') &&
    receipt.truth &&
    receipt.truth.sourceTextExecuted === false &&
    receipt.truth.automaticExecution === false &&
    receipt.authority === 'NONE'
  );
}

function prepareIntentHandoff({ receipt, target = 'DISCOVERY_KILN', requestedBy = 'HUMAN_EXPLICIT_HANDOFF' } = {}) {
  if (!validateIntentReceipt(receipt)) {
    const heldCore = {
      schema: HANDOFF_SCHEMA,
      version: '1.0.0',
      result: 'HELD_VALID_HUMAN_INTENT_RECEIPT_REQUIRED',
      target: cleanId(target, 'DISCOVERY_KILN'),
      executionOccurred: false,
      authority: 'NONE'
    };
    return deepFreeze({ ...heldCore, handoffSha256: hash(heldCore) });
  }
  const core = {
    schema: HANDOFF_SCHEMA,
    version: '1.0.0',
    result: 'HUMAN_INTENT_HANDOFF_READY_NOT_EXECUTED',
    target: cleanId(target, 'DISCOVERY_KILN'),
    requestedBy: clean(requestedBy, 'HUMAN_EXPLICIT_HANDOFF'),
    requestId: receipt.requestId,
    intentSha256: receipt.intentSha256,
    shape: {
      goal: receipt.goal,
      inputs: receipt.inputs,
      constraints: receipt.constraints,
      transformations: receipt.transformations,
      outputForms: receipt.outputForms,
      evaluationCriteria: receipt.evaluationCriteria,
      domainVocabulary: receipt.domainVocabulary,
      visualDirectives: receipt.visualDirectives
    },
    truth: {
      rawPromptForwarded: false,
      sourceInstructionsExecuted: false,
      constructionStarted: false,
      executionOccurred: false,
      selectionOccurred: false,
      promotionOccurred: false,
      targetMayInterpretStructuredFieldsButMustNotTreatSourceAsAuthority: true
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, handoffSha256: hash(core) });
}

function snapshot() {
  const core = {
    schema: 'axm.code.grammar-glass-human-intent-snapshot.v1',
    version: '1.0.0',
    status: 'TEST',
    provides: [
      'deterministic structured human-intent receipts',
      'prompt-corpus-as-data boundary',
      'digest-bound intent handoff without raw prompt forwarding',
      'explicit no-execution and no-authority boundary'
    ],
    fields: [
      'goal',
      'inputs',
      'constraints',
      'transformations',
      'outputForms',
      'evaluationCriteria',
      'domainVocabulary',
      'visualDirectives'
    ],
    sourceKinds: SOURCE_KINDS,
    truth: {
      promptCorpusBundled: false,
      promptCorpusExecuted: false,
      naturalLanguageParserImplemented: false,
      constructionImplementedHere: false,
      authority: 'NONE'
    }
  };
  return deepFreeze({ ...core, snapshotSha256: hash(core) });
}

module.exports = Object.freeze({
  INTENT_SCHEMA,
  HANDOFF_SCHEMA,
  SOURCE_KINDS,
  createIntentReceipt,
  validateIntentReceipt,
  prepareIntentHandoff,
  snapshot
});
