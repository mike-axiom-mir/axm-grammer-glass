# Evidence-First Discovery Forge v1

## Purpose

Grammar Glass already has two strong joints:

`Discovery Kiln -> Construction Hand`

The Kiln grounds an exploratory combination in recorded Grammar Glass state. Construction Hand binds a deterministic construction plan, exact artifact digests, static verification and an explicit sandbox request.

This layer does not replace either system. It adds a truth spine around them:

`preparation -> layered evidence -> typed gap compilation -> optional bounded construction program -> explicit preview`

The aim is to let Grammar Glass become more adventurous without becoming more willing to confuse interesting, buildable, executable, observed and verified states.

## 1. Layered evidence body

`evidence-body-core.js` keeps five evidence layers separate:

- `DECLARED`
- `SOURCE`
- `STATIC_VERIFICATION`
- `RUNTIME`
- `VISUAL_OBSERVATION`

Evidence is append-only. A later contradiction or resolution points back to prior evidence instead of overwriting it.

Each record is bound to:

- the exact discovery preparation digest;
- the exact source-binding digest;
- one evidence layer;
- one bounded claim code;
- one observed digest when available.

If the source binding changes, old evidence becomes `STALE` for current proof. It remains in history.

There is deliberately no single confidence score or global green light. A static PASS cannot silently become a runtime PASS. A runtime PASS cannot silently become a visual-quality PASS.

## 2. Discovery gap compiler

`discovery-gap-compiler-core.js` translates existing truthful Kiln holds into typed gaps. Current mappings include:

- source/atom grounding;
- formation adapter;
- lineage adapter;
- construction adapter;
- sandbox-request adapter;
- static verification;
- runtime evidence;
- visual evidence;
- optional bounded-program contract.

A gap may emit one bounded route of at most three producer/verifier/observer steps.

The route is a proposal only. It does not synthesize an adapter, execute code, arm a sandbox, promote a candidate, merge a branch or change CANON.

Missing path means only that the current path is missing or incomplete. It is not proof that the target is fundamentally impossible.

## 3. Bounded Construction Program

`construction-program-core.js` adds a tiny declarative state program for future Construction Hand expansion.

It is data, not arbitrary JavaScript. The only current operations are:

- `SET`
- `INCREMENT`
- `TRANSITION`
- `ASSERT_EQ`
- `EMIT_SIGNAL`

Every module must declare:

- reads;
- writes;
- dependencies;
- effects;
- operations.

The validator rejects:

- unknown operations;
- undeclared reads;
- undeclared writes;
- undeclared effects;
- missing dependencies;
- dependency cycles;
- ambiguous same-path writes without dependency ordering;
- unsafe prototype-path segments;
- module or operation counts above the hard ceilings.

The explicit preview interpreter operates only on transient JSON-compatible state. It has no filesystem, network, process, DOM, dynamic import or `eval` surface.

Module updates are atomic: a failed module does not commit its staged state. Previously committed modules remain visible in the preview receipt.

Required effects count only when emitted by a module that actually committed a state change. Labels alone cannot impersonate a causal result.

This is an in-process deterministic contract, not an operating-system sandbox.

## 4. Discovery Forge composition

`discovery-forge-core.js` composes the new layers with the existing Kiln and Construction Hand.

Inspection:

1. accepts an existing Kiln preparation or asks the Kiln to create one;
2. derives exact source/static/runtime evidence only when the existing preparation supports it;
3. never invents live visual evidence;
4. assesses currentness against the exact preparation and source binding;
5. compiles current gaps;
6. optionally binds a validated Construction Program to the exact preparation and construction-plan digest;
7. emits one non-authoritative forge receipt.

Inspection never executes the program.

`runProgramPreview(...)` is a separate explicit call. It can run only the exact program digest already bound into the forge receipt, and it still does not run the constructed HTML artifact.

## Existing path stays valid

The new program layer is optional. If the current Construction Hand already has a valid exact plan, absence of a Construction Program does not downgrade or block that existing path.

Likewise:

- missing runtime evidence does not erase static verification;
- missing visual evidence does not erase runtime evidence;
- a visual observation would not prove semantic correctness;
- a runtime PASS would not prove visual quality.

## Standalone boundary

No donor repository is imported, cloned, fetched or required at runtime.

The implementation in this repository is Grammar-Glass-native source. Donor projects influenced contract ideas only. See `AXM_DONOR_AUDIT_2026-09-05.md` and `DONOR_PROVENANCE.md`.

## Verification

Focused selftest coverage includes:

- append-only evidence;
- later resolution without history rewrite;
- stale evidence after source movement;
- deterministic program identity;
- declared read/write enforcement;
- dependency-cycle rejection;
- ambiguous-write rejection;
- unknown-operation rejection;
- atomic transient execution;
- committed-effect accounting;
- exact program-to-preparation binding;
- existing Construction Hand readiness preservation;
- visual evidence remaining absent rather than inferred;
- explicit preview separation;
- exact Kiln hold to typed gap compilation;
- maximum three-step gap routes.

The focused selftest does not replace the repository-wide `npm test` gate or live browser verification.
