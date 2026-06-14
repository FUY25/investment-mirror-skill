# Pipeline Policy

The profile pipeline is an evidence compiler, not an investment-personality classifier.

## Deterministic Tool Responsibilities

Allowed deterministic work:

- local source discovery from Codex, Claude, notes, and explicit include paths;
- excludes, manifests, hashes, mtime, source status, and source aliases;
- parsing JSONL, JSON, Markdown, text, and HTML exports;
- redaction of likely secrets, emails, API keys, and tokens;
- heuristic scoring for investment and decision relevance;
- downweighting code-heavy and tool-output-heavy spans;
- full candidate span ledger extraction across project, month, source type, and span type;
- candidate episode extraction with receipt summaries;
- heuristic pattern counts;
- candidate master style suggestions;
- candidate guardrail generation;
- schema validation and artifact scaffolding;
- deterministic rendering of final `profile.html` from model-owned structured content;
- local JSON/SQLite/grep-style memory search.

Forbidden deterministic work:

- final profile judgment;
- final master match;
- final guardrail rationale;
- final profile synthesis;
- final profile content judgment;
- profile draft JSON or HTML;
- buy, sell, hold, allocation, sizing, or suitability recommendations.

## Required Phase Flow

1. **Deterministic discovery**: run `node scripts/cli.mjs profile-init --output ~/.investment-mirror`.
2. **Deterministic source manifest**: discover Codex/Claude/local include paths, apply excludes, hash files, and write source IDs.
3. **Deterministic redaction**: redact likely secrets and identifiers before indexing or scoring.
4. **Deterministic local index**: write `source_index.sqlite` for local grep/FTS-style retrieval.
5. **Deterministic scoring**: score turns/spans for high-recall decision relevance. This is search ranking, not classification.
6. **Deterministic filtering**: downweight code-heavy and tool-output-heavy spans.
7. **Deterministic lexical coverage**: include decision-language variants such as `decision`, `decisions`, `decide`, `decides`, `decided`, `deciding`, `option`, `options`, and `optional`.
8. **Deterministic full ledger**: build the full candidate span ledger. Do not reduce it to a subset for profile synthesis.
9. **Agent/LLM full evidence analysis**: read the full ledger and receipts; use subagents when the ledger is too large for one pass.
10. **Agent/LLM episode interpretation**: decide which candidate episodes matter, which are false positives, and which evidence tiers can support synthesis.
11. **Deterministic candidate summaries**: provide heuristic pattern counts, candidate guardrails, candidate master suggestions, schema, source summaries, and reference artifacts.
12. **Agent/LLM question formation**: generate 2-5 targeted interview questions from evidence gaps. Questions are not a fixed limited set.
13. **Agent/LLM interview**: ask the user unless they explicitly decline calibration.
14. **Agent/LLM master/profile synthesis**: choose the final master lens and synthesize profile JSON by reading evidence plus master records. Do not rely on vectors as the decision.
15. **Agent/LLM final content**: generate structured final profile content from the synthesized profile. Use `profile_report_template.html` as a visual reference specimen only.
16. **Deterministic finalizer**: run `profile-finalize --synthesis ... --questions ... --answers-summary ... --content ...` to validate safety/schema/provenance, render canonical HTML, and write `profile.json` and `profile.html`.

## Runtime Entry and Per-Phase Scripts

There is exactly **one runtime entry point**: the committed plain-node bundle
`scripts/cli.mjs` (subcommands `profile-init`, `profile-update`,
`profile-finalize`, `decision`, `mirror-ask`, `discover-sources`). It runs with
`node` + `python3` only — no `tsx`, no `npm install`. Rebuild it with
`npm run build:cli` after editing `scripts/investment_mirror_cli.ts` or
`src/*.ts`.

The other `scripts/*.ts` files (`discover_sources.ts`, `build_source_manifest.ts`,
`parse_transcript_adapters.ts`, `redact_sensitive.ts`, `build_transcript_index.ts`,
`score_decision_spans.ts`, `collect_candidate_ledger.ts`,
`classify_decision_episodes.ts`, `aggregate_decision_patterns.ts`,
`match_master_styles.ts`, `run_calibration_interview.ts`, `finalize_profile.ts`,
`generate_investor_profile.ts`, `lint_investment_decision.ts`,
`generate_prompt_pack.ts`, `update_investment_mirror.ts`, `render_profile_html.ts`,
`render_decision_html.ts`) are the spec §6.3 **per-phase source wrappers**. They
are thin re-exports of the same `src/core.ts` functions the CLI uses (so they
cannot drift in behavior) and exist as documentation of the pipeline phases.
They are dev/source-level helpers (run with `tsx`), not the shipped runtime path;
use `scripts/cli.mjs` at runtime. `sqlite_bridge.py` and `query_source_index.py`
are the Python helpers invoked by the core.

## Candidate Evidence Language

Use these labels in deterministic outputs:

- `candidate_span`
- `candidate_decision_episode`
- `heuristic_pattern_count`
- `candidate_master_suggestion`
- `candidate_guardrail`
- `profile_candidate_inputs`

Avoid these labels before finalization:

- final profile
- profile draft
- final match
- user is like {master}
- recommended action

## Update Flow

`profile-update` must merge historical `profile_evidence.json` candidate episodes with new evidence. It may write new candidate inputs and update reports, but it must preserve `profile.json` and `profile.html` until the agent/LLM runs finalization again.

Master match changes are review candidates only. A deterministic similarity-score change is insufficient; the agent/LLM must inspect receipts and explain why a new master lens is more useful than the prior one. Final `best_fit_master_matches` must not expose deterministic similarity scores; use qualitative model confidence and rationale instead.
