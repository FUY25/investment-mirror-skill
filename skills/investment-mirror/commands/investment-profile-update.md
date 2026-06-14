# /investment-profile-update

Incrementally update Investment Mirror evidence. The local program updates candidate inputs and evidence artifacts; the agent/LLM decides whether the user-facing profile interpretation actually changes.

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

1. Load final `profile.json` if present, plus `profile_candidate_inputs.json`, `profile_evidence.json`, `guardrails.yaml`, and `decision_log.jsonl`.
2. Re-run source discovery and manifest comparison.
3. Process new or changed sources only unless `--reindex` is supplied.
4. Extract new full-ledger candidate spans and heuristic decision episodes.
5. Compare recent pattern evidence with historical profile evidence.
6. Produce candidate profile-confidence and candidate master-suggestion review signals only when evidence supports review.
7. Preserve final `profile.json` and `profile.html` in place.
8. As the agent/LLM, read the updated evidence packet and distinguish local evidence from model interpretation.
9. If the update exposes unresolved dimensions such as risk preference, horizon, or constraints, ask 2-5 targeted interview questions before changing the final model profile.
10. Generate an update report that lists newly detected, strengthened, and weakened patterns.
11. If the final profile changes, synthesize updated JSON and generate updated final HTML in the model phase, then run `/investment-profile-finalize --html profile_model_generated.html`.

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

- newly detected patterns;
- strengthened patterns;
- weakened patterns;
- guardrails triggered most often;
- candidate master-suggestion changes requiring LLM review;
- areas improving;
- areas needing attention.

Use process language only. Do not turn profile updates into investment recommendations.

Do not accept a deterministic similarity-score change as a real master-match change until the model has checked the receipts and explained why the new lens is more useful than the prior one. Run `/investment-profile-finalize --html profile_model_generated.html` only after the agent/LLM has synthesized updated JSON and generated updated final HTML.
