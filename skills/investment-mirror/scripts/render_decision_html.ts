#!/usr/bin/env node
import { lintInvestmentDecision } from "../src/core.ts";

const thesis = process.argv.slice(2).join(" ") || "Research-only review of an AI infrastructure thesis with valuation and falsification still unresolved.";
const review = lintInvestmentDecision({ thesis });
process.stdout.write(`${JSON.stringify({ decision_html: review.artifact_paths.html }, null, 2)}\n`);
