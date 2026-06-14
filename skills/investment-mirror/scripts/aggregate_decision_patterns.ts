#!/usr/bin/env node
import { buildCandidateSpans, classifyDecisionEpisodes, collectCandidateEvidenceLedger, discoverSources, parseSource, aggregateDecisionPatterns } from "../src/core.ts";

const sources = discoverSources({ reindex: true });
const turns = sources.flatMap(parseSource);
const episodes = classifyDecisionEpisodes(collectCandidateEvidenceLedger(buildCandidateSpans(turns)), turns, sources);
process.stdout.write(`${JSON.stringify({
  artifact_kind: "heuristic_pattern_counts",
  warning: "Pattern counts are heuristic signals from the full candidate ledger for agent/LLM interpretation.",
  heuristic_patterns: aggregateDecisionPatterns(episodes)
}, null, 2)}\n`);
