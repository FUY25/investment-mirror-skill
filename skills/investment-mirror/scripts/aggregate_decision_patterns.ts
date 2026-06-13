#!/usr/bin/env node
import { buildCandidateSpans, classifyDecisionEpisodes, discoverSources, parseSource, sampleCandidateEpisodes, aggregateDecisionPatterns } from "../src/core.ts";

const sources = discoverSources({ reindex: true });
const turns = sources.flatMap(parseSource);
const episodes = classifyDecisionEpisodes(sampleCandidateEpisodes(buildCandidateSpans(turns), sources), turns, sources);
process.stdout.write(`${JSON.stringify({ patterns: aggregateDecisionPatterns(episodes) }, null, 2)}\n`);
