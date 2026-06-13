#!/usr/bin/env node
import { buildSourceManifest, discoverSources } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const sources = discoverSources({ output, reindex: process.argv.includes("--reindex") });
buildSourceManifest(sources, output);
process.stdout.write(`${JSON.stringify({ source_count: sources.length, output: output ?? "~/.investment-mirror" }, null, 2)}\n`);
