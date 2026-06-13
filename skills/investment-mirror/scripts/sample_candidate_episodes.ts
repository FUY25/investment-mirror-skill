#!/usr/bin/env node
import { buildCandidateSpans, discoverSources, parseSource, sampleCandidateEpisodes } from "../src/core.ts";

const sources = discoverSources({ reindex: true });
const turns = sources.flatMap(parseSource);
const spans = buildCandidateSpans(turns);
const sampled = sampleCandidateEpisodes(spans, sources);
process.stdout.write(`${JSON.stringify({ candidate_count: spans.length, sampled_count: sampled.length, sampled }, null, 2)}\n`);
