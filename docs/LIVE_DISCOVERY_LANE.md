# Grammar Glass live-discovery lane

This is the single pull-request lane for the current Codex instance.

## Baseline

- parent lane: PR #3, `sol/grammar-glass-playground-v1`
- exact parent head at lane creation: `4a837c600eaf066786276012b0766ba202dc55cc`
- parent status at lane creation: open and not merged

This lane depends on that exact playground/evolution baseline. It does not claim
that PR #3 is already part of `main`, and it must not duplicate PR #3's complete
change set in review.

## Working purpose

Play with the rendered Grammar Glass as a real user, observe one named seam at a
time, and make bounded improvements supported by source tests and live visual
evidence. Related follow-up improvements from this Codex instance stay in this
lane until Mike intentionally finishes or merges it.

## Preserved boundaries

- extend the active Grammar Glass direction; do not rebuild it from scratch
- preserve snapshot provenance and deterministic replay
- keep visual interpretation separate from recorded evidence
- do not infer correctness, quality, novelty, semantic equivalence, or causality
  from visual proximity or motion
- do not add automatic selection, re-entry, promotion, merge, or CANON authority
- do not mutate PR #3's branch

## Evidence loop

`grounded snapshot -> stable visual baseline -> one bounded interaction -> named seam -> smallest coherent change -> source tests -> repeated visual verification`

## Live observation 1 — full snapshot load seam

- target: PR #3 viewer at exact head `4a837c600eaf066786276012b0766ba202dc55cc`
- grounded input: 1,994,376-byte recorded snapshot; 102 profiles; 1,122 atoms
- baseline: unloaded viewer rendered and responded to screenshot capture
- bounded action: select the grounded snapshot through the visible load control
- observed sequence: the file chooser accepted the shared snapshot, then browser
  control and screenshot capture failed to settle within repeated 20–30 second
  windows
- verdict: **FAIL** for a responsive settled full-snapshot play surface in that
  browser; no claim that every browser or device fails
- named seam: `FULL_SNAPSHOT_LOAD_AND_PROJECTION_BUDGET`

Source tracing found two compounding costs: the same selected file was read and
JSON-parsed independently by roughly ten viewer modules, and both primary moving
canvases projected all 1,122 atoms at once.

## Selected repair

1. A shared file-object cache performs one physical read and parse while all
   existing viewer modules still receive the same parsed snapshot object.
2. Large snapshots begin in a deterministic SAFE projection of 384 atoms with
   all 102 grammar identities represented. BALANCED projects up to 768 and FULL
   projects every atom.
3. The header reports `VISUAL rendered/evidence · EVIDENCE FULL` and the user can
   cycle detail explicitly.
4. Projection budgeting changes no recorded atom, receipt, metric, lineage,
   snapshot content, execution state, promotion state, or authority.

Focused deterministic tests pass. Live post-repair verification remains required
before this seam can be closed.
