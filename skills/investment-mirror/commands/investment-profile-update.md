# /investment-profile-update

Incrementally update an existing Investment Mirror profile.

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
6. Update profile confidence and best-fit master match only when evidence supports a change.
7. Preserve previous profile files in `profile_history/`.
8. Generate an update report that lists newly detected, strengthened, and weakened patterns.

## Outputs

- updated `profile.json`
- updated `guardrails.yaml`
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
