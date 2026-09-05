# Grammar Glass State Ripple Fabric v1

State Ripple is a standalone deterministic sparse-recomputation layer for Grammar Glass.

Its narrow question is:

> When a large declared state program changes in one place, can Grammar Glass recompute only the causally affected work, retain exact unchanged work, and still prove that the sparse result matches a full reference recomputation?

The answer supported by this lane is **yes for the bounded deterministic fabric and fixtures tested here**. It is not a universal performance or correctness claim.

## Position in Grammar Glass

State Ripple extends the existing direction rather than replacing it:

```text
Grammar Glass discovery
  -> Discovery Kiln
  -> Evidence-First Discovery Forge
  -> bounded Construction Program
  -> optional State Ripple Fabric
  -> sparse candidate update
  -> full shadow recomputation
  -> equivalence receipt
```

`fromConstructionProgram(...)` can adapt an existing valid Grammar Glass Construction Program into a State Ripple Fabric. The adapter remains inside this repository and adds no runtime dependency on another AXM project.

## Node contract

Every State Ripple node declares:

- `reads`
- `writes`
- explicit `dependsOn`
- `effects`
- bounded deterministic `operations`

The v1 operation vocabulary is:

- `SET`
- `INCREMENT`
- `TRANSITION`
- `ASSERT_EQ`
- `EMIT_SIGNAL`
- `COPY`
- `SUM`

The fabric rejects undeclared reads or writes, dependency cycles, unknown dependencies, prototype-path tricks, unknown operations, and ambiguous overlapping writes that lack an explicit ordering relation.

The v1 ceilings are 4,096 nodes and 32,768 operations per fabric.

## Dependency graph

The graph contains two kinds of edge:

1. explicit declared dependencies;
2. deterministic earlier-writer to later-reader edges derived from overlapping declared state paths.

The graph is not inferred from natural language or runtime guesswork.

Nodes whose dependency behavior cannot safely be represented may be declared `opaque`. An opaque node is never silently reused from cache.

## Full baseline

`runAll(...)` executes every node in topological order and creates a digest-bound baseline.

The baseline contains:

- digests for declared watched input paths;
- one exact per-node input fingerprint;
- one per-node output digest;
- the node's bounded write patch;
- emitted signals;
- final-state digest.

It does not treat the cache as learned weights, training, semantic truth, or authority.

## Sparse update

`sparseUpdate(...)` follows this sequence:

1. digest the currently declared watched read paths;
2. find which watched paths changed;
3. create a conservative wake set from changed readers, opaque nodes, and graph descendants;
4. check the caller's global wake budget **before execution**;
5. walk the deterministic node order;
6. reuse an old cache entry only when the exact current input fingerprint matches it;
7. execute only nodes whose exact cached input no longer matches or whose opacity forbids reuse;
8. publish a new baseline only after the complete staged update succeeds.

If a node fails, the staged sparse future is discarded. No partial next baseline is published.

## Retained truth identity

When a node is safely reused, State Ripple retains the **same immutable cache-entry object** rather than reconstructing an equivalent record.

That makes a useful distinction observable:

```text
unchanged truth -> retained
changed truth   -> reconstructed
opaque truth    -> rechecked
```

Object identity is an implementation receipt for retained cached work. It is not a claim that JavaScript object identity itself is semantic truth.

## Global wake budget

A locally valid wake-up can still be globally undesirable.

State Ripple therefore checks the size of the conservative wake closure against a caller-declared `wakeBudget` before doing sparse work.

If the closure exceeds the budget, the result is:

`STATE_RIPPLE_HELD_GLOBAL_WAKE_BUDGET`

The hold executes zero nodes and publishes no partial state.

A budget hold is not failure proof, and fitting under a budget is not permission, admission, promotion, or correctness.

## Shadow equivalence gate

`shadowVerify(...)` computes both:

- the sparse candidate future;
- a full reference future that executes every node.

The gate compares:

- final state digest;
- every node output digest;
- realized effects;
- missing required effects.

Only an exact match yields:

`STATE_RIPPLE_SPARSE_FULL_EQUIVALENCE_PASS`

That receipt is bounded to the exact fabric and exact input used by the proof. It does not prove every future fabric or mutation.

## Measured fixture

The focused v1 stress fixture contains:

- 100 independent clusters;
- 10 chained nodes per cluster;
- one aggregate node;
- **1,001 total nodes**.

A mutation to one cluster produced:

- full reference executions: **1,001**;
- sparse executions: **11**;
- exact retained cache entries: **990**;
- fixture reuse fraction: **98.901%**.

The selftest then performs **64 sequential deterministic mutations**. Each mutation runs a sparse update plus a full shadow recomputation and requires exact equivalence. The fixture recorded 704 total sparse node executions across those 64 updates.

These numbers are controlled software-fixture observations. They do **not** establish a universal 98.901% compute reduction, wall-clock speedup, energy saving, hardware advantage, or large-world scaling result.

## Opaque dependency behavior

The fixture also marks one root node opaque.

With no external input change:

- the conservative wake closure contains 11 nodes;
- the opaque root executes;
- its exact output remains unchanged;
- the ten descendants can therefore reuse their exact prior input/output cache;
- the full shadow still has to agree.

This preserves uncertainty without forcing every uncertain dependency to invalidate the whole world forever.

## Authority and truth boundary

State Ripple does not:

- execute arbitrary source code;
- access network, filesystem, processes, or DOM;
- infer hidden dependencies;
- turn cache into evidence of real-world correctness;
- claim a sparse result is proven without the appropriate reference evidence;
- rank or select discoveries;
- admit or promote candidates;
- merge branches;
- change CANON.

Capability remains separate from authority.
