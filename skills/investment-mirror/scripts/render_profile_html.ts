#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const result = generateInvestorProfile({ reindex: false });
process.stdout.write(`${JSON.stringify({
  candidate_report: `${result.outputDir}/${result.profile.candidate_report_html_path ?? "profile_candidate_report.html"}`,
  report_template: `${result.outputDir}/${result.profile.profile_report_template_path ?? "profile_report_template.html"}`,
  final_rendered_html_pending: `${result.outputDir}/${result.profile.final_rendered_html_path ?? result.profile.final_model_html_path ?? "profile.html"}`
}, null, 2)}\n`);
