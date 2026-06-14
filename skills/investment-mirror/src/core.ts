import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync, unlinkSync } from "node:fs";
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
  analysis_scope?: "full_candidate_ledger";
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
  similarity?: number;
  candidate_similarity?: number;
  match_confidence?: "low" | "medium" | "high";
  selection_basis?: string;
  why_match: string;
  bio_summary: string;
  investment_style: string;
  notable_results_summary: string;
  read_more_url: string;
  what_to_learn: string[];
  what_not_to_copy: string[];
  asset_path: string;
};

export type ProfileLifecycleState = "draft" | "interview_required" | "finalized" | "provisional" | "needs_sources";

export type CalibrationQuestionTopic = {
  dimension: string;
  why_needed: string;
  agent_instruction: string;
};

export type InvestorProfile = {
  profile_id: string;
  artifact_kind: "deterministic_profile_inputs" | "llm_synthesized_profile";
  profile_state: ProfileLifecycleState;
  created_at: string;
  updated_at: string;
  synthesis_mode: "evidence_only_requires_llm" | "llm_synthesized";
  llm_required: boolean;
  provisional: boolean;
  needs_sources?: boolean;
  source_guidance?: string;
  unknown_dimensions: string[];
  candidate_profile_inputs_path?: string;
  profile_evidence_path?: string;
  profile_synthesis_prompt_path?: string;
  profile_finalization_schema_path?: string;
  profile_report_template_path?: string;
  candidate_report_html_path?: string;
  final_rendered_html_path?: string;
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
    calibration_recommended?: boolean;
    calibration_status?: "interview_required" | "partial" | "complete";
  };
  receipts: Array<{ episode_id: string; source_alias: string; date: string; summary: string; evidence_tier: string }>;
  interview_question_count?: { min: 2; max: 5 };
  agent_interview_questions?: string[];
  calibration_question_topics?: CalibrationQuestionTopic[];
  model_interview_questions?: string[];
  model_interview_answers_summary?: string;
  evidence_summary?: string;
  interpretation_summary?: string;
  false_match_warning?: string;
  risk_preference_summary?: string;
  time_horizon_summary?: string;
  constraints_summary?: string;
  presentation_next_steps?: string[];
};

export type ProfileStateArtifact = {
  version: "0.2";
  state: ProfileLifecycleState;
  generated_at: string;
  candidate_profile_inputs_path: string;
  final_profile_path: string;
  final_html_path: string;
  required_next_action: string;
  transitions: Array<{ from: ProfileLifecycleState | null; to: ProfileLifecycleState; at: string; reason: string }>;
  finalization_contract: {
    command: string;
    requires_agent_questions: true;
    requires_answer_summary_or_explicit_decline: true;
    requires_llm_synthesized_profile_json: true;
    requires_model_generated_profile_content: true;
    requires_deterministic_profile_html_render: true;
    provisional_allowed_when_user_declines_interview: true;
  };
};

export type ProfileEvidencePacket = {
  version: "0.2";
  generated_at: string;
  instructions: string;
  artifact_kind: "deterministic_evidence_packet";
  analysis_scope: "full_candidate_ledger";
  source_summary: InvestorProfile["source_summary"];
  deterministic_profile_inputs: Pick<InvestorProfile, "primary_patterns" | "decision_fingerprint" | "default_issue" | "active_guardrails" | "match_strengths">;
  candidate_master_matches: ProfileMatch[];
  candidate_decision_episodes: DecisionEpisode[];
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
  model_phase_contract: {
    phases: Array<{ id: string; owner: "agent_llm" | "deterministic_tool"; required_output: string }>;
    subagent_recommended_for_full_ledger: boolean;
    final_master_match_owner: "agent_llm";
    final_profile_content_owner: "agent_llm";
    final_profile_html_owner: "deterministic_renderer";
  };
};

export type FinalProfileContent = {
  hero?: {
    positive_recognition?: string;
    status_line?: string;
  };
  evidence?: {
    summary?: string;
    receipt_ids?: string[];
  };
  interpretation?: {
    summary?: string;
    rejected_or_downweighted_signals?: string[];
  };
  master_lens?: {
    why_this_lens?: string;
    what_to_learn?: string[];
    what_not_to_copy?: string[];
  };
  interview_calibration?: {
    questions?: string[];
    answers_summary?: string;
    unknown_dimensions?: string[];
  };
  guardrail_protocols?: Array<{
    guardrail_id?: string;
    title?: string;
    rationale?: string;
    questions?: string[];
  }>;
  next_process_step?: string;
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

export type MirrorMemoryEvidence = {
  id: string;
  kind: "profile" | "candidate_profile_inputs" | "profile_receipt" | "decision" | "profile_history" | "source_summary" | "redacted_turn";
  source: string;
  summary: string;
  matched_terms: string[];
};

export type ProfileInitOptions = {
  output?: string;
  include?: string[];
  exclude?: string[];
  reindex?: boolean;
  since?: string;
  now?: Date;
};

export type FinalizeProfileOptions = {
  output?: string;
  synthesizedProfilePath?: string;
  synthesizedProfile?: Partial<InvestorProfile> & Record<string, unknown>;
  finalContentPath?: string;
  finalContent?: FinalProfileContent;
  finalHtmlPath?: string;
  finalHtml?: string;
  questionsPath?: string;
  agentQuestions?: string[];
  answersSummary?: string;
  provisional?: boolean;
  declinedInterview?: boolean;
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
  "decide", "decides", "decided", "deciding", "decision", "decisions", "optional", "option", "options", "tradeoff", "trade-off", "constraint", "hypothesis", "uncertainty", "risk",
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

// Counts full-file reads done for hashing. Used by tests to verify that an
// unchanged corpus is not re-hashed on a second discovery run (B4).
let hashFileReadCount = 0;
function hashFile(path: string) {
  hashFileReadCount++;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
export function __hashFileReadCount() {
  return hashFileReadCount;
}
export function __resetHashFileReadCount() {
  hashFileReadCount = 0;
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
  // Self-ingestion guard (B5): never index the IM output dir, the default IM
  // home, or the skill/repo path, so the profiler cannot eat its own outputs.
  const selfExcludes = [outputDir, expandHome("~/.investment-mirror"), skillRoot, repoRoot].map((path) => resolve(path));
  const userExcludes = (options.exclude ?? []).map((path) => resolve(expandHome(path)));
  const exclude = [...userExcludes, ...selfExcludes];
  const candidates = [
    join(homedir(), ".codex", "sessions"),
    join(homedir(), ".claude", "projects"),
    ...(options.include ?? []).map(expandHome)
  ];
  const unique = [...new Set(candidates.map((candidate) => resolve(candidate)))];
  const files = [...new Set(unique.flatMap((candidate) => walkFiles(candidate, exclude)))];
  return files.map((path) => {
    const stats = statSync(path);
    const modified_at = stats.mtime.toISOString();
    const prior = previousManifest[path];
    let sha256: string;
    let status: SourceRecord["status"];
    if (options.reindex || !prior) {
      sha256 = hashFile(path);
      status = "new";
    } else if (prior.size_bytes === stats.size && prior.modified_at === modified_at) {
      // Short-circuit (B4): mtime + size match the prior manifest, so skip the
      // full read and reuse the stored hash. Headline scalability promise.
      sha256 = prior.sha256;
      status = "unchanged";
    } else {
      sha256 = hashFile(path);
      status = prior.sha256 !== sha256 ? "changed" : "unchanged";
    }
    return {
      source_id: sourceIdFor(path),
      path,
      path_hash: hashText(path),
      source_type: detectSourceType(path)!,
      size_bytes: stats.size,
      modified_at,
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
  return signals.reduce((count, signal) => count + (matchesSignal(lower, signal) ? 1 : 0), 0);
}

function matchesSignal(lowerText: string, signal: string) {
  const lowerSignal = signal.toLowerCase();
  if (/^[a-z0-9_-]+$/.test(lowerSignal)) {
    return new RegExp(`\\b${escapeRegExp(lowerSignal)}\\b`).test(lowerText);
  }
  return lowerText.includes(lowerSignal);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        analysis_scope: "full_candidate_ledger"
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

export function collectCandidateEvidenceLedger(spans: CandidateSpan[]) {
  return spans
    .sort((a, b) => b.score - a.score || a.source_id.localeCompare(b.source_id) || a.start_turn - b.start_turn)
    .map((span) => ({ ...span, analysis_scope: "full_candidate_ledger" as const }));
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
  // thesis_first_reasoning is a candidate hint only. Require co-occurrence of a
  // thesis/idea anchor with a forward-looking claim rather than firing on any
  // generic token (market|ai|because|why), which made it near-constant (D4).
  const thesisAnchor = /\b(thesis|idea|conviction|bull case|the case for|i (?:believe|think|want to (?:buy|own|invest)))\b/.test(lower);
  const forwardClaim = /\b(will|could|should|going to|about to|future|long[- ]?term|secular|massive|huge|inevitable|unlock|multi[- ]?bagger|10x|growth curve|compounding)\b/.test(lower);
  if (thesisAnchor && forwardClaim) patterns.add("thesis_first_reasoning");
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
    candidate_similarity: match.similarity,
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
  return `Observed candidate vector is closest on ${dimensions.join(", ")}. Treat ${master.displayName} as a learning archetype, not an authority signal.`;
}

export function generateInvestorProfile(options: ProfileInitOptions = {}) {
  const now = options.now ?? new Date();
  const outputDir = defaultOutput(options.output);
  ensureDir(outputDir);
  ensureDir(join(outputDir, "profile_history"));
  ensureDir(join(outputDir, "decisions"));
  const existingInputs = readJson<InvestorProfile | null>(join(outputDir, "profile_candidate_inputs.json"), null);
  const sources = discoverSources(options);
  buildSourceManifest(sources, outputDir);
  if (sources.length === 0) {
    // No discovered sources: surface an explicit needs-input state rather than
    // fabricating a master match from an empty vector.
    const profile = buildNeedsSourcesProfile(now);
    writeJson(join(outputDir, "profile_candidate_inputs.json"), profile);
    writeProfileState(outputDir, "needs_sources", now, profile.source_guidance!);
    return { profile, sources, turns: [], spans: [], episodes: [], outputDir };
  }
  const changedSources = filterSourcesForProfileRun(sources, options, now);
  if (!options.reindex && existingInputs && changedSources.length === 0) {
    const preservedProfile: InvestorProfile = {
      ...existingInputs,
      artifact_kind: "deterministic_profile_inputs",
      profile_state: "interview_required",
      updated_at: iso(now),
      synthesis_mode: "evidence_only_requires_llm",
      llm_required: true,
      provisional: true,
      unknown_dimensions: existingInputs.unknown_dimensions?.length ? existingInputs.unknown_dimensions : defaultUnknownDimensions(),
      candidate_profile_inputs_path: "profile_candidate_inputs.json",
      profile_evidence_path: existingInputs.profile_evidence_path ?? "profile_evidence.json",
      profile_synthesis_prompt_path: existingInputs.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md",
      profile_finalization_schema_path: existingInputs.profile_finalization_schema_path ?? "profile_finalization_schema.json",
      profile_report_template_path: existingInputs.profile_report_template_path ?? "profile_report_template.html",
      candidate_report_html_path: existingInputs.candidate_report_html_path ?? "profile_candidate_report.html",
      final_rendered_html_path: existingInputs.final_rendered_html_path ?? existingInputs.final_model_html_path ?? "profile.html",
      source_summary: {
        ...existingInputs.source_summary,
        conversations_scanned: sources.length
      }
    };
    if (!existsSync(join(outputDir, "profile_evidence.json")) || !existsSync(join(outputDir, "profile_synthesis_prompt.md")) || !existsSync(join(outputDir, "profile_report_template.html")) || !existsSync(join(outputDir, "profile_finalization_schema.json"))) {
      writeProfileSynthesisArtifacts(outputDir, preservedProfile, [], now);
    }
    writeCandidateProfileArtifacts(outputDir, preservedProfile, now, "profile");
    return { profile: preservedProfile, sources, turns: [], spans: [], episodes: [], outputDir };
  }
  const turns = changedSources.flatMap(parseSource);
  const spans = buildCandidateSpans(turns);
  const candidateLedger = collectCandidateEvidenceLedger(spans);
  const currentEpisodes = classifyDecisionEpisodes(candidateLedger, turns, changedSources);
  if (changedSources.length) writeSqliteIndex(outputDir, sources, turns, candidateLedger, currentEpisodes);
  const priorEvidence = readJson<ProfileEvidencePacket | null>(join(outputDir, "profile_evidence.json"), null);
  const mergedEpisodes = mergeDecisionEpisodes(priorEvidence?.candidate_decision_episodes ?? [], currentEpisodes);
  const profile = buildProfileFromEpisodes(mergedEpisodes, sources.length, now);
  writeProfileSynthesisArtifacts(outputDir, profile, mergedEpisodes, now);
  writeCandidateProfileArtifacts(outputDir, profile, now, "profile");
  return { profile, sources, turns, spans: candidateLedger, episodes: mergedEpisodes, outputDir };
}

function filterSourcesForProfileRun(sources: SourceRecord[], options: ProfileInitOptions, now: Date) {
  if (options.reindex) return sources;
  const cutoff = options.since ? sinceToDate(options.since, now) : null;
  if (cutoff) {
    return sources.filter((source) => new Date(source.modified_at).getTime() >= cutoff.getTime());
  }
  return sources.filter((source) => source.status !== "unchanged");
}

function sinceToDate(since: string, now: Date) {
  const trimmed = since.trim().toLowerCase();
  const relative = trimmed.match(/^(\d+)\s*(d|day|days|w|week|weeks|m|mo|month|months)$/);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];
    const days = unit.startsWith("w") ? amount * 7 : unit.startsWith("m") ? amount * 31 : amount;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }
  const parsed = new Date(since);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid --since value: ${since}`);
  return parsed;
}

function mergeDecisionEpisodes(prior: DecisionEpisode[], current: DecisionEpisode[]) {
  const merged = new Map<string, DecisionEpisode>();
  for (const episode of prior) merged.set(episode.episode_id, episode);
  for (const episode of current) merged.set(episode.episode_id, episode);
  return [...merged.values()].sort((a, b) => b.confidence - a.confidence || b.date.localeCompare(a.date));
}

function defaultUnknownDimensions() {
  return [
    "risk_preference_loss_tolerance",
    "time_horizon",
    "liquidity_or_personal_constraints",
    "concentration_comfort",
    "what_counts_as_enough_evidence"
  ];
}

function writeProfileState(outputDir: string, state: ProfileLifecycleState, now: Date, reason: string) {
  const previous = readJson<ProfileStateArtifact | null>(join(outputDir, "profile_state.json"), null);
  const priorState = previous?.state ?? null;
  const transitions = previous?.transitions ?? [];
  transitions.push({ from: priorState, to: state, at: iso(now), reason });
  const artifact: ProfileStateArtifact = {
    version: "0.2",
    state,
    generated_at: iso(now),
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    final_profile_path: "profile.json",
    final_html_path: "profile.html",
    required_next_action: state === "needs_sources"
      ? "0 sources discovered. Add --include paths or confirm ~/.codex/sessions / ~/.claude/projects contain transcripts, then re-run /investment-profile-init."
      : state === "interview_required"
      ? "Agent/LLM must read profile_evidence.json, perform full evidence analysis, ask 2-5 targeted interview questions, synthesize profile JSON, generate final HTML, then run profile-finalize."
      : "Profile finalization state recorded.",
    transitions,
    finalization_contract: {
      command: "node scripts/cli.mjs profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary \"...\" --content profile_model_content.json --output ~/.investment-mirror",
      requires_agent_questions: true,
      requires_answer_summary_or_explicit_decline: true,
      requires_llm_synthesized_profile_json: true,
      requires_model_generated_profile_content: true,
      requires_deterministic_profile_html_render: true,
      provisional_allowed_when_user_declines_interview: true
    }
  };
  writeJson(join(outputDir, "profile_state.json"), artifact);
}

function buildNeedsSourcesProfile(now: Date): InvestorProfile {
  const guidance = "0 sources discovered. Add --include paths to your notes/transcripts, or confirm that ~/.codex/sessions or ~/.claude/projects contain transcript files, then re-run /investment-profile-init.";
  return {
    profile_id: `profile_${todayStamp(now).replaceAll("-", "_")}`,
    artifact_kind: "deterministic_profile_inputs",
    profile_state: "needs_sources",
    created_at: iso(now),
    updated_at: iso(now),
    synthesis_mode: "evidence_only_requires_llm",
    llm_required: true,
    provisional: true,
    needs_sources: true,
    source_guidance: guidance,
    unknown_dimensions: defaultUnknownDimensions(),
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    confidence: 0,
    primary_patterns: [],
    best_fit_master_matches: [],
    match_strengths: [],
    recommended_guardrails: [],
    decision_fingerprint: deriveProfileVector([]),
    default_issue: "No local sources were discovered, so no decision patterns could be derived yet.",
    active_guardrails: [],
    source_summary: {
      conversations_scanned: 0,
      decision_episodes_found: 0,
      receipts_used: 0,
      tier1_investment_episodes: 0,
      tier2_investment_episodes: 0,
      tier3_general_decision_episodes: 0,
      calibration_recommended: false
    },
    receipts: [],
    presentation_next_steps: [
      guidance,
      "Re-run /investment-profile-init once at least one source is available."
    ]
  };
}

export function buildProfileFromEpisodes(episodes: DecisionEpisode[], sourceCount: number, now: Date): InvestorProfile {
  const counts = aggregateDecisionPatterns(episodes);
  const vector = deriveProfileVector(counts);
  const matches = matchMasterStyles(vector);
  const primaryPatterns = counts.slice(0, 5).map(([pattern]) => pattern);
  if (!primaryPatterns.length) primaryPatterns.push("thesis_first_reasoning", "research_loop_extension");
  const activeGuardrails = selectGuardrails(primaryPatterns, matches);
  const investmentEpisodes = episodes.filter((episode) => episode.episode_type === "investment_reasoning");
  const confidence = confidenceScore(episodes, investmentEpisodes.length, matchScore(matches[0]) ?? 0.5);
  return {
    profile_id: `profile_${todayStamp(now).replaceAll("-", "_")}`,
    artifact_kind: "deterministic_profile_inputs",
    profile_state: "interview_required",
    created_at: iso(now),
    updated_at: iso(now),
    synthesis_mode: "evidence_only_requires_llm",
    llm_required: true,
    provisional: true,
    unknown_dimensions: defaultUnknownDimensions(),
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    profile_evidence_path: "profile_evidence.json",
    profile_synthesis_prompt_path: "profile_synthesis_prompt.md",
    profile_finalization_schema_path: "profile_finalization_schema.json",
    profile_report_template_path: "profile_report_template.html",
    candidate_report_html_path: "profile_candidate_report.html",
    final_rendered_html_path: "profile.html",
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
      "Read profile_evidence.json and profile_synthesis_prompt.md; treat profile_candidate_inputs.json as candidate inputs, not a profile.",
      "Use the agent/LLM phase, with subagents if needed, to interpret the full candidate ledger and decide which episodes matter.",
      "Generate and ask 2-5 targeted interview questions from evidence gaps.",
      "After the user answers, synthesize profile JSON and structured final profile content, then run profile-finalize to render, validate, and write artifacts.",
      "Offer to run /investment-decision on one current thesis as the next product step."
    ]
  };
}

export function finalizeProfile(options: FinalizeProfileOptions) {
  const now = options.now ?? new Date();
  const outputDir = defaultOutput(options.output);
  const candidateInputs = readJson<InvestorProfile | null>(join(outputDir, "profile_candidate_inputs.json"), null);
  if (!candidateInputs) throw new Error("Missing profile_candidate_inputs.json. Run profile-init/profile-update before profile-finalize.");
  const synthesized = loadSynthesizedProfile(options);
  const questions = loadAgentQuestions(options);
  const finalContent = loadFinalProfileContent(options, synthesized);
  const answerSummary = (options.answersSummary ?? String(synthesized.model_interview_answers_summary ?? "")).trim();
  const provisional = Boolean(options.provisional || options.declinedInterview || synthesized.provisional);
  validateFinalizationInput(synthesized, questions, answerSummary, provisional);
  if (!finalContent && !hasLegacyFinalHtml(options, synthesized)) {
    throw new Error("profile-finalize requires model-generated final content via --content PATH/final_profile_content, or legacy model-generated final HTML via --html PATH.");
  }
  const unknownDimensions = normalizeStringArray(synthesized.unknown_dimensions).length
    ? normalizeStringArray(synthesized.unknown_dimensions)
    : provisional ? defaultUnknownDimensions() : [];

  const finalProfile: InvestorProfile = {
    ...candidateInputs,
    ...synthesized,
    profile_id: String(synthesized.profile_id ?? candidateInputs.profile_id),
    artifact_kind: "llm_synthesized_profile",
    profile_state: provisional ? "provisional" : "finalized",
    created_at: candidateInputs.created_at,
    updated_at: iso(now),
    synthesis_mode: "llm_synthesized",
    llm_required: false,
    provisional,
    unknown_dimensions: unknownDimensions,
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    profile_evidence_path: "profile_evidence.json",
    profile_synthesis_prompt_path: "profile_synthesis_prompt.md",
    profile_finalization_schema_path: "profile_finalization_schema.json",
    profile_report_template_path: "profile_report_template.html",
    candidate_report_html_path: "profile_candidate_report.html",
    final_rendered_html_path: "profile.html",
    confidence: normalizeFinalConfidence(synthesized.confidence ?? candidateInputs.confidence, provisional, unknownDimensions),
    agent_interview_questions: questions,
    model_interview_questions: questions,
    model_interview_answers_summary: answerSummary || (provisional ? "User declined or did not complete interview calibration." : ""),
    evidence_summary: String(synthesized.evidence_summary ?? candidateInputs.evidence_summary ?? evidenceSummaryFromInputs(candidateInputs)),
    interpretation_summary: String(synthesized.interpretation_summary ?? candidateInputs.interpretation_summary ?? "LLM synthesis completed from local evidence receipts and interview calibration."),
    false_match_warning: String(synthesized.false_match_warning ?? "The master match is a learning archetype, not an identity claim or authority signal."),
    source_summary: finalSourceSummary(synthesized.source_summary, candidateInputs.source_summary, provisional),
    best_fit_master_matches: normalizeFinalMatches(synthesized.best_fit_master_matches, candidateInputs.best_fit_master_matches)
  };
  delete (finalProfile as Record<string, unknown>).final_profile_html;
  delete (finalProfile as Record<string, unknown>).final_profile_html_path;
  delete (finalProfile as Record<string, unknown>).final_profile_content;
  delete (finalProfile as Record<string, unknown>).final_profile_content_path;
  delete (finalProfile as Record<string, unknown>).final_model_html_path;
  validateProfileSafety(finalProfile);
  const finalHtml = finalContent ? renderFinalProfileHtml(finalProfile, finalContent, outputDir) : loadLegacyFinalProfileHtml(options, synthesized);
  validateFinalProfileHtml(finalHtml, provisional);
  writeJson(join(outputDir, "profile.json"), finalProfile);
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-${finalProfile.profile_state}-profile.json`), finalProfile);
  writeFileSync(join(outputDir, "profile.html"), finalHtml, "utf8");
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-${finalProfile.profile_state}-profile.html`), finalHtml, "utf8");
  writeProfileState(outputDir, finalProfile.profile_state, now, provisional ? "Profile artifact validated and written as provisional after explicit interview decline or incomplete calibration." : "LLM-synthesized profile artifact validated and written after interview calibration.");
  return { profile: finalProfile, outputDir };
}

function loadSynthesizedProfile(options: FinalizeProfileOptions) {
  if (options.synthesizedProfile) return options.synthesizedProfile;
  if (!options.synthesizedProfilePath) throw new Error("profile-finalize requires --synthesis PATH or an in-memory synthesizedProfile.");
  return readJson<Partial<InvestorProfile> & Record<string, unknown>>(expandHome(options.synthesizedProfilePath), {});
}

function loadFinalProfileContent(options: FinalizeProfileOptions, synthesized: Record<string, unknown>): FinalProfileContent | null {
  if (options.finalContent) return options.finalContent;
  const contentPath = options.finalContentPath ?? (typeof synthesized.final_profile_content_path === "string" ? synthesized.final_profile_content_path : undefined);
  if (contentPath) return readJson<FinalProfileContent>(expandHome(contentPath), {});
  if (synthesized.final_profile_content && typeof synthesized.final_profile_content === "object") return synthesized.final_profile_content as FinalProfileContent;
  return null;
}

function hasLegacyFinalHtml(options: FinalizeProfileOptions, synthesized: Record<string, unknown>) {
  return Boolean(options.finalHtml || options.finalHtmlPath || typeof synthesized.final_profile_html_path === "string" || typeof synthesized.final_profile_html === "string");
}

function loadLegacyFinalProfileHtml(options: FinalizeProfileOptions, synthesized: Record<string, unknown>) {
  if (options.finalHtml) return options.finalHtml;
  const htmlPath = options.finalHtmlPath ?? (typeof synthesized.final_profile_html_path === "string" ? synthesized.final_profile_html_path : undefined);
  if (htmlPath) return readFileSync(expandHome(htmlPath), "utf8");
  if (typeof synthesized.final_profile_html === "string") return synthesized.final_profile_html;
  throw new Error("profile-finalize requires model-generated final content via --content PATH/final_profile_content, or legacy model-generated final HTML via --html PATH.");
}

function loadAgentQuestions(options: FinalizeProfileOptions) {
  if (options.agentQuestions) return normalizeStringArray(options.agentQuestions);
  if (!options.questionsPath) return [];
  const parsed = readJson<unknown>(expandHome(options.questionsPath), []);
  if (Array.isArray(parsed)) return normalizeStringArray(parsed);
  if (parsed && typeof parsed === "object") {
    const object = parsed as Record<string, unknown>;
    return normalizeStringArray(object.questions ?? object.agent_interview_questions ?? object.model_interview_questions);
  }
  return [];
}

function validateFinalizationInput(synthesized: Record<string, unknown>, questions: string[], answerSummary: string, provisional: boolean) {
  if (questions.length < 2 || questions.length > 5) throw new Error("profile-finalize requires 2-5 agent-generated interview questions.");
  if (!provisional && answerSummary.length < 20) throw new Error("profile-finalize requires a substantive interview answer summary unless --provisional/--declined-interview is set.");
  const unknownDimensions = normalizeStringArray(synthesized.unknown_dimensions);
  if (provisional && unknownDimensions.length === 0) throw new Error("Provisional finalization requires explicit unknown_dimensions.");
  if (!Array.isArray(synthesized.best_fit_master_matches) || synthesized.best_fit_master_matches.length === 0) {
    throw new Error("profile-finalize requires model-selected best_fit_master_matches; deterministic candidate matches cannot be promoted automatically.");
  }
  for (const field of ["evidence_summary", "interpretation_summary", "risk_preference_summary", "time_horizon_summary", "constraints_summary", "false_match_warning"]) {
    if (!provisional && String(synthesized[field] ?? "").trim().length < 12) throw new Error(`profile-finalize missing synthesized field: ${field}`);
  }
}

function validateFinalProfileHtml(html: string, provisional: boolean) {
  const required = [
    /<html[\s>]/i,
    /Investment Mirror/i,
    /evidence/i,
    /interpretation|infers|model/i,
    /interview|calibration/i,
    /master/i,
    /guardrail|protocol/i,
    /does not provide investment|not provide investment/i
  ];
  const missing = required.find((pattern) => !pattern.test(html));
  if (missing) throw new Error(`Model-generated profile HTML is missing required report content: ${missing}`);
  if (!provisional && /provisional/i.test(html.slice(0, 5000))) {
    throw new Error("Finalized profile HTML appears to label itself provisional.");
  }
  const forbidden = [
    /<script[\s>]/i,
    /<iframe[\s>]/i,
    /\son(?:load|error|click|mouseover)\s*=/i,
    /\{\{[^}]+\}\}/,
    /\bwe recommend\b/i,
    /\byou should (buy|sell|hold|allocate|size)\b/i,
    /\b(strong buy|strong sell)\b/i,
    /\bposition size should\b/i,
    /\bsuitable for you\b/i
  ];
  const matched = forbidden.find((pattern) => pattern.test(html));
  if (matched) throw new Error(`Model-generated profile HTML contains forbidden or unsafe content: ${matched}`);
}

function validateProfileSafety(profile: InvestorProfile) {
  const serialized = JSON.stringify(profile);
  const forbidden = [
    /\bwe recommend\b/i,
    /\byou should (buy|sell|hold|allocate|size)\b/i,
    /\b(strong buy|strong sell)\b/i,
    /\bposition size should\b/i,
    /\bsuitable for you\b/i
  ];
  const matched = forbidden.find((pattern) => pattern.test(serialized));
  if (matched) throw new Error(`Final profile contains forbidden recommendation/suitability language: ${matched}`);
  if (profile.best_fit_master_matches.length < 1 || profile.best_fit_master_matches.length > 2) {
    throw new Error("Final profile must contain one primary master match and at most one secondary affinity.");
  }
  if (profile.synthesis_mode === "llm_synthesized") {
    const scoredFinalMatch = profile.best_fit_master_matches.find((match) => "similarity" in match || "candidate_similarity" in match);
    if (scoredFinalMatch) throw new Error("Final profile master matches must not expose deterministic similarity scores.");
    if ("calibration_recommended" in profile.source_summary) throw new Error("Final profile source_summary must not expose deterministic calibration_recommended.");
  }
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeMatches(value: unknown, fallback: ProfileMatch[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback.slice(0, 2);
  return value.slice(0, 2).map((item, index) => ({
    ...fallback[Math.min(index, Math.max(0, fallback.length - 1))],
    ...(item && typeof item === "object" ? item as Partial<ProfileMatch> : {}),
    rank: index + 1
  })) as ProfileMatch[];
}

function normalizeFinalConfidence(value: unknown, provisional: boolean, unknownDimensions: string[]) {
  const parsed = typeof value === "number" && Number.isFinite(value) ? value : Number(value);
  const raw = Number.isFinite(parsed) ? parsed : 0.58;
  const ceiling = provisional || unknownDimensions.length ? 0.7 : 0.9;
  return Number(Math.max(0.2, Math.min(ceiling, raw)).toFixed(2));
}

function finalSourceSummary(value: unknown, fallback: InvestorProfile["source_summary"], provisional: boolean): InvestorProfile["source_summary"] {
  const object = value && typeof value === "object" ? value as Partial<InvestorProfile["source_summary"]> : {};
  return {
    conversations_scanned: Number(object.conversations_scanned ?? fallback.conversations_scanned ?? 0),
    decision_episodes_found: Number(object.decision_episodes_found ?? fallback.decision_episodes_found ?? 0),
    receipts_used: Number(object.receipts_used ?? fallback.receipts_used ?? 0),
    tier1_investment_episodes: Number(object.tier1_investment_episodes ?? fallback.tier1_investment_episodes ?? 0),
    tier2_investment_episodes: Number(object.tier2_investment_episodes ?? fallback.tier2_investment_episodes ?? 0),
    tier3_general_decision_episodes: Number(object.tier3_general_decision_episodes ?? fallback.tier3_general_decision_episodes ?? 0),
    calibration_status: provisional ? "partial" : "complete"
  };
}

function matchScore(match: ProfileMatch | null | undefined) {
  if (!match) return null;
  if (typeof match.candidate_similarity === "number") return match.candidate_similarity;
  if (typeof match.similarity === "number") return match.similarity;
  return null;
}

function normalizeFinalMatches(value: unknown, candidateMatches: ProfileMatch[]) {
  if (!Array.isArray(value) || value.length === 0) throw new Error("Final profile requires model-selected best_fit_master_matches.");
  return value.slice(0, 2).map((item, index): ProfileMatch => {
    if (!item || typeof item !== "object") throw new Error("Each final master match must be an object.");
    const object = item as Partial<ProfileMatch>;
    const masterId = String(object.master_id ?? "").trim();
    if (!masterId) throw new Error("Each final master match must include master_id.");
    const candidate = candidateMatches.find((match) => match.master_id === masterId);
    const master = MASTER_RECORDS.find((record) => record.id === masterId);
    if (!candidate && !master) throw new Error(`Unknown final master_id: ${masterId}`);
    const base = master ? masterRecordToMatch(master, index + 1) : candidate!;
    const matchConfidence = normalizeMatchConfidence((object as Record<string, unknown>).match_confidence, candidate);
    return {
      rank: index + 1,
      master_id: masterId,
      display_name: String(object.display_name ?? base.display_name),
      why_match: String(object.why_match ?? base.why_match),
      bio_summary: String(object.bio_summary ?? base.bio_summary),
      investment_style: String(object.investment_style ?? base.investment_style),
      notable_results_summary: String(object.notable_results_summary ?? base.notable_results_summary),
      read_more_url: String(object.read_more_url ?? base.read_more_url),
      what_to_learn: normalizeOptionalStringArray(object.what_to_learn, base.what_to_learn),
      what_not_to_copy: normalizeOptionalStringArray(object.what_not_to_copy, base.what_not_to_copy),
      asset_path: String(object.asset_path ?? base.asset_path),
      match_confidence: matchConfidence,
      selection_basis: String((object as Record<string, unknown>).selection_basis ?? "model_selected_from_evidence_interview_and_master_records")
    };
  });
}

function masterRecordToMatch(master: MasterRecord, rank: number): ProfileMatch {
  return {
    rank,
    master_id: master.id,
    display_name: master.displayName,
    why_match: `Model-selected learning archetype. Treat ${master.displayName} as a process lens, not an authority signal.`,
    bio_summary: master.bioSummary,
    investment_style: master.investmentStyle,
    notable_results_summary: master.notableResultsSummary,
    read_more_url: master.readMoreUrl,
    what_to_learn: master.whatToLearn,
    what_not_to_copy: master.whatNotToCopy,
    asset_path: `profile.assets/masters/${master.id}.svg`
  };
}

function normalizeMatchConfidence(value: unknown, candidate: ProfileMatch | undefined): "low" | "medium" | "high" {
  if (value === "low" || value === "medium" || value === "high") return value;
  const score = matchScore(candidate);
  if (score === null) return "medium";
  if (score >= 0.78) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}

function normalizeOptionalStringArray(value: unknown, fallback: string[]) {
  const normalized = normalizeStringArray(value);
  return normalized.length ? normalized : fallback;
}

function evidenceSummaryFromInputs(profile: InvestorProfile) {
  return `${profile.source_summary.decision_episodes_found} candidate decision episodes across ${profile.source_summary.conversations_scanned} local sources; ${profile.receipts.length} receipt summaries were available to the LLM.`;
}

function buildProfileEvidencePacket(profile: InvestorProfile, episodes: DecisionEpisode[], now: Date): ProfileEvidencePacket {
  return {
    version: "0.2",
    generated_at: iso(now),
    instructions: "This packet is deterministic evidence preparation only. Codex must synthesize the final Investment Mirror profile with the LLM using the full candidate ledger, receipts, pattern counts, master records, and guardrail rules. Do not treat candidate inputs as a profile draft or final match.",
    artifact_kind: "deterministic_evidence_packet",
    analysis_scope: "full_candidate_ledger",
    source_summary: profile.source_summary,
    deterministic_profile_inputs: {
      primary_patterns: profile.primary_patterns,
      decision_fingerprint: profile.decision_fingerprint,
      default_issue: profile.default_issue,
      active_guardrails: profile.active_guardrails,
      match_strengths: profile.match_strengths
    },
  candidate_master_matches: profile.best_fit_master_matches,
    candidate_decision_episodes: episodes,
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
        "model-generated structured final profile content after user answers, using profile_report_template.html as visual reference only",
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
    },
  model_phase_contract: {
      phases: [
        {
          id: "phase_2_full_evidence_analysis",
          owner: "agent_llm",
          required_output: "Model-reviewed episode interpretations from the full candidate ledger; use subagents when the ledger is too large for one pass."
        },
        {
          id: "phase_3_interview_question_formation",
          owner: "agent_llm",
          required_output: "2-5 targeted interview questions created from evidence gaps, not a fixed questionnaire."
        },
        {
          id: "phase_4_master_and_profile_synthesis",
          owner: "agent_llm",
          required_output: "Final master match, profile JSON, and final HTML produced by reading evidence plus master records."
        },
        {
          id: "phase_5_artifact_validation_write",
          owner: "deterministic_tool",
          required_output: "Schema/safety validation and artifact write only; no profile judgment."
        }
      ],
      subagent_recommended_for_full_ledger: true,
      final_master_match_owner: "agent_llm",
      final_profile_content_owner: "agent_llm",
      final_profile_html_owner: "deterministic_renderer"
    }
  };
}

function writeProfileSynthesisArtifacts(outputDir: string, profile: InvestorProfile, episodes: DecisionEpisode[], now: Date) {
  const packet = buildProfileEvidencePacket(profile, episodes, now);
  writeJson(join(outputDir, "profile_evidence.json"), packet);
  writeFileSync(join(outputDir, "profile_synthesis_prompt.md"), renderProfileSynthesisPrompt(packet), "utf8");
  writeJson(join(outputDir, "profile_finalization_schema.json"), profileFinalizationSchema());
  writeFileSync(join(outputDir, "profile_report_template.html"), renderProfileReportTemplate(profile, outputDir), "utf8");
}

function renderProfileSynthesisPrompt(packet: ProfileEvidencePacket) {
  return `# Investment Mirror LLM Profile Synthesis Prompt

You are running the model-owned phases of an Investment Mirror profile from a deterministic local evidence packet. The local program has discovered sources, redacted sensitive text, scored the full candidate span ledger, extracted heuristic receipt summaries, counted candidate patterns, and produced candidate master suggestions. Your job is to synthesize the actual user-facing profile using judgment, not to rubber-stamp similarity scores.

## Inputs To Read

- \`profile_evidence.json\`
- \`guardrails.yaml\`
- \`source_manifest.json\`
- \`profile_candidate_inputs.json\` as deterministic candidate inputs only
- \`profile_finalization_schema.json\`
- \`profile_report_template.html\` as a visual/reference specimen, not a fill-in template
- \`skills/investment-mirror/src/master_data.ts\` or master registry/research files when choosing the final master lens

## Phase 2: Full Evidence Analysis

1. Read the full candidate ledger and receipts. Do not treat a small subset as sufficient for synthesis.
2. If the ledger is too large for one pass, use subagents to review disjoint source/date groups and return episode interpretations.
3. Decide which candidate episodes actually matter, which should be ignored, and which evidence tiers are strong enough for profile synthesis.
4. Keep deterministic pattern labels as hints only; revise or abstain when evidence does not support them.

## Phase 3: Interview Question Formation

1. Generate 2-5 interview questions from evidence gaps.
2. These are not from a limited fixed set. They are model-created questions grounded in observed evidence and unknown dimensions.
3. Ask the user before final profile synthesis unless they explicitly decline calibration.

## Phase 4: Master Match, Profile Synthesis, And Final Content

1. Start with positive recognition of the strongest evidenced decision behavior.
2. Choose the primary best-fit master match by reading evidence plus master records. Candidate vector matches are only suggestions.
3. State why the match is useful and what not to copy. Do not carry deterministic similarity scores into the final match.
4. Distinguish evidence from interpretation.
5. Present the required guardrails and why they make the style more investable.
6. After the user answers, produce a model-synthesized JSON object matching \`profile_finalization_schema.json\`.
7. Produce \`profile_model_content.json\`: structured user-facing final content for hero recognition, evidence, interpretation, master lens, interview calibration, guardrails, and next process step.
8. Run \`profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary "..." --content profile_model_content.json\` so the deterministic renderer can produce the final static \`profile.html\`.
9. Suggest the next step: usually run \`/investment-decision\` on a current thesis.

## Evidence Packet Summary

\`\`\`json
${JSON.stringify({
  source_summary: packet.source_summary,
  deterministic_profile_inputs: packet.deterministic_profile_inputs,
  candidate_master_matches: packet.candidate_master_matches.map((match) => ({
    master_id: match.master_id,
    display_name: match.display_name,
    candidate_similarity: matchScore(match),
    why_match: match.why_match
  })),
  pattern_counts: packet.pattern_counts,
  receipt_count: packet.receipts.length,
  calibration_question_topics: packet.calibration_question_topics,
  interview_question_contract: packet.interview_question_contract,
  model_phase_contract: packet.model_phase_contract
}, null, 2)}
\`\`\`

## Hard Boundaries

- Do not recommend buying, selling, holding, allocating, or sizing.
- Do not expose raw transcripts unless explicitly requested.
- Do not claim the user is a master investor.
- Do not rank masters by performance.
- Do not treat candidate similarity as final without interpreting receipts.
- Do not put deterministic similarity in \`best_fit_master_matches\`; final matches use model judgment and qualitative confidence.
- Do not ask the model to hand-write final \`profile.html\`; the model phase must produce structured final profile content, and the finalizer renders HTML.
- Do not finalize \`profile.json\` or \`profile.html\` until you have asked 2-5 targeted interview questions and incorporated the user's answers, unless the user explicitly declines calibration; in that case mark the report provisional and list unknown dimensions.
`;
}

function profileFinalizationSchema() {
  return {
    version: "0.2",
    artifact_kind: "llm_profile_finalization_schema",
    required_command: "node scripts/cli.mjs profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary \"...\" --content profile_model_content.json --output ~/.investment-mirror",
    required_fields: [
      "profile_id",
      "evidence_summary",
      "interpretation_summary",
      "agent_interview_questions",
      "model_interview_answers_summary",
      "best_fit_master_matches",
      "primary_patterns",
      "active_guardrails",
      "risk_preference_summary",
      "time_horizon_summary",
      "constraints_summary",
      "false_match_warning",
      "unknown_dimensions",
      "final_profile_content or final_profile_content_path"
    ],
    final_profile_content_shape: {
      hero: ["positive_recognition", "status_line"],
      evidence: ["summary", "receipt_ids"],
      interpretation: ["summary", "rejected_or_downweighted_signals"],
      master_lens: ["why_this_lens", "what_to_learn", "what_not_to_copy"],
      interview_calibration: ["questions", "answers_summary", "unknown_dimensions"],
      guardrail_protocols: ["guardrail_id", "title", "rationale", "questions"],
      next_process_step: "string"
    },
    constants_written_by_finalizer: {
      synthesis_mode: "llm_synthesized",
      artifact_kind: "llm_synthesized_profile",
      profile_state: "finalized or provisional",
      llm_required: false
    },
    forbidden_content: [
      "buy/sell/hold recommendations",
      "allocation or position sizing",
      "suitability claims",
      "unsupported performance rankings",
      "raw transcript text by default"
    ],
    provisional_rule: "If the user declined interview or answers are absent, set provisional=true and list unknown_dimensions explicitly.",
    html_rule: "The agent/LLM produces structured final profile content. The finalizer renders profile.html with deterministic layout/safety rules. profile_report_template.html is a visual reference specimen only, not a fill-in template."
  };
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
    candidate_similarity: 0.58,
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
  const finalProfile = readJson<InvestorProfile | null>(join(outputDir, "profile.json"), null);
  const previousInputs = readJson<InvestorProfile | null>(join(outputDir, "profile_candidate_inputs.json"), null);
  const existing = finalProfile ?? previousInputs;
  const result = generateInvestorProfile({ ...options, output: outputDir, now });
  const previousPatterns = new Set(existing?.primary_patterns ?? []);
  const currentPatterns = new Set(result.profile.primary_patterns);
  const strengthened = [...currentPatterns].filter((pattern) => previousPatterns.has(pattern));
  const newlyDetected = [...currentPatterns].filter((pattern) => !previousPatterns.has(pattern));
  const weakened = [...previousPatterns].filter((pattern) => !currentPatterns.has(pattern));
  const previousMatch = existing?.best_fit_master_matches?.[0] ?? null;
  const currentCandidateMatch = result.profile.best_fit_master_matches[0] ?? null;
  const previousCandidateMatch = previousInputs?.best_fit_master_matches?.[0] ?? null;
  const previousScore = previousCandidateMatch?.master_id === previousMatch?.master_id ? matchScore(previousCandidateMatch) : null;
  const currentScore = matchScore(currentCandidateMatch);
  const similarityDelta = previousScore !== null && currentScore !== null ? Number((currentScore - previousScore).toFixed(3)) : null;
  const candidateMatchChanged = previousMatch && currentCandidateMatch && previousMatch.master_id !== currentCandidateMatch.master_id;
  const enoughEvidenceForReview = result.profile.source_summary.receipts_used >= 5 && Math.abs(similarityDelta ?? 0) >= 0.04;
  const update = {
    generated_at: iso(now),
    artifact_kind: "candidate_profile_update_requires_llm_review",
    since: options.since ?? null,
    final_profile_preserved: Boolean(finalProfile),
    newly_detected_patterns: newlyDetected,
    strengthened_patterns: strengthened,
    weakened_patterns: weakened,
    guardrails_triggered_most_often: result.profile.active_guardrails,
    candidate_master_suggestion_review: candidateMatchChanged && enoughEvidenceForReview ? [
      {
        previous: previousMatch.master_id,
        candidate: currentCandidateMatch.master_id,
        similarity_delta: similarityDelta,
        evidence_requirement: "LLM must inspect profile_evidence.json receipts before changing final profile master match."
      }
    ] : [],
    candidate_inputs_path: join(outputDir, "profile_candidate_inputs.json"),
    candidate_report_path: join(outputDir, "profile_candidate_report.html"),
    final_profile_path: existsSync(join(outputDir, "profile.json")) ? join(outputDir, "profile.json") : null,
    final_html_path: existsSync(join(outputDir, "profile.html")) ? join(outputDir, "profile.html") : null
  };
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-profile-update.json`), update);
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-profile-update.html`), renderProfileUpdateHtml(update, result.profile), "utf8");
  return { ...result, update };
}

export function lintInvestmentDecision(options: DecisionOptions): DecisionReview {
  const now = options.now ?? new Date();
  const outputDir = defaultOutput(options.output);
  const save = options.writeLog ?? false;
  // Only saved decisions land in decisions/. Bare lints go to decisions/drafts/
  // so repeated thesis checks do not clutter the real decision log area.
  const artifactDir = save ? join(outputDir, "decisions") : join(outputDir, "decisions", "drafts");
  ensureDir(artifactDir);
  const profile = readJson<InvestorProfile | null>(join(outputDir, "profile.json"), null);
  const parsed = parseDecision(options.thesis);
  const assumptions = decomposeThesis(options.thesis);
  const issues = generateIssues(options.thesis, parsed, profile);
  const status = issues.some((issue) => issue.severity === "P0") ? "blocked_by_p0_issues" : issues.length ? "needs_research" : "ready_for_user_decision";
  const slug = slugify(`${parsed.ticker ?? parsed.asset_or_theme} ${options.thesis}`);
  const decisionId = `dec_${todayStamp(now).replaceAll("-", "_")}_${slug.slice(0, 42).replaceAll("-", "_")}`;
  const htmlPath = join(artifactDir, `${todayStamp(now)}-${slug}.html`);
  const mdPath = join(artifactDir, `${todayStamp(now)}-${slug}.md`);
  const jsonPath = join(artifactDir, `${todayStamp(now)}-${slug}.json`);
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

// All-caps tokens that look like tickers but are common English/finance words.
// Keeps the parser from grabbing "I", "A", "AI", "DCF", etc. as a ticker.
const TICKER_STOPWORDS = new Set([
  "I", "A", "AN", "AND", "OR", "THE", "TO", "OF", "IN", "ON", "AT", "BY", "IS", "IT", "IF", "SO", "AS", "BE", "DO", "GO", "MY", "WE", "US", "UK", "EU", "USA",
  "AI", "ML", "LLM", "FSD", "EV", "TAM", "SAM", "DCF", "PE", "PEG", "EPS", "ROE", "ROIC", "ROI", "GDP", "CPI", "CEO", "CFO", "CTO", "COO", "IPO", "ETF", "ESG",
  "API", "SDK", "FAQ", "OK", "TBD", "FYI", "YOY", "QOQ", "ATH", "ATL", "NAV", "AUM", "REIT", "SPAC", "WACC", "FCF", "GMV", "DAU", "MAU", "ARR", "MRR"
]);

const ACTION_VERB_RE = /\b(?:buy|buying|sell|selling|add|adding|trim|trimming|hold|holding|short|shorting|long|own|owning|accumulate|accumulating|avoid|avoiding|watch|watching)\b/gi;

function parseDecision(thesis: string) {
  const lower = thesis.toLowerCase();
  const decisionTypes = ["buy", "sell", "add", "trim", "hold", "avoid", "watchlist", "research_only", "portfolio_review"];
  const decision_type = decisionTypes.find((type) => lower.includes(type.replace("_", " "))) ?? (lower.includes("research") ? "research_only" : null);
  const ticker = extractTicker(thesis);
  const asset_or_theme = ticker ?? cleanTheme(thesis);
  return { decision_type, ticker, asset_or_theme };
}

// Real ticker heuristic. Priority:
//   1. $CASHTAG (1-5 letters)
//   2. an all-caps 1-5 letter token immediately after a buy/sell/add/... verb
//   3. the first all-caps 2-5 letter token that is not a stop-word
// Falls back to null when no plausible ticker exists, so callers use the theme.
function extractTicker(thesis: string): string | null {
  const cashtag = thesis.match(/\$([A-Za-z]{1,5})\b/);
  if (cashtag) return cashtag[1].toUpperCase();

  ACTION_VERB_RE.lastIndex = 0;
  let verbMatch: RegExpExecArray | null;
  while ((verbMatch = ACTION_VERB_RE.exec(thesis))) {
    const rest = thesis.slice(verbMatch.index + verbMatch[0].length);
    const after = rest.match(/^\s+(?:into\s+|some\s+|more\s+|the\s+)?([A-Z]{1,5})\b/);
    if (after && !TICKER_STOPWORDS.has(after[1])) return after[1];
  }

  const allCaps = thesis.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const candidate = allCaps.find((token) => !TICKER_STOPWORDS.has(token));
  return candidate ?? null;
}

// Cleaned theme phrase used when no ticker is detected. Strips leading
// first-person filler ("I want to buy ...") so the artifact <h1> reads as a topic.
function cleanTheme(thesis: string): string {
  const normalized = thesis.replace(/\s+/g, " ").trim();
  const stripped = normalized.replace(/^(?:i\s+(?:want|would like|am thinking|plan|intend|wish)\s+(?:to\s+)?(?:buy|sell|add|trim|hold|invest in|get into)?\s*)/i, "").trim();
  const theme = stripped.length >= 4 ? stripped : normalized;
  return theme.slice(0, 80);
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
  const candidateInputs = readJson<InvestorProfile | null>(join(outputDir, "profile_candidate_inputs.json"), null);
  const decisions = loadDecisionMemory(outputDir);
  const wantsRaw = wantsRawLocalEvidence(question);
  const terms = queryTerms(question);
  const memory = collectMemoryEvidence(outputDir, profile, candidateInputs, decisions);
  const ranked = rankMemoryEvidence(memory, terms).slice(0, 8);
  const rawEvidence = wantsRaw ? queryRedactedTurnEvidence(outputDir, terms).slice(0, 5) : [];
  const evidence = wantsRaw ? [...ranked, ...rawEvidence] : ranked;
  const guardrailCounts = countBy(decisions.flatMap((decision) => decision.triggered_guardrails ?? []));
  const mostFrequentGuardrail = Object.entries(guardrailCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const basis = [...new Set(evidence.map((item) => item.kind))];
  const interpretation = evidence.length
    ? `Based on local ${basis.join(", ")} records, the strongest answer is an interpretation of summarized evidence, not raw transcript review. Candidate/profile artifacts remain separate from finalized profile evidence.`
    : "No matching local Investment Mirror memory was found in profile summaries, decision logs, source summaries, or profile history.";
  return {
    question,
    search_terms: terms,
    data_scope: wantsRaw
      ? "profile/decision/source summaries plus explicitly requested redacted raw-turn SQLite search"
      : "profile/decision/source summaries only; raw transcript turns were not searched",
    evidence,
    interpretation,
    next_guardrail_or_review_action: mostFrequentGuardrail ?? profile?.active_guardrails[0] ?? candidateInputs?.active_guardrails[0] ?? "Run /investment-profile-init",
    raw_transcript_exposed: rawEvidence.length > 0
  };
}

function loadDecisionMemory(outputDir: string) {
  const decisions = new Map<string, DecisionReview>();
  const logPath = join(outputDir, "decision_log.jsonl");
  if (existsSync(logPath)) {
    for (const line of readFileSync(logPath, "utf8").split(/\r?\n/).filter(Boolean)) {
      try {
        const decision = JSON.parse(line) as DecisionReview;
        decisions.set(decision.decision_id, decision);
      } catch {
        // Ignore malformed local log lines; JSON decision files are still loaded below.
      }
    }
  }
  const decisionsDir = join(outputDir, "decisions");
  if (existsSync(decisionsDir)) {
    for (const file of readdirSync(decisionsDir).filter((item) => item.endsWith(".json"))) {
      const decision = readJson<DecisionReview | null>(join(decisionsDir, file), null);
      if (decision?.decision_id) decisions.set(decision.decision_id, decision);
    }
  }
  return [...decisions.values()];
}

function collectMemoryEvidence(outputDir: string, profile: InvestorProfile | null, candidateInputs: InvestorProfile | null, decisions: DecisionReview[]) {
  const evidence: MirrorMemoryEvidence[] = [];
  if (profile) {
    evidence.push({
      id: `profile:${profile.profile_id}`,
      kind: "profile",
      source: "profile.json",
      summary: `Final profile ${profile.profile_id}; state=${profile.profile_state}; patterns=${profile.primary_patterns.join(", ")}; guardrails=${profile.active_guardrails.join(", ")}; master=${profile.best_fit_master_matches.map((match) => match.master_id).join(", ")}.`,
      matched_terms: []
    });
  }
  if (candidateInputs) {
    evidence.push({
      id: `candidate:${candidateInputs.profile_id}`,
      kind: "candidate_profile_inputs",
      source: "profile_candidate_inputs.json",
      summary: `Candidate inputs ${candidateInputs.profile_id}; patterns=${candidateInputs.primary_patterns.join(", ")}; candidate_guardrails=${candidateInputs.active_guardrails.join(", ")}; candidate_masters=${candidateInputs.best_fit_master_matches.map((match) => match.master_id).join(", ")}.`,
      matched_terms: []
    });
  }
  const packet = readJson<ProfileEvidencePacket | null>(join(outputDir, "profile_evidence.json"), null);
  for (const receipt of packet?.receipts ?? []) {
    evidence.push({
      id: `receipt:${receipt.episode_id}`,
      kind: "profile_receipt",
      source: `${receipt.source_alias} (${receipt.evidence_tier})`,
      summary: receipt.summary,
      matched_terms: []
    });
  }
  for (const decision of decisions) {
    evidence.push({
      id: `decision:${decision.decision_id}`,
      kind: "decision",
      source: decision.artifact_paths.json,
      summary: `${decision.decision_status}; thesis=${decision.user_thesis}; issues=${decision.issues.map((issue) => `${issue.severity}:${issue.issue_code}`).join(", ")}; guardrails=${decision.triggered_guardrails.join(", ")}.`,
      matched_terms: []
    });
  }
  const historyDir = join(outputDir, "profile_history");
  if (existsSync(historyDir)) {
    for (const file of readdirSync(historyDir).filter((item) => item.endsWith(".json")).slice(-40)) {
      const text = readFileSync(join(historyDir, file), "utf8");
      evidence.push({
        id: `history:${file}`,
        kind: "profile_history",
        source: `profile_history/${file}`,
        summary: text.replace(/\s+/g, " ").slice(0, 900),
        matched_terms: []
      });
    }
  }
  const manifest = readJson<{ sources?: SourceRecord[] } | null>(join(outputDir, "source_manifest.json"), null);
  for (const source of manifest?.sources ?? []) {
    evidence.push({
      id: `source:${source.source_id}`,
      kind: "source_summary",
      source: source.source_id,
      summary: `source_id=${source.source_id}; type=${source.source_type}; status=${source.status}; modified=${source.modified_at}; path_hash=${source.path_hash}; sha256=${source.sha256}.`,
      matched_terms: []
    });
  }
  return evidence;
}

function queryTerms(question: string) {
  const lower = question.toLowerCase();
  const words = lower.match(/[a-z0-9_]{2,}|[\u4e00-\u9fff]{2,}/g) ?? [];
  const expanded = new Set(words);
  const expansions: Array<[RegExp, string[]]> = [
    [/ai|人工智能|智能/i, ["ai", "artificial intelligence", "人工智能", "platform", "semiconductor"]],
    [/guardrail|护栏|触发/i, ["guardrail", "guardrails", "triggered_guardrails", "触发"]],
    [/p0|blocked|blocker|阻塞|卡住/i, ["p0", "blocked_by_p0_issues", "blocked", "blocker"]],
    [/valuation|估值|price|价格/i, ["valuation", "price", "priced", "expectation", "valuation_expectation_missing", "估值"]],
    [/falsif|wrong|证伪|反证/i, ["falsification", "falsification_missing", "wrong", "disconfirm", "证伪"]],
    [/capture|shareholder|价值捕获/i, ["value_capture", "value_capture_missing", "shareholder", "capture", "价值捕获"]],
    [/master|大师|match|匹配/i, ["master", "match", "candidate_masters", "best_fit_master_matches", "大师", "匹配"]],
    [/profile|画像/i, ["profile", "candidate", "profile_state", "画像"]]
  ];
  for (const [pattern, terms] of expansions) {
    if (pattern.test(question)) terms.forEach((term) => expanded.add(term));
  }
  return [...expanded].filter((term) => term.length >= 2).slice(0, 24);
}

function rankMemoryEvidence(memory: MirrorMemoryEvidence[], terms: string[]) {
  return memory
    .map((item) => {
      const haystack = `${item.id} ${item.kind} ${item.source} ${item.summary}`.toLowerCase();
      const matched = terms.filter((term) => haystack.includes(term.toLowerCase()));
      const score = matched.length + (item.kind === "decision" ? 0.25 : 0) + (item.kind === "profile" ? 0.2 : 0);
      return { item: { ...item, matched_terms: matched }, score };
    })
    .filter(({ score }) => score > 0 || terms.length === 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);
}

function wantsRawLocalEvidence(question: string) {
  return /\braw\b|\btranscript\b|\bturns?\b|原始|原文|转录|逐字|raw local evidence/i.test(question);
}

function queryRedactedTurnEvidence(outputDir: string, terms: string[]): MirrorMemoryEvidence[] {
  const sqlitePath = join(outputDir, "source_index.sqlite");
  if (!existsSync(sqlitePath) || terms.length === 0) return [];
  const script = join(skillRoot, "scripts", "query_source_index.py");
  const result = spawnSync("python3", [script, sqlitePath, ...terms.slice(0, 8)], { encoding: "utf8" });
  if (result.status !== 0 || !result.stdout.trim()) return [];
  try {
    const rows = JSON.parse(result.stdout) as Array<{ turn_id: string; source_id: string; snippet: string; matched_terms: string[] }>;
    return rows.map((row) => ({
      id: `redacted_turn:${row.turn_id}`,
      kind: "redacted_turn" as const,
      source: row.source_id,
      summary: row.snippet,
      matched_terms: row.matched_terms
    }));
  } catch {
    return [];
  }
}

function writeCandidateProfileArtifacts(outputDir: string, profile: InvestorProfile, now: Date, kind: "profile" | "update") {
  writeJson(join(outputDir, "profile_candidate_inputs.json"), profile);
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-${kind}-candidate-inputs.json`), profile);
  writeProfileState(outputDir, "interview_required", now, "Deterministic evidence compilation completed; agent/LLM interview and synthesis are required before final profile files can be written.");
  writeFileSync(join(outputDir, "guardrails.yaml"), YAML.stringify({
    version: "0.2",
    artifact_kind: "candidate_guardrails_requires_llm_synthesis",
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
  const html = renderProfileCandidateReportHtml(profile, outputDir);
  writeFileSync(join(outputDir, "profile_candidate_report.html"), html, "utf8");
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-${kind}-candidate-report.html`), html, "utf8");
}

function writeDecisionArtifacts(review: DecisionReview, outputDir: string, writeLog: boolean) {
  writeFileSync(review.artifact_paths.html, renderDecisionHtml(review, outputDir), "utf8");
  writeFileSync(review.artifact_paths.md, renderDecisionMarkdown(review), "utf8");
  writeJson(review.artifact_paths.json, review);
  if (writeLog) {
    appendFileSync(join(outputDir, "decision_log.jsonl"), `${JSON.stringify({ ...review, decision_status: "decision_logged" })}\n`, "utf8");
    appendFileSync(join(outputDir, "InvestmentMirror.md"), `\n## Decision ${review.decision_id}\n\n- Status: ${review.decision_status}\n- Thesis: ${review.user_thesis}\n- Issues: ${review.issues.map((issue) => `${issue.severity} ${issue.title}`).join("; ")}\n`, "utf8");
  }
}

const DEFAULT_ASSET_BASE_URL = "https://raw.githubusercontent.com/FUY25/investment-mirror-skill/main/assets/masters";

// Master portraits are fetched on demand from this base URL (overridable for
// repo renames/forks/release-pinning and for offline tests via a file:// or
// absolute-path fixture). The shipped skill carries no portrait bytes (C3/C4).
function assetBaseUrl(): string {
  return (process.env.INVESTMENT_MIRROR_ASSET_BASE_URL || DEFAULT_ASSET_BASE_URL).replace(/\/+$/, "");
}

// Synchronous HTTP(S) GET via python3 (already a runtime dependency through the
// sqlite bridge), keeping the render pipeline synchronous. Prints raw bytes to
// stdout and exits non-zero on any failure so the caller can fall back.
const PY_FETCH_ASSET = [
  "import sys,urllib.request",
  "url=sys.argv[1]",
  "req=urllib.request.Request(url, headers={'User-Agent':'investment-mirror'})",
  "sys.stdout.buffer.write(urllib.request.urlopen(req, timeout=10).read())"
].join("\n");

// Resolve a master portrait SVG on demand: local cache first, then a fetch from
// the configured base URL. Never throws; returns null when the asset cannot be
// resolved (offline/sandbox/404) so profile-finalize and decision keep working
// with the portrait gracefully omitted (C1/C2).
function resolveMasterAsset(masterId: string, outputDir: string): string | null {
  const cachePath = join(outputDir, ".asset_cache", "masters", `${masterId}.svg`);
  if (existsSync(cachePath)) {
    try {
      return readFileSync(cachePath, "utf8");
    } catch {
      // fall through and refetch
    }
  }
  const svg = fetchMasterAsset(masterId);
  if (svg == null) return null;
  try {
    ensureDir(dirname(cachePath));
    writeFileSync(cachePath, svg, "utf8");
  } catch {
    // caching is best-effort
  }
  return svg;
}

function fetchMasterAsset(masterId: string): string | null {
  const base = assetBaseUrl();
  try {
    if (base.startsWith("file://")) {
      const filePath = fileURLToPath(`${base}/${masterId}.svg`);
      return existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
    }
    if (base.startsWith("/")) {
      const filePath = join(base, `${masterId}.svg`);
      return existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
    }
    const result = spawnSync("python3", ["-c", PY_FETCH_ASSET, `${base}/${masterId}.svg`], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    if (result.status === 0 && result.stdout) return result.stdout;
    return null;
  } catch {
    return null;
  }
}

// Inline data: URI so saved HTML stays self-contained (no sidecar .assets dir).
function masterPortraitDataUri(masterId: string, outputDir: string): string | null {
  const svg = resolveMasterAsset(masterId, outputDir);
  if (!svg) return null;
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

// Emit an <img> when the portrait resolves, else a neutral inline placeholder so
// the master card still renders offline (C2).
function masterPortraitImg(masterId: string, displayName: string, outputDir: string): string {
  const uri = masterPortraitDataUri(masterId, outputDir);
  if (uri) return `<img src="${uri}" alt="${escapeHtml(displayName)} line-art portrait">`;
  return `<div class="master-portrait-fallback" role="img" aria-label="${escapeHtml(displayName)} portrait unavailable offline"><span>${escapeHtml(masterInitials(displayName))}</span></div>`;
}

function masterInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
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

I am attracted to this investment idea. Based on my Investment Mirror candidate evidence packet, one candidate master learning lens is ${master.display_name}.

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

## Candidate Evidence Workspace

This file was generated from deterministic local evidence preparation. It is not a finalized profile. The agent/LLM must interpret the full candidate ledger, ask calibration questions, synthesize profile JSON, generate final HTML, then run profile-finalize to validate and write profile.json and profile.html.

Candidate patterns: ${profile.primary_patterns.join(", ")}.
Candidate default issue: ${profile.default_issue}

## Candidate Master Suggestion

Candidate suggestion: ${profile.best_fit_master_matches[0].display_name}
Why: ${profile.best_fit_master_matches[0].why_match}
Candidate guardrails: ${profile.active_guardrails.join("; ")}.

## Active Guardrails

${profile.active_guardrails.map((guardrail, index) => `${index + 1}. ${guardrailName(guardrail)}.`).join("\n")}

## Decision Log Index

| Date | Asset | Decision Type | Status | Triggered Issues |
|---|---|---|---|---|

## Open Follow-ups

- After finalization, apply ${guardrailName(profile.active_guardrails[0])} to the next thesis before recording a decision.
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

function renderProfileReportTemplate(profile: InvestorProfile, outputDir: string) {
  const primary = profile.best_fit_master_matches[0];
  const secondary = profile.best_fit_master_matches[1];
  const bars = Object.entries(profile.decision_fingerprint).slice(0, 7).map(([key, value]) => {
    const label = STYLE_DIMENSIONS.find((dimension) => dimension.id === key)?.label ?? key;
    return `<div class="fingerprint-row"><span>${escapeHtml(label)}</span><strong>${Math.round(value)}</strong><i style="--v:${Math.round(value)}"></i></div>`;
  }).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror AI HTML Reference</title>
  ${sharedReportCss()}
</head>
<body>
  <!--
    Investment Mirror AI HTML reference.
    This is not a fill-in template and must not be copied with placeholder text.
    The agent/LLM must generate the final static profile.html after full evidence analysis,
    interview calibration, and model-owned master/profile synthesis.
  -->
  <main class="page-shell model-template" data-reference="investment-mirror-profile-html-reference-v0.2">
    <section class="candidate-banner">
      <p class="kicker">AI HTML Reference</p>
      <p>This artifact is a visual and structural reference for the rendered final report. Use it to preserve required sections, provenance discipline, and restrained report styling. Do not fill placeholders; write structured final profile content in the model phase and pass it to <code>profile-finalize --content</code>.</p>
    </section>

    <section class="hero-grid">
      <div>
        <p class="kicker">Investment Mirror</p>
        <h1>Lead with the user's strongest evidenced decision behavior.</h1>
        <p class="lead">The final model report should open with positive recognition, then quickly anchor the best-fit master lens and the guardrails that make the style more investable.</p>
        <div class="confidence"><span>Required status language</span><strong>Finalized or Provisional</strong></div>
      </div>
      <article class="master-card primary">
        ${masterPortraitImg(primary.master_id, primary.display_name, outputDir)}
        <div>
          <p class="label">Model-owned master lens</p>
          <h2>${escapeHtml(primary.display_name)}</h2>
          <p>Use candidate matches only as suggestions. The final report must explain why the model chose the master after reading evidence and master records.</p>
          <a href="${escapeHtml(primary.read_more_url)}">Read more</a>
        </div>
      </article>
    </section>

    <section class="report-stack">
      <article class="sheet">
        <h2>Evidence Ledger</h2>
        <p>Summarize local receipts and source IDs. Keep transcript text out by default. Cite receipt IDs and local aliases rather than raw conversation text.</p>
      </article>
      <article class="sheet offset">
        <h2>Model Interpretation</h2>
        <p>Explain what the evidence means, where the model is uncertain, and which candidate signals were rejected or downweighted.</p>
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Interview Calibration</h2>
        <p>Show the 2-5 model-generated questions and summarize what the user's answers changed. If declined, mark the report provisional and list unknown dimensions.</p>
      </article>
      <article>
        <h2>Risk, Horizon, Constraints</h2>
        <p>Only include what the user answered or what evidence strongly supports. Never infer suitability, allocation, or position size.</p>
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Decision Fingerprint Reference</h2>
        <div class="fingerprint">${bars}</div>
      </article>
      <article>
        <h2>False-Match Warning</h2>
        <p>The final report must say that a master match is a learning archetype and process lens, not an identity claim or authority signal.</p>
      </article>
    </section>

    <section>
      <h2>Master Lens Reference Cards</h2>
      ${renderMasterCard(primary, outputDir)}
      ${secondary ? renderMasterCard(secondary, outputDir) : ""}
    </section>

    <section>
      <h2>Guardrail Protocol Reference</h2>
      <div class="guardrails">
        ${profile.active_guardrails.map((guardrail, index) => `<article><span>Protocol ${index + 1}</span><h3>${escapeHtml(guardrailName(guardrail))}</h3><p>Explain why this protocol improves the user's process, using model interpretation rather than deterministic counts.</p><ul>${(guardrailQuestions[guardrail] ?? []).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section>
      <h2>Receipt Citation Pattern</h2>
      <div class="receipts">
        ${profile.receipts.map((receipt) => `<details><summary>${escapeHtml(receipt.source_alias)} · ${escapeHtml(receipt.date)} · ${escapeHtml(receipt.evidence_tier)}</summary><p>${escapeHtml(receipt.summary)}</p></details>`).join("")}
      </div>
    </section>

    <section class="section-grid">
      <article>
        <h2>Required Final Sections</h2>
        <ol>
          <li>Positive recognition</li>
          <li>Evidence ledger</li>
          <li>Model interpretation</li>
          <li>Interview calibration</li>
          <li>Risk, horizon, and constraints</li>
          <li>Master lens and false-match warning</li>
          <li>Guardrail protocols</li>
          <li>Next process step</li>
        </ol>
      </article>
      <article>
        <h2>Validation Notes</h2>
        <dl>
          <div><dt>Final HTML owner</dt><dd>agent/LLM phase</dd></div>
          <div><dt>Writer</dt><dd>profile-finalize validator</dd></div>
          <div><dt>Forbidden</dt><dd>recommendations, sizing, suitability</dd></div>
        </dl>
      </article>
    </section>

    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}

function renderFinalProfileHtml(profile: InvestorProfile, content: FinalProfileContent, outputDir: string) {
  const primary = profile.best_fit_master_matches[0];
  const status = profile.profile_state === "provisional" ? "Provisional" : "Finalized";
  const recognition = content.hero?.positive_recognition ?? profile.interpretation_summary ?? "Your strongest evidenced behavior is turning an investment thesis into an explicit evidence and review system.";
  const statusLine = content.hero?.status_line ?? `${status} profile rendered from model structured content.`;
  const evidenceSummary = content.evidence?.summary ?? profile.evidence_summary ?? evidenceSummaryFromInputs(profile);
  const interpretationSummary = content.interpretation?.summary ?? profile.interpretation_summary ?? "The model interpretation separates evidence from judgment and keeps uncertain dimensions explicit.";
  const masterRationale = content.master_lens?.why_this_lens ?? primary.why_match;
  const learn = normalizeOptionalStringArray(content.master_lens?.what_to_learn, primary.what_to_learn);
  const avoid = normalizeOptionalStringArray(content.master_lens?.what_not_to_copy, primary.what_not_to_copy);
  const questions = normalizeOptionalStringArray(content.interview_calibration?.questions, profile.agent_interview_questions ?? profile.model_interview_questions ?? []);
  const answersSummary = content.interview_calibration?.answers_summary ?? profile.model_interview_answers_summary ?? "Interview calibration summary unavailable.";
  const unknowns = normalizeOptionalStringArray(content.interview_calibration?.unknown_dimensions, profile.unknown_dimensions);
  const guardrails = content.guardrail_protocols?.length ? content.guardrail_protocols : profile.active_guardrails.map((guardrail) => ({
    guardrail_id: guardrail,
    title: guardrailName(guardrail),
    rationale: guardrailReason(guardrail),
    questions: guardrailQuestions[guardrail] ?? []
  }));
  const rejected = normalizeStringArray(content.interpretation?.rejected_or_downweighted_signals);
  const nextStep = content.next_process_step ?? "Use /investment-decision on one current thesis to turn this profile into a process review.";
  const matchBadge = primary.match_confidence ? `${humanize(primary.match_confidence)} confidence` : "model-selected lens";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror ${escapeHtml(status)} Profile</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell">
    <section class="hero-grid">
      <div>
        <p class="kicker">Investment Mirror ${escapeHtml(status)} Profile</p>
        <h1>${escapeHtml(recognition)}</h1>
        <p class="lead">${escapeHtml(statusLine)}</p>
        <div class="confidence"><span>Profile state</span><strong>${escapeHtml(status)}</strong></div>
      </div>
      <article class="master-card primary">
        ${masterPortraitImg(primary.master_id, primary.display_name, outputDir)}
        <div>
          <p class="label">Best-fit master lens · ${escapeHtml(matchBadge)}</p>
          <h2>${escapeHtml(primary.display_name)}</h2>
          <p>${escapeHtml(masterRationale)}</p>
          <a href="${escapeHtml(primary.read_more_url)}">Read more</a>
        </div>
      </article>
    </section>

    <section class="report-stack">
      <article class="sheet">
        <h2>Evidence Ledger</h2>
        <p>${escapeHtml(evidenceSummary)}</p>
        <dl>
          <div><dt>Sources scanned</dt><dd>${profile.source_summary.conversations_scanned}</dd></div>
          <div><dt>Candidate episodes</dt><dd>${profile.source_summary.decision_episodes_found}</dd></div>
          <div><dt>Receipt summaries</dt><dd>${profile.source_summary.receipts_used}</dd></div>
        </dl>
      </article>
      <article class="sheet offset">
        <h2>Model Interpretation</h2>
        <p>${escapeHtml(interpretationSummary)}</p>
        ${rejected.length ? `<h3>Downweighted signals</h3><ul>${rejected.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Interview Calibration</h2>
        <p>${escapeHtml(answersSummary)}</p>
        ${questions.length ? `<ol>${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>` : ""}
      </article>
      <article>
        <h2>Risk, Horizon, Constraints</h2>
        <p><strong>Risk:</strong> ${escapeHtml(profile.risk_preference_summary ?? "Risk preference remains user-owned and is not inferred as suitability.")}</p>
        <p><strong>Horizon:</strong> ${escapeHtml(profile.time_horizon_summary ?? "Time horizon remains explicit calibration input.")}</p>
        <p><strong>Constraints:</strong> ${escapeHtml(profile.constraints_summary ?? "No allocation, sizing, or suitability conclusion is inferred.")}</p>
      </article>
    </section>

    ${unknowns.length ? `<section>
      <h2>Unknown Dimensions</h2>
      <ul>${unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>` : ""}

    <section class="section-grid">
      <article>
        <h2>Master Lens</h2>
        <p>${escapeHtml(profile.false_match_warning ?? "The master match is a learning archetype, not an identity claim or authority signal.")}</p>
        <h3>What to learn</h3>
        <ul>${learn.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3>What not to copy</h3>
        <ul>${avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>
      <article>
        <h2>Decision Fingerprint</h2>
        <div class="fingerprint">
          ${Object.entries(profile.decision_fingerprint).slice(0, 7).map(([key, value]) => {
            const label = STYLE_DIMENSIONS.find((dimension) => dimension.id === key)?.label ?? key;
            return `<div class="fingerprint-row"><span>${escapeHtml(label)}</span><strong>${Math.round(value)}</strong><i style="--v:${Math.round(value)}"></i></div>`;
          }).join("")}
        </div>
      </article>
    </section>

    <section>
      <h2>Guardrail Protocols</h2>
      <div class="guardrails">
        ${guardrails.map((guardrail) => `<article><span>${escapeHtml(guardrail.title ?? guardrailName(guardrail.guardrail_id ?? ""))}</span><p>${escapeHtml(guardrail.rationale ?? guardrailReason(guardrail.guardrail_id ?? ""))}</p><ul>${normalizeStringArray(guardrail.questions).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section>
      <h2>Next Process Step</h2>
      <p>${escapeHtml(nextStep)}</p>
    </section>

    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions. Raw transcripts are not exposed in this report.</footer>
  </main>
</body>
</html>`;
}

function renderProfileCandidateReportHtml(profile: InvestorProfile, outputDir: string) {
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
  <title>Investment Mirror Candidate Evidence Report</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell">
    <section class="candidate-banner">
      <p class="kicker">Candidate evidence report</p>
      <p>This artifact was generated by local tooling for source discovery, redaction, full candidate span ledger extraction, heuristic pattern counts, and candidate master suggestions. It is not a profile draft. The agent/LLM must run the later phases: full evidence interpretation, interview question formation, master/profile synthesis, and structured final content generation.</p>
    </section>
    <section class="hero-grid">
      <div>
        <p class="kicker">Investment Mirror</p>
        <h1>Evidence is ready for model synthesis.</h1>
        <p class="lead">${profile.source_summary.decision_episodes_found} candidate decision episodes were prepared for agent/LLM review. Candidate matches and patterns are search aids, not judgments.</p>
        <div class="confidence"><span>Analysis scope</span><strong>Full candidate ledger</strong></div>
      </div>
      <article class="master-card primary">
        ${masterPortraitImg(primary.master_id, primary.display_name, outputDir)}
        <div>
        <p class="label">Candidate master suggestion</p>
          <h2>${escapeHtml(primary.display_name)}</h2>
          <p>${escapeHtml(primary.why_match)}</p>
          <a href="${escapeHtml(primary.read_more_url)}">Read more</a>
        </div>
      </article>
    </section>

    <section class="report-stack">
      <article class="sheet">
        <h2>Candidate Evidence Signals</h2>
        ${profile.match_strengths.map((strength) => `<p>${escapeHtml(strength)}</p>`).join("")}
      </article>
      <article class="sheet offset">
        <h2>Candidate Master Lenses</h2>
        ${renderMasterCard(primary, outputDir)}
        ${secondary ? renderMasterCard(secondary, outputDir) : ""}
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Decision Fingerprint</h2>
        <div class="fingerprint">${bars}</div>
      </article>
      <article>
        <h2>Heuristic Pattern Map</h2>
        ${profile.primary_patterns.map((pattern) => `<div class="pattern"><strong>${escapeHtml(humanize(pattern))}</strong><p>${escapeHtml(patternInterpretation(pattern))}</p></div>`).join("")}
      </article>
    </section>

    <section>
      <h2>Candidate Episode Ledger</h2>
      <div class="receipts">
        ${profile.receipts.map((receipt) => `<details><summary>${escapeHtml(receipt.source_alias)} · ${escapeHtml(receipt.date)} · ${escapeHtml(receipt.evidence_tier)}</summary><p>${escapeHtml(receipt.summary)}</p></details>`).join("")}
      </div>
    </section>

    <section>
      <h2>Candidate Guardrail Inputs</h2>
      <div class="guardrails">
        ${profile.active_guardrails.map((guardrail) => `<article><span>${escapeHtml(guardrailName(guardrail))}</span><p>${escapeHtml(guardrailReason(guardrail))}</p><ul>${(guardrailQuestions[guardrail] ?? []).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section class="section-grid">
      <article>
        <h2>Model Phase Checklist</h2>
        <p>The agent/LLM should read this evidence, split large ledgers across subagents if needed, create questions, then generate profile JSON and structured final content.</p>
        <ol>
          <li>Interpret full candidate ledger</li>
          <li>Create 2-5 interview questions</li>
          <li>Choose master lens by judgment</li>
          <li>Generate final profile HTML</li>
        </ol>
      </article>
      <article>
        <h2>Local Evidence Initialized</h2>
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

function renderMasterCard(match: ProfileMatch, outputDir: string) {
  const score = matchScore(match);
  const badge = score !== null
    ? `${Math.round(score * 100)}% candidate`
    : match.match_confidence ? `${humanize(match.match_confidence)} confidence` : "model lens";
  return `<div class="master-detail">
    ${masterPortraitImg(match.master_id, match.display_name, outputDir)}
    <div>
      <h3>${escapeHtml(match.display_name)} <span>${escapeHtml(badge)}</span></h3>
      <p>${escapeHtml(match.bio_summary)}</p>
      <p><strong>Investment style:</strong> ${escapeHtml(match.investment_style)}</p>
      <p><strong>Notable context:</strong> ${escapeHtml(match.notable_results_summary)}</p>
      <p><strong>What to learn:</strong> ${escapeHtml(match.what_to_learn.join("; "))}</p>
      <p><strong>What not to copy:</strong> ${escapeHtml(match.what_not_to_copy.join("; "))}</p>
    </div>
  </div>`;
}

function renderDecisionHtml(review: DecisionReview, outputDir: string) {
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
      ${review.closest_master_lens ? `<article class="master-card primary">${masterPortraitImg(review.closest_master_lens.master_id, review.closest_master_lens.display_name, outputDir)}<div><p class="label">Relevant master lens</p><h2>${escapeHtml(review.closest_master_lens.display_name)}</h2><p>${escapeHtml(review.closest_master_lens.why_match)}</p></div></article>` : `<article class="master-card primary"><div><p class="label">Standalone mode</p><h2>Generic thesis clarification</h2><p>Run /investment-profile-init to personalize guardrails.</p></div></article>`}
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
  .candidate-banner { border:1px solid var(--copper); border-radius:8px; background:#fff8ef; padding:16px 18px; margin-bottom:22px; }
  .candidate-banner p:last-child { margin:0; color:var(--muted); }
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
  .master-portrait-fallback { display:flex; align-items:center; justify-content:center; aspect-ratio:1; width:100%; border-radius:8px; border:1px dashed var(--line); background:var(--soft); color:var(--muted); }
  .master-detail .master-portrait-fallback { width:120px; }
  .master-portrait-fallback span { font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:34px; letter-spacing:2px; }
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
  if (process.env.INVESTMENT_MIRROR_KEEP_SQLITE_PAYLOAD !== "1" && existsSync(payload)) {
    unlinkSync(payload);
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
