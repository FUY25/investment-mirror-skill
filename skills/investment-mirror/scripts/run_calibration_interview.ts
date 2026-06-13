#!/usr/bin/env node
const questions = [
  "When you miss a big winner, do you feel more pain than when you buy a loser?",
  "When a stock you own is flat for 12 months but the thesis is unchanged, what do you usually do?",
  "Are you more often too early, too late, too concentrated, or too hesitant?",
  "When you like a company, do you first check price expectations or first deepen the narrative?",
  "What was one investment where your reasoning was right but the outcome was poor?",
  "What was one investment where the outcome was good but your reasoning was weak?",
  "Do you usually sell because the thesis changed, the price moved, or your emotions changed?",
  "Are you more likely to over-research, or act before defining enough evidence?"
];
process.stdout.write(`${JSON.stringify({ calibration_questions: questions }, null, 2)}\n`);
