# 102-Grammar intake bridge

Status: experimental Grammar Glass viewer/intake substrate. It imports no repository automatically and grants no execution or mutation authority.

## Purpose

Grammar Glass should be able to observe richer generations of the standalone `axm-102-grammer` body without silently replacing the 102-profile universe already recorded in a Grammar Glass snapshot.

The bridge therefore treats a 102-Grammar generation as a separate, provenance-bound capability snapshot:

```text
102 Grammar generation
  -> caller-supplied capability snapshot
  -> deterministic import receipt
  -> explicit optional lens selection
  -> binding to one recorded Grammar Glass snapshot
  -> optional generation A/B comparison
```

Import is not activation. A newly imported generation does not become the default Grammar Glass source, does not mutate a cycle, does not write contact memory, does not create a Draft Star, and does not re-enter the Twister.

## Portable source contract

The accepted top-level schema is:

`axm.grammar-102.capability-snapshot.v1`

Required source binding:

- `source.repoFullName`
- exact 40-hex `source.commitSha`
- optional exact 40-hex `source.treeSha`
- exact `grammarIdentity.profileCount = 102`
- exact 64-hex `grammarIdentity.profileSnapshotSha256`
- optional list of exactly 102 unique `languageIds`

The snapshot bytes are supplied by the caller. This bridge performs no GitHub lookup, network fetch, repository clone, install, or source replacement.

Every optional capability layer has an explicit state:

- `PRESENT`
- `ABSENT`
- `UNKNOWN`

`PRESENT` requires its own SHA-256 binding. `ABSENT` and `UNKNOWN` do not mean that a language is incapable; they only describe what this particular imported generation supplied.

## Seven observer lenses

The bridge exposes seven independent lens identities:

| Lens | Source layer | Meaning |
| --- | --- | --- |
| `BASE_GRAMMAR` | `grammarIdentity` | 102 recorded grammar identities |
| `SPECIALIST_EYES` | `specialistEyes` | alternate observation/review perspectives |
| `SEMANTIC_DIRECTIONS` | `semanticKeyboards` | machine semantic keys as direction vectors |
| `CHEATCODE_INFLUENCE` | `cheatcodeInfluence` | cheatcode nodes and their influence field |
| `SOFTWARE_DIRECTIONS` | `softwareDirections` | software-purpose overlays separate from language grammar |
| `CAPABILITY_MATURITY` | `capabilityPassports` | G0-G6 capability evidence when supplied |
| `GRAMMAR_BRIDGES` | `grammarBridgeAtlas` | cross-language bridges when supplied |

The bridge does not flatten these layers into the existing 11 Grammar Glass atom types. They remain distinct observer surfaces with separate digests and provenance.

## Current-scale verification fixture

The bridge selftest intentionally exercises the current scale of the active 102-Grammar work rather than a tiny toy fixture:

- 102 grammar profiles
- 102 specialist eyes
- 102 semantic-keyboard banks
- 4,896 stable semantic keys
- 102 cheatcode meshes
- 5,100 cheatcode nodes
- 120,125 influence edges in generation A
- 29 software-direction profiles across five families and seven axes in generation A

The fixture then creates a second generation with changed digests/counts, newly supplied capability-passport and Grammar Bridge layers, and verifies deterministic A/B deltas without ranking either generation.

The G0-G6 and Grammar Bridge work currently lives in a separate 102-Grammar development lane from some of the standalone-capability/direction work. The intake schema deliberately allows those layers to remain `ABSENT` or `UNKNOWN` until a real source generation supplies them. It does not pretend that parallel branches are already one source tree.

## Import receipt

`createImportReceipt(...)` emits:

`axm.code.grammar-glass-102-import-receipt.v1`

The receipt binds:

- source repository identity
- source commit/tree
- grammar-profile snapshot digest
- digest of the complete caller-supplied capability snapshot
- each supplied layer digest and numeric metrics
- stable item references where supplied
- seven lens availability states

A receipt is itself SHA-256 bound. `verifyImportReceipt(...)` refuses a receipt whose content no longer matches its recorded digest.

The import state is always:

`IMPORTED_NOT_ACTIVATED`

## Binding to a recorded Glass

`bindToGlass(glassSnapshot, importReceipt, {lensIds})` emits:

`axm.code.grammar-glass-102-overlay-binding.v1`

It binds selected lenses to one exact recorded Grammar Glass snapshot and, when the 102-Grammar snapshot supplied all 102 language IDs, reports explicit identity overlap:

- shared identities
- identities only in the Glass snapshot
- identities only in the imported 102-Grammar generation

Identity overlap is not semantic equivalence.

Selecting a lens creates no evidence and activates no imported capability. An unavailable lens returns a typed hold instead of silently degrading to another layer.

## Generation comparison / Ghost Glass seam

`compareGenerations(primary, ghost)` emits:

`axm.code.grammar-glass-102-generation-comparison.v1`

It compares each lens independently:

- `PRESENT / ABSENT / UNKNOWN` state changes
- layer digest changes
- numeric metric deltas
- full supplied stable-item added/removed/changed sets

This is the provenance-safe seam for a later Ghost Glass visualization of “102 Grammar generation A versus generation B.”

The comparison deliberately does **not** infer:

- improvement or regression
- a winner
- a quality score
- semantic equivalence from a bridge
- authority from a G0-G6 level
- Dark Grammar becoming resolved merely because a layer changed
- causal explanation for a structural delta

Those remain separate observations or later experiments.

## Authority boundary

The bridge has authority `NONE`.

It cannot:

- fetch or update the 102-Grammar repository
- replace Grammar Glass source profiles
- mutate a Grammar Glass cycle or contact memory
- alter 102-Grammar source
- create candidates or Draft Stars
- execute software
- select a winner
- promote a layer
- auto-activate an import
- auto-re-enter the Twister
- change CANON

The recorded Grammar Glass snapshot remains authoritative for its recorded evidence. The imported 102-Grammar snapshot remains a separately bound evidence source.
