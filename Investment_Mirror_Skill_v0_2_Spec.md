# Investment Mirror Skill v0.2 Spec

**Working name:** Investment Mirror Skill  
**Core command family:** `investment-*`  
**Product type:** Local-first agent skill product repo  
**Version:** v0.2 draft  
**Last updated:** 2026-06-13  
**Major v0.2 changes:**

1. Add **Best-Fit Master Match / Style Avatar** to `/investment-profile-init`.
2. Add a high-scale transcript ingestion pipeline for thousands of Codex and Claude Code transcripts.
3. Remove automation from v0.1 entirely; no automation command or scheduler in v0.2.
4. Clarify that `/investment-decision` is not just pre-buy. It is an interactive guided research routine that turns a thesis into issues, questions, guardrails, and eventually a decision log.
5. Add a phase plan that prioritizes master research, master visual assets, style profiles, issue taxonomy, then skill implementation and eval.
6. Add HTML artifact design direction using a Taste-Skill-style design pass for a professional, sleek, non-generic artifact.
7. Lock v0.2 scope to the skill product. MCP server/tool implementation is out of scope for this version.

---

## 0. Product one-liner

**Investment Mirror Skill is a local-first investment decision skill that analyzes a user’s transcripts, notes, and decision logs to build a personal investment profile, then uses that profile to turn every future investment thesis into structured issues, research questions, guardrails, and a decision record.**

It does **not** tell users what to buy. It helps users see **how they tend to make investment decisions**, what issues repeatedly appear in their reasoning, and what personal guardrails should be applied before they act.

The emotional aha:

> “It is not only analyzing TSLA / NVDA / PLTR. It is analyzing the way I analyze TSLA / NVDA / PLTR.”

The functional aha:

> “My thesis now gets linted like code: unresolved assumptions become issues, and my own recurring patterns trigger guardrails.”

---

## 1. Core product thesis

Most retail investment tools analyze the security. Investment Mirror analyzes the investor’s decision process.

The product should feel like a mix of:

- a **code linter** for investment theses;
- a **decision mirror** that shows the user’s recurring decision patterns;
- a **decision journal** that remembers every investment decision;
- a **personal guardrail system** that knows the user’s recurring issues;
- a **master-style learning map** that identifies the investor whose decision style best fits the user and explains why the match is useful;
- a **professional HTML artifact generator** that makes the result feel credible, beautiful, and worth saving;
- a **local-first skill** that can run over sensitive transcripts without requiring raw conversations to be uploaded to a SaaS.

---

## 2. Product principles

### 2.1 No investment recommendation

The skill must not output direct personalized investment advice such as:

- “Buy this.”
- “Sell this.”
- “Hold this.”
- “Allocate 20% to this stock.”
- “This stock is suitable for you.”

Allowed outputs:

- “This thesis has unresolved P0 issues.”
- “This decision is not research-ready yet.”
- “Your profile suggests you should check valuation expectations before acting.”
- “You have not defined what evidence would falsify this thesis.”
- “Here is a decision log entry summarizing what you decided and why.”

### 2.2 Issue, not mistake

Use **issue** language, not personal failure language.

Bad:

> “Your mistake is that you chase narratives.”

Better:

> “Repeated issue: narrative-to-action jump. You often move from ‘the trend is real’ to ‘this may be investable’ before explicitly checking valuation, value capture, and falsification conditions.”

Use issue language primarily in `/investment-decision`, where the artifact behaves like a thesis linter with P0/P1/P2 findings. In `profile.html`, avoid making "issues" the main section label. The profile artifact should frame recurring patterns as **guardrails that make this style investable**.

### 2.3 Guardrail, not judgment

The skill should not shame the user. It should install a protocol:

> “When this pattern appears, run this guardrail.”

Profile artifacts should use a roughly **60% positive recognition / 40% guardrail discipline** tone. Start by naming what the user does well and why the best-fit master match is credible. Then explain which guardrails make that style more investable. Do not open with flaws, default issues, or blocker language; also do not flatter without evidence.

### 2.4 Best-fit master match, plus guardrails

v0.2 explicitly keeps the **cosplay / style avatar** aha.

The profile artifact should show:

1. **Best-Fit Master Match** — one or two investors whose decision styles best match the user's observed pattern. Show one primary match by default; add a secondary match only when evidence strongly supports it.
2. **Positive Match Explanation** — why the match is admirable or useful before showing issues.
3. **Master Profile Card** — concise biography, investment style, notable results or track record, what to learn, and a read-more link.
4. **Relevant Guardrails** — rules the user should apply based on their own patterns, not framed as needing other masters to correct the match.
5. **False Match Warning** — what the user should *not* copy from the matched master.

If a second master appears, it is a **secondary affinity**, not a guardrail or corrective master. It should explain another strongly evidenced side of the user's style, such as product intuition, value discipline, or macro sensitivity. Guardrails remain a separate layer.

Do not say:

> “You are Warren Buffett.”

Say:

> “Your primary best-fit master match is closer to Philip Fisher: thesis-first, business-quality oriented, long-horizon, and comfortable with qualitative judgment. This is a strong match because your best reasoning starts from business quality and durable growth. Your guardrails should make that style more investable by forcing valuation expectations, falsification conditions, and value-capture checks.”

The user should feel seen, but the product must avoid turning the output into astrology or authority worship.

### 2.5 HTML is the artifact, not the memory

Every important output should have a polished HTML artifact, but the true long-term product memory is stored in:

- `profile.json`
- `guardrails.yaml`
- `decision_log.jsonl`
- `InvestmentMirror.md`
- per-decision `.json` and `.md` files

Visual assets used to render HTML artifacts are product assets, not user memory. Master portraits and similar reusable artifact assets should live in the Investment Mirror skill product repository. When generating a specific HTML artifact, the renderer should pull or read only the needed repo assets and copy them into the local artifact output area.

### 2.6 Local-first by default

Raw transcripts may contain code, private projects, API keys, business ideas, and personal information. v0.2 assumes local processing by default.

The hosted product, if built later, should sync only user-approved summaries, profiles, decision logs, and artifacts—not raw transcripts unless explicitly opted in.

### 2.7 Development transcripts are useful, but noisy

Codex and Claude Code transcripts may be mostly about coding. That is not a problem. Coding transcripts can still reveal decision-making patterns:

- how the user handles uncertainty;
- whether they over-research or act quickly;
- whether they prefer frameworks, experiments, benchmarks, or authority;
- how they debug failed hypotheses;
- whether they ask for trade-off analysis;
- whether they keep changing scope;
- whether they converge on decision rules.

But the skill must not treat every coding transcript as investment evidence. It needs a scalable extraction pipeline that separates **general decision episodes** from **investment-specific episodes**.

---

## 3. Target users

### 3.1 Primary user

A serious retail investor or builder-investor who:

- uses Codex and Claude Code heavily, with future support possible for other agent transcript sources;
- thinks through companies, industries, startups, AI, and markets in conversation;
- has investment ideas but wants more discipline;
- is intellectually curious but may over-research, over-narrativize, or over-abstract;
- wants a local-first tool that helps them become more rational without outsourcing judgment.

### 3.2 Secondary user

A power user who wants to integrate personal decision guardrails into an existing agent workflow:

- research agent;
- stock analysis agent;
- investment memo tool;
- Obsidian / Notion knowledge base;
- local agent ecosystem.

---

## 4. Non-goals for v0.2

v0.2 explicitly does **not** include:

- brokerage integration;
- trade execution;
- automated alerts;
- scheduled automation;
- portfolio optimization;
- real-time market data;
- investment recommendations;
- legal/tax/financial advice;
- raw transcript cloud upload by default;
- ChatGPT export adapter;
- Cursor transcript adapter;
- social network / community features;
- a separate `/automation` command.
- MCP server or MCP tool implementation.
- hosted cloud sync or cloud profile storage.

The user rejected automation. Therefore v0.2 should not include automation proposal, automation routines, schedulers, or trigger setup.

---

## 5. Command interface

All user-facing commands use the `investment-` prefix.

### 5.1 `/investment-profile-init`

Initializes the user’s Investment Mirror.

#### Purpose

Build the first investor decision profile from automatically discovered local transcripts, notes, and optional investment examples.

`/investment-profile-init` is the full product onboarding path, not a quick profile shortcut. It must attempt to automatically discover Codex and Claude Code transcripts on the user's machine before asking the user to provide manual source paths. The user may add, remove, or exclude sources, but a first-run demo should not depend on the user already knowing where agent transcripts live.

#### Inputs

```bash
/investment-profile-init --output "~/.investment-mirror"
```

Optional overrides:

```bash
/investment-profile-init \
  --include "~/Obsidian/Investing" "~/Downloads/chatgpt_export" \
  --exclude "~/private-projects/client-x" \
  --output "~/.investment-mirror"
```

Supported v0.2 input types:

- Markdown files;
- plain text files;
- JSONL transcript files;
- automatically discovered Codex transcript directories;
- automatically discovered Claude Code transcript directories;
- user-specified additional transcript / notes directories;
- manually pasted investment ideas;
- optional prior decision examples.

Do not hard-code fragile vendor paths as the only path. Use known local app data locations as automatic discovery candidates, verify that expected files exist, and allow user overrides. Discovery must be adapter-based and version-tolerant because vendors can change storage layouts.

#### Required flow

1. Discover and index sources.
2. Redact likely secrets and sensitive tokens.
3. Build a local source manifest with hashes and modification times.
4. Skip unchanged files from previous runs.
5. Parse transcript formats into turns.
6. Score and filter decision-relevant spans without using an LLM first.
7. Segment candidate spans into decision episodes.
8. Classify top candidate episodes using the model.
9. Aggregate recurring decision patterns.
10. Map the profile to style dimensions and master archetypes.
11. Generate best-fit master match, style explanation, and guardrail recommendations.
12. Estimate confidence.
13. If confidence is insufficient, run calibration interview.
14. Generate profile artifacts.
15. Initialize local Investment Mirror file structure.

---

## 6. High-scale transcript ingestion design

This is the most important technical update in v0.2.

The user may have **thousands of Codex / Claude Code transcripts**. The skill must not naively feed everything into a model. It needs a local-first, incremental, multi-stage extraction pipeline.

### 6.1 Design goals

- Process thousands of transcript files without exploding model cost.
- Extract decision-making patterns from both investment and non-investment conversations.
- Avoid over-weighting one project or one week of intense coding sessions.
- Keep raw transcripts local.
- Store only summaries and source traces by default.
- Make profile updates incremental.
- Make every profile claim traceable to local evidence summaries.

### 6.2 Pipeline overview

```text
Raw sources
  ↓
Source discovery
  ↓
Manifest + hash index
  ↓
Format adapters
  ↓
Turn-level parsing
  ↓
Secret redaction
  ↓
Cheap deterministic candidate scoring
  ↓
SQLite FTS index + metadata index
  ↓
Diversity sampling
  ↓
LLM classification of top spans only
  ↓
Episode extraction
  ↓
Pattern aggregation
  ↓
Profile + master style matching
  ↓
Calibration interview if needed
```

### 6.3 Scripts to add

```text
scripts/
  discover_sources.ts
  build_source_manifest.ts
  parse_transcript_adapters.ts
  redact_sensitive.ts
  build_transcript_index.ts
  score_decision_spans.ts
  sample_candidate_episodes.ts
  classify_decision_episodes.ts
  aggregate_decision_patterns.ts
  match_master_styles.ts
  run_calibration_interview.ts
  generate_investor_profile.ts
```

### 6.4 Source discovery

Use automatic local source discovery first, then apply user-provided include/exclude paths. v0.2 must include built-in discoverers for Codex and Claude Code transcripts.

Primary discovery candidates:

```text
~/.codex/sessions/
~/.claude/projects/
```

Secondary / optional discovery candidates:

```text
user-provided notes directories
user-provided Markdown / text / JSONL transcript directories
```

Discovery should recursively detect likely transcript files, including JSONL session files and exported Markdown / HTML / JSON files. It should not assume every file under these directories is decision evidence; source discovery only finds candidate files. Later parsing, redaction, scoring, and sampling decide whether content becomes evidence.

Before indexing, show a source summary with counts by source type, estimated size, date range, and top-level project/path groups. Let the user exclude paths, but make the default action continue to the full indexing pipeline. The product should feel like automatic full use with a privacy checkpoint, not a manual source-configuration workflow.

Discovery should produce:

```json
{
  "source_id": "src_001",
  "path": "/Users/user/.codex/sessions/2026/06/session.jsonl",
  "source_type": "codex_jsonl",
  "size_bytes": 923484,
  "modified_at": "2026-06-13T09:22:00Z",
  "sha256": "...",
  "status": "new"
}
```

### 6.5 Manifest and incremental indexing

Store source metadata in `source_index.sqlite`.

Skip a file when:

- path hash exists;
- modification time unchanged;
- size unchanged;
- content hash unchanged.

Reprocess a file when:

- content hash changes;
- parser version changes;
- scoring rubric version changes;
- user explicitly requests `--reindex`.

### 6.6 SQLite schema

```sql
CREATE TABLE sources (
  source_id TEXT PRIMARY KEY,
  path_hash TEXT NOT NULL,
  path_display TEXT,
  source_type TEXT,
  size_bytes INTEGER,
  modified_at TEXT,
  sha256 TEXT,
  parser_version TEXT,
  indexed_at TEXT,
  sensitivity_level TEXT DEFAULT 'unknown'
);

CREATE TABLE turns (
  turn_id TEXT PRIMARY KEY,
  source_id TEXT,
  turn_index INTEGER,
  role TEXT,
  timestamp TEXT,
  text_redacted TEXT,
  token_estimate INTEGER,
  code_density REAL,
  decision_score REAL,
  investment_score REAL,
  FOREIGN KEY(source_id) REFERENCES sources(source_id)
);

CREATE VIRTUAL TABLE turns_fts USING fts5(
  text_redacted,
  content='turns',
  content_rowid='rowid'
);

CREATE TABLE candidate_spans (
  span_id TEXT PRIMARY KEY,
  source_id TEXT,
  start_turn INTEGER,
  end_turn INTEGER,
  span_type TEXT,
  score REAL,
  reason_codes TEXT,
  sampled BOOLEAN DEFAULT 0
);

CREATE TABLE decision_episodes (
  episode_id TEXT PRIMARY KEY,
  span_id TEXT,
  episode_type TEXT,
  summary TEXT,
  patterns_json TEXT,
  confidence REAL,
  evidence_summary TEXT,
  created_at TEXT
);
```

### 6.7 Deterministic candidate scoring

Do not call an LLM on every transcript. First score spans locally.

#### Investment term signals

English examples:

```text
stock, equity, ticker, buy, sell, add, trim, hold, portfolio, valuation, DCF,
multiple, revenue growth, margin, moat, market, thesis, catalyst, risk,
position, allocation, compounder, drawdown, earnings, guidance, analyst
```

Chinese examples:

```text
股票, 买入, 卖出, 加仓, 减仓, 持仓, 组合, 估值, 增长, 利润率,
护城河, 投资逻辑, 催化剂, 风险, 仓位, 回撤, 财报, 指引, 研报
```

#### General decision-making signals

These are useful in coding transcripts:

```text
decide, decision, tradeoff, trade-off, constraint, hypothesis, uncertainty,
risk, option, alternative, why, because, assumption, evidence, benchmark,
compare, choose, reject, converge, test, experiment, priority, strategy,
should I, pros and cons, criteria, rule
```

Chinese examples:

```text
选择, 取舍, 假设, 不确定性, 风险, 证据, 对比, 判断, 方案,
优先级, 策略, 标准, 规则, 要不要, 为什么, 因为, 验证, 实验
```

#### Negative / downweight signals

Downweight spans dominated by:

- generated code blocks;
- stack traces;
- package installation logs;
- file diffs;
- tool output with low user reasoning content;
- long model-generated boilerplate;
- repeated build/test failure logs.

A simple first-pass score:

```text
decision_relevance_score =
  2.0 * investment_signal_score
+ 1.2 * general_decision_signal_score
+ 1.0 * epistemic_signal_score
+ 0.8 * action_language_score
- 1.5 * code_density_score
- 1.0 * tool_output_density_score
```

### 6.8 Episode segmentation

Candidate spans should include enough context around the match:

```text
span = matched_turn ± N turns
```

Default:

- `N = 2` for dense investment transcripts;
- `N = 4` for coding transcripts where reasoning may be spread out;
- cap span at an estimated 1,500–2,500 tokens before LLM classification.

### 6.9 Diversity sampling

Avoid one project or one week dominating the profile.

Sample candidate episodes across:

- source type;
- project / repository;
- month;
- topic cluster;
- investment vs non-investment decision episodes;
- high-score and medium-score spans.

Default sampling rule:

```text
max 10 episodes per project per month
max 5 near-duplicate episodes per repeated topic
always include top investment-specific episodes
always include a sample of general decision-making episodes
```

### 6.10 LLM classification only after filtering

The LLM should classify only candidate spans selected after local scoring and sampling.

For each span, output:

```json
{
  "is_decision_relevant": true,
  "episode_type": "general_decision_reasoning | investment_reasoning | research_process | execution_tradeoff | not_relevant",
  "summary": "User compares speed vs correctness and asks for a stricter decision rule before proceeding.",
  "patterns": ["research_loop_extension", "criteria_seeking"],
  "investment_transferability": "medium",
  "evidence_strength": "medium_high",
  "sensitivity": "low | medium | high",
  "receipt_summary": "Summarized evidence without raw private quote."
}
```

### 6.11 Profile evidence tiers

Profile claims should be backed by evidence tiers:

| Tier | Evidence type | Use |
|---|---|---|
| Tier 1 | Direct investment decisions / notes | Strongest profile evidence |
| Tier 2 | Investment-related conversations | Strong evidence |
| Tier 3 | General decision-making in coding/building transcripts | Useful but indirect |
| Tier 4 | Calibration interview answers | Useful for self-report and psychology |
| Tier 5 | Inferred style from weak evidence | Use cautiously |

If the profile relies heavily on Tier 3 or Tier 4, show a lower confidence score and explain that the profile is provisional.

### 6.12 Calibration interview triggers

Run interview when:

- fewer than 8 high-confidence decision episodes are found;
- fewer than 3 investment-specific episodes are found;
- top patterns conflict with each other;
- master match confidence is below threshold;
- user’s transcripts are mostly coding/tool logs;
- profile depends mostly on general decision-making rather than actual investment reasoning.

### 6.13 Calibration interview question bank

Ask 5–8 high-information questions. Do not ask a long personality-test battery.

Examples:

1. When you miss a big winner, do you feel more pain than when you buy a loser?
2. When a stock you own is flat for 12 months but the thesis is unchanged, what do you usually do?
3. Are you more often too early, too late, too concentrated, or too hesitant?
4. When you like a company, do you first check price expectations or first deepen the narrative?
5. What was one investment where your reasoning was right but the outcome was poor?
6. What was one investment where the outcome was good but your reasoning was weak?
7. Do you usually sell because the thesis changed, the price moved, or your emotions changed?
8. Are you more likely to over-research, or act before defining enough evidence?
9. Do you prefer companies, macro regimes, quantitative signals, special situations, or founder/product stories?
10. What kind of investment idea repeatedly attracts you even when you know you should be careful?

### 6.14 Performance target

v0.2 implementation target, not a hard product promise:

- thousands of local files can be indexed incrementally;
- unchanged files are skipped;
- local scoring runs before model calls;
- LLM classification is capped by candidate sampling budget;
- profile generation can work even when only a subset of transcripts is classified.

---

## 7. `/investment-profile-init` outputs

```text
~/.investment-mirror/
  InvestmentMirror.md
  profile.json
  guardrails.yaml
  prompt_pack.md
  profile.html
  source_index.sqlite
  profile_history/
    2026-06-13-profile.json
    2026-06-13-profile.html
```

### 7.1 Required profile HTML sections

1. **Hero**
   - Product title: Investment Mirror
   - User profile title
   - Confidence level
   - Positive one-line summary of the user's strongest decision pattern
   - Primary Best-Fit Master Match line-art or dot-art portrait
   - Optional secondary match only when confidence supports it
   - Short "why you match" statement

2. **Best-Fit Master Match / Style Avatar**
   - 1–2 master cards maximum
   - One primary match is required
   - One secondary affinity match is allowed only when evidence strongly supports it
   - The secondary match must not be framed as a corrective or guardrail master
   - Master name
   - Similarity score
   - Why this match appears
   - Short biography / context
   - Investment style
   - Notable results, track record, or representative achievements where source-backed
   - What to learn from this master
   - What not to copy
   - Read-more link, usually Wikipedia or a high-quality source

3. **Why This Match Is Good**
   - Start with praise and strengths
   - Explain what the user's observed behavior does well
   - Avoid opening the artifact with issues, flaws, or warnings

4. **Decision Fingerprint**
   - Narrative sensitivity
   - valuation discipline
   - evidence threshold
   - research-loop tendency
   - contrarian impulse
   - falsifiability discipline
   - risk protocol maturity
   - time horizon clarity
   - product/founder bias
   - macro/regime sensitivity

5. **Primary Patterns**
   - Pattern title
   - Evidence summary
   - Strength interpretation
   - Investment risk
   - Guardrail to install

6. **Receipts**
   - Transcript-derived evidence summaries
   - No sensitive raw quotes by default
   - Each receipt includes local source alias and date

7. **Required Guardrails**
   - Guardrail name
   - Trigger
   - Required questions
   - How it appears in `/investment-decision`
   - Recommended section title: “Guardrails To Make This Style Investable”
   - Avoid framing guardrails as other masters correcting the best-fit master

8. **Prompt Pack Preview**
   - 3–5 personalized prompts

9. **Local Memory Initialized**
   - Path to `InvestmentMirror.md`
   - Number of decision episodes indexed
   - Number of active guardrails

---

## 8. `/investment-profile-update`

Updates the existing profile using new transcripts and decision logs.

### Purpose

Make the profile dynamic. The user should improve over time.

### Inputs

```bash
/investment-profile-update --since 30d
```

or:

```bash
/investment-profile-update --sources "~/new_transcripts" --since 2026-05-01
```

### Flow

1. Load existing `profile.json`, `guardrails.yaml`, and `decision_log.jsonl`.
2. Run incremental source indexing.
3. Scan only new or changed transcripts.
4. Extract new candidate episodes.
5. Classify sampled candidate episodes.
6. Compare recent patterns vs historical baseline.
7. Update best-fit master match and recommended guardrails if evidence changed.
8. Update profile confidence.
9. Add or modify guardrails only when supported by evidence.
10. Generate updated HTML report.

### Must show

- newly detected patterns;
- strengthened patterns;
- weakened patterns;
- guardrails triggered most often;
- best-fit master match changes;
- areas of improvement;
- areas needing attention.

---

## 9. `/investment-decision`

The core interactive thesis-linting and guided research routine.

### Purpose

Take a user’s investment idea and turn it into:

- thesis decomposition;
- personalized issues;
- guardrails triggered;
- research questions;
- required evidence;
- optional decision log;
- HTML decision review artifact.

This is more than a linter. It should actively guide the user through research and thinking before a decision is logged.

`/investment-decision` has two valid product modes:

1. **Profile-aware mode** — after `/investment-profile-init`, it uses the user's Investment Mirror profile, guardrails, best-fit master match, and past decisions.
2. **Standalone thesis-clarification mode** — before a profile exists, it still helps the user clarify a thesis using the default issue taxonomy and guardrail library. In this mode, outputs should be explicitly marked as generic rather than personalized.

### Inputs

```bash
/investment-decision "I want to buy TSLA because robotaxi could unlock a massive new growth curve."
```

Optional structured input:

```yaml
ticker: TSLA
decision_type: buy
thesis: Robotaxi could unlock a massive new growth curve.
time_horizon: 3-5 years
current_confidence: medium
source_notes:
  - "I think FSD progress is accelerating."
  - "Market may underprice autonomy optionality."
```

### Decision types

- `buy`
- `sell`
- `add`
- `trim`
- `hold`
- `avoid`
- `watchlist`
- `research_only`
- `portfolio_review`

The skill can parse the user’s language, but it should confirm ambiguity.

### Flow

#### Stage 1: Load profile

Load:

- `profile.json`
- `guardrails.yaml`
- `decision_log.jsonl`
- relevant past decisions from `decisions/`

#### Stage 2: Parse decision

Extract:

- ticker / asset / theme;
- decision type;
- thesis;
- time horizon;
- implied investment style;
- thesis type;
- user confidence;
- missing fields.

#### Stage 3: Decompose thesis

Turn the thesis into assumptions.

Example:

```text
Thesis: Buy TSLA because robotaxi could unlock a massive new growth curve.

Assumptions:
1. Robotaxi technology reaches usable reliability.
2. Regulatory approval arrives within the user’s investment horizon.
3. Tesla captures economics rather than suppliers, customers, or competitors.
4. Unit economics support high-margin recurring revenue.
5. Current stock price does not already fully reflect the option value.
```

#### Stage 4: Lint into issues

Generate issues with severity:

- `P0`: blocker issue; decision should not be considered research-ready.
- `P1`: important unresolved assumption.
- `P2`: improvement / clarity issue.

Example:

```text
[P0] ISSUE-001: Valuation expectation not checked
Why this matters:
You are making a growth thesis without defining what the current price already assumes.

Triggered personal guardrail:
Narrative-to-action jump.

Question to answer:
If robotaxi adoption is real but already priced in, what happens to expected return?

Pass condition:
Define a range of implied expectations or run a reverse expectation check.
```

#### Stage 5: Ask research questions

The routine should guide the user. It should ask questions, not just output a report.

Example:

```text
Before I can log this decision, answer these 4 questions:

1. What specific evidence would falsify this thesis within 2–4 quarters?
2. What is the strongest reason this could be a great company but a bad stock?
3. Who captures robotaxi value: Tesla, riders, fleet partners, regulators, suppliers, or competitors?
4. What part of this thesis do you believe the market is underpricing?
```

#### Stage 6: Update issues after user answers

When the user answers, update issue status:

- `open`
- `partially_resolved`
- `resolved_by_user_answer`
- `deferred`
- `accepted_risk`

#### Stage 7: Generate decision review artifact

Generate both:

- `decision_review.html`
- `decision_log.md`

#### Stage 8: Write to Investment Mirror

If the user chooses to record the decision, write:

```text
~/.investment-mirror/decisions/{date}-{ticker}-{slug}.md
~/.investment-mirror/decisions/{date}-{ticker}-{slug}.json
~/.investment-mirror/decisions/{date}-{ticker}-{slug}.html
```

Append to:

```text
~/.investment-mirror/decision_log.jsonl
~/.investment-mirror/InvestmentMirror.md
```

### Decision status labels

Use process labels, not buy/sell recommendations.

Allowed statuses:

- `draft`
- `needs_clarification`
- `blocked_by_p0_issues`
- `needs_research`
- `ready_for_user_decision`
- `decision_logged`
- `follow_up_due`
- `revisited`
- `abandoned_by_user`

Do **not** output:

- `buy`
- `sell`
- `hold`
- `strong buy`
- `strong sell`

---

## 10. `/investment-mirror-ask`

Ask questions about the user’s own Investment Mirror memory.

### Purpose

Let the user chat with accumulated profile, guardrails, decision logs, and past decision reviews.

### Examples

```bash
/investment-mirror-ask "我最近最常触发哪条 guardrail？"
```

```bash
/investment-mirror-ask "我过去所有 AI 相关投资想法里，最常缺失的东西是什么？"
```

```bash
/investment-mirror-ask "哪些 decision 被标记为 blocked_by_p0_issues，但我后来还是继续推进了？"
```

```bash
/investment-mirror-ask "我相较上个月有没有变得更理性？证据是什么？"
```

### Output style

- cite local decision IDs;
- summarize patterns;
- show no raw transcript unless explicitly requested;
- distinguish evidence from interpretation;
- suggest one next guardrail or review action.

---

## 11. Core data objects

### 11.1 `InvestorProfile`

```json
{
  "profile_id": "profile_2026_06_13",
  "created_at": "2026-06-13T10:00:00Z",
  "updated_at": "2026-06-13T10:00:00Z",
  "confidence": 0.74,
  "primary_patterns": [
    "thesis_first_reasoning",
    "narrative_to_action_jump",
    "research_loop_extension"
  ],
  "best_fit_master_matches": [
    {
      "rank": 1,
      "master_id": "philip_fisher",
      "similarity": 0.68,
      "why_match": "Long-horizon business quality reasoning, qualitative thesis formation, interest in structural growth.",
      "bio_summary": "Philip Fisher was a growth investor known for qualitative business research and the scuttlebutt method.",
      "investment_style": "Long-horizon quality growth, business durability, management quality, and qualitative evidence gathering.",
      "notable_results_summary": "Use source-backed public summaries only; avoid unsupported performance claims.",
      "read_more_url": "https://en.wikipedia.org/wiki/Philip_Arthur_Fisher",
      "what_to_learn": ["scuttlebutt", "business quality research", "long-term growth durability"],
      "what_not_to_copy": ["do not let qualitative conviction replace valuation discipline"]
    }
  ],
  "match_strengths": [
    "Starts from business quality rather than short-term price action",
    "Comfortable forming long-horizon qualitative theses",
    "Looks for durable structural growth"
  ],
  "recommended_guardrails": [
    {"guardrail_id": "reverse_expectation_check_before_thematic_growth", "reason": "Keeps quality-growth reasoning connected to price expectations"},
    {"guardrail_id": "falsification_condition_before_position", "reason": "Prevents qualitative conviction from hardening into belief"},
    {"guardrail_id": "value_capture_check_before_platform_thesis", "reason": "Separates a real trend from shareholder value capture"}
  ],
  "decision_fingerprint": {
    "narrative_sensitivity": "high",
    "valuation_discipline": "medium_low",
    "evidence_threshold": "medium",
    "contrarian_impulse": "medium_high",
    "research_loop_tendency": "high",
    "falsifiability_discipline": "medium_low",
    "risk_protocol_maturity": "low_medium",
    "time_horizon_clarity": "medium",
    "product_founder_bias": "medium_high",
    "macro_regime_sensitivity": "medium"
  },
  "default_issue": "You often move from a correct worldview to an investable security before defining price, timing, and falsification thresholds.",
  "active_guardrails": [
    "reverse_expectation_check_before_thematic_growth",
    "falsification_condition_before_position",
    "value_capture_check_before_platform_thesis"
  ],
  "source_summary": {
    "conversations_scanned": 214,
    "decision_episodes_found": 42,
    "receipts_used": 18,
    "tier1_investment_episodes": 4,
    "tier3_general_decision_episodes": 21
  }
}
```

### 11.2 `DecisionEpisode`

```json
{
  "episode_id": "ep_001",
  "source_id": "claude_2026_05_20_abc",
  "source_type": "transcript",
  "date": "2026-05-20",
  "episode_type": "investment_reasoning",
  "summary": "User moved from AI infrastructure as a secular trend to public equity exposure before defining valuation threshold.",
  "patterns": ["narrative_to_action_jump"],
  "evidence_tier": "tier2_investment_conversation",
  "sensitive": false,
  "receipt_available": true
}
```

### 11.3 `DecisionIssue`

```json
{
  "issue_id": "ISSUE-001",
  "severity": "P0",
  "title": "Valuation expectation not checked",
  "issue_code": "valuation_expectation_missing",
  "why_it_matters": "A correct growth thesis can still produce poor returns if the current price already embeds aggressive assumptions.",
  "triggered_guardrail": "reverse_expectation_check_before_thematic_growth",
  "questions": [
    "What does the current price already assume?",
    "What revenue growth and margin assumptions are needed for the thesis to work?"
  ],
  "pass_condition": "User defines a reasonable expectation range or performs a reverse expectation check.",
  "status": "open"
}
```

### 11.4 `MasterStyle`

```yaml
id: howard_marks
display_name: Howard Marks
region: United States
tier: canonical
style_tags:
  - second_level_thinking
  - risk_cycles
  - credit
  - contrarian_risk_awareness
asset_path: assets/masters/howard_marks.svg
wikipedia_url: https://en.wikipedia.org/wiki/Howard_Marks_(investor)
primary_sources:
  - https://www.oaktreecapital.com/insights/memo
teaches:
  - risk is not volatility alone
  - cycles matter
  - consensus can be dangerous
  - prepare rather than predict
bio_summary: Howard Marks is an investor and author known for Oaktree memos, risk thinking, cycles, and second-level thinking.
investment_style: Risk-aware credit investing, cycles, contrarian discipline, and second-level thinking.
notable_results_summary: Source-backed public summary of Oaktree / Marks record; avoid unsupported return claims.
read_more_url: https://en.wikipedia.org/wiki/Howard_Marks_(investor)
guardrail_relevance:
  - narrative_overconfidence
  - macro_certainty
  - valuation_indifference
html_card_role: best-fit master card or learning reference card
```

### 11.5 `DecisionLogEntry`

```json
{
  "decision_id": "dec_2026_06_13_tsla_robotaxi",
  "created_at": "2026-06-13T12:00:00Z",
  "ticker": "TSLA",
  "decision_type": "buy",
  "user_thesis": "Robotaxi could unlock a massive new growth curve.",
  "decision_status": "blocked_by_p0_issues",
  "triggered_patterns": [
    "narrative_to_action_jump",
    "valuation_expectation_missing"
  ],
  "issues": [
    {"issue_id": "ISSUE-001", "severity": "P0", "title": "Commercialization timeline missing"},
    {"issue_id": "ISSUE-002", "severity": "P0", "title": "Valuation expectation not checked"}
  ],
  "user_final_decision": "not_recorded_yet",
  "next_review_date": null,
  "artifact_paths": {
    "html": "decisions/2026-06-13-tsla-robotaxi.html",
    "md": "decisions/2026-06-13-tsla-robotaxi.md",
    "json": "decisions/2026-06-13-tsla-robotaxi.json"
  }
}
```

---

## 12. Profile dimensions derived from master research

The master research phase should determine the profile dimensions. v0.2 starts with these dimensions:

| Dimension | Low end | High end | Why it matters |
|---|---|---|---|
| Narrative sensitivity | Data-first | Story-first | Detects theme-driven conviction |
| Valuation discipline | Price-light | Price-first | Detects overpaying risk |
| Evidence threshold | Loose evidence | Strict evidence | Detects confirmation risk |
| Falsifiability | Belief-like | Testable | Detects thesis hardening |
| Time horizon clarity | Vague | Explicit | Detects unbounded thesis drift |
| Research-loop tendency | Action-biased | Research-looped | Detects paralysis vs premature action |
| Contrarian impulse | Consensus-aligned | Contrarian | Detects “market is wrong” framing |
| Product/founder bias | Financial-first | Product/founder-first | Detects good-product-bad-stock risk |
| Downside-first thinking | Upside-first | Downside-first | Detects capital preservation discipline |
| Catalyst dependence | Compounder | Catalyst-driven | Separates quality growth from special situations |
| Cycle/regime sensitivity | Micro-only | Macro/regime-aware | Detects macro overreach or blind spots |
| Systematic vs discretionary | Discretionary | Rule/system-based | Detects process discipline |
| Concentration comfort | Diversified | Concentrated | Detects portfolio temperament, not recommendation |
| Authority reliance | Independent | Authority-anchored | Detects borrowed conviction |
| Value capture clarity | TAM-focused | Capture-focused | Detects trend-to-shareholder-value gaps |

---

## 13. Issue taxonomy

### 13.1 P0 issues: decision blockers

These should block the decision from being considered research-ready.

| Code | Issue | Typical trigger |
|---|---|---|
| `thesis_missing` | Thesis is not stated clearly | User only says “looks good” |
| `decision_type_missing` | Decision type unclear | Buy vs watchlist vs add not specified |
| `time_horizon_missing` | Time horizon missing | No 6m / 2y / 5y horizon |
| `falsification_missing` | No disconfirming evidence defined | Thesis cannot be proven wrong |
| `valuation_expectation_missing` | No valuation or expectation check | Growth thesis without price discipline |
| `value_capture_missing` | Trend-to-shareholder-value bridge missing | AI / robotaxi / cloud / TAM thesis |
| `downside_protocol_missing` | No downside or position protocol | User discussing action without risk boundary |
| `evidence_basis_missing` | No evidence basis | Pure narrative or authority claim |

### 13.2 P1 issues: unresolved assumptions

| Code | Issue | Typical trigger |
|---|---|---|
| `narrative_to_action_jump` | User moves from story to action too quickly | “AI will change everything, so buy X” |
| `consensus_gap_missing` | User has not defined what market consensus believes | “Market is missing this” |
| `competition_ignored` | Competitive response not addressed | Moat thesis without competitors |
| `cyclicality_ignored` | Cycle/regime not addressed | Semis, housing, banks, commodities |
| `authority_anchor` | User relies on famous investor / analyst / founder | “X bought it” |
| `single_metric_overweight` | One metric dominates reasoning | P/E, revenue growth, DAU, GMV only |
| `management_shortcut` | Management quality used to bridge uncertainty | Founder charisma substitutes for evidence |
| `catalyst_missing` | No mechanism for value realization | Contrarian / value ideas |
| `source_quality_weak` | Weak evidence hierarchy | Social media > filing / primary data |
| `scenario_absent` | No bull/base/bear scenario | Binary thesis |

### 13.3 P2 issues: clarity and process improvements

| Code | Issue | Typical trigger |
|---|---|---|
| `wording_vague` | Thesis wording too broad | “Long-term good company” |
| `monitoring_items_missing` | No next-quarter watch items | No tracking plan |
| `reading_path_available` | Relevant learning lens exists | Matched master profile or source can help |
| `prompt_pack_recommended` | Personalized prompt would help | User repeats pattern |
| `decision_log_incomplete` | Log missing final user choice | User stopped before recording |

---

## 14. Decision patterns detected from transcripts

The profile engine detects patterns, not merely investment labels.

| Pattern ID | Description | Risk in investing | Typical guardrail |
|---|---|---|---|
| `thesis_first_reasoning` | User starts with a big idea before checking data | Confirmation risk | Evidence checklist |
| `narrative_to_action_jump` | User moves from trend to security too quickly | Overpaying for good stories | Reverse expectation check |
| `research_loop_extension` | User keeps adding research instead of decision rules | Analysis paralysis | Three-variable decision rule |
| `contrarian_impulse` | User likes “market is wrong” framing | Being different for its own sake | Consensus gap check |
| `product_quality_overweight` | User equates good product with good stock | Good company, bad stock | Value capture check |
| `macro_story_overreach` | User explains securities through macro narrative alone | Right macro, wrong asset | Asset sensitivity map |
| `authority_anchor` | User leans on famous investors / founders / analysts | Borrowed conviction | Independent thesis statement |
| `valuation_avoidance` | User delays price/expectation analysis | Return compression | Valuation floor guardrail |
| `falsification_avoidance` | User avoids clear “what would prove me wrong” tests | Belief hardening | Disconfirmation rule |
| `scope_expansion_under_uncertainty` | User keeps expanding problem scope when uncertain | Slow convergence | Scope freeze + decision criteria |
| `framework_over_action` | User creates elegant frameworks but delays decision rules | Intellectualization | Decision boundary prompt |

---

## 15. Guardrail library v0.2

1. **Reverse expectation guardrail**  
   Trigger: thematic growth, expensive stock, narrative-to-action jump.  
   Question: “What does the current price already assume?”

2. **Value capture guardrail**  
   Trigger: big TAM, AI, platform, network effect, technology thesis.  
   Question: “Who captures the value?”

3. **Falsification guardrail**  
   Trigger: no disconfirming evidence.  
   Question: “What would make you admit this thesis is wrong?”

4. **Consensus gap guardrail**  
   Trigger: contrarian claim.  
   Question: “What exactly is consensus, and what exactly do you disagree with?”

5. **Research-loop breaker**  
   Trigger: too many sources, no decision rule.  
   Question: “What are the three variables that determine buy / wait / reject?”

6. **Good-company-bad-stock guardrail**  
   Trigger: quality praise without price discipline.  
   Question: “How could this be a great company but a poor investment from here?”

7. **Cycle/regime guardrail**  
   Trigger: cyclical business, macro-sensitive stock, commodity, bank, semiconductor.  
   Question: “Where are we in the cycle, and what would change that?”

8. **Position protocol guardrail**  
   Trigger: action language without risk boundary.  
   Question: “What is the user-defined risk protocol for observation / initial / confirmed stages?”  
   Do not recommend position size. Ask the user to define their own protocol.

9. **Matched-master blind-spot guardrail**  
   Trigger: best-fit master style has a known blind spot.  
   Question: “What guardrail helps you keep this master's strength without copying the blind spot?”

---

## 16. HTML artifacts

### 16.1 Profile HTML: `profile.html`

The profile artifact should look professional enough to save, share privately, or revisit monthly.

#### Required sections

1. **Hero**
   - Product title: Investment Mirror
   - Profile title
   - Confidence level
   - Positive profile summary
   - Primary best-fit master match card
   - Optional secondary match card only when evidence strongly supports it
   - "Why this match is strong" statement

2. **Best-Fit Master Match / Style Avatar**
   - 1–2 master cards maximum
   - Do not show a 3–4 person blend or percentage-style master mix
   - If present, the second master is a secondary affinity, not a corrective or guardrail master
   - Line-art, dot-art, or halftone portrait from local asset library
   - Name
   - Style tags
   - Similarity score
   - “Why this match appears”
   - Short biography
   - Investment style summary
   - Notable results / track record summary where source-backed
   - “What to learn”
   - “What not to copy”
   - Read-more link

3. **Strengths Before Issues**
   - Start by explaining why the match is flattering, useful, and credible
   - Show the user's strongest observed decision behaviors
   - Defer recurring issues and guardrails until after the match card

4. **Decision Fingerprint**
   - Visual bars or radar-like layout
   - Dimensions listed in Section 12

5. **Primary patterns**
   - Pattern title
   - Evidence summary
   - Investment risk
   - Guardrail to install

6. **Receipts**
   - Use transcript-derived evidence summaries
   - Do not show sensitive raw quotes by default
   - Each receipt includes source alias and date

7. **Required guardrails**
   - Guardrail name
   - Trigger
   - Required questions
   - How it appears in `/investment-decision`
   - Recommended section title: “Guardrails To Make This Style Investable”
   - Guardrails should come from the user's observed patterns; do not present other masters as corrective foils

8. **Prompt pack preview**
   - 3–5 personalized prompts

9. **Local memory initialized**
   - Path to `InvestmentMirror.md`
   - Number of decision episodes indexed
   - Number of active guardrails

#### Visual style

- Professional, sleek, and serious.
- Designed, not generic: use a Taste-Skill-style pass inspired by https://github.com/Leonxlnx/taste-skill/tree/main, but do not require installing or pulling that skill in v0.2.
- No casino / trading-guru aesthetics.
- No neon finance dashboards.
- No “AI slop” four-card dashboard pattern unless intentionally refined.
- Use neutral typography, strong spacing, and restrained color.
- Use line-art, dot-art, or halftone portraits, not glossy finance photos.
- A valid direction is a professional report layout with overlapping or stacked card artifacts, fine orange or copper accent lines, halftone/dot textures, lots of white space, and crisp report typography.
- Cards may feel like physical report cards or evidence cards, but the layout must remain readable and not become a gimmick.
- Use subtle issue severity badges: P0 / P1 / P2.
- Use source/provenance microcopy to increase credibility.

### 16.2 Taste Skill integration

The HTML artifact should go through a design pass using a Taste-Skill-style design checklist. Use the Taste Skill repo as a reference link and inspiration for anti-generic interface quality, but do not depend on pulling or installing it for v0.2.

Required design prompt:

```text
Design this Investment Mirror HTML artifact with a professional, sleek, private-banking-meets-developer-tool feel. It should look like an elite decision-review artifact, not a retail trading app. Avoid generic AI dashboards, purple gradients, casino aesthetics, meme-finance design, and dense academic PDF styling.

Use:
- strong whitespace;
- restrained typography;
- clean issue severity badges;
- elegant line-art, dot-art, or halftone master portraits;
- provenance and source confidence cues;
- a sophisticated but readable card hierarchy;
- overlapping or stacked report-card artifacts where useful;
- fine orange or copper accent lines and restrained halftone/dot textures;
- a polished report feel with visible design craft, not a template dashboard.
```

### 16.3 Decision HTML: `decision_review.html`

Each `/investment-decision` run should produce a decision artifact.

Required sections:

1. Decision summary
2. Profile-aware context
3. Best-fit master lens relevant to this decision
4. Thesis decomposition
5. P0 / P1 / P2 issue list
6. Guided research questions
7. Decision log preview
8. Prompt pack suggestions

---

## 17. Local file structure

```text
~/.investment-mirror/
  InvestmentMirror.md
  profile.json
  guardrails.yaml
  prompt_pack.md
  decision_log.jsonl
  source_index.sqlite

  decisions/
    2026-06-13-tsla-robotaxi.md
    2026-06-13-tsla-robotaxi.json
    2026-06-13-tsla-robotaxi.html

  profile_history/
    2026-06-13-profile.json
    2026-06-13-profile.html
    2026-07-13-profile-update.json
    2026-07-13-profile-update.html

  config/
    master_registry.yaml
    issue_taxonomy.yaml
    guardrail_rules.yaml
    style_dimensions.yaml
```

---

## 18. `InvestmentMirror.md` structure

```markdown
# Investment Mirror

## Current Investment Profile

Primary pattern: Thesis-first, abstraction-heavy, narrative-sensitive.  
Default issue: You often move from a correct worldview to an investable security before defining price, timing, and falsification thresholds.

## Best-Fit Master Match

Closest match: Philip Fisher  
Why: business-quality reasoning, qualitative judgment, long horizon, structural growth lens.  
Recommended guardrails: reverse expectation check; falsification condition; value capture check.

## Active Guardrails

1. Reverse expectation check before thematic growth decisions.
2. Falsification condition before action.
3. Value capture check before platform or TAM thesis.
4. Consensus gap check before contrarian thesis.

## Decision Log Index

| Date | Asset | Decision Type | Status | Triggered Issues |
|---|---|---|---|---|
| 2026-06-13 | TSLA | buy | blocked_by_p0_issues | valuation expectation missing; falsification missing |

## Open Follow-ups

- TSLA robotaxi thesis: define falsification condition by next review.
- NVDA AI capex thesis: check whether capex normalization risk changed.
```

---

## 19. Prompt pack

Each user profile should generate a personalized `prompt_pack.md`.

Required prompts:

1. Anti-narrative prompt
2. Valuation discipline prompt
3. Falsification prompt
4. Consensus gap prompt
5. Research-loop breaker prompt
6. Good-company-bad-stock prompt
7. Post-decision review prompt
8. Best-fit master learning prompt

Example:

```markdown
## Best-Fit Master Learning Prompt

I am attracted to this investment idea. Based on my Investment Mirror profile, my best-fit master match is Philip Fisher.

First explain what is strong about how I am approaching this thesis. Then help me make the thesis more investable using:
1. the strengths of Fisher-style business-quality research;
2. a valuation expectation check;
3. a good-company-bad-stock check;
4. a falsification condition;
5. a value-capture check.

Do not tell me whether to buy. Turn my thesis into issues, questions, and guardrails.
```

---

## 20. Investment master asset registry

### 20.1 Design principle

Investment masters serve as:

- learning paths;
- style archetypes;
- source-backed master profiles;
- visual anchors in the HTML artifact.

They should not be used as:

- authority signals;
- implied endorsement;
- “you are this master” identity labels;
- evidence that a security is attractive.

### 20.2 Asset rule

Use local, original, consistent line-art SVGs:

```text
assets/masters/{master_id}.svg
```

Do not fetch portraits from Wikipedia or third-party sites at runtime. Wikipedia should only be used as an outbound “Learn more” link.

The GitHub repository is the source of truth for reusable master assets. HTML generation should pull or read the required assets from the repo, copy them into the local artifact output area, and reference the copied local files. Generated `profile.html` and `decision_review.html` should not depend on remote GitHub image URLs when viewed later.

Copied artifact assets should live beside the generated artifact, not in a global shared cache. Example:

```text
~/.investment-mirror/decisions/2026-06-13-tsla-robotaxi.html
~/.investment-mirror/decisions/2026-06-13-tsla-robotaxi.assets/
  masters/
    philip_fisher.svg
    howard_marks.svg
    benjamin_graham.svg
```

Profile artifacts should follow the same pattern:

```text
~/.investment-mirror/profile.html
~/.investment-mirror/profile.assets/
  masters/
    philip_fisher.svg
    howard_marks.svg
    benjamin_graham.svg
```

### 20.3 Master registry fields

```yaml
id: string
display_name: string
region: string
tier: canonical | extended | modern_case | controversial_case
style_tags: string[]
asset_path: string
wikipedia_url: string
primary_sources: string[]
secondary_sources: string[]
teaches: string[]
common_misreadings: string[]
bio_summary: string
investment_style: string
notable_results_summary: string
read_more_url: string
guardrail_relevance: string[]
html_card_role: string
```

### 20.4 Track record evidence standard

Master profile cards may include biography, investment style, notable results, and track-record context, but only when source-backed.

Allowed:

- low-dispute public biographical facts;
- source-backed investing style summaries;
- notable books, letters, memos, speeches, funds, firms, or concepts associated with the master;
- broad track-record context when supported by a high-quality source;
- read-more links to Wikipedia or stronger primary / institutional sources.

Avoid:

- unsupported annualized return claims;
- ranking masters by performance;
- implying one master is "better" than another;
- using track record as an authority signal for a current security;
- precise performance numbers unless backed by reliable source notes.

The purpose of the master card is to explain why the user's decision style matches a useful learning archetype, not to build an investor leaderboard.

---

## 21. Master registry v0.2

This is not a claim that these are literally all masters in history. It is a product-ready v0.2 registry covering the most useful style archetypes for Investment Mirror. v0.2 active registry size is **30 masters**. A separate future list keeps 15 additional masters for later expansion.

Do not separate masters by nationality alone. Duan Yongping and Li Lu belong inside the style categories that best explain their investing approach.

### 21.1 Value / margin of safety

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `benjamin_graham` | Benjamin Graham | value, margin of safety, Mr. Market | Valuation floor; emotional discipline | https://en.wikipedia.org/wiki/Benjamin_Graham |
| `warren_buffett` | Warren Buffett | quality value, capital allocation, long-term ownership | Business quality plus discipline | https://en.wikipedia.org/wiki/Warren_Buffett |
| `charlie_munger` | Charlie Munger | mental models, quality, incentives | Inversion; avoid stupidity | https://en.wikipedia.org/wiki/Charlie_Munger |
| `walter_schloss` | Walter Schloss | deep value, diversification, balance sheet | Simplicity; price discipline | https://en.wikipedia.org/wiki/Walter_Schloss |
| `seth_klarman` | Seth Klarman | value, risk, margin of safety | Downside-first thinking | https://en.wikipedia.org/wiki/Seth_Klarman |
| `li_lu` | Li Lu / 李录 | value investing, long-term compounders, accurate information, China/Asia focus | Information completeness; intellectual honesty; owner mindset | https://en.wikipedia.org/wiki/Li_Lu |

### 21.2 Quality growth / compounders

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `duan_yongping` | Duan Yongping / 段永平 | entrepreneur-investor, business quality, common sense, long-term ownership | Good product vs good business; owner mindset | https://en.wikipedia.org/wiki/Duan_Yongping |
| `philip_fisher` | Philip Fisher | scuttlebutt, growth, quality | Business quality research | https://en.wikipedia.org/wiki/Philip_Arthur_Fisher |
| `t_rowe_price_jr` | T. Rowe Price Jr. | growth investing | Long-term growth durability | https://en.wikipedia.org/wiki/Thomas_Rowe_Price_Jr. |
| `peter_lynch` | Peter Lynch | GARP, know what you own, consumer insight | Simple thesis clarity; PEG discipline | https://en.wikipedia.org/wiki/Peter_Lynch |
| `terry_smith` | Terry Smith | quality compounders, buy good companies | Quality vs valuation tension | https://en.wikipedia.org/wiki/Terry_Smith_(fund_manager) |

### 21.3 Contrarian / risk / cycles

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `howard_marks` | Howard Marks | second-level thinking, risk, cycles | Risk and cycle discipline | https://en.wikipedia.org/wiki/Howard_Marks_(investor) |
| `john_templeton` | John Templeton | global contrarian, peak pessimism | Contrarian discipline | https://en.wikipedia.org/wiki/John_Templeton |
| `jeremy_grantham` | Jeremy Grantham | bubbles, long-term valuation, mean reversion | Bubble / regime caution | https://en.wikipedia.org/wiki/Jeremy_Grantham |
| `michael_burry` | Michael Burry | contrarian, deep research, asymmetric bets | Evidence vs consensus | https://en.wikipedia.org/wiki/Michael_Burry |

### 21.4 Macro / trading / reflexivity

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `george_soros` | George Soros | reflexivity, macro, asymmetric bets | Reflexivity; fallibility | https://en.wikipedia.org/wiki/George_Soros |
| `stanley_druckenmiller` | Stanley Druckenmiller | macro, concentrated bets, risk management | Position discipline | https://en.wikipedia.org/wiki/Stanley_Druckenmiller |
| `paul_tudor_jones` | Paul Tudor Jones | trading, macro, risk control | Loss control; timing discipline | https://en.wikipedia.org/wiki/Paul_Tudor_Jones |
| `jesse_livermore` | Jesse Livermore | speculation, tape reading, risk | Speculation cautionary archetype | https://en.wikipedia.org/wiki/Jesse_Livermore |
| `ray_dalio` | Ray Dalio | macro, risk parity, principles | Regime map; diversification | https://en.wikipedia.org/wiki/Ray_Dalio |

### 21.5 Systematic / quant / passive

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `john_bogle` | John C. Bogle | indexing, low cost, passive investing | Humility and cost discipline | https://en.wikipedia.org/wiki/John_C._Bogle |
| `jim_simons` | Jim Simons | quant, systematic, data | Evidence and systems | https://en.wikipedia.org/wiki/Jim_Simons_(mathematician) |
| `edward_thorp` | Edward O. Thorp | probability, arbitrage, quant | Probabilistic thinking | https://en.wikipedia.org/wiki/Edward_O._Thorp |
| `cliff_asness` | Cliff Asness | factor investing, value/momentum, quant | Factor discipline; anti-story | https://en.wikipedia.org/wiki/Cliff_Asness |
| `eugene_fama` | Eugene Fama | efficient markets, factor research | Market efficiency discipline | https://en.wikipedia.org/wiki/Eugene_Fama |

### 21.6 Activist / special situations

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `carl_icahn` | Carl Icahn | activist, corporate control | Catalyst and governance | https://en.wikipedia.org/wiki/Carl_Icahn |
| `bill_ackman` | Bill Ackman | activist, concentrated public campaigns | Thesis clarity and reputational risk | https://en.wikipedia.org/wiki/Bill_Ackman |
| `joel_greenblatt` | Joel Greenblatt | special situations, magic formula, value | Catalyst and simple rules | https://en.wikipedia.org/wiki/Joel_Greenblatt |

### 21.7 Credit / bonds / endowment

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `bill_gross` | Bill Gross | bonds, duration, fixed income | Rate/duration awareness | https://en.wikipedia.org/wiki/Bill_Gross |
| `david_swensen` | David Swensen | endowment model, asset allocation | Portfolio construction | https://en.wikipedia.org/wiki/David_F._Swensen |

### 21.8 Future masters list

These 15 masters are not part of the v0.2 active registry completion gate. They are candidates for future expansion because they are less central to the first product experience, overlap with active registry archetypes, or need more careful positioning.

| ID | Name | Style tags | Guardrail role | Link |
|---|---|---|---|---|
| `david_dodd` | David Dodd | security analysis, value | Fundamental analysis discipline | https://en.wikipedia.org/wiki/David_Dodd |
| `mohnish_pabrai` | Mohnish Pabrai | cloning, value, concentration | Borrowed conviction check | https://en.wikipedia.org/wiki/Mohnish_Pabrai |
| `guy_spier` | Guy Spier | value, environment design, behavioral discipline | Process design; temperament | https://en.wikipedia.org/wiki/Guy_Spier |
| `nick_sleep` | Nick Sleep | scale economies shared, long-term compounding | Long-duration quality | https://en.wikipedia.org/wiki/Nick_Sleep |
| `chuck_akre` | Chuck Akre | three-legged stool, compounding | Business quality checklist | https://en.wikipedia.org/wiki/Chuck_Akre |
| `bruce_kovner` | Bruce Kovner | macro trading, risk management | Stop-loss discipline | https://en.wikipedia.org/wiki/Bruce_Kovner |
| `ed_seykota` | Ed Seykota | trend following, systems | System discipline | https://en.wikipedia.org/wiki/Ed_Seykota |
| `richard_dennis` | Richard Dennis | trend following, Turtle Trading | Rules over discretion | https://en.wikipedia.org/wiki/Richard_Dennis |
| `kenneth_french` | Kenneth French | factor research | Factor / evidence discipline | https://en.wikipedia.org/wiki/Kenneth_French |
| `mario_gabelli` | Mario Gabelli | private market value, catalysts | Valuation and catalyst bridge | https://en.wikipedia.org/wiki/Mario_Gabelli |
| `jeffrey_gundlach` | Jeffrey Gundlach | bonds, macro, credit | Credit and rate risk | https://en.wikipedia.org/wiki/Jeffrey_Gundlach |
| `david_tepper` | David Tepper | distressed debt, opportunistic macro | Distressed risk/reward | https://en.wikipedia.org/wiki/David_Tepper |
| `cathie_wood` | Cathie Wood | thematic innovation, disruption | Theme risk; duration risk | https://en.wikipedia.org/wiki/Cathie_Wood |
| `ken_griffin` | Kenneth C. Griffin | multi-strategy, market structure, hedge fund | Institutional complexity | https://en.wikipedia.org/wiki/Kenneth_C._Griffin |
| `julian_robertson` | Julian Robertson | Tiger-style long/short, growth/value | Long/short discipline | https://en.wikipedia.org/wiki/Julian_Robertson |

---

## 22. Master research sources

### 22.1 Primary / high-quality practitioner sources

| Source | Use | Link |
|---|---|---|
| Berkshire Hathaway shareholder letters | Buffett-style capital allocation, owner mindset, business quality | https://www.berkshirehathaway.com/letters/letters.html |
| Oaktree Howard Marks memos | risk, cycles, second-level thinking | https://www.oaktreecapital.com/insights/memo |
| Columbia Heilbrunn Center / Graham & Doddsville | value investing education and interviews | https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter |
| Himalaya Capital | Li Lu / Himalaya value investing principles | https://www.himcap.com/ |
| Value Investors Club | investment write-up examples and thesis structure | https://valueinvestorsclub.com/ |
| Dataroma Superinvestors | 13F-based public portfolio tracking for well-known investors | https://www.dataroma.com/m/managers.php |
| ValueSider | superinvestor portfolio reference | https://valuesider.com/value-investors |
| Stockcircle | guru portfolio tracking / style comparison | https://stockcircle.com/ |

### 22.2 Educational / style taxonomy sources

| Source | Use | Link |
|---|---|---|
| Investopedia greatest investors | initial master list and style summaries | https://www.investopedia.com/world-s-11-greatest-investors-4773356 |
| Investopedia investment styles | active/passive, growth/value, cap-size framing | https://www.investopedia.com/financial-edge/0410/6-investment-styles-which-fits-you.aspx |
| Morningstar Style Box | value/blend/growth and market-cap style grid | https://advisor.morningstar.com/enterprise/MorningstarStyleBox_FactSheet.pdf |
| CFA Institute / factor research | factor and risk-style references | https://rpc.cfainstitute.org/ |
| AQR research | value, momentum, quality, macro, factor perspectives | https://www.aqr.com/Insights/Research |
| Damodaran Online | valuation, narrative and numbers | https://pages.stern.nyu.edu/~adamodar/ |

### 22.3 Chinese sources caution

For Duan Yongping and Chinese-language investing material, useful sources are scattered across interviews, blogs, Xueqiu posts, forums, books, and reposted transcripts. The asset registry should allow manual source curation and source-quality tags:

```yaml
source_quality:
  - official
  - book
  - interview_transcript
  - public_speech
  - reposted_transcript
  - forum_summary
```

Prefer official/public speech/book/interview sources. Do not treat unsourced reposts as authoritative.

---

## 23. Phase plan

This phase plan is important. v0.2 has two core product surfaces that both must ship:

1. `/investment-profile-init` creates the user's Investment Mirror profile.
2. `/investment-decision` uses that profile to clarify and lint future theses.

The first-use demo should be:

```text
/investment-profile-init
  -> auto-discover Codex and Claude Code transcripts
  -> show source summary and allow exclusions
  -> run full local indexing / filtering / profile generation
  -> profile.html + profile.json + guardrails.yaml
  -> /investment-decision with the generated profile
  -> decision_review.html + decision log preview
```

`/investment-decision` must also work standalone as a thesis-clarification routine when no profile exists. In that case it should rely on generic issue taxonomy and guardrail rules, then invite the user to run `/investment-profile-init` for personalization.

The work should run in parallel tracks, not as a strict waterfall. Master research determines profile dimensions, best-fit match logic, and guardrail relevance, while engineering can build the command surfaces and artifact pipeline against provisional fixtures.

### Phase 0 — Product framing lock

**Goal:** Lock scope and vocabulary.

Deliverables:

- Final one-liner.
- Command names:
  - `/investment-profile-init`
  - `/investment-profile-update`
  - `/investment-decision`
  - `/investment-mirror-ask`
- Non-goals:
  - no automation;
  - no direct buy/sell recommendations;
  - local-first;
  - issue language instead of mistake language.

### Phase 1 — Full master registry research corpus

**Goal:** Build the full source-backed v0.2 master library.

Tasks:

1. Cover the full v0.2 active master registry in Section 21: 30 masters.
2. For each master, collect:
   - Wikipedia link;
   - primary sources if available;
   - official letters / memos / books / speeches;
   - reliable secondary summaries;
   - public portfolio trackers if relevant;
   - source-quality label.
3. Download or generate the required local visual asset for each master.
4. Write a 1-page `master_profile.md` for each master.
5. Extract each master’s:
   - decision style;
   - evidence style;
   - risk style;
   - valuation style;
   - time horizon;
   - common misreadings;
   - what user patterns this master helps identify or improve;
   - guardrail relevance.

Completion standard:

- Every active v0.2 master in Section 21 must have a complete research folder.
- Every active v0.2 master must have a finished local visual asset.
- No placeholder master profiles or placeholder master assets count toward v0.2 completion.
- Every active v0.2 master must be usable in matching, HTML profile cards, and read-more flows.
- Future masters are explicitly excluded from the v0.2 completion gate.

Output:

```text
research/masters/{master_id}/profile.md
research/masters/{master_id}/sources.yaml
research/masters/{master_id}/style_notes.md
assets/masters/{master_id}.svg
```

### Phase 2 — Master visual asset collection and generation

**Goal:** Build a consistent visual asset library.

Tasks:

1. Decide line-art visual style.
2. Generate or commission original line-art portraits.
3. Store assets as SVG where possible.
4. Ensure each asset has:
   - master id;
   - display name;
   - file path;
   - attribution/source note if needed;
   - Wikipedia link in registry.
5. Avoid runtime image fetching.

Output:

```text
assets/masters/{master_id}.svg
config/master_registry.yaml
```

### Phase 3 — Style dimensions and master mapping

**Goal:** Translate master research into profile dimensions.

Tasks:

1. Define profile dimensions.
2. Score each master on those dimensions.
3. Define similarity matching logic.
4. Define guardrail relevance logic for each master style.
5. Define “what not to copy” for each master.

Output:

```text
config/style_dimensions.yaml
config/master_style_vectors.yaml
config/master_guardrail_rules.yaml
```

Example:

```yaml
philip_fisher:
  narrative_sensitivity: high
  valuation_discipline: medium
  evidence_threshold: high_qualitative
  time_horizon: long
  product_founder_bias: medium_high
  recommended_guardrails:
    - valuation_expectation_check
    - cycle_regime_check
```

### Phase 4 — Issue taxonomy and guardrail library

**Goal:** Build the core decision linter rules before transcript ingestion.

Tasks:

1. Define P0/P1/P2 issue taxonomy.
2. Define issue triggers.
3. Define guardrails.
4. Map patterns to guardrails.
5. Map best-fit master styles and user patterns to guardrails.

Output:

```text
config/issue_taxonomy.yaml
config/guardrail_rules.yaml
config/pattern_rules.yaml
```

### Phase 5 — `/investment-decision` MVP with provisional profile support

**Goal:** Build the thesis-clarification surface that works both standalone and on top of a profile.

Tasks:

1. Create provisional/default `profile.json` fixtures.
2. Implement thesis parser.
3. Implement assumption decomposition.
4. Implement issue generation from generic taxonomy.
5. Implement profile-aware guardrail triggering when profile data exists.
6. Implement standalone generic guardrail triggering when no profile exists.
7. Implement guided research questions.
8. Implement decision log preview and optional writing.
9. Render `decision_review.html`.

Acceptance:

- A user thesis becomes P0/P1/P2 issues.
- Personalized guardrails appear when a profile exists.
- Generic guardrails appear when no profile exists.
- Decision log is generated.
- Artifact looks professional.

### Phase 6 — HTML artifact design using Taste Skill

**Goal:** Make artifacts feel high-end and memorable as static report artifacts with light interactions.

Tasks:

1. Use a Taste-Skill-style design pass.
2. Create `profile.html` design.
3. Create `decision_review.html` design.
4. Test with 3 profile archetypes and 5 decisions.
5. Remove generic AI dashboard aesthetics.
6. Keep artifacts static-first: no app shell, dashboard navigation, or heavy client-side controls.

Output:

```text
templates/profile.html
templates/decision_review.html
assets/masters/*.svg
```

### Phase 7 — Transcript ingestion pipeline

**Goal:** Make `/investment-profile-init` work over thousands of transcripts.

Tasks:

1. Implement automatic source discovery for Codex and Claude Code transcripts.
2. Implement manifest and incremental indexing.
3. Implement source adapters.
4. Implement redaction.
5. Implement local scoring.
6. Implement SQLite FTS index.
7. Implement diversity sampling.
8. Implement LLM classification on sampled candidate spans.
9. Implement pattern aggregation.
10. Implement confidence scoring.

Output:

```text
source_index.sqlite
profile_evidence.json
```

### Phase 8 — `/investment-profile-init`

**Goal:** Generate the first real profile.

Tasks:

1. Run ingestion.
2. Extract episodes.
3. Aggregate patterns.
4. Match best-fit master.
5. Select recommended guardrails.
6. Run interview if needed.
7. Generate profile artifacts.
8. Initialize Investment Mirror memory.

Acceptance:

- Profile includes best-fit master match.
- Profile includes best-fit master profile details and recommended guardrails.
- Profile includes receipts.
- Profile includes guardrails.
- Profile includes prompt pack.

### Phase 9 — `/investment-profile-update`

**Goal:** Make the profile dynamic.

Tasks:

1. Incrementally process new transcripts and logs.
2. Compare recent vs historical patterns.
3. Update guardrails with evidence.
4. Show whether user behavior improved or worsened.
5. Update best-fit master match only when evidence supports it.

### Phase 10 — `/investment-mirror-ask`

**Goal:** Let users talk to their decision memory.

Tasks:

1. Query decision logs.
2. Query profile history.
3. Query local source summaries.
4. Answer with local decision IDs.
5. Avoid exposing raw transcripts unless requested.

### Phase 11 — Eval

**Goal:** Prevent the skill from becoming vibe-based diagnosis.

Eval sets:

1. Synthetic transcripts for each profile archetype.
2. Real anonymized transcripts if available.
3. Investment thesis examples with known missing assumptions.
4. Regression tests for issue severity.
5. HTML artifact visual QA.
6. Safety/compliance tests.

Eval questions:

- Does the profile cite enough evidence?
- Does the best-fit master match feel justified?
- Does the skill avoid buy/sell advice?
- Does `/investment-decision` produce useful issues?
- Does the HTML artifact feel professional rather than generic?
- Does transcript ingestion avoid over-weighting coding logs?

---

## 24. Suggested implementation structure

```text
investment-mirror-skill/
  specs/
    Investment_Mirror_Skill_v0_2_Spec.md

  skills/
    investment-mirror/
      SKILL.md
      agents/
        openai.yaml

      commands/
        investment-profile-init.md
        investment-profile-update.md
        investment-decision.md
        investment-mirror-ask.md

      scripts/
        discover_sources.ts
        build_source_manifest.ts
        parse_transcript_adapters.ts
        ingest_sources.ts
        redact_sensitive.ts
        build_transcript_index.ts
        score_decision_spans.ts
        sample_candidate_episodes.ts
        classify_decision_episodes.ts
        aggregate_decision_patterns.ts
        match_master_styles.ts
        run_calibration_interview.ts
        generate_investor_profile.ts
        lint_investment_decision.ts
        generate_prompt_pack.ts
        update_investment_mirror.ts
        render_profile_html.ts
        render_decision_html.ts

      config/
        master_registry.yaml
        master_style_vectors.yaml
        style_dimensions.yaml
        master_guardrail_rules.yaml
        decision_patterns.yaml
        issue_taxonomy.yaml
        guardrail_rules.yaml
        prompt_pack_rules.yaml

  research/
    masters/
      philip_fisher/
        profile.md
        sources.yaml
        style_notes.md

  templates/
    InvestmentMirror.md
    profile.html
    decision_review.html
    profile_update.html
    prompt_pack.md
    decision_log_entry.md

  assets/
    masters/
      benjamin_graham.svg
      warren_buffett.svg
      charlie_munger.svg
      philip_fisher.svg
      peter_lynch.svg
      howard_marks.svg
      duan_yongping.svg
      li_lu.svg

  tests/
    fixtures/
    golden_outputs/
```

This repository is the skill product repo. The installable Codex skill lives under `skills/investment-mirror/` so it can follow skill naming and packaging rules cleanly. Runtime user memory lives under `~/.investment-mirror/`; reusable artifact assets live in the repo and are pulled or read, then copied into generated artifact output, only when needed.

---

## 25. Future adapter boundary

MCP implementation is out of scope for v0.2. The skill should keep structured internal function boundaries so an MCP adapter could be added later, but no `mcp/` implementation or MCP tool surface should be built in this phase.

Tools:

```text
investment_profile_init(input) -> InvestorProfileArtifacts
investment_profile_update(input) -> ProfileUpdateArtifacts
investment_decision(input) -> DecisionReviewArtifacts
investment_mirror_ask(input) -> MirrorAnswer
```

Every tool returns both:

1. structured JSON for other agents;
2. artifact paths for human review.

Example:

```json
{
  "status": "blocked_by_p0_issues",
  "issues": [],
  "triggered_guardrails": [],
  "closest_master_lens": "philip_fisher",
  "recommended_guardrails": ["reverse_expectation_check_before_thematic_growth", "falsification_condition_before_position"],
  "artifact_paths": {
    "html": "~/.investment-mirror/decisions/2026-06-13-tsla-robotaxi.html",
    "md": "~/.investment-mirror/decisions/2026-06-13-tsla-robotaxi.md",
    "json": "~/.investment-mirror/decisions/2026-06-13-tsla-robotaxi.json"
  }
}
```

---

## 26. Safety and compliance boundaries

### 26.1 User-facing disclaimer pattern

Use a plain disclaimer in artifacts:

> Investment Mirror does not provide investment, legal, tax, or financial advice. It helps you structure your own investment reasoning, identify unresolved issues, and keep a decision log. You remain responsible for your own decisions.

### 26.2 Output restrictions

The skill must not:

- recommend a buy/sell/hold action;
- personalize position size;
- imply suitability;
- rank securities as best for the user;
- produce target prices as product recommendations;
- claim to know the user’s true risk tolerance from transcripts alone.

### 26.3 Allowed output framing

The skill may:

- identify issues in reasoning;
- ask questions;
- require missing assumptions;
- summarize user-provided reasoning;
- log the user’s decision;
- suggest learning resources;
- map investment masters to thinking styles;
- recommend a research process.

---

## 27. Privacy requirements

### 27.1 Raw transcript handling

- Raw transcripts stay local by default.
- Do not include sensitive raw quotes in HTML unless user opts in.
- Store receipt summaries, not full private text.
- Redact likely API keys, secrets, tokens, emails, and credentials before any model call.

### 27.2 Source index

`source_index.sqlite` stores:

- source id;
- file path hash;
- date;
- summary;
- extracted episode ids;
- sensitivity flag;
- no full raw text unless user opts in.

### 27.3 Deletion

The user must be able to delete:

- source index;
- profile;
- guardrails;
- decision logs;
- individual decisions;
- generated artifacts.

---

## 28. Acceptance criteria for v0.2

### 28.1 Profile init

On a machine with local Codex and/or Claude Code history, the skill should:

- automatically discover likely transcript sources;
- show a source summary and allow exclusions;
- run the full local ingestion pipeline rather than a quick profile shortcut;
- extract at least 5 decision-relevant episodes;
- generate a profile with confidence score;
- ask calibration questions if confidence is low;
- generate `profile.html`, `profile.json`, `guardrails.yaml`, and `prompt_pack.md`;
- include 1–2 best-fit master matches, maximum 2, each with local portrait asset, source-backed biography/style/track-record summary, and read-more link;
- include recommended guardrails derived from the user's observed patterns.

Manually supplied investment examples and notes are optional enrichment sources, not the minimum viable onboarding path.

### 28.2 High-scale transcript ingestion

Given thousands of transcript files, the skill should:

- build a source manifest;
- skip unchanged files;
- run local candidate scoring before LLM classification;
- downweight code/tool-output-heavy spans;
- sample across projects and time periods;
- classify only selected candidate spans;
- generate a profile with evidence tiers.

### 28.3 Decision routine

Given a user thesis, the skill should:

- parse decision type or ask clarification;
- decompose thesis into assumptions;
- generate at least 3 issues when reasoning is incomplete;
- assign P0/P1/P2 severity;
- trigger personalized guardrails from `profile.json`;
- ask research questions;
- generate decision HTML and Markdown log;
- append to `decision_log.jsonl` when user confirms logging.

### 28.4 Mirror ask

Given a question about past decisions, the skill should:

- search local decision logs;
- answer with references to local decision IDs;
- distinguish evidence from interpretation;
- suggest one next action or guardrail.

### 28.5 Profile update

Given an existing Investment Mirror profile and new local transcripts or decision logs, the skill should:

- incrementally process only new or changed sources;
- compare recent patterns with the historical baseline;
- update `profile.json`, `guardrails.yaml`, and `profile.html`;
- preserve profile history under `profile_history/`;
- update the best-fit master match only when evidence supports a real change;
- show strengthened patterns, weakened patterns, and guardrails triggered most often.

### 28.6 Full master registry coverage

v0.2 should cover the full active master registry in Section 21: 30 masters.

- each active master has `profile.md`, `sources.yaml`, and `style_notes.md`;
- each active master has source-quality labels;
- each active master has registry fields needed for matching and HTML cards;
- each active master has a finished local visual asset; placeholder asset status is not acceptable for v0.2 completion;
- track-record and notable-result claims follow the evidence standard in Section 20.4.

Full coverage means every active v0.2 master is complete enough to appear in matching, profile artifacts, and read-more flows. Do not count a master as covered if it only has a name, weak source notes, missing style vectors, or placeholder imagery. Future masters do not need complete research or assets in v0.2.

### 28.7 HTML artifact

The HTML artifact should:

- look professional and sleek;
- include line-art master portraits;
- include Wikipedia links;
- show best-fit master match and recommended guardrails;
- avoid generic AI dashboard aesthetics;
- display issue severity clearly;
- work as a portable local artifact bundle in v0.2: one HTML file plus any copied local assets it references.
- be static-first with light interactions only, such as expanding receipts, copying prompts, opening read-more links, or toggling opted-in raw quotes.

---

## 29. First-build recommendation

Build v0.2 as three parallel tracks with one integrated first-use demo.

**Track A — Mirror profile experience**

1. Automatic Codex and Claude Code transcript discovery.
2. Source manifest and transcript indexing.
3. `/investment-profile-init` with real transcript extraction.
4. Profile evidence aggregation.
5. Best-fit master match and recommended guardrails.
6. `profile.html`, `profile.json`, `guardrails.yaml`, and `prompt_pack.md`.
7. `/investment-profile-update` incremental update flow.
8. `/investment-mirror-ask` query flow over profile, guardrails, source summaries, and decision logs.

**Track B — Decision clarification experience**

1. Issue taxonomy and guardrail YAML.
2. `/investment-decision` standalone thesis-clarification mode.
3. `/investment-decision` profile-aware mode.
4. Decision review HTML artifact.
5. Decision log preview and optional write.

**Track C — Master/style/artifact quality**

1. Full v0.2 active master registry research coverage from Section 21: 30 masters.
2. Master style vectors and profile dimensions.
3. Master line-art asset pipeline.
4. Taste-Skill-style artifact design pass.
5. Eval suite.

First-use demo:

```text
Run /investment-profile-init
  -> automatically discover local Codex and Claude Code transcripts
  -> run full profile pipeline, not quick mode
  -> show profile.html, best-fit master match, positive match rationale, and guardrails
Then run /investment-decision on a real thesis
  -> show personalized issues, questions, guardrails, and decision_review.html
```

Standalone demo:

```text
Run /investment-decision before profile setup
  -> clarify thesis using generic issue taxonomy and guardrails
  -> clearly label output as not yet personalized
```

---

## 30. References and source notes

### Agent skill / future adapter architecture

- Anthropic Agent Skills overview: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Anthropic engineering article on skills: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Anthropic public skills repository: https://github.com/anthropics/skills
- Model Context Protocol specification: https://modelcontextprotocol.io/specification/2025-06-18
- MCP resources: https://modelcontextprotocol.io/specification/2025-06-18/server/resources
- MCP tools: https://modelcontextprotocol.io/specification/2025-06-18/server/tools

### Transcript / local indexing references

- OpenAI Codex CLI features / resume: https://developers.openai.com/codex/cli/features
- OpenAI Codex CLI: https://developers.openai.com/codex/cli
- SQLite FTS5 extension: https://sqlite.org/fts5.html
- SQLite JSON functions: https://sqlite.org/json1.html
- ripgrep: https://github.com/BurntSushi/ripgrep

### HTML / design skill references

- Taste Skill: https://www.tasteskill.dev/
- Taste Skill GitHub: https://github.com/Leonxlnx/taste-skill
- Anthropic artifacts builder skill: https://mcpservers.org/agent-skills/anthropic/artifacts-builder

### Investment masters and style sources

- Investopedia greatest investors: https://www.investopedia.com/world-s-11-greatest-investors-4773356
- Dataroma superinvestors: https://www.dataroma.com/m/managers.php
- ValueSider value investors: https://valuesider.com/value-investors
- Stockcircle guru portfolios: https://stockcircle.com/
- Berkshire Hathaway shareholder letters: https://www.berkshirehathaway.com/letters/letters.html
- Oaktree Howard Marks memos: https://www.oaktreecapital.com/insights/memo
- Columbia Graham & Doddsville: https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter
- Morningstar Style Box fact sheet: https://advisor.morningstar.com/enterprise/MorningstarStyleBox_FactSheet.pdf
- Himalaya Capital: https://www.himcap.com/

---

## 31. Final positioning

Investment Mirror Skill should be remembered as:

> **A local-first investment decision linter that learns your style, shows your best-fit investment-master match, detects your recurring issues, and turns every thesis into a structured research and guardrail routine before you act.**

The product should not make users feel smarter for having opinions. It should make users more disciplined about turning opinions into testable decisions.
