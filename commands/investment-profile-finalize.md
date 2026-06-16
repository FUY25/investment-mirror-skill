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

`profile_model_content.json` must structure the user-facing report around:

- hero copy with the user's investment decision style and why it resembles the selected master lens;
- evidence boundary data: keep compact evidence rows in JSON for auditability, but render the final HTML as a short evidence-boundary section with key counts and lightweight evidence signals inside the six dimensions;
- six decision-pattern dimensions: philosophy, decision-making process, research process, buy/sell discipline, risk process, and repeatability;
- master learning lens reframed as what the user can learn from the selected master and what investment style/watch-outs fit the user's process;
- 1-5 concise guardrail protocols/questions;
- a `/investment-decision` command scaffold for the next concrete thesis review, without generic prompt chips or buy/sell/allocation fields.

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
9. Match the completed interview answers' dominant language for user-facing questions, summaries, final profile copy, and rendered HTML chrome unless the user requests another language. If interview-answer language conflicts with earlier chat or transcript language, the interview-answer language wins. Master names, file paths, IDs, and technical field names may stay in their canonical form.
10. Write interpretation through the six investment-process dimensions, not through a single-thesis checklist.
11. Keep evidence strength visible without overexplaining it in the UI: if direct investment evidence is sparse, describe the profile as process-level or evidence-light in structured content and use concise evidence-boundary metrics plus dimension-level evidence signals in the rendered report.
12. Do not turn review triggers into broad risk-tolerance claims, and do not turn "no constraints stated" into "no constraints."
13. Avoid pseudo-precision in final copy; numeric fingerprint values are orientation signals, not measurements.
14. Connect the final CTA to `/investment-decision`; do not write a generic prompt that bypasses the skill-family decision review.

## User-Facing Reply

When finalization succeeds, summarize only the profile state, written artifacts, core interpretation, unknown dimensions, and next process step. Do not include tests, evals, registry validation, or engineering validation output unless the user explicitly asked for it.
