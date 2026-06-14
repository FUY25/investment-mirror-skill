# Investment Mirror — Engineering Change List

**Status:** ready for implementation · **Source:** skill-creator-lens review of v0.2 · **Date:** 2026-06-14
**Scope:** correctness bugs + cross-platform portability (Codex **and** Claude Code) + skill-creator conformance + on-demand asset delivery.

This is a hand-off list for the Engineer. Each item gives **File(s) / Problem / Change / Why / Done-when**. Do not regress `npm run validate` (11 tests + 14 evals + registry). The current suite is green; keep it green and make it pass on a machine that is **not** this one.

## Decisions locked in review (do not relitigate)
1. **Real slash commands**: register genuine per-platform `/investment-*` commands (not just description-triggering).
2. **Bundled-node runtime**: ship a plain-`node` bundle; do **not** depend on `tsx` / `npm install` at runtime. Keep `.ts` as source.
3. **Assets on demand**: master portraits are **fetched from a URL at render time and cached locally into the artifact** — they are **not** bundled into the shipped skill. Canonical SVGs stay in the repo (served via raw URL); the per-skill duplicate is removed.
4. **Priorities**: correctness → portability → skill-creator conformance (all in scope).
5. **Asset base URL**: `https://raw.githubusercontent.com/FUY25/investment-mirror-skill/main/assets/masters/{master_id}.svg` (make configurable — see C4).

---

## Group A — Correctness bugs

### A1. Ticker parser grabs `"I"` (and any leading capitalized word)
- **File:** `skills/investment-mirror/src/core.ts` (`parseDecision`, ~line 1725)
- **Problem:** `thesis.match(/\b[A-Z]{1,5}\b/)` returns the first 1–5-letter capitalized token. For `"I want to buy TSLA…"` it returns `"I"`. This poisons `asset_or_theme` (the decision `<h1>`), `decision_id`, the slug, and the on-disk filenames (`dec_..._i_i_want_to_buy_tsla...`).
- **Change:** reject stop-words (`I`, `A`); prefer a real ticker heuristic — e.g. an all-caps 2–5 letter token, and/or the capitalized token immediately following a buy/sell/add/trim/hold verb; fall back to a cleaned theme phrase when no plausible ticker exists. Optionally accept `$TSLA` cashtags.
- **Why:** user-visible wrong output on the single most common decision phrasing.
- **Done-when:** `decision "I want to buy TSLA because…"` → ticker `TSLA` (or null), `asset_or_theme` not `"I"`, slug starts `tsla-…`; add a regression test.

### A2. Incremental SQLite index leaves orphaned rows
- **File:** `skills/investment-mirror/scripts/sqlite_bridge.py` (+ caller `writeSqliteIndex`, core.ts ~line 2621)
- **Problem:** `INSERT OR REPLACE` only overwrites matching `turn_id`s and never deletes turns that disappeared when a file shrank. Because `turns.rowid` is autoincrement, replaced turns get a **new** rowid, orphaning the old external-content FTS5 posting. DB bloats; stale snippets possible over repeated reindexes.
- **Change:** before reinserting a changed source, `DELETE FROM turns WHERE source_id=?` and issue a proper FTS5 delete (`INSERT INTO turns_fts(turns_fts,'delete',…)`) or rebuild the FTS for affected rows. Apply the same delete-then-insert to `candidate_spans`/`decision_episodes` for that source.
- **Why:** correctness + size of the incremental index, which is the whole point of the pipeline at scale.
- **Done-when:** reindexing a source that went from N→M (M<N) turns leaves exactly M rows for it; FTS row count matches `turns` row count.

### A3. `/investment-decision` writes 3 files on every invocation
- **File:** `skills/investment-mirror/src/core.ts` (`writeDecisionArtifacts`, ~line 1993)
- **Problem:** `.html/.md/.json` are written into `decisions/` on every lint, including pre-decision standalone mode. Only the `decision_log.jsonl` / `InvestmentMirror.md` append is gated by `--write-log`. Repeated lints clutter `decisions/`.
- **Change:** gate the per-decision file writes behind an explicit flag (reuse `--write-log` or add `--save`), or write drafts to a `decisions/drafts/` area and only promote on save.
- **Why:** keeps the decision log meaningful; avoids artifact spam.
- **Done-when:** a bare `decision "…"` (no save flag) produces the in-memory review + stdout but does not litter `decisions/`.

### A4. Zero sources → silent fallback master
- **File:** `skills/investment-mirror/src/core.ts` (`generateInvestorProfile` / `fallbackMasterMatch`, ~line 1619)
- **Problem:** when discovery finds 0 sources, it emits a default Philip Fisher candidate from an empty vector with no signal to the user.
- **Change:** when `sources.length === 0`, surface an explicit "0 sources discovered — add `--include` paths or check `~/.codex/sessions` / `~/.claude/projects`" state instead of a fabricated candidate match.
- **Why:** avoids presenting noise as evidence; matches the evidence-first product stance.
- **Done-when:** zero-source init returns a clearly-labeled empty/needs-input state, not a master suggestion.

---

## Group B — Cross-platform portability

### B1. Ship a bundled-node runtime; drop the `tsx` runtime dependency
- **Files:** `package.json`, `skills/investment-mirror/scripts/*`, all command docs + `SKILL.md`
- **Problem:** runtime entry is `npm run im` (repo-root only) and execution is via `tsx` (a dev dep needing `npm install`). A standalone-installed skill folder has none of these.
- **Change:** add a build step (esbuild `--bundle --platform=node --format=esm`, node built-ins external) that compiles `scripts/investment_mirror_cli.ts` + `src/core.ts` + the `yaml` dep into a committed `skills/investment-mirror/scripts/cli.mjs`. Replace `npm run im --` everywhere with `node "<skill-dir>/scripts/cli.mjs"`. Keep `.ts` as source; commit the bundle (or build on release). Runtime deps become **node + python3 only**.
- **Why:** makes the skill self-contained and runnable on both Codex and Claude Code without a JS toolchain.
- **Done-when:** copying only `skills/investment-mirror/` to a clean dir and running `node scripts/cli.mjs help` works with no `node_modules` and no `tsx`.

### B2. `validate:skill` hardcodes a machine-specific Codex path
- **File:** `package.json`
- **Problem:** `python3 /Users/fuyuming/.codex/skills/.system/skill-creator/scripts/quick_validate.py …` fails on any other machine, including Claude Code (skill-creator lives elsewhere there). `npm run validate` dies at step 1.
- **Change:** resolve the validator via `${CODEX_HOME:-$HOME/.codex}` and/or a small lookup across known locations; skip with a warning if absent rather than hard-failing. Do not assume one absolute path.
- **Why:** the skill is explicitly cross-platform; validation must run anywhere.
- **Done-when:** `npm run validate` passes on a machine without that exact path.

### B3. Register real `/investment-*` slash commands per platform
- **Files:** new platform command surfaces; existing `skills/investment-mirror/commands/*.md` become the source content
- **Problem:** the 5 commands are only conventions today; the in-skill `commands/*.md` are not registered.
- **Change:**
  - **Claude Code:** package as a plugin and declare the 5 commands in the plugin's `commands/` location (each a thin command that invokes `node scripts/cli.mjs <subcommand>` and points at the matching reference). One artifact also carries the skill.
  - **Codex:** Codex has no exact 5-subcommand registration; either add thin per-command skill entries or keep description-triggering + the command docs. **Confirm the intended Codex command mechanism before wiring** (open question flagged in review).
  - Keep each command's prose in **one** home (the registered command), not duplicated inside the skill.
- **Why:** deterministic invocation instead of relying on description matching.
- **Done-when:** `/investment-profile-init` etc. invoke the right flow on Claude Code via the plugin; Codex path documented/decided.

### B4. Discovery re-hashes every file on every run
- **File:** `skills/investment-mirror/src/core.ts` (`discoverSources`, ~lines 463–467)
- **Problem:** `hashFile()` (full read) runs for **all** discovered files unconditionally, even ones it then marks `unchanged`. At "thousands of transcripts" scale this reads every byte every run — defeating the incremental performance goal (spec §6.5/§6.14).
- **Change:** short-circuit on unchanged `mtime` + `size` from the prior manifest; only compute sha256 when mtime/size differ or on `--reindex`.
- **Why:** this is the headline scalability promise.
- **Done-when:** a second run over an unchanged corpus performs no full-file reads for unchanged files (verify via timing or an I/O counter on a large fixture).

### B5. Self-ingestion guard
- **File:** `skills/investment-mirror/src/core.ts` (`discoverSources` / `walkFiles`)
- **Problem:** discovery walks `~/.claude/projects`, which can include this skill's own memory/test outputs and prior IM artifacts → feedback loop.
- **Change:** default-exclude the IM output dir (`~/.investment-mirror`) and the skill repo path from discovery.
- **Why:** prevents the profiler from ingesting its own outputs.
- **Done-when:** IM output/repo paths never appear in `source_manifest.json`.

---

## Group C — Asset delivery: on-demand fetch from URL (NEW)

> Goal: the **shipped skill** carries no portrait bytes; portraits are **fetched at render time from the repo raw URL and cached into the artifact**, so saved HTML stays self-contained while the skill stays small. Local-first core flows must never break when offline.

### C1. Fetch-at-render + local cache
- **Files:** `skills/investment-mirror/src/core.ts` (`findMasterAsset`, `copyMasterAssets`, `copyDecisionAssets`)
- **Change:** replace local-file lookup/copy with `resolveMasterAsset(masterId)` that:
  1. checks a local cache (`<outputDir>/.asset_cache/masters/{id}.svg`);
  2. on miss, fetches `${BASE_URL}/{id}.svg` via global `fetch` (node 22), writes to cache;
  3. writes the bytes into the artifact's `profile.assets/masters/{id}.svg` (decisions: `<decision>.assets/masters/{id}.svg`) so HTML keeps its current **relative** `<img src>`.
  - Only the 1–2 matched masters per artifact are fetched.
  - *(Optional, nicer for "save & share":* inline the SVG as a `data:` URI directly in the HTML so the artifact is a single self-contained file with no sidecar `.assets` dir. Acceptable size (~80–110 KB/portrait). Decide one approach.)*
- **Why:** implements the on-demand model; keeps rendered artifacts portable.
- **Done-when:** with an empty cache and network, finalize/decision produce artifacts whose portrait renders; second render uses cache (no refetch).

### C2. Graceful offline / sandbox fallback
- **File:** same as C1
- **Change:** if fetch fails (offline, sandbox, 404), **do not throw** — render the master card without the `<img>` (or a neutral inline placeholder) and continue. Log a soft note. `profile-finalize` and `decision` must complete offline.
- **Why:** preserves the local-first guarantee for the core flows even though assets are remote.
- **Done-when:** running finalize/decision with no network still writes valid `profile.html` / decision HTML (portrait omitted, no crash, validators still pass).

### C3. Remove bundled SVGs from the shipped skill; keep canonical in repo; dedupe
- **Files:** delete `skills/investment-mirror/assets/masters/*.svg`; keep canonical at repo-root `assets/masters/*.svg` (this is what the raw URL serves)
- **Problem:** today there are **two** copies (repo-root + in-skill), ~2.4 MB each, and the in-skill copy is what we're eliminating.
- **Change:** remove the in-skill `assets/masters/` SVGs; keep repo-root `assets/masters/` as the served source of truth. Update any path references / `SKILL.md` "Local Memory" asset bullets accordingly. (`findMasterAsset`'s repoRoot/skillRoot fallback is replaced by C1's resolver.)
- **Why:** the shipped skill should not carry portrait bytes; eliminate duplication (skill-creator).
- **Done-when:** shipped skill folder contains no master SVGs; raw URL serves them from `main`; renders still work.

### C4. Configurable asset base URL
- **File:** `skills/investment-mirror/src/core.ts` (new constant) + optional `photo_sources.yaml`
- **Change:** base URL constant defaulting to `https://raw.githubusercontent.com/FUY25/investment-mirror-skill/main/assets/masters`, overridable via `INVESTMENT_MIRROR_ASSET_BASE_URL`. Optionally validate `{id}` against `photo_sources.yaml`.
- **Why:** survives repo renames/forks/release-pinning; testability (point at a local `file://` fixture).
- **Done-when:** setting the env var redirects fetches; default works against the live repo.

### C5. Make tests offline-safe
- **Files:** `tests/investment_mirror.test.ts`, evals if they assert asset copy
- **Change:** tests must not require network. Inject the asset resolver or point `INVESTMENT_MIRROR_ASSET_BASE_URL` at a local `file://` fixture (a couple of small SVGs under a test fixtures dir), or assert the graceful-fallback path. Update any assertions that expected a bundled-file copy.
- **Why:** CI / sandbox must stay deterministic and offline.
- **Done-when:** `npm test` passes with no network.

---

## Group D — Skill-creator conformance

### D1. One home for command prose
- **Files:** `skills/investment-mirror/commands/*.md` vs registered commands (B3)
- **Change:** keep each command's instructions in the registered command only; don't duplicate the same prose in the skill folder. If retained in-skill, demote to `references/` and link from the command.
- **Done-when:** no duplicated command text across two locations.

### D2. Consolidate thin wrapper scripts
- **Files:** `skills/investment-mirror/scripts/{generate_investor_profile,discover_sources,render_profile_html,score_decision_spans,match_master_styles,...}.ts`
- **Problem:** they re-implement argv parsing and duplicate the CLI; not referenced by `SKILL.md`/`package.json`.
- **Change:** either fold into the single CLI (subcommands) or explicitly document them as the spec's per-phase entrypoints in `references/pipeline_policy.md`. Avoid drift with `core.ts`.
- **Done-when:** one clear runtime entry; any kept wrappers are documented and tested.

### D3. Config-vs-runtime banner
- **Files:** `skills/investment-mirror/config/*.yaml`
- **Problem:** the 8 YAML configs are **not** read at runtime (truth is `src/master_data.ts`; YAML is only validated against it). Easy to edit YAML expecting effect.
- **Change:** add a one-line header to each: "Validated against src/master_data.ts; not read at runtime."
- **Done-when:** each config states its role.

### D4. Tighten `detectPatterns`
- **File:** `skills/investment-mirror/src/core.ts` (~line 728)
- **Problem:** `thesis_first_reasoning` fires on `market|ai|because|why|…`, so it's near-constant and carries little signal as the deterministic "primary pattern."
- **Change:** require stronger co-occurrence (e.g. thesis/idea + forward-claim + minimal evidence terms) before emitting; treat as a candidate hint only.
- **Done-when:** pattern no longer fires on generic prose; evals still pass.

### D5. Prune dead asset metadata path
- **File:** `skills/investment-mirror/assets/masters/photo_sources.yaml`
- **Problem:** references an `imagegen_sheets/` dir that isn't shipped.
- **Change:** remove the dead `generated_sheet_path`/`sheet_position` fields or document them as provenance-only; align with the new fetch-from-URL model.
- **Done-when:** no references to non-existent local paths.

---

## Acceptance (whole change set)
- `npm run validate` passes on a machine **without** the hardcoded Codex path, **offline**.
- A standalone-copied `skills/investment-mirror/` runs via `node scripts/cli.mjs …` with no `node_modules` / `tsx`.
- `profile-finalize` and `decision` complete **offline** (portrait gracefully omitted) and **online** (portrait fetched once, then cached).
- Shipped skill folder contains **no** master SVG bytes; portraits resolve from the configured URL.
- No duplicate asset trees; `decision "I want to buy TSLA…"` yields ticker `TSLA`, not `"I"`.
