'use strict';
const assert = require('assert');
const Playground = require('./playground-core.js');
const Evidence = require('./evidence-body-core.js');
const Program = require('./construction-program-core.js');
const GapCompiler = require('./discovery-gap-compiler-core.js');
const Forge = require('./discovery-forge-core.js');
let checks = 0;
function ok(value, message) { assert.ok(value, message); checks += 1; }
function eq(actual, expected, message) { assert.deepStrictEqual(actual, expected, message); checks += 1; }
function throws(fn, pattern, message) { assert.throws(fn, pattern, message); checks += 1; }
function seal(core, field) { return Object.freeze({ ...core, [field]: Playground.sha256(core) }); }

const sourceBinding = Object.freeze({ rootSeed: 'seed-1', sourceSha256: 'source-1', profileSnapshotSha256: 'profiles-1', cycleSha256: 'cycle-1', conditionSha256: 'conditions-1' });
const preparationCore = {
  schema: 'axm.code.grammar-glass-discovery-preparation.v1', version: '1.0.0', result: 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN', holdReason: null,
  combinationIdentitySha256: 'combo-1', probeSha256: 'probe-1', roll: 1, sourceBinding,
  localHistoryBeforePreparation: { resultHistory: [{ sequence: 1, resultClass: 'PASS_OBSERVED', receiptDigest: 'runtime-receipt-1', candidateModelDigest: null, constructionPlanSha256: 'plan-1', artifactSha256: 'artifact-1' }] },
  languageIds: ['html', 'javascript'],
  grounding: { result: 'RECORDED_GRAMMAR_GROUNDING_READY', bindingProblems: [], atomRefs: [{ atomId: 'a' }, { atomId: 'b' }], relationRefs: [], directCarryRefs: [], memoryPathRefs: [], selectedAtomCount: 2, relationCount: 0, directCarryCount: 0, memoryPathCount: 0 },
  recordedLineage: { formationSha256: 'formation-1', mirrorObservationSha256: 'mirror-1', draftStarSha256: 'star-1', candidateModelDigest: null, runRequestSha256: 'request-1' },
  construction: { constructionBundleSha256: 'bundle-1', discoveryKilnCandidateSha256: 'kiln-1', constructionPlanSha256: 'plan-1', adapterSha256: 'adapter-1', directionSha256: 'direction-1', expectedArtifactSha256: 'artifact-1', expectedFileSha256: 'file-1', verificationSha256: 'verify-1', runRequestSha256: 'request-1', executorProfileDigest: 'executor-1' },
  stateRail: [], truth: { executionOccurred: false, automaticPromotion: false }, authority: 'NONE'
};
const preparation = seal(preparationCore, 'preparationSha256');
ok(GapCompiler.validPreparation(preparation), 'preparation digest should validate');

let body = Evidence.createBody({ subjectType: 'TEST', subjectSha256: preparation.preparationSha256, sourceBinding });
ok(Evidence.validBody(body), 'empty body validates');
body = Evidence.appendEvidence(body, { layer: 'SOURCE', status: 'PASS', claimCode: 'SOURCE_CURRENT', observedDigest: 'source-observation' });
ok(Evidence.validBody(body), 'body with record validates');
eq(body.recordCount, 1, 'append increments record count');
const firstEvidence = body.records[0].evidenceSha256;
body = Evidence.appendEvidence(body, { layer: 'SOURCE', status: 'FAIL', claimCode: 'SOURCE_CONTRADICTION', observedDigest: 'contradiction', resolvesEvidenceSha256: firstEvidence });
eq(body.recordCount, 2, 'later evidence appends rather than rewrites');
eq(body.records[0].status, 'PASS', 'earlier evidence preserved');
eq(body.records[1].resolvesEvidenceSha256, firstEvidence, 'resolution points backward');
const stale = Evidence.assess(body, { currentSourceBinding: { ...sourceBinding, cycleSha256: 'cycle-2' }, requiredLayers: ['SOURCE'] });
eq(stale.layerStates.SOURCE.state, 'STALE', 'changed source makes old evidence stale');
eq(stale.result, 'REQUIRED_EVIDENCE_INCOMPLETE_OR_STALE', 'stale evidence cannot certify current source');
throws(() => Evidence.appendEvidence(body, { layer: 'SOURCE', status: 'PASS', claimCode: 'BAD_RESOLVE', resolvesEvidenceSha256: 'missing' }), /RESOLUTION_TARGET_UNKNOWN/, 'unknown resolution target rejected');

const modules = [
  { id: 'seed', reads: [], writes: ['counter'], dependsOn: [], effects: ['seeded'], operations: [{ op: 'SET', path: 'counter', value: 0 }, { op: 'EMIT_SIGNAL', signal: 'seeded' }] },
  { id: 'advance', reads: ['counter'], writes: ['counter'], dependsOn: ['seed'], effects: ['advanced'], operations: [{ op: 'INCREMENT', path: 'counter', by: 2 }, { op: 'EMIT_SIGNAL', signal: 'advanced' }] },
  { id: 'finish', reads: ['counter'], writes: ['phase'], dependsOn: ['advance'], effects: ['finished'], operations: [{ op: 'ASSERT_EQ', path: 'counter', value: 2 }, { op: 'SET', path: 'phase', value: 'DONE' }, { op: 'EMIT_SIGNAL', signal: 'finished' }] }
];
const binding = { preparationSha256: preparation.preparationSha256, constructionPlanSha256: 'plan-1' };
const program = Program.createProgram({ programId: 'forge-test', modules, requiredEffects: ['seeded', 'advanced', 'finished'], binding });
ok(Program.validProgram(program), 'program validates');
eq(program.topologicalOrder, ['seed', 'advance', 'finish'], 'dependency order deterministic');
const programAgain = Program.createProgram({ programId: 'forge-test', modules, requiredEffects: ['finished', 'advanced', 'seeded'], binding });
eq(program.programSha256, programAgain.programSha256, 'required effect input order normalizes deterministically');
const execution = Program.execute(program, {});
eq(execution.result, 'PROGRAM_TRANSIENT_EXECUTION_COMPLETE', 'bounded program executes');
eq(execution.finalState, { counter: 2, phase: 'DONE' }, 'expected transient state produced');
eq(execution.realizedEffects, ['advanced', 'finished', 'seeded'], 'effects credited only from committed state-changing modules');
eq(execution.missingRequiredEffects, [], 'required effects satisfied');
eq(execution.authority, 'TRANSIENT_PROGRAM_STATE_ONLY', 'execution authority remains transient');
throws(() => Program.createProgram({ modules: [{ id: 'bad', reads: [], writes: ['x'], effects: [], operations: [{ op: 'INCREMENT', path: 'x', by: 1 }] }] }), /UNDECLARED_READ/, 'undeclared read rejected');
throws(() => Program.createProgram({ modules: [{ id: 'a', reads: [], writes: ['x'], dependsOn: [], effects: [], operations: [{ op: 'SET', path: 'x', value: 1 }] }, { id: 'b', reads: [], writes: ['x'], dependsOn: [], effects: [], operations: [{ op: 'SET', path: 'x', value: 2 }] }] }), /AMBIGUOUS_WRITE_ORDER/, 'unordered competing write rejected');
throws(() => Program.createProgram({ modules: [{ id: 'a', reads: [], writes: ['a'], dependsOn: ['b'], effects: [], operations: [{ op: 'SET', path: 'a', value: 1 }] }, { id: 'b', reads: [], writes: ['b'], dependsOn: ['a'], effects: [], operations: [{ op: 'SET', path: 'b', value: 1 }] }] }), /DEPENDENCY_CYCLE/, 'dependency cycle rejected');
throws(() => Program.createProgram({ modules: [{ id: 'bad', reads: [], writes: [], effects: ['network'], operations: [{ op: 'FETCH', url: 'https://example.com' }] }] }), /OPERATION_INVALID/, 'unknown external-style operation rejected');
const labelOnly = Program.createProgram({ programId: 'label-only', modules: [{ id: 'signal', reads: [], writes: [], effects: ['done'], operations: [{ op: 'EMIT_SIGNAL', signal: 'done' }] }], requiredEffects: ['done'] });
const labelOnlyRun = Program.execute(labelOnly, {});
eq(labelOnlyRun.result, 'PROGRAM_HELD_REQUIRED_EFFECTS_MISSING', 'effect label without state change cannot satisfy required effect');
eq(labelOnlyRun.realizedEffects, [], 'uncommitted-effect semantics preserve causal truth');
const failingProgram = Program.createProgram({ programId: 'atomic-failure', modules: [{ id: 'first', reads: [], writes: ['value'], effects: [], operations: [{ op: 'SET', path: 'value', value: 1 }] }, { id: 'second', reads: ['value'], writes: ['phase'], dependsOn: ['first'], effects: [], operations: [{ op: 'ASSERT_EQ', path: 'value', value: 9 }, { op: 'SET', path: 'phase', value: 'BAD' }] }] });
const failingRun = Program.execute(failingProgram, {});
eq(failingRun.result, 'PROGRAM_HELD_MODULE_FAILURE', 'failed module holds program');
eq(failingRun.finalState, { value: 1 }, 'failed module does not commit staged writes while prior prefix remains');

const forged = Forge.inspect({ preparation, program });
eq(forged.result, 'DISCOVERY_FORGE_READY_WITH_BOUND_PROGRAM_NOT_EXECUTED', 'forge binds verified construction and program without running it');
eq(forged.programState, 'VALID', 'program exact binding accepted');
eq(forged.gapCompilation.result, 'EXISTING_CONSTRUCTION_READY_FOR_EXPLICIT_ARM', 'existing Construction Hand readiness preserved');
eq(forged.assessment.layerStates.SOURCE.status, 'PASS', 'source evidence derived from grounded preparation');
eq(forged.assessment.layerStates.STATIC_VERIFICATION.status, 'PASS', 'static verification evidence bound');
eq(forged.assessment.layerStates.RUNTIME.status, 'PASS', 'matching terminal runtime receipt retained separately');
eq(forged.assessment.layerStates.VISUAL_OBSERVATION.state, 'ABSENT', 'visual observation stays unknown instead of inferred');
eq(forged.truth.programExecutedDuringInspection, false, 'inspection does not execute program');
const preview = Forge.runProgramPreview({ forgeReceipt: forged, program, initialState: {} });
eq(preview.result, 'PROGRAM_TRANSIENT_EXECUTION_COMPLETE', 'explicit preview can run bounded program');
eq(preview.execution.finalState.phase, 'DONE', 'preview returns transient result');
eq(preview.truth.constructionArtifactExecuted, false, 'program preview does not execute constructed artifact');

const noProgram = Forge.inspect({ preparation });
eq(noProgram.result, 'DISCOVERY_FORGE_EXISTING_CONSTRUCTION_READY_PROGRAM_OPTIONAL', 'existing construction remains usable without new program layer');
eq(noProgram.gapCompilation.extendedForgeResult, 'HELD_PROGRAM_CONTRACT_REQUIRED', 'extended path names missing program contract');
const wrongProgram = Program.createProgram({ programId: 'wrong-binding', modules, requiredEffects: [], binding: { preparationSha256: 'other', constructionPlanSha256: 'plan-1' } });
const wrong = Forge.inspect({ preparation, program: wrongProgram });
eq(wrong.programState, 'INVALID', 'wrong preparation binding rejected');
eq(wrong.gapCompilation.extendedForgeResult, 'HELD_PROGRAM_CONTRACT_INVALID', 'invalid program binding becomes explicit hold');

const heldCore = { ...preparationCore, result: 'HELD_ADAPTER_REQUIRED', holdReason: 'FULL_CYCLE_FORMATION_ADAPTER_REQUIRED', construction: null, localHistoryBeforePreparation: { resultHistory: [] } };
const held = seal(heldCore, 'preparationSha256');
const heldForge = Forge.inspect({ preparation: held });
eq(heldForge.result, 'DISCOVERY_FORGE_HELD', 'missing adapter remains held');
eq(heldForge.gapCompilation.selectedRouteGap, 'FORMATION_ADAPTER', 'existing hold compiles to exact typed gap');
ok(heldForge.gapCompilation.selectedRoute.length <= 3, 'gap route stays bounded to three steps');
eq(heldForge.gapCompilation.selectedRoute[0].kind, 'PRODUCER', 'gap route separates producer from verifier');
eq(heldForge.gapCompilation.truth.routeIsProposalNotExecution, true, 'gap route never becomes execution authority');

console.log(`Grammar Glass Evidence-First Discovery Forge selftest: ${checks} assertions PASS`);
