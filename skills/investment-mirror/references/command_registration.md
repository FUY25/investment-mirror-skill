# Command registration (per platform)

The five `/investment-*` workflows are exposed differently on each host. The
command prose lives in exactly one place per platform to avoid drift.

## Claude Code — real plugin commands (implemented)

This repo is a Claude Code plugin:

- `/.claude-plugin/plugin.json` — plugin manifest.
- `/commands/investment-*.md` — the five registered slash commands. Each is a
  thin wrapper that invokes
  `node "${CLAUDE_PLUGIN_ROOT}/skills/investment-mirror/scripts/cli.mjs" <subcommand>`
  and points at the skill's `references/`.
- `/skills/investment-mirror/` — the skill carried by the same plugin (loaded by
  description, supplies the deep policy in `references/`).

These registered commands are the single home for command prose. The skill does
not duplicate them.

## Codex — open decision (flagged, not invented)

Codex has no exact equivalent of a Claude plugin `commands/` directory with five
independent subcommand registrations. Rather than invent a mechanism, v0.2 uses
the **documented, safe** option:

- The skill is **description-triggered**. The `SKILL.md` `description` enumerates
  the `/investment-*` workflows so Codex routes matching requests to this skill.
- Once triggered, the agent runs the same runtime entry point:
  `node skills/investment-mirror/scripts/cli.mjs <subcommand>`.

**Open question for the user to confirm:** whether Codex should instead register
five thin per-command skill entries (one skill folder per `/investment-*`
command) for deterministic invocation, or keep description-triggering as above.
This is intentionally left for product confirmation; no Codex-specific
multi-command mechanism is fabricated here.
