#!/usr/bin/env python3
import json
import sqlite3
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: query_source_index.py source_index.sqlite term [term...]", file=sys.stderr)
        return 2

    sqlite_path = Path(sys.argv[1])
    terms = [term.lower() for term in sys.argv[2:] if len(term.strip()) >= 2]
    if not sqlite_path.exists() or not terms:
        print("[]")
        return 0

    con = sqlite3.connect(sqlite_path)
    con.row_factory = sqlite3.Row
    rows = []
    try:
        cur = con.cursor()
        fts_query = " OR ".join(escape_fts(term) for term in terms[:8])
        for row in cur.execute(
            """
            SELECT turns.turn_id, turns.source_id,
                   snippet(turns_fts, 0, '[', ']', ' ... ', 18) AS snippet
            FROM turns_fts
            JOIN turns ON turns_fts.rowid = turns.rowid
            WHERE turns_fts MATCH ?
            LIMIT 8
            """,
            (fts_query,),
        ):
            snippet = row["snippet"] or ""
            matched = [term for term in terms if term in snippet.lower()]
            rows.append(
                {
                    "turn_id": row["turn_id"],
                    "source_id": row["source_id"],
                    "snippet": snippet[:600],
                    "matched_terms": matched,
                }
            )
    except sqlite3.Error:
        rows = []
    finally:
        con.close()

    print(json.dumps(rows, ensure_ascii=False))
    return 0


def escape_fts(term: str) -> str:
    safe = "".join(ch for ch in term if ch.isalnum() or ch in {"_", "-"})
    return f'"{safe}"' if safe else '""'


if __name__ == "__main__":
    raise SystemExit(main())
