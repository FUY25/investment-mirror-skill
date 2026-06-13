#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const result = generateInvestorProfile({ reindex: false });
process.stdout.write(`${JSON.stringify({ prompt_pack_path: `${result.outputDir}/prompt_pack.md` }, null, 2)}\n`);
