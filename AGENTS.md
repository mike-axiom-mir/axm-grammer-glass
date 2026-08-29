# AXM Grammar Glass — Agent Working Rules

These rules apply to AI-assisted development in this repository.

## One AI instance = one PR

- One AI instance owns one working branch and one pull request for its current development session/workstream.
- Do **not** open a new PR for every small feature, fix, experiment, test, polish pass, or follow-up change.
- Keep related work from the same AI instance inside its existing PR until that workstream is intentionally finished or merged.
- Add new commits to the existing branch/PR and update the PR description when its scope grows.
- Open a new PR only when:
  - the previous PR from that AI instance has been merged or closed, or
  - Mike explicitly asks for a separate PR, or
  - the work is genuinely independent and separating it is necessary to avoid mixing incompatible work.
- Do not create stacked PR chains by default.
- Do not create replacement PRs merely because the task changed slightly.
- If multiple AI instances are working at the same time, each instance should keep its own branch/PR so their work remains easy to inspect, compare, merge, or reject independently.

### Why

This keeps the repository readable and makes it easier to see which AI instance changed what, follow progress, avoid PR sprawl, and merge completed work without reconstructing a long chain of tiny pull requests.

## Preserve active direction

- Extend the existing Grammar Glass implementation instead of redesigning it from scratch unless explicitly requested.
- Do not silently remove existing capabilities, constraints, provenance, tests, or truth boundaries.
- Keep experimental capability separate from authority. No automatic promotion, merge, or CANON decisions.
