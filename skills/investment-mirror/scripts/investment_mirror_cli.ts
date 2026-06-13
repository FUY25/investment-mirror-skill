#!/usr/bin/env node
import { existsSync } from "node:fs";
import { generateInvestorProfile, lintInvestmentDecision, mirrorAsk, profileUpdate, discoverSources, buildSourceManifest } from "../src/core.ts";

type ParsedArgs = {
  command: string;
  values: string[];
  output?: string;
  include: string[];
  exclude: string[];
  reindex: boolean;
  writeLog: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const parsed: ParsedArgs = { command, values: [], include: [], exclude: [], reindex: false, writeLog: false };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--output") parsed.output = rest[++index];
    else if (arg === "--include") parsed.include.push(rest[++index]);
    else if (arg === "--exclude") parsed.exclude.push(rest[++index]);
    else if (arg === "--reindex") parsed.reindex = true;
    else if (arg === "--write-log" || arg === "--write") parsed.writeLog = true;
    else if (arg === "--since") index += 1;
    else parsed.values.push(arg);
  }
  return parsed;
}

function print(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.command === "help" || args.command === "--help") {
    process.stdout.write(`Investment Mirror v0.2

Commands:
  profile-init [--output PATH] [--include PATH] [--exclude PATH] [--reindex]
  profile-update [--output PATH] [--include PATH] [--exclude PATH] [--since 30d]
  decision "thesis text" [--output PATH] [--write-log]
  mirror-ask "question" [--output PATH]
  discover-sources [--output PATH] [--include PATH] [--exclude PATH]
`);
    return;
  }

  if (args.command === "discover-sources") {
    const sources = discoverSources({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex });
    if (args.output) buildSourceManifest(sources, args.output);
    print({
      source_count: sources.length,
      by_type: countBy(sources.map((source) => source.source_type)),
      by_status: countBy(sources.map((source) => source.status)),
      manifest_written: args.output ? existsSync(args.output) : false,
      sources: sources.slice(0, 50)
    });
    return;
  }

  if (args.command === "profile-init" || args.command === "investment-profile-init") {
    const result = generateInvestorProfile({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex });
    print({
      profile_path: `${result.outputDir}/profile.json`,
      html_path: `${result.outputDir}/profile.html`,
      guardrails_path: `${result.outputDir}/guardrails.yaml`,
      prompt_pack_path: `${result.outputDir}/prompt_pack.md`,
      source_index_path: `${result.outputDir}/source_index.sqlite`,
      source_count: result.sources.length,
      decision_episodes_found: result.episodes.length,
      best_fit_master_matches: result.profile.best_fit_master_matches.map((match) => ({ master_id: match.master_id, similarity: match.similarity })),
      calibration_recommended: result.profile.source_summary.calibration_recommended
    });
    return;
  }

  if (args.command === "profile-update" || args.command === "investment-profile-update") {
    const result = profileUpdate({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex });
    print({
      profile_path: `${result.outputDir}/profile.json`,
      html_path: `${result.outputDir}/profile.html`,
      update: result.update
    });
    return;
  }

  if (args.command === "decision" || args.command === "investment-decision") {
    const thesis = args.values.join(" ").trim();
    if (!thesis) throw new Error("Missing thesis text for investment decision.");
    const review = lintInvestmentDecision({ output: args.output, thesis, writeLog: args.writeLog });
    print({
      decision_id: review.decision_id,
      mode: review.mode,
      process_status: review.decision_status,
      p0_count: review.issues.filter((issue) => issue.severity === "P0").length,
      p1_count: review.issues.filter((issue) => issue.severity === "P1").length,
      p2_count: review.issues.filter((issue) => issue.severity === "P2").length,
      artifact_paths: review.artifact_paths,
      research_questions: review.research_questions
    });
    return;
  }

  if (args.command === "mirror-ask" || args.command === "investment-mirror-ask") {
    const question = args.values.join(" ").trim();
    if (!question) throw new Error("Missing question for Investment Mirror memory.");
    print(mirrorAsk(question, args.output));
    return;
  }

  throw new Error(`Unknown command: ${args.command}`);
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

main();
