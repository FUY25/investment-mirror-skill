#!/usr/bin/env node
import { generateInvestorProfile } from "../src/core.ts";

const result = generateInvestorProfile({ reindex: false });
process.stdout.write(`${JSON.stringify({ profile_html: `${result.outputDir}/profile.html` }, null, 2)}\n`);
