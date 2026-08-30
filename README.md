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

- `shared/code-capability-fabric/language-organs/` - Grammar Glass core, contracts, tests and bound 102-profile registry snapshot.
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

The static viewer has a smaller truthful preparation surface. It records the combination identity, replay inputs and grounded receipt digest in an append-only device-local ledger. If the loaded snapshot already contains the exact recorded formation, mirror, Draft Star and Interglass lineage, the viewer can bind it to the existing ARM / RUN ONCE controls. Otherwise it visibly stops at the missing full-cycle or Interglass adapter. “New to this ledger” is local history only and is never presented as global novelty.
