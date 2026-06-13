#!/usr/bin/env node
import { buildCandidateSpans, classifyDecisionEpisodes, discoverSources, parseSource, sampleCandidateEpisodes } from "../src/core.ts";

const sources = discoverSources({ reindex: true });
const turns = sources.flatMap(parseSource);
const sampled = sampleCandidateEpisodes(buildCandidateSpans(turns), sources);
const episodes = classifyDecisionEpisodes(sampled, turns, sources);
process.stdout.write(`${JSON.stringify({ episode_count: episodes.length, episodes }, null, 2)}\n`);
