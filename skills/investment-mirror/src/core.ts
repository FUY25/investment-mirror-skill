import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import YAML from "yaml";
import { MASTER_RECORDS, STYLE_DIMENSIONS, type MasterRecord, type MasterVector } from "./master_data.ts";

export type SourceType = "codex_jsonl" | "claude_jsonl" | "json_transcript" | "markdown_notes" | "text_notes" | "html_export";

export type SourceRecord = {
  source_id: string;
  path: string;
  path_hash: string;
  source_type: SourceType;
  size_bytes: number;
  modified_at: string;
  sha256: string;
  status: "new" | "changed" | "unchanged";
};

export type TurnRecord = {
  turn_id: string;
  source_id: string;
  turn_index: number;
  role: string;
  timestamp: string | null;
  text_redacted: string;
  token_estimate: number;
  code_density: number;
  decision_score: number;
  investment_score: number;
};

export type CandidateSpan = {
  span_id: string;
  source_id: string;
  start_turn: number;
  end_turn: number;
  span_type: "investment" | "general_decision";
  score: number;
  reason_codes: string[];
  sampled: boolean;
};

export type DecisionEpisode = {
  episode_id: string;
  span_id: string;
  source_id: string;
  source_alias: string;
  date: string;
  episode_type: "general_decision_reasoning" | "investment_reasoning" | "research_process" | "execution_tradeoff";
  summary: string;
  patterns: string[];
  confidence: number;
  evidence_tier: string;
  sensitivity: "low" | "medium" | "high";
  receipt_summary: string;
};

export type ProfileMatch = {
  rank: number;
  master_id: string;
  display_name: string;
  similarity: number;
  why_match: string;
  bio_summary: string;
  investment_style: string;
  notable_results_summary: string;
  read_more_url: string;
  what_to_learn: string[];
  what_not_to_copy: string[];
  asset_path: string;
};

export type CalibrationQuestionTopic = {
  dimension: string;
  why_needed: string;
  agent_instruction: string;
};

export type InvestorProfile = {
  profile_id: string;
  created_at: string;
  updated_at: string;
  synthesis_mode: "deterministic_draft_requires_llm" | "llm_synthesized";
  llm_required: boolean;
  profile_evidence_path?: string;
  profile_synthesis_prompt_path?: string;
  profile_report_template_path?: string;
  deterministic_draft_html_path?: string;
  final_model_html_path?: string;
  confidence: number;
  primary_patterns: string[];
  best_fit_master_matches: ProfileMatch[];
  match_strengths: string[];
  recommended_guardrails: Array<{ guardrail_id: string; reason: string }>;
  decision_fingerprint: Record<keyof MasterVector, number>;
  default_issue: string;
  active_guardrails: string[];
  source_summary: {
    conversations_scanned: number;
    decision_episodes_found: number;
    receipts_used: number;
    tier1_investment_episodes: number;
    tier2_investment_episodes: number;
    tier3_general_decision_episodes: number;
    calibration_recommended: boolean;
  };
  receipts: Array<{ episode_id: string; source_alias: string; date: string; summary: string; evidence_tier: string }>;
  interview_question_count?: { min: 2; max: 5 };
  calibration_question_topics?: CalibrationQuestionTopic[];
  model_interview_questions?: string[];
  model_interview_answers_summary?: string;
  risk_preference_summary?: string;
  time_horizon_summary?: string;
  constraints_summary?: string;
  presentation_next_steps?: string[];
};

export type ProfileEvidencePacket = {
  version: "0.2";
  generated_at: string;
  instructions: string;
  source_summary: InvestorProfile["source_summary"];
  deterministic_profile_draft: Pick<InvestorProfile, "primary_patterns" | "decision_fingerprint" | "default_issue" | "active_guardrails" | "match_strengths">;
  candidate_master_matches: ProfileMatch[];
  pattern_counts: Array<[string, number]>;
  receipts: InvestorProfile["receipts"];
  calibration_question_topics: CalibrationQuestionTopic[];
  interview_question_contract: {
    required: true;
    count_min: 2;
    count_max: 5;
    generated_by: "agent_llm_after_reading_evidence";
    must_include_when_unobserved: string[];
  };
  llm_output_contract: {
    must_produce: string[];
    must_not_produce: string[];
    tone: string;
  };
};

export type DecisionIssue = {
  issue_id: string;
  severity: "P0" | "P1" | "P2";
  title: string;
  issue_code: string;
  why_it_matters: string;
  triggered_guardrail: string | null;
  questions: string[];
  pass_condition: string;
  status: "open" | "partially_resolved" | "resolved_by_user_answer" | "deferred" | "accepted_risk";
};

export type DecisionReview = {
  decision_id: string;
  created_at: string;
  ticker: string | null;
  asset_or_theme: string;
  decision_type: string | null;
  user_thesis: string;
  mode: "profile_aware" | "standalone";
  decision_status: "draft" | "needs_clarification" | "blocked_by_p0_issues" | "needs_research" | "ready_for_user_decision" | "decision_logged";
  assumptions: string[];
  issues: DecisionIssue[];
  triggered_guardrails: string[];
  research_questions: string[];
  profile_context: string;
  closest_master_lens: ProfileMatch | null;
  artifact_paths: { html: string; md: string; json: string };
};

export type ProfileInitOptions = {
  output?: string;
  include?: string[];
  exclude?: string[];
  reindex?: boolean;
  now?: Date;
};

export type DecisionOptions = {
  output?: string;
  thesis: string;
  writeLog?: boolean;
  now?: Date;
};

const parserVersion = "investment-mirror-parser-v0.2.0";
const scoringVersion = "investment-mirror-scoring-v0.2.0";
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(skillRoot, "..", "..");

const investmentSignals = [
  "stock", "equity", "ticker", "buy", "sell", "add", "trim", "hold", "portfolio", "valuation", "dcf", "multiple",
  "revenue growth", "margin", "moat", "market", "thesis", "catalyst", "risk", "position", "allocation", "compounder",
  "drawdown", "earnings", "guidance", "analyst", "股票", "买入", "卖出", "加仓", "减仓", "持仓", "组合", "估值", "增长",
  "利润率", "护城河", "投资逻辑", "催化剂", "风险", "仓位", "回撤", "财报", "指引", "研报"
];

const decisionSignals = [
  "decide", "decision", "tradeoff", "trade-off", "constraint", "hypothesis", "uncertainty", "risk", "option",
  "alternative", "why", "because", "assumption", "evidence", "benchmark", "compare", "choose", "reject", "converge",
  "test", "experiment", "priority", "strategy", "should i", "pros and cons", "criteria", "rule", "选择", "取舍", "假设",
  "不确定性", "风险", "证据", "对比", "判断", "方案", "优先级", "策略", "标准", "规则", "要不要", "为什么", "因为", "验证", "实验"
];

const epistemicSignals = ["falsify", "disconfirm", "prove wrong", "base rate", "confidence", "uncertain", "unknown", "assume", "evidence", "source", "primary", "variant", "scenario"];
const actionSignals = ["buy", "sell", "add", "trim", "avoid", "watchlist", "act", "log", "decide", "commit", "position", "allocate", "enter", "exit"];

const patternToGuardrail: Record<string, string> = {
  thesis_first_reasoning: "falsification_condition_before_position",
  narrative_to_action_jump: "reverse_expectation_check_before_thematic_growth",
  research_loop_extension: "research_loop_breaker_three_variable_rule",
  contrarian_impulse: "consensus_gap_check_before_contrarian_thesis",
  product_quality_overweight: "value_capture_check_before_platform_thesis",
  macro_story_overreach: "cycle_regime_guardrail",
  authority_anchor: "matched_master_blind_spot_check",
  valuation_avoidance: "reverse_expectation_check_before_thematic_growth",
  falsification_avoidance: "falsification_condition_before_position",
  scope_expansion_under_uncertainty: "research_loop_breaker_three_variable_rule",
  framework_over_action: "research_loop_breaker_three_variable_rule"
};

const guardrailQuestions: Record<string, string[]> = {
  reverse_expectation_check_before_thematic_growth: [
    "What does the current price already assume?",
    "What revenue, margin, and multiple assumptions must be true?"
  ],
  value_capture_check_before_platform_thesis: [
    "Who captures the value?",
    "What evidence connects the trend to shareholder economics?"
  ],
  falsification_condition_before_position: [
    "What would prove this thesis wrong?",
    "Which evidence should arrive within the stated horizon?"
  ],
  consensus_gap_check_before_contrarian_thesis: [
    "What exactly is consensus?",
    "What exactly do you disagree with?"
  ],
  research_loop_breaker_three_variable_rule: [
    "What are the three variables that determine buy, wait, or reject?",
    "Which research item can change one of those variables?"
  ],
  good_company_bad_stock_check: [
    "How could this be a great company but a poor investment from here?"
  ],
  cycle_regime_guardrail: [
    "Where are we in the relevant cycle?",
    "What variable would change the cycle view?"
  ],
  user_defined_position_protocol: [
    "Is this observation, research-only, initial, confirmed, reject, or review?"
  ],
  matched_master_blind_spot_check: [
    "Which blind spot of the matched master should you avoid copying?"
  ]
};

export function expandHome(path: string) {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

function defaultOutput(output?: string) {
  return resolve(expandHome(output ?? "~/.investment-mirror"));
}

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(path: string, value: unknown) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function hashText(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

function hashFile(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sourceIdFor(path: string) {
  return `src_${hashText(path).slice(0, 12)}`;
}

function iso(date: Date) {
  return date.toISOString();
}

function todayStamp(date: Date) {
  return date.toISOString().slice(0, 10);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "decision";
}

function detectSourceType(path: string): SourceType | null {
  const lower = path.toLowerCase();
  const ext = extname(lower);
  if (lower.includes("/.codex/sessions/") && ext === ".jsonl") return "codex_jsonl";
  if (lower.includes("/.claude/projects/") && ext === ".jsonl") return "claude_jsonl";
  if (ext === ".jsonl" || ext === ".json") return "json_transcript";
  if (ext === ".md" || ext === ".markdown") return "markdown_notes";
  if (ext === ".txt" || ext === ".log") return "text_notes";
  if (ext === ".html" || ext === ".htm") return "html_export";
  return null;
}

function walkFiles(rootPath: string, exclude: string[], limit = 10000) {
  const files: string[] = [];
  const stack = [rootPath];
  const normalizedExclude = exclude.map((item) => resolve(expandHome(item)));
  while (stack.length && files.length < limit) {
    const current = stack.pop()!;
    if (!existsSync(current)) continue;
    const full = resolve(current);
    if (normalizedExclude.some((excluded) => full === excluded || full.startsWith(`${excluded}/`))) continue;
    const stats = statSync(full);
    if (stats.isDirectory()) {
      for (const entry of readdirSync(full)) {
        if (entry === "node_modules" || entry === ".git" || entry.endsWith(".assets")) continue;
        stack.push(join(full, entry));
      }
    } else if (stats.isFile() && detectSourceType(full)) {
      files.push(full);
    }
  }
  return files.sort();
}

export function discoverSources(options: ProfileInitOptions = {}): SourceRecord[] {
  const outputDir = defaultOutput(options.output);
  const previousManifest = readJson<Record<string, SourceRecord>>(join(outputDir, ".source_manifest.json"), {});
  const candidates = [
    join(homedir(), ".codex", "sessions"),
    join(homedir(), ".claude", "projects"),
    ...(options.include ?? []).map(expandHome)
  ];
  const unique = [...new Set(candidates.map((candidate) => resolve(candidate)))];
  const files = [...new Set(unique.flatMap((candidate) => walkFiles(candidate, options.exclude ?? [])))];
  return files.map((path) => {
    const stats = statSync(path);
    const sha256 = hashFile(path);
    const prior = previousManifest[path];
    const status = options.reindex || !prior ? "new" : prior.sha256 !== sha256 || prior.size_bytes !== stats.size ? "changed" : "unchanged";
    return {
      source_id: sourceIdFor(path),
      path,
      path_hash: hashText(path),
      source_type: detectSourceType(path)!,
      size_bytes: stats.size,
      modified_at: stats.mtime.toISOString(),
      sha256,
      status
    };
  });
}

export function buildSourceManifest(sources: SourceRecord[], output?: string) {
  const outputDir = defaultOutput(output);
  ensureDir(outputDir);
  const manifest = Object.fromEntries(sources.map((source) => [source.path, source]));
  writeJson(join(outputDir, ".source_manifest.json"), manifest);
  writeJson(join(outputDir, "source_manifest.json"), {
    generated_at: iso(new Date()),
    parser_version: parserVersion,
    scoring_version: scoringVersion,
    sources
  });
  return manifest;
}

export function redactSensitive(text: string) {
  return text
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_OPENAI_KEY]")
    .replace(/\b(?:ghp|github_pat|glpat|xox[baprs])_[A-Za-z0-9_:-]{12,}\b/g, "[REDACTED_TOKEN]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED_EMAIL]")
    .replace(/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, "[REDACTED_AWS_KEY]")
    .replace(/\bbearer\s+[A-Za-z0-9._~+/=-]{16,}/gi, "Bearer [REDACTED]")
    .replace(/\b((?:api|secret|token|password|passwd|pwd)[_\-\s]*[:=]\s*)['"]?[^'"\s]{8,}/gi, "$1[REDACTED]");
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

function countSignals(text: string, signals: string[]) {
  const lower = text.toLowerCase();
  return signals.reduce((count, signal) => count + (lower.includes(signal.toLowerCase()) ? 1 : 0), 0);
}

function codeDensity(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return 0;
  const codeLines = lines.filter((line) => /(```|^\s*(const|let|var|function|class|import|export|def|return|\{|\}|\/\/|#include)|;\s*$|=>|Traceback|Exception|Error:)/.test(line));
  return codeLines.length / lines.length;
}

function toolOutputDensity(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return 0;
  const toolLines = lines.filter((line) => /^(Chunk ID:|Wall time:|Exit code:|Output:|\+\+\+|---|@@|npm |yarn |pnpm |git |node_modules\/)/.test(line.trim()));
  return toolLines.length / lines.length;
}

export function scoreText(text: string) {
  const investment = countSignals(text, investmentSignals);
  const decision = countSignals(text, decisionSignals);
  const epistemic = countSignals(text, epistemicSignals);
  const action = countSignals(text, actionSignals);
  const code = codeDensity(text);
  const tool = toolOutputDensity(text);
  const decision_score = 2.0 * investment + 1.2 * decision + 1.0 * epistemic + 0.8 * action - 1.5 * code - 1.0 * tool;
  return {
    decision_score: Number(decision_score.toFixed(3)),
    investment_score: investment,
    reason_codes: [
      investment > 0 ? "investment_terms" : null,
      decision > 0 ? "decision_terms" : null,
      epistemic > 0 ? "epistemic_terms" : null,
      action > 0 ? "action_language" : null,
      code > 0.35 ? "code_density_downweighted" : null,
      tool > 0.25 ? "tool_output_downweighted" : null
    ].filter(Boolean) as string[]
  };
}

function extractTextFromUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(extractTextFromUnknown).filter(Boolean).join("\n");
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    const preferred = ["content", "text", "message", "messages", "prompt", "response", "summary", "body"];
    return preferred
      .filter((key) => key in object)
      .map((key) => extractTextFromUnknown(object[key]))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function parseJsonObjectTurn(object: Record<string, unknown>, source: SourceRecord, index: number): TurnRecord {
  const role = String(object.role ?? object.type ?? object.kind ?? (object.message as Record<string, unknown> | undefined)?.role ?? "unknown");
  const timestamp = object.timestamp ?? object.created_at ?? object.time ?? object.date ?? null;
  const rawText = extractTextFromUnknown(object);
  const text_redacted = redactSensitive(rawText).slice(0, 16000);
  const scores = scoreText(text_redacted);
  return {
    turn_id: `${source.source_id}_turn_${index}`,
    source_id: source.source_id,
    turn_index: index,
    role,
    timestamp: timestamp ? String(timestamp) : null,
    text_redacted,
    token_estimate: estimateTokens(text_redacted),
    code_density: Number(codeDensity(text_redacted).toFixed(3)),
    decision_score: scores.decision_score,
    investment_score: scores.investment_score
  };
}

export function parseSource(source: SourceRecord): TurnRecord[] {
  const raw = readFileSync(source.path, "utf8");
  const ext = extname(source.path).toLowerCase();
  if (ext === ".jsonl") {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line, index) => {
        try {
          const parsed = JSON.parse(line) as Record<string, unknown>;
          return [parseJsonObjectTurn(parsed, source, index)];
        } catch {
          const text_redacted = redactSensitive(line);
          const scores = scoreText(text_redacted);
          return [{
            turn_id: `${source.source_id}_turn_${index}`,
            source_id: source.source_id,
            turn_index: index,
            role: "unknown",
            timestamp: null,
            text_redacted,
            token_estimate: estimateTokens(text_redacted),
            code_density: Number(codeDensity(text_redacted).toFixed(3)),
            decision_score: scores.decision_score,
            investment_score: scores.investment_score
          }];
        }
      });
  }
  if (ext === ".json") {
    const parsed = JSON.parse(raw) as unknown;
    const array = Array.isArray(parsed) ? parsed : [parsed];
    return array.map((item, index) => parseJsonObjectTurn((item && typeof item === "object" ? item : { text: item }) as Record<string, unknown>, source, index));
  }
  const normalized = source.source_type === "html_export" ? raw.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ") : raw;
  const paragraphs = normalized.split(/\n\s*\n/g).map((paragraph) => paragraph.trim()).filter((paragraph) => paragraph.length > 40);
  return paragraphs.map((paragraph, index) => {
    const text_redacted = redactSensitive(paragraph).slice(0, 12000);
    const scores = scoreText(text_redacted);
    return {
      turn_id: `${source.source_id}_turn_${index}`,
      source_id: source.source_id,
      turn_index: index,
      role: "note",
      timestamp: null,
      text_redacted,
      token_estimate: estimateTokens(text_redacted),
      code_density: Number(codeDensity(text_redacted).toFixed(3)),
      decision_score: scores.decision_score,
      investment_score: scores.investment_score
    };
  });
}

export function buildCandidateSpans(turns: TurnRecord[]) {
  const bySource = groupBy(turns, (turn) => turn.source_id);
  const spans: CandidateSpan[] = [];
  for (const [sourceId, sourceTurns] of Object.entries(bySource)) {
    const ordered = sourceTurns.sort((a, b) => a.turn_index - b.turn_index);
    for (const turn of ordered) {
      if (turn.decision_score < 2.2) continue;
      const context = turn.investment_score > 0 ? 2 : 4;
      const start = Math.max(0, turn.turn_index - context);
      const end = Math.min(ordered.length - 1, turn.turn_index + context);
      const spanTurns = ordered.filter((candidate) => candidate.turn_index >= start && candidate.turn_index <= end);
      const joined = spanTurns.map((item) => item.text_redacted).join("\n");
      const scores = scoreText(joined);
      spans.push({
        span_id: `span_${hashText(`${sourceId}:${start}:${end}`).slice(0, 12)}`,
        source_id: sourceId,
        start_turn: start,
        end_turn: end,
        span_type: scores.investment_score > 0 ? "investment" : "general_decision",
        score: scores.decision_score,
        reason_codes: scores.reason_codes,
        sampled: false
      });
    }
  }
  const deduped = new Map<string, CandidateSpan>();
  for (const span of spans.sort((a, b) => b.score - a.score)) {
    const key = `${span.source_id}:${span.start_turn}:${span.end_turn}`;
    if (!deduped.has(key)) deduped.set(key, span);
  }
  return [...deduped.values()];
}

export function sampleCandidateEpisodes(spans: CandidateSpan[], sources: SourceRecord[], maxTotal = 120) {
  const sourceById = new Map(sources.map((source) => [source.source_id, source]));
  const selected: CandidateSpan[] = [];
  const buckets = new Map<string, number>();
  for (const span of spans.sort((a, b) => b.score - a.score)) {
    const source = sourceById.get(span.source_id);
    const project = source ? topProjectAlias(source.path) : "unknown";
    const month = source?.modified_at.slice(0, 7) ?? "unknown";
    const bucket = `${project}:${month}:${span.span_type}`;
    const limit = span.span_type === "investment" ? 10 : 5;
    if ((buckets.get(bucket) ?? 0) >= limit) continue;
    selected.push({ ...span, sampled: true });
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
    if (selected.length >= maxTotal) break;
  }
  return selected;
}

export function classifyDecisionEpisodes(spans: CandidateSpan[], turns: TurnRecord[], sources: SourceRecord[]) {
  const turnsBySource = groupBy(turns, (turn) => turn.source_id);
  const sourceById = new Map(sources.map((source) => [source.source_id, source]));
  const episodes: DecisionEpisode[] = [];
  for (const span of spans) {
    const spanTurns = (turnsBySource[span.source_id] ?? []).filter((turn) => turn.turn_index >= span.start_turn && turn.turn_index <= span.end_turn);
    const text = spanTurns.map((turn) => turn.text_redacted).join("\n").slice(0, 5000);
    const patterns = detectPatterns(text, span.span_type);
    if (!patterns.length && span.score < 4) continue;
    const source = sourceById.get(span.source_id);
    const hasInvestment = span.span_type === "investment";
    const episodeType: DecisionEpisode["episode_type"] = hasInvestment ? "investment_reasoning" : text.toLowerCase().includes("research") ? "research_process" : "general_decision_reasoning";
    const date = source?.modified_at.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    const evidenceTier = hasInvestment ? "tier2_investment_conversation" : "tier3_general_decision_episode";
    const summary = summarizeSpan(text, patterns, hasInvestment);
    episodes.push({
      episode_id: `ep_${hashText(span.span_id).slice(0, 12)}`,
      span_id: span.span_id,
      source_id: span.source_id,
      source_alias: source ? sourceAlias(source.path) : span.source_id,
      date,
      episode_type: episodeType,
      summary,
      patterns,
      confidence: Math.max(0.45, Math.min(0.92, span.score / 12)),
      evidence_tier: evidenceTier,
      sensitivity: text.includes("[REDACTED") ? "medium" : "low",
      receipt_summary: summary
    });
  }
  return episodes;
}

function detectPatterns(text: string, spanType: CandidateSpan["span_type"]) {
  const lower = text.toLowerCase();
  const patterns = new Set<string>();
  if (spanType === "investment" || /thesis|idea|because|why|trend|future|ai|robotaxi|platform|market/.test(lower)) patterns.add("thesis_first_reasoning");
  if (/(buy|add|position|invest|stock|equity).{0,80}(ai|tam|robotaxi|platform|disrupt|massive|secular|theme|trend)|(?:ai|tam|robotaxi|platform|disrupt|theme).{0,80}(buy|stock|position|invest)/.test(lower)) patterns.add("narrative_to_action_jump");
  if (/more research|keep researching|another source|dig deeper|expand scope|comprehensive|exhaustive/.test(lower)) patterns.add("research_loop_extension");
  if (/market is wrong|mispriced|underpricing|consensus|contrarian|everyone thinks|street/.test(lower)) patterns.add("contrarian_impulse");
  if (/product|founder|user experience|customers love|great company|quality business/.test(lower)) patterns.add("product_quality_overweight");
  if (/rates|inflation|fed|macro|cycle|recession|liquidity|regime|credit/.test(lower)) patterns.add("macro_story_overreach");
  if (/buffett|munger|ackman|analyst|guru|famous investor|superinvestor|twitter|x post/.test(lower)) patterns.add("authority_anchor");
  if (!/valuation|multiple|dcf|price|expectation|ev\/|p\/e|cash flow/.test(lower) && spanType === "investment") patterns.add("valuation_avoidance");
  if (!/falsify|wrong|disconfirm|would change my mind|prove.*wrong/.test(lower) && spanType === "investment") patterns.add("falsification_avoidance");
  if (/scope|expand|also need|while we're at it|add another/.test(lower)) patterns.add("scope_expansion_under_uncertainty");
  if (/framework|taxonomy|rubric|architecture/.test(lower) && !/decision rule|pass condition|reject/.test(lower)) patterns.add("framework_over_action");
  return [...patterns];
}

function summarizeSpan(text: string, patterns: string[], investment: boolean) {
  const firstSentence = text.replace(/\s+/g, " ").split(/(?<=[.!?。！？])\s+/)[0]?.slice(0, 220) ?? "Decision-relevant reasoning was detected.";
  const patternText = patterns.slice(0, 3).join(", ") || "decision_reasoning";
  return `${investment ? "Investment" : "General decision"} episode showing ${patternText}. Evidence summary: ${firstSentence}`;
}

export function aggregateDecisionPatterns(episodes: DecisionEpisode[]) {
  const counts = new Map<string, number>();
  for (const episode of episodes) {
    for (const pattern of episode.patterns) counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function deriveProfileVector(patternCounts: Array<[string, number]>): Record<keyof MasterVector, number> {
  const total = Math.max(1, patternCounts.reduce((sum, [, count]) => sum + count, 0));
  const value = (pattern: string) => (patternCounts.find(([id]) => id === pattern)?.[1] ?? 0) / total;
  const narrative = value("thesis_first_reasoning") + value("narrative_to_action_jump");
  const research = value("research_loop_extension") + value("framework_over_action");
  const contrarian = value("contrarian_impulse");
  const product = value("product_quality_overweight");
  const macro = value("macro_story_overreach");
  const authority = value("authority_anchor");
  const valuationAvoidance = value("valuation_avoidance");
  const falsificationAvoidance = value("falsification_avoidance");
  return {
    narrative_sensitivity: clamp(45 + narrative * 45),
    valuation_discipline: clamp(70 - valuationAvoidance * 45),
    evidence_threshold: clamp(55 + research * 24 - authority * 20),
    falsifiability_discipline: clamp(70 - falsificationAvoidance * 45),
    time_horizon_clarity: clamp(58 + research * 12),
    research_loop_tendency: clamp(38 + research * 60),
    contrarian_impulse: clamp(35 + contrarian * 60),
    product_founder_bias: clamp(25 + product * 65),
    downside_first_thinking: clamp(55 - narrative * 15 + macro * 10),
    catalyst_dependence: clamp(30 + contrarian * 24),
    cycle_regime_sensitivity: clamp(25 + macro * 70),
    systematic_vs_discretionary: clamp(40 + research * 20 - narrative * 10),
    concentration_comfort: clamp(42 + narrative * 18 + contrarian * 18),
    authority_reliance: clamp(15 + authority * 80),
    value_capture_clarity: clamp(62 - product * 18 - narrative * 12)
  };
}

export function matchMasterStyles(vector: Record<keyof MasterVector, number>) {
  const matches = MASTER_RECORDS.map((master) => {
    const distance = Math.sqrt(
      STYLE_DIMENSIONS.reduce((sum, dimension) => {
        const key = dimension.id;
        return sum + Math.pow((vector[key] ?? 50) - master.vector[key], 2);
      }, 0) / STYLE_DIMENSIONS.length
    );
    const similarity = Number(Math.max(0, 1 - distance / 100).toFixed(3));
    return { master, similarity };
  }).sort((a, b) => b.similarity - a.similarity);
  const selected = matches.slice(0, 2).filter((match, index) => index === 0 || match.similarity >= 0.58);
  return selected.map((match, index): ProfileMatch => ({
    rank: index + 1,
    master_id: match.master.id,
    display_name: match.master.displayName,
    similarity: match.similarity,
    why_match: explainMatch(match.master, vector),
    bio_summary: match.master.bioSummary,
    investment_style: match.master.investmentStyle,
    notable_results_summary: match.master.notableResultsSummary,
    read_more_url: match.master.readMoreUrl,
    what_to_learn: match.master.whatToLearn,
    what_not_to_copy: match.master.whatNotToCopy,
    asset_path: `profile.assets/masters/${match.master.id}.svg`
  }));
}

function explainMatch(master: MasterRecord, vector: Record<keyof MasterVector, number>) {
  const dimensions = STYLE_DIMENSIONS
    .map((dimension) => ({
      label: dimension.label,
      gap: Math.abs(vector[dimension.id] - master.vector[dimension.id]),
      score: vector[dimension.id]
    }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3)
    .map((item) => item.label.toLowerCase());
  return `Observed profile is closest on ${dimensions.join(", ")}. Treat ${master.displayName} as a learning archetype, not an authority signal.`;
}

export function generateInvestorProfile(options: ProfileInitOptions = {}) {
  const now = options.now ?? new Date();
  const outputDir = defaultOutput(options.output);
  ensureDir(outputDir);
  ensureDir(join(outputDir, "profile_history"));
  ensureDir(join(outputDir, "decisions"));
  const existingProfile = readJson<InvestorProfile | null>(join(outputDir, "profile.json"), null);
  const sources = discoverSources(options);
  buildSourceManifest(sources, outputDir);
  const changedSources = sources.filter((source) => source.status !== "unchanged" || options.reindex);
  if (!options.reindex && existingProfile && changedSources.length === 0) {
    const preservedProfile: InvestorProfile = {
      ...existingProfile,
      updated_at: iso(now),
      synthesis_mode: existingProfile.synthesis_mode ?? "deterministic_draft_requires_llm",
      llm_required: existingProfile.llm_required ?? true,
      profile_evidence_path: existingProfile.profile_evidence_path ?? "profile_evidence.json",
      profile_synthesis_prompt_path: existingProfile.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md",
      profile_report_template_path: existingProfile.profile_report_template_path ?? "profile_report_template.html",
      deterministic_draft_html_path: existingProfile.deterministic_draft_html_path ?? "profile_draft.html",
      final_model_html_path: existingProfile.final_model_html_path ?? "profile.html",
      source_summary: {
        ...existingProfile.source_summary,
        conversations_scanned: sources.length
      }
    };
    if (!existsSync(join(outputDir, "profile_evidence.json")) || !existsSync(join(outputDir, "profile_synthesis_prompt.md")) || !existsSync(join(outputDir, "profile_report_template.html"))) {
      writeProfileSynthesisArtifacts(outputDir, preservedProfile, [], now);
    }
    writeProfileArtifacts(outputDir, preservedProfile, now, "profile");
    return { profile: preservedProfile, sources, turns: [], spans: [], episodes: [], outputDir };
  }
  const turns = changedSources.flatMap(parseSource);
  const spans = buildCandidateSpans(turns);
  const sampled = sampleCandidateEpisodes(spans, changedSources);
  const episodes = classifyDecisionEpisodes(sampled, turns, changedSources);
  writeSqliteIndex(outputDir, sources, turns, sampled, episodes);
  const profile = buildProfileFromEpisodes(episodes, sources.length, now);
  writeProfileSynthesisArtifacts(outputDir, profile, episodes, now);
  writeProfileArtifacts(outputDir, profile, now, "profile");
  return { profile, sources, turns, spans: sampled, episodes, outputDir };
}

export function buildProfileFromEpisodes(episodes: DecisionEpisode[], sourceCount: number, now: Date): InvestorProfile {
  const counts = aggregateDecisionPatterns(episodes);
  const vector = deriveProfileVector(counts);
  const matches = matchMasterStyles(vector);
  const primaryPatterns = counts.slice(0, 5).map(([pattern]) => pattern);
  if (!primaryPatterns.length) primaryPatterns.push("thesis_first_reasoning", "research_loop_extension");
  const activeGuardrails = selectGuardrails(primaryPatterns, matches);
  const investmentEpisodes = episodes.filter((episode) => episode.episode_type === "investment_reasoning");
  const confidence = confidenceScore(episodes, investmentEpisodes.length, matches[0]?.similarity ?? 0.5);
  return {
    profile_id: `profile_${todayStamp(now).replaceAll("-", "_")}`,
    created_at: iso(now),
    updated_at: iso(now),
    synthesis_mode: "deterministic_draft_requires_llm",
    llm_required: true,
    profile_evidence_path: "profile_evidence.json",
    profile_synthesis_prompt_path: "profile_synthesis_prompt.md",
    profile_report_template_path: "profile_report_template.html",
    deterministic_draft_html_path: "profile_draft.html",
    final_model_html_path: "profile.html",
    confidence,
    primary_patterns: primaryPatterns,
    best_fit_master_matches: matches.length ? matches : [fallbackMasterMatch()],
    match_strengths: strengthsFromVector(vector),
    recommended_guardrails: activeGuardrails.map((guardrail) => ({ guardrail_id: guardrail, reason: guardrailReason(guardrail) })),
    decision_fingerprint: vector,
    default_issue: defaultIssue(primaryPatterns),
    active_guardrails: activeGuardrails,
    source_summary: {
      conversations_scanned: sourceCount,
      decision_episodes_found: episodes.length,
      receipts_used: Math.min(episodes.length, 18),
      tier1_investment_episodes: 0,
      tier2_investment_episodes: investmentEpisodes.length,
      tier3_general_decision_episodes: episodes.length - investmentEpisodes.length,
      calibration_recommended: episodes.length < 8 || investmentEpisodes.length < 3 || confidence < 0.62
    },
    receipts: episodes.slice(0, 18).map((episode) => ({
      episode_id: episode.episode_id,
      source_alias: episode.source_alias,
      date: episode.date,
      summary: episode.receipt_summary,
      evidence_tier: episode.evidence_tier
    })),
    interview_question_count: { min: 2, max: 5 },
    calibration_question_topics: calibrationQuestionTopics(primaryPatterns, vector, episodes),
    presentation_next_steps: [
      "Read profile_evidence.json and profile_synthesis_prompt.md; treat profile.json as a deterministic draft.",
      "Generate and ask 2-5 targeted interview questions before finalizing the model profile.",
      "After the user answers, synthesize the final profile in chat and write profile.html from profile_report_template.html.",
      "Offer to run /investment-decision on one current thesis as the next product step."
    ]
  };
}

function buildProfileEvidencePacket(profile: InvestorProfile, episodes: DecisionEpisode[], now: Date): ProfileEvidencePacket {
  return {
    version: "0.2",
    generated_at: iso(now),
    instructions: "This packet is deterministic evidence preparation only. Codex must synthesize the final Investment Mirror profile with the LLM using the receipts, pattern counts, candidate master matches, and guardrail rules. Do not treat the candidate matches as final without interpretation.",
    source_summary: profile.source_summary,
    deterministic_profile_draft: {
      primary_patterns: profile.primary_patterns,
      decision_fingerprint: profile.decision_fingerprint,
      default_issue: profile.default_issue,
      active_guardrails: profile.active_guardrails,
      match_strengths: profile.match_strengths
    },
    candidate_master_matches: profile.best_fit_master_matches,
    pattern_counts: aggregateDecisionPatterns(episodes),
    receipts: profile.receipts,
    calibration_question_topics: profile.calibration_question_topics ?? calibrationQuestionTopics(profile.primary_patterns, profile.decision_fingerprint, episodes),
    interview_question_contract: {
      required: true,
      count_min: 2,
      count_max: 5,
      generated_by: "agent_llm_after_reading_evidence",
      must_include_when_unobserved: [
        "risk preference / loss tolerance",
        "investment horizon",
        "liquidity or capital constraints",
        "concentration comfort",
        "decision authority and what counts as enough evidence"
      ]
    },
    llm_output_contract: {
      must_produce: [
        "positive recognition first",
        "one primary best-fit master match and at most one secondary affinity",
        "evidence-backed explanation distinguishing evidence from interpretation",
        "guardrails that make the style investable",
        "2-5 agent-generated interview questions before finalization",
        "final profile.html using profile_report_template.html after user answers",
        "false-match warning",
        "next steps after presenting the result"
      ],
      must_not_produce: [
        "buy/sell/hold recommendations",
        "position sizing",
        "unsupported annualized return claims",
        "raw transcript quotes by default",
        "identity claims like 'you are Warren Buffett'"
      ],
      tone: "60% positive recognition, 40% guardrail discipline; no shame, no astrology, no authority worship."
    }
  };
}

function writeProfileSynthesisArtifacts(outputDir: string, profile: InvestorProfile, episodes: DecisionEpisode[], now: Date) {
  const packet = buildProfileEvidencePacket(profile, episodes, now);
  writeJson(join(outputDir, "profile_evidence.json"), packet);
  writeFileSync(join(outputDir, "profile_synthesis_prompt.md"), renderProfileSynthesisPrompt(packet), "utf8");
  writeFileSync(join(outputDir, "profile_report_template.html"), renderProfileReportTemplate(profile), "utf8");
}

function renderProfileSynthesisPrompt(packet: ProfileEvidencePacket) {
  return `# Investment Mirror LLM Profile Synthesis Prompt

You are finalizing an Investment Mirror profile from a deterministic local evidence packet. The local program has already discovered sources, redacted sensitive text, scored and sampled spans, extracted receipt summaries, counted patterns, and produced candidate master matches. Your job is to synthesize the actual user-facing profile using judgment, not to rubber-stamp similarity scores.

## Inputs To Read

- \`profile_evidence.json\`
- \`guardrails.yaml\`
- \`source_manifest.json\`
- \`profile.json\` as a deterministic draft only

## Required Output In Chat

1. Start with positive recognition of the strongest evidenced decision behavior.
2. Explain the primary best-fit master match and, only if useful, one secondary affinity.
3. State why the match is useful and what not to copy.
4. Distinguish evidence from interpretation.
5. Present the required guardrails and why they make the style more investable.
6. Generate and ask 2-5 interview questions before finalizing. These questions must be created by you from the evidence gaps, not copied blindly from deterministic output.
7. The questions should pin down unobserved inputs such as risk preference, loss tolerance, time horizon, liquidity constraints, concentration comfort, and what counts as enough evidence.
8. After the user answers, write the final model-synthesized \`profile.json\` with \`synthesis_mode: "llm_synthesized"\` and produce \`profile.html\` from \`profile_report_template.html\`.
9. Suggest the next step: usually run \`/investment-decision\` on a current thesis.

## Evidence Packet Summary

\`\`\`json
${JSON.stringify({
  source_summary: packet.source_summary,
  deterministic_profile_draft: packet.deterministic_profile_draft,
  candidate_master_matches: packet.candidate_master_matches.map((match) => ({
    master_id: match.master_id,
    display_name: match.display_name,
    similarity: match.similarity,
    why_match: match.why_match
  })),
  pattern_counts: packet.pattern_counts,
  receipt_count: packet.receipts.length,
  calibration_question_topics: packet.calibration_question_topics,
  interview_question_contract: packet.interview_question_contract
}, null, 2)}
\`\`\`

## Hard Boundaries

- Do not recommend buying, selling, holding, allocating, or sizing.
- Do not expose raw transcripts unless explicitly requested.
- Do not claim the user is a master investor.
- Do not rank masters by performance.
- Do not treat candidate similarity as final without interpreting receipts.
- Do not finalize \`profile.json\` or \`profile.html\` until you have asked 2-5 targeted interview questions and incorporated the user's answers, unless the user explicitly declines calibration; in that case mark the report provisional.
`;
}

function calibrationQuestionTopics(patterns: string[], vector: Record<keyof MasterVector, number>, episodes: DecisionEpisode[]): CalibrationQuestionTopic[] {
  const text = episodes.map((episode) => `${episode.summary} ${episode.receipt_summary}`).join(" ").toLowerCase();
  const topics: CalibrationQuestionTopic[] = [];
  const add = (dimension: string, why_needed: string, agent_instruction: string) => {
    topics.push({ dimension, why_needed, agent_instruction });
  };

  add(
    "risk_preference_loss_tolerance",
    "Logs can reveal reasoning style, but they usually cannot prove how much drawdown, regret, volatility, or opportunity cost the user can tolerate.",
    "Ask one concrete question about risk preference or loss tolerance, using the user's observed patterns as context."
  );

  if (!/\b(1 year|2 years|3 years|5 years|10 years|horizon|months|years|long term|short term)\b/i.test(text) || vector.time_horizon_clarity < 65) {
    add(
      "time_horizon",
      "The evidence does not reliably pin down whether ideas are evaluated on a trading, multi-year, or owner-style horizon.",
      "Ask the user to choose or describe the default horizon they actually intend for most public-equity decisions."
    );
  }

  if (!/\b(concentrat|position|portfolio|allocation|size|sizing|drawdown|liquidity|cash)\b/i.test(text)) {
    add(
      "liquidity_concentration_constraints",
      "Transcript evidence does not establish portfolio constraints, liquidity needs, or concentration comfort.",
      "Ask about concentration comfort and any constraints that should shape process guardrails, without asking for or giving position-size advice."
    );
  }

  if (patterns.includes("research_loop_extension") || vector.research_loop_tendency >= 60) {
    add(
      "decision_threshold",
      "The profile shows a possible research-loop tendency, but the logs do not define what evidence is enough to stop researching and make a user-owned decision.",
      "Ask what two or three variables would normally be enough to move from research to a decision review."
    );
  }

  if (patterns.includes("narrative_to_action_jump") || vector.narrative_sensitivity >= 60) {
    add(
      "narrative_vs_price_threshold",
      "The evidence suggests strong narrative construction, but it does not fully reveal when the user forces price, expectations, and falsification into the thesis.",
      "Ask what check would slow the user down before a compelling story becomes an action candidate."
    );
  }

  if (vector.contrarian_impulse >= 58) {
    add(
      "contrarian_consensus_definition",
      "A contrarian-looking profile needs a clear definition of consensus, but logs may not show whether the user defines consensus rigorously.",
      "Ask how the user proves consensus is wrong rather than merely feeling differentiated from consensus."
    );
  }

  add(
    "personal_non_observable_constraints",
    "Some required calibration data is personal and cannot be inferred from logs, including tax, liquidity, employment, family, and psychological constraints.",
    "Ask whether there are non-negotiable constraints the profile must respect, while avoiding financial advice."
  );

  return topics.slice(0, 6);
}

function selectGuardrails(patterns: string[], matches: ProfileMatch[]) {
  const guardrails = new Set<string>();
  for (const pattern of patterns) {
    if (patternToGuardrail[pattern]) guardrails.add(patternToGuardrail[pattern]);
  }
  for (const match of matches.slice(0, 1)) {
    const master = MASTER_RECORDS.find((record) => record.id === match.master_id);
    master?.guardrailRelevance.slice(0, 2).forEach((guardrail) => {
      if (guardrail in guardrailQuestions) guardrails.add(guardrail);
      if (guardrail === "valuation_expectation_missing") guardrails.add("reverse_expectation_check_before_thematic_growth");
      if (guardrail === "value_capture_missing" || guardrail === "product_quality_overweight") guardrails.add("value_capture_check_before_platform_thesis");
      if (guardrail === "falsification_missing") guardrails.add("falsification_condition_before_position");
      if (guardrail === "downside_protocol_missing") guardrails.add("user_defined_position_protocol");
    });
  }
  if (!guardrails.size) {
    guardrails.add("reverse_expectation_check_before_thematic_growth");
    guardrails.add("falsification_condition_before_position");
    guardrails.add("value_capture_check_before_platform_thesis");
  }
  return [...guardrails].slice(0, 6);
}

function confidenceScore(episodes: DecisionEpisode[], investmentCount: number, matchSimilarity: number) {
  const episodeScore = Math.min(0.28, episodes.length * 0.018);
  const investmentScore = Math.min(0.18, investmentCount * 0.04);
  const matchScore = Math.max(0, matchSimilarity - 0.45) * 0.42;
  return Number(Math.min(0.9, 0.36 + episodeScore + investmentScore + matchScore).toFixed(2));
}

function strengthsFromVector(vector: Record<keyof MasterVector, number>) {
  const strengths: string[] = [];
  if (vector.narrative_sensitivity >= 60) strengths.push("You are good at forming a coherent business or market thesis before diving into details.");
  if (vector.research_loop_tendency >= 58) strengths.push("You naturally seek frameworks and evidence before forcing a decision.");
  if (vector.contrarian_impulse >= 55) strengths.push("You are willing to question consensus instead of treating price as truth.");
  if (vector.product_founder_bias >= 55) strengths.push("You notice product, founder, and business-quality signals that purely numeric screens can miss.");
  if (vector.valuation_discipline >= 65) strengths.push("You show a useful instinct for connecting thesis quality to price discipline.");
  if (!strengths.length) strengths.push("You show enough decision structure to turn recurring patterns into explicit investment guardrails.");
  return strengths.slice(0, 4);
}

function guardrailReason(guardrail: string) {
  const reasons: Record<string, string> = {
    reverse_expectation_check_before_thematic_growth: "Keeps strong narratives connected to what the current price already assumes.",
    value_capture_check_before_platform_thesis: "Separates a real trend from shareholder value capture.",
    falsification_condition_before_position: "Prevents qualitative conviction from hardening into belief.",
    consensus_gap_check_before_contrarian_thesis: "Forces contrarian claims to define exactly what consensus believes.",
    research_loop_breaker_three_variable_rule: "Turns additional research into decision criteria.",
    user_defined_position_protocol: "Requires a user-defined process status without recommending position size.",
    cycle_regime_guardrail: "Adds cycle and regime sensitivity when the asset depends on macro conditions.",
    matched_master_blind_spot_check: "Keeps the useful master style without copying the blind spot."
  };
  return reasons[guardrail] ?? "Maps a recurring profile pattern to a repeatable decision-process check.";
}

function defaultIssue(patterns: string[]) {
  if (patterns.includes("narrative_to_action_jump")) return "You often move from a correct worldview to an investable security before defining price, timing, and falsification thresholds.";
  if (patterns.includes("research_loop_extension")) return "You often extend research before defining the three variables that would change the decision.";
  if (patterns.includes("product_quality_overweight")) return "You often notice real product quality before proving shareholder value capture and price expectations.";
  return "Your strongest ideas become more investable when thesis, evidence, valuation, and falsification are written before action.";
}

function fallbackMasterMatch(): ProfileMatch {
  const master = MASTER_RECORDS.find((record) => record.id === "philip_fisher")!;
  return {
    rank: 1,
    master_id: master.id,
    display_name: master.displayName,
    similarity: 0.58,
    why_match: "Default provisional learning archetype because evidence is currently thin. Run calibration or add investment notes for a stronger match.",
    bio_summary: master.bioSummary,
    investment_style: master.investmentStyle,
    notable_results_summary: master.notableResultsSummary,
    read_more_url: master.readMoreUrl,
    what_to_learn: master.whatToLearn,
    what_not_to_copy: master.whatNotToCopy,
    asset_path: `profile.assets/masters/${master.id}.svg`
  };
}

export function profileUpdate(options: ProfileInitOptions = {}) {
  const now = options.now ?? new Date();
  const outputDir = defaultOutput(options.output);
  const existing = readJson<InvestorProfile | null>(join(outputDir, "profile.json"), null);
  const result = generateInvestorProfile({ ...options, output: outputDir, now });
  const previousPatterns = new Set(existing?.primary_patterns ?? []);
  const currentPatterns = new Set(result.profile.primary_patterns);
  const strengthened = [...currentPatterns].filter((pattern) => previousPatterns.has(pattern));
  const newlyDetected = [...currentPatterns].filter((pattern) => !previousPatterns.has(pattern));
  const weakened = [...previousPatterns].filter((pattern) => !currentPatterns.has(pattern));
  const update = {
    generated_at: iso(now),
    newly_detected_patterns: newlyDetected,
    strengthened_patterns: strengthened,
    weakened_patterns: weakened,
    guardrails_triggered_most_often: result.profile.active_guardrails,
    best_fit_master_match_changes: existing?.best_fit_master_matches?.[0]?.master_id === result.profile.best_fit_master_matches[0]?.master_id ? [] : [
      {
        previous: existing?.best_fit_master_matches?.[0]?.master_id ?? null,
        current: result.profile.best_fit_master_matches[0]?.master_id ?? null
      }
    ],
    updated_profile_path: join(outputDir, "profile.json"),
    updated_html_path: join(outputDir, "profile.html")
  };
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-profile-update.json`), update);
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-profile-update.html`), renderProfileUpdateHtml(update, result.profile), "utf8");
  return { ...result, update };
}

export function lintInvestmentDecision(options: DecisionOptions): DecisionReview {
  const now = options.now ?? new Date();
  const outputDir = defaultOutput(options.output);
  ensureDir(join(outputDir, "decisions"));
  const profile = readJson<InvestorProfile | null>(join(outputDir, "profile.json"), null);
  const parsed = parseDecision(options.thesis);
  const assumptions = decomposeThesis(options.thesis);
  const issues = generateIssues(options.thesis, parsed, profile);
  const status = issues.some((issue) => issue.severity === "P0") ? "blocked_by_p0_issues" : issues.length ? "needs_research" : "ready_for_user_decision";
  const slug = slugify(`${parsed.ticker ?? parsed.asset_or_theme} ${options.thesis}`);
  const decisionId = `dec_${todayStamp(now).replaceAll("-", "_")}_${slug.slice(0, 42).replaceAll("-", "_")}`;
  const htmlPath = join(outputDir, "decisions", `${todayStamp(now)}-${slug}.html`);
  const mdPath = join(outputDir, "decisions", `${todayStamp(now)}-${slug}.md`);
  const jsonPath = join(outputDir, "decisions", `${todayStamp(now)}-${slug}.json`);
  const triggeredGuardrails = [...new Set(issues.map((issue) => issue.triggered_guardrail).filter(Boolean) as string[])];
  const review: DecisionReview = {
    decision_id: decisionId,
    created_at: iso(now),
    ticker: parsed.ticker,
    asset_or_theme: parsed.asset_or_theme,
    decision_type: parsed.decision_type,
    user_thesis: options.thesis,
    mode: profile ? "profile_aware" : "standalone",
    decision_status: status,
    assumptions,
    issues,
    triggered_guardrails: triggeredGuardrails,
    research_questions: researchQuestionsForIssues(issues),
    profile_context: profile ? `Personalized using ${profile.profile_id}; primary patterns: ${profile.primary_patterns.join(", ")}.` : "Generic thesis-clarification mode. Run /investment-profile-init for personalization.",
    closest_master_lens: profile?.best_fit_master_matches[0] ?? null,
    artifact_paths: { html: htmlPath, md: mdPath, json: jsonPath }
  };
  writeDecisionArtifacts(review, outputDir, options.writeLog ?? false);
  return review;
}

function parseDecision(thesis: string) {
  const lower = thesis.toLowerCase();
  const decisionTypes = ["buy", "sell", "add", "trim", "hold", "avoid", "watchlist", "research_only", "portfolio_review"];
  const decision_type = decisionTypes.find((type) => lower.includes(type.replace("_", " "))) ?? (lower.includes("research") ? "research_only" : null);
  const ticker = thesis.match(/\b[A-Z]{1,5}\b/)?.[0] ?? null;
  const asset_or_theme = ticker ?? thesis.replace(/\s+/g, " ").slice(0, 80);
  return { decision_type, ticker, asset_or_theme };
}

function decomposeThesis(thesis: string) {
  const assumptions = [
    "The named business, asset, or theme has an identifiable mechanism that can affect value.",
    "The mechanism can occur within the user's stated or implied investment horizon.",
    "Shareholders or asset owners can capture enough of the value created by the mechanism.",
    "The current price does not already fully reflect the favorable version of the thesis.",
    "There is observable evidence that can confirm, weaken, or falsify the thesis."
  ];
  if (/ai|robotaxi|platform|cloud|tam|network/i.test(thesis)) assumptions.splice(2, 0, "The technology or platform trend translates into durable economics for this specific security.");
  if (/market|consensus|underprice|misprice/i.test(thesis)) assumptions.splice(1, 0, "Consensus expectations differ materially from the user's thesis.");
  return assumptions;
}

function generateIssues(thesis: string, parsed: ReturnType<typeof parseDecision>, profile: InvestorProfile | null): DecisionIssue[] {
  const lower = thesis.toLowerCase();
  const issues: DecisionIssue[] = [];
  const add = (severity: DecisionIssue["severity"], code: string, title: string, why: string, guardrail: string | null, questions: string[], pass: string) => {
    issues.push({
      issue_id: `ISSUE-${String(issues.length + 1).padStart(3, "0")}`,
      severity,
      title,
      issue_code: code,
      why_it_matters: why,
      triggered_guardrail: guardrail,
      questions,
      pass_condition: pass,
      status: "open"
    });
  };
  if (thesis.trim().length < 24) add("P0", "thesis_missing", "Thesis is not stated clearly", "A decision log needs a concrete mechanism, not only interest.", null, ["What exactly is the thesis?"], "Write a one-sentence thesis naming asset, mechanism, and horizon.");
  if (!parsed.decision_type) add("P0", "decision_type_missing", "Decision type unclear", "The process cannot distinguish buy, watchlist, research-only, add, trim, or avoid.", "user_defined_position_protocol", guardrailQuestions.user_defined_position_protocol, "Choose a process decision type.");
  if (!/(\d+\s*(m|mo|month|months|q|quarter|quarters|y|yr|year|years)|long[- ]term|short[- ]term|multi[- ]year|next\s+\d+)/i.test(thesis)) add("P0", "time_horizon_missing", "Time horizon missing", "Evidence and risk cannot be judged without a time horizon.", null, ["Over what horizon should this thesis be judged?"], "State the decision horizon.");
  if (!/valuation|multiple|dcf|price|priced|expectation|p\/e|ev\/|market cap|reverse/i.test(thesis)) add("P0", "valuation_expectation_missing", "Valuation expectation not checked", "A correct growth thesis can still disappoint if price already embeds the outcome.", "reverse_expectation_check_before_thematic_growth", guardrailQuestions.reverse_expectation_check_before_thematic_growth, "Define a price-expectation or reverse-expectation check.");
  if (!/falsif|wrong|disconfirm|change my mind|prove.*wrong|bear case/i.test(thesis)) add("P0", "falsification_missing", "No disconfirming evidence defined", "Without disconfirming evidence, the thesis can harden into belief.", "falsification_condition_before_position", guardrailQuestions.falsification_condition_before_position, "Name evidence that would weaken or falsify the thesis.");
  if (/ai|robotaxi|platform|tam|network effect|cloud|disrupt|autonomy|semiconductor/i.test(thesis) && !/capture|economics|margin|shareholder|monetiz|unit economics|pricing power/i.test(thesis)) add("P0", "value_capture_missing", "Trend-to-shareholder-value bridge missing", "A real trend can benefit users, suppliers, or competitors without benefiting this security.", "value_capture_check_before_platform_thesis", guardrailQuestions.value_capture_check_before_platform_thesis, "Explain who captures value and why shareholders benefit.");
  if (/(buy|add|position|sell|trim)/i.test(thesis) && !/risk|downside|drawdown|review|stop|limit|protocol/i.test(thesis)) add("P0", "downside_protocol_missing", "Downside protocol missing", "Action language appears before the user-defined risk protocol is explicit.", "user_defined_position_protocol", guardrailQuestions.user_defined_position_protocol, "State a user-defined process status and review boundary.");
  if (/(massive|obvious|huge|unlock|inevitable|will change everything|secular)/i.test(thesis)) add("P1", "narrative_to_action_jump", "Narrative-to-action jump", "The thesis moves from a large story to action before enough decision checks are installed.", "reverse_expectation_check_before_thematic_growth", guardrailQuestions.reverse_expectation_check_before_thematic_growth, "Insert valuation, capture, and falsification checks before action.");
  if (/market.*(wrong|missing|underpricing)|consensus|mispriced/i.test(thesis) && !/consensus believes|street expects|base case/i.test(lower)) add("P1", "consensus_gap_missing", "Consensus gap missing", "Contrarian claims need a specific consensus baseline.", "consensus_gap_check_before_contrarian_thesis", guardrailQuestions.consensus_gap_check_before_contrarian_thesis, "State what consensus believes and why you disagree.");
  if (/(moat|competition|competitive)/i.test(thesis) && !/(competitor|substitute|response|rival)/i.test(thesis)) add("P1", "competition_ignored", "Competitive response not addressed", "Moat claims need explicit competitor and substitute analysis.", null, ["How could competitors respond?", "Which customer or supplier captures bargaining power?"], "Add competitive response analysis.");
  if (/(ai|semiconductor|bank|housing|commodity|rates|fed|inflation|cycle)/i.test(thesis) && !/(cycle|regime|rates|demand|supply|liquidity)/i.test(thesis.replace(/ai/gi, ""))) add("P1", "cyclicality_ignored", "Cycle or regime not addressed", "Macro-sensitive theses need cycle variables.", "cycle_regime_guardrail", guardrailQuestions.cycle_regime_guardrail, "Name cycle variables and what would change the regime view.");
  if (/(buffett|munger|ackman|burry|analyst|guru|superinvestor|twitter|x post)/i.test(thesis)) add("P1", "authority_anchor", "Authority anchor", "Borrowed conviction should not stand in for independent evidence.", "matched_master_blind_spot_check", guardrailQuestions.matched_master_blind_spot_check, "Rewrite the thesis without authority references.");
  if (/(good|great|massive|cheap|expensive|long[- ]term)/i.test(thesis)) add("P2", "wording_vague", "Thesis wording too broad", "Broad adjectives hide assumptions that can be tested.", null, ["Which word should be converted into a measurable claim?"], "Replace vague wording with concrete assumptions.");
  if (profile) {
    for (const guardrail of profile.active_guardrails) {
      if (!issues.some((issue) => issue.triggered_guardrail === guardrail) && profile.primary_patterns.some((pattern) => lower.includes(pattern.replaceAll("_", " ")))) {
        add("P2", "prompt_pack_recommended", "Personalized prompt would help", "A recurring Investment Mirror pattern appears in this thesis.", guardrail, guardrailQuestions[guardrail] ?? [], "Run or save the matching prompt.");
      }
    }
  }
  return issues;
}

function researchQuestionsForIssues(issues: DecisionIssue[]) {
  const questions = new Set<string>();
  for (const issue of issues) {
    for (const question of issue.questions) questions.add(question);
  }
  if (!questions.size) {
    questions.add("What evidence would change this decision status?");
    questions.add("What is the strongest reason this could be a good idea but a poor investment?");
    questions.add("What should be reviewed next?");
  }
  return [...questions].slice(0, 8);
}

export function mirrorAsk(question: string, output?: string) {
  const outputDir = defaultOutput(output);
  const profile = readJson<InvestorProfile | null>(join(outputDir, "profile.json"), null);
  const logPath = join(outputDir, "decision_log.jsonl");
  const decisions = existsSync(logPath)
    ? readFileSync(logPath, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as DecisionReview)
    : [];
  const lower = question.toLowerCase();
  const evidence: string[] = [];
  let interpretation = "";
  if (lower.includes("guardrail") || lower.includes("触发")) {
    const counts = countBy(decisions.flatMap((decision) => decision.triggered_guardrails ?? []));
    evidence.push(...Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([guardrail, count]) => `${guardrail}: ${count}`));
    interpretation = evidence.length ? "The most frequent guardrails indicate the process checks that appear most often in logged decisions." : "No logged decision guardrails are available yet.";
  } else if (lower.includes("ai") || lower.includes("人工智能")) {
    const aiDecisions = decisions.filter((decision) => /ai|artificial intelligence|人工智能/i.test(decision.user_thesis));
    evidence.push(...aiDecisions.map((decision) => `${decision.decision_id}: ${decision.issues.map((issue) => issue.issue_code).join(", ")}`));
    interpretation = aiDecisions.length ? "AI-related ideas most often need valuation, value-capture, and falsification checks." : "No AI-related decision logs were found.";
  } else if (lower.includes("blocked") || lower.includes("p0")) {
    const blocked = decisions.filter((decision) => decision.decision_status === "blocked_by_p0_issues");
    evidence.push(...blocked.map((decision) => `${decision.decision_id}: ${decision.issues.filter((issue) => issue.severity === "P0").map((issue) => issue.title).join("; ")}`));
    interpretation = blocked.length ? "These decisions were not research-ready because at least one blocker remained open." : "No blocked P0 decision logs were found.";
  } else {
    if (profile) {
      evidence.push(`Profile ${profile.profile_id}: ${profile.primary_patterns.join(", ")}`);
      evidence.push(`Active guardrails: ${profile.active_guardrails.join(", ")}`);
    }
    evidence.push(...decisions.slice(-5).map((decision) => `${decision.decision_id}: ${decision.decision_status}`));
    interpretation = profile ? "Your profile and recent logs suggest the next useful action is to apply the highest-frequency guardrail to the next thesis." : "No profile exists yet; run /investment-profile-init to create personalized memory.";
  }
  return {
    question,
    evidence,
    interpretation,
    next_guardrail_or_review_action: profile?.active_guardrails[0] ?? "Run /investment-profile-init",
    raw_transcript_exposed: false
  };
}

function writeProfileArtifacts(outputDir: string, profile: InvestorProfile, now: Date, kind: "profile" | "update") {
  copyMasterAssets(profile, outputDir);
  writeJson(join(outputDir, "profile.json"), profile);
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-${kind}.json`), profile);
  writeFileSync(join(outputDir, "guardrails.yaml"), YAML.stringify({
    version: "0.2",
    active_guardrails: profile.active_guardrails.map((guardrail) => ({
      guardrail_id: guardrail,
      name: guardrailName(guardrail),
      trigger: guardrailReason(guardrail),
      required_questions: guardrailQuestions[guardrail] ?? [],
      appears_in_decision: "Generated as P0/P1/P2 issue language in /investment-decision."
    }))
  }), "utf8");
  writeFileSync(join(outputDir, "prompt_pack.md"), renderPromptPack(profile), "utf8");
  writeFileSync(join(outputDir, "InvestmentMirror.md"), renderInvestmentMirror(profile), "utf8");
  const html = renderProfileHtml(profile);
  writeFileSync(join(outputDir, "profile_draft.html"), html, "utf8");
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-${kind}-draft.html`), html, "utf8");
  if (!existsSync(join(outputDir, "profile.html"))) {
    writeFileSync(join(outputDir, "profile.html"), html, "utf8");
  }
}

function writeDecisionArtifacts(review: DecisionReview, outputDir: string, writeLog: boolean) {
  copyDecisionAssets(review, outputDir);
  writeFileSync(review.artifact_paths.html, renderDecisionHtml(review), "utf8");
  writeFileSync(review.artifact_paths.md, renderDecisionMarkdown(review), "utf8");
  writeJson(review.artifact_paths.json, review);
  if (writeLog) {
    appendFileSync(join(outputDir, "decision_log.jsonl"), `${JSON.stringify({ ...review, decision_status: "decision_logged" })}\n`, "utf8");
    appendFileSync(join(outputDir, "InvestmentMirror.md"), `\n## Decision ${review.decision_id}\n\n- Status: ${review.decision_status}\n- Thesis: ${review.user_thesis}\n- Issues: ${review.issues.map((issue) => `${issue.severity} ${issue.title}`).join("; ")}\n`, "utf8");
  }
}

function copyMasterAssets(profile: InvestorProfile, outputDir: string) {
  for (const match of profile.best_fit_master_matches) {
    const source = findMasterAsset(match.master_id);
    const target = join(outputDir, "profile.assets", "masters", `${match.master_id}.svg`);
    ensureDir(dirname(target));
    copyFileSync(source, target);
  }
}

function copyDecisionAssets(review: DecisionReview, outputDir: string) {
  const masterId = review.closest_master_lens?.master_id;
  if (!masterId) return;
  const source = findMasterAsset(masterId);
  const assetDir = review.artifact_paths.html.replace(/\.html$/, ".assets");
  const target = join(assetDir, "masters", `${masterId}.svg`);
  ensureDir(dirname(target));
  copyFileSync(source, target);
}

function findMasterAsset(masterId: string) {
  const rootAsset = join(repoRoot, "assets", "masters", `${masterId}.svg`);
  if (existsSync(rootAsset)) return rootAsset;
  return join(skillRoot, "assets", "masters", `${masterId}.svg`);
}

function renderPromptPack(profile: InvestorProfile) {
  const master = profile.best_fit_master_matches[0];
  return `# Investment Mirror Prompt Pack

## Anti-narrative Prompt

Help me separate a true story from an investable security. Name the story, the security-specific bridge, the price expectations, and the evidence that would disconfirm my view. Do not tell me whether to buy.

## Valuation Discipline Prompt

Run a reverse-expectation check on this thesis. What must the current price already assume, and what would have to be true for expected return to be attractive? Do not provide a recommendation.

## Falsification Prompt

Turn my thesis into testable claims. For each claim, list evidence that would weaken it within my stated horizon.

## Consensus Gap Prompt

Define market consensus for this idea, then define exactly where my view differs. List the evidence that would prove consensus right.

## Research-loop Breaker Prompt

Reduce this investment idea to three decision variables. For each variable, state pass, fail, and unknown conditions. Stop adding sources unless they change one variable.

## Good-company-bad-stock Prompt

Assume this is a great company but a poor stock from here. What would make that true? Check valuation, value capture, competition, and expectations.

## Post-decision Review Prompt

Review this logged decision without judging the outcome. Which assumptions were explicit, which were missing, and which guardrail would have improved the process?

## Best-fit Master Learning Prompt

I am attracted to this investment idea. Based on my Investment Mirror profile, my best-fit master match is ${master.display_name}.

First explain what is strong about how I am approaching this thesis. Then help me make the thesis more investable using:
1. the strengths of ${master.display_name}-style research;
2. a valuation expectation check;
3. a good-company-bad-stock check;
4. a falsification condition;
5. a value-capture check.

Do not tell me whether to buy. Turn my thesis into issues, questions, and guardrails.
`;
}

function renderInvestmentMirror(profile: InvestorProfile) {
  return `# Investment Mirror

## Current Investment Profile

Primary pattern: ${profile.primary_patterns.join(", ")}.
Default issue: ${profile.default_issue}

## Best-Fit Master Match

Closest match: ${profile.best_fit_master_matches[0].display_name}
Why: ${profile.best_fit_master_matches[0].why_match}
Recommended guardrails: ${profile.active_guardrails.join("; ")}.

## Active Guardrails

${profile.active_guardrails.map((guardrail, index) => `${index + 1}. ${guardrailName(guardrail)}.`).join("\n")}

## Decision Log Index

| Date | Asset | Decision Type | Status | Triggered Issues |
|---|---|---|---|---|

## Open Follow-ups

- Apply ${guardrailName(profile.active_guardrails[0])} to the next thesis before recording a decision.
`;
}

function renderDecisionMarkdown(review: DecisionReview) {
  return `# Decision Review ${review.decision_id}

Investment Mirror does not provide investment, legal, tax, or financial advice. It helps structure your reasoning, identify unresolved issues, and keep a decision log. You remain responsible for your own decisions.

## Decision Summary

- Mode: ${review.mode}
- Process status: ${review.decision_status}
- Decision type: ${review.decision_type ?? "unclear"}
- Asset/theme: ${review.asset_or_theme}

## Thesis

${review.user_thesis}

## Assumptions

${review.assumptions.map((assumption, index) => `${index + 1}. ${assumption}`).join("\n")}

## Issues

${review.issues.map((issue) => `### [${issue.severity}] ${issue.issue_id}: ${issue.title}

Why this matters: ${issue.why_it_matters}

Triggered guardrail: ${issue.triggered_guardrail ?? "none"}

Pass condition: ${issue.pass_condition}
`).join("\n")}

## Guided Research Questions

${review.research_questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}
`;
}

function renderProfileReportTemplate(profile: InvestorProfile) {
  const primary = profile.best_fit_master_matches[0];
  const secondary = profile.best_fit_master_matches[1];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror Model Profile</title>
  ${sharedReportCss()}
</head>
<body>
  <!--
    Investment Mirror model report template.
    The deterministic program provided evidence only. Codex/LLM must fill this template after asking 2-5 targeted interview questions and incorporating the user's answers.
    Required final output path: profile.html
    Required final JSON path: profile.json with synthesis_mode="llm_synthesized"
  -->
  <main class="page-shell model-template" data-template="investment-mirror-profile-v0.2">
    <section class="hero-grid">
      <div>
        <p class="kicker">Investment Mirror</p>
        <h1>{{model_positive_recognition_headline}}</h1>
        <p class="lead">{{model_positive_recognition_summary}}</p>
        <div class="confidence"><span>Model confidence</span><strong>{{model_confidence_percent}}</strong></div>
      </div>
      <article class="master-card primary">
        <img src="${escapeHtml(primary.asset_path)}" alt="${escapeHtml(primary.display_name)} line-art portrait">
        <div>
          <p class="label">Primary best-fit master match</p>
          <h2>{{primary_master_name}}</h2>
          <p>{{model_master_match_rationale}}</p>
          <a href="${escapeHtml(primary.read_more_url)}">Read more</a>
        </div>
      </article>
    </section>

    <section class="report-stack">
      <article class="sheet">
        <h2>What The Evidence Shows</h2>
        <p>{{evidence_summary}}</p>
      </article>
      <article class="sheet offset">
        <h2>What The Model Infers</h2>
        <p>{{interpretation_summary}}</p>
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Interview Calibration</h2>
        <p>{{interview_questions_asked}}</p>
        <p>{{interview_answers_summary}}</p>
      </article>
      <article>
        <h2>Risk Preference And Constraints</h2>
        <p>{{risk_preference_summary}}</p>
        <p>{{time_horizon_summary}}</p>
        <p>{{constraints_summary}}</p>
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Decision Fingerprint</h2>
        <p>{{model_decision_fingerprint_summary}}</p>
      </article>
      <article>
        <h2>False-Match Warning</h2>
        <p>{{false_match_warning}}</p>
      </article>
    </section>

    <section>
      <h2>Best-Fit Master Match / Style Avatar</h2>
      ${renderMasterCard(primary)}
      ${secondary ? renderMasterCard(secondary) : ""}
    </section>

    <section>
      <h2>Guardrails To Make This Style Investable</h2>
      <div class="guardrails">
        ${profile.active_guardrails.map((guardrail) => `<article><span>${escapeHtml(guardrailName(guardrail))}</span><p>{{model_guardrail_${escapeHtml(guardrail)}_reason}}</p><ul>${(guardrailQuestions[guardrail] ?? []).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section>
      <h2>Receipts Used</h2>
      <div class="receipts">
        ${profile.receipts.map((receipt) => `<details><summary>${escapeHtml(receipt.source_alias)} · ${escapeHtml(receipt.date)} · ${escapeHtml(receipt.evidence_tier)}</summary><p>${escapeHtml(receipt.summary)}</p></details>`).join("")}
      </div>
    </section>

    <section class="section-grid">
      <article>
        <h2>Next Step</h2>
        <p>{{recommended_next_step}}</p>
      </article>
      <article>
        <h2>Local Memory</h2>
        <dl>
          <div><dt>Evidence packet</dt><dd>profile_evidence.json</dd></div>
          <div><dt>Source index</dt><dd>source_index.sqlite</dd></div>
          <div><dt>Draft artifact</dt><dd>profile_draft.html</dd></div>
        </dl>
      </article>
    </section>

    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}

function renderProfileHtml(profile: InvestorProfile) {
  const primary = profile.best_fit_master_matches[0];
  const secondary = profile.best_fit_master_matches[1];
  const bars = Object.entries(profile.decision_fingerprint).map(([key, value]) => {
    const label = STYLE_DIMENSIONS.find((dimension) => dimension.id === key)?.label ?? key;
    return `<div class="fingerprint-row"><span>${escapeHtml(label)}</span><strong>${Math.round(value)}</strong><i style="--v:${Math.round(value)}"></i></div>`;
  }).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror Profile</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell">
    <section class="draft-banner">
      <p class="kicker">Deterministic evidence draft</p>
      <p>This artifact was generated by the local evidence compiler. The skill workflow must ask 2-5 targeted interview questions, synthesize the final profile with the model, and write the final report from <code>profile_report_template.html</code>.</p>
    </section>
    <section class="hero-grid">
      <div>
        <p class="kicker">Investment Mirror</p>
        <h1>Your decision style is taking shape.</h1>
        <p class="lead">${escapeHtml(profile.match_strengths[0])}</p>
        <div class="confidence"><span>Profile confidence</span><strong>${Math.round(profile.confidence * 100)}%</strong></div>
      </div>
      <article class="master-card primary">
        <img src="${escapeHtml(primary.asset_path)}" alt="${escapeHtml(primary.display_name)} line-art portrait">
        <div>
          <p class="label">Primary best-fit master match</p>
          <h2>${escapeHtml(primary.display_name)}</h2>
          <p>${escapeHtml(primary.why_match)}</p>
          <a href="${escapeHtml(primary.read_more_url)}">Read more</a>
        </div>
      </article>
    </section>

    <section class="report-stack">
      <article class="sheet">
        <h2>Why This Match Is Good</h2>
        ${profile.match_strengths.map((strength) => `<p>${escapeHtml(strength)}</p>`).join("")}
      </article>
      <article class="sheet offset">
        <h2>Best-Fit Master Match / Style Avatar</h2>
        ${renderMasterCard(primary)}
        ${secondary ? renderMasterCard(secondary) : ""}
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Decision Fingerprint</h2>
        <div class="fingerprint">${bars}</div>
      </article>
      <article>
        <h2>Primary Patterns</h2>
        ${profile.primary_patterns.map((pattern) => `<div class="pattern"><strong>${escapeHtml(humanize(pattern))}</strong><p>${escapeHtml(patternInterpretation(pattern))}</p></div>`).join("")}
      </article>
    </section>

    <section>
      <h2>Receipts</h2>
      <div class="receipts">
        ${profile.receipts.map((receipt) => `<details><summary>${escapeHtml(receipt.source_alias)} · ${escapeHtml(receipt.date)} · ${escapeHtml(receipt.evidence_tier)}</summary><p>${escapeHtml(receipt.summary)}</p></details>`).join("")}
      </div>
    </section>

    <section>
      <h2>Guardrails To Make This Style Investable</h2>
      <div class="guardrails">
        ${profile.active_guardrails.map((guardrail) => `<article><span>${escapeHtml(guardrailName(guardrail))}</span><p>${escapeHtml(guardrailReason(guardrail))}</p><ul>${(guardrailQuestions[guardrail] ?? []).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section class="section-grid">
      <article>
        <h2>Prompt Pack Preview</h2>
        <p>Use the prompt pack to turn the profile into repeatable thesis-review routines.</p>
        <ol>
          <li>Anti-narrative prompt</li>
          <li>Valuation discipline prompt</li>
          <li>Falsification prompt</li>
          <li>Best-fit master learning prompt</li>
        </ol>
      </article>
      <article>
        <h2>Local Memory Initialized</h2>
        <dl>
          <div><dt>Memory file</dt><dd>InvestmentMirror.md</dd></div>
          <div><dt>Decision episodes</dt><dd>${profile.source_summary.decision_episodes_found}</dd></div>
          <div><dt>Active guardrails</dt><dd>${profile.active_guardrails.length}</dd></div>
        </dl>
      </article>
    </section>

    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}

function renderMasterCard(match: ProfileMatch) {
  return `<div class="master-detail">
    <img src="${escapeHtml(match.asset_path)}" alt="${escapeHtml(match.display_name)} line-art portrait">
    <div>
      <h3>${escapeHtml(match.display_name)} <span>${Math.round(match.similarity * 100)}%</span></h3>
      <p>${escapeHtml(match.bio_summary)}</p>
      <p><strong>Investment style:</strong> ${escapeHtml(match.investment_style)}</p>
      <p><strong>Notable context:</strong> ${escapeHtml(match.notable_results_summary)}</p>
      <p><strong>What to learn:</strong> ${escapeHtml(match.what_to_learn.join("; "))}</p>
      <p><strong>What not to copy:</strong> ${escapeHtml(match.what_not_to_copy.join("; "))}</p>
    </div>
  </div>`;
}

function renderDecisionHtml(review: DecisionReview) {
  const assetPath = review.closest_master_lens ? `${basename(review.artifact_paths.html, ".html")}.assets/masters/${review.closest_master_lens.master_id}.svg` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror Decision Review</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell">
    <section class="hero-grid compact">
      <div>
        <p class="kicker">Decision Review</p>
        <h1>${escapeHtml(review.asset_or_theme)}</h1>
        <p class="lead">${escapeHtml(review.profile_context)}</p>
        <div class="confidence"><span>Process status</span><strong>${escapeHtml(humanize(review.decision_status))}</strong></div>
      </div>
      ${review.closest_master_lens ? `<article class="master-card primary"><img src="${escapeHtml(assetPath)}" alt="${escapeHtml(review.closest_master_lens.display_name)} line-art portrait"><div><p class="label">Relevant master lens</p><h2>${escapeHtml(review.closest_master_lens.display_name)}</h2><p>${escapeHtml(review.closest_master_lens.why_match)}</p></div></article>` : `<article class="master-card primary"><div><p class="label">Standalone mode</p><h2>Generic thesis clarification</h2><p>Run /investment-profile-init to personalize guardrails.</p></div></article>`}
    </section>
    <section class="sheet">
      <h2>Decision Summary</h2>
      <p>${escapeHtml(review.user_thesis)}</p>
    </section>
    <section class="section-grid">
      <article>
        <h2>Thesis Decomposition</h2>
        <ol>${review.assumptions.map((assumption) => `<li>${escapeHtml(assumption)}</li>`).join("")}</ol>
      </article>
      <article>
        <h2>Guided Research Questions</h2>
        <ol>${review.research_questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
      </article>
    </section>
    <section>
      <h2>P0 / P1 / P2 Issues</h2>
      <div class="issues">${review.issues.map((issue) => `<article><span class="badge ${issue.severity.toLowerCase()}">${issue.severity}</span><h3>${escapeHtml(issue.title)}</h3><p>${escapeHtml(issue.why_it_matters)}</p><p><strong>Guardrail:</strong> ${escapeHtml(issue.triggered_guardrail ?? "none")}</p><p><strong>Pass condition:</strong> ${escapeHtml(issue.pass_condition)}</p></article>`).join("")}</div>
    </section>
    <section class="sheet">
      <h2>Decision Log Preview</h2>
      <p>Decision ID: ${escapeHtml(review.decision_id)}</p>
      <p>Status labels are process labels only. This artifact does not recommend buy, sell, or hold actions.</p>
    </section>
    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}

function renderProfileUpdateHtml(update: unknown, profile: InvestorProfile) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Investment Mirror Profile Update</title>${sharedReportCss()}</head><body><main class="page-shell"><section class="sheet"><p class="kicker">Profile Update</p><h1>${escapeHtml(profile.profile_id)}</h1><pre>${escapeHtml(JSON.stringify(update, null, 2))}</pre></section></main></body></html>`;
}

function sharedReportCss() {
  return `<style>
  :root { color-scheme: light; --ink:#292521; --muted:#756e67; --line:#ded4c8; --paper:#faf8f4; --sheet:#fffdf8; --copper:#b96b2f; --soft:#efe4d7; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height:1.55; }
  body::before { content:""; position:fixed; inset:0; pointer-events:none; opacity:.28; background-image: radial-gradient(var(--copper) .7px, transparent .7px); background-size: 18px 18px; mask-image: linear-gradient(140deg, transparent 0%, black 18%, transparent 70%); }
  .page-shell { width:min(1160px, calc(100% - 36px)); margin:0 auto; padding:42px 0 56px; }
  .draft-banner { border:1px solid var(--copper); border-radius:8px; background:#fff8ef; padding:16px 18px; margin-bottom:22px; }
  .draft-banner p:last-child { margin:0; color:var(--muted); }
  code { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
  .hero-grid { display:grid; grid-template-columns: 1.05fr .95fr; gap:32px; min-height: min(680px, calc(100dvh - 44px)); align-items:center; }
  .hero-grid.compact { min-height: 520px; }
  .kicker, .label { margin:0 0 16px; color:var(--copper); font:700 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace; text-transform:uppercase; letter-spacing:.12em; }
  h1 { margin:0; max-width:740px; font-family: Georgia, "Times New Roman", serif; font-weight:500; font-size: clamp(44px, 7vw, 86px); line-height:.98; letter-spacing:0; }
  h2 { margin:0 0 18px; font-size: clamp(26px, 3vw, 42px); line-height:1.05; font-family: Georgia, "Times New Roman", serif; font-weight:500; letter-spacing:0; }
  h3 { margin:0 0 8px; font-size:21px; }
  .lead { max-width:62ch; color:var(--muted); font-size:20px; margin:24px 0; }
  .confidence { display:inline-flex; gap:16px; align-items:center; border-top:1px solid var(--ink); border-bottom:1px solid var(--line); padding:12px 0; min-width:280px; }
  .confidence span { color:var(--muted); }
  .confidence strong { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .master-card, .sheet, .section-grid > article, .guardrails article, .issues article { background:rgba(255,253,248,.92); border:1px solid var(--line); border-radius:8px; }
  .master-card { display:grid; grid-template-columns: 170px 1fr; gap:22px; padding:20px; box-shadow: 0 24px 60px rgba(81, 51, 28, .09); transform: rotate(-1deg); }
  .master-card img { width:100%; border-radius:8px; border:1px solid var(--line); background:var(--soft); }
  .master-card a { color:var(--copper); font-weight:700; text-decoration:none; }
  .report-stack { display:grid; grid-template-columns: 1fr 1.2fr; gap:24px; align-items:start; margin:42px 0; }
  .sheet { padding:30px; box-shadow:0 18px 50px rgba(81, 51, 28, .07); }
  .sheet.offset { margin-top:34px; }
  .master-detail { display:grid; grid-template-columns:120px 1fr; gap:18px; border-top:1px solid var(--line); padding-top:18px; margin-top:18px; }
  .master-detail img { width:120px; border:1px solid var(--line); border-radius:8px; }
  .master-detail h3 span { color:var(--copper); font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:15px; }
  .section-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin:42px 0; }
  .section-grid > article { padding:28px; }
  .fingerprint-row { display:grid; grid-template-columns: 1fr 44px; gap:12px; align-items:center; border-top:1px solid var(--line); padding:11px 0; position:relative; }
  .fingerprint-row i { grid-column:1 / -1; display:block; height:3px; background:linear-gradient(90deg, var(--copper) calc(var(--v) * 1%), transparent 0); border-bottom:1px solid var(--line); }
  .pattern, .receipts details { border-top:1px solid var(--line); padding:14px 0; }
  .guardrails, .issues { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:18px; }
  .guardrails article, .issues article { padding:22px; }
  .guardrails span, .badge { display:inline-block; border:1px solid var(--copper); color:var(--copper); padding:4px 8px; border-radius:6px; font:700 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace; margin-bottom:12px; }
  .badge.p0 { border-color:#9f2f2d; color:#9f2f2d; }
  .badge.p1 { border-color:#956400; color:#956400; }
  .badge.p2 { border-color:#1f6c9f; color:#1f6c9f; }
  dl div { display:flex; justify-content:space-between; border-top:1px solid var(--line); padding:12px 0; gap:20px; }
  dt { color:var(--muted); }
  footer { margin-top:42px; color:var(--muted); border-top:1px solid var(--line); padding-top:18px; font-size:14px; }
  pre { white-space:pre-wrap; overflow:auto; background:#2f2b27; color:#fff8ef; border-radius:8px; padding:18px; }
  @media (max-width: 820px) { .hero-grid, .report-stack, .section-grid, .guardrails, .issues, .master-card, .master-detail { grid-template-columns:1fr; } h1 { font-size:44px; } .page-shell { width:min(100% - 24px, 1160px); padding-top:24px; } .hero-grid { min-height:auto; padding:32px 0; } .sheet.offset { margin-top:0; } }
  </style>`;
}

function writeSqliteIndex(outputDir: string, sources: SourceRecord[], turns: TurnRecord[], spans: CandidateSpan[], episodes: DecisionEpisode[]) {
  const payload = join(outputDir, ".sqlite_payload.json");
  writeJson(payload, { sources, turns, spans, episodes, parserVersion, scoringVersion });
  const script = join(skillRoot, "scripts", "sqlite_bridge.py");
  const result = spawnSync("python3", [script, payload, join(outputDir, "source_index.sqlite")], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`sqlite bridge failed: ${result.stderr || result.stdout}`);
  }
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const id = key(item);
    groups[id] ??= [];
    groups[id].push(item);
    return groups;
  }, {});
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}

function topProjectAlias(path: string) {
  const parts = path.split("/");
  const marker = parts.includes(".claude") ? "projects" : parts.includes(".codex") ? "sessions" : "";
  const index = marker ? parts.indexOf(marker) : -1;
  return index >= 0 && parts[index + 1] ? parts[index + 1] : basename(dirname(path));
}

function sourceAlias(path: string) {
  const rel = relative(homedir(), path);
  return rel.startsWith("..") ? basename(path) : `~/${rel.split("/").slice(0, 5).join("/")}`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function guardrailName(id: string) {
  return humanize(id.replace(/_before_.+$/, ""));
}

function humanize(id: string) {
  return id.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function patternInterpretation(pattern: string) {
  const interpretations: Record<string, string> = {
    thesis_first_reasoning: "Strength: you can form coherent theses. Guardrail: define evidence and valuation before action.",
    narrative_to_action_jump: "Strength: you see important trends early. Guardrail: prove valuation and value capture.",
    research_loop_extension: "Strength: you seek depth. Guardrail: turn research into three decision variables.",
    contrarian_impulse: "Strength: you question consensus. Guardrail: define the exact consensus gap.",
    product_quality_overweight: "Strength: you notice product quality. Guardrail: test shareholder value capture.",
    macro_story_overreach: "Strength: you see regimes. Guardrail: connect macro to asset-level sensitivity.",
    authority_anchor: "Strength: you learn from strong investors. Guardrail: rewrite the thesis independently."
  };
  return interpretations[pattern] ?? "Turn this recurring pattern into a concrete process check before action.";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}
