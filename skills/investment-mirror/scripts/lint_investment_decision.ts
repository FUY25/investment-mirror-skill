#!/usr/bin/env node
import { lintInvestmentDecision } from "../src/core.ts";

const thesis = process.argv.slice(2).join(" ");
if (!thesis) throw new Error("Provide thesis text.");
const review = lintInvestmentDecision({ thesis });
process.stdout.write(`${JSON.stringify(review, null, 2)}\n`);
