'use strict';

const base = require('./code-grammar-glass-base.js');
const cycleApi = require('./code-grammar-glass-cycle.js');
const observation = require('./code-grammar-glass-observation.js');
const memory = require('./code-grammar-glass-memory.js');
const interglass = require('./code-grammar-glass-interglass.js');

const {
  AUTHORITY,
  hash,
  deepFreeze,
  cleanId,
  digestCurrent,
  deriveSeed
} = base;

const DISCOVERY_KILN_STATES = Object.freeze([
  'ROLLED',
  'GROUNDED',
  'HELD',
  'DRAFT_STAR',
  'CANDIDATE',
  'SANDBOX',
  'RECEIPT'
]);

function validProbe(probe) {
  if (!probe || probe.schema !== 'axm.code.grammar-glass-playground-probe.v1' || !probe.probeSha256) return false;
  const core = { ...probe };
  delete core.probeSha256;
  const replayInputs = probe.exploration && probe.exploration.replayInputs;
  const expectedCombinationIdentity = replayInputs ? hash({
    rootSeed: replayInputs.rootSeed,
    cycleSha256: replayInputs.cycleSha256,
    roll: replayInputs.roll,
    languageIds: replayInputs.languageIds
  }) : null;
  return hash(core) === probe.probeSha256 &&
    probe.exploration &&
    typeof probe.exploration.combinationIdentitySha256 === 'string' &&
    Array.isArray(probe.languageIds) &&
    probe.languageIds.length > 0 &&
    probe.languageIds.length <= 12 &&
    new Set(probe.languageIds).size === probe.languageIds.length &&
    replayInputs.rootSeed === probe.sourceBinding.rootSeed &&
    replayInputs.cycleSha256 === probe.sourceBinding.cycleSha256 &&
    replayInputs.roll === probe.roll &&
    JSON.stringify(replayInputs.languageIds) === JSON.stringify(probe.languageIds) &&
    expectedCombinationIdentity === probe.exploration.combinationIdentitySha256;
}

function chooseGroundedAtoms({ probe, catalog, maximum = 12 } = {}) {
  const selectedLanguages = [...new Set(probe.languageIds)].sort();
  const selectedSet = new Set(selectedLanguages);
  const candidates = catalog.atoms.filter(atom => selectedSet.has(atom.languageId));
  const byLanguage = new Map(selectedLanguages.map(languageId => [
    languageId,
    candidates
      .filter(atom => atom.languageId === languageId)
      .sort((left, right) => hash(`${probe.exploration.combinationIdentitySha256}|LANGUAGE_ANCHOR|${left.atomId}`).localeCompare(hash(`${probe.exploration.combinationIdentitySha256}|LANGUAGE_ANCHOR|${right.atomId}`)) || left.atomId.localeCompare(right.atomId))
  ]));
  if ([...byLanguage.values()].some(atoms => atoms.length === 0)) return [];
  const chosen = selectedLanguages.map(languageId => byLanguage.get(languageId)[0]);
  const chosenIds = new Set(chosen.map(atom => atom.atomId));
  const remainder = candidates
    .filter(atom => !chosenIds.has(atom.atomId))
    .sort((left, right) => hash(`${probe.exploration.combinationIdentitySha256}|ATOM_FILL|${left.atomId}`).localeCompare(hash(`${probe.exploration.combinationIdentitySha256}|ATOM_FILL|${right.atomId}`)) || left.atomId.localeCompare(right.atomId));
  return [...chosen, ...remainder].slice(0, Math.max(2, Math.min(12, maximum)));
}

function held(result, details = {}) {
  const core = {
    schema: 'axm.code.grammar-glass-discovery-kiln-candidate.v1',
    version: '1.0.0',
    result,
    ...details,
    stateRail: [{ state: 'HELD', evidenceDigest: details.evidenceDigest || null }],
    truth: {
      executionOccurred: false,
      draftStarCreated: false,
      candidateCreated: false,
      unknownCombinationIsNotNoveltyProof: true,
      holdIsNotCandidateFailure: true,
      automaticReentry: false,
      automaticSelection: false,
      automaticPromotion: false
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, discoveryKilnCandidateSha256: hash(core) });
}

function createDiscoveryKilnCandidate({
  probe,
  cycle,
  catalog,
  conditionRevision,
  dayStart,
  contactMemory = null,
  appliedMemoryCarries = [],
  projectId = 'grammar-glass',
  directionSha256 = null,
  workContextRef = null,
  policy = null,
  executorProfile = null,
  requestedBy = 'HUMAN_EXPLICIT_DISCOVERY_PREPARATION'
} = {}) {
  if (!validProbe(probe)) return held('VALID_DISCOVERY_PROBE_REQUIRED');
  if (!cycle || !digestCurrent(cycle, 'cycleSha256') || !catalog || !digestCurrent(catalog, 'catalogSha256')) {
    return held('VALID_RECORDED_CYCLE_AND_CATALOG_REQUIRED', { combinationIdentitySha256: probe.exploration.combinationIdentitySha256 });
  }
  if (!conditionRevision || !digestCurrent(conditionRevision, 'conditionSha256') || !dayStart || !digestCurrent(dayStart, 'dayStartSha256')) {
    return held('VALID_DAY_AND_CONDITION_REQUIRED', { combinationIdentitySha256: probe.exploration.combinationIdentitySha256 });
  }
  const binding = probe.sourceBinding || {};
  const bindingProblems = [];
  if (binding.rootSeed !== cycle.rootSeed || binding.rootSeed !== dayStart.rootSeed) bindingProblems.push('ROOT_SEED_MISMATCH');
  if (binding.sourceSha256 !== catalog.sourceSha256) bindingProblems.push('SOURCE_SHA256_MISMATCH');
  if (binding.cycleSha256 !== cycle.cycleSha256) bindingProblems.push('CYCLE_SHA256_MISMATCH');
  if (binding.conditionSha256 !== conditionRevision.conditionSha256) bindingProblems.push('CONDITION_SHA256_MISMATCH');
  if (binding.profileSnapshotSha256 !== catalog.profileSnapshotSha256) bindingProblems.push('PROFILE_SNAPSHOT_MISMATCH');
  if (cycle.catalogSha256 !== catalog.catalogSha256) bindingProblems.push('CYCLE_CATALOG_LINEAGE_MISMATCH');
  if (cycle.dayStartSha256 !== dayStart.dayStartSha256) bindingProblems.push('CYCLE_DAY_LINEAGE_MISMATCH');
  if (cycle.conditionSha256 !== conditionRevision.conditionSha256 || dayStart.conditionSha256 !== conditionRevision.conditionSha256) bindingProblems.push('CONDITION_LINEAGE_MISMATCH');
  if (dayStart.catalogSha256 !== catalog.catalogSha256 || dayStart.sourceSha256 !== catalog.sourceSha256) bindingProblems.push('DAY_SOURCE_LINEAGE_MISMATCH');
  if (bindingProblems.length) {
    return held('DISCOVERY_SOURCE_BINDING_MISMATCH', {
      combinationIdentitySha256: probe.exploration.combinationIdentitySha256,
      bindingProblems,
      evidenceDigest: hash(bindingProblems)
    });
  }
  const atoms = chooseGroundedAtoms({ probe, catalog });
  if (atoms.length < 2 || new Set(atoms.map(atom => atom.languageId)).size !== new Set(probe.languageIds).size) {
    return held('DISCOVERY_GROUNDING_INCOMPLETE', {
      combinationIdentitySha256: probe.exploration.combinationIdentitySha256,
      groundedAtomCount: atoms.length,
      evidenceDigest: hash(atoms.map(atom => atom.atomId))
    });
  }
  const formation = cycleApi.buildFormation({
    cycle,
    catalog,
    conditionRevision,
    atomIds: atoms.map(atom => atom.atomId),
    formationSeed: deriveSeed(cycle.rootSeed, `discovery-kiln:${probe.exploration.combinationIdentitySha256}`, probe.roll || 0),
    source: 'EXPLICIT_SEEDED_DISCOVERY_PREPARATION'
  });
  const mirrorObservation = observation.observeFormation({
    cycle,
    catalog,
    formation,
    lens: conditionRevision.conditions.mirrorLens,
    reasoningBinding: {
      analysisDigest: probe.probeSha256,
      findingRefs: [
        `combination:${probe.exploration.combinationIdentitySha256}`,
        `probe:${probe.probeSha256}`
      ]
    }
  });
  if (mirrorObservation.result !== 'REACTIVE_DRAFT_MIRROR_OBSERVATION_READY') {
    return held('DISCOVERY_MIRROR_OBSERVATION_HELD', {
      combinationIdentitySha256: probe.exploration.combinationIdentitySha256,
      formationSha256: formation.formationSha256,
      evidenceDigest: mirrorObservation.mirrorObservationSha256 || hash(mirrorObservation)
    });
  }
  const draftStar = observation.captureDraftStar({
    dayStart,
    conditionRevision,
    cycle,
    formation,
    mirrorObservation
  });
  if (draftStar.result !== 'DRAFT_STAR_CAPTURED_IMMUTABLE_LIGHTWEIGHT_RECEIPT') {
    return held('DISCOVERY_DRAFT_STAR_HELD', {
      combinationIdentitySha256: probe.exploration.combinationIdentitySha256,
      formationSha256: formation.formationSha256,
      mirrorObservationSha256: mirrorObservation.mirrorObservationSha256,
      evidenceDigest: draftStar.starSha256 || hash(draftStar)
    });
  }
  const explanation = memory.explainCompositeFormation({
    formation,
    cycle,
    contactMemory,
    appliedMemoryCarries
  });
  const candidatePacket = observation.createProductionDraftCandidatePacket({
    star: draftStar,
    projectId: cleanId(projectId, 'grammar-glass'),
    directionSha256,
    workContextRef
  });
  const resolvedPolicy = policy || interglass.createInterglassPolicy({
    persistenceIntent: 'TRANSIENT',
    maxAttempts: 1
  });
  const candidateModel = interglass.createInterglassCandidateModel({
    star: draftStar,
    mirrorObservation,
    formationWhy: explanation,
    policy: resolvedPolicy
  });
  const runRequest = interglass.createInterglassRunRequest({
    candidateModel,
    star: draftStar,
    mirrorObservation,
    executorProfile,
    policy: resolvedPolicy,
    requestedBy
  });
  const adapterReady = runRequest.result === 'INTERGLASS_EXECUTION_REQUEST_READY_NOT_EXECUTED';
  const result = adapterReady ? 'DISCOVERY_CANDIDATE_READY_FOR_EXPLICIT_ARM' : 'HELD_ADAPTER_REQUIRED';
  const stateRail = [
    { state: 'ROLLED', evidenceDigest: probe.exploration.combinationIdentitySha256 },
    { state: 'GROUNDED', evidenceDigest: hash(atoms.map(atom => atom.atomSha256)) },
    { state: 'DRAFT_STAR', evidenceDigest: draftStar.starSha256 },
    { state: 'CANDIDATE', evidenceDigest: candidateModel.candidateModelDigest },
    adapterReady
      ? { state: 'SANDBOX', evidenceDigest: runRequest.executorProfileDigest }
      : { state: 'HELD', evidenceDigest: runRequest.requestSha256 }
  ];
  const core = {
    schema: 'axm.code.grammar-glass-discovery-kiln-candidate.v1',
    version: '1.0.0',
    result,
    combinationIdentitySha256: probe.exploration.combinationIdentitySha256,
    probeSha256: probe.probeSha256,
    sourceBinding: probe.sourceBinding,
    languageIds: [...probe.languageIds],
    groundedAtomRefs: atoms.map(atom => ({
      atomId: atom.atomId,
      atomSha256: atom.atomSha256,
      languageId: atom.languageId,
      atomType: atom.atomType,
      sourceProfileDigest: atom.sourceProfileDigest
    })),
    formation,
    mirrorObservation,
    explanation,
    draftStar,
    candidatePacket,
    candidateModel,
    runRequest,
    stateRail,
    truth: {
      combinationIsGroundedInRecordedGrammarAtoms: true,
      selectionIsDeterministicFromRecordedCombinationIdentity: true,
      unknownCombinationIsNotNoveltyProof: true,
      candidateModelIsStructuredDataNotArbitrarySourceCode: true,
      executionOccurred: false,
      explicitArmStillRequired: adapterReady,
      missingAdapterProducesHold: !adapterReady,
      holdIsNotCandidateFailure: !adapterReady,
      automaticReentry: false,
      automaticSelection: false,
      automaticPromotion: false,
      sourceCycleMutated: false
    },
    authority: AUTHORITY
  };
  return deepFreeze({ ...core, discoveryKilnCandidateSha256: hash(core) });
}

function snapshot() {
  const core = {
    schema: 'axm.code.grammar-glass-discovery-kiln-snapshot.v1',
    version: '1.0.0',
    status: 'TEST',
    states: DISCOVERY_KILN_STATES,
    provides: [
      'deterministic selection of real grammar atoms from a seeded combination receipt',
      'explicit formation to mirror to Draft Star to candidate lineage',
      'truthful adapter hold before execution',
      'explicit Interglass arm boundary when an executor adapter is supplied'
    ],
    truth: {
      rngProvesNovelty: false,
      arbitrarySourceCodeGenerationImplemented: false,
      executionAuthorityGrantedByPreparation: false,
      automaticPromotionImplemented: false
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, snapshotSha256: hash(core) });
}

module.exports = Object.freeze({
  DISCOVERY_KILN_STATES,
  validProbe,
  chooseGroundedAtoms,
  createDiscoveryKilnCandidate,
  snapshot
});
