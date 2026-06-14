# /investment-profile-finalize

Write final Investment Mirror profile artifacts from agent/LLM synthesized JSON plus agent/LLM generated final HTML. This command validates and writes; it does not perform synthesis, master matching, interview formation, or HTML generation itself.

## Run

```bash
npm run im -- profile-finalize \
  --synthesis synthesized_profile.json \
  --questions interview_questions.json \
  --answers-summary "The user clarified risk triggers, horizon, constraints, and evidence threshold." \
  --html profile_model_generated.html \
  --output ~/.investment-mirror
```

If the user explicitly declines interview calibration:

```bash
npm run im -- profile-finalize \
  --synthesis synthesized_profile.json \
  --questions interview_questions.json \
  --answers-summary "The user declined calibration after questions were presented." \
  --html profile_model_generated.html \
  --provisional \
  --declined-interview \
  --output ~/.investment-mirror
```

## Required Inputs

- `profile_candidate_inputs.json` must already exist from init/update.
- `--synthesis` must point to model-synthesized profile JSON.
- `--questions` must contain 2-5 agent-generated interview questions.
- `--answers-summary` must summarize the user's answers unless finalizing as provisional.
- `--html` must point to model-generated final static profile HTML.
- Provisional finalization must include explicit `unknown_dimensions`.

## What The Finalizer Validates

- `synthesis_mode` is written as `llm_synthesized`.
- `profile_state` is `finalized` or `provisional`.
- one primary master match and at most one secondary affinity;
- final master match is model-selected rather than auto-promoted from deterministic vectors;
- final HTML contains required Investment Mirror sections and no unfilled placeholders;
- no buy/sell/hold recommendation language;
- no allocation or position sizing;
- no suitability claims;
- no unsupported performance rankings;
- provisional profiles list unknown dimensions.

## Outputs

- `profile.json`
- `profile.html`
- `profile_history/{date}-finalized-profile.json` or `profile_history/{date}-provisional-profile.json`
- `profile_history/{date}-finalized-profile.html` or `profile_history/{date}-provisional-profile.html`
- updated `profile_state.json`

## Agent Responsibilities Before Running

1. Read the evidence packet and candidate inputs.
2. Create interview questions in your own words.
3. Ask the user unless they explicitly decline.
4. Synthesize the profile as an interpretation of evidence plus interview answers.
5. Choose the master lens by reading evidence plus master records; deterministic vector matches are suggestions only.
6. Generate final static HTML yourself; use `profile_report_template.html` only as reference.
7. Keep master matches as learning archetypes, not identity labels.
8. Do not include investment advice.
