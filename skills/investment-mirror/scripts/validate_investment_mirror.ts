#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { ACTIVE_MASTER_IDS, FUTURE_MASTER_IDS, STYLE_DIMENSIONS } from "../src/master_data.ts";

const root = process.cwd();
const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function readYaml(path: string) {
  return YAML.parse(readFileSync(join(root, path), "utf8")) as any;
}

function assertFile(path: string, minBytes = 1) {
  const full = join(root, path);
  if (!existsSync(full)) {
    fail(`Missing file: ${path}`);
    return "";
  }
  const stats = statSync(full);
  if (stats.size < minBytes) fail(`File too small: ${path}`);
  return readFileSync(full, "utf8");
}

const registry = readYaml("skills/investment-mirror/config/master_registry.yaml");
const vectors = readYaml("skills/investment-mirror/config/master_style_vectors.yaml");
const guardrails = readYaml("skills/investment-mirror/config/master_guardrail_rules.yaml");
const registryIds = registry.masters.map((master: any) => master.id);

if (registry.active_master_count !== 30) fail(`Expected active_master_count 30, got ${registry.active_master_count}`);
if (registryIds.length !== 30) fail(`Expected 30 registry masters, got ${registryIds.length}`);
if (new Set(registryIds).size !== registryIds.length) fail("Duplicate master IDs in registry.");

for (const id of ACTIVE_MASTER_IDS) {
  if (!registryIds.includes(id)) fail(`Active master missing from registry: ${id}`);
  if (!vectors.masters[id]) fail(`Style vector missing: ${id}`);
  if (!guardrails.masters[id]) fail(`Guardrail mapping missing: ${id}`);
  for (const dimension of STYLE_DIMENSIONS) {
    const value = vectors.masters[id]?.[dimension.id];
    if (typeof value !== "number" || value < 0 || value > 100) fail(`Invalid vector ${id}.${dimension.id}: ${value}`);
  }
  const profile = assertFile(`research/masters/${id}/profile.md`, 800);
  const style = assertFile(`research/masters/${id}/style_notes.md`, 600);
  const sourcesText = assertFile(`research/masters/${id}/sources.yaml`, 350);
  const sources = YAML.parse(sourcesText) as any;
  if (!sources.read_more_url) fail(`Read-more URL missing: ${id}`);
  if (!Array.isArray(sources.sources) || sources.sources.length < 2) fail(`Too few sources: ${id}`);
  for (const source of sources.sources ?? []) {
    if (!source.url || !source.source_quality || !source.source_type || !source.source_quality_tier) fail(`Incomplete source metadata for ${id}: ${JSON.stringify(source)}`);
  }
  assertFile(`assets/masters/${id}.svg`, 900);
  assertFile(`skills/investment-mirror/assets/masters/${id}.svg`, 900);
  if (/TODO|TBD|FIXME|lorem ipsum|placeholder/i.test(`${profile}\n${style}\n${sourcesText}`)) fail(`Placeholder-like text found in master files: ${id}`);
}

for (const id of FUTURE_MASTER_IDS) {
  if (registryIds.includes(id)) fail(`Future master included in v0.2 active registry: ${id}`);
}

const commandDocs = [
  "investment-profile-init.md",
  "investment-profile-update.md",
  "investment-decision.md",
  "investment-mirror-ask.md"
];
for (const doc of commandDocs) assertFile(`skills/investment-mirror/commands/${doc}`, 400);

const requiredScripts = [
  "discover_sources.ts",
  "build_source_manifest.ts",
  "parse_transcript_adapters.ts",
  "redact_sensitive.ts",
  "build_transcript_index.ts",
  "score_decision_spans.ts",
  "sample_candidate_episodes.ts",
  "classify_decision_episodes.ts",
  "aggregate_decision_patterns.ts",
  "match_master_styles.ts",
  "run_calibration_interview.ts",
  "generate_investor_profile.ts",
  "lint_investment_decision.ts",
  "generate_prompt_pack.ts",
  "update_investment_mirror.ts",
  "render_profile_html.ts",
  "render_decision_html.ts",
  "investment_mirror_cli.ts",
  "sqlite_bridge.py"
];
for (const script of requiredScripts) assertFile(`skills/investment-mirror/scripts/${script}`, 100);

const skill = assertFile("skills/investment-mirror/SKILL.md", 1000);
if (/TODO|\[TODO/i.test(skill)) fail("SKILL.md still contains TODO text.");

if (errors.length) {
  process.stderr.write(`Investment Mirror validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("Investment Mirror validation passed: active 30/30 complete, future 15 excluded, scripts/docs/assets present.\n");
