"""
History Lookup tool for the Memory Agent.
Enables searching the sqlite3 database of past investigations.
"""

import sqlite3
from pathlib import Path
from typing import ClassVar, Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

DB_PATH = Path(__file__).resolve().parent.parent / "investigations.db"


class HistoryLookupInput(BaseModel):
    """Input schema for the HistoryLookupTool."""

    query: str = Field(
        ...,
        description="The indicator (e.g. IP address, domain, hash, or attack pattern) to search for in past logs",
    )


class HistoryLookupTool(BaseTool):
    """
    Searches past security investigations stored in the database for matching indicators
    (like IP addresses, domains, hashes, or attack patterns) to identify repeat threats.
    """

    name: str = "Incident History Database Search"
    description: str = (
        "Searches past incident response investigations for matching indicators "
        "(e.g. source IP addresses, domain names, file hashes, or attack categories). "
        "Use this tool to find out if the current threat has been seen before, "
        "enabling you to identify recurring attack patterns or persistent threat actors."
    )
    args_schema: Type[BaseModel] = HistoryLookupInput

    def _run(self, query: str) -> str:
        """Query the SQLite database for matches."""
        if not DB_PATH.exists():
            return "No previous investigations exist in the database yet."

        try:
            conn = sqlite3.connect(str(DB_PATH))
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Search in type, input_summary, and report fields
            search_query = f"%{query}%"
            rows = cursor.execute(
                """
                SELECT id, timestamp, type, severity, input_summary
                FROM investigations
                WHERE input_summary LIKE ? OR report LIKE ? OR type LIKE ?
                ORDER BY timestamp DESC
                LIMIT 5
                """,
                (search_query, search_query, search_query),
            ).fetchall()

            conn.close()

            if not rows:
                return f"No matching records found for indicator: '{query}' in past investigations."

            results = [f"Found {len(rows)} matching past investigation(s) for '{query}':"]
            for row in rows:
                results.append(
                    f"- **ID**: {row['id']} | **Date**: {row['timestamp'][:10]} | "
                    f"**Type**: {row['type']} | **Severity**: {row['severity']} | "
                    f"**Summary**: {row['input_summary']}"
                )

            return "\n".join(results)

        except Exception as e:
            return f"Error querying incident history database: {str(e)}"
