# /investment-profile-init

Build the first local Investment Mirror profile. This workflow is two-stage:

1. the deterministic program compiles local evidence, candidate patterns, guardrail candidates, source indexes, and a report template;
2. the agent/LLM synthesizes the actual profile, asks the required interview questions, presents the result, and writes the final profile/report.

Do not present deterministic similarity search as the final profile. `profile.json` from the CLI is a draft until the agent updates it with `synthesis_mode: "llm_synthesized"`.

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
4. Redact likely secrets before any classification.
5. Score spans locally before model interpretation. This local scoring is evidence preparation, not the final profile.
6. Downweight code-heavy and tool-output-heavy spans.
7. Sample across source type, project, month, and investment/general decision evidence.
8. Classify selected spans into decision episodes.
9. Aggregate recurring decision patterns.
10. Produce candidate master matches and candidate guardrails as evidence. Similarity scores are inputs only.
11. Generate `profile_evidence.json`, `profile_synthesis_prompt.md`, `profile_report_template.html`, guardrails, prompt pack, Markdown memory, JSON draft, source index, history, and draft HTML.
12. Read `profile_evidence.json` and `profile_synthesis_prompt.md`.
13. Generate 2-5 targeted interview questions from the evidence gaps. The questions must be written by the agent, not copied from a fixed deterministic list.
14. Ask those questions before finalizing. They should pin down unobservable inputs such as risk preference, loss tolerance, horizon, liquidity or personal constraints, concentration comfort, and what counts as enough evidence.
15. After the user answers, synthesize the final profile in chat, update `profile.json` to `synthesis_mode: "llm_synthesized"`, and write final `profile.html` from `profile_report_template.html`.
16. Present next steps, usually offering `/investment-decision` on one current thesis.

## Outputs

- `profile.json`
- `profile_evidence.json`
- `profile_synthesis_prompt.md`
- `profile_report_template.html`
- `guardrails.yaml`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `profile_draft.html`
- `profile.html`
- `source_index.sqlite`
- `profile_history/{date}-profile.json`
- `profile_history/{date}-profile-draft.html`
- `profile.assets/masters/*.svg`

## Artifact Rules

The final model-written profile HTML must lead with positive recognition and the best-fit master match. Guardrails should appear after strengths and match rationale under “Guardrails To Make This Style Investable.” Do not open the profile with issues or flaws.

The final report must distinguish:

- evidence from local logs;
- model interpretation;
- what the short interview clarified;
- what remains uncertain.

If the user declines the 2-5 interview questions, keep the output provisional and say which dimensions remain unknown. Never fill risk preference, liquidity constraints, horizon, or concentration comfort by pretending logs prove them.
