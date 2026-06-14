import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  __hashFileReadCount,
  __resetHashFileReadCount,
  buildCandidateSpans,
  buildSourceManifest,
  classifyDecisionEpisodes,
  collectCandidateEvidenceLedger,
  discoverSources,
  finalizeProfile,
  generateInvestorProfile,
  lintInvestmentDecision,
  mirrorAsk,
  parseSource,
  profileUpdate,
  redactSensitive,
  scoreText
} from "../skills/investment-mirror/src/core.ts";
import { ACTIVE_MASTER_IDS } from "../skills/investment-mirror/src/master_data.ts";

// Fixtures live outside the repo so the discovery self-ingestion guard (which
// excludes the repo path) does not skip them.
const root = join(tmpdir(), "investment-mirror-test");

function resetFixture() {
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, ".codex", "sessions", "2026", "06"), { recursive: true });
  mkdirSync(join(root, ".claude", "projects", "investing"), { recursive: true });
  const codexFile = join(root, ".codex", "sessions", "2026", "06", "session.jsonl");
  const claudeFile = join(root, ".claude", "projects", "investing", "conversation.jsonl");
  writeFileSync(codexFile, [
    JSON.stringify({ role: "user", timestamp: "2026-06-01T10:00:00Z", content: "I need to decide whether this AI infrastructure thesis is investable. The market may underprice the growth, but I have not checked valuation, value capture, or what would prove me wrong." }),
    JSON.stringify({ role: "assistant", timestamp: "2026-06-01T10:01:00Z", content: "We should define assumptions, valuation expectations, falsification conditions, and a research rule." }),
    JSON.stringify({ role: "user", timestamp: "2026-06-02T10:00:00Z", content: "For this coding project, choose between speed and correctness. I want criteria, evidence, and a benchmark before proceeding." })
  ].join("\n"), "utf8");
  writeFileSync(claudeFile, [
    JSON.stringify({ role: "human", timestamp: "2026-06-03T10:00:00Z", text: "I want to buy TSLA because robotaxi could unlock a massive growth curve over 3 years. I still need a reverse expectation check and value capture work." }),
    JSON.stringify({ role: "assistant", timestamp: "2026-06-03T10:02:00Z", text: "Questions: what does price assume, who captures economics, what would falsify the thesis?" })
  ].join("\n"), "utf8");
}

function finalizeFixture(output: string) {
  const candidate = JSON.parse(readFileSync(join(output, "profile_candidate_inputs.json"), "utf8"));
  const finalContent = modelGeneratedProfileContent(candidate.best_fit_master_matches[0]?.display_name ?? "Model-selected master");
  return finalizeProfile({
    output,
    synthesizedProfile: {
      profile_id: candidate.profile_id,
      evidence_summary: "The local evidence shows recurring investment reasoning around thesis quality, valuation checks, value capture, and falsification.",
      interpretation_summary: "The model interprets the evidence as a style that can form strong narratives but needs explicit price, capture, and disconfirmation protocols.",
      primary_patterns: candidate.primary_patterns,
      best_fit_master_matches: candidate.best_fit_master_matches.slice(0, 1).map((match: any) => ({
        ...match,
        why_match: "Model-selected learning lens after reviewing evidence, interview answers, and master records.",
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
      risk_preference_summary: "The user prefers process-defined risk checks over inferred tolerance; drawdown tolerance remains bounded by user-owned review rules.",
      time_horizon_summary: "The calibration answer points to multi-year thesis review when evidence, valuation, and falsification are explicit.",
      constraints_summary: "No personal liquidity, tax, or suitability constraints are inferred; the profile keeps them outside deterministic evidence.",
      false_match_warning: "The master match is a learning lens only and must not be copied as authority or identity.",
      unknown_dimensions: []
    },
    finalContent,
    agentQuestions: [
      "What drawdown or thesis deterioration would make you stop and review?",
      "What horizon should most public-equity ideas use by default?",
      "What evidence threshold is enough to stop researching and move to a decision review?"
    ],
    answersSummary: "The user answered that risk should be governed by review triggers, the default horizon is multi-year, and sufficient evidence means valuation, value capture, and falsification are all written.",
    now: new Date("2026-06-13T14:00:00Z")
  });
}

function modelGeneratedProfileContent(masterName: string) {
  return {
    hero: {
      positive_recognition: "Evidence-backed decision profile",
      status_line: "Final profile rendered from model structured content."
    },
    evidence: {
      summary: "Local receipt summaries and source IDs support the profile; raw transcript text is not exposed."
    },
    interpretation: {
      summary: "The model interpretation separates evidence from judgment and explains which signals mattered.",
      rejected_or_downweighted_signals: ["candidate similarity scores were treated as suggestions only"]
    },
    master_lens: {
      why_this_lens: `${masterName} is used as a learning archetype, not an identity or authority claim.`,
      what_to_learn: ["connect thesis quality to explicit review rules"],
      what_not_to_copy: ["do not copy another investor as authority"]
    },
    interview_calibration: {
      answers_summary: "The interview clarified risk review triggers, horizon, and evidence threshold."
    },
    guardrail_protocols: [
      {
        guardrail_id: "falsification_condition_before_position",
        title: "Falsification Condition",
        rationale: "Guardrails convert style into repeatable research and decision-review protocols.",
        questions: ["What would weaken this thesis?"]
      }
    ],
    next_process_step: "Run /investment-decision on a current thesis."
  };
}

test("redacts secrets and sensitive identifiers", () => {
  const redacted = redactSensitive("email me@example.com sk-abcdefghijklmnopqrstuvwxyz bearer abcdefghijklmnopqrstuvwxyz token=supersecretvalue");
  assert.match(redacted, /\[REDACTED_EMAIL\]/);
  assert.match(redacted, /\[REDACTED_OPENAI_KEY\]/);
  assert.match(redacted, /Bearer \[REDACTED\]/);
  assert.match(redacted, /token=\[REDACTED\]/);
});

test("discovers transcript sources and scores decision spans", () => {
  resetFixture();
  const sources = discoverSources({
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true
  });
  assert.equal(sources.length, 2);
  assert.ok(sources.some((source) => source.source_type === "codex_jsonl" || source.source_type === "json_transcript"));
  const turns = sources.flatMap(parseSource);
  assert.ok(turns.length >= 5);
  const score = scoreText(turns.map((turn) => turn.text_redacted).join("\n"));
  assert.ok(score.decision_score > 3);
  const optionalScore = scoreText("This is optional, but I need to decide between two options before making decisions.");
  assert.ok(optionalScore.reason_codes.includes("decision_terms"));
  const spans = collectCandidateEvidenceLedger(buildCandidateSpans(turns));
  const episodes = classifyDecisionEpisodes(spans, turns, sources);
  assert.ok(episodes.length >= 2);
  assert.ok(episodes.some((episode) => episode.patterns.includes("narrative_to_action_jump")));
});

test("generates local candidate inputs without writing final profile artifacts", () => {
  resetFixture();
  const output = join(root, "mirror");
  const result = generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  assert.ok(result.profile.best_fit_master_matches.length >= 1);
  assert.ok(result.profile.best_fit_master_matches.length <= 2);
  assert.equal(result.profile.synthesis_mode, "evidence_only_requires_llm");
  assert.equal(result.profile.artifact_kind, "deterministic_profile_inputs");
  assert.equal(result.profile.profile_state, "interview_required");
  assert.equal(result.profile.llm_required, true);
  assert.deepEqual(result.profile.interview_question_count, { min: 2, max: 5 });
  assert.ok((result.profile.calibration_question_topics ?? []).some((topic) => topic.dimension === "risk_preference_loss_tolerance"));
  assert.ok(existsSync(join(output, "profile_candidate_inputs.json")));
  assert.ok(existsSync(join(output, "profile_evidence.json")));
  assert.ok(existsSync(join(output, "profile_synthesis_prompt.md")));
  assert.ok(existsSync(join(output, "profile_finalization_schema.json")));
  assert.ok(existsSync(join(output, "profile_report_template.html")));
  assert.ok(existsSync(join(output, "profile_state.json")));
  assert.ok(existsSync(join(output, "guardrails.yaml")));
  assert.ok(existsSync(join(output, "prompt_pack.md")));
  assert.ok(existsSync(join(output, "InvestmentMirror.md")));
  assert.ok(existsSync(join(output, "profile_candidate_report.html")));
  assert.equal(existsSync(join(output, "profile.json")), false);
  assert.equal(existsSync(join(output, "profile.html")), false);
  assert.ok(existsSync(join(output, "source_index.sqlite")));
  assert.equal(existsSync(join(output, ".sqlite_payload.json")), false);
  const prompt = readFileSync(join(output, "profile_synthesis_prompt.md"), "utf8");
  assert.match(prompt, /Generate 2-5 interview questions/i);
  assert.match(prompt, /--content profile_model_content\.json/);
  assert.match(prompt, /profile_report_template\.html/);
  assert.match(prompt, /profile-finalize/);
  const template = readFileSync(join(output, "profile_report_template.html"), "utf8");
  assert.match(template, /AI HTML Reference/);
  assert.match(template, /not a fill-in template/i);
  assert.doesNotMatch(template, /\{\{[^}]+\}\}/);
  const html = readFileSync(join(output, "profile_candidate_report.html"), "utf8");
  assert.match(html, /Candidate evidence report/);
  assert.match(html, /Full candidate ledger/);
  assert.match(html, /Candidate Guardrail Inputs/);
  assert.doesNotMatch(html, /Finalized model profile/);
  assert.doesNotMatch(html.slice(0, 1200), /P0|blocker|flaw/i);
});

test("profile finalize refuses to write final artifacts without model-generated content or html", () => {
  resetFixture();
  const output = join(root, "mirror-finalize-no-html");
  generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  const candidate = JSON.parse(readFileSync(join(output, "profile_candidate_inputs.json"), "utf8"));
  assert.throws(() => finalizeProfile({
    output,
    synthesizedProfile: {
      profile_id: candidate.profile_id,
      evidence_summary: "The local evidence shows repeated candidate episodes and model-reviewed source receipts.",
      interpretation_summary: "The model interprets the receipts as a process profile requiring explicit guardrails.",
      primary_patterns: candidate.primary_patterns,
      best_fit_master_matches: candidate.best_fit_master_matches.slice(0, 1),
      match_strengths: candidate.match_strengths,
      active_guardrails: candidate.active_guardrails,
      recommended_guardrails: candidate.recommended_guardrails,
      decision_fingerprint: candidate.decision_fingerprint,
      default_issue: candidate.default_issue,
      source_summary: candidate.source_summary,
      receipts: candidate.receipts,
      risk_preference_summary: "Risk preference is represented by user-owned review triggers.",
      time_horizon_summary: "The user clarified a multi-year default horizon.",
      constraints_summary: "No personal constraints are inferred from local logs.",
      false_match_warning: "The master match is a learning lens only.",
      unknown_dimensions: []
    },
    agentQuestions: [
      "What would make you stop and review?",
      "What horizon should most ideas use?"
    ],
    answersSummary: "The user clarified review triggers, horizon, and evidence thresholds."
  }), /requires model-generated final content/);
  assert.equal(existsSync(join(output, "profile.json")), false);
  assert.equal(existsSync(join(output, "profile.html")), false);
});

test("profile finalize is the only writer of final profile json and html", () => {
  resetFixture();
  const output = join(root, "mirror-finalize");
  generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  const result = finalizeFixture(output);
  assert.equal(result.profile.synthesis_mode, "llm_synthesized");
  assert.equal(result.profile.profile_state, "finalized");
  assert.equal(result.profile.provisional, false);
  assert.equal(result.profile.llm_required, false);
  assert.equal("similarity" in result.profile.best_fit_master_matches[0], false);
  assert.equal("calibration_recommended" in result.profile.source_summary, false);
  assert.ok(existsSync(join(output, "profile.json")));
  assert.ok(existsSync(join(output, "profile.html")));
  const html = readFileSync(join(output, "profile.html"), "utf8");
  assert.match(html, /Final profile rendered from model structured content/);
  assert.match(html, /Interview Calibration/);
  assert.doesNotMatch(html, /you should buy|you should sell|strong buy|strong sell/i);
});

test("provisional finalization caps confidence and strips deterministic source flags", () => {
  resetFixture();
  const output = join(root, "mirror-provisional");
  generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  const candidate = JSON.parse(readFileSync(join(output, "profile_candidate_inputs.json"), "utf8"));
  const result = finalizeProfile({
    output,
    synthesizedProfile: {
      profile_id: candidate.profile_id,
      confidence: 0.9,
      evidence_summary: "The local evidence shows process behavior but limited direct public-equity history.",
      interpretation_summary: "The model interpretation is provisional because some calibration dimensions remain unknown.",
      primary_patterns: candidate.primary_patterns,
      best_fit_master_matches: candidate.best_fit_master_matches.slice(0, 1),
      match_strengths: candidate.match_strengths,
      active_guardrails: candidate.active_guardrails,
      recommended_guardrails: candidate.recommended_guardrails,
      decision_fingerprint: candidate.decision_fingerprint,
      default_issue: candidate.default_issue,
      source_summary: { ...candidate.source_summary, calibration_recommended: false },
      receipts: candidate.receipts,
      risk_preference_summary: "Risk preference remains partially unknown.",
      time_horizon_summary: "The user has not fully calibrated horizon.",
      constraints_summary: "No suitability, allocation, or position-size conclusion is inferred.",
      false_match_warning: "The master match is a learning lens only.",
      unknown_dimensions: ["minimum_evidence_package_for_decision_review"]
    },
    finalContent: modelGeneratedProfileContent(candidate.best_fit_master_matches[0]?.display_name ?? "Model-selected master"),
    agentQuestions: [
      "What evidence package is enough for review?",
      "What risk trigger should govern review?"
    ],
    answersSummary: "The user did not complete all calibration questions.",
    provisional: true,
    now: new Date("2026-06-13T14:30:00Z")
  });
  assert.equal(result.profile.profile_state, "provisional");
  assert.equal(result.profile.confidence <= 0.7, true);
  assert.equal("similarity" in result.profile.best_fit_master_matches[0], false);
  assert.equal("calibration_recommended" in result.profile.source_summary, false);
  assert.equal(result.profile.source_summary.calibration_status, "partial");
});

test("profile init is idempotent when all sources are unchanged", () => {
  resetFixture();
  const output = join(root, "mirror-idempotent");
  const first = generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  assert.ok(first.profile.source_summary.decision_episodes_found > 0);
  const second = generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    now: new Date("2026-06-13T13:00:00Z")
  });
  assert.equal(second.profile.source_summary.decision_episodes_found, first.profile.source_summary.decision_episodes_found);
  assert.deepEqual(second.profile.primary_patterns, first.profile.primary_patterns);
  assert.equal(second.profile.best_fit_master_matches[0].master_id, first.profile.best_fit_master_matches[0].master_id);
  assert.ok(existsSync(join(output, "profile_evidence.json")));
  assert.ok(existsSync(join(output, "profile_report_template.html")));
  assert.equal(existsSync(join(output, "profile.json")), false);
});

test("decision workflow is standalone before finalization and profile-aware after finalization", () => {
  resetFixture();
  const output = join(root, "mirror-decision");
  generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  const standalone = lintInvestmentDecision({
    output,
    thesis: "I want to buy TSLA because robotaxi could unlock a massive new growth curve.",
    now: new Date("2026-06-13T12:30:00Z")
  });
  assert.equal(standalone.mode, "standalone");
  finalizeFixture(output);
  const review = lintInvestmentDecision({
    output,
    thesis: "I want to buy TSLA because robotaxi could unlock a massive new growth curve.",
    now: new Date("2026-06-13T13:00:00Z")
  });
  assert.equal(review.mode, "profile_aware");
  assert.equal(review.decision_status, "blocked_by_p0_issues");
  assert.ok(review.issues.filter((issue) => issue.severity === "P0").length >= 3);
  assert.ok(review.issues.some((issue) => issue.issue_code === "valuation_expectation_missing"));
  assert.ok(review.issues.some((issue) => issue.issue_code === "value_capture_missing"));
  assert.ok(existsSync(review.artifact_paths.html));
  const html = readFileSync(review.artifact_paths.html, "utf8");
  assert.match(html, /P0 \/ P1 \/ P2 Issues/);
  assert.doesNotMatch(html, /strong buy|strong sell|we recommend|you should buy|you should sell/i);
});

test("profile update merges historical candidate evidence and preserves final profile", () => {
  resetFixture();
  const output = join(root, "mirror-update");
  const initial = generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  finalizeFixture(output);
  const newFile = join(root, ".codex", "sessions", "2026", "06", "new-session.jsonl");
  writeFileSync(newFile, JSON.stringify({ role: "user", timestamp: "2026-06-10T10:00:00Z", content: "For a new semiconductor cycle thesis, I need to define consensus, valuation expectations, and what evidence would prove me wrong before any decision review." }), "utf8");
  const updated = profileUpdate({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    since: "2000-01-01",
    now: new Date("2026-06-13T15:00:00Z")
  });
  assert.ok(updated.profile.source_summary.decision_episodes_found >= initial.profile.source_summary.decision_episodes_found);
  assert.equal(updated.update.final_profile_preserved, true);
  assert.ok(existsSync(join(output, "profile.json")));
  assert.ok(existsSync(join(output, "profile_candidate_inputs.json")));
});

test("mirror ask cites local evidence and avoids raw transcript exposure", () => {
  resetFixture();
  const output = join(root, "mirror-ask");
  generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  finalizeFixture(output);
  lintInvestmentDecision({
    output,
    thesis: "I want to buy TSLA because robotaxi could unlock a massive new growth curve.",
    writeLog: true,
    now: new Date("2026-06-13T13:00:00Z")
  });
  const answer = mirrorAsk("Which guardrail do I trigger most often?", output);
  assert.equal(answer.raw_transcript_exposed, false);
  assert.ok(answer.evidence.length > 0);
  assert.ok(answer.evidence.some((item) => item.id.startsWith("decision:") || item.id.startsWith("profile:") || item.id.startsWith("candidate:")));
  assert.match(answer.data_scope, /summaries only/);
  assert.ok(answer.next_guardrail_or_review_action);
  const raw = mirrorAsk("Show raw local evidence for robotaxi", output);
  assert.equal(raw.raw_transcript_exposed, true);
  assert.ok(raw.evidence.some((item) => item.kind === "redacted_turn"));
});

test("incremental discovery skips full reads for unchanged files", () => {
  resetFixture();
  const output = join(root, "mirror-incremental");
  const include = [join(root, ".codex", "sessions"), join(root, ".claude", "projects")];
  const exclude = [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")];
  const first = discoverSources({ output, include, exclude, reindex: true });
  buildSourceManifest(first, output);
  __resetHashFileReadCount();
  const second = discoverSources({ output, include, exclude });
  assert.equal(__hashFileReadCount(), 0, "unchanged corpus must not be re-hashed");
  assert.ok(second.every((source) => source.status === "unchanged"));
});

test("discovery never ingests IM output or repo/skill paths", () => {
  resetFixture();
  const output = join(root, "mirror-self");
  // Seed an artifact in the output dir and try to include the output dir + repo.
  mkdirSync(output, { recursive: true });
  writeFileSync(join(output, "prior_decision.md"), "I decided to buy NVDA over 2 years.", "utf8");
  const sources = discoverSources({
    output,
    include: [output, resolve("skills", "investment-mirror"), resolve(".")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true
  });
  assert.ok(!sources.some((source) => source.path.startsWith(resolve(output))), "must not ingest IM output dir");
  assert.ok(!sources.some((source) => source.path.startsWith(resolve("skills", "investment-mirror"))), "must not ingest skill path");
});

test("decision parser extracts the real ticker, not a leading stop-word", () => {
  resetFixture();
  const output = join(root, "mirror-ticker");
  const review = lintInvestmentDecision({
    output,
    thesis: "I want to buy TSLA because robotaxi could unlock a massive new growth curve.",
    now: new Date("2026-06-13T12:30:00Z")
  });
  assert.equal(review.ticker, "TSLA");
  assert.notEqual(review.asset_or_theme, "I");
  assert.match(review.artifact_paths.html, /tsla/);
  assert.ok(review.decision_id.startsWith("dec_") && /tsla/.test(review.decision_id));
  const cashtag = lintInvestmentDecision({ output, thesis: "Thinking about $nvda exposure here over 3 years.", now: new Date("2026-06-13T12:31:00Z") });
  assert.equal(cashtag.ticker, "NVDA");
  const themed = lintInvestmentDecision({ output, thesis: "I want to invest in the clean energy transition over the next decade.", now: new Date("2026-06-13T12:32:00Z") });
  assert.equal(themed.ticker, null);
  assert.notEqual(themed.asset_or_theme, "I");
});

test("zero discovered sources returns an explicit needs-sources state, not a master suggestion", () => {
  resetFixture();
  const output = join(root, "mirror-empty");
  const emptyDir = join(root, "no-sources-here");
  mkdirSync(emptyDir, { recursive: true });
  const result = generateInvestorProfile({
    output,
    include: [emptyDir],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
  assert.equal(result.sources.length, 0);
  assert.equal(result.profile.profile_state, "needs_sources");
  assert.equal(result.profile.needs_sources, true);
  assert.equal(result.profile.best_fit_master_matches.length, 0);
  assert.match(result.profile.source_guidance ?? "", /0 sources discovered/);
  const state = JSON.parse(readFileSync(join(output, "profile_state.json"), "utf8"));
  assert.equal(state.state, "needs_sources");
});

test("active master registry has 30 complete active IDs", () => {
  assert.equal(ACTIVE_MASTER_IDS.length, 30);
  for (const id of ACTIVE_MASTER_IDS) {
    assert.ok(existsSync(join("research", "masters", id, "profile.md")), id);
    assert.ok(existsSync(join("research", "masters", id, "sources.yaml")), id);
    assert.ok(existsSync(join("research", "masters", id, "style_notes.md")), id);
    assert.ok(existsSync(join("assets", "masters", `${id}.svg`)), id);
    assert.ok(existsSync(join("skills", "investment-mirror", "assets", "masters", `${id}.svg`)), id);
    const svg = readFileSync(join("assets", "masters", `${id}.svg`), "utf8");
    assert.match(svg, /imagegen_line_art/, id);
    assert.doesNotMatch(svg, /source_photo_line_art/, id);
  }
});
