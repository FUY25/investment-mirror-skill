# Memory Contract

`/investment-mirror-ask` answers questions over local Investment Mirror memory without RAG or embeddings.

## Default Search Scope

Default answers may search:

- `profile.json` when finalized;
- `profile_candidate_inputs.json` as candidate inputs, clearly labeled;
- `profile_evidence.json` receipt summaries and candidate episode summaries;
- `decision_log.jsonl`;
- `decisions/*.json`;
- `profile_history/*.json`;
- `source_manifest.json`;
- `guardrails.yaml` and prompt-pack summaries when useful.

Default answers must not search raw transcript turns, even redacted turns, and must set `raw_transcript_exposed: false`.

## Raw Evidence Scope

When the user explicitly asks for raw local evidence, raw transcript, original text, redacted turns, or equivalent Chinese wording such as `原始证据`, `原文`, `转录`, or `逐字`, the workflow may query `source_index.sqlite` redacted turn FTS.

Raw retrieval rules:

- return short redacted snippets only;
- cite `turn_id` and `source_id`;
- never expose original unredacted local files;
- remind the user that snippets are local evidence, not model interpretation.

## Answer Style

Each answer should include:

- `evidence`: structured local evidence items with `id`, `kind`, `source`, `summary`, and `matched_terms`;
- `interpretation`: a separate explanation of what the evidence suggests;
- `data_scope`: whether raw/redacted turns were searched;
- `next_guardrail_or_review_action`: one process next step, not investment advice.

Use local IDs such as:

- `profile:{profile_id}`
- `candidate:{profile_id}`
- `receipt:{episode_id}`
- `decision:{decision_id}`
- `source:{source_id}`
- `history:{file}`
- `redacted_turn:{turn_id}`

## Data Retention

`.sqlite_payload.json` is a temporary bridge file and must be deleted after SQLite indexing unless `INVESTMENT_MIRROR_KEEP_SQLITE_PAYLOAD=1` is set for debugging. The SQLite index may contain redacted turn text for explicit raw-evidence retrieval, but default memory answers must not query it.
