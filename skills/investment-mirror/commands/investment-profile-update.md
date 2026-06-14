# /investment-profile-update

Incrementally update an existing Investment Mirror profile. The local program updates evidence and draft artifacts; the agent/LLM decides whether the user-facing profile interpretation actually changes.

## Run

```bash
npm run im -- profile-update --output ~/.investment-mirror --since 30d
```

Optional:

```bash
npm run im -- profile-update \
  --include ~/new_transcripts \
  --output ~/.investment-mirror
```

## Workflow

1. Load `profile.json`, `guardrails.yaml`, and `decision_log.jsonl` if present.
2. Re-run source discovery and manifest comparison.
3. Process new or changed sources only unless `--reindex` is supplied.
4. Extract new candidate spans and decision episodes.
5. Compare recent pattern evidence with historical profile evidence.
6. Produce candidate profile-confidence and best-fit-master changes only when evidence supports a change.
7. Preserve previous profile files in `profile_history/`.
8. Read the updated evidence packet and distinguish local evidence from model interpretation.
9. If the update exposes unresolved dimensions such as risk preference, horizon, or constraints, ask 2-5 targeted interview questions before changing the final model profile.
10. Generate an update report that lists newly detected, strengthened, and weakened patterns.

## Outputs

- updated `profile.json`
- updated `guardrails.yaml`
- updated `profile_evidence.json`
- updated `profile_synthesis_prompt.md`
- updated `profile_report_template.html`
- updated `profile_draft.html`
- updated `profile.html`
- `profile_history/{date}-profile-update.json`
- `profile_history/{date}-profile-update.html`

## Required Reporting

Show:

- newly detected patterns;
- strengthened patterns;
- weakened patterns;
- guardrails triggered most often;
- best-fit master match changes;
- areas improving;
- areas needing attention.

Use process language only. Do not turn profile updates into investment recommendations.

Do not accept a deterministic similarity-score change as a real master-match change until the model has checked the receipts and explained why the new match is more useful than the prior one.
