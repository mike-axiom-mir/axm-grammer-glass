# Grammar Glass Playground Direction

This file records the direction for the `sol/grammar-glass-playground-v1` AI-instance lane.

## Goal

Make Grammar Glass more explorable, playful and creatively useful while preserving the existing source, provenance, replay and authority boundaries.

## Current playground layer

The playground is a set of **derived viewer instruments** over a loaded recorded Grammar Glass snapshot.

A user can select real grammar identities and explore the relationships that are already present in the snapshot. The viewer can bend, sound, and replay those recorded structures without changing the underlying cycle or inventing evidence.

The design principle is:

`recorded snapshot -> explicit viewer instrument -> derived inspectable receipt/plan -> no mutation`

The playground should feel physical and strange while keeping the truth boundary visible: bending, hearing, or replaying the Glass is not changing the evidence.

## Implemented instruments

### Gravity Probe

- **Gravity Well**: selected grammars become a visual focus.
- **Rift Scan**: visualizes recorded boundaries, contrasts and relationships in the selected set.
- **Star Hunt**: visualizes recorded Draft Star overlap with the selected grammars.
- **ROLL 5**: chooses a reproducible temporary grammar set from the recorded root seed plus an explicit roll counter.
- Manual selection supports up to eight real grammar identities.
- Probe receipts count only recorded atoms, relation edges, direct carries, contact-memory paths and Draft Star overlap.

### Direct Manipulation / Touch Lens

The user may arm the touch lens and drag directly on the Glass.

- `PULL` and `PUSH` change the visual focus only.
- The focus is stored as normalized viewer coordinates plus visual strength.
- Each state can produce an `axm.code.grammar-glass-touch-lens-receipt.v1` bound to the active playground probe and exact recorded cycle.
- Pointer motion creates no new atom state, influence carry, Draft Star, candidate or evidence.

### Sonification / Hear the Glass

The browser can turn the selected recorded structures into an interpretive audio instrument using Web Audio after explicit user activation.

- selected atom classes -> tone events
- recorded direct carries -> short pulse events
- recorded contact-memory paths -> echo events
- safe-volume control is capped in the UI
- the sonification plan is deterministic for the same snapshot and probe

Audio is explicitly **not** a correctness signal, quality score, semantic-equivalence claim or evidence source.

### Constellation Mixer / Star Flight

The replay layer constructs an ordered plan from recorded Draft Stars and Run Stars.

- play / pause flight
- previous / next event
- timeline scrub
- replay speed control
- click a Draft Star card to jump the flight to that recorded event
- lineage focus is handed to the existing vessel view
- the visual trail shows visited recorded star events

Replay never creates history and never feeds replayed events into the Twister automatically.

## Shared extension core

`playground-extensions-core.js` produces deterministic, inspectable structures for the three instruments:

- `axm.code.grammar-glass-touch-lens-receipt.v1`
- `axm.code.grammar-glass-sonification-plan.v1`
- `axm.code.grammar-glass-constellation-replay-plan.v1`

The extension core refuses stale probe/cycle bindings and is covered by a dedicated selftest in the normal `npm test` chain.

## Possible follow-ons for this same PR lane

- richer direct manipulation shapes beyond a single focus point
- filterable constellation replay by connection class or grammar family
- optional stereo/spatial audio projection
- replay capture as an inert visual-session receipt
- more playful visual instruments that consume the same recorded evidence root

These remain exploration surfaces unless a later explicit core contract is added and verified.

## Non-negotiable truth boundary

- no cycle mutation
- no atom-state mutation from viewer interaction
- no automatic re-entry
- no automatic execution
- no ranking or winner selection
- no quality claim from brightness, proximity, animation, audio or user selection
- no new semantic-equivalence claim
- no claim that a visual probe or sonification is a discovered executable program
- replay creates no historical events
- no hidden rewrite of existing Grammar Glass behavior
