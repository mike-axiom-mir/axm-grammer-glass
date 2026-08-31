(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassConstructionRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const OUTPUT_TARGET = 'SELF_CONTAINED_OFFLINE_HTML_MICRO_APP';
  const DEFAULT_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; child-src 'none'; form-action 'none'; base-uri 'none'";
  const CONSTRUCTION_RULES = Object.freeze({
    STATE: Object.freeze({ ruleId: 'WEB_STATE_REGISTER_V1', targetRole: 'STATE_REGISTER', parameterSlot: 'initialValue' }),
    CONDITION: Object.freeze({ ruleId: 'WEB_THRESHOLD_BRANCH_V1', targetRole: 'CONDITION_BRANCH', parameterSlot: 'threshold' }),
    TRANSFORMATION: Object.freeze({ ruleId: 'WEB_BOUNDED_STEP_V1', targetRole: 'STATE_TRANSFORMATION', parameterSlot: 'step' }),
    CONTROL_FLOW: Object.freeze({ ruleId: 'WEB_SINGLE_EVENT_PIPELINE_V1', targetRole: 'CONTROL_FLOW', parameterSlot: 'direction' }),
    TYPE: Object.freeze({ ruleId: 'WEB_SAFE_INTEGER_NORMALIZATION_V1', targetRole: 'RUNTIME_SHAPE', parameterSlot: 'modulus' }),
    INTERFACE: Object.freeze({ ruleId: 'WEB_BUTTON_READOUT_V1', targetRole: 'INTERACTION_SURFACE', parameterSlot: 'actionLabel' }),
    EFFECT: Object.freeze({ ruleId: 'WEB_RENDER_EFFECT_V1', targetRole: 'VISIBLE_EFFECT', parameterSlot: 'energyScalePpm' }),
    DEPENDENCY: Object.freeze({ ruleId: 'WEB_INTERNAL_MANIFEST_BINDING_V1', targetRole: 'INTERNAL_DEPENDENCY', parameterSlot: 'lineageCount' }),
    VERIFICATION: Object.freeze({ ruleId: 'WEB_RUNTIME_INVARIANT_V1', targetRole: 'VERIFICATION_READOUT', parameterSlot: 'verificationMode' }),
    FAILURE: Object.freeze({ ruleId: 'WEB_VISIBLE_HOLD_STATE_V1', targetRole: 'FAILURE_SURFACE', parameterSlot: 'failureLabel' }),
    REPRESENTATION: Object.freeze({ ruleId: 'WEB_LINEAGE_CARD_V1', targetRole: 'REPRESENTATION', parameterSlot: 'themeHue' })
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeJson(value) {
    return JSON.stringify(value)
      .replace(/</g, '\\u003c')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  function renderWebMicroApp(plan, adapter) {
    const metadata = {
      schema: 'axm.code.grammar-glass-constructed-micro-app-lineage.v1',
      constructionPlanSha256: plan.constructionPlanSha256,
      adapterSha256: adapter.adapterSha256,
      combinationIdentitySha256: plan.combinationIdentitySha256,
      draftStarSha256: plan.draftStarSha256,
      compositeLineageDigest: plan.compositeLineageDigest,
      atomInfluenceReceipts: plan.atomInfluenceReceipts,
      truth: {
        candidateOnly: true,
        runtimeCorrectnessClaimed: false,
        structuralAnalogyIsSemanticEquivalence: false
      }
    };
    const config = {
      constructionPlanSha256: plan.constructionPlanSha256,
      adapterSha256: adapter.adapterSha256,
      initialValue: plan.parameters.initialValue,
      step: plan.parameters.step,
      threshold: plan.parameters.threshold,
      direction: plan.parameters.direction,
      modulus: plan.parameters.modulus,
      actionLabel: plan.parameters.actionLabel,
      failureLabel: plan.parameters.failureLabel,
      energyScalePpm: plan.parameters.energyScalePpm,
      verificationMode: plan.parameters.verificationMode,
      atomCount: plan.groundedAtomCount,
      grammarCount: plan.contributingGrammarIdentities.length,
      connectionCount: plan.connectionClasses.length
    };
    const chips = plan.atomInfluenceReceipts.map(receipt => `<li title="${escapeHtml(receipt.atomId)}"><b>${escapeHtml(receipt.atomType)}</b><span>${escapeHtml(receipt.languageId)}</span></li>`).join('');
    const grammars = plan.contributingGrammarIdentities.map(value => escapeHtml(value)).join(' · ');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(adapter.containmentContract.contentSecurityPolicy)}">
  <title>Grammar Glass · Constructed Signal</title>
  <style id="axm-style">
    :root{color-scheme:dark;--h:${plan.parameters.themeHue};--tilt:${plan.parameters.themeTilt}deg;--energy:.35}
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,hsl(var(--h) 62% 18%),#05070d 62%);color:#eefaff;font:14px/1.45 Inter,system-ui,sans-serif}
    main{width:min(760px,100%);border:1px solid hsl(var(--h) 88% 70%/.35);border-radius:28px;padding:clamp(22px,5vw,48px);background:linear-gradient(145deg,#101725ee,#070b12f5);box-shadow:0 28px 90px #000a,0 0 calc(30px + 60px * var(--energy)) hsl(var(--h) 90% 60%/.16);transform:rotate(var(--tilt));transition:box-shadow .2s ease,transform .2s ease}
    .eyebrow,.meta{font:700 11px/1.2 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:hsl(var(--h) 88% 76%)}h1{margin:.55rem 0 .25rem;font-size:clamp(30px,7vw,68px);letter-spacing:-.055em}.sub{margin:0 0 28px;color:#9fb0c7}
    .signal{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;padding:22px;border-radius:20px;background:#03060b99;border:1px solid #ffffff12}.value{font:800 clamp(54px,14vw,112px)/.8 ui-monospace,monospace;letter-spacing:-.1em}.phase{text-align:right}.phase strong{display:block;font-size:18px}.phase span{color:#91a2b8}
    button{width:100%;margin:18px 0 22px;padding:15px 18px;border:0;border-radius:14px;background:hsl(var(--h) 88% 67%);color:#041015;font:900 13px ui-monospace,monospace;letter-spacing:.1em;cursor:pointer}button:focus-visible{outline:3px solid white;outline-offset:3px}button:active{transform:translateY(1px)}
    .receipt{display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid #ffffff12;font:12px ui-monospace,monospace}.pass{color:#82f5b4}.hold{color:#ffbd77}
    ul{display:flex;flex-wrap:wrap;gap:7px;padding:0;margin:18px 0 0;list-style:none}li{display:flex;gap:7px;padding:6px 9px;border:1px solid hsl(var(--h) 60% 64%/.22);border-radius:999px;background:hsl(var(--h) 35% 18%/.4);font:10px ui-monospace,monospace}li span{color:#8495aa}
    footer{margin-top:18px;color:#74859a;font:10px/1.5 ui-monospace,monospace;overflow-wrap:anywhere}@media(max-width:520px){main{transform:none}.signal{grid-template-columns:1fr}.phase{text-align:left}}
  </style>
</head>
<body>
  <main id="app" data-plan="${escapeHtml(plan.constructionPlanSha256)}">
    <div class="eyebrow">Construction Hand · deterministic candidate</div>
    <h1>Lineage Signal</h1>
    <p class="sub">${grammars}</p>
    <section class="signal" aria-live="polite"><div class="value" id="value">—</div><div class="phase"><strong id="phase">READY</strong><span id="detail">threshold ${plan.parameters.threshold}</span></div></section>
    <button id="pulse" type="button">${escapeHtml(plan.parameters.actionLabel)}</button>
    <div class="receipt"><span id="invariant">CHECKING INVARIANT</span><span>atoms ${plan.groundedAtomCount} · relations ${plan.connectionClasses.length}</span></div>
    <ul aria-label="Grounded atom lineage">${chips}</ul>
    <footer>candidate ${escapeHtml(plan.combinationIdentitySha256)} · no network · no persistence · not selected or promoted</footer>
  </main>
  <script type="application/json" id="axm-lineage">${safeJson(metadata)}</script>
  <script id="axm-app">(()=>{'use strict';
    const config=${safeJson(config)};
    const state={value:config.initialValue,ticks:0};
    const app=document.getElementById('app');
    const valueNode=document.getElementById('value');
    const phaseNode=document.getElementById('phase');
    const detailNode=document.getElementById('detail');
    const invariantNode=document.getElementById('invariant');
    const pulseNode=document.getElementById('pulse');
    const normalize=value=>Number.isSafeInteger(value)?((value%config.modulus)+config.modulus)%config.modulus:0;
    const invariant=()=>Number.isSafeInteger(state.value)&&state.value>=0&&state.value<config.modulus;
    const report=eventType=>parent.postMessage({type:eventType,constructionPlanSha256:config.constructionPlanSha256,adapterSha256:config.adapterSha256,value:state.value,ticks:state.ticks,invariantPass:invariant()},'*');
    const crash=message=>parent.postMessage({type:'AXM_CONSTRUCTION_HAND_CRASH_V1',constructionPlanSha256:config.constructionPlanSha256,adapterSha256:config.adapterSha256,message:String(message||'RUNTIME_ERROR').slice(0,200),invariantPass:false},'*');
    addEventListener('error',event=>crash(event.message),{once:true});addEventListener('unhandledrejection',event=>crash(event.reason&&event.reason.message||event.reason||'UNHANDLED_REJECTION'),{once:true});
    const render=()=>{const above=state.value>=config.threshold;const valid=invariant();valueNode.textContent=String(state.value).padStart(2,'0');phaseNode.textContent=above?'THRESHOLD MET':'BELOW THRESHOLD';detailNode.textContent='tick '+state.ticks+' · step '+(config.direction*config.step);invariantNode.textContent=valid?'INVARIANT PASS':config.failureLabel;invariantNode.className=valid?'pass':'hold';app.style.setProperty('--energy',String((config.energyScalePpm/1000000)*(0.35+state.value/config.modulus)));};
    const pulse=()=>{state.value=normalize(state.value+(config.direction*config.step));state.ticks+=1;render();report('AXM_CONSTRUCTION_HAND_STATE_V1');};
    pulseNode.addEventListener('click',pulse,{passive:true});render();report('AXM_CONSTRUCTION_HAND_READY_V1');
  })();</script>
</body>
</html>
`;
  }

  function implementationSource() {
    return {
      outputTarget: OUTPUT_TARGET,
      csp: DEFAULT_CSP,
      constructionRules: CONSTRUCTION_RULES,
      escapeHtml: escapeHtml.toString(),
      safeJson: safeJson.toString(),
      renderWebMicroApp: renderWebMicroApp.toString()
    };
  }

  return Object.freeze({
    OUTPUT_TARGET,
    DEFAULT_CSP,
    CONSTRUCTION_RULES,
    escapeHtml,
    safeJson,
    renderWebMicroApp,
    implementationSource
  });
});
