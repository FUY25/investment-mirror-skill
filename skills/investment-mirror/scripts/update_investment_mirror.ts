#!/usr/bin/env node
import { profileUpdate } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const result = profileUpdate({ output });
process.stdout.write(`${JSON.stringify({ update: result.update }, null, 2)}\n`);
