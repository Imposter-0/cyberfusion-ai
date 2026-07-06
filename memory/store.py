"""
SQLite-based investigation history store for CyberFusion AI.
Persists investigation results across server restarts.
"""

import json
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Database lives alongside the project root
DB_PATH = Path(__file__).resolve().parent.parent / "investigations.db"


def _get_connection() -> sqlite3.Connection:
    """Return a connection to the SQLite database, creating the table if needed."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS investigations (
            id          TEXT PRIMARY KEY,
            timestamp   TEXT NOT NULL,
            type        TEXT NOT NULL,
            input_summary TEXT NOT NULL,
            severity    TEXT DEFAULT 'Unknown',
            report      TEXT NOT NULL,
            raw_result  TEXT
        )
        """
    )
    # Add new columns for report formatting caching if they do not exist
    for col in ["report_executive", "report_compliance", "report_risk"]:
        try:
            conn.execute(f"ALTER TABLE investigations ADD COLUMN {col} TEXT")
        except sqlite3.OperationalError:
            pass  # Column already exists
    conn.commit()
    return conn


def _extract_severity(report: str) -> str:
    """Try to extract a severity rating from the report text."""
    pattern = r"(?:severity|risk)\s*(?::|rating|level)?\s*:?\s*(critical|high|medium|low)"
    match = re.search(pattern, report, re.IGNORECASE)
    if match:
        return match.group(1).capitalize()
    # Fallback: scan for keywords
    upper = report.upper()
    for level in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        if level in upper:
            return level.capitalize()
    return "Unknown"


def _truncate(text: str, max_len: int = 120) -> str:
    """Truncate text for summary display."""
    if len(text) <= max_len:
        return text
    return text[:max_len].rstrip() + "…"


def save_investigation(
    investigation_type: str,
    user_input: str,
    report: str,
    raw_result: str | None = None,
) -> str:
    """
    Save a completed investigation to the database.
    Returns the generated investigation ID.
    """
    inv_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now(timezone.utc).isoformat()
    severity = _extract_severity(report)
    input_summary = _truncate(user_input)

    conn = _get_connection()
    try:
        conn.execute(
            """
            INSERT INTO investigations (id, timestamp, type, input_summary, severity, report, raw_result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (inv_id, timestamp, investigation_type, input_summary, severity, report, raw_result),
        )
        conn.commit()
    finally:
        conn.close()

    return inv_id


def get_all_investigations() -> list[dict]:
    """Return all investigations, newest first."""
    conn = _get_connection()
    try:
        rows = conn.execute(
            "SELECT id, timestamp, type, input_summary, severity FROM investigations ORDER BY timestamp DESC"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def get_investigation(inv_id: str) -> dict | None:
    """Return a single investigation by ID, or None if not found."""
    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM investigations WHERE id = ?", (inv_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_investigation_count() -> int:
    """Return the total number of saved investigations."""
    conn = _get_connection()
    try:
        row = conn.execute("SELECT COUNT(*) as cnt FROM investigations").fetchone()
        return row["cnt"]
    finally:
        conn.close()


def update_investigation_report(inv_id: str, report_type: str, report_content: str):
    """Update a specific report format column for an investigation."""
    column_mapping = {
        "executive": "report_executive",
        "compliance": "report_compliance",
        "risk": "report_risk"
    }
    col = column_mapping.get(report_type)
    if not col:
        return
        
    conn = _get_connection()
    try:
        conn.execute(
            f"UPDATE investigations SET {col} = ? WHERE id = ?",
            (report_content, inv_id)
        )
        conn.commit()
    finally:
        conn.close()
