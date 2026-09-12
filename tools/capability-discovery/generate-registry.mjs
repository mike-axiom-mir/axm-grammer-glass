#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRY_SCHEMA = 'axm.public-capability/v1';
const RECEIPT_SCHEMA = 'axm.grammar-glass.capability-registry-receipt/v1';
const GENERATOR_PATH = 'tools/capability-discovery/generate-registry.mjs';
const OUTPUT_PATH = 'registry/public-capabilities.jsonl';
const RECEIPT_PATH = 'registry/public-capabilities.receipt.json';
const PATTERN_PROVENANCE = 'axm-local-game-hub#automation/capability-weaver-hub-registry-v0.1';

const SPECS = Object.freeze([
  Object.freeze({
    id: 'axm.code.grammar-glass-construction-hand-contract.v1',
    contract: 'shared/code-capability-fabric/language-organs/code-grammar-glass-construction-hand.contract.json',
    implementation: 'shared/code-capability-fabric/language-organs/code-grammar-glass-construction-hand.js',
    interfaces: Object.freeze([
      'axm.code.grammar-glass-browser-construction-replay.v1',
      'axm.code.grammar-glass-constructed-artifact.v1',
      'axm.code.grammar-glass-construction-browser-runtime-receipt.v1',
      'axm.code.grammar-glass-construction-direction.v1',
      'axm.code.grammar-glass-construction-launch-envelope.v1',
      'axm.code.grammar-glass-construction-plan.v1',
      'axm.code.grammar-glass-construction-run-request.v1',
      'axm.code.grammar-glass-construction-static-verification.v1',
      'axm.code.grammar-glass-construction-visual-bundle.v1',
      'axm.code.grammar-glass-discovery-kiln-candidate.v1'
    ])
  }),
  Object.freeze({
    id: 'axm.code.grammar-glass-discovery-kiln-contract.v1',
    contract: 'shared/code-capability-fabric/language-organs/code-grammar-glass-discovery-kiln.contract.json',
    implementation: 'shared/code-capability-fabric/language-organs/code-grammar-glass-discovery-kiln.js',
    interfaces: Object.freeze([
      'axm.code.grammar-glass-cycle-state.v1',
      'axm.code.grammar-glass-discovery-kiln-candidate.v1',
      'axm.code.grammar-glass-local-discovery-ledger.v1',
      'axm.code.grammar-glass-playground-probe.v1',
      'axm.code.grammar-structural-atom-catalog.v1'
    ])
  })
]);

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function gitBlobSha1(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
}

function readRegularFile(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const absolute = path.resolve(resolvedRoot, relativePath);
  if (absolute !== resolvedRoot && !absolute.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`source path escapes repository root: ${relativePath}`);
  }
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`source must be a regular file: ${relativePath}`);
  }
  const bytes = fs.readFileSync(absolute);
  return { relativePath, bytes, gitBlobSha1: gitBlobSha1(bytes) };
}

function parseJsonSource(root, relativePath) {
  const source = readRegularFile(root, relativePath);
  let value;
  try {
    value = JSON.parse(source.bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`${relativePath} is not valid JSON: ${error.message}`);
  }
  return { ...source, value };
}

function containsExactString(value, needle) {
  if (value === needle) return true;
  if (Array.isArray(value)) return value.some((item) => containsExactString(item, needle));
  if (value && typeof value === 'object') {
    return Object.values(value).some((item) => containsExactString(item, needle));
  }
  return false;
}

function validateCapabilityContract(contract, spec) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    throw new Error(`${spec.contract} must contain a JSON object`);
  }
  if (contract.schema !== spec.id) {
    throw new Error(`${spec.contract} schema drift: ${JSON.stringify(contract.schema)} != ${JSON.stringify(spec.id)}`);
  }
  if (contract.status !== 'TEST') {
    throw new Error(`${spec.contract} status must remain explicit TEST for this public declaration`);
  }
  if (contract.authority !== 'NONE') {
    throw new Error(`${spec.contract} authority must be NONE for public discovery`);
  }
  if (typeof contract.purpose !== 'string' || contract.purpose.trim() === '') {
    throw new Error(`${spec.contract} purpose must be a non-empty string`);
  }
  for (const interfaceId of spec.interfaces) {
    if (!containsExactString(contract, interfaceId)) {
      throw new Error(`${spec.contract} no longer declares interface ${interfaceId}`);
    }
  }
}

function deriveRegistry(root) {
  const inputs = [];
  const rows = [];
  for (const spec of SPECS) {
    const contractSource = parseJsonSource(root, spec.contract);
    validateCapabilityContract(contractSource.value, spec);

    const implementationSource = readRegularFile(root, spec.implementation);
    if (!implementationSource.bytes.includes(Buffer.from('module.exports', 'utf8'))) {
      throw new Error(`${spec.implementation} no longer exposes a CommonJS module surface`);
    }

    inputs.push(
      { path: spec.contract, git_blob_sha1: contractSource.gitBlobSha1 },
      { path: spec.implementation, git_blob_sha1: implementationSource.gitBlobSha1 }
    );

    rows.push({
      schema: REGISTRY_SCHEMA,
      id: contractSource.value.schema,
      type: 'provider',
      purpose: contractSource.value.purpose,
      interfaces: [...spec.interfaces].sort((a, b) => a.localeCompare(b)),
      providers: ['axm-grammer-glass'],
      consumers: [],
      status: contractSource.value.status,
      maturity: contractSource.value.status.toLowerCase(),
      reusable: true,
      provenance: {
        generated_by: GENERATOR_PATH,
        pattern_provenance: PATTERN_PROVENANCE,
        source_evidence: [spec.contract, spec.implementation]
      },
      truth: {
        contract_authority: contractSource.value.authority,
        declaration_is_runtime_proof: false,
        grants_authority: false
      }
    });
  }

  rows.sort((a, b) => a.id.localeCompare(b.id));
  const registryText = `${rows.map((row) => canonical(row)).join('\n')}\n`;
  inputs.sort((a, b) => a.path.localeCompare(b.path));
  const receipt = {
    schema: RECEIPT_SCHEMA,
    generator: GENERATOR_PATH,
    pattern_provenance: {
      repo: 'mike-axiom-mir/axm-local-game-hub',
      ref: 'automation/capability-weaver-hub-registry-v0.1',
      path: 'tools/generate-capability-registry.cjs',
      relationship: 'adapted-pattern-no-runtime-dependency'
    },
    inputs,
    output: {
      path: OUTPUT_PATH,
      records: rows.length,
      sha256: sha256(Buffer.from(registryText, 'utf8'))
    },
    truth: {
      declarations_are_runtime_proof: false,
      grants_authority: false,
      public_discovery_is_explicit_opt_in: true,
      source_contracts_remain_authoritative: true
    }
  };
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  return { rows, registryText, receipt, receiptText };
}

function writeOrCheck(root, check = false) {
  const result = deriveRegistry(root);
  const targets = [
    [OUTPUT_PATH, result.registryText],
    [RECEIPT_PATH, result.receiptText]
  ];
  const stale = [];
  for (const [relativePath, expected] of targets) {
    const absolute = path.join(root, relativePath);
    if (check) {
      const actual = fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : null;
      if (actual !== expected) stale.push(relativePath);
    } else {
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      fs.writeFileSync(absolute, expected, 'utf8');
    }
  }
  if (stale.length) throw new Error(`stale generated capability discovery: ${stale.join(', ')}`);
  return result;
}

function main(argv = process.argv.slice(2)) {
  const check = argv.includes('--check');
  const unknown = argv.filter((arg) => arg !== '--check');
  if (unknown.length) throw new Error(`unknown arguments: ${unknown.join(' ')}`);
  const here = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(here, '..', '..');
  const result = writeOrCheck(root, check);
  process.stdout.write(
    `grammar-glass-capability-discovery: ${check ? 'verified' : 'wrote'} ${result.rows.length} records sha256:${result.receipt.output.sha256}\n`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`grammar-glass-capability-discovery: ERROR: ${error.message}\n`);
    process.exitCode = 1;
  }
}

export {
  SPECS,
  canonical,
  containsExactString,
  deriveRegistry,
  gitBlobSha1,
  validateCapabilityContract,
  writeOrCheck
};
