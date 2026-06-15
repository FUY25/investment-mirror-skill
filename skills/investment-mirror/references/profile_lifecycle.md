# Profile Lifecycle

Investment Mirror uses a strict lifecycle so deterministic tools cannot create a profile by accident.

## States

- `draft`: internal transition only, before candidate evidence is fully compiled.
- `interview_required`: deterministic evidence has been compiled; final profile files do not exist unless they were created by a prior finalization.
- `finalized`: agent/LLM synthesized the profile after 2-5 interview questions and the finalizer validated the result.
- `provisional`: agent/LLM synthesized a limited profile after the user explicitly declined or did not complete interview calibration; unknown dimensions must be listed.

`profile_state.json` records transitions. It is not a final profile.

## Artifacts By State

`interview_required` may write:

- `profile_candidate_inputs.json`
- `profile_evidence.json`
- `profile_synthesis_prompt.md`
- `profile_finalization_schema.json`
- `profile_report_template.html`
- `profile_candidate_report.html`
- `guardrails.yaml`
- `prompt_pack.md`
- `InvestmentMirror.md`
- `source_index.sqlite`

Only `profile-finalize` may write:

- `profile.json`
- `profile.html`

`profile-finalize` is an artifact validator/renderer/writer, not the model judgment phase. The agent/LLM must already have read the redacted evidence ledger, compared it against master records, synthesized the profile JSON, and generated structured final profile content before this command runs.

## Finalization Contract

The finalizer validates inputs and writes artifacts. It does not call an LLM and does not create the profile judgment itself.

Required inputs:

- `--synthesis PATH`: agent/LLM synthesized JSON matching `profile_finalization_schema.json`;
- `--questions PATH`: 2-5 agent-generated interview questions;
- `--answers-summary TEXT`: concise summary of the user's answers;
- `--content PATH`: agent/LLM generated structured final profile content;
- `--provisional` or `--declined-interview` when answers are absent or incomplete.

Legacy `--html PATH` is accepted only for compatibility. The normal product path is `--content PATH`.

The final profile must include:

- evidence summary;
- interpretation summary;
- one primary master match and at most one secondary affinity;
- guardrail rationale;
- model-synthesized primary patterns, decision fingerprint, and active guardrails;
- interview questions and answer summary;
- risk preference summary;
- time horizon summary;
- constraints summary;
- false-match warning;
- final HTML rendered by the deterministic finalizer from model-owned structured content, using `profile_report_template.html` only as visual reference;
- unknown dimensions when provisional.

Final profile cleanup rules:

- remove deterministic `similarity` scores from `best_fit_master_matches`;
- cap numeric confidence for provisional profiles with unknown dimensions;
- omit deterministic `calibration_recommended` from final `source_summary`;
- include qualitative master-match rationale and confidence instead.

Forbidden final profile content:

- buy, sell, or hold recommendations;
- allocation or position-size instructions;
- suitability claims;
- unsupported performance rankings;
- raw transcript text by default.
