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
- root and skill master SVG assets exist and use imagegen line-art metadata;
- no unsupported annualized return claims or performance rankings are added unless supported by source files.

## Matching Semantics

Candidate master suggestion is a learning-lens search over style vectors. It is not identity classification, final matching, or authority endorsement.

The agent/LLM must:

- pick one primary master match only after reading receipts;
- add at most one secondary affinity;
- explain why the lens is useful;
- explain what not to copy;
- avoid performance ranking language.
