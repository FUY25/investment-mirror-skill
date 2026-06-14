#!/usr/bin/env node
// Bundles the Investment Mirror CLI + core + the `yaml` dependency into a single
// plain-node ESM file at skills/investment-mirror/scripts/cli.mjs.
//
// Why: the shipped skill must run on Codex and Claude Code with node + python3
// only — no `tsx`, no `npm install`, no node_modules. Node built-ins stay
// external (default for platform=node); `yaml` is bundled in. The .ts files
// remain the source of truth; this committed bundle is the runtime entry point.
//
// Re-run after editing scripts/investment_mirror_cli.ts or src/*.ts:
//   npm run build:cli
import { build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(repoRoot, "skills/investment-mirror/scripts/investment_mirror_cli.ts");
const outfile = resolve(repoRoot, "skills/investment-mirror/scripts/cli.mjs");

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  // The `yaml` dep is CJS and does require("process")/require("util") at load.
  // Provide a real require() so esbuild's interop resolves node built-ins
  // instead of throwing "Dynamic require of ... is not supported".
  banner: { js: "import { createRequire as __cjsCreateRequire } from 'node:module';\nconst require = __cjsCreateRequire(import.meta.url);" },
  legalComments: "none"
});

console.log(`Built ${outfile}`);
