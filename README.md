# AXM Grammar Glass

Standalone recovery of the current merged Grammar Glass / Code Twister implementation.

This repository contains the actual source code, browser viewer, contracts, tests, live 102-profile grammar snapshot, organ registry data, and the bounded sandbox dependency needed by the current Interglass lane. It does not depend on a clone script or a source-code redirect to operate.

## Current recovered source

- Source repository: `mike-axiom-mir/axm-collaboration-platform`
- Grammar Glass package lineage: PR #61 merged at `2961d42f96ddc6bdb082415e0714a44bcbd61535`
- Latest overlay: PR #74 open-discovery invariant
- Exact recovered head: `d14ee2e89e994d16ffcdcd5cfcd7fc85f73b69c3`
- Base exploration mode: `OPEN_DISCOVERY`
- Snapshot contract: `1.4.0`
- Live grammar profiles: `102`
- Typed structural atoms in the verified fixture: `1122`

## Layout

- `shared/code-capability-fabric/language-organs/` - Grammar Glass core, contracts, tests, Construction Hand renderer and bound 102-profile registry snapshot.
- `tools/grammar-glass/` - DRAFTSKY viewer, StarZoom, vessel view, Interglass browser executor and execution-history views.
- `SOURCE_PROVENANCE.md` - exact recovery boundary and truth notes.

## Verify locally

Requires Node.js 20+ and Python 3.12+.

```bash
npm test
```

Generate a replayable viewer snapshot:

```bash
npm run snapshot > grammar-glass-snapshot.json
```

Then open `tools/grammar-glass/index.html` and load the generated snapshot.

## Authority boundary

Grammar Glass remains an observation, exploration and bounded candidate-forming system. Open discovery does not require a target, benchmark, fitness function or winner. The Draft Mirror does not control the cycle. Draft Stars are receipts rather than quality votes. Automatic re-entry, selection, promotion, merge and CANON authority remain absent.

The Discovery Kiln now connects an explicit seeded playground combination to the existing candidate organs. With the full recorded cycle and catalog available, it deterministically grounds at most twelve real atoms while representing every selected grammar, then reuses the existing formation, Reactive Draft Mirror, immutable Draft Star, inert production packet and Interglass request path. Supplying no executor produces `HELD_ADAPTER_REQUIRED`; supplying the existing browser executor produces a request that is ready for a separate explicit arm, not an execution.

Construction Hand v1 is the first bounded source-producing adapter on that path. It binds the exact Kiln, Draft Star and inert packet lineage, gives every grounded universal atom an explicit structural influence receipt, and deterministically renders a self-contained offline `index.html` containing real HTML, CSS and JavaScript. The same candidate, direction and adapter reproduce identical UTF-8 bytes. Unsupported atom roles stop at `HELD_CONSTRUCTION_RULE_REQUIRED` instead of guessing a translation.

Before a constructed candidate can become sandbox-ready, the adapter replays the renderer byte-for-byte, checks file digests, bounded HTML/CSS shape, JavaScript syntax, lineage metadata, a default-deny CSP, external-resource absence and disallowed runtime APIs. This is static verification, not runtime correctness. The durable request contains digests only; exact source is carried in a separate transient launch envelope for an explicit one-run opaque-origin Interglass browser sandbox. No construction, verification or request selects, executes, promotes or canonizes the candidate.

The static viewer records the combination identity, replay inputs and grounded receipt digest in an append-only device-local ledger. If the snapshot contains exact recorded Interglass lineage, the viewer can bind the existing arm/run controls. The generated snapshot also carries one source-free Construction Hand bundle for its deterministic first roll. That exact combination alone can replay the shared renderer, compare the resulting bytes with precomputed artifact digests, show the source as inert text, then require separate **ARM SOURCE** and **RUN SOURCE ONCE** actions in an opaque-origin iframe. The returned PASS/FAIL/CRASH/TIMEOUT receipt is bound to the plan, artifact, file and executor digests. Unmatched rolls still stop visibly at the missing adapter. “New to this ledger” is local history only and is never presented as global novelty.
