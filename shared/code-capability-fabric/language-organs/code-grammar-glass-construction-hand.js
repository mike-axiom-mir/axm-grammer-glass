'use strict';

const vm = require('vm');
const base = require('./code-grammar-glass-base.js');
const interglass = require('./code-grammar-glass-interglass.js');
const renderer = require('./code-grammar-glass-construction-renderer.js');

const htmlOrgan = require('./organs/001-html/organ.json');
const htmlProfile = require('./organs/001-html/grammar.profile.json');
const htmlKeyboard = require('./organs/001-html/machine.keyboard.json');
const htmlTemplates = require('./organs/001-html/machine.templates.json');
const htmlCheatcodes = require('./organs/001-html/machine.cheatcodes.json');
const javascriptOrgan = require('./organs/003-javascript/organ.json');
const javascriptProfile = require('./organs/003-javascript/grammar.profile.json');
const javascriptKeyboard = require('./organs/003-javascript/machine.keyboard.json');
const javascriptTemplates = require('./organs/003-javascript/machine.templates.json');
const javascriptCheatcodes = require('./organs/003-javascript/machine.cheatcodes.json');
const cssOrgan = require('./organs/005-css/organ.json');
const cssProfile = require('./organs/005-css/grammar.profile.json');
const cssKeyboard = require('./organs/005-css/machine.keyboard.json');
const cssTemplates = require('./organs/005-css/machine.templates.json');
const cssCheatcodes = require('./organs/005-css/machine.cheatcodes.json');

const {
  AUTHORITY,
  UNIVERSAL_ATOM_TYPES,
  hash,
  deepFreeze,
  cleanId,
  strings,
  digestCurrent,
  deriveSeed,
  integerFromSeed
} = base;

const { OUTPUT_TARGET, DEFAULT_CSP, PROGRAM_FAMILIES, CONSTRUCTION_RULES, escapeHtml, renderWebMicroApp } = renderer;
const DEFAULT_INTENT = 'SEEDED_STRUCTURAL_MICRO_APP_EXPLORATION';
const MAX_ARTIFACT_BYTES = 1000000;

function countToken(value, token) {
  return String(value).split(token).length - 1;
}

function balancedBraces(value) {
  let depth = 0;
  for (const character of String(value)) {
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function bankBinding(languageId, organ, profile, keyboard, templates, cheatcodes) {
  return {
    languageId,
    organId: organ.organId,
    organSha256: organ.sha256,
    grammarProfileSha256: profile.profileSha256,
    keyboardSha256: keyboard.keyboardSha256,
    templateBankSha256: templates.bankSha256,
    cheatcodeBankSha256: cheatcodes.bankSha256,
    keyboardMode: 'AVAILABLE_INTENT_ONLY',
    templateRenderPolicy: 'NO_SOURCE_EMIT_WITHOUT_LANGUAGE_RENDERER_OR_AI_PROPOSAL'
  };
}

function validateBank(languageId, organ, profile, keyboard, templates, cheatcodes) {
  const problems = [];
  if (!digestCurrent(organ, 'sha256')) problems.push(`${languageId}:ORGAN_DIGEST_INVALID`);
  if (!digestCurrent(profile, 'profileSha256')) problems.push(`${languageId}:PROFILE_DIGEST_INVALID`);
  if (!digestCurrent(keyboard, 'keyboardSha256')) problems.push(`${languageId}:KEYBOARD_DIGEST_INVALID`);
  if (!digestCurrent(templates, 'bankSha256')) problems.push(`${languageId}:TEMPLATE_BANK_DIGEST_INVALID`);
  if (!digestCurrent(cheatcodes, 'bankSha256')) problems.push(`${languageId}:CHEATCODE_BANK_DIGEST_INVALID`);
  if (organ.languageId !== languageId || profile.languageId !== languageId || keyboard.languageId !== languageId || templates.languageId !== languageId || cheatcodes.languageId !== languageId) {
    problems.push(`${languageId}:LANGUAGE_BINDING_MISMATCH`);
  }
  if (profile.organDigest !== organ.sha256 || keyboard.organDigest !== organ.sha256 || templates.organDigest !== organ.sha256 || cheatcodes.organDigest !== organ.sha256) {
    problems.push(`${languageId}:ORGAN_BINDING_MISMATCH`);
  }
  if (keyboard.grammarProfileDigest !== profile.profileSha256 || templates.grammarProfileDigest !== profile.profileSha256 || cheatcodes.grammarProfileDigest !== profile.profileSha256) {
    problems.push(`${languageId}:PROFILE_BINDING_MISMATCH`);
  }
  const allowedKeyStates = new Set(['AVAILABLE_INTENT_ONLY', 'DISABLED_NO_NATIVE_BINDING']);
  if (!Array.isArray(keyboard.keys) ||
      keyboard.keys.some(key => !allowedKeyStates.has(key.availability) || key.sourceCode !== null) ||
      !keyboard.truth || keyboard.truth.keyPressIsEditIntentNotSource !== true || keyboard.truth.sourceRendererRequiredForSourceMutations !== true) {
    problems.push(`${languageId}:INTENT_ONLY_KEYBOARD_CONTRACT_MISMATCH`);
  }
  return problems;
}

function rendererImplementationDigest() {
  return hash(renderer.implementationSource());
}

const PROGRAM_STATE_SHAPES = Object.freeze({
  LINEAGE_SIGNAL: 'BOUNDED_NUMERIC_REGISTER',
  ATOM_FLOW_ROUTER: 'BOUNDED_GROUNDED_ATOM_CURSOR',
  STATE_ORBIT: 'FINITE_PHASE_MACHINE',
  RECEIPT_LEDGER: 'BOUNDED_APPEND_ONLY_EVENT_WINDOW'
});

function programFamilyForRoll(roll) {
  if (!Number.isSafeInteger(roll) || roll < 0) return null;
  return PROGRAM_FAMILIES[((roll - 1) % PROGRAM_FAMILIES.length + PROGRAM_FAMILIES.length) % PROGRAM_FAMILIES.length];
}

function programShapeDigest(programFamily) {
  if (!PROGRAM_FAMILIES.includes(programFamily)) return null;
  return hash({
    programFamily,
    architectureVersion: 'CONSTRUCTION_PROGRAM_FAMILIES_V1',
    stateShape: PROGRAM_STATE_SHAPES[programFamily],
    rollRouting: 'ONE_BASED_ROLL_MODULO_FAMILY_COUNT'
  });
}

function createWebMicroAppAdapter() {
  const bindingProblems = [
    ...validateBank('html', htmlOrgan, htmlProfile, htmlKeyboard, htmlTemplates, htmlCheatcodes),
    ...validateBank('javascript', javascriptOrgan, javascriptProfile, javascriptKeyboard, javascriptTemplates, javascriptCheatcodes),
    ...validateBank('css', cssOrgan, cssProfile, cssKeyboard, cssTemplates, cssCheatcodes)
  ];
  const core = {
    schema: 'axm.code.grammar-glass-construction-adapter.v1',
    version: '1.0.0',
    status: 'TEST',
    result: bindingProblems.length ? 'CONSTRUCTION_ADAPTER_SOURCE_BANK_BINDING_HELD' : 'WEB_MICRO_APP_CONSTRUCTION_ADAPTER_READY',
    id: 'axm.web-microapp-construction-adapter.v1',
    outputTarget: OUTPUT_TARGET,
    rendererImplementationSha256: rendererImplementationDigest(),
    sourceBankBindings: [
      bankBinding('html', htmlOrgan, htmlProfile, htmlKeyboard, htmlTemplates, htmlCheatcodes),
      bankBinding('javascript', javascriptOrgan, javascriptProfile, javascriptKeyboard, javascriptTemplates, javascriptCheatcodes),
      bankBinding('css', cssOrgan, cssProfile, cssKeyboard, cssTemplates, cssCheatcodes)
    ],
    bindingProblems,
    supportedAtomTypes: [...UNIVERSAL_ATOM_TYPES],
    supportedProgramFamilies: [...PROGRAM_FAMILIES],
    constructionRules: CONSTRUCTION_RULES,
    containmentContract: {
      selfContainedSingleFile: true,
      networkMode: 'NONE',
      externalLibraries: false,
      dynamicCodeEvaluation: false,
      persistentStorage: false,
      sourceWorkspaceMutation: false,
      maximumArtifactBytes: MAX_ARTIFACT_BYTES,
      contentSecurityPolicy: DEFAULT_CSP
    },
    truth: {
      machineKeyboardAndTemplateBanksEmitSource: false,
      thisAdapterIsTheExplicitSourceRenderer: true,
      universalAtomMappingIsStructuralAnalogyNotSemanticEquivalence: true,
      outputIsCandidateSourceCode: true,
      sourceConstructionIsNotRuntimeCorrectness: true,
      sourceConstructionIsNotAdmissionSelectionOrPromotion: true
    },
    authority: AUTHORITY
  };
  return deepFreeze({ ...core, adapterSha256: hash(core) });
}

function createConstructionDirection({
  projectId = 'grammar-glass',
  intentClass = DEFAULT_INTENT,
  requestedCapabilities = ['BOUNDED_STATE_CHANGE', 'VISIBLE_LINEAGE', 'LOCAL_INVARIANT'],
  constraints = ['OFFLINE', 'DETERMINISTIC', 'SINGLE_FILE', 'NO_PERSISTENCE']
} = {}) {
  const core = {
    schema: 'axm.code.grammar-glass-construction-direction.v1',
    version: '1.0.0',
    result: 'CONSTRUCTION_DIRECTION_READY',
    projectId: cleanId(projectId, 'grammar-glass'),
    intentClass: cleanId(intentClass, DEFAULT_INTENT).toUpperCase(),
    outputTarget: OUTPUT_TARGET,
    requestedCapabilities: strings(requestedCapabilities, 32).map(value => cleanId(value).toUpperCase()).sort(),
    constraints: strings(constraints, 32).map(value => cleanId(value).toUpperCase()).sort(),
    rawPromptStored: false,
    truth: {
      directionIsDigestBoundNotPrivateReasoning: true,
      directionDoesNotGrantExecutionAuthority: true,
      directionDoesNotProveCandidateQuality: true
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, directionSha256: hash(core) });
}

function validAdapter(adapter) {
  return !!adapter &&
    adapter.schema === 'axm.code.grammar-glass-construction-adapter.v1' &&
    adapter.result === 'WEB_MICRO_APP_CONSTRUCTION_ADAPTER_READY' &&
    adapter.outputTarget === OUTPUT_TARGET &&
    adapter.rendererImplementationSha256 === rendererImplementationDigest() &&
    digestCurrent(adapter, 'adapterSha256');
}

function validDirection(direction) {
  return !!direction &&
    direction.schema === 'axm.code.grammar-glass-construction-direction.v1' &&
    direction.result === 'CONSTRUCTION_DIRECTION_READY' &&
    direction.outputTarget === OUTPUT_TARGET &&
    digestCurrent(direction, 'directionSha256');
}

function validKilnCandidate(candidate) {
  if (!candidate || candidate.schema !== 'axm.code.grammar-glass-discovery-kiln-candidate.v1' || !digestCurrent(candidate, 'discoveryKilnCandidateSha256')) return false;
  if (!['HELD_ADAPTER_REQUIRED', 'DISCOVERY_CANDIDATE_READY_FOR_EXPLICIT_ARM'].includes(candidate.result)) return false;
  if (!Array.isArray(candidate.groundedAtomRefs) || candidate.groundedAtomRefs.length < 2 || candidate.groundedAtomRefs.length > 12) return false;
  if (!candidate.formation || !digestCurrent(candidate.formation, 'formationSha256')) return false;
  if (!candidate.mirrorObservation || !digestCurrent(candidate.mirrorObservation, 'mirrorObservationSha256')) return false;
  if (!candidate.draftStar || !digestCurrent(candidate.draftStar, 'starSha256')) return false;
  if (!candidate.candidatePacket || !digestCurrent(candidate.candidatePacket, 'candidatePacketSha256')) return false;
  if (candidate.draftStar.mirrorObservationDigest !== candidate.mirrorObservation.mirrorObservationSha256) return false;
  if (candidate.candidatePacket.draftStarSha256 !== candidate.draftStar.starSha256) return false;
  const ancestry = new Map((candidate.draftStar.typedAtomAncestry || []).map(atom => [atom.atomId, atom.atomSha256]));
  return candidate.groundedAtomRefs.every(atom =>
    !!atom &&
    typeof atom.atomId === 'string' &&
    typeof atom.atomSha256 === 'string' &&
    typeof atom.languageId === 'string' &&
    typeof atom.atomType === 'string' &&
    typeof atom.sourceProfileDigest === 'string' &&
    ancestry.get(atom.atomId) === atom.atomSha256
  );
}

function validPlan(plan) {
  return !!plan &&
    plan.schema === 'axm.code.grammar-glass-construction-plan.v1' &&
    plan.result === 'DETERMINISTIC_WEB_MICRO_APP_CONSTRUCTION_PLAN_READY' &&
    plan.outputTarget === OUTPUT_TARGET &&
    Number.isSafeInteger(plan.roll) && plan.roll >= 0 &&
    plan.programFamily === programFamilyForRoll(plan.roll) &&
    plan.programFamilyIndex === PROGRAM_FAMILIES.indexOf(plan.programFamily) &&
    plan.programShapeSha256 === programShapeDigest(plan.programFamily) &&
    digestCurrent(plan, 'constructionPlanSha256');
}

function validArtifactRecord(artifact) {
  if (!artifact || artifact.schema !== 'axm.code.grammar-glass-constructed-artifact.v1' || artifact.result !== 'DETERMINISTIC_WEB_MICRO_APP_CANDIDATE_CONSTRUCTED_NOT_VERIFIED' || !digestCurrent(artifact, 'artifactSha256')) return false;
  if (!Array.isArray(artifact.files) || artifact.files.length !== 1 || !artifact.files[0] || typeof artifact.files[0].utf8Text !== 'string') return false;
  if (!artifact.artifactReceipt || artifact.artifactReceipt.schema !== 'axm.code.grammar-glass-constructed-artifact-receipt.v1' || !digestCurrent(artifact.artifactReceipt, 'artifactReceiptSha256')) return false;
  if (!Array.isArray(artifact.artifactReceipt.fileManifest) || artifact.artifactReceipt.fileManifest.length !== 1) return false;
  return artifact.artifactReceipt.constructionPlanSha256 === artifact.constructionPlanSha256 &&
    artifact.artifactReceipt.adapterSha256 === artifact.adapterSha256 &&
    artifact.artifactReceipt.programFamily === artifact.programFamily &&
    artifact.artifactReceipt.programShapeSha256 === artifact.programShapeSha256 &&
    PROGRAM_FAMILIES.includes(artifact.programFamily) &&
    artifact.artifactReceipt.fileManifest[0].sha256 === artifact.files[0].sha256;
}

function validVerificationRecord(verification) {
  return !!verification &&
    verification.schema === 'axm.code.grammar-glass-construction-static-verification.v1' &&
    Array.isArray(verification.checks) &&
    Array.isArray(verification.failedChecks) &&
    digestCurrent(verification, 'verificationSha256');
}

function heldPlan(result, details = {}) {
  const core = {
    schema: 'axm.code.grammar-glass-construction-plan.v1',
    version: '1.0.0',
    result,
    ...details,
    truth: {
      sourceConstructed: false,
      executionOccurred: false,
      holdIsNotCandidateFailure: true,
      automaticSelection: false,
      automaticPromotion: false
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, constructionPlanSha256: hash(core) });
}

function createConstructionPlan({ kilnCandidate, adapter = null, direction = null } = {}) {
  const resolvedAdapter = adapter || createWebMicroAppAdapter();
  const resolvedDirection = direction || createConstructionDirection({
    projectId: kilnCandidate && kilnCandidate.candidatePacket && kilnCandidate.candidatePacket.projectId || 'grammar-glass'
  });
  if (!validAdapter(resolvedAdapter)) {
    return heldPlan('VALID_CONSTRUCTION_ADAPTER_REQUIRED', {
      adapterResult: resolvedAdapter && resolvedAdapter.result || null,
      evidenceDigest: resolvedAdapter && resolvedAdapter.adapterSha256 || null
    });
  }
  if (!validKilnCandidate(kilnCandidate)) return heldPlan('VALID_DISCOVERY_KILN_CANDIDATE_REQUIRED');
  if (!validDirection(resolvedDirection)) return heldPlan('VALID_CONSTRUCTION_DIRECTION_REQUIRED', { discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256 });
  if (resolvedDirection.projectId !== kilnCandidate.candidatePacket.projectId) {
    return heldPlan('CONSTRUCTION_PROJECT_BINDING_MISMATCH', {
      discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256,
      requestedProjectId: resolvedDirection.projectId,
      candidateProjectId: kilnCandidate.candidatePacket.projectId
    });
  }
  if (kilnCandidate.candidatePacket.directionSha256 && kilnCandidate.candidatePacket.directionSha256 !== resolvedDirection.directionSha256) {
    return heldPlan('CONSTRUCTION_DIRECTION_BINDING_MISMATCH', {
      discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256,
      requestedDirectionSha256: resolvedDirection.directionSha256,
      candidateDirectionSha256: kilnCandidate.candidatePacket.directionSha256
    });
  }
  const atoms = kilnCandidate.groundedAtomRefs.map((atom, index) => ({
    index,
    atomId: String(atom.atomId),
    atomSha256: String(atom.atomSha256),
    languageId: String(atom.languageId),
    atomType: String(atom.atomType || '').toUpperCase(),
    sourceProfileDigest: String(atom.sourceProfileDigest)
  }));
  const missingRuleTypes = [...new Set(atoms.filter(atom => !CONSTRUCTION_RULES[atom.atomType]).map(atom => atom.atomType || 'UNKNOWN'))].sort();
  if (missingRuleTypes.length) {
    return heldPlan('HELD_CONSTRUCTION_RULE_REQUIRED', {
      discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256,
      missingRuleTypes,
      evidenceDigest: hash({ missingRuleTypes, atomIds: atoms.map(atom => atom.atomId) })
    });
  }
  const atomSetSha256 = hash(atoms.map(atom => ({ atomId: atom.atomId, atomSha256: atom.atomSha256, atomType: atom.atomType })));
  const constructionSeed = deriveSeed(
    kilnCandidate.draftStar.rootSeed,
    `construction-hand:${kilnCandidate.combinationIdentitySha256}:${atomSetSha256}:${resolvedAdapter.adapterSha256}:${resolvedDirection.directionSha256}`,
    0
  );
  const roll = Number.isSafeInteger(kilnCandidate.roll) && kilnCandidate.roll >= 0 ? kilnCandidate.roll : 0;
  const programFamily = programFamilyForRoll(roll);
  const programFamilyIndex = PROGRAM_FAMILIES.indexOf(programFamily);
  const programShapeSha256 = programShapeDigest(programFamily);
  const parameters = {
    initialValue: 5 + integerFromSeed(constructionSeed, 'initial-value', 45),
    step: 1 + integerFromSeed(constructionSeed, 'step', 9),
    threshold: 35 + integerFromSeed(constructionSeed, 'threshold', 55),
    direction: integerFromSeed(constructionSeed, 'direction', 2) === 0 ? -1 : 1,
    modulus: 100,
    actionLabel: ['PULSE STATE', 'SHIFT SIGNAL', 'TURN FORMATION'][integerFromSeed(constructionSeed, 'action-label', 3)],
    energyScalePpm: 350000 + integerFromSeed(constructionSeed, 'energy-scale', 650001),
    lineageCount: atoms.length,
    verificationMode: 'SAFE_INTEGER_AND_RANGE',
    failureLabel: 'INVARIANT HOLD',
    themeHue: 150 + integerFromSeed(constructionSeed, 'theme-hue', 161),
    themeTilt: -6 + integerFromSeed(constructionSeed, 'theme-tilt', 13)
  };
  const featureFlags = Object.fromEntries(UNIVERSAL_ATOM_TYPES.map(atomType => [atomType, atoms.some(atom => atom.atomType === atomType)]));
  const atomInfluenceReceipts = atoms.map(atom => {
    const rule = CONSTRUCTION_RULES[atom.atomType];
    const receiptCore = {
      schema: 'axm.code.grammar-glass-construction-atom-influence.v1',
      index: atom.index,
      atomId: atom.atomId,
      atomSha256: atom.atomSha256,
      languageId: atom.languageId,
      atomType: atom.atomType,
      sourceProfileDigest: atom.sourceProfileDigest,
      ruleId: rule.ruleId,
      targetRole: rule.targetRole,
      parameterSlot: rule.parameterSlot,
      sharedSeedMixSha256: hash({ constructionSeed, atomSha256: atom.atomSha256, index: atom.index }),
      visibleLineageChip: true,
      claimClass: 'UNIVERSAL_STRUCTURAL_ROLE_ONLY_NOT_SOURCE_LANGUAGE_SEMANTIC_TRANSLATION'
    };
    return { ...receiptCore, influenceReceiptSha256: hash(receiptCore) };
  });
  const core = {
    schema: 'axm.code.grammar-glass-construction-plan.v1',
    version: '1.0.0',
    result: 'DETERMINISTIC_WEB_MICRO_APP_CONSTRUCTION_PLAN_READY',
    projectId: resolvedDirection.projectId,
    roll,
    programFamily,
    programFamilyIndex,
    programShapeSha256,
    outputTarget: OUTPUT_TARGET,
    discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256,
    combinationIdentitySha256: kilnCandidate.combinationIdentitySha256,
    probeSha256: kilnCandidate.probeSha256,
    formationSha256: kilnCandidate.formation.formationSha256,
    mirrorObservationSha256: kilnCandidate.mirrorObservation.mirrorObservationSha256,
    draftStarSha256: kilnCandidate.draftStar.starSha256,
    candidatePacketSha256: kilnCandidate.candidatePacket.candidatePacketSha256,
    compositeLineageDigest: kilnCandidate.draftStar.compositeLineageDigest,
    adapterSha256: resolvedAdapter.adapterSha256,
    rendererImplementationSha256: resolvedAdapter.rendererImplementationSha256,
    directionSha256: resolvedDirection.directionSha256,
    constructionSeed,
    atomSetSha256,
    groundedAtomCount: atoms.length,
    contributingGrammarIdentities: [...kilnCandidate.draftStar.contributingGrammarIdentities],
    connectionClasses: [...kilnCandidate.draftStar.connectionClasses],
    featureFlags,
    parameters,
    atomInfluenceReceipts,
    outputFiles: [{ path: 'index.html', mediaType: 'text/html; charset=utf-8', role: 'SELF_CONTAINED_MICRO_APP' }],
    constructionProgram: [
      'VERIFY_EXACT_KILN_LINEAGE',
      'BIND_EXPLICIT_HTML_CSS_JAVASCRIPT_RENDERER',
      'ROUTE_EXACT_RNG_ROLL_TO_DETERMINISTIC_PROGRAM_FAMILY',
      'MAP_EVERY_GROUNDED_ATOM_TO_A_STRUCTURAL_ROLE',
      'DERIVE_DETERMINISTIC_PARAMETERS',
      'RENDER_EXACT_UTF8_CANDIDATE',
      'STATIC_VERIFY_SYNTAX_SHAPE_AND_CONTAINMENT',
      'PREPARE_EXPLICIT_ONE_RUN_SANDBOX_REQUEST'
    ],
    truth: {
      everyGroundedAtomHasInfluenceReceipt: atomInfluenceReceipts.length === atoms.length,
      everyGroundedAtomAffectsSharedSeedAndVisibleLineage: true,
      programFamilyIsExactRollBoundNotRuntimeRandomness: true,
      programFamilyDiversityIsNotNoveltyOrQualityRanking: true,
      atomMappingIsStructuralAnalogyNotSemanticEquivalence: true,
      planContainsNoSourceBytes: true,
      planIsNotExecution: true,
      planIsNotCorrectnessProof: true,
      candidateIsNotAdmissionSelectionOrPromotion: true
    },
    authority: AUTHORITY
  };
  return deepFreeze({ ...core, constructionPlanSha256: hash(core) });
}

function constructWebMicroApp({ plan, adapter = null } = {}) {
  const resolvedAdapter = adapter || createWebMicroAppAdapter();
  if (!validAdapter(resolvedAdapter)) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-constructed-artifact.v1', result: 'VALID_CONSTRUCTION_ADAPTER_REQUIRED', authority: 'NONE' });
  }
  if (!validPlan(plan)) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-constructed-artifact.v1', result: 'VALID_CONSTRUCTION_PLAN_REQUIRED', authority: 'NONE' });
  }
  if (plan.adapterSha256 !== resolvedAdapter.adapterSha256 || plan.rendererImplementationSha256 !== resolvedAdapter.rendererImplementationSha256) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-constructed-artifact.v1', result: 'CONSTRUCTION_PLAN_ADAPTER_MISMATCH', authority: 'NONE' });
  }
  const utf8Text = renderWebMicroApp(plan, resolvedAdapter);
  const byteLength = Buffer.byteLength(utf8Text, 'utf8');
  if (byteLength > resolvedAdapter.containmentContract.maximumArtifactBytes) {
    return deepFreeze({
      schema: 'axm.code.grammar-glass-constructed-artifact.v1',
      result: 'CONSTRUCTION_ARTIFACT_RESOURCE_HOLD',
      byteLength,
      maximumBytes: resolvedAdapter.containmentContract.maximumArtifactBytes,
      authority: 'NONE'
    });
  }
  const fileCore = {
    path: 'index.html',
    mediaType: 'text/html; charset=utf-8',
    encoding: 'UTF-8',
    utf8Text,
    byteLength,
    sha256: hash(utf8Text)
  };
  const receiptCore = {
    schema: 'axm.code.grammar-glass-constructed-artifact-receipt.v1',
    version: '1.0.0',
    result: 'CONSTRUCTED_ARTIFACT_DIGEST_RECEIPT_READY',
    constructionPlanSha256: plan.constructionPlanSha256,
    adapterSha256: resolvedAdapter.adapterSha256,
    programFamily: plan.programFamily,
    programShapeSha256: plan.programShapeSha256,
    outputTarget: OUTPUT_TARGET,
    fileCount: 1,
    fileManifest: [{ path: fileCore.path, mediaType: fileCore.mediaType, byteLength, sha256: fileCore.sha256 }],
    totalByteLength: byteLength,
    sourceTextStoredInReceipt: false,
    truth: { receiptIsNotStaticOrRuntimeVerification: true, candidateIsNotPromoted: true },
    authority: 'NONE'
  };
  const artifactReceipt = { ...receiptCore, artifactReceiptSha256: hash(receiptCore) };
  const core = {
    schema: 'axm.code.grammar-glass-constructed-artifact.v1',
    version: '1.0.0',
    result: 'DETERMINISTIC_WEB_MICRO_APP_CANDIDATE_CONSTRUCTED_NOT_VERIFIED',
    constructionPlanSha256: plan.constructionPlanSha256,
    adapterSha256: resolvedAdapter.adapterSha256,
    programFamily: plan.programFamily,
    programShapeSha256: plan.programShapeSha256,
    rendererImplementationSha256: resolvedAdapter.rendererImplementationSha256,
    outputTarget: OUTPUT_TARGET,
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
    authority: AUTHORITY
  };
  return deepFreeze({ ...core, artifactSha256: hash(core) });
}

function verifyWebMicroApp({ artifact, plan, adapter = null } = {}) {
  const resolvedAdapter = adapter || createWebMicroAppAdapter();
  const checks = [];
  const add = (code, pass, evidence) => checks.push({ code, pass: pass === true, evidenceSha256: hash(evidence) });
  const artifactCurrent = validArtifactRecord(artifact);
  const planCurrent = validPlan(plan);
  add('ARTIFACT_DIGEST_CURRENT', artifactCurrent, artifact && artifact.artifactSha256 || null);
  add('PLAN_DIGEST_CURRENT', planCurrent, plan && plan.constructionPlanSha256 || null);
  add('ADAPTER_DIGEST_CURRENT', validAdapter(resolvedAdapter), resolvedAdapter && resolvedAdapter.adapterSha256 || null);
  if (!artifactCurrent || !planCurrent || !validAdapter(resolvedAdapter)) {
    const core = {
      schema: 'axm.code.grammar-glass-construction-static-verification.v1',
      version: '1.0.0',
      result: 'WEB_MICRO_APP_STATIC_VERIFICATION_FAIL',
      artifactSha256: artifact && artifact.artifactSha256 || null,
      constructionPlanSha256: plan && plan.constructionPlanSha256 || null,
      adapterSha256: resolvedAdapter && resolvedAdapter.adapterSha256 || null,
      checks,
      failedChecks: checks.filter(check => !check.pass).map(check => check.code),
      sourceTextStoredInVerification: false,
      truth: { executionOccurred: false, staticPassWouldNotProveRuntimeCorrectness: true },
      authority: 'NONE'
    };
    return deepFreeze({ ...core, verificationSha256: hash(core) });
  }
  const file = artifact.files.length === 1 ? artifact.files[0] : null;
  const source = file && typeof file.utf8Text === 'string' ? file.utf8Text : '';
  const expectedSource = renderWebMicroApp(plan, resolvedAdapter);
  const executableMatch = source.match(/<script id="axm-app">([\s\S]*?)<\/script>/);
  const metadataMatch = source.match(/<script type="application\/json" id="axm-lineage">([\s\S]*?)<\/script>/);
  const styleMatch = source.match(/<style id="axm-style">([\s\S]*?)<\/style>/);
  let javascriptSyntaxPass = false;
  let metadata = null;
  try {
    if (executableMatch) {
      new vm.Script(executableMatch[1], { filename: 'construction-hand.index.inline.js' });
      javascriptSyntaxPass = true;
    }
  } catch {}
  try {
    metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;
  } catch {}
  const bannedExecutablePattern = /\b(?:eval|Function|fetch|XMLHttpRequest|WebSocket|EventSource|Worker|SharedWorker)\s*\(|\bimport\s*\(|document\.cookie|\blocalStorage\b|\bindexedDB\b|navigator\.serviceWorker/i;
  const externalMarkupPattern = /<script\b[^>]*\bsrc\s*=|<link\b|<iframe\b|<object\b|<embed\b|<form\b|\b(?:https?:)?\/\//i;
  const cspMarker = `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(resolvedAdapter.containmentContract.contentSecurityPolicy)}">`;
  add('EXACT_RENDERER_REPLAY_MATCH', source === expectedSource, { actual: file && file.sha256, expected: hash(expectedSource) });
  add('SINGLE_INDEX_HTML_FILE', !!file && artifact.files.length === 1 && file.path === 'index.html' && file.mediaType === 'text/html; charset=utf-8', artifact.files.map(item => item.path));
  add('FILE_DIGEST_AND_BYTE_LENGTH_MATCH', !!file && file.sha256 === hash(source) && file.byteLength === Buffer.byteLength(source, 'utf8'), file && { sha256: file.sha256, byteLength: file.byteLength });
  add('ARTIFACT_PLAN_ADAPTER_BINDING_MATCH', artifact.constructionPlanSha256 === plan.constructionPlanSha256 && artifact.adapterSha256 === resolvedAdapter.adapterSha256, { artifactPlan: artifact.constructionPlanSha256, plan: plan.constructionPlanSha256 });
  add('PROGRAM_FAMILY_BINDING_MATCH', artifact.programFamily === plan.programFamily && artifact.programShapeSha256 === plan.programShapeSha256 && metadata && metadata.programFamily === plan.programFamily && metadata.programShapeSha256 === plan.programShapeSha256 && source.includes(`data-program-family="${escapeHtml(plan.programFamily)}"`), { artifactFamily: artifact.programFamily, planFamily: plan.programFamily, metadataFamily: metadata && metadata.programFamily });
  add('HTML_DOCUMENT_SHAPE_PASS', source.startsWith('<!doctype html>\n<html') && countToken(source, '<html') === 1 && countToken(source, '</html>') === 1 && countToken(source, '<head>') === 1 && countToken(source, '</head>') === 1 && countToken(source, '<body>') === 1 && countToken(source, '</body>') === 1, hash(source.slice(0, 256)));
  add('CSS_BLOCK_BALANCE_PASS', !!styleMatch && balancedBraces(styleMatch[1]), styleMatch ? hash(styleMatch[1]) : null);
  add('JAVASCRIPT_SYNTAX_PASS', javascriptSyntaxPass, executableMatch ? hash(executableMatch[1]) : null);
  add('LINEAGE_METADATA_PARSE_AND_BIND_PASS', !!metadata && metadata.constructionPlanSha256 === plan.constructionPlanSha256 && metadata.adapterSha256 === resolvedAdapter.adapterSha256 && Array.isArray(metadata.atomInfluenceReceipts) && metadata.atomInfluenceReceipts.length === plan.groundedAtomCount, metadata ? hash(metadata) : null);
  add('DEFAULT_DENY_CSP_PRESENT', source.includes(cspMarker), resolvedAdapter.containmentContract.contentSecurityPolicy);
  add('NO_EXTERNAL_RESOURCE_MARKUP', !externalMarkupPattern.test(source), hash(source.match(externalMarkupPattern) || 'NONE'));
  add('NO_DYNAMIC_CODE_NETWORK_OR_PERSISTENCE_API', !!executableMatch && !bannedExecutablePattern.test(executableMatch[1]), hash(executableMatch && executableMatch[1].match(bannedExecutablePattern) || 'NONE'));
  add('RESOURCE_CEILING_PASS', Buffer.byteLength(source, 'utf8') <= resolvedAdapter.containmentContract.maximumArtifactBytes, Buffer.byteLength(source, 'utf8'));
  const failedChecks = checks.filter(check => !check.pass).map(check => check.code);
  const core = {
    schema: 'axm.code.grammar-glass-construction-static-verification.v1',
    version: '1.0.0',
    result: failedChecks.length ? 'WEB_MICRO_APP_STATIC_VERIFICATION_FAIL' : 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS',
    artifactSha256: artifact.artifactSha256,
    artifactReceiptSha256: artifact.artifactReceipt.artifactReceiptSha256,
    constructionPlanSha256: plan.constructionPlanSha256,
    programFamily: plan.programFamily,
    programShapeSha256: plan.programShapeSha256,
    adapterSha256: resolvedAdapter.adapterSha256,
    checks,
    failedChecks,
    sourceTextStoredInVerification: false,
    truth: {
      exactRendererReplayChecked: true,
      javascriptWasParsedNotExecuted: true,
      htmlAndCssChecksAreBoundedStructuralChecksNotFullBrowserParsing: true,
      containmentCheckIsStaticNotRuntimeEnforcement: true,
      staticPassDoesNotProveRuntimeCorrectnessOrQuality: true,
      executionOccurred: false,
      candidateIsNotPromoted: true
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, verificationSha256: hash(core) });
}

function createConstructionRunRequest({ artifact, verification, plan, executorProfile = null, requestedBy = 'HUMAN_EXPLICIT_CONSTRUCTION_PREPARATION' } = {}) {
  const validArtifact = validArtifactRecord(artifact);
  const validVerification = validVerificationRecord(verification);
  const validPlanRecord = validPlan(plan);
  if (!validArtifact || !validVerification || !validPlanRecord || artifact.constructionPlanSha256 !== plan.constructionPlanSha256 || verification.artifactSha256 !== artifact.artifactSha256 || verification.constructionPlanSha256 !== plan.constructionPlanSha256) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-construction-run-request.v1', result: 'VALID_BOUND_ARTIFACT_VERIFICATION_AND_PLAN_REQUIRED', authority: 'NONE' });
  }
  if (verification.result !== 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS') {
    const holdCore = {
      schema: 'axm.code.grammar-glass-construction-run-request.v1',
      version: '1.0.0',
      result: 'CONSTRUCTION_RUN_HELD_STATIC_VERIFICATION_FAILED',
      artifactSha256: artifact.artifactSha256,
      verificationSha256: verification.verificationSha256,
      constructionPlanSha256: plan.constructionPlanSha256,
      failedChecks: [...verification.failedChecks],
      truth: { executionOccurred: false, holdIsNotCandidateFailure: true },
      authority: 'NONE'
    };
    return deepFreeze({ ...holdCore, requestSha256: hash(holdCore) });
  }
  const validExecutor = !!executorProfile &&
    executorProfile.schema === 'axm.code.interglass-browser-sandbox-executor-profile.v1' &&
    executorProfile.result === 'DISPOSABLE_BROWSER_SANDBOX_EXECUTOR_PROFILE_READY' &&
    digestCurrent(executorProfile, 'executorProfileDigest');
  if (!validExecutor) {
    const holdCore = {
      schema: 'axm.code.grammar-glass-construction-run-request.v1',
      version: '1.0.0',
      result: 'HELD_CONSTRUCTION_EXECUTOR_REQUIRED',
      artifactSha256: artifact.artifactSha256,
      artifactReceiptSha256: artifact.artifactReceipt.artifactReceiptSha256,
      verificationSha256: verification.verificationSha256,
      constructionPlanSha256: plan.constructionPlanSha256,
      requiredExecutorClass: 'DISPOSABLE_BROWSER_SANDBOX_OR_STRONGER_EXTERNAL_SANDBOX',
      truth: { executionOccurred: false, holdIsNotCandidateFailure: true },
      authority: 'NONE'
    };
    return deepFreeze({ ...holdCore, requestSha256: hash(holdCore) });
  }
  const binding = interglass.sandboxContractBinding();
  const core = {
    schema: 'axm.code.grammar-glass-construction-run-request.v1',
    version: '1.0.0',
    result: 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED',
    requestId: `construction-run:${hash({ artifactSha256: artifact.artifactSha256, executorProfileDigest: executorProfile.executorProfileDigest }).slice(0, 24)}`,
    requestedBy: cleanId(requestedBy, 'EXPLICIT_CALLER'),
    constructionPlanSha256: plan.constructionPlanSha256,
    artifactSha256: artifact.artifactSha256,
    artifactReceipt: artifact.artifactReceipt,
    artifactReceiptSha256: artifact.artifactReceipt.artifactReceiptSha256,
    verificationSha256: verification.verificationSha256,
    executorProfile,
    executorProfileDigest: executorProfile.executorProfileDigest,
    sandboxContractBinding: binding,
    resourceCeilings: {
      maxAttempts: 1,
      timeoutMs: executorProfile.timeoutMs,
      maxArtifactBytes: MAX_ARTIFACT_BYTES
    },
    persistenceIntent: 'TRANSIENT',
    transientPayload: {
      sourceTextIncludedInRequest: false,
      exactSourceTextSuppliedOnlyBySeparateLaunchEnvelope: true,
      payloadMustBeReleasedAfterRunUnlessSeparatelySaved: true
    },
    requiredContract: {
      exactArtifactDigest: artifact.artifactSha256,
      candidateOnly: true,
      opaqueOrigin: executorProfile.allowSameOrigin === false,
      sandboxTokens: [...executorProfile.sandboxTokens],
      networkMode: 'NONE',
      sourceWorkspaceWrite: false,
      persistentStorage: false,
      automaticRepeat: false,
      returnDigestBoundObservationOnly: true
    },
    truth: {
      requestIsNotExecution: true,
      staticVerificationIsNotRuntimeCorrectness: true,
      browserSandboxIsNotOsSandbox: true,
      requestIsNotAdmissionSelectionOrPromotion: true
    },
    authority: 'BOUND_EXECUTOR_REQUEST_ONLY'
  };
  return deepFreeze({ ...core, requestSha256: hash(core) });
}

function createTransientLaunchEnvelope({ artifact, verification, runRequest } = {}) {
  const validArtifact = validArtifactRecord(artifact);
  const validVerification = validVerificationRecord(verification) && verification.result === 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS';
  const validRequest = !!runRequest && runRequest.schema === 'axm.code.grammar-glass-construction-run-request.v1' && runRequest.result === 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED' && digestCurrent(runRequest, 'requestSha256');
  if (!validArtifact || !validVerification || !validRequest || runRequest.artifactSha256 !== artifact.artifactSha256 || runRequest.verificationSha256 !== verification.verificationSha256) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-construction-launch-envelope.v1', result: 'VALID_BOUND_ARTIFACT_VERIFICATION_AND_RUN_REQUEST_REQUIRED', authority: 'NONE' });
  }
  const file = artifact.files[0];
  const core = {
    schema: 'axm.code.grammar-glass-construction-launch-envelope.v1',
    version: '1.0.0',
    result: 'TRANSIENT_CONSTRUCTION_LAUNCH_ENVELOPE_READY_FOR_EXPLICIT_ARM',
    requestSha256: runRequest.requestSha256,
    artifactSha256: artifact.artifactSha256,
    verificationSha256: verification.verificationSha256,
    executorProfileDigest: runRequest.executorProfileDigest,
    runtimeType: 'SANDBOXED_IFRAME_SRCDOC',
    srcdocUtf8: file.utf8Text,
    srcdocSha256: file.sha256,
    byteLength: file.byteLength,
    lifecycle: {
      durableMetadata: false,
      explicitArmRequired: true,
      maximumAttempts: 1,
      releaseAfterRunUnlessSeparatelySaved: true
    },
    truth: {
      sourceTextIsTransientRuntimePayload: true,
      envelopeIsNotExecution: true,
      envelopeIsNotContainmentProof: true,
      envelopeIsNotAdmissionSelectionOrPromotion: true
    },
    authority: 'BOUND_TRANSIENT_PAYLOAD_FOR_EXPLICIT_EXECUTOR_ONLY'
  };
  return deepFreeze({ ...core, launchEnvelopeSha256: hash(core) });
}

function createConstructionVisualBundle({
  kilnCandidate,
  plan,
  adapter = null,
  direction,
  executorProfile
} = {}) {
  const resolvedAdapter = adapter || createWebMicroAppAdapter();
  if (!validKilnCandidate(kilnCandidate) || !validPlan(plan) || !validAdapter(resolvedAdapter) || !validDirection(direction)) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-construction-visual-bundle.v1', result: 'VALID_KILN_PLAN_ADAPTER_AND_DIRECTION_REQUIRED', authority: 'NONE' });
  }
  if (plan.discoveryKilnCandidateSha256 !== kilnCandidate.discoveryKilnCandidateSha256 || plan.adapterSha256 !== resolvedAdapter.adapterSha256 || plan.directionSha256 !== direction.directionSha256) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-construction-visual-bundle.v1', result: 'CONSTRUCTION_VISUAL_BUNDLE_LINEAGE_MISMATCH', authority: 'NONE' });
  }
  const artifact = constructWebMicroApp({ plan, adapter: resolvedAdapter });
  const verification = verifyWebMicroApp({ artifact, plan, adapter: resolvedAdapter });
  const runRequest = createConstructionRunRequest({ artifact, verification, plan, executorProfile, requestedBy: 'EXPLICIT_VIEWER_CONSTRUCTION_PREPARATION' });
  if (artifact.result !== 'DETERMINISTIC_WEB_MICRO_APP_CANDIDATE_CONSTRUCTED_NOT_VERIFIED' || verification.result !== 'WEB_MICRO_APP_STATIC_VERIFICATION_PASS' || runRequest.result !== 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED') {
    const holdCore = {
      schema: 'axm.code.grammar-glass-construction-visual-bundle.v1',
      version: '1.0.0',
      result: 'CONSTRUCTION_VISUAL_BUNDLE_PREPARATION_HELD',
      discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256,
      constructionPlanSha256: plan.constructionPlanSha256,
      artifactResult: artifact.result,
      verificationResult: verification.result,
      runRequestResult: runRequest.result,
      truth: { sourceTextStoredInBundle: false, executionOccurred: false, holdIsNotCandidateFailure: true },
      authority: 'NONE'
    };
    return deepFreeze({ ...holdCore, constructionBundleSha256: hash(holdCore) });
  }
  const core = {
    schema: 'axm.code.grammar-glass-construction-visual-bundle.v1',
    version: '1.0.0',
    result: 'CONSTRUCTION_VISUAL_BUNDLE_READY_NO_SOURCE_BYTES',
    combinationIdentitySha256: kilnCandidate.combinationIdentitySha256,
    probeSha256: kilnCandidate.probeSha256,
    roll: kilnCandidate.roll,
    probeMode: kilnCandidate.probeMode,
    probeStrength: kilnCandidate.probeStrength,
    languageIds: [...kilnCandidate.languageIds],
    groundedAtomRefs: kilnCandidate.groundedAtomRefs.map(atom => ({ ...atom })),
    discoveryKilnCandidateSha256: kilnCandidate.discoveryKilnCandidateSha256,
    formationSha256: kilnCandidate.formation.formationSha256,
    mirrorObservationSha256: kilnCandidate.mirrorObservation.mirrorObservationSha256,
    draftStarSha256: kilnCandidate.draftStar.starSha256,
    candidatePacketSha256: kilnCandidate.candidatePacket.candidatePacketSha256,
    compositeLineageDigest: kilnCandidate.draftStar.compositeLineageDigest,
    adapter: resolvedAdapter,
    adapterSha256: resolvedAdapter.adapterSha256,
    direction,
    directionSha256: direction.directionSha256,
    plan,
    constructionPlanSha256: plan.constructionPlanSha256,
    programFamily: plan.programFamily,
    programShapeSha256: plan.programShapeSha256,
    expectedArtifact: {
      artifactSha256: artifact.artifactSha256,
      artifactReceipt: artifact.artifactReceipt,
      artifactReceiptSha256: artifact.artifactReceipt.artifactReceiptSha256,
      fileSha256: artifact.files[0].sha256,
      byteLength: artifact.files[0].byteLength
    },
    verification,
    verificationSha256: verification.verificationSha256,
    runRequest,
    runRequestSha256: runRequest.requestSha256,
    truth: {
      sourceTextStoredInBundle: false,
      browserMustReplayExactBoundRenderer: true,
      browserReplayMustMatchExpectedArtifactDigest: true,
      staticVerificationAlreadyPerformedOnExpectedBytes: true,
      bundleIsNotExecutionOrRuntimeCorrectness: true,
      exactCombinationOnly: true,
      automaticReentrySelectionPromotionOrCanon: false
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, constructionBundleSha256: hash(core) });
}

function augmentVisualSnapshotWithConstructionHand({ visualSnapshot, bundles = [], fieldAttempts = null } = {}) {
  if (!visualSnapshot || visualSnapshot.schema !== 'axm.code.grammar-glass-visual-snapshot.v1' || !digestCurrent(visualSnapshot, 'visualSnapshotSha256')) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-visual-snapshot.v1', result: 'VALID_VISUAL_SNAPSHOT_REQUIRED_FOR_CONSTRUCTION_HAND', authority: 'NONE' });
  }
  const items = Array.isArray(bundles) ? bundles : [];
  const invalid = items.filter(bundle =>
    !bundle ||
    bundle.schema !== 'axm.code.grammar-glass-construction-visual-bundle.v1' ||
    bundle.result !== 'CONSTRUCTION_VISUAL_BUNDLE_READY_NO_SOURCE_BYTES' ||
    !Number.isSafeInteger(bundle.roll) || bundle.roll < 0 ||
    bundle.programFamily !== programFamilyForRoll(bundle.roll) ||
    bundle.programShapeSha256 !== programShapeDigest(bundle.programFamily) ||
    bundle.plan?.programFamily !== bundle.programFamily ||
    bundle.plan?.programShapeSha256 !== bundle.programShapeSha256 ||
    !digestCurrent(bundle, 'constructionBundleSha256')
  );
  if (invalid.length || new Set(items.map(bundle => bundle.combinationIdentitySha256)).size !== items.length || new Set(items.map(bundle => bundle.roll)).size !== items.length) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-visual-snapshot.v1', result: 'VALID_UNIQUE_CONSTRUCTION_VISUAL_BUNDLES_REQUIRED', invalidCount: invalid.length, authority: 'NONE' });
  }
  const coveredRolls = items.map(bundle => bundle.roll).filter(Number.isSafeInteger).sort((a, b) => a - b);
  const rawAttempts = Array.isArray(fieldAttempts) ? fieldAttempts : coveredRolls.map(roll => ({ roll }));
  if (rawAttempts.some(attempt => !attempt || !Number.isSafeInteger(attempt.roll) || attempt.roll < 0)) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-visual-snapshot.v1', result: 'VALID_UNIQUE_CONSTRUCTION_FIELD_ATTEMPTS_REQUIRED', authority: 'NONE' });
  }
  const attempts = rawAttempts.map(attempt => ({
    roll: attempt.roll,
    candidateResult: cleanId(attempt.candidateResult, 'NOT_RECORDED'),
    planResult: cleanId(attempt.planResult, 'NOT_RECORDED'),
    bundleResult: cleanId(attempt.bundleResult, coveredRolls.includes(attempt.roll) ? 'CONSTRUCTION_VISUAL_BUNDLE_READY_NO_SOURCE_BYTES' : 'NOT_RECORDED')
  })).sort((a, b) => a.roll - b.roll);
  const requestedRolls = [...new Set(attempts.map(attempt => attempt.roll))];
  if (requestedRolls.length !== attempts.length || coveredRolls.some(roll => !requestedRolls.includes(roll))) {
    return deepFreeze({ schema: 'axm.code.grammar-glass-visual-snapshot.v1', result: 'VALID_UNIQUE_CONSTRUCTION_FIELD_ATTEMPTS_REQUIRED', authority: 'NONE' });
  }
  const heldRolls = requestedRolls.filter(roll => !coveredRolls.includes(roll));
  const distinctLanguageSets = new Set(items.map(bundle => [...bundle.languageIds].sort().join('|'))).size;
  const distinctPlans = new Set(items.map(bundle => bundle.constructionPlanSha256)).size;
  const distinctArtifacts = new Set(items.map(bundle => bundle.expectedArtifact.artifactSha256)).size;
  const programFamilyCounts = Object.fromEntries(PROGRAM_FAMILIES.map(programFamily => [programFamily, items.filter(bundle => bundle.programFamily === programFamily).length]));
  const distinctProgramFamilies = Object.values(programFamilyCounts).filter(count => count > 0).length;
  const distinctProgramShapes = new Set(items.map(bundle => bundle.programShapeSha256)).size;
  const coverageCore = {
    schema: 'axm.code.grammar-glass-construction-field-coverage.v1',
    version: '1.0.0',
    result: heldRolls.length ? 'BOUNDED_CONSTRUCTION_FIELD_PARTIAL_WITH_RECORDED_HOLDS' : items.length ? 'BOUNDED_CONSTRUCTION_FIELD_READY' : 'CONSTRUCTION_FIELD_EMPTY',
    requestedRollCount: requestedRolls.length,
    requestedRolls,
    bundleCount: items.length,
    coveredRolls,
    heldRollCount: heldRolls.length,
    heldRolls,
    attempts,
    minimumCoveredRoll: coveredRolls.length ? coveredRolls[0] : null,
    maximumCoveredRoll: coveredRolls.length ? coveredRolls[coveredRolls.length - 1] : null,
    distinctLanguageSetCount: distinctLanguageSets,
    distinctConstructionPlanCount: distinctPlans,
    distinctArtifactCount: distinctArtifacts,
    programFamilyCounts,
    distinctProgramFamilyCount: distinctProgramFamilies,
    distinctProgramShapeCount: distinctProgramShapes,
    sourceTextStoredInCoverage: false,
    truth: {
      coverageIsBoundedNotOpenEnded: true,
      missingRequestedRollsAreRecordedAsHolds: true,
      coverageIsNotNoveltyOrQualityRanking: true,
      programFamilyCoverageIsDescriptiveNotAQualityScore: true,
      uncoveredRollsMustHold: true,
      everyBundleStillRequiresExplicitPreparationBuildArmAndRun: true
    },
    authority: 'NONE'
  };
  const coverage = { ...coverageCore, coverageSha256: hash(coverageCore) };
  const stateCore = {
    schema: 'axm.code.grammar-glass-construction-hand-visual-state.v1',
    version: '1.0.0',
    result: items.length ? 'CONSTRUCTION_HAND_EXACT_PLANS_AVAILABLE' : 'CONSTRUCTION_HAND_NO_EXACT_PLANS_RECORDED',
    bundleCount: items.length,
    coverage,
    bundles: items,
    truth: {
      sourceTextStoredInVisualSnapshot: false,
      unmatchedPlaygroundCombinationMustHold: true,
      browserMayReplayOnlyExactBoundRenderer: true,
      runtimeExecutionRequiresExplicitArmAndRunOnce: true,
      automaticPromotion: false
    },
    authority: 'NONE'
  };
  const constructionHand = { ...stateCore, visualStateSha256: hash(stateCore) };
  const core = {
    ...visualSnapshot,
    constructionHand,
    integration: {
      ...(visualSnapshot.integration || {}),
      constructionHandLane: 'EXACT_PLAN_TO_SOURCE_TO_EXPLICIT_BROWSER_SANDBOX'
    },
    truth: {
      ...(visualSnapshot.truth || {}),
      constructionPlanAvailabilityIsNotSelectionOrQuality: true,
      constructionSourceStoredInSnapshot: false,
      constructionExecutionOccurred: false
    }
  };
  delete core.visualSnapshotSha256;
  return deepFreeze({ ...core, visualSnapshotSha256: hash(core) });
}

function snapshot() {
  const adapter = createWebMicroAppAdapter();
  const core = {
    schema: 'axm.code.grammar-glass-construction-hand-snapshot.v1',
    version: '1.0.0',
    status: 'TEST',
    adapterSha256: adapter.adapterSha256,
    supportedOutputTargets: [OUTPUT_TARGET],
    supportedAtomTypes: [...UNIVERSAL_ATOM_TYPES],
    supportedProgramFamilies: [...PROGRAM_FAMILIES],
    resultRail: [
      'DETERMINISTIC_WEB_MICRO_APP_CONSTRUCTION_PLAN_READY',
      'HELD_CONSTRUCTION_RULE_REQUIRED',
      'DETERMINISTIC_WEB_MICRO_APP_CANDIDATE_CONSTRUCTED_NOT_VERIFIED',
      'WEB_MICRO_APP_STATIC_VERIFICATION_PASS',
      'HELD_CONSTRUCTION_EXECUTOR_REQUIRED',
      'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED'
    ],
    truth: {
      genuineSourceBytesCanBeConstructed: true,
      arbitraryUnboundedSourceGenerationImplemented: false,
      staticVerificationProvesRuntimeCorrectness: false,
      automaticExecutionSelectionPromotionOrCanon: false
    },
    authority: 'NONE'
  };
  return deepFreeze({ ...core, snapshotSha256: hash(core) });
}

module.exports = Object.freeze({
  OUTPUT_TARGET,
  MAX_ARTIFACT_BYTES,
  PROGRAM_FAMILIES,
  programFamilyForRoll,
  programShapeDigest,
  CONSTRUCTION_RULES,
  createWebMicroAppAdapter,
  createConstructionDirection,
  createConstructionPlan,
  constructWebMicroApp,
  verifyWebMicroApp,
  createConstructionRunRequest,
  createTransientLaunchEnvelope,
  createConstructionVisualBundle,
  augmentVisualSnapshotWithConstructionHand,
  snapshot
});
