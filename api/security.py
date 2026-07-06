"""
CyberFusion AI Security Module.

IMPLEMENTATION & DESIGN BEHAVIORS (Security Features):
- Prompt Injection Defense: We utilize regex-based pattern matching (INJECTION_PATTERNS) 
  to block common LLM jailbreak attempts before they ever reach the CrewAI agents.
- Defense in Depth: By strictly validating input length and format (e.g., URL validation), 
  we mitigate Denial of Service (DoS) and Server-Side Request Forgery (SSRF) risks on external MCP tools.
"""

import re
from fastapi import HTTPException

# Common prompt injection patterns
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"system\s+prompt",
    r"you\s+are\s+now",
    r"disregard\s+the\s+above",
    r"forget\s+(everything|all)",
    r"output\s+your\s+instructions",
    r"bypassing\s+controls",
    r"jailbreak"
]

class InputValidator:
    @staticmethod
    def validate_investigation(investigation_type: str, user_input: str):
        # 1. Length validation
        max_lengths = {
            "website": 1000,
            "threat": 1000,
            "question": 2000,
            "logs": 50000  # Logs can be large
        }
        
        limit = max_lengths.get(investigation_type, 2000)
        if len(user_input) > limit:
            raise HTTPException(
                status_code=400, 
                detail=f"Input exceeds maximum allowed length of {limit} characters for {investigation_type}."
            )
            
        # 2. Prompt injection validation
        lower_input = user_input.lower()
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, lower_input):
                raise HTTPException(
                    status_code=400,
                    detail="Security violation: Suspicious input pattern detected (possible prompt injection)."
                )
                
        # 3. Basic URL validation for website type
        if investigation_type == "website":
            url = user_input.strip()
            # Basic HTTP/HTTPS checking
            if not re.match(r"^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d+)?(/.*)?$", url):
                # A loose regex for domains/IPs just to prevent arbitrary text
                if not re.match(r"^(https?://)?(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(/.*)?$", url):
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid website URL or IP format."
                    )
