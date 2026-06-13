import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { generateInvestorProfile, lintInvestmentDecision, mirrorAsk } from "../skills/investment-mirror/src/core.ts";

type EvalResult = { name: string; passed: boolean; detail: string };

const root = resolve(".investment-mirror-test/evals");

function setup() {
  rmSync(root, { recursive: true, force: true });
  mkdirSync(join(root, ".codex", "sessions"), { recursive: true });
  writeFileSync(join(root, ".codex", "sessions", "session.jsonl"), [
    JSON.stringify({ role: "user", timestamp: "2026-06-01T10:00:00Z", content: "I am researching AI software stocks. I like product quality and the founder story, but I need valuation expectations, falsification, and value capture before action." }),
    JSON.stringify({ role: "user", timestamp: "2026-06-02T10:00:00Z", content: "I keep adding more research. Please force this into three decision variables and a reject rule." }),
    JSON.stringify({ role: "user", timestamp: "2026-06-03T10:00:00Z", content: "The market may be wrong about cloud growth, but I need to define consensus first." })
  ].join("\n"));
}

function check(name: string, passed: boolean, detail: string): EvalResult {
  return { name, passed, detail };
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
const review = lintInvestmentDecision({
  output,
  thesis: "I want to buy PLTR because AI platforms could unlock a massive growth curve.",
  writeLog: true,
  now: new Date("2026-06-13T13:00:00Z")
});
const html = readFileSync(review.artifact_paths.html, "utf8");
const ask = mirrorAsk("Which AI decisions were blocked by P0 issues?", output);

const results: EvalResult[] = [
  check("avoids buy/sell recommendation language", !/we recommend|you should buy|you should sell|strong buy|strong sell/i.test(html), "decision HTML contains no recommendation phrasing"),
  check("generates P0 blocker issues", review.issues.some((issue) => issue.severity === "P0"), "decision review includes P0 issues for incomplete thesis"),
  check("cites evidence summaries in profile", profileResult.profile.receipts.length > 0, "profile includes receipt summaries"),
  check("distinguishes evidence from interpretation in mirror ask", ask.evidence.length > 0 && ask.interpretation.length > 0, "mirror ask returns evidence and interpretation fields"),
  check("does not expose raw transcripts", ask.raw_transcript_exposed === false, "mirror ask raw_transcript_exposed=false"),
  check("profile uses 1-2 master matches", profileResult.profile.best_fit_master_matches.length >= 1 && profileResult.profile.best_fit_master_matches.length <= 2, "best-fit master match count is within v0.2 limit"),
  check("does not over-weight coding logs in fixture", profileResult.profile.source_summary.tier2_investment_episodes >= 1, "investment evidence remains represented"),
  check("HTML artifact smoke", existsSync(review.artifact_paths.html) && /Decision Review/.test(html) && /P0 \/ P1 \/ P2 Issues/.test(html), "decision HTML was rendered with required sections")
];

const failed = results.filter((result) => !result.passed);
process.stdout.write(`${JSON.stringify({ passed: failed.length === 0, results }, null, 2)}\n`);
if (failed.length) process.exit(1);
