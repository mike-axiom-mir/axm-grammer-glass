# Discovery Ledger Recovery Contract v1

## Problem

The Discovery Kiln keeps its append-only exploration history in browser-local storage. The ledger already carried a deterministic digest, but the viewer's load path treated parse failures, invalid structure, digest mismatch and source-snapshot mismatch like an absent ledger. It initialized empty history in memory, and a later preparation could overwrite the held bytes.

Invalid history is not empty history. Losing that distinction erases the only local evidence that a combination was previously prepared or tested.

## Load contract

`inspectLedgerStorage(...)` returns a sealed `axm.code.grammar-glass-local-discovery-ledger-load.v1` receipt and either:

- the exact verified ledger;
- a new in-memory ledger when no stored value exists; or
- no ledger and a typed HOLD when stored bytes cannot be trusted for the current snapshot.

The HOLD binds the source key, exact raw-byte digest, UTF-8 byte count and reason. Parse failure, integrity/structure failure and source-scope mismatch remain distinct results. A held value cannot be appended to or overwritten by the ordinary save path.

Ledger validation now also checks the declared ledger version/result/authority, source-binding identity, event schema/version/authority, sequence, event digests, event count and whole-ledger digest.

## Explicit recovery

While held, the existing export control exports a deterministic quarantine envelope containing the exact stored text plus its load receipt lineage. The existing prepare control changes to **PRESERVE + RESET HISTORY**.

Reset requires a browser confirmation. Before the active storage key is replaced, the exact held bytes are written under a content-addressed quarantine key. Only then is a new empty ledger written. If either storage operation fails, the viewer stays held.

The quarantine is preserved evidence of rejected bytes. It is not promoted to verified discovery history and does not prove that its contents were ever truthful.

## Authority and privacy boundary

This capability is local-only, uses no network or account, and grants no execution, selection, promotion, merge or CANON authority. The quarantine contains the prior local ledger bytes, which are already digest-only execution/discovery metadata under the current Grammar Glass contract.
