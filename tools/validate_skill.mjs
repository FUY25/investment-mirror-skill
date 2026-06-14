#!/usr/bin/env node
// Portable wrapper around skill-creator's quick_validate.py.
//
// The validator ships with the skill-creator system skill, which lives in a
// different place on Codex vs Claude Code (and is absent on CI / fresh clones).
// Resolve it across known locations instead of hardcoding one machine's path;
// if it cannot be found, warn and skip rather than hard-failing `npm run validate`.
//
// Override directly with SKILL_CREATOR_VALIDATE=/abs/path/to/quick_validate.py
import { existsSync, globSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const target = process.argv[2] ?? "skills/investment-mirror";
const home = homedir();
const codexHome = process.env.CODEX_HOME || join(home, ".codex");
const rel = join("skill-creator", "scripts", "quick_validate.py");

const directCandidates = [
  process.env.SKILL_CREATOR_VALIDATE,
  join(codexHome, "skills", ".system", rel),
  join(home, ".claude", "skills", ".system", rel),
  join(home, ".config", "claude", "skills", ".system", rel)
].filter(Boolean);

let found = directCandidates.find((path) => existsSync(path));

if (!found) {
  // Bounded glob over plugin/marketplace dirs where skill-creator may be installed.
  const globRoots = [
    join(home, ".claude", "plugins", "**", rel),
    join(codexHome, "plugins", "**", rel),
    join(codexHome, "**", rel)
  ];
  for (const pattern of globRoots) {
    try {
      const hits = globSync(pattern);
      if (hits.length) {
        found = hits[0];
        break;
      }
    } catch {
      // globSync may be unavailable or error on a missing root; ignore.
    }
  }
}

if (!found) {
  console.warn(
    "validate:skill: skill-creator quick_validate.py not found " +
      "(checked $SKILL_CREATOR_VALIDATE, $CODEX_HOME, ~/.codex, ~/.claude). " +
      "Skipping skill structure validation. Set SKILL_CREATOR_VALIDATE to override."
  );
  process.exit(0);
}

const result = spawnSync("python3", [found, target], { stdio: "inherit" });
process.exit(result.status ?? 0);
