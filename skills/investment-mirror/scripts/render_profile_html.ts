#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const result = generateInvestorProfile({ reindex: false });
process.stdout.write(`${JSON.stringify({
  draft_html: `${result.outputDir}/${result.profile.deterministic_draft_html_path ?? "profile_draft.html"}`,
  report_template: `${result.outputDir}/${result.profile.profile_report_template_path ?? "profile_report_template.html"}`,
  final_model_html: `${result.outputDir}/${result.profile.final_model_html_path ?? "profile.html"}`
}, null, 2)}\n`);
