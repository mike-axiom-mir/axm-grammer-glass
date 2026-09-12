# Lane 4 — Discovery ledger recovery gate

**Branch:** `chat/4-discovery-ledger-recovery-gate`  
**Date:** 2026-09-09  
**Perspective:** AXM Systems & State Architect

## Scope

- preserve the distinction between absent and invalid device-local history;
- produce deterministic typed load receipts for valid, empty, malformed, corrupted and wrong-snapshot state;
- block preparation and ordinary writes while history is held;
- allow held bytes to be exported without treating them as valid;
- require explicit user confirmation and content-addressed quarantine before reset;
- strengthen executable ledger and event invariants.

## Lane separation

PR #7 validates State Ripple graph inputs and sparse/full equivalence. PR #8 validates primary visual snapshots before viewer binding. This lane changes only the Discovery Kiln's device-local history boundary, its existing selftest and documentation; it does not modify either active lane's files.

## Stop condition

The lane is complete when valid history still round-trips, absent history still initializes normally, mutation fixtures produce typed HOLDs without a replacement ledger, quarantine/recovery identities are deterministic, and the complete repository verification remains green.

No merge, promotion or CANON action is performed by this lane.
