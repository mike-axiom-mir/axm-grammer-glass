import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  SPECS,
  deriveRegistry,
  validateCapabilityContract,
  writeOrCheck
} from './generate-registry.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

test('registry is deterministic and source-backed', () => {
  const first = deriveRegistry(root);
  const second = deriveRegistry(root);
  assert.equal(first.registryText, second.registryText);
  assert.equal(first.receiptText, second.receiptText);
  assert.equal(first.rows.length, 2);
  assert.equal(first.receipt.output.records, 2);
  assert.match(first.receipt.output.sha256, /^[0-9a-f]{64}$/);

  for (const row of first.rows) {
    assert.equal(row.schema, 'axm.public-capability/v1');
    assert.equal(row.status, 'TEST');
    assert.equal(row.maturity, 'test');
    assert.equal(row.reusable, true);
    assert.equal(row.truth.contract_authority, 'NONE');
    assert.equal(row.truth.declaration_is_runtime_proof, false);
    assert.equal(row.truth.grants_authority, false);
    assert.deepEqual(row.providers, ['axm-grammer-glass']);
    assert.deepEqual(row.consumers, []);
    for (const evidence of row.provenance.source_evidence) {
      assert.equal(fs.lstatSync(path.join(root, evidence)).isFile(), true);
    }
  }
});

test('committed registry and receipt match the current contracts', () => {
  assert.doesNotThrow(() => writeOrCheck(root, true));
});

test('authority drift fails closed', () => {
  const spec = SPECS[0];
  const contract = JSON.parse(fs.readFileSync(path.join(root, spec.contract), 'utf8'));
  contract.authority = 'MERGE';
  assert.throws(
    () => validateCapabilityContract(contract, spec),
    /authority must be NONE/
  );
});

test('status drift fails closed instead of overstating maturity', () => {
  const spec = SPECS[0];
  const contract = JSON.parse(fs.readFileSync(path.join(root, spec.contract), 'utf8'));
  contract.status = 'CANON';
  assert.throws(
    () => validateCapabilityContract(contract, spec),
    /status must remain explicit TEST/
  );
});

test('curated interfaces must still exist in the source contract', () => {
  const spec = SPECS[1];
  const contract = JSON.parse(fs.readFileSync(path.join(root, spec.contract), 'utf8'));
  const broken = structuredClone(spec);
  broken.interfaces = [...spec.interfaces, 'axm.missing-interface.v1'];
  assert.throws(
    () => validateCapabilityContract(contract, broken),
    /no longer declares interface axm\.missing-interface\.v1/
  );
});
