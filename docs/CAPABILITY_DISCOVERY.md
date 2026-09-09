# Public Capability Discovery Contract

Grammar Glass contains executable, deterministic capabilities that are useful outside this repository. This lane exposes a small, explicit subset through the shared AXM Discovery Buddy registry format without turning Grammar Glass into a central dependency.

## Exported capabilities

The generated registry currently exposes two source-backed contracts:

- `axm.code.grammar-glass-discovery-kiln-contract.v1`
- `axm.code.grammar-glass-construction-hand-contract.v1`

Both declarations are generated from the existing contract JSON plus its matching implementation module. The generator requires the source contract to remain `TEST`, retain `authority: "NONE"`, keep its declared public interfaces, and retain a CommonJS implementation surface. Drift fails the committed-registry check instead of silently changing the public claim.

The registry is intentionally narrower than the whole repository. Adding a new Grammar Glass module does not automatically make it public-discoverable; it must be deliberately added to the generator's curated source list.

## Truth boundary

A discovery declaration means only that the named contract and implementation exist at the exact source state captured by `registry/public-capabilities.receipt.json`.

It does **not** mean:

- runtime behavior has been proven on every consumer;
- the capability is release-ready or CANON;
- another repository should depend on Grammar Glass;
- execution, merge, promotion, or authority has been granted.

The original Grammar Glass contract remains the authority for its own behavior and constraints.

## Deterministic regeneration

Run:

```sh
node tools/capability-discovery/generate-registry.mjs
node tools/capability-discovery/generate-registry.mjs --check
node --test tools/capability-discovery/test-registry.mjs
```

The receipt binds each source contract and implementation to its Git blob identity and binds the registry to SHA-256. CI also runs the existing Grammar Glass test suite and checks the committed registry through a pinned Discovery Buddy consumer.

## Pattern provenance

The generator adapts the deterministic generated-registry pattern introduced in `mike-axiom-mir/axm-local-game-hub` on branch `automation/capability-weaver-hub-registry-v0.1`, specifically `tools/generate-capability-registry.cjs`.

The idea is reused with attribution; the implementation here is adapted for Grammar Glass contract/module pairs and creates no runtime dependency on Local Game Hub or Discovery Buddy.
