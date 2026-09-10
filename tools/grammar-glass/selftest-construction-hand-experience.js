'use strict';
const assert = require('assert/strict');
const Experience = require('./construction-hand.js');
let assertions = 0;
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); assertions += 1; };
const ok = (value, message) => { assert.ok(value, message); assertions += 1; };

const waiting = Experience.project();
eq(waiting.phase, 'WAITING_FOR_ROLL', 'empty construction flow points back to recorded roll/preparation');
eq(waiting.nextControlId, null, 'construction does not enable an action before preparation');
eq(waiting.automaticAdvance, false, 'observer never auto-advances the explicit action sequence');

const held = Experience.project({ hasProbe: true, exactPlan: false });
eq(held.phase, 'HELD_NO_EXACT_PLAN', 'out-of-field probe is visibly held');
ok(held.detail.includes('no renderer will be guessed'), 'held guidance keeps the no-guess truth boundary');

const prepare = Experience.project({ hasProbe: true, exactPlan: true });
eq(prepare.phase, 'READY_TO_PREPARE', 'exact unprepared plan points to Discovery Kiln preparation');
eq(prepare.label, 'PREPARE ABOVE', 'preparation is identified as the next explicit action');

const build = Experience.project({
  hasProbe: true,
  exactPlan: true,
  preparationResult: 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN'
});
eq(build.phase, 'READY_TO_BUILD', 'bound plan advances realization to build');
eq(build.nextControlId, 'constructionBuild', 'build control is the sole recommended next construction action');
eq(build.stages.find(step => step.key === 'build').state, 'READY', 'build stage is visibly ready');

const arm = Experience.project({
  hasProbe: true,
  exactPlan: true,
  preparationResult: 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN',
  hasBuild: true,
  executorState: 'EMPTY'
});
eq(arm.phase, 'READY_TO_ARM', 'verified source advances realization to arm');
eq(arm.nextControlId, 'constructionArm', 'arm is the next explicit control');
eq(arm.stages.find(step => step.key === 'build').state, 'DONE', 'completed build remains visibly complete');

const run = Experience.project({
  hasProbe: true,
  exactPlan: true,
  preparationResult: 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN',
  hasBuild: true,
  executorState: 'EXECUTION_READY',
  sourceHeld: true
});
eq(run.phase, 'READY_TO_RUN', 'armed sandbox advances realization to run');
eq(run.nextControlId, 'constructionRun', 'run-once control is the explicit next action');
ok(run.detail.includes('once'), 'run guidance preserves one-attempt boundary');

const running = Experience.project({
  hasProbe: true,
  exactPlan: true,
  preparationResult: 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN',
  hasBuild: true,
  executorState: 'RUNNING',
  sourceHeld: true
});
eq(running.phase, 'RUNNING', 'active attempt does not pretend a result exists');
eq(running.nextControlId, null, 'active attempt does not auto-push the user into another action');
ok(running.detail.includes('without inventing a result'), 'running guidance preserves evidence boundary');

const sealed = Experience.project({
  hasProbe: true,
  exactPlan: true,
  preparationResult: 'DISCOVERY_PREPARATION_BOUND_TO_CONSTRUCTION_PLAN',
  hasBuild: true,
  executorState: 'RESULT_SEALED',
  terminalState: 'PASS_OBSERVED',
  sourceHeld: true
});
eq(sealed.phase, 'RECEIPT_SEALED', 'terminal observation becomes a sealed-receipt experience state');
eq(sealed.nextControlId, 'constructionRelease', 'release is recommended only after the result is visible');
ok(sealed.detail.includes('evidence only'), 'PASS remains evidence rather than quality or authority');
eq(sealed.executionAuthorityAdded, false, 'experience projection adds no execution authority');

process.stdout.write(JSON.stringify({
  result: 'GRAMMAR_GLASS_CONSTRUCTION_HAND_EXPERIENCE_SELFTEST_PASS',
  assertions
}, null, 2) + '\n');
