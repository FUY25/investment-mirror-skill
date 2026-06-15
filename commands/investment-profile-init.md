---
description: Compile local Investment Mirror evidence for the first profile (phase 1; does not write final profile.json/html).
---

# /investment-profile-init

Compile local Investment Mirror evidence for the first profile. This command is phase 1 of the profile workflow. It does not create a profile draft and does not write final `profile.json` or `profile.html`.

First read the investment-mirror skill references for full policy: `skills/investment-mirror/references/pipeline_policy.md` and `skills/investment-mirror/references/profile_lifecycle.md`.

## Run

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" profile-init --output ~/.investment-mirror
```

Optional:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" profile-init \
  --include ~/Obsidian/Investing \
  --exclude ~/private-projects/client-x \
  --output ~/.investment-mirror
```

## Workflow

1. Discover Codex transcripts from `~/.codex/sessions/` and Claude Code transcripts from `~/.claude/projects/`.
2. Add user-specified include paths and apply excludes.
3. Build the source manifest and `source_index.sqlite`.
4. Redact likely secrets before any scoring or extraction.
5. Score spans locally for high-recall search. This is not classification.
6. Downweight code-heavy and tool-output-heavy spans.
7. Include decision-language variants such as `decision`, `decisions`, `decide`, `decides`, `decided`, `deciding`, `option`, `options`, and `optional`.
8. Build the full redacted candidate evidence ledger. Do not reduce it to a subset as the final profile basis.
9. Let deterministic scripts write retrieval/workflow artifacts only: redacted evidence items, source/index files, schema, reference HTML, evidence workbench report, state, guardrail catalog/selection contract, prompt pack, and source index.
10. As the agent/LLM, analyze the full ledger; use subagents when the ledger is too large for one pass.
11. As the agent/LLM, decide which spans matter, which are false positives, which patterns are supported, and what evidence tier each span deserves.
12. As the agent/LLM, generate 2-5 targeted interview questions from evidence gaps. This is not a fixed limited questionnaire.
13. Ask those questions before finalization unless the user explicitly declines.
14. As the agent/LLM, choose the final master lens by reading evidence plus `research/masters/{master_id}/profile.md`, `style_notes.md`, and `sources.yaml`; there are no deterministic candidate master suggestions.
15. Produce a model-synthesized profile JSON matching `profile_finalization_schema.json`.
16. Produce `profile_model_content.json` as structured user-facing final content. It must use the six investment-process dimensions: philosophy, decision-making process, research process, buy/sell discipline, risk process, and repeatability. Do not hand-write raw HTML.
17. Run `/investment-profile-finalize --content profile_model_content.json` so the finalizer can render, validate, and write final `profile.json` and `profile.html`.

If discovery reports **0 sources**, the command returns a `needs_sources` state instead of a master suggestion. Tell the user to add `--include` paths or confirm `~/.codex/sessions` / `~/.claude/projects` contain transcripts, then re-run.

## Outputs

- `profile_candidate_inputs.json`
- `profile_evidence.json`
- `profile_synthesis_prompt.md`
- `profile_finalization_schema.json`
- `profile_report_template.html` as an AI visual reference specimen, not a fill-in template
- `profile_candidate_report.html` as an evidence workbench, not a profile draft
- `profile_state.json`
- `guardrails.yaml`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `source_index.sqlite`
- `source_manifest.json`
- `profile_history/{date}-profile-candidate-inputs.json`
- `profile_history/{date}-profile-candidate-report.html`

Not written by this command:

- `profile.json`
- `profile.html`

## Artifact Rules

The candidate report must say it is not a profile draft. It can show source coverage, retrieval scores, matched retrieval signals, and redacted candidate evidence snippets. It must not show deterministic profile patterns, candidate master suggestions, selected guardrails, confidence, or final profile interpretation.

The agent/LLM final profile must distinguish:

- evidence from local logs;
- model interpretation;
- what the interview clarified;
- what remains uncertain.

The final profile's user-facing interpretation should be a decision-pattern profile, not a one-security review checklist. Use:

- philosophy;
- decision-making process;
- research process;
- buy/sell discipline;
- risk process;
- repeatability.

The final CTA should invite the user to run `/investment-decision` on one concrete thesis with asset/theme, horizon, thesis, current-price expectations, catalyst, falsification or deterioration condition, and constraints/review boundaries.

If the user declines the 2-5 interview questions, generate provisional JSON and provisional structured final content, then use `/investment-profile-finalize --provisional --declined-interview --content profile_model_content.json` and list unknown dimensions. Never infer risk preference, liquidity constraints, horizon, or concentration comfort from logs alone.

## User-Facing Reply

After running only this command, tell the user that evidence compilation is complete and interview/finalization is still pending. Do not describe this as a completed profile. Do not mention tests, evals, or validation output unless the user explicitly asks for engineering validation.
