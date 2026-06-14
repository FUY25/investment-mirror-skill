#!/usr/bin/env python3
import json
import sqlite3
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: sqlite_bridge.py payload.json source_index.sqlite", file=sys.stderr)
        return 2

    payload_path = Path(sys.argv[1])
    sqlite_path = Path(sys.argv[2])
    payload = json.loads(payload_path.read_text(encoding="utf-8"))
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)

    con = sqlite3.connect(sqlite_path)
    try:
        cur = con.cursor()
        cur.executescript(
            """
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS sources (
              source_id TEXT PRIMARY KEY,
              path_hash TEXT NOT NULL,
              path_display TEXT,
              source_type TEXT,
              size_bytes INTEGER,
              modified_at TEXT,
              sha256 TEXT,
              parser_version TEXT,
              indexed_at TEXT,
              sensitivity_level TEXT DEFAULT 'unknown'
            );

            CREATE TABLE IF NOT EXISTS turns (
              rowid INTEGER PRIMARY KEY AUTOINCREMENT,
              turn_id TEXT UNIQUE,
              source_id TEXT,
              turn_index INTEGER,
              role TEXT,
              timestamp TEXT,
              text_redacted TEXT,
              token_estimate INTEGER,
              code_density REAL,
              decision_score REAL,
              investment_score REAL,
              FOREIGN KEY(source_id) REFERENCES sources(source_id)
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS turns_fts USING fts5(
              text_redacted,
              content='turns',
              content_rowid='rowid'
            );

            CREATE TABLE IF NOT EXISTS candidate_spans (
              span_id TEXT PRIMARY KEY,
              source_id TEXT,
              start_turn INTEGER,
              end_turn INTEGER,
              span_type TEXT,
              score REAL,
              reason_codes TEXT,
              analysis_scope TEXT DEFAULT 'full_candidate_ledger'
            );

            CREATE TABLE IF NOT EXISTS decision_episodes (
              episode_id TEXT PRIMARY KEY,
              span_id TEXT,
              episode_type TEXT,
              summary TEXT,
              patterns_json TEXT,
              confidence REAL,
              evidence_summary TEXT,
              created_at TEXT
            );
            """
        )

        indexed_at = payload.get("indexedAt") or payload.get("generated_at")
        parser_version = payload.get("parserVersion") or "unknown"
        span_columns = [row[1] for row in cur.execute("PRAGMA table_info(candidate_spans)").fetchall()]
        if "analysis_scope" not in span_columns:
            cur.execute("ALTER TABLE candidate_spans ADD COLUMN analysis_scope TEXT DEFAULT 'full_candidate_ledger'")

        for source in payload.get("sources", []):
            cur.execute(
                """
                INSERT OR REPLACE INTO sources (
                  source_id, path_hash, path_display, source_type, size_bytes,
                  modified_at, sha256, parser_version, indexed_at, sensitivity_level
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
                """,
                (
                    source["source_id"],
                    source["path_hash"],
                    source["path"],
                    source["source_type"],
                    source["size_bytes"],
                    source["modified_at"],
                    source["sha256"],
                    parser_version,
                    "unknown",
                ),
            )

        # Incremental reindex is delete-then-insert per source. A changed file may
        # have shrunk (N -> M turns); INSERT OR REPLACE alone leaves orphaned rows
        # and stale external-content FTS postings. Clear every source present in
        # this payload's turns/spans before reinserting so row counts stay exact.
        affected_sources = set()
        for turn in payload.get("turns", []):
            affected_sources.add(turn["source_id"])
        for span in payload.get("spans", []):
            affected_sources.add(span["source_id"])

        for source_id in affected_sources:
            # External-content FTS5 requires an explicit 'delete' (with the old
            # rowid and text) before the underlying row is removed.
            for rowid, old_text in cur.execute(
                "SELECT rowid, text_redacted FROM turns WHERE source_id = ?", (source_id,)
            ).fetchall():
                cur.execute(
                    "INSERT INTO turns_fts(turns_fts, rowid, text_redacted) VALUES('delete', ?, ?)",
                    (rowid, old_text),
                )
            cur.execute("DELETE FROM turns WHERE source_id = ?", (source_id,))
            cur.execute(
                "DELETE FROM decision_episodes WHERE span_id IN "
                "(SELECT span_id FROM candidate_spans WHERE source_id = ?)",
                (source_id,),
            )
            cur.execute("DELETE FROM candidate_spans WHERE source_id = ?", (source_id,))

        for turn in payload.get("turns", []):
            cur.execute(
                """
                INSERT OR REPLACE INTO turns (
                  turn_id, source_id, turn_index, role, timestamp, text_redacted,
                  token_estimate, code_density, decision_score, investment_score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    turn["turn_id"],
                    turn["source_id"],
                    turn["turn_index"],
                    turn["role"],
                    turn.get("timestamp"),
                    turn["text_redacted"],
                    turn["token_estimate"],
                    turn["code_density"],
                    turn["decision_score"],
                    turn["investment_score"],
                ),
            )
            rowid = cur.execute("SELECT rowid FROM turns WHERE turn_id = ?", (turn["turn_id"],)).fetchone()[0]
            cur.execute("INSERT OR REPLACE INTO turns_fts(rowid, text_redacted) VALUES (?, ?)", (rowid, turn["text_redacted"]))

        for span in payload.get("spans", []):
            cur.execute(
                """
                INSERT OR REPLACE INTO candidate_spans (
                  span_id, source_id, start_turn, end_turn, span_type, score, reason_codes, analysis_scope
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    span["span_id"],
                    span["source_id"],
                    span["start_turn"],
                    span["end_turn"],
                    span["span_type"],
                    span["score"],
                    json.dumps(span.get("reason_codes", [])),
                    span.get("analysis_scope", "full_candidate_ledger"),
                ),
            )

        for episode in payload.get("episodes", []):
            cur.execute(
                """
                INSERT OR REPLACE INTO decision_episodes (
                  episode_id, span_id, episode_type, summary, patterns_json,
                  confidence, evidence_summary, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    episode["episode_id"],
                    episode["span_id"],
                    episode["episode_type"],
                    episode["summary"],
                    json.dumps(episode.get("patterns", [])),
                    episode["confidence"],
                    episode["receipt_summary"],
                ),
            )

        con.commit()
    finally:
        con.close()

    print(f"wrote {sqlite_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
