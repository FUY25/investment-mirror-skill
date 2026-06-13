#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { redactSensitive } from "../src/core.ts";

const input = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
process.stdout.write(redactSensitive(input));
