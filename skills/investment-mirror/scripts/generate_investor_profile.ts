#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const result = generateInvestorProfile({ output, reindex: process.argv.includes("--reindex") });
process.stdout.write(`${JSON.stringify({
  profile: result.profile,
  output_dir: result.outputDir,
  evidence_path: `${result.outputDir}/${result.profile.profile_evidence_path ?? "profile_evidence.json"}`,
  synthesis_prompt_path: `${result.outputDir}/${result.profile.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md"}`,
  report_template_path: `${result.outputDir}/${result.profile.profile_report_template_path ?? "profile_report_template.html"}`,
  draft_html_path: `${result.outputDir}/${result.profile.deterministic_draft_html_path ?? "profile_draft.html"}`,
  final_model_html_path: `${result.outputDir}/${result.profile.final_model_html_path ?? "profile.html"}`,
  required_interview_questions: result.profile.interview_question_count ?? { min: 2, max: 5 }
}, null, 2)}\n`);
