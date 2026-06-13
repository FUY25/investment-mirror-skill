import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  buildCandidateSpans,
  classifyDecisionEpisodes,
  discoverSources,
  generateInvestorProfile,
  lintInvestmentDecision,
  mirrorAsk,
  parseSource,
  redactSensitive,
  sampleCandidateEpisodes,
  scoreText
} from "../skills/investment-mirror/src/core.ts";
import { ACTIVE_MASTER_IDS } from "../skills/investment-mirror/src/master_data.ts";

const root = resolve(".investment-mirror-test");

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
  const spans = sampleCandidateEpisodes(buildCandidateSpans(turns), sources);
  const episodes = classifyDecisionEpisodes(spans, turns, sources);
  assert.ok(episodes.length >= 2);
  assert.ok(episodes.some((episode) => episode.patterns.includes("narrative_to_action_jump")));
});

test("generates a local profile with HTML, SQLite, guardrails, and master assets", () => {
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
  assert.ok(existsSync(join(output, "profile.json")));
  assert.ok(existsSync(join(output, "guardrails.yaml")));
  assert.ok(existsSync(join(output, "prompt_pack.md")));
  assert.ok(existsSync(join(output, "InvestmentMirror.md")));
  assert.ok(existsSync(join(output, "profile.html")));
  assert.ok(existsSync(join(output, "source_index.sqlite")));
  const html = readFileSync(join(output, "profile.html"), "utf8");
  assert.match(html, /Why This Match Is Good/);
  assert.match(html, /Guardrails To Make This Style Investable/);
  assert.doesNotMatch(html.slice(0, 1200), /P0|blocker|flaw/i);
});

test("decision workflow works standalone and profile-aware without recommendations", () => {
  resetFixture();
  const output = join(root, "mirror-decision");
  generateInvestorProfile({
    output,
    include: [join(root, ".codex", "sessions"), join(root, ".claude", "projects")],
    exclude: [join(process.env.HOME ?? "", ".codex"), join(process.env.HOME ?? "", ".claude")],
    reindex: true,
    now: new Date("2026-06-13T12:00:00Z")
  });
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
  lintInvestmentDecision({
    output,
    thesis: "I want to buy TSLA because robotaxi could unlock a massive new growth curve.",
    writeLog: true,
    now: new Date("2026-06-13T13:00:00Z")
  });
  const answer = mirrorAsk("Which guardrail do I trigger most often?", output);
  assert.equal(answer.raw_transcript_exposed, false);
  assert.ok(answer.evidence.length > 0);
  assert.ok(answer.next_guardrail_or_review_action);
});

test("active master registry has 30 complete active IDs", () => {
  assert.equal(ACTIVE_MASTER_IDS.length, 30);
  for (const id of ACTIVE_MASTER_IDS) {
    assert.ok(existsSync(join("research", "masters", id, "profile.md")), id);
    assert.ok(existsSync(join("research", "masters", id, "sources.yaml")), id);
    assert.ok(existsSync(join("research", "masters", id, "style_notes.md")), id);
    assert.ok(existsSync(join("assets", "masters", `${id}.svg`)), id);
    assert.ok(existsSync(join("skills", "investment-mirror", "assets", "masters", `${id}.svg`)), id);
  }
});
