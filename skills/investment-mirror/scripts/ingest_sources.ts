#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const result = generateInvestorProfile({ output, reindex: process.argv.includes("--reindex") });
process.stdout.write(`${JSON.stringify({
  artifact_kind: "local_evidence_ingest",
  ingested_sources: result.sources.length,
  indexed_turns: result.turns.length,
  candidate_episodes: result.episodes.length,
  output_dir: result.outputDir
}, null, 2)}\n`);
