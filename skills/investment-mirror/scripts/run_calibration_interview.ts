#!/usr/bin/env node
process.stdout.write(`${JSON.stringify({
  interview_question_contract: {
    required: true,
    count_min: 2,
    count_max: 5,
    generated_by: "agent_llm_after_reading_profile_evidence",
    purpose: "Pin down profile dimensions that cannot be safely inferred from logs before writing the final model profile and report."
  },
  required_unobserved_dimensions: [
    "risk preference and loss tolerance",
    "investment horizon",
    "liquidity, tax, or personal constraints",
    "concentration comfort",
    "what counts as enough evidence to stop researching"
  ],
  instruction: "Do not use this script as a fixed questionnaire. Read profile_evidence.json, choose the highest-value gaps, and ask the user 2-5 concrete questions in your own words."
}, null, 2)}\n`);
