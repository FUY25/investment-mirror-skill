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

- Profile-aware mode: uses `profile.json`, `guardrails.yaml`, past decisions, and the best-fit master lens.
- Standalone mode: works without a profile and labels outputs as generic thesis clarification.

## Workflow

1. Load local profile if available.
2. Parse ticker/asset/theme, decision type, thesis, horizon, confidence, and missing fields.
3. Decompose the thesis into assumptions.
4. Generate P0/P1/P2 issues from the taxonomy.
5. Trigger personalized guardrails when profile evidence supports them.
6. Ask guided research questions.
7. Generate `decision_review.html`, `.md`, and `.json`.
8. Append to `decision_log.jsonl` only when the user requests logging.

## Output Rules

Allowed statuses are process labels such as `blocked_by_p0_issues`, `needs_research`, and `ready_for_user_decision`.

Never output a buy, sell, hold, target price, suitability, allocation, or position-size recommendation. The decision type may record the user’s stated intent, but the skill’s status must remain process-only.

## Required Sections

- Decision summary
- Profile-aware or standalone context
- Best-fit master lens when available
- Thesis decomposition
- P0/P1/P2 issue list
- Guided research questions
- Decision log preview
- Prompt suggestions
