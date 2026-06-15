#!/usr/bin/env node
import { existsSync } from "node:fs";
import { generateInvestorProfile, lintInvestmentDecision, mirrorAsk, profileUpdate, discoverSources, buildSourceManifest, finalizeProfile } from "../src/core.ts";

type ParsedArgs = {
  command: string;
  values: string[];
  output?: string;
  include: string[];
  exclude: string[];
  reindex: boolean;
  writeLog: boolean;
  since?: string;
  synthesis?: string;
  content?: string;
  html?: string;
  questions?: string;
  answersSummary?: string;
  provisional: boolean;
  declinedInterview: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const parsed: ParsedArgs = { command, values: [], include: [], exclude: [], reindex: false, writeLog: false, provisional: false, declinedInterview: false };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--output") parsed.output = rest[++index];
    else if (arg === "--include") parsed.include.push(rest[++index]);
    else if (arg === "--exclude") parsed.exclude.push(rest[++index]);
    else if (arg === "--reindex") parsed.reindex = true;
    else if (arg === "--write-log" || arg === "--write") parsed.writeLog = true;
    else if (arg === "--since") parsed.since = rest[++index];
    else if (arg === "--synthesis") parsed.synthesis = rest[++index];
    else if (arg === "--content") parsed.content = rest[++index];
    else if (arg === "--html") parsed.html = rest[++index];
    else if (arg === "--questions") parsed.questions = rest[++index];
    else if (arg === "--answers-summary") parsed.answersSummary = rest[++index];
    else if (arg === "--provisional") parsed.provisional = true;
    else if (arg === "--declined-interview") parsed.declinedInterview = true;
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
  profile-finalize --synthesis PATH --questions PATH --answers-summary TEXT --content PATH [--provisional] [--output PATH]
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
    const result = generateInvestorProfile({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex, since: args.since });
    print({
      candidate_inputs_path: `${result.outputDir}/${result.profile.candidate_profile_inputs_path ?? "profile_candidate_inputs.json"}`,
      synthesis_mode: result.profile.synthesis_mode,
      llm_required: result.profile.llm_required,
      evidence_path: `${result.outputDir}/${result.profile.profile_evidence_path ?? "profile_evidence.json"}`,
      synthesis_prompt_path: `${result.outputDir}/${result.profile.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md"}`,
      finalization_schema_path: `${result.outputDir}/${result.profile.profile_finalization_schema_path ?? "profile_finalization_schema.json"}`,
      report_template_path: `${result.outputDir}/${result.profile.profile_report_template_path ?? "profile_report_template.html"}`,
      candidate_report_path: `${result.outputDir}/${result.profile.candidate_report_html_path ?? "profile_candidate_report.html"}`,
      final_profile_path_pending: `${result.outputDir}/profile.json`,
      final_rendered_html_path_pending: `${result.outputDir}/${result.profile.final_rendered_html_path ?? result.profile.final_model_html_path ?? "profile.html"}`,
      guardrails_path: `${result.outputDir}/guardrails.yaml`,
      prompt_pack_path: `${result.outputDir}/prompt_pack.md`,
      source_index_path: `${result.outputDir}/source_index.sqlite`,
      source_count: result.sources.length,
      candidate_spans_found: result.profile.source_summary.candidate_spans_found ?? 0,
      deterministic_profile_judgments: false,
      model_review_required: result.profile.source_summary.model_review_required ?? true,
      required_interview_questions: result.profile.interview_question_count ?? { min: 2, max: 5 },
      calibration_question_topics: result.profile.calibration_question_topics ?? [],
      presentation_next_steps: result.profile.presentation_next_steps ?? []
    });
    return;
  }

  if (args.command === "profile-update" || args.command === "investment-profile-update") {
    const result = profileUpdate({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex, since: args.since });
    print({
      candidate_inputs_path: `${result.outputDir}/${result.profile.candidate_profile_inputs_path ?? "profile_candidate_inputs.json"}`,
      candidate_report_path: `${result.outputDir}/${result.profile.candidate_report_html_path ?? "profile_candidate_report.html"}`,
      final_profile_preserved: result.update.final_profile_preserved,
      update: result.update
    });
    return;
  }

  if (args.command === "profile-finalize" || args.command === "investment-profile-finalize") {
    const result = finalizeProfile({
      output: args.output,
      synthesizedProfilePath: args.synthesis,
      finalContentPath: args.content,
      finalHtmlPath: args.html,
      questionsPath: args.questions,
      answersSummary: args.answersSummary,
      provisional: args.provisional,
      declinedInterview: args.declinedInterview
    });
    print({
      profile_path: `${result.outputDir}/profile.json`,
      html_path: `${result.outputDir}/profile.html`,
      profile_state: result.profile.profile_state,
      synthesis_mode: result.profile.synthesis_mode,
      provisional: result.profile.provisional,
      unknown_dimensions: result.profile.unknown_dimensions
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
