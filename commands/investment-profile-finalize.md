---
description: Validate, render, and write final Investment Mirror profile.json/profile.html from agent-synthesized JSON + structured content.
---

# /investment-profile-finalize

Write final Investment Mirror profile artifacts from agent/LLM synthesized JSON plus agent/LLM structured final content. This command validates, renders deterministic static HTML, and writes artifacts; it does not perform synthesis, master matching, or interview formation itself.

First read `skills/investment-mirror/references/profile_lifecycle.md` for the finalization contract.

## Run

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" profile-finalize \
  --synthesis synthesized_profile.json \
  --questions interview_questions.json \
  --answers-summary "The user clarified risk triggers, horizon, constraints, and evidence threshold." \
  --content profile_model_content.json \
  --output ~/.investment-mirror
```

If the user explicitly declines interview calibration:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" profile-finalize \
  --synthesis synthesized_profile.json \
  --questions interview_questions.json \
  --answers-summary "The user declined calibration after questions were presented." \
  --content profile_model_content.json \
  --provisional \
  --declined-interview \
  --output ~/.investment-mirror
```

## Required Inputs

- `profile_candidate_inputs.json` must already exist from init/update.
- `--synthesis` must point to model-synthesized profile JSON.
- `--questions` must contain 2-5 agent-generated interview questions.
- `--answers-summary` must summarize the user's answers unless finalizing as provisional.
- `--content` must point to model-generated structured final profile content.
- Provisional finalization must include explicit `unknown_dimensions`.

Legacy compatibility: `--html` is accepted only as an escape hatch for existing callers. Prefer `--content`; the normal product path is model-owned content plus deterministic HTML rendering.

## What The Finalizer Validates

- `synthesis_mode` is written as `llm_synthesized`.
- `profile_state` is `finalized` or `provisional`.
- one primary master match and at most one secondary affinity;
- final master match is model-selected rather than auto-promoted from deterministic vectors;
- final master match does not expose deterministic similarity scores;
- provisional confidence is capped when unknown dimensions remain;
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
6. Generate structured final profile content; use `profile_report_template.html` only as visual reference.
7. Keep master matches as learning archetypes, not identity labels.
8. Do not include investment advice.

## User-Facing Reply

When finalization succeeds, summarize only the profile state, written artifacts, core interpretation, unknown dimensions, and next process step. Do not include tests, evals, registry validation, or engineering validation output unless the user explicitly asked for it.
