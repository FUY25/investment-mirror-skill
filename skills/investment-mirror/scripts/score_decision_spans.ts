#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { scoreText } from "../src/core.ts";

const input = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
process.stdout.write(`${JSON.stringify({
  artifact_kind: "heuristic_span_score",
  warning: "Local score is a high-recall search signal, not classification.",
  ...scoreText(input)
}, null, 2)}\n`);
