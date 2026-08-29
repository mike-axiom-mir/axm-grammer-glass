# AXM Grammar Glass / Code Twister

This is the standalone recovery of the current Grammar Glass body from the AXM collaboration-platform lineage.

The repository preserves the actual source bytes, tests, viewer, 102-profile registry snapshot, direct Interglass sandbox dependency, and provenance needed to continue Grammar Glass development without depending on the original repository at runtime.

See `SOURCE_PROVENANCE.md` and `RECOVERY_RECEIPT.md` for the exact recovery boundary.

## Current direction

- seeded, replayable cross-grammar structural field
- Reactive Draft Mirror beside the cycle
- immutable Draft Stars and append-only constellation history
- explicit Interglass execution lane with authority `NONE` until separately authorized
- `OPEN_DISCOVERY` as a first-class base invariant: no desired outcome, fitness function, benchmark, ranking, or winner is required to run the base cycle
- playground/viewer evolution remains observation-only and does not silently mutate recorded evidence

## Standalone verification

```sh
npm test
```

Generate a deterministic recorded snapshot:

```sh
npm run snapshot > /tmp/grammar-glass-snapshot.json
```

Open `tools/grammar-glass/index.html` locally and load the generated JSON.

## Authority boundary

This repository does not claim software/quantum entanglement, consciousness, autonomous life, executable correctness from visual formations, physical dark-matter equivalence, or authority from a visualization. Capability remains separate from authority.
