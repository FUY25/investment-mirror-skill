---
description: Answer questions over local Investment Mirror memory (profile, guardrails, decision logs) with cited local evidence. No buy/sell advice.
argument-hint: "\"Which guardrail do I trigger most often?\""
---

# /investment-mirror-ask

Answer questions over local Investment Mirror memory.

First read `skills/investment-mirror/references/memory_contract.md` for the retrieval and privacy contract.

## Run

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" mirror-ask "$ARGUMENTS" --output ~/.investment-mirror
```

Chinese questions are allowed:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" mirror-ask "我过去所有 AI 相关投资想法里，最常缺失的东西是什么？" --output ~/.investment-mirror
```

## Data Scope

Use local JSON/SQLite/grep-style retrieval. Do not use RAG or embeddings.

Default scope:

- `profile.json` if finalized
- `profile_candidate_inputs.json` as candidate inputs, clearly labeled
- `guardrails.yaml`
- `decision_log.jsonl`
- `decisions/*.json`
- `profile_history/*.json`
- source summaries and receipt summaries

Do not search or expose raw transcript text by default. If the user explicitly requests raw local evidence, raw transcript, original text, redacted turns, `原始证据`, `原文`, or `转录`, query redacted snippets from `source_index.sqlite` and cite `turn_id`/`source_id`.

## Answer Style

1. Cite local decision IDs, profile IDs, candidate IDs, receipt IDs, source IDs, or turn IDs.
2. Separate evidence from interpretation.
3. State whether the answer is based on profile evidence, decision logs, or both.
4. Suggest one next guardrail or review action.
5. Avoid buy/sell/hold recommendations.

## Examples

- "Which guardrail appears most often in my logs?"
- "Which AI-related decisions were blocked by P0 issues?"
- "Have my recent logs shown less narrative-to-action jump than last month?"
- "Which decision IDs had unresolved valuation expectation issues?"
