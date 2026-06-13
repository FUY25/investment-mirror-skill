# /investment-mirror-ask

Answer questions over local Investment Mirror memory.

## Run

```bash
npm run im -- mirror-ask "Which guardrail do I trigger most often?" --output ~/.investment-mirror
```

Chinese questions are allowed:

```bash
npm run im -- mirror-ask "我过去所有 AI 相关投资想法里，最常缺失的东西是什么？" --output ~/.investment-mirror
```

## Data Scope

Use:

- `profile.json`
- `guardrails.yaml`
- `decision_log.jsonl`
- `decisions/*.json`
- `profile_history/*.json`
- source summaries and receipt summaries

Do not expose raw transcript text unless the user explicitly requests raw local evidence and understands that it may contain sensitive material.

## Answer Style

1. Cite local decision IDs, profile IDs, or source aliases.
2. Separate evidence from interpretation.
3. State whether the answer is based on profile evidence, decision logs, or both.
4. Suggest one next guardrail or review action.
5. Avoid buy/sell/hold recommendations.

## Examples

- “Which guardrail appears most often in my logs?”
- “Which AI-related decisions were blocked by P0 issues?”
- “Have my recent logs shown less narrative-to-action jump than last month?”
- “Which decision IDs had unresolved valuation expectation issues?”
