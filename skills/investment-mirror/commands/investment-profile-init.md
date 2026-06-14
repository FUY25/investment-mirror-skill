# /investment-profile-init

Compile local Investment Mirror evidence for the first profile. This command does not create a profile draft and does not write final `profile.json` or `profile.html`.

## Run

```bash
npm run im -- profile-init --output ~/.investment-mirror
```

Optional:

```bash
npm run im -- profile-init \
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
8. Build the full candidate span ledger. Do not reduce it to a subset as the final profile basis.
9. As the agent/LLM, analyze the full ledger and receipts; use subagents when the ledger is too large for one pass.
10. As the agent/LLM, decide which candidate episodes matter, which are false positives, and what evidence tier each deserves.
11. Let deterministic scripts write heuristic pattern counts, candidate guardrails, candidate master suggestions, schema, reference HTML, candidate report, state, guardrails, prompt pack, and source index.
12. As the agent/LLM, generate 2-5 targeted interview questions from evidence gaps. This is not a fixed limited questionnaire.
13. Ask those questions before finalization unless the user explicitly declines.
14. As the agent/LLM, choose the final master lens by reading evidence plus master records; vectors are only suggestions.
15. Produce a model-synthesized profile JSON matching `profile_finalization_schema.json`.
16. Generate final static `profile.html` as the agent/LLM, using `profile_report_template.html` only as a reference specimen.
17. Run `/investment-profile-finalize --html profile_model_generated.html` to validate and write final `profile.json` and `profile.html`.

## Outputs

- `profile_candidate_inputs.json`
- `profile_evidence.json`
- `profile_synthesis_prompt.md`
- `profile_finalization_schema.json`
- `profile_report_template.html` as an AI reference specimen, not a fill-in template
- `profile_candidate_report.html`
- `profile_state.json`
- `guardrails.yaml`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `source_index.sqlite`
- `source_manifest.json`
- `profile_history/{date}-profile-candidate-inputs.json`
- `profile_history/{date}-profile-candidate-report.html`
- `profile.assets/masters/*.svg`

Not written by this command:

- `profile.json`
- `profile.html`

## Artifact Rules

The candidate report must say it is not a profile draft. It can show candidate patterns, candidate master suggestions, candidate guardrails, and receipts.

The agent/LLM final profile must distinguish:

- evidence from local logs;
- model interpretation;
- what the interview clarified;
- what remains uncertain.

If the user declines the 2-5 interview questions, generate provisional JSON and provisional HTML, then use `/investment-profile-finalize --provisional --declined-interview --html profile_model_generated.html` and list unknown dimensions. Never infer risk preference, liquidity constraints, horizon, or concentration comfort from logs alone.
