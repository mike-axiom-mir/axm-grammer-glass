# Grammar Glass Playground Direction

This file records the direction for the `sol/grammar-glass-playground-v1` AI-instance lane.

## Goal

Make Grammar Glass more explorable, playful and creatively useful while preserving the existing source, provenance, replay and authority boundaries.

The playground is a set of **derived viewer instruments** over one or more recorded Grammar Glass snapshots.

Design principle:

`recorded snapshot -> explicit viewer instrument -> derived inspectable receipt/plan/comparison -> no mutation`

The viewer may bend, sound, replay, compare and highlight recorded structure. None of those actions changes the evidence underneath.

## Implemented instruments

### Gravity Probe

- **Gravity Well**: selected grammars become a visual focus.
- **Rift Scan**: traces the actual recorded atom-to-atom relation topology for the selected grammars.
- **Dark Grammar**: isolates recorded `CONTRAST`, `REPULSION`, `BOUNDARY` and `UNRESOLVED_NEIGHBOURHOOD` relationships plus relevant contact-memory paths.
- **Star Hunt**: visualizes recorded Draft Star overlap with the selected grammars.
- **ROLL 5**: chooses a reproducible temporary grammar set from the recorded root seed plus an explicit roll counter.
- Manual selection supports up to eight real grammar identities.

Dark Grammar is a memorable model term for influence/tension that is visible in recorded structure without an explicit resolved creation path. It is **not a claim that cosmological dark matter is code, grammar, information or unrealized creation**. See `docs/DARK_GRAMMAR_METAPHOR.md`.

### Direct Manipulation / Touch Lens

The user may arm the touch lens and drag directly on the Glass.

- `PULL` and `PUSH` deform the **actual rendered vessel projection**, including visible atom positions and relationship lines.
- Recorded atom positions remain unchanged.
- Selected grammars receive the strongest visual displacement; nearby unselected structure receives a smaller field deformation so the Glass visibly bends as a whole.
- The focus is stored as normalized viewer coordinates plus visual strength.
- Each state produces an `axm.code.grammar-glass-touch-lens-receipt.v1` bound to the active playground probe and exact recorded cycle.
- If the active grammar probe changes, stale touch state is cleared automatically rather than combining an old touch receipt with a new grammar selection.

### Glass Orchestra / Sonification

The browser can turn selected recorded structures into an interpretive audio instrument using Web Audio after explicit user activation.

- selected atom classes -> tone events
- recorded direct carries -> short pulse events
- recorded contact-memory paths -> echo events
- touch position -> stereo pan when supported
- `PULL` / `PUSH` -> timbre variation
- playground lens -> pitch/timbre character
- Star Flight focus -> star chime
- pausing the vessel -> pauses the active audio context
- safe-volume control remains capped in the UI

The deterministic sonification plan remains the evidence-bound base. Orchestra coupling is a viewer interpretation over that plan. Audio is never a correctness, quality or semantic-equivalence signal.

### Constellation Mixer / Star Flight

The replay layer constructs an ordered plan from recorded Draft Stars and Run Stars.

- play / pause flight
- previous / next event
- timeline scrub
- replay speed control
- click a Draft Star card to jump to that recorded event
- lineage focus is handed to the existing vessel view
- Star Flight publishes a viewer event that the Glass Orchestra may sonify
- replay never creates history or feeds replayed events into the Twister automatically

### Parallel Universe / Ghost Glass

Ghost Glass accepts a second valid recorded Grammar Glass snapshot and compares it with the primary loaded snapshot.

It produces an `axm.code.grammar-glass-ghost-comparison.v1` containing non-ranking comparison sets for:

- grammar identities
- relation topology
- direct influence carries
- contact-memory paths
- Draft Star structural signatures

The viewer overlays the second snapshot through a movable visual membrane and shows structural displacement without making either snapshot the winner.

Ghost Glass explicitly does not create a quality score, causal proof, semantic-equivalence claim, new evidence or cosmology claim.

## Shared extension cores

`playground-extensions-core.js` produces deterministic structures for:

- `axm.code.grammar-glass-touch-lens-receipt.v1`
- `axm.code.grammar-glass-sonification-plan.v1`
- `axm.code.grammar-glass-constellation-replay-plan.v1`

`ghost-glass-core.js` produces:

- `axm.code.grammar-glass-ghost-comparison.v1`

The test suite covers determinism, stale binding refusal, no-mutation truth fields, Dark Grammar availability and Ghost Glass non-ranking behavior.

## Non-negotiable truth boundary

- no cycle mutation
- no recorded atom-state mutation from viewer interaction
- no automatic re-entry
- no automatic execution
- no ranking or winner selection
- no quality claim from brightness, proximity, animation, sound or user selection
- no new semantic-equivalence claim
- no claim that a visual probe, Dark Grammar lens or sonification is discovered executable software
- replay creates no historical events
- Ghost Glass differences are not causal proof
- Dark Grammar is not a physics claim about real dark matter
- no hidden rewrite of existing Grammar Glass behavior
