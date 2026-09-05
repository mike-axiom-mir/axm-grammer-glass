# Grammar Glass Workbench Polish / Handoff

This is a viewer-stability layer for the existing Grammar Glass playground lane. It does not change the recorded Grammar Glass cycle, imported 102-Grammar capability snapshots, Draft/Run history, evidence, ranking, or authority.

## Why it exists

The playground now has several independent viewer instruments: Ghost Glass, 102-Grammar generation comparison, Change Ripple, Touch Lens, Orchestra, and Star Flight. A working session can be technically valid while still becoming confusing if one layer points at stale A/B state, a removed lens, or a previous comparison.

The polish layer makes that state explicit and repairable.

## Workbench Health

The browser adds a compact `WORKBENCH HEALTH · HANDOFF` panel with six stages:

1. `LOAD_GLASS`
2. `LOAD_102_A`
3. `LOAD_102_B`
4. `SELECT_LENS`
5. `COMPARE`
6. `TRACE_RIPPLE`

Each stage is `READY`, `AVAILABLE`, or `WAIT`. `WORKBENCH_READY` means the required viewer inputs are present. It is **not** a correctness, quality, admission, or promotion claim.

The panel shows short provenance bindings for the recorded Glass cycle, 102-A commit, 102-B commit, and generation-comparison digest.

## Deterministic handoff receipt

`workbench-polish-core.js` creates:

`axm.code.grammar-glass-workbench-handoff.v1`

The receipt records:

- Glass binding when available;
- 102-A / 102-B bindings;
- generation-comparison digest;
- selected lenses;
- active Change Ripple item/lens/depth;
- membrane position;
- changed-layer / visible-mark / available-change counts;
- motion / visibility state;
- stale-state checks;
- explicit truth boundaries.

The browser can export this compact JSON receipt for another working session. It exports viewer-state receipt only and embeds no external source dependency.

## Stale-state repair

If an active Change Ripple belongs to a previous generation comparison, or its lens is no longer selected, the workbench marks the state stale and clears only the derived ripple viewer state. It does not mutate either source snapshot.

## Scoped controls

Keyboard shortcuts work only while the Workbench panel itself has focus:

- `/` focuses Change Ripple search;
- `Enter` traces the selected ripple;
- `1`–`4` switch ripple depth;
- `Esc` clears the ripple.

This avoids global keyboard interception.

## Unified visual pause

`motion-coordinator.js` coordinates recursive animation frames with the existing main PAUSE control and browser visibility.

- manual PAUSE freezes recursive visual frames;
- hidden tabs freeze recursive visual frames;
- resume re-schedules held callbacks;
- cancelled held callbacks remain cancelled;
- recorded state is untouched;
- motion state never creates evidence.

This layer coordinates visual scheduling only. Existing deterministic snapshots and receipts remain authoritative.

## Standalone boundary

Grammar Glass remains standalone. No 102-Grammar repository is required at runtime. 102 capability snapshots are portable caller-supplied files. If a future Grammar Glass capability needs actual 102-Grammar implementation code, the exact source bytes must be explicitly copied/vendored into Grammar Glass with provenance rather than linked as a runtime dependency.
