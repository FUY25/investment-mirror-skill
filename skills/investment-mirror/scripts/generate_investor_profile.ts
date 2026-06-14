#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const result = generateInvestorProfile({ output, reindex: process.argv.includes("--reindex") });
process.stdout.write(`${JSON.stringify({
  candidate_profile_inputs: result.profile,
  output_dir: result.outputDir,
  candidate_inputs_path: `${result.outputDir}/${result.profile.candidate_profile_inputs_path ?? "profile_candidate_inputs.json"}`,
  evidence_path: `${result.outputDir}/${result.profile.profile_evidence_path ?? "profile_evidence.json"}`,
  synthesis_prompt_path: `${result.outputDir}/${result.profile.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md"}`,
  finalization_schema_path: `${result.outputDir}/${result.profile.profile_finalization_schema_path ?? "profile_finalization_schema.json"}`,
  report_template_path: `${result.outputDir}/${result.profile.profile_report_template_path ?? "profile_report_template.html"}`,
  candidate_report_path: `${result.outputDir}/${result.profile.candidate_report_html_path ?? "profile_candidate_report.html"}`,
  final_rendered_html_path_pending: `${result.outputDir}/${result.profile.final_rendered_html_path ?? result.profile.final_model_html_path ?? "profile.html"}`,
  required_interview_questions: result.profile.interview_question_count ?? { min: 2, max: 5 }
}, null, 2)}\n`);
