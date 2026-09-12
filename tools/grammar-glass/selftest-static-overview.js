'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { renderStaticOverview, writeStaticOverview } = require('./static-overview.js');

function atom(index, count) {
  const angle = (index / count) * Math.PI * 2;
  return {
    atomId: `atom:${index}`,
    languageId: `language-${index % 12}`,
    grammarFamilyId: `family-${index % 4}`,
    atomType: ['STATE', 'CONDITION', 'TYPE', 'EFFECT'][index % 4],
    appliedInfluenceCarryCount: index % 31 === 0 ? 1 : 0,
    position: { x: Math.cos(angle) * 0.82, y: Math.sin(angle) * 0.82 }
  };
}

function fixture(count = 1000) {
  const atoms = Array.from({ length: count }, (_, index) => atom(index, count));
  return {
    schema: 'axm.code.grammar-glass-visual-snapshot.v1',
    version: '1.4.0',
    profileCount: 102,
    visualSnapshotSha256: 'snapshot:test',
    cycle: {
      tick: 6,
      cycleSha256: 'cycle:test',
      atoms,
      edges: Array.from({ length: Math.min(40, atoms.length) }, (_, index) => ({
        leftAtomId: atoms[index].atomId,
        rightAtomId: atoms[(index + 1) % atoms.length].atomId,
        thresholdMet: index % 2 === 0
      }))
    },
    draftSky: [{ x: 0.2, y: -0.3, brightness: 1, languageIds: ['language-1', 'language-2'] }]
  };
}

function run() {
  const source = fixture();
  const before = JSON.stringify(source);
  const first = renderStaticOverview(source, { width: 1200, height: 760, mode: 'AUTO' });
  const second = renderStaticOverview(source, { width: 1200, height: 760, mode: 'SAFE' });
  assert.strictEqual(first.svg, second.svg, 'same snapshot and resolved projection must replay byte-for-byte');
  assert.deepStrictEqual(first.receipt, second.receipt, 'receipt must replay byte-for-byte');
  assert.strictEqual(first.receipt.projectionMode, 'SAFE');
  assert.strictEqual(first.receipt.evidenceAtomCount, 1000);
  assert.strictEqual(first.receipt.renderedAtomCount, 384);
  assert.strictEqual(first.receipt.projectionHeldAtomCount, 616);
  assert.strictEqual(first.receipt.languageCoverageCount, 12);
  assert.strictEqual(first.receipt.truth.staticProjectionCreatesEvidence, false);
  assert.strictEqual(first.receipt.truth.heldFromProjectionMeansAbsent, false);
  assert.strictEqual(first.receipt.truth.authority, 'NONE');
  assert.match(first.svg, /role="img" aria-labelledby="overview-title overview-desc"/);
  assert.match(first.svg, /EVIDENCE ATOMS/);
  assert.match(first.svg, /HELD FROM DRAW/);
  assert.match(first.svg, /Stars are receipts, not quality votes or authority/);
  assert.doesNotMatch(first.svg, /<(?:script|image|use|foreignObject)\b|\b(?:href|src)=/i);
  assert.strictEqual(JSON.stringify(source), before, 'static rendering must not mutate the snapshot');

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grammar-glass-static-'));
  const target = path.join(root, 'overview.svg');
  const receipt = writeStaticOverview(source, target, { width: 1200, height: 760 });
  assert.strictEqual(fs.readFileSync(target, 'utf8'), first.svg);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${target}.receipt.json`, 'utf8')), receipt);
  fs.rmSync(root, { recursive: true, force: true });

  assert.throws(
    () => renderStaticOverview({ schema: 'wrong' }),
    /STATIC_OVERVIEW_VALID_VISUAL_SNAPSHOT_REQUIRED/
  );
  const broken = fixture(4);
  delete broken.cycle.atoms[0].position;
  assert.throws(() => renderStaticOverview(broken), /STATIC_OVERVIEW_ATOM_POSITION_REQUIRED/);
  console.log(JSON.stringify({ ok: true, receipt: first.receipt }, null, 2));
}

run();
