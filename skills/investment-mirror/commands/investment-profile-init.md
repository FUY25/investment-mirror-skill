# /investment-profile-init

Build the first local Investment Mirror profile.

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
5. Score spans locally before model interpretation.
6. Downweight code-heavy and tool-output-heavy spans.
7. Sample across source type, project, month, and investment/general decision evidence.
8. Classify selected spans into decision episodes.
9. Aggregate recurring decision patterns.
10. Match the user profile to one primary best-fit master and at most one secondary affinity.
11. Generate guardrails, prompt pack, Markdown memory, JSON profile, source index, history, and HTML artifact.

## Outputs

- `profile.json`
- `guardrails.yaml`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `profile.html`
- `source_index.sqlite`
- `profile_history/{date}-profile.json`
- `profile_history/{date}-profile.html`
- `profile.assets/masters/*.svg`

## Artifact Rules

The profile HTML must lead with positive recognition and the best-fit master match. Guardrails should appear after strengths and match rationale under “Guardrails To Make This Style Investable.” Do not open the profile with issues or flaws.
