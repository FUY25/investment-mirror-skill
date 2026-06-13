#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { scoreText } from "../src/core.ts";

const input = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
process.stdout.write(`${JSON.stringify(scoreText(input), null, 2)}\n`);
