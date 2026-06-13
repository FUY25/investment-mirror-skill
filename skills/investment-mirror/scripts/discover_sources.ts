#!/usr/bin/env node
import { buildSourceManifest, discoverSources } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const include = process.argv.flatMap((arg, index, args) => arg === "--include" ? [args[index + 1]] : []).filter(Boolean);
const exclude = process.argv.flatMap((arg, index, args) => arg === "--exclude" ? [args[index + 1]] : []).filter(Boolean);
const sources = discoverSources({ output, include, exclude, reindex: process.argv.includes("--reindex") });
if (output) buildSourceManifest(sources, output);
process.stdout.write(`${JSON.stringify({ source_count: sources.length, sources }, null, 2)}\n`);
