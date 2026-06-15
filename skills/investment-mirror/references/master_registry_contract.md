# Master Registry Contract

The runtime source of truth for active masters is:

```text
skills/investment-mirror/src/master_data.ts
```

YAML files under `skills/investment-mirror/config/` and research files under `research/masters/` are generated or curated artifacts that must stay consistent with runtime data.

## Validation Requirements

`npm run validate:registry` must verify:

- exactly 30 active v0.2 masters;
- future masters excluded from the v0.2 gate;
- registry order matches `ACTIVE_MASTER_IDS`;
- every active master has style vectors for all dimensions;
- YAML style vectors equal the runtime `MASTER_RECORDS` vectors;
- display names match runtime records;
- each master has `profile.md`, `sources.yaml`, and `style_notes.md`;
- each source has URL, source type, source-quality label, and source-quality tier;
- root master SVG assets exist and use imagegen line-art metadata;
- no unsupported annualized return claims or performance rankings are added unless supported by source files.

## Master Lens Semantics

Master records are comparison material for the agent/LLM, not deterministic profile output. `profile-init` must not choose candidate or final master matches. The model may choose a master lens only after reading reviewed evidence plus the relevant master `profile.md`, `style_notes.md`, and `sources.yaml`.

The agent/LLM must:

- pick one primary master match only after reading model-reviewed evidence and master records;
- add at most one secondary affinity;
- explain why the lens is useful;
- explain what not to copy;
- avoid performance ranking language.
