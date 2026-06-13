# Source Quality Semantics

Investment Mirror stores both source type and source-quality tier for master research.

## Fields

- `source_type`: what kind of source this is, such as `official`, `primary`, `book`, `memo`, `research`, `public_record`, `biography`, `reliable_secondary`, `interview`, or `portfolio_tracker`.
- `source_quality`: backward-compatible alias for `source_type`, retained because the v0.2 spec asks for source-quality labels.
- `source_quality_tier`: reliability tier used by validation and future scoring.

## Tiers

- `high`: official, primary, memo, research, or public-record material.
- `medium_high`: books, biographies, reliable secondary summaries, and interviews. These are useful but should not be treated as primary evidence for precise track-record claims.
- `context_only`: portfolio trackers and similar derived references. Use for public context only; never treat as a complete record.

The skill may use biography, style, and track-record context only when the relevant file records a source. It must not infer annualized returns, rank masters by performance, or use a master as an authority signal for a current security.
