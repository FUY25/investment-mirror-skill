#!/usr/bin/env node
import { buildCandidateSpans, collectCandidateEvidenceLedger, discoverSources, parseSource } from "../src/core.ts";

const sources = discoverSources({ reindex: true });
const turns = sources.flatMap(parseSource);
const spans = buildCandidateSpans(turns);
const ledger = collectCandidateEvidenceLedger(spans);
process.stdout.write(`${JSON.stringify({
  artifact_kind: "full_candidate_span_ledger",
  warning: "Full candidate ledger is a search input for agent/LLM review; it is not classification.",
  candidate_count: spans.length,
  ledger_count: ledger.length,
  candidate_span_ledger: ledger
}, null, 2)}\n`);
