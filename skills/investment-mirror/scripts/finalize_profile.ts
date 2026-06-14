#!/usr/bin/env node
import { finalizeProfile } from "../src/core.ts";

const outputIndex = process.argv.indexOf("--output");
const synthesisIndex = process.argv.indexOf("--synthesis");
const contentIndex = process.argv.indexOf("--content");
const htmlIndex = process.argv.indexOf("--html");
const questionsIndex = process.argv.indexOf("--questions");
const answersIndex = process.argv.indexOf("--answers-summary");

const result = finalizeProfile({
  output: outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined,
  synthesizedProfilePath: synthesisIndex >= 0 ? process.argv[synthesisIndex + 1] : undefined,
  finalContentPath: contentIndex >= 0 ? process.argv[contentIndex + 1] : undefined,
  finalHtmlPath: htmlIndex >= 0 ? process.argv[htmlIndex + 1] : undefined,
  questionsPath: questionsIndex >= 0 ? process.argv[questionsIndex + 1] : undefined,
  answersSummary: answersIndex >= 0 ? process.argv[answersIndex + 1] : undefined,
  provisional: process.argv.includes("--provisional"),
  declinedInterview: process.argv.includes("--declined-interview")
});

process.stdout.write(`${JSON.stringify({
  profile_path: `${result.outputDir}/profile.json`,
  html_path: `${result.outputDir}/profile.html`,
  profile_state: result.profile.profile_state,
  provisional: result.profile.provisional,
  unknown_dimensions: result.profile.unknown_dimensions
}, null, 2)}\n`);
