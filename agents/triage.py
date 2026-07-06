import re

class TriageEngine:
    """
    Pre-processes input before passing it to CrewAI to save API tokens and avoid rate limits.
    """
    
    @staticmethod
    def process(investigation_type: str, user_input: str) -> str:
        """Process the input based on investigation type."""
        if investigation_type == "logs":
            return TriageEngine._filter_logs(user_input)
        elif investigation_type == "website":
            return TriageEngine._extract_urls(user_input)
        elif investigation_type == "threat":
            return TriageEngine._extract_iocs(user_input)
        return user_input

    @staticmethod
    def _filter_logs(logs: str) -> str:
        """Filter out massive log files to only include suspicious lines."""
        suspicious_keywords = ["error", "fail", "unauthorized", "denied", "exception", "critical", "attack", "malware", "sql", "union", "select", "admin", "root"]
        suspicious_codes = [" 401 ", " 403 ", " 404 ", " 500 ", " 502 ", " 503 "]
        
        filtered_lines = []
        lines = logs.splitlines()
        
        # If it's small, just return it
        if len(lines) < 20:
            return logs
            
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in suspicious_keywords) or any(code in line for code in suspicious_codes):
                filtered_lines.append(line)
                
        if not filtered_lines:
            # If nothing flagged, just take the first and last few lines to avoid empty context
            filtered_lines = lines[:5] + ["... [snip: no obvious anomalies detected by TriageEngine] ..."] + lines[-5:]
            
        if len(filtered_lines) > 50:
            filtered_lines = filtered_lines[:50] + [f"... [snip: {len(filtered_lines)-50} more suspicious lines omitted by TriageEngine]"]
            
        return "\n".join(filtered_lines)

    @staticmethod
    def _extract_urls(text: str) -> str:
        """Extract a single URL from the text if present."""
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
        if urls:
            return urls[0]
        return text

    @staticmethod
    def _extract_iocs(text: str) -> str:
        """Extract indicators of compromise."""
        # For now, pass through as IOCs are usually short
        return text.strip()
