#!/usr/bin/env node
import { discoverSources, parseSource } from "../src/core.ts";

const pathArg = process.argv.find((arg) => !arg.startsWith("--") && arg !== process.argv[1] && arg !== process.argv[0]);
const sources = discoverSources({ include: pathArg ? [pathArg] : [], reindex: true });
const turns = sources.flatMap(parseSource);
process.stdout.write(`${JSON.stringify({ source_count: sources.length, turn_count: turns.length, turns: turns.slice(0, 20) }, null, 2)}\n`);
