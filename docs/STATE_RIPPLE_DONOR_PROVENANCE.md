# State Ripple v1 donor provenance

State Ripple is fresh standalone Grammar Glass source. The repositories below were used as **concept donors only**. No donor repository is imported, cloned, fetched, or required at runtime, and no donor source file was copied byte-for-byte into this lane.

The connected AXM account census on 2026-09-05 contained 26 repositories. Three were private. Their names and implementation details are deliberately omitted from this public donor receipt.

## Public donor concepts

### AXM State Research

Source: `mike-axiom-mir/axm-state-research`, PR #8, observed head `7a02f8d833bfcd3893262b1c9778aed6d1bb7a07`.

Concept adapted:

- sparse routing should preserve explicit unresolved/opaque regions instead of fabricating a resolved answer;
- a changed opaque dependency can be guarded while independent work continues;
- sparse behavior needs a trusted reference/oracle boundary before broader claims are made.

State Ripple adaptation:

- `opaqueNodeIds` are never silently reused;
- uncertainty can wake a bounded dependency closure;
- the full shadow path remains the comparison authority for the tested state fabric.

### AXM Ignition Fabric

Source: `mike-axiom-mir/axm-ignition-fabric`, PR #3, observed head `f83c277c2923b0d47350c49d38b63ba85584ff12`.

Concept adapted:

- do not reconstruct exact retained truth merely because the surrounding active set changes;
- distinguish built, retained, and evicted work;
- preserve exact retained record/storage identity when possible.

State Ripple adaptation:

- a safely reusable node keeps the exact immutable cache-entry object;
- changed nodes receive new cache entries;
- the selftest requires object identity for retained cache and different identity for changed cache.

### AXM Anomaly Garden

Source: `mike-axiom-mir/axm-anomaly-garden`, PR #2, observed head `5faa83cd2b0a2e6e44e484d5e01c1af2a91a6fa6`.

Concept adapted:

- a transition can be locally valid while still violating a global shared-capacity or viability rule.

State Ripple adaptation:

- the deterministic wake closure may be locally valid;
- a separate global `wakeBudget` may still hold the update before any node executes;
- fitting under that budget is not authority or correctness.

### AXM Floorborn

Source: `mike-axiom-mir/axm-floor-born`, PR #2, observed head `0d932aa3d8d641b40db3756e93951e7ccfe26938`.

Concept adapted:

- internal reasoning/work structure and externally permitted action bandwidth are separate constraints;
- over-budget external action should be rejected before world mutation.

State Ripple adaptation:

- wake planning is separate from committed state mutation;
- over-budget wake plans publish no partial future.

### AXM EchoWorld

Source: `mike-axiom-mir/axm-EchoWorld`, PR #2, observed head `7b588625989fe1036c297587cb1bfe098b5dbe1c`.

Concept adapted:

- persistence/reuse requires explicit checkpoint identity and operational-state evidence;
- stale or mismatched state lineage should fail closed instead of silently continuing.

State Ripple adaptation:

- a baseline is bound to the exact fabric and graph digests;
- a baseline from another fabric is rejected;
- failed staged updates do not overwrite the prior good baseline.

### AXM FrameState

Source: `mike-axiom-mir/axm-framestate`, PR #2, observed head `5d46363fb30bf5d30198b8cdec473d3bb9ba6287`.

Concept adapted:

- standalone deterministic machinery can use digest-bound queues/receipts while leaving external codec/runtime boundaries explicit;
- repeatability and artifact identity are narrower claims than universal output quality.

State Ripple adaptation:

- node work, cache entries, baselines, sparse updates, and shadow comparisons are digest-bound;
- deterministic equivalence is kept separate from quality and performance claims.

## Grammar Glass native roots

State Ripple also directly extends already-merged Grammar Glass mechanisms:

- bounded Construction Program declarations and transient state execution;
- Evidence-First Discovery Forge separation of evidence layers;
- no automatic selection, promotion, merge, or CANON authority.

## Source-integrity boundary

The useful material from donors was architectural influence, not missing library code. The implementation was therefore written as Grammar Glass-native standalone code rather than creating runtime links between AXM repositories.
