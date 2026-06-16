# Artifact Style

Generated HTML artifacts are static-first reports with light interactions only.

## Direction

- professional private-banking-meets-developer-tool tone;
- lots of whitespace;
- crisp report typography;
- line-art or halftone master portraits;
- copper/orange accent rules;
- subtle stacked report-card layout;
- source/provenance microcopy;
- no casino, trading-guru, or social-hype aesthetic;
- no purple AI dashboard;
- no dense app shell.

## Profile Artifacts

`profile_candidate_report.html` must clearly state that it is an evidence workbench, not a profile draft. It may show source coverage, retrieval scores, matched lexical signals, and redacted candidate evidence snippets. It must not present deterministic profile patterns, master suggestions, selected guardrails, confidence, or interpretation as user-facing judgment.

Final `profile.html` must:

- start with the user's decision style and why that style resembles the selected master lens;
- keep final/provisional state available in artifact metadata rather than as low-information visible chrome;
- place a large best-fit master portrait and short master bio near the top;
- separate evidence from interpretation;
- include interview calibration in the structured evidence contract and, when useful, in dimension-level evidence signals rather than as a standalone section;
- show unknown dimensions when provisional;
- keep master-match caveats in structured content and visible watch-outs, not as repetitive self-justifying warnings;
- show guardrails as pre-investment questions that make the style more investable.

`profile_report_template.html` is an AI visual reference specimen. It shows required sections, tone, and visual rhythm. It is not a fill-in template. The agent/LLM must generate structured final profile content, not hand-written raw HTML. The finalizer renders the canonical `profile.html` from that content using deterministic layout and safety rules.

## Decision Artifacts

Decision reviews must use P0/P1/P2 issues, process statuses, assumptions, pass conditions, and guided research questions.

Allowed process statuses:

- `draft`
- `needs_clarification`
- `blocked_by_p0_issues`
- `needs_research`
- `ready_for_user_decision`
- `decision_logged`
- `follow_up_due`
- `revisited`
- `abandoned_by_user`

Forbidden statuses and recommendations:

- `buy`
- `sell`
- `hold`
- `strong buy`
- `strong sell`
