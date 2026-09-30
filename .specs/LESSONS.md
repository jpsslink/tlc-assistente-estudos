# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Zustand persist middleware hydration (onRehydrateStorage) is never exercised by tests that use setState() directly to reset state in beforeEach. Add a hydration smoke test: mock MMKV to return a known serialized state, then call rehydration and assert each field is restored.
- signal: `ac_gap` · recurrence: 1 feature(s) · harmful: 0
- features: assistente-estudos-mvp
- evidence: ESTD-47
- last seen: 2026-09-30T01:55:41Z

### L-002 - JSON parse error recovery in storage.ts (readStudyState) is implemented but untested. The Zustand rehydrate callback delegates to the persist middleware default, which calls readStudyState() — but no test passes invalid JSON to the MMKV mock. Add a test that mocks MMKV.getString to return malformed JSON and verifies the store initializes with defaults and emits console.warn.
- signal: `ac_gap` · recurrence: 1 feature(s) · harmful: 0
- features: assistente-estudos-mvp
- evidence: ESTD-50
- last seen: 2026-09-30T01:55:48Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
