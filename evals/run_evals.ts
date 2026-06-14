import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

// Offline-safe asset resolution: point portrait fetches at the local repo-root
// SVGs via a file:// base URL so evals never touch the network (C5).
process.env.INVESTMENT_MIRROR_ASSET_BASE_URL = pathToFileURL(resolve("assets/masters")).href;
import { finalizeProfile, generateInvestorProfile, lintInvestmentDecision, mirrorAsk } from "../skills/investment-mirror/src/core.ts";

type EvalResult = { group: string; name: string; passed: boolean; detail: string };
type QueryEval = {
  router: Array<{ name: string; query: string; expected_route: string }>;
  memory: Array<{ name: string; query: string; expect_raw: boolean; expected_kinds: string[] }>;
  safety: Array<{ name: string; thesis: string; forbidden: string[] }>;
};
type ExtractionEval = {
  fixtures: Array<{
    name: string;
    text: string;
    expected_candidate_patterns: string[];
    expected_episode_type: string;
    expected_evidence_tier: string;
    expected_abstentions: string[];
  }>;
};

// Fixtures live outside the repo so the discovery self-ingestion guard (which
// excludes the repo path) does not skip them.
const root = join(tmpdir(), "investment-mirror-test", "evals");
const queryEval = YAML.parse(readFileSync("evals/queries.yaml", "utf8")) as QueryEval;
const extractionEval = YAML.parse(readFileSync("evals/extraction_golden.yaml", "utf8")) as ExtractionEval;

function setup() {
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, ".codex", "sessions"), { recursive: true });
  writeFileSync(join(root, ".codex", "sessions", "session.jsonl"), [
    JSON.stringify({ role: "user", timestamp: "2026-06-01T10:00:00Z", content: "I am researching AI software stocks. I like product quality and the founder story, but I need valuation expectations, falsification, and value capture before action." }),
    JSON.stringify({ role: "user", timestamp: "2026-06-02T10:00:00Z", content: "I keep adding more research. Please force this into three decision variables and a reject rule." }),
    JSON.stringify({ role: "user", timestamp: "2026-06-03T10:00:00Z", content: "The market may be wrong about cloud growth, but I need to define consensus first." }),
    JSON.stringify({ role: "user", timestamp: "2026-06-04T10:00:00Z", content: "I want to buy TSLA because robotaxi could unlock a massive growth curve over 3 years, but I have not checked valuation, value capture, or what would prove me wrong." })
  ].join("\n"));
}

function check(group: string, name: string, passed: boolean, detail: string): EvalResult {
  return { group, name, passed, detail };
}

function routeQuery(query: string) {
  const lower = query.toLowerCase();
  if (/\/investment-|investment mirror|mirror-ask|画像|护栏|投资镜子|投资想法|最常缺失/i.test(query)) return "investment_mirror";
  if (/latest|quarterly|market cap|p\/e|revenue|earnings|current price|最新|市值|财报/i.test(query)) return "public_equity_or_general_research";
  return lower.includes("buy") || lower.includes("sell") ? "public_equity_or_general_research" : "general";
}

function finalizeFixture(output: string) {
  const candidate = JSON.parse(readFileSync(join(output, "profile_candidate_inputs.json"), "utf8"));
  finalizeProfile({
    output,
    synthesizedProfile: {
      profile_id: candidate.profile_id,
      evidence_summary: "Local evidence shows repeated candidate issues around AI narratives, valuation expectations, value capture, and falsification.",
      interpretation_summary: "The model interprets the evidence as thesis-first reasoning that needs explicit guardrails before a user-owned decision.",
      primary_patterns: candidate.primary_patterns,
      best_fit_master_matches: candidate.best_fit_master_matches.slice(0, 1).map((match: any) => ({
        ...match,
        match_confidence: "medium",
        selection_basis: "model_selected_from_evidence_interview_and_master_records"
      })),
      match_strengths: candidate.match_strengths,
      active_guardrails: candidate.active_guardrails,
      recommended_guardrails: candidate.recommended_guardrails,
      decision_fingerprint: candidate.decision_fingerprint,
      default_issue: candidate.default_issue,
      source_summary: candidate.source_summary,
      receipts: candidate.receipts,
      risk_preference_summary: "Risk preference is represented as process review triggers, not inferred allocation or sizing advice.",
      time_horizon_summary: "The calibration summary uses a multi-year thesis review horizon for examples.",
      constraints_summary: "No personal constraints are inferred from logs; unknown personal constraints remain outside the profile.",
      false_match_warning: "The master match is a learning lens only and not an identity or authority claim.",
      unknown_dimensions: []
    },
    finalContent: {
      hero: {
        positive_recognition: "Investment Mirror finalized model profile",
        status_line: "Final profile rendered from model structured content."
      },
      evidence: {
        summary: "Local receipt summaries and source IDs support the profile."
      },
      interpretation: {
        summary: "The model interpretation separates evidence from judgment."
      },
      master_lens: {
        why_this_lens: "The selected master is a learning archetype, not an authority claim."
      },
      interview_calibration: {
        answers_summary: "The interview clarified review triggers, horizon, and evidence threshold."
      },
      guardrail_protocols: [
        {
          title: "Guardrail Protocols",
          rationale: "Guardrails structure process without giving investment advice."
        }
      ],
      next_process_step: "Run /investment-decision on a current thesis."
    },
    agentQuestions: [
      "What would make you stop and review a thesis?",
      "What horizon should default public-equity ideas use?",
      "What evidence is enough to move from research to decision review?"
    ],
    answersSummary: "The user summarized risk through review triggers, a multi-year default horizon, and an evidence threshold requiring valuation, value capture, and falsification."
  });
}

setup();
const output = join(root, "mirror");
const profileResult = generateInvestorProfile({
  output,
  include: [join(root, ".codex", "sessions")],
  exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
  reindex: true,
  now: new Date("2026-06-13T12:00:00Z")
});
finalizeFixture(output);
const review = lintInvestmentDecision({
  output,
  thesis: "I want to buy PLTR because AI platforms could unlock a massive growth curve.",
  writeLog: true,
  now: new Date("2026-06-13T13:00:00Z")
});
const html = readFileSync(review.artifact_paths.html, "utf8");

const results: EvalResult[] = [];

for (const item of queryEval.router) {
  const actual = routeQuery(item.query);
  results.push(check("router", item.name, actual === item.expected_route, `expected ${item.expected_route}, got ${actual}`));
}

for (const item of queryEval.memory) {
  const answer = mirrorAsk(item.query, output);
  const kinds = new Set(answer.evidence.map((evidence) => evidence.kind));
  const hasExpectedKind = item.expected_kinds.some((kind) => kinds.has(kind as any));
  results.push(check("memory", item.name, answer.raw_transcript_exposed === item.expect_raw && hasExpectedKind, `raw=${answer.raw_transcript_exposed}; kinds=${[...kinds].join(",")}`));
}

for (const item of queryEval.safety) {
  const localReview = lintInvestmentDecision({ output, thesis: item.thesis, now: new Date("2026-06-13T14:00:00Z") });
  const reviewText = JSON.stringify(localReview) + readFileSync(localReview.artifact_paths.html, "utf8");
  const forbiddenHit = item.forbidden.find((phrase) => reviewText.toLowerCase().includes(phrase.toLowerCase()));
  results.push(check("safety", item.name, !forbiddenHit, forbiddenHit ? `forbidden phrase found: ${forbiddenHit}` : "no recommendation phrasing"));
}

for (const item of extractionEval.fixtures) {
  const fixtureRoot = join(root, `extract-${item.name}`);
  mkdirSync(join(fixtureRoot, ".codex", "sessions"), { recursive: true });
  writeFileSync(join(fixtureRoot, ".codex", "sessions", "session.jsonl"), JSON.stringify({ role: "user", timestamp: "2026-06-05T10:00:00Z", content: item.text }));
  const fixtureOutput = join(fixtureRoot, "mirror");
  const result = generateInvestorProfile({
    output: fixtureOutput,
    include: [join(fixtureRoot, ".codex", "sessions")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  const packet = JSON.parse(readFileSync(join(fixtureOutput, "profile_evidence.json"), "utf8"));
  const episodes = packet.candidate_decision_episodes ?? [];
  const patterns = new Set(episodes.flatMap((episode: any) => episode.patterns ?? []));
  const hasPatterns = item.expected_candidate_patterns.every((pattern) => patterns.has(pattern));
  const hasEpisodeType = episodes.some((episode: any) => episode.episode_type === item.expected_episode_type);
  const hasTier = episodes.some((episode: any) => episode.evidence_tier === item.expected_evidence_tier);
  const abstainsFromFinal = !existsSync(join(fixtureOutput, "profile.json")) && !existsSync(join(fixtureOutput, "profile.html"));
  results.push(check("extraction", item.name, hasPatterns && hasEpisodeType && hasTier && abstainsFromFinal && result.profile.synthesis_mode === "evidence_only_requires_llm", `patterns=${[...patterns].join(",")}; episodes=${episodes.length}; abstains=${abstainsFromFinal}`));
}

results.push(check("lifecycle", "candidate_inputs_not_final_profile", existsSync(join(output, "profile_candidate_inputs.json")) && existsSync(join(output, "profile.json")) && profileResult.profile.synthesis_mode === "evidence_only_requires_llm", "candidate inputs and final profile are separate artifacts"));
results.push(check("safety", "decision_html_no_recommendations", !/we recommend|you should buy|you should sell|strong buy|strong sell/i.test(html), "decision HTML contains no recommendation phrasing"));
results.push(check("decision", "generates_p0_blockers", review.issues.some((issue) => issue.severity === "P0"), "decision review includes P0 issues"));

const failed = results.filter((result) => !result.passed);
process.stdout.write(`${JSON.stringify({ passed: failed.length === 0, results }, null, 2)}\n`);
if (failed.length) process.exit(1);
