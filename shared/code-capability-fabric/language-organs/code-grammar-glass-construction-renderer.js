(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AXMGrammarGlassConstructionRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const OUTPUT_TARGET = 'SELF_CONTAINED_OFFLINE_HTML_MICRO_APP';
  const DEFAULT_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; child-src 'none'; form-action 'none'; base-uri 'none'";
  const PROGRAM_FAMILIES = Object.freeze(['LINEAGE_SIGNAL', 'ATOM_FLOW_ROUTER', 'STATE_ORBIT', 'RECEIPT_LEDGER']);
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
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  function familyFragments(plan) {
    const family = plan.programFamily;
    if (family === 'ATOM_FLOW_ROUTER') return {
      title: 'Atom Flow Router',
      subtitle: 'A bounded cursor routes through grounded grammar atoms.',
      body: `<section class="flow" id="flow" aria-live="polite">${plan.atomInfluenceReceipts.map((receipt, index) => `<div class="route" data-route="${index}"><b>${escapeHtml(receipt.atomType)}</b><span>${escapeHtml(receipt.languageId)}</span></div>`).join('')}</section><div class="readout"><strong id="primary">ROUTE 01</strong><span id="secondary">READY</span></div>`,
      css: `.flow{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:9px}.route{min-height:84px;padding:14px;border:1px solid #ffffff14;border-radius:13px;background:#03060b99;display:grid;align-content:space-between;transition:.2s}.route span{color:#8fa2b8;font:11px ui-monospace,monospace}.route.active{border-color:hsl(var(--h) 90% 70%);background:hsl(var(--h) 50% 18%/.75);transform:translateY(-4px)}.readout{display:flex;justify-content:space-between;margin-top:16px;font:12px ui-monospace,monospace;color:#9fb0c7}`,
      runtime: `const routes=[...document.querySelectorAll('[data-route]')];const primary=document.getElementById('primary');const secondary=document.getElementById('secondary');const state={cursor:config.initialValue%routes.length,ticks:0};const invariant=()=>Number.isSafeInteger(state.cursor)&&state.cursor>=0&&state.cursor<routes.length;const snapshot=()=>({value:state.cursor,ticks:state.ticks});const render=()=>{routes.forEach((node,index)=>node.classList.toggle('active',index===state.cursor));primary.textContent='ROUTE '+String(state.cursor+1).padStart(2,'0');secondary.textContent=routes[state.cursor].textContent.trim().replace(/\\s+/g,' · ');setInvariant(invariant());};const advance=()=>{state.cursor=((state.cursor+config.direction*config.step)%routes.length+routes.length)%routes.length;state.ticks+=1;render();report('AXM_CONSTRUCTION_HAND_STATE_V1',snapshot());};`
    };
    if (family === 'STATE_ORBIT') return {
      title: 'State Orbit',
      subtitle: 'A finite-state machine advances around an explicit four-phase orbit.',
      body: `<section class="orbit" aria-live="polite"><div class="ring"><i data-phase="0">GATHER</i><i data-phase="1">BIND</i><i data-phase="2">SHAPE</i><i data-phase="3">VERIFY</i><div id="primary">GATHER</div></div><p id="secondary">transition 0</p></section>`,
      css: `.orbit{display:grid;place-items:center;padding:12px}.ring{position:relative;width:min(390px,75vw);aspect-ratio:1;border:1px solid hsl(var(--h) 80% 68%/.35);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#111b2a 0 28%,transparent 29%);box-shadow:inset 0 0 70px #0008}.ring i{position:absolute;font:700 10px ui-monospace,monospace;color:#71849c;font-style:normal}.ring i:nth-child(1){top:7%}.ring i:nth-child(2){right:3%;top:49%}.ring i:nth-child(3){bottom:7%}.ring i:nth-child(4){left:3%;top:49%}.ring i.active{color:hsl(var(--h) 92% 75%);text-shadow:0 0 15px currentColor}.ring div{font:900 clamp(22px,5vw,42px) ui-monospace,monospace}.orbit p{color:#8fa2b8;font:11px ui-monospace,monospace}`,
      runtime: `const phases=['GATHER','BIND','SHAPE','VERIFY'];const phaseNodes=[...document.querySelectorAll('[data-phase]')];const primary=document.getElementById('primary');const secondary=document.getElementById('secondary');const state={phase:config.initialValue%phases.length,ticks:0};const invariant=()=>Number.isSafeInteger(state.phase)&&state.phase>=0&&state.phase<phases.length;const snapshot=()=>({value:state.phase,ticks:state.ticks});const render=()=>{phaseNodes.forEach((node,index)=>node.classList.toggle('active',index===state.phase));primary.textContent=phases[state.phase];secondary.textContent='transition '+state.ticks+' · stride '+config.step;setInvariant(invariant());};const advance=()=>{state.phase=((state.phase+config.direction*(1+config.step%3))%phases.length+phases.length)%phases.length;state.ticks+=1;render();report('AXM_CONSTRUCTION_HAND_STATE_V1',snapshot());};`
    };
    if (family === 'RECEIPT_LEDGER') return {
      title: 'Receipt Ledger',
      subtitle: 'An append-only in-memory ledger retains a bounded event window.',
      body: `<section class="ledger" aria-live="polite"><header><b>LOCAL EVENT WINDOW</b><span id="secondary">0 / 6</span></header><ol id="entries"></ol><div id="primary">EMPTY LEDGER</div></section>`,
      css: `.ledger{border:1px solid #ffffff16;border-radius:18px;background:#03060b99;overflow:hidden}.ledger header{display:flex;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #ffffff12;color:#8fa2b8;font:10px ui-monospace,monospace}.ledger ol{min-height:230px;margin:0;padding:12px 16px 12px 46px}.ledger li{padding:7px 5px;border-bottom:1px solid #ffffff0d;font:12px ui-monospace,monospace;color:hsl(var(--h) 90% 78%)}.ledger>div{padding:13px 16px;border-top:1px solid #ffffff12;font:800 13px ui-monospace,monospace}`,
      runtime: `const limit=6;const entries=document.getElementById('entries');const primary=document.getElementById('primary');const secondary=document.getElementById('secondary');const state={entries:[],ticks:0};const invariant=()=>Array.isArray(state.entries)&&state.entries.length<=limit&&state.entries.every(Number.isSafeInteger);const snapshot=()=>({value:state.entries.length,ticks:state.ticks});const render=()=>{entries.replaceChildren(...state.entries.map((value,index)=>{const node=document.createElement('li');node.textContent='receipt '+String(index+1).padStart(2,'0')+' · '+String(value).padStart(2,'0');return node;}));primary.textContent=state.entries.length?'LATEST '+String(state.entries.at(-1)).padStart(2,'0'):'EMPTY LEDGER';secondary.textContent=state.entries.length+' / '+limit;setInvariant(invariant());};const advance=()=>{const value=((config.initialValue+state.ticks*config.direction*config.step)%config.modulus+config.modulus)%config.modulus;state.entries=[...state.entries,value].slice(-limit);state.ticks+=1;render();report('AXM_CONSTRUCTION_HAND_STATE_V1',snapshot());};`
    };
    return {
      title: 'Lineage Signal',
      subtitle: 'A bounded numeric register pulses across an explicit threshold.',
      body: `<section class="signal" aria-live="polite"><div class="value" id="primary">—</div><div class="phase"><strong id="secondary">READY</strong><span>threshold ${plan.parameters.threshold}</span></div></section>`,
      css: `.signal{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;padding:22px;border-radius:20px;background:#03060b99;border:1px solid #ffffff12}.value{font:800 clamp(54px,14vw,112px)/.8 ui-monospace,monospace;letter-spacing:-.1em}.phase{text-align:right}.phase strong{display:block;font-size:18px}.phase span{color:#91a2b8}`,
      runtime: `const primary=document.getElementById('primary');const secondary=document.getElementById('secondary');const state={value:config.initialValue,ticks:0};const normalize=value=>Number.isSafeInteger(value)?((value%config.modulus)+config.modulus)%config.modulus:0;const invariant=()=>Number.isSafeInteger(state.value)&&state.value>=0&&state.value<config.modulus;const snapshot=()=>({value:state.value,ticks:state.ticks});const render=()=>{const above=state.value>=config.threshold;primary.textContent=String(state.value).padStart(2,'0');secondary.textContent=above?'THRESHOLD MET':'BELOW THRESHOLD';app.style.setProperty('--energy',String((config.energyScalePpm/1000000)*(0.35+state.value/config.modulus)));setInvariant(invariant());};const advance=()=>{state.value=normalize(state.value+(config.direction*config.step));state.ticks+=1;render();report('AXM_CONSTRUCTION_HAND_STATE_V1',snapshot());};`
    };
  }

  function renderWebMicroApp(plan, adapter) {
    if (!PROGRAM_FAMILIES.includes(plan.programFamily)) throw new Error('VALID_PROGRAM_FAMILY_REQUIRED');
    const family = familyFragments(plan);
    const metadata = {
      schema: 'axm.code.grammar-glass-constructed-micro-app-lineage.v1',
      constructionPlanSha256: plan.constructionPlanSha256,
      adapterSha256: adapter.adapterSha256,
      programFamily: plan.programFamily,
      programShapeSha256: plan.programShapeSha256,
      combinationIdentitySha256: plan.combinationIdentitySha256,
      draftStarSha256: plan.draftStarSha256,
      compositeLineageDigest: plan.compositeLineageDigest,
      atomInfluenceReceipts: plan.atomInfluenceReceipts,
      truth: { candidateOnly: true, runtimeCorrectnessClaimed: false, structuralAnalogyIsSemanticEquivalence: false }
    };
    const config = {
      constructionPlanSha256: plan.constructionPlanSha256,
      adapterSha256: adapter.adapterSha256,
      programFamily: plan.programFamily,
      initialValue: plan.parameters.initialValue,
      step: plan.parameters.step,
      threshold: plan.parameters.threshold,
      direction: plan.parameters.direction,
      modulus: plan.parameters.modulus,
      failureLabel: plan.parameters.failureLabel,
      energyScalePpm: plan.parameters.energyScalePpm
    };
    const chips = plan.atomInfluenceReceipts.map(receipt => `<li title="${escapeHtml(receipt.atomId)}"><b>${escapeHtml(receipt.atomType)}</b><span>${escapeHtml(receipt.languageId)}</span></li>`).join('');
    const grammars = plan.contributingGrammarIdentities.map(value => escapeHtml(value)).join(' · ');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(adapter.containmentContract.contentSecurityPolicy)}">
  <title>Grammar Glass · ${escapeHtml(family.title)}</title>
  <style id="axm-style">
    :root{color-scheme:dark;--h:${plan.parameters.themeHue};--energy:.35}
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,hsl(var(--h) 62% 18%),#05070d 62%);color:#eefaff;font:14px/1.45 Inter,system-ui,sans-serif}
    main{width:min(760px,100%);border:1px solid hsl(var(--h) 88% 70%/.35);border-radius:28px;padding:clamp(22px,5vw,48px);background:linear-gradient(145deg,#101725ee,#070b12f5);box-shadow:0 28px 90px #000a,0 0 calc(30px + 60px * var(--energy)) hsl(var(--h) 90% 60%/.16);transition:box-shadow .2s ease}
    .eyebrow{font:700 11px/1.2 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:hsl(var(--h) 88% 76%)}h1{margin:.55rem 0 .25rem;font-size:clamp(30px,7vw,68px);letter-spacing:-.055em}.sub{margin:0 0 28px;color:#9fb0c7}.architecture{margin:-18px 0 24px;color:#71849c;font:11px ui-monospace,monospace}
    button{width:100%;margin:18px 0 22px;padding:15px 18px;border:0;border-radius:14px;background:hsl(var(--h) 88% 67%);color:#041015;font:900 13px ui-monospace,monospace;letter-spacing:.1em;cursor:pointer}button:focus-visible{outline:3px solid white;outline-offset:3px}button:active{transform:translateY(1px)}
    .receipt{display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid #ffffff12;font:12px ui-monospace,monospace}.pass{color:#82f5b4}.hold{color:#ffbd77}
    .lineage{display:flex;flex-wrap:wrap;gap:7px;padding:0;margin:18px 0 0;list-style:none}.lineage li{display:flex;gap:7px;padding:6px 9px;border:1px solid hsl(var(--h) 60% 64%/.22);border-radius:999px;background:hsl(var(--h) 35% 18%/.4);font:10px ui-monospace,monospace}.lineage li span{color:#8495aa}
    footer{margin-top:18px;color:#74859a;font:10px/1.5 ui-monospace,monospace;overflow-wrap:anywhere}${family.css}@media(max-width:520px){.signal{grid-template-columns:1fr}.phase{text-align:left}}
  </style>
</head>
<body>
  <main id="app" data-plan="${escapeHtml(plan.constructionPlanSha256)}" data-program-family="${escapeHtml(plan.programFamily)}">
    <div class="eyebrow">Construction Hand · ${escapeHtml(plan.programFamily.replaceAll('_', ' '))}</div>
    <h1>${escapeHtml(family.title)}</h1>
    <p class="sub">${grammars}</p><p class="architecture">${escapeHtml(family.subtitle)}</p>
    ${family.body}
    <button id="advance" type="button">${escapeHtml(plan.parameters.actionLabel)}</button>
    <div class="receipt"><span id="invariant">CHECKING INVARIANT</span><span>atoms ${plan.groundedAtomCount} · relations ${plan.connectionClasses.length}</span></div>
    <ul class="lineage" aria-label="Grounded atom lineage">${chips}</ul>
    <footer>family ${escapeHtml(plan.programFamily)} · candidate ${escapeHtml(plan.combinationIdentitySha256)} · no network · no persistence · not selected or promoted</footer>
  </main>
  <script type="application/json" id="axm-lineage">${safeJson(metadata)}</script>
  <script id="axm-app">(()=>{'use strict';
    const config=${safeJson(config)};const app=document.getElementById('app');const invariantNode=document.getElementById('invariant');const advanceNode=document.getElementById('advance');
    const setInvariant=pass=>{invariantNode.textContent=pass?'INVARIANT PASS':config.failureLabel;invariantNode.className=pass?'pass':'hold';};
    const report=(eventType,payload)=>parent.postMessage({type:eventType,constructionPlanSha256:config.constructionPlanSha256,adapterSha256:config.adapterSha256,programFamily:config.programFamily,...payload,invariantPass:invariant()},'*');
    const crash=message=>parent.postMessage({type:'AXM_CONSTRUCTION_HAND_CRASH_V1',constructionPlanSha256:config.constructionPlanSha256,adapterSha256:config.adapterSha256,programFamily:config.programFamily,message:String(message||'RUNTIME_ERROR').slice(0,200),invariantPass:false},'*');
    addEventListener('error',event=>crash(event.message),{once:true});addEventListener('unhandledrejection',event=>crash(event.reason&&event.reason.message||event.reason||'UNHANDLED_REJECTION'),{once:true});
    ${family.runtime}
    advanceNode.addEventListener('click',advance,{passive:true});render();report('AXM_CONSTRUCTION_HAND_READY_V1',snapshot());
  })();</script>
</body>
</html>
`;
  }

  function implementationSource() {
    return {
      outputTarget: OUTPUT_TARGET,
      csp: DEFAULT_CSP,
      programFamilies: PROGRAM_FAMILIES,
      constructionRules: CONSTRUCTION_RULES,
      escapeHtml: escapeHtml.toString(),
      safeJson: safeJson.toString(),
      familyFragments: familyFragments.toString(),
      renderWebMicroApp: renderWebMicroApp.toString()
    };
  }

  return Object.freeze({ OUTPUT_TARGET, DEFAULT_CSP, PROGRAM_FAMILIES, CONSTRUCTION_RULES, escapeHtml, safeJson, familyFragments, renderWebMicroApp, implementationSource });
});
