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
