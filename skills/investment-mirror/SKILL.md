---
name: investment-mirror
description: Local-first investment decision profiling and thesis-linting skill. Use when the user asks to initialize, finalize, or update an Investment Mirror profile from local Codex/Claude transcripts or notes, lint an investment thesis without buy/sell advice, generate local profile/decision HTML artifacts, query Investment Mirror memory, or work with /investment-profile-init, /investment-profile-finalize, /investment-profile-update, /investment-decision, or /investment-mirror-ask workflows.
---

# Investment Mirror

Investment Mirror is a local-first investment decision skill. Deterministic scripts are fast evidence tools only: source discovery, manifest/hash, redaction, grep/FTS search, heuristic span scoring, full candidate ledger extraction, candidate pattern counts, candidate master suggestions, schema validation, and artifact scaffolding.

The deterministic program must not write a profile draft, final profile judgment, final master match, or final profile synthesis. It writes `profile_candidate_inputs.json`, `profile_evidence.json`, `profile_synthesis_prompt.md`, `profile_finalization_schema.json`, `profile_report_template.html`, `profile_candidate_report.html`, and `profile_state.json`. Final `profile.json` and `profile.html` are written only by the finalizer after the agent/LLM has produced synthesized JSON and structured final profile content. The finalizer renders `profile.html` from that model-owned content using deterministic layout and safety rules.

Investment Mirror must not provide investment, legal, tax, or financial advice. Never recommend buy, sell, hold, allocation, suitability, or position size. Use process statuses, P0/P1/P2 issues, guardrails, and research questions.

## Commands

The five `/investment-*` workflows are registered as Claude Code plugin commands
in the repo-root `commands/` directory; that registered command is the single
home for each workflow's prose. When a user invokes a workflow, follow the
matching command and the skill references:

- `/investment-profile-init`: then read `references/pipeline_policy.md` and `references/profile_lifecycle.md`.
- `/investment-profile-finalize`: then read `references/profile_lifecycle.md`.
- `/investment-profile-update`: then read `references/pipeline_policy.md` and `references/profile_lifecycle.md`.
- `/investment-decision`: then apply the Core Boundaries below.
- `/investment-mirror-ask`: then read `references/memory_contract.md`.

Executable entry point — a committed plain-node ESM bundle, runnable with
`node` + `python3` only (no `tsx`, no `npm install`, no `node_modules`). Rebuild
with `npm run build:cli` after editing `scripts/investment_mirror_cli.ts` or
`src/*.ts`:

```bash
node scripts/cli.mjs profile-init --output ~/.investment-mirror
node scripts/cli.mjs profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary "..." --content profile_model_content.json --output ~/.investment-mirror
node scripts/cli.mjs profile-update --output ~/.investment-mirror --since 30d
node scripts/cli.mjs decision "I want to buy TSLA because robotaxi could unlock a massive new growth curve." --output ~/.investment-mirror
node scripts/cli.mjs mirror-ask "Which guardrail do I trigger most often?" --output ~/.investment-mirror
```

Inside a Claude Code plugin command, reference the bundle via
`node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs"`.

## Core Boundaries

- Start final profile presentations with positive recognition and the best-fit master match.
- Use one primary master match by default; add one secondary affinity only when evidence supports it.
- Treat deterministic master suggestions as candidate inputs until the agent/LLM interprets receipts and master records.
- `/investment-profile-init` is a multi-phase workflow: deterministic evidence compilation first, then model-owned evidence analysis/question formation/master-profile synthesis/content writing, then `/investment-profile-finalize` validation/render/write.
- Generate 2-5 targeted interview questions from evidence gaps; do not use a fixed limited questionnaire.
- If the user declines interview calibration, finalization must be provisional and list unknown dimensions.
- Do not expose raw transcripts by default; use receipt summaries and local source aliases.
- `/investment-mirror-ask` uses local JSON/SQLite/grep-style retrieval, not RAG or embeddings.
- Default memory answers search profile, decision, source, and receipt summaries only.
- Raw/redacted turn retrieval is allowed only when the user explicitly requests raw local evidence.
- Distinguish evidence from interpretation.
- Keep future masters excluded from the v0.2 completion gate.

## Local Memory

Runtime user memory lives under the output directory, normally `~/.investment-mirror`:

- `profile_candidate_inputs.json`
- `profile_evidence.json`
- `profile_synthesis_prompt.md`
- `profile_finalization_schema.json`
- `profile_report_template.html` (AI visual reference specimen, not a fill-in template)
- `profile_candidate_report.html`
- `profile_state.json`
- `profile.json` and `profile.html` only after `profile-finalize`
- `guardrails.yaml`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `source_index.sqlite`
- `decision_log.jsonl`
- `decisions/*.md`, `decisions/*.json`, `decisions/*.html` (bare lints under `decisions/drafts/`)
- `profile_history/*`
- `.asset_cache/masters/{master_id}.svg` (on-demand portrait cache)

Master portraits are **not** bundled in the shipped skill. They are fetched on
demand at render time from `${INVESTMENT_MIRROR_ASSET_BASE_URL}` (default
`https://raw.githubusercontent.com/FUY25/investment-mirror-skill/main/assets/masters/{master_id}.svg`),
cached under the output dir, and inlined as a `data:` URI so saved HTML stays
self-contained. If a portrait cannot be fetched (offline/sandbox/404), the
master card renders without it — `profile-finalize` and `decision` never fail on
asset resolution.

Generated config and source-of-truth content live in the repo:

- `skills/investment-mirror/config/*.yaml` (validated against runtime; not read at runtime)
- `skills/investment-mirror/references/*.md`
- `research/masters/{master_id}/`
- `assets/masters/{master_id}.svg` (repo-root canonical copies served via raw URL)

The runtime source of truth for active masters is `skills/investment-mirror/src/master_data.ts`; YAML config and research files are validated against it by `npm run validate:registry`.

## References

- Pipeline and deterministic-script boundaries: `references/pipeline_policy.md`
- Profile lifecycle and finalization contract: `references/profile_lifecycle.md`
- Memory query and privacy contract: `references/memory_contract.md`
- Per-platform command registration (Claude Code plugin vs Codex): `references/command_registration.md`
- Master registry source-of-truth contract: `references/master_registry_contract.md`
- Static HTML artifact style: `references/artifact_style.md`
- Source quality tiers: `references/source_quality.md`

## Validation

When you edit the skill code, tests, evals, registry, or scripts, run:

```bash
npm run validate
```

Do not include tests, evals, or validation output in normal user-facing profile completion replies unless the user explicitly asks for engineering validation or a validation failure affects the profile workflow. Profile replies should summarize state, artifacts, evidence/interpretation boundaries, unknown dimensions, and next process step.
