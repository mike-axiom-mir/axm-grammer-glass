# Human Intent Grammar v1

Grammar Glass can now accept a deterministic structured description of what a human or AI wants without treating a prompt library, copied prompt, or external corpus as executable instructions.

The intent shape is:

`goal + inputs + constraints + transformations + output forms + evaluation criteria + domain vocabulary + visual directives`

This is deliberately narrower than natural-language understanding. The current organ does not claim to infer these fields from arbitrary text.

## Why this belongs in Grammar Glass

Large prompt libraries are useful as observations of how people describe desired work. Blindly injecting thousands of prompts into an agent would mix data and authority.

The Human Intent Grammar keeps those concerns separate:

- external prompt corpora may be referenced as research data
- raw prompt text is not stored in the intent receipt
- corpus instructions are never executed by this organ
- the caller supplies the structured fields explicitly
- the exact structured intent receives a deterministic digest
- a later handoff can bind that digest without forwarding a raw prompt
- the handoff grants no execution, selection, promotion, merge, or CANON authority

## Current handoff

`createIntentReceipt()` produces `axm.code.grammar-glass-human-intent.v1`.

`prepareIntentHandoff()` produces `axm.code.grammar-glass-human-intent-handoff.v1` and can point at a later named target such as Discovery Kiln or Construction Hand.

READY means only that the structured intent is digest-valid and prepared for a later consumer. It does not mean the consumer executed or interpreted it correctly.

## Future use

A later evidence-backed adapter may study a licensed prompt corpus and propose mappings from natural language into this intent shape.

That future adapter must remain separately testable. It must not turn the corpus into hidden instructions, claim semantic correctness from string matching, or silently replace caller intent.

## Truth boundary

- natural-language semantic extraction: not implemented
- external prompt corpus bundled: no
- external prompt corpus executed: no
- raw prompt forwarded to construction: no
- construction executed here: no
- selection or promotion: no
- authority: none
