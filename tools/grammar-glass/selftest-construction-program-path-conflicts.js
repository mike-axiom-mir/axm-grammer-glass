'use strict';

const assert = require('assert/strict');
const Program = require('./construction-program-core.js');

function module(id, path, value, dependsOn = []) {
  return {
    id,
    reads: [],
    writes: [path],
    dependsOn,
    effects: [],
    operations: [{ op: 'SET', path, value }]
  };
}

assert.throws(
  () => Program.createProgram({
    programId: 'unordered-parent-child-writes',
    modules: [
      module('parent', 'state', { phase: 'PARENT' }),
      module('child', 'state.phase', 'CHILD')
    ]
  }),
  /CONSTRUCTION_PROGRAM_AMBIGUOUS_WRITE_ORDER:parent:child:state:state\.phase/,
  'unordered parent/descendant writes must not be resolved by module-id ordering'
);

assert.throws(
  () => Program.createProgram({
    programId: 'unordered-child-parent-writes',
    modules: [
      module('a-child', 'state.phase', 'CHILD'),
      module('z-parent', 'state', { phase: 'PARENT' })
    ]
  }),
  /CONSTRUCTION_PROGRAM_AMBIGUOUS_WRITE_ORDER:a-child:z-parent:state\.phase:state/,
  'the same conflict must be rejected independently of module-id order'
);

const siblings = Program.createProgram({
  programId: 'independent-sibling-writes',
  modules: [
    module('left', 'state.left', 1),
    module('right', 'state.right', 2)
  ]
});
assert.equal(Program.validProgram(siblings), true, 'sibling paths remain independent');
assert.deepEqual(
  Program.execute(siblings).finalState,
  { state: { left: 1, right: 2 } },
  'independent sibling writes retain deterministic execution'
);

const ordered = Program.createProgram({
  programId: 'ordered-parent-child-writes',
  modules: [
    module('parent', 'state', { phase: 'PARENT' }),
    module('child', 'state.phase', 'CHILD', ['parent'])
  ]
});
assert.equal(Program.validProgram(ordered), true, 'an explicit dependency orders overlapping paths');
assert.deepEqual(
  Program.execute(ordered).finalState,
  { state: { phase: 'CHILD' } },
  'the declared dependency determines the final nested state'
);

process.stdout.write(JSON.stringify({
  result: 'GRAMMAR_GLASS_CONSTRUCTION_PROGRAM_PATH_CONFLICT_SELFTEST_PASS',
  assertions: 6,
  invariant: 'unordered writes must be path-disjoint, not merely textually different',
  authority: 'TRANSIENT_PROGRAM_STATE_ONLY'
}, null, 2) + '\n');
