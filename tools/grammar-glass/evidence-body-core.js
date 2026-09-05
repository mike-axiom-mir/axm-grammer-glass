(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./playground-core.js') : root.AXMGrammarGlassPlaygroundCore
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassEvidenceBodyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Playground) {
  'use strict';

  const LAYERS = Object.freeze(['DECLARED', 'SOURCE', 'STATIC_VERIFICATION', 'RUNTIME', 'VISUAL_OBSERVATION']);
  const STATUSES = Object.freeze(['PASS', 'FAIL', 'HOLD', 'UNKNOWN', 'OBSERVED', 'PRESENT', 'ABSENT', 'MISMATCH', 'ERROR']);
  const POSITIVE = new Set(['PASS', 'OBSERVED', 'PRESENT']);

  function canon(value) { return Playground.canon(value); }
  function sha256(value) { return Playground.sha256(value); }
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const child of Object.values(value)) freeze(child);
    }
    return value;
  }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function sourceKey(sourceBinding) { return sha256(sourceBinding || {}); }
  function recordCore(record) { const copy = { ...record }; delete copy.evidenceSha256; return copy; }
  function bodyCore(body) { const copy = { ...body }; delete copy.bodySha256; return copy; }

  function createBody({ subjectType, subjectSha256, sourceBinding = {}, parentEvidenceBodySha256 = null } = {}) {
    if (!subjectType || !subjectSha256) throw Error('EVIDENCE_BODY_SUBJECT_REQUIRED');
    const core = {
      schema: 'axm.code.grammar-glass-evidence-body.v1',
      version: '1.0.0',
      result: 'EVIDENCE_BODY_READY_EMPTY',
      subjectType: String(subjectType),
      subjectSha256: String(subjectSha256),
      sourceBinding: clone(sourceBinding),
      sourceKey: sourceKey(sourceBinding),
      parentEvidenceBodySha256: parentEvidenceBodySha256 || null,
      recordCount: 0,
      records: [],
      truth: {
        appendOnly: true,
        declarationIsNotRuntimeProof: true,
        sourceWitnessIsNotRuntimeProof: true,
        runtimeEvidenceDoesNotProveVisualQuality: true,
        visualObservationDoesNotProveSemanticCorrectness: true,
        staleEvidenceIsNotCurrentProof: true,
        laterEvidenceDoesNotRewriteEarlierEvidence: true,
        evidenceDoesNotGrantExecutionOrPromotionAuthority: true
      },
      authority: 'NONE'
    };
    return freeze({ ...core, bodySha256: sha256(core) });
  }

  function validRecord(record, body = null) {
    if (!record || record.schema !== 'axm.code.grammar-glass-evidence-record.v1' || !record.evidenceSha256) return false;
    if (!LAYERS.includes(record.layer) || !STATUSES.includes(record.status) || !record.claimCode || !record.subjectSha256 || !record.sourceKey) return false;
    if (!Number.isSafeInteger(record.sequence) || record.sequence < 1) return false;
    if (sha256(recordCore(record)) !== record.evidenceSha256) return false;
    if (body && (record.subjectSha256 !== body.subjectSha256 || record.sourceKey !== body.sourceKey)) return false;
    return true;
  }

  function validBody(body) {
    if (!body || body.schema !== 'axm.code.grammar-glass-evidence-body.v1' || !body.bodySha256 || !Array.isArray(body.records)) return false;
    if (sha256(bodyCore(body)) !== body.bodySha256 || body.recordCount !== body.records.length || body.sourceKey !== sourceKey(body.sourceBinding)) return false;
    const seen = new Set();
    for (let i = 0; i < body.records.length; i += 1) {
      const record = body.records[i];
      if (!validRecord(record, body) || record.sequence !== i + 1 || seen.has(record.evidenceSha256)) return false;
      if (record.resolvesEvidenceSha256 && !seen.has(record.resolvesEvidenceSha256)) return false;
      seen.add(record.evidenceSha256);
    }
    return true;
  }

  function appendEvidence(body, {
    layer,
    status,
    claimCode,
    observedDigest = null,
    detail = null,
    resolvesEvidenceSha256 = null
  } = {}) {
    if (!validBody(body)) throw Error('VALID_EVIDENCE_BODY_REQUIRED');
    if (!LAYERS.includes(layer)) throw Error('EVIDENCE_LAYER_INVALID');
    if (!STATUSES.includes(status)) throw Error('EVIDENCE_STATUS_INVALID');
    if (!claimCode) throw Error('EVIDENCE_CLAIM_CODE_REQUIRED');
    if (resolvesEvidenceSha256 && !body.records.some(record => record.evidenceSha256 === resolvesEvidenceSha256)) throw Error('EVIDENCE_RESOLUTION_TARGET_UNKNOWN');
    const core = {
      schema: 'axm.code.grammar-glass-evidence-record.v1',
      version: '1.0.0',
      sequence: body.recordCount + 1,
      layer,
      status,
      claimCode: String(claimCode),
      subjectSha256: body.subjectSha256,
      sourceKey: body.sourceKey,
      observedDigest: observedDigest || null,
      detail: detail == null ? null : clone(detail),
      resolvesEvidenceSha256: resolvesEvidenceSha256 || null,
      truth: {
        boundedObservationOnly: true,
        grantsAuthority: false
      },
      authority: 'NONE'
    };
    const record = freeze({ ...core, evidenceSha256: sha256(core) });
    const nextCore = {
      ...bodyCore(body),
      result: 'EVIDENCE_BODY_READY_WITH_RECORDS',
      recordCount: body.recordCount + 1,
      records: [...body.records, record]
    };
    return freeze({ ...nextCore, bodySha256: sha256(nextCore) });
  }

  function latestForLayer(body, layer) {
    if (!validBody(body) || !LAYERS.includes(layer)) return null;
    for (let i = body.records.length - 1; i >= 0; i -= 1) if (body.records[i].layer === layer) return body.records[i];
    return null;
  }

  function assess(body, { currentSubjectSha256 = null, currentSourceBinding = null, requiredLayers = [] } = {}) {
    if (!validBody(body)) throw Error('VALID_EVIDENCE_BODY_REQUIRED');
    const subjectSha256 = currentSubjectSha256 || body.subjectSha256;
    const currentSourceKey = currentSourceBinding == null ? body.sourceKey : sourceKey(currentSourceBinding);
    const layerStates = {};
    for (const layer of LAYERS) {
      const latest = latestForLayer(body, layer);
      if (!latest) {
        layerStates[layer] = { state: 'ABSENT', current: false, status: null, evidenceSha256: null };
        continue;
      }
      const current = latest.subjectSha256 === subjectSha256 && latest.sourceKey === currentSourceKey;
      layerStates[layer] = {
        state: current ? latest.status : 'STALE',
        current,
        status: latest.status,
        claimCode: latest.claimCode,
        evidenceSha256: latest.evidenceSha256,
        observedDigest: latest.observedDigest
      };
    }
    const required = [...new Set(requiredLayers)].filter(layer => LAYERS.includes(layer));
    const missingOrStale = required.filter(layer => !layerStates[layer].current || !POSITIVE.has(layerStates[layer].status));
    const core = {
      schema: 'axm.code.grammar-glass-evidence-assessment.v1',
      version: '1.0.0',
      result: missingOrStale.length ? 'REQUIRED_EVIDENCE_INCOMPLETE_OR_STALE' : 'REQUIRED_EVIDENCE_CURRENT',
      bodySha256: body.bodySha256,
      subjectSha256,
      currentSourceKey,
      requiredLayers: required,
      missingOrStaleLayers: missingOrStale,
      layerStates,
      truth: {
        noSingleGlobalGreenLight: true,
        eachLayerRetainsItsOwnMeaning: true,
        movedSourceInvalidatesCurrentProofWithoutDeletingHistory: true,
        assessmentGrantsNoAuthority: true
      },
      authority: 'NONE'
    };
    return freeze({ ...core, assessmentSha256: sha256(core) });
  }

  return Object.freeze({ LAYERS, STATUSES, canon, sha256, sourceKey, createBody, validRecord, validBody, appendEvidence, latestForLayer, assess });
});
