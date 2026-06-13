#!/usr/bin/env node
import { deriveProfileVector, matchMasterStyles } from "../src/core.ts";

const patterns = process.argv.slice(2).length ? process.argv.slice(2).map((pattern) => [pattern, 1] as [string, number]) : [["thesis_first_reasoning", 2], ["narrative_to_action_jump", 2], ["research_loop_extension", 1]] as [string, number][];
const vector = deriveProfileVector(patterns);
process.stdout.write(`${JSON.stringify({ vector, matches: matchMasterStyles(vector) }, null, 2)}\n`);
