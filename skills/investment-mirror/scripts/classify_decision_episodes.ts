#!/usr/bin/env node
import { buildCandidateSpans, classifyDecisionEpisodes, collectCandidateEvidenceLedger, discoverSources, parseSource } from "../src/core.ts";

const sources = discoverSources({ reindex: true });
const turns = sources.flatMap(parseSource);
const ledger = collectCandidateEvidenceLedger(buildCandidateSpans(turns));
const episodes = classifyDecisionEpisodes(ledger, turns, sources);
process.stdout.write(`${JSON.stringify({
  artifact_kind: "candidate_decision_episodes",
  warning: "Heuristic extraction from the full candidate ledger only; agent/LLM must interpret receipts before profile synthesis.",
  candidate_episode_count: episodes.length,
  candidate_episodes: episodes
}, null, 2)}\n`);
