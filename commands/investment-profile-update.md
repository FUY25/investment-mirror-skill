---
description: Incrementally update Investment Mirror evidence from new/changed transcripts; preserves the final profile until finalize.
---

# /investment-profile-update

Incrementally update Investment Mirror evidence. The local program updates candidate inputs and evidence artifacts; the agent/LLM decides whether the user-facing profile interpretation actually changes.

First read `skills/investment-mirror/references/pipeline_policy.md` and `skills/investment-mirror/references/profile_lifecycle.md`.

## Run

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" profile-update --output ~/.investment-mirror --since 30d
```

Optional:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" profile-update \
  --include ~/new_transcripts \
  --output ~/.investment-mirror
```

## Workflow

1. Load final `profile.json` if present, plus `profile_candidate_inputs.json`, `profile_evidence.json`, `guardrails.yaml`, and `decision_log.jsonl`.
2. Re-run source discovery and manifest comparison.
3. Process new or changed sources only unless `--reindex` is supplied.
4. Extract new full-ledger redacted candidate evidence spans.
5. Merge new candidate evidence items with historical `profile_evidence.json`.
6. Report evidence count deltas and preserve model-owned interpretation until the agent/LLM reviews the updated evidence.
7. Preserve final `profile.json` and `profile.html` in place.
8. As the agent/LLM, read the updated evidence packet and distinguish local evidence from model interpretation.
9. If the update exposes unresolved dimensions such as risk preference, horizon, or constraints, ask 2-5 targeted interview questions before changing the final model profile.
10. Generate an update report that lists candidate evidence span count changes and the model review requirement.
11. If the final profile changes, synthesize updated JSON and structured final content in the model phase, then run `/investment-profile-finalize --content profile_model_content.json`.

## Outputs

- updated `profile_candidate_inputs.json`
- updated `guardrails.yaml`
- updated `profile_evidence.json`
- updated `profile_synthesis_prompt.md`
- updated `profile_finalization_schema.json`
- updated `profile_report_template.html`
- updated `profile_candidate_report.html`
- final `profile.json` and `profile.html` are preserved unless `/investment-profile-finalize` is run
- `profile_history/{date}-profile-update.json`
- `profile_history/{date}-profile-update.html`

## Required Reporting

Show:

- previous candidate evidence span count;
- current candidate evidence span count;
- candidate evidence span delta;
- whether a final profile already exists and was preserved;
- that model review is required before changing interpretation, master lens, or guardrails.

Use process language only. Do not turn profile updates into investment recommendations.

Do not accept retrieval-score changes as profile changes. Run `/investment-profile-finalize --content profile_model_content.json` only after the agent/LLM has reviewed updated evidence, compared master records, synthesized updated JSON, and generated updated structured final content.
