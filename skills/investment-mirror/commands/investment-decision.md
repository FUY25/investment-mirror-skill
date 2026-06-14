# /investment-decision

Turn an investment thesis into structured issues, research questions, guardrails, and a decision review artifact.

## Run

```bash
npm run im -- decision "I want to buy TSLA because robotaxi could unlock a massive new growth curve." --output ~/.investment-mirror
```

To append to the local decision log:

```bash
npm run im -- decision "Research-only review of NVDA AI capex risk over 3 years." --output ~/.investment-mirror --write-log
```

## Modes

- Profile-aware mode: uses finalized `profile.json`, `guardrails.yaml`, past decisions, and the final best-fit master lens.
- Standalone mode: works without a finalized profile and labels outputs as generic thesis clarification. `profile_candidate_inputs.json` alone is not enough to personalize the decision review.

## Workflow

1. Load finalized local `profile.json` if available.
2. Parse ticker/asset/theme, decision type, thesis, horizon, confidence, and missing fields.
3. Decompose the thesis into assumptions.
4. Generate candidate P0/P1/P2 issues from the taxonomy.
5. Trigger personalized guardrails when profile evidence supports them.
6. As the agent, review the candidate issues and present the result in chat as process feedback.
7. Ask targeted clarification questions when the thesis lacks horizon, valuation expectations, value-capture logic, falsification conditions, risk preference, or constraints.
8. Generate `decision_review.html`, `.md`, and `.json`.
9. Append to `decision_log.jsonl` only when the user requests logging.

## Output Rules

Allowed statuses are process labels such as `blocked_by_p0_issues`, `needs_research`, and `ready_for_user_decision`.

Never output a buy, sell, hold, target price, suitability, allocation, or position-size recommendation. The decision type may record the user’s stated intent, but the skill’s status must remain process-only.

The model may decide which candidate issues matter most and how to phrase them, but it must keep the output as issues, questions, guardrails, and next research steps. The model must not decide for the user.

## Required Sections

- Decision summary
- Profile-aware or standalone context
- Best-fit master lens when available
- Thesis decomposition
- P0/P1/P2 issue list
- Guided research questions
- Decision log preview
- Prompt suggestions
