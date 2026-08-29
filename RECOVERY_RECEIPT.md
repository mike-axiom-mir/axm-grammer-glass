# Grammar Glass recovery receipt

Recovery date: 2026-08-29

## Source

- source repository: `mike-axiom-mir/axm-collaboration-platform`
- source commit: `d14ee2e89e994d16ffcdcd5cfcd7fc85f73b69c3`
- PR #61 merged package ancestor: `2961d42f96ddc6bdb082415e0714a44bcbd61535`
- latest included overlay: PR #74 `OPEN_DISCOVERY` invariant

## Recovered target

- target repository: `mike-axiom-mir/axm-grammer-glass`
- recovery branch: `recovery/merged-grammar-glass-current`
- recovered-source commit: `ef7cf75104d5f72054a904b40ffd893ba3be1603`
- merge-gate PR: `#2`

## Verified during recovery

- exact-byte comparison: PASS for `tools/grammar-glass/`, all copied core/dependency files, and the complete `organs/` tree
- Phase 1 steward selftest: PASS, 71 assertions
- contact-memory steward selftest: PASS, 47 assertions
- Interglass Phase 2 selftest: PASS, 74 assertions
- execution-history steward selftest: PASS, 53 assertions
- live grammar profiles: 102
- typed structural atoms: 1122
- explicit `OPEN_DISCOVERY` invariant: present
- standalone visual snapshot: schema/version/profile/atom/Interglass checks PASS

This receipt records recovery evidence only. It does not grant merge, promotion, execution, deployment or CANON authority.
