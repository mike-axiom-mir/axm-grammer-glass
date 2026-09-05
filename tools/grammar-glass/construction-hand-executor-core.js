(function (root, factory) {
  const api = factory(
    typeof require === 'function' ? require('./construction-hand-core.js') : root.AXMGrammarGlassConstructionHandCore
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassConstructionHandExecutorCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ConstructionHand) {
  'use strict';

  const STATES = Object.freeze([
    'EMPTY',
    'SOURCE_BUILT',
    'EXECUTION_READY',
    'RUNNING',
    'PASS_OBSERVED',
    'FAIL_OBSERVED',
    'CRASH_OBSERVED',
    'TIMEOUT_OBSERVED',
    'RESULT_SEALED',
    'SOURCE_RELEASED'
  ]);
  const TERMINAL = Object.freeze(['PASS_OBSERVED', 'FAIL_OBSERVED', 'CRASH_OBSERVED', 'TIMEOUT_OBSERVED']);

  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const child of Object.values(value)) freeze(child);
    }
    return value;
  }

  function validFrame(frame) {
    return !!frame && ['setSandbox', 'showArmed', 'load', 'release'].every(name => typeof frame[name] === 'function');
  }

  function createExecutor({ setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
    const listeners = new Set();
    let session = null;

    function emit(state, detail = {}) {
      if (!STATES.includes(state)) return;
      if (session) session.state = state;
      for (const listener of listeners) {
        try { listener({ state, detail, session: snapshot() }); } catch {}
      }
    }

    function snapshot() {
      if (!session) return freeze({ state: 'EMPTY', attempts: 0, used: false, terminalState: null, lastReceipt: null, sourceHeld: false });
      return freeze({
        state: session.state,
        attempts: session.attempts,
        used: session.used,
        terminalState: session.terminalState,
        constructionPlanSha256: session.planSha256,
        artifactSha256: session.artifactSha256,
        requestSha256: session.requestSha256,
        runtimePayloadDigest: session.fileSha256,
        lastReceipt: session.lastReceipt,
        sourceHeld: typeof session.sourceText === 'string'
      });
    }

    function makeReceipt(state, payload = {}, opaqueOrigin = false) {
      const core = {
        schema: 'axm.code.grammar-glass-construction-browser-runtime-receipt.v1',
        version: '1.0.0',
        result: 'CONSTRUCTION_BROWSER_RUNTIME_OBSERVATION_SEALED',
        state,
        requestSha256: session.requestSha256,
        constructionPlanSha256: session.planSha256,
        adapterSha256: session.adapterSha256,
        artifactSha256: session.artifactSha256,
        fileSha256: session.fileSha256,
        executorProfileDigest: session.executorProfileDigest,
        runtimePayloadDigest: session.fileSha256,
        attempt: 1,
        observedMessageType: payload.type || null,
        observedValue: Number.isSafeInteger(payload.value) ? payload.value : null,
        observedTicks: Number.isSafeInteger(payload.ticks) ? payload.ticks : null,
        invariantPass: payload.invariantPass === true,
        opaqueOriginObserved: opaqueOrigin === true,
        sandboxTokens: ['allow-scripts'],
        sourceWorkspaceWriteObserved: false,
        childProcessObserved: false,
        automaticRepeatObserved: false,
        transientPayloadReleasedAtSeal: false,
        truth: {
          runtimeMessageWasObserved: state !== 'TIMEOUT_OBSERVED',
          resultIsBoundToExactConstructedBytes: true,
          passMeansBoundedRuntimeInvariantOnly: true,
          passIsNotQualityCorrectnessAdmissionOrPromotion: true
        },
        authority: 'NONE'
      };
      return freeze({ ...core, runtimeReceiptSha256: ConstructionHand.sha256(core) });
    }

    function seal(state, payload = {}, opaqueOrigin = false) {
      if (!session || session.state !== 'RUNNING' || !TERMINAL.includes(state)) return null;
      if (session.timer) clearTimer(session.timer);
      session.timer = null;
      const receipt = makeReceipt(state, payload, opaqueOrigin);
      session.terminalState = state;
      session.lastReceipt = receipt;
      emit(state, { receipt });
      emit('RESULT_SEALED', { receipt });
      return receipt;
    }

    function arm(build, frame) {
      if (!build || build.result !== 'BROWSER_CONSTRUCTION_REPLAY_VERIFIED' || !build.transientSource || !validFrame(frame)) return null;
      const request = build.runRequest;
      const profile = request && request.executorProfile;
      if (!request || request.result !== 'CONSTRUCTION_SANDBOX_REQUEST_READY_NOT_EXECUTED' ||
          request.artifactSha256 !== build.artifact.artifactSha256 ||
          request.constructionPlanSha256 !== build.artifact.constructionPlanSha256 ||
          build.transientSource.sha256 !== build.artifact.files[0].sha256 ||
          profile?.allowSameOrigin !== false ||
          ConstructionHand.canon(profile?.sandboxTokens) !== ConstructionHand.canon(['allow-scripts']) ||
          profile?.networkMode !== 'NONE' ||
          request.resourceCeilings?.maxAttempts !== 1 ||
          !Number.isSafeInteger(request.resourceCeilings?.timeoutMs) || request.resourceCeilings.timeoutMs < 1) return null;
      if (session?.timer) clearTimer(session.timer);
      session = {
        state: 'SOURCE_BUILT',
        build,
        frame,
        sourceText: build.transientSource.utf8Text,
        fileSha256: build.transientSource.sha256,
        planSha256: build.artifact.constructionPlanSha256,
        adapterSha256: build.artifact.adapterSha256,
        artifactSha256: build.artifact.artifactSha256,
        requestSha256: request.requestSha256,
        executorProfileDigest: request.executorProfileDigest,
        timeoutMs: request.resourceCeilings.timeoutMs,
        attempts: 0,
        used: false,
        terminalState: null,
        lastReceipt: null,
        timer: null
      };
      emit('SOURCE_BUILT', { fileSha256: session.fileSha256, byteLength: build.transientSource.byteLength });
      frame.setSandbox(['allow-scripts']);
      frame.showArmed({ requestSha256: session.requestSha256, artifactSha256: session.artifactSha256 });
      emit('EXECUTION_READY', { requestSha256: session.requestSha256 });
      return snapshot();
    }

    function runOnce() {
      if (!session || session.state !== 'EXECUTION_READY' || session.used || typeof session.sourceText !== 'string') return false;
      session.used = true;
      session.attempts = 1;
      emit('RUNNING', { attempt: 1, runtimePayloadDigest: session.fileSha256 });
      session.timer = setTimer(() => seal('TIMEOUT_OBSERVED', { type: 'NO_MESSAGE_BEFORE_TIMEOUT', invariantPass: false }, false), session.timeoutMs);
      session.frame.load(session.sourceText);
      return true;
    }

    function acceptObservation(payload, { opaqueOrigin = false } = {}) {
      if (!session || session.state !== 'RUNNING' || !payload) return null;
      if (payload.constructionPlanSha256 !== session.planSha256 || payload.adapterSha256 !== session.adapterSha256) return null;
      if (payload.type === 'AXM_CONSTRUCTION_HAND_CRASH_V1') return seal('CRASH_OBSERVED', payload, opaqueOrigin);
      if (!['AXM_CONSTRUCTION_HAND_READY_V1', 'AXM_CONSTRUCTION_HAND_STATE_V1'].includes(payload.type)) return null;
      const pass = payload.invariantPass === true && opaqueOrigin === true;
      return seal(pass ? 'PASS_OBSERVED' : 'FAIL_OBSERVED', payload, opaqueOrigin);
    }

    function release() {
      if (!session) return false;
      if (session.timer) clearTimer(session.timer);
      session.timer = null;
      session.sourceText = null;
      session.build = null;
      session.frame.release({ lastReceipt: session.lastReceipt });
      emit('SOURCE_RELEASED', { receiptRetained: !!session.lastReceipt });
      return true;
    }

    return Object.freeze({
      arm,
      runOnce,
      acceptObservation,
      release,
      snapshot,
      on(listener) { listeners.add(listener); return () => listeners.delete(listener); }
    });
  }

  return Object.freeze({ STATES, TERMINAL, createExecutor });
});
