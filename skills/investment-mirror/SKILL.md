---
name: investment-mirror
description: Local-first investment decision profiling and thesis-linting skill. Use when the user asks to initialize or update an Investment Mirror profile from Codex/Claude transcripts or notes, lint an investment thesis without buy/sell advice, generate local profile/decision HTML artifacts, query their Investment Mirror memory, or work with /investment-profile-init, /investment-profile-update, /investment-decision, or /investment-mirror-ask workflows.
---

# Investment Mirror

Investment Mirror is a local-first investment decision skill. It analyzes local transcripts and notes to compile decision-process evidence, then the agent/LLM synthesizes the actual profile, maps it to source-backed investment-master learning archetypes, installs guardrails, and turns future theses into issues, questions, and decision records.

The deterministic program is the evidence compiler and artifact writer. It does source discovery, redaction, span scoring, episode extraction, candidate master matching, guardrail candidate generation, and report-template generation. It does not make the final profile judgment by itself. The final profile narrative, final `profile.json` with `synthesis_mode: "llm_synthesized"`, and final `profile.html` must be produced by the agent/LLM after reading `profile_evidence.json` and `profile_synthesis_prompt.md`.

The skill must not provide investment, legal, tax, or financial advice. Never recommend buy, sell, hold, allocation, suitability, or position size. Use process statuses, issue severity, guardrails, and research questions.

## Commands

Use the command docs when the user invokes a slash-style workflow:

- `/investment-profile-init`: read `commands/investment-profile-init.md`
- `/investment-profile-update`: read `commands/investment-profile-update.md`
- `/investment-decision`: read `commands/investment-decision.md`
- `/investment-mirror-ask`: read `commands/investment-mirror-ask.md`

The executable implementation is in `scripts/investment_mirror_cli.ts`.

```bash
npm run im -- profile-init --output ~/.investment-mirror
npm run im -- profile-update --output ~/.investment-mirror
npm run im -- decision "I want to buy TSLA because robotaxi could unlock a massive new growth curve." --output ~/.investment-mirror
npm run im -- mirror-ask "Which guardrail do I trigger most often?" --output ~/.investment-mirror
```

## Required Framing

- Start profile artifacts with positive recognition and the best-fit master match.
- Use one primary master match by default; add one secondary affinity only when evidence supports it.
- Frame guardrails as protocols that make the user's style more investable.
- For `/investment-profile-init`, ask 2-5 targeted interview questions before finalizing. The agent must generate these questions from evidence gaps, especially unobserved risk preference, loss tolerance, horizon, liquidity or personal constraints, concentration comfort, and what counts as enough evidence.
- Use P0/P1/P2 issue language in `/investment-decision`.
- Do not expose raw transcripts by default. Use receipt summaries and local source aliases.
- Distinguish evidence from interpretation.
- Keep the future 15 masters excluded from the v0.2 completion gate.

## Local Memory

Runtime user memory lives under the output directory, normally `~/.investment-mirror`:

- `profile.json`
- `guardrails.yaml`
- `profile_evidence.json`
- `profile_synthesis_prompt.md`
- `profile_report_template.html`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `profile_draft.html`
- `profile.html`
- `source_index.sqlite`
- `decision_log.jsonl`
- `decisions/*.md`, `decisions/*.json`, `decisions/*.html`
- `profile_history/*`

Reusable product assets and research live in the repo:

- `config/master_registry.yaml`
- `config/master_style_vectors.yaml`
- `config/master_guardrail_rules.yaml`
- `config/issue_taxonomy.yaml`
- `config/guardrail_rules.yaml`
- `research/masters/{master_id}/`
- `assets/masters/{master_id}.svg`

Generated HTML artifacts must copy only needed master assets beside the artifact, such as `profile.assets/masters/philip_fisher.svg`.

## Transcript Pipeline

For profile initialization and updates, run the local pipeline before model interpretation:

1. Discover sources from `~/.codex/sessions/`, `~/.claude/projects/`, and user includes.
2. Apply excludes.
3. Build a manifest with hashes, size, mtime, source type, and status.
4. Parse JSONL, JSON, Markdown, text, and HTML exports.
5. Redact secrets, emails, API keys, and tokens.
6. Score spans locally for investment and decision relevance.
7. Downweight code/tool-output-heavy spans.
8. Sample across project, month, source type, and span type.
9. Classify sampled spans into decision episodes.
10. Aggregate recurring patterns.
11. Generate candidate style-vector matches to active master profiles. Treat these as evidence, not a final profile.
12. Generate profile evidence artifacts, report template, draft artifacts, and SQLite source index.
13. As the agent, read `profile_evidence.json` and `profile_synthesis_prompt.md`.
14. Ask 2-5 model-generated interview questions to pin down unobserved dimensions.
15. After answers, synthesize the final profile in chat and write final `profile.json`/`profile.html` from the template.

Run:

```bash
npm run im -- profile-init --output ~/.investment-mirror
```

## Thesis Linting

For `/investment-decision`, parse the user's thesis, decompose assumptions, generate issues, ask research questions, and write a decision review artifact. If no profile exists, clearly label the run as standalone/generic. If a profile exists, use `profile.json`, `guardrails.yaml`, and the best-fit master lens.

Allowed process statuses:

- `draft`
- `needs_clarification`
- `blocked_by_p0_issues`
- `needs_research`
- `ready_for_user_decision`
- `decision_logged`
- `follow_up_due`
- `revisited`
- `abandoned_by_user`

Forbidden as statuses or recommendations:

- `buy`
- `sell`
- `hold`
- `strong buy`
- `strong sell`

## Master Registry

The active v0.2 registry is exactly 30 masters. Every active master must have:

- `research/masters/{master_id}/profile.md`
- `research/masters/{master_id}/sources.yaml`
- `research/masters/{master_id}/style_notes.md`
- `assets/masters/{master_id}.svg`
- style vector entries across all profile dimensions
- guardrail mappings
- read-more URL
- source type and source-quality tier metadata

Do not create annualized return claims or performance rankings unless a source file explicitly supports the precise claim. Current implementation intentionally uses broad source-backed track-record context instead.

## HTML Artifact Style

Design static-first report artifacts with light interactions only. Follow the local Taste-Skill-inspired design direction:

- professional private-banking-meets-developer-tool tone;
- lots of whitespace;
- crisp report typography;
- line-art or halftone master portraits;
- copper/orange accent rules;
- subtle stacked report-card layout;
- source/provenance microcopy;
- no casino/trading-guru aesthetic;
- no purple AI dashboard;
- no dense app shell.

## Validation

Before claiming completion, run:

```bash
npm run validate
```

This runs skill validation, registry completeness checks, unit/integration tests, and evals.
