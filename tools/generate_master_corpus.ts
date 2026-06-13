import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import YAML from "yaml";
import { MASTER_RECORDS, STYLE_DIMENSIONS } from "../skills/investment-mirror/src/master_data.ts";

const root = process.cwd();

function write(path: string, content: string) {
  const fullPath = join(root, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function yaml(data: unknown) {
  return YAML.stringify(data, { lineWidth: 0, doubleQuotedAsJSON: false });
}

function sourceUrls(masterId: string, predicate: (quality: string) => boolean) {
  const master = MASTER_RECORDS.find((record) => record.id === masterId);
  if (!master) return [];
  return master.sources.filter((source) => predicate(source.quality)).map((source) => source.url);
}

function qualityTier(quality: string) {
  if (["official", "primary", "memo", "research", "public_record"].includes(quality)) return "high";
  if (["book", "biography", "reliable_secondary", "interview"].includes(quality)) return "medium_high";
  if (quality === "portfolio_tracker") return "context_only";
  return "medium";
}

function profileMarkdown(masterId: string) {
  const master = MASTER_RECORDS.find((record) => record.id === masterId);
  if (!master) throw new Error(`Unknown master ${masterId}`);
  return `# ${master.displayName}

## Source-Backed Biography

${master.bioSummary}

## Investment Style

${master.investmentStyle}

## Notable Results And Track-Record Context

${master.notableResultsSummary}

This profile intentionally avoids unsupported annualized-return claims, league-table rankings, and any implication that the master endorses a current security.

## What To Learn

${master.whatToLearn.map((item) => `- ${item}`).join("\n")}

## What Not To Copy

${master.whatNotToCopy.map((item) => `- ${item}`).join("\n")}

## Common Misreadings

${master.commonMisreadings.map((item) => `- ${item}`).join("\n")}

## Read More

- ${master.readMoreUrl}
`;
}

function styleNotesMarkdown(masterId: string) {
  const master = MASTER_RECORDS.find((record) => record.id === masterId);
  if (!master) throw new Error(`Unknown master ${masterId}`);
  const sortedVector = Object.entries(master.vector)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  return `# ${master.displayName} Style Notes

## Style Tags

${master.styleTags.map((tag) => `- ${tag}`).join("\n")}

## Decision Style

${master.investmentStyle}

## Evidence Style

${master.displayName} is mapped to evidence patterns through source-backed public material, not through personal-performance mythology. The highest-signal dimensions are:

${sortedVector.map(([dimension, score]) => `- ${dimension}: ${score}/100`).join("\n")}

## Risk Style

Relevant guardrail mappings:

${master.guardrailRelevance.map((guardrail) => `- ${guardrail}`).join("\n")}

## User Patterns This Master Helps Identify

${master.teaches.map((item) => `- ${item}`).join("\n")}

## Matching Notes

Use ${master.displayName} as a learning archetype only when observed user evidence maps to the style vector. Do not present the match as identity, authority, or a security recommendation.
`;
}

function sourcesYaml(masterId: string) {
  const master = MASTER_RECORDS.find((record) => record.id === masterId);
  if (!master) throw new Error(`Unknown master ${masterId}`);
  return yaml({
    id: master.id,
    display_name: master.displayName,
    source_quality_policy: "Use source-backed biography, style, and track-record context only. Do not infer annualized returns or performance rankings.",
    sources: master.sources.map((source) => ({
      title: source.title,
      url: source.url,
      source_type: source.quality,
      source_quality: source.quality,
      source_quality_tier: qualityTier(source.quality),
      notes: source.notes
    })),
    read_more_url: master.readMoreUrl
  });
}

function portraitSvg(masterId: string) {
  const master = MASTER_RECORDS.find((record) => record.id === masterId);
  if (!master) throw new Error(`Unknown master ${masterId}`);
  let seed = 0;
  for (const char of master.id) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const hair = 42 + (seed % 18);
  const jaw = 62 + ((seed >> 3) % 14);
  const shoulder = 38 + ((seed >> 7) % 20);
  const dotOffset = seed % 9;
  const initials = master.displayName
    .replace(/\/.*$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const dots = Array.from({ length: 48 }, (_, index) => {
    const x = 22 + ((index * 17 + dotOffset * 11) % 156);
    const y = 24 + ((index * 29 + dotOffset * 7) % 142);
    const r = 0.8 + ((index + dotOffset) % 4) * 0.22;
    const opacity = 0.14 + ((index + seed) % 5) * 0.035;
    return `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="#b96b2f" opacity="${opacity.toFixed(2)}"/>`;
  }).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260" role="img" aria-labelledby="${master.id}-title ${master.id}-desc">
  <title id="${master.id}-title">${master.displayName} original line-art portrait</title>
  <desc id="${master.id}-desc">Original local SVG portrait asset for Investment Mirror master profile cards.</desc>
  <rect width="220" height="260" rx="10" fill="#f7f3ee"/>
  <path d="M18 214 C58 196 162 198 202 215 L202 242 L18 242 Z" fill="#efe4d7" stroke="#2d2926" stroke-width="1.5"/>
  <g opacity="0.85">
    ${dots}
  </g>
  <path d="M${62 - shoulder / 6} 206 C72 178 148 178 ${158 + shoulder / 6} 206" fill="none" stroke="#2d2926" stroke-width="3" stroke-linecap="round"/>
  <path d="M64 ${hair} C78 22 139 17 156 ${hair + 7} C177 67 169 134 148 160 C132 180 92 180 73 158 C54 136 48 71 64 ${hair} Z" fill="#fffaf4" stroke="#2d2926" stroke-width="2.5"/>
  <path d="M64 ${hair + 4} C83 ${hair - 16} 136 ${hair - 18} 158 ${hair + 12} C145 ${hair + 7} 124 ${hair + 8} 105 ${hair + 5} C87 ${hair + 2} 75 ${hair + 8} 64 ${hair + 4} Z" fill="#2d2926" opacity="0.08" stroke="#2d2926" stroke-width="1.2"/>
  <path d="M82 104 C91 100 99 101 106 106" fill="none" stroke="#2d2926" stroke-width="2" stroke-linecap="round"/>
  <path d="M121 106 C130 101 139 100 148 104" fill="none" stroke="#2d2926" stroke-width="2" stroke-linecap="round"/>
  <path d="M111 111 C108 124 108 132 115 136" fill="none" stroke="#2d2926" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M91 ${jaw + 92} C105 ${jaw + 100} 128 ${jaw + 100} 142 ${jaw + 92}" fill="none" stroke="#2d2926" stroke-width="2" stroke-linecap="round"/>
  <path d="M48 30 L174 218" stroke="#b96b2f" stroke-width="1" opacity="0.42"/>
  <path d="M174 30 L48 218" stroke="#b96b2f" stroke-width="1" opacity="0.18"/>
  <rect x="20" y="18" width="180" height="222" rx="8" fill="none" stroke="#2d2926" stroke-width="1.2" opacity="0.28"/>
  <text x="110" y="235" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="17" fill="#2d2926" letter-spacing="1.5">${initials}</text>
</svg>`;
}

function renderRegistry() {
  return yaml({
    version: "0.2",
    active_master_count: MASTER_RECORDS.length,
    future_masters_excluded_from_v0_2_gate: true,
    masters: MASTER_RECORDS.map((master) => ({
      id: master.id,
      display_name: master.displayName,
      region: master.region,
      tier: master.tier,
      category: master.category,
      style_tags: master.styleTags,
      asset_path: `assets/masters/${master.id}.svg`,
      wikipedia_url: master.wikipediaUrl,
      primary_sources: sourceUrls(master.id, (quality) => ["official", "primary", "book", "memo", "research", "public_record"].includes(quality)),
      secondary_sources: sourceUrls(master.id, (quality) => ["biography", "reliable_secondary", "portfolio_tracker", "interview"].includes(quality)),
      source_quality_notes: master.sources.map((source) => ({
        url: source.url,
        source_type: source.quality,
        source_quality_tier: qualityTier(source.quality)
      })),
      teaches: master.teaches,
      common_misreadings: master.commonMisreadings,
      bio_summary: master.bioSummary,
      investment_style: master.investmentStyle,
      notable_results_summary: master.notableResultsSummary,
      read_more_url: master.readMoreUrl,
      guardrail_relevance: master.guardrailRelevance,
      html_card_role: "best-fit master card or learning reference card"
    }))
  });
}

function renderStyleVectors() {
  return yaml({
    version: "0.2",
    scale: "0 to 100, where higher means closer to the high-end label in style_dimensions.yaml",
    masters: Object.fromEntries(MASTER_RECORDS.map((master) => [master.id, master.vector]))
  });
}

function renderMasterGuardrails() {
  return yaml({
    version: "0.2",
    notes: "Map master learning archetypes to guardrail relevance. These are process guardrails, not investment recommendations.",
    masters: Object.fromEntries(
      MASTER_RECORDS.map((master) => [
        master.id,
        {
          display_name: master.displayName,
          recommended_guardrails: master.guardrailRelevance,
          what_to_learn: master.whatToLearn,
          what_not_to_copy: master.whatNotToCopy,
          false_match_warning: `A ${master.displayName} match means the user's observed process resembles parts of this learning archetype. It does not mean the user is ${master.displayName} or should copy current holdings.`
        }
      ])
    )
  });
}

function renderStyleDimensions() {
  return yaml({
    version: "0.2",
    dimensions: STYLE_DIMENSIONS.map((dimension) => ({
      id: dimension.id,
      label: dimension.label,
      low_end: dimension.low,
      high_end: dimension.high,
      score_scale: "0-100"
    }))
  });
}

for (const master of MASTER_RECORDS) {
  write(`research/masters/${master.id}/profile.md`, profileMarkdown(master.id));
  write(`research/masters/${master.id}/sources.yaml`, sourcesYaml(master.id));
  write(`research/masters/${master.id}/style_notes.md`, styleNotesMarkdown(master.id));
  const svg = portraitSvg(master.id);
  write(`assets/masters/${master.id}.svg`, svg);
  write(`skills/investment-mirror/assets/masters/${master.id}.svg`, svg);
}

write("skills/investment-mirror/config/master_registry.yaml", renderRegistry());
write("skills/investment-mirror/config/master_style_vectors.yaml", renderStyleVectors());
write("skills/investment-mirror/config/master_guardrail_rules.yaml", renderMasterGuardrails());
write("skills/investment-mirror/config/style_dimensions.yaml", renderStyleDimensions());
write("skills/investment-mirror/references/source_quality.md", `# Source Quality Semantics

Investment Mirror stores both source type and source-quality tier for master research.

## Fields

- \`source_type\`: what kind of source this is, such as \`official\`, \`primary\`, \`book\`, \`memo\`, \`research\`, \`public_record\`, \`biography\`, \`reliable_secondary\`, \`interview\`, or \`portfolio_tracker\`.
- \`source_quality\`: backward-compatible alias for \`source_type\`, retained because the v0.2 spec asks for source-quality labels.
- \`source_quality_tier\`: reliability tier used by validation and future scoring.

## Tiers

- \`high\`: official, primary, memo, research, or public-record material.
- \`medium_high\`: books, biographies, reliable secondary summaries, and interviews. These are useful but should not be treated as primary evidence for precise track-record claims.
- \`context_only\`: portfolio trackers and similar derived references. Use for public context only; never treat as a complete record.

The skill may use biography, style, and track-record context only when the relevant file records a source. It must not infer annualized returns, rank masters by performance, or use a master as an authority signal for a current security.
`);

console.log(`Generated ${MASTER_RECORDS.length} active master research folders, registry entries, style vectors, guardrail mappings, and SVG assets.`);
